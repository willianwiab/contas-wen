/* ============================================================
   Componente: Footer
   Rodapé padrão de todas as páginas.
   ============================================================ */

(function renderizarFooter() {
  const alvo = document.getElementById('site-footer');
  if (!alvo) return;

  alvo.innerHTML = `
    <div class="container">
      <p>
        © ${new Date().getFullYear()} <strong class="grad-text">Jogos do JoJo</strong> —
        feito com <span class="heart">❤</span> e muita imaginação.
      </p>
      <p style="margin-top:6px; font-size:0.8rem;">
        Hospedado no GitHub Pages · Pressione <span class="key" style="font-size:0.7rem;">Start</span> para continuar
      </p>
    </div>
  `;
})();
