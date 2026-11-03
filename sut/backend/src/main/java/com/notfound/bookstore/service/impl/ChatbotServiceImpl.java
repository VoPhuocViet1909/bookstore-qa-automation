package com.notfound.bookstore.service.impl;

import com.notfound.bookstore.model.dto.request.bookrequest.BookSearchRequest;
import com.notfound.bookstore.model.dto.request.chatbotrequest.ChatbotRequest;
import com.notfound.bookstore.model.dto.response.authorresponse.AuthorSummaryResponse;
import com.notfound.bookstore.model.dto.response.bookresponse.BookResponse;
import com.notfound.bookstore.model.dto.response.bookresponse.BookSummaryResponse;
import com.notfound.bookstore.model.dto.response.bookresponse.PageResponse;
import com.notfound.bookstore.model.dto.response.categoryresponse.CategoryResponse;
import com.notfound.bookstore.model.dto.response.chatbotresponse.ChatbotResponse;
import com.notfound.bookstore.model.dto.response.orderresponse.OrderResponse;
import com.notfound.bookstore.model.dto.response.promotionresponse.PromotionResponse;
import com.notfound.bookstore.model.entity.User;
import com.notfound.bookstore.security.SecurityUtils;
import com.notfound.bookstore.service.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.messages.AssistantMessage;
import org.springframework.ai.chat.prompt.SystemPromptTemplate;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatbotServiceImpl implements ChatbotService {

    private final ChatModel chatModel;
    private final BookService bookService;
    private final CategoryService categoryService;
    private final AuthorService authorService;
    private final OrderService orderService;
    private final PromotionService promotionService;
    private final ReviewService reviewService;
    private final SecurityUtils securityUtils;

    // Store chat history per session
    private final Map<String, List<ChatMessage>> chatHistoryMap = new ConcurrentHashMap<>();
    private static final int MAX_HISTORY_SIZE = 20; // Stores up to 20 messages (user + AI)
    private static final int CLEAR_HISTORY_THRESHOLD = 30; // Clear history when reaching this threshold

    private record ChatMessage(String role, String content) {
    }

    @Override
    public ChatbotResponse sendMessage(ChatbotRequest request) {
        try {
            String sessionId = request.getSessionId() != null && !request.getSessionId().isEmpty()
                    ? request.getSessionId()
                    : UUID.randomUUID().toString();

            // Get or create chat history for this session
            List<ChatMessage> chatHistory = chatHistoryMap.computeIfAbsent(sessionId, k -> new ArrayList<>());

            // Build the user message with attachments context if any
            String userMessage = buildUserMessage(request);

            // Add user message to history
            chatHistory.add(new ChatMessage("user", userMessage));

            // Clear history if it exceeds threshold (keep only recent messages)
            if (chatHistory.size() > CLEAR_HISTORY_THRESHOLD) {
                // Keep only the last MAX_HISTORY_SIZE messages
                int keepFromIndex = chatHistory.size() - MAX_HISTORY_SIZE;
                List<ChatMessage> recentHistory = new ArrayList<>();
                for (int i = keepFromIndex; i < chatHistory.size(); i++) {
                    recentHistory.add(chatHistory.get(i));
                }
                chatHistory.clear();
                chatHistory.addAll(recentHistory);
                log.debug("Cleared chat history for session {}: kept {} recent messages", sessionId, recentHistory.size());
            } else {
                // Truncate history if needed (normal case)
                while (chatHistory.size() > MAX_HISTORY_SIZE) {
                    chatHistory.remove(0);
                }
            }

            // Get current user (if authenticated)
            User currentUser = null;
            try {
                if (org.springframework.security.core.context.SecurityContextHolder.getContext()
                        .getAuthentication() != null
                        && org.springframework.security.core.context.SecurityContextHolder.getContext()
                                .getAuthentication().isAuthenticated()
                        && !"anonymousUser".equals(org.springframework.security.core.context.SecurityContextHolder
                                .getContext().getAuthentication().getName())) {
                    currentUser = securityUtils.getCurrentUser();
                }
            } catch (Exception e) {
                // User not authenticated, continue without user context
                log.debug("No authenticated user for chatbot request: {}", e.getMessage());
            }

            // Query database based on user intent
            String databaseContext = queryDatabaseContext(userMessage, currentUser);

            // Convert chat history to AI messages
            List<Message> aiMessages = chatHistory.stream()
                    .limit(chatHistory.size() - 1) // Exclude the last message (current user message)
                    .map(msg -> {
                        if ("user".equals(msg.role())) {
                            return new UserMessage(msg.content());
                        } else if ("assistant".equals(msg.role())) {
                            return new AssistantMessage(msg.content());
                        }
                        return null;
                    })
                    .filter(Objects::nonNull)
                    .collect(Collectors.toList());

            // Add current user message with database context
            String enhancedUserMessage = userMessage;
            if (!databaseContext.isEmpty()) {
                enhancedUserMessage = userMessage + "\n\n[Dữ liệu từ hệ thống:\n" + databaseContext + "\n]";
            }
            aiMessages.add(new UserMessage(enhancedUserMessage));

            // Get current date and time for context
            java.time.LocalDateTime now = java.time.LocalDateTime.now();
            java.time.format.DateTimeFormatter dateFormatter = java.time.format.DateTimeFormatter.ofPattern("EEEE, dd/MM/yyyy", java.util.Locale.forLanguageTag("vi"));
            java.time.format.DateTimeFormatter timeFormatter = java.time.format.DateTimeFormatter.ofPattern("HH:mm");
            String currentDate = now.format(dateFormatter);
            String currentTime = now.format(timeFormatter);
            String currentDateTime = String.format("%s, lúc %s", currentDate, currentTime);

            // Build system prompt with database context
            SystemPromptTemplate systemPromptTemplate = new SystemPromptTemplate(
                    String.format("""
                            Bạn là một trợ lý AI thân thiện và hữu ích cho một ứng dụng nhà sách trực tuyến.
                            Tên của bạn là BookBot.

                            THÔNG TIN THỜI GIAN HIỆN TẠI:
                            - Ngày và giờ hiện tại: %s
                            - Khi người dùng hỏi về ngày tháng, hãy sử dụng thông tin này để trả lời chính xác.

                            Bạn có thể giúp khách hàng:
                            - Tìm kiếm sách theo tên, tác giả, thể loại (dựa trên dữ liệu thực từ database)
                            - Đưa ra gợi ý sách dựa trên sở thích (dựa trên dữ liệu thực)
                            - Trả lời câu hỏi về đơn hàng của họ (nếu đã đăng nhập)
                            - Cung cấp thông tin về khuyến mãi, thể loại, tác giả (từ database)
                            - Hỗ trợ tư vấn về sách và đọc sách
                            - Trả lời câu hỏi về ngày tháng, thời gian hiện tại

                            QUAN TRỌNG:
                            - Luôn sử dụng dữ liệu thực từ hệ thống được cung cấp trong [Dữ liệu từ hệ thống]
                            - KHÔNG bịa đặt thông tin về sách, giá, tác giả, thể loại
                            - Nếu không có dữ liệu, hãy thành thật nói rằng bạn không tìm thấy thông tin
                            - Luôn trả lời bằng tiếng Việt một cách thân thiện, chuyên nghiệp và hữu ích
                            - Khi đề cập đến sách cụ thể, hãy cung cấp thông tin chính xác từ database (tên, giá, tác giả, đánh giá)
                            - KHÔNG sử dụng markdown formatting (không dùng dấu **, ***, __, hoặc các ký hiệu markdown khác)
                            - Trả lời bằng văn bản thuần túy, dễ đọc, không có định dạng đặc biệt
                            """, currentDateTime));

            // Get AI response
            ChatClient chatClient = ChatClient.builder(chatModel)
                    .defaultSystem(systemPromptTemplate.getTemplate())
                    .build();
            String aiResponse = chatClient.prompt()
                    .messages(aiMessages)
                    .system(systemSpec -> systemSpec.text(systemPromptTemplate.getTemplate()))
                    .user(enhancedUserMessage)
                    .call()
                    .content();

            // Add AI response to history
            chatHistory.add(new ChatMessage("assistant", aiResponse));

            // Clear history if it exceeds threshold (keep only recent messages)
            if (chatHistory.size() > CLEAR_HISTORY_THRESHOLD) {
                // Keep only the last MAX_HISTORY_SIZE messages
                int keepFromIndex = chatHistory.size() - MAX_HISTORY_SIZE;
                List<ChatMessage> recentHistory = new ArrayList<>();
                for (int i = keepFromIndex; i < chatHistory.size(); i++) {
                    recentHistory.add(chatHistory.get(i));
                }
                chatHistory.clear();
                chatHistory.addAll(recentHistory);
                log.debug("Cleared chat history for session {}: kept {} recent messages", sessionId, recentHistory.size());
            } else {
                // Truncate history if needed (normal case)
                while (chatHistory.size() > MAX_HISTORY_SIZE) {
                    chatHistory.remove(0);
                }
            }

            // Update history map
            chatHistoryMap.put(sessionId, chatHistory);

            return ChatbotResponse.builder()
                    .response(aiResponse)
                    .sessionId(sessionId)
                    .build();

        } catch (Exception e) {
            log.error("Error processing chatbot message: ", e);
            return ChatbotResponse.builder()
                    .response("Xin lỗi, đã có lỗi xảy ra khi xử lý tin nhắn của bạn. Vui lòng thử lại sau.")
                    .sessionId(request.getSessionId())
                    .build();
        }
    }

    /**
     * Query database based on user message intent
     * Returns context string with relevant data from database
     */
    private String queryDatabaseContext(String userMessage, User currentUser) {
        StringBuilder context = new StringBuilder();
        String lowerMessage = userMessage.toLowerCase();

        try {
            // 1. Search for books
            if (containsAny(lowerMessage, "sách", "book", "tìm", "tìm kiếm", "có sách", "danh sách sách", "gợi ý")) {
                String keyword = extractKeyword(lowerMessage,
                        Arrays.asList("sách", "book", "tìm", "tìm kiếm", "gợi ý"));
                if (keyword != null && !keyword.isEmpty()) {
                    BookSearchRequest searchRequest = BookSearchRequest.builder()
                            .keyword(keyword)
                            .page(0)
                            .size(5)
                            .build();
                    PageResponse<BookSummaryResponse> books = bookService.searchBooks(searchRequest);
                    if (books != null && books.getContent() != null && !books.getContent().isEmpty()) {
                        context.append("Sách tìm được:\n");
                        for (BookSummaryResponse book : books.getContent()) {
                            context.append(String.format("- %s (ID: %s, Giá: %.0f VNĐ",
                                    book.getTitle(), book.getId(), book.getPrice()));
                            if (book.getDiscountPrice() != null && book.getDiscountPrice() < book.getPrice()) {
                                context.append(String.format(", Giá khuyến mãi: %.0f VNĐ", book.getDiscountPrice()));
                            }
                            if (book.getAuthorNames() != null && !book.getAuthorNames().isEmpty()) {
                                context.append(", Tác giả: ").append(String.join(", ", book.getAuthorNames()));
                            }
                            if (book.getAverageRating() != null) {
                                context.append(String.format(", Đánh giá: %.1f/5", book.getAverageRating()));
                            }
                            context.append(")\n");
                        }
                        context.append("\n");
                    }
                } else {
                    // Get popular books
                    PageResponse<BookSummaryResponse> allBooks = bookService.getAllBooks(0, 5);
                    if (allBooks != null && allBooks.getContent() != null && !allBooks.getContent().isEmpty()) {
                        context.append("Sách phổ biến:\n");
                        for (BookSummaryResponse book : allBooks.getContent()) {
                            context.append(String.format("- %s (Giá: %.0f VNĐ", book.getTitle(), book.getPrice()));
                            if (book.getAuthorNames() != null && !book.getAuthorNames().isEmpty()) {
                                context.append(", Tác giả: ").append(String.join(", ", book.getAuthorNames()));
                            }
                            context.append(")\n");
                        }
                        context.append("\n");
                    }
                }
            }

            // 2. Get categories
            if (containsAny(lowerMessage, "thể loại", "danh mục", "category", "loại sách")) {
                List<CategoryResponse> categories = categoryService.getAllCategories();
                if (categories != null && !categories.isEmpty()) {
                    context.append("Danh sách thể loại sách:\n");
                    for (CategoryResponse category : categories) {
                        context.append(String.format("- %s (ID: %s)\n",
                                category.getName(), category.getId()));
                    }
                    context.append("\n");
                }
            }

            // 3. Get active promotions
            if (containsAny(lowerMessage, "khuyến mãi", "giảm giá", "promotion", "discount", "ưu đãi")) {
                List<PromotionResponse> promotions = promotionService.getActivePromotions();
                if (promotions != null && !promotions.isEmpty()) {
                    context.append("Khuyến mãi đang hoạt động:\n");
                    for (PromotionResponse promo : promotions) {
                        context.append(String.format("- %s: Mã %s, Giảm %.0f%%",
                                promo.getName(), promo.getCode(), promo.getDiscountPercent()));
                        if (promo.getDescription() != null) {
                            context.append(" - ").append(promo.getDescription());
                        }
                        context.append("\n");
                    }
                    context.append("\n");
                }
            }

            // 4. Get user orders (if authenticated)
            if (currentUser != null && containsAny(lowerMessage, "đơn hàng", "order", "mua", "đã mua")) {
                List<OrderResponse> orders = orderService.getOrdersByUserId(currentUser.getId());
                if (orders != null && !orders.isEmpty()) {
                    context.append("Đơn hàng của bạn:\n");
                    for (OrderResponse order : orders.stream().limit(5).collect(Collectors.toList())) {
                        context.append(String.format("- Đơn hàng #%s: Trạng thái %s, Tổng tiền: %.0f VNĐ\n",
                                order.getId(), order.getStatus(),
                                order.getTotal() != null ? order.getTotal().doubleValue() : 0.0));
                    }
                    context.append("\n");
                } else {
                    context.append("Bạn chưa có đơn hàng nào.\n\n");
                }
            }

            // 5. Search for authors
            if (containsAny(lowerMessage, "tác giả", "author", "nhà văn", "nhà thơ")) {
                String authorKeyword = extractKeyword(lowerMessage, Arrays.asList("tác giả", "author", "nhà văn"));
                if (authorKeyword != null && !authorKeyword.isEmpty()) {
                    // Note: AuthorService.searchByName requires AuthorSearchRequest
                    // For now, we'll just mention that authors exist
                    context.append("Hệ thống có nhiều tác giả. Bạn có thể tìm kiếm tác giả cụ thể trên website.\n\n");
                }
            }

            // 6. Get book details if user asks about specific book
            if (containsAny(lowerMessage, "chi tiết", "thông tin", "giá", "đánh giá") &&
                    (lowerMessage.contains("sách") || lowerMessage.contains("book"))) {
                // Try to extract book title and search
                String bookTitle = extractBookTitle(lowerMessage);
                if (bookTitle != null && !bookTitle.isEmpty()) {
                    BookSearchRequest searchRequest = BookSearchRequest.builder()
                            .keyword(bookTitle)
                            .page(0)
                            .size(1)
                            .build();
                    PageResponse<BookSummaryResponse> books = bookService.searchBooks(searchRequest);
                    if (books != null && books.getContent() != null && !books.getContent().isEmpty()) {
                        BookSummaryResponse book = books.getContent().get(0);
                        BookResponse bookDetail = bookService.getBookById(book.getId().toString());
                        if (bookDetail != null) {
                            context.append("Thông tin chi tiết sách:\n");
                            context.append(String.format("Tên: %s\n", bookDetail.getTitle()));
                            context.append(String.format("Giá: %.0f VNĐ\n", bookDetail.getPrice()));
                            if (bookDetail.getDiscountPrice() != null) {
                                context.append(
                                        String.format("Giá khuyến mãi: %.0f VNĐ\n", bookDetail.getDiscountPrice()));
                            }
                            if (bookDetail.getDescription() != null) {
                                context.append(String.format("Mô tả: %s\n", bookDetail.getDescription()));
                            }
                            if (bookDetail.getAuthorNames() != null && !bookDetail.getAuthorNames().isEmpty()) {
                                context.append(
                                        String.format("Tác giả: %s\n", String.join(", ", bookDetail.getAuthorNames())));
                            }
                            if (bookDetail.getAverageRating() != null) {
                                context.append(String.format("Đánh giá: %.1f/5 (%d đánh giá)\n",
                                        bookDetail.getAverageRating(),
                                        bookDetail.getReviewCount() != null ? bookDetail.getReviewCount() : 0));
                            }
                            context.append("\n");
                        }
                    }
                }
            }

        } catch (Exception e) {
            log.error("Error querying database context: ", e);
            // Continue without database context
        }

        return context.toString();
    }

    private boolean containsAny(String text, String... keywords) {
        for (String keyword : keywords) {
            if (text.contains(keyword)) {
                return true;
            }
        }
        return false;
    }

    private String extractKeyword(String message, List<String> stopWords) {
        // Simple keyword extraction - remove stop words and return the rest
        String result = message;
        for (String stopWord : stopWords) {
            result = result.replace(stopWord, "").trim();
        }
        // Remove common Vietnamese question words
        result = result.replaceAll("(?i)(là gì|gì|nào|thế nào|ra sao|như thế nào)", "").trim();
        // Remove punctuation
        result = result.replaceAll("[?.,!;:]", "").trim();
        return result.length() > 2 ? result : null;
    }

    private String extractBookTitle(String message) {
        // Try to extract book title from message
        // Look for patterns like "sách X", "book X", "cuốn X"
        String[] patterns = { "sách", "book", "cuốn", "quyển" };
        for (String pattern : patterns) {
            int index = message.indexOf(pattern);
            if (index >= 0) {
                String after = message.substring(index + pattern.length()).trim();
                // Take first few words as title
                String[] words = after.split("\\s+");
                if (words.length > 0) {
                    return String.join(" ", Arrays.copyOf(words, Math.min(3, words.length)));
                }
            }
        }
        return null;
    }

    private String buildUserMessage(ChatbotRequest request) {
        StringBuilder messageBuilder = new StringBuilder(request.getMessage() != null ? request.getMessage() : "");

        // Add attachment context if any
        if (request.getAttachments() != null && !request.getAttachments().isEmpty()) {
            messageBuilder.append("\n\n[Đính kèm: ");
            for (var attachment : request.getAttachments()) {
                switch (attachment.getType()) {
                    case "image":
                        messageBuilder.append("Ảnh: ")
                                .append(attachment.getName() != null ? attachment.getName() : "image");
                        break;
                    case "file":
                        messageBuilder.append("Tệp: ")
                                .append(attachment.getName() != null ? attachment.getName() : "file");
                        break;
                    case "location":
                        if (attachment.getLocation() != null) {
                            messageBuilder.append("Vị trí: ")
                                    .append(attachment.getLocation().getAddress() != null
                                            ? attachment.getLocation().getAddress()
                                            : String.format("Lat: %s, Lng: %s",
                                                    attachment.getLocation().getLat(),
                                                    attachment.getLocation().getLng()));
                        }
                        break;
                }
                messageBuilder.append("; ");
            }
            messageBuilder.append("]");
        }

        return messageBuilder.toString();
    }
}
