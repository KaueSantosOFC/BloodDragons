import { Component, ChangeDetectionStrategy, input, signal, computed, ElementRef, ViewChild, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { DragDropModule, CdkDragDrop } from '@angular/cdk/drag-drop';
import { AuthService } from '../../services/auth.service';
import { CombatService } from '../../services/combat.service';

export interface Slide {
  url: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-story-slides',
  standalone: true,
  imports: [CommonModule, MatIconModule, DragDropModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative w-full h-full flex bg-stone-950 border-2 border-[#b8860b] rounded-sm overflow-hidden shadow-2xl group" #slideContainer>
      
      <!-- Filmstrip Sidebar (Rolo de Filme) -->
      @if (showFilmstrip() && !isMinimized() && slides().length > 0) {
        <div class="w-48 h-full bg-stone-900/90 border-r border-[#b8860b]/30 flex flex-col z-40 backdrop-blur-md animate-in slide-in-from-left duration-300">
          <div class="p-3 border-b border-[#b8860b]/20 flex items-center justify-between">
            <span class="text-[#b8860b] font-serif text-sm uppercase tracking-wider">Rolo de Filme</span>
            <button (click)="toggleFilmstrip()" class="text-[#b8860b] hover:text-amber-400 transition-colors">
              <mat-icon style="font-size: 18px; width: 18px; height: 18px;">close</mat-icon>
            </button>
          </div>
          
          <div class="flex-1 overflow-y-auto p-2 space-y-3 custom-scrollbar"
               cdkDropList
               [cdkDropListData]="slides()"
               (cdkDropListDropped)="drop($event)"
               [cdkDropListDisabled]="auth.currentUser()?.role !== 'GM'">
            @for (slide of slides(); track $index; let i = $index) {
              <div class="relative group/thumb cursor-pointer rounded border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                   [class.border-[#b8860b]]="i === currentIndex()"
                   [class.border-transparent]="i !== currentIndex()"
                   [class.opacity-60]="i !== currentIndex()"
                   [class.hover:opacity-100]="i !== currentIndex()"
                   (click)="goToSlide(i)"
                   (keydown.enter)="goToSlide(i)"
                   (keydown.space)="goToSlide(i)"
                   tabindex="0"
                   role="button"
                   [attr.aria-label]="'Ir para cena ' + (i + 1) + ': ' + slide.title"
                   cdkDrag
                   [cdkDragDisabled]="auth.currentUser()?.role !== 'GM'">
                
                <!-- Drag Handle (GM Only) -->
                @if (auth.currentUser()?.role === 'GM') {
                  <div class="absolute top-1 left-1 z-10 opacity-0 group-hover/thumb:opacity-100 transition-opacity cursor-grab active:cursor-grabbing" cdkDragHandle>
                    <mat-icon class="text-white drop-shadow-md" style="font-size: 16px; width: 16px; height: 16px;">drag_indicator</mat-icon>
                  </div>
                }

                <img [src]="slide.url" [alt]="'Miniatura da cena ' + (i + 1)" class="w-full aspect-video object-cover rounded-sm" referrerpolicy="no-referrer">
                <div class="absolute bottom-0 left-0 right-0 bg-black/60 p-1 text-[10px] text-stone-300 truncate font-serif">
                  {{ i + 1 }}. {{ slide.title || 'Sem título' }}
                </div>
                
                <!-- Reorder Controls (GM Only) - Keeping buttons as fallback/alternative -->
                @if (auth.currentUser()?.role === 'GM') {
                  <div class="absolute top-1 right-1 flex flex-col gap-1 opacity-0 group-hover/thumb:opacity-100 transition-opacity">
                    <button (click)="$event.stopPropagation(); moveSlide(i, -1)" 
                            [disabled]="i === 0"
                            class="w-6 h-6 bg-stone-800/90 text-[#b8860b] hover:text-amber-400 rounded flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed"
                            aria-label="Mover cena para cima">
                      <mat-icon style="font-size: 16px; width: 16px; height: 16px;">arrow_upward</mat-icon>
                    </button>
                    <button (click)="$event.stopPropagation(); moveSlide(i, 1)" 
                            [disabled]="i === slides().length - 1"
                            class="w-6 h-6 bg-stone-800/90 text-[#b8860b] hover:text-amber-400 rounded flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed"
                            aria-label="Mover cena para baixo">
                      <mat-icon style="font-size: 16px; width: 16px; height: 16px;">arrow_downward</mat-icon>
                    </button>
                  </div>
                }

                <!-- Drag Preview -->
                <div *cdkDragPreview class="w-40 aspect-video rounded border-2 border-amber-500 overflow-hidden shadow-2xl opacity-80">
                  <img [src]="slide.url" [alt]="'Prévia da cena ' + (i + 1)" class="w-full h-full object-cover" referrerpolicy="no-referrer">
                </div>
                
                <!-- Drag Placeholder -->
                <div *cdkDragPlaceholder class="w-full aspect-video bg-stone-800/50 border-2 border-dashed border-[#b8860b]/30 rounded"></div>
              </div>
            }
          </div>
        </div>
      }

      <div class="flex-1 relative flex flex-col overflow-hidden">
        <!-- Progress Bar -->
        @if (!isMinimized()) {
          <div class="absolute top-0 left-0 right-0 h-1 bg-stone-900 z-30">
            <div class="h-full bg-[#b8860b] transition-all duration-500 ease-out" [style.width.%]="progressPercentage()"></div>
          </div>
        }

        <!-- Top Controls -->
        <div class="absolute top-4 right-4 z-30 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button (click)="toggleMinimize()" class="w-8 h-8 flex items-center justify-center bg-stone-900/80 text-[#b8860b] hover:text-amber-400 hover:bg-stone-800 rounded border border-[#b8860b]/50 backdrop-blur-sm transition-colors" [title]="isMinimized() ? 'Mostrar Recursos' : 'Ocultar Recursos'">
            <mat-icon style="font-size: 18px; width: 18px; height: 18px;">{{ isMinimized() ? 'visibility' : 'visibility_off' }}</mat-icon>
          </button>

          @if (!isMinimized()) {
            @if (auth.currentUser()?.role === 'GM') {
              <button (click)="deleteCurrentSlide()" class="w-8 h-8 flex items-center justify-center bg-stone-900/80 text-red-500 hover:text-red-400 hover:bg-stone-800 rounded border border-red-900/50 backdrop-blur-sm transition-colors" title="Excluir Cena Atual">
                <mat-icon style="font-size: 18px; width: 18px; height: 18px;">delete</mat-icon>
              </button>
            }

            <button (click)="toggleFilmstrip()" class="bg-stone-900/80 text-[#b8860b] hover:text-amber-400 hover:bg-stone-800 px-3 py-1 rounded text-xs font-serif border border-[#b8860b]/50 backdrop-blur-sm flex items-center gap-2 transition-colors" title="Ver Rolo de Filme">
              <mat-icon style="font-size: 16px; width: 16px; height: 16px;">movie</mat-icon>
              Rolo de Filme
            </button>

            @if (auth.currentUser()?.role === 'GM') {
              <label class="cursor-pointer bg-stone-900/80 text-[#b8860b] hover:text-amber-400 hover:bg-stone-800 px-3 py-1 rounded text-xs font-serif border border-[#b8860b]/50 backdrop-blur-sm flex items-center gap-2 transition-colors" title="Adicionar uma única imagem">
                <mat-icon style="font-size: 16px; width: 16px; height: 16px;">add_photo_alternate</mat-icon>
                Nova Cena
                <input type="file" accept="image/*" class="hidden" (change)="uploadNewSlide($event)">
              </label>
              <label class="cursor-pointer bg-stone-900/80 text-[#b8860b] hover:text-amber-400 hover:bg-stone-800 px-3 py-1 rounded text-xs font-serif border border-[#b8860b]/50 backdrop-blur-sm flex items-center gap-2 transition-colors" title="Adicionar pasta ou múltiplas imagens (Pack de Atos)">
                <mat-icon style="font-size: 16px; width: 16px; height: 16px;">folder_open</mat-icon>
                Upload Pack
                <input type="file" accept="image/*" multiple webkitdirectory directory class="hidden" (change)="uploadPack($event)">
              </label>
              <label class="cursor-pointer bg-stone-900/80 text-[#b8860b] hover:text-amber-400 hover:bg-stone-800 px-3 py-1 rounded text-xs font-serif border border-[#b8860b]/50 backdrop-blur-sm flex items-center gap-2 transition-colors">
                <mat-icon style="font-size: 16px; width: 16px; height: 16px;">edit</mat-icon>
                Alterar Imagem
                <input type="file" accept="image/*" class="hidden" (change)="updateCurrentSlideImage($event)">
              </label>
            }
            <div class="bg-stone-900/80 text-[#b8860b] px-3 py-1 rounded text-xs font-serif border border-[#b8860b]/50 backdrop-blur-sm flex items-center">
              Cena {{ currentIndex() + 1 }} de {{ slides().length || 1 }}
            </div>
          }
          <button (click)="toggleFullscreen()" class="w-8 h-8 flex items-center justify-center bg-stone-900/80 text-[#b8860b] hover:text-amber-400 hover:bg-stone-800 rounded border border-[#b8860b]/50 backdrop-blur-sm transition-colors">
            <mat-icon style="font-size: 18px; width: 18px; height: 18px;">{{ isFullscreen() ? 'fullscreen_exit' : 'fullscreen' }}</mat-icon>
          </button>
        </div>

        <!-- Slides -->
        <div class="relative flex-1 w-full h-full overflow-hidden bg-black">
          @for (slide of slides(); track $index; let i = $index) {
            <div class="absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out flex items-center justify-center p-4"
                 [class.opacity-100]="i === currentIndex()"
                 [class.opacity-0]="i !== currentIndex()"
                 [class.pointer-events-none]="i !== currentIndex()">
              <img [src]="slide.url" [alt]="slide.title" class="max-w-full max-h-full object-contain m-auto shadow-2xl" referrerpolicy="no-referrer" />
              
              <!-- Overlay -->
              @if (!isMinimized()) {
                <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent pt-24 pb-8 px-12 flex justify-start">
                  @if (auth.currentUser()?.role === 'GM') {
                    <input type="text"
                           [value]="slide.title"
                           (change)="updateSlideTitle(i, $event)"
                           class="text-4xl font-serif text-[#b8860b] drop-shadow-md bg-transparent border-b border-transparent hover:border-[#b8860b]/50 focus:border-[#b8860b] focus:outline-none w-full max-w-4xl text-left placeholder-[#b8860b]/50 transition-colors"
                           placeholder="Título da Cena">
                  } @else {
                    <h2 class="text-4xl font-serif text-[#b8860b] drop-shadow-md text-left">{{ slide.title }}</h2>
                  }
                </div>
              }
            </div>
          }
          
          @if (slides().length === 0) {
            <div class="absolute inset-0 flex items-center justify-center text-stone-500 font-serif">
              Nenhum slide disponível.
            </div>
          }
        </div>

        <!-- Navigation Controls -->
        @if (slides().length > 1) {
          <button (click)="prevSlide()" 
                  class="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-stone-900/50 hover:bg-stone-800/80 text-[#b8860b] rounded-full border border-[#b8860b]/30 backdrop-blur-sm transition-all z-30 opacity-0 group-hover:opacity-100 focus:opacity-100"
                  [class.cursor-not-allowed]="currentIndex() === 0"
                  [class.opacity-30]="currentIndex() === 0"
                  [disabled]="currentIndex() === 0">
            <mat-icon>chevron_left</mat-icon>
          </button>
          
          <button (click)="nextSlide()" 
                  class="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-stone-900/50 hover:bg-stone-800/80 text-[#b8860b] rounded-full border border-[#b8860b]/30 backdrop-blur-sm transition-all z-30 opacity-0 group-hover:opacity-100 focus:opacity-100"
                  [class.cursor-not-allowed]="currentIndex() === slides().length - 1"
                  [class.opacity-30]="currentIndex() === slides().length - 1"
                  [disabled]="currentIndex() === slides().length - 1">
            <mat-icon>chevron_right</mat-icon>
          </button>
        }
      </div>
    </div>
  `,
  styles: [`
    .text-shadow-sm { text-shadow: 0 1px 3px rgba(0,0,0,0.9); }
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }
    .custom-scrollbar::-webkit-scrollbar {
      width: 4px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: transparent;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: #b8860b44;
      border-radius: 10px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: #b8860b88;
    }
  `]
})
export class StorySlidesComponent {
  auth = inject(AuthService);
  combat = inject(CombatService);

  slides = input<Slide[]>([]);
  
  currentIndex = signal<number>(0);
  isFullscreen = signal<boolean>(false);
  showFilmstrip = signal<boolean>(false);
  isMinimized = signal<boolean>(false);

  @ViewChild('slideContainer') slideContainer!: ElementRef<HTMLDivElement>;

  progressPercentage = computed(() => {
    const total = this.slides().length;
    if (total <= 1) return 100;
    return ((this.currentIndex() + 1) / total) * 100;
  });

  @HostListener('document:fullscreenchange')
  onFullscreenChange() {
    this.isFullscreen.set(!!document.fullscreenElement);
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'ArrowRight') {
      this.nextSlide();
    } else if (event.key === 'ArrowLeft') {
      this.prevSlide();
    }
  }

  nextSlide() {
    if (this.currentIndex() < this.slides().length - 1) {
      this.currentIndex.update(i => i + 1);
    }
  }

  prevSlide() {
    if (this.currentIndex() > 0) {
      this.currentIndex.update(i => i - 1);
    }
  }

  goToSlide(index: number) {
    this.currentIndex.set(index);
  }

  toggleFilmstrip() {
    this.showFilmstrip.update(v => !v);
  }

  toggleMinimize() {
    this.isMinimized.update(v => !v);
  }

  moveSlide(index: number, direction: number) {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= this.slides().length) return;
    
    // If moving current slide, update currentIndex to follow it
    if (this.currentIndex() === index) {
      this.currentIndex.set(newIndex);
    } else if (this.currentIndex() === newIndex) {
      this.currentIndex.set(index);
    }

    this.combat.reorderStorySlide(index, newIndex);
  }

  drop(event: CdkDragDrop<Slide[]>) {
    if (event.previousIndex === event.currentIndex) return;
    
    // Update currentIndex if necessary
    if (this.currentIndex() === event.previousIndex) {
      this.currentIndex.set(event.currentIndex);
    } else if (
      this.currentIndex() > event.previousIndex && 
      this.currentIndex() <= event.currentIndex
    ) {
      this.currentIndex.update(i => i - 1);
    } else if (
      this.currentIndex() < event.previousIndex && 
      this.currentIndex() >= event.currentIndex
    ) {
      this.currentIndex.update(i => i + 1);
    }

    this.combat.reorderStorySlide(event.previousIndex, event.currentIndex);
  }

  async toggleFullscreen() {
    if (!this.slideContainer) return;
    
    const elem = this.slideContainer.nativeElement;
    
    if (!document.fullscreenElement) {
      try {
        await elem.requestFullscreen();
      } catch (err) {
        console.error('Error attempting to enable fullscreen:', err);
      }
    } else {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      }
    }
  }

  uploadNewSlide(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    
    const file = input.files[0];
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === 'string') {
        this.combat.addStorySlide({
          url: result,
          title: 'Nova Cena',
          description: 'Descrição da nova cena...'
        });
        // Move to the new slide
        setTimeout(() => {
          this.currentIndex.set(this.slides().length - 1);
        }, 100);
      }
    };
    
    reader.readAsDataURL(file);
    input.value = ''; // Reset input
  }

  async uploadPack(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const files = Array.from(input.files).filter(f => f.type.startsWith('image/'));
    if (files.length === 0) return;

    // Optional: Ask for a pack title
    const packTitle = prompt('Título do Pack (opcional):', 'Novo Pack');
    
    const newSlides: Slide[] = [];
    
    for (const file of files) {
      const result = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      });
      
      // Use filename as title if no pack title, or combine them
      const fileName = file.name.split('.').slice(0, -1).join('.');
      const title = packTitle ? `${packTitle} - ${fileName}` : fileName;
      
      newSlides.push({
        url: result,
        title: title,
        description: `Imagem do pack ${packTitle || 'sem título'}`
      });
    }

    this.combat.addStorySlides(newSlides);
    
    // Move to the first new slide
    setTimeout(() => {
      this.currentIndex.set(this.slides().length - newSlides.length);
    }, 100);

    input.value = ''; // Reset input
  }

  deleteCurrentSlide() {
    if (this.slides().length === 0) return;
    
    const index = this.currentIndex();
    if (confirm(`Deseja realmente excluir a cena "${this.slides()[index].title}"?`)) {
      this.combat.deleteStorySlide(index);
      
      // Adjust index if we deleted the last slide
      if (this.currentIndex() >= this.slides().length && this.slides().length > 0) {
        this.currentIndex.set(this.slides().length - 1);
      } else if (this.slides().length === 0) {
        this.currentIndex.set(0);
      }
    }
  }

  updateCurrentSlideImage(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    
    const file = input.files[0];
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === 'string') {
        this.combat.updateStorySlide(this.currentIndex(), { url: result });
      }
    };
    
    reader.readAsDataURL(file);
    input.value = ''; // Reset input
  }

  updateSlideTitle(index: number, event: Event) {
    const input = event.target as HTMLInputElement;
    this.combat.updateStorySlide(index, { title: input.value });
  }
}
