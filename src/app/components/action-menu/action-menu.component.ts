import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { CombatService } from '../../services/combat.service';
import { DndCoreEngineService, ActionResult } from '../../services/dnd-core-engine.service';

interface TestOption {
  id: string;
  name: string;
  attr: 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha';
  icon: string;
}

@Component({
  selector: 'app-action-menu',
  standalone: true,
  imports: [CommonModule, MatIconModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col h-full bg-stone-900 text-stone-300 overflow-y-auto custom-scrollbar">
      
      @if (!selectedToken()) {
        <div class="p-4 text-center text-stone-500 italic border-b border-stone-800">
          Selecione um token no mapa para realizar testes.
        </div>
      } @else {
        <div class="p-4 border-b border-stone-800 bg-stone-800/50 sticky top-0 z-10 backdrop-blur-sm">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full border-2 border-amber-500 overflow-hidden bg-stone-800 flex items-center justify-center">
              @if (selectedToken()?.imageUrl) {
                <img [src]="selectedToken()?.imageUrl" alt="Token" class="w-full h-full object-cover" referrerpolicy="no-referrer">
              } @else {
                <div class="w-full h-full" [style.backgroundColor]="selectedToken()?.color"></div>
              }
            </div>
            <div>
              <h3 class="font-bold text-amber-500 leading-tight">{{ selectedToken()?.name }}</h3>
              <p class="text-xs text-stone-400">Menu de Ações</p>
            </div>
          </div>
        </div>

        <!-- Accordion Categories -->
        <div class="flex-1 p-2 space-y-2">
          
          <!-- Atributos -->
          <div class="border border-stone-700 rounded bg-stone-800 overflow-hidden">
            <button class="w-full px-3 py-2 flex items-center justify-between text-sm font-bold text-stone-300 hover:bg-stone-700 transition-colors"
                    (click)="toggleCategory('attributes')">
              <div class="flex items-center gap-2">
                <mat-icon class="text-amber-500" style="font-size: 18px; width: 18px; height: 18px;">fitness_center</mat-icon>
                Testes de Atributo
              </div>
              <mat-icon style="font-size: 18px; width: 18px; height: 18px;">
                {{ expandedCategory() === 'attributes' ? 'expand_less' : 'expand_more' }}
              </mat-icon>
            </button>
            
            @if (expandedCategory() === 'attributes') {
              <div class="p-2 bg-stone-900/50 grid grid-cols-2 gap-1">
                @for (attr of attributes; track attr.id) {
                  <button class="text-left px-2 py-1.5 rounded text-xs hover:bg-amber-900/30 hover:text-amber-400 transition-colors border border-transparent hover:border-amber-500/30 flex items-center gap-1"
                          [class.bg-amber-900/50]="selectedTest()?.id === attr.id"
                          [class.border-amber-500]="selectedTest()?.id === attr.id"
                          [class.text-amber-400]="selectedTest()?.id === attr.id"
                          (click)="selectTest(attr, 'attribute')">
                    <mat-icon style="font-size: 14px; width: 14px; height: 14px;" class="opacity-70">{{ attr.icon }}</mat-icon>
                    {{ attr.name }}
                  </button>
                }
              </div>
            }
          </div>

          <!-- Perícias -->
          <div class="border border-stone-700 rounded bg-stone-800 overflow-hidden">
            <button class="w-full px-3 py-2 flex items-center justify-between text-sm font-bold text-stone-300 hover:bg-stone-700 transition-colors"
                    (click)="toggleCategory('skills')">
              <div class="flex items-center gap-2">
                <mat-icon class="text-amber-500" style="font-size: 18px; width: 18px; height: 18px;">psychology</mat-icon>
                Perícias (Skills)
              </div>
              <mat-icon style="font-size: 18px; width: 18px; height: 18px;">
                {{ expandedCategory() === 'skills' ? 'expand_less' : 'expand_more' }}
              </mat-icon>
            </button>
            
            @if (expandedCategory() === 'skills') {
              <div class="p-2 bg-stone-900/50 grid grid-cols-2 gap-1">
                @for (skill of skills; track skill.id) {
                  <button class="text-left px-2 py-1.5 rounded text-xs hover:bg-amber-900/30 hover:text-amber-400 transition-colors border border-transparent hover:border-amber-500/30 flex items-center gap-1"
                          [class.bg-amber-900/50]="selectedTest()?.id === skill.id"
                          [class.border-amber-500]="selectedTest()?.id === skill.id"
                          [class.text-amber-400]="selectedTest()?.id === skill.id"
                          (click)="selectTest(skill, 'skill')">
                    <mat-icon style="font-size: 14px; width: 14px; height: 14px;" class="opacity-70">{{ skill.icon }}</mat-icon>
                    <span class="truncate" [title]="skill.name">{{ skill.name }}</span>
                  </button>
                }
              </div>
            }
          </div>

          <!-- Salvaguardas -->
          <div class="border border-stone-700 rounded bg-stone-800 overflow-hidden">
            <button class="w-full px-3 py-2 flex items-center justify-between text-sm font-bold text-stone-300 hover:bg-stone-700 transition-colors"
                    (click)="toggleCategory('saves')">
              <div class="flex items-center gap-2">
                <mat-icon class="text-amber-500" style="font-size: 18px; width: 18px; height: 18px;">security</mat-icon>
                Salvaguardas
              </div>
              <mat-icon style="font-size: 18px; width: 18px; height: 18px;">
                {{ expandedCategory() === 'saves' ? 'expand_less' : 'expand_more' }}
              </mat-icon>
            </button>
            
            @if (expandedCategory() === 'saves') {
              <div class="p-2 bg-stone-900/50 grid grid-cols-2 gap-1">
                @for (save of attributes; track save.id) {
                  <button class="text-left px-2 py-1.5 rounded text-xs hover:bg-amber-900/30 hover:text-amber-400 transition-colors border border-transparent hover:border-amber-500/30 flex items-center gap-1"
                          [class.bg-amber-900/50]="selectedTest()?.id === 'save_' + save.id"
                          [class.border-amber-500]="selectedTest()?.id === 'save_' + save.id"
                          [class.text-amber-400]="selectedTest()?.id === 'save_' + save.id"
                          (click)="selectTest({id: 'save_' + save.id, name: save.name, attr: save.attr, icon: save.icon}, 'save')">
                    <mat-icon style="font-size: 14px; width: 14px; height: 14px;" class="opacity-70">{{ save.icon }}</mat-icon>
                    {{ save.name }}
                  </button>
                }
              </div>
            }
          </div>

        </div>

        <!-- Configuration & Roll Area -->
        @if (selectedTest()) {
          <div class="p-4 border-t border-stone-800 bg-stone-900 sticky bottom-0 z-10 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.5)]">
            <div class="flex items-center justify-between mb-3">
              <h4 class="font-bold text-amber-500 flex items-center gap-2">
                <mat-icon style="font-size: 18px; width: 18px; height: 18px;">{{ selectedTest()?.icon }}</mat-icon>
                {{ selectedTest()?.name }}
              </h4>
              <span class="text-[10px] uppercase text-stone-500 bg-stone-800 px-2 py-0.5 rounded border border-stone-700">
                {{ testType() === 'attribute' ? 'Atributo' : testType() === 'skill' ? 'Perícia' : 'Salvaguarda' }}
              </span>
            </div>

            <div class="grid grid-cols-2 gap-3 mb-4">
              <div class="flex flex-col gap-1">
                <label for="dcInput" class="text-[10px] uppercase text-stone-500 font-bold">Dificuldade (CD)</label>
                <input id="dcInput" type="number" [(ngModel)]="dc" class="bg-stone-800 border border-stone-700 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-amber-500 text-center font-mono font-bold">
              </div>
              <div class="flex flex-col gap-1">
                <label for="rollModeSelect" class="text-[10px] uppercase text-stone-500 font-bold">Vantagem</label>
                <select id="rollModeSelect" [(ngModel)]="rollMode" class="bg-stone-800 border border-stone-700 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-amber-500">
                  <option value="normal">Normal</option>
                  <option value="advantage">Vantagem</option>
                  <option value="disadvantage">Desvantagem</option>
                </select>
              </div>
            </div>

            <button (click)="rollTest()" class="w-full py-2 bg-amber-600 hover:bg-amber-500 text-stone-900 font-bold rounded shadow-lg transition-colors flex items-center justify-center gap-2">
              <mat-icon style="font-size: 18px; width: 18px; height: 18px;">casino</mat-icon>
              ROLAR DADO
            </button>

            <!-- Result Area -->
            @if (lastResult()) {
              <div class="mt-4 p-3 rounded border animate-in fade-in slide-in-from-bottom-2 duration-300"
                   [class.bg-green-900/20]="lastResult()?.success"
                   [class.border-green-500/50]="lastResult()?.success"
                   [class.bg-red-900/20]="!lastResult()?.success"
                   [class.border-red-500/50]="!lastResult()?.success">
                
                <div class="flex items-center justify-between mb-1">
                  <span class="font-bold text-lg" 
                        [class.text-green-400]="lastResult()?.success"
                        [class.text-red-400]="!lastResult()?.success">
                    {{ lastResult()?.success ? 'SUCESSO!' : 'FALHA...' }}
                  </span>
                  <span class="font-mono font-bold text-xl text-stone-200">{{ lastResult()?.roll?.total }}</span>
                </div>
                
                <div class="text-xs text-stone-400 font-mono break-words leading-tight">
                  {{ lastResult()?.roll?.log }} vs CD {{ lastResult()?.dc }}
                </div>
                
                @if (lastResult()?.roll?.isCritical) {
                  <div class="mt-1 text-[10px] font-bold text-amber-400 uppercase tracking-widest text-center">
                    Sucesso Crítico!
                  </div>
                }
                @if (lastResult()?.roll?.isCriticalFail) {
                  <div class="mt-1 text-[10px] font-bold text-red-500 uppercase tracking-widest text-center">
                    Falha Crítica!
                  </div>
                }
              </div>
            }
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .custom-scrollbar::-webkit-scrollbar {
      width: 6px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: #1c1917; 
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: #44403c; 
      border-radius: 3px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: #57534e; 
    }
  `]
})
export class ActionMenuComponent {
  private combat = inject(CombatService);
  private engine = inject(DndCoreEngineService);

  selectedToken = computed(() => {
    const id = this.combat.selectedTokenId();
    if (!id) return null;
    return this.combat.tokens().find(t => t.id === id) || null;
  });

  expandedCategory = signal<'attributes' | 'skills' | 'saves' | null>('skills');
  
  selectedTest = signal<TestOption | null>(null);
  testType = signal<'attribute' | 'skill' | 'save' | null>(null);
  
  dc = signal<number>(15);
  rollMode = signal<'normal' | 'advantage' | 'disadvantage'>('normal');
  
  lastResult = signal<{success: boolean, roll: ActionResult, dc: number} | null>(null);

  attributes: TestOption[] = [
    { id: 'str', name: 'Força', attr: 'str', icon: 'fitness_center' },
    { id: 'dex', name: 'Destreza', attr: 'dex', icon: 'directions_run' },
    { id: 'con', name: 'Constituição', attr: 'con', icon: 'favorite' },
    { id: 'int', name: 'Inteligência', attr: 'int', icon: 'menu_book' },
    { id: 'wis', name: 'Sabedoria', attr: 'wis', icon: 'visibility' },
    { id: 'cha', name: 'Carisma', attr: 'cha', icon: 'record_voice_over' }
  ];

  skills: TestOption[] = [
    { id: 'acrobatics', name: 'Acrobacia', attr: 'dex', icon: 'sports_gymnastics' },
    { id: 'animal_handling', name: 'Adestrar Animais', attr: 'wis', icon: 'pets' },
    { id: 'arcana', name: 'Arcanismo', attr: 'int', icon: 'auto_fix_high' },
    { id: 'athletics', name: 'Atletismo', attr: 'str', icon: 'sports_kabaddi' },
    { id: 'deception', name: 'Enganação', attr: 'cha', icon: 'masks' },
    { id: 'history', name: 'História', attr: 'int', icon: 'history_edu' },
    { id: 'insight', name: 'Intuição', attr: 'wis', icon: 'psychology_alt' },
    { id: 'intimidation', name: 'Intimidação', attr: 'cha', icon: 'gavel' },
    { id: 'investigation', name: 'Investigação', attr: 'int', icon: 'search' },
    { id: 'medicine', name: 'Medicina', attr: 'wis', icon: 'medical_services' },
    { id: 'nature', name: 'Natureza', attr: 'int', icon: 'forest' },
    { id: 'perception', name: 'Percepção', attr: 'wis', icon: 'visibility' },
    { id: 'performance', name: 'Performance', attr: 'cha', icon: 'theater_comedy' },
    { id: 'persuasion', name: 'Persuasão', attr: 'cha', icon: 'handshake' },
    { id: 'religion', name: 'Religião', attr: 'int', icon: 'church' },
    { id: 'sleight_of_hand', name: 'Prestidigitação', attr: 'dex', icon: 'back_hand' },
    { id: 'stealth', name: 'Furtividade', attr: 'dex', icon: 'visibility_off' },
    { id: 'survival', name: 'Sobrevivência', attr: 'wis', icon: 'explore' }
  ];

  toggleCategory(cat: 'attributes' | 'skills' | 'saves') {
    this.expandedCategory.set(this.expandedCategory() === cat ? null : cat);
  }

  selectTest(test: TestOption, type: 'attribute' | 'skill' | 'save') {
    this.selectedTest.set(test);
    this.testType.set(type);
    this.lastResult.set(null); // Clear previous result
  }

  rollTest() {
    const token = this.selectedToken();
    const test = this.selectedTest();
    const type = this.testType();
    
    if (!token || !test || !type) return;

    // 1. Get Attribute Modifier
    const sheet = token.sheet as Record<string, unknown> | undefined;
    let attrScore = 10;
    if (sheet) {
      attrScore = (sheet[test.attr] as number) || 10;
    }
    const modifier = this.engine.calculateModifier(attrScore);

    // 2. Get Proficiency Bonus
    let profBonus = 0;
    const baseProf = (sheet?.['proficiencyBonus'] as number) || 2;

    if (type === 'skill') {
      // Check if token has skill proficiency (assuming token.sheet.skills exists, or fallback to 0)
      const skills = sheet?.['skills'] as Record<string, { proficient: boolean; expertise: boolean }> | undefined;
      if (skills && skills[test.id]?.proficient) {
        profBonus = baseProf;
        if (skills[test.id]?.expertise) {
          profBonus *= 2;
        }
      }
    } else if (type === 'save') {
      // Check if token has save proficiency
      const saveProfs = (sheet?.['saveProficiencies'] as string[]) || [];
      if (saveProfs.includes(test.attr)) {
        profBonus = baseProf;
      }
    }

    // 3. Roll
    const roll = this.engine.calculateAttackRoll(modifier, profBonus, 0, this.rollMode());
    
    // 4. Validate
    const hitCheck = this.engine.validateSuccess(roll.total, this.dc());
    
    // 5. Set Result
    this.lastResult.set({
      success: hitCheck.success,
      roll,
      dc: this.dc()
    });
  }
}
