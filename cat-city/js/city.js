/* ==========================================================================
   CAT CITY · city.js
   A CIDADE.

   Uma grade de quarteirões com ruas no meio. Prédios como caixas, calçadas,
   postes, semáforos, placas, carros parados, árvores, um parque, um beco e
   as lojas. Tudo normal.

   E aí a cidade começa a virar gato. Cada coisa tem um "quanto já virou
   gato" (0 a 1) que sobe com a fase — telhados criam gato, as árvores ganham
   rosto, os carros viram gato-carro, o céu enche.
   ========================================================================== */
export const TAM = 12;            // tamanho de um quarteirão, em metros
export const RUA = 9;             // largura da rua
const PASSO = TAM + RUA;

export const cidade = {
  colunas:11, linhas:11,          // a cidade grande: 11 x 11 quarteirões
  predios:[], postes:[], arvores:[], carros:[], placas:[], semaforos:[],
  bancos:[], caixas:[], portas:[], largura:0, altura:0,
};

function rnd(s) { let x = s; return () => { x = (x * 1103515245 + 12345) & 0x7fffffff; return x / 0x7fffffff; }; }

const CORES_PREDIO = ["#8d8577","#7b8592","#9c8a7c","#6f7a80","#a3907e","#87796d","#6d7f8c"];
const CORES_CARRO  = ["#c0392b","#2c6fb5","#d8b13a","#3d9a5f","#e8e2d8","#4a4a52","#c96a2e"];

export function gerarCidade(sementeN = 7) {
  const r = rnd(sementeN * 991 + 17);
  const c = cidade;
  c.predios = []; c.postes = []; c.arvores = []; c.carros = [];
  c.placas = []; c.semaforos = []; c.bancos = []; c.caixas = []; c.portas = [];
  c.largura = c.colunas * PASSO; c.altura = c.linhas * PASSO;

  for (let qy = 0; qy < c.linhas; qy++) for (let qx = 0; qx < c.colunas; qx++) {
    const x0 = qx * PASSO + RUA / 2, y0 = qy * PASSO + RUA / 2;
    const meio = qx === (c.colunas >> 1) && qy === (c.linhas >> 1);
    /* praças espalhadas pela cidade toda, não só nas duas pontas */
    const parque = (qx % 5 === 1 && qy % 5 === 3) || (qx % 5 === 3 && qy % 5 === 1);

    if (parque) {                                   // ---- parque ----
      for (let i = 0; i < 9; i++)
        c.arvores.push({ x:x0 + 1.5 + r() * (TAM - 3), y:y0 + 1.5 + r() * (TAM - 3),
                         alt:4 + r() * 2.5, gato:0, semente:r() * 6.28 });
      for (let i = 0; i < 3; i++)
        c.bancos.push({ x:x0 + 2 + r() * (TAM - 4), y:y0 + 2 + r() * (TAM - 4), ang:r() * 3.14 });
      continue;
    }
    if (meio) {                                     // ---- praça central, o ponto de encontro ----
      c.arvores.push({ x:x0 + TAM / 2, y:y0 + TAM / 2, alt:6.5, gato:0, semente:r() * 6.28, grande:true });
      continue;
    }

    /* ---- quarteirão de prédios: 2 a 4 caixas, com um beco entre eles ---- */
    const quantos = 2 + Math.floor(r() * 3);
    const beco = r() < .35;
    for (let i = 0; i < quantos; i++) {
      const larg = (TAM - (beco ? 2.2 : 0)) / quantos - .5;
      const px = x0 + i * (larg + .5) + (beco && i >= quantos / 2 ? 2.2 : 0);
      const alt = 6 + r() * (qx % 2 === 0 && qy % 2 === 0 ? 26 : 13);
      const p = {
        x:px, y:y0 + .6, l:larg, f:TAM - 1.2, alt,
        cor:CORES_PREDIO[Math.floor(r() * CORES_PREDIO.length)],
        janelas:Math.max(2, Math.floor(alt / 3)), gato:0, semente:r() * 100,
        loja: r() < .4,
      };
      c.predios.push(p);
      if (p.loja) c.portas.push({ x:p.x + p.l / 2, y:p.y + p.f, predio:p,
        nome:["MERCADINHO","PET SHOP","PADARIA","LOJA DE PEIXE","SAPATARIA","VIDEOLOCADORA"][Math.floor(r() * 6)] });
    }
    if (beco) c.caixas.push({ x:x0 + TAM / 2, y:y0 + TAM / 2, ang:r() * 3.14 });
  }

  /* ---- o que fica na rua ---- */
  for (let qy = 0; qy <= c.linhas; qy++) for (let qx = 0; qx <= c.colunas; qx++) {
    const x = qx * PASSO, y = qy * PASSO;
    if (qx < c.colunas) c.postes.push({ x:x + PASSO * .5, y:y - RUA * .38, gato:0 });
    if (qy < c.linhas)  c.postes.push({ x:x - RUA * .38, y:y + PASSO * .5, gato:0 });
    if (qx > 0 && qy > 0 && qx < c.colunas && qy < c.linhas)
      c.semaforos.push({ x:x - RUA * .3, y:y - RUA * .3, luz:Math.floor(r() * 3), t:r() * 6 });
    if (r() < .5 && qx < c.colunas)
      c.placas.push({ x:x + 2 + r() * 6, y:y - RUA * .28,
        txt:["PARE","RUA DO GATO","MIAU 50","→","SEM SAÍDA","GATOS"][Math.floor(r() * 6)] });
  }
  const quantosCarros = Math.round(c.colunas * c.linhas * .95);
  for (let i = 0; i < quantosCarros; i++) {         // carros parados nas guias
    const naHorizontal = r() < .5;
    const qx = Math.floor(r() * c.colunas), qy = Math.floor(r() * c.linhas);
    c.carros.push({
      x: naHorizontal ? qx * PASSO + RUA / 2 + r() * TAM : qx * PASSO - RUA * .28,
      y: naHorizontal ? qy * PASSO - RUA * .28 : qy * PASSO + RUA / 2 + r() * TAM,
      ang: naHorizontal ? 0 : Math.PI / 2,
      cor: CORES_CARRO[Math.floor(r() * CORES_CARRO.length)], gato:0, semente:r() * 6.28,
    });
  }
  return c;
}

/* ---- colisão: o que é parede ---- */
export function paredes() {
  const lista = [];
  for (const p of cidade.predios) lista.push({ x:p.x, y:p.y, l:p.l, f:p.f, alt:p.alt, tipo:"predio", ref:p });
  for (const c of cidade.carros) lista.push({
    x:c.x - (c.ang ? .9 : 2.1), y:c.y - (c.ang ? 2.1 : .9),
    l:(c.ang ? 1.8 : 4.2), f:(c.ang ? 4.2 : 1.8), alt:1.5, tipo:"carro", ref:c });
  for (const cx of cidade.caixas) lista.push({ x:cx.x - .7, y:cx.y - .7, l:1.4, f:1.4, alt:1.3, tipo:"caixa", ref:cx });
  return lista;
}

/* --------------------------------------------------------------------------
   Grade de paredes.

   Com a cidade grande são umas 500 caixas de colisão. Perguntar "bati em
   alguma?" varrendo as 500 pra cada gato, 60 vezes por segundo, é o que
   derreteria o computador. Então as paredes entram numa grade de células:
   cada um só olha as 9 células em volta de si — quase sempre menos de 10
   caixas em vez de 500.
   -------------------------------------------------------------------------- */
export function gradeDeParedes(lista, celula = 14) {
  const mapa = new Map();
  for (const p of lista) {
    const i0 = Math.floor(p.x / celula), i1 = Math.floor((p.x + p.l) / celula);
    const j0 = Math.floor(p.y / celula), j1 = Math.floor((p.y + p.f) / celula);
    for (let i = i0; i <= i1; i++) for (let j = j0; j <= j1; j++) {
      const k = i + "," + j;
      let cel = mapa.get(k);
      if (!cel) mapa.set(k, cel = []);
      cel.push(p);
    }
  }
  const balde = [];
  return {
    celula, lista,
    /* devolve SEMPRE o mesmo array reaproveitado: nada de lixo por quadro */
    perto(x, y) {
      balde.length = 0;
      const i = Math.floor(x / celula), j = Math.floor(y / celula);
      for (let a = i - 1; a <= i + 1; a++) for (let b = j - 1; b <= j + 1; b++) {
        const cel = mapa.get(a + "," + b);
        if (!cel) continue;
        for (const p of cel) if (balde.indexOf(p) < 0) balde.push(p);
      }
      return balde;
    },
  };
}

/* ---- a cidade virando gato: sobe conforme a fase ---- */
export function corromper(quanto) {
  const c = cidade;
  const passa = (lista, fator) => {
    for (const o of lista) o.gato = Math.max(0, Math.min(1, quanto * fator - (o.semente % 1) * .4));
  };
  passa(c.arvores, 1.6);
  passa(c.carros, 1.25);
  passa(c.predios, .95);
  passa(c.postes, .7);
}
