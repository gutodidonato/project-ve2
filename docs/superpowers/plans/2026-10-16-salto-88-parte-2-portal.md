# Salto 88 · Parte 2: portal do tempo · Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Trocar o pórtico de estrada por um portal do tempo único, visível de qualquer ponto da fase, que diz o destino e faz da passagem um momento (P1–P9 da spec).

**Architecture:** O protótipo é um HTML único (`proto/salto88v3.template.html`). Um construtor novo, `addTimePortal`, monta o grupo `portal-do-tempo` (anel, vórtice, coluna de luz, faíscas, rótulo, colisores), e um atualizador da era cuida da animação, do som de presença e da detecção de passagem. A passagem chama uma função de transição (`portalTransit`) que faz o clarão e o túnel e depois entra na rodovia (`enterHighway`) ou no showroom (EVIG).

**Tech Stack:** three.js r128, WebAudio, Playwright.

**Spec:** `docs/superpowers/specs/2026-10-16-salto-88-parte-2-portal-design.md`

## Locais

Os mesmos da parte 1 (ver o cabeçalho do plano `2026-10-16-salto-88-parte-1-defeitos.md`): fonte em `$S/proto/salto88v3.template.html`, build com `build-v3.mjs`, suíte `e2e/run.mjs`, auditoria `e2e/qa.mjs`, tour `e2e/tour.mjs`, git local em `$S`.

## Global Constraints

- O portal fica em (0, −78) nas eras 0 a 3 e em (0, 8,4, −76) na EVIG, onde já estão a saída e o gatilho hoje.
- As cores vêm da era de destino: `next.color` para o vórtice, a coluna e o anel; `next.accent` para o rótulo.
- Coluna de luz até 120 m, sem neblina (`fog: false`), com mistura aditiva.
- Nenhum modelo, biblioteca ou origem nova.
- Medições de som com o `measure(ms)` da parte 1 (canais `rádio`, `efeitos`, `ambiente` e `música`).
- Os testes de rodovia, demo, plutônio e "evig: portal fora do centro não leva" continuam passando.

## Review Focus

1. **Chegar ao portal devagar e parar dentro do anel:** a passagem acontece uma vez só e não volta a disparar na rodovia. Teste na Tarefa 3.
2. **Demo automático:** o piloto automático continua achando a saída e cruzando pelo centro em todas as eras. Teste na Tarefa 3 (o teste de demo atual).
3. **Ré pelo portal** (de frente para trás): não dispara a passagem. Teste na Tarefa 3.
4. **Celular (375 × 812):** o rótulo do portal cabe na tela a 60 m e não cobre o HUD. Foto na Tarefa 6.
5. **Som desligado:** o zumbido do portal não toca antes de M. Teste na Tarefa 4.

---

### Task 1: Construtor, forma e rótulo (P1, P2, P4)

**Files:**
- Modify: template (`addGate` e as duas chamadas `addGate(g, next, 0, -78, 13)` em `buildExercito` e `buildCity`)
- Test: `e2e/run.mjs`

**Interfaces:**
- Produces:
  - `addTimePortal(g, next, x, z, opts) -> THREE.Group`, com `opts = { y?: number = 6.6, aim?: boolean = false }`. O grupo se chama `'portal-do-tempo'` e tem `userData.portal = { x, y, z, radius: 6.0, next: next.id }`.
  - O grupo da era expõe `world.portal3 = group.userData.portal` (usado nas Tarefas 2 a 5).
  - Gancho `__salto.portal()` → `world.portal3` copiado em JSON, ou `null`.

- [ ] **Step 1: Write the failing test** `portal: um portal do tempo por era, com o destino escrito`.
  - Para as eras 0 a 3: na cena há exatamente um objeto chamado `portal-do-tempo`.
  - Não sobra nenhum `overheadLights` a menos de 3 m de (0, −78).
  - `__salto.portal().next` é o id da era seguinte.
  - O texto do rótulo de destino, guardado em `group.userData.label`, contém a data da próxima era (`ERAS[i+1].date`).
- [ ] **Step 2: Run** `node run.mjs "" "portal: um portal"`. Expected: FAIL.
- [ ] **Step 3: Implement.**
  - Para o vórtice, extraia o `ShaderMaterial` do portal da EVIG para uma função `vortexMaterial(colorA, colorB)` e use-a nas duas eras.
  - O anel é um `TorusGeometry(6.6, 0.42, 12, 64)` com emissivo na cor de destino. O brilho é um sprite de 26 m.
  - Rótulo: `label(next.date + ' · ' + next.name.toUpperCase(), next.accent, next.id === 'final' ? 'o último salto' : 'chegue a 88 mph na rodovia', 1.2)`, 2 m acima do anel. O texto fica em `userData.label`.
  - `addGate` é removido, e as duas chamadas passam a usar `addTimePortal`.
- [ ] **Step 4: Run** o teste novo e `"rodovia: segurar W chega a 88 mph"`. Expected: PASS.
- [ ] **Step 5: Checkpoint.** Commit no git local e cópia para `.superpowers/proto/`.

### Task 2: Coluna de luz, chão, faíscas e raios (P3, P5) + medição na auditoria

**Files:**
- Modify: template (`addTimePortal` e o atualizador do portal); `e2e/qa.mjs` (seção `portals`)
- Test: `e2e/run.mjs`

**Interfaces:**
- Consumes: `addTimePortal`, `world.portal3` (Tarefa 1).
- Produces: `qa.mjs portals` mede o grupo `portal-do-tempo` (caixa do grupo inteiro, coluna incluída) e ignora objetos ocultos ou com algum ancestral oculto.

- [ ] **Step 1: Fix the audit first.**
  - Em `qa.mjs`, a busca do portal passa a usar o nome `portal-do-tempo`.
  - O filtro do raio passa a pular qualquer acerto com um ancestral `visible === false`. Hoje ele acusa os pórticos escondidos da rodovia.
  - Rode `node qa.mjs "" portals` e registre os números de hoje no relatório da tarefa.
- [ ] **Step 2: Write the failing test** `portal: visível de longe`.
  - Era 1, carro em (2,6; 62) de frente para o portal, câmera de perseguição assentada (0,8 s).
  - Projete a caixa do grupo `portal-do-tempo` e exija altura ≥ 120 px e o centro do anel na tela.
  - Faça um raio da câmera ao centro do anel (com `ray.camera` definido): nenhum objeto visível do cenário fica antes do anel.
  - Leia a luminância média dentro da caixa do anel menos a de uma faixa ao redor numa captura de tela (a mesma conta de `qa.mjs`) e exija ≥ 40.
- [ ] **Step 3: Run.** Expected: FAIL (altura ~32 px).
- [ ] **Step 4: Implement.**
  - Coluna: `CylinderGeometry(1.2, 2.4, 120, 24, 1, true)` com `MeshBasicMaterial` aditivo, transparente, sem `depthWrite` e sem neblina, na cor de destino. A opacidade pulsa entre 0.35 e 0.55. A base fica no centro do anel.
  - Chão: `CircleGeometry(8, 48)` com o `softDot` como textura, aditivo, a 0,05 m do chão.
  - Faíscas: um `THREE.Points` com 140 pontos que orbitam em espiral (raio de 7 → 1 m) e reaparecem por fora.
  - Raios: reutilize o gerador de arcos dos 88 mph (`ARCS`/`updateArcs`), ou uma `Line` com 6 segmentos aleatórios entre dois pontos do anel, a cada 1,5 a 3 s, durando 0,12 s.
- [ ] **Step 5: Run** o teste novo, `node qa.mjs "" portals` (as cinco eras com P3 atendida; anote os números) e `"boot: todas as eras"`. Expected: PASS.
- [ ] **Step 6: Checkpoint.**

### Task 3: Só por dentro e a passagem (P6, P7)

**Files:**
- Modify: template: o gatilho atual (`if (c.z < -74 && Math.abs(c.x) < 8 && S.portalT < 0)`), `enterHighway`, `updateCamera` (campo de visão durante o túnel), `addTimePortal` (colisores laterais)
- Test: `e2e/run.mjs`

**Interfaces:**
- Consumes: `world.portal3`.
- Produces: `portalTransit(next)` → `void`. Ela mostra o clarão (0,15 s) e o túnel (0,8 s) e chama `enterHighway()` (ou o showroom na EVIG). `S.transit` (≥ 0 durante a passagem, −1 fora) fica exposto em `info()`.

- [ ] **Step 1: Write the failing tests.**
  - `portal: atravessar pelo centro leva à rodovia com túnel`, na era 1:
    - carro em (0, −60) com velocidade 12, segurando W;
    - em até 1,2 s o modo vira `highway`;
    - em algum quadro, `camera.fov > 85`;
    - depois, o modo continua `highway` por 2 s sem disparar outra passagem.
  - `portal: pela beira não passa e de ré não dispara`:
    - carro em (7,5; −60) apontando para (7,5; −90), segurando W por 2 s: o modo continua `world` e o carro para antes de z −77;
    - carro em (0, −82) de ré (`h = Math.PI`, velocidade −8): o modo continua `world`.
  - `portal: Colmeia só passa na altura do anel`:
    - voo em (0, −60, y 6,6) passando pelo centro: vira `highway`;
    - voo a y 18: o modo continua `world` depois de cruzar z −78.
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement.**
  - Dois `addCircleCol` de 0,6 m nos pés do anel (x ± 6,6), mais um `addBoxCol` de 0,3 m de espessura cobrindo cada lado da pista, de 7,2 m até 13 m do centro.
  - O gatilho passa a ser: o carro cruza o plano z = portal.z vindo de z maior, com `hypot(c.x − p.x, c.y + 0.6 − p.y) < p.radius`, e `S.transit < 0`.
  - Durante a passagem:
    - o `#flash` existente mostra o clarão;
    - o campo de visão sobe para 95° e volta;
    - riscos de luz são reaproveitados da rodovia;
    - o vórtice cresce na frente da câmera.
  - O gatilho antigo é removido.
- [ ] **Step 4: Run** os três testes novos e mais `"demo: passeio automático"`, `"rodovia: segurar W"`, `"evig: portal fora do centro não leva"` e `"são paulo: só na saída da FIAP"`. Expected: PASS.
- [ ] **Step 5: Checkpoint.**

### Task 4: Som de presença e de passagem (P7 som, P8)

**Files:**
- Modify: template (`audioInit`: um laço novo `E.portalHum` no canal `AUD.amb`; `updateAudio`: ganho pela distância a `world.portal3`; `portalTransit`: o "whoosh")
- Test: `e2e/run.mjs`

**Interfaces:**
- Consumes: `measure(ms)` (parte 1), `world.portal3`.

- [ ] **Step 1: Write the failing test** `som: o portal zune mais forte de perto`.
  - Antes de M, parado a 20 m do portal: `measure(1500).rms === -120`.
  - Depois de M, parado a 120 m: `far`. Parado a 20 m: `near`.
  - Asserções: `near.bus['ambiente'].rms - far.bus['ambiente'].rms >= 6`; nenhum pico ≥ −1 dB.
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement.**
  - Zumbido: três osciladores senoidais (55, 82,5 e 110 Hz) com tremolo de 0,4 Hz. O ganho vai de 0 (100 m ou mais) a 0.12 (10 m), numa curva quadrática.
  - O "whoosh" é um ruído com passa-banda subindo de 300 para 2400 Hz em 0,8 s, tocado junto com `play('portal')`.
- [ ] **Step 4: Run** o teste novo, `"som: começa mudo"` e `"som: 88 mph toca o salto"`. Expected: PASS.
- [ ] **Step 5: Checkpoint.**

### Task 5: EVIG com o mesmo portal e argolas âmbar (P1 EVIG, P9)

**Files:**
- Modify: template, `buildEvig` (troca o portal manual por `addTimePortal(g, next, 0, -76, { y: 8.4, aim: true })`; cor das argolas em `RINGS`)
- Test: `e2e/run.mjs`

- [ ] **Step 1: Write the failing test** `evig: portal do tempo com mira e argolas âmbar`.
  - Na era 4 existe um único `portal-do-tempo`, com `portal().y === 8.4`.
  - Todas as malhas das argolas têm `material.color.getHex() === 0xffb347`.
  - Passar fora do centro não leva ao showroom; pelo centro, leva. A regra do teste atual continua.
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement.** Com `aim: true`, o portal mantém a mensagem "Mire no centro" quando o carro cruza fora do raio, e a passagem leva ao showroom pelo mesmo `portalTransit`.
- [ ] **Step 4: Run** o teste novo, `"evig: as 6 argolas"`, `"evig: argola na altura errada"` e `"evig: portal fora do centro"`. Expected: PASS.
- [ ] **Step 5: Checkpoint.**

### Task 6: Fechamento

- [ ] **Step 1: Run** `node qa.mjs "" portals` e `node qa.mjs "" hud`. Expected: P3 atendida nas 5 eras e HUD sem sobreposição.
- [ ] **Step 2: Run** a suíte inteira. Expected: tudo PASS.
- [ ] **Step 3: Tour.** Acrescente fotos do portal a 140 m e a 40 m em cada era, mais uma no celular, e revise.
- [ ] **Step 4: Spec geral.** Atualize `docs/superpowers/specs/2026-10-15-salto-88-design.md` (§ portais) e faça commit no repo.
