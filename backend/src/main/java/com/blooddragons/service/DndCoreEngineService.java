package com.blooddragons.service;

import com.blooddragons.model.CharacterSheet;
import com.blooddragons.model.dto.ActionResult;
import com.blooddragons.model.dto.AttackRollResult;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Motor de regras D&D 5e — ataques, danos, cura, saving throws.
 * Migrado de: src/app/services/dnd-core-engine.service.ts
 */
@Service
public class DndCoreEngineService {

    private final DndMathService math;
    private final SecureRandom rng = new SecureRandom();

    public DndCoreEngineService(DndMathService math) {
        this.math = math;
    }

    public int calculateModifier(int score) { return math.calculateModifier(score); }
    public int calculateProficiencyBonus(int level) { return math.calculateProficiencyBonus(level); }

    // ==========================================
    // d20 Roll (Vantagem / Desvantagem)
    // ==========================================

    public record D20Result(int naturalRoll, int roll1, Integer roll2, String mode) {}

    public D20Result rollD20(boolean advantage, boolean disadvantage) {
        int r1 = rng.nextInt(20) + 1;
        if (advantage && disadvantage) return new D20Result(r1, r1, null, "normal");
        if (advantage || disadvantage) {
            int r2 = rng.nextInt(20) + 1;
            int nat = advantage ? Math.max(r1, r2) : Math.min(r1, r2);
            return new D20Result(nat, r1, r2, advantage ? "advantage" : "disadvantage");
        }
        return new D20Result(r1, r1, null, "normal");
    }

    // ==========================================
    // Saving Throw
    // ==========================================

    public ActionResult executeSavingThrow(int modifier, int proficiency, boolean isProficient,
            boolean hasAdv, boolean hasDisadv, int magicBonus) {
        D20Result d20 = rollD20(hasAdv, hasDisadv);
        String logRolls = formatD20Log(d20);
        boolean isCrit = d20.naturalRoll() == 20;
        boolean isFail = d20.naturalRoll() == 1;
        int profBonus = isProficient ? proficiency : 0;
        int mods = modifier + profBonus + magicBonus;
        int total = d20.naturalRoll() + mods;
        StringBuilder log = new StringBuilder("d20: " + logRolls + " + Mod: " + modifier);
        if (isProficient) log.append(" + Prof: ").append(profBonus);
        if (magicBonus != 0) log.append(" + Bônus Mágico: ").append(magicBonus);
        log.append(" = ").append(total);
        return ActionResult.builder().total(total).naturalRoll(d20.naturalRoll())
                .modifiers(mods).isCritical(isCrit).isCriticalFail(isFail).log(log.toString()).build();
    }

    // ==========================================
    // Attack Roll
    // ==========================================

    public ActionResult executeAttackRoll(int modifier, int proficiency, int magicBonus,
            String mode, String extraDice) {
        boolean hasAdv = "advantage".equals(mode);
        boolean hasDisadv = "disadvantage".equals(mode);
        D20Result d20 = rollD20(hasAdv, hasDisadv);
        String logRolls = formatD20Log(d20);
        boolean isCrit = d20.naturalRoll() == 20;
        boolean isFail = d20.naturalRoll() == 1;

        int extraTotal = 0;
        String extraLog = "";
        if (extraDice != null && !extraDice.isBlank()) {
            ParseResult parsed = parseAndRoll(extraDice);
            extraTotal = parsed.total();
            extraLog = " + " + parsed.log();
        }

        int mods = modifier + proficiency + magicBonus + extraTotal;
        int total = d20.naturalRoll() + mods;
        StringBuilder log = new StringBuilder("d20: " + logRolls + " + Mod: " + modifier + " + Prof: " + proficiency);
        if (magicBonus != 0) log.append(" + Magia: ").append(magicBonus);
        if (!extraLog.isEmpty()) log.append(extraLog);
        log.append(" = ").append(total);
        if (isCrit) log.append(" (CRÍTICO!)");
        if (isFail) log.append(" (FALHA CRÍTICA!)");
        return ActionResult.builder().total(total).naturalRoll(d20.naturalRoll())
                .modifiers(mods).isCritical(isCrit).isCriticalFail(isFail).log(log.toString()).build();
    }

    // ==========================================
    // Damage
    // ==========================================

    public ActionResult calculateDamage(String diceString, int modifier, int itemBonus,
            double resistMul, boolean isOffhand) {
        ParseResult parsed = parseAndRoll(diceString);
        int appliedMod = isOffhand ? Math.min(0, modifier) : modifier;
        int mods = appliedMod + itemBonus;
        int raw = Math.max(0, parsed.total() + mods);
        int finalTotal = (int) Math.floor(raw * resistMul);
        StringBuilder log = new StringBuilder("Dados: " + parsed.log() + " + Mod: " + appliedMod);
        if (itemBonus != 0) log.append(" + Item: ").append(itemBonus);
        if (resistMul != 1) log.append(" (x").append(resistMul).append(")");
        log.append(" = ").append(finalTotal);
        return ActionResult.builder().total(finalTotal).naturalRoll(parsed.total())
                .modifiers(mods).isCritical(false).log(log.toString()).build();
    }

    public ActionResult calculateDamage(String dice, int mod, int itemBonus) {
        return calculateDamage(dice, mod, itemBonus, 1, false);
    }

    // ==========================================
    // Healing
    // ==========================================

    public ActionResult calculateHealing(String diceString, int modifier, int bonus) {
        ParseResult parsed = parseAndRoll(diceString);
        int total = parsed.total() + modifier + bonus;
        StringBuilder log = new StringBuilder("Dados: " + parsed.log() + " + Mod: " + modifier);
        if (bonus != 0) log.append(" + Bônus: ").append(bonus);
        log.append(" = ").append(total);
        return ActionResult.builder().total(total).naturalRoll(parsed.total())
                .modifiers(modifier + bonus).isCritical(false).log(log.toString()).build();
    }

    // ==========================================
    // AC, Spell DC, Spell Attack
    // ==========================================

    public int calculateAC(String armorType, int baseAC, int dexMod, int shieldBonus,
            int conMod, int wisMod, String unarmoredClass) {
        if ("heavy".equals(armorType)) return baseAC + shieldBonus;
        if ("medium".equals(armorType)) return baseAC + Math.min(dexMod, 2) + shieldBonus;
        if ("light".equals(armorType)) return baseAC + dexMod + shieldBonus;
        // none
        int std = 10 + dexMod;
        int ac = std;
        if ("monk".equals(unarmoredClass) && shieldBonus > 0) ac = std;
        else if ("barbarian".equals(unarmoredClass)) ac = Math.max(std, 10 + dexMod + conMod);
        else if ("monk".equals(unarmoredClass)) ac = Math.max(std, 10 + dexMod + wisMod);
        return ac + shieldBonus;
    }

    public int calculateSpellSaveDC(int modifier, int proficiency) { return 8 + modifier + proficiency; }
    public int calculateSpellAttackBonus(int modifier, int proficiency) { return modifier + proficiency; }
    public int calculateMaxHP(int hitDice, int level, int conMod) {
        int total = Math.max(1, hitDice + conMod);
        if (level > 1) {
            int avg = (int) Math.ceil(hitDice / 2.0) + 1;
            for (int i = 2; i <= level; i++) total += Math.max(1, avg + conMod);
        }
        return total;
    }

    public record ValidationResult(boolean success, int margin) {}
    public ValidationResult validateSuccess(int total, int dc) {
        return new ValidationResult(total >= dc, total - dc);
    }

    // ==========================================
    // Armor & Weapon Proficiency Validation
    // ==========================================

    public record ArmorPenalties(boolean hasDisadvantage, boolean canCastSpells) {}

    public ArmorPenalties validateArmorPenalties(CharacterSheet character) {
        if (character.getProficiencies() == null || character.getProficiencies().getArmor() == null)
            return new ArmorPenalties(false, true);
        boolean disadv = false;
        boolean canCast = true;
        if (character.getInventory() != null) {
            for (var item : character.getInventory()) {
                if (item.isEquipped() && "armor".equals(item.getType()) && item.getArmorType() != null
                        && !"none".equals(item.getArmorType())
                        && !character.getProficiencies().getArmor().contains(item.getArmorType())) {
                    disadv = true; canCast = false;
                }
                if (item.isEquipped() && "shield".equals(item.getType())
                        && !character.getProficiencies().getArmor().contains("shields")) {
                    disadv = true; canCast = false;
                }
            }
        }
        return new ArmorPenalties(disadv, canCast);
    }

    public boolean isProficientWithWeapon(CharacterSheet character, String weaponName, String weaponType) {
        // PHB p.195: Todos são proficientes com ataques desarmados (armas naturais)
        if ("natural".equals(weaponType)) return true;
        if (character.getProficiencies() == null || character.getProficiencies().getWeapons() == null)
            return false;
        if (weaponType != null && character.getProficiencies().getWeapons().contains(weaponType)) return true;
        return character.getProficiencies().getWeapons().stream()
                .anyMatch(w -> w.equalsIgnoreCase(weaponName));
    }

    // ==========================================
    // Dice Parser
    // ==========================================

    public record ParseResult(int total, List<Integer> rolls, String log) {}

    private static final Pattern DICE_PATTERN = Pattern.compile("[+-]?(?:\\d+d\\d+|\\d+)");

    public ParseResult parseAndRoll(String diceString) {
        if (diceString == null || diceString.isBlank())
            return new ParseResult(0, List.of(), "0");
        int total = 0;
        List<Integer> rolls = new ArrayList<>();
        List<String> logParts = new ArrayList<>();
        Matcher matcher = DICE_PATTERN.matcher(diceString.replaceAll("\\s+", ""));
        while (matcher.find()) {
            String term = matcher.group();
            int sign = term.startsWith("-") ? -1 : 1;
            String clean = term.replaceFirst("^[+-]", "");
            if (clean.contains("d")) {
                String[] parts = clean.split("d");
                int count = parts[0].isEmpty() ? 1 : Integer.parseInt(parts[0]);
                int sides = Integer.parseInt(parts[1]);
                List<Integer> termRolls = new ArrayList<>();
                int termTotal = 0;
                for (int i = 0; i < count; i++) {
                    int roll = rng.nextInt(sides) + 1;
                    termRolls.add(roll);
                    termTotal += roll;
                }
                total += sign * termTotal;
                rolls.addAll(termRolls);
                String signStr = logParts.isEmpty() && sign == 1 ? "" : (sign < 0 ? " - " : " + ");
                logParts.add(signStr + "[" + joinInts(termRolls) + "]");
            } else {
                int val = Integer.parseInt(clean);
                total += sign * val;
                String signStr = logParts.isEmpty() && sign == 1 ? "" : (sign < 0 ? " - " : " + ");
                logParts.add(signStr + val);
            }
        }
        return new ParseResult(total, rolls, String.join("", logParts).trim());
    }

    // ==========================================
    // Helpers
    // ==========================================

    private String formatD20Log(D20Result d20) {
        if (d20.roll2() != null) {
            if ("advantage".equals(d20.mode()))
                return "[" + d20.roll1() + ", " + d20.roll2() + "] (Vantagem: " + d20.naturalRoll() + ")";
            return "[" + d20.roll1() + ", " + d20.roll2() + "] (Desvantagem: " + d20.naturalRoll() + ")";
        }
        return "[" + d20.roll1() + "]";
    }

    private String joinInts(List<Integer> list) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < list.size(); i++) {
            if (i > 0) sb.append(",");
            sb.append(list.get(i));
        }
        return sb.toString();
    }
}
