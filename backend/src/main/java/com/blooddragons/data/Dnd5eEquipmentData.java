package com.blooddragons.data;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
import java.util.Map;

/**
 * Dados de armaduras e condições mecânicas D&D 5e.
 */
public class Dnd5eEquipmentData {

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class Armor {
        private String id;
        private String name;
        private String type;     // "light", "medium", "heavy", "shield"
        private int baseAC;
        private int minStrength; // 0 se não houver requisito
        private boolean stealthDisadvantage;
        private double weight;   // kg
        private int cost;        // em peças de ouro
    }

    public static final List<Armor> ARMORS = List.of(
        // Armaduras Leves
        a("padded","Acolchoada","light",11,0,true,4,5),
        a("leather","Couro","light",11,0,false,5,10),
        a("studded_leather","Couro Batido","light",12,0,false,6.5,45),
        // Armaduras Médias
        a("hide","Gibão de Peles","medium",12,0,false,6,10),
        a("chain_shirt","Cota de Malha Leve","medium",13,0,false,10,50),
        a("scale_mail","Brunea","medium",14,0,true,22.5,50),
        a("breastplate","Peitoral","medium",14,0,false,10,400),
        a("half_plate","Meia-Armadura","medium",15,0,true,20,750),
        // Armaduras Pesadas
        a("ring_mail","Cota de Anéis","heavy",14,0,true,20,30),
        a("chain_mail","Cota de Malha","heavy",16,13,true,27.5,75),
        a("splint","Cota de Talas","heavy",17,15,true,30,200),
        a("plate","Placas","heavy",18,15,true,32.5,1500),
        // Escudo
        a("shield","Escudo","shield",2,0,false,3,10)
    );

    private static Armor a(String id, String name, String type, int ac, int str, boolean stealth, double w, int cost) {
        return Armor.builder().id(id).name(name).type(type).baseAC(ac).minStrength(str)
                .stealthDisadvantage(stealth).weight(w).cost(cost).build();
    }

    public static Armor findArmorById(String id) {
        return ARMORS.stream().filter(a -> a.getId().equals(id)).findFirst().orElse(null);
    }

    // ==========================================
    // CONDIÇÕES COM EFEITOS MECÂNICOS
    // ==========================================

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class ConditionEffect {
        private String id;
        private String name;
        private String icon;
        private String color;
        private boolean attackDisadvantage;
        private boolean attacksAgainstAdvantage;
        private boolean attackAdvantage;          // para invisível
        private boolean attacksAgainstDisadvantage; // para invisível
        private boolean abilityCheckDisadvantage;
        private boolean savingThrowDisadvantage;
        private boolean incapacitated;
        private double speedMultiplier;           // 1.0 = normal, 0 = imóvel
        private List<String> autoFailSaves;       // "str", "dex"
        private boolean meleeAutoHitCritical;     // inconsciente/paralisado em corpo a corpo
        private boolean cannotAct;
        private boolean cannotReact;
        private boolean prone;                    // fica caído automaticamente
    }

    public static final List<ConditionEffect> CONDITIONS = List.of(
        ConditionEffect.builder().id("grappled").name("Agarrado").icon("front_hand").color("#d97706")
            .speedMultiplier(0).build(),
        ConditionEffect.builder().id("frightened").name("Amedrontado").icon("mood_bad").color("#f59e0b")
            .attackDisadvantage(true).abilityCheckDisadvantage(true).speedMultiplier(1).build(),
        ConditionEffect.builder().id("stunned").name("Atordoado").icon("stars").color("#eab308")
            .incapacitated(true).cannotAct(true).cannotReact(true).speedMultiplier(0)
            .autoFailSaves(List.of("str","dex")).attacksAgainstAdvantage(true).build(),
        ConditionEffect.builder().id("prone").name("Caído").icon("airline_seat_flat").color("#a8a29e")
            .attackDisadvantage(true).speedMultiplier(1).build(),
            // Nota: caído tem regra especial de corpo a corpo vs distância (tratada no CombatService)
        ConditionEffect.builder().id("blinded").name("Cego").icon("visibility_off").color("#737373")
            .attackDisadvantage(true).attacksAgainstAdvantage(true).speedMultiplier(1).build(),
        ConditionEffect.builder().id("charmed").name("Enfeitiçado").icon("favorite").color("#ec4899")
            .speedMultiplier(1).build(),
        ConditionEffect.builder().id("poisoned").name("Envenenado").icon("science").color("#84cc16")
            .attackDisadvantage(true).abilityCheckDisadvantage(true).speedMultiplier(1).build(),
        ConditionEffect.builder().id("restrained").name("Impedido").icon("lock").color("#f43f5e")
            .speedMultiplier(0).attackDisadvantage(true).attacksAgainstAdvantage(true)
            .savingThrowDisadvantage(true).build(),
        ConditionEffect.builder().id("incapacitated").name("Incapacitado").icon("block").color("#ef4444")
            .incapacitated(true).cannotAct(true).cannotReact(true).speedMultiplier(1).build(),
        ConditionEffect.builder().id("unconscious").name("Inconsciente").icon("bedtime").color("#1e3a8a")
            .incapacitated(true).cannotAct(true).cannotReact(true).speedMultiplier(0).prone(true)
            .autoFailSaves(List.of("str","dex")).attacksAgainstAdvantage(true)
            .meleeAutoHitCritical(true).build(),
        ConditionEffect.builder().id("invisible").name("Invisível").icon("visibility_off").color("#94a3b8")
            .attackAdvantage(true).attacksAgainstDisadvantage(true).speedMultiplier(1).build(),
        ConditionEffect.builder().id("paralyzed").name("Paralisado").icon("pan_tool").color("#ef4444")
            .incapacitated(true).cannotAct(true).cannotReact(true).speedMultiplier(0)
            .autoFailSaves(List.of("str","dex")).attacksAgainstAdvantage(true)
            .meleeAutoHitCritical(true).build(),
        ConditionEffect.builder().id("petrified").name("Petrificado").icon("imagesearch_roller").color("#57534e")
            .incapacitated(true).cannotAct(true).cannotReact(true).speedMultiplier(0)
            .autoFailSaves(List.of("str","dex")).attacksAgainstAdvantage(true).build(),
            // Nota: petrificado tem resistência a todos os danos (tratada no CombatService)
        ConditionEffect.builder().id("deafened").name("Surdo").icon("hearing_disabled").color("#737373")
            .speedMultiplier(1).build()
    );

    public static ConditionEffect findConditionById(String id) {
        return CONDITIONS.stream().filter(c -> c.getId().equals(id)).findFirst().orElse(null);
    }

    // ==========================================
    // EXAUSTÃO
    // ==========================================

    /**
     * Retorna os efeitos acumulados para um dado nível de exaustão (1-6).
     * Nível 6 = morte.
     */
    public static Map<String, Object> getExhaustionEffects(int level) {
        return switch (level) {
            case 1 -> Map.of("abilityCheckDisadvantage", true);
            case 2 -> Map.of("abilityCheckDisadvantage", true, "speedMultiplier", 0.5);
            case 3 -> Map.of("abilityCheckDisadvantage", true, "speedMultiplier", 0.5,
                    "attackDisadvantage", true, "savingThrowDisadvantage", true);
            case 4 -> Map.of("abilityCheckDisadvantage", true, "speedMultiplier", 0.5,
                    "attackDisadvantage", true, "savingThrowDisadvantage", true, "maxHpMultiplier", 0.5);
            case 5 -> Map.of("abilityCheckDisadvantage", true, "speedMultiplier", 0.0,
                    "attackDisadvantage", true, "savingThrowDisadvantage", true, "maxHpMultiplier", 0.5);
            case 6 -> Map.of("death", true);
            default -> Map.of();
        };
    }
}
