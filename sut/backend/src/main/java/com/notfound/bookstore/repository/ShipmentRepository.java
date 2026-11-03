package com.notfound.bookstore.repository;

import com.notfound.bookstore.model.entity.Order;
import com.notfound.bookstore.model.entity.Shipment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ShipmentRepository extends JpaRepository<Shipment, UUID> {
    Optional<Shipment> findByOrder_OrderID(UUID orderId);
    Optional<Shipment> findByGhnOrderCode(String ghnOrderCode);
    boolean existsByOrder(Order order);
}