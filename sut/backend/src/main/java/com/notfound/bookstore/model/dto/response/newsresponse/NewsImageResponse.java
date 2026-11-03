package com.notfound.bookstore.model.dto.response.newsresponse;

import lombok.*;
import lombok.experimental.FieldDefaults;

/**
 * @Dự án: DHKTPM18B_NotFound_WebSiteBanSach
 * @Class: NewsImageResponse
 * @Tạo vào ngày: 11/14/2025
 * @Tác giả: Nguyen Huu Sang
 */

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class NewsImageResponse {
    Long id;
    String url;
    Integer priority;
    java.time.LocalDateTime uploadedAt;  // ✅ Thêm uploadedAt như BookImage
}