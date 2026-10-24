# Salto 88 · Partes 5, 6 e 7: Valiant, Colmeia e EVIG

Data: 16 out 2026 · Plantas e fichas: artifact `6xiZou61BmLXL5oL3BasTR` ("Plantas Valiant, Colmeia e EVIG") · Padrão: `2026-10-16-salto-88-padrao-de-preenchimento.md` · Base reaproveitada: X1–X3 (parte 3) e K1–K9 (parte 4).

Fonte única do conteúdo: `content/pt/profile.ts`. Os cartões citam as frases do perfil palavra por palavra. Telas de app são interfaces genéricas com o nome do cliente em texto, sem copiar logotipo nem tela real de produto.

## Parte 5 · ValiantGroup (MAR 2025)

**Itens do perfil:**
- Cargo: "ValiantGroup · Desenvolvedor Full Stack · mar 2025 – nov 2025".
- "Construí aplicações web e para Android TV em plataformas de streaming dos projetos Hospital Sírio-Libanês, Housi e Fiesta Americana."
- "Apoiei o e-Saúde (Band) e o chatbot de IA da empresa, com Conversational Agents, banco vetorial e planejamento no Vertex AI."

**Lugares** (posições em quarteirões; a avenida fica entre i = −1 e i = 0):

| Lugar | Quarteirão |
|---|---|
| V1 · Escritório ValiantGroup | (−1, 1) |
| V2 · Praça dos telões | (−1, −1) e (0, −1) |
| V3 · Hospital Sírio-Libanês | (−1, 0) |
| V4 · Housi | (0, 0) |
| V5 · Hotel Fiesta Americana | (0, −2) |
| V6 · e-Saúde (Band) | (−1, −2) |
| V7 · Chatbot de IA | (0, 1) |

Cada lugar é como na ficha. Requisitos que viram teste:
- **V1:** o cartão tem o texto exato do cargo e dos dois itens; as duas TVs de teste estão ligadas.
- **V2:** a praça tem de 30 a 40 pessoas. Fachadas-telão em volta dos dois quarteirões (pelo menos 16 telas). Entrar na praça sincroniza "AO VIVO" em todas as telas em menos de 0,3 s.
- **V3, V4, V5:** a vaga troca o conteúdo das TVs. No Housi, as TVs dos apartamentos acendem de baixo para cima em até 4 s. Cada cartão traz o item com o nome do cliente.
- **V6:** a câmera da equipe aponta para o carro (diferença de rumo abaixo de 0,3 rad) e "NO AR" acende ao passar devagar.
- **V7:** a conversa termina em até 8 s, com as linhas de busca acesas entre a parede de documentos e o totem.
- A cidade usa K1–K9 com a paleta noturna azul da Valiant.

## Parte 6 · Colmeia (NOV 2025)

**Itens do perfil:**
- Cargo: "Colmeia · Analista de Integração Sênior · nov 2025 – jan 2026".
- "Planejei integrações com empresas parceiras e apoiei a definição de fluxos e requisitos técnicos."
- "Implementei e validei integrações com APIs de parceiros e do Google, incluindo Google Calendar."
- "Planejei melhorias nos fluxos do Jira para organizar demandas e acompanhar entregas das equipes."

**Lugares:**

| Lugar | Quarteirão |
|---|---|
| CL1 · Sede (torre de 40 m, pouso no 10º andar) | (−1, 1) |
| CL2 · Torre Google Calendar (fachada de calendário, heliponto com o pacote) | (0, 1) |
| CL3 · Hub de parceiros (anel de 5 prédios com cabos de luz) | (−1, 0) |
| CL4 · Sala de fluxos (fluxograma em neon) | (0, 0) |
| CL5 · Galpão da Jira (doca, esteira, fachada Kanban) | (0, −2) |

Os discos de hoje do Calendar e da Jira saem.

Requisitos que viram teste:
- **CL1:** pousar abre o cartão com o texto exato.
- **CL2:** pegar o pacote acende um evento na fachada. O teste atual da altura continua.
- **CL3:** atravessar o anel completa "requisição → 200 OK" em até 3 s.
- **CL4:** o fluxograma completa todas as caixas.
- **CL5:** entregar o pacote leva um cartão de "A fazer" a "Feito" na fachada. O SLA atual continua.
- Tipos de quarteirão próprios: mercado suspenso, data center, estação do monotrilho com embarque e jardim vertical, somados à base K1–K9 no nível da rua.
- Gente nas pontes e plataformas.

## Parte 7 · EVIG (JAN 2026)

**Itens do perfil** (cargo "EVIG · CTO / Tech Lead · jan 2026 – hoje"):
- E1: "Reduzi custos operacionais em 80%, mesmo com novos projetos, ao migrar do GCP para AWS, combinar Lambda e serviços contínuos com escala independente e otimizar containers."
- E2: "Planejei a aprovação como WhatsApp Tech Provider e conduzi revisão de apps, permissões, onboarding e estruturação de WABAs."
- E3: "Projetei arquitetura LLM-first com agentes, roteamento, memória conversacional e serviços desacoplados."
- E4: "Planejei capacidade e testes de carga para atender SLAs e priorizei entregas da equipe."
- E5: "Planejei e implementei RBAC e AWS SSM (configurações e segredos); planejei JWKS."
- Formação: "FIAP · Pós-graduação em Arquitetura de Software · em andamento, conclusão prevista em 2026".

**Ilhas:**

| Ilha | Posição |
|---|---|
| Sede, quadro de prioridades (E4, "priorizei entregas") | (0, 0) |
| GCP → AWS com barra de custo até −80% (E1) | (−36, −28) e (36, −28) |
| WhatsApp, checklist de 4 etapas e carimbo (E2) | (−38, 26) |
| Agentes, mensagem por roteador, agente e memória (E3) | (38, 26) |
| Carga e SLA, onda de requisições com latência abaixo da linha (E4) | (0, 44) |
| Cofre: só a porta do papel "visitante" abre, "JWKS: planejado" (E5) | (0, −58) |
| Pós FIAP, estação de estudos | (−74, −2), ilha nova |

Requisitos que viram teste:
- cada pouso ou passagem dispara a cena e o cartão com o texto exato;
- a barra de custo chega a −80% com as 6 argolas;
- vida na órbita: pelo menos 12 astronautas trabalhando e naves de carga entre GCP e AWS.

## Metas comuns às três partes

| Meta | Alvo |
|---|---|
| Lugares encontrados e fotografados | 7 de 7 (Valiant) · 5 de 5 (Colmeia) · 7 de 7 (EVIG) |
| Superfície lisa na tela | < 35% nas duas cidades |
| Pessoas por quarteirão | ≥ 4 nas cidades |
| Pessoas na EVIG | ≥ 12 |
| Custo por quadro | ≤ 650 chamadas e ≤ 1,1 milhão de triângulos nas cidades · ≤ 400 chamadas na EVIG |
| Auditoria de sobreposição, HUD e som | limpos |
| Suíte inteira | passando |
