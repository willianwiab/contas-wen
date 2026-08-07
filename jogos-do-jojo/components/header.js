/* ============================================================
   Componente: Header
   Renderiza o cabeçalho com logo e navegação em todas as páginas,
   evitando duplicação de HTML. Marca o link ativo automaticamente.
   ============================================================ */

(function renderizarHeader() {
  const alvo = document.getElementById('site-header');
  if (!alvo) return;

  // "pagina" atual definida em <body data-page="...">
  const paginaAtual = document.body.dataset.page || '';

  const links = [
    { id: 'home', rotulo: '🏠 Início', href: `${ROOT}index.html` },
    { id: 'jogos', rotulo: '🎮 Jogos', href: `${ROOT}pages/jogos.html` },
    { id: 'sobre', rotulo: '🕹️ Sobre Mim', href: `${ROOT}pages/sobre.html` },
  ];

  alvo.innerHTML = `
    <div class="container">
      <a class="logo" href="${ROOT}index.html">
        <span class="logo-icon">🎮</span>
        <span class="grad-text">Jogos do JoJo</span>
      </a>
      <button class="nav-toggle" aria-label="Abrir menu">☰</button>
      <nav class="main-nav" aria-label="Navegação principal">
        ${links
          .map(
            (l) =>
              `<a href="${l.href}" class="${l.id === paginaAtual ? 'active' : ''}">${l.rotulo}</a>`
          )
          .join('')}
      </nav>
    </div>
  `;

  // Menu mobile
  const botao = alvo.querySelector('.nav-toggle');
  const nav = alvo.querySelector('.main-nav');
  botao.addEventListener('click', () => nav.classList.toggle('open'));
})();
