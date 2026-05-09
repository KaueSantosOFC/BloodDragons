package com.blooddragons.controller;

import com.blooddragons.data.*;
import com.blooddragons.model.CharacterSheet;
import com.blooddragons.service.CharacterCreationService;
import com.blooddragons.service.SpellService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Controller REST para criação e gestão de personagens D&D 5e.
 */
@RestController
@RequestMapping("/api/character")
public class CharacterController {

    private final CharacterCreationService creationService;
    private final SpellService spellService;

    public CharacterController(CharacterCreationService creationService, SpellService spellService) {
        this.creationService = creationService;
        this.spellService = spellService;
    }

    /**
     * Cria uma ficha de personagem completa com todas as regras aplicadas.
     */
    @PostMapping("/create")
    public ResponseEntity<CharacterSheet> createCharacter(@RequestBody CreateCharacterRequest req) {
        CharacterSheet sheet = creationService.createCharacter(
                req.raceId, req.subRaceId, req.classId,
                req.str, req.dex, req.con, req.intAttr, req.wis, req.cha,
                req.background, req.alignment, req.playerName);
        return ResponseEntity.ok(sheet);
    }

    /**
     * Valida multiclasse para um personagem existente.
     */
    @PostMapping("/validate-multiclass")
    public ResponseEntity<Map<String, Object>> validateMulticlass(@RequestBody MulticlassRequest req) {
        List<String> errors = creationService.validateMulticlass(req.sheet, req.newClassId);
        return ResponseEntity.ok(Map.of("valid", errors.isEmpty(), "errors", errors));
    }

    /**
     * Retorna todas as raças com sub-raças e traços.
     */
    @GetMapping("/races")
    public ResponseEntity<List<Dnd5eRaceData.Race>> getRaces() {
        return ResponseEntity.ok(Dnd5eRaceData.RACES);
    }

    /**
     * Retorna todas as classes com dados completos.
     */
    @GetMapping("/classes")
    public ResponseEntity<List<Dnd5eClassData.ClassInfo>> getClasses() {
        return ResponseEntity.ok(Dnd5eClassData.CLASSES);
    }

    /**
     * Retorna todas as armaduras.
     */
    @GetMapping("/armors")
    public ResponseEntity<List<Dnd5eEquipmentData.Armor>> getArmors() {
        return ResponseEntity.ok(Dnd5eEquipmentData.ARMORS);
    }

    /**
     * Retorna todas as condições com efeitos mecânicos.
     */
    @GetMapping("/conditions")
    public ResponseEntity<List<Dnd5eEquipmentData.ConditionEffect>> getConditions() {
        return ResponseEntity.ok(Dnd5eEquipmentData.CONDITIONS);
    }

    /**
     * Retorna spell slots para uma classe/nível específico.
     */
    @GetMapping("/spell-slots")
    public ResponseEntity<Map<String, Object>> getSpellSlots(
            @RequestParam String casterType, @RequestParam int level) {
        int[] slots = Dnd5eClassData.getSpellSlots(casterType, level);
        return ResponseEntity.ok(Map.of("casterType", casterType, "level", level, "slots", slots));
    }

    /**
     * Calcula dano de truque escalado pelo nível.
     */
    @PostMapping("/cantrip-damage")
    public ResponseEntity<Map<String, String>> cantripDamage(@RequestBody Map<String, Object> req) {
        String baseDice = (String) req.get("baseDice");
        int level = (Integer) req.get("characterLevel");
        String scaled = spellService.scaleCantripDamage(baseDice, level);
        return ResponseEntity.ok(Map.of("baseDice", baseDice, "scaledDice", scaled));
    }

    // DTOs
    public record CreateCharacterRequest(
            String raceId, String subRaceId, String classId,
            int str, int dex, int con, int intAttr, int wis, int cha,
            String background, String alignment, String playerName) {}

    public record MulticlassRequest(CharacterSheet sheet, String newClassId) {}
}
