# Fala ao Contrário 🎙️🔁

Site pra gravar a sua voz e ouvir **de trás pra frente**.

🔗 https://willianwiab.github.io/contas-wen/fala-ao-contrario/

## Como usar
1. Aperte o botão vermelho e deixe o site usar o microfone.
2. Fale alguma coisa (até 12 segundos) e aperte de novo pra parar.
3. A voz toca ao contrário na hora. Tem também:
   - ▶️ **Normal**: do jeito que você falou
   - 🐿️ **Esquilo ao contrário**: rápido e fininho
   - 👹 **Monstro ao contrário**: devagar e grossão
   - 💾 **Baixar**: salva um arquivo `.wav`
4. 🏆 **Desafio**: fale a palavra escrita ao contrário e toque 🔁. Se você falou direitinho, sai a palavra certa!

## Privacidade
A gravação fica **só no aparelho**. Nada é enviado pra internet, e ela some quando você fecha a página (a não ser que você baixe).

## Como funciona por dentro
`MediaRecorder` grava, `decodeAudioData` transforma o som em uma fila de números, e o site inverte essa fila e toca com o Web Audio.
