package com.blooddragons.controller;

import com.blooddragons.model.dto.*;
import com.blooddragons.model.dto.EngineRequests.*;
import com.blooddragons.service.CombatService;
import com.blooddragons.service.DndCoreEngineService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller REST para operações de combate D&D 5e.
 */
@RestController
@RequestMapping("/api/combat")
public class CombatController {

    private final CombatService combatService;
    private final DndCoreEngineService engine;

    public CombatController(CombatService combatService, DndCoreEngineService engine) {
        this.combatService = combatService;
        this.engine = engine;
    }

    @PostMapping("/resolve-attack")
    public ResponseEntity<AttackResponse> resolveAttack(@RequestBody AttackRequest req) {
        String mode = req.getMode() != null ? req.getMode() : "normal";
        AttackResponse response = combatService.resolveAttack(
                req.getAttacker(), req.getTarget(), req.getAbility(), mode);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/attack-roll")
    public ResponseEntity<ActionResult> attackRoll(@RequestBody AttackRollRequest req) {
        String mode = req.getMode() != null ? req.getMode() : "normal";
        ActionResult result = engine.executeAttackRoll(
                req.getModifier(), req.getProficiency(), req.getMagicBonus(), mode, req.getExtraDice());
        return ResponseEntity.ok(result);
    }

    @PostMapping("/damage-roll")
    public ResponseEntity<ActionResult> damageRoll(@RequestBody DamageRollRequest req) {
        double resist = req.getResistanceMultiplier() > 0 ? req.getResistanceMultiplier() : 1;
        ActionResult result = engine.calculateDamage(
                req.getDiceString(), req.getModifier(), req.getItemBonus(), resist, req.isOffhand());
        return ResponseEntity.ok(result);
    }

    @PostMapping("/healing-roll")
    public ResponseEntity<ActionResult> healingRoll(@RequestBody HealingRollRequest req) {
        ActionResult result = engine.calculateHealing(req.getDiceString(), req.getModifier(), req.getBonus());
        return ResponseEntity.ok(result);
    }

    @PostMapping("/saving-throw")
    public ResponseEntity<ActionResult> savingThrow(@RequestBody SavingThrowRequest req) {
        ActionResult result = engine.executeSavingThrow(
                req.getModifier(), req.getProficiency(), req.isProficient(),
                req.isHasAdvantage(), req.isHasDisadvantage(), req.getMagicBonus());
        return ResponseEntity.ok(result);
    }

    @GetMapping("/conditions")
    public ResponseEntity<List<?>> getConditions() {
        return ResponseEntity.ok(combatService.getAvailableConditions());
    }
}
