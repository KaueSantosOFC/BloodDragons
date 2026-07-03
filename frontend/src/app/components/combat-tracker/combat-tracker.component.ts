import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { CombatService, CONDITION_EFFECTS } from '../../services/combat.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-combat-tracker',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="pointer-events-auto bg-stone-900/95 border border-stone-700 rounded-lg shadow-2xl flex flex-col overflow-hidden max-h-full backdrop-blur-sm w-72">
      <!-- Header -->
      <div class="bg-stone-800 p-3 border-b border-stone-700">
        <div class="flex items-center justify-between mb-2">
          <h3 class="font-bold text-amber-500 flex items-center gap-2 text-sm">
            <mat-icon style="font-size: 16px; width: 16px; height: 16px;">swords</mat-icon>
            Rodada {{ combat.round() }}
          </h3>
          
          @if (auth.currentUser()?.role === 'GM') {
            <div class="flex gap-1">
              <button class="bg-stone-700 hover:bg-stone-600 p-1 rounded text-stone-300 transition-colors" (click)="combat.previousTurn()" title="Turno Anterior">
                <mat-icon style="font-size: 16px; width: 16px; height: 16px;">navigate_before</mat-icon>
              </button>
              <button class="bg-red-900/80 hover:bg-red-800 p-1 rounded text-red-300 transition-colors ml-1" (click)="combat.endCombat()" title="Encerrar Combate">
                <mat-icon style="font-size: 16px; width: 16px; height: 16px;">close</mat-icon>
              </button>
            </div>
          }
        </div>

        <!-- Turn State Panel (D&D 5e PHB p.189) -->
        @if (activeToken()) {
          <div class="bg-stone-950/80 rounded-lg p-2.5 space-y-2 border border-stone-800">
            <!-- Active Token Name -->
            <div class="flex items-center justify-between">
              <span class="text-xs font-black text-amber-400 uppercase tracking-wider">
                Turno de {{ activeToken()!.name }}
              </span>
            </div>

            <!-- Movement Bar -->
            <div class="space-y-1">
              <div class="flex items-center justify-between text-[10px]">
                <span class="text-stone-400 font-bold uppercase tracking-wider flex items-center gap-1">
                  <mat-icon style="font-size:12px;width:12px;height:12px;" class="text-blue-400">directions_run</mat-icon>
                  Movimento
                </span>
                <span class="font-mono font-bold" 
                      [class.text-blue-400]="combat.remainingMovement() > 0"
                      [class.text-red-400]="combat.remainingMovement() === 0">
                  {{ combat.turnState().movementUsed * 1.5 }}m / {{ combat.activeTokenMaxMovement() * 1.5 }}m
                </span>
              </div>
              <div class="h-1.5 bg-stone-900 rounded-full overflow-hidden border border-stone-800">
                <div 
                  class="h-full rounded-full transition-all duration-300"
                  [class.bg-blue-500]="combat.remainingMovement() > 0"
                  [class.bg-red-500]="combat.remainingMovement() === 0"
                  [style.width.%]="combat.activeTokenMaxMovement() > 0 ? ((combat.activeTokenMaxMovement() - combat.turnState().movementUsed) / combat.activeTokenMaxMovement()) * 100 : 0"
                ></div>
              </div>
            </div>

            <!-- Action Economy Indicators -->
            <div class="grid grid-cols-3 gap-1">
              <!-- Ação -->
              <div class="flex flex-col items-center p-1.5 rounded border transition-colors"
                   [class.bg-green-900/20]="!combat.turnState().actionUsed"
                   [class.border-green-500/30]="!combat.turnState().actionUsed"
                   [class.bg-stone-900/50]="combat.turnState().actionUsed"
                   [class.border-stone-700/50]="combat.turnState().actionUsed">
                <mat-icon style="font-size:14px;width:14px;height:14px;" 
                          [class.text-green-400]="!combat.turnState().actionUsed"
                          [class.text-stone-600]="combat.turnState().actionUsed">
                  {{ combat.turnState().actionUsed ? 'check_circle' : 'radio_button_unchecked' }}
                </mat-icon>
                <span class="text-[8px] font-bold uppercase tracking-wider mt-0.5"
                      [class.text-green-400]="!combat.turnState().actionUsed"
                      [class.text-stone-600]="combat.turnState().actionUsed">
                  Ação
                </span>
              </div>

              <!-- Ação Bônus -->
              <div class="flex flex-col items-center p-1.5 rounded border transition-colors"
                   [class.bg-amber-900/20]="!combat.turnState().bonusActionUsed"
                   [class.border-amber-500/30]="!combat.turnState().bonusActionUsed"
                   [class.bg-stone-900/50]="combat.turnState().bonusActionUsed"
                   [class.border-stone-700/50]="combat.turnState().bonusActionUsed">
                <mat-icon style="font-size:14px;width:14px;height:14px;" 
                          [class.text-amber-400]="!combat.turnState().bonusActionUsed"
                          [class.text-stone-600]="combat.turnState().bonusActionUsed">
                  {{ combat.turnState().bonusActionUsed ? 'check_circle' : 'radio_button_unchecked' }}
                </mat-icon>
                <span class="text-[8px] font-bold uppercase tracking-wider mt-0.5"
                      [class.text-amber-400]="!combat.turnState().bonusActionUsed"
                      [class.text-stone-600]="combat.turnState().bonusActionUsed">
                  Bônus
                </span>
              </div>

              <!-- Reação -->
              <div class="flex flex-col items-center p-1.5 rounded border transition-colors"
                   [class.bg-purple-900/20]="!combat.turnState().reactionUsed"
                   [class.border-purple-500/30]="!combat.turnState().reactionUsed"
                   [class.bg-stone-900/50]="combat.turnState().reactionUsed"
                   [class.border-stone-700/50]="combat.turnState().reactionUsed">
                <mat-icon style="font-size:14px;width:14px;height:14px;" 
                          [class.text-purple-400]="!combat.turnState().reactionUsed"
                          [class.text-stone-600]="combat.turnState().reactionUsed">
                  {{ combat.turnState().reactionUsed ? 'check_circle' : 'radio_button_unchecked' }}
                </mat-icon>
                <span class="text-[8px] font-bold uppercase tracking-wider mt-0.5"
                      [class.text-purple-400]="!combat.turnState().reactionUsed"
                      [class.text-stone-600]="combat.turnState().reactionUsed">
                  Reação
                </span>
              </div>
            </div>

            <!-- Quick Combat Actions (GM Only) -->
            @if (auth.currentUser()?.role === 'GM') {
              <div class="flex gap-1 pt-1">
                @if (!combat.turnState().dashActive && !combat.turnState().actionUsed) {
                  <button 
                    (click)="combat.useDash()"
                    class="flex-1 px-1.5 py-1 bg-stone-800 hover:bg-blue-900/40 border border-stone-700 hover:border-blue-500/30 text-[9px] text-stone-400 hover:text-blue-400 font-bold rounded transition-colors uppercase tracking-wider"
                    title="Disparada: Dobra o deslocamento neste turno. Consome a Ação."
                  >
                    Disparada
                  </button>
                }
                <button 
                  (click)="combat.nextTurn()"
                  class="flex-1 px-2 py-1.5 bg-red-700/80 hover:bg-red-600 text-white font-bold rounded text-[10px] transition-colors uppercase tracking-wider flex items-center justify-center gap-1 shadow-md"
                >
                  <mat-icon style="font-size:12px;width:12px;height:12px;">skip_next</mat-icon>
                  Finalizar Turno
                </button>
              </div>
            }
          </div>
        }
      </div>

      <!-- List -->
      <div class="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1.5">
        @for (token of combat.initiativeOrder(); track token.id; let i = $index) {
          <div class="relative p-2 rounded border border-stone-800 bg-stone-800/50 flex items-center gap-3 transition-all duration-200 cursor-pointer"
               [class.!border-amber-500]="combat.activeTurnIndex() === i && token.hp > 0"
               [class.bg-stone-800]="combat.activeTurnIndex() === i && token.hp > 0"
               [class.shadow-[0_0_10px_rgba(245,158,11,0.3)]]="combat.activeTurnIndex() === i && token.hp > 0"
               [class.opacity-40]="token.hp <= 0"
               tabindex="0"
               (keydown.enter)="combat.selectToken(token.id); combat.pan.set({x: -token.x * 64, y: -token.y * 64})"
               (click)="combat.selectToken(token.id); combat.pan.set({x: -token.x * 64, y: -token.y * 64})">

            <!-- Active Indicator -->
            @if (combat.activeTurnIndex() === i && token.hp > 0) {
              <div class="absolute -left-1 w-2 h-full bg-amber-500 rounded-r shadow-[0_0_5px_#f59e0b]"></div>
              <div class="absolute inset-0 bg-amber-500/5 rounded pointer-events-none"></div>
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
                <span class="font-bold text-xs truncate max-w-[110px]"
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
                <div class="h-full transition-all" 
                     [class.bg-green-500]="(token.hp / token.maxHp) > 0.5"
                     [class.bg-amber-500]="(token.hp / token.maxHp) > 0.25 && (token.hp / token.maxHp) <= 0.5"
                     [class.bg-red-500]="(token.hp / token.maxHp) <= 0.25"
                     [style.width.%]="(token.hp / token.maxHp) * 100"></div>
              </div>
              
              <!-- Conditions row with detailed tooltips -->
              @if (token.conditions.length) {
                <div class="mt-1 flex flex-wrap gap-0.5">
                  @for (cond of token.conditions; track cond.id) {
                    <div class="group relative w-4 h-4 bg-stone-900 rounded border border-stone-700 flex items-center justify-center cursor-help" 
                         [title]="cond.name + ': ' + getConditionEffect(cond.id)">
                      <mat-icon style="font-size: 10px; width: 10px; height: 10px;" [style.color]="cond.color">{{ cond.icon }}</mat-icon>
                      <!-- Tooltip -->
                      <div class="absolute left-full ml-2 bottom-0 hidden group-hover:block w-48 bg-stone-950 border border-stone-700 text-stone-300 text-[9px] rounded p-2 shadow-xl z-50 font-sans leading-tight pointer-events-none">
                        <div class="font-bold text-[10px] mb-1" [style.color]="cond.color">{{ cond.name }}</div>
                        <div class="text-stone-400">{{ getConditionEffect(cond.id) }}</div>
                      </div>
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

  activeToken = computed(() => {
    const id = this.combat.activeTokenId();
    if (!id) return null;
    return this.combat.tokens().find(t => t.id === id) || null;
  });

  getConditionEffect(conditionId: string): string {
    return CONDITION_EFFECTS[conditionId] || 'Efeito não catalogado.';
  }
}
