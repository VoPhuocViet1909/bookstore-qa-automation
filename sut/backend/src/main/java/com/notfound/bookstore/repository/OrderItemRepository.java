package com.notfound.bookstore.repository;

import com.notfound.bookstore.model.entity.CartItem;
import com.notfound.bookstore.model.entity.Order;
import com.notfound.bookstore.model.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, UUID> {
    //Tìm theo Order entity
    List<OrderItem> findByOrder(Order order);

    // Dùng OrderOrderID thay vì OrderId
    List<OrderItem> findByOrderOrderID(UUID orderId);

    // Hoặc dùng @Query (rõ ràng hơn)
    @Query("SELECT oi FROM OrderItem oi WHERE oi.order.orderID = :orderId")
    List<OrderItem> findByOrderId(@Param("orderId") UUID orderId);

    // Tìm theo book
    List<OrderItem> findByBookId(UUID bookId);

    // Tổng quantity của một book đã bán
    @Query("SELECT COALESCE(SUM(oi.quantity), 0) FROM OrderItem oi WHERE oi.book.id = :bookId")
    Long getTotalQuantitySoldByBook(@Param("bookId") UUID bookId);

    // Tổng revenue của một book
    @Query("SELECT COALESCE(SUM(oi.subtotal), 0) FROM OrderItem oi WHERE oi.book.id = :bookId")
    Double getTotalRevenueByBook(@Param("bookId") UUID bookId);
}
