package com.notfound.bookstore.model.dto.request.bookrequest;

import com.notfound.bookstore.model.entity.Book;

public interface BookWithRating {
    Book getBook();
    Double getAverageRating();
    Long getReviewCount();
}
