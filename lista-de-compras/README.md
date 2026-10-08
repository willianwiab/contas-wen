# 🛒 Lista de Compras da Casa

Uma lista de compras só, no celular de todo mundo da casa. Quem lembra que acabou o
leite, põe na lista. Quem tá no mercado, risca. E aparece pra todo mundo na hora.

## Como usar

1. Abrir `https://willianwiab.github.io/contas-wen/lista-de-compras/`
2. Dizer **quem é você** (Jojo, Sofia, Wilian, Grabiela ou outro nome). É esse nome que
   aparece em "pediu: …" nos itens.
3. **➕ Criar lista** e dar um nome (Casa, Mercado do mês, Festa do Jojo…).
4. Apertar **💌** e mandar o convite no grupo da família. Quem abre o link entra na mesma
   lista. Também dá pra entrar digitando só o **código** de 6 letras.
5. Escrever o que falta e apertar **+**. Pronto.

## O que ele faz

- **Categorias sozinho.** Escreve "banana" e ele já põe em 🍌 Frutas, verduras e legumes;
  "detergente" vai pra 🧽 Limpeza. As categorias ficam na ordem em que a gente passa no
  mercado. Se ele errar, é só tocar no item e trocar.
- **Quem pediu.** Cada item mostra quem colocou e há quanto tempo. Quando alguém risca,
  mostra quem comprou.
- **Quantidade e preço** (opcionais, no "＋ quantidade, preço e categoria"). Com os preços,
  o rodapé mostra **quanto a compra vai dar mais ou menos** e quanto já tá no carrinho.
  É o par do [Cofrinho](../cofrinho/): lá cê guarda, aqui cê vê quanto vai gastar.
- **De novo?** Ele lembra o que a casa costuma comprar e sugere em um toque. Quem põe
  "Leite" toda semana nunca mais digita "Leite".
- **No carrinho.** O que foi riscado vai pro fim da lista. **🧹 Tirar comprados** limpa
  tudo de uma vez quando a compra termina.
- **📤 Mandar lista em texto** manda a lista inteira por WhatsApp, pra quem não quer abrir
  o site.
- **📲 Instala** como app e **funciona sem internet**: no mercado sem sinal a lista abre,
  dá pra riscar, e quando o sinal volta ele manda tudo pra nuvem sozinho.

## Como a lista chega no celular dos outros

A lista fica guardada na mesma nuvem que o Turma do CLB usa (Firebase, por REST, sem
cadastro e sem servidor próprio). Cada lista mora em `salas/compras-<código>/lista`.

- O site puxa a lista a cada 4 segundos enquanto está aberto, e na hora em que você volta
  pra aba ou a internet volta.
- Cada mudança (pôr, riscar, editar, tirar) vira um pedido pequeno na nuvem. Sem internet,
  o pedido entra numa **fila** no aparelho e sobe depois. O que está na fila vale por cima
  do que desce da nuvem, então riscar offline nunca "desrisca" quando o sinal volta.
- A bolinha ao lado do nome diz o estado: 🟢 na nuvem, 🟠 piscando guardando a fila,
  🟠 sem internet.

Quem sabe o código vê a lista, então o código é o segredo. Não tem senha de propósito:
é lista de compras, e o código de 6 letras (bilhões de combinações) é mais que suficiente
pra ninguém cair nela por acaso.

## Arquivos

- `index.html` — o site inteiro (tela, lógica e nuvem).
- `sw.js` — guarda os arquivos pra abrir sem internet.
- `manifest.webmanifest` e `icone.svg` — pra instalar como app.
