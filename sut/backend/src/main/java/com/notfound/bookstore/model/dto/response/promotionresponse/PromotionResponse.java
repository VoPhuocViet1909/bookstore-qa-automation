package com.notfound.bookstore.model.dto.response.promotionresponse;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PromotionResponse {
    UUID promotionID;
    String name;
    String code;
    Double discountPercent;
    LocalDate startDate;
    LocalDate endDate;
    String description;
    Integer usageCount;
    Integer usageLimit;
    String status;
    List<UUID> applicableBookIds;
    Boolean isValid; // Trạng thái hiện tại có hợp lệ không
}
