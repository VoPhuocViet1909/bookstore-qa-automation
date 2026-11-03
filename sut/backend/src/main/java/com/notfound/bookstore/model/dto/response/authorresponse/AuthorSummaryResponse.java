package com.notfound.bookstore.model.dto.response.authorresponse;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.util.UUID;

/**
 * @Dự án: DHKTPM18B_NotFound_WebSiteBanSach
 * @Class: AuthorSummaryResponse
 * @Tạo vào ngày: 11/14/2025
 * @Tác giả: Nguyen Huu Sang
 */

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AuthorSummaryResponse {
    UUID id;
    String name;
    String biography;
    LocalDate dateOfBirth;
    String nationality;
    long bookCount;
}