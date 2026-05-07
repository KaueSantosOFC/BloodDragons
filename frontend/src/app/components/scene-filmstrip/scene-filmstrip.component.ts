import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { DragDropModule, CdkDragDrop } from '@angular/cdk/drag-drop';
import { CombatService } from '../../services/combat.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-scene-filmstrip',
  standalone: true,
  imports: [CommonModule, MatIconModule, DragDropModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (auth.currentUser()?.role === 'GM' && combat.uiVisible()) {
      <div class="w-full bg-stone-900/90 border-b border-stone-700 p-2 flex items-center gap-2 z-30 overflow-x-auto custom-scrollbar backdrop-blur-sm">
        
        <div class="flex items-center gap-2 pr-4 border-r border-stone-700">
          <span class="text-amber-500 font-bold text-sm whitespace-nowrap">Cenas do Mapa</span>
          <button (click)="saveCurrentAsScene()" class="bg-stone-800 hover:bg-stone-700 text-stone-300 p-1.5 rounded border border-stone-600 transition-colors flex items-center justify-center" title="Salvar Estado Atual como Cena">
            <mat-icon style="font-size: 16px; width: 16px; height: 16px;">save</mat-icon>
          </button>
          <button (click)="createBlankScene()" class="bg-stone-800 hover:bg-stone-700 text-stone-300 p-1.5 rounded border border-stone-600 transition-colors flex items-center justify-center" title="Nova Cena em Branco">
            <mat-icon style="font-size: 16px; width: 16px; height: 16px;">add_box</mat-icon>
          </button>
        </div>

        <div class="flex gap-2 px-2" cdkDropList cdkDropListOrientation="horizontal" (cdkDropListDropped)="dropScene($event)">
          @for (scene of combat.scenes(); track scene.id; let i = $index) {
            <div class="relative group flex-shrink-0 cursor-pointer rounded border-2 transition-all duration-200 w-32 h-20 overflow-hidden"
                 cdkDrag
                 tabindex="0"
                 [class.border-amber-500]="combat.activeSceneId() === scene.id"
                 [class.border-stone-700]="combat.activeSceneId() !== scene.id"
                 [class.opacity-60]="combat.activeSceneId() !== scene.id"
                 [class.hover:opacity-100]="combat.activeSceneId() !== scene.id"
                 (click)="loadScene(scene.id)"
                 (keyup.enter)="loadScene(scene.id)">
              
              <div *cdkDragPlaceholder class="w-32 h-20 rounded border-2 border-dashed border-stone-500 bg-stone-800/50"></div>
              
              @if (scene.mapBackgroundImage) {
                <img [src]="scene.mapBackgroundImage" alt="Background" class="w-full h-full object-cover" referrerpolicy="no-referrer">
              } @else {
                <div class="w-full h-full bg-stone-800 flex items-center justify-center">
                  <mat-icon class="text-stone-600">map</mat-icon>
                </div>
              }
              
              <div class="absolute bottom-0 left-0 right-0 bg-black/70 p-0.5">
                <input type="text" 
                       [value]="scene.name" 
                       (click)="$event.stopPropagation()"
                       (change)="updateSceneName(scene.id, $event)"
                       class="w-full bg-transparent text-[10px] text-stone-300 text-center focus:outline-none focus:bg-stone-800 focus:text-amber-500 rounded px-1 transition-colors">
              </div>

              <!-- Drag Handle -->
              <div cdkDragHandle tabindex="0" class="absolute top-1 left-1 w-6 h-6 bg-black/60 text-white rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing hover:bg-black/80" (keyup.enter)="$event.stopPropagation()" (click)="$event.stopPropagation()">
                <mat-icon style="font-size: 14px; width: 14px; height: 14px;">drag_indicator</mat-icon>
              </div>

              <button (click)="$event.stopPropagation(); deleteScene(scene.id)" 
                      class="absolute top-1 right-1 w-6 h-6 bg-red-900/80 text-white rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600">
                <mat-icon style="font-size: 14px; width: 14px; height: 14px;">delete</mat-icon>
              </button>
            </div>
          }
          
          @if (combat.scenes().length === 0) {
            <div class="text-stone-500 text-xs italic flex items-center px-4">
              Nenhuma cena criada. Crie uma nova cena para começar.
            </div>
          }
        </div>
      </div>
    }
  `
})
export class SceneFilmstripComponent {
  combat = inject(CombatService);
  auth = inject(AuthService);

  dropScene(event: CdkDragDrop<unknown[]>) {
    if (event.previousIndex !== event.currentIndex) {
      this.combat.reorderScenes(event.previousIndex, event.currentIndex);
    }
  }

  createBlankScene() {
    if (!this.combat.activeSceneId() && (this.combat.tokens().length > 0 || this.combat.mapBackgroundImage())) {
      this.saveCurrentAsScene();
    }
    const name = `Cena ${this.combat.scenes().length + 1}`;
    this.combat.createBlankScene(name);
  }

  saveCurrentAsScene() {
    const activeId = this.combat.activeSceneId();
    let name = `Cena ${this.combat.scenes().length + 1}`;
    
    if (activeId) {
      const activeScene = this.combat.scenes().find(s => s.id === activeId);
      if (activeScene) {
        name = `${activeScene.name} (Cópia)`;
      }
    }
    
    this.combat.createScene(name);
  }

  updateSceneName(id: string, event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.value.trim()) {
      this.combat.updateSceneName(id, input.value.trim());
    } else {
      // Revert to original if empty
      const scene = this.combat.scenes().find(s => s.id === id);
      if (scene) {
        input.value = scene.name;
      }
    }
  }

  loadScene(id: string) {
    if (!this.combat.activeSceneId() && (this.combat.tokens().length > 0 || this.combat.mapBackgroundImage())) {
      this.saveCurrentAsScene();
    }
    this.combat.loadScene(id);
  }

  deleteScene(id: string) {
    this.combat.deleteScene(id);
  }
}
