import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
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
      <!-- Animated Background Particles -->
      <div class="absolute inset-0 pointer-events-none overflow-hidden">
        <div class="particle particle-1"></div>
        <div class="particle particle-2"></div>
        <div class="particle particle-3"></div>
        <div class="particle particle-4"></div>
        <div class="particle particle-5"></div>
        <div class="particle particle-6"></div>
      </div>

      <!-- Background Effects -->
      <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-stone-900/80 via-stone-950 to-stone-950 pointer-events-none"></div>
      <div class="absolute inset-0 pointer-events-none" style="background-image: radial-gradient(rgba(245, 158, 11, 0.03) 1px, transparent 1px); background-size: 40px 40px;"></div>
      
      <!-- Ambient glow -->
      <div class="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-red-900/10 blur-[120px] pointer-events-none animate-pulse-slow"></div>
      <div class="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-blue-900/10 blur-[100px] pointer-events-none"></div>
      <div class="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-amber-900/8 blur-[100px] pointer-events-none"></div>

      <!-- Main Content -->
      <div class="relative z-10 w-full max-w-4xl flex flex-col items-center">
        
        <!-- Title -->
        <div class="text-center mb-16 animate-fade-in-up flex flex-col items-center">
          <div class="relative flex flex-col items-center justify-center mb-6 mt-8">
            <!-- Dice with rotating glow ring -->
            <div class="relative">
              <div class="absolute inset-0 rounded-full animate-spin-slow" style="background: conic-gradient(from 0deg, transparent, rgba(220,38,38,0.4), transparent, rgba(59,130,246,0.4), transparent); filter: blur(20px); width: 96px; height: 96px; top: -16px; left: -16px;"></div>
              <mat-icon class="z-20 animate-float text-red-600 mb-4 relative" style="font-size: 64px; width: 64px; height: 64px; filter: drop-shadow(0 0 25px rgba(220,38,38,0.6));">casino</mat-icon>
            </div>
            <h1 class="text-6xl md:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-stone-100 via-stone-300 to-stone-600 drop-shadow-2xl" style="font-family: 'Playfair Display', serif;">
              D<span class="text-red-600" style="-webkit-text-fill-color: #dc2626;">&</span>D
            </h1>
          </div>
          
          <h2 class="text-4xl md:text-6xl font-bold tracking-widest uppercase drop-shadow-lg flex items-center justify-center gap-3 md:gap-5 flex-wrap" style="font-family: 'Cinzel', serif;">
            <span class="text-stone-300">The</span>
            <span class="blue-liquid-text font-black">Elden</span>
            <span class="flex items-center tracking-tighter">
              <span class="blood-text font-black">Blood</span><span class="text-yellow-400 font-black" style="text-shadow: 0 0 20px rgba(250, 204, 21, 0.5);">Moon</span>
            </span>
          </h2>
          
          <!-- Ornament divider -->
          <div class="flex items-center gap-3 mt-8">
            <div class="h-px w-16 bg-gradient-to-r from-transparent to-stone-600"></div>
            <mat-icon class="text-amber-600/60" style="font-size: 16px; width: 16px; height: 16px;">auto_awesome</mat-icon>
            <div class="h-px w-24 bg-gradient-to-r from-stone-500 to-stone-500"></div>
            <mat-icon class="text-amber-600/60" style="font-size: 16px; width: 16px; height: 16px;">auto_awesome</mat-icon>
            <div class="h-px w-16 bg-gradient-to-l from-transparent to-stone-600"></div>
          </div>

          <!-- Version badge -->
          <div class="mt-4 px-4 py-1.5 rounded-full border border-stone-800 bg-stone-900/60 backdrop-blur-sm">
            <span class="text-[10px] font-mono text-stone-500 tracking-widest uppercase">Engine v2.0.0 — PHB 5e Validated</span>
          </div>
        </div>

        <!-- Main Menu -->
        @if (view() === 'menu') {
          <div class="flex flex-col md:flex-row gap-6 w-full max-w-2xl animate-fade-in">
            <!-- Create Campaign Card -->
            <button (click)="view.set('create')" class="flex-1 group relative overflow-hidden rounded-2xl border border-stone-800/80 bg-stone-900/40 backdrop-blur-md p-8 hover:border-blue-700/50 transition-all duration-500 text-left hover:shadow-[0_0_40px_rgba(59,130,246,0.1)] hover:-translate-y-1">
              <div class="absolute inset-0 bg-gradient-to-br from-blue-900/10 via-transparent to-blue-800/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              <div class="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              <div class="relative">
                <div class="w-14 h-14 rounded-xl bg-blue-950/60 border border-blue-800/40 flex items-center justify-center mb-5 group-hover:border-blue-600/60 group-hover:bg-blue-900/40 transition-all duration-500 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.2)]">
                  <mat-icon class="text-blue-400 group-hover:text-blue-300 transition-colors" style="font-size: 28px; width: 28px; height: 28px;">add_circle_outline</mat-icon>
                </div>
                <h3 class="text-xl font-bold text-stone-200 mb-2 group-hover:text-blue-100 transition-colors" style="font-family: 'Cinzel', serif;">Criar Campanha</h3>
                <p class="text-sm text-stone-500 group-hover:text-stone-400 transition-colors leading-relaxed">Inicie uma nova jornada do zero. Configure mapas, tokens e fichas.</p>
              </div>
            </button>

            <!-- Continue Campaign Card -->
            <button (click)="view.set('load')" class="flex-1 group relative overflow-hidden rounded-2xl border border-stone-800/80 bg-stone-900/40 backdrop-blur-md p-8 hover:border-emerald-700/50 transition-all duration-500 text-left hover:shadow-[0_0_40px_rgba(16,185,129,0.1)] hover:-translate-y-1">
              <div class="absolute inset-0 bg-gradient-to-br from-emerald-900/10 via-transparent to-emerald-800/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              <div class="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              <div class="relative">
                <div class="w-14 h-14 rounded-xl bg-emerald-950/60 border border-emerald-800/40 flex items-center justify-center mb-5 group-hover:border-emerald-600/60 group-hover:bg-emerald-900/40 transition-all duration-500 group-hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                  <mat-icon class="text-emerald-400 group-hover:text-emerald-300 transition-colors" style="font-size: 28px; width: 28px; height: 28px;">auto_stories</mat-icon>
                </div>
                <h3 class="text-xl font-bold text-stone-200 mb-2 group-hover:text-emerald-100 transition-colors" style="font-family: 'Cinzel', serif;">Continuar Campanha</h3>
                <p class="text-sm text-stone-500 group-hover:text-stone-400 transition-colors leading-relaxed">Retorne às suas aventuras salvas e continue de onde parou.</p>
              </div>
            </button>
          </div>
        }

        <!-- Create Campaign View -->
        @if (view() === 'create') {
          <div class="w-full max-w-md bg-stone-900/60 backdrop-blur-xl border border-stone-800/80 rounded-2xl p-8 animate-fade-in shadow-2xl">
            <div class="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent rounded-t-2xl"></div>
            <h3 class="text-2xl font-bold text-stone-200 mb-6 flex items-center gap-3" style="font-family: 'Cinzel', serif;">
              <div class="w-10 h-10 rounded-lg bg-blue-950/60 border border-blue-800/40 flex items-center justify-center">
                <mat-icon class="text-blue-400" style="font-size: 22px; width: 22px; height: 22px;">add_circle</mat-icon>
              </div>
              Nova Campanha
            </h3>
            
            <div class="mb-6">
              <label for="campaignName" class="block text-[10px] font-bold text-stone-500 uppercase tracking-[0.15em] mb-2">Nome da Campanha</label>
              <input id="campaignName" type="text" [(ngModel)]="newCampaignName" placeholder="Ex: A Maldição de Strahd" 
                     class="w-full bg-stone-950/80 border border-stone-700/60 rounded-xl px-4 py-3.5 text-stone-200 focus:outline-none focus:border-blue-500/70 focus:ring-1 focus:ring-blue-500/30 transition-all placeholder:text-stone-600"
                     (keyup.enter)="createCampaign()">
            </div>

            <div class="flex gap-3">
              <button (click)="view.set('menu')" class="flex-1 px-4 py-3 rounded-xl border border-stone-700/60 text-stone-400 hover:bg-stone-800/60 hover:text-stone-200 transition-all font-bold text-sm">
                Voltar
              </button>
              <button (click)="createCampaign()" [disabled]="!newCampaignName.trim()" 
                      class="flex-1 px-4 py-3 rounded-xl bg-blue-800/60 text-blue-100 hover:bg-blue-700/80 border border-blue-700/50 transition-all font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-[0_0_20px_rgba(59,130,246,0.2)]">
                Criar
              </button>
            </div>
          </div>
        }

        <!-- Load Campaign View -->
        @if (view() === 'load') {
          <div class="w-full max-w-2xl bg-stone-900/60 backdrop-blur-xl border border-stone-800/80 rounded-2xl p-8 animate-fade-in shadow-2xl">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-2xl font-bold text-stone-200 flex items-center gap-3" style="font-family: 'Cinzel', serif;">
                <div class="w-10 h-10 rounded-lg bg-emerald-950/60 border border-emerald-800/40 flex items-center justify-center">
                  <mat-icon class="text-emerald-400" style="font-size: 22px; width: 22px; height: 22px;">auto_stories</mat-icon>
                </div>
                Saves
              </h3>
              <button (click)="view.set('menu')" class="text-stone-500 hover:text-stone-200 transition-colors flex items-center gap-1.5 text-sm font-bold px-3 py-1.5 rounded-lg hover:bg-stone-800/60">
                <mat-icon style="font-size: 16px; width: 16px; height: 16px;">arrow_back</mat-icon> Voltar
              </button>
            </div>
            
            <div class="space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              @for (campaign of campaignService.campaigns(); track campaign.id) {
                <div class="group relative">
                  <button (click)="loadCampaign(campaign.id)" class="w-full text-left bg-stone-950/60 border border-stone-800/60 rounded-xl p-5 hover:border-emerald-600/40 hover:bg-stone-800/40 transition-all duration-300 flex items-center justify-between pr-16 hover:shadow-[0_0_30px_rgba(16,185,129,0.05)]">
                    <div>
                      <h4 class="text-lg font-bold text-stone-200 group-hover:text-emerald-300 transition-colors" style="font-family: 'Cinzel', serif;">{{ campaign.name }}</h4>
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
                    <div class="w-10 h-10 rounded-full bg-emerald-950/40 border border-emerald-800/30 flex items-center justify-center group-hover:border-emerald-600/60 group-hover:bg-emerald-900/30 transition-all duration-300">
                      <mat-icon class="text-stone-600 group-hover:text-emerald-400 transition-colors" style="font-size: 22px; width: 22px; height: 22px;">play_arrow</mat-icon>
                    </div>
                  </button>
                  
                  <!-- Delete Button -->
                  @if (campaign.id !== 'test-campaign') {
                    <button (click)="openDeleteConfirm(campaign.id, $event)" 
                            class="absolute right-16 top-1/2 -translate-y-1/2 p-2 text-stone-700 hover:text-red-500 transition-colors z-20 rounded-lg hover:bg-red-950/30"
                            title="Excluir Campanha">
                      <mat-icon style="font-size: 20px; width: 20px; height: 20px;">delete_outline</mat-icon>
                    </button>
                  }
                </div>
              }
              @if (campaignService.campaigns().length === 0) {
                <div class="text-center py-12 text-stone-600">
                  <mat-icon class="mb-3" style="font-size: 48px; width: 48px; height: 48px; opacity: 0.3;">folder_off</mat-icon>
                  <p class="text-sm">Nenhuma campanha salva encontrada.</p>
                </div>
              }
            </div>
          </div>
        }

      </div>

      <!-- Footer -->
      <div class="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] text-stone-700 font-mono tracking-wider">
        BloodDragons Engine — D&D 5e © Wizards of the Coast
      </div>

      <!-- Delete Confirmation Popup -->
      @if (campaignToDelete()) {
        <div class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div class="bg-stone-900/95 backdrop-blur-xl border border-red-900/30 rounded-2xl p-8 max-w-md w-full shadow-2xl animate-fade-in-up">
            <div class="flex items-center gap-4 text-red-500 mb-6">
              <div class="w-14 h-14 rounded-xl bg-red-950/60 border border-red-800/40 flex items-center justify-center">
                <mat-icon style="font-size: 28px; width: 28px; height: 28px;">warning</mat-icon>
              </div>
              <h3 class="text-2xl font-bold" style="font-family: 'Cinzel', serif;">Excluir Campanha?</h3>
            </div>
            
            <p class="text-stone-400 mb-8 leading-relaxed">
              Você está prestes a excluir permanentemente a campanha <span class="text-white font-bold">"{{ getCampaignName(campaignToDelete()!) }}"</span>. 
              Esta ação não pode ser desfeita.
            </p>

            <div class="flex gap-4">
              <button (click)="cancelDelete()" class="flex-1 px-4 py-3 rounded-xl border border-stone-700/60 text-stone-400 hover:bg-stone-800/60 hover:text-stone-200 transition-all font-bold text-sm">
                Cancelar
              </button>
              <button (click)="confirmDelete()" class="flex-1 px-4 py-3 rounded-xl bg-red-900/60 text-red-100 hover:bg-red-800/80 border border-red-700/50 transition-all font-bold text-sm hover:shadow-[0_0_20px_rgba(220,38,38,0.2)]">
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
      animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    
    .animate-fade-in {
      animation: fadeIn 0.6s ease-out forwards;
    }

    .animate-float {
      animation: float 6s ease-in-out infinite;
    }

    .animate-letter {
      opacity: 0;
      animation: letterReveal 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }

    .animate-pulse-slow {
      animation: pulseSlow 8s ease-in-out infinite;
    }

    .animate-spin-slow {
      animation: spinSlow 12s linear infinite;
    }
    
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes float {
      0% { transform: translateY(0px) rotate(12deg); }
      50% { transform: translateY(-16px) rotate(15deg); }
      100% { transform: translateY(0px) rotate(12deg); }
    }

    @keyframes letterReveal {
      from { opacity: 0; transform: translateY(10px); filter: blur(4px); }
      to { opacity: 1; transform: translateY(0); filter: blur(0); }
    }

    @keyframes pulseSlow {
      0%, 100% { opacity: 0.4; transform: translate(-50%, -50%) scale(1); }
      50% { opacity: 0.7; transform: translate(-50%, -50%) scale(1.1); }
    }

    @keyframes spinSlow {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    /* Floating particles */
    .particle {
      position: absolute;
      border-radius: 50%;
      pointer-events: none;
      opacity: 0.15;
    }
    .particle-1 {
      width: 4px; height: 4px; background: #f59e0b;
      top: 20%; left: 10%;
      animation: particleFloat 15s ease-in-out infinite;
    }
    .particle-2 {
      width: 3px; height: 3px; background: #3b82f6;
      top: 60%; left: 85%;
      animation: particleFloat 18s ease-in-out infinite reverse;
    }
    .particle-3 {
      width: 5px; height: 5px; background: #ef4444;
      top: 80%; left: 20%;
      animation: particleFloat 20s ease-in-out infinite;
      animation-delay: 3s;
    }
    .particle-4 {
      width: 3px; height: 3px; background: #a78bfa;
      top: 30%; left: 75%;
      animation: particleFloat 16s ease-in-out infinite;
      animation-delay: 5s;
    }
    .particle-5 {
      width: 4px; height: 4px; background: #10b981;
      top: 70%; left: 50%;
      animation: particleFloat 22s ease-in-out infinite reverse;
      animation-delay: 2s;
    }
    .particle-6 {
      width: 2px; height: 2px; background: #f59e0b;
      top: 15%; left: 60%;
      animation: particleFloat 14s ease-in-out infinite;
      animation-delay: 7s;
    }

    @keyframes particleFloat {
      0% { transform: translate(0, 0) scale(1); opacity: 0; }
      10% { opacity: 0.2; }
      50% { transform: translate(40px, -80px) scale(1.5); opacity: 0.15; }
      90% { opacity: 0.2; }
      100% { transform: translate(-20px, 60px) scale(0.8); opacity: 0; }
    }

    /* Blue Liquid Effect */
    .blue-liquid-text {
      background: linear-gradient(0deg, #1e3a8a 0%, #3b82f6 40%, #1d4ed8 60%, #60a5fa 100%);
      background-size: 100% 200%;
      -webkit-background-clip: text;
      color: transparent;
      animation: liquidBlood 4s ease-in-out infinite;
      filter: drop-shadow(0 0 12px rgba(59, 130, 246, 0.3));
    }

    /* Blood Liquid Effect */
    .blood-text {
      background: linear-gradient(0deg, #7f1d1d 0%, #ef4444 40%, #991b1b 60%, #f87171 100%);
      background-size: 100% 200%;
      -webkit-background-clip: text;
      color: transparent;
      animation: liquidBlood 4s ease-in-out infinite;
      filter: drop-shadow(0 0 12px rgba(220, 38, 38, 0.3));
    }

    @keyframes liquidBlood {
      0% { background-position: 0% 0%; }
      50% { background-position: 0% 100%; }
      100% { background-position: 0% 0%; }
    }

    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #44403c; border-radius: 4px; }
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
