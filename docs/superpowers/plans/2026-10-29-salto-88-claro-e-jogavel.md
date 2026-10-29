# Salto 88: claro e jogável — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** quem joga sabe que há som, para onde ir e quais teclas usar; nenhuma placa tapada, texto cortado, parada que trava ou mídia fora de contexto; desktop e celular.

**Architecture:**
- **Conteúdo e mídia.**
  - Um manifesto (`proto/media.json`) diz o assunto e a era de cada vídeo e imagem.
  - Uma ferramenta (`tools/media-images.mjs`) monta as imagens a partir das capturas antigas do site.
  - Testes estáticos (`node --test`) leem o template e o manifesto.
- **Jogo.** Peças novas no template, cada uma com um gancho em `window.__salto`:
  - `world.goal`, a seta e o farol;
  - `keyHint` e `soundCue`;
  - `fitText`;
  - os registros `SIGNS`, `SUBJECTS` e `OVERLAYS` das regras de cena;
  - `placeSitesGallery`.
- **Testes.** Seções novas em `e2e/kiosk-check.mjs`, rodadas por `e2e/kiosk.sh`.

**Tech Stack:**
- three r128 num HTML único (`proto/salto88v3.template.html`, cerca de 6,9 mil linhas);
- Node 22 (`node --test`, lê `.ts`);
- Playwright com SwiftShader;
- `python -m http.server`;
- ffmpeg 9 (já instalado, só na ferramenta de imagens).

**Spec:** `docs/superpowers/specs/2026-10-29-salto-88-claro-e-jogavel-design.md`

## Global Constraints

**Onde se trabalha:**
- O código fica no laboratório `.superpowers/salto88-lab` (repositório git próprio, branch `master`).
- O build sai em `public/salto88`, no repositório do site, branch `salto-88-claro`.

**Build:** a partir do lab:

```bash
bash e2e/idle.sh node build-v3.mjs D:/Projetos/Luis/project-ve2/.superpowers/salto88-lab D:/Projetos/Luis/project-ve2/public/salto88
```

Nunca rodar o build com um servidor de teste de pé.

**Como rodar:**
- Todo teste e todo build rodam em 1 núcleo Idle (`e2e/idle.sh`).
- Com o OK do Luis, vale `export SALTO_CORES=4 SALTO_PRIO=BelowNormal` até ele avisar que vai jogar.
- Um servidor de teste por vez.
- Ao final, nenhum `chrome-headless-shell` nem `python http.server` de teste fica vivo.
- Não matar o `python` do `D:/Projetos/Mugen/engine/tools/run_suite.py` nem os `node` do Codex.
- Nunca abrir Godot nem outros apps pesados.

**Teste novo:** cada teste novo é visto falhar antes da mudança:
1. `git show HEAD:public/salto88/index.html > public/salto88/_old.html` (no site);
2. rodar a seção contra `_old.html`;
3. apagar o arquivo depois.

Testes estáticos falham contra o template ou o manifesto antes da mudança.

**Template:**
- Edições em Python usam `open(..., newline='')`.
- Nunca `//` no meio de uma linha de código, só `/* */`.
- Nada aloca por frame: vetores de trabalho criados uma vez, canvas redesenhado só quando muda.

**Arquivo novo no lab:** precisa de uma linha `!/<caminho>` no `.gitignore`, que é uma lista branca:
- `e2e/content-rules.test.mjs`;
- `e2e/media.test.mjs`;
- `tools/media-images.mjs`;
- `proto/media.json`.

`proto/video/` e `proto/img/` continuam fora do git do lab (binários); o build os copia para o site, onde ficam versionados.

**Textos novos, só estes:**
- `Este jogo tem som · <kbd>M</kbd> ou toque em Som` e, no toque, `Este jogo tem som · toque em Som`.
- Os avisos de tecla do spec §3.2:
  - `<kbd>Espaço</kbd> derrapa`;
  - `<kbd>E</kbd> sobe · <kbd>Q</kbd> desce`;
  - `<kbd>Q</kbd> desça até a doca`;
  - `<kbd>Enter</kbd> próximo · <kbd>Esc</kbd> dirigir`;
  - `<kbd>H</kbd> buzina`.
- No toque: `Use ▲ e ▼ para subir e descer`, `▲ Subir` e `▼ Descer`.
- Os nomes de alvo: `LARGADA`, `CONES`, `LAMA`, `RAMPA`, `CHEGADA`, `PONTE`, `COMANDO`, `ESCRITÓRIO`, `CLIENTES`, `PRAÇA`, `PACOTE`, `DOCA`, `ARGOLA`, `SAÍDA`.
- Nada mais sobre a carreira do Luis. Nenhum telefone. Nenhum fetch de terceiros.

**Números (spec):**
- **Seta e farol:**
  - a seta some com o alvo na tela e a menos de 40 m;
  - o farol apaga a menos de 6 m em 0,4 s;
  - um farol só.
- **Avisos:**
  - aviso de tecla some ao usar a tecla ou em 8 s, uma vez por visita;
  - aviso de som dura 4 s;
  - o botão Som pulsa até 20 s;
  - botões de toque com pelo menos 44×44 px.
- **Regras de cena:**
  - R1: 9 de 9 raios na placa;
  - R3: no máximo 1 de 9 raios bate antes do assunto;
  - R6: sai da vaga em até 3 s, com no máximo 120° de giro saindo com W.
- **Galeria:**
  - até 2,5 MB e até 4 chamadas de desenho;
  - quadros de 1024×512, em 2 atlas de 4096×2048;
  - carrega só na era `redbit`.
- **Desempenho:** perda máxima de 5% de fps.
- **Notas das fotos:** nenhuma abaixo de 7 e média de pelo menos 8 por tela.
- **Telas:** desktop 960×540, celular em pé 375×812, celular deitado 812×375.

**Coordenadas (mapa do código, 29 out):**

| O quê | Onde |
|-------|------|
| Pista | largada z -12, cones z -16/-22,5/-29, lama (-45, -34), rampa (-47,6, -39), chegada z -53, todos em x -45 |
| Ponte | (-45, -45) |
| Comando | (41, 25) |
| Vaga RedBit | (8,75; 57,5) |
| ValiantGroup | escritório (-8,75; 57,5), clientes (-8,75; 15,5), praça (8,75; -21) |
| Colmeia | heliponto PICK (23; 18; 63); doca DROP (15,5; 2,4; -66) |
| Argolas EVIG | `RINGS` em T:5496 |
| Marginal | sem posição: `S.jam.len - S.jam.dist` |
| Parada `animacoes` | (8,75; -63); quarteirão `0,-2` = x 0..42, z -84..-42 |

**Fluxo:**
- Só Claude, sem DeepSeek.
- Commits no lab e no site terminam com `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Cada tarefa faz commit no lab e, depois do build, commit de `public/salto88` no site (`build(salto88): …`).
- Sem push, merge ou deploy sem OK novo do Luis.
- **Leva 1** = Tarefas 1 a 9. **Leva 2** = Tarefa 10, que segue o ciclo de fotos (fotografar, dar nota, corrigir em lote, fotografar de novo), com as regras R1 a R7 como guarda.

## Review Focus

1. **Troca de era com alvo, farol, aviso de tecla ou galeria carregando.** O alvo e o farol da era velha somem e o aviso some. A textura da galeria que termina de carregar depois da troca é descartada sem erro. Testes: Tarefa 6 (`objetivo`) e Tarefa 5 (`galeria`).
2. **Modo Foto (F) com seta, farol ou aviso de tecla na tela.** Os três somem nas fotos e voltam ao sair. Testes: Tarefas 6 e 7.
3. **Demo e tour.** Nem avisos de tecla nem aviso de som enquanto o piloto automático dirige. A seta continua apontando o alvo. Teste: Tarefa 7 (`teclas`).
4. **Celular girado com aviso na tela.** O modo toque vem de `(pointer: coarse)`, não do tamanho da tela. Girar não faz aparecer tecla desenhada e o aviso de voo continua junto dos botões ▲▼. Teste: Tarefa 7.
5. **Parada aberta pelo demo e o visitante assume.** O carro sai da vaga em até 3 s, sem girar no lugar. Teste: Tarefa 8 (`paradas-saida`).

---

## Leva 1

### Tarefa 1: Conteúdo — o radar sai e as marcas da Valiant ficam na Valiant (R5, R7 texto)

**Files:**
- Create: `e2e/content-rules.test.mjs`, mais a linha no `.gitignore`.
- Modify: `proto/salto88v3.template.html`:
  - o bloco do radar (T:3417–3480);
  - os comentários em 3164, 3482, 3624 e 4565;
  - `PL` em 3204;
  - o lote `reserveLot('0,0', -1, -1)` em 3448;
  - o texto do "Sobre" em 288;
  - `S.radar` e `S.radarShown` em 5622, 6321 e 6913;
  - o gancho `radar()` em 6849;
  - um marcador `/* VALIANT:BEGIN */` logo antes de `MISSION_VALIANT` (T:3744).
- Modify: `e2e/kiosk-check.mjs` (sai a seção `radar`, linha 361, e a menção na linha 32).
- Modify: `e2e/run.mjs`:
  - saem os testes das linhas 587, 595, 681 e 742;
  - nas linhas 628, 731 e 3786, saem só as leituras do radar.
- Modify: `e2e/qa.mjs` (295, 489) e `e2e/tour.mjs` (92, 95): saem as fotos do radar.

**Interfaces:**
- Produces: `visibleStrings(tpl) → [{ line, text }]` no teste. Junta os literais de string do `<script>` e o texto do HTML fora de `<script>` e `<style>`.
- Produces: `window.__salto.textLog() → [{ era, kind: 'toast' | 'mission', text }]`. É gravado por `toast()` e `setMission()`, com no máximo 400 entradas.

- [ ] **Step 1: Write the failing tests** em `e2e/content-rules.test.mjs`:

```js
const FORBIDDEN = [/radar/i, /2,0 s/, /TEMPO DE CARREGAMENTO/i, /lombada/i];
const BRANDS = [/S[ií]rio/, /Housi/, /Fiesta/, /Posadas/];
test('nenhum termo proibido nos textos do jogo', () => {
  const hits = visibleStrings(tpl).filter((s) => FORBIDDEN.some((r) => r.test(s.text)));
  assert.deepEqual(hits, []);
});
test('Sírio-Libanês, Housi e Posadas só na ValiantGroup', () => {
  const [a, b] = [lineOf('/* VALIANT:BEGIN */'), lineOf('/* VALIANT:END */')];
  const out = visibleStrings(tpl).filter((s) => BRANDS.some((r) => r.test(s.text)) && !(s.line > a && s.line < b) && !/2025 · ValiantGroup/.test(s.text));
  assert.deepEqual(out, []);
});
```

Seção `conteudo` em `kiosk-check.mjs`:
- Para cada era de 0 a 4: `goto(i)`, liga o demo (`S.demo = true` pelo `teleport({demo:true})`) e avança 40 s.
- `textLog()` não pode ter termo proibido.
- Marca da Valiant só pode aparecer com `era === 'valiant'`.

- [ ] **Step 2: Run to verify they fail.**
  - Run: `node --test e2e/content-rules.test.mjs`.
  - Expected: FAIL, com hits como "FISCALIZAÇÃO / ELETRÔNICA / TEMPO DE CARREGAMENTO", "Lento: …", `'lombada-eletronica'` e a linha 288. A segunda falha porque falta o marcador `VALIANT:BEGIN`.
  - A seção `conteudo` contra `_old.html` falha porque não há `textLog`.
- [ ] **Step 3: Implement.**
  - Remover tudo da lista Files.
  - O texto do "Sobre" (288) passa a: `desenvolvedor front-end. O escritório, a Rua das Conversões e as animações em JS; a FIAP fica na avenida.`
  - O lote `0,0` (-1, -1) deixa de ser reservado, e o quarteirão o preenche como os outros.
  - Adicionar o marcador `VALIANT:BEGIN`, o registro do `textLog` e o gancho.
- [ ] **Step 4: Run to verify they pass.**
  - `node --test e2e/content-rules.test.mjs` passa.
  - Fazer o build, depois rodar `bash e2e/kiosk.sh index.html conteudo` → PASS.
  - Rodar `node e2e/run.mjs http://127.0.0.1:8088/index.html "redbit|cidade|demo"` (com o servidor do `kiosk.sh`, `CHECK=e2e/run.mjs`) → os mesmos verdes de antes. A falha conhecida "HUD: celular em pé baixo" já existia antes deste branch.
- [ ] **Step 5: Commit.** No lab, `fix(content): the RedBit radar leaves the world; Valiant brands stay in the Valiant`. No site, `build(salto88): …`.

### Tarefa 2: Imagens — o manifesto e as capturas antigas

**Files:**
- Create: `proto/media.json`, `tools/media-images.mjs`, `e2e/media.test.mjs`, mais as linhas no `.gitignore`.
- Generated (fora do git do lab):
  - `proto/img/redbit-sites-0.webp` e `proto/img/redbit-sites-1.webp`;
  - `proto/img/valiant-housi.webp`, `proto/img/valiant-catalogo.webp` e `proto/img/valiant-bolt.webp`.

**Interfaces:**
- Produces: `proto/media.json`:

```json
{ "videos": [ { "file": "video/exercito-aman.webm", "subject": "...", "era": "exercito", "stops": ["aman"], "frames": "exercito-aman" } ],
  "images": [ { "file": "img/redbit-sites-0.webp", "subject": "...", "era": "redbit", "stops": ["animacoes"], "atlas": { "cols": 4, "rows": 4, "tiles": ["site1", "..."] } },
              { "file": "img/valiant-housi.webp", "subject": "Site do Housi", "era": "valiant", "stops": ["clientes"], "source": "site3" } ],
  "captures": { "site1": { "subject": "Bellastone, home", "group": "redbit", "crop": { "top": 0 } } } }
```

- Produces: `node tools/media-images.mjs <siteRepo> <labRoot>`. Para cada captura:
  1. lê do commit `1464479` (`git -C <siteRepo> show 1464479:public/imgs/sites/siteN.png`);
  2. corta `crop.top` px do topo;
  3. reduz para 1024×512 em modo capa (`scale=…:force_original_aspect_ratio=increase,crop=1024:512`);
  4. monta os atlas, 11 quadros no 0 e 10 no 1, e os 3 avulsos da Valiant em WebP de qualidade 78.

- [ ] **Step 1: Write the failing test** em `e2e/media.test.mjs`:
  - todo `.webm` de `proto/video` e todo `.webp` de `proto/img` tem uma entrada, e toda entrada tem arquivo;
  - os grupos de captura batem com o spec §4.7:
    - `redbit`: 1, 2, 4–17, 19, 25–28 (21 capturas);
    - `valiant`: 3, 18, 20;
    - `fora`: 21–24, que nenhuma imagem usa;
  - os atlas têm 4096×2048 (lidos do cabeçalho WebP `VP8X`);
  - a soma de `redbit-sites-*.webp` tem no máximo 2 621 440 bytes;
  - toda entrada cujo `subject` cita Sírio, Housi ou Posadas tem `era: 'valiant'`.
- [ ] **Step 2: Run to verify it fails.** `node --test e2e/media.test.mjs` → FAIL ("media.json não existe").
- [ ] **Step 3: Implement.**
  - Escrever `media.json`, já com os vídeos renomeados que a Tarefa 3 vai criar. O teste de arquivos de vídeo só vale depois dela, então marque esse caso com `skip` até a Tarefa 3 e cite isso no commit.
  - Para cada captura: abrir o PNG inteiro (`Read`), anotar o assunto, o grupo e o `crop.top` que tira a faixa de telefone. Se houver telefone no meio da página, a captura vai para `fora` e o grupo é registrado como decisão.
  - Rodar a ferramenta e abrir os 2 atlas para conferir os recortes.
- [ ] **Step 4: Run to verify it passes.** `node --test e2e/media.test.mjs` → PASS, com o caso de vídeo em `skip`.
- [ ] **Step 5: Commit** no lab: `feat(media): manifest and the old site captures, cropped and packed`.

### Tarefa 3: Mídia no lugar certo (R7)

**Files:**
- Modify: renomear em `proto/video`:
  - `aman` → `exercito-aman`;
  - `fiap` → `fiap-next`;
  - `comemoracao` → `fiap-formatura`;
  - `fullstack` → `redbit-site-bellastone`;
  - `mobile` → `valiant-sirio-streaming`.
  
  As chaves de `videos/frames.json` mudam igual.
- Modify: `proto/kiosk-map.json`:
  - `aman` → `exercito-aman`;
  - `comando` sem `video`;
  - `redbit` → `fiap-next`;
  - `animacoes` → `redbit-site-bellastone`;
  - `valiantgroup` → `valiant-sirio-streaming`.
- Modify: `tools/kiosk-content.mjs`. `buildKiosk({…, media})` falha se o vídeo do quiosque não estiver em `media.videos` ou se a parada não estiver nos `stops` dele.
- Modify: `build-v3.mjs`:
  - lê `proto/media.json` e passa para `buildKiosk`;
  - `rmSync(LAB + '/video')` antes da cópia;
  - copia `proto/img` para `LAB/img`.
- Modify: template:
  - `makeScreen` aceita `src.video` como lista (playlist);
  - o telão da AMAN usa `'exercito-aman'`;
  - o telão da FIAP usa `['fiap-next', 'fiap-formatura']`;
  - `vuiField` aceita `media`;
  - `BG.order` da praça;
  - `mediaTex(file)`;
  - gancho `media()`.
- Test: `e2e/kiosk-content.test.mjs` e a seção `midia` em `kiosk-check.mjs`.

**Interfaces:**
- Produces: `mediaTex(file) → THREE.Texture`. Usa um cache por arquivo e registra `{ era, where, file }` no `MEDIA_LOG`.
- Produces: `makeScreen(w, h, accent, { video: string | string[] })`. Com lista, `loop = false`, o evento `ended` passa ao próximo e `userData.video` aponta para o atual. `beatPlace('fiap-telao').play` volta ao índice 0.
- Produces: `vuiField(…, { media: { video: name } | { image: file } })`. O campo de TVs da torre usa a textura de mídia com um quadro só.
  - Hospital: `{ video: 'valiant-sirio-streaming' }`.
  - Housi: `{ image: 'img/valiant-housi.webp' }`.
- Produces: o telão de chegada da praça roda `[3, 0, 1, 2, 4, 5]`. O 4 é `img/valiant-catalogo.webp` e o 5 é `img/valiant-bolt.webp`.
- Produces: `window.__salto.media() → [{ era, where, file }]`. Junta as telas com vídeo (`VIDEOS`), o `MEDIA_LOG` e o vídeo do quiosque de cada parada da era (de `KIOSK_DATA`).

- [ ] **Step 1: Write the failing tests.**
  - Em `kiosk-content.test.mjs`: "o vídeo do quiosque precisa estar no manifesto e aceitar a parada". `buildKiosk` com `animacoes → valiant-sirio-streaming` lança `/não pode aparecer na parada animacoes/`.
  - Seção `midia`, para cada era de 0 a 4 (`goto(i)` e avanço de 3 s):
    - todo `media()` tem `file` no manifesto, com `era` igual à era atual;
    - a parada de um vídeo de quiosque está nos `stops` dele;
    - nenhum `file` de Sírio, Housi ou Posadas fora da `valiant`;
    - no telão da FIAP, o primeiro vídeo é `fiap-next` e, depois do evento `ended` (forçado com `currentTime = duration`), vem `fiap-formatura`.
- [ ] **Step 2: Run to verify they fail.**
  - `node --test e2e/kiosk-content.test.mjs` → FAIL, porque `media` é ignorado.
  - `midia` contra `_old.html` → FAIL, porque não há `media()`.
- [ ] **Step 3: Implement.** Os itens da lista Files, na ordem. Tirar o `skip` do caso de vídeo do `media.test.mjs`.
- [ ] **Step 4: Run to verify they pass.**
  - Unitários `kiosk-content`, `media` e `content-rules` → PASS.
  - Build, depois `bash e2e/kiosk.sh index.html midia,quiosque,beats,cenas` → PASS.
  - No site, `public/salto88/video` só tem os 5 nomes novos.
- [ ] **Step 5: Commit.** No lab, `fix(media): every video and capture where its subject belongs`. No site, `build(salto88): …`.

### Tarefa 4: Regras de cena e as cenas dos prints (R1–R4)

**Files:**
- Modify: template:
  - registros `SIGNS`, `SUBJECTS` e `OVERLAYS`, esvaziados no `enterEra` (o da rodovia em `enterHighway`);
  - `fitText`;
  - ganchos `sceneRules` e `textFit`;
  - os consertos das quatro cenas.
- Test: seção `cena-regras` em `kiosk-check.mjs`.

**Interfaces:**
- Produces: `signMark(obj, name, uv = [0, 0, 1, 1])`. Marca uma placa, tela ou rótulo com a área de texto em UV. `label()`, `colSign`, `evSign` e `makeScreen` passam a marcar sozinhos.
- Produces: `subjectMark(id, obj, uv)`. O assunto de uma parada ou lugar de item; o `id` é o id da parada ou do lugar.
- Produces: `overlayMark(obj, boardObj)`. Um aviso 3D e o quadro que ele acompanha.
- Produces: `fitText(ctx, text, x, y, maxW, font, size, minSize, lineH, maxLines, name)`.
  - `font` traz `#` no lugar do tamanho, como em `plFit`.
  - Diminui a fonte até `minSize` e depois quebra em linhas.
  - Registra `{ name, text, ok }` em `TEXTFIT`; `ok` é falso se nem assim couber.
- Produces: `window.__salto.sceneRules(cam?) → { r1: [{ name, hits: n9 }], r3: [{ id, blocked, by: [names] }], r4: [{ name, board, overlap }] }`.
  - `cam` é `{ stop }`, `{ beat }` ou `{ pos, look }`.
  - Com `cam`, fixa a câmera; sem `cam`, usa a câmera atual.
  - Raios com `THREE.Raycaster` contra a cena. Objetos com `userData.rayIgnore` não contam; marcar assim brilho, vidro e partículas.
  - R1 só vale para placas dentro do enquadramento e a no máximo 60 m.
- Produces: `window.__salto.textFit() → [{ name, text, ok }]`.

- [ ] **Step 1: Write the failing test.** Seção `cena-regras`, com estas cenas e câmeras:
  - `marginal`: `goto(1)`, `highway()`, Marginal com a placa centrada (avançar até `hw.sign` em z ≈ -30). R1 nos dois rótulos (`MARGINAL TIETÊ`, `LENTIDÃO 112 KM`) dá 9/9.
  - `praca`: `{ stop: 'praca-dos-teloes' }`. R3 nas telas da parede principal: bloqueio de no máximo 1/9, sem o `controle-remoto-gigante` e sem cabeças do público.
  - `praca-textos`: `textFit()` sem `ok: false` (as linhas "Hospital Sírio-Libanês", "Housi" e "Fiesta Americana" do `vuiScreen 'banner'`).
  - `aovivo`: o painel AO VIVO da Valiant, com a praça ao vivo (`setLive(true)`), no telão de chegada e nas TVs `live`. O selo "AO VIVO" não cobre o título nem os textos da interface. `fitText` registra a caixa de cada texto, e o selo registra a dele no mesmo canvas. `textFit()` devolve `{ name, text, ok, under: [selo] }` quando há sobreposição.
  - `jira`: câmera de chegada à doca, `{ pos: [15.5, 9, -50], look: [19.4, 5.9, -63] }`, mais a câmera da parada `sede-colmeia`.
    - R4: `placar-da-doca` e `letreiro-da-doca` não cruzam `quadro-kanban`.
    - R3: no quadro, bloqueio de no máximo 1/9 (sem hexágonos na frente).
    - `textFit()` sem o card INT-107 cortado.
  - **Todas as 14 paradas** (`{ stop: id }`): R1 em toda placa marcada. Na Leva 1 isso só falha por placa que esta tarefa marcou; as outras entram na Tarefa 10.
- [ ] **Step 2: Run to verify it fails.**
  - `bash e2e/kiosk.sh index.html cena-regras` → FAIL. Esperado: a Marginal com menos de 9/9, a praça bloqueada pelo controle, o banner com `ok: false` e o placar sobre o quadro.
  - Contra `_old.html`, falha por não haver ganchos.
- [ ] **Step 3: Implement.**
  - Primeiro os registros, `fitText` e os ganchos. Rodar e ler o relatório, que mostra quais objetos bloqueiam.
  - Depois os consertos, cada um decidido pelo relatório:
    - **Marginal:** os rótulos saem de trás das caixas de luz do pórtico (à frente em z ou abaixo delas).
    - **Praça:** o controle gigante muda de lugar ou de altura até R3 passar; as pessoas que bloqueiam mudam de lugar; o banner usa `fitText` com `800 #px`, de 33 a 22, até 2 linhas.
    - **Jira:**
      - o placar sobe acima do topo do quadro (y ≥ 8,6 + meia altura) ou vai para o lado;
      - o letreiro DOCA 1 sai da frente do quadro;
      - o que tapa a base sai do caminho;
      - o texto dos cards usa `fitText`.
  - Registrar cada mudança de lugar como decisão no ledger.
- [ ] **Step 4: Run to verify it passes.**
  - `cena-regras` → PASS.
  - `quiosque`, `beats` e `cenas` → PASS.
  - Em `run.mjs`, rodar `valiant|colmeia|marginal` → os mesmos verdes de antes.
- [ ] **Step 5: Commit.** No lab, `fix(scene): signs readable, subjects clear, texts fit (R1-R4)`. No site, `build(salto88): …`.

### Tarefa 5: Galeria de sites na RedBit

**Files:**
- Modify: template. `placeSitesGallery(K)` é chamada do bloco `0,-2` (`placeJsAnimations`, T:3640–3732), mais o gancho `gallery()`.
- Test: seção `galeria` em `kiosk-check.mjs`.

**Interfaces:**
- Consumes: os atlas e o `media.json` (`atlas.tiles`) da Tarefa 2, `mediaTex` da Tarefa 3, e `sceneRules` e `subjectMark` da Tarefa 4.
- Produces: `placeSitesGallery(K) → { group, rows: Mesh[4], update(dt) }`.
  - Parede de 16×8 m: 4 fileiras de 2 m de altura, quadros de 4×2 m.
  - Inclinada 12° para trás e girada −15° no plano, como a `GridMotion`.
  - Cada fileira é uma malha só, com os quadros dela repetidos duas vezes. As fileiras 0 e 1 usam o atlas 0; as 2 e 3, o atlas 1.
  - As fileiras deslizam a 0,5 m/s em sentidos alternados, com laço por módulo do comprimento.
  - Corte nas bordas da parede com `clippingPlanes` (`renderer.localClippingEnabled = true`).
  - A parede oscila ±10° no próprio eixo vertical, com período de 24 s.
  - Com o carro a até 40 m da vaga `animacoes`, a velocidade vai a 0,8 m/s.
  - Com `reduce.matches`, nada se move.
  - As texturas carregam quando `placeSitesGallery` roda, isto é, na era `redbit`. Um carregamento que termina depois da troca de era é descartado com `dispose()`.
- Produces: `window.__salto.gallery() → { loaded, rows, meshes, tiles, offsets: number[4], yaw, bytes } | null`. `bytes` soma `performance.getEntriesByType('resource')` dos `redbit-sites-*`.

- [ ] **Step 1: Write the failing test.** Seção `galeria`:
  - na era 0, nenhum recurso `redbit-sites` foi baixado;
  - `goto(1)`, depois espera `loaded`. Então:
    - `meshes ≤ 4`;
    - `tiles === 21`;
    - `bytes ≤ 2621440`;
    - dois `offsets` medidos com 1 s de diferença andam em sentidos alternados;
  - `sceneRules({ stop: 'animacoes' })`: R3 da galeria (`subjectMark('animacoes', …)`) com bloqueio de no máximo 1/9;
  - com `reducedMotion: 'reduce'`, os `offsets` não mudam em 1 s;
  - `goto(1)` e `goto(2)` em seguida, antes de carregar: nenhum `pageerror`, e `gallery()` dá `null` na era 2.
- [ ] **Step 2: Run to verify it fails.** `bash e2e/kiosk.sh index.html galeria` → FAIL (não há `gallery()`).
- [ ] **Step 3: Implement** `placeSitesGallery`.
  - **Lugar:** dentro do quarteirão `0,-2`, onde a câmera da parada `animacoes` vê a parede inteira sem as fachadas na frente. Testar 3 candidatos com `sceneRules({ stop: 'animacoes' })` e fotos:
    - acima das fachadas (centro em y 17, x 21, z -63);
    - na quina sul (x 20, z -79, virada para +z e −x);
    - na faixa leste (x 36, z -63).
  - Fica o primeiro que passar R3 e ficar bem na foto. Registrar a decisão.
- [ ] **Step 4: Run to verify it passes.**
  - `galeria`, `cena-regras` e `quiosque` → PASS.
  - Em `run.mjs`, `redbit` → os mesmos verdes de antes.
- [ ] **Step 5: Commit.** No lab, `feat(redbit): the site captures back as a turning gallery`. No site, `build(salto88): …`.

### Tarefa 6: Objetivo — seta e farol

**Files:**
- Modify: template:
  - `world.goal` em cada construtor de era;
  - o farol;
  - a seta (T:6671–6675);
  - a variante da Marginal;
  - o gancho `goal()`.
- Test: seção `objetivo` em `kiosk-check.mjs`.

**Interfaces:**
- Produces: `world.goal?: () => ({ x, y, z, label, icon } | null)`. É chamada uma vez por frame, sem alocar: devolve um objeto reaproveitado ou `null`.

| Era | Regra |
|-----|-------|
| `exercito` | Pista: `LARGADA` (-45, -12) até largar. Durante a pista, o próximo trecho: `CONES` (-45, -22,5), `LAMA` (-45, -34), `RAMPA` (-47,6, -39), `CHEGADA` (-45, -53). Depois da pista, `null`. Com o comboio a caminho (`CVI` ativo e sem travessia), `PONTE` (-45, -45). Na volta, `COMANDO` (41, 25) |
| `redbit` | `ESCRITÓRIO` (8,75; 57,5) enquanto `MISSION.long === MISSION_OFFICE` |
| `valiant` | A primeira não visitada (`st.visited`) entre `valiantgroup`, `clientes` e `praca-dos-teloes`: `ESCRITÓRIO`, `CLIENTES`, `PRAÇA` |
| `colmeia` | Sem pacote, `PACOTE` em PICK; com pacote, `DOCA` em DROP. `null` depois da primeira entrega |
| `evig` | `ARGOLA`: a primeira de `rings` ainda não passada |

- Produces: o farol `farol-do-objetivo`. Um só, criado uma vez:
  - cilindro de 0,6 m de raio por 40 m de altura;
  - aditivo, `fog: false`, `depthWrite: false`, na cor `era.accent`;
  - no topo, um ícone em canvas de 128×128, girando uma volta a cada 3 s (`▣` pacote, `⬇` doca, `◯` argola, `◆` o resto);
  - some em 0,4 s a menos de 6 m e com `S.photo`;
  - sem giro com `reduce.matches`.
- Produces: a seta mostra `label + ' · ' + m + ' m'`. Com alvo, some se o alvo projetado estiver na tela e a menos de 40 m. Sem alvo, segue a regra atual do portal. Na Marginal (`S.jam` ativo), mostra `SAÍDA · <len − dist> m` com a seta para cima, e não há farol na rodovia.
- Produces: `window.__salto.goal() → { label, x, y, z, guide: { hidden, text }, beacon: { visible, opacity, count } } | null`.

- [ ] **Step 1: Write the failing test.** Seção `objetivo`, com um caso por linha da tabela. Usar `teleport`, `park` e os ganchos que já existem (`courseTest`, `convoy`, `colmeia`, `rings`), e checar `label` e `guide.text`.
  - O farol aparece e, com `teleport` a 5 m do alvo, `opacity` chega a 0 em ≤ 0,5 s.
  - `count === 1` em todas as eras.
  - De costas para o alvo (`h + π`), a seta aparece. De frente e a menos de 40 m, some.
  - Depois de `goto(i)` para outra era, nenhum alvo da era anterior (Review Focus 1).
  - Com F, farol e seta escondidos; depois de F de novo, voltam (Review Focus 2).
  - Marginal: `goto(1)`, `highway()`, então `guide.text` casa com `/^SAÍDA · \d+ m$/`.
- [ ] **Step 2: Run to verify it fails.** `bash e2e/kiosk.sh index.html objetivo` → FAIL (não há `goal()`).
- [ ] **Step 3: Implement.** O farol e a seta primeiro, depois um `world.goal` por era.
- [ ] **Step 4: Run to verify it passes.**
  - `objetivo` → PASS.
  - Em `run.mjs`, `guia|portal|tour|demo` → os mesmos verdes de antes.
  - Rodar o teste de desempenho (`test:perf` do site) → no máximo 5% de queda.
- [ ] **Step 5: Commit.** No lab, `feat(guide): the arrow and a beacon point at each mission's goal`. No site, `build(salto88): …`.

### Tarefa 7: Teclas no contexto e aviso de som

**Files:**
- Modify: template:
  - CSS de `kbd`, `.touch`, `.pulse`/`.attn`, `#keyhint` e `#sndCue`;
  - o HTML do `#start` e dos botões (T:244–266);
  - `keyHint` e `soundCue`;
  - `activate` (6692), `setSound` (754), `readInput` (6429) e `enterEra`;
  - os ganchos.
- Test: seções `som` e `teclas` em `kiosk-check.mjs`.

**Interfaces:**
- Produces: `TOUCH`, que vem de `matchMedia('(pointer: coarse)')`, ouvido com `change`. A classe `.touch` na `.stage`:
  - esconde todo `kbd`;
  - botões de toque com no mínimo 44×44 px;
  - `#upBtn` diz `▲ Subir` e `#downBtn` diz `▼ Descer`.
- Produces: `keyHint(id, html, done)`.
  - Mostra no `#keyhint` (`aria-live="polite"`), no centro de baixo.
  - No máximo uma vez por visita (`HINTS_SEEN`).
  - Some quando `done()` fica verdadeiro ou em 8 s, e enfileira o próximo.
  - Não aparece com `S.demo`, `S.tour`, `S.photo` ou na tela final.
  - Se o retângulo dele cruzar o `#kiosk` ou o `#card`, sobe para o topo, abaixo das ferramentas.

| id | Quando | Pronto quando | Toque |
|----|--------|---------------|-------|
| `drift` | Até 8 s depois do primeiro `activate` | Espaço apertado | Não mostra |
| `fly` | Ao entrar numa era com `world.flight` | Subiu e desceu uma vez | `Use ▲ e ▼ para subir e descer`, junto do `#lift` |
| `drop` | `S.carrying` vira verdadeiro | Q ou Shift, ou entregue | Não mostra |
| `kiosk` | Primeiro `openKiosk` do visitante | Enter, Esc ou clique em `#kNext` ou `#kDrive` | Não mostra |
| `horn` | Primeira vez a até 6 m de uma pessoa ou de um carro do trânsito parado | H | Não mostra |

- Produces: `soundCue()`, no primeiro `activate()` da visita.
  - Mostra `#sndCue` por 4 s.
  - Põe no `#sndBtn` a classe `pulse` (ou `attn` com `reduce.matches`) até `setSound` ou 20 s.
  - `#sndCue` também é `aria-live="polite"`.
- Produces: `window.__salto.hints() → { current, seen, rect }` e `window.__salto.soundCue() → { shown, cls }`.

- [ ] **Step 1: Write the failing tests.**
  - **Seção `som`:**
    - o primeiro clique em `#start` mostra `#sndCue` com o texto do spec;
    - `#sndBtn` fica com `.pulse` e o perde ao apertar M;
    - num novo `open`, sem M, perde a classe em 20 s;
    - `deactivate` e `activate` de novo não mostram o aviso outra vez;
    - com `reducedMotion: 'reduce'`, a classe é `attn`.
  - **Seção `teclas`:**
    - cada linha da tabela aparece no momento dela e some ao usar a tecla. Sem usar, some em 8 s;
    - o retângulo do `#keyhint` nunca cruza o `#kiosk`, com a parada `redbit` aberta;
    - com `S.demo`, nenhum aviso (Review Focus 3);
    - com F, o aviso some;
    - o `#start` contém `kbd` W, A, S e D;
    - num contexto com `hasTouch: true` e `isMobile: true` (375×812 e depois 812×375):
      - nenhum `kbd` visível;
      - os botões de toque com no mínimo 44×44 px;
      - o aviso de voo com o texto do toque, perto do `#lift`;
      - girar não traz tecla desenhada (Review Focus 4).
- [ ] **Step 2: Run to verify they fail.** `bash e2e/kiosk.sh index.html som,teclas` → FAIL.
- [ ] **Step 3: Implement** os itens da lista Files. O `aria-label` dos botões continua com nome e tecla, por exemplo "Som (M)".
- [ ] **Step 4: Run to verify they pass.**
  - `som`, `teclas`, `botoes`, `celular` e `foto` → PASS.
  - `run.mjs`, `hud|som|celular` → os mesmos verdes de antes.
- [ ] **Step 5: Commit.** No lab, `feat(hud): keys shown when they matter, and a sound cue`. No site, `build(salto88): …`.

### Tarefa 8: Paradas que não travam (R6)

**Files:**
- Modify: template. O conserto sai da investigação; o ponto de partida está no mapa:
  - autopilot em 6410–6420;
  - `stepWorld` em 6430–6450;
  - `updateCamera` em 6569–6582;
  - resgate da calçada em 4613–4628.
- Test: seção `paradas-saida` em `kiosk-check.mjs`.

**Interfaces:**
- Consumes: `park(page, eraIdx, stopId, stay)`, `stops()`, `info()` e `teleport()`.
- Produces: o helper de teste `exitBay(page, keys, secs) → { left: boolean, t, yaw, stuck, camErr }`.
  - Segura as teclas.
  - Mede o tempo até `active === false` e a distância da vaga maior que 4 m.
  - Mede o giro acumulado de `car.h`.
  - `stuck` quando a velocidade fica abaixo de 0,5 depois de 1 s.
  - `camErr` é a diferença entre a direção da câmera e a do carro 1,5 s depois de sair.

- [ ] **Step 1: Write the failing test.** Seção `paradas-saida`. Para cada uma das 14 paradas, `park` e quatro saídas: W; W+A; W+D; Esc e depois W.
  - Nas paradas de plataforma ou deck (`sede-colmeia` e as 4 da EVIG), cada saída começa com E por 1 s.
  - Esperado:
    - `left` em ≤ 3 s;
    - `yaw ≤ 120°` saindo com W;
    - `yaw ≤ 270°` saindo com W+A e W+D;
    - `!stuck`;
    - `camErr ≤ 35°`.
  - Mais o caso do demo: com `teleport({demo:true})` e o demo estacionado na `redbit` com o quiosque automático, W tira o carro em ≤ 3 s (Review Focus 5).
- [ ] **Step 2: Run to verify it fails.** `bash e2e/kiosk.sh index.html paradas-saida`. Esperado: alguma parada falha. Ler quais, com que tecla e com que medida.
- [ ] **Step 3: Investigate** com superpowers:systematic-debugging, antes de qualquer conserto. Confirmar ou descartar as hipóteses do spec §5.2 e as do mapa:
  - o autopilot orbitando o ponto da vaga, com raio 1,2 dentro do círculo de giro, sem o atalho `passed`;
  - o `unstick` em ré;
  - o giro de colisão `c.w`;
  - o `landAssist`;
  - o resgate da calçada;
  - o `camYaw` parado enquanto `S.parked > 1.2`.
  
  Escrever a causa no ledger.
- [ ] **Step 4: Fix** a causa, com o menor conserto. Rodar `paradas-saida` → PASS.
- [ ] **Step 5: Run** `quiosque`, `dirigir`, `assumir`, `travado`, `demo-beats`, `vaga` e o `stops-end-check` → PASS.
- [ ] **Step 6: Commit.** No lab, `fix(stops): any driving key takes the car out of the bay`. No site, `build(salto88): …`.

### Tarefa 9: Fotos da varredura e fechamento da Leva 1

**Files:**
- Modify: `e2e/kiosk-check.mjs` (seção `fotos-varredura`).
- Create: `docs/superpowers/varredura/2026-10-29-notas.md`, no site.

**Interfaces:**
- Produces: a seção `fotos-varredura`.
  - Variáveis de ambiente: `VP=desk|phone|land` (sem `VP`, as três), `ERA` e `CENA`.
  - Grava `e2e/varredura/<era>-<cena>-<vp>.png`.
  - Espera real de 400 ms antes de cada foto e 8 s depois de `goto`, como em `fotos-beats`.
  - Cenas da Leva 1:
    - `marginal`, `praca`, `jira`;
    - `galeria`;
    - `objetivo-colmeia` (pacote a bordo) e `objetivo-valiant`;
    - `som` (logo depois do Dirigir) e `teclas-voo`;
    - `redbit` com o painel aberto;
    - `clientes` (TVs do hospital e do Housi).

- [ ] **Step 1: Write** a seção e rodar: `bash e2e/kiosk.sh index.html fotos-varredura`.
- [ ] **Step 2: Score.** Abrir cada foto (`Read`) e escrever no arquivo de notas, por foto, a nota de 0 a 10 e os defeitos.
- [ ] **Step 3: Fix in batch** o que estiver abaixo de 7, ou que deixe a média abaixo de 8, nas cenas da Leva 1. Cada conserto que muda regra ganha um caso na seção da regra. Fotografar de novo e atualizar as notas.
- [ ] **Step 4: Full suite.**
  - Unitários: `node --test e2e/content-rules.test.mjs e2e/media.test.mjs e2e/kiosk-content.test.mjs`.
  - Todas as seções do `kiosk-check`.
  - `run.mjs` inteiro.
  - `stops-end-check`.
  - No site: `npm run typecheck`, `npx vitest run` e `npm run build`.
  - Teste de desempenho: no máximo 5% de queda de fps contra a `main`.
  - Registrar os números. Uma falha que já existia antes do branch é nomeada no relatório.
- [ ] **Step 5: Commit** das notas e do build. Perguntar ao Luis se faz o merge na `main`, o push e o deploy (`scripts/deploy-vps.sh`). Não seguir sem o OK.

## Leva 2

### Tarefa 10: Varredura completa

Segue o ciclo de fotos. Não há TDD por defeito; cada regra nova ou caso novo de regra entra na seção dela.

**Files:**
- Modify: template, para as marcações e os consertos.
- Modify: `e2e/kiosk-check.mjs`:
  - cenas da varredura completa;
  - `cena-regras` para as 14 paradas e os lugares de item;
  - a lista `FORBIDDEN` em `content-rules.test.mjs`.
- Modify: as notas.

- [ ] **Step 1: Mark.**
  - Toda placa, tela e rótulo de todas as eras recebe `signMark`.
  - Toda parada e lugar de item recebe `subjectMark`.
  - Todo aviso 3D recebe `overlayMark`.
  - Todo `fillText` de placa ou tela que pode passar da caixa passa a usar `fitText`.
- [ ] **Step 2: Inventory.** Listar todos os textos (`visibleStrings` e `textLog` com o demo rodando cada era) e todas as mídias (`media()`).
  - Conferir cada um contra a história da era.
  - O que sobrou de versão antiga sai, e o termo entra em `FORBIDDEN`.
  - Mídia nova só com uma entrada no manifesto e o conteúdo conferido.
- [ ] **Step 3: Shoot** `fotos-varredura` com todas as cenas do spec §4.1:
  - eras;
  - rodovia e Marginal;
  - cada uma das 14 paradas com o painel aberto;
  - cada lugar de item;
  - os estados de missão.
  
  Nas três telas.
- [ ] **Step 4: Score** cada foto nas notas. Dar também a nota de experiência de cada parada (chegar, entender, sair) do spec §4.6.
- [ ] **Step 5: Fix in batches** por regra, de R1 a R7, e por era. Depois de cada lote, rodar `cena-regras`, `conteudo` e `midia` e fotografar de novo as cenas afetadas. Repetir até:
  - nenhuma foto abaixo de 7 e média de pelo menos 8 nas três telas;
  - R1 a R7 verdes em toda parada e cena;
  - "sair" com nota 10 em toda parada.
- [ ] **Step 6: Full suite** como na Tarefa 9, Step 4. Registrar nas notas as paradas mais fracas em "chegar" e "entender", como entrada para a parte D.
- [ ] **Step 7: Commit** e perguntar ao Luis sobre o merge, o push e o deploy.
