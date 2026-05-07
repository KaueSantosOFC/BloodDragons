package com.blooddragons.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

/**
 * Token de item no mapa (loot, baú, poção, etc.)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ItemToken {
    private String id;
    private int x;
    private int y;
    private String name;
    private String imageUrl;

    private Integer level;
    private String damage;
    private String damageType;
    private String healing;
    private Integer movement;
    private String description;
    private Double weight;
    private Integer quantity;

    @Builder.Default
    private List<ItemAction> actions = new ArrayList<>();

    private boolean isPickedUp;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ItemAction {
        private String id;
        private String name;
        private String skill;
        private int dc;
        private String successDescription;
        private String failureDescription;
        private boolean isRevealed;
    }
}
