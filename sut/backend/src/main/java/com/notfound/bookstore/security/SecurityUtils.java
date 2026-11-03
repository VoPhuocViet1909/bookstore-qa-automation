package com.notfound.bookstore.security;

import com.notfound.bookstore.exception.AppException;
import com.notfound.bookstore.exception.ErrorCode;
import com.notfound.bookstore.model.entity.User;
import com.notfound.bookstore.model.enums.Role;
import com.notfound.bookstore.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@RequiredArgsConstructor
public class SecurityUtils {

    private final UserRepository userRepository;

    /**
     * Lấy User từ JWT token trong SecurityContext
     *
     * @return User hiện tại đang đăng nhập
     * @throws AppException nếu user không tồn tại
     */
    public User getCurrentUser() {
        String username = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        return userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
    }

    /**
     * Lấy username của user hiện tại đang đăng nhập
     *
     * @return Optional<String> username
     */
    public java.util.Optional<String> getCurrentUserLogin() {
        org.springframework.security.core.Authentication authentication = SecurityContextHolder.getContext()
                .getAuthentication();
        if (authentication == null) {
            return java.util.Optional.empty();
        }
        String principal = authentication.getName();
        return java.util.Optional.ofNullable(principal);
    }

    /**
     * Lấy User từ JWT token truyền vào
     *
     * @param jwt JWT token
     * @return User
     * @throws AppException nếu user không tồn tại
     */
    public User getUserFromJwt(Jwt jwt) {
        if (jwt == null) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        String username = jwt.getSubject();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
    }

    /**
     * Kiểm tra xem user hiện tại có role ADMIN không
     *
     * @return true nếu là ADMIN
     */
    public boolean isAdmin() {
        User currentUser = getCurrentUser();
        return currentUser.getRole() == Role.ADMIN;
    }

    /**
     * Kiểm tra xem user có sở hữu resource không
     *
     * @param resourceOwnerId ID của chủ sở hữu resource
     * @return true nếu là chủ sở hữu hoặc ADMIN
     */
    public boolean canAccessResource(UUID resourceOwnerId) {
        User currentUser = getCurrentUser();
        return currentUser.getId().equals(resourceOwnerId) || isAdmin();
    }
}