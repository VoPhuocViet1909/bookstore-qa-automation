package com.notfound.bookstore.model.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UuidGenerator;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "notifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@ToString(exclude = "user")
public class Notification {

    @Id
    @UuidGenerator
    UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    User user; // Thông báo cho ai

    @Column(nullable = false)
    String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    String message;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    NotificationType type; // ORDER, PROMOTION, SYSTEM, RETURN_REQUEST...

    @Column(name = "is_read", nullable = false)
    Boolean isRead = false; // Đã đọc chưa

    @Column(name = "reference_id")
    UUID referenceId; // ID của Order/Promotion/ReturnRequest liên quan

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    LocalDateTime createdAt;

    @Column(name = "read_at")
    LocalDateTime readAt; // Thời điểm đánh dấu đã đọc

    // Enum định nghĩa loại thông báo
    public enum NotificationType {
        ORDER,          // Thông báo về đơn hàng
        PROMOTION,      // Thông báo khuyến mãi/Flash Sale
        RETURN_REQUEST, // Thông báo về yêu cầu trả hàng
        SYSTEM,         // Thông báo hệ thống
        REVIEW,         // Thông báo về đánh giá
        ACCOUNT         // Thông báo về tài khoản
    }

    // Helper method để đánh dấu đã đọc
    public void markAsRead() {
        this.isRead = true;
        this.readAt = LocalDateTime.now();
    }
}

