/* ==========================================================================
   CLIPY · clipy.js
   O CLIPE.

   Ele é desenhado por código, num canvas: um arame dobrado em forma de
   clipe de papel, dois olhos e duas sobrancelhas. Nada de imagem pronta —
   assim ele pode entortar, esticar, pular e girar, que é o que faz um
   desenho parecer vivo.

   O desenho é original. É inspirado no ajudante de clipe dos programas de
   escritório dos anos 90, mas não é ele: é o Clipy, do JoJo.
   ========================================================================== */

/* ---------------------------------------------------------------- o arame */
/* As medidas são num quadrado de -1 a 1, com o y crescendo pra baixo (que é
   como o canvas pensa). Depois é só escalar pro tamanho que a tela pedir. */
function caminhoDoClipe(ctx) {
  const R = .55;                     // raio das curvas de fora
  ctx.beginPath();
  ctx.moveTo(-R, -.75);                             // ponta livre de cima
  ctx.lineTo(-R, .55);                              // desce pela esquerda
  ctx.arc(0, .55, R, Math.PI, 0, true);             // curva de baixo
  ctx.lineTo(R, -.90);                              // sobe pela direita
  ctx.arc(.19, -.90, .385, 0, Math.PI, true);       // curva de cima
  ctx.lineTo(-.195, .30);                           // desce pelo meio
  ctx.arc(.0425, .30, .2375, Math.PI, 0, true);     // curvinha de baixo, por dentro
  ctx.lineTo(.28, -.45);                            // sobe e acaba
}

/* ---------------------------------------------------------------- humores */
/* Cada humor é um jeito de posicionar as sobrancelhas e os olhos. O resto
   (pular, girar, entortar) é a animação, que vem depois. */
export const HUMORES = {
  parado:    { cenho:0,   sobeSobrancelha:0,  abertura:1,   boca:0 },
  atento:    { cenho:-.1, sobeSobrancelha:.22, abertura:1.15, boca:.1 },
  pensando:  { cenho:.45, sobeSobrancelha:-.05, abertura:.8, boca:-.1, olhaCima:1 },
  feliz:     { cenho:-.25, sobeSobrancelha:.3, abertura:.7,  boca:.6, sorriso:1 },
  triste:    { cenho:.5,  sobeSobrancelha:-.2, abertura:.75, boca:-.5 },
  bravo:     { cenho:.8,  sobeSobrancelha:-.25, abertura:.9, boca:-.3 },
  assustado: { cenho:-.4, sobeSobrancelha:.45, abertura:1.5, boca:.35 },
  dormindo:  { cenho:0,   sobeSobrancelha:-.1, abertura:0,  boca:0, dorme:1 },
  confuso:   { cenho:.3,  sobeSobrancelha:.28, abertura:1.05, boca:-.15, torto:1 },
};

const suave = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
const mistura = (a, b, k) => a + (b - a) * k;

export class Clipe {
  constructor(canvas) {
    this.cv = canvas;
    this.ctx = canvas.getContext("2d");
    this.t = 0;
    this.humor = "parado"; this.humorAntes = "parado"; this.trocaHumor = 1;
    this.gesto = null; this.gestoT = 0; this.gestoDur = 0;
    this.piscaEm = 2 + Math.random() * 3; this.piscando = 0;
    this.olhoX = 0; this.olhoY = 0;             // pra onde ele está olhando (-1 a 1)
    this.alvoOlhoX = 0; this.alvoOlhoY = 0;
    this.balao = null;                          // "!" ou "?" ou "z"
    this.balaoAte = 0;
    this.dpr = 1;
    this.ajustar();
    addEventListener("resize", () => this.ajustar());
  }

  ajustar() {
    const r = this.cv.getBoundingClientRect();
    this.dpr = Math.min(devicePixelRatio || 1, 2);
    this.L = Math.max(1, r.width); this.A = Math.max(1, r.height);
    this.cv.width = Math.round(this.L * this.dpr);
    this.cv.height = Math.round(this.A * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  }

  /* ---- o que dá pra mandar ele fazer ---- */
  sentir(humor) {
    if (!HUMORES[humor] || humor === this.humor) return;
    this.humorAntes = this.humor; this.humor = humor; this.trocaHumor = 0;
  }
  fazer(gesto, dur) {
    this.gesto = gesto; this.gestoT = 0;
    this.gestoDur = dur || { pular:.55, girar:.9, acenar:1.2, tremer:.5, encolher:.7, cair:1 }[gesto] || .6;
  }
  mostrarBalao(txt, segundos = 1.6) { this.balao = txt; this.balaoAte = this.t + segundos; }
  olharPara(x, y) {                              // em pixels da tela
    const r = this.cv.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height * .42;
    this.alvoOlhoX = Math.max(-1, Math.min(1, (x - cx) / 260));
    this.alvoOlhoY = Math.max(-1, Math.min(1, (y - cy) / 220));
  }

  /* ---- o quadro ---- */
  passo(dt) {
    this.t += dt;
    this.trocaHumor = Math.min(1, this.trocaHumor + dt * 5);
    if (this.gesto) {
      this.gestoT += dt;
      if (this.gestoT >= this.gestoDur) { this.gesto = null; this.gestoT = 0; }
    }
    /* piscar sozinho, que é o que faz parecer vivo */
    this.piscaEm -= dt;
    if (this.piscaEm <= 0) { this.piscando = .13; this.piscaEm = 1.8 + Math.random() * 4; }
    if (this.piscando > 0) this.piscando -= dt;
    /* os olhos correm atrás do alvo com preguiça */
    this.olhoX = mistura(this.olhoX, this.alvoOlhoX, Math.min(1, dt * 6));
    this.olhoY = mistura(this.olhoY, this.alvoOlhoY, Math.min(1, dt * 6));
    this.desenhar();
  }

  desenhar() {
    const { ctx, L, A, t } = this;
    ctx.clearRect(0, 0, L, A);

    const h0 = HUMORES[this.humorAntes], h1 = HUMORES[this.humor], k = suave(this.trocaHumor);
    const H = {};
    for (const c of ["cenho", "sobeSobrancelha", "abertura", "boca", "sorriso", "olhaCima", "dorme", "torto"])
      H[c] = mistura(h0[c] || 0, h1[c] || 0, k);

    /* ---- o gesto do momento vira posição ---- */
    let sobe = 0, gira = 0, entorta = 0, esticaY = 1, esticaX = 1;
    const g = this.gesto, gt = g ? this.gestoT / this.gestoDur : 0;
    if (g === "pular") {
      const p = Math.sin(gt * Math.PI);
      sobe = -p * A * .16;
      esticaY = 1 + p * .12; esticaX = 1 - p * .08;
    } else if (g === "girar") {
      gira = suave(gt) * Math.PI * 2;
    } else if (g === "acenar") {
      entorta = Math.sin(gt * Math.PI * 5) * .28 * (1 - gt);
    } else if (g === "tremer") {
      entorta = Math.sin(gt * Math.PI * 14) * .1;
      esticaX = 1 + Math.sin(gt * Math.PI * 14) * .03;
    } else if (g === "encolher") {
      const p = Math.sin(gt * Math.PI);
      esticaY = 1 - p * .22; esticaX = 1 + p * .16; sobe = p * A * .03;
    } else if (g === "cair") {
      gira = suave(gt) * .5; sobe = suave(gt) * A * .05;
    }

    /* respiração: ninguém fica totalmente parado */
    const resp = Math.sin(t * 1.7) * .012;
    esticaY *= 1 + resp; esticaX *= 1 - resp * .6;
    entorta += Math.sin(t * .9) * .035 + H.torto * .16;
    if (H.dorme) { entorta += Math.sin(t * 1.1) * .07; sobe += Math.sin(t * 1.1) * 3; }

    const escala = Math.min(L / 2.5, A / 2.9);

    /* ---- a sombra no chão: fica na tela mesmo, sem girar junto ---- */
    ctx.save();
    ctx.globalAlpha = .16;
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.ellipse(L / 2, A * .55 + escala * 1.2, escala * (.5 + sobe / A * .5), escala * .09, 0, 0, 6.2832);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.translate(L / 2, A * .55 + sobe);
    ctx.rotate(gira);
    ctx.transform(esticaX, 0, entorta, esticaY, 0, 0);
    ctx.scale(escala, escala);

    /* ---- o arame ---- */
    ctx.lineCap = "round"; ctx.lineJoin = "round";
    /* uma sombrinha embaixo do arame dá volume sem precisar de 3D */
    ctx.lineWidth = .175;
    ctx.strokeStyle = "#5d6a7a";
    ctx.save(); ctx.translate(.012, .022); caminhoDoClipe(ctx); ctx.stroke(); ctx.restore();

    const brilho = ctx.createLinearGradient(-1, -1, 1, 1);
    brilho.addColorStop(0, "#e8eef6");
    brilho.addColorStop(.35, "#aebccd");
    brilho.addColorStop(.55, "#dfe8f2");
    brilho.addColorStop(.8, "#8fa0b4");
    brilho.addColorStop(1, "#cfdae6");
    ctx.strokeStyle = brilho;
    ctx.lineWidth = .16;
    caminhoDoClipe(ctx);
    ctx.stroke();
    /* o risco de luz por cima, que é o que faz parecer metal */
    ctx.strokeStyle = "#ffffffcc";
    ctx.lineWidth = .045;
    ctx.save(); ctx.translate(-.028, -.035); caminhoDoClipe(ctx); ctx.stroke(); ctx.restore();

    /* ---- a cara ---- */
    this.desenharCara(H);
    ctx.restore();

    /* ---- o balãozinho de "!" ---- */
    if (this.balao && this.t < this.balaoAte) {
      const p = Math.min(1, (this.balaoAte - this.t) * 3);
      ctx.save();
      ctx.globalAlpha = p;
      ctx.translate(Math.min(L - 26, L * .76), A * .19 + Math.sin(t * 6) * 3);
      ctx.fillStyle = "#fffbe6"; ctx.strokeStyle = "#3a3a3a"; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.ellipse(0, 0, 17, 15, 0, 0, 6.2832); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-6, 11); ctx.lineTo(-13, 22); ctx.lineTo(0, 14); ctx.closePath();
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#1a1a1a"; ctx.font = "bold 19px ui-monospace, monospace";
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(this.balao, 0, 1);
      ctx.restore();
    }
  }

  desenharCara(H) {
    const ctx = this.ctx;
    const olhos = [[-.31, -.70], [.06, -.70]];
    const r = .21;
    const fecha = this.piscando > 0 ? 1 : H.dorme;
    const ax = 1, ay = Math.max(.06, H.abertura * (1 - fecha));

    for (let i = 0; i < 2; i++) {
      const [ox, oy] = olhos[i];
      /* o branco do olho */
      ctx.save();
      ctx.translate(ox, oy + H.olhaCima * -.02);
      ctx.scale(ax, ay);
      ctx.fillStyle = "#ffffff";
      ctx.beginPath(); ctx.arc(0, 0, r, 0, 6.2832); ctx.fill();
      ctx.restore();
      /* a bolinha preta, que corre atrás de onde ele está olhando */
      if (ay > .2) {
        const px = ox + this.olhoX * r * .42;
        const py = oy + (this.olhoY - H.olhaCima * .5) * r * .38;
        ctx.fillStyle = "#15181d";
        ctx.beginPath(); ctx.arc(px, py, r * .46, 0, 6.2832); ctx.fill();
        ctx.fillStyle = "#ffffffdd";
        ctx.beginPath(); ctx.arc(px - r * .16, py - r * .18, r * .13, 0, 6.2832); ctx.fill();
      }
      /* o contorno */
      ctx.save();
      ctx.translate(ox, oy + H.olhaCima * -.02);
      ctx.scale(ax, Math.max(.05, ay));
      ctx.strokeStyle = "#2a3038"; ctx.lineWidth = .028 / Math.max(.05, ay);
      ctx.beginPath(); ctx.arc(0, 0, r, 0, 6.2832); ctx.stroke();
      ctx.restore();
    }

    /* ---- sobrancelhas: são elas que dizem o que ele está sentindo ---- */
    ctx.strokeStyle = "#2a3038"; ctx.lineWidth = .062; ctx.lineCap = "round";
    for (let i = 0; i < 2; i++) {
      const [ox, oy] = olhos[i];
      const lado = i === 0 ? -1 : 1;
      const y = oy - r - .1 - H.sobeSobrancelha * .12;
      const inclina = H.cenho * .16 * lado;
      ctx.beginPath();
      ctx.moveTo(ox - .17, y + inclina);
      ctx.quadraticCurveTo(ox, y - .05 + inclina * .3, ox + .17, y - inclina);
      ctx.stroke();
    }

    /* ---- a boca: um risco que vira sorriso ---- */
    if (H.dorme) {
      ctx.lineWidth = .05;
      ctx.beginPath(); ctx.arc(-.12, -.42, .07, 0, Math.PI); ctx.stroke();
    } else {
      ctx.lineWidth = .055;
      ctx.beginPath();
      ctx.moveTo(-.30, -.40);
      ctx.quadraticCurveTo(-.12, -.40 + H.boca * .17, .06, -.40);
      ctx.stroke();
    }
  }
}
