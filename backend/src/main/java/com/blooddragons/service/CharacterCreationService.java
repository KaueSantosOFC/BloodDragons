package com.blooddragons.service;

import com.blooddragons.data.*;
import com.blooddragons.data.Dnd5eRaceData.*;
import com.blooddragons.data.Dnd5eClassData.*;
import com.blooddragons.model.CharacterSheet;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Serviço de criação e validação de personagem D&D 5e.
 * Aplica bônus raciais, proficiências de classe, calcula HP, CA, spell slots, etc.
 */
@Service
public class CharacterCreationService {

    private final DndMathService math;

    public CharacterCreationService(DndMathService math) {
        this.math = math;
    }

    /**
     * Inicializa uma ficha de personagem aplicando todas as regras de raça e classe.
     */
    public CharacterSheet createCharacter(String raceId, String subRaceId, String classId,
            int str, int dex, int con, int intAttr, int wis, int cha,
            String background, String alignment, String playerName) {

        Race race = Dnd5eRaceData.findById(raceId);
        ClassInfo classInfo = Dnd5eClassData.findById(classId);

        if (race == null || classInfo == null) {
            throw new IllegalArgumentException("Raça ou classe não encontrada: " + raceId + "/" + classId);
        }

        SubRace subRace = null;
        if (subRaceId != null && !subRaceId.isEmpty()) {
            subRace = Dnd5eRaceData.findSubRace(raceId, subRaceId);
        }

        // 1. Aplicar bônus de atributo racial
        Map<String, Integer> bonuses = new HashMap<>(race.getAbilityBonuses());
        if (subRace != null && subRace.getAbilityBonuses() != null) {
            subRace.getAbilityBonuses().forEach((k, v) -> bonuses.merge(k, v, Integer::sum));
        }

        int finalStr = str + bonuses.getOrDefault("str", 0);
        int finalDex = dex + bonuses.getOrDefault("dex", 0);
        int finalCon = con + bonuses.getOrDefault("con", 0);
        int finalInt = intAttr + bonuses.getOrDefault("int", 0);
        int finalWis = wis + bonuses.getOrDefault("wis", 0);
        int finalCha = cha + bonuses.getOrDefault("cha", 0);

        // 2. Calcular derivados
        int conMod = math.calculateModifier(finalCon);
        int dexMod = math.calculateModifier(finalDex);
        int wisMod = math.calculateModifier(finalWis);
        int level = 1;
        int profBonus = math.calculateProficiencyBonus(level);

        // 3. HP máximo (nível 1 = dado de vida máximo + mod. CON)
        int maxHp = Math.max(1, classInfo.getHitDie() + conMod);

        // Tenacidade Anã: +1 HP por nível
        if (hasRacialTrait(race, subRace, "extra_hp")) {
            maxHp += level;
        }

        // 4. Deslocamento
        double speed = race.getSpeed();
        if (subRace != null && subRace.getSpeedOverride() != null) {
            speed = subRace.getSpeedOverride();
        }

        // 5. Visão no Escuro
        int darkvision = race.getDarkvision();
        if (subRace != null && subRace.getDarkvisionOverride() != null) {
            darkvision = subRace.getDarkvisionOverride();
        }

        // 6. Proficiências combinadas (raça + classe + sub-raça)
        List<String> armorProf = mergeUnique(classInfo.getArmorProficiencies(), race.getArmorProficiencies(),
                subRace != null ? subRace.getArmorProficiencies() : null);
        List<String> weaponProf = mergeUnique(classInfo.getWeaponProficiencies(), race.getWeaponProficiencies(),
                subRace != null ? subRace.getWeaponProficiencies() : null);
        List<String> toolProf = mergeUnique(classInfo.getToolProficiencies(), race.getToolProficiencies(), null);
        List<String> skillProf = mergeUnique(race.getSkillProficiencies(),
                subRace != null ? subRace.getSkillProficiencies() : null, null);

        // 7. Spell slots e spellcasting
        String spellAbility = classInfo.getSpellcastingAbility();
        int[] spellSlots = Dnd5eClassData.getSpellSlots(classInfo.getCasterType(), level);
        Integer spellSaveDC = null;
        Integer spellAttackBonus = null;
        if (!"none".equals(spellAbility)) {
            int spellMod = getSpellcastingModifier(spellAbility, finalInt, finalWis, finalCha);
            spellSaveDC = 8 + profBonus + spellMod;
            spellAttackBonus = profBonus + spellMod;
        }

        // 8. CA (sem armadura por padrão)
        int ac = calculateStartingAC(classId, dexMod, conMod, wisMod);

        // 9. Percepção Passiva
        boolean percProf = skillProf.contains("Percepção");
        int passivePerception = 10 + wisMod + (percProf ? profBonus : 0);

        // 10. Iniciativa
        int initiative = dexMod;

        // 11. Traços raciais como lista de strings
        List<String> racialTraits = new ArrayList<>();
        if (race.getTraits() != null) {
            race.getTraits().forEach(t -> racialTraits.add(t.getName()));
        }
        if (subRace != null && subRace.getTraits() != null) {
            subRace.getTraits().forEach(t -> racialTraits.add(t.getName()));
        }

        // 12. Idiomas
        List<String> languages = new ArrayList<>(race.getLanguages());

        return CharacterSheet.builder()
                .className(classInfo.getName())
                .level(level)
                .background(background)
                .playerName(playerName)
                .race(race.getName())
                .subRace(subRace != null ? subRace.getName() : null)
                .alignment(alignment)
                .xp(0)
                .hitDie(classInfo.getHitDie())
                .str(finalStr).dex(finalDex).con(finalCon)
                .intAttr(finalInt).wis(finalWis).cha(finalCha)
                .ac(ac).initiative(initiative).speed((int)(speed * 10))
                .proficiencyBonus(profBonus)
                .passivePerception(passivePerception)
                .hp(maxHp).maxHp(maxHp)
                .spellcastingAbility(spellAbility)
                .spellSaveDC(spellSaveDC).spellAttackBonus(spellAttackBonus)
                .currentSpellSlots(spellSlots.clone()).maxSpellSlots(spellSlots.clone())
                .darkvision(darkvision).size(race.getSize())
                .racialTraits(racialTraits).languages(languages)
                .savingThrowProficiencies(new ArrayList<>(classInfo.getSavingThrowProficiencies()))
                .skillProficiencies(skillProf)
                .expertiseSkills(new ArrayList<>())
                .classFeatures(new ArrayList<>())
                .proficiencies(CharacterSheet.Proficiencies.builder()
                        .armor(armorProf).weapons(weaponProf).tools(toolProf).languages(languages).build())
                .exhaustionLevel(0)
                .deathSaveSuccesses(0).deathSaveFailures(0)
                .hitDiceRemaining(1)
                .build();
    }

    /**
     * Valida se o personagem pode fazer multiclasse para uma nova classe.
     * Retorna lista de erros (vazia = válido).
     */
    public List<String> validateMulticlass(CharacterSheet sheet, String newClassId) {
        List<String> errors = new ArrayList<>();
        List<String> prereqs = Dnd5eClassData.MULTICLASS_PREREQUISITES.get(newClassId);
        if (prereqs == null) {
            errors.add("Classe desconhecida: " + newClassId);
            return errors;
        }

        // Verifica classe atual
        String currentClassId = findClassIdByName(sheet.getClassName());
        if (currentClassId != null) {
            List<String> currentPrereqs = Dnd5eClassData.MULTICLASS_PREREQUISITES.get(currentClassId);
            if (currentPrereqs != null) {
                validatePrereqs(currentPrereqs, sheet, errors, "classe atual (" + sheet.getClassName() + ")");
            }
        }

        // Verifica nova classe
        validatePrereqs(prereqs, sheet, errors, "nova classe (" + newClassId + ")");

        return errors;
    }

    private void validatePrereqs(List<String> prereqs, CharacterSheet sheet, List<String> errors, String context) {
        for (String prereq : prereqs) {
            if (prereq.contains("|")) {
                // OR: pelo menos um deve ser >= 13
                String[] options = prereq.split("\\|");
                boolean anyMet = false;
                for (String opt : options) {
                    if (getAttributeValue(sheet, opt.trim()) >= 13) anyMet = true;
                }
                if (!anyMet) errors.add("Para " + context + ": precisa de pelo menos 13 em " + prereq);
            } else {
                // AND: deve ser >= 13
                if (getAttributeValue(sheet, prereq) < 13) {
                    errors.add("Para " + context + ": precisa de pelo menos 13 em " + prereq.toUpperCase());
                }
            }
        }
    }

    /**
     * Calcula o CA inicial sem armadura para a classe.
     */
    private int calculateStartingAC(String classId, int dexMod, int conMod, int wisMod) {
        return switch (classId) {
            case "barbaro" -> 10 + dexMod + conMod; // Defesa sem Armadura do Bárbaro
            case "monge" -> 10 + dexMod + wisMod;   // Defesa sem Armadura do Monge
            default -> 10 + dexMod;                  // Padrão sem armadura
        };
    }

    /**
     * Retorna o modificador do atributo de conjuração.
     */
    private int getSpellcastingModifier(String ability, int intVal, int wisVal, int chaVal) {
        return switch (ability) {
            case "int" -> math.calculateModifier(intVal);
            case "wis" -> math.calculateModifier(wisVal);
            case "cha" -> math.calculateModifier(chaVal);
            default -> 0;
        };
    }

    private int getAttributeValue(CharacterSheet sheet, String attr) {
        return switch (attr) {
            case "str" -> sheet.getStr();
            case "dex" -> sheet.getDex();
            case "con" -> sheet.getCon();
            case "int" -> sheet.getIntAttr();
            case "wis" -> sheet.getWis();
            case "cha" -> sheet.getCha();
            default -> 0;
        };
    }

    private boolean hasRacialTrait(Race race, SubRace subRace, String mechanicType) {
        if (race.getTraits() != null) {
            for (var trait : race.getTraits()) {
                if (mechanicType.equals(trait.getMechanicType())) return true;
            }
        }
        if (subRace != null && subRace.getTraits() != null) {
            for (var trait : subRace.getTraits()) {
                if (mechanicType.equals(trait.getMechanicType())) return true;
            }
        }
        return false;
    }

    private List<String> mergeUnique(List<String> a, List<String> b, List<String> c) {
        Set<String> set = new LinkedHashSet<>();
        if (a != null) set.addAll(a);
        if (b != null) set.addAll(b);
        if (c != null) set.addAll(c);
        return new ArrayList<>(set);
    }

    private String findClassIdByName(String name) {
        return Dnd5eClassData.CLASSES.stream()
                .filter(c -> c.getName().equals(name))
                .map(ClassInfo::getId)
                .findFirst().orElse(null);
    }
}
