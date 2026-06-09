import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CombatService, AVAILABLE_CONDITIONS } from '../../services/combat.service';
import { TokenCondition } from '../../models/token';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-gm-panel',
  standalone: true,
  imports: [CommonModule, MatIconModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'flex flex-col h-full w-96 md:w-[420px] bg-stone-900 border-r border-stone-800 text-stone-300 relative z-20 shadow-2xl shrink-0 transition-all duration-300'
  },
  template: `
      <!-- Tabs -->
      <div class="flex shrink-0 border-b border-stone-800 text-[10px] font-mono">
        <button class="flex-1 py-3 transition-colors" [class.text-amber-500]="activeTab() === 'map'" [class.border-b-2]="activeTab() === 'map'" [class.border-amber-500]="activeTab() === 'map'" [class.bg-stone-800]="activeTab() === 'map'" (click)="activeTab.set('map')">MAPA</button>
        <button class="flex-1 py-3 transition-colors" [class.text-amber-500]="activeTab() === 'tokens'" [class.border-b-2]="activeTab() === 'tokens'" [class.border-amber-500]="activeTab() === 'tokens'" [class.bg-stone-800]="activeTab() === 'tokens'" (click)="activeTab.set('tokens')">TOKENS</button>
        <button class="flex-1 py-3 transition-colors" [class.text-amber-500]="activeTab() === 'combat'" [class.border-b-2]="activeTab() === 'combat'" [class.border-amber-500]="activeTab() === 'combat'" [class.bg-stone-800]="activeTab() === 'combat'" (click)="activeTab.set('combat')">COMBATE</button>
        <button class="flex-1 py-3 transition-colors" [class.text-amber-500]="activeTab() === 'dmg'" [class.border-b-2]="activeTab() === 'dmg'" [class.border-amber-500]="activeTab() === 'dmg'" [class.bg-stone-800]="activeTab() === 'dmg'" (click)="activeTab.set('dmg')">REGRAS DMG</button>
      </div>
      
      <!-- Content Area -->
      <div class="flex-1 overflow-auto relative">
        
        @if (activeTab() === 'map') {
          <div class="p-4 space-y-6">
            <!-- Map Background Settings -->
            <div class="space-y-4">
              <div class="space-y-2">
                <div class="flex justify-between items-center border-b border-stone-700 pb-1">
                  <h3 class="font-bold text-amber-500 flex items-center gap-2"><mat-icon style="font-size:16px;width:16px;height:16px;">image</mat-icon>Fundo do Mapa</h3>
                  <button (click)="clearMap()" class="text-[10px] bg-red-900/50 hover:bg-red-900 text-red-200 px-2 py-0.5 rounded border border-red-900 transition-colors" title="Remove todos os tokens e o fundo">
                    Limpar Mapa
                  </button>
                </div>
                <div class="flex flex-col gap-2">
                  <div class="flex flex-col gap-1">
                    <label for="mapBgInput" class="text-xs text-stone-400 flex items-center gap-1"><mat-icon style="font-size:12px;width:12px;height:12px;">link</mat-icon>URL da Imagem</label>
                    <input id="mapBgInput" type="text" 
                           [value]="combat.mapBackgroundImage() || ''" 
                           (change)="updateMapBackground($event)"
                           placeholder="https://exemplo.com/mapa.jpg"
                           class="bg-stone-800 border border-stone-700 rounded px-2 py-1 text-sm focus:outline-none focus:border-amber-500">
                  </div>
                  <div class="flex flex-col gap-1">
                    <label for="mapBgUpload" class="text-xs text-stone-400">Ou Enviar Imagem</label>
                    <input id="mapBgUpload" type="file" accept="image/*"
                           (change)="uploadMapBackground($event)"
                           class="text-xs text-stone-400 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-stone-700 file:text-amber-500 hover:file:bg-stone-600 cursor-pointer">
                  </div>
                </div>
              </div>

              <!-- Fog of War Settings -->
              <div class="space-y-3 pt-4 border-t border-stone-800">
                <h3 class="font-bold text-amber-500 flex items-center gap-2">
                  <mat-icon style="font-size: 18px; width: 18px; height: 18px;">cloud</mat-icon>
                  Névoa de Guerra
                </h3>
                
                <div class="flex flex-col gap-3">
                  <div class="flex items-center justify-between">
                    <span class="text-xs text-stone-400">Ativar Névoa</span>
                    <button (click)="combat.isFogEnabled.set(!combat.isFogEnabled())" 
                            class="w-10 h-5 rounded-full transition-colors relative"
                            [class.bg-amber-600]="combat.isFogEnabled()"
                            [class.bg-stone-700]="!combat.isFogEnabled()">
                      <div class="absolute top-1 w-3 h-3 bg-white rounded-full transition-all"
                           [style.left.px]="combat.isFogEnabled() ? 22 : 4"></div>
                    </button>
                  </div>

                  <div class="flex items-center justify-between">
                    <span class="text-xs text-stone-400">Modo Edição</span>
                    <button (click)="combat.isFogEditMode.set(!combat.isFogEditMode())" 
                            class="w-10 h-5 rounded-full transition-colors relative"
                            [class.bg-amber-600]="combat.isFogEditMode()"
                            [class.bg-stone-700]="!combat.isFogEditMode()">
                      <div class="absolute top-1 w-3 h-3 bg-white rounded-full transition-all"
                           [style.left.px]="combat.isFogEditMode() ? 22 : 4"></div>
                    </button>
                  </div>

                  @if (combat.isFogEditMode()) {
                    <div class="p-2 bg-stone-800/50 rounded border border-stone-700 space-y-2">
                      <div class="flex gap-2">
                        <button (click)="combat.fogBrushType.set('reveal')" 
                                class="flex-1 py-1.5 rounded text-[10px] font-bold border transition-colors flex items-center justify-center gap-1"
                                [class.bg-amber-600]="combat.fogBrushType() === 'reveal'"
                                [class.text-stone-900]="combat.fogBrushType() === 'reveal'"
                                [class.border-amber-500]="combat.fogBrushType() === 'reveal'"
                                [class.bg-stone-800]="combat.fogBrushType() !== 'reveal'"
                                [class.text-stone-400]="combat.fogBrushType() !== 'reveal'"
                                [class.border-stone-700]="combat.fogBrushType() !== 'reveal'">
                          <mat-icon style="font-size: 14px; width: 14px; height: 14px;">visibility</mat-icon> REVELAR
                        </button>
                        <button (click)="combat.fogBrushType.set('hide')" 
                                class="flex-1 py-1.5 rounded text-[10px] font-bold border transition-colors flex items-center justify-center gap-1"
                                [class.bg-stone-600]="combat.fogBrushType() === 'hide'"
                                [class.text-stone-100]="combat.fogBrushType() === 'hide'"
                                [class.border-stone-500]="combat.fogBrushType() === 'hide'"
                                [class.bg-stone-800]="combat.fogBrushType() !== 'hide'"
                                [class.text-stone-400]="combat.fogBrushType() !== 'hide'"
                                [class.border-stone-700]="combat.fogBrushType() !== 'hide'">
                          <mat-icon style="font-size: 14px; width: 14px; height: 14px;">visibility_off</mat-icon> ESCONDER
                        </button>
                      </div>
                      <p class="text-[10px] text-stone-500 italic text-center">Clique e arraste no mapa para editar a névoa.</p>
                    </div>
                  }

                  <div class="grid grid-cols-2 gap-2 pt-2">
                    <button (click)="combat.clearFog()" 
                            class="py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 text-[10px] font-bold rounded border border-stone-700 transition-colors">
                      REVELAR TUDO
                    </button>
                    <button (click)="hideAllFog()" 
                            class="py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 text-[10px] font-bold rounded border border-stone-700 transition-colors">
                      ESCONDER TUDO
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        }

        @if (activeTab() === 'tokens') {
          <div class="p-4 space-y-6">
            <!-- Add Token Settings -->
            <div class="space-y-2">
              <h3 class="font-bold text-amber-500 border-b border-stone-700 pb-1 flex items-center gap-2"><mat-icon style="font-size:16px;width:16px;height:16px;">add_circle</mat-icon>Adicionar Novo Token</h3>
              <div class="flex flex-col gap-2">
                <label for="newTokenType" class="text-xs text-stone-400">Tipo de Token</label>
                <select id="newTokenType" #newTokenType class="bg-stone-800 border border-stone-700 rounded px-2 py-1 text-sm focus:outline-none focus:border-amber-500">
                  <option value="player">Jogador (Borda Amarela)</option>
                  <option value="enemy">Inimigo (Borda Vermelha)</option>
                  <option value="npc">NPC (Borda Azul)</option>
                  <option value="boss">Chefe (Borda Preta)</option>
                  <option value="item">Item (Borda Roxa, Quadrado)</option>
                </select>
                <button class="w-full py-1 bg-amber-600 hover:bg-amber-500 text-stone-900 font-bold rounded text-xs transition-colors mt-1"
                        (click)="addToken(newTokenType.value)">
                  Adicionar Token ao Mapa
                </button>
              </div>
            </div>

            <!-- Selected Token Settings -->
            <div class="space-y-2">
              <h3 class="font-bold text-amber-500 border-b border-stone-700 pb-1 flex items-center gap-2"><mat-icon style="font-size:16px;width:16px;height:16px;">token</mat-icon>Token Selecionado</h3>
              
              @if (selectedToken()) {
                <div class="space-y-3">
                  <div class="flex flex-col gap-1">
                    <label for="tokenNameInput" class="text-xs text-stone-400 flex items-center gap-1"><mat-icon style="font-size:12px;width:12px;height:12px;">badge</mat-icon>Nome do Token</label>
                    <input id="tokenNameInput" type="text" 
                           [value]="selectedToken()?.name" 
                           (change)="updateTokenField('name', $event)"
                           class="bg-stone-800 border border-amber-500/30 rounded px-3 py-2 text-sm focus:outline-none focus:border-amber-500 font-bold text-amber-500">
                  </div>
                  
                  <div class="flex flex-col gap-2">
                    <div class="flex flex-col gap-1">
                      <label for="tokenImgInput" class="text-xs text-stone-400 flex items-center gap-1"><mat-icon style="font-size:12px;width:12px;height:12px;">link</mat-icon>URL da Imagem</label>
                      <input id="tokenImgInput" type="text" 
                             [value]="selectedToken()?.imageUrl || ''" 
                             (change)="updateTokenField('imageUrl', $event)"
                             placeholder="https://exemplo.com/avatar.jpg"
                             class="bg-stone-800 border border-stone-700 rounded px-2 py-1 text-sm focus:outline-none focus:border-amber-500">
                    </div>
                    <div class="flex flex-col gap-1">
                      <label for="tokenImgUpload" class="text-xs text-stone-400">Ou Enviar Imagem</label>
                      <input id="tokenImgUpload" type="file" accept="image/*"
                             (change)="uploadTokenImage($event)"
                             class="text-xs text-stone-400 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-stone-700 file:text-amber-500 hover:file:bg-stone-600 cursor-pointer">
                    </div>
                  </div>

                  <!-- Condições do Token -->
                  <div class="pt-4 border-t border-stone-700 mt-4 space-y-3">
                    <h4 class="text-xs font-bold text-amber-500 uppercase tracking-wider">Condições</h4>
                    
                    <div class="space-y-3 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
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
                  </div>

                  <div class="pt-4 border-t border-stone-700 mt-4">
                    @if (tokenToDelete() === selectedToken()?.id) {
                      <div class="bg-red-900/30 border border-red-500/50 rounded p-3 text-sm flex flex-col gap-2">
                        <span class="text-red-400 font-bold text-xs">Tem certeza que deseja excluir este token?</span>
                        <div class="flex gap-2">
                          <button class="flex-1 py-1 bg-red-600 hover:bg-red-500 text-white font-bold rounded text-xs transition-colors" (click)="confirmDeleteToken()">Sim, Excluir</button>
                          <button class="flex-1 py-1 bg-stone-700 hover:bg-stone-600 text-white font-bold rounded text-xs transition-colors" (click)="tokenToDelete.set(null)">Cancelar</button>
                        </div>
                      </div>
                    } @else {
                      <button class="w-full py-2 bg-red-900/20 hover:bg-red-900/50 border border-red-900/50 hover:border-red-500 text-red-400 hover:text-red-300 font-bold rounded text-xs transition-colors flex items-center justify-center gap-2"
                              (click)="tokenToDelete.set(selectedToken()?.id || null)">
                        <mat-icon style="font-size: 16px; width: 16px; height: 16px;">delete</mat-icon> Excluir Token
                      </button>
                    }
                  </div>
                </div>
              } @else {
                <div class="text-sm text-stone-500 italic p-4 text-center border border-dashed border-stone-700 rounded">
                  Selecione um token no mapa para editá-lo.
                </div>
              }
            </div>

          </div>
        }
        
        @if (activeTab() === 'combat') {
          <div class="p-4 space-y-6">
            <div class="space-y-4">
              <div class="flex items-center justify-between border-b border-stone-700 pb-2">
                <h3 class="font-bold text-amber-500 flex items-center gap-2">
                  <mat-icon style="font-size: 18px; width: 18px; height: 18px;">swords</mat-icon>
                  Rastreador de Combate
                </h3>
              </div>
              
              <div class="space-y-4">
                @if (!combat.combatActive()) {
                  <button class="w-full bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold py-2 px-4 rounded shadow transition-colors flex justify-center items-center gap-2"
                          (click)="combat.startCombat()">
                    <mat-icon style="font-size: 18px; width: 18px; height: 18px;">play_arrow</mat-icon>
                    Iniciar Combate
                  </button>
                } @else {
                  <div class="flex gap-2">
                    <button class="flex-1 bg-stone-700 hover:bg-stone-600 text-white font-bold py-2 px-2 rounded shadow transition-colors text-xs flex justify-center items-center gap-1"
                            (click)="combat.previousTurn()">
                      <mat-icon style="font-size: 16px; width: 16px; height: 16px;">navigate_before</mat-icon> Anterior
                    </button>
                    <button class="flex-1 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold py-2 px-2 rounded shadow transition-colors text-xs flex justify-center items-center gap-1"
                            (click)="combat.nextTurn()">
                      Próximo <mat-icon style="font-size: 16px; width: 16px; height: 16px;">navigate_next</mat-icon>
                    </button>
                  </div>
                  <button class="w-full bg-red-900/50 hover:bg-red-800 text-red-100 font-bold py-2 px-4 rounded border border-red-900 transition-colors flex justify-center items-center gap-2"
                          (click)="combat.endCombat()">
                    <mat-icon style="font-size: 18px; width: 18px; height: 18px;">stop</mat-icon>
                    Encerrar Combate
                  </button>
                }
              </div>

              <!-- List of tokens to set initiative -->
              <div class="pt-4 border-t border-stone-800">
                <h4 class="text-xs font-bold text-amber-500 mb-3 uppercase tracking-wider flex items-center gap-1.5"><mat-icon style="font-size:14px;width:14px;height:14px;">timer</mat-icon>Definir Iniciativas</h4>
                <div class="space-y-2 max-h-[60vh] overflow-y-auto custom-scrollbar pr-1">
                  @for (token of combat.tokens(); track token.id) {
                    @if (token.type !== 'item') {
                      <div class="flex items-center gap-2 bg-stone-800/50 p-2 rounded border border-stone-700">
                        <div class="w-6 h-6 rounded-full border border-stone-600 overflow-hidden shrink-0 bg-stone-900">
                           @if (token.imageUrl) {
                             <img [src]="token.imageUrl" class="w-full h-full object-cover" alt="Miniatura">
                           } @else {
                             <div class="w-full h-full" [style.backgroundColor]="token.color"></div>
                           }
                        </div>
                        <span class="flex-1 text-xs truncate max-w-[120px]" 
                              [class.text-red-400]="token.type === 'enemy' || token.type === 'boss'"
                              [class.text-blue-400]="token.type === 'npc'"
                              [class.text-stone-200]="token.type === 'player'">
                          {{ token.name }}
                        </span>
                        <input type="number" 
                               [value]="token.initiative !== undefined ? token.initiative : ''"
                               (change)="updateInitiative(token.id, $event)"
                               placeholder="10"
                               class="w-16 bg-stone-900 border border-stone-600 rounded-lg px-1.5 py-1.5 text-xs text-center focus:outline-none focus:border-amber-500 font-mono text-amber-500 font-bold">
                      </div>
                    }
                  }
                </div>
              </div>

            </div>
          </div>
        }

        @if (activeTab() === 'dmg') {
          <div class="p-4 space-y-6">
            <!-- Title -->
            <div class="border-b border-stone-800 pb-2">
              <h3 class="font-bold text-amber-500 flex items-center gap-2">
                <mat-icon style="font-size: 18px; width: 18px; height: 18px;">gavel</mat-icon>
                Painel Guia do Mestre
              </h3>
              <p class="text-[10px] text-stone-500 mt-1">Ferramentas oficiais baseadas no Guia do Mestre (DMG) 5e.</p>
            </div>

            <!-- Calculadora de Queda -->
            <div class="space-y-2 bg-stone-950/40 p-3 rounded-xl border border-stone-800">
              <h4 class="text-xs font-bold text-stone-200 flex items-center gap-1.5">
                <mat-icon class="text-amber-600" style="font-size:14px;width:14px;height:14px;">south</mat-icon>
                Dano de Queda
              </h4>
              <div class="flex gap-2 items-center">
                <input type="number" [(ngModel)]="fallDistance" placeholder="Metros" 
                       class="w-20 bg-stone-900 border border-stone-700 rounded px-2 py-1 text-xs text-amber-500 font-bold focus:outline-none">
                <span class="text-xs text-stone-500">m</span>
                <button (click)="rollFallDamage()" 
                        class="flex-1 py-1 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold rounded text-[10px] uppercase tracking-wider transition-colors">
                  Rolar Dano
                </button>
              </div>
              @if (fallLog()) {
                <div class="p-2 bg-stone-900 rounded text-[10px] font-mono text-amber-400 border border-stone-800 mt-2 break-words">
                  {{ fallLog() }}
                </div>
              }
            </div>

            <!-- Dano Ambiental -->
            <div class="space-y-2 bg-stone-950/40 p-3 rounded-xl border border-stone-800">
              <h4 class="text-xs font-bold text-stone-200 flex items-center gap-1.5">
                <mat-icon class="text-amber-600" style="font-size:14px;width:14px;height:14px;">thunderstorm</mat-icon>
                Dano Ambiental
              </h4>
              <div class="grid grid-cols-2 gap-2">
                <div class="flex flex-col gap-1">
                  <span class="text-[9px] text-stone-500">Nível</span>
                  <input type="number" [(ngModel)]="envLevel" min="1" max="20"
                         class="bg-stone-900 border border-stone-700 rounded px-2 py-1 text-xs text-amber-500 font-bold">
                </div>
                <div class="flex flex-col gap-1">
                  <span class="text-[9px] text-stone-500">Gravidade</span>
                  <select [(ngModel)]="envSeverity" class="bg-stone-900 border border-stone-700 rounded px-1.5 py-1 text-xs text-stone-300">
                    <option value="nuisance">Inconveniente</option>
                    <option value="dangerous">Perigoso</option>
                    <option value="deadly">Mortal</option>
                  </select>
                </div>
              </div>
              <button (click)="rollEnvironmentalDamage()" 
                      class="w-full py-1 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold rounded text-[10px] uppercase tracking-wider transition-colors mt-2">
                Rolar Dano Ambiental
              </button>
              @if (envLog()) {
                <div class="p-2 bg-stone-900 rounded text-[10px] font-mono text-amber-400 border border-stone-800 mt-2 break-words">
                  {{ envLog() }}
                </div>
              }
            </div>

            <!-- XP de Encontro -->
            <div class="space-y-2 bg-stone-950/40 p-3 rounded-xl border border-stone-800">
              <h4 class="text-xs font-bold text-stone-200 flex items-center gap-1.5">
                <mat-icon class="text-amber-600" style="font-size:14px;width:14px;height:14px;">stars</mat-icon>
                Calculadora de XP
              </h4>
              <div class="flex gap-2">
                <select [(ngModel)]="selectedCRToAdd" class="flex-1 bg-stone-900 border border-stone-700 rounded px-1.5 py-1 text-xs text-stone-300">
                  <option value="0">ND 0 (10 XP)</option>
                  <option value="1/8">ND 1/8 (25 XP)</option>
                  <option value="1/4">ND 1/4 (50 XP)</option>
                  <option value="1/2">ND 1/2 (100 XP)</option>
                  <option value="1">ND 1 (200 XP)</option>
                  <option value="2">ND 2 (450 XP)</option>
                  <option value="3">ND 3 (700 XP)</option>
                  <option value="4">ND 4 (1.100 XP)</option>
                  <option value="5">ND 5 (1.800 XP)</option>
                  <option value="6">ND 6 (2.300 XP)</option>
                  <option value="7">ND 7 (2.900 XP)</option>
                  <option value="8">ND 8 (3.900 XP)</option>
                  <option value="9">ND 9 (5.000 XP)</option>
                  <option value="10">ND 10 (5.900 XP)</option>
                  <option value="11">ND 11 (7.200 XP)</option>
                  <option value="12">ND 12 (8.400 XP)</option>
                  <option value="13">ND 13 (10.000 XP)</option>
                  <option value="14">ND 14 (11.500 XP)</option>
                  <option value="15">ND 15 (13.000 XP)</option>
                  <option value="20">ND 20 (25.000 XP)</option>
                  <option value="30">ND 30 (155.000 XP)</option>
                </select>
                <button (click)="addCR()" 
                        class="px-3 py-1 bg-stone-800 hover:bg-stone-700 text-amber-500 border border-stone-700 rounded text-xs font-bold transition-colors">
                  +
                </button>
              </div>
              
              @if (encounterCRs().length > 0) {
                <div class="flex flex-wrap gap-1 py-1">
                  @for (cr of encounterCRs(); track $index) {
                    <span class="bg-stone-800 text-[10px] text-stone-300 px-2 py-0.5 rounded border border-stone-700 flex items-center gap-1">
                      ND {{ cr }}
                      <button (click)="removeCR($index)" class="text-red-500 hover:text-red-400 font-bold">×</button>
                    </span>
                  }
                </div>
                <div class="flex gap-2 items-center">
                  <span class="text-[10px] text-stone-500">Membros do Grupo:</span>
                  <input type="number" [(ngModel)]="encounterPartySize" (change)="calculateXP()"
                         class="w-12 bg-stone-900 border border-stone-700 rounded px-1.5 py-0.5 text-xs text-center font-bold text-amber-500">
                </div>
                <div class="flex gap-2 pt-1">
                  <button (click)="calculateXP()" class="flex-1 py-1 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold rounded text-[10px] uppercase">Recalcular</button>
                  <button (click)="clearCRs()" class="py-1 px-2 bg-stone-850 hover:bg-stone-800 border border-stone-700 text-stone-400 hover:text-stone-200 rounded text-[10px] uppercase">Limpar</button>
                </div>
              }

              @if (xpLog()) {
                <div class="p-2 bg-stone-900 rounded text-[10px] font-mono text-amber-400 border border-stone-800 mt-2 whitespace-pre-line">
                  {{ xpLog() }}
                </div>
              }
            </div>

            <!-- Estimador de AoE -->
            <div class="space-y-2 bg-stone-950/40 p-3 rounded-xl border border-stone-800">
              <h4 class="text-xs font-bold text-stone-200 flex items-center gap-1.5">
                <mat-icon class="text-amber-600" style="font-size:14px;width:14px;height:14px;">animation</mat-icon>
                Estimador de Alvos AoE
              </h4>
              <div class="grid grid-cols-2 gap-2">
                <div class="flex flex-col gap-1">
                  <span class="text-[9px] text-stone-500">Forma</span>
                  <select [(ngModel)]="aoeShape" (change)="updateAoeEstimation()" class="bg-stone-900 border border-stone-700 rounded px-1.5 py-1 text-xs text-stone-300">
                    <option value="cone">Cone</option>
                    <option value="cube">Cubo/Quadrado</option>
                    <option value="cylinder">Cilindro</option>
                    <option value="sphere">Esfera</option>
                    <option value="line">Linha</option>
                  </select>
                </div>
                <div class="flex flex-col gap-1">
                  <span class="text-[9px] text-stone-500">Tamanho (m)</span>
                  <input type="number" [(ngModel)]="aoeSize" (change)="updateAoeEstimation()"
                         class="bg-stone-900 border border-stone-700 rounded px-2 py-1 text-xs text-amber-500 font-bold">
                </div>
              </div>
              <div class="flex justify-between items-center bg-stone-900/60 p-2 rounded border border-stone-800 text-[11px] mt-1">
                <span class="text-stone-400">Alvos Estimados:</span>
                <span class="text-amber-500 font-bold text-sm font-mono">{{ aoeTargets() }}</span>
              </div>
            </div>

            <!-- Objetos (AC & HP) -->
            <div class="space-y-2 bg-stone-950/40 p-3 rounded-xl border border-stone-800">
              <h4 class="text-xs font-bold text-stone-200 flex items-center gap-1.5">
                <mat-icon class="text-amber-600" style="font-size:14px;width:14px;height:14px;">door_open</mat-icon>
                Durabilidade de Objetos
              </h4>
              <div class="grid grid-cols-2 gap-2">
                <div class="flex flex-col gap-1">
                  <span class="text-[9px] text-stone-500">Material</span>
                  <select [(ngModel)]="objectMaterial" (change)="updateObjectStats()" class="bg-stone-900 border border-stone-700 rounded px-1.5 py-1 text-xs text-stone-300">
                    <option value="tecido">Tecido / Papel</option>
                    <option value="vidro">Cristal / Vidro</option>
                    <option value="madeira">Madeira / Osso</option>
                    <option value="pedra">Pedra</option>
                    <option value="ferro">Ferro / Aço</option>
                    <option value="mitral">Mitral</option>
                    <option value="adamante">Adamante</option>
                  </select>
                </div>
                <div class="flex flex-col gap-1">
                  <span class="text-[9px] text-stone-500">Tamanho</span>
                  <select [(ngModel)]="objectSize" (change)="updateObjectStats()" class="bg-stone-900 border border-stone-700 rounded px-1.5 py-1 text-xs text-stone-300">
                    <option value="tiny">Miúdo (1d4)</option>
                    <option value="small">Pequeno (3d6)</option>
                    <option value="medium">Médio (4d8)</option>
                    <option value="large">Grande (5d10)</option>
                  </select>
                </div>
              </div>
              <div class="flex items-center gap-2 mt-1">
                <input type="checkbox" id="objResilient" [(ngModel)]="objectResilient" (change)="updateObjectStats()" class="rounded border-stone-700 bg-stone-900 text-amber-500 focus:ring-0">
                <label for="objResilient" class="text-[10px] text-stone-400">Objeto Resistente (Resilient HP)</label>
              </div>
              <div class="grid grid-cols-2 gap-2 bg-stone-900/60 p-2 rounded border border-stone-800 text-[11px] text-center font-mono">
                <div>
                  <span class="text-[9px] text-stone-500 block">CA DO MATERIAL</span>
                  <span class="text-amber-500 font-bold text-sm">{{ objectAC() }}</span>
                </div>
                <div>
                  <span class="text-[9px] text-stone-500 block">PV (HP)</span>
                  <span class="text-amber-500 font-bold text-sm">{{ objectHP() }}</span>
                </div>
              </div>
            </div>

            <!-- Venenos -->
            <div class="space-y-2 bg-stone-950/40 p-3 rounded-xl border border-stone-800">
              <h4 class="text-xs font-bold text-stone-200 flex items-center gap-1.5">
                <mat-icon class="text-amber-600" style="font-size:14px;width:14px;height:14px;">science</mat-icon>
                Venenos do Compêndio
              </h4>
              <div class="flex flex-col gap-2">
                <select [(ngModel)]="selectedPoisonName" class="w-full bg-stone-900 border border-stone-700 rounded px-1.5 py-1 text-xs text-stone-300">
                  @for (poison of poisons(); track poison.name) {
                    <option [value]="poison.name">{{ poison.name }} ({{ poison.priceGp }} po)</option>
                  }
                </select>
                
                @if (getSelectedPoison()) {
                  <div class="p-2.5 bg-stone-900/80 rounded border border-stone-800 text-[10px] space-y-1">
                    <div><span class="text-stone-500 font-bold">Tipo:</span> <span class="text-stone-300 capitalize">{{ getSelectedPoison()?.type }}</span></div>
                    <div><span class="text-stone-500 font-bold">Resistência:</span> <span class="text-amber-500 font-bold">CON CD {{ getSelectedPoison()?.saveDC }}</span></div>
                    @if (getSelectedPoison()?.damage) {
                      <div><span class="text-stone-500 font-bold">Dano:</span> <span class="text-red-400 font-bold">{{ getSelectedPoison()?.damage }}</span></div>
                    }
                    <div><span class="text-stone-500 font-bold">Efeito:</span> <span class="text-stone-300 leading-relaxed">{{ getSelectedPoison()?.effect }}</span></div>
                  </div>
                }

                <div class="flex gap-2 items-center">
                  <span class="text-[10px] text-stone-500">CON do Afetado:</span>
                  <input type="number" [(ngModel)]="poisonConScore"
                         class="w-12 bg-stone-900 border border-stone-700 rounded px-1.5 py-0.5 text-xs text-center font-bold text-amber-500">
                  <button (click)="rollPoisonSave()" 
                          class="flex-1 py-1 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold rounded text-[10px] uppercase transition-colors">
                    Rolar Save
                  </button>
                </div>

                @if (poisonLog()) {
                  <div class="p-2 bg-stone-900 rounded text-[10px] font-mono text-amber-400 border border-stone-800 mt-1 break-words whitespace-pre-line">
                    {{ poisonLog() }}
                  </div>
                }
              </div>
            </div>

            <!-- Sobrevivência / Forrageamento -->
            <div class="space-y-2 bg-stone-950/40 p-3 rounded-xl border border-stone-800">
              <h4 class="text-xs font-bold text-stone-200 flex items-center gap-1.5">
                <mat-icon class="text-amber-600" style="font-size:14px;width:14px;height:14px;">forest</mat-icon>
                Forrageamento e Sede
              </h4>
              <div class="grid grid-cols-2 gap-2">
                <div class="flex flex-col gap-1">
                  <span class="text-[9px] text-stone-500">Mod Sabedoria</span>
                  <input type="number" [(ngModel)]="forageWisMod"
                         class="bg-stone-900 border border-stone-700 rounded px-2 py-1 text-xs text-amber-500 font-bold">
                </div>
                <div class="flex flex-col gap-1">
                  <span class="text-[9px] text-stone-500">CD do Terreno</span>
                  <select [(ngModel)]="forageDC" class="bg-stone-900 border border-stone-700 rounded px-1.5 py-1 text-xs text-stone-300">
                    <option [value]="10">Farto (10)</option>
                    <option [value]="15">Escasso (15)</option>
                    <option [value]="20">Hostil (20)</option>
                  </select>
                </div>
              </div>
              <div class="flex items-center gap-2 mt-1">
                <input type="checkbox" id="forageProf" [(ngModel)]="forageProficient" class="rounded border-stone-700 bg-stone-900 text-amber-500 focus:ring-0">
                <label for="forageProf" class="text-[10px] text-stone-400">Proficiente em Sobrevivência (+2)</label>
              </div>
              <button (click)="rollForaging()" 
                      class="w-full py-1 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold rounded text-[10px] uppercase tracking-wider transition-colors mt-1">
                Rolar Forrageamento
              </button>
              @if (forageLog()) {
                <div class="p-2 bg-stone-900 rounded text-[10px] font-mono text-amber-400 border border-stone-800 mt-2 break-words">
                  {{ forageLog() }}
                </div>
              }
            </div>

            <!-- Doenças (Compêndio) -->
            <div class="space-y-2 bg-stone-950/40 p-3 rounded-xl border border-stone-800 pb-4">
              <h4 class="text-xs font-bold text-stone-200 flex items-center gap-1.5">
                <mat-icon class="text-amber-600" style="font-size:14px;width:14px;height:14px;">coronavirus</mat-icon>
                Doenças do Compêndio
              </h4>
              <div class="space-y-3 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
                @for (disease of diseases(); track disease.name) {
                  <div class="p-2.5 bg-stone-900/60 rounded border border-stone-800 space-y-1.5 text-[10px]">
                    <div class="flex justify-between items-center border-b border-stone-800 pb-1">
                      <span class="font-bold text-amber-500 text-[11px]">{{ disease.name }}</span>
                      <span class="bg-stone-800 text-stone-400 px-1 rounded text-[8px] uppercase">CON CD {{ disease.saveDC }}</span>
                    </div>
                    <div><span class="text-stone-500 font-bold">Incubação:</span> <span class="text-stone-300">{{ disease.incubation }}</span></div>
                    <div><span class="text-stone-500 font-bold">Sintomas:</span> <span class="text-stone-300 leading-relaxed block mt-0.5">{{ disease.symptoms }}</span></div>
                    <div><span class="text-stone-500 font-bold">Cura:</span> <span class="text-stone-300 leading-relaxed block mt-0.5">{{ disease.cure }}</span></div>
                  </div>
                }
              </div>
            </div>

          </div>
        }

      </div>
  `
})
export class GmPanelComponent {
  combat = inject(CombatService);
  api = inject(ApiService);

  activeTab = signal<'map' | 'tokens' | 'combat' | 'dmg'>('map');
  tokenToDelete = signal<string | null>(null);

  // Fall Damage
  fallDistance = signal<number>(10);
  fallLog = signal<string>('');

  // Environmental Damage
  envLevel = signal<number>(1);
  envSeverity = signal<string>('nuisance');
  envLog = signal<string>('');

  // XP Calculator
  encounterCRs = signal<string[]>([]);
  encounterPartySize = signal<number>(4);
  selectedCRToAdd = signal<string>('1');
  xpLog = signal<string>('');

  // AoE Target Estimator
  aoeShape = signal<string>('cone');
  aoeSize = signal<number>(9);
  aoeTargets = signal<number>(3);

  // Objects
  objectMaterial = signal<string>('madeira');
  objectSize = signal<string>('small');
  objectResilient = signal<boolean>(false);
  objectAC = signal<number>(15);
  objectHP = signal<number>(3);

  // Poisons
  poisons = signal<any[]>([]);
  selectedPoisonName = signal<string>('');
  poisonConScore = signal<number>(10);
  poisonLog = signal<string>('');

  // Diseases
  diseases = signal<any[]>([]);

  // Foraging
  forageWisMod = signal<number>(0);
  forageDC = signal<number>(10);
  forageProficient = signal<boolean>(false);
  forageLog = signal<string>('');

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

  selectedToken = computed(() => {
    const id = this.combat.selectedTokenId();
    if (!id) return null;
    return this.combat.tokens().find(t => t.id === id) || null;
  });

  constructor() {
    this.loadDmgData();
  }

  loadDmgData() {
    this.api.getPoisons().subscribe(p => {
      this.poisons.set(p);
      if (p.length > 0) this.selectedPoisonName.set(p[0].name);
    });
    this.api.getDiseases().subscribe(d => this.diseases.set(d));
    this.updateObjectStats();
    this.updateAoeEstimation();
  }

  rollFallDamage() {
    this.api.getFallDamage(this.fallDistance()).subscribe(res => {
      this.fallLog.set(res.log);
    });
  }

  rollEnvironmentalDamage() {
    this.api.getEnvironmentalDamage(this.envLevel(), this.envSeverity()).subscribe(res => {
      this.envLog.set(res.log);
    });
  }

  addCR() {
    this.encounterCRs.update(crs => [...crs, this.selectedCRToAdd()]);
    this.calculateXP();
  }

  removeCR(index: number) {
    this.encounterCRs.update(crs => crs.filter((_, i) => i !== index));
    this.calculateXP();
  }

  clearCRs() {
    this.encounterCRs.set([]);
    this.xpLog.set('');
  }

  calculateXP() {
    if (this.encounterCRs().length === 0) {
      this.xpLog.set('Adicione monstros para calcular.');
      return;
    }
    this.api.calculateXP({
      challengeRatings: this.encounterCRs(),
      partySize: this.encounterPartySize()
    }).subscribe(res => {
      this.xpLog.set(res.log);
    });
  }

  updateAoeEstimation() {
    this.api.getAoeTargets(this.aoeShape(), this.aoeSize()).subscribe(res => {
      this.aoeTargets.set(res.estimatedTargets);
    });
  }

  updateObjectStats() {
    this.api.getObjectAC(this.objectMaterial()).subscribe(res => {
      this.objectAC.set(res.ac);
    });
    this.api.getObjectHP(this.objectSize(), this.objectResilient()).subscribe(res => {
      this.objectHP.set(res.hp);
    });
  }

  rollPoisonSave() {
    this.api.resolvePoisonSave({
      conScore: this.poisonConScore(),
      poisonName: this.selectedPoisonName(),
      profBonus: 2,
      isProfConSave: false
    }).subscribe(res => {
      this.poisonLog.set(res.log);
    });
  }

  rollForaging() {
    this.api.resolveForage({
      wisMod: this.forageWisMod(),
      dc: this.forageDC(),
      profBonus: 2,
      isProficient: this.forageProficient()
    }).subscribe(res => {
      this.forageLog.set(res.log);
    });
  }

  getSelectedPoison() {
    return this.poisons().find(p => p.name === this.selectedPoisonName());
  }

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

  addToken(type: string) {
    const id = 't' + Math.random().toString(36).substring(2, 9);
    let name = 'Novo Token';
    let color = '#78716c'; // Default stone color
    
    if (type === 'player') { name = 'Novo Jogador'; color = '#3b82f6'; }
    if (type === 'enemy') { name = 'Novo Inimigo'; color = '#ef4444'; }
    if (type === 'npc') { name = 'Novo NPC'; color = '#22c55e'; }
    if (type === 'boss') { name = 'Novo Chefe'; color = '#000000'; }
    if (type === 'item') { name = 'Novo Item'; color = '#a855f7'; }

    this.combat.addToken({
      id,
      name,
      x: 0,
      y: 0,
      hp: 10,
      maxHp: 10,
      spellUses: 0,
      maxSpellUses: 0,
      conditions: [],
      controlledBy: type === 'player' ? 'user_player_1' : 'user_gm_1',
      color,
      type: type as 'player' | 'enemy' | 'npc' | 'boss' | 'item'
    });

    // Automatically select the new token and open the sheet editor
    this.combat.selectToken(id);
    this.combat.rightPanelTab.set('sheet');
    this.combat.triggerEditSheet.update(v => v + 1);
  }

  confirmDeleteToken() {
    const id = this.tokenToDelete();
    if (id) {
      this.combat.deleteToken(id);
      this.combat.selectToken(''); // Deselect
      this.tokenToDelete.set(null);
    }
  }

  updateMapBackground(event: Event) {
    const input = event.target as HTMLInputElement;
    this.combat.setMapBackground(input.value);
  }

  async uploadMapBackground(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    
    const file = input.files[0];
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === 'string') {
        this.combat.setMapBackground(result);
      }
    };
    
    reader.onerror = (error) => {
      console.error('Error reading file:', error);
    };
    
    reader.readAsDataURL(file);
  }

  updateTokenField(field: 'name' | 'hp' | 'maxHp' | 'imageUrl' | 'color', event: Event) {
    const id = this.combat.selectedTokenId();
    if (!id) return;
    
    const input = event.target as HTMLInputElement;
    let value: string | number = input.value;
    
    if (field === 'hp' || field === 'maxHp') {
      value = parseInt(value, 10) || 0;
    }
    
    this.combat.updateToken(id, { [field]: value });
  }

  updateInitiative(tokenId: string, event: Event) {
    const input = event.target as HTMLInputElement;
    const value = input.value ? parseInt(input.value, 10) : undefined;
    this.combat.updateToken(tokenId, { initiative: value });
  }

  hideAllFog() {
    this.combat.hideAllFog(this.combat.mapWidth(), this.combat.mapHeight(), 64);
  }

  async uploadTokenImage(event: Event) {
    const id = this.combat.selectedTokenId();
    if (!id) return;

    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    
    const file = input.files[0];
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === 'string') {
        this.combat.updateToken(id, { imageUrl: result });
      }
    };
    
    reader.onerror = (error) => {
      console.error('Error reading file:', error);
    };
    
    reader.readAsDataURL(file);
  }

  createScene() {
    const name = prompt('Nome da Cena:', `Cena ${this.combat.scenes().length + 1}`);
    if (name) {
      this.combat.createScene(name);
    }
  }

  clearMap() {
    if (confirm('Tem certeza que deseja limpar o mapa? Isso removerá o fundo e TODOS os tokens.')) {
      this.combat.setMapBackground('');
      this.combat.tokens.set([]);
      this.combat.clearFog();
      this.combat.saveToCampaign(); // Trigger save
    }
  }
}
