/**
 * Chat Service
 * Handles all chatbot AI API calls
 */

import apiClient from "../api-client";

export interface ChatbotRequest {
  message: string;
  sessionId?: string | null;
  attachments?: AttachmentRequest[];
}

export interface AttachmentRequest {
  type: "image" | "file" | "location";
  url?: string;
  name?: string;
  location?: {
    lat: number;
    lng: number;
    address?: string;
  };
}

export interface ChatbotResponse {
  response: string;
  sessionId: string;
}

class ChatService {
  /**
   * Gửi tin nhắn đến chatbot AI (endpoint đầy đủ với JSON)
   * @param request - Thông tin tin nhắn từ người dùng
   * @returns Phản hồi từ chatbot AI
   */
  async sendMessage(request: ChatbotRequest): Promise<ChatbotResponse> {
    try {
      const response = await apiClient.post<ChatbotResponse>(
        "/chatbot/chat",
        request
      );
      return response;
    } catch (error: any) {
      console.error("Error sending chat message:", error);
      const errorMessage =
        error.message ||
        "Không thể kết nối đến chatbot. Vui lòng thử lại sau.";
      throw new Error(errorMessage);
    }
  }

}

export const chatService = new ChatService();
export default chatService;
