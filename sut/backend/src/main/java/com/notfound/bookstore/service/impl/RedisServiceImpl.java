package com.notfound.bookstore.service.impl;

import com.notfound.bookstore.service.RedisService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class RedisServiceImpl implements RedisService {
    StringRedisTemplate redisTemplate;
    private static final long OTP_TTL = 5 * 60;

    @Override
    public void saveOtp(String email, String otp, long minutes) {
        redisTemplate.opsForValue().set("otp:" + email, otp, OTP_TTL, TimeUnit.SECONDS);
        redisTemplate.opsForValue().set("otp_attempts:" + email, "0", OTP_TTL, TimeUnit.SECONDS);
    }

    @Override
    public String getOtp(String email) {
        return redisTemplate.opsForValue().get("otp:" + email);
    }

    @Override
    public void deleteOtp(String email) {
        redisTemplate.delete("otp:" + email);
        redisTemplate.delete("otp_attempts:" + email);
    }

    @Override
    public boolean existsByEmail(String email) {
        return redisTemplate.hasKey("otp:" + email);
    }

    @Override
    public void incrementOtpAttempts(String email) {
        redisTemplate.opsForValue().increment("otp_attempts:" + email);
    }

    @Override
    public int getOtpAttempts(String email) {
        String value = redisTemplate.opsForValue().get("otp_attempts:" + email);
        return value != null ? Integer.parseInt(value) : 0;
    }
}
