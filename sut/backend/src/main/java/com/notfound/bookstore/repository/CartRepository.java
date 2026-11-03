package com.notfound.bookstore.repository;

import com.notfound.bookstore.model.entity.Book;
import com.notfound.bookstore.model.entity.Cart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;
@Repository
public interface CartRepository extends JpaRepository<Cart, UUID> {
    // Đếm số lượng item trong giỏ
    Long countByCartID(UUID cartId);

    // Tìm cart theo user ID
    Optional<Cart> findByUserId(UUID userId);
}
