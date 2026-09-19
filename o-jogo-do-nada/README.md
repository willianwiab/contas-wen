# 🫥 O Jogo do Nada

O objetivo é **não fazer nada**. Um cronômetro conta há quanto tempo cê não encosta em
nada. Encostou em qualquer lugar — tela, tecla, rolagem — volta pro zero.

## Por que isso é um jogo

Um jogo sobre nada só funciona se **fazer nada for difícil**. Ficar parado olhando um
número subir não é jogo nenhum.

Então o jogo passa o tempo inteiro **te tentando**. São dez tentações, em ordem de
descaramento:

| Aos | O que aparece |
|---|---|
| 6s | um botão vermelho pulsando: **"NÃO APERTE ESTE BOTÃO"** |
| 16s | um bichinho atravessando a tela |
| 26s | **"CÊ GANHOU UM PRÊMIO! Toque pra receber"** (cê não ganhou nada) |
| 38s | uma notificação falsa: *"oi, cê tá aí?"* |
| 52s | uma caixa de **erro falsa** com um botão OK |
| 70s | uma borboleta |
| 88s | **"Prêmio secreto em 5…"** — a contagem termina em "era mentira" |
| 110s | a tela **apaga**: *"toque pra acender a luz"* |
| 140s | **"FIM DE JOGO — CÊ VENCEU! Toque pra ver teu troféu"** (o jogo não acabou) |
| 180s | nada. O jogo desiste de te tentar. Por enquanto. |

Todas são armadilha. Encostar em qualquer uma é encostar na tela.

## Três decisões que fazem diferença

**A tentação nunca tapa o cronômetro.** No primeiro teste o botão vermelho ficava bem em
cima do número — e o número é o que segura a tensão. Ele aparece em cima ou embaixo, nunca
no meio. Conferido em seis tamanhos de tela.

**Sair da aba PARA o cronômetro.** Senão o jogo se ganharia sozinho: bastava minimizar e
ir viver a vida. Fazer nada é estar ali parado, e o jogo diz isso na cara quando cê volta.

**O toque que te derruba não recomeça o jogo.** O botão "tentar de novo" nasce travado por
sete décimos de segundo — senão o mesmo dedo que perdeu já começaria outra partida sem
querer.

## O que o jogo guarda

Teu **recorde**, as **nove medalhas** (5s, 15s, 30s, 1min, 2min, 5min, 10min, 30min, 1h),
quantas vezes cê tentou — e **o que mais te derruba**. Essa última é a melhor: depois de
umas partidas o rodapé te conta que o botão vermelho já te pegou seis vezes.

## O único prêmio por aguentar

O fundo vai clareando. Aos 10 segundos, aos 30, ao minuto, aos dois, aos cinco. É o único
sinal de que cê está indo bem — e é o único que não pede nenhum toque.

## Por dentro

Um ouvinte só, capturando `pointerdown`, `keydown`, `wheel`, `touchstart` e o menu do botão
direito na página inteira. Enquanto o jogo corre não existe botão nenhum pra apertar de
propósito, então qualquer um desses eventos significa a mesma coisa: cê fez alguma coisa.

Guarda no `localStorage` deste aparelho, sem conta nem senha, e funciona offline.

## Arquivos

| Arquivo | O que faz |
|---|---|
| `index.html` | A tela e o estilo |
| `nada.js` | O cronômetro, as tentações e as medalhas |
| `sw.js` | Guarda o jogo pra abrir sem internet |
| `manifest.webmanifest` | Deixa instalar como aplicativo |
| `icone.svg` | Uma cara sem boca |
