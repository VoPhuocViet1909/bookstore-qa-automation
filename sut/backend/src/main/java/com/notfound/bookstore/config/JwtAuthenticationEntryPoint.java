package com.notfound.bookstore.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.notfound.bookstore.exception.ErrorCode;
import com.notfound.bookstore.model.dto.response.ApiResponse;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.oauth2.server.resource.web.BearerTokenAuthenticationEntryPoint;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.io.IOException;

@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint{
    AuthenticationEntryPoint entryPoint = new BearerTokenAuthenticationEntryPoint();
    ObjectMapper mapper;
    private final RestClient.Builder builder;

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response, AuthenticationException authException) throws IOException, ServletException {
        this.entryPoint.commence(request, response, authException);
        response.setContentType("application/json;charset=UTF-8");
        ErrorCode errorCode = ErrorCode.UNAUTHORIZED;
        ApiResponse<Object> apiResponse = ApiResponse.<Object>builder()
            .code(errorCode.getCode())
            .message(errorCode.getMessage())
            .result(null)
            .build();
        mapper.writeValue(response.getWriter(), apiResponse);
    }
}
