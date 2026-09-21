# RaroDex

Um site pra responder, com número certo, a pergunta que todo mundo do Murder Mystery 2
faz: **quão raro é isso, de verdade?**

Mora em `rarodex/`, é uma página só, funciona no celular e não precisa de internet depois
de aberta.

## Por que ele não tem as chances de cada item

Essa foi a primeira decisão, e ela desenhou o site inteiro.

Com as cartas Pokémon eu tive sorte: existem dois bancos públicos e de graça que me dão
preço de qualquer carta. **Pra MM2 não existe nada parecido.** As listas de chance e de
valor são sites da comunidade — HTML feito pra gente ler, não pra programa ler — e não
dão permissão pro navegador buscar os dados de fora. Uma delas ainda proíbe, nas regras,
copiar a lista pra dentro de outro aplicativo.

Então **eu não copio nada de ninguém**. Nem por scraping, nem digitando na mão.

Sobrou uma pergunta boa: e o que eu *posso* fazer bem? A resposta é a parte que as listas
**não** fazem — a conta.

## O engano que o site existe pra desfazer

> "A chance é 1 em 400. Eu abri 400 caixas. Tinha que ter saído!"

Não tinha. Abrir 400 caixas com chance de 1 em 400 dá **63,3%**. Em cada 100 pessoas que
abrirem 400 caixas, umas 37 não tiram nada — e não é azar, não é castigo, não é "conta
amaldiçoada". É a conta.

Esse número é a tela principal. Você escreve a chance e quantas caixas, e ele mostra:

- a chance de sair **pelo menos um**
- a chance de **não sair nenhum**
- quantas caixas pra chegar em 50%, 90% e 99%
- e um recado, quando você cai exatamente na pegadinha acima

## As contas

Uso `log1p`/`expm1` em vez de `Math.pow`:

```js
function chanceEmN(p, n){ return -Math.expm1(n * Math.log1p(-p)); }   // 1-(1-p)^n
function caixasPara(p, alvo){ return Math.ceil(Math.log1p(-alvo) / Math.log1p(-p)); }
```

Chance de item godly é um número pequeno, e `(1-p)^n` com `p` minúsculo perde casa decimal
justo onde a resposta mora. Com `p = 0,0000001` e um milhão de caixas, a diferença já
aparece.

**Um teste me pegou errando.** Eu tinha escrito, de cabeça, que 400 caixas dão 63,2% e que
90% pede 921 caixas — usando o `1 - 1/e`, que só vale quando o número de caixas é enorme.
Os valores certos são **63,3%**, **920** e **1840**. O código estava certo; eu é que tinha
errado o gabarito. Arrumei o teste, não o código, e deixei o comentário lá explicando.

## O simulador

Ler "63%" não convence ninguém. Abrir cem caixas de mentirinha e não tirar nada convence na
hora — e sem gastar Robux.

O botão 🍀 sorteia de verdade com a chance que você escreveu, conta quantas você abriu,
quantas saíram e em qual saiu a primeira. Quando não sai nada, ele diz a chance de isso
acontecer, pra ficar claro que é normal.

## O caderno

As chances de cada item eu não tenho — mas **você** tem, quando olha no jogo ou na wiki.
Então o caderno é teu: nome, tipo (🔪 faca, 🔫 arma, 🐾 pet, ✨ habilidade), raridade,
a chance que você viu, e o quanto você encontra esse item por aí (de 1 a 5).

A lista se ordena do **mais difícil pro mais fácil**, pela chance anotada. Quem não tem
chance anotada fica no fim.

É a mesma ideia dos 🧸 bonecos do ButterPoke: quando o dado não existe em lugar nenhum, o
site guarda o que a pessoa sabe, em vez de inventar.

### A lista de itens, e de onde ela veio

A primeira versão tinha um problema que só apareceu quando alguém abriu: **não tinha
nenhum item do MM2 dentro dela.** Era uma calculadora de matemática com um caderno vazio.

Tentei buscar a lista: a wiki, as listas da comunidade e o próprio site da Roblox são todos
inalcançáveis daqui. A página do jogo na Roblox também não serve — os itens ficam dentro
do jogo, não no catálogo.

Cheguei a pôr uma lista escrita **de cabeça**, com um aviso amarelo mandando conferir. Não
era bom o bastante: ninguém deveria ter que auditar o meu chute. Aí a lista veio pelo
caminho certo — **um jogador mandou os 143 nomes**. Guardo exatamente como vieram, sem
"consertar" grafia: se um estiver escrito diferente, quem joga vê na hora e avisa; eu
corrigindo por conta própria é que ia criar item que não existe.

O que a lista **não** tem, de propósito: chance e raridade. Isso muda com atualização e
eu não tenho de onde tirar. Quem anota é a pessoa.

E a lista não é cerca: item que a pessoa anotar no caderno e que não esteja nela **aparece
na busca do mesmo jeito**.

## O item no meio da tela

Pediram "que nem o ButterPoke", e o pedido estava certo. No ButterPoke a **carta** é a
estrela: você digita e ela abre. Aqui a calculadora estava no lugar dela, e o item não
existia em canto nenhum.

Agora são dois modos, num trilho só:

- **🔤 Pelo nome** (o que abre primeiro) — escreve um pedaço, vê a grade, toca e abre a
  **ficha do item**. Achou um só? Abre direto, sem passo no meio.
- **🎲 Pela chance** — a calculadora solta, pra quando você quer só fazer a conta.

A ficha tem o nome grande, os selos do que você anotou, e embaixo a conta com a chance
daquele item — com um campo pra mexer no número de caixas e ver mudando. Sem chance
anotada, no lugar da conta vai o convite pra anotar, nunca um número inventado.

### O bug que quase estragou tudo

O campo da chance vinha preenchido com o que o site mostra: `1 em 4.000`. Com **ponto de
milhar**, que é o certo em português. Só que na releitura esse ponto virava vírgula
decimal: `4.000` = quatro. Bastava abrir um item salvo e apertar Guardar pra chance virar
**mil vezes maior**, em silêncio.

Duas correções, porque uma só não bastava:

1. O que vai **pra dentro** de um campo de texto sai sem separador (`umEmCru`).
2. O `lerChance` passou a entender ponto de milhar — mas só quando ele é mesmo separador:
   `1.234.567` sim, `0.25` não.

E um teste novo de ida e volta: tudo que o site **mostra** tem que voltar igual quando é
lido de novo.

## A escadinha das raridades

Comum → Incomum → Rara → Lendária → Única → Vintage → Godly → Ancient → Chroma.

**Essa ordem eu escrevi de cabeça, e está dito na tela que pode estar errada.** O MM2 muda
com atualização, e eu não consigo conferir daqui. Por isso o caderno aceita qualquer
raridade escrita à mão, mesmo uma que não esteja nessa lista.

A tela também separa duas coisas que as pessoas misturam: **raridade** é a etiqueta que o
jogo dá; **chance** é o número. Item da mesma etiqueta pode ter chance bem diferente.

## Onde ver as chances

Botão 🔎, com links pra wiki e pro jogo. Levar a pessoa na fonte é melhor que copiar o
número pra cá por dois motivos: copiar é pegar carona no trabalho dos outros, e número
copiado envelhece — eu ia mostrar uma chance de meses atrás com cara de chance de hoje.

## O resto

- **Claro e escuro**, seguindo o aparelho até a pessoa escolher.
- **Código pro outro aparelho** (`RD1.…`): o caderno de lá se junta com o daqui, nada é
  apagado, e não tem senha nenhuma dentro.
- **O número da versão no rodapé é botão**: aperta e o site joga fora tudo que está
  guardado e reabre do zero. Veio do ButterPoke, onde o "não atualizou o site" apareceu
  vezes demais.
- **Não é oficial**, e está escrito no rodapé: site de fã, sem ligação com o MM2, com o
  Nikilis ou com a Roblox.

## Rodar na tua máquina

É arquivo solto: abre o `index.html` no navegador. Pro service worker funcionar precisa de
um servidorzinho (`python3 -m http.server`), mas o site inteiro funciona sem ele.
