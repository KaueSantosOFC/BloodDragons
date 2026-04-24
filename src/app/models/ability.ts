export type AreaShape = 'cone' | 'line' | 'circle' | 'rectangle' | 'none';

export interface Ability {
  id: string;
  name: string;
  type: 'action' | 'bonus_action' | 'reaction' | 'passive';
  range: number; // in meters
  areaShape?: AreaShape;
  angle?: number; // for cone
  width?: number; // for line or rectangle
  length?: number; // for line or rectangle
  radius?: number; // for circle
  damage?: string; // e.g., "8d6"
  damageType?: string;
  healing?: string; // e.g., "2d4+2"
  description: string;
  
  applyCondition?: { conditionId: string; duration?: number }; // applies a condition on hit / failed save
  
  attackBonus?: number; // e.g., +5 to hit
  damageBonus?: number; // e.g., +3 to damage
  isProficient?: boolean;
  isOffHand?: boolean; // Off-hand attacks do NOT add positive ability modifiers to damage
  saveAttribute?: 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha'; // If present, forces a saving throw instead of an attack roll
  
  category?: 'weapon' | 'spell' | 'feature' | 'item_effect';
  properties?: string[]; // e.g., ['finesse', 'ranged', 'heavy']
  spellLevel?: number;
  uses?: number;
  maxUses?: number;
}
