package com.notfound.bookstore.model.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.UuidGenerator;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "promotions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = { "applicableBooks", "applicableCategories" })
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Promotion {

    @Id
    @UuidGenerator
    UUID promotionID;

    @Column(nullable = false)
    String name;

    @Column(unique = true, nullable = false)
    String code;

    @Column(name = "usage_count", nullable = false)
    Integer usageCount = 0;

    @Column(name = "usage_limit", nullable = false)
    Integer usageLimit = 100;

    @Enumerated(EnumType.STRING)
    @Column(name = "discount_type", nullable = false)
    DiscountType discountType = DiscountType.PERCENTAGE;

    @Column(name = "discount_value", nullable = false)
    Double discountValue; // Lưu % hoặc số tiền tùy vào discountType

    @Column(name = "max_discount_amount")
    Double maxDiscountAmount; // Chỉ dùng khi discountType = PERCENTAGE

    @Column(name = "min_order_value", nullable = false)
    Double minOrderValue = 0.0; // Đơn hàng phải đạt mức này mới được dùng

    @Column(name = "start_date", nullable = false)
    LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    LocalDate endDate;

    @Column(columnDefinition = "TEXT")
    String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    Status status;

    @Column(name = "created_by")
    String createdBy;

    @Column(name = "updated_by")
    String updatedBy;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "promotion_books", joinColumns = @JoinColumn(name = "promotion_id"), inverseJoinColumns = @JoinColumn(name = "book_id"))
    List<Book> applicableBooks;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "promotion_categories", joinColumns = @JoinColumn(name = "promotion_id"), inverseJoinColumns = @JoinColumn(name = "category_id"))
    List<Category> applicableCategories;

    public enum Status {
        ACTIVE, INACTIVE, EXPIRED
    }

    public enum DiscountType {
        PERCENTAGE, // Giảm theo % (vd: 10%)
        FIXED_AMOUNT // Giảm tiền mặt (vd: 50.000đ)
    }

    public void incrementUsageCount() {
        this.usageCount++;
    }

    public boolean isValid() {
        LocalDate now = LocalDate.now();
        return status == Status.ACTIVE
                && !now.isBefore(startDate)
                && !now.isAfter(endDate)
                && usageCount < usageLimit;
    }

    public boolean isValid(Double orderTotal) {
        LocalDate now = LocalDate.now();
        return status == Status.ACTIVE
                && !now.isBefore(startDate)
                && !now.isAfter(endDate)
                && usageCount < usageLimit
                && orderTotal >= minOrderValue;
    }

    /**
     * Tính số tiền được giảm dựa trên discount type
     */
    public Double calculateDiscountAmount(Double orderTotal) {
        if (!isValid(orderTotal)) {
            return 0.0;
        }

        if (discountType == DiscountType.PERCENTAGE) {
            Double discountAmount = orderTotal * (discountValue / 100.0);
            // Áp dụng max discount nếu có
            if (maxDiscountAmount != null && discountAmount > maxDiscountAmount) {
                return maxDiscountAmount;
            }
            return discountAmount;
        } else {
            // FIXED_AMOUNT
            return Math.min(discountValue, orderTotal);
        }
    }

    /**
     * Backward compatibility - trả về discount percent
     */
    public Double getDiscountPercent() {
        if (discountType == DiscountType.PERCENTAGE) {
            return discountValue;
        }
        return 0.0;
    }
}
