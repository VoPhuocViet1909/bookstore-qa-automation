package com.notfound.bookstore.model.dto.response.statisticsresponse;

import com.notfound.bookstore.model.dto.response.bookresponse.BookResponse;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TopSellingBookResponse {
    BookResponse book;
    Integer totalSold;
    BigDecimal totalRevenue;
}