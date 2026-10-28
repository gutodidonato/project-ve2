# Salto 88: paradas que explicam — Design

Data: 2026-10-28 · Branch: `salto-88` · Autor: Luis Didonato (com Claude)
Muda o quiosque das paradas (`2026-10-26-salto-88-quiosque-das-paradas-design.md`): o painel, os botões, o tour e a regra do piloto da demonstração continuam valendo, salvo o que este spec diz. As eras, o percurso e as cenas que os lugares já têm continuam.

## 1. Por quê

O Luis pediu para trabalhar "as entradas e os blocos de parada para a gente otimizar de um em um, explicando e uma experiência legal neles".

Hoje, parar numa vaga abre o painel com o texto do lugar e enquadra o prédio. O lugar em si não mostra nada do que o painel diz. Chegar numa parada também não tem nada de especial: a vaga é um retângulo pintado no chão.

Sucesso: o visitante sente o lugar chamar quando se aproxima e, parado, vê cada item do painel acontecer num ponto do bairro, um de cada vez, no ritmo dele. Sem número, sem slogan, sem texto novo.

Este spec traz o molde comum e a primeira parada, o escritório da RedBit. As outras 13 paradas vêm depois, uma por ciclo (§9).

## 2. Decisões fechadas

| Tema | Decisão |
|------|---------|
| "Entrada" | A chegada a cada parada: os últimos metros antes da vaga |
| Chegada | "O lugar chama": a ~40 m o lugar reage (luzes, placa, pessoas, caminho de luz no chão). Sem texto novo |
| Parado | "O lugar explica": cada item do painel acende uma parte do bairro, a câmera vai até lá e o visitante avança item por item |
| Abordagem | Passeio pela quadra: cada item (beat) tem um lugar real, uma câmera e uma cena curta. Um item sem lugar fica no plano B (§3.9) |
| Primeira parada | Escritório da RedBit; depois, a ordem do tour |
| Item "sites responsivos + SEO" | Uma bancada atrás do vidro do escritório, com monitor, tablet e celular mostrando o mesmo site, que se reorganiza. O radar sai da história |
| Métricas | Continuam fora (decisão do spec do quiosque, §7). Nenhuma cena mostra número de desempenho |
| Demo | Abre o quiosque em modo automático, item a item, e segue dirigindo depois do último |

## 3. O molde

### 3.1 Dados: os beats

Cada parada do `proto/kiosk-map.json` pode ter uma lista `beats`, na ordem em que os itens aparecem no painel:

```json
"redbit": { "company": "RedBit", "cases": ["oceans-20", "vistoria-porto-seguro"], "video": "fiap", "highlight": false,
  "beats": [
    { "item": "bullet:0", "place": "bancada" },
    { "item": "bullet:1", "place": "conversoes" },
    { "item": "case:oceans-20", "place": "ecoponto" },
    { "item": "case:vistoria-porto-seguro", "place": "vistoria" },
    { "item": "video", "place": "fiap-telao" }
  ] }
```

- `item` aponta para um item que o painel já mostra:
  - `bullet:N` é o N-ésimo bullet **depois** do filtro de métricas (`omitMetrics`);
  - `case:<slug>` é um dos `cases` da parada;
  - `video` é o vídeo da parada.
- `place` é o id de uma âncora registrada pelo template (§3.2). O JSON não guarda câmera nem cena: isso é cena, não conteúdo.
- O build (`tools/kiosk-content.mjs`) valida cada beat e falha com mensagem clara quando o item não existe: bullet fora do intervalo, case que a parada não tem, `video` numa parada sem vídeo. Os beats seguem para o `KIOSK_DATA` com o índice do item no painel já resolvido.
- O texto continua vindo só de `content/pt/profile.ts` e das mensagens. Um beat não carrega texto.

### 3.2 Âncoras dos lugares

O código de cada lugar registra suas âncoras:

```js
beatPlace('bancada', { cam: { pos: [x, y, z], look: [x, y, z] }, play: function () {}, stop: function () {} });
```

- `cam` fica em coordenadas do mundo, porque os lugares ficam longe da vaga.
- `play()` começa a cena do beat e a mantém em loop enquanto o beat é o atual. `stop()` a interrompe e devolve o lugar ao estado de repouso, sem deixar resto (pessoa a meio caminho, canvas a meio desenho).
- A cena usa o que o lugar já tem sempre que possível: as mesmas pessoas (`Person`), os mesmos canvas e a mesma lógica que roda quando o carro passa.
- As âncoras são da era: somem e voltam com ela, como os lugares.

### 3.3 Chegada: o lugar chama

Uma parada com `call` no `addStop` reage quando o carro se aproxima:

- **Dispara** quando o carro está a 40 m da vaga ou menos, indo na direção dela. **Apaga** quando passa de 60 m. Entre 40 e 60 m, o estado se mantém, o que evita piscar na borda.
- O que acende vem do `call` da parada:
  - `lights`: malhas que ganham brilho (placa, neon, janelas);
  - `people`: pessoas do lugar que viram o rosto para a rua;
  - um caminho de luz tracejado no chão, da faixa até a vaga, na cor da era.
- A subida leva ~0,6 s e a descida ~1 s, sem salto.
- Vale na demo também.
- Sem texto, toast nem missão novos.

### 3.4 Parado: o lugar explica

A regra de chegada à vaga é a de hoje (dentro da vaga, abaixo de 1,5 m/s por 0,5 s). Numa parada com beats:

- O quiosque abre no item 1. O item atual fica aceso, com uma barra na cor da era à esquerda, e os outros ficam a 55% de opacidade. O painel rola até o item atual.
- A câmera vai até o lugar do beat (§3.5) e chama `play()` do beat. Ao trocar de beat, chama `stop()` do anterior antes de `play()` do próximo.
- Ao sair (Dirigir, Esc, Próxima parada ou o carro deixando a vaga), o quiosque chama `stop()` do beat atual.
- Voltar à parada depois recomeça do item 1.

### 3.5 Câmera

- A troca entre beats leva ~1,2 s com suavização (ease in-out).
- Num trajeto acima de 30 m, a câmera sobe em arco até ~18 m de altura no meio do caminho, para não atravessar prédio.
- O enquadramento continua o do quiosque: o ponto `look` cai no meio da parte livre da tela, ao lado do painel (`kioskAim`). No celular em pé, a câmera recua 1,6x, como hoje.
- "Dirigir" devolve a câmera para trás do carro, como hoje.

### 3.6 Controle do visitante

- `kNext` mostra "Próximo · 2/5" enquanto há item depois do atual e avança. No último item, mostra "Próxima parada" e faz o que faz hoje (fecha e começa o tour). O rótulo "Próximo" é novo e entra nos `LABELS` das mensagens.
- Tocar ou clicar num item do painel pula direto para ele. É assim que se pulam itens.
- Teclado com o quiosque aberto:
  - Enter e → avançam (no último, Próxima parada);
  - ← volta um item (no primeiro, nada);
  - Esc dirige.
  
  As outras teclas de dirigir continuam devolvendo o volante, como hoje. Com o quiosque aberto numa parada com beats, ← e → deixam de contar como teclas de dirigir; A, D, ↑, ↓, W e S continuam contando.
- `kDrive` sai a qualquer momento.

### 3.7 Tour e demo

- **Tour:** chegou na parada, o tour pausa, como hoje, e o visitante comanda os itens. "Próxima parada" (no último item) retoma o tour.
- **Demo (modo de atração, sem visitante):**
  - quando a demo estaciona numa parada com beats, o quiosque abre em modo automático, com um item a cada 6 s;
  - 6 s depois do último, o quiosque fecha e a demo sai dirigindo;
  - nesse modo, a parada ativa não segura a demo (`demoBlocked`), porque a parada é dela.
- Qualquer toque, clique ou tecla do visitante tira a demo (regra de hoje) e mantém o quiosque aberto no item atual, sob controle dele.
- A regra do spec do quiosque continua: com um visitante parado na vaga, o piloto da demonstração nunca assume.
- Na era da RedBit, o ponto de parada do caminho da demo (`dwellAt`) passa a ser a vaga da RedBit, para que a demo mostre os beats.

### 3.8 Celular

- **Em pé:** a folha de baixo mostra o painel inteiro, rolável, centrado no item atual. Os botões continuam fixos embaixo, dentro da folha.
- **Deitado:** a coluna da direita fica como está.
- Os botões e o item atual cabem na tela em 375x812 e em 812x375.

### 3.9 Paradas sem beats e plano B

- Uma parada sem `beats` funciona exatamente como hoje. As 13 paradas que ainda não passaram pelo seu ciclo não mudam.
- Um beat cujo `place` não está registrado na era cai no plano B: a câmera fica no enquadramento da própria parada e o item só acende no painel. O jogo não quebra, e o teste de cada parada configurada exige que todos os lugares existam.

## 4. RedBit

Lugares que existem na era: o escritório (quadra 0,1, vaga em x 8,75, z 57,5), o campus da FIAP (quadra -1,1, com o telão que já toca o `fiap`), o radar da avenida, a Rua das Conversões (quadra 0,0 e a rua z 0) e as Animações em JS (quadra 0,-2, parada própria).

O prédio responsivo, a quadra Projetos (Ecoponto e Vistoria), a Praça da FIAP e a Galeria foram cortados na curadoria e não voltam. As cenas dos casos são pequenas e novas, ao lado da vaga.

### 4.1 Chegada

`call` da RedBit:

- O neon REDBIT (`neon-redbit`) acende com um piscar de partida e o brilho (`glow`) sobe.
- O vidro do open space fica mais claro.
- As pessoas dos `spots` do escritório viram o rosto para a rua.
- Um caminho tracejado na cor da era vai da faixa até a vaga.

### 4.2 Os itens

1. **"Criei e otimizei sites com foco em responsividade e SEO." (lugar `bancada`)**
   - Uma bancada no térreo, logo atrás do vidro e perto da vaga: monitor, tablet e celular mostram o mesmo site.
   - Em loop, o layout se reorganiza nas três larguras: 3 colunas no monitor, 2 no tablet, 1 no celular, com o menu virando hambúrguer no celular. Os blocos entram em sequência, ~1,5 s por passo.
   - Sem número nem texto além do que um site de mentira tem (barras, blocos, imagens chapadas).
   - Câmera perto do vidro.
2. **"Configurei tags, eventos e conversões com Google Tag Manager e Google Ads." (lugar `conversoes`)**
   - A câmera vai até a Rua das Conversões, ~60 m ao sul. Uma pessoa faz a compra:
     - para e olha a vitrine da Loja Exemplo, e o pórtico `page_view` acende;
     - pega o carrinho da calçada, e `add_to_cart` acende;
     - entra na loja, e `purchase` acende.
   - A tela de eventos da vitrine e o contador do telhado respondem como respondem ao carro.
   - Essa compra não conta no placar da viagem (`tripRec`) nem dispara toast ou missão.
3. **Oceans-20 (lugar `ecoponto`)**
   - Um ecoponto pequeno, novo, na calçada perto da vaga, longe dos `spots` das pessoas: 3 lixeiras coloridas.
   - Alguém fotografa um saco com o celular (`holding-both` e um celular na mão).
   - Uma bicicleta de carga (a bicicleta da cidade com uma caçamba) chega, leva o saco e sai.
   - É o "encaminhar registros de resíduos a parceiros de coleta" mostrado.
4. **Vistoria de bicicletas (lugar `vistoria`)**
   - No bicicletário ao lado da vaga, agora com uma bicicleta presa, alguém fotografa a bicicleta.
   - Um retângulo de detecção na cor da era se desenha em volta dela, de canto a canto, e fica uns segundos.
   - Sem rótulo.
5. **Vídeo FIAP (lugar `fiap-telao`)**
   - A câmera atravessa a avenida e enquadra o telão do campus da FIAP, que já toca `fiap`. O vídeo recomeça do início ao entrar no beat.
   - O vídeo do painel continua onde está e acende como item.

### 4.3 O radar

O radar continua na avenida como está: pista, painel, outdoor, toasts.

A parada da RedBit deixa de chamar a missão do radar (`MISSION_RADAR`) no `onArrive`, porque o radar não faz mais parte da história da parada.

## 5. Texto e conteúdo

- Texto só de `content/pt/profile.ts`, das mensagens e dos textos que o jogo já tem. O único texto novo é o rótulo "Próximo", nos `LABELS`.
- Nenhum número de desempenho em cena nova.
- Nenhum telefone em lugar nenhum.
- Nenhum fetch de terceiros em tempo de execução.

## 6. Desempenho

- Nada aloca por frame. Malhas, canvas e materiais das cenas novas são criados uma vez por era.
- Um canvas só é redesenhado quando o que mostra muda. A bancada redesenha a cada passo do loop, não a cada frame.
- As cenas novas só rodam quando são o beat atual. A chegada só calcula a distância da parada mais próxima.

## 7. Testes

TDD, um núcleo em prioridade Idle (`e2e/idle.sh`), um servidor de teste de cada vez.

**Unit (`e2e/kiosk-content.test.mjs`)**
- Os beats da RedBit saem do `kiosk-map` com o índice do item resolvido.
- `bullet:0` da RedBit é "Criei e otimizei sites com foco em responsividade e SEO." (depois do filtro).
- O build falha quando:
  - um bullet está fora do intervalo;
  - o case não pertence à parada;
  - há `video` numa parada sem vídeo.

**e2e (`e2e/kiosk-check.mjs`, seções novas)**
- `chegada`:
  - a 35 m, indo para a vaga: o neon passa do brilho de repouso, o caminho fica visível e as pessoas do escritório olham para a rua;
  - a 70 m, tudo volta;
  - entre 40 e 60 m, o estado não pisca.
- `beats`:
  - ao estacionar, o item 1 está aceso e a câmera está a menos de 1 m do `cam` da bancada;
  - `kNext` mostra "Próximo · 2/5";
  - clicar no item 4 pula para ele;
  - no item 5, `kNext` mostra "Próxima parada";
  - ← volta;
  - Esc fecha e cada lugar está em repouso.
- `cenas`:
  - a bancada passa por 3, 2 e 1 colunas;
  - a compra dispara `page_view`, `add_to_cart` e `purchase` em ordem, e o placar da viagem não muda;
  - a bicicleta de carga leva o saco;
  - o retângulo envolve a caixa da bicicleta;
  - o telão do campus está tocando `fiap`.
- `demo-beats`:
  - a demo estaciona na RedBit;
  - os itens avançam a cada ~6 s;
  - depois do último, o carro sai sozinho;
  - um toque no meio assume o controle e o item atual fica.
- `celular`: em 375x812 e 812x375, o item atual e os dois botões estão dentro da folha ou da coluna.
- `radar`: estacionar na RedBit não muda a missão para a do radar.
- As seções de hoje (`vaga`, `quiosque`, `botoes`, `travado` etc.) continuam passando. As 13 paradas sem beats se comportam como antes.

## 8. Fotos

O loop do Salto 88: fotos ordenadas, nota, correções em lote e nova rodada.

- Fotos da chegada (40 m e 20 m) e de cada um dos 5 beats, em 960x540 e 375x812.
- Meta: nota ≥ 9 no desktop e ≥ 8 no celular.

## 9. Depois deste spec

Com o molde pronto, cada parada é um ciclo próprio (desenho, build, fotos, nota), nesta ordem: as outras 13 na ordem do tour, `patio`, `aman`, `pontoneiro`, `comando`, `animacoes`, `valiantgroup`, `praca-dos-teloes`, `clientes`, `sede-colmeia`, `sede-evig`, `aws-evig`, `assistente-evig`, `triagem-evig`.

Cada ciclo escolhe os lugares da parada, a chegada e as cenas. O molde só muda se uma parada mostrar que precisa.

## 10. Riscos

- **Câmera longe com neblina:** a neblina vai de 60 a 230 m. Os lugares da RedBit ficam a menos de 90 m da vaga, e cada câmera de beat fica a menos de 40 m do seu lugar.
- **Cena que não para:** uma pessoa a meio caminho ou um canvas a meio passo ao trocar de beat. Cada `stop()` devolve o repouso, e o teste `beats` confere depois de Esc.
- **Demo presa na vaga:** o modo automático solta a demo depois do último item. O teste `demo-beats` confere.
- **Compra contando no placar:** a compra do beat não passa por `tripRec`. O teste `cenas` confere.
