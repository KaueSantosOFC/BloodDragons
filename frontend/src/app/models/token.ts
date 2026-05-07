import { Ability } from './ability';

export interface CharacterSheet {
  class: string;
  level: number;
  background: string;
  playerName: string;
  race: string;
  alignment: string;
  xp: number;
  hitDie: number;
  
  str: number;
  dex: number;
  con: number;
  int: number;
  wis: number;
  cha: number;
  
  ac: number;
  initiative: number;
  speed: number;
  
  proficiencyBonus: number;
  passivePerception: number;
  
  hp: number;
  maxHp: number;
  spellUses?: number;
  maxSpellUses?: number;
  spellcastingAbility?: 'int' | 'wis' | 'cha';
  
  cp?: number;
  sp?: number;
  ep?: number;
  gp?: number;
  pp?: number;
  backpack?: string;
  inventory?: { name: string; quantity: number; weight: number; isEquipped: boolean }[];
}

export interface TokenCondition {
  id: string;
  name: string;
  icon: string;
  color: string;
  damagePerTurn?: number;
}

export interface Token {
  id: string;
  name: string;
  characterId?: string;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  spellUses?: number;
  maxSpellUses?: number;
  conditions: TokenCondition[];
  controlledBy: string;
  color: string;
  imageUrl?: string;
  imageScale?: number;
  imageOffsetX?: number;
  imageOffsetY?: number;
  type?: 'player' | 'enemy' | 'npc' | 'boss' | 'item';
  abilities?: Ability[];
  sheet?: CharacterSheet;
  initiative?: number;
}
