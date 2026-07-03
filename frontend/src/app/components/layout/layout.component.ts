import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { GridComponent } from '../grid/grid.component';
import { GmPanelComponent } from '../gm-panel/gm-panel.component';
import { RightPanelComponent } from '../right-panel/right-panel.component';
import { BottomBarComponent } from '../bottom-bar/bottom-bar.component';
import { StorySlidesComponent } from '../story-slides/story-slides.component';
import { SceneFilmstripComponent } from '../scene-filmstrip/scene-filmstrip.component';
import { AuthService } from '../../services/auth.service';
import { CombatService } from '../../services/combat.service';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { ItemInteractionModalComponent } from '../item-interaction-modal/item-interaction-modal.component';

import { AttackModalComponent } from '../attack-modal/attack-modal.component';
import { DamageModalComponent } from '../damage-modal/damage-modal.component';
import { LevelUpModalComponent } from '../level-up-modal/level-up-modal.component';

import { CombatTrackerComponent } from '../combat-tracker/combat-tracker.component';
import { FullscreenSheetComponent } from '../fullscreen-sheet/fullscreen-sheet.component';
import { GameplayHudComponent } from '../gameplay-hud/gameplay-hud.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    GridComponent, GmPanelComponent, RightPanelComponent, BottomBarComponent, 
    StorySlidesComponent, SceneFilmstripComponent, MatIconModule, CommonModule, 
    ItemInteractionModalComponent, AttackModalComponent, DamageModalComponent, 
    LevelUpModalComponent, CombatTrackerComponent, FullscreenSheetComponent, 
    GameplayHudComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col h-screen w-screen overflow-hidden bg-black text-stone-200 font-sans relative">
      
      <!-- Gameplay HUD (Play Mode Only) -->
      @if (combat.isPlayMode()) {
        <app-gameplay-hud></app-gameplay-hud>
      }

      <!-- Main Content Area -->
      <div class="flex flex-1 overflow-hidden relative">
        
        <!-- Left Panel (GM Only) -->
        @if (auth.currentUser()?.role === 'GM' && combat.gmPanelVisible() && combat.uiVisible()) {
          <app-gm-panel></app-gm-panel>
        }

        <!-- Center Map or Slides -->
        <div class="flex-1 relative z-10 flex flex-col">
          @if (!combat.showStorySlides() && combat.uiVisible()) {
            <app-scene-filmstrip></app-scene-filmstrip>
          }
          
          <div class="flex-1 relative">
            @if (combat.showStorySlides()) {
              <app-story-slides [slides]="combat.storySlides()"></app-story-slides>
            } @else {
              <!-- Combat Tracker (Ancorado no mapa, lado esquerdo) -->
              @if (combat.combatActive() && combat.uiVisible()) {
                <app-combat-tracker class="absolute top-20 left-4 bottom-8 z-20"></app-combat-tracker>
              }
              <app-grid></app-grid>
            }
          </div>
        </div>

        <!-- Right Panel (Token Details) -->
        @if (combat.uiVisible() && combat.selectedTokenId()) {
          <app-right-panel></app-right-panel>
        }

      </div>

      <!-- Bottom Bar -->
      <app-bottom-bar></app-bottom-bar>
      
      <!-- Floating Notifications -->
      <div class="absolute top-16 right-4 z-50 flex flex-col gap-2 w-80 pointer-events-none">
        @for (notif of combat.notifications(); track notif.id) {
          <div class="bg-stone-900/90 border border-stone-700 rounded p-3 shadow-lg flex items-start gap-2 animate-in slide-in-from-right pointer-events-auto backdrop-blur-sm">
            <div class="flex-1">
              <p class="text-xs font-bold" 
                 [class.text-amber-500]="notif.type === 'xp'" 
                 [class.text-green-500]="notif.type === 'level-up'" 
                 [class.text-blue-400]="notif.type === 'info'"
                 [class.text-red-500]="notif.type === 'error'">
                {{ notif.type === 'xp' ? 'XP Recebido' : notif.type === 'level-up' ? 'Subiu de Nível!' : notif.type === 'error' ? 'Ação Inválida' : 'Informação' }}
              </p>
              <p class="text-[10px] text-stone-300">{{ notif.message }}</p>
            </div>
            <button class="text-stone-500 hover:text-stone-300" (click)="combat.removeNotification(notif.id)">
              <mat-icon style="font-size: 14px; width: 14px; height: 14px;">close</mat-icon>
            </button>
          </div>
        }
      </div>

      <!-- Modals -->
      <app-item-interaction-modal></app-item-interaction-modal>
      <app-attack-modal></app-attack-modal>
      <app-damage-modal></app-damage-modal>
      <app-level-up-modal></app-level-up-modal>
      <app-fullscreen-sheet></app-fullscreen-sheet>

      <!-- Chapter Selection Modal -->
      @if (combat.showChapterModal()) {
        <div class="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div class="bg-stone-900 border border-amber-900/50 p-8 rounded-2xl shadow-2xl max-w-lg w-full mx-4 space-y-6"
               style="animation: fadeIn 0.3s ease-out">
            <div class="text-center space-y-2">
              <mat-icon class="text-amber-500" style="font-size: 48px; width: 48px; height: 48px;">auto_stories</mat-icon>
              <h2 class="text-2xl font-serif text-amber-500">Capítulo {{ combat.currentChapterNumber() }}</h2>
              <p class="text-sm text-stone-400">
                Existem <strong class="text-amber-400">{{ combat.storySlides().length }}</strong> cenas salvas da última sessão.
              </p>
            </div>
            
            <div class="space-y-3">
              <button (click)="combat.continueCurrentChapter()"
                      class="w-full py-3 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold rounded-lg text-sm transition-colors flex items-center justify-center gap-3 shadow-lg">
                <mat-icon style="font-size: 20px; width: 20px; height: 20px;">play_arrow</mat-icon>
                Continuar Capítulo Atual
              </button>
              <p class="text-[10px] text-stone-500 text-center -mt-1">Carrega os slides e imagens da última sessão.</p>
              
              <button (click)="combat.startNewChapter()"
                      class="w-full py-3 bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold rounded-lg text-sm border border-stone-700 transition-colors flex items-center justify-center gap-3">
                <mat-icon style="font-size: 20px; width: 20px; height: 20px;">add_circle</mat-icon>
                Novo Capítulo
              </button>
              <p class="text-[10px] text-stone-500 text-center -mt-1">Arquiva os slides atuais e inicia nova narrativa.</p>
            </div>

            @if (combat.chapterHistory().length > 0) {
              <div class="pt-4 border-t border-stone-800">
                <h4 class="text-xs text-stone-500 uppercase font-bold mb-2 flex items-center gap-1">
                  <mat-icon style="font-size: 14px; width: 14px; height: 14px;">history</mat-icon>
                  Capítulos Arquivados ({{ combat.chapterHistory().length }})
                </h4>
                <div class="space-y-1 max-h-32 overflow-y-auto">
                  @for (chapter of combat.chapterHistory(); track chapter.id) {
                    <div class="text-[10px] text-stone-400 bg-stone-800/50 px-2 py-1 rounded flex justify-between">
                      <span>{{ chapter.title }} ({{ chapter.slides.length }} cenas)</span>
                      <span class="text-stone-600">{{ chapter.archivedAt | date:'dd/MM/yyyy' }}</span>
                    </div>
                  }
                </div>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `
})
export class LayoutComponent {
  auth = inject(AuthService);
  combat = inject(CombatService);
}
