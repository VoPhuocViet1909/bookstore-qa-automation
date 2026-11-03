package com.notfound.bookstore.listener;

import com.notfound.bookstore.service.OrderTimeoutService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.connection.Message;
import org.springframework.data.redis.listener.KeyExpirationEventMessageListener;
import org.springframework.data.redis.listener.RedisMessageListenerContainer;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.util.UUID;

/**
 * Redis Key Expiration Event Listener
 * Lắng nghe sự kiện khi key trong Redis hết hạn (expired)
 * để tự động hủy đơn hàng khi quá thời gian thanh toán
 */
@Component
@Slf4j
public class RedisKeyExpirationListener extends KeyExpirationEventMessageListener {

    private static final String ORDER_TIMEOUT_KEY_PREFIX = "order_timeout:";
    private final OrderTimeoutService orderTimeoutService;

    public RedisKeyExpirationListener(RedisMessageListenerContainer listenerContainer,
                                     OrderTimeoutService orderTimeoutService) {
        super(listenerContainer);
        this.orderTimeoutService = orderTimeoutService;
    }

    /**
     * Xử lý sự kiện khi key expired
     * @param message Message chứa key đã expired
     * @param pattern Pattern của topic
     */
    @Override
    public void onMessage(Message message, byte[] pattern) {
        try {
            String expiredKey = new String(message.getBody(), StandardCharsets.UTF_8);

            log.debug("Received Redis key expiration event for key: {}", expiredKey);

            // Kiểm tra xem key có phải là order timeout key không
            if (expiredKey.startsWith(ORDER_TIMEOUT_KEY_PREFIX)) {
                String orderIdStr = expiredKey.substring(ORDER_TIMEOUT_KEY_PREFIX.length());

                try {
                    UUID orderId = UUID.fromString(orderIdStr);
                    log.info("Order timeout detected for order: {}", orderId);

                    // Gọi service để xử lý timeout
                    orderTimeoutService.handleOrderTimeout(orderId);

                } catch (IllegalArgumentException e) {
                    log.error("Invalid UUID format in expired key: {}", orderIdStr, e);
                }
            }
        } catch (Exception e) {
            log.error("Error processing Redis key expiration event", e);
        }
    }
}

