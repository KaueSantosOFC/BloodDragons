import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { CombatService } from '../../services/combat.service';
import { DndCoreEngineService, AttackRollResult, ActionResult } from '../../services/dnd-core-engine.service';

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
                <img *ngIf="state()?.attacker?.imageUrl" [src]="state()?.attacker?.imageUrl" class="w-full h-full object-cover" referrerpolicy="no-referrer">
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

            <div class="grid grid-cols-2 gap-4">
              <div class="bg-stone-800 p-3 rounded border border-stone-700 text-center">
                <p class="text-[10px] uppercase text-stone-500 font-bold mb-1">Modificador</p>
                <p class="text-xl font-mono font-bold text-stone-300">
                  {{ modifierTotal() >= 0 ? '+' : '' }}{{ modifierTotal() }}
                </p>
              </div>
              <div class="bg-stone-800 p-3 rounded border border-stone-700 text-center">
                <p class="text-[10px] uppercase text-stone-500 font-bold mb-1">CA do Alvo</p>
                <p class="text-xl font-mono font-bold text-stone-300">{{ targetAC() }}</p>
              </div>
            </div>

            @if (!result()) {
              <div class="space-y-3 pt-2">
                <div class="flex gap-2">
                  <input type="number" [(ngModel)]="manualRoll" 
                         class="flex-1 bg-stone-800 border border-stone-600 rounded px-3 py-2 text-center font-mono font-bold text-lg focus:outline-none focus:border-amber-500"
                         placeholder="Valor do d20 (1-20)"
                         (keyup.enter)="rollAttack()">
                  <button (click)="rollAttack()" class="bg-amber-600 hover:bg-amber-500 text-stone-900 px-4 rounded font-bold transition-colors flex items-center gap-2">
                    <mat-icon>casino</mat-icon>
                    ROLAR
                  </button>
                </div>
                @if (errorMsg()) {
                  <p class="text-red-400 text-xs text-center">{{ errorMsg() }}</p>
                }
              </div>
            } @else {
              <div class="p-4 rounded border animate-in fade-in zoom-in-95 duration-300"
                   [class.bg-green-900/20]="isHit()"
                   [class.border-green-500/50]="isHit()"
                   [class.bg-red-900/20]="!isHit()"
                   [class.border-red-500/50]="!isHit()">
                
                <div class="flex items-center justify-between mb-2">
                  <span class="font-bold text-xl" 
                        [class.text-green-400]="isHit()"
                        [class.text-red-400]="!isHit()">
                    {{ isHit() ? 'ACERTOU!' : 'ERROU...' }}
                  </span>
                  <span class="font-mono font-bold text-2xl text-stone-200">{{ result()?.total }}</span>
                </div>
                
                <div class="text-sm text-stone-400 font-mono">
                  d20: [{{ result()?.naturalRoll }}] + Mod: {{ result()?.modifier }}
                </div>
                
                @if (result()?.isCritical) {
                  <div class="mt-2 text-xs font-bold text-amber-400 uppercase tracking-widest text-center">
                    Sucesso Crítico!
                  </div>
                }
                @if (result()?.isFumble) {
                  <div class="mt-2 text-xs font-bold text-red-500 uppercase tracking-widest text-center">
                    Falha Crítica!
                  </div>
                }
              </div>

              <div class="flex gap-2 pt-2">
                <button (click)="close()" class="flex-1 py-2 bg-stone-700 hover:bg-stone-600 text-white font-bold rounded transition-colors">
                  FECHAR
                </button>
                @if (isHit() && state()?.ability?.damage) {
                  <button (click)="applyDamage()" class="flex-1 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded transition-colors flex items-center justify-center gap-2">
                    <mat-icon>local_fire_department</mat-icon>
                    DANO
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
  
  manualRoll = signal<number | null>(null);
  errorMsg = signal<string | null>(null);
  result = signal<AttackRollResult | null>(null);

  isSpell = computed(() => {
    const s = this.state();
    return s?.ability?.category === 'spell';
  });

  targetAC = computed(() => {
    const s = this.state();
    if (!s || s.targets.length === 0) return 10;
    return s.targets[0].sheet?.ac || 10;
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
    
    const attacker = {
      stats: (s.attacker.sheet as unknown) as Record<string, number>,
      proficiencyBonus: s.attacker.sheet?.proficiencyBonus || 2,
      spellcastingAbility: (s.attacker.sheet as any)?.spellcastingAbility || 'int'
    };
    const weapon = {
      name: s.ability.name,
      properties: s.ability.properties || [],
      attackBonus: s.ability.attackBonus
    };
    
    // We just run a dummy roll to get the attribute used
    const dummy = this.engine.calculateAttackRoll(attacker, weapon, this.isSpell());
    return dummy.attributeUsed;
  });

  modifierTotal = computed(() => {
    const s = this.state();
    if (!s) return 0;
    
    if (s.ability.attackBonus !== undefined && s.ability.attackBonus !== 0) {
      return s.ability.attackBonus;
    }
    
    const attacker = {
      stats: (s.attacker.sheet as unknown) as Record<string, number>,
      proficiencyBonus: s.attacker.sheet?.proficiencyBonus || 2,
      spellcastingAbility: (s.attacker.sheet as any)?.spellcastingAbility || 'int'
    };
    const weapon = {
      name: s.ability.name,
      properties: s.ability.properties || [],
      attackBonus: s.ability.attackBonus
    };
    
    const dummy = this.engine.calculateAttackRoll(attacker, weapon, this.isSpell());
    return dummy.modifier + (attacker.proficiencyBonus || 0);
  });

  isHit = computed(() => {
    const res = this.result();
    if (!res) return false;
    if (res.isCritical) return true;
    if (res.isFumble) return false;
    return res.total >= this.targetAC();
  });

  close() {
    this.combat.closeAttackModal();
    this.reset();
  }

  reset() {
    this.manualRoll.set(null);
    this.errorMsg.set(null);
    this.result.set(null);
  }

  rollAttack() {
    const s = this.state();
    if (!s) return;

    const val = this.manualRoll();
    if (val !== null && (val < 1 || val > 20 || !Number.isInteger(val))) {
      this.errorMsg.set('Valor não condizente com dado (1 a 20)');
      return;
    }
    this.errorMsg.set(null);

    const attacker = {
      stats: (s.attacker.sheet as unknown) as Record<string, number>,
      proficiencyBonus: s.attacker.sheet?.proficiencyBonus || 2,
      spellcastingAbility: (s.attacker.sheet as any)?.spellcastingAbility || 'int'
    };
    const weapon = {
      name: s.ability.name,
      properties: s.ability.properties || [],
      attackBonus: s.ability.attackBonus
    };

    const rollResult = this.engine.calculateAttackRoll(attacker, weapon, this.isSpell(), val || undefined);
    this.result.set(rollResult);
  }

  applyDamage() {
    const s = this.state();
    const res = this.result();
    if (!s || !res || !this.isHit() || !s.ability.damage) return;

    if (s.ability.areaShape && s.ability.areaShape !== 'none') {
      // Use resolveAoEDamage from combat service
      this.combat.resolveAoEDamage({x: s.attacker.x, y: s.attacker.y}, s.targets, s.ability, res.isCritical);
    } else {
      // Calculate damage
      const damageDice = s.ability.damage;
      
      // For simplicity, we use the engine's calculateDamage
      // We need the modifier used for the attack to add to damage (unless it's a spell, usually spells don't add modifier to damage unless specified, but we'll add it for simplicity or just use 0)
      const attackerStats = (s.attacker.sheet as unknown) as Record<string, number>;
      const mod = this.isSpell() ? 0 : this.engine.calculateModifier(attackerStats[res.attributeUsed] || 10);
      
      const damageRoll = this.engine.calculateDamage(damageDice, mod, 0);
      
      if (res.isCritical) {
        const critDamage = this.engine.calculateDamage(damageDice, 0, 0);
        damageRoll.total += critDamage.total;
      }

      s.targets.forEach(target => {
        this.combat.updateToken(target.id, { hp: Math.max(0, target.hp - damageRoll.total) });
        
        // Log
        const log = `Ataque contra ${target.name} (CA ${this.targetAC()}): d20 [${res.naturalRoll}] + Mod ${res.modifier} = ${res.total} -> ACERTOU!\nDano: ${damageRoll.total}`;
        console.log(log);
        this.combat.addNotification(log, 'info');
      });
    }
    
    this.close();
  }
}
