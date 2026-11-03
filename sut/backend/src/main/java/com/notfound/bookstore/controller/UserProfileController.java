package com.notfound.bookstore.controller;

import com.notfound.bookstore.model.dto.request.userrequest.UpdateProfileRequest;
import com.notfound.bookstore.model.dto.response.ApiResponse;
import com.notfound.bookstore.model.dto.response.userresponse.UserResponse;
import com.notfound.bookstore.security.SecurityUtils;
import com.notfound.bookstore.service.UserService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class UserProfileController {

        UserService userService;
        SecurityUtils securityUtils;

        /**
         * Cập nhật thông tin cá nhân của user đang đăng nhập
         * PUT /api/users/profile
         * Consumes: multipart/form-data
         */
        @PutMapping(value = "/profile", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
        public ApiResponse<UserResponse> updateProfile(
                        @ModelAttribute @Valid UpdateProfileRequest request) {
                String currentUsername = securityUtils.getCurrentUserLogin()
                                .orElseThrow(() -> new RuntimeException("User not authenticated"));

                log.info("PUT /api/users/profile - Updating profile for user: {}", currentUsername);

                UserResponse userResponse = userService.updateProfile(currentUsername, request);

                return ApiResponse.<UserResponse>builder()
                                .code(200)
                                .message("Cập nhật thông tin thành công")
                                .result(userResponse)
                                .build();
        }
}
