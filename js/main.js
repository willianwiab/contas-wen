/* ============================================================
   JOGOS DO JOJO — main.js
   Comportamentos globais: revelar elementos ao rolar a página.
   Deve ser carregado em todas as páginas, depois dos componentes.
   ============================================================ */

/**
 * Observa elementos com a classe .reveal e adiciona .visible
 * quando entram na tela, criando a animação de entrada suave.
 * Chame novamente após inserir conteúdo dinâmico (ex.: cartões).
 */
function ativarReveal() {
  const observador = new IntersectionObserver(
    (entradas) => {
      entradas.forEach((entrada) => {
        if (entrada.isIntersecting) {
          entrada.target.classList.add('visible');
          observador.unobserve(entrada.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  document.querySelectorAll('.reveal:not(.visible)').forEach((el) => observador.observe(el));
}

document.addEventListener('DOMContentLoaded', ativarReveal);
