/* ============================================================
   Componente: GameCard
   Gera o HTML do cartão de um jogo. Usado na página inicial
   (destaques) e na página de jogos (lista completa).
   ============================================================ */

/**
 * Cria o HTML de um cartão de jogo.
 * @param {object} jogo - um item do array "jogos" do games.json
 * @returns {string} HTML do cartão
 */
function criarCartaoJogo(jogo) {
  const paginaJogo = `${ROOT}pages/jogo.html?id=${encodeURIComponent(jogo.slug)}`;
  const linkJogar = jogo.url && jogo.url.trim() !== '' ? jogo.url : paginaJogo;

  return `
    <article class="game-card reveal">
      <a class="thumb" href="${paginaJogo}" aria-label="Ver detalhes de ${esc(jogo.nome)}">
        <img src="${imagemOuPlaceholder(jogo.imagem)}" alt="Capa do jogo ${esc(jogo.nome)}" loading="lazy" />
        <span class="status-badge ${classeStatus(jogo.status)}">${esc(jogo.status)}</span>
      </a>
      <div class="card-body">
        <h3>${esc(jogo.nome)}</h3>
        <div class="card-meta">
          <span class="tag">${esc(jogo.categoria)}</span>
          <span class="tag ciano">${esc(jogo.plataforma)}</span>
          <span class="tag rosa">${esc(String(jogo.ano))}</span>
        </div>
        <p class="card-desc">${esc(jogo.descricao)}</p>
        <div class="card-stats">
          <span>🎯 Dificuldade: <b>${esc(jogo.dificuldade)}</b></span>
          <span>🗺️ Fases: <b>${jogo.fases ? esc(String(jogo.fases)) : '—'}</b></span>
          <span>🏆 Recorde: <b>${esc(jogo.recorde || '—')}</b></span>
          <span>⭐ Pontuação: <b>${esc(jogo.pontuacao || '—')}</b></span>
        </div>
        <div class="card-actions">
          <a class="btn btn-primary btn-sm" href="${linkJogar}" ${jogo.url ? 'target="_blank" rel="noopener"' : ''}>▶ Jogar</a>
          <a class="btn btn-ghost btn-sm" href="${paginaJogo}">Detalhes</a>
        </div>
      </div>
    </article>
  `;
}
