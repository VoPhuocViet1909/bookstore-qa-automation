package com.notfound.bookstore.exception;

public class UserNotFoundException extends AppException {
    public UserNotFoundException() {
        super(ErrorCode.USER_NOT_EXISTED);
    }
}