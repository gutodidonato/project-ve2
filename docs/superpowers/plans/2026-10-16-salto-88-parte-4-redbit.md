# Salto 88 · Parte 4: RedBit + FIAP · Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Encher a cidade quarteirão a quarteirão e transformar cada item da RedBit e da FIAP num lugar bem construído (K1–K9 e L1–L10 da spec), medindo cada meta.

**Architecture:**
- Primeiro, a base da cidade, que serve a Valiant e a Colmeia nas partes 5 e 6: quarteirão de 42 m, meio-fio, kit de calçada, tipos de quarteirão, pedestres, trânsito, luz e som.
- Depois, os 10 lugares de carreira, cada um numa função `place*` registrada como bloco especial no `cityStreamer`.
- Os sistemas X1 (gente), X2 (vaga e cartão) e X3 (balões) vêm da parte 3.

**Tech Stack:** three.js r128, WebAudio e Playwright.

**Spec:** `docs/superpowers/specs/2026-10-16-salto-88-parte-4-redbit-design.md`, com as fichas na planta v2 (artifact `BFgRsZq7jTeF3QMMFnmaMT`).

## Global Constraints

- Quarteirões por índice (i, j). A avenida fica entre i = −1 e i = 0. A chegada fica no topo da fila j = 1, e o portal logo depois do cruzamento entre j = −2 e j = −3. Os lugares e tipos estão na planta v2:

  | Quarteirão | O que é |
  |---|---|
  | (−1, 1) | FIAP |
  | (0, 1) | RedBit |
  | (−1, 0) | Responsivo |
  | (0, 0) | Comércio e Loja Exemplo |
  | (−1, −1) | Praça da FIAP |
  | (0, −1) | Projetos |
  | (−1, −2) | Galeria |
  | (0, −2) | Animações em JS |

  Os outros quarteirões seguem a planta. O radar fica na avenida, na fila j = 0. Os pórticos das tags ficam na rua do cruzamento j = 0/−1, a leste.
- Toda pessoa vem de `spawnPerson` (parte 3). Ninguém é atingido (K3).
- Os textos dos lugares são exatamente os das fichas. Nada pessoal além do perfil e do que o Luis disse.
- Custo na RedBit: ≤ 650 chamadas de desenho e ≤ 1,1 milhão de triângulos por quadro (`qa.mjs gpu`).
- A auditoria de sobreposição continua zerada, inclusive a 600 m da origem.

## Review Focus

1. **Cidade infinita longe da origem** (600 m): os tipos de quarteirão, as pessoas e o kit de calçada aparecem e somem com os blocos, sem vazar memória. Teste na Tarefa 1, repetido nas Tarefas 3 e 4.
2. **DeLorean parado sobre a faixa de pedestre:** as pessoas esperam e não atravessam o carro. Teste na Tarefa 4.
3. **Ré pela rua das animações:** a animação volta sem pular. Teste na Tarefa 12.
4. **Pórticos das tags pela contramão** (de leste para oeste): não contam conversão. Teste na Tarefa 11.
5. **Celular:** o cartão de cada lugar cabe e o HUD não se sobrepõe. Teste na Tarefa 14 (auditoria HUD).

---

### Task 1: Quarteirão de 42 m, calçada de 4 m e meio-fio (K1, K2)

**Files:** template (`BLOCK`, `HALF`, `LOT`, `SIDE`, `CURB`, `ROAD_W`, `WALK_W`, `buildRoadGrid`, `cityStreamer`, colisores de meio-fio) · Test: `e2e/run.mjs` (ajuste de "cidade infinita", "trânsito", "colisão: poste de luz", "colisão: carro estacionado" e "cidade: parede segura")

- [ ] **Step 1: Write the failing tests.**
  - `cidade: quarteirão de 42 m com calçada de 4 m`: a distância entre os centros das ruas é 42. O meio-fio (colisor contínuo) impede o carro de subir na calçada: dirigir a 15 em diagonal contra ela para o carro a menos de 6,6 m do centro da rua.
  - Os testes de cidade ajustados para as medidas novas, com os mesmos objetivos.
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement.**
  - Valores: `BLOCK = 42`, `HALF = 21`, asfalto de 13 m (`ROAD_W = 6.5`), calçada até 10,5 m do centro da rua (`WALK_W = 10.5`).
  - Lotes de 10 × 10 m em ±5,25 m do centro do quarteirão.
  - Postes a 8,6 m do centro da rua, carros estacionados a 5,4 m.
  - Meio-fio: uma caixa de 0,25 m de largura e 0,15 m de altura ao longo de cada lado, com colisor de altura 0,5 m. A geometria é instanciada no ladrilho periódico; os colisores são criados por quarteirão.
- [ ] **Step 4: Run** os testes de cidade (`"cidade"`, `"trânsito"`, `"colisão"`) e `node qa.mjs "" life`. Expected: PASS, sobreposição 0.
- [ ] **Step 5: Checkpoint.**

### Task 2: Kit de calçada (K4)

**Files:** template (`makeStreetKit(g)` → pools instanciados; `sidewalk(B)` usa o kit) · Test: `e2e/run.mjs`

- [ ] **Step 1: Write the failing test** `cidade: calçada mobiliada`.
  - Num quarteirão comum a 200 m da origem há ao menos 1 objeto de calçada a cada 10 m de perímetro (`__salto.streetKitCount(i, j)`).
  - Toda esquina tem lixeira e placa de rua com o nome da planta.
  - A auditoria de sobreposição dá 0.
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement.**
  - Cada item é uma geometria de primitivas fundida (`BufferGeometryUtils` não é usado; monte com várias malhas num `InstancedMesh` por peça), com no máximo 3 peças por item.
  - Árvore de calçada: a `tree_oak` existente em escala 0,7, com um canteiro de 1,2 m.
  - Os nomes das placas vêm de uma tabela por eixo (planta), por exemplo "R. Responsiva" no eixo x = −42, com nomes gerados por semente para os eixos distantes.
- [ ] **Step 4: Run.** Expected: PASS.
- [ ] **Step 5: Checkpoint.**

### Task 3: Dez tipos de quarteirão comum (K5)

**Files:** template (`BLOCK_TYPES` com 10 construtores; escolha por semente com a regra de vizinho) · Test: `e2e/run.mjs`

- [ ] **Step 1: Write the failing test** `cidade: 10 tipos e vizinhos diferentes`.
  - Numa janela de 9 × 9 quarteirões centrada a 300 m da origem aparecem os 10 tipos.
  - Nenhum par de vizinhos de lado tem o mesmo tipo.
  - Cada lote de comércio tem um letreiro com nome da lista da planta.
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement.**
  - O tipo de (i, j) é sorteado por semente entre os que diferem de (i − 1, j) e (i, j − 1), que já são determinísticos. O vizinho de baixo e o da direita resolvem por uma segunda passada com a mesma semente, mantendo o determinismo.
  - Fachadas: os prédios Kenney de hoje mais toldos (`detail-awning` do kit) e letreiros em canvas.
  - Itens próprios por tipo: posto (cobertura e bombas), obra (tapume, guindaste de primitivas, caçamba `dumpster`), escola (grade e quadra), hortifruti (caixotes), academia (vidro e esteiras).
- [ ] **Step 4: Run.** Expected: PASS, e a cidade infinita continua sem vazamento (`"memória"`).
- [ ] **Step 5: Checkpoint.**

### Task 4: Pedestres e faixas (K6, K3)

**Files:** template (`cityPeople` por quarteirão; semáforo de pedestre; freio automático do DeLorean na faixa) · Test: `e2e/run.mjs`

- [ ] **Step 1: Write the failing tests.**
  - `cidade: gente nas calçadas`: em cada quarteirão a até 80 m do carro há de 4 a 8 pessoas; pelo menos uma anda e pelo menos uma está parada. Na RedBit, pelo menos 40% têm guarda-chuva.
  - `cidade: faixa só com sinal e ninguém atropelado`:
    - pessoas atravessam só com o sinal de pedestre verde;
    - o carro a 12, com uma pessoa na faixa à frente, para sozinho a 3 m ou mais dela;
    - nenhuma pessoa fica a menos de 1 m do carro em 20 s de direção normal pela avenida.
  - `cidade: DeLorean parado na faixa`: com o carro parado sobre a faixa, ninguém entra nela (as pessoas esperam).
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement.**
  - Caminhos de calçada: um retângulo por quarteirão a 9 m do centro da rua, que as pessoas percorrem.
  - A cada esquina, uma chance de atravessar quando o ciclo dá verde para pedestres (ciclo de 12 s alinhado ao semáforo existente).
  - O freio automático só age quando há pessoa na faixa à frente a menos de 8 m.
- [ ] **Step 4: Run.** Expected: PASS.
- [ ] **Step 5: Checkpoint.**

### Task 5: Ônibus, motos e bicicletas (K7)

**Files:** template (`vehicle('bus')` de primitivas; `bike`; motos com o modelo do motoboy; paradas nos pontos) · Test: `e2e/run.mjs`

- [ ] **Step 1: Write the failing test** `cidade: ônibus para no ponto, motos e bicicletas andam`.
  - Um ônibus para a menos de 3 m de um ponto e fica de 3 a 5 s parado, enquanto pessoas do ponto entram (somem pela porta).
  - Há ao menos 2 motos e 2 bicicletas andando a até 120 m do carro.
  - O teste de trânsito sem batida continua passando.
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement.** Ônibus de 11 × 2,5 × 3 m com janelas (canvas) e o letreiro "8000 · Terminal Bit". Ele usa as faixas do trânsito existente (`laneAssign`) com a parada como restrição extra.
- [ ] **Step 4: Run.** Expected: PASS.
- [ ] **Step 5: Checkpoint.**

### Task 6: Luz da noite (K8)

**Files:** template (cor por instância nos pools de prédios; texturas de janela com máscara de emissivo; vitrines; poças) · Test: `e2e/run.mjs`

- [ ] **Step 1: Write the failing test** `cidade: janelas acesas e poças`. Na RedBit, a fração de janelas acesas por prédio fica entre 40% e 70% (`__salto.windowsLit()`), há janelas quentes e frias, e existe ao menos uma poça por esquina visível.
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement.**
  - Uma textura de janelas com máscara de emissivo por padrão de semente (4 variações) é aplicada aos materiais de janela dos prédios Kenney instanciados.
  - O tom vem da cor por instância.
  - Poças: planos com o mapa de ambiente e baixa rugosidade.
- [ ] **Step 4: Run** o teste e `node qa.mjs "" life`. Expected: PASS; superfície lisa < 35%.
- [ ] **Step 5: Checkpoint.**

### Task 7: Som de rua (K9)

**Files:** template (laços de ambiente por tipo de quarteirão; murmúrio perto de gente; ônibus) · Test: `e2e/run.mjs`

- [ ] **Step 1: Write the failing test** `som: rua viva`. Parado numa calçada com gente a 5 m, o canal de ambiente fica pelo menos 4 dB acima de parado num quarteirão de estacionamento vazio. O ônibus freando gera um pico de efeitos a até 20 m. Tudo dentro das faixas da parte 1.
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement.**
  - Murmúrio: ruído com dois formantes (500 e 1500 Hz) modulado por envoltórias aleatórias, com o ganho proporcional à quantidade de gente a até 15 m.
  - O bar soma conversa, a obra um gerador e a escola um sinal a cada 60 s.
- [ ] **Step 4: Run.** Expected: PASS.
- [ ] **Step 5: Checkpoint.**

### Task 8: Campus FIAP e escritório da RedBit (L1, L2)

**Files:** template (`placeFiap(B)`, `placeRedbit(B)` como blocos especiais) · Test: `e2e/run.mjs`

- [ ] **Step 1: Write the failing tests.**
  - `redbit: campus FIAP`: o quarteirão (−1, 1) tem o prédio `fiap-campus` com o letreiro "FIAP", o telão tocando o vídeo `fiap` e ao menos 12 alunos. Parar na vaga abre o cartão "FIAP · Análise e Desenvolvimento de Sistemas · 2023 – 2024".
  - `redbit: escritório`: parar na vaga de visitante abre o cartão com os dois itens do perfil exatos, e a missão passa a citar o radar.
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement** pelas fichas 1 e 2. O campus é um prédio em L de primitivas e texturas (faixas rosa `#ed145b`). O escritório usa fachada de vidro com interior em textura (mesas e monitores) e o neon vertical.
- [ ] **Step 4: Run.** Expected: PASS.
- [ ] **Step 5: Checkpoint.**

### Task 9: Radar de carregamento (L3)

**Files:** template (o radar de hoje vira a lombada eletrônica) · Test: os dois testes de radar atuais, adaptados, mais um novo

- [ ] **Step 1: Write the failing test** `redbit: lombada eletrônica de performance`.
  - O painel mostra "2,0 s" de longe (textura legível a 100 m: ≥ 14 px).
  - Passar acima de 60 mph mostra "0,5 s · SEO ok" e o outdoor ao lado em estado `loaded` de uma vez.
  - Devagar, mostra o tempo lento e o outdoor em `loading`, com progresso gradual.
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement** pela ficha 3: poste com painel de LED (canvas), duas câmeras, faixa "RADAR" pintada e placa amarela.
- [ ] **Step 4: Run.** Expected: PASS.
- [ ] **Step 5: Checkpoint.**

### Task 10: Prédio responsivo (L4)

**Files:** template (`placeResponsive(B)`) · Test: `e2e/run.mjs`

- [ ] **Step 1: Write the failing test** `redbit: fachada responsiva`. O modo da fachada é `desktop` a 80 m, `tablet` a 45 m e `mobile` a 20 m. A transição anima (o layout intermediário existe por pelo menos 0,2 s). Na vaga, os três aparecem lado a lado.
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement.** A fachada é um canvas de 1024 × 1152 redesenhado na transição (cabeçalho, imagem e 3 cartões, que se rearrumam com interpolação), com a régua lateral.
- [ ] **Step 4: Run.** Expected: PASS.
- [ ] **Step 5: Checkpoint.**

### Task 11: Rua das Conversões (L5)

**Files:** template (`placeConversions(B)`: três pórticos, loja, tela de eventos, contador) · Test: `e2e/run.mjs`

- [ ] **Step 1: Write the failing tests.**
  - `redbit: funil de conversão`: atravessar os três pórticos de oeste para leste, em ordem, leva o contador a 1 e mostra "Conversão registrada". A tela de eventos lista os três.
  - `redbit: fora de ordem e contramão não contam`: a sequência `page_view` → `purchase` mostra "Evento fora do funil" e o contador fica em 0. Atravessar de leste para oeste não conta nada.
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement** pela ficha 5.
- [ ] **Step 4: Run.** Expected: PASS.
- [ ] **Step 5: Checkpoint.**

### Task 12: Animações em JS (L10)

**Files:** template (`placeJsAnimations(B)`) · Test: `e2e/run.mjs`

- [ ] **Step 1: Write the failing test** `redbit: o carro é a barra de rolagem`. O progresso das três fachadas cresce quando o carro avança para o portal e decresce na ré, sem pular mais de 0,15 de progresso entre quadros. Na vaga, a animação completa toca em 4 s.
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement** pela ficha 10. Três canvases:
  - camadas em paralaxe;
  - cartões entrando com fade e deslize;
  - ícones num caminho de Bézier com easing (`easeOutCubic`).
  - O progresso vem da coordenada z do carro entre o começo e o fim do quarteirão.
- [ ] **Step 4: Run.** Expected: PASS.
- [ ] **Step 5: Checkpoint.**

### Task 13: Praça da FIAP, Projetos e Galeria (L6, L7, L8, L9)

**Files:** template (`placeFiapPlaza`, `placeProjects`, `placeGallery`) · Test: `e2e/run.mjs`

- [ ] **Step 1: Write the failing tests.**
  - `redbit: praça com aplauso e capelos`: entrar devagar dispara o aplauso (som) e pelo menos 20 partículas de capelo, e o cartão abre.
  - `redbit: ecoponto detecta e encaminha`: passar devagar mostra pelo menos 3 caixas de detecção com rótulo e confiança, o caminhão parte e aparece o texto "Modelo: 85,4% de mAP@50".
  - `redbit: vistoria concluída`: parar na vaga mostra as caixas "bicicleta", "roda" e "quadro" e "Vistoria concluída".
  - `redbit: galeria`: os 4 outdoors tocam o vídeo dos sites.
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement** pelas fichas 6 a 9.
- [ ] **Step 4: Run.** Expected: PASS.
- [ ] **Step 5: Checkpoint.**

### Task 14: Metas medidas, fotos e fechamento

- [ ] **Step 1: Run** `node qa.mjs "" life`, `places`, `gpu`, `hud` e `sound` na RedBit. Expected:
  - superfície lisa < 35%;
  - ≥ 4 pessoas por quarteirão;
  - ≥ 1 objeto a cada 10 m;
  - 10 de 10 lugares;
  - textos ≥ 14 px a 20 m;
  - custo dentro da meta;
  - HUD e som limpos.
- [ ] **Step 2: Run** a suíte inteira. Expected: tudo PASS.
- [ ] **Step 3: Tour.** Fotos de cada lugar, de três ruas comuns e do celular; revise e corrija o que estiver feio, com teste.
- [ ] **Step 4: Atualize a spec geral** (§ RedBit) e faça commit no repo.
