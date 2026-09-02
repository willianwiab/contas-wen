/* =========================================================
   turma-socorro.js — 🚨 GENTE, TÔ EM PERIGO

   O QUE ISTO É, E O QUE NÃO É.

   Isto avisa a TURMA. Só isso. Não chama a polícia, não chama
   o SAMU, não chama a tua mãe. Os teus colegas podem estar com
   o celular no silencioso, sem bateria, ou sem celular nenhum
   — o app inteiro foi feito lembrando disso.

   Então em TODA tela aqui está escrito, grande, que numa
   emergência de verdade o certo é gritar por um adulto e ligar
   190 / 192. Este botão é o "além disso", nunca o "em vez de".

   Duas decisões que valem explicar:

   1. São DOIS toques pra mandar (o botão e depois o vermelhão).
      Um toque só ia disparar sozinho no bolso, e um alarme que
      grita à toa é um alarme que todo mundo aprende a ignorar.

   2. A localização vai SÓ enquanto o pedido está de pé, e para
      de ir quando tu aperta "já tô bem" ou depois de 2 horas.
      Não é um rastreador — é um socorro.
   ========================================================= */

const SOCORRO_DURA = 2 * 3600000;      // 2 horas e o pedido vence
const SOCORRO_PISCA = 25000;           // manda a localização de novo a cada 25s

let relogioSocorro = null;
let meuSocorro = null;                 // o id do pedido que EU mandei
let sireneTocando = false;
let audioSirene = null;
let jaGritei = {};                     // pra não repetir a notificação do mesmo pedido

/* ---------- quem está pedindo socorro agora ---------- */
function socorrosDePe(){
  const agora = Date.now();
  return dados.avisos.filter(a =>
    a.tipo === 'socorro' && !a.fim && (agora - a.ts) < SOCORRO_DURA);
}
const meuPedidoDePe = () => socorrosDePe().find(a => a.de === dados.eu);

/* =========================================================
   PEDIR SOCORRO
   ========================================================= */
function abrirSocorro(){
  /* pede o direito de avisar ANTES da emergência: no meio dela
     ninguém vai parar pra responder caixinha de permissão */
  if('Notification' in window && Notification.permission === 'default')
    Notification.requestPermission().catch(() => {});
  desenharTelaSocorro();
  mostrar('socorro');
}

function desenharTelaSocorro(){
  const meu = meuPedidoDePe();
  $('#socorroAntes').classList.toggle('escondido', !!meu);
  $('#socorroDepois').classList.toggle('escondido', !meu);
  if(meu) desenharMeuSocorro(meu);
}

async function mandarSocorro(){
  if(!naTurma()){ aviso('Tu precisa estar numa turma pra avisar a turma 😊'); return; }
  if(meuPedidoDePe()){ desenharTelaSocorro(); return; }

  const a = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2,6),
    de: dados.eu, ts: Date.now(), tipo:'socorro',
    txt: 'Preciso de ajuda AGORA', vou: {}, v: 1
  };
  meuSocorro = a.id;
  dados.avisos.unshift(a); salvar();
  desenharTelaSocorro(); desenharMural();
  tocarSirene();
  mandarPraTurma(a);            /* vai na hora, sem esperar o GPS */
  aviso('🚨 Avisando a turma...', 5000);

  /* o lugar vem depois e vai junto na próxima batida: primeiro o
     aviso sai, senão um GPS lento seguraria o socorro inteiro */
  seguirMandandoOLugar();
}

function seguirMandandoOLugar(){
  clearInterval(relogioSocorro);
  const bater = async () => {
    const a = meuPedidoDePe();
    if(!a || a.id !== meuSocorro){ clearInterval(relogioSocorro); return; }
    const onde = await ondeEstouAgora(15000);
    if(onde){ a.lugar = onde; a.ultimo = Date.now(); }
    a.v = (a.v || 1) + 1;
    salvar(); desenharTelaSocorro(); mandarPraTurma(a);
  };
  bater();
  relogioSocorro = setInterval(bater, SOCORRO_PISCA);
}

/* aqui a posição tem que ser a de AGORA: uma guardada de 10 minutos
   atrás manda a turma pro lugar errado */
function ondeEstouAgora(limite){
  return new Promise(res => {
    if(!navigator.geolocation) return res(null);
    let pronto = false;
    const acabou = v => { if(!pronto){ pronto = true; res(v); } };
    setTimeout(() => acabou(null), limite || 15000);
    navigator.geolocation.getCurrentPosition(
      pos => acabou({ lat:+pos.coords.latitude.toFixed(5), lon:+pos.coords.longitude.toFixed(5),
                      erro: Math.round(pos.coords.accuracy || 0) }),
      () => acabou(null), { enableHighAccuracy:true, timeout: limite || 15000, maximumAge: 0 });
  });
}

function jaEstouBem(){
  const a = meuPedidoDePe();
  if(!a) return;
  if(!confirm('Marcar que tu já está bem?\n\nO alarme para no celular de todo mundo.')) return;
  a.fim = Date.now();
  a.v = (a.v || 1) + 1;
  clearInterval(relogioSocorro);
  meuSocorro = null;
  pararSirene();
  salvar(); desenharTelaSocorro(); desenharMural(); mandarPraTurma(a);
  aviso('💚 Que bom! A turma foi avisada de que tu está bem', 6000);
}

function desenharMeuSocorro(a){
  const indo = Object.entries(a.vou || {}).filter(([, v]) => v === 'indo').map(([n]) => n);
  const lugar = a.lugar
    ? `<b>📍 Mandei onde eu estou</b><small>${a.lugar.lat.toFixed(4)}, ${a.lugar.lon.toFixed(4)}
       ${a.ultimo ? '· atualizado ' + hora(a.ultimo) : ''}</small>`
    : `<b>📍 Procurando onde tu está...</b><small>Se não achar, avisa a turma mesmo assim
       — o pedido já saiu.</small>`;
  $('#meuSocorroCaixa').innerHTML = `
    <div class="sos-lugar">${lugar}</div>
    <div class="sos-indo">
      ${indo.length
        ? `<b>🏃 ${indo.length} vindo:</b> ${indo.map(escapar).join(', ')}`
        : '<b>Ninguém respondeu ainda.</b><br><small>Não fica esperando: chama um adulto perto de ti.</small>'}
    </div>`;
}

/* =========================================================
   RECEBER O SOCORRO DE OUTRA PESSOA
   ========================================================= */
function olharOsSocorros(){
  const dePe = socorrosDePe().filter(a => a.de !== dados.eu);
  const faixa = $('#faixaSocorro');
  if(!faixa) return;

  faixa.classList.toggle('escondido', !dePe.length);
  document.body.classList.toggle('tem-socorro', !!dePe.length);
  if(!dePe.length){ pararSirene(); return; }

  faixa.innerHTML = dePe.map(a => {
    const meu = (a.vou || {})[dados.eu];
    const min = Math.round((Date.now() - a.ts) / 60000);
    return `
      <div class="sos-faixa">
        <div class="sos-topo">
          <span class="sos-sino">🚨</span>
          <div><b>${escapar(a.de)} está pedindo ajuda!</b>
            <small>${min < 1 ? 'agora mesmo' : 'há ' + min + ' min'}</small></div>
        </div>
        ${a.lugar ? `<a class="bt sos-mapa" target="_blank" rel="noopener noreferrer"
           href="https://www.google.com/maps/search/?api=1&query=${a.lugar.lat},${a.lugar.lon}">
           📍 Ver onde ${escapar(a.de)} está</a>`
          : '<p class="sos-semlugar">Ainda não mandou o lugar.</p>'}
        <div class="sos-bts">
          <button class="bt ${meu === 'indo' ? 'ok' : ''}" data-vouajudar="${a.id}">
            ${meu === 'indo' ? '✅ Tu disse que vai' : '🏃 Tô indo'}</button>
          <a class="bt sos-190" href="tel:190">📞 190</a>
        </div>
        <p class="sos-adulto">⚠️ <b>Conta pra um adulto AGORA</b> — tua mãe, teu pai, um
        professor, um vizinho. A turma sozinha não dá conta.</p>
      </div>`;
  }).join('');

  faixa.querySelectorAll('[data-vouajudar]').forEach(b =>
    b.addEventListener('click', () => euVouAjudar(b.dataset.vouajudar)));

  /* grita uma vez por pedido: sirene, chacoalhada e aviso no celular */
  dePe.forEach(a => {
    if(jaGritei[a.id]) return;
    jaGritei[a.id] = true;
    tocarSirene();
    try{ navigator.vibrate && navigator.vibrate([400,150,400,150,400]); }catch(e){}
    avisarNoCelular(a);
  });
}

function avisarNoCelular(a){
  try{
    if(!('Notification' in window) || Notification.permission !== 'granted') return;
    const n = new Notification('🚨 ' + a.de + ' está pedindo ajuda!', {
      body: 'Abre o Fala, Turma pra ver onde. E conta pra um adulto agora.',
      tag: 'socorro-' + a.id, requireInteraction: true, icon: 'icone-192.png'
    });
    n.onclick = () => { window.focus(); n.close(); };
  }catch(e){}
}

function euVouAjudar(id){
  const a = achar(id);
  if(!a) return;
  a.vou = a.vou || {};
  if(a.vou[dados.eu] === 'indo') delete a.vou[dados.eu];
  else a.vou[dados.eu] = 'indo';
  a.v = (a.v || 1) + 1;
  salvar(); olharOsSocorros(); desenharMural(); mandarPraTurma(a);
  if(a.vou[dados.eu] === 'indo'){
    pararSirene();
    alert('Tu disse que vai ajudar. Antes de sair:\n\n' +
          '1. AVISA UM ADULTO AGORA — tua mãe, teu pai, um professor.\n' +
          '2. Não vai sozinho.\n' +
          '3. Se for coisa grave, liga 190 (polícia) ou 192 (ambulância).\n\n' +
          'Chegar junto é bom. Chegar junto COM um adulto é melhor.');
  }
}

/* =========================================================
   A SIRENE
   Alta de propósito. Alguns navegadores só deixam tocar som
   depois que a pessoa encostou na tela — quando isso acontece,
   aparece um botão pra tocar na mão.
   ========================================================= */
function tocarSirene(){
  if(sireneTocando) return;
  try{
    const Contexto = window.AudioContext || window.webkitAudioContext;
    if(!Contexto) return;
    audioSirene = new Contexto();
    if(audioSirene.state === 'suspended'){
      audioSirene.resume().catch(() => {});
      mostrarBotaoDeSom(true);
    }
    const osc = audioSirene.createOscillator();
    const vol = audioSirene.createGain();
    osc.type = 'sawtooth';
    const t0 = audioSirene.currentTime;
    /* sobe e desce, que é o que o ouvido não consegue ignorar */
    for(let i = 0; i < 240; i++){
      osc.frequency.setValueAtTime(i % 2 ? 1180 : 640, t0 + i * 0.45);
    }
    vol.gain.setValueAtTime(0.85, t0);
    osc.connect(vol); vol.connect(audioSirene.destination);
    osc.start(t0);
    audioSirene.osc = osc;
    sireneTocando = true;
    setTimeout(() => { if(audioSirene && audioSirene.state === 'running') mostrarBotaoDeSom(false); }, 500);
  }catch(e){ mostrarBotaoDeSom(true); }
}

function pararSirene(){
  sireneTocando = false;
  mostrarBotaoDeSom(false);
  try{
    if(audioSirene){
      if(audioSirene.osc) audioSirene.osc.stop();
      audioSirene.close();
    }
  }catch(e){}
  audioSirene = null;
}

function mostrarBotaoDeSom(precisa){
  const bt = $('#btTocarSirene');
  if(bt) bt.classList.toggle('escondido', !precisa);
}
