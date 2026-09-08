# 🗼 Torre de Emojis

O bloco vai e volta lá em cima; você solta e ele empilha. Quanto mais alta a
torre, mais dinheiro cada bloco vale. Errar demais entorta a torre — e torre
torta cai. Um arquivo só (`index.html`), funciona offline no celular e no PC.

## Como se joga

- Clique na tela (ou aperte **espaço**) pra soltar o bloco.
- Acertar **bem no meio** do bloco de baixo é **PERFEITO**: paga **3x** e ainda
  endireita um pouco a torre.
- Bloco que erra feio **cai fora** e custa uma vida. Sem vidas, acabou.
- Cada bloco fora do lugar **entorta** a torre. Entortou demais, ela desaba.
- O dinheiro **fica guardado** entre uma rodada e outra — é com ele que você
  compra as melhorias.

## As melhorias (36, seis níveis de cada)

| | O que faz |
| --- | --- |
| 💰 **Contrato** | cada bloco vale mais |
| 🧲 **Cola** | a torre entorta menos |
| 🐢 **Freio** | o bloco anda mais devagar (fica bem mais fácil acertar) |
| ❤️ **Capacete** | mais vidas por rodada |
| 📏 **Bloco** | blocos mais largos |
| 🪜 **Andaime** | já começa a rodada com blocos prontos |

## As cestas

Trocam os emojis da torre. Abrem conforme o seu **recorde de altura**:

| Cesta | Abre em |
| --- | --- |
| 😀 Carinhas | desde o começo |
| 🐯 Bichos | 25 blocos |
| 🍕 Comida | 60 blocos |
| 🚀 Espaço | 120 blocos |

## Instalar como aplicativo

No Android: Chrome → menu ⋮ → *Instalar aplicativo* (ou o botão **📲 INSTALAR**).
No iPhone: Safari → compartilhar → *Adicionar à Tela de Início*. No computador:
o ⊕ na barra de endereço. Depois de abrir uma vez, funciona sem internet.

## Testando

Com `npm i playwright-core`:

- `node teste-torre.js` — 9 checagens: empilhar, PERFEITO, bloco que cai fora,
  torre entortando até desabar, loja, cestas trancadas, andaime e o save.
- `node teste-app.js` — 4 checagens de aplicativo (precisa servir por http:
  `python3 -m http.server 8822` na raiz do repositório).

## Detalhes técnicos

- Os blocos não giram: cada um encaixa no topo do anterior, e o que decide tudo
  é a distância entre os dois centros. É o que deixa a pilha estável em vez de
  tremer.
- O **desvio** da torre é a soma das distâncias de cada bloco pro de baixo — ou
  seja, o quanto o topo saiu de cima da base. Passou de um bloco e pouco, desaba.
- O save (`torreEmojis_v1`) guarda dinheiro, recorde, melhorias, cesta e álbum.
