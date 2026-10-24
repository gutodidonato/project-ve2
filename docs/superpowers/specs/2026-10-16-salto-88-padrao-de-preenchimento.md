# Salto 88 · Padrão de preenchimento das cidades e lugares

Data: 16 out 2026 · Aprovado pelo Luis em 16 out 2026 · Vale para as partes 3 a 7 do roteiro (ver `2026-10-16-salto-88-parte-1-defeitos-design.md`).

Regra geral: nenhum lugar do jogo pode ser vazio ou vago. Nada é implementado antes de estar escrito no nível deste padrão e aprovado.

## 1. Cada quarteirão (inclusive os gerados ao infinito)

- **Lotes com função.** Cada lote tem um tipo (padaria, farmácia, bar, escritório, escola, posto, obra, casa, praça, estacionamento etc.) e uma fachada coerente com ele: letreiro com nome, vitrine, porta e, quando couber, toldo.
- **Calçada.** Meio-fio com altura e algo a cada ~10 m: árvore, banco, lixeira, poste, hidrante, ponto de ônibus, banca, bicicletário ou placa com nome de rua.
- **Gente.** De 4 a 8 pedestres por quarteirão: andando, parados (no ponto, na banca, na vitrine) e atravessando na faixa.
- **Trânsito.** Carros, ônibus, motos e bicicletas andando, além dos estacionados.
- **Noite e clima.** Janelas acesas variadas, vitrines e letreiros iluminados, poças quando chove.
- **Som.** Ambiente de rua conforme o tipo do quarteirão: vozes, passos, ônibus, buzina distante.
- **Variedade.** Pelo menos 8 tipos de quarteirão por cidade, e nunca dois quarteirões vizinhos iguais.

## 2. Ficha obrigatória de cada item do perfil

Fonte única: `content/pt/profile.ts`. Cada item que vira lugar tem uma ficha com:

1. O texto exato do perfil que ele representa.
2. O lugar: o que é, tamanho e posição no mapa.
3. Visto de longe: silhueta e letreiro que se reconhece a 100 m.
4. Visto de perto: detalhes, telas e pessoas.
5. A interação: o que o jogador faz e o que acontece.
6. Todo texto exibido, já escrito.
7. O resultado mostrado, quando houver.
8. O som próprio.
9. O teste E2E e a foto de aprovação.

Regras:
- Nada genérico: um hospital tem cara de hospital e a FIAP tem cara de FIAP.
- Nomes de empresas aparecem em texto, com a cor da marca, sem copiar logotipo.
- Nenhuma afirmação que não esteja no perfil. O que estiver em dúvida vai para a lista de perguntas da ficha e só entra depois de confirmado.

## 3. Medições automáticas por cidade (auditoria `qa.mjs`)

- Superfície lisa na tela abaixo de 35% (na v3.6: de 44% a 56%).
- Pelo menos 4 pedestres por quarteirão visível.
- Pelo menos 1 objeto de calçada a cada 10 m.
- Todo lugar de carreira encontrado e fotografado.
- Textos legíveis a 20 m: pelo menos 14 px de altura numa tela de 1280 × 720.

## 4. Processo de cada cidade

1. Fichas de todos os itens do perfil da era.
2. Planta quarteirão a quarteirão, desenhada, com cada lote definido.
3. O Luis aprova fichas e planta.
4. Implementação.
5. Auditoria e tour de fotos.
6. O Luis aprova as fotos.
