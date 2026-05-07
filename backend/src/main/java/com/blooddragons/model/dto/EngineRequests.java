package com.blooddragons.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Requests genéricos para operações da engine D&D.
 */
public class EngineRequests {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DiceRollRequest {
        private String diceString; // ex: "2d8+4"
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ModifierRequest {
        private int score;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AcRequest {
        /** heavy | medium | light | none */
        private String armorType;
        private int baseAC;
        private int dexModifier;
        private int shieldBonus;
        private int conModifier;
        private int wisModifier;
        /** barbarian | monk | none */
        private String unarmoredDefenseClass;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SpellSaveDcRequest {
        private int modifier;
        private int proficiency;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MaxHpRequest {
        private int hitDice;
        private int level;
        private int conModifier;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AttackRollRequest {
        private int modifier;
        private int proficiency;
        private int magicBonus;
        /** normal | advantage | disadvantage */
        private String mode;
        private String extraDice;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DamageRollRequest {
        private String diceString;
        private int modifier;
        private int itemBonus;
        private double resistanceMultiplier;
        private boolean isOffhand;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class HealingRollRequest {
        private String diceString;
        private int modifier;
        private int bonus;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SavingThrowRequest {
        private int modifier;
        private int proficiency;
        private boolean isProficient;
        private boolean hasAdvantage;
        private boolean hasDisadvantage;
        private int magicBonus;
    }
}
