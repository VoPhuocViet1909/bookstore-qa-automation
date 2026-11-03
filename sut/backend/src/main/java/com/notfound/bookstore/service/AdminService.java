package com.notfound.bookstore.service;

import com.notfound.bookstore.model.dto.request.bookrequest.CreateBookRequest;
import com.notfound.bookstore.model.dto.request.bookrequest.UpdateBookRequest;
import com.notfound.bookstore.model.dto.request.categoryrequest.CreateCategoryRequest;
import com.notfound.bookstore.model.dto.request.categoryrequest.UpdateCategoryRequest;
import com.notfound.bookstore.model.dto.response.bookresponse.BookFullDetailResponse;
import com.notfound.bookstore.model.dto.response.categoryresponse.CategoryResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

public interface AdminService {
    BookFullDetailResponse createBook(CreateBookRequest request);

    BookFullDetailResponse updateBook(UUID bookId, UpdateBookRequest request);

    void deleteBook(UUID bookId);

    BookFullDetailResponse getBookDetail(UUID bookId);

    Page<BookFullDetailResponse> getAllBooks(Pageable pageable);

    BookFullDetailResponse uploadBookImages(UUID bookId, List<MultipartFile> images);

    void deleteBookImage(UUID bookId, Long imageId);

    CategoryResponse createCategory(CreateCategoryRequest request);

    CategoryResponse updateCategory(UUID categoryId, UpdateCategoryRequest request);

    void deleteCategory(UUID categoryId);

    CategoryResponse getCategory(UUID categoryId);

    List<CategoryResponse> getAllCategories();

    Page<CategoryResponse> getAllCategories(Pageable pageable);

    String uploadAvatar(MultipartFile image);

    com.notfound.bookstore.model.dto.response.statistics.RevenueStatisticResponse getRevenueStatistics(java.time.LocalDate fromDate, java.time.LocalDate toDate);
}
