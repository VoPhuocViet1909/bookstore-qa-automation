package com.notfound.bookstore.service.impl;

import com.notfound.bookstore.exception.AppException;
import com.notfound.bookstore.exception.ErrorCode;
import com.notfound.bookstore.model.dto.request.reviewrequest.CreateReviewRequest;
import com.notfound.bookstore.model.dto.response.reviewresponse.ReviewResponse;
import com.notfound.bookstore.model.entity.Book;
import com.notfound.bookstore.model.entity.Review;
import com.notfound.bookstore.model.entity.User;
import com.notfound.bookstore.model.mapper.ReviewMapper;
import com.notfound.bookstore.repository.BookRepository;
import com.notfound.bookstore.repository.ReviewRepository;

import com.notfound.bookstore.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ReviewServiceImpl implements com.notfound.bookstore.service.ReviewService {
    ReviewRepository reviewRepository;
    ReviewMapper reviewMapper;
    UserRepository userRepository;
    BookRepository bookRepository;

    @Transactional
    @Override
    public ReviewResponse addReviewBook(CreateReviewRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        Book book = bookRepository.findById(request.getBookId())
                .orElseThrow(() -> new AppException(ErrorCode.BOOK_NOT_FOUND));
        Review review = reviewMapper.toEntity(request, user, book);
        Review savedReview = reviewRepository.save(review);
        return reviewMapper.toResponse(savedReview);
    }

    @Override
    public Page<ReviewResponse> getReviewsByBookId(UUID bookId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Review> reviews = reviewRepository.findByBookIdOrderByCreatedAtDesc(bookId, pageable);

        return reviews.map(reviewMapper::toResponse);
    }
}
