package com.blooddragons.service;

import com.blooddragons.data.Dnd5eDmgData;
import com.blooddragons.model.dto.ActionResult;
import org.springframework.stereotype.Service;

/**
 * Serviço de regras do Guia do Mestre (DMG) D&D 5e.
 * Implementa mecânicas de armadilhas, venenos, doenças, dano ambiental,
 * queda, loucura e cálculos de XP.
 */
@Service
public class DmgRulesService {

    private final DndCoreEngineService engine;
    private final DndMathService math;

    public DmgRulesService(DndCoreEngineService engine, DndMathService math) {
        this.engine = engine;
        this.math = math;
    }

    // ==========================================
    // Dano de Queda (DMG p.183 / PHB p.183)
    // ==========================================

    /**
     * Calcula o dano de queda: 1d6 concussão por 3m, máximo 20d6.
     * Criatura cai como condição "caído".
     */
    public ActionResult calculateFallDamage(double distanceMeters) {
        String dice = Dnd5eDmgData.getFallDamageDice(distanceMeters);
        if ("0".equals(dice)) {
            return ActionResult.builder()
                    .total(0).naturalRoll(0).modifiers(0).isCritical(false)
                    .log("Queda de " + distanceMeters + "m — sem dano (< 3m)")
                    .build();
        }
        ActionResult dmg = engine.calculateDamage(dice, 0, 0);
        return ActionResult.builder()
                .total(dmg.getTotal()).naturalRoll(dmg.getNaturalRoll())
                .modifiers(0).isCritical(false)
                .log("Queda de " + distanceMeters + "m — " + dice + " concussão: " + dmg.getLog() + " | Condição: Caído")
                .build();
    }

    // ==========================================
    // Testes de Resistência de Armadilhas (DMG p.121)
    // ==========================================

    /**
     * Resolve um teste de resistência contra uma armadilha.
     * @param attributeScore valor do atributo (ex: DEX 14)
     * @param profBonus bônus de proficiência
     * @param isProficient se é proficiente no saving throw
     * @param trapDC CD da armadilha
     * @param damageDice dados de dano da armadilha (ex: "4d10")
     * @param halfOnSuccess se o dano é reduzido à metade no sucesso
     */
    public TrapResult resolveTrapSave(int attributeScore, int profBonus, boolean isProficient,
                                       int trapDC, String damageDice, boolean halfOnSuccess) {
        int mod = math.calculateModifier(attributeScore);
        ActionResult save = engine.executeSavingThrow(mod, profBonus, isProficient, false, false, 0);
        boolean success = save.getTotal() >= trapDC;

        ActionResult damage = null;
        if (damageDice != null && !damageDice.isBlank()) {
            double multiplier = success && halfOnSuccess ? 0.5 : (success ? 0 : 1.0);
            if (multiplier > 0) {
                damage = engine.calculateDamage(damageDice, 0, 0, multiplier, false);
            }
        }

        StringBuilder log = new StringBuilder("Teste de Resistência vs CD " + trapDC + ": " + save.getLog());
        log.append(success ? " → SUCESSO!" : " → FALHA!");
        if (damage != null) {
            log.append("\n⚠️ Dano: ").append(damage.getLog());
        } else if (success && damageDice != null) {
            log.append("\n🛡️ Evitou o dano!");
        }

        return new TrapResult(success, save, damage, log.toString());
    }

    public record TrapResult(boolean saved, ActionResult saveRoll, ActionResult damage, String log) {}

    // ==========================================
    // Teste de Veneno (DMG p.262-263)
    // ==========================================

    /**
     * Resolve um teste de resistência contra veneno.
     * @param conScore valor de Constituição
     * @param profBonus bônus de proficiência
     * @param isProfConSave proficiente em save de CON
     * @param poisonName nome do veneno (para lookup)
     */
    public PoisonResult resolvePoisonSave(int conScore, int profBonus, boolean isProfConSave, String poisonName) {
        var poison = Dnd5eDmgData.VENENOS.stream()
                .filter(p -> p.name().equalsIgnoreCase(poisonName))
                .findFirst()
                .orElse(null);

        if (poison == null) {
            return new PoisonResult(true, null, null, "Veneno '" + poisonName + "' não encontrado no compêndio.");
        }

        int mod = math.calculateModifier(conScore);
        ActionResult save = engine.executeSavingThrow(mod, profBonus, isProfConSave, false, false, 0);
        boolean success = save.getTotal() >= poison.saveDC();

        ActionResult damage = null;
        if (poison.damage() != null && !poison.damage().isBlank()) {
            double mult = success ? 0.5 : 1.0;
            damage = engine.calculateDamage(poison.damage(), 0, 0, mult, false);
        }

        StringBuilder log = new StringBuilder("☠️ Veneno: " + poison.name() + " (" + poison.type() + ")")
                .append("\nTeste de Resistência CON CD ").append(poison.saveDC()).append(": ").append(save.getLog())
                .append(success ? " → SUCESSO!" : " → FALHA!");
        if (damage != null) {
            log.append("\n💀 Dano: ").append(damage.getLog());
        }
        if (!success) {
            log.append("\n🔴 Efeito: ").append(poison.effect());
            log.append(" (Duração: ").append(poison.duration()).append(")");
        }

        return new PoisonResult(success, save, damage, log.toString());
    }

    public record PoisonResult(boolean saved, ActionResult saveRoll, ActionResult damage, String log) {}

    // ==========================================
    // Dano Ambiental Improvisado (DMG p.254)
    // ==========================================

    /**
     * Rola dano ambiental/improvisado baseado na gravidade e nível.
     */
    public ActionResult rollEnvironmentalDamage(int characterLevel, String severity) {
        String dice = Dnd5eDmgData.getDamageSeverityDice(characterLevel, severity);
        ActionResult dmg = engine.calculateDamage(dice, 0, 0);
        String sevLabel = switch (severity) {
            case "nuisance" -> "Inconveniente";
            case "dangerous" -> "Perigoso";
            case "deadly" -> "Mortal";
            default -> severity;
        };
        return ActionResult.builder()
                .total(dmg.getTotal()).naturalRoll(dmg.getNaturalRoll())
                .modifiers(0).isCritical(false)
                .log("Dano Ambiental (" + sevLabel + ", Nível " + characterLevel + "): " + dice + " → " + dmg.getLog())
                .build();
    }

    // ==========================================
    // XP por Nível de Desafio (DMG p.280)
    // ==========================================

    /**
     * Calcula XP dividido igualmente entre membros do grupo.
     */
    public XpResult calculateEncounterXP(String[] challengeRatings, int partySize) {
        int totalXP = 0;
        StringBuilder details = new StringBuilder();
        for (String cr : challengeRatings) {
            int xp = Dnd5eDmgData.getXpByCR(cr.trim());
            totalXP += xp;
            details.append("ND ").append(cr).append(": ").append(xp).append(" XP\n");
        }
        int perPlayer = partySize > 0 ? totalXP / partySize : totalXP;
        details.append("---\nTotal: ").append(totalXP).append(" XP")
                .append("\nPor jogador (").append(partySize).append("): ").append(perPlayer).append(" XP");
        return new XpResult(totalXP, perPlayer, partySize, details.toString());
    }

    public record XpResult(int totalXP, int perPlayerXP, int partySize, String log) {}

    // ==========================================
    // Alvos em Área de Efeito sem Grid (DMG p.255)
    // ==========================================

    /**
     * Estima alvos em uma AoE sem grid/miniatura.
     */
    public int estimateAoeTargets(String shape, double sizeMeters) {
        return Dnd5eDmgData.estimateAoeTargets(shape, sizeMeters);
    }

    // ==========================================
    // Sobrevivência (DMG p.109-111)
    // ==========================================

    /**
     * Calcula dias que uma criatura pode ficar sem comida.
     */
    public int daysSurviveWithoutFood(int conScore) {
        return Dnd5eDmgData.daysSurviveWithoutFood(math.calculateModifier(conScore));
    }

    /**
     * Resolve teste de forrageamento.
     * @param wisMod modificador de Sabedoria
     * @param profBonus bônus de proficiência (se proficiente em Sobrevivência)
     * @param isProficient se é proficiente em Sobrevivência
     * @param dc CD baseada na disponibilidade do terreno
     */
    public ForageResult resolveForaging(int wisMod, int profBonus, boolean isProficient, int dc) {
        ActionResult check = engine.executeSavingThrow(wisMod, profBonus, isProficient, false, false, 0);
        boolean success = check.getTotal() >= dc;
        int foodFound = 0;
        if (success) {
            var roll = engine.parseAndRoll("1d6");
            foodFound = Math.max(0, roll.total() + wisMod);
        }
        String log = "Forrageamento (SAB/Sobrevivência CD " + dc + "): " + check.getLog()
                + (success ? " → Sucesso! Encontrou " + foodFound + " libras de comida"
                          : " → Falha! Não encontrou comida");
        return new ForageResult(success, foodFound, log);
    }

    public record ForageResult(boolean success, int foodPoundsFound, String log) {}

    // ==========================================
    // Objetos — CA e PV (DMG p.252)
    // ==========================================

    /**
     * Retorna CA de um objeto pelo material.
     */
    public int getObjectAC(String material) {
        return Dnd5eDmgData.getObjectAC(material);
    }

    /**
     * Retorna PV de um objeto pelo tamanho e resiliência.
     * @param size "tiny" | "small" | "medium" | "large"
     * @param resilient true se objeto é resistente
     */
    public int getObjectHP(String size, boolean resilient) {
        var hp = Dnd5eDmgData.OBJETO_PV.get(size);
        if (hp == null) return 10;
        return resilient ? hp.resilientHP() : hp.fragileHP();
    }

    /**
     * Retorna a descrição oficial do efeito de exaustão para o nível fornecido.
     */
    public String getExhaustionEffect(int level) {
        return switch (level) {
            case 1 -> "Desvantagem em testes de habilidade";
            case 2 -> "Metade do deslocamento";
            case 3 -> "Desvantagem nas jogadas de ataque e salvaguardas";
            case 4 -> "Metade dos pontos de vida máximos";
            case 5 -> "Deslocamento reduzido a 0";
            case 6 -> "Morte";
            default -> "";
        };
    }
}
