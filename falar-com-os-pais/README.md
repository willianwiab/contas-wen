# 💜 Fala, Família!

O chat da família: recadinhos entre o **Jojo**, o **papai Wilian** e a **mamãe Grabiela**.
Site estático, sem servidor, sem cadastro e sem ligação com nenhum aplicativo de mensagem.
Tudo que é escrito, falado ou fotografado fica **guardado no próprio aparelho**.

## Como abrir

1. **No computador:** abrir o `index.html` no navegador.
2. **Pelo link:** `https://willianwiab.github.io/contas-wen/falar-com-os-pais/`
3. **No celular:** abrir o link e usar “Adicionar à tela de início”. Instala com ícone
   próprio (o balãozinho roxo) e funciona até sem internet.

## Como funciona a conversa

Não existe envio pela internet: as três pessoas conversam **no mesmo aparelho**,
revezando quem escreve. Na barra **“Falando como”**, embaixo, é só tocar em
**🧒 Eu**, **👨 Papai** ou **👩 Mamãe** antes de mandar.

## Tudo que dá pra fazer

| Recurso | Como |
|---|---|
| Três conversas | Papai, Mamãe e **Família 💜** (os três juntos) |
| Trocar quem fala | Barra **Falando como** embaixo da conversa |
| Escrever | Enter envia, Shift+Enter pula linha |
| 🎤 **Recadinho de voz** | Segura o botão do microfone, fala e solta. Arrasta pra longe pra cancelar |
| 🎛️ **Vozes engraçadas** | No áudio, o botão 🎛️ toca com voz de **esquilo 🐿️**, **monstro 👹** ou **robô 🤖** |
| 📻 **Walkie-talkie** | Tela de rádio com botão gigante: aperta, fala, solta — e já toca de volta |
| 📞 **Ligação de voz** | Ligação de verdade entre dois aparelhos (veja abaixo) |
| 📷 **Fotos** | Botão ➕ → Mandar foto. A foto é diminuída e guardada no aparelho; toca pra ver grande |
| 📊 **Enquetes** | Botão ➕ → Fazer enquete. Pergunta + até 4 respostas, cada um vota e vira gráfico |
| ❤️ Reações | Botão ☺ do lado do balão, ou **dois cliques** no balão |
| 🟢 Quem está por aqui | Bolinha verde em quem mexeu no chat nos últimos 5 min; senão, “visto por último” |
| 🔴 Não lidos | Bolinha com número na lista **e no ícone do aplicativo** |
| 🔔 Avisos | Notificação do celular quando chega recadinho novo |
| ⏰ Lembretes | Ex.: todo dia às 21h “dar boa noite” |
| 🔍 Procurar | Menu ⋯ → procura palavra na conversa e marca de amarelo |
| 📋 Copiar / 🗑️ Apagar | Menu ⋯ (a conversa toda) ou ✕ (um recadinho só) |
| 😀 Emojis | Paleta de emojis; emoji sozinho fica **gigante** |
| 🔊 Som e 🌙 Tema | Nos ⚙️ Ajustes; o tema começa igual ao do aparelho |
| 📶 Offline | Depois de abrir uma vez, funciona sem internet |

## 📞 Sobre a ligação de voz

É uma ligação **de verdade** (WebRTC), direto de um aparelho pro outro, sem passar por
servidor nenhum. Como não existe servidor pra avisar o outro lado, quem liga precisa
mandar um **código de convite**:

1. Quem chama aperta **📲 Eu quero chamar** e copia o código.
2. Manda o código pra outra pessoa (do jeito que quiser).
3. A outra pessoa abre o site, aperta **📥 Me mandaram um código**, cola e copia a resposta.
4. Manda a resposta de volta; quem chamou cola e aperta **✅ Conectar**.

**O que pode dar errado:** os dois precisam estar com o site aberto **ao mesmo tempo**.
No wi-fi de casa quase sempre funciona; na internet do celular às vezes os dois aparelhos
não se acham (isso precisaria de um servidor TURN, que é pago). Se não conectar, o
recadinho de voz 🎤 sempre funciona.

## 🔔 O que os avisos conseguem (e o que não conseguem)

| Situação | Funciona? |
|---|---|
| Site aberto, ou atrás de outro app | ✅ avisa na hora |
| Outra janela/aba do mesmo aparelho escreve um recado | ✅ avisa e atualiza sozinho |
| Lembrete de horário com o app aberto | ✅ avisa na hora |
| Lembrete com o app fechado | ⚠️ o aviso aparece quando abrir de novo |
| Celular guardado, app fechado, ou de um celular pro outro | ❌ isso precisa de servidor (tipo Firebase, com conta e chave) |

A bolinha vermelha no ícone do aplicativo (`setAppBadge`) funciona em parte dos Androids
com o site instalado; onde não funciona, a lista continua mostrando o número.

## Onde ficam as coisas

- Textos, enquetes, reações e ajustes: `localStorage`, chave `fala-familia:v2`.
- Áudios e fotos: `IndexedDB` (`fala-familia-audios`), porque são pesados demais pro
  `localStorage`. Se o navegador não deixar, o arquivo vai junto da mensagem (só os pequenos).
- **Nada sai do aparelho.** Sem servidor, sem conta, sem envio — nem as fotos.
- Abrir em outro celular começa vazio. Limpar os dados do navegador apaga tudo.
- Quem usou a primeira versão (`fala-familia:v1`) não perde as mensagens antigas.

## Arquivos

| Arquivo | Pra que serve |
|---|---|
| `index.html` | Estrutura e todo o visual (CSS) |
| `app.js` | O chat: conversas, mensagens, presença, ajustes |
| `audio.js` | Gravar, tocar, vozes engraçadas e walkie-talkie |
| `extras.js` | Fotos e enquetes |
| `ligacao.js` | A ligação de voz (WebRTC) |
| `avisos.js` | Notificações, lembretes e bolinha no ícone |
| `sw.js` | Guarda uma cópia pra abrir sem internet |
| `manifest.webmanifest` | Faz o site instalar como aplicativo |
| `icone.svg`, `icone-*.png`, `apple-touch-icon.png` | Os ícones (desenho em vetor, sem foto de ninguém) |

## Independência do resto do repositório

Esta pasta não tem ligação com o painel de Contas a Receber (`index.html` da raiz) nem
com os jogos do Jojo. Mexer aqui não afeta os outros.
