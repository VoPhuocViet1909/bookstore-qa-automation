package com.notfound.bookstore.model.dto.request.authorrequest;

import jakarta.validation.constraints.*;
import lombok.*;
import lombok.experimental.FieldDefaults;


/**
 * @Dự án: DHKTPM18B_NotFound_WebSiteBanSach
 * @Class: AuthorSearchRequest
 * @Tạo vào ngày: 11/14/2025
 * @Tác giả: Nguyen Huu Sang
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AuthorSearchRequest {

    String name;

    @Min(value = 0, message = "Số trang phải lớn hơn hoặc bằng 0")
    @Builder.Default
    int page = 0;

    @Min(value = 1, message = "Kích thước trang phải lớn hơn hoặc bằng 1")
    @Max(value = 100, message = "Kích thước trang không được vượt quá 100")
    @Builder.Default
    int size = 10;
}