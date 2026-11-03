package com.notfound.bookstore.repository;

import com.notfound.bookstore.model.entity.Book;
import com.notfound.bookstore.model.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CategoryRepository extends JpaRepository<Category, UUID> {
    // Kiểm tra tên trùng
    boolean existsByName(String name);

    Optional<Category> findByName(String name);

    // Kiểm tra category có sách không (để xóa)
    @Query("SELECT CASE WHEN COUNT(b) > 0 THEN true ELSE false END FROM Book b JOIN b.categories c WHERE c.id = :categoryId")
    boolean hasBooks(@Param("categoryId") UUID categoryId);

    // Danh mục phổ biến (theo số lượng sách bán ra)
    @Query("SELECT c FROM Category c " +
            "JOIN c.books b " +
            "JOIN b.orderItems oi " +
            "GROUP BY c.id " +
            "ORDER BY SUM(oi.quantity) DESC")
    java.util.List<Category> findPopularCategories(org.springframework.data.domain.Pageable pageable);
}
