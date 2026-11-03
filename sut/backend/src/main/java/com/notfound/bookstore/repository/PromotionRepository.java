package com.notfound.bookstore.repository;

import com.notfound.bookstore.model.entity.Book;
import com.notfound.bookstore.model.entity.Promotion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
@Repository
public interface PromotionRepository extends JpaRepository<Promotion, UUID> {
    @Query("SELECT p FROM Promotion p WHERE p.code = :code AND " +
            "p.status = 'ACTIVE' AND " +
            "p.startDate <= :today AND p.endDate >= :today AND " +
            "p.usageCount < p.usageLimit")
    Optional<Promotion> findValidPromotionByCode(@Param("code") String code,
                                                 @Param("today") LocalDate today);

    // Sửa: Dùng LocalDate
    @Query("SELECT p FROM Promotion p WHERE " +
            "p.status = 'ACTIVE' AND " +
            "p.startDate <= :today AND p.endDate >= :today")
    List<Promotion> findActivePromotions(@Param("today") LocalDate today);

    // Thêm: Tìm theo code
    Optional<Promotion> findByCode(String code);

    // Thêm: Tìm promotions áp dụng cho book
    @Query("SELECT p FROM Promotion p JOIN p.applicableBooks b " +
            "WHERE b.id = :bookId AND p.status = 'ACTIVE' AND " +
            "p.startDate <= :today AND p.endDate >= :today")
    List<Promotion> findActivePromotionsByBook(@Param("bookId") UUID bookId,
                                               @Param("today") LocalDate today);

}
