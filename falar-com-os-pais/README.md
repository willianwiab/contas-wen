# 💬 Fala, Família!

Um chat no estilo dos aplicativos de mensagem para conversar com o **papai Wilian**
e a **mamãe Grabiela**. É um único arquivo `index.html`, sem instalar nada, sem
internet obrigatória e sem servidor.

## Como abrir

1. **No computador:** abrir o arquivo `index.html` direto no navegador.
2. **Pelo link (GitHub Pages):**
   `https://willianwiab.github.io/contas-wen/falar-com-os-pais/`

## O que dá pra fazer

| Recurso | Como funciona |
|---|---|
| Três conversas | Papai Wilian, Mamãe Grabiela e **Família ❤️** (manda para os dois) |
| Escrever mensagem | Enter envia, Shift+Enter pula linha |
| Frases rápidas | Botões prontos: “Cheguei bem 🏠”, “Pode me buscar? 🚗”, “Te amo 🥰”… |
| Emojis | Botão 😀 abre a paletinha de emojis |
| Mandar de verdade | Cada mensagem enviada tem o botão **↗ Papai / ↗ Mamãe**, que abre o WhatsApp com o texto já escrito |
| Anotar a resposta | Botão 📝 guarda na conversa o que o papai ou a mamãe responderam |
| Apagar | ✕ apaga uma mensagem, 🗑️ apaga a conversa inteira |
| Tema claro/escuro | Botão 🌙 / ☀️ no topo |

## Primeira vez: configurar

Na primeira abertura aparece a tela **⚙️ Configurar**, para preencher:

- **Teu nome** — entra como assinatura no começo da mensagem enviada pelo WhatsApp.
- **Celular do papai** e **celular da mamãe** — só DDD + número (o `55` do Brasil
  entra sozinho). Sem os números dá para escrever normalmente, só não aparece o
  botão de abrir o WhatsApp.

Dá para mudar depois a qualquer hora no botão ⚙️ do topo.

## Onde ficam as mensagens

Tudo é guardado no `localStorage` do próprio navegador, na chave
`fala-familia:v1`. **Nada é enviado para nenhum servidor.** Ou seja:

- As conversas ficam só naquele aparelho e naquele navegador.
- Abrir em outro celular/computador começa uma conversa vazia.
- Limpar os dados do navegador apaga as mensagens.

O envio “de verdade” acontece por um link `wa.me`, que abre o WhatsApp já com o
texto pronto — quem aperta o botão de enviar lá dentro é você.

## Independência do resto do repositório

Esta pasta não tem ligação nenhuma com o painel de Contas a Receber
(`index.html` da raiz) nem com os jogos do Jojo. Mexer aqui não afeta os outros.
