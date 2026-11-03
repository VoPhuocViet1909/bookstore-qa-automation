package com.notfound.bookstore.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import javax.crypto.spec.SecretKeySpec;
import java.util.Arrays;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

        @Autowired
        private JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;

        private final String[] PUBLIC_ENDPOINTS = {
                        "/api/public/**",
                        "/favicon.ico",

                        // Swagger UI
                        "/swagger-ui/**",
                        "/swagger-ui.html",
                        "/v3/api-docs/**",
                        "/v3/api-docs.yaml",
                        "/v3/api-docs",

                        // Auth
                        "/api/auth/**",
                        "/api/auth/register",
                        "/api/auth/login",
                        "/api/auth/send-otp",
                        "/api/auth/verify-otp",
                        "/api/auth/verify-email",
                        "/api/auth/confirm-email",
                        "/api/auth/google/callback",
                        "/api/auth/introspect",

                        // Books – Categories – Authors
                        "/api/books/**",
                        "/api/categories/**",
                        "/api/authors/**",

                        // News
                        "/api/news/**",

                        // Review
                        "/api/review/book/{bookId}",

                        // Payment - Allow callback and return URLs (these are called by payment
                        // gateways or redirect from them)
                        "/api/payment/*/callback",
                        "/api/payment/*/return",
                        "/api/payment/vnpay/callback",
                        "/api/payment/vnpay/return",
                        "/api/payment/momo/callback",
                        "/api/payment/momo/return",
                        "/api/payment/zalopay/callback",
                        "/api/payment/zalopay/return",

                        // Promotions
                        "/api/promotions/active",
                        "/api/promotions/book/**",
                        "/api/promotions/validate",

                        // OAuth2
                        "/oauth2/**",

                        // Shipment
                        "/api/shipment/customer/**",

                        // Chatbot
                        "/api/chatbot/**",
                        "/api/chat/**"
        };

        @Value("${jwt.signerKey}")
        private String signerKey;

        @Bean
        public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
                http
                                // 1. Kích hoạt tích hợp CORS vào Security (CỰC QUAN TRỌNG!)
                                .cors(Customizer.withDefaults())

                                // 2. Tắt CSRF vì dùng JWT (stateless)
                                .csrf(AbstractHttpConfigurer::disable)

                                .authorizeHttpRequests(auth -> auth
                                                // Cho phép tất cả request OPTIONS (preflight) đi qua
                                                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                                                .requestMatchers(PUBLIC_ENDPOINTS).permitAll()
                                                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                                                .anyRequest().authenticated())

                                // Cấu hình OAuth2 Resource Server với JWT
                                .oauth2ResourceServer(oauth2 -> oauth2
                                                .jwt(jwtConfigurer -> jwtConfigurer
                                                                .decoder(jwtDecoder())
                                                                .jwtAuthenticationConverter(
                                                                                jwtAuthenticationConverter()))
                                                .authenticationEntryPoint(jwtAuthenticationEntryPoint))

                                .exceptionHandling(exception -> exception
                                                .authenticationEntryPoint(jwtAuthenticationEntryPoint));

                return http.build();
        }

        /**
         * Cấu hình CORS cho phép Frontend truy cập Backend
         *
         */
        @Bean
        public CorsConfigurationSource corsConfigurationSource() {
            CorsConfiguration configuration = new CorsConfiguration();

            configuration.setAllowedOriginPatterns(Arrays.asList("*"));
            configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
            configuration.setAllowedHeaders(Arrays.asList("*"));
            configuration.setAllowCredentials(true);
            configuration.setMaxAge(3600L);
            configuration.setExposedHeaders(Arrays.asList("Authorization", "Content-Type", "X-Total-Count"));

            UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
            source.registerCorsConfiguration("/**", configuration);
            return source;
        }

        @Bean
        public JwtAuthenticationConverter jwtAuthenticationConverter() {
                JwtGrantedAuthoritiesConverter grantedAuthoritiesConverter = new JwtGrantedAuthoritiesConverter();
                grantedAuthoritiesConverter.setAuthorityPrefix("ROLE_");

                JwtAuthenticationConverter jwtAuthenticationConverter = new JwtAuthenticationConverter();
                jwtAuthenticationConverter.setJwtGrantedAuthoritiesConverter(grantedAuthoritiesConverter);

                return jwtAuthenticationConverter;
        }

        @Bean
        public JwtDecoder jwtDecoder() {
                SecretKeySpec secretKeySpec = new SecretKeySpec(signerKey.getBytes(), "HS512");
                return NimbusJwtDecoder
                                .withSecretKey(secretKeySpec)
                                .macAlgorithm(MacAlgorithm.HS512)
                                .build();
        }

        @Bean
        public PasswordEncoder passwordEncoder() {
                return new BCryptPasswordEncoder(10);
        }
}