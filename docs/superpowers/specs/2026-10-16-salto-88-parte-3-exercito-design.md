# Salto 88 · Parte 3: Exército, a porta de entrada

Data: 16 out 2026 · Planta e fichas detalhadas: artifact `NA24Mq3ccPwPBpe3CRd8Tf` ("Planta Exército"), fonte desta spec · Padrão: `2026-10-16-salto-88-padrao-de-preenchimento.md` · Roteiro: parte 3 (o Luis pôs o Exército à frente da RedBit em 16 out 2026).

## 1. O que a fase conta

A formação de oficial do Luis, de 2019 a 2021, Engenharia de combate, em três capítulos ao longo da estrada da chegada até o portal:
- 2019 · EsPCEx, Campinas;
- 2020 · AMAN, Resende;
- 2021 · Engenharia de combate.

O eixo são os quatro valores que o Luis escolheu para um recrutador levar dessa fase: **liderança, disciplina, pressão e trabalho em equipe**. Cada lugar mostra pelo menos um deles em ação.

## 2. Fontes e decisões por padrão

**Fontes.** Do Luis: "2019 - 2021", "eu sou de engenharia de combate", os quatro valores e o vídeo da AMAN já entregue. Públicos: EsPCEx em Campinas (SP), primeiro ano da formação; AMAN em Resende (RJ) e o Portão Monumental; espadim de Caxias entregue ao cadete do 1º ano; escolha da arma; castelo como símbolo da Engenharia; patrono Ten Cel Villagran Cabrita.

As perguntas da planta ainda abertas foram decididas assim. O Luis pode trocar qualquer uma, e a troca só muda texto ou um lugar:

| Pergunta | Decisão por padrão |
|---|---|
| Linha do tempo | EsPCEx 2019; AMAN 2020 e 2021; Engenharia em 2021 |
| Espadim | O cartão diz o fato público ("recebido pelo cadete do 1º ano"), sem afirmar nada pessoal |
| Momentos pessoais | Nenhum: os cartões usam só fatos públicos e os quatro valores |
| YouTube | Sem links: o telão toca o vídeo local da AMAN, e o cartão não tem botão do YouTube até chegarem links |
| Castelo e patrono | Usados |
| Decisões E1–E5 da planta | Adotadas |
| Sons novos | Sem download: corneta, passos de tropa e motor a hélice são sintetizados |

## 3. Requisitos

Os textos, tamanhos, posições e interações de cada lugar estão nas fichas da planta. Esta seção fixa o que vira código e como cada coisa é verificada.

### Sistemas comuns (servem também às partes 4 a 7)

**X1 · Gente.**
- Os 12 personagens do Kenney Mini Characters (CC0) entram como `models/lib-people.json`, com a textura embutida e as animações `idle`, `walk`, `sprint`, `sit`, `interact-right`, `emote-yes` e `holding-both`.
- `spawnPerson({ kind, outfit, x, z, h, anim })`, com `outfit` sendo `'civil'` ou `'farda'`. A farda é uma variante da paleta de cores com roupas verde-oliva e cobertura.
- Só animam as pessoas a até 60 m do carro; além de 90 m, ficam ocultas.
- Meta de custo: com 70 pessoas na fase, o Exército fica com no máximo +150 chamadas de desenho e +2 ms de simulação por quadro sobre a medição da auditoria.

**X2 · Vaga e cartão.**
- `addStop(g, { x, z, h, card, onArrive })` pinta uma vaga no chão, na cor da era.
- Parar nela (velocidade abaixo de 1,5 por 0,5 s) aproxima a câmera, chama `onArrive` e abre o cartão: uma caixa HTML com título, período, texto e os valores em etiquetas.
- Sair da vaga fecha o cartão.
- O cartão nunca cobre o velocímetro nem o rádio, nas três telas.

**X3 · Balões de comando.** Os balões de fala que já existem ganham o estilo "comando": maiúsculas e fundo verde-oliva. São usados para as vozes de comando e o instrutor.

### Capítulo 1 · EsPCEx (2019)

**C1 · Portão da EsPCEx** (ficha 1), a 6 m da chegada, sobre a estrada.
- Arco com "ESCOLA PREPARATÓRIA DE CADETES DO EXÉRCITO", guarita, sentinela e bandeira.
- Ao passar, a sentinela faz continência, toca o toque de alvorada (uma vez) e abre o cartão do capítulo.

**C2 · Pátio de formatura** (ficha 2), no lugar do acampamento de hoje.
- Pelotão de 30 alunos de farda em três fileiras, instrutor, mastro e palanque.
- Na vaga:
  - a ordem unida executa "Sentido!", "Direita, volver!" e "Ordinário, marche!", com os 30 girando juntos (diferença menor que 0,3 s);
  - o desfile dá uma volta no pátio, com a caixa marcando o passo;
  - a Esquadrilha passa baixo durante o desfile.

**C3 · Pavilhão de aulas e alojamento** (ficha 3), no lugar das barracas do leste.
- Salas acesas com alunos e beliches visíveis.
- Na vaga, o quadro "Rotina do aluno" risca os 5 itens, toca o toque de silêncio e as luzes se apagam.

### Capítulo 2 · AMAN (2020)

**C4 · Placa "Resende · AMAN 2020" e Portão Monumental** (ficha 4), depois do cruzamento com o circuito.
- Colunas brancas e frontão.
- Ao passar, dois cadetes fazem continência, toca um toque curto de corneta e abre o cartão.

**C5 · Conjunto Principal e espadim** (ficha 5).
- Um prédio de três andares com torre central e arcadas substitui a torre de caixas de hoje.
- Uma companhia de cadetes em forma no pátio.
- Na vaga, a saudação com o espadim é feita em uníssono e abre o cartão.

**C6 · Telão da AMAN** (ficha 6). O telão de hoje ganha uma arquibancada com cadetes assistindo, e a vaga abre o cartão com o vídeo local.

**C7 · Pista de obstáculos (TFM)** (ficha 7).
- A pista de hoje ganha arquibancada, um placar de tempo na chegada (melhor tempo), um pelotão correndo na lateral e um instrutor com balões ("Mais rápido, cadete!" e "Excelente!").
- A jogabilidade e os testes atuais da pista continuam.

### Capítulo 3 · Engenharia de combate (2021)

**C8 · Castelo da Engenharia** (ficha 8), na entrada do circuito.
- Monumento de 6 m em forma de castelo e a placa "ENGENHARIA".
- Ao lado, o pátio de máquinas: trator, caminhão de ponte e caçamba.
- Engenheiros com uma planta.
- Ao passar, abre o cartão com o patrono.

**C9 · Transposição da brecha** (ficha 9).
- A vala vira uma brecha de 6 m de comprimento na estrada e 2 m de fundo, com água no fundo.
- Ao lado, a vaga do pontoneiro e o caminhão de ponte com 6 engenheiros.
- Na vaga, a equipe corre e a ponte é lançada em 4 s. O carro atravessa por ela.
- A rampa continua sendo um jeito de saltar.
- Sem ponte e sem salto, o carro cai, como a vala da parte 1.

**C10 · Comboio sob o seu comando** (ficha 10).
- As 7 viaturas do comboio de hoje passam a esperar em coluna na área de reunião da estrada leste.
- Na vaga "assumir o comando", elas seguem o DeLorean pela trilha real dele (migalhas a cada 2 m), a 8 m uma da outra, sem bater, até a ponte.
- A missão fecha quando as 7 atravessam ("7 de 7").
- Se o jogador demorar mais de 90 s, o comboio volta sozinho para a área de reunião.

**C11 · Abertura de estrada** (ficha 11). Na estrada norte, troncos e pedras bloqueiam metade da pista. Ao chegar a menos de 25 m, o trator empurra o bloqueio para fora em até 5 s, e os colisores saem da pista.

### Em toda a fase

**C12 · Campos de instrução sem placa** (ficha 12).
- Selva: acampamento, redes, fogueira e uma patrulha de 8 em fila entrando na mata, em laço.
- Caatinga: posto de observação com binóculo girando, duas viaturas camufladas e um grupo com uma carta.
- Montanha: rapel subindo e descendo num paredão, com a equipe embaixo.

**C13 · Esquadrilha da Fumaça** (ficha 13). Quatro aviões monomotores de hélice, de asa baixa, feitos de primitivas, substituem as naves espaciais. Voam em formação com fumaça e fazem uma passagem baixa durante o desfile (C2).

**C14 · Som da fase** (sintetizado, sem download):
- corneta (alvorada, silêncio e toque curto) com timbre de metal (dente de serra filtrada, vibrato e ataque lento);
- passos de tropa (cliques de ruído filtrado em sincronia com a animação);
- caixa de marcha;
- motor a hélice da Esquadrilha;
- hidráulico da ponte;
- esteira do trator.

Tudo atrás do botão de som, e com volumes dentro das faixas da parte 1.

## 4. Metas medidas

| Meta | Alvo |
|---|---|
| Lugares da fase encontrados e fotografados pela auditoria | 13 de 13 |
| Pessoas na fase | ≥ 60, sendo ≥ 30 no pátio da EsPCEx |
| Superfície lisa na tela na chegada | < 35% (hoje 58%) |
| Cartões com texto exato e ao menos um valor | 13 de 13 (alguns lugares compartilham cartão de capítulo) |
| Custo | ≤ +150 chamadas de desenho e ≤ +2 ms de simulação por quadro |
| Testes atuais | Todos passando, mais um teste por lugar com interação |

## 5. Fora do escopo

O portal (parte 2). As cidades (partes 4 a 7), que reutilizam X1, X2 e X3.
