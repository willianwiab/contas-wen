/* =========================================================
   nada.js — O Jogo do Nada 🫥

   A única regra: não encoste em nada. O cronômetro conta
   há quanto tempo cê está parado, e o jogo passa o tempo
   inteiro tentando te fazer tocar a tela.

   Um jogo sobre nada só funciona se fazer nada for DIFÍCIL.
   Por isso as tentações: sem elas, ficar parado seria só
   olhar um número subir.
   ========================================================= */

const CHAVE = 'o-jogo-do-nada:v1';
const $ = s => document.querySelector(s);

/* ---------------------------------------------------------
   AS TENTAÇÕES

   Cada uma entra num segundo certo e sai sozinha. Todas são
   armadilha: encostar em qualquer uma é encostar na tela.
   Elas vêm em ordem de descaramento — começa com um botão
   pedindo pra não ser apertado e termina com o jogo mentindo
   que acabou.
   --------------------------------------------------------- */
const TENTACOES = [
  { aos:6, id:'botao', dura:7000, html:
    `<button class="botao-vermelho t-baixo">NÃO APERTE ESTE BOTÃO</button>` },

  /* a melhor de todas, e foi ideia do JoJo: um botão que promete
     fazer algo, e o algo é apertar o botão */
  { aos:12, id:'algo', dura:8000, html:
    `<button class="botao-roxo t-alto">BOTÃO PARA FAZER ALGO
      <small>(o algo é apertar este botão)</small></button>` },

  { aos:16, id:'bicho', dura:6000, html:
    `<span class="bichinho" style="top:30%">🐛</span>` },

  { aos:26, id:'premio', dura:7000, html:
    `<div class="premio t-alto">🎁 CÊ GANHOU UM PRÊMIO!<br>Toque aqui pra receber
      <small>(cê não ganhou nada)</small></div>` },

  { aos:33, id:'naonada', dura:7000, html:
    `<button class="botao-calmo t-baixo">Toque aqui para NÃO fazer nada
      <small>(tocar é fazer algo)</small></button>` },

  { aos:40, id:'aviso', dura:7000, html:
    `<div class="aviso-falso"><span class="ico">💬</span><span class="txt">
      <b>Alguém te mandou mensagem</b>
      <span>"oi, cê tá aí?" — toque pra ver</span></span></div>` },

  { aos:47, id:'mosca', dura:8000, html:
    `<span class="mosca">🪰</span>` },

  { aos:55, id:'erro', dura:8000, html:
    `<div class="erro-falso t-baixo"><h3>⚠️ Erro inesperado</h3>
      <p>Alguma coisa deu errado no jogo. Toque em OK pra continuar.</p>
      <span class="ok">OK</span></div>` },

  { aos:64, id:'crono2', dura:8000, html:
    `<div class="crono-falso t-alto"><small>fazendo nada há</small>
      <b id="cronoFalso">0,0</b><small>…?</small></div>` },

  { aos:73, id:'bicho2', dura:6000, html:
    `<span class="bichinho" style="top:64%;animation-duration:4s">🦋</span>` },

  { aos:81, id:'bateria', dura:7000, html:
    `<div class="aviso-falso"><span class="ico">🔋</span><span class="txt">
      <b>Bateria fraca — 3%</b>
      <span>Toque pra ativar a economia de energia</span></span></div>` },

  { aos:90, id:'contagem', dura:9000, html:
    `<div class="contagem t-baixo" id="contaFalsa">⏳ Prêmio secreto em 5…</div>` },

  { aos:101, id:'milionesimo', dura:8000, html:
    `<div class="premio t-alto" style="background:linear-gradient(135deg,#7dd3fc,#3b82f6);color:#04172e">
      🎉 CÊ É O JOGADOR Nº 1.000.000!<br>Toque pra resgatar
      <small>(não é, e não tem prêmio)</small></div>` },

  { aos:112, id:'escuro', dura:9000, html:
    `<div class="cortina"><div class="luz">
      Está tudo escuro.<br>Toque na tela pra acender a luz.</div></div>` },

  { aos:125, id:'rachou', dura:8000, html:
    `<div class="rachadura">🕸️<span>a tela rachou<br><b>toque pra consertar</b></span></div>` },

  { aos:136, id:'carregando', dura:9000, html:
    `<div class="carregando t-baixo"><span>carregando teu prêmio… <b id="pct">99%</b></span>
      <div class="barrinha"><div id="barraFalsa" style="width:99%"></div></div></div>` },

  { aos:148, id:'fimfalso', dura:9000, html:
    `<div class="premio t-alto" style="background:linear-gradient(135deg,#5ee89a,#2fb673)">
      ✅ FIM DE JOGO — CÊ VENCEU!<br>Toque pra ver teu troféu
      <small>(o jogo não acabou)</small></div>` },

  { aos:162, id:'certeza', dura:8000, html:
    `<div class="erro-falso t-baixo"><h3 style="color:var(--frio)">🤔 Uma pergunta</h3>
      <p>Cê tem certeza de que está fazendo nada agora?</p>
      <span class="ok" style="background:var(--frio);color:#04172e">SIM, TENHO CERTEZA</span></div>` },

  { aos:175, id:'fechando', dura:9000, html:
    `<div class="contagem t-baixo" id="contaFecha" style="color:var(--errado)">
      ⚠️ O jogo fecha sozinho em 5…</div>` },

  { aos:190, id:'nada', dura:8000, html:
    `<div class="lead t-baixo" style="color:var(--texto3)">
      …o jogo desistiu de te tentar.<br>Por enquanto.</div>` },

  { aos:210, id:'coceira', dura:8000, html:
    `<div class="lead t-baixo" style="color:var(--texto2)">
      Tem alguma coisa no teu dedo.<br>
      <span style="color:var(--texto3);font-size:.82rem">(não tem)</span></div>` },

  { aos:235, id:'pontinho', dura:10000, html:
    `<span class="pontinho"></span>` },

  { aos:265, id:'ultima', dura:10000, html:
    `<div class="lead t-alto" style="color:var(--texto3)">
      Tá bom, cê ganhou.<br>
      <span style="font-size:.82rem">Ou não — isto também é uma tentação.</span></div>` }
];

/* ---------------------------------------------------------
   O ESTADO
   --------------------------------------------------------- */
const vazio = () => ({ recorde:0, tentativas:0, quedas:{} });

let dados = carregar();
let estado = 'parado';          /* parado · jogando · perdeu */
let comecouEm = 0;
let paradoDesde = 0;            /* quando a aba sumiu, pra descontar */
let decorridoAntes = 0;
let tentacaoNaTela = null;
let jaMostradas = new Set();
let relogio = null;
let contaFalsa = null;

function carregar(){
  try{
    const cru = localStorage.getItem(CHAVE);
    if(cru){
      const o = JSON.parse(cru);
      if(o && typeof o.recorde === 'number')
        /* o 'medalhas' dos saves antigos não entra: as 1.000 metas
           saem do recorde e não precisam ser guardadas uma a uma */
        return Object.assign(vazio(), o, { quedas:o.quedas||{}, medalhas:undefined });
    }
  }catch(e){ /* save torto: começa limpo em vez de travar */ }
  return vazio();
}

function gravar(){
  try{ localStorage.setItem(CHAVE, JSON.stringify(dados)); }catch(e){}
}

/* ---------------------------------------------------------
   O TEMPO
   --------------------------------------------------------- */
const agoraSeg = () => decorridoAntes + (comecouEm ? (Date.now() - comecouEm) / 1000 : 0);

function tempoBonito(s){
  if(s < 60) return s.toFixed(1).replace('.', ',');
  const m = Math.floor(s / 60), r = Math.floor(s % 60);
  if(m < 60) return `${m}:${String(r).padStart(2,'0')}`;
  return `${Math.floor(m/60)}:${String(m%60).padStart(2,'0')}:${String(r).padStart(2,'0')}`;
}

/* ---------------------------------------------------------
   COMEÇAR, PERDER
   --------------------------------------------------------- */
let antesDaPartida = 0;

function comecar(){
  antesDaPartida = dados.recorde;
  estado = 'jogando';
  comecouEm = Date.now();
  decorridoAntes = 0;
  jaMostradas.clear();
  limparTentacao();
  document.body.className = '';
  mostrar('jogo');
  pintarCrono();
  clearInterval(relogio);
  relogio = setInterval(passo, 100);
}

function passo(){
  if(estado !== 'jogando') return;
  const s = agoraSeg();
  pintarCrono(s);
  corDoFundo(s);
  talvezTentar(s);
}

function pintarCrono(s = agoraSeg()){
  const el = $('#crono');
  el.textContent = tempoBonito(s);
  el.classList.toggle('rec', dados.recorde > 0 && s > dados.recorde);
  $('#recJogo').innerHTML = dados.recorde
    ? (s > dados.recorde ? '🏆 <b>passou do teu recorde!</b>'
                         : `teu recorde: <b>${tempoBonito(dados.recorde)}</b>`)
    : 'cê ainda não tem recorde';
}

/* o fundo vai clareando: é o único prêmio por aguentar,
   e ele não pede nenhum toque */
function corDoFundo(s){
  const n = s >= 300 ? 5 : s >= 120 ? 4 : s >= 60 ? 3 : s >= 30 ? 2 : s >= 10 ? 1 : 0;
  document.body.className = n ? 'n' + n : '';
}

function perder(oQue){
  if(estado !== 'jogando') return;
  const s = agoraSeg();
  estado = 'perdeu';
  clearInterval(relogio);
  clearInterval(contaFalsa);
  comecouEm = 0;

  dados.tentativas++;
  const culpa = oQue || 'nada';
  dados.quedas[culpa] = (dados.quedas[culpa] || 0) + 1;

  const recordeNovo = s > dados.recorde;
  if(recordeNovo) dados.recorde = s;
  gravar();

  $('#tempoFeito').textContent = tempoBonito(s);
  $('#novoRec').style.display = recordeNovo && s >= 1 ? '' : 'none';
  $('#notaPerdeu').textContent = recadoDaQueda(culpa, s);

  /* quantas metas esta partida derrubou — o prêmio de consolação */
  const ganhas = metasFeitas(s) - metasFeitas(antesDaPartida);
  const prox = proximaMeta(dados.recorde);
  $('#metasGanhas').innerHTML =
    (ganhas > 0 ? `🏆 <b>${ganhas} meta${ganhas > 1 ? 's' : ''} nova${ganhas > 1 ? 's' : ''}!</b><br>` : '')
    + (prox ? `próxima: <b>#${prox.n} ${prox.nome}</b> — ${tempoLongo(prox.seg)}` : '');
  limparTentacao();
  document.body.className = '';
  mostrar('perdeu');
  pintarRodape();

  /* o mesmo toque que derrubou não pode recomeçar sem querer */
  const bt = $('#btDeNovo');
  bt.disabled = true;
  bt.style.opacity = .35;
  setTimeout(() => { bt.disabled = false; bt.style.opacity = 1; }, 700);
}

function recadoDaQueda(culpa, s){
  if(s < 1) return 'Cê nem tentou. 🫥';
  const porQuem = {
    botao:     'O botão vermelho te pegou. Ele avisou pra não apertar.',
    premio:    'Cê foi atrás do prêmio. Não tinha prêmio.',
    aviso:     'Não era mensagem de ninguém.',
    erro:      'Não tinha erro nenhum. O erro era acreditar.',
    contagem:  'A contagem não ia terminar em nada.',
    escuro:    'A luz nunca apagou de verdade.',
    fimfalso:  'O jogo não tinha acabado. Cê acreditou.',
    bicho:     'Era só um bichinho passando.',
    bicho2:    'Era só uma borboleta.',
    nada:      'Não tinha nada na tela. Cê encostou mesmo assim.',
    algo:      'O algo era apertar o botão. Cê apertou. Pronto, fez algo.',
    naonada:   'Tocar pra não fazer nada é fazer algo. Clássico.',
    mosca:     'Não tinha mosca nenhuma.',
    crono2:    'Aquele cronômetro não era o teu. O teu estava indo bem.',
    bateria:   'A bateria está ótima. Era mentira.',
    milionesimo:'Cê não é o jogador número um milhão. Ninguém é.',
    rachou:    'A tela não rachou. Era um desenho.',
    carregando:'Não ia chegar em 100%. Nunca ia.',
    certeza:   'Cê tinha certeza. Aí tocou. Aí não tinha mais.',
    fechando:  'O jogo não fecha sozinho. Nunca ia fechar.',
    coceira:   'Não tinha nada no teu dedo.',
    pontinho:  'Era um pontinho. Só isso. Um pontinho.',
    ultima:    'Cê caiu na última. O aviso estava escrito ali.'
  }[culpa];
  return porQuem || 'Cê encostou na tela sem nada te pedir isso.';
}

/* ---------------------------------------------------------
   AS TENTAÇÕES NA TELA
   --------------------------------------------------------- */
function talvezTentar(s){
  for(const t of TENTACOES){
    if(s >= t.aos && !jaMostradas.has(t.id)){
      jaMostradas.add(t.id);
      porTentacao(t);
    }
  }
}

function porTentacao(t){
  limparTentacao();
  tentacaoNaTela = t.id;
  $('#tentacao').innerHTML = t.html;

  /* a contagem regressiva só existe pra parecer que vai dar em algo */
  /* as três que andam sozinhas: a contagem do prêmio, o cronômetro
     falso e a ameaça de fechar. Todas terminam em nada — é o ponto. */
  clearInterval(contaFalsa);
  if(t.id === 'contagem'){
    let n = 5;
    contaFalsa = setInterval(() => {
      const el = $('#contaFalsa');
      if(!el) return clearInterval(contaFalsa);
      el.textContent = --n > 0 ? `⏳ Prêmio secreto em ${n}…` : '⏳ …era mentira.';
      if(n <= 0) clearInterval(contaFalsa);
    }, 1000);
  }
  if(t.id === 'fechando'){
    let n = 5;
    contaFalsa = setInterval(() => {
      const el = $('#contaFecha');
      if(!el) return clearInterval(contaFalsa);
      el.textContent = --n > 0 ? `⚠️ O jogo fecha sozinho em ${n}…`
                               : '⚠️ …mentira, ele não fecha.';
      if(n <= 0) clearInterval(contaFalsa);
    }, 1000);
  }
  if(t.id === 'crono2'){
    /* um segundo cronômetro que zera sozinho, pra dar aquela dúvida
       de "será que o meu zerou?" */
    let f = 0;
    contaFalsa = setInterval(() => {
      const el = $('#cronoFalso');
      if(!el) return clearInterval(contaFalsa);
      f = f > 2.4 ? 0 : f + 0.1;
      el.textContent = f.toFixed(1).replace('.', ',');
    }, 100);
  }
  if(t.id === 'carregando'){
    let pct = 99;
    contaFalsa = setInterval(() => {
      const el = $('#pct'), barra = $('#barraFalsa');
      if(!el) return clearInterval(contaFalsa);
      pct = pct >= 99 ? 99 : pct;              /* nunca passa de 99 */
      el.textContent = pct + '%';
      if(barra) barra.style.width = pct + '%';
    }, 400);
  }
  setTimeout(() => { if(tentacaoNaTela === t.id) limparTentacao(); }, t.dura);
}

function limparTentacao(){
  $('#tentacao').innerHTML = '';
  tentacaoNaTela = null;
  clearInterval(contaFalsa);
}

/* ---------------------------------------------------------
   AS 1.000 METAS

   Elas não precisam ser guardadas uma a uma: as metas sobem
   em ordem de tempo, então "quais já foram" é só uma conta
   em cima do recorde, que já está salvo. Menos coisa pra
   guardar e impossível ficar fora de sincronia.
   --------------------------------------------------------- */
let faixaAberta = 'todas';

const abrirMetas = () => { $('#metas').classList.add('on'); pintarMetas(); };
const fecharMetas = () => $('#metas').classList.remove('on');

function pintarMetas(){
  const feitas = metasFeitas(dados.recorde);
  const prox = proximaMeta(dados.recorde);

  $('#metasConta').textContent = feitas;
  $('#metasBarra').style.width = (feitas / METAS.length * 100) + '%';
  $('#metasProx').innerHTML = prox
    ? `Próxima: <b>#${prox.n} ${prox.ic} ${prox.nome}</b> — aguenta
       <b>${tempoLongo(prox.seg)}</b>`
    : '🪐 Cê pegou todas as mil. Isso não devia ser possível.';

  $('#metasFiltros').innerHTML =
    `<button class="${faixaAberta === 'todas' ? 'on' : ''}" onclick="filtrarMetas('todas')">
       Todas</button>` +
    FAIXAS.map(f => `<button class="${faixaAberta === f.id ? 'on' : ''}"
       onclick="filtrarMetas('${f.id}')">${f.ic} ${f.nome}</button>`).join('');

  $('#metasLista').innerHTML = faixaAberta === 'todas' ? listaDeFaixas() : listaDaFaixa(faixaAberta);
  $('#metasLista').scrollTop = 0;
}

function filtrarMetas(qual){ faixaAberta = qual; pintarMetas(); }

/* na visão geral, dez cartões em vez de mil linhas: mil linhas de uma
   vez não são uma lista, são um paredão */
function listaDeFaixas(){
  return `<div class="faixa-cab">as dez fases</div>` + FAIXAS.map(f => {
    const feitas = METAS.filter(m => m.faixa === f.id && dados.recorde >= m.seg).length;
    return `<button class="faixa-cartao" onclick="filtrarMetas('${f.id}')">
      <span class="ic">${f.ic}</span>
      <span class="meio">
        <span class="nome">${f.nome} <span style="color:var(--texto3);font-weight:700">
          · #${f.primeira}–#${f.ultima}</span></span>
        <span class="fase">${f.fase}</span>
      </span>
      <span class="cnt" style="color:${feitas ? f.cor : 'var(--texto3)'}">${feitas}/${f.n}</span>
    </button>`;
  }).join('');
}

function listaDaFaixa(id){
  const f = FAIXAS.find(x => x.id === id);
  const minhas = METAS.filter(m => m.faixa === id);
  const feitas = minhas.filter(m => dados.recorde >= m.seg).length;

  /* dizer na cara o que é alcançável e o que é monumento: esconder
     isso seria fingir que alguém vai ficar cem anos sem tocar na tela */
  const aviso = f.de >= DIA
    ? `<div class="nota-faixa">🗿 <b>Aqui ninguém chega.</b> O cronômetro para quando cê
        sai da tela, então ${f.de >= ANO ? 'anos' : 'dias'} parado olhando seria preciso de
        verdade. Estas metas existem pra lista nunca acabar — não pra serem pegas.</div>`
    : '';

  return `<div class="faixa-cab">${f.ic} ${f.nome} · ${f.fase} · ${feitas}/${f.n}</div>`
    + aviso
    + minhas.map(m => {
        const tem = dados.recorde >= m.seg;
        return `<div class="meta ${tem ? 'feita' : 'falta'}">
          <span class="num">#${m.n}</span>
          <span class="e">${tem ? m.ic : '🔒'}</span>
          <span class="nm">${m.nome}</span>
          <span class="tp">${tempoLongo(m.seg)}</span>
        </div>`;
      }).join('');
}

/* ---------------------------------------------------------
   O RODAPÉ — os números honestos
   --------------------------------------------------------- */
function pintarRodape(){
  const el = $('#rodape');
  if(estado === 'jogando'){ el.innerHTML = ''; return; }

  const quedas = Object.entries(dados.quedas).sort((a,b) => b[1] - a[1]);
  const vilao = quedas[0];
  const nomes = { botao:'o botão vermelho', premio:'o prêmio falso', aviso:'a mensagem falsa',
    erro:'o erro falso', contagem:'a contagem', escuro:'o escuro', fimfalso:'o fim falso',
    bicho:'o bichinho', bicho2:'a borboleta', nada:'a tela vazia',
    algo:'o botão do algo', naonada:'o "não fazer nada"', mosca:'a mosca',
    crono2:'o cronômetro falso', bateria:'a bateria fraca', milionesimo:'o milionésimo jogador',
    rachou:'a tela rachada', carregando:'os 99%', certeza:'a pergunta', fechando:'o "fecha em 5"',
    coceira:'a coceira', pontinho:'o pontinho', ultima:'a última tentação' };

  el.innerHTML = dados.tentativas
    ? `<b>${dados.tentativas}</b> tentativa${dados.tentativas === 1 ? '' : 's'}`
      + (vilao && nomes[vilao[0]]
          ? ` · o que mais te derruba: <b>${nomes[vilao[0]]}</b> (${vilao[1]}x)`
          : '')
    : '';
}

/* ---------------------------------------------------------
   TROCAR DE TELA
   --------------------------------------------------------- */
function mostrar(qual){
  document.querySelectorAll('.tela').forEach(t =>
    t.classList.toggle('on', t.id === 'tela-' + qual));
  if(qual === 'inicio'){
    $('#recInicio').innerHTML = dados.recorde
      ? `teu recorde: <b>${tempoBonito(dados.recorde)}</b>`
      : 'cê ainda não tem recorde';
    const feitas = metasFeitas(dados.recorde);
    $('#progInicio').innerHTML = `<b style="color:var(--texto2)">${feitas}</b> de 1.000 metas`;
  }
  pintarRodape();
}

/* ---------------------------------------------------------
   O QUE CONTA COMO "FAZER ALGUMA COISA"

   Qualquer toque, tecla ou rolagem enquanto o jogo corre.
   Os botões de começar e recomeçar ficam fora porque eles
   são de outra tela — quando o jogo corre, não existe botão
   nenhum que possa ser apertado de propósito.
   --------------------------------------------------------- */
['pointerdown','keydown','wheel','touchstart','contextmenu'].forEach(ev =>
  document.addEventListener(ev, e => {
    if(estado !== 'jogando') return;
    e.preventDefault();
    perder(tentacaoNaTela);
  }, { passive:false, capture:true }));

$('#btComecar').addEventListener('click', comecar);
$('#btDeNovo').addEventListener('click', comecar);
$('#btVoltar').addEventListener('click', () => mostrar('inicio'));

/* sair da aba PARA o cronômetro: fazer nada é estar aqui parado,
   não minimizar o jogo e ir viver a vida */
document.addEventListener('visibilitychange', () => {
  if(estado !== 'jogando') return;
  if(document.hidden){
    decorridoAntes = agoraSeg();
    comecouEm = 0;
    paradoDesde = Date.now();
    $('#pausa').classList.add('on');
  }else{
    comecouEm = Date.now();
    $('#pausa').classList.remove('on');
  }
});

mostrar('inicio');

if('serviceWorker' in navigator && location.protocol.startsWith('http')){
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}
