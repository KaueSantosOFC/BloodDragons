import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { CombatService } from '../../services/combat.service';
import { DndCoreEngineService } from '../../services/dnd-core-engine.service';
import { DndMathService } from '../../services/dnd-math.service';

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
          <div class="p-5 space-y-4">
            
            <div class="flex flex-col gap-3 bg-stone-800/50 p-4 rounded border border-stone-700/50">
              <div class="flex items-center gap-4">
                <mat-icon class="text-red-500" style="font-size: 24px; width: 24px; height: 24px;">local_fire_department</mat-icon>
                <div>
                  <h3 class="font-bold text-stone-200 text-lg">{{ state()?.ability?.name }}</h3>
                  <p class="text-sm text-stone-400">Resolução de Dano</p>
                </div>
              </div>

              @if (state()?.saveDC) {
                <div class="bg-blue-900/20 border border-blue-500/50 rounded p-4 text-center shadow-lg">
                  <p class="text-sm font-bold text-blue-400 uppercase tracking-widest mb-1 flex items-center justify-center gap-2">
                    <mat-icon>shield</mat-icon>
                    Teste de Resistência (Inimigos)
                  </p>
                  <p class="text-[11px] text-blue-300/80 mb-2">O <strong>Mestre</strong> rola o d20 dos alvos afetados para superar a Dificuldade:</p>
                  <div class="inline-block bg-blue-950/80 border border-blue-500/30 px-6 py-2 rounded-lg" [title]="saveDCBreakdown()">
                    <p class="text-3xl font-black text-blue-400">CD {{ state()?.saveDC }}</p>
                  </div>
                  <p class="text-[9px] text-blue-300/50 mt-2 italic cursor-help" [title]="saveDCBreakdown()">
                    {{ saveDCBreakdown() }}
                  </p>
                </div>
              } @else if (hasAnyCrit()) {
                <div class="bg-red-500/20 border border-red-500/50 rounded p-3 text-center">
                  <p class="text-sm font-bold text-red-500 uppercase tracking-widest">CRÍTICO DETECTADO!</p>
                  <p class="text-xs text-red-400/80">O valor inserido será dobrado automaticamente para os alvos que sofreram crítico.</p>
                </div>
              }
            </div>

            <!-- Parsing Display -->
            <div class="bg-stone-800 p-6 rounded border border-stone-700 text-center space-y-4 shadow-inner">
                <p class="text-base text-amber-500 font-bold uppercase tracking-widest">
                  {{ state()?.saveDC ? '1. Conjurador rola o Dano' : 'Role o Dano Físico' }}
                </p>
                
                <div class="flex justify-center items-end gap-3 my-4">
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
              <div class="space-y-4 pt-2 flex flex-col items-center">
                <label for="manualRollInput" class="text-sm font-black text-stone-400 uppercase tracking-[0.2em] block text-center">
                  Soma Total do Dano
                </label>
                <div class="w-2/3">
                  <input id="manualRollInput" type="number" [ngModel]="manualRoll()" (ngModelChange)="setManualDamageRoll($event)" 
                         (input)="enforceLimit($event, maxPossibleRoll())"
                         class="w-full bg-stone-950 border-2 rounded-lg px-4 py-4 text-center font-mono font-black text-3xl focus:outline-none focus:ring-2 focus:ring-amber-500/50"
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

            <!-- Flat Reductions / Modifiers that apply before Resistance -->
            <div class="bg-stone-800 p-4 rounded border border-stone-700">
               <label class="text-xs font-bold text-stone-500 uppercase flex justify-between items-center">
                 <span>Redução Plana de Dano</span>
                 <input type="number" [(ngModel)]="flatReduction" class="w-16 bg-stone-900 border border-stone-700 rounded px-2 py-1 text-center text-stone-200 focus:outline-none focus:border-amber-500" min="0">
               </label>
               <p class="text-[10px] text-stone-500 mt-1">Ex: Heavy Armor Master. Subtrai ANTES da resistência.</p>
            </div>

            <!-- Set Target Defenses -->
            <div class="bg-stone-800 p-4 rounded border border-stone-700 space-y-3 max-h-48 overflow-y-auto">
               <h4 class="text-xs font-bold text-amber-500 uppercase border-b border-stone-700 pb-2">
                 {{ state()?.saveDC ? '2. Resolução dos Testes (Mestre)' : 'Alvos e Defesas' }}
               </h4>
               @for (target of state()?.targets; track target.id) {
                 <div class="flex items-center justify-between text-sm py-2 border-b border-stone-700/50 last:border-0">
                   <div class="flex flex-col w-1/3 pr-2">
                     <span class="text-stone-300 font-bold truncate" [title]="target.name">{{ target.name }}</span>
                     @if (state()?.hitTiers?.[target.id] === 'critical') {
                       <span class="text-[10px] text-red-500 font-bold uppercase mt-0.5">Crítico!</span>
                     }
                     @if (state()?.hitTiers?.[target.id] === 'grazing') {
                       <span class="text-[10px] text-amber-500 font-bold uppercase mt-0.5">De Raspão</span>
                     }
                   </div>
                   
                   @if (state()?.saveDC) {
                     <div class="flex items-center gap-2">
                       <input type="number" [ngModel]="targetSaveRolls()[target.id]" (ngModelChange)="setSaveRoll(target.id, $event)" 
                              (input)="enforceLimit($event, 20)"
                              min="1" max="20"
                              class="w-12 bg-stone-900 border border-stone-700 rounded px-1 py-1 text-center font-mono font-bold text-stone-300 focus:outline-none focus:border-blue-500"
                              placeholder="d20">
                       <span class="text-[10px] text-stone-500 font-mono" title="Modificador de {{ (state()?.ability?.saveAttribute || 'dex') | uppercase }} da Ficha">
                         {{ targetSaveModifiers()[target.id] >= 0 ? '+' : '' }}{{ targetSaveModifiers()[target.id] }}
                       </span>
                       
                       @if (targetSaveRolls()[target.id]) {
                         @let totalSave = targetSaveRolls()[target.id]! + targetSaveModifiers()[target.id];
                         <span class="ml-1 px-1 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider"
                               [class.bg-green-900]="totalSave >= state()!.saveDC!"
                               [class.text-green-400]="totalSave >= state()!.saveDC!"
                               [class.bg-red-900]="totalSave < state()!.saveDC!"
                               [class.text-red-400]="totalSave < state()!.saveDC!">
                           {{ totalSave >= state()!.saveDC! ? 'PASSOU' : 'FALHOU' }}
                         </span>
                       }
                     </div>
                   } @else {
                     <select [ngModel]="targetDefenses()[target.id] || 'normal'" (ngModelChange)="setDefense(target.id, $event)" class="w-2/3 bg-stone-900 border border-stone-700 rounded px-2 py-1 text-[11px] font-bold text-stone-300 focus:outline-none focus:border-amber-500">
                        <option value="normal">Dano 100% (Normal)</option>
                        <option value="resistance">Dano 50% (Possui Resistência)</option>
                        <option value="vulnerable">Dano 200% (Possui Vulnerabilidade)</option>
                        <option value="immune">Dano Zero (Possui Imunidade)</option>
                     </select>
                   }
                 </div>
               }
            </div>
            
            <div class="flex justify-between items-center bg-stone-950 p-5 rounded-lg border border-stone-700 shadow-xl">
               <span class="text-base font-black text-stone-500 uppercase tracking-widest">Total Base</span>
               <span class="text-4xl font-mono font-black text-amber-500">{{ calculatedTotal() }}</span>
            </div>

            <!-- Applicator -->
            <div class="flex gap-2 pt-4">
              <button (click)="close()" class="flex-1 py-3 bg-stone-700 hover:bg-stone-600 text-white font-bold rounded transition-colors">
                CANCELAR
              </button>
              <button (click)="applyDamage()" 
                      [disabled]="(parsedDamage().diceType && manualRoll() === null) || errorMessage() !== null"
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
  math = inject(DndMathService);

  state = this.combat.damageModalState;
  manualRoll = signal<number | null>(null);

  protected Math = Math; // For the template

  targetNames = computed(() => {
    const s = this.state();
    if (!s || s.targets.length === 0) return '';
    if (s.targets.length === 1) return s.targets[0].name;
    return `${s.targets[0].name} e mais ${s.targets.length - 1}`;
  });

  saveDCBreakdown = computed(() => {
    const s = this.state();
    if (!s || !s.saveDC) return '';
    const spellcastingAttr = s.attacker.sheet?.spellcastingAbility || 'int';
    const attrScore = (s.attacker.sheet as any)?.[spellcastingAttr] || 10;
    const attrMod = this.math.calculateModifier(attrScore);
    const prof = s.attacker.sheet?.proficiencyBonus || 2;
    return `8 (Base) + ${prof} (Proficiência) + ${attrMod >= 0 ? '+' : ''}${attrMod} (${spellcastingAttr.toUpperCase()})`;
  });

  targetSaveModifiers = computed(() => {
    const s = this.state();
    if (!s) return {};
    const attr = s.ability.saveAttribute || 'dex';
    const mods: Record<string, number> = {};
    s.targets.forEach(t => {
      const score = (t.sheet as any)?.[attr] || 10;
      mods[t.id] = this.math.calculateModifier(score);
    });
    return mods;
  });

  parsedDamage = computed(() => {
    const s = this.state();
    if (!s || !s.ability.damage) return { diceCount: 0, diceType: '', modifier: 0 };
    const parsed = this.parseDamageString(s.ability.damage);
    
    if (s.ability.damageBonus) {
       parsed.modifier += s.ability.damageBonus;
    }

    // Off-hand: Do not add positive modifier (assuming off-hand negates attribute mod, but should it negate the flat bonus from weapon +1? For now we just zero it out if it's strictly positive, although usually offhand only negates the Ability Modifier, not weapon enchantment. If the user wants separate, we can keep it simple)
    if (s.ability.isOffHand && parsed.modifier > 0) {
       parsed.modifier = 0;
    }
    
    return parsed;
  });

  hasAnyCrit = computed(() => {
    const s = this.state();
    if (!s || !s.hitTiers) return false;
    return Object.values(s.hitTiers).includes('critical');
  });

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
    const val = this.manualRoll();
    const max = this.maxPossibleRoll();
    const min = this.minPossibleRoll();
    
    if (val === null || max === null || min === null) return null;
    
    if (val > max) return `O valor máximo possível é ${max}`;
    if (val < min) return `O valor mínimo possível é ${min}`;
    return null;
  });

  calculatedTotal = computed(() => {
    const parsed = this.parsedDamage();
    const manual = this.manualRoll();
    
    // Se não tiver type de dado (ex: dano fixo tipo "5"), usa apenas o modifier
    if (!parsed.diceType && parsed.modifier > 0 && manual === null) {
      let val = parsed.modifier;
      val = Math.max(0, val - this.flatReduction());
      return val;
    }
    
    if (manual === null) return 0;
    
    let rawTotal = manual + parsed.modifier;
    rawTotal = Math.max(0, rawTotal - this.flatReduction()); // Subtrai redução flat

    return Math.max(0, rawTotal);
  });

  flatReduction = signal<number>(0);
  targetDefenses = signal<Record<string, 'normal'|'resistance'|'vulnerable'|'immune'>>({});
  targetSaveRolls = signal<Record<string, number | null>>({});

  // Reset defenses when modal opens
  constructor() {
    // Empty
  }

  close() {
    this.combat.closeDamageModal();
    this.manualRoll.set(null);
    this.flatReduction.set(0);
    this.targetDefenses.set({});
    this.targetSaveRolls.set({});
  }

  setDefense(targetId: string, def: 'normal'|'resistance'|'vulnerable'|'immune') {
    this.targetDefenses.update(d => ({ ...d, [targetId]: def }));
  }

  setSaveRoll(targetId: string, roll: number | null) {
    let finalRoll = roll;
    if (roll !== null) {
      if (roll > 20) finalRoll = 20;
      if (roll === 0 || roll < 1) finalRoll = 1;
    }
    this.targetSaveRolls.update(d => ({ ...d, [targetId]: finalRoll }));
  }

  setManualDamageRoll(roll: number | null) {
    let finalRoll = roll;
    if (roll !== null) {
       const max = this.maxPossibleRoll();
       if (max !== null && roll > max) finalRoll = max;
       // Não clampamos o minimo no keystroke para permitir digitar dezenas, o applyDamage faz a validação rigorosa.
    }
    this.manualRoll.set(finalRoll);
  }

  enforceLimit(event: any, max: number | null) {
    if (max !== null && event.target.value && parseInt(event.target.value, 10) > max) {
      event.target.value = max.toString();
    }
  }

  applyDamage() {
    const s = this.state();
    const baseTotal = this.calculatedTotal();
    const parsed = this.parsedDamage();
    const manual = this.manualRoll() || 0;
    
    if (!s || baseTotal < 0 || (this.manualRoll() === null && this.parsedDamage().diceType)) return;

    s.targets.forEach(target => {
       const tier = s.hitTiers?.[target.id] || 'solid';
       
       let targetFinalDamage = baseTotal;

       if (tier === 'critical') {
          targetFinalDamage = (manual * 2) + parsed.modifier - this.flatReduction();
          targetFinalDamage = Math.max(0, targetFinalDamage);
       } else if (tier === 'grazing') {
          targetFinalDamage = Math.floor(targetFinalDamage / 2);
       }

       const def = this.targetDefenses()[target.id] || 'normal';
       
       let finalDef = def;
       let didPassSave = false;

       if (s.saveDC && this.targetSaveRolls()[target.id]) {
          const totalSave = this.targetSaveRolls()[target.id]! + this.targetSaveModifiers()[target.id];
          if (totalSave >= s.saveDC) {
             finalDef = 'resistance'; // Passou (metade do dano)
             didPassSave = true;
          } else {
             finalDef = 'normal'; // Falhou (dano integral)
          }
       }

       if (finalDef === 'resistance') {
         targetFinalDamage = Math.floor(targetFinalDamage / 2);
       } else if (finalDef === 'vulnerable') {
         targetFinalDamage = targetFinalDamage * 2;
       } else if (finalDef === 'immune') {
         targetFinalDamage = 0;
       }

       this.combat.updateToken(target.id, { hp: Math.max(0, target.hp - targetFinalDamage) });
       
       let reason = '';
       if (tier === 'critical') reason += ' [CRÍTICO]';
       if (tier === 'grazing') reason += ' [De Raspão]';
       
       if (didPassSave) {
          reason += ' (Passou na Resistência)';
       } else {
          if (finalDef === 'resistance') reason += ' (Resistiu)';
          if (finalDef === 'vulnerable') reason += ' (Vulnerável!)';
          if (finalDef === 'immune') reason += ' (Imune)';
       }

       const log = `Dano contra ${target.name} = ${targetFinalDamage} recebido!${reason}`;
       this.combat.addNotification(log, 'info');
    });

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
