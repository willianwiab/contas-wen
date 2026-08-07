/* ============================================================
   JOGOS DO JOJO — games.js
   Página "Todos os Jogos": pesquisa, filtro por categoria,
   filtro por status e ordenação, tudo em cima do games.json.
   ============================================================ */

(async function iniciarPaginaJogos() {
  let jogos = [];
  try {
    jogos = (await carregarJogos()).jogos || [];
  } catch (erro) {
    console.error(erro);
    return;
  }

  const grid = document.getElementById('grid-jogos');
  const vazio = document.getElementById('vazio');
  const contador = document.getElementById('contador');
  const campoBusca = document.getElementById('busca');
  const filtroCategoria = document.getElementById('filtro-categoria');
  const filtroStatus = document.getElementById('filtro-status');
  const ordenacao = document.getElementById('ordenacao');

  preencherCategorias();
  aplicar();

  // Reaplica os filtros a cada interação
  [campoBusca, filtroCategoria, filtroStatus, ordenacao].forEach((el) =>
    el.addEventListener('input', aplicar)
  );

  /* Preenche o select de categorias com as que existem no JSON (sem repetir) */
  function preencherCategorias() {
    const categorias = [...new Set(jogos.map((j) => j.categoria).filter(Boolean))].sort();
    categorias.forEach((cat) => {
      const opcao = document.createElement('option');
      opcao.textContent = cat;
      filtroCategoria.appendChild(opcao);
    });
  }

  /* Aplica busca + filtros + ordenação e redesenha o grid */
  function aplicar() {
    const termo = campoBusca.value.trim().toLowerCase();
    const categoria = filtroCategoria.value;
    const status = filtroStatus.value;

    let resultado = jogos.filter((jogo) => {
      const textoBusca = `${jogo.nome} ${jogo.descricao} ${jogo.categoria}`.toLowerCase();
      const combinaBusca = !termo || textoBusca.includes(termo);
      const combinaCategoria = !categoria || jogo.categoria === categoria;
      const combinaStatus = !status || classeStatus(jogo.status) === classeStatus(status);
      return combinaBusca && combinaCategoria && combinaStatus;
    });

    const ordenadores = {
      populares: (a, b) => (b.popularidade || 0) - (a.popularidade || 0),
      recentes: (a, b) => (b.ano || 0) - (a.ano || 0),
      antigos: (a, b) => (a.ano || 0) - (b.ano || 0),
      nome: (a, b) => a.nome.localeCompare(b.nome, 'pt-BR'),
    };
    resultado.sort(ordenadores[ordenacao.value] || ordenadores.populares);

    grid.innerHTML = resultado.map(criarCartaoJogo).join('');
    vazio.hidden = resultado.length > 0;
    contador.textContent = `${resultado.length} de ${jogos.length} jogos`;

    ativarReveal();
  }
})();
