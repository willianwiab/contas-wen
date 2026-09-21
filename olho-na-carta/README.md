# Olho na Carta

Um site pra não levar carta Pokémon falsa pra casa, não sair perdendo na troca, e
lembrar de quem já te passou a perna.

Mora em `olho-na-carta/`, é uma página só, funciona no celular e continua funcionando
sem internet depois de aberta — que é justamente quando você precisa dele: sentado na
mesa da loja, com a carta na mão.

## O que ele faz

**O teste na mão.** Dez conferências, uma de cada vez, com caixinha pra marcar. Teste da
luz, borda de perfil, verso comparado, textura, fonte e acento, holo, número da coleção,
custo de energia, peso, e a mais importante: se a pessoa deixa você tirar da sleeve.

**Câmera: lupa e cor do verso.** Você fotografa o verso da carta suspeita e o de uma que
sabe ser original, e o site mede a cor média das duas e diz a distância entre elas. É o
teste do verso feito com número em vez de olho. Depois toca na foto e amplia até 8×,
arrastando pra andar pela carta — acento do "Pokémon", símbolo ©, fio da borda.

**Antes de trocar com ele.** Cinco checagens de reputação, com link pra onde ela mora, um
campo pro nome da pessoa e um pras suas anotações.

**Procurar carta.** Busca pelo código do canto de baixo (`25/111`), pelo nome em inglês,
ou pelos dois (`Charizard 4/102`). Cada resultado vira quatro botões: tenho, quero, você
dá, você recebe.

**Minha carteira.** Duas listas, "tenho" e "quero", com preço de cada carta e total. Uma
carta que você quer vem marcada quando aparece numa busca.

**A balança da troca.** Põe as cartas dos dois lados e ele diz quem está saindo ganhando,
com alerta quando tem carta cara sem graduação ou quando um lado é uma carta só contra um
monte. As cartas que você já tem viram botão de atalho.

**Trocas que você já fez.** Fechou a troca, ela vira uma linha: data, com quem, o que
saiu, o que entrou, e a diferença. Em cima de tudo, o saldo desde o começo — o de uma
troca sozinha diz pouco, porque todo mundo perde uma aqui e ganha outra ali; o que mostra
se você está aprendendo a negociar é a soma.

**A coleção inteira.** Escolhe a coleção e vê as cartas dela em grade, as que você tem
coloridas e as que faltam apagadas. Toca numa pra marcar. Em cima: quantas de quantas, e
quanto vale a sua parte contra a coleção toda. Depois de baixada uma vez ela funciona
offline — que é quando você está na loja, sem sinal, decidindo se compra.

**Onde trocar.** As lojas com Liga Pokémon perto de Santo André, com endereço e horário.

## A função que eu não fiz do jeito que foi pedida

O pedido era uma IA que procurasse a pessoa que quer trocar com você e dissesse se ela é
confiável. Eu fiz outra coisa, e vale explicar por quê.

Uma IA que recebe o nome de um desconhecido e devolve um veredito sobre o caráter dele
**está chutando**. Ela não conhece a pessoa. E os dois erros possíveis são graves: marcar
como golpista alguém honesto, ou — pior — dar confiança num golpista de verdade. O
segundo é o que faz perder a carta, porque quem confia baixa a guarda. Uma função dessas
é mais perigosa que função nenhuma.

Então a tela "Antes de trocar com ele" não julga ninguém. Ela leva você aos lugares onde
a reputação de verdade existe: a nota no marketplace da Liga Pokémon, o dono da loja que
vê o cara toda semana, a thread de caloteiro no grupo, o tempo que ele aparece. Quem
decide é você — o site só garante que nenhuma checagem foi pulada com pressa.

## Por que a medição de cor é honesta sobre o que não sabe

A diferença de cor entre duas fotos tiradas em luz diferente é **maior** que a diferença
entre uma carta original e uma falsa boa. Então o número sozinho não decide nada, e o
site diz isso na tela, do lado do resultado: só vale se as duas fotos forem tiradas
juntas, na mesma luz.

E mesmo quando bate, ele responde "azul bate", nunca "é original". Não existe teste único
que prove autenticidade — existe uma pilha de sinais. Um site que dissesse "original"
depois de uma foto estaria mentindo pra alguém que vai gastar dinheiro de verdade.

## De onde vem o preço

Da `api.pokemontcg.io`, a mesma fonte do ButterPoke, sem chave. Ela devolve preço do
TCGplayer em dólar e do Cardmarket em euro — mercado de fora, não loja brasileira, que
costuma cobrar mais.

A cotação do dólar e do euro **você digita**, e ela fica guardada no aparelho. Eu não
tenho de onde buscar câmbio aqui, e deixar um número fixo no código envelheceria em um
mês e viraria mentira sem ninguém perceber.

O mesmo vale pro ajuste de loja brasileira. Loja daqui cobra mais que o mercado lá fora,
mas quanto mais depende da loja, da carta e do mês — não existe número certo pra embutir.
Então ele é um campo que você regula, e a tela mostra **os dois preços lado a lado**: o de
fora, que é o dado real, e o estimado daqui, que é o seu chute em cima dele. Mostrar só o
ajustado esconderia que é chute; mostrar só o de fora daria um número que não é o que você
vai pagar na loja.

A busca pelo código manda o filtro do total da coleção numa consulta separada da
principal. A máquina onde isso foi escrito não alcança a API, então não deu pra confirmar
que ela aceita `set.printedTotal`. Em vez de apostar, a busca tenta com o filtro e, se
voltar vazio, repete uma vez sem ele — funciona dos dois jeitos, no pior caso com mais
coleções na lista.

## Onde ficam os seus dados

No seu aparelho, no `localStorage`, e em lugar nenhum mais. Não tem conta, não tem
servidor, ninguém além de você vê. Se limpar os dados do navegador, some.

## O que ele não faz

Não diz se a carta é original. Não diz se a pessoa é honesta. Não sabe o estado da sua
carta (NM, played, danificada), e estado muda o preço inteiro. Não é cotação de loja
brasileira.

Existe uma versão com análise por IA, que olha a foto da carta e aponta os sinais — essa
roda dentro do Claude, não aqui, porque precisa de um modelo respondendo do outro lado.
