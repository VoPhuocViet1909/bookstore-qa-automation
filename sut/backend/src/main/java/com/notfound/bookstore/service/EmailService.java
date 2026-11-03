package com.notfound.bookstore.service;

import jakarta.mail.MessagingException;

public interface EmailService {
    void sendOtp(String to, String otp) throws MessagingException;

    void sendHtmlEmail(String email, String token);
}
