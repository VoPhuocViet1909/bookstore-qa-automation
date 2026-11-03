package com.notfound.bookstore.model.mapper;

import com.notfound.bookstore.model.dto.response.cartresponse.CartItemResponse;
import com.notfound.bookstore.model.dto.response.cartresponse.CartResponse;
import com.notfound.bookstore.model.entity.Cart;
import com.notfound.bookstore.model.entity.CartItem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.util.List;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface CartMapper {

    @Mapping(target = "itemId", source = "itemID")
    @Mapping(target = "bookId", source = "book.id")
    @Mapping(target = "bookTitle", source = "book.title")
    @Mapping(target = "bookIsbn", source = "book.isbn")
    @Mapping(target = "bookPrice", source = "book.price")
    @Mapping(target = "bookDiscountPrice", source = "book.discountPrice")
    @Mapping(target = "bookImageUrl", source = "book", qualifiedByName = "getBookImageUrl")
    @Mapping(target = "quantity", source = "quantity")
    @Mapping(target = "subTotal", source = "subTotal")
    @Mapping(target = "stockQuantity", source = "book.stockQuantity")
    CartItemResponse toCartItemResponse(CartItem cartItem);

    @Named("getBookImageUrl")
    default String getBookImageUrl(com.notfound.bookstore.model.entity.Book book) {
        return book.getImages() != null && !book.getImages().isEmpty()
                ? book.getImages().get(0).getUrl()
                : null;
    }

    default CartResponse toCartResponse(Cart cart, List<CartItem> items) {
        List<CartItemResponse> itemResponses = items.stream()
                .map(this::toCartItemResponse)
                .collect(Collectors.toList());

        return CartResponse.builder()
                .cartId(cart.getCartID())
                .userId(cart.getUser().getId())
                .items(itemResponses)
                .itemCount((long) items.size())
                .totalPrice(items.stream().mapToDouble(CartItem::getSubTotal).sum())
                .build();
    }
}
