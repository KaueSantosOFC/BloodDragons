package com.blooddragons.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Capítulo arquivado de uma campanha.
 * Quando o GM inicia um "Novo Capítulo", os slides atuais são movidos para o histórico.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Chapter {
    private String id;
    private int number;
    private String title;

    @Builder.Default
    private LocalDateTime archivedAt = LocalDateTime.now();

    @Builder.Default
    private List<StorySlide> slides = new ArrayList<>();
}
