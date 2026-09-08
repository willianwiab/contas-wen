/* ==========================================================================
   CAT CITY · main.js
   O jogo: o laço, o mundo desenhado e tudo que cola as peças.

   A cidade é vista de cima e de trás. Não é 3D de verdade: cada coisa vira
   um retângulo na tela e é desenhada de trás pra frente (quem tem y maior
   fica na frente). Isso dá a sensação de terceira pessoa, roda em qualquer
   computador e — o que importa aqui — deixa DEFORMAR o gato de graça, que é
   a alma do jogo: esticar, achatar, repetir e empilhar são só transformações
   de desenho.
   ========================================================================== */
import { gato, cabeca, carregarFotos } from "./sprites.js";
import { FORMAS, porId, indiceDe, desenharForma } from "./formas.js";
import { cidade, gerarCidade, paredes, gradeDeParedes, corromper, TAM, RUA } from "./city.js";
import { camera, seguir, sacudir, paraTela, naTela, APERTO_Y } from "./camera.js";
import { jogador, aplicarForma, formaAtual, desbloquear, usarPoder, atualizarJogador,
         truques, zerarTruques } from "./player.js";
import { gatos, criarPool, mudarTeto, nascerGato, multiplicar, espalharPelaCidade,
         pensarGatos, esbarrarGatos, quantosVivos, limparGatos, tetoAtual, TETO_PADRAO } from "./cats.js";
import { pensarEventos, forcarEvento, estadoEventos, EVENTOS } from "./events.js";
import { entrada, direcaoTeclado, lerControle, fecharQuadro, ligarToque, ligarBotoesDeToque, quandoMenu } from "./input.js";
import * as sfx from "./audio.js";
import * as ui from "./ui.js";
import { ligarAdm } from "./adm.js";

const cv = document.getElementById("tela"), ctx = cv.getContext("2d", { alpha:false });
let L = 0, A = 0, dpr = 1;
const jogo = {
  rodando:false, pausado:false, t:0, quadro:0, ultimo:0,
  peixes:0, pegadas:0, estrelas:0, segredos:0, caos:1, tremor:1,
  itens:[], portais:[], vencido:false, quandoVenceu:0,
};
const CHAVE = "catcity_v1";

/* ---------------------------------------------------------------- tela */
function ajustar() {
  dpr = Math.min(devicePixelRatio || 1, 2);
  L = innerWidth; A = innerHeight;
  cv.width = Math.round(L * dpr); cv.height = Math.round(A * dpr);
  cv.style.width = L + "px"; cv.style.height = A + "px";
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
addEventListener("resize", ajustar);

/* ---------------------------------------------------------------- o mundo */
function novaCidade(semente = Math.floor(Math.random() * 9999)) {
  gerarCidade(semente);
  jogo.itens = []; jogo.portais = [];
  const r = () => Math.random();

  /* Colecionáveis espalhados: peixe, pegada, caixa, clipe e estrela. A conta
     acompanha o tamanho da cidade — numa cidade maior, mais coisa no chão,
     senão andar dez quarteirões sem achar nada fica sem graça. */
  const quarteiroes = cidade.colunas * cidade.linhas;
  const porQuarteirao = q => Math.max(4, Math.round(q * quarteiroes / 49));
  const tipos = [
    { k:"peixe", e:"🐟", n:porQuarteirao(70) }, { k:"pegada", e:"🐾", n:porQuarteirao(40) },
    { k:"caixa", e:"📦", n:porQuarteirao(16) }, { k:"clipe", e:"📎", n:porQuarteirao(14) },
    { k:"estrela", e:"⭐", n:porQuarteirao(10) },
  ];
  for (const t of tipos) for (let i = 0; i < t.n; i++)
    jogo.itens.push({ tipo:t.k, e:t.e, x:2 + r() * (cidade.largura - 4), y:2 + r() * (cidade.altura - 4),
                      z:.6, pego:false, fase:r() * 6.28 });

  /* os pedestais de transformação: cada forma tem o seu, largado pela cidade */
  const ordem = FORMAS.slice(1);
  ordem.forEach((f, i) => {
    const ang = i / ordem.length * 6.2832;
    const raio = (14 + (i % 4) * 13) * (cidade.largura / 147);   // espalha junto com a cidade
    const x = cidade.largura / 2 + Math.cos(ang) * raio;
    const y = cidade.altura / 2 + Math.sin(ang) * raio * .9;
    jogo.itens.push({ tipo:"forma", forma:f.id, e:f.emoji, pego:false, fase:r() * 6.28,
      x:Math.max(3, Math.min(cidade.largura - 3, x)),
      y:Math.max(3, Math.min(cidade.altura - 3, y)), z:1.1,
      secreto:["arvore", "pernaM", "megaLarva"].includes(f.id) });
  });

  /* ---- OS SEGREDOS ---- */
  jogo.portais = [
    { id:"beco",   e:"🕳️", x:RUA / 2 + 1.5, y:RUA / 2 + 1.5, txt:"o beco dos gatos",
      conta:"Tinha uma pilha de gatos aqui atrás. Eles não explicaram nada.", achado:false },
    { id:"sala",   e:"🚪", x:cidade.largura - RUA, y:cidade.altura - RUA, txt:"a sala secreta",
      conta:"A sala está cheia de gatos até o teto. Um deles acena.", achado:false },
    { id:"botao",  e:"🔴", x:cidade.largura / 2 + 22, y:cidade.altura / 2 - 20, txt:"um botão gigante",
      conta:"Só uma perna muito grande alcança isso. A cidade inteira mudou.",
      precisa:["pernaG", "pernaM", "megaLarva"], achado:false },
    { id:"gigante",e:"🌀", x:RUA, y:cidade.altura - RUA, txt:"a área dos gigantes",
      conta:"Aqui todo mundo fica gigante. Inclusive você.", achado:false },
    { id:"portal", e:"🐛", x:cidade.largura - RUA * 1.4, y:RUA * 1.4, txt:"portal da MEGA LARVA",
      conta:"Não devia ter portal nenhum aqui.", precisaFormas:9, achado:false },
  ];
}

function recomecar(mantendoFormas) {
  novaCidade();
  refazerParedes();                  // a cidade é outra: as paredes têm que ser também
  limparGatos();
  espalharPelaCidade(Math.max(24, Math.round(tetoAtual() * .12)), jogo.t);
  jogador.x = cidade.largura / 2; jogador.y = cidade.altura / 2;
  jogador.z = 0; jogador.vx = jogador.vy = jogador.vz = 0;
  if (!mantendoFormas) { jogador.desbloqueadas = ["normal"]; jogo.segredos = 0; jogo.vencido = false; }
  aplicarForma("normal");
  camera.x = jogador.x; camera.y = jogador.y;
  /* ter virado MEGA LARVA uma vez fica pra sempre: recomeçar a cidade não apaga */
  ui.montarBarraFormas(jogador.desbloqueadas, jogador.forma);
}

/* ---------------------------------------------------------------- save */
function salvar() {
  try {
    localStorage.setItem(CHAVE, JSON.stringify({
      v:2, formas:jogador.desbloqueadas, peixes:jogo.peixes, pegadas:jogo.pegadas,
      estrelas:jogo.estrelas, segredos:jogo.segredos, vencido:jogo.vencido,
      volume:sfx.som.volume, caos:jogo.caos, teto:opTeto, tremor:jogo.tremor, toque:modoToque,
    }));
  } catch (e) {}
}
function carregar() {
  let d = null;
  try { d = JSON.parse(localStorage.getItem(CHAVE) || "null"); } catch (e) {}
  if (!d) return;
  if (Array.isArray(d.formas)) jogador.desbloqueadas = d.formas.filter(id => FORMAS.some(f => f.id === id));
  if (!jogador.desbloqueadas.includes("normal")) jogador.desbloqueadas.unshift("normal");
  jogo.peixes = d.peixes || 0; jogo.pegadas = d.pegadas || 0; jogo.estrelas = d.estrelas || 0;
  jogo.segredos = d.segredos || 0; jogo.vencido = !!d.vencido;
  if (typeof d.volume === "number") sfx.volume(d.volume);
  if (typeof d.caos === "number") jogo.caos = d.caos;
  if (typeof d.tremor === "number") jogo.tremor = d.tremor;
  /* quem já jogava tinha o teto antigo (320) guardado: a cidade grande
     merece os mil gatos, então o save velho sobe pro novo padrão */
  if (typeof d.teto === "number") opTeto = d.v >= 2 ? d.teto : Math.max(TETO_PADRAO, d.teto);
  if (typeof d.toque === "string") modoToque = d.toque;
}

/* ---------------------------------------------------------------- desenho */
const CEU = [["#8fc4e8", "#cfe6f5"], ["#8fb8e0", "#e8d8c0"], ["#a09ad8", "#e8c0d0"],
             ["#8c6fb0", "#e0a0b8"], ["#5a3d70", "#c07a9a"]];
function desenharCeu(fase) {
  const c = CEU[Math.min(CEU.length - 1, fase - 1)];
  const g = ctx.createLinearGradient(0, 0, 0, A);
  g.addColorStop(0, c[0]); g.addColorStop(1, c[1]);
  ctx.fillStyle = g; ctx.fillRect(0, 0, L, A);
}
/* gatos boiando no céu quando a coisa aperta */
function ceuDeGatos(fase) {
  if (fase < 3) return;
  const img = gato(0), n = (fase - 2) * 9;
  ctx.globalAlpha = .3;
  for (let i = 0; i < n; i++) {
    const x = ((i * 137.5) % 100 / 100) * L + Math.sin(jogo.t * .2 + i) * 30;
    const y = ((i * 61.8) % 100 / 100) * A * .42;
    const s = 22 + (i % 4) * 12;
    ctx.drawImage(img, x - s / 2, y - s / 2, s, s);
  }
  ctx.globalAlpha = 1;
}

function quadNaTela(x, y, l, f, z) {
  const [ax, ay] = paraTela(x, y, z, L, A);
  const [bx, by] = paraTela(x + l, y + f, z, L, A);
  return [ax, ay, bx - ax, by - ay];
}
function desenharChao() {
  /* asfalto */
  ctx.fillStyle = "#3a3a40";
  const [ax, ay, aw, ah] = quadNaTela(-40, -40, cidade.largura + 80, cidade.altura + 80, 0);
  ctx.fillRect(ax, ay, aw, ah);
  /* calçadas: um retângulo claro por quarteirão */
  const PASSO = TAM + RUA;
  ctx.fillStyle = "#9a978e";
  for (let qy = 0; qy < cidade.linhas; qy++) for (let qx = 0; qx < cidade.colunas; qx++) {
    const x = qx * PASSO + RUA / 2 - 1.4, y = qy * PASSO + RUA / 2 - 1.4;
    if (!naTela(x + TAM / 2, y + TAM / 2, L, A, TAM)) continue;
    const [sx, sy, sw, sh] = quadNaTela(x, y, TAM + 2.8, TAM + 2.8, 0);
    ctx.fillRect(sx, sy, sw, sh);
  }
  /* faixas da rua e faixa de pedestre */
  ctx.fillStyle = "#e8e4d8";
  for (let qy = 0; qy <= cidade.linhas; qy++) {
    const y = qy * PASSO - RUA / 2;
    for (let x = 0; x < cidade.largura; x += 4) {
      if (!naTela(x, y, L, A, 8)) continue;
      const [sx, sy, sw, sh] = quadNaTela(x, y - .1, 2, .22, .02);
      ctx.fillRect(sx, sy, sw, Math.max(1, sh));
    }
  }
  for (let qx = 0; qx <= cidade.colunas; qx++) {
    const x = qx * PASSO - RUA / 2;
    for (let y = 0; y < cidade.altura; y += 4) {
      if (!naTela(x, y, L, A, 8)) continue;
      const [sx, sy, sw, sh] = quadNaTela(x - .1, y, .22, 2, .02);
      ctx.fillRect(sx, sy, Math.max(1, sw), sh);
    }
  }
}

function sombra(x, y, r, alpha = .3) {
  const [sx, sy] = paraTela(x, y, 0, L, A);
  ctx.globalAlpha = alpha;
  ctx.fillStyle = "#000";
  ctx.beginPath();
  ctx.ellipse(sx, sy, r * camera.zoom, r * camera.zoom * APERTO_Y, 0, 0, 6.2832);
  ctx.fill();
  ctx.globalAlpha = 1;
}

function desenharPredio(p) {
  const z = camera.zoom;
  const [fx, fy] = paraTela(p.x, p.y + p.f, 0, L, A);
  const [fx2] = paraTela(p.x + p.l, p.y + p.f, 0, L, A);
  const [, topoY] = paraTela(p.x, p.y + p.f, p.alt, L, A);
  const larg = fx2 - fx, altura = fy - topoY;
  /* topo */
  const [, topoTrasY] = paraTela(p.x, p.y, p.alt, L, A);
  ctx.fillStyle = "#0000002a";
  ctx.fillRect(fx, topoTrasY, larg, topoY - topoTrasY);
  ctx.fillStyle = p.cor;
  ctx.fillRect(fx, topoTrasY, larg, topoY - topoTrasY + 1);
  /* parede da frente */
  const gr = ctx.createLinearGradient(0, topoY, 0, fy);
  gr.addColorStop(0, p.cor);
  gr.addColorStop(1, "#00000066");
  ctx.fillStyle = gr;
  ctx.fillRect(fx, topoY, larg, altura);
  /* janelas */
  const cols = Math.max(2, Math.round(p.l / 1.7)), lins = p.janelas;
  const jw = larg / cols * .58, jh = altura / lins * .5;
  for (let i = 0; i < cols; i++) for (let k = 0; k < lins; k++) {
    const acesa = ((i * 7 + k * 13 + p.semente) | 0) % 5 < 2;
    ctx.fillStyle = acesa ? "#ffd98a" : "#2a2f38";
    ctx.fillRect(fx + larg / cols * (i + .21), topoY + altura / lins * (k + .25), jw, jh);
  }
  /* a loja no térreo */
  if (p.loja && altura > 24) {
    ctx.fillStyle = "#241c22";
    ctx.fillRect(fx + larg * .3, fy - altura * .13, larg * .4, altura * .13);
    ctx.fillStyle = "#ffb84d";
    ctx.fillRect(fx + larg * .1, fy - altura * .17, larg * .8, Math.max(2, altura * .03));
  }
  /* ---- e aí o prédio começa a criar gato ---- */
  if (p.gato > .05) {
    const img = gato(0), n = Math.round(p.gato * 7);
    const s = Math.min(larg * .5, 26 + p.gato * 20);
    for (let i = 0; i < n; i++) {
      const x = fx + larg * ((i * .37 + p.semente * .01) % 1);
      const y = topoTrasY - s * (.4 + ((i * .21) % 1) * .5);
      ctx.globalAlpha = Math.min(1, p.gato * 1.4);
      ctx.drawImage(img, x - s / 2, y, s, s);
      /* e uns pendurados na parede, de cabeça pra baixo, como nas fotos */
      if (i % 2 === 0 && p.gato > .5) {
        ctx.save();
        ctx.translate(x, topoY + altura * (.25 + (i % 3) * .22));
        ctx.scale(1, -1);
        ctx.drawImage(img, -s * .35, 0, s * .7, s * .7);
        ctx.restore();
      }
    }
    ctx.globalAlpha = 1;
  }
}

function desenharArvore(a) {
  const z = camera.zoom;
  const [sx, sy] = paraTela(a.x, a.y, 0, L, A);
  const h = a.alt * z * .8;
  sombra(a.x, a.y, a.alt * .22);
  if (a.gato < .95) {
    ctx.globalAlpha = 1 - a.gato;
    ctx.strokeStyle = "#6b4a2a"; ctx.lineWidth = Math.max(2, z * .22);
    ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx, sy - h * .5); ctx.stroke();
    ctx.fillStyle = "#3f7a42";
    ctx.beginPath(); ctx.ellipse(sx, sy - h * .68, z * a.alt * .32, z * a.alt * .3, 0, 0, 6.2832); ctx.fill();
    ctx.fillStyle = "#4f9152";
    ctx.beginPath(); ctx.ellipse(sx - z * .5, sy - h * .78, z * a.alt * .22, z * a.alt * .2, 0, 0, 6.2832); ctx.fill();
    ctx.globalAlpha = 1;
  }
  if (a.gato > .05) {                       // a árvore vira gato: a copa vira cabeça
    const c = cabeca(0), s = z * a.alt * .34 * a.gato;
    ctx.globalAlpha = a.gato;
    ctx.strokeStyle = "#7a6a58"; ctx.lineWidth = Math.max(2, z * .2);
    ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx, sy - h * .5); ctx.stroke();
    for (let i = 0; i < 5; i++) {
      const ang = i / 5 * 6.2832 + a.semente;
      ctx.drawImage(c, sx + Math.cos(ang) * z * a.alt * .2 - s / 2,
                    sy - h * .7 + Math.sin(ang) * z * a.alt * .16 - s / 2, s, s);
    }
    ctx.globalAlpha = 1;
  }
}

function desenharCarro(c) {
  const z = camera.zoom;
  const l = c.ang ? 1.8 : 4.2, f = c.ang ? 4.2 : 1.8;
  sombra(c.x, c.y, 1.4, .25);
  if (c.gato < .9) {
    ctx.globalAlpha = 1 - c.gato;
    const [sx, sy, sw, sh] = quadNaTela(c.x - l / 2, c.y - f / 2, l, f, 0);
    const [, topo] = paraTela(c.x, c.y, 1.5, L, A);
    ctx.fillStyle = "#00000055"; ctx.fillRect(sx, topo, sw, sy - topo);
    ctx.fillStyle = c.cor; ctx.fillRect(sx, topo, sw, (sy - topo) * .82);
    ctx.fillStyle = "#bcd6e8"; ctx.fillRect(sx + sw * .18, topo + 2, sw * .64, (sy - topo) * .34);
    ctx.globalAlpha = 1;
  }
  if (c.gato > .1) {                        // o carro vira gato-carro
    ctx.globalAlpha = c.gato;
    const [sx, sy] = paraTela(c.x, c.y, 0, L, A);
    ctx.save(); ctx.translate(sx, sy);
    desenharForma(ctx, porId("carro"), z * 1.5, jogo.t + c.semente, false, !c.ang, 0);
    ctx.restore();
    ctx.globalAlpha = 1;
  }
}

function desenharPoste(p) {
  const z = camera.zoom;
  const [sx, sy] = paraTela(p.x, p.y, 0, L, A);
  const [, topo] = paraTela(p.x, p.y, 5.4, L, A);
  ctx.strokeStyle = "#4a4f57"; ctx.lineWidth = Math.max(1.5, z * .1);
  ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx, topo); ctx.stroke();
  ctx.fillStyle = "#ffe9a8";
  ctx.beginPath(); ctx.ellipse(sx, topo, z * .3, z * .18, 0, 0, 6.2832); ctx.fill();
  if (p.gato > .3) {                        // um gato sentado no poste. normal.
    const img = gato(0), s = z * 1.1;
    ctx.globalAlpha = p.gato;
    ctx.drawImage(img, sx - s / 2, topo - s, s, s);
    ctx.globalAlpha = 1;
  }
}
function desenharSemaforo(s) {
  const z = camera.zoom;
  const [sx, sy] = paraTela(s.x, s.y, 0, L, A);
  const [, topo] = paraTela(s.x, s.y, 4, L, A);
  ctx.strokeStyle = "#3f444b"; ctx.lineWidth = Math.max(1.5, z * .09);
  ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx, topo); ctx.stroke();
  ctx.fillStyle = "#22262c";
  ctx.fillRect(sx - z * .22, topo - z * .9, z * .44, z * .9);
  const cores = ["#e8483c", "#e8c93c", "#3ce86a"];
  const luz = (Math.floor(jogo.t * .5) + s.luz) % 3;
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = i === luz ? cores[i] : "#00000066";
    ctx.beginPath(); ctx.arc(sx, topo - z * .75 + i * z * .28, z * .1, 0, 6.2832); ctx.fill();
  }
}
function desenharPlaca(p) {
  const z = camera.zoom;
  const [sx, sy] = paraTela(p.x, p.y, 0, L, A);
  const [, topo] = paraTela(p.x, p.y, 2.4, L, A);
  ctx.strokeStyle = "#6a6f77"; ctx.lineWidth = Math.max(1, z * .06);
  ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx, topo); ctx.stroke();
  ctx.fillStyle = "#e8e4d8";
  const w = Math.max(10, z * 1.5), h = Math.max(6, z * .5);
  ctx.fillRect(sx - w / 2, topo - h, w, h);
  ctx.fillStyle = "#22262c";
  ctx.font = "700 " + Math.max(5, z * .3) + "px ui-monospace, monospace";
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText(p.txt, sx, topo - h / 2);
}

function desenharGatoNPC(g) {
  const z = camera.zoom;
  const [sx, sy] = paraTela(g.x, g.y, g.z, L, A);
  const perto = Math.abs(g.x - jogador.x) < 26 && Math.abs(g.y - jogador.y) < 26;
  const tam = g.escala * z * VISUAL;
  if (tam < 5) {                             // muito longe: dois pixels e acabou
    ctx.fillStyle = "#6e6154";
    ctx.fillRect(sx - 2, sy - 4, 4, 4);
    return;
  }
  sombra(g.x, g.y, g.escala * .4, .22);
  const img = gato(g.qual);
  const bal = perto ? Math.sin(g.fase * 2) * tam * .04 : 0;
  ctx.save();
  ctx.translate(sx, sy + bal);
  if (g.vx < 0) ctx.scale(-1, 1);
  ctx.drawImage(img, -tam * .5, -tam, tam, tam);
  ctx.restore();
}

/* Nada de emoji dentro da cidade: os itens são desenhados. O emoji só existe
   nos ícones da interface, lá em cima. O pedestal de transformação mostra um
   GATO de verdade, já deformado na forma que ele dá — é o melhor aviso
   possível de "vira isto aqui". */
function desenharItem(it) {
  if (it.pego) return;
  const z = camera.zoom;
  const sobe = Math.sin(jogo.t * 2 + it.fase) * .18;
  const [sx, sy] = paraTela(it.x, it.y, it.z + sobe, L, A);
  sombra(it.x, it.y, .35, .2);
  if (it.tipo === "forma") {
    const f = porId(it.forma);
    ctx.globalAlpha = .3 + Math.sin(jogo.t * 3 + it.fase) * .12;
    ctx.fillStyle = it.secreto ? "#c79bff" : "#ffc857";
    ctx.beginPath(); ctx.arc(sx, sy, z * 1.5, 0, 6.2832); ctx.fill();
    ctx.globalAlpha = 1;
    ctx.save();
    ctx.translate(sx, sy + z * .9);
    const escala = Math.min(1, 2.4 / Math.max(1, f.alto));
    desenharForma(ctx, f, z * VISUAL * .8 * escala, jogo.t + it.fase, false, true, 0);
    ctx.restore();
    return;
  }
  const t = Math.max(3, z * .34);
  ctx.save();
  ctx.translate(sx, sy);
  ctx.rotate(Math.sin(jogo.t * 1.6 + it.fase) * .25);
  switch (it.tipo) {
    case "peixe":                                   // um peixinho de lado
      ctx.fillStyle = "#8fc9ff";
      ctx.beginPath(); ctx.ellipse(0, 0, t * 1.5, t * .8, 0, 0, 6.2832); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(t * 1.3, 0); ctx.lineTo(t * 2.2, -t * .8); ctx.lineTo(t * 2.2, t * .8);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#12303f";
      ctx.beginPath(); ctx.arc(-t * .7, -t * .16, t * .2, 0, 6.2832); ctx.fill();
      break;
    case "pegada": {                                 // uma pegada de gato
      ctx.fillStyle = "#ffd9e4";
      ctx.beginPath(); ctx.ellipse(0, t * .35, t * .8, t * .62, 0, 0, 6.2832); ctx.fill();
      for (let i = 0; i < 4; i++) {
        const a = -2.5 + i * .55;
        ctx.beginPath();
        ctx.ellipse(Math.cos(a) * t * .85, Math.sin(a) * t * .85 - t * .1, t * .26, t * .32, a, 0, 6.2832);
        ctx.fill();
      }
      break;
    }
    case "estrela": {
      ctx.fillStyle = "#ffe08a";
      ctx.beginPath();
      for (let i = 0; i < 10; i++) {
        const a = -1.5708 + i * .6283, r = i % 2 ? t * .7 : t * 1.7;
        i ? ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r) : ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
      }
      ctx.closePath(); ctx.fill();
      break;
    }
    case "caixa":
      ctx.fillStyle = "#b98b52"; ctx.fillRect(-t, -t * .9, t * 2, t * 1.8);
      ctx.strokeStyle = "#8a6432"; ctx.lineWidth = Math.max(1, t * .2);
      ctx.beginPath(); ctx.moveTo(0, -t * .9); ctx.lineTo(0, t * .9); ctx.stroke();
      break;
    default:                                         // o clipe
      ctx.strokeStyle = "#c9ccd4"; ctx.lineWidth = Math.max(1.2, t * .28); ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(-t * .4, -t); ctx.lineTo(-t * .4, t * .7);
      ctx.arc(0, t * .7, t * .4, Math.PI, 0, true);
      ctx.lineTo(t * .4, -t * .5);
      ctx.stroke();
  }
  ctx.restore();
}
function desenharPortal(p) {
  const z = camera.zoom;
  const [sx, sy] = paraTela(p.x, p.y, .8 + Math.sin(jogo.t * 1.6) * .2, L, A);
  /* um redemoinho: anéis girando, e uma cabeça de gato no meio */
  ctx.globalAlpha = .22 + Math.sin(jogo.t * 2.2) * .1;
  ctx.fillStyle = p.achado ? "#7ee0a0" : "#ff8fb1";
  ctx.beginPath(); ctx.arc(sx, sy, z * 2, 0, 6.2832); ctx.fill();
  ctx.globalAlpha = .5;
  ctx.strokeStyle = p.achado ? "#7ee0a0" : "#ff8fb1";
  for (let i = 1; i <= 3; i++) {
    ctx.lineWidth = Math.max(1, z * .09);
    ctx.beginPath();
    ctx.arc(sx, sy, z * i * .55, jogo.t * (i % 2 ? 1.4 : -1.1), jogo.t * (i % 2 ? 1.4 : -1.1) + 4.2);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  const c = cabeca(0), s = z * 1.5;
  ctx.drawImage(c, sx - s / 2, sy - s / 2, s, s);
}

/* ---------------------------------------------------------------- o quadro */
function desenharMundo(fase) {
  desenharCeu(fase);
  ceuDeGatos(fase);
  desenharChao();

  /* junta tudo que tem profundidade e desenha de trás pra frente */
  const fila = [];
  const cabe = (x, y, folga) => naTela(x, y, L, A, folga);
  for (const p of cidade.predios) if (cabe(p.x + p.l / 2, p.y + p.f / 2, 26)) fila.push({ y:p.y + p.f, d:() => desenharPredio(p) });
  for (const a of cidade.arvores) if (cabe(a.x, a.y, 10)) fila.push({ y:a.y, d:() => desenharArvore(a) });
  for (const c of cidade.carros)  if (cabe(c.x, c.y, 8))  fila.push({ y:c.y, d:() => desenharCarro(c) });
  for (const p of cidade.postes)  if (cabe(p.x, p.y, 8))  fila.push({ y:p.y, d:() => desenharPoste(p) });
  for (const s of cidade.semaforos) if (cabe(s.x, s.y, 8)) fila.push({ y:s.y, d:() => desenharSemaforo(s) });
  for (const p of cidade.placas)  if (cabe(p.x, p.y, 8))  fila.push({ y:p.y, d:() => desenharPlaca(p) });
  for (const it of jogo.itens)    if (!it.pego && cabe(it.x, it.y, 6)) fila.push({ y:it.y, d:() => desenharItem(it) });
  for (const p of jogo.portais)   if (cabe(p.x, p.y, 8))  fila.push({ y:p.y, d:() => desenharPortal(p) });
  for (const g of gatos) if (g.vivo && cabe(g.x, g.y, 8)) fila.push({ y:g.y, d:() => desenharGatoNPC(g) });
  fila.push({ y:jogador.y + .01, d:desenharJogador });

  fila.sort((a, b) => a.y - b.y);
  for (const f of fila) f.d();
}
/* O gato é desenhado maior do que ele "mede" no mundo. Um gato de 1 metro
   numa câmera que mostra 46 metros vira um borrão de 16 pixels — e o rosto é
   justamente o que precisa aparecer. A colisão continua no tamanho certo. */
const VISUAL = 2.4;
function desenharJogador() {
  const f = formaAtual();
  sombra(jogador.x, jogador.y, jogador.raio * 1.1, .34);
  const [sx, sy] = paraTela(jogador.x, jogador.y, jogador.z, L, A);
  ctx.save();
  ctx.translate(sx, sy);
  desenharForma(ctx, f, camera.zoom * VISUAL * truques.gigante, jogo.t, jogador.andando, jogador.olhandoDir, 0);
  ctx.restore();
}

/* ---------------------------------------------------------------- lógica */
let paredesLista = [], gradeParedes = gradeDeParedes([]);
function refazerParedes() {
  paredesLista = paredes();
  gradeParedes = gradeDeParedes(paredesLista);
}
let opTeto = TETO_PADRAO, modoToque = "auto";

function pegarCoisas(agora) {
  const f = formaAtual();
  for (const it of jogo.itens) {
    if (it.pego) continue;
    const d = Math.hypot(it.x - jogador.x, it.y - jogador.y);
    if (it.tipo === "forma") {
      if (d > f.raio + 1.6) continue;
      if (!entrada.usarAgora) { if (d < f.raio + 1.6) ui.recado("aperte E pra virar " + porId(it.forma).nome); continue; }
      it.pego = true;
      const novo = desbloquear(it.forma);
      trocarPara(it.forma);
      sfx.transformar(indiceDe(it.forma));
      ui.faixa(porId(it.forma).nome.toUpperCase(), porId(it.forma).conta);
      if (novo) ui.recado("🐈 forma nova: " + porId(it.forma).nome);
      salvar();
      continue;
    }
    if (d < f.raio + 1.1) {
      it.pego = true;
      if (it.tipo === "peixe") { jogo.peixes++; sfx.miar(.9); }
      else if (it.tipo === "pegada") { jogo.pegadas++; sfx.passo(false); }
      else if (it.tipo === "estrela") { jogo.estrelas++; sfx.fanfarra(); multiplicar(agora, 1, 24); }
      else { jogo.caixaOuClipe = true; jogo.peixes += 2; sfx.pancada(.4); }
      /* juntar coisa também faz gato aparecer. Claro que faz. */
      if ((jogo.peixes + jogo.pegadas) % 8 === 0) {
        nascerGato(jogador.x + (Math.random() - .5) * 6, jogador.y + (Math.random() - .5) * 6, agora);
        sfx.miar(.4);
      }
    }
  }
  /* segredos */
  for (const p of jogo.portais) {
    const d = Math.hypot(p.x - jogador.x, p.y - jogador.y);
    if (d > 3) continue;
    if (p.precisa && !p.precisa.includes(jogador.forma)) {
      ui.recado("🔒 " + p.txt + " — precisa de uma perna bem maior"); continue;
    }
    if (p.precisaFormas && jogador.desbloqueadas.length < p.precisaFormas) {
      ui.recado("🔒 " + p.txt + " — junte " + p.precisaFormas + " formas primeiro"); continue;
    }
    if (!entrada.usarAgora) { ui.recado("aperte E — " + p.txt); continue; }
    abrirSegredo(p, agora);
  }
}

function abrirSegredo(p, agora) {
  if (!p.achado) { p.achado = true; jogo.segredos++; sfx.fanfarra(); }
  ui.faixa("SEGREDO", p.conta);
  switch (p.id) {
    case "beco":
      for (let i = 0; i < 24; i++) nascerGato(p.x + (Math.random() - .5) * 6, p.y + (Math.random() - .5) * 6, agora);
      desbloquear("larvaP"); trocarPara("larvaP"); break;
    case "sala":
      for (let i = 0; i < 40; i++) nascerGato(p.x + (Math.random() - .5) * 8, p.y + (Math.random() - .5) * 8,
        agora, { z:Math.random() * 10, escala:.6 + Math.random() });
      desbloquear("arvore"); break;
    case "botao":
      for (const c of cidade.carros) c.gato = 1;
      for (const a of cidade.arvores) a.gato = 1;
      for (const pr of cidade.predios) pr.gato = 1;
      multiplicar(agora, 2, 120); sacudir(2); sfx.terremoto(); break;
    case "gigante":
      for (const g of gatos) if (g.vivo) { g.escala *= 2.4; g.raio = .38 * g.escala; g.massa = g.escala; }
      desbloquear("pernaM"); sacudir(1.2); break;
    case "portal":
      desbloquear("megaLarva"); trocarPara("megaLarva");
      forcarEvento("megaLarva", agora, jogador, ui.faixa);
      vencer(); break;
  }
  salvar();
}

function trocarPara(id) {
  if (!jogador.desbloqueadas.includes(id)) return false;
  aplicarForma(id);
  ui.montarBarraFormas(jogador.desbloqueadas, jogador.forma);
  sfx.transformar(indiceDe(id));
  return true;
}
function vencer(forcar) {
  if (jogo.vencido && !forcar) return;      // o adm pode pedir a festa de novo
  jogo.vencido = true; jogo.quandoVenceu = jogo.t;
  document.getElementById("vitoriaTexto").innerHTML =
    "Você virou a <b>MEGA LARVA</b>.<br>A cidade continua exatamente onde estava. Você é que não." +
    "<br><br>Formas: <b>" + jogador.desbloqueadas.length + " / " + FORMAS.length + "</b> · " +
    "segredos: <b>" + jogo.segredos + " / 5</b> · 🐟 <b>" + jogo.peixes + "</b>";
  sfx.fanfarra();
  setTimeout(() => { jogo.pausado = true; ui.tela("telaVitoria"); }, 2600);
  salvar();
}
function amassado() {
  if (truques.imortal) return;
  if (jogo.t < (jogador.invencivelAte || 0)) return;
  jogador.invencivelAte = jogo.t + 4;
  document.getElementById("fimTexto").innerHTML =
    "Um gato grande demais passou por cima de você.<br>Não foi por mal. Ele nem viu.";
  jogo.pausado = true; ui.tela("telaFim");
  sfx.pancada(1); sacudir(1.4);
}

/* ---------------------------------------------------------------- laço */
function passo(agora) {
  requestAnimationFrame(passo);
  const dt = Math.min(.05, (agora - jogo.ultimo) / 1000 || .016);
  jogo.ultimo = agora;
  if (!jogo.rodando) return;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  if (jogo.pausado) { desenharMundo(faseAgora().n); return; }
  jogo.t += dt; jogo.quadro++;

  /* ---- entrada ---- */
  const temPad = lerControle();
  let dir = { x:entrada.x, y:entrada.y };
  if (!temPad && !entrada.temToque) dir = direcaoTeclado();
  else if (Math.hypot(entrada.x, entrada.y) < .12 && !temPad) dir = direcaoTeclado();

  if (entrada.formaAnterior) {
    const i = jogador.desbloqueadas.indexOf(jogador.forma);
    trocarPara(jogador.desbloqueadas[(i - 1 + jogador.desbloqueadas.length) % jogador.desbloqueadas.length]);
  }
  if (entrada.formaDireta >= 0 && entrada.formaDireta < FORMAS.length) {
    const id = FORMAS[entrada.formaDireta].id;
    if (!trocarPara(id)) ui.recado("🔒 ainda não achou " + FORMAS[entrada.formaDireta].nome);
  }
  if (entrada.poderAgora) {
    const r = usarPoder(jogo.t);
    if (r) reagirAoPoder(r);
  }

  /* ---- mundo ---- */
  const quebrou = atualizarJogador(dt, dir, entrada.pularAgora, jogo.t, gradeParedes);
  if (quebrou) quebrar(quebrou);
  pensarGatos(dt, jogador, gradeParedes, jogo.t, jogo.quadro);
  const pertinho = esbarrarGatos(jogador);
  pegarCoisas(jogo.t);

  /* um gato gigante passando por cima de um gato pequeno: acabou */
  for (const g of gatos) {
    if (!g.vivo || g.escala < 6) continue;
    if (formaAtual().massa > 20) continue;
    if (Math.hypot(g.x - jogador.x, g.y - jogador.y) < g.raio * .8) { amassado(); break; }
  }

  const fase = faseAgora();
  corromper((fase.n - 1) / 4 * (jogo.caos / 100));
  pensarEventos(dt, jogo.t, fase.n, jogador, ui.faixa);
  sfx.ambienteCidade(Math.min(1, quantosVivos() / 220) * (jogo.caos / 100));

  camera.forcaTremor = jogo.tremor / 100;
  seguir(jogador, dt, jogador.alto, A);
  desenharMundo(fase.n);

  /* ---- HUD ---- */
  if ((jogo.quadro & 7) === 0) {
    ui.atualizarHud({ forma:jogador.forma, desbloqueadas:jogador.desbloqueadas,
      peixes:jogo.peixes, pegadas:jogo.pegadas, estrelas:jogo.estrelas,
      segredos:jogo.segredos, gatos:quantosVivos() });
  }
  if ((jogo.quadro % 300) === 0) salvar();
  fecharQuadro();
}
const faseAgora = () => ui.faseDe(jogador.desbloqueadas.length + jogo.segredos);

function reagirAoPoder(r) {
  if (r.tipo === "miar") {
    for (const g of gatos) {
      if (!g.vivo) continue;
      const d = Math.hypot(g.x - jogador.x, g.y - jogador.y);
      if (d < r.raio) { g.alvoX = jogador.x; g.alvoY = jogador.y; g.pensa = 2.5; g.medo = 0; }
    }
    ui.recado("miau");
  }
  if (r.tipo === "rolar" || r.tipo === "acelerar") sacudir(.25);
  if (r.tipo === "passo") { sacudir(.7); derrubarPerto(r.alcance, 12); }
  if (r.tipo === "buzinar") { sacudir(.5); derrubarPerto(9, 18); }
  if (r.tipo === "esmagar") {
    sacudir(2); derrubarPerto(r.raio, 30);
    multiplicar(jogo.t, 1, 40);
  }
  if (r.tipo === "enraizar") ui.recado(r.ligado ? "🌳 criou raiz" : "🌳 soltou as raízes");
}
function derrubarPerto(raio, forca) {
  for (const g of gatos) {
    if (!g.vivo) continue;
    const dx = g.x - jogador.x, dy = g.y - jogador.y, d = Math.hypot(dx, dy) || 1;
    if (d > raio) continue;
    g.vx += dx / d * forca; g.vy += dy / d * forca; g.vz = 5 + Math.random() * 5;
  }
  for (const c of cidade.carros) {
    if (Math.hypot(c.x - jogador.x, c.y - jogador.y) < raio) c.gato = Math.min(1, c.gato + .5);
  }
}
function quebrar(p) {
  if (p.tipo === "caixa") {
    const i = cidade.caixas.indexOf(p.ref);
    if (i >= 0) { cidade.caixas.splice(i, 1); sfx.pancada(.8); refazerParedes();
      for (let k = 0; k < 3; k++) nascerGato(p.ref.x, p.ref.y, jogo.t); }
  } else if (p.tipo === "carro") {
    p.ref.gato = 1; sfx.vidro(); sacudir(.5);
  } else if (p.tipo === "predio") {
    p.ref.gato = Math.min(1, p.ref.gato + .35); sfx.pancada(1); sacudir(.9);
  }
}

/* ---------------------------------------------------------------- menus */
function comecar(novaPartida) {
  ui.tela(null);
  sfx.ligarAudio();
  if (novaPartida || !jogo.rodando) recomecar(true);
  jogo.rodando = true; jogo.pausado = false; jogo.ultimo = performance.now();
  ui.montarBarraFormas(jogador.desbloqueadas, jogador.forma);
}
function pausar() {
  if (!jogo.rodando) return;
  jogo.pausado = true;
  const f = faseAgora();
  document.getElementById("pausaResumo").innerHTML =
    "Fase <b>" + f.n + " · " + f.nome + "</b><br>" + f.conta +
    "<br><br>Formas <b>" + jogador.desbloqueadas.length + "/" + FORMAS.length + "</b> · segredos <b>" +
    jogo.segredos + "/5</b> · gatos na cidade <b>" + quantosVivos() + "</b>";
  ui.tela("telaPausa");
}
quandoMenu(() => { if (jogo.rodando && !ui.telaAberta()) pausar(); else if (jogo.pausado) comecar(false); });

ui.botao("btJogar", () => comecar(true));
ui.botao("btComoJogar", () => ui.tela("telaComo"));
ui.botao("btVoltaComo", () => ui.tela("telaMenu"));
ui.botao("btFormas", () => { ui.montarGradeFormas(jogador.desbloqueadas); ui.tela("telaFormas"); });
ui.botao("btVoltaFormas", () => ui.tela(jogo.rodando ? "telaPausa" : "telaMenu"));
ui.botao("btOpcoes", () => ui.tela("telaOpcoes"));
ui.botao("btVoltaOpcoes", () => ui.tela(jogo.rodando ? "telaPausa" : "telaMenu"));
ui.botao("btContinuar", () => comecar(false));
ui.botao("btPausaFormas", () => { ui.montarGradeFormas(jogador.desbloqueadas); ui.tela("telaFormas"); });
ui.botao("btPausaOpcoes", () => ui.tela("telaOpcoes"));
ui.botao("btReiniciar", () => { recomecar(true); comecar(false); });
ui.botao("btSair", () => { jogo.pausado = true; ui.tela("telaMenu"); });
ui.botao("btVitoriaSeguir", () => comecar(false));
ui.botao("btVitoriaMenu", () => ui.tela("telaMenu"));
ui.botao("btFimVoltar", () => {
  jogador.x = cidade.largura / 2; jogador.y = cidade.altura / 2; jogador.z = 2;
  jogador.vx = jogador.vy = 0; comecar(false);
});
ui.botao("btFimMenu", () => ui.tela("telaMenu"));

const opVol = document.getElementById("opVolume");
opVol.oninput = e => { sfx.volume(+e.target.value / 100); salvar(); };
document.getElementById("opCaos").oninput = e => { jogo.caos = +e.target.value; salvar(); };
document.getElementById("opTremor").oninput = e => { jogo.tremor = +e.target.value; salvar(); };
document.getElementById("opGatos").oninput = e => { opTeto = +e.target.value; mudarTeto(opTeto); salvar(); };
document.getElementById("opToque").onclick = e => {
  modoToque = modoToque === "auto" ? "sempre" : modoToque === "sempre" ? "nunca" : "auto";
  e.target.textContent = modoToque === "auto" ? "AUTOMÁTICO" : modoToque === "sempre" ? "SEMPRE" : "NUNCA";
  aplicarToque(); salvar();
};
document.getElementById("opApagar").onclick = () => {
  if (!confirm("Apagar todo o progresso do Cat City?")) return;
  try { localStorage.removeItem(CHAVE); } catch (e) {}
  location.reload();
};
function aplicarToque() {
  const temDedo = matchMedia("(pointer: coarse)").matches;
  ligarToque(modoToque === "sempre" || (modoToque === "auto" && temDedo));
}

/* ---------------------------------------------------------------- começo */
ajustar();
carregar();
criarPool(opTeto);
novaCidade();
refazerParedes();
recomecar(true);
ligarBotoesDeToque();
aplicarToque();
opVol.value = Math.round(sfx.som.volume * 100);
document.getElementById("opCaos").value = jogo.caos;
document.getElementById("opTremor").value = jogo.tremor;
document.getElementById("opGatos").value = opTeto;
document.getElementById("opToque").textContent =
  modoToque === "auto" ? "AUTOMÁTICO" : modoToque === "sempre" ? "SEMPRE" : "NUNCA";
ui.montarBarraFormas(jogador.desbloqueadas, jogador.forma);
ui.atualizarHud({ forma:jogador.forma, desbloqueadas:jogador.desbloqueadas, peixes:jogo.peixes,
  pegadas:jogo.pegadas, estrelas:jogo.estrelas, segredos:jogo.segredos, gatos:0 });
carregarFotos().then(achou => { if (achou) ui.recado("🐈 usando as fotos de assets/cats/"); });
requestAnimationFrame(passo);

/* ---------------------------------------------------------------- adm */
/* Tudo que o painel de administrador precisa mexer, num lugar só. O adm.js
   não sabe nada do jogo por dentro: ele só chama estas funções. */
const API = {
  jogo, jogador, gatos, cidade, camera, truques, zerarTruques,
  FORMAS, porId, EVENTOS, FASES:ui.FASES, aplicarForma,
  trocarPara, desbloquear, faseAgora, vencer, amassado, recomecar, comecar, pausar,
  nascerGato, multiplicar, espalharPelaCidade, limparGatos, quantosVivos, tetoAtual,
  forcarEvento:id => forcarEvento(id, jogo.t, jogador, ui.faixa),
  abrirSegredo:p => abrirSegredo(p, jogo.t),
  paredes:() => paredesLista,
  refazerParedes,
  ui, sfx, salvar, CHAVE,
  /* nascer gatos perto de você, que é onde dá pra ver a bagunça acontecer */
  gatosPerto(n) {
    let fez = 0, livres = tetoAtual() - quantosVivos();   // conta uma vez só
    for (let i = 0; i < n; i++) {
      if (livres-- <= 0) break;
      const a = Math.random() * 6.2832, r = 1.5 + Math.random() * 14;
      nascerGato(jogador.x + Math.cos(a) * r, jogador.y + Math.sin(a) * r, jogo.t,
        { vz: 2 + Math.random() * 4 });
      fez++;
    }
    return fez;
  },
  mudarTeto(n) {
    opTeto = Math.max(60, Math.min(3000, Math.round(n)));
    mudarTeto(opTeto);                       // cresce o pool sem matar quem já está vivo
    const s = document.getElementById("opGatos");
    if (opTeto <= +s.max) s.value = opTeto;
    salvar();
    return opTeto;
  },
  levarPara(x, y) {
    jogador.x = x; jogador.y = y; jogador.z = 1.2;
    jogador.vx = jogador.vy = jogador.vz = 0;
    camera.x = x; camera.y = y;
  },
  desbloquearTudo() { for (const f of FORMAS) desbloquear(f.id); ui.montarBarraFormas(jogador.desbloqueadas, jogador.forma); salvar(); },
  trancarTudo() {
    jogador.desbloqueadas = ["normal"]; jogo.segredos = 0; jogo.vencido = false;
    for (const p of jogo.portais) p.achado = false;
    trocarPara("normal"); ui.montarBarraFormas(jogador.desbloqueadas, jogador.forma); salvar();
  },
  apagarTudo() {
    try { localStorage.removeItem(CHAVE); } catch (e) {}
    location.reload();
  },
};
ligarAdm(API);

/* deixa o teste (e a curiosidade) alcançarem o jogo por fora */
window.CatCity = Object.assign({}, API, { paredes:() => paredesLista });
