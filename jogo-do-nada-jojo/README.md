# 🥸 Jogo do Nada — do JoJo

O jogo é do JoJo. Isto aqui é ele guardado no repositório, do jeitinho que ele
fez: **um arquivo só**, sem nada mudado.

> ⚠️ Não confundir com [`o-jogo-do-nada/`](../o-jogo-do-nada/). São dois jogos
> diferentes com a mesma ideia: lá o cronômetro conta quanto tempo cê aguenta
> sem encostar; aqui, **fazer coisa é o caminho** — é fazendo coisa que a
> história anda.

## A tarefa

Um emoji 😄 aparece e te dá uma tarefa só: **não faça nada**. Cê vai fazer
alguma coisa. O contador no canto marca cada uma, e ele vai ficando bravo.

## A corrente inteira

Cada coisa destrava a próxima — e o jogo não explica nenhuma:

| O que acontece | Como se destrava |
|---|---|
| A logo **vira prata** | 10 coisas feitas |
| Aparece uma **fogueira** | junto com a prata, no canto |
| A logo **pega fogo** e vira **obsidiana** | arrastar a fogueira em cima da logo |
| As quatro letras **soltam** | com a obsidiana |
| Abre um **portal** | uma letra em cada canto de um quadrado, **com a fogueira dentro** |
| **O outro mundo** | entrar no portal |
| Chove **squishy** | cada clique no emoji lança um |
| O emoji vira o **SQUISHYMAN** | dez squishies na tela |
| O chefe cai | arrastar as partes dele pra longe do corpo — seis vezes |
| Sobra o **vazio branco** | depois que ele cai |
| Aparece uma **placa**: *não clique* | ele avisa, e cê vai clicar |
| A placa **vira pincel** | clicando nela |
| Aparece o **MAGO SUPREMO** com ❤️ ∞ vidas | depois de umas 80 pinceladas |
| **Ele morre de bigode** | pintar em cima da boca dele até 60 |
| Vira uma **espada** | arrastar o **1** em cima do **0** do "10 min" |
| Acorda **O NADA** | espada no mago |
| Fim | clicar 15 vezes na boca do NADA |

## A segunda metade — depois do "Fim."

O `Fim.` do NADA não era o fim. Num jogo em que a placa manda não clicar e o
botão de fechar não fecha, o "acabou" também tinha que ser mentira.

| O que acontece | Como se destrava |
|---|---|
| Sobem os **créditos** | depois do NADA cair |
| Aparece **FECHAR O JOGO** | uns segundos de créditos |
| O botão **não fecha** nada | apertar três vezes derruba as letras dos créditos |
| Dez **letras caídas** e quatro vagas | com a queda |
| **O NADA 2: O RETORNO** | escrever **NADA** de novo, arrastando as letras certas |
| **🛡️ Escudo infinito** | tirar as 10 vidas dele clicando nas duas bocas |
| Ele vira 🥸 e murcha | arrastar o **bigode** em cima dele — clique não passa no escudo, bigode passa |
| Um **botão de desligar** que foge do dedo | com a morte dele |
| **Fim de verdade** | pegar o botão três vezes: a tela apaga igual televisão velha |

No fim, o jogo te mostra o número que estava contando desde o começo:
**quantas coisas cê fez pra não fazer nada**.

O bigode venceu de novo, e é de propósito: é a regra do jogo. Vida infinita não
resolve nada contra bigode.

## O melhor pedaço

O mago tem **vida infinita** e fala isso na tua cara. Não tem como tirar vida
dele. O que derruba ele é **pintar um bigode** — porque aí ele vira 🥸, e um
mago de bigode não é mais o mago.

> *"...eu tinha vida infinita mas... o bigode... me venceu."*

## Por dentro

Um arquivo só: HTML, CSS e JavaScript juntos. Os sons são feitos na hora pelo
próprio navegador (`AudioContext`), sem nenhum arquivo de música. A pintura é
um `<canvas>` por cima da tela, e a área do bigode é medida em cima de onde o
emoji do mago está na hora — por isso funciona em qualquer tamanho de tela.

Não guarda nada: fechou, recomeça. O botão *voltar ao início* recarrega a página.

## Arquivos

| Arquivo | O que faz |
|---|---|
| `index.html` | o jogo inteiro |
| `teste-depois-do-fim.js` | joga sozinho as quatro fases novas, pra conferir que nenhuma travou |

---

Feito pelo **JoJo**, 2026. A segunda metade veio depois, a pedido dele — *v3, agora com o dobro de nada*.
