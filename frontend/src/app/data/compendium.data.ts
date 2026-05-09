export interface CompendiumWeapon {
  id: string;
  name: string;
  weaponType: 'simple' | 'martial' | 'natural';
  attackType: 'melee' | 'ranged';
  damage: string;
  damageType: string;
  properties: string[];
  range: number;
  description?: string;
}

/** Traduz propriedades de arma para português com explicação */
export const WEAPON_PROPERTY_LABELS: Record<string, string> = {
  'finesse': '⚔️ Acuidade — Pode usar FOR ou DES para ataque e dano',
  'light': '🪶 Leve — Pode ser usada em combate com duas armas',
  'thrown': '🎯 Arremesso — Pode ser arremessada para ataque à distância',
  'versatile': '🔄 Versátil — Pode ser empunhada com 1 ou 2 mãos (dado maior)',
  'two-handed': '🤲 Duas Mãos — Requer as duas mãos para usar',
  'heavy': '🏋️ Pesada — Criaturas Pequenas têm desvantagem',
  'reach': '📏 Alcance — Alcance de 3m em vez de 1.5m',
  'ammunition': '🏹 Munição — Requer munição para disparar',
  'loading': '⏳ Recarga — Apenas 1 ataque por ação (independente de Ataque Extra)',
  'special': '⭐ Especial — Consulte as regras especiais da arma',
};

export const COMPENDIUM_WEAPONS: CompendiumWeapon[] = [
  // Ataque Desarmado (disponível para todos)
  { id: 'unarmed', name: 'Ataque Desarmado', weaponType: 'natural', attackType: 'melee', damage: '1', damageType: 'pancada', properties: [],
    range: 1.5, description: 'Soco, chute ou cabeçada. Todos são proficientes. Dano = 1 + mod. FOR. Monges podem usar DES e o dado escala com nível (1d4→1d10).' },

  // Armas Simples Corpo-a-Corpo
  { id: 'dagger', name: 'Adaga', weaponType: 'simple', attackType: 'melee', damage: '1d4', damageType: 'perfurante', properties: ['finesse', 'light', 'thrown'], range: 6,
    description: 'Lâmina curta e versátil. Pode usar FOR ou DES (Acuidade). Arremesso: 6/18m.' },
  { id: 'javelin', name: 'Azagaia', weaponType: 'simple', attackType: 'melee', damage: '1d6', damageType: 'perfurante', properties: ['thrown'], range: 9,
    description: 'Lança de arremesso leve. Arremesso: 9/36m.' },
  { id: 'club', name: 'Bastão', weaponType: 'simple', attackType: 'melee', damage: '1d4', damageType: 'pancada', properties: ['light'], range: 1.5,
    description: 'Porrete simples. Leve: pode ser usada em combate com duas armas.' },
  { id: 'quarterstaff', name: 'Bordão', weaponType: 'simple', attackType: 'melee', damage: '1d6', damageType: 'pancada', properties: ['versatile'], range: 1.5,
    description: 'Bastão longo. Versátil: 1d6 (1 mão) ou 1d8 (2 mãos). Monges o usam como arma de Artes Marciais.' },
  { id: 'greatclub', name: 'Clava Grande', weaponType: 'simple', attackType: 'melee', damage: '1d8', damageType: 'pancada', properties: ['two-handed'], range: 1.5,
    description: 'Clava pesada. Requer duas mãos.' },
  { id: 'sickle', name: 'Foice', weaponType: 'simple', attackType: 'melee', damage: '1d4', damageType: 'cortante', properties: ['light'], range: 1.5,
    description: 'Foice curva e leve. Pode ser usada em combate com duas armas.' },
  { id: 'spear', name: 'Lança', weaponType: 'simple', attackType: 'melee', damage: '1d6', damageType: 'perfurante', properties: ['thrown', 'versatile'], range: 6,
    description: 'Lança versátil. 1d6 (1 mão) ou 1d8 (2 mãos). Arremesso: 6/18m.' },
  { id: 'mace', name: 'Maça', weaponType: 'simple', attackType: 'melee', damage: '1d6', damageType: 'pancada', properties: [], range: 1.5,
    description: 'Arma pesada de impacto. Favorita de Clérigos.' },
  { id: 'handaxe', name: 'Machado de Mão', weaponType: 'simple', attackType: 'melee', damage: '1d6', damageType: 'cortante', properties: ['light', 'thrown'], range: 6,
    description: 'Machado leve e arremessável. Arremesso: 6/18m.' },
  { id: 'lighthammer', name: 'Martelo Leve', weaponType: 'simple', attackType: 'melee', damage: '1d4', damageType: 'pancada', properties: ['light', 'thrown'], range: 6,
    description: 'Martelo leve e arremessável. Arremesso: 6/18m.' },
  
  // Armas Simples à Distância
  { id: 'shortbow', name: 'Arco Curto', weaponType: 'simple', attackType: 'ranged', damage: '1d6', damageType: 'perfurante', properties: ['ammunition', 'two-handed'], range: 24,
    description: 'Arco leve. Alcance: 24/96m. Requer flechas.' },
  { id: 'lightcrossbow', name: 'Besta Leve', weaponType: 'simple', attackType: 'ranged', damage: '1d8', damageType: 'perfurante', properties: ['ammunition', 'loading', 'two-handed'], range: 24,
    description: 'Besta simples. Alcance: 24/96m. Recarga: apenas 1 disparo por ação.' },
  { id: 'dart', name: 'Dardo', weaponType: 'simple', attackType: 'ranged', damage: '1d4', damageType: 'perfurante', properties: ['finesse', 'thrown'], range: 6,
    description: 'Dardo arremessável. Acuidade: pode usar DES. Arremesso: 6/18m.' },
  { id: 'sling', name: 'Funda', weaponType: 'simple', attackType: 'ranged', damage: '1d4', damageType: 'pancada', properties: ['ammunition'], range: 9,
    description: 'Funda com pedra. Alcance: 9/36m.' },

  // Armas Marciais Corpo-a-Corpo
  { id: 'halberd', name: 'Alabarda', weaponType: 'martial', attackType: 'melee', damage: '1d10', damageType: 'cortante', properties: ['heavy', 'reach', 'two-handed'], range: 3,
    description: 'Arma de haste com lâmina. Alcance: 3m. Pesada: Halflings e Gnomos têm desvantagem.' },
  { id: 'whip', name: 'Chicote', weaponType: 'martial', attackType: 'melee', damage: '1d4', damageType: 'cortante', properties: ['finesse', 'reach'], range: 3,
    description: 'Arma com alcance de 3m e Acuidade (FOR ou DES).' },
  { id: 'scimitar', name: 'Cimitarra', weaponType: 'martial', attackType: 'melee', damage: '1d6', damageType: 'cortante', properties: ['finesse', 'light'], range: 1.5,
    description: 'Lâmina curva. Acuidade + Leve: ideal para combate com duas armas usando DES. Druidas são proficientes.' },
  { id: 'shortsword', name: 'Espada Curta', weaponType: 'martial', attackType: 'melee', damage: '1d6', damageType: 'perfurante', properties: ['finesse', 'light'], range: 1.5,
    description: 'Lâmina curta. Acuidade + Leve. Monges e Ladinos são proficientes.' },
  { id: 'greatsword', name: 'Espada Grande', weaponType: 'martial', attackType: 'melee', damage: '2d6', damageType: 'cortante', properties: ['heavy', 'two-handed'], range: 1.5,
    description: 'Montante pesada. 2d6 = melhor média de dano. Pesada: desvantagem para criaturas Pequenas.' },
  { id: 'longsword', name: 'Espada Longa', weaponType: 'martial', attackType: 'melee', damage: '1d8', damageType: 'cortante', properties: ['versatile'], range: 1.5,
    description: 'Arma versátil clássica. 1d8 (1 mão) ou 1d10 (2 mãos).' },
  { id: 'glaive', name: 'Glaive', weaponType: 'martial', attackType: 'melee', damage: '1d10', damageType: 'cortante', properties: ['heavy', 'reach', 'two-handed'], range: 3,
    description: 'Arma de haste similar à Alabarda. Alcance: 3m.' },
  { id: 'lance', name: 'Lança de Montaria', weaponType: 'martial', attackType: 'melee', damage: '1d12', damageType: 'perfurante', properties: ['reach', 'special'], range: 3,
    description: 'Especial: desvantagem contra alvos a 1.5m. Requer 2 mãos se não estiver montado.' },
  { id: 'battleaxe', name: 'Machado de Batalha', weaponType: 'martial', attackType: 'melee', damage: '1d8', damageType: 'cortante', properties: ['versatile'], range: 1.5,
    description: 'Machado versátil. 1d8 (1 mão) ou 1d10 (2 mãos). Anões são proficientes.' },
  { id: 'greataxe', name: 'Machado Grande', weaponType: 'martial', attackType: 'melee', damage: '1d12', damageType: 'cortante', properties: ['heavy', 'two-handed'], range: 1.5,
    description: 'Machado pesado de duas mãos. 1d12 = maior dado único. Favorita de Bárbaros (Crítico Brutal).' },
  { id: 'maul', name: 'Malho', weaponType: 'martial', attackType: 'melee', damage: '2d6', damageType: 'pancada', properties: ['heavy', 'two-handed'], range: 1.5,
    description: 'Martelo gigante de duas mãos. 2d6 pancada.' },
  { id: 'flail', name: 'Mangual', weaponType: 'martial', attackType: 'melee', damage: '1d8', damageType: 'pancada', properties: [], range: 1.5,
    description: 'Bola com espinhos em corrente.' },
  { id: 'warhammer', name: 'Martelo de Guerra', weaponType: 'martial', attackType: 'melee', damage: '1d8', damageType: 'pancada', properties: ['versatile'], range: 1.5,
    description: 'Versátil. 1d8 (1 mão) ou 1d10 (2 mãos). Anões são proficientes.' },
  { id: 'morningstar', name: 'Maça Estrela', weaponType: 'martial', attackType: 'melee', damage: '1d8', damageType: 'perfurante', properties: [], range: 1.5,
    description: 'Maça com espinhos pontiagudos.' },
  { id: 'warpick', name: 'Picareta de Guerra', weaponType: 'martial', attackType: 'melee', damage: '1d8', damageType: 'perfurante', properties: [], range: 1.5,
    description: 'Picareta militar de combate.' },
  { id: 'rapier', name: 'Rapieira', weaponType: 'martial', attackType: 'melee', damage: '1d8', damageType: 'perfurante', properties: ['finesse'], range: 1.5,
    description: 'Lâmina fina e ágil. Acuidade: melhor arma d8 para personagens com DES alta. Favorita de Ladinos.' },
  { id: 'trident', name: 'Tridente', weaponType: 'martial', attackType: 'melee', damage: '1d6', damageType: 'perfurante', properties: ['thrown', 'versatile'], range: 6,
    description: 'Arma de três pontas. Versátil: 1d6/1d8. Arremesso: 6/18m.' },

  // Armas Marciais à Distância
  { id: 'longbow', name: 'Arco Longo', weaponType: 'martial', attackType: 'ranged', damage: '1d8', damageType: 'perfurante', properties: ['ammunition', 'heavy', 'two-handed'], range: 45,
    description: 'Arco de guerra. Alcance: 45/180m. Pesada: desvantagem para criaturas Pequenas.' },
  { id: 'handcrossbow', name: 'Besta de Mão', weaponType: 'martial', attackType: 'ranged', damage: '1d6', damageType: 'perfurante', properties: ['ammunition', 'light', 'loading'], range: 9,
    description: 'Besta compacta de uma mão. Alcance: 9/36m. Leve: pode ser usada com outra arma.' },
  { id: 'heavycrossbow', name: 'Besta Pesada', weaponType: 'martial', attackType: 'ranged', damage: '1d10', damageType: 'perfurante', properties: ['ammunition', 'heavy', 'loading', 'two-handed'], range: 30,
    description: 'Besta potente. Alcance: 30/120m. Recarga: 1 disparo por ação.' },
  { id: 'net', name: 'Rede', weaponType: 'martial', attackType: 'ranged', damage: '', damageType: '', properties: ['special', 'thrown'], range: 1.5,
    description: 'Especial: não causa dano. Impede criatura Grande ou menor (CD 10 FOR ou cortando CA 10).' },
  { id: 'blowgun', name: 'Zarabatana', weaponType: 'martial', attackType: 'ranged', damage: '1', damageType: 'perfurante', properties: ['ammunition', 'loading'], range: 7.5,
    description: 'Tubo que dispara agulhas. Alcance: 7.5/30m. Dano mínimo mas útil para venenos.' }
];


export interface CompendiumSpell {
  id: string;
  name: string;
  level: number;
  classes: string[];
  damage?: string;
  healing?: string;
  areaShape?: 'none' | 'circle' | 'cone' | 'line' | 'rectangle';
  range: number;
  description: string;
}

export const COMPENDIUM_SPELLS: CompendiumSpell[] = [
  // Truques
  { id: 'firebolt', name: 'Raio de Fogo', level: 0, classes: ['Mago', 'Feiticeiro'], damage: '1d10', range: 36, description: 'Um raio de luz ígneo dispara contra uma criatura ou objeto.' },
  { id: 'minorillusion', name: 'Ilusão Menor', level: 0, classes: ['Mago', 'Feiticeiro', 'Bruxo', 'Bardo'], range: 9, description: 'Cria um som ou uma imagem ilusória.', areaShape: 'circle' },
  { id: 'magehand', name: 'Mãos Mágicas', level: 0, classes: ['Mago', 'Feiticeiro', 'Bruxo', 'Bardo'], range: 9, description: 'Uma mão espectral flutuante aparece num ponto à sua escolha.' },
  { id: 'prestidigitation', name: 'Prestidigitação', level: 0, classes: ['Mago', 'Feiticeiro', 'Bruxo', 'Bardo'], range: 3, description: 'Um truque mágico menor, uma prática de feitiçaria.' },
  { id: 'rayoffrost', name: 'Raio de Gelo', level: 0, classes: ['Mago', 'Feiticeiro'], damage: '1d8', range: 18, description: 'Um raio frígido de luz azul claro atinge a criatura e reduz seu deslocamento.' },
  { id: 'shockinggrasp', name: 'Toque Chocante', level: 0, classes: ['Mago', 'Feiticeiro'], damage: '1d8', range: 1.5, description: 'Eletricidade surge da sua mão (vantagem se o alvo usar metal).' },
  { id: 'eldritchblast', name: 'Rajada Mística', level: 0, classes: ['Bruxo'], damage: '1d10', range: 36, description: 'Um feixe de energia crepitante viaja em direção a uma criatura.' },
  { id: 'sacredflame', name: 'Chama Sagrada', level: 0, classes: ['Clérigo'], damage: '1d8', range: 18, description: 'Luz divina desce sobre uma criatura (salvaguarda de Des).' },
  { id: 'guidance', name: 'Orientação', level: 0, classes: ['Clérigo', 'Druida'], range: 1.5, description: 'O alvo ganha +1d4 num teste de atributo.' },
  { id: 'resistance', name: 'Resistência', level: 0, classes: ['Clérigo', 'Druida'], range: 1.5, description: 'O alvo ganha +1d4 num teste de resistência.' },
  { id: 'thaumaturgy', name: 'Taumaturgia', level: 0, classes: ['Clérigo'], range: 9, description: 'Manifesta um milagre menor, um sinal de poder sobrenatural.' },
  { id: 'produceflame', name: 'Criar Chamas', level: 0, classes: ['Druida'], damage: '1d8', range: 9, description: 'Uma chama tremulante surge na sua mão, ilumina e pode ser arremessada.' },
  { id: 'thornwhip', name: 'Chicote de Espinhos', level: 0, classes: ['Druida'], damage: '1d6', range: 9, description: 'Um longo chicote de vinhas espinhosas ataca e puxa a criatura.' },
  { id: 'shillelagh', name: 'Bordão Mágico', level: 0, classes: ['Druida'], damage: '1d8', range: 1.5, description: 'Imbui um porrete ou bordão com a força da natureza.' },
  { id: 'viciousmockery', name: 'Zombaria Viciosa', level: 0, classes: ['Bardo'], damage: '1d4', range: 18, description: 'Desfere insultos mágicos. Causa dano e desvantagem no próximo ataque.' },

  // Nível 1
  { id: 'magicmissile', name: 'Mísseis Mágicos', level: 1, classes: ['Mago', 'Feiticeiro'], damage: '3d4+3', range: 36, description: 'Cria 3 dardos brilhantes de força mágica que acertam automaticamente.' },
  { id: 'magearmor', name: 'Armadura Mágica', level: 1, classes: ['Mago', 'Feiticeiro'], range: 1.5, description: 'CA base torna-se 13 + mod Des para alvo voluntário sem armadura.' },
  { id: 'shield', name: 'Escudo Arcano', level: 1, classes: ['Mago', 'Feiticeiro'], range: 0, description: 'Reação: Ganha +5 na CA até o começo do seu próximo turno.' },
  { id: 'sleep', name: 'Sono', level: 1, classes: ['Mago', 'Feiticeiro', 'Bardo'], range: 27, areaShape: 'circle', description: 'Coloca criaturas mágicamente para dormir (rola 5d8 de PV afetado).' },
  { id: 'thunderwave', name: 'Onda Trovejante', level: 1, classes: ['Mago', 'Feiticeiro', 'Bardo', 'Druida'], damage: '2d8', areaShape: 'circle', range: 4.5, description: 'Uma onda de força trovejante empurra e causa dano.' },
  { id: 'charmperson', name: 'Enfeitiçar Pessoa', level: 1, classes: ['Mago', 'Feiticeiro', 'Bardo', 'Bruxo', 'Druida'], range: 9, description: 'Tenta encantar um humanóide.' },
  { id: 'curewounds', name: 'Curar Ferimentos', level: 1, classes: ['Clérigo', 'Druida', 'Bardo', 'Paladino', 'Patrulheiro'], healing: '1d8', range: 1.5, description: 'Cura PV equivalente a 1d8 + modificador de conjuração.' },
  { id: 'healingword', name: 'Palavra Curativa', level: 1, classes: ['Clérigo', 'Druida', 'Bardo'], healing: '1d4', range: 18, description: 'Magia de ação bônus rápida para curar aliados a distância.' },
  { id: 'bane', name: 'Perdição', level: 1, classes: ['Clérigo', 'Bardo'], range: 9, description: 'Até 3 criaturas recebem -1d4 em ataques e resistências.' },
  { id: 'bless', name: 'Bênção', level: 1, classes: ['Clérigo', 'Paladino'], range: 9, description: 'Abençoa até 3 criaturas com +1d4 em ataques e resistências.' },
  { id: 'guidingbolt', name: 'Raio Guiador', level: 1, classes: ['Clérigo'], damage: '4d6', range: 36, description: 'Um lampejo de luz causa dano radiante e concede vantagem no próximo ataque contra o alvo.' },
  { id: 'goodberry', name: 'Bom Fruto', level: 1, classes: ['Druida', 'Patrulheiro'], healing: '1', range: 1.5, description: 'Cria 10 frutos. Cada um restaura 1 PV e alimenta por 1 dia.' },
  { id: 'faeriefire', name: 'Fogo das Fadas', level: 1, classes: ['Druida', 'Bardo'], range: 18, areaShape: 'circle', description: 'Objetos e criaturas numa área brilham. Ataques contra eles têm vantagem.' },
  { id: 'entangle', name: 'Enredar', level: 1, classes: ['Druida'], range: 27, areaShape: 'circle', description: 'Grama e ervas daninhas enredam criaturas na área.' },
  { id: 'wrathfulsmite', name: 'Destruição Colérica', level: 1, classes: ['Paladino'], damage: '1d6', range: 0, description: 'Seu próximo ataque brilha com ira divina e amedronta o alvo.' },
  { id: 'huntersmark', name: 'Marca do Caçador', level: 1, classes: ['Patrulheiro'], damage: '1d6', range: 27, description: 'Marca uma criatura para receber +1d6 de dano a cada acerto seu.' },
  { id: 'hex', name: 'Bruxa', level: 1, classes: ['Bruxo'], damage: '1d6', range: 27, description: 'Amaldiçoa criatura: causa +1d6 dano necrótico e desvantagem num atributo.' },
  { id: 'hellishrebuke', name: 'Repreensão Infernal', level: 1, classes: ['Bruxo'], damage: '2d10', range: 18, description: 'Reação ao receber dano: alvo é engolfado por chamas infernais.' },
  { id: 'witchbolt', name: 'Raio de Bruxa', level: 1, classes: ['Bruxo', 'Mago', 'Feiticeiro'], damage: '1d12', range: 9, description: 'Um feixe de energia relampejante azul se conecta ao alvo, causando dano contínuo.' }
];
