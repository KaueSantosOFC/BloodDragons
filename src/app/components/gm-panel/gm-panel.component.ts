import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CombatService } from '../../services/combat.service';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-gm-panel',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-80 h-full bg-stone-900 border-r border-stone-800 flex flex-col text-stone-300">
      <!-- Tabs -->
      <div class="flex border-b border-stone-800 text-xs font-mono">
        <button class="flex-1 py-3 transition-colors" [class.text-amber-500]="activeTab() === 'map'" [class.border-b-2]="activeTab() === 'map'" [class.border-amber-500]="activeTab() === 'map'" [class.bg-stone-800]="activeTab() === 'map'" (click)="activeTab.set('map')">Mapa</button>
        <button class="flex-1 py-3 transition-colors" [class.text-amber-500]="activeTab() === 'tokens'" [class.border-b-2]="activeTab() === 'tokens'" [class.border-amber-500]="activeTab() === 'tokens'" [class.bg-stone-800]="activeTab() === 'tokens'" (click)="activeTab.set('tokens')">Tokens</button>
      </div>
      
      <!-- Content Area -->
      <div class="flex-1 overflow-auto relative">
        
        @if (activeTab() === 'map') {
          <div class="p-4 space-y-6">
            <!-- Map Background Settings -->
            <div class="space-y-4">
              <div class="space-y-2">
                <h3 class="font-bold text-amber-500 border-b border-stone-700 pb-1">Fundo do Mapa</h3>
                <div class="flex flex-col gap-2">
                  <div class="flex flex-col gap-1">
                    <label for="mapBgInput" class="text-xs text-stone-400">URL da Imagem</label>
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
            </div>
          </div>
        }

        @if (activeTab() === 'tokens') {
          <div class="p-4 space-y-6">
            <!-- Add Token Settings -->
            <div class="space-y-2">
              <h3 class="font-bold text-amber-500 border-b border-stone-700 pb-1">Adicionar Novo Token</h3>
              <div class="flex flex-col gap-2">
                <label for="newTokenType" class="text-xs text-stone-400">Tipo de Token</label>
                <select id="newTokenType" #newTokenType class="bg-stone-800 border border-stone-700 rounded px-2 py-1 text-sm focus:outline-none focus:border-amber-500">
                  <option value="player">Jogador (Borda Amarela)</option>
                  <option value="enemy">Inimigo (Borda Vermelha)</option>
                  <option value="npc">NPC (Borda Azul)</option>
                  <option value="boss">Chefe (Borda Preta)</option>
                </select>
                <button class="w-full py-1 bg-amber-600 hover:bg-amber-500 text-stone-900 font-bold rounded text-xs transition-colors mt-1"
                        (click)="addToken(newTokenType.value)">
                  Adicionar Token ao Mapa
                </button>
              </div>
            </div>

            <!-- Selected Token Settings -->
            <div class="space-y-2">
              <h3 class="font-bold text-amber-500 border-b border-stone-700 pb-1">Token Selecionado</h3>
              
              @if (selectedToken()) {
                <div class="space-y-3">
                  <div class="flex flex-col gap-1">
                    <label for="tokenNameInput" class="text-xs text-stone-400">Nome</label>
                    <input id="tokenNameInput" type="text" 
                           [value]="selectedToken()?.name" 
                           (change)="updateTokenField('name', $event)"
                           class="bg-stone-800 border border-stone-700 rounded px-2 py-1 text-sm focus:outline-none focus:border-amber-500">
                  </div>
                  
                  <div class="flex gap-2">
                    <div class="flex flex-col gap-1 flex-1">
                      <label for="tokenHpInput" class="text-xs text-stone-400">PV</label>
                      <input id="tokenHpInput" type="number" 
                             [value]="selectedToken()?.hp" 
                             (change)="updateTokenField('hp', $event)"
                             class="bg-stone-800 border border-stone-700 rounded px-2 py-1 text-sm focus:outline-none focus:border-amber-500">
                    </div>
                    <div class="flex flex-col gap-1 flex-1">
                      <label for="tokenMaxHpInput" class="text-xs text-stone-400">PV Máx</label>
                      <input id="tokenMaxHpInput" type="number" 
                             [value]="selectedToken()?.maxHp" 
                             (change)="updateTokenField('maxHp', $event)"
                             class="bg-stone-800 border border-stone-700 rounded px-2 py-1 text-sm focus:outline-none focus:border-amber-500">
                    </div>
                  </div>

                  <div class="flex flex-col gap-2">
                    <div class="flex flex-col gap-1">
                      <label for="tokenImgInput" class="text-xs text-stone-400">URL da Imagem</label>
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

                  <div class="flex flex-col gap-1">
                    <label for="tokenColorInput" class="text-xs text-stone-400">Cor</label>
                    <div class="flex gap-2 items-center">
                      <input id="tokenColorInput" type="color" 
                             [value]="selectedToken()?.color" 
                             (change)="updateTokenField('color', $event)"
                             class="w-8 h-8 rounded cursor-pointer bg-stone-800 border border-stone-700">
                      <span class="text-xs font-mono">{{ selectedToken()?.color }}</span>
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

      </div>
    </div>
  `
})
export class GmPanelComponent {
  combat = inject(CombatService);
  activeTab = signal<'map' | 'tokens'>('map');
  tokenToDelete = signal<string | null>(null);

  selectedToken = computed(() => {
    const id = this.combat.selectedTokenId();
    if (!id) return null;
    return this.combat.tokens().find(t => t.id === id) || null;
  });

  addToken(type: string) {
    const id = 't' + Math.random().toString(36).substring(2, 9);
    let name = 'Novo Token';
    let color = '#78716c'; // Default stone color
    
    if (type === 'player') { name = 'Novo Jogador'; color = '#3b82f6'; }
    if (type === 'enemy') { name = 'Novo Inimigo'; color = '#ef4444'; }
    if (type === 'npc') { name = 'Novo NPC'; color = '#22c55e'; }
    if (type === 'boss') { name = 'Novo Chefe'; color = '#000000'; }

    this.combat.addToken({
      id,
      name,
      x: 0,
      y: 0,
      hp: 10,
      maxHp: 10,
      conditions: [],
      controlledBy: type === 'player' ? 'user_player_1' : 'user_gm_1',
      color,
      type: type as 'player' | 'enemy' | 'npc' | 'boss'
    });
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
}
