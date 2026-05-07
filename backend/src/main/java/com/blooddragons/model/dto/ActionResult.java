package com.blooddragons.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Resultado de uma rolagem de ação (ataque, dano, cura, saving throw).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ActionResult {
    private int total;
    private int naturalRoll;
    private int modifiers;
    private boolean isCritical;
    private Boolean isCriticalFail;
    private String log;
}
