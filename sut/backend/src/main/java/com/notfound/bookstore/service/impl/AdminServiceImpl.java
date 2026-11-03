package com.notfound.bookstore.service.impl;

import com.notfound.bookstore.exception.AppException;
import com.notfound.bookstore.exception.ErrorCode;
import com.notfound.bookstore.model.dto.request.bookrequest.CreateBookRequest;
import com.notfound.bookstore.model.dto.request.bookrequest.UpdateBookRequest;
import com.notfound.bookstore.model.dto.request.categoryrequest.CreateCategoryRequest;
import com.notfound.bookstore.model.dto.request.categoryrequest.UpdateCategoryRequest;
import com.notfound.bookstore.model.dto.response.bookresponse.BookFullDetailResponse;
import com.notfound.bookstore.model.dto.response.categoryresponse.CategoryResponse;
import com.notfound.bookstore.model.entity.*;
import com.notfound.bookstore.repository.*;
import com.notfound.bookstore.service.AdminService;
import com.notfound.bookstore.service.GeminiService;
import com.notfound.bookstore.service.ImageService;
import com.notfound.bookstore.service.QdrantService;
import com.notfound.bookstore.model.enums.OrderStatus;
import com.notfound.bookstore.model.dto.response.statistics.RevenueStatisticResponse;
import com.notfound.bookstore.model.dto.response.statistics.DailyRevenuePoint;
import com.notfound.bookstore.model.dto.response.statistics.PercentageDTO;
import com.notfound.bookstore.model.dto.response.statistics.CategoryPerformanceDTO;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;
import com.notfound.bookstore.model.entity.OrderItem;
import com.notfound.bookstore.model.entity.Category;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
@Transactional
public class AdminServiceImpl implements AdminService {

    BookRepository bookRepository;
    CategoryRepository categoryRepository;
    AuthorRepository authorRepository;
    BookImageRepository bookImageRepository;
    ReviewRepository reviewRepository;
    OrderItemRepository orderItemRepository;
    ImageService imageService;
    GeminiService geminiService;
    QdrantService qdrantService;
    OrderRepository orderRepository;

    @Override
    public BookFullDetailResponse createBook(CreateBookRequest request) {
        if (request.getIsbn() != null && !request.getIsbn().isEmpty()) {
            Book existingBook = bookRepository.findByIsbn(request.getIsbn());
            if (existingBook != null) {
                throw new AppException(ErrorCode.CONFLICT);
            }
        }

        Book book = Book.builder()
                .title(request.getTitle())
                .isbn(request.getIsbn())
                .price(request.getPrice())
                .discountPrice(request.getDiscountPrice())
                .importPrice(request.getImportPrice())
                .stockQuantity(request.getStockQuantity())
                .publishDate(request.getPublishDate())
                .description(request.getDescription())
                .status(request.getStatus() != null ? request.getStatus() : Book.Status.AVAILABLE)
                .build();

        if (request.getAuthorIds() != null && !request.getAuthorIds().isEmpty()) {
            List<Author> authors = authorRepository.findAllById(request.getAuthorIds());
            if (authors.size() != request.getAuthorIds().size()) {
                throw new AppException(ErrorCode.NOT_FOUND);
            }
            book.setAuthors(authors);
        }

        if (request.getCategoryIds() != null && !request.getCategoryIds().isEmpty()) {
            List<Category> categories = categoryRepository.findAllById(request.getCategoryIds());
            if (categories.size() != request.getCategoryIds().size()) {
                throw new AppException(ErrorCode.NOT_FOUND);
            }
            book.setCategories(categories);
        }

        book = bookRepository.save(book);
        log.info("Book created successfully: {}", book.getId());

        // Gộp nội dung để tạo embedding
        String embeddingText = book.getTitle() + ". " + (book.getDescription() != null ? book.getDescription() : "");

        log.info("Creating embedding for book: {} with text: {}", book.getId(), embeddingText);

        try {
            // Gửi sang Gemini để lấy VECTOR
            double[] vector = geminiService.embed(embeddingText);
            log.info("Gemini embedding created, vector size: {}", vector.length);

            // Lưu VECTOR vào Qdrant
            qdrantService.insertBookVector(book.getId(), vector, book);
            log.info("Successfully inserted vector to Qdrant for book: {}", book.getId());

        } catch (Exception e) {
            log.error("Failed to create/insert vector for book {}: {}", book.getId(), e.getMessage(), e);
        }

        return mapToBookFullDetailResponse(book);
    }

    @Override
    public BookFullDetailResponse updateBook(UUID bookId, UpdateBookRequest request) {
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new AppException(ErrorCode.BOOK_NOT_FOUND));

        if (request.getTitle() != null) {
            book.setTitle(request.getTitle());
        }
        if (request.getIsbn() != null) {
            Book existingBook = bookRepository.findByIsbn(request.getIsbn());
            if (existingBook != null && !existingBook.getId().equals(bookId)) {
                throw new AppException(ErrorCode.CONFLICT);
            }
            book.setIsbn(request.getIsbn());
        }
        if (request.getPrice() != null) {
            book.setPrice(request.getPrice());
        }
        if (request.getDiscountPrice() != null) {
            book.setDiscountPrice(request.getDiscountPrice());
        }
        if (request.getImportPrice() != null) {
            book.setImportPrice(request.getImportPrice());
        }
        if (request.getStockQuantity() != null) {
            book.setStockQuantity(request.getStockQuantity());
        }
        if (request.getPublishDate() != null) {
            book.setPublishDate(request.getPublishDate());
        }
        if (request.getDescription() != null) {
            book.setDescription(request.getDescription());
        }
        if (request.getStatus() != null) {
            book.setStatus(request.getStatus());
        }

        if (request.getAuthorIds() != null) {
            List<Author> authors = request.getAuthorIds().isEmpty()
                    ? new ArrayList<>()
                    : authorRepository.findAllById(request.getAuthorIds());
            if (!request.getAuthorIds().isEmpty() && authors.size() != request.getAuthorIds().size()) {
                throw new AppException(ErrorCode.NOT_FOUND);
            }
            book.setAuthors(authors);
        }

        if (request.getCategoryIds() != null) {
            List<Category> categories = request.getCategoryIds().isEmpty()
                    ? new ArrayList<>()
                    : categoryRepository.findAllById(request.getCategoryIds());
            if (!request.getCategoryIds().isEmpty() && categories.size() != request.getCategoryIds().size()) {
                throw new AppException(ErrorCode.NOT_FOUND);
            }
            book.setCategories(categories);
        }

        book = bookRepository.save(book);
        log.info("Book updated successfully: {}", book.getId());

        return mapToBookFullDetailResponse(book);
    }

    @Override
    public void deleteBook(UUID bookId) {
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new AppException(ErrorCode.BOOK_NOT_FOUND));

        List<BookImage> images = bookImageRepository.findByBookId(bookId);
        for (BookImage image : images) {
            if (image.getUrl() != null) {
                imageService.deleteImage(image.getUrl());
            }
        }

        bookRepository.delete(book);
        log.info("Book deleted successfully: {}", bookId);
    }

    @Override
    @Transactional(readOnly = true)
    public BookFullDetailResponse getBookDetail(UUID bookId) {
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new AppException(ErrorCode.BOOK_NOT_FOUND));

        return mapToBookFullDetailResponse(book);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<BookFullDetailResponse> getAllBooks(Pageable pageable) {
        Page<Book> books = bookRepository.findAll(pageable);
        return books.map(this::mapToBookFullDetailResponse);
    }

    @Override
    public BookFullDetailResponse uploadBookImages(UUID bookId, List<MultipartFile> images) {
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new AppException(ErrorCode.BOOK_NOT_FOUND));

        if (images == null || images.isEmpty()) {
            throw new AppException(ErrorCode.BAD_REQUEST);
        }

        List<Map<String, Object>> uploadResults = imageService.uploadMultipleImages(images);

        int priority = 1;
        List<BookImage> existingImages = bookImageRepository.findByBookId(bookId);
        if (!existingImages.isEmpty()) {
            priority = existingImages.stream()
                    .mapToInt(img -> img.getPriority() != null ? img.getPriority() : 0)
                    .max()
                    .orElse(0) + 1;
        }

        for (Map<String, Object> result : uploadResults) {
            String imageUrl = (String) result.get("url");
            BookImage bookImage = new BookImage();
            bookImage.setBook(book);
            bookImage.setUrl(imageUrl);
            bookImage.setPriority(priority++);
            bookImageRepository.save(bookImage);
        }

        log.info("Uploaded {} images for book: {}", uploadResults.size(), bookId);

        Book updatedBook = bookRepository.findById(bookId)
                .orElseThrow(() -> new AppException(ErrorCode.BOOK_NOT_FOUND));
        return mapToBookFullDetailResponse(updatedBook);
    }

    @Override
    public void deleteBookImage(UUID bookId, Long imageId) {
        if (!bookRepository.existsById(bookId)) {
            throw new AppException(ErrorCode.BOOK_NOT_FOUND);
        }

        BookImage image = bookImageRepository.findById(imageId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND));

        if (!image.getBook().getId().equals(bookId)) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }

        if (image.getUrl() != null) {
            imageService.deleteImage(image.getUrl());
        }

        bookImageRepository.delete(image);
        log.info("Deleted image {} for book: {}", imageId, bookId);
    }

    @Override
    public CategoryResponse createCategory(CreateCategoryRequest request) {
        if (categoryRepository.existsByName(request.getName())) {
            throw new AppException(ErrorCode.CONFLICT);
        }

        Category category = Category.builder()
                .name(request.getName())
                .description(request.getDescription())
                .build();

        category = categoryRepository.save(category);
        log.info("Category created successfully: {}", category.getId());

        return mapToCategoryResponse(category);
    }

    @Override
    public CategoryResponse updateCategory(UUID categoryId, UpdateCategoryRequest request) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND));

        if (request.getName() != null && !request.getName().equals(category.getName())) {
            if (categoryRepository.existsByName(request.getName())) {
                throw new AppException(ErrorCode.CONFLICT);
            }
            category.setName(request.getName());
        }

        if (request.getDescription() != null) {
            category.setDescription(request.getDescription());
        }

        if (request.getParentCategoryId() != null && !request.getParentCategoryId().isEmpty()) {
            try {
                UUID parentId = UUID.fromString(request.getParentCategoryId());
                Category parentCategory = categoryRepository.findById(parentId)
                        .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND));

                if (parentId.equals(categoryId)) {
                    throw new AppException(ErrorCode.BAD_REQUEST);
                }

                category.setParentCategory(parentCategory);
            } catch (IllegalArgumentException e) {
                throw new AppException(ErrorCode.BAD_REQUEST);
            }
        } else if (request.getParentCategoryId() != null && request.getParentCategoryId().isEmpty()) {
            category.setParentCategory(null);
        }

        category = categoryRepository.save(category);
        log.info("Category updated successfully: {}", category.getId());

        return mapToCategoryResponse(category);
    }

    @Override
    public void deleteCategory(UUID categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND));

        if (categoryRepository.hasBooks(categoryId)) {
            throw new AppException(ErrorCode.CONFLICT);
        }

        categoryRepository.delete(category);
        log.info("Category deleted successfully: {}", categoryId);
    }

    @Override
    @Transactional(readOnly = true)
    public CategoryResponse getCategory(UUID categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND));

        return mapToCategoryResponse(category);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllCategories() {
        List<Category> categories = categoryRepository.findAll();
        return categories.stream()
                .map(this::mapToCategoryResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<CategoryResponse> getAllCategories(Pageable pageable) {
        Page<Category> categories = categoryRepository.findAll(pageable);
        return categories.map(this::mapToCategoryResponse);
    }

    private BookFullDetailResponse mapToBookFullDetailResponse(Book book) {
        Double averageRating = reviewRepository.calculateAverageRating(book.getId());
        Long totalReviews = reviewRepository.countByBookId(book.getId());
        Long totalOrders = orderItemRepository.getTotalQuantitySoldByBook(book.getId());

        List<BookFullDetailResponse.AuthorInfo> authorInfos = new ArrayList<>();
        if (book.getAuthors() != null) {
            authorInfos = book.getAuthors().stream()
                    .map(author -> BookFullDetailResponse.AuthorInfo.builder()
                            .id(author.getId())
                            .name(author.getName())
                            .biography(author.getBiography())
                            .dateOfBirth(author.getDateOfBirth())
                            .nationality(author.getNationality())
                            .build())
                    .collect(Collectors.toList());
        }

        List<BookFullDetailResponse.CategoryInfo> categoryInfos = new ArrayList<>();
        if (book.getCategories() != null) {
            categoryInfos = book.getCategories().stream()
                    .map(category -> BookFullDetailResponse.CategoryInfo.builder()
                            .id(category.getId())
                            .name(category.getName())
                            .description(category.getDescription())
                            .build())
                    .collect(Collectors.toList());
        }

        List<BookImage> images = bookImageRepository.findByBookId(book.getId());
        List<BookFullDetailResponse.ImageInfo> imageInfos = images.stream()
                .map(image -> BookFullDetailResponse.ImageInfo.builder()
                        .id(image.getId())
                        .url(image.getUrl())
                        .priority(image.getPriority())
                        .uploadedAt(image.getUploadedAt())
                        .build())
                .collect(Collectors.toList());

        return BookFullDetailResponse.builder()
                .id(book.getId())
                .title(book.getTitle())
                .isbn(book.getIsbn())
                .price(book.getPrice())
                .discountPrice(book.getDiscountPrice())
                .importPrice(book.getImportPrice())
                .stockQuantity(book.getStockQuantity())
                .publishDate(book.getPublishDate())
                .description(book.getDescription())
                .status(book.getStatus())
                .createdAt(book.getCreatedAt())
                .updatedAt(book.getUpdatedAt())
                .createdBy(book.getCreatedBy())
                .updatedBy(book.getUpdatedBy())
                .authors(authorInfos)
                .categories(categoryInfos)
                .images(imageInfos)
                .averageRating(averageRating != null ? Math.round(averageRating * 10.0) / 10.0 : null)
                .totalReviews(totalReviews != null ? totalReviews.intValue() : 0)
                .totalOrders(totalOrders != null ? totalOrders.intValue() : 0)
                .build();
    }

    private CategoryResponse mapToCategoryResponse(Category category) {
        int totalBooks = category.getBooks() != null ? category.getBooks().size() : 0;

        List<CategoryResponse> subCategories = new ArrayList<>();
        if (category.getSubCategories() != null) {
            subCategories = category.getSubCategories().stream()
                    .map(this::mapToCategoryResponseSimple)
                    .collect(Collectors.toList());
        }

        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .parentCategoryId(category.getParentCategory() != null ? category.getParentCategory().getId() : null)
                .parentCategoryName(category.getParentCategory() != null ? category.getParentCategory().getName() : null)
                .subCategories(subCategories)
                .totalBooks(totalBooks)
                .build();
    }

    private CategoryResponse mapToCategoryResponseSimple(Category category) {
        int totalBooks = category.getBooks() != null ? category.getBooks().size() : 0;
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .parentCategoryId(category.getParentCategory() != null ? category.getParentCategory().getId() : null)
                .parentCategoryName(category.getParentCategory() != null ? category.getParentCategory().getName() : null)
                .totalBooks(totalBooks)
                .build();
    }

    @Override
    public String uploadAvatar(MultipartFile image) {
        log.info("Uploading avatar image...");
        
        if (image == null || image.isEmpty()) {
            throw new AppException(ErrorCode.BAD_REQUEST);
        }

        // Upload to Cloudinary with folder "bookstore/avatars"
        Map<String, Object> uploadResult = imageService.uploadImage(image, "bookstore/avatars");
        
        // Get URL from upload result
        String avatarUrl = (String) uploadResult.get("url");
        
        log.info("Avatar uploaded successfully: {}", avatarUrl);
        return avatarUrl;
    }

    @Override
    public RevenueStatisticResponse getRevenueStatistics(LocalDate fromDate, LocalDate toDate) {
        LocalDateTime start = fromDate.atStartOfDay();
        LocalDateTime end = toDate.atTime(23, 59, 59);

        // Fetch all orders in range
        List<Order> orders = orderRepository.findByOrderDateBetween(start, end);

        // Filter valid orders (COMPLETED or DELIVERED)
        List<Order> validOrders = orders.stream()
                .filter(o -> o.getStatus() == OrderStatus.COMPLETED || o.getStatus() == OrderStatus.DELIVERED)
                .collect(Collectors.toList());

        Double totalRevenue = validOrders.stream()
                .mapToDouble(Order::getTotalAmount)
                .sum();

        Long totalOrders = (long) validOrders.size();

        Map<LocalDate, List<Order>> ordersByDate = validOrders.stream()
                .collect(Collectors.groupingBy(o -> o.getOrderDate().toLocalDate()));

        List<DailyRevenuePoint> breakdown = new ArrayList<>();

        LocalDate current = fromDate;
        while (!current.isAfter(toDate)) {
            List<Order> dailyOrders = ordersByDate.getOrDefault(current, new ArrayList<>());
            Double dailyRevenue = dailyOrders.stream().mapToDouble(Order::getTotalAmount).sum();

            breakdown.add(DailyRevenuePoint.builder()
                    .date(current)
                    .revenue(dailyRevenue)
                    .orderCount((long) dailyOrders.size())
                    .build());

            current = current.plusDays(1);
        }

        // Calculate Revenue by Payment Method
        Map<String, Double> revenueByPaymentMethodMap = validOrders.stream()
                .collect(Collectors.groupingBy(
                        order -> order.getPaymentMethod() != null ? order.getPaymentMethod() : "UNKNOWN",
                        Collectors.summingDouble(Order::getTotalAmount)
                ));

        List<PercentageDTO> revenueByPaymentMethod = new ArrayList<>();
        double sumRevenue = totalRevenue > 0 ? totalRevenue : 1.0; // Avoid division by zero

        for (Map.Entry<String, Double> entry : revenueByPaymentMethodMap.entrySet()) {
            double value = Math.round((entry.getValue() / sumRevenue) * 100.0 * 100.0) / 100.0; // Round to 2 decimals
            revenueByPaymentMethod.add(PercentageDTO.builder()
                    .category(entry.getKey())
                    .value(value)
                    .build());
        }

        // Calculate Category Performance with Real Growth
        long daysDiff = ChronoUnit.DAYS.between(fromDate, toDate) + 1;
        LocalDate previousFromDate = fromDate.minusDays(daysDiff);
        LocalDate previousToDate = fromDate.minusDays(1);
        LocalDateTime prevStart = previousFromDate.atStartOfDay();
        LocalDateTime prevEnd = previousToDate.atTime(23, 59, 59);

        // Fetch previous period orders
        log.info("Calculating growth. Current Period: {} to {}", fromDate, toDate);
        log.info("Previous Period: {} to {}", previousFromDate, previousToDate);
        List<Order> previousOrders = orderRepository.findByOrderDateBetween(prevStart, prevEnd);
        log.info("Found {} total orders in previous period.", previousOrders.size());
        if (!previousOrders.isEmpty()) {
            previousOrders.stream().limit(5).forEach(o -> log.info("Sample Order Status: {} Date: {}", o.getStatus(), o.getOrderDate()));
        }

        List<Order> validPreviousOrders = previousOrders.stream()
                .filter(o -> o.getStatus() == OrderStatus.COMPLETED || o.getStatus() == OrderStatus.DELIVERED)
                .collect(Collectors.toList());

        // Calculate Revenue by Category for Current Period
        Map<String, Double> currentCategoryRevenue = new HashMap<>();
        for (Order order : validOrders) {
            if (order.getOrderItems() != null) {
                for (OrderItem item : order.getOrderItems()) {
                    // Assuming accessing book and categories is transactional/eager enough or lazily handled
                    if (item.getBook() != null && item.getBook().getCategories() != null) {
                        for (Category cat : item.getBook().getCategories()) {
                            currentCategoryRevenue.merge(cat.getName(), item.getSubtotal(), Double::sum);
                        }
                    }
                }
            }
        }

        // Calculate Revenue by Category for Previous Period
        Map<String, Double> previousCategoryRevenue = new HashMap<>();
        for (Order order : validPreviousOrders) {
             if (order.getOrderItems() != null) {
                for (OrderItem item : order.getOrderItems()) {
                    if (item.getBook() != null && item.getBook().getCategories() != null) {
                        for (Category cat : item.getBook().getCategories()) {
                            previousCategoryRevenue.merge(cat.getName(), item.getSubtotal(), Double::sum);
                        }
                    }
                }
            }
        }

        List<CategoryPerformanceDTO> categoryPerformance = new ArrayList<>();
        // Iterate over all categories found in current period (or should we include previous ones that dropped to 0? usually Top/Focus on current)
        // Let's focus on top performing current categories
        for (Map.Entry<String, Double> entry : currentCategoryRevenue.entrySet()) {
            String categoryName = entry.getKey();
            Double currentRev = entry.getValue();
            Double previousRev = previousCategoryRevenue.getOrDefault(categoryName, 0.0);
            
            log.info("Category: {}, Current Rev: {}, Previous Rev: {}", categoryName, currentRev, previousRev);

            double growth = 0.0;
            if (previousRev > 0) {
                growth = ((currentRev - previousRev) / previousRev) * 100.0;
            } else if (currentRev > 0) {
                growth = 100.0; // New revenue vs 0 previous
            }

            // Round growth to 1 decimal
            growth = Math.round(growth * 10.0) / 10.0;

            categoryPerformance.add(CategoryPerformanceDTO.builder()
                    .category(categoryName)
                    .revenue(currentRev)
                    .growth(growth)
                    .build());
        }

        // Sort by revenue desc
        categoryPerformance.sort((a, b) -> b.getRevenue().compareTo(a.getRevenue()));

        return new RevenueStatisticResponse(totalRevenue, totalOrders, breakdown, revenueByPaymentMethod, categoryPerformance);
    }
}
