package com.notfound.bookstore.model.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.UuidGenerator;

import java.util.UUID;

@Entity
@Table(name = "order_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = {"order", "book"})
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OrderItem {

    @Id
    @UuidGenerator
    UUID orderItemID;

    @Column(nullable = false)
    Integer quantity;

    @Column(name = "unit_price", nullable = false)
    Double unitPrice;

    @Column(nullable = false)
    Double subtotal;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    @JsonBackReference
    Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "book_id", nullable = false)
    @JsonBackReference
    Book book;

    public OrderItem(Order order, Book book, Integer quantity, Double unitPrice) {
        this.order = order;
        this.book = book;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
        this.subtotal = quantity * unitPrice;
    }
}
