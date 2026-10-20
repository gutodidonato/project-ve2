# Salto 88 · Curadoria: menos lugares, mais jogo, nada exagerado

Data: 20 out 2026. Origem: o Luis testou a versão 18 e disse que o projeto "ainda parece bem vago ou imperfeito, tem coisa que tá só pra constar, muito projeto, parece que fiz demais". Ele escolheu o **corte forte**: de 3 a 4 lugares por era.

## O que o Luis apontou

**Exagero:**
- O planejamento do JWKS.
- A torre do Google Calendar na Colmeia.
- A Valiant deve ser só streaming.
- "Eu apoiei o e-Saúde, mas não fiz."
- Tem muita coisa exagerada.

**Jogo:**
- Deveria ser mais divertido e menos exagerado.
- Tem chão quebrado.
- As poças de chuva estão ruins.

**EVIG:**
- Vender os projetos estruturados na EVIG em que ele mais participou: a IA de assistente financeiro, o agente de triagem, a migração do GCP para a AWS e o planejamento de teste de carga.
- As naves estão toscas.
- Não dá para pousar nas coisas.

## Regras

1. **Honestidade.** Nenhum texto diz mais do que o Luis fez.
   - Os itens do perfil (`content/pt/profile.ts`) ficam palavra por palavra.
   - "Apoiei" continua "apoiei".
   - "Planejei" continua "planejei".
   - Nenhum lugar sugere autoria do que ele só apoiou.
2. **Cartões curtos.**
   - Os lugares mostram título e uma linha.
   - Os bullets completos do perfil ficam só no cartão do escritório ou da sede de cada era.
3. **Mais jogo.** Cada lugar que fica tem uma interação que dá vontade de fazer, como passar rápido, atravessar na ordem, pousar ou entregar. A explicação vem em uma linha, não em parágrafo.
4. **O que sai vira cenário ou some.**
   - O que é só cenário fica sem cartão, sem vaga e sem missão.
   - O que é exagero sai do jogo.
5. **Visual.**
   - Sem poças em nenhuma cidade.
   - Chão sem buracos, emendas ou partes piscando.

## Lugares por era

| Era | Ficam (com cartão) | Viram cenário | Saem |
|---|---|---|---|
| Exército | EsPCEx (portão e ordem unida), AMAN (portão e espadim), Engenharia (castelo e ponte na brecha), comboio | Pista de obstáculos (fica como jogo, com o placar), pavilhão, telão, estrada bloqueada, campos de instrução, Esquadrilha | — |
| RedBit + FIAP | Escritório RedBit (bullets do perfil), radar de performance/SEO, Rua das Conversões (Google Ads), Animações em JS | Prédio da FIAP (sem cartão próprio; a FIAP fica no cartão da era) | Prédio responsivo, praça da FIAP, ecoponto (Oceans-20), vistoria, galeria |
| Valiant (só streaming) | Escritório ValiantGroup (bullets do perfil), praça dos telões, quarteirão de clientes (Hospital Sírio-Libanês, Housi e Fiesta Americana num lugar só, com as TVs trocando de conteúdo) | — | e-Saúde, chatbot de IA |
| Colmeia | Sede (bullets do perfil), hub de parceiros (integrações, "200 OK"), galpão da Jira (entrega vira "Feito") | Pacote no heliponto (fica genérico, sem marca Google Calendar) | Torre Google Calendar (como lugar e marca), sala de fluxos |
| EVIG | Sede (bullets do perfil, com WhatsApp e RBAC/SSM só como itens do cartão), migração GCP → AWS (argolas e custo até −80%), assistente financeiro com IA, agente de triagem, teste de carga (onda de requisições abaixo da linha do SLA) | — | Cofre/JWKS, ilha do WhatsApp, ilha de agentes genérica (vira o agente de triagem), ilha da pós (a pós fica no showroom) |

## EVIG em detalhe

**Projetos estruturados na EVIG:**
- Os cartões dizem "projeto estruturado na EVIG", sem números nem resultados que o Luis não deu.
- **Assistente financeiro com IA.** Ilha onde perguntas de dinheiro entram e saem respostas com um gráfico simples. A interação: pousar e ver a pergunta virar resposta.
- **Agente de triagem.** Mensagens chegam e o agente separa cada uma na fila certa (rotas coloridas). A interação: passar pelo portal de entrada e ver a mensagem ir para a fila.
- **Migração GCP → AWS.** As 6 argolas e a barra de custo até −80% ficam, porque é o item do perfil.
- **Teste de carga.** A onda de requisições com a latência abaixo da linha do SLA. O cartão diz "planejei capacidade e testes de carga", como no perfil.

**Naves e pouso:**
- As naves de carga ganham um modelo melhor, com casco, motor e luzes, e trajetos suaves.
- Todas as ilhas com lugar têm uma plataforma de pouso clara, com vaga.
- Descer com Q sobre a plataforma pousa a nave de forma estável, sem atravessar a ilha, abre o cartão e permite decolar com E.

## Verificação

- Cada lugar que fica tem um teste.
- Cada lugar removido sai também dos testes, do `qa places` e do tour.
- `qa places` passa a contar:
  - Exército 4 com cartão;
  - RedBit 4;
  - Valiant 3;
  - Colmeia 3;
  - EVIG 5.
- O pouso na EVIG tem um teste: descer em cada plataforma termina parado em cima dela, sem sobreposição, e com o cartão aberto.
- No fim, a suíte inteira, o `qa` completo, o tour e a página de reavaliação com as notas.
