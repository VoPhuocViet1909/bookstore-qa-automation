package com.notfound.bookstore.service.impl;

import com.notfound.bookstore.exception.AppException;
import com.notfound.bookstore.exception.ErrorCode;
import com.notfound.bookstore.model.dto.request.promotionrequest.CreatePromotionRequest;
import com.notfound.bookstore.model.dto.request.promotionrequest.UpdatePromotionRequest;
import com.notfound.bookstore.model.dto.request.promotionrequest.ValidatePromotionCodeRequest;
import com.notfound.bookstore.model.dto.response.promotionresponse.PromotionResponse;
import com.notfound.bookstore.model.dto.response.promotionresponse.PromotionValidationResponse;
import com.notfound.bookstore.model.entity.Book;
import com.notfound.bookstore.model.entity.Promotion;
import com.notfound.bookstore.repository.BookRepository;
import com.notfound.bookstore.repository.PromotionRepository;
import com.notfound.bookstore.service.PromotionService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PromotionServiceImpl implements PromotionService {

    PromotionRepository promotionRepository;
    BookRepository bookRepository;

    @Override
    @Transactional
    public PromotionResponse createPromotion(CreatePromotionRequest request) {
        // Kiểm tra mã khuyến mãi đã tồn tại chưa
        if (promotionRepository.findByCode(request.getCode().toUpperCase()).isPresent()) {
            throw new AppException(ErrorCode.PROMOTION_CODE_ALREADY_EXISTS);
        }

        Promotion promotion = new Promotion();
        promotion.setName(request.getName());
        promotion.setCode(request.getCode().toUpperCase());
        promotion.setDiscountType(Promotion.DiscountType.PERCENTAGE);
        promotion.setDiscountValue(request.getDiscountPercent());
        promotion.setMinOrderValue(0.0);
        promotion.setStartDate(request.getStartDate());
        promotion.setEndDate(request.getEndDate());
        promotion.setUsageLimit(request.getUsageLimit());
        promotion.setUsageCount(0);
        promotion.setDescription(request.getDescription());

        // Tự động set status dựa trên startDate và endDate
        LocalDate today = LocalDate.now();
        // Nếu endDate < today, set EXPIRED
        if (request.getEndDate().isBefore(today)) {
            promotion.setStatus(Promotion.Status.EXPIRED);
        }
        // Nếu startDate > today, set INACTIVE (chưa đến ngày áp dụng)
        else if (request.getStartDate().isAfter(today)) {
            promotion.setStatus(Promotion.Status.INACTIVE);
        }
        // Nếu startDate <= today <= endDate, set ACTIVE (trong thời gian áp dụng)
        else {
            promotion.setStatus(Promotion.Status.ACTIVE);
        }

        // Nếu có danh sách sách áp dụng
        if (request.getApplicableBookIds() != null && !request.getApplicableBookIds().isEmpty()) {
            List<Book> books = bookRepository.findAllById(request.getApplicableBookIds());
            if (books.size() != request.getApplicableBookIds().size()) {
                throw new AppException(ErrorCode.BOOK_NOT_FOUND);
            }
            promotion.setApplicableBooks(books);
        } else {
            promotion.setApplicableBooks(new ArrayList<>()); // null = áp dụng cho tất cả
        }

        Promotion saved = promotionRepository.save(promotion);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public PromotionResponse updatePromotion(UUID promotionId, UpdatePromotionRequest request) {
        Promotion promotion = promotionRepository.findById(promotionId)
                .orElseThrow(() -> new AppException(ErrorCode.PROMOTION_NOT_FOUND));

        if (request.getName() != null) {
            promotion.setName(request.getName());
        }
        if (request.getCode() != null) {
            String newCode = request.getCode().toUpperCase();
            // Kiểm tra mã mới có trùng với mã khác không
            promotionRepository.findByCode(newCode)
                    .ifPresent(existing -> {
                        if (!existing.getPromotionID().equals(promotionId)) {
                            throw new AppException(ErrorCode.PROMOTION_CODE_ALREADY_EXISTS);
                        }
                    });
            promotion.setCode(newCode);
        }
        if (request.getDiscountPercent() != null) {
            promotion.setDiscountType(Promotion.DiscountType.PERCENTAGE);
            promotion.setDiscountValue(request.getDiscountPercent());
        }

        // Lưu dates hiện tại để so sánh
        LocalDate oldStartDate = promotion.getStartDate();
        LocalDate oldEndDate = promotion.getEndDate();

        if (request.getStartDate() != null) {
            promotion.setStartDate(request.getStartDate());
        }
        if (request.getEndDate() != null) {
            promotion.setEndDate(request.getEndDate());
        }

        // Tự động cập nhật status dựa trên startDate và endDate sau khi update
        // Chỉ cập nhật status nếu có thay đổi về dates hoặc status hiện tại là EXPIRED
        LocalDate today = LocalDate.now();
        LocalDate finalStartDate = request.getStartDate() != null ? request.getStartDate() : promotion.getStartDate();
        LocalDate finalEndDate = request.getEndDate() != null ? request.getEndDate() : promotion.getEndDate();

        // Kiểm tra xem có thay đổi dates không
        boolean datesChanged = (request.getStartDate() != null && !request.getStartDate().equals(oldStartDate)) ||
                (request.getEndDate() != null && !request.getEndDate().equals(oldEndDate));

        // Nếu có thay đổi dates hoặc status hiện tại là EXPIRED, tự động cập nhật status
        if (datesChanged || promotion.getStatus() == Promotion.Status.EXPIRED) {
            // Nếu endDate < today, set EXPIRED
            if (finalEndDate.isBefore(today)) {
                promotion.setStatus(Promotion.Status.EXPIRED);
            }
            // Nếu startDate > today, set INACTIVE (chưa đến ngày áp dụng)
            else if (finalStartDate.isAfter(today)) {
                promotion.setStatus(Promotion.Status.INACTIVE);
            }
            // Nếu startDate <= today <= endDate, set ACTIVE (trong thời gian áp dụng)
            else {
                promotion.setStatus(Promotion.Status.ACTIVE);
            }
        }

        if (request.getUsageLimit() != null) {
            promotion.setUsageLimit(request.getUsageLimit());
        }
        if (request.getDescription() != null) {
            promotion.setDescription(request.getDescription());
        }
        if (request.getStatus() != null) {
            try {
                promotion.setStatus(Promotion.Status.valueOf(request.getStatus().toUpperCase()));
            } catch (IllegalArgumentException e) {
                throw new AppException(ErrorCode.INVALID_ARGUMENTS);
            }
        }
        if (request.getApplicableBookIds() != null) {
            if (request.getApplicableBookIds().isEmpty()) {
                promotion.setApplicableBooks(new ArrayList<>());
            } else {
                List<Book> books = bookRepository.findAllById(request.getApplicableBookIds());
                if (books.size() != request.getApplicableBookIds().size()) {
                    throw new AppException(ErrorCode.BOOK_NOT_FOUND);
                }
                promotion.setApplicableBooks(books);
            }
        }

        Promotion updated = promotionRepository.save(promotion);
        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public void deletePromotion(UUID promotionId) {
        Promotion promotion = promotionRepository.findById(promotionId)
                .orElseThrow(() -> new AppException(ErrorCode.PROMOTION_NOT_FOUND));
        promotionRepository.delete(promotion);
    }

    @Override
    public PromotionResponse getPromotionById(UUID promotionId) {
        Promotion promotion = promotionRepository.findById(promotionId)
                .orElseThrow(() -> new AppException(ErrorCode.PROMOTION_NOT_FOUND));
        return mapToResponse(promotion);
    }

    @Override
    public Page<PromotionResponse> getAllPromotions(Pageable pageable) {
        return promotionRepository.findAll(pageable)
                .map(this::mapToResponse);
    }

    @Override
    public List<PromotionResponse> getActivePromotions() {
        LocalDate today = LocalDate.now();
        return promotionRepository.findActivePromotions(today)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<PromotionResponse> getPromotionsByBookId(UUID bookId) {
        LocalDate today = LocalDate.now();
        return promotionRepository.findActivePromotionsByBook(bookId, today)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public PromotionValidationResponse validatePromotionCode(ValidatePromotionCodeRequest request) {
        LocalDate today = LocalDate.now();
        Optional<Promotion> promotionOpt = promotionRepository.findByCode(request.getCode().toUpperCase());

        if (promotionOpt.isEmpty()) {
            return PromotionValidationResponse.builder()
                    .isValid(false)
                    .message("Mã khuyến mãi không tồn tại")
                    .reason("Mã khuyến mãi không tồn tại")
                    .build();
        }

        Promotion promotion = promotionOpt.get();

        // Kiểm tra trạng thái
        if (promotion.getStatus() != Promotion.Status.ACTIVE) {
            return PromotionValidationResponse.builder()
                    .isValid(false)
                    .message("Mã khuyến mãi không hoạt động")
                    .reason("Khuyến mãi đang không hoạt động")
                    .promotionID(promotion.getPromotionID())
                    .code(promotion.getCode())
                    .build();
        }

        // Kiểm tra thời gian
        if (today.isBefore(promotion.getStartDate())) {
            return PromotionValidationResponse.builder()
                    .isValid(false)
                    .message("Mã khuyến mãi chưa có hiệu lực")
                    .reason("Khuyến mãi chưa bắt đầu")
                    .promotionID(promotion.getPromotionID())
                    .code(promotion.getCode())
                    .build();
        }

        if (today.isAfter(promotion.getEndDate())) {
            return PromotionValidationResponse.builder()
                    .isValid(false)
                    .message("Mã khuyến mãi đã hết hạn")
                    .reason("Khuyến mãi đã hết hạn")
                    .promotionID(promotion.getPromotionID())
                    .code(promotion.getCode())
                    .build();
        }

        // Kiểm tra số lượt sử dụng
        if (promotion.getUsageCount() >= promotion.getUsageLimit()) {
            return PromotionValidationResponse.builder()
                    .isValid(false)
                    .message("Mã khuyến mãi đã hết lượt sử dụng")
                    .reason("Đã đạt giới hạn sử dụng")
                    .promotionID(promotion.getPromotionID())
                    .code(promotion.getCode())
                    .build();
        }

        // Kiểm tra áp dụng cho sách (nếu có danh sách sách)
        if (request.getBookIds() != null && !request.getBookIds().isEmpty()) {
            List<Book> applicableBooks = promotion.getApplicableBooks();
            // Nếu có danh sách sách áp dụng (không rỗng), kiểm tra xem sách có trong danh
            // sách không
            if (applicableBooks != null && !applicableBooks.isEmpty()) {
                boolean isApplicable = request.getBookIds().stream()
                        .anyMatch(bookId -> applicableBooks.stream()
                                .anyMatch(book -> book.getId().equals(bookId)));
                if (!isApplicable) {
                    return PromotionValidationResponse.builder()
                            .isValid(false)
                            .message("Mã khuyến mãi không áp dụng cho sản phẩm này")
                            .reason("Sản phẩm không nằm trong danh sách áp dụng")
                            .promotionID(promotion.getPromotionID())
                            .code(promotion.getCode())
                            .build();
                }
            }
        }

        // Tất cả điều kiện đều hợp lệ
        // Dùng method getDiscountPercent() từ entity (backward compatibility)
        return PromotionValidationResponse.builder()
                .isValid(true)
                .message("Mã khuyến mãi hợp lệ")
                .promotionID(promotion.getPromotionID())
                .code(promotion.getCode())
                .discountPercent(promotion.getDiscountPercent())
                .build();
    }

    @Override
    @Transactional
    public void applyPromotionCode(UUID promotionId) {
        Promotion promotion = promotionRepository.findById(promotionId)
                .orElseThrow(() -> new AppException(ErrorCode.PROMOTION_NOT_FOUND));
        promotion.incrementUsageCount();
        promotionRepository.save(promotion);
    }

    @Override
    @Transactional
    public PromotionResponse updatePromotionStatus(UUID promotionId, String status) {
        Promotion promotion = promotionRepository.findById(promotionId)
                .orElseThrow(() -> new AppException(ErrorCode.PROMOTION_NOT_FOUND));
        try {
            promotion.setStatus(Promotion.Status.valueOf(status.toUpperCase()));
        } catch (IllegalArgumentException e) {
            throw new AppException(ErrorCode.INVALID_ARGUMENTS);
        }
        Promotion updated = promotionRepository.save(promotion);
        return mapToResponse(updated);
    }

    private PromotionResponse mapToResponse(Promotion promotion) {
        List<UUID> applicableBookIds = promotion.getApplicableBooks() != null
                ? promotion.getApplicableBooks().stream()
                        .map(Book::getId)
                        .collect(Collectors.toList())
                : new ArrayList<>();

        // Dùng method getDiscountPercent() từ entity (backward compatibility)
        return PromotionResponse.builder()
                .promotionID(promotion.getPromotionID())
                .name(promotion.getName())
                .code(promotion.getCode())
                .discountPercent(promotion.getDiscountPercent())
                .startDate(promotion.getStartDate())
                .endDate(promotion.getEndDate())
                .description(promotion.getDescription())
                .usageCount(promotion.getUsageCount())
                .usageLimit(promotion.getUsageLimit())
                .status(promotion.getStatus().name())
                .applicableBookIds(applicableBookIds)
                .isValid(promotion.isValid())
                .build();
    }
}
