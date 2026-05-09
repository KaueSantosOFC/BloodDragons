# Condições Completas — D&D 5e (Apêndice A do Livro do Jogador)

Todas as 14 condições + Exaustão (6 níveis). Cada condição lista efeitos mecânicos exatos para implementação no motor de regras.

---

## Regras Gerais sobre Condições

1. Condições não se acumulam: ou a criatura tem ou não tem.
2. Cada efeito que impõe uma condição tem sua própria duração.
3. Condições se encerram ao serem remediadas ou quando a duração expira.

---

## 1. Agarrado (Grappled)

- Deslocamento da criatura = 0 (não recebe bônus de deslocamento)
- Encerra se: quem agarrou ficar incapacitado, ou um efeito remover a criatura do alcance

**Efeitos no Motor:**
```json
{ "speedMultiplier": 0, "endConditions": ["grappler_incapacitated", "forced_movement"] }
```

## 2. Amedrontado (Frightened)

- Desvantagem em testes de habilidade e jogadas de ataque enquanto a fonte do medo estiver visível
- Não pode se mover voluntariamente para mais perto da fonte do medo

**Efeitos no Motor:**
```json
{ "attackDisadvantage": true, "abilityCheckDisadvantage": true, "cannotApproachSource": true }
```

## 3. Atordoado (Stunned)

- Incapacitado (não pode agir ou reagir)
- Não pode se mover, fala hesitante
- Falha automática em testes de resistência de Força e Destreza
- Jogadas de ataque contra a criatura têm vantagem

**Efeitos no Motor:**
```json
{ "incapacitated": true, "speedMultiplier": 0, "autoFailSaves": ["str", "dex"], "attacksAgainstAdvantage": true }
```

## 4. Caído (Prone)

- Única opção de movimento: rastejar (custo dobrado), a menos que se levante
- Levantar custa metade do deslocamento
- Desvantagem nas próprias jogadas de ataque
- Ataques corpo a corpo contra a criatura (≤1.5m): vantagem
- Ataques à distância contra a criatura (>1.5m): desvantagem

**Efeitos no Motor:**
```json
{ "attackDisadvantage": true, "meleeAttacksAgainstAdvantage": true, "rangedAttacksAgainstDisadvantage": true, "movementCostDouble": true, "standUpCost": "half_speed" }
```

## 5. Cego (Blinded)

- Falha automática em testes que requerem visão
- Jogadas de ataque contra a criatura: vantagem
- Próprias jogadas de ataque: desvantagem

**Efeitos no Motor:**
```json
{ "attackDisadvantage": true, "attacksAgainstAdvantage": true, "autoFailVisionChecks": true }
```

## 6. Enfeitiçado (Charmed)

- Não pode atacar quem a enfeitiçou
- Não pode ter quem a enfeitiçou como alvo de habilidades/magias nocivas
- Quem enfeitiçou tem vantagem em testes sociais contra a criatura

**Efeitos no Motor:**
```json
{ "cannotAttackCharmer": true, "charmerSocialAdvantage": true }
```

## 7. Envenenado (Poisoned)

- Desvantagem em jogadas de ataque
- Desvantagem em testes de habilidade

**Efeitos no Motor:**
```json
{ "attackDisadvantage": true, "abilityCheckDisadvantage": true }
```

## 8. Impedido (Restrained)

- Deslocamento = 0 (não recebe bônus)
- Jogadas de ataque contra a criatura: vantagem
- Próprias jogadas de ataque: desvantagem
- Desvantagem em testes de resistência de Destreza

**Efeitos no Motor:**
```json
{ "speedMultiplier": 0, "attackDisadvantage": true, "attacksAgainstAdvantage": true, "dexSaveDisadvantage": true }
```

## 9. Incapacitado (Incapacitated)

- Não pode realizar ações ou reações

**Efeitos no Motor:**
```json
{ "cannotAct": true, "cannotReact": true }
```

## 10. Inconsciente (Unconscious)

- Incapacitado (não age, não reage)
- Não pode se mover ou falar
- Não tem ciência dos arredores
- Larga tudo que segura
- Fica caído automaticamente
- Falha automática em testes de resistência de Força e Destreza
- Ataques contra a criatura: vantagem
- Ataques corpo a corpo (≤1.5m) que acertam: CRÍTICO AUTOMÁTICO

**Efeitos no Motor:**
```json
{ "incapacitated": true, "speedMultiplier": 0, "prone": true, "autoFailSaves": ["str", "dex"], "attacksAgainstAdvantage": true, "meleeAutoHitCritical": true, "dropsHeldItems": true }
```

## 11. Invisível (Invisible)

- Impossível de ser vista sem magia/sentidos especiais
- Considerada em escuridão densa para se esconder
- Ataques contra a criatura: desvantagem
- Próprios ataques: vantagem

**Efeitos no Motor:**
```json
{ "attackAdvantage": true, "attacksAgainstDisadvantage": true, "canHideAnywhere": true }
```

## 12. Paralisado (Paralyzed)

- Incapacitado (não age, não reage)
- Não pode se mover ou falar
- Falha automática em testes de resistência de Força e Destreza
- Ataques contra a criatura: vantagem
- Ataques corpo a corpo (≤1.5m) que acertam: CRÍTICO AUTOMÁTICO

**Efeitos no Motor:**
```json
{ "incapacitated": true, "speedMultiplier": 0, "autoFailSaves": ["str", "dex"], "attacksAgainstAdvantage": true, "meleeAutoHitCritical": true }
```

## 13. Petrificado (Petrified)

- Incapacitado, não se move, não fala, sem ciência dos arredores
- Transformado em pedra (peso x10)
- Para de envelhecer
- Ataques contra: vantagem
- Falha automática: Força e Destreza
- Resistência a TODOS os tipos de dano
- Imune a veneno e doença (mas efeitos existentes são suspensos, não curados)

**Efeitos no Motor:**
```json
{ "incapacitated": true, "speedMultiplier": 0, "autoFailSaves": ["str", "dex"], "attacksAgainstAdvantage": true, "resistAll": true, "immunePoison": true, "immuneDisease": true }
```

## 14. Surdo (Deafened)

- Falha automática em testes que requerem audição

**Efeitos no Motor:**
```json
{ "autoFailHearingChecks": true }
```

---

## Exaustão (Exhaustion) — Condição Especial

A exaustão possui 6 níveis CUMULATIVOS:

| Nível | Efeito |
|---|---|
| 1 | Desvantagem em testes de habilidade |
| 2 | Deslocamento reduzido à metade |
| 3 | Desvantagem em jogadas de ataque e testes de resistência |
| 4 | Máximo de PV reduzido à metade |
| 5 | Deslocamento reduzido a 0 |
| 6 | **MORTE** |

### Regras
- Efeitos são cumulativos (nível 3 = efeitos 1 + 2 + 3)
- Descanso longo reduz 1 nível (se comer e beber)
- Efeitos de remoção de exaustão reduzem nível conforme especificado

**Efeitos no Motor (por nível):**
```json
{
  "1": { "abilityCheckDisadvantage": true },
  "2": { "speedMultiplier": 0.5 },
  "3": { "attackDisadvantage": true, "savingThrowDisadvantage": true },
  "4": { "maxHpMultiplier": 0.5 },
  "5": { "speedMultiplier": 0 },
  "6": { "death": true }
}
```

---

## Condições que concedem Vantagem em Ataques contra o alvo

Lista para resolução automática de combate no motor:

- Atordoado
- Cego
- Incapacitado (implícito via Atordoado/Inconsciente/Paralisado)
- Inconsciente
- Paralisado
- Petrificado
- Impedido
- Caído (somente ataques corpo a corpo ≤1.5m)

## Condições que concedem Desvantagem nos Ataques do afetado

- Amedrontado (se vê a fonte)
- Cego
- Envenenado
- Impedido
- Caído
- Exaustão nível 3+
