import { Injectable, signal } from '@angular/core';
import { Campaign } from '../models/campaign';

@Injectable({
  providedIn: 'root'
})
export class CampaignService {
  campaigns = signal<Campaign[]>([]);
  activeCampaign = signal<Campaign | null>(null);

  constructor() {
    this.loadCampaigns();
  }

  loadCampaigns() {
    if (typeof window === 'undefined') return;
    
    const saved = localStorage.getItem('dnd_campaigns');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Convert string dates back to Date objects
        const campaigns = parsed.map((c: Record<string, unknown>) => ({
          ...c,
          createdAt: new Date(c['createdAt'] as string),
          lastPlayedAt: new Date(c['lastPlayedAt'] as string)
        })) as Campaign[];
        this.campaigns.set(campaigns);
      } catch (e) {
        console.error('Failed to parse campaigns', e);
        this.campaigns.set([]);
      }
    } else {
      // Add the default "test" campaign if none exist
      const testCampaign: Campaign = {
        id: 'test-campaign',
        name: 'Campanha Teste (Tutorial)',
        createdAt: new Date(),
        lastPlayedAt: new Date(),
        tokens: []
      };
      this.campaigns.set([testCampaign]);
      this.saveCampaigns([testCampaign]);
    }
  }

  saveCampaigns(campaigns: Campaign[]) {
    if (typeof window === 'undefined') return;
    localStorage.setItem('dnd_campaigns', JSON.stringify(campaigns));
  }

  createCampaign(name: string) {
    const newCampaign: Campaign = {
      id: 'camp_' + Date.now().toString(),
      name,
      createdAt: new Date(),
      lastPlayedAt: new Date(),
      tokens: []
    };
    
    const updated = [...this.campaigns(), newCampaign];
    this.campaigns.set(updated);
    this.saveCampaigns(updated);
    
    this.activeCampaign.set(newCampaign);
  }

  loadCampaign(id: string) {
    const campaign = this.campaigns().find(c => c.id === id);
    if (campaign) {
      // Update last played
      campaign.lastPlayedAt = new Date();
      this.saveCampaigns(this.campaigns());
      this.activeCampaign.set(campaign);
    }
  }

  exitCampaign() {
    this.activeCampaign.set(null);
  }

  updateActiveCampaign(updates: Partial<Campaign>) {
    const current = this.activeCampaign();
    if (!current) return;
    
    const updated = { ...current, ...updates, lastPlayedAt: new Date() };
    this.activeCampaign.set(updated);
    
    const all = this.campaigns().map(c => c.id === updated.id ? updated : c);
    this.campaigns.set(all);
    this.saveCampaigns(all);
  }

  deleteCampaign(id: string) {
    if (id === 'test-campaign') return; // Don't delete tutorial
    
    const updated = this.campaigns().filter(c => c.id !== id);
    this.campaigns.set(updated);
    this.saveCampaigns(updated);
    
    if (this.activeCampaign()?.id === id) {
      this.activeCampaign.set(null);
    }
  }
}
