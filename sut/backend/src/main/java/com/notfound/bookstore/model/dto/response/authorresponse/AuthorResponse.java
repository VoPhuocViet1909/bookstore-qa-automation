package com.notfound.bookstore.model.dto.response.authorresponse;

/**
 * @Dự án: DHKTPM18B_NotFound_WebSiteBanSach
 * @Class: AuthorResponse
 * @Tạo vào ngày: 11/13/2025
 * @Tác giả: Nguyen Huu Sang
 */

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AuthorResponse {
    UUID id;
    String name;
    String biography;
    LocalDate dateOfBirth;
    String nationality;
    int bookCount;
}