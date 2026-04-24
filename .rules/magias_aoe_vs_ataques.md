# Magias em Área (AoE) vs Jogadas de Ataque Múltiplas

No sistema D&D 5e, habilidades e magias interagem com os alvos de maneiras diferentes dependendo de sua natureza. O motor do Antigravity (BloodDragons) diferencia mecanicamente essas duas abordagens.

## 1. Magias em Área e Testes de Resistência (Saving Throws)

Magias que afetam uma área (como Cone, Esfera, Linha, Cilindro) **não** utilizam jogadas de ataque (d20 contra Classe de Armadura). Em vez disso, elas forçam todos os alvos afetados na área a realizarem um **Teste de Resistência** (Saving Throw).

* **A Defesa do Inimigo:** O alvo rola um d20 e adiciona seu próprio modificador (e proficiência, se treinado) no atributo exigido pela magia (ex: Destreza para Bola de Fogo, Constituição para Onda Trovejante). A Classe de Armadura (CA) é irrelevante.
* **A Dificuldade (CD do Conjurador):** O número alvo que os inimigos devem superar é calculado baseando-se no conjurador da magia. A fórmula é: `8 + Bônus de Proficiência do Conjurador + Modificador de Atributo de Conjuração do Conjurador`.
* **O Dano:** O conjurador joga os dados de dano apenas uma vez. Esse resultado é aplicado a todos os alvos.
* **O Efeito do Sucesso:** Aqueles que falham no Teste de Resistência sofrem o dano total e possivelmente outros efeitos adversos (condições). Aqueles que passam no teste costumam sofrer **apenas metade** do dano e evitam os efeitos adversos extras.

> **Regra no Software:** Habilidades com a propriedade `saveAttribute` ou que possuem um `areaShape` preenchido (cone, line, circle) saltam diretamente para a resolução de Dano, informando ao Mestre a Classe de Dificuldade (CD) exigida para que ele instrua as rolagens dos inimigos. O dano base é calculado, e o Mestre seleciona individualmente na UI quem sofre Dano Normal, Resistência (Metade do Dano) ou Dano Nulo (no caso de Evasão).

---

## 2. Jogadas de Ataque contra Múltiplos Alvos

Algumas magias ou ataques físicos permitem mirar em mais de uma criatura (ou várias vezes na mesma), como a magia *Raio Ardente* (Scorching Ray) ou o ataque *Varredura*. Neste caso, são realizadas **Jogadas de Ataque**.

* **Comparação Individual de CA:** Se um conjurador ou atacante mirar em 3 alvos, ele deve rolar **um d20 separado para cada alvo**. O bônus somado a cada rolagem é sempre o mesmo (`Modificador + Proficiência`), mas o resultado final de cada rolagem é comparado **individualmente** com a Classe de Armadura (CA) daquele alvo específico.
* **Acertos Críticos Isolados:** Como são múltiplas rolagens, é perfeitamente possível que o Ataque contra o Alvo A seja um sucesso crítico (causando dano dobrado), enquanto o Ataque contra o Alvo B erre.
* **A CA não se soma:** Sob nenhuma circunstância a CA de um grupo de monstros é somada para criar um super CA.

> **Regra no Software:** Quando uma habilidade definida como Ataque (sem `saveAttribute`, possuindo `attackBonus` ou apenas usando armas normais) mira em mais de um inimigo no grid, o Modal de Ataque abre exibindo a lista individual de alvos. O sistema internamente calcula um d20 virtual para cada alvo simultaneamente, destacando quem foi atingido, quem recebeu Crítico e quem desviou. Apenas os alvos atingidos são passados para a etapa de resolução de Dano (Damage Modal).
