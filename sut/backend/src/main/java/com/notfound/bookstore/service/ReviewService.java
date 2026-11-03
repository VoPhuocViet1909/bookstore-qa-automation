package com.notfound.bookstore.service;

import com.notfound.bookstore.model.dto.request.reviewrequest.CreateReviewRequest;
import com.notfound.bookstore.model.dto.response.reviewresponse.ReviewResponse;
import org.springframework.data.domain.Page;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

public interface ReviewService {
    @Transactional
    ReviewResponse addReviewBook(CreateReviewRequest request);

    Page<ReviewResponse> getReviewsByBookId(UUID bookId, int page, int size);
}
