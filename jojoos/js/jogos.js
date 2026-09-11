/* ==========================================================================
   JojoOS · jogos.js
   OS JOGOS DO JOJO COMO PROGRAMAS DO COMPUTADOR.

   A lista NÃO é escrita aqui à mão: ela é lida do mesmo arquivo que o
   portfólio usa (../jogos-do-jojo/data/games.json). Assim, quando o JoJo
   publicar um jogo novo lá, ele aparece aqui sozinho, com o mesmo desenho
   e a mesma descrição. Um lugar só pra manter.

   Se por algum motivo o arquivo não abrir (aberto direto do disco, sem
   servidor), entra a lista de reserva aqui embaixo — pequena, só pra
   janela não ficar vazia.
   ========================================================================== */

const ONDE = "../jogos-do-jojo/data/games.json";

const RESERVA = [
  { slug:"cat-city", nome:"Cat City", categoria:"Aventura", url:"../cat-city/index.html" },
  { slug:"clipy", nome:"Clipy", categoria:"Brinquedo", url:"../clipy/index.html" },
  { slug:"torre-de-emojis", nome:"Torre de Emojis", categoria:"Arcade", url:"../torre-de-emojis/index.html" },
  { slug:"mina-de-emojis", nome:"Mina de Emojis", categoria:"Clicker", url:"../mina-de-emojis/index.html" },
  { slug:"fabrica-de-emojis", nome:"Fábrica de Emojis", categoria:"Clicker", url:"../fabrica-de-emojis/index.html" },
  { slug:"evolucao-dos-gatos", nome:"Evolução dos Gatos", categoria:"Clicker", url:"../evolucao-dos-gatos/index.html" },
];

/* um desenho de reserva por categoria, pra nunca aparecer quadrado vazio */
const FIG_CATEGORIA = {
  "Clicker": "🖱️", "Arcade": "🕹️", "Aventura": "🗺️", "Terror": "👻",
  "Educativo": "🧪", "Bichinho virtual": "🌱", "Brinquedo": "📎",
};

export let jogos = [];
let prometido = null;

export function carregarJogos() {
  if (prometido) return prometido;
  prometido = fetch(ONDE)
    .then(r => { if (!r.ok) throw new Error("sem lista"); return r.json(); })
    .then(d => {
      const lista = (d && d.jogos) || [];
      if (!lista.length) throw new Error("lista vazia");
      jogos = lista.map(arrumar);
      return jogos;
    })
    .catch(() => { jogos = RESERVA.map(arrumar); return jogos; });
  return prometido;
}

function arrumar(g) {
  /* os endereços do games.json são relativos à pasta do portfólio; daqui
     (uma pasta ao lado) os "../" já valem, mas os caminhos de dentro do
     portfólio ("jogos/...") precisam do prefixo */
  let url = g.url || "";
  if (url && !/^(https?:|\.\.\/)/.test(url)) url = "../jogos-do-jojo/" + url;

  let imagem = g.imagem || "";
  if (imagem && !/^(https?:|\.\.\/)/.test(imagem)) imagem = "../jogos-do-jojo/" + imagem;

  return {
    slug: g.slug,
    nome: g.nome,
    descricao: g.descricao || "",
    categoria: g.categoria || "Jogo",
    fig: FIG_CATEGORIA[g.categoria] || "🎮",
    url,
    imagem,
    deFora: /^https?:/.test(url),
  };
}
