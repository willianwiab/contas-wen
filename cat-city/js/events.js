/* ==========================================================================
   CAT CITY · events.js
   OS EVENTOS SURREAIS.

   De vez em quando a cidade faz uma coisa que ninguém pediu. Cada evento tem
   uma fase mínima, então eles vão ficando piores conforme o jogo anda.
   ========================================================================== */
import { nascerGato, multiplicar, quantosVivos, gatos } from "./cats.js";
import { cidade } from "./city.js";
import * as sfx from "./audio.js";
import { sacudir, camera } from "./camera.js";

export const EVENTOS = [
  { id:"gigante", fase:1, titulo:"UM GATO GIGANTE",     sub:"ele só está atravessando a rua",
    dura:16, faz(j, agora) {
      const g = nascerGato(j.x + (Math.random() < .5 ? -40 : 40), j.y + (Math.random() - .5) * 30,
        agora, { escala:9, tipo:1 });
      g.alvoX = j.x + (Math.random() - .5) * 60; g.alvoY = j.y + (Math.random() - .5) * 60;
      for (let i = 0; i < 12; i++) nascerGato(g.x + (Math.random() - .5) * 8, g.y + (Math.random() - .5) * 8,
        agora, { escala:.55, dono:g });
      sfx.terremoto(); sacudir(1.1);
    } },
  { id:"multiplica", fase:2, titulo:"ELES ESTÃO SE MULTIPLICANDO", sub:"1 → 2 → 4 → 8 → …",
    dura:9, faz(j, agora) { sfx.multiplicar(quantosVivos()); } ,
    tique(j, agora, t) { if (t % 1.2 < .05) multiplicar(agora, 1, 90); } },
  { id:"larvaJunta", fase:3, titulo:"ELES ESTÃO SE JUNTANDO", sub:"isso não parece uma larva? é uma larva.",
    dura:12, faz(j, agora) {
      const cx = j.x + (Math.random() - .5) * 24, cy = j.y + (Math.random() - .5) * 24;
      this.cx = cx; this.cy = cy; sfx.ronronar();
    },
    tique(j, agora, t) {
      for (const g of gatos) {
        if (!g.vivo || g.tipo === 1) continue;
        const dx = this.cx - g.x, dy = this.cy - g.y, d = Math.hypot(dx, dy) || 1;
        if (d < 40) { g.vx += dx / d * 22 * .016; g.vy += dy / d * 22 * .016; g.pensa = 3; }
      }
    } },
  { id:"passaCamera", fase:1, titulo:"", sub:"", dura:2.6, silencioso:true,
    faz(j, agora) {
      const g = nascerGato(j.x - 60, j.y + 4, agora, { escala:14, tipo:1 });
      g.vx = 55; g.alvoX = j.x + 90; g.alvoY = j.y + 4;
      sfx.miar(.2); sacudir(.8); camera.cinemaAlvo = 1;
      setTimeout(() => { camera.cinemaAlvo = 0; }, 2400);
    } },
  { id:"carrosGato", fase:2, titulo:"OS CARROS VIRARAM GATOS", sub:"todos eles, ao mesmo tempo",
    dura:14, faz(j, agora) {
      for (const c of cidade.carros) c.gato = 1;
      sfx.multiplicar(20); sacudir(.5);
    } },
  { id:"arvoresGato", fase:2, titulo:"AS ÁRVORES VIRARAM GATOS", sub:"o parque agora mia",
    dura:14, faz(j, agora) { for (const a of cidade.arvores) a.gato = 1; sfx.miar(.7); } },
  { id:"ceuGato", fase:3, titulo:"O CÉU ESTÁ CHEIO DE GATOS", sub:"não olhe pra cima. ou olhe.",
    dura:12, faz(j, agora) {
      for (let i = 0; i < 26; i++)
        nascerGato(j.x + (Math.random() - .5) * 60, j.y + (Math.random() - .5) * 60, agora,
          { z:26 + Math.random() * 34, vz:0, escala:.7 + Math.random() * .8 });
      sfx.multiplicar(26);
    } },
  { id:"cidadeTomada", fase:4, titulo:"A CIDADE É DELES AGORA", sub:"foi bom enquanto durou",
    dura:20, faz(j, agora) {
      multiplicar(agora, 2, 160);
      for (const c of cidade.carros) c.gato = 1;
      for (const a of cidade.arvores) a.gato = 1;
      for (const p of cidade.predios) p.gato = Math.max(p.gato, .8);
      sfx.terremoto(); sacudir(1.6);
    } },
  { id:"megaLarva", fase:5, titulo:"MEGA LARVA", sub:"POR QUE ISSO EXISTE",
    dura:26, faz(j, agora) {
      const g = nascerGato(j.x - 50, j.y - 40, agora, { escala:22, tipo:1 });
      g.alvoX = j.x + 40; g.alvoY = j.y + 30;
      for (let i = 0; i < 40; i++)
        nascerGato(g.x + (Math.random() - .5) * 14, g.y + (Math.random() - .5) * 14, agora,
          { escala:1.4, dono:g });
      sfx.terremoto(); sacudir(2.2); camera.cinemaAlvo = 1;
      setTimeout(() => { camera.cinemaAlvo = 0; }, 3000);
    } },
];

export const estadoEventos = { atual:null, fim:0, proximo:14, t:0 };

export function pensarEventos(dt, agora, fase, jogador, mostrarFaixa) {
  const e = estadoEventos;
  if (e.atual) {
    e.t += dt;
    if (e.atual.tique) e.atual.tique(jogador, agora, e.t);
    if (agora > e.fim) { e.atual = null; e.proximo = agora + 16 + Math.random() * 22; }
    return;
  }
  if (agora < e.proximo) return;
  const podem = EVENTOS.filter(x => x.fase <= fase);
  if (!podem.length) { e.proximo = agora + 10; return; }
  const escolhido = podem[Math.floor(Math.random() * podem.length)];
  e.atual = escolhido; e.t = 0; e.fim = agora + escolhido.dura;
  escolhido.faz(jogador, agora);
  if (!escolhido.silencioso) mostrarFaixa(escolhido.titulo, escolhido.sub);
}
export function forcarEvento(id, agora, jogador, mostrarFaixa) {
  const ev = EVENTOS.find(x => x.id === id);
  if (!ev) return;
  estadoEventos.atual = ev; estadoEventos.t = 0; estadoEventos.fim = agora + ev.dura;
  ev.faz(jogador, agora);
  if (!ev.silencioso) mostrarFaixa(ev.titulo, ev.sub);
}
