package com.blooddragons.data;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
import java.util.Map;

/**
 * Dados completos de raças D&D 5e extraídos do Livro do Jogador.
 * Inclui sub-raças, traços raciais, proficiências e magias inatas.
 */
public class Dnd5eRaceData {

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class Race {
        private String id;
        private String name;
        private String icon;
        private String size; // "medium" | "small"
        private double speed; // metros
        private int darkvision; // metros (0 se não possuir)
        private Map<String, Integer> abilityBonuses; // ex: {"con": 2}
        private List<String> languages;
        private List<String> weaponProficiencies;
        private List<String> armorProficiencies;
        private List<String> toolProficiencies;
        private List<String> skillProficiencies;
        private List<RacialTrait> traits;
        private List<InnateSpell> innateSpells;
        private List<SubRace> subRaces;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class SubRace {
        private String id;
        private String name;
        private Map<String, Integer> abilityBonuses;
        private Double speedOverride; // nulo se não substituir
        private Integer darkvisionOverride;
        private List<String> weaponProficiencies;
        private List<String> armorProficiencies;
        private List<String> skillProficiencies;
        private List<RacialTrait> traits;
        private List<InnateSpell> innateSpells;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class RacialTrait {
        private String id;
        private String name;
        private String description;
        private String mechanicType;
        // Tipos: "advantage_save", "resistance", "reroll_ones", "extra_hp",
        //        "extra_proficiency_bonus", "hide_in_nature", "move_through_larger",
        //        "heavy_weapon_disadvantage", "immunity", "unarmored_speed"
        private String targetAttribute; // ex: "poison" para resistência
        private String condition; // condição opcional para ativação
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class InnateSpell {
        private String spellId;
        private String spellName;
        private int unlockedAtLevel; // 1 para truques
        private int usesPerDay; // 0 para truques (ilimitado)
        private String castingAbility; // "int", "cha", "wis"
    }

    // ==========================================
    // DADOS ESTÁTICOS — TODAS AS 9 RAÇAS
    // ==========================================

    public static final List<Race> RACES = List.of(
        // 1. ANÃO
        Race.builder()
            .id("anao").name("Anão").icon("hardware").size("medium").speed(7.5).darkvision(18)
            .abilityBonuses(Map.of("con", 2))
            .languages(List.of("Comum", "Anão"))
            .weaponProficiencies(List.of("Machado de Batalha", "Machado de Mão", "Martelo de Arremesso", "Martelo de Guerra"))
            .armorProficiencies(List.of()).toolProficiencies(List.of("Escolha: Ferreiro, Cervejeiro ou Pedreiro"))
            .skillProficiencies(List.of())
            .traits(List.of(
                RacialTrait.builder().id("resiliencia_ana").name("Resiliência Anã")
                    .description("Vantagem em testes de resistência contra veneno. Resistência a dano de veneno.")
                    .mechanicType("advantage_save").targetAttribute("poison").build(),
                RacialTrait.builder().id("especializacao_rochas").name("Especialização em Rochas")
                    .description("Dobro do bônus de proficiência em testes de História sobre trabalhos em pedra.")
                    .mechanicType("extra_proficiency_bonus").targetAttribute("history_stonework").build(),
                RacialTrait.builder().id("velocidade_anao").name("Deslocamento Anão")
                    .description("Deslocamento não é reduzido por armadura pesada.")
                    .mechanicType("unarmored_speed").build()
            ))
            .innateSpells(List.of())
            .subRaces(List.of(
                SubRace.builder().id("anao_colina").name("Anão da Colina")
                    .abilityBonuses(Map.of("wis", 1))
                    .traits(List.of(RacialTrait.builder().id("tenacidade_ana").name("Tenacidade Anã")
                        .description("+1 PV máximo por nível.").mechanicType("extra_hp").build()))
                    .innateSpells(List.of()).build(),
                SubRace.builder().id("anao_montanha").name("Anão da Montanha")
                    .abilityBonuses(Map.of("str", 2))
                    .armorProficiencies(List.of("light", "medium"))
                    .traits(List.of()).innateSpells(List.of()).build()
            )).build(),

        // 2. ELFO
        Race.builder()
            .id("elfo").name("Elfo").icon("park").size("medium").speed(9).darkvision(18)
            .abilityBonuses(Map.of("dex", 2))
            .languages(List.of("Comum", "Élfico"))
            .weaponProficiencies(List.of()).armorProficiencies(List.of()).toolProficiencies(List.of())
            .skillProficiencies(List.of("Percepção"))
            .traits(List.of(
                RacialTrait.builder().id("ancestralidade_feerica").name("Ancestralidade Feérica")
                    .description("Vantagem contra ser enfeitiçado. Imunidade a sono mágico.")
                    .mechanicType("advantage_save").targetAttribute("charmed").build(),
                RacialTrait.builder().id("transe").name("Transe")
                    .description("Descanso longo em 4 horas de meditação.").mechanicType("passive").build()
            ))
            .innateSpells(List.of())
            .subRaces(List.of(
                SubRace.builder().id("alto_elfo").name("Alto Elfo")
                    .abilityBonuses(Map.of("int", 1))
                    .weaponProficiencies(List.of("Espada Longa", "Espada Curta", "Arco Longo", "Arco Curto"))
                    .traits(List.of(RacialTrait.builder().id("truque_mago").name("Truque de Mago")
                        .description("1 truque da lista de Mago (Inteligência).").mechanicType("cantrip_choice").targetAttribute("int").build()))
                    .innateSpells(List.of()).build(),
                SubRace.builder().id("elfo_floresta").name("Elfo da Floresta")
                    .abilityBonuses(Map.of("wis", 1)).speedOverride(10.5)
                    .weaponProficiencies(List.of("Espada Longa", "Espada Curta", "Arco Longo", "Arco Curto"))
                    .traits(List.of(RacialTrait.builder().id("mascara_natureza").name("Máscara da Natureza")
                        .description("Pode se esconder em folhagem leve, chuva, neve ou névoa.")
                        .mechanicType("hide_in_nature").build()))
                    .innateSpells(List.of()).build(),
                SubRace.builder().id("drow").name("Drow (Elfo Negro)")
                    .abilityBonuses(Map.of("cha", 1)).darkvisionOverride(36)
                    .weaponProficiencies(List.of("Rapieira", "Espada Curta", "Besta de Mão"))
                    .traits(List.of(RacialTrait.builder().id("sensibilidade_solar").name("Sensibilidade à Luz Solar")
                        .description("Desvantagem em ataques e Percepção (visão) sob luz solar direta.")
                        .mechanicType("sunlight_sensitivity").build()))
                    .innateSpells(List.of(
                        InnateSpell.builder().spellId("dancing_lights").spellName("Globos de Luz").unlockedAtLevel(1).usesPerDay(0).castingAbility("cha").build(),
                        InnateSpell.builder().spellId("faerie_fire").spellName("Fogo das Fadas").unlockedAtLevel(3).usesPerDay(1).castingAbility("cha").build(),
                        InnateSpell.builder().spellId("darkness").spellName("Escuridão").unlockedAtLevel(5).usesPerDay(1).castingAbility("cha").build()
                    )).build()
            )).build(),

        // 3. HALFLING
        Race.builder()
            .id("halfling").name("Halfling").icon("child_care").size("small").speed(7.5).darkvision(0)
            .abilityBonuses(Map.of("dex", 2))
            .languages(List.of("Comum", "Halfling"))
            .weaponProficiencies(List.of()).armorProficiencies(List.of()).toolProficiencies(List.of())
            .skillProficiencies(List.of())
            .traits(List.of(
                RacialTrait.builder().id("sorte").name("Sorte")
                    .description("Re-rola 1 natural no d20 de ataque, teste ou save.").mechanicType("reroll_ones").build(),
                RacialTrait.builder().id("bravura").name("Bravura")
                    .description("Vantagem contra ser amedrontado.").mechanicType("advantage_save").targetAttribute("frightened").build(),
                RacialTrait.builder().id("agilidade_halfling").name("Agilidade Halfling")
                    .description("Move-se pelo espaço de criaturas maiores.").mechanicType("move_through_larger").build(),
                RacialTrait.builder().id("armas_pesadas_desv").name("Armas Pesadas")
                    .description("Desvantagem com armas Pesadas (tamanho Pequeno).")
                    .mechanicType("heavy_weapon_disadvantage").build()
            ))
            .innateSpells(List.of())
            .subRaces(List.of(
                SubRace.builder().id("pes_leves").name("Pés Leves")
                    .abilityBonuses(Map.of("cha", 1))
                    .traits(List.of(RacialTrait.builder().id("furtividade_natural").name("Furtividade Natural")
                        .description("Pode se esconder atrás de criatura Média+.").mechanicType("hide_behind_creature").build()))
                    .innateSpells(List.of()).build(),
                SubRace.builder().id("robusto").name("Robusto")
                    .abilityBonuses(Map.of("con", 1))
                    .traits(List.of(RacialTrait.builder().id("resiliencia_robusta").name("Resiliência Robusta")
                        .description("Vantagem contra veneno. Resistência a dano de veneno.")
                        .mechanicType("advantage_save").targetAttribute("poison").build()))
                    .innateSpells(List.of()).build()
            )).build(),

        // 4. HUMANO
        Race.builder()
            .id("humano").name("Humano").icon("person").size("medium").speed(9).darkvision(0)
            .abilityBonuses(Map.of("str", 1, "dex", 1, "con", 1, "int", 1, "wis", 1, "cha", 1))
            .languages(List.of("Comum", "Escolha 1"))
            .weaponProficiencies(List.of()).armorProficiencies(List.of()).toolProficiencies(List.of())
            .skillProficiencies(List.of())
            .traits(List.of()).innateSpells(List.of())
            .subRaces(List.of()).build(),

        // 5. DRACONATO
        Race.builder()
            .id("draconato").name("Draconato").icon("local_fire_department").size("medium").speed(9).darkvision(0)
            .abilityBonuses(Map.of("str", 2, "cha", 1))
            .languages(List.of("Comum", "Dracônico"))
            .weaponProficiencies(List.of()).armorProficiencies(List.of()).toolProficiencies(List.of())
            .skillProficiencies(List.of())
            .traits(List.of(
                RacialTrait.builder().id("arma_sopro").name("Arma de Sopro")
                    .description("Ataque em área baseado na ancestralidade. CD = 8 + mod.CON + prof. Dano: 2d6 (escala).")
                    .mechanicType("breath_weapon").build(),
                RacialTrait.builder().id("resistencia_draconica").name("Resistência Dracônica")
                    .description("Resistência ao tipo de dano da ancestralidade.")
                    .mechanicType("resistance").build()
            ))
            .innateSpells(List.of())
            .subRaces(List.of()).build(),

        // 6. GNOMO
        Race.builder()
            .id("gnomo").name("Gnomo").icon("lightbulb").size("small").speed(7.5).darkvision(18)
            .abilityBonuses(Map.of("int", 2))
            .languages(List.of("Comum", "Gnômico"))
            .weaponProficiencies(List.of()).armorProficiencies(List.of()).toolProficiencies(List.of())
            .skillProficiencies(List.of())
            .traits(List.of(
                RacialTrait.builder().id("esperteza_gnomica").name("Esperteza Gnômica")
                    .description("Vantagem em saves de INT, SAB e CAR contra magia.")
                    .mechanicType("advantage_save").targetAttribute("magic_mental").build(),
                RacialTrait.builder().id("armas_pesadas_desv_gnomo").name("Armas Pesadas")
                    .description("Desvantagem com armas Pesadas (tamanho Pequeno).")
                    .mechanicType("heavy_weapon_disadvantage").build()
            ))
            .innateSpells(List.of())
            .subRaces(List.of(
                SubRace.builder().id("gnomo_floresta").name("Gnomo da Floresta")
                    .abilityBonuses(Map.of("dex", 1))
                    .innateSpells(List.of(InnateSpell.builder().spellId("minor_illusion").spellName("Ilusão Menor")
                        .unlockedAtLevel(1).usesPerDay(0).castingAbility("int").build()))
                    .traits(List.of(RacialTrait.builder().id("falar_animais").name("Falar com Animais Pequenos")
                        .description("Comunica-se com animais Pequenos ou menores.").mechanicType("passive").build()))
                    .build(),
                SubRace.builder().id("gnomo_rochas").name("Gnomo das Rochas")
                    .abilityBonuses(Map.of("con", 1))
                    .traits(List.of(
                        RacialTrait.builder().id("conhecimento_artifice").name("Conhecimento de Artífice")
                            .description("Dobro prof em História sobre itens mágicos/tecnológicos.")
                            .mechanicType("extra_proficiency_bonus").targetAttribute("history_magic_items").build(),
                        RacialTrait.builder().id("engenhoqueiro").name("Engenhoqueiro")
                            .description("Cria dispositivos mecânicos Miúdos.").mechanicType("passive").build()
                    )).innateSpells(List.of()).build()
            )).build(),

        // 7. MEIO-ELFO
        Race.builder()
            .id("meio_elfo").name("Meio-Elfo").icon("diversity_3").size("medium").speed(9).darkvision(18)
            .abilityBonuses(Map.of("cha", 2)) // +1 em dois outros à escolha (tratado na criação)
            .languages(List.of("Comum", "Élfico", "Escolha 1"))
            .weaponProficiencies(List.of()).armorProficiencies(List.of()).toolProficiencies(List.of())
            .skillProficiencies(List.of("Escolha 2"))
            .traits(List.of(
                RacialTrait.builder().id("ancestralidade_feerica_me").name("Ancestralidade Feérica")
                    .description("Vantagem contra enfeitiçado. Imunidade a sono mágico.")
                    .mechanicType("advantage_save").targetAttribute("charmed").build()
            ))
            .innateSpells(List.of())
            .subRaces(List.of()).build(),

        // 8. MEIO-ORC
        Race.builder()
            .id("meio_orc").name("Meio-Orc").icon("fitness_center").size("medium").speed(9).darkvision(18)
            .abilityBonuses(Map.of("str", 2, "con", 1))
            .languages(List.of("Comum", "Orc"))
            .weaponProficiencies(List.of()).armorProficiencies(List.of()).toolProficiencies(List.of())
            .skillProficiencies(List.of("Intimidação"))
            .traits(List.of(
                RacialTrait.builder().id("resistencia_implacavel").name("Resistência Implacável")
                    .description("Ao cair a 0 PV (sem morrer), cai a 1 PV. 1x/descanso longo.")
                    .mechanicType("relentless_endurance").build(),
                RacialTrait.builder().id("ataques_selvagens").name("Ataques Selvagens")
                    .description("Crítico corpo a corpo: +1 dado de dano da arma.")
                    .mechanicType("savage_attacks").build()
            ))
            .innateSpells(List.of())
            .subRaces(List.of()).build(),

        // 9. TIEFLING
        Race.builder()
            .id("tiefling").name("Tiefling").icon("whatshot").size("medium").speed(9).darkvision(18)
            .abilityBonuses(Map.of("cha", 2, "int", 1))
            .languages(List.of("Comum", "Infernal"))
            .weaponProficiencies(List.of()).armorProficiencies(List.of()).toolProficiencies(List.of())
            .skillProficiencies(List.of())
            .traits(List.of(
                RacialTrait.builder().id("resistencia_infernal").name("Resistência Infernal")
                    .description("Resistência a dano de fogo.").mechanicType("resistance").targetAttribute("fire").build()
            ))
            .innateSpells(List.of(
                InnateSpell.builder().spellId("thaumaturgy").spellName("Taumaturgia").unlockedAtLevel(1).usesPerDay(0).castingAbility("cha").build(),
                InnateSpell.builder().spellId("hellish_rebuke").spellName("Repreensão Infernal").unlockedAtLevel(3).usesPerDay(1).castingAbility("cha").build(),
                InnateSpell.builder().spellId("darkness").spellName("Escuridão").unlockedAtLevel(5).usesPerDay(1).castingAbility("cha").build()
            ))
            .subRaces(List.of()).build()
    );

    /**
     * Encontra uma raça pelo ID.
     */
    public static Race findById(String id) {
        return RACES.stream().filter(r -> r.getId().equals(id)).findFirst().orElse(null);
    }

    /**
     * Encontra uma sub-raça pelo ID dentro de uma raça.
     */
    public static SubRace findSubRace(String raceId, String subRaceId) {
        Race race = findById(raceId);
        if (race == null || race.getSubRaces() == null) return null;
        return race.getSubRaces().stream().filter(sr -> sr.getId().equals(subRaceId)).findFirst().orElse(null);
    }
}
