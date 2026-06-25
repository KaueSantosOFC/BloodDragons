import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CombatService } from '../../services/combat.service';
import { AuthService } from '../../services/auth.service';
import { MatIconModule } from '@angular/material/icon';
import { Token } from '../../models/token';

@Component({
  selector: 'app-gameplay-hud',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed top-4 left-1/2 -translate-x-1/2 z-40 w-full max-w-4xl px-4 flex flex-col items-center gap-3 pointer-events-none">
      
      <!-- Top Bar: Clock, Turn, Map Toggle -->
      <div class="bg-stone-900/90 border border-stone-800 text-stone-205 rounded-2xl px-6 py-3 shadow-2xl flex items-center justify-between gap-8 backdrop-blur-md w-full pointer-events-auto transition-all duration-300">
        
        <!-- Day / Clock -->
        <div class="flex items-center gap-4">
          <div class="w-10 h-10 rounded-xl bg-stone-950 flex items-center justify-center border border-stone-800 text-amber-500 shadow-inner">
            <mat-icon>{{ timeIcon() }}</mat-icon>
          </div>
          <div>
            <div class="text-[10px] text-stone-500 uppercase font-black tracking-widest leading-none">Dia {{ combat.currentDay() }} • {{ timePeriod() }}</div>
            <div class="text-lg font-mono font-bold text-stone-200 mt-1 leading-none">
              {{ formattedTime() }}
            </div>
          </div>
          
          <!-- GM controls for time -->
          @if (isGM()) {
            <div class="flex items-center gap-1.5 ml-2">
              <button 
                (click)="combat.advanceTime(0, 10)" 
                class="px-2 py-1 bg-stone-950 hover:bg-stone-800 text-[10px] text-stone-400 font-bold font-mono rounded border border-stone-850 transition-colors"
                title="Avançar 10 Minutos"
              >
                +10m
              </button>
              <button 
                (click)="combat.advanceTime(1, 0)" 
                class="px-2 py-1 bg-stone-950 hover:bg-stone-800 text-[10px] text-stone-400 font-bold font-mono rounded border border-stone-850 transition-colors"
                title="Avançar 1 Hora"
              >
                +1h
              </button>
              <button 
                (click)="combat.advanceTime(8, 0)" 
                class="px-2 py-1 bg-stone-950 hover:bg-stone-800 text-[10px] text-stone-400 font-bold font-mono rounded border border-stone-850 transition-colors"
                title="Avançar 8 Horas (Descanso)"
              >
                +8h
              </button>
            </div>
          }
        </div>

        <!-- Combat / Round Tracker (If active) -->
        @if (combat.combatActive()) {
          <div class="flex items-center gap-3 bg-red-950/30 border border-red-500/30 rounded-xl px-4 py-2">
            <mat-icon class="text-red-500" style="font-size:20px;">gavel</mat-icon>
            <div class="flex flex-col">
              <div class="text-[9px] text-red-400 uppercase font-black tracking-widest leading-none">
                Rodada {{ combat.round() }}
              </div>
              <div class="text-xs text-stone-300 font-bold mt-0.5 font-mono leading-none">
                {{ activeTurnName() }}
              </div>
            </div>

            <!-- Mini Action Economy -->
            <div class="flex items-center gap-1 ml-1">
              <div class="w-2 h-2 rounded-full" 
                   [class.bg-green-500]="!combat.turnState().actionUsed"
                   [class.bg-stone-700]="combat.turnState().actionUsed"
                   title="Ação"></div>
              <div class="w-2 h-2 rounded-full" 
                   [class.bg-amber-500]="!combat.turnState().bonusActionUsed"
                   [class.bg-stone-700]="combat.turnState().bonusActionUsed"
                   title="Ação Bônus"></div>
              <div class="w-2 h-2 rounded-full" 
                   [class.bg-purple-500]="!combat.turnState().reactionUsed"
                   [class.bg-stone-700]="combat.turnState().reactionUsed"
                   title="Reação"></div>
            </div>
            
            <!-- Movement Indicator -->
            <div class="text-[10px] font-mono text-blue-400 border border-blue-500/20 bg-blue-950/30 px-1.5 py-0.5 rounded" 
                 [title]="'Movimento: ' + (combat.turnState().movementUsed * 1.5) + 'm / ' + (combat.activeTokenMaxMovement() * 1.5) + 'm'">
              {{ combat.remainingMovement() * 1.5 }}m
            </div>

            @if (isGM()) {
              <button 
                (click)="combat.nextTurn()" 
                class="px-3 py-1.5 bg-red-700/80 hover:bg-red-600 text-white font-bold rounded text-[10px] transition-colors uppercase tracking-wider flex items-center gap-1 shadow-md"
              >
                <mat-icon style="font-size:12px;width:12px;height:12px;">skip_next</mat-icon>
                Finalizar Turno
              </button>
            }
          </div>
        } @else {
          <!-- Center: Start Battle + Map/Slides Toggle -->
          <div class="flex items-center gap-3">
            <!-- Botão Iniciar Batalha -->
            @if (isGM()) {
              <button 
                (click)="combat.rollAllInitiativesAndStartCombat()"
                class="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 text-white font-bold rounded-xl text-xs transition-all duration-200 shadow-lg shadow-red-900/30 hover:shadow-red-800/40 border border-red-500/30 hover:scale-105 active:scale-95"
                title="Rola iniciativa automática (1d20 + mod. DES) para todos os tokens e inicia o combate"
              >
                <mat-icon style="font-size:16px;width:16px;height:16px;">swords</mat-icon>
                Iniciar Batalha
              </button>
            }
            
            <!-- Map / Slides Toggle Button -->
            <div class="flex bg-stone-950 p-1 rounded-xl border border-stone-800 text-xs">
              <button 
                (click)="combat.showStorySlides.set(false)"
                [class.bg-amber-600]="!combat.showStorySlides()"
                [class.text-stone-950]="!combat.showStorySlides()"
                [class.font-bold]="!combat.showStorySlides()"
                [class.text-stone-400]="combat.showStorySlides()"
                class="px-4 py-1.5 rounded-lg transition-all duration-200 flex items-center gap-1.5"
              >
                <mat-icon style="font-size:14px;width:14px;height:14px;">map</mat-icon>
                Mapa
              </button>
              <button 
                (click)="combat.showStorySlides.set(true)"
                [class.bg-amber-600]="combat.showStorySlides()"
                [class.text-stone-950]="combat.showStorySlides()"
                [class.font-bold]="combat.showStorySlides()"
                [class.text-stone-400]="!combat.showStorySlides()"
                class="px-4 py-1.5 rounded-lg transition-all duration-200 flex items-center gap-1.5"
              >
                <mat-icon style="font-size:14px;width:14px;height:14px;">slideshow</mat-icon>
                História
              </button>
            </div>
          </div>
        }

        <!-- Toggle UI button -->
        <button 
          (click)="combat.uiVisible.update(v => !v)"
          [title]="combat.uiVisible() ? 'Esconder Painéis' : 'Mostrar Painéis'"
          class="w-8 h-8 rounded-lg bg-stone-950 hover:bg-stone-850 text-stone-400 hover:text-white border border-stone-800 flex items-center justify-center transition-colors"
        >
          <mat-icon>{{ combat.uiVisible() ? 'visibility' : 'visibility_off' }}</mat-icon>
        </button>

      </div>
      
      <!-- Bottom Bar: Party Status Overlay with XP Progress -->
      @if (partyTokens().length > 0 && combat.uiVisible()) {
        <div class="flex flex-wrap gap-3 justify-center w-full max-w-3xl pointer-events-auto">
          @for (p of partyTokens(); track p.id) {
            <div 
              (click)="selectAndOpenSheet(p.id)"
              class="bg-stone-900/90 border border-stone-800 rounded-xl px-4 py-2 flex items-center gap-3 hover:border-amber-500/40 hover:bg-stone-800/90 transition-all duration-200 cursor-pointer shadow-lg select-none min-w-[160px]"
            >
              <div class="relative">
                <div 
                  class="w-7 h-7 rounded-full border-2 overflow-hidden bg-stone-950 flex-shrink-0"
                  [style.borderColor]="p.color || '#d6d3d1'"
                >
                  @if (p.imageUrl) {
                    <img [src]="p.imageUrl" alt="Avatar" class="w-full h-full object-cover">
                  } @else {
                    <div class="w-full h-full flex items-center justify-center bg-stone-850 text-[10px] text-stone-500">
                      {{ p.name.substring(0,2) }}
                    </div>
                  }
                </div>
                <!-- Level Badge -->
                @if (p.sheet) {
                  <div class="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-amber-600 text-stone-950 text-[8px] font-black flex items-center justify-center border border-stone-900">
                    {{ p.sheet.level }}
                  </div>
                }
              </div>
              
              <div class="space-y-0.5 min-w-[100px]">
                <div class="flex justify-between items-center text-[10px]">
                  <span class="font-bold text-stone-300 truncate max-w-[80px]">{{ p.name }}</span>
                  <span class="font-mono text-stone-400 font-medium">{{ p.hp }}/{{ p.maxHp }}</span>
                </div>
                <!-- Mini health bar -->
                <div class="h-1 bg-stone-950 rounded-full overflow-hidden border border-stone-800">
                  <div 
                    class="h-full rounded-full transition-all duration-300"
                    [class.bg-red-500]="(p.hp / p.maxHp) <= 0.25"
                    [class.bg-amber-500]="(p.hp / p.maxHp) > 0.25 && (p.hp / p.maxHp) <= 0.5"
                    [class.bg-green-500]="(p.hp / p.maxHp) > 0.5"
                    [style.width.%]="(p.hp / p.maxHp) * 100"
                  ></div>
                </div>
                <!-- XP Progress Bar -->
                @if (p.sheet) {
                  <div class="flex items-center gap-1.5">
                    <div class="flex-1 h-0.5 bg-stone-950 rounded-full overflow-hidden border border-stone-800/50">
                      <div 
                        class="h-full rounded-full bg-amber-500/80 transition-all duration-500"
                        [style.width.%]="combat.getXpProgress(p.sheet.xp, p.sheet.level)"
                      ></div>
                    </div>
                    <span class="text-[7px] font-mono text-amber-500/70 whitespace-nowrap" [title]="'XP: ' + p.sheet.xp + ' / ' + combat.getXpForNextLevel(p.sheet.level)">
                      {{ p.sheet.xp | number }} XP
                    </span>
                  </div>
                }
                <!-- Exhaustion / Food status indicators -->
                <div class="flex items-center gap-1.5 pt-0.5 text-[8px] text-stone-500 uppercase tracking-tight">
                  @if (p.sheet?.exhaustion) {
                    <span class="text-red-400 font-bold flex items-center gap-0.5">
                      <mat-icon style="font-size:8px;width:8px;height:8px;">warning</mat-icon>
                      EX{{ p.sheet?.exhaustion }}
                    </span>
                  }
                  <span 
                    class="flex items-center gap-0.5" 
                    [class.text-stone-500]="(p.sheet?.rations || 0) > 0"
                    [class.text-red-400]="(p.sheet?.rations || 0) === 0"
                    [class.font-bold]="(p.sheet?.rations || 0) === 0"
                  >
                    R:{{ p.sheet?.rations !== undefined ? p.sheet?.rations : 4 }}
                  </span>
                  <span 
                    class="flex items-center gap-0.5" 
                    [class.text-stone-500]="(p.sheet?.water || 0) > 0"
                    [class.text-red-400]="(p.sheet?.water || 0) === 0"
                    [class.font-bold]="(p.sheet?.water || 0) === 0"
                  >
                    A:{{ p.sheet?.water !== undefined ? p.sheet?.water : 4 }}
                  </span>
                </div>
              </div>
            </div>
          }
        </div>
      }

    </div>
  `
})
export class GameplayHudComponent {
  combat = inject(CombatService);
  auth = inject(AuthService);

  isGM = computed(() => this.auth.currentUser()?.role === 'GM');

  formattedTime = computed(() => {
    const hr = String(this.combat.currentHour()).padStart(2, '0');
    const min = String(this.combat.currentMinute()).padStart(2, '0');
    return `${hr}:${min}`;
  });

  timePeriod = computed(() => {
    const hr = this.combat.currentHour();
    if (hr >= 6 && hr < 8) return 'Amanhecer';
    if (hr >= 8 && hr < 12) return 'Manhã';
    if (hr >= 12 && hr < 17) return 'Tarde';
    if (hr >= 17 && hr < 19) return 'Anoitecer';
    if (hr >= 19 && hr < 24) return 'Noite';
    return 'Madrugada';
  });

  timeIcon = computed(() => {
    const hr = this.combat.currentHour();
    if (hr >= 6 && hr < 8) return 'wb_twilight';
    if (hr >= 8 && hr < 17) return 'wb_sunny';
    if (hr >= 17 && hr < 19) return 'wb_twilight';
    return 'nights_stay';
  });

  partyTokens = computed(() => {
    // Return all tokens of type 'player' that have sheets
    return this.combat.tokens().filter(t => t.type === 'player' && t.sheet);
  });

  activeTurnName = computed(() => {
    const currentId = this.combat.activeTokenId();
    if (!currentId) return 'Ninguém';
    const active = this.combat.tokens().find(t => t.id === currentId);
    return active ? active.name : 'Ninguém';
  });

  selectAndOpenSheet(tokenId: string) {
    this.combat.selectedTokenId.set(tokenId);
    this.combat.fullscreenSheetTokenId.set(tokenId);
  }
}
