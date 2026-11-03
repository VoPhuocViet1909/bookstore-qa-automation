package com.notfound.bookstore.model.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UuidGenerator;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "reviews")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = {"user", "book"})
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Review {

    @Id
    @UuidGenerator
    @Column(name = "review_id")
    UUID reviewID;

    @Column(columnDefinition = "TEXT")
    String comment;

    @Column(nullable = false)
    Integer rating;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false)
    LocalDateTime createdAt;

    @Column(name = "is_verified_purchase", nullable = false)
    Boolean isVerifiedPurchase = false; // True nếu user đã mua sách này

    @Column(name = "helpful_count")
    Integer helpfulCount = 0; // Số người thấy review hữu ích

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonBackReference
    User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "book_id", nullable = false)
    @JsonBackReference
    Book book;

    public Review(String comment, Integer rating, User user, Book book) {
        this.comment = comment;
        this.rating = rating;
        this.user = user;
        this.book = book;
    }
}
