/* ============================================================
   JOGOS DO JOJO — utils.js
   Funções utilitárias compartilhadas por todas as páginas.
   ============================================================ */

/**
 * Raiz do site em relação à página atual.
 * Cada página define <html data-root=""> (raiz) ou <html data-root="../"> (subpasta),
 * assim os componentes montam links e caminhos de imagem corretos.
 */
const ROOT = document.documentElement.dataset.root || '';

/** Carrega um arquivo JSON da pasta /data. */
async function carregarJSON(nomeArquivo) {
  const resposta = await fetch(`${ROOT}data/${nomeArquivo}`);
  if (!resposta.ok) throw new Error(`Não foi possível carregar ${nomeArquivo}`);
  return resposta.json();
}

/** Carrega o games.json e devolve { estatisticas, jogos }. */
async function carregarJogos() {
  return carregarJSON('games.json');
}

/** Resolve o caminho de uma imagem; usa o placeholder quando estiver vazio. */
function imagemOuPlaceholder(caminho, tipo = 'game') {
  if (caminho && caminho.trim() !== '') return ROOT + caminho;
  return `${ROOT}assets/images/placeholder-${tipo}.svg`;
}

/** Lê um parâmetro da query string (ex.: ?id=meu-jogo). */
function parametroURL(nome) {
  return new URLSearchParams(window.location.search).get(nome);
}

/** Classe CSS do badge conforme o status do projeto. */
function classeStatus(status) {
  const s = (status || '').toLowerCase();
  if (s.includes('finalizado')) return 'status-finalizado';
  if (s.includes('desenvolvimento')) return 'status-desenvolvimento';
  return 'status-futuras';
}

/** Escapa texto vindo do JSON antes de inserir no HTML. */
function esc(texto) {
  const div = document.createElement('div');
  div.textContent = texto ?? '';
  return div.innerHTML;
}

/** Anima um número de 0 até o valor final (usado nas estatísticas). */
function animarNumero(elemento, valorFinal, duracaoMs = 1200) {
  const inicio = performance.now();
  function passo(agora) {
    const progresso = Math.min((agora - inicio) / duracaoMs, 1);
    // Easing suave (easeOutCubic)
    const eased = 1 - Math.pow(1 - progresso, 3);
    elemento.textContent = Math.round(valorFinal * eased).toLocaleString('pt-BR');
    if (progresso < 1) requestAnimationFrame(passo);
  }
  requestAnimationFrame(passo);
}
