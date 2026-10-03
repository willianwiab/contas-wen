# 🎴 PokéTCG GO

Pokémon GO, só que em vez de capturar Pokémon **cê captura carta**. Ideia do JoJo.

Cê anda por um bairro, as cartas nascem brilhando no chão, e cê joga uma **capinha** nelas
pra levar pro álbum.

▶️ **Jogar:** https://willianwiab.github.io/contas-wen/poketcg-go/

## 🃏 As cartas são de verdade

Nome, foto, coleção, número e raridade vêm da **[pokemontcg.io](https://pokemontcg.io)** — a
mesma API que o [ButterPoke](../butterpoke/) já usa aqui no repositório, de graça e sem
cadastro. São cerca de **750 cartas** no baralho, iguais pra todo mundo.

> **As fotos não estão guardadas aqui.** A página aponta pro endereço da imagem no servidor
> deles. A arte da carta é da empresa que faz o Pokémon, e pôr uma cópia dela no nosso site
> seria publicar desenho que não é nosso.

Na prática: o jogo precisa de internet **na primeira vez** pra montar o baralho. Depois
disso o baralho fica guardado no aparelho por uma semana e o jogo **abre sem internet** —
só as fotos é que precisam da rede. Sem ela, a carta aparece com o **verso** 🎴 e o jogo
roda igual.

## 🏃 Como se joga

**Toca no mapa** e o boneco anda até lá. A tela anda junto com ele.

As cartas nascem sozinhas num anel em volta de cê e ficam flutuando no chão. **Quanto mais
rara, mais ela brilha** — a de coroa 👑 pisca. Carta **apagada e menorzinha** está longe
(toca nela que cê anda até lá); carta **acesa** já dá pra capturar.

### O anel

Na captura, um anel branco aperta e abre sem parar em volta da carta. **Joga a capinha
quando ele encostar no tracejado** — aí ele fica verde e a chance quase dobra.

Não é só sorte: a mira vale até **1,6×** na conta. Dá pra ficar bom nisso.

```
chance = chance da raridade × (0,7 + mira × 0,8)
```

Cada jogada gasta uma capinha. A carta pode **escapar** — e se escapar, pode **voar de vez**.
Quanto mais rara, mais fácil ela sumir: senão dava pra ficar martelando a coroa até pegar.

### As seis raridades

A API escreve a raridade de dezenas de jeitos (`Rare Holo`, `Illustration Rare`,
`Rare Secret`…) e **inventa nomes novos a cada coleção nova**. Então a faixa não sai de uma
lista fechada, que quebraria sozinha com o tempo: sai de um teste em cima do texto, e o que
não cair em nada vira "Rara" em vez de derrubar a carta.

| | Faixa | Chance base | XP | Aparece |
|---|---|---|---|---|
| ◆ | Comum | 82% | 10 | o tempo todo |
| ◆◆ | Incomum | 70% | 25 | bastante |
| ◆◆◆ | Rara | 54% | 60 | de vez em quando |
| ◆◆◆◆ | Super Rara | 36% | 150 | raro |
| ★ | Ultra Rara | 22% | 400 | muito raro |
| 👑 | Coroa | 13% | 1.200 | quase nunca |

Pegar a Coroa no começo te joga direto pro **nível 5**. É pra ser assim: ela aparece mil
vezes menos que uma comum.

## 🏪 A lojinha

Seis bolinhas azuis no mapa, em lugares fixos. Cada uma dá **capinhas** e fecha por
**3 minutos** depois de usada. Em três de cada dez vezes vem um **pacotinho**: três cartas
direto no álbum, sem precisar capturar.

Quanto maior o teu nível, mais capinha a lojinha dá.

## 📒 O álbum

Todas as cartas do baralho, as que cê tem e as que faltam. Filtro por raridade, por "só as
que eu tenho", por "as que faltam" e pelas **repetidas pra trocar**.

O álbum desenha **120 cartas por vez** com um botão de "ver mais". As 750 de uma vez
travavam o celular.

## 📲 Dá pra instalar

Nos dois, e aí ele vira aplicativo de verdade: ícone na tela, tela cheia, sem barra de
navegador.

| Onde | Como |
|---|---|
| **Android / computador** | Botão **📲 Instalar** dentro de ⚙️ Ajustes |
| **iPhone** | No **Safari**: compartilhar → "Adicionar à Tela de Início" |

O iPhone não tem o convite automático que o Android e o Chrome têm, então lá os Ajustes
**ensinam o caminho** em vez de mostrar um botão que não funcionaria.

## O bairro é sempre o mesmo

O cenário nasce de uma **semente guardada no aparelho**. Se fosse sorteado toda vez, nunca
daria pra dizer "a lojinha perto do lago" — e um lugar que muda de forma a cada visita não
é um lugar.

## O que o save guarda

Só **número de carta e quantidade**. A foto, o nome e a raridade saem do baralho, então o
save é pequeno e **nunca fica desencontrado** da API: se eles mudarem a foto de uma carta,
a tua coleção continua certa.

## Três coisas que custaram caro

**O anel estava atrás da carta.** Na primeira versão o `z-index` do anel era menor que o da
carta, e a carta é maior que ele — o minigame inteiro era **invisível**. Só apareceu quando
eu olhei uma foto da tela, não lendo o código.

**O verso da carta era emoji.** 🎴 e 🂠 viravam um retângulo escuro num aparelho e um
quadradinho vazio em outro. Carta tem que **parecer carta de longe**, então o verso agora é
desenhado em CSS, com o símbolo da raridade no meio.

**A foto que não carrega.** Sem internet, a carta virava um ícone quebrado. Agora o
`onerror` troca pelo verso 🎴 — o jogo continua jogável offline, só sem as artes.

## Som

Feito na hora com WebAudio: bip de toque, de jogada, de tremida, de captura, de carta rara,
de subir de nível e de lojinha. **Nenhum arquivo de áudio** — um jogo que precisa baixar mp3
é um jogo que não abre sem internet. Dá pra desligar nos Ajustes.

## Arquivos

| Arquivo | O que faz |
|---|---|
| `index.html` | A tela e o estilo |
| `cartas.js` | A busca na API, as faixas de raridade e o baralho guardado |
| `mundo.js` | O bairro, o andar, a câmera e as cartas nascendo |
| `jogo.js` | A captura, o álbum, a lojinha, o nível, o som e a instalação |
| `sw.js` | Guarda o jogo pra abrir sem internet |
| `manifest.webmanifest` | Deixa instalar como aplicativo |
| `icone*.png` / `icone*.svg` | Os ícones (o `maskable` é o que o Android recorta) |
