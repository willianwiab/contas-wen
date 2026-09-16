/* =========================================================
   jogo.js — Hellow Click 🎃

   Um clicker vive de uma coisa só: o próximo número sempre
   tem que estar quase ao alcance. Por isso os preços sobem
   1,15x a cada compra — rápido o bastante pra nunca acabar,
   devagar o bastante pra sempre dar pra comprar mais uma.
   ========================================================= */

const CHAVE = 'hellow-click:v1';
const SENHA = 'pizza12345';
const SENHA_ADM = '1234';
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
  { id:'morcego', plural:'morcegos',  cor:'#a78bfa', ic:'🦇',  nome:'Morcego',           porSeg:0.4,   base:20,    desc:'Traz um docinho de vez em quando.' },
  { id:'gato', plural:'gatos pretos',     cor:'#94a3b8', ic:'🐈‍⬛', nome:'Gato Preto',        porSeg:2.5,   base:250,   desc:'Dá azar pros outros, sorte pra cê.' },
  { id:'aranha', plural:'aranhas',   cor:'#7dd3fc', ic:'🕷️',  nome:'Aranha',            porSeg:11,    base:2200,  desc:'Tece rede e pesca doce voando.' },
  { id:'fantasma', plural:'fantasmas', cor:'#e0f2fe', ic:'👻',  nome:'Fantasma',          porSeg:55,    base:18000, desc:'Atravessa a parede da loja de doce.' },
  { id:'zumbi', plural:'zumbis',    cor:'#86efac', ic:'🧟',  nome:'Zumbi',             porSeg:280,   base:1.3e5, desc:'Devagar, mas nunca para.' },
  { id:'bruxa', plural:'bruxas',    cor:'#c084fc', ic:'🧙',  nome:'Bruxa',             porSeg:1400,  base:9e5,   desc:'Fabrica doce no caldeirão.' },
  { id:'vampiro', plural:'vampiros',  cor:'#f87171', ic:'🧛',  nome:'Vampiro',           porSeg:7500,  base:6e6,   desc:'Trabalha a noite inteira, óbvio.' },
  { id:'ceifador', plural:'ceifadores', cor:'#cbd5e1', ic:'☠️',  nome:'Ceifador',          porSeg:42000, base:4.5e7, desc:'Ninguém discute com ele.' },
  { id:'viva', plural:'abóboras vivas',     cor:'#fb923c', ic:'🎃',  nome:'Abóbora Viva',      porSeg:2.4e5, base:3.2e8, desc:'Ela virou funcionária. Não pergunta.' },
  { id:'cemiterio', plural:'cemitérios inteiros',cor:'#94a3b8', ic:'🪦',  nome:'Cemitério Inteiro', porSeg:1.4e6, base:2.4e9, desc:'Todo mundo lá dentro trabalha pra cê.' },
  { id:'mansao', plural:'mansões assombradas',   cor:'#a78bfa', ic:'🏚️',  nome:'Mansão Assombrada', porSeg:8e6,   base:1.8e10,desc:'Vem com os moradores inclusos.' },
  { id:'portal', plural:'portais do além',   cor:'#67e8f9', ic:'🌀',  nome:'Portal do Além',    porSeg:5e7,   base:1.4e11,desc:'Doce chegando de um lugar que é melhor não saber.' }
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
  { id:'c15', e:'⏱️', nome:'Fábrica do medo', desc:'1.000 doces/seg',   tem:() => porSegundoCru() >= 1000 },
  { id:'c21', e:'🔓', nome:'Trapaceiro',     desc:'Entrar no modo adm',tem:d => !!d.admUsado }
];

/* ---------------------------------------------------------
   NÚMERO GRANDE VIRA NÚMERO LEGÍVEL

   Este bloco mora aqui em cima de propósito: o gerador de
   melhorias logo abaixo chama num() na hora de montar os
   textos, e const não existe antes da linha que a declara.
   --------------------------------------------------------- */
const ESCADA = [
  [1e33,'dec'],[1e30,'non'],[1e27,'oct'],[1e24,'sep'],[1e21,'sex'],
  [1e18,'qui'],[1e15,'qua'],[1e12,'tri'],[1e9,'bi'],[1e6,'mi'],[1e3,'mil']
];
function num(n){
  if(!isFinite(n)) return '∞';
  /* passou dos nomes que existem: vira potência, em vez de sair "undefined" */
  if(n >= 1e36){
    const e = Math.floor(Math.log10(n));
    return (n / Math.pow(10, e)).toFixed(2).replace('.', ',') + ' ×10^' + e;
  }
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

/* tempo em palavra — usado já na criação das melhorias abaixo */
function tempoBonito(seg){
  if(seg < 60) return Math.floor(seg) + 's';
  if(seg < 3600) return Math.floor(seg/60) + 'min';
  if(seg < 86400) return Math.floor(seg/3600) + 'h ' + Math.floor(seg/60)%60 + 'min';
  return Math.floor(seg/86400) + 'd ' + Math.floor(seg/3600)%24 + 'h';
}

/* =========================================================
   AS MELHORIAS ESPECIAIS

   São mais de mil — e nenhuma escrita à mão. Escrever mil
   seria mil cópias do mesmo texto; geradas por regra, cada
   uma nasce de um marco de verdade do jogo ("cê tem 250
   morcegos", "cê deu 50 mil cliques").

   O fator cai conforme sobe: as três primeiras de cada
   escada dobram, as seguintes dão +50%, e daí pra frente
   +25%. Dobrar quarenta vezes seguidas quebraria o jogo.
   ========================================================= */
const fatorDoDegrau = i => i < 3 ? 2 : i < 10 ? 1.5 : 1.25;

function romano(n){
  const t = [[1000,'M'],[900,'CM'],[500,'D'],[400,'CD'],[100,'C'],[90,'XC'],[50,'L'],
             [40,'XL'],[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I']];
  let r = '';
  for(const [v,l] of t) while(n >= v){ r += l; n -= v; }
  return r;
}

/* de quantos em quantos um bicho ganha melhoria nova */
function escadaDeBicho(){
  const ns = [10, 25, 50];
  for(let n = 100;  n <= 1000; n += 50)  ns.push(n);
  for(let n = 1100; n <= 2000; n += 100) ns.push(n);
  for(let n = 2200; n <= 5000; n += 200) ns.push(n);
  return ns;
}

function escadaDeCliques(){
  const ns = [];
  for(let e = 1; e <= 9; e++) for(const m of [1, 2.5, 5]) ns.push(m * Math.pow(10, e));
  return ns.map(Math.round);
}

const ESPECIAIS = [];

/* 1. uma escada por bicho — o grosso do conteúdo */
BICHOS.forEach(b => escadaDeBicho().forEach((n, i) => {
  const f = fatorDoDegrau(i);
  ESPECIAIS.push({
    id:`e_${b.id}_${n}`, tipo:'bicho', alvo:b.id, fator:f, ic:b.ic,
    nome:`${b.nome} turbinado ${romano(i+1)}`,
    desc:`Teus ${b.plural} rendem ${f === 2 ? 'o DOBRO' : '+' + Math.round((f-1)*100) + '%'}`,
    custo: Math.min(1e300, b.base * Math.pow(1.15, n) * 8),
    destrava: d => (d.bichos[b.id]||0) >= n,
    falta: `tenha ${n.toLocaleString('pt-BR')} ${b.plural}`
  });
}));

/* 2. uma escada por melhoria de clique */
MELHORIAS.forEach(m => [5,10,20,35,50,75,100,150,200,300,450,650].forEach((n, i) => {
  const f = fatorDoDegrau(i);
  ESPECIAIS.push({
    id:`e_m_${m.id}_${n}`, tipo:'melhoria', alvo:m.id, fator:f, ic:m.ic,
    nome:`${m.nome} afiado ${romano(i+1)}`,
    desc:`A ${m.nome} rende ${f === 2 ? 'o DOBRO' : '+' + Math.round((f-1)*100) + '%'} no clique`,
    custo: Math.min(1e300, m.base * Math.pow(1.7, n/3) * 4),
    destrava: d => (d.melhorias[m.id]||0) >= n,
    falta: `tenha ${n} níveis de ${m.nome}`
  });
}));

/* 3. escada do clique, por quantos cliques a pessoa já deu */
escadaDeCliques().forEach((n, i) => {
  const f = fatorDoDegrau(i);
  ESPECIAIS.push({
    id:`e_clique_${n}`, tipo:'clique', fator:f, ic:'👆',
    nome:`Dedo Amaldiçoado ${romano(i+1)}`,
    desc:`Teu clique vale ${f === 2 ? 'o DOBRO' : '+' + Math.round((f-1)*100) + '%'}`,
    custo: Math.min(1e300, n * 60),
    destrava: d => d.cliques >= n,
    falta: `dê ${n.toLocaleString('pt-BR')} cliques`
  });
});

/* 4. escada do "tudo", por doce juntado na vida inteira */
for(let e = 4, i = 0; e <= 90; e += 2, i++){
  const marco = Math.pow(10, e), f = fatorDoDegrau(i);
  ESPECIAIS.push({
    id:`e_tudo_${e}`, tipo:'tudo', fator:f, ic:'🌑',
    nome:`Noite Eterna ${romano(i+1)}`,
    desc:`TUDO no jogo rende ${f === 2 ? 'o DOBRO' : '+' + Math.round((f-1)*100) + '%'}`,
    custo: Math.min(1e300, marco * 3),
    destrava: d => d.total >= marco,
    falta: `junte ${num(marco)} doces na vida`
  });
}

/* 5. escada da sorte, por abóbora dourada pega */
for(let n = 5, i = 0; n <= 500; n += 5, i++){
  ESPECIAIS.push({
    id:`e_dourada_${n}`, tipo:'dourada', fator:.93, ic:'🌟',
    nome:`Chamado Dourado ${romano(i+1)}`,
    desc:'A abóbora dourada aparece um pouco mais vezes',
    custo: Math.min(1e300, 1e7 * Math.pow(3.2, i)),
    destrava: d => (d.douradas||0) >= n,
    falta: `pegue ${n} abóboras douradas`
  });
}

/* 5b. sinergias: um bicho passa a render mais por cada OUTRO que cê tem.
   É o que faz valer a pena espalhar o time em vez de empilhar tudo num só. */
BICHOS.forEach(a => BICHOS.forEach(b => {
  if(a.id === b.id) return;
  ESPECIAIS.push({
    id:`e_sin_${a.id}_${b.id}`, tipo:'sinergia', alvo:a.id, comQuem:b.id, fator:.02, ic:a.ic,
    nome:`${a.nome} & ${b.nome}`,
    desc:`Teus ${a.plural} rendem +2% pra cada ${b.nome.toLowerCase()} que cê tiver`,
    custo: Math.min(1e300, (a.base + b.base) * 900),
    destrava: d => (d.bichos[a.id]||0) >= 25 && (d.bichos[b.id]||0) >= 25,
    falta: `tenha 25 ${a.plural} e 25 ${b.plural}`
  });
}));

/* 5c. escada do tempo de jogo — prêmio por teimosia */
[60, 300, 900, 1800, 3600, 7200, 18000, 36000, 86400, 172800, 360000, 720000]
  .forEach((seg, i) => {
    const f = fatorDoDegrau(i);
    ESPECIAIS.push({
      id:`e_tempo_${seg}`, tipo:'tudo', fator:f, ic:'⏳',
      nome:`Paciência de Fantasma ${romano(i+1)}`,
      desc:`TUDO no jogo rende ${f === 2 ? 'o DOBRO' : '+' + Math.round((f-1)*100) + '%'}`,
      custo: Math.min(1e300, 2e4 * Math.pow(9, i)),
      destrava: d => (d.tempoJogado||0) >= seg,
      falta: `jogue ${tempoBonito(seg)} no total`
    });
  });

/* 6. escada do combo */
for(let n = 10, i = 0; n <= 50; n += 5, i++){
  const f = 1 + (i+1) * .1;
  ESPECIAIS.push({
    id:`e_combo_${n}`, tipo:'clique', fator:f, ic:'🌪️',
    nome:`Punho do Combo ${romano(i+1)}`,
    desc:`Teu clique vale +${Math.round((f-1)*100)}%`,
    custo: Math.min(1e300, 5e5 * Math.pow(8, i)),
    destrava: d => (d.maiorCombo||0) >= n,
    falta: `faça um combo de ${n}`
  });
}

/* 7. escada dos troféus */
for(let n = 3, i = 0; n <= 21; n += 3, i++){
  const f = fatorDoDegrau(i);
  ESPECIAIS.push({
    id:`e_trof_${n}`, tipo:'tudo', fator:f, ic:'🏆',
    nome:`Véu do Além ${romano(i+1)}`,
    desc:`TUDO no jogo rende ${f === 2 ? 'o DOBRO' : '+' + Math.round((f-1)*100) + '%'}`,
    custo: Math.min(1e300, 1e6 * Math.pow(40, i)),
    destrava: d => d.conquistas.length >= n,
    falta: `ganhe ${n} troféus`
  });
}

/* a cara da abóbora: puro colecionismo, e cada uma pede uma coisa
   diferente do jogo pra abrir */
const CARAS = [
  { e:'🎃', nome:'Abóbora',    q:'desde sempre',          tem:() => true },
  { e:'💀', nome:'Caveira',    q:'1.000 cliques',         tem:d => d.cliques >= 1000 },
  { e:'🐈‍⬛', nome:'Gato Preto', q:'10 gatos pretos',       tem:d => (d.bichos.gato||0) >= 10 },
  { e:'👻', nome:'Fantasma',   q:'10 fantasmas',          tem:d => (d.bichos.fantasma||0) >= 10 },
  { e:'🧟', nome:'Zumbi',      q:'10 zumbis',             tem:d => (d.bichos.zumbi||0) >= 10 },
  { e:'🐺', nome:'Lobisomem',  q:'a Garra de Lobisomem',  tem:d => (d.melhorias.garra||0) >= 1 },
  { e:'🧛', nome:'Vampiro',    q:'10 vampiros',           tem:d => (d.bichos.vampiro||0) >= 10 },
  { e:'🌕', nome:'Lua Cheia',  q:'a melhoria Lua Cheia',  tem:d => (d.melhorias.lua||0) >= 1 },
  { e:'🍬', nome:'Doce',       q:'1 milhão de doces',     tem:d => d.total >= 1e6 },
  { e:'🕯️', nome:'Vela',       q:'5 abóboras douradas',   tem:d => d.douradas >= 5 },
  { e:'☠️', nome:'Ceifador',   q:'10 ceifadores',         tem:d => (d.bichos.ceifador||0) >= 10 },
  { e:'👑', nome:'Coroa',      q:'todos os troféus',      tem:d => d.conquistas.length >= CONQUISTAS.length }
];

/* o céu muda com a hora DE VERDADE do relógio da pessoa —
   e à meia-noite a casa toda rende mais */
const FASES = [
  { id:'f-madrugada', de:2,  ate:5,  nome:'🌫️ Madrugada',   mult:1 },
  { id:'f-dia',       de:6,  ate:16, nome:'☀️ Dia',          mult:1 },
  { id:'f-tarde',     de:17, ate:19, nome:'🌇 Entardecer',   mult:1 },
  { id:'f-noite',     de:20, ate:22, nome:'🌙 Noite',        mult:1 },
  { id:'f-bruxas',    de:23, ate:1,  nome:'🕛 Hora das Bruxas · +50% em tudo', mult:1.5 }
];
function faseAgora(h = new Date().getHours()){
  return FASES.find(f => f.de <= f.ate ? (h >= f.de && h <= f.ate) : (h >= f.de || h <= f.ate));
}

/* ---------------------------------------------------------
   O ESTADO
   --------------------------------------------------------- */
const vazio = () => ({
  v:1, doces:0, total:0, cliques:0, douradas:0, maiorCombo:0, admUsado:false,
  melhorias:{}, bichos:{}, conquistas:[], especiais:[], som:true, avisos:false,
  cara:'🎃', comecou:Date.now(), tempoJogado:0, melhorPorSeg:0,
  destravado:false, avisouPorta:0, quando:Date.now()
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
          melhorias:o.melhorias||{}, bichos:o.bichos||{}, conquistas:o.conquistas||[],
          especiais:o.especiais||[]
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
  if(falta <= 0){
    avisar('\u{1F6AA} A porta abriu!', 'A casa assombrada est\u00e1 aberta \u2014 vem jogar Hellow Click \u{1F383}');
    return destravar(false);
  }
  /* dia e hora sozinhos ficam parados na tela: com minuto e segundo
     d\u00e1 pra ver que a contagem est\u00e1 mesmo andando */
  $('#ctDias').textContent  = Math.floor(falta / 86400000);
  $('#ctHoras').textContent = Math.floor(falta / 3600000) % 24;
  $('#ctMin').textContent   = Math.floor(falta / 60000) % 60;
  $('#ctSeg').textContent   = Math.floor(falta / 1000) % 60;
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

/* com mais de mil especiais, varrer a lista inteira dez vezes por
   segundo seria desperdício puro: a conta fica guardada e só se
   refaz quando alguém compra alguma coisa */
const MAPA_ESP = Object.fromEntries(ESPECIAIS.map(e => [e.id, e]));
const temEsp = new Set();
let bolo = null;
function limparBolo(){ bolo = null; temEsp.clear(); (dados.especiais||[]).forEach(i => temEsp.add(i)); }
const tenhoEsp = id => temEsp.has(id);

function multiplicadores(){
  if(bolo) return bolo;
  const m = { bicho:{}, melhoria:{}, clique:1, tudo:1, dourada:1 };
  for(const id of dados.especiais || []){
    const e = MAPA_ESP[id];
    if(!e) continue;                       /* especial de uma versão antiga: ignora */
    if(e.tipo === 'bicho')         m.bicho[e.alvo]    = (m.bicho[e.alvo]    || 1) * e.fator;
    /* sinergia depende de QUANTOS do outro bicho existem agora — por isso
       a conta guardada também se refaz quando alguém compra um ajudante */
    else if(e.tipo === 'sinergia') m.bicho[e.alvo]    = (m.bicho[e.alvo]    || 1)
                                     * (1 + e.fator * (dados.bichos[e.comQuem]||0));
    else if(e.tipo === 'melhoria') m.melhoria[e.alvo] = (m.melhoria[e.alvo] || 1) * e.fator;
    else if(m[e.tipo] !== undefined) m[e.tipo] *= e.fator;
  }
  return (bolo = m);
}

/* as especiais de "tudo" e a hora das bruxas multiplicam clique e produção juntos */
const multGeral  = () => multiplicadores().tudo * faseAgora().mult;
const multClique = () => multiplicadores().clique;
const multCombo = () => 1 + Math.min(combo, 50) * 0.02;

/* o clique "limpo", sem combo nem bônus — é o que os troféus medem */
function porCliqueCru(){
  const mm = multiplicadores().melhoria;
  const somado = MELHORIAS.reduce(
    (s,m) => s + m.poder * (dados.melhorias[m.id]||0) * (mm[m.id] || 1), 1);
  return somado * multTrofeus() * multClique() * multGeral();
}
function porClique(){
  return porCliqueCru() * multCombo() * (bonus && bonus.tipo === 'frenesi' ? 7 : 1);
}

function porSegundoCru(){
  const mb = multiplicadores().bicho;
  return BICHOS.reduce(
    (s,b) => s + b.porSeg * (dados.bichos[b.id]||0) * (mb[b.id] || 1), 0)
    * multTrofeus() * multGeral();
}

const porSegundo = () =>
  porSegundoCru() * (bonus && bonus.tipo === 'turbo' ? 5 : 1);

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
  limparBolo();
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
  /* nunca abaixo de 8 segundos: dourada sem intervalo deixa de ser sorte */
  const apressa = Math.max(.12, multiplicadores().dourada);
  proximaDourada = Date.now() + (40 + Math.random() * 70) * 1000 * apressa;
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
    const chuva = Math.max(30, dados.doces * .12 + porSegundoCru() * 90);
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
  const novos = [];
  for(const c of CONQUISTAS){
    if(dados.conquistas.includes(c.id)) continue;
    if(c.tem(dados)){
      dados.conquistas.push(c.id);
      recado(`🏆 Troféu: ${c.e} ${c.nome}`);
      bip(760, .1);
      novos.push(c);
    }
  }
  if(!novos.length) return;
  pintarConquistas();
  /* um aviso só, mesmo caindo vários de uma vez — três avisos
     seguidos viram incômodo, não notícia */
  avisar(novos.length === 1 ? `🏆 Troféu novo: ${novos[0].nome}` : `🏆 ${novos.length} troféus novos!`,
         novos.map(c => c.e + ' ' + c.nome).join(' · '));
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

/* ---------------------------------------------------------
   AS MELHORIAS ESPECIAIS
   --------------------------------------------------------- */
function comprarEspecial(id){
  const e = ESPECIAIS.find(x => x.id === id);
  if(!e || tenhoEsp(id)) return;
  if(!e.destrava(dados)) return recado('Essa ainda nem apareceu 👀');
  if(dados.doces < e.custo) return recado('Falta doce pra isso! 🍬');
  dados.doces -= e.custo;
  dados.especiais.push(id);
  limparBolo();
  bip(900, .1); setTimeout(() => bip(1200, .1), 90);
  recado(`⭐ ${e.ic} ${e.nome}!`);
  conferirConquistas(); pintarTudo(); pintarEspeciais(true); gravar();
}

/* Com mais de mil melhorias, jogar todas na tela seria um paredão que
   ninguém lê. Aparece só o que dá pra comprar AGORA, da mais barata pra
   mais cara — e embaixo, as três que estão mais perto de abrir. */
const QUANTAS_MOSTRA = 24;
let ultimoDesenhoEsp = 0;

function pintarEspeciais(forcar){
  const agora = Date.now();
  if(!forcar && agora - ultimoDesenhoEsp < 500) return;  /* 1.003 checagens dez vezes por segundo seria desperdício */
  ultimoDesenhoEsp = agora;

  const podeVer = [], quaseLa = [];
  for(const e of ESPECIAIS){
    if(tenhoEsp(e.id)) continue;
    (e.destrava(dados) ? podeVer : quaseLa).push(e);
  }
  podeVer.sort((a,b) => a.custo - b.custo);
  const mostrando = podeVer.slice(0, QUANTAS_MOSTRA);

  const cartao = e => {
    const pode = dados.doces >= e.custo;
    return `<button class="esp ${pode ? 'pode' : 'caro'}" onclick="comprarEspecial('${e.id}')">
      <span class="ic">${e.ic}</span>
      <span class="meio"><span class="nome">${e.nome}</span>
        <span class="desc">${e.desc}</span></span>
      <span class="dir"><span class="preco ${pode ? '' : 'caro'}">${num(e.custo)} 🍬</span></span>
    </button>`;
  };

  const cabeca = `<div class="resumo-trofeus" style="text-align:center">
      <b>${dados.especiais.length}</b> de ${ESPECIAIS.length} melhorias especiais
      <div class="barra-trof"><div style="width:${
        (dados.especiais.length / ESPECIAIS.length * 100).toFixed(2)}%"></div></div>
    </div>`;

  let corpo;
  if(mostrando.length){
    corpo = mostrando.map(cartao).join('') +
      (podeVer.length > QUANTAS_MOSTRA
        ? `<p class="vazio-esp">+ outras <b>${podeVer.length - QUANTAS_MOSTRA}</b> já abertas,
             esperando cê juntar mais doce 🍬</p>` : '');
  }else{
    corpo = `<p class="vazio-esp">Nenhuma aberta agora! 👀<br>
      Elas nascem dos teus marcos — compra 10 de um bicho e vê o que acontece.</p>`;
  }

  /* as três mais perto de abrir, pra sempre ter um alvo à vista */
  const perto = quaseLa.slice(0, 3)
    .map(e => `🔒 ${e.falta}`).join('<br>');

  $('#listaEspeciais').innerHTML = cabeca + corpo +
    (perto ? `<p class="vazio-esp" style="padding-top:18px"><b>Vindo por aí:</b><br>${perto}</p>` : '');
}

/* ---------------------------------------------------------
   A CARA DA ABÓBORA
   --------------------------------------------------------- */
const abrirCaras = () => { pintarCaras(); $('#caras').classList.add('on'); };
const fecharCaras = () => $('#caras').classList.remove('on');

function pintarCaras(){
  $('#listaCaras').innerHTML = CARAS.map(c => {
    const tem = c.tem(dados), usando = dados.cara === c.e;
    return `<button class="cara ${usando ? 'usando' : tem ? 'tem' : 'presa'}"
              onclick="${tem ? `usarCara('${c.e}')` : `recado('Pra abrir: ${c.q}')`}">
      <span class="e">${tem ? c.e : '🔒'}</span>
      <span class="n">${tem ? c.nome : '???'}</span>
      <span class="q">${usando ? 'usando agora' : c.q}</span>
    </button>`;
  }).join('');
}

function usarCara(e){
  dados.cara = e;
  $('#abobora').textContent = e;
  gravar(); pintarCaras();
  recado(e + ' Trocou a cara!');
}

/* ---------------------------------------------------------
   A FASE DA NOITE
   --------------------------------------------------------- */
let faseAgoraId = '';
function pintarFase(){
  const f = faseAgora();
  $('#fase').textContent = f.nome;
  $('#fase').classList.toggle('bruxas', f.mult > 1);
  if(f.id === faseAgoraId) return;
  const antes = faseAgoraId;
  faseAgoraId = f.id;
  $('#cena').className = 'cena ' + f.id;
  if(antes && f.mult > 1) recado('🕛 Chegou a Hora das Bruxas — tudo rende +50%!');
}

/* ---------------------------------------------------------
   A SALA DOS NÚMEROS
   --------------------------------------------------------- */

function pintarNumeros(){
  if(!$('#painel-numeros').classList.contains('on')) return;   /* aba fechada, não gasta tempo */
  const campeao = BICHOS
    .map(b => ({ b, rende: b.porSeg * (dados.bichos[b.id]||0) * (tenhoEsp('e_'+b.id) ? 2 : 1) }))
    .sort((x,y) => y.rende - x.rende)[0];
  const desde = Math.floor((Date.now() - (dados.comecou||Date.now())) / 86400000);

  const cx = (r, v, classe = '') => `<div class="nmr ${classe}"><div class="r">${r}</div>
    <div class="v">${v}</div></div>`;

  $('#listaNumeros').innerHTML =
    cx('Doces no total', num(dados.total) + ' 🍬', 'largo destaque') +
    cx('Doces agora', num(dados.doces)) +
    cx('Por segundo', num(porSegundo())) +
    cx('Por clique', num(porClique())) +
    cx('Melhor por segundo', num(dados.melhorPorSeg||0)) +
    cx('Cliques dados', dados.cliques.toLocaleString('pt-BR')) +
    cx('Maior combo', (dados.maiorCombo||0) + ' seguidos') +
    cx('Douradas pegas', (dados.douradas||0) + ' 🌟') +
    cx('Tempo de jogo', tempoBonito(dados.tempoJogado||0)) +
    cx('Ajudantes', totalBichos(dados) + ' bichos') +
    cx('Melhorias', MELHORIAS.reduce((s,m) => s + (dados.melhorias[m.id]||0), 0) + ' níveis') +
    cx('Troféus', `${dados.conquistas.length} de ${CONQUISTAS.length}`) +
    cx('Especiais', `${dados.especiais.length} de ${ESPECIAIS.length}`) +
    cx('Quem mais rende',
       campeao && campeao.rende > 0
         ? `${campeao.b.ic} ${campeao.b.nome} — ${num(campeao.rende)}/s`
         : 'ninguém ainda', 'largo') +
    cx('Jogando há', desde === 0 ? 'hoje mesmo' : desde + (desde === 1 ? ' dia' : ' dias'), 'largo');
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
  $('#contaEspeciais').textContent = dados.especiais.length + '/' + ESPECIAIS.length;

  const pct = Math.round(dados.conquistas.length / CONQUISTAS.length * 100);
  $('#trofNum').textContent = `${dados.conquistas.length} de ${CONQUISTAS.length}`;
  $('#trofBonus').textContent = `+${dados.conquistas.length*2}%`;
  $('#trofBarra').style.width = pct + '%';

  $('#rodapeInfo').innerHTML =
    `Já juntou <b>${num(dados.total)}</b> doces no total · <b>${dados.cliques}</b> cliques` +
    (dados.maiorCombo ? ` · maior combo <b>${dados.maiorCombo}</b>` : '');
}

const pintarTudo = () => {
  pintarPlacar(); pintarLoja(); pintarCenario(); pintarFase(); pintarNumeros();
};

function trocarAba(qual){
  document.querySelectorAll('.abas button').forEach(b =>
    b.classList.toggle('on', b.dataset.aba === qual));
  document.querySelectorAll('.painel').forEach(p =>
    p.classList.toggle('on', p.id === 'painel-' + qual));
  /* comprar de 10 em 10 não faz sentido na parede de troféus */
  $('#loteBarra').style.display = (qual === 'cliques' || qual === 'bichos') ? '' : 'none';
  if(qual === 'especiais') pintarEspeciais(true);
  if(qual === 'numeros') pintarNumeros();
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
  dados.tempoJogado = (dados.tempoJogado||0) + dt;
  const ps = porSegundo();
  if(ps > (dados.melhorPorSeg||0)) dados.melhorPorSeg = ps;

  if(combo && agora - ultimoClique > 1200){ combo = 0; pintarCombo(); }

  if(bonus && agora > bonus.ate){
    bonus = null;
    $('#faixaBonus').classList.remove('on');
  }
  if($('#painel-especiais').classList.contains('on')) pintarEspeciais();
  conferirPorta();
  talvezSoltarDourada();
  conferirConquistas();
  pintarTudo();
}

/* a porta pode abrir com o jogo j\u00e1 aberto \u2014 25 de outubro chega
   enquanto algu\u00e9m est\u00e1 jogando, e isso merece um aviso */
function conferirPorta(){
  const ano = new Date().getFullYear();
  if(!naSemanaDoHalloween() || dados.avisouPorta === ano) return;
  dados.avisouPorta = ano;
  gravar();
  avisar('\u{1F6AA} A porta abriu!', 'A casa assombrada est\u00e1 aberta \u2014 \u00e9 semana de Halloween \u{1F383}');
  faixa('\u{1F6AA} A porta abriu \u2014 \u00e9 semana de Halloween!');
  setTimeout(() => $('#faixaBonus').classList.remove('on'), 6000);
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
  const ganho = porSegundoCru() * limitado * .5;
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
  limparBolo();
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
   AVISOS DO NAVEGADOR

   Avisa quando cai um trof\u00e9u novo e quando a porta do
   Halloween abre.

   O limite honesto: sem servidor, o aviso s\u00f3 sai se a p\u00e1gina
   estiver aberta em algum lugar (mesmo em outra aba, mesmo
   com o celular no bolso). Com o jogo TOTALMENTE fechado
   n\u00e3o d\u00e1 \u2014 isso pediria um servidor mandando o aviso.
   --------------------------------------------------------- */
const temAviso = () => typeof Notification !== 'undefined';

function pintarBotaoAvisos(){
  const ligado = dados.avisos && temAviso() && Notification.permission === 'granted';
  const bt = $('#btAvisos');
  if(bt) bt.textContent = ligado ? '\u{1F514} Avisos ligados' : '\u{1F515} Avisos';
  const bp = $('#btAvisarPorta');
  if(bp){
    bp.classList.toggle('ligado', ligado);
    bp.textContent = ligado
      ? '\u2705 Vou te avisar quando abrir'
      : '\u{1F514} Me avisa quando a porta abrir';
  }
}

async function ligarAvisos(soLigar){
  if(!temAviso()) return recado('Este navegador n\u00e3o faz aviso \u{1F615}');

  /* j\u00e1 estava ligado e a pessoa apertou de novo: desliga */
  if(dados.avisos && Notification.permission === 'granted' && !soLigar){
    dados.avisos = false; gravar(); pintarBotaoAvisos();
    return recado('\u{1F515} Avisos desligados');
  }

  let ok = Notification.permission;
  if(ok === 'default') ok = await Notification.requestPermission();

  if(ok !== 'granted'){
    return recado(ok === 'denied'
      ? 'O navegador bloqueou os avisos \u2014 d\u00e1 pra liberar nas configura\u00e7\u00f5es dele'
      : 'Sem aviso por enquanto');
  }
  dados.avisos = true; gravar(); pintarBotaoAvisos();
  avisar('\u{1F514} Prontinho!', 'Vou te avisar de trof\u00e9u novo e de quando a porta abrir \u{1F383}');
  recado('\u{1F514} Avisos ligados');
}

function avisar(titulo, corpo){
  if(!dados.avisos || !temAviso() || Notification.permission !== 'granted') return;
  try{ new Notification(titulo, { body:corpo, icon:'icone.svg', badge:'icone.svg' }); }
  catch(e){ /* alguns navegadores s\u00f3 deixam pelo service worker: melhor calar que quebrar */ }
}

/* ---------------------------------------------------------
   MODO ADMINISTRADOR

   Abre no 🔒, com Ctrl+Shift+A, ou digitando ADMIN.
   Mesma ideia da Fábrica de Emojis — e, como lá, a senha
   mora no código: serve pra esconder o botão da visita,
   não pra trancar nada de verdade.
   --------------------------------------------------------- */
function abrirAdm(){
  $('#adm').classList.add('on');
  const jaEntrou = dados.admUsado;
  $('#admTranca').style.display = jaEntrou ? 'none' : '';
  $('#admPainel').style.display = jaEntrou ? '' : 'none';
  $('#admErro').textContent = '';
  $('#admSenha').value = '';
  if(!jaEntrou) setTimeout(() => $('#admSenha').focus(), 120);
}
const fecharAdm = () => $('#adm').classList.remove('on');

function tentarAdm(){
  if($('#admSenha').value !== SENHA_ADM){
    $('#admErro').textContent = 'Senha errada 🔒';
    $('#admSenha').value = '';
    return;
  }
  dados.admUsado = true;          /* fica lembrado: não pede senha toda vez */
  gravar();
  $('#admTranca').style.display = 'none';
  $('#admPainel').style.display = '';
  conferirConquistas();
  recado('⚙️ Modo administrador ligado');
}

function admDoces(q){
  dados.doces = Math.max(0, dados.doces + q);
  if(q > 0) dados.total += q;
  depoisDoAdm(q > 0 ? `+${num(q)} doces` : 'doces zerados');
}
function admBichos(q){
  BICHOS.forEach(b => dados.bichos[b.id] = (dados.bichos[b.id]||0) + q);
  limparBolo();
  depoisDoAdm(`+${q} de cada ajudante`);
}
function admMelhorias(q){
  MELHORIAS.forEach(m => dados.melhorias[m.id] = (dados.melhorias[m.id]||0) + q);
  limparBolo();
  depoisDoAdm(`+${q} nível em cada melhoria`);
}
function admDourada(){
  proximaDourada = 0;
  talvezSoltarDourada();
  fecharAdm();
  recado('🎃 Soltei uma dourada — acha ela!');
}
function admBonus(tipo){
  bonus = { tipo, ate: Date.now() + 30000 };
  faixa(tipo === 'frenesi' ? '🔥 FRENESI do adm — 30 segundos!' : '⚡ TURBO do adm — 30 segundos!');
  fecharAdm();
  pintarTudo();
}
function admEspeciais(dar){
  dados.especiais = dar ? ESPECIAIS.map(e => e.id) : [];
  limparBolo();
  pintarEspeciais(true);
  depoisDoAdm(dar ? 'todas as especiais destravadas' : 'especiais tiradas');
}
function admTrofeus(dar){
  dados.conquistas = dar ? CONQUISTAS.map(c => c.id) : [];
  depoisDoAdm(dar ? 'todos os troféus destravados' : 'troféus tirados');
  pintarConquistas();
}
function admPorta(trancar){
  dados.destravado = !trancar;
  gravar();
  if(trancar && !naSemanaDoHalloween()){
    fecharAdm();
    $('#trava').classList.add('on');
    pintarContagem();
    recado('🚪 Tranquei de novo');
  }else{
    depoisDoAdm('porta destrancada pra sempre');
  }
}
function depoisDoAdm(txt){
  conferirConquistas();
  pintarTudo();
  gravar();
  recado('⚙️ ' + txt);
}

/* ---------------------------------------------------------
   BAIXAR O JOGO

   Junta o index.html com o jogo.js num arquivo só, pra dar
   pra guardar no aparelho e abrir sem internet nenhuma —
   ou mandar pros amigos pelo zap.
   --------------------------------------------------------- */
async function baixarJogo(){
  const bt = $('#btBaixar');
  const antes = bt.textContent;
  bt.textContent = '⏳ juntando...';
  try{
    /* o endereço sai da própria página: assim a versão nunca
       desencontra quando o jogo.js sobe de número */
    const meuSrc = document.querySelector('script[src*="jogo.js"]').getAttribute('src');
    const [html, js] = await Promise.all([
      fetch('index.html').then(r => r.text()),
      fetch(meuSrc).then(r => r.text())
    ]);
    const saida = html
      .replace(/<script src="jogo\.js[^"]*"><\/script>/,
               '<script>\n/* Hellow Click — tudo num arquivo só */\n' + js + '\n<\/script>')
      /* manifest e service worker não funcionam em arquivo solto */
      .replace(/<link rel="manifest"[^>]*>\s*/g, '')
      .replace(/<link rel="(preconnect|apple-touch-icon)"[^>]*>\s*/g, '');

    const url = URL.createObjectURL(new Blob([saida], { type:'text/html' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'hellow-click.html';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 3000);
    recado('📥 Baixado! É só abrir o arquivo pra jogar');
  }catch(e){
    recado('😕 Não deu pra baixar agora — tenta com internet');
  }
  bt.textContent = antes;
}

/* ---------------------------------------------------------
   INSTALAR NA TELA DE INÍCIO

   O botão só aparece quando o navegador de fato oferece —
   mostrar um botão que não faz nada seria pior que não ter.
   --------------------------------------------------------- */
let convite = null;
window.addEventListener('beforeinstallprompt', ev => {
  ev.preventDefault();
  convite = ev;
  $('#btInstalar').style.display = '';
});
async function instalar(){
  if(!convite) return recado('Pelo menu do navegador: "Adicionar à tela de início"');
  convite.prompt();
  const r = await convite.userChoice;
  convite = null;
  $('#btInstalar').style.display = 'none';
  if(r.outcome === 'accepted') recado('📲 Instalado! Agora abre igual aplicativo');
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

limparBolo();
montarLoja();
pintarConquistas();
pintarEspeciais(true);
$('#abobora').textContent = dados.cara || '🎃';
pintarTudo();
enfeitarCena();
$('#btnSom').textContent = dados.som ? '🔊 Som' : '🔇 Mudo';
pintarBotaoAvisos();

$('#abobora').addEventListener('pointerdown', clicar);
$('#dourada').addEventListener('pointerdown', pegarDourada);
$('#travaSenha').addEventListener('keydown', ev => { if(ev.key === 'Enter') tentarSenha(); });

document.addEventListener('visibilitychange', () => { if(document.hidden) gravar(); });
window.addEventListener('pagehide', gravar);

$('#admSenha').addEventListener('keydown', ev => { if(ev.key === 'Enter') tentarAdm(); });
$('#adm').addEventListener('click', ev => { if(ev.target === $('#adm')) fecharAdm(); });

/* barra de espaço clica; Ctrl+Shift+A e digitar ADMIN abrem o adm */
let digitado = '';
document.addEventListener('keydown', ev => {
  if(ev.ctrlKey && ev.shiftKey && ev.key.toUpperCase() === 'A'){
    ev.preventDefault(); abrirAdm(); return;
  }
  if(ev.target.tagName === 'INPUT') return;

  digitado = (digitado + ev.key.toUpperCase()).slice(-5);
  if(digitado === 'ADMIN'){ digitado = ''; abrirAdm(); return; }

  if(ev.code === 'Space' && rodando){ ev.preventDefault(); clicar(); }
});

if(naSemanaDoHalloween() || dados.destravado){
  comecarJogo();
}else{
  $('#trava').classList.add('on');
  pintarContagem();
  setInterval(pintarContagem, 1000);
}

/* arquivo baixado abre em file:// , onde service worker nem existe */
if('serviceWorker' in navigator && location.protocol.startsWith('http')){
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}
