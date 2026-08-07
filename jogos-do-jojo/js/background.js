/* ============================================================
   JOGOS DO JOJO — background.js
   Fundo animado: campo de partículas coloridas que se conectam
   com linhas sutis. Leve, bonito e sem exageros.
   ============================================================ */

(function iniciarFundoAnimado() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;

  // Respeita quem prefere menos movimento
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const ctx = canvas.getContext('2d');
  const CORES = ['#8b5cf6', '#22d3ee', '#ec4899', '#facc15'];
  let particulas = [];

  function redimensionar() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    // Densidade proporcional à área da tela (limitada para não pesar)
    const quantidade = Math.min(70, Math.floor((canvas.width * canvas.height) / 22000));
    particulas = Array.from({ length: quantidade }, criarParticula);
  }

  function criarParticula() {
    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      raio: Math.random() * 2 + 0.6,
      cor: CORES[Math.floor(Math.random() * CORES.length)],
    };
  }

  function desenhar() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const p of particulas) {
      p.x += p.vx;
      p.y += p.vy;

      // Faz a partícula "dar a volta" na tela
      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;

      ctx.globalAlpha = 0.7;
      ctx.fillStyle = p.cor;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.raio, 0, Math.PI * 2);
      ctx.fill();
    }

    // Linhas entre partículas próximas
    ctx.globalAlpha = 1;
    for (let i = 0; i < particulas.length; i++) {
      for (let j = i + 1; j < particulas.length; j++) {
        const a = particulas[i];
        const b = particulas[j];
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        if (dist < 130) {
          ctx.strokeStyle = `rgba(139, 92, 246, ${0.12 * (1 - dist / 130)})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(desenhar);
  }

  window.addEventListener('resize', redimensionar);
  redimensionar();
  desenhar();
})();
