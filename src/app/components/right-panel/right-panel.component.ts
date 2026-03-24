import { Component, ChangeDetectionStrategy, inject, signal, computed, effect, untracked } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { DndMathService } from '../../services/dnd-math.service';
import { CombatService, AVAILABLE_CONDITIONS } from '../../services/combat.service';
import { AuthService } from '../../services/auth.service';
import { Ability, AreaShape } from '../../models/ability';
import { TokenCondition } from '../../models/token';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { ActionMenuComponent } from '../action-menu/action-menu.component';

@Component({
  selector: 'app-right-panel',
  standalone: true,
  imports: [CommonModule, MatIconModule, ReactiveFormsModule, ActionMenuComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-80 h-full bg-stone-900 border-l border-stone-800 flex flex-col text-stone-300 relative">
      <!-- Notifications Overlay -->
      <div class="absolute top-12 left-0 right-0 z-50 pointer-events-none px-4 space-y-2">
        @for (notif of combat.notifications(); track notif.id) {
          <div class="pointer-events-auto bg-stone-800 border-l-4 p-3 rounded shadow-xl flex items-start gap-3 animate-in slide-in-from-right duration-300"
               [class.border-amber-500]="notif.type === 'xp'"
               [class.border-green-500]="notif.type === 'level-up'"
               [class.border-blue-500]="notif.type === 'info'">
            <mat-icon class="text-sm" [class.text-amber-500]="notif.type === 'xp'" [class.text-green-500]="notif.type === 'level-up'" [class.text-blue-500]="notif.type === 'info'">
              {{ notif.type === 'xp' ? 'trending_up' : notif.type === 'level-up' ? 'military_tech' : 'info' }}
            </mat-icon>
            <div class="flex-1">
              <p class="text-xs font-bold" [class.text-amber-500]="notif.type === 'xp'" [class.text-green-500]="notif.type === 'level-up'">
                {{ notif.type === 'xp' ? 'XP Recebido' : notif.type === 'level-up' ? 'Subiu de Nível!' : 'Informação' }}
              </p>
              <p class="text-[10px] text-stone-300">{{ notif.message }}</p>
            </div>
            <button class="text-stone-500 hover:text-stone-300" (click)="combat.removeNotification(notif.id)">
              <mat-icon style="font-size: 14px; width: 14px; height: 14px;">close</mat-icon>
            </button>
          </div>
        }
      </div>

      <!-- Tabs -->
      <div class="flex border-b border-stone-800 text-xs font-mono">
        <button class="flex-1 py-3 transition-colors" [class.text-amber-500]="combat.rightPanelTab() === 'sheet'" [class.border-b-2]="combat.rightPanelTab() === 'sheet'" [class.border-amber-500]="combat.rightPanelTab() === 'sheet'" [class.bg-stone-800]="combat.rightPanelTab() === 'sheet'" (click)="combat.rightPanelTab.set('sheet')">Ficha</button>
        <button class="flex-1 py-3 transition-colors" [class.text-amber-500]="combat.rightPanelTab() === 'inventory'" [class.border-b-2]="combat.rightPanelTab() === 'inventory'" [class.border-amber-500]="combat.rightPanelTab() === 'inventory'" [class.bg-stone-800]="combat.rightPanelTab() === 'inventory'" (click)="combat.rightPanelTab.set('inventory')">Inventário</button>
        @if (auth.currentUser()?.role === 'GM') {
          <button class="flex-1 py-3 transition-colors" [class.text-amber-500]="combat.rightPanelTab() === 'actions'" [class.border-b-2]="combat.rightPanelTab() === 'actions'" [class.border-amber-500]="combat.rightPanelTab() === 'actions'" [class.bg-stone-800]="combat.rightPanelTab() === 'actions'" (click)="combat.rightPanelTab.set('actions')">Ações</button>
        }
      </div>
      
      <!-- Inventory & Spells Tab -->
      @if (combat.rightPanelTab() === 'inventory') {
        <div class="flex-1 overflow-auto p-4 space-y-4">
          @if (combat.previewAbility()) {
            <div class="bg-amber-900/30 border border-amber-500/50 rounded p-3 text-sm text-amber-500 flex items-center gap-2 mb-4">
              <mat-icon>info</mat-icon>
              <span>Modo de visualização ativo. Clique no mapa para confirmar o ataque.</span>
              <button class="ml-auto bg-stone-800 hover:bg-stone-700 text-stone-300 px-2 py-1 rounded text-xs" (click)="combat.cancelPreview()">Cancelar</button>
            </div>
          }

          @if (!selectedToken()) {
            <div class="text-sm text-stone-500 italic p-4 text-center border border-dashed border-stone-700 rounded">
              Selecione um token no mapa para ver seus equipamentos e magias.
            </div>
          } @else {
            <!-- Wallet (Carteira) -->
            <div class="bg-stone-800 rounded border border-stone-700 p-3 shadow-md">
              <div class="flex justify-between items-center mb-2">
                <h4 class="text-xs font-bold text-amber-500 uppercase flex items-center gap-1">
                  <mat-icon style="font-size: 14px; width: 14px; height: 14px;">account_balance_wallet</mat-icon>
                  Carteira
                </h4>
                @if (auth.currentUser()?.role === 'GM' || selectedToken()?.controlledBy === auth.currentUser()?.id) {
                  <button class="text-stone-500 hover:text-amber-500 transition-colors" (click)="editSheet()" title="Editar Carteira">
                    <mat-icon style="font-size: 16px; width: 16px; height: 16px;">edit</mat-icon>
                  </button>
                }
              </div>
              <div class="grid grid-cols-5 gap-1 text-center">
                <div class="bg-stone-900 border border-stone-700 rounded p-1">
                  <div class="text-[10px] text-stone-500 font-bold">PC</div>
                  <div class="font-bold text-sm text-amber-700">{{ selectedToken()?.sheet?.cp || 0 }}</div>
                </div>
                <div class="bg-stone-900 border border-stone-700 rounded p-1">
                  <div class="text-[10px] text-stone-500 font-bold">PP</div>
                  <div class="font-bold text-sm text-stone-400">{{ selectedToken()?.sheet?.sp || 0 }}</div>
                </div>
                <div class="bg-stone-900 border border-stone-700 rounded p-1">
                  <div class="text-[10px] text-stone-500 font-bold">PE</div>
                  <div class="font-bold text-sm text-blue-300">{{ selectedToken()?.sheet?.ep || 0 }}</div>
                </div>
                <div class="bg-stone-900 border border-stone-700 rounded p-1">
                  <div class="text-[10px] text-stone-500 font-bold">PO</div>
                  <div class="font-bold text-sm text-yellow-500">{{ selectedToken()?.sheet?.gp || 0 }}</div>
                </div>
                <div class="bg-stone-900 border border-stone-700 rounded p-1">
                  <div class="text-[10px] text-stone-500 font-bold">PL</div>
                  <div class="font-bold text-sm text-slate-300">{{ selectedToken()?.sheet?.pp || 0 }}</div>
                </div>
              </div>
            </div>

            <!-- Inventory Section -->
            <div class="bg-stone-800 rounded border border-stone-700 p-3 shadow-md">
              <div class="flex justify-between items-center mb-2">
                <h4 class="text-xs font-bold text-amber-500 uppercase flex items-center gap-1">
                  <mat-icon style="font-size: 14px; width: 14px; height: 14px;">inventory_2</mat-icon>
                  Mochila & Itens
                </h4>
                <div class="flex gap-2">
                  @if (isEditingInventory()) {
                    <button class="text-stone-500 hover:text-green-500 transition-colors" (click)="saveInventory()" title="Salvar Inventário">
                      <mat-icon style="font-size: 16px; width: 16px; height: 16px;">check</mat-icon>
                    </button>
                    <button class="text-stone-500 hover:text-red-500 transition-colors" (click)="isEditingInventory.set(false)" title="Cancelar">
                      <mat-icon style="font-size: 16px; width: 16px; height: 16px;">close</mat-icon>
                    </button>
                  } @else if (auth.currentUser()?.role === 'GM' || selectedToken()?.controlledBy === auth.currentUser()?.id) {
                    <button class="text-stone-500 hover:text-amber-500 transition-colors" (click)="isEditingInventory.set(true)" title="Editar Inventário">
                      <mat-icon style="font-size: 16px; width: 16px; height: 16px;">edit</mat-icon>
                    </button>
                  }
                </div>
              </div>
              @if (isEditingInventory()) {
                <textarea [formControl]="inventoryForm" rows="5" class="w-full bg-stone-900 border border-stone-700 rounded px-2 py-1 text-xs focus:outline-none focus:border-amber-500 resize-none text-stone-300"></textarea>
              } @else {
                <div class="bg-stone-900 p-2 rounded border border-stone-700 min-h-[60px] text-xs text-stone-300 whitespace-pre-wrap flex items-start gap-2">
                  <mat-icon class="text-stone-500 mt-0.5" style="font-size: 12px; width: 12px; height: 12px;">description</mat-icon>
                  {{ selectedToken()?.sheet?.backpack || 'Inventário vazio.' }}
                </div>
              }
            </div>

            <!-- GM: Add Ability Form -->
            @if (auth.currentUser()?.role === 'GM' || selectedToken()?.controlledBy === auth.currentUser()?.id) {
              <div class="bg-stone-800 rounded border border-stone-700 p-3 mb-4 space-y-3 shadow-md mt-4">
                <h4 class="text-xs font-bold text-amber-500 uppercase">Adicionar Arma, Magia ou Habilidade</h4>
                <form [formGroup]="abilityForm" (ngSubmit)="addAbility()" class="space-y-2">
                  <div class="grid grid-cols-2 gap-2">
                    <input formControlName="name" placeholder="Nome" class="w-full bg-stone-900 border border-stone-700 rounded px-2 py-1 text-xs focus:outline-none focus:border-amber-500">
                    <select formControlName="category" class="bg-stone-900 border border-stone-700 rounded px-2 py-1 text-xs focus:outline-none focus:border-amber-500">
                      <option value="weapon">Arma</option>
                      <option value="spell">Magia</option>
                      <option value="feature">Habilidade</option>
                    </select>
                  </div>
                  
                  <div class="grid grid-cols-2 gap-2">
                    <select formControlName="type" class="bg-stone-900 border border-stone-700 rounded px-2 py-1 text-xs focus:outline-none focus:border-amber-500">
                      <option value="action">Ação</option>
                      <option value="bonus_action">Ação Bônus</option>
                      <option value="reaction">Reação</option>
                      <option value="passive">Passiva</option>
                    </select>
                    <select formControlName="areaShape" class="bg-stone-900 border border-stone-700 rounded px-2 py-1 text-xs focus:outline-none focus:border-amber-500">
                      <option value="none">Sem Área</option>
                      <option value="circle">Círculo</option>
                      <option value="cone">Cone</option>
                      <option value="line">Linha</option>
                      <option value="rectangle">Retângulo</option>
                    </select>
                  </div>

                  <div class="flex items-center gap-4 mb-2 px-1">
                    <label class="flex items-center gap-1 text-[10px] text-stone-400 cursor-pointer">
                      <input type="checkbox" [checked]="showDamageField()" (change)="showDamageField.set(!showDamageField())" class="accent-amber-500">
                      Dano
                    </label>
                    <label class="flex items-center gap-1 text-[10px] text-stone-400 cursor-pointer">
                      <input type="checkbox" [checked]="showHealingField()" (change)="showHealingField.set(!showHealingField())" class="accent-green-500">
                      Cura
                    </label>
                  </div>

                  <div class="grid grid-cols-2 gap-2">
                    <div class="flex flex-col gap-1">
                      <label for="abilityRange" class="text-[10px] text-stone-500 uppercase">Alcance (m)</label>
                      <input id="abilityRange" type="number" formControlName="range" class="bg-stone-900 border border-stone-700 rounded px-2 py-1 text-xs focus:outline-none focus:border-amber-500">
                    </div>
                    @if (showDamageField()) {
                      <div class="flex flex-col gap-1">
                        <label for="abilityDamage" class="text-[10px] text-stone-500 uppercase">Dano</label>
                        <input id="abilityDamage" formControlName="damage" placeholder="ex: 8d6" class="bg-stone-900 border border-stone-700 rounded px-2 py-1 text-xs focus:outline-none focus:border-amber-500">
                      </div>
                    }
                  </div>

                  <div class="grid grid-cols-2 gap-2">
                    @if (showHealingField()) {
                      <div class="flex flex-col gap-1">
                        <label for="abilityHealing" class="text-[10px] text-stone-500 uppercase">Recuperação de PV</label>
                        <input id="abilityHealing" formControlName="healing" placeholder="ex: 2d8+4" class="bg-stone-900 border border-stone-700 rounded px-2 py-1 text-xs focus:outline-none focus:border-amber-500">
                      </div>
                    }
                    <div class="flex flex-col gap-1">
                      <label for="attackBonus" class="text-[10px] text-stone-500 uppercase">Bônus de Ataque</label>
                      <input id="attackBonus" type="number" formControlName="attackBonus" class="bg-stone-900 border border-stone-700 rounded px-2 py-1 text-xs focus:outline-none focus:border-amber-500">
                    </div>
                  </div>

                  @if (abilityForm.get('category')?.value === 'spell') {
                    <div class="grid grid-cols-2 gap-2">
                      <div class="flex flex-col gap-1">
                        <label for="spellLevel" class="text-[10px] text-stone-500 uppercase">Nível da Magia</label>
                        <input id="spellLevel" type="number" formControlName="spellLevel" class="bg-stone-900 border border-stone-700 rounded px-2 py-1 text-xs focus:outline-none focus:border-amber-500">
                      </div>
                      <div class="flex flex-col gap-1">
                        <label for="manaCost" class="text-[10px] text-stone-500 uppercase">Custo de Mana</label>
                        <input id="manaCost" type="number" formControlName="manaCost" class="bg-stone-900 border border-stone-700 rounded px-2 py-1 text-xs focus:outline-none focus:border-amber-500">
                      </div>
                    </div>
                    <div class="grid grid-cols-2 gap-2">
                      <div class="flex flex-col gap-1">
                        <label for="uses" class="text-[10px] text-stone-500 uppercase">Usos Atuais</label>
                        <input id="uses" type="number" formControlName="uses" class="bg-stone-900 border border-stone-700 rounded px-2 py-1 text-xs focus:outline-none focus:border-amber-500">
                      </div>
                      <div class="flex flex-col gap-1">
                        <label for="maxUses" class="text-[10px] text-stone-500 uppercase">Máx Usos</label>
                        <input id="maxUses" type="number" formControlName="maxUses" class="bg-stone-900 border border-stone-700 rounded px-2 py-1 text-xs focus:outline-none focus:border-amber-500">
                      </div>
                    </div>
                  }

                  <textarea formControlName="description" placeholder="Descrição/Detalhes" rows="2" class="w-full bg-stone-900 border border-stone-700 rounded px-2 py-1 text-xs focus:outline-none focus:border-amber-500"></textarea>

                  <button type="submit" [disabled]="abilityForm.invalid" class="w-full py-1 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 disabled:hover:bg-amber-600 text-stone-900 font-bold rounded text-xs transition-colors">
                    Adicionar
                  </button>
                </form>
              </div>
            }

            <!-- Abilities Section with Sub-tabs -->
            <div class="mt-6 border border-stone-700 rounded overflow-hidden bg-stone-900/30">
              <div class="flex border-b border-stone-700 bg-stone-900/50">
                    <button class="flex-1 py-2 text-[10px] font-bold uppercase transition-colors flex items-center justify-center gap-1"
                            [class.text-amber-500]="inventorySubTab() === 'weapons'"
                            [class.bg-stone-800]="inventorySubTab() === 'weapons'"
                            (click)="inventorySubTab.set('weapons')">
                      <mat-icon style="font-size: 14px; width: 14px; height: 14px;">shield</mat-icon>
                      Armas
                    </button>
                    <button class="flex-1 py-2 text-[10px] font-bold uppercase transition-colors border-l border-stone-700 flex items-center justify-center gap-1"
                            [class.text-amber-500]="inventorySubTab() === 'spells'"
                            [class.bg-stone-800]="inventorySubTab() === 'spells'"
                            (click)="inventorySubTab.set('spells')">
                      <mat-icon style="font-size: 14px; width: 14px; height: 14px;">auto_fix_high</mat-icon>
                      Magias
                    </button>
                    <button class="flex-1 py-2 text-[10px] font-bold uppercase transition-colors border-l border-stone-700 flex items-center justify-center gap-1"
                            [class.text-amber-500]="inventorySubTab() === 'features'"
                            [class.bg-stone-800]="inventorySubTab() === 'features'"
                            (click)="inventorySubTab.set('features')">
                      <mat-icon style="font-size: 14px; width: 14px; height: 14px;">star</mat-icon>
                      Habilidades
                    </button>
              </div>

              <div class="p-3 space-y-4">
                <!-- Weapons List -->
                @if (inventorySubTab() === 'weapons') {
                  @if (weapons().length > 0) {
                    <div class="space-y-3">
                      @for (ability of weapons(); track ability.id) {
                        <div class="bg-stone-800 rounded border border-stone-700 overflow-hidden shadow-md">
                          <div class="p-2 border-b border-stone-700 flex justify-between items-center bg-stone-800/50">
                            <div class="flex items-center gap-2">
                              <span class="font-bold text-amber-500 text-sm">{{ ability.name }}</span>
                              @if (auth.currentUser()?.role === 'GM' || selectedToken()?.controlledBy === auth.currentUser()?.id) {
                                <button class="text-stone-500 hover:text-red-500 transition-colors" (click)="removeAbility(ability.id)">
                                  <mat-icon style="font-size: 14px; width: 14px; height: 14px;">delete</mat-icon>
                                </button>
                              }
                            </div>
                            <span class="text-[10px] font-mono text-stone-400 uppercase bg-stone-900 px-2 py-1 rounded">{{ ability.type }}</span>
                          </div>
                          <div class="p-2 text-xs space-y-2">
                            <div class="flex gap-2 font-mono">
                              <span class="bg-stone-900 px-2 py-1 rounded border border-stone-700">Atk: {{ (ability.attackBonus ?? 0) >= 0 ? '+' : '' }}{{ ability.attackBonus ?? 0 }}</span>
                              @if (ability.damage) {
                                <span class="bg-stone-900 px-2 py-1 rounded border border-stone-700">Dano: {{ ability.damage }}</span>
                              }
                              @if (ability.healing) {
                                <span class="bg-stone-900 px-2 py-1 rounded border border-green-700 text-green-500">Recup. PV: {{ ability.healing }}</span>
                              }
                              <span class="bg-stone-900 px-2 py-1 rounded border border-stone-700">Alcance: {{ ability.range }}m</span>
                              @if (ability.manaCost) {
                                <span class="bg-stone-900 px-2 py-1 rounded border border-blue-700 text-blue-400">Custo: {{ ability.manaCost }} MP</span>
                              }
                            </div>
                            @if (ability.description) {
                              <p class="text-stone-400">{{ ability.description }}</p>
                            }
                            <button class="w-full py-1 bg-stone-700 hover:bg-amber-600 hover:text-stone-900 text-stone-300 font-bold rounded transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:bg-stone-700 disabled:hover:text-stone-300 disabled:cursor-not-allowed"
                                    [disabled]="!selectedToken()?.sheet"
                                    (click)="useAbility(ability)">
                              <mat-icon class="text-sm">my_location</mat-icon> Usar Arma
                            </button>
                          </div>
                        </div>
                      }
                    </div>
                  } @else {
                    <p class="text-[10px] text-stone-500 italic text-center py-4">Nenhuma arma no inventário.</p>
                  }
                }

                <!-- Spells List -->
                @if (inventorySubTab() === 'spells') {
                  @if (spells().length > 0) {
                    <div class="space-y-3">
                      @for (ability of spells(); track ability.id) {
                        <div class="bg-stone-800 rounded border border-stone-700 overflow-hidden shadow-md">
                          <div class="p-2 border-b border-stone-700 flex justify-between items-center bg-stone-800/50">
                            <div class="flex items-center gap-2">
                              <span class="font-bold text-amber-500 text-sm">{{ ability.name }}</span>
                              <span class="text-[10px] bg-blue-900/50 text-blue-300 px-1 rounded border border-blue-700/50">Nível {{ ability.spellLevel || 0 }}</span>
                              @if (auth.currentUser()?.role === 'GM' || selectedToken()?.controlledBy === auth.currentUser()?.id) {
                                <button class="text-stone-500 hover:text-red-500 transition-colors" (click)="removeAbility(ability.id)">
                                  <mat-icon style="font-size: 14px; width: 14px; height: 14px;">delete</mat-icon>
                                </button>
                              }
                            </div>
                            <span class="text-[10px] font-mono text-stone-400 uppercase bg-stone-900 px-2 py-1 rounded">{{ ability.type }}</span>
                          </div>
                          <div class="p-2 text-xs space-y-2">
                            <div class="flex gap-2 font-mono flex-wrap">
                              <span class="bg-stone-900 px-2 py-1 rounded border border-stone-700">Atk: {{ (ability.attackBonus ?? 0) >= 0 ? '+' : '' }}{{ ability.attackBonus ?? 0 }}</span>
                              @if (ability.damage) {
                                <span class="bg-stone-900 px-2 py-1 rounded border border-stone-700">Dano: {{ ability.damage }}</span>
                              }
                              @if (ability.healing) {
                                <span class="bg-stone-900 px-2 py-1 rounded border border-green-700 text-green-500">Recup. PV: {{ ability.healing }}</span>
                              }
                              <span class="bg-stone-900 px-2 py-1 rounded border border-stone-700">Alcance: {{ ability.range }}m</span>
                              @if (ability.maxUses) {
                                <div class="w-full h-1 bg-stone-900 rounded-full overflow-hidden border border-stone-700 mt-1">
                                  <div class="h-full bg-blue-500 transition-all duration-300" [style.width.%]="((ability.uses || 0) / ability.maxUses) * 100"></div>
                                </div>
                                <span class="bg-stone-900 px-2 py-1 rounded border border-stone-700 text-amber-500">Usos: {{ ability.uses || 0 }}/{{ ability.maxUses }}</span>
                              }
                            </div>
                            @if (ability.description) {
                              <p class="text-stone-400">{{ ability.description }}</p>
                            }
                            <button class="w-full py-1 bg-stone-700 hover:bg-amber-600 hover:text-stone-900 text-stone-300 font-bold rounded transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:bg-stone-700 disabled:hover:text-stone-300 disabled:cursor-not-allowed"
                                    [disabled]="!selectedToken()?.sheet"
                                    (click)="useAbility(ability)">
                              <mat-icon class="text-sm">my_location</mat-icon> Lançar Magia
                            </button>
                          </div>
                        </div>
                      }
                    </div>
                  } @else {
                    <p class="text-[10px] text-stone-500 italic text-center py-4">Nenhuma magia no inventário.</p>
                  }
                }

                <!-- Features List -->
                @if (inventorySubTab() === 'features') {
                  @if (features().length > 0) {
                    <div class="space-y-3">
                      @for (ability of features(); track ability.id) {
                        <div class="bg-stone-800 rounded border border-stone-700 overflow-hidden shadow-md">
                          <div class="p-2 border-b border-stone-700 flex justify-between items-center bg-stone-800/50">
                            <div class="flex items-center gap-2">
                              <span class="font-bold text-amber-500 text-sm">{{ ability.name }}</span>
                              @if (auth.currentUser()?.role === 'GM' || selectedToken()?.controlledBy === auth.currentUser()?.id) {
                                <button class="text-stone-500 hover:text-red-500 transition-colors" (click)="removeAbility(ability.id)">
                                  <mat-icon style="font-size: 14px; width: 14px; height: 14px;">delete</mat-icon>
                                </button>
                              }
                            </div>
                            <span class="text-[10px] font-mono text-stone-400 uppercase bg-stone-900 px-2 py-1 rounded">{{ ability.type }}</span>
                          </div>
                          <div class="p-2 text-xs space-y-2">
                            <div class="flex gap-2 font-mono flex-wrap mb-2">
                              @if (ability.healing) {
                                <span class="bg-stone-900 px-2 py-1 rounded border border-green-700 text-green-500">Recup. PV: {{ ability.healing }}</span>
                              }
                              @if (ability.manaCost) {
                                <span class="bg-stone-900 px-2 py-1 rounded border border-blue-700 text-blue-400">Custo: {{ ability.manaCost }} MP</span>
                              }
                            </div>
                            @if (ability.description) {
                              <p class="text-stone-400">{{ ability.description }}</p>
                            }
                            @if (ability.type !== 'passive') {
                              <button class="w-full py-1 bg-stone-700 hover:bg-amber-600 hover:text-stone-900 text-stone-300 font-bold rounded transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:bg-stone-700 disabled:hover:text-stone-300 disabled:cursor-not-allowed"
                                      [disabled]="!selectedToken()?.sheet"
                                      (click)="useAbility(ability)">
                                <mat-icon class="text-sm">my_location</mat-icon> Usar Habilidade
                              </button>
                            }
                          </div>
                        </div>
                      }
                    </div>
                  } @else {
                    <p class="text-[10px] text-stone-500 italic text-center py-4">Nenhuma habilidade no inventário.</p>
                  }
                }
              </div>
            </div>
          }
        </div>
      }
      <!-- Sheet Tab -->
      @if (combat.rightPanelTab() === 'sheet') {
        <div class="flex-1 overflow-auto p-4 space-y-4">
          @if (!selectedToken()) {
            <div class="text-sm text-stone-500 italic p-4 text-center border border-dashed border-stone-700 rounded">
              Selecione um token no mapa para ver sua ficha de personagem.
            </div>
          } @else {
            @if (isEditingSheet()) {
              <div class="bg-stone-800 rounded border border-stone-700 p-3 space-y-4 shadow-md text-xs">
                <div class="flex justify-between items-center border-b border-stone-700 pb-2">
                  <h3 class="font-bold text-amber-500 text-lg">Editar Ficha</h3>
                  <div class="flex gap-2">
                    @if (selectedToken()?.sheet) {
                      <button class="bg-stone-700 hover:bg-stone-600 text-stone-300 px-2 py-1 rounded text-xs transition-colors" (click)="cancelEditSheet()">Cancelar</button>
                    }
                    <button class="bg-amber-600 hover:bg-amber-500 text-stone-900 font-bold px-2 py-1 rounded text-xs transition-colors" (click)="saveSheet()">Salvar</button>
                  </div>
                </div>
                <form [formGroup]="sheetForm" class="space-y-3">
                  <div class="grid grid-cols-2 gap-2">
                    <div class="flex flex-col gap-1">
                      <label for="hp" class="text-[10px] text-stone-500 uppercase">PV Atual</label>
                      <input id="hp" type="number" formControlName="hp" class="bg-stone-900 border border-stone-700 rounded px-2 py-1 text-xs focus:outline-none focus:border-amber-500">
                    </div>
                    <div class="flex flex-col gap-1">
                      <label for="maxHp" class="text-[10px] text-stone-500 uppercase">PV Máximo</label>
                      <input id="maxHp" type="number" formControlName="maxHp" class="bg-stone-900 border border-stone-700 rounded px-2 py-1 text-xs focus:outline-none focus:border-amber-500">
                    </div>
                  </div>

                  <div class="grid grid-cols-2 gap-2">
                    <div class="flex flex-col gap-1">
                      <label for="mp" class="text-[10px] text-stone-500 uppercase">Mana Atual</label>
                      <input id="mp" type="number" formControlName="mp" class="bg-stone-900 border border-stone-700 rounded px-2 py-1 text-xs focus:outline-none focus:border-amber-500">
                    </div>
                    <div class="flex flex-col gap-1">
                      <label for="maxMp" class="text-[10px] text-stone-500 uppercase">Mana Máximo</label>
                      <input id="maxMp" type="number" formControlName="maxMp" class="bg-stone-900 border border-stone-700 rounded px-2 py-1 text-xs focus:outline-none focus:border-amber-500">
                    </div>
                  </div>

                  <div class="grid grid-cols-2 gap-2">
                    <div class="flex flex-col gap-1">
                      <label for="class" class="text-[10px] text-stone-500 uppercase">Classe</label>
                      <input id="class" formControlName="class" class="bg-stone-900 border border-stone-700 rounded px-2 py-1 text-xs focus:outline-none focus:border-amber-500">
                    </div>
                    <div class="flex flex-col gap-1">
                      <label for="level" class="text-[10px] text-stone-500 uppercase">Nível</label>
                      <input id="level" type="number" formControlName="level" class="bg-stone-900 border border-stone-700 rounded px-2 py-1 text-xs focus:outline-none focus:border-amber-500">
                    </div>
                    <div class="flex flex-col gap-1">
                      <label for="background" class="text-[10px] text-stone-500 uppercase">Antecedente</label>
                      <input id="background" formControlName="background" class="bg-stone-900 border border-stone-700 rounded px-2 py-1 text-xs focus:outline-none focus:border-amber-500">
                    </div>
                    <div class="flex flex-col gap-1">
                      <label for="playerName" class="text-[10px] text-stone-500 uppercase">Nome do Jogador</label>
                      <input id="playerName" formControlName="playerName" class="bg-stone-900 border border-stone-700 rounded px-2 py-1 text-xs focus:outline-none focus:border-amber-500">
                    </div>
                    <div class="flex flex-col gap-1">
                      <label for="race" class="text-[10px] text-stone-500 uppercase">Raça</label>
                      <input id="race" formControlName="race" class="bg-stone-900 border border-stone-700 rounded px-2 py-1 text-xs focus:outline-none focus:border-amber-500">
                    </div>
                    <div class="flex flex-col gap-1">
                      <label for="alignment" class="text-[10px] text-stone-500 uppercase">Tendência</label>
                      <input id="alignment" formControlName="alignment" class="bg-stone-900 border border-stone-700 rounded px-2 py-1 text-xs focus:outline-none focus:border-amber-500">
                    </div>
                    <div class="flex flex-col gap-1">
                      <label for="xp" class="text-[10px] text-stone-500 uppercase">XP</label>
                      <input id="xp" type="number" formControlName="xp" class="bg-stone-900 border border-stone-700 rounded px-2 py-1 text-xs focus:outline-none focus:border-amber-500">
                    </div>
                    <div class="flex flex-col gap-1">
                      <label for="hitDie" class="text-[10px] text-stone-500 uppercase">Dado de Vida (d?)</label>
                      <input id="hitDie" type="number" formControlName="hitDie" placeholder="ex: 10" class="bg-stone-900 border border-stone-700 rounded px-2 py-1 text-xs focus:outline-none focus:border-amber-500">
                    </div>
                  </div>

                  <div class="grid grid-cols-3 gap-2">
                    <div class="flex flex-col gap-1">
                      <label for="ac" class="text-[10px] text-stone-500 uppercase text-center">CA</label>
                      <input id="ac" type="number" formControlName="ac" class="bg-stone-900 border border-stone-700 rounded px-2 py-1 text-xs text-center focus:outline-none focus:border-amber-500">
                    </div>
                    <div class="flex flex-col gap-1">
                      <label for="initiative" class="text-[10px] text-stone-500 uppercase text-center">Iniciativa</label>
                      <input id="initiative" type="number" formControlName="initiative" class="bg-stone-900 border border-stone-700 rounded px-2 py-1 text-xs text-center focus:outline-none focus:border-amber-500">
                    </div>
                    <div class="flex flex-col gap-1">
                      <label for="speed" class="text-[10px] text-stone-500 uppercase text-center">Deslocamento (Metros)</label>
                      <input id="speed" type="number" formControlName="speed" class="bg-stone-900 border border-stone-700 rounded px-2 py-1 text-xs text-center focus:outline-none focus:border-amber-500 font-mono">
                    </div>
                  </div>

                  <div class="grid grid-cols-3 gap-2">
                    <div class="flex flex-col gap-1">
                      <label for="str" class="text-[10px] text-stone-500 uppercase text-center">FOR</label>
                      <input id="str" type="number" formControlName="str" class="bg-stone-900 border border-stone-700 rounded px-2 py-1 text-xs text-center focus:outline-none focus:border-amber-500">
                    </div>
                    <div class="flex flex-col gap-1">
                      <label for="dex" class="text-[10px] text-stone-500 uppercase text-center">DES</label>
                      <input id="dex" type="number" formControlName="dex" class="bg-stone-900 border border-stone-700 rounded px-2 py-1 text-xs text-center focus:outline-none focus:border-amber-500">
                    </div>
                    <div class="flex flex-col gap-1">
                      <label for="con" class="text-[10px] text-stone-500 uppercase text-center">CON</label>
                      <input id="con" type="number" formControlName="con" class="bg-stone-900 border border-stone-700 rounded px-2 py-1 text-xs text-center focus:outline-none focus:border-amber-500">
                    </div>
                    <div class="flex flex-col gap-1">
                      <label for="int" class="text-[10px] text-stone-500 uppercase text-center">INT</label>
                      <input id="int" type="number" formControlName="int" class="bg-stone-900 border border-stone-700 rounded px-2 py-1 text-xs text-center focus:outline-none focus:border-amber-500">
                    </div>
                    <div class="flex flex-col gap-1">
                      <label for="wis" class="text-[10px] text-stone-500 uppercase text-center">SAB</label>
                      <input id="wis" type="number" formControlName="wis" class="bg-stone-900 border border-stone-700 rounded px-2 py-1 text-xs text-center focus:outline-none focus:border-amber-500">
                    </div>
                    <div class="flex flex-col gap-1">
                      <label for="cha" class="text-[10px] text-stone-500 uppercase text-center">CAR</label>
                      <input id="cha" type="number" formControlName="cha" class="bg-stone-900 border border-stone-700 rounded px-2 py-1 text-xs text-center focus:outline-none focus:border-amber-500">
                    </div>
                  </div>

                  <div class="grid grid-cols-2 gap-2">
                    <div class="flex flex-col gap-1">
                      <label for="proficiencyBonus" class="text-[10px] text-stone-500 uppercase">Bônus de Proficiência</label>
                      <input id="proficiencyBonus" type="number" formControlName="proficiencyBonus" class="bg-stone-900 border border-stone-700 rounded px-2 py-1 text-xs focus:outline-none focus:border-amber-500">
                    </div>
                    <div class="flex flex-col gap-1">
                      <label for="passivePerception" class="text-[10px] text-stone-500 uppercase">Percepção Passiva</label>
                      <input id="passivePerception" type="number" formControlName="passivePerception" class="bg-stone-900 border border-stone-700 rounded px-2 py-1 text-xs focus:outline-none focus:border-amber-500">
                    </div>
                  </div>

                  <div class="grid grid-cols-5 gap-1">
                    <div class="flex flex-col gap-1">
                      <label for="cp" class="text-[10px] text-stone-500 uppercase text-center">PC</label>
                      <input id="cp" type="number" formControlName="cp" class="bg-stone-900 border border-stone-700 rounded px-2 py-1 text-xs text-center focus:outline-none focus:border-amber-500">
                    </div>
                    <div class="flex flex-col gap-1">
                      <label for="sp" class="text-[10px] text-stone-500 uppercase text-center">PP</label>
                      <input id="sp" type="number" formControlName="sp" class="bg-stone-900 border border-stone-700 rounded px-2 py-1 text-xs text-center focus:outline-none focus:border-amber-500">
                    </div>
                    <div class="flex flex-col gap-1">
                      <label for="ep" class="text-[10px] text-stone-500 uppercase text-center">PE</label>
                      <input id="ep" type="number" formControlName="ep" class="bg-stone-900 border border-stone-700 rounded px-2 py-1 text-xs text-center focus:outline-none focus:border-amber-500">
                    </div>
                    <div class="flex flex-col gap-1">
                      <label for="gp" class="text-[10px] text-stone-500 uppercase text-center">PO</label>
                      <input id="gp" type="number" formControlName="gp" class="bg-stone-900 border border-stone-700 rounded px-2 py-1 text-xs text-center focus:outline-none focus:border-amber-500">
                    </div>
                    <div class="flex flex-col gap-1">
                      <label for="pp" class="text-[10px] text-stone-500 uppercase text-center">PL</label>
                      <input id="pp" type="number" formControlName="pp" class="bg-stone-900 border border-stone-700 rounded px-2 py-1 text-xs text-center focus:outline-none focus:border-amber-500">
                    </div>
                  </div>
                </form>
              </div>
            } @else if (selectedToken()?.sheet; as sheet) {
              <div class="bg-stone-800 rounded border border-stone-700 p-3 space-y-4 shadow-md text-xs">
                <!-- Header -->
                <div class="border-b border-stone-700 pb-2">
                  <div class="flex justify-between items-start">
                    <h3 class="font-bold text-amber-500 text-lg">{{ selectedToken()?.name }}</h3>
                    @if (auth.currentUser()?.role === 'GM' || selectedToken()?.controlledBy === auth.currentUser()?.id) {
                      <button class="text-stone-500 hover:text-amber-500 transition-colors" (click)="editSheet()" title="Editar Ficha">
                        <mat-icon style="font-size: 16px; width: 16px; height: 16px;">edit</mat-icon>
                      </button>
                    }
                  </div>
                  <div class="grid grid-cols-2 gap-x-2 gap-y-1 mt-2 text-stone-400">
                    <div class="flex items-center gap-1"><mat-icon class="text-[10px] text-stone-500" style="font-size: 10px; width: 10px; height: 10px;">favorite</mat-icon> <span class="text-stone-500">PV:</span> {{ sheet.hp }}/{{ sheet.maxHp }}</div>
                    <div class="flex items-center gap-1"><mat-icon class="text-[10px] text-stone-500" style="font-size: 10px; width: 10px; height: 10px;">bolt</mat-icon> <span class="text-stone-500">Mana:</span> {{ sheet.mp }}/{{ sheet.maxMp }}</div>
                    <div class="flex items-center gap-1"><mat-icon class="text-[10px] text-stone-500" style="font-size: 10px; width: 10px; height: 10px;">school</mat-icon> <span class="text-stone-500">Classe:</span> {{ sheet.class }}</div>
                    <div class="flex items-center gap-1"><mat-icon class="text-[10px] text-stone-500" style="font-size: 10px; width: 10px; height: 10px;">military_tech</mat-icon> <span class="text-stone-500">Nível:</span> {{ sheet.level }}</div>
                    <div class="flex items-center gap-1"><mat-icon class="text-[10px] text-stone-500" style="font-size: 10px; width: 10px; height: 10px;">history</mat-icon> <span class="text-stone-500">Antecedente:</span> {{ sheet.background }}</div>
                    <div class="flex items-center gap-1"><mat-icon class="text-[10px] text-stone-500" style="font-size: 10px; width: 10px; height: 10px;">person</mat-icon> <span class="text-stone-500">Jogador:</span> {{ sheet.playerName }}</div>
                    <div class="flex items-center gap-1"><mat-icon class="text-[10px] text-stone-500" style="font-size: 10px; width: 10px; height: 10px;">groups</mat-icon> <span class="text-stone-500">Raça:</span> {{ sheet.race }}</div>
                    <div class="flex items-center gap-1"><mat-icon class="text-[10px] text-stone-500" style="font-size: 10px; width: 10px; height: 10px;">balance</mat-icon> <span class="text-stone-500">Tendência:</span> {{ sheet.alignment }}</div>
                    <div class="flex items-center gap-1"><mat-icon class="text-[10px] text-stone-500" style="font-size: 10px; width: 10px; height: 10px;">trending_up</mat-icon> <span class="text-stone-500">XP:</span> {{ sheet.xp }}</div>
                  </div>
                </div>

                <!-- Combat Stats -->
                <div class="flex justify-between items-center bg-stone-900 p-2 rounded border border-stone-700">
                  <div class="text-center flex flex-col items-center">
                    <div class="text-[10px] text-stone-500 uppercase flex items-center gap-1">
                      <mat-icon style="font-size: 10px; width: 10px; height: 10px;">security</mat-icon>
                      CA
                    </div>
                    <div class="font-bold text-lg text-amber-500">{{ sheet.ac }}</div>
                  </div>
                  <div class="text-center flex flex-col items-center">
                    <div class="text-[10px] text-stone-500 uppercase flex items-center gap-1">
                      <mat-icon style="font-size: 10px; width: 10px; height: 10px;">timer</mat-icon>
                      Iniciativa
                    </div>
                    <div class="font-bold text-lg text-amber-500">{{ sheet.initiative >= 0 ? '+' : '' }}{{ sheet.initiative }}</div>
                  </div>
                  <div class="text-center flex flex-col items-center">
                    <div class="text-[10px] text-stone-500 uppercase flex items-center gap-1">
                      <mat-icon style="font-size: 10px; width: 10px; height: 10px;">directions_run</mat-icon>
                      Deslocamento
                    </div>
                    <div class="font-bold text-lg text-amber-500">{{ sheet.speed }} Metros</div>
                  </div>
                </div>

                <!-- Attributes -->
                <div class="grid grid-cols-3 gap-2">
                  <div class="bg-stone-900 border border-stone-700 rounded p-2 text-center flex flex-col items-center">
                    <div class="text-[10px] text-stone-500 uppercase font-bold flex items-center gap-1">
                      <mat-icon style="font-size: 10px; width: 10px; height: 10px;">fitness_center</mat-icon>
                      FOR
                    </div>
                    <div class="font-bold text-lg">{{ sheet.str }}</div>
                    <div class="text-[10px] text-stone-400">{{ mathService.calculateModifier(sheet.str) >= 0 ? '+' : '' }}{{ mathService.calculateModifier(sheet.str) }}</div>
                  </div>
                  <div class="bg-stone-900 border border-stone-700 rounded p-2 text-center flex flex-col items-center">
                    <div class="text-[10px] text-stone-500 uppercase font-bold flex items-center gap-1">
                      <mat-icon style="font-size: 10px; width: 10px; height: 10px;">directions_run</mat-icon>
                      DES
                    </div>
                    <div class="font-bold text-lg">{{ sheet.dex }}</div>
                    <div class="text-[10px] text-stone-400">{{ mathService.calculateModifier(sheet.dex) >= 0 ? '+' : '' }}{{ mathService.calculateModifier(sheet.dex) }}</div>
                  </div>
                  <div class="bg-stone-900 border border-stone-700 rounded p-2 text-center flex flex-col items-center">
                    <div class="text-[10px] text-stone-500 uppercase font-bold flex items-center gap-1">
                      <mat-icon style="font-size: 10px; width: 10px; height: 10px;">favorite</mat-icon>
                      CON
                    </div>
                    <div class="font-bold text-lg">{{ sheet.con }}</div>
                    <div class="text-[10px] text-stone-400">{{ mathService.calculateModifier(sheet.con) >= 0 ? '+' : '' }}{{ mathService.calculateModifier(sheet.con) }}</div>
                  </div>
                  <div class="bg-stone-900 border border-stone-700 rounded p-2 text-center flex flex-col items-center">
                    <div class="text-[10px] text-stone-500 uppercase font-bold flex items-center gap-1">
                      <mat-icon style="font-size: 10px; width: 10px; height: 10px;">menu_book</mat-icon>
                      INT
                    </div>
                    <div class="font-bold text-lg">{{ sheet.int }}</div>
                    <div class="text-[10px] text-stone-400">{{ mathService.calculateModifier(sheet.int) >= 0 ? '+' : '' }}{{ mathService.calculateModifier(sheet.int) }}</div>
                  </div>
                  <div class="bg-stone-900 border border-stone-700 rounded p-2 text-center flex flex-col items-center">
                    <div class="text-[10px] text-stone-500 uppercase font-bold flex items-center gap-1">
                      <mat-icon style="font-size: 10px; width: 10px; height: 10px;">visibility</mat-icon>
                      SAB
                    </div>
                    <div class="font-bold text-lg">{{ sheet.wis }}</div>
                    <div class="text-[10px] text-stone-400">{{ mathService.calculateModifier(sheet.wis) >= 0 ? '+' : '' }}{{ mathService.calculateModifier(sheet.wis) }}</div>
                  </div>
                  <div class="bg-stone-900 border border-stone-700 rounded p-2 text-center flex flex-col items-center">
                    <div class="text-[10px] text-stone-500 uppercase font-bold flex items-center gap-1">
                      <mat-icon style="font-size: 10px; width: 10px; height: 10px;">record_voice_over</mat-icon>
                      CAR
                    </div>
                    <div class="font-bold text-lg">{{ sheet.cha }}</div>
                    <div class="text-[10px] text-stone-400">{{ mathService.calculateModifier(sheet.cha) >= 0 ? '+' : '' }}{{ mathService.calculateModifier(sheet.cha) }}</div>
                  </div>
                </div>

                <!-- Other Stats -->
                <div class="space-y-2">
                  <div class="flex justify-between items-center bg-stone-900 px-2 py-1 rounded border border-stone-700">
                    <span class="text-stone-500 font-bold">Bônus de Proficiência</span>
                    <span class="font-bold text-amber-500">+{{ sheet.proficiencyBonus }}</span>
                  </div>
                  <div class="flex justify-between items-center bg-stone-900 px-2 py-1 rounded border border-stone-700">
                    <span class="text-stone-500 font-bold">Sabedoria Passiva (Percepção)</span>
                    <span class="font-bold text-amber-500">{{ sheet.passivePerception }}</span>
                  </div>
                </div>

                <!-- Condições -->
                <div class="space-y-2">
                  <div class="flex justify-between items-center">
                    <h4 class="text-xs font-bold text-amber-500 uppercase">Condições</h4>
                    @if (auth.currentUser()?.role === 'GM' || selectedToken()?.controlledBy === auth.currentUser()?.id) {
                      <button class="text-stone-500 hover:text-amber-500 transition-colors" (click)="isEditingConditions.set(!isEditingConditions())" title="Editar Condições">
                        <mat-icon style="font-size: 16px; width: 16px; height: 16px;">{{ isEditingConditions() ? 'check' : 'edit' }}</mat-icon>
                      </button>
                    }
                  </div>
                  
                  @if (isEditingConditions()) {
                    <div class="space-y-3 bg-stone-900 p-2 rounded border border-stone-700 max-h-48 overflow-y-auto custom-scrollbar">
                      @for (category of conditionCategories; track category.name) {
                        <div class="space-y-1.5">
                          <h5 class="text-[10px] text-stone-500 uppercase">{{ category.name }}</h5>
                          <div class="flex flex-wrap gap-1.5">
                            @for (condition of category.conditions; track condition.id) {
                              <button 
                                class="px-2 py-1 text-[10px] rounded-full border transition-colors flex items-center gap-1"
                                [class.bg-amber-900]="hasCondition(condition.id)"
                                [class.border-amber-500]="hasCondition(condition.id)"
                                [class.text-amber-100]="hasCondition(condition.id)"
                                [class.bg-stone-800]="!hasCondition(condition.id)"
                                [class.border-stone-700]="!hasCondition(condition.id)"
                                [class.text-stone-400]="!hasCondition(condition.id)"
                                [class.hover:border-stone-500]="!hasCondition(condition.id)"
                                (click)="toggleCondition(condition)">
                                <mat-icon style="font-size: 10px; width: 10px; height: 10px;" [style.color]="condition.color">{{ condition.icon }}</mat-icon>
                                {{ condition.name }}
                              </button>
                            }
                          </div>
                        </div>
                      }
                    </div>
                  } @else {
                    @if ((selectedToken()?.conditions?.length || 0) > 0) {
                      <div class="flex flex-wrap gap-1.5">
                        @for (condition of selectedToken()?.conditions; track condition.id) {
                          <span class="px-2 py-1 text-[10px] rounded-full border border-amber-500 bg-amber-900 text-amber-100 flex items-center gap-1">
                            <mat-icon style="font-size: 10px; width: 10px; height: 10px;" [style.color]="condition.color">{{ condition.icon }}</mat-icon>
                            {{ condition.name }}
                          </span>
                        }
                      </div>
                    } @else {
                      <div class="bg-stone-900 px-2 py-1.5 rounded border border-stone-700 text-[10px] text-stone-500 italic">
                        Nenhuma condição ativa.
                      </div>
                    }
                  }
                </div>

                <!-- Sub-tabs for Abilities -->
                <div class="mt-4 border border-stone-700 rounded overflow-hidden">
                  <div class="flex bg-stone-900 border-b border-stone-700">
                    <button class="flex-1 py-2 text-[10px] font-bold uppercase transition-colors flex items-center justify-center gap-1"
                            [class.text-amber-500]="fichaSubTab() === 'weapons'"
                            [class.bg-stone-800]="fichaSubTab() === 'weapons'"
                            (click)="fichaSubTab.set('weapons')">
                      <mat-icon style="font-size: 14px; width: 14px; height: 14px;">shield</mat-icon>
                      Armas
                    </button>
                    <button class="flex-1 py-2 text-[10px] font-bold uppercase transition-colors border-l border-stone-700 flex items-center justify-center gap-1"
                            [class.text-amber-500]="fichaSubTab() === 'spells'"
                            [class.bg-stone-800]="fichaSubTab() === 'spells'"
                            (click)="fichaSubTab.set('spells')">
                      <mat-icon style="font-size: 14px; width: 14px; height: 14px;">auto_fix_high</mat-icon>
                      Magias
                    </button>
                    <button class="flex-1 py-2 text-[10px] font-bold uppercase transition-colors border-l border-stone-700 flex items-center justify-center gap-1"
                            [class.text-amber-500]="fichaSubTab() === 'features'"
                            [class.bg-stone-800]="fichaSubTab() === 'features'"
                            (click)="fichaSubTab.set('features')">
                      <mat-icon style="font-size: 14px; width: 14px; height: 14px;">star</mat-icon>
                      Habilidades
                    </button>
                  </div>

                  <div class="p-2 min-h-[100px]">
                    <!-- Weapons List (Ficha) -->
                    @if (fichaSubTab() === 'weapons') {
                      @if (weapons().length > 0) {
                        <div class="space-y-2">
                          @for (ability of weapons(); track ability.id) {
                            <div class="bg-stone-900 rounded border border-stone-700 p-2 text-xs">
                              <div class="flex justify-between items-center mb-1">
                                <span class="font-bold text-amber-500">{{ ability.name }}</span>
                                <span class="text-[10px] font-mono text-stone-400 uppercase bg-stone-800 px-1 rounded">{{ ability.type }}</span>
                              </div>
                              <div class="flex gap-2 font-mono text-[10px] text-stone-400">
                                <span>Atk: {{ (ability.attackBonus ?? 0) >= 0 ? '+' : '' }}{{ ability.attackBonus ?? 0 }}</span>
                                @if (ability.damage) {
                                  <span>Dano: {{ ability.damage }}</span>
                                }
                                @if (ability.healing) {
                                  <span class="text-green-500">Recup. PV: {{ ability.healing }}</span>
                                }
                                <span>Alcance: {{ ability.range }}m</span>
                                @if (ability.manaCost) {
                                  <span class="text-blue-400">Custo: {{ ability.manaCost }} MP</span>
                                }
                              </div>
                              @if (ability.description) {
                                <p class="text-stone-500 mt-1 text-[10px]">{{ ability.description }}</p>
                              }
                            </div>
                          }
                        </div>
                      } @else {
                        <p class="text-[10px] text-stone-500 italic text-center py-4">Nenhuma arma equipada.</p>
                      }
                    }

                    <!-- Spells List (Ficha) -->
                    @if (fichaSubTab() === 'spells') {
                      @if (spells().length > 0) {
                        <div class="space-y-2">
                          @for (ability of spells(); track ability.id) {
                            <div class="bg-stone-900 rounded border border-stone-700 p-2 text-xs">
                              <div class="flex justify-between items-center mb-1">
                                <span class="font-bold text-amber-500">{{ ability.name }}</span>
                                <span class="text-[10px] bg-blue-900/50 text-blue-300 px-1 rounded border border-blue-700/50">Nível {{ ability.spellLevel || 0 }}</span>
                              </div>
                              <div class="flex gap-2 font-mono text-[10px] text-stone-400 flex-wrap">
                                <span>Atk: {{ (ability.attackBonus ?? 0) >= 0 ? '+' : '' }}{{ ability.attackBonus ?? 0 }}</span>
                                @if (ability.damage) {
                                  <span>Dano: {{ ability.damage }}</span>
                                }
                                @if (ability.healing) {
                                  <span class="text-green-500">Recup. PV: {{ ability.healing }}</span>
                                }
                                <span>Alcance: {{ ability.range }}m</span>
                                @if (ability.manaCost) {
                                  <span class="text-blue-400">Custo: {{ ability.manaCost }} MP</span>
                                }
                                @if (ability.maxUses) {
                                  <div class="w-full h-1 bg-stone-900 rounded-full overflow-hidden border border-stone-700 mt-1">
                                    <div class="h-full bg-blue-500 transition-all duration-300" [style.width.%]="((ability.uses || 0) / ability.maxUses) * 100"></div>
                                  </div>
                                  <span class="text-amber-500">Usos: {{ ability.uses || 0 }}/{{ ability.maxUses }}</span>
                                }
                              </div>
                              @if (ability.description) {
                                <p class="text-stone-500 mt-1 text-[10px]">{{ ability.description }}</p>
                              }
                            </div>
                          }
                        </div>
                      } @else {
                        <p class="text-[10px] text-stone-500 italic text-center py-4">Nenhuma magia preparada.</p>
                      }
                    }

                    <!-- Features List (Ficha) -->
                    @if (fichaSubTab() === 'features') {
                      @if (features().length > 0) {
                        <div class="space-y-2">
                          @for (ability of features(); track ability.id) {
                            <div class="bg-stone-900 rounded border border-stone-700 p-2 text-xs">
                              <div class="flex justify-between items-center mb-1">
                                <span class="font-bold text-amber-500">{{ ability.name }}</span>
                                <span class="text-[10px] font-mono text-stone-400 uppercase bg-stone-800 px-1 rounded">{{ ability.type }}</span>
                              </div>
                              <div class="flex gap-2 font-mono text-[10px] mb-1">
                                @if (ability.healing) {
                                  <span class="text-green-500">Recup. PV: {{ ability.healing }}</span>
                                }
                                @if (ability.manaCost) {
                                  <span class="text-blue-400">Custo: {{ ability.manaCost }} MP</span>
                                }
                              </div>
                              @if (ability.description) {
                                <p class="text-stone-500 mt-1 text-[10px]">{{ ability.description }}</p>
                              }
                            </div>
                          }
                        </div>
                      } @else {
                        <p class="text-[10px] text-stone-500 italic text-center py-4">Nenhuma habilidade especial.</p>
                      }
                    }
                  </div>
                </div>
              </div>
            } @else {
              <div class="bg-stone-800 rounded border border-stone-700 p-4 text-center space-y-3">
                <mat-icon class="text-stone-500 text-4xl mb-2">assignment_late</mat-icon>
                <p class="text-sm text-stone-400">Este token não possui uma ficha de personagem preenchida.</p>
                <p class="text-xs text-stone-500">Habilidades que requerem rolagens de ataque ou salvaguardas podem não funcionar corretamente sem CA e atributos.</p>
                @if (auth.currentUser()?.role === 'GM' || selectedToken()?.controlledBy === auth.currentUser()?.id) {
                  <button class="bg-amber-600 hover:bg-amber-500 text-stone-900 font-bold px-4 py-2 rounded text-xs transition-colors mt-2" (click)="editSheet()">
                    Criar Ficha
                  </button>
                }
              </div>
            }
          }
        </div>
      }
      <!-- Actions Tab -->
      @if (combat.rightPanelTab() === 'actions') {
        <app-action-menu class="flex-1 overflow-hidden"></app-action-menu>
      }
    </div>
  `
})
export class RightPanelComponent {
  mathService = inject(DndMathService);
  combat = inject(CombatService);
  auth = inject(AuthService);

  isEditingSheet = signal(false);
  isEditingConditions = signal(false);
  fichaSubTab = signal<'weapons' | 'spells' | 'features'>('weapons');
  inventorySubTab = signal<'weapons' | 'spells' | 'features'>('weapons');
  isEditingInventory = signal(false);
  inventoryForm = new FormControl('', { nonNullable: true });

  conditionCategories = [
    {
      name: 'Elementais',
      conditions: AVAILABLE_CONDITIONS.filter(c => ['fire', 'cold', 'lightning', 'acid', 'poison', 'thunder', 'necrotic', 'radiant', 'force', 'psychic'].includes(c.id))
    },
    {
      name: 'Status D&D',
      conditions: AVAILABLE_CONDITIONS.filter(c => ['blinded', 'charmed', 'deafened', 'frightened', 'grappled', 'incapacitated', 'invisible', 'paralyzed', 'petrified', 'prone', 'restrained', 'stunned', 'unconscious', 'exhaustion'].includes(c.id))
    }
  ];

  constructor() {
    effect(() => {
      // Track selected token
      const token = this.selectedToken();
      untracked(() => {
        this.isEditingSheet.set(false);
        this.isEditingConditions.set(false);
        this.isEditingInventory.set(false);
        if (token?.sheet) {
          this.inventoryForm.setValue(token.sheet.backpack || '');
        }
      });
    });

    effect(() => {
      const trigger = this.combat.triggerEditSheet();
      if (trigger > 0) {
        untracked(() => {
          this.editSheet();
        });
      }
    });
  }

  showDamageField = signal<boolean>(true);
  showHealingField = signal<boolean>(false);

  sheetForm = new FormGroup({
    class: new FormControl('', { nonNullable: true }),
    level: new FormControl(1, { nonNullable: true }),
    background: new FormControl('', { nonNullable: true }),
    playerName: new FormControl('', { nonNullable: true }),
    race: new FormControl('', { nonNullable: true }),
    alignment: new FormControl('', { nonNullable: true }),
    xp: new FormControl(0, { nonNullable: true }),
    hitDie: new FormControl(10, { nonNullable: true }),
    str: new FormControl(10, { nonNullable: true }),
    dex: new FormControl(10, { nonNullable: true }),
    con: new FormControl(10, { nonNullable: true }),
    int: new FormControl(10, { nonNullable: true }),
    wis: new FormControl(10, { nonNullable: true }),
    cha: new FormControl(10, { nonNullable: true }),
    ac: new FormControl(10, { nonNullable: true }),
    initiative: new FormControl(0, { nonNullable: true }),
    speed: new FormControl(9, { nonNullable: true }),
    proficiencyBonus: new FormControl(2, { nonNullable: true }),
    passivePerception: new FormControl(10, { nonNullable: true }),
    hp: new FormControl(10, { nonNullable: true }),
    maxHp: new FormControl(10, { nonNullable: true }),
    mp: new FormControl(0, { nonNullable: true }),
    maxMp: new FormControl(0, { nonNullable: true }),
    cp: new FormControl(0, { nonNullable: true }),
    sp: new FormControl(0, { nonNullable: true }),
    ep: new FormControl(0, { nonNullable: true }),
    gp: new FormControl(0, { nonNullable: true }),
    pp: new FormControl(0, { nonNullable: true }),
  });

  abilityForm = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    type: new FormControl<'action' | 'bonus_action' | 'reaction' | 'passive'>('action', { nonNullable: true, validators: [Validators.required] }),
    range: new FormControl(0, { nonNullable: true, validators: [Validators.required, Validators.min(0)] }),
    areaShape: new FormControl<AreaShape>('none', { nonNullable: true, validators: [Validators.required] }),
    damage: new FormControl('', { nonNullable: true }),
    damageType: new FormControl('slashing', { nonNullable: true }),
    healing: new FormControl('', { nonNullable: true }),
    description: new FormControl('', { nonNullable: true }),
    attackBonus: new FormControl(0, { nonNullable: true }),
    category: new FormControl<'weapon' | 'spell' | 'feature'>('feature', { nonNullable: true }),
    spellLevel: new FormControl(0, { nonNullable: true }),
    uses: new FormControl(0, { nonNullable: true }),
    maxUses: new FormControl(0, { nonNullable: true }),
    manaCost: new FormControl(0, { nonNullable: true })
  });

  selectedToken = computed(() => {
    const id = this.combat.selectedTokenId();
    if (!id) return null;
    return this.combat.tokens().find(t => t.id === id) || null;
  });

  abilities = computed(() => {
    const token = this.selectedToken();
    return token?.abilities || [];
  });

  weapons = computed(() => this.abilities().filter(a => a.category === 'weapon'));
  spells = computed(() => this.abilities().filter(a => a.category === 'spell'));
  features = computed(() => this.abilities().filter(a => !a.category || a.category === 'feature'));

  hasCondition(conditionId: string): boolean {
    const token = this.selectedToken();
    if (!token) return false;
    return (token.conditions || []).some(c => c.id === conditionId);
  }

  toggleCondition(condition: TokenCondition) {
    const token = this.selectedToken();
    if (!token) return;
    
    const conditions = token.conditions || [];
    const hasIt = conditions.some(c => c.id === condition.id);
    
    const newConditions = hasIt
      ? conditions.filter(c => c.id !== condition.id)
      : [...conditions, condition];
      
    this.combat.updateToken(token.id, { conditions: newConditions });
  }

  addAbility() {
    if (this.abilityForm.invalid) return;

    const token = this.selectedToken();
    if (!token) return;

    const formValue = this.abilityForm.getRawValue();
    const newAbility: Ability = {
      ...formValue,
      damage: this.showDamageField() ? formValue.damage : '',
      healing: this.showHealingField() ? formValue.healing : '',
      id: Math.random().toString(36).substring(2, 9),
      // Add default AoE params based on shape if missing
      ...(formValue.areaShape === 'circle' ? { radius: 6 } : {}),
      ...(formValue.areaShape === 'cone' ? { angle: 60 } : {}),
      ...(formValue.areaShape === 'line' ? { width: 1.5, length: formValue.range } : {}),
      ...(formValue.areaShape === 'rectangle' ? { width: 6, length: 6 } : {})
    };

    const newAbilities = [...(token.abilities || []), newAbility];
    this.combat.updateToken(token.id, { abilities: newAbilities });

    this.abilityForm.reset({
      name: '',
      type: 'action',
      range: 0,
      areaShape: 'none',
      damage: '',
      damageType: 'slashing',
      description: '',
      attackBonus: 0,
      category: 'feature',
      spellLevel: 0,
      uses: 0,
      maxUses: 0,
      manaCost: 0
    });
  }

  removeAbility(id: string) {
    const token = this.selectedToken();
    if (!token) return;

    const newAbilities = (token.abilities || []).filter(a => a.id !== id);
    this.combat.updateToken(token.id, { abilities: newAbilities });
  }

  useAbility(ability: Ability) {
    const token = this.selectedToken();
    if (!token) return;
    this.combat.startPreview(ability, token);
  }

  editSheet() {
    const token = this.selectedToken();
    if (!token) return;
    
    if (token.sheet) {
      this.sheetForm.patchValue({
        ...token.sheet,
        hp: token.hp,
        maxHp: token.maxHp,
        mp: token.mp,
        maxMp: token.maxMp
      });
    } else {
      this.sheetForm.reset({
        class: '',
        level: 1,
        background: '',
        playerName: '',
        race: '',
        alignment: '',
        xp: 0,
        hitDie: 10,
        str: 10,
        dex: 10,
        con: 10,
        int: 10,
        wis: 10,
        cha: 10,
        ac: 10,
        initiative: 0,
        speed: 9,
        proficiencyBonus: 2,
        passivePerception: 10,
        hp: token.hp,
        maxHp: token.maxHp,
        mp: token.mp,
        maxMp: token.maxMp,
        cp: 0,
        sp: 0,
        ep: 0,
        gp: 0,
        pp: 0
      });
    }
    this.isEditingSheet.set(true);
  }

  saveSheet() {
    const token = this.selectedToken();
    if (!token) return;

    const sheetData = this.sheetForm.getRawValue();
    this.combat.updateToken(token.id, { 
      sheet: sheetData,
      hp: sheetData.hp,
      maxHp: sheetData.maxHp,
      mp: sheetData.mp,
      maxMp: sheetData.maxMp
    });
    this.isEditingSheet.set(false);
  }

  saveInventory() {
    const token = this.selectedToken();
    if (!token || !token.sheet) return;

    const backpack = this.inventoryForm.value;
    this.combat.updateToken(token.id, { 
      sheet: { ...token.sheet, backpack } 
    });
    this.isEditingInventory.set(false);
  }

  cancelEditSheet() {
    this.isEditingSheet.set(false);
  }
}
