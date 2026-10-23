# Garagem: a entrada do site — Design

Data: 2026-10-23 · Branch: `salto-88` · Autor: Luis Didonato (com Claude)
Substitui a mecânica do hub de `2026-10-14-portfolio-v3-design.md` §3.2–3.6 (o hub de 5 zonas ainda é o que a home monta hoje). O resto daquela spec (pit stop, i18n, contato, SEO, conteúdo, falhas) continua valendo. O jogo continua o de `2026-10-15-salto-88-design.md` com a curadoria de `2026-10-20-salto-88-curadoria-design.md`.

## 1. Por quê

O Salto 88 chegou a 9 em todas as áreas, mas quem abre o site não chega até ele: `/pt` ainda monta o hub antigo (`components/game/Hub.tsx`), o jogo só existe em `public/lab/v3/index.html`, sem link, e `public/lab/` está em `.git/info/exclude`, então um deploy sairia sem o jogo. A garagem resolve a entrada: o site abre numa bancada com um micro de 1988, a tela dá o currículo, o contato e a troca para inglês, e atrás do portão o DeLorean espera para levar ao jogo.

Sucesso = o recrutador acha cargo, currículo e contato em 10 s sem jogar; quem quer jogar aperta J e vive um momento (o portão subindo); o Google e os leitores de tela continuam lendo o pit stop.

## 2. Decisões fechadas

| Tema | Decisão |
|------|---------|
| Cena | Bancada da garagem à noite, por volta de 1988: micro bege com monitor de tubo e fósforo âmbar, teclado, lâmpada, ferramentas; portão de enrolar com a metade de baixo aberta e o DeLorean atrás, faróis vazando luz fria no chão |
| Menu da tela | Enxuto, quatro teclas: C Currículo, J Jogar Salto 88, K Contato, E English (no `/en`: C Resume, J Play Salto 88, K Contact, E Português) |
| Currículo | C leva a câmera até o monitor encher a janela; o currículo é HTML legível, rola normal, tem o botão do PDF; Esc ou Voltar recua a câmera até a bancada |
| Serviços | Deixam de ser uma seção própria na tela; viram uma linha de consultoria dentro do Contato (o pit stop continua com a seção) |
| Inglês | E troca a rota para `/en` (tela, currículo, contato). J leva ao jogo em português, com o aviso "Game in Portuguese for now". A tradução do jogo é a parte 3 |
| Abordagem | Garagem em R3F dentro do site (stack atual: `GameMount`, drei, zustand); jogo como página estática separada |
| Jogo no deploy | A build do laboratório sai em `public/salto88/` e entra no git; `public/lab/` continua fora |
| Ferramentas | Só Claude, como no Salto 88 |

## 3. Experiência

### 3.1 Estados

| Estado | Câmera | Tela | Saídas |
|--------|--------|------|--------|
| `bancada` | 3/4 pela frente e à esquerda, micro no terço esquerdo, portão à direita | Menu: nome em altura dupla, cargo (`profile.headline`), as quatro teclas, cursor `> _` | C, K vão para `tela`; J vai para `partida`; E troca o idioma e fica em `bancada` |
| `tela` | Voa até o monitor (cerca de 0,9 s) até o vidro encher a janela | Currículo (C) ou Contato (K) | Esc, Voltar ou clicar fora do vidro: volta para `bancada`. A outra tecla troca o conteúdo sem sair |
| `partida` | Gira até o carro e avança | "Destino: fev 2019" (no `/en`: "Destination: Feb 2019"), a data de início do Exército no painel do jogo | Navega para `/salto88/index.html` ao fim da sequência; Esc antes disso cancela e volta para `bancada` |

- **Carga.** O pit stop é o primeiro paint (como hoje). O canvas entra por cima; a tela "liga" com a linha que se abre do centro (cerca de 0,6 s) e o menu aparece inteiro de uma vez, sem digitação letra a letra.
- **Partida (o único momento ousado).** Tecla J afunda, a tela imprime o destino, a lâmpada pisca duas vezes, o portão sobe em cerca de 1,6 s, a luz fria dos faróis invade a garagem quente, a câmera gira até o carro, os faróis estouram para branco e a página navega. Tudo dentro de 3,5 s. O HTML do jogo é pré-carregado (`<link rel="prefetch">`) quando a cena fica ociosa, para a navegação não cair numa tela vazia.
- **Fora disso, quieto.** Em `bancada` só o cursor pisca e o tubo tem um tremor leve de brilho. Sem órbita automática, sem modo demo, sem objetos girando.
- **Teclado.** O teclado real e o clique (ou toque) na tecla 3D disparam a mesma ação. Qualquer tecla real afunda a tecla 3D correspondente, mas só C, J, K, E e Esc agem. A última ação aparece no cursor (`> currículo`).
- **Âncoras.** `#curriculo` e `#contato` (no `/en`: `#resume` e `#contact`) abrem a página já em `tela` com o conteúdo certo, para o recrutador mandar o link direto. O estado atualiza o hash via `history.replaceState`; `bancada` limpa o hash.
- **Idioma.** E troca `/pt` ↔ `/en` mantendo o estado e o hash equivalente. Os textos fixos da garagem moram em `messages/{pt,en}.json`; o conteúdo vem de `content/{pt,en}/profile.ts`.
- **Volta do jogo.** No laboratório, o HUD do jogo e o painel de contato do showroom ganham o link "Voltar à garagem", que leva a `/pt` (ou `/en` se o jogo foi aberto com `?lang=en`; o jogo lê esse parâmetro só para o link e para o aviso de idioma).

### 3.2 Conteúdo da tela

Tudo que se lê na tela é HTML de verdade, posto sobre o vidro com o `<Html transform>` do drei (nítido, selecionável, lido pelo leitor de tela). O 3D só emoldura.

- **Menu.** Nome, cargo e as quatro teclas como botões reais, na ordem C, J, K, E.
- **Currículo (C).** Resumo (`summary`), experiência (`experience`), cases (`cases`), competências (`skills`), formação (`education`) e idiomas (`languages`), nessa ordem, com os textos do perfil sem enfeite e sem número inventado. Botão do PDF (`links.cv`); no `/en`, enquanto `links.cv.en` for `null`, o botão diz "PDF (in Portuguese)" e abre o PDF em português.
- **Contato (K).** E-mail (ofuscado como no pit stop), LinkedIn, GitHub, Cal.com só quando `links.calcom` existir, o formulário atual (Resend) e uma linha de consultoria tirada de `services`. Nada de telefone.
- **Grade de 80 colunas.** Currículo e contato seguem a grade do terminal de 1985: texto alinhado à esquerda, no máximo 72 caracteres por linha, rolagem dentro do vidro com a barra no estilo da tela.

## 4. Estilo

### 4.1 Paleta

| Nome | Hex | Uso |
|------|-----|-----|
| Vidro apagado | `#17130C` | Fundo da tela |
| Fósforo âmbar | `#FFB000` | Texto da tela; casa com o circuito âmbar "ÚLTIMA PARTIDA" do jogo |
| Fósforo baixo | `#C48E12` | Texto secundário da tela (cerca de 6:1 sobre o vidro) |
| Plástico bege | `#D6CBB0` | Micro e teclas, ABS levemente amarelado |
| Concreto | `#3A403F` | Chão e paredes na sombra |
| Lâmpada | `#FFCF8A` | Luz quente da bancada |
| Faróis | `#DDE8FF` | Luz fria do DeLorean |

A página nunca é um fundo chapado: é a cena, iluminada em duas temperaturas (tungstênio dentro, faróis fora). O âmbar fica só no vidro. Fora: fósforo verde, scanlines pesadas, magenta e ciano do synthwave (continuam só no jogo e no pit stop).

### 4.2 Tipografia

- **Na tela:** só IBM Plex Mono (já carregada), herdeira do terminal da IBM dos anos 80. Hierarquia por tamanho; o nome em "altura dupla" (o dobro da altura, a mesma largura, como no teletexto) é o único tratamento ousado. Corpo do currículo a 18 px equivalentes na tela cheia.
- **Fora da tela** (Versão em texto, PT | EN, som): IBM Plex Sans. A Michroma não entra na garagem.
- **Legendas das teclas:** Plex Sans desenhada num canvas compartilhado (uma textura para todas as teclas).
- Sem rótulos em caixa alta, sem seta "→" nos botões, sem sobrancelhas sobre os títulos.

### 4.3 Composição

```
desktop (16:9)
+---------------------------------------------------------------+
| ferramentas      lâmpada      |  portão (metade de baixo aberta)|
|    +------------+             |  =============================  |
|    | Luis       |             |  =============================  |
|    | Didonato   |  (dupla)    |  ..luz fria vazando no chão...  |
|    | CTO / Tech Lead na EVIG  |  [faróis]   DeLorean baixo      |
|    | C Currículo  J Jogar     |                                 |
|    | K Contato    E English   |                                 |
|    +------------+  bancada    |                                 |
|  [ teclado: C J K E acesos ]  |                                 |
+---------------------------------------------------------------+
 inferior esquerdo: Versão em texto            inferior direito: PT | EN

celular em pé
+-------------------+
|  luz do portão    |
| +---------------+ |
| | Luis          | |
| | Didonato      | |
| | CTO / Tech... | |
| | C J K E       | |
| +---------------+ |
| [C] [J] [K] [E]   |   teclas 3D grandes, 44 px ou mais de alvo
| Versão em texto   |
+-------------------+
```

- **Desktop:** câmera a 3/4; o portão ocupa a metade direita, o carro aparece baixo, pela abertura.
- **Controles fora da tela (ajuste do plano):** o botão do pit stop fica onde já está (inferior direito no desktop, superior direito no celular; os testes de modo fixam isso). Som, Créditos e PT | EN ficam no canto inferior esquerdo.
- **Celular em pé:** câmera de frente e mais perto; o monitor ocupa cerca de 55% do alto; o teclado vira uma fileira de quatro teclas grandes (C, J, K, E) que afundam ao toque. Celular deitado usa o enquadramento do desktop.
- **Tela cheia (C/K):** o vidro enche a janela com uma moldura bege fina visível nas bordas; no celular a moldura some e sobra o vidro.

### 4.4 Modelos e luz

- Micro, monitor, teclado, bancada, ferramentas e portão são procedurais (primitivas e materiais simples, nada de modelo novo baixado). As teclas são instanciadas.
- O DeLorean é o `public/models/delorean.glb` (1,5 MB) que o site já tem, com crédito (dark_igorek, CC BY 4.0, modificado) na gaveta de créditos.
- Luz: a lâmpada (pontual, quente, com sombra só na bancada) e os faróis (dois spots frios; durante a partida sobem até estourar). Sem pós-processamento pesado; um bloom leve só no vidro e nos faróis, desligado na faixa baixa de GPU (`lib/game/tier.ts`).

### 4.5 Som

Mudo até o primeiro clique ou tecla, com botão para silenciar sempre visível. Sons gerados no Web Audio, sem arquivo novo: clique de tecla mecânica, o ronco do portão subindo e a partida do motor no J. O estado do som fica em `lib/storage.ts`.

## 5. Acessibilidade e falhas

- **Pit stop por baixo:** continua o mesmo HTML no servidor; o botão "Versão em texto" continua o primeiro na ordem de tabulação.
- **Foco:** os botões do menu, do currículo e do contato têm foco visível em âmbar; Tab percorre a tela na ordem do conteúdo; Esc sempre volta um estado.
- **Movimento reduzido:** a câmera corta em vez de voar, a tela liga sem a linha, o portão aparece já aberto por um quadro e a página navega.
- **Sem WebGL, economia de dados ou erro no canvas:** cai no pit stop, como hoje (`GameMount`, `ErrorBoundary`, `detectWebgl`).
- **Contraste:** todo texto da tela passa de 4,5:1 sobre o vidro.

## 6. O jogo no deploy

- **Saída da build:** `node build-v3.mjs <lab> D:/Projetos/Luis/project-ve2/public/salto88`. O endereço é `/salto88/index.html`, com o nome do arquivo explícito: o matcher do `proxy.ts` ignora caminhos com ponto, então o middleware de idioma não pega a página do jogo.
- **Git:** `public/salto88/` entra no repositório; `public/lab/` continua no `.git/info/exclude`.
- **Sem terceiros em runtime (achado no plano):** o jogo hoje busca o three r128, o `GLTFLoader` e o `SkeletonUtils` no cdnjs e no jsDelivr, e as fontes no Google Fonts. No deploy esses arquivos passam a sair de `public/salto88/vendor/`, como o resto do site (nenhum fetch de terceiros).
- **Peso:** hoje são 54 MB (modelos em JSON 18 MB, música 16 MB, vídeo 5,7 MB, áudio 0,7 MB). Meta: a pasta com no máximo 30 MB. Caminho: recomprimir a música (mesmo volume medido por estação, regra do Salto 88) e compactar o `models-json`; o vídeo fica. Se depois disso passar de 30 MB, os arquivos pesados vão para o Vercel Blob e o jogo os busca de lá.
- **Garagem:** interativa com no máximo 2,5 MB transferidos além do que o pit stop já carrega, e no máximo 60 chamadas de desenho.
- O merge na `main` (produção) continua decisão do Luis.

## 7. O que sai do site

A mecânica do hub de 5 zonas: `Hub`, `ZoneMarker`, `ZonePanel`, `Minimap`, `Decor`, o piloto automático e o modo demo, as zonas e o hash de zonas (`lib/game/zones.ts`, `autopilot.ts`, `decor.ts` e o que só eles usam), e os testes que só cobrem isso. O plano confirma cada remoção com `grep` antes de apagar; o que a garagem reaproveita (carga do `delorean.glb`, `tier`, `storage`, `input`, `ErrorBoundary`, `PitstopToggle`) fica.

## 8. Testes

- **Vitest:** a máquina de estados (`bancada` → `tela` → `bancada`, `partida` e o cancelamento, Esc em cada estado), o mapa de teclas em PT e EN, as âncoras (`#curriculo` abre `tela`), o rótulo do PDF quando `links.cv.en` é `null`.
- **Playwright:** `/pt` mostra o menu da tela; C abre o currículo com textos do perfil; Esc volta; K abre o contato sem telefone; E leva a `/en` com o menu em inglês; J termina em `/salto88/index.html`; `#contato` abre direto no contato; sem WebGL cai no pit stop; com movimento reduzido não há voo de câmera; no celular as quatro teclas têm alvo de 44 px ou mais.
- **Fotos e nota:** uma lista fixa de fotos (desktop 1440×900, celular 390×844 e 375×568): bancada PT, bancada EN, currículo, contato, partida no meio (portão a meia altura), partida no fim. Nota por área até 9 ou mais, no mesmo ciclo do Salto 88.
- Tudo roda com prioridade baixa e metade dos núcleos, um teste de cada vez (o Luis joga nesta máquina).

## 9. Próximas partes (fora deste spec)

- **Parte 2: polimento do jogo.** O backlog do handoff (avisos no showroom, cartão apertado em 375×568, atlas das TVs da Valiant numa GPU real, o teste "mobile em pé" de 13 min) e a costura com a garagem: o jogo começa como continuação da partida (o DeLorean saindo para fev 2019).
- **Parte 3: o jogo em inglês.** Cartões, missões, HUD e avisos lendo `content/en/profile.ts`; o aviso "Game in Portuguese for now" sai.
- **Depois:** trazer o pit stop para a paleta da garagem.

## 10. Como construído (23 out)

- **Tela em DOM, sem o `<Html>` do drei.** O `<Html transform>` perdia o conteúdo no StrictMode do React 19, porque a raiz própria dele era desmontada depois da remontagem, e também perdia o contexto do next-intl. A tela é um `ScreenSurface` comum, fora do canvas. A cada quadro renderizado, a `GarageCamera` mapeia o layout de 800 × 600 px nos quatro cantos projetados do vidro com uma `matrix3d` (`lib/garage/homography.ts`). Na vista de tela ele vira um retângulo sem transformação sobre o vidro, recortado pela janela no celular: texto nítido e rolagem normal.
- **Celular em pé.** Um vidro 4:3 que cabe na largura de uma janela de 390 × 844 ocupa no máximo cerca de 35% da altura. O enquadramento fica em cerca de 33% para o vidro e cerca de 46% para o monitor. O teclado vira as quatro teclas C, J, K e E num suporte inclinado, cada uma com mais de 44 px.
- **Controles fora da tela.** O botão do pit stop ficou onde estava. Som, Créditos e PT | EN ficam no canto inferior esquerdo e somem dentro do monitor.
- **Partida.** Com J, o portão sobe, os faróis fortes apontam pela porta para a bancada, a câmera termina a 3/4 com o DeLorean inteiro no portão aberto, vem o clarão branco e a página vai para `/salto88/index.html` uma vez só. Voltar do jogo pelo cache do navegador traz a bancada de volta. O `window.__garage.holdLaunch(ms)` congela a partida para a lista de fotos.
- **Jogo no deploy.** `public/salto88/` tem 29 MB, contra 42 MB antes:
  - os modelos viraram `.glb` binário com o mesmo conteúdo, porque a geometria em base64 era 85% dos bytes;
  - as músicas foram recomprimidas em Vorbis q2 e MP3 de 128 kbps, e os testes de rádio do laboratório deram 4/4;
  - o three r128, o `GLTFLoader`, o `SkeletonUtils` e as fontes (OFL) saem de `vendor/`, sem CDN.

  O jogo tem o link "Voltar à garagem" na gaveta e no showroom, e o aviso "Game in Portuguese for now" com `?lang=en`. O script é o `scripts/shrink-game.mjs`, e a build do laboratório usa `proto/min`.
- **O hub saiu.** Saíram 50 arquivos, com cerca de 4.700 linhas: componentes, módulos de `lib/game` e os testes deles. Ficaram `GameMount`, `GameLayer`, `ErrorBoundary`, `PitstopToggle`, `Effects`, `useRuntimeFrame`, `tier`, `assets` e o `isTypingTarget`.
- **Testes.**
  - `tests/garage`: estado, partida, câmera, homografia, tela, teclas e som.
  - `e2e/garage.spec.ts`: bancada, tela e partida, nos projetos chromium e mobile.
  - `scripts/garage-shots.mjs`: 18 fotos fixas.
  - Sair de uma página com a cena WebGL leva cerca de 11 s no SwiftShader sem janela, contra menos de 1,5 s numa GPU real. Por isso a partida espera até 60 s pela página do jogo.
- **Notas finais** (`.superpowers/garagem/notas.md`):

  | Área | Nota |
  |------|------|
  | Bancada desktop | 9 |
  | Bancada celular | 9 |
  | Tela 375 × 568 | 8,5 |
  | Currículo | 9 |
  | Contato | 9 |
  | Idioma | 9 |
  | Partida a 1,6 s | 7 |
  | Chegada ao carro | 8 |

  Na partida a 1,6 s, a luz fria ainda não chega à bancada antes da virada. Fica no backlog.
- **Números do fechamento** (build de produção, testes sob `low.sh`):
  - `check:bundle`: 150,3 KB gzip de 180 KB, sem three na primeira carga.
  - Payload 3D no tier A: 1.606 KiB (GLB de 1.131 KiB e 14 scripts somando 475 KiB), dentro do teto de 2.560 KiB.
  - LCP: 516 ms com a CPU 4× mais lenta e 1.084 ms em 4G, os dois no `<h1>` do pit stop.
  - Bancada: no máximo 60 chamadas de desenho (teste `garage: bench`).
  - vitest: 185/185.
  - e2e:
    - os 96 testes fora da garagem: 95 passaram e 1 foi pulado (pulo que já existia);
    - `garage.spec`: 21/21 no chromium e 21/21 no mobile, em série. Com 6 workers em paralelo, cada um com uma cena WebGL no SwiftShader, todo prazo estourava. Por isso a spec roda em série, com até 120 s por teste.
