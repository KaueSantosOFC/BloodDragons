package com.blooddragons.data;

import com.blooddragons.model.CharacterSheet;
import com.blooddragons.model.Token;

import java.util.ArrayList;
import java.util.List;

/**
 * Bestiário SRD 5e — Fichas prontas de monstros e NPCs para importação rápida.
 * Baseado no System Reference Document (SRD) 5.1 do D&D 5e.
 */
public class Dnd5eBestiaryData {

    public static final List<BestiaryEntry> BESTIARY = List.of(
            entry("goblin", "Goblin", "1/4", "Humanoide", 7, 15, 8, 14, 10, 10, 8, 8, 6, 9,
                    ability("Cimitarra", "action", "weapon", "1d6+2", "slashing", 1.5, "Ataque corpo a corpo: +4 para acertar."),
                    ability("Arco Curto", "action", "weapon", "1d6+2", "piercing", 24, "Ataque à distância: +4 para acertar, alcance 24/96m.")),

            entry("skeleton", "Esqueleto", "1/4", "Morto-vivo", 13, 13, 10, 14, 15, 6, 8, 5, 6, 9,
                    ability("Espada Curta", "action", "weapon", "1d6+2", "piercing", 1.5, "Ataque corpo a corpo: +4 para acertar."),
                    ability("Arco Curto", "action", "weapon", "1d6+2", "piercing", 24, "Ataque à distância: +4 para acertar.")),

            entry("zombie", "Zumbi", "1/4", "Morto-vivo", 22, 8, 13, 6, 16, 1, 6, 3, 8, 8,
                    ability("Pancada", "action", "weapon", "1d6+1", "bludgeoning", 1.5, "Ataque corpo a corpo: +3 para acertar.")),

            entry("wolf", "Lobo", "1/4", "Besta", 11, 13, 12, 15, 12, 3, 12, 6, 10, 13,
                    ability("Mordida", "action", "weapon", "2d4+2", "piercing", 1.5, "Ataque corpo a corpo: +4 para acertar. CD 11 FOR ou alvo cai derrubado.")),

            entry("kobold", "Kobold", "1/8", "Humanoide", 5, 12, 7, 15, 9, 8, 7, 8, 6, 8,
                    ability("Adaga", "action", "weapon", "1d4+2", "piercing", 1.5, "Ataque corpo a corpo: +4 para acertar."),
                    ability("Funda", "action", "weapon", "1d4+2", "bludgeoning", 9, "Ataque à distância: +4 para acertar.")),

            entry("bandit", "Bandido", "1/8", "Humanoide", 11, 12, 11, 12, 12, 10, 10, 10, 6, 10,
                    ability("Cimitarra", "action", "weapon", "1d6+1", "slashing", 1.5, "Ataque corpo a corpo: +3 para acertar."),
                    ability("Besta Leve", "action", "weapon", "1d8+1", "piercing", 24, "Ataque à distância: +3 para acertar.")),

            entry("orc", "Orc", "1/2", "Humanoide", 15, 13, 16, 12, 16, 7, 11, 10, 10, 10,
                    ability("Machado Grande", "action", "weapon", "1d12+3", "slashing", 1.5, "Ataque corpo a corpo: +5 para acertar."),
                    ability("Azagaia", "action", "weapon", "1d6+3", "piercing", 9, "Ataque à distância: +5 para acertar.")),

            entry("giant_spider", "Aranha Gigante", "1", "Besta", 26, 14, 14, 16, 12, 1, 11, 4, 10, 12,
                    ability("Mordida", "action", "weapon", "1d8+3", "piercing", 1.5, "Ataque corpo a corpo: +5 para acertar. +2d8 dano de veneno (CD 11 CON, metade no sucesso)."),
                    ability("Teia", "action", "weapon", "0", "bludgeoning", 18, "Ataque à distância: alvo impedido. CD 12 FOR para escapar.")),

            entry("ogre", "Ogro", "2", "Gigante", 59, 11, 8, 14, 16, 5, 7, 7, 10, 8,
                    ability("Clava Grande", "action", "weapon", "2d8+4", "bludgeoning", 1.5, "Ataque corpo a corpo: +6 para acertar."),
                    ability("Azagaia", "action", "weapon", "2d6+4", "piercing", 9, "Ataque à distância: +6 para acertar.")),

            entry("dire_wolf", "Lobo Atroz", "1", "Besta", 37, 14, 15, 13, 14, 3, 12, 7, 10, 13,
                    ability("Mordida", "action", "weapon", "2d6+3", "piercing", 1.5, "Ataque corpo a corpo: +5 para acertar. CD 13 FOR ou alvo cai derrubado.")),

            entry("minotaur", "Minotauro", "3", "Monstruosidade", 76, 14, 17, 11, 16, 6, 16, 9, 10, 17,
                    ability("Machado Grande", "action", "weapon", "2d12+4", "slashing", 1.5, "Ataque corpo a corpo: +6 para acertar."),
                    ability("Chifrada", "action", "weapon", "2d8+4", "piercing", 1.5, "Ataque corpo a corpo: +6 para acertar. CD 14 FOR ou empurrado 3m e derrubado.")),

            entry("owlbear", "Urso-coruja", "3", "Monstruosidade", 59, 13, 15, 12, 17, 3, 14, 7, 10, 13,
                    ability("Garras", "action", "weapon", "2d8+5", "slashing", 1.5, "Ataque corpo a corpo: +7 para acertar."),
                    ability("Bico", "action", "weapon", "1d10+5", "piercing", 1.5, "Ataque corpo a corpo: +7 para acertar.")),

            entry("guard", "Guarda", "1/8", "Humanoide", 11, 16, 12, 13, 12, 10, 11, 10, 6, 12,
                    ability("Lança", "action", "weapon", "1d6+1", "piercing", 1.5, "Ataque corpo a corpo: +3 para acertar.")),

            entry("bandit_captain", "Capitão Bandido", "2", "Humanoide", 65, 15, 15, 14, 16, 10, 10, 14, 9, 10,
                    ability("Cimitarra", "action", "weapon", "1d6+3", "slashing", 1.5, "Ataque corpo a corpo: +5 para acertar. Dois ataques."),
                    ability("Adaga", "action", "weapon", "1d4+3", "piercing", 6, "Ataque à distância: +5 para acertar.")),

            entry("bugbear", "Bugbear", "1", "Humanoide", 27, 16, 14, 12, 16, 8, 11, 9, 10, 11,
                    ability("Maça-estrela", "action", "weapon", "2d8+2", "piercing", 1.5, "Ataque corpo a corpo: +4 para acertar. +2d6 dano surpresa."))
    );

    // ==========================================
    // Factory Methods
    // ==========================================

    private static BestiaryEntry entry(String id, String name, String cr, String type,
                                       int hp, int ac, int str, int dex, int con, int intel, int wis, int cha,
                                       double speed, int passivePerception, BestiaryAbility... abilities) {
        return new BestiaryEntry(id, name, cr, type, hp, ac, str, dex, con, intel, wis, cha,
                speed, passivePerception, List.of(abilities));
    }

    private static BestiaryAbility ability(String name, String type, String category,
                                            String damage, String damageType, double range, String description) {
        return new BestiaryAbility(name, type, category, damage, damageType, range, description);
    }

    // ==========================================
    // Data Classes
    // ==========================================

    public record BestiaryEntry(
            String id, String name, String cr, String type,
            int hp, int ac,
            int str, int dex, int con, int intel, int wis, int cha,
            double speed, int passivePerception,
            List<BestiaryAbility> abilities
    ) {}

    public record BestiaryAbility(
            String name, String type, String category,
            String damage, String damageType, double range, String description
    ) {}
}
