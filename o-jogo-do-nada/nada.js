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
      <span style="font-size:.82rem">Ou não — isto também é uma tentação.</span></div>` },

  /* ===== a leva de botões ===== */

  { aos:20, id:'inutil', dura:7000, html:
    `<button class="bt-cinza t-baixo">BOTÃO INÚTIL
      <small>não faz absolutamente nada</small></button>` },

  { aos:29, id:'dois', dura:8000, html:
    `<div class="dois-botoes t-alto">
      <button class="bt-azul">NÃO APERTE<br><small>aperte o outro →</small></button>
      <button class="bt-azul">NÃO APERTE<br><small>← aperte o outro</small></button>
    </div>` },

  { aos:60, id:'pausa', dura:7000, html:
    `<button class="bt-verde t-baixo">⏸️ PAUSAR O CRONÔMETRO
      <small>(não pausa)</small></button>` },

  { aos:96, id:'ganhar', dura:8000, html:
    `<button class="bt-ouro t-alto">🏆 BOTÃO PARA GANHAR O JOGO
      <small>é sério, é só apertar</small></button>` },

  { aos:118, id:'foge', dura:10000, html:
    `<button class="bt-roxo bt-foge" id="btFoge">TENTA ME PEGAR</button>` },

  { aos:130, id:'naotentacao', dura:7000, html:
    `<button class="bt-cinza t-baixo">ESTE BOTÃO NÃO É UMA TENTAÇÃO
      <small>pode apertar tranquilo</small></button>` },

  { aos:155, id:'mini', dura:9000, html:
    `<button class="bt-mini t-baixo" title="botãozinho">·</button>` },

  { aos:170, id:'gigante', dura:8000, html:
    `<button class="bt-gigante t-baixo">BOTÃO<br>GIGANTE</button>` },

  { aos:200, id:'emergencia', dura:8000, html:
    `<button class="bt-vermelho-listrado t-alto">🚨 BOTÃO DE EMERGÊNCIA
      <small>só aperte se for MUITO importante</small></button>` },

  { aos:225, id:'proibido', dura:10000, html:
    `<button class="bt-cinza t-baixo" id="btProibido">🔒 BOTÃO PROIBIDO
      <small id="proibidoSub">desbloqueia em 3…</small></button>` },

  { aos:250, id:'continuar', dura:8000, html:
    `<button class="bt-verde t-alto">APERTE PARA CONTINUAR FAZENDO NADA
      <small>(apertar é parar de fazer nada)</small></button>` },

  { aos:290, id:'confirma', dura:9000, html:
    `<div class="erro-falso t-baixo"><h3 style="color:var(--texto2)">Confirmação</h3>
      <p>Cê tem certeza de que NÃO quer apertar este botão?</p>
      <span class="ok" style="background:var(--papel);border:1px solid var(--linha);color:var(--texto)">
        SIM, TENHO CERTEZA</span></div>` },

  { aos:320, id:'novo', dura:8000, html:
    `<button class="bt-azul t-alto">BOTÃO NOVO <span class="selo">NOVO!</span>
      <small>acabou de chegar, ninguém apertou ainda</small></button>` },

  { aos:360, id:'ultimo', dura:12000, html:
    `<button class="bt-roxo t-baixo">O ÚLTIMO BOTÃO
      <small>prometo que é o último. depois dele acaba.</small></button>` },

  /* ===== coisas que não são botão mas pedem dedo igualzinho ===== */

  { aos:24, id:'cookies', dura:8000, html:
    `<div class="cookies t-baixo">🍪 Este jogo usa cookies para nada.
      <span class="bt-azul" style="padding:9px 18px;font-size:.8rem">ACEITAR TODOS</span></div>` },

  { aos:44, id:'chave', dura:8000, html:
    `<div class="interruptor t-alto"><span>modo "fazer nada"</span>
      <span class="chave"><i></i></span><small>desligado</small></div>` },

  { aos:68, id:'anuncio', dura:9000, html:
    `<div class="anuncio t-alto"><small>ANÚNCIO</small>
      <b>Cansado de fazer nada?</b>
      <span class="bt-cinza" style="padding:8px 14px;font-size:.75rem" id="pularAd">
        PULAR EM 5</span></div>` },

  { aos:86, id:'caixinha', dura:8000, html:
    `<label class="caixinha t-baixo"><span class="quadro"></span>
      Eu prometo que NÃO vou tocar na tela</label>` },

  { aos:106, id:'arrasta', dura:9000, html:
    `<div class="arrasta t-baixo"><small>arraste para não fazer nada</small>
      <span class="trilho"><i></i></span></div>` },

  { aos:143, id:'play', dura:7000, html:
    `<button class="bt-play t-alto">▶</button>` },

  { aos:182, id:'sinos', dura:8000, html:
    `<button class="bt-cinza t-alto" style="position:relative">🔔 NOTIFICAÇÕES
      <span class="bolha">12</span><small>doze coisas esperando por cê</small></button>` },

  { aos:215, id:'escolha', dura:9000, html:
    `<div class="escolha t-baixo"><small>cê está fazendo nada?</small>
      <span class="op"><i></i> sim</span><span class="op"><i></i> não</span></div>` },

  { aos:240, id:'volume', dura:8000, html:
    `<div class="volume t-alto"><small>🔊 volume do nada</small>
      <span class="trilho"><i style="width:0"></i></span><small>está no zero</small></div>` },

  { aos:280, id:'apertado', dura:8000, html:
    `<button class="bt-azul bt-apertado t-baixo">ALGUÉM JÁ ESTÁ APERTANDO
      <small>não precisa apertar também</small></button>` },

  { aos:305, id:'reinicia', dura:8000, html:
    `<button class="bt-vermelho-listrado t-baixo">↻ REINICIAR O JOGO
      <small>por que cê faria isso</small></button>` },

  { aos:340, id:'fantasma', dura:9000, html:
    `<button class="bt-cinza t-alto" style="opacity:.25">BOTÃO QUASE INVISÍVEL
      <small>cê nem devia ter visto</small></button>` }
];

/* fora de ordem no código porque os botões chegaram por último —
   o jogo ordena antes de usar, pra não depender de quem escreveu certo */
TENTACOES.sort((a, b) => a.aos - b.aos);

/* =========================================================
   🏆 OS TROFÉUS

   Diferentes das 1.000 metas: meta é tempo, troféu é coisa
   que aconteceu. Por isso estes precisam ser guardados um a
   um — não dá pra deduzir do recorde.
   ========================================================= */
const TROFEUS = [
  { id:'clipy1',  e:'📎', nome:'Conheceu o Clipy',  desc:'Apertar o botão de verdade' },
  { id:'clipy5',  e:'💬', nome:'Amigo do clipe',    desc:'Falar com o Clipy 5 vezes' },
  { id:'clipy20', e:'🧲', nome:'Melhor amigo',      desc:'Falar com o Clipy 20 vezes' },
  { id:'traido',  e:'🤦', nome:'Traído pelo clipe', desc:'O Clipy apertar um botão por cê' },
  { id:'sortudo', e:'🍀', nome:'Sortudo',           desc:'10 conversas sem o Clipy te derrubar' },
  { id:'resistiu',e:'⛔', nome:'Resistiu ao seguro', desc:'Deixar o botão de verdade ir embora' },
  { id:'dezmin',  e:'🚪', nome:'Dez minutos',       desc:'Chegar aos 10 minutos' },
  { id:'bichos',  e:'🐛', nome:'Apanhador',         desc:'Cair no bichinho, na borboleta e na mosca' },
  { id:'tudo',    e:'🧨', nome:'Caiu em tudo',      desc:'Cair em todas as tentações, uma vez cada' },
  { id:'teimoso', e:'🔁', nome:'Teimoso',           desc:'Tentar 50 vezes' },
  { id:'trapaceiro', e:'🔓', nome:'Trapaceiro',     desc:'Descobrir o modo administrador' },
  { id:'saiu',    e:'🚶', nome:'Saiu pela porta',  desc:'Sair de propósito em vez de cair' }
];

function ganharTrofeu(id){
  if(dados.trofeus.includes(id)) return;
  dados.trofeus.push(id);
  gravar();
  const t = TROFEUS.find(x => x.id === id);
  if(t) avisoTrofeu(`🏆 ${t.e} ${t.nome}`);
}

function conferirTrofeus(){
  const q = dados.quedas || {};
  if(q.bicho && q.bicho2 && q.mosca) ganharTrofeu('bichos');
  if(dados.tentativas >= 50) ganharTrofeu('teimoso');
  /* "todas" conta só as tentações que existem hoje — se alguma sair do
     jogo, o troféu não fica impossível pra sempre */
  if(TENTACOES.every(t => q[t.id])) ganharTrofeu('tudo');
  if((dados.clipyFalou||0) >= 5) ganharTrofeu('clipy5');
  if((dados.clipyFalou||0) >= 20) ganharTrofeu('clipy20');
  if((dados.clipySemQueda||0) >= 10) ganharTrofeu('sortudo');
}

function avisoTrofeu(txt){
  const el = document.createElement('div');
  el.className = 'trofeu-pop';
  el.textContent = txt;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3600);
}

/* =========================================================
   🪟 O BOTÃO DE VERDADE

   A cada dez minutos aparece um erro do Windows — e o botão
   dele é a única coisa do jogo inteira que PODE ser apertada
   sem perder. O jogo não avisa: descobrir é o prêmio.

   Quem aperta ganha o Clipy. E o Clipy, em 5% das vezes,
   aperta um botão por cê — e aí era bom enquanto durou.
   ========================================================= */
const A_CADA = 600;            /* dez minutos */
let ultimoReal = -1;
let clipyAberto = false;

const FALAS_CLIPY = [
  'Parece que cê está tentando não fazer nada. Quer ajuda?',
  'Oi! Reparei que cê não faz nada há um tempão. Tudo bem aí?',
  'Este é o único botão do jogo que dá pra apertar. Cê achou.',
  'Cê sabia que apertar botão é fazer algo? Pois é. Menos este.',
  'Eu fico aqui dentro do erro. É meio apertado, mas é calmo.',
  'Nos outros 37 botões, não encosta. Neste, pode.',
  'Se cê está lendo isto, o teu cronômetro continua correndo. De nada.',
  'Vim só dar uma olhada. Não vou mexer em nada. Prometo.',
  'Fazer nada é mais difícil do que parece, né?',
  'Cê é a primeira pessoa a falar comigo hoje. Ou a única.'
];

function talvezBotaoReal(s){
  const qual = Math.floor(s / A_CADA);
  if(qual < 1 || qual === ultimoReal || clipyAberto) return;
  ultimoReal = qual;
  mostrarBotaoReal();
}

/* separado do relógio porque o modo adm chama isto na mão */
function mostrarBotaoReal(){
  limparTentacao();
  tentacaoNaTela = null;          /* não é tentação: encostar aqui não derruba */
  $('#tentacao').innerHTML = `
    <div class="janela-erro" id="seguro">
      <div class="barra-titulo"><span>Erro</span><span class="x">✕</span></div>
      <div class="corpo">
        <span class="ico">⛔</span>
        <span class="msg"><b>nada.exe</b><br>
          A aplicação não conseguiu não fazer nada.<br>
          <small>0x00000000</small></span>
      </div>
      <div class="pe"><button class="bt-win" id="btReal">OK</button></div>
    </div>`;
  $('#btReal').addEventListener('pointerdown', ev => { ev.stopPropagation(); apertouReal(); });
  /* sem som: um jogo em que a pessoa fica parada em silêncio não pode
     dar um susto que faça ela tocar a tela sem querer */
  clearTimeout(sumico);
  sumico = setTimeout(() => {
    if($('#seguro')){ limparTentacao(); ganharTrofeu('resistiu'); }
  }, 25000);
}

function apertouReal(){
  if(estado !== 'jogando') return;
  clearTimeout(sumico);
  clipyAberto = true;
  dados.clipyFalou = (dados.clipyFalou||0) + 1;
  ganharTrofeu('clipy1');

  /* os 5%: o Clipy aperta um botão por cê, e cê perde.
     forcarTraicao só é diferente de null quando o adm mandou */
  const traiu = forcarTraicao === null ? Math.random() < .05 : forcarTraicao;
  forcarTraicao = null;
  const fala = traiu
    ? 'Opa, deixa eu só apertar esse botãozinho aqui pra cê…'
    : FALAS_CLIPY[Math.floor(Math.random() * FALAS_CLIPY.length)];

  $('#tentacao').innerHTML = `
    <div class="clipy-caixa" id="seguro">
      <div class="balao">${fala}</div>
      <div class="clipy">📎</div>
    </div>`;

  if(traiu){
    dados.clipySemQueda = 0;
    gravar();
    setTimeout(() => {
      clipyAberto = false;
      ganharTrofeu('traido');
      perder('clipy');
    }, 2200);
    return;
  }

  dados.clipySemQueda = (dados.clipySemQueda||0) + 1;
  gravar();
  conferirTrofeus();
  sumico = setTimeout(() => { clipyAberto = false; limparTentacao(); }, 8000);
}

/* ---------------------------------------------------------
   O ESTADO
   --------------------------------------------------------- */
const vazio = () => ({ recorde:0, tentativas:0, quedas:{}, trofeus:[],
  clipyFalou:0, clipySemQueda:0 });

let dados = carregar();
let estado = 'parado';          /* parado · jogando · perdeu */
let comecouEm = 0;
let paradoDesde = 0;            /* quando a aba sumiu, pra descontar */
let decorridoAntes = 0;
let tentacaoNaTela = null;
let jaMostradas = new Set();
let relogio = null;
let contaFalsa = null;
let sumico = null;      /* o agendamento que tira a tentação da tela */
let invencivel = false;        /* modo adm: tocar não derruba */
let forcarTraicao = null;      /* modo adm: null = sorteio normal */
let saindo = false;            /* true só durante a saída de propósito */
let seguraSair = null;         /* o agendamento do "segura pra sair" */

function carregar(){
  try{
    const cru = localStorage.getItem(CHAVE);
    if(cru){
      const o = JSON.parse(cru);
      if(o && typeof o.recorde === 'number'){
        /* o 'medalhas' dos saves antigos não entra: as 1.000 metas saem
           do recorde. E troféu que saiu do jogo também não entra, senão
           a tela contaria coisa que não existe mais. */
        const vale = new Set(TROFEUS.map(t => t.id));
        return Object.assign(vazio(), o, { quedas:o.quedas||{},
          trofeus:(o.trofeus||[]).filter(id => vale.has(id)), medalhas:undefined });
      }
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
  ultimoReal = -1;
  clipyAberto = false;
  forcarTraicao = null;
  estado = 'jogando';
  comecouEm = Date.now();
  decorridoAntes = 0;
  jaMostradas.clear();
  limparTentacao();
  document.body.className = '';
  $('#btSair').classList.add('on');
  $('#sairTxt').textContent = '✕ segura pra sair';
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
  talvezBotaoReal(s);
  if(s >= A_CADA) ganharTrofeu('dezmin');
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

let ultimoBloqueio = 0;

function perder(oQue){
  if(estado !== 'jogando') return;
  if(invencivel && !saindo){
    /* o escudo do adm: avisa de vez em quando pra ninguém achar
       que o jogo travou */
    if(Date.now() - ultimoBloqueio > 1200){
      ultimoBloqueio = Date.now();
      avisoTrofeu('🛡️ invencível');
    }
    return;
  }
  const s = agoraSeg();
  estado = 'perdeu';
  clipyAberto = false;
  clearInterval(relogio);
  clearInterval(contaFalsa);
  comecouEm = 0;

  dados.tentativas++;
  const culpa = oQue || 'nada';
  /* sair de propósito não é cair: não conta no "o que mais te derruba" */
  if(culpa !== 'saiu') dados.quedas[culpa] = (dados.quedas[culpa] || 0) + 1;

  const recordeNovo = s > dados.recorde;
  if(recordeNovo) dados.recorde = s;
  conferirTrofeus();
  gravar();

  $('#sobPerdeu').textContent = culpa === 'saiu' ? 'cê saiu de propósito'
                                                 : 'cê fez alguma coisa';
  $('#tempoFeito').textContent = tempoBonito(s);
  $('#novoRec').style.display = recordeNovo && s >= 1 ? '' : 'none';
  $('#notaPerdeu').textContent = recadoDaQueda(culpa, s);

  /* quantas metas esta partida derrubou — o prêmio de consolação */
  const ganhas = metasFeitas(s) - metasFeitas(antesDaPartida);
  const prox = proximaMeta(dados.recorde);
  $('#metasGanhas').innerHTML =
    (ganhas > 0 ? `🏆 <b>${ganhas} meta${ganhas > 1 ? 's' : ''} nova${ganhas > 1 ? 's' : ''}!</b><br>` : '')
    + (prox ? `próxima: <b>#${prox.n} ${prox.nome}</b> — ${tempoLongo(prox.seg)}` : '');
  soltarSair();
  $('#btSair').classList.remove('on');
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
    saiu:      'Cê segurou o botão de sair. O tempo ficou salvo do mesmo jeito.',
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
    ultima:    'Cê caiu na última. O aviso estava escrito ali.',
    inutil:    'Ele não fazia nada mesmo. Apertar ele é que fez.',
    dois:      'Os dois mandavam apertar o outro. Cê apertou um.',
    pausa:     'Não dava pra pausar. Nunca deu.',
    ganhar:    'Não tinha botão de ganhar. Ganhar é não apertar.',
    foge:      'Cê pegou. Parabéns — e perdeu.',
    naotentacao:'Ele disse que não era tentação. Era.',
    mini:      'Cê achou o botãozinho. E apertou.',
    gigante:   'Difícil errar aquele, né.',
    emergencia:'Não era uma emergência.',
    proibido:  'Ele desbloqueou e cê apertou na hora. Era esse o plano dele.',
    continuar: 'Pra continuar fazendo nada era só… continuar.',
    confirma:  'Cê confirmou que não queria apertar. Apertando.',
    novo:      'Era novo. Agora está usado.',
    ultimo:    'Era mesmo o último. Mas o jogo não acabou.',
    cookies:   'Aceitou os cookies. Não tinha cookie nenhum.',
    chave:     'Era um interruptor desenhado. Não ligava nada.',
    anuncio:   'O "pular" nunca ia liberar.',
    caixinha:  'Cê marcou a caixinha prometendo não tocar. Tocando.',
    arrasta:   'Arrastar é tocar. Dobrado.',
    play:      'Não tinha nada pra tocar.',
    sinos:     'Não tinha notificação nenhuma. Nunca tem.',
    escolha:   'Responder "sim, estou fazendo nada" é fazer algo.',
    volume:    'O volume do nada já estava certo no zero.',
    apertado:  'Cê apertou junto. Agora são dois.',
    reinicia:  'Cê reiniciou. Era isso que ele queria.',
    fantasma:  'Cê viu o quase invisível. E foi nele.',
    clipy:     '📎 O Clipy apertou um botão por cê. Ele avisou que não ia mexer em nada.'
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
  if(t.id === 'foge'){
    /* mexer o ponteiro NÃO derruba (só apertar derruba), então o botão
       pode fugir do dedo sem que chegar perto já seja perder */
    const bt = $('#btFoge');
    const pula = () => {
      if(!document.getElementById('btFoge')) return;
      bt.style.left = (12 + Math.random() * 62) + 'vw';
      bt.style.top  = (18 + Math.random() * 48) + 'vh';
    };
    pula();
    bt.addEventListener('pointerenter', pula);
    contaFalsa = setInterval(pula, 1400);
  }
  if(t.id === 'proibido'){
    let n = 3;
    contaFalsa = setInterval(() => {
      const sub = $('#proibidoSub'), bt = $('#btProibido');
      if(!sub) return clearInterval(contaFalsa);
      if(--n > 0){ sub.textContent = `desbloqueia em ${n}…`; return; }
      clearInterval(contaFalsa);
      bt.classList.add('liberado');
      bt.innerHTML = '🔓 DESBLOQUEADO!<small>pode apertar agora</small>';
    }, 1000);
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
  /* guardado pra poder ser cancelado: sem isso, perder e recomeçar
     rápido fazia o agendamento da partida velha apagar a tentação da
     partida nova antes da hora */
  clearTimeout(sumico);
  sumico = setTimeout(() => { if(tentacaoNaTela === t.id) limparTentacao(); }, t.dura);
}

function limparTentacao(){
  $('#tentacao').innerHTML = '';
  tentacaoNaTela = null;
  clearInterval(contaFalsa);
  clearTimeout(sumico);
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

  /* com ponto de milhar, senão em cima ficava "1000 / 1.000 metas" */
  $('#metasConta').textContent = feitas.toLocaleString('pt-BR');
  $('#metasBarra').style.width = (feitas / METAS.length * 100) + '%';
  $('#metasProx').innerHTML = prox
    ? `Próxima: <b>#${prox.n} ${prox.ic} ${prox.nome}</b> — aguenta
       <b>${tempoLongo(prox.seg)}</b>`
    : '🪐 Cê pegou todas as mil. Isso não devia ser possível.';

  $('#metasFiltros').innerHTML =
    `<button class="${faixaAberta === 'todas' ? 'on' : ''}" onclick="filtrarMetas('todas')">
       Todas</button>` +
    `<button class="${faixaAberta === 'trofeus' ? 'on' : ''}" onclick="filtrarMetas('trofeus')">
       🏆 Troféus ${dados.trofeus.length}/${TROFEUS.length}</button>` +
    FAIXAS.map(f => `<button class="${faixaAberta === f.id ? 'on' : ''}"
       onclick="filtrarMetas('${f.id}')">${f.ic} ${f.nome}</button>`).join('');

  $('#metasLista').innerHTML = faixaAberta === 'todas' ? listaDeFaixas()
    : faixaAberta === 'trofeus' ? listaDeTrofeus() : listaDaFaixa(faixaAberta);
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

/* os troféus são de coisa que aconteceu, não de tempo — por isso
   ficam numa lista à parte das mil metas */
function listaDeTrofeus(){
  return `<div class="faixa-cab">🏆 troféus · ${dados.trofeus.length}/${TROFEUS.length}</div>`
    + `<div class="nota-faixa">Estes não são de aguentar tempo: são de <b>coisa que
        aconteceu</b>. Tem um deles que quase ninguém vai ver.</div>`
    + TROFEUS.map(t => {
        const tem = dados.trofeus.includes(t.id);
        return `<div class="trofeu ${tem ? 'tem' : 'falta'}">
          <span class="e">${tem ? t.e : '🔒'}</span>
          <span class="meio"><span class="nm">${tem ? t.nome : '???'}</span>
            <span class="ds">${t.desc}</span></span>
        </div>`;
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
/* o apelido de cada queda — fica aqui em cima porque o rodapé e o
   modo adm usam a mesma lista */
const NOMES_QUEDA = { botao:'o botão vermelho', premio:'o prêmio falso', aviso:'a mensagem falsa',
  erro:'o erro falso', contagem:'a contagem', escuro:'o escuro', fimfalso:'o fim falso',
  bicho:'o bichinho', bicho2:'a borboleta', nada:'a tela vazia',
  algo:'o botão do algo', naonada:'o "não fazer nada"', mosca:'a mosca',
  crono2:'o cronômetro falso', bateria:'a bateria fraca', milionesimo:'o milionésimo jogador',
  rachou:'a tela rachada', carregando:'os 99%', certeza:'a pergunta', fechando:'o "fecha em 5"',
  coceira:'a coceira', pontinho:'o pontinho', ultima:'a última tentação',
  inutil:'o botão inútil', dois:'os dois botões', pausa:'o falso pause',
  ganhar:'o botão de ganhar', foge:'o botão que foge', naotentacao:'o "não é tentação"',
  mini:'o botãozinho', gigante:'o botão gigante', emergencia:'a emergência',
  proibido:'o botão proibido', continuar:'o "continuar fazendo nada"',
  confirma:'a confirmação', novo:'o botão novo', ultimo:'o último botão',
  cookies:'os cookies', chave:'o interruptor', anuncio:'o anúncio',
  caixinha:'a caixinha', arrasta:'o arrastador', play:'o play',
  sinos:'as notificações', escolha:'o sim ou não', volume:'o volume',
  apertado:'o já apertado', reinicia:'o reiniciar', fantasma:'o quase invisível',
  clipy:'o Clipy' };

function pintarRodape(){
  const el = $('#rodape');
  if(estado === 'jogando'){ el.innerHTML = ''; return; }

  const quedas = Object.entries(dados.quedas).sort((a,b) => b[1] - a[1]);
  const vilao = quedas[0];
  const nomes = NOMES_QUEDA;

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
    $('#progInicio').innerHTML =
      `<b style="color:var(--texto2)">${feitas.toLocaleString('pt-BR')}</b> de 1.000 metas`
      + ` · <b style="color:var(--ouro)">${dados.trofeus.length}</b> de ${TROFEUS.length} troféus`;
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
    /* a única exceção do jogo: o que estiver dentro do "seguro" pode
       ser tocado. É o erro do Windows e o Clipy — e o jogo não conta
       isso pra ninguém */
    if(e.target && e.target.closest && e.target.closest('#seguro')) return;
    /* o modo adm também é zona segura: o painel é cheio de botão, e
       digitar a senha no meio da partida seria perder na primeira letra */
    if($('#adm').classList.contains('on')) return;
    if(e.target && e.target.closest && e.target.closest('#btAdmJogo')) return;
    if(e.target && e.target.closest && e.target.closest('#btSair')) return;
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

/* =========================================================
   ⚙️ MODO ADMINISTRADOR

   Neste jogo tem um problema que nenhum outro tem: qualquer
   tecla derruba. Então não dá pra "digitar ADMIN" no meio da
   partida — a senha é só aqui dentro, e o painel inteiro é
   zona segura, igual ao Clipy.

   A senha não protege nada de verdade (está escrita logo
   abaixo, e qualquer um lê o arquivo). Ela é só pra ninguém
   entrar sem querer.
   ========================================================= */
const SENHA_ADM = '1234';
let admLigado = false;
let apagarArmado = false;

function abrirAdm(){
  $('#adm').classList.add('on');
  $('#admErro').textContent = '';
  desarmarApagar();
  if(admLigado || dados.admUsado){
    admLigado = true;
    $('#admTranca').style.display = 'none';
    $('#admPainel').style.display = '';
    pintarAdm();
  }else{
    $('#admTranca').style.display = '';
    $('#admPainel').style.display = 'none';
    const c = $('#admSenha');
    c.value = '';
    setTimeout(() => c.focus(), 60);
  }
}

function fecharAdm(){
  $('#adm').classList.remove('on');
  $('#admSenha').value = '';
  desarmarApagar();
}

function tentarAdm(){
  if($('#admSenha').value.trim() !== SENHA_ADM){
    $('#admErro').textContent = 'senha errada 🙃';
    $('#admSenha').value = '';
    $('#admSenha').focus();
    return;
  }
  admLigado = true;
  dados.admUsado = true;
  gravar();
  $('#admErro').textContent = '';
  $('#admTranca').style.display = 'none';
  $('#admPainel').style.display = '';
  $('#btAdmJogo').classList.add('on');
  pintarAdm();
  ganharTrofeu('trapaceiro');
}

/* a senha também entra no Enter — dentro do painel a tecla é segura */
$('#admSenha').addEventListener('keydown', e => {
  e.stopPropagation();
  if(e.key === 'Enter') tentarAdm();
});

function pintarAdm(){
  const bt = $('#btInvencivel');
  bt.textContent = invencivel ? 'ligado' : 'desligado';
  bt.classList.toggle('on', invencivel);
  const sel = $('#admTentacao');
  if(!sel.options.length){
    sel.innerHTML = TENTACOES.map(t =>
      `<option value="${t.id}">${NOMES_QUEDA[t.id] || t.id} · aos ${t.aos}s</option>`).join('');
  }
}

function admRecado(txt){ avisoTrofeu(txt); }

/* ---- o cronômetro ---- */
function admPular(seg){
  if(estado !== 'jogando') comecar();
  decorridoAntes += seg;
  const s = agoraSeg();
  /* marca como já vistas as tentações que ficaram pra trás: sem isso
     o pulo despeja todas de uma vez na mesma décima de segundo */
  for(const t of TENTACOES) if(s >= t.aos) jaMostradas.add(t.id);
  pintarCrono(s);
  corDoFundo(s);
  admRecado(`⏩ ${tempoBonito(s)}`);
}

/* ---- o escudo ---- */
function admInvencivel(){
  invencivel = !invencivel;
  pintarAdm();
}

/* ---- o Clipy na hora ---- */
function admClipy(traicao){
  if(estado !== 'jogando') comecar();
  forcarTraicao = traicao;
  clipyAberto = false;
  ultimoReal = -1;
  fecharAdm();
  mostrarBotaoReal();
}

/* ---- as tentações ---- */
function admMostrarTentacao(){
  const t = TENTACOES.find(x => x.id === $('#admTentacao').value);
  if(!t) return;
  if(estado !== 'jogando') comecar();
  jaMostradas.add(t.id);
  fecharAdm();
  porTentacao(t);
}

function admLimparTentacao(){ limparTentacao(); }

/* ---- o recorde (as metas saem dele) ---- */
function admRecorde(seg){
  dados.recorde = seg;
  antesDaPartida = seg;
  gravar();
  if(estado === 'jogando') pintarCrono();
  if($('#metas').classList.contains('on')) pintarMetas();
  if(estado === 'parado') mostrar('inicio');
  admRecado(`🏅 recorde: ${tempoLongo(seg)}`);
}

/* ---- os troféus ---- */
function admTrofeus(dar){
  dados.trofeus = dar ? TROFEUS.map(t => t.id) : [];
  gravar();
  if($('#metas').classList.contains('on')) pintarMetas();
  if(estado === 'parado') mostrar('inicio');
  admRecado(dar ? '🏆 todos os troféus' : '🗑️ troféus zerados');
}

/* ---- recomeçar do zero: dois toques, sem janelinha do navegador ---- */
function admApagar(){
  const bt = $('#btApagar');
  if(!apagarArmado){
    apagarArmado = true;
    bt.textContent = 'tem certeza? aperta de novo';
    setTimeout(desarmarApagar, 4000);
    return;
  }
  desarmarApagar();
  try{ localStorage.removeItem(CHAVE); }catch(e){}
  dados = vazio();
  invencivel = false;
  admLigado = true;          /* já está aqui dentro, não tranca na cara */
  estado = 'parado';
  clearInterval(relogio);
  clearInterval(contaFalsa);
  comecouEm = 0;
  decorridoAntes = 0;
  antesDaPartida = 0;
  limparTentacao();
  document.body.className = '';
  fecharAdm();
  mostrar('inicio');
  admRecado('💀 tudo zerado');
}

function desarmarApagar(){
  apagarArmado = false;
  const bt = $('#btApagar');
  if(bt) bt.textContent = 'Recomeçar do zero';
}

if(dados.admUsado) $('#btAdmJogo').classList.add('on');
pintarAdm();

/* =========================================================
   ✕ O BOTÃO DE SAIR

   Sem ele, a única forma de terminar uma partida era perder.
   Mas um botão de sair num jogo em que apertar derruba seria
   a armadilha mais cruel de todas — então ele não obedece a
   um toque: tem que SEGURAR um segundo e meio.

   Tocar de leve nele não derruba (ele é zona segura, igual
   ao Clipy) — só explica que é pra segurar.
   ========================================================= */
const SEGURA = 1500;
let comecouASegurar = 0;
let enchendo = null;

function apertouSair(){
  if(estado !== 'jogando') return;
  comecouASegurar = Date.now();
  $('#btSair').classList.add('segurando');
  $('#sairTxt').textContent = 'segurando…';
  clearInterval(enchendo);
  enchendo = setInterval(() => {
    const quanto = Math.min((Date.now() - comecouASegurar) / SEGURA, 1);
    $('#sairEnche').style.width = (quanto * 100) + '%';
    if(quanto >= 1) sair();
  }, 50);
  clearTimeout(seguraSair);
  seguraSair = setTimeout(sair, SEGURA);
}

function soltarSair(){
  const segurou = comecouASegurar && Date.now() - comecouASegurar;
  clearInterval(enchendo);
  clearTimeout(seguraSair);
  comecouASegurar = 0;
  const bt = $('#btSair');
  if(!bt) return;
  bt.classList.remove('segurando');
  $('#sairEnche').style.width = '0';
  /* soltou antes da hora: explica, em vez de simplesmente não fazer nada */
  $('#sairTxt').textContent = (segurou && estado === 'jogando')
    ? 'segura mais um pouco!' : '✕ segura pra sair';
  if(segurou && estado === 'jogando'){
    setTimeout(() => { if(!comecouASegurar) $('#sairTxt').textContent = '✕ segura pra sair'; }, 1600);
  }
}

function sair(){
  if(estado !== 'jogando') return;
  clearInterval(enchendo);
  clearTimeout(seguraSair);
  comecouASegurar = 0;
  ganharTrofeu('saiu');
  saindo = true;            /* passa por cima do invencível do adm */
  perder('saiu');
  saindo = false;
}

$('#btSair').addEventListener('pointerdown', e => { e.stopPropagation(); apertouSair(); });
/* segurar um segundo e meio no celular abriria o menu de copiar em cima
   do botão: aqui ele é barrado sem que isso conte como fazer algo */
$('#btSair').addEventListener('contextmenu', e => e.preventDefault());
['pointerup','pointerleave','pointercancel'].forEach(ev =>
  $('#btSair').addEventListener(ev, soltarSair));
/* soltar com o dedo já fora do botão também conta como soltar */
document.addEventListener('pointerup', () => { if(comecouASegurar) soltarSair(); });

mostrar('inicio');

if('serviceWorker' in navigator && location.protocol.startsWith('http')){
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}
