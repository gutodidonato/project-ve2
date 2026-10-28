# Salto 88: paradas que explicam — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** o visitante vê a parada chamar a 40 m e, parado na vaga da RedBit, vê cada item do painel acontecer num lugar do bairro, item por item. Sem número, sem slogan, sem texto novo além de "Próximo".

**Architecture:**
- **Conteúdo.** `tools/kiosk-content.mjs` ganha os `beats` de cada parada, lidos de `proto/kiosk-map.json`, validados e resolvidos no build. Eles chegam ao jogo dentro de `KIOSK_DATA`.
- **Molde, no template.** Quatro peças:
  - um registro de lugares por era (`beatPlace`);
  - o estado dos beats no quiosque (`KB`), com câmera, destaque e controle;
  - a chegada que chama (`call` no `addStop`);
  - o modo automático da demo.
- **RedBit.** Cinco lugares registram suas âncoras: `bancada`, `conversoes`, `ecoponto`, `vistoria` e `fiap-telao`. A parada ganha o `call`.
- **Testes.** Seções novas em `e2e/kiosk-check.mjs`, rodadas por `e2e/kiosk.sh`.

**Tech Stack:** three r128 num HTML único (`proto/salto88v3.template.html`, cerca de 6,7 mil linhas), Node 22 (`node --test`, lê `.ts`), Playwright com SwiftShader, `python -m http.server`.

**Spec:** `docs/superpowers/specs/2026-10-28-salto-88-paradas-que-explicam-design.md`

## Global Constraints

- **Onde se trabalha.** No laboratório `.superpowers/salto88-lab` (repositório git próprio, branch `master`). O build sai em `public/salto88`, no repositório do site, branch `salto-88`.
- **Build.** A partir do lab: `bash e2e/idle.sh node build-v3.mjs D:/Projetos/Luis/project-ve2/.superpowers/salto88-lab D:/Projetos/Luis/project-ve2/public/salto88`. Nunca rodar o build com um servidor de teste de pé.
- **Como rodar.** Todo teste e todo build rodam em 1 núcleo Idle (`e2e/idle.sh`). Com o OK do Luis, vale `export SALTO_CORES=4 SALTO_PRIO=BelowNormal` até ele avisar que vai jogar.
  - Um servidor de teste por vez.
  - Ao final, nenhum `chrome-headless-shell` nem `python http.server` de teste fica vivo.
  - Não matar o `python` do `D:/Projetos/Mugen/engine/tools/run_suite.py` nem os `node` do Codex.
  - Nunca abrir Godot nem outros apps pesados.
- **Teste novo.** Cada teste novo é visto falhar antes da mudança: `git show HEAD:public/salto88/index.html > public/salto88/_old.html`, rodar a seção contra `_old.html`, apagar o arquivo depois.
- **Template.** Edições em Python usam `open(..., newline='')`. Nunca `//` no meio de uma linha de código, só `/* */`. Nada aloca por frame: vetores de trabalho criados uma vez, canvas redesenhado só quando muda.
- **Texto.** Só de `content/pt/profile.ts`, dos `LABELS` e dos textos que o jogo já tem. Único rótulo novo: `item: 'Próximo'`, usado como `Próximo · <n>/<total>`. Nenhum número de desempenho em cena nova. Nenhum telefone. Nenhum fetch de terceiros.
- **Números (spec).**
  - Chegada: liga a ≤ 40 m indo para a vaga e desliga a > 60 m; sobe em 0,6 s e desce em 1 s.
  - Troca de beat: 1,2 s com ease in-out; num trajeto acima de 30 m, arco até 18 m de altura.
  - Itens fora de foco: 55% de opacidade.
  - Demo: um item a cada 6 s e mais 6 s depois do último.
  - Celular em pé: a câmera recua 1,6x.
- **RedBit (coordenadas do mundo).**
  - Vaga: x 8,75, z 57,5, h 0.
  - Vidro do escritório: plano em x 11,46, z 53,4 a 72,6, y 0 a 7, virado para -x.
  - Bicicletário: (8,6; 66,4).
  - Rua das Conversões: pórticos em x 13, 22,5 e 31 sobre a rua z 0; Loja Exemplo de x 22 a 31, com a frente em z 11,2; carrinho em (25,7; 9,0).
  - Telão da FIAP: centro (-16,25; 9,9; 66), virado para +x.
  - Cor da era: `0xff3ea5`.
- **Fluxo.** Só Claude, sem DeepSeek.
  - Commits no lab e no site terminam com `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
  - Cada tarefa faz commit no lab e, depois do build, commit de `public/salto88/index.html` no site (`build(salto88): …`).
  - Sem push, PR ou main sem OK novo do Luis.
- **Arquivo novo no lab** precisa de uma linha `!/<caminho>` no `.gitignore` (lista branca). Este plano não cria arquivo novo no lab.

## Review Focus

1. **Troca de era (portal) com um beat no ar.** O lugar da era velha recebe `stop()`, `KB` zera e o registro de lugares começa vazio na era nova; nenhum `pageerror`. Teste na Tarefa 2 (`beats`).
2. **Cliques rápidos em "Próximo" durante a viagem da câmera.** A câmera parte de onde está, sem salto, e cada lugar que recebeu `play()` recebe um `stop()`. Teste na Tarefa 2 (`beats`).
3. **Modo Foto (F) no meio de um beat.** O painel some. Ao sair do modo Foto, o painel volta e a câmera volta ao beat atual. Teste na Tarefa 2 (`beats`).
4. **Tecla de dirigir (W) no meio de um beat.** O quiosque fecha, o lugar recebe `stop()`, a câmera volta para trás do carro e o carro anda. Teste na Tarefa 2 (`beats`).
5. **Girar o celular no meio de um beat.** O layout troca e o item atual e os dois botões continuam dentro do painel. Teste na Tarefa 8 (`celular-beats`).

---

### Task 1: Beats no conteúdo

**Files:**
- Modify: `tools/kiosk-content.mjs` (`buildKiosk`, comentário do mapa)
- Modify: `proto/kiosk-map.json` (`redbit.beats`)
- Test: `e2e/kiosk-content.test.mjs`

**Interfaces:**
- Produces:
  - `KIOSK[id].beats: Array<{ item: string, kind: 'bullet'|'case'|'video', index: number, place: string }>`, com `[]` em toda parada sem beats. `index` é a posição na lista que o painel mostra: em `bullets` já filtrados por `omitMetrics`, em `cases`, e 0 para o vídeo.
  - `LABELS.item === 'Próximo'`.

- [ ] **Step 1: Escrever os testes.**
  - `test('the RedBit beats come out resolved')`:
    - `KIOSK.redbit.beats` é deepEqual a:
      ```js
      [{ item: 'bullet:0', kind: 'bullet', index: 0, place: 'bancada' },
       { item: 'bullet:1', kind: 'bullet', index: 1, place: 'conversoes' },
       { item: 'case:oceans-20', kind: 'case', index: 0, place: 'ecoponto' },
       { item: 'case:vistoria-porto-seguro', kind: 'case', index: 1, place: 'vistoria' },
       { item: 'video', kind: 'video', index: 0, place: 'fiap-telao' }]
      ```
    - `KIOSK.redbit.bullets[0] === 'Criei e otimizei sites com foco em responsividade e SEO.'`;
    - para todo outro id, `KIOSK[id].beats` é deepEqual a `[]`.
  - No teste `'the build stops on…'`, acrescentar `assert.throws` para:
    - `redbit` com `bullet:2`: `/kiosk: redbit:.*bullet:2/`;
    - `redbit` com `case:migracao-gcp-aws`: `/kiosk: redbit:.*migracao-gcp-aws/`;
    - `patio` com `{ beats: [{ item: 'video', place: 'x' }] }`: `/kiosk: patio:.*video/`;
    - `redbit` com `item: 'foo'`: `/kiosk: redbit:.*foo/`;
    - `redbit` com um beat sem `place`: `/kiosk: redbit:.*place/`.
  - No teste `'the real profile and map…'`, o `LABELS` passa a ser `{ next: 'Próxima parada', drive: 'Dirigir', did: 'O que fiz', item: 'Próximo' }`.
- [ ] **Step 2: Ver falhar.** `bash e2e/idle.sh node --test e2e/kiosk-content.test.mjs`. Esperado: FAIL em `beats` undefined e no `LABELS`.
- [ ] **Step 3: Implementar.**
  - Em `buildKiosk`, cada beat de `m.beats || []` é validado contra o que o painel da parada mostra (bullets filtrados, `cases`, `video`). Falha com `fail(id, 'beat "<item>" …')`; um beat sem `place` falha com `'beat sem place'`.
  - Escrever os 5 beats da RedBit no `kiosk-map.json`, na ordem do teste.
  - Atualizar o comentário do mapa no topo do módulo.
- [ ] **Step 4: Ver passar.** Mesmo comando. Esperado: todos PASS.
- [ ] **Step 5: Commit no lab:** `feat(kiosk): beats per stop in the kiosk content`.

### Task 2: O molde no quiosque (beats, câmera, controle, plano B)

**Files:**
- Modify: `proto/salto88v3.template.html`. Partes tocadas:
  - CSS de `.kiosk`;
  - o bloco "the stop kiosk" (`KS`, `kioskFrame`, `openKiosk`, `closeKiosk`, botões);
  - `stopLeave`;
  - a câmera (o ramo `if (KS.open)` perto de `pullIn`);
  - o `keydown` global;
  - a construção da era (zerar o registro);
  - a API de debug.
- Test: `e2e/kiosk-check.mjs`, seções `beats` e `planob`, e o comentário do topo.

**Interfaces:**
- Consumes: `KIOSK_DATA.KIOSK[id].beats`, `KIOSK_DATA.LABELS.item` (Tarefa 1).
- Produces:
  - `beatPlace(id: string, p: { cam: { pos: [x,y,z], look: [x,y,z] }, play(): void, stop(): void, state?(): object }): void`. Registra no objeto `BEATS`, que é zerado no começo da construção de cada era.
  - `KB = { on, auto, i, n, list, t, k, fromPos, fromLook, toPos, toLook }`, com os quatro pontos como `THREE.Vector3` criados uma vez.
  - `beatGo(i: number): void` e `beatStep(d: 1|-1): void`.
  - Debug:
    - `__salto.beats()` → `{ on, auto, i, n, place, ok, label, lit, dim, cam: [x,y,z], look: [x,y,z], stub: { [id]: { play, stop } } }`. `ok` diz se o lugar do beat está registrado; `lit` é o índice do elemento com `.beat-on`; `dim` conta os `.beat-dim`; `cam` é `camera.position`.
    - `__salto.beatScene(id)` → `BEATS[id].state()` ou `null`.
    - `__salto.beatTest(id, cam|null)` registra um lugar de teste que conta `play` e `stop` em `stub[id]`; com `null`, tira o lugar do registro.

- [ ] **Step 1: Escrever as seções.**
  - `beats` (960x540, era redbit). Antes de estacionar, `beatTest` registra os 5 lugares da RedBit com estas câmeras:
    - `bancada`: pos [6,2,62], look [11,1.8,60];
    - `conversoes`: pos [27,6,-4], look [26,1.6,10];
    - `ecoponto`: pos [5,2.5,47], look [9.8,1,50];
    - `vistoria`: pos [5,2.5,69], look [8.6,0.8,66.4];
    - `fiap-telao`: pos [-3,9,72], look [-16,9.9,66].
    
    Depois `park(page, 1, 'redbit')`. Asserções, em ordem:
    1. `on`, `i 0`, `n 5`, `lit 0`, `dim 4` e `label === 'Próximo · 2/5'`.
    2. `adv 1.5`: `cam` a < 1 m de [6,2,62].
    3. Clique em `#kNext`: `i 1`, `stub.bancada` `{ play: 1, stop: 1 }`, `stub.conversoes.play 1`. `adv 0.6`: `cam[1] > 15` (arco, trajeto acima de 30 m). `adv 1`: `cam` a < 1 m de [27,6,-4].
    4. Três cliques em `#kNext` em 0,2 s: `i 4`. Para cada stub, `play - stop` é 1 no atual e 0 nos outros.
    5. `label === 'Próxima parada'`.
    6. `ArrowLeft`: `i 3`. `ArrowRight`: `i 4`. O carro andou < 0,1 m e o quiosque segue aberto.
    7. Clique no 2º `.case`: `i 3`. Clique no 1º `li`: `i 0`.
    8. `KeyF` (modo Foto): `#kiosk` escondido. `KeyF` de novo: `#kiosk` visível e, depois de `adv 1.5`, `cam` a < 1 m da câmera do beat 0.
    9. `Escape`: `on false`, `play === stop` em todos os stubs. `adv 1`: câmera atrás do carro (kiosk fechado, `cam` a < 12 m do carro).
    10. Estacionar de novo: `i 0`. `W` segurado 1 s: quiosque fechado, `stub.bancada.stop === stub.bancada.play` e o carro andou > 1 m.
    11. Estacionar de novo, ir ao item 5 e clicar em "Próxima parada": `tour().on`, alvo `animacoes`.
    12. Estacionar de novo e `H.goto(2)`: `beats().on false` e nenhum `pageerror` na página.
  - `planob`: `beatTest` para todos menos `conversoes`, depois estacionar e clicar em "Próximo". Asserções: `ok false`, `i 1`, `lit 1`, e `kiosk().camPos` a < 1 m do enquadramento da parada (o mesmo valor que dá com o quiosque aberto sem beats).
- [ ] **Step 2: Ver falhar.** Rodar `bash e2e/kiosk.sh _old.html beats,planob`. Esperado: FALHOU, `beatTest is not a function`.
- [ ] **Step 3: Implementar.**
  - **CSS.** `.kiosk .beat-on` ganha `box-shadow: inset 3px 0 0 #ff3ea5` (a cor da era, via variável que o `openKiosk` define a partir de `S.era.accent`) e um fundo leve. `.kiosk .beat-dim` ganha `opacity: .55`. Os elementos são os `li` de `#kList`, os `.case` de `#kCase` e `#kVid`.
  - **`openKiosk`.** Quando `d.beats.length`, liga `KB` (com `i 0` e `auto false`), monta a lista de elementos por beat (`li[index]`, `.case[index]`, `#kVid`) e chama `beatGo(0)` depois de `layoutKiosk()`.
  - **`beatGo(i)`.**
    - Chama `stop()` do lugar anterior, se havia um tocando.
    - Põe as classes e rola o painel até o elemento, com `el.scrollTop` calculado pelo `offsetTop` e não por `scrollIntoView`.
    - `#kNext` recebe `LABELS.item + ' · ' + (i + 2) + '/' + n` enquanto `i < n - 1`, e `LABELS.next` no último.
    - `fromPos`/`fromLook` = câmera atual (`camPos`/`camLook`). `toPos`/`toLook` = `cam` do lugar, ou o `kioskFrame()` da parada no plano B. `k = 0`.
    - Chama `play()` do lugar.
  - **Câmera.** Com `KB.on`, `k = min(1, k + dt / 1.2)` e `e = k < .5 ? 2k² : 1 - (-2k + 2)² / 2`.
    - `KS.pos` = lerp(from, to, e). Se `fromPos.distanceTo(toPos) > 30`: `y += max(0, 18 - y) * sin(π e)`.
    - `KS.look` = lerp. Com folha de celular (`KS.sheet`), aplicar o mesmo recuo de 1,6x no destino.
    - Com lugar registrado, `kk = 1` e sem `pullIn`. No plano B, o caminho de hoje.
  - **Controles.**
    - `#kNext`: `beatStep(1)` enquanto há próximo; senão `closeKiosk('next')`.
    - Enter global: o mesmo que `#kNext`.
    - `ArrowRight`/`ArrowLeft`, com `KB.on`: `preventDefault`, `beatStep(±1)` (`ArrowRight` no último fecha com `'next'`, `ArrowLeft` no primeiro não faz nada), `S.idle = 0`. Não entram em `keys`, então não contam como dirigir.
    - Clique num elemento: `beatGo(índice)`. No `#kVid`, o clique só alterna o som quando o vídeo já é o item atual.
  - **Fechar.**
    - `closeKiosk` e a troca de era chamam `stop()` do lugar atual e desligam `KB`.
    - `stopLeave` já passa por `closeKiosk`.
    - O modo Foto não mexe em `KB`.
  - Debug conforme a interface.
- [ ] **Step 4: Ver passar.** Rebuild, depois `bash e2e/kiosk.sh index.html beats,planob`. Esperado: tudo ok. Rodar também `quiosque,dirigir,teclas,botoes`. Esperado: ok, sem regressão.
- [ ] **Step 5: Commit** no lab (`feat(kiosk): beats — the place explains, item by item`) e no site.

### Task 3: A chegada que chama (e o radar fora da RedBit)

**Files:**
- Modify: `proto/salto88v3.template.html`:
  - `addStop` (opção `call`);
  - `updateStops` (o cálculo da chegada);
  - o `addStop` da RedBit (`call` e `onArrive` sem `MISSION_RADAR`);
  - debug.
- Test: `e2e/kiosk-check.mjs`, seções `chegada` e `radar`.

**Interfaces:**
- Produces:
  - `addStop(g, { …, call: { lights: Array<{ mat, rest: number, peak: number, prop: 'opacity'|'color', flicker?: boolean }>, people: number /* raio em m */, path: true } })`.
  - O estado vai para `st.call = { on, k, …, path: Mesh }`.
  - Debug: `__salto.call()` → `{ [stopId]: { on, k, lights: number[] /* valor atual de cada luz */, path: number /* opacidade */, people: Array<{ uid, h, h0, toRoad: boolean }> } }`.

- [ ] **Step 1: Escrever as seções.**
  - `chegada` (era redbit, `freeze`): teleportar o carro 70 m atrás da vaga, no eixo dela, com h 0 e 8 m/s, e avançar até a distância ficar ≤ 35 m. Asserções:
    - `on`, `k === 1` depois de mais 0,7 s, `lights[i] > rest` em todas, `path > 0.5`;
    - toda pessoa a ≤ 9 m da vaga, parada, tem `toRoad`, com |h − rumo ao carro| < 0,5 rad.
    
    Depois:
    - Teleportar a 50 m, se afastando a 3 m/s: `on` continua.
    - Teleportar a 70 m: depois de 1,2 s, `k === 0`, `path === 0` e cada pessoa com |h − h0| < 0,1.
    - Teleportar a 50 m, vindo em direção à vaga, e avançar 0,5 s: `on false` (a histerese não liga entre 40 e 60 m).
  - `radar` (página nova, radar sem melhor tempo): estacionar na RedBit. `#mission` não contém `radar de carregamento`.
- [ ] **Step 2: Ver falhar.** `bash e2e/kiosk.sh _old.html chegada,radar`. Esperado: FALHOU, `call is not a function`, e o radar aparece na missão.
- [ ] **Step 3: Implementar.**
  - **Regra de ligar e desligar.** `d` é a distância do carro à vaga. Liga com `d ≤ 40` e (velocidade em direção à vaga > 0,5 m/s ou `d < 12`). Desliga com `d > 60`. Entre os dois, mantém o estado.
  - **Brilho.** `k` sobe `dt/0.6` e desce `dt/1`.
  - **Luzes.** Interpolam `rest` → `peak`. Com `flicker`, nos primeiros 0,35 s da subida o valor alterna entre `rest` e `peak` a cada 0,07 s.
  - **Pessoas.** As de `PEOPLE` a ≤ `people` m da vaga e sem `walking` guardam `p.callH0` ao ligar e giram até o rumo do carro na taxa `PEOPLE_TURN`. Ao desligar, voltam a `callH0`.
  - **Caminho.** Uma malha mesclada, criada uma vez por parada: tracejado de 0,6 m a cada 1,2 m, 0,35 m de largura, de 3 a 15 m atrás da vaga no eixo dela, `MeshBasicMaterial` na cor da era, `opacity = 0.85 k`, `depthWrite false`. Invisível com `k === 0`.
  - **RedBit.**
    - `call.lights`: a cor do neon (`rest 0.7`, `peak 1`, `flicker`), a opacidade do `glow` (`0.5` → `0.9`) e a cor do vidro (`0.85` → `1`). Em repouso, o neon e o vidro ficam nos valores `rest`.
    - `people: 9`, `path: true`.
    - `onArrive` deixa de chamar `MISSION_RADAR`.
  - O cálculo da chegada só roda para paradas com `call`, sem alocar.
- [ ] **Step 4: Ver passar.** Rebuild, depois `bash e2e/kiosk.sh index.html chegada,radar,vaga`. Esperado: tudo ok.
- [ ] **Step 5: Commit** no lab (`feat(stops): the place calls as the car comes; RedBit drops the radar mission`) e no site.

### Task 4: A bancada e o telão da FIAP

**Files:**
- Modify: `proto/salto88v3.template.html`, bloco "L2: the RedBit office" (bancada) e "L1: the FIAP campus" (`fiap-telao`).
- Test: `e2e/kiosk-check.mjs`, seção `cenas`, subpartes `bancada` e `telao`.

**Interfaces:**
- Consumes: `beatPlace` (Tarefa 2).
- Produces:
  - `beatPlace('bancada', …)`, com `state()` → `{ step: 0|1|2|3, cols: [3,2,1], draws: number, playing: boolean }`.
  - `beatPlace('fiap-telao', …)`, com `state()` → `{ playing: boolean, video: 'fiap', t: number }`.

- [ ] **Step 1: Escrever a seção `cenas`, subpartes `bancada` e `telao`.** Na RedBit, estacionar.
  - **`bancada`:**
    - Com `beatScene('bancada')`, amostrar a cada 0,25 s durante 6,5 s. Os `step` vistos incluem 0, 1, 2 e 3 em ordem, e `cols` é deepEqual a [3,2,1].
    - `draws` cresce exatamente 1 por troca de `step`.
    - Depois de `Escape`: `playing false`, `step 3` (repouso: os três aparelhos com o site) e `draws` não muda em mais 2 s.
  - **`telao`:** ir ao item 5. `playing` true e `t < 2`.
- [ ] **Step 2: Ver falhar.** `bash e2e/kiosk.sh _old.html cenas`. Esperado: FALHOU (`beatScene` não existe).
- [ ] **Step 3: Implementar.**
  - **`bancada`, a tela.** Um `plCan(1024, 512)` num plano de 3,2 x 1,6 m em x 11,41 (5 cm na frente do vidro), y 1,75, z 59,7, rotação -π/2. É pintado como a vista através do vidro: fundo do open space, mesa, monitor largo, tablet e celular, com o mesmo tom e o reflexo diagonal do canvas `vidro`, e o montante do vidro por cima.
  - **`bancada`, o site de mentira.** Barra do topo, um bloco de destaque e blocos em grade com 3 colunas no monitor, 2 no tablet e 1 no celular (menu como ☰ de três barras, sem texto).
  - **`bancada`, o loop.** Passo a cada 1,5 s: no passo 0 o monitor monta o site, no 1 o tablet, no 2 o celular, e no 3 os três ficam prontos; depois recomeça. Redesenha só na troca de passo. `stop()` volta ao passo 3 e para o loop.
  - **`bancada`, a câmera.** Inicial `{ pos: [6.2, 2.4, 62.4], look: [11.4, 1.8, 59.7] }`. As fotos da Tarefa 8 podem ajustar.
  - **`fiap-telao`.** `play()` faz `currentTime = 0` e `play()` no vídeo do telão. `stop()` não faz nada, porque o telão continua tocando como cenário. Câmera inicial `{ pos: [-3, 9, 72], look: [-16.25, 9.9, 66] }`.
- [ ] **Step 4: Ver passar.** Rebuild, depois `bash e2e/kiosk.sh index.html cenas,beats`. Esperado: tudo ok.
- [ ] **Step 5: Commit** no lab (`feat(redbit): the desk behind the glass and the FIAP screen as beats`) e no site.

### Task 5: A compra na Rua das Conversões

**Files:**
- Modify: `proto/salto88v3.template.html`, `placeConversions` (`fire` ganha `quiet`, lugar `conversoes`).
- Test: `e2e/kiosk-check.mjs`, seção `cenas`, subparte `compra`.

**Interfaces:**
- Consumes: `beatPlace` (Tarefa 2), `spawnPerson`, `Person.walkTo`, `Person.play`.
- Produces:
  - `fire(k: 0|1|2, quiet?: boolean)`. Com `quiet`: sem `toast`, sem `setMission` e sem `tripRec`. O resto (pórtico, faixa, tela de eventos, contador) fica igual.
  - `beatPlace('conversoes', …)`, com `state()` → `{ phase: 'rest'|'vitrine'|'carrinho'|'porta'|'dentro', fired: string[], person: { x, z, visible } }`.

- [ ] **Step 1: Escrever a subparte `compra`.** Estacionar na RedBit, guardar `trip().rec.conv` e ir ao item 2. Amostrar `beatScene('conversoes')` a cada 0,25 s por 14 s. Asserções:
  - `fired` começa com `['page_view', 'add_to_cart', 'purchase']`;
  - as fases aparecem na ordem `vitrine`, `carrinho`, `porta`, `dentro`;
  - `trip().rec.conv` não mudou;
  - nenhum `#toast` com "Conversão registrada" apareceu.
  
  Depois de `Escape`: `phase 'rest'` e a pessoa de volta ao ponto de partida (< 0,2 m).
- [ ] **Step 2: Ver falhar.** `bash e2e/kiosk.sh index.html cenas` com o build da Tarefa 4. Esperado: FALHOU (`beatScene('conversoes')` null).
- [ ] **Step 3: Implementar.**
  - **A pessoa.** Uma por era (`spawnPerson`, roupa civil, `anim 'idle'`), parada em (33, 9,6) olhando para -x quando o lugar está em repouso.
  - **`play()`, a compra.**
    1. Anda até (27,8; 9,6), olha para +z (a vitrine), `fire(0, true)`, espera 1,5 s.
    2. Anda até (25,7; 9,6), `play('interact-right')`, `fire(1, true)`, espera 1,2 s.
    3. Anda até a porta (x 23,5, z 10,8), `fire(2, true)`.
    4. Fase `dentro`: esconde com `p.boarded = true`, a regra que `updatePeople` já usa, por 2 s.
    5. Volta ao repouso e recomeça.
    
    O loop leva ≤ 14 s.
  - **`stop()`.** Corta o `walkTo`, `boarded false`, a pessoa volta a (33, 9,6) em `idle` e a fase vai para `rest`.
  - **Câmera inicial.** `{ pos: [28, 5.5, -3], look: [26.5, 1.6, 10.5] }`.
- [ ] **Step 4: Ver passar.** Rebuild, depois `bash e2e/kiosk.sh index.html cenas`. Esperado: tudo ok. No `run.mjs`, rodar o filtro das Conversões (`node e2e/run.mjs <url> 'Conversões'`). Esperado: ok; o carro passando pelos pórticos segue igual.
- [ ] **Step 5: Commit** no lab (`feat(redbit): a shopper fires the tags as a beat`) e no site.

### Task 6: O ecoponto e a vistoria

**Files:**
- Modify: `proto/salto88v3.template.html`, bloco "L2: the RedBit office": cenas novas perto da vaga, com uma função `parkedBike(kit, colour)` sem ciclista, montada com as mesmas peças do quadro de `bikeKit`.
- Test: `e2e/kiosk-check.mjs`, seção `cenas`, subpartes `ecoponto` e `vistoria`.

**Interfaces:**
- Consumes: `beatPlace`, `spawnPerson`, `bikeKit()`, `cityBike(kit, i)`.
- Produces:
  - `beatPlace('ecoponto', …)`, com `state()` → `{ phase: 'rest'|'foto'|'chega'|'coleta'|'sai', bag: boolean, bike: { x, z } }`.
  - `beatPlace('vistoria', …)`, com `state()` → `{ phase: 'rest'|'foto'|'caixa'|'mostra', box: { visible, min: [x,y,z], max: [x,y,z] }, bike: { min, max } }`.

- [ ] **Step 1: Escrever as subpartes.**
  - **`ecoponto`:** estacionar e ir ao item 3. Amostrar por 12 s. Asserções:
    - as fases aparecem na ordem `foto`, `chega`, `coleta`, `sai`;
    - `bag` é true antes de `coleta` e false depois;
    - na fase `coleta`, a bicicleta está a < 1,5 m das lixeiras.
    
    Depois de `Escape`: `rest`, `bag` true e a bicicleta fora de cena.
  - **`vistoria`:** ir ao item 4. Na fase `mostra`, `box.visible` e a caixa envolve a bicicleta: `box.min ≤ bike.min` e `box.max ≥ bike.max` nos 3 eixos, com folga ≤ 0,3 m por lado. Depois de `Escape`: `box.visible false`.
  - **Colisão:** o carro estacionado na vaga não encosta em nada novo. Teleportar para 8 m antes e estacionar de novo segue dando `active`.
- [ ] **Step 2: Ver falhar.** `bash e2e/kiosk.sh index.html cenas`. Esperado: FALHOU nas duas subpartes.
- [ ] **Step 3: Implementar.**
  - **Ecoponto, o lugar.** 3 lixeiras (0,6 x 1,0 x 0,6 m, verde, azul e amarela, `kitGeo`, um draw) na calçada, entre o meio-fio e a faixa das pessoas (x 10, que fica livre): x 8,9, z 49,2 / 49,9 / 50,6, ajustando ao meio-fio real. Colisor só nelas. Um saco (esfera achatada escura) junto às lixeiras.
  - **Ecoponto, a cena.** Uma pessoa em (9,4; 51,6) fotografa o saco: `holding-both`, com um celular (caixa 0,08 x 0,15 x 0,01) na mão direita enquanto fotografa. Depois, uma bicicleta de carga (`cityBike` com um caixote de 0,7 x 0,45 x 0,6 m sobre a roda da frente) vem pela calçada (x 8,3) desde z 38, para nas lixeiras, o saco some (`coleta`, 1 s) e ela volta para z 38 e se esconde. Ela nunca passa pela vaga. O loop leva ≤ 12 s.
  - **Ecoponto, `stop()`.** Saco de volta, bicicleta escondida, pessoa em `idle`. Câmera inicial `{ pos: [5, 2.6, 46.5], look: [9.8, 1, 50] }`.
  - **Vistoria, o lugar.** Uma `parkedBike` presa no bicicletário (8,6; 66,4), alinhada ao rack.
  - **Vistoria, a cena.** Uma pessoa em (9,7; 64,9) fotografa a bicicleta (`holding-both` e celular). Uma moldura na cor da era (4 arestas finas, ou `LineSegments` de uma caixa) se desenha de canto a canto em 0,6 s em volta da caixa da bicicleta (folga de 0,1 m), fica 2,5 s (`mostra`) e some. O loop leva ≤ 6 s.
  - **Vistoria, `stop()`.** Moldura escondida, pessoa em `idle`. Câmera inicial `{ pos: [5, 2.4, 70], look: [8.6, 0.8, 66.4] }`.
  - Tudo criado uma vez por era. Nenhum texto.
- [ ] **Step 4: Ver passar.** Rebuild, depois `bash e2e/kiosk.sh index.html cenas,vaga,chegada`. Esperado: tudo ok.
- [ ] **Step 5: Commit** no lab (`feat(redbit): the recycling point and the bike check as beats`) e no site.

### Task 7: A demo em modo automático

**Files:**
- Modify: `proto/salto88v3.template.html`:
  - `updateStops` (abrir o quiosque também para a demo numa parada com beats);
  - `KB` (`auto`);
  - a entrada (tomar o controle);
  - os `waypoints` da era `sites`.
- Test: `e2e/kiosk-check.mjs`, seção `demo-beats`.

**Interfaces:**
- Consumes: `KB`, `beatGo`, `closeKiosk` (Tarefa 2), `tourRoad(st)`.
- Produces: `openKiosk(st, auto?: boolean)` e `closeKiosk('auto')`, que fecha sem tour e solta a espera da demo.

- [ ] **Step 1: Escrever a seção `demo-beats`.** Era redbit, depois `H.S.idle = 99; H.S.demo = true; H.S.wp = 0`.
  - Avançar em passos de 1 s até `kiosk().open` (no máximo 90 s). Asserções:
    - `beats().auto` e `i 0`;
    - contando da abertura: em t 6,2 s, `i 1`; em t 24,2 s, `i 4`;
    - em t 30,7 s, o quiosque está fechado e, em mais 10 s, o carro andou > 5 m.
  - **Segunda volta:** estacionado pela demo, com `i 1`, clicar no 1º `.case` (índice 2). Asserções:
    - `auto false`, `S.demo false`, `i 2` (o item clicado);
    - em mais 15 s, `i` segue 2, o quiosque segue aberto e o carro andou < 0,3 m.
- [ ] **Step 2: Ver falhar.** `bash e2e/kiosk.sh index.html demo-beats`. Esperado: FALHOU, a demo não estaciona na RedBit.
- [ ] **Step 3: Implementar.**
  - **Abrir para a demo.** `updateStops`: uma parada que fica ativa com `(!active || S.demo)` e com beats chama `openKiosk(st, true)`. Sem beats, segue com `showCard`.
  - **Avançar sozinho.** `KB.auto`: `t += dt`, e a cada 6 s, `beatGo(i + 1)`. 6 s depois do último, `closeKiosk('auto')`, que faz `S.dwell = 0` para a demo seguir o caminho.
  - **Caminho da demo.** Na era `sites`, os dois primeiros pontos são os mesmos que o tour usa para a vaga da RedBit: `tourRoad(st)` com `r 2.5, v 6`, depois a vaga com `r 1.2, v 3, dwell 999`. Os outros pontos de hoje vêm depois.
  - **Tomar o controle.** Com `KB.auto`, um clique ou toque no painel ou na tela e as teclas do quiosque (Enter, ←, →) fazem `KB.auto = false`, `S.demo = false`, `S.idle = 0` e `activate()`. O quiosque segue aberto no item atual, ou no item clicado.
  - **Ruling deste plano.** As teclas de dirigir (W, A, S, D, ↑, ↓) seguem a regra da §3.6 e devolvem o volante, fechando o quiosque. A §3.7 diz "qualquer tecla" mantém o quiosque; aqui prevalece a §3.6, porque quem aperta W quer dirigir. O Luis confirma na revisão do plano.
  - A regra do spec do quiosque continua: com o visitante estacionado, a demo não assume (`demoBlocked`).
- [ ] **Step 4: Ver passar.** Rebuild, depois `bash e2e/kiosk.sh index.html demo-beats,vaga,travado`. Esperado: tudo ok.
- [ ] **Step 5: Commit** no lab (`feat(kiosk): the demo plays the beats on its own`) e no site.

### Task 8: Celular, fotos e fechamento

**Files:**
- Modify: `proto/salto88v3.template.html` (o que as fotos pedirem: câmeras dos lugares, rolagem da folha).
- Test: `e2e/kiosk-check.mjs`, seções `celular-beats` e `fotos-beats`. As fotos vão para `e2e/beats/`, que é olhada e não versionada.
- Modify: `.superpowers/HANDOFF-salto88.md` (git-ignorado).

**Interfaces:**
- Consumes: tudo das Tarefas 2 a 7.

- [ ] **Step 1: Escrever `celular-beats`.** Em 375x812 e em 812x375: estacionar na RedBit e ir ao item 4. Asserções:
  - o retângulo do 2º `.case`, o de `#kNext` e o de `#kDrive` estão dentro do retângulo de `#kiosk`;
  - o carro e o `look` do beat ficam fora do painel.
  
  Girar de 375x812 para 812x375 com o quiosque aberto: as mesmas asserções.
- [ ] **Step 2: Ver falhar ou passar.** `bash e2e/kiosk.sh index.html celular-beats`. Onde falhar, corrigir a rolagem e o layout e rodar de novo.
- [ ] **Step 3: Escrever e rodar `fotos-beats`.** Fotos em 960x540 e em 375x812:
  - `00-chegada-40m`, `01-chegada-20m`;
  - um arquivo por beat: `1-bancada`, `2-conversoes`, `3-ecoponto`, `4-vistoria`, `5-fiap-telao`, cada um 2,5 s depois de entrar no beat.
  
  Dar nota de 0 a 10 a cada foto: o lugar reconhecível na parte livre da tela, a cena em ação e nada importante atrás do painel. Meta: ≥ 9 no desktop e ≥ 8 no celular. Abaixo disso, ajustar as `cam` dos lugares e as posições de cena em lote, rebuild e foto de novo, até 3 rodadas. O que sobrar vai para o relatório.
- [ ] **Step 4: Regressão, uma vez.**
  - Todas as seções de `kiosk-check`.
  - `bash e2e/idle.sh node --test e2e/kiosk-content.test.mjs`.
  - Os filtros de era da RedBit no `run.mjs` (`'RedBit'`, `'Conversões'`, `'guia'`).
  - `stops-end-check.mjs`.
  
  Esperado: tudo ok, salvo falhas que já existiam, citadas pelo nome.
- [ ] **Step 5: Fechar.**
  - Commit no lab (`build(salto88): beats framing per photo round`, se houve ajuste) e no site.
  - Matar os restos de teste.
  - Atualizar o `HANDOFF-salto88.md` com o novo estado: molde pronto e a RedBit com beats. A próxima parada é `patio`, em ordem do tour.
  - Sem push.
