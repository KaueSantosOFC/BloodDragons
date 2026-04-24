/**
 * D&D 5e Reference Data
 * Centralized options for character creation and sheet editing.
 * Based on .rules/compendio_completo_dnd5e_v2.md
 */

export interface Dnd5eClass {
  id: string;
  name: string;
  hitDie: number;
  spellcastingAbility: 'int' | 'wis' | 'cha' | 'none';
  icon: string; // Material Icon
  primaryAttributes: string[];
  weaponProficiencies: string[];   // 'simple', 'martial', or specific weapon names
  armorProficiencies: string[];    // 'light', 'medium', 'heavy', 'shields'
}

export const DND5E_CLASSES: Dnd5eClass[] = [
  { id: 'barbaro',     name: 'Bárbaro',     hitDie: 12, spellcastingAbility: 'none', icon: 'whatshot',        primaryAttributes: ['str', 'con'], weaponProficiencies: ['simple', 'martial'], armorProficiencies: ['light', 'medium', 'shields'] },
  { id: 'bardo',       name: 'Bardo',       hitDie: 8,  spellcastingAbility: 'cha',  icon: 'music_note',      primaryAttributes: ['cha'],        weaponProficiencies: ['simple', 'Espada Longa', 'Rapieira', 'Espada Curta'], armorProficiencies: ['light'] },
  { id: 'bruxo',       name: 'Bruxo',       hitDie: 8,  spellcastingAbility: 'cha',  icon: 'dark_mode',       primaryAttributes: ['cha'],        weaponProficiencies: ['simple'], armorProficiencies: ['light'] },
  { id: 'clerigo',     name: 'Clérigo',     hitDie: 8,  spellcastingAbility: 'wis',  icon: 'church',          primaryAttributes: ['wis'],        weaponProficiencies: ['simple'], armorProficiencies: ['light', 'medium', 'shields'] },
  { id: 'druida',      name: 'Druida',      hitDie: 8,  spellcastingAbility: 'wis',  icon: 'eco',             primaryAttributes: ['wis'],        weaponProficiencies: ['simple', 'Cimitarra'], armorProficiencies: ['light', 'medium', 'shields'] },
  { id: 'feiticeiro',  name: 'Feiticeiro',  hitDie: 6,  spellcastingAbility: 'cha',  icon: 'bolt',            primaryAttributes: ['cha'],        weaponProficiencies: ['simple'], armorProficiencies: [] },
  { id: 'guerreiro',   name: 'Guerreiro',   hitDie: 10, spellcastingAbility: 'none', icon: 'shield',          primaryAttributes: ['str', 'dex'], weaponProficiencies: ['simple', 'martial'], armorProficiencies: ['light', 'medium', 'heavy', 'shields'] },
  { id: 'ladino',      name: 'Ladino',      hitDie: 8,  spellcastingAbility: 'none', icon: 'visibility_off',  primaryAttributes: ['dex'],        weaponProficiencies: ['simple', 'Besta de Mão', 'Espada Longa', 'Rapieira', 'Espada Curta'], armorProficiencies: ['light'] },
  { id: 'mago',        name: 'Mago',        hitDie: 6,  spellcastingAbility: 'int',  icon: 'auto_stories',    primaryAttributes: ['int'],        weaponProficiencies: ['Adaga', 'Dardo', 'Funda', 'Bordão', 'Besta Leve'], armorProficiencies: [] },
  { id: 'monge',       name: 'Monge',       hitDie: 8,  spellcastingAbility: 'none', icon: 'self_improvement', primaryAttributes: ['dex', 'wis'], weaponProficiencies: ['simple', 'Espada Curta'], armorProficiencies: [] },
  { id: 'paladino',    name: 'Paladino',    hitDie: 10, spellcastingAbility: 'cha',  icon: 'gavel',           primaryAttributes: ['str', 'cha'], weaponProficiencies: ['simple', 'martial'], armorProficiencies: ['light', 'medium', 'heavy', 'shields'] },
  { id: 'patrulheiro', name: 'Patrulheiro', hitDie: 10, spellcastingAbility: 'wis',  icon: 'nature_people',   primaryAttributes: ['dex', 'wis'], weaponProficiencies: ['simple', 'martial'], armorProficiencies: ['light', 'medium', 'shields'] },
];

export interface Dnd5eRace {
  id: string;
  name: string;
  icon: string;
  abilityBonuses: string; // Human-readable summary
}

export const DND5E_RACES: Dnd5eRace[] = [
  { id: 'anao',       name: 'Anão',       icon: 'hardware',          abilityBonuses: 'CON +2' },
  { id: 'elfo',       name: 'Elfo',       icon: 'park',              abilityBonuses: 'DES +2' },
  { id: 'halfling',   name: 'Halfling',   icon: 'child_care',        abilityBonuses: 'DES +2' },
  { id: 'humano',     name: 'Humano',     icon: 'person',            abilityBonuses: '+1 em todos' },
  { id: 'draconato',  name: 'Draconato',  icon: 'local_fire_department', abilityBonuses: 'FOR +2, CAR +1' },
  { id: 'gnomo',      name: 'Gnomo',      icon: 'lightbulb',         abilityBonuses: 'INT +2' },
  { id: 'meio-elfo',  name: 'Meio-Elfo',  icon: 'diversity_3',       abilityBonuses: 'CAR +2, +1 x2' },
  { id: 'meio-orc',   name: 'Meio-Orc',   icon: 'fitness_center',    abilityBonuses: 'FOR +2, CON +1' },
  { id: 'tiefling',   name: 'Tiefling',   icon: 'whatshot',          abilityBonuses: 'CAR +2, INT +1' },
];

export interface Dnd5eAlignment {
  id: string;
  name: string;
  short: string;
}

export const DND5E_ALIGNMENTS: Dnd5eAlignment[] = [
  { id: 'lb', name: 'Leal e Bom',       short: 'LB' },
  { id: 'nb', name: 'Neutro e Bom',     short: 'NB' },
  { id: 'cb', name: 'Caótico e Bom',    short: 'CB' },
  { id: 'ln', name: 'Leal e Neutro',    short: 'LN' },
  { id: 'nn', name: 'Neutro',           short: 'N'  },
  { id: 'cn', name: 'Caótico e Neutro', short: 'CN' },
  { id: 'lm', name: 'Leal e Mau',       short: 'LM' },
  { id: 'nm', name: 'Neutro e Mau',     short: 'NM' },
  { id: 'cm', name: 'Caótico e Mau',    short: 'CM' },
];

export interface Dnd5eBackground {
  id: string;
  name: string;
  description: string;
}

export const DND5E_BACKGROUNDS: Dnd5eBackground[] = [
  { id: 'acolito',        name: 'Acólito',            description: 'Abrigo em templos' },
  { id: 'charlatao',      name: 'Charlatão',          description: 'Identidade falsa' },
  { id: 'criminoso',      name: 'Criminoso / Espião', description: 'Contatos no submundo' },
  { id: 'artista',        name: 'Artista',            description: 'Performances' },
  { id: 'heroi',          name: 'Herói do Povo',      description: 'Respeito das massas' },
  { id: 'artesao',        name: 'Artesão de Guilda',  description: 'Apoio de guilda' },
  { id: 'eremita',        name: 'Eremita',            description: 'Revelação espiritual' },
  { id: 'nobre',          name: 'Nobre',              description: 'Privilégios de casta' },
  { id: 'forasteiro',     name: 'Forasteiro',         description: 'Memória para mapas' },
  { id: 'sabio',          name: 'Sábio',              description: 'Pesquisador' },
  { id: 'marinheiro',     name: 'Marinheiro',         description: 'Passagem em navios' },
  { id: 'soldado',        name: 'Soldado',            description: 'Patente militar' },
  { id: 'orfao',          name: 'Órfão',              description: 'Passagens secretas' },
];

/** Helper: find class data by name (case-insensitive) */
export function findClassByName(name: string): Dnd5eClass | undefined {
  if (!name) return undefined;
  return DND5E_CLASSES.find(c => c.name.toLowerCase() === name.toLowerCase());
}
