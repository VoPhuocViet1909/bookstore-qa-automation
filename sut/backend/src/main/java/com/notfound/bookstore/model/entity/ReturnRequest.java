package com.notfound.bookstore.model.entity;

import com.notfound.bookstore.model.enums.ReturnStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UuidGenerator;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "return_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@ToString(exclude = "order")
public class ReturnRequest {

    @Id
    @UuidGenerator
    UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    Order order; // Đơn hàng nào

    @Column(nullable = false)
    String reason; // Lý do: "Sách rách", "Giao sai"...

    @Column(columnDefinition = "TEXT")
    String note; // Ghi chú của khách

    @Column(columnDefinition = "TEXT")
    String proofImage; // URL ảnh chụp sách hỏng

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    ReturnStatus status = ReturnStatus.PENDING; // PENDING, APPROVED, REJECTED, REFUNDED

    @Column(name = "refund_amount")
    Double refundAmount; // Số tiền hoàn lại

    @Column(name = "admin_note", columnDefinition = "TEXT")
    String adminNote; // Lý do từ chối (Admin nhập)

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    LocalDateTime createdAt; // Thời điểm khách tạo yêu cầu

    @Column(name = "resolved_at")
    LocalDateTime resolvedAt; // Thời điểm Admin xử lý (approve/reject)

    @Column(name = "refunded_at")
    LocalDateTime refundedAt; // Thời điểm hoàn tiền thành công
}
