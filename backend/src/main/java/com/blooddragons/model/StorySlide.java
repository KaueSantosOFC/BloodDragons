package com.blooddragons.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Slide de história — armazena URL (externa ou Base64 DataURL) com título e descrição.
 * Vinculado à campanha para persistência entre sessões.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StorySlide {
    private String url;         // URL externa ou Base64 DataURL (data:image/...)
    private String title;
    private String description;
}
