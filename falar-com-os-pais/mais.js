/* =========================================================
   mais.js — coisas que viram mensagem na conversa:
   responder citando, cápsula do tempo, lugar (GPS),
   figurinhas de som e cronômetro combinado.
   ========================================================= */

/* ---------- RESPONDER CITANDO ---------- */
let respondendo = null;   // índice da mensagem que está sendo respondida

function responderMsg(indice){
  const m = dados.msgs[atual][indice];
  if(!m) return;
  respondendo = { txt: textoDe(m).slice(0,120), de: m.de };
  desenharRespondendo();
  const e = document.getElementById('entrada');
  if(e) e.focus();
}
function pararDeResponder(){ respondendo = null; desenharRespondendo(); }

function desenharRespondendo(){
  const caixa = document.getElementById('barraResposta');
  if(!caixa) return;
  caixa.classList.toggle('on', !!respondendo);
  caixa.innerHTML = respondendo
    ? `<div class="resp-linha" style="background:${PESSOAS[respondendo.de].cor}"></div>
       <div class="resp-txt"><b>${PESSOAS[respondendo.de].curto}</b><span>${escapar(respondendo.txt)}</span></div>
       <button id="respTirar" title="Cancelar">✕</button>` : '';
  const bt = document.getElementById('respTirar');
  if(bt) bt.addEventListener('click', pararDeResponder);
}

function citacaoNoBalao(m){
  if(!m.resp) return '';
  return `<div class="citacao" style="border-color:${PESSOAS[m.resp.de].cor}">
            <b style="color:${PESSOAS[m.resp.de].cor}">${PESSOAS[m.resp.de].curto}</b>
            <span>${escapar(m.resp.txt)}</span>
          </div>`;
}

/* ---------- CÁPSULA DO TEMPO ---------- */
function abrirNovaCapsula(){
  const daqui = new Date(Date.now() + 30 * 86400000).toISOString().slice(0,10);
  const tela = document.createElement('div');
  tela.className = 'fundo-modal aberto'; tela.id = 'modalCapsula';
  tela.innerHTML = `
    <div class="modal">
      <h2>🕰️ Cápsula do tempo</h2>
      <p class="sub">Escreve um recado que fica <b>trancado</b> até o dia que tu escolher. Ninguém consegue ler antes!</p>
      <div class="campo-form">
        <label>O recado secreto</label>
        <input id="capTxt" placeholder="Ex.: parabéns, mana! Espero que tu goste da surpresa" maxlength="200">
      </div>
      <div class="campo-form">
        <label>Abrir no dia</label>
        <input type="date" id="capData" value="${daqui}">
      </div>
      <div class="acoes">
        <button class="btn neutro" id="capCancelar">Cancelar</button>
        <button class="btn principal" id="capCriar">Trancar 🔒</button>
      </div>
    </div>`;
  document.body.appendChild(tela);
  const fecha = () => tela.remove();
  tela.addEventListener('click', e => { if(e.target.id === 'modalCapsula') fecha(); });
  document.getElementById('capCancelar').addEventListener('click', fecha);
  document.getElementById('capTxt').focus();
  document.getElementById('capCriar').addEventListener('click', () => {
    const txt = document.getElementById('capTxt').value.trim();
    const dia = document.getElementById('capData').value;
    if(!txt){ toast('Escreve o recado primeiro 😊'); return; }
    if(!dia || dia <= new Date().toISOString().slice(0,10)){ toast('Escolhe um dia lá na frente ⏳'); return; }
    mandarEspecial({ tipo:'capsula', txt, abrirEm: dia });
    fecha();
    toast('Cápsula trancada! 🔒');
  });
}

function capsulaAberta(m){ return new Date().toISOString().slice(0,10) >= m.abrirEm; }

function balaoCapsula(m){
  const [a, me, d] = m.abrirEm.split('-');
  const dataBonita = `${d}/${me}/${a}`;
  if(!capsulaAberta(m)){
    const faltam = Math.ceil((new Date(m.abrirEm) - new Date().setHours(0,0,0,0)) / 86400000);
    return `<div class="capsula fechada">
      <div class="cap-emoji">🕰️🔒</div>
      <b>Cápsula do tempo</b>
      <span>abre em ${dataBonita}${faltam > 0 ? ` — faltam ${faltam} dia${faltam > 1 ? 's' : ''}` : ''}</span>
    </div>`;
  }
  return `<div class="capsula aberta">
    <div class="cap-emoji">🕰️✨</div>
    <b>Cápsula aberta!</b>
    <span class="cap-txt">${escapar(m.txt)}</span>
    <small>foi trancada até ${dataBonita}</small>
  </div>`;
}

/* Avisa quando alguma cápsula abre hoje. */
function verCapsulas(){
  const hoje = new Date().toISOString().slice(0,10);
  let achou = 0;
  Object.values(dados.msgs).forEach(lista => lista.forEach(m => {
    if(m.tipo === 'capsula' && m.abrirEm === hoje && !m.avisou){ m.avisou = true; achou++; }
  }));
  if(achou){
    salvar();
    toast(`🕰️ ${achou} cápsula do tempo abriu hoje!`, 5000);
    avisar('🕰️ Cápsula do tempo aberta!', 'Tem recado guardado esperando ser lido 🎉', 'capsula');
  }
}

/* ---------- LUGAR (GPS) ---------- */
function mandarLugar(){
  if(!navigator.geolocation){ toast('Este aparelho não tem GPS 😕'); return; }
  toast('Procurando onde tu está... 🛰️', 4000);
  navigator.geolocation.getCurrentPosition(
    pos => {
      mandarEspecial({ tipo:'lugar', lat: +pos.coords.latitude.toFixed(5),
        lon: +pos.coords.longitude.toFixed(5), prec: Math.round(pos.coords.accuracy) });
      toast('Mandei onde tu está 📍');
    },
    err => {
      toast(err.code === 1 ? 'Precisa apertar "Permitir" pro lugar 📍'
          : err.code === 3 ? 'Demorou demais pra achar o sinal 🛰️'
          : 'Não consegui achar o lugar 😕', 5000);
    },
    { enableHighAccuracy:true, timeout:12000, maximumAge:30000 }
  );
}

function balaoLugar(m){
  const link = `https://www.openstreetmap.org/?mlat=${m.lat}&mlon=${m.lon}#map=17/${m.lat}/${m.lon}`;
  return `<div class="lugar">
    <div class="lug-pino">📍</div>
    <div class="lug-txt"><b>Cheguei aqui!</b>
      <span>${m.lat}, ${m.lon} ${m.prec ? `(mais ou menos ${m.prec} m)` : ''}</span></div>
    <a class="lug-bt" href="${link}" target="_blank" rel="noopener">Ver no mapa ↗</a>
  </div>`;
}

/* ---------- FIGURINHAS DE SOM ---------- */
const SONS = {
  buzina : { emoji:'📢', nome:'Buzina' },
  palmas : { emoji:'👏', nome:'Palmas' },
  tambor : { emoji:'🥁', nome:'Tambor' },
  risada : { emoji:'😂', nome:'Risada' },
  sino   : { emoji:'🔔', nome:'Sino'   },
  laser  : { emoji:'🚀', nome:'Foguete'},
  tada   : { emoji:'🎉', nome:'Tchanam'},
  gota   : { emoji:'💧', nome:'Gota'   }
};

function tocarSom(qual){
  try{
    const c = new (window.AudioContext || window.webkitAudioContext)();
    const t0 = c.currentTime;
    const nota = (tipo, freq, ini, dur, vol = .12, fim) => {
      const o = c.createOscillator(), g = c.createGain();
      o.type = tipo; o.frequency.setValueAtTime(freq, t0 + ini);
      if(fim) o.frequency.exponentialRampToValueAtTime(fim, t0 + ini + dur);
      g.gain.setValueAtTime(.0001, t0 + ini);
      g.gain.exponentialRampToValueAtTime(vol, t0 + ini + .01);
      g.gain.exponentialRampToValueAtTime(.0001, t0 + ini + dur);
      o.connect(g); g.connect(c.destination); o.start(t0 + ini); o.stop(t0 + ini + dur + .02);
    };
    const chiado = (ini, dur, vol = .18) => {
      const n = Math.floor(c.sampleRate * dur);
      const buf = c.createBuffer(1, n, c.sampleRate), d = buf.getChannelData(0);
      for(let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
      const f = c.createBufferSource(), g = c.createGain();
      f.buffer = buf; g.gain.value = vol;
      f.connect(g); g.connect(c.destination); f.start(t0 + ini);
    };

    if(qual === 'buzina'){ nota('square', 320, 0, .5, .1); nota('square', 240, 0, .5, .1); }
    if(qual === 'palmas'){ [0,.13,.26,.4,.52].forEach(t => chiado(t, .1, .22)); }
    if(qual === 'tambor'){ nota('sine', 160, 0, .25, .3, 55); chiado(.24, .12, .1); }
    if(qual === 'risada'){ [0,.16,.32,.48].forEach((t,i) => nota('sawtooth', 300 + i*30, t, .13, .09, 200)); }
    if(qual === 'sino'){ nota('triangle', 1180, 0, .9, .12); nota('triangle', 1760, 0, .7, .06); }
    if(qual === 'laser'){ nota('sawtooth', 1200, 0, .45, .1, 120); }
    if(qual === 'tada'){ [523,659,784,1047].forEach((f,i) => nota('triangle', f, i*.09, .5, .1)); }
    if(qual === 'gota'){ nota('sine', 900, 0, .22, .14, 250); }
    setTimeout(() => c.close(), 1600);
  }catch(e){}
}

function abrirSons(){
  const antigo = document.getElementById('telaSons');
  if(antigo){ antigo.remove(); return; }
  const tela = document.createElement('div');
  tela.className = 'sons'; tela.id = 'telaSons';
  tela.innerHTML = Object.entries(SONS).map(([k,s]) =>
    `<button data-som="${k}"><span>${s.emoji}</span>${s.nome}</button>`).join('');
  document.querySelector('.barra').insertAdjacentElement('beforebegin', tela);
  tela.querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
    tocarSom(b.dataset.som);
    tela.remove();
    mandarEspecial({ tipo:'som', som:b.dataset.som });
  }));
}

function balaoSom(m, indice){
  const s = SONS[m.som] || { emoji:'🔊', nome:'Som' };
  return `<div class="som-msg">
    <button class="bt-play" data-somtocar="${indice}">${s.emoji}</button>
    <div><b>${s.nome}</b><small>toca pra ouvir de novo</small></div>
  </div>`;
}

/* ---------- CRONÔMETRO COMBINADO ---------- */
function abrirCronometro(){
  const tela = document.createElement('div');
  tela.className = 'fundo-modal aberto'; tela.id = 'modalTimer';
  tela.innerHTML = `
    <div class="modal">
      <h2>⏱️ Cronômetro combinado</h2>
      <p class="sub">Combina um tempo com a família. Quando acabar, ele toca o alarme.</p>
      <div class="campo-form">
        <label>Pra quê?</label>
        <input id="tmNome" placeholder="Ex.: escovar os dentes" maxlength="40">
      </div>
      <div class="campo-form">
        <label>Quanto tempo</label>
        <div class="tm-opcoes">
          ${[1,2,5,10,15,30].map((n,i) => `<button class="tm-op ${i===1?'on':''}" data-min="${n}">${n} min</button>`).join('')}
        </div>
      </div>
      <div class="acoes">
        <button class="btn neutro" id="tmCancelar">Cancelar</button>
        <button class="btn principal" id="tmCriar">Começar ⏱️</button>
      </div>
    </div>`;
  document.body.appendChild(tela);
  let minutos = 2;
  tela.querySelectorAll('.tm-op').forEach(b => b.addEventListener('click', () => {
    minutos = +b.dataset.min;
    tela.querySelectorAll('.tm-op').forEach(o => o.classList.toggle('on', o === b));
  }));
  const fecha = () => tela.remove();
  tela.addEventListener('click', e => { if(e.target.id === 'modalTimer') fecha(); });
  document.getElementById('tmCancelar').addEventListener('click', fecha);
  document.getElementById('tmCriar').addEventListener('click', () => {
    mandarEspecial({ tipo:'timer', nome: document.getElementById('tmNome').value.trim() || 'Cronômetro',
      min: minutos, fim: Date.now() + minutos * 60000 });
    fecha();
  });
}

function balaoTimer(m, indice){
  const falta = Math.max(0, Math.round((m.fim - Date.now()) / 1000));
  const acabou = falta === 0;
  return `<div class="timer ${acabou ? 'acabou' : ''}">
    <div class="tm-relogio" data-timer="${indice}">${acabou ? '⏰ acabou!' : formataTempo(falta)}</div>
    <div class="tm-nome">${escapar(m.nome)} • ${m.min} min</div>
  </div>`;
}
const formataTempo = s => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

/* Faz os cronômetros andarem sem redesenhar a conversa inteira. */
setInterval(() => {
  document.querySelectorAll('[data-timer]').forEach(el => {
    const m = dados.msgs[atual] && dados.msgs[atual][+el.dataset.timer];
    if(!m || m.tipo !== 'timer') return;
    const falta = Math.max(0, Math.round((m.fim - Date.now()) / 1000));
    if(falta === 0){
      if(el.textContent !== '⏰ acabou!'){
        el.textContent = '⏰ acabou!';
        el.parentElement.classList.add('acabou');
        if(!m.tocou){
          m.tocou = true; salvar();
          tocarSom('tada'); tocarSom('sino');
          toast(`⏰ Acabou o tempo: ${m.nome}!`, 5000);
          avisar('⏰ Acabou o tempo!', m.nome, 'timer');
        }
      }
    }else el.textContent = formataTempo(falta);
  });
}, 1000);

/* ---------- ajudante: manda qualquer mensagem especial ---------- */
function mandarEspecial(extra){
  const msg = Object.assign({ de: autor, ts: Date.now() }, extra);
  if(respondendo){ msg.resp = respondendo; pararDeResponder(); }
  dados.msgs[atual].push(msg);
  dados.visto[atual] = Date.now();
  dados.presenca[autor] = Date.now();
  animar = dados.msgs[atual].length - 1;
  salvar(); blim(true);
  mandarPraNuvem(atual, msg);
  desenharMensagens(); desenharContatos(); atualizarStatusTopo();
}

/* =========================================================
   SOS — o pedido de ajuda. Vai pra todas as conversas da
   pessoa de uma vez e, no aparelho de quem recebe, toca
   alto MESMO com o som desligado ou no modo soneca: é o
   único aviso do site que passa por cima disso.
   ========================================================= */

let alarmeTocando = null;

function tocarAlarme(){
  pararAlarme();
  try{
    const c = new (window.AudioContext || window.webkitAudioContext)();
    const tocarUm = () => {
      const t = c.currentTime;
      [880, 1320].forEach((freq, i) => {
        const o = c.createOscillator(), g = c.createGain();
        o.type = 'square'; o.frequency.setValueAtTime(freq, t + i * .3);
        g.gain.setValueAtTime(.0001, t + i * .3);
        g.gain.exponentialRampToValueAtTime(.25, t + i * .3 + .02);
        g.gain.exponentialRampToValueAtTime(.0001, t + i * .3 + .28);
        o.connect(g); g.connect(c.destination);
        o.start(t + i * .3); o.stop(t + i * .3 + .3);
      });
    };
    tocarUm();
    alarmeTocando = { ctx: c, relogio: setInterval(tocarUm, 900) };
    if(navigator.vibrate) navigator.vibrate([300,150,300,150,300]);
    setTimeout(pararAlarme, 20000);   // não fica tocando pra sempre
  }catch(e){}
}
function pararAlarme(){
  if(!alarmeTocando) return;
  clearInterval(alarmeTocando.relogio);
  try{ alarmeTocando.ctx.close(); }catch(e){}
  alarmeTocando = null;
}

/* ---------- mandar o pedido de ajuda ---------- */
function pedirAjuda(){
  if(!confirm('🆘 Mandar um pedido de ajuda?\n\nTodo mundo da família vai receber um alarme alto com o lugar onde tu está.')) return;
  toast('Mandando pedido de ajuda... 🆘', 4000);

  const mandar = lugar => {
    /* Vai só pra conversa da Família: assim todo mundo recebe uma vez só.
       Mandar pra cada dupla fazia o alarme tocar duas vezes no mesmo aparelho. */
    const sos = { tipo:'sos', de: dados.euSou, ts: Date.now(), lugar };
    dados.msgs.familia.push(sos);
    dados.visto.familia = Date.now();
    mandarPraNuvem('familia', sos);
    salvar(); desenharContatos();
    if(atual) desenharMensagens();
    toast('Pedido de ajuda enviado 🆘', 5000);
  };

  if(navigator.geolocation){
    navigator.geolocation.getCurrentPosition(
      pos => mandar({ lat:+pos.coords.latitude.toFixed(5), lon:+pos.coords.longitude.toFixed(5) }),
      () => mandar(null),
      { enableHighAccuracy:true, timeout:8000 }
    );
  }else mandar(null);
}

/* ---------- quando chega um pedido de ajuda ---------- */
function chegouPedidoDeAjuda(msg){
  if(document.getElementById('telaSos')) return;   // já está tocando
  tocarAlarme();
  const p = PESSOAS[msg.de] || PESSOAS.jojo;
  const link = msg.lugar ? `https://www.openstreetmap.org/?mlat=${msg.lugar.lat}&mlon=${msg.lugar.lon}#map=17/${msg.lugar.lat}/${msg.lugar.lon}` : '';
  const tela = document.createElement('div');
  tela.className = 'tela-cheia sos-tela';
  tela.id = 'telaSos';
  tela.innerHTML = `
    <div class="sos-meio">
      <div class="sos-sino">🆘</div>
      <h2>${p.nome} precisa de ajuda!</h2>
      <p class="lig-txt">${hora(msg.ts)}${msg.lugar ? '' : ' — sem o lugar (o GPS não respondeu)'}</p>
      <div class="lig-botoes col">
        ${link ? `<a class="lig-bt ok grande" href="${link}" target="_blank" rel="noopener">🗺️ Ver onde está</a>` : ''}
        <button class="lig-bt grande" id="sosIndo">🏃 Estou indo!</button>
        <button class="lig-bt desligar" id="sosFechar">Silenciar</button>
      </div>
    </div>`;
  document.body.appendChild(tela);
  document.getElementById('sosFechar').addEventListener('click', () => { pararAlarme(); tela.remove(); });
  document.getElementById('sosIndo').addEventListener('click', () => {
    pararAlarme(); tela.remove();
    const conversa = CONVERSAS.find(c => c.pessoa === msg.de) || CONVERSAS.find(c => c.id === 'familia');
    if(!conversa) return;
    const resposta = { t:'🏃 Estou indo te ajudar!', de: dados.euSou, ts: Date.now() };
    dados.msgs[conversa.id].push(resposta);
    salvar(); mandarPraNuvem(conversa.id, resposta);
    desenharContatos(); if(atual === conversa.id) desenharMensagens();
    toast('Avisei que tu está indo 🏃');
  });
  avisar('🆘 ' + p.nome + ' precisa de ajuda!', msg.lugar ? 'Toca pra ver onde está' : 'Sem o lugar', 'sos');
}

function balaoSos(m){
  const link = m.lugar ? `https://www.openstreetmap.org/?mlat=${m.lugar.lat}&mlon=${m.lugar.lon}#map=17/${m.lugar.lat}/${m.lugar.lon}` : '';
  return `<div class="sos-balao">
    <b>🆘 Pedido de ajuda</b>
    <span>${m.lugar ? `${m.lugar.lat}, ${m.lugar.lon}` : 'sem o lugar'}</span>
    ${link ? `<a class="lug-bt" href="${link}" target="_blank" rel="noopener">🗺️ Ver no mapa</a>` : ''}
  </div>`;
}
