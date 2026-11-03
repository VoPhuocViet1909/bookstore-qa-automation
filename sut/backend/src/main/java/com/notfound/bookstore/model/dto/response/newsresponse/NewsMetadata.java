package com.notfound.bookstore.model.dto.response.newsresponse;

import lombok.*;
import lombok.experimental.FieldDefaults;
import java.util.List;

/**
 * @Dự án: DHKTPM18B_NotFound_WebSiteBanSach
 * @Class: NewsMetadata
 * @Tạo vào ngày: 11/15/2025
 * @Tác giả: Nguyen Huu Sang
 */


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class NewsMetadata {

    String description; // Mô tả ngắn cho SEO
    List<TableOfContentItem> sections; // Mục lục
    List<NewsLink> links; // Danh sách link trong bài viết

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TableOfContentItem {
        String id;       // section-1, section-2...
        String title;    // "1. Giá trị dinh dưỡng"
        Integer level;   // 2, 3, 4 (h2, h3, h4)
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NewsLink {
        String text;     // "Toeic 1"
        String url;      // "/books/toeic-1"
        String type;     // "book", "product", "external"
    }
}