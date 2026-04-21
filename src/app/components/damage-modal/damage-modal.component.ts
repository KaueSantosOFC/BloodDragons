import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { CombatService } from '../../services/combat.service';
import { DndCoreEngineService } from '../../services/dnd-core-engine.service';

@Component({
  selector: 'app-damage-modal',
  standalone: true,
  imports: [CommonModule, MatIconModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (state()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
        <div class="bg-stone-900 border border-stone-700 rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
          
          <!-- Header -->
          <div class="bg-stone-800 p-4 border-b border-stone-700 flex items-center justify-between shrink-0">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full border-2 border-red-500 overflow-hidden bg-stone-900">
                @if (state()?.attacker?.imageUrl) {
                  <img [src]="state()?.attacker?.imageUrl" class="w-full h-full object-cover" referrerpolicy="no-referrer" alt="Atacante">
                }
              </div>
              <div>
                <h2 class="text-xl font-bold text-red-500 leading-tight">Dano</h2>
                <p class="text-sm text-stone-400">{{ state()?.attacker?.name }} ➔ {{ targetNames() }}</p>
              </div>
            </div>
            <button (click)="close()" class="text-stone-400 hover:text-white transition-colors">
              <mat-icon>close</mat-icon>
            </button>
          </div>

          <!-- Body -->
          <div class="p-4 space-y-3 overflow-y-auto flex-1">
            
            <div class="flex flex-col gap-3 bg-stone-800/50 p-4 rounded border border-stone-700/50">
              <div class="flex items-center gap-4">
                <mat-icon class="text-red-500" style="font-size: 24px; width: 24px; height: 24px;">local_fire_department</mat-icon>
                <div>
                  <h3 class="font-bold text-stone-200 text-lg">{{ state()?.ability?.name }}</h3>
                  <p class="text-sm text-stone-400">Resolução de Dano</p>
                </div>
              </div>

              <!-- Hit Tier Indicator -->
              @switch (state()?.hitTier) {
                @case ('grazing') {
                  <div class="bg-amber-500/20 border border-amber-500/50 rounded p-3 text-center">
                    <p class="text-sm font-bold text-amber-500 uppercase tracking-wide">Acerto de Raspão!</p>
                    <p class="text-xs text-amber-400/80">O dano será reduzido pela metade (Math.floor).</p>
                  </div>
                }
                @case ('critical') {
                  <div class="bg-red-500/20 border border-red-500/50 rounded p-3 text-center animate-pulse">
                    <p class="text-sm font-bold text-red-500 uppercase tracking-widest">CRÍTICO!</p>
                    <p class="text-xs text-red-400/80">Dano Máximo Aplicado Automaticamente!</p>
                  </div>
                }
                @default {
                  <div class="bg-green-500/20 border border-green-500/50 rounded p-3 text-center">
                    <p class="text-sm font-bold text-green-500 uppercase tracking-wide">Acerto Sólido!</p>
                    <p class="text-xs text-green-400/80">Dano normal aplicado.</p>
                  </div>
                }
              }
            </div>

            @if (state()?.hitTier !== 'critical') {
              <!-- Parsing Display -->
              <div class="bg-stone-800 p-4 rounded border border-stone-700 text-center space-y-3 shadow-inner">
                <p class="text-base text-stone-300 font-bold">Role os dados físicos na mesa:</p>
                
                <div class="flex justify-center items-end gap-3 my-3">
                  @if (parsedDamage().diceType) {
                    <div class="flex flex-col items-center">
                      <span class="text-xs text-stone-500 uppercase font-black tracking-widest">Quant.</span>
                      <span class="text-4xl font-black text-stone-100">
                        {{ parsedDamage().diceCount }}
                      </span>
                    </div>
                    <span class="text-2xl font-black text-stone-600 mb-2">x</span>
                    <div class="flex flex-col items-center">
                      <span class="text-xs text-stone-500 uppercase font-black tracking-widest">Dado</span>
                      <span class="text-4xl font-black text-amber-500">{{ parsedDamage().diceType }}</span>
                    </div>
                  } @else {
                    <div class="flex flex-col items-center">
                      <span class="text-xs text-stone-500 uppercase font-black tracking-widest">Dano Fixo</span>
                      <span class="text-4xl font-black text-amber-500">{{ parsedDamage().modifier }}</span>
                    </div>
                  }
                  
                  @if (parsedDamage().modifier !== 0 && parsedDamage().diceType) {
                    <span class="text-2xl font-black text-stone-600 mb-2">
                      {{ parsedDamage().modifier > 0 ? '+' : '-' }}
                    </span>
                    <div class="flex flex-col items-center">
                      <span class="text-xs text-stone-500 uppercase font-black tracking-widest">Modif.</span>
                      <span class="text-4xl font-black text-stone-200">{{ Math.abs(parsedDamage().modifier) }}</span>
                    </div>
                  }
                </div>

                <p class="text-sm text-stone-500 mt-2 font-mono bg-stone-900/80 p-2 rounded border border-stone-700/50">
                  Dano na Arma: <span class="text-stone-300 font-bold">"{{ state()?.ability?.damage }}"</span>
                </p>
              </div>

              <!-- Input Result -->
              <div class="space-y-2 pt-2 flex flex-col items-center">
                <label for="manualRollInput" class="text-sm font-black text-stone-400 uppercase tracking-[0.2em] block text-center">
                  Soma Total dos Dados
                </label>
                <div class="w-2/3">
                  <input id="manualRollInput" type="number" [(ngModel)]="manualRoll" 
                         class="w-full bg-stone-950 border-2 rounded-lg px-3 py-3 text-center font-mono font-black text-3xl focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                         placeholder="?"
                         [class.border-red-500]="errorMessage()"
                         [class.border-stone-700]="!errorMessage()"
                         [class.focus:border-amber-500]="!errorMessage()"
                         [attr.min]="minPossibleRoll()"
                         [attr.max]="maxPossibleRoll()"
                         (keyup.enter)="applyDamage()">
                </div>
                @if (errorMessage()) {
                  <p class="text-xs text-red-500 font-bold text-center bg-red-500/10 py-2 px-6 rounded-full border border-red-500/30">
                    {{ errorMessage() }}
                  </p>
                }
              </div>
            } @else {
              <!-- Critical Auto-calculate Display -->
              <div class="bg-stone-800 p-4 rounded border border-stone-700 text-center space-y-2">
                <p class="text-sm text-stone-400">Dano calculado em seu limite máximo.</p>
                <p class="text-xs text-stone-500 mt-2 font-mono bg-stone-900/50 p-1 rounded">
                  Dano Base: "{{ state()?.ability?.damage }}"
                </p>
              </div>
            }
            
            <div class="flex justify-between items-center bg-stone-950 p-4 rounded-lg border border-stone-700 shadow-xl">
               <span class="text-base font-black text-stone-500 uppercase tracking-widest">Total Resultante</span>
               <span class="text-4xl font-mono font-black text-amber-500">{{ calculatedTotal() }}</span>
            </div>

            <!-- Applicator -->
            <div class="flex gap-2 pt-2 pb-1 shrink-0">
              <button (click)="close()" class="flex-1 py-2.5 bg-stone-700 hover:bg-stone-600 text-white font-bold rounded transition-colors">
                CANCELAR
              </button>
              <button (click)="applyDamage()" 
                      [disabled]="(state()?.hitTier !== 'critical' && parsedDamage().diceType && manualRoll() === null) || errorMessage() !== null"
                      class="flex-1 py-2.5 bg-red-600 hover:bg-red-500 disabled:bg-stone-800 disabled:text-stone-600 text-white font-bold rounded transition-colors flex items-center justify-center gap-2">
                <mat-icon>gavel</mat-icon>
                APLICAR
              </button>
            </div>

          </div>
        </div>
      </div>
    }
  `
})
export class DamageModalComponent {
  combat = inject(CombatService);
  engine = inject(DndCoreEngineService);

  state = this.combat.damageModalState;
  manualRoll = signal<number | null>(null);

  protected Math = Math; // For the template

  targetNames = computed(() => {
    const s = this.state();
    if (!s || s.targets.length === 0) return '';
    if (s.targets.length === 1) return s.targets[0].name;
    return `${s.targets[0].name} e mais ${s.targets.length - 1}`;
  });

  parsedDamage = computed(() => {
    const s = this.state();
    if (!s || !s.ability.damage) return { diceCount: 0, diceType: '', modifier: 0 };
    return this.parseDamageString(s.ability.damage);
  });

  hitTier = computed(() => this.state()?.hitTier || 'solid');

  rawMaxDiceDamage = computed(() => {
    const parsed = this.parsedDamage();
    if (!parsed.diceType) return 0;
    const rawDiceType = parseInt(parsed.diceType.replace('d', ''), 10);
    return parsed.diceCount * rawDiceType;
  });

  maxPossibleRoll = computed(() => {
    const parsed = this.parsedDamage();
    if (!parsed.diceType) return null;
    const rawDiceType = parseInt(parsed.diceType.replace('d', ''), 10);
    return parsed.diceCount * rawDiceType;
  });

  minPossibleRoll = computed(() => {
    const parsed = this.parsedDamage();
    if (!parsed.diceType) return null;
    return parsed.diceCount;
  });

  errorMessage = computed(() => {
    if (this.hitTier() === 'critical') return null; // No manual input on critical

    const val = this.manualRoll();
    const max = this.maxPossibleRoll();
    const min = this.minPossibleRoll();
    
    if (val === null || max === null || min === null) return null;
    
    if (val > max) return `O valor máximo possível é ${max}`;
    if (val < min) return `O valor mínimo possível é ${min}`;
    return null;
  });

  calculatedTotal = computed(() => {
    const tier = this.hitTier();
    const parsed = this.parsedDamage();
    
    // Auto-calcula Dano Máximo no Crítico
    if (tier === 'critical') {
      const maxRoll = this.rawMaxDiceDamage();
      return Math.max(0, maxRoll + parsed.modifier);
    }
    
    const manual = this.manualRoll();
    
    // Se não tiver type de dado (ex: dano fixo tipo "5"), usa apenas o modifier
    if (!parsed.diceType && parsed.modifier > 0 && manual === null) {
      return tier === 'grazing' ? Math.floor(parsed.modifier / 2) : parsed.modifier;
    }
    
    if (manual === null) return 0;
    
    let rawTotal = manual + parsed.modifier;
    if (tier === 'grazing') {
      rawTotal = Math.floor(rawTotal / 2);
    }
    
    return Math.max(0, rawTotal);
  });

  close() {
    this.combat.closeDamageModal();
    this.manualRoll.set(null);
  }

  applyDamage() {
    const s = this.state();
    const total = this.calculatedTotal();
    
    if (!s || total < 0 || this.manualRoll() === null && this.parsedDamage().diceType) return;

    if (s.ability.areaShape && s.ability.areaShape !== 'none') {
       // Area damage
       s.targets.forEach(target => {
          this.combat.updateToken(target.id, { hp: Math.max(0, target.hp - total) });
          // Optional: handle half damage on save here if needed, but for now we apply full to all in area for simplicity.
          // In a complex system, there'd be saving throws per target.
          const log = `Dano em área contra ${target.name} = ${total}`;
          this.combat.addNotification(log, 'info');
       });
    } else {
       // Single target damage
       s.targets.forEach(target => {
         this.combat.updateToken(target.id, { hp: Math.max(0, target.hp - total) });
         const log = `Dano contra ${target.name} = ${total} recebido!`;
         this.combat.addNotification(log, 'info');
       });
    }

    this.close();
  }

  /**
   * The robust Regex logic the user requested goes here.
   * Format: "XdY", "XdY+Z", "XdY-Z", "X"
   * Match groups: 
   * 1: (\d*) -> count (optional/empty if just 'd6')
   * 2: d(\d+) -> dice type (optional if pure fixed damage)
   * 3: ([+-]) -> sign
   * 4: (\d+) -> modifier
   */
  parseDamageString(damageStr: string): { diceCount: number, diceType: string, modifier: number } {
    // Remove all whitespace
    const cleanStr = damageStr.replace(/\s+/g, '');
    
    // Matcher: ^(?:(\d*)d(\d+))?(?:([+-])(\d+))?$|^\d+$
    const regex = /^(?:(\d*)d(\d+))?(?:([+-])?(\d+))?$/i;
    const match = cleanStr.match(regex);
    
    if (!match) {
      console.warn(`Could not parse damage string: ${damageStr}. Assuming 0.`);
      return { diceCount: 0, diceType: '', modifier: 0 };
    }

    // Fixed damage exact matching e.g. "5"
    if (!match[2] && match[4] && !match[3]) {
      return {
        diceCount: 0,
        diceType: '',
        modifier: parseInt(match[4], 10)
      }
    }

    // Normal parsed
    const countStr = match[1];
    const typeStr = match[2];
    const signStr = match[3];
    const modStr = match[4];

    // default diceCount is 1 if "d6" doesn't have a prefix
    const diceCount = countStr ? parseInt(countStr, 10) : (typeStr ? 1 : 0);
    const diceType = typeStr ? `d${typeStr}` : '';
    
    let modifier = 0;
    if (modStr) {
       const rawMod = parseInt(modStr, 10);
       modifier = signStr === '-' ? -rawMod : rawMod;
    }

    return { diceCount, diceType, modifier };
  }
}
