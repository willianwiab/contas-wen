# Fala ao Contrário 🎙️🔁

Site pra gravar a sua voz e ouvir **de trás pra frente**.

🔗 https://willianwiab.github.io/contas-wen/fala-ao-contrario/

## Como usar
O site tem **abas** embaixo: 🎙️ Gravar · 🎭 Vozes · ✂️ Editar · 🎹 Teclado · 🦜 Brincar (papagaio, desafio, eco ao vivo) · ⭐ Salvos. Fora da aba Gravar, um mini player mostra o que está tocando.

1. Aperte o botão vermelho e deixe o site usar o microfone — ou toque em 📂 **Pegar um áudio do celular** (mp3, m4a, wav, ogg ou vídeo; até 10 minutos), ou cole um 🔗 link direto de um arquivo de áudio. Gravando, dá até 5 minutos.
2. Fale alguma coisa (até 12 segundos) e aperte de novo pra parar.
3. A voz toca ao contrário na hora. Use 🔁 **Ao contrário** / ▶️ **Pra frente** pra escolher a direção.
   - Barrinha que mostra quanto já tocou (dá pra arrastar), com ⏸️/▶️, e o desenho da voz vai ficando colorido
   - 🔊 **Tocar de novo**, ⬇️ **Baixar** (arquivo `.wav`) e 📤 **Compartilhar a voz** (abre a lista de apps do celular; se não der, baixa o arquivo)
   - ⭐ **Salvar no site**: guarda o áudio (com a voz e a mesa escolhidas) em “Meus áudios salvos”, mesmo fechando a página. Dá pra abrir ▶️, mudar o nome ✏️ e apagar 🗑️
   - ⚙️ **Configurações de gravar**: contagem 3/5/10 segundos antes de gravar, com ou sem bip
   - 🔊 **Volume** (0–200%, vale também pra baixar e compartilhar)
   - 🦜 **Papagaio**: fica ouvindo e repete sozinho quando você para de falar (ao contrário, igualzinho ou com a voz escolhida); configura sensibilidade e silêncio
   - 🎤 **Eco ao vivo**: fala e escuta na hora com eco, robô, caverna, telefone, alienígena ou megafone (use fone de ouvido)
   - 🔀 **Embaralhar**: mistura pedacinhos do áudio (tamanho configurável, pode inverter alguns)
   - ❤️ **Vozes favoritas** pra achar rápido
   - 🎹 Teclado com 5 músicas (Brilha brilha, Parabéns, Ode à alegria, Frei Martinho, Maria tinha um carneirinho) e ⏺️ gravar o que tocou (vira áudio salvo)
   - 🖼️ **Capa** dos áudios salvos: figura e cor
   - 🔂 **Repetir sem parar** (botão ao lado da barrinha)
   - ✂️ **Cortar**: escolha um pedaço com Começo/Fim pra ouvir, ficar só com ele, ou deixar **só aquele pedaço ao contrário**; tem ↩️ Desfazer
   - 🎹 **Teclado de voz**: 8 teclas brancas + 5 pretas tocam a sua voz em notas (A S D F G H J K no computador), com grosso/fino e a música “Brilha, brilha, estrelinha”
   - 🧩 **Juntar**: gruda dois áudios salvos, um depois do outro
   - 🎛️ **Mesa de efeitos**: tom, velocidade, eco, salão, robô e grave, que somam com a voz escolhida
   - 🎭 **280 vozes**: 56 jeitos (DJ arranhando, derretendo, vai e volta, multidão, harmonia, câmera lenta, robô cantor…) — antes 40 jeitos (robô, caverna, telefone, fantasma, pato, abelha, zumbi, gaguejando, disco voador, choque elétrico…) × 5 tamanhos (normal, bebê, esquilo, grandão, monstro). Tem ⬅️ ➡️ pra passar por todas e 🎲 surpresa.
4. 🏆 **Desafio**: fale a palavra escrita ao contrário e toque 🔁. Se você falou direitinho, sai a palavra certa!

## Privacidade
A gravação fica **só no aparelho**. Nada é enviado pra internet (só se você mesmo compartilhar), e ela some quando você fecha a página (a não ser que você baixe).

## Como funciona por dentro
O microfone manda o som como uma fila de números (Web Audio). O site inverte a fila, aplica o efeito da voz escolhida (velocidade, filtros, ecos, reverb, ondinha do robô…) e toca como WAV num `<audio>`, que funciona até com o iPhone no silencioso.

## Não deu certo?
No computador: escolha o microfone em ⚙️ Configurações de gravar → Qual microfone e use 🎙️ **Testar o microfone** em “😕 Não deu certo?”. O site também grava por um segundo caminho (MediaRecorder) se o primeiro não pegar som, e funciona no Firefox mesmo quando o microfone usa outra taxa de som.

Permita o microfone, aumente o volume, abra no Chrome/Safari (fora de outros apps) e use o botão 🔊 **Testar o som** na parte “😕 Não deu certo?”.
