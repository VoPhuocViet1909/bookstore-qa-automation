package com.notfound.bookstore.model.mapper;

import com.notfound.bookstore.model.dto.request.reviewrequest.CreateReviewRequest;
import com.notfound.bookstore.model.dto.response.reviewresponse.ReviewResponse;
import com.notfound.bookstore.model.entity.Book;
import com.notfound.bookstore.model.entity.Review;
import com.notfound.bookstore.model.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ReviewMapper {

    @Mapping(source = "reviewID", target = "reviewID")
    @Mapping(source = "rating", target = "rating")
    @Mapping(source = "comment", target = "comment")
    @Mapping(source = "user.fullName", target = "userName")
    @Mapping(source = "user.avatar_url", target = "userAvatar")
    @Mapping(source = "createdAt", target = "createdAt")
    @Mapping(target = "isVerifiedPurchase", expression = "java(false)")
    ReviewResponse toResponse(Review review);

    @Mapping(source = "request.rating", target = "rating")
    @Mapping(source = "request.comment", target = "comment")
    @Mapping(source = "user", target = "user")
    @Mapping(source = "book", target = "book")
    @Mapping(target = "reviewID", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    Review toEntity(CreateReviewRequest request, User user, Book book);

}