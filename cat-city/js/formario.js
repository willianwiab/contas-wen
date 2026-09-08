/* ==========================================================================
   CAT CITY · formario.js
   A FÁBRICA DE FORMAS — mil gatos que não deviam existir.

   Escrever mil formas na mão seria mil vezes o mesmo trabalho e ninguém
   jogaria as mil. Então as 13 lendárias continuam feitas à mão (as três das
   fotos do JoJo entre elas) e as outras 987 nascem de uma receita:

       CORPO  x  TINTA  x  MANIA

   12 corpos (o desenho), 9 tintas (a cor da pelagem) e 20 manias (o
   temperamento, que mexe nos números e às vezes troca o poder). Dá 2160
   combinações possíveis; o jogo pega 987 delas espalhadas, então nunca saem
   duas iguais e nunca sai um bloco de vinte parecidas em seguida.

   Cada forma sai com nome próprio em português (com o gênero certo — "Larva
   Dourada Furiosa", "Trem Elétrico Nervoso"), corpo, altura, velocidade,
   pulo, massa, o que quebra e um poder. Nada é decorativo: a mania muda como
   a forma joga.
   ========================================================================== */

/* ---------------------------------------------------------------- corpos */
/* Cada corpo aponta pra um desenho que já existe em formas.js. O "peso" é
   o quanto ele já é forte de fábrica — as manias sobem e descem a partir daí. */
export const CORPOS = [
  { base:"normal",    nome:"Gato",   g:"m", nivel:1,  raio:.5,  alto:1,    vel:7.4, pulo:7.2, massa:1,   quebra:0, poder:"miar" },
  { base:"bolaP",     nome:"Bolinha",g:"f", nivel:2,  raio:.42, alto:.85,  vel:8.6, pulo:8,   massa:.8,  quebra:1, poder:"rolar", rola:true },
  { base:"bola",      nome:"Bola",   g:"f", nivel:3,  raio:.78, alto:1.55, vel:8,   pulo:7.4, massa:2.2, quebra:1, poder:"rolar", rola:true },
  { base:"bolaRosto", nome:"Carão",  g:"m", nivel:4,  raio:.95, alto:1.9,  vel:7.6, pulo:9.6, massa:3,   quebra:1, poder:"quicar", rola:true, quica:true },
  { base:"larvaP",    nome:"Lagarta",g:"f", nivel:4,  raio:.4,  alto:.7,   vel:8.2, pulo:5.4, massa:.9,  quebra:0, poder:"esgueirar", fino:true, larva:3 },
  { base:"larva",     nome:"Larva",  g:"f", nivel:5,  raio:.55, alto:.9,   vel:9.6, pulo:5.8, massa:1.6, quebra:1, poder:"esgueirar", fino:true, larva:7 },
  { base:"carro",     nome:"Carro",  g:"m", nivel:6,  raio:1.05,alto:1.2,  vel:15,  pulo:4.4, massa:4,   quebra:1, poder:"acelerar", veiculo:true },
  { base:"trem",      nome:"Trem",   g:"m", nivel:7,  raio:1.15,alto:1.7,  vel:13,  pulo:3.2, massa:9,   quebra:2, poder:"buzinar", veiculo:true, larva:5, carrega:true },
  { base:"maca",      nome:"Maçã",   g:"f", nivel:7,  raio:.85, alto:1.7,  vel:7,   pulo:6.4, massa:5,   quebra:1, poder:"rolar", rola:true, pesado:true },
  { base:"arvore",    nome:"Árvore", g:"f", nivel:8,  raio:.9,  alto:5.2,  vel:4,   pulo:0,   massa:12,  quebra:0, poder:"enraizar", planta:true },
  { base:"pernaG",    nome:"Perna",  g:"f", nivel:9,  raio:1.2, alto:6.5,  vel:6.2, pulo:5,   massa:14,  quebra:2, poder:"passo", pernas:4, pernaAlt:4.4 },
  { base:"pernaM",    nome:"Aranha", g:"f", nivel:10, raio:1.9, alto:9,    vel:7.4, pulo:5.4, massa:26,  quebra:2, poder:"passo", pernas:10, pernaAlt:6, cabecas:2 },
];

/* ---------------------------------------------------------------- tintas */
/* A cor da pelagem. É o que faz duas formas do mesmo corpo não parecerem
   a mesma coisa. "cor:null" é o gato como ele nasceu, sem demão nenhuma. */
export const TINTAS = [
  { m:"Comum",       f:"Comum",       cor:null,      forca:0,   emoji:"🐈" },
  { m:"Dourado",     f:"Dourada",     cor:"#ffc857", forca:.44, emoji:"🌟" },
  { m:"Fantasma",    f:"Fantasma",    cor:"#cfe6f5", forca:.55, emoji:"👻" },
  { m:"Elétrico",    f:"Elétrica",    cor:"#5fd0ff", forca:.46, emoji:"⚡" },
  { m:"Enferrujado", f:"Enferrujada", cor:"#b05a28", forca:.42, emoji:"🟤" },
  { m:"Rosado",      f:"Rosada",      cor:"#ff8fb1", forca:.4,  emoji:"🌸" },
  { m:"Limoso",      f:"Limosa",      cor:"#7ee0a0", forca:.44, emoji:"🟢" },
  { m:"Roxo",        f:"Roxa",        cor:"#9b6bdd", forca:.44, emoji:"🟣" },
  { m:"Sombrio",     f:"Sombria",     cor:"#221a2c", forca:.5,  emoji:"🖤" },
];

/* ---------------------------------------------------------------- manias */
/* A mania é o temperamento, e ela MEXE NO JOGO: velocidade, pulo, massa,
   tamanho, o que quebra — e algumas trocam o poder inteiro. */
export const MANIAS = [
  { m:"Furioso",    f:"Furiosa",    vel:1.25, massa:1.2, forca:1.3, conta:"Está bravo com alguma coisa. Ninguém sabe o quê." },
  { m:"Molenga",    f:"Molenga",    vel:.72,  pulo:1.35, massa:.8,  conta:"Anda devagar, mas pula que é uma beleza." },
  { m:"Turbo",      f:"Turbo",      vel:1.6,  massa:.9,  conta:"Alguém colocou motor. Não pergunte onde." },
  { m:"Reverso",    f:"Reversa",    vel:1.1,  espelho:true, conta:"Anda de costas. Chega no mesmo lugar." },
  { m:"Explosivo",  f:"Explosiva",  poder:"esmagar", forca:1.4, quebra:1, conta:"Toda vez que usa o poder, alguma coisa se arrepende." },
  { m:"Nervoso",    f:"Nervosa",    vel:1.3,  recarga:.6, tam:.85, conta:"Não para quieto nem por um segundo." },
  { m:"Sonolento",  f:"Sonolenta",  vel:.65,  recarga:1.6, massa:1.4, conta:"Está sempre a três segundos de dormir." },
  { m:"Pegajoso",   f:"Pegajosa",   vel:.85,  massa:1.6, quebra:1, conta:"Gruda no chão, nas paredes e na sua memória." },
  { m:"Elástico",   f:"Elástica",   pulo:1.7, massa:.7,  quica:true, conta:"Bate e volta. Bate de novo e volta de novo." },
  { m:"Bêbado",     f:"Bêbada",     vel:1.15, tonto:true, conta:"Vai pro lugar certo, mas pelo caminho errado." },
  { m:"Invertido",  f:"Invertida",  poder:"quicar", pulo:1.4, conta:"Alguém desenhou de cabeça pra baixo e ninguém corrigiu." },
  { m:"Duplicado",  f:"Duplicada",  poder:"miar", multiplica:true, conta:"Quando mia, vem mais um. E mais um." },
  { m:"Faminto",    f:"Faminta",    vel:1.2,  tam:1.25, massa:1.3, conta:"Come tudo o que encontra. Inclusive coisas que não são comida." },
  { m:"Sortudo",    f:"Sortuda",    recarga:.7, pulo:1.15, conta:"Nada de ruim acontece com ele. Estatisticamente é estranho." },
  { m:"Barulhento", f:"Barulhenta", poder:"buzinar", forca:1.2, conta:"Dá pra ouvir de longe. De muito longe." },
  { m:"Silencioso", f:"Silenciosa", poder:"esgueirar", vel:1.15, fino:true, conta:"Você não vai perceber quando ele passar." },
  { m:"Quebrado",   f:"Quebrada",   vel:.9,   quebra:2, massa:1.2, conta:"Já era assim quando chegou." },
  { m:"Perfeito",   f:"Perfeita",   vel:1.2,  pulo:1.2, massa:1.1, recarga:.85, conta:"Nada de errado com este. É esse o problema." },
  { m:"Antigo",     f:"Antiga",     vel:.8,   massa:1.8, tam:1.3, quebra:1, conta:"Estava aqui antes da cidade. Talvez antes dos gatos." },
  { m:"Proibido",   f:"Proibida",   vel:1.35, tam:1.4,  massa:1.5, quebra:2, forca:1.5, recarga:1.2, conta:"Não era pra você ter achado esta." },
];

/* ---------------------------------------------------------------- receita */
const TOTAL_COMBOS = CORPOS.length * TINTAS.length * MANIAS.length;   // 12 x 9 x 20 = 2160
const SALTO = 1373;              // primo, sem fator comum com 2160: percorre tudo sem repetir

const POR_PODER = {
  miar:      { tempo:.6,  recarga:1.2, raio:9 },
  rolar:     { forca:20,  tempo:.6,  recarga:1 },
  quicar:    { forca:15,  tempo:.4,  recarga:.8 },
  acelerar:  { forca:34,  tempo:1.4, recarga:1.6 },
  buzinar:   { forca:26,  tempo:1.2, recarga:2 },
  esgueirar: { tempo:2,   recarga:1.3, forca:8 },
  enraizar:  { tempo:6,   recarga:1 },
  passo:     { forca:28,  tempo:.5,  recarga:1.1, alcance:10 },
  esmagar:   { forca:40,  tempo:1,   recarga:1.4, raio:8 },
};
const NOME_PODER = {
  miar:"Miar", rolar:"Rolar", quicar:"Quicar", acelerar:"Acelerar e derrapar",
  buzinar:"Buzinar", esgueirar:"Esgueirar (passa por vão estreito)",
  enraizar:"Enraizar (vira plataforma)", passo:"Passo gigante", esmagar:"ESMAGAR",
};

/* um sorteio sempre igual: a mesma forma sai idêntica em qualquer máquina */
function dado(n) { let x = (n * 1103515245 + 12345) & 0x7fffffff; return () => (x = (x * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff; }
const arred = (v, casas = 2) => Math.round(v * 10 ** casas) / 10 ** casas;

/* ---------------------------------------------------------------- fábrica */
export function gerarFormas(quantas, comecaEm = 13) {
  const feitas = [];
  const nomesUsados = new Set();

  for (let n = 0; n < quantas; n++) {
    const c = (n * SALTO) % TOTAL_COMBOS;
    const corpo = CORPOS[c % CORPOS.length];
    const tinta = TINTAS[Math.floor(c / CORPOS.length) % TINTAS.length];
    const mania = MANIAS[Math.floor(c / (CORPOS.length * TINTAS.length)) % MANIAS.length];
    const r = dado(c * 7919 + 13);

    /* o gênero manda no nome inteiro: "Larva Dourada Furiosa", "Trem Roxo Antigo" */
    const gen = corpo.g;
    let nome = corpo.nome + " " + tinta[gen] + " " + mania[gen];
    if (tinta.cor === null) nome = corpo.nome + " " + mania[gen];   // sem tinta, sem adjetivo de cor
    while (nomesUsados.has(nome)) nome += " II";
    nomesUsados.add(nome);

    /* o tamanho é o tempero solto: nem toda Bola Roxa Furiosa é do mesmo tamanho */
    const tam = (mania.tam || 1) * (.78 + r() * .55);
    const tipoPoder = mania.poder || corpo.poder;
    const base = POR_PODER[tipoPoder];

    const f = {
      id:"f" + (comecaEm + n),
      nome, base:corpo.base, gerada:true,
      emoji:tinta.emoji, nivel:comecaEm + n,
      pelo:Math.floor(r() * 5), cor:tinta.cor, tinta:tinta.forca,

      raio:  arred(corpo.raio * tam),
      alto:  arred(corpo.alto * tam),
      vel:   arred(corpo.vel * (mania.vel || 1)),
      pulo:  arred(corpo.pulo * (mania.pulo || 1)),
      massa: arred(corpo.massa * (mania.massa || 1) * tam),
      quebra:Math.min(3, corpo.quebra + (mania.quebra || 0)),

      fino:   !!(corpo.fino || mania.fino),
      rola:   !!corpo.rola,
      quica:  !!(corpo.quica || mania.quica),
      veiculo:!!corpo.veiculo,
      planta: !!corpo.planta,
      carrega:!!corpo.carrega,
      tonto:  !!mania.tonto,
      espelho:!!mania.espelho,
      multiplica:!!mania.multiplica,

      habilidade:NOME_PODER[tipoPoder], tecla:"SHIFT",
      conta:mania.conta,
      poder:Object.assign({ tipo:tipoPoder }, base, {
        forca:  base.forca   ? arred(base.forca * (mania.forca || 1)) : undefined,
        recarga:arred(base.recarga * (mania.recarga || 1)),
      }),
    };
    /* o que o corpo carrega de desenho: quantos gatos na larva, quantas pernas */
    if (corpo.larva)    f.larva = Math.max(2, Math.round(corpo.larva * (r() * .7 + .7)));
    if (corpo.pernas)   f.pernas = Math.max(2, Math.round(corpo.pernas * (r() * .7 + .7)));
    if (corpo.pernaAlt) f.pernaAlt = arred(corpo.pernaAlt * tam);
    if (corpo.cabecas)  f.cabecas = corpo.cabecas;
    if (corpo.pesado)   f.pesado = true;
    /* uma perna precisa caber dentro da altura, senão o bicho fica flutuando */
    if (f.pernaAlt) f.pernaAlt = Math.min(f.pernaAlt, f.alto * .78);

    feitas.push(f);
  }
  return feitas;
}
