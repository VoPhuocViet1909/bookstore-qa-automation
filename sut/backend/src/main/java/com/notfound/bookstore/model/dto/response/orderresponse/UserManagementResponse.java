package com.notfound.bookstore.model.dto.response.orderresponse;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserManagementResponse {
    UUID id;
    String username;
    String email;
    String fullName;
    String phoneNumber;
    String role;
    String status;
    LocalDateTime createdAt;
    LocalDateTime lastLogin;
    Integer points;
    String membershipTier;
    Integer totalOrders;
    BigDecimal totalSpent;
}