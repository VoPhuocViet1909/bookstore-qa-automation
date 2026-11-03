package com.notfound.bookstore.controller;

import com.notfound.bookstore.model.dto.request.reviewrequest.CreateReviewRequest;
import com.notfound.bookstore.model.dto.response.ApiResponse;
import com.notfound.bookstore.model.dto.response.reviewresponse.ReviewResponse;
import com.notfound.bookstore.service.ReviewService;
import com.notfound.bookstore.service.impl.ReviewServiceImpl;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * Controller xử lý các chức năng liên quan đến đánh giá sách
 * Cho phép người dùng thêm đánh giá và xem danh sách đánh giá của sách
 */
@RestController
@RequestMapping("/api/review")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ReviewController {
    ReviewService reviewService;

    /**
     * Thêm đánh giá mới cho một cuốn sách
     * Người dùng cần đăng nhập và đã mua sách mới có thể đánh giá
     *
     * @param request Thông tin đánh giá bao gồm bookId, rating (1-5 sao), content
     * @return Thông tin đánh giá vừa được tạo
     */
    @PostMapping("/book/add")
    public ApiResponse<ReviewResponse> addReviewBook(@Valid @RequestBody CreateReviewRequest request) {
        ReviewResponse review = reviewService.addReviewBook(request);
        return ApiResponse.<ReviewResponse>builder()
                .code(1000)
                .message("Thêm đánh giá thành công")
                .result(review)
                .build();
    }

    /**
     * Lấy danh sách đánh giá của một cuốn sách
     * Hỗ trợ phân trang để hiển thị danh sách đánh giá
     *
     * @param bookId ID của sách cần xem đánh giá
     * @param page Số trang (mặc định: 0)
     * @param size Kích thước trang (mặc định: 10)
     * @return Danh sách đánh giá được phân trang bao gồm thông tin người đánh giá, rating, nội dung và thời gian
     */
    @GetMapping("/book/{bookId}")
    public ApiResponse<Page<ReviewResponse>> getListReviewByBookId(
            @PathVariable UUID bookId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<ReviewResponse> reviews = reviewService.getReviewsByBookId(bookId, page, size);
        return ApiResponse.<Page<ReviewResponse>>builder()
                .code(1000)
                .message("Lấy danh sách đánh giá thành công")
                .result(reviews)
                .build();
    }
}
