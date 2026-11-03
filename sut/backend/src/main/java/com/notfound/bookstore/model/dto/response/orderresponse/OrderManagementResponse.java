package com.notfound.bookstore.model.dto.response.orderresponse;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OrderManagementResponse extends OrderResponse {
    String customerUsername;
    String customerGender;
    LocalDate customerDateOfBirth;
    Integer customerPoints;
    String customerStatus;
    LocalDateTime customerCreatedAt;
    LocalDateTime customerLastLogin;
    Boolean isEmailVerified;
    String authProvider;
}