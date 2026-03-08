import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { GridComponent } from '../grid/grid.component';
import { GmPanelComponent } from '../gm-panel/gm-panel.component';
import { RightPanelComponent } from '../right-panel/right-panel.component';
import { BottomBarComponent } from '../bottom-bar/bottom-bar.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [GridComponent, GmPanelComponent, RightPanelComponent, BottomBarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col h-screen w-screen overflow-hidden bg-black text-stone-200 font-sans">
      
      <!-- Main Content Area -->
      <div class="flex flex-1 overflow-hidden relative">
        
        <!-- Left Panel (GM Only) -->
        @if (auth.currentUser()?.role === 'GM') {
          <app-gm-panel class="z-20 shadow-2xl"></app-gm-panel>
        }

        <!-- Center Map -->
        <div class="flex-1 relative z-10">
          <app-grid></app-grid>
        </div>

        <!-- Right Panel (Chat/Abilities) -->
        <app-right-panel class="z-20 shadow-2xl"></app-right-panel>

      </div>

      <!-- Bottom Bar -->
      <app-bottom-bar></app-bottom-bar>
    </div>
  `
})
export class LayoutComponent {
  auth = inject(AuthService);
}
