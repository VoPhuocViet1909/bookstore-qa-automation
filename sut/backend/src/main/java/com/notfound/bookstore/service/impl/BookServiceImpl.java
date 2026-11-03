package com.notfound.bookstore.service.impl;

import com.notfound.bookstore.model.dto.request.bookrequest.*;
import com.notfound.bookstore.model.dto.response.bookresponse.BookResponse;
import com.notfound.bookstore.model.dto.response.bookresponse.BookSummaryResponse;
import com.notfound.bookstore.model.dto.response.bookresponse.PageResponse;
import com.notfound.bookstore.model.entity.Book;
import com.notfound.bookstore.model.mapper.BookMapper;
import com.notfound.bookstore.repository.BookRepository;
import com.notfound.bookstore.service.BookService;
import com.notfound.bookstore.service.GeminiService;
import com.notfound.bookstore.model.dto.response.categoryresponse.CategoryBooksResponse;
import com.notfound.bookstore.model.dto.response.categoryresponse.CategoryResponse;
import com.notfound.bookstore.model.entity.Category;
import com.notfound.bookstore.repository.CategoryRepository;
import com.notfound.bookstore.service.QdrantService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class BookServiceImpl implements BookService {

    private final BookRepository bookRepository;
    private final CategoryRepository categoryRepository;
    private final BookMapper bookMapper;
    private final GeminiService geminiService;
    private final QdrantService qdrantService;

    // Tìm kiếm sách theo từ khóa (tên sách, tác giả, hoặc thể loại)
    @Override
    public PageResponse<BookSummaryResponse> searchBooks(BookSearchRequest request) {
        Pageable pageable = PageRequest.of(
                request.getPage() != null ? request.getPage() : 0,
                request.getSize() != null ? request.getSize() : 10);

        // TRƯỜNG HỢP 1: KHÔNG NHẬP KEYWORD → LẤY ALL
        if (!StringUtils.hasText(request.getKeyword())) {
            Page<Book> bookPage = bookRepository.findAll(pageable);
            Page<BookSummaryResponse> responsePage = bookPage.map(bookMapper::toBookSummaryResponse);
            return bookMapper.toPageResponse(responsePage);
        }
        // TRƯỜNG HỢP 2: CÓ KEYWORD → DÙNG AI SEARCH
        String keyword = request.getKeyword().trim();
        log.info("AI Searching with keyword: {}", keyword);

        // Gemini → Vector
        double[] queryVector = geminiService.embed(keyword);

        // Qdrant → Search vector → Lấy danh sách BookID
        List<String> bookIds = qdrantService.searchBookIds(queryVector, 50);

        // Nếu AI không trả ra kết quả
        if (bookIds.isEmpty()) {
            log.warn("AI search empty → fallback to database search");
            Page<Book> bookPage = bookRepository.searchBooks(keyword, pageable);
            Page<BookSummaryResponse> responsePage = bookPage.map(bookMapper::toBookSummaryResponse);
            return bookMapper.toPageResponse(responsePage);
        }

        // Lấy danh sách Book từ database theo bookIds
        List<UUID> uuidList = bookIds.stream()
                .map(UUID::fromString)
                .collect(Collectors.toList());

        List<Book> dbBooks = bookRepository.findAllById(uuidList);

        Map<UUID, Book> bookMap = dbBooks.stream()
                .collect(Collectors.toMap(Book::getId, b -> b));

        List<Book> books = uuidList.stream()
                .map(bookMap::get)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        // Manual paging vì Qdrant không hỗ trợ Pageable
        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), books.size());
        List<Book> pagedBooks = books.subList(start, end);

        Page<Book> bookPage = new PageImpl<>(pagedBooks, pageable, books.size());

        Page<BookSummaryResponse> responsePage = bookPage.map(bookMapper::toBookSummaryResponse);

        return bookMapper.toPageResponse(responsePage);
    }

    // Lọc sách theo các tiêu chí: giá, đánh giá trung bình, ngày phát hành và từ
    // khóa
    @Override
    public PageResponse<BookSummaryResponse> findByFilters(BookFilterRequest request) {
        Pageable pageable = PageRequest.of(request.getPage(), request.getSize());

        Page<BookWithRating> resultPage = bookRepository.findByFiltersWithRating(
                request.getKeyword(),
                request.getMinPrice(),
                request.getMaxPrice(),
                request.getMinRating(),
                request.getPublishedAfter(),
                pageable);

        Page<BookSummaryResponse> responsePage = resultPage.map(result -> {
            BookSummaryResponse response = bookMapper.toBookSummaryResponse(result.getBook());
            response.setAverageRating(result.getAverageRating());
            response.setReviewCount(result.getReviewCount().intValue());
            return response;
        });

        return bookMapper.toPageResponse(responsePage);
    }

    // Lấy danh sách sách được sắp xếp theo loại sắp xếp được chỉ định
    @Override
    public PageResponse<BookSummaryResponse> getSortedBooks(BookSortRequest request) {
        Pageable pageable = PageRequest.of(request.getPage(), request.getSize());

        Page<Book> bookPage = switch (request.getSortType()) {
            case "price_asc" -> bookRepository.findAllByOrderByPriceAsc(pageable);
            case "price_desc" -> bookRepository.findAllByOrderByPriceDesc(pageable);
            case "title_asc" -> bookRepository.findAllByOrderByTitleAsc(pageable);
            case "title_desc" -> bookRepository.findAllByOrderByTitleDesc(pageable);
            case "date_asc" -> bookRepository.findAllByOrderByPublishDateAsc(pageable);
            case "date_desc" -> bookRepository.findAllByOrderByPublishDateDesc(pageable);
            case "rating_asc" -> bookRepository.findAllOrderByAverageRatingAsc(pageable);
            case "rating_desc" -> bookRepository.findAllOrderByAverageRatingDesc(pageable);
            default -> bookRepository.findAllByOrderByPublishDateDesc(pageable);
        };

        Page<BookSummaryResponse> responsePage = bookPage.map(bookMapper::toBookSummaryResponse);
        return bookMapper.toPageResponse(responsePage);
    }

    // Lấy tất cả sách với phân trang đơn giản
    @Override
    public PageResponse<BookSummaryResponse> getAllBooks(Integer page, Integer pageSize) {
        Pageable pageable = PageRequest.of(
                page != null ? page : 0,
                pageSize != null ? pageSize : 10);

        Page<BookWithRating> resultPage = bookRepository.findAllBooksWithRating(pageable);

        Page<BookSummaryResponse> responsePage = resultPage.map(result -> {
            BookSummaryResponse response = bookMapper.toBookSummaryResponse(result.getBook());
            response.setAverageRating(result.getAverageRating());
            response.setReviewCount(result.getReviewCount().intValue());
            return response;
        });

        return bookMapper.toPageResponse(responsePage);
    }

    // Lấy thông tin chi tiết của một cuốn sách dựa trên ID
    @Override
    public BookResponse getBookById(String id) {
        Book book = bookRepository.findById(UUID.fromString(id))
                .orElseThrow(() -> new RuntimeException("Book not found"));
        return bookMapper.toBookResponse(book);
    }

    // Lấy danh sách sách bán chạy nhất
    @Override
    @org.springframework.cache.annotation.Cacheable(value = "best_selling_books", key = "#limit")
    public List<BookSummaryResponse> getBestSellingBooks(Integer limit) {
        Pageable pageable = PageRequest.of(0, limit != null ? limit : 10);
        List<Book> books = bookRepository.findBestSellingBooks(pageable);
        return books.stream()
                .map(bookMapper::toBookSummaryResponse)
                .collect(Collectors.toList());
    }

    @Override
    public PageResponse<BookSummaryResponse> getAllBooksOption(BookRequest bookRequest) {
        // Chuyển đổi mảng String categoryIds thành List<UUID>
        List<UUID> categoryIds = Collections.emptyList();
        if (bookRequest.getDanhMuc() != null && bookRequest.getDanhMuc().length > 0) {
            categoryIds = Arrays.stream(bookRequest.getDanhMuc())
                    .map(UUID::fromString)
                    .collect(Collectors.toList());
        }

        // Xác định Sort dựa trên option
        String option = bookRequest.getOption() != null ? bookRequest.getOption() : "phobien";
        Sort sort;

        // Lưu ý: averageRating và reviewCount là aggregate function nên không sort được trong query
        // Phải sort sau khi query xong
        boolean needPostSort = false;
        Sort.Direction postSortDirection = Sort.Direction.DESC;

        switch (option) {
            case "moinhat" -> sort = Sort.by(Sort.Direction.DESC, "b.createdAt");
            case "thapdencao" -> sort = Sort.by(Sort.Direction.ASC, "b.discountPrice");
            case "caodenthap" -> sort = Sort.by(Sort.Direction.DESC, "b.discountPrice");
            case "danhgiacao", "phobien" -> {
                sort = Sort.unsorted(); // Không sort trong query
                needPostSort = true;
                postSortDirection = option.equals("danhgiacao") ? Sort.Direction.DESC : Sort.Direction.DESC;
            }
            default -> sort = Sort.unsorted();
        }

        Pageable pageable = PageRequest.of(
                bookRequest.getPage(),
                bookRequest.getSize(),
                sort);

        Page<BookWithRating> resultPage = bookRepository.findByFiltersAndSort(
                bookRequest.getMinPrice(),
                bookRequest.getMaxPrice(),
                bookRequest.getMinRating(),
                categoryIds.isEmpty() ? null : categoryIds,
                pageable);

        // Chuyển đổi sang BookSummaryResponse
        List<BookSummaryResponse> responseList = resultPage.getContent().stream()
                .map(result -> {
                    BookSummaryResponse response = bookMapper.toBookSummaryResponse(result.getBook());
                    response.setAverageRating(result.getAverageRating());
                    response.setReviewCount(result.getReviewCount().intValue());
                    return response;
                })
                .collect(Collectors.toList());

        // Sort lại nếu cần (cho averageRating hoặc reviewCount)
        if (needPostSort) {
            Comparator<BookSummaryResponse> comparator = option.equals("danhgiacao")
                    ? Comparator.comparing(BookSummaryResponse::getAverageRating)
                    : Comparator.comparing(BookSummaryResponse::getReviewCount);

            if (postSortDirection == Sort.Direction.DESC) {
                comparator = comparator.reversed();
            }

            responseList.sort(comparator);
        }

        Page<BookSummaryResponse> responsePage = new PageImpl<>(
                responseList,
                pageable,
                resultPage.getTotalElements()
        );

        return bookMapper.toPageResponse(responsePage);
    }

    // Lấy danh sách sách gợi ý cho bạn
    @Override
    @org.springframework.cache.annotation.Cacheable(value = "suggested_books", key = "#limit")
    public List<BookSummaryResponse> getSuggestedBooks(Integer limit) {
        Pageable pageable = PageRequest.of(0, limit != null ? limit : 10);
        List<Book> books = bookRepository.findRandomBooks(pageable);
        return books.stream()
                .map(bookMapper::toBookSummaryResponse)
                .collect(Collectors.toList());
    }

    // Lấy danh sách sách theo danh mục phổ biến
    @Override
    @org.springframework.cache.annotation.Cacheable(value = "books_by_popular_categories", key = "{#categoryLimit, #bookLimit}")
    public List<CategoryBooksResponse> getBooksByPopularCategories(Integer categoryLimit, Integer bookLimit) {
        int catLimit = categoryLimit != null ? categoryLimit : 5;
        int bkLimit = bookLimit != null ? bookLimit : 5;

        Pageable categoryPageable = PageRequest.of(0, catLimit);
        List<Category> popularCategories = categoryRepository.findPopularCategories(categoryPageable);

        return popularCategories.stream().map(category -> {
            Pageable bookPageable = PageRequest.of(0, bkLimit);
            Page<Book> booksPage = bookRepository.findByCategoryId(category.getId(), bookPageable);

            List<BookSummaryResponse> bookResponses = booksPage.getContent().stream()
                    .map(bookMapper::toBookSummaryResponse)
                    .collect(Collectors.toList());

            CategoryResponse categoryResponse = CategoryResponse.builder()
                    .id(category.getId())
                    .name(category.getName())
                    .description(category.getDescription())
                    .build();

            if (category.getParentCategory() != null) {
                categoryResponse.setParentCategoryId(category.getParentCategory().getId());
                categoryResponse.setParentCategoryName(category.getParentCategory().getName());
            }

            return new CategoryBooksResponse(categoryResponse, bookResponses);
        }).collect(Collectors.toList());
    }

    @Override
    public PageResponse<BookSummaryResponse> getBooksByCategory(String categoryId, Integer page, Integer pageSize) {
        log.info("Getting books by category: {}", categoryId);

        // Set default values
        int pageNumber = (page != null && page >= 0) ? page : 0;
        int size = (pageSize != null && pageSize > 0) ? pageSize : 10;

        Pageable pageable = PageRequest.of(pageNumber, size);
        UUID categoryUUID = UUID.fromString(categoryId);

        Page<Book> booksPage = bookRepository.findByCategoryId(categoryUUID, pageable);

        List<BookSummaryResponse> bookSummaries = booksPage.getContent().stream()
                .map(bookMapper::toBookSummaryResponse)
                .collect(Collectors.toList());

        return PageResponse.<BookSummaryResponse>builder()
                .content(bookSummaries)
                .currentPage(booksPage.getNumber())
                .totalPages(booksPage.getTotalPages())
                .totalElements(booksPage.getTotalElements())
                .build();
    }
}
