package com.blooddragons.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;
import java.io.File;
import java.io.IOException;
import java.util.Map;
import java.util.UUID;

/**
 * Controller REST para upload e acesso a imagens.
 */
@RestController
@RequestMapping("/api")
public class UploadController {

    @Value("${blooddragons.uploads-dir:./uploads}")
    private String uploadsDir;

    @PostConstruct
    public void init() {
        File dir = new File(uploadsDir);
        if (!dir.exists()) dir.mkdirs();
    }

    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> upload(@RequestParam("image") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "No file uploaded"));
        }
        try {
            String originalName = file.getOriginalFilename();
            String ext = originalName != null && originalName.contains(".")
                    ? originalName.substring(originalName.lastIndexOf('.'))
                    : ".png";
            String filename = "image-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 8) + ext;
            File dest = new File(uploadsDir, filename);
            file.transferTo(dest);
            return ResponseEntity.ok(Map.of("url", "/api/uploads/" + filename));
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
}
