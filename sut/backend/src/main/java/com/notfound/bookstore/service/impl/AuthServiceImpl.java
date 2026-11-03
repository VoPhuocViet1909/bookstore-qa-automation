package com.notfound.bookstore.service.impl;

import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.notfound.bookstore.exception.AppException;
import com.notfound.bookstore.exception.ErrorCode;
import com.notfound.bookstore.model.dto.request.userrequest.LoginRequest;
import com.notfound.bookstore.model.dto.request.userrequest.RegisterRequest;
import com.notfound.bookstore.model.dto.request.userrequest.ChangePasswordRequest;
import com.notfound.bookstore.model.dto.response.userresponse.AuthResponse;
import com.notfound.bookstore.model.dto.response.userresponse.UserResponse;
import com.notfound.bookstore.model.entity.User;
import com.notfound.bookstore.model.mapper.UserMapper;
import com.notfound.bookstore.model.enums.Role;
import com.notfound.bookstore.repository.UserRepository;
import com.notfound.bookstore.service.AuthService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.http.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import jakarta.annotation.PostConstruct;

import java.text.ParseException;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthServiceImpl implements AuthService {
    UserRepository userRepository;
    PasswordEncoder passwordEncoder;
    UserMapper userMapper;
    Environment environment;
    RestTemplate restTemplate = new RestTemplate();

    @NonFinal
    @Value("${jwt.signerKey}")
    protected String SIGNER_KEY;

    @NonFinal
    protected String GOOGLE_CLIENT_ID;

    @NonFinal
    protected String GOOGLE_CLIENT_SECRET;

    @NonFinal
    protected String GOOGLE_REDIRECT_URI;

    @NonFinal
    @Value("${jwt.valid-duration}")
    protected long VALID_DURATION;

    @NonFinal
    @Value("${jwt.refreshable-duration}")
    protected long REFRESHABLE_DURATION;

    @PostConstruct
    protected void init() {
        GOOGLE_CLIENT_ID = environment.getProperty("spring.security.oauth2.client.registration.google.client-id");
        GOOGLE_CLIENT_SECRET = environment
                .getProperty("spring.security.oauth2.client.registration.google.client-secret");
        GOOGLE_REDIRECT_URI = environment.getProperty("spring.security.oauth2.client.registration.google.redirect-uri");

        if (GOOGLE_CLIENT_ID == null || GOOGLE_CLIENT_SECRET == null || GOOGLE_REDIRECT_URI == null) {
            throw new IllegalStateException(
                    "Google OAuth2 configuration is missing. Please check application-develop.yml");
        }
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        // Tìm user bằng username hoặc email
        User user = userRepository.findByUsername(request.getUsername())
                .orElseGet(() -> userRepository.findByEmail(request.getUsername())
                        .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED)));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new AppException(ErrorCode.INVALID_CREDENTIALS);
        }

        // Cập nhật lastLogin
        user.setLastLogin(LocalDateTime.now());
        user = userRepository.save(user);

        String token = generateToken(user);
        String refreshToken = generateRefreshToken(user);
        UserResponse userResponse = userMapper.toUserResponse(user);

        return AuthResponse.builder()
                .token(token)
                .refreshToken(refreshToken)
                .user(userResponse)
                .build();
    }

    @Override
    public AuthResponse register(RegisterRequest request) {
        // Kiểm tra username đã tồn tại chưa
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new AppException(ErrorCode.USER_EXISTED);
        }

        // Kiểm tra email đã tồn tại chưa
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AppException(ErrorCode.USER_EXISTED);
        }

        // Tạo user mới
        User user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .email(request.getEmail())
                .fullName(request.getFullName())
                .phoneNumber(request.getPhoneNumber())
                .dateOfBirth(request.getDateOfBirth())
                .role(Role.CUSTOMER) // Mặc định là CUSTOMER
                .status("active")
                .build();

        user = userRepository.save(user);

        // Tạo token và trả về response
        String token = generateToken(user);
        String refreshToken = generateRefreshToken(user);
        UserResponse userResponse = userMapper.toUserResponse(user);

        return AuthResponse.builder()
                .token(token)
                .refreshToken(refreshToken)
                .user(userResponse)
                .build();
    }

    private String generateToken(User user) {
        JWSHeader header = new JWSHeader(JWSAlgorithm.HS512);

        JWTClaimsSet claimsSet = new JWTClaimsSet.Builder()
                .subject(user.getUsername())
                .issuer("bookstore.com")
                .issueTime(new Date())
                .expirationTime(new Date(
                        Instant.now().plus(VALID_DURATION, ChronoUnit.SECONDS).toEpochMilli()))
                .claim("scope", user.getRole())
                .build();

        Payload payload = new Payload(claimsSet.toJSONObject());

        JWSObject jwsObject = new JWSObject(header, payload);

        try {
            jwsObject.sign(new MACSigner(SIGNER_KEY.getBytes()));
            return jwsObject.serialize();
        } catch (JOSEException e) {
            throw new RuntimeException("Cannot create token", e);
        }
    }

    private String generateRefreshToken(User user) {
        JWSHeader header = new JWSHeader(JWSAlgorithm.HS512);

        JWTClaimsSet claimsSet = new JWTClaimsSet.Builder()
                .subject(user.getUsername())
                .issuer("bookstore.com")
                .issueTime(new Date())
                .expirationTime(new Date(
                        Instant.now().plus(REFRESHABLE_DURATION, ChronoUnit.SECONDS).toEpochMilli()))
                .jwtID(java.util.UUID.randomUUID().toString())
                .build();

        Payload payload = new Payload(claimsSet.toJSONObject());
        JWSObject jwsObject = new JWSObject(header, payload);

        try {
            jwsObject.sign(new MACSigner(SIGNER_KEY.getBytes()));
            return jwsObject.serialize();
        } catch (JOSEException e) {
            throw new RuntimeException("Cannot create refresh token", e);
        }
    }

    @Override
    public String generateEmailVerificationToken(String email) {
        JWSHeader header = new JWSHeader(JWSAlgorithm.HS512);

        JWTClaimsSet claimsSet = new JWTClaimsSet.Builder()
                .subject(email)
                .issuer("bookstore.com")
                .issueTime(new Date())
                .expirationTime(Date.from(Instant.now().plus(10, ChronoUnit.MINUTES)))
                .claim("type", "email_verification")
                .build();

        JWSObject jwsObject = new JWSObject(header, new Payload(claimsSet.toJSONObject()));

        try {
            jwsObject.sign(new MACSigner(SIGNER_KEY.getBytes()));
            return jwsObject.serialize();
        } catch (JOSEException e) {
            throw new RuntimeException("Cannot create email verification token", e);
        }
    }

    @Override
    public String validateEmailVerificationToken(String token) {
        try {
            JWSObject jwsObject = JWSObject.parse(token);
            jwsObject.verify(new com.nimbusds.jose.crypto.MACVerifier(SIGNER_KEY.getBytes()));

            JWTClaimsSet claims = JWTClaimsSet.parse(jwsObject.getPayload().toJSONObject());

            Date expiration = claims.getExpirationTime();
            if (expiration.before(new Date())) {
                throw new AppException(ErrorCode.TOKEN_EXPIRED);
            }

            if (!"email_verification".equals(claims.getClaim("type"))) {
                throw new AppException(ErrorCode.INVALID_TOKEN_TYPE);
            }

            String email = claims.getSubject();

            // Tìm user và cập nhật isEmailVerified
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

            user.setIsEmailVerified(true);
            userRepository.save(user);

            return email;
        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            throw new AppException(ErrorCode.INVALID_TOKEN);
        }
    }

    @Override
    public AuthResponse handleGoogleOAuthCallback(String code) {
        try {
            log.info("Handling Google OAuth callback with code");

            // Bước 1: Trao đổi authorization code lấy access token
            String accessToken = exchangeCodeForToken(code);

            // Bước 2: Lấy thông tin user từ Google
            Map<String, Object> googleUserInfo = getUserInfoFromGoogle(accessToken);

            // Bước 3: Tạo hoặc tìm user trong database
            User user = createOrUpdateUserFromGoogle(googleUserInfo);

            // Bước 4: Cập nhật lastLogin
            user.setLastLogin(LocalDateTime.now());
            user = userRepository.save(user);

            // Bước 5: Tạo JWT token và trả về
            String token = generateToken(user);
            String refreshToken = generateRefreshToken(user);
            UserResponse userResponse = userMapper.toUserResponse(user);

            log.info("Google OAuth login successful for user: {}", user.getUsername());

            return AuthResponse.builder()
                    .token(token)
                    .refreshToken(refreshToken)
                    .user(userResponse)
                    .build();
        } catch (AppException e) {
            log.error("AppException during Google OAuth callback: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error during Google OAuth callback: {}", e.getMessage(), e);
            throw new AppException(ErrorCode.INVALID_TOKEN);
        }
    }

    @Override
    public void changePassword(String username, ChangePasswordRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new AppException(ErrorCode.INVALID_CREDENTIALS);
        }

        if (!request.getNewPassword().equals(request.getConfimPassword())) {
            throw new AppException(ErrorCode.INVALID_ARGUMENTS);
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    private String exchangeCodeForToken(String code) {
        String tokenUrl = "https://oauth2.googleapis.com/token";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("code", code);
        params.add("client_id", GOOGLE_CLIENT_ID);
        params.add("client_secret", GOOGLE_CLIENT_SECRET);
        params.add("redirect_uri", GOOGLE_REDIRECT_URI);
        params.add("grant_type", "authorization_code");

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(params, headers);

        try {
            log.info("Exchanging Google authorization code for access token");
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    tokenUrl,
                    HttpMethod.POST,
                    request,
                    new org.springframework.core.ParameterizedTypeReference<Map<String, Object>>() {
                    });
            Map<String, Object> responseBody = response.getBody();
            if (responseBody != null && responseBody.containsKey("access_token")) {
                log.info("Successfully obtained access token from Google");
                return (String) responseBody.get("access_token");
            }
            log.error("Failed to get access token from Google. Response: {}", responseBody);
            throw new AppException(ErrorCode.INVALID_TOKEN);
        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error exchanging code for token: {}", e.getMessage(), e);
            throw new AppException(ErrorCode.INVALID_TOKEN);
        }
    }

    private Map<String, Object> getUserInfoFromGoogle(String accessToken) {
        String userInfoUrl = "https://www.googleapis.com/oauth2/v2/userinfo";

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);

        HttpEntity<String> entity = new HttpEntity<>(headers);

        try {
            log.info("Fetching user info from Google");
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    userInfoUrl,
                    HttpMethod.GET,
                    entity,
                    new org.springframework.core.ParameterizedTypeReference<Map<String, Object>>() {
                    });
            Map<String, Object> body = response.getBody();
            if (body == null) {
                log.error("Failed to get user info from Google. Response body is null");
                throw new AppException(ErrorCode.INVALID_TOKEN);
            }
            log.info("Successfully obtained user info from Google. Email: {}", body.get("email"));
            return body;
        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error fetching user info from Google: {}", e.getMessage(), e);
            throw new AppException(ErrorCode.INVALID_TOKEN);
        }
    }

    private User createOrUpdateUserFromGoogle(Map<String, Object> googleUserInfo) {
        String email = (String) googleUserInfo.get("email");
        String name = (String) googleUserInfo.get("name");
        String picture = (String) googleUserInfo.get("picture");

        if (email == null || email.isEmpty()) {
            throw new AppException(ErrorCode.INVALID_TOKEN);
        }

        // Tìm user theo email
        User user = userRepository.findByEmail(email).orElse(null);

        if (user == null) {
            // Tạo user mới nếu chưa tồn tại
            // Tạo username từ email hoặc Google ID
            String username = email.split("@")[0];
            // Đảm bảo username là unique
            int suffix = 1;
            String originalUsername = username;
            while (userRepository.existsByUsername(username)) {
                username = originalUsername + "_" + suffix;
                suffix++;
            }

            // Tạo password random (vì OAuth user không có password)
            String randomPassword = UUID.randomUUID().toString();

            user = User.builder()
                    .username(username)
                    .password(passwordEncoder.encode(randomPassword))
                    .email(email)
                    .fullName(name != null ? name : "")
                    .avatar_url(picture)
                    .role(Role.CUSTOMER)
                    .status("active")
                    .build();

            user = userRepository.save(user);
        } else {
            // Cập nhật thông tin nếu user đã tồn tại
            if (name != null && !name.isEmpty()) {
                user.setFullName(name);
            }
            if (picture != null && !picture.isEmpty()) {
                user.setAvatar_url(picture);
            }
            // Note: lastLogin sẽ được cập nhật trong handleGoogleOAuthCallback sau khi save
            user = userRepository.save(user);
        }

        return user;
    }

    @Override
    public AuthResponse refreshToken(String refreshToken) {
        try {
            // Parse và verify refresh token
            JWSObject jwsObject = JWSObject.parse(refreshToken);
            jwsObject.verify(new MACVerifier(SIGNER_KEY.getBytes()));

            JWTClaimsSet claims = JWTClaimsSet.parse(jwsObject.getPayload().toJSONObject());

            // Kiểm tra token đã hết hạn chưa
            Date expiration = claims.getExpirationTime();
            if (expiration.before(new Date())) {
                throw new AppException(ErrorCode.TOKEN_EXPIRED);
            }

            // Lấy username từ token
            String username = claims.getSubject();

            // Lấy user
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND));

            // Tạo token mới
            String newAccessToken = generateToken(user);
            String newRefreshToken = generateRefreshToken(user);
            UserResponse userResponse = userMapper.toUserResponse(user);

            return AuthResponse.builder()
                    .token(newAccessToken)
                    .refreshToken(newRefreshToken)
                    .user(userResponse)
                    .build();
        } catch (ParseException | JOSEException e) {
            throw new AppException(ErrorCode.INVALID_TOKEN);
        }
    }
}
