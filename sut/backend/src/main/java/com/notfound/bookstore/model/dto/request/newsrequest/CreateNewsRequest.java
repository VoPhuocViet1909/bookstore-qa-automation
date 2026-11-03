package com.notfound.bookstore.model.dto.request.newsrequest;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

/**
 * @Dự án: DHKTPM18B_NotFound_WebSiteBanSach
 * @Class: CreateNewsRequest
 * @Tạo vào ngày: 11/15/2025
 * @Tác giả: Nguyen Huu Sang
 */

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CreateNewsRequest {

    @NotBlank(message = "Title is required")
    String title;

    @NotBlank(message = "Content is required")
    String content; // HTML content

    // Tóm tắt ngắn
    String summary;

    // Danh mục tin tức (required)
    @NotBlank(message = "Category is required")
    String category;

    // Tags (JSON array hoặc List<String>)
    List<String> tags;

    // Tin nổi bật
    Boolean featured;

    // Trạng thái (PUBLISHED, DRAFT, ARCHIVED)
    String status;

    // Optional: metadata JSON string
    String metadata;

    // Danh sách URL hình ảnh (theo thứ tự)
    List<NewsImageRequest> images;
}