package com.blooddragons.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

/**
 * Token no mapa de combate (personagem, inimigo, NPC, boss ou item).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Token {
    private String id;
    private String name;
    private String characterId;
    private int x;
    private int y;
    private int hp;
    private int maxHp;
    private Integer spellUses;
    private Integer maxSpellUses;

    @Builder.Default
    private List<TokenCondition> conditions = new ArrayList<>();

    private String controlledBy;
    private String color;
    private String imageUrl;
    private Double imageScale;
    private Double imageOffsetX;
    private Double imageOffsetY;

    /** player | enemy | npc | boss | item */
    private String type;

    @Builder.Default
    private List<Ability> abilities = new ArrayList<>();

    private CharacterSheet sheet;
    private Integer initiative;
}
