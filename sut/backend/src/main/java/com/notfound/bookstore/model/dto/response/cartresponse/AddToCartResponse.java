package com.notfound.bookstore.model.dto.response.cartresponse;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AddToCartResponse {
    private CartItemResponse cartItem;
    private Long cartItemCount;
}
