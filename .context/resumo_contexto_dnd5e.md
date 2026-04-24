# Contexto do Sistema - D&D 5ª Edição (Livro do Jogador)

Este documento serve como resumo e mapa de contexto do **Livro do Jogador (Player's Handbook) de Dungeons & Dragons 5ª Edição**. Ele foi estruturado para alimentar a base de conhecimento do seu software/motor de regras, dividindo as informações em suas categorias principais.

---

## 1. Visão Geral do Sistema
D&D 5e é um RPG de mesa baseado na rolagem de um dado de 20 faces (d20) somado a modificadores. A mecânica central se baseia em: **O Mestre descreve o ambiente -> O Jogador declara a intenção -> O Mestre pede uma rolagem (se houver chance de falha) -> O resultado determina o sucesso ou fracasso.**

Mecânicas globais importantes:
* **Vantagem e Desvantagem:** Em vez de somar bônus complexos, circunstâncias favoráveis dão Vantagem (rola-se 2d20, escolhe o maior) e desfavoráveis dão Desvantagem (rola-se 2d20, escolhe o menor).
* **Bônus de Proficiência:** Um bônus fixo que escala com o nível do personagem (+2 no nível 1 até +6 no nível 20), aplicado a tudo que o personagem é treinado (armas, perícias, testes de resistência).

---

## 2. Criação de Personagens (Parte 1 do Livro)

A base de qualquer personagem. O software precisará estruturar tabelas de banco de dados ou objetos para os seguintes elementos:

* **Raças:** Definem a biologia e cultura de origem. Conferem bônus de atributos, tamanho, deslocamento e traços raciais. 
    * *Principais:* Anão, Elfo, Halfling, Humano, Draconato, Gnomo, Meio-Elfo, Meio-Orc, Tiefling.
* **Classes:** A profissão de aventura do personagem. Define o Dado de Vida, proficiências com armas/armaduras, testes de resistência principais e habilidades de classe por nível.
    * *Principais:* Bárbaro, Bardo, Bruxo, Clérigo, Druida, Feiticeiro, Guerreiro, Ladino, Mago, Monge, Paladino, Patrulheiro.
* **Personalidade e Antecedentes (Backgrounds):** O que o personagem fazia antes de ser aventureiro. Concede proficiências extras em perícias e ferramentas, além de características de interpretação (Traços, Ideais, Vínculos e Fraquezas).
* **Equipamento:** Moedas (PO, PP, PC), armaduras (leves, médias, pesadas, escudos), armas (simples, marciais, propriedades como 'acuidade' e 'pesada') e itens adventícios.

---

## 3. Jogando o Jogo (Parte 2 do Livro)

Esta é a "engine de física" do D&D. Contém as regras de interação com o mundo.

### 3.1 Valores de Atributo e Perícias
As 6 pontuações base: **Força, Destreza, Constituição, Inteligência, Sabedoria e Carisma**.
Cada atributo governa Perícias específicas (ex: Furtividade é Destreza, Intimidação é Carisma).

### 3.2 Aventurando-se
* **Tempo:** Medido em rodadas (6 segundos) em combate, ou em minutos/horas/dias na exploração.
* **Movimento:** Deslocamento tático, tipos de deslocamento (voo, natação, escalada) e regras de terreno difícil.
* **Descanso:**
    * *Descanso Curto (1 hora):* Permite gastar Dados de Vida para curar e recupera certas habilidades de classe.
    * *Descanso Longo (8 horas):* Cura toda a vida, restaura metade dos Dados de Vida e recupera todas as magias e habilidades.

### 3.3 Combate
Estruturado em Rodadas e Turnos.
* **Ações no Turno:** Em seu turno, um personagem pode se **Mover** e realizar uma **Ação** (Atacar, Conjurar Magia, Correr, Desengajar, Esconder-se, Esquivar, etc.).
* **Ação Bônus e Reação:** Habilidades específicas podem usar Ações Bônus (rápidas) ou Reações (respostas a gatilhos externos, como 'Ataque de Oportunidade').
* **Dano e Cura:** Tipos de dano (cortante, perfurante, fogo, necrótico, etc.), regras de Resistência (metade do dano) e Vulnerabilidade (dobro do dano), e a mecânica de cair a 0 Pontos de Vida (Testes de Resistência contra a Morte).

---

## 4. Magia (Parte 3 do Livro)

O sistema de feitiços de D&D 5e é Vanciano modificado.

* **Truques (Cantrips):** Magias de nível 0 que podem ser conjuradas à vontade, sem custo. Escalam em poder com o nível do personagem.
* **Espaços de Magia (Spell Slots):** Representam a energia mágica diária ("mana"). Magias de nível 1 a 9 exigem o gasto de um espaço correspondente.
* **Preparação e Conhecimento:** Algumas classes preparam feitiços diariamente (Magos, Clérigos), outras conhecem um número fixo (Feiticeiros, Bardos).
* **Componentes:** Exigências para conjurar — Verbal (V), Somático (S, gestos) e Material (M, itens físicos).
* **Concentração:** Algumas magias exigem foco contínuo. Sofrer dano enquanto concentrado exige um Teste de Resistência de Constituição para não perder a magia.

---

### Dica de Arquitetura para o Software:
Para o Antigravity ou sua base de regras, recomendo estruturar os `JSONs` ou esquemas de banco de dados seguindo exatamente os capítulos do livro:
1. `Entidade_Personagem` (Herda de Classe, Raça, Antecedente)
2. `Engine_Resolucao` (Lida com o d20 + Modificador vs CD/CA)
3. `Motor_Combate` (Gerencia Turnos, Ações, Dano, HP)
4. `Gerenciador_Magias` (Lida com Slots, Concentração e Efeitos)
