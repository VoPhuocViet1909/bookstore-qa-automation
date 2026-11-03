package com.notfound.bookstore.model.dto.request.wishlistrequest;

import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AddBookToWishlistRequest {

    @NotNull(message = "Book ID is required")
    UUID bookId;
}