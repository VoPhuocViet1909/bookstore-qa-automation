package com.notfound.bookstore.model.dto.request.authorrequest;

import jakarta.validation.constraints.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AuthorRequest {

    @NotBlank(message = "Tên tác giả không được để trống")
    @Size(min = 2, max = 200, message = "Tên tác giả phải có độ dài từ 2 đến 200 ký tự")
    String name;

    @Size(max = 5000, message = "Tiểu sử không được vượt quá 5000 ký tự")
    String biography;

    @PastOrPresent(message = "Ngày sinh không được là ngày trong tương lai")
    LocalDate dateOfBirth;

    @Size(min = 2, max = 100, message = "Quốc tịch phải có độ dài từ 2 đến 100 ký tự")
    String nationality;
}