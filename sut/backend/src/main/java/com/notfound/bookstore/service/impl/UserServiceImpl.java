package com.notfound.bookstore.service.impl;

import com.notfound.bookstore.exception.AppException;
import com.notfound.bookstore.exception.ErrorCode;
import com.notfound.bookstore.model.dto.request.userrequest.CreateUserRequest;
import com.notfound.bookstore.model.dto.request.userrequest.UpdateUserRequest;
import com.notfound.bookstore.model.dto.request.userrequest.UserFilterRequest;
import com.notfound.bookstore.model.dto.response.userresponse.UserDetailResponse;
import com.notfound.bookstore.model.dto.response.userresponse.UserManagementResponse;
import com.notfound.bookstore.model.dto.response.userresponse.UserResponse;
import com.notfound.bookstore.model.dto.response.userresponse.UserStatsResponse;
import com.notfound.bookstore.model.entity.Order;
import com.notfound.bookstore.model.entity.User;
import com.notfound.bookstore.model.enums.Role;
import com.notfound.bookstore.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.io.ByteArrayOutputStream;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class UserServiceImpl implements com.notfound.bookstore.service.UserService {

    PasswordEncoder passwordEncoder;
    UserRepository userRepository;
    com.notfound.bookstore.service.ImageService imageService;

    @Override
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    @Override
    public void resetPassword(String email, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    // ===== CRUD OPERATIONS =====

    @Override
    @Transactional(readOnly = true)
    public Page<UserManagementResponse> getAllUsers(UserFilterRequest filterRequest) {
        log.info("Getting all users with filters: {}", filterRequest);

        // Tạo Pageable
        int page = filterRequest.getPage() != null ? filterRequest.getPage() : 0;
        int size = filterRequest.getSize() != null ? filterRequest.getSize() : 10;

        String sortBy = filterRequest.getSortBy() != null ? filterRequest.getSortBy() : "username";
        String sortDirection = filterRequest.getSortDirection() != null ? filterRequest.getSortDirection() : "asc";

        Sort sort = sortDirection.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);

        // Parse role
        Role role = null;
        if (filterRequest.getRole() != null && !filterRequest.getRole().isEmpty()) {
            try {
                role = Role.valueOf(filterRequest.getRole().toUpperCase());
            } catch (IllegalArgumentException e) {
                log.warn("Invalid role: {}", filterRequest.getRole());
            }
        }

        // Lấy users theo filter
        Page<User> userPage = userRepository.findByFilters(
                filterRequest.getSearch(),
                role,
                filterRequest.getStatus(),
                pageable);

        // Map to DTO
        return userPage.map(this::mapToUserManagementResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public UserDetailResponse getUserById(UUID id) {
        log.info("Getting user detail by id: {}", id);

        User user = userRepository.findByIdWithOrders(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        return mapToUserDetailResponse(user);
    }

    @Override
    @Transactional
    public UserResponse createUser(CreateUserRequest request) {
        log.info("Creating new user: {}", request.getUsername());

        // Validate username không trùng
        if (userRepository.existsByUsername(request.getUsername())) {
            log.warn("Username already exists: {}", request.getUsername());
            throw new AppException(ErrorCode.USERNAME_EXISTED);
        }

        // Validate email không trùng
        if (userRepository.existsByEmail(request.getEmail())) {
            log.warn("Email already exists: {}", request.getEmail());
            throw new AppException(ErrorCode.EMAIL_EXISTED);
        }

        // Create user entity
        User user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .email(request.getEmail())
                .fullName(request.getFullName())
                .phoneNumber(request.getPhoneNumber())
                .gender(request.getGender())
                .avatar_url(request.getAvatarUrl())
                .dateOfBirth(request.getDateOfBirth())
                .role(request.getRole() != null ? Role.valueOf(request.getRole()) : Role.CUSTOMER)
                .status("active") // Default status
                .build();

        User savedUser = userRepository.save(user);
        log.info("Created user successfully: {}", savedUser.getId());

        return mapToUserResponse(savedUser);
    }

    @Override
    @Transactional
    public UserResponse updateUser(UUID id, UpdateUserRequest request) {
        log.info("Updating user: {}", id);

        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        // Update fields
        if (request.getFullName() != null) {
            user.setFullName(request.getFullName());
        }
        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
            // Check email không trùng
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new AppException(ErrorCode.USER_EXISTED);
            }
            user.setEmail(request.getEmail());
        }
        if (request.getPhoneNumber() != null) {
            user.setPhoneNumber(request.getPhoneNumber());
        }
        if (request.getGender() != null) {
            user.setGender(request.getGender());
        }
        if (request.getDateOfBirth() != null) {
            user.setDateOfBirth(request.getDateOfBirth());
        }

        User updatedUser = userRepository.save(user);
        log.info("Updated user successfully: {}", id);

        return mapToUserResponse(updatedUser);
    }

    @Override
    @Transactional
    public void deleteUser(UUID id) {
        log.info("Deleting user: {}", id);

        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        // Kiểm tra user có đơn hàng không
        if (userRepository.hasOrders(id)) {
            throw new AppException(ErrorCode.USER_HAS_ORDERS);
        }

        // Không cho xóa ADMIN
        if (user.getRole() == Role.ADMIN) {
            throw new AppException(ErrorCode.CANNOT_DELETE_ADMIN);
        }

        userRepository.delete(user);
        log.info("Deleted user successfully: {}", id);
    }

    // ===== STATUS MANAGEMENT =====

    @Override
    @Transactional
    public UserResponse updateUserStatus(UUID id, String status) {
        log.info("Updating user status: {} to {}", id, status);

        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        // Validate status
        if (!status.matches("^(active|inactive|banned)$")) {
            throw new IllegalArgumentException("Invalid status: " + status);
        }

        user.setStatus(status);
        User updatedUser = userRepository.save(user);

        log.info("Updated user status successfully: {}", id);
        return mapToUserResponse(updatedUser);
    }

    @Override
    @Transactional
    public UserResponse banUser(UUID id) {
        log.info("Banning user: {}", id);

        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        // Không cho ban ADMIN
        if (user.getRole() == Role.ADMIN) {
            throw new AppException(ErrorCode.CANNOT_BAN_ADMIN);
        }

        user.setStatus("banned");
        User bannedUser = userRepository.save(user);

        log.info("Banned user successfully: {}", id);
        return mapToUserResponse(bannedUser);
    }

    @Override
    @Transactional
    public UserResponse unbanUser(UUID id) {
        log.info("Unbanning user: {}", id);

        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        user.setStatus("active");
        User unbannedUser = userRepository.save(user);

        log.info("Unbanned user successfully: {}", id);
        return mapToUserResponse(unbannedUser);
    }

    // ===== STATISTICS =====

    @Override
    @Transactional(readOnly = true)
    public UserStatsResponse getUserStatistics() {
        log.info("Getting user statistics");

        long totalUsers = userRepository.count();
        long activeUsers = userRepository.countByStatus("active");
        long inactiveUsers = userRepository.countByStatus("inactive");
        long bannedUsers = userRepository.countByStatus("banned");

        long totalAdmins = userRepository.countByRole(Role.ADMIN);
        long totalCustomers = userRepository.countByRole(Role.CUSTOMER);
        long totalGuests = userRepository.countByRole(Role.GUEST);

        // Tính thống kê doanh thu (tất cả thời gian)
        List<User> allUsers = userRepository.findAll();
        BigDecimal totalRevenue = allUsers.stream()
                .flatMap(u -> u.getOrders() != null ? u.getOrders().stream() : java.util.stream.Stream.empty())
                .map(Order::getTotalAmount)
                .map(amount -> amount != null ? BigDecimal.valueOf(amount) : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long totalOrders = allUsers.stream()
                .mapToLong(u -> u.getOrders() != null ? u.getOrders().size() : 0)
                .sum();

        BigDecimal avgRevenuePerUser = totalUsers > 0
                ? totalRevenue.divide(BigDecimal.valueOf(totalUsers), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        BigDecimal avgOrderValue = totalOrders > 0
                ? totalRevenue.divide(BigDecimal.valueOf(totalOrders), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        // Get top users
        List<UserStatsResponse.TopUserResponse> topSpenders = getTopSpenders(5);
        List<UserStatsResponse.TopUserResponse> topBuyers = getTopBuyers(5);

        return UserStatsResponse.builder()
                .totalUsers(totalUsers)
                .activeUsers(activeUsers)
                .inactiveUsers(inactiveUsers)
                .bannedUsers(bannedUsers)
                .totalAdmins(totalAdmins)
                .totalCustomers(totalCustomers)
                .totalGuests(totalGuests)
                .newUsersThisMonth(0L) // TODO: Implement
                .newUsersThisWeek(0L) // TODO: Implement
                .newUsersToday(0L) // TODO: Implement
                .totalRevenue(totalRevenue)
                .avgRevenuePerUser(avgRevenuePerUser)
                .avgOrderValue(avgOrderValue)
                .totalOrders(totalOrders)
                .topSpenders(topSpenders)
                .topBuyers(topBuyers)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public UserStatsResponse getUserStatistics(LocalDateTime startDate, LocalDateTime endDate) {
        log.info("Getting user statistics for date range: {} to {}", startDate, endDate);

        long totalUsers = userRepository.count();
        long activeUsers = userRepository.countByStatus("active");
        long inactiveUsers = userRepository.countByStatus("inactive");
        long bannedUsers = userRepository.countByStatus("banned");

        long totalAdmins = userRepository.countByRole(Role.ADMIN);
        long totalCustomers = userRepository.countByRole(Role.CUSTOMER);
        long totalGuests = userRepository.countByRole(Role.GUEST);

        // Tính thống kê doanh thu trong khoảng thời gian
        List<User> allUsers = userRepository.findAll();
        BigDecimal totalRevenue = allUsers.stream()
                .flatMap(u -> u.getOrders() != null ? u.getOrders().stream() : java.util.stream.Stream.empty())
                .filter(order -> {
                    LocalDateTime orderDate = order.getOrderDate();
                    return orderDate != null && 
                           !orderDate.isBefore(startDate) && 
                           !orderDate.isAfter(endDate);
                })
                .map(Order::getTotalAmount)
                .map(amount -> amount != null ? BigDecimal.valueOf(amount) : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long totalOrders = allUsers.stream()
                .flatMap(u -> u.getOrders() != null ? u.getOrders().stream() : java.util.stream.Stream.empty())
                .filter(order -> {
                    LocalDateTime orderDate = order.getOrderDate();
                    return orderDate != null && 
                           !orderDate.isBefore(startDate) && 
                           !orderDate.isAfter(endDate);
                })
                .count();

        BigDecimal avgRevenuePerUser = totalUsers > 0
                ? totalRevenue.divide(BigDecimal.valueOf(totalUsers), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        BigDecimal avgOrderValue = totalOrders > 0
                ? totalRevenue.divide(BigDecimal.valueOf(totalOrders), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        // Get top users
        List<UserStatsResponse.TopUserResponse> topSpenders = getTopSpenders(5);
        List<UserStatsResponse.TopUserResponse> topBuyers = getTopBuyers(5);

        return UserStatsResponse.builder()
                .totalUsers(totalUsers)
                .activeUsers(activeUsers)
                .inactiveUsers(inactiveUsers)
                .bannedUsers(bannedUsers)
                .totalAdmins(totalAdmins)
                .totalCustomers(totalCustomers)
                .totalGuests(totalGuests)
                .newUsersThisMonth(0L) // TODO: Implement
                .newUsersThisWeek(0L) // TODO: Implement
                .newUsersToday(0L) // TODO: Implement
                .totalRevenue(totalRevenue)
                .avgRevenuePerUser(avgRevenuePerUser)
                .avgOrderValue(avgOrderValue)
                .totalOrders(totalOrders)
                .topSpenders(topSpenders)
                .topBuyers(topBuyers)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserStatsResponse.TopUserResponse> getTopSpenders(int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        List<User> topUsers = userRepository.findTopSpenders(pageable);

        return topUsers.stream()
                .map(this::mapToTopUserResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserStatsResponse.TopUserResponse> getTopBuyers(int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        List<User> topUsers = userRepository.findTopBuyers(pageable);

        return topUsers.stream()
                .map(this::mapToTopUserResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> getNewUsers(int days) {
        // TODO: Implement với LocalDateTime
        return List.of();
    }

    @Override
    @Transactional
    public UserResponse updateProfile(String username,
            com.notfound.bookstore.model.dto.request.userrequest.UpdateProfileRequest request) {
        log.info("Updating profile for user: {}", username);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        if (request.getFullName() != null) {
            user.setFullName(request.getFullName());
        }
        if (request.getPhoneNumber() != null) {
            user.setPhoneNumber(request.getPhoneNumber());
        }
        if (request.getGender() != null) {
            user.setGender(request.getGender());
        }
        if (request.getDateOfBirth() != null) {
            user.setDateOfBirth(request.getDateOfBirth());
        }

        org.springframework.web.multipart.MultipartFile avatar = request.getAvatar();
        if (avatar != null && !avatar.isEmpty()) {
            // Upload avatar to Cloudinary
            java.util.Map<String, Object> uploadResult = imageService.uploadImage(avatar, "bookstore/avatars");
            String avatarUrl = (String) uploadResult.get("url");
            user.setAvatar_url(avatarUrl);
        }

        User updatedUser = userRepository.save(user);
        log.info("Updated profile successfully for user: {}", username);

        return mapToUserResponse(updatedUser);
    }

    @Override
    public byte[] exportUsersToExcel() {
        try {
            log.info("Exporting all users to Excel...");

            // Get all users
            List<User> users = userRepository.findAll();

            // Create workbook and sheet
            Workbook workbook = new XSSFWorkbook();
            Sheet sheet = workbook.createSheet("Danh Sách Người Dùng");

            // Create header style
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setFontHeightInPoints((short) 12);
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setBorderBottom(BorderStyle.THIN);
            headerStyle.setBorderTop(BorderStyle.THIN);
            headerStyle.setBorderLeft(BorderStyle.THIN);
            headerStyle.setBorderRight(BorderStyle.THIN);
            headerStyle.setAlignment(HorizontalAlignment.CENTER);

            // Create data style
            CellStyle dataStyle = workbook.createCellStyle();
            dataStyle.setBorderBottom(BorderStyle.THIN);
            dataStyle.setBorderTop(BorderStyle.THIN);
            dataStyle.setBorderLeft(BorderStyle.THIN);
            dataStyle.setBorderRight(BorderStyle.THIN);
            dataStyle.setWrapText(true);

            // Create header row
            Row headerRow = sheet.createRow(0);
            String[] columns = {
                    "STT", "Tên đăng nhập", "Email", "Họ và tên", "Số điện thoại",
                    "Vai trò", "Trạng thái", "Ngày sinh", "Điểm", "Hạng thành viên",
                    "Email xác thực", "Tổng đơn hàng", "Tổng chi tiêu", "Ngày tạo", "Đăng nhập gần nhất"
            };

            for (int i = 0; i < columns.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
                cell.setCellStyle(headerStyle);
            }

            // Create date format
            CellStyle dateStyle = workbook.createCellStyle();
            dateStyle.cloneStyleFrom(dataStyle);
            CreationHelper createHelper = workbook.getCreationHelper();
            dateStyle.setDataFormat(createHelper.createDataFormat().getFormat("dd/MM/yyyy HH:mm"));

            // Create currency format
            CellStyle currencyStyle = workbook.createCellStyle();
            currencyStyle.cloneStyleFrom(dataStyle);
            currencyStyle.setDataFormat(createHelper.createDataFormat().getFormat("#,##0 ₫"));

            // Fill data rows
            int rowNum = 1;
            for (User user : users) {
                Row row = sheet.createRow(rowNum++);

                // Calculate totals
                int totalOrders = user.getOrders() != null ? user.getOrders().size() : 0;
                BigDecimal totalSpent = user.getOrders() != null
                        ? user.getOrders().stream()
                                .map(Order::getTotalAmount)
                                .map(amount -> amount != null ? BigDecimal.valueOf(amount) : BigDecimal.ZERO)
                                .reduce(BigDecimal.ZERO, BigDecimal::add)
                        : BigDecimal.ZERO;

                // STT
                Cell cell0 = row.createCell(0);
                cell0.setCellValue(rowNum - 1);
                cell0.setCellStyle(dataStyle);

                // Username
                Cell cell1 = row.createCell(1);
                cell1.setCellValue(user.getUsername() != null ? user.getUsername() : "");
                cell1.setCellStyle(dataStyle);

                // Email
                Cell cell2 = row.createCell(2);
                cell2.setCellValue(user.getEmail() != null ? user.getEmail() : "");
                cell2.setCellStyle(dataStyle);

                // Full name
                Cell cell3 = row.createCell(3);
                cell3.setCellValue(user.getFullName() != null ? user.getFullName() : "");
                cell3.setCellStyle(dataStyle);

                // Phone number
                Cell cell4 = row.createCell(4);
                cell4.setCellValue(user.getPhoneNumber() != null ? user.getPhoneNumber() : "");
                cell4.setCellStyle(dataStyle);

                // Role
                Cell cell5 = row.createCell(5);
                cell5.setCellValue(user.getRole() != null ? user.getRole().name() : "");
                cell5.setCellStyle(dataStyle);

                // Status
                Cell cell6 = row.createCell(6);
                cell6.setCellValue(user.getStatus() != null ? user.getStatus() : "active");
                cell6.setCellStyle(dataStyle);

                // Date of birth
                Cell cell7 = row.createCell(7);
                if (user.getDateOfBirth() != null) {
                    cell7.setCellValue(java.sql.Date.valueOf(user.getDateOfBirth()));
                    cell7.setCellStyle(dateStyle);
                } else {
                    cell7.setCellValue("");
                    cell7.setCellStyle(dataStyle);
                }

                // Points
                Cell cell8 = row.createCell(8);
                cell8.setCellValue(user.getPoints() != null ? user.getPoints() : 0);
                cell8.setCellStyle(dataStyle);

                // Membership tier
                Cell cell9 = row.createCell(9);
                cell9.setCellValue(user.getMembershipTier() != null ? user.getMembershipTier().name() : "");
                cell9.setCellStyle(dataStyle);

                // Email verified
                Cell cell10 = row.createCell(10);
                cell10.setCellValue(user.getIsEmailVerified() != null && user.getIsEmailVerified() ? "Đã xác thực"
                        : "Chưa xác thực");
                cell10.setCellStyle(dataStyle);

                // Total orders
                Cell cell11 = row.createCell(11);
                cell11.setCellValue(totalOrders);
                cell11.setCellStyle(dataStyle);

                // Total spent
                Cell cell12 = row.createCell(12);
                cell12.setCellValue(totalSpent.doubleValue());
                cell12.setCellStyle(currencyStyle);

                // Created at
                Cell cell13 = row.createCell(13);
                if (user.getCreatedAt() != null) {
                    cell13.setCellValue(java.sql.Timestamp.valueOf(user.getCreatedAt()));
                    cell13.setCellStyle(dateStyle);
                } else {
                    cell13.setCellValue("");
                    cell13.setCellStyle(dataStyle);
                }

                // Last login
                Cell cell14 = row.createCell(14);
                if (user.getLastLogin() != null) {
                    cell14.setCellValue(java.sql.Timestamp.valueOf(user.getLastLogin()));
                    cell14.setCellStyle(dateStyle);
                } else {
                    cell14.setCellValue("");
                    cell14.setCellStyle(dataStyle);
                }
            }

            // Auto-size columns
            for (int i = 0; i < columns.length; i++) {
                sheet.autoSizeColumn(i);
                // Add some extra width
                sheet.setColumnWidth(i, sheet.getColumnWidth(i) + 1000);
            }

            // Write to byte array
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);
            workbook.close();

            byte[] excelData = outputStream.toByteArray();
            log.info("Exported {} users to Excel successfully. File size: {} bytes", users.size(), excelData.length);

            return excelData;

        } catch (Exception e) {
            log.error("Error exporting users to Excel: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to export users to Excel: " + e.getMessage(), e);
        }
    }

    // ===== MAPPING METHODS =====

    private UserManagementResponse mapToUserManagementResponse(User user) {
        int totalOrders = user.getOrders() != null ? user.getOrders().size() : 0;
        BigDecimal totalSpent = user.getOrders() != null
                ? user.getOrders().stream()
                        .map(Order::getTotalAmount)
                        .map(amount -> amount != null ? BigDecimal.valueOf(amount) : BigDecimal.ZERO)
                        .reduce(BigDecimal.ZERO, BigDecimal::add)
                : BigDecimal.ZERO;

        return UserManagementResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phoneNumber(user.getPhoneNumber())
                .gender(user.getGender())
                .avatarUrl(user.getAvatar_url())
                .role(user.getRole().name())
                .status(user.getStatus() != null ? user.getStatus() : "active")
                .dateOfBirth(user.getDateOfBirth())
                .points(user.getPoints())
                .membershipTier(user.getMembershipTier() != null ? user.getMembershipTier().name() : null)
                .isEmailVerified(user.getIsEmailVerified())
                .createdAt(user.getCreatedAt())
                .lastLogin(user.getLastLogin())
                .totalOrders(totalOrders)
                .totalSpent(totalSpent)
                .build();
    }

    private UserDetailResponse mapToUserDetailResponse(User user) {
        int totalOrders = user.getOrders() != null ? user.getOrders().size() : 0;
        int totalReviews = user.getReviews() != null ? user.getReviews().size() : 0;
        BigDecimal totalSpent = user.getOrders() != null
                ? user.getOrders().stream()
                        .map(Order::getTotalAmount)
                        .map(amount -> amount != null ? BigDecimal.valueOf(amount) : BigDecimal.ZERO)
                        .reduce(BigDecimal.ZERO, BigDecimal::add)
                : BigDecimal.ZERO;

        LocalDateTime lastOrderDate = user.getOrders() != null && !user.getOrders().isEmpty()
                ? user.getOrders().stream()
                        .map(Order::getOrderDate)
                        .max(LocalDateTime::compareTo)
                        .orElse(null)
                : null;

        return UserDetailResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phoneNumber(user.getPhoneNumber())
                .gender(user.getGender())
                .avatarUrl(user.getAvatar_url())
                .role(user.getRole().name())
                .status(user.getStatus() != null ? user.getStatus() : "active")
                .dateOfBirth(user.getDateOfBirth())
                .points(user.getPoints())
                .membershipTier(user.getMembershipTier() != null ? user.getMembershipTier().name() : null)
                .isEmailVerified(user.getIsEmailVerified())
                .authProvider(user.getAuthProvider() != null ? user.getAuthProvider().name() : null)
                .providerId(user.getProviderId())
                .totalOrders(totalOrders)
                .totalSpent(totalSpent)
                .totalReviews(totalReviews)
                .lastOrderDate(lastOrderDate)
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .lastLoginAt(user.getLastLogin())
                .build();
    }

    private UserResponse mapToUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phoneNumber(user.getPhoneNumber())
                .gender(user.getGender())
                .role(user.getRole().name())
                .status(user.getStatus() != null ? user.getStatus() : "active")
                .dateOfBirth(user.getDateOfBirth())
                .points(user.getPoints())
                .membershipTier(user.getMembershipTier() != null ? user.getMembershipTier().name() : null)
                .isEmailVerified(user.getIsEmailVerified())
                .authProvider(user.getAuthProvider() != null ? user.getAuthProvider().name() : null)
                .lastLogin(user.getLastLogin())
                .avatar(user.getAvatar_url())
                .build();
    }

    private UserStatsResponse.TopUserResponse mapToTopUserResponse(User user) {
        int totalOrders = user.getOrders() != null ? user.getOrders().size() : 0;
        BigDecimal totalSpent = user.getOrders() != null
                ? user.getOrders().stream()
                        .map(Order::getTotalAmount)
                        .map(amount -> amount != null ? BigDecimal.valueOf(amount) : BigDecimal.ZERO)
                        .reduce(BigDecimal.ZERO, BigDecimal::add)
                : BigDecimal.ZERO;

        return UserStatsResponse.TopUserResponse.builder()
                .userId(user.getId().toString())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .avatarUrl(user.getAvatar_url())
                .totalOrders(totalOrders)
                .totalSpent(totalSpent)
                .build();
    }
}
