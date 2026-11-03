package com.notfound.bookstore.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.notfound.bookstore.exception.AppException;
import com.notfound.bookstore.exception.ErrorCode;
import com.notfound.bookstore.model.dto.request.newsrequest.CreateNewsRequest;
import com.notfound.bookstore.model.dto.response.newsresponse.NewsImageResponse;
import com.notfound.bookstore.model.dto.response.newsresponse.NewsMetadata;
import com.notfound.bookstore.model.dto.response.newsresponse.NewsResponse;
import com.notfound.bookstore.model.dto.response.newsresponse.ProcessedNewsContent;
import com.notfound.bookstore.model.entity.News;
import com.notfound.bookstore.model.entity.NewsImage;
import com.notfound.bookstore.model.entity.User;
import com.notfound.bookstore.repository.NewsImageRepository;
import com.notfound.bookstore.repository.NewsRepository;
import com.notfound.bookstore.repository.UserRepository;
import com.notfound.bookstore.service.ImageService;
import com.notfound.bookstore.service.NewsService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * @Dự án: DHKTPM18B_NotFound_WebSiteBanSach
 * @Class: NewsServiceImpl
 * @Tạo vào ngày: 11/15/2025
 * @Tác giả: Nguyen Huu Sang
 */

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class NewsServiceImpl implements NewsService {

    NewsRepository newsRepository;
    UserRepository userRepository;
    NewsImageRepository newsImageRepository;
    ImageService imageService;
    ObjectMapper objectMapper;

    @Override
    @Transactional
    public NewsResponse createNews(CreateNewsRequest request, UUID authorId) {
        log.info("Creating news with title: {}", request.getTitle());

        // Tìm user (author)
        User author = userRepository.findById(authorId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        // Tự động generate metadata từ HTML content
        ProcessedNewsContent processed = processContent(request.getContent());

        // Tạo News entity
        News news = News.builder()
                .title(request.getTitle())
                .content(processed.getHtmlContent()) // <-- LƯU HTML ĐÃ CÓ ID
                .summary(request.getSummary())
                .category(request.getCategory())
                .tags(request.getTags() != null ? request.getTags() : new ArrayList<>())
                .views(0L) // <-- KHỞI TẠO VIEWS = 0
                .featured(request.getFeatured() != null ? request.getFeatured() : false)
                .metadata(processed.getMetadataJson()) // <-- LƯU METADATA KHỚP HTML
                .status(request.getStatus() != null ? News.Status.valueOf(request.getStatus()) : News.Status.DRAFT)
                .author(author)
                .images(new ArrayList<>())
                .build();

        // Thêm images nếu có
        if (request.getImages() != null && !request.getImages().isEmpty()) {
            List<NewsImage> images = request.getImages().stream()
                    .map(imgReq -> {
                        NewsImage newsImage = NewsImage.builder()
                                .url(imgReq.getUrl())
                                .news(news)
                                .build();
                        // Set priority (kế thừa từ BaseImage)
                        newsImage.setPriority(imgReq.getPriority() != null ? imgReq.getPriority() : 1);
                        return newsImage;
                    })
                    .collect(Collectors.toList());
            news.getImages().addAll(images);
        }

        News savedNews = newsRepository.save(news);
        log.info("News created successfully with ID: {}", savedNews.getNewsID());

        return mapToResponse(savedNews);
    }

    @Override
    @Transactional
    public NewsResponse updateNews(UUID newsId, CreateNewsRequest request) {
        log.info("Updating news with ID: {}", newsId);

        News news = newsRepository.findById(newsId)
                .orElseThrow(() -> new AppException(ErrorCode.NEWS_NOT_FOUND));

        // Cập nhật thông tin cơ bản
        news.setTitle(request.getTitle());
        news.setContent(request.getContent());
        
        // Cập nhật các field mới
        if (request.getSummary() != null) {
            news.setSummary(request.getSummary());
        }
        if (request.getCategory() != null) {
            news.setCategory(request.getCategory());
        }
        if (request.getTags() != null) {
            news.setTags(request.getTags());
        }
        if (request.getFeatured() != null) {
            news.setFeatured(request.getFeatured());
        }
        if (request.getStatus() != null) {
            news.setStatus(News.Status.valueOf(request.getStatus()));
        }

        // Tự động generate lại metadata
        ProcessedNewsContent processed = processContent(request.getContent());

        news.setContent(processed.getHtmlContent()); // Cập nhật nội dung mới có ID
        news.setMetadata(processed.getMetadataJson());

        // Cập nhật images
        if (request.getImages() != null) {
            // Xóa images cũ
            news.getImages().clear();

            // Thêm images mới
            List<NewsImage> newImages = request.getImages().stream()
                    .map(imgReq -> {
                        NewsImage newsImage = NewsImage.builder()
                                .url(imgReq.getUrl())
                                .news(news)
                                .build();
                        newsImage.setPriority(imgReq.getPriority() != null ? imgReq.getPriority() : 1);
                        return newsImage;
                    })
                    .collect(Collectors.toList());
            news.getImages().addAll(newImages);
        }

        News updatedNews = newsRepository.save(news);
        log.info("News updated successfully");

        return mapToResponse(updatedNews);
    }

    @Override
    @Transactional
    public NewsResponse getNewsById(UUID newsId) {
        News news = newsRepository.findById(newsId)
                .orElseThrow(() -> new AppException(ErrorCode.NEWS_NOT_FOUND));
        
        // Increment view count
        news.setViews(news.getViews() + 1);
        newsRepository.save(news);
        
        return mapToResponse(news);
    }

    @Override
    public Page<NewsResponse> getAllNews(Pageable pageable) {
        return newsRepository.findAllByOrderByCreatedAtDesc(pageable)
                .map(this::mapToResponse);
    }

    @Override
    public Page<NewsResponse> getPublishedNews(Pageable pageable) {
        return newsRepository.findByStatusOrderByCreatedAtDesc(News.Status.PUBLISHED, pageable)
                .map(this::mapToResponse);
    }

    @Override
    public Page<NewsResponse> getNewsByAuthor(UUID authorId, Pageable pageable) {
        return newsRepository.findByAuthorIdOrderByCreatedAtDesc(authorId, pageable)
                .map(this::mapToResponse);
    }

    @Override
    public Page<NewsResponse> searchNewsByTitle(String title, Pageable pageable) {
        return newsRepository.findByTitleContainingIgnoreCaseOrderByCreatedAtDesc(title, pageable)
                .map(this::mapToResponse);
    }

    @Override
    @Transactional
    public void deleteNews(UUID newsId) {
        News news = newsRepository.findById(newsId)
                .orElseThrow(() -> new AppException(ErrorCode.NEWS_NOT_FOUND));
        newsRepository.delete(news);
        log.info("News deleted successfully with ID: {}", newsId);
    }

    @Override
    @Transactional
    public NewsResponse publishNews(UUID newsId) {
        News news = newsRepository.findById(newsId)
                .orElseThrow(() -> new AppException(ErrorCode.NEWS_NOT_FOUND));
        news.setStatus(News.Status.PUBLISHED);
        News publishedNews = newsRepository.save(news);
        log.info("News published successfully with ID: {}", newsId);
        return mapToResponse(publishedNews);
    }

    @Override
    @Transactional
    public NewsResponse archiveNews(UUID newsId) {
        News news = newsRepository.findById(newsId)
                .orElseThrow(() -> new AppException(ErrorCode.NEWS_NOT_FOUND));
        news.setStatus(News.Status.ARCHIVED);
        News archivedNews = newsRepository.save(news);
        log.info("News archived successfully with ID: {}", newsId);
        return mapToResponse(archivedNews);
    }

    @Override
    public long countByStatus(News.Status status) {
        return newsRepository.countByStatus(status);
    }

    @Override
    @Transactional
    public NewsResponse restoreNews(UUID newsId) {
        log.info("Restoring archived news with ID: {}", newsId);
        News news = newsRepository.findById(newsId)
                .orElseThrow(() -> new AppException(ErrorCode.NEWS_NOT_FOUND));
        
        if (news.getStatus() != News.Status.ARCHIVED) {
            throw new AppException(ErrorCode.BAD_REQUEST);
        }
        
        news.setStatus(News.Status.DRAFT);
        News restoredNews = newsRepository.save(news);
        log.info("News restored successfully with ID: {}", newsId);
        return mapToResponse(restoredNews);
    }

    @Override
    public Page<NewsResponse> searchNews(String keyword, String category, News.Status status, Pageable pageable) {
        log.info("Advanced search - keyword: {}, category: {}, status: {}, sort: {}", 
                 keyword, category, status, pageable.getSort());
        
        Page<News> newsPage;
        
        // Tìm kiếm có keyword
        if (keyword != null && !keyword.isEmpty()) {
            // Lấy tất cả kết quả search theo title
            newsPage = newsRepository.searchByTitleForAdmin(keyword, pageable);
            
            // Filter thêm theo category và status nếu có
            if ((category != null && !category.isEmpty()) || status != null) {
                List<News> filteredList = newsPage.getContent().stream()
                    .filter(news -> {
                        boolean matchCategory = category == null || category.isEmpty() || news.getCategory().equals(category);
                        boolean matchStatus = status == null || news.getStatus() == status;
                        return matchCategory && matchStatus;
                    })
                    .collect(Collectors.toList());
                
                newsPage = new PageImpl<>(filteredList, pageable, filteredList.size());
            }
        } 
        // Không có keyword, chỉ filter theo category/status
        // SỬ DỤNG CÁC METHOD MỚI KHÔNG HARDCODE ORDER - để Pageable quyết định sorting
        else if (category != null && !category.isEmpty() && status != null) {
            newsPage = newsRepository.findByCategoryAndStatus(category, status, pageable);
        } else if (category != null && !category.isEmpty()) {
            newsPage = newsRepository.findByCategory(category, pageable);
        } else if (status != null) {
            newsPage = newsRepository.findByStatus(status, pageable);
        } else {
            newsPage = newsRepository.findAll(pageable);
        }
        
        return newsPage.map(this::mapToResponse);
    }

    @Override
    public Page<NewsResponse> searchNewsByTag(String tag, Pageable pageable) {
        log.info("Searching news by tag: {}", tag);
        Page<News> newsPage = newsRepository.findByTag(tag).stream()
                .collect(Collectors.collectingAndThen(
                        Collectors.toList(),
                        list -> new org.springframework.data.domain.PageImpl<>(
                                list.subList(
                                        Math.min((int) pageable.getOffset(), list.size()),
                                        Math.min((int) pageable.getOffset() + pageable.getPageSize(), list.size())
                                ),
                                pageable,
                                list.size()
                        )
                ));
        return newsPage.map(this::mapToResponse);
    }

    @Override
    public Page<NewsResponse> searchNewsByTitleOrTags(String keyword, Pageable pageable) {
        log.info("Searching news by title or tags: {}", keyword);
        Page<News> newsPage = newsRepository.searchByTitleOrTags(keyword, pageable);
        return newsPage.map(this::mapToResponse);
    }

    @Override
    public Page<NewsResponse> getNewsByCategory(String category, Pageable pageable) {
        log.info("Getting news by category: {}", category);
        Page<News> newsPage = newsRepository.findByCategoryOrderByCreatedAtDesc(category, pageable);
        return newsPage.map(this::mapToResponse);
    }

    @Override
    public Page<NewsResponse> getNewsByStatus(News.Status status, Pageable pageable) {
        log.info("Getting news by status: {}", status);
        Page<News> newsPage = newsRepository.findByStatusOrderByCreatedAtDesc(status, pageable);
        return newsPage.map(this::mapToResponse);
    }

    @Override
    public Page<NewsResponse> getFeaturedNews(Boolean featured, Pageable pageable) {
        log.info("Getting featured news: {}", featured);
        Page<News> newsPage = newsRepository.findByFeaturedOrderByViewsDesc(featured, pageable);
        return newsPage.map(this::mapToResponse);
    }

    @Override
    public Page<NewsResponse> getNewsByStatusAndFeatured(News.Status status, Boolean featured, Pageable pageable) {
        log.info("Getting news by status: {} and featured: {}", status, featured);
        Page<News> newsPage = newsRepository.findByStatusAndFeaturedOrderByCreatedAtDesc(status, featured, pageable);
        return newsPage.map(this::mapToResponse);
    }

    /**
     * ✅ QUAN TRỌNG: Tự động generate metadata từ HTML content
     */
    private ProcessedNewsContent processContent(String htmlContent) {
        try {
            Document doc = Jsoup.parse(htmlContent);

            // 1. Trích xuất Table of Contents từ các heading
            List<NewsMetadata.TableOfContentItem> sections = new ArrayList<>();
            Elements headings = doc.select("h2, h3, h4");

            int sectionIndex = 1;
            for (Element heading : headings) {
                String id = heading.attr("id");
                // Nếu chưa có ID thì tạo mới VÀ GÁN VÀO THẺ HTML
                if (id == null || id.isEmpty()) {
                    id = "section-" + sectionIndex++;
                    heading.attr("id", id); // <--- QUAN TRỌNG NHẤT: Sửa HTML
                }

                String tagName = heading.tagName();
                int level = Integer.parseInt(tagName.substring(1));

                sections.add(NewsMetadata.TableOfContentItem.builder()
                        .id(id)
                        .title(heading.text())
                        .level(level)
                        .build());
            }

            // 2. Trích xuất các link trong nội dung
            List<NewsMetadata.NewsLink> links = new ArrayList<>();
            Elements linkElements = doc.select("a[href]");

            for (Element link : linkElements) {
                String url = link.attr("href");
                String text = link.text();

                String type = "external";
                if (url.startsWith("/books/")) {
                    type = "book";
                } else if (url.startsWith("/products/")) {
                    type = "product";
                } else if (url.startsWith("/")) {
                    type = "internal";
                }

                links.add(NewsMetadata.NewsLink.builder()
                        .text(text)
                        .url(url)
                        .type(type)
                        .build());
            }

            // 3. Tạo description từ đoạn text đầu tiên
            String description = "";
            Element firstParagraph = doc.selectFirst("p");
            if (firstParagraph != null) {
                description = firstParagraph.text();
                if (description.length() > 200) {
                    description = description.substring(0, 197) + "...";
                }
            }

            // 4. Build metadata object
            NewsMetadata metadata = NewsMetadata.builder()
                    .description(description)
                    .sections(sections)
                    .links(links)
                    .build();

            // Trả về HTML đã sửa (body) và JSON Metadata
            return new ProcessedNewsContent(doc.body().html(), objectMapper.writeValueAsString(metadata));

        } catch (JsonProcessingException e) {
            log.error("Error generating metadata", e);
            return new ProcessedNewsContent(htmlContent, "{}");
        }
    }

    /**
     * Map News entity to NewsResponse DTO
     */
    private NewsResponse mapToResponse(News news) {
        NewsMetadata metadata = null;
        if (news.getMetadata() != null && !news.getMetadata().isEmpty() && !news.getMetadata().equals("{}")) {
            try {
                log.debug("Parsing metadata for news ID: {} - Content: {}", news.getNewsID(), news.getMetadata());
                metadata = objectMapper.readValue(news.getMetadata(), NewsMetadata.class);
            } catch (JsonProcessingException e) {
                log.warn("Error parsing metadata for news ID: {} - Will continue with null metadata. Metadata content: {}. Error: {}", 
                        news.getNewsID(), news.getMetadata(), e.getMessage());
                // Don't fail the whole request, just log and continue with null metadata
            }
        }

        List<NewsImageResponse> imageResponses = news.getImages().stream()
                .map(img -> NewsImageResponse.builder()
                        .id(img.getId())
                        .url(img.getUrl())
                        .priority(img.getPriority())
                        .uploadedAt(img.getUploadedAt())
                        .build())
                .collect(Collectors.toList());

        return NewsResponse.builder()
                .newsID(news.getNewsID())
                .title(news.getTitle())
                .summary(news.getSummary())
                .content(news.getContent())
                .metadata(metadata)
                .status(news.getStatus().name())
                .category(news.getCategory())
                .tags(news.getTags())
                .views(news.getViews())
                .featured(news.getFeatured())
                .createdAt(news.getCreatedAt())
                .updatedAt(news.getUpdatedAt())
                .publishedAt(news.getStatus() == News.Status.PUBLISHED ? news.getUpdatedAt() : null)
                .authorName(news.getAuthor().getUsername())
                .authorId(news.getAuthor().getId())
                .images(imageResponses)
                .build();
    }

    @Override
    @Transactional
    public NewsResponse uploadNewsImages(UUID newsId, List<MultipartFile> images) {
        // Tìm news
        News news = newsRepository.findById(newsId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND));

        if (images == null || images.isEmpty()) {
            throw new AppException(ErrorCode.BAD_REQUEST);
        }

        // Upload images lên Cloudinary với folder "bookstore/news"
        List<Map<String, Object>> uploadResults = imageService.uploadMultipleImages(images, "bookstore/news");

        // Tính priority cho ảnh mới
        int priority = 1;
        List<NewsImage> existingImages = newsImageRepository.findByNewsNewsID(newsId);
        if (!existingImages.isEmpty()) {
            priority = existingImages.stream()
                    .mapToInt(img -> img.getPriority() != null ? img.getPriority() : 0)
                    .max()
                    .orElse(0) + 1;
        }

        // Lưu thông tin ảnh vào database
        for (Map<String, Object> result : uploadResults) {
            String imageUrl = (String) result.get("url");
            NewsImage newsImage = NewsImage.builder()
                    .news(news)
                    .url(imageUrl)
                    .priority(priority++)
                    .build();
            newsImageRepository.save(newsImage);
        }

        log.info("Uploaded {} images for news: {}", uploadResults.size(), newsId);

        // Trả về news đã cập nhật
        News updatedNews = newsRepository.findById(newsId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND));
        return mapToResponse(updatedNews);
    }

    @Override
    @Transactional
    public void deleteNewsImage(UUID newsId, Long imageId) {
        // Kiểm tra news có tồn tại không
        if (!newsRepository.existsById(newsId)) {
            throw new AppException(ErrorCode.NOT_FOUND);
        }

        // Tìm image
        NewsImage image = newsImageRepository.findById(imageId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND));

        // Kiểm tra image có thuộc về news này không
        if (!image.getNews().getNewsID().equals(newsId)) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }

        // Xóa ảnh trên Cloudinary
        if (image.getUrl() != null) {
            imageService.deleteImage(image.getUrl());
        }

        // Xóa record trong database
        newsImageRepository.delete(image);
        log.info("Deleted image {} for news: {}", imageId, newsId);
    }

    @Override
    @Transactional(readOnly = true)
    public com.notfound.bookstore.model.dto.response.newsresponse.NewsStatsResponse getNewsStatistics() {
        log.info("Fetching news statistics");
        
        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        java.time.LocalDateTime startOfToday = now.toLocalDate().atStartOfDay();
        java.time.LocalDateTime startOfWeek = now.minusDays(now.getDayOfWeek().getValue() - 1).toLocalDate().atStartOfDay();
        java.time.LocalDateTime startOfMonth = now.withDayOfMonth(1).toLocalDate().atStartOfDay();
        java.time.LocalDateTime startOfLastMonth = startOfMonth.minusMonths(1);
        java.time.LocalDateTime endOfLastMonth = startOfMonth.minusDays(1).toLocalDate().atTime(23, 59, 59);
        java.time.LocalDateTime last30Days = now.minusDays(30);
        
        // ========== Tổng quan ==========
        long totalNews = newsRepository.count();
        long publishedNews = newsRepository.countByStatus(News.Status.PUBLISHED);
        long draftNews = newsRepository.countByStatus(News.Status.DRAFT);
        long archivedNews = newsRepository.countByStatus(News.Status.ARCHIVED);
        long featuredNews = newsRepository.countByFeaturedTrue();
        
        // ========== Theo thời gian ==========
        long newNewsToday = newsRepository.countByCreatedAtBetween(startOfToday, now);
        long newNewsThisWeek = newsRepository.countByCreatedAtBetween(startOfWeek, now);
        long newNewsThisMonth = newsRepository.countByCreatedAtBetween(startOfMonth, now);
        long newNewsLastMonth = newsRepository.countByCreatedAtBetween(startOfLastMonth, endOfLastMonth);
        
        // ========== Tương tác ==========
        Long totalViews = newsRepository.sumAllViews();
        if (totalViews == null) totalViews = 0L;
        
        Double avgViewsPerNews = totalNews > 0 ? (double) totalViews / totalNews : 0.0;
        Long totalComments = 0L; // Dành cho tương lai
        
        // ========== Thống kê theo category ==========
        List<Object[]> categoryData = newsRepository.countByCategory();
        List<com.notfound.bookstore.model.dto.response.newsresponse.NewsStatsResponse.NewsByCategoryStats> newsByCategory = 
            categoryData.stream().map(row -> {
                String category = (String) row[0];
                Long count = ((Number) row[1]).longValue();
                Double percentage = totalNews > 0 ? (count * 100.0) / totalNews : 0.0;
                return com.notfound.bookstore.model.dto.response.newsresponse.NewsStatsResponse.NewsByCategoryStats.builder()
                    .category(category)
                    .count(count)
                    .percentage(Math.round(percentage * 100.0) / 100.0)
                    .build();
            }).collect(Collectors.toList());
        
        // ========== Top tin tức ==========
        org.springframework.data.domain.PageRequest topPageable = 
            org.springframework.data.domain.PageRequest.of(0, 10);
        List<News> topNews = newsRepository.findAllByOrderByViewsDesc(topPageable).getContent();
        List<com.notfound.bookstore.model.dto.response.newsresponse.NewsStatsResponse.TopViewedNews> topViewedNews = 
            topNews.stream().map(news -> 
                com.notfound.bookstore.model.dto.response.newsresponse.NewsStatsResponse.TopViewedNews.builder()
                    .id(news.getNewsID().toString())
                    .title(news.getTitle())
                    .views(news.getViews())
                    .category(news.getCategory())
                    .publishedAt(news.getCreatedAt().toString())
                    .build()
            ).collect(Collectors.toList());
        
        // ========== Xu hướng lượt xem (30 ngày gần nhất) ==========
        List<Object[]> trendData = newsRepository.getViewsTrendBetween(last30Days, now);
        List<com.notfound.bookstore.model.dto.response.newsresponse.NewsStatsResponse.ViewsTrendData> viewsTrend = 
            trendData.stream().map(row -> {
                java.sql.Date sqlDate = (java.sql.Date) row[0];
                Long views = ((Number) row[1]).longValue();
                Long newsCount = ((Number) row[2]).longValue();
                return com.notfound.bookstore.model.dto.response.newsresponse.NewsStatsResponse.ViewsTrendData.builder()
                    .date(sqlDate.toString())
                    .views(views)
                    .newsCount(newsCount)
                    .build();
            }).collect(Collectors.toList());
        
        // ========== So sánh với tháng trước ==========
        Double newsGrowthPercentage = 0.0;
        if (newNewsLastMonth > 0) {
            newsGrowthPercentage = ((double) (newNewsThisMonth - newNewsLastMonth) / newNewsLastMonth) * 100;
            newsGrowthPercentage = Math.round(newsGrowthPercentage * 100.0) / 100.0;
        } else if (newNewsThisMonth > 0) {
            newsGrowthPercentage = 100.0;
        }
        
        Long viewsThisMonth = newsRepository.sumViewsBetween(startOfMonth, now);
        Long viewsLastMonth = newsRepository.sumViewsBetween(startOfLastMonth, endOfLastMonth);
        if (viewsThisMonth == null) viewsThisMonth = 0L;
        if (viewsLastMonth == null) viewsLastMonth = 0L;
        
        Double viewsGrowthPercentage = 0.0;
        if (viewsLastMonth > 0) {
            viewsGrowthPercentage = ((double) (viewsThisMonth - viewsLastMonth) / viewsLastMonth) * 100;
            viewsGrowthPercentage = Math.round(viewsGrowthPercentage * 100.0) / 100.0;
        } else if (viewsThisMonth > 0) {
            viewsGrowthPercentage = 100.0;
        }
        
        return com.notfound.bookstore.model.dto.response.newsresponse.NewsStatsResponse.builder()
            .totalNews(totalNews)
            .publishedNews(publishedNews)
            .draftNews(draftNews)
            .archivedNews(archivedNews)
            .featuredNews(featuredNews)
            .newNewsThisMonth(newNewsThisMonth)
            .newNewsThisWeek(newNewsThisWeek)
            .newNewsToday(newNewsToday)
            .totalViews(totalViews)
            .avgViewsPerNews(Math.round(avgViewsPerNews * 100.0) / 100.0)
            .totalComments(totalComments)
            .newsByCategory(newsByCategory)
            .topViewedNews(topViewedNews)
            .viewsTrend(viewsTrend)
            .newsGrowthPercentage(newsGrowthPercentage)
            .viewsGrowthPercentage(viewsGrowthPercentage)
            .build();
    }
}