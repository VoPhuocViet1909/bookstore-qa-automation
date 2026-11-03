package com.notfound.bookstore.util;

import com.notfound.bookstore.model.entity.Book;

/**
 * Utility class for consistent price calculations throughout the application.
 * Ensures that discount prices are always prioritized over regular prices.
 */
public class PriceCalculationUtil {

    /**
     * Get the effective price for a book.
     * Returns discount price if available and greater than 0, otherwise returns regular price.
     *
     * @param book The book entity
     * @return The effective price to use
     */
    public static Double getEffectivePrice(Book book) {
        if (book == null) {
            throw new IllegalArgumentException("Book cannot be null");
        }

        return (book.getDiscountPrice() != null && book.getDiscountPrice() > 0)
                ? book.getDiscountPrice()
                : book.getPrice();
    }

    /**
     * Calculate subtotal for a book with given quantity.
     * Uses discount price if available.
     *
     * @param book The book entity
     * @param quantity The quantity
     * @return The calculated subtotal
     */
    public static Double calculateSubtotal(Book book, Integer quantity) {
        if (quantity == null || quantity <= 0) {
            throw new IllegalArgumentException("Quantity must be greater than 0");
        }

        return getEffectivePrice(book) * quantity;
    }

    /**
     * Check if a book has an active discount.
     *
     * @param book The book entity
     * @return true if the book has a valid discount price
     */
    public static boolean hasDiscount(Book book) {
        return book.getDiscountPrice() != null && book.getDiscountPrice() > 0;
    }

    /**
     * Calculate the discount amount for a book.
     *
     * @param book The book entity
     * @return The discount amount (0 if no discount)
     */
    public static Double getDiscountAmount(Book book) {
        if (!hasDiscount(book)) {
            return 0.0;
        }

        return book.getPrice() - book.getDiscountPrice();
    }

    /**
     * Calculate the discount percentage for a book.
     *
     * @param book The book entity
     * @return The discount percentage (0 if no discount)
     */
    public static Double getDiscountPercentage(Book book) {
        if (!hasDiscount(book)) {
            return 0.0;
        }

        return ((book.getPrice() - book.getDiscountPrice()) / book.getPrice()) * 100;
    }
}

