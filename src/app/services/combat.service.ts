import { Injectable, signal, inject } from '@angular/core';
import { Ability } from '../models/ability';
import { Token } from '../models/token';
import { DndCoreEngineService, ActionResult } from './dnd-core-engine.service';

@Injectable({ providedIn: 'root' })
export class CombatService {
  private engine = inject(DndCoreEngineService);
  // Estado de Combate / Preview
  previewAbility = signal<Ability | null>(null);
  previewOrigin = signal<{x: number, y: number} | null>(null);
  previewTarget = signal<{x: number, y: number} | null>(null);
  
  // Estado de Seleção e Visual (Novos)
  selectedTokenId = signal<string | null>(null);
  mapBackgroundImage = signal<string | null>(null); // URL da imagem de fundo
  showGrid = signal<boolean>(false); // Toggle grid visibility
  uiVisible = signal<boolean>(true); // Toggle all UI panels
  rightPanelTab = signal<'sheet' | 'inventory' | 'actions'>('sheet'); // Control right panel tab
  triggerEditSheet = signal<number>(0); // Trigger to open sheet edit mode
  
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
  tokens = signal<Token[]>([
    { 
      id: 't1', name: 'Guerreiro Bob', x: 2, y: 2, hp: 45, maxHp: 45, mp: 10, maxMp: 10, conditions: [], controlledBy: 'user_player_1', color: '#ef4444', type: 'player',
      sheet: { classLevel: 'Guerreiro 3', background: 'Soldado', playerName: 'Jogador 1', race: 'Humano', alignment: 'Neutro e Bom', xp: '900', str: 16, dex: 14, con: 15, int: 10, wis: 12, cha: 8, ac: 16, initiative: 2, speed: 9, proficiencyBonus: 2, passivePerception: 11, hp: 45, maxHp: 45, mp: 10, maxMp: 10 },
      abilities: [
        { id: 'a1', name: 'Varredura com Espada Longa', type: 'action', range: 1.5, areaShape: 'cone', angle: 90, damage: '1d8+3', damageType: 'slashing', description: 'Uma ampla varredura com uma espada longa.', attackBonus: 5 }
      ]
    },
    { 
      id: 't2', name: 'Maga Alice', x: 4, y: 5, hp: 22, maxHp: 22, mp: 30, maxMp: 30, conditions: ['Armadura Arcana'], controlledBy: 'user_player_2', color: '#3b82f6', type: 'player',
      sheet: { classLevel: 'Mago 3', background: 'Sábio', playerName: 'Jogador 2', race: 'Elfo', alignment: 'Caótico e Bom', xp: '900', str: 8, dex: 14, con: 12, int: 16, wis: 13, cha: 10, ac: 12, initiative: 2, speed: 9, proficiencyBonus: 2, passivePerception: 11, hp: 22, maxHp: 22, mp: 30, maxMp: 30 },
      abilities: [
        { id: 'a2', name: 'Bola de Fogo', type: 'action', range: 45, areaShape: 'circle', radius: 6, damage: '8d6', damageType: 'fire', description: 'Um raio brilhante lampeja do seu dedo apontado para um ponto que você escolher dentro do alcance e então floresce com um rugido baixo em uma explosão de chamas.' },
        { id: 'a3', name: 'Relâmpago', type: 'action', range: 30, areaShape: 'line', width: 1.5, length: 30, damage: '8d6', damageType: 'lightning', description: 'Um raio formando uma linha de 30m de comprimento e 1.5m de largura.' }
      ]
    },
    { 
      id: 't3', name: 'Chefe Goblin', x: 8, y: 3, hp: 15, maxHp: 25, mp: 0, maxMp: 0, conditions: ['Envenenado'], controlledBy: 'user_gm_1', color: '#22c55e', imageUrl: 'https://picsum.photos/seed/goblin/128/128', type: 'boss',
      sheet: { classLevel: 'Chefe 1', background: 'Monstro', playerName: 'Mestre', race: 'Goblin', alignment: 'Neutro e Mau', xp: '200', str: 14, dex: 14, con: 14, int: 10, wis: 10, cha: 10, ac: 15, initiative: 2, speed: 9, proficiencyBonus: 2, passivePerception: 10, hp: 15, maxHp: 25, mp: 0, maxMp: 0 },
      abilities: [
        { id: 'a4', name: 'Fenda Goblin', type: 'action', range: 1.5, areaShape: 'circle', radius: 1.5, damage: '2d6+2', damageType: 'slashing', description: 'Um ataque giratório selvagem atingindo todos por perto.', attackBonus: 4 }
      ]
    },
    { id: 't4', name: 'Lacaio Goblin', x: 9, y: 4, hp: 7, maxHp: 7, mp: 0, maxMp: 0, conditions: [], controlledBy: 'user_gm_1', color: '#22c55e', type: 'enemy', abilities: [], sheet: { classLevel: 'Lacaio', background: 'Monstro', playerName: 'Mestre', race: 'Goblin', alignment: 'Neutro e Mau', xp: '50', str: 8, dex: 14, con: 10, int: 10, wis: 8, cha: 8, ac: 13, initiative: 2, speed: 9, proficiencyBonus: 2, passivePerception: 9, hp: 7, maxHp: 7, mp: 0, maxMp: 0 } },
    { id: 't5', name: 'Lacaio Goblin', x: 7, y: 4, hp: 7, maxHp: 7, mp: 0, maxMp: 0, conditions: [], controlledBy: 'user_gm_1', color: '#22c55e', type: 'enemy', abilities: [], sheet: { classLevel: 'Lacaio', background: 'Monstro', playerName: 'Mestre', race: 'Goblin', alignment: 'Neutro e Mau', xp: '50', str: 8, dex: 14, con: 10, int: 10, wis: 8, cha: 8, ac: 13, initiative: 2, speed: 9, proficiencyBonus: 2, passivePerception: 9, hp: 7, maxHp: 7, mp: 0, maxMp: 0 } },
  ]);

  updateToken(id: string, updates: Partial<Token>) {
    this.tokens.update(ts => ts.map(t => {
      if (t.id !== id) return t;
      
      const updatedToken = { ...t, ...updates };
      
      // Sync HP/MP to sheet if they were updated
      if (updatedToken.sheet) {
        if ('hp' in updates) updatedToken.sheet.hp = updates.hp!;
        if ('maxHp' in updates) updatedToken.sheet.maxHp = updates.maxHp!;
        if ('mp' in updates) updatedToken.sheet.mp = updates.mp!;
        if ('maxMp' in updates) updatedToken.sheet.maxMp = updates.maxMp!;
      }
      
      return updatedToken;
    }));
  }

  addToken(token: Token) {
    this.tokens.update(ts => [...ts, token]);
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

  updateStorySlide(index: number, updates: Partial<{url: string, title: string, description: string}>) {
    this.storySlides.update(slides => {
      const newSlides = [...slides];
      if (newSlides[index]) {
        newSlides[index] = { ...newSlides[index], ...updates };
      }
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
    
    // 3. Rolar o Ataque
    const attackRoll = this.engine.calculateAttackRoll(strMod, profBonus, magicBonus, mode);
    
    // 4. Validar Sucesso (Acerto)
    const hitCheck = this.engine.validateSuccess(attackRoll.total, targetAC);
    const isHit = hitCheck.success || attackRoll.isCritical; // Crítico sempre acerta
    
    let log = `Ataque contra ${target.name} (CA ${targetAC}): ${attackRoll.log}`;
    let damageRoll: ActionResult | undefined;

    // 5. Rolar Dano se acertou
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