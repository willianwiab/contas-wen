/* ==========================================================================
   CAT CITY · ui.js
   HUD, menus e telas. Nada de gameplay aqui: só o que aparece por cima.
   ========================================================================== */
import { FORMAS, porId } from "./formas.js";

const $ = id => document.getElementById(id);
let tRecado = null, tFaixa = null;

export const FASES = [
  { n:1, nome:"Cidade Normal",     precisa:0,  conta:"Uma cidade. Gatos normais. Por enquanto." },
  { n:2, nome:"A Cidade dos Gatos",precisa:4,  conta:"Começaram a aparecer gatos... diferentes." },
  { n:3, nome:"Caos",              precisa:7,  conta:"Eles não param de se multiplicar." },
  { n:4, nome:"Metamorfose",       precisa:10, conta:"A cidade está virando gato." },
  { n:5, nome:"MEGA LARVA",        precisa:12, conta:"Não tem mais cidade. Tem larva." },
];
export const faseDe = descobertas => {
  let f = FASES[0];
  for (const x of FASES) if (descobertas >= x.precisa) f = x;
  return f;
};

export function recado(txt) {
  const r = $("recado");
  r.textContent = txt; r.classList.add("on");
  clearTimeout(tRecado); tRecado = setTimeout(() => r.classList.remove("on"), 2600);
}
export function faixa(titulo, sub) {
  if (!titulo) return;
  $("eventoT").textContent = titulo; $("eventoS").textContent = sub || "";
  $("faixaEvento").classList.add("on");
  clearTimeout(tFaixa); tFaixa = setTimeout(() => $("faixaEvento").classList.remove("on"), 3400);
}

export function montarBarraFormas(desbloqueadas, atual) {
  const b = $("formasBarra");
  b.innerHTML = FORMAS.map((f, i) => {
    const tem = desbloqueadas.includes(f.id);
    const cls = f.id === atual ? "atual" : tem ? "tem" : "nao";
    return '<div class="chipForma ' + cls + '" title="' + f.nome + '">' +
      (tem ? f.emoji : "❔") + '<span class="n">' + ((i + 1) % 10 === 0 ? "0" : i + 1) + '</span></div>';
  }).join("");
}
export function montarGradeFormas(desbloqueadas) {
  $("gradeFormas").innerHTML = FORMAS.map(f => {
    const tem = desbloqueadas.includes(f.id);
    return '<div class="f ' + (tem ? "tem" : "nao") + '"><div class="e">' + (tem ? f.emoji : "❔") + '</div>' +
      '<div class="n">' + (tem ? f.nome : "???") + '</div></div>';
  }).join("");
}

export function atualizarHud(est) {
  const f = porId(est.forma);
  $("formaNome").textContent = f.nome;
  $("formaHab").innerHTML = "<b>" + f.tecla + "</b> — " + f.habilidade;
  $("contFormas").textContent = est.desbloqueadas.length + " / " + FORMAS.length;
  $("contPeixes").textContent = est.peixes;
  $("contPegadas").textContent = est.pegadas;
  $("contEstrelas").textContent = est.estrelas;
  $("contGatos").textContent = est.gatos;
  const fase = faseDe(est.desbloqueadas.length + est.segredos);
  $("nomeFase").textContent = "Fase " + fase.n + " · " + fase.nome;
  const prox = FASES[Math.min(FASES.length - 1, fase.n)] || fase;
  const base = fase.precisa, alvo = Math.max(base + 1, prox.precisa);
  const feito = Math.min(1, (est.desbloqueadas.length + est.segredos - base) / (alvo - base));
  $("barraFase").firstElementChild.style.width = (fase.n === 5 ? 100 : feito * 100) + "%";
  return fase;
}

export function tela(qual) {
  for (const t of document.querySelectorAll(".tela")) t.classList.remove("on");
  if (qual) $(qual).classList.add("on");
}
export const telaAberta = () => !!document.querySelector(".tela.on");
export function botao(id, fn) { const b = $(id); if (b) b.onclick = fn; }
