package com.notfound.bookstore.controller;

import com.notfound.bookstore.model.dto.request.cartrequest.AddToCartRequest;
import com.notfound.bookstore.model.dto.request.cartrequest.UpdateCartItemRequest;
import com.notfound.bookstore.model.dto.request.orderrequest.CheckoutRequest;
import com.notfound.bookstore.model.dto.response.ApiResponse;
import com.notfound.bookstore.model.dto.response.cartresponse.*;
import com.notfound.bookstore.model.dto.response.orderresponse.OrderResponse;
import com.notfound.bookstore.model.entity.Cart;
import com.notfound.bookstore.model.entity.CartItem;
import com.notfound.bookstore.model.entity.User;
import com.notfound.bookstore.model.mapper.CartMapper;
import com.notfound.bookstore.repository.UserRepository;
import com.notfound.bookstore.service.CartService;
import com.notfound.bookstore.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;
    private final CartMapper cartMapper;
    private final UserRepository userRepository;
    private final OrderService orderService;

    /**
     * Lấy thông tin giỏ hàng
     */
    @GetMapping
    public ApiResponse<CartResponse> getCart(@AuthenticationPrincipal Jwt jwt) {

        if (jwt == null) {
            return ApiResponse.<CartResponse>builder()
                    .code(4001)
                    .message("Vui lòng đăng nhập")
                    .build();
        }

        String username = jwt.getSubject();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));

        Cart cart = cartService.getCartByUserId(user.getId());
        List<CartItem> items = cartService.getCartItems(user.getId());

        if (items.isEmpty()) {
            CartResponse emptyCart = CartResponse.builder()
                    .cartId(cart.getCartID())
                    .userId(user.getId())
                    .items(List.of())
                    .itemCount(0L)
                    .totalPrice(0.0)
                    .build();

            return ApiResponse.<CartResponse>builder()
                    .code(1000)
                    .message("Không có sản phẩm trong giỏ hàng")
                    .result(emptyCart)
                    .build();
        }

        CartResponse cartResponse = cartMapper.toCartResponse(cart, items);

        return ApiResponse.<CartResponse>builder()
                .code(1000)
                .message("Lấy giỏ hàng thành công")
                .result(cartResponse)
                .build();
    }

    /**
     * Thêm sách vào giỏ hàng
     */
    @PostMapping("/add")
    public ApiResponse<AddToCartResponse> addToCart(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody AddToCartRequest request) {

        if (jwt == null) {
            return ApiResponse.<AddToCartResponse>builder()
                    .code(4001)
                    .message("Vui lòng đăng nhập")
                    .build();
        }

        try {
            String username = jwt.getSubject();
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User không tồn tại"));

            CartItem cartItem = cartService.addBookToCart(
                    user.getId(),
                    request.getBookId(),
                    request.getQuantity()
            );

            CartItemResponse cartItemResponse = cartMapper.toCartItemResponse(cartItem);
            Long itemCount = cartService.getCartItemCount(user.getId());

            AddToCartResponse response = AddToCartResponse.builder()
                    .cartItem(cartItemResponse)
                    .cartItemCount(itemCount)
                    .build();

            return ApiResponse.<AddToCartResponse>builder()
                    .code(1000)
                    .message("Đã thêm sản phẩm vào giỏ hàng")
                    .result(response)
                    .build();
        } catch (RuntimeException e) {
            return ApiResponse.<AddToCartResponse>builder()
                    .code(4003)
                    .message(e.getMessage())
                    .build();
        }
    }

    /**
     * Cập nhật số lượng sản phẩm trong giỏ
     */
    @PutMapping("/update/{bookId}")
    public ApiResponse<UpdateCartResponse> updateCartItem(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID bookId,
            @Valid @RequestBody UpdateCartItemRequest request) {

        if (jwt == null) {
            return ApiResponse.<UpdateCartResponse>builder()
                    .code(4001)
                    .message("Vui lòng đăng nhập")
                    .build();
        }

        try {
            String username = jwt.getSubject();
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User không tồn tại"));

            CartItem cartItem = cartService.updateCartItemQuantity(
                    user.getId(),
                    bookId,
                    request.getQuantity()
            );

            CartItemResponse cartItemResponse = cartMapper.toCartItemResponse(cartItem);
            Double totalPrice = cartService.getCartTotal(user.getId());

            UpdateCartResponse response = UpdateCartResponse.builder()
                    .cartItem(cartItemResponse)
                    .totalPrice(totalPrice)
                    .build();

            return ApiResponse.<UpdateCartResponse>builder()
                    .code(1000)
                    .message("Đã cập nhật số lượng")
                    .result(response)
                    .build();
        } catch (RuntimeException e) {
            return ApiResponse.<UpdateCartResponse>builder()
                    .code(4003)
                    .message(e.getMessage())
                    .build();
        }
    }

    /**
     * Xóa sản phẩm khỏi giỏ hàng
     */
    @DeleteMapping("/remove/{bookId}")
    public ApiResponse<RemoveCartResponse> removeFromCart(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID bookId) {

        if (jwt == null) {
            return ApiResponse.<RemoveCartResponse>builder()
                    .code(4001)
                    .message("Vui lòng đăng nhập")
                    .build();
        }

        try {
            String username = jwt.getSubject();
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User không tồn tại"));

            cartService.removeBookFromCart(user.getId(), bookId);

            Long itemCount = cartService.getCartItemCount(user.getId());
            Double totalPrice = cartService.getCartTotal(user.getId());

            RemoveCartResponse response = RemoveCartResponse.builder()
                    .cartItemCount(itemCount)
                    .totalPrice(totalPrice)
                    .build();

            String message = itemCount == 0
                    ? "Đã xóa sản phẩm. Giỏ hàng hiện đang trống"
                    : "Đã xóa sản phẩm khỏi giỏ hàng";

            return ApiResponse.<RemoveCartResponse>builder()
                    .code(1000)
                    .message(message)
                    .result(response)
                    .build();
        } catch (RuntimeException e) {
            return ApiResponse.<RemoveCartResponse>builder()
                    .code(4004)
                    .message(e.getMessage())
                    .build();
        }
    }

    /**
     * Xóa toàn bộ giỏ hàng
     */
    @DeleteMapping("/clear")
    public ApiResponse<Void> clearCart(@AuthenticationPrincipal Jwt jwt) {
        if (jwt == null) {
            return ApiResponse.<Void>builder()
                    .code(4001)
                    .message("Vui lòng đăng nhập")
                    .build();
        }

        try {
            String username = jwt.getSubject();
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User không tồn tại"));

            Long itemCount = cartService.getCartItemCount(user.getId());

            if (itemCount == 0) {
                return ApiResponse.<Void>builder()
                        .code(1000)
                        .message("Giỏ hàng đã trống")
                        .build();
            }

            cartService.clearCart(user.getId());

            return ApiResponse.<Void>builder()
                    .code(1000)
                    .message("Đã xóa toàn bộ giỏ hàng")
                    .build();
        } catch (RuntimeException e) {
            return ApiResponse.<Void>builder()
                    .code(4004)
                    .message(e.getMessage())
                    .build();
        }
    }

    /**
     * Lấy số lượng items trong giỏ
     */
    @GetMapping("/count")
    public ApiResponse<Long> getCartItemCount(@AuthenticationPrincipal Jwt jwt) {
        if (jwt == null) {
            return ApiResponse.<Long>builder()
                    .code(1000)
                    .result(0L)
                    .build();
        }

        String username = jwt.getSubject();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));

        Long count = cartService.getCartItemCount(user.getId());

        return ApiResponse.<Long>builder()
                .code(1000)
                .message("Lấy số lượng items thành công")
                .result(count)
                .build();
    }

    /**
     * Kiểm tra sách có trong giỏ không
     */
    @GetMapping("/check/{bookId}")
    public ApiResponse<Boolean> checkBookInCart(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID bookId) {

        if (jwt == null) {
            return ApiResponse.<Boolean>builder()
                    .code(1000)
                    .result(false)
                    .build();
        }

        String username = jwt.getSubject();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));

        boolean inCart = cartService.isBookInCart(user.getId(), bookId);

        return ApiResponse.<Boolean>builder()
                .code(1000)
                .message("Kiểm tra sách trong giỏ hàng thành công")
                .result(inCart)
                .build();
    }

    /**
     * Checkout giỏ hàng (tạo đơn hàng từ giỏ hàng)
     */
    @PostMapping("/checkout")
    public ApiResponse<OrderResponse> checkout(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody(required = false) CheckoutRequest request) {

        if (jwt == null) {
            return ApiResponse.<OrderResponse>builder()
                    .code(4001)
                    .message("Vui lòng đăng nhập")
                    .build();
        }

        try {
            String username = jwt.getSubject();
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User không tồn tại"));

            // Nếu không có request body, tạo mặc định
            if (request == null) {
                request = CheckoutRequest.builder()
                        .paymentMethod("COD")
                        .build();
            }

            // Validate paymentMethod
            if (request.getPaymentMethod() == null || request.getPaymentMethod().trim().isEmpty()) {
                return ApiResponse.<OrderResponse>builder()
                        .code(4003)
                        .message("Vui lòng chọn phương thức thanh toán")
                        .build();
            }

            OrderResponse orderResponse = orderService.checkout(user.getId(), request);

            return ApiResponse.<OrderResponse>builder()
                    .code(1000)
                    .message("Đặt hàng thành công")
                    .result(orderResponse)
                    .build();
        } catch (RuntimeException e) {
            return ApiResponse.<OrderResponse>builder()
                    .code(4005)
                    .message(e.getMessage())
                    .build();
        }
    }
}
