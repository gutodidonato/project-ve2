# LuisOS 88: o computador navegável da garagem — Design

Data: 2026-10-24 · Branch: `salto-88` · Autor: Luis Didonato (com Claude)
Muda a entrada descrita em `2026-10-23-garagem-entrada-design.md`. A cena da garagem, o pit stop, o fallback sem WebGL, as âncoras, o idioma, o som e a partida até o jogo continuam valendo, com as mudanças daqui.

## 1. Por quê

O Luis jogou o preview e pediu duas coisas:
- "precisa ser um computador navegável, fingindo um computador, e maior na tela";
- "caso a pessoa aperte para ir correr, ele dá zoom out, aí começa o salto".

Hoje a página abre na bancada a 3/4, e o menu fica pequeno e torto no vidro; a tela só vira página quando a câmera entra. Agora o computador é a primeira coisa: grande, de frente e usável como um desktop de 1988. A garagem aparece de verdade no recuo da câmera, quando a pessoa escolhe jogar.

Sucesso = em 2 segundos a pessoa está num desktop legível e entende que pode abrir o currículo; quem quer jogar abre o Salto88.exe e vê a câmera recuar, o portão subir e o salto começar.

## 2. Decisões fechadas

| Tema | Decisão |
|------|---------|
| Computador | Área de trabalho de 1988 ("LuisOS 88"): barra de menu, ícones, janelas, cursor de pixel |
| Abertura | Monitor grande, de frente, com cerca de 80% da janela no desktop; no celular em pé o vidro cobre a janela |
| Ícones | Currículo.txt, Projetos (pasta), Contato, Salto88.exe, Painel de controle, Leia-me.txt, Lixeira |
| Projetos | Os 5 cases do perfil, cada um num arquivo que abre na sua janela |
| Painel de controle | Som, idioma (PT \| EN) e créditos do carro; os botões de fora da tela (Som, Créditos, PT \| EN) saem |
| Leia-me | Abre sozinho na primeira visita; a visita fica lembrada no navegador |
| Lixeira | Um arquivo de piada que não afirma nada sobre a carreira |
| Salto | Salto88.exe (ou J) abre o diálogo de partida, a câmera recua até a garagem inteira e segue a partida de hoje |
| Abordagem | Desktop em DOM, dentro da superfície de tela que já existe (`ScreenSurface`) |

## 3. Experiência

### 3.1 Vistas

| Vista | Câmera | Tela |
|-------|--------|------|
| `desk` (abertura) | De frente para o monitor. Desktop e celular deitado: o vidro ocupa cerca de 80% da altura da janela, com a moldura bege, o teclado e a luz da garagem nas bordas. Celular em pé: o vidro cobre a janela | O desktop, um retângulo plano sobre o vidro, no tamanho real dele em px CSS |
| `launch` | Recua da pose `desk` até um plano aberto da garagem (bancada à esquerda, portão à direita, carro atrás), depois segue para o carro | O diálogo "Iniciando Salto88.exe…" fica na tela enquanto ela estiver à vista |

As vistas `bench` e `screen` de hoje saem: o desktop já é a página, e as janelas fazem o papel do currículo e do contato em tela cheia.

### 3.2 O desktop

- **Barra de menu** no topo, invertida (fundo âmbar, texto escuro): "LuisOS 88", "Arquivo", "Ver", "Ajuda" e o relógio local em HH:MM. Os menus são decorativos, com uma exceção: "Ajuda" abre o Leia-me.
- **Ícones** numa coluna à esquerda (no celular, numa grade de 3 colunas), com o nome embaixo:
  - Currículo.txt
  - Projetos
  - Contato
  - Salto88.exe
  - Painel de controle
  - Leia-me.txt
  - Lixeira
- **Abrir:** clique duplo, ou Enter com o ícone em foco. No celular, um toque.
- **Selecionar:** um clique (ou Tab até o ícone) inverte o ícone, com fundo âmbar e nome escuro.
- **Cursor:** seta de pixel âmbar com contorno escuro sobre o desktop; mãozinha sobre ícones e botões.

### 3.3 Janelas

- **Uma janela por programa.** Abrir de novo traz a janela para frente.
- **Barra de título:**
  - fechar à esquerda (□);
  - nome no meio, sobre listras horizontais;
  - arrastar pela barra muda a posição (desktop e celular deitado), presa dentro do vidro.
- **Celular em pé:** as janelas abrem maximizadas, ocupando o desktop menos a barra de menu.
- **Foco:**
  - clicar numa janela a traz para frente;
  - ao abrir, o foco do teclado vai para o título dela;
  - ao fechar, volta para o ícone que a abriu.
- **Conteúdo:** rola dentro da janela, com no máximo 72 colunas e o foco visível em âmbar.

| Programa | Conteúdo |
|----------|----------|
| Currículo.txt | O currículo de hoje (`ScreenCv`): resumo, experiência, cases, competências, formação, idiomas e o botão do PDF |
| Projetos | Uma janela-pasta com 5 arquivos, um por case de `profile.cases` (`<slug>.txt`). Cada um abre a sua janela: título, resumo e stack |
| Contato | O contato de hoje (`ScreenContact`): e-mail ofuscado, LinkedIn, GitHub, Cal.com quando existir, a linha de consultoria e o formulário. Nada de telefone |
| Salto88.exe | O diálogo de partida (§3.5) |
| Painel de controle | Som ligado/desligado, idioma (PT \| EN, igual ao E) e os créditos do carro (`MODEL_CREDIT`, texto exato) |
| Leia-me.txt | Nome e cargo do perfil, uma frase de como navegar ("Clique duas vezes num ícone. Teclas: C currículo, K contato, J jogar, E English, Esc fecha.") e a dica do pit stop (P) |
| Lixeira | Uma janela-pasta com `bug_88mph.log`, que abre "Erro: capacitor de fluxo sem energia. Acelere até 88 mph." |

### 3.4 Teclado e âncoras

- **Teclas:**
  - C abre o currículo, K o contato e J o Salto88.exe;
  - E troca o idioma;
  - Esc fecha a janela da frente (com nenhuma aberta, não faz nada);
  - Tab percorre ícones e janelas;
  - P continua sendo o pit stop;
  - num campo de texto, as letras só digitam (regra de hoje).
- **Âncoras:**
  - `#curriculo` / `#resume` e `#contato` / `#contact` abrem a janela certa na carga, como hoje;
  - abrir ou fechar Currículo ou Contato atualiza a âncora (`replaceState`);
  - a troca de idioma reabre na outra língua as janelas que estavam abertas.
- **Leia-me:** abre na primeira visita, salvo quando a página abriu numa âncora. A chave `rodovia:readme` fica em `lib/storage`.

### 3.5 Salto

Começa pelo Salto88.exe, pela tecla J ou pelo item do menu.

| Tempo | O que acontece |
|-------|----------------|
| 0 s | Abre o diálogo "Iniciando Salto88.exe…" com "Destino: fev 2019" (no `/en`: "Destination: Feb 2019" e "Game in Portuguese for now") e uma barra de progresso |
| 0,6 a 1,8 s | A câmera recua da pose `desk` até o plano aberto da garagem (`WIDE_POSE`) |
| A partir de 1,8 s | A partida de hoje, deslocada no tempo: lâmpada piscando, portão subindo, faróis e luz fria entrando, câmera no carro, clarão |
| Cerca de 4,9 s | A página navega para `/salto88/index.html`, uma vez só |

- **Esc cancela até o clarão:** a câmera volta para `desk` e o desktop reaparece como estava.
- **Movimento reduzido:** sem recuo e sem voo; navega direto, como hoje.
- **Voltar pelo cache do navegador** traz o desktop de volta (regra de hoje, agora para `desk`).

### 3.6 Celular

- O vidro cobre a janela e o desktop nasce no tamanho do celular.
- Os ícones têm 44 px ou mais de alvo, e as janelas abrem maximizadas.
- As teclas 3D grandes do celular saem; o teclado 3D fica só como cenário no desktop.

## 4. Estilo

- **Paleta:** a da garagem, em monocromático âmbar, como um monitor Hercules.
  - vidro `#17130C`, com uma trama pontilhada de 2 px em `#1F190F`;
  - fósforo `#FFB000` para texto, linhas e barra de menu;
  - fósforo baixo `#C48E12` para o texto secundário.

  Nenhuma cor nova.
- **Tipografia:** só a IBM Plex Mono.
- **Ícones:** pixel art de 32×32 em SVG inline (sem arquivo para baixar), em âmbar sobre o vidro. Contato é envelope, nunca telefone.
- **Janelas:** borda de 1 px âmbar, barra de título com listras horizontais e o nome sobre um recorte escuro, sem sombra. A janela da frente tem as listras cheias; as de trás, só a borda.
- **Ligar:** a linha se abre do centro, depois a barra de menu e os ícones aparecem em sequência, em cerca de 0,8 s no total, uma vez por página. Com movimento reduzido, aparece tudo de uma vez.
- **Fora isso, quieto:** o cursor pisca no campo em foco e o relógio muda de minuto. Nada mais se mexe.

## 5. Arquitetura

- **Estado do desktop:** `lib/garage/desktop.ts`, puro, guardado no zustand.
  - `{ view: 'desk' | 'launch'; windows: { id, x, y }[]; focus: id | null; selected: icon | null }`;
  - ações: abrir, fechar, focar, mover, selecionar, partir, cancelar e trocar idioma.

  Ele substitui `lib/garage/state.ts` (as âncoras e `gameUrl` mudam de arquivo, mas mantêm o comportamento).
- **Câmera** (`lib/garage/camera.ts`):
  - `DESK_POSE[framing]`, de frente, com o vidro em cerca de 80% da altura (no celular em pé, cobrindo a janela);
  - `WIDE_POSE`, o plano aberto da garagem;
  - `CAR_POSE`, que já existe.

  A partida mistura `desk` → `wide` → `car` pela linha do tempo.
- **Linha do tempo** (`lib/garage/launch.ts`): ganha a fase de diálogo e recuo (0 a 1,8 s); as fases de hoje se deslocam 1,8 s; `LAUNCH_MS` passa a cerca de 4.900.
- **Superfície:** na vista `desk`, com a câmera parada, o desktop é um retângulo plano no tamanho do vidro (o modo "arrived" de hoje). Durante o recuo, ele é mapeado no vidro com a homografia que já existe, para encolher junto com o monitor.
- **Componentes** (`components/garage/os/*`): `Desktop`, `MenuBar`, `Icon`, `Window`, um componente de conteúdo por programa e os ícones SVG. `ScreenCv` e `ScreenContact` são reaproveitados dentro das janelas; `ScreenMenu` e `ScreenLaunch` saem.
- **Fora da tela:** `GarageChrome` sai; o som, o idioma e os créditos vão para o Painel de controle. O `PitstopToggle` fica onde está.
- **Teclado 3D:** sai o layout de 4 teclas do celular; o teclado continua afundando as teclas digitadas.
- **Desempenho:**
  - a garagem continua com no máximo 60 chamadas de desenho no tier A;
  - o desktop é só DOM.

## 6. Testes

- **Vitest:**
  - a máquina do desktop: abrir, fechar, foco, uma janela por programa, mover preso ao vidro, Esc, partir/cancelar e idioma mantendo as janelas;
  - as âncoras;
  - a linha do tempo (recuo entre 0,6 e 1,8 s, portão a partir de 1,8 s, fim em cerca de 4,9 s);
  - as poses `DESK` (vidro com cerca de 80% da altura no desktop; cobrindo a janela no celular);
  - o Leia-me na primeira visita.
- **Playwright** (`e2e/garage.spec.ts`, refeito para o desktop):
  - o desktop aparece com os 7 ícones;
  - clique duplo e Enter abrem o Currículo;
  - Esc fecha;
  - a pasta Projetos abre um case;
  - o Contato não tem telefone;
  - E troca o idioma mantendo a janela;
  - `#contato` abre direto;
  - J recua a câmera, abre o portão e chega ao jogo uma vez só;
  - Esc no recuo cancela;
  - no celular, os ícones têm 44 px ou mais e as janelas abrem maximizadas;
  - digitar no formulário não abre janelas;
  - o Leia-me abre na primeira visita e não na segunda.
- **Fotos:** a lista de `scripts/garage-shots.mjs` passa a ser:
  - desktop vazio;
  - Leia-me;
  - Currículo;
  - Projetos com um case;
  - Contato;
  - Painel;
  - diálogo de partida;
  - recuo no meio;
  - garagem aberta;
  - chegada ao carro.

  Tudo em 1440×900, 390×844 e 375×568, com nota até 9 ou mais.

## 7. Fora deste spec

- A costura com o jogo (o DeLorean saindo da garagem para fev 2019 dentro do Salto 88): parte 2.
- O jogo em inglês: parte 3.
- O pit stop na paleta da garagem.

## 8. Como construído

- **Commits:** ad2f20e (máquina do desktop, teclas, âncoras, Leia-me), 9cf05f2 (câmera da mesa, plano aberto, partida com recuo), 2a914ce (desktop, janelas e programas em DOM), 5b17dd0 (desktop ligado na garagem; menu, páginas e botões de fora saem), 73868cb (testes da partida), mais o lote das fotos.
- **Desktop no vidro:** `ScreenSurface` mede o vidro na pose da mesa (`deskRect`) só no `resize` e monta o `Desktop` nesse tamanho; `placeSurface` deixa plano quando a câmera para e mapeia no vidro enquanto ela anda (recuo da partida). A cada `resize` as janelas são presas de volta (`clamp`).
- **Foco:** janela que abre recebe o foco no título; janela que fecha devolve o foco ao ícone ou arquivo que a abriu; na carga com janela aberta (âncora, Leia-me, troca de idioma), o título ganha foco assim que o desktop aparece no vidro.
- **Mudanças em relação ao plano:**
  - as janelas abrem à direita da coluna de ícones (`CASCADE.x` 136, largura até `w − 152`): em x 24 a primeira janela cobria os ícones;
  - o diálogo do Salto88.exe é uma janela pequena (440 px, altura do texto);
  - no modo jogo o botão do pit stop fica sempre no canto de baixo (no celular a barra de menu ocupa o topo); no pit stop ele continua em cima no celular;
  - rótulos de ícone quebram só entre palavras;
  - luz da tela: um ponto âmbar fraco na frente do queixo do monitor deixa a moldura bege (a lâmpada fica atrás do plano da tela); abaixo do vidro para o reflexo não cair no tubo;
  - `CAR_POSE` foi para a linha da abertura (x 2,6), sem o batente no quadro; no celular em pé, `widePose`/`carPose` de retrato (mais longe, lente 66°) mantêm o computador no recuo e o carro inteiro.
- **Testes:** `tests/garage/{desktop,os,camera,launch,surface,keys}` e `e2e/garage.spec.ts` (grupos desk, windows, phone, keys e launch, em série); a regra do Esc depois do clarão e o recuo foram conferidos com mutação (cada teste falha sem a regra).
- **Fotos:** `node scripts/garage-shots.mjs <baseUrl> <outDir> [filtro]` tira 30 fotos (10 momentos × 3 janelas); notas em `.superpowers/garagem/notas.md` (os1 → os4, todas as áreas em 9).
- **Fechamento (24 out):** typecheck e lint limpos; vitest 32 arquivos, 198 testes; `garage.spec` + `mode.spec` em série, 38/38 no chromium e 38/38 no mobile; build ok; `check:bundle` 150,8 KB de 180 KB (84%); `test:perf` LCP 764 ms (CPU ×4) e 1220 ms (4G + CPU ×4), tier A com 52 chamadas.
- **Revisão final (e4267e3):** o fechar do diálogo cancela no recuo (celular não tem Esc); desktop compacto também com vidro baixo (celular deitado) e em tela de toque; ícones menores num laptop baixo, para os sete caberem numa coluna; clique sem ponteiro (Espaço, leitor de tela) abre; janelas com ordem de DOM fixa e pilha por zIndex (o arrasto não perde a captura); a primeira visita por link direto conta para o Leia-me; "PT | EN" vem das mensagens e se chama pela língua de destino. Depois disso: vitest 203, e2e 40/40 no chromium e 39 + 1 pulado no mobile.
