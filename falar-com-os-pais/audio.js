/* =========================================================
   audio.js — recadinho de voz, walkie-talkie e efeitos.
   Grava com o microfone do próprio aparelho e guarda o
   arquivo no IndexedDB (ou no localStorage, se não der).
   Nada é enviado pra internet.
   ========================================================= */

/* ---------- guardar os áudios ---------- */
const BD_NOME = 'fala-familia-audios';
let bd = null, bdPronto = null;

function abrirBD(){
  if(bdPronto) return bdPronto;
  bdPronto = new Promise(res => {
    try{
      const r = indexedDB.open(BD_NOME, 1);
      r.onupgradeneeded = () => r.result.createObjectStore('audios');
      r.onsuccess = () => res(bd = r.result);
      r.onerror   = () => res(null);
    }catch(e){ res(null); }
  });
  return bdPronto;
}
async function guardarAudio(id, blob){
  const db = await abrirBD();
  if(db){
    return new Promise(res => {
      const t = db.transaction('audios','readwrite');
      t.objectStore('audios').put(blob, id);
      t.oncomplete = () => res(true);
      t.onerror    = () => res(false);
    });
  }
  return false;   // sem banco: o áudio vai em texto dentro da mensagem
}
async function pegarAudio(id){
  const db = await abrirBD();
  if(!db) return null;
  return new Promise(res => {
    const p = db.transaction('audios','readonly').objectStore('audios').get(id);
    p.onsuccess = () => res(p.result || null);
    p.onerror   = () => res(null);
  });
}
async function apagarAudio(id){
  const db = await abrirBD();
  if(!db) return;
  try{ db.transaction('audios','readwrite').objectStore('audios').delete(id); }catch(e){}
}
function blobParaTexto(blob){
  return new Promise(res => { const f = new FileReader(); f.onload = () => res(f.result); f.readAsDataURL(blob); });
}

/* ---------- gravar ---------- */
let gravador = null, pedacos = [], inicioGrav = 0, timerGrav = null, cancelado = false;

async function pegarMicrofone(){
  if(!window.isSecureContext || !navigator.mediaDevices?.getUserMedia){
    toast('Pra gravar, abre o site pelo link (https) 🔒', 5000);
    return null;
  }
  try{
    return await navigator.mediaDevices.getUserMedia({ audio:true });
  }catch(e){
    const recado =
      e.name === 'NotAllowedError' ? 'Aperta "Permitir" quando o celular pedir o microfone 🎤' :
      e.name === 'NotFoundError'   ? 'Não achei microfone neste aparelho 😕' :
      e.name === 'NotReadableError'? 'Outro aplicativo está usando o microfone 😕' :
      'Não deu pra abrir o microfone (' + e.name + ')';
    toast(recado, 5000);
    return null;
  }
}

function tipoSuportado(){
  const tipos = ['audio/webm;codecs=opus','audio/webm','audio/mp4','audio/ogg;codecs=opus'];
  return tipos.find(t => window.MediaRecorder && MediaRecorder.isTypeSupported(t)) || '';
}

/* Começa a gravar. aoTerminar(blob, segundos) é chamado quando solta. */
async function comecarGravacao(aoTerminar){
  if(gravador) return false;
  const stream = await pegarMicrofone();
  if(!stream) return false;
  const tipo = tipoSuportado();
  try{
    gravador = tipo ? new MediaRecorder(stream, { mimeType:tipo }) : new MediaRecorder(stream);
  }catch(e){ toast('Este navegador não deixa gravar 😕'); stream.getTracks().forEach(t=>t.stop()); return false; }

  pedacos = []; cancelado = false; inicioGrav = Date.now();
  gravador.ondataavailable = ev => { if(ev.data && ev.data.size) pedacos.push(ev.data); };
  gravador.onstop = () => {
    stream.getTracks().forEach(t => t.stop());
    const segundos = (Date.now() - inicioGrav) / 1000;
    const blob = new Blob(pedacos, { type: gravador.mimeType || 'audio/webm' });
    gravador = null; clearInterval(timerGrav);
    if(!cancelado && segundos >= .4) aoTerminar(blob, segundos);
    else if(!cancelado) toast('Curtinho demais! Segura mais tempo 😊');
  };
  gravador.start();
  return true;
}
function pararGravacao(cancelar){
  if(!gravador) return;
  cancelado = !!cancelar;
  try{ gravador.stop(); }catch(e){}
}
const gravando = () => !!gravador;
const segundosGravados = () => (Date.now() - inicioGrav) / 1000;

/* Toca pra começar, toca de novo pra mandar.
   Enquanto o celular pergunta "pode usar o microfone?", quem tocar de novo
   só cancela — antes isso deixava a gravação presa ligada. */
let iniciandoGrav = false, querParar = false;

async function alternarGravacao({ aoComecar, aoTerminar, aoFalhar }){
  if(iniciandoGrav){ querParar = true; return 'esperando'; }
  if(gravando()){ pararGravacao(false); return 'mandou'; }

  iniciandoGrav = true; querParar = false;
  const ok = await comecarGravacao(aoTerminar);
  iniciandoGrav = false;
  if(!ok){ aoFalhar && aoFalhar(); return 'falhou'; }
  if(querParar){ pararGravacao(true); return 'cancelou'; }
  aoComecar && aoComecar();
  return 'gravando';
}

/* ---------- mandar o recadinho de voz ---------- */
async function mandarAudio(blob, segundos){
  const id = 'a' + Date.now() + Math.random().toString(36).slice(2,7);
  const guardou = await guardarAudio(id, blob);
  const msg = { tipo:'audio', id, dur: Math.round(segundos * 10) / 10, de: autor, ts: Date.now() };
  if(!guardou){
    const txt = await blobParaTexto(blob);
    if(txt.length > 2500000){
      toast('Áudio grande demais pra guardar neste navegador 😕', 5000);
      if(window.mostrarErroNaTela) mostrarErroNaTela('áudio de ' + Math.round(txt.length/1024) + ' KB não coube (cofre do aparelho indisponível)');
      return;
    }
    msg.b64 = txt;
  }
  dados.msgs[atual].push(msg);
  dados.visto[atual] = Date.now();
  dados.presenca[autor] = Date.now();
  animar = dados.msgs[atual].length - 1;
  salvar(); blim(true);
  mandarPraNuvem(atual, msg);
  desenharMensagens(); desenharContatos(); atualizarStatusTopo();
}

/* ---------- tocar ---------- */
const urlsAudio = new Map();     // id -> objectURL
let tocandoAgora = null;         // { id, el, ctx }

async function urlDoAudio(m){
  if(m.b64) return m.b64;
  if(urlsAudio.has(m.id)) return urlsAudio.get(m.id);
  const blob = await pegarAudio(m.id);
  if(!blob) return null;
  const url = URL.createObjectURL(blob);
  urlsAudio.set(m.id, url);
  return url;
}

const EFEITOS = {
  normal : { nome:'Normal',  emoji:'🎤', taxa:1    },
  esquilo: { nome:'Esquilo', emoji:'🐿️', taxa:1.6  },
  monstro: { nome:'Monstro', emoji:'👹', taxa:0.68 },
  robo   : { nome:'Robô',    emoji:'🤖', taxa:1    }
};

function pararTudo(){
  if(tocandoAgora){
    try{ tocandoAgora.el.pause(); }catch(e){}
    try{ tocandoAgora.ctx && tocandoAgora.ctx.close(); }catch(e){}
    tocandoAgora = null;
  }
  document.querySelectorAll('.bt-play').forEach(b => b.textContent = '▶');
  document.querySelectorAll('.onda').forEach(o => o.classList.remove('tocando'));
}

async function tocarAudio(indice, efeito){
  const m = dados.msgs[atual][indice];
  if(!m) return;
  const mesmo = tocandoAgora && tocandoAgora.i === indice;
  pararTudo();
  if(mesmo) return;                       // clicou de novo = pausar

  const url = await urlDoAudio(m);
  if(!url){ toast('Esse áudio se perdeu 😕'); return; }

  const ef = EFEITOS[efeito || m.efeito || 'normal'] || EFEITOS.normal;
  const el = new Audio(url);
  el.preservesPitch = false; el.mozPreservesPitch = false; el.webkitPreservesPitch = false;
  el.playbackRate = ef.taxa;

  let ctx = null;
  if(ef === EFEITOS.robo){
    try{
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      const fonte = ctx.createMediaElementSource(el);
      const anel  = ctx.createGain();          // ring modulator = voz de robô
      const osc   = ctx.createOscillator();
      const prof  = ctx.createGain();
      osc.frequency.value = 42; prof.gain.value = 1; anel.gain.value = 0;
      osc.connect(prof); prof.connect(anel.gain);
      fonte.connect(anel); anel.connect(ctx.destination);
      osc.start();
    }catch(e){ ctx = null; }
  }

  const linha = document.querySelector(`.linha-msg[data-i="${indice}"]`);
  const botao = linha && linha.querySelector('.bt-play');
  const onda  = linha && linha.querySelector('.onda');
  if(botao) botao.textContent = '⏸';
  if(onda) onda.classList.add('tocando');

  el.onended = () => pararTudo();
  el.onerror = () => { pararTudo(); toast('Não consegui tocar esse áudio 😕'); };
  tocandoAgora = { i:indice, el, ctx };
  el.play().catch(() => { pararTudo(); toast('Toca de novo no play 😊'); });
}

/* ---------- desenho do balão de áudio ---------- */
function balaoAudio(m, indice){
  const barras = Array.from({length:22}, (_,k) =>
    `<span style="height:${18 + Math.round(Math.abs(Math.sin((indice + 1) * (k + 2))) * 62)}%"></span>`).join('');
  return `
    <div class="audio-msg">
      <button class="bt-play" data-play="${indice}" title="Tocar">▶</button>
      <div class="onda">${barras}</div>
      <span class="dur">${(m.dur || 0).toFixed(1)}s</span>
      <button class="bt-efeito" data-efeito="${indice}" title="Voz engraçada">🎛️</button>
    </div>`;
}

/* Menu de vozes engraçadas de um áudio. */
function abrirEfeitos(indice){
  const antigo = document.getElementById('menuEfeito');
  if(antigo) antigo.remove();
  const linha = document.querySelector(`.linha-msg[data-i="${indice}"]`);
  if(!linha) return;
  const menu = document.createElement('div');
  menu.id = 'menuEfeito'; menu.className = 'menu-efeito';
  menu.innerHTML = Object.entries(EFEITOS)
    .map(([k,e]) => `<button data-ef="${k}">${e.emoji} ${e.nome}</button>`).join('');
  linha.insertAdjacentElement('afterend', menu);
  menu.querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
    menu.remove(); tocarAudio(indice, b.dataset.ef);
  }));
}

/* ---------- walkie-talkie ---------- */
function pipoco(agudo){
  try{
    const c = new (window.AudioContext || window.webkitAudioContext)();
    const o = c.createOscillator(), g = c.createGain(), t = c.currentTime;
    o.type = 'square'; o.frequency.value = agudo ? 1200 : 700;
    g.gain.setValueAtTime(.06, t); g.gain.exponentialRampToValueAtTime(.0001, t + .13);
    o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + .14);
    setTimeout(() => c.close(), 400);
  }catch(e){}
}

function abrirWalkie(){
  const c = conversaPor(atual);
  const tela = document.createElement('div');
  tela.className = 'tela-cheia walkie';
  tela.id = 'telaWalkie';
  tela.innerHTML = `
    <div class="w-topo">
      <button class="icone" id="wFechar">✕</button>
      <div><b>📻 Walkie-talkie</b><div class="w-sub">com ${c.nome}</div></div>
    </div>
    <div class="w-meio">
      <div class="w-luz" id="wLuz"></div>
      <div class="w-status" id="wStatus">Toca no botão pra falar</div>
      <button class="w-botao" id="wBotao">🎙️<span>FALAR</span></button>
      <div class="w-dica">Toca pra começar, toca de novo pra mandar. O recado fica na conversa também.</div>
    </div>`;
  document.body.appendChild(tela);

  const botao = $('#wBotao'), status = $('#wStatus'), luz = $('#wLuz');
  let relogio = null;

  const desligarLuz = () => {
    clearInterval(relogio);
    luz.classList.remove('on'); botao.classList.remove('falando');
    botao.querySelector('span').textContent = 'FALAR';
  };

  botao.addEventListener('click', () => alternarGravacao({
    aoComecar(){
      pipoco(true);
      luz.classList.add('on'); botao.classList.add('falando');
      botao.querySelector('span').textContent = 'MANDAR';
      relogio = setInterval(() => {
        if(gravando()) status.textContent = `NO AR! 🔴 ${segundosGravados().toFixed(1)}s`;
      }, 100);
    },
    async aoTerminar(blob, seg){
      desligarLuz();
      status.textContent = 'Mandando... 📡';
      pipoco(false);
      await mandarAudio(blob, seg);
      const url = await urlDoAudio(dados.msgs[atual][dados.msgs[atual].length - 1]);
      if(url){ const a = new Audio(url); a.play().catch(()=>{}); }
      status.textContent = 'Mandado! Toca pra falar de novo 🎉';
    },
    aoFalhar(){ desligarLuz(); status.textContent = 'Não deu pra usar o microfone 😕'; }
  }));

  $('#wFechar').addEventListener('click', () => { if(gravando()) pararGravacao(true); tela.remove(); });
}

/* =========================================================
   Teste do microfone: diz passo a passo onde travou, em vez
   de o áudio simplesmente não aparecer.
   ========================================================= */
async function testarMicrofone(){
  const caixa = document.getElementById('passosMic');
  if(!caixa) return;
  caixa.innerHTML = '';
  const passo = (txt, estado) => caixa.insertAdjacentHTML('beforeend', `<div class="passo ${estado}">${txt}</div>`);

  /* 1. a página está no https? */
  if(!window.isSecureContext){
    passo('1. ❌ A página não está no endereço seguro (https). O navegador nunca vai deixar gravar assim.', 'ruim');
    passo('Abre o site pelo link https://willianwiab.github.io/contas-wen/falar-com-os-pais/', 'aviso');
    return;
  }
  passo('1. Página segura (https) ✅', 'bom');

  /* 2. o navegador tem microfone? */
  if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia){
    passo('2. ❌ Este navegador não tem gravação de som. Tenta pelo Chrome, Edge ou Safari atualizado.', 'ruim');
    return;
  }
  passo('2. O navegador sabe gravar ✅', 'bom');

  /* 3. dá pra usar o microfone? */
  let trilha;
  try{
    trilha = await navigator.mediaDevices.getUserMedia({ audio:true });
    passo('3. Microfone liberado ✅ (' + (trilha.getAudioTracks()[0]?.label || 'microfone') + ')', 'bom');
  }catch(e){
    passo('3. ❌ Não consegui abrir o microfone: <b>' + e.name + '</b>', 'ruim');
    passo(e.name === 'NotAllowedError'
      ? 'O navegador está bloqueando. No cadeadinho do endereço, põe o microfone em "Permitir" e recarrega.'
      : e.name === 'NotFoundError' ? 'Este computador não tem microfone ligado.'
      : e.name === 'NotReadableError' ? 'Outro programa (chamada, gravador) está segurando o microfone.'
      : 'Mensagem do navegador: ' + e.message, 'aviso');
    return;
  }

  /* 4. grava 2 segundos */
  let gravadorTeste, pedacinhos = [];
  try{
    const tipo = tipoSuportado();
    passo('4. Formato usado: ' + (tipo || 'o padrão do navegador'), 'bom');
    gravadorTeste = tipo ? new MediaRecorder(trilha, { mimeType:tipo }) : new MediaRecorder(trilha);
  }catch(e){
    passo('4. ❌ Este navegador não deixou criar o gravador: ' + e.name, 'ruim');
    trilha.getTracks().forEach(t => t.stop());
    return;
  }

  const blob = await new Promise(res => {
    gravadorTeste.ondataavailable = ev => { if(ev.data && ev.data.size) pedacinhos.push(ev.data); };
    gravadorTeste.onstop = () => res(new Blob(pedacinhos, { type: gravadorTeste.mimeType || 'audio/webm' }));
    gravadorTeste.start();
    passo('5. Gravando 2 segundos... fala alguma coisa! 🎤', 'aviso');
    setTimeout(() => { try{ gravadorTeste.stop(); }catch(e){} }, 2000);
  });
  trilha.getTracks().forEach(t => t.stop());

  if(!blob.size){
    passo('6. ❌ A gravação saiu vazia (0 bytes). O microfone abriu mas não capturou som.', 'ruim');
    return;
  }
  passo('6. Gravou ' + Math.round(blob.size / 1024) + ' KB ✅', 'bom');

  /* 7. consegue guardar no aparelho? */
  const idTeste = 'teste-mic';
  const guardou = await guardarAudio(idTeste, blob);
  if(guardou){
    const devolta = await pegarAudio(idTeste);
    passo(devolta ? '7. Guardou e leu de volta do aparelho ✅' : '7. ❌ Guardou mas não conseguiu ler de volta', devolta ? 'bom' : 'ruim');
    apagarAudio(idTeste);
  }else{
    passo('7. ⚠️ O cofre do aparelho (IndexedDB) não funcionou — os áudios vão junto da mensagem, e os grandes podem não caber.', 'aviso');
  }

  /* 8. toca de volta */
  try{
    const som = new Audio(URL.createObjectURL(blob));
    await som.play();
    passo('8. Tocando o que gravou 🔊 — se você ouviu, está tudo certo!', 'bom');
  }catch(e){
    passo('8. ⚠️ Gravou, mas o navegador não deixou tocar sozinho (' + e.name + '). Toca no ▶ do balão.', 'aviso');
  }
}
