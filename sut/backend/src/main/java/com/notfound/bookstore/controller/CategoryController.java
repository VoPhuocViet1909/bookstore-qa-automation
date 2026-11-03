package com.notfound.bookstore.controller;

import com.notfound.bookstore.model.dto.response.ApiResponse;
import com.notfound.bookstore.model.dto.response.categoryresponse.CategoryResponse;
import com.notfound.bookstore.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

/**
 * Controller xử lý các chức năng liên quan đến thể loại sách
 * Cung cấp API để xem thông tin và danh sách thể loại cho người dùng
 */
@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    /**
     * Lấy thông tin chi tiết của một thể loại
     *
     * @param categoryId ID của thể loại cần lấy thông tin
     * @return Thông tin chi tiết của thể loại
     */
    @GetMapping("/{categoryId}")
    public ApiResponse<CategoryResponse> getCategory(@PathVariable UUID categoryId) {
        CategoryResponse response = categoryService.getCategory(categoryId);
        return ApiResponse.<CategoryResponse>builder()
                .code(1000)
                .message("Lấy thông tin thể loại thành công")
                .result(response)
                .build();
    }

    /**
     * Lấy danh sách tất cả thể loại
     * Trả về danh sách đầy đủ không phân trang
     *
     * @return Danh sách tất cả thể loại
     */
    @GetMapping
    public ApiResponse<List<CategoryResponse>> getAllCategories() {
        List<CategoryResponse> response = categoryService.getAllCategories();
        return ApiResponse.<List<CategoryResponse>>builder()
                .code(1000)
                .message("Lấy danh sách thể loại thành công")
                .result(response)
                .build();
    }

    /**
     * Lấy danh sách thể loại có phân trang
     * Hỗ trợ phân trang để hiển thị danh sách thể loại
     *
     * @param page Số trang (mặc định: 0)
     * @param size Kích thước trang (mặc định: 10)
     * @return Danh sách thể loại được phân trang
     */
    @GetMapping("/paged")
    public ApiResponse<Page<CategoryResponse>> getAllCategoriesPaged(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<CategoryResponse> response = categoryService.getAllCategories(pageable);
        return ApiResponse.<Page<CategoryResponse>>builder()
                .code(1000)
                .message("Lấy danh sách thể loại thành công")
                .result(response)
                .build();
    }

    /**
     * Lấy danh sách thể loại phổ biến
     *
     * @param limit Số lượng thể loại muốn lấy (mặc định: 5)
     * @return Danh sách thể loại phổ biến
     */
    @GetMapping("/popular")
    public ApiResponse<List<CategoryResponse>> getPopularCategories(
            @RequestParam(required = false, defaultValue = "5") Integer limit) {
        return ApiResponse.<List<CategoryResponse>>builder()
                .code(1000)
                .message("Lấy danh sách thể loại phổ biến thành công")
                .result(categoryService.getPopularCategories(limit))
                .build();
    }

    /**
     * Lấy tất cả danh mục kèm theo 1 cuốn sách mẫu
     * Dùng để hiển thị ảnh và tiêu đề sách trên giao diện
     *
     * @return Danh sách tất cả danh mục với sách mẫu
     */
    @GetMapping("/with-sample-book")
    public ApiResponse<List<com.notfound.bookstore.model.dto.response.categoryresponse.CategoryWithBookResponse>> getAllCategoriesWithSampleBook() {
        return ApiResponse.<List<com.notfound.bookstore.model.dto.response.categoryresponse.CategoryWithBookResponse>>builder()
                .code(1000)
                .message("Lấy danh sách thể loại với sách mẫu thành công")
                .result(categoryService.getAllCategoriesWithSampleBook())
                .build();
    }

}
