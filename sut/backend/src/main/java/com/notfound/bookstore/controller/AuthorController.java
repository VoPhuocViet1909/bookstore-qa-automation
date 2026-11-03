package com.notfound.bookstore.controller;

import com.notfound.bookstore.model.dto.request.authorrequest.*;
import com.notfound.bookstore.model.dto.response.ApiResponse;
import com.notfound.bookstore.model.dto.response.authorresponse.AuthorResponse;
import com.notfound.bookstore.model.dto.response.authorresponse.AuthorSummaryResponse;
import com.notfound.bookstore.model.dto.response.bookresponse.PageResponse;
import com.notfound.bookstore.service.AuthorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * @Dự án: DHKTPM18B_NotFound_WebSiteBanSach
 * @Class: AuthorController
 * @Tạo vào ngày: 11/13/2025
 * @Tác giả: Nguyen Huu Sang
 */

@RestController
@RequestMapping("/api/authors")
@RequiredArgsConstructor
public class AuthorController {

    private final AuthorService authorService;

    @GetMapping
    public ApiResponse<PageResponse<AuthorSummaryResponse>> getAllAuthors(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String sortByName,
            @RequestParam(required = false) String sortByBirthYear) {
        AuthorFilterRequest request = new AuthorFilterRequest();
        request.setPage(page);
        request.setSize(size);
        request.setSortByName(sortByName);
        request.setSortByBirthYear(sortByBirthYear);
        return ApiResponse.<PageResponse<AuthorSummaryResponse>>builder()
                .code(1000)
                .message("Lấy danh sách tác giả thành công")
                .result(authorService.filterAuthors(request))
                .build();
    }

    @GetMapping("/search")
    public ApiResponse<PageResponse<AuthorSummaryResponse>> searchByName(
            @Valid @ModelAttribute AuthorSearchRequest request) {
        return ApiResponse.<PageResponse<AuthorSummaryResponse>>builder()
                .code(1000)
                .message("Tìm kiếm tác giả thành công")
                .result(authorService.searchByName(request))
                .build();
    }

    @GetMapping("/filter")
    public ApiResponse<PageResponse<AuthorSummaryResponse>> filterAuthors(
            @Valid @ModelAttribute AuthorFilterRequest request) {
        return ApiResponse.<PageResponse<AuthorSummaryResponse>>builder()
                .code(1000)
                .message("Lọc tác giả thành công")
                .result(authorService.filterAuthors(request))
                .build();
    }

    @GetMapping("/{id}")
    public ApiResponse<AuthorResponse> getAuthorById(@PathVariable UUID id) {
        return ApiResponse.<AuthorResponse>builder()
                .code(1000)
                .message("Lấy thông tin tác giả thành công")
                .result(authorService.getAuthorById(id))
                .build();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ApiResponse<AuthorResponse> createAuthor(@Valid @RequestBody AuthorRequest request) {
        return ApiResponse.<AuthorResponse>builder()
                .code(1000)
                .message("Tạo tác giả thành công")
                .result(authorService.createAuthor(request))
                .build();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ApiResponse<AuthorResponse> updateAuthor(
            @PathVariable UUID id,
            @Valid @RequestBody AuthorRequest request) {
        return ApiResponse.<AuthorResponse>builder()
                .code(1000)
                .message("Cập nhật tác giả thành công")
                .result(authorService.updateAuthor(id, request))
                .build();
    }

}