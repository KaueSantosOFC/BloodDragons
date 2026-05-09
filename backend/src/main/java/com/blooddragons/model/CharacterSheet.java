package com.blooddragons.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Ficha de personagem completa D&D 5e.
 * Expandida com sub-raça, saving throws, perícias, spell slots e traços raciais.
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
    private String subRace;
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
    private int speed; // em metros (x10 para evitar decimais, ex: 90 = 9.0m)

    private int proficiencyBonus;
    private int passivePerception;

    private int hp;
    private int maxHp;
    private Integer tempHp;

    // Magia
    private Integer spellUses;
    private Integer maxSpellUses;
    /** int | wis | cha */
    private String spellcastingAbility;
    private Integer spellSaveDC;
    private Integer spellAttackBonus;
    /** Spell slots atuais [nível 1-9] */
    private int[] currentSpellSlots;
    /** Spell slots máximos [nível 1-9] */
    private int[] maxSpellSlots;
    private List<String> cantripsKnown;
    private List<String> preparedSpells;

    // Moedas
    private Integer cp;
    private Integer sp;
    private Integer ep;
    private Integer gp;
    private Integer pp;
    private String backpack;

    // Raça
    private int darkvision; // metros
    private String size; // "medium" | "small"
    private List<String> racialTraits;
    private List<String> languages;

    // Saving Throws proficientes
    private List<String> savingThrowProficiencies;
    // Perícias proficientes
    private List<String> skillProficiencies;
    // Perícias com Especialização (dobro de proficiência)
    private List<String> expertiseSkills;

    // Habilidades de classe ativas
    private List<String> classFeatures;

    // Inventário
    private List<InventoryItem> inventory;

    // Proficiências
    private Proficiencies proficiencies;

    // Exaustão (0-6)
    private int exhaustionLevel;

    // Death saves
    private int deathSaveSuccesses;
    private int deathSaveFailures;

    // Hit Dice restantes
    private int hitDiceRemaining;

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
        private String armorId;    // ID da armadura no Dnd5eEquipmentData
        private Integer baseAC;    // CA base da armadura
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
