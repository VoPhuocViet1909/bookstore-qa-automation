package com.notfound.bookstore.model.dto.request.chatbotrequest;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class AttachmentRequest {
    String type; // "image", "file", "location"
    String url; // For images/files
    String name; // File name
    LocationData location; // For location type
}
