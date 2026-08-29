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
    if(txt.length > 700000){ toast('Áudio grande demais pra guardar aqui 😕'); return; }
    msg.b64 = txt;
  }
  dados.msgs[atual].push(msg);
  dados.visto[atual] = Date.now();
  dados.presenca[autor] = Date.now();
  animar = dados.msgs[atual].length - 1;
  salvar(); blim(autor === 'eu');
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
      <div class="autor-bar" id="wAutor"><span class="rot">Falando como</span></div>
    </div>`;
  document.body.appendChild(tela);

  $('#wAutor').insertAdjacentHTML('beforeend', c.quem.map(p =>
    `<button class="pilula ${p === autor ? 'on' : ''}" data-p="${p}"
      style="${p === autor ? `background:linear-gradient(135deg,${PESSOAS[p].cor},${PESSOAS[p].cor}bb)` : ''}">
      ${PESSOAS[p].emoji} ${PESSOAS[p].curto}</button>`).join(''));
  tela.querySelectorAll('#wAutor .pilula').forEach(b => b.addEventListener('click', () => {
    autor = b.dataset.p; marcarPresenca(autor);
    tela.querySelectorAll('#wAutor .pilula').forEach(o => {
      const on = o.dataset.p === autor;
      o.classList.toggle('on', on);
      o.style.background = on ? `linear-gradient(135deg,${PESSOAS[autor].cor},${PESSOAS[autor].cor}bb)` : '';
    });
  }));

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
