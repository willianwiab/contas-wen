/* =========================================================
   jogo.js — Hellow Click 🎃

   Um clicker vive de uma coisa só: o próximo número sempre
   tem que estar quase ao alcance. Por isso os preços sobem
   1,15x a cada compra — rápido o bastante pra nunca acabar,
   devagar o bastante pra sempre dar pra comprar mais uma.
   ========================================================= */

const CHAVE = 'hellow-click:v1';
const SENHA = 'pizza12345';
const $ = s => document.querySelector(s);

/* ---------------------------------------------------------
   AS COISAS QUE DÁ PRA COMPRAR
   --------------------------------------------------------- */

/* melhoram o CLIQUE — poucas, caras, e cada nível soma no clique */
const MELHORIAS = [
  { id:'dedo',    cor:'#cbd5e1', ic:'💀', nome:'Dedo Esquelético',   poder:1,       base:50,     desc:'Um dedo emprestado do cemitério.' },
  { id:'luva',    cor:'#a78bfa', ic:'🧤', nome:'Luva da Bruxa',      poder:6,       base:600,    desc:'Ela nem sentiu falta.' },
  { id:'garra',   cor:'#f59e0b', ic:'🐾', nome:'Garra de Lobisomem', poder:40,      base:6500,   desc:'Rasga a abóbora de primeira.' },
  { id:'mao',     cor:'#fb923c', ic:'🫱', nome:'Mão do Além',        poder:250,     base:8e4,    desc:'Clica sozinha se cê piscar.' },
  { id:'melado',  cor:'#fbbf24', ic:'🍯', nome:'Melado Amaldiçoado', poder:1800,    base:1.2e6,  desc:'Gruda doce em tudo que encosta.' },
  { id:'lua',     cor:'#fef08a', ic:'🌕', nome:'Lua Cheia',          poder:15000,   base:2e7,    desc:'Cê não controla mais o que acontece.' },
  { id:'meteoro', cor:'#f97316', ic:'☄️', nome:'Meteoro de Doce',    poder:120000,  base:3.5e8,  desc:'Cai do céu bem em cima da abóbora.' },
  { id:'pacto',   cor:'#e879f9', ic:'📜', nome:'Pacto Assinado',     poder:9e5,     base:6e9,    desc:'Cê nem leu o que estava escrito.' },
  { id:'cristal', cor:'#67e8f9', ic:'🔮', nome:'Bola de Cristal',    poder:7e6,     base:1e11,   desc:'Ela clica antes de cê pensar em clicar.' }
];

/* trabalham SOZINHOS — muitos, baratos no começo, é onde o jogo mora */
const BICHOS = [
  { id:'morcego',  cor:'#a78bfa', ic:'🦇',  nome:'Morcego',           porSeg:0.4,   base:20,    desc:'Traz um docinho de vez em quando.' },
  { id:'gato',     cor:'#94a3b8', ic:'🐈‍⬛', nome:'Gato Preto',        porSeg:2.5,   base:250,   desc:'Dá azar pros outros, sorte pra cê.' },
  { id:'aranha',   cor:'#7dd3fc', ic:'🕷️',  nome:'Aranha',            porSeg:11,    base:2200,  desc:'Tece rede e pesca doce voando.' },
  { id:'fantasma', cor:'#e0f2fe', ic:'👻',  nome:'Fantasma',          porSeg:55,    base:18000, desc:'Atravessa a parede da loja de doce.' },
  { id:'zumbi',    cor:'#86efac', ic:'🧟',  nome:'Zumbi',             porSeg:280,   base:1.3e5, desc:'Devagar, mas nunca para.' },
  { id:'bruxa',    cor:'#c084fc', ic:'🧙',  nome:'Bruxa',             porSeg:1400,  base:9e5,   desc:'Fabrica doce no caldeirão.' },
  { id:'vampiro',  cor:'#f87171', ic:'🧛',  nome:'Vampiro',           porSeg:7500,  base:6e6,   desc:'Trabalha a noite inteira, óbvio.' },
  { id:'ceifador', cor:'#cbd5e1', ic:'☠️',  nome:'Ceifador',          porSeg:42000, base:4.5e7, desc:'Ninguém discute com ele.' },
  { id:'viva',     cor:'#fb923c', ic:'🎃',  nome:'Abóbora Viva',      porSeg:2.4e5, base:3.2e8, desc:'Ela virou funcionária. Não pergunta.' },
  { id:'cemiterio',cor:'#94a3b8', ic:'🪦',  nome:'Cemitério Inteiro', porSeg:1.4e6, base:2.4e9, desc:'Todo mundo lá dentro trabalha pra cê.' },
  { id:'mansao',   cor:'#a78bfa', ic:'🏚️',  nome:'Mansão Assombrada', porSeg:8e6,   base:1.8e10,desc:'Vem com os moradores inclusos.' },
  { id:'portal',   cor:'#67e8f9', ic:'🌀',  nome:'Portal do Além',    porSeg:5e7,   base:1.4e11,desc:'Doce chegando de um lugar que é melhor não saber.' }
];

/* cada troféu dá +2% em tudo — assim caçar troféu não é só enfeite */
const CONQUISTAS = [
  { id:'c1',  e:'🍬', nome:'Primeiro doce',   desc:'1 doce',            tem:d => d.total >= 1 },
  { id:'c2',  e:'🍭', nome:'Boca doce',       desc:'100 doces',         tem:d => d.total >= 100 },
  { id:'c3',  e:'🎂', nome:'Guloso',          desc:'10 mil doces',      tem:d => d.total >= 1e4 },
  { id:'c4',  e:'👑', nome:'Rei dos doces',   desc:'1 milhão',          tem:d => d.total >= 1e6 },
  { id:'c5',  e:'🌌', nome:'Doce infinito',   desc:'1 bilhão',          tem:d => d.total >= 1e9 },
  { id:'c16', e:'🌠', nome:'Doce do espaço',  desc:'1 trilhão',         tem:d => d.total >= 1e12 },
  { id:'c6',  e:'👆', nome:'Dedo quente',     desc:'100 cliques',       tem:d => d.cliques >= 100 },
  { id:'c7',  e:'🔥', nome:'Dedo em chamas',  desc:'1.000 cliques',     tem:d => d.cliques >= 1000 },
  { id:'c8',  e:'⚡', nome:'Dedo biônico',    desc:'10.000 cliques',    tem:d => d.cliques >= 10000 },
  { id:'c17', e:'🌪️', nome:'Combo de 50',     desc:'50 cliques seguidos', tem:d => (d.maiorCombo||0) >= 50 },
  { id:'c20', e:'🧿', nome:'Clique poderoso', desc:'1 milhão por clique', tem:() => porCliqueCru() >= 1e6 },
  { id:'c9',  e:'🦇', nome:'Companhia',       desc:'1 ajudante',        tem:d => totalBichos(d) >= 1 },
  { id:'c10', e:'👹', nome:'Bandinha',        desc:'10 ajudantes',      tem:d => totalBichos(d) >= 10 },
  { id:'c11', e:'🏰', nome:'Mansão lotada',   desc:'100 ajudantes',     tem:d => totalBichos(d) >= 100 },
  { id:'c19', e:'🌍', nome:'Dono do bairro',  desc:'300 ajudantes',     tem:d => totalBichos(d) >= 300 },
  { id:'c18', e:'🛒', nome:'Colecionador',    desc:'50 de um bicho só', tem:d => BICHOS.some(b => (d.bichos[b.id]||0) >= 50) },
  { id:'c12', e:'🎪', nome:'Circo de horror', desc:'1 de cada bicho',   tem:d => BICHOS.every(b => (d.bichos[b.id]||0) > 0) },
  { id:'c13', e:'🌟', nome:'Sorte grande',    desc:'1 abóbora dourada', tem:d => d.douradas >= 1 },
  { id:'c14', e:'✨', nome:'Caçador de ouro', desc:'10 douradas',       tem:d => d.douradas >= 10 },
  { id:'c15', e:'⏱️', nome:'Fábrica do medo', desc:'1.000 doces/seg',   tem:d => porSegundoCru(d) >= 1000 }
];

/* ---------------------------------------------------------
   O ESTADO
   --------------------------------------------------------- */
const vazio = () => ({
  v:1, doces:0, total:0, cliques:0, douradas:0, maiorCombo:0,
  melhorias:{}, bichos:{}, conquistas:[], som:true, destravado:false, quando:Date.now()
});

let dados = carregar();
let bonus = null;          /* { tipo, ate } enquanto um bônus tá valendo */
let proximaDourada = 0;
let lote = 1;              /* 1, 10 ou 'max' */
let combo = 0, ultimoClique = 0;
let rodando = false;

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
   A TRANCA DO HALLOWEEN

   O jogo só abre de 25 de outubro a 1º de novembro. Quem
   sabe a senha entra quando quiser — e aí fica destravado
   pra sempre neste aparelho.

   Isso é uma brincadeira, não um cadeado: a senha está aqui
   no código, e quem abrir o arquivo acha. Pra valer de
   verdade precisaria de um servidor, que este jogo não tem.
   --------------------------------------------------------- */
function naSemanaDoHalloween(d = new Date()){
  const m = d.getMonth(), dia = d.getDate();
  return (m === 9 && dia >= 25) || (m === 10 && dia <= 1);
}

function proximaAbertura(){
  const hoje = new Date();
  const esteAno = new Date(hoje.getFullYear(), 9, 25);
  return hoje < esteAno ? esteAno : new Date(hoje.getFullYear() + 1, 9, 25);
}

function pintarContagem(){
  const falta = proximaAbertura() - new Date();
  if(falta <= 0) return destravar(false);
  const dias = Math.floor(falta / 86400000);
  const horas = Math.floor(falta / 3600000) % 24;
  const min = Math.floor(falta / 60000) % 60;
  const seg = Math.floor(falta / 1000) % 60;
  $('#travaConta').textContent = dias > 0
    ? `${dias} ${dias === 1 ? 'dia' : 'dias'} e ${horas}h`
    : `${horas}h ${String(min).padStart(2,'0')}m ${String(seg).padStart(2,'0')}s`;
}

function tentarSenha(){
  const escrito = $('#travaSenha').value.trim().toLowerCase();
  if(escrito === SENHA){
    dados.destravado = true;
    gravar();
    destravar(true);
  }else{
    $('#travaErro').textContent = escrito ? 'Essa não é a senha 👻' : 'Escreve a senha aí';
    $('#travaSenha').value = '';
  }
}

function destravar(comFesta){
  $('#trava').classList.remove('on');
  if(!rodando) comecarJogo();
  if(comFesta) recado('🔓 Entrou! Bem-vindo à casa assombrada 🎃');
}

/* ---------------------------------------------------------
   AS CONTAS
   --------------------------------------------------------- */
const totalBichos = d => BICHOS.reduce((s,b) => s + (d.bichos[b.id]||0), 0);

/* preço da PRÓXIMA unidade */
const precoBicho = b => Math.ceil(b.base * Math.pow(1.15, dados.bichos[b.id]||0));
const precoMelhoria = m => Math.ceil(m.base * Math.pow(1.7, dados.melhorias[m.id]||0));

/* preço de n unidades seguidas — soma de progressão geométrica.
   Comprar 10 de uma vez não pode sair pelo preço da primeira dez vezes. */
function precoDeVarias(base, escala, jaTem, n){
  return Math.ceil(base * Math.pow(escala, jaTem) * (Math.pow(escala, n) - 1) / (escala - 1));
}

/* quantas dá pra levar com o que tem no bolso */
function quantasCabem(base, escala, jaTem){
  let n = 0;
  while(n < 500 && precoDeVarias(base, escala, jaTem, n + 1) <= dados.doces) n++;
  return n;
}

/* quanto a pessoa vai comprar agora, com o lote que ela escolheu */
function quantoLeva(x){
  const ehMelhoria = x.poder !== undefined;
  const escala = ehMelhoria ? 1.7 : 1.15;
  const jaTem = (ehMelhoria ? dados.melhorias[x.id] : dados.bichos[x.id]) || 0;
  const n = lote === 'max' ? Math.max(1, quantasCabem(x.base, escala, jaTem)) : lote;
  return { n, escala, jaTem, preco: precoDeVarias(x.base, escala, jaTem, n) };
}

const multTrofeus = () => 1 + dados.conquistas.length * 0.02;
const multCombo = () => 1 + Math.min(combo, 50) * 0.02;

/* o clique "limpo", sem combo nem bônus — é o que os troféus medem */
function porCliqueCru(){
  const somado = MELHORIAS.reduce((s,m) => s + m.poder * (dados.melhorias[m.id]||0), 1);
  return somado * multTrofeus();
}
function porClique(){
  return porCliqueCru() * multCombo() * (bonus && bonus.tipo === 'frenesi' ? 7 : 1);
}

const porSegundoCru = d =>
  BICHOS.reduce((s,b) => s + b.porSeg * (d.bichos[b.id]||0), 0) * (1 + (d.conquistas||[]).length * 0.02);

const porSegundo = () =>
  porSegundoCru(dados) * (bonus && bonus.tipo === 'turbo' ? 5 : 1);

/* ---------------------------------------------------------
   NÚMERO GRANDE VIRA NÚMERO LEGÍVEL
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

   O combo faz o clique valer a pena: clicando rápido, cada
   toque vale mais. Ele existe pra quem está com o jogo
   aberto ter algo pra fazer além de esperar.
   --------------------------------------------------------- */
function clicar(ev){
  const agora = Date.now();
  combo = (agora - ultimoClique < 700) ? Math.min(combo + 1, 50) : 0;
  ultimoClique = agora;
  if(combo > (dados.maiorCombo||0)) dados.maiorCombo = combo;

  const ganho = porClique();
  dados.doces += ganho;
  dados.total += ganho;
  dados.cliques++;

  const ab = $('#abobora');
  ab.classList.remove('tremendo');
  void ab.offsetWidth;            /* reinicia a animação mesmo clicando rápido */
  ab.classList.add('tremendo');

  numeroSubindo('+' + num(ganho), ev);
  pintarCombo();
  bip(320 + Math.min(combo, 40) * 9, .04);
  conferirConquistas();
  pintarPlacar();
}

function pintarCombo(){
  const c = $('#combo');
  if(combo < 5){ c.classList.remove('on'); return; }
  c.textContent = `🔥 COMBO ×${multCombo().toFixed(2).replace('.', ',')}`;
  c.classList.remove('on'); void c.offsetWidth; c.classList.add('on');
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
function trocarLote(qual){
  lote = qual;
  document.querySelectorAll('.lote button').forEach(b =>
    b.classList.toggle('on', b.dataset.lote === String(qual)));
  pintarLoja();
}

function comprar(x){
  const { n, preco } = quantoLeva(x);
  if(dados.doces < preco){
    return recado(n > 1 ? `Falta doce pra levar ${n} 🍬` : 'Falta doce pra isso! 🍬');
  }
  dados.doces -= preco;
  const onde = x.poder !== undefined ? dados.melhorias : dados.bichos;
  onde[x.id] = (onde[x.id]||0) + n;
  bip(x.poder !== undefined ? 620 : 500, .07);
  recado(`${x.ic} ${x.nome}${n > 1 ? ` ×${n}` : ''} — ${x.poder !== undefined ? 'melhorou!' : 'entrou pro time!'}`);
  conferirConquistas(); pintarTudo(); gravar();
}

const comprarMelhoria = id => comprar(MELHORIAS.find(x => x.id === id));
const comprarBicho    = id => comprar(BICHOS.find(x => x.id === id));

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
  const cartao = (x, rende) => `
    <button class="item" id="it-${x.id}" style="--cor:${x.cor}"
            onclick="${x.poder !== undefined ? 'comprarMelhoria' : 'comprarBicho'}('${x.id}')">
      <span class="ic">${x.ic}</span>
      <span class="meio">
        <span class="linha1">
          <span class="nome">${x.nome}</span>
          <span class="tenho-selo" id="se-${x.id}" style="display:none"></span>
        </span>
        <span class="desc">${x.desc}</span>
        <span class="rende" id="rd-${x.id}">${rende}</span>
      </span>
      <span class="dir"><span class="preco" id="pr-${x.id}">0</span></span>
    </button>`;

  $('#listaCliques').innerHTML = MELHORIAS
    .map(m => cartao(m, `cada nível: <b>+${num(m.poder)}</b> por clique`)).join('');
  $('#listaBichos').innerHTML = BICHOS
    .map(b => cartao(b, `cada um: <b>${num(b.porSeg)}</b> por segundo`)).join('');

  [...MELHORIAS, ...BICHOS].forEach(x => {
    nos[x.id] = { item:$('#it-'+x.id), preco:$('#pr-'+x.id),
                  selo:$('#se-'+x.id), rende:$('#rd-'+x.id) };
  });
}

/* quantos a pessoa tem, e o quanto isso está rendendo AGORA — é a informação
   que ela quer e que antes era a letra menor do cartão */
function pintarUm(x, quantos, textoRende){
  const { n, preco } = quantoLeva(x);
  const nd = nos[x.id], pode = dados.doces >= preco;
  nd.preco.innerHTML = (n > 1 ? `<small>×${n}</small> ` : '') + num(preco) + ' 🍬';
  nd.preco.className = 'preco' + (pode ? '' : ' caro');
  nd.item.className = 'item ' + (pode ? 'pode' : 'caro') + (quantos ? ' tenho' : '');
  nd.selo.style.display = quantos ? '' : 'none';
  nd.selo.textContent = quantos ? '×' + quantos : '';
  nd.rende.innerHTML = textoRende;
}

function pintarLoja(){
  for(const m of MELHORIAS){
    const q = dados.melhorias[m.id]||0;
    pintarUm(m, q, q
      ? `dando <b>+${num(m.poder*q)}</b> por clique`
      : `cada nível: <b>+${num(m.poder)}</b> por clique`);
  }
  for(const b of BICHOS){
    const q = dados.bichos[b.id]||0;
    pintarUm(b, q, q
      ? `rendendo <b>${num(b.porSeg*q)}</b> por segundo`
      : `cada um: <b>${num(b.porSeg)}</b> por segundo`);
  }
}

/* os bichos que cê comprou aparecem morando no chão da cena —
   assim dá pra VER que o jogo andou, sem precisar ler número nenhum */
let moradoresAgora = '';
function pintarCenario(){
  const meus = BICHOS.filter(b => (dados.bichos[b.id]||0) > 0);
  const chave = meus.map(b => b.id).join(',');
  if(chave === moradoresAgora) return;   /* só redesenha quando muda de verdade */
  moradoresAgora = chave;
  $('#moradores').innerHTML = meus.map((b,i) =>
    `<span style="animation-delay:${(i*.24).toFixed(2)}s">${b.ic}</span>`).join('');
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
  $('#porClique').textContent = num(porClique());
  $('#porSeg').textContent = num(porSegundo());

  const nm = MELHORIAS.reduce((s,m) => s + (dados.melhorias[m.id]||0), 0);
  $('#contaCliques').textContent = nm ? nm + ' comprados' : '';
  const nb = totalBichos(dados);
  $('#contaBichos').textContent = nb ? nb + ' no time' : '';
  $('#contaTrofeus').textContent = dados.conquistas.length + '/' + CONQUISTAS.length;

  const pct = Math.round(dados.conquistas.length / CONQUISTAS.length * 100);
  $('#trofNum').textContent = `${dados.conquistas.length} de ${CONQUISTAS.length}`;
  $('#trofBonus').textContent = `+${dados.conquistas.length*2}%`;
  $('#trofBarra').style.width = pct + '%';

  $('#rodapeInfo').innerHTML =
    `Já juntou <b>${num(dados.total)}</b> doces no total · <b>${dados.cliques}</b> cliques` +
    (dados.maiorCombo ? ` · maior combo <b>${dados.maiorCombo}</b>` : '');
}

const pintarTudo = () => { pintarPlacar(); pintarLoja(); pintarCenario(); };

function trocarAba(qual){
  document.querySelectorAll('.abas button').forEach(b =>
    b.classList.toggle('on', b.dataset.aba === qual));
  document.querySelectorAll('.painel').forEach(p =>
    p.classList.toggle('on', p.id === 'painel-' + qual));
  /* comprar de 10 em 10 não faz sentido na parede de troféus */
  $('#loteBarra').style.display = qual === 'conquistas' ? 'none' : '';
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

  if(combo && agora - ultimoClique > 1200){ combo = 0; pintarCombo(); }

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
  const eraDestravado = dados.destravado;   /* quem já entrou não precisa da senha de novo */
  dados = vazio();
  dados.destravado = eraDestravado;
  combo = 0; pintarCombo();
  gravar();
  pintarTudo(); pintarConquistas();
  recado('🎃 Tudo novo de novo!');
}

/* ---------------------------------------------------------
   ENFEITE DA CENA
   --------------------------------------------------------- */
function enfeitarCena(){
  const cena = $('#cena');
  for(let i = 0; i < 26; i++){
    const e = document.createElement('div');
    e.className = 'estrela';
    e.style.left = Math.random() * 100 + '%';
    e.style.top = Math.random() * 62 + '%';
    e.style.animationDelay = (Math.random() * 3).toFixed(2) + 's';
    cena.appendChild(e);
  }
  for(let i = 0; i < 3; i++){
    const m = document.createElement('div');
    m.className = 'morcego-cena';
    m.textContent = '🦇';
    m.style.top = (10 + Math.random() * 40) + '%';
    m.style.animationDuration = (17 + Math.random() * 13) + 's';
    m.style.animationDelay = (-Math.random() * 25) + 's';
    cena.appendChild(m);
  }
}

/* ---------------------------------------------------------
   COMEÇO
   --------------------------------------------------------- */
function comecarJogo(){
  if(rodando) return;
  rodando = true;
  contarTempoFora();
  marcarProximaDourada();
  ultimo = Date.now();
  setInterval(tique, 100);
  setInterval(gravar, 10000);
}

montarLoja();
pintarConquistas();
pintarTudo();
enfeitarCena();
$('#btnSom').textContent = dados.som ? '🔊 Som' : '🔇 Mudo';

$('#abobora').addEventListener('pointerdown', clicar);
$('#dourada').addEventListener('pointerdown', pegarDourada);
$('#travaSenha').addEventListener('keydown', ev => { if(ev.key === 'Enter') tentarSenha(); });

document.addEventListener('visibilitychange', () => { if(document.hidden) gravar(); });
window.addEventListener('pagehide', gravar);

/* barra de espaço também clica, pra quem joga no computador */
document.addEventListener('keydown', ev => {
  if(ev.code !== 'Space') return;
  if(!rodando || ev.target.tagName === 'INPUT') return;
  ev.preventDefault();
  clicar();
});

if(naSemanaDoHalloween() || dados.destravado){
  comecarJogo();
}else{
  $('#trava').classList.add('on');
  pintarContagem();
  setInterval(pintarContagem, 1000);
}

if('serviceWorker' in navigator){
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}
