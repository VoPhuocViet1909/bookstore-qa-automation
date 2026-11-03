package com.notfound.bookstore.repository;

import com.notfound.bookstore.model.entity.Order;
import com.notfound.bookstore.model.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface OrderRepository extends JpaRepository<Order, UUID> {
    // Tìm orders theo customer
    List<Order> findByCustomerId(UUID customerId);

    // Tìm orders theo customer với phân trang
    Page<Order> findByCustomerId(UUID customerId, Pageable pageable);

    // Tìm orders theo status
    List<Order> findByStatus(OrderStatus status);

    // Tìm orders theo customer và status
    List<Order> findByCustomerIdAndStatus(UUID customerId, OrderStatus status);

    // Tính tổng tiền theo customer
    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.customer.id = :customerId")
    Double getTotalAmountByCustomer(@Param("customerId") UUID customerId);

    // Đếm số orders theo customer
    Long countByCustomerId(UUID customerId);

    // ===== THỐNG KÊ THEO DATE RANGE =====
    
    // Tìm orders theo status và date range
    @Query("SELECT o FROM Order o WHERE o.status = :status AND o.orderDate >= :startDate AND o.orderDate <= :endDate")
    List<Order> findByStatusAndOrderDateBetween(@Param("status") OrderStatus status, 
                                                @Param("startDate") LocalDateTime startDate, 
                                                @Param("endDate") LocalDateTime endDate);

    // Tính tổng doanh thu trong khoảng thời gian
    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE " +
           "(o.status = com.notfound.bookstore.model.enums.OrderStatus.COMPLETED OR " +
           "o.status = com.notfound.bookstore.model.enums.OrderStatus.DELIVERED) AND " +
           "o.orderDate >= :startDate AND o.orderDate <= :endDate")
    Double getTotalRevenueByDateRange(@Param("startDate") LocalDateTime startDate, 
                                      @Param("endDate") LocalDateTime endDate);

    // Tìm tất cả orders trong khoảng thời gian
    @Query("SELECT o FROM Order o WHERE o.orderDate >= :startDate AND o.orderDate <= :endDate")
    List<Order> findByOrderDateBetween(@Param("startDate") LocalDateTime startDate, 
                                       @Param("endDate") LocalDateTime endDate);
}
