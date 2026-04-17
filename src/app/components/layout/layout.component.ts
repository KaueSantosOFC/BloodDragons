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

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [GridComponent, GmPanelComponent, RightPanelComponent, BottomBarComponent, StorySlidesComponent, SceneFilmstripComponent, MatIconModule, CommonModule, ItemInteractionModalComponent, AttackModalComponent, DamageModalComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col h-screen w-screen overflow-hidden bg-black text-stone-200 font-sans">
      
      <!-- Main Content Area -->
      <div class="flex flex-1 overflow-hidden relative">
        
        <!-- Left Panel (GM Only) -->
        @if (auth.currentUser()?.role === 'GM' && combat.gmPanelVisible() && combat.uiVisible()) {
          <app-gm-panel class="z-20 shadow-2xl"></app-gm-panel>
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
              <app-grid></app-grid>
            }
          </div>
        </div>

        <!-- Right Panel (Token Details) -->
        @if (combat.uiVisible() && combat.selectedTokenId()) {
          <app-right-panel class="z-20 shadow-2xl"></app-right-panel>
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
    </div>
  `
})
export class LayoutComponent {
  auth = inject(AuthService);
  combat = inject(CombatService);
}
