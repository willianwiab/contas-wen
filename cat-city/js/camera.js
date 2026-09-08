/* ==========================================================================
   CAT CITY · camera.js
   Terceira pessoa: fica atrás e acima, segue macio e AFASTA sozinha quando o
   bicho cresce — senão você vira mega larva e não vê o próprio corpo.
   ========================================================================== */
export const camera = {
  x:0, y:0, zoom:34, zoomAlvo:34, tremor:0, forcaTremor:1,
  cinema:0, cinemaAlvo:0,
};

/* Quantos pixels vale um metro. A conta é "quantos metros de cidade eu quero
   ver": com o gato normal, uns 46; virando mega larva, muito mais — a câmera
   afasta sozinha, senão você vira um bicho de 7 metros e não vê o próprio pé. */
export function zoomPara(alvoAlto, telaAlt) {
  const querVer = Math.max(46, alvoAlto * 11);
  return Math.max(4.5, Math.min(24, telaAlt / querVer));
}

export function seguir(alvo, dt, alturaDoAlvo, telaAlt) {
  camera.zoomAlvo = zoomPara(alturaDoAlvo, telaAlt) * (1 - camera.cinema * .25);
  const k = 1 - Math.pow(.0016, dt);
  /* a câmera fica um tico à frente de quem corre, pra dar pra ver onde vai */
  const frenteX = (alvo.vx || 0) * .22, frenteY = (alvo.vy || 0) * .22;
  camera.x += (alvo.x + frenteX - camera.x) * k;
  camera.y += (alvo.y + frenteY - camera.y) * k;
  camera.zoom += (camera.zoomAlvo - camera.zoom) * (1 - Math.pow(.02, dt));
  camera.cinema += (camera.cinemaAlvo - camera.cinema) * (1 - Math.pow(.05, dt));
  camera.tremor = Math.max(0, camera.tremor - dt * 3.4);
}
export function sacudir(f) { camera.tremor = Math.min(2.4, camera.tremor + f); }

/* mundo → tela. A cidade é vista de cima e de trás: o eixo y encolhe e o z
   levanta. É o que dá a sensação de 3ª pessoa sem precisar de 3D de verdade. */
export const APERTO_Y = .58, LEVANTA_Z = .8;
export function paraTela(x, y, z, L, A) {
  const t = camera.tremor * camera.forcaTremor;
  const sx = (x - camera.x) * camera.zoom + L / 2 + (t ? (Math.random() - .5) * t * 12 : 0);
  const sy = (y - camera.y) * camera.zoom * APERTO_Y - (z || 0) * camera.zoom * LEVANTA_Z
             + A * .58 + (t ? (Math.random() - .5) * t * 12 : 0);
  return [sx, sy];
}
export function naTela(x, y, L, A, folga = 6) {
  const dx = Math.abs(x - camera.x) * camera.zoom;
  const dy = Math.abs(y - camera.y) * camera.zoom * APERTO_Y;
  return dx < L / 2 + folga * camera.zoom && dy < A / 2 + folga * camera.zoom * 2;
}
