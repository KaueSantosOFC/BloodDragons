import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-gm-panel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-80 h-full bg-stone-900 border-r border-stone-800 flex flex-col text-stone-300">
      <!-- Tabs -->
      <div class="flex border-b border-stone-800 text-xs font-mono">
        <button class="flex-1 py-3 text-amber-500 border-b-2 border-amber-500 bg-stone-800">Story</button>
        <button class="flex-1 py-3 hover:bg-stone-800 transition-colors">PCs</button>
        <button class="flex-1 py-3 hover:bg-stone-800 transition-colors">NPCs</button>
        <button class="flex-1 py-3 hover:bg-stone-800 transition-colors">Monsters</button>
      </div>
      
      <!-- Content Area (Parchment Style) -->
      <div class="flex-1 overflow-auto p-4 bg-[#f4e4bc] text-stone-900 shadow-inner relative">
        <!-- Texture overlay -->
        <div class="absolute inset-0 opacity-10 pointer-events-none" style="background-image: url('https://www.transparenttextures.com/patterns/aged-paper.png');"></div>
        
        <h3 class="font-serif text-xl font-bold border-b border-stone-400 pb-2 mb-4">Session Notes</h3>
        
        <p class="font-serif text-sm leading-relaxed mb-4">
          The party approaches the ruined temple of <span class="font-bold text-red-800">BloodDragons</span>. 
          A thick fog obscures the entrance, and the smell of sulfur hangs heavy in the air.
        </p>
        
        <div class="bg-stone-100/50 p-3 rounded border border-stone-300 font-mono text-xs">
          <strong>GM Secret:</strong> The statues by the door are actually Gargoyles waiting to ambush.
        </div>
      </div>
    </div>
  `
})
export class GmPanelComponent {}
