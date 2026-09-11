/* ==========================================================================
   JojoOS · sistema.js
   O GERENCIADOR DE JANELAS.

   É a peça que faz um monte de <div> parecer um computador: abrir, fechar,
   arrastar, esticar, minimizar, maximizar, e saber qual está na frente.

   Uma janela é um objeto simples:
     { id, nome, fig, el, corpo, aba, aoFechar }

   Quem cria janela não mexe em nada disso: chama abrir({...}) e recebe o
   corpo pra encher do jeito que quiser.
   ========================================================================== */

const $ = s => document.querySelector(s);

export const janelas = new Map();          // id → janela
let contador = 0;
let zTopo = 100;
let daFrente = null;

const mesaEl = () => $("#mesa");
const abasEl = () => $("#abertas");

/* ---- onde a próxima janela nasce: em escadinha, pra não empilhar igual ---- */
let degrau = 0;
function lugarNovo(largura, altura) {
  const m = mesaEl().getBoundingClientRect();
  const estreito = m.width < 760;
  if (estreito) {
    /* em tela pequena a janela ocupa quase tudo: não adianta escadinha */
    return { x: 6, y: 6, l: Math.min(largura, m.width - 12), a: Math.min(altura, m.height - 12) };
  }
  const l = Math.min(largura, m.width - 40);
  const a = Math.min(altura, m.height - 40);
  const passo = 26;
  const x = 40 + (degrau % 6) * passo;
  const y = 22 + (degrau % 6) * passo;
  degrau++;
  return { x: Math.min(x, m.width - l - 8), y: Math.min(y, m.height - a - 8), l, a };
}

/* ==========================================================================
   ABRIR
   ========================================================================== */
export function abrir({ id, nome, fig = "🪟", largura = 620, altura = 420,
                        semBorda = false, aoFechar = null, botoesExtras = [] }) {
  /* já está aberta? então só traz pra frente. É o que um computador faz. */
  if (id && janelas.has(id)) { const j = janelas.get(id); restaurar(j); trazerPraFrente(j); return j; }

  const meuId = id || ("j" + (++contador));
  const pos = lugarNovo(largura, altura);

  const el = document.createElement("section");
  el.className = "janela";
  el.dataset.id = meuId;
  el.style.left = pos.x + "px";
  el.style.top = pos.y + "px";
  el.style.width = pos.l + "px";
  el.style.height = pos.a + "px";
  el.setAttribute("role", "dialog");
  el.setAttribute("aria-label", nome);

  const barra = document.createElement("div");
  barra.className = "barraTitulo";
  barra.innerHTML = '<span class="nome"><span aria-hidden="true"></span><span class="txt"></span></span>' +
                    '<span class="bts"></span>';
  barra.querySelector(".nome span[aria-hidden]").textContent = fig;
  barra.querySelector(".txt").textContent = nome;

  const bts = barra.querySelector(".bts");
  for (const extra of botoesExtras) {
    const b = document.createElement("button");
    b.className = "bt quadrado"; b.type = "button";
    b.textContent = extra.rotulo; b.title = extra.titulo || extra.rotulo;
    b.onclick = e => { e.stopPropagation(); extra.faz(janela); };
    bts.appendChild(b);
  }
  const btMin = botao("_", "minimizar");
  const btMax = botao("□", "aumentar");
  const btFecha = botao("✕", "fechar"); btFecha.classList.add("fecha");
  bts.append(btMin, btMax, btFecha);

  const corpo = document.createElement("div");
  corpo.className = "corpo" + (semBorda ? " semBorda" : "");

  const puxador = document.createElement("div");
  puxador.className = "puxador";
  puxador.title = "esticar";

  el.append(barra, corpo, puxador);
  mesaEl().appendChild(el);

  /* a abinha na barra de tarefas */
  const aba = document.createElement("button");
  aba.className = "bt aba"; aba.type = "button";
  aba.innerHTML = '<span aria-hidden="true"></span><span></span>';
  aba.children[0].textContent = fig;
  aba.children[1].textContent = nome;
  aba.onclick = () => {
    if (daFrente === janela && !el.classList.contains("minimizada")) minimizar(janela);
    else { restaurar(janela); trazerPraFrente(janela); }
  };
  abasEl().appendChild(aba);

  const janela = { id: meuId, nome, fig, el, corpo, aba, aoFechar, cheia: false, antes: null };
  janelas.set(meuId, janela);

  btMin.onclick = e => { e.stopPropagation(); minimizar(janela); };
  btMax.onclick = e => { e.stopPropagation(); alternarCheia(janela); };
  btFecha.onclick = e => { e.stopPropagation(); fechar(janela); };
  barra.ondblclick = e => { if (!e.target.closest("button")) alternarCheia(janela); };

  el.addEventListener("pointerdown", () => trazerPraFrente(janela), true);
  arrastar(janela, barra);
  esticar(janela, puxador);
  trazerPraFrente(janela);
  avisar("abriu", janela);
  return janela;
}

function botao(txt, titulo) {
  const b = document.createElement("button");
  b.className = "bt quadrado"; b.type = "button";
  b.textContent = txt; b.title = titulo;
  b.setAttribute("aria-label", titulo);
  return b;
}

/* ==========================================================================
   FECHAR · MINIMIZAR · MAXIMIZAR · FRENTE
   ========================================================================== */
export function fechar(j) {
  if (!janelas.has(j.id)) return;
  if (j.aoFechar) { try { j.aoFechar(j); } catch (e) {} }
  j.el.remove(); j.aba.remove();
  janelas.delete(j.id);
  if (daFrente === j) {
    daFrente = null;
    /* passa a frente pra janela visível mais alta que sobrou */
    const resto = [...janelas.values()].filter(x => !x.el.classList.contains("minimizada"));
    if (resto.length) trazerPraFrente(resto.sort((a, b) => +a.el.style.zIndex - +b.el.style.zIndex).pop());
  }
  avisar("fechou", j);
}
export const fecharPorId = id => { const j = janelas.get(id); if (j) fechar(j); };

export function minimizar(j) {
  j.el.classList.add("minimizada");
  j.aba.classList.remove("ativa");
  if (daFrente === j) daFrente = null;
  avisar("minimizou", j);
}
export function restaurar(j) { j.el.classList.remove("minimizada"); }

export function alternarCheia(j) {
  if (j.cheia) {
    Object.assign(j.el.style, j.antes);
    j.el.classList.remove("cheia");
    j.cheia = false;
  } else {
    j.antes = { left: j.el.style.left, top: j.el.style.top,
                width: j.el.style.width, height: j.el.style.height };
    j.el.classList.add("cheia");
    j.cheia = true;
  }
  avisar("mudouTamanho", j);
}

export function trazerPraFrente(j) {
  if (daFrente === j && !j.el.classList.contains("minimizada")) return;
  restaurar(j);
  j.el.style.zIndex = ++zTopo;
  for (const outra of janelas.values()) {
    const eh = outra === j;
    outra.el.classList.toggle("frente", eh);
    outra.aba.classList.toggle("ativa", eh);
  }
  daFrente = j;
  avisar("frente", j);
}
export const quemEstaNaFrente = () => daFrente;

/* ==========================================================================
   ARRASTAR E ESTICAR
   Os dois usam ponteiro (serve pra mouse e pra dedo) e prendem o ponteiro
   na barra, senão a janela "escapa" quando você move rápido.
   ========================================================================== */
function arrastar(j, barra) {
  let peguei = null;
  barra.addEventListener("pointerdown", e => {
    if (e.target.closest("button") || j.cheia) return;
    const r = j.el.getBoundingClientRect();
    peguei = { dx: e.clientX - r.left, dy: e.clientY - r.top };
    barra.setPointerCapture(e.pointerId);
    e.preventDefault();
  });
  barra.addEventListener("pointermove", e => {
    if (!peguei) return;
    const m = mesaEl().getBoundingClientRect();
    /* deixa sair um pouco pelos lados, mas nunca some a barra de título:
       janela que você não consegue mais pegar é janela perdida */
    const x = Math.max(-(j.el.offsetWidth - 90), Math.min(m.width - 60, e.clientX - peguei.dx));
    const y = Math.max(0, Math.min(m.height - 34, e.clientY - peguei.dy));
    j.el.style.left = x + "px";
    j.el.style.top = y + "px";
  });
  const soltar = () => { if (peguei) { peguei = null; avisar("moveu", j); } };
  barra.addEventListener("pointerup", soltar);
  barra.addEventListener("pointercancel", soltar);
}

function esticar(j, puxador) {
  let peguei = null;
  puxador.addEventListener("pointerdown", e => {
    const r = j.el.getBoundingClientRect();
    peguei = { x: e.clientX, y: e.clientY, l: r.width, a: r.height };
    puxador.setPointerCapture(e.pointerId);
    e.preventDefault(); e.stopPropagation();
  });
  puxador.addEventListener("pointermove", e => {
    if (!peguei) return;
    if (j.cheia) { j.el.classList.remove("cheia"); j.cheia = false; }
    j.el.style.width = Math.max(240, peguei.l + e.clientX - peguei.x) + "px";
    j.el.style.height = Math.max(140, peguei.a + e.clientY - peguei.y) + "px";
  });
  const soltar = () => { if (peguei) { peguei = null; avisar("mudouTamanho", j); } };
  puxador.addEventListener("pointerup", soltar);
  puxador.addEventListener("pointercancel", soltar);
}

/* ==========================================================================
   RECADOS DO SISTEMA
   O Clipy fica ouvindo isto pra comentar o que você faz. Qualquer outra
   parte do sistema pode ouvir também.
   ========================================================================== */
const ouvintes = [];
export const ouvir = f => ouvintes.push(f);
function avisar(oQue, janela) {
  for (const f of ouvintes) { try { f(oQue, janela); } catch (e) {} }
}

/* ==========================================================================
   CAIXINHA DE AVISO — o "alert" do sistema, mas dentro de uma janela
   ========================================================================== */
export function avisoDeTela(titulo, texto, { fig = "❗", botoes = null } = {}) {
  const j = abrir({ nome: titulo, fig, largura: 400, altura: 210 });
  const caixa = document.createElement("div");
  caixa.className = "pad";
  const p = document.createElement("p");
  p.textContent = texto;
  const linha = document.createElement("div");
  linha.className = "linha";
  for (const [rotulo, faz, principal] of (botoes || [["Ok", null, true]])) {
    const b = document.createElement("button");
    b.className = "bt" + (principal ? " principal" : "");
    b.type = "button"; b.textContent = rotulo;
    b.onclick = () => { if (faz) faz(); fechar(j); };
    linha.appendChild(b);
  }
  caixa.append(p, linha);
  j.corpo.appendChild(caixa);
  const primeiro = linha.querySelector("button");
  if (primeiro) primeiro.focus({ preventScroll:true });
  return j;
}
