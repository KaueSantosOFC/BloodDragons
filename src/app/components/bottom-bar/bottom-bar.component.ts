import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CombatService } from '../../services/combat.service';
import { DndMathService } from '../../services/dnd-math.service';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

import { Token } from '../../models/token';

@Component({
  selector: 'app-bottom-bar',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="h-14 bg-stone-900 border-t border-stone-800 flex items-center justify-between px-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.3)] z-30 relative">
      
      <!-- Left: App Info -->
      <div class="flex items-center gap-4">
        <div class="flex flex-col">
          <span class="text-sm font-bold text-stone-200">The <span class="text-blue-500">Elden</span> <span class="text-red-600">Blood</span><span class="text-yellow-500">Moon</span> 1.2</span>
        </div>

        <!-- GM / Play Toggle -->
        @if (currentUser()?.role === 'GM') {
          <div class="flex bg-stone-950 rounded-full p-0.5 border border-stone-800 shadow-inner">
            <button class="px-3 py-1 rounded-full text-[10px] font-bold transition-all"
                    [class.bg-amber-600]="!combat.isPlayMode()"
                    [class.text-stone-900]="!combat.isPlayMode()"
                    [class.text-stone-500]="combat.isPlayMode()"
                    (click)="combat.isPlayMode.set(false)">
              GM
            </button>
            <button class="px-3 py-1 rounded-full text-[10px] font-bold transition-all"
                    [class.bg-amber-600]="combat.isPlayMode()"
                    [class.text-stone-900]="combat.isPlayMode()"
                    [class.text-stone-500]="!combat.isPlayMode()"
                    (click)="combat.isPlayMode.set(true)">
              PLAY
            </button>
          </div>
        }
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

            @if (selectedDieForInput() === null) {
              <div class="grid grid-cols-4 gap-2">
                @for (sides of [4, 6, 8, 10, 12, 20, 100]; track sides) {
                  <button class="bg-stone-800 hover:bg-amber-600 hover:text-stone-900 border border-stone-700 rounded py-1 text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 group"
                          (click)="selectDieForInput(sides)">
                    <span class="text-[10px] text-stone-500 group-hover:text-stone-900">d{{ sides }}</span>
                    <mat-icon class="text-amber-500 group-hover:text-stone-900" style="font-size: 16px; width: 16px; height: 16px;">casino</mat-icon>
                  </button>
                }
              </div>
            } @else {
              <div class="flex flex-col gap-2">
                <div class="text-xs text-stone-300 mb-1">Valor rolado no <strong>d{{ selectedDieForInput() }}</strong>:</div>
                
                @if (selectedDieForInput() === 100) {
                  <select #rollInput100 class="bg-stone-800 border border-stone-700 rounded px-2 py-2 text-sm text-stone-200 focus:outline-none focus:border-amber-500 w-full">
                    @for (val of [10, 20, 30, 40, 50, 60, 70, 80, 90, 100]; track val) {
                      <option [value]="val">{{ val }}</option>
                    }
                  </select>
                  @if (rollError()) {
                    <div class="text-red-500 text-[10px] mt-1 text-center font-bold">{{ rollError() }}</div>
                  }
                  <div class="flex gap-2 mt-2">
                    <button class="flex-1 py-1.5 bg-stone-700 hover:bg-stone-600 text-stone-300 text-xs font-bold rounded transition-colors" (click)="selectedDieForInput.set(null); rollError.set(null)">Cancelar</button>
                    <button class="flex-1 py-1.5 bg-amber-600 hover:bg-amber-500 text-stone-900 text-xs font-bold rounded transition-colors" (click)="confirmManualRoll(rollInput100.value)">Confirmar</button>
                  </div>
                } @else {
                  <input #rollInputOther type="number" [min]="1" [max]="selectedDieForInput()!" class="bg-stone-800 border border-stone-700 rounded px-2 py-2 text-sm text-stone-200 focus:outline-none focus:border-amber-500 w-full" [placeholder]="'1 a ' + selectedDieForInput()">
                  @if (rollError()) {
                    <div class="text-red-500 text-[10px] mt-1 text-center font-bold">{{ rollError() }}</div>
                  }
                  <div class="flex gap-2 mt-2">
                    <button class="flex-1 py-1.5 bg-stone-700 hover:bg-stone-600 text-stone-300 text-xs font-bold rounded transition-colors" (click)="selectedDieForInput.set(null); rollError.set(null)">Cancelar</button>
                    <button class="flex-1 py-1.5 bg-amber-600 hover:bg-amber-500 text-stone-900 text-xs font-bold rounded transition-colors" (click)="confirmManualRoll(rollInputOther.value)">Confirmar</button>
                  </div>
                }
              </div>
            }

            @if (lastRollResult() !== null && selectedDieForInput() === null) {
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
              
              @if (groupedTokens().boss.length && !combat.isPlayMode()) {
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

              @if (groupedTokens().enemy.length && !combat.isPlayMode()) {
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

              @if (groupedTokens().item.length && !combat.isPlayMode()) {
                <div>
                  <div class="text-[10px] font-bold text-amber-500 uppercase border-b border-stone-800 pb-1 mb-2">Itens</div>
                  <div class="flex flex-col gap-1">
                    @for (token of groupedTokens().item; track token.id) {
                      <button class="text-left px-2 py-1.5 text-xs text-stone-300 hover:bg-stone-800 hover:text-amber-500 rounded transition-colors" (click)="openSheet(token.id)">
                        {{ token.name }} <span class="text-stone-500 text-[10px]">(Item)</span>
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

        <!-- Rest Menu Popover -->
        @if (showRestMenu()) {
          <div class="absolute bottom-16 left-1/2 -translate-x-1/2 bg-stone-900 border border-stone-700 rounded-lg shadow-xl p-3 w-64 z-50">
            <div class="flex justify-between items-center mb-3">
              <div class="text-[10px] font-mono text-stone-500 uppercase">Gestão de Recursos</div>
              <button class="text-stone-500 hover:text-stone-300" (click)="showRestMenu.set(false)">
                <mat-icon style="font-size: 14px; width: 14px; height: 14px;">close</mat-icon>
              </button>
            </div>
            
            <div class="max-h-40 overflow-y-auto custom-scrollbar mb-3 space-y-1 bg-stone-950/50 p-1.5 rounded border border-stone-800">
              <div class="flex justify-between items-center mb-1 px-1">
                <span class="text-[10px] text-stone-500 font-bold uppercase">Alvos</span>
                <button class="text-[10px] text-amber-500 hover:text-amber-400 transition-colors" (click)="selectAllPlayersForRest()">Todos Jogadores</button>
              </div>
              @for (token of combat.tokens(); track token.id) {
                @if (token.type === 'player' || token.type === 'npc') {
                  <label class="flex items-center gap-2 px-2 py-1.5 hover:bg-stone-800 rounded cursor-pointer transition-colors border border-transparent hover:border-stone-700"
                         [class.bg-stone-800]="selectedTokensForRest().has(token.id)"
                         [class.border-stone-700]="selectedTokensForRest().has(token.id)">
                    <input type="checkbox" 
                           [checked]="selectedTokensForRest().has(token.id)"
                           (change)="toggleTokenForRest(token.id)"
                           class="rounded border-stone-600 bg-stone-900 text-amber-500 focus:ring-amber-500 focus:ring-offset-stone-900 w-3 h-3">
                    <span class="text-xs text-stone-300 flex-1 truncate">{{ token.name }}</span>
                    <span class="text-[9px] text-stone-500 uppercase">{{ token.type === 'player' ? 'Jog' : 'NPC' }}</span>
                  </label>
                }
              }
            </div>

            <div class="space-y-2">
              <button class="w-full bg-stone-800 hover:bg-amber-600 hover:text-stone-900 border border-stone-700 rounded py-2 text-xs font-bold transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-stone-800 disabled:hover:text-stone-400"
                      [disabled]="selectedTokensForRest().size === 0"
                      (click)="shortRest()">
                <mat-icon class="text-amber-500 group-hover:text-stone-900" style="font-size: 16px; width: 16px; height: 16px;">local_cafe</mat-icon>
                Descanso Curto
              </button>
              <button class="w-full bg-stone-800 hover:bg-amber-600 hover:text-stone-900 border border-stone-700 rounded py-2 text-xs font-bold transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-stone-800 disabled:hover:text-stone-400"
                      [disabled]="selectedTokensForRest().size === 0"
                      (click)="longRest()">
                <mat-icon class="text-amber-500 group-hover:text-stone-900" style="font-size: 16px; width: 16px; height: 16px;">hotel</mat-icon>
                Descanso Longo
              </button>
            </div>
          </div>
        }

        <button class="w-10 h-10 rounded-full bg-stone-800 border border-stone-700 text-stone-400 flex items-center justify-center hover:bg-stone-700 hover:text-amber-500 hover:border-amber-500/50 transition-all" 
                [class.text-amber-500]="showRestMenu()"
                [class.border-amber-500]="showRestMenu()"
                (click)="toggleRestMenu()"
                title="Descanso">
          <mat-icon style="font-size: 20px; width: 20px; height: 20px;">hotel</mat-icon>
        </button>

        <button class="w-10 h-10 rounded-full bg-stone-800 border border-stone-700 text-stone-400 flex items-center justify-center hover:bg-stone-700 hover:text-amber-500 hover:border-amber-500/50 transition-all" 
                [class.text-amber-500]="showSheetList()"
                [class.border-amber-500]="showSheetList()"
                (click)="toggleSheetList()"
                title="Fichas de Personagem">
          <mat-icon style="font-size: 20px; width: 20px; height: 20px;">assignment_ind</mat-icon>
        </button>
        <div class="w-px h-6 bg-stone-700 mx-1 self-center"></div>
        
        @if (currentUser()?.role === 'GM' && !combat.isPlayMode()) {
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

          <button class="relative w-10 h-10 rounded-full bg-stone-800 border border-stone-700 text-stone-400 flex items-center justify-center hover:bg-stone-700 hover:text-amber-500 hover:border-amber-500/50 transition-all" 
                  [class.text-amber-500]="combat.gmPanelVisible()"
                  [class.border-amber-500]="combat.gmPanelVisible()"
                  [class.bg-amber-500/10]="combat.gmPanelVisible()"
                  [class.shadow-[0_0_15px_rgba(245,158,11,0.2)]]="combat.gmPanelVisible()"
                  (click)="combat.gmPanelVisible.set(!combat.gmPanelVisible())"
                  title="Mapa & Tokens">
            <mat-icon style="font-size: 20px; width: 20px; height: 20px;">history_edu</mat-icon>
            @if (combat.gmPanelVisible()) {
              <span class="absolute top-0 right-0 w-2.5 h-2.5 bg-amber-500 rounded-full border-2 border-stone-900 animate-pulse"></span>
            }
          </button>
        }

        @if (!combat.isPlayMode()) {
          <button class="w-10 h-10 rounded-full bg-stone-800 border border-stone-700 text-stone-400 flex items-center justify-center hover:bg-stone-700 hover:text-amber-500 hover:border-amber-500/50 transition-all" 
                  [class.text-amber-500]="combat.showGrid()"
                  [class.border-amber-500]="combat.showGrid()"
                  (click)="combat.showGrid.set(!combat.showGrid())"
                  title="Alternar Grade">
            <mat-icon style="font-size: 20px; width: 20px; height: 20px;">grid_on</mat-icon>
          </button>
        }
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
  showRestMenu = signal<boolean>(false);
  selectedTokensForRest = signal<Set<string>>(new Set());
  searchQuery = signal<string>('');
  lastRollResult = signal<number | null>(null);
  lastRollSides = signal<number | null>(null);
  selectedDieForInput = signal<number | null>(null);
  rollError = signal<string | null>(null);

  selectedToken = computed(() => {
    const id = this.combat.selectedTokenId();
    return this.combat.tokens().find(t => t.id === id) || null;
  });

  groupedTokens = computed(() => {
    const query = this.searchQuery().toLowerCase();
    const tokens = this.combat.tokens().filter(t => t.name.toLowerCase().includes(query));
    return {
      player: tokens.filter(t => t.type === 'player'),
      boss: tokens.filter(t => t.type === 'boss'),
      enemy: tokens.filter(t => t.type === 'enemy'),
      npc: tokens.filter(t => t.type === 'npc'),
      item: tokens.filter(t => t.type === 'item'),
    };
  });

  updateSearchQuery(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
  }

  toggleDiceTray() {
    this.showDiceTray.set(!this.showDiceTray());
    if (this.showDiceTray()) {
      this.showSheetList.set(false);
      this.showRestMenu.set(false);
      this.selectedDieForInput.set(null);
      this.rollError.set(null);
    }
  }

  toggleSheetList() {
    this.showSheetList.set(!this.showSheetList());
    if (this.showSheetList()) {
      this.showDiceTray.set(false);
      this.showRestMenu.set(false);
      this.searchQuery.set(''); // Reset search when opening
    }
  }

  toggleRestMenu() {
    this.showRestMenu.set(!this.showRestMenu());
    if (this.showRestMenu()) {
      this.showDiceTray.set(false);
      this.showSheetList.set(false);
      
      // Pre-select currently selected token if any
      const selectedId = this.combat.selectedTokenId();
      if (selectedId) {
        this.selectedTokensForRest.set(new Set([selectedId]));
      } else {
        this.selectedTokensForRest.set(new Set());
      }
    }
  }

  toggleTokenForRest(tokenId: string) {
    const current = new Set(this.selectedTokensForRest());
    if (current.has(tokenId)) {
      current.delete(tokenId);
    } else {
      current.add(tokenId);
    }
    this.selectedTokensForRest.set(current);
  }

  selectAllPlayersForRest() {
    const playerIds = this.combat.tokens().filter(t => t.type === 'player').map(t => t.id);
    this.selectedTokensForRest.set(new Set(playerIds));
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

  selectDieForInput(sides: number) {
    this.selectedDieForInput.set(sides);
    this.rollError.set(null);
  }

  confirmManualRoll(valueStr: string) {
    const val = parseInt(valueStr, 10);
    const sides = this.selectedDieForInput();
    if (!sides) return;

    if (isNaN(val)) {
      this.rollError.set('Digite um valor válido.');
      return;
    }

    if (sides === 100) {
      if (val < 10 || val > 100 || val % 10 !== 0) {
        this.rollError.set('Valor não condizente com dado');
        return;
      }
    } else {
      if (val < 1 || val > sides) {
        this.rollError.set('Valor não condizente com dado');
        return;
      }
    }

    this.rollError.set(null);
    this.lastRollResult.set(val);
    this.lastRollSides.set(sides);
    this.selectedDieForInput.set(null);
  }

  rollDice(sides: number) {
    const result = this.mathService.rollDice(sides);
    this.lastRollResult.set(result);
    this.lastRollSides.set(sides);
  }

  shortRest() {
    const selectedIds = Array.from(this.selectedTokensForRest());
    if (selectedIds.length === 0) return;
    
    // Placeholder for short rest logic
    this.showRestMenu.set(false);
  }

  longRest() {
    const selectedIds = Array.from(this.selectedTokensForRest());
    if (selectedIds.length === 0) return;

    for (const id of selectedIds) {
      const token = this.combat.tokens().find(t => t.id === id);
      if (!token) continue;

      const updates: Partial<Token> = {
        hp: token.maxHp,
        mp: token.maxMp
      };

      if (token.sheet) {
        updates.sheet = {
          ...token.sheet,
          hp: token.sheet.maxHp,
          mp: token.sheet.maxMp
        };
      }

      if (token.abilities) {
        updates.abilities = token.abilities.map(ability => {
          if (ability.maxUses !== undefined) {
            return { ...ability, uses: ability.maxUses };
          }
          return ability;
        });
      }

      this.combat.updateToken(token.id, updates);
    }
    
    this.showRestMenu.set(false);
  }
}
