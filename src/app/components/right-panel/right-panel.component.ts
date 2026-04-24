import { Component, ChangeDetectionStrategy, inject, signal, computed, effect, untracked, HostListener } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators, FormsModule } from '@angular/forms';
import { DndMathService } from '../../services/dnd-math.service';
import { CombatService, AVAILABLE_CONDITIONS } from '../../services/combat.service';
import { AuthService } from '../../services/auth.service';
import { Ability, AreaShape } from '../../models/ability';
import { TokenCondition, CharacterSheet } from '../../models/token';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { ActionMenuComponent } from '../action-menu/action-menu.component';
import { ActionResult } from '../../services/dnd-core-engine.service';

@Component({
  selector: 'app-right-panel',
  standalone: true,
  imports: [CommonModule, MatIconModule, ReactiveFormsModule, FormsModule, ActionMenuComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'flex flex-col h-full w-72 bg-stone-900 border-l border-stone-800 text-stone-300 relative z-20 shadow-2xl shrink-0'
  },
  template: `
      <!-- Tabs -->
      <div class="flex shrink-0 border-b border-stone-800 text-sm font-mono">
        @if (selectedToken()?.type !== 'item') {
          <button class="flex-1 py-4 transition-colors" [class.text-amber-500]="combat.rightPanelTab() === 'sheet'" [class.border-b-2]="combat.rightPanelTab() === 'sheet'" [class.border-amber-500]="combat.rightPanelTab() === 'sheet'" [class.bg-stone-800]="combat.rightPanelTab() === 'sheet'" (click)="combat.rightPanelTab.set('sheet')">Ficha</button>
        }
        <button class="flex-1 py-4 transition-colors" [class.text-amber-500]="combat.rightPanelTab() === 'inventory'" [class.border-b-2]="combat.rightPanelTab() === 'inventory'" [class.border-amber-500]="combat.rightPanelTab() === 'inventory'" [class.bg-stone-800]="combat.rightPanelTab() === 'inventory'" (click)="combat.rightPanelTab.set('inventory')">Inventário</button>
        @if ((auth.currentUser()?.role === 'GM' || selectedToken()?.controlledBy === auth.currentUser()?.id) && selectedToken()?.type !== 'item') {
          <button class="flex-1 py-4 transition-colors" [class.text-amber-500]="combat.rightPanelTab() === 'actions'" [class.border-b-2]="combat.rightPanelTab() === 'actions'" [class.border-amber-500]="combat.rightPanelTab() === 'actions'" [class.bg-stone-800]="combat.rightPanelTab() === 'actions'" (click)="combat.rightPanelTab.set('actions')">Ações</button>
        }
      </div>
      
      <!-- Inventory & Spells Tab -->
      @if (combat.rightPanelTab() === 'inventory') {
        <div class="flex-1 overflow-y-auto min-h-0 custom-scrollbar p-4 space-y-4">
          @if (combat.previewAbility()) {
            <div class="bg-amber-900/30 border border-amber-500/50 rounded p-3 text-sm text-amber-500 flex items-center gap-2 mb-4">
              <mat-icon>info</mat-icon>
              <span>Modo de visualização ativo. Clique no mapa para confirmar o ataque.</span>
              <button class="ml-auto bg-stone-800 hover:bg-stone-700 text-stone-300 px-2 py-1 rounded text-xs" (click)="combat.cancelPreview()">Cancelar</button>
            </div>
          }

          @if (selectedToken()?.type === 'item') {
              <!-- Item Image -->
              @if (selectedToken()?.imageUrl) {
                <div class="flex flex-col items-center mb-4">
                  <div class="w-32 h-32 overflow-hidden rounded-md border border-stone-700 shadow-lg bg-stone-800/50 relative group"
                       [class.cursor-grab]="isAuthorizedToEditImage() && !isDraggingImage()"
                       [class.cursor-grabbing]="isDraggingImage()"
                       (mousedown)="onImageDragStart($event)"
                       (wheel)="onImageWheel($event)">
                    <img [src]="selectedToken()?.imageUrl" 
                         class="w-full h-full object-contain pointer-events-none" 
                         [style.transform]="'scale(' + currentImageScale() + ') translate(' + currentImageOffsetX() + '%, ' + currentImageOffsetY() + '%)'"
                         alt="Item Image" referrerpolicy="no-referrer" />
                    
                    @if (isAuthorizedToEditImage()) {
                      <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                        <span class="text-[10px] text-white font-bold text-center px-2">Arraste para mover</span>
                      </div>
                      <button class="absolute top-1 right-1 bg-black/60 hover:bg-black/80 text-white rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10" (click)="resetImageAdjustment(); $event.stopPropagation()" title="Resetar">
                        <mat-icon style="font-size: 12px; width: 12px; height: 12px;">restart_alt</mat-icon>
                      </button>
                    }
                  </div>
                  
                  @if (isAuthorizedToEditImage()) {
                    <div class="flex items-center gap-2 mt-2 w-32">
                      <mat-icon class="text-stone-500" style="font-size: 14px; width: 14px; height: 14px;">zoom_out</mat-icon>
                      <input type="range" min="0.5" max="3" step="0.1" [ngModel]="currentImageScale()" (ngModelChange)="updateImageAdjustment('scale', $event)" class="flex-1 accent-amber-500">
                      <mat-icon class="text-stone-500" style="font-size: 14px; width: 14px; height: 14px;">zoom_in</mat-icon>
                    </div>
                  }
                </div>
              }

              <!-- Item Details -->
              <div class="bg-stone-800 rounded border border-stone-700 p-3 shadow-md mb-4">
                <div class="flex justify-between items-center mb-2">
                  <h4 class="text-xs font-bold text-amber-500 uppercase flex items-center gap-1">
                    <mat-icon style="font-size: 14px; width: 14px; height: 14px;">info</mat-icon>
                    Detalhes do Item
                  </h4>
                  <div class="flex gap-2">
                    @if (isEditingInventory()) {
                      <button class="text-stone-500 hover:text-green-500 transition-colors" (click)="saveItemDetails()" title="Salvar Detalhes">
                        <mat-icon style="font-size: 16px; width: 16px; height: 16px;">check</mat-icon>
                      </button>
                      <button class="text-stone-500 hover:text-red-500 transition-colors" (click)="isEditingInventory.set(false)" title="Cancelar">
                        <mat-icon style="font-size: 16px; width: 16px; height: 16px;">close</mat-icon>
                      </button>
                    } @else if ((auth.currentUser()?.role === 'GM' && !combat.isPlayMode()) || selectedToken()?.controlledBy === auth.currentUser()?.id) {
                      <button class="text-stone-500 hover:text-amber-500 transition-colors" (click)="isEditingInventory.set(true)" title="Editar Detalhes">
                        <mat-icon style="font-size: 16px; width: 16px; height: 16px;">edit</mat-icon>
                      </button>
                    }
                  </div>
                </div>
                
                <div class="space-y-3">
                  <div class="flex items-center gap-2">
                    <span class="text-[10px] text-stone-500 uppercase font-bold w-20">Valor (PO):</span>
                    @if (isEditingInventory()) {
                      <input type="number" [formControl]="itemValueControl" class="w-24 bg-stone-900 border border-stone-700 rounded px-2 py-1 text-xs focus:outline-none focus:border-amber-500 text-yellow-500 font-bold">
                    } @else {
                      <span class="text-xs font-bold text-yellow-500">{{ selectedToken()?.sheet?.gp || 0 }} PO</span>
                    }
                  </div>
                  
                  <div class="flex flex-col gap-1">
                    <span class="text-[10px] text-stone-500 uppercase font-bold">Descrição:</span>
                    @if (isEditingInventory()) {
                      <textarea [formControl]="inventoryForm" rows="4" class="w-full bg-stone-900 border border-stone-700 rounded px-2 py-1 text-xs focus:outline-none focus:border-amber-500 resize-none text-stone-300"></textarea>
                    } @else {
                      <div class="bg-stone-900 p-2 rounded border border-stone-700 min-h-[60px] text-xs text-stone-300 whitespace-pre-wrap">
                        {{ selectedToken()?.sheet?.backpack || 'Sem descrição.' }}
                      </div>
                    }
                  </div>
                </div>
              </div>
            } @else {
              <!-- Wallet (Carteira) -->
              <div class="bg-stone-800 rounded border border-stone-700 p-3 shadow-md mb-4">
                <div class="flex justify-between items-center mb-2">
                  <h4 class="text-xs font-bold text-amber-500 uppercase flex items-center gap-1">
                    <mat-icon style="font-size: 14px; width: 14px; height: 14px;">account_balance_wallet</mat-icon>
                    Carteira
                  </h4>
                  @if ((auth.currentUser()?.role === 'GM' && !combat.isPlayMode()) || selectedToken()?.controlledBy === auth.currentUser()?.id) {
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
              <div class="mb-4">
                <div class="flex justify-between items-center mb-2">
                  <h4 class="text-xs font-bold text-amber-500 uppercase flex items-center gap-1">
                    <mat-icon style="font-size: 14px; width: 14px; height: 14px;">inventory_2</mat-icon>
                    Itens Coletados
                  </h4>
                  <div class="flex items-center gap-2 text-[10px] font-mono" [class.text-red-500]="totalWeight() > maxCapacity()">
                    <span class="text-stone-400">Peso:</span>
                    <span class="font-bold">{{ totalWeight() | number:'1.1-1' }} / {{ maxCapacity() | number:'1.1-1' }} kg</span>
                  </div>
                </div>
                
                <!-- Weight Progress Bar -->
                <div class="w-full h-1.5 bg-stone-900 rounded-full overflow-hidden mb-3 border border-stone-700">
                  <div class="h-full transition-all duration-300"
                       [class.bg-green-500]="totalWeight() <= maxCapacity() * 0.5"
                       [class.bg-yellow-500]="totalWeight() > maxCapacity() * 0.5 && totalWeight() <= maxCapacity()"
                       [class.bg-red-500]="totalWeight() > maxCapacity()"
                       [style.width.%]="Math.min((totalWeight() / (maxCapacity() || 1)) * 100, 100)">
                  </div>
                </div>
                
                @if (selectedToken()?.sheet?.inventory?.length) {
                  <div class="space-y-3">
                    @for (item of selectedToken()?.sheet?.inventory; track item.name) {
                      <div class="bg-stone-800 rounded border border-stone-700 overflow-hidden shadow-md">
                        <div class="p-2 border-b border-stone-700 flex justify-between items-center bg-stone-800/50">
                          <div class="flex items-center gap-2">
                            <span class="font-bold text-amber-500 text-sm flex items-center gap-1">
                              @if (item.isEquipped) {
                                <mat-icon class="text-green-500" style="font-size: 14px; width: 14px; height: 14px;">check_circle</mat-icon>
                              }
                              {{ item.name }}
                            </span>
                          </div>
                          @if ((auth.currentUser()?.role === 'GM' && !combat.isPlayMode()) || selectedToken()?.controlledBy === auth.currentUser()?.id) {
                            <div class="flex items-center gap-1">
                              <!-- Equip / Unequip Toggle -->
                              <button class="text-stone-500 hover:text-green-400 transition-colors" (click)="toggleEquipItem(item.name)" [title]="item.isEquipped ? 'Desequipar item' : 'Equipar item'">
                                <mat-icon style="font-size: 16px; width: 16px; height: 16px;">
                                  {{ item.isEquipped ? 'shield' : 'shield_none' }}
                                </mat-icon>
                              </button>
                              <!-- Drop Item -->
                              <button class="text-stone-500 hover:text-amber-500 transition-colors ml-1" (click)="dropItem(item.name)" title="Largar no chão">
                                <mat-icon style="font-size: 16px; width: 16px; height: 16px;">pan_tool_alt</mat-icon>
                              </button>
                              <!-- Delete Form -->
                              <button class="text-stone-500 hover:text-red-500 transition-colors ml-1" (click)="removeInventoryItem(item.name)" title="Deletar da ficha">
                                <mat-icon style="font-size: 16px; width: 16px; height: 16px;">delete</mat-icon>
                              </button>
                            </div>
                          }
                        </div>
                        <div class="p-2 text-xs space-y-2">
                          <div class="flex gap-2 font-mono flex-wrap">
                            <span class="bg-stone-900 px-2 py-1 rounded border border-stone-700 text-stone-300">Qtd: {{ item.quantity }}</span>
                            <span class="bg-stone-900 px-2 py-1 rounded border border-stone-700 text-stone-300">Peso: {{ item.weight }}kg</span>
                            @if (item.isEquipped) {
                              <span class="bg-green-900/30 text-green-500 px-2 py-1 rounded border border-green-700/50">Equipado</span>
                            }
                          </div>
                        </div>
                      </div>
                    }
                  </div>
                } @else {
                  <p class="text-[10px] text-stone-500 italic text-center py-4 bg-stone-900 rounded border border-stone-800">Nenhum item coletado.</p>
                }
              </div>

              <!-- Notes Backpack Section -->
              <div class="bg-stone-800 rounded border border-stone-700 p-3 shadow-md mb-4">
                <div class="flex justify-between items-center mb-2">
                  <h4 class="text-xs font-bold text-amber-500 uppercase flex items-center gap-1">
                    <mat-icon style="font-size: 14px; width: 14px; height: 14px;">backpack</mat-icon>
                    Anotações da Mochila
                  </h4>
                  <div class="flex gap-2">
                    @if (isEditingInventory()) {
                      <button class="text-stone-500 hover:text-green-500 transition-colors" (click)="saveInventory()" title="Salvar Inventário">
                        <mat-icon style="font-size: 16px; width: 16px; height: 16px;">check</mat-icon>
                      </button>
                      <button class="text-stone-500 hover:text-red-500 transition-colors" (click)="isEditingInventory.set(false)" title="Cancelar">
                        <mat-icon style="font-size: 16px; width: 16px; height: 16px;">close</mat-icon>
                      </button>
                    } @else if ((auth.currentUser()?.role === 'GM' && !combat.isPlayMode()) || selectedToken()?.controlledBy === auth.currentUser()?.id) {
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
                    {{ selectedToken()?.sheet?.backpack || 'Sem anotações.' }}
                  </div>
                }
              </div>
            }

            <!-- Add Ability Form Template -->
            <ng-template #abilityFormTemplate let-category="category">
              <div class="bg-stone-800 rounded border border-stone-700 p-3 mb-4 space-y-3 shadow-md mt-2">
                <div class="flex justify-between items-center">
                  <h4 class="text-xs font-bold text-amber-500 uppercase">
                    {{ editingAbilityId() ? 'Editar' : 'Adicionar' }} {{ category === 'weapon' ? 'Arma' : category === 'spell' ? 'Magia' : category === 'feature' ? 'Habilidade' : 'Efeito' }}
                  </h4>
                  <button (click)="cancelAbilityForm()" class="text-stone-500 hover:text-stone-300 transition-colors">
                    <mat-icon style="font-size: 14px; width: 14px; height: 14px;">close</mat-icon>
                  </button>
                </div>
                <form [formGroup]="abilityForm" (ngSubmit)="addAbility()" class="space-y-2">
                  <div class="grid grid-cols-2 gap-2">
                    <input formControlName="name" placeholder="Nome" class="w-full bg-stone-900 border border-stone-700 rounded px-2 py-1 text-xs focus:outline-none focus:border-amber-500">
                    <select formControlName="category" class="bg-stone-900 border border-stone-700 rounded px-2 py-1 text-xs focus:outline-none focus:border-amber-500 hidden">
                      <option value="item_effect">Efeito do Item</option>
                      <option value="weapon">Arma</option>
                      <option value="spell">Magia</option>
                      <option value="feature">Habilidade</option>
                    </select>
                    <select formControlName="type" class="bg-stone-900 border border-stone-700 rounded px-2 py-1 text-xs focus:outline-none focus:border-amber-500">
                      <option value="action">Ação</option>
                      <option value="bonus_action">Ação Bônus</option>
                      <option value="reaction">Reação</option>
                      <option value="passive">Passiva</option>
                    </select>
                  </div>
                  
                  <div class="grid grid-cols-2 gap-2">
                    <select formControlName="areaShape" class="bg-stone-900 border border-stone-700 rounded px-2 py-1 text-xs focus:outline-none focus:border-amber-500">
                      <option value="none">Sem Área</option>
                      <option value="circle">Círculo</option>
                      <option value="cone">Cone</option>
                      <option value="line">Linha</option>
                      <option value="rectangle">Retângulo</option>
                    </select>
                    <div class="flex items-center gap-4 px-1">
                      <label class="flex items-center gap-1 text-[10px] text-stone-400 cursor-pointer">
                        <input type="checkbox" [checked]="showDamageField()" (change)="showDamageField.set(!showDamageField())" class="accent-amber-500">
                        Dano
                      </label>
                      <label class="flex items-center gap-1 text-[10px] text-stone-400 cursor-pointer">
                        <input type="checkbox" [checked]="showHealingField()" (change)="showHealingField.set(!showHealingField())" class="accent-green-500">
                        Cura
                      </label>
                    </div>
                  </div>

                  <div class="grid grid-cols-2 gap-2">
                    <div class="flex flex-col gap-1">
                      <label for="abilityRange" class="text-[10px] text-stone-500 uppercase">Alcance (m)</label>
                      <input id="abilityRange" type="number" formControlName="range" class="bg-stone-900 border border-stone-700 rounded px-2 py-1 text-xs focus:outline-none focus:border-amber-500">
                    </div>
                    @if (showDamageField()) {
                      <div class="flex flex-col gap-1">
                        <label for="abilityDamage" class="text-[10px] text-stone-500 uppercase flex justify-between">Dano <span *ngIf="abilityForm.get('damage')?.invalid" class="text-red-500 font-bold">INVÁLIDO (Ex: 2d6)</span></label>
                        <input id="abilityDamage" formControlName="damage" placeholder="ex: 2d6 (Sem bônus)" 
                               [class.border-red-500]="abilityForm.get('damage')?.invalid"
                               class="bg-stone-900 border border-stone-700 rounded px-2 py-1 text-xs focus:outline-none focus:border-amber-500">
                      </div>
                    }
                  </div>

                  <div class="grid grid-cols-2 gap-2">
                    @if (showHealingField()) {
                      <div class="flex flex-col gap-1">
                        <label for="abilityHealing" class="text-[10px] text-stone-500 uppercase flex justify-between">Recuperação de PV <span *ngIf="abilityForm.get('healing')?.invalid" class="text-red-500 font-bold">INVÁLIDO</span></label>
                        <input id="abilityHealing" formControlName="healing" placeholder="ex: 2d8" 
                               [class.border-red-500]="abilityForm.get('healing')?.invalid"
                               class="bg-stone-900 border border-stone-700 rounded px-2 py-1 text-xs focus:outline-none focus:border-amber-500">
                      </div>
                    }
                  </div>

                  <div class="grid grid-cols-2 gap-2 mt-2">
                    <div class="flex flex-col gap-1">
                      <label for="attackBonus" class="text-[10px] text-stone-500 uppercase">Bônus de Ataque</label>
                      <input id="attackBonus" type="number" formControlName="attackBonus" class="bg-stone-900 border border-stone-700 rounded px-2 py-1 text-xs focus:outline-none focus:border-amber-500">
                    </div>
                    <div class="flex flex-col gap-1">
                      <label for="damageBonus" class="text-[10px] text-stone-500 uppercase">Bônus de Dano/Cura</label>
                      <input id="damageBonus" type="number" formControlName="damageBonus" class="bg-stone-900 border border-stone-700 rounded px-2 py-1 text-xs focus:outline-none focus:border-amber-500">
                    </div>
                  </div>

                  @if (abilityForm.get('category')?.value === 'weapon') {
                    <div class="flex flex-col gap-2 border bg-stone-900 border-stone-700 rounded p-2">
                       <label class="flex items-center gap-2 text-xs text-stone-300 cursor-pointer font-bold">
                         <input type="checkbox" formControlName="isProficient" class="accent-amber-500 w-4 h-4">
                         Proficiente (Soma +Bônus de Proficiência ao Ataque)
                       </label>
                       <label class="flex items-center gap-2 text-xs text-stone-300 cursor-pointer font-bold">
                         <input type="checkbox" formControlName="isOffHand" class="accent-amber-500 w-4 h-4">
                         Ataque Secundário / Off-hand (Ignora modificador de atributo no dano)
                       </label>
                    </div>
                  }

                  @if (abilityForm.get('category')?.value === 'spell' || abilityForm.get('category')?.value === 'item_effect') {
                    <div class="grid grid-cols-2 gap-2">
                      @if (abilityForm.get('category')?.value === 'spell') {
                        <div class="flex flex-col gap-1">
                          <label for="spellLevel" class="text-[10px] text-stone-500 uppercase">Nível da Magia</label>
                          <input id="spellLevel" type="number" formControlName="spellLevel" class="bg-stone-900 border border-stone-700 rounded px-2 py-1 text-xs focus:outline-none focus:border-amber-500">
                        </div>
                      }
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
                    {{ editingAbilityId() ? 'Salvar Edição' : 'Adicionar' }}
                  </button>
                </form>
              </div>
            </ng-template>

            <!-- Abilities Section with Sub-tabs -->
            <div class="mt-6 border border-stone-700 rounded overflow-hidden bg-stone-900/30">
              <div class="flex border-b border-stone-700 bg-stone-900/50">
                    @if (selectedToken()?.type === 'item') {
                      <button class="flex-1 py-2 text-[10px] font-bold uppercase transition-colors flex items-center justify-center gap-1"
                              [class.text-amber-500]="inventorySubTab() === 'features'"
                              [class.bg-stone-800]="inventorySubTab() === 'features'"
                              (click)="inventorySubTab.set('features')">
                        <mat-icon style="font-size: 14px; width: 14px; height: 14px;">star</mat-icon>
                        Efeitos
                      </button>
                    } @else {
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
                    }
              </div>

              <div class="p-3 space-y-4">
                <!-- Weapons List -->
                @if (inventorySubTab() === 'weapons') {
                  <div class="flex justify-between items-center mb-2">
                    <h3 class="text-xs font-bold text-stone-400 uppercase">Armas</h3>
                    @if ((auth.currentUser()?.role === 'GM' && !combat.isPlayMode()) || selectedToken()?.controlledBy === auth.currentUser()?.id) {
                      <button (click)="openAddAbilityForm('weapon')" class="text-[10px] bg-stone-800 hover:bg-stone-700 text-amber-500 px-2 py-1 rounded border border-stone-700 transition-colors flex items-center gap-1">
                        <mat-icon style="font-size: 12px; width: 12px; height: 12px;">add</mat-icon> Adicionar Arma
                      </button>
                    }
                  </div>
                  @if (showAddAbilityForm() && abilityForm.get('category')?.value === 'weapon') {
                    <ng-container *ngTemplateOutlet="abilityFormTemplate; context: { category: 'weapon' }"></ng-container>
                  }
                  @if (weapons().length > 0) {
                    <div class="space-y-3">
                      @for (ability of weapons(); track ability.id) {
                        <div class="bg-stone-800 rounded border border-stone-700 overflow-hidden shadow-md">
                          <div class="p-2 border-b border-stone-700 flex justify-between items-center bg-stone-800/50 cursor-pointer hover:bg-stone-700/50 transition-colors" tabindex="0" (keyup.enter)="selectAbilityForRoll(ability)" (click)="selectAbilityForRoll(ability)">
                            <div class="flex items-center gap-2">
                              <span class="font-bold text-amber-500 text-sm">{{ ability.name }}</span>
                              @if (ability.isProficient !== false) {
                                <mat-icon class="text-amber-500" style="font-size: 14px; width: 14px; height: 14px;" title="Proficiente">star</mat-icon>
                              }
                              @if (ability.isOffHand) {
                                <span class="bg-stone-900 border border-stone-600 text-[10px] text-stone-400 font-bold px-1 rounded uppercase">Off-hand</span>
                              }
                              @if ((auth.currentUser()?.role === 'GM' && !combat.isPlayMode()) || selectedToken()?.controlledBy === auth.currentUser()?.id) {
                                <div class="flex items-center gap-1">
                                  <button class="text-stone-500 hover:text-amber-500 transition-colors" (click)="editAbility(ability); $event.stopPropagation()" title="Editar">
                                    <mat-icon style="font-size: 14px; width: 14px; height: 14px;">edit</mat-icon>
                                  </button>
                                  <button class="text-stone-500 hover:text-red-500 transition-colors" (click)="removeAbility(ability.id); $event.stopPropagation()" title="Remover">
                                    <mat-icon style="font-size: 14px; width: 14px; height: 14px;">delete</mat-icon>
                                  </button>
                                </div>
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
                            </div>
                            @if (ability.description) {
                              <p class="text-stone-400">{{ ability.description }}</p>
                            }
                            
                            @if (selectedAbilityForRoll()?.id === ability.id) {
                              <div class="mt-3 p-3 bg-stone-900 rounded border border-stone-700 space-y-3 animate-in fade-in slide-in-from-top-2">
                                
                                <!-- Attack Roll -->
                                <div>
                                  @if (!isManualRollingAttack()) {
                                    <button (click)="startManualAbilityRoll('attack')" class="w-full py-1.5 bg-amber-600 hover:bg-amber-500 text-stone-900 font-bold rounded shadow-lg transition-colors flex items-center justify-center gap-2">
                                      <mat-icon style="font-size: 16px; width: 16px; height: 16px;">casino</mat-icon>
                                      ROLAR ATAQUE (d20)
                                    </button>
                                  } @else {
                                    <div class="bg-stone-800 border border-stone-700 rounded p-2">
                                      <div class="block text-[10px] font-bold text-amber-500 mb-1 text-center">Digite o valor do d20</div>
                                      <div class="flex gap-1">
                                        <input type="number" 
                                               [ngModel]="manualAttackRollValue()" 
                                               (ngModelChange)="manualAttackRollValue.set($event)"
                                               class="flex-1 bg-stone-900 border border-stone-600 rounded px-2 py-1 text-center font-mono font-bold text-sm focus:outline-none focus:border-amber-500"
                                               placeholder="1 a 20"
                                               (keyup.enter)="confirmAbilityRoll('attack')">
                                        <button (click)="confirmAbilityRoll('attack')" class="bg-green-600 hover:bg-green-500 text-white px-2 rounded font-bold transition-colors text-xs">OK</button>
                                        <button (click)="cancelManualAbilityRoll()" class="bg-stone-700 hover:bg-stone-600 text-white px-2 rounded transition-colors"><mat-icon style="font-size: 14px; width: 14px; height: 14px;">close</mat-icon></button>
                                      </div>
                                    </div>
                                  }
                                  @if (lastAbilityResult()?.attack; as atk) {
                                    <div class="mt-2 p-2 rounded border bg-stone-800 border-stone-600">
                                      <div class="flex items-center justify-between mb-1">
                                        <span class="font-bold text-sm" [class.text-green-400]="atk.success" [class.text-red-400]="!atk.success">
                                          {{ atk.success ? 'SUCESSO!' : 'FALHA...' }}
                                        </span>
                                        <span class="font-mono font-bold text-lg text-stone-200">{{ atk.roll.total }}</span>
                                      </div>
                                      <div class="text-[10px] text-stone-400 font-mono break-words leading-tight">{{ atk.roll.log }}</div>
                                      @if (atk.roll.isCritical) { <div class="mt-1 text-[10px] font-bold text-amber-400 uppercase tracking-widest text-center">Sucesso Crítico!</div> }
                                      @if (atk.roll.isCriticalFail) { <div class="mt-1 text-[10px] font-bold text-red-500 uppercase tracking-widest text-center">Falha Crítica!</div> }
                                    </div>
                                  }
                                </div>

                                <!-- Damage/Healing Roll -->
                                @if (ability.damage || ability.healing) {
                                  <div>
                                    @if (!isManualRollingDamage()) {
                                      <button (click)="startManualAbilityRoll('damage')" class="w-full py-1.5 bg-red-800 hover:bg-red-700 text-stone-200 font-bold rounded shadow-lg transition-colors flex items-center justify-center gap-2">
                                        <mat-icon style="font-size: 16px; width: 16px; height: 16px;">bloodtype</mat-icon>
                                        ROLAR {{ ability.damage ? 'DANO' : 'CURA' }} ({{ ability.damage || ability.healing }})
                                      </button>
                                    } @else {
                                      <div class="bg-stone-800 border border-stone-700 rounded p-2">
                                        <div class="block text-[10px] font-bold text-red-400 mb-1 text-center">Digite o valor do {{ ability.damage || ability.healing }}</div>
                                        <div class="flex gap-1">
                                          <input type="number" 
                                                 [ngModel]="manualDamageRollValue()" 
                                                 (ngModelChange)="manualDamageRollValue.set($event)"
                                                 class="flex-1 bg-stone-900 border border-stone-600 rounded px-2 py-1 text-center font-mono font-bold text-sm focus:outline-none focus:border-red-500"
                                                 placeholder="Valor"
                                                 (keyup.enter)="confirmAbilityRoll('damage')">
                                          <button (click)="confirmAbilityRoll('damage')" class="bg-green-600 hover:bg-green-500 text-white px-2 rounded font-bold transition-colors text-xs">OK</button>
                                          <button (click)="cancelManualAbilityRoll()" class="bg-stone-700 hover:bg-stone-600 text-white px-2 rounded transition-colors"><mat-icon style="font-size: 14px; width: 14px; height: 14px;">close</mat-icon></button>
                                        </div>
                                      </div>
                                    }
                                    @if (lastAbilityResult()?.damage; as dmg) {
                                      <div class="mt-2 p-2 rounded border bg-red-900/20 border-red-500/50">
                                        <div class="flex items-center justify-between mb-1">
                                          <span class="font-bold text-sm text-red-400">DANO</span>
                                          <span class="font-mono font-bold text-lg text-stone-200">{{ dmg.total }}</span>
                                        </div>
                                        <div class="text-[10px] text-stone-400 font-mono break-words leading-tight">{{ dmg.log }}</div>
                                      </div>
                                    }
                                    @if (lastAbilityResult()?.healing; as heal) {
                                      <div class="mt-2 p-2 rounded border bg-green-900/20 border-green-500/50">
                                        <div class="flex items-center justify-between mb-1">
                                          <span class="font-bold text-sm text-green-400">CURA</span>
                                          <span class="font-mono font-bold text-lg text-stone-200">{{ heal.total }}</span>
                                        </div>
                                        <div class="text-[10px] text-stone-400 font-mono break-words leading-tight">{{ heal.log }}</div>
                                      </div>
                                    }
                                  </div>
                                }
                                
                                @if (rollError()) {
                                  <p class="text-red-400 text-[10px] text-center">{{ rollError() }}</p>
                                }
                              </div>
                            }

                            <button class="w-full py-1 bg-stone-700 hover:bg-amber-600 hover:text-stone-900 text-stone-300 font-bold rounded transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:bg-stone-700 disabled:hover:text-stone-300 disabled:cursor-not-allowed mt-2"
                                    [disabled]="!selectedToken()?.sheet"
                                    (click)="useAbility(ability)">
                              <mat-icon class="text-sm">my_location</mat-icon> Usar Arma no Mapa
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
                  <div class="flex justify-between items-center mb-2">
                    <h3 class="text-xs font-bold text-stone-400 uppercase">Magias</h3>
                    @if ((auth.currentUser()?.role === 'GM' && !combat.isPlayMode()) || selectedToken()?.controlledBy === auth.currentUser()?.id) {
                      <button (click)="openAddAbilityForm('spell')" class="text-[10px] bg-stone-800 hover:bg-stone-700 text-amber-500 px-2 py-1 rounded border border-stone-700 transition-colors flex items-center gap-1">
                        <mat-icon style="font-size: 12px; width: 12px; height: 12px;">add</mat-icon> Adicionar Magia
                      </button>
                    }
                  </div>
                  @if (showAddAbilityForm() && abilityForm.get('category')?.value === 'spell') {
                    <ng-container *ngTemplateOutlet="abilityFormTemplate; context: { category: 'spell' }"></ng-container>
                  }
                  @if (spells().length > 0) {
                    <div class="space-y-3">
                      @for (ability of spells(); track ability.id) {
                        <div class="bg-stone-800 rounded border border-stone-700 overflow-hidden shadow-md">
                          <div class="p-2 border-b border-stone-700 flex justify-between items-center bg-stone-800/50 cursor-pointer hover:bg-stone-700/50 transition-colors" tabindex="0" (keyup.enter)="selectAbilityForRoll(ability)" (click)="selectAbilityForRoll(ability)">
                            <div class="flex items-center gap-2">
                              <span class="font-bold text-amber-500 text-sm">{{ ability.name }}</span>
                              <span class="text-[10px] bg-blue-900/50 text-blue-300 px-1 rounded border border-blue-700/50">Nível {{ ability.spellLevel || 0 }}</span>
                              @if ((auth.currentUser()?.role === 'GM' && !combat.isPlayMode()) || selectedToken()?.controlledBy === auth.currentUser()?.id) {
                                <div class="flex items-center gap-1">
                                  <button class="text-stone-500 hover:text-amber-500 transition-colors" (click)="editAbility(ability); $event.stopPropagation()" title="Editar">
                                    <mat-icon style="font-size: 14px; width: 14px; height: 14px;">edit</mat-icon>
                                  </button>
                                  <button class="text-stone-500 hover:text-red-500 transition-colors" (click)="removeAbility(ability.id); $event.stopPropagation()" title="Remover">
                                    <mat-icon style="font-size: 14px; width: 14px; height: 14px;">delete</mat-icon>
                                  </button>
                                </div>
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
                                <div class="flex gap-[1px] w-full h-1 bg-stone-900 rounded-full overflow-hidden border border-stone-700 mt-1">
                                  @for (i of [].constructor(ability.maxUses); track $index) {
                                    <div class="flex-1 h-full transition-colors duration-300" 
                                         [class.bg-blue-500]="(ability.uses || 0) > $index"
                                         [class.bg-stone-800]="(ability.uses || 0) <= $index">
                                    </div>
                                  }
                                </div>
                                <span class="bg-stone-900 px-2 py-1 rounded border border-stone-700 text-amber-500">Usos: {{ ability.uses || 0 }}/{{ ability.maxUses }}</span>
                              }
                            </div>
                            @if (ability.description) {
                              <p class="text-stone-400">{{ ability.description }}</p>
                            }

                            @if (selectedAbilityForRoll()?.id === ability.id) {
                              <div class="mt-3 p-3 bg-stone-900 rounded border border-stone-700 space-y-3 animate-in fade-in slide-in-from-top-2">
                                
                                <!-- Attack Roll -->
                                <div>
                                  @if (!isManualRollingAttack()) {
                                    <button (click)="startManualAbilityRoll('attack')" class="w-full py-1.5 bg-amber-600 hover:bg-amber-500 text-stone-900 font-bold rounded shadow-lg transition-colors flex items-center justify-center gap-2">
                                      <mat-icon style="font-size: 16px; width: 16px; height: 16px;">casino</mat-icon>
                                      ROLAR ATAQUE (d20)
                                    </button>
                                  } @else {
                                    <div class="bg-stone-800 border border-stone-700 rounded p-2">
                                      <div class="block text-[10px] font-bold text-amber-500 mb-1 text-center">Digite o valor do d20</div>
                                      <div class="flex gap-1">
                                        <input type="number" 
                                               [ngModel]="manualAttackRollValue()" 
                                               (ngModelChange)="manualAttackRollValue.set($event)"
                                               class="flex-1 bg-stone-900 border border-stone-600 rounded px-2 py-1 text-center font-mono font-bold text-sm focus:outline-none focus:border-amber-500"
                                               placeholder="1 a 20"
                                               (keyup.enter)="confirmAbilityRoll('attack')">
                                        <button (click)="confirmAbilityRoll('attack')" class="bg-green-600 hover:bg-green-500 text-white px-2 rounded font-bold transition-colors text-xs">OK</button>
                                        <button (click)="cancelManualAbilityRoll()" class="bg-stone-700 hover:bg-stone-600 text-white px-2 rounded transition-colors"><mat-icon style="font-size: 14px; width: 14px; height: 14px;">close</mat-icon></button>
                                      </div>
                                    </div>
                                  }
                                  @if (lastAbilityResult()?.attack; as atk) {
                                    <div class="mt-2 p-2 rounded border bg-stone-800 border-stone-600">
                                      <div class="flex items-center justify-between mb-1">
                                        <span class="font-bold text-sm" [class.text-green-400]="atk.success" [class.text-red-400]="!atk.success">
                                          {{ atk.success ? 'SUCESSO!' : 'FALHA...' }}
                                        </span>
                                        <span class="font-mono font-bold text-lg text-stone-200">{{ atk.roll.total }}</span>
                                      </div>
                                      <div class="text-[10px] text-stone-400 font-mono break-words leading-tight">{{ atk.roll.log }}</div>
                                      @if (atk.roll.isCritical) { <div class="mt-1 text-[10px] font-bold text-amber-400 uppercase tracking-widest text-center">Sucesso Crítico!</div> }
                                      @if (atk.roll.isCriticalFail) { <div class="mt-1 text-[10px] font-bold text-red-500 uppercase tracking-widest text-center">Falha Crítica!</div> }
                                    </div>
                                  }
                                </div>

                                <!-- Damage/Healing Roll -->
                                @if (ability.damage || ability.healing) {
                                  <div>
                                    @if (!isManualRollingDamage()) {
                                      <button (click)="startManualAbilityRoll('damage')" class="w-full py-1.5 bg-red-800 hover:bg-red-700 text-stone-200 font-bold rounded shadow-lg transition-colors flex items-center justify-center gap-2">
                                        <mat-icon style="font-size: 16px; width: 16px; height: 16px;">bloodtype</mat-icon>
                                        ROLAR {{ ability.damage ? 'DANO' : 'CURA' }} ({{ ability.damage || ability.healing }})
                                      </button>
                                    } @else {
                                      <div class="bg-stone-800 border border-stone-700 rounded p-2">
                                        <div class="block text-[10px] font-bold text-red-400 mb-1 text-center">Digite o valor do {{ ability.damage || ability.healing }}</div>
                                        <div class="flex gap-1">
                                          <input type="number" 
                                                 [ngModel]="manualDamageRollValue()" 
                                                 (ngModelChange)="manualDamageRollValue.set($event)"
                                                 class="flex-1 bg-stone-900 border border-stone-600 rounded px-2 py-1 text-center font-mono font-bold text-sm focus:outline-none focus:border-red-500"
                                                 placeholder="Valor"
                                                 (keyup.enter)="confirmAbilityRoll('damage')">
                                          <button (click)="confirmAbilityRoll('damage')" class="bg-green-600 hover:bg-green-500 text-white px-2 rounded font-bold transition-colors text-xs">OK</button>
                                          <button (click)="cancelManualAbilityRoll()" class="bg-stone-700 hover:bg-stone-600 text-white px-2 rounded transition-colors"><mat-icon style="font-size: 14px; width: 14px; height: 14px;">close</mat-icon></button>
                                        </div>
                                      </div>
                                    }
                                    @if (lastAbilityResult()?.damage; as dmg) {
                                      <div class="mt-2 p-2 rounded border bg-red-900/20 border-red-500/50">
                                        <div class="flex items-center justify-between mb-1">
                                          <span class="font-bold text-sm text-red-400">DANO</span>
                                          <span class="font-mono font-bold text-lg text-stone-200">{{ dmg.total }}</span>
                                        </div>
                                        <div class="text-[10px] text-stone-400 font-mono break-words leading-tight">{{ dmg.log }}</div>
                                      </div>
                                    }
                                    @if (lastAbilityResult()?.healing; as heal) {
                                      <div class="mt-2 p-2 rounded border bg-green-900/20 border-green-500/50">
                                        <div class="flex items-center justify-between mb-1">
                                          <span class="font-bold text-sm text-green-400">CURA</span>
                                          <span class="font-mono font-bold text-lg text-stone-200">{{ heal.total }}</span>
                                        </div>
                                        <div class="text-[10px] text-stone-400 font-mono break-words leading-tight">{{ heal.log }}</div>
                                      </div>
                                    }
                                  </div>
                                }
                                
                                @if (rollError()) {
                                  <p class="text-red-400 text-[10px] text-center">{{ rollError() }}</p>
                                }
                              </div>
                            }

                            <button class="w-full py-1 bg-stone-700 hover:bg-amber-600 hover:text-stone-900 text-stone-300 font-bold rounded transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:bg-stone-700 disabled:hover:text-stone-300 disabled:cursor-not-allowed mt-2"
                                    [disabled]="!selectedToken()?.sheet"
                                    (click)="useAbility(ability)">
                              <mat-icon class="text-sm">my_location</mat-icon> Lançar Magia no Mapa
                            </button>
                          </div>
                        </div>
                      }
                    </div>
                  } @else {
                    <p class="text-[10px] text-stone-500 italic text-center py-4">Nenhuma magia no inventário.</p>
                  }
                }

                <!-- Item Effects List -->
                @if (inventorySubTab() === 'features' && selectedToken()?.type === 'item') {
                  <div class="flex justify-between items-center mb-2">
                    <h3 class="text-xs font-bold text-stone-400 uppercase">Efeitos do Item</h3>
                    @if ((auth.currentUser()?.role === 'GM' && !combat.isPlayMode()) || selectedToken()?.controlledBy === auth.currentUser()?.id) {
                      <button (click)="openAddAbilityForm('item_effect')" class="text-[10px] bg-stone-800 hover:bg-stone-700 text-amber-500 px-2 py-1 rounded border border-stone-700 transition-colors flex items-center gap-1">
                        <mat-icon style="font-size: 12px; width: 12px; height: 12px;">add</mat-icon> Adicionar Efeito
                      </button>
                    }
                  </div>
                  @if (showAddAbilityForm() && abilityForm.get('category')?.value === 'item_effect') {
                    <ng-container *ngTemplateOutlet="abilityFormTemplate; context: { category: 'item_effect' }"></ng-container>
                  }
                  @if (itemEffects().length > 0) {
                    <div class="space-y-3">
                      @for (ability of itemEffects(); track ability.id) {
                        <div class="bg-stone-800 rounded border border-stone-700 overflow-hidden shadow-md">
                          <div class="p-2 border-b border-stone-700 flex justify-between items-center bg-stone-800/50 cursor-pointer hover:bg-stone-700/50 transition-colors" tabindex="0" (keyup.enter)="selectAbilityForRoll(ability)" (click)="selectAbilityForRoll(ability)">
                            <div class="flex items-center gap-2">
                              <span class="font-bold text-amber-500 text-sm">{{ ability.name }}</span>
                              @if ((auth.currentUser()?.role === 'GM' && !combat.isPlayMode()) || selectedToken()?.controlledBy === auth.currentUser()?.id) {
                                <div class="flex items-center gap-1">
                                  <button class="text-stone-500 hover:text-amber-500 transition-colors" (click)="editAbility(ability); $event.stopPropagation()" title="Editar">
                                    <mat-icon style="font-size: 14px; width: 14px; height: 14px;">edit</mat-icon>
                                  </button>
                                  <button class="text-stone-500 hover:text-red-500 transition-colors" (click)="removeAbility(ability.id); $event.stopPropagation()" title="Remover">
                                    <mat-icon style="font-size: 14px; width: 14px; height: 14px;">delete</mat-icon>
                                  </button>
                                </div>
                              }
                            </div>
                            <span class="text-[10px] font-mono text-stone-400 uppercase bg-stone-900 px-2 py-1 rounded">{{ ability.type }}</span>
                          </div>
                          <div class="p-2 text-xs space-y-2">
                            <div class="flex gap-2 font-mono flex-wrap mb-2">
                              @if (ability.healing) {
                                <span class="bg-stone-900 px-2 py-1 rounded border border-green-700 text-green-500">Recup. PV: {{ ability.healing }}</span>
                              }
                              @if (ability.damage) {
                                <span class="bg-stone-900 px-2 py-1 rounded border border-red-700 text-red-500">Dano: {{ ability.damage }}</span>
                              }
                            </div>
                            @if (ability.description) {
                              <p class="text-stone-400">{{ ability.description }}</p>
                            }

                            @if (selectedAbilityForRoll()?.id === ability.id) {
                              <div class="mt-3 p-3 bg-stone-900 rounded border border-stone-700 space-y-3 animate-in fade-in slide-in-from-top-2">
                                
                                <!-- Attack Roll -->
                                <div>
                                  @if (!isManualRollingAttack()) {
                                    <button (click)="startManualAbilityRoll('attack')" class="w-full py-1.5 bg-amber-600 hover:bg-amber-500 text-stone-900 font-bold rounded shadow-lg transition-colors flex items-center justify-center gap-2">
                                      <mat-icon style="font-size: 16px; width: 16px; height: 16px;">casino</mat-icon>
                                      ROLAR ATAQUE (d20)
                                    </button>
                                  } @else {
                                    <div class="bg-stone-800 border border-stone-700 rounded p-2">
                                      <div class="block text-[10px] font-bold text-amber-500 mb-1 text-center">Digite o valor do d20</div>
                                      <div class="flex gap-1">
                                        <input type="number" 
                                               [ngModel]="manualAttackRollValue()" 
                                               (ngModelChange)="manualAttackRollValue.set($event)"
                                               class="flex-1 bg-stone-900 border border-stone-600 rounded px-2 py-1 text-center font-mono font-bold text-sm focus:outline-none focus:border-amber-500"
                                               placeholder="1 a 20"
                                               (keyup.enter)="confirmAbilityRoll('attack')">
                                        <button (click)="confirmAbilityRoll('attack')" class="bg-green-600 hover:bg-green-500 text-white px-2 rounded font-bold transition-colors text-xs">OK</button>
                                        <button (click)="cancelManualAbilityRoll()" class="bg-stone-700 hover:bg-stone-600 text-white px-2 rounded transition-colors"><mat-icon style="font-size: 14px; width: 14px; height: 14px;">close</mat-icon></button>
                                      </div>
                                    </div>
                                  }
                                  @if (lastAbilityResult()?.attack; as atk) {
                                    <div class="mt-2 p-2 rounded border bg-stone-800 border-stone-600">
                                      <div class="flex items-center justify-between mb-1">
                                        <span class="font-bold text-sm" [class.text-green-400]="atk.success" [class.text-red-400]="!atk.success">
                                          {{ atk.success ? 'SUCESSO!' : 'FALHA...' }}
                                        </span>
                                        <span class="font-mono font-bold text-lg text-stone-200">{{ atk.roll.total }}</span>
                                      </div>
                                      <div class="text-[10px] text-stone-400 font-mono break-words leading-tight">{{ atk.roll.log }}</div>
                                      @if (atk.roll.isCritical) { <div class="mt-1 text-[10px] font-bold text-amber-400 uppercase tracking-widest text-center">Sucesso Crítico!</div> }
                                      @if (atk.roll.isCriticalFail) { <div class="mt-1 text-[10px] font-bold text-red-500 uppercase tracking-widest text-center">Falha Crítica!</div> }
                                    </div>
                                  }
                                </div>

                                <!-- Damage/Healing Roll -->
                                @if (ability.damage || ability.healing) {
                                  <div>
                                    @if (!isManualRollingDamage()) {
                                      <button (click)="startManualAbilityRoll('damage')" class="w-full py-1.5 bg-red-800 hover:bg-red-700 text-stone-200 font-bold rounded shadow-lg transition-colors flex items-center justify-center gap-2">
                                        <mat-icon style="font-size: 16px; width: 16px; height: 16px;">bloodtype</mat-icon>
                                        ROLAR {{ ability.damage ? 'DANO' : 'CURA' }} ({{ ability.damage || ability.healing }})
                                      </button>
                                    } @else {
                                      <div class="bg-stone-800 border border-stone-700 rounded p-2">
                                        <div class="block text-[10px] font-bold text-red-400 mb-1 text-center">Digite o valor do {{ ability.damage || ability.healing }}</div>
                                        <div class="flex gap-1">
                                          <input type="number" 
                                                 [ngModel]="manualDamageRollValue()" 
                                                 (ngModelChange)="manualDamageRollValue.set($event)"
                                                 class="flex-1 bg-stone-900 border border-stone-600 rounded px-2 py-1 text-center font-mono font-bold text-sm focus:outline-none focus:border-red-500"
                                                 placeholder="Valor"
                                                 (keyup.enter)="confirmAbilityRoll('damage')">
                                          <button (click)="confirmAbilityRoll('damage')" class="bg-green-600 hover:bg-green-500 text-white px-2 rounded font-bold transition-colors text-xs">OK</button>
                                          <button (click)="cancelManualAbilityRoll()" class="bg-stone-700 hover:bg-stone-600 text-white px-2 rounded transition-colors"><mat-icon style="font-size: 14px; width: 14px; height: 14px;">close</mat-icon></button>
                                        </div>
                                      </div>
                                    }
                                    @if (lastAbilityResult()?.damage; as dmg) {
                                      <div class="mt-2 p-2 rounded border bg-red-900/20 border-red-500/50">
                                        <div class="flex items-center justify-between mb-1">
                                          <span class="font-bold text-sm text-red-400">DANO</span>
                                          <span class="font-mono font-bold text-lg text-stone-200">{{ dmg.total }}</span>
                                        </div>
                                        <div class="text-[10px] text-stone-400 font-mono break-words leading-tight">{{ dmg.log }}</div>
                                      </div>
                                    }
                                    @if (lastAbilityResult()?.healing; as heal) {
                                      <div class="mt-2 p-2 rounded border bg-green-900/20 border-green-500/50">
                                        <div class="flex items-center justify-between mb-1">
                                          <span class="font-bold text-sm text-green-400">CURA</span>
                                          <span class="font-mono font-bold text-lg text-stone-200">{{ heal.total }}</span>
                                        </div>
                                        <div class="text-[10px] text-stone-400 font-mono break-words leading-tight">{{ heal.log }}</div>
                                      </div>
                                    }
                                  </div>
                                }
                                
                                @if (rollError()) {
                                  <p class="text-red-400 text-[10px] text-center">{{ rollError() }}</p>
                                }
                              </div>
                            }

                            @if (ability.type !== 'passive') {
                              <button class="w-full py-1 bg-stone-700 hover:bg-amber-600 hover:text-stone-900 text-stone-300 font-bold rounded transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:bg-stone-700 disabled:hover:text-stone-300 disabled:cursor-not-allowed mt-2"
                                      (click)="useAbility(ability)">
                                <mat-icon class="text-sm">my_location</mat-icon> Usar Efeito no Mapa
                              </button>
                            }
                          </div>
                        </div>
                      }
                    </div>
                  } @else {
                    <p class="text-[10px] text-stone-500 italic text-center py-4">Nenhum efeito configurado.</p>
                  }
                }

                <!-- Features List -->
                @if (inventorySubTab() === 'features' && selectedToken()?.type !== 'item') {
                  <div class="flex justify-between items-center mb-2">
                    <h3 class="text-xs font-bold text-stone-400 uppercase">Habilidades</h3>
                    @if ((auth.currentUser()?.role === 'GM' && !combat.isPlayMode()) || selectedToken()?.controlledBy === auth.currentUser()?.id) {
                      <button (click)="openAddAbilityForm('feature')" class="text-[10px] bg-stone-800 hover:bg-stone-700 text-amber-500 px-2 py-1 rounded border border-stone-700 transition-colors flex items-center gap-1">
                        <mat-icon style="font-size: 12px; width: 12px; height: 12px;">add</mat-icon> Adicionar Habilidade
                      </button>
                    }
                  </div>
                  @if (showAddAbilityForm() && abilityForm.get('category')?.value === 'feature') {
                    <ng-container *ngTemplateOutlet="abilityFormTemplate; context: { category: 'feature' }"></ng-container>
                  }
                  @if (features().length > 0) {
                    <div class="space-y-3">
                      @for (ability of features(); track ability.id) {
                        <div class="bg-stone-800 rounded border border-stone-700 overflow-hidden shadow-md">
                          <div class="p-2 border-b border-stone-700 flex justify-between items-center bg-stone-800/50 cursor-pointer hover:bg-stone-700/50 transition-colors" tabindex="0" (keyup.enter)="selectAbilityForRoll(ability)" (click)="selectAbilityForRoll(ability)">
                            <div class="flex items-center gap-2">
                              <span class="font-bold text-amber-500 text-sm">{{ ability.name }}</span>
                              @if ((auth.currentUser()?.role === 'GM' && !combat.isPlayMode()) || selectedToken()?.controlledBy === auth.currentUser()?.id) {
                                <div class="flex items-center gap-1">
                                  <button class="text-stone-500 hover:text-amber-500 transition-colors" (click)="editAbility(ability); $event.stopPropagation()" title="Editar">
                                    <mat-icon style="font-size: 14px; width: 14px; height: 14px;">edit</mat-icon>
                                  </button>
                                  <button class="text-stone-500 hover:text-red-500 transition-colors" (click)="removeAbility(ability.id); $event.stopPropagation()" title="Remover">
                                    <mat-icon style="font-size: 14px; width: 14px; height: 14px;">delete</mat-icon>
                                  </button>
                                </div>
                              }
                            </div>
                            <span class="text-[10px] font-mono text-stone-400 uppercase bg-stone-900 px-2 py-1 rounded">{{ ability.type }}</span>
                          </div>
                          <div class="p-2 text-xs space-y-2">
                            <div class="flex gap-2 font-mono flex-wrap mb-2">
                              @if (ability.healing) {
                                <span class="bg-stone-900 px-2 py-1 rounded border border-green-700 text-green-500">Recup. PV: {{ ability.healing }}</span>
                              }
                            </div>
                            @if (ability.description) {
                              <p class="text-stone-400">{{ ability.description }}</p>
                            }

                            @if (selectedAbilityForRoll()?.id === ability.id) {
                              <div class="mt-3 p-3 bg-stone-900 rounded border border-stone-700 space-y-3 animate-in fade-in slide-in-from-top-2">
                                
                                <!-- Attack Roll -->
                                <div>
                                  @if (!isManualRollingAttack()) {
                                    <button (click)="startManualAbilityRoll('attack')" class="w-full py-1.5 bg-amber-600 hover:bg-amber-500 text-stone-900 font-bold rounded shadow-lg transition-colors flex items-center justify-center gap-2">
                                      <mat-icon style="font-size: 16px; width: 16px; height: 16px;">casino</mat-icon>
                                      ROLAR ATAQUE (d20)
                                    </button>
                                  } @else {
                                    <div class="bg-stone-800 border border-stone-700 rounded p-2">
                                      <div class="block text-[10px] font-bold text-amber-500 mb-1 text-center">Digite o valor do d20</div>
                                      <div class="flex gap-1">
                                        <input type="number" 
                                               [ngModel]="manualAttackRollValue()" 
                                               (ngModelChange)="manualAttackRollValue.set($event)"
                                               class="flex-1 bg-stone-900 border border-stone-600 rounded px-2 py-1 text-center font-mono font-bold text-sm focus:outline-none focus:border-amber-500"
                                               placeholder="1 a 20"
                                               (keyup.enter)="confirmAbilityRoll('attack')">
                                        <button (click)="confirmAbilityRoll('attack')" class="bg-green-600 hover:bg-green-500 text-white px-2 rounded font-bold transition-colors text-xs">OK</button>
                                        <button (click)="cancelManualAbilityRoll()" class="bg-stone-700 hover:bg-stone-600 text-white px-2 rounded transition-colors"><mat-icon style="font-size: 14px; width: 14px; height: 14px;">close</mat-icon></button>
                                      </div>
                                    </div>
                                  }
                                  @if (lastAbilityResult()?.attack; as atk) {
                                    <div class="mt-2 p-2 rounded border bg-stone-800 border-stone-600">
                                      <div class="flex items-center justify-between mb-1">
                                        <span class="font-bold text-sm" [class.text-green-400]="atk.success" [class.text-red-400]="!atk.success">
                                          {{ atk.success ? 'SUCESSO!' : 'FALHA...' }}
                                        </span>
                                        <span class="font-mono font-bold text-lg text-stone-200">{{ atk.roll.total }}</span>
                                      </div>
                                      <div class="text-[10px] text-stone-400 font-mono break-words leading-tight">{{ atk.roll.log }}</div>
                                      @if (atk.roll.isCritical) { <div class="mt-1 text-[10px] font-bold text-amber-400 uppercase tracking-widest text-center">Sucesso Crítico!</div> }
                                      @if (atk.roll.isCriticalFail) { <div class="mt-1 text-[10px] font-bold text-red-500 uppercase tracking-widest text-center">Falha Crítica!</div> }
                                    </div>
                                  }
                                </div>

                                <!-- Damage/Healing Roll -->
                                @if (ability.damage || ability.healing) {
                                  <div>
                                    @if (!isManualRollingDamage()) {
                                      <button (click)="startManualAbilityRoll('damage')" class="w-full py-1.5 bg-red-800 hover:bg-red-700 text-stone-200 font-bold rounded shadow-lg transition-colors flex items-center justify-center gap-2">
                                        <mat-icon style="font-size: 16px; width: 16px; height: 16px;">bloodtype</mat-icon>
                                        ROLAR {{ ability.damage ? 'DANO' : 'CURA' }} ({{ ability.damage || ability.healing }})
                                      </button>
                                    } @else {
                                      <div class="bg-stone-800 border border-stone-700 rounded p-2">
                                        <div class="block text-[10px] font-bold text-red-400 mb-1 text-center">Digite o valor do {{ ability.damage || ability.healing }}</div>
                                        <div class="flex gap-1">
                                          <input type="number" 
                                                 [ngModel]="manualDamageRollValue()" 
                                                 (ngModelChange)="manualDamageRollValue.set($event)"
                                                 class="flex-1 bg-stone-900 border border-stone-600 rounded px-2 py-1 text-center font-mono font-bold text-sm focus:outline-none focus:border-red-500"
                                                 placeholder="Valor"
                                                 (keyup.enter)="confirmAbilityRoll('damage')">
                                          <button (click)="confirmAbilityRoll('damage')" class="bg-green-600 hover:bg-green-500 text-white px-2 rounded font-bold transition-colors text-xs">OK</button>
                                          <button (click)="cancelManualAbilityRoll()" class="bg-stone-700 hover:bg-stone-600 text-white px-2 rounded transition-colors"><mat-icon style="font-size: 14px; width: 14px; height: 14px;">close</mat-icon></button>
                                        </div>
                                      </div>
                                    }
                                    @if (lastAbilityResult()?.damage; as dmg) {
                                      <div class="mt-2 p-2 rounded border bg-red-900/20 border-red-500/50">
                                        <div class="flex items-center justify-between mb-1">
                                          <span class="font-bold text-sm text-red-400">DANO</span>
                                          <span class="font-mono font-bold text-lg text-stone-200">{{ dmg.total }}</span>
                                        </div>
                                        <div class="text-[10px] text-stone-400 font-mono break-words leading-tight">{{ dmg.log }}</div>
                                      </div>
                                    }
                                    @if (lastAbilityResult()?.healing; as heal) {
                                      <div class="mt-2 p-2 rounded border bg-green-900/20 border-green-500/50">
                                        <div class="flex items-center justify-between mb-1">
                                          <span class="font-bold text-sm text-green-400">CURA</span>
                                          <span class="font-mono font-bold text-lg text-stone-200">{{ heal.total }}</span>
                                        </div>
                                        <div class="text-[10px] text-stone-400 font-mono break-words leading-tight">{{ heal.log }}</div>
                                      </div>
                                    }
                                  </div>
                                }
                                
                                @if (rollError()) {
                                  <p class="text-red-400 text-[10px] text-center">{{ rollError() }}</p>
                                }
                              </div>
                            }

                            @if (ability.type !== 'passive') {
                              <button class="w-full py-1 bg-stone-700 hover:bg-amber-600 hover:text-stone-900 text-stone-300 font-bold rounded transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:bg-stone-700 disabled:hover:text-stone-300 disabled:cursor-not-allowed mt-2"
                                      [disabled]="!selectedToken()?.sheet"
                                      (click)="useAbility(ability)">
                                <mat-icon class="text-sm">my_location</mat-icon> Usar Habilidade no Mapa
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
        </div>
      }
      <!-- Sheet Tab -->
      @if (combat.rightPanelTab() === 'sheet') {
        <div class="flex-1 overflow-y-auto min-h-0 custom-scrollbar p-4 space-y-4">
          <!-- Token Image -->
          @if (selectedToken()?.imageUrl) {
              <div class="flex flex-col items-center mb-4">
                <div class="w-32 h-32 overflow-hidden rounded-full border-2 border-stone-700 shadow-lg bg-stone-800/50 relative group"
                     [class.cursor-grab]="isAuthorizedToEditImage() && !isDraggingImage()"
                     [class.cursor-grabbing]="isDraggingImage()"
                     (mousedown)="onImageDragStart($event)"
                     (wheel)="onImageWheel($event)">
                  <img [src]="selectedToken()?.imageUrl" 
                       class="w-full h-full object-contain pointer-events-none" 
                       [style.transform]="'scale(' + currentImageScale() + ') translate(' + currentImageOffsetX() + '%, ' + currentImageOffsetY() + '%)'"
                       alt="Token Image" referrerpolicy="no-referrer" />
                  
                  @if (isAuthorizedToEditImage()) {
                    <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                      <span class="text-[10px] text-white font-bold text-center px-2">Arraste para mover</span>
                    </div>
                    <button class="absolute top-1 right-1 bg-black/60 hover:bg-black/80 text-white rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10" (click)="resetImageAdjustment(); $event.stopPropagation()" title="Resetar">
                      <mat-icon style="font-size: 12px; width: 12px; height: 12px;">restart_alt</mat-icon>
                    </button>
                  }
                </div>
                
                @if (isAuthorizedToEditImage()) {
                  <div class="flex items-center gap-2 mt-2 w-32">
                    <mat-icon class="text-stone-500" style="font-size: 14px; width: 14px; height: 14px;">zoom_out</mat-icon>
                    <input type="range" min="0.5" max="3" step="0.1" [ngModel]="currentImageScale()" (ngModelChange)="updateImageAdjustment('scale', $event)" class="flex-1 accent-amber-500">
                    <mat-icon class="text-stone-500" style="font-size: 14px; width: 14px; height: 14px;">zoom_in</mat-icon>
                  </div>
                }
              </div>
            }

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
                      <label for="spellUses" class="text-[10px] text-stone-500 uppercase">Magias Atuais</label>
                      <input id="spellUses" type="number" formControlName="spellUses" class="bg-stone-900 border border-stone-700 rounded px-2 py-1 text-xs focus:outline-none focus:border-amber-500">
                    </div>
                    <div class="flex flex-col gap-1">
                      <label for="maxSpellUses" class="text-[10px] text-stone-500 uppercase">Magias Máximo</label>
                      <input id="maxSpellUses" type="number" formControlName="maxSpellUses" class="bg-stone-900 border border-stone-700 rounded px-2 py-1 text-xs focus:outline-none focus:border-amber-500">
                    </div>
                  </div>

                  <div class="grid grid-cols-2 gap-3">
                    <div class="flex flex-col gap-1.5">
                      <label for="class" class="text-xs text-stone-500 uppercase font-bold tracking-wider">Classe</label>
                      <input id="class" formControlName="class" class="bg-stone-900 border border-stone-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-amber-500">
                    </div>
                    <div class="flex flex-col gap-1.5">
                      <label for="level" class="text-xs text-stone-500 uppercase font-bold tracking-wider">Nível</label>
                      <input id="level" type="number" formControlName="level" class="bg-stone-900 border border-stone-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-amber-500">
                    </div>
                    <div class="flex flex-col gap-1.5">
                      <label for="background" class="text-xs text-stone-500 uppercase font-bold tracking-wider">Antecedente</label>
                      <input id="background" formControlName="background" class="bg-stone-900 border border-stone-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-amber-500">
                    </div>
                    <div class="flex flex-col gap-1.5">
                      <label for="playerName" class="text-xs text-stone-500 uppercase font-bold tracking-wider">Nome do Jogador</label>
                      <input id="playerName" formControlName="playerName" class="bg-stone-900 border border-stone-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-amber-500">
                    </div>
                    <div class="flex flex-col gap-1.5">
                      <label for="race" class="text-xs text-stone-500 uppercase font-bold tracking-wider">Raça</label>
                      <input id="race" formControlName="race" class="bg-stone-900 border border-stone-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-amber-500">
                    </div>
                    <div class="flex flex-col gap-1.5">
                      <label for="alignment" class="text-xs text-stone-500 uppercase font-bold tracking-wider">Tendência</label>
                      <input id="alignment" formControlName="alignment" class="bg-stone-900 border border-stone-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-amber-500">
                    </div>
                    <div class="flex flex-col gap-1.5">
                      <label for="xp" class="text-xs text-stone-500 uppercase font-bold tracking-wider">XP</label>
                      <input id="xp" type="number" formControlName="xp" class="bg-stone-900 border border-stone-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-amber-500">
                    </div>
                    <div class="flex flex-col gap-1.5">
                      <label for="hitDie" class="text-xs text-stone-500 uppercase font-bold tracking-wider">Dado de Vida (d?)</label>
                      <input id="hitDie" type="number" formControlName="hitDie" placeholder="ex: 10" class="bg-stone-900 border border-stone-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-amber-500">
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
                    @if ((auth.currentUser()?.role === 'GM' && !combat.isPlayMode()) || selectedToken()?.controlledBy === auth.currentUser()?.id) {
                      <button class="text-stone-500 hover:text-amber-500 transition-colors" (click)="editSheet()" title="Editar Ficha">
                        <mat-icon style="font-size: 16px; width: 16px; height: 16px;">edit</mat-icon>
                      </button>
                    }
                  </div>
                <div class="flex flex-col gap-1.5 mt-3 text-stone-400 bg-stone-900 border border-stone-800 rounded p-2 text-xs">
                    <div class="flex items-center justify-between"><div class="flex items-center gap-1"><mat-icon class="text-stone-500 text-[14px] leading-none" style="width: 14px; height: 14px;">favorite</mat-icon><span class="text-stone-500 font-bold uppercase text-[10px]">PV</span></div> <span class="font-mono text-stone-300 font-bold">{{ sheet.hp }}/{{ sheet.maxHp }}</span></div>
                    <div class="flex items-center justify-between"><div class="flex items-center gap-1"><mat-icon class="text-stone-500 text-[14px] leading-none" style="width: 14px; height: 14px;">auto_awesome</mat-icon><span class="text-stone-500 font-bold uppercase text-[10px]">Magias</span></div> <span class="font-mono text-stone-300">{{ sheet.spellUses }}/{{ sheet.maxSpellUses }}</span></div>
                    <div class="border-t border-stone-800 my-0.5"></div>
                    <div class="flex items-center justify-between"><div class="flex items-center gap-1"><mat-icon class="text-stone-500 text-[14px] leading-none" style="width: 14px; height: 14px;">school</mat-icon><span class="text-stone-500 font-bold uppercase text-[10px]">Classe</span></div> <span class="truncate text-stone-300 text-[11px] max-w-[100px] text-right" title="{{ sheet.class }}">{{ sheet.class }}</span></div>
                    <div class="flex items-center justify-between"><div class="flex items-center gap-1"><mat-icon class="text-stone-500 text-[14px] leading-none" style="width: 14px; height: 14px;">military_tech</mat-icon><span class="text-stone-500 font-bold uppercase text-[10px]">Nível</span></div> <span class="text-stone-300 font-bold">{{ sheet.level }}</span></div>
                    <div class="flex items-center justify-between"><div class="flex items-center gap-1"><mat-icon class="text-stone-500 text-[14px] leading-none" style="width: 14px; height: 14px;">history</mat-icon><span class="text-stone-500 font-bold uppercase text-[10px]">Antecedente</span></div> <span class="truncate text-stone-300 text-[11px] max-w-[100px] text-right" title="{{ sheet.background }}">{{ sheet.background }}</span></div>
                    <div class="flex items-center justify-between"><div class="flex items-center gap-1"><mat-icon class="text-stone-500 text-[14px] leading-none" style="width: 14px; height: 14px;">person</mat-icon><span class="text-stone-500 font-bold uppercase text-[10px]">Jogador</span></div> <span class="truncate text-stone-300 text-[11px] max-w-[100px] text-right" title="{{ sheet.playerName }}">{{ sheet.playerName }}</span></div>
                    <div class="flex items-center justify-between"><div class="flex items-center gap-1"><mat-icon class="text-stone-500 text-[14px] leading-none" style="width: 14px; height: 14px;">groups</mat-icon><span class="text-stone-500 font-bold uppercase text-[10px]">Raça</span></div> <span class="truncate text-stone-300 text-[11px] max-w-[100px] text-right" title="{{ sheet.race }}">{{ sheet.race }}</span></div>
                    <div class="flex items-center justify-between"><div class="flex items-center gap-1"><mat-icon class="text-stone-500 text-[14px] leading-none" style="width: 14px; height: 14px;">balance</mat-icon><span class="text-stone-500 font-bold uppercase text-[10px]">Tendência</span></div> <span class="truncate text-stone-300 text-[11px] max-w-[100px] text-right" title="{{ sheet.alignment }}">{{ sheet.alignment }}</span></div>
                    <div class="flex items-center justify-between"><div class="flex items-center gap-1"><mat-icon class="text-stone-500 text-[14px] leading-none" style="width: 14px; height: 14px;">trending_up</mat-icon><span class="text-stone-500 font-bold uppercase text-[10px]">XP</span></div> <span class="text-stone-300 font-mono">{{ sheet.xp }}</span></div>
                  </div>
                </div>

                <!-- Combat Stats -->
                <div class="flex justify-between items-center bg-stone-900 p-3 rounded border border-stone-800 shadow-inner">
                  <div class="text-center flex flex-col items-center">
                    <div class="text-xs text-stone-500 uppercase font-bold flex items-center gap-1.5 tracking-tighter">
                      <mat-icon style="font-size: 14px; width: 14px; height: 14px;">security</mat-icon>
                      CA
                    </div>
                    <div class="font-bold text-2xl text-amber-500">{{ sheet.ac }}</div>
                  </div>
                  <div class="text-center flex flex-col items-center">
                    <div class="text-xs text-stone-500 uppercase font-bold flex items-center gap-1.5 tracking-tighter">
                      <mat-icon style="font-size: 14px; width: 14px; height: 14px;">timer</mat-icon>
                      Iniciativa
                    </div>
                    <div class="font-bold text-2xl text-amber-500">{{ sheet.initiative >= 0 ? '+' : '' }}{{ sheet.initiative }}</div>
                  </div>
                  <div class="text-center flex flex-col items-center">
                    <div class="text-xs text-stone-500 uppercase font-bold flex items-center gap-1.5 tracking-tighter">
                      <mat-icon style="font-size: 14px; width: 14px; height: 14px;">directions_run</mat-icon>
                      Veloc.
                    </div>
                    <div class="font-bold text-2xl text-amber-500">{{ sheet.speed }}m</div>
                  </div>
                </div>

                <!-- Attributes -->
                <div class="grid grid-cols-3 gap-2">
                  <div class="bg-stone-900 border border-stone-800 rounded p-2 text-center flex flex-col items-center shadow-sm">
                    <div class="text-[10px] text-stone-500 uppercase font-black flex items-center gap-1">
                      <mat-icon style="font-size: 10px; width: 10px; height: 10px;">fitness_center</mat-icon>
                      FOR
                    </div>
                    <div class="font-bold text-lg text-stone-200">{{ sheet.str }}</div>
                    <div class="text-[10px] text-stone-400 font-mono">{{ mathService.calculateModifier(sheet.str) >= 0 ? '+' : '' }}{{ mathService.calculateModifier(sheet.str) }}</div>
                  </div>
                  <div class="bg-stone-900 border border-stone-800 rounded p-2 text-center flex flex-col items-center shadow-sm">
                    <div class="text-[10px] text-stone-500 uppercase font-bold flex items-center gap-1">
                      <mat-icon style="font-size: 10px; width: 10px; height: 10px;">directions_run</mat-icon>
                      DES
                    </div>
                    <div class="font-bold text-lg text-stone-200">{{ sheet.dex }}</div>
                    <div class="text-[10px] text-stone-400 font-mono">{{ mathService.calculateModifier(sheet.dex) >= 0 ? '+' : '' }}{{ mathService.calculateModifier(sheet.dex) }}</div>
                  </div>
                  <div class="bg-stone-900 border border-stone-800 rounded p-2 text-center flex flex-col items-center shadow-sm">
                    <div class="text-[10px] text-stone-500 uppercase font-bold flex items-center gap-1">
                      <mat-icon style="font-size: 10px; width: 10px; height: 10px;">favorite</mat-icon>
                      CON
                    </div>
                    <div class="font-bold text-lg text-stone-200">{{ sheet.con }}</div>
                    <div class="text-[10px] text-stone-400 font-mono">{{ mathService.calculateModifier(sheet.con) >= 0 ? '+' : '' }}{{ mathService.calculateModifier(sheet.con) }}</div>
                  </div>
                  <div class="bg-stone-900 border border-stone-800 rounded p-2 text-center flex flex-col items-center shadow-sm">
                    <div class="text-[10px] text-stone-500 uppercase font-bold flex items-center gap-1">
                      <mat-icon style="font-size: 10px; width: 10px; height: 10px;">menu_book</mat-icon>
                      INT
                    </div>
                    <div class="font-bold text-lg text-stone-200">{{ sheet.int }}</div>
                    <div class="text-[10px] text-stone-400 font-mono">{{ mathService.calculateModifier(sheet.int) >= 0 ? '+' : '' }}{{ mathService.calculateModifier(sheet.int) }}</div>
                  </div>
                  <div class="bg-stone-900 border border-stone-800 rounded p-2 text-center flex flex-col items-center shadow-sm">
                    <div class="text-[10px] text-stone-500 uppercase font-bold flex items-center gap-1">
                      <mat-icon style="font-size: 10px; width: 10px; height: 10px;">visibility</mat-icon>
                      SAB
                    </div>
                    <div class="font-bold text-lg text-stone-200">{{ sheet.wis }}</div>
                    <div class="text-[10px] text-stone-400 font-mono">{{ mathService.calculateModifier(sheet.wis) >= 0 ? '+' : '' }}{{ mathService.calculateModifier(sheet.wis) }}</div>
                  </div>
                  <div class="bg-stone-900 border border-stone-800 rounded p-2 text-center flex flex-col items-center shadow-sm">
                    <div class="text-[10px] text-stone-500 uppercase font-bold flex items-center gap-1">
                      <mat-icon style="font-size: 10px; width: 10px; height: 10px;">record_voice_over</mat-icon>
                      CAR
                    </div>
                    <div class="font-bold text-lg text-stone-200">{{ sheet.cha }}</div>
                    <div class="text-[10px] text-stone-400 font-mono">{{ mathService.calculateModifier(sheet.cha) >= 0 ? '+' : '' }}{{ mathService.calculateModifier(sheet.cha) }}</div>
                  </div>
                </div>

                <!-- Other Stats -->
                <div class="space-y-1.5 mt-3">
                  <div class="flex justify-between items-center bg-stone-900/50 px-2 py-1.5 rounded border border-stone-800 text-xs">
                    <span class="text-stone-500 font-bold uppercase tracking-tighter">Bônus de Proficiência</span>
                    <span class="font-bold text-amber-500 font-mono">+{{ sheet.proficiencyBonus }}</span>
                  </div>
                  <div class="flex justify-between items-center bg-stone-900/50 px-2 py-1.5 rounded border border-stone-800 text-xs">
                    <span class="text-stone-500 font-bold uppercase tracking-tighter">Percepção Passiva</span>
                    <span class="font-bold text-amber-500 font-mono">{{ sheet.passivePerception }}</span>
                  </div>
                </div>

                <!-- Condições -->
                <div class="space-y-2">
                  <div class="flex justify-between items-center">
                    <h4 class="text-xs font-bold text-amber-500 uppercase">Condições</h4>
                    @if ((auth.currentUser()?.role === 'GM' && !combat.isPlayMode()) || selectedToken()?.controlledBy === auth.currentUser()?.id) {
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
                  <div class="flex bg-stone-900 border-b border-stone-800">
                    <button class="flex-1 py-1.5 text-[9px] font-bold uppercase transition-colors flex items-center justify-center gap-0.5"
                            [class.text-amber-500]="fichaSubTab() === 'weapons'"
                            [class.bg-stone-800]="fichaSubTab() === 'weapons'"
                            (click)="fichaSubTab.set('weapons')">
                      <mat-icon style="font-size: 12px; width: 12px; height: 12px;">shield</mat-icon>
                      <span class="truncate">Armas</span>
                    </button>
                    <button class="flex-1 py-1.5 text-[9px] font-bold uppercase transition-colors border-l border-stone-800 flex items-center justify-center gap-0.5"
                            [class.text-amber-500]="fichaSubTab() === 'spells'"
                            [class.bg-stone-800]="fichaSubTab() === 'spells'"
                            (click)="fichaSubTab.set('spells')">
                      <mat-icon style="font-size: 12px; width: 12px; height: 12px;">auto_fix_high</mat-icon>
                      <span class="truncate">Magias</span>
                    </button>
                    <button class="flex-1 py-1.5 text-[9px] font-bold uppercase transition-colors border-l border-stone-800 flex items-center justify-center gap-0.5"
                            [class.text-amber-500]="fichaSubTab() === 'features'"
                            [class.bg-stone-800]="fichaSubTab() === 'features'"
                            (click)="fichaSubTab.set('features')">
                      <mat-icon style="font-size: 12px; width: 12px; height: 12px;">star</mat-icon>
                      <span class="truncate">Hards</span>
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
                                @if (ability.maxUses) {
                                  <div class="flex gap-[1px] w-full h-1 bg-stone-900 rounded-full overflow-hidden border border-stone-700 mt-1">
                                    @for (i of [].constructor(ability.maxUses); track $index) {
                                      <div class="flex-1 h-full transition-colors duration-300" 
                                           [class.bg-blue-500]="(ability.uses || 0) > $index"
                                           [class.bg-stone-800]="(ability.uses || 0) <= $index">
                                      </div>
                                    }
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
        </div>
      }
      <!-- Actions Tab -->
      @if (combat.rightPanelTab() === 'actions') {
        <app-action-menu class="flex-1 overflow-hidden flex flex-col min-h-0"></app-action-menu>
      }
  `
})
export class RightPanelComponent {
  mathService = inject(DndMathService);
  combat = inject(CombatService);
  auth = inject(AuthService);

  Math = Math;

  isEditingSheet = signal(false);
  isEditingConditions = signal(false);
  fichaSubTab = signal<'weapons' | 'spells' | 'features'>('weapons');
  inventorySubTab = signal<'weapons' | 'spells' | 'features'>('weapons');
  isEditingInventory = signal(false);
  inventoryForm = new FormControl('', { nonNullable: true });
  itemValueControl = new FormControl(0, { nonNullable: true });

  selectedAbilityForRoll = signal<Ability | null>(null);
  isManualRollingAttack = signal<boolean>(false);
  manualAttackRollValue = signal<number | null>(null);
  isManualRollingDamage = signal<boolean>(false);
  manualDamageRollValue = signal<number | null>(null);
  rollError = signal<string | null>(null);
  lastAbilityResult = signal<{
    attack?: { success: boolean, roll: ActionResult, dc: number },
    damage?: { total: number, log: string },
    healing?: { total: number, log: string }
  } | null>(null);

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
          this.itemValueControl.setValue(token.sheet.gp || 0);
        }
        
        // Auto-switch tab if item is selected
        if (token?.type === 'item') {
          if (this.combat.rightPanelTab() !== 'inventory') {
            this.combat.rightPanelTab.set('inventory');
          }
          this.abilityForm.patchValue({ category: 'item_effect' });
        } else {
          if (this.abilityForm.get('category')?.value === 'item_effect') {
             this.abilityForm.patchValue({ category: 'feature' });
          }
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

    effect(() => {
      const isPlayMode = this.combat.isPlayMode();
      const token = this.selectedToken();
      const user = this.auth.currentUser();
      
      const canEdit = (user?.role === 'GM' && !isPlayMode) || token?.controlledBy === user?.id;
      
      if (!canEdit) {
        untracked(() => {
          this.isEditingSheet.set(false);
          this.isEditingConditions.set(false);
          this.isEditingInventory.set(false);
        });
      }
    });
  }

  showDamageField = signal<boolean>(true);
  showHealingField = signal<boolean>(false);
  showAddAbilityForm = signal<boolean>(false);
  editingAbilityId = signal<string | null>(null);

  openAddAbilityForm(category: 'weapon' | 'spell' | 'feature' | 'item_effect') {
    this.editingAbilityId.set(null);
    this.abilityForm.reset({
      name: '',
      type: 'action',
      range: 0,
      areaShape: 'none',
      damage: '',
      damageType: 'slashing',
      description: '',
      attackBonus: 0,
      damageBonus: 0,
      isProficient: true,
      isOffHand: false,
      category: category,
      spellLevel: 0,
      uses: 0,
      maxUses: 0
    });
    this.showDamageField.set(true);
    this.showHealingField.set(false);
    this.showAddAbilityForm.set(true);
  }

  editAbility(ability: Ability) {
    this.editingAbilityId.set(ability.id);
    this.abilityForm.patchValue({
      name: ability.name,
      type: ability.type,
      range: ability.range || 0,
      areaShape: ability.areaShape || 'none',
      damage: ability.damage || '',
      damageType: ability.damageType || 'slashing',
      healing: ability.healing || '',
      description: ability.description || '',
      attackBonus: ability.attackBonus || 0,
      damageBonus: ability.damageBonus || 0,
      isProficient: ability.isProficient !== undefined ? ability.isProficient : true,
      isOffHand: ability.isOffHand || false,
      category: ability.category || 'feature',
      spellLevel: ability.spellLevel || 0,
      uses: ability.uses || 0,
      maxUses: ability.maxUses || 0
    });
    
    this.showDamageField.set(!!ability.damage || (!ability.damage && !ability.healing));
    this.showHealingField.set(!!ability.healing);

    this.showAddAbilityForm.set(true);
  }

  cancelAbilityForm() {
    this.showAddAbilityForm.set(false);
    this.editingAbilityId.set(null);
    this.abilityForm.reset();
  }

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
    spellUses: new FormControl(0, { nonNullable: true }),
    maxSpellUses: new FormControl(0, { nonNullable: true }),
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
    damage: new FormControl('', { nonNullable: true, validators: [Validators.pattern(/^\d*(d\d+)?$/i)] }),
    damageType: new FormControl('slashing', { nonNullable: true }),
    healing: new FormControl('', { nonNullable: true, validators: [Validators.pattern(/^\d*(d\d+)?$/i)] }),
    description: new FormControl('', { nonNullable: true }),
    attackBonus: new FormControl(0, { nonNullable: true }),
    damageBonus: new FormControl(0, { nonNullable: true }),
    isProficient: new FormControl(true, { nonNullable: true }),
    isOffHand: new FormControl(false, { nonNullable: true }),
    category: new FormControl<'weapon' | 'spell' | 'feature' | 'item_effect'>('feature', { nonNullable: true }),
    spellLevel: new FormControl(0, { nonNullable: true }),
    uses: new FormControl(0, { nonNullable: true }),
    maxUses: new FormControl(0, { nonNullable: true })
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
  itemEffects = computed(() => this.abilities().filter(a => a.category === 'item_effect'));

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
    const currentEditingId = this.editingAbilityId();
    
    const newAbility: Ability = {
      ...(formValue as Omit<Ability, 'id'>),
      damage: this.showDamageField() ? formValue.damage : '',
      healing: this.showHealingField() ? formValue.healing : '',
      id: currentEditingId ? currentEditingId : Math.random().toString(36).substring(2, 9),
      // Add default AoE params based on shape if missing
      ...(formValue.areaShape === 'circle' ? { radius: 6 } : {}),
      ...(formValue.areaShape === 'cone' ? { angle: 60 } : {}),
      ...(formValue.areaShape === 'line' ? { width: 1.5, length: formValue.range } : {}),
      ...(formValue.areaShape === 'rectangle' ? { width: 6, length: 6 } : {})
    };

    let newAbilities: Ability[];
    if (currentEditingId) {
      newAbilities = (token.abilities || []).map(a => a.id === currentEditingId ? newAbility : a);
    } else {
      newAbilities = [...(token.abilities || []), newAbility];
    }
    
    this.combat.updateToken(token.id, { abilities: newAbilities });

    this.cancelAbilityForm();
  }

  removeAbility(id: string) {
    const token = this.selectedToken();
    if (!token) return;

    const newAbilities = (token.abilities || []).filter(a => a.id !== id);
    this.combat.updateToken(token.id, { abilities: newAbilities });
  }

  removeInventoryItem(itemName: string) {
    const token = this.selectedToken();
    if (!token || !token.sheet || !token.sheet.inventory) return;

    const updatedSheet = { ...token.sheet };
    updatedSheet.inventory = updatedSheet.inventory!.filter(i => i.name !== itemName);

    this.combat.updateToken(token.id, { sheet: updatedSheet });
  }

  totalWeight = computed(() => {
    const sheet = this.selectedToken()?.sheet;
    if (!sheet || !sheet.inventory) return 0;
    return sheet.inventory.reduce((sum, item) => sum + (item.weight || 0) * (item.quantity || 1), 0);
  });

  maxCapacity = computed(() => {
    const str = this.selectedToken()?.sheet?.str || 10;
    return str * 7.5; // Aproximadamente 15 lbs por ponto de força = 7.5 kg
  });

  toggleEquipItem(itemName: string) {
    const token = this.selectedToken();
    if (!token || !token.sheet || !token.sheet.inventory) return;

    const inventory = [...token.sheet.inventory];
    const index = inventory.findIndex(i => i.name === itemName);
    if (index === -1) return;

    inventory[index] = { ...inventory[index], isEquipped: !inventory[index].isEquipped };

    this.combat.updateToken(token.id, { sheet: { ...token.sheet, inventory } });
  }

  dropItem(itemName: string) {
    const token = this.selectedToken();
    if (!token || !token.sheet || !token.sheet.inventory) return;

    const inventory = [...token.sheet.inventory];
    const index = inventory.findIndex(i => i.name === itemName);
    if (index === -1) return;

    const item = inventory[index];
    
    // Diminui a quantidade ou remove se chegar a zero
    if (item.quantity > 1) {
      inventory[index] = { ...item, quantity: item.quantity - 1 };
    } else {
      inventory.splice(index, 1);
    }
    
    // Atualiza a ficha
    this.combat.updateToken(token.id, { sheet: { ...token.sheet, inventory } });

    // Cria o token no mapa do item
    const newItemToken = { // ItemToken
      id: 'drop_' + Date.now().toString(),
      x: token.x,
      y: token.y,
      name: item.name,
      description: 'Item deixado por ' + token.name,
      weight: item.weight,
      quantity: 1,
      isPickedUp: false,
      actions: [],
    };

    // Cria a representação visual para o Grid
    const visualToken = {
      id: newItemToken.id,
      name: item.name,
      x: token.x,
      y: token.y,
      hp: 1,
      maxHp: 1,
      conditions: [],
      controlledBy: 'GM',
      color: '#a855f7',
      type: 'item' as const
    };

    // Adiciona o item
    this.combat.itemTokens.update(items => [...items, newItemToken]);
    this.combat.tokens.update(ts => [...ts, visualToken]);
    
    this.combat.addNotification(`${token.name} soltou 1 ${item.name} no chão.`, 'info');
  }

  isDraggingImage = signal(false);
  private dragStartX = 0;
  private dragStartY = 0;
  private initialOffsetX = 0;
  private initialOffsetY = 0;

  previewImageScale = signal<number | null>(null);
  previewImageOffsetX = signal<number | null>(null);
  previewImageOffsetY = signal<number | null>(null);

  currentImageScale = computed(() => this.previewImageScale() !== null ? this.previewImageScale()! : (this.selectedToken()?.imageScale ?? 1));
  currentImageOffsetX = computed(() => this.previewImageOffsetX() !== null ? this.previewImageOffsetX()! : (this.selectedToken()?.imageOffsetX ?? 0));
  currentImageOffsetY = computed(() => this.previewImageOffsetY() !== null ? this.previewImageOffsetY()! : (this.selectedToken()?.imageOffsetY ?? 0));

  isAuthorizedToEditImage = computed(() => {
    const token = this.selectedToken();
    if (!token) return false;
    return (this.auth.currentUser()?.role === 'GM' && !this.combat.isPlayMode()) || token.controlledBy === this.auth.currentUser()?.id;
  });

  onImageDragStart(event: MouseEvent) {
    if (!this.isAuthorizedToEditImage()) return;
    const token = this.selectedToken();
    if (!token) return;

    event.preventDefault();
    this.isDraggingImage.set(true);
    this.dragStartX = event.clientX;
    this.dragStartY = event.clientY;
    this.initialOffsetX = token.imageOffsetX || 0;
    this.initialOffsetY = token.imageOffsetY || 0;
    this.previewImageOffsetX.set(this.initialOffsetX);
    this.previewImageOffsetY.set(this.initialOffsetY);
  }

  @HostListener('document:mousemove', ['$event'])
  onImageDragMove(event: MouseEvent) {
    if (!this.isDraggingImage()) return;
    
    const token = this.selectedToken();
    if (!token) return;

    const dx = event.clientX - this.dragStartX;
    const dy = event.clientY - this.dragStartY;
    
    const currentScale = this.currentImageScale();
    
    // The container in the right panel is 128px (w-32 h-32).
    // Convert the pixel drag distance into a percentage of the container size.
    const percentDx = (dx / 128) * 100;
    const percentDy = (dy / 128) * 100;

    // Adjust panning speed based on scale so it feels 1:1
    const newOffsetX = this.initialOffsetX + (percentDx / currentScale);
    const newOffsetY = this.initialOffsetY + (percentDy / currentScale);

    this.previewImageOffsetX.set(newOffsetX);
    this.previewImageOffsetY.set(newOffsetY);
  }

  @HostListener('document:mouseup')
  onImageDragEnd() {
    if (!this.isDraggingImage()) return;
    this.isDraggingImage.set(false);
    
    const token = this.selectedToken();
    if (token && this.previewImageOffsetX() !== null && this.previewImageOffsetY() !== null) {
      this.combat.updateToken(token.id, {
        imageOffsetX: this.previewImageOffsetX()!,
        imageOffsetY: this.previewImageOffsetY()!
      });
    }
    
    this.previewImageOffsetX.set(null);
    this.previewImageOffsetY.set(null);
  }

  private wheelTimeout: ReturnType<typeof setTimeout> | undefined;

  onImageWheel(event: WheelEvent) {
    if (!this.isAuthorizedToEditImage()) return;
    const token = this.selectedToken();
    if (!token) return;

    event.preventDefault();
    
    const zoomSensitivity = 0.1;
    const currentScale = this.currentImageScale();
    let newScale = currentScale;

    if (event.deltaY < 0) {
      newScale += zoomSensitivity; // Zoom in
    } else {
      newScale -= zoomSensitivity; // Zoom out
    }

    // Clamp scale
    newScale = Math.max(0.1, Math.min(newScale, 5));

    this.previewImageScale.set(newScale);

    // Debounce the save to campaign
    clearTimeout(this.wheelTimeout);
    this.wheelTimeout = setTimeout(() => {
      if (this.previewImageScale() !== null) {
        this.combat.updateToken(token.id, {
          imageScale: this.previewImageScale()!
        });
        this.previewImageScale.set(null);
      }
    }, 500);
  }

  resetImageAdjustment() {
    const token = this.selectedToken();
    if (!token) return;
    
    this.previewImageScale.set(null);
    this.previewImageOffsetX.set(null);
    this.previewImageOffsetY.set(null);
    
    this.combat.updateToken(token.id, {
      imageScale: 1,
      imageOffsetX: 0,
      imageOffsetY: 0
    });
  }

  updateImageAdjustment(property: 'scale' | 'offsetX' | 'offsetY', value: string | number) {
    const token = this.selectedToken();
    if (!token) return;
    
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    
    if (property === 'scale') {
      this.previewImageScale.set(numValue);
      clearTimeout(this.wheelTimeout);
      this.wheelTimeout = setTimeout(() => {
        if (this.previewImageScale() !== null) {
          this.combat.updateToken(token.id, { imageScale: this.previewImageScale()! });
          this.previewImageScale.set(null);
        }
      }, 500);
    }
  }

  selectAbilityForRoll(ability: Ability) {
    this.selectedAbilityForRoll.set(ability);
    this.lastAbilityResult.set(null);
    this.cancelManualAbilityRoll();
  }

  startManualAbilityRoll(type: 'attack' | 'damage') {
    if (type === 'attack') {
      this.isManualRollingAttack.set(true);
      this.manualAttackRollValue.set(null);
    } else {
      this.isManualRollingDamage.set(true);
      this.manualDamageRollValue.set(null);
    }
    this.rollError.set(null);
  }

  cancelManualAbilityRoll() {
    this.isManualRollingAttack.set(false);
    this.manualAttackRollValue.set(null);
    this.isManualRollingDamage.set(false);
    this.manualDamageRollValue.set(null);
    this.rollError.set(null);
  }

  confirmAbilityRoll(type: 'attack' | 'damage') {
    const ability = this.selectedAbilityForRoll();
    const token = this.selectedToken();
    if (!ability || !token) return;

    if (type === 'attack') {
      const val = this.manualAttackRollValue();
      if (val === null || val < 1 || val > 20 || !Number.isInteger(val)) {
        this.rollError.set('Valor não condizente com dado (1 a 20)');
        return;
      }
      this.rollError.set(null);
      this.isManualRollingAttack.set(false);
      this.rollAbilityAttack(val);
    } else {
      const val = this.manualDamageRollValue();
      // For damage, we don't know the exact max value easily without parsing the dice string,
      // but we can just accept any positive integer.
      if (val === null || val < 1 || !Number.isInteger(val)) {
        this.rollError.set('Valor não condizente com dado (maior que 0)');
        return;
      }
      this.rollError.set(null);
      this.isManualRollingDamage.set(false);
      this.rollAbilityDamage(val);
    }
  }

  rollAbilityAttack(manualRoll: number) {
    const ability = this.selectedAbilityForRoll();
    const token = this.selectedToken();
    if (!ability || !token) return;

    const strMod = this.mathService.calculateModifier(token.sheet?.str || 10);
    const profBonus = token.sheet?.proficiencyBonus || 2;
    const magicBonus = ability.attackBonus || 0;

    const isCritical = manualRoll === 20;
    const isCriticalFail = manualRoll === 1;
    const modifiers = strMod + profBonus + magicBonus;
    const total = manualRoll + modifiers;

    let log = `d20: [${manualRoll}] + Mod: ${strMod} + Prof: ${profBonus}`;
    if (magicBonus) log += ` + Magia: ${magicBonus}`;
    log += ` = ${total}`;

    if (isCritical) log += ' (CRÍTICO!)';
    if (isCriticalFail) log += ' (FALHA CRÍTICA!)';

    const roll: ActionResult = {
      total,
      naturalRoll: manualRoll,
      modifiers,
      isCritical,
      isCriticalFail,
      log
    };

    // Default DC for attack is target AC, but we don't have a target here.
    // We'll just assume a default DC of 15 for the UI success/fail, or just show the total.
    const dc = 15; 
    const hitCheck = { success: total >= dc || isCritical };

    const currentResult = this.lastAbilityResult() || {};
    this.lastAbilityResult.set({
      ...currentResult,
      attack: { success: hitCheck.success, roll, dc }
    });
  }

  rollAbilityDamage(manualRoll: number) {
    const ability = this.selectedAbilityForRoll();
    if (!ability) return;

    const currentResult = this.lastAbilityResult() || {};
    
    if (ability.damage) {
      this.lastAbilityResult.set({
        ...currentResult,
        damage: { total: manualRoll, log: `Dano manual: ${manualRoll} (${ability.damage})` }
      });
    } else if (ability.healing) {
      this.lastAbilityResult.set({
        ...currentResult,
        healing: { total: manualRoll, log: `Cura manual: ${manualRoll} (${ability.healing})` }
      });
    }
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
        spellUses: token.spellUses || 0,
        maxSpellUses: token.maxSpellUses || 0
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
        spellUses: token.spellUses || 0,
        maxSpellUses: token.maxSpellUses || 0,
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
      spellUses: sheetData.spellUses,
      maxSpellUses: sheetData.maxSpellUses
    });
    this.isEditingSheet.set(false);
  }

  saveInventory() {
    const token = this.selectedToken();
    if (!token) return;

    const backpack = this.inventoryForm.value;
    
    // Create a default sheet if it doesn't exist to satisfy the type
    const currentSheet: CharacterSheet = token.sheet || {
      class: '', level: 1, background: '', playerName: '', race: '', alignment: '', xp: 0, hitDie: 10,
      str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10,
      ac: 10, initiative: 0, speed: 9, proficiencyBonus: 2, passivePerception: 10,
      hp: token.hp, maxHp: token.maxHp, spellUses: token.spellUses || 0, maxSpellUses: token.maxSpellUses || 0
    };

    this.combat.updateToken(token.id, { 
      sheet: { ...currentSheet, backpack }
    });
    this.isEditingInventory.set(false);
  }

  saveItemDetails() {
    const token = this.selectedToken();
    if (!token) return;

    const backpack = this.inventoryForm.value;
    const gp = this.itemValueControl.value;
    
    // Create a default sheet if it doesn't exist to satisfy the type
    const currentSheet: CharacterSheet = token.sheet || {
      class: '', level: 1, background: '', playerName: '', race: '', alignment: '', xp: 0, hitDie: 10,
      str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10,
      ac: 10, initiative: 0, speed: 9, proficiencyBonus: 2, passivePerception: 10,
      hp: token.hp, maxHp: token.maxHp, spellUses: token.spellUses || 0, maxSpellUses: token.maxSpellUses || 0
    };

    this.combat.updateToken(token.id, { 
      sheet: { ...currentSheet, backpack, gp }
    });
    this.isEditingInventory.set(false);
  }

  cancelEditSheet() {
    this.isEditingSheet.set(false);
  }
}
