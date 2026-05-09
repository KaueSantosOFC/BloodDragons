# Sistema de Magia Completo — D&D 5e (Livro do Jogador)

---

## Conceitos Fundamentais

### Espaços de Magia (Spell Slots)
- Recurso limitado gasto ao conjurar magias de nível 1+.
- Truques (nível 0): ilimitados, sem custo.
- Recuperação: descanso longo (exceto Bruxo: descanso curto).

### Preparação de Magias
- **Clérigo, Druida, Paladino:** Prepara magias da lista completa da classe a cada descanso longo. Quantidade = mod. atributo de conjuração + nível da classe (mínimo 1).
- **Mago:** Prepara do grimório. Quantidade = mod. Inteligência + nível de mago (mínimo 1).
- **Bardo, Feiticeiro, Patrulheiro, Bruxo:** Magias conhecidas (não preparadas). Troca 1 magia por nível ganho.

---

## Atributos de Conjuração

| Classe | Atributo | CD de Magia | Ataque Mágico |
|---|---|---|---|
| Mago | Inteligência | 8 + prof + mod. INT | prof + mod. INT |
| Feiticeiro | Carisma | 8 + prof + mod. CAR | prof + mod. CAR |
| Bruxo | Carisma | 8 + prof + mod. CAR | prof + mod. CAR |
| Bardo | Carisma | 8 + prof + mod. CAR | prof + mod. CAR |
| Clérigo | Sabedoria | 8 + prof + mod. SAB | prof + mod. SAB |
| Druida | Sabedoria | 8 + prof + mod. SAB | prof + mod. SAB |
| Paladino | Carisma | 8 + prof + mod. CAR | prof + mod. CAR |
| Patrulheiro | Sabedoria | 8 + prof + mod. SAB | prof + mod. SAB |

---

## Componentes de Magia

| Tipo | Descrição | Restrição |
|---|---|---|
| **V (Verbal)** | Palavras mísicas | Não pode conjurar se silenciado |
| **S (Somático)** | Gestos com as mãos | Precisa de pelo menos 1 mão livre |
| **M (Material)** | Componente físico | Pode usar foco arcano/divino ou bolsa de componentes no lugar (exceto materiais com custo em PO) |

---

## Concentração

- Algumas magias exigem concentração por sua duração.
- **Limite:** Apenas 1 magia de concentração ativa por vez.
- **Perda de concentração:**
  1. Conjurar outra magia de concentração.
  2. Sofrer dano → teste de resistência de Constituição. CD = 10 ou metade do dano sofrido (o que for maior). Falha = perde concentração.
  3. Ficar incapacitado ou morrer.

---

## Conjuração em Nível Superior (Upcast)

Quando conjura uma magia usando um slot de nível superior ao mínimo, a magia ganha efeitos extras. Exemplos:

| Magia | Nível Base | Efeito Extra por Nível Acima |
|---|---|---|
| Mísseis Mágicos | 1 | +1 míssil (dardo) por nível |
| Curar Ferimentos | 1 | +1d8 de cura por nível |
| Bola de Fogo | 3 | +1d6 de dano por nível |
| Palavra Curativa | 1 | +1d4 de cura por nível |
| Destruição Divina (Paladino) | 1 (slot) | +1d8 de dano radiante por nível acima do 1º |

---

## Escala de Truques (Cantrips)

Truques de dano escalam automaticamente com o NÍVEL TOTAL do personagem (não da classe):

| Nível do Personagem | Efeito |
|---|---|
| 1-4 | Dano base (ex: 1d10) |
| 5-10 | +1 dado de dano (ex: 2d10) |
| 11-16 | +2 dados (ex: 3d10) |
| 17+ | +3 dados (ex: 4d10) |

---

## Magias Rituais

- Magias com tag "Ritual" podem ser conjuradas sem gastar slot.
- Tempo de conjuração +10 minutos.
- Classes: Bardo, Clérigo, Druida, Mago (do grimório, mesmo sem preparar).

---

## Regras de Reação e Ação Bônus para Magias

- **Ação Bônus:** Se conjurar magia como ação bônus, a única outra magia permitida no mesmo turno é um truque com tempo de conjuração de 1 ação.
- **Reação:** Pode ser usada fora do turno (Ex: Escudo Arcano, Contramágica).

---

## Lista de Magias Essenciais para o Motor

### Truques (Nível 0)

| Magia | Classes | Dano/Efeito | Alcance | Tipo de Ataque | Nota |
|---|---|---|---|---|---|
| Raio de Fogo | Mago, Feiticeiro | 1d10 fogo | 36m | Ataque à distância | Escala com nível |
| Rajada Mística | Bruxo | 1d10 força | 36m | Ataque à distância | 1 feixe extra nos níveis 5, 11, 17 |
| Chama Sagrada | Clérigo | 1d8 radiante | 18m | Teste de res. DES | Escala com nível |
| Raio de Gelo | Mago, Feiticeiro | 1d8 frio | 18m | Ataque à distância | -3m deslocamento |
| Toque Chocante | Mago, Feiticeiro | 1d8 relâmpago | 1.5m (toque) | Ataque corpo a corpo | Vantagem vs armadura metal |
| Zombaria Viciosa | Bardo | 1d4 psíquico | 18m | Teste de res. SAB | Desvantagem no próximo ataque |
| Criar Chamas | Druida | 1d8 fogo | 9m (arremesso) | Ataque à distância | Iluminação |
| Orientação | Clérigo, Druida | +1d4 teste | 1.5m (toque) | - | Concentração, 1 min |
| Taumaturgia | Clérigo | Efeito narrativo | 9m | - | - |
| Ilusão Menor | Mago, Feiticeiro, Bardo | Ilusão | 9m | - | - |
| Prestidigitação | Mago, Feiticeiro | Efeito menor | 3m | - | - |
| Mãos Mágicas | Mago, Feiticeiro | Mão espectral | 9m | - | - |

### Nível 1

| Magia | Classes | Dano/Cura | Alcance | Tipo | Upcast |
|---|---|---|---|---|---|
| Mísseis Mágicos | Mago, Feiticeiro | 3x(1d4+1) força | 36m | Automático (sem ataque) | +1 míssil/nível |
| Curar Ferimentos | Clérigo, Druida, Bardo, Paladino, Patrulheiro | 1d8+mod cura | Toque | - | +1d8/nível |
| Palavra Curativa | Clérigo, Druida, Bardo | 1d4+mod cura | 18m | Ação bônus | +1d4/nível |
| Escudo Arcano | Mago, Feiticeiro | +5 CA | Pessoal | Reação | - |
| Bênção | Clérigo, Paladino | +1d4 ataques e saves | 9m | Concentração, 1 min | +1 alvo/nível |
| Perdição | Clérigo, Bardo | -1d4 ataques e saves | 9m | Concentração, 1 min | +1 alvo/nível |
| Raio Guiador | Clérigo | 4d6 radiante | 36m | Ataque à distância | +1d6/nível |
| Sono | Mago, Feiticeiro, Bardo | 5d8 PV afetados | 27m | Área 6m raio | +2d8/nível |
| Onda Trovejante | Mago, Feiticeiro, Bardo, Druida | 2d8 trovejante | 4.5m (cubo) | Teste res. CON | +1d8/nível |
| Enfeitiçar Pessoa | Mago, Feiticeiro, Bardo, Druida, Bruxo | Enfeitiçado | 9m | Teste res. SAB | +1 alvo/nível |
| Bruxa (Hex) | Bruxo | +1d6 necrótico | 27m | Concentração, 1h | - |
| Marca do Caçador | Patrulheiro | +1d6 dano | 27m | Concentração, 1h | - |
| Destruição Colérica | Paladino | +2d6 psíquico | Pessoal | No acerto | +1d6/nível |
| Armadura Mágica | Mago, Feiticeiro | CA = 13 + mod. DES | Toque | 8h, sem concentração | - |
| Enredar | Druida | Impedido | 27m (quadrado 6m) | Teste res. FOR | Terreno difícil |

### Nível 2

| Magia | Classes | Dano/Efeito | Alcance | Tipo | Upcast |
|---|---|---|---|---|---|
| Repreensão Infernal | Bruxo (Tiefling innata) | 3d10 fogo | 18m | Teste res. DES | +1d10/nível |
| Escuridão | Mago, Feiticeiro, Bruxo | Escuridão mágica 4.5m | 18m | Concentração, 10 min | - |
| Raio Ardente | Mago, Feiticeiro | 3x(2d6) fogo | 36m | 3 ataques à distância | +1 raio/nível |
| Imobilizar Pessoa | Mago, Feiticeiro, Bardo, Clérigo, Druida, Bruxo | Paralisado | 18m | Teste res. SAB, Concentração | +1 alvo/nível |

### Nível 3

| Magia | Classes | Dano/Efeito | Alcance | Tipo | Upcast |
|---|---|---|---|---|---|
| Bola de Fogo | Mago, Feiticeiro | 8d6 fogo | 45m (esfera 6m) | Teste res. DES | +1d6/nível |
| Relâmpago | Mago, Feiticeiro | 8d6 relâmpago | Linha 30m x 1.5m | Teste res. DES | +1d6/nível |
| Contramágica | Mago, Feiticeiro, Bruxo | Cancela magia ≤ nível do slot | 18m | Reação | Automático se slot ≥ nível da magia, senão teste Int CD 10+nível |
| Dissipar Magia | Mago, Feiticeiro, Bardo, Clérigo, Druida, Paladino, Bruxo | Remove efeito mágico ≤ nível do slot | 36m | - | Similar a Contramágica |
