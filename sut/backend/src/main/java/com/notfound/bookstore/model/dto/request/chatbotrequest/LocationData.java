package com.notfound.bookstore.model.dto.request.chatbotrequest;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class LocationData {
    Double lat;
    Double lng;
    String address;
}
