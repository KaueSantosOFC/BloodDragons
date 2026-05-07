import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { CombatService } from '../../services/combat.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-combat-tracker',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="pointer-events-auto bg-stone-900/95 border border-stone-700 rounded-lg shadow-2xl flex flex-col overflow-hidden max-h-full backdrop-blur-sm w-64">
      <!-- Header -->
      <div class="bg-stone-800 p-3 border-b border-stone-700 flex items-center justify-between">
        <h3 class="font-bold text-amber-500 flex items-center gap-2 text-sm">
          <mat-icon style="font-size: 16px; width: 16px; height: 16px;">swords</mat-icon>
          Iniciativa
        </h3>
        
        @if (auth.currentUser()?.role === 'GM') {
          <div class="flex gap-1">
            <button class="bg-stone-700 hover:bg-stone-600 p-1 rounded text-stone-300 transition-colors" (click)="combat.previousTurn()" title="Turno Anterior">
              <mat-icon style="font-size: 16px; width: 16px; height: 16px;">navigate_before</mat-icon>
            </button>
            <button class="bg-stone-700 hover:bg-stone-600 p-1 rounded text-stone-300 transition-colors" (click)="combat.nextTurn()" title="Próximo Turno">
              <mat-icon style="font-size: 16px; width: 16px; height: 16px;">navigate_next</mat-icon>
            </button>
            <button class="bg-red-900/80 hover:bg-red-800 p-1 rounded text-red-300 transition-colors ml-1" (click)="combat.endCombat()" title="Encerrar Combate">
              <mat-icon style="font-size: 16px; width: 16px; height: 16px;">close</mat-icon>
            </button>
          </div>
        }
      </div>

      <!-- List -->
      <div class="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
        @for (token of combat.initiativeOrder(); track token.id; let i = $index) {
          <div class="relative p-2 rounded border border-stone-800 bg-stone-800/50 flex items-center gap-3 transition-colors cursor-pointer"
               [class.!border-amber-500]="combat.activeTurnIndex() === i"
               [class.bg-stone-800]="combat.activeTurnIndex() === i"
               [class.shadow-[0_0_10px_rgba(245,158,11,0.3)]]="combat.activeTurnIndex() === i"
               tabindex="0"
               (keydown.enter)="combat.selectToken(token.id); combat.pan.set({x: -token.x * 64, y: -token.y * 64})"
               (click)="combat.selectToken(token.id); combat.pan.set({x: -token.x * 64, y: -token.y * 64})">

            <!-- Active Indicator -->
            @if (combat.activeTurnIndex() === i) {
              <div class="absolute -left-1 w-2 h-0.5 bg-amber-500 rounded-r shadow-[0_0_5px_#f59e0b]"></div>
              <div class="absolute inset-0 bg-amber-500/5 rounded pointer-events-none animate-pulse"></div>
            }

            <div class="w-8 h-8 rounded-full border border-stone-600 overflow-hidden shrink-0 bg-stone-900">
              @if (token.imageUrl) {
                <img [src]="token.imageUrl" class="w-full h-full object-cover" referrerpolicy="no-referrer" alt="Token">
              } @else {
                <div class="w-full h-full" [style.backgroundColor]="token.color"></div>
              }
            </div>

            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between">
                <span class="font-bold text-xs truncate max-w-[100px]"
                      [class.text-red-400]="token.type === 'enemy' || token.type === 'boss'"
                      [class.text-blue-400]="token.type === 'npc'"
                      [class.text-stone-200]="token.type === 'player'">
                  {{ token.name }}
                </span>
                <span class="text-[10px] font-mono font-bold text-stone-500 border border-stone-700 px-1 rounded bg-stone-900">
                  {{ token.initiative }}
                </span>
              </div>
              
              <!-- Mini HP Bar -->
              <div class="h-1 bg-red-950 rounded-full mt-1 overflow-hidden border border-red-900">
                <div class="h-full bg-green-500 transition-all" [style.width.%]="(token.hp / token.maxHp) * 100"></div>
              </div>
              
              <!-- Conditions row (if any) -->
              @if (token.conditions.length) {
                <div class="mt-1 flex flex-wrap gap-0.5">
                  @for (cond of token.conditions; track cond.id) {
                    <div class="w-3.5 h-3.5 bg-stone-900 rounded border border-stone-700 flex items-center justify-center" [title]="cond.name">
                      <mat-icon style="font-size: 10px; width: 10px; height: 10px;" [style.color]="cond.color">{{ cond.icon }}</mat-icon>
                    </div>
                  }
                </div>
              }
            </div>
            
            @if (token.hp <= 0 && token.maxHp > 0) {
              <div class="absolute inset-0 bg-black/60 rounded flex items-center justify-center pointer-events-none">
                <span class="text-red-600 font-black text-xl rotate-12 opacity-80 uppercase tracking-widest text-shadow">Morto</span>
              </div>
            }
          </div>
        } @empty {
          <div class="text-xs text-stone-500 text-center italic p-4">
            Nenhum combatente ativo.
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .text-shadow { text-shadow: 0 0 5px rgba(0,0,0,1); }
  `]
})
export class CombatTrackerComponent {
  combat = inject(CombatService);
  auth = inject(AuthService);
}
