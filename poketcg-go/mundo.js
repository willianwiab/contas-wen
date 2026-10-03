/* =========================================================
   PokéTCG GO — O MUNDO

   Um bairro de 2400 por 2400, com rua, lago, árvore, casa e
   lojinha. O cenário nasce de uma semente guardada no
   aparelho: é o MESMO bairro toda vez que o jogo abre, senão
   nunca dava pra dizer "a lojinha perto do lago".

   O jogador anda por conta: toca num lugar e o boneco vai
   até lá. O mapa é que se mexe por baixo dele, pra ele ficar
   sempre no meio da tela.
   ========================================================= */

const MUNDO_W = 2400, MUNDO_H = 2400;
const VELOCIDADE = 165;          /* pixels por segundo */
const ALCANCE = 95;              /* de quão longe dá pra capturar */
const MAX_SOLTAS = 8;            /* cartas no chão ao mesmo tempo */
const NASCE_CADA = [5000, 11000];
const DURA = [55000, 130000];
const LOJA_ESPERA = 3 * 60 * 1000;

/* dado com semente: mesma semente, mesmo bairro */
function dadinho(s){
  let a = (s * 2654435761) >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), 1 | t);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const $ = s => document.querySelector(s);
const elMundo = () => $('#mundo');

let eu = { x:MUNDO_W / 2, y:MUNDO_H / 2, aX:MUNDO_W / 2, aY:MUNDO_H / 2, andando:false };
let soltas = [];                 /* as cartas no chão */
let lojas = [];
let proximoNascer = 0;
let andou = 0;                   /* metros andados, só pra mostrar */

/* ---------------------------------------------------------
   DESENHAR O BAIRRO
   --------------------------------------------------------- */
function montarBairro(semente){
  const d = dadinho(semente);
  const m = elMundo();
  m.style.width = MUNDO_W + 'px';
  m.style.height = MUNDO_H + 'px';

  const pecas = [];
  const por = (cls, x, y, w, h, dentro) =>
    pecas.push(`<div class="peca ${cls}" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px">${dentro || ''}</div>`);

  /* ruas: três de pé e três deitadas, sempre nas mesmas faixas */
  const faixasX = [380, 1150, 1960], faixasY = [430, 1200, 1930];
  for(const x of faixasX) por('rua', x - 38, 0, 76, MUNDO_H);
  for(const y of faixasY) por('rua', 0, y - 38, MUNDO_W, 76);

  /* dois lagos, longe do meio pra não nascer em cima do jogador */
  por('lago', 1500, 150, 420, 300);
  por('lago', 180, 1620, 330, 260);

  /* casas nos quarteirões */
  for(let i = 0; i < 26; i++){
    const w = 100 + Math.floor(d() * 70), h = 80 + Math.floor(d() * 60);
    const x = 60 + Math.floor(d() * (MUNDO_W - w - 120));
    const y = 60 + Math.floor(d() * (MUNDO_H - h - 120));
    if(Math.hypot(x - MUNDO_W / 2, y - MUNDO_H / 2) < 260) continue;   /* deixa a praça livre */
    const jan = [];
    for(let j = 0; j < 3; j++)
      jan.push(`<div class="jan" style="left:${14 + j * 26}px;top:${h * 0.52}px"></div>`);
    por('predio', x, y, w, h, `<div class="teto"></div>${jan.join('')}`);
  }

  /* árvores e enfeites */
  const arvores = ['🌳','🌲','🌴','🪴'];
  for(let i = 0; i < 150; i++){
    const x = Math.floor(d() * (MUNDO_W - 40)), y = Math.floor(d() * (MUNDO_H - 40));
    pecas.push(`<div class="peca arvore" style="left:${x}px;top:${y}px">${arvores[Math.floor(d() * 4)]}</div>`);
  }
  const enfeites = ['🌼','🌻','🪨','🍄','🌾','🦋'];
  for(let i = 0; i < 110; i++){
    const x = Math.floor(d() * (MUNDO_W - 24)), y = Math.floor(d() * (MUNDO_H - 24));
    pecas.push(`<div class="peca enfeite" style="left:${x}px;top:${y}px">${enfeites[Math.floor(d() * 6)]}</div>`);
  }

  /* a praça do meio, onde o jogo começa */
  por('rua', MUNDO_W / 2 - 110, MUNDO_H / 2 - 110, 220, 220);
  pecas.push(`<div class="peca enfeite" style="left:${MUNDO_W / 2 - 14}px;top:${MUNDO_H / 2 - 150}px;font-size:34px">⛲</div>`);

  /* as lojinhas: posições fixas, perto das esquinas */
  lojas = [
    { id:'l1', x:MUNDO_W / 2,  y:MUNDO_H / 2 - 230, nome:'Banca da Praça' },
    { id:'l2', x:390,          y:440,               nome:'Papelaria do Zé' },
    { id:'l3', x:1960,         y:1210,              nome:'Loja do Shopping' },
    { id:'l4', x:1160,         y:1930,              nome:'Barraca da Feira' },
    { id:'l5', x:1700,         y:330,               nome:'Quiosque do Lago' },
    { id:'l6', x:330,          y:1750,              nome:'Mercadinho' }
  ];

  m.insertAdjacentHTML('afterbegin', pecas.join(''));
  elMundo().querySelector('#alcance').style.cssText =
    `width:${ALCANCE * 2}px;height:${ALCANCE * 2}px`;
  desenharLojas();
  porJogador();
}

function desenharLojas(){
  const m = elMundo();
  m.querySelectorAll('.loja').forEach(e => e.remove());
  for(const l of lojas){
    const e = document.createElement('div');
    e.className = 'loja';
    e.dataset.loja = l.id;
    e.style.left = l.x + 'px';
    e.style.top = l.y + 'px';
    e.textContent = '🏪';
    m.appendChild(e);
  }
  pintarLojas();
}

/* a bolinha fica cinza enquanto a loja está de molho */
function pintarLojas(){
  const agora = Date.now();
  for(const l of lojas){
    const e = elMundo().querySelector(`[data-loja="${l.id}"]`);
    if(!e) continue;
    const pronta = agora >= (lojaQuando(l.id) || 0);
    e.classList.toggle('pronta', pronta && pertoDe(l.x, l.y));
    e.classList.toggle('vazia', !pronta);
  }
}

/* ---------------------------------------------------------
   O JOGADOR E A CÂMERA
   --------------------------------------------------------- */
function porJogador(){
  const e = $('#eu');
  e.style.left = (eu.x - 20) + 'px';
  e.style.top  = (eu.y - 44) + 'px';
  e.classList.toggle('andando', eu.andando);
  const a = $('#alcance');
  a.style.left = (eu.x - ALCANCE) + 'px';
  a.style.top  = (eu.y - ALCANCE) + 'px';
  camera();
}

function camera(){
  const w = window.innerWidth, h = window.innerHeight;
  /* preso nas beiradas: sem isso o bairro acabava e aparecia
     fundo vazio do lado */
  const x = Math.min(Math.max(eu.x - w / 2, 0), Math.max(MUNDO_W - w, 0));
  const y = Math.min(Math.max(eu.y - h / 2, 0), Math.max(MUNDO_H - h, 0));
  elMundo().style.transform = `translate(${-x}px,${-y}px)`;
}

function irPara(x, y){
  eu.aX = Math.min(Math.max(x, 24), MUNDO_W - 24);
  eu.aY = Math.min(Math.max(y, 24), MUNDO_H - 24);
  eu.andando = true;
}

/* onde o dedo tocou, em coordenada do bairro */
function doToque(ev){
  const r = elMundo().getBoundingClientRect();
  const p = ev.touches ? ev.touches[0] : ev;
  return { x:p.clientX - r.left, y:p.clientY - r.top };
}

const pertoDe = (x, y) => Math.hypot(x - eu.x, y - eu.y) <= ALCANCE;

/* ---------------------------------------------------------
   AS CARTAS NO CHÃO
   --------------------------------------------------------- */
function nascerSolta(){
  const c = sortearCarta();
  if(!c) return;
  /* nasce num anel em volta do jogador: perto o bastante pra
     ver, longe o bastante pra ter que andar até lá */
  const ang = Math.random() * Math.PI * 2;
  const dist = 190 + Math.random() * 520;
  const x = Math.min(Math.max(eu.x + Math.cos(ang) * dist, 40), MUNDO_W - 40);
  const y = Math.min(Math.max(eu.y + Math.sin(ang) * dist, 40), MUNDO_H - 40);

  const s = {
    chave: 's' + Date.now() + Math.floor(Math.random() * 999),
    carta: c, x, y,
    morre: Date.now() + DURA[0] + Math.random() * (DURA[1] - DURA[0])
  };
  soltas.push(s);

  const f = faixa(c);
  const e = document.createElement('div');
  e.className = `solta r${f.n}`;
  e.dataset.solta = s.chave;
  e.style.left = x + 'px';
  e.style.top = y + 'px';
  e.innerHTML = `<div class="faisca"></div><div class="costas">` +
    `<span class="sim" style="color:${f.cor}">${f.sim}</span></div>`;
  elMundo().appendChild(e);
}

function tirarSolta(chave){
  soltas = soltas.filter(s => s.chave !== chave);
  const e = elMundo().querySelector(`[data-solta="${chave}"]`);
  if(e) e.remove();
}

const soltaPorChave = chave => soltas.find(s => s.chave === chave) || null;

/* as de perto ficam acesas, as de longe apagadas: dá pra ver
   de olho o que já dá pra tentar */
function pintarSoltas(){
  for(const s of soltas){
    const e = elMundo().querySelector(`[data-solta="${s.chave}"]`);
    if(e) e.classList.toggle('longe', !pertoDe(s.x, s.y));
  }
}

function limparVelhas(){
  const agora = Date.now();
  for(const s of soltas.slice()) if(agora > s.morre) tirarSolta(s.chave);
}

/* ---------------------------------------------------------
   O RELÓGIO DO MUNDO
   --------------------------------------------------------- */
let ultimoQuadro = 0;

function quadro(t){
  requestAnimationFrame(quadro);
  const dt = Math.min((t - ultimoQuadro) / 1000, 0.1);
  ultimoQuadro = t;

  if(eu.andando){
    const dx = eu.aX - eu.x, dy = eu.aY - eu.y;
    const d = Math.hypot(dx, dy);
    const passo = VELOCIDADE * dt;
    if(d <= passo){ eu.x = eu.aX; eu.y = eu.aY; eu.andando = false; }
    else{ eu.x += dx / d * passo; eu.y += dy / d * passo; andou += passo; }
    porJogador();
    pintarSoltas();
    pintarLojas();
  }

  const agora = Date.now();
  if(agora > proximoNascer){
    proximoNascer = agora + NASCE_CADA[0] + Math.random() * (NASCE_CADA[1] - NASCE_CADA[0]);
    if(soltas.length < MAX_SOLTAS) nascerSolta();
    limparVelhas();
    pintarSoltas();
  }
}
