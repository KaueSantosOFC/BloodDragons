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
        <div class="bg-stone-900 border border-stone-700 rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
          
          <!-- Header -->
          <div class="bg-stone-800 p-4 border-b border-stone-700 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full border-2 border-red-500 overflow-hidden bg-stone-900">
                <img *ngIf="state()?.attacker?.imageUrl" [src]="state()?.attacker?.imageUrl" class="w-full h-full object-cover" referrerpolicy="no-referrer">
              </div>
              <div>
                <h2 class="text-lg font-bold text-red-500 leading-tight">Dano</h2>
                <p class="text-xs text-stone-400">{{ state()?.attacker?.name }} ➔ {{ targetNames() }}</p>
              </div>
            </div>
            <button (click)="close()" class="text-stone-400 hover:text-white transition-colors">
              <mat-icon>close</mat-icon>
            </button>
          </div>

          <!-- Body -->
          <div class="p-5 space-y-4">
            
            <div class="flex items-center gap-3 bg-stone-800/50 p-3 rounded border border-stone-700/50">
              <mat-icon class="text-red-500">local_fire_department</mat-icon>
              <div>
                <h3 class="font-bold text-stone-200">{{ state()?.ability?.name }}</h3>
                <p class="text-xs text-stone-400">
                  Resolução de Dano
                  @if (state()?.isCritical) {
                    <span class="text-amber-400 font-bold ml-1">(CRÍTICO!)</span>
                  }
                </p>
              </div>
            </div>

            <!-- Parsing Display -->
            <div class="bg-stone-800 p-4 rounded border border-stone-700 text-center space-y-2">
              <p class="text-sm text-stone-400">Role os dados físicos na mesa:</p>
              
              <div class="flex justify-center items-end gap-2 my-2">
                @if (parsedDamage().diceType) {
                  <div class="flex flex-col items-center">
                    <span class="text-[10px] text-stone-500 uppercase font-bold">Quant.</span>
                    <span class="text-2xl font-bold text-stone-200">
                      {{ parsedDamage().diceCount }}{{ state()?.isCritical ? 'x2' : '' }}
                    </span>
                  </div>
                  <span class="text-xl font-bold text-stone-600 mb-1">x</span>
                  <div class="flex flex-col items-center">
                    <span class="text-[10px] text-stone-500 uppercase font-bold">Dado</span>
                    <span class="text-2xl font-bold text-amber-500">{{ parsedDamage().diceType }}</span>
                  </div>
                } @else {
                  <div class="flex flex-col items-center">
                    <span class="text-[10px] text-stone-500 uppercase font-bold">Dano Fixo</span>
                    <span class="text-2xl font-bold text-amber-500">{{ parsedDamage().modifier }}</span>
                  </div>
                }
                
                @if (parsedDamage().modifier !== 0 && parsedDamage().diceType) {
                  <span class="text-xl font-bold text-stone-600 mb-1">
                    {{ parsedDamage().modifier > 0 ? '+' : '-' }}
                  </span>
                  <div class="flex flex-col items-center">
                    <span class="text-[10px] text-stone-500 uppercase font-bold">Modificador</span>
                    <span class="text-2xl font-bold text-stone-300">{{ Math.abs(parsedDamage().modifier) }}</span>
                  </div>
                }
              </div>

              <p class="text-xs text-stone-500 mt-2 font-mono bg-stone-900/50 p-1 rounded">
                Dano Base: "{{ state()?.ability?.damage }}"
              </p>
            </div>

            <!-- Input Result -->
            <div class="space-y-3 pt-2 flex flex-col items-center">
              <label class="text-xs font-bold text-stone-400 uppercase tracking-widest block text-center">
                Insira a soma dos dados obtidos
              </label>
              <div class="w-1/2">
                <input type="number" [(ngModel)]="manualRoll" 
                       class="w-full bg-stone-800 border rounded px-3 py-2 text-center font-mono font-bold text-lg focus:outline-none"
                       placeholder="Valor"
                       [class.border-red-500]="errorMessage()"
                       [class.border-stone-600]="!errorMessage()"
                       [class.focus:border-red-500]="!errorMessage()"
                       [attr.min]="minPossibleRoll()"
                       [attr.max]="maxPossibleRoll()"
                       (keyup.enter)="applyDamage()">
              </div>
              @if (errorMessage()) {
                <p class="text-xs text-red-500 font-bold text-center bg-red-500/10 py-1 px-4 rounded">
                  {{ errorMessage() }}
                </p>
              }
            </div>
            
            <div class="flex justify-between items-center bg-stone-900 p-3 rounded border border-stone-700">
               <span class="text-sm font-bold text-stone-400 uppercase">Dano Total Resultante</span>
               <span class="text-2xl font-mono font-bold text-white">{{ calculatedTotal() }}</span>
            </div>

            <!-- Applicator -->
            <div class="flex gap-2 pt-4">
              <button (click)="close()" class="flex-1 py-3 bg-stone-700 hover:bg-stone-600 text-white font-bold rounded transition-colors">
                CANCELAR
              </button>
              <button (click)="applyDamage()" 
                      [disabled]="manualRoll() === null || errorMessage() !== null"
                      class="flex-1 py-3 bg-red-600 hover:bg-red-500 disabled:bg-stone-800 disabled:text-stone-600 text-white font-bold rounded transition-colors flex items-center justify-center gap-2">
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

  maxPossibleRoll = computed(() => {
    const s = this.state();
    const parsed = this.parsedDamage();
    if (!parsed.diceType) return null;
    
    // Extract the raw dice value, e.g. "d8" -> 8
    const rawDiceType = parseInt(parsed.diceType.replace('d', ''), 10);
    // If critical, count is doubled on the physical table usually
    const multiplier = s?.isCritical ? 2 : 1; 
    
    return parsed.diceCount * multiplier * rawDiceType;
  });

  minPossibleRoll = computed(() => {
    const s = this.state();
    const parsed = this.parsedDamage();
    if (!parsed.diceType) return null;
    
    const multiplier = s?.isCritical ? 2 : 1;
    return parsed.diceCount * multiplier; // Min roll is physically 1 per dice
  });

  errorMessage = computed(() => {
    const val = this.manualRoll();
    const max = this.maxPossibleRoll();
    const min = this.minPossibleRoll();
    
    if (val === null || max === null || min === null) return null;
    
    if (val > max) return `O valor máximo possível é ${max}`;
    if (val < min) return `O valor mínimo possível é ${min}`;
    return null;
  });

  calculatedTotal = computed(() => {
    const manual = this.manualRoll();
    const parsed = this.parsedDamage();
    
    // Se não tiver type de dado (ex: dano fixo tipo "5"), usa apenas o modifier
    if (!parsed.diceType && parsed.modifier > 0 && manual === null) {
      return parsed.modifier;
    }
    
    if (manual === null) return 0;
    
    return Math.max(0, manual + parsed.modifier);
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
