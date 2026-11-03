package com.notfound.bookstore.controller;

import com.notfound.bookstore.model.dto.request.bookrequest.BookFilterRequest;
import com.notfound.bookstore.model.dto.request.bookrequest.BookRequest;
import com.notfound.bookstore.model.dto.request.bookrequest.BookSearchRequest;
import com.notfound.bookstore.model.dto.request.bookrequest.BookSortRequest;
import com.notfound.bookstore.model.dto.response.ApiResponse;
import com.notfound.bookstore.model.dto.response.bookresponse.BookResponse;
import com.notfound.bookstore.model.dto.response.bookresponse.BookSummaryResponse;
import com.notfound.bookstore.model.dto.response.bookresponse.PageResponse;
import com.notfound.bookstore.model.dto.response.categoryresponse.CategoryBooksResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import com.notfound.bookstore.service.BookService;
import java.util.List;

/**
 * Controller xử lý các chức năng liên quan đến sách
 */
@RestController
@RequestMapping("/api/books")
@RequiredArgsConstructor
public class BookController {

        private final BookService bookService;

        @GetMapping
        public ApiResponse<PageResponse<BookSummaryResponse>> getAllBooks(
                        @RequestParam(required = false) Integer page,
                        @RequestParam(required = false) Integer pageSize) {
                return ApiResponse.<PageResponse<BookSummaryResponse>>builder()
                                .code(1000)
                                .message("Lấy danh sách sách thành công")
                                .result(bookService.getAllBooks(page, pageSize))
                                .build();
        }

        @GetMapping("/options")
        public ApiResponse<PageResponse<BookSummaryResponse>> getAllBookOptions(
                @Valid @ModelAttribute BookRequest bookRequest) {
            return ApiResponse.<PageResponse<BookSummaryResponse>>builder()
                    .code(1000)
                    .message("Lấy danh sách sách thành công")
                    .result(bookService.getAllBooksOption(bookRequest))
                    .build();
        }

        @GetMapping("/search")
        public ApiResponse<PageResponse<BookSummaryResponse>> searchBooks(
                        @RequestParam(required = false) String keyword,
                        @RequestParam(required = false, defaultValue = "0") Integer page,
                        @RequestParam(required = false, defaultValue = "10") Integer size) {
                BookSearchRequest request = new BookSearchRequest();
                request.setKeyword(keyword);
                request.setPage(page);
                request.setSize(size);

                return ApiResponse.<PageResponse<BookSummaryResponse>>builder()
                                .code(1000)
                                .message("Tìm kiếm sách thành công")
                                .result(bookService.searchBooks(request))
                                .build();
        }

        @GetMapping("/filter")
        public ApiResponse<PageResponse<BookSummaryResponse>> filterBooks(
                        @Valid @ModelAttribute BookFilterRequest request) {
                return ApiResponse.<PageResponse<BookSummaryResponse>>builder()
                                .code(1000)
                                .message("Lọc sách thành công")
                                .result(bookService.findByFilters(request))
                                .build();
        }

        @GetMapping("/sorted")
        public ApiResponse<PageResponse<BookSummaryResponse>> getSortedBooks(
                        @ModelAttribute BookSortRequest request) {
                return ApiResponse.<PageResponse<BookSummaryResponse>>builder()
                                .code(1000)
                                .message("Sắp xếp sách thành công")
                                .result(bookService.getSortedBooks(request))
                                .build();
        }

        @GetMapping("/{id}")
        public ApiResponse<BookResponse> getBookById(@PathVariable String id) {
                return ApiResponse.<BookResponse>builder()
                                .code(1000)
                                .message("Lấy thông tin sách thành công")
                                .result(bookService.getBookById(id))
                                .build();
        }

        @GetMapping("/best-selling")
        public ApiResponse<List<BookSummaryResponse>> getBestSellingBooks(
                        @RequestParam(required = false, defaultValue = "10") Integer limit) {
                return ApiResponse.<List<BookSummaryResponse>>builder()
                                .code(1000)
                                .message("Lấy danh sách sách bán chạy thành công")
                                .result(bookService.getBestSellingBooks(limit))
                                .build();
        }

        @GetMapping("/suggested")
        public ApiResponse<List<BookSummaryResponse>> getSuggestedBooks(
                        @RequestParam(required = false, defaultValue = "10") Integer limit) {
                return ApiResponse.<List<BookSummaryResponse>>builder()
                                .code(1000)
                                .message("Lấy danh sách sách gợi ý thành công")
                                .result(bookService.getSuggestedBooks(limit))
                                .build();
        }

        @GetMapping("/by-popular-categories")
        public ApiResponse<List<CategoryBooksResponse>> getBooksByPopularCategories(
                        @RequestParam(required = false, defaultValue = "5") Integer categoryLimit,
                        @RequestParam(required = false, defaultValue = "5") Integer bookLimit) {
                return ApiResponse.<List<CategoryBooksResponse>>builder()
                                .code(1000)
                                .message("Lấy danh sách sách theo danh mục phổ biến thành công")
                                .result(bookService.getBooksByPopularCategories(categoryLimit, bookLimit))
                                .build();
        }

        /**
         * Lấy danh sách sách theo ID danh mục
         * 
         * @param categoryId ID của danh mục
         * @param page       Số trang (mặc định: 0)
         * @param pageSize   Kích thước trang (mặc định: 10)
         * @return Danh sách sách thuộc danh mục
         */
        @GetMapping("/by-category/{categoryId}")
        public ApiResponse<PageResponse<BookSummaryResponse>> getBooksByCategory(
                        @PathVariable String categoryId,
                        @RequestParam(required = false, defaultValue = "0") Integer page,
                        @RequestParam(required = false, defaultValue = "10") Integer pageSize) {
                return ApiResponse.<PageResponse<BookSummaryResponse>>builder()
                                .code(1000)
                                .message("Lấy danh sách sách theo danh mục thành công")
                                .result(bookService.getBooksByCategory(categoryId, page, pageSize))
                                .build();
        }
}
