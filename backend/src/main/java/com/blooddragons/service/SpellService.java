package com.blooddragons.service;

import com.blooddragons.data.Dnd5eClassData;
import com.blooddragons.model.CharacterSheet;
import org.springframework.stereotype.Service;

/**
 * Serviço de gestão de magias D&D 5e.
 * Controla spell slots, upcast, concentração, escala de truques.
 */
@Service
public class SpellService {

    private final DndCoreEngineService engine;

    public SpellService(DndCoreEngineService engine) {
        this.engine = engine;
    }

    /**
     * Gasta um spell slot do nível especificado.
     * @return true se o slot foi gasto, false se não há slots disponíveis
     */
    public boolean expendSpellSlot(CharacterSheet sheet, int spellLevel) {
        if (sheet.getCurrentSpellSlots() == null || spellLevel < 1 || spellLevel > 9) return false;
        int idx = spellLevel - 1;
        if (sheet.getCurrentSpellSlots()[idx] <= 0) return false;
        sheet.getCurrentSpellSlots()[idx]--;
        return true;
    }

    /**
     * Recupera todos os spell slots (descanso longo).
     */
    public void restoreAllSlots(CharacterSheet sheet) {
        if (sheet.getMaxSpellSlots() != null) {
            sheet.setCurrentSpellSlots(sheet.getMaxSpellSlots().clone());
        }
    }

    /**
     * Recupera spell slots do Bruxo (descanso curto).
     * Bruxo recupera TODOS os slots em descanso curto.
     */
    public void restoreWarlockSlots(CharacterSheet sheet) {
        restoreAllSlots(sheet);
    }

    /**
     * Calcula o dano de um truque (cantrip) baseado no nível total do personagem.
     * Truques escalam nos níveis 5, 11 e 17.
     * @param baseDice ex: "1d10"
     * @param characterLevel nível total do personagem
     * @return dados escalados ex: "2d10", "3d10", "4d10"
     */
    public String scaleCantripDamage(String baseDice, int characterLevel) {
        if (baseDice == null || baseDice.isEmpty()) return baseDice;

        int multiplier;
        if (characterLevel >= 17) multiplier = 4;
        else if (characterLevel >= 11) multiplier = 3;
        else if (characterLevel >= 5) multiplier = 2;
        else multiplier = 1;

        // Parse "1d10" → "4d10"
        String[] parts = baseDice.split("d");
        if (parts.length != 2) return baseDice;
        try {
            int originalCount = parts[0].isEmpty() ? 1 : Integer.parseInt(parts[0]);
            int sides = Integer.parseInt(parts[1]);
            return (originalCount * multiplier) + "d" + sides;
        } catch (NumberFormatException e) {
            return baseDice;
        }
    }

    /**
     * Calcula dano com upcast.
     * @param baseDamage dano base ex: "8d6"
     * @param baseLevel nível mínimo da magia
     * @param castLevel nível do slot usado
     * @param extraDicePerLevel dados extras por nível acima ex: "1d6"
     * @return dano total ex: "10d6" se upcast 2 níveis com +1d6/nível
     */
    public String calculateUpcastDamage(String baseDamage, int baseLevel, int castLevel, String extraDicePerLevel) {
        if (castLevel <= baseLevel || extraDicePerLevel == null) return baseDamage;

        int levelsAbove = castLevel - baseLevel;
        String[] extraParts = extraDicePerLevel.split("d");
        if (extraParts.length != 2) return baseDamage;

        try {
            int extraCount = extraParts[0].isEmpty() ? 1 : Integer.parseInt(extraParts[0]);
            int extraSides = Integer.parseInt(extraParts[1]);

            String[] baseParts = baseDamage.split("d");
            if (baseParts.length != 2) return baseDamage;
            int baseCount = baseParts[0].isEmpty() ? 1 : Integer.parseInt(baseParts[0]);
            int baseSides = Integer.parseInt(baseParts[1]);

            if (baseSides == extraSides) {
                return (baseCount + extraCount * levelsAbove) + "d" + baseSides;
            } else {
                return baseDamage + " + " + (extraCount * levelsAbove) + "d" + extraSides;
            }
        } catch (NumberFormatException e) {
            return baseDamage;
        }
    }

    /**
     * Calcula CD de Magia (Spell Save DC).
     */
    public int calculateSpellSaveDC(CharacterSheet sheet) {
        if (sheet.getSpellcastingAbility() == null || "none".equals(sheet.getSpellcastingAbility())) return 0;
        int mod = getSpellcastingModifier(sheet);
        return 8 + sheet.getProficiencyBonus() + mod;
    }

    /**
     * Calcula Bônus de Ataque de Magia.
     */
    public int calculateSpellAttackBonus(CharacterSheet sheet) {
        if (sheet.getSpellcastingAbility() == null || "none".equals(sheet.getSpellcastingAbility())) return 0;
        return sheet.getProficiencyBonus() + getSpellcastingModifier(sheet);
    }

    /**
     * Verifica se o personagem pode conjurar (não está usando armadura sem proficiência).
     */
    public boolean canCastSpells(CharacterSheet sheet) {
        var penalties = engine.validateArmorPenalties(sheet);
        return penalties.canCastSpells();
    }

    /**
     * Número de Rajadas Místicas do Bruxo por nível.
     */
    public int getEldritchBlastBeams(int characterLevel) {
        if (characterLevel >= 17) return 4;
        if (characterLevel >= 11) return 3;
        if (characterLevel >= 5) return 2;
        return 1;
    }

    /**
     * Calcula quantas magias podem ser preparadas (Clérigo, Druida, Mago, Paladino).
     */
    public int calculatePreparedSpells(CharacterSheet sheet) {
        int mod = getSpellcastingModifier(sheet);
        return Math.max(1, mod + sheet.getLevel());
    }

    private int getSpellcastingModifier(CharacterSheet sheet) {
        return switch (sheet.getSpellcastingAbility()) {
            case "int" -> engine.calculateModifier(sheet.getIntAttr());
            case "wis" -> engine.calculateModifier(sheet.getWis());
            case "cha" -> engine.calculateModifier(sheet.getCha());
            default -> 0;
        };
    }
}
