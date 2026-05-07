package com.blooddragons.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Resultado de uma rolagem de ataque detalhada.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttackRollResult {
    private int total;
    private int naturalRoll;
    private String attributeUsed;
    private int modifier;
    private boolean isCritical;
    private boolean isFumble;
}
