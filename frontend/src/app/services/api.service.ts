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

  // ==========================================
  // Criação de Personagem (D&D 5e Engine)
  // ==========================================

  /** Cria uma ficha completa com todas as regras PHB aplicadas */
  createCharacter(params: {
    raceId: string; subRaceId?: string; classId: string;
    str: number; dex: number; con: number; intAttr: number; wis: number; cha: number;
    background: string; alignment: string; playerName: string;
  }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/character/create`, params);
  }

  /** Valida se multiclasse é possível */
  validateMulticlass(sheet: any, newClassId: string): Observable<{ valid: boolean; errors: string[] }> {
    return this.http.post<any>(`${this.baseUrl}/character/validate-multiclass`, { sheet, newClassId });
  }

  /** Retorna raças expandidas com sub-raças, traits e magias inatas */
  getExpandedRaces(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/character/races`);
  }

  /** Retorna classes expandidas com spell slots e progressão */
  getExpandedClasses(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/character/classes`);
  }

  /** Retorna armaduras com CA, força mínima e desvantagem furtividade */
  getArmors(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/character/armors`);
  }

  /** Retorna condições com efeitos mecânicos completos */
  getExpandedConditions(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/character/conditions`);
  }

  /** Retorna spell slots para uma classe e nível */
  getSpellSlots(casterType: string, level: number): Observable<{ slots: number[] }> {
    return this.http.get<any>(`${this.baseUrl}/character/spell-slots`, { params: { casterType, level: level.toString() } });
  }

  /** Calcula dano de truque escalado pelo nível */
  getCantripDamage(baseDice: string, characterLevel: number): Observable<{ scaledDice: string }> {
    return this.http.post<any>(`${this.baseUrl}/character/cantrip-damage`, { baseDice, characterLevel });
  }

  // ==========================================
  // Guia do Mestre (DMG)
  // ==========================================

  getFallDamage(distanceMeters: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/dmg/fall-damage`, { params: { distanceMeters: distanceMeters.toString() } });
  }

  resolveTrapSave(body: { attributeScore: number; profBonus?: number; isProficient?: boolean; trapDC: number; damageDice?: string; halfOnSuccess?: boolean }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/dmg/trap/save`, body);
  }

  getPoisons(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/dmg/poisons`);
  }

  resolvePoisonSave(body: { conScore: number; profBonus?: number; isProfConSave?: boolean; poisonName: string }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/dmg/poison/save`, body);
  }

  getDiseases(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/dmg/diseases`);
  }

  getEnvironmentalDamage(level: number, severity: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/dmg/environmental-damage`, { params: { level: level.toString(), severity } });
  }

  getXpTable(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/dmg/xp`);
  }

  calculateXP(body: { challengeRatings: string[]; partySize?: number }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/dmg/xp/calculate`, body);
  }

  getAoeTargets(shape: string, sizeMeters: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/dmg/aoe-targets`, { params: { shape, sizeMeters: sizeMeters.toString() } });
  }

  getDcTable(): Observable<Record<string, number>> {
    return this.http.get<Record<string, number>>(`${this.baseUrl}/dmg/dc-table`);
  }

  getObjectAC(material: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/dmg/object/ac`, { params: { material } });
  }

  getObjectHP(size: string, resilient: boolean): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/dmg/object/hp`, { params: { size, resilient: resilient.toString() } });
  }

  getSurvivalFoodDays(conScore: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/dmg/survival/food-days`, { params: { conScore: conScore.toString() } });
  }

  resolveForage(body: { wisMod: number; profBonus?: number; isProficient?: boolean; dc?: number }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/dmg/survival/forage`, body);
  }

  getMagicItemCraftingTable(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/dmg/crafting/magic-items`);
  }
}
