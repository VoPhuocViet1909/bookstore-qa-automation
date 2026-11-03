package com.notfound.bookstore.model.dto.response.wishlistresponse;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BookInWishlistResponse {
    UUID bookId;
    boolean inWishlist;
}