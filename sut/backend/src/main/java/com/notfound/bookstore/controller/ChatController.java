package com.notfound.bookstore.controller;

import com.notfound.bookstore.model.dto.request.chatbotrequest.ChatbotRequest;
import com.notfound.bookstore.model.dto.response.chatbotresponse.ChatbotResponse;
import com.notfound.bookstore.service.ChatbotService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controller tương thích với endpoint cũ từ FE: /api/chat/ai
 */
@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatbotService chatbotService;

    /**
     * Endpoint tương thích với FE: /api/chat/ai
     * 
     * @param message Nội dung tin nhắn
     * @return Phản hồi từ chatbot AI
     */
    @PostMapping("/ai")
    public ResponseEntity<String> sendMessage(@RequestBody String message) {
        ChatbotRequest request = ChatbotRequest.builder()
                .message(message)
                .build();
        ChatbotResponse response = chatbotService.sendMessage(request);
        return ResponseEntity.ok(response.getResponse());
    }
}
