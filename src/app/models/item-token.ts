export interface ItemAction {
  id: string;
  name: string;
  skill: string;
  dc: number;
  successDescription: string;
  failureDescription: string;
  isRevealed: boolean;
}

export interface ItemToken {
  id: string;
  x: number;
  y: number;
  name: string;
  imageUrl?: string;
  
  level?: number;
  damage?: string;
  damageType?: string;
  healing?: string;
  movement?: number;
  description?: string;
  
  actions: ItemAction[];
  isPickedUp: boolean;
}
