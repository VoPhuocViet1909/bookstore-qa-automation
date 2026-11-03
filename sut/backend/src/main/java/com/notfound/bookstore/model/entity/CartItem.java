package com.notfound.bookstore.model.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.notfound.bookstore.util.PriceCalculationUtil;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.UuidGenerator;

import java.util.UUID;

@Entity
@Table(name = "cart_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = {"cart", "book"})
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CartItem {

    @Id
    @UuidGenerator
    UUID itemID;

    @Column(nullable = false)
    Integer quantity;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cart_id", nullable = false)
    @JsonBackReference
    Cart cart;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "book_id", nullable = false)
    @JsonBackReference
    Book book;

    public CartItem(Cart cart, Book book, Integer quantity) {
        this.cart = cart;
        this.book = book;
        this.quantity = quantity;
    }

    public double getSubTotal(){
        // Use centralized price calculation utility for consistency
        return PriceCalculationUtil.calculateSubtotal(book, quantity);
    }
}
