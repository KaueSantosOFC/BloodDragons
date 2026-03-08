import { Injectable, signal } from '@angular/core';
import { Ability } from '../models/ability';
import { Token } from '../models/token';

@Injectable({ providedIn: 'root' })
export class CombatService {
  previewAbility = signal<Ability | null>(null);
  previewOrigin = signal<{x: number, y: number} | null>(null);
  previewTarget = signal<{x: number, y: number} | null>(null);
  
  startPreview(ability: Ability, originToken: Token) {
    this.previewAbility.set(ability);
    this.previewOrigin.set({ x: originToken.x, y: originToken.y });
    // Default target to origin to avoid nulls
    this.previewTarget.set({ x: (originToken.x + 0.5) * 64, y: (originToken.y + 0.5) * 64 });
  }

  updateTarget(x: number, y: number) {
    this.previewTarget.set({ x, y });
  }

  cancelPreview() {
    this.previewAbility.set(null);
    this.previewOrigin.set(null);
    this.previewTarget.set(null);
  }
}
