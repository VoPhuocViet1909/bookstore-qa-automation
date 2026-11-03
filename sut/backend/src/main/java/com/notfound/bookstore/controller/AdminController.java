package com.notfound.bookstore.controller;

import com.notfound.bookstore.model.dto.request.bookrequest.CreateBookRequest;
import com.notfound.bookstore.model.dto.request.bookrequest.UpdateBookRequest;
import com.notfound.bookstore.model.dto.request.categoryrequest.CreateCategoryRequest;
import com.notfound.bookstore.model.dto.request.categoryrequest.UpdateCategoryRequest;
import com.notfound.bookstore.model.dto.response.ApiResponse;
import com.notfound.bookstore.model.dto.response.bookresponse.BookFullDetailResponse;
import com.notfound.bookstore.model.dto.response.categoryresponse.CategoryResponse;
import com.notfound.bookstore.model.dto.response.statistics.RevenueStatisticResponse;
import com.notfound.bookstore.service.AdminService;
import java.time.LocalDate;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

/**
 * Controller xử lý các chức năng quản trị cho hệ thống bookstore
 * Bao gồm quản lý sách và thể loại sách
 */
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AdminController {

    AdminService adminService;

    /**
     * Tạo mới một cuốn sách
     *
     * @param request Thông tin sách cần tạo
     * @return Thông tin chi tiết của sách vừa được tạo
     */
    @PostMapping("/books")
    public ApiResponse<BookFullDetailResponse> createBook(@Valid @RequestBody CreateBookRequest request) {
        BookFullDetailResponse response = adminService.createBook(request);
        return ApiResponse.<BookFullDetailResponse>builder()
                .code(1000)
                .message("Tạo sách thành công")
                .result(response)
                .build();
    }

    /**
     * Cập nhật thông tin sách
     *
     * @param bookId ID của sách cần cập nhật
     * @param request Thông tin cập nhật
     * @return Thông tin chi tiết của sách sau khi cập nhật
     */
    @PutMapping("/books/{bookId}")
    public ApiResponse<BookFullDetailResponse> updateBook(
            @PathVariable UUID bookId,
            @Valid @RequestBody UpdateBookRequest request) {
        BookFullDetailResponse response = adminService.updateBook(bookId, request);
        return ApiResponse.<BookFullDetailResponse>builder()
                .code(1000)
                .message("Cập nhật sách thành công")
                .result(response)
                .build();
    }

    /**
     * Xóa sách khỏi hệ thống
     *
     * @param bookId ID của sách cần xóa
     * @return Kết quả xóa sách
     */
    @DeleteMapping("/books/{bookId}")
    public ApiResponse<Void> deleteBook(@PathVariable UUID bookId) {
        adminService.deleteBook(bookId);
        return ApiResponse.<Void>builder()
                .code(1000)
                .message("Xóa sách thành công")
                .build();
    }

    @GetMapping("/books/{bookId}")
    public ApiResponse<BookFullDetailResponse> getBookDetail(@PathVariable UUID bookId) {
        BookFullDetailResponse response = adminService.getBookDetail(bookId);
        return ApiResponse.<BookFullDetailResponse>builder()
                .code(1000)
                .message("Lấy thông tin sách thành công")
                .result(response)
                .build();
    }

    /**
     *  DƯ VÌ LẤY TẤT CẢ CÁC SÁCH NẰM Ở BOOKCONTROLLER
     */
    @GetMapping("/books")
    public ApiResponse<Page<BookFullDetailResponse>> getAllBooks(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<BookFullDetailResponse> response = adminService.getAllBooks(pageable);
        return ApiResponse.<Page<BookFullDetailResponse>>builder()
                .code(1000)
                .message("Lấy danh sách sách thành công")
                .result(response)
                .build();
    }

    /**
     * Upload nhiều ảnh cho một cuốn sách
     *
     * @param bookId ID của sách cần upload ảnh
     * @param images Danh sách file ảnh cần upload
     * @return Thông tin chi tiết của sách sau khi upload ảnh
     */
    @PostMapping("/books/{bookId}/images")
    public ApiResponse<BookFullDetailResponse> uploadBookImages(
            @PathVariable UUID bookId,
            @RequestParam("images") List<MultipartFile> images) {
        BookFullDetailResponse response = adminService.uploadBookImages(bookId, images);
        return ApiResponse.<BookFullDetailResponse>builder()
                .code(1000)
                .message("Upload ảnh thành công")
                .result(response)
                .build();
    }

    /**
     * Xóa một ảnh của sách
     *
     * @param bookId ID của sách
     * @param imageId ID của ảnh cần xóa
     * @return Kết quả xóa ảnh
     */
    @DeleteMapping("/books/{bookId}/images/{imageId}")
    public ApiResponse<Void> deleteBookImage(
            @PathVariable UUID bookId,
            @PathVariable Long imageId) {
        adminService.deleteBookImage(bookId, imageId);
        return ApiResponse.<Void>builder()
                .code(1000)
                .message("Xóa ảnh thành công")
                .build();
    }

    /**
     * Tạo mới thể loại sách
     *
     * @param request Thông tin thể loại cần tạo
     * @return Thông tin thể loại vừa được tạo
     */
    @PostMapping("/categories")
    public ApiResponse<CategoryResponse> createCategory(@Valid @RequestBody CreateCategoryRequest request) {
        CategoryResponse response = adminService.createCategory(request);
        return ApiResponse.<CategoryResponse>builder()
                .code(1000)
                .message("Tạo thể loại thành công")
                .result(response)
                .build();
    }

    /**
     * Cập nhật thông tin thể loại
     *
     * @param categoryId ID của thể loại cần cập nhật
     * @param request Thông tin cập nhật
     * @return Thông tin thể loại sau khi cập nhật
     */
    @PutMapping("/categories/{categoryId}")
    public ApiResponse<CategoryResponse> updateCategory(
            @PathVariable UUID categoryId,
            @Valid @RequestBody UpdateCategoryRequest request) {
        CategoryResponse response = adminService.updateCategory(categoryId, request);
        return ApiResponse.<CategoryResponse>builder()
                .code(1000)
                .message("Cập nhật thể loại thành công")
                .result(response)
                .build();
    }

    /**
     * Xóa thể loại khỏi hệ thống
     *
     * @param categoryId ID của thể loại cần xóa
     * @return Kết quả xóa thể loại
     */
    @DeleteMapping("/categories/{categoryId}")
    public ApiResponse<Void> deleteCategory(@PathVariable UUID categoryId) {
        adminService.deleteCategory(categoryId);
        return ApiResponse.<Void>builder()
                .code(1000)
                .message("Xóa thể loại thành công")
                .build();
    }

    /**
     *  DƯ VÌ LẤY THÔNG TIN CATEGORIES NẰM Ở CATEGORYCONTROLLER
     */
    @GetMapping("/categories/{categoryId}")
    public ApiResponse<CategoryResponse> getCategory(@PathVariable UUID categoryId) {
        CategoryResponse response = adminService.getCategory(categoryId);
        return ApiResponse.<CategoryResponse>builder()
                .code(1000)
                .message("Lấy thông tin thể loại thành công")
                .result(response)
                .build();
    }

    /**
     *  DƯ VÌ LẤY THÔNG TIN CATEGORIES NẰM Ở CATEGORYCONTROLLER
     */
    @GetMapping("/categories")
    public ApiResponse<List<CategoryResponse>> getAllCategories() {
        List<CategoryResponse> response = adminService.getAllCategories();
        return ApiResponse.<List<CategoryResponse>>builder()
                .code(1000)
                .message("Lấy danh sách thể loại thành công")
                .result(response)
                .build();
    }

    /**
     *  DƯ VÌ LẤY THÔNG TIN CATEGORIES NẰM Ở CATEGORYCONTROLLER
     */
    @GetMapping("/categories/paged")
    public ApiResponse<Page<CategoryResponse>> getAllCategoriesPaged(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<CategoryResponse> response = adminService.getAllCategories(pageable);
        return ApiResponse.<Page<CategoryResponse>>builder()
                .code(1000)
                .message("Lấy danh sách thể loại thành công")
                .result(response)
                .build();
    }

    /**
     * Upload avatar for user
     *
     * @param image Avatar image file
     * @return Cloudinary URL of uploaded image
     */
    @PostMapping("/upload/avatar")
    public ApiResponse<String> uploadAvatar(@RequestParam("image") MultipartFile image) {
        String avatarUrl = adminService.uploadAvatar(image);
        return ApiResponse.<String>builder()
                .code(1000)
                .message("Upload avatar thành công")
                .result(avatarUrl)
                .build();
    }

    @GetMapping("/statistics/revenue")
    public ApiResponse<RevenueStatisticResponse> getRevenueStatistics(
            @RequestParam(required = false) LocalDate startDate,
            @RequestParam(required = false) LocalDate endDate
    ) {
        if (startDate == null) startDate = LocalDate.now().withDayOfMonth(1);
        if (endDate == null) endDate = LocalDate.now();
        RevenueStatisticResponse response = adminService.getRevenueStatistics(startDate, endDate);
        return ApiResponse.<RevenueStatisticResponse>builder()
                .code(1000)
                .message("Lấy thống kê doanh thu thành công")
                .result(response)
                .build();
    }
}
