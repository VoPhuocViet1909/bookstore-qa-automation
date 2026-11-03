package com.notfound.bookstore.controller;

import com.notfound.bookstore.model.dto.request.orderrequest.CheckoutRequest;
import com.notfound.bookstore.model.dto.request.paymentrequest.PaymentRequest;
import com.notfound.bookstore.model.dto.response.ApiResponse;
import com.notfound.bookstore.model.dto.response.orderresponse.OrderResponse;
import com.notfound.bookstore.model.dto.response.paymentresponse.CreatePaymentResponse;
import com.notfound.bookstore.model.entity.User;
import com.notfound.bookstore.model.enums.OrderStatus;
import com.notfound.bookstore.repository.UserRepository;
import com.notfound.bookstore.service.OrderService;
import com.notfound.bookstore.service.impl.VNPayServiceImpl;
import com.notfound.bookstore.service.impl.ZaloPayServiceImpl;
import com.notfound.bookstore.service.impl.MoMoServiceImpl;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final UserRepository userRepository;
    private final VNPayServiceImpl vnPayService;
    private final ZaloPayServiceImpl zaloPayService;
    private final MoMoServiceImpl moMoService;

    /**
     * Lấy danh sách đơn hàng của user đang đăng nhập
     * GET /api/orders
     */
    @GetMapping
    public ApiResponse<List<OrderResponse>> getMyOrders(@AuthenticationPrincipal Jwt jwt) {
        if (jwt == null) {
            return ApiResponse.<List<OrderResponse>>builder()
                    .code(4001)
                    .message("Vui lòng đăng nhập")
                    .build();
        }

        String username = jwt.getSubject();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));

        List<OrderResponse> orders = orderService.getOrdersByUserId(user.getId());

        return ApiResponse.<List<OrderResponse>>builder()
                .code(1000)
                .message("Lấy danh sách đơn hàng thành công")
                .result(orders)
                .build();
    }

    /**
     * Lấy chi tiết đơn hàng theo ID
     * GET /api/orders/{orderId}
     */
    @GetMapping("/{orderId}")
    public ApiResponse<OrderResponse> getOrderById(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID orderId) {

        if (jwt == null) {
            return ApiResponse.<OrderResponse>builder()
                    .code(4001)
                    .message("Vui lòng đăng nhập")
                    .build();
        }

        try {
            OrderResponse order = orderService.getOrderById(orderId);

            return ApiResponse.<OrderResponse>builder()
                    .code(1000)
                    .message("Lấy thông tin đơn hàng thành công")
                    .result(order)
                    .build();
        } catch (RuntimeException e) {
            return ApiResponse.<OrderResponse>builder()
                    .code(4004)
                    .message(e.getMessage())
                    .build();
        }
    }

    /**
     * Hủy đơn hàng
     * POST /api/orders/{orderId}/cancel
     */
    @PostMapping("/{orderId}/cancel")
    public ApiResponse<OrderResponse> cancelOrder(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID orderId) {

        if (jwt == null) {
            return ApiResponse.<OrderResponse>builder()
                    .code(4001)
                    .message("Vui lòng đăng nhập")
                    .build();
        }

        try {
            String username = jwt.getSubject();
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User không tồn tại"));

            OrderResponse order = orderService.cancelOrder(orderId, user.getId());

            return ApiResponse.<OrderResponse>builder()
                    .code(1000)
                    .message("Hủy đơn hàng thành công")
                    .result(order)
                    .build();
        } catch (RuntimeException e) {
            return ApiResponse.<OrderResponse>builder()
                    .code(4005)
                    .message(e.getMessage())
                    .build();
        }
    }

    /**
     * ADMIN: Lấy tất cả đơn hàng (có phân trang)
     * GET /api/orders/admin/all?page=0&size=10
     */
    @GetMapping("/admin/all")
    public ApiResponse<Page<OrderResponse>> getAllOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<OrderResponse> orders = orderService.getAllOrders(pageable);

        return ApiResponse.<Page<OrderResponse>>builder()
                .code(1000)
                .message("Lấy danh sách đơn hàng thành công")
                .result(orders)
                .build();
    }

    /**
     * ADMIN: Xác nhận đơn hàng COD (chuyển từ PENDING sang CONFIRMED)
     * POST /api/orders/admin/{orderId}/confirm
     */
    @PostMapping("/admin/{orderId}/confirm")
    public ApiResponse<OrderResponse> confirmCODOrder(@PathVariable UUID orderId) {
        try {
            OrderResponse order = orderService.getOrderById(orderId);

            // Kiểm tra đơn hàng có phải COD không
            if (!"COD".equalsIgnoreCase(order.getPaymentMethod())) {
                return ApiResponse.<OrderResponse>builder()
                        .code(4003)
                        .message("Chỉ có thể xác nhận đơn hàng COD")
                        .build();
            }

            // Kiểm tra trạng thái hiện tại
            if (!"PENDING".equals(order.getStatus())) {
                return ApiResponse.<OrderResponse>builder()
                        .code(4003)
                        .message("Chỉ có thể xác nhận đơn hàng đang ở trạng thái PENDING")
                        .build();
            }

            // Chuyển sang CONFIRMED
            OrderResponse confirmedOrder = orderService.updateOrderStatus(orderId, OrderStatus.CONFIRMED);

            return ApiResponse.<OrderResponse>builder()
                    .code(1000)
                    .message("Xác nhận đơn hàng COD thành công")
                    .result(confirmedOrder)
                    .build();

        } catch (RuntimeException e) {
            return ApiResponse.<OrderResponse>builder()
                    .code(4004)
                    .message(e.getMessage())
                    .build();
        }
    }

    /**
     * ADMIN: Bắt đầu xử lý đơn hàng (chuyển sang PROCESSING)
     * POST /api/orders/admin/{orderId}/process
     */
    @PostMapping("/admin/{orderId}/process")
    public ApiResponse<OrderResponse> processOrder(@PathVariable UUID orderId) {
        try {
            OrderResponse order = orderService.getOrderById(orderId);

            // Kiểm tra trạng thái hiện tại
            if (!"CONFIRMED".equals(order.getStatus()) && !"PENDING".equals(order.getStatus())) {
                return ApiResponse.<OrderResponse>builder()
                        .code(4003)
                        .message("Chỉ có thể xử lý đơn hàng đang ở trạng thái CONFIRMED hoặc PENDING")
                        .build();
            }

            OrderResponse processedOrder = orderService.updateOrderStatus(orderId, OrderStatus.PROCESSING);

            return ApiResponse.<OrderResponse>builder()
                    .code(1000)
                    .message("Bắt đầu xử lý đơn hàng thành công")
                    .result(processedOrder)
                    .build();

        } catch (RuntimeException e) {
            return ApiResponse.<OrderResponse>builder()
                    .code(4004)
                    .message(e.getMessage())
                    .build();
        }
    }

    /**
     * ADMIN: Đánh dấu đơn hàng đã giao cho shipper (chuyển sang SHIPPED)
     * POST /api/orders/admin/{orderId}/ship
     */
    @PostMapping("/admin/{orderId}/ship")
    public ApiResponse<OrderResponse> shipOrder(@PathVariable UUID orderId) {
        try {
            OrderResponse order = orderService.getOrderById(orderId);

            // Kiểm tra trạng thái hiện tại
            if (!"PROCESSING".equals(order.getStatus())) {
                return ApiResponse.<OrderResponse>builder()
                        .code(4003)
                        .message("Chỉ có thể giao hàng khi đơn đang ở trạng thái PROCESSING")
                        .build();
            }

            OrderResponse shippedOrder = orderService.updateOrderStatus(orderId, OrderStatus.SHIPPED);

            return ApiResponse.<OrderResponse>builder()
                    .code(1000)
                    .message("Đơn hàng đã được giao cho shipper")
                    .result(shippedOrder)
                    .build();

        } catch (RuntimeException e) {
            return ApiResponse.<OrderResponse>builder()
                    .code(4004)
                    .message(e.getMessage())
                    .build();
        }
    }

    /**
     * ADMIN: Đánh dấu đơn hàng đã giao thành công (chuyển sang DELIVERED)
     * POST /api/orders/admin/{orderId}/deliver
     */
    @PostMapping("/admin/{orderId}/deliver")
    public ApiResponse<OrderResponse> deliverOrder(@PathVariable UUID orderId) {
        try {
            OrderResponse order = orderService.getOrderById(orderId);

            // Kiểm tra trạng thái hiện tại
            if (!"SHIPPED".equals(order.getStatus())) {
                return ApiResponse.<OrderResponse>builder()
                        .code(4003)
                        .message("Chỉ có thể xác nhận giao hàng khi đơn đang ở trạng thái SHIPPED")
                        .build();
            }

            OrderResponse deliveredOrder = orderService.updateOrderStatus(orderId, OrderStatus.DELIVERED);

            return ApiResponse.<OrderResponse>builder()
                    .code(1000)
                    .message("Đơn hàng đã được giao thành công")
                    .result(deliveredOrder)
                    .build();

        } catch (RuntimeException e) {
            return ApiResponse.<OrderResponse>builder()
                    .code(4004)
                    .message(e.getMessage())
                    .build();
        }
    }

    /**
     * ADMIN: Hoàn thành đơn hàng (chuyển sang COMPLETED)
     * POST /api/orders/admin/{orderId}/complete
     */
    @PostMapping("/admin/{orderId}/complete")
    public ApiResponse<OrderResponse> completeOrder(@PathVariable UUID orderId) {
        try {
            OrderResponse order = orderService.getOrderById(orderId);

            // Kiểm tra trạng thái hiện tại
            if (!"DELIVERED".equals(order.getStatus())) {
                return ApiResponse.<OrderResponse>builder()
                        .code(4003)
                        .message("Chỉ có thể hoàn thành đơn hàng đã được giao")
                        .build();
            }

            OrderResponse completedOrder = orderService.updateOrderStatus(orderId, OrderStatus.COMPLETED);

            return ApiResponse.<OrderResponse>builder()
                    .code(1000)
                    .message("Đơn hàng đã hoàn thành")
                    .result(completedOrder)
                    .build();

        } catch (RuntimeException e) {
            return ApiResponse.<OrderResponse>builder()
                    .code(4004)
                    .message(e.getMessage())
                    .build();
        }
    }

    /**
     * ADMIN: Hủy đơn hàng
     * POST /api/orders/admin/{orderId}/cancel
     */
    @PostMapping("/admin/{orderId}/cancel")
    public ApiResponse<OrderResponse> adminCancelOrder(@PathVariable UUID orderId) {
        try {
            OrderResponse order = orderService.getOrderById(orderId);

            // Không thể hủy đơn đã giao hoặc hoàn thành
            if ("DELIVERED".equals(order.getStatus()) || "COMPLETED".equals(order.getStatus())) {
                return ApiResponse.<OrderResponse>builder()
                        .code(4003)
                        .message("Không thể hủy đơn hàng đã giao hoặc đã hoàn thành")
                        .build();
            }

            OrderResponse cancelledOrder = orderService.updateOrderStatus(orderId, OrderStatus.CANCELLED);

            return ApiResponse.<OrderResponse>builder()
                    .code(1000)
                    .message("Đã hủy đơn hàng")
                    .result(cancelledOrder)
                    .build();

        } catch (RuntimeException e) {
            return ApiResponse.<OrderResponse>builder()
                    .code(4004)
                    .message(e.getMessage())
                    .build();
        }
    }

    /**
     * ADMIN: Lấy chi tiết đơn hàng (không cần kiểm tra quyền sở hữu)
     * GET /api/orders/admin/{orderId}/details
     */
    @GetMapping("/admin/{orderId}/details")
    public ApiResponse<OrderResponse> getOrderDetailsAdmin(@PathVariable UUID orderId) {
        try {
            OrderResponse order = orderService.getOrderById(orderId);

            return ApiResponse.<OrderResponse>builder()
                    .code(1000)
                    .message("Lấy chi tiết đơn hàng thành công")
                    .result(order)
                    .build();

        } catch (RuntimeException e) {
            return ApiResponse.<OrderResponse>builder()
                    .code(4004)
                    .message(e.getMessage())
                    .build();
        }
    }

    /**
     * ADMIN: Lấy đơn hàng COD chưa xác nhận
     * GET /api/orders/admin/cod/pending
     */
    @GetMapping("/admin/cod/pending")
    public ApiResponse<List<OrderResponse>> getPendingCODOrders() {
        try {
            // Lấy tất cả đơn PENDING
            List<OrderResponse> allPendingOrders = orderService.getOrdersByStatus(OrderStatus.PENDING);

            // Filter chỉ lấy COD
            List<OrderResponse> codOrders = allPendingOrders.stream()
                    .filter(order -> "COD".equalsIgnoreCase(order.getPaymentMethod()))
                    .toList();

            return ApiResponse.<List<OrderResponse>>builder()
                    .code(1000)
                    .message("Lấy danh sách đơn COD chưa xác nhận thành công")
                    .result(codOrders)
                    .build();

        } catch (Exception e) {
            return ApiResponse.<List<OrderResponse>>builder()
                    .code(4004)
                    .message(e.getMessage())
                    .build();
        }
    }

    /**
     * ADMIN: Tìm kiếm đơn hàng theo customer name hoặc order ID
     * GET /api/orders/admin/search?keyword=John
     */
    @GetMapping("/admin/search")
    public ApiResponse<List<OrderResponse>> searchOrders(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<OrderResponse> orders = orderService.getAllOrders(pageable);

            // Filter by keyword (simple implementation - có thể cải thiện bằng query)
            List<OrderResponse> filteredOrders = orders.getContent().stream()
                    .filter(order ->
                        order.getId().toString().contains(keyword) ||
                        (order.getRecipientName() != null &&
                         order.getRecipientName().toLowerCase().contains(keyword.toLowerCase())) ||
                        (order.getCustomerName() != null &&
                         order.getCustomerName().toLowerCase().contains(keyword.toLowerCase()))
                    )
                    .toList();

            return ApiResponse.<List<OrderResponse>>builder()
                    .code(1000)
                    .message("Tìm kiếm đơn hàng thành công")
                    .result(filteredOrders)
                    .build();

        } catch (Exception e) {
            return ApiResponse.<List<OrderResponse>>builder()
                    .code(4004)
                    .message(e.getMessage())
                    .build();
        }
    }

    /**
     * ADMIN: Lấy thống kê tổng quan
     * GET /api/orders/admin/statistics
     */
    @GetMapping("/admin/statistics")
    public ApiResponse<java.util.Map<String, Object>> getOrderStatistics(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        try {
            LocalDateTime start = null;
            LocalDateTime end = null;

            if (startDate != null && endDate != null) {
                start = LocalDate.parse(startDate).atStartOfDay();
                end = LocalDate.parse(endDate).atTime(23, 59, 59);
            }

            // Lấy số lượng đơn theo từng trạng thái
            long pendingCount = orderService.getOrdersByStatus(OrderStatus.PENDING).size();
            long confirmedCount = orderService.getOrdersByStatus(OrderStatus.CONFIRMED).size();
            long processingCount = orderService.getOrdersByStatus(OrderStatus.PROCESSING).size();
            long shippedCount = orderService.getOrdersByStatus(OrderStatus.SHIPPED).size();
            long deliveredCount = orderService.getOrdersByStatus(OrderStatus.DELIVERED).size();
            long completedCount = orderService.getOrdersByStatus(OrderStatus.COMPLETED).size();
            long cancelledCount = orderService.getOrdersByStatus(OrderStatus.CANCELLED).size();

            // Tổng doanh thu
            Double totalRevenue = start != null && end != null
                    ? orderService.getTotalRevenue(start, end)
                    : orderService.getTotalRevenue();

            java.util.Map<String, Object> statistics = new java.util.HashMap<>();
            statistics.put("pending", pendingCount);
            statistics.put("confirmed", confirmedCount);
            statistics.put("processing", processingCount);
            statistics.put("shipped", shippedCount);
            statistics.put("delivered", deliveredCount);
            statistics.put("completed", completedCount);
            statistics.put("cancelled", cancelledCount);
            statistics.put("totalRevenue", totalRevenue);
            statistics.put("totalOrders", pendingCount + confirmedCount + processingCount +
                                         shippedCount + deliveredCount + completedCount + cancelledCount);

            return ApiResponse.<java.util.Map<String, Object>>builder()
                    .code(1000)
                    .message("Lấy thống kê thành công")
                    .result(statistics)
                    .build();

        } catch (Exception e) {
            return ApiResponse.<java.util.Map<String, Object>>builder()
                    .code(4004)
                    .message(e.getMessage())
                    .build();
        }
    }

    /**
     * ADMIN: Cập nhật trạng thái đơn hàng
     * PUT /api/orders/admin/{orderId}/status?status=CONFIRMED
     */
    @PutMapping("/admin/{orderId}/status")
    public ApiResponse<OrderResponse> updateOrderStatus(
            @PathVariable UUID orderId,
            @RequestParam String status) {

        try {
            OrderStatus orderStatus = OrderStatus.valueOf(status.toUpperCase());
            OrderResponse order = orderService.updateOrderStatus(orderId, orderStatus);

            return ApiResponse.<OrderResponse>builder()
                    .code(1000)
                    .message("Cập nhật trạng thái đơn hàng thành công")
                    .result(order)
                    .build();
        } catch (IllegalArgumentException e) {
            return ApiResponse.<OrderResponse>builder()
                    .code(4003)
                    .message("Trạng thái không hợp lệ. Các trạng thái: PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED, COMPLETED")
                    .build();
        } catch (RuntimeException e) {
            return ApiResponse.<OrderResponse>builder()
                    .code(4004)
                    .message(e.getMessage())
                    .build();
        }
    }

    /**
     * ADMIN: Lấy đơn hàng theo trạng thái
     * GET /api/orders/admin/status/{status}
     */
    @GetMapping("/admin/status/{status}")
    public ApiResponse<List<OrderResponse>> getOrdersByStatus(
            @PathVariable String status,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        try {
            OrderStatus orderStatus = OrderStatus.valueOf(status.toUpperCase());
            List<OrderResponse> orders;
            
            // Nếu có date range, filter theo date range
            if (startDate != null && endDate != null) {
                LocalDateTime start = LocalDate.parse(startDate).atStartOfDay();
                LocalDateTime end = LocalDate.parse(endDate).atTime(23, 59, 59);
                orders = orderService.getOrdersByStatus(orderStatus, start, end);
            } else {
                orders = orderService.getOrdersByStatus(orderStatus);
            }

            return ApiResponse.<List<OrderResponse>>builder()
                    .code(1000)
                    .message("Lấy danh sách đơn hàng theo trạng thái thành công")
                    .result(orders)
                    .build();
        } catch (IllegalArgumentException e) {
            return ApiResponse.<List<OrderResponse>>builder()
                    .code(4003)
                    .message("Trạng thái không hợp lệ")
                    .build();
        } catch (Exception e) {
            return ApiResponse.<List<OrderResponse>>builder()
                    .code(4004)
                    .message("Lỗi định dạng ngày tháng: " + e.getMessage())
                    .build();
        }
    }

    /**
     * ADMIN: Lấy tổng doanh thu
     * GET /api/orders/admin/revenue?startDate=2024-01-01&endDate=2024-01-31
     */
    @GetMapping("/admin/revenue")
    public ApiResponse<Double> getTotalRevenue(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        try {
            Double revenue;
            
            // Nếu có date range, filter theo date range
            if (startDate != null && endDate != null) {
                LocalDateTime start = LocalDate.parse(startDate).atStartOfDay();
                LocalDateTime end = LocalDate.parse(endDate).atTime(23, 59, 59);
                revenue = orderService.getTotalRevenue(start, end);
            } else {
                revenue = orderService.getTotalRevenue();
            }

            return ApiResponse.<Double>builder()
                    .code(1000)
                    .message("Lấy tổng doanh thu thành công")
                    .result(revenue)
                    .build();
        } catch (Exception e) {
            return ApiResponse.<Double>builder()
                    .code(4004)
                    .message("Lỗi định dạng ngày tháng: " + e.getMessage())
                    .result(0.0)
                    .build();
        }
    }

    /**
     * Đếm số đơn hàng của user
     * GET /api/orders/count
     */
    @GetMapping("/count")
    public ApiResponse<Long> countMyOrders(@AuthenticationPrincipal Jwt jwt) {
        if (jwt == null) {
            return ApiResponse.<Long>builder()
                    .code(1000)
                    .result(0L)
                    .build();
        }

        String username = jwt.getSubject();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));

        Long count = orderService.countOrdersByUserId(user.getId());

        return ApiResponse.<Long>builder()
                .code(1000)
                .message("Đếm số đơn hàng thành công")
                .result(count)
                .build();
    }

    /**
     * Checkout và tạo đơn hàng từ giỏ hàng (COD)
     * POST /api/orders/checkout
     */
    @PostMapping("/checkout")
    public ApiResponse<OrderResponse> checkout(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody(required = false) CheckoutRequest request) {

        if (jwt == null) {
            return ApiResponse.<OrderResponse>builder()
                    .code(4001)
                    .message("Vui lòng đăng nhập")
                    .build();
        }

        try {
            String username = jwt.getSubject();
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User không tồn tại"));

            // Nếu không có request body, tạo mặc định COD
            if (request == null) {
                request = CheckoutRequest.builder()
                        .paymentMethod("COD")
                        .build();
            }

            // Validate paymentMethod
            if (request.getPaymentMethod() == null || request.getPaymentMethod().trim().isEmpty()) {
                return ApiResponse.<OrderResponse>builder()
                        .code(4003)
                        .message("Vui lòng chọn phương thức thanh toán")
                        .build();
            }

            OrderResponse orderResponse = orderService.checkout(user.getId(), request);

            return ApiResponse.<OrderResponse>builder()
                    .code(1000)
                    .message("Đặt hàng thành công")
                    .result(orderResponse)
                    .build();
        } catch (RuntimeException e) {
            return ApiResponse.<OrderResponse>builder()
                    .code(4005)
                    .message(e.getMessage())
                    .build();
        }
    }

    /**
     * Checkout và thanh toán online qua VNPay
     * POST /api/orders/checkout/vnpay
     */
    @PostMapping("/checkout/vnpay")
    public ApiResponse<CreatePaymentResponse> checkoutWithVNPay(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody CheckoutRequest request,
            HttpServletRequest httpServletRequest) {

        if (jwt == null) {
            return ApiResponse.<CreatePaymentResponse>builder()
                    .code(4001)
                    .message("Vui lòng đăng nhập")
                    .build();
        }

        try {
            String username = jwt.getSubject();
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User không tồn tại"));

            // Set payment method to VNPay
            request.setPaymentMethod("VNPay");

            // 1. Tạo đơn hàng trước
            OrderResponse orderResponse = orderService.checkout(user.getId(), request);

            // 2. Tạo payment request
            PaymentRequest paymentRequest = PaymentRequest.builder()
                    .orderId(orderResponse.getId())
                    .amount(orderResponse.getTotal().longValue())
                    .build();

            // 3. Tạo VNPay payment URL
            CreatePaymentResponse paymentResponse = vnPayService.createVNPayPaymentUrl(
                    paymentRequest,
                    httpServletRequest
            );

            return ApiResponse.<CreatePaymentResponse>builder()
                    .code(1000)
                    .message("Đã tạo đơn hàng và đường dẫn thanh toán VNPay thành công")
                    .result(paymentResponse)
                    .build();

        } catch (RuntimeException e) {
            return ApiResponse.<CreatePaymentResponse>builder()
                    .code(4005)
                    .message(e.getMessage())
                    .build();
        }
    }

    /**
     * Checkout và thanh toán online qua ZaloPay
     * POST /api/orders/checkout/zalopay
     */
    @PostMapping("/checkout/zalopay")
    public ApiResponse<CreatePaymentResponse> checkoutWithZaloPay(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody CheckoutRequest request) {

        if (jwt == null) {
            return ApiResponse.<CreatePaymentResponse>builder()
                    .code(4001)
                    .message("Vui lòng đăng nhập")
                    .build();
        }

        try {
            String username = jwt.getSubject();
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User không tồn tại"));

            // Set payment method to ZaloPay
            request.setPaymentMethod("ZaloPay");

            // 1. Tạo đơn hàng trước
            OrderResponse orderResponse = orderService.checkout(user.getId(), request);

            // 2. Tạo payment request
            PaymentRequest paymentRequest = PaymentRequest.builder()
                    .orderId(orderResponse.getId())
                    .amount(orderResponse.getTotal().longValue())
                    .build();

            // 3. Tạo ZaloPay payment URL
            CreatePaymentResponse paymentResponse = zaloPayService.createOrderTransaction(paymentRequest);

            return ApiResponse.<CreatePaymentResponse>builder()
                    .code(1000)
                    .message("Đã tạo đơn hàng và đường dẫn thanh toán ZaloPay thành công")
                    .result(paymentResponse)
                    .build();

        } catch (RuntimeException e) {
            return ApiResponse.<CreatePaymentResponse>builder()
                    .code(4005)
                    .message(e.getMessage())
                    .build();
        }
    }

    /**
     * Checkout và thanh toán online qua MoMo
     * POST /api/orders/checkout/momo
     */
    @Transactional
    @PostMapping("/checkout/momo")
    public ApiResponse<CreatePaymentResponse> checkoutWithMoMo(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody CheckoutRequest request) {

        if (jwt == null) {
            return ApiResponse.<CreatePaymentResponse>builder()
                    .code(4001)
                    .message("Vui lòng đăng nhập")
                    .build();
        }

        try {
            String username = jwt.getSubject();
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User không tồn tại"));

            // Set payment method to MoMo
            request.setPaymentMethod("MoMo");

            // 1. Tạo đơn hàng trước
            OrderResponse orderResponse = orderService.checkout(user.getId(), request);

            // Log để debug
            log.info("Created order with ID: {}", orderResponse.getId());

            // 2. Tạo payment request
            PaymentRequest paymentRequest = PaymentRequest.builder()
                    .orderId(orderResponse.getId())
                    .amount(orderResponse.getTotal().longValue())
                    .build();

            // 3. Tạo MoMo payment URL
            CreatePaymentResponse paymentResponse = moMoService.createMoMoPayment(paymentRequest);

            return ApiResponse.<CreatePaymentResponse>builder()
                    .code(1000)
                    .message("Đã tạo đơn hàng và đường dẫn thanh toán MoMo thành công")
                    .result(paymentResponse)
                    .build();

        } catch (RuntimeException e) {
            log.error("Error in checkoutWithMoMo: {}", e.getMessage(), e);
            return ApiResponse.<CreatePaymentResponse>builder()
                    .code(4005)
                    .message(e.getMessage())
                    .build();
        }
    }
}
