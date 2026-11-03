package com.notfound.bookstore.exception;

public class BookNotFoundException extends AppException {
    public BookNotFoundException() {
        super(ErrorCode.BOOK_NOT_FOUND);
    }
}
