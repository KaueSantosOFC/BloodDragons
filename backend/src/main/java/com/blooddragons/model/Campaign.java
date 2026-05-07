package com.blooddragons.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Campanha de RPG contendo tokens, cenas e configurações de mapa.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Campaign {
    private String id;
    private String name;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Builder.Default
    private LocalDateTime lastPlayedAt = LocalDateTime.now();

    @Builder.Default
    private List<Token> tokens = new ArrayList<>();

    private String mapBackgroundImage;

    @Builder.Default
    private List<String> fogOfWar = new ArrayList<>();

    private Boolean isFogEnabled;

    @Builder.Default
    private List<Scene> scenes = new ArrayList<>();

    private String activeSceneId;
}
