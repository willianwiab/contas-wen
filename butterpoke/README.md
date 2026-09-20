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
- **Os nomes são em inglês**, porque a base é em inglês. A busca por nome avisa isso.
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
