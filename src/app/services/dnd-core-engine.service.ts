import { Injectable, inject } from '@angular/core';
import { CharacterSheet } from '../models/character';
import { DndMathService } from './dnd-math.service';

export interface ActionResult {
  total: number;
  naturalRoll: number;
  modifiers: number;
  isCritical: boolean;
  isCriticalFail?: boolean;
  log: string;
}

export interface AttackRollResult {
  total: number;
  naturalRoll: number;
  attributeUsed: string;
  modifier: number;
  isCritical: boolean;
  isFumble: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class DndCoreEngineService {
  private mathService = inject(DndMathService);

  // ==========================================
  // 1. Atributos
  // ==========================================
  
  /**
   * Conversão automática de Valor para Modificador
   * Ex: 16 -> +3
   */
  calculateModifier(score: number): number {
    return this.mathService.calculateModifier(score);
  }

  /**
   * Calcula o bônus de proficiência com base no nível do personagem
   */
  calculateProficiencyBonus(level: number): number {
    return this.mathService.calculateProficiencyBonus(level);
  }

  /**
   * Helper para extrair proficiência direto da ficha
   */
  getProficiencyFromCharacter(character: CharacterSheet): number {
    return this.calculateProficiencyBonus(character.level);
  }

  // ==========================================
  // 2. Combate Total
  // ==========================================

  calculateAttackRoll(
    attacker: { stats: Record<string, number>, proficiencyBonus: number, spellcastingAbility?: string },
    weapon: { name: string, properties?: string[], attackBonus?: number, isProficient?: boolean },
    isSpell: boolean,
    manualRoll?: number
  ): AttackRollResult {
    const naturalRoll = manualRoll || Math.floor(Math.random() * 20) + 1;
    let attributeUsed = 'str';
    let attributeScore = attacker.stats['str'] || 10;

    if (isSpell) {
      attributeUsed = attacker.spellcastingAbility || 'int';
      attributeScore = attacker.stats[attributeUsed] || 10;
    } else {
      const properties = weapon.properties || [];
      if (properties.includes('ranged')) {
        attributeUsed = 'dex';
        attributeScore = attacker.stats['dex'] || 10;
      } else if (properties.includes('finesse')) {
        const str = attacker.stats['str'] || 10;
        const dex = attacker.stats['dex'] || 10;
        if (dex > str) {
          attributeUsed = 'dex';
          attributeScore = dex;
        } else {
          attributeUsed = 'str';
          attributeScore = str;
        }
      } else if (properties.includes('thrown')) {
        attributeUsed = 'str';
        attributeScore = attacker.stats['str'] || 10;
      } else {
        attributeUsed = 'str';
        attributeScore = attacker.stats['str'] || 10;
      }
    }

    const modifier = this.calculateModifier(attributeScore);
    
    let appliedProficiency = 0;
    if (isSpell) {
      appliedProficiency = attacker.proficiencyBonus || 0;
    } else if (weapon.isProficient) {
      appliedProficiency = attacker.proficiencyBonus || 0;
    }

    const total = naturalRoll + modifier + appliedProficiency + (weapon.attackBonus || 0);

    return {
      total,
      naturalRoll,
      attributeUsed,
      modifier,
      isCritical: naturalRoll === 20,
      isFumble: naturalRoll === 1
    };
  }

  /**
   * Calcula um ataque completo (d20 + Mod + Prof + Bonus Mágico)
   * Identifica Crítico (20 natural) e Falha Crítica (1 natural)
   */
  /**
   * Resolução unificada de rolamentos de d20 para Ataques, Saves e Perícias
   * Suporta o cancelamento mútuo de Vantagem e Desvantagem pelas regras de 5e.
   */
  rollD20(
    hasAdvantage: boolean,
    hasDisadvantage: boolean
  ): { naturalRoll: number, roll1: number, roll2?: number, mode: 'normal' | 'advantage' | 'disadvantage' } {
    const roll1 = Math.floor(Math.random() * 20) + 1;
    
    // Regra D&D 5e: Se tem vantagem e desvantagem, elas anulam-se mutuamente.
    if (hasAdvantage && hasDisadvantage) {
      return { naturalRoll: roll1, roll1, mode: 'normal' };
    }
    
    if (hasAdvantage || hasDisadvantage) {
      const roll2 = Math.floor(Math.random() * 20) + 1;
      let naturalRoll = roll1;
      let mode: 'normal' | 'advantage' | 'disadvantage' = 'normal';
      
      if (hasAdvantage) {
        naturalRoll = Math.max(roll1, roll2);
        mode = 'advantage';
      } else if (hasDisadvantage) {
        naturalRoll = Math.min(roll1, roll2);
        mode = 'disadvantage';
      }
      return { naturalRoll, roll1, roll2, mode };
    }

    return { naturalRoll: roll1, roll1, mode: 'normal' };
  }

  /**
   * Executa um teste de Resistência (Saving Throw) segundo as regras oficiais da 5e.
   */
  executeSavingThrow(
    modifier: number,
    proficiency: number,
    isProficient: boolean,
    hasAdvantage = false,
    hasDisadvantage = false,
    magicBonus = 0 // Ex: Paladin Aura of Protection ou Ring of Protection
  ): ActionResult {
    const { naturalRoll, roll1, roll2, mode } = this.rollD20(hasAdvantage, hasDisadvantage);
    
    let logRolls = `[${roll1}]`;
    if (roll2 !== undefined) {
      if (mode === 'advantage') logRolls = `[${roll1}, ${roll2}] (Vantagem: ${naturalRoll})`;
      if (mode === 'disadvantage') logRolls = `[${roll1}, ${roll2}] (Desvantagem: ${naturalRoll})`;
    }

    const isCritical = naturalRoll === 20;
    const isCriticalFail = naturalRoll === 1;

    const profBonus = isProficient ? proficiency : 0;
    const modifiers = modifier + profBonus + magicBonus;
    const total = naturalRoll + modifiers;

    let log = `d20: ${logRolls} + Mod: ${modifier}`;
    if (isProficient) log += ` + Prof: ${profBonus}`;
    if (magicBonus) log += ` + Bônus Mágico: ${magicBonus}`;
    log += ` = ${total}`;

    return {
      total,
      naturalRoll,
      modifiers,
      isCritical,
      isCriticalFail,
      log
    };
  }

  executeAttackRoll(
    modifier: number, 
    proficiency: number, 
    magicBonus = 0, 
    mode: 'normal' | 'advantage' | 'disadvantage' = 'normal',
    extraDice = '' // ex: "1d4" para Bênção
  ): ActionResult {
    const hasAdvantage = mode === 'advantage';
    const hasDisadvantage = mode === 'disadvantage';
    const { naturalRoll, roll1, roll2, mode: resolvedMode } = this.rollD20(hasAdvantage, hasDisadvantage);
    
    let logRolls = `[${roll1}]`;
    if (roll2 !== undefined) {
      if (resolvedMode === 'advantage') logRolls = `[${roll1}, ${roll2}] (Vantagem: ${naturalRoll})`;
      if (resolvedMode === 'disadvantage') logRolls = `[${roll1}, ${roll2}] (Desvantagem: ${naturalRoll})`;
    }

    const isCritical = naturalRoll === 20;
    const isCriticalFail = naturalRoll === 1;

    let extraDiceTotal = 0;
    let extraDiceLog = '';
    if (extraDice) {
      const parsed = this.parseAndRoll(extraDice);
      extraDiceTotal = parsed.total;
      extraDiceLog = ` + ${parsed.log}`;
    }

    const modifiers = modifier + proficiency + magicBonus + extraDiceTotal;
    const total = naturalRoll + modifiers;

    let log = `d20: ${logRolls} + Mod: ${modifier} + Prof: ${proficiency}`;
    if (magicBonus) log += ` + Magia: ${magicBonus}`;
    if (extraDiceLog) log += extraDiceLog;
    log += ` = ${total}`;

    if (isCritical) log += ' (CRÍTICO!)';
    if (isCriticalFail) log += ' (FALHA CRÍTICA!)';

    return {
      total,
      naturalRoll,
      modifiers,
      isCritical,
      isCriticalFail,
      log
    };
  }

  /**
   * Calcula o dano (Dados da Arma + Modificador + Bônus)
   * Suporta resistências e vulnerabilidades (multiplicadores)
   */
  calculateDamage(
    diceString: string, 
    modifier: number, 
    itemBonus = 0, 
    resistanceMultiplier = 1, // 0.5 para resistência, 2 para vulnerabilidade
    isOffhand = false
  ): ActionResult {
    const parsed = this.parseAndRoll(diceString);
    const appliedModifier = isOffhand ? Math.min(0, modifier) : modifier;
    const modifiers = appliedModifier + itemBonus;
    
    let rawTotal = parsed.total + modifiers;
    // Dano não pode ser negativo
    if (rawTotal < 0) rawTotal = 0;

    const finalTotal = Math.floor(rawTotal * resistanceMultiplier);

    let log = `Dados: ${parsed.log} + Mod: ${appliedModifier}`;
    if (itemBonus) log += ` + Item: ${itemBonus}`;
    if (resistanceMultiplier !== 1) log += ` (x${resistanceMultiplier})`;
    log += ` = ${finalTotal}`;

    return {
      total: finalTotal,
      naturalRoll: parsed.total,
      modifiers,
      isCritical: false,
      log
    };
  }

  /**
   * Calcula a cura (Dados + Modificador + Bônus)
   */
  calculateHealing(
    diceString: string, 
    modifier: number, 
    bonus = 0
  ): ActionResult {
    const parsed = this.parseAndRoll(diceString);
    const total = parsed.total + modifier + bonus;
    
    let log = `Dados: ${parsed.log} + Mod: ${modifier}`;
    if (bonus) log += ` + Bônus: ${bonus}`;
    log += ` = ${total}`;

    return {
      total,
      naturalRoll: parsed.total,
      modifiers: modifier + bonus,
      isCritical: false,
      log
    };
  }

  /**
   * Lógica inteligente de Armadura
   */
  calculateAC(
    armorType: 'heavy' | 'medium' | 'light' | 'none', 
    baseAC: number, 
    dexModifier: number, 
    shieldBonus = 0,
    conModifier = 0,
    wisModifier = 0,
    unarmoredDefenseClass: 'barbarian' | 'monk' | 'none' = 'none'
  ): number {
    let effectiveDexMod = dexModifier;
    
    if (armorType === 'heavy') {
      return baseAC + shieldBonus; // Ignora Destreza
    } else if (armorType === 'medium') {
      effectiveDexMod = Math.min(dexModifier, 2); // Limita Destreza a +2
      return baseAC + effectiveDexMod + shieldBonus;
    } else if (armorType === 'light') {
      return baseAC + effectiveDexMod + shieldBonus;
    }
    
    // armorType === 'none'
    const standardUnarmored = 10 + dexModifier;
    const barbarianUnarmored = 10 + dexModifier + conModifier;
    const monkUnarmored = 10 + dexModifier + wisModifier;

    let calculatedAC = standardUnarmored;

    if (unarmoredDefenseClass === 'monk' && shieldBonus > 0) {
      calculatedAC = standardUnarmored; // Monge perde a Defesa sem Armadura se usar escudo
    } else if (unarmoredDefenseClass === 'barbarian') {
      calculatedAC = Math.max(standardUnarmored, barbarianUnarmored);
    } else if (unarmoredDefenseClass === 'monk' && shieldBonus === 0) {
      calculatedAC = Math.max(standardUnarmored, monkUnarmored);
    }

    return calculatedAC + shieldBonus;
  }

  // ==========================================
  // 3. Magia
  // ==========================================

  calculateSpellSaveDC(modifier: number, proficiency: number): number {
    return 8 + modifier + proficiency;
  }

  calculateSpellAttackBonus(modifier: number, proficiency: number): number {
    return modifier + proficiency;
  }

  // ==========================================
  // 4. Saúde
  // ==========================================

  calculateMaxHP(hitDice: number, level: number, conModifier: number): number {
    // Nível 1: Dado cheio + Mod Con. Mínimo 1.
    let totalHp = Math.max(1, hitDice + conModifier);
    
    // Níveis seguintes: Média arredondada para cima (hitDice / 2 + 1) + Mod Con
    if (level > 1) {
      const averageHpPerLevel = Math.ceil(hitDice / 2) + 1;
      for (let i = 2; i <= level; i++) {
        totalHp += Math.max(1, averageHpPerLevel + conModifier);
      }
    }
    
    return totalHp;
  }

  // ==========================================
  // 5. Exploração
  // ==========================================

  calculatePassivePerception(wisModifier: number, proficiency: number, hasExpertise = false): number {
    const profBonus = hasExpertise ? proficiency * 2 : proficiency;
    return 10 + wisModifier + profBonus;
  }

  calculateCarryingCapacity(strScore: number): number {
    return strScore * 7.5; // Em kg
  }

  calculatePushDragLift(strScore: number): number {
    return this.calculateCarryingCapacity(strScore) * 2; // Em kg
  }

  calculateJumpDistance(strScore: number, strModifier: number, hasRunningStart = true): { long: number, high: number } {
    const multiplier = hasRunningStart ? 1 : 0.5;
    return {
      long: (strScore * 0.3) * multiplier, // Em metros
      high: Math.max(0, 0.9 + (strModifier * 0.3)) * multiplier // Em metros
    };
  }

  // ==========================================
  // 6. Funcionalidades de Automação Avançada
  // ==========================================
  
  /**
   * Interpretador de Dados (Dice Parser)
   * Recebe strings como "2d8 + 4" ou "1d10 + 1d4 + 2"
   */
  parseAndRoll(diceString: string): { total: number, rolls: number[], log: string } {
    let total = 0;
    const rolls: number[] = [];
    const logParts: string[] = [];
    
    // Remove espaços e encontra termos como "2d8", "+4", "-1d4"
    const terms = diceString.replace(/\s+/g, '').match(/[+-]?([0-9]+d[0-9]+|[0-9]+)/g);
    
    if (!terms) return { total: 0, rolls: [], log: '0' };

    for (const term of terms) {
      const sign = term.startsWith('-') ? -1 : 1;
      const cleanTerm = term.replace(/^[+-]/, '');
      
      if (cleanTerm.includes('d')) {
        const [countStr, sidesStr] = cleanTerm.split('d');
        const count = parseInt(countStr, 10) || 1;
        const sides = parseInt(sidesStr, 10);
        
        let termTotal = 0;
        const termRolls = [];
        for (let i = 0; i < count; i++) {
          const roll = Math.floor(Math.random() * sides) + 1;
          termRolls.push(roll);
          termTotal += roll;
        }
        total += sign * termTotal;
        rolls.push(...termRolls);
        
        const signStr = logParts.length === 0 && sign === 1 ? '' : (sign < 0 ? ' - ' : ' + ');
        logParts.push(`${signStr}[${termRolls.join(',')}]`);
      } else {
        const val = parseInt(cleanTerm, 10);
        total += sign * val;
        const signStr = logParts.length === 0 && sign === 1 ? '' : (sign < 0 ? ' - ' : ' + ');
        logParts.push(`${signStr}${val}`);
      }
    }
    
    return { 
      total, 
      rolls, 
      log: logParts.join('').trim() 
    };
  }

  /**
   * Validador de Sucesso
   */
  validateSuccess(total: number, dc: number): { success: boolean, margin: number } {
    return {
      success: total >= dc,
      margin: total - dc
    };
  }
}
