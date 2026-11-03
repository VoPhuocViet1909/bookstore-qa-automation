package com.notfound.bookstore.model.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.notfound.bookstore.model.enums.Role;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.UuidGenerator;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "users")
@Inheritance(strategy = InheritanceType.JOINED)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@ToString(exclude = {"addresses", "reviews", "cart", "orders", "wishlist", "newsArticles", "notifications"})
public class User {

    @Id
    @UuidGenerator
    UUID id;

    @Column(unique = true, nullable = false)
    String username;

    @Column(nullable = false)
    String password;

    @Column(unique = true, nullable = false)
    String email;

    @Column
    String fullName;

    @Column
    String phoneNumber;

    @Column
    String gender;

    @Column
    String avatar_url;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    Role role;

    @Column(length = 20)
    String status; // active, inactive, banned

    // 1. Audit (Cực kỳ quan trọng)
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false, columnDefinition = "DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6)")
    LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", columnDefinition = "DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)")
    LocalDateTime updatedAt;

    @Column(name = "last_login")
    LocalDateTime lastLogin;

    // 2. Loyalty (Khách hàng thân thiết)
    @Builder.Default
    @Column(name = "points", nullable = false)
    Integer points = 0; // Điểm tích lũy

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "membership_tier")
    MembershipTier membershipTier = MembershipTier.BRONZE;

    // 3. Marketing & Profile
    @Column(name = "date_of_birth")
    LocalDate dateOfBirth; // Để tặng quà sinh nhật

    @Builder.Default
    @Column(name = "is_email_verified")
    Boolean isEmailVerified = false;

    // 4. Social Login (Nếu muốn mở rộng sau này)
    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "auth_provider")
    AuthProvider authProvider = AuthProvider.LOCAL;

    @Column(name = "provider_id")
    String providerId; // ID của Google/Facebook trả về

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    List<Address> addresses;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference
    List<Review> reviews;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    Cart cart;

    @OneToMany(mappedBy = "customer", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    List<Order> orders;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    Wishlist wishlist;

    @OneToMany(mappedBy = "author", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    List<News> newsArticles;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    List<Notification> notifications;

    // Enum định nghĩa hạng thành viên
    public enum MembershipTier {
        BRONZE, SILVER, GOLD, PLATINUM
    }

    // Enum định nghĩa nguồn đăng nhập
    public enum AuthProvider {
        LOCAL, GOOGLE, FACEBOOK
    }

    public User(String username, String password, String email, Role role, String avatar_url) {
        this.username = username;
        this.password = password;
        this.email = email;
        this.role = role;
        this.avatar_url = avatar_url;
    }
}
