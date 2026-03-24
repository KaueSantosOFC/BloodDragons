import { Component, ChangeDetectionStrategy, inject, signal, computed, DoCheck } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { CombatService } from '../../services/combat.service';
import { AuthService } from '../../services/auth.service';
import { ItemToken, ItemAction } from '../../models/item-token';
import { DndCoreEngineService } from '../../services/dnd-core-engine.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-item-interaction-modal',
  standalone: true,
  imports: [CommonModule, MatIconModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (combat.selectedItemToken()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
        <div class="bg-stone-900 border border-stone-700 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
          
          <!-- Header -->
          <div class="flex items-center justify-between p-4 border-b border-stone-800 bg-stone-950">
            <div class="flex items-center gap-3">
              <mat-icon class="text-amber-500">category</mat-icon>
              <h2 class="text-xl font-bold text-stone-100">{{ item()?.name }}</h2>
            </div>
            <button class="text-stone-400 hover:text-white transition-colors" (click)="close()">
              <mat-icon>close</mat-icon>
            </button>
          </div>

          <!-- Tabs -->
          <div class="flex border-b border-stone-800 bg-stone-950">
            <button 
              class="flex-1 py-3 text-sm font-medium transition-colors border-b-2"
              [class.text-amber-500]="activeTab() === 'details'"
              [class.border-amber-500]="activeTab() === 'details'"
              [class.border-transparent]="activeTab() !== 'details'"
              [class.text-stone-400]="activeTab() !== 'details'"
              [class.hover:bg-stone-800]="activeTab() !== 'details'"
              (click)="activeTab.set('details')"
            >
              Detalhes
            </button>
            <button 
              class="flex-1 py-3 text-sm font-medium transition-colors border-b-2"
              [class.text-amber-500]="activeTab() === 'actions'"
              [class.border-amber-500]="activeTab() === 'actions'"
              [class.border-transparent]="activeTab() !== 'actions'"
              [class.text-stone-400]="activeTab() !== 'actions'"
              [class.hover:bg-stone-800]="activeTab() !== 'actions'"
              (click)="activeTab.set('actions')"
            >
              Ações
            </button>
            @if (auth.currentUser()?.role === 'GM') {
              <button 
                class="flex-1 py-3 text-sm font-medium transition-colors border-b-2"
                [class.text-amber-500]="activeTab() === 'edit'"
                [class.border-amber-500]="activeTab() === 'edit'"
                [class.border-transparent]="activeTab() !== 'edit'"
                [class.text-stone-400]="activeTab() !== 'edit'"
                [class.hover:bg-stone-800]="activeTab() !== 'edit'"
                (click)="activeTab.set('edit')"
              >
                Editar (GM)
              </button>
            }
          </div>

          <!-- Content -->
          <div class="p-6 overflow-y-auto flex-1 custom-scrollbar">
            
            <!-- Details Tab -->
            @if (activeTab() === 'details') {
              <div class="flex flex-col md:flex-row gap-6">
                <!-- Image -->
                <div class="w-full md:w-1/3 flex flex-col gap-4">
                  <div class="aspect-square bg-stone-950 rounded-lg border border-stone-800 overflow-hidden flex items-center justify-center">
                    @if (item()?.imageUrl) {
                      <img [src]="item()?.imageUrl" [alt]="item()?.name" class="w-full h-full object-cover" referrerpolicy="no-referrer">
                    } @else {
                      <mat-icon class="text-stone-700" style="font-size: 64px; width: 64px; height: 64px;">image_not_supported</mat-icon>
                    }
                  </div>
                  
                  <button 
                    class="w-full py-2 bg-amber-600 hover:bg-amber-500 text-white rounded font-medium transition-colors flex items-center justify-center gap-2"
                    (click)="pickUpItem()"
                  >
                    <mat-icon style="font-size: 18px; width: 18px; height: 18px;">pan_tool</mat-icon>
                    Pegar Item
                  </button>
                </div>

                <!-- Stats & Description -->
                <div class="w-full md:w-2/3 flex flex-col gap-4">
                  <div class="grid grid-cols-2 gap-4">
                    @if (item()?.level) {
                      <div class="bg-stone-950 p-3 rounded border border-stone-800">
                        <div class="text-[10px] text-stone-500 uppercase tracking-wider mb-1">Nível</div>
                        <div class="text-stone-200 font-medium">{{ item()?.level }}</div>
                      </div>
                    }
                    @if (item()?.damage) {
                      <div class="bg-stone-950 p-3 rounded border border-stone-800">
                        <div class="text-[10px] text-stone-500 uppercase tracking-wider mb-1">Dano</div>
                        <div class="text-stone-200 font-medium">{{ item()?.damage }} <span class="text-stone-500 text-xs">({{ item()?.damageType }})</span></div>
                      </div>
                    }
                    @if (item()?.healing) {
                      <div class="bg-stone-950 p-3 rounded border border-stone-800">
                        <div class="text-[10px] text-stone-500 uppercase tracking-wider mb-1">Cura</div>
                        <div class="text-stone-200 font-medium">{{ item()?.healing }}</div>
                      </div>
                    }
                    @if (item()?.movement) {
                      <div class="bg-stone-950 p-3 rounded border border-stone-800">
                        <div class="text-[10px] text-stone-500 uppercase tracking-wider mb-1">Deslocamento Bônus</div>
                        <div class="text-stone-200 font-medium">+{{ item()?.movement }}m</div>
                      </div>
                    }
                  </div>

                  @if (item()?.description) {
                    <div class="bg-stone-950 p-4 rounded border border-stone-800 mt-2">
                      <div class="text-[10px] text-stone-500 uppercase tracking-wider mb-2">Descrição</div>
                      <div class="text-stone-300 text-sm whitespace-pre-wrap leading-relaxed">{{ item()?.description }}</div>
                    </div>
                  }
                </div>
              </div>
            }

            <!-- Actions Tab -->
            @if (activeTab() === 'actions') {
              <div class="flex flex-col gap-4">
                @if (item()?.actions?.length === 0) {
                  <div class="text-center py-8 text-stone-500">
                    <mat-icon style="font-size: 48px; width: 48px; height: 48px; opacity: 0.5;">search_off</mat-icon>
                    <p class="mt-2 text-sm">Nenhuma ação interativa disponível para este item.</p>
                  </div>
                }

                @for (action of item()?.actions; track action.id) {
                  <div class="bg-stone-950 rounded-lg border border-stone-800 overflow-hidden">
                    <div class="p-4 flex items-center justify-between border-b border-stone-800/50">
                      <div>
                        <h3 class="text-stone-200 font-medium">{{ action.name }}</h3>
                        <p class="text-xs text-stone-500 mt-1">
                          Teste de <span class="text-amber-500 capitalize">{{ action.skill }}</span> (CD {{ action.dc }})
                        </p>
                      </div>
                      <button 
                        class="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded text-sm transition-colors flex items-center gap-2"
                        (click)="rollAction(action)"
                        [disabled]="action.isRevealed && auth.currentUser()?.role !== 'GM'"
                        [class.opacity-50]="action.isRevealed && auth.currentUser()?.role !== 'GM'"
                      >
                        <mat-icon style="font-size: 16px; width: 16px; height: 16px;">casino</mat-icon>
                        Rolar
                      </button>
                    </div>
                    
                    @if (action.isRevealed || auth.currentUser()?.role === 'GM') {
                      <div class="p-4 bg-stone-900/50 text-sm">
                        @if (auth.currentUser()?.role === 'GM') {
                          <div class="mb-2 text-xs text-amber-500 font-medium flex items-center gap-1">
                            <mat-icon style="font-size: 14px; width: 14px; height: 14px;">visibility</mat-icon>
                            Visão do Mestre (Revelado: {{ action.isRevealed ? 'Sim' : 'Não' }})
                          </div>
                        }
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <div class="text-[10px] text-green-500 uppercase tracking-wider mb-1">Sucesso</div>
                            <p class="text-stone-300">{{ action.successDescription }}</p>
                          </div>
                          @if (action.failureDescription) {
                            <div>
                              <div class="text-[10px] text-red-500 uppercase tracking-wider mb-1">Falha</div>
                              <p class="text-stone-300">{{ action.failureDescription }}</p>
                            </div>
                          }
                        </div>
                      </div>
                    }
                  </div>
                }
              </div>
            }

            <!-- Edit Tab (GM Only) -->
            @if (activeTab() === 'edit' && auth.currentUser()?.role === 'GM') {
              <div class="flex flex-col gap-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div class="flex flex-col gap-1">
                    <label for="edit-name" class="text-[10px] text-stone-500 uppercase">Nome do Item</label>
                    <input id="edit-name" type="text" [(ngModel)]="editData.name" class="bg-stone-950 border border-stone-800 rounded px-3 py-2 text-sm text-stone-200 focus:outline-none focus:border-amber-500">
                  </div>
                  <div class="flex flex-col gap-1">
                    <label for="edit-image" class="text-[10px] text-stone-500 uppercase">URL da Imagem</label>
                    <input id="edit-image" type="text" [(ngModel)]="editData.imageUrl" class="bg-stone-950 border border-stone-800 rounded px-3 py-2 text-sm text-stone-200 focus:outline-none focus:border-amber-500">
                  </div>
                  <div class="flex flex-col gap-1">
                    <label for="edit-level" class="text-[10px] text-stone-500 uppercase">Nível</label>
                    <input id="edit-level" type="number" [(ngModel)]="editData.level" class="bg-stone-950 border border-stone-800 rounded px-3 py-2 text-sm text-stone-200 focus:outline-none focus:border-amber-500">
                  </div>
                  <div class="flex flex-col gap-1">
                    <label for="edit-damage" class="text-[10px] text-stone-500 uppercase">Dano</label>
                    <input id="edit-damage" type="text" [(ngModel)]="editData.damage" placeholder="ex: 1d8+2" class="bg-stone-950 border border-stone-800 rounded px-3 py-2 text-sm text-stone-200 focus:outline-none focus:border-amber-500">
                  </div>
                  <div class="flex flex-col gap-1">
                    <label for="edit-damage-type" class="text-[10px] text-stone-500 uppercase">Tipo de Dano</label>
                    <input id="edit-damage-type" type="text" [(ngModel)]="editData.damageType" placeholder="ex: slashing" class="bg-stone-950 border border-stone-800 rounded px-3 py-2 text-sm text-stone-200 focus:outline-none focus:border-amber-500">
                  </div>
                  <div class="flex flex-col gap-1">
                    <label for="edit-healing" class="text-[10px] text-stone-500 uppercase">Cura</label>
                    <input id="edit-healing" type="text" [(ngModel)]="editData.healing" placeholder="ex: 2d4+2" class="bg-stone-950 border border-stone-800 rounded px-3 py-2 text-sm text-stone-200 focus:outline-none focus:border-amber-500">
                  </div>
                </div>

                <div class="flex flex-col gap-1">
                  <label for="edit-description" class="text-[10px] text-stone-500 uppercase">Descrição</label>
                  <textarea id="edit-description" [(ngModel)]="editData.description" rows="4" class="bg-stone-950 border border-stone-800 rounded px-3 py-2 text-sm text-stone-200 focus:outline-none focus:border-amber-500 resize-none"></textarea>
                </div>

                <!-- Actions Edit -->
                <div class="border-t border-stone-800 pt-6">
                  <div class="flex items-center justify-between mb-4">
                    <h3 class="text-stone-200 font-medium">Ações Interativas</h3>
                    <button class="text-xs bg-stone-800 hover:bg-stone-700 text-stone-200 px-3 py-1 rounded transition-colors" (click)="addAction()">+ Adicionar Ação</button>
                  </div>

                  <div class="flex flex-col gap-4">
                    @for (action of editData.actions; track action.id; let i = $index) {
                      <div class="bg-stone-950 p-4 rounded border border-stone-800 relative">
                        <button class="absolute top-2 right-2 text-stone-500 hover:text-red-500 transition-colors" (click)="removeAction(i)">
                          <mat-icon style="font-size: 16px; width: 16px; height: 16px;">delete</mat-icon>
                        </button>
                        
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div class="flex flex-col gap-1">
                            <label [for]="'action-name-' + i" class="text-[10px] text-stone-500 uppercase">Nome da Ação</label>
                            <input [id]="'action-name-' + i" type="text" [(ngModel)]="action.name" class="bg-stone-900 border border-stone-700 rounded px-2 py-1 text-sm text-stone-200 focus:outline-none focus:border-amber-500">
                          </div>
                          <div class="flex flex-col gap-1">
                            <label [for]="'action-skill-' + i" class="text-[10px] text-stone-500 uppercase">Perícia</label>
                            <input [id]="'action-skill-' + i" type="text" [(ngModel)]="action.skill" placeholder="ex: investigation" class="bg-stone-900 border border-stone-700 rounded px-2 py-1 text-sm text-stone-200 focus:outline-none focus:border-amber-500">
                          </div>
                          <div class="flex flex-col gap-1">
                            <label [for]="'action-dc-' + i" class="text-[10px] text-stone-500 uppercase">Dificuldade (CD)</label>
                            <input [id]="'action-dc-' + i" type="number" [(ngModel)]="action.dc" class="bg-stone-900 border border-stone-700 rounded px-2 py-1 text-sm text-stone-200 focus:outline-none focus:border-amber-500">
                          </div>
                        </div>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div class="flex flex-col gap-1">
                            <label [for]="'action-success-' + i" class="text-[10px] text-green-500 uppercase">Texto de Sucesso</label>
                            <textarea [id]="'action-success-' + i" [(ngModel)]="action.successDescription" rows="2" class="bg-stone-900 border border-stone-700 rounded px-2 py-1 text-sm text-stone-200 focus:outline-none focus:border-amber-500 resize-none"></textarea>
                          </div>
                          <div class="flex flex-col gap-1">
                            <label [for]="'action-fail-' + i" class="text-[10px] text-red-500 uppercase">Texto de Falha</label>
                            <textarea [id]="'action-fail-' + i" [(ngModel)]="action.failureDescription" rows="2" class="bg-stone-900 border border-stone-700 rounded px-2 py-1 text-sm text-stone-200 focus:outline-none focus:border-amber-500 resize-none"></textarea>
                          </div>
                        </div>
                      </div>
                    }
                  </div>
                </div>

                <div class="flex justify-end mt-4">
                  <button class="bg-amber-600 hover:bg-amber-500 text-white px-6 py-2 rounded font-medium transition-colors" (click)="saveEdit()">
                    Salvar Alterações
                  </button>
                </div>
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
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: transparent;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background-color: #44403c;
      border-radius: 10px;
    }
  `]
})
export class ItemInteractionModalComponent implements DoCheck {
  combat = inject(CombatService);
  auth = inject(AuthService);
  engine = inject(DndCoreEngineService);

  activeTab = signal<'details' | 'actions' | 'edit'>('details');
  
  item = computed(() => this.combat.selectedItemToken());

  // Edit State
  editData: Partial<ItemToken> = {};

  constructor() {
    // Quando o item selecionado muda, atualiza o editData se for GM
    // Usando effect ou apenas copiando ao entrar na aba edit
  }

  close() {
    this.combat.selectedItemToken.set(null);
    this.activeTab.set('details');
  }

  pickUpItem() {
    const currentItem = this.item();
    const selectedTokenId = this.combat.selectedTokenId();
    
    if (!currentItem || !selectedTokenId) {
      this.combat.notifications.update(n => [...n, {
        id: Date.now().toString(),
        message: 'Selecione um token seu primeiro para pegar o item.',
        type: 'info',
        timestamp: Date.now()
      }]);
      return;
    }

    const token = this.combat.tokens().find(t => t.id === selectedTokenId);
    if (!token || !token.sheet) return;

    // Adicionar ao inventário do token
    const inventoryStr = token.sheet.backpack || '';
    const newItemStr = `${currentItem.name}${currentItem.damage ? ` (${currentItem.damage})` : ''}`;
    const newInventory = inventoryStr ? `${inventoryStr}\n${newItemStr}` : newItemStr;

    this.combat.updateToken(token.id, {
      sheet: { ...token.sheet, backpack: newInventory }
    });

    // Marcar item como pego (remove do grid)
    this.combat.itemTokens.update(items => items.map(i => 
      i.id === currentItem.id ? { ...i, isPickedUp: true } : i
    ));

    this.combat.notifications.update(n => [...n, {
      id: Date.now().toString(),
      message: `${token.name} pegou ${currentItem.name}!`,
      type: 'info',
      timestamp: Date.now()
    }]);

    this.close();
  }

  rollAction(action: ItemAction) {
    const selectedTokenId = this.combat.selectedTokenId();
    if (!selectedTokenId) {
      this.combat.notifications.update(n => [...n, {
        id: Date.now().toString(),
        message: 'Selecione um token seu para realizar a ação.',
        type: 'info',
        timestamp: Date.now()
      }]);
      return;
    }

    const token = this.combat.tokens().find(t => t.id === selectedTokenId);
    if (!token || !token.sheet) return;

    // Simular rolagem de perícia (simplificado)
    // O ideal seria usar o DndCoreEngineService, mas vamos fazer um d20 + mod aqui para rapidez
    const d20 = Math.floor(Math.random() * 20) + 1;
    // Pega o modificador de atributo base (ex: investigation -> int)
    let modifier = 0;
    const skillMap: Record<string, keyof typeof token.sheet> = {
      'investigation': 'int', 'arcana': 'int', 'history': 'int', 'religion': 'int', 'nature': 'int',
      'perception': 'wis', 'insight': 'wis', 'medicine': 'wis', 'survival': 'wis', 'animal handling': 'wis',
      'athletics': 'str',
      'acrobatics': 'dex', 'stealth': 'dex', 'sleight of hand': 'dex',
      'persuasion': 'cha', 'deception': 'cha', 'intimidation': 'cha', 'performance': 'cha'
    };
    
    const attrKey = skillMap[action.skill.toLowerCase()];
    if (attrKey && typeof token.sheet[attrKey] === 'number') {
       modifier = Math.floor(((token.sheet[attrKey] as number) - 10) / 2);
    }
    
    const total = d20 + modifier;
    const success = total >= action.dc;

    this.combat.notifications.update(n => [...n, {
      id: Date.now().toString(),
      message: `${token.name} rolou ${action.skill} (${d20} + ${modifier} = ${total}) contra CD ${action.dc}. ${success ? 'Sucesso!' : 'Falha.'}`,
      type: 'info',
      timestamp: Date.now()
    }]);

    // Se sucesso, revela a ação para todos
    if (success) {
      const currentItem = this.item();
      if (currentItem) {
        this.combat.itemTokens.update(items => items.map(i => {
          if (i.id === currentItem.id) {
            return {
              ...i,
              actions: i.actions.map(a => a.id === action.id ? { ...a, isRevealed: true } : a)
            };
          }
          return i;
        }));
        
        // Atualiza a referência local para refletir a mudança imediatamente
        this.combat.selectedItemToken.set(this.combat.itemTokens().find(i => i.id === currentItem.id) || null);
      }
    }
  }

  // --- GM Edit Methods ---

  ngDoCheck() {
    // Sincroniza editData quando entra na aba edit
    if (this.activeTab() === 'edit' && !this.editData.id && this.item()) {
      this.editData = JSON.parse(JSON.stringify(this.item())); // Deep copy
    } else if (this.activeTab() !== 'edit') {
      this.editData = {}; // Limpa quando sai
    }
  }

  addAction() {
    if (!this.editData.actions) this.editData.actions = [];
    this.editData.actions.push({
      id: 'ia_' + Date.now(),
      name: 'Nova Ação',
      skill: 'investigation',
      dc: 10,
      successDescription: '',
      failureDescription: '',
      isRevealed: false
    });
  }

  removeAction(index: number) {
    if (this.editData.actions) {
      this.editData.actions.splice(index, 1);
    }
  }

  saveEdit() {
    const currentItem = this.item();
    if (!currentItem || !this.editData.id) return;

    this.combat.itemTokens.update(items => items.map(i => 
      i.id === currentItem.id ? { ...i, ...this.editData } as ItemToken : i
    ));

    this.combat.notifications.update(n => [...n, {
      id: Date.now().toString(),
      message: `Item "${this.editData.name}" atualizado.`,
      type: 'info',
      timestamp: Date.now()
    }]);

    this.activeTab.set('details');
  }
}
