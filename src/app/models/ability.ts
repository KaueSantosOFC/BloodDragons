export type AreaShape = 'cone' | 'line' | 'circle' | 'rectangle' | 'none';

export interface Ability {
  id: string;
  name: string;
  type: 'action' | 'bonus_action' | 'reaction' | 'passive';
  range: number; // in meters
  areaShape: AreaShape;
  angle?: number; // for cone
  width?: number; // for line or rectangle
  length?: number; // for line or rectangle
  radius?: number; // for circle
  damage: string; // e.g., "8d6"
  damageType: string;
  healing?: string; // e.g., "2d4+2"
  description: string;
  
  attackBonus?: number; // e.g., +5 to hit
  
  category?: 'weapon' | 'spell' | 'feature';
  spellLevel?: number;
  uses?: number;
  maxUses?: number;
  manaCost?: number;
}
