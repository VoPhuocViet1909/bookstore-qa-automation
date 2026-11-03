package com.notfound.bookstore.repository;

import com.notfound.bookstore.model.entity.Book;
import com.notfound.bookstore.model.entity.User;
import com.notfound.bookstore.model.enums.Role;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    // Đăng nhập
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);

    // Kiểm tra trùng lặp
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);

    // Admin: Quản lý user
    Page<User> findByRole(Role role, Pageable pageable);

    // Tìm kiếm user
    Page<User> findByUsernameContainingIgnoreCaseOrEmailContainingIgnoreCase(
            String username, String email, Pageable pageable);

    // Kiểm tra user đã từng đặt hàng chưa (để xóa)
    @Query("SELECT CASE WHEN COUNT(o) > 0 THEN true ELSE false END FROM Order o WHERE o.customer.id = :userId")
    boolean hasOrders(@Param("userId") UUID userId);

    // ✅ THÊM MỚI: Lấy UUID từ username (cho News)
    @Query("SELECT u.id FROM User u WHERE u.username = :username")
    Optional<UUID> findIdByUsername(@Param("username") String username);

    // ===== QUẢN LÝ NGƯỜI DÙNG - ADMIN =====
    
    // Tìm kiếm user theo keyword
    @Query("SELECT u FROM User u WHERE " +
           "LOWER(u.username) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(u.fullName) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<User> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);

    // Lọc theo status
    Page<User> findByStatus(String status, Pageable pageable);

    // Lọc theo role và status
    Page<User> findByRoleAndStatus(Role role, String status, Pageable pageable);

    // Thống kê theo role
    long countByRole(Role role);

    // Thống kê theo status
    long countByStatus(String status);

    // Lấy top users theo tổng chi tiêu
    @Query("SELECT u FROM User u LEFT JOIN u.orders o " +
           "GROUP BY u.id ORDER BY SUM(o.totalAmount) DESC")
    List<User> findTopSpenders(Pageable pageable);

    // Lấy top users theo số đơn hàng
    @Query("SELECT u FROM User u LEFT JOIN u.orders o " +
           "GROUP BY u.id ORDER BY COUNT(o.id) DESC")
    List<User> findTopBuyers(Pageable pageable);

    // TODO: Đếm user mới trong tháng - Cần thêm createdAt field vào User entity
    // @Query("SELECT COUNT(u) FROM User u WHERE YEAR(u.createdAt) = :year AND MONTH(u.createdAt) = :month")
    // long countNewUsersInMonth(@Param("year") int year, @Param("month") int month);

    // Lấy tất cả users với thống kê
    @Query("SELECT u FROM User u LEFT JOIN FETCH u.orders WHERE u.id = :userId")
    Optional<User> findByIdWithOrders(@Param("userId") UUID userId);

    // Tìm kiếm và lọc phức tạp
    @Query("SELECT u FROM User u WHERE " +
           "(:search IS NULL OR LOWER(u.username) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(u.fullName) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:role IS NULL OR u.role = :role) AND " +
           "(:status IS NULL OR u.status = :status)")
    Page<User> findByFilters(@Param("search") String search,
                             @Param("role") Role role,
                             @Param("status") String status,
                             Pageable pageable);
}
