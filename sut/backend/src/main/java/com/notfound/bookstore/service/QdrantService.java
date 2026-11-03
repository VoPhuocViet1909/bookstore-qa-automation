package com.notfound.bookstore.service;

import com.notfound.bookstore.model.entity.Book;

import java.util.List;
import java.util.UUID;

public interface QdrantService {
    void insertBookVector(UUID bookId, double[] vector, Book book);

    List<String> searchBookIds(double[] queryVector, int limit);
}
