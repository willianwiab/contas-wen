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
  /* o olho de burro: cada olho olhando pra um lado, boca aberta, cara de nada */
  burro:     { cenho:-.15, sobeSobrancelha:.1, abertura:1.25, boca:.2, burro:1, torto:.4 },
  /* os novos */
  furioso:   { cenho:1.15, sobeSobrancelha:-.35, abertura:1.1, boca:-.6, ferve:1 },
  comemorando:{ cenho:-.35, sobeSobrancelha:.42, abertura:.55, boca:.9, sorriso:1, festa:1 },
  rindo:     { cenho:-.3,  sobeSobrancelha:.3, abertura:.25, boca:1, sorriso:1, riso:1 },
  ofegante:  { cenho:.25,  sobeSobrancelha:.15, abertura:1.35, boca:.7, ofega:1 },
  apaixonado:{ cenho:-.2,  sobeSobrancelha:.35, abertura:.9, boca:.7, coracao:1 },
  tonto:     { cenho:.1,   sobeSobrancelha:.2, abertura:1.1, boca:.1, tonto:1, torto:.6 },
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
    /* Os efeitos dos segredos. Cada um guarda ATÉ QUANDO vale (em
       milissegundos do relógio), pra sobreviver a recarregar a página. */
    this.efeitos = { arcoiris:0, burro:0, mudo:0, ben:0, fantasma:0, vermelho:0,
                     quatroOlhos:0, rindo:0, deOlho:0 };
    /* ele indo embora: 0 é aqui, 1 é fora da tela */
    this.saindo = 0; this.indoEmbora = false; this.fora = false;
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
    this.gestoDur = dur || {
      pular:.55, girar:.9, acenar:1.2, tremer:.5, encolher:.7, cair:1,
      comemorar:1.6, gargalhar:1.4, susto:.8, bater:.9, derreter:1.4,
      espiar:1.1, ofegar:1.2, girarLouco:1.8,
    }[gesto] || .6;
  }
  mostrarBalao(txt, segundos = 1.6) { this.balao = txt; this.balaoAte = this.t + segundos; }
  olharPara(x, y) {                              // em pixels da tela
    const r = this.cv.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height * .42;
    this.alvoOlhoX = Math.max(-1, Math.min(1, (x - cx) / 260));
    this.alvoOlhoY = Math.max(-1, Math.min(1, (y - cy) / 220));
  }

  /* ---- os efeitos ---- */
  /* minutos = 0 quer dizer PRA SEMPRE (até alguém desligar na mão) */
  ligarEfeito(qual, minutos) {
    const ate = minutos === 0 ? Infinity : Date.now() + minutos * 60000;
    this.efeitos[qual] = Math.max(this.efeitos[qual] || 0, ate);
  }
  temEfeito(qual) { return (this.efeitos[qual] || 0) > Date.now(); }
  /* A cura normal não tira TUDO: os quatro olhos são teimosos, ele viu o que
     viu. Só sai com curar(true) — que é o pedido de desculpas. */
  curar(tudo) {
    const olhos = this.efeitos.quatroOlhos;
    this.efeitos = { arcoiris:0, burro:0, mudo:0, ben:0, fantasma:0, vermelho:0,
                     quatroOlhos: tudo ? 0 : olhos, rindo:0, deOlho:0 };
    this.voltar();
  }
  faltaPara(qual) {
    const ms = (this.efeitos[qual] || 0) - Date.now();
    if (ms === Infinity) return "sem fim";
    if (ms <= 0) return "";
    const min = Math.ceil(ms / 60000);
    if (min < 60) return min + " min";
    return Math.floor(min / 60) + "h" + String(min % 60).padStart(2, "0");
  }

  /* ---- ele vai embora (e volta) ---- */
  irEmbora() { this.indoEmbora = true; this.fora = false; }
  voltar() { this.indoEmbora = false; this.fora = false; }
  foiEmbora() { return this.fora; }

  /* ---- o quadro ---- */
  passo(dt) {
    this.t += dt;
    /* a saída: ele escorrega pro lado até sumir. A volta é mais devagar,
       porque voltar é sempre mais constrangedor do que sair batendo a porta. */
    if (this.indoEmbora) {
      this.saindo = Math.min(1, this.saindo + dt * .85);
      if (this.saindo >= 1) this.fora = true;
    } else if (this.saindo > 0) {
      this.saindo = Math.max(0, this.saindo - dt * .55);
    }
    this.trocaHumor = Math.min(1, this.trocaHumor + dt * 5);
    if (this.gesto) {
      this.gestoT += dt;
      if (this.gestoT >= this.gestoDur) { this.gesto = null; this.gestoT = 0; }
    }
    /* piscar sozinho, que é o que faz parecer vivo */
    /* DE OLHO: ele não pisca. Nem uma vez. É só isso e já é desconfortável. */
    const deOlho = this.temEfeito("deOlho");
    this.piscaEm -= dt;
    if (this.piscaEm <= 0) { this.piscando = deOlho ? 0 : .13; this.piscaEm = 1.8 + Math.random() * 4; }
    if (this.piscando > 0) this.piscando -= dt;
    /* os olhos correm atrás do alvo com preguiça */
    /* normalmente o olho vai devagar atrás do ponteiro, com um atrasinho.
       De olho, não: ele COLA. Sem atraso, sem perdão. */
    this.olhoX = mistura(this.olhoX, this.alvoOlhoX, Math.min(1, dt * (deOlho ? 20 : 6)));
    this.olhoY = mistura(this.olhoY, this.alvoOlhoY, Math.min(1, dt * 6));
    this.desenhar();
  }

  desenhar() {
    const { ctx, L, A, t } = this;
    ctx.clearRect(0, 0, L, A);

    /* o olho de burro manda em qualquer humor: é o preço de ter visto aquilo */
    const burrice = this.temEfeito("burro");
    const nomeAgora = burrice ? "burro" : this.humor;
    const nomeAntes = burrice ? "burro" : this.humorAntes;
    const h0 = HUMORES[nomeAntes], h1 = HUMORES[nomeAgora], k = suave(this.trocaHumor);
    const H = {};
    for (const c of ["cenho", "sobeSobrancelha", "abertura", "boca", "sorriso",
                     "olhaCima", "dorme", "torto", "burro", "ferve", "festa",
                     "riso", "ofega", "coracao", "tonto"])
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
    } else if (g === "comemorar") {
      /* três pulinhos, cada um mais alto, com um giro no último */
      const salto = Math.abs(Math.sin(gt * Math.PI * 3));
      sobe = -salto * A * (.1 + gt * .16);
      esticaY = 1 + salto * .18; esticaX = 1 - salto * .1;
      if (gt > .62) gira = suave((gt - .62) / .38) * Math.PI * 2;
    } else if (g === "gargalhar") {
      /* rir é sacudir pra trás e pra frente, não pular */
      entorta += Math.sin(gt * Math.PI * 11) * .22;
      esticaY = 1 + Math.sin(gt * Math.PI * 22) * .07;
      sobe = -Math.abs(Math.sin(gt * Math.PI * 11)) * A * .03;
    } else if (g === "susto") {
      /* dispara pra cima, estica todo, e volta tremendo */
      const p = gt < .3 ? gt / .3 : 1 - (gt - .3) / .7;
      sobe = -p * A * .24;
      esticaY = 1 + p * .34; esticaX = 1 - p * .2;
      entorta += Math.sin(gt * Math.PI * 16) * .08 * (1 - gt);
    } else if (g === "bater") {
      /* ele vem pra frente e bate no vidro da tela */
      const p = Math.sin(gt * Math.PI * 3);
      esticaX = 1 + Math.abs(p) * .22; esticaY = 1 - Math.abs(p) * .12;
      entorta += p * .1;
    } else if (g === "derreter") {
      /* escorre pro chão */
      const p = suave(gt);
      esticaY = 1 - p * .55; esticaX = 1 + p * .4;
      sobe = p * A * .05;
      entorta += Math.sin(gt * 5) * .04;
    } else if (g === "espiar") {
      /* dá uma espiada pro lado, como quem está aprontando */
      entorta += Math.sin(gt * Math.PI) * .3;
      this.alvoOlhoX = Math.sin(gt * Math.PI) * .9;
    } else if (g === "ofegar") {
      /* o corpo inteiro puxando ar */
      const r = Math.sin(gt * Math.PI * 6);
      esticaY = 1 + r * .1; esticaX = 1 - r * .06;
      sobe = -Math.abs(r) * A * .015;
    } else if (g === "girarLouco") {
      gira = suave(gt) * Math.PI * 6;
      esticaX = 1 - Math.sin(gt * Math.PI) * .15;
    }

    /* fantasma: ele boia devagar em vez de pisar no chão */
    const assombrado = this.temEfeito("fantasma");
    if (assombrado) {
      sobe -= A * .05 + Math.sin(t * .9) * A * .035;
      entorta += Math.sin(t * .6) * .06;
    }

    /* respiração: ninguém fica totalmente parado. E cada humor respira do
       seu jeito: quem está ofegante puxa ar rápido, quem ferve treme. */
    const ritmo = H.ofega ? 7.5 : H.riso ? 9 : 1.7;
    const fundo = H.ofega ? .05 : H.riso ? .035 : .012;
    const resp = Math.sin(t * ritmo) * fundo;
    esticaY *= 1 + resp; esticaX *= 1 - resp * .6;
    entorta += Math.sin(t * .9) * .035 + H.torto * .16;
    if (H.ferve) entorta += Math.sin(t * 22) * .035 * H.ferve;      // fervendo
    if (H.tonto) gira += Math.sin(t * 1.6) * .25 * H.tonto;
    if (H.dorme) { entorta += Math.sin(t * 1.1) * .07; sobe += Math.sin(t * 1.1) * 3; }

    const escala = Math.min(L / 2.5, A / 2.9);
    /* já saiu de cena: não desenha nada */
    if (this.fora && this.saindo >= 1) return;
    /* indo embora: escorrega pra direita, gira e encolhe */
    const fugaX = this.saindo * L * .95;
    const fugaGiro = this.saindo * 1.4;
    const fugaEsc = 1 - this.saindo * .35;

    /* ---- a sombra no chão: fica na tela mesmo, sem girar junto ---- */
    /* fantasma não faz sombra. É o detalhe que entrega tudo. */
    ctx.save();
    ctx.globalAlpha = assombrado ? 0 : .16;
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.ellipse(L / 2 + fugaX, A * .55 + escala * 1.2,
      escala * (.5 + sobe / A * .5) * fugaEsc, escala * .09, 0, 0, 6.2832);
    ctx.fill();
    ctx.restore();

    ctx.save();
    if (assombrado) ctx.globalAlpha = .42 + Math.sin(t * 1.7) * .08;
    ctx.translate(L / 2 + fugaX, A * .55 + sobe - this.saindo * A * .05);
    ctx.rotate(gira + fugaGiro);
    ctx.scale(fugaEsc, fugaEsc);
    ctx.transform(esticaX, 0, entorta, esticaY, 0, 0);
    ctx.scale(escala, escala);

    /* ---- o arame ---- */
    ctx.lineCap = "round"; ctx.lineJoin = "round";
    /* uma sombrinha embaixo do arame dá volume sem precisar de 3D */
    ctx.lineWidth = .175;
    ctx.strokeStyle = "#5d6a7a";
    ctx.save(); ctx.translate(.012, .022); caminhoDoClipe(ctx); ctx.stroke(); ctx.restore();

    const brilho = ctx.createLinearGradient(-1, -1, 1, 1);
    if (this.temEfeito("vermelho")) {
      /* vermelho de raiva: 100 cutucadas fazem isso com qualquer um */
      const p = .5 + Math.sin(t * 9) * .5;
      brilho.addColorStop(0, "#ffb4b4");
      brilho.addColorStop(.4, "#e02a2a");
      brilho.addColorStop(.7, p > .5 ? "#ff5252" : "#b81414");
      brilho.addColorStop(1, "#8e0f0f");
    } else if (assombrado) {
      /* de fantasma o metal fica azulado e frio, quase apagado */
      brilho.addColorStop(0, "#eaf6ff");
      brilho.addColorStop(.5, "#a8c8e8");
      brilho.addColorStop(1, "#cfe4f6");
    } else if (this.temEfeito("arcoiris")) {
      /* o arame vira arco-íris girando: é a cara de quem viu coisa demais */
      const g = t * 90;
      for (let i = 0; i <= 6; i++)
        brilho.addColorStop(i / 6, "hsl(" + ((g + i * 60) % 360) + " 95% 62%)");
    } else {
      brilho.addColorStop(0, "#e8eef6");
      brilho.addColorStop(.35, "#aebccd");
      brilho.addColorStop(.55, "#dfe8f2");
      brilho.addColorStop(.8, "#8fa0b4");
      brilho.addColorStop(1, "#cfdae6");
    }
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
    if (this.temEfeito("ben")) this.desenharJaleco();
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

  /* MODO BEN: orelhas caídas, focinho e jaleco de cientista. Continua sendo o
     nosso clipe — é só um clipe fantasiado de cachorro de laboratório. */
  desenharJaleco() {
    const ctx = this.ctx;
    /* orelhas caídas, uma de cada lado da cabeça */
    ctx.fillStyle = "#8a6242"; ctx.strokeStyle = "#5d4028"; ctx.lineWidth = .035;
    for (const lado of [-1, 1]) {
      ctx.save();
      ctx.translate(lado * .52, -.92);
      ctx.rotate(lado * (.35 + Math.sin(this.t * 2.2 + lado) * .07));
      ctx.beginPath(); ctx.ellipse(0, .16, .13, .28, 0, 0, 6.2832);
      ctx.fill(); ctx.stroke();
      ctx.restore();
    }
    /* focinho no meio da cara */
    ctx.fillStyle = "#c9a180";
    ctx.beginPath(); ctx.ellipse(-.13, -.47, .17, .12, 0, 0, 6.2832); ctx.fill();
    ctx.strokeStyle = "#5d4028"; ctx.lineWidth = .028;
    ctx.beginPath(); ctx.ellipse(-.13, -.47, .17, .12, 0, 0, 6.2832); ctx.stroke();
    ctx.fillStyle = "#2b1c14";
    ctx.beginPath(); ctx.ellipse(-.13, -.53, .058, .042, 0, 0, 6.2832); ctx.fill();
    /* jaleco branco na parte de baixo do arame */
    ctx.fillStyle = "#f4f6f8"; ctx.strokeStyle = "#b9c2cc"; ctx.lineWidth = .03;
    ctx.beginPath();
    ctx.moveTo(-.60, -.16); ctx.lineTo(.60, -.16);
    ctx.lineTo(.52, .74); ctx.quadraticCurveTo(0, 1.02, -.52, .74);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = "#d3dae2"; ctx.lineWidth = .025;
    ctx.beginPath(); ctx.moveTo(-.02, -.16); ctx.lineTo(-.05, .82); ctx.stroke();
    ctx.fillStyle = "#5fb0e8";
    ctx.beginPath(); ctx.rect(.16, .1, .17, .2); ctx.fill();      // o bolso
  }

  desenharCara(H) {
    const ctx = this.ctx;
    /* QUATRO OLHOS: o par de sempre, mais um par menor logo abaixo. É a
       coisa mais simples de desenhar e a mais difícil de esquecer. */
    const quatro = this.temEfeito("quatroOlhos");
    /* de olho: pupila maior, e ela alcança mais longe dentro do olho */
    const espiando = this.temEfeito("deOlho");
    const olhos = quatro
      ? [[-.34, -.78], [.09, -.78], [-.26, -.46], [.02, -.46]]
      : [[-.31, -.70], [.06, -.70]];
    const tamanhos = quatro ? [1, 1, .62, .62] : [1, 1];
    const r0 = .21;
    const fecha = this.piscando > 0 ? 1 : H.dorme;
    const ax = 1, ay = Math.max(.06, H.abertura * (1 - fecha));

    for (let i = 0; i < olhos.length; i++) {
      const [ox, oy] = olhos[i];
      const r = r0 * tamanhos[i];
      /* olho de burro: um olho grande e um pequeno, cada um pra um lado */
      const bx = H.burro * (i === 0 ? -.055 : .05);
      const by = H.burro * (i === 0 ? .02 : -.03);
      const bEsc = 1 + H.burro * (i === 0 ? .3 : -.14);
      /* o branco do olho */
      ctx.save();
      ctx.translate(ox + bx, oy + by + H.olhaCima * -.02);
      ctx.scale(ax * bEsc, ay * bEsc);
      ctx.fillStyle = "#ffffff";
      ctx.beginPath(); ctx.arc(0, 0, r, 0, 6.2832); ctx.fill();
      ctx.restore();
      /* a bolinha preta, que corre atrás de onde ele está olhando */
      if (ay > .2) {
        /* de burro, cada pupila vai pra um canto e não segue mais nada */
        const solto = H.burro;
        const alcance = espiando ? .60 : .42;
        const px = ox + bx + mistura(this.olhoX * r * alcance,
          (i === 0 ? -.42 : .40) * r + Math.sin(this.t * 1.3 + i) * r * .12, solto);
        const py = oy + by + mistura((this.olhoY - H.olhaCima * .5) * r * (alcance - .04),
          (i === 0 ? .30 : -.26) * r + Math.cos(this.t * 1.1 + i * 2) * r * .1, solto);
        ctx.fillStyle = "#15181d";
        ctx.beginPath(); ctx.arc(px, py, r * (espiando ? .60 : .46), 0, 6.2832); ctx.fill();
        ctx.fillStyle = espiando ? "#ffffff66" : "#ffffffdd";
        ctx.beginPath(); ctx.arc(px - r * .16, py - r * .18, r * (espiando ? .09 : .13), 0, 6.2832); ctx.fill();
      }
      /* o contorno */
      ctx.save();
      ctx.translate(ox + bx, oy + by + H.olhaCima * -.02);
      ctx.scale(ax * bEsc, Math.max(.05, ay * bEsc));
      ctx.strokeStyle = "#2a3038"; ctx.lineWidth = .028 / Math.max(.05, ay);
      ctx.beginPath(); ctx.arc(0, 0, r, 0, 6.2832); ctx.stroke();
      ctx.restore();
    }

    /* ---- sobrancelhas: são elas que dizem o que ele está sentindo ---- */
    ctx.strokeStyle = "#2a3038"; ctx.lineWidth = .062; ctx.lineCap = "round";
    for (let i = 0; i < 2; i++) {
      const [ox, oy] = olhos[i];
      const lado = i === 0 ? -1 : 1;
      const y = oy - r0 - .1 - H.sobeSobrancelha * .12;
      const inclina = H.cenho * .16 * lado;
      ctx.beginPath();
      ctx.moveTo(ox - .17, y + inclina);
      ctx.quadraticCurveTo(ox, y - .05 + inclina * .3, ox + .17, y - inclina);
      ctx.stroke();
    }

    /* ---- o zZz de quem está dormindo ---- */
    /* Três zês subindo na diagonal, cada um numa parte da viagem: nasce
       pequeno e opaco perto da cabeça, sobe girando devagar, vai crescendo e
       sumindo. É o desenho mais antigo do mundo pra "está dormindo" — e
       funciona porque o olho segue o movimento, não a letra. */
    if (H.dorme > .3) {
      ctx.save();
      ctx.fillStyle = "#e8eef6";
      ctx.strokeStyle = "#2a3038";
      ctx.lineWidth = .028;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      for (let k = 0; k < 3; k++) {
        const f = ((this.t * .42) + k / 3) % 1;         // 0 = acabou de sair, 1 = sumiu
        const tam = (.26 + f * .34);
        ctx.globalAlpha = Math.min(1, (1 - f) * 1.6) * H.dorme;
        ctx.save();
        /* sobe pouco e de lado: o palco é baixinho, e um z que sai pela borda
           não é um z, é um risco cortado */
        ctx.translate(.50 + f * .40 + Math.sin(f * 5 + k) * .06, -.74 - f * .44);
        ctx.rotate(-.18 + Math.sin(f * 4 + k) * .16);
        ctx.font = "bold " + tam.toFixed(3) + "px Georgia, serif";
        ctx.fillText("z", 0, 0);
        ctx.strokeText("z", 0, 0);
        ctx.restore();
      }
      ctx.globalAlpha = 1;
      ctx.restore();
    }

    /* confete de comemoração e coraçõezinhos, que são o jeito mais barato de
       mostrar sentimento num desenho */
    if (H.festa > .3) {
      const cores = ["#ffc857", "#ff8fb1", "#7ee0a0", "#8fc9ff", "#c79bff"];
      for (let k = 0; k < 18; k++) {
        const f = (this.t * 1.15 + k * .056) % 1;
        const a = k / 18 * 6.2832;
        ctx.globalAlpha = (1 - f) * H.festa;
        ctx.fillStyle = cores[k % cores.length];
        ctx.save();
        ctx.translate(Math.cos(a) * (.45 + f * 1.15), -1.05 - Math.sin(a) * .35 + f * .75);
        ctx.rotate(this.t * 3 + k);
        ctx.fillRect(-.06, -.04, .12, .08);
        ctx.restore();
      }
      ctx.globalAlpha = 1;
    }
    if (H.coracao > .3) {
      ctx.fillStyle = "#ff5f83";
      for (let k = 0; k < 3; k++) {
        const f = (this.t * .8 + k * .33) % 1;
        ctx.globalAlpha = (1 - f) * H.coracao;
        const x = .35 + Math.sin(f * 6 + k) * .12, y = -.7 - f * .8, e = .09 * (1 - f * .3);
        ctx.beginPath();
        ctx.moveTo(x, y + e);
        ctx.bezierCurveTo(x - e * 1.5, y - e * .5, x - e * .4, y - e * 1.3, x, y - e * .45);
        ctx.bezierCurveTo(x + e * .4, y - e * 1.3, x + e * 1.5, y - e * .5, x, y + e);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    /* ---- a boca: um risco que vira sorriso ---- */
    if (H.dorme) {
      ctx.lineWidth = .05;
      ctx.beginPath(); ctx.arc(-.12, -.42, .07, 0, Math.PI); ctx.stroke();
    } else if (H.ofega > .5 || H.riso > .5) {
      /* ofegante: boca aberta pulsando, com a língua pra fora e gotinha.
         rindo: a mesma boca, mas em cima e batendo mais rápido. */
      const rapido = H.riso > .5 ? 11 : 6.5;
      const alt = .06 + Math.abs(Math.sin(this.t * rapido)) * (H.riso > .5 ? .075 : .06);
      const cy = quatro ? -.30 : -.36;
      ctx.fillStyle = "#3a2028";
      ctx.beginPath(); ctx.ellipse(-.12, cy, .115, alt, 0, 0, 6.2832); ctx.fill();
      ctx.fillStyle = "#ff8fb1";
      ctx.beginPath(); ctx.ellipse(-.10, cy + alt * .5, .05, alt * .5, .2, 0, 6.2832); ctx.fill();
      ctx.strokeStyle = "#2a3038"; ctx.lineWidth = .03;
      ctx.beginPath(); ctx.ellipse(-.12, cy, .115, alt, 0, 0, 6.2832); ctx.stroke();
      if (H.ofega > .5) {                       // as gotinhas de cansaço
        ctx.fillStyle = "#8fc9ffcc";
        for (let k = 0; k < 2; k++) {
          const f = (this.t * 1.6 + k * .5) % 1;
          ctx.beginPath();
          ctx.ellipse(.28 + k * .12, -.85 + f * .5, .035, .05, 0, 0, 6.2832);
          ctx.fill();
        }
      }
    } else if (H.burro > .5) {
      /* boca aberta e língua de fora: o retrato de quem não entendeu nada */
      ctx.fillStyle = "#3a2028";
      ctx.beginPath(); ctx.ellipse(-.12, -.37, .11, .075, 0, 0, 6.2832); ctx.fill();
      ctx.fillStyle = "#ff8fb1";
      ctx.beginPath();
      ctx.ellipse(-.09, -.32 + Math.sin(this.t * 2.4) * .012, .055, .045, .3, 0, 6.2832);
      ctx.fill();
      ctx.strokeStyle = "#2a3038"; ctx.lineWidth = .03;
      ctx.beginPath(); ctx.ellipse(-.12, -.37, .11, .075, 0, 0, 6.2832); ctx.stroke();
    } else {
      ctx.lineWidth = .055;
      ctx.beginPath();
      ctx.moveTo(-.30, -.40);
      ctx.quadraticCurveTo(-.12, -.40 + H.boca * .17, .06, -.40);
      ctx.stroke();
    }
  }
}
