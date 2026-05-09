package com.blooddragons.data;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
import java.util.Map;

/**
 * Dados completos de classes D&D 5e com progressão, spell slots e habilidades.
 */
public class Dnd5eClassData {

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class ClassInfo {
        private String id;
        private String name;
        private String icon;
        private int hitDie;
        private String spellcastingAbility; // "none", "int", "wis", "cha"
        private String casterType; // "none", "full", "half", "pact"
        private List<String> primaryAttributes;
        private List<String> savingThrowProficiencies;
        private List<String> armorProficiencies;
        private List<String> weaponProficiencies;
        private int skillChoices; // quantas perícias pode escolher
        private List<String> skillOptions;
        private List<String> toolProficiencies;
        private List<ClassFeature> features;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class ClassFeature {
        private String id;
        private String name;
        private int level;
        private String description;
        private String mechanicType;
        // "rage", "unarmored_defense", "reckless_attack", "extra_attack",
        // "sneak_attack", "channel_divinity", "wild_shape", "ki",
        // "divine_smite", "fighting_style", "action_surge", "second_wind",
        // "bardic_inspiration", "metamagic", "sorcery_points", "spellbook",
        // "ability_score_improvement", "brutal_critical", "evasion"
    }

    // ==========================================
    // SPELL SLOT TABLES
    // ==========================================

    /** Spell slots para conjuradores completos (Bardo, Clérigo, Druida, Feiticeiro, Mago) */
    public static final int[][] FULL_CASTER_SLOTS = {
        //       1st 2nd 3rd 4th 5th 6th 7th 8th 9th
        /* 1 */ { 2,  0,  0,  0,  0,  0,  0,  0,  0 },
        /* 2 */ { 3,  0,  0,  0,  0,  0,  0,  0,  0 },
        /* 3 */ { 4,  2,  0,  0,  0,  0,  0,  0,  0 },
        /* 4 */ { 4,  3,  0,  0,  0,  0,  0,  0,  0 },
        /* 5 */ { 4,  3,  2,  0,  0,  0,  0,  0,  0 },
        /* 6 */ { 4,  3,  3,  0,  0,  0,  0,  0,  0 },
        /* 7 */ { 4,  3,  3,  1,  0,  0,  0,  0,  0 },
        /* 8 */ { 4,  3,  3,  2,  0,  0,  0,  0,  0 },
        /* 9 */ { 4,  3,  3,  3,  1,  0,  0,  0,  0 },
        /*10 */ { 4,  3,  3,  3,  2,  0,  0,  0,  0 },
        /*11 */ { 4,  3,  3,  3,  2,  1,  0,  0,  0 },
        /*12 */ { 4,  3,  3,  3,  2,  1,  0,  0,  0 },
        /*13 */ { 4,  3,  3,  3,  2,  1,  1,  0,  0 },
        /*14 */ { 4,  3,  3,  3,  2,  1,  1,  0,  0 },
        /*15 */ { 4,  3,  3,  3,  2,  1,  1,  1,  0 },
        /*16 */ { 4,  3,  3,  3,  2,  1,  1,  1,  0 },
        /*17 */ { 4,  3,  3,  3,  2,  1,  1,  1,  1 },
        /*18 */ { 4,  3,  3,  3,  3,  1,  1,  1,  1 },
        /*19 */ { 4,  3,  3,  3,  3,  2,  1,  1,  1 },
        /*20 */ { 4,  3,  3,  3,  3,  2,  2,  1,  1 },
    };

    /** Spell slots para meio-conjuradores (Paladino, Patrulheiro) — nível 2+ */
    public static final int[][] HALF_CASTER_SLOTS = {
        //       1st 2nd 3rd 4th 5th
        /* 1 */ { 0,  0,  0,  0,  0 },
        /* 2 */ { 2,  0,  0,  0,  0 },
        /* 3 */ { 3,  0,  0,  0,  0 },
        /* 4 */ { 3,  0,  0,  0,  0 },
        /* 5 */ { 4,  2,  0,  0,  0 },
        /* 6 */ { 4,  2,  0,  0,  0 },
        /* 7 */ { 4,  3,  0,  0,  0 },
        /* 8 */ { 4,  3,  0,  0,  0 },
        /* 9 */ { 4,  3,  2,  0,  0 },
        /*10 */ { 4,  3,  2,  0,  0 },
        /*11 */ { 4,  3,  3,  0,  0 },
        /*12 */ { 4,  3,  3,  0,  0 },
        /*13 */ { 4,  3,  3,  1,  0 },
        /*14 */ { 4,  3,  3,  1,  0 },
        /*15 */ { 4,  3,  3,  2,  0 },
        /*16 */ { 4,  3,  3,  2,  0 },
        /*17 */ { 4,  3,  3,  3,  1 },
        /*18 */ { 4,  3,  3,  3,  1 },
        /*19 */ { 4,  3,  3,  3,  2 },
        /*20 */ { 4,  3,  3,  3,  2 },
    };

    /** Bruxo: slots por nível (todos no mesmo nível de slot) */
    public static final int[][] PACT_MAGIC_SLOTS = {
        // { numSlots, slotLevel }
        /* 1 */ { 1, 1 }, /* 2 */ { 2, 1 }, /* 3 */ { 2, 2 }, /* 4 */ { 2, 2 },
        /* 5 */ { 2, 3 }, /* 6 */ { 2, 3 }, /* 7 */ { 2, 4 }, /* 8 */ { 2, 4 },
        /* 9 */ { 2, 5 }, /*10 */ { 2, 5 }, /*11 */ { 3, 5 }, /*12 */ { 3, 5 },
        /*13 */ { 3, 5 }, /*14 */ { 3, 5 }, /*15 */ { 3, 5 }, /*16 */ { 3, 5 },
        /*17 */ { 4, 5 }, /*18 */ { 4, 5 }, /*19 */ { 4, 5 }, /*20 */ { 4, 5 },
    };

    /**
     * Retorna spell slots para uma classe e nível.
     * @return array de 9 ints (slots do nível 1 ao 9)
     */
    public static int[] getSpellSlots(String casterType, int level) {
        if (level < 1 || level > 20) return new int[9];
        return switch (casterType) {
            case "full" -> FULL_CASTER_SLOTS[level - 1];
            case "half" -> {
                int[] slots = HALF_CASTER_SLOTS[level - 1];
                yield new int[]{ slots[0], slots[1], slots[2], slots[3], slots[4], 0, 0, 0, 0 };
            }
            case "pact" -> {
                int[] pact = PACT_MAGIC_SLOTS[level - 1];
                int[] result = new int[9];
                if (pact[1] > 0) result[pact[1] - 1] = pact[0];
                yield result;
            }
            default -> new int[9];
        };
    }

    // ==========================================
    // DADOS — TABELA DE ATAQUE FURTIVO
    // ==========================================

    /** Dados extras de Ataque Furtivo por nível do Ladino */
    public static int getSneakAttackDice(int rogueLevel) {
        return (rogueLevel + 1) / 2; // 1 no nível 1, 2 no nível 3, etc.
    }

    /** Dados de Fúria por nível do Bárbaro */
    public static int getRageDamage(int barbarianLevel) {
        if (barbarianLevel < 9) return 2;
        if (barbarianLevel < 16) return 3;
        return 4;
    }

    /** Usos de Fúria por nível do Bárbaro */
    public static int getRageUses(int barbarianLevel) {
        if (barbarianLevel < 3) return 2;
        if (barbarianLevel < 6) return 3;
        if (barbarianLevel < 12) return 4;
        if (barbarianLevel < 17) return 5;
        if (barbarianLevel < 20) return 6;
        return Integer.MAX_VALUE; // Ilimitado no nível 20
    }

    /** Dados extras de Crítico Brutal do Bárbaro */
    public static int getBrutalCriticalDice(int barbarianLevel) {
        if (barbarianLevel < 9) return 0;
        if (barbarianLevel < 13) return 1;
        if (barbarianLevel < 17) return 2;
        return 3;
    }

    /** Dado de Artes Marciais do Monge */
    public static String getMartialArtsDie(int monkLevel) {
        if (monkLevel < 5) return "1d4";
        if (monkLevel < 11) return "1d6";
        if (monkLevel < 17) return "1d8";
        return "1d10";
    }

    /** Dado de Inspiração Bárdica */
    public static String getBardicInspirationDie(int bardLevel) {
        if (bardLevel < 5) return "1d6";
        if (bardLevel < 10) return "1d8";
        if (bardLevel < 15) return "1d10";
        return "1d12";
    }

    /** Quantidade de ataques extras pelo nível do Guerreiro */
    public static int getFighterExtraAttacks(int fighterLevel) {
        if (fighterLevel < 5) return 1;
        if (fighterLevel < 11) return 2;
        if (fighterLevel < 20) return 3;
        return 4;
    }

    // ==========================================
    // PRÉ-REQUISITOS DE MULTICLASSE
    // ==========================================

    /** Retorna os atributos que precisam ser >= 13 para multiclasse */
    public static final Map<String, List<String>> MULTICLASS_PREREQUISITES = Map.ofEntries(
        Map.entry("barbaro", List.of("str")),
        Map.entry("bardo", List.of("cha")),
        Map.entry("bruxo", List.of("cha")),
        Map.entry("clerigo", List.of("wis")),
        Map.entry("druida", List.of("wis")),
        Map.entry("feiticeiro", List.of("cha")),
        Map.entry("guerreiro", List.of("str|dex")), // OR
        Map.entry("ladino", List.of("dex")),
        Map.entry("mago", List.of("int")),
        Map.entry("monge", List.of("dex", "wis")),    // AND
        Map.entry("paladino", List.of("str", "cha")),  // AND
        Map.entry("patrulheiro", List.of("dex", "wis")) // AND
    );

    // ==========================================
    // DADOS ESTÁTICOS — TODAS AS CLASSES
    // ==========================================

    public static final List<ClassInfo> CLASSES = List.of(
        cls("barbaro","Bárbaro",12,"none","none","whatshot",
            List.of("str","con"),List.of("str","con"),
            List.of("light","medium","shields"),List.of("simple","martial"),
            2,List.of("Adestrar Animais","Atletismo","Intimidação","Natureza","Percepção","Sobrevivência"),
            List.of()),
        cls("bardo","Bardo",8,"cha","full","music_note",
            List.of("cha"),List.of("dex","cha"),
            List.of("light"),List.of("simple","Besta de Mão","Espada Longa","Rapieira","Espada Curta"),
            3,List.of("Qualquer"),List.of("3 instrumentos musicais")),
        cls("bruxo","Bruxo",8,"cha","pact","dark_mode",
            List.of("cha"),List.of("wis","cha"),
            List.of("light"),List.of("simple"),
            2,List.of("Arcanismo","Enganação","História","Intimidação","Investigação","Natureza","Religião"),
            List.of()),
        cls("clerigo","Clérigo",8,"wis","full","church",
            List.of("wis"),List.of("wis","cha"),
            List.of("light","medium","shields"),List.of("simple"),
            2,List.of("História","Intuição","Medicina","Persuasão","Religião"),
            List.of()),
        cls("druida","Druida",8,"wis","full","eco",
            List.of("wis"),List.of("int","wis"),
            List.of("light","medium","shields"),
            List.of("Clava","Adaga","Dardo","Azagaia","Maça","Bordão","Cimitarra","Foice","Funda","Lança"),
            2,List.of("Arcanismo","Adestrar Animais","Intuição","Medicina","Natureza","Percepção","Religião","Sobrevivência"),
            List.of("Kit de Herbalismo")),
        cls("feiticeiro","Feiticeiro",6,"cha","full","bolt",
            List.of("cha"),List.of("con","cha"),
            List.of(),List.of("Adaga","Dardo","Funda","Bordão","Besta Leve"),
            2,List.of("Arcanismo","Enganação","Intuição","Intimidação","Persuasão","Religião"),
            List.of()),
        cls("guerreiro","Guerreiro",10,"none","none","shield",
            List.of("str","dex"),List.of("str","con"),
            List.of("light","medium","heavy","shields"),List.of("simple","martial"),
            2,List.of("Acrobacia","Adestrar Animais","Atletismo","História","Intimidação","Intuição","Percepção","Sobrevivência"),
            List.of()),
        cls("ladino","Ladino",8,"none","none","visibility_off",
            List.of("dex"),List.of("dex","int"),
            List.of("light"),List.of("simple","Besta de Mão","Espada Longa","Rapieira","Espada Curta"),
            4,List.of("Acrobacia","Atletismo","Enganação","Furtividade","Intimidação","Intuição","Investigação","Percepção","Persuasão","Prestidigitação","Atuação"),
            List.of("Ferramentas de Ladrão")),
        cls("mago","Mago",6,"int","full","auto_stories",
            List.of("int"),List.of("int","wis"),
            List.of(),List.of("Adaga","Dardo","Funda","Bordão","Besta Leve"),
            2,List.of("Arcanismo","História","Intuição","Investigação","Medicina","Religião"),
            List.of()),
        cls("monge","Monge",8,"none","none","self_improvement",
            List.of("dex","wis"),List.of("str","dex"),
            List.of(),List.of("simple","Espada Curta"),
            2,List.of("Acrobacia","Atletismo","Furtividade","História","Intuição","Religião"),
            List.of("1 ferramenta de artesão ou instrumento musical")),
        cls("paladino","Paladino",10,"cha","half","gavel",
            List.of("str","cha"),List.of("wis","cha"),
            List.of("light","medium","heavy","shields"),List.of("simple","martial"),
            2,List.of("Atletismo","Intimidação","Intuição","Medicina","Persuasão","Religião"),
            List.of()),
        cls("patrulheiro","Patrulheiro",10,"wis","half","nature_people",
            List.of("dex","wis"),List.of("str","dex"),
            List.of("light","medium","shields"),List.of("simple","martial"),
            3,List.of("Adestrar Animais","Atletismo","Furtividade","Intuição","Investigação","Natureza","Percepção","Sobrevivência"),
            List.of())
    );

    public static ClassInfo findById(String id) {
        return CLASSES.stream().filter(c -> c.getId().equals(id)).findFirst().orElse(null);
    }

    private static ClassInfo cls(String id, String name, int hd, String spell, String caster, String icon,
            List<String> primary, List<String> saves, List<String> armor, List<String> weapons,
            int skillChoices, List<String> skillOptions, List<String> tools) {
        return ClassInfo.builder().id(id).name(name).hitDie(hd).spellcastingAbility(spell)
                .casterType(caster).icon(icon).primaryAttributes(primary)
                .savingThrowProficiencies(saves).armorProficiencies(armor)
                .weaponProficiencies(weapons).skillChoices(skillChoices)
                .skillOptions(skillOptions).toolProficiencies(tools)
                .features(List.of()).build();
    }
}
