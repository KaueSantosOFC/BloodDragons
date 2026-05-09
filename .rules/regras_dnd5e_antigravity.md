# Regras e Fórmulas Matemáticas de D&D 5e (PHB Oficial)

> Fonte: Livro do Jogador D&D 5e (Player's Handbook). Este documento contém as fórmulas
> exatas validadas contra o livro oficial, prontas para implementação no motor Antigravity.

---

## 1. Atributos e Proficiência

### Modificador de Atributo
* **Fórmula:** `floor((valor_atributo - 10) / 2)`
* **Exemplos:** ATR 8 → -1 | ATR 10 → 0 | ATR 14 → +2 | ATR 20 → +5
* Aplicado em: ataques, dano, testes, CD de magias, CA, iniciativa, HP.

### Bônus de Proficiência
* **Fórmula:** `floor((nível - 1) / 4) + 2`
* **Tabela oficial:**

| Nível | Bônus | Nível | Bônus |
|:---:|:---:|:---:|:---:|
| 1-4 | +2 | 13-16 | +5 |
| 5-8 | +3 | 17-20 | +6 |
| 9-12 | +4 | | |

* Quando se aplica: jogadas de ataque com armas/magias proficientes, testes de resistência proficientes, testes de perícias proficientes, CD de conjuração.

---

## 2. O Sistema D20

### Teste de Atributo / Perícia
* **Fórmula:** `1d20 + mod_atributo + (proficiência se treinado)`
* **Especialização (Ladino/Bardo):** Dobra o bônus de proficiência (não soma duas vezes).
* **Vantagem:** Rola 2d20, usa o **maior**. **Desvantagem:** Rola 2d20, usa o **menor**.
* Vantagem e Desvantagem **não se acumulam**: se tem ambos, cancelam-se.

### Teste de Resistência (Saving Throw)
* **Fórmula:** `1d20 + mod_atributo + (proficiência se treinado naquele save)`
* Cada classe concede proficiência em **exatamente 2** saves no nível 1:

| Classe | Save 1 | Save 2 |
|:---|:---|:---|
| Bárbaro | FOR | CON |
| Bardo | DES | CAR |
| Bruxo | SAB | CAR |
| Clérigo | SAB | CAR |
| Druida | INT | SAB |
| Feiticeiro | CON | CAR |
| Guerreiro | FOR | CON |
| Ladino | DES | INT |
| Mago | INT | SAB |
| Monge | FOR | DES |
| Paladino | SAB | CAR |
| Patrulheiro | FOR | DES |

### Jogada de Ataque (Attack Roll)
* **Com Arma:** `1d20 + mod_atributo + (proficiência se proficiente)`
  - Corpo-a-corpo: usa **FOR** (padrão)
  - À distância: usa **DES** (padrão)
  - Acuidade (Finesse): o jogador **escolhe** FOR ou DES
  - Armas de arremesso: usam FOR (mesmo à distância)
* **Com Magia:** `1d20 + mod_conjuração + proficiência`
* **Acerto Crítico:** Natural 20 → sempre acerta + dados de dano dobrados
* **Falha Crítica:** Natural 1 → sempre erra (independente do total)

### Classe de Dificuldade (CD)
* **Para resistir a magias:** `8 + proficiência + mod_conjuração`
* **Para testes gerais:** Definido pelo Mestre (Ex: CD 10 Fácil, CD 15 Médio, CD 20 Difícil)

---

## 3. Combate e Defesa

### Classe de Armadura (CA)

| Tipo | Fórmula | Notas |
|:---|:---|:---|
| Sem armadura | `10 + mod_DES` | Padrão para todos |
| Armadura Leve | `base_armadura + mod_DES` | DES sem limite |
| Armadura Média | `base_armadura + min(mod_DES, 2)` | DES limitado a +2 |
| Armadura Pesada | `base_armadura` | Sem bônus de DES |
| Escudo | `+2` | Soma ao total final |
| Bárbaro (sem armadura) | `10 + mod_DES + mod_CON` | Pode usar escudo |
| Monge (sem armadura) | `10 + mod_DES + mod_SAB` | **Não** pode usar escudo |

**Armaduras Específicas (PHB p.149):**

| Armadura | Tipo | CA Base | FOR Mín. | Furtividade |
|:---|:---|:---:|:---:|:---|
| Acolchoada | Leve | 11 | — | Desvantagem |
| Couro | Leve | 11 | — | — |
| Couro Batido | Leve | 12 | — | — |
| Gibão de Peles | Média | 12 | — | — |
| Cota de Malha | Média | 13 | — | — |
| Brunea | Média | 14 | — | Desvantagem |
| Meia-Armadura | Média | 15 | — | Desvantagem |
| Cota de Anéis | Pesada | 14 | — | Desvantagem |
| Cota de Talas | Pesada | 15 | FOR 13 | Desvantagem |
| Meia-Placa | Pesada | 16 | FOR 13 | Desvantagem |
| Placa Completa | Pesada | 18 | FOR 15 | Desvantagem |

**Regra de FOR mínima:** Se FOR < requisito, deslocamento reduzido em 3m. **Anões ignoram** essa penalidade.

**Armadura não-proficiente:** Desvantagem em TODOS os testes de FOR/DES, jogadas de ataque e **não pode conjurar magias**.

### Iniciativa
* **Fórmula:** `1d20 + mod_DES`
* É um teste de Destreza. Talentos e habilidades podem modificar.

---

## 4. Saúde e Dano

### Pontos de Vida (PV)

| Situação | Fórmula |
|:---|:---|
| Nível 1 | `dado_vida_máximo + mod_CON` |
| Nível 2+ | PV anterior + `rolar dado_vida OU valor_médio + mod_CON` |

**Valores médios dos dados de vida:** d6=4, d8=5, d10=6, d12=7

**Anão da Colina:** +1 PV adicional por nível (Tenacidade Anã).

**Nota crítica:** Se mod_CON mudar, PV máximo é recalculado retroativamente para todos os níveis.

### Rolagem de Dano
* **Com arma:** `dado(s)_arma + mod_atributo` (mesmo atributo usado no ataque)
* **Off-hand (arma secundária):** `dado(s)_arma` (SEM modificador, a não ser que seja negativo)
* **Acerto Crítico:** Dobra os **dados** de dano (não o modificador)
* **Resistência a dano:** Dano reduzido pela metade (arredondar para baixo)

### Ataque Desarmado (PHB p.195)
* **Dano:** `1 + mod_FOR` (dano de pancada/concussão)
* **Proficiência:** Todos são proficientes automaticamente
* **Exceção Monge:** Pode usar DES em vez de FOR. Dado escala: 1d4 (1-4) → 1d6 (5-10) → 1d8 (11-16) → 1d10 (17+)

### Testes de Resistência contra a Morte (PHB p.197)
* **Quando:** Começa turno com 0 PV
* **Teste:** `1d20` (sem modificadores, sem proficiência)
* **Sucesso:** ≥ 10 | **Fracasso:** < 10
* **3 Sucessos:** Estabiliza (inconsciente com 0 PV, mas não morre)
* **3 Fracassos:** Morre
* **Natural 1:** Conta como **2 fracassos**
* **Natural 20:** Recupera **1 PV** (acorda)
* **Dano a 0 PV:** Cada fonte = 1 fracasso automático. Crítico = 2 fracassos
* **Dano ≥ PV máximo a 0 PV:** Morte instantânea
* **Resetam:** Ao recuperar qualquer PV

---

## 5. Magia

### CD para Resistir à Magia
* **Fórmula:** `8 + proficiência + mod_conjuração`

### Modificador de Ataque Mágico
* **Fórmula:** `proficiência + mod_conjuração`

### Atributos de Conjuração (Spellcasting Ability)
* **Inteligência:** Mago, Cavaleiro Arcano (Guerreiro), Trapaceiro Arcano (Ladino)
* **Sabedoria:** Clérigo, Druida, Patrulheiro, Monge (Quatro Elementos)
* **Carisma:** Bardo, Bruxo, Feiticeiro, Paladino

### Concentração (PHB p.203)
* Apenas **uma** magia de concentração de cada vez
* **Quebra concentração:**
  1. Conjurar outra magia de concentração
  2. Sofrer dano → Teste de CON: CD = `max(10, dano_recebido / 2)` (cada fonte separada)
  3. Ficar incapacitado ou morrer
* Atividades normais (mover, atacar) **não** quebram concentração

### Escalamento de Truques (Cantrips)
* Dano escala pelo **nível total do personagem** (não da classe):
  - Nível 1-4: dado base (ex: 1d10)
  - Nível 5-10: 2 dados
  - Nível 11-16: 3 dados
  - Nível 17+: 4 dados

### Upcast (Conjurar em Nível Superior)
* Gastar slot de nível superior que o mínimo da magia
* Efeito varia por magia (dados extras, alvos extras, duração maior)
* Exemplo: Mísseis Mágicos Nível 1 = 3 mísseis, Nível 2 = 4 mísseis

---

## 6. Atributos Derivados e Exploração

### Percepção Passiva
* **Fórmula:** `10 + mod_SAB + (proficiência se treinado em Percepção)`
* +5 se tiver vantagem em Percepção, -5 se tiver desvantagem

### Capacidade de Carga
* **Fórmula:** `FOR × 7,5 kg` (ou FOR × 15 libras)
* **Empurrar/Arrastar/Erguer:** `FOR × 15 kg` (2× capacidade de carga)
* Criaturas Pequenas/Minúsculas: carga pode ser reduzida pelo Mestre

### Saltos
* **Salto em Distância (com corrida 3m):** `valor_FOR × 0,3m`
* **Salto em Distância (parado):** metade
* **Salto em Altura (com corrida 3m):** `0,9m + (mod_FOR × 0,3m)`
* **Salto em Altura (parado):** metade

---

## 7. Exaustão (PHB Apêndice A)

| Nível | Efeito | Acumulativo |
|:---:|:---|:---|
| 1 | Desvantagem em testes de habilidade | — |
| 2 | Deslocamento reduzido à metade | + nível 1 |
| 3 | Desvantagem em ataques e saves | + níveis 1-2 |
| 4 | PV máximo reduzido à metade | + níveis 1-3 |
| 5 | Deslocamento reduzido a 0 | + níveis 1-4 |
| 6 | **Morte** | — |

* Descanso longo remove **1 nível** (se comer/beber)
* Efeitos são **cumulativos** (nível 3 = desvantagem em testes + metade velocidade + desvantagem em ataques/saves)
