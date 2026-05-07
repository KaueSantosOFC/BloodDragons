export interface CompendiumWeapon {
  id: string;
  name: string;
  weaponType: 'simple' | 'martial';
  attackType: 'melee' | 'ranged';
  damage: string;
  damageType: string;
  properties: string[];
  range: number;
}

export const COMPENDIUM_WEAPONS: CompendiumWeapon[] = [
  // Armas Simples Corpo-a-Corpo
  { id: 'dagger', name: 'Adaga', weaponType: 'simple', attackType: 'melee', damage: '1d4', damageType: 'perfurante', properties: ['finesse', 'light', 'thrown'], range: 6 },
  { id: 'javelin', name: 'Azagaia', weaponType: 'simple', attackType: 'melee', damage: '1d6', damageType: 'perfurante', properties: ['thrown'], range: 9 },
  { id: 'club', name: 'Bastão', weaponType: 'simple', attackType: 'melee', damage: '1d4', damageType: 'pancada', properties: ['light'], range: 1.5 },
  { id: 'quarterstaff', name: 'Bordão', weaponType: 'simple', attackType: 'melee', damage: '1d6', damageType: 'pancada', properties: ['versatile'], range: 1.5 },
  { id: 'greatclub', name: 'Clava Grande', weaponType: 'simple', attackType: 'melee', damage: '1d8', damageType: 'pancada', properties: ['two-handed'], range: 1.5 },
  { id: 'sickle', name: 'Foice', weaponType: 'simple', attackType: 'melee', damage: '1d4', damageType: 'cortante', properties: ['light'], range: 1.5 },
  { id: 'spear', name: 'Lança', weaponType: 'simple', attackType: 'melee', damage: '1d6', damageType: 'perfurante', properties: ['thrown', 'versatile'], range: 6 },
  { id: 'mace', name: 'Maça', weaponType: 'simple', attackType: 'melee', damage: '1d6', damageType: 'pancada', properties: [], range: 1.5 },
  { id: 'handaxe', name: 'Machado de Mão', weaponType: 'simple', attackType: 'melee', damage: '1d6', damageType: 'cortante', properties: ['light', 'thrown'], range: 6 },
  { id: 'lighthammer', name: 'Martelo Leve', weaponType: 'simple', attackType: 'melee', damage: '1d4', damageType: 'pancada', properties: ['light', 'thrown'], range: 6 },
  
  // Armas Simples à Distância
  { id: 'shortbow', name: 'Arco Curto', weaponType: 'simple', attackType: 'ranged', damage: '1d6', damageType: 'perfurante', properties: ['ammunition', 'two-handed'], range: 24 },
  { id: 'lightcrossbow', name: 'Besta Leve', weaponType: 'simple', attackType: 'ranged', damage: '1d8', damageType: 'perfurante', properties: ['ammunition', 'loading', 'two-handed'], range: 24 },
  { id: 'dart', name: 'Dardo', weaponType: 'simple', attackType: 'ranged', damage: '1d4', damageType: 'perfurante', properties: ['finesse', 'thrown'], range: 6 },
  { id: 'sling', name: 'Funda', weaponType: 'simple', attackType: 'ranged', damage: '1d4', damageType: 'pancada', properties: ['ammunition'], range: 9 },

  // Armas Marciais Corpo-a-Corpo
  { id: 'halberd', name: 'Alabarda', weaponType: 'martial', attackType: 'melee', damage: '1d10', damageType: 'cortante', properties: ['heavy', 'reach', 'two-handed'], range: 3 },
  { id: 'whip', name: 'Chicote', weaponType: 'martial', attackType: 'melee', damage: '1d4', damageType: 'cortante', properties: ['finesse', 'reach'], range: 3 },
  { id: 'scimitar', name: 'Cimitarra', weaponType: 'martial', attackType: 'melee', damage: '1d6', damageType: 'cortante', properties: ['finesse', 'light'], range: 1.5 },
  { id: 'shortsword', name: 'Espada Curta', weaponType: 'martial', attackType: 'melee', damage: '1d6', damageType: 'perfurante', properties: ['finesse', 'light'], range: 1.5 },
  { id: 'greatsword', name: 'Espada Grande', weaponType: 'martial', attackType: 'melee', damage: '2d6', damageType: 'cortante', properties: ['heavy', 'two-handed'], range: 1.5 },
  { id: 'longsword', name: 'Espada Longa', weaponType: 'martial', attackType: 'melee', damage: '1d8', damageType: 'cortante', properties: ['versatile'], range: 1.5 },
  { id: 'glaive', name: 'Glaive', weaponType: 'martial', attackType: 'melee', damage: '1d10', damageType: 'cortante', properties: ['heavy', 'reach', 'two-handed'], range: 3 },
  { id: 'lance', name: 'Lança de Montaria', weaponType: 'martial', attackType: 'melee', damage: '1d12', damageType: 'perfurante', properties: ['reach', 'special'], range: 3 },
  { id: 'battleaxe', name: 'Machado de Batalha', weaponType: 'martial', attackType: 'melee', damage: '1d8', damageType: 'cortante', properties: ['versatile'], range: 1.5 },
  { id: 'greataxe', name: 'Machado Grande', weaponType: 'martial', attackType: 'melee', damage: '1d12', damageType: 'cortante', properties: ['heavy', 'two-handed'], range: 1.5 },
  { id: 'maul', name: 'Malho', weaponType: 'martial', attackType: 'melee', damage: '2d6', damageType: 'pancada', properties: ['heavy', 'two-handed'], range: 1.5 },
  { id: 'flail', name: 'Mangual', weaponType: 'martial', attackType: 'melee', damage: '1d8', damageType: 'pancada', properties: [], range: 1.5 },
  { id: 'warhammer', name: 'Martelo de Guerra', weaponType: 'martial', attackType: 'melee', damage: '1d8', damageType: 'pancada', properties: ['versatile'], range: 1.5 },
  { id: 'morningstar', name: 'Maça Estrela', weaponType: 'martial', attackType: 'melee', damage: '1d8', damageType: 'perfurante', properties: [], range: 1.5 },
  { id: 'warpick', name: 'Picareta de Guerra', weaponType: 'martial', attackType: 'melee', damage: '1d8', damageType: 'perfurante', properties: [], range: 1.5 },
  { id: 'rapier', name: 'Rapieira', weaponType: 'martial', attackType: 'melee', damage: '1d8', damageType: 'perfurante', properties: ['finesse'], range: 1.5 },
  { id: 'trident', name: 'Tridente', weaponType: 'martial', attackType: 'melee', damage: '1d6', damageType: 'perfurante', properties: ['thrown', 'versatile'], range: 6 },

  // Armas Marciais à Distância
  { id: 'longbow', name: 'Arco Longo', weaponType: 'martial', attackType: 'ranged', damage: '1d8', damageType: 'perfurante', properties: ['ammunition', 'heavy', 'two-handed'], range: 45 },
  { id: 'handcrossbow', name: 'Besta de Mão', weaponType: 'martial', attackType: 'ranged', damage: '1d6', damageType: 'perfurante', properties: ['ammunition', 'light', 'loading'], range: 9 },
  { id: 'heavycrossbow', name: 'Besta Pesada', weaponType: 'martial', attackType: 'ranged', damage: '1d10', damageType: 'perfurante', properties: ['ammunition', 'heavy', 'loading', 'two-handed'], range: 30 },
  { id: 'net', name: 'Rede', weaponType: 'martial', attackType: 'ranged', damage: '', damageType: '', properties: ['special', 'thrown'], range: 1.5 },
  { id: 'blowgun', name: 'Zarabatana', weaponType: 'martial', attackType: 'ranged', damage: '1', damageType: 'perfurante', properties: ['ammunition', 'loading'], range: 7.5 }
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
