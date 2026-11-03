package com.notfound.bookstore.repository;

import com.notfound.bookstore.model.entity.News;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;
@Repository
public interface NewsRepository extends JpaRepository<News, UUID> {
    List<News> findByAuthorId(UUID authorId);
    List<News> findByOrderByCreatedAtDesc();
    // Tin tức mới nhất
    Page<News> findAllByOrderByCreatedAtDesc(Pageable pageable);

    // Tin tức theo tác giả
    Page<News> findByAuthorIdOrderByCreatedAtDesc(UUID authorId, Pageable pageable);

    // Tìm kiếm tin tức
    Page<News> findByTitleContainingIgnoreCaseOrderByCreatedAtDesc(String title, Pageable pageable);

    // THÊM MỚI - Lấy news theo status (DRAFT, PUBLISHED, ARCHIVED)
    Page<News> findByStatusOrderByCreatedAtDesc(News.Status status, Pageable pageable);

    // THÊM MỚI - Tìm theo status và author
    Page<News> findByStatusAndAuthorIdOrderByCreatedAtDesc(News.Status status, UUID authorId, Pageable pageable);

    // THÊM MỚI - Đếm số lượng news theo status
    long countByStatus(News.Status status);
    
    // ========== THỐNG KÊ NEWS ==========
    
    // Đếm số tin nổi bật
    long countByFeaturedTrue();
    
    // Đếm tin tức được tạo trong khoảng thời gian
    long countByCreatedAtBetween(java.time.LocalDateTime start, java.time.LocalDateTime end);
    
    // Tính tổng lượt xem
    @Query("SELECT COALESCE(SUM(n.views), 0) FROM News n")
    Long sumAllViews();
    
    // Tính tổng lượt xem trong khoảng thời gian
    @Query("SELECT COALESCE(SUM(n.views), 0) FROM News n WHERE n.createdAt BETWEEN :start AND :end")
    Long sumViewsBetween(@Param("start") java.time.LocalDateTime start,
                         @Param("end") java.time.LocalDateTime end);

    // Thống kê theo category
    @Query("SELECT n.category, COUNT(n) FROM News n GROUP BY n.category ORDER BY COUNT(n) DESC")
    List<Object[]> countByCategory();
    
    // Top tin tức xem nhiều nhất
    Page<News> findAllByOrderByViewsDesc(Pageable pageable);
    
    // Lấy tin tức theo ngày để tính trend
    @Query("SELECT DATE(n.createdAt), COALESCE(SUM(n.views), 0), COUNT(n) FROM News n WHERE n.createdAt BETWEEN :start AND :end GROUP BY DATE(n.createdAt) ORDER BY DATE(n.createdAt)")
    List<Object[]> getViewsTrendBetween(@Param("start") java.time.LocalDateTime start,
                                        @Param("end") java.time.LocalDateTime end);

    // ========== TÌM KIẾM VỚI TAGS ==========
    
    /**
     * Tìm news có chứa tag cụ thể (sử dụng JSON_CONTAINS)
     * @param tag Tag cần tìm (ví dụ: "tình-yêu")
     * @return List<News> chứa tag đó
     */
    @Query(value =
        "SELECT * FROM news WHERE JSON_CONTAINS(tags, JSON_QUOTE(:tag)) AND status = 'PUBLISHED'",
        nativeQuery = true)
    List<News> findByTag(@Param("tag") String tag);

    /**
     * Full-text search trong tags_searchable (NHANH NHẤT!)
     * Tìm trong tags với FULLTEXT index
     * @param keyword Từ khóa tìm kiếm
     * @param pageable Phân trang
     * @return Page<News>
     */
    @Query(value = """
        SELECT * FROM news 
        WHERE MATCH(tags_searchable) AGAINST(:keyword IN NATURAL LANGUAGE MODE)
        AND status = 'PUBLISHED'
        ORDER BY views DESC
        """, 
        countQuery = """
        SELECT COUNT(*) FROM news 
        WHERE MATCH(tags_searchable) AGAINST(:keyword IN NATURAL LANGUAGE MODE)
        AND status = 'PUBLISHED'
        """,
        nativeQuery = true)
    Page<News> searchByTags(@Param("keyword") String keyword,
                            Pageable pageable);
    
    /**
     * Kết hợp tìm kiếm trong title VÀ tags (RECOMMENDED!)
     * Đây là method chính để người dùng search (chỉ PUBLISHED)
     * @param keyword Từ khóa tìm kiếm
     * @param pageable Phân trang
     * @return Page<News>
     */
    @Query(value = """
        SELECT * FROM news 
        WHERE (
            MATCH(title) AGAINST(:keyword IN NATURAL LANGUAGE MODE)
            OR MATCH(tags_searchable) AGAINST(:keyword IN NATURAL LANGUAGE MODE)
        )
        AND status = 'PUBLISHED'
        ORDER BY (
            MATCH(title) AGAINST(:keyword IN NATURAL LANGUAGE MODE) * 2 +
            MATCH(tags_searchable) AGAINST(:keyword IN NATURAL LANGUAGE MODE)
        ) DESC, views DESC
        """,
        countQuery = """
        SELECT COUNT(*) FROM news 
        WHERE (
            MATCH(title) AGAINST(:keyword IN NATURAL LANGUAGE MODE)
            OR MATCH(tags_searchable) AGAINST(:keyword IN NATURAL LANGUAGE MODE)
        )
        AND status = 'PUBLISHED'
        """,
        nativeQuery = true)
    Page<News> searchByTitleOrTags(@Param("keyword") String keyword,
                                    Pageable pageable);
    
    /**
     * Tìm kiếm trong title cho admin (không filter status)
     * Dùng JPQL thay vì native query để tương thích với Pageable sorting
     * @param keyword Từ khóa tìm kiếm
     * @param pageable Phân trang với sort
     * @return Page<News>
     */
    @Query("SELECT n FROM News n WHERE LOWER(n.title) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<News> searchByTitleForAdmin(@Param("keyword") String keyword,
                                      Pageable pageable);
    
    /**
     * Tìm news theo category và tags
     * @param category Category
     * @param keyword Từ khóa trong tags
     * @param pageable Phân trang
     * @return Page<News>
     */
    @Query(value = """
        SELECT * FROM news 
        WHERE category = :category
        AND MATCH(tags_searchable) AGAINST(:keyword IN NATURAL LANGUAGE MODE)
        AND status = 'PUBLISHED'
        ORDER BY views DESC
        """,
        countQuery = """
        SELECT COUNT(*) FROM news 
        WHERE category = :category
        AND MATCH(tags_searchable) AGAINST(:keyword IN NATURAL LANGUAGE MODE)
        AND status = 'PUBLISHED'
        """,
        nativeQuery = true)
    Page<News> searchByCategoryAndTags(@Param("category") String category,
                                       @Param("keyword") String keyword,
                                       Pageable pageable);
    
    // ============================================
    // Advanced Search Methods (for Admin Panel)
    // ============================================
    
    /**
     * Tìm news theo category (bất kỳ status nào)
     * Dùng cho admin panel filtering
     */
    Page<News> findByCategoryOrderByCreatedAtDesc(String category, Pageable pageable);
    
    /**
     * Tìm news theo category và status cụ thể
     * Dùng cho admin panel filtering với nhiều điều kiện
     */
    Page<News> findByCategoryAndStatusOrderByCreatedAtDesc(String category, 
                                                           News.Status status, 
                                                           Pageable pageable);
    
    /**
     * Tìm news theo featured flag
     * Dùng để lấy tin nổi bật (sắp xếp theo views giảm dần)
     */
    Page<News> findByFeaturedOrderByViewsDesc(Boolean featured, Pageable pageable);
    
    /**
     * Tìm news theo status và featured
     * Dùng để lấy tin nổi bật đã xuất bản
     */
    Page<News> findByStatusAndFeaturedOrderByCreatedAtDesc(News.Status status, Boolean featured, Pageable pageable);
    
    // ============================================
    // Methods with dynamic sorting from Pageable
    // (Không hardcode order - để Pageable quyết định sorting)
    // ============================================
    
    /**
     * Tìm news theo status (dynamic sorting từ Pageable)
     * Dùng cho advanced-search với sort tùy chọn
     */
    Page<News> findByStatus(News.Status status, Pageable pageable);
    
    /**
     * Tìm news theo category (dynamic sorting từ Pageable)
     */
    Page<News> findByCategory(String category, Pageable pageable);
    
    /**
     * Tìm news theo category và status (dynamic sorting từ Pageable)
     */
    Page<News> findByCategoryAndStatus(String category, News.Status status, Pageable pageable);
}
