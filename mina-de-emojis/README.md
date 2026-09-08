# ⛏️ Mina de Emojis

Você cava pra baixo, quebra pedra e acha os emojis que estão presos em cada
camada da terra. Um arquivo só (`index.html`), sem instalação, funciona offline
no celular e no computador.

## Como se joga

- Clique numa **pedra encostada no buraco** pra dar uma picaretada nela. Pedra
  funda é mais dura e precisa de mais batidas.
- Ou aperte **CAVAR** (ou a barra de espaço) que o mineiro desce sozinho pelo poço.
- As **setas** movem o poço de lado, pra você abrir túneis.
- Cada pedra quebrada vale moedas; o que estiver escondido dentro dela vale muito mais.
- Com as moedas você compra melhorias na loja — e aí cava mais fundo, mais rápido.

## As camadas

| | Camada | A partir de |
| --- | --- | --- |
| 🟫 | Terra | 0 m |
| 🪨 | Pedra | 12 m |
| 💎 | Cristal | 24 m |
| 🌋 | Lava | 36 m |
| 🦕 | Fóssil | 48 m |
| 🏆 | Ouro | 60 m |
| 👽 | Alienígena | 72 m |
| ☄️ | Núcleo | 84 m |

Cada camada esconde **6 emojis comuns e 1 raro** — 56 no total pra completar o
álbum. O raro é bem difícil: sai em menos de 1% das pedras.

## As melhorias

48 no total, 8 níveis de cada uma:

| | O que faz |
| --- | --- |
| ⛏️ **Picareta** | mais força em cada batida |
| 💰 **Balança** | tudo que você cava vale mais |
| 🍀 **Faro** | mais chance de ter emoji dentro da pedra |
| 🤖 **Robô** | cava sozinho enquanto você faz outra coisa |
| 🧨 **Dinamite** | explode um pedaço inteiro de uma vez |
| 🔦 **Lanterna** | mostra o que tem dentro das pedras em volta |

A dinamite **custa mais do que as pedras que ela derruba valem** — ela é um
atalho de tempo, não um jeito de ficar rico.

## Instalar como aplicativo

Igual à Fábrica de Emojis: no Android é Chrome → menu ⋮ → *Instalar aplicativo*
(ou o botão **📲 INSTALAR** em cima da mina); no iPhone é Safari → compartilhar →
*Adicionar à Tela de Início*; no computador é o ⊕ na barra de endereço. Depois de
abrir uma vez funciona sem internet.

## Testando

Com `npm i playwright-core`:

- `node teste-mina.js` — 12 checagens: cavar, dureza por fundura, loja, robô,
  dinamite, camadas, álbum, stats e o save.
- `node teste-app.js` — 4 checagens de aplicativo (precisa servir por http:
  `python3 -m http.server 8822` na raiz do repositório).

## Detalhes técnicos

- O terreno é **gerado por conta**, não sorteado: o que tem dentro de cada pedra
  vem de uma continha com a posição dela, então a mesma pedra tem sempre a mesma
  coisa dentro, mesmo depois de fechar o jogo.
- O save (`minaEmojis_v1`) guarda só os buracos perto do fundo; o que ficou muito
  pra cima vira "tudo cavado". Assim o save não cresce pra sempre — uma mina de
  50 m ocupa menos de 1 KB.
