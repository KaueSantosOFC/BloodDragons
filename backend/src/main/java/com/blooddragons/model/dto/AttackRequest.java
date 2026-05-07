package com.blooddragons.model.dto;

import com.blooddragons.model.Ability;
import com.blooddragons.model.Token;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * Request para resolução completa de ataque.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttackRequest {
    private Token attacker;
    private Token target;
    private Ability ability;
    /** normal | advantage | disadvantage */
    private String mode;
}
