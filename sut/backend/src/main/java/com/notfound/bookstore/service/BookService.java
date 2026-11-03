package com.notfound.bookstore.service;

import com.notfound.bookstore.model.dto.request.bookrequest.BookFilterRequest;
import com.notfound.bookstore.model.dto.request.bookrequest.BookRequest;
import com.notfound.bookstore.model.dto.request.bookrequest.BookSearchRequest;
import com.notfound.bookstore.model.dto.request.bookrequest.BookSortRequest;
import com.notfound.bookstore.model.dto.response.bookresponse.BookResponse;
import com.notfound.bookstore.model.dto.response.bookresponse.BookSummaryResponse;
import com.notfound.bookstore.model.dto.response.bookresponse.PageResponse;

import java.util.List;

public interface BookService {

    // Tìm kiếm sách theo từ khóa (tên sách, tác giả, hoặc thể loại)
    PageResponse<BookSummaryResponse> searchBooks(BookSearchRequest request);

    // Lọc sách theo các tiêu chí: giá, đánh giá trung bình và ngày phát hành
    PageResponse<BookSummaryResponse> findByFilters(BookFilterRequest request);

    // Lấy danh sách sách được sắp xếp theo loại sắp xếp được chỉ định
    PageResponse<BookSummaryResponse> getSortedBooks(BookSortRequest request);

    // Lấy tất cả sách với phân trang
    PageResponse<BookSummaryResponse> getAllBooks(Integer page, Integer pageSize);

    // Lấy thông tin chi tiết của một cuốn sách dựa trên ID
    BookResponse getBookById(String id);

    // Lấy danh sách sách bán chạy nhất
    List<BookSummaryResponse> getBestSellingBooks(Integer limit);

    PageResponse<BookSummaryResponse> getAllBooksOption(BookRequest bookRequest);

    // Lấy danh sách sách gợi ý cho bạn
    List<BookSummaryResponse> getSuggestedBooks(Integer limit);

    // Lấy danh sách sách theo danh mục phổ biến
    List<com.notfound.bookstore.model.dto.response.categoryresponse.CategoryBooksResponse> getBooksByPopularCategories(
            Integer categoryLimit, Integer bookLimit);

    // Lấy danh sách sách theo ID danh mục
    PageResponse<BookSummaryResponse> getBooksByCategory(String categoryId, Integer page, Integer pageSize);
}
