import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { CombatService } from '../../services/combat.service';
import { DndMathService } from '../../services/dnd-math.service';
import { AuthService } from '../../services/auth.service';
import { CharacterSheet, Token } from '../../models/token';
import { Ability } from '../../models/ability';

@Component({
  selector: 'app-fullscreen-sheet',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (token()) {
      <div class="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-305">
        <div class="bg-stone-900 border border-stone-800 text-stone-200 rounded-2xl w-full max-w-6xl h-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-305">
          
          <!-- Header -->
          <div class="bg-stone-950 p-6 border-b border-stone-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
            <div class="flex items-center gap-4">
              <div class="w-16 h-16 rounded-full border-2 border-amber-500/80 overflow-hidden bg-stone-900 shadow-md">
                @if (token()?.imageUrl) {
                  <img [src]="token()?.imageUrl" alt="Token" class="w-full h-full object-cover">
                } @else {
                  <div class="w-full h-full flex items-center justify-center bg-stone-800 text-stone-500">
                    <mat-icon>person</mat-icon>
                  </div>
                }
              </div>
              <div>
                <div class="flex items-center gap-3">
                  <h2 class="text-2xl font-bold text-amber-500 tracking-tight">{{ token()?.name }}</h2>
                  <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase">
                    {{ sheet()?.race }} • {{ sheet()?.class }} Nível {{ sheet()?.level }}
                  </span>
                </div>
                <p class="text-xs text-stone-400 mt-1">
                  Jogador: <span class="text-stone-300">{{ sheet()?.playerName || 'Nenhum' }}</span> | 
                  Tendência: <span class="text-stone-300">{{ sheet()?.alignment || 'Neutra' }}</span> | 
                  XP: <span class="text-stone-300">{{ sheet()?.xp || 0 }}</span>
                </p>
              </div>
            </div>
            
            <div class="flex items-center gap-3">
              @if (canEdit()) {
                <button 
                  class="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200"
                  [class.bg-amber-600]="isEditing()"
                  [class.text-stone-900]="isEditing()"
                  [class.hover:bg-amber-500]="isEditing()"
                  [class.bg-stone-800]="!isEditing()"
                  [class.text-stone-300]="!isEditing()"
                  [class.hover:bg-stone-700]="!isEditing()"
                  (click)="toggleEdit()"
                >
                  <mat-icon class="text-base" style="font-size: 18px; width: 18px; height: 18px;">
                    {{ isEditing() ? 'save' : 'edit' }}
                  </mat-icon>
                  {{ isEditing() ? 'Salvar Ficha' : 'Editar Ficha' }}
                </button>
              }
              
              <button 
                (click)="close()" 
                class="w-10 h-10 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white transition-colors flex items-center justify-center"
              >
                <mat-icon>close</mat-icon>
              </button>
            </div>
          </div>
          
          <!-- Tabs Navigation -->
          <div class="bg-stone-950 border-b border-stone-800 px-6 flex gap-6 shrink-0 text-sm font-medium">
            <button 
              (click)="activeTab.set('status')"
              [class.text-amber-500]="activeTab() === 'status'"
              [class.border-b-2]="activeTab() === 'status'"
              [class.border-amber-500]="activeTab() === 'status'"
              class="py-3 px-1 transition-all duration-200 hover:text-amber-400"
            >
              Status & Combate
            </button>
            <button 
              (click)="activeTab.set('attributes')"
              [class.text-amber-500]="activeTab() === 'attributes'"
              [class.border-b-2]="activeTab() === 'attributes'"
              [class.border-amber-500]="activeTab() === 'attributes'"
              class="py-3 px-1 transition-all duration-200 hover:text-amber-400"
            >
              Atributos & Perícias
            </button>
            <button 
              (click)="activeTab.set('actions')"
              [class.text-amber-500]="activeTab() === 'actions'"
              [class.border-b-2]="activeTab() === 'actions'"
              [class.border-amber-500]="activeTab() === 'actions'"
              class="py-3 px-1 transition-all duration-200 hover:text-amber-400"
            >
              Ações & Magias
            </button>
            <button 
              (click)="activeTab.set('inventory')"
              [class.text-amber-500]="activeTab() === 'inventory'"
              [class.border-b-2]="activeTab() === 'inventory'"
              [class.border-amber-500]="activeTab() === 'inventory'"
              class="py-3 px-1 transition-all duration-200 hover:text-amber-400"
            >
              Inventário ({{ totalWeight() | number:'1.0-2' }}/{{ carryCapacity() }} kg)
            </button>
          </div>
          
          <!-- Content Body -->
          <div class="flex-1 overflow-y-auto p-6 min-h-0 bg-stone-900/60 custom-scrollbar">
            
            <!-- TAB: STATUS & COMBAT -->
            @if (activeTab() === 'status') {
              <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                <!-- Main Combat Stats Card -->
                <div class="lg:col-span-2 space-y-6">
                  <div class="grid grid-cols-3 gap-4">
                    <div class="bg-stone-950 p-4 rounded-xl border border-stone-800 text-center relative group hover:border-amber-500/30 transition-colors">
                      <div class="text-[10px] text-stone-500 uppercase font-black tracking-widest mb-1">Classe de Armadura (CA)</div>
                      @if (isEditing()) {
                        <input type="number" [(ngModel)]="editableSheet.ac" class="bg-stone-900 border border-stone-700 rounded text-center text-xl font-bold text-amber-500 w-20 py-1">
                      } @else {
                        <div class="text-3xl font-black text-amber-500 font-mono">{{ sheet()?.ac }}</div>
                      }
                      <mat-icon class="absolute bottom-2 right-2 text-stone-800 text-base pointer-events-none">security</mat-icon>
                    </div>
                    
                    <div class="bg-stone-950 p-4 rounded-xl border border-stone-800 text-center relative group hover:border-amber-500/30 transition-colors">
                      <div class="text-[10px] text-stone-500 uppercase font-black tracking-widest mb-1">Iniciativa</div>
                      @if (isEditing()) {
                        <input type="number" [(ngModel)]="editableSheet.initiative" class="bg-stone-900 border border-stone-700 rounded text-center text-xl font-bold text-amber-500 w-20 py-1">
                      } @else {
                        <div class="text-3xl font-black text-amber-500 font-mono">
                          {{ (sheet()?.initiative || 0) >= 0 ? '+' : '' }}{{ sheet()?.initiative }}
                        </div>
                      }
                      <mat-icon class="absolute bottom-2 right-2 text-stone-800 text-base pointer-events-none">timer</mat-icon>
                    </div>
                    
                    <div class="bg-stone-950 p-4 rounded-xl border border-stone-800 text-center relative group hover:border-amber-500/30 transition-colors">
                      <div class="text-[10px] text-stone-500 uppercase font-black tracking-widest mb-1">Velocidade</div>
                      @if (isEditing()) {
                        <input type="number" [(ngModel)]="editableSheet.speed" class="bg-stone-900 border border-stone-700 rounded text-center text-xl font-bold text-amber-500 w-20 py-1">
                      } @else {
                        <div class="text-3xl font-black text-amber-500 font-mono">{{ sheet()?.speed }}m</div>
                      }
                      <mat-icon class="absolute bottom-2 right-2 text-stone-800 text-base pointer-events-none">directions_run</mat-icon>
                    </div>
                  </div>
                  
                  <!-- Health Points and Temporary HP -->
                  <div class="bg-stone-950 p-6 rounded-xl border border-stone-800 space-y-4">
                    <div class="flex justify-between items-center">
                      <div class="flex items-center gap-2">
                        <mat-icon class="text-red-500">favorite</mat-icon>
                        <h3 class="text-lg font-bold text-stone-200">Pontos de Vida (PV)</h3>
                      </div>
                      
                      <div class="flex items-center gap-2 font-mono">
                        @if (isEditing()) {
                          <input type="number" [(ngModel)]="editableSheet.hp" class="bg-stone-900 border border-stone-700 rounded text-center font-bold text-stone-200 w-16 py-0.5">
                          <span class="text-stone-500">/</span>
                          <input type="number" [(ngModel)]="editableSheet.maxHp" class="bg-stone-900 border border-stone-700 rounded text-center font-bold text-stone-200 w-16 py-0.5">
                        } @else {
                          <span class="text-2xl font-bold text-stone-100">{{ sheet()?.hp }}</span>
                          <span class="text-stone-500">/</span>
                          <span class="text-lg text-stone-400">{{ sheet()?.maxHp }}</span>
                        }
                      </div>
                    </div>
                    
                    <div class="h-4 bg-stone-900 rounded-full overflow-hidden border border-stone-800 p-0.5">
                      <div 
                        class="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-red-600 to-red-500" 
                        [style.width.%]="hpPercent()"
                      ></div>
                    </div>
                    
                    <!-- Temporary HP / Spellcasting slots -->
                    <div class="grid grid-cols-2 gap-4 mt-2">
                      <div class="bg-stone-900/60 p-3 rounded-lg border border-stone-800/80 flex items-center justify-between">
                        <span class="text-xs text-stone-400">Dados de Vida Restantes:</span>
                        <span class="font-mono text-amber-500 font-bold text-sm">
                          {{ sheet()?.level }}d{{ sheet()?.hitDie }}
                        </span>
                      </div>
                      
                      <div class="bg-stone-900/60 p-3 rounded-lg border border-stone-800/80 flex items-center justify-between">
                        <span class="text-xs text-stone-400">Bônus de Proficiência:</span>
                        <span class="font-mono text-amber-500 font-bold text-sm">
                          +{{ sheet()?.proficiencyBonus }}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Spell Slot Tracker (For Spellcasters) -->
                  @if (sheet()?.maxSpellUses || isEditing()) {
                    <div class="bg-stone-950 p-6 rounded-xl border border-stone-800 space-y-4">
                      <div class="flex justify-between items-center">
                        <div class="flex items-center gap-2">
                          <mat-icon class="text-blue-400">auto_fix_high</mat-icon>
                          <h3 class="text-lg font-bold text-stone-200">Espaços de Magia / Usos Mágicos</h3>
                        </div>
                        <div class="flex items-center gap-2 font-mono">
                          @if (isEditing()) {
                            <input type="number" [(ngModel)]="editableSheet.spellUses" class="bg-stone-900 border border-stone-700 rounded text-center font-bold text-blue-400 w-16 py-0.5">
                            <span class="text-stone-500">/</span>
                            <input type="number" [(ngModel)]="editableSheet.maxSpellUses" class="bg-stone-900 border border-stone-700 rounded text-center font-bold text-blue-400 w-16 py-0.5">
                          } @else {
                            <span class="text-2xl font-bold text-blue-400">{{ sheet()?.spellUses || 0 }}</span>
                            <span class="text-stone-500">/</span>
                            <span class="text-lg text-stone-500">{{ sheet()?.maxSpellUses || 0 }}</span>
                          }
                        </div>
                      </div>
                      
                      <!-- Quick usage buttons -->
                      <div class="flex gap-2">
                        <button 
                          (click)="modifySpellUses(-1)" 
                          [disabled]="(sheet()?.spellUses || 0) <= 0" 
                          class="flex-1 py-2 bg-stone-900 hover:bg-stone-800 text-stone-300 rounded-lg border border-stone-800 transition-colors text-xs font-semibold disabled:opacity-30 disabled:pointer-events-none"
                        >
                          Gastar Espaço (-1)
                        </button>
                        <button 
                          (click)="modifySpellUses(1)" 
                          [disabled]="(sheet()?.spellUses || 0) >= (sheet()?.maxSpellUses || 0)" 
                          class="flex-1 py-2 bg-stone-900 hover:bg-stone-800 text-stone-300 rounded-lg border border-stone-800 transition-colors text-xs font-semibold disabled:opacity-30 disabled:pointer-events-none"
                        >
                          Recuperar Espaço (+1)
                        </button>
                      </div>
                    </div>
                  }
                </div>
                
                <!-- Survival & Conditions Card (D&D DMG Core mechanics) -->
                <div class="bg-stone-950 p-6 rounded-xl border border-stone-800 flex flex-col justify-between">
                  <div class="space-y-6">
                    <div class="flex items-center gap-2 border-b border-stone-800 pb-3">
                      <mat-icon class="text-amber-500">eco</mat-icon>
                      <h3 class="text-lg font-bold text-stone-200">Sobrevivência & Fadiga</h3>
                    </div>
                    
                    <!-- Exhaustion Level Tracker -->
                    <div class="space-y-2">
                      <div class="flex justify-between items-center text-sm">
                        <span class="text-stone-400 font-bold uppercase text-xs">Exaustão (0-6)</span>
                        <span class="font-mono text-amber-500 font-black text-lg">Nível {{ currentExhaustion() }}</span>
                      </div>
                      <div class="flex gap-1.5 justify-between bg-stone-900 p-2.5 rounded-lg border border-stone-850">
                        @for (i of [1, 2, 3, 4, 5, 6]; track i) {
                          <button 
                            (click)="setExhaustion(i)" 
                            [class.bg-red-500]="currentExhaustion() >= i"
                            [class.border-red-500]="currentExhaustion() >= i"
                            [class.text-stone-950]="currentExhaustion() >= i"
                            [class.bg-stone-800]="currentExhaustion() < i"
                            [class.border-stone-700]="currentExhaustion() < i"
                            [class.text-stone-500]="currentExhaustion() < i"
                            class="w-8 h-8 rounded-full font-bold border transition-all duration-200 text-xs flex items-center justify-center hover:scale-105"
                          >
                            {{ i }}
                          </button>
                        }
                      </div>
                      @if (currentExhaustion() > 0) {
                        <div class="bg-red-955/20 border border-red-500/20 rounded-lg p-3 text-xs text-red-400/90 leading-relaxed">
                          <strong>Efeito Ativo:</strong> {{ getExhaustionEffect(currentExhaustion()) }}
                        </div>
                      } @else {
                        <div class="bg-stone-900/40 border border-stone-800/40 rounded-lg p-3 text-xs text-stone-500 text-center italic">
                          Personagem bem descansado, sem fadiga ativa.
                        </div>
                      }
                    </div>
                    
                    <!-- Rations / Water Tracker -->
                    <div class="grid grid-cols-2 gap-4 mt-4">
                      <!-- Rations -->
                      <div class="bg-stone-900 p-3 rounded-lg border border-stone-805 flex flex-col justify-between">
                        <span class="text-[10px] text-stone-500 font-bold uppercase tracking-wider">Rações de Comida</span>
                        <div class="flex items-center justify-between mt-2">
                          <button (click)="changeRations(-1)" class="w-6 h-6 rounded bg-stone-800 hover:bg-stone-750 text-stone-300 flex items-center justify-center text-xs font-bold">-</button>
                          <span class="font-mono font-bold text-stone-200 text-base">{{ currentRations() }}</span>
                          <button (click)="changeRations(1)" class="w-6 h-6 rounded bg-stone-800 hover:bg-stone-750 text-stone-300 flex items-center justify-center text-xs font-bold">+</button>
                        </div>
                      </div>
                      <!-- Water -->
                      <div class="bg-stone-900 p-3 rounded-lg border border-stone-805 flex flex-col justify-between">
                        <span class="text-[10px] text-stone-500 font-bold uppercase tracking-wider">Cantil de Água</span>
                        <div class="flex items-center justify-between mt-2">
                          <button (click)="changeWater(-1)" class="w-6 h-6 rounded bg-stone-800 hover:bg-stone-750 text-stone-300 flex items-center justify-center text-xs font-bold">-</button>
                          <span class="font-mono font-bold text-stone-200 text-base">{{ currentWater() }}</span>
                          <button (click)="changeWater(1)" class="w-6 h-6 rounded bg-stone-800 hover:bg-stone-750 text-stone-300 flex items-center justify-center text-xs font-bold">+</button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Rest buttons -->
                  <div class="border-t border-stone-800 pt-4 mt-6 flex gap-3">
                    <button 
                      (click)="longRest()" 
                      class="flex-1 py-2.5 bg-amber-600/90 hover:bg-amber-500 hover:scale-[1.02] active:scale-95 text-stone-955 font-bold rounded-lg transition-all text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md"
                    >
                      <mat-icon style="font-size: 14px; width: 14px; height: 14px;">hotel</mat-icon>
                      Descanso Longo
                    </button>
                  </div>
                </div>
              </div>
            }
            
            <!-- TAB: ATTRIBUTES & SKILLS -->
            @if (activeTab() === 'attributes') {
              <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <!-- 6 Core attributes -->
                <div class="lg:col-span-1 grid grid-cols-2 gap-4">
                  @for (attr of attributes; track attr.key) {
                    <div class="bg-stone-950 p-4 rounded-xl border border-stone-800 text-center flex flex-col items-center justify-center relative group hover:border-amber-500/30 transition-colors">
                      <span class="text-[10px] text-stone-500 font-black tracking-widest uppercase mb-1">{{ attr.label }}</span>
                      
                      @if (isEditing()) {
                        <input type="number" [(ngModel)]="editableSheet[attr.key]" class="bg-stone-900 border border-stone-700 rounded text-center text-xl font-bold text-stone-200 w-16 py-0.5">
                      } @else {
                        <span class="text-2xl font-black text-stone-200">{{ sheet()?.[attr.key] || 10 }}</span>
                        <span class="text-xs font-bold text-amber-500 font-mono mt-1">
                          {{ modifierOf(sheet()?.[attr.key] || 10) >= 0 ? '+' : '' }}{{ modifierOf(sheet()?.[attr.key] || 10) }}
                        </span>
                      }
                    </div>
                  }
                </div>
                
                <!-- Skill Proficiencies and Saving Throws -->
                <div class="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 bg-stone-950 p-6 rounded-xl border border-stone-800">
                  <!-- Saving Throws -->
                  <div>
                    <h3 class="text-sm font-bold text-amber-500 uppercase tracking-wider border-b border-stone-800 pb-2 mb-3">Salvaguardas</h3>
                    <div class="space-y-2.5">
                      @for (attr of attributes; track attr.key) {
                        <div class="flex items-center justify-between text-xs p-1.5 rounded hover:bg-stone-900 transition-colors">
                          <div class="flex items-center gap-2">
                            <span class="w-2 h-2 rounded-full" [class.bg-amber-500]="isProficientInSave(attr.key)" [class.bg-stone-800]="!isProficientInSave(attr.key)"></span>
                            <span class="text-stone-300 font-semibold">{{ attr.label }}</span>
                          </div>
                          <span class="font-mono text-stone-400">
                            {{ getSaveModifier(attr.key) >= 0 ? '+' : '' }}{{ getSaveModifier(attr.key) }}
                          </span>
                        </div>
                      }
                    </div>
                  </div>
                  
                  <!-- Skills list -->
                  <div>
                    <h3 class="text-sm font-bold text-amber-500 uppercase tracking-wider border-b border-stone-800 pb-2 mb-3">Perícias</h3>
                    <div class="space-y-2 h-64 overflow-y-auto custom-scrollbar pr-1">
                      @for (skill of dndSkills; track skill.name) {
                        <div class="flex items-center justify-between text-xs p-1.5 rounded hover:bg-stone-900 transition-colors">
                          <div class="flex items-center gap-2">
                            <span class="w-2 h-2 rounded-full" [class.bg-amber-500]="isProficientInSkill(skill.name)" [class.bg-stone-800]="!isProficientInSkill(skill.name)"></span>
                            <span class="text-stone-300">{{ skill.label }} <span class="text-[10px] text-stone-500">({{ skill.attr }})</span></span>
                          </div>
                          <span class="font-mono text-stone-400">
                            {{ getSkillModifier(skill.name, skill.attr) >= 0 ? '+' : '' }}{{ getSkillModifier(skill.name, skill.attr) }}
                          </span>
                        </div>
                      }
                    </div>
                  </div>
                </div>
              </div>
            }
            
            <!-- TAB: ACTIONS & SPELLS -->
            @if (activeTab() === 'actions') {
              <div class="space-y-6">
                <!-- Weapons / Physical attacks -->
                <div class="bg-stone-950 p-6 rounded-xl border border-stone-800">
                  <h3 class="text-sm font-bold text-amber-500 uppercase tracking-wider border-b border-stone-800 pb-2 mb-4">Ataques corpo-a-corpo & à Distância</h3>
                  
                  @if (weapons().length === 0) {
                    <div class="text-center py-6 text-stone-500 text-xs italic">Nenhuma arma ou habilidade ofensiva cadastrada.</div>
                  } @else {
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      @for (weapon of weapons(); track weapon.id) {
                        <div class="bg-stone-900 border border-stone-800/80 p-4 rounded-lg flex justify-between items-start hover:border-amber-500/30 transition-colors">
                          <div>
                            <h4 class="font-bold text-stone-200">{{ weapon.name }}</h4>
                            <p class="text-[10px] text-stone-500 mt-1 uppercase font-semibold">Alcance: {{ weapon.range }}m | Dano: {{ weapon.damage }} {{ weapon.damageType }}</p>
                            <p class="text-xs text-stone-400 mt-2 leading-relaxed">{{ weapon.description }}</p>
                          </div>
                          
                          <div class="flex flex-col gap-2 shrink-0">
                            <button 
                              (click)="triggerAbilityAction(weapon)" 
                              class="px-3 py-1.5 bg-amber-600 text-stone-955 hover:bg-amber-500 font-bold rounded text-xs transition-colors flex items-center gap-1 shadow"
                            >
                              <mat-icon style="font-size:12px;width:12px;height:12px;">colorize</mat-icon>
                              Ataque
                            </button>
                            <button 
                              (click)="triggerAbilityDamage(weapon)" 
                              class="px-3 py-1.5 bg-red-800 text-stone-200 hover:bg-red-700 font-semibold rounded text-xs transition-colors flex items-center gap-1 shadow"
                            >
                              <mat-icon style="font-size:12px;width:12px;height:12px;">local_fire_department</mat-icon>
                              Dano
                            </button>
                          </div>
                        </div>
                      }
                    </div>
                  }
                </div>
                
                <!-- Spells -->
                <div class="bg-stone-950 p-6 rounded-xl border border-stone-800">
                  <h3 class="text-sm font-bold text-amber-500 uppercase tracking-wider border-b border-stone-800 pb-2 mb-4">Magias Conhecidas</h3>
                  
                  @if (spells().length === 0) {
                    <div class="text-center py-6 text-stone-500 text-xs italic">Nenhuma magia conhecida cadastrada.</div>
                  } @else {
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      @for (spell of spells(); track spell.id) {
                        <div class="bg-stone-900 border border-stone-800/80 p-4 rounded-lg flex justify-between items-start hover:border-blue-500/30 transition-colors">
                          <div>
                            <div class="flex items-center gap-2">
                              <h4 class="font-bold text-stone-200">{{ spell.name }}</h4>
                              <span class="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 font-bold uppercase">Nível {{ spell.spellLevel }}</span>
                            </div>
                            <p class="text-[10px] text-stone-500 mt-1 uppercase font-semibold">Alcance: {{ spell.range }}m | Dano: {{ spell.damage }} {{ spell.damageType }}</p>
                            <p class="text-xs text-stone-400 mt-2 leading-relaxed">{{ spell.description }}</p>
                          </div>
                          
                          <div class="flex flex-col gap-2 shrink-0">
                            <button 
                              (click)="triggerAbilityAction(spell)" 
                              class="px-3 py-1.5 bg-blue-600 text-stone-100 hover:bg-blue-500 font-semibold rounded text-xs transition-colors flex items-center gap-1 shadow"
                            >
                              <mat-icon style="font-size:12px;width:12px;height:12px;">auto_fix_high</mat-icon>
                              Conjurar
                            </button>
                            @if (spell.damage) {
                              <button 
                                (click)="triggerAbilityDamage(spell)" 
                                class="px-3 py-1.5 bg-red-800 text-stone-200 hover:bg-red-700 font-semibold rounded text-xs transition-colors flex items-center gap-1 shadow"
                              >
                                <mat-icon style="font-size:12px;width:12px;height:12px;">local_fire_department</mat-icon>
                                Dano
                              </button>
                            }
                          </div>
                        </div>
                      }
                    </div>
                  }
                </div>
              </div>
            }
            
            <!-- TAB: INVENTORY -->
            @if (activeTab() === 'inventory') {
              <div class="bg-stone-950 p-6 rounded-xl border border-stone-800 space-y-6">
                <div class="flex justify-between items-center border-b border-stone-800 pb-3">
                  <h3 class="text-sm font-bold text-amber-500 uppercase tracking-wider">Inventário de Mochila</h3>
                  <span class="text-xs text-stone-400 font-mono">Carregando: <strong class="text-amber-500">{{ totalWeight() | number:'1.0-2' }}</strong> / {{ carryCapacity() }} kg</span>
                </div>
                
                <!-- Weight indicator bar -->
                <div class="space-y-1">
                  <div class="h-2 bg-stone-900 rounded-full overflow-hidden border border-stone-800 p-0.5">
                    <div 
                      class="h-full rounded-full transition-all duration-300"
                      [style.width.%]="mathMin((totalWeight() / carryCapacity()) * 100, 100)"
                      [class.bg-green-500]="(totalWeight() / carryCapacity()) < 0.75"
                      [class.bg-amber-500]="(totalWeight() / carryCapacity()) >= 0.75 && (totalWeight() / carryCapacity()) < 1.0"
                      [class.bg-red-500]="(totalWeight() / carryCapacity()) >= 1.0"
                    ></div>
                  </div>
                  @if (totalWeight() >= carryCapacity()) {
                    <p class="text-[10px] text-red-400 font-bold uppercase tracking-wider">Aviso: Personagem Sobrecarregado (Velocidade reduzida em 3m / 10ft)</p>
                  }
                </div>
                
                <!-- Inventory Items List -->
                @if (inventoryItems().length === 0) {
                  <div class="text-center py-8 text-stone-500 text-xs italic">Nenhum item na mochila.</div>
                } @else {
                  <div class="overflow-x-auto">
                    <table class="w-full text-left text-xs">
                      <thead>
                        <tr class="border-b border-stone-800 text-stone-500 uppercase tracking-wider font-bold">
                          <th class="py-2.5">Item</th>
                          <th class="py-2.5 text-center">Quant.</th>
                          <th class="py-2.5 text-right">Peso Unitário</th>
                          <th class="py-2.5 text-right">Peso Total</th>
                          <th class="py-2.5 text-center">Equipado</th>
                          @if (isEditing()) {
                            <th class="py-2.5 text-center">Ações</th>
                          }
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-stone-850">
                        @for (item of inventoryItems(); track item.name; let idx = $index) {
                          <tr class="hover:bg-stone-900/40 transition-colors">
                            <td class="py-3 font-semibold text-stone-200">
                              @if (isEditing()) {
                                <input type="text" [(ngModel)]="item.name" class="bg-stone-900 border border-stone-700 rounded px-2 py-0.5 w-full text-stone-200">
                              } @else {
                                {{ item.name }}
                              }
                            </td>
                            <td class="py-3 text-center">
                              @if (isEditing()) {
                                <input type="number" [(ngModel)]="item.quantity" class="bg-stone-900 border border-stone-700 rounded text-center w-12 py-0.5 text-stone-200">
                              } @else {
                                {{ item.quantity }}
                              }
                            </td>
                            <td class="py-3 text-right text-stone-400">
                              @if (isEditing()) {
                                <input type="number" step="0.1" [(ngModel)]="item.weight" class="bg-stone-900 border border-stone-700 rounded text-right w-16 py-0.5 text-stone-200">
                              } @else {
                                {{ item.weight }} kg
                              }
                            </td>
                            <td class="py-3 text-right font-mono font-bold text-stone-300">
                              {{ (item.weight * item.quantity) | number:'1.0-2' }} kg
                            </td>
                            <td class="py-3 text-center">
                              <input 
                                type="checkbox" 
                                [checked]="item.isEquipped" 
                                (change)="toggleEquip(idx)" 
                                [disabled]="!isEditing()"
                                class="w-4 h-4 accent-amber-500 rounded border-stone-700 bg-stone-900"
                              >
                            </td>
                            @if (isEditing()) {
                              <td class="py-3 text-center">
                                <button (click)="removeItem(idx)" class="text-red-500 hover:text-red-400 p-1">
                                  <mat-icon style="font-size: 16px; width: 16px; height: 16px;">delete</mat-icon>
                                </button>
                              </td>
                            }
                          </tr>
                        }
                      </tbody>
                    </table>
                  </div>
                }
                
                @if (isEditing()) {
                  <button 
                    (click)="addNewItem()" 
                    class="py-2 px-4 bg-stone-900 hover:bg-stone-850 text-amber-500 font-semibold border border-stone-800 rounded-lg text-xs flex items-center justify-center gap-1"
                  >
                    <mat-icon style="font-size: 16px; width: 16px; height: 16px;">add</mat-icon>
                    Adicionar Novo Item
                  </button>
                }
              </div>
            }
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .custom-scrollbar::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: #1c1917;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: #44403c;
      border-radius: 3px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: #78716c;
    }
  `]
})
export class FullscreenSheetComponent {
  combat = inject(CombatService);
  mathService = inject(DndMathService);
  auth = inject(AuthService);

  activeTab = signal<'status' | 'attributes' | 'actions' | 'inventory'>('status');
  isEditing = signal<boolean>(false);
  editableSheet: any = {};

  token = computed(() => {
    const id = this.combat.fullscreenSheetTokenId();
    if (!id) return null;
    return this.combat.tokens().find(t => t.id === id) || null;
  });

  sheet = computed(() => this.token()?.sheet || null);

  canEdit = computed(() => {
    const t = this.token();
    if (!t) return false;
    const isPlayMode = this.combat.isPlayMode();
    const user = this.auth.currentUser();
    return (user?.role === 'GM' && !isPlayMode) || t.controlledBy === user?.id;
  });

  hpPercent = computed(() => {
    const s = this.sheet();
    if (!s || s.maxHp <= 0) return 0;
    return Math.min((s.hp / s.maxHp) * 100, 100);
  });

  weapons = computed(() => {
    const t = this.token();
    if (!t || !t.abilities) return [];
    return t.abilities.filter(a => a.category === 'weapon' || a.category === 'item_effect');
  });

  spells = computed(() => {
    const t = this.token();
    if (!t || !t.abilities) return [];
    return t.abilities.filter(a => a.category === 'spell');
  });

  inventoryItems = computed(() => {
    const s = this.sheet();
    if (!s) return [];
    return s.inventory || [];
  });

  totalWeight = computed(() => {
    const items = this.inventoryItems();
    return items.reduce((sum, item) => sum + (item.weight || 0) * (item.quantity || 1), 0);
  });

  carryCapacity = computed(() => {
    const s = this.sheet();
    if (!s) return 150;
    return (s.str || 10) * 7.5;
  });

  attributes = [
    { key: 'str', label: 'Força' },
    { key: 'dex', label: 'Destreza' },
    { key: 'con', label: 'Constituição' },
    { key: 'int', label: 'Inteligência' },
    { key: 'wis', label: 'Sabedoria' },
    { key: 'cha', label: 'Carisma' }
  ] as const;

  dndSkills: { name: string; label: string; attr: 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha' }[] = [
    { name: 'acrobatics', label: 'Acrobacia', attr: 'dex' },
    { name: 'animal_handling', label: 'Adestrar Animais', attr: 'wis' },
    { name: 'arcana', label: 'Arcanismo', attr: 'int' },
    { name: 'athletics', label: 'Atletismo', attr: 'str' },
    { name: 'deception', label: 'Enganação', attr: 'cha' },
    { name: 'history', label: 'História', attr: 'int' },
    { name: 'insight', label: 'Intuição', attr: 'wis' },
    { name: 'intimidation', label: 'Intimidação', attr: 'cha' },
    { name: 'investigation', label: 'Investigação', attr: 'int' },
    { name: 'medicine', label: 'Medicina', attr: 'wis' },
    { name: 'nature', label: 'Natureza', attr: 'int' },
    { name: 'perception', label: 'Percepção', attr: 'wis' },
    { name: 'performance', label: 'Performance', attr: 'cha' },
    { name: 'persuasion', label: 'Persuasão', attr: 'cha' },
    { name: 'religion', label: 'Religião', attr: 'int' },
    { name: 'sleight_of_hand', label: 'Prestidigitação', attr: 'dex' },
    { name: 'stealth', label: 'Furtividade', attr: 'dex' },
    { name: 'survival', label: 'Sobrevivência', attr: 'wis' }
  ];

  mathMin = Math.min;

  currentExhaustion() {
    return this.sheet()?.exhaustion || 0;
  }

  currentRations() {
    return this.sheet()?.rations !== undefined ? this.sheet()?.rations : 4;
  }

  currentWater() {
    return this.sheet()?.water !== undefined ? this.sheet()?.water : 4;
  }

  getExhaustionEffect(lvl: number): string {
    switch (lvl) {
      case 1: return 'Desvantagem em testes de habilidade';
      case 2: return 'Metade do deslocamento';
      case 3: return 'Desvantagem nas jogadas de ataque e salvaguardas';
      case 4: return 'Metade dos pontos de vida máximos';
      case 5: return 'Deslocamento reduzido a 0';
      case 6: return 'Morte';
      default: return '';
    }
  }

  setExhaustion(lvl: number) {
    const t = this.token();
    if (!t || !this.canEdit()) return;
    const newLvl = this.currentExhaustion() === lvl ? lvl - 1 : lvl;
    const clamped = Math.max(0, Math.min(6, newLvl));
    this.updateSheet({ exhaustion: clamped });
  }

  changeRations(amount: number) {
    const t = this.token();
    if (!t || !this.canEdit()) return;
    const current = this.currentRations() || 0;
    this.updateSheet({ rations: Math.max(0, current + amount) });
  }

  changeWater(amount: number) {
    const t = this.token();
    if (!t || !this.canEdit()) return;
    const current = this.currentWater() || 0;
    this.updateSheet({ water: Math.max(0, current + amount) });
  }

  longRest() {
    const t = this.token();
    if (!t || !this.canEdit()) return;
    const s = this.sheet();
    if (!s) return;
    const exhaustion = Math.max(0, this.currentExhaustion() - 1);
    this.combat.updateToken(t.id, {
      hp: s.maxHp,
      spellUses: s.maxSpellUses || 0,
      sheet: {
        ...s,
        hp: s.maxHp,
        spellUses: s.maxSpellUses || 0,
        exhaustion: exhaustion
      }
    });
  }

  modifierOf(val: number): number {
    return this.mathService.calculateModifier(val);
  }

  isProficientInSave(attrKey: string): boolean {
    const s = this.sheet();
    return !!(s?.savingThrowProficiencies?.includes(attrKey));
  }

  getSaveModifier(attrKey: 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha'): number {
    const s = this.sheet();
    if (!s) return 0;
    const baseMod = this.modifierOf((s as any)[attrKey] || 10);
    const prof = this.isProficientInSave(attrKey) ? (s.proficiencyBonus || 2) : 0;
    return baseMod + prof;
  }

  isProficientInSkill(skillName: string): boolean {
    const s = this.sheet();
    return !!(s?.skillProficiencies?.includes(skillName));
  }

  getSkillModifier(skillName: string, attrKey: 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha'): number {
    const s = this.sheet();
    if (!s) return 0;
    const baseMod = this.modifierOf((s as any)[attrKey] || 10);
    const prof = this.isProficientInSkill(skillName) ? (s.proficiencyBonus || 2) : 0;
    const exp = s.expertiseSkills?.includes(skillName) ? (s.proficiencyBonus || 2) : 0;
    return baseMod + prof + exp;
  }

  modifySpellUses(amount: number) {
    const t = this.token();
    const s = this.sheet();
    if (!t || !s) return;
    const current = s.spellUses || 0;
    const max = s.maxSpellUses || 0;
    const newVal = Math.max(0, Math.min(max, current + amount));
    
    this.combat.updateToken(t.id, {
      spellUses: newVal,
      sheet: { ...s, spellUses: newVal }
    });
  }

  toggleEquip(idx: number) {
    const s = this.sheet();
    if (!s || !this.canEdit()) return;
    const inv = [...(s.inventory || [])];
    if (inv[idx]) {
      inv[idx] = { ...inv[idx], isEquipped: !inv[idx].isEquipped };
      this.updateSheet({ inventory: inv });
    }
  }

  removeItem(idx: number) {
    const s = this.sheet();
    if (!s) return;
    const inv = (s.inventory || []).filter((_, i) => i !== idx);
    this.updateSheet({ inventory: inv });
  }

  addNewItem() {
    const s = this.sheet();
    if (!s) return;
    const inv = [...(s.inventory || []), { name: 'Novo Item', quantity: 1, weight: 0.5, isEquipped: false }];
    this.updateSheet({ inventory: inv });
  }

  toggleEdit() {
    if (this.isEditing()) {
      const t = this.token();
      if (t) {
        const levelUpResult = this.combat.checkLevelUp(this.editableSheet, t.name);
        const finalSheet = levelUpResult.sheet;
        this.combat.updateToken(t.id, {
          sheet: finalSheet,
          hp: finalSheet.hp,
          maxHp: finalSheet.maxHp,
          spellUses: finalSheet.spellUses,
          maxSpellUses: finalSheet.maxSpellUses
        });
      }
      this.isEditing.set(false);
    } else {
      this.editableSheet = JSON.parse(JSON.stringify(this.sheet() || {}));
      this.isEditing.set(true);
    }
  }

  updateSheet(partial: Partial<CharacterSheet>) {
    const t = this.token();
    const s = this.sheet();
    if (t && s) {
      this.combat.updateToken(t.id, {
        sheet: { ...s, ...partial }
      });
    }
  }

  triggerAbilityAction(ability: Ability) {
    const t = this.token();
    if (!t) return;
    this.combat.startPreview(ability, t);
    this.close();
  }

  triggerAbilityDamage(ability: Ability) {
    const t = this.token();
    if (!t) return;
    this.combat.startPreview(ability, t);
    this.close();
  }

  close() {
    this.combat.fullscreenSheetTokenId.set(null);
  }
}
