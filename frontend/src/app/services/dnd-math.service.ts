import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DndMathService {
  
  /**
   * Calcula distância em METROS (1 quadrado = 1.5m).
   */
  calculateDistanceMeters(x1: number, y1: number, x2: number, y2: number): number {
    const dx = Math.abs(x2 - x1);
    const dy = Math.abs(y2 - y1);
    const diagonalSteps = Math.min(dx, dy);
    const orthogonalSteps = Math.max(dx, dy) - diagonalSteps;
    const distanceSquares = orthogonalSteps + diagonalSteps + Math.floor(diagonalSteps / 2);
    return distanceSquares * 1.5;
  }

  rollDice(sides: number, count = 1): number {
    let total = 0;
    const array = new Uint32Array(count);
    crypto.getRandomValues(array);
    for (let i = 0; i < count; i++) {
      total += (array[i] % sides) + 1;
    }
    return total;
  }

  calculateModifier(score: number): number {
    return Math.floor((score - 10) / 2);
  }

  /**
   * Calcula o bónus de proficiência baseado no Nível Total (Regra Oficial: ceil(nível / 4) + 1)
   */
  calculateProficiencyBonus(level: number): number {
    if (level < 1) return 2; // Nível base de 1 caso de erro
    return Math.ceil(level / 4) + 1;
  }

  /**
   * Calcula o HP Máximo ao subir de nível ou recriar ficha.
   * Regra Oficial: Max(Dado de Vida) + Mod Con no 1º nível.
   * Por cada nível após o 1º: Média do dado (arredondada p/ cima) + Mod Con.
   * O HP ganho por nível tem de ser no mínimo 1.
   */
  calculateMaxHpGain(hitDie: number, conModifier: number, isFirstLevel = false, isRolled = false): number {
    if (isFirstLevel) {
      return Math.max(1, hitDie + conModifier);
    }
    
    // Calcula média arredondada para cima. Ex: d8 -> media 4.5 -> 5. Matemática: (X/2) + 1
    const averageHitDie = Math.ceil(hitDie / 2) + 1; 
    
    if (isRolled) {
      const rolledValue = this.rollDice(hitDie, 1);
      return Math.max(1, rolledValue + conModifier);
    }
    
    return Math.max(1, averageHitDie + conModifier);
  }

  /**
   * Recalcula o HP Total (Max) do personagem do 1 ao nível atual de forma teórica 
   * Assumindo valores médios caso os rolagens de vida não sejam guardados individualmente.
   */
  calculateTotalMaxHp(level: number, hitDie: number, conScore: number): number {
    const conMod = this.calculateModifier(conScore);
    const hpPrimeiroNivel = this.calculateMaxHpGain(hitDie, conMod, true, false);
    
    if (level <= 1) return hpPrimeiroNivel;
    
    const hpSubsequenteMedia = this.calculateMaxHpGain(hitDie, conMod, false, false);
    return hpPrimeiroNivel + (hpSubsequenteMedia * (level - 1));
  }

  /**
   * Calcula a Classe de Armadura (AC) considerando as regras oficiais para evitar
   * sobreposição (stacking) incorreta de bônus, como Defesa Sem Armadura vs Armaduras.
   */
  calculateArmorClass(
    dexScore: number,
    conScore: number,
    wisScore: number,
    config: {
      armorBaseAc?: number;
      armorType: 'none' | 'light' | 'medium' | 'heavy';
      hasShield: boolean;
      unarmoredDefenseClass?: 'barbarian' | 'monk' | 'none';
      hasMediumArmorMaster?: boolean;
    }
  ): number {
    const dexMod = this.calculateModifier(dexScore);
    const conMod = this.calculateModifier(conScore);
    const wisMod = this.calculateModifier(wisScore);

    let calculatedAC = 10; // Default baseline

    // Shield bonus (+2)
    const shieldBonus = config.hasShield ? 2 : 0;

    if (config.armorType === 'none') {
      // Unarmored Calculations
      
      const standardUnarmored = 10 + dexMod;
      const barbarianUnarmored = 10 + dexMod + conMod; // Shield is allowed, but handled structurally later
      const monkUnarmored = 10 + dexMod + wisMod;      // Shield NOT allowed

      // Se é Monge e tem escudo equipado, as regras determinam que a C.A passa a ser a padrão.
      if (config.unarmoredDefenseClass === 'monk' && config.hasShield) {
         calculatedAC = standardUnarmored;
      }
      else if (config.unarmoredDefenseClass === 'barbarian') {
         // O jogador pode ter multiclasse Bárbaro/Monge. As regras dizem que se ganha "Unarmored Defense" de uma classe, não ganha da outra. Vamos priorizar a declaração do config.
         calculatedAC = Math.max(standardUnarmored, barbarianUnarmored);
      }
      else if (config.unarmoredDefenseClass === 'monk' && !config.hasShield) {
         calculatedAC = Math.max(standardUnarmored, monkUnarmored);
      }
      else {
         calculatedAC = standardUnarmored;
      }

    } else if (config.armorType === 'light') {
      // Base + Mod Dex
      const base = config.armorBaseAc || 11; // 11 is baseline for padded/leather 
      calculatedAC = base + dexMod;
      
    } else if (config.armorType === 'medium') {
      // Base + Mod Dex (Max 2, or Max 3 if mastered)
      const base = config.armorBaseAc || 12; // 12 baseline for hide
      const maxDex = config.hasMediumArmorMaster ? 3 : 2;
      calculatedAC = base + Math.min(Math.max(0, dexMod), maxDex); // Dex penalities still apply normally, but positive stays within bound.
      // Retracting: actually D&D bounds the modifier. Math.min(dexMod, maxDex) works for both positives and negatives.
      calculatedAC = base + Math.min(dexMod, maxDex);

    } else if (config.armorType === 'heavy') {
      // Base only. Dex is ignored completely regardless if positive or negative.
      const base = config.armorBaseAc || 14; // 14 baseline for ring mail
      calculatedAC = base;
    }

    return calculatedAC + shieldBonus;
  }

  // --- Geometria de Combate (Correção de AoE) ---

  isPointInCircle(px: number, py: number, cx: number, cy: number, radius: number): boolean {
    const dist = Math.hypot(px - cx, py - cy);
    return dist <= radius;
  }

  isPointInCone(
    px: number, py: number, 
    originX: number, originY: number, 
    targetX: number, targetY: number, 
    range: number, angleDegrees: number
  ): boolean {
    const dist = Math.hypot(px - originX, py - originY);
    if (dist > range) return false;
    if (dist === 0) return true; // O próprio token de origem não costuma ser afetado, mas matematicamente está dentro

    // Vetor Origem -> Alvo (Direção do Cone)
    const angleToTarget = Math.atan2(targetY - originY, targetX - originX);
    
    // Vetor Origem -> Ponto (Token Inimigo)
    const angleToPoint = Math.atan2(py - originY, px - originX);

    // Diferença angular normalizada (-PI a +PI)
    let angleDiff = angleToPoint - angleToTarget;
    while (angleDiff <= -Math.PI) angleDiff += 2 * Math.PI;
    while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;

    const halfAngleRad = (angleDegrees * Math.PI) / 360; // divide por 2 e converte pra rad
    return Math.abs(angleDiff) <= halfAngleRad;
  }

  isPointInLine(
    px: number, py: number,
    originX: number, originY: number,
    targetX: number, targetY: number,
    length: number, width: number
  ): boolean {
    // Vetor da linha (Normalizado)
    const dx = targetX - originX;
    const dy = targetY - originY;
    const mag = Math.hypot(dx, dy);
    
    if (mag === 0) return false;
    
    const uX = dx / mag;
    const uY = dy / mag;

    // Vetor Origem -> Ponto
    const dpx = px - originX;
    const dpy = py - originY;

    // Projeção escalar (quão longe na linha o ponto está)
    const scalarProjection = dpx * uX + dpy * uY;

    // Rejeita se estiver antes da origem ou depois do fim
    if (scalarProjection < 0 || scalarProjection > length) return false;

    // Distância perpendicular (quão longe do "centro" da linha o ponto está)
    // Cross product 2D
    const perpDist = Math.abs(dpx * uY - dpy * uX);

    return perpDist <= (width / 2);
  }

  isPointInRect(
    px: number, py: number,
    centerX: number, centerY: number,
    width: number, height: number
  ): boolean {
    return Math.abs(px - centerX) <= width / 2 && Math.abs(py - centerY) <= height / 2;
  }
}