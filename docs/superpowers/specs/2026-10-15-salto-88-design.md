# Salto 88 — Design

Data: 2026-10-15 · Branch: `salto-88` (a partir de `v3`) · Autor: Luis Didonato (com Claude)
Protótipo jogável validado: https://claude.ai/artifact/9Coz7zxBop4m3egyB7JKcU (versão 3)
Substitui a mecânica do hub da spec `2026-10-14-portfolio-v3-design.md` §3.2–3.6. O resto daquela spec (pit stop, i18n, contato, SEO, conteúdo, performance, falhas) continua valendo.

## 1. Por quê

O hub de 5 zonas ficou cru: mapa vazio, carro como cursor, sem interação divertida e com cara de cópia do portfolio do Bruno Simon. O Salto 88 dá uma ideia central que só faz sentido com o Luis e com um DeLorean: **atravessar a carreira no tempo**. Cada era é um mundo; uma rodovia leva à próxima; a 88 mph o carro salta.

Sucesso = quem entra tem um momento "uau" (o salto), cada era tem cara própria e gente/carros circulando, a carreira se entende sem ler, e o recrutador continua achando cargo e contato em segundos (pit stop).

## 2. Decisões fechadas

| Tema | Decisão |
|------|---------|
| Conceito | Máquina do tempo (espinha) + cada era é um mundo denso + rodovia outrun entre eras com salto a 88 mph |
| Eras | Exército → FIAP + RedBit → ValiantGroup → Colmeia → EVIG; depois da EVIG, loop ao começo |
| Física | Abordagem C: Rapier (veículo com suspensão) nas eras terrestres; carro cinemático na rodovia e no voo da EVIG |
| Câmera | Perseguição baixa atrás do carro, olhando à frente conforme a velocidade; zoom (scroll, pinça, botões); órbita cinematográfica quando o carro para; câmera de perseguição com FOV crescente na rodovia |
| Carro | DeLorean real (CC-BY-4.0, dark_igorek), com portas asa-de-gaivota e rodas como nós separados para animar |
| Trânsito | Carros em todas as eras: trânsito nas ruas, estacionados, comboio militar, carros voadores, tráfego na rodovia |
| Telões | Vídeos reais do Luis em loop curto por era; eras sem vídeo mostram painéis gerados |
| HUD | Circuitos do tempo (DESTINO vermelho / PRESENTE verde / ÚLTIMA PARTIDA âmbar), velocímetro em mph, capacitor de fluxo |
| Recrutador | Mantidos: modo demo automático, pit stop (`P`), botão "Ver versão em texto", CV no HUD, link por era |

## 3. As eras

Datas do painel = início de cada era. Fonte: CV de out/2026; Exército informado pelo Luis.

| Era | Data no painel | Cargo no cartão | Mundo | Marco (visto da rua) | Telões | Carros |
|-----|----------------|-----------------|-------|----------------------|--------|--------|
| Exército | FEV 2019 (2019 – jul/2021) | Cadete · EsPCEx / AMAN | Estrada de terra em laço por selva, caatinga e montanha; acampamentos | Torre da AMAN, pátio de formatura, bandeira, Esquadrilha da Fumaça | Vídeo AMAN / EsPCEx | Jipes e caminhões militares em comboio e estacionados |
| FIAP + RedBit | MAR 2023 | Estágio front-end · ADS na FIAP | Cidade em grade, avenida principal | Cânion de outdoors com os sites reais dos dois lados; campus FIAP | `fullstack` (sites); FIAP NEXT + formatura | Trânsito e estacionados |
| ValiantGroup | MAR 2025 | Full Stack · apps de streaming | Cidade em grade com praça aberta | Praça dos telões na altura do carro | `mobile` (streaming) | Trânsito e estacionados |
| Colmeia | NOV 2025 | Analista de integração sênior | Torres hexagonais | Pontes de integração por cima da pista com pacotes trafegando | Painéis gerados: log de API | Trânsito e estacionados |
| EVIG | JAN 2026 | CTO / Tech Lead | Ilhas flutuantes na nuvem; o carro voa (rodas viram) | Argolas para atravessar ("Agente conectado N/6") | Painéis gerados: custo −80%, WhatsApp com agentes | Carros voadores em faixas aéreas |

Cada era tem **paradas** com painel de conteúdo (o antigo ZonePanel): ao parar perto do marco, o painel mostra o conteúdo daquela fase da carreira (cargo, período, bullets do CV). A EVIG termina na parada **Contato** (formulário, email, links, CV). O botão de contato do HUD leva direto a ela de qualquer era (viagem rápida).

Comum a todas as eras terrestres: rampa com salto, cones/caixotes que voam, derrapagem com rastro neon da cor da era, colisão com prédios, árvores, cactos, montanhas e carros; postes iluminados; prédios que acendem quando o carro passa.

## 4. Rodovia e salto

- O portão no fim de cada era leva à rodovia de 3 faixas com sol listrado da cor da próxima era.
- Segurando acelerar, de ~30 a 88 mph em **6–8 s**. Tráfego nas 3 faixas para desviar; batida derruba a velocidade para ~60%.
- Expectativa crescente: FOV abre, riscos de velocidade nas laterais, tremor a partir de 72 mph, faíscas azuis em volta do carro, capacitor pulsando cada vez mais rápido.
- A 88 mph: rastro de fogo duplo, explosão de faíscas, o carro some, flash branco; durante o flash a próxima era já foi carregada e aparece com o carro entrando nela. ÚLTIMA PARTIDA recebe a data da era deixada.
- No modo demo a rodovia é dirigida sozinha, desviando do tráfego.

## 5. Arquitetura técnica

Mantém do F1: `GameMount` / pit stop / `inert` + botão de versão em texto, store zustand, fila de input, i18n, HUD com loop rAF por refs, minimapa (vira mapa da era), `useHashSync` (hash = era: `#exercito`, `#redbit`, `#valiant`, `#colmeia`, `#evig`).

Novo:

```
lib/salto/                       lógica pura, testada (sem three)
  eras.ts                        dados das 5 eras (datas, cores, rotas demo, paradas, portão)
  timeCircuits.ts                formatação DESTINO/PRESENTE/ÚLTIMA PARTIDA
  journey.ts                     máquina de estados: era(demo|manual|parado) → rodovia → salto → era seguinte
  autopilot.ts                   rota de waypoints com paradas (dwell) e chegada estacionando
  traffic.ts                     faixas, sentido, parar atrás do jogador, batida (pura, por tick)
  highway.ts                     velocidade, faixas, tráfego relativo, gatilho 88, timeline do salto
components/salto/
  SaltoCanvas.tsx                Canvas persistente; Physics (Rapier) só nas eras terrestres
  EraDirector.tsx                carrega a era atual com dynamic import; pré-carrega a próxima na rodovia
  eras/Exercito.tsx · RedBit.tsx · Valiant.tsx · Colmeia.tsx · Evig.tsx
  DeLorean.tsx                   GLB com portas/rodas animadas; fallback primitivo
  Vehicle.tsx · Traffic.tsx      carros low-poly instanciados
  Screen.tsx                     telão com VideoTexture (loop) ou CanvasTexture gerada; pôster no tier B
  Highway.tsx · JumpFx.tsx       rodovia, tráfego, riscos, fogo, faíscas, flash
  ChaseCamera.tsx                perseguição, órbita parada, zoom, anti-oclusão (raycast simples)
  TimeCircuits.tsx               HUD DOM
```

Regras herdadas: `useFrame` nunca chama setState; three só atrás de `next/dynamic`; nada de `window.innerWidth` no render; storage só via `lib/storage.ts`; nenhum fetch de terceiros em runtime.

Física: `@react-three/rapier`. O DeLorean nas eras terrestres é um corpo dinâmico com controlador de veículo por raycast (suspensão, aderência, derrapagem com freio de mão). Cones, caixotes e carros estacionados são corpos dinâmicos que dormem até serem atingidos. O trânsito em movimento é cinemático (segue faixas) e vira dinâmico por 2–3 s quando atingido. Na rodovia e na EVIG o Rapier fica desligado.

## 6. Assets

- **DeLorean:** o pipeline (`scripts/optimize-assets.mjs`) passa a manter portas e rodas como nós separados (sem `join` nesses nós), nomeados `door_l`, `door_r`, `wheel_fl/fr/rl/rr`. Se o modelo-fonte não tiver as portas separadas, as portas ficam fechadas e a animação é removida. Isso deve ser conferido no primeiro passo do plano. Orçamento ≤ 1,8 MB.
- **Carros e cenário:** low-poly próprio em código (geometrias compartilhadas + `InstancedMesh`), sem downloads.
- **Vídeos:** loops de 10–15 s em 640×360 (H.264 MP4 + WebM), ~400–800 KB cada, gerados por `scripts/encode-videos.mjs` (ffmpeg via `ffmpeg-static`, dev dependency) a partir dos originais da tag `v2-legacy`. Cada loop tem um pôster JPEG. Carregam só quando a era está ativa e o telão entra no quadro; pausam fora de vista. Tier B e `prefers-reduced-motion` usam só o pôster.
- **Vídeo da AMAN:** institucional do Exército. Trechos curtos com crédito ("vídeo: AMAN / Exército Brasileiro") até o Luis trocar por material próprio.

## 7. Conteúdo

- `content/{pt,en}/profile.ts` ganha a experiência **Exército Brasileiro — Cadete (EsPCEx / AMAN), 2019-02 a 2021-07**, com bullets a revisar pelo Luis (aprovado em concurso; formação em liderança, disciplina e trabalho sob pressão).
- RedBit passa a **Estágio em desenvolvimento front-end** (o CV em PDF continua como está).
- O pit stop mostra as duas mudanças. O JSON-LD continua com o cargo atual (EVIG).

## 8. Performance

- JS inicial sem three: continua < 180 KB gzip. Cada era é um chunk carregado sob demanda.
- Por era: ≤ 3 MB de assets (vídeos incluídos), carregados ao entrar na rodovia que leva a ela.
- 60 fps desktop médio, 30+ fps celular intermediário. Tier B: metade do trânsito, sem sombras, sem pós-processamento, telões com pôster, DPR 1.
- Draw calls: carros, postes, árvores e prédios instanciados; meta < 300 draw calls por era.

## 9. Celular

HUD mínimo: circuitos do tempo compactos (só DESTINO e PRESENTE), velocímetro pequeno. Controle por arrasto (joystick virtual) com botões de acelerar e frear na rodovia. Botão "Próxima" continua (pula para a próxima parada ou acelera a rodovia no automático).

## 10. Testes

- **Vitest:** `journey` (transições era → rodovia → salto → era seguinte e loop), `autopilot` (rota completa com paradas, sem atravessar colisores declarados), `traffic` (para atrás do jogador, batida, reaparece), `highway` (aceleração 30→88 em 6–8 s, batida derruba para ~60%, gatilho exato em 88), `timeCircuits` (datas e ÚLTIMA PARTIDA), `eras` (5 eras, datas do §3, hashes únicos).
- **Playwright:** o modo demo atravessa as 5 eras e volta ao começo; os circuitos do tempo mudam a cada salto; cada era mostra pelo menos um telão no quadro (`snapshot` expõe os telões visíveis); colisão com carro reduz a velocidade; pit stop, versão em texto e contato continuam funcionando; nenhuma requisição a outra origem; celular sem rolagem lateral.
- **Orçamento:** `check:bundle` continua; novo teste do peso por era.

## 11. Fases

| Fase | Escopo | Entrega |
|------|--------|---------|
| S1 | `lib/salto/*`, rodovia + salto + circuitos do tempo + câmera, DeLorean com portas e rodas, era Exército completa (física Rapier, comboio, telão AMAN) | Exército → rodovia → salto jogável |
| S2 | Eras FIAP+RedBit, ValiantGroup e Colmeia (cidades, trânsito, telões com vídeo, paradas com conteúdo) | 4 eras jogáveis |
| S3 | Era EVIG (voo, argolas, carros voadores, painéis gerados) + parada final Contato + loop | Ciclo completo |
| S4 | Pipeline de vídeos, tier B, celular, polimento de câmera (anti-oclusão), perf | Pronto para produção |

O sub-projeto de cases e mini-games (antigo F3) vem depois do S4, com spec própria.

## 12. Pendências com o Luis

- Texto da experiência do Exército (bullets) e confirmação do mês de entrada (o painel usa FEV 2019).
- Vídeo próprio do Exército, se existir, no lugar do institucional da AMAN.
- Merge da PR #1 (v3) antes ou depois do Salto 88: a branch `salto-88` parte da `v3`.
