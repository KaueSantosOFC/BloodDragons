# Magias em Área (AoE) vs Jogadas de Ataque — D&D 5e (PHB Oficial)

> Fonte: Livro do Jogador D&D 5e, Capítulo 10: Conjuração, p.204-205.
> Este documento define como o motor Antigravity resolve mecanicamente magias de área
> versus jogadas de ataque individuais.

---

## 1. Magias de Área e Testes de Resistência (Saving Throws)

Magias que afetam uma **área** (Cone, Esfera, Linha, Cilindro, Cubo) **NÃO usam jogadas de ataque** (d20 contra CA). Em vez disso, forçam todos na área a fazer um **Teste de Resistência**.

### Mecânica de Resolução
1. **Conjurador define a área** no grid (ponto de origem + forma)
2. **CD do conjurador** é calculada: `8 + Proficiência + Mod. Conjuração`
3. **Cada alvo na área** faz um save no atributo exigido pela magia
4. **Dano é rolado uma única vez** pelo conjurador, aplicado a todos os alvos:
   - **Falha no save:** Dano total + efeitos adversos (condições)
   - **Sucesso no save:** Geralmente **metade** do dano, sem efeitos extras

### Áreas de Efeito (PHB p.204)

| Forma | Descrição | Ponto de Origem |
|:---|:---|:---|
| **Cone** | Se expande em ângulo a partir do conjurador | O próprio conjurador |
| **Esfera/Círculo** | Raio medido a partir de um ponto central | Um ponto no alcance |
| **Linha** | Largura × comprimento a partir do conjurador | O próprio conjurador |
| **Cubo** | Lado × lado × lado | Uma face do cubo |
| **Cilindro** | Raio × altura, aberto acima e abaixo | Um ponto no alcance |

### Exemplos no Compêndio

| Magia | Nível | Área | Save | Dano |
|:---|:---:|:---|:---:|:---|
| Onda Trovejante | 1 | Cubo 4,5m | CON | 2d8 trovão |
| Fogo das Fadas | 1 | Cubo 6m | DES | — (vantagem em ataques) |
| Bola de Fogo | 3 | Esfera 6m | DES | 8d6 fogo |
| Cone de Frio | 5 | Cone 18m | CON | 8d8 frio |
| Nuvem da Morte | 5 | Esfera 6m | CON | 5d8 veneno |

> **Implementação no Software:** Habilidades com `areaShape` (cone, line, circle, rectangle)
> saltam para resolução de dano. O sistema exibe a CD do conjurador e o Mestre indica
> individualmente: Dano Total, Metade (sucesso no save) ou Nenhum (Evasão).

---

## 2. Jogadas de Ataque contra Múltiplos Alvos

Algumas magias e ataques exigem **jogadas de ataque individuais** contra cada alvo (d20 contra CA), mesmo quando atingem vários.

### Mecânica de Resolução
1. **Atacante seleciona alvos** (dentro do alcance e limite da magia)
2. **Rola 1d20 por alvo** (separadamente)
3. **Bônus de ataque** é o mesmo para todos: `Proficiência + Mod. Atributo`
4. **Compara cada rolagem** com a CA individual de cada alvo
5. **Críticos e erros** são avaliados por alvo (é possível acertar crítico em um e errar outro)

### Exemplos

| Magia/Ataque | Nível | Nº de Ataques | Notas |
|:---|:---:|:---:|:---|
| Rajada Mística | 0 | 1/2/3/4 (por nível) | Raios independentes, pode mirar em alvos diferentes |
| Raio Ardente | 2 | 3 raios | Pode dividir entre alvos ou concentrar em um |
| Mísseis Mágicos | 1 | 3+ dardos | **Exceção:** Acerto automático (sem d20), mas alvos separados |
| Ataque Extra | — | 2+ ataques | Cada ataque é uma jogada d20 separada |

### Diferença-Chave: CA vs Save

| Aspecto | Jogada de Ataque | Teste de Resistência |
|:---|:---|:---|
| **Quem rola** | O atacante (d20) | O defensor (d20) |
| **Defesa usada** | CA do alvo | Bônus de save do alvo |
| **Crítico** | Natural 20 = dano dobrado | Não existe crítico |
| **Falha Crítica** | Natural 1 = sempre erra | Não existe falha crítica |
| **Dano em caso de falha** | Zero (errou) | Geralmente metade |

> **Implementação no Software:** Quando uma habilidade **sem** `areaShape` mira múltiplos
> alvos, o Modal de Ataque exibe a lista individual. O sistema calcula um d20 por alvo,
> destaca acertos, críticos e erros. Apenas alvos atingidos passam para resolução de dano.

---

## 3. Cobertura (PHB p.196)

Alvos atrás de obstáculos recebem bônus na CA **E** saves de DES:

| Cobertura | Bônus CA/Save DES | Exemplo |
|:---|:---:|:---|
| Meia-cobertura | +2 | Mureta, criatura aliada |
| Três-quartos | +5 | Grade, abertura estreita |
| Cobertura total | Intocável | Muro sólido, porta fechada |

> Cobertura se aplica a ataques de oportunidade também.

---

## 4. Evasão (Classe: Ladino 7° / Monge 7°)

* Quando faz save de DES para **metade** do dano:
  - **Sucesso no save:** Dano = **ZERO** (em vez de metade)
  - **Falha no save:** Dano = **metade** (em vez de total)
* Não funciona se o personagem estiver incapacitado
