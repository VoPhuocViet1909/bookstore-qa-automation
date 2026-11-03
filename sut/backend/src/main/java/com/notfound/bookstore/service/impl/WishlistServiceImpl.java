package com.notfound.bookstore.service.impl;

import com.notfound.bookstore.exception.AppException;
import com.notfound.bookstore.exception.ErrorCode;
import com.notfound.bookstore.model.dto.request.wishlistrequest.AddBookToWishlistRequest;
import com.notfound.bookstore.model.dto.response.bookresponse.BookSummaryResponse;
import com.notfound.bookstore.model.dto.response.wishlistresponse.WishlistResponse;
import com.notfound.bookstore.model.entity.Book;
import com.notfound.bookstore.model.entity.User;
import com.notfound.bookstore.model.entity.Wishlist;
import com.notfound.bookstore.model.mapper.BookMapper;
import com.notfound.bookstore.repository.BookRepository;
import com.notfound.bookstore.repository.UserRepository;
import com.notfound.bookstore.repository.WishlistRepository;
import com.notfound.bookstore.service.WishlistService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class WishlistServiceImpl implements WishlistService {

    WishlistRepository wishlistRepository;
    UserRepository userRepository;
    BookRepository bookRepository;
    BookMapper bookMapper;

    @Override
    @Transactional(readOnly = true)
    public WishlistResponse getMyWishlist(UUID userId) {
        Wishlist wishlist = getOrCreateWishlist(userId);
        return buildWishlistResponse(wishlist);
    }

    @Override
    @Transactional
    public WishlistResponse addBookToWishlist(UUID userId, AddBookToWishlistRequest request) {
        Wishlist wishlist = getOrCreateWishlist(userId);

        Book book = bookRepository.findById(request.getBookId())
                .orElseThrow(() -> new AppException(ErrorCode.BOOK_NOT_FOUND));

        if (wishlist.getBooks() == null) {
            wishlist.setBooks(new ArrayList<>());
        }

        if (wishlist.getBooks().stream().anyMatch(b -> b.getId().equals(book.getId()))) {
            throw new AppException(ErrorCode.BOOK_ALREADY_IN_WISHLIST);
        }

        wishlist.getBooks().add(book);
        wishlistRepository.save(wishlist);

        log.info("Added book {} to wishlist of user {}", book.getId(), userId);
        return buildWishlistResponse(wishlist);
    }

    @Override
    @Transactional
    public void removeBookFromWishlist(UUID userId, UUID bookId) {
        Wishlist wishlist = getOrCreateWishlist(userId);

        if (wishlist.getBooks() == null || wishlist.getBooks().isEmpty()) {
            throw new AppException(ErrorCode.WISHLIST_EMPTY);
        }

        boolean removed = wishlist.getBooks().removeIf(book -> book.getId().equals(bookId));

        if (!removed) {
            throw new AppException(ErrorCode.BOOK_NOT_IN_WISHLIST);
        }

        wishlistRepository.save(wishlist);
        log.info("Removed book {} from wishlist of user {}", bookId, userId);
    }

    @Override
    @Transactional
    public void clearWishlist(UUID userId) {
        Wishlist wishlist = getOrCreateWishlist(userId);

        if (wishlist.getBooks() != null) {
            wishlist.getBooks().clear();
            wishlistRepository.save(wishlist);
            log.info("Cleared wishlist of user {}", userId);
        }
    }

    private Wishlist getOrCreateWishlist(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        return wishlistRepository.findByUser_Id(userId)
                .orElseGet(() -> {
                    Wishlist newWishlist = new Wishlist(user);
                    return wishlistRepository.save(newWishlist);
                });
    }

    private WishlistResponse buildWishlistResponse(Wishlist wishlist) {
        List<BookSummaryResponse> bookResponses = wishlist.getBooks() != null
                ? wishlist.getBooks().stream()
                .map(bookMapper::toBookSummaryResponse)
                .collect(Collectors.toList())
                : new ArrayList<>();

        return WishlistResponse.builder()
                .wishlistId(wishlist.getWishlistID())
                .userId(wishlist.getUser().getId())
                .createdAt(wishlist.getCreatedAt())
                .books(bookResponses)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isBookInWishlist(UUID userId, UUID bookId) {
        Optional<Wishlist> wishlistOpt = wishlistRepository.findByUser_Id(userId);

        if (wishlistOpt.isEmpty() || wishlistOpt.get().getBooks() == null) {
            return false;
        }

        return wishlistOpt.get().getBooks().stream()
                .anyMatch(book -> book.getId().equals(bookId));
    }
}