package com.notfound.bookstore.service;

import com.notfound.bookstore.model.entity.Cart;
import com.notfound.bookstore.model.entity.CartItem;

import java.util.List;
import java.util.UUID;

public interface CartService {

    // Lấy giỏ hàng của user
    Cart getCartByUserId(UUID userId);

    // Thêm sách vào giỏ hàng
    CartItem addBookToCart(UUID userId, UUID bookId, Integer quantity);

    // Cập nhật số lượng sách trong giỏ
    CartItem updateCartItemQuantity(UUID userId, UUID bookId, Integer quantity);

    // Xóa sách khỏi giỏ hàng
    void removeBookFromCart(UUID userId, UUID bookId);

    // Xóa toàn bộ giỏ hàng
    void clearCart(UUID userId);

    // Lấy tất cả items trong giỏ
    List<CartItem> getCartItems(UUID userId);

    // Đếm số lượng items trong giỏ
    Long getCartItemCount(UUID userId);

    // Tính tổng giá trị giỏ hàng
    Double getCartTotal(UUID userId);

    // Kiểm tra sách có trong giỏ không
    boolean isBookInCart(UUID userId, UUID bookId);
}

