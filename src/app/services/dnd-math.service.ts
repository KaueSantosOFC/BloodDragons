import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DndMathService {
  
  /**
   * Calculate distance using the "5-10-5" diagonal rule (DMG p.252).
   * Formula: DistanceSquares = OrthogonalSteps + DiagonalSteps + floor(DiagonalSteps / 2).
   * Returns distance in METERS (1 square = 1.5m).
   */
  calculateDistanceMeters(x1: number, y1: number, x2: number, y2: number): number {
    const dx = Math.abs(x2 - x1);
    const dy = Math.abs(y2 - y1);
    
    const diagonalSteps = Math.min(dx, dy);
    const orthogonalSteps = Math.max(dx, dy) - diagonalSteps;
    
    const distanceSquares = orthogonalSteps + diagonalSteps + Math.floor(diagonalSteps / 2);
    return distanceSquares * 1.5;
  }

  /**
   * Use crypto.getRandomValues() for secure RNG.
   */
  rollDice(sides: number, count = 1): number {
    let total = 0;
    const array = new Uint32Array(count);
    crypto.getRandomValues(array);
    
    for (let i = 0; i < count; i++) {
      total += (array[i] % sides) + 1;
    }
    
    return total;
  }

  /**
   * Modifiers: floor((Score - 10) / 2).
   */
  abilityModifier(score: number): number {
    return Math.floor((score - 10) / 2);
  }

  initiativeRoll(dexScore: number, bonus = 0): number {
    return this.rollDice(20) + this.abilityModifier(dexScore) + bonus;
  }

  attackRoll(statScore: number, proficiencyBonus: number, otherBonus = 0): number {
    return this.rollDice(20) + this.abilityModifier(statScore) + proficiencyBonus + otherBonus;
  }

  savingThrow(statScore: number, isProficient: boolean, proficiencyBonus: number, otherBonus = 0): number {
    const prof = isProficient ? proficiencyBonus : 0;
    return this.rollDice(20) + this.abilityModifier(statScore) + prof + otherBonus;
  }

  skillCheck(statScore: number, isProficient: boolean, hasExpertise: boolean, proficiencyBonus: number): number {
    let prof = 0;
    if (isProficient) prof += proficiencyBonus;
    if (hasExpertise) prof += proficiencyBonus;
    return this.rollDice(20) + this.abilityModifier(statScore) + prof;
  }

  spellSaveDC(statScore: number, proficiencyBonus: number, otherBonus = 0): number {
    return 8 + this.abilityModifier(statScore) + proficiencyBonus + otherBonus;
  }
}
