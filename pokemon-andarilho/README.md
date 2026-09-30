# 🐾 Pokémon Andarilho

Um Pokémon **3D** (fotos do Pokémon HOME, nada de 8-bit) que fica andando pelo computador **por cima de qualquer site**.

- Anda, corre, pula, dorme quando o mouse fica parado 💤 e acorda quando o mouse chega perto.
- **Sobe pela beirada da tela** 🧗 e às vezes chega no **teto** e anda de cabeça pra baixo.
- Os **voadores** (tipo Voador, fantasmas e os que levitam: 153 Pokémon) **voam** pela tela 🕊️, e se você jogar eles longe, saem voando.
- Toque: pula, fala e faz o grito. Arraste e **jogue longe**: cai e quica. Dois toques: chuva de coração 💖.
- Pode **seguir o mouse**. Até **10 Pokémon** juntos (fazem festa quando se encontram).
- 🍎😴🛁🪥 **Cuidados** (tipo bichinho virtual): fome, sono, limpeza e dentes caem com o tempo (também com o computador desligado, mais devagar e só até 8 horas). Tocar no Pokémon abre o menu pra dar comida, pôr pra dormir, dar banho e escovar os dentes. Quando algo está baixo ele pede (ícone na cabeça e balão), fica com mosquinhas se estiver sujo e dorme sozinho se estiver morrendo de sono.
- Escolha entre **todos os 1025**, com shiny ✨, tamanho (P/M/G) e jeito (3D grande ou animado do Showdown).

**Site** (`index.html`): o Pokémon anda na própria página (tem uma barra de tarefas de mentirinha), com o painel pra escolher e o passo a passo pra instalar.

**Programa pro computador** (pasta `computador/`, Electron): janela transparente, sem borda e sempre por cima, do tamanho da área de trabalho, que deixa os cliques passarem (`setIgnoreMouseEvents` com `forward`), menos em cima do Pokémon. Ícone na bandeja pra escolher, esconder e sair. Veja `computador/LEIA-ME.md`.

**Extensão** (pasta `extensao/`, Manifest V3): `andarilho.js` é o mesmo arquivo do site; roda numa shadow root pra não brigar com o CSS dos sites. A escolha fica no `chrome.storage.local` e muda na hora em todas as abas. Não manda nada pra lugar nenhum. Veja `extensao/LEIA-ME.md`.
