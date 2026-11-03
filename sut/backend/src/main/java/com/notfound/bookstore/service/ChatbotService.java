package com.notfound.bookstore.service;

import com.notfound.bookstore.model.dto.request.chatbotrequest.ChatbotRequest;
import com.notfound.bookstore.model.dto.response.chatbotresponse.ChatbotResponse;

public interface ChatbotService {
    /**
     * Gửi tin nhắn đến chatbot AI và nhận phản hồi
     * 
     * @param request Thông tin tin nhắn từ người dùng
     * @return Phản hồi từ chatbot AI
     */
    ChatbotResponse sendMessage(ChatbotRequest request);
}
