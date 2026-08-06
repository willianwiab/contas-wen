/* ============================================================
   JOGOS DO JOJO — home.js
   Página inicial: destaques (mais populares), recentes,
   estatísticas do portfólio e linha do tempo.
   ============================================================ */

/* Com poucos jogos, "populares" e "recentes" mostrariam exatamente os mesmos
   cartões duas vezes. Abaixo desse limite, a home vira uma vitrine única. */
const MINIMO_PARA_SEPARAR_SECOES = 4;

(async function iniciarHome() {
  let dados;
  try {
    dados = await carregarJogos();
  } catch (erro) {
    console.error(erro);
    return;
  }

  const jogos = dados.jogos || [];

  renderizarPopulares(jogos);
  renderizarRecentes(jogos);
  renderizarEstatisticas(jogos, dados.estatisticas || {});
  renderizarLinhaDoTempo(jogos);

  // Reativa as animações de entrada para o conteúdo recém-inserido
  ativarReveal();

  /* ----- Mais populares (top 3 por popularidade) ----- */
  function renderizarPopulares(lista) {
    const poucos = lista.length < MINIMO_PARA_SEPARAR_SECOES;
    const top = poucos
      ? lista
      : [...lista].sort((a, b) => (b.popularidade || 0) - (a.popularidade || 0)).slice(0, 3);

    if (poucos) {
      document.getElementById('icone-populares').textContent = '🎮';
      document.getElementById('titulo-populares').textContent = 'Os jogos';
      document.getElementById('sub-populares').textContent =
        'Tudo o que já saiu do forno até agora.';
    }
    document.getElementById('grid-populares').innerHTML = top.map(criarCartaoJogo).join('');
  }

  /* ----- Recentes (top 3 por ano) ----- */
  function renderizarRecentes(lista) {
    if (lista.length < MINIMO_PARA_SEPARAR_SECOES) {
      document.getElementById('secao-recentes').hidden = true;
      return;
    }
    const recentes = [...lista].sort((a, b) => (b.ano || 0) - (a.ano || 0)).slice(0, 3);
    document.getElementById('grid-recentes').innerHTML = recentes.map(criarCartaoJogo).join('');
  }

  /* ----- Estatísticas ----- */
  function renderizarEstatisticas(lista, estatisticas) {
    const finalizados = lista.filter((j) => classeStatus(j.status) === 'status-finalizado').length;
    const emDev = lista.filter((j) => classeStatus(j.status) === 'status-desenvolvimento').length;
    const horas = Number(estatisticas.horasDeDesenvolvimento) || 0;

    const cartoes = [
      { icone: '🎮', valor: lista.length, rotulo: 'Jogos criados' },
      { icone: '⏱️', valor: horas, rotulo: 'Horas de desenvolvimento' },
      { icone: '✅', valor: finalizados, rotulo: 'Projetos finalizados' },
      { icone: '🛠️', valor: emDev, rotulo: 'Em desenvolvimento' },
    ];

    document.getElementById('stats-grid').innerHTML = cartoes
      .map(
        (c) => `
        <div class="stat-card reveal">
          <div class="stat-icon">${c.icone}</div>
          <div class="stat-value grad-text" data-valor="${c.valor}">0</div>
          <div class="stat-label">${c.rotulo}</div>
        </div>`
      )
      .join('');

    // Anima os números quando os cartões aparecem na tela
    const observador = new IntersectionObserver((entradas) => {
      entradas.forEach((entrada) => {
        if (entrada.isIntersecting) {
          const el = entrada.target;
          animarNumero(el, Number(el.dataset.valor));
          observador.unobserve(el);
        }
      });
    });
    document.querySelectorAll('.stat-value').forEach((el) => observador.observe(el));
  }

  /* ----- Linha do tempo (agrupa jogos por ano) ----- */
  function renderizarLinhaDoTempo(lista) {
    const porAno = {};
    lista.forEach((jogo) => {
      const ano = jogo.ano || 'Sem data';
      (porAno[ano] = porAno[ano] || []).push(jogo);
    });

    const anos = Object.keys(porAno).sort((a, b) => b - a);

    document.getElementById('timeline').innerHTML = anos
      .map(
        (ano) => `
        <div class="timeline-item reveal">
          <div class="timeline-year">${esc(String(ano))}</div>
          <div class="timeline-games">
            ${porAno[ano]
              .map(
                (j) =>
                  `<a href="pages/jogo.html?id=${encodeURIComponent(j.slug)}">${esc(j.nome)}</a>
                   <span class="tag" style="margin-left:6px;">${esc(j.status)}</span>`
              )
              .join('<br>')}
          </div>
        </div>`
      )
      .join('');
  }
})();
