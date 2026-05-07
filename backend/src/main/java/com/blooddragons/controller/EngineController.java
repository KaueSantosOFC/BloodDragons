package com.blooddragons.controller;

import com.blooddragons.model.dto.*;
import com.blooddragons.model.dto.EngineRequests.*;
import com.blooddragons.service.DndCoreEngineService;
import com.blooddragons.service.DndMathService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Controller REST para operações da engine D&D 5e.
 * Expõe cálculos de modificadores, AC, HP, dice rolls, etc.
 */
@RestController
@RequestMapping("/api/engine")
public class EngineController {

    private final DndCoreEngineService engine;
    private final DndMathService math;

    public EngineController(DndCoreEngineService engine, DndMathService math) {
        this.engine = engine;
        this.math = math;
    }

    @PostMapping("/roll-dice")
    public ResponseEntity<DndCoreEngineService.ParseResult> rollDice(@RequestBody DiceRollRequest req) {
        return ResponseEntity.ok(engine.parseAndRoll(req.getDiceString()));
    }

    @PostMapping("/calculate-modifier")
    public ResponseEntity<Map<String, Integer>> calculateModifier(@RequestBody ModifierRequest req) {
        int mod = engine.calculateModifier(req.getScore());
        return ResponseEntity.ok(Map.of("score", req.getScore(), "modifier", mod));
    }

    @PostMapping("/calculate-ac")
    public ResponseEntity<Map<String, Integer>> calculateAC(@RequestBody AcRequest req) {
        String unarmoredClass = req.getUnarmoredDefenseClass() != null ? req.getUnarmoredDefenseClass() : "none";
        int ac = engine.calculateAC(req.getArmorType(), req.getBaseAC(), req.getDexModifier(),
                req.getShieldBonus(), req.getConModifier(), req.getWisModifier(), unarmoredClass);
        return ResponseEntity.ok(Map.of("ac", ac));
    }

    @PostMapping("/spell-save-dc")
    public ResponseEntity<Map<String, Integer>> spellSaveDC(@RequestBody SpellSaveDcRequest req) {
        int dc = engine.calculateSpellSaveDC(req.getModifier(), req.getProficiency());
        return ResponseEntity.ok(Map.of("dc", dc));
    }

    @PostMapping("/calculate-max-hp")
    public ResponseEntity<Map<String, Integer>> calculateMaxHP(@RequestBody MaxHpRequest req) {
        int maxHp = engine.calculateMaxHP(req.getHitDice(), req.getLevel(), req.getConModifier());
        return ResponseEntity.ok(Map.of("maxHp", maxHp));
    }

    @PostMapping("/proficiency-bonus")
    public ResponseEntity<Map<String, Integer>> proficiencyBonus(@RequestBody Map<String, Integer> req) {
        int level = req.getOrDefault("level", 1);
        return ResponseEntity.ok(Map.of("bonus", engine.calculateProficiencyBonus(level)));
    }

    @PostMapping("/distance")
    public ResponseEntity<Map<String, Double>> distance(@RequestBody Map<String, Integer> req) {
        double dist = math.calculateDistanceMeters(
                req.getOrDefault("x1", 0), req.getOrDefault("y1", 0),
                req.getOrDefault("x2", 0), req.getOrDefault("y2", 0));
        return ResponseEntity.ok(Map.of("distanceMeters", dist));
    }
}
