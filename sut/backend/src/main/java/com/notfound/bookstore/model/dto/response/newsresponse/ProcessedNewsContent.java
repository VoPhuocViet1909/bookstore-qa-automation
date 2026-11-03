package com.notfound.bookstore.model.dto.response.newsresponse;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * @Dự án: DHKTPM18B_NotFound_WebSiteBanSach
 * @Class: ProcessedNewsContent
 * @Tạo vào ngày: 11/23/2025
 * @Tác giả: Nguyen Huu Sang
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProcessedNewsContent {
    String htmlContent; // HTML đã được thêm ID
    String metadataJson;
}