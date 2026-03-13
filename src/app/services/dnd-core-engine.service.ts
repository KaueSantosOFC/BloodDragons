import { Injectable } from '@angular/core';
import { CharacterSheet } from '../models/character';

export interface ActionResult {
  total: number;
  naturalRoll: number;
  modifiers: number;
  isCritical: boolean;
  isCriticalFail?: boolean;
  log: string;
}

@Injectable({
  providedIn: 'root'
})
export class DndCoreEngineService {

  // ==========================================
  // 1. Atributos
  // ==========================================
  
  /**
   * Conversão automática de Valor para Modificador
   * Ex: 16 -> +3
   */
  calculateModifier(score: number): number {
    return Math.floor((score - 10) / 2);
  }

  /**
   * Calcula o bônus de proficiência com base no nível do personagem
   */
  calculateProficiencyBonus(level: number): number {
    return Math.ceil(level / 4) + 1;
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

  /**
   * Calcula um ataque completo (d20 + Mod + Prof + Bonus Mágico)
   * Identifica Crítico (20 natural) e Falha Crítica (1 natural)
   */
  calculateAttackRoll(
    modifier: number, 
    proficiency: number, 
    magicBonus = 0, 
    mode: 'normal' | 'advantage' | 'disadvantage' = 'normal',
    extraDice = '' // ex: "1d4" para Bênção
  ): ActionResult {
    const roll1 = Math.floor(Math.random() * 20) + 1;
    const roll2 = Math.floor(Math.random() * 20) + 1;
    
    let naturalRoll = roll1;
    let logRolls = `[${roll1}]`;

    if (mode === 'advantage') {
      naturalRoll = Math.max(roll1, roll2);
      logRolls = `[${roll1}, ${roll2}] (Vantagem: ${naturalRoll})`;
    } else if (mode === 'disadvantage') {
      naturalRoll = Math.min(roll1, roll2);
      logRolls = `[${roll1}, ${roll2}] (Desvantagem: ${naturalRoll})`;
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
    resistanceMultiplier = 1 // 0.5 para resistência, 2 para vulnerabilidade
  ): ActionResult {
    const parsed = this.parseAndRoll(diceString);
    const modifiers = modifier + itemBonus;
    
    let rawTotal = parsed.total + modifiers;
    // Dano não pode ser negativo
    if (rawTotal < 0) rawTotal = 0;

    const finalTotal = Math.floor(rawTotal * resistanceMultiplier);

    let log = `Dados: ${parsed.log} + Mod: ${modifier}`;
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
   * Lógica inteligente de Armadura
   */
  calculateAC(armorType: 'heavy' | 'medium' | 'light' | 'none', baseAC: number, dexModifier: number, shieldBonus = 0): number {
    let effectiveDexMod = dexModifier;
    
    if (armorType === 'heavy') {
      effectiveDexMod = 0; // Ignora Destreza
    } else if (armorType === 'medium') {
      effectiveDexMod = Math.min(dexModifier, 2); // Limita Destreza a +2
    }
    // 'light' e 'none' usam a Destreza total
    
    return baseAC + effectiveDexMod + shieldBonus;
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
    // Nível 1: Dado cheio + Mod Con
    let totalHp = hitDice + conModifier;
    
    // Níveis seguintes: Média arredondada para cima (hitDice / 2 + 1) + Mod Con
    if (level > 1) {
      const averageHpPerLevel = Math.floor(hitDice / 2) + 1;
      totalHp += (level - 1) * (averageHpPerLevel + conModifier);
    }
    
    return Math.max(totalHp, level); // Mínimo 1 PV por nível
  }

  // ==========================================
  // 5. Exploração
  // ==========================================

  calculatePassivePerception(wisModifier: number, proficiency: number, hasExpertise = false): number {
    const profBonus = hasExpertise ? proficiency * 2 : proficiency;
    return 10 + wisModifier + profBonus;
  }

  calculateCarryingCapacity(strScore: number): number {
    return strScore * 15;
  }

  calculateJumpDistance(strScore: number, strModifier: number): { long: number, high: number } {
    return {
      long: strScore, // Em pés
      high: Math.max(0, 3 + strModifier) // Em pés
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
