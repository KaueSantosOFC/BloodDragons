import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { CombatService } from '../../services/combat.service';
import { DndCoreEngineService, AttackRollResult } from '../../services/dnd-core-engine.service';

@Component({
  selector: 'app-attack-modal',
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
              <div class="w-10 h-10 rounded-full border-2 border-amber-500 overflow-hidden bg-stone-900">
                @if (state()?.attacker?.imageUrl) {
                   <img [src]="state()?.attacker?.imageUrl" alt="Attacker" class="w-full h-full object-cover" referrerpolicy="no-referrer">
                }
              </div>
              <div>
                <h2 class="text-lg font-bold text-amber-500 leading-tight">Ataque</h2>
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
              <mat-icon class="text-amber-500" [ngClass]="{'text-blue-400': isSpell()}">
                {{ isSpell() ? 'auto_fix_high' : 'colorize' }}
              </mat-icon>
              <div>
                <h3 class="font-bold text-stone-200">{{ state()?.ability?.name }}</h3>
                <p class="text-xs text-stone-400">
                  {{ isSpell() ? 'Ataque Mágico' : 'Ataque com Arma' }} 
                  ({{ attributeUsed() | uppercase }})
                </p>
              </div>
            </div>

            <div class="grid gap-4" [class.grid-cols-2]="state()?.targets?.length === 1" [class.grid-cols-1]="state()?.targets?.length !== 1">
              <div class="bg-stone-800 p-3 rounded border border-stone-700 text-center flex flex-col justify-center">
                <p class="text-[10px] uppercase text-stone-500 font-bold mb-1">
                  Modificador 
                  <span class="text-amber-500/80">({{ modifierSources() }})</span>
                </p>
                <p class="text-xl font-mono font-bold text-stone-300">
                  {{ modifierTotal() >= 0 ? '+' : '' }}{{ modifierTotal() }}
                </p>
              </div>
              @if (state()?.targets?.length === 1) {
                <div class="bg-stone-800 p-3 rounded border border-stone-700 text-center">
                  <p class="text-[10px] uppercase text-stone-500 font-bold mb-1" title="Valor vindo da Ficha do Alvo">CA da Ficha</p>
                  <p class="text-xl font-mono font-bold text-stone-300">{{ state()?.targets![0].sheet?.ac || 10 }}</p>
                </div>
              }
            </div>

            @if (!results()) {
              <div class="space-y-3 pt-2">
                <p class="text-[10px] text-stone-500 font-bold uppercase mb-2 text-center">Jogadas de Ataque Físicas (Opcional)</p>
                <div class="space-y-2 max-h-48 overflow-y-auto">
                  @for (target of state()?.targets; track target.id) {
                    <div class="flex items-center justify-between bg-stone-800 p-2 rounded border border-stone-700">
                      <div>
                        <span class="text-xs text-stone-300 block">{{ target.name }}</span>
                        <span class="text-[10px] text-stone-500 block">CA da Ficha: {{ target.sheet?.ac || 10 }}</span>
                      </div>
                      <input type="number" [ngModel]="manualRolls()[target.id]" (ngModelChange)="setManualRoll(target.id, $event)" 
                             (input)="enforceLimit($event, 20)"
                             min="1" max="20"
                             class="w-16 bg-stone-900 border border-stone-600 rounded px-2 py-1 text-center font-mono font-bold text-sm focus:outline-none focus:border-amber-500"
                             placeholder="d20">
                    </div>
                  }
                </div>
                
                <div class="flex gap-2 pt-2">
                  <button (click)="rollAttack()" class="w-full bg-amber-600 hover:bg-amber-500 text-stone-900 px-4 py-2 rounded font-bold transition-colors flex items-center justify-center gap-2 mt-2">
                    <mat-icon>casino</mat-icon>
                    RESOLVER ATAQUES (Preenche vazios automaticamente)
                  </button>
                </div>
                @if (errorMsg()) {
                  <p class="text-red-400 text-xs text-center">{{ errorMsg() }}</p>
                }
              </div>
            } @else {
              <!-- Loop through targets to show individual results -->
              <div class="space-y-3 max-h-48 overflow-y-auto pr-2">
                @for (target of state()?.targets; track target.id) {
                  @let res = results()![target.id];
                  @let hit = isHit(target.id);
                  <div class="p-3 rounded border animate-in fade-in zoom-in-95 duration-300"
                       [class.bg-green-900/20]="hit"
                       [class.border-green-500/50]="hit"
                       [class.bg-red-900/20]="!hit"
                       [class.border-red-500/50]="!hit">
                    
                    <div class="flex items-center justify-between mb-1">
                      <div>
                        <span class="text-xs text-stone-400 block">{{ target.name }}</span>
                        <span class="text-[10px] text-stone-500 block">CA da Ficha: {{ target.sheet?.ac || 10 }}</span>
                        <span class="font-bold text-sm" 
                              [class.text-green-400]="hit"
                              [class.text-red-400]="!hit">
                          {{ hit ? 'ACERTOU!' : 'ERROU...' }}
                        </span>
                      </div>
                      <div class="text-right">
                        <span class="font-mono font-bold text-xl text-stone-200">{{ res?.total }}</span>
                      </div>
                    </div>
                    
                    <div class="text-xs text-stone-500 font-mono flex items-center justify-between">
                      <span class="group relative flex items-center gap-1">
                        d20: [{{ res?.naturalRoll }}] + Mod: {{ modifierTotal() }}
                        <mat-icon class="text-[14px] w-[14px] h-[14px] cursor-help text-stone-500 hover:text-amber-500 transition-colors">info</mat-icon>
                        <div class="absolute left-0 bottom-full mb-1 hidden group-hover:block w-48 bg-stone-950 border border-stone-700 text-stone-300 text-[10px] rounded p-2 shadow-xl z-10 font-sans leading-tight">
                          O Modificador é:<br>
                          • Atributo Base<br>
                          • Proficiência (se aplicável)<br>
                          • Bônus do Item
                        </div>
                      </span>
                      @if (res?.isCritical) {
                        <span class="font-bold text-amber-400 uppercase tracking-widest text-[10px]">Crítico!</span>
                      }
                      @if (res?.isFumble) {
                        <span class="font-bold text-red-500 uppercase tracking-widest text-[10px]">Falha Crítica!</span>
                      }
                    </div>
                  </div>
                }
              </div>

              <div class="flex gap-2 pt-2 mt-4 border-t border-stone-800">
                <button (click)="close()" class="flex-1 py-2 bg-stone-700 hover:bg-stone-600 text-white font-bold rounded transition-colors">
                  FECHAR
                </button>
                @if (hasAnyHit() && state()?.ability?.damage) {
                  <button (click)="applyDamage()" class="flex-1 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded transition-colors flex items-center justify-center gap-2">
                    <mat-icon>local_fire_department</mat-icon>
                    DANO ({{ hitCount() }})
                  </button>
                }
              </div>
            }

          </div>
        </div>
      </div>
    }
  `
})
export class AttackModalComponent {
  combat = inject(CombatService);
  engine = inject(DndCoreEngineService);

  state = this.combat.attackModalState;
  
  manualRolls = signal<Record<string, number | null>>({});
  errorMsg = signal<string | null>(null);
  results = signal<Record<string, AttackRollResult> | null>(null);

  isSpell = computed(() => {
    const s = this.state();
    return s?.ability?.category === 'spell';
  });

  targetNames = computed(() => {
    const s = this.state();
    if (!s || s.targets.length === 0) return '';
    if (s.targets.length === 1) return s.targets[0].name;
    return `${s.targets[0].name} e mais ${s.targets.length - 1}`;
  });

  attributeUsed = computed(() => {
    const s = this.state();
    if (!s) return 'str';
    
    const sheet = s.attacker.sheet;
    const attacker = {
      stats: (sheet as unknown) as Record<string, number>,
      proficiencyBonus: sheet?.proficiencyBonus || 2,
      spellcastingAbility: sheet?.spellcastingAbility || 'int'
    };
    const weapon = {
      name: s.ability.name,
      properties: s.ability.properties || [],
      attackBonus: s.ability.attackBonus,
      isProficient: s.ability.isProficient
    };
    
    // We just run a dummy roll to get the attribute used
    const dummy = this.engine.calculateAttackRoll(attacker, weapon, this.isSpell());
    return dummy.attributeUsed;
  });

  modifierTotal = computed(() => {
    const s = this.state();
    if (!s) return 0;
    
    const sheet = s.attacker.sheet;
    const attacker = {
      stats: (sheet as unknown) as Record<string, number>,
      proficiencyBonus: sheet?.proficiencyBonus || 2,
      spellcastingAbility: sheet?.spellcastingAbility || 'int'
    };
    const weapon = {
      name: s.ability.name,
      properties: s.ability.properties || [],
      attackBonus: s.ability.attackBonus,
      isProficient: s.ability.isProficient
    };
    
    const dummy = this.engine.calculateAttackRoll(attacker, weapon, this.isSpell());
    
    // Total is dummy.modifier + applied prof + attackBonus, all handled by logic internally. 
    // Wait, dummy already calculates but returns modifier. Let's just calculate appliedProf again or get it from calculateAttackRoll
    // We can just rely on dummy.total - dummy.naturalRoll
    return dummy.total - dummy.naturalRoll;
  });

  modifierSources = computed(() => {
    const s = this.state();
    if (!s) return '';
    
    const attrMap: Record<string, string> = {
      'str': 'FOR',
      'dex': 'DES',
      'con': 'CON',
      'int': 'INT',
      'wis': 'SAB',
      'cha': 'CAR'
    };
    
    const attr = attrMap[this.attributeUsed()] || this.attributeUsed().toUpperCase();
    const parts = [attr];
    
    if (this.isSpell() || s.ability.isProficient) {
      parts.push('PROF');
    }
    
    if (s.ability.attackBonus) {
      parts.push(`ITEM`);
    }
    
    return parts.join(' + ');
  });

  isHit(tokenId: string): boolean {
    const rs = this.results();
    if (!rs || !rs[tokenId]) return false;
    const res = rs[tokenId];
    if (res.isCritical) return true;
    if (res.isFumble) return false;
    
    const target = this.state()?.targets.find(t => t.id === tokenId);
    const ac = target?.sheet?.ac || 10;
    return res.total >= ac;
  }

  hasAnyHit = computed(() => {
    const s = this.state();
    if (!s) return false;
    return s.targets.some(t => this.isHit(t.id));
  });

  hitCount = computed(() => {
    const s = this.state();
    if (!s) return 0;
    return s.targets.filter(t => this.isHit(t.id)).length;
  });

  close() {
    this.combat.closeAttackModal();
    this.reset();
  }

  reset() {
    this.manualRolls.set({});
    this.errorMsg.set(null);
    this.results.set(null);
  }

  setManualRoll(targetId: string, roll: number | null) {
    let finalRoll = roll;
    if (roll !== null) {
      if (roll > 20) finalRoll = 20;
      if (roll < 1 && roll !== 0) finalRoll = 1; // 0 is usually intermediate when deleting, but let's be strict if they just typed 0. Actually, if they type 0, it becomes 1. If they delete, it becomes null.
      if (roll === 0) finalRoll = 1;
    }
    this.manualRolls.update(d => ({ ...d, [targetId]: finalRoll }));
  }

  enforceLimit(event: any, max: number) {
    if (event.target.value && parseInt(event.target.value, 10) > max) {
      event.target.value = max.toString();
    }
  }

  rollAttack() {
    const s = this.state();
    if (!s) return;

    // Validação
    let hasError = false;
    s.targets.forEach(t => {
       const val = this.manualRolls()[t.id];
       if (val !== undefined && val !== null) {
         if (val < 1 || val > 20 || !Number.isInteger(val)) {
            hasError = true;
         }
       }
    });

    if (hasError) {
      this.errorMsg.set('Existem valores que não condizem com um dado (1 a 20)');
      return;
    }
    
    this.errorMsg.set(null);

    const sheet = s.attacker.sheet;
    const attacker = {
      stats: (sheet as unknown) as Record<string, number>,
      proficiencyBonus: sheet?.proficiencyBonus || 2,
      spellcastingAbility: sheet?.spellcastingAbility || 'int'
    };
    const weapon = {
      name: s.ability.name,
      properties: s.ability.properties || [],
      attackBonus: s.ability.attackBonus,
      isProficient: s.ability.isProficient
    };

    const newResults: Record<string, AttackRollResult> = {};
    
    s.targets.forEach(target => {
       const manual = this.manualRolls()[target.id];
       const naturalRoll = (manual !== undefined && manual !== null) ? manual : undefined;
       
       const rollResult = this.engine.calculateAttackRoll(attacker, weapon, this.isSpell(), naturalRoll);
       newResults[target.id] = rollResult;
    });

    this.results.set(newResults);
  }

  applyDamage() {
    const s = this.state();
    const rs = this.results();
    if (!s || !rs || !this.hasAnyHit() || !s.ability.damage) return;

    const hitTiers: Record<string, 'grazing' | 'solid' | 'critical'> = {};
    const hitTargets = s.targets.filter(t => this.isHit(t.id));

    hitTargets.forEach(target => {
       const res = rs[target.id];
       const ac = target.sheet?.ac || 10;
       const totalAttack = res.total;

       if (res.isCritical || res.naturalRoll === 20) {
         hitTiers[target.id] = 'critical';
       } else if (totalAttack >= ac && totalAttack <= ac + 2) {
         hitTiers[target.id] = 'grazing';
       } else {
         hitTiers[target.id] = 'solid';
       }
    });

    this.combat.openDamageModal(s.attacker, hitTargets, s.ability, hitTiers);
    
    this.close();
  }
}
