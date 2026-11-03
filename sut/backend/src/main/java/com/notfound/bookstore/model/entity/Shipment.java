package com.notfound.bookstore.model.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.UuidGenerator;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "shipments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@ToString(exclude = "order")
public class Shipment {

    @Id
    @UuidGenerator
    UUID shipmentID;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    Order order;

    @Column(name = "carrier", nullable = false)
    String carrier = "GHN";

    @Column(name = "ghn_order_code", unique = true, nullable = false)
    String ghnOrderCode;

    @Column(name = "sorting_code")
    String sortingCode;

    @Column(name = "ghn_total_fee", nullable = false)
    Double ghnTotalFee;

    @Column(name = "expected_delivery_time")
    LocalDateTime expectedDeliveryTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    ShipmentStatus status = ShipmentStatus.PENDING;

    @Column(name = "to_name")
    String toName;

    @Column(name = "to_phone")
    String toPhone;

    @Column(name = "to_address")
    String toAddress;

    @Column(name = "to_ward_code")
    String toWardCode;

    @Column(name = "to_district_id")
    String toDistrictId;

    @Column(name = "cod_amount")
    Integer codAmount;

    @Column(name = "note", columnDefinition = "TEXT")
    String note;

    // Timestamp cho các trạng thái
    @Column(name = "picked_at")
    LocalDateTime pickedAt;

    @Column(name = "delivered_at")
    LocalDateTime deliveredAt;

    @Column(name = "returned_at")
    LocalDateTime returnedAt;

    @Column(name = "cancelled_at")
    LocalDateTime cancelledAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    LocalDateTime updatedAt;

    public enum ShipmentStatus {
        PENDING,
        READY_TO_PICK,
        PICKING,
        PICKED,
        STORING,
        DELIVERING,
        DELIVERED,
        RETURNED,
        CANCELLED,
        EXCEPTION
    }
}