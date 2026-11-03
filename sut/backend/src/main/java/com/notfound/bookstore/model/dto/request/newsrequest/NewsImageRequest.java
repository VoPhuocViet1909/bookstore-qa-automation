package com.notfound.bookstore.model.dto.request.newsrequest;

import lombok.*;
import lombok.experimental.FieldDefaults;


/**
 * @Dự án: DHKTPM18B_NotFound_WebSiteBanSach
 * @Class: NewsImageRequest
 * @Tạo vào ngày: 11/14/2025
 * @Tác giả: Nguyen Huu Sang
 */


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class NewsImageRequest {
    String url;
    String alt;
    String caption;
    Integer priority; // Dùng priority thay vì displayOrder
}