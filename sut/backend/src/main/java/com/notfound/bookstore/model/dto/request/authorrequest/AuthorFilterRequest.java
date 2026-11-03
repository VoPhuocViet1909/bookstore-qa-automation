package com.notfound.bookstore.model.dto.request.authorrequest;

import jakarta.validation.constraints.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

/**
 * @Dự án: DHKTPM18B_NotFound_WebSiteBanSach
 * @Class: AuthorFilterRequest
 * @Tạo vào ngày: 11/14/2025
 * @Tác giả: Nguyen Huu Sang
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AuthorFilterRequest {

    String nationality;

    @Min(value = 1000, message = "Năm sinh phải lớn hơn hoặc bằng 1000")
    @Max(value = 2025, message = "Năm sinh không được vượt quá năm hiện tại")
    Integer birthYear; // Năm sinh cụ thể

    @Pattern(regexp = "^(asc|desc)$", message = "Sắp xếp theo tên chỉ được phép là 'asc' hoặc 'desc'", flags = Pattern.Flag.CASE_INSENSITIVE)
    String sortByName; // "asc" hoặc "desc"

    @Pattern(regexp = "^(asc|desc)$", message = "Sắp xếp theo năm sinh chỉ được phép là 'asc' hoặc 'desc'", flags = Pattern.Flag.CASE_INSENSITIVE)
    String sortByBirthYear; // "asc" hoặc "desc"

    @Min(value = 0, message = "Số trang phải lớn hơn hoặc bằng 0")
    @Builder.Default
    int page = 0;

    @Min(value = 1, message = "Kích thước trang phải lớn hơn hoặc bằng 1")
    @Max(value = 100, message = "Kích thước trang không được vượt quá 100")
    @Builder.Default
    int size = 10;
}