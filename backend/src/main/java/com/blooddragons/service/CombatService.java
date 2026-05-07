package com.blooddragons.service;

import com.blooddragons.model.*;
import com.blooddragons.model.dto.*;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * Serviço de combate — orquestra ataques, dano, cura, XP e level up.
 * Migrado de: src/app/services/combat.service.ts
 */
@Service
public class CombatService {

    private final DndCoreEngineService engine;
    private final DndMathService math;

    private static final Map<Integer, int[]> XP_TABLE = new LinkedHashMap<>();
    static {
        XP_TABLE.put(1, new int[]{0, 2});     XP_TABLE.put(2, new int[]{300, 2});
        XP_TABLE.put(3, new int[]{900, 2});    XP_TABLE.put(4, new int[]{2700, 2});
        XP_TABLE.put(5, new int[]{6500, 3});   XP_TABLE.put(6, new int[]{14000, 3});
        XP_TABLE.put(7, new int[]{23000, 3});  XP_TABLE.put(8, new int[]{34000, 3});
        XP_TABLE.put(9, new int[]{48000, 4});  XP_TABLE.put(10, new int[]{64000, 4});
        XP_TABLE.put(11, new int[]{85000, 4}); XP_TABLE.put(12, new int[]{100000, 4});
        XP_TABLE.put(13, new int[]{120000, 5});XP_TABLE.put(14, new int[]{140000, 5});
        XP_TABLE.put(15, new int[]{165000, 5});XP_TABLE.put(16, new int[]{195000, 5});
        XP_TABLE.put(17, new int[]{225000, 6});XP_TABLE.put(18, new int[]{265000, 6});
        XP_TABLE.put(19, new int[]{305000, 6});XP_TABLE.put(20, new int[]{355000, 6});
    }

    public static final List<TokenCondition> AVAILABLE_CONDITIONS = List.of(
        TokenCondition.builder().id("fire").name("Fogo").icon("local_fire_department").color("#ef4444").build(),
        TokenCondition.builder().id("cold").name("Frio").icon("ac_unit").color("#3b82f6").build(),
        TokenCondition.builder().id("lightning").name("Elétrico").icon("bolt").color("#eab308").build(),
        TokenCondition.builder().id("acid").name("Ácido").icon("water_drop").color("#22c55e").build(),
        TokenCondition.builder().id("poison").name("Veneno").icon("science").color("#84cc16").build(),
        TokenCondition.builder().id("thunder").name("Trovejante").icon("volume_up").color("#a8a29e").build(),
        TokenCondition.builder().id("necrotic").name("Necrótico").icon("sentiment_very_dissatisfied").color("#7e22ce").build(),
        TokenCondition.builder().id("radiant").name("Radiante").icon("wb_sunny").color("#fbbf24").build(),
        TokenCondition.builder().id("force").name("Força").icon("flare").color("#a855f7").build(),
        TokenCondition.builder().id("psychic").name("Psíquico").icon("psychology").color("#ec4899").build(),
        TokenCondition.builder().id("blinded").name("Cego").icon("visibility_off").color("#737373").build(),
        TokenCondition.builder().id("charmed").name("Enfeitiçado").icon("favorite").color("#ec4899").build(),
        TokenCondition.builder().id("deafened").name("Surdo").icon("hearing_disabled").color("#737373").build(),
        TokenCondition.builder().id("frightened").name("Amedrontado").icon("mood_bad").color("#f59e0b").build(),
        TokenCondition.builder().id("grappled").name("Agarrado").icon("front_hand").color("#d97706").build(),
        TokenCondition.builder().id("incapacitated").name("Incapacitado").icon("block").color("#ef4444").build(),
        TokenCondition.builder().id("invisible").name("Invisível").icon("visibility_off").color("#94a3b8").build(),
        TokenCondition.builder().id("paralyzed").name("Paralisado").icon("pan_tool").color("#ef4444").build(),
        TokenCondition.builder().id("petrified").name("Petrificado").icon("imagesearch_roller").color("#57534e").build(),
        TokenCondition.builder().id("prone").name("Caído").icon("airline_seat_flat").color("#a8a29e").build(),
        TokenCondition.builder().id("restrained").name("Impedido").icon("lock").color("#f43f5e").build(),
        TokenCondition.builder().id("stunned").name("Atordoado").icon("stars").color("#eab308").build(),
        TokenCondition.builder().id("unconscious").name("Inconsciente").icon("bedtime").color("#1e3a8a").build(),
        TokenCondition.builder().id("exhaustion").name("Exaustão").icon("battery_alert").color("#dc2626").build()
    );

    private static final List<String> ADVANTAGE_CONDITIONS = List.of(
        "Atordoado", "Cego", "Incapacitado", "Inconsciente", "Paralisado", "Petrificado", "Impedido"
    );

    public CombatService(DndCoreEngineService engine, DndMathService math) {
        this.engine = engine;
        this.math = math;
    }

    /**
     * Resolução completa de ataque: rola d20, verifica acerto, rola dano.
     */
    public AttackResponse resolveAttack(Token attacker, Token target, Ability ability, String mode) {
        if (mode == null) mode = "normal";
        int strMod = engine.calculateModifier(attacker.getSheet() != null ? attacker.getSheet().getStr() : 10);
        int profBonus = attacker.getSheet() != null ? attacker.getSheet().getProficiencyBonus() : 2;
        int magicBonus = ability.getAttackBonus() != null ? ability.getAttackBonus() : 0;
        int targetAC = target.getSheet() != null ? target.getSheet().getAc() : 10;

        // Vantagem automática por condições
        String finalMode = mode;
        if (target.getConditions() != null) {
            for (var c : target.getConditions()) {
                if (ADVANTAGE_CONDITIONS.contains(c.getName())) { finalMode = "advantage"; break; }
            }
        }

        ActionResult attackRoll = engine.executeAttackRoll(strMod, profBonus, magicBonus, finalMode, null);
        var hitCheck = engine.validateSuccess(attackRoll.getTotal(), targetAC);
        boolean isHit = hitCheck.success() || attackRoll.isCritical();

        StringBuilder log = new StringBuilder("Ataque contra " + target.getName() + " (CA " + targetAC + "): " + attackRoll.getLog());
        if ("advantage".equals(finalMode) && !"advantage".equals(mode))
            log.append("\n(Vantagem automática devido à condição do alvo)");

        ActionResult damageRoll = null;
        if (isHit && (attackRoll.getIsCriticalFail() == null || !attackRoll.getIsCriticalFail())) {
            log.append("\n🎯 ACERTOU!");
            String damageDice = ability.getDamage() != null ? ability.getDamage() : "1d8";
            damageRoll = engine.calculateDamage(damageDice, strMod, 0);
            if (attackRoll.isCritical()) {
                ActionResult critDmg = engine.calculateDamage(damageDice, 0, 0);
                damageRoll.setTotal(damageRoll.getTotal() + critDmg.getTotal());
                damageRoll.setLog(damageRoll.getLog() + " + Crítico: " + critDmg.getLog());
            }
            log.append("\n⚔️ Dano: ").append(damageRoll.getLog());
        } else {
            isHit = false;
            log.append("\n🛡️ ERROU!");
        }

        return AttackResponse.builder().attack(attackRoll).damage(damageRoll)
                .hit(isHit).log(log.toString()).build();
    }

    /**
     * Level up: verifica XP e aplica progressão.
     */
    public CharacterSheet checkLevelUp(CharacterSheet sheet) {
        int currentLevel = sheet.getLevel();
        while (currentLevel < 20 && XP_TABLE.containsKey(currentLevel + 1)
                && sheet.getXp() >= XP_TABLE.get(currentLevel + 1)[0]) {
            currentLevel++;
            sheet.setLevel(currentLevel);
            sheet.setProficiencyBonus(math.calculateProficiencyBonus(currentLevel));
            int conMod = math.calculateModifier(sheet.getCon());
            int hitDie = sheet.getHitDie() > 0 ? sheet.getHitDie() : 10;
            int hpGain = math.calculateMaxHpGain(hitDie, conMod, false, false);
            sheet.setMaxHp(sheet.getMaxHp() + hpGain);
            sheet.setHp(sheet.getMaxHp()); // Full heal on level up
        }
        return sheet;
    }

    public List<TokenCondition> getAvailableConditions() {
        return AVAILABLE_CONDITIONS;
    }
}
