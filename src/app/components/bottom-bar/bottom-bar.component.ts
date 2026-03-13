import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CombatService } from '../../services/combat.service';
import { DndMathService } from '../../services/dnd-math.service';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-bottom-bar',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="h-14 bg-stone-900 border-t border-stone-800 flex items-center justify-between px-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.3)] z-30 relative">
      
      <!-- Left: App Info -->
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-full bg-stone-800 border border-stone-700 flex items-center justify-center text-xs font-bold text-stone-400">
          BD
        </div>
        <div class="flex flex-col">
          <span class="text-sm font-bold text-stone-200"><span class="text-red-600">Blood</span>Dragons 1.1</span>
          <span class="text-[10px] font-mono text-amber-500">{{ currentUser()?.role }}</span>
        </div>
      </div>

      <!-- Center: Quick Actions -->
      <div class="flex gap-2 relative">
        <!-- Dice Tray Popover -->
        @if (showDiceTray()) {
          <div class="absolute bottom-16 left-1/2 -translate-x-1/2 bg-stone-900 border border-stone-700 rounded-lg shadow-xl p-3 w-64 z-50">
            <div class="flex justify-between items-center mb-2">
              <div class="text-[10px] font-mono text-stone-500 uppercase">Bandeja de Dados</div>
              <button class="text-stone-500 hover:text-stone-300" (click)="showDiceTray.set(false)">
                <mat-icon style="font-size: 14px; width: 14px; height: 14px;">close</mat-icon>
              </button>
            </div>
            <div class="grid grid-cols-4 gap-2">
              @for (sides of [4, 6, 8, 10, 12, 20, 100]; track sides) {
                <button class="bg-stone-800 hover:bg-amber-600 hover:text-stone-900 border border-stone-700 rounded py-1 text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 group"
                        (click)="rollDice(sides)">
                  <span class="text-[10px] text-stone-500 group-hover:text-stone-900">d{{ sides }}</span>
                  <mat-icon class="text-amber-500 group-hover:text-stone-900" style="font-size: 16px; width: 16px; height: 16px;">casino</mat-icon>
                </button>
              }
            </div>
            @if (lastRollResult() !== null) {
              <div class="mt-3 bg-stone-800 rounded p-2 text-center border border-stone-700">
                <div class="text-[10px] text-stone-400 uppercase">Resultado (d{{ lastRollSides() }})</div>
                <div class="font-mono font-bold text-amber-500 text-2xl">{{ lastRollResult() }}</div>
              </div>
            }
          </div>
        }

        <!-- Character Sheets Popover -->
        @if (showSheetList()) {
          <div class="absolute bottom-16 left-1/2 -translate-x-1/2 bg-stone-900 border border-stone-700 rounded-lg shadow-xl p-3 w-64 z-50 max-h-96 flex flex-col">
            <div class="flex justify-between items-center mb-2 shrink-0">
              <div class="text-[10px] font-mono text-stone-500 uppercase">Fichas de Personagem</div>
              <button class="text-stone-500 hover:text-stone-300" (click)="showSheetList.set(false)">
                <mat-icon style="font-size: 14px; width: 14px; height: 14px;">close</mat-icon>
              </button>
            </div>
            
            <!-- Search Bar -->
            <div class="relative mb-3 shrink-0">
              <mat-icon class="absolute left-2 top-1/2 -translate-y-1/2 text-stone-500" style="font-size: 16px; width: 16px; height: 16px;">search</mat-icon>
              <input type="text" 
                     [value]="searchQuery()" 
                     (input)="updateSearchQuery($event)"
                     placeholder="Buscar tokens..." 
                     class="w-full bg-stone-800 border border-stone-700 rounded pl-8 pr-2 py-1.5 text-xs text-stone-300 focus:outline-none focus:border-amber-500 transition-colors">
            </div>
            
            <div class="space-y-4 overflow-y-auto pr-1">
              @if (groupedTokens().player.length) {
                <div>
                  <div class="text-[10px] font-bold text-amber-500 uppercase border-b border-stone-800 pb-1 mb-2">Jogadores</div>
                  <div class="flex flex-col gap-1">
                    @for (token of groupedTokens().player; track token.id) {
                      <button class="text-left px-2 py-1.5 text-xs text-stone-300 hover:bg-stone-800 hover:text-amber-500 rounded transition-colors" (click)="openSheet(token.id)">
                        {{ token.name }} <span class="text-stone-500 text-[10px]">(Jogador)</span>
                      </button>
                    }
                  </div>
                </div>
              }
              
              @if (groupedTokens().boss.length) {
                <div>
                  <div class="text-[10px] font-bold text-amber-500 uppercase border-b border-stone-800 pb-1 mb-2">Chefes</div>
                  <div class="flex flex-col gap-1">
                    @for (token of groupedTokens().boss; track token.id) {
                      <button class="text-left px-2 py-1.5 text-xs text-stone-300 hover:bg-stone-800 hover:text-amber-500 rounded transition-colors" (click)="openSheet(token.id)">
                        {{ token.name }} <span class="text-stone-500 text-[10px]">(Chefe)</span>
                      </button>
                    }
                  </div>
                </div>
              }

              @if (groupedTokens().enemy.length) {
                <div>
                  <div class="text-[10px] font-bold text-amber-500 uppercase border-b border-stone-800 pb-1 mb-2">Inimigos</div>
                  <div class="flex flex-col gap-1">
                    @for (token of groupedTokens().enemy; track token.id) {
                      <button class="text-left px-2 py-1.5 text-xs text-stone-300 hover:bg-stone-800 hover:text-amber-500 rounded transition-colors" (click)="openSheet(token.id)">
                        {{ token.name }} <span class="text-stone-500 text-[10px]">(Inimigo)</span>
                      </button>
                    }
                  </div>
                </div>
              }

              @if (groupedTokens().npc.length) {
                <div>
                  <div class="text-[10px] font-bold text-amber-500 uppercase border-b border-stone-800 pb-1 mb-2">NPCs</div>
                  <div class="flex flex-col gap-1">
                    @for (token of groupedTokens().npc; track token.id) {
                      <button class="text-left px-2 py-1.5 text-xs text-stone-300 hover:bg-stone-800 hover:text-amber-500 rounded transition-colors" (click)="openSheet(token.id)">
                        {{ token.name }} <span class="text-stone-500 text-[10px]">(NPC)</span>
                      </button>
                    }
                  </div>
                </div>
              }
            </div>
          </div>
        }

        <button class="w-10 h-10 rounded-full bg-stone-800 border border-stone-700 text-stone-400 flex items-center justify-center hover:bg-stone-700 hover:text-amber-500 hover:border-amber-500/50 transition-all" 
                [class.text-amber-500]="showDiceTray()"
                [class.border-amber-500]="showDiceTray()"
                (click)="toggleDiceTray()"
                title="Rolar Dados">
          <mat-icon style="font-size: 20px; width: 20px; height: 20px;">casino</mat-icon>
        </button>
        <button class="w-10 h-10 rounded-full bg-stone-800 border border-stone-700 text-stone-400 flex items-center justify-center hover:bg-stone-700 hover:text-amber-500 hover:border-amber-500/50 transition-all" 
                [class.text-amber-500]="showSheetList()"
                [class.border-amber-500]="showSheetList()"
                (click)="toggleSheetList()"
                title="Fichas de Personagem">
          <mat-icon style="font-size: 20px; width: 20px; height: 20px;">assignment_ind</mat-icon>
        </button>
        <div class="w-px h-6 bg-stone-700 mx-1 self-center"></div>
        
        @if (currentUser()?.role === 'GM') {
          <button class="relative w-10 h-10 rounded-full bg-stone-800 border border-stone-700 text-stone-400 flex items-center justify-center hover:bg-stone-700 hover:text-amber-500 hover:border-amber-500/50 transition-all" 
                  [class.text-amber-500]="combat.showStorySlides()"
                  [class.border-amber-500]="combat.showStorySlides()"
                  [class.bg-amber-500/10]="combat.showStorySlides()"
                  [class.shadow-[0_0_15px_rgba(245,158,11,0.2)]]="combat.showStorySlides()"
                  (click)="combat.showStorySlides.set(!combat.showStorySlides())"
                  title="Alternar Slides da História">
            <mat-icon style="font-size: 20px; width: 20px; height: 20px;">photo_library</mat-icon>
            @if (combat.showStorySlides()) {
              <span class="absolute top-0 right-0 w-2.5 h-2.5 bg-amber-500 rounded-full border-2 border-stone-900 animate-pulse"></span>
            }
          </button>
        }

        <button class="w-10 h-10 rounded-full bg-stone-800 border border-stone-700 text-stone-400 flex items-center justify-center hover:bg-stone-700 hover:text-amber-500 hover:border-amber-500/50 transition-all" 
                [class.text-amber-500]="combat.showGrid()"
                [class.border-amber-500]="combat.showGrid()"
                (click)="combat.showGrid.set(!combat.showGrid())"
                title="Alternar Grade">
          <mat-icon style="font-size: 20px; width: 20px; height: 20px;">grid_on</mat-icon>
        </button>
        <button class="relative w-10 h-10 rounded-full bg-stone-800 border border-stone-700 text-stone-400 flex items-center justify-center hover:bg-stone-700 hover:text-amber-500 hover:border-amber-500/50 transition-all" 
                [class.text-amber-500]="combat.isMeasuring()"
                [class.border-amber-500]="combat.isMeasuring()"
                [class.bg-amber-500/10]="combat.isMeasuring()"
                [class.shadow-[0_0_15px_rgba(245,158,11,0.2)]]="combat.isMeasuring()"
                (click)="toggleMeasure()"
                title="Medir Distância">
          <mat-icon style="font-size: 20px; width: 20px; height: 20px;">straighten</mat-icon>
          @if (combat.isMeasuring()) {
            <span class="absolute top-0 right-0 w-2.5 h-2.5 bg-amber-500 rounded-full border-2 border-stone-900 animate-pulse"></span>
          }
        </button>
      </div>

      <!-- Right: UI Toggle -->
      <div class="w-[120px] flex justify-end">
        <button class="w-10 h-10 rounded-full bg-stone-800 border border-stone-700 text-stone-400 flex items-center justify-center hover:bg-stone-700 hover:text-amber-500 hover:border-amber-500/50 transition-all" 
                [class.text-amber-500]="!combat.uiVisible()"
                [class.border-amber-500]="!combat.uiVisible()"
                (click)="combat.uiVisible.set(!combat.uiVisible())"
                title="Alternar Painéis da UI">
          <mat-icon style="font-size: 20px; width: 20px; height: 20px;">
            {{ combat.uiVisible() ? 'fullscreen' : 'fullscreen_exit' }}
          </mat-icon>
        </button>
      </div>

    </div>
  `
})
export class BottomBarComponent {
  auth = inject(AuthService);
  combat = inject(CombatService);
  mathService = inject(DndMathService);
  currentUser = this.auth.currentUser;

  showDiceTray = signal<boolean>(false);
  showSheetList = signal<boolean>(false);
  searchQuery = signal<string>('');
  lastRollResult = signal<number | null>(null);
  lastRollSides = signal<number | null>(null);

  groupedTokens = computed(() => {
    const query = this.searchQuery().toLowerCase();
    const tokens = this.combat.tokens().filter(t => t.name.toLowerCase().includes(query));
    return {
      player: tokens.filter(t => t.type === 'player'),
      boss: tokens.filter(t => t.type === 'boss'),
      enemy: tokens.filter(t => t.type === 'enemy'),
      npc: tokens.filter(t => t.type === 'npc'),
    };
  });

  updateSearchQuery(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
  }

  toggleDiceTray() {
    this.showDiceTray.set(!this.showDiceTray());
    if (this.showDiceTray()) this.showSheetList.set(false);
  }

  toggleSheetList() {
    this.showSheetList.set(!this.showSheetList());
    if (this.showSheetList()) {
      this.showDiceTray.set(false);
      this.searchQuery.set(''); // Reset search when opening
    }
  }

  toggleMeasure() {
    this.combat.isMeasuring.set(!this.combat.isMeasuring());
    if (!this.combat.isMeasuring()) {
      this.combat.measureStart.set(null);
      this.combat.measureCurrent.set(null);
    }
  }

  openSheet(tokenId: string) {
    this.combat.selectedTokenId.set(tokenId);
    this.combat.uiVisible.set(true);
    this.combat.rightPanelTab.set('sheet');
    this.showSheetList.set(false);
  }

  rollDice(sides: number) {
    const result = this.mathService.rollDice(sides);
    this.lastRollResult.set(result);
    this.lastRollSides.set(sides);
  }
}
