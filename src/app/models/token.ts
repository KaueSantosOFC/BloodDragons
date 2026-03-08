export interface Token {
  id: string;
  name: string;
  characterId?: string;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  conditions: string[];
  controlledBy: string;
  color: string;
  imageUrl?: string;
}
