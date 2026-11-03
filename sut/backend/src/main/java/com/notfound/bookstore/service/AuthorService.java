package com.notfound.bookstore.service;

import com.notfound.bookstore.model.dto.request.authorrequest.AuthorRequest;
import com.notfound.bookstore.model.dto.request.authorrequest.AuthorSearchRequest;
import com.notfound.bookstore.model.dto.request.authorrequest.AuthorFilterRequest;
import com.notfound.bookstore.model.dto.response.authorresponse.AuthorResponse;
import com.notfound.bookstore.model.dto.response.authorresponse.AuthorSummaryResponse;
import com.notfound.bookstore.model.dto.response.bookresponse.PageResponse;

import java.util.UUID;

/**
 * @Dự án: DHKTPM18B_NotFound_WebSiteBanSach
 * @Interface: AuthorService
 * @Tạo vào ngày: 11/13/2025
 * @Tác giả: Nguyen Huu Sang
 */


public interface AuthorService {

    // Tìm tác giả theo tên
    PageResponse<AuthorSummaryResponse> searchByName(AuthorSearchRequest request);

    // Lọc tác giả theo nationality, birthYear với sắp xếp
    PageResponse<AuthorSummaryResponse> filterAuthors(AuthorFilterRequest request);

    // Lấy chi tiết tác giả
    AuthorResponse getAuthorById(UUID id);

    // Thêm tác giả mới
    AuthorResponse createAuthor(AuthorRequest request);

    // Chỉnh sửa thông tin tác giả
    AuthorResponse updateAuthor(UUID id, AuthorRequest request);


}