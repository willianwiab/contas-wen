# 🦋 ButterPoke

Digita o número da carta de Pokémon e o site diz quanto ela vale.

O nome é **Butterfree** + **Pokémon**, então a cara do site é a dela: asa branca,
corpo roxo e aqueles olhões vermelhos.

▶️ **Abrir:** https://willianwiab.github.io/contas-wen/butterpoke/

## O problema que ele resolve

Número de carta **não identifica carta nenhuma**. Existe uma carta "25" em quase toda
coleção que já foi lançada — são dezenas. Um site que pegasse a primeira da lista ia
mostrar o preço errado quase sempre.

Então o ButterPoke faz o que uma pessoa faria: quando o número traz mais de uma carta,
ele **pergunta o nome**. Aparece a pergunta "achei 47 cartas com o número 25, qual é a
tua?", com as cartinhas na tela pra tocar e um campo pra escrever o nome. Quando o
número traz só uma carta, ele pula a pergunta e mostra o preço direto.

## Ordenar, procurar e guardar

Toda grade tem **ordenação**: mais novas, mais antigas, mais caras, mais baratas,
💎 mais raras, ❤️ mais fortes (HP), 🔢 pela Pokédex, pelo número e por nome. A que entra
marcada muda com o contexto: busca abre pelas mais novas, coleção pelo número, favoritos
por nome.

**Cada ordem só aparece se as cartas da lista tiverem o dado dela.** Nos favoritos o
preço só chega ao abrir a carta, então lá não há "mais caras"; numa lista de treinadores
não há "mais fortes". Oferecer uma ordem que não tem como cumprir seria mentira.

E **carta sem o dado da ordem vai sempre pro fim** — ela não é barata nem fraca, é
desconhecida, e no meio da lista viraria mentira também.

### Duas ordenações ao mesmo tempo

Em "⚙️ Mais opções" tem o **desempate**: a ordem principal manda, e onde ela empata quem
decide é a segunda. É o que faz "mais raras, e entre as da mesma raridade, as mais caras
primeiro". Na prática é um `sort` só, com `principal(a,b) || segunda(a,b)`.

### A raridade

Ela vem como texto livre e muda a cada coleção nova, então em vez de uma lista fechada
(que ia furar no próximo lançamento) a nota sai do que está escrito: secret/rainbow/hyper
no topo, depois illustration/ultra, depois VMAX e LEGEND, depois ex/GX/V, holo, promo,
rare, uncommon, common. `uncommon` é testado antes de `common`, senão cairia na regra
errada.

### Filtrar mais fundo

Também em "⚙️ Mais opções":

- **Tipo de energia** — Grama, Fogo, Água, Elétrico e os outros, só os que a lista tiver
- **🔀 Dois tipos** — os Pokémon de tipo duplo, que são poucos e se perdiam no meio dos
  outros quando se filtrava por um tipo só. Os tipos da carta viraram etiqueta na tela
  dela, então dá pra ver o duplo
- **Carta especial** — EX, MEGA, GX, V, VMAX, VSTAR, BREAK, LEGEND, ex, Tera, Radiant,
  Prism Star, TAG TEAM e as antigas (Star, Shining, Dark, Light, Delta). A API chama isso
  de subtipo, mas na mesma lista vêm coisas estruturais (Basic, Stage 1, Item, Supporter)
  que não é o que alguém procura pensando em "carta ex" — por isso a lista é fechada, e
  na ordem em que apareceram no jogo. `EX` maiúsculo e `ex` minúsculo são cartas de
  épocas diferentes, então viram dois botões: "EX (das antigas)" e "ex (das novas)".
  Também viram etiqueta vermelha na tela da carta
- **Preço** — $1, $10 ou $100 pra cima. Carta sem preço não entra, porque não dá pra
  afirmar que passa
- **Quem desenhou** — a lista de artistas da própria busca

Os **favoritos** ficam no aparelho (`localStorage`). A estrelinha aparece no canto de
cada cartinha e na tela da carta. Guardo só a identidade da carta, **nunca o preço**:
preço guardado envelhece e mente, então ao abrir a favorita ele é buscado de novo, no
site de onde ela veio.

## Não é só bicho: treinador, pokébola e energia

Carta de Pokémon não é só Pokémon. Tem **Treinador** (Pokébola, Ultra Ball, Professor,
objeto) e **Energia**. Elas sempre vieram na busca — o número 25 traz a Pikachu e traz
a Poké Ball — mas ficavam misturadas e ninguém achava.

Agora a grade tem botõezinhos de tipo: **Todas / ⚡ Pokémon / 🎒 Treinador / 🔋 Energia**.
Aparecem só quando a lista tem mais de um tipo, e combinam com o filtro de nome
(Treinador + "ball" deixa Poké Ball e Ultra Ball). O tipo também virou etiqueta na
tela da carta.

O campo se chama `supertype` no site principal e `category` no reserva — e lá o Pokémon
vem sem acento, então é traduzido na entrada.

Na mesma fileira entram os botões de **✨ 1ª edição**, **🌟 Promo**, **💫 Holo**,
**🔄 Reverse** e **📏 Jumbo**. Cada um só aparece se a lista tiver do que ele filtra —
sem carta jumbo na lista, não existe botão de jumbo pra clicar à toa.

Nenhum dos dois bancos tem campo de "jumbo", então esse é deduzido do subtipo e do nome
da carta. Os outros saem de dados de verdade: 1ª edição e reverse das próprias chaves de
preço (`1stEditionHolofoil`, `reverseHolofoil`), promo da raridade e do nome da coleção.

## Quando nem o principal conhece a carta

Antes, o reserva só entrava se o principal **desse erro**. Se ele respondesse
educadamente "não tenho essa carta", o site desistia ali.

Mas os dois bancos não têm as mesmas cartas. O principal é o catálogo oficial em
inglês; o reserva tem coisa que nunca saiu em inglês — promo japonesa, por exemplo.
Então agora, quando o principal responde vazio, o reserva é consultado do mesmo jeito.
Só quando os dois não conhecem é que aparece o "não achei", e ele diz que procurou nos
dois.

Nenhum dos dois é meu, então **não dá pra adicionar carta à mão**. O que dá é procurar
em mais de um lugar — e é o que ele faz.

## Ver as coleções inteiras

Além de procurar carta solta, dá pra entrar pelo outro lado: o botão **"Ou vê todas as
coleções"** lista tudo que já saiu — Base Set, Celebrations, 151, o que for — das mais
novas pras mais velhas, com o logo, quantas cartas tem e o ano. Tocando numa, aparecem
**todas as cartas dela**, na ordem impressa, e tocando numa carta vai pro preço.

Dois detalhes que dão trabalho e ninguém vê:

- A ordem é pelo número impresso, tratado **como número**. Ordenando como texto, a 10
  vem antes da 2 e a coleção parece bagunçada.
- Coleção grande passa das 250 cartas por página da API, então vale o mesmo esquema de
  páginas da busca.

A grade é a mesma nos três casos (escolher entre cartas de mesmo número, escolher
coleção, ver as cartas de uma coleção): muda o título e o que acontece no clique, o
filtro e a paginação são iguais. Da carta, o botão **"Voltar pra lista"** devolve pra
lista de onde ela veio, seja qual for.

## De qual país é a carta

**Nenhum dos dois bancos guarda o país da carta.** Esse dado não existe pra simplesmente
mostrar. Então a etiqueta é dedução, e a tela diz isso embaixo dela em vez de fingir que
é informação oficial:

| Etiqueta | De onde sai |
|---|---|
| 🇯🇵 Japão | o nome da coleção já diz "Japanese" |
| 🏆 Mundial | o nome da coleção é de World Championships |
| 🗾 Fora do inglês | a carta **não** está no catálogo em inglês; achei só no reserva |
| 🌎 Em inglês | a carta está no catálogo em inglês |

A do meio é a que interessa e a que mais engana, então vale explicar. O banco principal
**é** o catálogo das cartas em inglês: estar nele é certeza de que a carta saiu em
inglês. Não estar nele, e existir só no reserva, quer dizer que ela nunca saiu em
inglês — e o caso comum disso é promo japonesa. Não é prova, é o que dá pra afirmar, e a
etiqueta diz "fora do inglês" em vez de "Japão" justamente por isso.

## Versão, estado e PSA

Depois de achar a carta, o site pergunta mais duas coisas, porque a mesma carta
tem preços bem diferentes dependendo delas:

1. **Qual versão é a tua** — Normal, Holo (o desenho brilha), Reverse Holo (o fundo
   brilha e o desenho não) ou 1ª edição. Só aparecem as versões que realmente têm
   preço registrado; carta com uma versão só pula a pergunta.
2. **Como ela está** — perfeita, estado bom, médio ou ruim, cada uma com a
   explicação do que isso quer dizer, que ninguém nasce sabendo.

O valor em destaque recalcula na hora. Quando o estado desconta alguma coisa, aparece
junto o **preço de tabela sem contar o estado** — o número cru que a API deu, pra dar
pra comparar os dois de um olhada só. E embaixo vem a tabela de quanto ela valeria
**avaliada pela PSA**, das notas 10 a 6.

### O aviso que importa

Os preços de **versão** são reais: vêm da API, cada versão com a sua cotação.

Os de **estado** e de **PSA** são **conta minha**, e o site diz isso na cara da pessoa,
na caixinha embaixo da tabela. O motivo é simples: preço de carta avaliada não existe
em API de graça — quem tem esse dado (PriceCharting, a própria PSA) cobra por ele. Então
eu parto do preço da carta perfeita e multiplico:

| | fator |
|---|---|
| Perfeita (é o que a API dá) | 1 |
| Estado bom | 0,80 |
| Estado médio | 0,60 |
| Estado ruim | 0,35 |
| PSA 10 | 5 |
| PSA 9 | 2 |
| PSA 8 | 1,3 |
| PSA 7 | 1 |
| PSA 6 | 0,75 |

São as réguas que o pessoal de carta usa de cabeça. Servem pra dar noção — carta
avaliada varia muito de uma pra outra, e pra vender de verdade tem que olhar anúncio
fechado no eBay ou no PriceCharting. Quando nem o PSA 10 pagaria os ~$25 da avaliação,
o site avisa que não compensa mandar avaliar.

## De onde vem o preço

Da [pokemontcg.io](https://pokemontcg.io), que junta os preços do **TCGplayer** (em dólar,
mercado americano) e do **Cardmarket** (em euro, mercado europeu). O site mostra:

- o valor em destaque — a versão mais valiosa que tiver preço (1ª edição > holo > normal);
- a tabela por versão, com preço de mercado, o mais barato e o mais caro;
- um valor aproximado em reais, usando a cotação do dólar que você digita lá embaixo
  (fica guardada no aparelho). É chute pra dar noção — o preço oficial é o de lá.

## Quando o site dos preços cai

Aconteceu no primeiro dia no ar: a pokemontcg.io devolveu **500** e a busca não
funcionou. Duas causas possíveis, e o conserto cobriu as duas.

A primeira era minha: eu escrevia `number:"25" or number:"025"` com o **or em
minúscula**. O buscador deles é Lucene, que só entende `OR` maiúsculo — em
minúscula ele acha que "or" é parte do nome da carta, não consegue montar a
consulta e estoura. Agora vai maiúsculo.

A segunda é que a API deles simplesmente tem dias ruins. Então a busca agora
tenta quatro caminhos, parando no primeiro que responder:

1. a consulta completa (todas as escritas do número, coleção mais nova primeiro)
2. a mesma consulta sem a ordenação
3. a consulta mais crua que existe: `number:25`
4. **outro site de preços**, a [tcgdex.net](https://tcgdex.net), que tem formato
   diferente e é traduzido pro mesmo formato aqui dentro — o resto da tela nem
   fica sabendo da troca

Só quando os quatro falham é que aparece o aviso de erro, e ele mostra o que cada
tentativa respondeu, pra ficar fácil descobrir o que houve.

## Detalhes de dentro

- **`025` e `25` são a mesma carta.** A API guarda uma forma só, então a busca pergunta
  por todas as escritas de uma vez (`number:"25" or number:"025"...`).
- **Ordenado pela coleção mais nova**, que é a carta que a criança provavelmente tem na mão.
- **Sem chave de API.** A pokemontcg.io responde sem cadastro, com limite por dia.
  Se um dia estourar o limite, aparece o aviso de "deu ruim na busca".
- **A busca por nome acha pedaço no meio.** `name:"Imakuni*"` não acha
  "Dance! Neo Imakuni?", porque o `*` só vale no fim: o nome tem que *começar* com o
  que se digitou. Então a segunda consulta leva estrela dos dois lados (`name:*x*`) e o
  pedaço pode estar em qualquer lugar. Consulta que responde vazio não encerra a busca —
  a próxima é mais ampla e pode achar.
- **Os nomes são em inglês**, porque a base é em inglês. A busca por nome avisa isso.
- **Coleção recém-lançada demora a aparecer.** Os bancos são alimentados por gente, e
  carta que saiu essa semana (ainda mais japonesa) leva um tempo até entrar. Não tem o
  que o site faça: ele só pergunta.
- **A busca pega todas as páginas.** A API entrega 250 cartas por vez, e número
  popular passa disso, então as páginas seguintes vêm todas de uma vez (`Promise.all`),
  com teto de 4 páginas — acima de mil cartas ninguém rola a tela, o filtro pelo nome
  resolve melhor. Quando o teto corta, a tela diz quantas existem no total.
- **A grade mostra 60 cartas por vez**, com um botão pra pedir mais. Despejar mil
  cartinhas de uma vez trava celular fraco.
- **Funciona no celular como app** (manifesto + service worker). A casca abre offline,
  mas preço só com internet — preço velho enganaria mais do que ajudaria.

## Rodar na tua máquina

É um arquivo só, sem instalar nada:

```
python3 -m http.server 8000
```

e abre `http://localhost:8000/butterpoke/`.
