import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CampaignService } from '../../services/campaign.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-lobby',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  template: `
    <div class="min-h-screen bg-stone-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <!-- Background Effects -->
      <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-stone-900 via-stone-950 to-stone-950 pointer-events-none"></div>
      <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] opacity-20 pointer-events-none"></div>

      <!-- Main Content -->
      <div class="relative z-10 w-full max-w-4xl flex flex-col items-center">
        
        <!-- Title -->
        <div class="text-center mb-16 animate-fade-in-up flex flex-col items-center">
          <div class="relative flex flex-col items-center justify-center mb-4 mt-8">
            <mat-icon class="z-20 animate-float text-red-600 mb-4" style="font-size: 64px; width: 64px; height: 64px; filter: drop-shadow(0 0 20px rgba(220,38,38,0.8));">casino</mat-icon>
            <h1 class="text-6xl md:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-stone-200 to-stone-500 drop-shadow-2xl" style="font-family: 'Playfair Display', serif;">
              D<span class="text-red-600" style="-webkit-text-fill-color: #dc2626;">&</span>D
            </h1>
          </div>
          
          <h2 class="text-4xl md:text-6xl font-bold tracking-widest uppercase drop-shadow-lg flex items-center justify-center gap-3 md:gap-5 flex-wrap" style="font-family: 'Cinzel', serif;">
            <span class="text-stone-300">The</span>
            <span class="blue-liquid-text font-black">Elden</span>
            <span class="flex items-center tracking-tighter">
              <span class="blood-text font-black">Blood</span><span class="text-yellow-400 font-black" style="text-shadow: 0 0 15px rgba(250, 204, 21, 0.4);">Moon</span>
            </span>
          </h2>
          <div class="h-1 w-48 bg-gradient-to-r from-transparent via-stone-500 to-transparent mx-auto mt-8"></div>
        </div>

        <!-- Main Menu -->
        @if (view() === 'menu') {
          <div class="flex flex-col md:flex-row gap-6 w-full max-w-2xl animate-fade-in">
            <!-- Create Campaign Card -->
            <button (click)="view.set('create')" class="flex-1 group relative overflow-hidden rounded-xl border border-stone-800 bg-stone-900/50 p-8 hover:bg-stone-800/80 hover:border-blue-900/50 transition-all duration-500 text-left">
              <div class="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <mat-icon class="text-blue-500 mb-4 transform group-hover:scale-110 transition-transform duration-500" style="font-size: 48px; width: 48px; height: 48px;">add_circle_outline</mat-icon>
              <h3 class="text-2xl font-bold text-stone-200 mb-2 font-serif">Criar Campanha</h3>
              <p class="text-sm text-stone-400">Inicie uma nova jornada do zero. Configure mapas, tokens e fichas.</p>
            </button>

            <!-- Continue Campaign Card -->
            <button (click)="view.set('load')" class="flex-1 group relative overflow-hidden rounded-xl border border-stone-800 bg-stone-900/50 p-8 hover:bg-stone-800/80 hover:border-green-900/50 transition-all duration-500 text-left">
              <div class="absolute inset-0 bg-gradient-to-br from-green-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <mat-icon class="text-green-500 mb-4 transform group-hover:scale-110 transition-transform duration-500" style="font-size: 48px; width: 48px; height: 48px;">auto_stories</mat-icon>
              <h3 class="text-2xl font-bold text-stone-200 mb-2 font-serif">Continuar Campanha</h3>
              <p class="text-sm text-stone-400">Retorne às suas aventuras salvas e continue de onde parou.</p>
            </button>
          </div>
        }

        <!-- Create Campaign View -->
        @if (view() === 'create') {
          <div class="w-full max-w-md bg-stone-900/80 backdrop-blur-md border border-stone-800 rounded-xl p-8 animate-fade-in shadow-2xl">
            <h3 class="text-2xl font-bold text-stone-200 mb-6 font-serif flex items-center gap-3">
              <mat-icon class="text-blue-500">add_circle</mat-icon>
              Nova Campanha
            </h3>
            
            <div class="mb-6">
              <label for="campaignName" class="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Nome da Campanha</label>
              <input id="campaignName" type="text" [(ngModel)]="newCampaignName" placeholder="Ex: A Maldição de Strahd" 
                     class="w-full bg-stone-950 border border-stone-700 rounded-lg px-4 py-3 text-stone-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                     (keyup.enter)="createCampaign()">
            </div>

            <div class="flex gap-3">
              <button (click)="view.set('menu')" class="flex-1 px-4 py-3 rounded-lg border border-stone-700 text-stone-400 hover:bg-stone-800 hover:text-stone-200 transition-colors font-bold">
                Voltar
              </button>
              <button (click)="createCampaign()" [disabled]="!newCampaignName.trim()" 
                      class="flex-1 px-4 py-3 rounded-lg bg-blue-900/80 text-blue-100 hover:bg-blue-800 border border-blue-700 transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed">
                Criar
              </button>
            </div>
          </div>
        }

        <!-- Load Campaign View -->
        @if (view() === 'load') {
          <div class="w-full max-w-2xl bg-stone-900/80 backdrop-blur-md border border-stone-800 rounded-xl p-8 animate-fade-in shadow-2xl">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-2xl font-bold text-stone-200 font-serif flex items-center gap-3">
                <mat-icon class="text-green-500">auto_stories</mat-icon>
                Saves
              </h3>
              <button (click)="view.set('menu')" class="text-stone-400 hover:text-stone-200 transition-colors flex items-center gap-1 text-sm font-bold">
                <mat-icon style="font-size: 18px; width: 18px; height: 18px;">arrow_back</mat-icon> Voltar
              </button>
            </div>
            
            <div class="space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              @for (campaign of campaignService.campaigns(); track campaign.id) {
                <div class="group relative">
                  <button (click)="loadCampaign(campaign.id)" class="w-full text-left bg-stone-950 border border-stone-800 rounded-lg p-4 hover:border-green-500/50 hover:bg-stone-800/50 transition-all flex items-center justify-between pr-16">
                    <div>
                      <h4 class="text-lg font-bold text-stone-200 group-hover:text-green-400 transition-colors">{{ campaign.name }}</h4>
                      <div class="flex items-center gap-4 mt-2 text-xs text-stone-500">
                        <span class="flex items-center gap-1" title="Última vez jogado">
                          <mat-icon style="font-size: 14px; width: 14px; height: 14px;">schedule</mat-icon>
                          {{ campaign.lastPlayedAt | date:'dd/MM/yyyy HH:mm' }}
                        </span>
                        <span class="flex items-center gap-1" title="Data de criação">
                          <mat-icon style="font-size: 14px; width: 14px; height: 14px;">calendar_today</mat-icon>
                          {{ campaign.createdAt | date:'dd/MM/yyyy' }}
                        </span>
                      </div>
                    </div>
                    <mat-icon class="text-stone-600 group-hover:text-green-500 transition-colors">play_circle_filled</mat-icon>
                  </button>
                  
                  <!-- Delete Button -->
                  @if (campaign.id !== 'test-campaign') {
                    <button (click)="openDeleteConfirm(campaign.id, $event)" 
                            class="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-stone-600 hover:text-red-500 transition-colors z-20"
                            title="Excluir Campanha">
                      <mat-icon>delete_outline</mat-icon>
                    </button>
                  }
                </div>
              }
              @if (campaignService.campaigns().length === 0) {
                <div class="text-center py-8 text-stone-500">
                  Nenhuma campanha salva encontrada.
                </div>
              }
            </div>
          </div>
        }

      </div>

      <!-- Delete Confirmation Popup -->
      @if (campaignToDelete()) {
        <div class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div class="bg-stone-900 border border-red-900/50 rounded-xl p-8 max-w-md w-full shadow-2xl animate-fade-in-up">
            <div class="flex items-center gap-4 text-red-500 mb-6">
              <mat-icon style="font-size: 48px; width: 48px; height: 48px;">warning</mat-icon>
              <h3 class="text-2xl font-bold font-serif">Excluir Campanha?</h3>
            </div>
            
            <p class="text-stone-300 mb-8">
              Você está prestes a excluir permanentemente a campanha <span class="text-white font-bold">"{{ getCampaignName(campaignToDelete()!) }}"</span>. 
              Esta ação não pode ser desfeita.
            </p>

            <div class="flex gap-4">
              <button (click)="cancelDelete()" class="flex-1 px-4 py-3 rounded-lg border border-stone-700 text-stone-400 hover:bg-stone-800 hover:text-stone-200 transition-colors font-bold">
                Cancelar
              </button>
              <button (click)="confirmDelete()" class="flex-1 px-4 py-3 rounded-lg bg-red-900/80 text-red-100 hover:bg-red-800 border border-red-700 transition-colors font-bold">
                Excluir
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&family=Playfair+Display:ital,wght@0,900;1,900&display=swap');
    
    .animate-fade-in-up {
      animation: fadeInUp 1s ease-out forwards;
    }
    
    .animate-fade-in {
      animation: fadeIn 0.5s ease-out forwards;
    }

    .animate-float {
      animation: float 6s ease-in-out infinite;
    }
    
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes float {
      0% { transform: translateY(0px) rotate(12deg); }
      50% { transform: translateY(-20px) rotate(15deg); }
      100% { transform: translateY(0px) rotate(12deg); }
    }

    /* Blue Liquid Effect */
    .blue-liquid-text {
      background: linear-gradient(0deg, #1e3a8a 0%, #3b82f6 40%, #1d4ed8 60%, #2563eb 100%);
      background-size: 100% 200%;
      -webkit-background-clip: text;
      color: transparent;
      animation: liquidBlood 4s ease-in-out infinite;
      text-shadow: 0 5px 15px rgba(59, 130, 246, 0.3);
    }

    /* Blood Liquid Effect */
    .blood-text {
      background: linear-gradient(0deg, #7f1d1d 0%, #ef4444 40%, #991b1b 60%, #dc2626 100%);
      background-size: 100% 200%;
      -webkit-background-clip: text;
      color: transparent;
      animation: liquidBlood 4s ease-in-out infinite;
      text-shadow: 0 5px 15px rgba(220, 38, 38, 0.3);
    }

    @keyframes liquidBlood {
      0% { background-position: 0% 0%; }
      50% { background-position: 0% 100%; }
      100% { background-position: 0% 0%; }
    }

    .custom-scrollbar::-webkit-scrollbar { width: 6px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #44403c; border-radius: 3px; }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #57534e; }
  `]
})
export class LobbyComponent {
  campaignService = inject(CampaignService);
  
  view = signal<'menu' | 'create' | 'load'>('menu');
  newCampaignName = '';
  campaignToDelete = signal<string | null>(null);

  createCampaign() {
    if (this.newCampaignName.trim()) {
      this.campaignService.createCampaign(this.newCampaignName.trim());
    }
  }

  loadCampaign(id: string) {
    this.campaignService.loadCampaign(id);
  }

  openDeleteConfirm(id: string, event: Event) {
    event.stopPropagation();
    this.campaignToDelete.set(id);
  }

  confirmDelete() {
    const id = this.campaignToDelete();
    if (id) {
      this.campaignService.deleteCampaign(id);
      this.campaignToDelete.set(null);
    }
  }

  cancelDelete() {
    this.campaignToDelete.set(null);
  }

  getCampaignName(id: string): string {
    return this.campaignService.campaigns().find(c => c.id === id)?.name || '';
  }
}
