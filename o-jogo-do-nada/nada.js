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
   AS MEDALHAS — os degraus de quem aguenta
   --------------------------------------------------------- */
const MEDALHAS = [
  { seg:5,    e:'🫥', nome:'5 seg' },
  { seg:15,   e:'😐', nome:'15 seg' },
  { seg:30,   e:'🧘', nome:'30 seg' },
  { seg:60,   e:'🗿', nome:'1 min' },
  { seg:120,  e:'🌑', nome:'2 min' },
  { seg:300,  e:'🕰️', nome:'5 min' },
  { seg:600,  e:'🏔️', nome:'10 min' },
  { seg:1800, e:'🪐', nome:'30 min' },
  { seg:3600, e:'♾️', nome:'1 hora' }
];

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

  { aos:16, id:'bicho', dura:6000, html:
    `<span class="bichinho" style="top:28%">🐛</span>` },

  { aos:26, id:'premio', dura:7000, html:
    `<div class="premio t-alto">🎁 CÊ GANHOU UM PRÊMIO!<br>Toque aqui pra receber
      <small>(cê não ganhou nada)</small></div>` },

  { aos:38, id:'aviso', dura:7000, html:
    `<div class="aviso-falso"><span class="ico">💬</span><span class="txt">
      <b>Alguém te mandou mensagem</b>
      <span>"oi, cê tá aí?" — toque pra ver</span></span></div>` },

  { aos:52, id:'erro', dura:8000, html:
    `<div class="erro-falso t-baixo"><h3>⚠️ Erro inesperado</h3>
      <p>Alguma coisa deu errado no jogo. Toque em OK pra continuar.</p>
      <span class="ok">OK</span></div>` },

  { aos:70, id:'bicho2', dura:6000, html:
    `<span class="bichinho" style="top:62%;animation-duration:4s">🦋</span>` },

  { aos:88, id:'contagem', dura:9000, html:
    `<div class="contagem t-baixo" id="contaFalsa">⏳ Prêmio secreto em 5…</div>` },

  { aos:110, id:'escuro', dura:9000, html:
    `<div class="cortina"><div class="luz">
      Está tudo escuro.<br>Toque na tela pra acender a luz.</div></div>` },

  { aos:140, id:'fimfalso', dura:9000, html:
    `<div class="premio t-alto" style="background:linear-gradient(135deg,#5ee89a,#2fb673)">
      ✅ FIM DE JOGO — CÊ VENCEU!<br>Toque pra ver teu troféu
      <small>(o jogo não acabou)</small></div>` },

  { aos:180, id:'nada', dura:8000, html:
    `<div class="lead t-baixo" style="color:var(--texto3)">
      …o jogo desistiu de te tentar.<br>Por enquanto.</div>` }
];

/* ---------------------------------------------------------
   O ESTADO
   --------------------------------------------------------- */
const vazio = () => ({ recorde:0, tentativas:0, quedas:{}, medalhas:[] });

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
        return Object.assign(vazio(), o, { quedas:o.quedas||{}, medalhas:o.medalhas||[] });
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
function comecar(){
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
  conferirMedalhas(s);
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
  conferirMedalhas(s);
  gravar();

  $('#tempoFeito').textContent = tempoBonito(s);
  $('#novoRec').style.display = recordeNovo && s >= 1 ? '' : 'none';
  $('#notaPerdeu').textContent = recadoDaQueda(culpa, s);
  limparTentacao();
  document.body.className = '';
  mostrar('perdeu');
  pintarMedalhas('#medPerdeu');
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
    nada:      'Não tinha nada na tela. Cê encostou mesmo assim.'
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
  if(t.id === 'contagem'){
    let n = 5;
    clearInterval(contaFalsa);
    contaFalsa = setInterval(() => {
      n--;
      const el = $('#contaFalsa');
      if(!el) return clearInterval(contaFalsa);
      el.textContent = n > 0 ? `⏳ Prêmio secreto em ${n}…` : '⏳ …era mentira.';
      if(n <= 0) clearInterval(contaFalsa);
    }, 1000);
  }
  setTimeout(() => { if(tentacaoNaTela === t.id) limparTentacao(); }, t.dura);
}

function limparTentacao(){
  $('#tentacao').innerHTML = '';
  tentacaoNaTela = null;
  clearInterval(contaFalsa);
}

/* ---------------------------------------------------------
   MEDALHAS
   --------------------------------------------------------- */
function conferirMedalhas(s){
  for(const m of MEDALHAS){
    if(s >= m.seg && !dados.medalhas.includes(m.seg)){
      dados.medalhas.push(m.seg);
      gravar();
    }
  }
}

function pintarMedalhas(onde){
  const el = $(onde);
  if(!el) return;
  el.innerHTML = MEDALHAS.map(m => {
    const tem = dados.medalhas.includes(m.seg);
    return `<div class="med ${tem ? 'tem' : 'falta'}">
      <div class="e">${tem ? m.e : '🔒'}</div><div class="n">${m.nome}</div></div>`;
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
    bicho:'o bichinho', bicho2:'a borboleta', nada:'a tela vazia' };

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
    pintarMedalhas('#medInicio');
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
