# 🧈⚡ ButterPoke

Digita o número da carta de Pokémon e o site diz quanto ela vale.

▶️ **Abrir:** https://willianwiab.github.io/contas-wen/butterpoke/

## O problema que ele resolve

Número de carta **não identifica carta nenhuma**. Existe uma carta "25" em quase toda
coleção que já foi lançada — são dezenas. Um site que pegasse a primeira da lista ia
mostrar o preço errado quase sempre.

Então o ButterPoke faz o que uma pessoa faria: quando o número traz mais de uma carta,
ele **pergunta o nome**. Aparece a pergunta "achei 47 cartas com o número 25, qual é a
tua?", com as cartinhas na tela pra tocar e um campo pra escrever o nome. Quando o
número traz só uma carta, ele pula a pergunta e mostra o preço direto.

## De onde vem o preço

Da [pokemontcg.io](https://pokemontcg.io), que junta os preços do **TCGplayer** (em dólar,
mercado americano) e do **Cardmarket** (em euro, mercado europeu). O site mostra:

- o valor em destaque — a versão mais valiosa que tiver preço (1ª edição > holo > normal);
- a tabela por versão, com preço de mercado, o mais barato e o mais caro;
- um valor aproximado em reais, usando a cotação do dólar que você digita lá embaixo
  (fica guardada no aparelho). É chute pra dar noção — o preço oficial é o de lá.

## Detalhes de dentro

- **`025` e `25` são a mesma carta.** A API guarda uma forma só, então a busca pergunta
  por todas as escritas de uma vez (`number:"25" or number:"025"...`).
- **Ordenado pela coleção mais nova**, que é a carta que a criança provavelmente tem na mão.
- **Sem chave de API.** A pokemontcg.io responde sem cadastro, com limite por dia.
  Se um dia estourar o limite, aparece o aviso de "deu ruim na busca".
- **Os nomes são em inglês**, porque a base é em inglês. A busca por nome avisa isso.
- **Funciona no celular como app** (manifesto + service worker). A casca abre offline,
  mas preço só com internet — preço velho enganaria mais do que ajudaria.

## Rodar na tua máquina

É um arquivo só, sem instalar nada:

```
python3 -m http.server 8000
```

e abre `http://localhost:8000/butterpoke/`.
