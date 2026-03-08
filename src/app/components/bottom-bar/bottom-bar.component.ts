import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-bottom-bar',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="h-14 bg-stone-900 border-t border-stone-800 flex items-center justify-between px-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.3)] z-30">
      
      <!-- Left: User Info -->
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-full bg-stone-800 border border-stone-700 flex items-center justify-center text-xs font-bold text-stone-400">
          {{ currentUser()?.displayName | slice:0:2 | uppercase }}
        </div>
        <div class="flex flex-col">
          <span class="text-sm font-bold text-stone-200">{{ currentUser()?.displayName }}</span>
          <span class="text-[10px] font-mono text-amber-500">{{ currentUser()?.role }}</span>
        </div>
      </div>

      <!-- Center: Quick Actions -->
      <div class="flex gap-2">
        <button class="w-10 h-10 rounded-full bg-stone-800 border border-stone-700 text-stone-400 flex items-center justify-center hover:bg-stone-700 hover:text-amber-500 hover:border-amber-500/50 transition-all" title="Roll Dice">
          <mat-icon style="font-size: 20px; width: 20px; height: 20px;">casino</mat-icon>
        </button>
        <button class="w-10 h-10 rounded-full bg-stone-800 border border-stone-700 text-stone-400 flex items-center justify-center hover:bg-stone-700 hover:text-amber-500 hover:border-amber-500/50 transition-all" title="Character Sheet">
          <mat-icon style="font-size: 20px; width: 20px; height: 20px;">assignment_ind</mat-icon>
        </button>
        <div class="w-px h-6 bg-stone-700 mx-1 self-center"></div>
        <button class="w-10 h-10 rounded-full bg-stone-800 border border-stone-700 text-stone-400 flex items-center justify-center hover:bg-stone-700 hover:text-amber-500 hover:border-amber-500/50 transition-all" title="Toggle Grid">
          <mat-icon style="font-size: 20px; width: 20px; height: 20px;">grid_on</mat-icon>
        </button>
        <button class="w-10 h-10 rounded-full bg-stone-800 border border-stone-700 text-stone-400 flex items-center justify-center hover:bg-stone-700 hover:text-amber-500 hover:border-amber-500/50 transition-all" title="Measure Distance">
          <mat-icon style="font-size: 20px; width: 20px; height: 20px;">straighten</mat-icon>
        </button>
      </div>

      <!-- Right: Role Switcher (For Demo) -->
      <div class="flex gap-2">
        <button class="text-xs font-mono px-2 py-1 rounded border border-stone-700 hover:bg-stone-800 transition-colors"
                [class.text-amber-500]="currentUser()?.role === 'GM'"
                (click)="auth.loginAs('GM')">
          Be GM
        </button>
        <button class="text-xs font-mono px-2 py-1 rounded border border-stone-700 hover:bg-stone-800 transition-colors"
                [class.text-amber-500]="currentUser()?.role === 'PLAYER'"
                (click)="auth.loginAs('PLAYER')">
          Be Player
        </button>
      </div>

    </div>
  `
})
export class BottomBarComponent {
  auth = inject(AuthService);
  currentUser = this.auth.currentUser;
}
