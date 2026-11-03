package com.notfound.bookstore.controller;

import com.notfound.bookstore.model.dto.request.wishlistrequest.AddBookToWishlistRequest;
import com.notfound.bookstore.model.dto.response.ApiResponse;
import com.notfound.bookstore.model.dto.response.wishlistresponse.BookInWishlistResponse;
import com.notfound.bookstore.model.dto.response.wishlistresponse.WishlistResponse;
import com.notfound.bookstore.security.SecurityUtils;
import com.notfound.bookstore.service.WishlistService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/wishlist")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class WishlistController {

    WishlistService wishlistService;
    SecurityUtils securityUtils;

    @GetMapping
    public ApiResponse<WishlistResponse> getMyWishlist() {
        UUID userId = securityUtils.getCurrentUser().getId();
        return ApiResponse.<WishlistResponse>builder()
                .result(wishlistService.getMyWishlist(userId))
                .build();
    }

    @PostMapping("/add")
    public ApiResponse<WishlistResponse> addBookToWishlist(
            @Valid @RequestBody AddBookToWishlistRequest request) {
        UUID userId = securityUtils.getCurrentUser().getId();
        return ApiResponse.<WishlistResponse>builder()
                .result(wishlistService.addBookToWishlist(userId, request))
                .build();
    }

    @DeleteMapping("/remove/{bookId}")
    public ApiResponse<Void> removeBookFromWishlist(@PathVariable UUID bookId) {
        UUID userId = securityUtils.getCurrentUser().getId();
        wishlistService.removeBookFromWishlist(userId, bookId);
        return ApiResponse.<Void>builder()
                .message("Removed book from wishlist successfully")
                .build();
    }

    @DeleteMapping("/clear")
    public ApiResponse<Void> clearWishlist() {
        UUID userId = securityUtils.getCurrentUser().getId();
        wishlistService.clearWishlist(userId);
        return ApiResponse.<Void>builder()
                .message("Cleared wishlist successfully")
                .build();
    }

    @GetMapping("/check/{bookId}")
    public ApiResponse<BookInWishlistResponse> checkBookInWishlist(@PathVariable UUID bookId) {
        UUID userId = securityUtils.getCurrentUser().getId();
        boolean isInWishlist = wishlistService.isBookInWishlist(userId, bookId);

        BookInWishlistResponse response = BookInWishlistResponse.builder()
                .bookId(bookId)
                .inWishlist(isInWishlist)
                .build();

        return ApiResponse.<BookInWishlistResponse>builder()
                .result(response)
                .build();
    }
}