package com.notfound.bookstore.model.entity;

import com.notfound.bookstore.model.enums.PaymentStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UuidGenerator;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "payments")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = "order")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Payment {

    @Id
    @UuidGenerator
    UUID paymentID;

    @Column(name = "payment_method", nullable = false)
    String paymentMethod;

    @Column(nullable = false)
    Long amount;

    @CreationTimestamp
    @Column(name = "payment_date", nullable = false)
    LocalDateTime date;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    PaymentStatus status;

    String transactionId;

    @Column(name = "redirect_url", length = 500)
    String redirectUrl; // URL để redirect về Frontend sau khi thanh toán

    @Column(name = "transaction_fee")
    Double transactionFee;

    @Column(name = "net_amount")
    Double netAmount; // Số tiền thực nhận sau khi trừ phí

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    Order order;

    public Payment(String paymentMethod, Long amount, Order order) {
        this.paymentMethod = paymentMethod;
        this.amount = amount;
        this.order = order;
        this.status = PaymentStatus.PENDING;
    }
}
