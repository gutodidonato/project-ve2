# Salto 88 · Parte 1: defeitos medidos · Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Corrigir os 12 defeitos medidos pela auditoria da v3.6 (R1–R12 da spec), cada um travado por um teste E2E com a meta da spec.

**Architecture:** O protótipo é um HTML único (`salto88v3.template.html`) montado por `build-v3.mjs` e servido em `http://localhost:3000/lab/v3/index.html`. Os testes E2E (`e2e/run.mjs`, Playwright + swiftshader) dirigem o jogo pelo gancho `window.__salto` com passos determinísticos (`advance`). Os testes de som ligam analisadores aos canais de áudio do jogo e medem em tempo real.

**Tech Stack:** three.js r128 (UMD, cdnjs), WebAudio, Playwright (chromium headless), Node 22.

**Spec:** `docs/superpowers/specs/2026-10-16-salto-88-parte-1-defeitos-design.md`

## Locais

- `S` = `C:/Users/guto/AppData/Local/Temp/claude/D--Projetos-Luis-project-ve2/2dd8faae-6163-4e38-b22c-4c9cbc247293/scratchpad`
- Fonte do jogo: `$S/proto/salto88v3.template.html` (fora do git; cópia de segurança em `.superpowers/proto/`)
- Build: `node $S/build-v3.mjs "$S" "D:/Projetos/Luis/project-ve2/public/lab/v3"` (falha se algum script tiver erro de sintaxe)
- Servidor: `npm run dev` no repo (porta 3000; no app desktop, `preview_start` com o nome `site`)
- Suíte: `node $S/e2e/run.mjs "" "<trecho do nome do teste>"`; sem filtro, roda tudo (~45 min)
- Auditoria: `node $S/e2e/qa.mjs "" <seção>` (seções `wheels gpu life portals landmarks hud sound`)
- Tour de fotos: `node $S/e2e/tour.mjs`

## Global Constraints

- Nenhuma requisição a outra origem além das que já existem (cdnjs, jsdelivr do GLTFLoader, Google Fonts).
- Música só CC0, hospedada junto do site; crédito na gaveta de informações (`#drawer`).
- Telefone nunca aparece no código do site.
- three.js continua na r128; nenhuma biblioteca nova.
- Toda meta usa a medição da spec: dB = 20·log10(RMS) no canal medido; janelas de pelo menos 3 s salvo indicação; tolerância de 1 dB.
- Os 67 testes atuais continuam passando ao fim de cada tarefa que mexe no código que eles cobrem.
- Ponto de controle de cada tarefa: build sem erro, testes da tarefa passando e cópia de `salto88v3.template.html`, `e2e/run.mjs` e `e2e/qa.mjs` para `D:/Projetos/Luis/project-ve2/.superpowers/proto/` (o protótipo não está no git; só documentos em `docs/` levam commit).

## Review Focus

1. **Buzina segurada** (H pressionado por 2 s): o ganho não acumula e fica dentro da meta R6. Teste na Tarefa 5.
2. **Troca rápida de estação** (cinco cliques seguidos): toca uma faixa por vez e o volume termina na meta R7. Teste na Tarefa 6.
3. **Cair na vala e acelerar**: o carro sai sozinho em até 3 s e não fica preso. Teste na Tarefa 3.
4. **Girar o celular no meio da partida** (de 375×812 para 812×375 já dentro da era): o HUD se rearruma sem sobreposição. Teste na Tarefa 10.
5. **Som desligado** (M nunca pressionado): ambiente novo, Rádio Quartel e buzina continuam em silêncio absoluto. Teste na Tarefa 8.

---

### Task 1: Estepe parado (R1)

**Files:**
- Modify: `$S/proto/salto88v3.template.html`, função `rigVehicle`
- Test: `$S/e2e/run.mjs`

**Interfaces:**
- Produces: só nós com nome `^wheel-(front|back)-(left|right)(_\d+)?$` entram em `rig.wheels`.

- [ ] **Step 1: Write the failing test** `rodas: nenhuma roda sai do próprio eixo ao girar`.
  Percorra as eras 0 a 4 e a rodovia (depois de `goto(1)`). Para cada nó cujo nome começa com `wheel`, meça o centro da caixa do nó antes e depois de somar 1,3 rad em `rotation.x` e depois restaure. A asserção fica assim: `expect(bad.length === 0, …)`, onde `bad` = nós com deslocamento > 0,05 m **e** que estão em `rigVehicle(g).wheels`. Para ler os nós do rig, exponha `__salto.rigWheels(g)` → `string[]` com os nomes dos nós em `rig.wheels`.
- [ ] **Step 2: Run** `node e2e/run.mjs "" "rodas: nenhuma"`. Expected: FAIL, com `suv · wheel-back` na mensagem.
- [ ] **Step 3: Implement.** Em `rigVehicle`, troque `/^wheel/` pela expressão acima. Acrescente o gancho `rigWheels: function (g) { const r = rigVehicle(g); return r ? r.wheels.map(function (w) { return w.n.name; }) : []; }`.
- [ ] **Step 4: Run** o teste novo e também `"animação: rodas do trânsito"`. Expected: os dois PASS.
- [ ] **Step 5: Checkpoint.**

### Task 2: Neve sem tremor e penhascos com cor de pedra (R2, R3)

**Files:**
- Modify: `buildExercito` (montanhas, cerca da linha 828: `mountM`, `snowM`, cones de neve; `scatter(g, 'cliff_large_rock', …)`)
- Test: `$S/e2e/run.mjs`, `$S/e2e/tour.mjs`

**Interfaces:**
- Produces: cada malha de neve tem `userData.kind = 'neve'`; cada instância dos penhascos usa um material com `userData.kind = 'pedra'`.

- [ ] **Step 1: Confirm the cause.**
  - Tire 3 fotos da serra a 60, 120 e 200 m: `tour.mjs` com uma entrada nova `07b-serra-perto/medio/longe`, câmera em (20, 12, −20/−40/−80) olhando para (40, 15, −90).
  - Confira que as listras aparecem.
  - Confira no código que o cone de neve tem a mesma inclinação do cone da montanha na faixa em que os dois se sobrepõem.
- [ ] **Step 2: Write the failing test** `exército: neve sem z-fighting e penhasco cor de pedra`.
  - Toda malha `userData.kind === 'neve'` tem `material.polygonOffset === true` e `material.polygonOffsetFactor <= -1`.
  - Todo material `kind === 'pedra'` tem saturação HSL ≤ 0,35.
  - Existe pelo menos 1 malha de cada tipo.
- [ ] **Step 3: Run.** Expected: FAIL.
- [ ] **Step 4: Implement.**
  - `snowM` ganha `polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2`, e as malhas ganham `userData.kind = 'neve'`.
  - Os penhascos ganham a cor `0x7d746a` (pedra quente, ao lado do `0x6a6f7c` das montanhas) através do tint do `scatter`, e o material tingido ganha `userData.kind = 'pedra'`.
- [ ] **Step 5: Run** o teste e refaça as 3 fotos. Expected: PASS, e as fotos não mostram listras. Anexe o antes e depois ao relatório da tarefa.
- [ ] **Step 6: Checkpoint.**

### Task 3: Vala de verdade (R4)

**Files:**
- Modify: `buildExercito` (chão de 240 m; a vala hoje é um plano preto de 9 × 4,5 em x −45, z −45); `stepWorld` (onde `inTrench` é calculado)
- Test: `$S/e2e/run.mjs`

**Interfaces:**
- Consumes: `CX = -45`, retângulo da vala `|x − CX| < 4,5 && |z + 45| < 2,25`.
- Produces: `TRENCH_DEPTH = 1.0` (m); com o carro dentro da vala, `S.car.y` desce suavemente até `-0.8`.

- [ ] **Step 1: Write the failing tests.**
  - `exército: a vala tem fundo`: um raio vertical a partir de (−45, 5, −45) atinge a primeira superfície em y ≤ −0,9.
  - `exército: cai na vala, desce e sai acelerando`: o carro entra devagar (velocidade 4, de z −38 para −45). Durante a queda, `car.y < -0,5`. Segurando W, ele sai da vala em até 3 s, com `car.z < -48` e `car.y >= 0`.
- [ ] **Step 2: Run.** Expected: os dois FAIL.
- [ ] **Step 3: Implement.**
  - O chão vira `ShapeGeometry` com um furo retangular (9 × 4,5) na vala.
  - A vala ganha paredes e fundo de terra (cor `0x5a3f22`; fundo em `y = -TRENCH_DEPTH`).
  - Em `stepWorld`, enquanto `inTrench`, `c.y` vai para `-0.8` com `lerp`. Ao sair do retângulo, volta a 0.
  - A penalidade e o limite de velocidade continuam iguais.
- [ ] **Step 4: Run** os dois testes novos, `"devagar cai na vala"` e `"pista completa"`. Expected: todos PASS.
- [ ] **Step 5: Checkpoint.**

### Task 4: Nomes de região como aviso (R5)

**Files:**
- Modify: `buildExercito` (linha com `[['SELVA', …], ['CAATINGA', …], ['MONTANHA', …]]`); o atualizador da era
- Test: `$S/e2e/run.mjs`

**Interfaces:**
- Produces: `regionAt(x, z)` → `'SELVA' | 'CAATINGA' | 'MONTANHA' | null`, com as mesmas zonas de `weatherAt` (montanha: `z < -50 && x > -30`; selva: `x < -18`; caatinga: `x > 22 && z > -40`).

- [ ] **Step 1: Write the failing test** `exército: nomes de região aparecem ao entrar, não no céu`.
  - Nenhum sprite da cena tem textura com o texto SELVA, CAATINGA ou MONTANHA. Para checar, marque os rótulos com `userData.region` e cheque que nenhum existe.
  - Teleporte para (50, 8) e avance 0,5 s: `#toast` contém "CAATINGA".
  - Saia (0, 30), volte e o aviso aparece de novo.
  - Parado dentro da região por 5 s, o aviso aparece uma única vez.
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement.** Remova os três rótulos. Num atualizador da era, mostre `toast(regionAt(...), 1.6)` quando a região muda para um valor não nulo.
- [ ] **Step 4: Run.** Expected: PASS.
- [ ] **Step 5: Checkpoint.**

### Task 5: Medição de som na suíte, buzina e garoa (R6, R9)

**Files:**
- Modify: `audioInit` (etiqueta dos canais); `hornStart` (ganho alvo, hoje 0.42); `updateAudio` (ganho da chuva, hoje 0.35 / 0.15 em `E.rain`)
- Test: `$S/e2e/run.mjs` (`openPage` e um auxiliar novo `measure`)

**Interfaces:**
- Produces:
  - Em `audioInit`, `radio.master.__bus = 'rádio'`, `AUD.sfx.__bus = 'efeitos'`, `AUD.amb.__bus = 'ambiente'`, `radio.trackGain.__bus = 'música'`.
  - Em `run.mjs`, `measure(ms)` → `{ rms, peak, centroidHz, bus: { [nome]: { rms, peak } } }`, em dB e Hz.

- [ ] **Step 1: Add the tap.**
  - Em `openPage`, `ctx.addInitScript` intercepta `AudioNode.prototype.connect`. Toda ligação a `AudioDestinationNode` também liga a um analisador geral e a um analisador por canal, nomeado por `this.__bus`.
  - O auxiliar `measure(ms)` despausa o jogo (`freeze(false)`), amostra os analisadores a cada 45 ms e pausa de novo.
  - Use o mesmo cálculo de `qa.mjs` (seção `sound`).
- [ ] **Step 2: Write the failing test** `som: buzina e garoa dentro da mixagem`.
  - Ligue o som (M) e espere 3 s.
  - **Cidade dirigindo:** RedBit, (2,6; 60), W por 3,5 s → `drive`.
  - **Buzina segurada:** H por 2 s parado → `horn`.
  - Asserções: `horn.rms - drive.rms <= 6`; `drive.centroidHz < 3000`; nenhum pico ≥ −1 dB.
- [ ] **Step 3: Run.** Expected: FAIL (hoje ~17 dB de diferença e 6,3 kHz).
- [ ] **Step 4: Implement.** Baixe o alvo da buzina até a meta. A garoa (`drizzle`) ganha um laço próprio `E.drizzle` (passa-banda de 1200 Hz, ganho de partida 0.05, canal `AUD.amb`); a chuva forte da selva continua em `E.rain`. Ajuste pelos números medidos, não por ouvido.
- [ ] **Step 5: Run** o teste novo e `"buzina: H faz os motoristas"`. Expected: PASS.
- [ ] **Step 6: Checkpoint.**

### Task 6: Músicas no mesmo volume (R7)

**Files:**
- Modify: `STATIONS` (campo novo `gain`); `setStation` (aplica `radio.trackGain.gain` = 0.55 × `gain` da estação)
- Test: `$S/e2e/run.mjs`

**Interfaces:**
- Consumes: `measure(ms)` da Tarefa 5.
- Produces: `STATIONS[i].gain: number` para toda estação com `track`.

- [ ] **Step 1: Write the failing test** `rádio: todas as faixas no mesmo volume`.
  - Ligue o rádio (R) e passe pelas estações com `#rNext`.
  - Em cada estação com faixa, espere 2,5 s e meça 4 s: `bus['música'].rms`.
  - Asserções: cada valor fica em −22 ± 1 dB e `max - min <= 2`.
  - Troca rápida: cinco cliques seguidos, espera de 3 s e a medição da estação final dentro de −22 ± 1. `document.querySelectorAll('audio').length` continua sem players novos.
- [ ] **Step 2: Run.** Expected: FAIL (hoje de −26,8 a −18,8 dB).
- [ ] **Step 3: Implement.**
  - Partida de `gain`, calculada a partir da medição da auditoria: Midnight Drive 1,58; Space City 0,79; Cyber Runner 0,95; Ganymede 0,63.
  - Ajuste fino até o teste passar.
- [ ] **Step 4: Run.** Expected: PASS; `"interface: rádio liga e desliga"` também PASS.
- [ ] **Step 5: Checkpoint.**

### Task 7: Clímax das 88 mph (R8)

**Files:**
- Modify: `updateAudio` (laço `flux`, hoje até 0.5); o trecho de `stepHighway` que toca `play('jump', 1)` e o `boom`
- Test: `$S/e2e/run.mjs`

**Interfaces:**
- Consumes: `measure(ms)`; a medição `drive` da Tarefa 5 vem de um passo próprio deste teste.

- [ ] **Step 1: Write the failing test** `som: chegar a 88 mph é o momento mais alto da viagem`.
  - Meça `drive` como na Tarefa 5.
  - Rodovia a partir do Exército: segure W até `info().hwSpeed * 2.2 >= 80` e meça 1,5 s → `climax`.
  - Asserções: `climax.rms - drive.rms >= 6`; `climax.peak < -1`.
- [ ] **Step 2: Run.** Expected: FAIL (hoje ~−1 dB de diferença).
- [ ] **Step 3: Implement.**
  - `flux` sobe para até 0.9, com o volume acompanhando k.
  - O motor ganha +3 dB acima de 70 mph.
  - `jump` e `boom` sobem até `climax` passar na meta sem chegar a −1 dB de pico.
- [ ] **Step 4: Run** o teste novo e `"som: 88 mph toca o salto"`. Expected: PASS.
- [ ] **Step 5: Checkpoint.**

### Task 8: Ambiente do Exército (R10)

**Files:**
- Modify: `updateAudio` (laços `wind`, `birds`; hoje os pássaros só tocam na selva e o vento só com velocidade)
- Test: `$S/e2e/run.mjs`

**Interfaces:**
- Consumes: `measure(ms)`, `regionAt(x, z)` da Tarefa 4.

- [ ] **Step 1: Write the failing test** `som: Exército nunca fica mudo e som desligado é silêncio`.
  - Antes de M, numa página nova: `measure(1500).rms === -120`.
  - Depois de M, parado por 3 s em base (0, 30), selva (−45, −20), caatinga (50, 8) e montanha (20, −70): em cada ponto, `bus['ambiente'].rms >= -45`.
- [ ] **Step 2: Run.** Expected: FAIL (base em −120).
- [ ] **Step 3: Implement.**
  - Leito de vento parado no Exército: laço novo `E.breeze` no canal `AUD.amb` (ruído com passa-baixa de 500 Hz, ganho 0.06), somado ao vento por velocidade que já existe em `AUD.sfx`.
  - Pássaros na selva e perto das árvores da base.
  - Vento seco (passa-banda de 800 Hz) na caatinga e na montanha, conforme `regionAt`.
  - Tudo atrás de `AUD.on`.
- [ ] **Step 4: Run.** Expected: PASS.
- [ ] **Step 5: Checkpoint.**

### Task 9: Rádio Quartel com faixa CC0 (R11)

**Files:**
- Modify: `STATIONS` (entrada `91.5`, hoje `kind: 'march'`); a função de agendamento do rádio gerado (`schedule`, com `march`, `synth`, `broadcast`, `blips` e `pads`); `#drawer` (créditos)
- Create: `$S/proto/music/<faixa>.ogg` (ou `.mp3`, se o original vier assim; até 4 MB)
- Test: `$S/e2e/run.mjs`

**Interfaces:**
- Consumes: `STATIONS[i].gain` da Tarefa 6.
- Produces: `STATIONS[1] = { f: '91.5', name: 'Rádio Quartel · <título>', track: '<arquivo sem extensão>', by: '<autor>', gain: <n> }`.

- [ ] **Step 1: Shortlist.**
  - Procure no OpenGameArt faixas com licença **CC0** que sejam marciais ou épicas (orquestra, tambores, metais).
  - Separe três, cada uma com título, autor, link, licença e tamanho.
  - Baixe para `$S/music-dl/`, uma pasta nova por faixa. A permissão do Luis para faixas CC0 já existe, mas informe nome, origem e tamanho na mensagem.
- [ ] **Step 2: Approval gate.** Envie ao Luis um trecho de 20 s de cada uma (SendUserFile) e **espere a escolha**. Sem aprovação, a tarefa para aqui.
- [ ] **Step 3: Write the failing test** `rádio: Rádio Quartel toca a faixa escolhida e o gerador de marcha não existe mais`.
  - A estação 91.5 tem `station === 'track'` e `src === 'music/<arquivo>'`.
  - Depois de 2,5 s, `bus['música'].rms` fica em −22 ± 1.
  - `bus['rádio'].rms === -120`.
  - O texto da gaveta contém o autor da faixa.
- [ ] **Step 4: Run.** Expected: FAIL.
- [ ] **Step 5: Implement.**
  - A faixa entra em `STATIONS` e em `build-v3.mjs`, que já copia `proto/music`.
  - Remova os geradores `march`, `synth`, `broadcast`, `blips` e `pads`, e também o agendador, se nada mais o usar.
  - Ajuste `gain` até a meta.
  - Acrescente o crédito na gaveta: "<título>, de <autor> (CC0, OpenGameArt)".
- [ ] **Step 6: Run** o teste novo e `"interface: rádio liga e desliga"`. Expected: PASS.
- [ ] **Step 7: Checkpoint.** Incluir o arquivo de música na cópia para `.superpowers/proto/music/`.

### Task 10: HUD com o celular deitado (R12)

**Files:**
- Modify: CSS do template (`@media (max-height: 500px)`, ao lado do `@media (max-width: 720px)` existente)
- Test: `$S/e2e/run.mjs`

**Interfaces:**
- Produces: nenhuma mudança de JS. Todos os seletores do HUD continuam iguais.

- [ ] **Step 1: Write the failing test** `HUD: sem sobreposição no computador, no celular em pé e deitado`.
  - Use a mesma checagem de `qa.mjs` (seção `hud`). Elementos: `.tc`, `#mission`, `.tools`, `#lift`, `.zoom`, `.dash`, `#radio`, `#toast`, `#guide`, `#sp`, `#start`, `#finale`. Contam só os visíveis com texto, e a sobreposição vale a partir de 4 px nos dois eixos.
  - Telas: 1280×720, 375×812 e 812×375.
  - Momentos: chegada e 4 s depois em cada era, a Marginal e o showroom.
  - Giro: em 375×812, entre na Colmeia e mude para 812×375 sem recarregar; checagem limpa.
- [ ] **Step 2: Run.** Expected: FAIL (812×375 com 3 a 6 sobreposições por cena).
- [ ] **Step 3: Implement.**
  - Com `max-height: 500px`:
    - `.mission` vai para baixo e fica centralizada, com largura máxima de 46vw e fonte 0.68rem.
    - O título de era (`.toast`) fica em `top: 34%` com fonte de até 1rem.
    - `.tc` vira uma linha só.
    - `#guide` fica em `top: 8px`, entre `.tc` e `.tools`.
    - `.finale` encolhe e fica acima de `#radio` e `.dash`.
  - Ajuste pelos números do teste.
- [ ] **Step 4: Run** o teste novo e `"mobile 375×812"`. Expected: PASS.
- [ ] **Step 5: Checkpoint.**

### Task 11: Auditoria com metas, fotos e publicação

**Files:**
- Modify: `$S/e2e/qa.mjs` (metas e código de saída), `$S/e2e/tour.mjs` (fotos da serra da Tarefa 2 e da vala)
- Modify: `docs/superpowers/specs/2026-10-15-salto-88-design.md` (som, HUD deitado, vala)

- [ ] **Step 1: Add the gates.** `qa.mjs` sai com código 1 se alguma meta R1, R6–R10 ou R12 falhar, imprimindo cada meta como `OK` ou `FALHOU` com o valor medido.
- [ ] **Step 2: Run** `node e2e/qa.mjs` (todas as seções). Expected: todas as metas da parte 1 `OK`, código 0.
- [ ] **Step 3: Run** a suíte inteira (`node e2e/run.mjs`). Expected: 67 + 10 testes novos, todos PASS.
- [ ] **Step 4: Run** `node e2e/tour.mjs`. Revise as fotos da serra, da vala e do HUD deitado e anexe ao relatório.
- [ ] **Step 5: Publish.** Copie `proto/salto88.html` para `$S/salto88.html` e publique no artifact `9Coz7zxBop4m3egyB7JKcU` (mesmo caminho de arquivo), incluindo a música nova em `files`.
- [ ] **Step 6: Commit** a spec atualizada:
  ```bash
  git add docs/superpowers/specs/2026-10-15-salto-88-design.md
  git commit -m "docs: Salto 88 part 1 defects fixed (sound mix, trench, HUD landscape)"
  ```
