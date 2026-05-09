# Raças Completas — D&D 5e (Livro do Jogador)

Este documento contém **todas** as informações mecânicas das 9 raças jogáveis extraídas do PHB.
Estruturado para servir de fonte de dados direta para o motor de regras do BloodDragons.

---

## Estrutura de Dados de Raça

Cada raça possui:
- `id` — identificador único
- `name` — nome exibido
- `abilityBonuses` — mapa de atributo → bônus (ex: `{ "con": 2 }`)
- `size` — Pequeno ou Médio
- `speed` — deslocamento em metros (ex: 7.5, 9.0)
- `darkvision` — alcance em metros (0 se não possuir)
- `languages` — lista de idiomas
- `traits` — lista de traços raciais com efeitos mecânicos
- `proficiencies` — armas, armaduras, ferramentas, perícias
- `innateSpells` — magias inatas desbloqueadas por nível
- `subRaces` — lista de sub-raças com bônus adicionais

---

## 1. Anão (Dwarf)

- **Bônus de Atributo:** Constituição +2
- **Tamanho:** Médio
- **Deslocamento:** 7.5m (não reduzido por armadura pesada)
- **Visão no Escuro:** 18m
- **Idiomas:** Comum, Anão
- **Proficiências de Armas:** Machado de batalha, machado de mão, martelo de arremesso, martelo de guerra
- **Proficiências de Ferramentas:** Uma à escolha entre: ferramentas de ferreiro, suprimentos de cervejeiro, ferramentas de pedreiro

### Traços Raciais
| Traço | Efeito Mecânico |
|---|---|
| Resiliência Anã | Vantagem em testes de resistência contra veneno. Resistência a dano de veneno. |
| Especialização em Rochas | Dobro do bônus de proficiência em testes de Inteligência (História) relacionados a trabalhos em pedra. |

### Sub-raças

#### Anão da Colina
- **Bônus Adicional:** Sabedoria +1
- **Traço:** *Tenacidade Anã* — +1 ponto de vida máximo por nível do personagem.

#### Anão da Montanha
- **Bônus Adicional:** Força +2
- **Proficiências Adicionais:** Armaduras leves, armaduras médias.

---

## 2. Elfo (Elf)

- **Bônus de Atributo:** Destreza +2
- **Tamanho:** Médio
- **Deslocamento:** 9m
- **Visão no Escuro:** 18m
- **Idiomas:** Comum, Élfico
- **Proficiências de Perícia:** Percepção

### Traços Raciais
| Traço | Efeito Mecânico |
|---|---|
| Sentidos Aguçados | Proficiência em Percepção (já listado acima). |
| Ancestralidade Feérica | Vantagem em testes de resistência contra ser enfeitiçado. Imunidade a sono mágico. |
| Transe | Descanso longo em 4 horas de meditação (sem dormir). |

### Sub-raças

#### Alto Elfo (High Elf)
- **Bônus Adicional:** Inteligência +1
- **Proficiências Adicionais:** Espada longa, espada curta, arco longo, arco curto.
- **Magia:** 1 truque (cantrip) à escolha da lista de Mago. Atributo de conjuração: Inteligência.
- **Idioma Extra:** 1 idioma adicional à escolha.

#### Elfo da Floresta (Wood Elf)
- **Bônus Adicional:** Sabedoria +1
- **Proficiências Adicionais:** Espada longa, espada curta, arco longo, arco curto.
- **Deslocamento:** 10.5m (substitui os 9m padrão).
- **Traço:** *Máscara da Natureza* — Pode tentar se esconder mesmo quando apenas levemente obscurecido por folhagem, chuva forte, neve caindo, névoa, etc.

#### Drow / Elfo Negro (Dark Elf)
- **Bônus Adicional:** Carisma +1
- **Visão no Escuro:** 36m (Superior)
- **Proficiências Adicionais:** Rapieira, espada curta, besta de mão.
- **Traço:** *Sensibilidade à Luz Solar* — Desvantagem em jogadas de ataque e testes de Sabedoria (Percepção) baseados em visão quando sob luz solar direta.
- **Magias Inatas (Carisma):**
  - Nível 1: *Globos de Luz* (truque)
  - Nível 3: *Fogo das Fadas* (1/dia)
  - Nível 5: *Escuridão* (1/dia)

---

## 3. Halfling

- **Bônus de Atributo:** Destreza +2
- **Tamanho:** Pequeno
- **Deslocamento:** 7.5m
- **Visão no Escuro:** 0m (não possui)
- **Idiomas:** Comum, Halfling

### Traços Raciais
| Traço | Efeito Mecânico |
|---|---|
| Sorte | Quando rolar um 1 natural no d20 de ataque, teste de habilidade ou teste de resistência, pode rolar novamente o dado e deve usar o novo resultado. |
| Bravura | Vantagem em testes de resistência contra ser amedrontado. |
| Agilidade Halfling | Pode mover-se através do espaço de qualquer criatura de tamanho maior que o seu. |
| **Exceção: Armas Pesadas** | Desvantagem ao usar armas com a propriedade "Pesada" (Greatsword, Greataxe, Maul, Halberd, Glaive, Heavy Crossbow, Longbow). |

### Sub-raças

#### Pés Leves (Lightfoot)
- **Bônus Adicional:** Carisma +1
- **Traço:** *Furtividade Natural* — Pode tentar se esconder mesmo quando obscurecido apenas por uma criatura de tamanho pelo menos Médio.

#### Robusto (Stout)
- **Bônus Adicional:** Constituição +1
- **Traço:** *Resiliência Robusta* — Vantagem em testes de resistência contra veneno. Resistência a dano de veneno.

---

## 4. Humano (Human)

- **Bônus de Atributo (Padrão):** +1 em TODOS os seis atributos
- **Tamanho:** Médio
- **Deslocamento:** 9m
- **Visão no Escuro:** 0m
- **Idiomas:** Comum + 1 idioma à escolha

### Variante (Opcional)
- **Bônus de Atributo:** +1 em dois atributos à escolha (diferentes)
- **Proficiências:** 1 perícia à escolha
- **Talento:** 1 talento (feat) à escolha no Nível 1

---

## 5. Draconato (Dragonborn)

- **Bônus de Atributo:** Força +2, Carisma +1
- **Tamanho:** Médio
- **Deslocamento:** 9m
- **Visão no Escuro:** 0m
- **Idiomas:** Comum, Dracônico

### Traços Raciais

#### Ancestralidade Dracônica
Escolha uma cor de dragão. Isso determina tipo de dano, forma da área e teste de resistência.

| Dragão | Tipo de Dano | Arma de Sopro (Forma) | Teste de Resistência |
|---|---|---|---|
| Negro | Ácido | Linha 1.5m x 9m | Destreza |
| Azul | Relâmpago | Linha 1.5m x 9m | Destreza |
| Bronze | Relâmpago | Linha 1.5m x 9m | Destreza |
| Cobre | Ácido | Linha 1.5m x 9m | Destreza |
| Latão | Fogo | Linha 1.5m x 9m | Destreza |
| Branco | Frio | Cone 4.5m | Constituição |
| Prata | Frio | Cone 4.5m | Constituição |
| Verde | Veneno | Cone 4.5m | Constituição |
| Ouro | Fogo | Cone 4.5m | Destreza |
| Vermelho | Fogo | Cone 4.5m | Destreza |

#### Arma de Sopro (Breath Weapon)
- **Ação para usar.** Recarrega após descanso curto ou longo.
- **Dano por nível:**
  - Nível 1-5: 2d6
  - Nível 6-10: 3d6
  - Nível 11-15: 4d6
  - Nível 16-20: 5d6
- **CD do Teste de Resistência:** 8 + modificador de Constituição + bônus de proficiência.
- Sucesso no teste: metade do dano.

#### Resistência a Dano
Resistência ao tipo de dano associado à ancestralidade dracônica escolhida.

---

## 6. Gnomo (Gnome)

- **Bônus de Atributo:** Inteligência +2
- **Tamanho:** Pequeno
- **Deslocamento:** 7.5m
- **Visão no Escuro:** 18m
- **Idiomas:** Comum, Gnômico

### Traços Raciais
| Traço | Efeito Mecânico |
|---|---|
| Esperteza Gnômica | Vantagem em todos os testes de resistência de Inteligência, Sabedoria e Carisma contra magia. |
| **Exceção: Armas Pesadas** | Igual ao Halfling — desvantagem com armas "Pesadas". |

### Sub-raças

#### Gnomo da Floresta (Forest Gnome)
- **Bônus Adicional:** Destreza +1
- **Magia:** Truque *Ilusão Menor* (Inteligência).
- **Traço:** *Falar com Animais Pequenos* — Pode se comunicar com animais de tamanho Pequeno ou menor.

#### Gnomo das Rochas (Rock Gnome)
- **Bônus Adicional:** Constituição +1
- **Traço:** *Conhecimento de Artífice* — Dobro do bônus de proficiência em testes de Inteligência (História) sobre itens mágicos, alquímicos ou tecnológicos.
- **Traço:** *Engenhoqueiro* — Pode gastar 1 hora e 10 po para construir um dispositivo mecânico Miúdo (CA 5, 1 PV). Tipos: isqueiro, caixa de música, brinquedo mecânico.

---

## 7. Meio-Elfo (Half-Elf)

- **Bônus de Atributo:** Carisma +2, outros dois atributos à escolha +1 cada
- **Tamanho:** Médio
- **Deslocamento:** 9m
- **Visão no Escuro:** 18m
- **Idiomas:** Comum, Élfico + 1 idioma à escolha

### Traços Raciais
| Traço | Efeito Mecânico |
|---|---|
| Ancestralidade Feérica | Vantagem em testes de resistência contra ser enfeitiçado. Imunidade a sono mágico. |
| Versatilidade em Perícias | Ganha proficiência em duas perícias à escolha. |

---

## 8. Meio-Orc (Half-Orc)

- **Bônus de Atributo:** Força +2, Constituição +1
- **Tamanho:** Médio
- **Deslocamento:** 9m
- **Visão no Escuro:** 18m
- **Idiomas:** Comum, Orc
- **Proficiências de Perícia:** Intimidação

### Traços Raciais
| Traço | Efeito Mecânico |
|---|---|
| Resistência Implacável | Quando reduzido a 0 PV mas não morto, cai a 1 PV em vez disso. 1 uso por descanso longo. |
| Ataques Selvagens | Em acerto crítico com arma corpo a corpo, rola 1 dado de dano da arma adicional e soma ao dano extra do crítico. |

---

## 9. Tiefling

- **Bônus de Atributo:** Carisma +2, Inteligência +1
- **Tamanho:** Médio
- **Deslocamento:** 9m
- **Visão no Escuro:** 18m
- **Idiomas:** Comum, Infernal

### Traços Raciais
| Traço | Efeito Mecânico |
|---|---|
| Resistência Infernal | Resistência a dano de fogo. |
| Legado Infernal (Magia Inata — Carisma) | Nível 1: Truque *Taumaturgia*. Nível 3: *Repreensão Infernal* (2º nível, 1/dia). Nível 5: *Escuridão* (1/dia). |

---

## Regras Especiais por Tamanho

| Regra | Afeta | Efeito |
|---|---|---|
| Armas Pesadas | Halflings, Gnomos (tamanho Pequeno) | Desvantagem em jogadas de ataque com armas que possuem a propriedade "Pesada" |
| Agilidade Halfling | Halflings | Pode mover-se através do espaço de criaturas maiores |
