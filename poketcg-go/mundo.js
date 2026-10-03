/* =========================================================
   PokéTCG GO — O MUNDO

   O mundo é INFINITO. Ele é feito de pedaços de 520 por 520
   que nascem em volta do jogador conforme ele anda e somem
   quando ficam pra trás — senão andar de verdade na rua, com
   GPS, acabaria o mapa em cinco minutos.

   Cada pedaço nasce de uma conta em cima das próprias
   coordenadas, então a mesma esquina tem sempre as mesmas
   árvores: dá pra voltar num lugar e reconhecer.

   Quem move o jogador são dois motores diferentes:
     · mapa   — o dedo toca e o boneco anda até lá
     · GPS    — o aparelho diz onde cê está de verdade
   O resto do jogo não fica sabendo qual dos dois está ligado.
   ========================================================= */

const PEDACO = 520;              /* o lado de cada pedaço, em pixels */
const RAIO_PEDACOS = 2;          /* quantos pedaços manter em volta */
const PX_POR_METRO = 3.6;        /* um metro andado na rua = 3,6 px no mapa */
const VELOCIDADE = 165;          /* pixels por segundo, no modo mapa */
const ALCANCE = 95;              /* de quão longe dá pra capturar */
const MAX_SOLTAS = 8;
const NASCE_CADA = [5000, 11000];
const DURA = [55000, 130000];
const LOJA_ESPERA = 3 * 60 * 1000;

/* dado com semente: mesma semente, mesmo pedaço de mundo */
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
/* dois números viram um só, sem dar o mesmo resultado pra (3,5) e (5,3) */
const semeia = (a, b, extra) =>
  ((a * 73856093) ^ (b * 19349663) ^ ((extra || 0) * 83492791)) >>> 0;

const $ = s => document.querySelector(s);
const elMundo = () => $('#mundo');

let eu = { x:0, y:0, aX:0, aY:0, andando:false };
let soltas = [];
let lojas = [];                  /* as que existem nos pedaços de agora */
let pedacos = new Map();
let proximoNascer = 0;
let andou = 0;                   /* em pixels; vira metro na hora de mostrar */
let sementeDoMundo = 1;

/* =========================================================
   OS PEDAÇOS
   ========================================================= */
function montarBairro(semente){
  sementeDoMundo = semente >>> 0;
  const m = elMundo();
  m.style.width = m.style.height = '0px';     /* o mundo não tem tamanho */
  $('#alcance').style.cssText = `width:${ALCANCE * 2}px;height:${ALCANCE * 2}px`;
  cuidarDosPedacos();
  porJogador();
}

const chaveP = (cx, cy) => cx + ',' + cy;

function nascerPedaco(cx, cy){
  const d = dadinho(semeia(cx, cy, sementeDoMundo));
  const x0 = cx * PEDACO, y0 = cy * PEDACO;

  const caixa = document.createElement('div');
  caixa.className = 'pedaco';
  caixa.style.cssText = `left:${x0}px;top:${y0}px;width:${PEDACO}px;height:${PEDACO}px`;

  const pecas = [];
  const por = (cls, x, y, w, h, dentro) =>
    pecas.push(`<div class="peca ${cls}" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px">${dentro || ''}</div>`);

  /* as ruas seguem a grade do mundo, não do pedaço: assim elas
     atravessam de um pedaço pro outro sem degrau */
  if(cx % 3 === 0) por('rua', PEDACO / 2 - 38, 0, 76, PEDACO);
  if(cy % 3 === 0) por('rua', 0, PEDACO / 2 - 38, PEDACO, 76);

  if(d() < .18){
    const w = 150 + Math.floor(d() * 150), h = 110 + Math.floor(d() * 110);
    por('lago', Math.floor(d() * (PEDACO - w)), Math.floor(d() * (PEDACO - h)), w, h);
  }

  const quantasCasas = Math.floor(d() * 4);
  for(let i = 0; i < quantasCasas; i++){
    const w = 100 + Math.floor(d() * 60), h = 80 + Math.floor(d() * 50);
    const x = 30 + Math.floor(d() * (PEDACO - w - 60));
    const y = 30 + Math.floor(d() * (PEDACO - h - 60));
    if(cx % 3 === 0 && Math.abs(x + w / 2 - PEDACO / 2) < 90) continue;   /* não em cima da rua */
    if(cy % 3 === 0 && Math.abs(y + h / 2 - PEDACO / 2) < 90) continue;
    const jan = [];
    for(let j = 0; j < 3; j++) jan.push(`<div class="jan" style="left:${14 + j * 26}px;top:${h * .52}px"></div>`);
    por('predio', x, y, w, h, `<div class="teto"></div>${jan.join('')}`);
  }

  const arvores = ['🌳','🌲','🌴','🪴'];
  for(let i = 0; i < 16; i++)
    pecas.push(`<div class="peca arvore" style="left:${Math.floor(d() * (PEDACO - 34))}px;top:${Math.floor(d() * (PEDACO - 34))}px">${arvores[Math.floor(d() * 4)]}</div>`);
  const enfeites = ['🌼','🌻','🪨','🍄','🌾','🦋'];
  for(let i = 0; i < 12; i++)
    pecas.push(`<div class="peca enfeite" style="left:${Math.floor(d() * (PEDACO - 22))}px;top:${Math.floor(d() * (PEDACO - 22))}px">${enfeites[Math.floor(d() * 6)]}</div>`);

  caixa.innerHTML = pecas.join('');
  elMundo().insertBefore(caixa, elMundo().firstChild);
  pedacos.set(chaveP(cx, cy), caixa);

  /* mais ou menos uma lojinha a cada dois pedaços, sempre no
     mesmo canto do mesmo pedaço */
  if(d() < .55){
    const l = { id:`L${cx}_${cy}`, x:x0 + 60 + d() * (PEDACO - 120),
      y:y0 + 60 + d() * (PEDACO - 120), nome:nomeDeLoja(d) };
    lojas.push(l);
    const e = document.createElement('div');
    e.className = 'loja';
    e.dataset.loja = l.id;
    e.style.left = l.x + 'px';
    e.style.top = l.y + 'px';
    e.textContent = '🏪';
    elMundo().appendChild(e);
  }
}

const NOMES_LOJA = ['Banca da Esquina','Papelaria','Mercadinho','Bar do Zé','Quiosque',
  'Barraca da Feira','Lojinha de Carta','Posto','Padaria','Banca de Revista'];
const nomeDeLoja = d => NOMES_LOJA[Math.floor(d() * NOMES_LOJA.length)];

function matarPedaco(cx, cy){
  const k = chaveP(cx, cy);
  const e = pedacos.get(k);
  if(e) e.remove();
  pedacos.delete(k);
  const x0 = cx * PEDACO, y0 = cy * PEDACO;
  for(const l of lojas.slice()){
    if(l.x >= x0 && l.x < x0 + PEDACO && l.y >= y0 && l.y < y0 + PEDACO){
      const el = elMundo().querySelector(`[data-loja="${l.id}"]`);
      if(el) el.remove();
      lojas = lojas.filter(o => o !== l);
    }
  }
}

/* nasce o que está perto, mata o que ficou longe */
function cuidarDosPedacos(){
  const cx = Math.floor(eu.x / PEDACO), cy = Math.floor(eu.y / PEDACO);
  for(let i = -RAIO_PEDACOS; i <= RAIO_PEDACOS; i++)
    for(let j = -RAIO_PEDACOS; j <= RAIO_PEDACOS; j++)
      if(!pedacos.has(chaveP(cx + i, cy + j))) nascerPedaco(cx + i, cy + j);

  for(const k of Array.from(pedacos.keys())){
    const [a, b] = k.split(',').map(Number);
    if(Math.abs(a - cx) > RAIO_PEDACOS + 1 || Math.abs(b - cy) > RAIO_PEDACOS + 1)
      matarPedaco(a, b);
  }
  pintarLojas();
}

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

/* =========================================================
   O JOGADOR E A CÂMERA
   ========================================================= */
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

/* sem travas nas beiradas: o mundo não tem beirada */
function camera(){
  elMundo().style.transform =
    `translate(${-(eu.x - window.innerWidth / 2)}px,${-(eu.y - window.innerHeight / 2)}px)`;
}

/* O dedo só perde a vez quando o GPS REALMENTE assumiu. Enquanto
   ele procura — ou se deu erro — tocar na tela continua andando:
   senão quem não tem sinal fica presto numa tela que não responde. */
function irPara(x, y){
  if(gpsMandando()) return;
  eu.aX = x; eu.aY = y;
  eu.andando = true;
}

const gpsMandando = () => gps.ligado && !!gps.origem && !gps.erro;

function doToque(ev){
  const r = elMundo().getBoundingClientRect();
  const p = ev.touches ? ev.touches[0] : ev;
  return { x:p.clientX - r.left, y:p.clientY - r.top };
}

const pertoDe = (x, y) => Math.hypot(x - eu.x, y - eu.y) <= ALCANCE;

/* =========================================================
   📍 O GPS

   A conta é a de sempre pra distâncias curtas: perto da pessoa,
   um grau de longitude vale 111.320 m vezes o cosseno da
   latitude, e um grau de latitude vale 110.540 m. Isso erra em
   escala de continente e acerta em escala de quarteirão — que
   é a escala deste jogo.

   A localização NÃO SAI DO APARELHO. Este jogo não tem servidor
   nenhum: não existe pra onde mandar.
   ========================================================= */
let gps = { ligado:false, id:null, origem:null, precisao:0, erro:'',
  alvoX:0, alvoY:0, ultima:0 };
let vigia = null;      /* o cão de guarda do GPS, explicado abaixo */

const temGps = () => 'geolocation' in navigator;

function metrosPraPixel(lat, lon){
  const o = gps.origem;
  const mx = (lon - o.lon) * 111320 * Math.cos(o.lat * Math.PI / 180);
  const my = (o.lat - lat) * 110540;
  return { x:mx * PX_POR_METRO, y:my * PX_POR_METRO };
}

function ligarGps(aoMudar){
  if(!temGps()){ gps.erro = 'este aparelho não tem localização'; aoMudar && aoMudar(); return; }
  gps.erro = '';
  gps.ligado = true;

  /* O CÃO DE GUARDA.
     Descoberto testando: quando a pessoa NEGA a localização, o
     navegador simplesmente não chama nem o acerto nem o erro —
     e nem o 'timeout' que a gente pede vale. Sem este relógio
     aqui, o jogo ficava em "procurando onde cê está" pra
     sempre. Conferido: 26 segundos e nenhum aviso. */
  clearTimeout(vigia);
  vigia = setTimeout(() => {
    if(gps.ligado && !gps.origem && !gps.erro){
      gps.erro = 'não achei o sinal — dá pra continuar tocando no mapa';
      aoMudar && aoMudar();
    }
  }, 12000);

  gps.id = navigator.geolocation.watchPosition(
    p => {
      const c = p.coords;
      clearTimeout(vigia);
      gps.erro = '';
      if(!gps.origem){
        eu.andando = false;        /* o GPS assume: para o passo do dedo */
        /* o primeiro acerto vira o centro do mundo: assim o lugar
           onde cê ligou o jogo é o (0,0) e tudo é relativo a ele */
        gps.origem = { lat:c.latitude, lon:c.longitude };
        gps.alvoX = eu.x; gps.alvoY = eu.y;
      }else{
        const d = metrosPraPixel(c.latitude, c.longitude);
        gps.alvoX = d.x; gps.alvoY = d.y;
      }
      gps.precisao = Math.round(c.accuracy || 0);
      gps.ultima = Date.now();
      aoMudar && aoMudar();
    },
    e => {
      clearTimeout(vigia);
      gps.erro = e.code === 1 ? 'cê não deixou o jogo ver a localização'
               : e.code === 2 ? 'o aparelho não conseguiu achar onde cê está'
               : e.code === 3 ? 'demorou demais pra achar o sinal'
               : 'não deu pra pegar a localização';
      aoMudar && aoMudar();
    },
    { enableHighAccuracy:true, maximumAge:4000, timeout:20000 }
  );
  aoMudar && aoMudar();
}

function desligarGps(aoMudar){
  clearTimeout(vigia);
  if(gps.id != null) navigator.geolocation.clearWatch(gps.id);
  gps = { ligado:false, id:null, origem:null, precisao:0, erro:'',
    alvoX:0, alvoY:0, ultima:0 };
  $('#precisao').classList.remove('on');
  aoMudar && aoMudar();
}

/* =========================================================
   O RELÓGIO DO MUNDO
   ========================================================= */
let ultimoQuadro = 0;
let ultimoPedaco = '';

function quadro(t){
  requestAnimationFrame(quadro);
  const dt = Math.min((t - ultimoQuadro) / 1000, 0.1);
  ultimoQuadro = t;
  let mexeu = false;

  if(gpsMandando()){
    /* escorrega até o ponto do GPS em vez de teleportar: o sinal
       pula uns metros parado, e teleporte faz o boneco tremer */
    const dx = gps.alvoX - eu.x, dy = gps.alvoY - eu.y;
    const d = Math.hypot(dx, dy);
    if(d > 0.5){
      const passo = Math.min(d, Math.max(d * 3.2 * dt, 24 * dt));
      eu.x += dx / d * passo;
      eu.y += dy / d * passo;
      andou += passo;
      mexeu = true;
    }
    const p = $('#precisao');
    const raio = gps.precisao * PX_POR_METRO;
    p.classList.toggle('on', gps.precisao > 0);
    p.style.cssText = `width:${raio * 2}px;height:${raio * 2}px;` +
      `left:${eu.x - raio}px;top:${eu.y - raio}px`;
  }else if(eu.andando){
    const dx = eu.aX - eu.x, dy = eu.aY - eu.y;
    const d = Math.hypot(dx, dy);
    const passo = VELOCIDADE * dt;
    if(d <= passo){ eu.x = eu.aX; eu.y = eu.aY; eu.andando = false; }
    else{ eu.x += dx / d * passo; eu.y += dy / d * passo; andou += passo; }
    mexeu = true;
  }

  if(mexeu){
    porJogador();
    pintarSoltas();
    const agoraP = Math.floor(eu.x / PEDACO) + ',' + Math.floor(eu.y / PEDACO);
    if(agoraP !== ultimoPedaco){ ultimoPedaco = agoraP; cuidarDosPedacos(); }
    else pintarLojas();
  }

  const agora = Date.now();
  if(agora > proximoNascer){
    proximoNascer = agora + NASCE_CADA[0] + Math.random() * (NASCE_CADA[1] - NASCE_CADA[0]);
    if(soltas.length < MAX_SOLTAS) nascerSolta();
    limparVelhas();
    pintarSoltas();
  }
}

/* =========================================================
   AS CARTAS NO CHÃO
   ========================================================= */
function nascerSolta(){
  const c = sortearCarta();
  if(!c) return;
  const ang = Math.random() * Math.PI * 2;
  /* no GPS elas nascem mais perto: ninguém vai andar 150 metros
     de verdade atrás de uma carta comum */
  const dist = gpsMandando() ? 110 + Math.random() * 260 : 190 + Math.random() * 520;
  const x = eu.x + Math.cos(ang) * dist;
  const y = eu.y + Math.sin(ang) * dist;

  const s = { chave:'s' + Date.now() + Math.floor(Math.random() * 999),
    carta:c, x, y, morre:Date.now() + DURA[0] + Math.random() * (DURA[1] - DURA[0]) };
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
