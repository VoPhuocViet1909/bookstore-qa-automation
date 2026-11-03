package com.notfound.bookstore.service.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.notfound.bookstore.service.ImageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class ImageServiceImpl implements ImageService {

    private final Cloudinary cloudinary;

    @Override
    public Map<String, Object> uploadImage(MultipartFile file) {
        // Sử dụng folder mặc định cho backward compatibility
        return uploadImage(file, "bookstore/books");
    }

    @Override
    public Map<String, Object> uploadImage(MultipartFile file, String folder) {
        try {
            if (file == null || file.isEmpty()) {
                throw new IllegalArgumentException("File is empty or null");
            }

            // Nếu folder null hoặc rỗng, dùng folder mặc định
            if (folder == null || folder.trim().isEmpty()) {
                folder = "bookstore/books";
            }

            @SuppressWarnings("unchecked")
            Map<String, Object> uploadResult = (Map<String, Object>) cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "folder", folder,
                            "resource_type", "image",
                            "overwrite", true,
                            "invalidate", true
                    )
            );

            log.info("Image uploaded successfully to {}: {}", folder, uploadResult.get("url"));
            return uploadResult;

        } catch (IOException e) {
            log.error("Error uploading image to {}: {}", folder, e.getMessage());
            throw new RuntimeException("Failed to upload image: " + e.getMessage(), e);
        }
    }

    @Override
    public List<Map<String, Object>> uploadMultipleImages(List<MultipartFile> files) {
        // Sử dụng folder mặc định cho backward compatibility
        return uploadMultipleImages(files, "bookstore/books");
    }

    @Override
    public List<Map<String, Object>> uploadMultipleImages(List<MultipartFile> files, String folder) {
        List<Map<String, Object>> uploadResults = new ArrayList<>();

        if (files == null || files.isEmpty()) {
            return uploadResults;
        }

        // Nếu folder null hoặc rỗng, dùng folder mặc định
        if (folder == null || folder.trim().isEmpty()) {
            folder = "bookstore/books";
        }

        for (MultipartFile file : files) {
            try {
                Map<String, Object> result = uploadImage(file, folder);
                uploadResults.add(result);
            } catch (Exception e) {
                log.error("Error uploading image {} to {}: {}", file.getOriginalFilename(), folder, e.getMessage());
            }
        }

        return uploadResults;
    }

    @Override
    public boolean deleteImage(String imageUrl) {
        try {
            if (imageUrl == null || imageUrl.isEmpty()) {
                return false;
            }

            // Extract public_id từ Cloudinary URL
            String publicId = extractPublicIdFromUrl(imageUrl);

            @SuppressWarnings("unchecked")
            Map<String, Object> result = (Map<String, Object>) cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
            String resultStatus = (String) result.get("result");

            log.info("Image deletion result: {} for publicId: {}", resultStatus, publicId);
            return "ok".equals(resultStatus);

        } catch (Exception e) {
            log.error("Error deleting image with URL {}: {}", imageUrl, e.getMessage());
            return false;
        }
    }

    /**
     * Extract public_id từ Cloudinary URL
     * VD: https://res.cloudinary.com/djla3uhz2/image/upload/v1763799300/bookstore/news/abc123.png
     * => bookstore/news/abc123
     */
    private String extractPublicIdFromUrl(String imageUrl) {
        if (imageUrl == null || imageUrl.isEmpty()) {
            return "";
        }

        // Nếu đã là public_id (không chứa http), return luôn
        if (!imageUrl.startsWith("http")) {
            return imageUrl;
        }

        try {
            // Split URL và lấy phần sau /upload/
            String[] parts = imageUrl.split("/upload/");
            if (parts.length < 2) {
                return imageUrl;
            }

            // Lấy phần sau version (vXXXXXXXXXX)
            String pathAfterUpload = parts[1];
            String[] pathParts = pathAfterUpload.split("/");

            // Bỏ version number (v1763799300) và rebuild path
            StringBuilder publicId = new StringBuilder();
            for (int i = 1; i < pathParts.length; i++) {
                if (i > 1) {
                    publicId.append("/");
                }
                publicId.append(pathParts[i]);
            }

            // Remove file extension
            String result = publicId.toString().replaceAll("\\.[^.]+$", "");
            log.debug("Extracted public_id: {} from URL: {}", result, imageUrl);
            return result;

        } catch (Exception e) {
            log.error("Error extracting public_id from URL {}: {}", imageUrl, e.getMessage());
            return imageUrl;
        }
    }
}
