package com.blooddragons.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Habilidade de combate (arma, magia, habilidade de classe, etc.)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Ability {
    private String id;
    private String name;

    /** action | bonus_action | reaction | passive */
    private String type;

    /** Alcance em metros */
    private double range;

    /** cone | line | circle | rectangle | none */
    private String areaShape;

    private Integer angle;      // Para cones
    private Double width;       // Para linhas/retângulos
    private Double length;      // Para linhas/retângulos
    private Double radius;      // Para círculos

    /** Dados de dano, ex: "8d6" */
    private String damage;
    private String damageType;

    /** Dados de cura, ex: "2d4+2" */
    private String healing;

    private String description;

    /** Condição aplicada no acerto */
    private ApplyCondition applyCondition;

    private Integer attackBonus;
    private Integer damageBonus;
    private Boolean isProficient;
    private Boolean isOffHand;

    /** Se presente, força teste de resistência ao invés de rolagem de ataque */
    private String saveAttribute; // str | dex | con | int | wis | cha

    /** weapon | spell | feature | item_effect */
    private String category;

    /** Propriedades da arma: finesse, ranged, heavy, etc. */
    private List<String> properties;

    private Integer spellLevel;
    private Integer uses;
    private Integer maxUses;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ApplyCondition {
        private String conditionId;
        private Integer duration;
    }
}
