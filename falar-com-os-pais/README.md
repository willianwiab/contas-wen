# 💜 Fala, Família!

O chat da família: recadinhos entre o **Jojo**, o **papai Wilian** e a **mamãe Grabiela**.
É um site estático (um `index.html` só, mais o ícone e o service worker), sem servidor,
sem cadastro e **sem nenhuma ligação com aplicativos de mensagem**.

## Como abrir

1. **No computador:** abrir o `index.html` direto no navegador.
2. **Pelo link (GitHub Pages):** `https://willianwiab.github.io/contas-wen/falar-com-os-pais/`
3. **No celular:** abrir o link e usar “Adicionar à tela de início” — ele instala como
   aplicativo e funciona até sem internet.

## Como funciona a conversa

Não tem envio pela internet: as três pessoas conversam **no mesmo aparelho**, revezando
quem está escrevendo. Na barra **“Falando como”**, embaixo da conversa, é só tocar em
**🧒 Eu**, **👨 Papai** ou **👩 Mamãe** antes de escrever. As mensagens de quem está
respondendo aparecem do lado esquerdo, com o nome e a cor da pessoa.

Assim dá pra deixar um recado, largar o celular ou o computador, e o papai ou a mamãe
responder depois — igualzinho a um mural de recados da família.

## O que dá pra fazer

| Recurso | Como |
|---|---|
| Três conversas | Papai Wilian, Mamãe Grabiela e **Família 💜** (os três juntos) |
| Trocar quem fala | Barra **Falando como** embaixo da conversa |
| Escrever | Enter envia, Shift+Enter pula linha |
| Frases rápidas | Botões prontos: “Cheguei bem 🏠”, “Pode me buscar? 🚗”, “Te amo ❤️”… |
| Emojis | Botão 😀 abre a paleta; mandar só emoji deixa ele **gigante** |
| Reagir | Botão ☺ do lado do balão, ou **dois cliques** no balão pra dar ❤️ |
| Recados não lidos | Bolinha roxa com o número na lista de conversas |
| Procurar | 🔍 no topo procura palavra dentro da conversa e marca de amarelo |
| Copiar | 📋 copia a conversa inteira pra colar em qualquer lugar |
| Apagar | ✕ apaga um recadinho, 🗑️ apaga a conversa toda |
| Som | Um “blim” ao mandar recado (dá pra desligar nos ⚙️ Ajustes) |
| Tema | Claro ou escuro, no botão 🌙 / ☀️ (começa igual ao tema do aparelho) |
| Offline | Depois de abrir uma vez, funciona sem internet |

## Ajustes ⚙️

- **Como tu quer ser chamado** — aparece no “bom dia” do topo (pode deixar vazio).
- **Som** liga/desliga o barulhinho.
- **Tema escuro** liga/desliga o modo noite.

Não pede telefone, e-mail, nem nada de ninguém.

## Onde ficam os recadinhos

Tudo no `localStorage` do próprio navegador, na chave `fala-familia:v2`.
**Nada sai do aparelho** — não tem servidor, não tem conta, não tem envio.

- As conversas ficam só naquele aparelho e naquele navegador.
- Abrir em outro celular começa vazio.
- Limpar os dados do navegador apaga os recadinhos.
- Quem já tinha usado a primeira versão do site (`fala-familia:v1`) não perde nada:
  as mensagens antigas são aproveitadas sozinhas na primeira abertura.

## Arquivos

| Arquivo | Pra que serve |
|---|---|
| `index.html` | O site inteiro: visual + conversa |
| `icone.svg` | Ícone roxo com o balãozinho (desenho em vetor, sem foto de ninguém) |
| `manifest.webmanifest` | Faz o site poder ser instalado como aplicativo |
| `sw.js` | Guarda uma cópia pra abrir sem internet |

## Independência do resto do repositório

Esta pasta não tem ligação nenhuma com o painel de Contas a Receber (`index.html` da
raiz) nem com os jogos do Jojo. Mexer aqui não afeta os outros.
