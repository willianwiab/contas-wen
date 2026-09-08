/* ==========================================================================
   CAT CITY · cats.js
   OS GATOS DA CIDADE.

   Aqui mora a mecânica da multiplicação: 1 → 2 → 4 → 8 → … → centenas.
   Pra isso não derreter o computador:
     · POOL — os gatos nunca são criados nem destruídos, só ligados e
       desligados. O array tem tamanho fixo desde o começo.
     · TETO — existe um número máximo de gatos vivos; passou disso, o mais
       velho é reciclado.
     · LOD — perto: gato inteiro, andando. Longe: um borrão de duas cores.
       Muito longe: nem desenha.
     · Os gatos longe também pensam menos (a IA roda 1 em cada 4 quadros).
   ========================================================================== */
import { cidade } from "./city.js";
import { empurrar, cair, atrito } from "./physics.js";

export const TETO_PADRAO = 320;
export const gatos = [];
let teto = TETO_PADRAO, proximo = 0;

/* cada gato é sempre o mesmo objeto; "vivo" é o que liga e desliga */
function novoVazio() {
  return { vivo:false, x:0, y:0, z:0, vx:0, vy:0, vz:0, raio:.42, massa:1,
           alvoX:0, alvoY:0, pensa:0, qual:0, escala:1, fase:0, tipo:0, dono:null,
           medo:0, seguindo:false, nasceu:0 };
}
export function criarPool(quantos = TETO_PADRAO) {
  teto = quantos;
  gatos.length = 0;
  for (let i = 0; i < quantos; i++) gatos.push(novoVazio());
  proximo = 0;
}
export function mudarTeto(n) {
  teto = Math.max(20, Math.min(3000, n | 0));   // 3000 é território do modo adm
  while (gatos.length < teto) gatos.push(novoVazio());
  if (gatos.length > teto) {
    for (let i = teto; i < gatos.length; i++) gatos[i].vivo = false;
    gatos.length = teto;
  }
  proximo = proximo % gatos.length;
}
export const quantosVivos = () => { let n = 0; for (const g of gatos) if (g.vivo) n++; return n; };
export const tetoAtual = () => teto;

/* pega o próximo lugar livre; se não tiver, recicla o mais velho */
function pegarLugar(agora) {
  for (let i = 0; i < gatos.length; i++) {
    const g = gatos[(proximo + i) % gatos.length];
    if (!g.vivo) { proximo = (proximo + i + 1) % gatos.length; return g; }
  }
  let velho = gatos[0];
  for (const g of gatos) if (g.nasceu < velho.nasceu) velho = g;
  return velho;
}

export function nascerGato(x, y, agora, opcoes = {}) {
  const g = pegarLugar(agora);
  g.vivo = true; g.nasceu = agora;
  g.x = x; g.y = y; g.z = opcoes.z || 0;
  g.vx = (Math.random() - .5) * 3; g.vy = (Math.random() - .5) * 3; g.vz = opcoes.vz || 0;
  g.escala = opcoes.escala || (.75 + Math.random() * .5);
  g.raio = .38 * g.escala; g.massa = g.escala;
  g.qual = opcoes.qual !== undefined ? opcoes.qual : Math.floor(Math.random() * 5);
  g.tipo = opcoes.tipo || 0;               // 0 normal · 1 gigante · 2 filhote seguidor
  g.fase = Math.random() * 6.28;
  g.pensa = 0; g.medo = 0; g.dono = opcoes.dono || null;
  g.seguindo = !!opcoes.dono;
  g.alvoX = x + (Math.random() - .5) * 20;
  g.alvoY = y + (Math.random() - .5) * 20;
  return g;
}

/* A MULTIPLICAÇÃO: cada gato vira dois. É o coração do absurdo. */
export function multiplicar(agora, quantasVezes = 1, limite = 999) {
  let nasceram = 0;
  for (let v = 0; v < quantasVezes; v++) {
    const vivos = gatos.filter(g => g.vivo && g.tipo !== 1);
    for (const g of vivos) {
      if (nasceram >= limite || quantosVivos() >= teto) break;
      const f = nascerGato(g.x + (Math.random() - .5) * 1.6, g.y + (Math.random() - .5) * 1.6,
        agora, { escala:g.escala * .92, qual:g.qual, vz:2 + Math.random() * 3 });
      f.vx = (Math.random() - .5) * 8; f.vy = (Math.random() - .5) * 8;
      nasceram++;
    }
  }
  return nasceram;
}

export function espalharPelaCidade(quantos, agora) {
  for (let i = 0; i < quantos; i++)
    nascerGato(Math.random() * cidade.largura, Math.random() * cidade.altura, agora);
}
export function limparGatos() { for (const g of gatos) g.vivo = false; }

/* --------------------------------------------------------------------------
   o cérebro (bem pequeno) de cada gato
   -------------------------------------------------------------------------- */
export function pensarGatos(dt, jogador, paredesLista, agora, quadro) {
  for (let i = 0; i < gatos.length; i++) {
    const g = gatos[i];
    if (!g.vivo) continue;

    const dxJ = jogador.x - g.x, dyJ = jogador.y - g.y;
    const distJ2 = dxJ * dxJ + dyJ * dyJ;
    const longe = distJ2 > 60 * 60;
    /* quem está longe pensa 1 vez a cada 4 quadros — é de graça e não muda nada */
    if (longe && ((i + quadro) & 3)) { moverGato(g, dt * 4, false); continue; }

    g.pensa -= dt;
    if (g.dono && g.dono.vivo === false) { g.dono = null; g.seguindo = false; }

    if (g.seguindo && g.dono) {                    // filhote atrás do gigante
      g.alvoX = g.dono.x - Math.cos(g.fase) * 3; g.alvoY = g.dono.y - Math.sin(g.fase) * 3;
    } else if (distJ2 < 36 && g.tipo === 0) {      // perto de você: foge um pouco, curioso
      g.medo = 1;
      const d = Math.sqrt(distJ2) || 1;
      g.alvoX = g.x - dxJ / d * 8; g.alvoY = g.y - dyJ / d * 8;
    } else if (g.pensa <= 0) {
      g.pensa = 1.4 + Math.random() * 2.6;
      g.medo *= .5;
      g.alvoX = g.x + (Math.random() - .5) * 26;
      g.alvoY = g.y + (Math.random() - .5) * 26;
    }
    moverGato(g, dt, true);

    /* colisão só com quem está por perto — o resto atravessa e ninguém nota */
    if (!longe) {
      for (const p of paredesLista) {
        if (Math.abs(p.x - g.x) > 9 || Math.abs(p.y - g.y) > 9) continue;
        const px = Math.max(p.x, Math.min(g.x, p.x + p.l));
        const py = Math.max(p.y, Math.min(g.y, p.y + p.f));
        const dx = g.x - px, dy = g.y - py, d2 = dx * dx + dy * dy;
        if (d2 < g.raio * g.raio) {
          const d = Math.sqrt(d2) || .001;
          g.x += dx / d * (g.raio - d); g.y += dy / d * (g.raio - d);
          g.vx *= -.4; g.vy *= -.4;
        }
      }
    }
  }
}
function moverGato(g, dt, comAlvo) {
  if (comAlvo) {
    const dx = g.alvoX - g.x, dy = g.alvoY - g.y, d = Math.hypot(dx, dy) || 1;
    const vel = (g.medo > .3 ? 7.5 : 2.6) * (g.tipo === 1 ? 1.6 : 1);
    if (d > .6) { g.vx += dx / d * vel * dt * 6; g.vy += dy / d * vel * dt * 6; }
  }
  atrito(g, dt, .86);
  g.x += g.vx * dt; g.y += g.vy * dt;
  cair(g, dt);
  g.fase += dt * (2 + Math.hypot(g.vx, g.vy) * .8);
  g.x = Math.max(-30, Math.min(cidade.largura + 30, g.x));
  g.y = Math.max(-30, Math.min(cidade.altura + 30, g.y));
}

/* empurrão entre gatos: só entre vizinhos próximos, senão é n² e trava */
export function esbarrarGatos(jogador) {
  const perto = [];
  for (const g of gatos) {
    if (!g.vivo) continue;
    if (Math.abs(g.x - jogador.x) < 22 && Math.abs(g.y - jogador.y) < 22) perto.push(g);
  }
  for (let i = 0; i < perto.length; i++) {
    empurrar(jogador, perto[i]);
    for (let k = i + 1; k < Math.min(perto.length, i + 7); k++) empurrar(perto[i], perto[k]);
  }
  return perto.length;
}
