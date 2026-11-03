package com.notfound.bookstore.repository;

import com.notfound.bookstore.model.entity.Cart;
import com.notfound.bookstore.model.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, UUID> {
    // Dùng CartCartID và BookBookID
    Optional<CartItem> findByCartCartIDAndBookId(UUID cartId, UUID bookId);

    // Hoặc dùng @Query (rõ ràng hơn)
    @Query("SELECT ci FROM CartItem ci WHERE ci.cart.cartID = :cartId AND ci.book.id = :bookId")
    Optional<CartItem> findByCartIdAndBookId(@Param("cartId") UUID cartId, @Param("bookId") UUID bookId);

    // Tìm tất cả items trong giỏ
    List<CartItem> findByCartCartID(UUID cartId);

    // Xóa tất cả item trong giỏ
    @Modifying
    @Query("DELETE FROM CartItem ci WHERE ci.cart.cartID = :cartId")
    void deleteAllByCartId(@Param("cartId") UUID cartId);

    // Đếm số items trong giỏ
    Long countByCartCartID(UUID cartId);

    // Xóa item theo book
    @Modifying
    @Query("DELETE FROM CartItem ci WHERE ci.cart.cartID = :cartId AND ci.book.id = :bookId")
    void deleteByCartIdAndBookId(@Param("cartId") UUID cartId, @Param("bookId") UUID bookId);

}
