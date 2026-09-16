/* =========================================================
   jogo.js — Hellow Click 🎃

   Um clicker vive de uma coisa só: o próximo número sempre
   tem que estar quase ao alcance. Por isso os preços sobem
   1,15x a cada compra — rápido o bastante pra nunca acabar,
   devagar o bastante pra sempre dar pra comprar mais uma.
   ========================================================= */

const CHAVE = 'hellow-click:v1';
const $ = s => document.querySelector(s);

/* ---------------------------------------------------------
   AS COISAS QUE DÁ PRA COMPRAR
   --------------------------------------------------------- */

/* melhoram o CLIQUE — poucas, caras, e cada nível soma no clique */
const MELHORIAS = [
  { id:'dedo',   ic:'💀', nome:'Dedo Esquelético',    poder:1,     base:50,       desc:'Um dedo emprestado do cemitério.' },
  { id:'luva',   ic:'🧤', nome:'Luva da Bruxa',        poder:6,     base:600,      desc:'Ela nem sentiu falta.' },
  { id:'garra',  ic:'🐾', nome:'Garra de Lobisomem',   poder:40,    base:6500,     desc:'Rasga a abóbora de primeira.' },
  { id:'mao',    ic:'🫱', nome:'Mão do Além',          poder:250,   base:80000,    desc:'Clica sozinha se cê piscar.' },
  { id:'melado', ic:'🍯', nome:'Melado Amaldiçoado',   poder:1800,  base:1200000,  desc:'Gruda doce em tudo que encosta.' },
  { id:'lua',    ic:'🌕', nome:'Lua Cheia',            poder:15000, base:20000000, desc:'Cê não controla mais o que acontece.' }
];

/* trabalham SOZINHOS — muitos, baratos no começo, é onde o jogo mora */
const BICHOS = [
  { id:'morcego',  ic:'🦇',  nome:'Morcego',    porSeg:0.4,   base:20,       desc:'Traz um docinho de vez em quando.' },
  { id:'gato',     ic:'🐈‍⬛', nome:'Gato Preto', porSeg:2.5,   base:250,      desc:'Dá azar pros outros, sorte pra cê.' },
  { id:'aranha',   ic:'🕷️',  nome:'Aranha',     porSeg:11,    base:2200,     desc:'Tece rede e pesca doce voando.' },
  { id:'fantasma', ic:'👻',  nome:'Fantasma',   porSeg:55,    base:18000,    desc:'Atravessa a parede da loja de doce.' },
  { id:'zumbi',    ic:'🧟',  nome:'Zumbi',      porSeg:280,   base:130000,   desc:'Devagar, mas nunca para.' },
  { id:'bruxa',    ic:'🧙',  nome:'Bruxa',      porSeg:1400,  base:900000,   desc:'Fabrica doce no caldeirão.' },
  { id:'vampiro',  ic:'🧛',  nome:'Vampiro',    porSeg:7500,  base:6000000,  desc:'Trabalha a noite inteira, óbvio.' },
  { id:'ceifador', ic:'☠️',  nome:'Ceifador',   porSeg:42000, base:45000000, desc:'Ninguém discute com ele.' }
];

/* cada troféu dá +2% em tudo — assim caçar troféu não é só enfeite */
const CONQUISTAS = [
  { id:'c1',  e:'🍬', nome:'Primeiro doce',   desc:'1 doce',            tem:d => d.total >= 1 },
  { id:'c2',  e:'🍭', nome:'Boca doce',       desc:'100 doces',         tem:d => d.total >= 100 },
  { id:'c3',  e:'🎂', nome:'Guloso',          desc:'10 mil doces',      tem:d => d.total >= 1e4 },
  { id:'c4',  e:'👑', nome:'Rei dos doces',   desc:'1 milhão',          tem:d => d.total >= 1e6 },
  { id:'c5',  e:'🌌', nome:'Doce infinito',   desc:'1 bilhão',          tem:d => d.total >= 1e9 },
  { id:'c6',  e:'👆', nome:'Dedo quente',     desc:'100 cliques',       tem:d => d.cliques >= 100 },
  { id:'c7',  e:'🔥', nome:'Dedo em chamas',  desc:'1.000 cliques',     tem:d => d.cliques >= 1000 },
  { id:'c8',  e:'⚡', nome:'Dedo biônico',    desc:'10.000 cliques',    tem:d => d.cliques >= 10000 },
  { id:'c9',  e:'🦇', nome:'Companhia',       desc:'1 ajudante',        tem:d => totalBichos(d) >= 1 },
  { id:'c10', e:'👹', nome:'Bandinha',        desc:'10 ajudantes',      tem:d => totalBichos(d) >= 10 },
  { id:'c11', e:'🏰', nome:'Mansão lotada',   desc:'100 ajudantes',     tem:d => totalBichos(d) >= 100 },
  { id:'c12', e:'🎪', nome:'Circo de horror', desc:'1 de cada bicho',   tem:d => BICHOS.every(b => (d.bichos[b.id]||0) > 0) },
  { id:'c13', e:'🌟', nome:'Sorte grande',    desc:'1 abóbora dourada', tem:d => d.douradas >= 1 },
  { id:'c14', e:'✨', nome:'Caçador de ouro', desc:'10 douradas',       tem:d => d.douradas >= 10 },
  { id:'c15', e:'⏱️', nome:'Fábrica do medo', desc:'1.000 doces/seg',   tem:d => porSegundoCru(d) >= 1000 }
];

/* ---------------------------------------------------------
   O ESTADO
   --------------------------------------------------------- */
const vazio = () => ({
  v:1, doces:0, total:0, cliques:0, douradas:0,
  melhorias:{}, bichos:{}, conquistas:[], som:true, quando:Date.now()
});

let dados = carregar();
let bonus = null;          /* { tipo, ate } enquanto um bônus tá valendo */
let proximaDourada = 0;

function carregar(){
  try{
    const cru = localStorage.getItem(CHAVE);
    if(cru){
      const o = JSON.parse(cru);
      if(o && typeof o.doces === 'number'){
        /* preenche o que faltar, pra um save antigo nunca quebrar o jogo */
        return Object.assign(vazio(), o, {
          melhorias:o.melhorias||{}, bichos:o.bichos||{}, conquistas:o.conquistas||[]
        });
      }
    }
  }catch(e){ /* save torto: melhor começar do zero do que travar na tela preta */ }
  return vazio();
}

function gravar(){
  dados.quando = Date.now();
  try{ localStorage.setItem(CHAVE, JSON.stringify(dados)); }catch(e){}
}

/* ---------------------------------------------------------
   AS CONTAS
   --------------------------------------------------------- */
const totalBichos = d => BICHOS.reduce((s,b) => s + (d.bichos[b.id]||0), 0);

/* preço da próxima unidade: 1,15x por unidade já comprada */
const precoBicho = b => Math.ceil(b.base * Math.pow(1.15, dados.bichos[b.id]||0));
const precoMelhoria = m => Math.ceil(m.base * Math.pow(1.7, dados.melhorias[m.id]||0));

const multTrofeus = () => 1 + dados.conquistas.length * 0.02;

function porClique(){
  const somado = MELHORIAS.reduce((s,m) => s + m.poder * (dados.melhorias[m.id]||0), 1);
  return somado * multTrofeus() * (bonus && bonus.tipo === 'frenesi' ? 7 : 1);
}

const porSegundoCru = d =>
  BICHOS.reduce((s,b) => s + b.porSeg * (d.bichos[b.id]||0), 0) * (1 + (d.conquistas||[]).length * 0.02);

const porSegundo = () =>
  porSegundoCru(dados) * (bonus && bonus.tipo === 'turbo' ? 5 : 1);

/* ---------------------------------------------------------
   NÚMERO GRANDE VIRA NÚMERO LEGÍVEL

   "1234567" não diz nada pra ninguém. "1,23 mi" diz.
   --------------------------------------------------------- */
const ESCADA = [[1e18,'qui'],[1e15,'qua'],[1e12,'tri'],[1e9,'bi'],[1e6,'mi'],[1e3,'mil']];
function num(n){
  if(!isFinite(n)) return '∞';
  /* 0,4 por segundo não pode virar "0": pareceria que o bicho não faz nada */
  if(n < 10 && n % 1 !== 0) return n.toFixed(1).replace('.', ',');
  if(n < 1000) return Math.floor(n).toString();
  for(const [v,s] of ESCADA){
    if(n >= v){
      const x = n / v;
      const txt = x < 10 ? x.toFixed(2) : x < 100 ? x.toFixed(1) : Math.floor(x).toString();
      return txt.replace('.', ',') + ' ' + s;
    }
  }
}

/* ---------------------------------------------------------
   CLICAR NA ABÓBORA
   --------------------------------------------------------- */
function clicar(ev){
  const ganho = porClique();
  dados.doces += ganho;
  dados.total += ganho;
  dados.cliques++;

  const ab = $('#abobora');
  ab.classList.remove('tremendo');
  void ab.offsetWidth;            /* reinicia a animação mesmo clicando rápido */
  ab.classList.add('tremendo');

  numeroSubindo('+' + num(ganho), ev);
  bip(320 + Math.random() * 60, .04);
  conferirConquistas();
  pintarPlacar();
}

/* o "+50" que sobe do dedo — no lugar exato onde a pessoa tocou */
let subindoNaTela = 0;
function numeroSubindo(txt, ev){
  if(subindoNaTela > 12) return;   /* clique frenético não vira sopa de números */
  const palco = $('.palco');
  const cx = palco.getBoundingClientRect();
  const el = document.createElement('div');
  el.className = 'subindo';
  el.textContent = txt;
  el.style.left = ((ev && ev.clientX ? ev.clientX - cx.left : cx.width/2) - 18) + 'px';
  el.style.top  = ((ev && ev.clientY ? ev.clientY - cx.top  : cx.height/2) - 20) + 'px';
  palco.appendChild(el);
  subindoNaTela++;
  setTimeout(() => { el.remove(); subindoNaTela--; }, 1000);
}

/* ---------------------------------------------------------
   COMPRAR
   --------------------------------------------------------- */
function comprarMelhoria(id){
  const m = MELHORIAS.find(x => x.id === id);
  const preco = precoMelhoria(m);
  if(dados.doces < preco) return recado('Falta doce pra isso! 🍬');
  dados.doces -= preco;
  dados.melhorias[id] = (dados.melhorias[id]||0) + 1;
  bip(620, .07);
  recado(`${m.ic} ${m.nome} melhorou!`);
  conferirConquistas(); pintarTudo(); gravar();
}

function comprarBicho(id){
  const b = BICHOS.find(x => x.id === id);
  const preco = precoBicho(b);
  if(dados.doces < preco) return recado('Falta doce pra isso! 🍬');
  dados.doces -= preco;
  dados.bichos[id] = (dados.bichos[id]||0) + 1;
  bip(500, .07);
  recado(`${b.ic} ${b.nome} entrou pro time!`);
  conferirConquistas(); pintarTudo(); gravar();
}

/* ---------------------------------------------------------
   A ABÓBORA DOURADA

   O momento mais divertido de um clicker é o que a pessoa
   não esperava. Ela aparece sozinha e some se ninguém pegar.
   --------------------------------------------------------- */
function marcarProximaDourada(){
  proximaDourada = Date.now() + (40 + Math.random() * 70) * 1000;
}

function talvezSoltarDourada(){
  if(Date.now() < proximaDourada) return;
  if($('#dourada').classList.contains('on')) return;
  marcarProximaDourada();

  const d = $('#dourada');
  d.style.left = (8 + Math.random() * 74) + 'vw';
  d.style.top  = (14 + Math.random() * 62) + 'vh';
  d.classList.add('on');
  setTimeout(() => d.classList.remove('on'), 9000);   /* quem cochilou, perdeu */
}

function pegarDourada(){
  const d = $('#dourada');
  if(!d.classList.contains('on')) return;
  d.classList.remove('on');
  dados.douradas++;
  bip(880, .12); setTimeout(() => bip(1180, .12), 90);

  const sorte = Math.random();
  if(sorte < .42){
    bonus = { tipo:'frenesi', ate: Date.now() + 15000 };
    faixa('🔥 FRENESI! Clique valendo 7x por 15 segundos!');
  }else if(sorte < .8){
    bonus = { tipo:'turbo', ate: Date.now() + 20000 };
    faixa('⚡ TURBO! Teus monstros rendem 5x por 20 segundos!');
  }else{
    const chuva = Math.max(30, dados.doces * .12 + porSegundoCru(dados) * 90);
    dados.doces += chuva; dados.total += chuva;
    faixa(`🍬 CHUVA DE DOCES! +${num(chuva)}`);
    setTimeout(() => $('#faixaBonus').classList.remove('on'), 4000);
  }
  conferirConquistas(); pintarTudo();
}

function faixa(txt){
  const f = $('#faixaBonus');
  f.textContent = txt;
  f.classList.add('on');
}

/* ---------------------------------------------------------
   CONQUISTAS
   --------------------------------------------------------- */
function conferirConquistas(){
  let apareceu = false;
  for(const c of CONQUISTAS){
    if(dados.conquistas.includes(c.id)) continue;
    if(c.tem(dados)){
      dados.conquistas.push(c.id);
      recado(`🏆 Troféu: ${c.e} ${c.nome}`);
      bip(760, .1);
      apareceu = true;
    }
  }
  if(apareceu) pintarConquistas();
}

/* ---------------------------------------------------------
   DESENHAR A TELA

   A loja é montada uma vez só; depois a gente só troca o
   preço e a cor. Refazer o HTML a cada décimo de segundo
   engoliria o toque da pessoa no meio do caminho.
   --------------------------------------------------------- */
const nos = {};

function montarLoja(){
  $('#listaCliques').innerHTML = MELHORIAS.map(m => `
    <button class="item" id="it-${m.id}" onclick="comprarMelhoria('${m.id}')">
      <span class="ic">${m.ic}</span>
      <span class="meio">
        <span class="nome">${m.nome}</span>
        <span class="desc">${m.desc}<br>+${num(m.poder)} por clique</span>
      </span>
      <span class="dir">
        <span class="preco" id="pr-${m.id}">0</span>
        <span class="qtd" id="qt-${m.id}"></span>
      </span>
    </button>`).join('');

  $('#listaBichos').innerHTML = BICHOS.map(b => `
    <button class="item" id="it-${b.id}" onclick="comprarBicho('${b.id}')">
      <span class="ic">${b.ic}</span>
      <span class="meio">
        <span class="nome">${b.nome}</span>
        <span class="desc">${b.desc}<br>${b.porSeg} doces por segundo</span>
      </span>
      <span class="dir">
        <span class="preco" id="pr-${b.id}">0</span>
        <span class="qtd" id="qt-${b.id}"></span>
      </span>
    </button>`).join('');

  [...MELHORIAS, ...BICHOS].forEach(x => {
    nos[x.id] = { item:$('#it-'+x.id), preco:$('#pr-'+x.id), qtd:$('#qt-'+x.id) };
  });
}

function pintarLoja(){
  for(const m of MELHORIAS){
    const p = precoMelhoria(m), n = nos[m.id], pode = dados.doces >= p;
    n.preco.textContent = num(p) + ' 🍬';
    n.preco.className = 'preco' + (pode ? '' : ' caro');
    n.qtd.textContent = (dados.melhorias[m.id]||0) ? 'nível ' + dados.melhorias[m.id] : '';
    n.item.className = 'item ' + (pode ? 'pode' : 'caro');
  }
  for(const b of BICHOS){
    const p = precoBicho(b), n = nos[b.id], pode = dados.doces >= p;
    n.preco.textContent = num(p) + ' 🍬';
    n.preco.className = 'preco' + (pode ? '' : ' caro');
    n.qtd.textContent = (dados.bichos[b.id]||0) ? 'cê tem ' + dados.bichos[b.id] : '';
    n.item.className = 'item ' + (pode ? 'pode' : 'caro');
  }
}

function pintarConquistas(){
  $('#listaConquistas').innerHTML = CONQUISTAS.map(c => {
    const tem = dados.conquistas.includes(c.id);
    return `<div class="conq ${tem ? 'tem' : 'falta'}">
      <div class="e">${tem ? c.e : '🔒'}</div>
      <div class="n">${tem ? c.nome : '???'}</div>
      <div class="d">${c.desc}</div>
    </div>`;
  }).join('');
}

function pintarPlacar(){
  $('#doces').textContent = num(dados.doces);
  const ps = porSegundo();
  $('#porSeg').textContent = ps > 0 ? `+${num(ps)} por segundo` : '';
  $('#rodapeInfo').innerHTML =
    `Já juntou <b>${num(dados.total)}</b> doces no total · <b>${dados.cliques}</b> cliques · ` +
    `<b>${dados.conquistas.length}/${CONQUISTAS.length}</b> troféus (+${dados.conquistas.length*2}% em tudo)`;
}

const pintarTudo = () => { pintarPlacar(); pintarLoja(); };

function trocarAba(qual){
  document.querySelectorAll('.abas button').forEach(b =>
    b.classList.toggle('on', b.dataset.aba === qual));
  document.querySelectorAll('.painel').forEach(p =>
    p.classList.toggle('on', p.id === 'painel-' + qual));
}

function recado(txt){
  const el = document.createElement('div');
  el.className = 'aviso';
  el.textContent = txt;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3400);
}

/* ---------------------------------------------------------
   SOM — bipes curtinhos, sem arquivo nenhum pra baixar
   --------------------------------------------------------- */
let audio = null;
function bip(hz, vol){
  if(!dados.som) return;
  try{
    if(!audio) audio = new (window.AudioContext || window.webkitAudioContext)();
    const o = audio.createOscillator(), g = audio.createGain();
    o.type = 'triangle'; o.frequency.value = hz;
    g.gain.setValueAtTime(vol, audio.currentTime);
    g.gain.exponentialRampToValueAtTime(.0001, audio.currentTime + .12);
    o.connect(g); g.connect(audio.destination);
    o.start(); o.stop(audio.currentTime + .13);
  }catch(e){ /* navegador sem áudio: o jogo continua igual */ }
}
function virarSom(){
  dados.som = !dados.som;
  $('#btnSom').textContent = dados.som ? '🔊 Som' : '🔇 Mudo';
  gravar();
}

/* ---------------------------------------------------------
   O RELÓGIO DO JOGO
   --------------------------------------------------------- */
let ultimo = Date.now();
function tique(){
  const agora = Date.now();
  const dt = Math.min((agora - ultimo) / 1000, 1);   /* aba escondida não vira tesouro */
  ultimo = agora;

  const ganho = porSegundo() * dt;
  if(ganho > 0){ dados.doces += ganho; dados.total += ganho; }

  if(bonus && agora > bonus.ate){
    bonus = null;
    $('#faixaBonus').classList.remove('on');
  }
  talvezSoltarDourada();
  conferirConquistas();
  pintarTudo();
}

/* ---------------------------------------------------------
   ENQUANTO A PESSOA ESTAVA FORA

   Rende pela metade: se rendesse igual, valeria mais a pena
   fechar o jogo do que jogar.
   --------------------------------------------------------- */
function contarTempoFora(){
  const fora = (Date.now() - (dados.quando || Date.now())) / 1000;
  if(fora < 60) return;
  const limitado = Math.min(fora, 8 * 3600);
  const ganho = porSegundoCru(dados) * limitado * .5;
  if(ganho < 10) return;
  dados.doces += ganho; dados.total += ganho;
  $('#foraQuanto').textContent = num(ganho);
  $('#modalFora').classList.add('on');
}
const fecharFora = () => $('#modalFora').classList.remove('on');

/* ---------------------------------------------------------
   BOTÕES DO RODAPÉ
   --------------------------------------------------------- */
function salvarAgora(){ gravar(); recado('💾 Salvo neste aparelho!'); }

function apagarTudo(){
  if(!confirm('Recomeçar do zero?\n\nTeus doces, monstros e troféus somem pra sempre.')) return;
  if(!confirm('Certeza mesmo? Não tem como voltar atrás. 💀')) return;
  dados = vazio();
  gravar();
  pintarTudo(); pintarConquistas();
  recado('🎃 Tudo novo de novo!');
}

/* ---------------------------------------------------------
   MORCEGOS DE ENFEITE NO FUNDO
   --------------------------------------------------------- */
function soltarMorcegos(){
  for(let i = 0; i < 6; i++){
    const m = document.createElement('div');
    m.className = 'morcego-fundo';
    m.textContent = '🦇';
    m.style.top = (8 + Math.random() * 84) + 'vh';
    m.style.animationDuration = (16 + Math.random() * 16) + 's';
    m.style.animationDelay = (-Math.random() * 20) + 's';
    document.body.appendChild(m);
  }
}

/* ---------------------------------------------------------
   COMEÇO
   --------------------------------------------------------- */
montarLoja();
pintarConquistas();
pintarTudo();
soltarMorcegos();
marcarProximaDourada();
contarTempoFora();
$('#btnSom').textContent = dados.som ? '🔊 Som' : '🔇 Mudo';

$('#abobora').addEventListener('pointerdown', clicar);
$('#dourada').addEventListener('pointerdown', pegarDourada);

setInterval(tique, 100);
setInterval(gravar, 10000);
document.addEventListener('visibilitychange', () => { if(document.hidden) gravar(); });
window.addEventListener('pagehide', gravar);

/* barra de espaço também clica, pra quem joga no computador */
document.addEventListener('keydown', ev => {
  if(ev.code === 'Space'){ ev.preventDefault(); clicar(); }
});

if('serviceWorker' in navigator){
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}
