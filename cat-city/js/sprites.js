/* ==========================================================================
   CAT CITY · sprites.js
   O GATO.

   O jogo inteiro é feito de UM gato. Todas as 13 formas são deformações
   dessa mesma figura — esticada, achatada, repetida, empilhada. É a regra
   que o JoJo pediu: em vez de treze desenhos diferentes, um gato e treze
   maneiras de torcê-lo.

   Enquanto não houver as fotos de verdade em assets/cats/, o gato é
   desenhado aqui por código, imitando uma foto: pelo com fiapos e ruído,
   listras de tabby, olho com íris, pupila em fenda e brilho, focinho rosa e
   bigodes. Assim que os arquivos aparecerem na pasta, o carregador troca
   sozinho e nada mais muda.
   ========================================================================== */

/* As pelagens saem das fotos de referência: o gato do vídeo é um TABBY COM
   BRANCO — cabeça e costas rajadas de marrom-acinzentado, peito, focinho e
   patas brancos. É essa a cara que o jogo inteiro repete. */
export const PELAGENS = [
  { nome:"tabby",   base:"#8a7a68", claro:"#b9a894", escuro:"#4e4238", olho:"#c8b24a", branco:"#f2ece4" },
  { nome:"cinza",   base:"#8b8f96", claro:"#c3c7cd", escuro:"#575b62", olho:"#f0c24a", branco:"#eff1f3" },
  { nome:"laranja", base:"#c8813f", claro:"#e8b273", escuro:"#8a5223", olho:"#8fd14f", branco:"#f6ede2" },
  { nome:"escuro",  base:"#5c5148", claro:"#7d7469", escuro:"#332e2a", olho:"#7ee0a0", branco:"#e6e0d6" },
  { nome:"claro",   base:"#c9bda9", claro:"#e8e0d2", escuro:"#8a7d69", olho:"#6fd0ff", branco:"#faf6ef" },
];

/* ruído determinístico: o mesmo gato sai igual em qualquer computador */
function semente(n) {
  let s = n * 1103515245 + 12345;
  return () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };
}

const LADO = 256;
const guardados = new Map();
export const fotos = { gato:null, extras:[], perna:null };

/* --------------------------------------------------------------------------
   o desenho do gato "fotográfico"
   -------------------------------------------------------------------------- */
function desenharGato(g, pele, rnd) {
  const c = LADO / 2;

  /* ---- sombra de baixo, pra colar no chão ---- */
  g.save();
  g.globalAlpha = .28;
  g.fillStyle = "#000";
  g.beginPath(); g.ellipse(c, LADO * .93, LADO * .3, LADO * .05, 0, 0, 6.2832); g.fill();
  g.restore();

  /* ---- corpo ---- */
  const corpo = g.createRadialGradient(c - 22, LADO * .52, 10, c, LADO * .62, LADO * .46);
  corpo.addColorStop(0, pele.claro);
  corpo.addColorStop(.55, pele.base);
  corpo.addColorStop(1, pele.escuro);
  g.fillStyle = corpo;
  g.beginPath(); g.ellipse(c, LADO * .64, LADO * .29, LADO * .27, 0, 0, 6.2832); g.fill();

  /* o peito e a barriga brancos — é o que faz o gato ser bicolor como o da foto */
  g.save();
  g.beginPath(); g.ellipse(c, LADO * .64, LADO * .29, LADO * .27, 0, 0, 6.2832); g.clip();
  const barriga = g.createLinearGradient(0, LADO * .58, 0, LADO * .92);
  barriga.addColorStop(0, pele.branco + "00");
  barriga.addColorStop(.35, pele.branco + "cc");
  barriga.addColorStop(1, pele.branco);
  g.fillStyle = barriga;
  g.beginPath(); g.ellipse(c - LADO * .03, LADO * .78, LADO * .23, LADO * .19, 0, 0, 6.2832); g.fill();
  g.restore();

  /* rabo, saindo por trás */
  g.strokeStyle = pele.base; g.lineWidth = LADO * .075; g.lineCap = "round";
  g.beginPath();
  g.moveTo(c + LADO * .24, LADO * .72);
  g.quadraticCurveTo(c + LADO * .46, LADO * .66, c + LADO * .40, LADO * .40);
  g.stroke();

  /* patinhas da frente, brancas */
  g.fillStyle = pele.branco;
  for (const dx of [-LADO * .13, LADO * .09]) {
    g.beginPath(); g.ellipse(c + dx, LADO * .855, LADO * .075, LADO * .045, 0, 0, 6.2832); g.fill();
  }

  /* ---- cabeça ---- */
  const cy = LADO * .34;
  /* orelhas */
  for (const s of [-1, 1]) {
    g.fillStyle = pele.escuro;
    g.beginPath();
    g.moveTo(c + s * LADO * .09, cy - LADO * .17);
    g.lineTo(c + s * LADO * .215, cy - LADO * .30);
    g.lineTo(c + s * LADO * .215, cy - LADO * .09);
    g.closePath(); g.fill();
    g.fillStyle = "#e79aa6";
    g.beginPath();
    g.moveTo(c + s * LADO * .115, cy - LADO * .155);
    g.lineTo(c + s * LADO * .195, cy - LADO * .255);
    g.lineTo(c + s * LADO * .195, cy - LADO * .115);
    g.closePath(); g.fill();
  }
  const cab = g.createRadialGradient(c - 16, cy - 16, 8, c, cy, LADO * .25);
  cab.addColorStop(0, pele.claro);
  cab.addColorStop(.6, pele.base);
  cab.addColorStop(1, pele.escuro);
  g.fillStyle = cab;
  g.beginPath(); g.ellipse(c, cy, LADO * .215, LADO * .195, 0, 0, 6.2832); g.fill();

  /* a máscara branca: focinho, queixo e o risco no meio da testa */
  g.save();
  g.beginPath(); g.ellipse(c, cy, LADO * .215, LADO * .195, 0, 0, 6.2832); g.clip();
  g.fillStyle = pele.branco;
  g.beginPath(); g.ellipse(c, cy + LADO * .105, LADO * .145, LADO * .105, 0, 0, 6.2832); g.fill();
  g.beginPath();
  g.moveTo(c - LADO * .028, cy - LADO * .19);
  g.lineTo(c + LADO * .028, cy - LADO * .19);
  g.lineTo(c + LADO * .045, cy + LADO * .05);
  g.lineTo(c - LADO * .045, cy + LADO * .05);
  g.closePath(); g.fill();
  g.restore();

  /* ---- listras de tabby ---- */
  g.save();
  g.globalAlpha = .5; g.strokeStyle = pele.escuro; g.lineCap = "round";
  for (let i = 0; i < 5; i++) {                       // no lombo, só na parte escura
    const y = LADO * (.46 + i * .045);
    const w = LADO * (.2 - Math.abs(i - 3) * .028);
    g.lineWidth = LADO * .022;
    g.beginPath();
    g.moveTo(c - w, y); g.quadraticCurveTo(c, y - LADO * .03, c + w, y);
    g.stroke();
  }
  for (let i = 0; i < 4; i++) {                       // na testa
    g.lineWidth = LADO * .016;
    g.beginPath();
    g.moveTo(c - LADO * .09 + i * LADO * .06, cy - LADO * .17);
    g.lineTo(c - LADO * .07 + i * LADO * .055, cy - LADO * .07);
    g.stroke();
  }
  g.restore();

  /* ---- o pelo: fiapos curtos, é o que dá cara de foto ---- */
  g.save();
  g.lineCap = "round";
  for (let i = 0; i < 1500; i++) {
    const a = rnd() * 6.2832, r = Math.sqrt(rnd());
    const naCabeca = rnd() < .38;
    const px = naCabeca ? c + Math.cos(a) * r * LADO * .215 : c + Math.cos(a) * r * LADO * .29;
    const py = naCabeca ? cy + Math.sin(a) * r * LADO * .195 : LADO * .64 + Math.sin(a) * r * LADO * .27;
    const claro = rnd();
    const naParteBranca = !naCabeca ? py > LADO * .68 : py > cy + LADO * .05;
    g.globalAlpha = .1 + rnd() * (naParteBranca ? .14 : .22);
    g.strokeStyle = naParteBranca ? (claro < .6 ? "#ffffff" : pele.claro)
                  : claro < .4 ? pele.claro : claro < .8 ? pele.escuro : "#ffffff";
    g.lineWidth = .7 + rnd() * .9;
    const ang = Math.atan2(py - (naCabeca ? cy : LADO * .64), px - c) + (rnd() - .5) * .8;
    const comp = 3 + rnd() * 6;
    g.beginPath();
    g.moveTo(px, py);
    g.lineTo(px + Math.cos(ang) * comp, py + Math.sin(ang) * comp);
    g.stroke();
  }
  g.restore();

  /* ---- focinho ---- */
  g.fillStyle = pele.branco;
  g.beginPath(); g.ellipse(c, cy + LADO * .075, LADO * .085, LADO * .06, 0, 0, 6.2832); g.fill();
  g.fillStyle = "#e2707f";
  g.beginPath();
  g.moveTo(c - LADO * .028, cy + LADO * .038);
  g.lineTo(c + LADO * .028, cy + LADO * .038);
  g.lineTo(c, cy + LADO * .072);
  g.closePath(); g.fill();
  g.strokeStyle = "#00000066"; g.lineWidth = 1.6;
  g.beginPath();
  g.moveTo(c, cy + LADO * .072); g.lineTo(c, cy + LADO * .095);
  g.moveTo(c, cy + LADO * .095); g.quadraticCurveTo(c - LADO * .04, cy + LADO * .12, c - LADO * .055, cy + LADO * .085);
  g.moveTo(c, cy + LADO * .095); g.quadraticCurveTo(c + LADO * .04, cy + LADO * .12, c + LADO * .055, cy + LADO * .085);
  g.stroke();

  /* ---- olhos: é aqui que o bicho fica vivo ---- */
  for (const s of [-1, 1]) {
    const ox = c + s * LADO * .085, oy = cy - LADO * .01;
    g.fillStyle = "#1c1418";
    g.beginPath(); g.ellipse(ox, oy, LADO * .058, LADO * .05, 0, 0, 6.2832); g.fill();
    const iris = g.createRadialGradient(ox - 3, oy - 3, 2, ox, oy, LADO * .05);
    iris.addColorStop(0, "#ffffff");
    iris.addColorStop(.25, pele.olho);
    iris.addColorStop(1, "#2c3a16");
    g.fillStyle = iris;
    g.beginPath(); g.ellipse(ox, oy, LADO * .05, LADO * .043, 0, 0, 6.2832); g.fill();
    g.fillStyle = "#120e10";                        // pupila em fenda
    g.beginPath(); g.ellipse(ox, oy, LADO * .014, LADO * .04, 0, 0, 6.2832); g.fill();
    g.fillStyle = "#ffffffdd";                      // brilho
    g.beginPath(); g.ellipse(ox - LADO * .016, oy - LADO * .016, LADO * .014, LADO * .011, -.5, 0, 6.2832); g.fill();
    g.fillStyle = "#ffffff55";
    g.beginPath(); g.arc(ox + LADO * .018, oy + LADO * .016, LADO * .006, 0, 6.2832); g.fill();
  }

  /* ---- bigodes ---- */
  g.strokeStyle = "#ffffffcc"; g.lineWidth = 1.3;
  for (const s of [-1, 1]) for (let i = 0; i < 3; i++) {
    g.globalAlpha = .8 - i * .12;
    g.beginPath();
    g.moveTo(c + s * LADO * .045, cy + LADO * .06 + i * 4);
    g.quadraticCurveTo(c + s * LADO * .18, cy + LADO * .03 + i * 8,
                       c + s * LADO * .30, cy + (i - 1) * 10);
    g.stroke();
  }
  g.globalAlpha = 1;

  /* ---- um leve escurecido nas bordas, que é o que foto tem e desenho não ---- */
  const vin = g.createRadialGradient(c, LADO * .55, LADO * .2, c, LADO * .55, LADO * .58);
  vin.addColorStop(0, "#00000000");
  vin.addColorStop(1, "#00000055");
  g.fillStyle = vin;
  g.globalCompositeOperation = "source-atop";
  g.fillRect(0, 0, LADO, LADO);
  g.globalCompositeOperation = "source-over";
}

/* --------------------------------------------------------------------------
   a figurinha pronta de cada pelagem, desenhada uma vez só
   -------------------------------------------------------------------------- */
function gatoCru(qual = 0) {
  const i = ((qual % PELAGENS.length) + PELAGENS.length) % PELAGENS.length;
  if (fotos.gato && i === 0) return fotos.gato;
  if (fotos.extras[i - 1]) return fotos.extras[i - 1];
  let c = guardados.get(i);
  if (c) return c;
  c = document.createElement("canvas");
  c.width = c.height = LADO;
  desenharGato(c.getContext("2d"), PELAGENS[i], semente(1000 + i * 7919));
  guardados.set(i, c);
  return c;
}

/* --------------------------------------------------------------------------
   GATO PINTADO

   As mil formas precisam parecer mil coisas diferentes, e a cor é o jeito
   mais barato de conseguir isso: o mesmo gato com uma demão por cima já é
   outro bicho. A demão é feita UMA vez e fica guardada — pintar a cada
   quadro derreteria tudo.

   A gaveta tem tamanho limitado (as últimas 20 usadas) porque em tese são
   5 pelagens x 12 tintas; na prática só umas poucas aparecem na tela ao
   mesmo tempo, então a gaveta quase nunca precisa jogar nada fora.
   -------------------------------------------------------------------------- */
/* São 5 pelagens x 9 tintas = 45 corpos pintados no máximo, e outros tantos
   rostos. Duas gavetas separadas com 48 lugares cada garantem que nenhuma
   pintura precise ser refeita durante a partida — repintar um canvas de 256px
   no meio do quadro era o que derrubava o jogo pra 13 fps na fase 5. */
const TETO_PINTURA = 48;
const pintadosCorpo = new Map(), pintadosRosto = new Map();
function pintar(fonte, cor, forca, lado) {
  const c = document.createElement("canvas");
  c.width = c.height = lado;
  const g = c.getContext("2d");
  g.drawImage(fonte, 0, 0, lado, lado);
  g.globalCompositeOperation = "source-atop";   // só onde já tem gato
  g.globalAlpha = forca;
  g.fillStyle = cor; g.fillRect(0, 0, lado, lado);
  g.globalAlpha = 1; g.globalCompositeOperation = "source-over";
  return c;
}
function daGaveta(gaveta, chave, faz) {
  let c = gaveta.get(chave);
  if (c) { gaveta.delete(chave); gaveta.set(chave, c); return c; }   // usada agora: vai pro fim
  c = faz();
  gaveta.set(chave, c);
  if (gaveta.size > TETO_PINTURA) gaveta.delete(gaveta.keys().next().value);
  return c;
}

export function gato(qual = 0, cor = null, forca = .42) {
  const cru = gatoCru(qual);
  if (!cor) return cru;
  return daGaveta(pintadosCorpo, qual + "|" + cor + "|" + forca,
    () => pintar(cru, cor, forca, LADO));
}

/* só a cabeça, recortada — serve pras formas que precisam do rosto grande */
const cabecas = new Map();
export function cabeca(qual = 0, cor = null, forca = .42) {
  if (cor) return daGaveta(pintadosRosto, qual + "|" + cor + "|" + forca,
    () => pintar(cabeca(qual), cor, forca, 128));
  const i = ((qual % PELAGENS.length) + PELAGENS.length) % PELAGENS.length;
  let c = cabecas.get(i);
  if (c) return c;
  const fonte = gatoCru(i);
  c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d");
  /* a cabeça do gato desenhado fica no terço de cima; nas fotos, quase sempre também */
  g.drawImage(fonte, fonte.width * .24, fonte.height * .04, fonte.width * .52, fonte.height * .52,
              0, 0, 128, 128);
  cabecas.set(i, c);
  return c;
}

/* --------------------------------------------------------------------------
   carregar as fotos de verdade, se existirem
   -------------------------------------------------------------------------- */
function carregarUma(caminho) {
  return new Promise(ok => {
    const img = new Image();
    img.onload = () => ok(img);
    img.onerror = () => ok(null);
    img.src = caminho;
  });
}
export async function carregarFotos() {
  const [g, g2, g3, g4, perna] = await Promise.all([
    carregarUma("assets/cats/gato.png"),
    carregarUma("assets/cats/gato2.png"),
    carregarUma("assets/cats/gato3.png"),
    carregarUma("assets/cats/gato4.png"),
    carregarUma("assets/cats/perna.png"),
  ]);
  fotos.gato = g; fotos.extras = [g2, g3, g4].filter(Boolean); fotos.perna = perna;
  cabecas.clear();
  return !!g;
}

/* --------------------------------------------------------------------------
   AS PEÇAS DAS REFERÊNCIAS

   Nas fotos, as pernas do gato gigante NÃO são pernas: são gatos inteiros
   pendurados de cabeça pra baixo, andando. E o corpo da mega larva não é um
   corpo: são dezenas de traseiros de gato empacotados em fileiras.
   Estas funções desenham exatamente essas duas peças, e as formas montam o
   bicho com elas.
   -------------------------------------------------------------------------- */

/* um gato inteiro virado de cabeça pra baixo, que é como as "pernas" aparecem */
export function pernaGato(ctx, x, y, largura, altura, fase, qual = 0, cor = null) {
  const img = gato(qual, cor);
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(Math.sin(fase) * .1);                 // o balanço do passo
  ctx.scale(1, -1);                                 // de cabeça pra baixo
  ctx.drawImage(img, -largura / 2, 0, largura, altura);
  ctx.restore();
}

/* um pedaço do corpo da larva: um monte de gato apertado, visto de trás */
export function nacoDeGatos(ctx, x, y, largura, altura, semente2, qual = 0, cor = null) {
  const img = gato(qual, cor);
  ctx.save();
  ctx.translate(x, y);
  const linhas = 2, colunas = 3;
  for (let l = 0; l < linhas; l++) for (let k = 0; k < colunas; k++) {
    const dx = (k - (colunas - 1) / 2) * largura * .34;
    const dy = (l - (linhas - 1) / 2) * altura * .3;
    const t = Math.sin(semente2 + l * 1.7 + k * .9);
    ctx.save();
    ctx.translate(dx, dy + t * altura * .04);
    ctx.rotate(t * .12);
    ctx.drawImage(img, -largura * .28, -altura * .3, largura * .56, altura * .62);
    ctx.restore();
  }
  ctx.restore();
}
