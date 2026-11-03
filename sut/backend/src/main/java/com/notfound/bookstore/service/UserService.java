package com.notfound.bookstore.service;

import com.notfound.bookstore.model.dto.request.userrequest.CreateUserRequest;
import com.notfound.bookstore.model.dto.request.userrequest.UpdateUserRequest;
import com.notfound.bookstore.model.dto.request.userrequest.UserFilterRequest;
import com.notfound.bookstore.model.dto.response.userresponse.UserDetailResponse;
import com.notfound.bookstore.model.dto.response.userresponse.UserManagementResponse;
import com.notfound.bookstore.model.dto.response.userresponse.UserResponse;
import com.notfound.bookstore.model.dto.response.userresponse.UserStatsResponse;
import org.springframework.data.domain.Page;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface UserService {
    // Existing methods
    boolean existsByEmail(String email);

    void resetPassword(String email, String newPassword);

    // ===== CRUD OPERATIONS =====

    /**
     * Lấy danh sách tất cả users với phân trang và filter
     */
    Page<UserManagementResponse> getAllUsers(UserFilterRequest filterRequest);

    /**
     * Lấy chi tiết một user theo ID
     */
    UserDetailResponse getUserById(UUID id);

    /**
     * Tạo user mới (Admin only)
     */
    UserResponse createUser(CreateUserRequest request);

    /**
     * Cập nhật thông tin user
     */
    UserResponse updateUser(UUID id, UpdateUserRequest request);

    /**
     * Xóa user (Admin only)
     */
    void deleteUser(UUID id);

    // ===== STATUS MANAGEMENT =====

    /**
     * Cập nhật trạng thái user (active/inactive/banned)
     */
    UserResponse updateUserStatus(UUID id, String status);

    /**
     * Cấm user
     */
    UserResponse banUser(UUID id);

    /**
     * Bỏ cấm user
     */
    UserResponse unbanUser(UUID id);

    // ===== STATISTICS =====

    /**
     * Lấy thống kê tổng quan về users
     */
    UserStatsResponse getUserStatistics();

    /**
     * Lấy thống kê tổng quan về users trong khoảng thời gian
     */
    UserStatsResponse getUserStatistics(LocalDateTime startDate, LocalDateTime endDate);

    /**
     * Lấy danh sách top users chi tiêu nhiều nhất
     */
    List<UserStatsResponse.TopUserResponse> getTopSpenders(int limit);

    /**
     * Lấy danh sách top users mua nhiều đơn nhất
     */
    List<UserStatsResponse.TopUserResponse> getTopBuyers(int limit);

    /**
     * Lấy danh sách users mới trong X ngày gần đây
     */
    List<UserResponse> getNewUsers(int days);

    // ===== EXPORT =====

    /**
     * /**
     * Xuất dữ liệu users ra file Excel
     */
    byte[] exportUsersToExcel();

    /**
     * Cập nhật profile user (cho user tự cập nhật)
     */
    UserResponse updateProfile(String username,
            com.notfound.bookstore.model.dto.request.userrequest.UpdateProfileRequest request);
}
