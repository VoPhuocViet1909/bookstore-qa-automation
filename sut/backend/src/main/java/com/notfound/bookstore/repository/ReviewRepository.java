package com.notfound.bookstore.repository;

import com.notfound.bookstore.model.entity.Book;
import com.notfound.bookstore.model.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;
@Repository
public interface ReviewRepository extends JpaRepository<Review, UUID> {
    // Đánh giá của sách
    @Query("SELECT r FROM Review r WHERE r.book.id = :bookId ORDER BY r.createdAt DESC")
    Page<Review> findByBookIdOrderByCreatedAtDesc(@Param("bookId") UUID bookId, Pageable pageable);

    // Kiểm tra user đã đánh giá chưa
    Optional<Review> findByBookIdAndUserId(UUID bookId, UUID userId);
    boolean existsByBookIdAndUserId(UUID bookId, UUID userId);

    // Tính trung bình sao
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.book.id = :bookId")
    Double calculateAverageRating(UUID bookId);

    // Đếm số đánh giá
    Long countByBookId(UUID bookId);

    // Đánh giá theo số sao
    Long countByBookIdAndRating(UUID bookId, Integer rating);
}
