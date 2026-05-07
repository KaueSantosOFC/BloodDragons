package com.blooddragons.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Condição que pode ser aplicada a um token (ex: Cego, Envenenado, Atordoado)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TokenCondition {
    private String id;
    private String name;
    private String icon;
    private String color;
    private Integer damagePerTurn;
}
