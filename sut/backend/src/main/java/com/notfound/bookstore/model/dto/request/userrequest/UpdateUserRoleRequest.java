package com.notfound.bookstore.model.dto.request.userrequest;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UpdateUserRoleRequest {
    @NotBlank
    @Pattern(regexp = "^(GUEST|CUSTOMER|ADMIN)$", message = "Invalid role")
    String role;
}
