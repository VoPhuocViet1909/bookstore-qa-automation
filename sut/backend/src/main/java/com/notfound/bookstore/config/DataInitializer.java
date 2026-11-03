package com.notfound.bookstore.config;

import com.notfound.bookstore.model.entity.User;
import com.notfound.bookstore.model.enums.Role;
import com.notfound.bookstore.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.HashSet;
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Configuration
@Slf4j
public class DataInitializer {
    private PasswordEncoder passwordEncoder;

    @Bean
    ApplicationRunner applicationRunner(UserRepository userRepository) {
        return args -> {
            try {
                // Đợi một chút để đảm bảo schema đã được tạo xong
                Thread.sleep(2000);
                
                if (userRepository.findByUsername("admin").isEmpty()) {
                    User user = User.builder()
                            .email("admin@gmail.com")
                            .username("admin")
                            .password(passwordEncoder.encode("admin"))
                            .role(Role.ADMIN)
                            .points(0)
                            .build();
                    userRepository.save(user);
                    log.warn("admin user has been created with default password");
                }
            } catch (Exception e) {
                log.error("Failed to initialize admin user. This might be because tables are not created yet. Error: {}", e.getMessage());
                log.warn("You can manually create admin user after application starts successfully");
            }
        };
    }
}
