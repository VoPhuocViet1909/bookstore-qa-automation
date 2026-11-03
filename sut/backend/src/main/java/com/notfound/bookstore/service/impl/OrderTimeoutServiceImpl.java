package com.notfound.bookstore.service.impl;

import com.notfound.bookstore.model.entity.Order;
import com.notfound.bookstore.model.entity.OrderItem;
import com.notfound.bookstore.model.entity.Payment;
import com.notfound.bookstore.model.enums.OrderStatus;
import com.notfound.bookstore.model.enums.PaymentStatus;
import com.notfound.bookstore.repository.BookRepository;
import com.notfound.bookstore.repository.OrderRepository;
import com.notfound.bookstore.repository.PaymentRepository;
import com.notfound.bookstore.service.OrderTimeoutService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;
import java.util.concurrent.TimeUnit;

/**
 * Implementation của OrderTimeoutService sử dụng Redis Key Expiration
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class OrderTimeoutServiceImpl implements OrderTimeoutService {

    private static final String ORDER_TIMEOUT_KEY_PREFIX = "order_timeout:";
    private static final int DEFAULT_TIMEOUT_MINUTES = 15;

    private final RedisTemplate<String, Object> redisTemplate;
    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final BookRepository bookRepository;

    @Override
    public void scheduleOrderTimeout(UUID orderId, int timeoutMinutes) {
        try {
            String key = ORDER_TIMEOUT_KEY_PREFIX + orderId.toString();

            // Lưu orderId vào Redis với TTL
            redisTemplate.opsForValue().set(
                    key,
                    orderId.toString(),
                    timeoutMinutes,
                    TimeUnit.MINUTES
            );

            log.info("Scheduled timeout for order {} in {} minutes", orderId, timeoutMinutes);
        } catch (Exception e) {
            log.error("Failed to schedule timeout for order {}: {}", orderId, e.getMessage(), e);
        }
    }

    @Override
    public void cancelOrderTimeout(UUID orderId) {
        try {
            String key = ORDER_TIMEOUT_KEY_PREFIX + orderId.toString();
            Boolean deleted = redisTemplate.delete(key);

            if (Boolean.TRUE.equals(deleted)) {
                log.info("Cancelled timeout for order {}", orderId);
            } else {
                log.warn("No timeout found for order {} to cancel", orderId);
            }
        } catch (Exception e) {
            log.error("Failed to cancel timeout for order {}: {}", orderId, e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public void handleOrderTimeout(UUID orderId) {
        try {
            log.info("Processing timeout for order {}", orderId);

            Order order = orderRepository.findById(orderId).orElse(null);

            if (order == null) {
                log.warn("Order {} not found, skipping timeout handling", orderId);
                return;
            }

            // Chỉ hủy đơn nếu đang ở trạng thái PENDING
            if (order.getStatus() != OrderStatus.PENDING) {
                log.info("Order {} is not in PENDING status (current: {}), skipping cancellation",
                        orderId, order.getStatus());
                return;
            }

            // Kiểm tra payment status
            Payment payment = order.getPayment();
            if (payment != null && payment.getStatus() == PaymentStatus.COMPLETED) {
                log.info("Order {} payment already completed, skipping cancellation", orderId);
                return;
            }

            // Hủy đơn hàng
            order.setStatus(OrderStatus.CANCELLED);

            // Cập nhật payment status nếu có
            if (payment != null) {
                payment.setStatus(PaymentStatus.FAILED);
                paymentRepository.save(payment);
            }

            // Hoàn lại số lượng sách
            restoreBookQuantities(order);

            orderRepository.save(order);

            log.info("Order {} has been cancelled due to payment timeout", orderId);

        } catch (Exception e) {
            log.error("Error handling timeout for order {}: {}", orderId, e.getMessage(), e);
        }
    }

    @Override
    public boolean isOrderScheduledForTimeout(UUID orderId) {
        try {
            String key = ORDER_TIMEOUT_KEY_PREFIX + orderId.toString();
            return Boolean.TRUE.equals(redisTemplate.hasKey(key));
        } catch (Exception e) {
            log.error("Failed to check timeout status for order {}: {}", orderId, e.getMessage(), e);
            return false;
        }
    }

    /**
     * Hoàn lại số lượng sách khi hủy đơn
     */
    private void restoreBookQuantities(Order order) {
        try {
            for (OrderItem item : order.getOrderItems()) {
                bookRepository.updateQuantityOnCancelOrder(
                        item.getBook().getId(),
                        item.getQuantity()
                );
                log.debug("Restored {} units of book {} for cancelled order {}",
                        item.getQuantity(),
                        item.getBook().getId(),
                        order.getOrderID());
            }
        } catch (Exception e) {
            log.error("Error restoring book quantities for order {}: {}",
                    order.getOrderID(), e.getMessage(), e);
        }
    }
}

