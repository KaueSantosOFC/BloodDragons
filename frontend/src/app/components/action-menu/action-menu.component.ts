import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { CombatService } from '../../services/combat.service';
import { Ability } from '../../models/ability';
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
    <div class="flex flex-col h-full bg-stone-900 text-stone-300">
      
      @if (!selectedToken()) {
        <div class="p-2 text-center text-xs text-stone-500 italic border-b border-stone-800">
          Selecione um token no mapa.
        </div>
      } @else {
        <div class="shrink-0 p-2 border-b border-stone-800 bg-stone-800/50 sticky top-0 z-10 backdrop-blur-sm">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-full border border-amber-500 overflow-hidden bg-stone-800 flex items-center justify-center">
              @if (selectedToken()?.imageUrl) {
                <img [src]="selectedToken()?.imageUrl" alt="Token" class="w-full h-full object-cover" referrerpolicy="no-referrer">
              } @else {
                <div class="w-full h-full" [style.backgroundColor]="selectedToken()?.color"></div>
              }
            </div>
            <div>
              <h3 class="font-bold text-amber-500 leading-tight text-sm">{{ selectedToken()?.name }}</h3>
              <p class="text-[10px] text-stone-400 font-mono uppercase tracking-tighter">Ações & Testes</p>
            </div>
          </div>
        </div>

        <!-- Scrollable Accordion Categories -->
        <div class="flex-1 overflow-y-auto min-h-0 custom-scrollbar p-2 space-y-2">
          
          <!-- Habilidades / Ações -->
          @if (selectedToken()?.abilities?.length) {
            <div class="border border-stone-700 rounded bg-stone-800 overflow-hidden">
              <button class="w-full px-2 py-1.5 flex items-center justify-between text-xs font-bold text-stone-300 hover:bg-stone-700 transition-colors"
                      (click)="toggleCategory('abilities')">
                <div class="flex items-center gap-2">
                  <mat-icon class="text-amber-500" style="font-size: 16px; width: 16px; height: 16px;">local_fire_department</mat-icon>
                  Ações e Magias
                </div>
                <mat-icon style="font-size: 16px; width: 16px; height: 16px;">
                  {{ expandedCategory() === 'abilities' ? 'expand_less' : 'expand_more' }}
                </mat-icon>
              </button>
              
              @if (expandedCategory() === 'abilities') {
                <div class="p-1 bg-stone-900/50 flex flex-col gap-1">
                  @for (ability of selectedToken()?.abilities; track ability.id) {
                    <button class="text-left px-2 py-1.5 rounded text-[11px] hover:bg-amber-900/30 hover:text-amber-400 transition-colors border border-stone-700 hover:border-amber-500/50 flex items-center justify-between gap-2 shadow-sm"
                            (click)="useAbility(ability)">
                      <div class="flex items-center gap-2">
                        <mat-icon style="font-size: 14px; width: 14px; height: 14px;" class="opacity-70" [ngClass]="{'text-blue-400': ability.category === 'spell'}">
                          {{ ability.category === 'spell' ? 'auto_fix_high' : 'colorize' }}
                        </mat-icon>
                        <span class="font-bold">{{ ability.name }}</span>
                      </div>
                      <mat-icon style="font-size: 12px; width: 12px; height: 12px;" class="text-stone-500">my_location</mat-icon>
                    </button>
                  }
                </div>
              }
            </div>
          }

          <!-- Atributos -->
          <div class="border border-stone-700 rounded bg-stone-800 overflow-hidden">
            <button class="w-full px-2 py-1.5 flex items-center justify-between text-xs font-bold text-stone-300 hover:bg-stone-700 transition-colors"
                    (click)="toggleCategory('attributes')">
              <div class="flex items-center gap-2">
                <mat-icon class="text-amber-500" style="font-size: 16px; width: 16px; height: 16px;">fitness_center</mat-icon>
                Atributos
              </div>
              <mat-icon style="font-size: 16px; width: 16px; height: 16px;">
                {{ expandedCategory() === 'attributes' ? 'expand_less' : 'expand_more' }}
              </mat-icon>
            </button>
            
            @if (expandedCategory() === 'attributes') {
              <div class="p-1 bg-stone-900/50 grid grid-cols-2 gap-1">
                @for (attr of attributes; track attr.id) {
                  <button class="text-left px-2 py-1 rounded text-[10px] hover:bg-amber-900/30 hover:text-amber-400 transition-colors border border-transparent hover:border-amber-500/30 flex items-center gap-1"
                          [class.bg-amber-900/50]="selectedTest()?.id === attr.id"
                          [class.border-amber-500]="selectedTest()?.id === attr.id"
                          [class.text-amber-400]="selectedTest()?.id === attr.id"
                          (click)="selectTest(attr, 'attribute')">
                    <mat-icon style="font-size: 12px; width: 12px; height: 12px;" class="opacity-70">{{ attr.icon }}</mat-icon>
                    {{ attr.name }}
                  </button>
                }
              </div>
            }
          </div>

          <!-- Perícias -->
          <div class="border border-stone-700 rounded bg-stone-800 overflow-hidden">
            <button class="w-full px-2 py-1.5 flex items-center justify-between text-xs font-bold text-stone-300 hover:bg-stone-700 transition-colors"
                    (click)="toggleCategory('skills')">
              <div class="flex items-center gap-2">
                <mat-icon class="text-amber-500" style="font-size: 16px; width: 16px; height: 16px;">psychology</mat-icon>
                Perícias
              </div>
              <mat-icon style="font-size: 16px; width: 16px; height: 16px;">
                {{ expandedCategory() === 'skills' ? 'expand_less' : 'expand_more' }}
              </mat-icon>
            </button>
            
            @if (expandedCategory() === 'skills') {
              <div class="p-1 bg-stone-900/50 grid grid-cols-2 gap-1">
                @for (skill of skills; track skill.id) {
                  <button class="text-left px-2 py-1 rounded text-[10px] hover:bg-amber-900/30 hover:text-amber-400 transition-colors border border-transparent hover:border-amber-500/30 flex items-center gap-1 shadow-sm"
                          [class.bg-amber-900/50]="selectedTest()?.id === skill.id"
                          [class.border-amber-500]="selectedTest()?.id === skill.id"
                          [class.text-amber-400]="selectedTest()?.id === skill.id"
                          (click)="selectTest(skill, 'skill')">
                    <mat-icon style="font-size: 12px; width: 12px; height: 12px;" class="opacity-70">{{ skill.icon }}</mat-icon>
                    <span class="truncate" [title]="skill.name">{{ skill.name }}</span>
                  </button>
                }
              </div>
            }
          </div>

          <!-- Salvaguardas -->
          <div class="border border-stone-700 rounded bg-stone-800 overflow-hidden">
            <button class="w-full px-2 py-1.5 flex items-center justify-between text-xs font-bold text-stone-300 hover:bg-stone-700 transition-colors"
                    (click)="toggleCategory('saves')">
              <div class="flex items-center gap-2">
                <mat-icon class="text-amber-500" style="font-size: 16px; width: 16px; height: 16px;">security</mat-icon>
                Salvaguardas
              </div>
              <mat-icon style="font-size: 16px; width: 16px; height: 16px;">
                {{ expandedCategory() === 'saves' ? 'expand_less' : 'expand_more' }}
              </mat-icon>
            </button>
            
            @if (expandedCategory() === 'saves') {
              <div class="p-1 bg-stone-900/50 grid grid-cols-2 gap-1">
                @for (save of attributes; track save.id) {
                  <button class="text-left px-2 py-1 rounded text-[10px] hover:bg-amber-900/30 hover:text-amber-400 transition-colors border border-transparent hover:border-amber-500/30 flex items-center gap-1 shadow-sm"
                          [class.bg-amber-900/50]="selectedTest()?.id === 'save_' + save.id"
                          [class.border-amber-500]="selectedTest()?.id === 'save_' + save.id"
                          [class.text-amber-400]="selectedTest()?.id === 'save_' + save.id"
                          (click)="selectTest({id: 'save_' + save.id, name: save.name, attr: save.attr, icon: save.icon}, 'save')">
                    <mat-icon style="font-size: 12px; width: 12px; height: 12px;" class="opacity-70">{{ save.icon }}</mat-icon>
                    {{ save.name }}
                  </button>
                }
              </div>
            }
          </div>

        </div>

        <!-- Configuration & Roll Area -->
        @if (selectedTest()) {
          <div class="p-3 border-t border-stone-800 bg-stone-900 sticky bottom-0 z-10 shadow-[0_-15px_20px_-3px_rgba(0,0,0,0.6)]">
            <div class="flex items-center justify-between mb-2">
              <h4 class="font-bold text-amber-500 flex items-center gap-2 text-xs">
                <mat-icon style="font-size: 14px; width: 14px; height: 14px;">{{ selectedTest()?.icon }}</mat-icon>
                {{ selectedTest()?.name }}
              </h4>
              <span class="text-[10px] uppercase text-stone-500 bg-stone-800 px-1 py-0.5 rounded border border-stone-700 font-bold">
                {{ testType() === 'attribute' ? 'Atributo' : testType() === 'skill' ? 'Perícia' : 'Salvaguarda' }}
              </span>
            </div>

            <div class="grid grid-cols-1 gap-2 mb-3">
              <div class="flex flex-col gap-1">
                <label for="dcInput" class="text-[10px] uppercase text-stone-500 font-bold tracking-wider">CD</label>
                <input id="dcInput" type="number" [(ngModel)]="dc" class="bg-stone-800 border border-stone-700 rounded px-2 py-1 text-xs focus:outline-none focus:border-amber-500 text-center font-mono font-bold">
              </div>
            </div>

            @if (!isManualRolling()) {
              <button (click)="startManualRoll()" class="w-full py-2 bg-amber-600 hover:bg-amber-500 text-stone-900 font-bold rounded shadow-lg transition-colors flex items-center justify-center gap-2 text-xs active:scale-95 duration-75">
                <mat-icon style="font-size: 16px; width: 16px; height: 16px;">casino</mat-icon>
                ROLAR
              </button>
            } @else {
              <div class="bg-stone-800 border border-stone-700 rounded p-2 animate-in fade-in slide-in-from-bottom-2 shadow-inner">
                <label for="manualD20Roll" class="block text-[10px] font-bold text-amber-500 mb-1.5 text-center uppercase tracking-wide">Valor d20</label>
                <div class="flex gap-2">
                  <input id="manualD20Roll" #manualInput type="number" 
                         [ngModel]="manualRollValue()" 
                         (ngModelChange)="manualRollValue.set($event)"
                         class="flex-1 bg-stone-900 border border-stone-600 rounded px-2 py-1.5 text-center font-mono font-bold text-base focus:outline-none focus:border-amber-500"
                         placeholder="?"
                         (keyup.enter)="confirmRoll()">
                  <button (click)="confirmRoll()" class="bg-green-600 hover:bg-green-500 text-white px-3 rounded font-bold transition-colors shadow-md text-xs">
                    OK
                  </button>
                  <button (click)="cancelManualRoll()" class="bg-stone-700 hover:bg-stone-600 text-white px-2 rounded transition-colors shadow-md">
                    <mat-icon style="font-size: 16px; width: 16px; height: 16px;">close</mat-icon>
                  </button>
                </div>
                @if (rollError()) {
                  <p class="text-red-400 text-[10px] mt-2 text-center font-bold">{{ rollError() }}</p>
                }
              </div>
            }

            <!-- Result Area -->
            @if (lastResult()) {
              <div class="mt-3 p-2 rounded border animate-in fade-in zoom-in duration-300 shadow-lg"
                   [class.bg-green-900/30]="lastResult()?.success"
                   [class.border-green-500/50]="lastResult()?.success"
                   [class.bg-red-900/30]="!lastResult()?.success"
                   [class.border-red-500/50]="!lastResult()?.success">
                
                <div class="flex items-center justify-between mb-1">
                  <span class="font-bold text-xs tracking-tighter" 
                        [class.text-green-400]="lastResult()?.success"
                        [class.text-red-400]="!lastResult()?.success">
                    {{ lastResult()?.success ? 'SUCESSO!' : 'FALHA...' }}
                  </span>
                  <span class="font-mono font-bold text-lg text-stone-100">{{ lastResult()?.roll?.total }}</span>
                </div>
                
                <div class="text-[10px] text-stone-400 font-mono break-words leading-tight bg-black/20 p-1.5 rounded">
                  {{ lastResult()?.roll?.log }} vs CD {{ lastResult()?.dc }}
                </div>
                
                @if (lastResult()?.roll?.isCritical) {
                  <div class="mt-1 text-[9px] font-black text-amber-400 uppercase tracking-widest text-center">
                    Crítico!
                  </div>
                }
                @if (lastResult()?.roll?.isCriticalFail) {
                  <div class="mt-1 text-[9px] font-black text-red-500 uppercase tracking-widest text-center">
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

  expandedCategory = signal<'abilities' | 'attributes' | 'skills' | 'saves' | null>('abilities');
  
  selectedTest = signal<TestOption | null>(null);
  testType = signal<'attribute' | 'skill' | 'save' | null>(null);
  
  dc = signal<number>(15);
  
  lastResult = signal<{success: boolean, roll: ActionResult, dc: number} | null>(null);

  isManualRolling = signal<boolean>(false);
  manualRollValue = signal<number | null>(null);
  rollError = signal<string | null>(null);

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

  toggleCategory(cat: 'abilities' | 'attributes' | 'skills' | 'saves') {
    this.expandedCategory.set(this.expandedCategory() === cat ? null : cat);
  }

  useAbility(ability: Ability) {
    const token = this.selectedToken();
    if (!token) return;
    this.combat.startPreview(ability, token);
  }

  selectTest(test: TestOption, type: 'attribute' | 'skill' | 'save') {
    this.selectedTest.set(test);
    this.testType.set(type);
    this.lastResult.set(null); // Clear previous result
    this.cancelManualRoll();
  }

  startManualRoll() {
    this.isManualRolling.set(true);
    this.manualRollValue.set(null);
    this.rollError.set(null);
  }

  cancelManualRoll() {
    this.isManualRolling.set(false);
    this.manualRollValue.set(null);
    this.rollError.set(null);
  }

  confirmRoll() {
    const val = this.manualRollValue();
    if (val === null || val < 1 || val > 20 || !Number.isInteger(val)) {
      this.rollError.set('Valor não condizente com dado (1 a 20)');
      return;
    }
    
    this.rollError.set(null);
    this.isManualRolling.set(false);
    this.rollTest(val);
  }

  rollTest(manualRoll: number) {
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
    const isCritical = manualRoll === 20;
    const isCriticalFail = manualRoll === 1;
    const modifiers = modifier + profBonus;
    const total = manualRoll + modifiers;

    let log = `d20: [${manualRoll}] + Mod: ${modifier} + Prof: ${profBonus} = ${total}`;
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
