/* ============================================================
   JOGOS DO JOJO — game.js
   Página individual: encontra o jogo pelo ?id= (slug) e monta
   banner, trailer, galeria, história, controles, changelog,
   ranking e a área de comentários (preparada para o futuro).
   ============================================================ */

(async function iniciarPaginaDoJogo() {
  const alvo = document.getElementById('conteudo-jogo');
  const slug = parametroURL('id');

  let jogos = [];
  try {
    jogos = (await carregarJogos()).jogos || [];
  } catch (erro) {
    console.error(erro);
  }

  const jogo = jogos.find((j) => j.slug === slug);

  // Jogo não encontrado → mensagem amigável
  if (!jogo) {
    alvo.innerHTML = `
      <div class="empty-state" style="padding-top:100px;">
        <span class="emoji">👾</span>
        <p><strong>404 — Jogo não encontrado!</strong><br />Parece que essa fase ainda não existe.</p>
        <p style="margin-top:18px;"><a class="btn btn-primary" href="${ROOT}pages/jogos.html">← Voltar aos jogos</a></p>
      </div>`;
    return;
  }

  document.title = `${jogo.nome} — Jogos do JoJo`;
  alvo.innerHTML = montarPagina(jogo);
  ativarReveal();
  ativarLightbox();

  /* ---------- Montagem da página ---------- */

  function montarPagina(j) {
    return `
      ${secaoBanner(j)}
      <div class="game-layout">
        <div>
          ${secaoTrailer(j)}
          ${secao('📖', 'História do jogo', paragrafos(j.historia))}
          ${secao('🕹️', 'Como jogar', paragrafos(j.comoJogar))}
          ${secaoControles(j)}
          ${secaoGaleria(j)}
          ${secaoLista('✨', 'Curiosidades', j.curiosidades)}
          ${secao('🔄', 'Atualizações', paragrafos(j.atualizacoes))}
          ${secaoChangelog(j)}
          ${secaoRanking(j)}
          ${secaoComentarios()}
        </div>
        <aside>
          ${fichaTecnica(j)}
          ${secao('👏', 'Créditos', paragrafos(j.creditos))}
        </aside>
      </div>
    `;
  }

  /* Painel genérico — só aparece se houver conteúdo */
  function secao(icone, titulo, conteudoHTML) {
    if (!conteudoHTML) return '';
    return `
      <section class="panel reveal">
        <h2>${icone} ${titulo}</h2>
        ${conteudoHTML}
      </section>`;
  }

  /* Painel com lista de itens (curiosidades, mecânicas...) */
  function secaoLista(icone, titulo, itens) {
    if (!itens || itens.length === 0) return '';
    return secao(icone, titulo, `<ul>${itens.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>`);
  }

  /* Converte texto simples em parágrafos escapados */
  function paragrafos(texto) {
    if (!texto || texto.trim() === '') return '';
    return texto
      .split('\n')
      .filter((linha) => linha.trim() !== '')
      .map((linha) => `<p>${esc(linha)}</p>`)
      .join('');
  }

  function secaoBanner(j) {
    const jogar = linkParaJogar(j.url);
    return `
      <section class="game-banner">
        <img class="banner-img" src="${imagemOuPlaceholder(j.banner || j.imagem, 'banner')}" alt="Banner do jogo ${esc(j.nome)}" />
        <div class="banner-overlay">
          <div>
            <span class="status-badge ${classeStatus(j.status)}">${esc(j.status)}</span>
            <h1 style="margin-top:10px;">${esc(j.nome)}</h1>
            <div class="card-meta" style="margin-top:10px;">
              <span class="tag">${esc(j.categoria)}</span>
              <span class="tag ciano">${esc(j.plataforma)}</span>
              <span class="tag rosa">${esc(String(j.ano))}</span>
            </div>
          </div>
          ${
            jogar
              ? `<a class="btn btn-primary" href="${jogar.href}"
                    ${jogar.externo ? 'target="_blank" rel="noopener"' : ''}>▶ Jogar agora</a>`
              : `<span class="btn btn-ghost" style="cursor:default;">🔗 Link em breve</span>`
          }
        </div>
      </section>`;
  }

  /* Trailer do YouTube (aceita link normal, youtu.be ou embed) */
  function secaoTrailer(j) {
    if (!j.trailer || j.trailer.trim() === '') return '';
    const idVideo = extrairIdYouTube(j.trailer);
    if (!idVideo) return '';
    return secao(
      '🎬',
      'Trailer',
      `<div class="trailer-wrap">
         <iframe src="https://www.youtube-nocookie.com/embed/${idVideo}"
           title="Trailer de ${esc(j.nome)}" allowfullscreen
           allow="accelerometer; encrypted-media; picture-in-picture"></iframe>
       </div>`
    );
  }

  function extrairIdYouTube(url) {
    const combinacao = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/);
    return combinacao ? combinacao[1] : null;
  }

  function secaoGaleria(j) {
    const imagens = (j.galeria || []).map((img) => imagemOuPlaceholder(img));
    if (imagens.length === 0) return '';
    return secao(
      '🖼️',
      'Galeria',
      `<div class="gallery">
         ${imagens
           .map((src, i) => `<img src="${src}" alt="Imagem ${i + 1} de ${esc(j.nome)}" loading="lazy" />`)
           .join('')}
       </div>`
    );
  }

  function secaoControles(j) {
    if (!j.controles || j.controles.length === 0) return '';
    return secao(
      '🎛️',
      'Controles',
      `<div class="controls-list">
         ${j.controles
           .map(
             (c) => `
             <div class="control-row">
               <span class="key">${esc(c.tecla)}</span>
               <span>${esc(c.acao)}</span>
             </div>`
           )
           .join('')}
       </div>`
    );
  }

  function secaoChangelog(j) {
    if (!j.changelog || j.changelog.length === 0) return '';
    return secao(
      '📋',
      'Changelog',
      j.changelog
        .map(
          (c) => `
          <div class="changelog-item">
            <span class="versao">v${esc(c.versao)}</span><span class="data">${esc(c.data)}</span>
            <p style="color:var(--text-dim);">${esc(c.mudancas)}</p>
          </div>`
        )
        .join('')
    );
  }

  function secaoRanking(j) {
    if (!j.ranking || j.ranking.length === 0) return '';
    const medalhas = ['🥇', '🥈', '🥉'];
    return secao(
      '🏆',
      'Ranking',
      `<table class="ranking-table">
         <thead><tr><th>#</th><th>Jogador</th><th>Pontos</th></tr></thead>
         <tbody>
           ${j.ranking
             .map(
               (r, i) => `
               <tr>
                 <td class="pos">${medalhas[i] || i + 1}</td>
                 <td>${esc(r.jogador)}</td>
                 <td>${esc(r.pontos)}</td>
               </tr>`
             )
             .join('')}
         </tbody>
       </table>`
    );
  }

  /* Área de comentários — placeholder pronto para implementação futura
     (ex.: giscus/utterances via GitHub Discussions, sem backend próprio) */
  function secaoComentarios() {
    return secao(
      '💬',
      'Comentários',
      `<div class="comments-placeholder" id="area-comentarios">
         <p>🚧 Os comentários chegam em uma atualização futura!</p>
         <p style="font-size:0.85rem; margin-top:8px;">
           Dica: dá para integrar <strong>giscus</strong> ou <strong>utterances</strong> aqui usando o GitHub, sem backend.
         </p>
       </div>`
    );
  }

  function fichaTecnica(j) {
    const linhas = [
      ['🎯 Objetivo', j.objetivo],
      ['⚙️ Como funciona', j.comoFunciona],
      ['🧩 Mecânicas', (j.mecanicas || []).join(', ')],
      ['💻 Plataforma', j.plataforma],
      ['📅 Ano de criação', String(j.ano)],
      ['🚦 Estado', j.status],
      ['🔥 Dificuldade', j.dificuldade],
      ['🗺️ Fases', j.fases ? String(j.fases) : null],
      ['🏆 Recorde', j.recorde],
      ['⭐ Pontuação', j.pontuacao],
    ].filter(([, valor]) => valor && valor.trim() !== '');

    return `
      <section class="panel ficha reveal">
        <h2>📄 Ficha técnica</h2>
        <dl>
          ${linhas.map(([rotulo, valor]) => `<div><dt>${rotulo}</dt><dd>${esc(valor)}</dd></div>`).join('')}
        </dl>
      </section>`;
  }

  /* ---------- Lightbox da galeria ---------- */
  function ativarLightbox() {
    const lightbox = document.getElementById('lightbox');
    const imagemAmpliada = lightbox.querySelector('img');

    document.querySelectorAll('.gallery img').forEach((img) => {
      img.addEventListener('click', () => {
        imagemAmpliada.src = img.src;
        lightbox.classList.add('open');
      });
    });

    lightbox.addEventListener('click', () => lightbox.classList.remove('open'));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') lightbox.classList.remove('open');
    });
  }
})();
