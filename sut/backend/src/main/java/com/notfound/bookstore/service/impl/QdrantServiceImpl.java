package com.notfound.bookstore.service.impl;

import com.notfound.bookstore.model.entity.Author;
import com.notfound.bookstore.model.entity.Book;
import com.notfound.bookstore.service.QdrantService;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class QdrantServiceImpl implements QdrantService {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${qdrant.url}")
    private String qdrantUrl;

    @Value("${qdrant.api.key}")
    private String apiKey;

    @Override
    public void insertBookVector(UUID bookId, double[] vector, Book book) {

        String url = qdrantUrl + "/collections/books/points?wait=true";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("api-key", apiKey);

        Map<String, Object> payload = new HashMap<>();
        payload.put("book_id", bookId.toString());
        payload.put("title", book.getTitle());
        payload.put("authors", book.getAuthors()
                .stream()
                .map(Author::getName)
                .collect(Collectors.toList()));
        payload.put("description", book.getDescription());
        payload.put("isbn", book.getIsbn());
        payload.put("price", book.getPrice());

        List<Double> vectorList = new ArrayList<>();
        for (double v : vector) {
            vectorList.add(v);
        }

        Map<String, Object> namedVector = new HashMap<>();
        namedVector.put("", vectorList);

        Map<String, Object> point = new HashMap<>();
        point.put("id", bookId.toString());
        point.put("vector", namedVector);
        point.put("payload", payload);

        Map<String, Object> body = new HashMap<>();
        body.put("points", List.of(point));

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    url,
                    HttpMethod.PUT,
                    request,
                    String.class
            );

        } catch (Exception e) {
            throw new RuntimeException("Failed to insert vector to Qdrant", e);
        }
    }


    @Override
    public List<String> searchBookIds(double[] queryVector, int limit) {

        String url = qdrantUrl + "/collections/books/points/search";

        Map<String, Object> body = new HashMap<>();
        body.put("vector", queryVector);
        body.put("limit", limit);

        HttpHeaders headers = new HttpHeaders();
        headers.set("api-key", apiKey);
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);

            if (response.getBody() == null || !response.getBody().containsKey("result")) {
                log.warn("Empty search result from Qdrant");
                return List.of();
            }

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> result = (List<Map<String, Object>>) response.getBody().get("result");

            return result.stream()
                    .map(item -> item.get("id").toString())
                    .collect(Collectors.toList());

        } catch (Exception e) {
            log.error("QDRANT SEARCH FAILED: {}", e.getMessage(), e);
            return List.of();
        }
    }
}
