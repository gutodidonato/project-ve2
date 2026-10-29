# Salto 88: claro e jogável — Design

Data: 2026-10-29 · Branch: `salto-88-claro` · Autor: Luis Didonato (com Claude)
Parte A da revisão geral do portfólio. Muda o spec `2026-10-28-salto-88-paradas-que-explicam-design.md` em um ponto: o radar da RedBit sai do mundo inteiro (§5.1), não só da história da parada (aquele spec, §4.3). O resto dele continua valendo.

## 1. Por quê

Depois do deploy em luishtml.cloud, o Luis disse que "tem muita coisa para corrigir": "está fraco se for pensar no sentido de portfólio completo/divertido/muito bom", "está pouco acessível e falta muita coisa".

O que ele apontou no jogo:

- Prints com defeitos de cena:
  - na Marginal Tietê, as placas aparecem tapadas por blocos hexagonais;
  - na sala de streaming, o controle remoto gigante tapa as telas, os textos saem cortados ("Hospital Sír…", "Fiesta Amer…") e as cabeças do público entram no quadro;
  - no quadro Jira da Colmeia, o aviso "Entregas: 0" fica na frente do quadro, o card INT-107 sai cortado, a placa DOCA 1 tapa o quadro e os hexágonos tapam a base.
- Falta um aviso na tela de que o jogo tem som.
- Faltam indicadores de objetivo, como "na colmeia para buscar os pacotes".
- As teclas e os botões precisam ficar mais aparentes.
- O jogo precisa funcionar no celular.
- Há inconsistências, como "os 2.0s, do nada, na redbit" (o radar que saiu da história mas ficou no mundo).
- Algumas paradas travam: o carro "trava na parada e começa a tentar rodar e buga por causa da camera view".

Público do portfólio, na ordem que o Luis definiu: recrutador (CTO / Tech Lead), cliente, comunidade. Para o recrutador, um jogo com defeito visível ou que trava pesa contra.

**Sucesso:**

- Quem joga pela primeira vez sabe que há som, sabe para onde ir em cada missão e quais teclas usar, sem abrir o "Sobre".
- Nenhuma placa ou tela fica tapada, nenhum texto sai cortado e nenhuma parada trava o carro.
- Nada no jogo conta algo que a história atual não conta.
- Tudo isso vale no desktop e no celular.

## 2. Decisões fechadas

| Tema | Decisão |
|------|---------|
| Ordem das partes | A (este spec) primeiro; depois B (projetos e casos), C (primeiro minuto do recrutador), D (mais diversão) |
| Abordagem | Primeiro as três peças comuns (§3); depois a varredura por fotos com regras de cena (§4), em duas levas (§8) |
| Som | Começa desligado. No primeiro Dirigir aparece um aviso forte, e o botão Som pulsa até ser usado |
| Objetivo | Seta-guia mais farol no alvo. Vale para toda missão que tem lugar |
| Teclas | No contexto: a tecla aparece desenhada quando serve e some depois de usada. Todo botão mostra a própria tecla. No celular não há teclas desenhadas, e os botões de toque ficam maiores e com rótulo |
| Celular | Entra na varredura: em pé (375×812) e deitado (812×375) |
| Radar da RedBit | Sai do mundo inteiro: pista, poste, placa, outdoor, avisos, missão e menção no "Sobre" |
| "Pontos" | Cada parada ganha uma nota de experiência (chegar, entender, sair). Dar itens explicados às outras paradas fica para a parte D |

## 3. As três peças

### 3.1 Objetivo: seta e farol

Toda missão que tem lugar declara um alvo: posição (x, y, z), nome curto em maiúsculas e ícone. O jogo guarda **um alvo atual** por vez. Missões que se sucedem (por exemplo, o heliponto e depois a doca) trocam o alvo.

**A seta-guia (`#guide`):**

- Aponta o alvo atual, com a distância: "PACOTE · 42 m", "DOCA · 18 m".
- Sem alvo de missão, volta ao comportamento de hoje: "PORTAL" ou "RODOVIA", escondida a menos de 40 m.
- Com alvo de missão, some quando o alvo está dentro do campo de visão e a menos de 40 m, porque o farol basta. Volta quando ele sai da tela ou fica mais longe.
- A regra que hoje esconde a seta quando ela cobre o rótulo do portal (`labelOverGuide`) continua valendo.

**O farol:**

- Coluna de luz vertical na cor de destaque da era, com o ícone do alvo girando no topo.
- É desenhado sem neblina, para ser visto de longe, e com transparência aditiva.
- Apaga em 0,4 s quando o carro chega a menos de 6 m do alvo e volta se ele se afastar sem cumprir a missão.
- Há no máximo um farol na cena. A geometria e o material são criados uma vez e reaproveitados entre missões e eras.

**Missões com alvo:**

| Era | Missão | Alvo |
|-----|--------|------|
| Exército | Pista de obstáculos | A largada; durante a pista, o próximo trecho (cones, lama, brecha) |
| Exército | Comboio / ponte | A ponte |
| FIAP + RedBit | Estacionar no escritório | A vaga da RedBit |
| ValiantGroup | Escritório, clientes, praça | A próxima das três ainda não visitada, na ordem da missão |
| Colmeia | Pacote | O heliponto; com o pacote a bordo, a doca da Jira |
| EVIG | Órbita | A próxima argola |
| Rodovia | Marginal Tietê | A saída da Marginal |

Uma missão sem lugar (só texto) não declara alvo, e a seta segue no portal.

### 3.2 Teclas no contexto

**Teclas desenhadas:** um estilo único de tecla (`<kbd>`, com borda, fundo e sombra de tecla) usado em todo o jogo.

- O botão de início passa a "Dirigir" seguido das teclas **W A S D**.
- Os botões mostram a própria tecla: Som **M**, Foto **F**, Sobre **I**, rádio **R**, buzina **H**.
- O rótulo acessível (`aria-label`) continua dizendo nome e tecla.

**Aviso de tecla:** um aviso no centro, embaixo, acima da área do botão de início, com a tecla desenhada e um verbo curto. Aparece um de cada vez. Some quando a tecla é usada ou depois de 8 s. Cada aviso aparece no máximo uma vez por visita (memória da página, não `localStorage`).

| Quando | Aviso |
|--------|-------|
| Primeiros segundos dirigindo, até a primeira derrapada ou 8 s | **Espaço** derrapa |
| Ao entrar numa era de voo, até subir e descer uma vez | **E** sobe · **Q** desce |
| Pacote a bordo na Colmeia, até descer | **Q** desça até a doca |
| Painel de parada aberto pela primeira vez | **Enter** próximo · **Esc** dirigir |
| Primeira vez perto de um carro parado ou pedestre | **H** buzina |

O aviso de tecla nunca cobre o painel da parada nem o cartão. Se houver conflito, ele espera.

**Celular:** quem usa toque não vê teclas desenhadas nem avisos de tecla. Nesse caso:

- Os botões de toque (subir, descer, buzina, zoom) passam a ter no mínimo 44×44 px e um rótulo curto ("▲ Subir", "▼ Descer").
- O aviso de voo vira "Use ▲ e ▼ para subir e descer", apontando os botões.

### 3.3 Aviso de som

O som continua começando desligado.

- No primeiro clique em Dirigir da visita aparece, por 4 s, um aviso maior que o normal: "Este jogo tem som · **M** ou toque em Som". No celular, o texto é "Este jogo tem som · toque em Som".
- O botão Som pulsa até ser usado uma vez ou por 20 s, o que vier primeiro.
- Com `prefers-reduced-motion`, o botão não pulsa: fica com a borda destacada pelo mesmo tempo.
- O aviso da buzina ("Buzinou! Ligue o som (M) para ouvir") continua.

## 4. Varredura

### 4.1 Cobertura

**As eras:** Exército, FIAP + RedBit, ValiantGroup, Colmeia, EVIG e a tela final. Também a rodovia entre eras e a Marginal Tietê.

**As 14 paradas,** cada uma com o painel aberto e, quando houver, cada lugar dos itens:

- `patio`, `aman`, `pontoneiro`, `comando`;
- `redbit`, `animacoes`;
- `valiantgroup`, `praca-dos-teloes`, `clientes`;
- `sede-colmeia`;
- `sede-evig`, `aws-evig`, `assistente-evig`, `triagem-evig`.

**Os estados de missão:** pista de obstáculos em andamento, comboio, AO VIVO na praça, pacote a bordo e entregue, órbita e Marginal.

**Telas:**

- desktop 960×540;
- celular em pé 375×812;
- celular deitado 812×375.

### 4.2 Frente visual: fotos e notas

- Um script `fotos-varredura` usa a API de depuração (`__salto`) para visitar cada cena em ordem e fotografar nas três telas. Os nomes seguem `<era>-<cena>-<tela>.png`, numa pasta de saída ignorada pelo git.
- Cada foto recebe nota de 0 a 10 e a lista de defeitos que justificam a nota.
- **Meta:** nenhuma foto abaixo de 7 e média de pelo menos 8 em cada tela.
- **Ciclo:** fotografar, dar nota, corrigir em lote e fotografar de novo, até bater a meta.

### 4.3 Frente de conteúdo: inconsistências

Primeiro, um inventário de tudo o que o jogo mostra:

- avisos (`toast`);
- textos de missão (longos e curtos);
- placas e telas desenhadas em canvas;
- rótulos 3D;
- cartões e painéis;
- o "Sobre";
- os objetos com comportamento próprio (radar, telões, cenas).

Cada item é conferido contra a história atual da era (`content/pt/profile.ts`, as mensagens e os textos do jogo que continuam valendo). O que contradiz a história ou sobrou de uma versão anterior sai do jogo. Nenhum texto novo sobre a carreira do Luis é inventado. Os textos novos deste spec são só de interface (§3).

### 4.4 Frente de comportamento: paradas

Um teste dirige até cada uma das 14 paradas e faz:

1. chega pela via, para na vaga e espera o painel abrir;
2. sai dirigindo com **W**;
3. repete a chegada e sai com **A** e com **D**;
4. repete e sai com **Esc** e depois **W**.

Cada saída mede o tempo até o carro deixar a vaga, a rotação acumulada do carro e se ele ficou preso em colisão. A causa do travamento relatado ("começa a tentar rodar e buga por causa da camera view") é investigada antes de qualquer conserto (§5.2).

### 4.5 Regras de cena

As regras valem em toda parada e cena. Cada uma vira um teste automático.

| Regra | Diz | Como o teste mede |
|-------|-----|-------------------|
| **R1 · placa legível** | Da câmera da parada, nenhum objeto fica na frente do texto de uma placa ou tela | Cada placa ou tela com texto é marcada como placa. O teste lança raios da câmera para 9 pontos (grade 3×3) da área de texto; o primeiro objeto atingido tem de ser a própria placa |
| **R2 · texto cabe** | Nenhum texto desenhado em placa ou tela sai cortado | O desenho de texto passa por uma função que mede a largura. Se não couber, a fonte diminui até um mínimo e então quebra em linhas. O teste confere que nenhum texto registrado passa da caixa dele |
| **R3 · assunto livre** | Entre a câmera da parada (ou do item) e o assunto, nada grande na frente: o controle remoto gigante, as cabeças do público | Raios da câmera para 9 pontos do retângulo do assunto. No máximo 1 dos 9 pode bater em outra coisa antes |
| **R4 · aviso fora do quadro** | Avisos 3D (o contador "Entregas", a placa DOCA 1) ficam acima ou ao lado do quadro que acompanham, nunca na frente | Na tela, o retângulo projetado do aviso não cruza o retângulo projetado do quadro |
| **R5 · sem sobras** | Nenhum texto ou objeto conta algo que a história atual não conta | O inventário (§4.3) é comparado com uma lista de termos proibidos, começando por "radar", "2,0 s" e "TEMPO DE CARREGAMENTO". A lista cresce a cada sobra encontrada |
| **R6 · parada não trava** | Depois de parar, qualquer tecla de direção tira o carro da vaga em até 3 s. Sem girar no lugar, sem prender em colisão, sem volante invertido por causa da câmera. A câmera devolve o controle suavemente | O teste do §4.4: tempo até sair da vaga ≤ 3 s, rotação acumulada ≤ 120° numa saída com W, e o carro fora da vaga ao fim |

A regra R4 trata de avisos que fazem parte da cena 3D. A regra R3 também cobre o painel do quiosque, que não pode tapar o lugar do item que ele explica (como já diz o spec dos itens).

### 4.6 Nota de experiência da parada

Cada parada recebe, além das fotos, uma nota de 0 a 10 em três pontos: **chegar** (dá para achar e parar), **entender** (o lugar mostra o que o painel diz) e **sair** (R6). As paradas mais fracas ficam registradas como entrada para a parte D. A meta desta parte é só "sair" em 10 em todas, e "chegar" e "entender" sem nenhum defeito das regras R1 a R5.

## 5. Consertos já conhecidos

### 5.1 Radar da RedBit

Sai do mundo:

- a faixa no asfalto, o poste, a placa e o outdoor;
- os colisores;
- os avisos "Lento: … s" e "Carregamento 0,5 s · SEO ok";
- a missão "Passe mais rápido pelo radar";
- `S.radar` e `S.radarShown`;
- a função de teste `radar()` e as verificações que dependem dela;
- a menção "o radar de carregamento" no "Sobre".

O item "sites responsivos + SEO" continua sendo contado pela bancada no vidro, como já está.

O quarteirão que tinha o outdoor do radar recebe o que os quarteirões vizinhos da avenida já têm, para não ficar um buraco.

### 5.2 Paradas que travam

A causa é investigada pelo teste do §4.4 antes de qualquer conserto. As hipóteses a confirmar ou descartar são:

- a direção ficar relativa à câmera da parada ou do item, e não ao carro;
- o carro preso entre o colisor da vaga e o de um objeto próximo;
- o piloto da demo e o visitante disputando o volante.

O conserto vem com o teste que falhava antes.

### 5.3 Os prints do Luis

As quatro cenas dos prints entram na leva 1 e precisam passar em R1 a R4 nas três telas:

- placas da Marginal;
- sala de streaming;
- painel AO VIVO da Valiant;
- quadro Jira da Colmeia.

## 6. Desempenho

- O farol custa no máximo uma chamada de desenho a mais.
- Os avisos de tecla e de som são DOM, sem canvas novo.
- As regras R2 (medir texto) rodam só quando o canvas é redesenhado.
- O teste de desempenho existente não pode perder mais de 5% de fps.

## 7. Acessibilidade

- Os avisos de tecla e de som entram na região `aria-live="polite"` que o aviso comum já usa.
- As teclas desenhadas usam `<kbd>`, e os botões continuam com `aria-label` completo.
- O farol e o pulso do botão respeitam `prefers-reduced-motion`: sem giro e sem pulso, só luz parada.
- Botões de toque com no mínimo 44×44 px.

## 8. Entrega

### Leva 1

- As três peças (§3) em todas as missões da tabela do §3.1.
- O radar fora (§5.1).
- O conserto das paradas que travam (§5.2).
- As cenas dos prints (§5.3).
- Os testes de §9 para tudo isso.

### Leva 2

O resto da varredura (§4), até bater a meta de notas nas três telas e passar R1 a R6 em toda parada e cena.

Cada leva termina com:

1. o build;
2. a suíte inteira verde;
3. as fotos com notas.

Depois disso, o Claude pergunta ao Luis se faz o merge na `main`, o push e o deploy na VPS com `scripts/deploy-vps.sh`. O deploy só acontece com o OK dele.

## 9. Testes

Os testes ficam no laboratório (`.superpowers/salto88-lab/e2e`), seguindo o padrão das seções de `kiosk-check.mjs` (ou de `hud-check.mjs` e `scene-check.mjs`, quando a regra já mora lá).

| Seção | Confere |
|-------|---------|
| `som` | O aviso aparece no primeiro Dirigir e não no segundo. O botão pulsa até ser usado ou até 20 s. Com movimento reduzido, não pulsa |
| `objetivo` | Para cada missão do §3.1: o alvo declarado, a seta com o nome e a distância certos, a seta escondida com o alvo na tela a menos de 40 m, o farol apagando a menos de 6 m e só um farol na cena |
| `teclas` | Cada aviso da tabela do §3.2 aparece no momento dele e some ao usar a tecla ou em 8 s. Nenhum aviso cobre o painel. No celular, nenhuma tecla desenhada e todos os botões de toque com pelo menos 44×44 px |
| `cena-regras` | R1 a R4 em toda parada, lugar de item e cena dos prints, nas três telas |
| `conteudo` | R5: o inventário não contém nenhum termo proibido |
| `paradas-saida` | R6 nas 14 paradas, com as quatro formas de saída |
| desempenho | O teste existente, com no máximo 5% de perda |

Os testes que já existem continuam passando:

- as seções de `kiosk-check.mjs`;
- `run.mjs`;
- `stops-end-check.mjs`;
- os unitários (`kiosk-content.test.mjs`);
- no site, typecheck, vitest e build.

Os testes que dependem do radar saem junto com ele.

**Ambiente:** CPU com 1 núcleo em prioridade baixa (`e2e/idle.sh`). Com o OK do Luis, 4 núcleos em prioridade abaixo do normal. Um servidor de teste por vez, e nunca o build com um servidor rodando.

## 10. Fora deste spec

- **B · Projetos e casos:**
  - casos da EVIG contados;
  - o que for mostrável do GitHub (candidatos: `ecosaveAPI-dotnet`, `Streamlit-estoque`, `mk-group` com OK do cliente).
- **C · Primeiro minuto do recrutador:** caminho direto para quem é, nível, entregas e contato, sem depender do 3D.
- **D · Mais diversão:** itens explicados nas outras 13 paradas, eras novas, easter eggs.

## 11. Riscos

| Risco | Efeito | Mitigação |
|-------|--------|-----------|
| A seta e o farol poluem a tela | O jogo fica com cara de tutorial | A seta some quando o alvo está à vista. Há um farol só. As fotos da leva 1 decidem o tamanho |
| Avisos de tecla repetitivos | Irritam quem já sabe jogar | Cada aviso aparece uma vez por visita e some ao usar a tecla |
| R1 e R3 por raio dão falso positivo (vidro, partículas, objetos transparentes) | Teste vermelho sem defeito real | Objetos transparentes ou sem colisão visual são marcados para os raios ignorarem; cada exceção é registrada no teste |
| Tirar o radar quebra testes antigos | Suíte vermelha | Os testes do radar saem no mesmo commit, e a suíte inteira roda antes do commit |
| Varredura grande demais para uma leva | Demora para ir ao ar | Duas levas: a leva 1 vai ao ar antes da varredura completa |
