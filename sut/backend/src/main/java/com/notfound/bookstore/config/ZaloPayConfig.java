package com.notfound.bookstore.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@Getter
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ZaloPayConfig {

    private final ObjectMapper objectMapper;

    @Value("${payment.zaloPay.appId}")
    String zap_AppID;
    @Value("${payment.zaloPay.key1}")
    String zap_Key1;
    @Value("${payment.zaloPay.key2}")
    String zap_Key2 ;
    @Value("${payment.zaloPay.zaloPayUrl}")
    String zap_OrderCreate;
    @Value("${payment.zaloPay.returnUrl}")
    String zap_OrderStatus;
    @Value("${payment.zaloPay.redirectUrl}")
    String zap_RedirectUrl;
    @Value("${payment.zaloPay.callbackUrl}")
    String zap_CallbackUrl;


}
