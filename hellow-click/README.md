# 🎃 Hellow Click

Um clicker de Halloween. Cê clica na abóbora, ganha doce, compra melhoria pra ganhar mais
por clique — e contrata monstro pra catar doce enquanto cê nem tá olhando.

## 🚪 O jogo só abre na semana do Halloween

De **25 de outubro a 1º de novembro** ele abre sozinho. Fora dessa semana aparece uma porta
fechada, com um relógio mostrando **dias, horas, minutos e segundos** até a próxima.

Só dia e hora deixava a tela parada — parecia que a contagem tinha travado. Com os segundos
correndo dá pra ver que ela está mesmo andando.

**Mas quem sabe a senha entra quando quiser** — e uma vez destravado, fica destravado
naquele aparelho pra sempre. Nem apertar "Recomeçar" tranca de novo: quem já entrou não
precisa provar de novo.

> ⚠️ **Isso é uma brincadeira, não um cadeado.** A senha está escrita no `jogo.js`, e
> qualquer pessoa que abrir o código do site acha ela em dois segundos. Pra trancar de
> verdade precisaria de um servidor conferindo a senha, e este jogo não tem servidor
> nenhum — é isso que o deixa rápido, offline e sem cadastro. Serve pra ser um segredo
> entre amigos, não pra guardar coisa importante.

## A regra que manda num clicker

**O próximo número sempre tem que estar quase ao alcance.**

É só isso. Por isso cada compra deixa a próxima 1,15x mais cara: rápido o bastante pra
nunca acabar, devagar o bastante pra sempre dar pra comprar mais uma. Quem inventou isso
foi o Cookie Clicker, e o número não é chute — com 1,3x a pessoa trava e desiste, com 1,05x
ela compra 200 de uma vez e enjoa.

As melhorias de **clique** seguem outra conta (1,7x): elas são poucas e caras de propósito,
pra continuarem sendo uma decisão. Se fossem baratas viravam só mais um botão pra apertar.

## As duas metades do jogo

| | O que faz | Pra quem |
|---|---|---|
| 🖱️ **9 melhorias de clique** | somam no valor de cada toque | quem tá com o jogo aberto |
| 👹 **12 ajudantes** | rendem sozinhos por segundo | quem fechou e foi fazer outra coisa |
| ⭐ **18 especiais** | multiplicam o que já existe | quem já tem bastante de alguma coisa |

Um clicker só com clique cansa a mão. Um só com ajudante vira uma planilha que se olha.
O jogo é a conversa entre os dois.

## O combo: o clique deixa de ser só clique

Clicando rápido (menos de 0,7 segundo entre um e outro) o combo sobe, e **cada clique vale
até 2x**. Parado por 1,2 segundo, ele zera.

Isso existe porque um clicker tem um problema: depois que os ajudantes rendem bem, não
sobra nada pra fazer com o jogo aberto a não ser olhar. O combo devolve uma coisa que
depende da pessoa — e tem até troféu pra quem chegar a 50 seguidos.

## Comprar de 10 em 10

Lá pelo meio do jogo, comprar de um em um vira trabalho braçal: são dezenas de toques pro
número andar. Tem três botões — **1 por vez**, **10 de uma vez** e **o máximo**.

O preço de 10 **não é dez vezes o preço do primeiro**: cada unidade já sai mais cara que a
anterior, então é a soma de uma progressão geométrica. Dez morcegos no começo custam 407,
e não 200. O botão mostra o total antes de cê apertar, e "o máximo" calcula quantos cabem
no bolso — exatamente quantos, nunca um a mais.

## ⭐ As melhorias especiais

Compras **únicas** que **multiplicam**, em vez de somar mais um pedacinho. São 18:

- **Uma pra cada ajudante** — *"Morcego turbinado: todos os teus morcegos rendem o DOBRO"*
- **Três pro clique** — x2, x3 e x5
- **Duas pra tudo** — Noite Eterna (+25%) e Véu do Além (+50%)
- **Uma pra sorte** — Chamado Dourado, e a abóbora dourada aparece quase o dobro mais vezes

Um bicho comprado 50 vezes some do radar: o próximo custa tanto que a pessoa para de olhar
pra ele. A melhoria dele devolve um motivo pra ele existir.

Cada uma **só aparece quando cê já chegou perto** (10 daquele bicho, 100 cliques, 8
troféus…). Uma lista cheia de coisa inalcançável é barulho, não objetivo — então embaixo
fica só um "vindo por aí" com as três próximas.

## 🎭 A cara da abóbora

No botão 🎭 do canto da cena dá pra trocar o rosto: caveira 💀, fantasma 👻, gato preto 🐈‍⬛,
zumbi 🧟, lobisomem 🐺, vampiro 🧛, ceifador ☠️, lua 🌕, vela 🕯️, doce 🍬 e coroa 👑.

São 12 no total, e **cada uma abre fazendo uma coisa diferente** — 1.000 cliques, 10
fantasmas, comprar a Garra de Lobisomem, pegar 5 douradas, ganhar todos os troféus. As
presas mostram o que falta, porque saber o preço é metade da vontade.

## 🌙 As fases da noite

O céu muda com a **hora de verdade** do relógio de quem está jogando:

| Quando | Como fica |
|---|---|
| 2h – 5h | 🌫️ Madrugada, azul frio |
| 6h – 16h | ☀️ Dia, mais claro |
| 17h – 19h | 🌇 Entardecer, alaranjado |
| 20h – 22h | 🌙 Noite, o roxo de sempre |
| **23h – 1h** | **🕛 Hora das Bruxas — roxo elétrico, e tudo rende +50%** |

Abrir o jogo perto da meia-noite passa a valer a pena de verdade, e não só por ficar bonito.

## 📈 A sala dos números

Uma aba com tudo o que o jogo sabe sobre a partida: doces no total, por segundo, por
clique, o melhor por segundo que cê já teve, cliques dados, maior combo, douradas pegas,
tempo de jogo, quantos ajudantes e melhorias, troféus, especiais, **qual bicho mais rende
agora** e há quantos dias cê joga.

Ela só se redesenha com a aba aberta — ficar recalculando tudo dez vezes por segundo com
ninguém olhando é gasto à toa.

## A abóbora dourada 🌟

De vez em quando (entre 40 e 110 segundos) uma abóbora dourada aparece num canto qualquer
da tela e some sozinha em 9 segundos. Quem pega leva um de três prêmios sorteados:

- 🔥 **Frenesi** — clique valendo 7x por 15 segundos
- ⚡ **Turbo** — os monstros rendendo 5x por 20 segundos
- 🍬 **Chuva de doces** — uma bolada na hora

Ela é a melhor parte do jogo justamente porque **ninguém a chamou**. O que diverte num
clicker não é o número subindo — é a coisa que aconteceu sem a pessoa pedir.

## Troféus que não são só enfeite

São 21, e **cada um dá +2% em tudo**. Isso muda o que eles são: em vez de uma medalhinha
pra olhar, viram um motivo pra ir atrás dos que faltam. Com os 21, é +42% no jogo inteiro.

## Enquanto a pessoa está fora

Ao voltar, os ajudantes renderam pelo tempo que passou — **mas pela metade**, e no máximo
8 horas. Se rendesse igual, valeria mais a pena fechar o jogo do que jogar; e sem limite,
sumir uma semana daria mais doce do que qualquer partida.

## Como a tela foi pensada

**A cena tem chão.** Antes a abóbora flutuava num fundo preto. Agora existe céu com
estrelas, lua, um morro e um chão — e **os bichos que cê comprou aparecem morando nesse
chão**. É o único lugar do jogo onde dá pra ver o progresso sem ler número nenhum: a
cena vai enchendo de bicho conforme o time cresce.

**A loja parou de ser uma parede verde.** Antes todo item que dava pra comprar ficava com
a mesma borda verde — e quando 7 de 8 estão verdes, verde para de significar "dá pra
comprar". Agora cada item tem a cor dele, quem cê já tem ganha um selo **×32** bem
visível, e o preço só vira botão amarelo aceso quando o dinheiro dá.

**A informação mais importante virou a maior.** "Quantos eu tenho" e "quanto isso está
rendendo agora" eram a letra menor do cartão. Subiram. E o **por clique**, que o jogo nem
mostrava, agora fica lá em cima junto com o por segundo — é o número que a pessoa mais
precisa pra decidir o que comprar.

**Nome não é cortado.** Em tela estreita o nome quebra em duas linhas em vez de virar
"Dedo Esquel...". O nome é o que a pessoa procura; não pode ser o primeiro a sumir.

**A lua mora no céu, não no canto.** No canto de cima ela passava por baixo do título em
celular estreito. Descendo pro meio do céu ela resolveu dois problemas: parou de brigar
com o título e preencheu o vazio que tinha entre as fichas e a abóbora.

## Três detalhes que dão trabalho e ninguém nota

- **Número grande vira número legível.** `1234567` não diz nada pra ninguém: vira `1,23 mi`.
  Mas `0,4` por segundo **não pode** virar `0`, senão parece que o morcego não faz nada —
  por isso número pequeno quebrado mantém a casa decimal.
- **A loja é montada uma vez só.** Depois o jogo só troca o preço e a cor. Refazer o HTML
  dez vezes por segundo engoliria o toque da pessoa no meio do caminho.
- **Aba escondida não vira tesouro.** O relógio do jogo limita cada passo a 1 segundo; sem
  isso, voltar numa aba parada há horas despejaria tudo de uma vez pelo caminho errado (o
  tempo fora tem a conta dele, com metade e teto).

## 📥 Dá pra baixar o jogo

O botão **Baixar o jogo** junta o `index.html` e o `jogo.js` num arquivo `.html` só e
salva no aparelho. Esse arquivo abre sozinho, **sem servidor e sem internet nenhuma** — e
dá pra mandar pros amigos pelo zap, que funciona igual na mão deles.

Na hora de juntar, o `manifest` e o service worker são tirados: eles não existem em
arquivo solto (`file://`), e o registro do service worker também é pulado por lá. A fonte
do título é a única coisa que vem de fora — sem internet o título cai na fonte do sistema
e o resto continua inteiro.

Do lado do navegador tem o **Instalar**, que usa o `manifest` pra colocar o jogo na tela
de início como aplicativo. Esse botão **só aparece quando o navegador de fato oferece** —
mostrar um botão que não faz nada seria pior que não ter botão.

## 🔔 Avisos

O botão **🔔 Avisos** (e o **"Me avisa quando a porta abrir"** da própria porta) liga os
avisos do navegador. Ele avisa em duas horas:

- 🏆 **Troféu novo** — caindo vários de uma vez, sai **um aviso só** juntando todos. Três
  avisos seguidos viram incômodo, não notícia.
- 🚪 **A porta abriu** — quando chega 25 de outubro, uma vez por ano.

Apertar de novo desliga.

> **O limite honesto:** o aviso só sai se o jogo estiver **aberto em algum lugar** — pode
> ser em outra aba, ou com o celular no bolso, mas aberto. Com o jogo **totalmente
> fechado** não tem como: isso pediria um servidor mandando o aviso, e este jogo não tem
> servidor. No iPhone os avisos só funcionam se o jogo estiver instalado na tela de início.

## ⚙️ Modo administrador

Abre no **🔒** do rodapé, com **Ctrl+Shift+A**, ou digitando **ADMIN** — igual à Fábrica de
Emojis. A senha é `1234`, e uma vez usada o jogo lembra: não pede de novo naquele aparelho.

Lá dentro dá pra dar doces (até 1 quatrilhão), dar ajudantes e melhorias de montão, soltar
uma abóbora dourada na hora, ligar frenesi ou turbo, destravar todos os troféus e deixar a
porta do Halloween aberta pra sempre.

Tem troféu pra quem entra: 🔓 **Trapaceiro**. E o painel avisa o óbvio — sem esforço o jogo
perde a graça rápido.

> A senha do adm também está no código, pela mesma razão da outra: sem servidor, não tem
> onde guardar segredo. Ela serve pra esconder o botão da visita, não pra trancar nada.

## Onde as coisas ficam

No `localStorage` **deste aparelho** — sem conta, sem senha, sem servidor. Salva sozinho a
cada 10 segundos e sempre que a aba é escondida ou fechada.

Um save de versão antiga nunca quebra o jogo: o que faltar é preenchido com o valor novo,
e um save corrompido começa do zero em vez de travar numa tela preta.

## Funciona sem internet

Tem `sw.js` e `manifest.webmanifest`, então dá pra instalar na tela de início e jogar
offline. Clicker é jogo de fila de banco e de ônibus, onde o sinal não ajuda.

A única coisa que vem de fora é a fonte do título (Creepster, do Google Fonts). Sem
internet ela não carrega e o título aparece na fonte do sistema — o jogo continua inteiro.

## Arquivos

| Arquivo | O que faz |
|---|---|
| `index.html` | A tela e o estilo |
| `jogo.js` | As contas, a loja, os troféus e a abóbora dourada |
| `sw.js` | Guarda o jogo pra abrir sem internet |
| `manifest.webmanifest` | Deixa instalar como aplicativo |
| `icone.svg` | A abóbora |
