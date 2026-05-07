package com.blooddragons.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

/**
 * Cena no mapa (snapshot com tokens, fog, mapa de fundo).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Scene {
    private String id;
    private String name;
    private String mapBackgroundImage;

    @Builder.Default
    private List<Token> tokens = new ArrayList<>();

    @Builder.Default
    private List<String> fogOfWar = new ArrayList<>();

    private boolean isFogEnabled;
}
