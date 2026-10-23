# Garagem: a entrada do site — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** a home `/pt` e `/en` abre numa bancada de garagem em R3F (micro de 1988, teclado, portão, DeLorean); a tela dá currículo, contato e troca de idioma, e J leva ao Salto 88, que passa a sair no deploy em `public/salto88/`.

**Architecture:** o pit stop em HTML continua igual; `GameMount` → `GameLayer` (único import de three, via `next/dynamic`) passa a montar a garagem no lugar do hub. Estado discreto (vista, conteúdo) numa máquina pura em `lib/garage/state.ts` guardada no zustand; valores por quadro (porta, câmera, retângulos projetados) num objeto de runtime mutado no `useFrame`. Texto da tela é DOM: `<Html transform>` do drei na vista da bancada, e um overlay fixo sobre o retângulo projetado do vidro na vista de tela.

**Tech Stack:** Next.js 16 App Router, React 19, @react-three/fiber 9, drei 10, three 0.186, zustand 5, next-intl 4, Tailwind v4, Vitest + Testing Library, Playwright (SwiftShader). Jogo: three r128 num HTML único (laboratório em `.superpowers/salto88-lab`).

**Spec:** `docs/superpowers/specs/2026-10-23-garagem-entrada-design.md`

## Global Constraints

- Texto só de `content/{pt,en}/profile.ts` e `messages/{pt,en}.json`. O currículo da tela mostra o perfil como está, igual ao PDF (Luis, 23 out: "Mostrar como no CV"; a curadoria de −80%/carga/JWKS vale só para o jogo).
- Nada de telefone no site nem no jogo.
- Crédito do carro: `MODEL_CREDIT` (`content/credits.ts`) exato, num diálogo de créditos visível na garagem.
- three/R3F só atrás de `next/dynamic` em `GameMount`; `npm run check:bundle` continua ≤ 180 KiB gzip e sem `WebGLRenderer` na primeira carga.
- `useFrame` nunca chama setState; valores por quadro vão para refs/runtime; DOM por quadro via `useRuntimeFrame`/`writeText` (`components/game/useRuntimeFrame.ts`).
- localStorage só via `lib/storage.ts`. Nenhum fetch de terceiros em runtime (site e, depois da Task 7, o jogo).
- Paleta da garagem: vidro `#17130C`, fósforo `#FFB000`, fósforo baixo `#C48E12`, bege `#D6CBB0`, concreto `#3A403F`, lâmpada `#FFCF8A`, faróis `#DDE8FF`. Tela: só IBM Plex Mono (`--font-mono`); fora da tela: Plex Sans (`--font-body`). Michroma não entra na garagem. Sem caixa alta em rótulos, sem "→" em botões.
- `PitstopToggle` fica onde está (inferior direito no desktop, superior direito no celular; `e2e/mode.spec.ts` fixa isso). Som, Créditos e PT | EN ficam no canto inferior esquerdo (desvio consciente do §4.3 do spec, que punha "Versão em texto" à esquerda).
- Âncoras: PT `#curriculo` e `#contato`; EN `#resume` e `#contact`; a leitura aceita as quatro em qualquer idioma.
- Endereço do jogo: `/salto88/index.html` (o nome do arquivo é obrigatório: o matcher de `proxy.ts` só ignora caminhos com ponto); no `/en`, `/salto88/index.html?lang=en`.
- Testes com prioridade baixa e metade dos núcleos, um de cada vez: prefixo `bash .superpowers/salto88-lab/e2e/low.sh`. Nunca abrir Godot nem app pesado.
- Processo enxuto (memória do Luis): cada task roda só os próprios testes uma vez; uma revisão por lote; suíte inteira e fotos completas só na Task 10. Só Claude, sem DeepSeek.
- Commits terminam com `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Laboratório: `core.autocrlf false`, LF. Merge na `main` é decisão do Luis; nunca push do v3-backup.

## Review Focus

1. **Digitar no formulário de contato dentro da tela:** C, J, K, E e Esc digitados num campo não podem trocar de vista nem partir (Esc num campo só tira o foco). Teste na Task 5.
2. **J duas vezes, ou E/C durante a partida:** a navegação acontece uma vez só, e só Esc age durante a partida. Teste na Task 1 (máquina) e na Task 6 (uma navegação).
3. **Voltar do jogo pelo botão do navegador (bfcache):** a página volta com o store em `launch` e a tela branca; ao `pageshow` persistido a garagem volta para `bench`, porta fechada. Teste na Task 6.
4. **Trocar o idioma com o currículo aberto:** `/pt#curriculo` + E termina em `/en#resume` com o currículo aberto em inglês. Teste na Task 5.
5. **Girar o celular ou redimensionar na vista de tela:** o overlay segue o vidro (retângulo recalculado a cada quadro) e o enquadramento troca entre `wide` e `portrait`. Teste na Task 5.

---

## File Structure

| Arquivo | Responsabilidade |
|---------|------------------|
| `lib/garage/state.ts` | Máquina pura: vistas, ações, teclas, âncoras, URL do jogo |
| `lib/garage/launch.ts` | Linha do tempo da partida (função pura do tempo) |
| `lib/garage/camera.ts` | Enquadramento, poses, distância de "cobrir/conter" o vidro |
| `lib/garage/scene.ts` | Medidas da cena (vidro, bancada, portão, carro) |
| `lib/garage/runtime.ts` | Objeto mutável por quadro (porta, câmera, retângulos, teclas apertadas) |
| `lib/garage/debug.ts` | `window.__garage` para e2e |
| `lib/garage/sound.ts` | Sons gerados no Web Audio + preferência de som |
| `lib/store.ts` | Ganha `garage`/`setGarage`; perde `zone`/`mode` (Task 8) |
| `components/garage/screen/*.tsx` | DOM da tela: menu, currículo, contato, partida |
| `components/garage/*.tsx` | Cena R3F: canvas, bancada, micro, teclado, portão, carro, câmera, overlay, controles |
| `components/game/GameLayer.tsx` | Passa a montar a garagem |
| `components/game/CreditsDialog.tsx` | Diálogo de créditos tirado do `Hud` |
| `messages/{pt,en}.json` | Namespace `Garage`; hub sai de `Game` |
| `e2e/garage.spec.ts` | E2E da garagem |
| `scripts/garage-shots.mjs` | Lista fixa de fotos |
| `scripts/shrink-game.mjs` | Encolhe modelos e música do jogo |
| Laboratório `proto/salto88v3.template.html`, `build-v3.mjs`, `proto/vendor/` | Link de volta, aviso de idioma, three e fontes locais |

---

### Task 1: Máquina de estados da garagem

**Files:**
- Create: `lib/garage/state.ts`
- Modify: `lib/store.ts` (adicionar campos; não remover nada ainda)
- Test: `tests/garage/state.test.ts`, `tests/store.test.ts`

**Interfaces:**
- Produces:
  ```ts
  export type GarageView = 'bench' | 'screen' | 'launch';
  export type ScreenContent = 'cv' | 'contact';
  export interface GarageState { view: GarageView; content: ScreenContent | null }
  export type GarageAction = 'cv' | 'contact' | 'play' | 'language' | 'back';
  export type GarageEffect = 'switch-locale' | 'start-launch' | 'cancel-launch' | null;
  export const INITIAL_GARAGE: GarageState; // { view: 'bench', content: null }
  export function reduceGarage(s: GarageState, a: GarageAction): { state: GarageState; effect: GarageEffect };
  export function keyToAction(key: string): GarageAction | null;
  export function parseScreenHash(hash: string): ScreenContent | null;
  export function screenHash(locale: Locale, content: ScreenContent | null): string;
  export function stateFromHash(hash: string): GarageState;
  export function gameUrl(locale: Locale): string;
  export function otherLocale(locale: Locale): Locale;
  ```
  Store: `garage: GarageState`, `garageLast: GarageAction | null` (a última ação, para o cursor `> currículo`), `setGarage(s: GarageState, last?: GarageAction | null): void` (sem `last`, mantém o anterior).

- [ ] **Step 1: Write the failing tests** em `tests/garage/state.test.ts`:
  - `reduceGarage`: bench+cv → `{view:'screen',content:'cv'}`, effect null; bench+contact → screen/contact; bench+play → `{view:'launch',content:null}`, `'start-launch'`; bench+language → bench, `'switch-locale'`; bench+back → bench, null; screen(cv)+contact → screen/contact; screen+back → bench/null; screen+play → launch, `'start-launch'`; screen(cv)+language → screen/cv, `'switch-locale'`; launch+back → bench, `'cancel-launch'`; launch+play, launch+cv, launch+language → estado igual, effect null.
  - `keyToAction`: `'c'`,`'C'` → cv; `'k'` → contact; `'j'` → play; `'e'` → language; `'Escape'` → back; `'p'`, `'x'`, `'Enter'` → null.
  - `parseScreenHash`: `'#curriculo'`,`'#resume'` → cv; `'#contato'`,`'#contact'` → contact; `''`, `'#cases'` → null.
  - `screenHash`: (pt,cv) `'#curriculo'`; (pt,contact) `'#contato'`; (en,cv) `'#resume'`; (en,contact) `'#contact'`; (pt,null) `''`.
  - `stateFromHash('#contact')` → screen/contact; `stateFromHash('')` → `INITIAL_GARAGE`.
  - `gameUrl('pt')` `'/salto88/index.html'`; `gameUrl('en')` `'/salto88/index.html?lang=en'`; `otherLocale('pt')` `'en'`.
  - Em `tests/store.test.ts`: `garage` começa igual a `INITIAL_GARAGE` e `garageLast` `null`; `setGarage(s, 'cv')` troca os dois; `setGarage(s2)` troca só `garage`.
- [ ] **Step 2: Run** `bash .superpowers/salto88-lab/e2e/low.sh npx vitest run tests/garage/state.test.ts tests/store.test.ts` — Expected: FAIL (módulo não existe).
- [ ] **Step 3: Implement** `lib/garage/state.ts` com as assinaturas acima (puro, sem DOM) e os dois campos no `useGameStore`.
- [ ] **Step 4: Run** o mesmo comando — Expected: PASS.
- [ ] **Step 5: Commit** `feat(garage): state machine, keys, anchors and game URL`.

---

### Task 2: Partida, câmera e medidas da cena

**Files:**
- Create: `lib/garage/launch.ts`, `lib/garage/camera.ts`, `lib/garage/scene.ts`
- Test: `tests/garage/launch.test.ts`, `tests/garage/camera.test.ts`

**Interfaces:**
- Produces:
  ```ts
  // launch.ts
  export const LAUNCH_MS = 3500;
  export interface LaunchFrame { lamp: number; door: number; headlights: number; camera: number; whiteout: number; done: boolean }
  export function launchFrame(ms: number): LaunchFrame;
  // scene.ts (metros; valores de partida, ajustados no ciclo de fotos da Task 9)
  export const GLASS: { center: [number, number, number]; width: number; height: number }; // [-0.6, 1.25, 0.02], 0.40, 0.30
  export const BENCH_TOP_Y: number; // 0.9
  export const DOOR: { x0: number; x1: number; z: number; height: number }; // 1.6, 4.6, -0.5, 2.4
  export const CAR_SPOT: { x: number; z: number; heading: number }; // 3.1, -3.2, Math.PI (nariz para +z, para o portão)
  // camera.ts
  export type Framing = 'wide' | 'portrait';
  export interface Pose { position: [number, number, number]; target: [number, number, number]; fov: number }
  export function framingFor(width: number, height: number): Framing; // portrait quando width / height < 0.8
  export const BENCH_POSE: Record<Framing, Pose>; // wide: pos [-1.1,1.55,2.3] alvo [0.6,1.1,-0.6] fov 42; portrait: pos [-0.6,1.2,1.02] alvo [-0.6,1.08,0] fov 50 (Ruling da Task 4)
  export const CAR_POSE: Pose; // pos [2.2,1.2,0.6] alvo [3.1,0.7,-3.2] fov 46
  export function glassDistance(fov: number, aspect: number, fit: 'contain' | 'cover'): number;
  export function screenPose(framing: Framing, aspect: number): Pose; // de frente para GLASS, wide = contain × 1.04, portrait = cover
  ```
- `launchFrame` (ms em [0, 3500], fora disso grampeado): `lamp` 1, exceto 0.15 em [400,550) e [650,800); `door` = smoothstep de 800 a 2400; `headlights` = 0.35 + 0.65·smoothstep(1600, 3000); `camera` = smoothstep(2200, 3200); `whiteout` = smoothstep(3000, 3500); `done` = ms ≥ 3500. smoothstep(a,b,x) = t²(3−2t), t = clamp((x−a)/(b−a)).
- `glassDistance`: com h = tan(fov/2) em radianos, `dH = GLASS.height/2 / h`, `dW = GLASS.width/2 / (h·aspect)`; contain = max(dH, dW), cover = min(dH, dW).

- [ ] **Step 1: Write the failing tests:**
  - `launchFrame(0)` → lamp 1, door 0, headlights 0.35, camera 0, whiteout 0, done false; `launchFrame(450).lamp` 0.15; `launchFrame(600).lamp` 1; `launchFrame(1600).door` 0.5 (±1e-9); `launchFrame(2400).door` 1; `launchFrame(3500)` → whiteout 1, done true; `launchFrame(-10)` igual a `launchFrame(0)`.
  - `framingFor(1440,900)` wide; `framingFor(390,844)` portrait; `framingFor(667,375)` wide.
  - `glassDistance(50, 16/9, 'contain')` ≥ `glassDistance(50, 16/9, 'cover')`; com aspect 4/3 os dois são iguais (o vidro é 4:3).
  - `screenPose('wide', 16/9).target` igual a `GLASS.center`; a posição fica em z maior que o vidro e com x, y do centro.
- [ ] **Step 2: Run** `bash .superpowers/salto88-lab/e2e/low.sh npx vitest run tests/garage` — Expected: FAIL.
- [ ] **Step 3: Implement** os três módulos (puros).
- [ ] **Step 4: Run** o mesmo — Expected: PASS.
- [ ] **Step 5: Commit** `feat(garage): launch timeline, camera framing and scene measures`.

---

### Task 3: A tela em DOM (menu, currículo, contato, partida)

**Files:**
- Create: `components/garage/screen/Screen.tsx`, `ScreenMenu.tsx`, `ScreenCv.tsx`, `ScreenContact.tsx`, `ScreenLaunch.tsx`
- Modify: `messages/pt.json`, `messages/en.json` (namespace `Garage`), `app/globals.css` (classe `.crt`)
- Test: `tests/garage/screen.test.tsx`

**Interfaces:**
- Consumes: `GarageState`, `GarageAction`, `ScreenContent` (Task 1); `cvLink` (`content/links.ts`); `EmailLink`, `ContactForm` (`components/pitstop`).
- Produces:
  ```ts
  export function Screen(props: { profile: Profile; locale: Locale; state: GarageState; last: GarageAction | null; onAction(a: GarageAction): void }): JSX.Element;
  ```
  `Screen` escolhe: `view==='launch'` → `ScreenLaunch`; `view==='screen'` → `ScreenCv` ou `ScreenContact`; senão `ScreenMenu`.
- Mensagens `Garage` (pt / en): `menuCv` Currículo / Resume; `menuPlay` Jogar Salto 88 / Play Salto 88; `menuContact` Contato / Contact; `menuLanguage` English / Português; `back` Voltar (Esc) / Back (Esc); `pdf` Baixar PDF / Download PDF; `pdfPtOnly` Baixar PDF / PDF (in Portuguese); `destination` Destino: fev 2019 / Destination: Feb 2019; `gameLanguage` Jogo em português / Game in Portuguese for now; `summary` Resumo / Summary; `experience` Experiência / Experience; `cases` Cases / Cases; `skills` Competências / Skills; `education` Formação / Education; `languages` Idiomas / Languages; `current` atual / present; `consulting` Consultoria / Consulting; `email` E-mail / Email; `book` Agendar conversa / Book a call; `sound` Som / Sound; `credits` Créditos / Credits; `language` PT | EN / PT | EN.
- `.crt` (em `app/globals.css`): fundo `#17130C`, cor `#FFB000`, `font-family: var(--font-mono)`, foco visível `outline: 2px solid #FFB000`, e redefine para dentro dela `--color-panel: #17130C; --color-ink: #FFB000; --color-muted: #C48E12; --color-sun: #FFB000; --color-line: #4a3a12; --color-bad: #ff6a4a;` para o `ContactForm` e o `EmailLink` reaproveitados herdarem o tema. Texto do currículo e do contato com `max-width: 72ch`. Nome em altura dupla: `display:inline-block; transform: scaleY(2); transform-origin: top; margin-bottom: 1em`.
- Menu: nome, `profile.headline`, quatro `<button>` na ordem C, J, K, E, cada um com a tecla visível (`<kbd>C</kbd> Currículo`), e a linha do cursor (`aria-hidden`): `> ` + o rótulo da última ação em minúsculas (`> currículo`; `back` e `null` mostram só `> `) + `_` piscando.
- Movimento, tudo dentro de `@media (prefers-reduced-motion: no-preference)`: a tela liga com uma linha que se abre do centro em 0,6 s (classe `crt-boot`, só no primeiro mount) e o menu aparece inteiro de uma vez; o cursor pisca (1 s); o vidro tem um tremor de brilho de no máximo 3%. Nada mais se mexe na bancada.
- Barra de rolagem da `.crt`: fina, trilho `#17130C`, polegar `#C48E12`.
- Currículo: `summary`, `experience` (cargo, empresa, período com `PitStop.months.MM` e `Garage.current`, bullets), `cases` (título, resumo, stack), `skills`, `education`, `languages`, nessa ordem; botão do PDF via `cvLink`, com `pdfPtOnly` quando `cvLink(...).locale !== locale`; botão Voltar.
- Contato: `EmailLink`, LinkedIn, GitHub, Cal.com só se `links.calcom`, a linha "Consultoria: " + `services.map(s => s.title).join(', ')`, o `ContactForm` (`locale`, `fallbackEmail={links.email}`), botão Voltar.
- Partida: `destination`; no `en` também `gameLanguage`.

- [ ] **Step 1: Write the failing tests** (Testing Library com `NextIntlClientProvider` e `messages/{pt,en}.json`, como em `tests/game/game-mount.test.tsx`):
  - `screen menu lists the four keys in order`: pt → botões com textos contendo "Currículo", "Jogar Salto 88", "Contato", "English", nessa ordem; en → "Resume", "Play Salto 88", "Contact", "Português".
  - `the prompt shows the last action`: `last='cv'` → texto `> currículo`; `last=null` → a linha começa com `> ` sem rótulo.
  - `clicking a menu button sends its action`: clique em Contato chama `onAction('contact')`.
  - `cv shows the profile sections in order`: os títulos aparecem na ordem Resumo, Experiência, Cases, Competências, Formação, Idiomas; o primeiro `experience[0].role` do perfil pt aparece; o texto `−80%` do perfil aparece (o CV é mostrado como está).
  - `cv pdf in en is labelled in Portuguese while there is no en pdf`: en → link com texto "PDF (in Portuguese)" e `href` `/cv/luis-didonato-pt.pdf`.
  - `contact has no phone and lists consulting`: nenhum texto casa `/\+?\d[\d\s()-]{8,}/`; aparece "Consultoria:"; não há link Cal.com (é `null`).
  - `launch shows the destination, and the language notice only in en`: pt "Destino: fev 2019" e sem "Game in Portuguese"; en "Destination: Feb 2019" e "Game in Portuguese for now".
  - `tests/messages.test.ts` continua passando (as mesmas chaves nos dois idiomas).
- [ ] **Step 2: Run** `bash .superpowers/salto88-lab/e2e/low.sh npx vitest run tests/garage/screen.test.tsx tests/messages.test.ts` — Expected: FAIL.
- [ ] **Step 3: Implement** os cinco componentes, as mensagens e a classe `.crt`.
- [ ] **Step 4: Run** o mesmo — Expected: PASS.
- [ ] **Step 5: Commit** `feat(garage): screen content (menu, resume, contact, launch) and Garage messages`.

---

### Task 4: A cena parada (bancada, micro, portão, carro, câmera)

**Files:**
- Create: `components/garage/GarageCanvas.tsx`, `Scene.tsx`, `Bench.tsx`, `Computer.tsx`, `GarageDoor.tsx`, `DeLorean.tsx`, `Lights.tsx`, `GarageCamera.tsx`; `lib/garage/runtime.ts`, `lib/garage/debug.ts`
- Modify: `components/game/GameLayer.tsx` (monta `GarageCanvas` no lugar de `WorldCanvas`, `Hud`, `ZonePanel`, `Minimap`, `InputController`, `useHashSync`)
- Test: `e2e/garage.spec.ts`

**Interfaces:**
- Consumes: Tasks 1–3; `tierFrom` (`lib/game/tier.ts`); `CAR_GLB`, `CAR_LENGTH`, `CAR_MODEL_YAW` (`lib/game/assets.ts`).
- Produces:
  ```ts
  // lib/garage/runtime.ts
  export interface Rect { x: number; y: number; width: number; height: number }
  export const garageRuntime: {
    launchStart: number | null;      // performance.now() do J, null fora da partida
    door: number;                    // 0..1
    camera: [number, number, number];
    arrived: boolean;                // a câmera chegou à pose da vista atual
    glassRect: Rect;                 // vidro projetado em px CSS
    keyRects: { code: string; rect: Rect }[];
    pressed: Map<string, number>;    // code → instante do aperto
  };
  // lib/garage/debug.ts
  export interface GarageSnapshot { view: GarageView; content: ScreenContent | null; door: number; camera: [number, number, number]; arrived: boolean; drawCalls: number; glassRect: Rect; keyRects: { code: string; rect: Rect }[] }
  declare global { interface Window { __garage?: { snapshot(): GarageSnapshot } } }
  export function registerGarageDebug(read: () => GarageSnapshot): () => void;
  // components/garage
  export function GarageCanvas(props: { profile: Profile; locale: Locale; act(a: GarageAction): void }): JSX.Element | null;
  export function normalizeCar(source: Object3D): Group; // movido de components/game/Car.tsx para DeLorean.tsx, mesmo corpo; Car.tsx e tests/assets passam a importar daqui
  ```
- `act` desce de `GameLayer` → `GarageCanvas` → `Scene` → (`Computer`/`Screen`, e depois `Keyboard` e `ScreenOverlay`). Nesta task o `GameLayer` passa `(a) => { const { garage, setGarage } = useGameStore.getState(); setGarage(reduceGarage(garage, a).state, a); }`; a Task 5 troca por `useGarageControls`.
- A partir desta task `e2e/world.spec.ts`, `e2e/hud.spec.ts` e `e2e/input.spec.ts` deixam de valer (o hub não monta mais); eles saem na Task 9 e não rodam até lá.
- `GarageCanvas`: leva `detectTier`, `declineTier`, `BENCHMARKS_URL`, `TIER_TIMEOUT_MS` de `WorldCanvas.tsx` sem mudar; `<Canvas aria-hidden flat shadows={tier==='A'} dpr={tier==='A'?[1,2]:1} gl={{ antialias: tier==='A' }}>`; fundo da cena `#3A403F` escurecido (cor de fundo `#1d2120`).
- Modelos procedurais (primitivas, `meshStandardMaterial`): bancada de madeira escura com tampo em `BENCH_TOP_Y`, painel perfurado com 5 ferramentas no fundo; micro bege `#D6CBB0` com gabinete, monitor de tubo e vidro em `GLASS`; lâmpada pendente quente `#FFCF8A` (pointLight, sombra só no tier A); portão de enrolar (24 ripas, uma `InstancedMesh`) entre `DOOR.x0` e `DOOR.x1`, aberto 40% na partida da cena (a altura da porta = `0.4 + 0.6·garageRuntime.door`); DeLorean em `CAR_SPOT` com dois spotLights frios `#DDE8FF` (intensidade base 0.35 × máxima). Sem `ErrorBoundary` derrubando a cena: GLB que falha deixa só os faróis.
- `Computer` põe `<Html transform>` (drei) no `GLASS.center`, com um elemento de 800×600 px CSS escalado para cobrir exatamente `GLASS.width × GLASS.height`, com `Screen` dentro, enquanto `view !== 'screen'`.
- `GarageCamera`: a cada quadro aproxima a câmera da pose alvo (bench → `BENCH_POSE[framing]`, screen → `screenPose`, launch → mistura com `CAR_POSE` por `launchFrame(...).camera`) com amortecimento exponencial (meia-vida 0.18 s); `arrived` quando a distância < 0.005; com `prefers-reduced-motion` copia a pose alvo direto. Escreve `garageRuntime.camera`, `glassRect` (os quatro cantos do vidro projetados) e `keyRects`.
- `Scene` registra `registerGarageDebug` com `drawCalls = gl.info.render.calls`.
- Tier A: o `Effects` atual (`components/game/Effects.tsx`) entra com `luminanceThreshold` 0.6, para o bloom pegar só o vidro e os faróis; tier B fica sem.

- [ ] **Step 1: Write the failing e2e** `e2e/garage.spec.ts`, grupo `garage: bench`:
  - `/pt shows the menu on the screen`: `html[data-mode=game]`, `.game-layer canvas` visível, botão "Currículo" visível dentro do layer em até 30 s.
  - `/en shows the English menu`: "Resume" e "Português" visíveis.
  - `the bench stays under 60 draw calls`: depois de `window.__garage.snapshot().arrived`, `drawCalls ≤ 60`.
  - `the glass is on screen at both framings`: em 1440×900 e em 390×844, `glassRect` dentro da janela e com área > 0; no 390×844 a altura do vidro é ≥ 40% da janela.
- [ ] **Step 2: Run** `bash .superpowers/salto88-lab/e2e/low.sh npx playwright test e2e/garage.spec.ts --project=chromium -g "garage: bench"` — Expected: FAIL.
- [ ] **Step 3: Implement** os componentes, o runtime, o debug e a troca no `GameLayer`.
- [ ] **Step 4: Run** o mesmo, e também `--project=mobile` — Expected: PASS.
- [ ] **Step 5: Commit** `feat(garage): workbench scene with computer, door, DeLorean and camera`.

---

### Task 5: Teclado, vista de tela, âncoras e idioma

**Files:**
- Create: `components/garage/Keyboard.tsx`, `components/garage/ScreenOverlay.tsx`, `components/garage/useGarageControls.ts`, `lib/garage/keys.ts`
- Modify: `components/garage/Scene.tsx`, `components/game/GameLayer.tsx`, `components/game/GameMount.tsx` (estado inicial pela âncora)
- Test: `tests/garage/keys.test.ts`, `e2e/garage.spec.ts`

**Interfaces:**
- Consumes: Tasks 1–4; `isTypingTarget` (`lib/game/input.ts`).
- Produces:
  ```ts
  // lib/garage/keys.ts
  export const KEY_ROWS: readonly (readonly string[])[]; // 4 fileiras de KeyboardEvent.code: Digit1..Digit0; KeyQ..KeyP; KeyA..KeyL; KeyZ..KeyM, mais Escape à esquerda da primeira e Space numa quinta fileira
  export const ACTION_CODES: Record<GarageAction, string>; // cv KeyC, play KeyJ, contact KeyK, language KeyE, back Escape
  export const PORTRAIT_CODES: readonly string[]; // ['KeyC','KeyJ','KeyK','KeyE']
  // components/garage/useGarageControls.ts
  export function useGarageControls(locale: Locale): (a: GarageAction) => void;
  ```
- `useGarageControls`: devolve `act(a)`, que roda `reduceGarage`, grava `setGarage` e trata o efeito: `switch-locale` → `router.replace('/' + otherLocale(locale) + screenHash(otherLocale(locale), state.content))` (`next/navigation`); `start-launch`/`cancel-launch` ficam para a Task 6 (aqui só gravam `garageRuntime.launchStart`). Também instala: `keydown` em `window` (ignora `repeat`, Ctrl/Meta/Alt, `isTypingTarget`, `dialog[open]`; num campo, Esc só faz `blur`), grava `garageRuntime.pressed.set(e.code, performance.now())` para qualquer tecla e chama `act(keyToAction(e.key))`; `history.replaceState` com `screenHash` a cada troca de estado; `hashchange` → `setGarage(stateFromHash(...))` fora da partida.
- `GameMount`: no efeito inicial troca `resetRuntime(parseZoneHash(...))` por `useGameStore.getState().setGarage(stateFromHash(window.location.hash), null)`; `tests/game/game-mount*.test.tsx` continuam passando (ajustar se eles esperam `resetRuntime`).
- `act(a)` grava `setGarage(next, a)`, para o cursor do menu.
- `Keyboard`: uma `InstancedMesh` de teclas bege (wide: `KEY_ROWS`; portrait: só `PORTRAIT_CODES`, quatro teclas de 6 cm) e legendas numa única `CanvasTexture` compartilhada (Plex Sans, `#4A3F2C`); C, J, K, E com legenda âmbar. Tecla apertada afunda 4 mm por 120 ms (de `garageRuntime.pressed`). `onClick`/`onPointerDown` numa instância → `act(...)` do código dela (só as de `ACTION_CODES`).
- `ScreenOverlay`: em `view==='screen'`, um `<div class="crt" role="region" aria-label=...>` fixo, posicionado a cada quadro em `garageRuntime.glassRect` via `useRuntimeFrame`, com `visibility` oculta até `arrived`; rola por dentro (`overflow-y:auto`); ao chegar, foco no primeiro título; ao voltar, foco no botão do menu que abriu. Clique no canvas fora do vidro na vista de tela (`onPointerMissed` do Canvas) → `act('back')`.

- [ ] **Step 1: Write the failing tests:**
  - `tests/garage/keys.test.ts`: cada código de `ACTION_CODES` está em `KEY_ROWS` (ou é Escape); `PORTRAIT_CODES` são exatamente os quatro das ações não-back; nenhum código repetido em `KEY_ROWS`.
  - `e2e/garage.spec.ts`, grupo `garage: screen`:
    - `C opens the resume and Esc comes back`: tecla C → região do currículo visível com `experience[0].role`, URL termina em `#curriculo`; Esc → menu visível, hash vazio.
    - `clicking the 3D K key opens the contact`: clique no centro de `keyRects` de `KeyK` → contato visível.
    - `typing in the contact form does not change view` (Review Focus 1): K, foca o campo de nome, digita "cjke", Esc → ainda na vista de contato, campo com "cjke" e sem foco.
    - `#contato opens straight on the contact`: abrir `/pt#contato` → contato visível sem apertar nada.
    - `E keeps the resume open in English` (Review Focus 4): `/pt#curriculo`, E → URL `/en#resume`, título "Experience" visível.
    - `the overlay follows the glass on resize` (Review Focus 5): C em 1440×900, redimensiona para 390×844 → em até 1 s o retângulo do overlay fica a menos de 2 px de `glassRect`.
    - `phone keys are at least 44 px`: no projeto mobile, cada `keyRects` de `PORTRAIT_CODES` tem largura e altura ≥ 44.
- [ ] **Step 2: Run** `bash .superpowers/salto88-lab/e2e/low.sh npx vitest run tests/garage/keys.test.ts` e `bash .superpowers/salto88-lab/e2e/low.sh npx playwright test e2e/garage.spec.ts -g "garage: screen"` — Expected: FAIL.
- [ ] **Step 3: Implement** teclas, teclado, overlay e controles.
- [ ] **Step 4: Run** os mesmos (chromium e mobile) — Expected: PASS.
- [ ] **Step 5: Commit** `feat(garage): keyboard, screen view, anchors and language switch`.

---

### Task 6: A partida, o som e a volta do jogo

**Files:**
- Create: `lib/garage/sound.ts`, `components/garage/GarageChrome.tsx`, `components/game/CreditsDialog.tsx`
- Modify: `components/garage/useGarageControls.ts`, `GarageDoor.tsx`, `Lights.tsx`, `GarageCamera.tsx`, `Scene.tsx`, `components/game/GameLayer.tsx`
- Test: `tests/garage/sound.test.ts`, `e2e/garage.spec.ts`

**Interfaces:**
- Consumes: `launchFrame`, `LAUNCH_MS`, `gameUrl` (Tasks 1–2); `garageRuntime` (Task 4); `useGarageControls` (Task 5).
- Produces:
  ```ts
  // lib/garage/sound.ts
  export const SOUND_KEY = 'rodovia:sound'; // 'on' | 'off'
  export interface GarageSound { unlock(): void; key(): void; door(): void; engine(): void; setMuted(m: boolean): void; muted(): boolean }
  export function createGarageSound(ctor?: () => AudioContext): GarageSound;
  // components/game/CreditsDialog.tsx
  export function CreditsButton(props: { className?: string }): JSX.Element; // botão + <dialog> tirados do Hud, mesmo texto (MODEL_CREDIT)
  ```
- `sound.ts`: nada toca antes de `unlock()` (primeiro `pointerdown` ou `keydown`); `muted()` lê `SOUND_KEY` (padrão: não mudo depois do unlock); `setMuted` grava via `writePref`. Sons gerados: `key` = ruído filtrado de 30 ms; `door` = ruído grave filtrado de 1,6 s; `engine` = dente de serra 60→140 Hz em 1,2 s. Ganho de saída ≤ 0.3.
- Partida em `useGarageControls`: `start-launch` grava `garageRuntime.launchStart = performance.now()`, toca `door` e `engine`, e agenda uma única navegação `window.location.assign(gameUrl(locale))` quando `launchFrame(...).done` (o agendamento fica num ref; um segundo J não agenda de novo). `cancel-launch` limpa o agendamento e `launchStart`. Com `prefers-reduced-motion`, a navegação sai no próximo quadro (sem animação).
- Cena: `GarageDoor` usa `launchFrame().door`; `Lights` usa `lamp`, `headlights` e `whiteout` (um plano branco na frente da câmera, opacidade = whiteout); `GarageCamera` mistura com `CAR_POSE` por `camera`.
- Prefetch: quando a cena chega (`arrived` pela primeira vez), `requestIdleCallback` insere `<link rel="prefetch" href={gameUrl(locale)}>` uma vez.
- bfcache (Review Focus 3): `pageshow` com `event.persisted` → `setGarage(INITIAL_GARAGE)`, `garageRuntime.launchStart = null`, `door = 0`.
- `GarageChrome` (DOM, canto inferior esquerdo, Plex Sans, alvos ≥ 44 px): botão Som (`aria-pressed`), `CreditsButton`, e o link PT | EN (o idioma atual marcado com `aria-current`).

- [ ] **Step 1: Write the failing tests:**
  - `tests/garage/sound.test.ts` (AudioContext falso): antes de `unlock` `key()` não cria nós; depois de `unlock` cria; `setMuted(true)` grava `'off'` em `SOUND_KEY` e `key()` não cria nós.
  - `e2e/garage.spec.ts`, grupo `garage: launch`:
    - `J opens the door and lands on the game`: J → em 1,6 s `snapshot().door` entre 0.2 e 0.9; termina em `**/salto88/index.html` (pt).
    - `J twice navigates once` (Review Focus 2): J, J, C, E em 300 ms → uma navegação só (contar `framenavigated` do frame principal até a URL do jogo) e nenhuma ida a `/en`.
    - `Esc during the launch cancels it`: J, Esc em 1 s → menu visível, URL ainda `/pt`.
    - `/en launches with lang=en`: termina em `/salto88/index.html?lang=en`.
    - `back from the game shows the bench again` (Review Focus 3): J até o jogo, `page.goBack()` → menu visível, `snapshot().view === 'bench'`, `door < 0.05`.
    - `reduced motion cuts the camera`: `reducedMotion: 'reduce'` + `rodovia:pitstop='off'` no storage → C → `arrived` no primeiro snapshot depois do clique.
    - `the credits name the car model`: botão Créditos → diálogo com `MODEL_CREDIT.author`.
- [ ] **Step 2: Run** `bash .superpowers/salto88-lab/e2e/low.sh npx vitest run tests/garage/sound.test.ts` e o grupo `garage: launch` no chromium — Expected: FAIL. (A navegação até o jogo só passa de verdade depois da Task 7; até lá os dois testes que esperam a URL do jogo podem usar `page.route('**/salto88/index.html', r => r.fulfill({ body: '<canvas id="c"></canvas>', contentType: 'text/html' }))`.)
- [ ] **Step 3: Implement** som, partida, prefetch, bfcache, créditos e chrome.
- [ ] **Step 4: Run** os mesmos (chromium e mobile) — Expected: PASS.
- [ ] **Step 5: Commit** `feat(garage): launch sequence, sound, credits and the way back from the game`.

---

### Task 7: O jogo no deploy (laboratório)

**Files (laboratório `.superpowers/salto88-lab`, repo próprio):**
- Modify: `proto/salto88v3.template.html`, `build-v3.mjs`, `e2e/run.mjs:13`, `e2e/qa.mjs:17`, `e2e/tour.mjs:10`
- Create: `proto/vendor/three.min.js`, `proto/vendor/GLTFLoader.js`, `proto/vendor/SkeletonUtils.js`, `proto/vendor/fonts/*.woff2`, `e2e/garage-link.mjs`
**Files (site):** `.git/info/exclude` (fica só `public/lab/`), `public/salto88/**` (saída da build), `e2e/garage.spec.ts`

**Interfaces:**
- Consumes: `gameUrl` (Task 1): o jogo é aberto em `/salto88/index.html` com `?lang=en` opcional.
- Produces: `public/salto88/index.html` + `models/`, `video/`, `audio/`, `music/`, `vendor/`; o elemento `a.garage-link` (no gaveta `#drawer`, primeiro item, e em `#finale .links`) com `href` `/pt` ou `/en`.

- [ ] **Step 1: Pedir o OK do Luis para baixar** `three@0.128.0`, `@fontsource/michroma` e `@fontsource/ibm-plex-sans` do registro npm (`npm pack` numa pasta nova do scratchpad; três tarballs, cerca de 1,5 MB, 0,1 MB e 1 MB). Sem o OK, parar a task.
- [ ] **Step 2: Write the failing check** `e2e/garage-link.mjs` (Playwright, mesmo estilo de `hud-check.mjs`, URL por argumento): abre `<url>` e `<url>?lang=en`; espera `document.querySelectorAll('a.garage-link').length === 2`, `href` terminando em `/pt` e em `/en`; no `?lang=en` um aviso com "Game in Portuguese for now" aparece no `#toast` nos primeiros 6 s; nenhuma requisição para `cdnjs.cloudflare.com`, `cdn.jsdelivr.net`, `fonts.googleapis.com` ou `fonts.gstatic.com`.
- [ ] **Step 3: Run** `bash e2e/low.sh node e2e/garage-link.mjs http://localhost:3000/salto88/index.html` (no laboratório, servidor "site" ligado) — Expected: FAIL (404 ou links ausentes).
- [ ] **Step 4: Implement:**
  - copiar dos tarballs `build/three.min.js`, `examples/js/loaders/GLTFLoader.js`, `examples/js/utils/SkeletonUtils.js` e os woff2 latinos de Michroma 400, Plex Sans 400/500/600 e Plex Mono 400/500/600 (este de `node_modules/@fontsource/ibm-plex-mono` do site) para `proto/vendor/`;
  - no template, trocar os três `<script src="https://...">` por `vendor/...` e o `<link>` do Google Fonts por `@font-face` locais com os mesmos nomes de família;
  - `build-v3.mjs` copia também `proto/vendor` para `<OUT>/vendor`;
  - no template, `var GAME_LANG = new URLSearchParams(location.search).get('lang') === 'en' ? 'en' : 'pt';`, os dois `a.garage-link` ("Voltar à garagem") com `href = '/' + GAME_LANG`, e no `en` `toast('Game in Portuguese for now', 4)` uma vez depois da chegada da primeira era;
  - URLs padrão de `run.mjs`, `qa.mjs` e `tour.mjs` → `http://localhost:3000/salto88/index.html`;
  - build: `node build-v3.mjs D:/Projetos/Luis/project-ve2/.superpowers/salto88-lab D:/Projetos/Luis/project-ve2/public/salto88` (imprime `ok NNN KB`);
  - no site, nada a mudar no `.git/info/exclude`: ele só lista `public/lab/`, então `public/salto88/` já entra no git.
- [ ] **Step 5: Run** o check de novo — Expected: PASS. Depois `bash e2e/low.sh node e2e/qa.mjs "" hud` — Expected: hud 4/4, 0 sobreposições.
- [ ] **Step 6: No site, tirar o `page.route` provisório da Task 6** e rodar o grupo `garage: launch` no chromium — Expected: PASS com o jogo de verdade (a página tem `#c`).
- [ ] **Step 7: Commit** no laboratório `feat: game served from /salto88 with local three and fonts, a way back to the garage and the English notice`; no site só `e2e/garage.spec.ts` (`test: garage launch against the real game`). A pasta `public/salto88/` entra no git na Task 8, depois de encolhida.

---

### Task 8: Encolher o jogo para no máximo 30 MB

**Files:**
- Create: `scripts/shrink-game.mjs` (site)
- Modify: laboratório `build-v3.mjs` (copia `proto/min/models` e `proto/min/music` quando existirem, senão os originais)

**Interfaces:**
- Produces: `node scripts/shrink-game.mjs <labProto>` escreve `<labProto>/min/models/*.json` e `<labProto>/min/music/*` sem tocar nos originais (que não estão no git do laboratório) e imprime o tamanho antes e depois de cada arquivo.

- [ ] **Step 1: Medir:** `du -sh public/salto88 public/salto88/*` — registrar no commit.
- [ ] **Step 2: Modelos:** para cada `models-json/*.json`, ler com `NodeIO` (`@gltf-transform/core` + `ALL_EXTENSIONS`, como `scripts/optimize-assets.mjs`), `textureCompress({ encoder: sharp, targetFormat: 'webp', quality: 82 })`, sem meshopt nem draco (o GLTFLoader r128 do jogo não tem os decodificadores), e gravar de volta como JSON com buffers e imagens em data URI (`writeJSON` e cada recurso convertido em `data:application/octet-stream;base64,...` / `data:image/webp;base64,...`).
- [ ] **Step 3: Música:** `ffmpeg` não está instalado. Pedir o OK do Luis para `winget install Gyan.FFmpeg`; com o OK, `.ogg` → `-c:a libvorbis -q:a 3`, `.mp3` → `-b:a 128k`, mesmos nomes. Sem o OK, pular a música.
- [ ] **Step 4: Build** do jogo de novo e `du -sh public/salto88` — Expected: ≤ 30 MB. Se passar, parar e perguntar ao Luis sobre o Vercel Blob (§6 do spec) antes de qualquer commit de `public/salto88`.
- [ ] **Step 5: Verificar no laboratório:** `bash e2e/low.sh node e2e/audio-check.mjs` (cada estação a até 1 dB de −22 dB, a mais alta e a mais baixa a no máximo 2 dB) e `bash e2e/low.sh node e2e/tour.mjs` só com as cenas do showroom e do DeLorean de perto (comparar com as fotos de `eval-final`: sem textura faltando).
- [ ] **Step 6: Commit** no site `chore: shrink game models and music` e `feat: ship Salto 88 in public/salto88` (a pasta da build).

---

### Task 9: Tirar o hub

**Files:**
- Delete: `components/game/{Hub,ZoneMarker,ZonePanel,Minimap,Decor,GameDirector,Hud,InputController,WorldCanvas,CameraRig,Car,PrimitiveCar,SignLabel}.tsx`, `components/game/{useHashSync,useZoneNames}.ts`, `lib/game/{autopilot,decor,physics,tick,hud,zones,debug,rng,runtime,types}.ts`; `tests/game/{autopilot,debug,decor,hud,physics,rng,runtime,tick,zones}.test.ts`, `tests/game/{hash-sync,hud-next,input-controller,zone-panel-keys}.test.tsx`; `e2e/world.spec.ts`, `e2e/hud.spec.ts`, `e2e/input.spec.ts`
- Ficam: `GameMount`, `GameLayer`, `ErrorBoundary`, `PitstopToggle`, `Effects`, `useRuntimeFrame`, `useWebglSupport`, `CreditsDialog`; `lib/game/{tier,assets,input}.ts`; `tests/game/{game-mount,game-mount-chunk}.test.tsx`, `tier.test.ts`, `webgl.test.ts`, `input.test.ts` (só os casos de `isTypingTarget`)
- Modify: `lib/store.ts` (sai `zone`, `mode`, `setZone`, `setMode`), `lib/game/input.ts` (fica só `isTypingTarget`), `components/game/GameMount.tsx` (sai `resetRuntime`/`parseZoneHash`), `messages/{pt,en}.json` (saem de `Game`: `hint`, `keys`, `touch`, `roaming`, `hud`, `speed`, `mode`, `next`, `nextStop`, `modes`, `zones`, `stop`, `minimap`, `travelTo`, `cv`, `cvPtOnly`), `tests/messages.test.ts` (sai o teste das zonas), `tests/store.test.ts`, `e2e/perf.spec.ts`

**Interfaces:**
- Consumes: tudo das Tasks 1–6 (nada delas importa os módulos que saem; conferir).

- [ ] **Step 1: Confirmar cada remoção:** para cada arquivo da lista, `grep -rn "<nome do módulo>" app components lib tests e2e --include=*.ts --include=*.tsx` só pode achar arquivos que também saem. Um arquivo que ainda tenha usuário fora da lista fica, e o commit diz qual e por quê.
- [ ] **Step 2: Apagar** e ajustar os arquivos de Modify.
- [ ] **Step 3: perf.spec:** `PAYLOAD_BUDGET_BYTES = 2.5 * 1024 * 1024`; o teste do tier A passa a esperar `window.__garage` (não `__rodovia`); o resto igual.
- [ ] **Step 4: Run** `npm run typecheck`, `npm run lint`, `bash .superpowers/salto88-lab/e2e/low.sh npx vitest run` — Expected: tudo PASS, nenhum import quebrado.
- [ ] **Step 5: Commit** `refactor: remove the five-zone hub (the garage replaces it)`.

---

### Task 10: Fotos, nota e fechamento

**Files:**
- Create: `scripts/garage-shots.mjs`, `.superpowers/garagem/notas.md` (fora do git, como o laboratório)
- Modify: o que as notas pedirem (lotes de correção); `docs/superpowers/specs/2026-10-23-garagem-entrada-design.md` (seção "Como construído"); `.superpowers/HANDOFF-salto88.md` (estado e onde está a garagem)

**Interfaces:**
- Consumes: `window.__garage.snapshot()` (Task 4).
- Produces: `node scripts/garage-shots.mjs <baseUrl> <outDir>` grava 18 PNG `NN-<viewport>-<shot>.png`: viewports `desk` 1440×900, `phone` 390×844, `small` 375×568; fotos `bench-pt`, `bench-en`, `cv`, `contact`, `launch-mid` (door ≈ 0.5), `launch-end` (whiteout > 0.8, antes de navegar: `page.route` segura a navegação do jogo). Espera `arrived` antes de cada foto; SwiftShader como em `playwright.config.ts`.

- [ ] **Step 1: Rodar as fotos** `bash .superpowers/salto88-lab/e2e/low.sh node scripts/garage-shots.mjs http://localhost:3000 .superpowers/garagem/r1` (servidor "site").
- [ ] **Step 2: Nota por área** (bancada desktop, bancada celular, currículo, contato, partida, idioma) de 0 a 10 em `notas.md`, com os defeitos concretos de cada foto, contra o spec (paleta, uma ousadia só, 72 colunas, nada cortado em 375×568, foco visível).
- [ ] **Step 3: Lote de correções** pelos defeitos de maior impacto (2–3 por lote), cada um com seu teste próprio rodado uma vez; nova rodada de fotos `r2`, `r3`… até todas as áreas ≥ 9.
- [ ] **Step 4: Fechamento, uma vez:** `npm run typecheck`, `npm run lint`, `bash .superpowers/salto88-lab/e2e/low.sh npx vitest run`, `npm run build && npm run check:bundle`, `bash .superpowers/salto88-lab/e2e/low.sh npm run test:e2e`, `bash .superpowers/salto88-lab/e2e/low.sh npm run test:perf` — Expected: tudo PASS; registrar os números (bundle KB, payload MB, draw calls).
- [ ] **Step 5: Escrever** a seção "Como construído" no spec e atualizar o handoff.
- [ ] **Step 6: Commit** `docs: garage entry as built` e mostrar ao Luis as fotos finais. O merge na `main` fica com ele.
