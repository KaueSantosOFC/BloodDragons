package com.blooddragons.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Ficha de personagem simplificada (usada no Token).
 * Baseada na interface CharacterSheet do frontend (models/token.ts).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CharacterSheet {
    private String className;  // "class" é reservado em Java
    private int level;
    private String background;
    private String playerName;
    private String race;
    private String alignment;
    private int xp;
    private int hitDie;

    // Atributos base
    private int str;
    private int dex;
    private int con;
    private int intAttr;  // "int" é reservado em Java
    private int wis;
    private int cha;

    // Combate
    private int ac;
    private int initiative;
    private int speed;

    private int proficiencyBonus;
    private int passivePerception;

    private int hp;
    private int maxHp;
    private Integer spellUses;
    private Integer maxSpellUses;

    /** int | wis | cha */
    private String spellcastingAbility;

    // Moedas
    private Integer cp;
    private Integer sp;
    private Integer ep;
    private Integer gp;
    private Integer pp;
    private String backpack;

    // Inventário
    private List<InventoryItem> inventory;

    // Proficiências
    private Proficiencies proficiencies;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class InventoryItem {
        private String name;
        private int quantity;
        private double weight;
        private boolean isEquipped;
        private String type;       // weapon | armor | shield | gear | tool
        private String armorType;  // light | medium | heavy | shield | none
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Proficiencies {
        private List<String> armor;
        private List<String> weapons;
        private List<String> tools;
        private List<String> languages;
    }
}
