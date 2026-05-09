package com.blooddragons.service;

import com.blooddragons.model.CharacterSheet;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Testes unitários para SpellService.
 */
class SpellServiceTest {

    private SpellService spellService;

    @BeforeEach
    void setUp() {
        DndMathService math = new DndMathService();
        DndCoreEngineService engine = new DndCoreEngineService(math);
        spellService = new SpellService(engine);
    }

    @Nested
    @DisplayName("Escala de Truques")
    class CantripScaling {

        @Test
        @DisplayName("Nível 1-4: mantém dano base")
        void level1() {
            assertEquals("1d10", spellService.scaleCantripDamage("1d10", 1));
            assertEquals("1d10", spellService.scaleCantripDamage("1d10", 4));
        }

        @Test
        @DisplayName("Nível 5-10: dobra dados")
        void level5() {
            assertEquals("2d10", spellService.scaleCantripDamage("1d10", 5));
            assertEquals("2d10", spellService.scaleCantripDamage("1d10", 10));
        }

        @Test
        @DisplayName("Nível 11-16: triplica dados")
        void level11() {
            assertEquals("3d10", spellService.scaleCantripDamage("1d10", 11));
        }

        @Test
        @DisplayName("Nível 17+: quadruplica dados")
        void level17() {
            assertEquals("4d10", spellService.scaleCantripDamage("1d10", 17));
            assertEquals("4d10", spellService.scaleCantripDamage("1d10", 20));
        }

        @Test
        @DisplayName("Raio de Gelo (1d8) escala corretamente")
        void rayOfFrost() {
            assertEquals("1d8", spellService.scaleCantripDamage("1d8", 4));
            assertEquals("2d8", spellService.scaleCantripDamage("1d8", 5));
            assertEquals("4d8", spellService.scaleCantripDamage("1d8", 20));
        }
    }

    @Nested
    @DisplayName("Upcast")
    class Upcasting {

        @Test
        @DisplayName("Bola de Fogo upcast: 8d6 + 1d6 por nível acima do 3º")
        void fireballUpcast() {
            assertEquals("8d6", spellService.calculateUpcastDamage("8d6", 3, 3, "1d6"));
            assertEquals("9d6", spellService.calculateUpcastDamage("8d6", 3, 4, "1d6"));
            assertEquals("10d6", spellService.calculateUpcastDamage("8d6", 3, 5, "1d6"));
        }

        @Test
        @DisplayName("Curar Ferimentos upcast: +1d8 por nível")
        void cureWoundsUpcast() {
            assertEquals("1d8", spellService.calculateUpcastDamage("1d8", 1, 1, "1d8"));
            assertEquals("2d8", spellService.calculateUpcastDamage("1d8", 1, 2, "1d8"));
            assertEquals("5d8", spellService.calculateUpcastDamage("1d8", 1, 5, "1d8"));
        }

        @Test
        @DisplayName("Sem upcast se nível igual ao base")
        void noUpcast() {
            assertEquals("8d6", spellService.calculateUpcastDamage("8d6", 3, 3, "1d6"));
        }
    }

    @Nested
    @DisplayName("Gestão de Spell Slots")
    class SpellSlotManagement {

        @Test
        @DisplayName("Gastar spell slot reduz contagem")
        void expendSlot() {
            CharacterSheet sheet = CharacterSheet.builder()
                    .currentSpellSlots(new int[]{2, 0, 0, 0, 0, 0, 0, 0, 0})
                    .build();
            assertTrue(spellService.expendSpellSlot(sheet, 1));
            assertEquals(1, sheet.getCurrentSpellSlots()[0]);
            assertTrue(spellService.expendSpellSlot(sheet, 1));
            assertEquals(0, sheet.getCurrentSpellSlots()[0]);
            assertFalse(spellService.expendSpellSlot(sheet, 1)); // Sem slots
        }

        @Test
        @DisplayName("Recuperar slots restaura ao máximo")
        void restoreSlots() {
            CharacterSheet sheet = CharacterSheet.builder()
                    .currentSpellSlots(new int[]{0, 0, 0, 0, 0, 0, 0, 0, 0})
                    .maxSpellSlots(new int[]{4, 3, 2, 0, 0, 0, 0, 0, 0})
                    .build();
            spellService.restoreAllSlots(sheet);
            assertEquals(4, sheet.getCurrentSpellSlots()[0]);
            assertEquals(3, sheet.getCurrentSpellSlots()[1]);
            assertEquals(2, sheet.getCurrentSpellSlots()[2]);
        }

        @Test
        @DisplayName("Rejeita nível de slot inválido")
        void invalidSlotLevel() {
            CharacterSheet sheet = CharacterSheet.builder()
                    .currentSpellSlots(new int[]{2, 0, 0, 0, 0, 0, 0, 0, 0})
                    .build();
            assertFalse(spellService.expendSpellSlot(sheet, 0));
            assertFalse(spellService.expendSpellSlot(sheet, 10));
        }
    }

    @Nested
    @DisplayName("Rajada Mística")
    class EldritchBlast {

        @Test
        @DisplayName("Escala feixes nos níveis corretos")
        void beamScaling() {
            assertEquals(1, spellService.getEldritchBlastBeams(1));
            assertEquals(1, spellService.getEldritchBlastBeams(4));
            assertEquals(2, spellService.getEldritchBlastBeams(5));
            assertEquals(3, spellService.getEldritchBlastBeams(11));
            assertEquals(4, spellService.getEldritchBlastBeams(17));
        }
    }

    @Nested
    @DisplayName("Spell Save DC e Spell Attack")
    class SpellcastingStats {

        @Test
        @DisplayName("Calcula spell save DC corretamente")
        void spellSaveDC() {
            CharacterSheet sheet = CharacterSheet.builder()
                    .spellcastingAbility("wis").wis(16).proficiencyBonus(2).build();
            // 8 + 2 + mod(16)=3 = 13
            assertEquals(13, spellService.calculateSpellSaveDC(sheet));
        }

        @Test
        @DisplayName("Calcula spell attack bonus corretamente")
        void spellAttackBonus() {
            CharacterSheet sheet = CharacterSheet.builder()
                    .spellcastingAbility("cha").cha(18).proficiencyBonus(3).build();
            // 3 + mod(18)=4 = 7
            assertEquals(7, spellService.calculateSpellAttackBonus(sheet));
        }

        @Test
        @DisplayName("Classe sem conjuração retorna 0")
        void nonCaster() {
            CharacterSheet sheet = CharacterSheet.builder()
                    .spellcastingAbility("none").proficiencyBonus(2).build();
            assertEquals(0, spellService.calculateSpellSaveDC(sheet));
        }
    }
}
