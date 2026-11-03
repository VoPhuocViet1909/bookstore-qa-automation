package com.notfound.bookstore.model.dto.request.chatbotrequest;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class ChatbotRequest {
    String message;
    String sessionId; // Optional: for maintaining conversation context
    List<AttachmentRequest> attachments; // Optional: for file/image/location attachments
}
