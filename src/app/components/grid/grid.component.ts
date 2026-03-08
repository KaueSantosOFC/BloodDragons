import { Component, ChangeDetectionStrategy, signal, computed, inject, ViewChild, ElementRef } from '@angular/core';
import { CdkDragEnd, DragDropModule } from '@angular/cdk/drag-drop';
import { DndMathService } from '../../services/dnd-math.service';
import { AuthService } from '../../services/auth.service';
import { CombatService } from '../../services/combat.service';
import { CommonModule } from '@angular/common';
import { Token } from '../../models/token';
import { Ability } from '../../models/ability';

@Component({
  selector: 'app-grid',
  standalone: true,
  imports: [CommonModule, DragDropModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative w-full h-full overflow-hidden bg-stone-900 flex flex-col">
      <div class="absolute top-4 left-4 z-30 text-sm font-mono bg-stone-900/80 text-amber-500 p-2 rounded border border-amber-900/50 backdrop-blur-sm shadow-lg">
        Distance to origin: {{ distanceToOrigin() }} m
      </div>
      
      <div class="relative overflow-auto flex-1 cursor-crosshair" #gridContainer
           tabindex="0"
           (mousemove)="onMouseMove($event)"
           (click)="onClick()"
           (keydown.enter)="onClick()">
        
        <!-- Grid Background -->
        <div class="absolute inset-0 pointer-events-none opacity-20"
             [style.backgroundSize]="gridSize + 'px ' + gridSize + 'px'"
             style="background-image: linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px);">
        </div>

        <!-- Tokens -->
        <div class="relative w-[3000px] h-[3000px]">
          
          <!-- Area Preview SVG -->
          @if (previewAbility()) {
            <svg class="absolute inset-0 w-full h-full pointer-events-none z-20">
              <path [attr.d]="areaPath()" fill="rgba(245, 158, 11, 0.3)" stroke="#f59e0b" stroke-width="2" />
            </svg>
          }

          @for (token of tokens(); track token.id) {
            <div class="absolute rounded-full shadow-lg border-2 flex flex-col items-center justify-center transition-shadow hover:shadow-amber-500/50 z-10 group"
                 [class.cursor-grab]="canMove(token)"
                 [class.active:cursor-grabbing]="canMove(token)"
                 [class.cursor-not-allowed]="!canMove(token)"
                 [class.border-amber-500]="token.controlledBy === currentUser()?.id && !isAffected(token)"
                 [class.border-stone-400]="token.controlledBy !== currentUser()?.id && !isAffected(token)"
                 [class.!border-red-500]="isAffected(token)"
                 [class.shadow-[0_0_15px_rgba(239,68,68,0.8)]]="isAffected(token)"
                 [style.backgroundColor]="token.color"
                 [style.width.px]="gridSize"
                 [style.height.px]="gridSize"
                 [style.transform]="'translate3d(' + (token.x * gridSize) + 'px, ' + (token.y * gridSize) + 'px, 0)'"
                 cdkDrag
                 [cdkDragDisabled]="!canMove(token)"
                 (cdkDragEnded)="onDragEnded($event, token)">
              
              <!-- Token Image or Initials -->
              @if (token.imageUrl) {
                <img [src]="token.imageUrl" class="w-full h-full rounded-full object-cover pointer-events-none" alt="Token" referrerpolicy="no-referrer" />
              } @else {
                <span class="font-bold text-white text-shadow pointer-events-none">{{ token.name | slice:0:2 }}</span>
              }

              <!-- HP Bar -->
              <div class="absolute -bottom-3 left-0 right-0 h-2 bg-red-900 rounded-full overflow-hidden border border-stone-900 pointer-events-none">
                <div class="h-full bg-green-500 transition-all duration-300" [style.width.%]="(token.hp / token.maxHp) * 100"></div>
              </div>

              <!-- Conditions -->
              @if (token.conditions.length > 0) {
                <div class="absolute -top-2 -right-2 flex gap-1 pointer-events-none">
                  @for (cond of token.conditions; track cond) {
                    <div class="w-4 h-4 bg-purple-600 rounded-full border border-white text-[8px] flex items-center justify-center text-white" title="{{cond}}">
                      {{cond | slice:0:1}}
                    </div>
                  }
                </div>
              }

              <!-- Tooltip -->
              <div class="absolute -top-8 bg-stone-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-stone-700">
                {{ token.name }} ({{ token.hp }}/{{ token.maxHp }})
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .text-shadow { text-shadow: 0 1px 2px rgba(0,0,0,0.8); }
  `]
})
export class GridComponent {
  private mathService = inject(DndMathService);
  private authService = inject(AuthService);
  private combat = inject(CombatService);
  
  @ViewChild('gridContainer') gridContainer!: ElementRef<HTMLDivElement>;

  readonly gridSize = 64; // 1 Grid Unit = 1.5m = 64px
  
  currentUser = this.authService.currentUser;
  previewAbility = this.combat.previewAbility;

  // State
  tokens = signal<Token[]>([
    { id: 't1', name: 'Fighter Bob', x: 2, y: 2, hp: 45, maxHp: 45, conditions: [], controlledBy: 'user_player_1', color: '#ef4444' },
    { id: 't2', name: 'Wizard Alice', x: 4, y: 5, hp: 22, maxHp: 22, conditions: ['Mage Armor'], controlledBy: 'user_player_2', color: '#3b82f6' },
    { id: 't3', name: 'Goblin Boss', x: 8, y: 3, hp: 15, maxHp: 25, conditions: ['Poisoned'], controlledBy: 'user_gm_1', color: '#22c55e', imageUrl: 'https://picsum.photos/seed/goblin/128/128' },
    { id: 't4', name: 'Goblin Minion', x: 9, y: 4, hp: 7, maxHp: 7, conditions: [], controlledBy: 'user_gm_1', color: '#22c55e' },
    { id: 't5', name: 'Goblin Minion', x: 7, y: 4, hp: 7, maxHp: 7, conditions: [], controlledBy: 'user_gm_1', color: '#22c55e' },
  ]);

  distanceToOrigin = computed(() => {
    const t1 = this.tokens().find(t => t.id === 't1');
    if (!t1) return 0;
    return this.mathService.calculateDistanceMeters(0, 0, t1.x, t1.y);
  });

  affectedTokens = computed(() => {
    const ability = this.combat.previewAbility();
    const origin = this.combat.previewOrigin();
    const target = this.combat.previewTarget();
    if (!ability || !origin || !target) return [];

    return this.tokens().filter(t => this.isTokenInArea(t, ability, origin, target));
  });

  areaPath = computed(() => {
    const ability = this.combat.previewAbility();
    const origin = this.combat.previewOrigin();
    const target = this.combat.previewTarget();
    if (!ability || !origin || !target) return '';

    const gridSize = this.gridSize;
    const pixelsPerMeter = gridSize / 1.5;
    
    const ox = (origin.x + 0.5) * gridSize;
    const oy = (origin.y + 0.5) * gridSize;
    
    const dx = target.x - ox;
    const dy = target.y - oy;
    const angle = Math.atan2(dy, dx);
    
    if (ability.areaShape === 'cone') {
      const rangePx = ability.range * pixelsPerMeter;
      const coneAngleRad = (ability.angle || 60) * Math.PI / 180;
      
      const a1 = angle - coneAngleRad / 2;
      const a2 = angle + coneAngleRad / 2;
      
      const x1 = ox + Math.cos(a1) * rangePx;
      const y1 = oy + Math.sin(a1) * rangePx;
      const x2 = ox + Math.cos(a2) * rangePx;
      const y2 = oy + Math.sin(a2) * rangePx;
      
      return `M ${ox} ${oy} L ${x1} ${y1} A ${rangePx} ${rangePx} 0 0 1 ${x2} ${y2} Z`;
    }
    
    if (ability.areaShape === 'circle') {
      const radiusPx = (ability.radius || 0) * pixelsPerMeter;
      return `M ${target.x - radiusPx} ${target.y} a ${radiusPx},${radiusPx} 0 1,0 ${radiusPx * 2},0 a ${radiusPx},${radiusPx} 0 1,0 -${radiusPx * 2},0`;
    }
    
    if (ability.areaShape === 'line') {
      const lengthPx = (ability.length || ability.range) * pixelsPerMeter;
      const widthPx = (ability.width || 1.5) * pixelsPerMeter;
      
      const nx = Math.cos(angle);
      const ny = Math.sin(angle);
      const px = -ny;
      const py = nx;
      
      const halfW = widthPx / 2;
      
      const p1x = ox + px * halfW;
      const p1y = oy + py * halfW;
      
      const p2x = ox - px * halfW;
      const p2y = oy - py * halfW;
      
      const p3x = p2x + nx * lengthPx;
      const p3y = p2y + ny * lengthPx;
      
      const p4x = p1x + nx * lengthPx;
      const p4y = p1y + ny * lengthPx;
      
      return `M ${p1x} ${p1y} L ${p2x} ${p2y} L ${p3x} ${p3y} L ${p4x} ${p4y} Z`;
    }
    
    if (ability.areaShape === 'rectangle') {
      const widthPx = (ability.width || 6) * pixelsPerMeter;
      const lengthPx = (ability.length || 1.5) * pixelsPerMeter;
      
      const x = target.x - widthPx / 2;
      const y = target.y - lengthPx / 2;
      
      return `M ${x} ${y} h ${widthPx} v ${lengthPx} h -${widthPx} Z`;
    }
    
    return '';
  });

  canMove(token: Token): boolean {
    const user = this.currentUser();
    if (!user) return false;
    if (user.role === 'GM') return true;
    return token.controlledBy === user.id;
  }

  isAffected(token: Token): boolean {
    return this.affectedTokens().some(t => t.id === token.id);
  }

  isTokenInArea(token: Token, ability: Ability, origin: {x: number, y: number}, target: {x: number, y: number}): boolean {
    const gridSize = this.gridSize;
    const pixelsPerMeter = gridSize / 1.5;
    
    const tx = (token.x + 0.5) * gridSize;
    const ty = (token.y + 0.5) * gridSize;
    
    const ox = (origin.x + 0.5) * gridSize;
    const oy = (origin.y + 0.5) * gridSize;
    
    const dx = target.x - ox;
    const dy = target.y - oy;
    const angle = Math.atan2(dy, dx);
    
    const distToToken = Math.hypot(tx - ox, ty - oy);
    const angleToToken = Math.atan2(ty - oy, tx - ox);
    
    if (ability.areaShape === 'cone') {
      const rangePx = ability.range * pixelsPerMeter;
      if (distToToken > rangePx) return false;
      
      let angleDiff = Math.abs(angleToToken - angle);
      if (angleDiff > Math.PI) angleDiff = 2 * Math.PI - angleDiff;
      
      const coneAngleRad = (ability.angle || 60) * Math.PI / 180;
      return angleDiff <= coneAngleRad / 2;
    }
    
    if (ability.areaShape === 'circle') {
      const radiusPx = (ability.radius || 0) * pixelsPerMeter;
      const distToTarget = Math.hypot(tx - target.x, ty - target.y);
      return distToTarget <= radiusPx;
    }
    
    if (ability.areaShape === 'line') {
      const lengthPx = (ability.length || ability.range) * pixelsPerMeter;
      const widthPx = (ability.width || 1.5) * pixelsPerMeter;
      
      const tdx = tx - ox;
      const tdy = ty - oy;
      
      const lineLen = Math.hypot(dx, dy) || 1;
      const nx = dx / lineLen;
      const ny = dy / lineLen;
      
      const proj = tdx * nx + tdy * ny;
      if (proj < 0 || proj > lengthPx) return false;
      
      const perp = Math.abs(tdx * (-ny) + tdy * nx);
      return perp <= widthPx / 2;
    }
    
    if (ability.areaShape === 'rectangle') {
      const widthPx = (ability.width || 6) * pixelsPerMeter;
      const lengthPx = (ability.length || 1.5) * pixelsPerMeter;
      return Math.abs(tx - target.x) <= widthPx / 2 && Math.abs(ty - target.y) <= lengthPx / 2;
    }
    
    return false;
  }

  onMouseMove(event: MouseEvent) {
    if (!this.combat.previewAbility() || !this.gridContainer) return;
    
    const rect = this.gridContainer.nativeElement.getBoundingClientRect();
    const scrollLeft = this.gridContainer.nativeElement.scrollLeft;
    const scrollTop = this.gridContainer.nativeElement.scrollTop;
    
    const x = event.clientX - rect.left + scrollLeft;
    const y = event.clientY - rect.top + scrollTop;
    
    this.combat.updateTarget(x, y);
  }

  onClick() {
    const ability = this.combat.previewAbility();
    if (ability) {
      const affected = this.affectedTokens();
      console.log(`Confirmed attack: ${ability.name}`);
      console.log(`Affected tokens:`, affected.map(t => t.name));
      
      // Apply damage (mock)
      const damageRoll = this.mathService.rollDice(6, 8); // Mocking 8d6
      console.log(`Rolled ${damageRoll} ${ability.damageType} damage!`);
      
      this.tokens.update(tokens => 
        tokens.map(t => {
          if (affected.find(a => a.id === t.id)) {
            return { ...t, hp: Math.max(0, t.hp - damageRoll) };
          }
          return t;
        })
      );
      
      this.combat.cancelPreview();
    }
  }

  onDragEnded(event: CdkDragEnd, token: Token) {
    if (!this.canMove(token)) {
      event.source.reset();
      return;
    }

    const dropPoint = event.source.getFreeDragPosition();
    const currentPixelX = (token.x * this.gridSize) + dropPoint.x;
    const currentPixelY = (token.y * this.gridSize) + dropPoint.y;
    
    const newGridX = Math.round(currentPixelX / this.gridSize);
    const newGridY = Math.round(currentPixelY / this.gridSize);
    
    event.source.reset();
    
    this.tokens.update(tokens => 
      tokens.map(t => 
        t.id === token.id 
          ? { ...t, x: Math.max(0, newGridX), y: Math.max(0, newGridY) } 
          : t
      )
    );
    
    this.syncToFirestore(token.id, newGridX, newGridY);
  }
  
  private syncToFirestore(tokenId: string, x: number, y: number) {
    console.log(`Syncing token ${tokenId} to Firestore at (${x}, ${y})`);
  }
}
