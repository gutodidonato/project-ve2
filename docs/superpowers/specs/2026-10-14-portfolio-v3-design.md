# Portfolio v3 "Rodovia 2026" — Design

Data: 2026-10-14 · Branch: `v3` · Autor: Luis Didonato (com Claude)
Planta visual e protótipos: https://claude.ai/artifact/5fEei1UrT5LbaA3ubYTCZF (protótipo B é a referência de mecânica)

## 1. Objetivo

Substituir o portfolio atual (Vite + R3F, cena cinematográfica por scroll, posicionamento "full stack / front") por um portfolio **jogável** que:

1. Prove habilidade de frontend/3D com uma experiência imersiva em three.js.
2. Comunique o perfil atual do currículo (out/2026): Engenheiro de Software, Backend, IA e Cloud; CTO / Tech Lead na EVIG.
3. Funcione para três públicos ao mesmo tempo: recrutadores (credibilidade em 10 s), founders/empresas (consultoria, cases, contato) e comunidade dev (vitrine técnica).

Sucesso = recrutador acha cargo, impacto e contato sem jogar; dev quer jogar; Google indexa todo o conteúdo.

## 2. Decisões fechadas

| Tema | Decisão |
|------|---------|
| Mecânica | Hub de mundo aberto dirigível (protótipo B) com fases dentro: zona Experiência abre fase Rodovia (runner), cada case tem mini-game de decisão |
| Câmera do hub | Fixa em 3/4, segue o carro (offset ~ (0, 24, 20)) |
| Carro | DeLorean atual (`public/models/delorean_dmc12__retro_wave_art.glb`), otimizado. Licença CC-BY-4.0, autor dark_igorek; crédito obrigatório com autor, link, licença e aviso de modificação |
| Estética | Retrowave evoluído: noite violeta, grid magenta, sol listrado, acentos ciano e âmbar |
| Idiomas | PT e EN, rotas `/pt` e `/en` |
| Stack | Next.js App Router + TypeScript, React Three Fiber + drei, zustand, next-intl, Tailwind v4 |
| Conteúdo | Fonte única `content/{pt,en}/profile.ts`; cases e blog em MDX (fases F3/F4) |
| Contato | Email (ofuscado), LinkedIn, GitHub, Cal.com, formulário (Resend). Telefone **não** aparece no site, só no PDF |
| Cases | Pode citar tudo que está no CV (Sírio-Libanês, Housi, Porto Seguro etc.), arquitetura em alto nível |
| Som | Synthwave + motor via Web Audio, mudo até o primeiro clique, toggle visível (F5) |
| Repo | Reescrita na branch `v3` deste repo. `main` atual recebe tag `v2-legacy` antes da troca |
| Hospedagem | Vercel (assumido). Domínio e contas Resend/Cal.com/analytics: pendentes com o Luis |

## 3. Experiência

### 3.1 Camadas

1. **HTML por baixo (pit stop).** A home é gerada no servidor como one-pager completo: hero, impacto, experiência, cases, competências, serviços, contato. É o que o Google e leitores de tela leem.
2. **Jogo por cima.** Um canvas persistente cobre a viewport depois do primeiro paint. O HTML do pit stop fica oculto visualmente enquanto o jogo está ativo, mas continua no DOM.
3. **Scroll vira controle.** No hub, scroll para baixo = piloto automático até a próxima parada.

### 3.2 Hub (home)

Mapa 160 × 160 unidades com borda neon. Cinco zonas (anel de luz, feixe vertical, rótulo):

| Zona | Posição aprox. | Ao entrar (F1) | Evolução |
|------|----------------|----------------|----------|
| Experiência | (-34, -26) | Painel com as 4 empresas | F2: botão/gatilho inicia fase Rodovia |
| Cases | (32, -32) | Painel com 5 cases; distrito de prédios wireframe | F3: cada prédio abre mini-game + case |
| Oficina | (-36, 26) | Painel com competências (5 grupos do CV) | F5: skills coletadas desbloqueiam pinturas |
| Serviços | (34, 26) | Painel com 3 ofertas + agendar | — |
| Contato | (0, 54) | Painel com formulário, email, links, CV | — |

Física arcade cinemática (sem engine): aceleração, arrasto exponencial, esterço proporcional à velocidade, limite nas bordas. Parâmetros de partida do protótipo: aceleração 28, arrasto `0.3^dt`, velocidade -10..22, esterço 2,3 rad/s.

### 3.3 Saídas para quem não quer jogar

- **Modo demo:** sem input, o carro faz o tour pelas zonas sozinho (3,5 s em cada). Qualquer input assume o controle. 20 s sem input volta ao demo.
- **Scroll guiado:** scroll para baixo leva até a próxima zona do tour.
- **Minimapa:** clique/toque numa zona = viagem rápida (piloto automático).
- **Âncora por zona:** entrar numa zona atualiza o hash (`#experiencia`, `#cases`, `#oficina`, `#servicos`, `#contato`) via `history.replaceState`. Abrir a URL com hash nasce dentro da zona.
- **Pit stop:** tecla `P` ou botão fixo alterna para o one-pager. Persistido em `localStorage` (com try/catch). Liga sozinho com `prefers-reduced-motion`, `navigator.connection.saveData` ou sem WebGL; nesses casos há botão "entrar no jogo".
- **CV:** botão de PDF sempre visível no HUD.

### 3.4 Controles

| Ação | Teclado | Mouse/trackpad | Toque | Gamepad (F5) |
|------|---------|----------------|-------|--------------|
| Dirigir | WASD / setas | arrastar | arrastar (joystick virtual) | analógico esquerdo |
| Próxima parada | Espaço | scroll para baixo | botão "próxima" | A |
| Mapa / viagem | M | clique no minimapa | toque no minimapa | Select |
| Pit stop | P | botão fixo | botão fixo | Start |

### 3.5 Fase Rodovia (F2)

Runner de 3 faixas (protótipo A): scroll/↑ acelera, ←/→ troca de faixa, deslizar no toque. 4 pórticos (RedBit, ValiantGroup, Colmeia, EVIG) abrem o card da empresa; 16 skills coletáveis; bugs reduzem velocidade. Fim da pista = volta ao hub na zona Experiência.

### 3.6 Mini-games de case (F3)

Um por case, todos curtos (< 2 min) e com botão "pular para o case":

| Case | Mini-game |
|------|-----------|
| Migração GCP → AWS | Escolher GCP / Lambda / contêiner por serviço até −80% de custo com p95 ≤ 300 ms (protótipo C). Custos ilustrativos, rotulados como tal |
| Arquitetura LLM-first | Rotear mensagens ao agente certo antes do timeout |
| WhatsApp Tech Provider | Ordenar o onboarding de uma WABA |
| Oceans-20 | Classificar fotos de resíduo contra o modelo |
| Vistoria Porto Seguro | Marcar avarias e comparar com caixas YOLO |

## 4. Arquitetura técnica

```
content/{pt,en}/profile.ts ──► páginas RSC (pit stop, SSG) ──► HTML indexável
                         └──► painéis do jogo (client)
input (teclado, wheel, toque, gamepad) ──► actions ──► store zustand ──► GameDirector (useFrame lê por ref)
                                                                   └──► HUD / painéis DOM
```

### 4.1 Estrutura de pastas (alvo)

```
app/
  [locale]/
    layout.tsx            # html lang, fontes, NextIntlClientProvider
    page.tsx              # PitStop (RSC) + <GameMount/> (client, dynamic ssr:false)
    cases/[slug]/page.tsx # F3
    blog/...              # F4
  api/contact/route.ts
  sitemap.ts, robots.ts
components/
  pitstop/                # seções do one-pager (RSC)
  game/                   # WorldCanvas, GameDirector, Hub, Car, Zone, Minimap, HUD, Panels
  ui/
content/
  pt/profile.ts, en/profile.ts
  types.ts
lib/
  game/                   # lógica pura testável: physics.ts, autopilot.ts, zones.ts, input.ts
  store.ts                # zustand
i18n/                     # next-intl routing + request config
messages/{pt,en}.json     # strings de UI (não conteúdo do CV)
public/
  models/delorean.glb     # otimizado
  cv/luis-didonato-pt.pdf
scripts/optimize-assets.mjs
tests/ (vitest) · e2e/ (playwright)
```

### 4.2 Regras

- Toda lógica de jogo que não depende de three (física, autopiloto, detecção de zona, mapeamento de input, pontuação de puzzle) mora em `lib/game/*` como funções puras e tem teste unitário.
- `useFrame` nunca chama `setState`. Lê o store com `useGameStore.getState()` ou refs; escreve no store só em eventos discretos (troca de zona, modo).
- O canvas é carregado com `next/dynamic` (`ssr: false`) depois do primeiro paint; o chunk de three não entra no JS inicial.
- O carro carrega com Suspense; fallback é o carro de primitivas (mesma silhueta do protótipo).
- Breakpoints e tier vêm de hooks que reagem a resize/matchMedia, nunca de `window.innerWidth` no render.

### 4.3 Níveis de qualidade

| Tier | Quando | O que muda |
|------|--------|-----------|
| A | Desktop com GPU razoável (`detect-gpu` tier ≥ 2) | Bloom, vinheta, DPR até 2 |
| B | Mobile, GPU fraca, ou PerformanceMonitor detecta queda | Sem pós-processamento pesado, DPR 1 |
| C | Reduced motion, saveData, sem WebGL, ou escolha do usuário | Sem canvas (pit stop) |

### 4.4 Assets

- `scripts/optimize-assets.mjs` com `@gltf-transform/cli`/`core`: dedup, weld, join de meshes, meshopt, texturas redimensionadas (≤ 1024) e convertidas para WebP. Saída `public/models/delorean.glb`. Meta ≤ 1,5 MB.
- `public/video/*`, `public/imgs/sites/*`, `pitstop*.glb` e `delorean_modified.glb` saem da v3 (ficam no histórico/tag `v2-legacy`).

### 4.5 Contato

`POST /api/contact`: valida (nome, email, mensagem; limites de tamanho), honeypot, rate limit em memória por IP (melhor esforço), envia com Resend (`RESEND_API_KEY`, `CONTACT_TO_EMAIL`). Sem chave configurada → 503 e a UI mostra o email para contato direto. Nunca loga o corpo da mensagem.

## 5. Conteúdo

`content/types.ts` define `Profile`: nome, título, resumo, localização, links (email, LinkedIn, GitHub, Cal.com opcional), métricas de impacto, experiências (empresa, cargo, período, bullets), projetos/cases (slug, título, resumo, stack), grupos de competências, serviços, formação, idiomas. `pt/profile.ts` é transcrição fiel do CV de out/2026; `en/profile.ts` é a tradução.

Métricas de destaque (todas do CV): −80% custo operacional (GCP → AWS), 2 s → 0,5 s de carregamento (RedBit), 85,4% mAP@50 (Oceans-20), aprovação WhatsApp Tech Provider.

Crédito do modelo no rodapé do pit stop e no HUD (link "créditos"): "DeLorean DMC12 || Retro wave art" por dark_igorek, CC-BY-4.0, modificado (otimização).

## 6. Performance (orçamento)

| Métrica | Meta |
|---------|------|
| LCP (texto do pit stop), 4G | < 2,0 s |
| Tempo até jogável | < 3,0 s |
| JS inicial sem three | < 180 KB gzip |
| 3D total tier A | ≤ 4 MB |
| FPS | 60 desktop médio, 30+ mobile intermediário |
| INP | < 200 ms |
| Lighthouse mobile | Performance ≥ 85; Acessibilidade e SEO ≥ 95 |

## 7. Falhas

- Sem WebGL / erro de contexto → pit stop com aviso discreto.
- GLB falhou → carro de primitivas continua.
- FPS baixo sustentado → tier A cai para B.
- Formulário → mensagens de erro específicas; sem Resend → email visível.
- JS desabilitado → pit stop completo funciona (é HTML do servidor).

## 8. Testes

- **Vitest:** `lib/game/*` (física, autopiloto, zonas, input), validação do contato, integridade de `profile.ts` (PT e EN com mesmas chaves/slugs).
- **Playwright:** HTML de `/pt` e `/en` contém nome, cargo e empresas (SEO, sem JS); redirect `/` → idioma; `P` alterna pit stop; teclado move o carro (posição no store muda); minimapa leva à zona; viewport mobile 375 × 812 sem overflow horizontal; `/api/contact` rejeita payload inválido.
- **Lighthouse:** script `npm run lighthouse` contra build de produção local com o orçamento acima (F1 em diante).

## 9. Fases

| Fase | Escopo | Entrega |
|------|--------|---------|
| F0 | Next.js na branch `v3`, i18n, `profile.ts` PT/EN, pit stop completo, CV PT em PDF, `/api/contact`, SEO (metadata, sitemap, JSON-LD Person), pipeline de assets, testes base | Site novo publicável sem jogo; já substitui o atual |
| F1 | WorldCanvas, input, store, carro (GLB + fallback), hub com 5 zonas, painéis, HUD, minimapa, modo demo, scroll guiado, âncoras, toque, pit stop toggle, tiers | Home jogável |
| F2 | Fase Rodovia | Experiência jogável |
| F3 | Cases MDX + intercepting routes + distrito + mini-games (migração primeiro) | Cases completos |
| F4 | Blog MDX, RSS, OG | Blog |
| F5 | Som, gamepad, conquistas, oficina customizável, `/lab` com site antigo, analytics, CV EN em PDF | Polimento |

Cada fase tem seu próprio plano de implementação. O primeiro plano cobre F0 e F1.

## 10. Pendências com o Luis

- Domínio e onde o site atual está hospedado.
- Contas: Resend (chave + email de destino), link do Cal.com, analytics (Plausible ou Vercel Analytics).
- Revisão da tradução EN do `profile.ts`.
- CV em inglês (PDF) — até existir, botão EN aponta para o PDF PT rotulado "CV (PT)".
