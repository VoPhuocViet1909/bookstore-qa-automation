package com.notfound.bookstore.service.impl;

import com.notfound.bookstore.model.dto.response.dashboard.*;
import com.notfound.bookstore.model.entity.Book;
import com.notfound.bookstore.model.entity.Category;
import com.notfound.bookstore.model.entity.Order;
import com.notfound.bookstore.model.enums.OrderStatus;
import com.notfound.bookstore.repository.BookRepository;
import com.notfound.bookstore.repository.CategoryRepository;
import com.notfound.bookstore.repository.OrderRepository;
import com.notfound.bookstore.repository.UserRepository;
import com.notfound.bookstore.service.DashboardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

        private final OrderRepository orderRepository;
        private final BookRepository bookRepository;
        private final UserRepository userRepository;
        private final CategoryRepository categoryRepository;

        @Override
        public DashboardStatsResponse getStats() {
                log.info("Getting dashboard stats");

                // Tính toán thời gian
                LocalDateTime now = LocalDateTime.now();
                LocalDateTime startOfMonth = now.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
                LocalDateTime startOfLastMonth = startOfMonth.minusMonths(1);
                LocalDateTime endOfLastMonth = startOfMonth.minusSeconds(1);

                // Lấy tất cả orders
                List<Order> allOrders = orderRepository.findAll();
                List<Order> thisMonthOrders = allOrders.stream()
                                .filter(o -> o.getOrderDate().isAfter(startOfMonth))
                                .collect(Collectors.toList());
                List<Order> lastMonthOrders = allOrders.stream()
                                .filter(o -> o.getOrderDate().isAfter(startOfLastMonth)
                                                && o.getOrderDate().isBefore(endOfLastMonth))
                                .collect(Collectors.toList());

                // Tính doanh thu
                BigDecimal totalRevenue = allOrders.stream()
                                .filter(o -> o.getStatus() == OrderStatus.DELIVERED)
                                .map(o -> BigDecimal.valueOf(o.getTotalAmount()))
                                .reduce(BigDecimal.ZERO, BigDecimal::add);

                BigDecimal thisMonthRevenue = thisMonthOrders.stream()
                                .filter(o -> o.getStatus() == OrderStatus.DELIVERED)
                                .map(o -> BigDecimal.valueOf(o.getTotalAmount()))
                                .reduce(BigDecimal.ZERO, BigDecimal::add);

                BigDecimal lastMonthRevenue = lastMonthOrders.stream()
                                .filter(o -> o.getStatus() == OrderStatus.DELIVERED)
                                .map(o -> BigDecimal.valueOf(o.getTotalAmount()))
                                .reduce(BigDecimal.ZERO, BigDecimal::add);

                // Tính % tăng trưởng doanh thu
                Double revenueGrowth = 0.0;
                if (lastMonthRevenue.compareTo(BigDecimal.ZERO) > 0) {
                        revenueGrowth = thisMonthRevenue.subtract(lastMonthRevenue)
                                        .divide(lastMonthRevenue, 4, RoundingMode.HALF_UP)
                                        .multiply(BigDecimal.valueOf(100))
                                        .doubleValue();
                }

                // Tính số đơn hàng
                long totalOrders = allOrders.size();
                long thisMonthOrderCount = thisMonthOrders.size();
                long lastMonthOrderCount = lastMonthOrders.size();

                // Tính % tăng trưởng đơn hàng
                Double ordersGrowth = 0.0;
                if (lastMonthOrderCount > 0) {
                        ordersGrowth = ((double) (thisMonthOrderCount - lastMonthOrderCount) / lastMonthOrderCount)
                                        * 100;
                }

                // Tính số sách trong kho
                List<Book> allBooks = bookRepository.findAll();
                long totalBooksInStock = allBooks.stream()
                                .mapToLong(b -> b.getStockQuantity() != null ? b.getStockQuantity() : 0)
                                .sum();

                // Đếm sách sắp hết hàng (< 10 cuốn)
                long lowStockCount = allBooks.stream()
                                .filter(b -> b.getStockQuantity() != null && b.getStockQuantity() < 10)
                                .count();

                // Đếm khách hàng
                long activeCustomers = userRepository.count();

                // Đếm khách hàng mới tháng này
                long newCustomers = userRepository.findAll().stream()
                                .filter(u -> u.getCreatedAt() != null && u.getCreatedAt().isAfter(startOfMonth))
                                .count();

                return DashboardStatsResponse.builder()
                                .totalRevenue(totalRevenue)
                                .revenueGrowth(revenueGrowth)
                                .totalOrders(totalOrders)
                                .ordersGrowth(ordersGrowth)
                                .totalBooksInStock(totalBooksInStock)
                                .lowStockCount(lowStockCount)
                                .activeCustomers(activeCustomers)
                                .newCustomers(newCustomers)
                                .build();
        }

        @Override
        public SalesTrendResponse getSalesTrend(Integer months) {
                log.info("Getting sales trend for {} months", months);

                int monthsToShow = (months != null && months > 0) ? months : 6;
                List<SalesTrendResponse.MonthlyData> monthlyDataList = new ArrayList<>();

                LocalDateTime now = LocalDateTime.now();

                for (int i = monthsToShow - 1; i >= 0; i--) {
                        YearMonth yearMonth = YearMonth.from(now.minusMonths(i));
                        LocalDateTime startOfMonth = yearMonth.atDay(1).atStartOfDay();
                        LocalDateTime endOfMonth = yearMonth.atEndOfMonth().atTime(23, 59, 59);

                        // Lấy orders trong tháng
                        List<Order> monthOrders = orderRepository.findAll().stream()
                                        .filter(o -> o.getOrderDate().isAfter(startOfMonth)
                                                        && o.getOrderDate().isBefore(endOfMonth))
                                        .collect(Collectors.toList());

                        // Tính doanh thu
                        BigDecimal sales = monthOrders.stream()
                                        .filter(o -> o.getStatus() == OrderStatus.DELIVERED)
                                        .map(o -> BigDecimal.valueOf(o.getTotalAmount()))
                                        .reduce(BigDecimal.ZERO, BigDecimal::add);

                        // Đếm số đơn hàng
                        long orders = monthOrders.size();

                        // Đếm số khách hàng unique
                        long customers = monthOrders.stream()
                                        .map(o -> o.getCustomer().getId())
                                        .distinct()
                                        .count();

                        String monthStr = yearMonth.format(DateTimeFormatter.ofPattern("yyyy-MM"));
                        String monthName = "Tháng " + yearMonth.getMonthValue();

                        monthlyDataList.add(SalesTrendResponse.MonthlyData.builder()
                                        .month(monthStr)
                                        .monthName(monthName)
                                        .sales(sales)
                                        .orders(orders)
                                        .customers(customers)
                                        .build());
                }

                return SalesTrendResponse.builder()
                                .data(monthlyDataList)
                                .build();
        }

        @Override
        public TopCategoriesResponse getTopCategories() {
                log.info("Getting top categories");

                List<Category> allCategories = categoryRepository.findAll();
                Map<UUID, BigDecimal> categorySalesMap = new HashMap<>();

                // Tính doanh thu cho mỗi category
                for (Category category : allCategories) {
                        BigDecimal totalSales = BigDecimal.ZERO;

                        if (category.getBooks() != null) {
                                for (Book book : category.getBooks()) {
                                        if (book.getOrderItems() != null) {
                                                BigDecimal bookSales = book.getOrderItems().stream()
                                                                .filter(oi -> oi.getOrder()
                                                                                .getStatus() == OrderStatus.DELIVERED)
                                                                .map(oi -> BigDecimal.valueOf(
                                                                                oi.getUnitPrice() * oi.getQuantity()))
                                                                .reduce(BigDecimal.ZERO, BigDecimal::add);
                                                totalSales = totalSales.add(bookSales);
                                        }
                                }
                        }

                        if (totalSales.compareTo(BigDecimal.ZERO) > 0) {
                                categorySalesMap.put(category.getId(), totalSales);
                        }
                }

                // Tính tổng doanh thu
                BigDecimal grandTotal = categorySalesMap.values().stream()
                                .reduce(BigDecimal.ZERO, BigDecimal::add);

                // Tạo danh sách top categories
                List<TopCategoriesResponse.CategorySales> categorySalesList = categorySalesMap.entrySet().stream()
                                .sorted(Map.Entry.<UUID, BigDecimal>comparingByValue().reversed())
                                .limit(5)
                                .map(entry -> {
                                        Category category = allCategories.stream()
                                                        .filter(c -> c.getId().equals(entry.getKey()))
                                                        .findFirst()
                                                        .orElse(null);

                                        Double percentage = 0.0;
                                        if (grandTotal.compareTo(BigDecimal.ZERO) > 0) {
                                                percentage = entry.getValue()
                                                                .divide(grandTotal, 4, RoundingMode.HALF_UP)
                                                                .multiply(BigDecimal.valueOf(100))
                                                                .doubleValue();
                                        }

                                        return TopCategoriesResponse.CategorySales.builder()
                                                        .categoryId(entry.getKey())
                                                        .categoryName(category != null ? category.getName() : "Unknown")
                                                        .percentage(percentage)
                                                        .totalSales(entry.getValue())
                                                        .build();
                                })
                                .collect(Collectors.toList());

                return TopCategoriesResponse.builder()
                                .categories(categorySalesList)
                                .build();
        }

        @Override
        public PerformanceMetricsResponse getPerformanceMetrics() {
                log.info("Getting performance metrics");

                // Tính conversion rate (giả sử từ số lượng users và orders)
                long totalUsers = userRepository.count();
                long totalOrders = orderRepository.count();

                Double conversionRate = 0.0;
                if (totalUsers > 0) {
                        conversionRate = ((double) totalOrders / totalUsers) * 100;
                        if (conversionRate > 100)
                                conversionRate = 100.0; // Cap at 100%
                }

                // Tính satisfaction rate (từ reviews)
                List<Book> allBooks = bookRepository.findAll();
                long totalReviews = allBooks.stream()
                                .filter(b -> b.getReviews() != null)
                                .mapToLong(b -> b.getReviews().size())
                                .sum();

                long positiveReviews = allBooks.stream()
                                .filter(b -> b.getReviews() != null)
                                .flatMap(b -> b.getReviews().stream())
                                .filter(r -> r.getRating() != null && r.getRating() >= 4)
                                .count();

                Double satisfactionRate = 0.0;
                if (totalReviews > 0) {
                        satisfactionRate = ((double) positiveReviews / totalReviews) * 100;
                }

                return PerformanceMetricsResponse.builder()
                                .conversionRate(PerformanceMetricsResponse.MetricData.builder()
                                                .current(conversionRate)
                                                .target(4.5)
                                                .build())
                                .satisfactionRate(PerformanceMetricsResponse.MetricData.builder()
                                                .current(satisfactionRate)
                                                .target(90.0)
                                                .build())
                                .build();
        }

        @Override
        public TopSellingBooksResponse getTopSellingBooks(Integer limit) {
                log.info("Getting top {} selling books", limit);

                int booksLimit = (limit != null && limit > 0) ? limit : 5;
                Pageable pageable = PageRequest.of(0, booksLimit);

                List<Book> topBooks = bookRepository.findBestSellingBooks(pageable);

                List<TopSellingBooksResponse.BookSalesData> bookDataList = topBooks.stream()
                                .map(book -> {
                                        // Tính số lượng đã bán
                                        long soldQuantity = book.getOrderItems() != null ? book.getOrderItems().stream()
                                                        .filter(oi -> oi.getOrder()
                                                                        .getStatus() == OrderStatus.DELIVERED)
                                                        .mapToLong(oi -> oi.getQuantity())
                                                        .sum() : 0;

                                        // Lấy tên tác giả
                                        List<String> authorNames = book.getAuthors() != null
                                                        ? book.getAuthors().stream()
                                                                        .map(a -> a.getName())
                                                                        .collect(Collectors.toList())
                                                        : new ArrayList<>();

                                        // Lấy tên danh mục
                                        List<String> categoryNames = book.getCategories() != null
                                                        ? book.getCategories().stream()
                                                                        .map(c -> c.getName())
                                                                        .collect(Collectors.toList())
                                                        : new ArrayList<>();

                                        // Tính rating trung bình
                                        Double averageRating = 0.0;
                                        int reviewCount = 0;
                                        if (book.getReviews() != null && !book.getReviews().isEmpty()) {
                                                reviewCount = book.getReviews().size();
                                                averageRating = book.getReviews().stream()
                                                                .filter(r -> r.getRating() != null)
                                                                .mapToDouble(r -> r.getRating())
                                                                .average()
                                                                .orElse(0.0);
                                        }

                                        return TopSellingBooksResponse.BookSalesData.builder()
                                                        .id(book.getId())
                                                        .title(book.getTitle())
                                                        .authorNames(authorNames)
                                                        .categoryNames(categoryNames)
                                                        .price(book.getPrice())
                                                        .discountPrice(book.getDiscountPrice())
                                                        .averageRating(averageRating)
                                                        .reviewCount(reviewCount)
                                                        .soldQuantity(soldQuantity)
                                                        .build();
                                })
                                .collect(Collectors.toList());

                return TopSellingBooksResponse.builder()
                                .books(bookDataList)
                                .build();
        }

        @Override
        public RecentOrdersResponse getRecentOrders(Integer limit) {
                log.info("Getting {} recent orders", limit);

                int ordersLimit = (limit != null && limit > 0) ? limit : 4;
                Pageable pageable = PageRequest.of(0, ordersLimit, Sort.by(Sort.Direction.DESC, "orderDate"));

                List<Order> recentOrders = orderRepository.findAll(pageable).getContent();

                List<RecentOrdersResponse.OrderSummary> orderSummaries = recentOrders.stream()
                                .map(order -> RecentOrdersResponse.OrderSummary.builder()
                                                .id(order.getOrderID())
                                                .orderCode("ORD-" + order.getOrderID().toString().substring(0, 8)
                                                                .toUpperCase())
                                                .customerName(order.getCustomer() != null
                                                                ? order.getCustomer().getFullName()
                                                                : "Unknown")
                                                .total(BigDecimal.valueOf(order.getTotalAmount()))
                                                .orderDate(order.getOrderDate())
                                                .status(order.getStatus().name())
                                                .build())
                                .collect(Collectors.toList());

                return RecentOrdersResponse.builder()
                                .orders(orderSummaries)
                                .build();
        }
}
