package com.notfound.bookstore.service;

public interface RedisService {
    void saveOtp(String email, String otp, long minutes);

    String getOtp(String email);

    void deleteOtp(String email);

    boolean existsByEmail(String email);

    void incrementOtpAttempts(String email);

    int getOtpAttempts(String email);
}
