/* ==========================================================================
   CAT CITY · audio.js
   Nenhum arquivo de som: tudo é gerado pelo navegador na hora. Miado, passo,
   pancada, transformação, multiplicação, vidro, carro e o ronco da cidade —
   que vai ficando mais caótico conforme a cidade enche de gato.
   ========================================================================== */
let ctx = null, mestre = null, ambiente = null, ganhoAmbiente = null;
let ultimoTerremoto = -9;
export const som = { volume:.7, ligado:true };

function acordar() {
  if (ctx) { if (ctx.state === "suspended") ctx.resume(); return ctx; }
  try {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    mestre = ctx.createGain(); mestre.gain.value = som.volume;
    /* Um limitador na saída. Sem ele, dois ou três sons graves ao mesmo tempo
       somavam e estouravam a caixinha — era o chiado feio da mega larva. */
    const limite = ctx.createDynamicsCompressor();
    limite.threshold.value = -10; limite.knee.value = 6;
    limite.ratio.value = 14; limite.attack.value = .004; limite.release.value = .18;
    mestre.connect(limite); limite.connect(ctx.destination);
  } catch (e) { ctx = null; }
  return ctx;
}
export function ligarAudio() { acordar(); }
export function volume(v) {
  som.volume = v;
  if (mestre) mestre.gain.value = v;
}

function tom({ f = 440, f2 = null, dur = .1, tipo = "sine", vol = .2, atraso = 0, filtro = 0 }) {
  if (!acordar() || !som.ligado) return;
  const t = ctx.currentTime + atraso;
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = tipo; o.frequency.setValueAtTime(f, t);
  if (f2) o.frequency.exponentialRampToValueAtTime(Math.max(20, f2), t + dur);
  g.gain.setValueAtTime(.0001, t);
  g.gain.exponentialRampToValueAtTime(Math.max(.0002, vol), t + Math.min(.02, dur * .3));
  g.gain.exponentialRampToValueAtTime(.0002, t + dur);
  let no = o;
  if (filtro) { const f3 = ctx.createBiquadFilter(); f3.type = "lowpass"; f3.frequency.value = filtro; o.connect(f3); no = f3; }
  no.connect(g); g.connect(mestre);
  o.start(t); o.stop(t + dur + .02);
}
function ruido({ dur = .18, vol = .18, corte = 1200, atraso = 0 }) {
  if (!acordar() || !som.ligado) return;
  const n = Math.floor(ctx.sampleRate * dur);
  const b = ctx.createBuffer(1, n, ctx.sampleRate), d = b.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
  const s = ctx.createBufferSource(); s.buffer = b;
  const f = ctx.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = corte;
  const g = ctx.createGain(); g.gain.value = vol;
  s.connect(f); f.connect(g); g.connect(mestre);
  s.start(ctx.currentTime + atraso);
}

/* ---- os sons do jogo ---- */
export function miar(agudo = 0) {
  const b = 380 + agudo * 240 + Math.random() * 70;
  tom({ f:b, f2:b * 1.6, dur:.09, tipo:"sawtooth", vol:.11, filtro:1500 });
  tom({ f:b * 1.5, f2:b * .7, dur:.3, tipo:"sawtooth", vol:.13, atraso:.08, filtro:1400 });
}
export function ronronar() {
  if (!acordar() || !som.ligado) return;
  const t = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain();
  const l = ctx.createOscillator(), lg = ctx.createGain();
  o.type = "triangle"; o.frequency.value = 44;
  l.type = "sine"; l.frequency.value = 23; lg.gain.value = 15;
  l.connect(lg); lg.connect(o.frequency);
  g.gain.setValueAtTime(.0001, t);
  g.gain.exponentialRampToValueAtTime(.12, t + .1);
  g.gain.exponentialRampToValueAtTime(.0002, t + .8);
  o.connect(g); g.connect(mestre);
  o.start(t); l.start(t); o.stop(t + .85); l.stop(t + .85);
}
export function passo(pesado) {
  ruido({ dur: pesado ? .16 : .06, vol: pesado ? .16 : .05, corte: pesado ? 320 : 900 });
  if (pesado) tom({ f:70, f2:38, dur:.2, tipo:"sine", vol:.18 });
}
export function pancada(forca = 1) {
  ruido({ dur:.2, vol:.1 + forca * .12, corte:700 });
  tom({ f:120 * (1 + forca * .3), f2:50, dur:.22, tipo:"triangle", vol:.14 });
}
export function vidro() {
  for (let i = 0; i < 7; i++)
    tom({ f:1400 + Math.random() * 2400, dur:.06, tipo:"triangle", vol:.05, atraso:i * .025 });
  ruido({ dur:.25, vol:.08, corte:6000 });
}
export function transformar(nivel = 0) {
  const b = 200 + nivel * 22;
  [0, .07, .14, .22].forEach((a, i) =>
    tom({ f:b * (1 + i * .5), f2:b * (1.6 + i * .6), dur:.22, tipo:"square", vol:.08, atraso:a, filtro:2600 }));
  setTimeout(() => miar(1), 190);
}
export function multiplicar(quantos) {
  const n = Math.min(10, Math.max(2, Math.round(Math.log2(quantos + 1))));
  for (let i = 0; i < n; i++) setTimeout(() => miar(Math.random()), i * 55);
}
export function motor(intensidade) {
  tom({ f:70 + intensidade * 60, f2:60 + intensidade * 40, dur:.18, tipo:"sawtooth", vol:.05, filtro:400 });
}
export function buzina() {
  tom({ f:300, dur:.35, tipo:"square", vol:.12, filtro:900 });
  tom({ f:225, dur:.35, tipo:"square", vol:.1, filtro:900 });
}
/* O ESMAGO da mega larva.

   Era um tom puro de 44 Hz caindo pra 26 Hz. Grave demais: caixinha de
   notebook e celular não tocam essa nota — só chacoalham, e sai um ronco
   sujo. E como o poder recarrega em 1,4 s dava pra disparar por cima do
   anterior, somando três sub-graves e estourando tudo.

   Agora é o que um baque grande é de verdade: um estalo curto em cima, um
   corpo grave audível (90 → 50 Hz) e uma cauda de estrondo. E não empilha:
   dois esmagos colados viram um só. */
export function terremoto() {
  if (!acordar() || !som.ligado) return;
  const agora = ctx.currentTime;
  if (agora - ultimoTerremoto < .3) return;      // nada de sobrepor
  ultimoTerremoto = agora;
  ruido({ dur:.09, vol:.16, corte:2600 });                       // o estalo
  tom({ f:92, f2:50, dur:.55, tipo:"triangle", vol:.16, filtro:420 });
  tom({ f:61, f2:38, dur:.9, tipo:"sine", vol:.1, atraso:.03, filtro:260 });
  ruido({ dur:.8, vol:.09, corte:190, atraso:.05 });              // a cauda
}
export function fanfarra() {
  [523, 659, 784, 1047, 1319].forEach((f, i) =>
    tom({ f, dur:.28, tipo:"triangle", vol:.13, atraso:i * .12 }));
}
/* o ronco da cidade: começa como trânsito e vai virando um miado só */
export function ambienteCidade(caos) {
  if (!acordar() || !som.ligado) return;
  if (!ambiente) {
    const n = ctx.sampleRate * 2;
    const b = ctx.createBuffer(1, n, ctx.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * .35;
    ambiente = ctx.createBufferSource(); ambiente.buffer = b; ambiente.loop = true;
    const f = ctx.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = 260;
    ganhoAmbiente = ctx.createGain(); ganhoAmbiente.gain.value = .02;
    ambiente.connect(f); f.connect(ganhoAmbiente); ganhoAmbiente.connect(mestre);
    ambiente.start();
    ambiente._filtro = f;
  }
  ganhoAmbiente.gain.value = .015 + caos * .04;
  ambiente._filtro.frequency.value = 240 + caos * 700;
}
