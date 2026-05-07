package com.blooddragons.data;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

/**
 * Dados estáticos de referência D&D 5e (Compêndio de Armas e Magias).
 * Migrado de: src/app/data/compendium.data.ts
 */
public class CompendiumData {

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class CompendiumWeapon {
        private String id, name, weaponType, attackType, damage, damageType;
        private List<String> properties;
        private double range;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class CompendiumSpell {
        private String id, name, damage, healing, areaShape, description;
        private int level;
        private List<String> classes;
        private double range;
    }

    public static final List<CompendiumWeapon> WEAPONS = List.of(
        w("dagger","Adaga","simple","melee","1d4","perfurante",6,List.of("finesse","light","thrown")),
        w("javelin","Azagaia","simple","melee","1d6","perfurante",9,List.of("thrown")),
        w("club","Bastão","simple","melee","1d4","pancada",1.5,List.of("light")),
        w("quarterstaff","Bordão","simple","melee","1d6","pancada",1.5,List.of("versatile")),
        w("greatclub","Clava Grande","simple","melee","1d8","pancada",1.5,List.of("two-handed")),
        w("sickle","Foice","simple","melee","1d4","cortante",1.5,List.of("light")),
        w("spear","Lança","simple","melee","1d6","perfurante",6,List.of("thrown","versatile")),
        w("mace","Maça","simple","melee","1d6","pancada",1.5,List.of()),
        w("handaxe","Machado de Mão","simple","melee","1d6","cortante",6,List.of("light","thrown")),
        w("lighthammer","Martelo Leve","simple","melee","1d4","pancada",6,List.of("light","thrown")),
        w("shortbow","Arco Curto","simple","ranged","1d6","perfurante",24,List.of("ammunition","two-handed")),
        w("lightcrossbow","Besta Leve","simple","ranged","1d8","perfurante",24,List.of("ammunition","loading","two-handed")),
        w("dart","Dardo","simple","ranged","1d4","perfurante",6,List.of("finesse","thrown")),
        w("sling","Funda","simple","ranged","1d4","pancada",9,List.of("ammunition")),
        w("halberd","Alabarda","martial","melee","1d10","cortante",3,List.of("heavy","reach","two-handed")),
        w("whip","Chicote","martial","melee","1d4","cortante",3,List.of("finesse","reach")),
        w("scimitar","Cimitarra","martial","melee","1d6","cortante",1.5,List.of("finesse","light")),
        w("shortsword","Espada Curta","martial","melee","1d6","perfurante",1.5,List.of("finesse","light")),
        w("greatsword","Espada Grande","martial","melee","2d6","cortante",1.5,List.of("heavy","two-handed")),
        w("longsword","Espada Longa","martial","melee","1d8","cortante",1.5,List.of("versatile")),
        w("glaive","Glaive","martial","melee","1d10","cortante",3,List.of("heavy","reach","two-handed")),
        w("lance","Lança de Montaria","martial","melee","1d12","perfurante",3,List.of("reach","special")),
        w("battleaxe","Machado de Batalha","martial","melee","1d8","cortante",1.5,List.of("versatile")),
        w("greataxe","Machado Grande","martial","melee","1d12","cortante",1.5,List.of("heavy","two-handed")),
        w("maul","Malho","martial","melee","2d6","pancada",1.5,List.of("heavy","two-handed")),
        w("flail","Mangual","martial","melee","1d8","pancada",1.5,List.of()),
        w("warhammer","Martelo de Guerra","martial","melee","1d8","pancada",1.5,List.of("versatile")),
        w("morningstar","Maça Estrela","martial","melee","1d8","perfurante",1.5,List.of()),
        w("warpick","Picareta de Guerra","martial","melee","1d8","perfurante",1.5,List.of()),
        w("rapier","Rapieira","martial","melee","1d8","perfurante",1.5,List.of("finesse")),
        w("trident","Tridente","martial","melee","1d6","perfurante",6,List.of("thrown","versatile")),
        w("longbow","Arco Longo","martial","ranged","1d8","perfurante",45,List.of("ammunition","heavy","two-handed")),
        w("handcrossbow","Besta de Mão","martial","ranged","1d6","perfurante",9,List.of("ammunition","light","loading")),
        w("heavycrossbow","Besta Pesada","martial","ranged","1d10","perfurante",30,List.of("ammunition","heavy","loading","two-handed")),
        w("net","Rede","martial","ranged","","",1.5,List.of("special","thrown")),
        w("blowgun","Zarabatana","martial","ranged","1","perfurante",7.5,List.of("ammunition","loading"))
    );

    public static final List<CompendiumSpell> SPELLS = List.of(
        s("firebolt","Raio de Fogo",0,List.of("Mago","Feiticeiro"),"1d10",null,null,36,"Raio de luz ígneo contra criatura ou objeto."),
        s("sacredflame","Chama Sagrada",0,List.of("Clérigo"),"1d8",null,null,18,"Luz divina desce sobre uma criatura."),
        s("eldritchblast","Rajada Mística",0,List.of("Bruxo"),"1d10",null,null,36,"Feixe de energia crepitante."),
        s("rayoffrost","Raio de Gelo",0,List.of("Mago","Feiticeiro"),"1d8",null,null,18,"Raio frígido que reduz deslocamento."),
        s("shockinggrasp","Toque Chocante",0,List.of("Mago","Feiticeiro"),"1d8",null,null,1.5,"Eletricidade da sua mão."),
        s("guidance","Orientação",0,List.of("Clérigo","Druida"),null,null,null,1.5,"+1d4 em teste de atributo."),
        s("viciousmockery","Zombaria Viciosa",0,List.of("Bardo"),"1d4",null,null,18,"Insultos mágicos com dano e desvantagem."),
        s("produceflame","Criar Chamas",0,List.of("Druida"),"1d8",null,null,9,"Chama na mão para iluminar e arremessar."),
        s("magicmissile","Mísseis Mágicos",1,List.of("Mago","Feiticeiro"),"3d4+3",null,null,36,"3 dardos que acertam automaticamente."),
        s("curewounds","Curar Ferimentos",1,List.of("Clérigo","Druida","Bardo","Paladino","Patrulheiro"),null,"1d8",null,1.5,"Cura 1d8 + mod conjuração."),
        s("healingword","Palavra Curativa",1,List.of("Clérigo","Druida","Bardo"),null,"1d4",null,18,"Ação bônus de cura à distância."),
        s("thunderwave","Onda Trovejante",1,List.of("Mago","Feiticeiro","Bardo","Druida"),"2d8",null,"circle",4.5,"Onda de força trovejante."),
        s("shield","Escudo Arcano",1,List.of("Mago","Feiticeiro"),null,null,null,0,"Reação: +5 na CA até próximo turno."),
        s("bless","Bênção",1,List.of("Clérigo","Paladino"),null,null,null,9,"+1d4 em ataques e resistências para até 3 criaturas."),
        s("guidingbolt","Raio Guiador",1,List.of("Clérigo"),"4d6",null,null,36,"Lampejo de luz com dano radiante e vantagem."),
        s("hex","Bruxa",1,List.of("Bruxo"),"1d6",null,null,27,"+1d6 dano necrótico e desvantagem em um atributo."),
        s("huntersmark","Marca do Caçador",1,List.of("Patrulheiro"),"1d6",null,null,27,"+1d6 de dano por acerto."),
        s("fireball","Bola de Fogo",3,List.of("Mago","Feiticeiro"),"8d6",null,"circle",45,"Explosão de chamas num raio de 6m.")
    );

    private static CompendiumWeapon w(String id, String name, String type, String atk, String dmg, String dt, double range, List<String> props) {
        return CompendiumWeapon.builder().id(id).name(name).weaponType(type).attackType(atk).damage(dmg).damageType(dt).range(range).properties(props).build();
    }
    private static CompendiumSpell s(String id, String name, int lvl, List<String> cls, String dmg, String heal, String area, double range, String desc) {
        return CompendiumSpell.builder().id(id).name(name).level(lvl).classes(cls).damage(dmg).healing(heal).areaShape(area).range(range).description(desc).build();
    }
}
