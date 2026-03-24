import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { GridComponent } from '../grid/grid.component';
import { GmPanelComponent } from '../gm-panel/gm-panel.component';
import { RightPanelComponent } from '../right-panel/right-panel.component';
import { BottomBarComponent } from '../bottom-bar/bottom-bar.component';
import { StorySlidesComponent } from '../story-slides/story-slides.component';
import { AuthService } from '../../services/auth.service';
import { CombatService } from '../../services/combat.service';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { ItemInteractionModalComponent } from '../item-interaction-modal/item-interaction-modal.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [GridComponent, GmPanelComponent, RightPanelComponent, BottomBarComponent, StorySlidesComponent, MatIconModule, CommonModule, ItemInteractionModalComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col h-screen w-screen overflow-hidden bg-black text-stone-200 font-sans">
      
      <!-- Main Content Area -->
      <div class="flex flex-1 overflow-hidden relative">
        
        <!-- Left Panel (GM Only) -->
        @if (auth.currentUser()?.role === 'GM' && combat.uiVisible()) {
          <app-gm-panel class="z-20 shadow-2xl"></app-gm-panel>
        }

        <!-- Center Map or Slides -->
        <div class="flex-1 relative z-10">
          @if (combat.showStorySlides()) {
            <app-story-slides [slides]="combat.storySlides()"></app-story-slides>
          } @else {
            <app-grid></app-grid>
          }
        </div>

        <!-- Right Panel (Chat/Abilities) -->
        @if (combat.uiVisible()) {
          <app-right-panel class="z-20 shadow-2xl"></app-right-panel>
        }

      </div>

      <!-- Bottom Bar -->
      <app-bottom-bar></app-bottom-bar>
      
      <!-- Modals -->
      <app-item-interaction-modal></app-item-interaction-modal>
    </div>
  `
})
export class LayoutComponent {
  auth = inject(AuthService);
  combat = inject(CombatService);
}
