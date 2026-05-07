package com.blooddragons.data;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

/**
 * Dados de referência de classes, raças, alinhamentos e antecedentes D&D 5e.
 * Migrado de: src/app/data/dnd5e-options.data.ts
 */
public class Dnd5eOptionsData {

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class Dnd5eClass {
        private String id, name, spellcastingAbility, icon;
        private int hitDie;
        private List<String> primaryAttributes, weaponProficiencies, armorProficiencies;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class Dnd5eRace {
        private String id, name, icon, abilityBonuses;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class Dnd5eAlignment {
        private String id, name, shortName;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class Dnd5eBackground {
        private String id, name, description;
    }

    public static final List<Dnd5eClass> CLASSES = List.of(
        cls("barbaro","Bárbaro",12,"none","whatshot",List.of("str","con"),List.of("simple","martial"),List.of("light","medium","shields")),
        cls("bardo","Bardo",8,"cha","music_note",List.of("cha"),List.of("simple","Espada Longa","Rapieira","Espada Curta"),List.of("light")),
        cls("bruxo","Bruxo",8,"cha","dark_mode",List.of("cha"),List.of("simple"),List.of("light")),
        cls("clerigo","Clérigo",8,"wis","church",List.of("wis"),List.of("simple"),List.of("light","medium","shields")),
        cls("druida","Druida",8,"wis","eco",List.of("wis"),List.of("simple","Cimitarra"),List.of("light","medium","shields")),
        cls("feiticeiro","Feiticeiro",6,"cha","bolt",List.of("cha"),List.of("simple"),List.of()),
        cls("guerreiro","Guerreiro",10,"none","shield",List.of("str","dex"),List.of("simple","martial"),List.of("light","medium","heavy","shields")),
        cls("ladino","Ladino",8,"none","visibility_off",List.of("dex"),List.of("simple","Besta de Mão","Espada Longa","Rapieira","Espada Curta"),List.of("light")),
        cls("mago","Mago",6,"int","auto_stories",List.of("int"),List.of("Adaga","Dardo","Funda","Bordão","Besta Leve"),List.of()),
        cls("monge","Monge",8,"none","self_improvement",List.of("dex","wis"),List.of("simple","Espada Curta"),List.of()),
        cls("paladino","Paladino",10,"cha","gavel",List.of("str","cha"),List.of("simple","martial"),List.of("light","medium","heavy","shields")),
        cls("patrulheiro","Patrulheiro",10,"wis","nature_people",List.of("dex","wis"),List.of("simple","martial"),List.of("light","medium","shields"))
    );

    public static final List<Dnd5eRace> RACES = List.of(
        Dnd5eRace.builder().id("anao").name("Anão").icon("hardware").abilityBonuses("CON +2").build(),
        Dnd5eRace.builder().id("elfo").name("Elfo").icon("park").abilityBonuses("DES +2").build(),
        Dnd5eRace.builder().id("halfling").name("Halfling").icon("child_care").abilityBonuses("DES +2").build(),
        Dnd5eRace.builder().id("humano").name("Humano").icon("person").abilityBonuses("+1 em todos").build(),
        Dnd5eRace.builder().id("draconato").name("Draconato").icon("local_fire_department").abilityBonuses("FOR +2, CAR +1").build(),
        Dnd5eRace.builder().id("gnomo").name("Gnomo").icon("lightbulb").abilityBonuses("INT +2").build(),
        Dnd5eRace.builder().id("meio-elfo").name("Meio-Elfo").icon("diversity_3").abilityBonuses("CAR +2, +1 x2").build(),
        Dnd5eRace.builder().id("meio-orc").name("Meio-Orc").icon("fitness_center").abilityBonuses("FOR +2, CON +1").build(),
        Dnd5eRace.builder().id("tiefling").name("Tiefling").icon("whatshot").abilityBonuses("CAR +2, INT +1").build()
    );

    public static final List<Dnd5eAlignment> ALIGNMENTS = List.of(
        new Dnd5eAlignment("lb","Leal e Bom","LB"),  new Dnd5eAlignment("nb","Neutro e Bom","NB"),
        new Dnd5eAlignment("cb","Caótico e Bom","CB"),new Dnd5eAlignment("ln","Leal e Neutro","LN"),
        new Dnd5eAlignment("nn","Neutro","N"),        new Dnd5eAlignment("cn","Caótico e Neutro","CN"),
        new Dnd5eAlignment("lm","Leal e Mau","LM"),  new Dnd5eAlignment("nm","Neutro e Mau","NM"),
        new Dnd5eAlignment("cm","Caótico e Mau","CM")
    );

    public static final List<Dnd5eBackground> BACKGROUNDS = List.of(
        new Dnd5eBackground("acolito","Acólito","Abrigo em templos"),
        new Dnd5eBackground("charlatao","Charlatão","Identidade falsa"),
        new Dnd5eBackground("criminoso","Criminoso / Espião","Contatos no submundo"),
        new Dnd5eBackground("artista","Artista","Performances"),
        new Dnd5eBackground("heroi","Herói do Povo","Respeito das massas"),
        new Dnd5eBackground("artesao","Artesão de Guilda","Apoio de guilda"),
        new Dnd5eBackground("eremita","Eremita","Revelação espiritual"),
        new Dnd5eBackground("nobre","Nobre","Privilégios de casta"),
        new Dnd5eBackground("forasteiro","Forasteiro","Memória para mapas"),
        new Dnd5eBackground("sabio","Sábio","Pesquisador"),
        new Dnd5eBackground("marinheiro","Marinheiro","Passagem em navios"),
        new Dnd5eBackground("soldado","Soldado","Patente militar"),
        new Dnd5eBackground("orfao","Órfão","Passagens secretas")
    );

    private static Dnd5eClass cls(String id, String name, int hd, String spell, String icon,
            List<String> primary, List<String> weapons, List<String> armor) {
        return Dnd5eClass.builder().id(id).name(name).hitDie(hd).spellcastingAbility(spell)
                .icon(icon).primaryAttributes(primary).weaponProficiencies(weapons).armorProficiencies(armor).build();
    }
}
