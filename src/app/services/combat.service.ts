import { Injectable, signal, inject } from '@angular/core';
import { Ability } from '../models/ability';
import { Token, CharacterSheet } from '../models/token';
import { DndCoreEngineService, ActionResult } from './dnd-core-engine.service';
import { ItemToken } from '../models/item-token';
import { TokenCondition } from '../models/token';

export const AVAILABLE_CONDITIONS: TokenCondition[] = [
  { id: 'fire', name: 'Fogo', icon: 'local_fire_department', color: '#ef4444' },
  { id: 'cold', name: 'Frio', icon: 'ac_unit', color: '#3b82f6' },
  { id: 'lightning', name: 'Elétrico', icon: 'bolt', color: '#eab308' },
  { id: 'acid', name: 'Ácido', icon: 'water_drop', color: '#22c55e' },
  { id: 'poison', name: 'Veneno', icon: 'science', color: '#84cc16' },
  { id: 'thunder', name: 'Trovejante', icon: 'volume_up', color: '#a8a29e' },
  { id: 'necrotic', name: 'Necrótico', icon: 'sentiment_very_dissatisfied', color: '#7e22ce' },
  { id: 'radiant', name: 'Radiante', icon: 'wb_sunny', color: '#fbbf24' },
  { id: 'force', name: 'Força', icon: 'flare', color: '#a855f7' },
  { id: 'psychic', name: 'Psíquico', icon: 'psychology', color: '#ec4899' },
  
  { id: 'blinded', name: 'Cego', icon: 'visibility_off', color: '#737373' },
  { id: 'charmed', name: 'Enfeitiçado', icon: 'favorite', color: '#ec4899' },
  { id: 'deafened', name: 'Surdo', icon: 'hearing_disabled', color: '#737373' },
  { id: 'frightened', name: 'Amedrontado', icon: 'mood_bad', color: '#f59e0b' },
  { id: 'grappled', name: 'Agarrado', icon: 'front_hand', color: '#d97706' },
  { id: 'incapacitated', name: 'Incapacitado', icon: 'block', color: '#ef4444' },
  { id: 'invisible', name: 'Invisível', icon: 'visibility_off', color: '#94a3b8' },
  { id: 'paralyzed', name: 'Paralisado', icon: 'pan_tool', color: '#ef4444' },
  { id: 'petrified', name: 'Petrificado', icon: 'imagesearch_roller', color: '#57534e' },
  { id: 'prone', name: 'Caído', icon: 'airline_seat_flat', color: '#a8a29e' },
  { id: 'restrained', name: 'Impedido', icon: 'lock', color: '#f43f5e' },
  { id: 'stunned', name: 'Atordoado', icon: 'stars', color: '#eab308' },
  { id: 'unconscious', name: 'Inconsciente', icon: 'bedtime', color: '#1e3a8a' },
  { id: 'exhaustion', name: 'Exaustão', icon: 'battery_alert', color: '#dc2626' }
];

export interface CombatNotification {
  id: string;
  message: string;
  type: 'xp' | 'level-up' | 'info';
  timestamp: number;
}

const XP_TABLE: Record<number, { xp: number, pb: number }> = {
  1: { xp: 0, pb: 2 },
  2: { xp: 300, pb: 2 },
  3: { xp: 900, pb: 2 },
  4: { xp: 2700, pb: 2 },
  5: { xp: 6500, pb: 3 },
  6: { xp: 14000, pb: 3 },
  7: { xp: 23000, pb: 3 },
  8: { xp: 34000, pb: 3 },
  9: { xp: 48000, pb: 4 },
  10: { xp: 64000, pb: 4 },
  11: { xp: 85000, pb: 4 },
  12: { xp: 100000, pb: 4 },
  13: { xp: 120000, pb: 5 },
  14: { xp: 140000, pb: 5 },
  15: { xp: 165000, pb: 5 },
  16: { xp: 195000, pb: 5 },
  17: { xp: 225000, pb: 6 },
  18: { xp: 265000, pb: 6 },
  19: { xp: 305000, pb: 6 },
  20: { xp: 355000, pb: 6 },
};

@Injectable({ providedIn: 'root' })
export class CombatService {
  private engine = inject(DndCoreEngineService);
  // Estado de Combate / Preview
  previewAbility = signal<Ability | null>(null);
  previewOrigin = signal<{x: number, y: number} | null>(null);
  previewTarget = signal<{x: number, y: number} | null>(null);
  
  // Estado de Seleção e Visual (Novos)
  selectedTokenId = signal<string | null>(null);
  selectedItemToken = signal<ItemToken | null>(null);
  itemTokens = signal<ItemToken[]>([]);
  mapBackgroundImage = signal<string | null>(null); // URL da imagem de fundo
  showGrid = signal<boolean>(false); // Toggle grid visibility
  uiVisible = signal<boolean>(true); // Toggle all UI panels
  gmPanelVisible = signal<boolean>(false); // Toggle GM panel
  isPlayMode = signal<boolean>(false); // Toggle between GM and Play mode for GMs
  rightPanelTab = signal<'sheet' | 'inventory' | 'actions'>('sheet'); // Control right panel tab
  triggerEditSheet = signal<number>(0); // Trigger to open sheet edit mode
  
  // Fog of War State
  isFogEnabled = signal<boolean>(true);
  isFogEditMode = signal<boolean>(false);
  fogBrushType = signal<'reveal' | 'hide'>('reveal');
  fogOfWar = signal<string[]>([]); // Array of "x,y" hidden cells
  
  // Notifications
  notifications = signal<CombatNotification[]>([]);

  // View State (Zoom & Pan)
  zoom = signal<number>(1);
  pan = signal<{x: number, y: number}>({x: 0, y: 0});
  
  // Measure Tool State
  isMeasuring = signal<boolean>(false);
  measureStart = signal<{x: number, y: number} | null>(null);
  measureCurrent = signal<{x: number, y: number} | null>(null);
  
  // Session Notes State
  storyContent = signal<string>('O grupo se aproxima do templo em ruínas de <span style="color: #991b1b; font-weight: bold;">BloodDragons</span>. <br>Uma névoa espessa obscurece a entrada, e o cheiro de enxofre paira pesado no ar.');
  gmSecretContent = signal<string>('<strong>Segredo do Mestre:</strong> As estátuas perto da porta são na verdade Gárgulas esperando para emboscar.');
  
  // Story Slides State
  showStorySlides = signal<boolean>(false);
  storySlides = signal<{url: string, title: string, description: string}[]>([
    {
      url: 'https://picsum.photos/seed/dnd1/1920/1080',
      title: 'A Taverna do Dragão Caolho',
      description: 'O cheiro de cerveja anã e carne assada preenche o ar. Aventureiros de todas as raças se reúnem aqui em busca de glória e ouro.'
    },
    {
      url: 'https://picsum.photos/seed/dnd2/1920/1080',
      title: 'A Floresta Sussurrante',
      description: 'As árvores parecem se mover quando você não está olhando. Um nevoeiro denso cobre o chão, escondendo perigos ancestrais.'
    },
    {
      url: 'https://picsum.photos/seed/dnd3/1920/1080',
      title: 'O Rei Goblin',
      description: 'Sentado em seu trono de ossos, o Rei Goblin sorri maliciosamente. Seus olhos brilham com uma inteligência cruel e gananciosa.'
    }
  ]);

  // Tokens State
  tokens = signal<Token[]>([]);
  mapWidth = signal<number>(2000); // Default large size
  mapHeight = signal<number>(2000);
  
  constructor() {
    // Initialize with some default tokens if needed, or just leave empty
    this.tokens.set([
    { 
      id: 't1', name: 'Guerreiro Bob', x: 2, y: 2, hp: 45, maxHp: 45, mp: 10, maxMp: 10, conditions: [], controlledBy: 'user_player_1', color: '#ef4444', type: 'player',
      sheet: { class: 'Guerreiro', level: 3, background: 'Soldado', playerName: 'Jogador 1', race: 'Humano', alignment: 'Neutro e Bom', xp: 900, hitDie: 10, str: 16, dex: 14, con: 15, int: 10, wis: 12, cha: 8, ac: 16, initiative: 2, speed: 9, proficiencyBonus: 2, passivePerception: 11, hp: 45, maxHp: 45, mp: 10, maxMp: 10 },
      abilities: [
        { id: 'a1', name: 'Varredura com Espada Longa', type: 'action', range: 1.5, areaShape: 'cone', angle: 90, damage: '1d8+3', damageType: 'slashing', description: 'Uma ampla varredura com uma espada longa.', attackBonus: 5 }
      ]
    },
    { 
      id: 't2', name: 'Maga Alice', x: 4, y: 5, hp: 22, maxHp: 22, mp: 30, maxMp: 30, conditions: [{ id: 'arcane_armor', name: 'Armadura Arcana', icon: 'shield', color: '#3b82f6' }], controlledBy: 'user_player_2', color: '#3b82f6', type: 'player',
      sheet: { class: 'Mago', level: 3, background: 'Sábio', playerName: 'Jogador 2', race: 'Elfo', alignment: 'Caótico e Bom', xp: 900, hitDie: 6, str: 8, dex: 14, con: 12, int: 16, wis: 13, cha: 10, ac: 12, initiative: 2, speed: 9, proficiencyBonus: 2, passivePerception: 11, hp: 22, maxHp: 22, mp: 30, maxMp: 30 },
      abilities: [
        { id: 'a2', name: 'Bola de Fogo', type: 'action', range: 45, areaShape: 'circle', radius: 6, damage: '8d6', damageType: 'fire', description: 'Um raio brilhante lampeja do seu dedo apontado para um ponto que você escolher dentro do alcance e então floresce com um rugido baixo em uma explosão de chamas.' },
        { id: 'a3', name: 'Relâmpago', type: 'action', range: 30, areaShape: 'line', width: 1.5, length: 30, damage: '8d6', damageType: 'lightning', description: 'Um raio formando uma linha de 30m de comprimento e 1.5m de largura.' }
      ]
    },
    { 
      id: 't3', name: 'Chefe Goblin', x: 8, y: 3, hp: 15, maxHp: 25, mp: 0, maxMp: 0, conditions: [{ id: 'poison', name: 'Veneno', icon: 'science', color: '#84cc16' }], controlledBy: 'user_gm_1', color: '#22c55e', imageUrl: 'https://picsum.photos/seed/goblin/128/128', type: 'boss',
      sheet: { class: 'Chefe', level: 1, background: 'Monstro', playerName: 'Mestre', race: 'Goblin', alignment: 'Neutro e Mau', xp: 200, hitDie: 8, str: 14, dex: 14, con: 14, int: 10, wis: 10, cha: 10, ac: 15, initiative: 2, speed: 9, proficiencyBonus: 2, passivePerception: 10, hp: 15, maxHp: 25, mp: 0, maxMp: 0 },
      abilities: [
        { id: 'a4', name: 'Fenda Goblin', type: 'action', range: 1.5, areaShape: 'circle', radius: 1.5, damage: '2d6+2', damageType: 'slashing', description: 'Um ataque giratório selvagem atingindo todos por perto.', attackBonus: 4 }
      ]
    },
    { id: 't4', name: 'Lacaio Goblin', x: 9, y: 4, hp: 7, maxHp: 7, mp: 0, maxMp: 0, conditions: [], controlledBy: 'user_gm_1', color: '#22c55e', type: 'enemy', abilities: [], sheet: { class: 'Lacaio', level: 1, background: 'Monstro', playerName: 'Mestre', race: 'Goblin', alignment: 'Neutro e Mau', xp: 50, hitDie: 6, str: 8, dex: 14, con: 10, int: 10, wis: 8, cha: 8, ac: 13, initiative: 2, speed: 9, proficiencyBonus: 2, passivePerception: 9, hp: 7, maxHp: 7, mp: 0, maxMp: 0 } },
    { id: 't5', name: 'Lacaio Goblin', x: 7, y: 4, hp: 7, maxHp: 7, mp: 0, maxMp: 0, conditions: [], controlledBy: 'user_gm_1', color: '#22c55e', type: 'enemy', abilities: [], sheet: { class: 'Lacaio', level: 1, background: 'Monstro', playerName: 'Mestre', race: 'Goblin', alignment: 'Neutro e Mau', xp: 50, hitDie: 6, str: 8, dex: 14, con: 10, int: 10, wis: 8, cha: 8, ac: 13, initiative: 2, speed: 9, proficiencyBonus: 2, passivePerception: 9, hp: 7, maxHp: 7, mp: 0, maxMp: 0 } },
    ]);
  }

  updateToken(id: string, updates: Partial<Token>) {
    let xpToDistribute = 0;
    let enemyName = '';
    let movedPlayerX: number | null = null;
    let movedPlayerY: number | null = null;

    this.tokens.update(ts => ts.map(t => {
      if (t.id !== id) return t;
      
      const oldHp = t.hp;
      const updatedToken = { ...t, ...updates };
      
      // Sync HP/MP to sheet if they were updated
      if (updatedToken.sheet) {
        if ('hp' in updates) updatedToken.sheet.hp = updates.hp!;
        if ('maxHp' in updates) updatedToken.sheet.maxHp = updates.maxHp!;
        if ('mp' in updates) updatedToken.sheet.mp = updates.mp!;
        if ('maxMp' in updates) updatedToken.sheet.maxMp = updates.maxMp!;
      }

      // Check for token death to distribute XP (any non-player with XP)
      if (t.type !== 'player' && oldHp > 0 && updatedToken.hp <= 0) {
        xpToDistribute = updatedToken.sheet?.xp || 0;
        enemyName = updatedToken.name;
      }
      
      // Check if player moved
      if (t.type === 'player' && (('x' in updates && updates.x !== t.x) || ('y' in updates && updates.y !== t.y))) {
        movedPlayerX = updatedToken.x;
        movedPlayerY = updatedToken.y;
      }
      
      return updatedToken;
    }));

    if (xpToDistribute > 0) {
      this.distributeXP(xpToDistribute, enemyName);
    }
    
    if (movedPlayerX !== null && movedPlayerY !== null) {
      this.revealFogAround(movedPlayerX, movedPlayerY);
    }
  }

  private distributeXP(amount: number, sourceName: string) {
    const allPlayers = this.tokens().filter(t => t.type === 'player');
    const playerCount = allPlayers.length;
    
    if (playerCount === 0) return;

    const xpPerPlayer = Math.floor(amount / playerCount);
    const alivePlayers = allPlayers.filter(t => t.hp > 0);
    
    this.addNotification(
      `${sourceName} derrotado! ${amount} XP dividido entre ${playerCount} jogadores (${xpPerPlayer} XP cada).`, 
      'xp'
    );

    if (alivePlayers.length === 0) return;

    this.tokens.update(ts => ts.map(t => {
      if (t.type === 'player' && t.hp > 0 && t.sheet) {
        const newXp = t.sheet.xp + xpPerPlayer;
        const updatedSheet = { ...t.sheet, xp: newXp };
        
        const result = this.checkLevelUp(updatedSheet, t.name);
        // Sync top-level HP/maxHp with sheet
        return { 
          ...t, 
          sheet: result.sheet,
          hp: result.sheet.hp,
          maxHp: result.sheet.maxHp
        };
      }
      return t;
    }));
  }

  private checkLevelUp(sheet: CharacterSheet, charName: string): { sheet: CharacterSheet, leveledUp: boolean } {
    let currentLevel = sheet.level;
    let leveledUp = false;

    while (currentLevel < 20 && sheet.xp >= XP_TABLE[currentLevel + 1].xp) {
      currentLevel++;
      leveledUp = true;
      
      // Apply Level Up Bonuses
      sheet.level = currentLevel;
      
      // Proficiency Bonus
      sheet.proficiencyBonus = XP_TABLE[currentLevel].pb;

      // HP Increase: 1 Hit Die + CON modifier
      const conMod = this.engine.calculateModifier(sheet.con);
      const hitDie = sheet.hitDie || 10;
      const hpGain = Math.floor(Math.random() * hitDie) + 1 + conMod;
      sheet.maxHp += Math.max(1, hpGain);
      sheet.hp = sheet.maxHp; // Heal on level up? Or just increase max. Let's heal for now.

      this.addNotification(`Parabéns! ${charName} evoluiu para o nível ${currentLevel}!`, 'level-up');
      
      // Attribute Increase Notification
      if ([4, 8, 12, 16, 19].includes(currentLevel)) {
        this.addNotification(`${charName} ganhou um Aumento de Atributo ou Talento no nível ${currentLevel}!`, 'info');
      }
    }

    return { sheet, leveledUp };
  }

  private addNotification(message: string, type: 'xp' | 'level-up' | 'info') {
    const id = Math.random().toString(36).substr(2, 9);
    this.notifications.update(n => [...n, { id, message, type, timestamp: Date.now() }]);
    
    // Auto-remove after 10 seconds
    setTimeout(() => {
      this.notifications.update(n => n.filter(notif => notif.id !== id));
    }, 10000);
  }

  removeNotification(id: string) {
    this.notifications.update(n => n.filter(notif => notif.id !== id));
  }

  addToken(token: Token) {
    this.tokens.update(ts => [...ts, token]);
    if (token.type === 'player') {
      this.revealFogAround(token.x, token.y);
    }
  }

  deleteToken(id: string) {
    this.tokens.update(ts => ts.filter(t => t.id !== id));
  }
  
  startPreview(ability: Ability, originToken: Token) {
    this.previewAbility.set(ability);
    this.previewOrigin.set({ x: originToken.x, y: originToken.y });
    // Default target
    this.previewTarget.set({ x: (originToken.x + 0.5) * 64, y: (originToken.y + 0.5) * 64 });
  }

  updateTarget(x: number, y: number) {
    this.previewTarget.set({ x, y });
  }

  cancelPreview() {
    this.previewAbility.set(null);
    this.previewOrigin.set(null);
    this.previewTarget.set(null);
  }

  selectToken(id: string) {
    this.selectedTokenId.set(id);
  }

  setMapBackground(url: string) {
    this.mapBackgroundImage.set(url);
  }

  addStorySlide(slide: {url: string, title: string, description: string}) {
    this.storySlides.update(slides => [...slides, slide]);
  }

  addStorySlides(newSlides: {url: string, title: string, description: string}[]) {
    this.storySlides.update(slides => [...slides, ...newSlides]);
  }

  deleteStorySlide(index: number) {
    this.storySlides.update(slides => slides.filter((_, i) => i !== index));
  }

  toggleFogCell(x: number, y: number, hide: boolean) {
    const key = `${x},${y}`;
    this.fogOfWar.update(fog => {
      const isHidden = fog.includes(key);
      if (hide && !isHidden) {
        return [...fog, key];
      } else if (!hide && isHidden) {
        return fog.filter(k => k !== key);
      }
      return fog;
    });
  }

  clearFog() {
    this.fogOfWar.set([]);
  }

  hideAllFog(width: number, height: number, gridSize: number) {
    const cols = Math.ceil(width / gridSize);
    const rows = Math.ceil(height / gridSize);
    const newFog: string[] = [];
    for (let x = 0; x < cols; x++) {
      for (let y = 0; y < rows; y++) {
        newFog.push(`${x},${y}`);
      }
    }
    this.fogOfWar.set(newFog);

    // Auto-reveal around all players
    const players = this.tokens().filter(t => t.type === 'player');
    players.forEach(p => {
      this.revealFogAround(p.x, p.y);
    });
  }

  revealFogAround(x: number, y: number, radius: number = 4) {
    if (!this.isFogEnabled()) return;
    
    this.fogOfWar.update(fog => {
      const fogSet = new Set(fog);
      let changed = false;
      
      for (let dx = -radius; dx <= radius; dx++) {
        for (let dy = -radius; dy <= radius; dy++) {
          if (dx*dx + dy*dy <= radius*radius) {
            const cx = Math.floor(x + dx);
            const cy = Math.floor(y + dy);
            const key = `${cx},${cy}`;
            if (fogSet.has(key)) {
              fogSet.delete(key);
              changed = true;
            }
          }
        }
      }
      
      return changed ? Array.from(fogSet) : fog;
    });
  }

  updateStorySlide(index: number, updates: Partial<{url: string, title: string, description: string}>) {
    this.storySlides.update(slides => {
      const newSlides = [...slides];
      if (newSlides[index]) {
        newSlides[index] = { ...newSlides[index], ...updates };
      }
      return newSlides;
    });
  }

  reorderStorySlide(fromIndex: number, toIndex: number) {
    this.storySlides.update(slides => {
      if (fromIndex < 0 || fromIndex >= slides.length || toIndex < 0 || toIndex >= slides.length) {
        return slides;
      }
      const newSlides = [...slides];
      const [movedSlide] = newSlides.splice(fromIndex, 1);
      newSlides.splice(toIndex, 0, movedSlide);
      return newSlides;
    });
  }

  // ==========================================
  // Exemplo de Integração com o DndCoreEngineService
  // ==========================================
  
  /**
   * Resolve um ataque completo com uma única chamada, utilizando o DndCoreEngineService.
   * Exemplo de uso: this.combat.resolveAttack(tokenAtacante, tokenAlvo, habilidade);
   */
  resolveAttack(attacker: Token, target: Token, ability: Ability, mode: 'normal' | 'advantage' | 'disadvantage' = 'normal'): { attack: ActionResult, damage?: ActionResult, hit: boolean, log: string } {
    // 1. Extrair dados do atacante
    const strMod = this.engine.calculateModifier(attacker.sheet?.str || 10);
    const profBonus = attacker.sheet?.proficiencyBonus || 2;
    const magicBonus = ability.attackBonus || 0; // Ex: +1 de arma mágica
    
    // 2. Extrair dados do alvo
    const targetAC = target.sheet?.ac || 10;
    
    // 3. Verificar Condições do Alvo para Vantagem Automática
    let finalMode = mode;
    const advantageConditions = ['Atordoado', 'Cego', 'Incapacitado', 'Inconsciente', 'Paralisado', 'Petrificado', 'Impedido'];
    if (target.conditions.some(c => advantageConditions.includes(c.name))) {
      finalMode = 'advantage';
    }

    // 4. Rolar o Ataque
    const attackRoll = this.engine.calculateAttackRoll(strMod, profBonus, magicBonus, finalMode);
    
    // 5. Validar Sucesso (Acerto)
    const hitCheck = this.engine.validateSuccess(attackRoll.total, targetAC);
    const isHit = hitCheck.success || attackRoll.isCritical; // Crítico sempre acerta
    
    let log = `Ataque contra ${target.name} (CA ${targetAC}): ${attackRoll.log}`;
    if (finalMode === 'advantage' && mode !== 'advantage') {
      log += `\n(Vantagem automática devido à condição do alvo)`;
    }
    
    let damageRoll: ActionResult | undefined;

    // 6. Rolar Dano se acertou
    if (isHit && !attackRoll.isCriticalFail) {
      log += `\n🎯 ACERTOU!`;
      
      // Se for crítico, o DndCoreEngineService pode ser usado para rolar os dados de dano duas vezes
      // Para simplificar o exemplo, vamos apenas rolar o dano normal
      const damageDice = ability.damage || '1d8';
      
      // Rola o dano
      damageRoll = this.engine.calculateDamage(damageDice, strMod, 0);
      
      // Se for crítico, dobra os dados (exemplo simplificado)
      if (attackRoll.isCritical) {
         const critDamage = this.engine.calculateDamage(damageDice, 0, 0); // Só os dados
         damageRoll.total += critDamage.total;
         damageRoll.log += ` + Crítico: ${critDamage.log}`;
      }

      log += `\n⚔️ Dano: ${damageRoll.log}`;
      
      // Aplica o dano no alvo (opcional no exemplo)
      // this.updateToken(target.id, { hp: Math.max(0, target.hp - damageRoll.total) });
    } else {
      log += `\n🛡️ ERROU!`;
    }

    return {
      attack: attackRoll,
      damage: damageRoll,
      hit: isHit && !attackRoll.isCriticalFail,
      log
    };
  }

  /**
   * Resolve a cura de uma habilidade
   */
  resolveHealing(target: Token, ability: Ability): { healing: ActionResult, log: string } {
    const healingDice = ability.healing || '1d8';
    const modifier = 0; // Pode ser expandido para usar modificadores de atributo (ex: Sabedoria para clérigos)
    
    const healingRoll = this.engine.calculateHealing(healingDice, modifier);
    
    const log = `Cura em ${target.name}: ${healingRoll.log}`;
    
    const newHp = Math.min(target.maxHp, target.hp + healingRoll.total);
    this.updateToken(target.id, { hp: newHp });
    
    return {
      healing: healingRoll,
      log
    };
  }
}