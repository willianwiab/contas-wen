# 🎮 Jogos do Jonathan

Esta pasta é o cantinho do Jonathan (Jojo). Tudo que é jogo e criação dele
mora aqui dentro, separado do sistema de contas da WEN Produtora.

## Por que uma pasta separada?

O sistema de trabalho (o `index.html` lá na raiz do repositório, que é o painel
de Contas a Receber) **não tem nenhuma ligação** com o que está aqui. São arquivos
independentes: mexer num jogo não afeta o sistema, e mexer no sistema não afeta
os jogos. Assim dá pra criar à vontade sem risco de quebrar o trabalho.

## Os jogos

| Jogo | Pasta | Do que se trata |
|------|-------|-----------------|
| Mistura de IA | `mistura-de-ia/` | Pegue os itens da IA que caem antes que cheguem no chão. Tem combo, bomba, arco-íris, os canais favoritos do Jojo e o lendário de 1000 pontos. |

## Como jogar

Cada jogo é um arquivo `index.html` sozinho, sem depender de internet nem de
instalar nada. Dá pra jogar de dois jeitos:

1. **No computador:** abrir o arquivo `index.html` do jogo direto no navegador.
2. **Pelo link:** se o GitHub Pages estiver ligado neste repositório, o jogo abre em
   `https://willianwiab.github.io/contas-wen/jogos-do-jonathan/mistura-de-ia/`

## Como criar um jogo novo

Fazer uma pasta nova aqui dentro (por exemplo `jogos-do-jonathan/meu-jogo-novo/`)
e colocar um `index.html` nela. Só isso — o jogo já ganha o link dele sozinho.

## Sobre os personagens

Os rostinhos dos youtubers são **desenhos genéricos criados no próprio código**
(em SVG), não são fotos nem retratos das pessoas de verdade. São uma homenagem
de fã aos canais que o Jojo gosta, sem nenhuma ligação oficial com eles.

---

Feito pelo Jojo, com ajuda do Claude e do Gemini. 🤖✨

## Publicando na Vercel

O jeito seguro de por os jogos no ar sem publicar o sistema de trabalho:
na hora de importar o repositorio na Vercel, definir em
**Settings -> Build and Deployment -> Root Directory** o valor:

    jogos-do-jonathan

Com isso a Vercel so enxerga esta pasta. O `index.html` da raiz do
repositorio (painel de Contas a Receber) nao vai pro ar de jeito nenhum.
