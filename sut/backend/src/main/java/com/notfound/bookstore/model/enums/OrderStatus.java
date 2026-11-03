package com.notfound.bookstore.model.enums;

import lombok.Getter;

@Getter
public enum OrderStatus {
    PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED, COMPLETED
}
