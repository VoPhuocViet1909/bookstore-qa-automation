package com.notfound.bookstore.service;

import com.notfound.bookstore.model.dto.request.wishlistrequest.AddBookToWishlistRequest;
import com.notfound.bookstore.model.dto.response.wishlistresponse.WishlistResponse;

import java.util.UUID;

public interface WishlistService {
    WishlistResponse getMyWishlist(UUID userId);
    WishlistResponse addBookToWishlist(UUID userId, AddBookToWishlistRequest request);
    void removeBookFromWishlist(UUID userId, UUID bookId);
    void clearWishlist(UUID userId);
    boolean isBookInWishlist(UUID userId, UUID bookId);
}