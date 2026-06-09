package com.blooddragons.data;

import java.util.List;
import java.util.Map;

/**
 * Dados estáticos do Guia do Mestre (DMG) D&D 5e.
 * Armadilhas, venenos, doenças, loucura, dano ambiental, XP por ND, objetos.
 */
public class Dnd5eDmgData {

    // =============================
    // XP por Nível de Desafio (ND)
    // =============================

    public record CrXp(String cr, int xp) {}

    public static final List<CrXp> XP_POR_ND = List.of(
        new CrXp("0", 10), new CrXp("1/8", 25), new CrXp("1/4", 50),
        new CrXp("1/2", 100), new CrXp("1", 200), new CrXp("2", 450),
        new CrXp("3", 700), new CrXp("4", 1100), new CrXp("5", 1800),
        new CrXp("6", 2300), new CrXp("7", 2900), new CrXp("8", 3900),
        new CrXp("9", 5000), new CrXp("10", 5900), new CrXp("11", 7200),
        new CrXp("12", 8400), new CrXp("13", 10000), new CrXp("14", 11500),
        new CrXp("15", 13000), new CrXp("16", 15000), new CrXp("17", 18000),
        new CrXp("18", 20000), new CrXp("19", 22000), new CrXp("20", 25000),
        new CrXp("21", 33000), new CrXp("22", 41000), new CrXp("23", 50000),
        new CrXp("24", 62000), new CrXp("25", 75000), new CrXp("26", 90000),
        new CrXp("27", 105000), new CrXp("28", 120000), new CrXp("29", 135000),
        new CrXp("30", 155000)
    );

    public static int getXpByCR(String cr) {
        return XP_POR_ND.stream()
                .filter(e -> e.cr().equals(cr))
                .findFirst()
                .map(CrXp::xp)
                .orElse(0);
    }

    // =============================
    // Classes de Dificuldade Típicas
    // =============================

    public static final Map<String, Integer> CDS_TIPICAS = Map.of(
        "muito_facil", 5,
        "facil", 10,
        "moderada", 15,
        "dificil", 20,
        "muito_dificil", 25,
        "quase_impossivel", 30
    );

    // =============================
    // Dano Improvisado
    // =============================

    public record ImprovisedDamage(String dice, String examples) {}

    public static final List<ImprovisedDamage> DANO_IMPROVISADO = List.of(
        new ImprovisedDamage("1d10", "Brasa, estante caindo, agulha envenenada"),
        new ImprovisedDamage("2d10", "Relâmpago, fogueira"),
        new ImprovisedDamage("4d10", "Túnel desmoronando, tanque de ácido"),
        new ImprovisedDamage("10d10", "Paredes se fechando, lâminas giratórias, rio de lava"),
        new ImprovisedDamage("18d10", "Imerso em lava, fortaleza voadora em queda"),
        new ImprovisedDamage("24d10", "Redemoinho de fogo elemental, mandíbulas divinas")
    );

    // =============================
    // Gravidade do Dano por Nível
    // =============================

    /**
     * Retorna os dados de dano baseado no nível do personagem e gravidade.
     * @param level nível do personagem (1-20)
     * @param severity "nuisance" | "dangerous" | "deadly"
     * @return string de dados (ex: "2d10")
     */
    public static String getDamageSeverityDice(int level, String severity) {
        if (level <= 4) {
            return switch (severity) {
                case "nuisance" -> "1d10";
                case "dangerous" -> "2d10";
                case "deadly" -> "4d10";
                default -> "1d10";
            };
        } else if (level <= 10) {
            return switch (severity) {
                case "nuisance" -> "2d10";
                case "dangerous" -> "4d10";
                case "deadly" -> "10d10";
                default -> "2d10";
            };
        } else if (level <= 16) {
            return switch (severity) {
                case "nuisance" -> "4d10";
                case "dangerous" -> "10d10";
                case "deadly" -> "18d10";
                default -> "4d10";
            };
        } else {
            return switch (severity) {
                case "nuisance" -> "10d10";
                case "dangerous" -> "18d10";
                case "deadly" -> "24d10";
                default -> "10d10";
            };
        }
    }

    // =============================
    // Armadilhas — CDs e Bônus de Ataque
    // =============================

    public record TrapStats(int saveDCMin, int saveDCMax, int attackBonusMin, int attackBonusMax) {}

    public static final Map<String, TrapStats> TRAP_SEVERITY = Map.of(
        "nuisance", new TrapStats(10, 11, 3, 5),
        "dangerous", new TrapStats(12, 15, 6, 8),
        "deadly", new TrapStats(16, 20, 9, 12)
    );

    // =============================
    // Venenos
    // =============================

    public record Poison(String name, String type, int priceGp, int saveDC,
                         String damage, String effect, String duration) {}

    public static final List<Poison> VENENOS = List.of(
        new Poison("Essência de Éter", "inhalation", 300, 15, null,
                "Envenenado, inconsciente (acorda com dano)", "8 horas"),
        new Poison("Lágrimas da Meia-Noite", "ingestion", 1500, 17, "9d6",
                "Dano de veneno à meia-noite", "instantâneo"),
        new Poison("Malícia", "inhalation", 250, 15, null,
                "Envenenado, cego", "1 hora"),
        new Poison("Muco de Verme da Carniça", "contact", 200, 13, null,
                "Envenenado, paralisado (repete save/turno)", "1 minuto"),
        new Poison("Óleo de Taggit", "contact", 400, 13, null,
                "Envenenado, inconsciente (acorda com dano)", "24 horas"),
        new Poison("Sangue de Assassino", "ingestion", 150, 10, "1d12",
                "Dano de veneno + envenenado", "24 horas"),
        new Poison("Sérum da Verdade", "ingestion", 150, 11, null,
                "Envenenado, não pode mentir", "1 hora"),
        new Poison("Tintura Pálida", "ingestion", 250, 16, "1d6",
                "Dano de veneno recorrente (24h), incurável até 7 sucessos", "até cura"),
        new Poison("Torpor", "ingestion", 600, 15, null,
                "Envenenado, incapacitado", "4d6 horas"),
        new Poison("Vapores Causticantes de Othur", "inhalation", 500, 13, "3d6",
                "Dano de veneno + 1d6/turno até 3 sucessos", "até cura"),
        new Poison("Veneno de Serpente", "injury", 200, 11, "3d6",
                "Dano de veneno (metade no sucesso)", "instantâneo"),
        new Poison("Veneno de Verme Púrpura", "injury", 2000, 19, "12d6",
                "Dano de veneno (metade no sucesso)", "instantâneo"),
        new Poison("Veneno de Wyvern", "injury", 1200, 15, "7d6",
                "Dano de veneno (metade no sucesso)", "instantâneo"),
        new Poison("Veneno Drow", "injury", 200, 13, null,
                "Envenenado (falha por 5+ → inconsciente)", "1 hora")
    );

    // =============================
    // Doenças
    // =============================

    public record Disease(String name, String transmission, int saveDC, String saveAttr,
                          String incubation, String symptoms, String cure) {}

    public static final List<Disease> DOENCAS = List.of(
        new Disease("Febre Tagarelante", "Contato com infectado",
                13, "con", "1d4 horas",
                "Exaustão, riso insano (1d10 psíquico + incapacitado 1min em combate/dano/medo)",
                "Descanso longo: CON CD 13, sucesso reduz CD em 1d6. CD 0 = curado. 3 falhas = loucura permanente"),
        new Disease("Praga do Esgoto", "Mordida ou contato com dejetos",
                11, "con", "1d4 dias",
                "Exaustão, Dados de Vida recuperam metade, descanso longo não recupera PV",
                "Descanso longo: CON CD 11. Sucesso = -1 exaustão. Exaustão < 1 = curado"),
        new Disease("Decomposição Ocular", "Beber água contaminada",
                15, "con", "1 dia",
                "-1 penalidade ataques/saves visuais por descanso longo. -5 = cego",
                "Restauração menor, cura completa, ou 3 doses de Eufrásia")
    );

    // =============================
    // Objetos — CA por substância
    // =============================

    public static final Map<String, Integer> OBJETO_CA = Map.ofEntries(
        Map.entry("tecido", 11), Map.entry("papel", 11), Map.entry("corda", 11),
        Map.entry("cristal", 13), Map.entry("vidro", 13), Map.entry("gelo", 13),
        Map.entry("madeira", 15), Map.entry("osso", 15),
        Map.entry("pedra", 17),
        Map.entry("ferro", 19), Map.entry("aço", 19)
    );

    // Mitral e Adamante precisam ser adicionados separadamente pois Map.of tem limite de 10
    public static int getObjectAC(String material) {
        if ("mitral".equals(material)) return 21;
        if ("adamante".equals(material)) return 23;
        return OBJETO_CA.getOrDefault(material, 15);
    }

    // =============================
    // Objetos — PV por tamanho
    // =============================

    public record ObjectHP(int fragileHP, String fragileDice, int resilientHP, String resilientDice) {}

    public static final Map<String, ObjectHP> OBJETO_PV = Map.of(
        "tiny", new ObjectHP(2, "1d4", 5, "2d4"),
        "small", new ObjectHP(3, "1d6", 10, "3d6"),
        "medium", new ObjectHP(4, "1d8", 18, "4d8"),
        "large", new ObjectHP(5, "1d10", 27, "5d10")
    );

    // =============================
    // Dano de Queda
    // =============================

    /**
     * Calcula dano de queda conforme DMG: 1d6 por 3m, máximo 20d6.
     * @param distanceMeters distância da queda em metros
     * @return string de dados de dano
     */
    public static String getFallDamageDice(double distanceMeters) {
        int d6Count = (int) Math.min(20, Math.floor(distanceMeters / 3.0));
        return d6Count > 0 ? d6Count + "d6" : "0";
    }

    // =============================
    // Alvos em Áreas de Efeito (sem grid)
    // =============================

    /**
     * Estima quantidade de alvos para AoE sem grid conforme DMG p.255.
     */
    public static int estimateAoeTargets(String shape, double sizeMeters) {
        return switch (shape.toLowerCase()) {
            case "cone" -> (int) Math.ceil(sizeMeters / 3.0);
            case "cube", "square" -> (int) Math.ceil(sizeMeters / 1.5);
            case "cylinder", "sphere", "circle" -> (int) Math.ceil(sizeMeters / 1.5);
            case "line" -> (int) Math.ceil(sizeMeters / 9.0);
            default -> 1;
        };
    }

    // =============================
    // Construção de Itens Mágicos
    // =============================

    public record MagicItemCrafting(String rarity, int costGp, int minLevel, int daysToCreate) {}

    public static final List<MagicItemCrafting> ITEM_CRAFTING = List.of(
        new MagicItemCrafting("common", 100, 3, 4),       // 100/25 = 4 dias
        new MagicItemCrafting("uncommon", 500, 5, 20),     // 500/25 = 20 dias
        new MagicItemCrafting("rare", 5000, 9, 200),       // 5000/25 = 200 dias
        new MagicItemCrafting("very_rare", 50000, 13, 2000),
        new MagicItemCrafting("legendary", 500000, 17, 20000)
    );

    // =============================
    // Sobrevivência — Comida e Água
    // =============================

    /** Libras de comida necessárias por dia */
    public static final double FOOD_PER_DAY_LB = 1.0; // 0.5 kg ≈ 1 lb
    /** Litros de água necessários por dia (normal) */
    public static final double WATER_PER_DAY_L = 4.0;
    /** Litros de água necessários por dia (clima quente) */
    public static final double WATER_HOT_PER_DAY_L = 8.0;

    /**
     * Dias que uma criatura pode ficar sem comer.
     * @param conMod modificador de Constituição
     * @return dias sem comida antes de sofrer exaustão
     */
    public static int daysSurviveWithoutFood(int conMod) {
        return Math.max(1, 3 + conMod);
    }
}
