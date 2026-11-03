package com.notfound.bookstore.service;

import com.notfound.bookstore.model.dto.response.categoryresponse.CategoryResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface CategoryService {
    // Lấy category theo ID
    CategoryResponse getCategory(UUID categoryId);

    // Lấy tất cả các Category
    List<CategoryResponse> getAllCategories();

    // Lấy tất cả các Category với phân trang
    Page<CategoryResponse> getAllCategories(Pageable pageable);

    // Lấy danh sách danh mục phổ biến
    List<CategoryResponse> getPopularCategories(Integer limit);

    // Lấy tất cả danh mục kèm theo 1 cuốn sách mẫu
    List<com.notfound.bookstore.model.dto.response.categoryresponse.CategoryWithBookResponse> getAllCategoriesWithSampleBook();
}
