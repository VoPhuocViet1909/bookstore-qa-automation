package com.notfound.bookstore.model.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.UuidGenerator;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "news")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"author", "images"})
@FieldDefaults(level = AccessLevel.PRIVATE)
public class News {

    @Id
    @UuidGenerator
    UUID newsID;

    @Column(nullable = false)
    String title;

    // Tóm tắt ngắn gọn
    @Column(columnDefinition = "TEXT")
    String summary;

    // THAY ĐỔI: Lưu HTML content
    @Column(columnDefinition = "LONGTEXT", nullable = false)
    String content; // HTML content

    // MỚI: Lưu metadata dạng JSON (cho Table of Contents, SEO...)
    @Column(columnDefinition = "TEXT")
    String metadata; // JSON string: {sections: [...], description: "..."}

    // Category: Sách mới, Tác giả, Sự kiện, Khuyến mãi, Review, Hướng dẫn...
    @Column(nullable = false)
    String category;

    // Tags: Danh sách từ khóa để tìm kiếm (lưu dưới dạng JSON array)
    @Convert(converter = com.notfound.bookstore.model.converter.StringListConverter.class)
    @Column(columnDefinition = "JSON")
    List<String> tags = new ArrayList<>();

    // Số lượt xem
    @Column(nullable = false, columnDefinition = "BIGINT DEFAULT 0")
    Long views = 0L;

    // Đánh dấu tin nổi bật
    @Column(nullable = false, columnDefinition = "BOOLEAN DEFAULT FALSE")
    Boolean featured = false;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    Status status;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false)
    LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    User author;

    @OneToMany(mappedBy = "news", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    List<NewsImage> images = new ArrayList<>();

    public enum Status {
        DRAFT, PUBLISHED, ARCHIVED
    }

    public News(String title, String content, String image, User author) {
        this.title = title;
        this.content = content;
        this.author = author;
        this.status = Status.DRAFT;
    }
}
