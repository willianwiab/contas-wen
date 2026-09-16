# 🎃 Hellow Click

Um clicker de Halloween. Cê clica na abóbora, ganha doce, compra melhoria pra ganhar mais
por clique — e contrata monstro pra catar doce enquanto cê nem tá olhando.

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
| 🖱️ **Melhorias de clique** | somam no valor de cada toque | quem tá com o jogo aberto |
| 👹 **Ajudantes** | rendem sozinhos por segundo | quem fechou e foi fazer outra coisa |

Um clicker só com clique cansa a mão. Um só com ajudante vira uma planilha que se olha.
O jogo é a conversa entre os dois.

## A abóbora dourada 🌟

De vez em quando (entre 40 e 110 segundos) uma abóbora dourada aparece num canto qualquer
da tela e some sozinha em 9 segundos. Quem pega leva um de três prêmios sorteados:

- 🔥 **Frenesi** — clique valendo 7x por 15 segundos
- ⚡ **Turbo** — os monstros rendendo 5x por 20 segundos
- 🍬 **Chuva de doces** — uma bolada na hora

Ela é a melhor parte do jogo justamente porque **ninguém a chamou**. O que diverte num
clicker não é o número subindo — é a coisa que aconteceu sem a pessoa pedir.

## Troféus que não são só enfeite

São 15, e **cada um dá +2% em tudo**. Isso muda o que eles são: em vez de uma medalhinha
pra olhar, viram um motivo pra ir atrás dos que faltam. Com os 15, é +30% no jogo inteiro.

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
