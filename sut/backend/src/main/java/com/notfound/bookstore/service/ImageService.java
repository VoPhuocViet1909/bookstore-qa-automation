package com.notfound.bookstore.service;

import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

public interface ImageService {
    // Phương thức cũ (dùng folder mặc định "bookstore/books")
    Map<String, Object> uploadImage(MultipartFile file);

    List<Map<String, Object>> uploadMultipleImages(List<MultipartFile> files);

    // Phương thức mới (cho phép chọn folder)
    Map<String, Object> uploadImage(MultipartFile file, String folder);

    List<Map<String, Object>> uploadMultipleImages(List<MultipartFile> files, String folder);

    boolean deleteImage(String publicId);
}
