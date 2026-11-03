package com.notfound.bookstore.controller;

import com.notfound.bookstore.model.dto.request.promotionrequest.CreatePromotionRequest;
import com.notfound.bookstore.model.dto.request.promotionrequest.UpdatePromotionRequest;
import com.notfound.bookstore.model.dto.request.promotionrequest.ValidatePromotionCodeRequest;
import com.notfound.bookstore.model.dto.response.ApiResponse;
import com.notfound.bookstore.model.dto.response.promotionresponse.PromotionResponse;
import com.notfound.bookstore.model.dto.response.promotionresponse.PromotionValidationResponse;
import com.notfound.bookstore.service.PromotionService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Controller xử lý các chức năng liên quan đến khuyến mãi
 * Bao gồm tạo, cập nhật, xóa khuyến mãi và xác thực mã khuyến mãi
 */
@RestController
@RequestMapping("/api/promotions")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PromotionController {

        PromotionService promotionService;

        /**
         * Tạo khuyến mãi mới (Chỉ Admin)
         * Cho phép tạo các loại khuyến mãi: giảm giá theo phần trăm, số tiền cố định
         *
         * @param request Thông tin khuyến mãi bao gồm code, description, discountType,
         *                discountValue, startDate, endDate, minOrderValue
         * @return Thông tin khuyến mãi vừa được tạo
         */
        @PostMapping
        public ApiResponse<PromotionResponse> createPromotion(
                        @Valid @RequestBody CreatePromotionRequest request) {
                PromotionResponse promotion = promotionService.createPromotion(request);
                return ApiResponse.<PromotionResponse>builder()
                                .code(1000)
                                .message("Tạo khuyến mãi thành công")
                                .result(promotion)
                                .build();
        }

        /**
         * Cập nhật thông tin khuyến mãi (Chỉ Admin)
         * Có thể cập nhật mô tả, giá trị giảm giá, thời gian hiệu lực
         *
         * @param id      ID của khuyến mãi cần cập nhật
         * @param request Thông tin cập nhật
         * @return Thông tin khuyến mãi sau khi cập nhật
         */
        @PutMapping("/{id}")
        public ApiResponse<PromotionResponse> updatePromotion(
                        @PathVariable UUID id,
                        @Valid @RequestBody UpdatePromotionRequest request) {
                PromotionResponse promotion = promotionService.updatePromotion(id, request);
                return ApiResponse.<PromotionResponse>builder()
                                .code(1000)
                                .message("Cập nhật khuyến mãi thành công")
                                .result(promotion)
                                .build();
        }

        /**
         * Xóa khuyến mãi khỏi hệ thống (Chỉ Admin)
         * Xóa vĩnh viễn hoặc soft delete tùy cấu hình
         *
         * @param id ID của khuyến mãi cần xóa
         * @return Kết quả xóa khuyến mãi
         */
        @DeleteMapping("/{id}")
        public ApiResponse<Void> deletePromotion(@PathVariable UUID id) {
                promotionService.deletePromotion(id);
                return ApiResponse.<Void>builder()
                                .code(1000)
                                .message("Xóa khuyến mãi thành công")
                                .build();
        }

        /**
         * Lấy thông tin chi tiết của một khuyến mãi (admin)
         * Trả về đầy đủ thông tin bao gồm điều kiện áp dụng, thời gian hiệu lực
         *
         * @param id ID của khuyến mãi cần xem
         * @return Thông tin chi tiết của khuyến mãi
         */
        @GetMapping("/{id}")
        public ApiResponse<PromotionResponse> getPromotionById(@PathVariable UUID id) {
                PromotionResponse promotion = promotionService.getPromotionById(id);
                return ApiResponse.<PromotionResponse>builder()
                                .code(1000)
                                .message("Lấy thông tin khuyến mãi thành công")
                                .result(promotion)
                                .build();
        }

        /**
         * Lấy tất cả khuyến mãi có phân trang (Chỉ Admin)
         * Hiển thị tất cả khuyến mãi trong hệ thống kể cả đã hết hạn
         *
         * @param page Số trang (mặc định: 0)
         * @param size Kích thước trang (mặc định: 10)
         * @return Danh sách khuyến mãi được phân trang
         */
        @GetMapping
        public ApiResponse<Map<String, Object>> getAllPromotions(
                        @RequestParam(defaultValue = "0") int page,
                        @RequestParam(defaultValue = "10") int size) {
                Pageable pageable = PageRequest.of(page, size);
                Page<PromotionResponse> promotions = promotionService.getAllPromotions(pageable);

                // Map Spring Page sang format mà FE mong đợi (có field 'page' thay vì 'number')
                // Dùng LinkedHashMap để đảm bảo thứ tự field
                Map<String, Object> pageResponse = new LinkedHashMap<>();
                pageResponse.put("content", promotions.getContent());
                pageResponse.put("page", promotions.getNumber()); // Map number -> page
                pageResponse.put("size", promotions.getSize());
                pageResponse.put("totalElements", promotions.getTotalElements());
                pageResponse.put("totalPages", promotions.getTotalPages());

                return ApiResponse.<Map<String, Object>>builder()
                                .code(1000)
                                .message("Lấy danh sách khuyến mãi thành công")
                                .result(pageResponse)
                                .build();
        }

        /**
         * Lấy danh sách khuyến mãi đang hoạt động (Public)
         * Chỉ trả về các khuyến mãi còn hiệu lực và đang ở trạng thái ACTIVE
         *
         * @return Danh sách khuyến mãi đang hoạt động
         */
        @GetMapping("/active")
        public ApiResponse<List<PromotionResponse>> getActivePromotions() {
                List<PromotionResponse> promotions = promotionService.getActivePromotions();
                return ApiResponse.<List<PromotionResponse>>builder()
                                .code(1000)
                                .message("Lấy danh sách khuyến mãi đang hoạt động thành công")
                                .result(promotions)
                                .build();
        }

        /**
         * Lấy danh sách khuyến mãi áp dụng cho một cuốn sách cụ thể
         * Trả về các khuyến mãi đang hoạt động và có thể áp dụng cho sách
         *
         * @param bookId ID của sách cần xem khuyến mãi
         * @return Danh sách khuyến mãi áp dụng cho sách
         */
        @GetMapping("/book/{bookId}")
        public ApiResponse<List<PromotionResponse>> getPromotionsByBookId(
                        @PathVariable UUID bookId) {
                List<PromotionResponse> promotions = promotionService.getPromotionsByBookId(bookId);
                return ApiResponse.<List<PromotionResponse>>builder()
                                .code(1000)
                                .message("Lấy danh sách khuyến mãi cho sách thành công")
                                .result(promotions)
                                .build();
        }

        /**
         * Xác thực mã khuyến mãi (Public)
         * Kiểm tra tính hợp lệ của mã khuyến mãi trước khi áp dụng vào đơn hàng
         * Kiểm tra: mã tồn tại, còn hiệu lực, đủ điều kiện áp dụng
         *
         * @param request Thông tin xác thực bao gồm promotionCode, orderValue, bookIds
         * @return Kết quả xác thực với thông tin giảm giá nếu hợp lệ
         */
        @PostMapping("/validate")
        public ApiResponse<PromotionValidationResponse> validatePromotionCode(
                        @Valid @RequestBody ValidatePromotionCodeRequest request) {
                PromotionValidationResponse response = promotionService.validatePromotionCode(request);
                return ApiResponse.<PromotionValidationResponse>builder()
                                .code(response.getIsValid() ? 1000 : 4002)
                                .message(response.getMessage())
                                .result(response)
                                .build();
        }

        /**
         * Cập nhật trạng thái khuyến mãi (Chỉ Admin)
         * Cho phép kích hoạt/vô hiệu hóa khuyến mãi mà không cần xóa
         *
         * @param id     ID của khuyến mãi
         * @param status Trạng thái mới (ACTIVE, INACTIVE, EXPIRED)
         * @return Thông tin khuyến mãi sau khi cập nhật trạng thái
         */
        @PatchMapping("/{id}/status")
        public ApiResponse<PromotionResponse> updatePromotionStatus(
                        @PathVariable UUID id,
                        @RequestParam String status) {
                PromotionResponse promotion = promotionService.updatePromotionStatus(id, status);
                return ApiResponse.<PromotionResponse>builder()
                                .code(1000)
                                .message("Cập nhật trạng thái khuyến mãi thành công")
                                .result(promotion)
                                .build();
        }
}
