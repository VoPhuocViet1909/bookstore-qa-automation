package com.notfound.bookstore.service;

import com.notfound.bookstore.model.dto.request.promotionrequest.CreatePromotionRequest;
import com.notfound.bookstore.model.dto.request.promotionrequest.UpdatePromotionRequest;
import com.notfound.bookstore.model.dto.request.promotionrequest.ValidatePromotionCodeRequest;
import com.notfound.bookstore.model.dto.response.promotionresponse.PromotionResponse;
import com.notfound.bookstore.model.dto.response.promotionresponse.PromotionValidationResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface PromotionService {
    /**
     * Tạo khuyến mãi mới
     */
    PromotionResponse createPromotion(CreatePromotionRequest request);

    /**
     * Cập nhật khuyến mãi
     */
    PromotionResponse updatePromotion(UUID promotionId, UpdatePromotionRequest request);

    /**
     * Xóa khuyến mãi
     */
    void deletePromotion(UUID promotionId);

    /**
     * Lấy khuyến mãi theo ID
     */
    PromotionResponse getPromotionById(UUID promotionId);

    /**
     * Lấy tất cả khuyến mãi (có phân trang)
     */
    Page<PromotionResponse> getAllPromotions(Pageable pageable);

    /**
     * Lấy danh sách khuyến mãi đang hoạt động
     */
    List<PromotionResponse> getActivePromotions();

    /**
     * Lấy khuyến mãi áp dụng cho sách
     */
    List<PromotionResponse> getPromotionsByBookId(UUID bookId);

    /**
     * Validate mã khuyến mãi
     */
    PromotionValidationResponse validatePromotionCode(ValidatePromotionCodeRequest request);

    /**
     * Áp dụng mã khuyến mãi (tăng usage count)
     */
    void applyPromotionCode(UUID promotionId);

    /**
     * Cập nhật trạng thái khuyến mãi (ACTIVE, INACTIVE, EXPIRED)
     */
    PromotionResponse updatePromotionStatus(UUID promotionId, String status);
}
