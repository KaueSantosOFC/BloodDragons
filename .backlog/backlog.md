# Backlog e Atualizações Recentes - Engine de Combate D&D 5e

Este documento lista as melhorias recentes implementadas no sistema relacionadas à estabilização e refatoração da engine de combate e validação de regras de D&D 5e.

## Interface e Validação (UI/UX)
- **Hard-Clamping no D20 (Ataques Físicos e Salvaguardas)**: Implementado evento de controle direto no DOM (`(input)`) que obriga os campos de rolagem de dados e salvaguarda a obedecerem o limite restrito de 1 a 20 (ou 1 ao máximo de dados do ataque), impedindo digitação inválida em tempo real.
- **Validação Regex Rigorosa para Campos de Dano/Cura**: Os campos "Dano" e "Recuperação de PV" de habilidades na ficha de personagem agora usam Regex (`^\d*(d\d+)?$`) para forçar o uso exclusivo de notação pura de dados (ex: `1d8`, `2d6`, ou valores puros). 
- **Separação de Bônus Fixo**: Foi criado o campo "Bônus de Dano/Cura" na criação de Habilidades e Armas, eliminando a prática errônea de preencher `2d6+3` no campo de dano base. O bônus plano agora possui o próprio espaço na interface.
- **Transparência na CD**: Adicionada a exibição visual do cálculo de dificuldade (`8 + Prof + Mod`) ao lançar magias com Saving Throw.
- **Suporte Multialvo Manual**: Usuários podem inserir resultados de d20 individualmente para vários alvos durante um ataque em área, e alvos vazios adotam o valor do primeiro ataque.

## Regras da Engine de Combate
- **Distinção Clara Magias (Saves) vs. Armas (CA)**: Magias de área agora ignoram a CA dos inimigos e forçam rolagens de *Saving Throws* individuais por alvo. O sistema foi reconfigurado para esconder o d20 do atacante nessas situações e pedir o save dos atingidos.
- **Integração Plena de Modificadores Múltiplos**: O cálculo final da Engine no Damage Modal foi estendido para incluir a nova variável `damageBonus` diretamente no modificador processado, somando ao modificador da habilidade raiz de forma silenciosa e correta.
- **Restrição de Ataque em Área por Armas**: Corrigido o modal para que ataques com armas não sigam as regras de salvar contra CD de área, forçando a rolagem normal contra a CA mesmo que o Mestre utilize regras de Homebrew ou Ataques Giratórios que permitam bater em múltiplos alvos simultâneos.

## Correções Técnicas
- **Tipagem no TypeScript e Strict Null Checks**: Resolvidos erros no processo de compilação do Docker (`TS2367`, `TS2339`, `TS18047`) referentes à verificação de strings sobrepostas e variáveis não instanciadas (Ex: `areaShape !== 'none'`).
- **Gerenciamento Unificado de Arquivos**: Centralizados e atualizados os testes automatizados para acompanhar as novas restrições matemáticas e validações da interface.
