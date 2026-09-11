/* ==========================================================================
   CLIPY · voz.js
   A VOZINHA DE COMPUTADOR ANTIGO.

   Ele não fala palavras: ele faz BIPE. Um bipinho curto pra cada letra,
   enquanto o texto aparece letra por letra no balão. É assim que os
   computadores e os videogames antigos "falavam" — e é o que faz um texto
   na tela virar uma voz na sua cabeça.

   Nada disso é arquivo de som: é tudo gerado na hora pelo navegador, com
   oscilador e um envelope curtinho. Por isso funciona sem internet e não
   pesa nada.

   O truque pra parecer fala de verdade:
     · vogal = nota mais grave e um tiquinho mais longa
     · consoante = mais aguda e mais curta
     · pontuação = pausa (é o que dá ritmo de frase)
     · e cada humor dele muda o timbre e a altura
   ========================================================================== */

let ctx = null, mestre = null, limite = null;
export const som = { ligado:true, volume:.5 };

function acordar() {
  if (ctx) { if (ctx.state === "suspended") ctx.resume(); return ctx; }
  try {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    mestre = ctx.createGain();
    mestre.gain.value = som.volume;
    /* um limitador, pra vários bipes juntos não estourarem a caixinha */
    limite = ctx.createDynamicsCompressor();
    limite.threshold.value = -12; limite.knee.value = 8;
    limite.ratio.value = 12; limite.attack.value = .003; limite.release.value = .15;
    mestre.connect(limite); limite.connect(ctx.destination);
  } catch (e) { ctx = null; }
  return ctx;
}
export function ligarAudio() { acordar(); }
export function volume(v) {
  som.volume = Math.max(0, Math.min(1, v));
  if (mestre) mestre.gain.value = som.volume;
}

/* um bipe: oscilador + envelope curto. É a peça de tudo aqui. */
function bipe({ f = 440, f2 = 0, dur = .05, tipo = "square", vol = .18, atraso = 0, corte = 0 }) {
  if (!acordar() || !som.ligado) return;
  const t = ctx.currentTime + atraso;
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = tipo;
  o.frequency.setValueAtTime(Math.max(20, f), t);
  if (f2) o.frequency.exponentialRampToValueAtTime(Math.max(20, f2), t + dur);
  g.gain.setValueAtTime(.0001, t);
  g.gain.exponentialRampToValueAtTime(Math.max(.0002, vol), t + .006);
  g.gain.exponentialRampToValueAtTime(.0002, t + dur);
  let saida = o;
  if (corte) {
    const filtro = ctx.createBiquadFilter();
    filtro.type = "lowpass"; filtro.frequency.value = corte;
    o.connect(filtro); saida = filtro;
  }
  saida.connect(g); g.connect(mestre);
  o.start(t); o.stop(t + dur + .02);
}
function chiado({ dur = .12, vol = .1, corte = 1400, atraso = 0 }) {
  if (!acordar() || !som.ligado) return;
  const n = Math.max(1, Math.floor(ctx.sampleRate * dur));
  const b = ctx.createBuffer(1, n, ctx.sampleRate), d = b.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
  const s = ctx.createBufferSource(); s.buffer = b;
  const f = ctx.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = corte;
  const g = ctx.createGain(); g.gain.value = vol;
  s.connect(f); f.connect(g); g.connect(mestre);
  s.start(ctx.currentTime + atraso);
}

/* ---------------------------------------------------------------- a voz */
/* Cada humor tem um timbre. É pouca diferença em número e muita diferença
   em como soa — é o mesmo truque das sobrancelhas no desenho. */
const VOZES = {
  parado:    { base:300, tipo:"square",   passo:.052, vol:.13 },
  atento:    { base:360, tipo:"square",   passo:.048, vol:.15 },
  pensando:  { base:250, tipo:"triangle", passo:.070, vol:.13 },
  feliz:     { base:430, tipo:"square",   passo:.042, vol:.16 },
  triste:    { base:210, tipo:"triangle", passo:.078, vol:.12 },
  bravo:     { base:190, tipo:"sawtooth", passo:.040, vol:.17, corte:1100 },
  assustado: { base:520, tipo:"square",   passo:.034, vol:.16 },
  dormindo:  { base:150, tipo:"sine",     passo:.110, vol:.09 },
  confuso:   { base:300, tipo:"triangle", passo:.062, vol:.13 },
  burro:     { base:170, tipo:"sawtooth", passo:.090, vol:.13, corte:800 },
  /* os modos especiais */
  ben:       { base:120, tipo:"sawtooth", passo:.105, vol:.16, corte:700 },
  fantasma:  { base:280, tipo:"sine",     passo:.075, vol:.10, tremido:1 },
  vermelho:  { base:160, tipo:"sawtooth", passo:.036, vol:.19, corte:1300 },
};

const VOGAIS = "aeiouáàâãéêíóôõúü";
const PAUSAS = { ".":.20, "!":.20, "?":.22, ",":.11, ";":.13, ":":.13, "…":.30, "\n":.20 };

let falando = 0;          // id da fala atual, pra poder cortar no meio

/* Fala um texto: devolve quanto tempo (em segundos) vai levar. */
export function falar(texto, humor = "parado", modo = null) {
  falando++;
  if (!acordar() || !som.ligado || !texto) return 0;
  const v = VOZES[modo] || VOZES[humor] || VOZES.parado;
  let t = 0, letras = 0;
  /* 44 letras já dão a impressão de fala inteira; passar disso vira barulho
     (e cria oscilador demais numa frase comprida) */
  for (const c of texto.slice(0, 120)) {
    if (letras >= 44) break;
    const p = PAUSAS[c];
    if (p !== undefined) { t += p; continue; }
    if (c === " ") { t += v.passo * .8; continue; }
    if (!/\p{L}|\d/u.test(c)) { t += v.passo * .5; continue; }
    const vogal = VOGAIS.includes(c.toLowerCase());
    const cod = c.toLowerCase().charCodeAt(0);
    const salto = ((cod * 7) % 9) - 4;                 // a "melodia" da letra
    const f = v.base * Math.pow(2, salto / 24) * (vogal ? .84 : 1.18);
    const dur = v.passo * (vogal ? 1.25 : .8);
    bipe({ f, f2: v.tremido ? f * .92 : f * 1.02, dur, tipo:v.tipo,
           vol:v.vol, atraso:t, corte:v.corte || 0 });
    t += v.passo;
    letras++;
  }
  return t;
}
export function calar() { falando++; }
export const estaFalando = () => falando;

/* ---------------------------------------------------------------- efeitos */
export const efeitos = {
  balao()    { bipe({ f:520, f2:880, dur:.07, tipo:"square", vol:.14 });
               bipe({ f:880, dur:.05, tipo:"square", vol:.1, atraso:.06 }); },
  botao()    { bipe({ f:660, dur:.04, tipo:"square", vol:.12 }); },
  cutucar()  { bipe({ f:300 + Math.random() * 200, f2:180, dur:.09, tipo:"square", vol:.15 }); },
  acerto()   { [523, 659, 784, 1047].forEach((f, i) =>
                 bipe({ f, dur:.1, tipo:"square", vol:.13, atraso:i * .06 })); },
  erro()     { bipe({ f:200, f2:110, dur:.28, tipo:"sawtooth", vol:.16, corte:900 }); },
  censura()  { bipe({ f:150, dur:.14, tipo:"square", vol:.18, corte:800 });
               chiado({ dur:.1, vol:.12, corte:700, atraso:.05 }); },
  copiar()   { bipe({ f:880, dur:.05, tipo:"square", vol:.12 });
               bipe({ f:1320, dur:.06, tipo:"square", vol:.1, atraso:.05 }); },
  segredo()  { [392, 523, 659, 880, 1047].forEach((f, i) =>
                 bipe({ f, dur:.13, tipo:"triangle", vol:.14, atraso:i * .09 })); },
  assustar() { bipe({ f:900, f2:180, dur:.4, tipo:"sawtooth", vol:.18, corte:1600 });
               chiado({ dur:.3, vol:.12, corte:1800 }); },
  porta()    { bipe({ f:120, f2:60, dur:.35, tipo:"square", vol:.2, corte:600 });
               chiado({ dur:.25, vol:.14, corte:500, atraso:.05 }); },
  luzApaga() { bipe({ f:400, f2:40, dur:.7, tipo:"triangle", vol:.16, corte:900 }); },
  dormir()   { bipe({ f:200, f2:140, dur:.5, tipo:"sine", vol:.09 }); },
  ligar()    { [262, 330, 392, 523].forEach((f, i) =>
                 bipe({ f, dur:.09, tipo:"square", vol:.12, atraso:i * .07 })); },
};
export function tocar(nome) { (efeitos[nome] || (() => {}))(); }
