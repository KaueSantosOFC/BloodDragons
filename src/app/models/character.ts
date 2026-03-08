export enum CharacterClass {
  Barbarian = 'Barbarian',
  Bard = 'Bard',
  Cleric = 'Cleric',
  Druid = 'Druid',
  Fighter = 'Fighter',
  Monk = 'Monk',
  Paladin = 'Paladin',
  Ranger = 'Ranger',
  Rogue = 'Rogue',
  Sorcerer = 'Sorcerer',
  Warlock = 'Warlock',
  Wizard = 'Wizard',
  Artificer = 'Artificer'
}

export enum CharacterRace {
  Dragonborn = 'Dragonborn',
  Dwarf = 'Dwarf',
  Elf = 'Elf',
  Gnome = 'Gnome',
  HalfElf = 'Half-Elf',
  Halfling = 'Halfling',
  HalfOrc = 'Half-Orc',
  Human = 'Human',
  Tiefling = 'Tiefling'
}

export interface CharacterSheet {
  id: string;
  ownerId: string; // User ID
  campaignId: string;
  
  // Fluff / Bio
  name: string;
  characterClass: CharacterClass;
  race: CharacterRace;
  level: number;
  publicDescription: string;
  gmOnlyNotes?: string; // Visible only to DM
  
  // Core Stats
  attributes: {
    str: { base: number; saveProficiency: boolean };
    dex: { base: number; saveProficiency: boolean };
    con: { base: number; saveProficiency: boolean };
    int: { base: number; saveProficiency: boolean };
    wis: { base: number; saveProficiency: boolean };
    cha: { base: number; saveProficiency: boolean };
  };
  
  // Combat Stats
  combat: {
    hp: { current: number; max: number; temp: number };
    ac: { base: number; shield: boolean; armorType: 'light'|'medium'|'heavy'|'none' };
    speed: number;
    initiativeBonus: number; // Manual override
    deathSaves: { successes: number; failures: number };
  };
  
  // Skills (Key-Value for O(1) access)
  skills: Record<string, { proficient: boolean; expertise: boolean }>; // e.g., 'stealth': {true, true}
  
  // Inventory & Spells
  inventory: { name: string; quantity: number; weight: number; isEquipped: boolean }[];
  spells: {
     slots: { 
       level1: { max: number; used: number };
       level2: { max: number; used: number };
       level3: { max: number; used: number };
       level4: { max: number; used: number };
       level5: { max: number; used: number };
       level6: { max: number; used: number };
       level7: { max: number; used: number };
       level8: { max: number; used: number };
       level9: { max: number; used: number };
     };
     known: { name: string; level: number; prepared: boolean }[];
  };
}
