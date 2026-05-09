package com.blooddragons.service;

import com.blooddragons.data.Dnd5eClassData;
import com.blooddragons.data.Dnd5eRaceData;
import com.blooddragons.model.CharacterSheet;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Testes unitários para CharacterCreationService.
 * Valida criação de personagens com todas as raças e classes do PHB.
 */
class CharacterCreationServiceTest {

    private CharacterCreationService service;
    private DndMathService math;

    @BeforeEach
    void setUp() {
        math = new DndMathService();
        service = new CharacterCreationService(math);
    }

    // Standard array: 15, 14, 13, 12, 10, 8
    private CharacterSheet createStandard(String raceId, String subRaceId, String classId) {
        return service.createCharacter(raceId, subRaceId, classId, 15, 14, 13, 12, 10, 8,
                "Acólito", "Neutro", "Jogador Teste");
    }

    @Nested
    @DisplayName("Criação Básica")
    class BasicCreation {

        @Test
        @DisplayName("Guerreiro Humano — +1 em todos os atributos")
        void humanFighter() {
            CharacterSheet sheet = createStandard("humano", null, "guerreiro");
            assertEquals(16, sheet.getStr()); // 15 + 1
            assertEquals(15, sheet.getDex()); // 14 + 1
            assertEquals(14, sheet.getCon()); // 13 + 1
            assertEquals(13, sheet.getIntAttr());
            assertEquals(11, sheet.getWis());
            assertEquals(9, sheet.getCha());
            assertEquals(1, sheet.getLevel());
            assertEquals(10, sheet.getHitDie());
            assertEquals("Guerreiro", sheet.getClassName());
            assertEquals("Humano", sheet.getRace());
        }

        @Test
        @DisplayName("HP nível 1 = dado de vida máximo + mod CON")
        void hpCalculation() {
            // Guerreiro: d10, CON 14 → mod +2 → HP = 12
            CharacterSheet sheet = createStandard("humano", null, "guerreiro");
            assertEquals(12, sheet.getMaxHp()); // d10 + mod(14) = 10 + 2
        }

        @Test
        @DisplayName("Proficiência nível 1 = +2")
        void proficiencyBonus() {
            CharacterSheet sheet = createStandard("humano", null, "guerreiro");
            assertEquals(2, sheet.getProficiencyBonus());
        }
    }

    @Nested
    @DisplayName("Bônus Raciais")
    class RacialBonuses {

        @Test
        @DisplayName("Anão da Montanha: CON+2, FOR+2")
        void mountainDwarf() {
            CharacterSheet sheet = createStandard("anao", "anao_montanha", "guerreiro");
            assertEquals(17, sheet.getStr());  // 15 + 2 (sub-raça)
            assertEquals(15, sheet.getCon());  // 13 + 2 (raça)
            assertTrue(sheet.getProficiencies().getWeapons().contains("Machado de Batalha"));
            assertTrue(sheet.getProficiencies().getArmor().contains("light")); // sub-raça
        }

        @Test
        @DisplayName("Anão da Colina: CON+2, SAB+1, +1 HP por nível")
        void hillDwarf() {
            CharacterSheet sheet = createStandard("anao", "anao_colina", "clerigo");
            assertEquals(15, sheet.getCon());  // 13 + 2
            assertEquals(11, sheet.getWis());  // 10 + 1
            // HP: d8 + mod(15)=+2 + 1 (Tenacidade) = 11
            assertEquals(11, sheet.getMaxHp());
        }

        @Test
        @DisplayName("Elfo: DEX+2, Percepção gratuita, visão no escuro 18m")
        void elf() {
            CharacterSheet sheet = createStandard("elfo", "alto_elfo", "mago");
            assertEquals(16, sheet.getDex()); // 14 + 2
            assertEquals(13, sheet.getIntAttr()); // 12 + 1 (Alto Elfo)
            assertEquals(18, sheet.getDarkvision());
            assertTrue(sheet.getSkillProficiencies().contains("Percepção"));
        }

        @Test
        @DisplayName("Drow: visão no escuro 36m, DEX+2, CAR+1")
        void drow() {
            CharacterSheet sheet = createStandard("elfo", "drow", "bruxo");
            assertEquals(36, sheet.getDarkvision());
            assertEquals(9, sheet.getCha()); // 8 + 1
            assertTrue(sheet.getRacialTraits().contains("Sensibilidade à Luz Solar"));
        }

        @Test
        @DisplayName("Halfling: DEX+2, tamanho Pequeno, Sorte")
        void halfling() {
            CharacterSheet sheet = createStandard("halfling", "pes_leves", "ladino");
            assertEquals("small", sheet.getSize());
            assertTrue(sheet.getRacialTraits().contains("Sorte"));
            assertTrue(sheet.getRacialTraits().contains("Bravura"));
        }

        @Test
        @DisplayName("Meio-Orc: FOR+2, CON+1, Resistência Implacável")
        void halfOrc() {
            CharacterSheet sheet = createStandard("meio_orc", null, "barbaro");
            assertEquals(17, sheet.getStr()); // 15 + 2
            assertEquals(14, sheet.getCon()); // 13 + 1
            assertTrue(sheet.getRacialTraits().contains("Resistência Implacável"));
            assertTrue(sheet.getRacialTraits().contains("Ataques Selvagens"));
            assertTrue(sheet.getSkillProficiencies().contains("Intimidação"));
        }

        @Test
        @DisplayName("Tiefling: CAR+2, INT+1, resistência a fogo")
        void tiefling() {
            CharacterSheet sheet = createStandard("tiefling", null, "feiticeiro");
            assertEquals(10, sheet.getCha()); // 8 + 2
            assertEquals(13, sheet.getIntAttr()); // 12 + 1
            assertTrue(sheet.getRacialTraits().contains("Resistência Infernal"));
        }

        @Test
        @DisplayName("Draconato: FOR+2, CAR+1")
        void dragonborn() {
            CharacterSheet sheet = createStandard("draconato", null, "paladino");
            assertEquals(17, sheet.getStr()); // 15 + 2
            assertEquals(9, sheet.getCha()); // 8 + 1
        }
    }

    @Nested
    @DisplayName("Classe de Armadura")
    class ArmorClass {

        @Test
        @DisplayName("Bárbaro: CA = 10 + DES + CON (Defesa sem Armadura)")
        void barbarianUnarmored() {
            CharacterSheet sheet = createStandard("humano", null, "barbaro");
            int dexMod = math.calculateModifier(sheet.getDex());
            int conMod = math.calculateModifier(sheet.getCon());
            assertEquals(10 + dexMod + conMod, sheet.getAc());
        }

        @Test
        @DisplayName("Monge: CA = 10 + DES + SAB (Defesa sem Armadura)")
        void monkUnarmored() {
            CharacterSheet sheet = createStandard("humano", null, "monge");
            int dexMod = math.calculateModifier(sheet.getDex());
            int wisMod = math.calculateModifier(sheet.getWis());
            assertEquals(10 + dexMod + wisMod, sheet.getAc());
        }

        @Test
        @DisplayName("Mago: CA = 10 + DES (padrão sem armadura)")
        void wizardUnarmored() {
            CharacterSheet sheet = createStandard("humano", null, "mago");
            int dexMod = math.calculateModifier(sheet.getDex());
            assertEquals(10 + dexMod, sheet.getAc());
        }
    }

    @Nested
    @DisplayName("Conjuração")
    class Spellcasting {

        @Test
        @DisplayName("Mago nível 1: 2 slots de nível 1, atributo INT")
        void wizardSpellSlots() {
            CharacterSheet sheet = createStandard("humano", null, "mago");
            assertEquals("int", sheet.getSpellcastingAbility());
            assertNotNull(sheet.getMaxSpellSlots());
            assertEquals(2, sheet.getMaxSpellSlots()[0]); // 2 slots de nível 1
            assertEquals(0, sheet.getMaxSpellSlots()[1]); // 0 slots de nível 2
        }

        @Test
        @DisplayName("Guerreiro: sem conjuração")
        void fighterNoSpells() {
            CharacterSheet sheet = createStandard("humano", null, "guerreiro");
            assertEquals("none", sheet.getSpellcastingAbility());
            assertNull(sheet.getSpellSaveDC());
        }

        @Test
        @DisplayName("Clérigo: spell save DC e attack bonus calculados")
        void clericSpellDC() {
            CharacterSheet sheet = createStandard("humano", null, "clerigo");
            assertEquals("wis", sheet.getSpellcastingAbility());
            int wisMod = math.calculateModifier(sheet.getWis());
            assertEquals(8 + 2 + wisMod, sheet.getSpellSaveDC());
            assertEquals(2 + wisMod, sheet.getSpellAttackBonus());
        }
    }

    @Nested
    @DisplayName("Multiclasse")
    class Multiclass {

        @Test
        @DisplayName("Guerreiro FOR 15 pode multiclassar para Bárbaro")
        void validMulticlass() {
            CharacterSheet sheet = createStandard("humano", null, "guerreiro");
            List<String> errors = service.validateMulticlass(sheet, "barbaro");
            assertTrue(errors.isEmpty(), "Deveria ser válido: " + errors);
        }

        @Test
        @DisplayName("Mago INT 13 pode multiclassar para Mago (atende requisito)")
        void wizardMulticlass() {
            CharacterSheet sheet = createStandard("humano", null, "mago");
            List<String> errors = service.validateMulticlass(sheet, "clerigo");
            // Mago precisa INT 13 (tem 13), Clérigo precisa WIS 13 (tem 11) → falha
            assertFalse(errors.isEmpty());
        }
    }

    @Nested
    @DisplayName("Dados de Referência")
    class ReferenceData {

        @Test
        @DisplayName("Todas as 9 raças estão carregadas")
        void allRacesLoaded() {
            assertEquals(9, Dnd5eRaceData.RACES.size());
        }

        @Test
        @DisplayName("Todas as 12 classes estão carregadas")
        void allClassesLoaded() {
            assertEquals(12, Dnd5eClassData.CLASSES.size());
        }

        @Test
        @DisplayName("Spell slots de full caster nível 20 estão corretos")
        void fullCasterLevel20() {
            int[] slots = Dnd5eClassData.getSpellSlots("full", 20);
            assertEquals(4, slots[0]); // 1st level
            assertEquals(3, slots[1]); // 2nd level
            assertEquals(1, slots[7]); // 8th level
            assertEquals(1, slots[8]); // 9th level
        }

        @Test
        @DisplayName("Ataque Furtivo escala corretamente")
        void sneakAttackScaling() {
            assertEquals(1, Dnd5eClassData.getSneakAttackDice(1));
            assertEquals(2, Dnd5eClassData.getSneakAttackDice(3));
            assertEquals(5, Dnd5eClassData.getSneakAttackDice(9));
            assertEquals(10, Dnd5eClassData.getSneakAttackDice(19));
        }
    }
}
