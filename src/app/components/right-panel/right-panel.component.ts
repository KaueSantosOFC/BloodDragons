import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { DndMathService } from '../../services/dnd-math.service';
import { CombatService } from '../../services/combat.service';
import { AuthService } from '../../services/auth.service';
import { Ability } from '../../models/ability';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-right-panel',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-80 h-full bg-stone-900 border-l border-stone-800 flex flex-col text-stone-300">
      <!-- Tabs -->
      <div class="flex border-b border-stone-800 text-xs font-mono">
        <button class="flex-1 py-3 transition-colors" [class.text-amber-500]="activeTab() === 'chat'" [class.border-b-2]="activeTab() === 'chat'" [class.border-amber-500]="activeTab() === 'chat'" [class.bg-stone-800]="activeTab() === 'chat'" (click)="activeTab.set('chat')">Chat</button>
        <button class="flex-1 py-3 transition-colors" [class.text-amber-500]="activeTab() === 'abilities'" [class.border-b-2]="activeTab() === 'abilities'" [class.border-amber-500]="activeTab() === 'abilities'" [class.bg-stone-800]="activeTab() === 'abilities'" (click)="activeTab.set('abilities')">Abilities</button>
      </div>
      
      <!-- Chat Tab -->
      @if (activeTab() === 'chat') {
        <div class="flex-1 overflow-auto p-4 space-y-4 flex flex-col-reverse">
          <div class="bg-stone-800 rounded p-3 border border-stone-700 shadow-md">
            <div class="flex justify-between items-center mb-2">
              <span class="font-bold text-sm text-blue-400">Fighter Bob</span>
              <span class="text-xs text-stone-500">10:42 AM</span>
            </div>
            <div class="text-sm">Attacks with Longsword!</div>
            <div class="mt-2 bg-stone-900 rounded p-2 flex items-center justify-between border border-stone-700">
              <span class="text-xs text-stone-400">1d20 + 5</span>
              <span class="font-mono font-bold text-amber-500 text-lg">18</span>
            </div>
          </div>
        </div>
        <div class="p-3 border-t border-stone-800 bg-stone-900">
          <div class="flex gap-2">
            <input type="text" placeholder="Type a message..." class="flex-1 bg-stone-800 border border-stone-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-amber-500 transition-colors">
            <button class="bg-stone-800 hover:bg-stone-700 border border-stone-700 rounded px-3 py-2 transition-colors" (click)="rollTest()">
              <mat-icon class="text-amber-500 text-sm">casino</mat-icon>
            </button>
          </div>
        </div>
      }

      <!-- Abilities Tab -->
      @if (activeTab() === 'abilities') {
        <div class="flex-1 overflow-auto p-4 space-y-4">
          @if (combat.previewAbility()) {
            <div class="bg-amber-900/30 border border-amber-500/50 rounded p-3 text-sm text-amber-500 flex items-center gap-2 mb-4">
              <mat-icon>info</mat-icon>
              <span>Preview mode active. Click on the map to confirm attack.</span>
              <button class="ml-auto bg-stone-800 hover:bg-stone-700 text-stone-300 px-2 py-1 rounded text-xs" (click)="combat.cancelPreview()">Cancel</button>
            </div>
          }

          @for (ability of abilities(); track ability.id) {
            <div class="bg-stone-800 rounded border border-stone-700 overflow-hidden shadow-md">
              <div class="p-3 border-b border-stone-700 flex justify-between items-center bg-stone-800/50">
                <span class="font-bold text-amber-500">{{ ability.name }}</span>
                <span class="text-[10px] font-mono text-stone-400 uppercase bg-stone-900 px-2 py-1 rounded">{{ ability.type }}</span>
              </div>
              <div class="p-3 text-sm space-y-3">
                <p class="text-stone-400 text-xs">{{ ability.description }}</p>
                <div class="grid grid-cols-2 gap-2 text-xs font-mono bg-stone-900 p-2 rounded border border-stone-700">
                  <div><span class="text-stone-500">Range:</span> {{ ability.range }}m</div>
                  <div><span class="text-stone-500">Area:</span> <span class="capitalize">{{ ability.areaShape }}</span></div>
                  <div><span class="text-stone-500">Damage:</span> {{ ability.damage }}</div>
                  <div><span class="text-stone-500">Type:</span> <span class="capitalize">{{ ability.damageType }}</span></div>
                </div>
                <button class="w-full py-2 bg-stone-700 hover:bg-amber-600 hover:text-stone-900 text-stone-300 font-bold rounded transition-colors flex items-center justify-center gap-2"
                        (click)="useAbility(ability)">
                  <mat-icon class="text-sm">my_location</mat-icon> Use Ability
                </button>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `
})
export class RightPanelComponent {
  private mathService = inject(DndMathService);
  combat = inject(CombatService);
  auth = inject(AuthService);

  activeTab = signal<'chat' | 'abilities'>('abilities');

  abilities = signal<Ability[]>([
    {
      id: 'a1',
      name: 'Dragon Breath',
      type: 'action',
      range: 18,
      areaShape: 'cone',
      angle: 60,
      damage: '8d6',
      damageType: 'fire',
      description: 'Exhale destructive energy in a 18m cone.'
    },
    {
      id: 'a2',
      name: 'Lightning Bolt',
      type: 'action',
      range: 30,
      areaShape: 'line',
      width: 1.5,
      length: 30,
      damage: '8d6',
      damageType: 'lightning',
      description: 'A stroke of lightning forming a line 30m long and 1.5m wide.'
    },
    {
      id: 'a3',
      name: 'Fireball',
      type: 'action',
      range: 45,
      areaShape: 'circle',
      radius: 6,
      damage: '8d6',
      damageType: 'fire',
      description: 'A bright streak flashes from your pointing finger to a point you choose within range and then blossoms with a low roar into an explosion of flame.'
    },
    {
      id: 'a4',
      name: 'Wall of Fire',
      type: 'action',
      range: 36,
      areaShape: 'rectangle',
      width: 18,
      length: 1.5,
      damage: '5d8',
      damageType: 'fire',
      description: 'You create a wall of fire on a solid surface within range.'
    }
  ]);

  rollTest() {
    console.log('Rolled a d20:', this.mathService.rollDice(20));
  }

  useAbility(ability: Ability) {
    // In a real app, we'd get the current user's token.
    // For demo, we'll just use a mock origin token or a specific one.
    // Let's assume Fighter Bob (t1) is the origin.
    const originToken = { id: 't1', name: 'Fighter Bob', x: 2, y: 2, hp: 45, maxHp: 45, conditions: [], controlledBy: 'user_player_1', color: '#ef4444' };
    this.combat.startPreview(ability, originToken);
  }
}
