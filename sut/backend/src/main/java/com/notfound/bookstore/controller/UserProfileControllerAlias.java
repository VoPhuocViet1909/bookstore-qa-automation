package com.notfound.bookstore.controller;

import com.notfound.bookstore.model.dto.response.ApiResponse;
import com.notfound.bookstore.model.dto.response.userresponse.UserResponse;
import com.notfound.bookstore.model.mapper.UserMapper;
import com.notfound.bookstore.security.SecurityUtils;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller alias để hỗ trợ URL /api/users/me (có "s") cho tương thích ngược
 * Lưu ý: Nên sử dụng /api/user/me (không có "s") thay vì /api/users/me
 */
@Slf4j
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserProfileControllerAlias {

    SecurityUtils securityUtils;
    UserMapper userMapper;

    /**
     * Alias endpoint để hỗ trợ /api/users/me
     * GET /api/users/me
     * 
     * @deprecated Sử dụng /api/user/me thay vì endpoint này
     * @return Thông tin user hiện tại
     */
    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    public ApiResponse<UserResponse> getCurrentUserAlias() {
        log.warn("GET /api/users/me - Using deprecated endpoint. Please use /api/user/me instead");
        var currentUser = securityUtils.getCurrentUser();
        UserResponse userResponse = userMapper.toUserResponse(currentUser);
        
        return ApiResponse.<UserResponse>builder()
                .code(1000)
                .message("Lấy thông tin user thành công")
                .result(userResponse)
                .build();
    }
}

