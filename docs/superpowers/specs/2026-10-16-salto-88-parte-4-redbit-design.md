# Salto 88 · Parte 4: RedBit + FIAP

Data: 16 out 2026 · Planta e fichas: artifact `BFgRsZq7jTeF3QMMFnmaMT` ("Planta RedBit + FIAP", v2), fonte desta spec · Padrão: `2026-10-16-salto-88-padrao-de-preenchimento.md` · Sistemas comuns: X1 (gente), X2 (vaga e cartão) e X3 (balões) da parte 3.

## 1. O que a fase conta

MAR 2023: dois anos em que o Luis estudou e trabalhou ao mesmo tempo. Na chegada, a FIAP fica à esquerda e a RedBit à direita. Os temas que o Luis pediu para a RedBit são **Google Ads, SEO, performance e animações em JS**. A cidade em volta é cheia de gente, lojas e trânsito, quarteirão a quarteirão.

## 2. Fontes e decisões por padrão

**Fontes:**
- `content/pt/profile.ts`: o cargo e os dois itens da RedBit; ADS na FIAP; os cases Oceans-20 e vistoria de bicicletas.
- Os vídeos do Luis: sites, FIAP e formatura.
- O pedido do Luis em 16 out: "Google Ads / SEO / performance / Animações em JS".

**Decisões por padrão** (trocáveis):
- Oceans-20 e vistoria entram como "Projetos selecionados", sem afirmar que foram da FIAP.
- A praça da FIAP não afirma o ano da formatura.
- Os nomes de ruas e lojas são trocadilhos de dev.
- D1 a D5 da planta são adotadas.
- Os sons são sintetizados.

## 3. Requisitos

Os textos, tamanhos e interações de cada lugar estão nas fichas da planta.

### Cidade (vale para todas as cidades, partes 4 a 6)

**K1 · Quarteirão de 42 m e calçada de 4 m (D1).**
- `BLOCK` passa de 35 para 42.
- Pista: duas faixas e uma faixa de estacionamento de cada lado, num asfalto de 13 m.
- Calçada de 4 m com meio-fio de 0,15 m.
- Lotes de 2 × 2 dentro de 21 m.
- Faixas de pedestre, tracejado e meio-fio neon se ajustam à nova medida.
- O teste de cidade infinita e os de trânsito são ajustados, mantendo os mesmos objetivos.

**K2 · Carro fica na rua (D2).** O meio-fio é um colisor baixo contínuo. A calçada só se abre nas vagas dos lugares de carreira e nas entradas de estacionamento e posto.

**K3 · Ninguém é atropelado (D3).**
- Pedestres atravessam só na faixa, com o sinal de pedestre verde e o dos carros vermelho.
- O trânsito para antes da faixa.
- Se o DeLorean vai entrar numa faixa com gente, ele freia sozinho e para a 3 m.
- As pessoas na faixa recuam para a calçada mais próxima.

**K4 · Kit de calçada.**
- Itens: lixeira, placa de rua com o nome da planta, hidrante, banco, ponto de ônibus coberto com painel aceso, banca de jornal, bicicletário, árvore com canteiro e semáforo de pedestre.
- Frequências da tabela da planta.
- Feitos de primitivas, instanciados por tipo (uma chamada de desenho por tipo e por era).

**K5 · Dez tipos de quarteirão comum:** comércio, residencial, escritórios, praça, estacionamento, posto 24h, obra, escola, hortifruti e academia.
- Lotes, fachadas e letreiros com os nomes da planta. Letreiros em canvas, acesos à noite.
- Sorteados pela posição, nunca iguais a um vizinho de lado.

**K6 · Pedestres.**
- De 4 a 8 por quarteirão visível, com os 12 personagens civis.
- Comportamentos: andando pela calçada, parados no ponto, na banca e na vitrine, sentados nos bancos e atravessando na faixa.
- Na RedBit, metade tem guarda-chuva (garoa): uma primitiva presa à mão.

**K7 · Trânsito a mais.**
- Ônibus de primitivas com o letreiro "8000 · Terminal Bit", que para nos pontos e embarca pessoas.
- Motos: o motoboy da Marginal.
- Bicicletas de primitivas, na faixa da direita.

**K8 · Luz da noite.**
- De 40 a 70% das janelas acesas, misturando tons quentes e frios. Variação por instância (cor por instância) nos prédios Kenney instanciados.
- Vitrines acesas.
- Poças com reflexo do neon nas esquinas (planos com reflexo falso, sem reflexão em tempo real).

**K9 · Som de rua sintetizado.** Murmúrio de vozes perto de gente (ruído com formantes), passos, ônibus freando e acelerando, buzinas distantes e um ambiente por tipo de quarteirão (conversa de bar, máquina de obra, sinal de escola). Tudo dentro das faixas de volume da parte 1.

### Lugares de carreira (fichas 1 a 10 da planta v2)

**L1 · Campus FIAP:**
- prédio em L de 5 andares com faixas rosa e letreiro "FIAP";
- telão com o vídeo da FIAP;
- 12 alunos e vaga de embarque;
- cartão "FIAP · Análise e Desenvolvimento de Sistemas · 2023 – 2024".

**L2 · Escritório da RedBit:**
- 4 andares, open space visível;
- neon vertical "REDBIT";
- vaga de visitante;
- cartão com o cargo, o período e os dois itens exatos do perfil;
- a missão muda para o radar.

**L3 · Radar de carregamento (performance e SEO):**
- lombada eletrônica de São Paulo no canteiro;
- painel de LED "2,0 s";
- a mais de 60 mph, "0,5 s · SEO ok" e o outdoor com o site carregado de uma vez; devagar, o tempo lento em vermelho e o site carregando aos poucos;
- melhor tempo registrado.

**L4 · Prédio responsivo:** fachada de LED de 16 × 18 m com um site que se rearruma em computador, tablet e celular conforme a distância (mais de 60 m, de 30 a 60 m e menos de 30 m), com a régua de 1280, 768 e 375 px.

**L5 · Rua das Conversões (Google Ads):**
- três pórticos `page_view` → `add_to_cart` → `purchase`;
- contador de conversões;
- tela de eventos na Loja Exemplo;
- placa "Tags, eventos e conversões · Google Tag Manager · Google Ads";
- fora de ordem, "Evento fora do funil".

**L6 · Praça da FIAP e formatura:**
- palco, dois telões (FIAP e formatura), seis estandes e público;
- entrar devagar dispara o aplauso e os capelos (partículas).

**L7 · Ecoponto Oceans-20 (Projetos selecionados):**
- contêineres, resíduos, totem com câmera desenhando caixas de detecção e caminhão de coleta;
- "Modelo: 85,4% de mAP@50";
- "React Native · FastAPI · Firebase".

**L8 · Vistoria de bicicletas (Projetos selecionados):**
- cabine, câmera e tela com caixas "bicicleta", "roda" e "quadro";
- "Vistoria concluída";
- "Java · JPA · React · Oracle SQL · YOLO".

**L9 · Galeria de sites:**
- quatro outdoors com o vídeo dos sites;
- placa "Sites entregues · RedBit".

**L10 · Animações em JS:**
- três fachadas de LED em que a posição do carro na avenida controla o progresso das animações (paralaxe, cartões entrando, ícones em curva com easing);
- a ré desfaz;
- parado na vaga, toca a animação inteira;
- "ANIMAÇÕES EM JAVASCRIPT · o carro é a barra de rolagem".

## 4. Metas medidas

| Meta | Hoje | Alvo |
|---|---|---|
| Superfície lisa na tela, na rua | 44–51% | < 35% |
| Pedestres por quarteirão visível | 0 | ≥ 4 |
| Objetos de calçada a cada 10 m | ≈ 0,3 | ≥ 1 |
| Lugares de carreira encontrados e fotografados | 1 | 10 de 10 |
| Textos legíveis a 20 m | — | ≥ 14 px |
| Tipos de quarteirão diferentes e vizinhos iguais | 4 · sim | 10 · nunca |
| Custo (`qa.mjs gpu`, RedBit) | 452 chamadas · 708 mil triângulos | ≤ 650 chamadas · ≤ 1,1 milhão de triângulos |
| Auditoria de sobreposição | 0 | 0 |

## 5. Fora do escopo

Valiant, Colmeia e EVIG (partes 5 a 7), que reutilizam K1 a K9.
