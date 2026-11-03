package com.notfound.bookstore.controller;

import com.notfound.bookstore.exception.AppException;
import com.notfound.bookstore.exception.ErrorCode;
import com.notfound.bookstore.model.dto.request.newsrequest.CreateNewsRequest;
import com.notfound.bookstore.model.dto.response.ApiResponse;
import com.notfound.bookstore.model.dto.response.newsresponse.NewsResponse;
import com.notfound.bookstore.model.entity.News;
import com.notfound.bookstore.repository.UserRepository;
import com.notfound.bookstore.service.NewsService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

/**
 * @Dự án: DHKTPM18B_NotFound_WebSiteBanSach
 * @Class: NewsController
 * @Tạo vào ngày: 11/15/2025
 * @Tác giả: Nguyen Huu Sang
 */

@RestController
@RequestMapping("/api/news")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class NewsController {

    NewsService newsService;
    UserRepository userRepository; // ✅ THÊM VÀO ĐỂ LẤY USER ID

    /**
     * 📰 GET /api/news - Lấy tất cả news (có phân trang, filter)
     * Public endpoint - Không cần authentication
     * Support filters: status, featured, sort
     */
    @GetMapping
    public ApiResponse<Page<NewsResponse>> getAllNews(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) News.Status status,
            @RequestParam(required = false) Boolean featured,
            @RequestParam(defaultValue = "createdAt") String sort,
            @RequestParam(defaultValue = "desc") String order
    ) {
        // Use Java field names (camelCase) for JPA derived queries
        org.springframework.data.domain.Sort.Direction direction = 
            order.equalsIgnoreCase("asc") 
                ? org.springframework.data.domain.Sort.Direction.ASC 
                : org.springframework.data.domain.Sort.Direction.DESC;
                
        Pageable pageable = PageRequest.of(page, size, org.springframework.data.domain.Sort.by(direction, sort));
        
        Page<NewsResponse> news;
        
        // Apply filters
        if (status != null && featured != null) {
            news = newsService.getNewsByStatusAndFeatured(status, featured, pageable);
        } else if (status != null) {
            news = newsService.getNewsByStatus(status, pageable);
        } else if (featured != null) {
            news = newsService.getFeaturedNews(featured, pageable);
        } else {
            news = newsService.getAllNews(pageable);
        }

        return ApiResponse.<Page<NewsResponse>>builder()
                .code(1000)
                .message("Lấy danh sách tin tức thành công")
                .result(news)
                .build();
    }

    /**
     * 📰 GET /api/news/published - Lấy danh sách news đã publish
     * Public endpoint - Cho user xem
     */
    @GetMapping("/published")
    public ApiResponse<Page<NewsResponse>> getPublishedNews(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        Page<NewsResponse> news = newsService.getPublishedNews(pageable);

        return ApiResponse.<Page<NewsResponse>>builder()
                .code(1000)
                .message("Lấy danh sách tin tức đã xuất bản thành công")
                .result(news)
                .build();
    }

    /**
     * 📰 GET /api/news/{id} - Lấy chi tiết 1 news
     * Public endpoint
     */
    @GetMapping("/{id}")
    public ApiResponse<NewsResponse> getNewsById(@PathVariable UUID id) {
        NewsResponse news = newsService.getNewsById(id);

        return ApiResponse.<NewsResponse>builder()
                .code(1000)
                .message("Lấy thông tin tin tức thành công")
                .result(news)
                .build();
    }

    /**
     * 🔍 GET /api/news/search - Tìm kiếm news theo title
     * Public endpoint
     */
    @GetMapping("/search")
    public ApiResponse<Page<NewsResponse>> searchNews(
            @RequestParam String title,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        Page<NewsResponse> news = newsService.searchNewsByTitle(title, pageable);

        return ApiResponse.<Page<NewsResponse>>builder()
                .code(1000)
                .message("Tìm kiếm tin tức thành công")
                .result(news)
                .build();
    }

    /**
     * 👤 GET /api/news/author/{authorId} - Lấy news theo tác giả
     */
    @GetMapping("/author/{authorId}")
    public ApiResponse<Page<NewsResponse>> getNewsByAuthor(
            @PathVariable UUID authorId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        Page<NewsResponse> news = newsService.getNewsByAuthor(authorId, pageable);

        return ApiResponse.<Page<NewsResponse>>builder()
                .code(1000)
                .message("Lấy danh sách tin tức của tác giả thành công")
                .result(news)
                .build();
    }

    /**
     * 👤 GET /api/news/my-news - Lấy tin tức của user đang đăng nhập
     * Requires authentication
     */
    @GetMapping("/my-news")
    public ApiResponse<Page<NewsResponse>> getMyNews(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        UUID authorId = getCurrentUserId();
        Pageable pageable = PageRequest.of(page, size);
        Page<NewsResponse> news = newsService.getNewsByAuthor(authorId, pageable);

        return ApiResponse.<Page<NewsResponse>>builder()
                .code(1000)
                .message("Lấy danh sách tin tức của bạn thành công")
                .result(news)
                .build();
    }

    /**
     * ✍️ POST /api/news - Tạo news mới
     * Requires authentication - Chỉ admin/author
     */
    @PostMapping
    public ApiResponse<NewsResponse> createNews(@Valid @RequestBody CreateNewsRequest request) {
        // ✅ LẤY USER ID THẬT TỪ JWT TOKEN
        UUID authorId = getCurrentUserId();

        log.info("User {} đang tạo tin tức mới: {}", authorId, request.getTitle());
        NewsResponse news = newsService.createNews(request, authorId);

        return ApiResponse.<NewsResponse>builder()
                .code(1000)
                .message("Tạo tin tức mới thành công")
                .result(news)
                .build();
    }

    /**
     * 🔄 PUT /api/news/{id} - Cập nhật news
     * Requires authentication - Chỉ admin/author
     */
    @PutMapping("/{id}")
    public ApiResponse<NewsResponse> updateNews(
            @PathVariable UUID id,
            @Valid @RequestBody CreateNewsRequest request
    ) {
        NewsResponse news = newsService.updateNews(id, request);

        return ApiResponse.<NewsResponse>builder()
                .code(1000)
                .message("Cập nhật tin tức thành công")
                .result(news)
                .build();
    }

    /**
     * 🗑️ DELETE /api/news/{id} - Xóa news
     * Requires authentication - Chỉ admin
     */
    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteNews(@PathVariable UUID id) {
        newsService.deleteNews(id);

        return ApiResponse.<Void>builder()
                .code(1000)
                .message("Xóa tin tức thành công")
                .build();
    }

    /**
     * 📢 PUT /api/news/{id}/publish - Publish news (chuyển từ DRAFT sang PUBLISHED)
     * Requires authentication - Chỉ admin/author
     */
    @PutMapping("/{id}/publish")
    public ApiResponse<NewsResponse> publishNews(@PathVariable UUID id) {
        NewsResponse news = newsService.publishNews(id);

        return ApiResponse.<NewsResponse>builder()
                .code(1000)
                .message("Xuất bản tin tức thành công")
                .result(news)
                .build();
    }

    /**
     * 📦 PUT /api/news/{id}/archive - Archive news
     * Requires authentication - Chỉ admin
     */
    @PutMapping("/{id}/archive")
    public ApiResponse<NewsResponse> archiveNews(@PathVariable UUID id) {
        NewsResponse news = newsService.archiveNews(id);

        return ApiResponse.<NewsResponse>builder()
                .code(1000)
                .message("Lưu trữ tin tức thành công")
                .result(news)
                .build();
    }

    /**
     * 📊 GET /api/news/stats/count - Đếm số lượng news theo status
     * Requires authentication - Admin only
     */
    @GetMapping("/stats/count")
    public ApiResponse<NewsStatsResponse> getNewsStats() {
        long draftCount = newsService.countByStatus(News.Status.DRAFT);
        long publishedCount = newsService.countByStatus(News.Status.PUBLISHED);
        long archivedCount = newsService.countByStatus(News.Status.ARCHIVED);

        NewsStatsResponse stats = NewsStatsResponse.builder()
                .totalDraft(draftCount)
                .totalPublished(publishedCount)
                .totalArchived(archivedCount)
                .total(draftCount + publishedCount + archivedCount)
                .build();

        return ApiResponse.<NewsStatsResponse>builder()
                .code(1000)
                .message("Lấy thống kê tin tức thành công")
                .result(stats)
                .build();
    }

    /**
     * 📷 POST /api/news/{newsId}/images - Upload nhiều ảnh cho news
     * Requires authentication - Admin/Author only
     */
    @PostMapping("/{newsId}/images")
    public ApiResponse<NewsResponse> uploadNewsImages(
            @PathVariable UUID newsId,
            @RequestParam("images") List<MultipartFile> images) {
        NewsResponse news = newsService.uploadNewsImages(newsId, images);
        return ApiResponse.<NewsResponse>builder()
                .code(1000)
                .message("Upload ảnh cho tin tức thành công")
                .result(news)
                .build();
    }

    /**
     * 🗑️ DELETE /api/news/{newsId}/images/{imageId} - Xóa một ảnh của news
     * Requires authentication - Admin/Author only
     */
    @DeleteMapping("/{newsId}/images/{imageId}")
    public ApiResponse<Void> deleteNewsImage(
            @PathVariable UUID newsId,
            @PathVariable Long imageId) {
        newsService.deleteNewsImage(newsId, imageId);
        return ApiResponse.<Void>builder()
                .code(1000)
                .message("Xóa ảnh tin tức thành công")
                .build();
    }

    /**
     * ✅ HELPER METHOD: Lấy UUID của user đang đăng nhập từ SecurityContext
     * Sử dụng JWT token để lấy username, sau đó query UUID từ database
     */
    private UUID getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        // Kiểm tra nếu chưa đăng nhập
        if (authentication == null || !authentication.isAuthenticated()) {
            log.error("User chưa đăng nhập");
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        String username = authentication.getName();
        log.debug("Current username from JWT: {}", username);

        // Lấy UUID từ username
        return userRepository.findIdByUsername(username)
                .orElseThrow(() -> {
                    log.error("Không tìm thấy user với username: {}", username);
                    return new AppException(ErrorCode.USER_NOT_EXISTED);
                });
    }

    /**
     * 📊 GET /api/news/statistics - Lấy thống kê tổng quan về tin tức (Admin only)
     * Endpoint này cung cấp đầy đủ thống kê cho Admin Dashboard
     */
    @GetMapping("/statistics")
    public ApiResponse<com.notfound.bookstore.model.dto.response.newsresponse.NewsStatsResponse> getNewsStatistics() {
        log.info("📊 Fetching comprehensive news statistics");
        com.notfound.bookstore.model.dto.response.newsresponse.NewsStatsResponse stats = newsService.getNewsStatistics();
        return ApiResponse.<com.notfound.bookstore.model.dto.response.newsresponse.NewsStatsResponse>builder()
                .code(200)
                .message("Lấy thống kê tin tức thành công")
                .result(stats)
                .build();
    }

    /**
     * 🔍 GET /api/news/advanced-search - Tìm kiếm nâng cao với nhiều tiêu chí
     * Support: keyword, category, status, tags, sort
     */
    @GetMapping("/advanced-search")
    public ApiResponse<Page<NewsResponse>> advancedSearch(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) News.Status status,
            @RequestParam(required = false) String tag,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortOrder
    ) {
        // Use Java field names (camelCase) - JPA will map to DB columns
        Pageable pageable = PageRequest.of(page, size, 
            sortOrder.equalsIgnoreCase("asc") 
                ? org.springframework.data.domain.Sort.by(sortBy).ascending()
                : org.springframework.data.domain.Sort.by(sortBy).descending()
        );

        Page<NewsResponse> news;
        
        if (tag != null && !tag.isEmpty()) {
            // Tìm theo tag
            news = newsService.searchNewsByTag(tag, pageable);
        } else {
            // Tìm theo keyword, category, status (kết hợp tất cả)
            news = newsService.searchNews(keyword, category, status, pageable);
        }

        return ApiResponse.<Page<NewsResponse>>builder()
                .code(1000)
                .message("Tìm kiếm tin tức thành công")
                .result(news)
                .build();
    }

    /**
     * 📂 GET /api/news/category/{category} - Lấy news theo category
     */
    @GetMapping("/category/{category}")
    public ApiResponse<Page<NewsResponse>> getNewsByCategory(
            @PathVariable String category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        Page<NewsResponse> news = newsService.getNewsByCategory(category, pageable);

        return ApiResponse.<Page<NewsResponse>>builder()
                .code(1000)
                .message("Lấy tin tức theo danh mục thành công")
                .result(news)
                .build();
    }

    /**
     * 🏷️ GET /api/news/tag/{tag} - Lấy news theo tag
     */
    @GetMapping("/tag/{tag}")
    public ApiResponse<Page<NewsResponse>> getNewsByTag(
            @PathVariable String tag,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        Page<NewsResponse> news = newsService.searchNewsByTag(tag, pageable);

        return ApiResponse.<Page<NewsResponse>>builder()
                .code(1000)
                .message("Lấy tin tức theo tag thành công")
                .result(news)
                .build();
    }

    /**
     * ♻️ PUT /api/news/{id}/restore - Khôi phục news đã archive (Admin only)
     */
    @PutMapping("/{id}/restore")
    public ApiResponse<NewsResponse> restoreNews(@PathVariable UUID id) {
        log.info("♻️ Restoring news: {}", id);
        NewsResponse restored = newsService.restoreNews(id);

        return ApiResponse.<NewsResponse>builder()
                .code(1000)
                .message("Khôi phục tin tức thành công")
                .result(restored)
                .build();
    }

    /**
     * DTO cho stats response (legacy - giữ lại để tương thích)
     */
    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    private static class NewsStatsResponse {
        long totalDraft;
        long totalPublished;
        long totalArchived;
        long total;
    }
}