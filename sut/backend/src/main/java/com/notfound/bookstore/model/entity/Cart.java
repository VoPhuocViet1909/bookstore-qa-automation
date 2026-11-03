package com.notfound.bookstore.model.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.UuidGenerator;

import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "carts")
@Getter
@Setter
@NoArgsConstructor
@ToString(exclude = {"user", "items"})
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Cart {

    @Id
    @UuidGenerator
    UUID cartID;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    User user;

    @OneToMany(mappedBy = "cart", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    List<CartItem> items;

    public Cart(String title, User user) {
        this.user = user;
    }

    public Double getTotalPrice() {
        return items.stream().mapToDouble(CartItem::getSubTotal).sum();
    }
}
