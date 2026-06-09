package com.blooddragons.controller;

import com.blooddragons.data.Dnd5eDmgData;
import com.blooddragons.model.dto.ActionResult;
import com.blooddragons.service.DmgRulesService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Endpoints para regras do Guia do Mestre (DMG) D&D 5e.
 */
@RestController
@RequestMapping("/api/dmg")
@CrossOrigin(origins = "*")
public class DmgController {

    private final DmgRulesService dmgService;

    public DmgController(DmgRulesService dmgService) {
        this.dmgService = dmgService;
    }

    // ============================================
    // Dano de Queda
    // ============================================

    @GetMapping("/fall-damage")
    public ResponseEntity<ActionResult> fallDamage(@RequestParam double distanceMeters) {
        return ResponseEntity.ok(dmgService.calculateFallDamage(distanceMeters));
    }

    // ============================================
    // Armadilhas
    // ============================================

    @PostMapping("/trap/save")
    public ResponseEntity<DmgRulesService.TrapResult> trapSave(@RequestBody Map<String, Object> body) {
        int attrScore = ((Number) body.get("attributeScore")).intValue();
        int profBonus = ((Number) body.getOrDefault("profBonus", 2)).intValue();
        boolean isProficient = (boolean) body.getOrDefault("isProficient", false);
        int trapDC = ((Number) body.get("trapDC")).intValue();
        String damageDice = (String) body.get("damageDice");
        boolean halfOnSuccess = (boolean) body.getOrDefault("halfOnSuccess", true);
        return ResponseEntity.ok(dmgService.resolveTrapSave(attrScore, profBonus, isProficient, trapDC, damageDice, halfOnSuccess));
    }

    // ============================================
    // Venenos
    // ============================================

    @GetMapping("/poisons")
    public ResponseEntity<List<Dnd5eDmgData.Poison>> listPoisons() {
        return ResponseEntity.ok(Dnd5eDmgData.VENENOS);
    }

    @PostMapping("/poison/save")
    public ResponseEntity<DmgRulesService.PoisonResult> poisonSave(@RequestBody Map<String, Object> body) {
        int conScore = ((Number) body.get("conScore")).intValue();
        int profBonus = ((Number) body.getOrDefault("profBonus", 2)).intValue();
        boolean isProfConSave = (boolean) body.getOrDefault("isProfConSave", false);
        String poisonName = (String) body.get("poisonName");
        return ResponseEntity.ok(dmgService.resolvePoisonSave(conScore, profBonus, isProfConSave, poisonName));
    }

    // ============================================
    // Doenças
    // ============================================

    @GetMapping("/diseases")
    public ResponseEntity<List<Dnd5eDmgData.Disease>> listDiseases() {
        return ResponseEntity.ok(Dnd5eDmgData.DOENCAS);
    }

    // ============================================
    // Dano Ambiental
    // ============================================

    @GetMapping("/environmental-damage")
    public ResponseEntity<ActionResult> environmentalDamage(
            @RequestParam int level, @RequestParam String severity) {
        return ResponseEntity.ok(dmgService.rollEnvironmentalDamage(level, severity));
    }

    // ============================================
    // XP por ND
    // ============================================

    @GetMapping("/xp")
    public ResponseEntity<List<Dnd5eDmgData.CrXp>> xpTable() {
        return ResponseEntity.ok(Dnd5eDmgData.XP_POR_ND);
    }

    @PostMapping("/xp/calculate")
    public ResponseEntity<DmgRulesService.XpResult> calculateXP(@RequestBody Map<String, Object> body) {
        @SuppressWarnings("unchecked")
        List<String> crs = (List<String>) body.get("challengeRatings");
        int partySize = ((Number) body.getOrDefault("partySize", 4)).intValue();
        return ResponseEntity.ok(dmgService.calculateEncounterXP(crs.toArray(String[]::new), partySize));
    }

    // ============================================
    // Alvos em AoE
    // ============================================

    @GetMapping("/aoe-targets")
    public ResponseEntity<Map<String, Object>> aoeTargets(
            @RequestParam String shape, @RequestParam double sizeMeters) {
        int targets = dmgService.estimateAoeTargets(shape, sizeMeters);
        return ResponseEntity.ok(Map.of("shape", shape, "sizeMeters", sizeMeters, "estimatedTargets", targets));
    }

    // ============================================
    // CDs Típicas
    // ============================================

    @GetMapping("/dc-table")
    public ResponseEntity<Map<String, Integer>> dcTable() {
        return ResponseEntity.ok(Dnd5eDmgData.CDS_TIPICAS);
    }

    // ============================================
    // Objetos
    // ============================================

    @GetMapping("/object/ac")
    public ResponseEntity<Map<String, Integer>> objectAC(@RequestParam String material) {
        return ResponseEntity.ok(Map.of("material", Dnd5eDmgData.getObjectAC(material), "ac", Dnd5eDmgData.getObjectAC(material)));
    }

    @GetMapping("/object/hp")
    public ResponseEntity<Map<String, Object>> objectHP(
            @RequestParam String size, @RequestParam(defaultValue = "false") boolean resilient) {
        int hp = dmgService.getObjectHP(size, resilient);
        return ResponseEntity.ok(Map.of("size", size, "resilient", resilient, "hp", hp));
    }

    // ============================================
    // Sobrevivência
    // ============================================

    @GetMapping("/survival/food-days")
    public ResponseEntity<Map<String, Integer>> foodDays(@RequestParam int conScore) {
        return ResponseEntity.ok(Map.of("conScore", conScore, "daysSurvival", dmgService.daysSurviveWithoutFood(conScore)));
    }

    @PostMapping("/survival/forage")
    public ResponseEntity<DmgRulesService.ForageResult> forage(@RequestBody Map<String, Object> body) {
        int wisMod = ((Number) body.get("wisMod")).intValue();
        int profBonus = ((Number) body.getOrDefault("profBonus", 2)).intValue();
        boolean isProficient = (boolean) body.getOrDefault("isProficient", false);
        int dc = ((Number) body.getOrDefault("dc", 10)).intValue();
        return ResponseEntity.ok(dmgService.resolveForaging(wisMod, profBonus, isProficient, dc));
    }

    // ============================================
    // Construção de Itens Mágicos
    // ============================================

    @GetMapping("/crafting/magic-items")
    public ResponseEntity<List<Dnd5eDmgData.MagicItemCrafting>> magicItemCraftingTable() {
        return ResponseEntity.ok(Dnd5eDmgData.ITEM_CRAFTING);
    }
}
