package com.notfound.bookstore.service.impl;

import com.notfound.bookstore.model.dto.request.orderrequest.CheckoutRequest;
import com.notfound.bookstore.model.dto.response.orderresponse.OrderItemResponse;
import com.notfound.bookstore.model.dto.response.orderresponse.OrderResponse;
import com.notfound.bookstore.model.entity.*;
import com.notfound.bookstore.model.enums.OrderStatus;
import com.notfound.bookstore.repository.*;
import com.notfound.bookstore.service.CartService;
import com.notfound.bookstore.service.OrderService;
import com.notfound.bookstore.service.PromotionService;
import com.notfound.bookstore.service.ShipmentService;
import com.notfound.bookstore.util.PriceCalculationUtil;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    // Tax rate constant: 5%
    private static final double TAX_RATE = 0.05;

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;
    private final PromotionRepository promotionRepository;

    private final CartService cartService;
    private final PromotionService promotionService;
    private final AddressRepository addressRepository;
    private final ShipmentService shipmentService;

    @Override
    @Transactional
    public OrderResponse checkout(UUID userId, CheckoutRequest request) {
        // 1. Lấy user
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        // 2. Lấy giỏ hàng
        List<CartItem> allCartItems = cartService.getCartItems(userId);
        if (allCartItems.isEmpty()) {
            throw new RuntimeException("Giỏ hàng trống");
        }

        // 2.1. Lọc cart items theo bookIds nếu có (checkout một phần)
        List<CartItem> cartItems;
        if (request.getBookIds() != null && !request.getBookIds().isEmpty()) {
            // Checkout chỉ các sản phẩm được chọn
            cartItems = allCartItems.stream()
                    .filter(item -> request.getBookIds().contains(item.getBook().getId()))
                    .collect(Collectors.toList());

            if (cartItems.isEmpty()) {
                throw new RuntimeException("Không tìm thấy sản phẩm được chọn trong giỏ hàng");
            }

            // Validate: tất cả bookIds phải tồn tại trong giỏ
            if (cartItems.size() != request.getBookIds().size()) {
                throw new RuntimeException("Một số sản phẩm được chọn không có trong giỏ hàng");
            }
        } else {
            // Checkout toàn bộ giỏ hàng
            cartItems = allCartItems;
        }

        // 3. Tính tổng tiền
        Double subtotal = cartItems.stream()
                .mapToDouble(CartItem::getSubTotal)
                .sum();

        // 4. Áp dụng khuyến mãi nếu có
        Promotion promotion = null;
        Double discountAmount = 0.0;

        if (request.getDiscountCode() != null && !request.getDiscountCode().isEmpty()) {
            promotion = promotionRepository.findValidPromotionByCode(
                    request.getDiscountCode(),
                    LocalDate.now()
            ).orElseThrow(() -> new RuntimeException("Mã khuyến mãi không hợp lệ hoặc đã hết hạn"));

            // Kiểm tra điều kiện đơn hàng tối thiểu và tính discount
            if (!promotion.isValid(subtotal)) {
                if (subtotal < promotion.getMinOrderValue()) {
                    throw new RuntimeException(String.format(
                            "Đơn hàng phải đạt tối thiểu %.0f₫ để áp dụng mã này. Hiện tại: %.0f₫",
                            promotion.getMinOrderValue(), subtotal));
                }
                throw new RuntimeException("Mã khuyến mãi không hợp lệ");
            }

            // Tính discount amount dựa trên discount type
            discountAmount = promotion.calculateDiscountAmount(subtotal);

            // Áp dụng mã (tăng usage count)
            promotionService.applyPromotionCode(promotion.getPromotionID());
        }

        // 5. Tính thuế 5% (do shop chịu - không tính thêm cho khách)
        // Tax được tính để lưu vào DB cho mục đích kế toán/báo cáo
        Double taxableAmount = subtotal - discountAmount;
        Double taxAmount = taxableAmount * TAX_RATE;
        log.info("Tax amount (absorbed by shop): {}₫ ({}%)", taxAmount, TAX_RATE * 100);

        Double shippingFee = 30000.0; // Default fallback fee

        // 5.1. Tính phí ship động từ GHN nếu có địa chỉ
        if (request.getAddressId() != null) {
            Address address = addressRepository.findById(request.getAddressId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy địa chỉ"));

            // Calculate shipping fee using GHN API
            try {
                // Calculate total weight (default 300g per book)
                int totalBooks = cartItems.stream()
                        .mapToInt(CartItem::getQuantity)
                        .sum();
                int totalWeight = 300 * totalBooks; // gram

                // Build shipping fee request
                com.notfound.bookstore.model.dto.request.shipmentrequest.ShippingFeeRequest feeRequest =
                    com.notfound.bookstore.model.dto.request.shipmentrequest.ShippingFeeRequest.builder()
                        .toDistrictId(address.getDistrictId())
                        .toWardCode(address.getWardCode())
                        .weight(totalWeight)
                        .insuranceValue(subtotal.intValue())
                        .build();

                com.notfound.bookstore.model.dto.response.shipmentresponse.ShippingCalculationResponse shippingCalc =
                    shipmentService.calculateShipping(feeRequest);

                shippingFee = shippingCalc.getTotalFee().doubleValue();
                log.info("Calculated shipping fee from GHN: {}₫ for {} books, weight {}g, to district {}, ward {}",
                         shippingFee, totalBooks, totalWeight, address.getDistrictId(), address.getWardCode());

            } catch (Exception e) {
                log.warn("Failed to calculate shipping fee from GHN, using default {}: {}", shippingFee, e.getMessage());
                // Keep default shipping fee on error
            }
        }

        // 6. Tính tổng tiền khách hàng phải trả
        // Công thức: subtotal - discount + shipping (KHÔNG cộng tax vì shop chịu)
        Double totalAmount = subtotal - discountAmount + shippingFee;

        log.info("Order calculation - Subtotal: {}₫, Discount: {}₫, Tax (shop pays): {}₫, Shipping: {}₫, Total (customer pays): {}₫",
                 subtotal, discountAmount, taxAmount, shippingFee, totalAmount);

        // 7. Tạo đơn hàng
        Order order = new Order();
        order.setCustomer(user);
        order.setStatus(OrderStatus.PENDING);
        order.setTotalAmount(totalAmount);
        order.setPaymentMethod(request.getPaymentMethod());
        order.setPromotion(promotion);
        order.setDiscountAmount(discountAmount);
        order.setTaxAmount(taxAmount);
        order.setShippingFee(shippingFee);
        order.setOrderDate(LocalDateTime.now());

        // 7.1. Set shipping details từ address đã fetch ở trên
        if (request.getAddressId() != null) {
            Address address = addressRepository.findById(request.getAddressId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy địa chỉ"));

            ShippingDetails shippingDetails = new ShippingDetails();
            shippingDetails.setRecipientName(address.getRecipientName());
            shippingDetails.setPhoneNumber(address.getPhoneNumber());
            // Ghép địa chỉ đầy đủ: street, ward, district, province
            String fullAddress = String.format("%s, %s, %s, %s",
                    address.getStreet(),
                    address.getWard(),
                    address.getDistrict(),
                    address.getProvince());
            shippingDetails.setFullAddress(fullAddress);

            shippingDetails.setWard(address.getWard());
            shippingDetails.setDistrict(address.getDistrict());
            shippingDetails.setProvince(address.getProvince());

            order.setShippingDetails(shippingDetails);
        }else{
            throw new RuntimeException("Địa chỉ giao hàng không được để trống");
        }

        order = orderRepository.save(order);

        // 8. Tạo order items từ cart items
        Order finalOrder = order;
        List<OrderItem> orderItems = cartItems.stream()
                .map(cartItem -> {
                    Book book = cartItem.getBook();

                    // ⚠️ ATOMIC UPDATE - Prevents Race Condition
                    // Trừ tồn kho ngay lập tức bằng atomic query
                    // Nếu không đủ hàng, query sẽ trả về 0 (không update được)
                    int updatedRows = bookRepository.decreaseStockQuantity(
                            book.getId(),
                            cartItem.getQuantity()
                    );

                    // Nếu không update được (updatedRows = 0) => Hết hàng
                    if (updatedRows == 0) {
                        // Ném exception để @Transactional rollback toàn bộ
                        throw new RuntimeException(
                                "Sách '" + book.getTitle() + "' không đủ số lượng trong kho. " +
                                "Yêu cầu: " + cartItem.getQuantity() + " quyển."
                        );
                    }

                    // Tạo order item
                    OrderItem orderItem = new OrderItem();
                    orderItem.setOrder(finalOrder);
                    orderItem.setBook(book);
                    orderItem.setQuantity(cartItem.getQuantity());

                    // Use centralized price calculation utility for consistency
                    orderItem.setUnitPrice(PriceCalculationUtil.getEffectivePrice(book));
                    orderItem.setSubtotal(cartItem.getSubTotal());

                    return orderItem;
                })
                .collect(Collectors.toList());

        orderItemRepository.saveAll(orderItems);

        // 9. Xóa các sản phẩm đã checkout khỏi giỏ hàng
        if (request.getBookIds() != null && !request.getBookIds().isEmpty()) {
            // Xóa chỉ các sản phẩm đã checkout
            for (UUID bookId : request.getBookIds()) {
                cartService.removeBookFromCart(userId, bookId);
            }
        } else {
            // Xóa toàn bộ giỏ hàng
            cartService.clearCart(userId);
        }

        // 10. Create shipment order for COD payment method
        if ("COD".equalsIgnoreCase(request.getPaymentMethod())) {
            try {
                order.setStatus(OrderStatus.PROCESSING);
                orderRepository.save(order);
                shipmentService.createShipmentOrder(order);
                log.info("Shipment order created for COD order: {}", order.getOrderID());
            } catch (Exception e) {
                log.error("Failed to create shipment for COD order {}: {}", order.getOrderID(), e.getMessage(), e);
                // Don't fail the order if shipment creation fails
            }
        }

        // 11. Tạo response
        return buildOrderResponse(order, orderItems, promotion, discountAmount, subtotal);
    }

    @Override
    public OrderResponse getOrderById(UUID orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));

        List<OrderItem> orderItems = orderItemRepository.findByOrderOrderID(orderId);

        Double subtotal = orderItems.stream()
                .mapToDouble(OrderItem::getSubtotal)
                .sum();

        return buildOrderResponse(order, orderItems, order.getPromotion(),
                order.getDiscountAmount(), subtotal);
    }

    @Override
    public List<OrderResponse> getOrdersByUserId(UUID userId) {
        List<Order> orders = orderRepository.findByCustomerId(userId);
        return orders.stream()
                .map(order -> {
                    List<OrderItem> orderItems = orderItemRepository.findByOrderOrderID(order.getOrderID());
                    Double subtotal = orderItems.stream().mapToDouble(OrderItem::getSubtotal).sum();
                    return buildOrderResponse(order, orderItems, order.getPromotion(),
                            order.getDiscountAmount(), subtotal);
                })
                .collect(Collectors.toList());
    }

    @Override
    public Page<OrderResponse> getOrdersByUserId(UUID userId, Pageable pageable) {
        Page<Order> orders = orderRepository.findByCustomerId(userId, pageable);
        return orders.map(order -> {
            List<OrderItem> orderItems = orderItemRepository.findByOrderOrderID(order.getOrderID());
            Double subtotal = orderItems.stream().mapToDouble(OrderItem::getSubtotal).sum();
            return buildOrderResponse(order, orderItems, order.getPromotion(),
                    order.getDiscountAmount(), subtotal);
        });
    }

    @Override
    public Page<OrderResponse> getAllOrders(Pageable pageable) {
        Page<Order> orders = orderRepository.findAll(pageable);
        return orders.map(order -> {
            List<OrderItem> orderItems = orderItemRepository.findByOrderOrderID(order.getOrderID());
            Double subtotal = orderItems.stream().mapToDouble(OrderItem::getSubtotal).sum();
            return buildOrderResponse(order, orderItems, order.getPromotion(),
                    order.getDiscountAmount(), subtotal);
        });
    }

    @Override
    @Transactional
    public OrderResponse updateOrderStatus(UUID orderId, OrderStatus status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));

        order.setStatus(status);
        order = orderRepository.save(order);

        List<OrderItem> orderItems = orderItemRepository.findByOrderOrderID(orderId);
        Double subtotal = orderItems.stream().mapToDouble(OrderItem::getSubtotal).sum();

        return buildOrderResponse(order, orderItems, order.getPromotion(),
                order.getDiscountAmount(), subtotal);
    }

    @Override
    @Transactional
    public OrderResponse cancelOrder(UUID orderId, UUID userId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));

        // Kiểm tra quyền hủy đơn
        if (!order.getCustomer().getId().equals(userId)) {
            throw new RuntimeException("Bạn không có quyền hủy đơn hàng này");
        }

        // Chỉ cho phép hủy đơn ở trạng thái PENDING hoặc CONFIRMED
        if (order.getStatus() != OrderStatus.PENDING && order.getStatus() != OrderStatus.CONFIRMED) {
            throw new RuntimeException("Không thể hủy đơn hàng ở trạng thái hiện tại");
        }

        // Hoàn lại tồn kho
        List<OrderItem> orderItems = orderItemRepository.findByOrderOrderID(orderId);
        orderItems.forEach(item -> {
            // Sử dụng atomic update để tăng tồn kho
            bookRepository.increaseStockQuantity(item.getBook().getId(), item.getQuantity());
        });

        order.setStatus(OrderStatus.CANCELLED);
        order = orderRepository.save(order);

        // Hủy đơn vận chuyển nếu đã tạo
        Shipment shipment = order.getShipment();
        if (shipment != null){
            shipmentService.cancelShipmentOrder(shipment.getGhnOrderCode());
        }

        Double subtotal = orderItems.stream().mapToDouble(OrderItem::getSubtotal).sum();
        return buildOrderResponse(order, orderItems, order.getPromotion(),
                order.getDiscountAmount(), subtotal);
    }

    @Override
    public List<OrderResponse> getOrdersByStatus(OrderStatus status) {
        List<Order> orders = orderRepository.findByStatus(status);
        return orders.stream()
                .map(order -> {
                    List<OrderItem> orderItems = orderItemRepository.findByOrderOrderID(order.getOrderID());
                    Double subtotal = orderItems.stream().mapToDouble(OrderItem::getSubtotal).sum();
                    return buildOrderResponse(order, orderItems, order.getPromotion(),
                            order.getDiscountAmount(), subtotal);
                })
                .collect(Collectors.toList());
    }

    @Override
    public List<OrderResponse> getOrdersByStatus(OrderStatus status, LocalDateTime startDate, LocalDateTime endDate) {
        List<Order> orders = orderRepository.findByStatusAndOrderDateBetween(status, startDate, endDate);
        return orders.stream()
                .map(order -> {
                    List<OrderItem> orderItems = orderItemRepository.findByOrderOrderID(order.getOrderID());
                    Double subtotal = orderItems.stream().mapToDouble(OrderItem::getSubtotal).sum();
                    return buildOrderResponse(order, orderItems, order.getPromotion(),
                            order.getDiscountAmount(), subtotal);
                })
                .collect(Collectors.toList());
    }

    @Override
    public Double getTotalRevenue() {
        return orderRepository.findAll().stream()
                .filter(order -> order.getStatus() == OrderStatus.COMPLETED ||
                               order.getStatus() == OrderStatus.DELIVERED)
                .mapToDouble(Order::getTotalAmount)
                .sum();
    }

    @Override
    public Double getTotalRevenue(LocalDateTime startDate, LocalDateTime endDate) {
        Double revenue = orderRepository.getTotalRevenueByDateRange(startDate, endDate);
        return revenue != null ? revenue : 0.0;
    }

    @Override
    public Long countOrdersByUserId(UUID userId) {
        return orderRepository.countByCustomerId(userId);
    }

    private OrderResponse buildOrderResponse(Order order, List<OrderItem> orderItems,
                                             Promotion promotion, Double discountAmount,
                                             Double subtotal) {
        // Map order items to response
        List<OrderItemResponse> itemResponses = orderItems.stream()
                .map(item -> OrderItemResponse.builder()
                        .id(item.getOrderItemID())
                        .bookId(item.getBook().getId())
                        .bookTitle(item.getBook().getTitle())
                        .bookIsbn(item.getBook().getIsbn())
                        .bookImageUrl(item.getBook().getImages() != null && !item.getBook().getImages().isEmpty()
                                ? item.getBook().getImages().get(0).getUrl()
                                : null)
                        .quantity(item.getQuantity())
                        .unitPrice(BigDecimal.valueOf(item.getUnitPrice()))
                        .subtotal(BigDecimal.valueOf(item.getSubtotal()))
                        .build())
                .collect(Collectors.toList());

        // Build order response với thông tin đầy đủ
        OrderResponse.OrderResponseBuilder builder = OrderResponse.builder()
                .id(order.getOrderID())
                .orderCode("ORD-" + order.getOrderID().toString().substring(0, 8).toUpperCase())
                .orderDate(order.getOrderDate())
                .status(order.getStatus().name())
                .subtotal(BigDecimal.valueOf(subtotal))
                .total(BigDecimal.valueOf(order.getTotalAmount()))
                .paymentMethod(order.getPaymentMethod())
                .taxAmount(order.getTaxAmount() != null ? BigDecimal.valueOf(order.getTaxAmount()) : BigDecimal.ZERO)
                .shippingFee(order.getShippingFee() != null ? BigDecimal.valueOf(order.getShippingFee()) : BigDecimal.ZERO)
                .items(itemResponses)
                // Thông tin khách hàng từ User entity mới
                .customerId(order.getCustomer().getId())
                .customerName(order.getCustomer().getFullName() != null
                        ? order.getCustomer().getFullName()
                        : order.getCustomer().getUsername())
                .customerEmail(order.getCustomer().getEmail())
                .customerPhone(order.getCustomer().getPhoneNumber())
                .customerMembershipTier(order.getCustomer().getMembershipTier() != null
                        ? order.getCustomer().getMembershipTier().name()
                        : "BRONZE");

        // Thêm thông tin giao hàng từ ShippingDetails
        if (order.getShippingDetails() != null) {
            builder.recipientName(order.getShippingDetails().getRecipientName())
                   .recipientPhone(order.getShippingDetails().getPhoneNumber())
                   .shippingAddress(order.getShippingDetails().getFullAddress())
                   .shippingProvince(order.getShippingDetails().getProvince())
                   .shippingDistrict(order.getShippingDetails().getDistrict())
                   .shippingWard(order.getShippingDetails().getWard())
                   .shippingNote(order.getShippingDetails().getShippingNote());
        }

        // Thêm thông tin khuyến mãi nếu có
        if (promotion != null) {
            builder.promotionCode(promotion.getCode())
                   .promotionName(promotion.getName())
                   .discountPercent(promotion.getDiscountPercent())
                   .discountAmount(BigDecimal.valueOf(discountAmount));
        } else {
            builder.discountAmount(BigDecimal.ZERO);
        }

        return builder.build();
    }
}
