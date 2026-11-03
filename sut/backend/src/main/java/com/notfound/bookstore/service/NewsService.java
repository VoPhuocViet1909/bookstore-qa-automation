package com.notfound.bookstore.service;

import com.notfound.bookstore.model.dto.request.newsrequest.CreateNewsRequest;
import com.notfound.bookstore.model.dto.response.newsresponse.NewsResponse;
import com.notfound.bookstore.model.entity.News;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

/**
 * @Dự án: DHKTPM18B_NotFound_WebSiteBanSach
 * @Interface: NewsService
 * @Tạo vào ngày: 11/15/2025
 * @Tác giả: Nguyen Huu Sang
 */

public interface NewsService {

        /**
         * Tạo news mới
         * @param request - dữ liệu news (title, content, images...)
         * @param authorId - ID của user tạo bài viết
         * @return NewsResponse
         */
        NewsResponse createNews(CreateNewsRequest request, UUID authorId);

        /**
         * Cập nhật news
         * @param newsId - ID của news cần update
         * @param request - dữ liệu mới
         * @return NewsResponse
         */
        NewsResponse updateNews(UUID newsId, CreateNewsRequest request);

        /**
         * Lấy chi tiết news theo ID
         * @param newsId - ID của news
         * @return NewsResponse
         */
        NewsResponse getNewsById(UUID newsId);

        /**
         * Lấy tất cả news (có phân trang, sắp xếp theo ngày tạo mới nhất)
         * @param pageable - thông tin phân trang
         * @return Page<NewsResponse>
         */
        Page<NewsResponse> getAllNews(Pageable pageable);

        /**
         * Lấy news đã publish (cho user xem)
         * @param pageable - thông tin phân trang
         * @return Page<NewsResponse>
         */
        Page<NewsResponse> getPublishedNews(Pageable pageable);

        /**
         * Lấy news theo author
         * @param authorId - ID của tác giả
         * @param pageable - thông tin phân trang
         * @return Page<NewsResponse>
         */
        Page<NewsResponse> getNewsByAuthor(UUID authorId, Pageable pageable);

        /**
         * Tìm kiếm news theo title
         * @param title - từ khóa tìm kiếm
         * @param pageable - thông tin phân trang
         * @return Page<NewsResponse>
         */
        Page<NewsResponse> searchNewsByTitle(String title, Pageable pageable);

        /**
         * Xóa news
         * @param newsId - ID của news cần xóa
         */
        void deleteNews(UUID newsId);

        /**
         * Publish news (chuyển từ DRAFT sang PUBLISHED)
         * @param newsId - ID của news
         * @return NewsResponse
         */
        NewsResponse publishNews(UUID newsId);

        /**
         * Archive news (chuyển sang ARCHIVED) - SOFT DELETE
         * Không xóa thật mà chỉ ẩn tin tức, không hiển thị trong thống kê
         * @param newsId - ID của news
         * @return NewsResponse
         */
        NewsResponse archiveNews(UUID newsId);

        /**
         * Khôi phục news đã archive
         * @param newsId - ID của news
         * @return NewsResponse
         */
        NewsResponse restoreNews(UUID newsId);

        /**
         * Đếm số lượng news theo status
         * @param status - DRAFT, PUBLISHED, hoặc ARCHIVED
         * @return long
         */
        long countByStatus(News.Status status);

        /**
         * Tìm kiếm news theo nhiều tiêu chí
         * @param keyword - từ khóa tìm trong title/content
         * @param category - danh mục
         * @param status - trạng thái
         * @param pageable - phân trang & sắp xếp
         * @return Page<NewsResponse>
         */
        Page<NewsResponse> searchNews(String keyword, String category, News.Status status, Pageable pageable);

        /**
         * Tìm kiếm news theo tags
         * @param tag - tag cần tìm
         * @param pageable - phân trang
         * @return Page<NewsResponse>
         */
        Page<NewsResponse> searchNewsByTag(String tag, Pageable pageable);

        /**
         * Tìm kiếm news theo title hoặc tags (FULLTEXT search)
         * @param keyword - từ khóa
         * @param pageable - phân trang
         * @return Page<NewsResponse>
         */
        Page<NewsResponse> searchNewsByTitleOrTags(String keyword, Pageable pageable);

        /**
         * Lấy news theo category
         * @param category - danh mục
         * @param pageable - phân trang
         * @return Page<NewsResponse>
         */
        Page<NewsResponse> getNewsByCategory(String category, Pageable pageable);

        /**
         * Lấy news theo status
         * @param status - trạng thái (PUBLISHED, DRAFT, ARCHIVED)
         * @param pageable - phân trang
         * @return Page<NewsResponse>
         */
        Page<NewsResponse> getNewsByStatus(News.Status status, Pageable pageable);

        /**
         * Lấy news theo featured flag
         * @param featured - true/false
         * @param pageable - phân trang
         * @return Page<NewsResponse>
         */
        Page<NewsResponse> getFeaturedNews(Boolean featured, Pageable pageable);

        /**
         * Lấy news theo status và featured
         * @param status - trạng thái
         * @param featured - true/false
         * @param pageable - phân trang
         * @return Page<NewsResponse>
         */
        Page<NewsResponse> getNewsByStatusAndFeatured(News.Status status, Boolean featured, Pageable pageable);

        /**
         * Upload nhiều ảnh cho news
         * @param newsId - ID của news cần upload ảnh
         * @param images - Danh sách file ảnh cần upload
         * @return NewsResponse với thông tin đã cập nhật
         */
        NewsResponse uploadNewsImages(UUID newsId, List<MultipartFile> images);

        /**
         * Xóa một ảnh của news
         * @param newsId - ID của news
         * @param imageId - ID của ảnh cần xóa
         */
        void deleteNewsImage(UUID newsId, Long imageId);

        /**
         * Lấy thống kê tổng quan về tin tức (cho Admin Dashboard)
         * @return NewsStatsResponse chứa tất cả thống kê
         */
        com.notfound.bookstore.model.dto.response.newsresponse.NewsStatsResponse getNewsStatistics();

}

