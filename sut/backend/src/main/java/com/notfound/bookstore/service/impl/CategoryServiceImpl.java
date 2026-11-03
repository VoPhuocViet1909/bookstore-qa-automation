package com.notfound.bookstore.service.impl;

import com.notfound.bookstore.exception.AppException;
import com.notfound.bookstore.exception.ErrorCode;
import com.notfound.bookstore.model.dto.response.categoryresponse.CategoryResponse;
import com.notfound.bookstore.model.entity.Category;
import com.notfound.bookstore.repository.CategoryRepository;
import com.notfound.bookstore.service.CategoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;

    // Lấy category theo ID
    @Override
    public CategoryResponse getCategory(UUID categoryId) {
        log.info("Fetching category with ID: {}", categoryId);
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND));
        log.info("Found category: {}", category.getName());
        return mapToCategoryResponse(category);
    }

    // Lấy tất cả các Category
    @Override
    public List<CategoryResponse> getAllCategories() {
        log.info("Fetching all categories");
        List<Category> categories = categoryRepository.findAll();
        log.info("Found {} categories", categories.size());

        return categories.stream()
                .map(this::mapToCategoryResponse)
                .collect(Collectors.toList());
    }

    // Lấy tất cả các Category với phân trang
    @Override
    public Page<CategoryResponse> getAllCategories(Pageable pageable) {
        log.info("Fetching categories with pagination - page: {}, size: {}", pageable.getPageNumber(),
                pageable.getPageSize());
        Page<Category> categoryPage = categoryRepository.findAll(pageable);
        log.info("Found {} categories on page {}", categoryPage.getNumberOfElements(), pageable.getPageNumber());

        return categoryPage.map(this::mapToCategoryResponse);
    }

    // Lấy danh sách danh mục phổ biến
    @Override
    @org.springframework.cache.annotation.Cacheable(value = "popular_categories", key = "#limit")
    public List<CategoryResponse> getPopularCategories(Integer limit) {
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(0,
                limit != null ? limit : 5);
        List<Category> categories = categoryRepository.findPopularCategories(pageable);
        return categories.stream()
                .map(this::mapToCategoryResponse)
                .collect(Collectors.toList());
    }

    private CategoryResponse mapToCategoryResponse(Category category) {
        CategoryResponse.CategoryResponseBuilder builder = CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription());

        if (category.getParentCategory() != null) {
            builder.parentCategoryId(category.getParentCategory().getId())
                    .parentCategoryName(category.getParentCategory().getName());
        }

        return builder.build();
    }

    @Override
    public java.util.List<com.notfound.bookstore.model.dto.response.categoryresponse.CategoryWithBookResponse> getAllCategoriesWithSampleBook() {
        log.info("Fetching all categories with sample book");
        java.util.List<Category> categories = categoryRepository.findAll();

        return categories.stream()
                .map(category -> {
                    com.notfound.bookstore.model.dto.response.categoryresponse.CategoryWithBookResponse.CategoryWithBookResponseBuilder builder = com.notfound.bookstore.model.dto.response.categoryresponse.CategoryWithBookResponse
                            .builder()
                            .id(category.getId())
                            .name(category.getName())
                            .description(category.getDescription());

                    // Get one sample book from this category
                    if (category.getBooks() != null && !category.getBooks().isEmpty()) {
                        com.notfound.bookstore.model.entity.Book sampleBook = category.getBooks().get(0);
                        builder.sampleBook(mapToBookResponse(sampleBook));
                    }

                    return builder.build();
                })
                .collect(java.util.stream.Collectors.toList());
    }

    private com.notfound.bookstore.model.dto.response.bookresponse.BookResponse mapToBookResponse(
            com.notfound.bookstore.model.entity.Book book) {
        return com.notfound.bookstore.model.dto.response.bookresponse.BookResponse.builder()
                .id(book.getId().toString())
                .title(book.getTitle())
                .price(book.getPrice())
                .discountPrice(book.getDiscountPrice())
                .imageUrls(book.getImages() != null ? book.getImages().stream()
                        .map(com.notfound.bookstore.model.entity.BookImage::getUrl)
                        .collect(java.util.stream.Collectors.toList()) : java.util.List.of())
                .build();
    }
}
