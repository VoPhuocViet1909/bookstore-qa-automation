package com.notfound.bookstore.model.converter;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

import java.util.ArrayList;
import java.util.List;

/**
 * Converter để chuyển đổi giữa List<String> và JSON string trong database
 * Sử dụng cho trường tags trong News entity
 */
@Converter
public class StringListConverter implements AttributeConverter<List<String>, String> {
    
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    /**
     * Chuyển List<String> thành JSON string khi lưu vào database
     * @param attribute List<String> cần convert
     * @return JSON string: ["tag1", "tag2", "tag3"]
     */
    @Override
    public String convertToDatabaseColumn(List<String> attribute) {
        if (attribute == null || attribute.isEmpty()) {
            return "[]";
        }
        try {
            return objectMapper.writeValueAsString(attribute);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error converting list to JSON: " + e.getMessage(), e);
        }
    }
    
    /**
     * Chuyển JSON string thành List<String> khi đọc từ database
     * @param dbData JSON string từ database
     * @return List<String>
     */
    @Override
    public List<String> convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.trim().isEmpty() || dbData.equals("[]")) {
            return new ArrayList<>();
        }
        try {
            return objectMapper.readValue(dbData, new TypeReference<List<String>>() {});
        } catch (JsonProcessingException e) {
            // Nếu parse failed, trả về empty list thay vì throw exception
            return new ArrayList<>();
        }
    }
}
