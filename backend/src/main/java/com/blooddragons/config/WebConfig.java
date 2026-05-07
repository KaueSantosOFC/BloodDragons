package com.blooddragons.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.io.File;

/**
 * Configura serving de uploads como recursos estáticos.
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${blooddragons.uploads-dir:./uploads}")
    private String uploadsDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Serve uploaded files at /api/uploads/
        File dir = new File(uploadsDir);
        String absolutePath = dir.getAbsolutePath();
        if (!absolutePath.endsWith("/")) absolutePath += "/";

        registry.addResourceHandler("/api/uploads/**")
                .addResourceLocations("file:" + absolutePath);
    }
}
