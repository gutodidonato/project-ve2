# Salto 88 · Parte 2: portal do tempo

Data: 16 out 2026 · Roteiro: `2026-10-16-salto-88-parte-1-defeitos-design.md` §2 · Origem: auditoria v3.6 (portais: nota 2/10).

## 1. Problema

Nas quatro primeiras eras, a saída para a rodovia é um pórtico de sinalização de estrada (`addGate`: modelo `overheadLights` de 13 m e um rótulo). A auditoria mediu:
- na chegada, a 140 m, o pórtico tem 32 px de altura numa tela de 720 px;
- só passa de 100 px a 40 m;
- não tem brilho, partícula nem som;
- a passagem é um corte seco com um aviso de texto.

Só o portal da EVIG (vórtice, anel e brilho) se lê como portal: 116 px a 140 m.

## 2. Objetivo

Um único portal do tempo, igual em todas as eras e reconhecível de qualquer ponto da fase, que mostra para onde leva e faz da passagem um momento.

## 3. Requisitos

**P1 · Um construtor para todas as eras.** `addTimePortal(g, next, x, z, opts)` substitui `addGate` no Exército, na RedBit, na Valiant e na Colmeia. A EVIG usa o mesmo construtor com `opts.aim = true` (continua exigindo mira no centro). O grupo do portal se chama `portal-do-tempo`.

**P2 · Forma.**
- Anel vertical de 6,6 m de raio, com o centro a 6,6 m do chão nas eras de chão. Ele cobre a pista inteira (13 m) e fica de frente para quem chega.
- Dentro do anel, o vórtice animado da EVIG, nas cores da era de destino (`next.color`, `next.accent`).
- Anel metálico com brilho na cor de destino, girando devagar.
- Brilho aditivo de 26 m atrás do anel.

**P3 · Visível de qualquer lugar da fase.**
- Uma coluna de luz sobe do anel até 120 m de altura: cilindro aditivo, sem neblina, levemente pulsante.
- No chão, um círculo de luz de 16 m.
- Meta: a 140 m, o conjunto portal + coluna tem pelo menos 120 px de altura em 1280 × 720. O contraste de luminância contra o entorno é de pelo menos 40, e nada fixo do cenário tapa o centro do anel visto da estrada.

**P4 · Diz para onde leva.** Um rótulo acima do anel mostra a data e o nome da era de destino (ex.: "MAR 2023 · FIAP + REDBIT"), e embaixo "chegue a 88 mph na rodovia". O destino final mostra "HOJE · o último salto".

**P5 · Faíscas.** De 120 a 160 partículas orbitam o anel e são puxadas para o centro. A cada 1,5 a 3 s, um raio elétrico curto (o mesmo dos 88 mph) salta entre dois pontos do anel.

**P6 · Só se passa por dentro.**
- Dois colisores nas laterais do anel impedem contornar o portal pela estrada.
- Cruzar o plano do portal com o centro do carro a menos de 6 m do centro do anel inicia a passagem.
- Na Colmeia, que é uma era de voo, o portal fica na altura do voo baixo (centro a 6,6 m), e a regra do centro vale para a altura também.
- Na EVIG, a regra de mira continua como hoje.

**P7 · A passagem.**
- Clarão branco de 0,15 s.
- Túnel de 0,8 s: o campo de visão abre de 58° para 95°, riscos de luz correm na cor de destino e o vórtice preenche a tela.
- Depois, a rodovia começa como hoje.
- Som de passagem: o `portal` atual somado a um "whoosh" de ruído filtrado.

**P8 · Som de presença.** Um zumbido grave do portal (sintetizado: senoides de 55, 82,5 e 110 Hz com tremolo lento) cresce com a proximidade.
Meta: parado a 20 m do portal, o canal de ambiente fica pelo menos 6 dB acima de parado a 120 m.

**P9 · Argolas da EVIG em outra cor.** As 6 argolas da migração deixam o violeta do portal e passam a âmbar (`0xffb347`). Assim fica claro que elas são o desafio e o portal é a saída.

## 4. Testes

- **Por era (0 a 4):**
  - existe exatamente um `portal-do-tempo`;
  - o rótulo mostra a data de destino;
  - o pórtico `overheadLights` da saída não existe mais.
- **Auditoria (`qa.mjs`, seção `portals`):** a meta P3 nas cinco eras. A seção passa a procurar o grupo `portal-do-tempo` e a ignorar objetos invisíveis e os grupos ocultos (hoje ela confunde os pórticos da rodovia, que ficam escondidos na cena).
- **Passagem:** atravessar pelo centro leva à rodovia em até 1,2 s e passa pelo túnel (campo de visão acima de 85° em algum quadro). Tentar passar pela beira da estrada para no colisor e não troca de modo.
- **Colmeia:** passar pelo centro em voo baixo leva à rodovia; passar a 18 m de altura não leva.
- **Som:** a meta P8, com o `measure` da parte 1.
- **EVIG:** a mira continua obrigatória (teste atual), e as argolas são âmbar.
- Os testes atuais de rodovia, demo e plutônio continuam passando.

## 5. Fora do escopo

O conteúdo de cada era (partes 3 a 7) e a rodovia em si.
