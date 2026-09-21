# Olho na Carta

Um site pra não levar carta Pokémon falsa pra casa, e pra não sair perdendo numa troca.

Mora em `olho-na-carta/`, é uma página só, funciona no celular e continua funcionando
sem internet depois de aberta — que é justamente quando você precisa dele: sentado na
mesa da loja, com a carta na mão.

## As quatro coisas que ele faz

**O teste na mão.** Dez conferências, uma de cada vez, com caixinha pra marcar. Teste da
luz, borda de perfil, verso comparado, textura, fonte e acento, holo, número da coleção,
custo de energia, peso, e a mais importante: se a pessoa deixa você tirar da sleeve. As
marcações ficam guardadas no aparelho.

**Compare o verso pela câmera.** Você fotografa o verso da carta suspeita e o de uma que
sabe ser original, e o site mede a cor média das duas e diz a distância entre elas. É o
teste do verso feito com número em vez de olho — a olho nu essa diferença some.

**A balança da troca.** Você põe as cartas dos dois lados, e ele soma e diz quem está
saindo ganhando, com alerta quando tem carta cara sem graduação ou quando um lado é uma
carta só contra um monte.

**Onde trocar.** As lojas com Liga Pokémon perto de Santo André, com endereço e horário.

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

## O que ele não faz

Não diz se a carta é original. Não sabe o estado da sua carta (NM, played, danificada),
e estado muda o preço inteiro. Não é cotação de loja brasileira.

Existe uma versão com análise por IA, que olha a foto da carta e aponta os sinais — essa
roda dentro do Claude, não aqui, porque precisa de um modelo respondendo do outro lado.
