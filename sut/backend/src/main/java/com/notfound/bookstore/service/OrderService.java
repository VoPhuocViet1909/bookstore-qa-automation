package com.notfound.bookstore.service;

import com.notfound.bookstore.model.dto.request.orderrequest.CheckoutRequest;
import com.notfound.bookstore.model.dto.response.orderresponse.OrderResponse;
import com.notfound.bookstore.model.entity.Order;
import com.notfound.bookstore.model.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface OrderService {
    /**
     * Checkout từ giỏ hàng
     */
    OrderResponse checkout(UUID userId, CheckoutRequest request);

    /**
     * Lấy chi tiết đơn hàng
     */
    OrderResponse getOrderById(UUID orderId);

    /**
     * Lấy danh sách đơn hàng của user
     */
    List<OrderResponse> getOrdersByUserId(UUID userId);

    /**
     * Lấy danh sách đơn hàng của user (phân trang)
     */
    Page<OrderResponse> getOrdersByUserId(UUID userId, Pageable pageable);

    /**
     * Lấy tất cả đơn hàng (Admin) (phân trang)
     */
    Page<OrderResponse> getAllOrders(Pageable pageable);

    /**
     * Cập nhật trạng thái đơn hàng
     */
    OrderResponse updateOrderStatus(UUID orderId, OrderStatus status);

    /**
     * Hủy đơn hàng
     */
    OrderResponse cancelOrder(UUID orderId, UUID userId);

    /**
     * Lấy đơn hàng theo trạng thái
     */
    List<OrderResponse> getOrdersByStatus(OrderStatus status);

    /**
     * Lấy đơn hàng theo trạng thái và khoảng thời gian
     */
    List<OrderResponse> getOrdersByStatus(OrderStatus status, LocalDateTime startDate, LocalDateTime endDate);

    /**
     * Tính tổng doanh thu
     */
    Double getTotalRevenue();

    /**
     * Tính tổng doanh thu trong khoảng thời gian
     */
    Double getTotalRevenue(LocalDateTime startDate, LocalDateTime endDate);

    /**
     * Đếm số đơn hàng của user
     */
    Long countOrdersByUserId(UUID userId);
}

