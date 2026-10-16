# Salto 88 · Parte 1: defeitos medidos

Data: 16 out 2026 · Base: protótipo v3.6 (artifact `9Coz7zxBop4m3egyB7JKcU`) · Origem: auditoria de qualidade (artifact `VdUc2M8PeU3abSpmUfLp1p`, script `.superpowers/proto/qa.mjs`).

## 1. Contexto

A v3.6 passa nos 67 testes de jogabilidade, mas a auditoria de qualidade mediu defeitos que esses testes não viam: o estepe do SUV gira fora do eixo, a mixagem de som está desequilibrada, a marcha é quase só chiado, o HUD se sobrepõe com o celular deitado e algumas peças do Exército são falsas (vala pintada no chão, neve que treme, nomes de região soltos no céu). Esta parte corrige só o que já está medido, sem conteúdo novo.

## 2. Roteiro aprovado (16 out 2026)

Abordagem: uma cidade por vez até ficar pronta, em vez de camadas espalhadas por todas as eras.

| Parte | Escopo | Spec |
|---|---|---|
| 1 | Defeitos medidos (este documento) | este arquivo |
| 2 | Portal do tempo único em todas as eras | a escrever |
| 3 | RedBit + FIAP a 100%: cada item do perfil vira um lugar bem construído com interação, mais pedestres, móveis de rua, fachadas e som de rua. Vira o padrão de qualidade | a escrever |
| 4 | ValiantGroup no padrão da parte 3 | a escrever |
| 5 | Colmeia no padrão da parte 3 | a escrever |
| 6 | EVIG no padrão da parte 3 | a escrever |
| 7 | Exército no padrão da parte 3 | a escrever |

Fonte de verdade do conteúdo de carreira: `content/pt/profile.ts`. Nenhuma afirmação sobre a carreira entra no jogo sem estar lá.

Decisões registradas:
- **Rádio Quartel:** a marcha gerada no navegador sai; entra uma faixa CC0 marcial ou épica do OpenGameArt. O Luis ouve o trecho e aprova antes de a faixa entrar.
- **Pedestres (parte 3):** pacote CC0 de personagens low-poly com caminhada (Kenney ou Quaternius). Antes de baixar, informar nome, origem e tamanho.

## 3. Requisitos

Cada requisito tem uma meta verificada automaticamente pela auditoria (`qa.mjs`) ou pela suíte E2E (`run.mjs`).

### Modelos e cena

**R1 · Estepe parado.** Só os nós `wheel-front-left`, `wheel-front-right`, `wheel-back-left` e `wheel-back-right` (com ou sem sufixo `_N`) giram e esterçam. O nó `wheel-back` do SUV (estepe preso ao `body`) fica parado.
Meta: na auditoria de rodas, nenhuma das ~250 rodas sai mais de 0,05 m do próprio centro ao girar.

**R2 · Neve sem tremor.** Hoje o cone de neve de cada montanha coincide com a superfície do cone da montanha, e os dois disputam o mesmo pixel (z-fighting). O cone de neve se afasta da superfície (escala radial maior ou `polygonOffset`) até sumir o tremor.
Meta: fotos a 60, 120 e 200 m sem listras; a causa é confirmada por foto antes e depois.

**R3 · Penhascos com cor de pedra.** Os `cliff_large_rock` da serra deixam o laranja chapado e ganham tons de pedra coerentes com as montanhas.
Meta: revisão visual no tour.

**R4 · Vala de verdade.** O chão do Exército ganha um recorte retangular na posição da vala (9 × 4,5 m em x −45, z −45), com paredes e fundo de terra. Quando o carro cai na vala, ele desce até o fundo e sai pela borda da frente. Penalidade, limite de velocidade e contagem continuam iguais.
Meta: o teste "devagar cai na vala (+3 s)" continua passando; foto da vala mostra profundidade.

**R5 · Regiões sem placa.** Os rótulos SELVA, CAATINGA e MONTANHA saem do céu e não entra aviso nenhum: as regiões ficam só no mapa (pedido do Luis, 16 out 2026).
Meta: nenhum rótulo de região na cena.

### Som

**R6 · Buzina proporcional.** A buzina do jogador fica no máximo 6 dB acima do volume de dirigir na cidade (hoje são 17 dB).
Meta: auditoria de som, cenas "buzina" e "cidade dirigindo".

**R7 · Músicas no mesmo volume.** Cada estação ganha um ganho próprio. Medido no canal de música, cada faixa fica a até 1 dB de −22 dB, e a diferença entre a mais alta e a mais baixa fica em no máximo 2 dB (hoje são 8 dB).

**R8 · Clímax das 88 mph.** O capacitor de fluxo, o salto e o estrondo sobem. Os 3 segundos antes do salto ficam pelo menos 6 dB acima de dirigir na cidade (hoje ficam 1 dB abaixo).

**R9 · Chuva mais baixa.** A garoa da RedBit e a chuva da selva do Exército ficam mais baixas e mais escuras (pedido do Luis, 16 out 2026). Ao dirigir na cidade e parado na selva, a frequência média do som fica abaixo de 3 kHz (hoje 6,3 kHz na cidade), e a chuva da selva cai pelo menos 6 dB.

**R10 · Exército com ambiente.** Vento em toda a base, pássaros na selva e vento seco no deserto e na montanha. O canal de ambiente nunca fica abaixo de −45 dB em nenhuma das quatro regiões.

**R11 · Rádio Quartel com faixa CC0.**
- A estação toca uma faixa CC0 do OpenGameArt: marcial ou épica, em `.ogg` de até 4 MB, normalizada como as outras (R7).
- Somem o gerador da marcha e os geradores `synth`, `broadcast`, `blips` e `pads`, que nenhuma estação usa.
- O crédito da faixa entra na gaveta de informações.
- A faixa só entra depois que o Luis aprovar o trecho.

### Interface

**R12 · HUD sem sobreposição com o celular deitado.** Telas com até 500 px de altura usam um layout compacto:
- a missão vai para baixo e fica menor;
- o relógio do tempo fica enxuto;
- o título da era desce e diminui;
- o cartão final do showroom não cobre o rádio nem o velocímetro.

Meta: zero sobreposições entre elementos visíveis do HUD em 1280 × 720, 375 × 812 e 812 × 375. A medição é feita na chegada e dirigindo em cada era, na Marginal e no showroom.

## 4. Testes

- Os 67 testes atuais continuam passando.
- A suíte E2E ganha quatro testes:
  - nenhuma roda fora do eixo (R1);
  - HUD sem sobreposição nas três telas (R12);
  - níveis de som por cena dentro das metas R6–R10, medidos por analisadores ligados aos canais de áudio do jogo;
  - Rádio Quartel tocando faixa (R11).
- A auditoria de qualidade (`qa.mjs`) passa a sair com código de erro quando alguma meta desta parte falha.
- O tour de fotos é regerado no fim para comparar antes e depois (montanha, vala, penhascos, HUD deitado).

## 5. Fora do escopo

Portal novo (parte 2); pedestres, móveis e conteúdo de carreira (partes 3 a 7); jatos da Esquadrilha e demais marcos (parte da era correspondente); som do motor e mixagem de cada cidade (parte da cidade correspondente).

## 6. Riscos

- Medição de som em tempo real no navegador sem tela varia de uma execução para outra. As metas usam tolerância de 1 dB e média de pelo menos 3 s.
- Faixa CC0 marcial boa pode ser difícil de achar. Plano B, se o Luis preferir: o Exército começa no 88 FM e a estação sai.
