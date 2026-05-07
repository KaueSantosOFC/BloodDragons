import { Injectable, signal, inject } from '@angular/core';
import { Campaign } from '../models/campaign';
import { ApiService } from './api.service';

/**
 * CampaignService - Agora consome a API REST do backend Java.
 * A lógica de persistência foi movida para o backend (CampaignService.java).
 * Este service apenas gerencia estado local e faz chamadas HTTP.
 */
@Injectable({
  providedIn: 'root'
})
export class CampaignService {
  private api = inject(ApiService);

  campaigns = signal<Campaign[]>([]);
  activeCampaign = signal<Campaign | null>(null);

  constructor() {
    this.loadCampaigns();
  }

  loadCampaigns() {
    this.api.getCampaigns().subscribe({
      next: (campaigns) => {
        // Converter datas string para Date objects
        const parsed = campaigns.map((c: Record<string, unknown>) => ({
          ...c,
          createdAt: new Date(c['createdAt'] as string),
          lastPlayedAt: new Date(c['lastPlayedAt'] as string)
        })) as Campaign[];
        this.campaigns.set(parsed);
      },
      error: (err) => {
        console.error('Failed to load campaigns from API', err);
        // Fallback: carregar do localStorage se API indisponível
        this.loadFromLocalStorage();
      }
    });
  }

  createCampaign(name: string) {
    this.api.createCampaign(name).subscribe({
      next: (campaign) => {
        const parsed = {
          ...campaign,
          createdAt: new Date(campaign.createdAt),
          lastPlayedAt: new Date(campaign.lastPlayedAt)
        } as Campaign;
        this.campaigns.update(cs => [...cs, parsed]);
        this.activeCampaign.set(parsed);
      },
      error: (err) => console.error('Failed to create campaign', err)
    });
  }

  loadCampaign(id: string) {
    this.api.getCampaign(id).subscribe({
      next: (campaign) => {
        const parsed = {
          ...campaign,
          createdAt: new Date(campaign.createdAt),
          lastPlayedAt: new Date(campaign.lastPlayedAt)
        } as Campaign;
        this.activeCampaign.set(parsed);
      },
      error: (err) => {
        console.error('Failed to load campaign', err);
        // Fallback: tentar carregar do cache local
        const local = this.campaigns().find(c => c.id === id);
        if (local) this.activeCampaign.set(local);
      }
    });
  }

  exitCampaign() {
    this.activeCampaign.set(null);
  }

  updateActiveCampaign(updates: Partial<Campaign>) {
    const current = this.activeCampaign();
    if (!current) return;

    const updated = { ...current, ...updates, lastPlayedAt: new Date() };
    this.activeCampaign.set(updated);

    // Atualizar lista local
    const all = this.campaigns().map(c => c.id === updated.id ? updated : c);
    this.campaigns.set(all);

    // Persistir no backend
    this.api.updateCampaign(updated.id, updates).subscribe({
      error: (err) => console.error('Failed to save campaign to API', err)
    });
  }

  deleteCampaign(id: string) {
    if (id === 'test-campaign') return;

    this.api.deleteCampaign(id).subscribe({
      next: () => {
        this.campaigns.update(cs => cs.filter(c => c.id !== id));
        if (this.activeCampaign()?.id === id) {
          this.activeCampaign.set(null);
        }
      },
      error: (err) => console.error('Failed to delete campaign', err)
    });
  }

  /** Fallback para quando a API está offline */
  private loadFromLocalStorage() {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem('dnd_campaigns');
    if (saved) {
      try {
        const parsed = JSON.parse(saved).map((c: Record<string, unknown>) => ({
          ...c,
          createdAt: new Date(c['createdAt'] as string),
          lastPlayedAt: new Date(c['lastPlayedAt'] as string)
        })) as Campaign[];
        this.campaigns.set(parsed);
      } catch (e) {
        console.error('Failed to parse local campaigns', e);
      }
    } else {
      const testCampaign: Campaign = {
        id: 'test-campaign',
        name: 'Campanha Teste (Tutorial)',
        createdAt: new Date(),
        lastPlayedAt: new Date(),
        tokens: []
      };
      this.campaigns.set([testCampaign]);
    }
  }
}
