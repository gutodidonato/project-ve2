# Salto 88: o quiosque das paradas — Design

Data: 2026-10-26 · Branch: `salto-88` · Autor: Luis Didonato (com Claude)
Muda o que acontece nas vagas (`addStop`) do jogo descrito em `2026-10-15-salto-88-design.md` e nas partes seguintes. As eras, o percurso, as cenas de cada lugar, os cartões de capítulo e o fim da viagem continuam valendo.

## 1. Por quê

O Luis jogou o preview e disse: "quando o carro chegar nas regiões marcadas fica rodando e não tem interação legal".

Hoje, ao parar numa vaga, sobe um cartão de texto e nada mais acontece. Se o visitante não aperta nenhuma tecla, depois de 9 s o piloto automático da demonstração (`S.demo`) assume e sai dirigindo. Só algumas paradas seguram o piloto por 5 a 10 s. É esse o "fica rodando".

Sucesso: quem para numa vaga entende o que o Luis fez ali (cargo, período, o que fez, o case e o vídeo do lugar) e segue com um toque, dirigindo ou num tour guiado até a próxima parada. O carro nunca sai sozinho de uma vaga.

Este é o primeiro de três specs combinados em 26 out. Os outros dois, ainda por escrever, são o computador (LuisOS 88) e o final do portfólio.

## 2. Decisões fechadas

| Tema | Decisão |
|------|---------|
| Objetivo da parada | Entender o trabalho (um quiosque), não um minijogo |
| Formato | A câmera enquadra o lugar e um painel lateral traz o conteúdo; no celular o painel sobe de baixo |
| Conteúdo | Empresa, cargo e período, "O que fiz" (bullets), o case do lugar (resumo e stack) e o vídeo do lugar. Sem as métricas |
| Saída | Dois botões: "Próxima parada" (tour guiado) e "Dirigir" |
| Piloto da demonstração | Nunca assume com uma parada ativa, com o quiosque aberto ou com o tour em andamento |
| Abordagem | Um módulo de quiosque genérico, configurado por parada; o texto vem de `content/pt/profile.ts` no build |

## 3. Experiência

### 3.1 Chegada

A regra de chegada continua a de hoje: o carro dentro da vaga, abaixo de 1,5 m/s por 0,5 s. A parada fica ativa, o carro fica freado e o quiosque abre.

Em cerca de 0,8 s, a câmera sai de trás do carro e vai para o enquadramento da parada. O lugar fica em primeiro plano e o carro de lado.
- Cada parada pode ter seu ângulo (`kiosk.cam` no `addStop`, relativo à vaga).
- Sem ângulo próprio, vale o padrão: 3/4, do lado da vaga oposto ao painel, olhando para o centro do lugar.

A cena que o lugar já tem roda dentro do enquadramento: a ponte do pontoneiro, a missão do radar, os cliques da Valiant, as entregas da Colmeia e as animações da EVIG. Os `onArrive` de hoje continuam disparando.

### 3.2 O painel

**Posição.**

| Tela | Onde |
|------|------|
| Desktop e tablet | Coluna à direita, cerca de 40% da largura, altura toda, com rolagem própria se passar |
| Celular em pé | Folha de baixo, no máximo 50% da altura |
| Celular deitado (altura ≤ 500 px) | Coluna à direita, 45% da largura |

**Conteúdo, de cima para baixo.** Cada bloco só aparece se a parada o tiver.
1. Empresa · cargo e período.
2. O destaque da parada: a frase que hoje é o texto do cartão (por exemplo, "Praça dos telões: apps de streaming para web e Android TV…").
3. "O que fiz": os bullets da experiência, iguais aos de `profile.ts`.
4. O case: título, resumo e a stack em etiquetas.
5. O vídeo do lugar: mudo, em loop, com um toque para ligar o som.
6. Os botões "Próxima parada" (principal) e "Dirigir".

O foco vai para "Próxima parada" ao abrir. O painel é um `role="dialog"` não modal: o jogo continua à vista.

### 3.3 Sair da parada

| Ação | Teclado / toque | O que acontece |
|------|------------------|----------------|
| Próxima parada | Enter, ou o botão | O painel fecha e o carro dirige sozinho pelo percurso até a próxima vaga; lá estaciona e o quiosque abre |
| Dirigir | Esc, o botão, ou qualquer tecla de dirigir (a tecla já age) | O painel fecha, a câmera volta para trás do carro em até 1 s e o controle é do visitante |
| Tecla de dirigir durante o tour | Qualquer tecla de dirigir | O tour para e o controle volta |

**O tour guiado.**
- A "próxima parada" segue a ordem em que o percurso da era passa pelas vagas.
- Depois da última parada da era, o tour atravessa o portal e continua até a primeira parada da era seguinte.
- Na EVIG, a nave voa até sobre a próxima plataforma e desce com o pouso assistido que já existe.
- Da última parada da EVIG, o tour atravessa o portal e entra na vitrine final, como faz hoje quem passa pelo portal.

### 3.4 Parada já vista

Depois de vista, a seta da vaga troca de cor: a cor da era mais apagada. Voltar a uma parada já vista reabre o quiosque.

### 3.5 Piloto da demonstração

`S.demo` só começa quando todas estas condições valem:
- nenhuma parada está ativa;
- o quiosque está fechado;
- o tour não está em andamento.

A regra fica num lugar só, na checagem de ócio. As travas `if (S.idle > 5) S.idle = 5` espalhadas pelas cenas das paradas e pelo pouso da EVIG saem.

## 4. Conteúdo de cada parada

**Fontes.**
- **Perfil.** O `build-v3.mjs` lê `content/pt/profile.ts` (o Node 22 lê TypeScript direto) e o mapa `proto/kiosk-map.json` do laboratório. Injeta no HTML uma tabela `KIOSK` (por parada) e outra `CASES` (por slug), com empresa, cargo, período, bullets, cases e vídeo. Não há busca em tempo de execução.
- **Textos do jogo.** O destaque de cada parada e as 4 paradas do Exército (a era não está em `profile.ts`) continuam com os textos que o jogo já tem.
- **Rótulos novos.** "Próxima parada", "Dirigir" e "O que fiz" ficam na tabela injetada.
- O jogo continua só em português, como hoje.

**O mapa.**

| Parada | O que fiz | Case | Vídeo |
|--------|-----------|------|-------|
| `patio` | EsPCEx 2019 (texto do jogo) | — | — |
| `aman` | AMAN 2020 (texto do jogo) | — | `aman` |
| `pontoneiro` | Engenharia 2021 (texto do jogo) | — | — |
| `comando` | Engenharia 2021, comboio (texto do jogo) | — | `comemoracao` |
| `redbit` | bullets RedBit | Oceans-20; Vistoria de bicicletas (Porto Seguro) | `fiap` |
| `animacoes` | bullets RedBit | — | `mobile` |
| `valiantgroup` | bullets ValiantGroup | — | `fullstack` |
| `praca-dos-teloes` | bullets ValiantGroup | — | — |
| `clientes` | bullets ValiantGroup | — | — |
| `sede-colmeia` | bullets Colmeia | — | — |
| `sede-evig` | bullets EVIG | Arquitetura LLM-first | — |
| `aws-evig` | — | Migração GCP → AWS | — |
| `assistente-evig` | — | Arquitetura LLM-first | — |
| `triagem-evig` | — | WhatsApp Tech Provider | — |

O build falha, com a parada e o campo na mensagem, se acontecer qualquer um destes casos:
- uma parada do jogo não tem entrada no mapa;
- o mapa cita uma empresa ou um slug que não existe no perfil;
- o mapa cita um vídeo que não existe em `public/salto88/video/`.

## 5. Arquitetura

| Peça | Onde | O que faz |
|------|------|-----------|
| `proto/kiosk-map.json` | laboratório | Por parada: `company` (opcional), `cases` (slugs), `video` (opcional) |
| Leitura do perfil | `build-v3.mjs` | Lê `profile.ts`, cruza com o mapa, valida e injeta `KIOSK` e `CASES` no lugar de um marcador do template |
| `kiosk.cam` | `addStop(g, { …, kiosk: { cam } })` | O enquadramento próprio da parada (posição e alvo relativos à vaga), opcional |
| Módulo do quiosque | template | `openKiosk(st)` e `closeKiosk('drive' \| 'next')`, o painel `#kiosk` (DOM, no estilo do cartão de hoje), o vídeo, o foco e as teclas |
| Câmera `S.kiosk` | `updateCamera` | Com o quiosque aberto, a câmera interpola até o enquadramento; ao fechar, volta para trás do carro |
| Tour `S.tour` | template | Calcula a próxima parada e entrega ao piloto que já existe os pontos até a entrada da vaga, alinhados com a direção dela. Na última parada da era, o alvo é o portal; na EVIG, pede o pouso assistido |
| Regra do ócio | checagem de `S.idle` / `S.demo` | Uma condição só: parada ativa, quiosque aberto ou tour bloqueiam a demonstração |
| Debug | `window.__salto` | `kiosk()` devolve o estado do painel: aberto, parada, título, bullets, vídeo e foco. `tour()` devolve o alvo e a fase |

Nas paradas, o quiosque toma o lugar de `showCard`. A fila dos cartões de capítulo e de eventos (`queueLineCard`) continua igual, e espera o quiosque fechar, como hoje espera a parada.

Se o vídeo falhar ao carregar, o bloco some sem deixar espaço vazio.

## 6. Testes

Todos rodam em 1 núcleo com prioridade Idle (`e2e/idle.sh`), uma era por vez. Cada teste novo é visto falhar no build atual antes da mudança.

| Teste | Passa quando |
|-------|--------------|
| Ficar na vaga | Em cada era com vagas, o carro parado na primeira vaga, 15 s sem tecla, sai do lugar menos de 0,3 m. Falha hoje: a demonstração assume aos 9 s |
| Quiosque abre | Ao parar, `kiosk()` está aberto, com título e bullets iguais aos de `profile.ts` |
| Enquadramento | O centro do lugar, projetado na tela, cai fora do painel e dentro da tela, em 960×540, 375×812 e 812×375 |
| Próxima parada | De cada parada, o tour chega à seguinte e o quiosque reabre em até 90 s de jogo por trecho. Da última, chega à primeira da era seguinte, em até 150 s com o portal. Na EVIG, pousa na plataforma |
| Dirigir | O painel fecha, a câmera está atrás do carro em até 1 s e o carro responde à tecla. Uma tecla de dirigir no meio do tour devolve o controle |
| Celular | Em 375×812 e 812×375, o painel não cobre os botões do HUD (setas, rádio, zoom) |
| Build | Falha com uma parada sem entrada, um slug inexistente ou um vídeo inexistente. Os bullets injetados são iguais aos do perfil |

Os testes atuais de cada parada continuam passando: `run.mjs` (ponte, radar, Valiant, Colmeia, pousos da EVIG), `stops-end-check.mjs`, `ghost-check.mjs`, `scene-check.mjs` e `turntable.mjs`.

## 7. Fora deste spec

- **O computador (LuisOS 88)** e **o final do portfólio** (vitrine, "Sua viagem", o que vem depois) terão specs próprios.
- **O jogo em inglês** fica para depois; o quiosque segue o jogo, em português.
- **As métricas** (−80%, 2 s → 0,5 s, 85,4%) ficam fora do painel, por decisão do Luis.
- **Novas cenas ou minijogos** nas paradas também ficam fora.
