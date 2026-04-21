import { Component, ChangeDetectionStrategy, computed, inject, ViewChild, ElementRef } from '@angular/core';
import { CdkDragEnd, CdkDragMove, DragDropModule } from '@angular/cdk/drag-drop';
import { FormsModule } from '@angular/forms';
import { DndMathService } from '../../services/dnd-math.service';
import { AuthService } from '../../services/auth.service';
import { CombatService } from '../../services/combat.service';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Token } from '../../models/token';
import { Ability } from '../../models/ability';

@Component({
  selector: 'app-grid',
  standalone: true,
  imports: [CommonModule, DragDropModule, MatIconModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative w-full h-full overflow-hidden bg-stone-950 flex flex-col" 
         (wheel)="onWheel($event)"
         (mousedown)="onMouseDown($event)"
         (mousemove)="onGlobalMouseMove($event)"
         (mouseup)="onMouseUp()"
         (contextmenu)="$event.preventDefault()">
      <div class="absolute top-4 left-4 z-30 flex flex-col gap-2">
        <div class="flex items-center gap-2">
          <div class="text-[10px] font-mono bg-stone-900/80 text-stone-400 p-1 px-2 rounded border border-stone-800 backdrop-blur-sm">
            Zoom: {{ (combat.zoom() * 100).toFixed(0) }}% | Pan: {{ combat.pan().x.toFixed(0) }}, {{ combat.pan().y.toFixed(0) }}
          </div>
          <button (click)="resetView()" class="p-1 bg-stone-900/80 text-stone-400 hover:text-amber-500 rounded border border-stone-800 backdrop-blur-sm transition-colors" title="Redefinir Visualização">
            <mat-icon style="font-size: 14px; width: 14px; height: 14px;">restart_alt</mat-icon>
          </button>
        </div>
      </div>
      
      <div class="relative flex-1 bg-stone-950 overflow-hidden" #gridContainer
           [class.cursor-grab]="combat.isPanMode() && !isPanning"
           [class.cursor-grabbing]="isPanning">
        <div class="absolute inset-0 origin-top-left transition-transform duration-75 ease-out"
             [style.transform]="'translate(' + combat.pan().x + 'px, ' + combat.pan().y + 'px) scale(' + combat.zoom() + ')'">
          
          <div class="relative" [style.width.px]="mapWidth()" [style.height.px]="mapHeight()" #boundary>
            <!-- Map Background Image -->
            @if (mapBackgroundImage()) {
              <img [src]="mapBackgroundImage()" 
                   class="absolute inset-0 w-full h-full object-contain pointer-events-none z-0 opacity-90" 
                   (load)="onMapLoad($event)"
                   alt="Fundo do Mapa" referrerpolicy="no-referrer" />
            } @else {
              <div class="absolute inset-0 w-full h-full bg-stone-900"></div>
            }

            <!-- Grid Background -->
            <div class="absolute inset-0 pointer-events-none opacity-20 z-10"
                 [style.backgroundSize]="gridSize + 'px ' + gridSize + 'px'"
                 style="background-image: linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px);">
            </div>

            <!-- Fog of War Layer -->
            @if (combat.isFogEnabled()) {
              <div class="absolute inset-0 pointer-events-none z-25 overflow-hidden">
                @for (cell of combat.fogOfWar(); track cell) {
                  @let coords = getCoords(cell);
                  <div class="absolute bg-black transition-opacity duration-300"
                       [class.opacity-100]="currentUser()?.role !== 'GM' || combat.isPlayMode()"
                       [class.opacity-80]="currentUser()?.role === 'GM' && !combat.isPlayMode()"
                       [style.left.px]="coords.x * gridSize"
                       [style.top.px]="coords.y * gridSize"
                       [style.width.px]="gridSize"
                       [style.height.px]="gridSize">
                  </div>
                }
              </div>
            }

            <!-- Interaction Layer -->
            <div class="absolute inset-0 z-20 cursor-crosshair select-none outline-none caret-transparent"
                 tabindex="0"
                 (mousemove)="onMouseMove($event)"
                 (mousedown)="onGridMouseDown($event)"
                 (click)="onClick($event)"
                 (keydown.enter)="onClick()">
            </div>
            <!-- Area Preview SVG -->
            @if (previewAbility()) {
              <svg class="absolute inset-0 w-full h-full pointer-events-none z-5 animate-pulse" [attr.viewBox]="'0 0 ' + mapWidth() + ' ' + mapHeight()">
                <defs>
                  <!-- Lightning Filter -->
                  <filter id="lightningFilter" x="-20%" y="-20%" width="140%" height="140%">
                    <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="3" result="noise" />
                    <feDisplacementMap in="SourceGraphic" in2="noise" scale="15" xChannelSelector="R" yChannelSelector="G" />
                    <feGaussianBlur stdDeviation="2" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>

                  <!-- Fire Filter -->
                  <filter id="fireFilter" x="-20%" y="-20%" width="140%" height="140%">
                    <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" result="noise" />
                    <feDisplacementMap in="SourceGraphic" in2="noise" scale="8" xChannelSelector="R" yChannelSelector="G" />
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>

                  <!-- Acid Filter -->
                  <filter id="acidFilter" x="-20%" y="-20%" width="140%" height="140%">
                    <feTurbulence type="turbulence" baseFrequency="0.08" numOctaves="2" result="noise" />
                    <feDisplacementMap in="SourceGraphic" in2="noise" scale="10" xChannelSelector="R" yChannelSelector="G" />
                  </filter>

                  <!-- Cold Filter -->
                  <filter id="coldFilter">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                  
                  <!-- Basic Glow Filter -->
                  <filter id="glowFilter">
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                <!-- Max Range Circle Visual -->
                @if (previewAbility()?.range; as range) {
                  <circle 
                    [attr.cx]="(combat.previewOrigin()?.x || 0) * gridSize + gridSize / 2" 
                    [attr.cy]="(combat.previewOrigin()?.y || 0) * gridSize + gridSize / 2" 
                    [attr.r]="range * (gridSize / 1.5)" 
                    [attr.fill]="abilityVisuals().rangeFill" 
                    [attr.stroke]="abilityVisuals().rangeStroke" 
                    stroke-width="1" 
                    stroke-dasharray="10,5" />
                }
                <path 
                  [attr.d]="areaPath()" 
                  [attr.fill]="abilityVisuals().fill" 
                  [attr.stroke]="abilityVisuals().stroke" 
                  [attr.filter]="abilityVisuals().filter"
                  stroke-width="2" 
                  class="transition-colors duration-300" />
              </svg>
            }

            <!-- Measure Line -->
            @if (combat.isMeasuring() && combat.measureStart() && combat.measureCurrent()) {
              <svg class="absolute inset-0 w-full h-full pointer-events-none z-40" [attr.viewBox]="'0 0 ' + mapWidth() + ' ' + mapHeight()">
                <line 
                  [attr.x1]="combat.measureStart()!.x" 
                  [attr.y1]="combat.measureStart()!.y" 
                  [attr.x2]="combat.measureCurrent()!.x" 
                  [attr.y2]="combat.measureCurrent()!.y" 
                  stroke="#f59e0b" stroke-width="2" stroke-dasharray="5,5" />
                <circle [attr.cx]="combat.measureStart()!.x" [attr.cy]="combat.measureStart()!.y" r="4" fill="#f59e0b" />
                <circle [attr.cx]="combat.measureCurrent()!.x" [attr.cy]="combat.measureCurrent()!.y" r="4" fill="#f59e0b" />
              </svg>
              
              <!-- Distance Label -->
              <div class="absolute z-50 bg-stone-900/90 text-amber-500 text-xs font-bold px-2 py-1 rounded border border-amber-500/50 pointer-events-none transform -translate-x-1/2 -translate-y-full mt-[-10px]"
                   [style.left.px]="combat.measureCurrent()!.x"
                   [style.top.px]="combat.measureCurrent()!.y">
                {{ measureDistance() }}m
              </div>
            }

            @for (token of tokens(); track token.id) {
              @if (!isTokenHiddenByFog(token)) {
                <div class="absolute top-0 left-0 shadow-lg border-2 flex flex-col items-center justify-center transition-shadow hover:shadow-amber-500/50 z-30 group outline-none caret-transparent select-none"
                     tabindex="0"
                     [class.opacity-40]="isTokenInFog(token) && currentUser()?.role === 'GM' && !combat.isPlayMode() && token.type !== 'player'"
                     [class.grayscale]="isTokenInFog(token) && currentUser()?.role === 'GM' && !combat.isPlayMode() && token.type !== 'player'"
                     [class.rounded-full]="token.type !== 'item'"
                     [class.rounded-md]="token.type === 'item'"
                     [class.cursor-grab]="canMove(token)"
                     [class.active:cursor-grabbing]="canMove(token)"
                     [class.cursor-not-allowed]="!canMove(token)"
                     [class.pointer-events-none]="combat.isPanMode()"
                     [class.border-yellow-400]="token.type === 'player' && !isAffected(token) && selectedTokenId() !== token.id"
                     [class.border-red-500]="token.type === 'enemy' && !isAffected(token) && selectedTokenId() !== token.id"
                     [class.border-blue-500]="token.type === 'npc' && !isAffected(token) && selectedTokenId() !== token.id"
                     [class.border-black]="token.type === 'boss' && !isAffected(token) && selectedTokenId() !== token.id"
                     [class.border-purple-500]="token.type === 'item' && !isAffected(token) && selectedTokenId() !== token.id"
                     [class.border-stone-400]="!token.type && !isAffected(token) && selectedTokenId() !== token.id"
                     [class.!border-red-500]="isAffected(token)"
                     [class.!border-white]="selectedTokenId() === token.id && !isAffected(token)"
                     [class.shadow-[0_0_15px_rgba(255,255,255,0.8)]]="selectedTokenId() === token.id && !isAffected(token)"
                     [class.shadow-[0_0_15px_rgba(239,68,68,0.8)]]="isAffected(token)"
                     [style.backgroundColor]="token.color"
                     [style.width.px]="getTokenSize(token)"
                     [style.height.px]="getTokenSize(token)"
                     [cdkDragFreeDragPosition]="{x: token.x * gridSize + (gridSize - getTokenSize(token)) / 2, y: token.y * gridSize + (gridSize - getTokenSize(token)) / 2}"
                     cdkDrag
                     [cdkDragScale]="combat.zoom()"
                     [cdkDragDisabled]="!canMove(token)"
                     (cdkDragMoved)="onDragMoved($event, token)"
                     (cdkDragEnded)="onDragEnded($event, token)"
                     (click)="onTokenClick(token, $event)"
                     (dblclick)="onTokenDoubleClick(token, $event)"
                     (keydown.enter)="onTokenClick(token, $event)">
                
                <!-- Token Image or Initials -->
                @if (token.imageUrl) {
                  <div class="w-full h-full overflow-hidden pointer-events-none" [class.rounded-full]="token.type !== 'item'" [class.rounded-md]="token.type === 'item'">
                    <img [src]="token.imageUrl" 
                         class="w-full h-full object-contain pointer-events-none" 
                         [style.transform]="'scale(' + (token.imageScale || 1) + ') translate(' + (token.imageOffsetX || 0) + '%, ' + (token.imageOffsetY || 0) + '%)'"
                         alt="Token" referrerpolicy="no-referrer" />
                  </div>
                } @else {
                  <span class="font-bold text-white text-shadow pointer-events-none">{{ token.name | slice:0:2 }}</span>
                }

                <!-- Status Bars -->
                @if (token.type !== 'item') {
                  <div class="absolute -bottom-5 left-0 right-0 flex flex-col gap-0.5 pointer-events-none">
                  <!-- HP Bar -->
                  <div class="h-1.5 bg-red-900 rounded-full overflow-hidden border border-stone-900">
                    <div class="h-full bg-green-500 transition-all duration-300" [style.width.%]="(token.hp / token.maxHp) * 100"></div>
                  </div>
                  <!-- Spell Uses Bar -->
                  @if (token.maxSpellUses && token.maxSpellUses > 0) {
                    <div class="flex gap-[1px] h-1.5 w-full bg-stone-900 rounded-full overflow-hidden border border-stone-900">
                      @for (i of [].constructor(token.maxSpellUses); track $index) {
                        <div class="flex-1 h-full transition-colors duration-300" 
                             [class.bg-blue-500]="(token.spellUses || 0) > $index"
                             [class.bg-stone-800]="(token.spellUses || 0) <= $index">
                        </div>
                      }
                    </div>
                  }
                </div>
              }

              <!-- Conditions -->
              @if (token.conditions.length > 0) {
                <div class="absolute -top-4 -right-4 flex flex-wrap-reverse justify-end gap-1 pointer-events-none w-20">
                  @for (cond of token.conditions; track cond.id) {
                    <div class="w-5 h-5 bg-stone-900 rounded-full border border-stone-600 flex items-center justify-center shadow-sm" [title]="cond.name">
                      <mat-icon style="font-size: 12px; width: 12px; height: 12px;" [style.color]="cond.color">{{ cond.icon }}</mat-icon>
                    </div>
                  }
                </div>
              }

              <!-- Tooltip -->
              <div class="absolute -top-8 bg-stone-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-stone-700">
                {{ token.name }} @if (token.type !== 'item') { | PV: {{ token.hp }}/{{ token.maxHp }} @if (token.maxSpellUses && token.maxSpellUses > 0) { | Magias: {{ token.spellUses }}/{{ token.maxSpellUses }} } }
              </div>
            </div>
            }
          }
        </div>
      </div>

      <!-- Horizontal Scrollbar -->
      <div class="absolute bottom-0 left-0 right-4 h-4 bg-stone-900/90 border-t border-stone-800 z-40 flex items-center px-1">
        <input type="range" 
               class="w-full h-2 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-amber-500 hover:bg-stone-700 transition-colors"
               [min]="-mapWidth() * combat.zoom()" 
               [max]="mapWidth() * combat.zoom()" 
               [ngModel]="-combat.pan().x" 
               (ngModelChange)="onHorizontalScroll($event)"
               title="Mover mapa horizontalmente">
      </div>

      <!-- Vertical Scrollbar -->
      <div class="absolute top-0 bottom-4 right-0 w-4 bg-stone-900/90 border-l border-stone-800 z-40 flex justify-center py-1">
        <input type="range" 
               class="h-full w-2 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-amber-500 hover:bg-stone-700 transition-colors vertical-slider"
               [min]="-mapHeight() * combat.zoom()" 
               [max]="mapHeight() * combat.zoom()" 
               [ngModel]="combat.pan().y" 
               (ngModelChange)="onVerticalScroll($event)"
               title="Mover mapa verticalmente">
      </div>
    </div>
  `,
  styles: [`
    .text-shadow { text-shadow: 0 1px 2px rgba(0,0,0,0.8); }
    
    /* Custom Range Input Styling */
    input[type=range]::-webkit-slider-thumb {
      appearance: none;
      width: 40px;
      height: 12px;
      background: #f59e0b;
      border-radius: 6px;
      cursor: pointer;
    }
    input[type=range]::-moz-range-thumb {
      width: 40px;
      height: 12px;
      background: #f59e0b;
      border-radius: 6px;
      cursor: pointer;
      border: none;
    }

    /* Vertical Slider */
    input[type=range].vertical-slider {
      -webkit-appearance: slider-vertical;
      writing-mode: bt-lr;
    }
    input[type=range].vertical-slider::-webkit-slider-thumb {
      width: 12px;
      height: 40px;
    }
    input[type=range].vertical-slider::-moz-range-thumb {
      width: 12px;
      height: 40px;
    }
  `]
})
export class GridComponent {
  private mathService = inject(DndMathService);
  private authService = inject(AuthService);
  combat = inject(CombatService);
  
  @ViewChild('gridContainer') gridContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('boundary') boundary!: ElementRef<HTMLDivElement>;

  readonly gridSize = 64; // 1 Grid Unit = 1.5m = 64px
  
  currentUser = this.authService.currentUser;
  previewAbility = this.combat.previewAbility;
  mapBackgroundImage = this.combat.mapBackgroundImage;
  selectedTokenId = this.combat.selectedTokenId;
  showGrid = this.combat.showGrid;

  // State
  tokens = this.combat.tokens;
  mapWidth = this.combat.mapWidth;
  mapHeight = this.combat.mapHeight;
  
  isPanning = false;
  private hasPanned = false;
  private lastPanPos = { x: 0, y: 0 };

  getTokenSize(token: Token): number {
    if (token.type === 'item') return this.gridSize * 0.6;
    if (token.type === 'boss') return this.gridSize * 1.5;
    return this.gridSize;
  }

  onHorizontalScroll(value: number) {
    this.combat.pan.update(p => ({ x: -value, y: p.y }));
  }

  onVerticalScroll(value: number) {
    this.combat.pan.update(p => ({ x: p.x, y: value }));
  }

  measureDistance = computed(() => {
    const start = this.combat.measureStart();
    const current = this.combat.measureCurrent();
    if (!start || !current) return 0;
    
    const dx = current.x - start.x;
    const dy = current.y - start.y;
    const distPixels = Math.hypot(dx, dy);
    const distMeters = (distPixels / this.gridSize) * 1.5;
    
    return Math.round(distMeters * 10) / 10;
  });

  affectedTokens = computed(() => {
    const ability = this.combat.previewAbility();
    const origin = this.combat.previewOrigin();
    const target = this.combat.previewTarget();
    if (!ability || !origin || !target) return [];

    return this.tokens().filter(t => this.isTokenInArea(t, ability, origin, target));
  });

  abilityVisuals = computed(() => {
    const ability = this.combat.previewAbility();
    if (!ability) return { fill: 'rgba(245, 158, 11, 0.4)', stroke: '#f59e0b', filter: '', rangeFill: 'rgba(245, 158, 11, 0.03)', rangeStroke: 'rgba(245, 158, 11, 0.3)' };

    const type = ability.damageType?.toLowerCase() || '';
    
    switch (type) {
      case 'fire': return { 
        fill: 'rgba(239, 68, 68, 0.5)', 
        stroke: '#ea580c', 
        filter: 'url(#fireFilter)',
        rangeFill: 'rgba(239, 68, 68, 0.03)', 
        rangeStroke: 'rgba(239, 68, 68, 0.3)' 
      };
      case 'lightning': return { 
        fill: 'rgba(56, 189, 248, 0.6)', 
        stroke: '#bae6fd', 
        filter: 'url(#lightningFilter)',
        rangeFill: 'rgba(56, 189, 248, 0.03)', 
        rangeStroke: 'rgba(56, 189, 248, 0.3)' 
      };
      case 'cold': return { 
        fill: 'rgba(165, 243, 252, 0.4)', 
        stroke: '#22d3ee', 
        filter: 'url(#coldFilter)',
        rangeFill: 'rgba(165, 243, 252, 0.03)', 
        rangeStroke: 'rgba(34, 211, 238, 0.3)' 
      };
      case 'acid': return { 
        fill: 'rgba(132, 204, 22, 0.5)', 
        stroke: '#65a30d', 
        filter: 'url(#acidFilter)',
        rangeFill: 'rgba(132, 204, 22, 0.03)', 
        rangeStroke: 'rgba(132, 204, 22, 0.3)' 
      };
      case 'poison': return {
        fill: 'rgba(168, 85, 247, 0.5)', 
        stroke: '#9333ea', 
        filter: 'url(#acidFilter)',
        rangeFill: 'rgba(168, 85, 247, 0.03)', 
        rangeStroke: 'rgba(168, 85, 247, 0.3)' 
      };
      case 'necrotic': return {
        fill: 'rgba(0, 0, 0, 0.6)', 
        stroke: '#a855f7', 
        filter: 'url(#glowFilter)',
        rangeFill: 'rgba(0, 0, 0, 0.05)', 
        rangeStroke: 'rgba(168, 85, 247, 0.3)' 
      };
      case 'radiant': return {
        fill: 'rgba(253, 224, 71, 0.5)', 
        stroke: '#fef08a', 
        filter: 'url(#glowFilter)',
        rangeFill: 'rgba(253, 224, 71, 0.03)', 
        rangeStroke: 'rgba(253, 224, 71, 0.3)' 
      };
      default: return { 
        fill: 'rgba(245, 158, 11, 0.4)', 
        stroke: '#f59e0b', 
        filter: '',
        rangeFill: 'rgba(245, 158, 11, 0.03)', 
        rangeStroke: 'rgba(245, 158, 11, 0.3)' 
      };
    }
  });

  areaPath = computed(() => {
    const ability = this.combat.previewAbility();
    const origin = this.combat.previewOrigin();
    const target = this.combat.previewTarget();
    if (!ability || !origin || !target || origin.x === undefined || origin.y === undefined) return '';

    const gridSize = this.gridSize;
    const pixelsPerMeter = gridSize / 1.5;
    
    // O raio visual estritamente ancorado ao centro do token na grid (pos + metade do tamanho)
    let ox = (origin.x * gridSize) + (gridSize / 2);
    let oy = (origin.y * gridSize) + (gridSize / 2);
    
    const dragged = this.combat.draggedTokenPos();
    if (dragged && dragged.id === origin.id) {
      ox = dragged.px;
      oy = dragged.py;
    }
    
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
    if (this.combat.isPanMode()) return false;
    const user = this.currentUser();
    if (!user) return false;
    if (user.role === 'GM') return true;
    return token.controlledBy === user.id;
  }

  isAffected(token: Token): boolean {
    return this.affectedTokens().some(t => t.id === token.id);
  }

  isTokenInFog(token: Token): boolean {
    if (!this.combat.isFogEnabled()) return false;
    const gridX = Math.floor(token.x + 0.5);
    const gridY = Math.floor(token.y + 0.5);
    const cell = `${gridX},${gridY}`;
    return this.combat.fogOfWar().includes(cell);
  }

  isTokenHiddenByFog(token: Token): boolean {
    if (this.currentUser()?.role === 'GM' && !this.combat.isPlayMode()) return false; // GM always sees everything unless in Play mode
    if (token.type === 'player') return false; // Players can always see other players for now
    return this.isTokenInFog(token);
  }

  getCoords(cell: string): {x: number, y: number} {
    const [x, y] = cell.split(',').map(Number);
    return { x, y };
  }

  isTokenInArea(token: Token, ability: Ability, origin: {x: number, y: number}, target: {x: number, y: number}): boolean {
    if (!token || !origin || !target || origin.x === undefined || origin.y === undefined || token.x === undefined || token.y === undefined) return false;

    const gridSize = this.gridSize;
    const pixelsPerMeter = gridSize / 1.5;
    
    // O ox/oy do origin (sempre o centro da célula de origem)
    const ox = (origin.x * gridSize) + (gridSize / 2);
    const oy = (origin.y * gridSize) + (gridSize / 2);
    
    const dx = target.x - ox;
    const dy = target.y - oy;
    const targetAngle = Math.atan2(dy, dx);

    // Definir os limites (hitbox) do token alvo
    const size = this.getTokenSize(token);
    const halfSize = size / 2;
    // Posição visual do token baseada na lógica de centrar na célula da grid
    const tokenCenterX = (token.x * gridSize) + (gridSize / 2);
    const tokenCenterY = (token.y * gridSize) + (gridSize / 2);
    
    const left = tokenCenterX - halfSize;
    const right = tokenCenterX + halfSize;
    const top = tokenCenterY - halfSize;
    const bottom = tokenCenterY + halfSize;

    // Pontos para testar colisão (4 vértices + centro)
    const testPoints = [
      { x: tokenCenterX, y: tokenCenterY }, // Centro
      { x: left, y: top },                  // Top-Left
      { x: right, y: top },                 // Top-Right
      { x: right, y: bottom },              // Bottom-Right
      { x: left, y: bottom }                // Bottom-Left
    ];

    // Helper para verificar se um ponto está dentro da área definida
    const checkPoint = (px: number, py: number): boolean => {
      const tdx = px - ox;
      const tdy = py - oy;
      const distToPoint = Math.hypot(tdx, tdy);
      const angleToPoint = Math.atan2(tdy, tdx);

      if (ability.areaShape === 'cone') {
        const rangePx = ability.range * pixelsPerMeter;
        if (distToPoint > rangePx) return false;
        
        let angleDiff = Math.abs(angleToPoint - targetAngle);
        if (angleDiff > Math.PI) angleDiff = 2 * Math.PI - angleDiff;
        
        const coneAngleRad = (ability.angle || 60) * Math.PI / 180;
        return angleDiff <= coneAngleRad / 2;
      }
      
      if (ability.areaShape === 'circle') {
        const radiusPx = (ability.radius || 0) * pixelsPerMeter;
        const distToTarget = Math.hypot(px - target.x, py - target.y);
        return distToTarget <= radiusPx;
      }
      
      if (ability.areaShape === 'line') {
        const lengthPx = (ability.length || ability.range) * pixelsPerMeter;
        const widthPx = (ability.width || 1.5) * pixelsPerMeter;
        
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
        return Math.abs(px - target.x) <= widthPx / 2 && Math.abs(py - target.y) <= lengthPx / 2;
      }
      
      if (!ability.areaShape || ability.areaShape === 'none') {
        return px >= left && px <= right && py >= top && py <= bottom;
      }

      return false;
    };

    // Se qualquer um dos pontos estiver na área, o token foi atingido
    return testPoints.some(p => checkPoint(p.x, p.y));
  }

  onMapLoad(event: Event) {
    const img = event.target as HTMLImageElement;
    if (img.naturalWidth && img.naturalHeight) {
      this.mapWidth.set(img.naturalWidth);
      this.mapHeight.set(img.naturalHeight);
    }
  }

  onWheel(event: WheelEvent) {
    event.preventDefault();
    const zoomSpeed = 0.1;
    const delta = event.deltaY > 0 ? -zoomSpeed : zoomSpeed;
    const newZoom = Math.max(0.2, Math.min(3, this.combat.zoom() + delta));
    
    // Zoom towards mouse position
    const rect = this.gridContainer.nativeElement.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    
    const zoomFactor = newZoom / this.combat.zoom();
    const newPanX = mouseX - (mouseX - this.combat.pan().x) * zoomFactor;
    const newPanY = mouseY - (mouseY - this.combat.pan().y) * zoomFactor;
    
    this.combat.zoom.set(newZoom);
    this.combat.pan.set({ x: newPanX, y: newPanY });
  }

  onMouseDown(event: MouseEvent) {
    this.hasPanned = false;
    if (event.button === 1 || (event.button === 0 && event.altKey) || (event.button === 0 && this.combat.isPanMode())) {
      this.isPanning = true;
      this.lastPanPos = { x: event.clientX, y: event.clientY };
      event.preventDefault();
    }
  }

  private isFogPainting = false;

  onGridMouseDown(event: MouseEvent) {
    if (this.currentUser()?.role === 'GM' && this.combat.isFogEditMode() && event.button === 0 && !event.altKey) {
      this.isFogPainting = true;
      this.paintFog(event);
      event.stopPropagation();
    }
  }

  private paintFog(event: MouseEvent) {
    if (!this.gridContainer) return;
    const rect = this.gridContainer.nativeElement.getBoundingClientRect();
    const x = (event.clientX - rect.left - this.combat.pan().x) / this.combat.zoom();
    const y = (event.clientY - rect.top - this.combat.pan().y) / this.combat.zoom();
    
    const gridX = Math.floor(x / this.gridSize);
    const gridY = Math.floor(y / this.gridSize);
    
    const hide = this.combat.fogBrushType() === 'hide';
    this.combat.toggleFogCell(gridX, gridY, hide);
  }

  onGlobalMouseMove(event: MouseEvent) {
    if (this.isPanning) {
      const dx = event.clientX - this.lastPanPos.x;
      const dy = event.clientY - this.lastPanPos.y;
      
      if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
        this.hasPanned = true;
      }
      
      this.combat.pan.update(p => ({ x: p.x + dx, y: p.y + dy }));
      this.lastPanPos = { x: event.clientX, y: event.clientY };
    }

    if (this.isFogPainting) {
      this.paintFog(event);
    }
  }

  onMouseUp() {
    this.isPanning = false;
    this.isFogPainting = false;
  }

  resetView() {
    this.combat.zoom.set(1);
    this.combat.pan.set({ x: 0, y: 0 });
  }

  onMouseMove(event: MouseEvent) {
    if (!this.gridContainer) return;
    
    const rect = this.gridContainer.nativeElement.getBoundingClientRect();
    
    // Adjust mouse coordinates for zoom and pan
    const x = (event.clientX - rect.left - this.combat.pan().x) / this.combat.zoom();
    const y = (event.clientY - rect.top - this.combat.pan().y) / this.combat.zoom();
    
    if (this.combat.isMeasuring() && this.combat.measureStart()) {
      this.combat.measureCurrent.set({x, y});
    }

    if (this.combat.previewAbility()) {
      this.combat.updateTarget(x, y);
    }
  }

  onClick(event?: Event) {
    if (this.hasPanned || (this.combat.isFogEditMode() && this.currentUser()?.role === 'GM')) {
      this.hasPanned = false; // Reset for next click
      return;
    }
    
    const mouseEvent = event as MouseEvent;
    
    if (this.combat.isMeasuring()) {
      if (!this.combat.measureStart()) {
        if (mouseEvent && this.gridContainer) {
          const rect = this.gridContainer.nativeElement.getBoundingClientRect();
          const x = (mouseEvent.clientX - rect.left - this.combat.pan().x) / this.combat.zoom();
          const y = (mouseEvent.clientY - rect.top - this.combat.pan().y) / this.combat.zoom();
          this.combat.measureStart.set({x, y});
          this.combat.measureCurrent.set({x, y});
        }
      } else {
        this.combat.measureStart.set(null);
        this.combat.measureCurrent.set(null);
      }
      return;
    }

    const ability = this.combat.previewAbility();
    const originPos = this.combat.previewOrigin();
    
    // Blindagem de Ataque: Null check crítico para evitar crashs e corrupção de estado.
    // Garante que originPos e suas coordenadas existam antes de qualquer cálculo.
    if (ability && originPos && originPos.x !== undefined && originPos.y !== undefined) {
      // Handle the case where originPos is synthetic (clicked empty floor) and doesn't map to a real token yet
      let originToken: Token | undefined;
      
      if (originPos.id) {
         originToken = this.tokens().find(t => t.id === originPos.id);
      } else {
         originToken = this.tokens().find(t => t.x === originPos.x && t.y === originPos.y);
      }
      
      // If no valid origin token was found using the ability, abort elegantly
      if (!originToken) {
         this.combat.addNotification(`Ação cancelada: Nenhum token válido como origem do ataque.`, 'error');
         this.combat.cancelPreview();
         return;
      }

      // Spell uses check
      if (ability.category === 'spell' && originToken.spellUses !== undefined && originToken.spellUses <= 0) {
        this.combat.addNotification(`${originToken.name} não possui mais usos de magia para usar ${ability.name}!`, 'error');
        this.combat.cancelPreview();
        return;
      }

      // Ability specific uses check
      if (ability.maxUses && (ability.uses === undefined || ability.uses <= 0)) {
        this.combat.addNotification(`${originToken.name} não possui mais usos de ${ability.name}!`, 'error');
        this.combat.cancelPreview();
        return;
      }

      // Deduct spell use
      if (ability.category === 'spell' && originToken.spellUses !== undefined && originToken.spellUses > 0) {
        this.combat.updateToken(originToken.id, { spellUses: originToken.spellUses - 1 });
      }

      // Deduct ability specific uses
      if (ability.maxUses && ability.uses !== undefined && ability.uses > 0) {
        const updatedAbilities = originToken.abilities?.map(a => 
          a.id === ability.id ? { ...a, uses: a.uses! - 1 } : a
        );
        if (updatedAbilities) {
          this.combat.updateToken(originToken.id, { abilities: updatedAbilities });
        }
      }

      // If attack doesn't have an area shape, it's a direct targeting attack. 
      // It must be dropped onto an Enemy/Valid token to function.
      if (!ability.areaShape || ability.areaShape === 'none') {
        const targetGrid = this.combat.previewTarget();
        if (!targetGrid) {
            this.combat.cancelPreview();
            return;
        }

        // The exact target token at the hovered grid coordinates:
        const gridSize = this.gridSize;
        const targetGridX = Math.floor(targetGrid.x / gridSize);
        const targetGridY = Math.floor(targetGrid.y / gridSize);

        const targetToken = this.tokens().find(t => Math.floor(t.x) === targetGridX && Math.floor(t.y) === targetGridY && t.id !== originToken?.id);

        if (!targetToken) {
           this.combat.addNotification(`Nenhum alvo válido nessa coordenada para um ataque direto.`, 'error');
           this.combat.cancelPreview();
           return;
        }

        // Check if it's an attack
        const isAttack = ability.category === 'weapon' || ability.attackBonus !== undefined || ability.damage;

        if (isAttack) {
           this.combat.openAttackModal(originToken, [targetToken], ability);
        } else if (ability.healing) {
           const result = this.combat.resolveHealing(targetToken, ability);
           this.combat.addNotification(result.log, 'info');
        }

        this.combat.cancelPreview();
        return;
      }

      // --- Area Ability Execution (Cone, Line, Circle) ---

      // Filter out the origin token from the affected tokens
      let affected = this.affectedTokens().filter(t => t.id !== originToken?.id);
      
      // Remove dead tokens unless it's a healing ability (AoE Healing)
      if (!ability.healing) {
        affected = affected.filter(t => t.hp > 0);
      }

      if (affected.length === 0) {
        // AoEs missing targets don't return an error, you just hit the floor.
        this.combat.addNotification(`A ${ability.name} atingiu apenas o chão.`, 'info');
        this.combat.cancelPreview();
        return;
      }

      const isAttack = ability.category === 'weapon' || ability.attackBonus !== undefined || ability.damage;

      if (isAttack) {
        if (originToken) {
          this.combat.openAttackModal(originToken, affected, ability);
        }
      } else if (ability.healing) {
        affected.forEach(t => {
          const result = this.combat.resolveHealing(t, ability);
          this.combat.addNotification(result.log, 'info');
        });
      }
      
      this.combat.cancelPreview();
    } else {
      // If clicking on empty grid, deselect token
      this.combat.selectToken('');
    }
  }

  onTokenClick(token: Token, event: Event) {
    if (this.combat.isFogEditMode() && this.currentUser()?.role === 'GM') return;
    if (this.combat.isPanMode()) return;
    
    if (this.combat.isMeasuring()) {
      const x = (token.x + 0.5) * this.gridSize;
      const y = (token.y + 0.5) * this.gridSize;
      
      if (!this.combat.measureStart()) {
        this.combat.measureStart.set({x, y});
        this.combat.measureCurrent.set({x, y});
      } else {
        this.combat.measureCurrent.set({x, y});
        this.combat.measureStart.set(null);
        this.combat.measureCurrent.set(null);
      }
      event.stopPropagation();
      return;
    }

    if (this.combat.previewAbility()) {
      // If in preview mode, let the grid handle the click
      return;
    }
    event.stopPropagation();
    this.combat.selectToken(token.id);
  }

  onTokenDoubleClick(token: Token, event: Event) {
    if (this.combat.isFogEditMode() && this.currentUser()?.role === 'GM') return;
    if (this.combat.isPanMode()) return;
    if (this.combat.isMeasuring() || this.combat.previewAbility()) return;
    
    event.stopPropagation();
    this.combat.selectToken(token.id);
    this.combat.uiVisible.set(true);
    this.combat.rightPanelTab.set('sheet');
  }

  onDragMoved(event: CdkDragMove, token: Token) {
    if (!this.canMove(token)) return;
    
    const position = event.source.getFreeDragPosition();
    const size = this.getTokenSize(token);
    
    // The center of the token in pixels
    const px = position.x + size / 2;
    const py = position.y + size / 2;
    
    this.combat.draggedTokenPos.set({ id: token.id, px, py });
  }

  onDragEnded(event: CdkDragEnd, token: Token) {
    this.combat.draggedTokenPos.set(null);
    
    const size = this.getTokenSize(token);
    
    // Prevent non-GM from moving tokens they do not own
    if (!this.canMove(token)) {
      const snappedX = token.x * this.gridSize + (this.gridSize - size) / 2;
      const snappedY = token.y * this.gridSize + (this.gridSize - size) / 2;
      event.source.setFreeDragPosition({ x: snappedX, y: snappedY });
      return;
    }

    let centerX: number;
    let centerY: number;
    
    if (this.boundary && event.dropPoint) {
      const rect = this.boundary.nativeElement.getBoundingClientRect();
      const dropLocalX = (event.dropPoint.x - rect.left) / this.combat.zoom();
      const dropLocalY = (event.dropPoint.y - rect.top) / this.combat.zoom();
      
      centerX = dropLocalX;
      centerY = dropLocalY;
    } else {
      const position = event.source.getFreeDragPosition();
      centerX = position.x + size / 2;
      centerY = position.y + size / 2;
    }
    
    let newGridX = Math.floor(centerX / this.gridSize);
    let newGridY = Math.floor(centerY / this.gridSize);
    
    if (this.boundary) {
      // Calculate max grid cells
      const maxGridX = Math.max(0, Math.floor(this.mapWidth() / this.gridSize) - 1);
      const maxGridY = Math.max(0, Math.floor(this.mapHeight() / this.gridSize) - 1);
      
      // Strict boundary clipping to prevent sticking outside
      newGridX = Math.max(0, Math.min(newGridX, maxGridX));
      newGridY = Math.max(0, Math.min(newGridY, maxGridY));
    } else {
      newGridX = Math.max(0, newGridX);
      newGridY = Math.max(0, newGridY);
    }
    
    // Visually Snap:
    // Update the state so every other system (SVG rays, etc) immediately points to correct grid coordinates.
    this.combat.updateToken(token.id, { x: newGridX, y: newGridY });
    
    const targetPx = newGridX * this.gridSize + (this.gridSize - size) / 2;
    const targetPy = newGridY * this.gridSize + (this.gridSize - size) / 2;
    
    // Force the CDK Drag to reflect the exact new Snapped position, without breaking the state or dragging.
    event.source.setFreeDragPosition({ x: targetPx, y: targetPy });
    
    this.syncToFirestore(token.id, newGridX, newGridY);

    // Collision Detection for Loot
    if (token.type === 'player' || token.type === 'npc') {
      const collidedToken = this.combat.tokens().find(t => t.type === 'item' && t.x === newGridX && t.y === newGridY);
      
      if (collidedToken) {
        // Encontra o item correspondente no array de itemTokens ou usa os dados do token como fallback
        const itemInfo = this.combat.itemTokens().find(i => i.id === collidedToken.id) || 
          { 
            id: collidedToken.id, 
            x: collidedToken.x, 
            y: collidedToken.y, 
            name: collidedToken.name, 
            description: 'Item desconhecido', 
            weight: 0, 
            quantity: 1, 
            isPickedUp: false,
            actions: [] 
          };
          
        this.combat.selectedItemToken.set(itemInfo);
        this.combat.pendingLoot.set({ playerTokenId: token.id, itemTokenId: itemInfo.id });
      }
    }
  }
  
  private syncToFirestore(tokenId: string, x: number, y: number) {
    console.log(`Syncing token ${tokenId} to Firestore at (${x}, ${y})`);
  }
}
