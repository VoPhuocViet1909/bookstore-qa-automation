package com.notfound.bookstore.model.mapper;

import com.notfound.bookstore.model.dto.response.bookresponse.BookResponse;
import com.notfound.bookstore.model.dto.response.bookresponse.BookSummaryResponse;
import com.notfound.bookstore.model.dto.response.bookresponse.PageResponse;
import com.notfound.bookstore.model.entity.Author;
import com.notfound.bookstore.model.entity.Book;
import com.notfound.bookstore.model.entity.BookImage;
import com.notfound.bookstore.model.entity.Category;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.springframework.data.domain.Page;

import java.util.List;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface BookMapper {

    @Mapping(target = "authorNames", source = "authors", qualifiedByName = "authorsToNames")
    @Mapping(target = "categoryNames", source = "categories", qualifiedByName = "categoriesToNames")
    @Mapping(target = "imageUrls", source = "images", qualifiedByName = "imagesToUrls")
    @Mapping(target = "averageRating", source = "reviews", qualifiedByName = "calculateAverageRating")
    @Mapping(target = "reviewCount", source = "reviews", qualifiedByName = "countReviews")
    @Mapping(target = "categoryId", source = "categories", qualifiedByName = "categoriesToIds")
    BookResponse toBookResponse(Book book);

    @Mapping(target = "mainImageUrl", source = "images", qualifiedByName = "getMainImageUrl")
    @Mapping(target = "averageRating", source = "reviews", qualifiedByName = "calculateAverageRating")
    @Mapping(target = "reviewCount", source = "reviews", qualifiedByName = "countReviews")
    @Mapping(target = "authorNames", source = "authors", qualifiedByName = "authorsToNames")
    @Mapping(target = "categoryId", source = "categories", qualifiedByName = "categoriesToIds")
    BookSummaryResponse toBookSummaryResponse(Book book);

    List<BookResponse> toBookResponseList(List<Book> books);

    List<BookSummaryResponse> toBookSummaryResponseList(List<Book> books);

    default <T> PageResponse<T> toPageResponse(Page<T> page) {
        return PageResponse.<T>builder()
                .content(page.getContent())
                .currentPage(page.getNumber())
                .totalPages(page.getTotalPages())
                .totalElements(page.getTotalElements())
                .build();
    }

    @Named("categoriesToIds")
    default List<String> categoriesToIds(List<Category> categories) {
        if (categories == null) return List.of();
        return categories.stream()
                .map(category -> category.getId().toString())
                .collect(Collectors.toList());
    }

    @Named("authorsToNames")
    default List<String> authorsToNames(List<Author> authors) {
        if (authors == null) return List.of();
        return authors.stream()
                .map(Author::getName)
                .collect(Collectors.toList());
    }

    @Named("categoriesToNames")
    default List<String> categoriesToNames(List<Category> categories) {
        if (categories == null) return List.of();
        return categories.stream()
                .map(Category::getName)
                .collect(Collectors.toList());
    }

    @Named("imagesToUrls")
    default List<String> imagesToUrls(List<BookImage> images) {
        if (images == null) return List.of();
        return images.stream()
                .map(BookImage::getUrl)
                .collect(Collectors.toList());
    }

    @Named("getMainImageUrl")
    default String getMainImageUrl(List<BookImage> images) {
        if (images == null || images.isEmpty()) return null;
        return images.getFirst().getUrl();
    }

    @Named("calculateAverageRating")
    default Double calculateAverageRating(List<?> reviews) {
        if (reviews == null || reviews.isEmpty()) return 0.0;
        return reviews.stream()
                .mapToDouble(r -> ((com.notfound.bookstore.model.entity.Review) r).getRating())
                .average()
                .orElse(0.0);
    }

    @Named("countReviews")
    default Integer countReviews(List<?> reviews) {
        return reviews == null ? 0 : reviews.size();
    }
}
