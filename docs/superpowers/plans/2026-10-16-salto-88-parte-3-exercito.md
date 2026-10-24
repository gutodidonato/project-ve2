# Salto 88 · Parte 3: Exército · Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transformar a primeira fase na história da formação de oficial do Luis (EsPCEx 2019, AMAN 2020, Engenharia de combate 2021): 13 lugares cheios de gente, cada um mostrando liderança, disciplina, pressão ou trabalho em equipe.

**Architecture:** Três sistemas comuns entram primeiro e servem também às cidades:
- gente (personagens animados do Kenney Mini Characters, com farda);
- vagas com cartão;
- balões de comando.

Depois cada lugar entra em `buildExercito` com o seu teste. Os lugares ficam em funções próprias (`buildEspcex`, `buildAman`, `buildEngenharia`, `buildInstrucao`) chamadas por `buildExercito`, para o arquivo não crescer sem forma.

**Tech Stack:** three.js r128 com `GLTFLoader` e `SkeletonUtils` (r128, de cdn.jsdelivr.net/npm/three@0.128.0/examples/js/, a mesma origem do GLTFLoader de hoje), WebAudio e Playwright.

**Spec:** `docs/superpowers/specs/2026-10-16-salto-88-parte-3-exercito-design.md`. Os textos e detalhes de cada lugar estão na planta (artifact `NA24Mq3ccPwPBpe3CRd8Tf`), e a spec é a fonte de verdade quando os dois divergirem.

## Locais

Os mesmos das partes 1 e 2. Pacote de personagens já baixado: `$S/kenney/mini-characters/Models/GLB format/` (12 `character-*.glb` e `Textures/colormap.png`, CC0). Ferramentas de conversão em `D:/Projetos/Luis/project-ve2/.superpowers/tools/`: `glb-to-json.mjs` e `build-libs.mjs`, com `@gltf-transform` instalado no repo.

## Global Constraints

- Posições no terreno do Exército, com a chegada em (0, 66) e o portal em (0, −78):

  | Lugar | Posição |
  |---|---|
  | Portão da EsPCEx | z 60 |
  | Pátio | (−20, 40), 30 × 24 m |
  | Pavilhão | (31, 42) |
  | Placa "Resende · AMAN 2020" | (6, 30) |
  | Portão Monumental | z 22 |
  | Conjunto Principal | (25, 2) |
  | Telão | (9, −1) |
  | Pista | x −45 |
  | Castelo | (−8, −3) |
  | Brecha | (−45, −45) |
  | Área do comboio | x 45, z 20 → −30 |
  | Abertura de estrada | z −55, x 5 → 20 |
  | Acampamento | (−62, −26) |
  | Posto de observação | (66, −2) |
  | Paredão de rapel | (28, −70) |
  | Esquadrilha | órbita r 60 em (0, −10), y 42 |

  Nada novo pode entrar em `roadDist < 6,5` nem sobrepor colisores (a auditoria de sobreposição continua zerada).
- Toda pessoa vem de `spawnPerson`. Ninguém é atingido pelo carro: as pessoas não são corpos físicos, e cada grupo fica fora da pista ou numa área que o carro não alcança (colisores baixos na borda do pátio).
- Cartões só com o texto da spec, nenhuma afirmação pessoal além dela.
- Som só sintetizado, atrás de `AUD.on`, e dentro das faixas da parte 1. A auditoria de som continua passando.
- Custo total da fase: no máximo +150 chamadas de desenho e +2 ms de simulação por quadro sobre a medição de hoje (`qa.mjs gpu`: 331 chamadas, 0,68 ms).
- `models/lib-people.json` com no máximo 2 MB.

## Review Focus

1. **Parar numa vaga e sair no meio da cena** (ordem unida, ponte, espadim): a cena termina limpa ou volta ao início, sem tropa congelada no meio do giro. Teste na Tarefa 4, com o padrão repetido nas Tarefas 6 e 9.
2. **Comboio com o jogador saindo da rota** (entrando na selva ou voltando): as viaturas não atravessam árvores nem umas às outras e voltam sozinhas depois de 90 s. Teste na Tarefa 10.
3. **Demo automático:** o passeio da fase continua passando por pista, ponte e portal sem travar nas cenas novas. Teste na Tarefa 14 (o teste de demo).
4. **Celular:** os cartões e os balões de comando cabem em 375 × 812 e em 812 × 375 sem cobrir o velocímetro. Teste na Tarefa 2.
5. **Cair na brecha com o comboio atrás:** as viaturas param antes da brecha se a ponte não estiver lançada. Teste na Tarefa 10.

---

### Task 1: Gente (X1)

**Files:**
- Create: `$S/tools/build-people.mjs`, que gera `$S/proto/models-json/lib-people.json`
- Modify: template (carregamento junto com as outras bibliotecas no boot; `SkeletonUtils` via `<script>`; funções `spawnPerson`, `updatePeople`)
- Modify: `$S/build-v3.mjs`, se a cópia de modelos não pegar o arquivo novo
- Test: `e2e/run.mjs`

**Interfaces:**
- Produces:
  - `spawnPerson({ kind, outfit, x, z, h, anim, speed? }) -> person`, com `kind` de `'male-a'` a `'male-f'` e de `'female-a'` a `'female-f'`; `outfit` `'civil'` ou `'farda'`; `anim` sendo `'idle' | 'walk' | 'sprint' | 'sit' | 'interact-right' | 'emote-yes' | 'holding-both'`.
  - `person = { root: THREE.Object3D, play(name, fade = 0.2), walkTo(x, z, onArrive?), setHeading(h) }`.
  - `PEOPLE` (lista da era), limpa em `enterEra`.
  - Gancho `__salto.people()` → `[{ x, z, anim, visible, animating, outfit }]`.

- [ ] **Step 1: Build the library.**
  - `build-people.mjs` lê os 12 `character-*.glb`, mantém só as 7 animações da interface e embute a textura como data URI.
  - A saída é um glTF JSON com os 12 personagens, cada um com a raiz nomeada pelo arquivo.
  - Rode o script e registre o tamanho (≤ 2 MB).
- [ ] **Step 2: Write the failing test** `gente: personagens animados, farda e corte por distância`.
  - Na era 0, depois de criar 40 pessoas de teste num anel a 10–200 m do carro (gancho de teste `__salto.spawnTestCrowd(40)`):
    - quem está a até 60 m anima (`animating`);
    - quem está a mais de 90 m está oculto;
    - quem tem farda usa a textura de farda.
  - Meça `__salto.mem()` e a contagem de chamadas de desenho de um quadro (contador de WebGL, como em `qa.mjs`) antes e depois: no máximo +100 chamadas para 40 pessoas.
- [ ] **Step 3: Run.** Expected: FAIL.
- [ ] **Step 4: Implement.**
  - Clone com `THREE.SkeletonUtils.clone`. Um `AnimationMixer` por pessoa, atualizado só para quem está a até 60 m.
  - A farda é uma cópia do `colormap` gerada num canvas na carga: os pixels de roupa (não pele, não cabelo, com saturação acima de 0,2) são trocados por tons de verde-oliva (`#4b5320` a `#6b7a3a`). Os personagens de farda compartilham um material.
  - `walkTo` move a raiz em linha reta a 1,4 m/s (ou 3,5 com `sprint`), gira suave e chama `onArrive`.
- [ ] **Step 5: Run** o teste novo e `"boot: todas as eras"`. Expected: PASS.
- [ ] **Step 6: Checkpoint.**

### Task 2: Vaga e cartão (X2) e balões de comando (X3)

**Files:**
- Modify: template (CSS e HTML de `#card`; `addStop`; `updateStops` no laço da era; estilo de balão `command`)
- Test: `e2e/run.mjs`

**Interfaces:**
- Produces:
  - `addStop(g, { id, x, z, h, card: { title, period, text, values: string[] }, onArrive?, onLeave? }) -> stop`.
  - `stop.active` é verdadeiro enquanto o carro está parado na vaga.
  - Gancho `__salto.stops()` → `[{ id, x, z, active }]`.
  - `#card` mostra título, período, texto e etiquetas dos valores.
  - `say(person, text, { style: 'command' })` mostra um balão sobre uma pessoa.

- [ ] **Step 1: Write the failing tests.**
  - `vaga: parar abre o cartão, sair fecha`:
    - um stop de teste (`__salto.addTestStop()`) em (0, 30);
    - parar nele (velocidade < 1,5 por 0,5 s) torna `#card` visível com o título e chama `onArrive` uma vez;
    - acelerar para fora esconde o cartão em até 0,5 s.
  - `vaga: cartão não cobre o HUD`: com o cartão aberto em 1280 × 720, 375 × 812 e 812 × 375, a checagem de sobreposição (a mesma da parte 1, com `#card` na lista) dá zero.
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement.**
  - A vaga é um retângulo de 3 × 5,5 m pintado com borda tracejada na cor da era e um ícone ▼ flutuando a 3 m enquanto o carro não está nela.
  - Com o carro na vaga, a câmera desce 30% e se aproxima.
  - O cartão fica no canto inferior esquerdo, acima do rádio (desktop), ou ocupa a faixa de baixo acima do rádio (celular).
- [ ] **Step 4: Run.** Expected: PASS, e os testes de HUD da parte 1 continuam PASS.
- [ ] **Step 5: Checkpoint.**

### Task 3: Portão da EsPCEx e a corneta (C1, C14 corneta)

**Files:**
- Modify: template (`buildEspcex(g)` chamada por `buildExercito`; `bugle(call)` no módulo de áudio)
- Test: `e2e/run.mjs`

**Interfaces:**
- Consumes: `spawnPerson`, `addStop`/cartão (aqui o cartão abre ao passar, por gatilho de linha), `measure`.
- Produces: `bugle('alvorada' | 'silencio' | 'curto')`, que toca no canal `efeitos`.

- [ ] **Step 1: Write the failing test** `exército: chegada pelo portão da EsPCEx`.
  - Na era 0, o carro parte de (0, 66) e segue a 12 por 1,5 s.
  - Nesse tempo: o objeto `portao-espcex` existe sobre a estrada em z 60; a sentinela (uma pessoa de farda perto da guarita) muda para `emote-yes`; o cartão do capítulo abre com "2019 · EsPCEx, Campinas"; e `audio().played.bugle === 1`.
  - Com som ligado, `measure` durante o toque mostra os efeitos ≥ −28 dB e o pico < −1.
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement.**
  - Arco de 14 m de vão e 9 m de altura, com o texto "ESCOLA PREPARATÓRIA DE CADETES DO EXÉRCITO" (canvas).
  - Guarita de 2 × 2 m, sentinela, cancela aberta e mastro com bandeira (a mesma bandeira ondulante de hoje).
  - Colisores nos pilares, fora da pista.
  - Alvorada: a melodia de corneta em notas da série harmônica (C4, E4, G4 e C5) com ritmo de toque. Timbre de dente de serra com passa-baixa de 2,2 kHz, vibrato de 5 Hz e ataque de 30 ms.
- [ ] **Step 4: Run.** Expected: PASS.
- [ ] **Step 5: Checkpoint.**

### Task 4: Pátio de formatura, ordem unida e desfile (C2, passos e caixa)

**Files:**
- Modify: template (`buildEspcex`: pátio, pelotão de 30, instrutor, mastro, palanque, vaga e cena)
- Test: `e2e/run.mjs`

**Interfaces:**
- Consumes: `spawnPerson`, `addStop`, `say(..., { style: 'command' })`.
- Produces: `S.drill` = `{ phase: 'idle' | 'sentido' | 'volver' | 'marche' | 'desfile' | 'fim', t }`, exposto em `info()`.

- [ ] **Step 1: Write the failing tests.**
  - `exército: ordem unida em sincronia`: parar na vaga do pátio. Em até 6 s, `S.drill.phase` passa por `sentido`, `volver` e `marche`. No `volver`, os 30 alunos terminam o giro com diferença menor que 0,3 s e todos ficam com o mesmo `h` (diferença menor que 0,05 rad). No fim do desfile (até 25 s), todos voltam à posição de forma (erro menor que 0,3 m).
  - `exército: sair no meio da ordem unida`: na fase `marche`, o carro sai da vaga. Em até 3 s o pelotão volta à forma e `phase` volta a `idle`.
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement.**
  - Pátio de 30 × 24 m em (−20, 40), no lugar do acampamento (as barracas vão para a selva na Tarefa 12).
  - Pelotão de 3 fileiras de 10, com 1,2 m entre colunas e 1,5 m entre fileiras.
  - Comandos em balões: "SENTIDO!", "DIREITA, VOLVER!", "ORDINÁRIO, MARCHE!".
  - O desfile percorre o retângulo do pátio a 1,3 m/s.
  - Passos: um clique de ruído (passa-banda de 1,8 kHz, 25 ms) a cada passo, sincronizado com a cadência. A caixa toca a cada passo no desfile.
  - Colisores baixos (0,4 m) na borda do pátio do lado da estrada.
- [ ] **Step 4: Run.** Expected: PASS.
- [ ] **Step 5: Checkpoint.**

### Task 5: Pavilhão de aulas e alojamento (C3)

**Files:** template (`buildEspcex`) · Test: `e2e/run.mjs`

- [ ] **Step 1: Write the failing test** `exército: rotina do aluno no pavilhão`.
  - Parar na vaga do pavilhão: o quadro `rotina` marca os 5 itens (`TFM`, `aulas`, `estudo`, `ordem unida`, `instrução`) em até 8 s.
  - No fim, `bugle('silencio')` toca e o emissivo das janelas cai para menos de 0,1.
  - Ao sair, as luzes voltam.
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement.**
  - Pavilhão de 2 andares, 24 × 9 m, em (31, 42), no lugar das barracas do leste.
  - Janelas com textura de sala de aula (canvas com quadro e carteiras) e emissivo.
  - Alojamento com beliches visíveis (caixas) e 8 alunos sentados ou estudando (`sit`).
  - O quadro de avisos é um canvas que risca os itens um a um.
- [ ] **Step 4: Run.** Expected: PASS.
- [ ] **Step 5: Checkpoint.**

### Task 6: Placa, Portão Monumental, Conjunto Principal e espadim (C4, C5)

**Files:** template (`buildAman(g)`; remove a torre de caixas e o rótulo AMAN de hoje) · Test: `e2e/run.mjs`

- [ ] **Step 1: Write the failing tests.**
  - `exército: Portão Monumental`: passar por z 22 abre o cartão "2020 · AMAN, Resende" e os dois cadetes de guarda fazem `emote-yes`. A placa "Resende · AMAN 2020" existe em (6, 30).
  - `exército: saudação do espadim`: parar na vaga do pátio da AMAN faz a companhia (20 cadetes) tocar `holding-both` em sincronia, e o cartão diz "Espadim de Caxias · recebido pelo cadete do 1º ano". Sair no meio volta todos ao `idle`.
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement.**
  - **Portão:** 4 colunas brancas de 1 m de diâmetro e 9 m, frontão triangular e vão de 14 m.
  - **Conjunto Principal:** prédio de 40 × 12 m e 3 andares, com uma torre central de 6 × 6 m e 22 m, arcadas no térreo (recortes escuros) e janelas regulares (textura). Fica de frente para o pátio de desfile que já existe.
  - **Espadim:** uma lâmina fina (caixa de 0,04 × 0,8 m) presa à mão direita de cada cadete durante a saudação.
- [ ] **Step 4: Run.** Expected: PASS, e `"exército: pista completa"` continua PASS.
- [ ] **Step 5: Checkpoint.**

### Task 7: Telão com arquibancada e TFM vivo (C6, C7)

**Files:** template (`buildAman` para o telão; `buildExercito` para a pista) · Test: `e2e/run.mjs`

- [ ] **Step 1: Write the failing tests.**
  - `exército: telão com público`: há ao menos 10 cadetes sentados (`sit`) na arquibancada a até 8 m do telão, e parar na vaga abre o cartão do telão.
  - `exército: placar e instrutor da pista`: completar a pista pelo piloto automático mostra no placar o tempo e o melhor tempo (texto do canvas igual a `S.course.last` e `S.course.best` com uma casa decimal). O instrutor diz um dos balões ("MAIS RÁPIDO, CADETE!" se passar de 8 s; "EXCELENTE!" se não).
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement.**
  - Arquibancada de 3 degraus.
  - Placar de 4 × 2 m na chegada.
  - Pelotão de 8 correndo (`sprint`) num laço pela lateral da pista, a 7 m da estrada.
  - Instrutor parado na chegada.
- [ ] **Step 4: Run** os dois testes e os 4 testes atuais da pista. Expected: PASS.
- [ ] **Step 5: Checkpoint.**

### Task 8: Castelo da Engenharia e pátio de máquinas (C8)

**Files:** template (`buildEngenharia(g)`) · Test: `e2e/run.mjs`

- [ ] **Step 1: Write the failing test** `exército: castelo da Engenharia`.
  - Passar a até 12 m de (−8, −3) abre o cartão "2021 · Engenharia de combate · patrono: Ten Cel Villagran Cabrita".
  - Existem: trator (`tractor-shovel` do kit de carros), caminhão de ponte (caminhão com uma ponte dobrada em cima, de primitivas) e 3 engenheiros com `interact-right` numa mesa.
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement.** O castelo tem 6 m de altura e 8 de largura: duas torres com ameias e um corpo central com portão, em pedra clara com a placa "ENGENHARIA". As máquinas são corpos estáticos.
- [ ] **Step 4: Run.** Expected: PASS.
- [ ] **Step 5: Checkpoint.**

### Task 9: Transposição da brecha (C9)

**Files:** template (a vala da parte 1 vira a brecha: `TR` com 4,5 × 3 m de meia-largura × meia-profundidade, isto é, 9 × 6 m, e `TRENCH_DEPTH` 2,0, com água no fundo a −1,6; a ponte; a vaga do pontoneiro) · Test: `e2e/run.mjs`

**Interfaces:**
- Produces: `S.bridge` = `{ state: 'folded' | 'launching' | 'down', t }`, exposto em `info()`, e `bridgeDown()` → boolean (usado pela Tarefa 10).

- [ ] **Step 1: Write the failing tests.**
  - `exército: ponte lançada pela equipe`: parar na vaga do pontoneiro faz a equipe de 6 correr até o caminhão. Em até 5 s, `S.bridge.state === 'down'`, e o carro atravessa de z −40 a z −52 sem cair (y nunca abaixo de −0,2).
  - `exército: sem ponte, cai na brecha`: com a ponte dobrada, o carro devagar entra na brecha e desce abaixo de −1,0; a penalidade de +3 s vale com a pista ativa.
  - `exército: sair no meio do lançamento`: sair da vaga com a ponte em `launching` deixa a ponte terminar de descer, e o estado final é `down`.
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement.**
  - A ponte é um tabuleiro de 4,4 × 7 m com guarda-corpos. Ela desce girando em torno da borda perto do caminhão.
  - Com a ponte `down`, a vala não conta queda para quem está a mais de −0,3 de altura dentro da largura da ponte (a ponte vira chão).
  - A água é um plano azul-escuro semitransparente a −1,6.
  - Os testes "devagar cai na vala" e "pista completa" são atualizados para a brecha nova (mesmos objetivos).
- [ ] **Step 4: Run** os três testes novos e o grupo `exército`. Expected: PASS.
- [ ] **Step 5: Checkpoint.**

### Task 10: Comboio sob o seu comando (C10)

**Files:** template (o comboio de `addPathTraffic` na fase vira `convoyCommand`) · Test: `e2e/run.mjs`

**Interfaces:**
- Consumes: `bridgeDown()`, `addStop`.
- Produces: `S.convoy` = `{ state: 'staged' | 'following' | 'crossed' | 'returning', crossed: n }` em `info()`.

- [ ] **Step 1: Write the failing tests.**
  - `exército: comboio segue e atravessa`:
    - parar na vaga "assumir o comando" em (41, 25) e baixar a ponte por gancho (`__salto.bridgeTest('down')`);
    - dirigir pelo piloto de teste (pontos: (45, 25) → (45, −55) → (−45, −55) → (−45, −30));
    - `S.convoy.crossed === 7` em até 90 s;
    - a distância entre viaturas fica sempre ≥ 5 m;
    - nenhuma viatura entra em colisor fixo (auditoria de sobreposição com corpos em movimento = 0).
  - `exército: comboio espera a ponte`: com a ponte dobrada, as viaturas param a 8 m ou mais da brecha.
  - `exército: comboio volta sozinho`: assumir o comando e ficar parado longe por 90 s faz o estado passar a `returning` e depois `staged`, com as 7 viaturas na área de reunião.
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement.**
  - O carro deixa migalhas a cada 2 m (no máximo 400). Cada viatura segue as migalhas a 8 m da da frente, com a velocidade limitada pela distância.
  - Antes da brecha, se a ponte não está `down`, a fila para.
  - A volta usa o caminho do laço de hoje até a área de reunião.
- [ ] **Step 4: Run.** Expected: PASS. `"comboio do Exército: curvas suaves"` também PASS, adaptado ao estado `staged`/`returning`.
- [ ] **Step 5: Checkpoint.**

### Task 11: Abertura de estrada (C11)

**Files:** template (`buildEngenharia`) · Test: `e2e/run.mjs`

- [ ] **Step 1: Write the failing test** `exército: trator abre a estrada`.
  - Os colisores do bloqueio (troncos e pedras em z −55, x 5 → 20) ocupam a metade sul da pista.
  - Com o carro a menos de 25 m, em até 5 s eles saem da pista (nenhum colisor do bloqueio com `roadDist < 4`) e aparece o aviso "Estrada liberada".
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement.** O trator avança empurrando os troncos (que são corpos com massa). Dois engenheiros com bandeirola usam `interact-right`.
- [ ] **Step 4: Run** o teste novo e `"demo: passeio automático"`. Expected: PASS.
- [ ] **Step 5: Checkpoint.**

### Task 12: Campos de instrução sem placa (C12)

**Files:** template (`buildInstrucao(g)`) · Test: `e2e/run.mjs`

- [ ] **Step 1: Write the failing test** `exército: cenas vivas na selva, na caatinga e na montanha`.
  - Na selva, a patrulha de 8 está andando (posição muda mais de 3 m em 5 s) e as barracas (9) ficam a menos de 15 m de (−62, −26).
  - Na caatinga, o observador gira o binóculo (o `h` muda mais de 0,5 rad em 6 s).
  - Na montanha, o rapelista desce e sobe no paredão (y varia mais de 4 m em 8 s).
  - Nenhum rótulo de região existe (o teste da parte 1 continua PASS).
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement.**
  - A patrulha faz um laço pela mata em fila indiana, a 2 m de distância.
  - O posto de observação fica num morrote de 1,5 m, com 2 viaturas camufladas e 3 pessoas com uma carta (canvas).
  - O paredão é uma caixa de pedra de 10 × 12 m, com corda (linha) e equipe embaixo.
  - Os sons de selva e caatinga já existem (parte 1).
- [ ] **Step 4: Run.** Expected: PASS.
- [ ] **Step 5: Checkpoint.**

### Task 13: Esquadrilha da Fumaça (C13, motor a hélice)

**Files:** template (os aviões de hoje, `craft_racer`, são trocados por um avião de primitivas; o atualizador dos aviões) · Test: `e2e/run.mjs`

- [ ] **Step 1: Write the failing test** `exército: Esquadrilha com aviões a hélice e passagem baixa no desfile`.
  - Os 4 aviões não usam `craft_racer` (nenhum nó com esse nome na cena) e têm uma hélice girando (rotação muda entre quadros).
  - Durante `S.drill.phase === 'desfile'`, eles passam a menos de 20 m de altura sobre o pátio pelo menos uma vez.
  - Com som ligado, os efeitos sobem pelo menos 4 dB na passagem.
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement.**
  - O avião é monomotor de asa baixa: fuselagem de cilindro afilado, asas e empenagem de caixas finas, hélice de 3 pás e pintura azul com faixas vermelho e branco (canvas). Tem cerca de 9 m de comprimento.
  - O motor é uma serra a 90–140 Hz com efeito Doppler simples pela distância.
- [ ] **Step 4: Run.** Expected: PASS.
- [ ] **Step 5: Checkpoint.**

### Task 14: Metas medidas, fotos e fechamento

**Files:** `e2e/qa.mjs` (seção `life` com contagem de pessoas; seção nova `places` que encontra e fotografa os 13 lugares da fase pelos nomes dos objetos); `e2e/tour.mjs` (fotos da chegada, do pátio, da AMAN, da brecha com a ponte, do comboio e das três cenas)

- [ ] **Step 1: Run** `node qa.mjs "" life`, `places`, `gpu` e `sound`. Expected:
  - superfície lisa na chegada < 35%;
  - ≥ 60 pessoas (≥ 30 no pátio);
  - 13 de 13 lugares fotografados;
  - ≤ +150 chamadas e ≤ +2 ms;
  - som nas faixas.
- [ ] **Step 2: Run** a suíte inteira. Expected: tudo PASS.
- [ ] **Step 3: Tour e revisão visual** das fotos, com correção do que estiver feio (cada correção com o seu teste).
- [ ] **Step 4: Atualize a spec geral** (§ Exército) e faça commit no repo.
