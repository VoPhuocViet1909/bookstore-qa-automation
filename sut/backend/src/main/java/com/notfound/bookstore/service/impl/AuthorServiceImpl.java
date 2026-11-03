package com.notfound.bookstore.service.impl;

import com.notfound.bookstore.service.AuthorService;

import com.notfound.bookstore.model.dto.request.authorrequest.AuthorRequest;
import com.notfound.bookstore.model.dto.request.authorrequest.AuthorSearchRequest;
import com.notfound.bookstore.model.dto.request.authorrequest.AuthorFilterRequest;
import com.notfound.bookstore.model.dto.response.authorresponse.AuthorResponse;
import com.notfound.bookstore.model.dto.response.authorresponse.AuthorSummaryResponse;
import com.notfound.bookstore.model.dto.response.bookresponse.PageResponse;
import com.notfound.bookstore.model.entity.Author;
import com.notfound.bookstore.repository.AuthorRepository;
import com.notfound.bookstore.service.AuthorService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * @Dự án: DHKTPM18B_NotFound_WebSiteBanSach
 * @Class: AuthorServiceImpl
 * @Tạo vào ngày: 11/13/2025
 * @Tác giả: Nguyen Huu Sang
 */


@Service
@RequiredArgsConstructor
public class AuthorServiceImpl implements AuthorService {

    private final AuthorRepository authorRepository;

    @Override
    public PageResponse<AuthorSummaryResponse> searchByName(AuthorSearchRequest request) {
        Pageable pageable = PageRequest.of(request.getPage(), request.getSize());
        Page<Author> authorPage = authorRepository.searchByName(
                request.getName() != null ? request.getName() : "",
                pageable
        );
        return buildPageResponse(authorPage);
    }

    @Override
    public PageResponse<AuthorSummaryResponse> filterAuthors(AuthorFilterRequest request) {
        Sort sort = Sort.unsorted();

        // Sắp xếp theo tên
        if (request.getSortByName() != null) {
            sort = request.getSortByName().equalsIgnoreCase("asc")
                    ? Sort.by("name").ascending()
                    : Sort.by("name").descending();
        }

        // Sắp xếp theo năm sinh
        if (request.getSortByBirthYear() != null) {
            Sort birthYearSort = request.getSortByBirthYear().equalsIgnoreCase("asc")
                    ? Sort.by("dateOfBirth").ascending()
                    : Sort.by("dateOfBirth").descending();

            sort = sort.isSorted() ? sort.and(birthYearSort) : birthYearSort;
        }

        Pageable pageable = PageRequest.of(request.getPage(), request.getSize(), sort);
        Page<Author> authorPage = authorRepository.filterAuthors(
                request.getNationality(),
                request.getBirthYear(),
                pageable
        );
        return buildPageResponse(authorPage);
    }

    @Override
    public AuthorResponse getAuthorById(UUID id) {
        Author author = authorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tác giả với ID: " + id));
        return mapToDetailResponse(author);
    }

    @Override
    @Transactional
    public AuthorResponse createAuthor(AuthorRequest request) {
        Author author = new Author();
        mapToEntity(request, author);
        Author savedAuthor = authorRepository.save(author);
        return mapToDetailResponse(savedAuthor);
    }

    @Override
    @Transactional
    public AuthorResponse updateAuthor(UUID id, AuthorRequest request) {
        Author author = authorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tác giả với ID: " + id));
        mapToEntity(request, author);
        Author updatedAuthor = authorRepository.save(author);
        return mapToDetailResponse(updatedAuthor);
    }


   private PageResponse<AuthorSummaryResponse> buildPageResponse(Page<Author> authorPage) {
       List<AuthorSummaryResponse> content = authorPage.getContent().stream()
               .map(this::mapToSummaryResponse)
               .collect(Collectors.toList());

       return PageResponse.<AuthorSummaryResponse>builder()
               .content(content)
               .currentPage(authorPage.getNumber())
               .totalPages(authorPage.getTotalPages())
               .totalElements(authorPage.getTotalElements())
               .build();
   }

    private void mapToEntity(AuthorRequest request, Author author) {
        author.setName(request.getName());
        author.setBiography(request.getBiography());
        author.setDateOfBirth(request.getDateOfBirth());
        author.setNationality(request.getNationality());
    }

    private AuthorSummaryResponse mapToSummaryResponse(Author author) {
        return AuthorSummaryResponse.builder()
                .id(author.getId())
                .name(author.getName())
                .biography(author.getBiography())
                .dateOfBirth(author.getDateOfBirth())
                .nationality(author.getNationality())
                .bookCount(author.getBooks() != null ? author.getBooks().size() : 0)
                .build();
    }

    private AuthorResponse mapToDetailResponse(Author author) {
        return AuthorResponse.builder()
                .id(author.getId())
                .name(author.getName())
                .biography(author.getBiography())
                .dateOfBirth(author.getDateOfBirth())
                .nationality(author.getNationality())
                .bookCount(author.getBooks() != null ? author.getBooks().size() : 0)
                .build();
    }
}