package com.notfound.bookstore.service;

import com.notfound.bookstore.model.dto.request.userrequest.ChangePasswordRequest;
import com.notfound.bookstore.model.dto.request.userrequest.LoginRequest;
import com.notfound.bookstore.model.dto.request.userrequest.RegisterRequest;
import com.notfound.bookstore.model.dto.response.userresponse.AuthResponse;

public interface AuthService {
    AuthResponse login(LoginRequest request);

    AuthResponse register(RegisterRequest request);

    String generateEmailVerificationToken(String email);

    String validateEmailVerificationToken(String token);

    AuthResponse handleGoogleOAuthCallback(String code);

    void changePassword(String username, ChangePasswordRequest request);

    AuthResponse refreshToken(String refreshToken);
}
