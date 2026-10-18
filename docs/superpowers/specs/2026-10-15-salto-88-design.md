# Salto 88 — Design

Data: 2026-10-15 · Branch: `salto-88` (a partir de `v3`) · Autor: Luis Didonato (com Claude)
Protótipo jogável validado: https://claude.ai/artifact/9Coz7zxBop4m3egyB7JKcU (versão 3)
Substitui a mecânica do hub da spec `2026-10-14-portfolio-v3-design.md` §3.2–3.6. O resto daquela spec (pit stop, i18n, contato, SEO, conteúdo, performance, falhas) continua valendo.

## 1. Por quê

O hub de 5 zonas ficou cru: mapa vazio, carro como cursor, sem interação divertida e com cara de cópia do portfolio do Bruno Simon. O Salto 88 dá uma ideia central que só faz sentido com o Luis e com um DeLorean: **atravessar a carreira no tempo**. Cada era é um mundo; uma rodovia leva à próxima; a 88 mph o carro salta.

Sucesso = quem entra tem um momento "uau" (o salto), cada era tem cara própria e gente/carros circulando, a carreira se entende sem ler, e o recrutador continua achando cargo e contato em segundos (pit stop).

## 2. Decisões fechadas

| Tema | Decisão |
|------|---------|
| Conceito | Máquina do tempo (espinha) + cada era é um mundo denso + rodovia outrun entre eras com salto a 88 mph |
| Eras | Exército → FIAP + RedBit → ValiantGroup → Colmeia → EVIG → showroom final; depois do showroom, loop ao começo |
| Física | Abordagem C: Rapier (veículo com suspensão) nas eras terrestres; carro cinemático na rodovia e nos voos (Colmeia com asas, EVIG como nave) |
| Câmera | Perseguição baixa atrás do carro, olhando à frente conforme a velocidade; zoom (scroll, pinça, botões); órbita cinematográfica quando o carro para; câmera de perseguição com FOV crescente na rodovia |
| Carro | DeLorean real (CC-BY-4.0, dark_igorek), com portas asa-de-gaivota e rodas como nós separados para animar |
| Trânsito | Carros em todas as eras: trânsito nas ruas, estacionados, comboio militar, carros voadores, tráfego na rodovia |
| Telões | Vídeos reais do Luis em loop curto por era; eras sem vídeo mostram painéis gerados |
| HUD | Circuitos do tempo (DESTINO vermelho / PRESENTE verde / ÚLTIMA PARTIDA âmbar), velocímetro em mph, capacitor de fluxo |
| Recrutador | Mantidos: modo demo automático, pit stop (`P`), botão "Ver versão em texto", CV no HUD, link por era |

## 3. As eras

Datas do painel = início de cada era. Fonte: CV de out/2026; Exército informado pelo Luis.

| Era | Data no painel | Cargo no cartão | Mundo | Marco (visto da rua) | Telões | Carros |
|-----|----------------|-----------------|-------|----------------------|--------|--------|
| Exército | FEV 2019 (2019 – jul/2021) | Cadete · EsPCEx / AMAN | Estrada de terra em laço por selva, caatinga e montanha, em três capítulos (EsPCEx 2019, AMAN 2020, Engenharia de combate 2021); campos de instrução sem placa | Portão da EsPCEx, pátio de formatura, Portão Monumental e Conjunto Principal da AMAN, castelo da Engenharia, brecha com ponte, Esquadrilha da Fumaça | Vídeo local da AMAN (telão com arquibancada) | Viaturas verde-oliva estacionadas e um comboio de 7 que segue o DeLorean sob o comando do jogador |
| FIAP + RedBit | MAR 2023 | Estágio front-end · ADS na FIAP | Cidade em grade, avenida principal | Cânion de outdoors com os sites reais dos dois lados; campus FIAP | `fullstack` (sites); FIAP NEXT + formatura | Trânsito e estacionados |
| ValiantGroup | MAR 2025 | Full Stack · apps de streaming | Cidade em grade com praça aberta | Praça dos telões na altura do carro | `mobile` (streaming) | Trânsito e estacionados |
| Colmeia | NOV 2025 | Analista de integração sênior | Torres hexagonais; o DeLorean abre asas e voa entre elas | Monotrilho cruzando a avenida e arcos de tubos | Painéis gerados: log de API | Trânsito no chão, visto de cima |
| EVIG | JAN 2026 | CTO / Tech Lead | Estações em órbita sobre um planeta; o DeLorean vira nave (asas, motores, propulsores) | Argolas de migração e o último portal | Painéis gerados: custo −80%, WhatsApp com agentes | Naves speeder em faixas orbitais |

Cada era tem **paradas** com painel de conteúdo (o antigo ZonePanel): ao parar perto do marco, o painel mostra o conteúdo daquela fase da carreira (cargo, período, bullets do CV). A EVIG termina no **último portal** (o mesmo portal do tempo das outras eras, com mira no centro), que leva direto ao showroom final, sem rodovia; o showroom tem o painel de contato (email, links, CV). O botão de contato do HUD leva direto a ela de qualquer era (viagem rápida).

Comum a todas as eras terrestres: rampa com salto, cones/caixotes que voam, derrapagem com rastro neon da cor da era, colisão com prédios, árvores, cactos, montanhas e carros; postes iluminados; prédios que acendem quando o carro passa.

### 3.1 Bíblia das eras (ambiente = o papel do Luis naquela fase)

Modelos: Kenney (CC0) em estilo low-poly com luz neon. Pacotes: Car Kit, City Kit Commercial/Suburban/Roads, Nature Kit, Racing Kit, Survival Kit, Space Kit. Modelos próprios só onde não existe pronto (torre da AMAN, torres hexagonais da Colmeia, células de plutônio).

| Era | Propósito que o ambiente conta | Hora e clima | Modelos principais | Interação própria | Rádio padrão |
|-----|--------------------------------|--------------|--------------------|-------------------|--------------|
| Exército | Liderança, disciplina, pressão e trabalho em equipe (os quatro valores que o Luis escolheu para essa fase) | Alvorada; chuva na selva, poeira na caatinga, neve na montanha | Árvores e palmeiras, cactos, pinheiros, penhascos, barracas, caixotes, barris, SUV e caminhão em verde-oliva, gente do Kenney Mini Characters (CC0) de farda, edifícios próprios (portão da EsPCEx, pavilhão, Portão Monumental e Conjunto Principal da AMAN, castelo), aviões de primitivas | Vagas pintadas que abrem cartões de capítulo, pátio de formatura com ordem unida, pista de obstáculos com pórticos cronometrados, ponte lançada na brecha, comboio sob o seu comando, abertura de estrada | Rádio Quartel (Battle Theme A, de cynicmusic; provisória) |
| FIAP + RedBit | Fazer sites rápidos e encontráveis (estágio front-end) | Noite neon com garoa | Prédios comerciais com toldos e guarda-sóis, semáforos, postes, outdoors com os sites | Radar de velocidade: o "tempo de carregamento" cai de 2,0 s para 0,5 s quando você passa rápido | 88 FM (synthwave) |
| ValiantGroup | Levar conteúdo a telas (streaming, Android TV) | Noite clara com holofotes | Arranha-céus com telões, parabólicas e antenas, hospital com ambulância, hotel com palmeiras e guarda-sóis | "Ao vivo": entrar na praça sincroniza todos os telões no mesmo canal | Broadcast FM |
| Colmeia | Conectar sistemas de parceiros | Pôr do sol dourado | Torres hexagonais (próprias), tubos em arco, monotrilho cruzando a avenida acima do carro; o DeLorean voa com asas neon na altura das torres | Entrega em voo: pegar um pacote na plataforma Google Calendar e levar à plataforma Jira | Integração FM (bipes e ritmo) |
| EVIG | Arquitetar e liderar (CTO, cloud, IA) | Órbita: estrelas, planeta com atmosfera, lua | Plataformas, hangares, parabólicas, foguetes, cristais, naves speeder; o DeLorean vira nave com motores e propulsores | Migração: cada argola move um serviço da estação GCP para a AWS; o medidor de custo cai até −80%. Depois, o último portal | Cloud FM (pads) |
| Final | Quem é o Luis hoje | Pôr do sol retrowave | Cena original do DeLorean (sol, céu, grid); a câmera orbita o carro como showroom. Entrada pelo último portal da EVIG | Painel final: cargo, contato, CV, "recomeçar a viagem" | — |

### 3.2 Camadas comuns

- **Rádio do DeLorean:** painel fixo no canto inferior esquerdo, estação padrão por era, troca com `R` ou botões. Só áudio, sem player de vídeo: as cinco estações tocam gravações CC0 do OpenGameArt hospedadas junto com o site (88 FM com Midnight Drive e Cloud FM com Ganymede, de congusbongus; Broadcast FM com Space City, de mintodog; Integração FM com Cyber Runner, de ansimuz; Rádio Quartel com Battle Theme A, de cynicmusic, em mp3, escolha provisória do controlador que ainda precisa do OK do Luis). Nada de música gerada no navegador: a marcha e os geradores antigos saíram. Cada estação tem o próprio ganho, calibrado pelo volume da faixa inteira (não de um trecho): medido no canal de música, cada faixa fica a até 1 dB de −22 dB, a mais alta e a mais baixa a no máximo 2 dB uma da outra e o pico abaixo de −1 dBFS, então trocar de estação não muda o volume, nem trocando depressa. Nenhuma requisição sai para YouTube ou Spotify; os créditos das faixas, com o de Battle Theme A, ficam na gaveta (`i`).
- **Som:** tudo mudo até o visitante ligar (`M`, botão Som ou o rádio); antes disso a saída é silêncio absoluto. A mixagem é medida por analisadores ligados aos canais do jogo (efeitos, ambiente, música) e nada passa de −1 dBFS.
  - *Motor:* corpo de V6 com marchas audíveis. Um dente de serra na frequência de disparo, uma senoide uma oitava abaixo (o ronco que faz o motor "cavalgar") e um segundo dente de serra 12 cents acima são somados, achatados por um formatador suave e passados por um filtro passa-baixa que abre com a rotação; o ganho sobe com a velocidade e o acelerador, e a frequência cai a cada troca de marcha. Acelerando de 0 a 60 mph no Exército, o canal de efeitos fica entre −24 e −20 dB, com frequência média entre 120 e 700 Hz e pelo menos duas quedas de marcha; com o rádio a 40 mph na cidade, a música fica no máximo 3 dB abaixo do motor.
  - *Buzina e pneus:* a buzina do jogador fica no máximo 6 dB acima de dirigir na cidade; pneu cantando na derrapagem; batidas com som por material (parede, carro, cone, madeira) e volume pela força.
  - *Ambiente por região:* no Exército há brisa baixa em toda a base e em todas as regiões, pássaros na selva e na base e vento seco na caatinga e na montanha; o canal de ambiente nunca fica abaixo de −45 dB, em nenhuma das quatro regiões. A chuva da selva e a garoa da RedBit são baixas e escuras (frequência média abaixo de 3 kHz; a chuva da selva caiu mais de 6 dB). As cidades têm zumbido de rua e buzinas distantes, o espaço tem drone, e voo tem motores de asa e de nave.
  - *Clímax das 88 mph:* a subida até as 88 mph fica pelo menos 6 dB acima de dirigir na cidade (medido nos 3 segundos antes do salto). O chiado do capacitor de fluxo sobe com a velocidade (quase o dobro de volume que antes) e o motor ganha mais um pouco acima de 70 mph, e a subida passa de 6 dB sobre a cidade; com o salto, motor e vento se calam para não ficarem por baixo do estrondo. O salto e o estrondo mantêm o nível: os arquivos já chegam perto de −1 dBFS e o canal de efeitos não tem limitador.
  - Efeitos gravados: Kenney (CC0); o resto sintetizado.
- **Buzina e motoristas:** `H` (e botão na tela) buzina; os motoristas mais próximos buzinam de volta, piscam o farol e respondem com um balão de fala com humor da era (Exército: "Sentido!"; cidades: "Liga a seta, campeão!"; Marginal: "Trânsito pior que deploy de sexta"; motoboy: "Ô, tio! Abre aí!"; Colmeia: "Cadê o webhook?"; EVIG: "Quem aprovou esse deploy?"). Batidas também geram resposta. Sem gestos obscenos: o público inclui recrutadores.
- **Células de plutônio:** 5 por era (25 no total), algumas fora da rota. Contador no HUD. Juntar as 5 de uma era mostra um aviso; juntar as 25 libera a pintura neon do DeLorean.
- **Modo foto:** tecla `F` ou botão. Pausa a simulação, câmera livre, filtros (normal, VHS, neon, preto e branco) e captura. No site, salvar e compartilhar com o link do portfolio.
- **Tela cheia:** a experiência ocupa a tela inteira; o texto de apoio fica numa gaveta (`i`).
- **Voo (Colmeia e EVIG):** `E` ou `Espaço` sobe, `Q` ou `Shift` desce, com inércia, piso e teto por era; altímetro no painel; botões ▲▼ na tela no celular. Os obstáculos de voo dependem da altura: monotrilho (passa por baixo ou por cima), torres (bloqueiam baixo, sobrevoáveis), plataformas de entrega em alturas diferentes, argolas em alturas diferentes e portal que exige mira.
- **Colisões:** cada objeto colide com o formato da própria base (tronco, poste, parede, prédio girado), com altura; o DeLorean e os veículos são dois círculos ao longo do comprimento, com massa e giro. Paredes deixam deslizar e devolvem um pouco; batidas fora do centro fazem girar; massa conta (cone quase não freia, caminhão segura o carro); carros estacionados e do trânsito são empurrados e batem em outros; no voo dá para pousar em telhados e plataformas. Tecla `C` mostra os colisores (verde fixos, rosa móveis).
- **Trânsito:** cada carro mantém distância do da frente, espera atrás do DeLorean parado, quem vem pela rua leste-oeste cede no cruzamento, e cones na pista são empurrados em vez de travar a fila. Depois de uma batida o carro vira corpo livre e, parado, volta ao trânsito longe da câmera.
- **Cidades infinitas, bloco a bloco:** ruas a cada 35 m nos dois sentidos. Cada rua tem duas faixas, faixa de estacionamento e calçada até a fachada; o meio-fio neon, o tracejado e as faixas de pedestre param em cada cruzamento, e o trânsito espera antes da faixa. Cada quarteirão é montado a partir das suas coordenadas, sempre igual: quatro lotes com prédios do tamanho do lote, ou uma torre, ou uma praça com chafariz, ou um estacionamento com vagas pintadas; poste no meio de cada calçada, semáforo na esquina, carros na faixa de estacionamento longe dos postes. Os quarteirões entram em volta do carro e saem atrás dele, e o trânsito vem junto, então dá para dirigir para qualquer lado sem achar o fim. Os marcos de cada era ficam nos quarteirões do distrito (campus FIAP, praça dos telões, hospital, hotel, monotrilho). Telões ficam em lote próprio, sobre dois pés, nunca em cima da pista; a rampa de salto fica no canteiro central, estreita o bastante para o trânsito passar dos dois lados. Uma seta no topo aponta a rodovia (ou o portal) com a distância.
- **Nada dentro de nada:** uma auditoria compara todos os colisores fixos (SAT para caixas, círculos, faixa de altura) e os carros e objetos parados; peças feitas para se tocar (serras de montanha, detritos no espaço, telão e seus pés, monotrilho) têm a mesma etiqueta. O teste E2E exige zero sobreposições em todas as eras e em quarteirões a 600 m da origem. A auditoria também cobre o trânsito e o comboio em movimento: nenhum carro atravessa poste, plataforma ou pé de telão.
- **Câmera:** nunca fica dentro de prédio, torre, árvore ou carro, nem atrás de um tronco: ela desliza na direção do DeLorean até ver o carro livre, em todas as eras. Rótulos flutuantes somem quando a câmera passa perto, e cada rótulo tem a largura do próprio texto.
- **Rodovia:** os pórticos têm os pés atrás da mureta, fora do alcance do carro e do trânsito; não há arco com base dentro das faixas.
- **Tour visual (E2E):** um script percorre as eras, o portal do tempo de cada era a 140 m e a 40 m (e no celular), a rodovia, a Marginal, o DeLorean de todos os lados, o showroom e o celular e grava as fotos com uma página de contato, para revisar tudo a cada mudança.
- **Memória:** ao sair de uma era, as geometrias, materiais e texturas próprias dela são liberadas da placa de vídeo; dar várias voltas (o modo demo recomeça sozinho no showroom) não acumula nada. O showroom é carregado em segundo plano logo após a abertura. Um carro do trânsito nunca avança para dentro de outro, mesmo se as regras de cruzamento falharem.
- **Pista do Exército:** largada, slalom de cones (+1 s por cone), lama (limita a velocidade), rampa sobre a brecha, chegada com tempo e melhor tempo; ao lado, arquibancada com 9 cadetes, placar do último e do melhor tempo, um pelotão de 8 correndo e o instrutor com balões ("Mais rápido, cadete!" e "Excelente!").
  - *Brecha:* um buraco de verdade recortado no chão, 9 × 6 m e 2 m de fundo (em x −45, z −45), com paredes de terra, água no fundo e visto em profundidade de qualquer lado. A rampa passa por cima e continua sendo um jeito de saltar. Na vaga do pontoneiro uma equipe de 6 corre e lança a ponte (5 m de largura) em 4 s; o carro atravessa por ela, reto, da vaga. Sem ponte e sem salto o carro cai: desce até o fundo e sai pela borda da frente, acelerando; cair custa +3 s, e o limite de velocidade e a contagem seguem iguais.
  - *Regiões:* selva (chuva), caatinga (poeira) e montanha (neve) existem só no mapa, onde mudam o clima e o som. Não há rótulo no céu nem aviso ao entrar.
  - *Serra:* a neve não disputa mais o pixel com a superfície da montanha (o cone de neve usa polygon offset), sem listras de perto nem a 200 m, e os penhascos têm cor de pedra.

### 3.3 Exército, como construído (parte 3)

Três capítulos ao longo da estrada que vai da chegada, em (0, 66), ao portal, em (0, −78). Cada lugar mostra pelo menos um dos quatro valores (liderança, disciplina, pressão, trabalho em equipe). As fontes são públicas e do Luis: os cartões não afirmam nada pessoal além de "2019 · EsPCEx, Campinas", "2020 · AMAN, Resende" e "2021 · Engenharia de combate".

- **Sistemas comuns.**
  - *Gente (X1):* os 12 personagens do Kenney Mini Characters (CC0), com a textura embutida, animam `idle`, `walk`, `sprint`, `sit`, `interact-right`, `emote-yes` e `holding-both`. `spawnPerson({ kind, outfit, x, z, h, anim })` aceita `outfit` `'civil'` ou `'farda'` (variante verde-oliva com cobertura). Uma pessoa é um corpo e uma cabeça fundidos numa geometria só (uma chamada de desenho). Só animam as pessoas a até 60 m do carro (as sentadas, a até 60 m também); além de 90 m ficam ocultas. Ninguém é corpo físico: o carro não atinge ninguém. São 121 pessoas na fase, 31 delas no pátio da EsPCEx.
  - *Vaga e cartão (X2):* `addStop` pinta no chão uma vaga na cor da era; parar nela (abaixo de 1,5 por 0,5 s) aproxima a câmera, abre um cartão (título, período, texto e os valores em etiquetas) e dispara a cena do lugar; sair da vaga fecha o cartão. O cartão não cobre o velocímetro nem o rádio nas três telas. Os cartões de capítulo abertos ao passar por uma linha (portão da EsPCEx, Portão Monumental, castelo) passam por uma fila única da era: esperam o jogador estar dirigindo e o aviso de chegada sumir, cada um fica ao menos 4 s na tela, e quem espera uma vaga aguarda (e envelhece até 25 s) em vez de se perder; trocar de era esvazia a fila. Apertar Start recomeça a era 0 na chegada, a 6 m/s, para todo jogador ver o portão, a corneta e o primeiro cartão.
  - *Balões de comando (X3):* os balões de fala ganham o estilo "comando" (maiúsculas, fundo verde-oliva), usado pelo instrutor e pelas vozes de ordem unida.
- **Capítulo 1 · EsPCEx (2019).** *Portão* a 6 m da chegada (z 60): arco com "ESCOLA PREPARATÓRIA DE CADETES DO EXÉRCITO", guarita, cancela, sentinela e bandeira; ao passar, a sentinela faz continência, toca a alvorada uma vez e abre o cartão do capítulo. *Pátio de formatura* (30 × 24 m em (−20, 40), meio-fio baixo, mastro com bandeira, palanque): pelotão de 30 em três fileiras e instrutor; na vaga (−2,5, 40) a ordem unida executa "Sentido!", "Direita, volver!" e "Ordinário, marche!" (os 30 giram juntos, com diferença menor que 0,3 s) e o desfile dá uma volta no pátio com a caixa marcando o passo; sair no meio devolve a tropa à forma em até 3 s. *Pavilhão de aulas e alojamento* em (31, 44): salas acesas com alunos e beliches visíveis; na vaga (2,5, 44) o quadro "Rotina do aluno" risca os 5 itens, toca o toque de silêncio e as luzes se apagam.
- **Capítulo 2 · AMAN (2020).** *Placa "Resende · AMAN 2020"* em (7,7, 31,6) e *Portão Monumental* em z 18,5 (colunas brancas e frontão "ACADEMIA MILITAR DAS AGULHAS NEGRAS"): ao passar, dois cadetes fazem continência, toca um toque curto de corneta e abre o cartão do capítulo 2. *Conjunto Principal* em (25, −2): prédio de três andares com torre central e arcadas e uma companhia de cadetes em forma; na vaga (2,5, 9) a saudação com o espadim é feita em uníssono. *Telão da AMAN* em (14,5, −10), com arquibancada de 12 cadetes assistindo; a vaga (2,5, −2) toca o vídeo local. *Pista de obstáculos (TFM)* como acima.
- **Capítulo 3 · Engenharia de combate (2021).** *Castelo da Engenharia* em (−8,5, 0,8): monumento de 6 m, placa "ENGENHARIA" e pátio de máquinas (trator, caminhão de ponte, mesa de campanha com 3 engenheiros); ao passar, abre o cartão com o patrono (Ten Cel Villagran Cabrita). *Brecha com ponte* como acima. *Comboio sob o seu comando:* 7 viaturas esperam em coluna na área de reunião da estrada leste (x 52, de z 20 a −30, de frente para +z, a da frente ao lado da vaga); na vaga "assumir o comando", em (41, 25), elas passam a seguir o DeLorean na hora, para onde o jogador for (a coluna sai quando o carro está a 10 m ou mais da vaga), pela trilha real dele (migalhas a cada 2 m), a 8 m uma da outra e sem bater, até a ponte; a missão ("Comboio sob o seu comando: siga até a ponte", com a contagem das que atravessaram) fecha quando as 7 atravessam ("7 de 7"); sem ponte as viaturas param a 10 m da brecha; se o comboio fica 90 s parado, volta sozinho para a área de reunião. *Abertura de estrada:* na estrada norte (z −55, x 5 a 20) troncos e pedras bloqueiam metade da pista; a menos de 25 m o trator, de lâmina de 5,8 m, empurra o bloqueio para fora em cerca de 2 s ("Estrada liberada"), e espera se o carro vem rápido ou está na frente da lâmina.
- **Campos de instrução, sem placa.** Selva: acampamento de 9 barracas em volta de uma fogueira, com redes, e uma patrulha de 8 em fila indiana, a 2 m uma da outra, num laço na mata a oeste. Caatinga: posto de observação num morrote de 1,5 m, com o observador girando o binóculo, duas viaturas camufladas e três pessoas em volta de uma carta. Montanha: paredão de rapel de 10 × 12 m com um rapelista que desce e sobe e a equipe embaixo.
- **Esquadrilha da Fumaça.** Quatro aviões monomotores de hélice e asa baixa, de primitivas (cerca de 9 m, fuselagem de cilindro afilado, asas e empenagem de caixas finas, hélice de 3 pás que gira e pintura azul com faixas vermelho e branco feita num canvas; um corpo e uma hélice por avião), voam em losango com fumaça (uma malha instanciada) a 42 m de altura, num círculo que passa sobre o pátio. Quando o desfile começa, a formação se ajusta para cruzar o pátio de 4,5 a 9 s depois, desce a 13 m para a passagem e volta à altura de órbita.
- **Chão.** Grama, estrada de terra, areia da caatinga e piso da selva têm textura procedural (manchas e pontinhos que se repetem sem emenda): a superfície lisa na tela na chegada caiu de 58% para 25%.
- **Som (sintetizado, sem download, atrás do botão de som e dentro das faixas da parte 1).** Corneta (alvorada, silêncio e toque curto: dente de serra filtrada, vibrato e ataque lento), passos de tropa (cliques de ruído filtrado em sincronia com a animação), caixa de marcha, motor a hélice da Esquadrilha (dente de serra de 90 a 140 Hz com efeito Doppler pela distância; sobe os efeitos 4 dB ou mais na passagem), hidráulico da ponte e esteira do trator.
- **Metas medidas (`qa.mjs`, seções `life`, `places`, `gpu` e `sound`, em `e2e/qa/report.json`).** Superfície lisa na chegada: 25% (meta: menos de 35%). Pessoas: 121 (meta: 60 ou mais), 31 no pátio (meta: 30 ou mais). Lugares da fase achados pelo nome do objeto e fotografados: 13 de 13. Custo do Exército: 402 chamadas de desenho (+71 sobre as 331 de antes, meta: até +150) e 0,8 ms de simulação por quadro (+0,1 ms sobre 0,68 ms, meta: até +2 ms). Som nas faixas. Todos os testes anteriores passam, mais um teste por lugar com interação.

## 4. Rodovia e salto

- **Portal do tempo (saída de cada era).** Um único construtor, `addTimePortal`, serve às cinco eras; o grupo se chama `portal-do-tempo`. Detalhes em `2026-10-16-salto-88-parte-2-portal-design.md`; como ficou:
  - *Forma:* anel vertical metálico de 6,6 m de raio (12 pinos de luz, gira devagar) com o vórtice animado dentro, nas cores da era de destino, e brilho aditivo de 26 m atrás. Nas eras de chão o centro do anel fica a 6,6 m (o carro passa pelo arco de baixo); na EVIG, a 8,4 m. Dois pés de 0,6 m seguram o anel, e dois muros invisíveis de 0,3 m (de 7,2 a 13 m do centro, um de cada lado) impedem contornar o portal pela estrada. No Exército o muro leste não existe, porque a montanha já fecha aquele lado.
  - *Visível de longe:* coluna de luz de 120 m (cilindro aditivo, sem neblina, pulsando), círculo de luz de 16 m no chão, 140 faíscas em espiral para o vórtice e um raio que salta entre dois pontos do anel a cada 1,5 a 3 s. A 140 m, em 1280 × 720, o conjunto passa de 120 px de altura e o anel se destaca do entorno em pelo menos 40 pontos de luminância, nas cinco eras.
  - *Diz para onde leva:* rótulo acima do anel com a data e o nome do destino (ex.: "MAR 2023 · FIAP + REDBIT") e "chegue a 88 mph na rodovia"; no último portal, "OUT 2026 · HOJE" e "o último salto". O rótulo some entre 35 e 25 m. A pílula de guia do HUD diz "PORTAL · NN m" e se esconde sob 40 m ou enquanto o rótulo estaria por cima dela.
  - *Passagem:* só dispara quando o centro do carro cruza o plano do portal de frente (de ré não vale) dentro do círculo do anel; abaixo do centro, o vão inteiro entre os pés vale, então o arco de baixo é passável. Na Colmeia a altura também conta (a 18 m de altura o carro passa por cima sem disparar). Clarão branco de 0,15 s, túnel de 0,8 s (campo de visão de 58° a 95°, riscos de luz e vórtice na cor do destino, o carro segue reto sem as mãos no volante), depois a rodovia de 3 faixas com sol listrado da cor da próxima era.
  - *EVIG:* o mesmo portal com a regra de mira (`aim`): o círculo vale também abaixo do centro, não há pés nem muros, e passar fora do círculo mostra "Mire no centro do portal". A passagem termina direto no showroom, sem rodovia. As 6 argolas de migração são âmbar (`0xffb347`) para não se confundirem com o portal.
  - *Som:* zumbido grave (55, 82,5 e 110 Hz com tremolo lento) no canal de ambiente, que cresce com a proximidade (parado a 20 m fica cerca de 8 dB acima de parado a 120 m); na passagem, o efeito `portal` somado a um whoosh de ruído filtrado.
- Segurando acelerar, de ~30 a 88 mph em **6–8 s**. Tráfego nas 3 faixas para desviar; batida derruba a velocidade para ~60%.
- Expectativa crescente: FOV abre, riscos de velocidade nas laterais, tremor a partir de 72 mph, faíscas azuis em volta do carro, capacitor pulsando cada vez mais rápido.
- A 88 mph: rastro de fogo duplo, explosão de faíscas, o carro some, flash branco; durante o flash a próxima era já foi carregada e aparece com o carro entrando nela. ÚLTIMA PARTIDA recebe a data da era deixada.
- No modo demo a rodovia é dirigida sozinha, desviando do tráfego.
- **"VOCÊ CAIU EM SÃO PAULO :)"**: a rodovia que sai da FIAP + RedBit vira a Marginal Tietê no horário de pico. Aviso grande na tela, placa da Marginal e painel da CET, prédios de São Paulo nas laterais, neblina de poluição, trânsito parado em ondas de anda-e-para nas 3 faixas, motoboys no corredor entre as faixas e buzinas (com o som ligado). Dentro do engarrafamento ninguém passa de ~40 mph, nem achando um vão. É preciso costurar até o fim do trecho (cerca de 320 m) para voltar a buscar as 88 mph; o contador mostra o tempo preso no trânsito.
- Batidas na rodovia: de traseira passam velocidade para o carro da frente (que é empurrado e pode rodar); de lado empurram os dois para os lados.
- Direção na rodovia: o volante pede velocidade lateral e os pneus chegam lá com inércia; o carro aponta para onde está indo e a carroceria rola; mureta segura, solta faísca e rouba velocidade; aceleração segue uma curva de torque (forte embaixo, fraca perto do topo); vácuo atrás de um carro na mesma faixa dá velocidade extra. Perto das 88 mph raios correm pela lataria; no salto, onda de choque; na chegada, fumaça fria e a câmera entra em curva.
- Animações dos veículos: rodas giram pela velocidade e as dianteiras esterçam (só as quatro rodas do rig giram, no próprio eixo; o estepe do SUV é parte da carroceria e fica parado); a carroceria inclina nas curvas, levanta o nariz ao acelerar, mergulha ao frear e vibra na terra; batida forte dá um tranco que a mola assenta. O DeLorean tem as próprias rodas (do modelo original) e no voo elas dobram na horizontal como em De Volta para o Futuro II. Comboio do Exército faz curvas arredondadas e levanta poeira. Motoboy com moto e piloto modelados, inclina ao costurar e cai quando bate.

## 5. Arquitetura técnica

Mantém do F1: `GameMount` / pit stop / `inert` + botão de versão em texto, store zustand, fila de input, i18n, HUD com loop rAF por refs, minimapa (vira mapa da era), `useHashSync` (hash = era: `#exercito`, `#redbit`, `#valiant`, `#colmeia`, `#evig`).

Novo:

```
lib/salto/                       lógica pura, testada (sem three)
  eras.ts                        dados das 5 eras (datas, cores, rotas demo, paradas, portão)
  timeCircuits.ts                formatação DESTINO/PRESENTE/ÚLTIMA PARTIDA
  journey.ts                     máquina de estados: era(demo|manual|parado) → rodovia → salto → era seguinte
  autopilot.ts                   rota de waypoints com paradas (dwell) e chegada estacionando
  traffic.ts                     faixas, sentido, parar atrás do jogador, batida (pura, por tick)
  highway.ts                     velocidade, faixas, tráfego relativo, gatilho 88, timeline do salto
components/salto/
  SaltoCanvas.tsx                Canvas persistente; Physics (Rapier) só nas eras terrestres
  EraDirector.tsx                carrega a era atual com dynamic import; pré-carrega a próxima na rodovia
  eras/Exercito.tsx · RedBit.tsx · Valiant.tsx · Colmeia.tsx · Evig.tsx
  DeLorean.tsx                   GLB com portas/rodas animadas; fallback primitivo
  Vehicle.tsx · Traffic.tsx      carros low-poly instanciados
  Screen.tsx                     telão com VideoTexture (loop) ou CanvasTexture gerada; pôster no tier B
  Highway.tsx · JumpFx.tsx       rodovia, tráfego, riscos, fogo, faíscas, flash
  ChaseCamera.tsx                perseguição, órbita parada, zoom, anti-oclusão (raycast simples)
  TimeCircuits.tsx               HUD DOM
```

Regras herdadas: `useFrame` nunca chama setState; three só atrás de `next/dynamic`; nada de `window.innerWidth` no render; storage só via `lib/storage.ts`; nenhum fetch de terceiros em runtime.

Física: `@react-three/rapier`. O DeLorean nas eras terrestres é um corpo dinâmico com controlador de veículo por raycast (suspensão, aderência, derrapagem com freio de mão). Cones, caixotes e carros estacionados são corpos dinâmicos que dormem até serem atingidos. O trânsito em movimento é cinemático (segue faixas) e vira dinâmico por 2–3 s quando atingido. Na rodovia e na EVIG o Rapier fica desligado.

## 6. Assets

- **DeLorean:** o pipeline (`scripts/optimize-assets.mjs`) passa a manter portas e rodas como nós separados (sem `join` nesses nós), nomeados `door_l`, `door_r`, `wheel_fl/fr/rl/rr`. Se o modelo-fonte não tiver as portas separadas, as portas ficam fechadas e a animação é removida. Isso deve ser conferido no primeiro passo do plano. Orçamento ≤ 1,8 MB.
- **Carros e cenário:** pacotes Kenney (CC0) listados em §3.1, reunidos em bibliotecas GLB por categoria (veículos, cidade, natureza, props, espaço) com nós nomeados por modelo; objetos repetidos viram `InstancedMesh`. Crédito à Kenney na tela de créditos.
- **Showroom final:** a cena original completa do DeLorean (com sol, céu e grid), otimizada para ~5 MB e carregada só no final.
- **Vídeos:** loops de 10–15 s em 640×360 (H.264 MP4 + WebM), ~400–800 KB cada, gerados por `scripts/encode-videos.mjs` (ffmpeg via `ffmpeg-static`, dev dependency) a partir dos originais da tag `v2-legacy`. Cada loop tem um pôster JPEG. Carregam só quando a era está ativa e o telão entra no quadro; pausam fora de vista. Tier B e `prefers-reduced-motion` usam só o pôster.
- **Vídeo da AMAN:** institucional do Exército. Trechos curtos com crédito ("vídeo: AMAN / Exército Brasileiro") até o Luis trocar por material próprio.

## 7. Conteúdo

- `content/{pt,en}/profile.ts` ganha a experiência **Exército Brasileiro — Cadete (EsPCEx / AMAN), 2019-02 a 2021-07**, com bullets a revisar pelo Luis (aprovado em concurso; formação em liderança, disciplina e trabalho sob pressão).
- RedBit passa a **Estágio em desenvolvimento front-end** (o CV em PDF continua como está).
- O pit stop mostra as duas mudanças. O JSON-LD continua com o cargo atual (EVIG).

## 8. Performance

- JS inicial sem three: continua < 180 KB gzip. Cada era é um chunk carregado sob demanda.
- Por era: ≤ 3 MB de assets (vídeos incluídos), carregados ao entrar na rodovia que leva a ela.
- 60 fps desktop médio, 30+ fps celular intermediário. Tier B: metade do trânsito, sem sombras, sem pós-processamento, telões com pôster, DPR 1.
- Draw calls: carros, postes, árvores e prédios instanciados; meta < 300 draw calls por era.

## 9. Celular

HUD mínimo: circuitos do tempo compactos (só DESTINO e PRESENTE), velocímetro pequeno. Controle por arrasto (joystick virtual) com botões de acelerar e frear na rodovia. Botão "Próxima" continua (pula para a próxima parada ou acelera a rodovia no automático).

**Celular deitado.** Telas com até 500 px de altura usam um layout compacto, em duas faixas: no alto ficam o relógio do tempo (enxuto, uma linha), a seta de guia e os botões; embaixo ficam o rádio, a missão (menor, entre o rádio e o velocímetro) e o velocímetro. O título da era desce e diminui. Em paisagem estreita, de até 800 px de largura, a guia cai para baixo dos botões, porque não cabe entre o relógio e eles, e a missão ocupa o vão entre o rádio e o velocímetro; a partir de 801 px a guia continua centralizada (de 801 a 811 px nenhuma tela é medida: a folga calculada entre a guia e o relógio é de 3,5 a 8,5 px). A missão começa depois do rádio mesmo com ele ligado (o botão "Desligar" deixa o rádio 13 px mais largo). O cartão final do showroom não cobre o rádio nem o velocímetro. Meta: zero sobreposições entre elementos visíveis do HUD, medidas na chegada e dirigindo em cada era, na Marginal e no showroom. A suíte E2E mede seis telas (1280 × 720, 375 × 812, 812 × 375, 800 × 360, 780 × 360 e 667 × 375), mais a tela inicial, o giro de em pé para deitado e a chegada do Exército e da Colmeia com o rádio ligado; a auditoria de qualidade (`qa.mjs`) mede só as três telas da spec da parte 1 (1280 × 720, 375 × 812 e 812 × 375).

## 10. Testes

- **Vitest:** `journey` (transições era → rodovia → salto → era seguinte e loop), `autopilot` (rota completa com paradas, sem atravessar colisores declarados), `traffic` (para atrás do jogador, batida, reaparece), `highway` (aceleração 30→88 em 6–8 s, batida derruba para ~60%, gatilho exato em 88), `timeCircuits` (datas e ÚLTIMA PARTIDA), `eras` (5 eras, datas do §3, hashes únicos).
- **Playwright:** o modo demo atravessa as 5 eras e volta ao começo; os circuitos do tempo mudam a cada salto; cada era mostra pelo menos um telão no quadro (`snapshot` expõe os telões visíveis); colisão com carro reduz a velocidade; pit stop, versão em texto e contato continuam funcionando; nenhuma requisição a outra origem; rádio toca só áudio local; auditoria sem objeto dentro de objeto em todas as eras e longe da origem; celular sem rolagem lateral.
- **Playwright por obstáculo (ponta a ponta, teclado real, simulação em passos fixos):** a pista completa no piloto automático sem penalidade; reto pelo slalom penaliza; lama limita; vala penaliza; rampa lança e aterrissa; cones e trânsito derrubados; parede não deixa atravessar; radar lento e rápido; praça ao vivo liga e desliga; voo sobe, desce, piso e teto; pacote só na altura certa; monotrilho bloqueia, libera por baixo e por cima; trem derruba; torre bloqueia baixo e libera alto; entrega com SLA; argola fora da altura conta erro; 6 argolas migram 6 serviços; as argolas da EVIG são âmbar; portal do tempo: pelo centro leva à rodovia em até 1,2 s com túnel (campo de visão acima de 85°), pela beira e de ré não dispara, na Colmeia só na altura do anel, na EVIG exige mira e leva ao showroom; o zumbido do portal cresce com a proximidade; rodovia chega a 88 e salta; batida na rodovia; 25 células alcançáveis; modo foto, rádio, gaveta; altímetro e botões só no voo; demo completa sem penalidade; HUD sem sobreposição no celular. O protótipo v3.1 passa 30/30.
- **Parte 1 (defeitos medidos):** a suíte E2E do protótipo tem 79 testes (os 67 anteriores mais 12: rodas no próprio eixo, neve e penhasco, vala com fundo e queda, regiões sem placa, mixagem da buzina e da garoa, motor encorpado com marchas, clímax das 88 mph, Exército nunca mudo, volume igual das cinco faixas, Rádio Quartel e HUD sem sobreposição em seis telas). Os níveis de som saem de analisadores ligados aos canais do jogo, em dBFS. A auditoria de qualidade (`e2e/qa.mjs`) mede as metas R1, R6–R10, R12 e R13 da spec da parte 1, imprime cada uma como OK ou FALHOU com o valor medido e sai com código 1 se alguma falhar.
- **Parte 3 (Exército, como construído):** a suíte E2E do protótipo tem 141 testes, 52 deles do Exército (`exército: ...`): pessoas, vaga e cartão, portão e corneta, pátio e ordem unida (sincronia, som, sair no meio), pavilhão, AMAN (portão, saudação do espadim), telão e pista com placar, castelo, brecha e ponte (lançamento, travessia reta, queda, som), comboio sob o comando (coluna, segue para onde o jogador for, espera a ponte, volta sozinho, fora da rota), abertura de estrada (inclusive o trator esperando o carro na lâmina), campos de instrução, Esquadrilha (aviões de primitivas, hélice, passagem baixa, som com +4 dB na passagem), fila de cartões de capítulo (segura numa vaga, expira em 25 s, some na troca de era) e chão com textura. A auditoria `qa.mjs` ganhou a seção `places` (13 de 13 lugares achados pelo nome do objeto e fotografados), as metas da parte 3 em `life` (superfície lisa, pessoas, pátio) e em `gpu` (custo), e o tour fotografa a fase em 12 cenas.
- **Orçamento:** `check:bundle` continua; novo teste do peso por era.

## 11. Fases

| Fase | Escopo | Entrega |
|------|--------|---------|
| S1 | `lib/salto/*`, rodovia + salto + circuitos do tempo + câmera, DeLorean com portas e rodas, era Exército completa (física Rapier, comboio, telão AMAN) | Exército → rodovia → salto jogável |
| S2 | Eras FIAP+RedBit, ValiantGroup e Colmeia (cidades, trânsito, telões com vídeo, paradas com conteúdo) | 4 eras jogáveis |
| S3 | Voo com asas na Colmeia, EVIG em órbita (nave, argolas, naves speeder, painéis gerados), último portal, showroom final com contato e loop | Ciclo completo |
| S4 | Pipeline de vídeos, tier B, celular, polimento de câmera (anti-oclusão), perf | Pronto para produção |

O sub-projeto de cases e mini-games (antigo F3) vem depois do S4, com spec própria.

## 12. Pendências com o Luis

- Texto da experiência do Exército (bullets) e confirmação do mês de entrada (o painel usa FEV 2019).
- Vídeo próprio do Exército, se existir, no lugar do institucional da AMAN.
- Merge da PR #1 (v3) antes ou depois do Salto 88: a branch `salto-88` parte da `v3`.
