package com.notfound.bookstore.model.dto.response.newsresponse;


import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * @Dự án: DHKTPM18B_NotFound_WebSiteBanSach
 * @Class: NewsResponse
 * @Tạo vào ngày: 11/15/2025
 * @Tác giả: Nguyen Huu Sang
 */

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class NewsResponse {

    UUID newsID;
    String title;
    String summary; // Tóm tắt ngắn
    String content; // HTML content
    NewsMetadata metadata; // Parsed metadata
    String status;
    
    // Category và Tags
    String category;
    List<String> tags;
    
    // Thống kê
    Long views;
    Boolean featured;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    LocalDateTime createdAt;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    LocalDateTime updatedAt;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    LocalDateTime publishedAt;

    // Thông tin tác giả
    String authorName;
    UUID authorId;

    // Danh sách hình ảnh (đã sắp xếp)
    List<NewsImageResponse> images;
}