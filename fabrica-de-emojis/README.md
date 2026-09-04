# 🏭 Fábrica de Emojis

Jogo de clicker com física de verdade: os emojis caem dentro da caixa, quicam,
empilham e você vende a pilha inteira. Um arquivo só (`index.html`), sem
instalação, funciona offline no celular e no computador.

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
| Conquistas | 62, cada uma dá +1,5% em tudo pra sempre |

Além disso:

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

## Modo administrador

Senha `1234` (troque na constante `SENHA_ADM`). Abre no cadeado 🔒, com
`Ctrl+Shift+A` ou digitando `ADMIN`. Dá pra dar dinheiro, cristais, upgrades,
destravar raridades, soltar emojis secretos e estrelas, completar missões e
recomeçar do zero.

## Detalhes técnicos

- O save fica no `localStorage` (`fabricaEmojis_v3`) e migra sozinho do save antigo (`_v2`).
- A física simula até 550 emojis na tela; o que passa disso vai pro **depósito**,
  que continua contando no valor e no índice — é o que segura o FPS no celular.
- A ordem dos emojis é embaralhada com semente fixa, então o índice é igual
  em qualquer aparelho.
