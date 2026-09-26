# Fala ao Contrário 🎙️🔁

Site pra gravar a sua voz e ouvir **de trás pra frente**.

🔗 https://willianwiab.github.io/contas-wen/fala-ao-contrario/

## Como usar
1. Aperte o botão vermelho e deixe o site usar o microfone.
2. Fale alguma coisa (até 12 segundos) e aperte de novo pra parar.
3. A voz toca ao contrário na hora. Use 🔁 **Ao contrário** / ▶️ **Pra frente** pra escolher a direção.
   - 🔊 **Tocar de novo** e 💾 **Baixar** (arquivo `.wav`)
   - 🎭 **100 vozes**: 20 jeitos (robô, caverna, telefone, fantasma, alienígena, videogame, dragão…) × 5 tamanhos (normal, bebê, esquilo, grandão, monstro). Tem ⬅️ ➡️ pra passar por todas e 🎲 surpresa.
4. 🏆 **Desafio**: fale a palavra escrita ao contrário e toque 🔁. Se você falou direitinho, sai a palavra certa!

## Privacidade
A gravação fica **só no aparelho**. Nada é enviado pra internet, e ela some quando você fecha a página (a não ser que você baixe).

## Como funciona por dentro
O microfone manda o som como uma fila de números (Web Audio). O site inverte a fila, aplica o efeito da voz escolhida (velocidade, filtros, ecos, reverb, ondinha do robô…) e toca como WAV num `<audio>`, que funciona até com o iPhone no silencioso.

## Não deu certo?
Permita o microfone, aumente o volume, abra no Chrome/Safari (fora de outros apps) e use o botão 🔊 **Testar o som** na parte “😕 Não deu certo?”.
