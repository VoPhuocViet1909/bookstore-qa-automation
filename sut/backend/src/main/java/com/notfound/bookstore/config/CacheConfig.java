package com.notfound.bookstore.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;

import java.util.Objects;

@Configuration
@EnableCaching
@EnableScheduling
@RequiredArgsConstructor
@Slf4j
public class CacheConfig {

    private final CacheManager cacheManager;

    // Xóa cache mỗi 15 phút (900000 ms)
    @Scheduled(fixedRate = 900000)
    public void evictBookCaches() {
        log.info("Clearing book caches...");
        evictCache("best_selling_books");
        evictCache("suggested_books");
        evictCache("popular_categories");
        evictCache("books_by_popular_categories");
    }

    private void evictCache(String cacheName) {
        if (cacheManager.getCache(cacheName) != null) {
            Objects.requireNonNull(cacheManager.getCache(cacheName)).clear();
            log.info("Cleared cache: {}", cacheName);
        }
    }
}