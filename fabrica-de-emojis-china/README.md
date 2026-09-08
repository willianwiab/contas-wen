# 🐉 中國表情符號工廠 — Fábrica de Emojis da China

O motor é o da [Fábrica de Emojis](../fabrica-de-emojis/), mas a fábrica é
outra: aqui as primeiras raridades são a mesa chinesa e os doze animais do
zodíaco, os tesouros são selos chineses de verdade e as temporadas são os
festivais, do Ano Novo Chinês ao Solstício de Inverno.

Jogo de clicker com física de verdade: os emojis caem dentro da caixa, quicam,
empilham e você vende a pilha inteira. Um arquivo só (`index.html`), sem
instalação, funciona offline no celular e no computador.

## O que é só daqui

| | O que muda |
| --- | --- |
| 🀄 **O baralho** | As 5 primeiras raridades (30 emojis) são a China de propósito: a mesa posta (🏮🧧🀄🧨🥟🍜), o chá e a janta (🍚🥢🍵🧋🫖🥡), os **12 animais do zodíaco** (🐀🐂🐅🐇🐉🐍🐎🐐🐒🐓🐕🐖) e os símbolos (🐼☯️🎋🐲🎆🎇). Do sexto em diante entra o resto do mundo, embaralhado com semente própria — então o índice daqui é **diferente** do das outras fábricas, mas igual em qualquer aparelho. |
| 🏆 **As 120 raridades** | Todas rebatizadas, em chinês e em português: 普通 Comum, 竹 Bambu, 瓷 Porcelana, 玉 Jade, 絲綢 Seda, 銅 Bronze, 銀 Prata, 金 Ouro, 硃砂 Vermelhão, 蓮花 Lótus, 燈籠 Lanterna, 長城 Muralha, 麒麟 Qilin, 鳳凰 Fênix, 龍 Dragão, 天宮 Palácio Celeste, 玉皇 Imperador, 仙 Imortal, 永恆 Eterno e 無極 Sem-Limite. As outras 100 saem de 朱雀, 青龍, 白虎, 玄武, 太極, 八卦... |
| 💎 **Os 10 tesouros** | Os emojis secretos viraram 寶藏: 🥠 幸運餅, 🪈 竹笛, 🪭 摺扇 e depois os **selos**: 🉐 得 (o achado), ㊗️ 祝 (a bênção), ㊙️ 秘 (o segredo), 🈶 有, 🈚 無 (o nada), 🈲 禁 (o proibido) e 🈯 指. O nome de cada um é o que o caractere quer dizer de verdade. |
| 🧧 **As 10 temporadas** | Os festivais chineses — a tabela abaixo. |
| 🎴 **Os temas da caixa** | 工廠 Fábrica, 竹林 Bambuzal, 青花瓷 Porcelana, 桃花 Flor de Pêssego, 火龍 Dragão de Fogo, 玉 Jade, 金庫 Cofre de Ouro e 錦 Brocado. |
| 🎮 **Os modos** | 普通 Normal, 困難 Difícil, 融合 Fusão e 自由 Livre. |
| 🎨 **A cara** | Vermelho e dourado no lugar do roxo, e ícone próprio (dragão com o selo 中). |
| 💾 **O save** | Chaves `fabricaChina_*`: as três fábricas convivem sem se misturar. |

## As temporadas — 節日

Os festivais chineses seguem o calendário lunar, que **não** dá pra calcular com
uma continha curta como a da Páscoa. Então as datas vêm de uma tabela ano a ano
(`LUNARES`, de 2024 a 2035); fora desses anos o jogo usa uma data aproximada, só
pra a temporada não sumir do calendário.

| | Temporada | Quando |
| --- | --- | --- |
| 🎉 | 開業 Estreia da Fábrica | Os seus 14 primeiros dias. Só uma vez. |
| 🧧 | 春節 Ano Novo Chinês | Da véspera até uma semana depois (lunar) |
| 🏮 | 元宵節 Festival das Lanternas | 15 dias depois do Ano Novo (lunar) |
| 🌿 | 清明節 Qingming | 4 a 6 de abril |
| 🛶 | 端午節 Barcos-Dragão | O dia da corrida, ±1 (lunar) |
| 💗 | 七夕 Qixi | Um dia só (lunar) |
| 🥮 | 中秋節 Meio-Outono | O dia da lua cheia, ±1 (lunar) |
| 🇨🇳 | 國慶節 Dia Nacional | 1 a 7 de outubro (a Semana Dourada) |
| 🛍️ | 雙十一 Dia dos Solteiros | 11 de novembro. **A mais rara: um dia só.** |
| 🥟 | 冬至 Solstício de Inverno | 21 e 22 de dezembro |

## Instalar como aplicativo

O jogo é um PWA: dá pra colocar na tela inicial e jogar sem internet.

- **Celular (Android):** abre o link no Chrome → menu ⋮ → *Instalar aplicativo*
  (ou *Adicionar à tela de início*). Também aparece o botão **📲 INSTALAR**
  em cima da caixa quando o navegador oferece.
- **iPhone:** Safari → botão de compartilhar → *Adicionar à Tela de Início*.
- **Computador:** no Chrome/Edge aparece um ⊕ na barra de endereço, ou
  menu → *Instalar*. Vira uma janela só dele.

Depois de abrir uma vez, funciona **sem internet** — o `sw.js` guarda o jogo.
Ele usa "rede primeiro": com internet você sempre pega a versão mais nova, sem
internet ele serve a última guardada.

## Onde ele aparece

- Direto: `https://willianwiab.github.io/contas-wen/fabrica-de-emojis-china/`
- No portfólio **Jogos do JoJo**: aparece na página inicial, na lista de jogos e
  tem a página própria dele em `jogos-do-jojo/pages/jogo.html?id=fabrica-de-emojis-china`.
  O cadastro fica em `jogos-do-jojo/data/games.json`.
- As outras duas fábricas continuam em `../fabrica-de-emojis/` e
  `../fabrica-de-emojis-2/`, com os saves delas intactos.

## Jogos salvos

Ao abrir, aparece a lista dos seus jogos. Dá pra ter **até 12 salvos ao mesmo
tempo** — começar um novo nunca apaga os outros.

- **💾 Continuar** — clica no jogo pra voltar de onde parou. Cada linha mostra
  recorde, emojis descobertos, conquistas e tempo de fábrica.
- **✏️** — muda o nome do jogo.
- **🗑️** — apaga aquele jogo (pergunta antes; não dá pra desfazer).
- **✨ Começar um jogo novo** — escolhe o modo e cria mais um save.
- Dentro do jogo, o **💾** em cima da caixa salva na hora (ele também salva
  sozinho a cada 5 segundos e ao fechar a página), e o **🎮** volta pra esta tela.

## Os modos

Cada jogo salvo é de um modo. Cada modo guarda o progresso
dele em separado, então um nunca estraga o outro. Dá pra trocar no 🎮 em cima
da caixa.

| Modo | O que muda |
| --- | --- |
| 🏭 **Normal** | O jogo completo, como foi feito pra ser jogado. |
| 🔥 **Difícil** | Tudo custa 4x mais, mas cada venda vale 3x. |
| 🧬 **Fusão** | Quando 5 emojis da mesma raridade estão parados na caixa, eles se puxam feito ímã, se juntam e viram 1 emoji da raridade de cima — dá reação em cadeia. Tem uma família de upgrade só dele, o **🌀 Turbo da Fusão**, que deixa o ímã até 9x mais rápido. |
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
| Upgrades | 340 (17 famílias de dinheiro + 17 de cristal, 10 níveis cada) — o **🌀 Turbo da Fusão** só aparece na loja do modo Fusão |
| Conquistas | 80, sendo 9 secretas — cada uma dá +1,5% em tudo pra sempre |
| Temporadas | 10 eventos com data marcada, cada um com 6 emojis próprios, 1 secreto, passe de 12 prêmios, tema e skin |
| Skins de emoji | 18 (8 compradas com cristais + 10 de temporada) |
| Modos de jogo | 4: Normal, Difícil, Fusão e Livre (save separado em cada um) |
| Temas da caixa | 8, comprados com cristais |

Além disso:

- **Temporadas** — em datas do ano (Natal, Halloween, Páscoa, Semana do Brasil,
  Férias, Festa Junina, Ano Novo, Dia das Crianças, Semana do Espaço) o jogo
  liga um evento: caem emojis exclusivos dele, existe um emoji secreto só dele,
  e você junta 🎟️ **pontos de temporada** pra abrir os 12 prêmios do passe
  (dinheiro, cristais, emojis, turbo e, no fim, o tema e a skin do evento).
  Quem começa a jogar agora pega a **Estreia da Fábrica**, que dura 14 dias.
- **Skins dos emojis** — enfeitam cada emoji na caixa (aro, neon, ouro, cristal,
  arco-íris...). Compradas com cristais na aba 🎨; as de evento vêm do passe.
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

## Testando

Quatro arquivos abrem o jogo num Chromium de verdade e conferem se está tudo
funcionando. Rode com `npm i playwright-core` e depois:

- `node teste-regressao.js` — 20 checagens: modos, temporadas, passe, fusão
  automática, skins, venda, emoji do dia, conquistas secretas.
- `node teste-jogos-salvos.js` — 9 checagens: criar, abrir, salvar na mão,
  renomear e apagar jogo, e a migração do save antigo.
- `node teste-china.js` — 17 checagens do que é só daqui: as raridades chinesas,
  o baralho que começa pela mesa e pelo zodíaco, os 10 tesouros (e que nenhum
  deles cai como emoji comum), as datas lunares dos 10 festivais e a separação
  dos saves das três fábricas. Precisa de http.
- `node teste-app.js` — 4 checagens de aplicativo: manifesto, ícones, service
  worker e abrir sem internet. Este precisa do jogo servido por http
  (`python3 -m http.server 8822` na raiz do repositório).

## Detalhes técnicos

- Cada jogo salvo fica no `localStorage` em `fabricaChina_jogo_<id>`, com a lista em `fabricaChina_jogos` (formato v6). As três fábricas moram no mesmo endereço e dividem o mesmo `localStorage` — o prefixo da chave é a única coisa que separa as cadernetas, e é isso que o `teste-china.js` verifica.
- O baralho daqui é `CHINESES` (30 emojis fixos, na ordem) mais o resto embaralhado com a semente `20260908`. Como os 30 primeiros são fixos, as cinco primeiras raridades são sempre as mesmas — é o que dá a cara de fábrica chinesa já no começo.
- 🪈 e 🪷 ficam fora do pool de propósito: um é tesouro e o outro é segredo de temporada, e nenhum dos dois pode sair como emoji comum.
- A física simula até 550 emojis na tela; o que passa disso vai pro **depósito**,
  que continua contando no valor e no índice — é o que segura o FPS no celular.
- A ordem dos emojis é embaralhada com semente fixa, então o índice é igual
  em qualquer aparelho.
