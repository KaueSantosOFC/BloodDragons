import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * Serviço centralizado para comunicação com o backend Java.
 * Todas as chamadas HTTP passam por este serviço.
 */
@Injectable({
  providedIn: 'root'
})
export class ApiService {
  /**
   * URL base da API. Em produção (Nginx), usa path relativo /api.
   * Em dev local (ng serve), aponta diretamente para o backend na porta 8080.
   */
  private baseUrl: string;

  constructor(private http: HttpClient) {
    // Detecta se está rodando via ng serve (porta 3000 sem Nginx)
    if (typeof window !== 'undefined' && window.location.port === '3000' && !window.location.hostname.includes('docker')) {
      this.baseUrl = 'http://localhost:8080/api';
    } else {
      this.baseUrl = '/api';  // Nginx faz proxy
    }
  }

  // ==========================================
  // Engine D&D 5e
  // ==========================================

  rollDice(diceString: string): Observable<{ total: number; rolls: number[]; log: string }> {
    return this.http.post<any>(`${this.baseUrl}/engine/roll-dice`, { diceString });
  }

  calculateModifier(score: number): Observable<{ score: number; modifier: number }> {
    return this.http.post<any>(`${this.baseUrl}/engine/calculate-modifier`, { score });
  }

  calculateAC(params: {
    armorType: string; baseAC: number; dexModifier: number;
    shieldBonus: number; conModifier: number; wisModifier: number;
    unarmoredDefenseClass?: string;
  }): Observable<{ ac: number }> {
    return this.http.post<any>(`${this.baseUrl}/engine/calculate-ac`, params);
  }

  spellSaveDC(modifier: number, proficiency: number): Observable<{ dc: number }> {
    return this.http.post<any>(`${this.baseUrl}/engine/spell-save-dc`, { modifier, proficiency });
  }

  calculateMaxHP(hitDice: number, level: number, conModifier: number): Observable<{ maxHp: number }> {
    return this.http.post<any>(`${this.baseUrl}/engine/calculate-max-hp`, { hitDice, level, conModifier });
  }

  proficiencyBonus(level: number): Observable<{ bonus: number }> {
    return this.http.post<any>(`${this.baseUrl}/engine/proficiency-bonus`, { level });
  }

  calculateDistance(x1: number, y1: number, x2: number, y2: number): Observable<{ distanceMeters: number }> {
    return this.http.post<any>(`${this.baseUrl}/engine/distance`, { x1, y1, x2, y2 });
  }

  // ==========================================
  // Combate
  // ==========================================

  resolveAttack(attacker: any, target: any, ability: any, mode = 'normal'): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/combat/resolve-attack`, { attacker, target, ability, mode });
  }

  attackRoll(modifier: number, proficiency: number, magicBonus = 0, mode = 'normal', extraDice = ''): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/combat/attack-roll`, { modifier, proficiency, magicBonus, mode, extraDice });
  }

  damageRoll(diceString: string, modifier: number, itemBonus = 0, resistanceMultiplier = 1, isOffhand = false): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/combat/damage-roll`, { diceString, modifier, itemBonus, resistanceMultiplier, isOffhand });
  }

  healingRoll(diceString: string, modifier: number, bonus = 0): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/combat/healing-roll`, { diceString, modifier, bonus });
  }

  savingThrow(modifier: number, proficiency: number, isProficient: boolean,
    hasAdvantage = false, hasDisadvantage = false, magicBonus = 0): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/combat/saving-throw`, {
      modifier, proficiency, isProficient, hasAdvantage, hasDisadvantage, magicBonus
    });
  }

  getConditions(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/combat/conditions`);
  }

  // ==========================================
  // Campanhas
  // ==========================================

  getCampaigns(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/campaigns`);
  }

  getCampaign(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/campaigns/${id}`);
  }

  createCampaign(name: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/campaigns`, { name });
  }

  updateCampaign(id: string, updates: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/campaigns/${id}`, updates);
  }

  deleteCampaign(id: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/campaigns/${id}`);
  }

  // ==========================================
  // Compêndio
  // ==========================================

  getWeapons(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/compendium/weapons`);
  }

  getSpells(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/compendium/spells`);
  }

  getClasses(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/compendium/classes`);
  }

  getRaces(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/compendium/races`);
  }

  getAlignments(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/compendium/alignments`);
  }

  getBackgrounds(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/compendium/backgrounds`);
  }

  // ==========================================
  // Upload
  // ==========================================

  uploadImage(file: File): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append('image', file);
    return this.http.post<{ url: string }>(`${this.baseUrl}/upload`, formData);
  }
}
