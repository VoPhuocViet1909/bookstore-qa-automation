package com.notfound.bookstore.controller;

import com.notfound.bookstore.model.dto.request.chatbotrequest.ChatbotRequest;
import com.notfound.bookstore.model.dto.response.ApiResponse;
import com.notfound.bookstore.model.dto.response.chatbotresponse.ChatbotResponse;
import com.notfound.bookstore.service.ChatbotService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chatbot")
@RequiredArgsConstructor
public class ChatbotController {

    private final ChatbotService chatbotService;

    /**
     * Gửi tin nhắn đến chatbot AI
     * 
     * @param request Thông tin tin nhắn từ người dùng
     * @return Phản hồi từ chatbot AI
     */
    @PostMapping("/chat")
    public ResponseEntity<ApiResponse<ChatbotResponse>> sendMessage(@Valid @RequestBody ChatbotRequest request) {
        ChatbotResponse response = chatbotService.sendMessage(request);
        return ResponseEntity.ok(
                ApiResponse.<ChatbotResponse>builder()
                        .code(1000)
                        .message("Gửi tin nhắn thành công")
                        .result(response)
                        .build());
    }

    /**
     * Endpoint đơn giản chỉ nhận text message (tương thích với FE hiện tại)
     * 
     * @param message Nội dung tin nhắn
     * @return Phản hồi từ chatbot AI
     */
    @PostMapping("/ai")
    public ResponseEntity<String> sendSimpleMessage(@RequestBody String message) {
        ChatbotRequest request = ChatbotRequest.builder()
                .message(message)
                .build();
        ChatbotResponse response = chatbotService.sendMessage(request);
        return ResponseEntity.ok(response.getResponse());
    }
}
