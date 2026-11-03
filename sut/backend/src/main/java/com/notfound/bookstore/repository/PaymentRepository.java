package com.notfound.bookstore.repository;

import com.notfound.bookstore.model.entity.Book;
import com.notfound.bookstore.model.entity.Order;
import com.notfound.bookstore.model.entity.Payment;
import com.notfound.bookstore.model.enums.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;
@Repository
public interface PaymentRepository extends JpaRepository<Payment, UUID> {
    Optional<Payment> findByOrderAndStatus(Order order, PaymentStatus paymentStatus);
    Optional<Payment> findPaymentByTransactionId(String transactionId);
}
