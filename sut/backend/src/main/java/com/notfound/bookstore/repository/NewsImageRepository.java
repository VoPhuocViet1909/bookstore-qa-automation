package com.notfound.bookstore.repository;

import com.notfound.bookstore.model.entity.News;
import com.notfound.bookstore.model.entity.NewsImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface NewsImageRepository extends JpaRepository<NewsImage, Long> {
    List<NewsImage> findByNews(News news);
    List<NewsImage> findByNewsNewsID(UUID newsId);
}