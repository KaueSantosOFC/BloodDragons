package com.blooddragons.service;

import com.blooddragons.model.Ability;
import com.blooddragons.model.CharacterSheet;
import com.blooddragons.model.Token;
import com.blooddragons.model.dto.AttackResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class CombatServiceTest {

    private CombatService service;
    private DndCoreEngineService engine;
    private DndMathService math;

    @BeforeEach
    void setUp() {
        math = new DndMathService();
        engine = new DndCoreEngineService(math);
        service = new CombatService(engine, math);
    }

    private Token createToken(String race, String className, int str, int dex, int wis, int cha, boolean isTiefling) {
        CharacterSheet sheet = CharacterSheet.builder()
                .race(race)
                .className(className)
                .level(3)
                .proficiencyBonus(2)
                .ac(15)
                .str(str)
                .dex(dex)
                .wis(wis)
                .cha(cha)
                .hp(30)
                .maxHp(30)
                .spellcastingAbility(className.equalsIgnoreCase("Mago") ? "int" : (className.equalsIgnoreCase("Clérigo") ? "wis" : "cha"))
                .build();
        return Token.builder()
                .id("test-token")
                .name("Atacante")
                .sheet(sheet)
                .build();
    }

    private Token createTarget() {
        CharacterSheet targetSheet = CharacterSheet.builder()
                .ac(12)
                .hp(20)
                .maxHp(20)
                .build();
        return Token.builder()
                .id("target-token")
                .name("Alvo")
                .sheet(targetSheet)
                .build();
    }

    @Test
    @DisplayName("Ataque corpo-a-corpo padrão com Espada Longa usa FOR")
    void standardMeleeAttack() {
        // FOR 16 (+3), DES 10 (+0), proficiente
        Token attacker = createToken("Humano", "Guerreiro", 16, 10, 10, 10, false);
        Token target = createTarget();

        Ability ability = Ability.builder()
                .name("Espada Longa")
                .category("weapon")
                .damage("1d8")
                .isProficient(true)
                .properties(List.of("heavy", "versatile"))
                .build();

        AttackResponse response = service.resolveAttack(attacker, target, ability, "normal");
        assertNotNull(response);
        // O bônus esperado é: mod_FOR (+3) + prof (+2) = +5
        assertEquals(5, response.getAttack().getModifiers());
    }

    @Test
    @DisplayName("Arma com acuidade (Finesse) usa DES se for maior")
    void finesseWeaponUsesDex() {
        // FOR 10 (+0), DES 16 (+3), proficiente
        Token attacker = createToken("Elfo", "Ladino", 10, 16, 10, 10, false);
        Token target = createTarget();

        Ability ability = Ability.builder()
                .name("Adaga")
                .category("weapon")
                .damage("1d4")
                .isProficient(true)
                .properties(List.of("finesse", "light"))
                .build();

        AttackResponse response = service.resolveAttack(attacker, target, ability, "normal");
        assertEquals(5, response.getAttack().getModifiers()); // mod_DES (+3) + prof (+2) = +5
    }

    @Test
    @DisplayName("Ataque à distância com arco usa DES")
    void rangedWeaponUsesDex() {
        // FOR 10 (+0), DES 16 (+3), proficiente
        Token attacker = createToken("Humano", "Patrulheiro", 10, 16, 10, 10, false);
        Token target = createTarget();

        Ability ability = Ability.builder()
                .name("Arco Longo")
                .category("weapon")
                .damage("1d8")
                .isProficient(true)
                .properties(List.of("ranged", "two-handed"))
                .build();

        AttackResponse response = service.resolveAttack(attacker, target, ability, "normal");
        assertEquals(5, response.getAttack().getModifiers()); // mod_DES (+3) + prof (+2) = +5
    }

    @Test
    @DisplayName("Ataque desarmado padrão usa FOR")
    void standardUnarmedUsesStr() {
        // FOR 14 (+2), DES 10 (+0), proficiente (todos são proficientes com ataque desarmado)
        Token attacker = createToken("Humano", "Guerreiro", 14, 10, 10, 10, false);
        Token target = createTarget();

        Ability ability = Ability.builder()
                .name("Ataque Desarmado")
                .category("natural")
                .damage("1")
                .isProficient(true)
                .build();

        AttackResponse response = service.resolveAttack(attacker, target, ability, "normal");
        assertEquals(4, response.getAttack().getModifiers()); // mod_FOR (+2) + prof (+2) = +4
    }

    @Test
    @DisplayName("Ataque desarmado Tiefling usa DES se for maior (regra customizada)")
    void tieflingUnarmedUsesDex() {
        // FOR 10 (+0), DES 16 (+3), raça Tiefling
        Token attacker = createToken("Tiefling", "Bardo", 10, 16, 10, 10, true);
        Token target = createTarget();

        Ability ability = Ability.builder()
                .name("Ataque Desarmado")
                .category("natural")
                .damage("1")
                .isProficient(true)
                .build();

        AttackResponse response = service.resolveAttack(attacker, target, ability, "normal");
        assertEquals(5, response.getAttack().getModifiers()); // mod_DES (+3) + prof (+2) = +5
    }

    @Test
    @DisplayName("Ataque desarmado Monge usa DES se for maior")
    void monkUnarmedUsesDex() {
        // FOR 10 (+0), DES 16 (+3), classe Monge
        Token attacker = createToken("Humano", "Monge", 10, 16, 10, 10, false);
        Token target = createTarget();

        Ability ability = Ability.builder()
                .name("Ataque Desarmado")
                .category("natural")
                .damage("1d4")
                .isProficient(true)
                .build();

        AttackResponse response = service.resolveAttack(attacker, target, ability, "normal");
        assertEquals(5, response.getAttack().getModifiers()); // mod_DES (+3) + prof (+2) = +5
    }

    @Test
    @DisplayName("Ataque com magia usa atributo de conjuração (ex: WIS para Clérigo)")
    void spellAttackUsesCastingStat() {
        // WIS 16 (+3), proficiente
        Token attacker = createToken("Humano", "Clérigo", 10, 10, 16, 10, false);
        attacker.getSheet().setIntAttr(10);
        Token target = createTarget();

        Ability ability = Ability.builder()
                .name("Chama Sagrada")
                .category("spell")
                .damage("1d8")
                .isProficient(true)
                .build();

        AttackResponse response = service.resolveAttack(attacker, target, ability, "normal");
        assertEquals(5, response.getAttack().getModifiers()); // mod_WIS (+3) + prof (+2) = +5
    }

    @Test
    @DisplayName("Ataque sem proficiência não adiciona bônus de proficiência")
    void nonProficientWeapon() {
        // FOR 16 (+3), proficiente = false
        Token attacker = createToken("Humano", "Mago", 16, 10, 10, 10, false);
        Token target = createTarget();

        Ability ability = Ability.builder()
                .name("Montante")
                .category("weapon")
                .damage("2d6")
                .isProficient(false)
                .build();

        AttackResponse response = service.resolveAttack(attacker, target, ability, "normal");
        assertEquals(3, response.getAttack().getModifiers()); // apenas mod_FOR (+3)
    }

    @Test
    @DisplayName("Ataque com mão secundária (off-hand) não soma mod positivo no dano")
    void offHandDamageRestriction() {
        // FOR 16 (+3), off-hand
        Token attacker = createToken("Humano", "Guerreiro", 16, 10, 10, 10, false);
        Token target = createTarget();

        Ability ability = Ability.builder()
                .name("Adaga Secundária")
                .category("weapon")
                .damage("1d4")
                .isProficient(true)
                .isOffHand(true)
                .build();

        // O ataque rola com +5, mas o dano deve ser apenas 1d4 + 0 (sem modificador de FOR)
        AttackResponse response = service.resolveAttack(attacker, target, ability, "normal");
        assertNotNull(response);
        if (response.isHit()) {
            assertNotNull(response.getDamage());
            assertEquals(0, response.getDamage().getModifiers());
        }
    }
}
