package com.notfound.bookstore.model.dto.response.chatbotresponse;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class ChatbotResponse {
    String response;
    String sessionId;
}
