package com.notfound.bookstore.repository;

import com.notfound.bookstore.model.entity.Author;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface AuthorRepository extends JpaRepository<Author, UUID> {

    @Query("SELECT a FROM Author a WHERE LOWER(a.name) LIKE LOWER(CONCAT('%', :name, '%'))")
    Page<Author> searchByName(@Param("name") String name, Pageable pageable);

    @Query("SELECT a FROM Author a WHERE " +
           "(:nationality IS NULL OR a.nationality = :nationality) AND " +
           "(:birthYear IS NULL OR YEAR(a.dateOfBirth) = :birthYear)")
    Page<Author> filterAuthors(
            @Param("nationality") String nationality,
            @Param("birthYear") Integer birthYear,
            Pageable pageable);
}