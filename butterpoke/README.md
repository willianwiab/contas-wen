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

## Perfil — e por que não é cadastro de verdade

Pediram um cadastro. **Não dá, e o motivo importa:** cadastro de verdade precisa de
servidor, e este site é um arquivo só, hospedado de graça, que não roda programa nenhum
do outro lado. Sem servidor não há onde guardar senha com segurança.

Fazer um login de mentira — pedir senha e guardar no aparelho — seria **pior que não
ter**: pareceria seguro sem ser, e ensinaria a criança a digitar senha em qualquer coisa
que peça. Então não foi feito, e o site diz isso na cara.

O que existe é um **perfil no aparelho**: nome e um símbolo, que viram um crachá no topo.
E um **código** que a pessoa leva na mão:

- o código guarda o perfil e as favoritas num texto só, em base64 pra sobreviver a ser
  colado no zap sem quebrar em pedaços
- colar um código **junta** as favoritas de lá com as daqui; nunca substitui, porque
  quem cola não espera perder o que já tinha
- colar o mesmo código duas vezes não duplica nada
- código de outro site, ou cortado no meio, dá um recado em português explicando —
  sem isso o navegador devolve o erro do `atob` em inglês, que não ajuda ninguém

## Meus bonecos

Pediram pelúcia, boneco e brinquedo com preço — três vezes. Respondi "não dá" três vezes,
e na terceira parei pra pensar direito.

**Catálogo de brinquedo não existe** em lugar nenhum que eu alcance, e inventar preço seria
mentir. Isso não mudou. Mas quem tem o dado é a **própria pessoa**: ela vê o boneco na
loja, sabe quanto custa, sabe qual Pokémon é. Então o site parou de fingir que sabe e
passou a guardar o que ela sabe.

Cada boneco tem nome, tipo (pelúcia, boneco, chaveiro, outro), qual Pokémon é, quanto
custou e quanto ela acha que vale hoje. A lista soma os dois totais e marca com ▲ verde ou
▼ vermelho quem subiu ou caiu.

**A foto, essa eu consigo**: é a arte de uma carta do mesmo Pokémon. Quando não acho carta
com aquele nome, fica o emoji do tipo — e a tela diz por quê, em vez de deixar um quadrado
vazio sem explicação.

Vai junto no código do perfil e vira um número no cartão de treinador, como todo o resto.

## "Não atualizou o site"

Isso voltou vezes demais, e **eu não achei a causa**. Montei um servidor igual ao do
GitHub Pages — com o mesmo `Cache-Control: max-age=600` — abri o site, troquei o arquivo
por baixo e voltei. Pegou a versão nova. Testei com o `sw.js` antigo e com o novo: os dois
pegaram. A explicação fácil ("é o cache do celular") **não se sustentou no teste**.

Então não escrevi "consertado" em lugar nenhum. O que dá pra fazer sem saber a causa é
tirar o assunto das mãos de quem usa:

- **O número da versão no rodapé virou botão.** Aperta e ele apaga tudo que está guardado,
  manda o service worker se atualizar e reabre num endereço novo (`?v=...`, que o navegador
  é obrigado a buscar). Depois limpa esse `?v=` da barra, senão o link sairia com lixo
  quando alguém mandasse pro amigo. É a saída de emergência, e funciona mesmo sem eu saber
  de onde vem o problema.
- **Faixa de "chegou versão nova"** quando o service worker troca com o site aberto. Só
  aparece se já havia um antes — na primeira visita a troca não é novidade, é o normal.
- **`cache:'reload'`** ao buscar a página, e `updateViaCache:'none'` ao registrar o
  `sw.js`. Cinto de segurança, não conserto comprovado.

## Deixa teu recado

Pediram feedback. A primeira coisa a resolver não era o formulário, era o que o site **não
é**: uma página parada no GitHub Pages, sem servidor, sem banco, sem caixa de entrada. Ela
não tem pra onde mandar mensagem sozinha.

O caminho fácil seria um botão "enviar" que pisca um ✅ e não manda nada pra lugar nenhum.
Isso é a pior mentira possível aqui, porque a pessoa vai embora achando que falou com
alguém. Então a tela **diz na cara** que não recebe recado sozinha, e faz o que dá pra
fazer bem: monta o recado inteiro e entrega pronto.

Três saídas, porque as pessoas falam por lugares diferentes:

- **📋 Copiar** — cola no zap, no e-mail, onde for. Se o navegador não deixar copiar, ele
  não finge que copiou: avisa e aponta o texto pra copiar na mão.
- **📤 Mandar pra alguém** — o compartilhar do celular. Só aparece onde existe
  (`navigator.share`), porque botão que não faz nada é pior que botão que não existe.
- **🐙 Mandar pro GitHub** — abre uma issue já preenchida, título e corpo. É o único lugar
  que de fato *recebe*, e está dito que precisa de conta.

**A versão do site vai junto sem perguntar.** "O botão tal não abre" sem a versão não dá
pra consertar — pode já estar consertado. E o rascunho fica guardado no aparelho enquanto
não é mandado, porque escrever e perder é o jeito mais rápido de a pessoa não escrever de
novo.

Tocar de novo na mesma carinha tira a nota: quem errou o dedo tem que poder desfazer.

## Vale a pena abrir um pacote?

Pediram produtos: booster, pelúcia, boneco, com preço e um veredito. **Pelúcia e boneco eu
não tenho de onde tirar** — os dois bancos são catálogos de *carta*, e inventar preço de
brinquedo seria mentir. Isso o site diz na cara.

Mas a pergunta por trás — *vale a pena comprar?* — essa dá pra responder com os preços que
já estão na mão. Virou o **terceiro modo de busca**, ao lado de "pelo número" e "pelo
nome": escreve o nome de uma coleção e ele soma.

### "Cadê o vale a pena?"

Ele estava lá — terceiro botão da barrinha de busca — e mesmo assim a pergunta veio. É a
resposta certa: naquela barrinha ele parece só *mais um jeito de digitar*, e quem não sabe
que existe não vai clicar pra descobrir. Coisa que a pessoa quer **fazer** precisa de
porta, não de aba.

Então ganhou um atalho **📦 Vale a pena** junto dos outros (Coleções, Álbum, Duelo…). Ele
liga o modo, rola a tela até a busca e **já traz a lista de coleções** — não abre um campo
vazio esperando que a pessoa adivinhe o que digitar. O modo na barrinha continua ali pra
quem já sabe o nome da coleção.

Também arrumei um recado meio bobo: quando a coleção tinha pouquíssima carta, ele dizia
"achei 4 cartas, mas só 4 com preço", o que não quer dizer nada. Agora fala o que é:
achou pouca carta, e com pouca carta a conta sairia chutada.

### "Não consegui somar essa coleção"

O recado estava certo — o servidor deles respondia erro — mas **eu ajudava a provocar**.
Somar uma coleção era o pedido mais pesado do site: 250 cartas *inteiras* por página,
várias páginas, **todas disparadas no mesmo instante**. Carta inteira traz ataque, texto,
legalidade, tudo. Pra conta eu preciso de duas coisas: raridade e preço.

Quatro mudanças, da causa pro sintoma:

1. **Peço só o que uso** (`select=id,name,number,rarity,images,tcgplayer`). A resposta fica
   uma fração do tamanho: viaja mais rápido e engasga muito menos.
2. **Uma página de cada vez**, com o contador na tela. Quatro pedidos gordos simultâneos
   são o jeito mais rápido de levar erro — a pressa era minha.
3. **Insisto mais nessa chamada**: três tentativas (meio segundo, depois dois), porque aqui
   é *uma* pergunta só e perder ela derruba a tela inteira. A busca normal continua com
   duas, senão a pessoa esperaria um minuto pra ver um erro.
4. **Guardo a última coleção somada** (as três últimas). Se o site cair no meio, a conta
   sai com o preço guardado e **um aviso dizendo de quando é** — preço velho é melhor que
   tela de erro, desde que eu não finja que é o de hoje.

A lista de coleções do "vale a pena" também passou a cair na lista guardada, que é o que o
📚 Coleções já fazia. Lista de coleção muda uma vez a cada dois meses.

Efeito colateral de pedir carta enxuta: o **🏆 prêmio grande** não pode mais ser aberto
direto, porque falta metade da ficha. Ele abre pelo mesmo caminho das favoritas, que busca
a carta inteira antes de mostrar.

### Caixa, ETB e blister

Pediram produtos de novo, e dessa vez eu tinha deixado passar uma coisa óbvia: **caixa,
ETB e blister são feitos de pacote**. Sabendo quanto vale um pacote, sei quanto vale a
caixa — é multiplicação.

São quatro: pacote (1), blister (3), Elite Trainer Box (9) e caixa (36). Dá pra trocar por
botão, e **o texto digitado também escolhe**: "caixa de 151" já abre na caixa, "ETB
Obsidian" na ETB. O preço sugerido acompanha o produto, porque ninguém paga R$25 numa
caixa.

Na ETB o site avisa que vem sleeve, dado e moeda junto, e que **acessório eu não sei
precificar** — a conta é só das cartas.

**Pelúcia e boneco continuam de fora**, e por um motivo que não muda: não existe o dado.
Inventar preço de brinquedo seria pior que não ter.

A conta é **por faixa de raridade**, não a média de tudo junto: um pacote traz 4 comuns,
3 incomuns, 1 reverse e 1 rara, e não 10 sorteios iguais. A média de tudo junto seria
puxada pelas raras e prometeria um pacote que não existe.

Você digita quanto custa o pacote na tua loja e ele compara. E, o mais importante, o aviso
que fecha a tela:

> **Cuidado com a média.** Ela não é o que você vai tirar: a maior parte dos pacotes vem só
> com carta baratinha, e quem levanta a média são as poucas caras que quase ninguém tira.
> Se você quer uma carta específica, quase sempre sai mais barato comprar ela do que caçar
> em pacote. Abrir pacote é diversão, não investimento.

Um site que calcula valor esperado pra criança e não diz isso está ensinando a coisa
errada.

## Jogos

Dois, porque compartilham tudo: pegar um monte de carta, sortear e marcar ponto.

**🎲 Que carta é essa?** mostra só o desenho — o zoom corta o nome de fora — e dá quatro
nomes pra escolher. Ao responder, **o zoom sai e a carta inteira aparece**: é a parte que
ensina, e sem ela o jogo seria só acertar ou errar.

**💰 Qual vale mais?** põe duas cartas lado a lado. A explicação mostra os dois preços,
então dá pra aprender quanto as coisas valem errando.

Trocar de jogo zera o placar — misturar ponto de jogos diferentes não diria nada. O
recorde de cada um fica guardado no aparelho, separado.

### Sete jogos, e mais cartas dentro deles

Pediram mais jogos e mais cartas no "que carta é essa". As duas coisas eram o mesmo
problema por baixo.

**As cartas.** Eu pegava sempre a página 1 das coleções mais novas: as mesmas 250 cartas,
toda vez. Depois de uns minutos já eram conhecidas. Agora eu **sorteio três páginas** entre
as quarenta primeiras, o que traz umas 750 cartas e mistura coleção velha com nova — e tem
um botão **🔀 Trocar as cartas** pra quem cansou. Como o jogo usa oito campos e não a carta
inteira, peço com `select=` e a resposta vem pequena mesmo trazendo o triplo.

Uma página que falhar não derruba o jogo: ele monta com as que vieram.

**E aí eu me peguei numa mentira.** Escrevi aqui e falei em voz alta que o baralho trazia
"carta de 1999 no meio". Não trazia: eu sorteava entre as **quarenta primeiras páginas**,
um número que eu tinha chutado, e quarenta páginas são só a metade mais nova do banco. O
jogo nunca mostrou uma carta antiga.

Agora o site **pergunta**: a primeira resposta traz o `totalCount`, dele sai quantas
páginas existem de verdade (são 78, não 40), e o sorteio é em cima desse número. A tela diz
quantas coleções estão no bolso e de quantas páginas elas saíram — número na cara é mais
difícil de eu inventar.

A lista de coleções também deixou de depender de um `pageSize=250` que "dá conta hoje". Ela
lê o `totalCount` e busca o resto se houver. Passar de 250 coleções ia fazer sumir coleção
do site sem ninguém entender por quê.

**Os jogos.** De dois viraram sete, mas o código não triplicou — porque todos caem em duas
formas:

- **duas cartas, qual ganha**: 💰 vale mais, ❤️ mais HP, 📅 mais antiga, 💎 mais rara
- **olha o desenho e escolhe entre quatro**: 🎲 que carta é essa, 🎨 quem desenhou,
  ⚡ que tipo é

São duas funções, `rodadaDuas` e `rodadaQuatro`, e cada jogo é só uma receitinha: qual é a
pergunta, de onde sai o número (ou o rótulo), e o que explicar no fim. "Mais antiga" é
"mais cara" virada do avesso — mesma função, `maior: false`.

O zoom da espiadela ganhou um segundo emprego: ele esconde o nome lá em cima **e a linha do
ilustrador lá embaixo**, que é o que torna o 🎨 possível. Sem ele seria ler o rodapé.

Dois cuidados que dão trabalho e não aparecem:

- as três opções erradas têm que ser diferentes da certa **e entre si** — senão a resposta
  certa apareceria duas vezes e uma delas contaria como erro;
- quando a pessoa erra, **a certa fica verde**. Antes só o botão tocado ficava colorido, e
  quem errava não via qual era a resposta.

## Duelo

Duas cartas lado a lado, com o dano **calculado como no jogo**: a fraqueza multiplica (ou
soma) e a resistência desconta. Mostra quantos golpes cada uma precisa pra derrubar a
outra, e põe 👑 em quem ganha cada linha do placar — vida, golpe mais forte, preço.

A conta que ninguém faz de cabeça direito: Charizard bate 180, o Blastoise resiste a fogo
(−30), dá **150**. O Blastoise bate 130, mas o Charizard é fraco a água (×2), dá **260**.

Ataque com efeito de texto ("mais 30 se…") entra só pelo valor base, e a tela diz isso:
eu não sei se a condição valeu.

Um defeito que o teste pegou: `cartaCheia` decidia "já tenho os dados" olhando `c.hp` — e a
identidade guardada **tem** HP. O duelo mostrava vida e nenhum ataque. Agora a checagem é
`__soIdentidade`, que é o que de fato marca uma carta guardada.

## Minha coleção

Cada cartinha ganhou um ⬜ no canto oposto ao da estrela, pra marcar "eu tenho esta". Na
tela de uma coleção aparece uma **barra de quanto falta**, com "12 de 165 · 7% completa" e
um 🎉 quando fecha.

Duas decisões:

- **A conta é sobre a coleção inteira, não sobre o que está filtrado na tela.** Filtrar por
  "holo" e ver 100% seria mentira confortável.
- Aqui guardo **só o id** da carta, não a carta inteira como nas outras listas: é marcação
  em massa, e uma coleção grande faria o código do perfil virar um monstro.

Vai no código junto com o resto, então a coleção acompanha a pessoa pro outro aparelho.

## Cartão de treinador

O perfil virado carta: fundo escolhido entre oito, símbolo, nome, três números e as
favoritas em miniatura. Os números são **contados na hora** a partir das favoritas
guardadas — quantas cartas, de quantas coleções diferentes, e o ano da mais antiga.

Preço não entra: as favoritas guardam só a identidade da carta, e somar preço aqui exigiria
buscar cada uma. Melhor três números certos do que quatro com um inventado.

Mexer no símbolo ou no fundo redesenha o cartão na hora — senão a pessoa escolheria às
cegas e só veria o resultado depois.

### As 3 preferidas e a lista de desejos

Duas listas novas ao lado das favoritas, e as três guardam a mesma coisa: só a identidade
da carta, nunca o preço.

- **🥇 As 3 preferidas** têm teto de três. Quando enche, o botão **diz** que encheu e onde
  tirar uma — recusar calado faria o botão parecer quebrado. Elas aparecem grandes no
  cartão, e saem de lá pelo perfil.
- **💖 Quero essa carta** é a lista de desejos, com tela própria. Ela vai no código, que é
  o que torna a troca possível: o amigo vê o que você tem e o que você quer.

Colar um código junta as favoritas e os desejos, mas **não as preferidas**: são três, e
são dele. Trocar as minhas pelas dele seria mexer onde não devo.

### Onde a pessoa mora — e por que só o estado

Pediram localização pra trocar carta com gente perto. **Foi feito só até onde é seguro:**
um seletor com os 27 estados, escolhido à mão, com "prefiro não dizer" como primeira
opção.

**O site não pede nem usa GPS, em lugar nenhum.** GPS aponta pra porta da casa, e quem usa
isto é criança. Estado é grosso o bastante pra não localizar ninguém e fino o bastante pra
saber se dá pra trocar perto — e ele só sai daqui dentro do código, que a pessoa entrega a
quem ela escolhe.

O que **não** existe e não vai existir aqui: um lugar onde estranhos veem o teu cartão.
Isso precisaria de servidor, e um site de criança não é lugar pra juntar gente
desconhecida com a localização de menores.

### Espiar o cartão de um amigo

Colar o código de alguém tem dois botões, e a diferença é o ponto: **"só ver o cartão
dele"** mostra o cartão e as cartas sem encostar nas tuas, e **"trazer as cartas pra cá"**
é que junta. Ver antes de decidir é o mínimo.

## Álbum

As favoritas como num fichário de verdade: **nove por página**, e os buraquinhos vazios
aparecem — é isso que dá vontade de preencher. Dá pra folhear, e tocar numa carta abre ela
com o preço de hoje.

Um detalhe de CSS que custou caro: o buraco tem `aspect-ratio:245/342`, mas com a imagem
em `flex:1 1 auto` a altura natural dela entrava na conta e a última fileira **vazava por
baixo da folha**. Com `flex-basis:0` a imagem para de opinar sobre a altura e o buraco
obedece a proporção.

## Linha do tempo

Todas as cartas que um Pokémon já teve, **agrupadas por ano**, da mais velha à mais nova.
É o jeito de ver o desenho dele mudando ao longo das coleções. O botão fica na tela da
carta, e só aparece em Pokémon — treinador e energia não têm uma história dessas pra contar.

A busca usa só a primeira palavra do nome ("Charizard ex" → "Charizard"), senão as outras
cartas dele ficariam de fora.

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

### Top 10 mais caras

Uma ordem a mais na fileira, que é "mais caras" **cortada no décimo**. O corte é o que
faz dela um top: sem ele, é a mesma lista inteira em outra ordem.

### Link da carta

Cada carta tem um endereço próprio (`#carta=<id>`), pra mandar pro amigo. O botão
"🔗 Copiar link" copia, e quando o navegador não deixa copiar (acontece), ele mostra o
link já selecionado pra copiar na mão.

**O link não leva o preço junto**, só o id, o idioma e em qual banco a carta estava: o
preço é buscado na hora de abrir, senão quem recebesse o link veria um preço de meses
atrás.

O endereço acompanha a carta aberta, então o botão de voltar do navegador funciona. E
trocar só o pedaço depois do `#` não recarrega a página, então quem chega por um link já
estando numa carta depende do `hashchange` — que compara o id pra não reabrir a mesma
carta quando fui eu quem mexeu no endereço.

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
- **⭐ ex estrela** — o único botão que aparece **sem ter carta nenhuma**. É o jeito de
  dizer "ainda não saiu" em vez de simplesmente não existir na tela. Clicando, vem um
  aviso explicando, e no dia em que as cartas entrarem nos bancos ele passa a funcionar
  sozinho, sem ninguém mexer no site. Como não dá pra saber que nome os bancos vão dar,
  ele procura várias escritas (`ex ★`, `★ ex`, `Star ex`, `ex Star`, `ex estrela`) no
  subtipo, no nome e na raridade
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

## Todas as cartas do TCG

Um botão que abre o catálogo inteiro, sem precisar procurar nada. São mais de vinte mil
cartas, então baixar tudo de uma vez seria minutos de espera e um celular travado: vêm de
**250 em 250**, das mais novas pras mais velhas, e quem quiser mais pede mais.

São dois botões diferentes no fim da grade, e a diferença importa: **"mostrar mais 60"**
mostra mais das que já estão aqui, **"buscar mais 250 no banco"** vai buscar cartas novas
lá fora. O segundo só aparece depois que todas as que já vieram estão na tela — senão a
pessoa pediria mais sem ter visto o que já tem.

E depois de buscar mais, a grade continua mostrando o que mostrava: voltar pras 60
primeiras obrigaria a clicar tudo de novo pra chegar onde estava.

## Link que já abre numa busca

`#busca=25` abre o site com a lista pronta. Serve pra mandar uma busca pro amigo — e
serve pra combinar "abre exatamente esta tela" com alguém, que sem isso não havia como
garantir.

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

## Escolher o idioma da carta

Um seletor em cima da busca: 🇺🇸 Inglês, 🇧🇷 Português, 🇯🇵 Japonês, 🇪🇸 Espanhol,
🇫🇷 Francês, 🇩🇪 Alemão, 🇮🇹 Italiano, 🇰🇷 Coreano e 🇹🇼 Chinês. A escolha fica guardada
no aparelho.

O que muda por dentro: **o banco principal só fala inglês**. Fora do inglês ele nem é
consultado, e a busca vai direto pro reserva, que é multilíngue. Vale pras coleções também.

Dois cuidados:

- **O português está em `pt-br` num lugar e `pt` em outro**, e não dá pra saber daqui qual
  existe. Então cada idioma carrega uma lista de escritas, tentadas em ordem, e a primeira
  que responder ganha — um 404 numa não derruba a busca. O mesmo vale pro espanhol
  (`es`/`es-mx`) e pro chinês (`zh-tw`/`zh-cn`).
- **Trocar de idioma limpa a tela.** O que estava ali era do idioma antigo, e deixar
  misturado seria mentira. Entra um aviso dizendo o que mudou.

### Não achar no idioma escolhido não pode virar tela vazia

Esse foi um erro meu, pego em uso: quem trocava pro português e procurava não via nada, e
parecia que o site tinha quebrado. Tecnicamente estava certo — não há carta em português
cadastrada — mas "tecnicamente certo" e "inútil" são a mesma coisa pra quem está olhando.

Agora, quando o idioma escolhido não devolve nada, **o site procura em inglês sozinho** e
diz o que fez, num recado em cima da lista. O "não achei" de verdade só aparece quando nem
o inglês tem, e aí ele diz que procurou nos dois.

### O português que dá pra ter

O nome da carta vem do banco, então em português só existe o que estiver cadastrado lá.
O que **não** depende disso, o site traduz: os tipos de energia, o tipo da carta e agora
também a **raridade** — "Rare Holo" vira "Rara holográfica", "Double Rare" vira "Rara
dupla", e assim por diante. A raridade chega em inglês mesmo em carta de outro idioma.

A etiqueta de origem passa a mostrar o idioma escolhido em vez do palpite de país, porque
aí não é palpite: você pediu aquele idioma.

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

## A carta no jogo

Ataques, habilidade, fraqueza, resistência, recuo e "evolui de" já vinham junto com a
carta desde o primeiro dia — e eu jogava tudo fora, mostrando só o preço. Agora a tela da
carta traz a ficha inteira, com o custo de energia em bolinhas (🔥🔥) e o dano em destaque.

Treinador e energia não têm nada disso, então neles o bloco simplesmente não aparece, em
vez de mostrar uma ficha vazia.

## Pode usar em torneio?

A API diz se a carta vale no **Padrão**, no **Expandido** e no **Ilimitado**, e traz a
**marca de regulação** (a letrinha no cantinho). A tela mostra os três com ✅ / ❌ / 🚫
(banida), mais uma explicação do que cada formato quer dizer — que é a parte que ninguém
nasce sabendo: Padrão é onde se joga campeonato e só aceita carta dos últimos anos,
Expandido aceita carta bem mais velha, Ilimitado aceita tudo.

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

## Claro e escuro

O site era branco brilhante, e ele é usado de noite, no quarto. Agora tem modo escuro.

Ele **segue o aparelho** por padrão. O botão 🌙/☀️ no canto do topo manda mais alto que o
aparelho a partir do momento em que a pessoa aperta — quem apertou quis aquilo, e o
sistema não tem que discordar depois.

Pra isso, **toda cor virou token**. Antes havia trinta e nove cores soltas no meio do CSS,
e modo escuro com cor solta é caça ao tesouro. Agora o tema escuro é só a mesma lista de
nomes com outros valores.

Duas coisas que só apareceram olhando a tela escura de verdade:

- o ícone da Butterfree tem um fundo claro, que some no modo claro e vira uma **caixa
  branca** no escuro. O `icone.svg` continua com fundo (ícone de aplicativo sem fundo fica
  feio na tela do celular) e o cabeçalho passou a usar um `icone-limpo.svg` sem ele.
- o campo do dólar não declarava fundo, então o navegador punha branco — e o número ficava
  **branco no branco**. Todo campo agora declara o seu.

A barra do navegador no celular (`theme-color`) acompanha o tema, senão fica uma faixa
clara em cima de uma página escura.

### O topo

Passou por duas rodadas. Primeiro eram seis botões roxos iguais que roubavam a atenção da
busca, e viraram contorno. Depois viraram **oito**, e contorno já não bastava: oito botões
largos, um do lado do outro, são uma parede de texto.

Agora são **ícone em cima, nome curto embaixo**, quatro por fileira (três em telas bem
estreitas). Cabem em duas fileiras e leem-se de relance, em vez de exigir leitura.

O resto da rodada foi tirar peso:

- a caixa de busca tinha uma moldura de 3px que gritava mais alto que o conteúdo. Virou
  superfície: fundo, sombra suave, borda de 1px
- os três modos viraram **um trilho só**, com a aba ativa deslizando dentro — menos caixa,
  mais "escolhe um destes"
- o campo de busca cresceu e ganhou um anel de foco, porque é o que a pessoa vem fazer
- a dica e o seletor de idioma ficaram menores e mais claros: são apoio, não o assunto

Isso é separado do claro/escuro — modo escuro é outra coisa, e já existia.

## A lista de coleções fica guardada

Relato: "não consegui pegar as coleções", com a internet boa. Os dois bancos fora do ar ao
mesmo tempo, e o site não tinha o que mostrar.

A lista de coleções muda umas poucas vezes por ano, então guardar a última que deu certo
quase não envelhece — e é a diferença entre uma tela de erro e um site que continua
servindo. Quando os dois falham, ele mostra a lista guardada e **diz de quando ela é**.
Abrir uma coleção ainda precisa de internet, e a tela avisa.

Guardo só nome, logo e tamanho. **Preço nunca**: preço guardado envelhece e mente.

## Quando dá erro

Um relato de uso: *"Não consegui abrir essa favorita 📡 — HTTP 500"*. Duas coisas erradas
ali, e nenhuma era o visual.

**A primeira: desistir cedo demais.** Erro 500 é soluço do servidor deles, não pedido
errado meu — e `pedirJSON` agora tenta de novo uma vez, meio segundo depois. Só isso
resolve a maior parte. O 429 fica de fora da regra: ali insistir só piora.

**A segunda: abrir uma favorita tinha um caminho só.** Agora tem três — o catálogo
principal, o reserva, e a busca pelo nome (que pega o caso do id ter mudado). E se os três
falharem, **a carta aparece assim mesmo**, do jeito que foi guardada, com um recado
dizendo que o preço de hoje não veio. O nome e a foto eu já tenho; uma carta sem preço é
melhor que uma tela de erro.

**A terceira, que o meu próprio teste pegou:** com o principal fora do ar e o reserva
respondendo vazio, a tela dizia "procurei nos dois e nenhum tem". Mentira — um deles nunca
respondeu, e pode muito bem ter a carta. Agora esse caso tem tela própria.

### A tela de erro

Antes era um parágrafo vermelho com `HTTP 500` no fim, que não diz nada a ninguém. Agora
responde as três perguntas que a pessoa realmente tem: **o que houve, de quem é a culpa, e
o que fazer agora** — com botão de **tentar de novo** e o detalhe técnico guardado atrás
de um "detalhe técnico" pra quem quiser.

Os códigos viram português: 5xx é problema do lado deles, 429 é limite do dia, 404 é carta
fora do catálogo, e falha de rede com `navigator.onLine === false` vira "teu aparelho está
sem internet".

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
- **Dá pra digitar o número completo, `10/124`.** É como ele vem impresso na carta: o 10 é
  ela, o 124 é o tamanho da coleção. Com os dois, a busca sai de umas duzentas cartas
  "número 10" pra quase sempre uma só. A consulta usa `set.printedTotal`, e tenta também
  `set.total` — porque carta secreta existe, e uma **125/124** é numerada acima do total
  impresso. Quando nem assim acha, larga o `/124` e traz todas as número 10, **dizendo que
  fez isso**: quem pediu uma carta e recebeu duzentas precisa saber por quê.
  O campo deixou de ser `inputmode="numeric"`, senão a barra não existe no teclado do
  celular.
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
