# Salto 88: quiosque das paradas — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** ao parar numa vaga do Salto 88, a câmera enquadra o lugar e abre um painel com o conteúdo do perfil (cargo, período, o que fiz, case, vídeo). Dois botões levam ao tour guiado ("Próxima parada") ou devolvem o volante ("Dirigir"). O piloto da demonstração nunca mais sai dirigindo de uma vaga.

**Architecture:**
- **Conteúdo no build.** O `build-v3.mjs` lê `content/pt/profile.ts` e `proto/kiosk-map.json` por meio de um módulo puro, `tools/kiosk-content.mjs`, e injeta `KIOSK_DATA` no template, no marcador `__KIOSK__`.
- **Jogo.** O template ganha três peças:
  - uma regra única de bloqueio da demonstração (`demoBlocked()`);
  - o módulo do quiosque (`KS`, `openKiosk`, `closeKiosk`, o painel `#kiosk` e o modo de câmera);
  - o tour (`S.tour`), que reaproveita `autopilot()` com uma lista de pontos própria.
- **Testes.** Os do jogo ficam num arquivo só, `e2e/kiosk-check.mjs`, com seções no estilo de `stops-end-check.mjs`. Rodam por `e2e/kiosk.sh` num núcleo com prioridade Idle.

**Tech Stack:** three r128 num HTML único (template de cerca de 6,5 mil linhas), Node 22.23 (lê `.ts` direto, `node --test`), Playwright com SwiftShader, `python -m http.server`.

**Spec:** `docs/superpowers/specs/2026-10-26-salto-88-quiosque-das-paradas-design.md`

## Global Constraints

- **Onde se trabalha.** No laboratório `.superpowers/salto88-lab`, que é um repositório git próprio. O build sai em `public/salto88`, no repositório do site, branch `salto-88`.
- **Build.** A partir do laboratório: `bash e2e/idle.sh node build-v3.mjs D:/Projetos/Luis/project-ve2/.superpowers/salto88-lab D:/Projetos/Luis/project-ve2/public/salto88`
- **Como rodar.** Todo teste e todo build rodam em 1 núcleo com prioridade Idle (`e2e/idle.sh`), uma era por vez. Ao final, nenhum `chrome-headless-shell` nem `python` pode ficar vivo. Nunca abrir Godot nem outros apps pesados.
- **Teste novo.** Cada teste novo é visto falhar no build atual antes da mudança. Para isso: `git show HEAD:public/salto88/index.html > public/salto88/_old.html`, rodar contra `_old.html` e apagar o arquivo depois.
- **Texto.**
  - Vem de `content/pt/profile.ts`, mais os textos que o jogo já tem para o destaque de cada parada e para o Exército.
  - Rótulos fixos: "Próxima parada", "Dirigir", "O que fiz".
  - O jogo segue só em português.
  - Nenhum número de telefone.
- **Rede.** Sem busca em tempo de execução. Os vídeos saem de `proto/video/<nome>.webm` e o build os copia para `video/`.
- **Mapa** (spec §4):
  - `redbit`: cases `oceans-20` e `vistoria-porto-seguro`, vídeo `fiap`.
  - `animacoes`: vídeo `mobile`.
  - `valiantgroup`: vídeo `fullstack`.
  - `aman`: vídeo `aman`.
  - `comando`: vídeo `comemoracao`.
  - `sede-evig` e `assistente-evig`: case `arquitetura-llm-first`.
  - `aws-evig`: case `migracao-gcp-aws`.
  - `triagem-evig`: case `whatsapp-tech-provider`.
  - Sem métricas no painel.
- **Números.**
  - A câmera chega ao enquadramento em cerca de 0,8 s e volta para trás do carro em até 1 s.
  - O painel ocupa cerca de 40% da largura no desktop; no celular em pé, uma folha com até 50% da altura; com altura ≤ 500 px, uma coluna de 45%.
  - Tour: até 90 s por trecho e 150 s quando o trecho passa pelo portal.
- **Fluxo de trabalho.** Só Claude, sem DeepSeek.
  - Commits no lab e no site terminam com `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
  - Sem push, sem PR e sem mexer na main sem o OK do Luis.
- **Arquivo novo no lab.** Precisa de uma linha `!/<caminho>` no `.gitignore` do lab, que trabalha por lista branca.

## Review Focus

1. **Tour travado** (carro preso numa parede ou trânsito parado): passados 90 s no trecho, o tour para, um toast avisa e o controle volta ao visitante. O teste fica na Tarefa 4 (`travado`).
2. **Enter com o foco em "Dirigir"** precisa dirigir, não seguir para a próxima parada. A tecla Enter global só vale "Próxima parada" quando o foco não está num botão do quiosque. O teste fica na Tarefa 3 (`teclas`).
3. **Girar o celular com o quiosque aberto:** o painel troca de layout (coluna ou folha) e o lugar continua visível. O teste fica na Tarefa 3 (`celular`).
4. **Modo Foto com o quiosque aberto:** o painel some durante a foto e volta ao sair. O teste fica na Tarefa 3 (`foto`).
5. **Cartão de capítulo na fila:** um cartão de capítulo ou de evento que chegou com o quiosque aberto aparece depois que o quiosque fecha, nunca por cima dele. O teste fica na Tarefa 3 (`fila`).

---

### Task 1: Conteúdo do quiosque no build

**Files:**
- Create: `.superpowers/salto88-lab/tools/kiosk-content.mjs`
- Create: `.superpowers/salto88-lab/proto/kiosk-map.json`
- Create: `.superpowers/salto88-lab/e2e/kiosk-content.test.mjs`
- Modify: `.superpowers/salto88-lab/build-v3.mjs` (logo após o `replace('__FRAMES__')`)
- Modify: `.superpowers/salto88-lab/proto/salto88v3.template.html:279` (ao lado de `const FRAMES = __FRAMES__;`)
- Modify: `.superpowers/salto88-lab/.gitignore` (3 linhas `!/…`)

**Interfaces:**
- Produces:
  - `fmtPeriod(start: 'YYYY-MM', end: 'YYYY-MM' | null) -> string`. Meses em português de três letras, minúsculos: `jan fev mar abr mai jun jul ago set out nov dez`. Separador ` – `. Sem fim, `hoje`.
  - `buildKiosk({ profile, map, stopIds: string[], videos: string[] }) -> { KIOSK, CASES, LABELS }`. Lança `Error('kiosk: <stopId>: <problema>')`.
    - `KIOSK[id] = { head: string | null, period: string | null, bullets: string[], cases: string[], video: string | null, highlight: boolean }`. Com `company`, `head` é `'<company> · <role>'` e `period` vem de `fmtPeriod`. Sem `company`, os dois são `null`, e o jogo usa o título e o período do cartão da parada.
    - `CASES[slug] = { title, summary, stack: string[] }`.
    - `LABELS = { next: 'Próxima parada', drive: 'Dirigir', did: 'O que fiz' }`.
  - Formato do mapa: `{ "<stopId>": { "company"?: string, "cases"?: string[], "video"?: string, "highlight"?: boolean } }`. `highlight` vale `true` quando omitido.
  - No template: `const KIOSK_DATA = __KIOSK__;`. O build troca o marcador pelo JSON `{ KIOSK, CASES, LABELS }`.

- [ ] **Step 1: Escrever `e2e/kiosk-content.test.mjs` (node:test).**
  - `fmtPeriod('2023-03', '2024-11') === 'mar 2023 – nov 2024'` e `fmtPeriod('2026-01', null) === 'jan 2026 – hoje'`.
  - Com o perfil real (`import { profile } from '../../../content/pt/profile.ts'`) e o mapa real, para todos os ids do template:
    - `KIOSK.redbit.head === 'RedBit · Desenvolvedor Front-end'`;
    - `KIOSK.redbit.bullets` é igual (`deepStrictEqual`) aos bullets da RedBit no perfil;
    - `KIOSK.redbit.cases` é `['oceans-20', 'vistoria-porto-seguro']` e `KIOSK.redbit.video === 'fiap'`;
    - `KIOSK.aman.head === null` e `KIOSK.aman.video === 'aman'`;
    - `KIOSK['aws-evig'].cases` é `['migracao-gcp-aws']`;
    - `CASES['oceans-20'].stack` é igual à stack do perfil.
  - `buildKiosk` lança um erro que contém `kiosk: patio:` quando `stopIds` traz `patio` e o mapa não tem essa chave.
  - Também lança erro com o nome do slug quando um slug não existe, com o nome da empresa quando uma empresa não existe, e com o nome do vídeo quando um vídeo não está em `videos`.
  - Os ids saem do template pela regex `/addStop\(\s*[\w.]+\s*,\s*\{\s*id:\s*'([^']+)'/g`, exportada como `stopIdsOf(templateText) -> string[]` em `tools/kiosk-content.mjs`. O resultado deve conter os 14 ids da spec e `teste`.
- [ ] **Step 2: Rodar e ver falhar.** Em `.superpowers/salto88-lab`, rodar `bash e2e/idle.sh node --test e2e/kiosk-content.test.mjs`. Esperado: FAIL, módulo não encontrado.
- [ ] **Step 3: Implementar `tools/kiosk-content.mjs`** (`fmtPeriod`, `stopIdsOf`, `buildKiosk`). Escrever `proto/kiosk-map.json` com:
  - as 14 paradas, com `highlight: false` em `redbit`, `valiantgroup`, `sede-colmeia` e `sede-evig` (o cartão delas repete os bullets);
  - `teste: {}`.
- [ ] **Step 4: Rodar e ver passar.** Mesmo comando. Esperado: todas as asserções em PASS.
- [ ] **Step 5: Ligar no build.** No `build-v3.mjs`:
  - ler o perfil de `process.env.PROFILE || resolve(LAB, '../../content/pt/profile.ts')` com `await import(pathToFileURL(...))`;
  - listar os vídeos com `readdirSync(S + '/proto/video')`, sem a extensão;
  - trocar `__KIOSK__` pelo JSON.

  Rodar o build. Esperado: `ok <n> KB`. Também esperado: `grep -c "const KIOSK_DATA = {" public/salto88/index.html` dá `1`.
- [ ] **Step 6: Commit no lab** com o test, o módulo, o mapa, o build, a linha do template e o `.gitignore`. Mensagem: `feat(kiosk): stop content from profile.ts, injected at build`.

### Task 2: O carro não sai sozinho da vaga

**Files:**
- Create: `.superpowers/salto88-lab/e2e/kiosk-check.mjs`
- Create: `.superpowers/salto88-lab/e2e/kiosk.sh`
- Modify: `.superpowers/salto88-lab/proto/salto88v3.template.html`:
  - `stepWorld` e `stepHighway`, nas linhas de `S.demo`, hoje em `:6044` e `:6089`;
  - as travas `S.idle = 5` condicionadas a `stop.active` (`:1857`, `:1860`, `:2010`, `:3907`) e a de `landAssist` (`:5904`). A de `drillTick` (`:1369`), que não depende de parada, fica;
  - o debug `stops()` (`:6455`).
- Modify: `.superpowers/salto88-lab/.gitignore`

**Interfaces:**
- Produces:
  - `demoBlocked() -> boolean`: hoje, "alguma parada ativa ou `LAND.landed`". As Tarefas 3 e 4 acrescentam `KS.open` e `S.tour`.
  - Em `stepWorld` e `stepHighway`, a regra fica: `if (!active || (S.idle > 9 && !demoBlocked())) S.demo = true`.
  - `stops()` passa a devolver também `h`, `y`, `pad`, `era` (o id da era) e `visited`. `visited` fica `false` até a Tarefa 3.
- Produces (teste):
  - `e2e/kiosk-check.mjs [url] [secoes]`. As seções vêm separadas por vírgula; a lista vazia roda todas.
  - O arquivo traz o helper `park(page, eraIdx, stopId?) -> { id, x, z }`:
    - numa vaga de rua, teletransporta 8 m antes da vaga, ao longo de `h`, a 5 m/s, e avança 5 s;
    - numa plataforma, teletransporta 3 m acima, segura `KeyQ` por 3 s de jogo e solta.
  - `e2e/kiosk.sh <url-path> <secoes>` sobe o servidor estático em Idle, inicia o `idle-watch.ps1`, roda o check e mata a árvore pelo winpid, como faz `e2e/scene/late.sh`.

- [ ] **Step 1: Escrever a seção `vaga`.** Para as eras 0 a 4 (exercito, redbit, valiant, colmeia, evig): `park` na primeira parada de `stops()` daquela era, depois `advance(40, true)` sem tecla, que cobre a trava de 30 s do pouso. Asserção: o carro andou menos de 0,3 m em xz. A linha impressa é `ok/FALHOU <era>: carro andou <d> m em 40 s parado na vaga "<id>"`.
- [ ] **Step 2: Ver falhar no build atual.** Rodar `bash e2e/kiosk.sh _old.html vaga`, depois de copiar o build do HEAD como manda a Global Constraint "Teste novo". Esperado: FALHOU em pelo menos redbit e evig.
- [ ] **Step 3: Implementar `demoBlocked()`.** Trocar as duas linhas de `S.demo` e tirar as travas listadas. Ampliar `stops()`.
- [ ] **Step 4: Ver passar.** Rebuild, depois `bash e2e/kiosk.sh index.html vaga`. Esperado: 5 × ok. Depois, `bash e2e/idle.sh node e2e/stops-end-check.mjs` com o servidor de pé. Esperado: tudo ok; a câmera continua parada na vaga.
- [ ] **Step 5: Commit** no lab (`fix(stops): the attract-mode demo never drives off a stop`) e no site (`public/salto88/index.html`).

### Task 3: O quiosque (painel, câmera, teclas)

**Files:**
- Modify: `.superpowers/salto88-lab/proto/salto88v3.template.html`:
  - o CSS ao lado de `.card` (`:109–131`);
  - o HTML ao lado de `#card`;
  - `addStop`, `updateStops` e `stopLeave` (`:5855–5880`);
  - `updateLineCards`;
  - `updateCamera` (`:6177`);
  - o `keydown`;
  - `togglePhoto` (`:6300`);
  - o debug.
- Modify: `.superpowers/salto88-lab/e2e/kiosk-check.mjs` (novas seções)
- Modify: `.superpowers/salto88-lab/e2e/run.mjs:605` (`cardNow`)

**Interfaces:**
- Consumes: `KIOSK_DATA` (Tarefa 1), `demoBlocked()` e `stops()` ampliado (Tarefa 2).
- Produces:
  - `KS = { open: boolean, st: Stop | null, t: number, camPos: Vector3, camLook: Vector3 }`.
  - `openKiosk(st) -> void` e `closeKiosk(how: 'drive' | 'next') -> void`.
  - `demoBlocked()` passa a incluir `KS.open`.
  - Nova opção de `addStop`: `kiosk: { cam: { pos: [x, y, z], look: [x, y, z] } }`.
    - As coordenadas ficam no referencial da vaga: x de lado, z ao longo de `h` (z negativo é para onde o carro aponta) e y para cima.
    - O padrão é `pos [-7, 3.4, 6]` e `look [0, 1.2, -6]`, um ponto de partida que o teste `enquadramento` valida.
  - A Tarefa 4 conecta `closeKiosk('next')` a `tourStart()`. Até lá, `'next'` se comporta como `'drive'`.
  - DOM: `<aside id="kiosk" class="kiosk" role="dialog" aria-modal="false" aria-labelledby="kTitle" hidden>`, com `#kTitle`, `#kPer`, `#kLead`, `#kDid` (título "O que fiz" e uma `ul`), `#kCase`, `#kVid` (`<video muted loop playsinline preload="none">`), `#kNext` e `#kDrive`.
  - Debug:
    - `kiosk() -> { open, stop, title, period, lead, bullets, cases, video, focus, look: [x, y, z], camPos: [x, y, z] }`. `focus` é o id do elemento com foco.
    - `queueCard(title) -> void` chama `queueLineCard({ title, period: '', text: '', values: [] }, 7, 25)`.

- [ ] **Step 1: Escrever as seções em `kiosk-check.mjs`.** Todas a 960×540, salvo onde a seção diz outra coisa.
  - **`quiosque`.**
    - Em `redbit`: `open`, `title === 'RedBit · Desenvolvedor Front-end'`, `period === 'mar 2023 – nov 2024'`, `bullets` iguais aos do perfil, `cases` igual a `['oceans-20', 'vistoria-porto-seguro']`, `video === 'fiap'` e `focus === 'kNext'`.
    - Em `aman`: `title` igual a `card.title` da parada e `video === 'aman'`.
    - Em `aws-evig` (pousado): `cases` igual a `['migracao-gcp-aws']`.
    - O `#card` fica escondido o tempo todo.
  - **`enquadramento`.** Na primeira parada de cada era, `look` e a posição do carro projetados com `camera` caem dentro da tela (|ndc| < 0,95). O x em px de `look` fica à esquerda do `left` do `#kiosk`.
  - **`dirigir`.**
    - `Escape` fecha o quiosque. Depois de 1 s de jogo, a câmera está atrás do carro: o produto escalar de (câmera − carro) com a frente do carro é negativo e a distância fica entre 6 e 12 m.
    - `KeyW` por 1 s deixa `speed > 1`.
    - Numa segunda entrada na vaga, `KeyW` com o quiosque aberto fecha o quiosque e o carro anda.
  - **`teclas`.** Com o foco em `#kDrive` (por `focus()`), `Enter` dá `open === false`. Nos 2 s seguintes, sem tecla, o carro anda menos de 0,3 m: dirigiu, não seguiu para a próxima parada.
  - **`celular`.**
    - Em 375×812 e em 812×375, o retângulo do `#kiosk` não cruza o de nenhum destes que esteja visível: `#upBtn`, `#downBtn`, `#radio`, `#zin`, `#zout`.
    - O `look` projetado fica fora do painel.
    - Abrir em 812×375 e trocar para 375×812 com o quiosque aberto faz o painel virar folha de baixo (`top` > metade da altura) e mantém o `look` visível.
  - **`foto`.** Com o quiosque aberto, clicar `#photoBtn` deixa o `#kiosk` sem área visível. Clicar de novo traz o painel de volta.
  - **`fila`.** Com o quiosque aberto, chamar `queueLineCard` (por um debug `queueCard(title)`) e avançar 3 s deixa o `#card` escondido. Fechar com `Escape` e avançar 1 s faz o `#card` aparecer com o título enviado.
  - **`visitada`.** Depois de fechar, `stops()` mostra `visited: true` naquela parada.
- [ ] **Step 2: Ver falhar.** Rodar `bash e2e/kiosk.sh _old.html quiosque,dirigir`. Esperado: FALHOU, porque `kiosk` não é função.
- [ ] **Step 3: Implementar.**
  - **Abertura.** Em `updateStops`, a ativação chama `openKiosk(st)` no lugar de `showCard(st.card)`. Os `onArrive` continuam iguais.
  - **Saída por outro caminho.** `stopLeave` fecha com `closeKiosk('drive')` se o quiosque estiver aberto.
  - **Câmera.** Em `updateCamera`, com `KS.open`, `target` e `look` interpolam até `KS.camPos` e `KS.camLook` com `1 - Math.pow(0.02, dt)`, o que chega em cerca de 0,8 s. Com `prefers-reduced-motion`, o salto é imediato.
  - **Teclas.**
    - `Enter` vale `closeKiosk('next')` só se `document.activeElement` não for `#kNext` nem `#kDrive`; nesse caso vale o clique do botão.
    - `Escape` vale `closeKiosk('drive')`.
    - Uma tecla de dirigir vale `closeKiosk('drive')` e segue para o `keys.add`.
  - **Vídeo.** `play()` ao abrir e `pause()` ao fechar. No `error`, `#kVid` fica `hidden`. Um toque no vídeo liga o som.
  - **Foto.** `togglePhoto` liga ou desliga a classe `.kiosk.photo-off` (`visibility: hidden`).
  - **Parada visitada.** `st.visited = true` ao abrir. O `fill` da seta usa a cor da era clareada 0,3 e misturada 0,6 com `0x555566`.
  - **`cardNow()` (run.mjs:605).** Quando `#kiosk` está aberto, devolve `{ open: true, title: kTitle, period: kPer, text: [kLead, ...bullets].join('\n'), vals: [] }`.
- [ ] **Step 4: Ver passar.** Rebuild, depois `bash e2e/kiosk.sh index.html quiosque,enquadramento,dirigir,teclas,celular,foto,fila,visitada`. Esperado: tudo ok.
  - Os testes de parada de `run.mjs` rodam uma era por vez: `bash e2e/idle.sh node e2e/run.mjs http://127.0.0.1:8088/index.html "<filtro>"` com os filtros `exercito:`, `redbit:`, `valiant:`, `colmeia:` e `evig:`.
  - Esperado: os mesmos que passavam antes continuam passando.
  - Onde um teste comparar o texto do cartão com o de antes (`highlight: false`), atualizar a expectativa para os bullets do perfil, citando a spec §3.2.
- [ ] **Step 5: Commit** no lab (`feat(kiosk): camera framing and side panel at every stop`) e no site.

### Task 4: O tour guiado

**Files:**
- Modify: `.superpowers/salto88-lab/proto/salto88v3.template.html`:
  - `autopilot` (`:6023`), `stepWorld`, `stepHighway` e `enterEra` (`:5932`);
  - a chegada ao portal (`portalTransit`) e `landAssist` (`:5888`);
  - `closeKiosk` e o debug.
- Modify: `.superpowers/salto88-lab/e2e/kiosk-check.mjs`

**Interfaces:**
- Consumes: `closeKiosk('next')` e `KS` (Tarefa 3), `demoBlocked()` (Tarefa 2), `LAND` e `STOPS`.
- Produces:
  - `S.tour = null | { target: Stop | 'portal', wps: Waypoint[], wp: number, leg: number, phase: 'drive' | 'land' }`, onde `Waypoint = { x, z, y?, r?, v?, dwell? }`.
  - `tourOrder() -> Stop[]`. São as paradas da era atual, ordenadas pelo índice do ponto de `world.waypoints` mais próximo de cada uma; no empate, pela distância a esse ponto.
  - `tourStart() -> void`. Escolhe a próxima de `tourOrder()` depois de `KS.st`, ou `'portal'` depois da última.
  - `tourStop(reason: 'arrived' | 'user' | 'stuck') -> void`. Com `'stuck'`, mostra `toast('Tour pausado: siga dirigindo até a próxima parada', 3)`.
  - `demoBlocked()` passa a incluir `S.tour`.
  - `autopilot(dt)` lê `S.tour.wps` e `S.tour.wp` quando há tour, e `world.waypoints` e `S.wp` quando não há.
  - A lista do tour é montada assim:
    - os pontos da era, do ponto mais próximo do carro até o ponto da parada-alvo;
    - mais a entrada da vaga, 8 m atrás do centro ao longo de `h`, com `v: 6`;
    - mais o centro da vaga, com `r: 1.2`, `v: 3` e `dwell: 999`.
  - Numa plataforma (`pad > 0`), o último ponto é `(x, y + 6, z)`. Ao chegar a ele, `phase` vira `'land'` e a entrada passa a `{ thr: 0, steer: 0, up: -1 }` até `LAND.landed`.
  - Para `'portal'`, a lista termina no centro do portal da era. `enterEra` com tour ativo chama `tourStart()` para a primeira parada da era nova. Na vitrine final, o tour termina.
  - Debug:
    - `tour() -> { on, target, phase, leg, order: string[] }`;
    - `tourLimit(s)` muda o limite de 90 s por trecho, só para o teste.

- [ ] **Step 1: Escrever as seções.**
  - **`proxima`.** Para cada era de 0 a 4:
    - fazer `park` em `order[0]`, clicar em `#kNext` e avançar de 1 em 1 s até `kiosk().open && kiosk().stop === order[k + 1]`, com no máximo 90 s por trecho; repetir até o fim de `order`;
    - da última parada, chegar a `order[0]` da era seguinte em até 150 s;
    - na evig, chegar à vitrine (`info().era === 'final'`);
    - na evig, cada chegada fica com `LAND.landed`, visto por `kiosk().open` com `info().car.y` igual ao `y` da parada, com tolerância de 0,05.
  - **`assumir`.** Durante um trecho, `KeyW` por 0,5 s deixa `tour().on === false` e o carro passa a responder ao visitante (`speed` sobe com W).
  - **`travado`.** Com `tourLimit(3)`, iniciar o tour e prender o carro com `teleport({ speed: 0 })` repetido a cada 0,2 s por 4 s. Esperado: `tour().on === false` e o toast "Tour pausado…" visível.
- [ ] **Step 2: Ver falhar.** Rodar `bash e2e/kiosk.sh index.html proxima`, com o build da Tarefa 3. Esperado: FALHOU, a próxima parada não chega.
- [ ] **Step 3: Implementar** `tourOrder`, `tourStart`, `tourStop`, a leitura de `S.tour` em `autopilot`, a ligação em `stepWorld`, o uso da lógica de faixa de `S.demo` em `stepHighway` também com `S.tour`, o pouso, o portal, o limite por trecho e o debug.
- [ ] **Step 4: Ver passar.** Rebuild, depois `bash e2e/kiosk.sh index.html proxima,assumir,travado`. Esperado: tudo ok. Rodar de novo `vaga` e `dirigir`. Esperado: ok.
- [ ] **Step 5: Commit** no lab (`feat(kiosk): guided tour to the next stop, across portals`) e no site.

### Task 5: Enquadramento parada por parada, regressão e fechamento

**Files:**
- Modify: `.superpowers/salto88-lab/proto/salto88v3.template.html` (`kiosk.cam` nas chamadas de `addStop` que pedirem)
- Modify: `.superpowers/salto88-lab/e2e/kiosk-check.mjs` (seção `fotos`)
- Modify: `.superpowers/HANDOFF-salto88.md`

- [ ] **Step 1: Escrever a seção `fotos`.** Para cada uma das 14 paradas, abrir o quiosque e salvar `e2e/kiosk/<id>-desk.png` (960×540) e `e2e/kiosk/<id>-phone.png` (375×812).
- [ ] **Step 2: Rodar `fotos`, olhar as 28 imagens e dar nota de 0 a 10 a cada parada.** O critério é o lugar reconhecível ao lado do painel, o carro à vista e nada atrás do painel que importe. Onde a nota ficar abaixo de 9, escrever `kiosk.cam` naquela parada. Repetir até todas ficarem em 9 ou mais, ou até 3 rodadas; o que sobrar vai para o relatório.
- [ ] **Step 3: Regressão, uma vez.** Todas as seções de `kiosk-check`. `stops-end-check.mjs`. Os filtros de era de `run.mjs` da Tarefa 3. `ghost-check` e `scene-check` só na EVIG, porque `addStop` mudou. Esperado: tudo ok, salvo falhas que já existiam ("showroom: Sua viagem"), citadas pelo nome no relatório.
- [ ] **Step 4: Fechamento.**
  - Commit no lab (`feat(kiosk): per-stop framing`) e no site.
  - Acrescentar uma linha 2f no `HANDOFF-salto88.md` com os commits e o que ficou de fora.
  - Conferir que nenhum `chrome-headless-shell` nem `python` ficou vivo.
  - Pedir ao Luis o OK para o push.
