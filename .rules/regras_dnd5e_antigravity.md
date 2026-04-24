# Regras e Fórmulas Matemáticas de D&D 5e
Este documento contém as descrições lógicas das fórmulas matemáticas encontradas no Livro do Jogador (D&D 5e). Elas foram abstraídas e explicadas de forma descritiva para facilitar a implementação como `.rules` no seu motor de regras (Antigravity ou similar).

---

## 1. Atributos e Proficiência

### Modificador de Atributo
* **O que faz:** Calcula o bônus ou penalidade base que será aplicado em quase todas as rolagens do jogo associadas a um Atributo (Força, Destreza, Constituição, Inteligência, Sabedoria ou Carisma).
* **Fórmula Descritiva:** Subtraia 10 do Valor Total do Atributo do personagem. Em seguida, divida o resultado por 2 e arredonde sempre para baixo (piso).
* **Dependências:** `valor_atributo`

### Bônus de Proficiência
* **O que faz:** Representa o nível de treinamento do personagem. Escala conforme o nível total do personagem (ou nível de desafio do monstro).
* **Fórmula Descritiva:** Começa em +2 no Nível 1. A cada 4 níveis completos, este bônus aumenta em +1. Matematicamente: divida o Nível do Personagem por 4, arredonde para cima e some 1.
* **Dependências:** `nivel_personagem`

---

## 2. O Sistema D20 (Testes e Jogadas)

### Teste de Atributo (Ability Check) e Perícias
* **O que faz:** Determina o sucesso ou falha ao tentar realizar uma ação.
* **Fórmula Descritiva:** Role 1 dado de 20 faces (1d20). Adicione o Modificador de Atributo correspondente à ação. Se o personagem for proficiente na perícia ou ferramenta utilizada, adicione também o Bônus de Proficiência.
* **Dependências:** `rolagem_1d20`, `modificador_atributo`, `bonus_proficiencia` (condicional), `bonus_situacional` (vantagem, desvantagem, magias).

### Teste de Resistência (Saving Throw)
* **O que faz:** Determina se um personagem consegue resistir a um efeito negativo (magia, veneno, armadilha).
* **Fórmula Descritiva:** Role 1 dado de 20 faces (1d20). Adicione o Modificador de Atributo exigido pelo teste. Se o personagem tiver proficiência em testes de resistência para aquele atributo (dado pela classe), adicione o Bônus de Proficiência.
* **Dependências:** `rolagem_1d20`, `modificador_atributo`, `bonus_proficiencia` (condicional).

### Jogada de Ataque (Attack Roll)
* **O que faz:** Determina se um ataque acerta o alvo. Deve igualar ou superar a Classe de Armadura (CA) do alvo.
* **Fórmula Descritiva (Armas):** Role 1d20. Adicione o Modificador de Atributo relevante (Força para ataques corpo a corpo, Destreza para ataques à distância; armas com propriedade "Acuidade" permitem escolher entre Força e Destreza). Se for proficiente com a arma, adicione o Bônus de Proficiência.
* **Dependências:** `rolagem_1d20`, `modificador_atributo_ataque`, `bonus_proficiencia` (condicional).

---

## 3. Combate e Defesa

### Classe de Armadura Base (Sem Armadura)
* **O que faz:** Define a dificuldade para um inimigo acertar um personagem que não veste armadura.
* **Fórmula Descritiva:** O valor inicial é 10. Adicione o Modificador de Destreza.
* **Dependências:** `modificador_destreza`

### Classe de Armadura (Com Armadura Leve, Média ou Pesada)
* **O que faz:** Calcula a defesa de um personagem equipado com armadura.
* **Fórmula Descritiva:** * **Armadura Leve:** Valor base da armadura + Modificador de Destreza completo.
  * **Armadura Média:** Valor base da armadura + Modificador de Destreza (mas limitado a um bônus máximo de +2).
  * **Armadura Pesada:** Apenas o Valor base da armadura (não recebe bônus de Destreza, nem penalidade, exceto restrições de movimento).
  * **Escudo:** Se o personagem estiver empunhando um escudo, adicione +2 ao resultado final.
* **Dependências:** `ca_base_armadura`, `modificador_destreza`, `tem_escudo` (+2).

### Classe de Armadura (Defesa Sem Armadura - Classes Específicas)
* **O que faz:** Fórmulas de CA exclusivas para Bárbaros e Monges.
* **Fórmula Descritiva (Bárbaro):** 10 + Modificador de Destreza + Modificador de Constituição. (Pode usar escudo).
* **Fórmula Descritiva (Monge):** 10 + Modificador de Destreza + Modificador de Sabedoria. (Não pode usar escudo).
* **Dependências:** `modificador_destreza`, `modificador_constituicao` (Bárbaro), `modificador_sabedoria` (Monge).

### Iniciativa
* **O que faz:** Determina a ordem de turno no combate.
* **Fórmula Descritiva:** É tratada como um Teste de Destreza. Role 1d20 e adicione o Modificador de Destreza.
* **Dependências:** `rolagem_1d20`, `modificador_destreza`.

---

## 4. Saúde e Dano

### Pontos de Vida Máximos (Nível 1)
* **O que faz:** Calcula a vida inicial do personagem.
* **Fórmula Descritiva:** Pegue o valor máximo possível do Dado de Vida da Classe (ex: 8 para d8, 10 para d10) e adicione o Modificador de Constituição.
* **Dependências:** `dado_vida_classe_maximo`, `modificador_constituicao`.

### Pontos de Vida Máximos (Níveis Seguintes)
* **O que faz:** Calcula o aumento de vida ao subir de nível.
* **Fórmula Descritiva:** Para cada nível após o 1º, role o Dado de Vida da Classe (ou pegue o valor médio arredondado para cima) e some o Modificador de Constituição atual. *Nota: se o modificador de Constituição mudar no futuro, a vida máxima é recalculada retroativamente para todos os níveis.*
* **Dependências:** `rolagem_dado_vida` (ou valor fixo da classe), `modificador_constituicao`.

### Rolagem de Dano (Armas Físicas)
* **O que faz:** Determina quanto dano o ataque causa.
* **Fórmula Descritiva:** Role o dado ou os dados de dano da arma utilizada. Adicione o mesmo Modificador de Atributo utilizado na Jogada de Ataque (Força ou Destreza). *Atenção: ataques com arma inábil (off-hand) não recebem o modificador no dano a menos que seja negativo.*
* **Dependências:** `rolagem_dado_arma`, `modificador_atributo_ataque`.

---

## 5. Magia

### Classe de Dificuldade (CD) para Resistir à Magia (Spell Save DC)
* **O que faz:** O número alvo que os inimigos devem alcançar num Teste de Resistência para evitar os efeitos completos de uma magia do personagem.
* **Fórmula Descritiva:** Comece com o valor fixo 8. Adicione o Bônus de Proficiência. Adicione o Modificador do Atributo de Conjuração (Inteligência para Magos, Carisma para Bardos/Feiticeiros, Sabedoria para Clérigos/Druidas).
* **Dependências:** `8`, `bonus_proficiencia`, `modificador_atributo_conjuracao`.

### Modificador de Ataque Mágico (Spell Attack Modifier)
* **O que faz:** O bônus somado à rolagem do d20 quando uma magia exige acertar o alvo diretamente.
* **Fórmula Descritiva:** Some o Bônus de Proficiência e o Modificador do Atributo de Conjuração do personagem.
* **Dependências:** `bonus_proficiencia`, `modificador_atributo_conjuracao`.

---

## 6. Atributos Derivados e Exploração

### Sabedoria Passiva (Percepção)
* **O que faz:** Define a percepção constante do personagem quando não está ativamente procurando algo. Usada pela mesa (Mestre) em segredo contra a Furtividade de inimigos.
* **Fórmula Descritiva:** Comece com o valor fixo 10. Adicione o Modificador de Sabedoria. Se o personagem tiver proficiência na perícia Percepção, adicione também o Bônus de Proficiência.
* **Dependências:** `10`, `modificador_sabedoria`, `bonus_proficiencia` (se aplicável).

### Capacidade de Carga (Em Quilos)
* **O que faz:** O máximo de peso que um personagem pode carregar sem penalidades severas. O livro original usa libras (x15), mas no livro em português o multiplicador é ajustado para quilogramas (kg).
* **Fórmula Descritiva:** Multiplique o Valor Total do Atributo Força por 7,5 kg (ou 15 libras, dependendo do sistema métrico escolhido na engine).
* **Dependências:** `valor_forca`, `fator_multiplicador` (7.5).

### Empurrar, Arrastar ou Erguer
* **O que faz:** O limite absoluto que o personagem pode levantar ou mover com esforço.
* **Fórmula Descritiva:** Multiplique a Capacidade de Carga calculada por 2. (Ou Força x 15 kg).
* **Dependências:** `capacidade_de_carga` * 2.

### Salto em Distância (Com corrida de 3m)
* **O que faz:** Distância que pode cobrir em um salto longo horizontal.
* **Fórmula Descritiva:** O personagem pode saltar uma distância igual ao Valor Total do Atributo Força medido em Pés (Divida por 3 aproximadamente para obter em metros, ou `Força * 0,3m`). Se saltar sem corrida, a distância cai pela metade.
* **Dependências:** `valor_forca`, `teve_corrida` (booleano para aplicar 100% ou 50%).

### Salto em Altura (Com corrida de 3m)
* **O que faz:** Distância vertical ao pular.
* **Fórmula Descritiva:** Comece com 3 pés (0,9 metros) e adicione o Modificador de Força em pés (0,3 metros por ponto). Sem corrida, a altura cai pela metade.
* **Dependências:** `3 (pés)`, `modificador_forca`, `teve_corrida` (booleano).
