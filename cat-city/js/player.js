/* ==========================================================================
   CAT CITY · player.js
   O gato que você controla — e as habilidades de cada forma.
   ========================================================================== */
import { FORMAS, porId, indiceDe } from "./formas.js";
import { cair, atrito, tirarDaCaixa, GRAVIDADE } from "./physics.js";
import { cidade } from "./city.js";
import * as sfx from "./audio.js";

/* Os truques do modo adm. Fora do adm todos ficam neutros e o jogo é o
   jogo normal — nada aqui muda uma vírgula enquanto ninguém liga. */
export const truques = {
  turbo:1, pulo:1, gigante:1,
  fantasma:false, voar:false, imortal:false,
};
export const zerarTruques = () => {
  truques.turbo = truques.pulo = truques.gigante = 1;
  truques.fantasma = truques.voar = truques.imortal = false;
  aplicarForma(jogador.forma);
};

export const jogador = {
  x:0, y:0, z:0, vx:0, vy:0, vz:0,
  forma:"normal", raio:.5, massa:1, alto:1,
  olhandoDir:true, andando:false, noChao:true,
  poderAte:0, recargaAte:0, enraizado:false, fase:0,
  desbloqueadas:["normal"], vivo:true, invencivelAte:0,
  reboque:[],                                  // os gatos que o trem carrega
};

export function aplicarForma(id) {
  const f = porId(id);
  jogador.forma = f.id;
  const g = truques.gigante;
  jogador.raio = f.raio * g; jogador.massa = f.massa * g; jogador.alto = f.alto * g;
  jogador.quica = !!f.quica;
  jogador.enraizado = false;
  return f;
}
export const formaAtual = () => porId(jogador.forma);
export function desbloquear(id) {
  if (jogador.desbloqueadas.includes(id)) return false;
  jogador.desbloqueadas.push(id);
  jogador.desbloqueadas.sort((a, b) => indiceDe(a) - indiceDe(b));
  return true;
}

/* ---- o poder da forma. Devolve o que aconteceu, pro main mostrar/ouvir. ---- */
export function usarPoder(agora) {
  const f = formaAtual();
  if (agora < jogador.recargaAte) return null;
  const p = f.poder;
  jogador.recargaAte = agora + p.recarga;
  jogador.poderAte = agora + p.tempo;

  switch (p.tipo) {
    case "miar": sfx.miar(Math.random()); return { tipo:"miar", raio:9 };
    case "rolar": case "quicar": case "acelerar": case "passo": case "buzinar": {
      const dx = jogador.olhandoDir ? 1 : -1;
      let ix = jogador.vx, iy = jogador.vy;
      const d = Math.hypot(ix, iy);
      if (d < .5) { ix = dx; iy = 0; } else { ix /= d; iy /= d; }
      jogador.vx += ix * p.forca; jogador.vy += iy * p.forca;
      if (p.tipo === "quicar") jogador.vz = p.forca;
      if (p.tipo === "passo") { jogador.vz = Math.max(jogador.vz, 6); sfx.passo(true); }
      if (p.tipo === "buzinar") sfx.buzina(); else if (p.tipo !== "passo") sfx.motor(1);
      return { tipo:p.tipo, forca:p.forca, alcance:p.alcance || 0 };
    }
    case "esgueirar": jogador.raio = f.raio * truques.gigante * .45; sfx.miar(.8); return { tipo:"esgueirar" };
    case "enraizar":
      jogador.enraizado = !jogador.enraizado;
      jogador.vx = jogador.vy = 0;
      sfx.pancada(.6);
      return { tipo:"enraizar", ligado:jogador.enraizado };
    case "esmagar":
      jogador.vz = 9; sfx.terremoto();
      return { tipo:"esmagar", raio:p.raio };
  }
  return null;
}

export function atualizarJogador(dt, dir, querPular, agora, paredesLista) {
  const f = formaAtual();
  jogador.vivo = true;

  /* o esgueirar volta ao tamanho normal quando acaba */
  const raioCerto = f.raio * truques.gigante;
  if (agora > jogador.poderAte && jogador.raio !== raioCerto && !jogador.enraizado) jogador.raio = raioCerto;

  /* Enquanto o poder está ligado, o limite de velocidade sobe. Sem isso o
     impulso do rolar/acelerar/passo era cortado no mesmo quadro em que
     acontecia — o dash não dashava. */
  const emPoder = agora < jogador.poderAte;
  const acelerando = emPoder && f.poder.tipo === "acelerar";
  const vel = f.vel * (acelerando ? 1.9 : emPoder ? 3.2 : 1) * (jogador.enraizado ? 0 : 1) * truques.turbo;
  const forca = f.veiculo ? 26 : 40;

  const d = Math.hypot(dir.x, dir.y);
  jogador.andando = d > .1 && !jogador.enraizado;
  if (jogador.andando) {
    const nx = dir.x / d, ny = dir.y / d;
    jogador.vx += nx * forca * dt;
    jogador.vy += ny * forca * dt;
    if (Math.abs(nx) > .25) jogador.olhandoDir = nx > 0;
  }
  /* o carro derrapa: perde menos velocidade pro lado. E durante o poder o
     bicho escorrega muito mais, que é o que dá o gostinho de arrancada. */
  atrito(jogador, dt, jogador.enraizado ? .5 : emPoder ? .985 : f.veiculo ? .965 : .9);

  const v = Math.hypot(jogador.vx, jogador.vy);
  if (v > vel) { jogador.vx = jogador.vx / v * vel; jogador.vy = jogador.vy / v * vel; }

  if (querPular && (jogador.noChao || truques.voar) && (f.pulo > 0 || truques.voar) && !jogador.enraizado) {
    jogador.vz = Math.max(f.pulo, truques.voar ? 9 : 0) * truques.pulo; sfx.passo(f.massa > 4);
  }

  jogador.x += jogador.vx * dt; jogador.y += jogador.vy * dt;
  const bateu = cair(jogador, dt);
  if (bateu > 6) { sfx.pancada(Math.min(1, bateu / 14)); }
  /* voar do adm: quase toda a gravidade é devolvida, então o gato boia
     e desce devagarinho em vez de despencar. */
  if (truques.voar && jogador.z > 0) jogador.vz += GRAVIDADE * dt * .96;

  /* paredes. A larva fina passa por vão estreito; a mega larva passa por cima. */
  let quebrou = null;
  if (truques.fantasma) {
    /* atravessa tudo: nem colisão, nem quebra */
  } else if (!f.mega) {
    for (const p of paredesLista) {
      if (Math.abs(p.x + p.l / 2 - jogador.x) > p.l + jogador.raio + 3) continue;
      if (Math.abs(p.y + p.f / 2 - jogador.y) > p.f + jogador.raio + 3) continue;
      if (jogador.z > (p.alt || 2)) continue;                   // passou por cima
      const forte = tirarDaCaixa(jogador, p);
      if (forte > 7 && f.quebra >= (p.tipo === "predio" ? 3 : p.tipo === "carro" ? 2 : 1))
        quebrou = p;
    }
  } else {
    for (const p of paredesLista) {
      if (Math.abs(p.x - jogador.x) > 8 || Math.abs(p.y - jogador.y) > 8) continue;
      if (p.tipo !== "predio" || p.alt < 14) quebrou = p;        // a mega larva atropela
    }
  }

  jogador.fase += dt * (jogador.andando ? 5 + v * .4 : 1.2);
  jogador.x = Math.max(1, Math.min(cidade.largura - 1, jogador.x));
  jogador.y = Math.max(1, Math.min(cidade.altura - 1, jogador.y));
  return quebrou;
}
