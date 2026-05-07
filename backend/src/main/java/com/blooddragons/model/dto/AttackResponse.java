package com.blooddragons.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Resultado da resolução completa de ataque.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttackResponse {
    private ActionResult attack;
    private ActionResult damage;
    private boolean hit;
    private String log;
}
