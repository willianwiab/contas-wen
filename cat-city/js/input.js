/* ==========================================================================
   CAT CITY · input.js
   Teclado, controle e dedo. Tudo cai no mesmo lugar: um vetor de andar e
   três botões (pular, poder, usar).
   ========================================================================== */
export const entrada = {
  x:0, y:0,            // pra onde andar, de -1 a 1
  pular:false, poder:false, usar:false,
  pularAgora:false, poderAgora:false, usarAgora:false,   // só no quadro em que apertou
  menu:false, formaAnterior:false, formaDireta:-1,
  temToque:false,
};
const teclas = new Set();
const MAPA = {
  KeyW:"cima", ArrowUp:"cima", KeyS:"baixo", ArrowDown:"baixo",
  KeyA:"esq", ArrowLeft:"esq", KeyD:"dir", ArrowRight:"dir",
};
let aoMenu = () => {};
export function quandoMenu(f) { aoMenu = f; }

addEventListener("keydown", e => {
  if (e.repeat) return;
  if (e.code === "Escape") { entrada.menu = true; aoMenu(); return; }
  if (e.code === "Space") { e.preventDefault(); entrada.pular = entrada.pularAgora = true; }
  if (e.code === "ShiftLeft" || e.code === "ShiftRight") entrada.poder = entrada.poderAgora = true;
  if (e.code === "KeyE") entrada.usar = entrada.usarAgora = true;
  if (e.code === "KeyQ") entrada.formaAnterior = true;
  const n = "Digit1 Digit2 Digit3 Digit4 Digit5 Digit6 Digit7 Digit8 Digit9 Digit0 Minus Equal".split(" ").indexOf(e.code);
  if (n >= 0) entrada.formaDireta = n;
  if (MAPA[e.code]) { e.preventDefault(); teclas.add(MAPA[e.code]); }
});
addEventListener("keyup", e => {
  if (e.code === "Space") entrada.pular = false;
  if (e.code === "ShiftLeft" || e.code === "ShiftRight") entrada.poder = false;
  if (e.code === "KeyE") entrada.usar = false;
  if (MAPA[e.code]) teclas.delete(MAPA[e.code]);
});
addEventListener("blur", () => { teclas.clear(); entrada.pular = entrada.poder = entrada.usar = false; });

/* ---------- dedo: analógico do lado esquerdo, botões do direito ---------- */
let dedo = null;
const anelBase = () => document.getElementById("anelBase");
const anelDedo = () => document.getElementById("anelDedo");
export function ligarToque(mostrar) {
  const caixa = document.getElementById("toque");
  caixa.classList.toggle("on", mostrar);
  entrada.temToque = mostrar;
}
addEventListener("pointerdown", e => {
  if (e.target.closest(".botaoToque") || e.target.closest(".tela")) return;
  if (!entrada.temToque) return;
  if (e.clientX > innerWidth * .55) return;
  dedo = { id:e.pointerId, x0:e.clientX, y0:e.clientY };
  for (const el of [anelBase(), anelDedo()]) {
    el.style.display = "block"; el.style.left = e.clientX + "px"; el.style.top = e.clientY + "px";
  }
});
addEventListener("pointermove", e => {
  if (!dedo || e.pointerId !== dedo.id) return;
  const dx = e.clientX - dedo.x0, dy = e.clientY - dedo.y0;
  const d = Math.hypot(dx, dy), max = 58;
  const k = d > max ? max / d : 1;
  entrada.x = dx * k / max; entrada.y = dy * k / max;
  anelDedo().style.left = (dedo.x0 + dx * k) + "px";
  anelDedo().style.top = (dedo.y0 + dy * k) + "px";
});
function soltarDedo(e) {
  if (!dedo || e.pointerId !== dedo.id) return;
  dedo = null; entrada.x = entrada.y = 0;
  anelBase().style.display = anelDedo().style.display = "none";
}
addEventListener("pointerup", soltarDedo);
addEventListener("pointercancel", soltarDedo);

function botao(id, campo) {
  const b = document.getElementById(id);
  b.addEventListener("pointerdown", e => { e.preventDefault(); entrada[campo] = entrada[campo + "Agora"] = true; });
  const solta = () => { entrada[campo] = false; };
  b.addEventListener("pointerup", solta); b.addEventListener("pointercancel", solta);
  b.addEventListener("pointerleave", solta);
}
export function ligarBotoesDeToque() {
  botao("btPular", "pular"); botao("btPoder", "poder"); botao("btUsar", "usar");
}

/* ---------- controle ---------- */
let menuControleAntes = false;
export function lerControle() {
  const pads = navigator.getGamepads ? navigator.getGamepads() : [];
  for (const p of pads) {
    if (!p) continue;
    const zx = p.axes[0] || 0, zy = p.axes[1] || 0;
    if (Math.abs(zx) > .18 || Math.abs(zy) > .18) { entrada.x = zx; entrada.y = zy; }
    const b = i => p.buttons[i] && p.buttons[i].pressed;
    if (b(0) && !entrada.pular) entrada.pularAgora = true;
    if (b(2) && !entrada.poder) entrada.poderAgora = true;
    if (b(1) && !entrada.usar) entrada.usarAgora = true;
    entrada.pular = entrada.pular || b(0);
    entrada.poder = entrada.poder || b(2);
    entrada.usar  = entrada.usar  || b(1);
    if (b(3) && !menuControleAntes) { entrada.formaAnterior = true; }
    menuControleAntes = b(3);
    if (b(9)) { entrada.menu = true; aoMenu(); }
    return true;
  }
  return false;
}

/* chamada uma vez por quadro, depois de tudo ler a entrada */
export function fecharQuadro() {
  entrada.pularAgora = entrada.poderAgora = entrada.usarAgora = false;
  entrada.formaAnterior = false; entrada.formaDireta = -1; entrada.menu = false;
  if (!dedo && !entrada.temToque) { /* teclado manda */ }
}
export function direcaoTeclado() {
  let x = 0, y = 0;
  if (teclas.has("esq")) x -= 1;
  if (teclas.has("dir")) x += 1;
  if (teclas.has("cima")) y -= 1;
  if (teclas.has("baixo")) y += 1;
  return { x, y };
}
