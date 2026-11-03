package com.notfound.bookstore.service.impl;

import com.notfound.bookstore.model.entity.Book;
import com.notfound.bookstore.model.entity.Cart;
import com.notfound.bookstore.model.entity.CartItem;
import com.notfound.bookstore.model.entity.User;
import com.notfound.bookstore.repository.BookRepository;
import com.notfound.bookstore.repository.CartItemRepository;
import com.notfound.bookstore.repository.CartRepository;
import com.notfound.bookstore.repository.UserRepository;
import com.notfound.bookstore.service.CartService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;

    @Override
    public Cart getCartByUserId(UUID userId) {
        // Tìm cart theo userId thay vì dùng user.getCart() để tránh lazy loading issue
        return cartRepository.findByUserId(userId)
                .orElseGet(() -> {
                    // Nếu chưa có cart, tạo mới
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

                    Cart cart = new Cart();
                    cart.setUser(user);
                    return cartRepository.save(cart);
                });
    }

    @Override
    @Transactional
    public CartItem addBookToCart(UUID userId, UUID bookId, Integer quantity) {
        if (quantity == null || quantity <= 0) {
            throw new IllegalArgumentException("Số lượng phải lớn hơn 0");
        }

        // Lấy giỏ hàng của user
        Cart cart = getCartByUserId(userId);

        // Kiểm tra sách có tồn tại không
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sách"));

        // Kiểm tra tồn kho
        if (book.getStockQuantity() < quantity) {
            throw new RuntimeException("Không đủ hàng trong kho. Chỉ còn " + book.getStockQuantity() + " sản phẩm");
        }

        // Kiểm tra sách đã có trong giỏ chưa
        CartItem cartItem = cartItemRepository.findByCartIdAndBookId(cart.getCartID(), bookId)
                .orElse(null);

        if (cartItem != null) {
            // Nếu đã có, cập nhật số lượng
            int newQuantity = cartItem.getQuantity() + quantity;

            // Kiểm tra lại tồn kho với số lượng mới
            if (book.getStockQuantity() < newQuantity) {
                throw new RuntimeException("Không đủ hàng trong kho. Chỉ còn " + book.getStockQuantity() + " sản phẩm");
            }

            cartItem.setQuantity(newQuantity);
            return cartItemRepository.save(cartItem);
        } else {
            // Nếu chưa có, thêm mới
            cartItem = new CartItem(cart, book, quantity);
            return cartItemRepository.save(cartItem);
        }
    }

    @Override
    @Transactional
    public CartItem updateCartItemQuantity(UUID userId, UUID bookId, Integer quantity) {
        if (quantity == null || quantity <= 0) {
            throw new IllegalArgumentException("Số lượng phải lớn hơn 0");
        }

        Cart cart = getCartByUserId(userId);

        CartItem cartItem = cartItemRepository.findByCartIdAndBookId(cart.getCartID(), bookId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm trong giỏ hàng"));

        Book book = cartItem.getBook();

        // Kiểm tra tồn kho
        if (book.getStockQuantity() < quantity) {
            throw new RuntimeException("Không đủ hàng trong kho. Chỉ còn " + book.getStockQuantity() + " sản phẩm");
        }

        cartItem.setQuantity(quantity);
        return cartItemRepository.save(cartItem);
    }

    @Override
    @Transactional
    public void removeBookFromCart(UUID userId, UUID bookId) {
        Cart cart = getCartByUserId(userId);
        cartItemRepository.deleteByCartIdAndBookId(cart.getCartID(), bookId);
    }

    @Override
    @Transactional
    public void clearCart(UUID userId) {
        Cart cart = getCartByUserId(userId);
        cartItemRepository.deleteAllByCartId(cart.getCartID());
    }

    @Override
    public List<CartItem> getCartItems(UUID userId) {
        Cart cart = getCartByUserId(userId);
        return cartItemRepository.findByCartCartID(cart.getCartID());
    }

    @Override
    public Long getCartItemCount(UUID userId) {
        Cart cart = getCartByUserId(userId);
        return cartItemRepository.countByCartCartID(cart.getCartID());
    }

    @Override
    public Double getCartTotal(UUID userId) {
        Cart cart = getCartByUserId(userId);
        List<CartItem> items = cartItemRepository.findByCartCartID(cart.getCartID());
        return items.stream()
                .mapToDouble(CartItem::getSubTotal)
                .sum();
    }

    @Override
    public boolean isBookInCart(UUID userId, UUID bookId) {
        Cart cart = getCartByUserId(userId);
        return cartItemRepository.findByCartIdAndBookId(cart.getCartID(), bookId).isPresent();
    }
}
