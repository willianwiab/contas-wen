/* ==========================================================================
   CAT CITY · ui.js
   HUD, menus e telas. Nada de gameplay aqui: só o que aparece por cima.
   ========================================================================== */
import { FORMAS, LENDARIAS, porId } from "./formas.js";

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

/* A BARRINHA DE BAIXO.

   Com mil formas não dá pra mostrar mil quadradinhos. Então a barra mostra
   as 13 lendárias — que são as das teclas 1 a 9, 0, - e = — e, na ponta, a
   forma em que você está, se ela for uma das mil geradas, com a conta de
   quantas você já achou. */
export function montarBarraFormas(desbloqueadas, atual) {
  const b = $("formasBarra");
  const tem = new Set(desbloqueadas);
  let html = LENDARIAS.map((f, i) => {
    const cls = f.id === atual ? "atual" : tem.has(f.id) ? "tem" : "nao";
    return '<div class="chipForma ' + cls + '" title="' + f.nome + '">' +
      (tem.has(f.id) ? f.emoji : "❔") + '<span class="n">' + ((i + 1) % 10 === 0 ? "0" : i + 1) + '</span></div>';
  }).join("");

  const f = porId(atual);
  if (f.gerada) html += '<div class="chipForma atual larga" title="' + f.nome + '">' + f.emoji +
    '<span class="nome">' + f.nome + '</span></div>';
  const extras = desbloqueadas.length - LENDARIAS.filter(x => tem.has(x.id)).length;
  if (extras > 0) html += '<div class="chipForma conta" title="formas geradas que você já achou">+' + extras + '</div>';
  b.innerHTML = html;
}

/* ---------------------------------------------------------------- catálogo */
/* Mil quadradinhos de uma vez travariam o navegador e ninguém acharia nada.
   Então o catálogo tem busca, filtro e páginas de 60. */
const cat = { pagina:0, filtro:"todas", busca:"" };
const POR_PAGINA = 60;

function listaDoCatalogo(tem) {
  const b = cat.busca.trim().toLowerCase();
  return FORMAS.filter(f => {
    if (cat.filtro === "tenho" && !tem.has(f.id)) return false;
    if (cat.filtro === "lendarias" && f.gerada) return false;
    if (cat.filtro === "falta" && tem.has(f.id)) return false;
    if (b && !f.nome.toLowerCase().includes(b)) return false;
    return true;
  });
}

export function montarGradeFormas(desbloqueadas, reiniciar) {
  if (reiniciar) { cat.pagina = 0; }
  const tem = new Set(desbloqueadas);
  const lista = listaDoCatalogo(tem);
  const paginas = Math.max(1, Math.ceil(lista.length / POR_PAGINA));
  cat.pagina = Math.max(0, Math.min(cat.pagina, paginas - 1));
  const fatia = lista.slice(cat.pagina * POR_PAGINA, (cat.pagina + 1) * POR_PAGINA);

  $("formasContagem").innerHTML =
    '<b>' + desbloqueadas.length + '</b> / ' + FORMAS.length + ' achadas' +
    (lista.length !== FORMAS.length ? ' · mostrando <b>' + lista.length + '</b>' : '');

  $("gradeFormas").innerHTML = fatia.length ? fatia.map(f => {
    const eu = tem.has(f.id);
    return '<div class="f ' + (eu ? "tem" : "nao") + (f.gerada ? "" : " lenda") + '" title="' +
      (eu ? f.habilidade : "ainda não achou") + '">' +
      '<div class="e">' + (eu ? f.emoji : "❔") + '</div>' +
      '<div class="n">' + (eu ? f.nome : "???") + '</div></div>';
  }).join("") : '<p class="sub" style="grid-column:1/-1">nenhuma forma com esse nome 🙀</p>';

  $("formasPagina").textContent = (cat.pagina + 1) + " / " + paginas;
  $("formasAntes").disabled = cat.pagina === 0;
  $("formasDepois").disabled = cat.pagina >= paginas - 1;

  for (const b of document.querySelectorAll("#formasFiltro button"))
    b.classList.toggle("sel", b.dataset.filtro === cat.filtro);
}

/* liga a busca, o filtro e as setas — chamado uma vez, pelo main */
export function ligarCatalogo(quaisTenho) {
  const refaz = () => montarGradeFormas(quaisTenho());
  $("formasBusca").oninput = e => { cat.busca = e.target.value; cat.pagina = 0; refaz(); };
  $("formasBusca").onkeydown = e => e.stopPropagation();
  $("formasAntes").onclick = () => { cat.pagina--; refaz(); };
  $("formasDepois").onclick = () => { cat.pagina++; refaz(); };
  for (const b of document.querySelectorAll("#formasFiltro button"))
    b.onclick = () => { cat.filtro = b.dataset.filtro; cat.pagina = 0; refaz(); };
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
