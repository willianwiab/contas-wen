# 🏭 Fábrica de Emojis

Jogo de clicker com física de verdade: os emojis caem dentro da caixa, quicam,
empilham e você vende a pilha inteira. Um arquivo só (`index.html`), sem
instalação, funciona offline no celular e no computador.

## Onde ele aparece

- Direto: `https://willianwiab.github.io/contas-wen/fabrica-de-emojis/`
- No portfólio **Jogos do JoJo**: aparece na página inicial, na lista de jogos e
  tem a página própria dele em `jogos-do-jojo/pages/jogo.html?id=fabrica-de-emojis`.
  O cadastro fica em `jogos-do-jojo/data/games.json`, com as artes em
  `jogos-do-jojo/assets/images/fabrica-de-emojis.svg` (cartão) e
  `...-banner.svg` (topo da página).

## Os modos

Ao abrir, o jogo pergunta como você quer jogar. Cada modo guarda o progresso
dele em separado, então um nunca estraga o outro. Dá pra trocar no 🎮 em cima
da caixa.

| Modo | O que muda |
| --- | --- |
| 🏭 **Normal** | O jogo completo, como foi feito pra ser jogado. |
| 🔥 **Difícil** | Tudo custa 4x mais, mas cada venda vale 3x. |
| 🧬 **Fusão** | Libera o painel de fundir: 5 repetidos de uma raridade viram 1 da raridade de cima. |
| 🧪 **Livre** | Dinheiro que não acaba, compras de graça e as 120 raridades abertas. É o modo de bagunçar. |

## Como se joga

- Clique **dentro da caixa** (ou no botão `FAZER EMOJI`, ou na barra de espaço) pra fabricar.
- Quando a caixa encher — ou quando quiser — aperte `VENDER`: o fundo abre e os emojis caem.
- Com dinheiro, compre upgrades. Com upgrades, ganhe mais dinheiro. Repita.
- As **setas do teclado** (ou a inclinação do celular, no botão 📱) viram a gravidade.

## O que tem dentro

| Coisa | Quanto |
| --- | --- |
| Raridades | 120, da Comum à Absoluta |
| Emojis no índice | 730, sendo 10 secretos |
| Upgrades | 330 (16 famílias de dinheiro + 17 de cristal, 10 níveis cada) |
| Conquistas | 76, sendo 8 secretas — cada uma dá +1,5% em tudo pra sempre |
| Modos de jogo | 4: Normal, Difícil, Fusão e Livre (save separado em cada um) |
| Temas da caixa | 8, comprados com cristais |

Além disso:

- **Emoji do dia** — todo dia um emoji é sorteado (pela data, igual pra todo
  mundo) e vale **10x** enquanto o dia durar.
- **Coleções** — juntar os 6 emojis de uma raridade fecha a coleção e dá
  +2% em tudo, pra sempre. O índice mostra quantos de cada você já achou.
- **Combo** — cliques em sequência aumentam o multiplicador.
- **Crítico** — chance de um clique valer 10x.
- **Gêmeo / Fusão** — o emoji pode sair dobrado ou subir uma raridade ao nascer.
- **Estrela de bônus** — de tempos em tempos aparece uma estrela na caixa; clicar
  nela dá frenesi (tudo 7x), dedo de ouro (clique 25x), dilúvio, trevão, um cofre
  de dinheiro ou a caixa cheia de presente.
- **Turbo** — 3 cristais compram 5x em tudo por 1 minuto.
- **Missões** — 3 objetivos por vez, sempre renovando e ficando mais caros.
- **Renda offline** — com o *Turno da Noite*, a fábrica rende enquanto o jogo
  está fechado (até 8 horas).
- **Renascer** — a partir de R$ 1B de recorde, troque tudo por cristais
  permanentes (+35% cada). Índice, conquistas e loja de cristais não se perdem.
- **Estatísticas** com exportar/importar o save em código de texto.
- **Temas da caixa** — Espaço, Floresta, Doceria, Vulcão, Geleira, Cofre de
  Ouro e Arco-íris, cada um mudando o visual da caixa.

## Modo administrador

Senha `1234` (troque na constante `SENHA_ADM`). Abre no cadeado 🔒, com
`Ctrl+Shift+A` ou digitando `ADMIN`. Dá pra dar dinheiro, cristais, upgrades,
destravar raridades, soltar emojis secretos e estrelas, completar missões e
recomeçar do zero.

## Detalhes técnicos

- Cada modo tem seu save no `localStorage` (`fabricaEmojis_v5_<modo>`); o save antigo (`_v4`, `_v3`, `_v2`) vira o do modo Normal.
- A física simula até 550 emojis na tela; o que passa disso vai pro **depósito**,
  que continua contando no valor e no índice — é o que segura o FPS no celular.
- A ordem dos emojis é embaralhada com semente fixa, então o índice é igual
  em qualquer aparelho.
