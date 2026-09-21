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

### A lista rápida, e por que ela é honesta

A primeira versão tinha um problema que só apareceu quando alguém abriu: **não tinha
nenhum item do MM2 dentro dela.** Era uma calculadora de matemática com um caderno vazio.
Quem entrou procurando as facas e as armas do jogo não achou nada do jogo.

Tentei buscar a lista: a wiki, as listas da comunidade e o próprio site da Roblox são todos
inalcançáveis daqui. E a página do jogo na Roblox não lista os itens — eles ficam dentro
do jogo.

Então escrevi de cabeça uma lista de nomes (facas, armas e pets) e pus como **chips pra
tocar**. O que torna isso honesto não é a lista: é o **sentido da conferência**. Está
escrito em cima, em amarelo: *"esses nomes eu escrevi de cabeça; se tiver nome errado ou
item que nem existe, é só não tocar"*. Quem sabe de MM2 é quem joga, não eu — e tocar num
chip é o jogador dizendo "esse existe". Tocar de novo desfaz.

O campo de escrever continua ali pro que faltar, que é muita coisa.

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
