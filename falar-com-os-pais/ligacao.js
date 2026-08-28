/* =========================================================
   ligacao.js — ligação de áudio de verdade entre dois
   aparelhos, sem servidor nenhum (WebRTC + código na mão).
   Como não existe servidor pra avisar o outro lado, os dois
   trocam um "código de convite" copiando e colando.
   ========================================================= */

const SERVIDORES = { iceServers: [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' }
]};

let pc = null, meuAudio = null, relogioLig = null, segundosLig = 0, mudo = false;

/* Empacota o convite num texto que dá pra copiar. */
function empacotar(obj){
  return 'FAMILIA1.' + btoa(unescape(encodeURIComponent(JSON.stringify(obj))));
}
function desempacotar(txt){
  try{
    const limpo = (txt || '').trim().replace(/\s+/g,'');
    if(!limpo.startsWith('FAMILIA1.')) return null;
    return JSON.parse(decodeURIComponent(escape(atob(limpo.slice(9)))));
  }catch(e){ return null; }
}

/* Espera o navegador achar todos os caminhos de rede. */
function esperarCaminhos(conexao){
  return new Promise(res => {
    if(conexao.iceGatheringState === 'complete') return res();
    const tempo = setTimeout(res, 4000);     // não espera pra sempre
    conexao.addEventListener('icegatheringstatechange', () => {
      if(conexao.iceGatheringState === 'complete'){ clearTimeout(tempo); res(); }
    });
  });
}

function criarConexao(){
  const conexao = new RTCPeerConnection(SERVIDORES);
  conexao.ontrack = ev => {
    let el = document.getElementById('audioDoOutro');
    if(!el){
      el = document.createElement('audio');
      el.id = 'audioDoOutro'; el.autoplay = true;
      document.body.appendChild(el);
    }
    el.srcObject = ev.streams[0];
    el.play().catch(() => {});
  };
  conexao.onconnectionstatechange = () => {
    const e = conexao.connectionState;
    if(e === 'connected') emChamada();
    if(e === 'failed' || e === 'disconnected' || e === 'closed') caiu(e);
  };
  return conexao;
}

function passo(html){ const p = document.getElementById('ligPasso'); if(p) p.innerHTML = html; }
function ligStatus(txt){ const s = document.getElementById('ligStatus'); if(s) s.textContent = txt; }

function emChamada(){
  clearInterval(relogioLig); segundosLig = 0;
  ligStatus('Falando! 🎉');
  passo(`
    <div class="lig-tempo" id="ligTempo">00:00</div>
    <div class="lig-botoes">
      <button class="lig-bt mudo" id="btMudo">🔇 Mudo</button>
      <button class="lig-bt desligar" id="btDesligar">📵 Desligar</button>
    </div>`);
  relogioLig = setInterval(() => {
    segundosLig++;
    const t = document.getElementById('ligTempo');
    if(t) t.textContent = `${String(Math.floor(segundosLig/60)).padStart(2,'0')}:${String(segundosLig%60).padStart(2,'0')}`;
  }, 1000);
  document.getElementById('btMudo').addEventListener('click', e => {
    mudo = !mudo;
    if(meuAudio) meuAudio.getAudioTracks().forEach(t => t.enabled = !mudo);
    e.currentTarget.textContent = mudo ? '🔊 Voltar o som' : '🔇 Mudo';
    e.currentTarget.classList.toggle('on', mudo);
  });
  document.getElementById('btDesligar').addEventListener('click', desligar);
}

function caiu(motivo){
  if(!document.getElementById('telaLigacao')) return;
  ligStatus(motivo === 'failed' ? 'Não deu pra conectar 😕' : 'A ligação caiu');
  clearInterval(relogioLig);
  passo(`<p class="lig-txt">Às vezes a internet do celular não deixa dois aparelhos se acharem sozinhos.
    Tenta de novo no wi-fi de casa, ou manda um recadinho de voz 🎤</p>
    <div class="lig-botoes"><button class="lig-bt desligar" id="btDesligar">Fechar</button></div>`);
  const b = document.getElementById('btDesligar');
  if(b) b.addEventListener('click', desligar);
}

function desligar(){
  clearInterval(relogioLig);
  try{ pc && pc.close(); }catch(e){}
  pc = null;
  if(meuAudio){ meuAudio.getTracks().forEach(t => t.stop()); meuAudio = null; }
  const el = document.getElementById('audioDoOutro'); if(el) el.remove();
  const tela = document.getElementById('telaLigacao'); if(tela) tela.remove();
  mudo = false;
}

/* Caixa com o código, botão de copiar e de compartilhar. */
function caixaCodigo(id, codigo, titulo, dica){
  return `
    <p class="lig-txt"><b>${titulo}</b><br>${dica}</p>
    <textarea class="lig-codigo" id="${id}" readonly>${codigo}</textarea>
    <div class="lig-botoes">
      <button class="lig-bt" data-copiar="${id}">📋 Copiar código</button>
      ${navigator.share ? `<button class="lig-bt" data-partilhar="${id}">📤 Enviar</button>` : ''}
    </div>`;
}
function ligarBotoesCodigo(){
  document.querySelectorAll('[data-copiar]').forEach(b => b.addEventListener('click', () => {
    const t = document.getElementById(b.dataset.copiar);
    navigator.clipboard?.writeText(t.value).then(() => toast('Código copiado! 📋'))
      .catch(() => { t.select(); toast('Copia com Ctrl+C 😊'); });
  }));
  document.querySelectorAll('[data-partilhar]').forEach(b => b.addEventListener('click', () => {
    const t = document.getElementById(b.dataset.partilhar);
    navigator.share({ title:'Código da ligação — Fala, Família!', text:t.value }).catch(() => {});
  }));
}

/* ---------- eu quero chamar ---------- */
async function chamar(){
  ligStatus('Preparando o convite...');
  meuAudio = await pegarMicrofone();
  if(!meuAudio){ ligStatus('Sem microfone, não dá pra ligar 😕'); return; }
  pc = criarConexao();
  meuAudio.getTracks().forEach(t => pc.addTrack(t, meuAudio));
  const oferta = await pc.createOffer({ offerToReceiveAudio:true });
  await pc.setLocalDescription(oferta);
  await esperarCaminhos(pc);

  passo(caixaCodigo('codOferta', empacotar(pc.localDescription),
    '1️⃣ Manda este código pra pessoa',
    'Copia e manda do jeito que tu quiser. Ela vai colar no site dela e te devolver outro código.') + `
    <p class="lig-txt"><b>2️⃣ Cola aqui a resposta que ela te mandar</b></p>
    <textarea class="lig-codigo" id="colaResposta" placeholder="Cola aqui o código de resposta..."></textarea>
    <div class="lig-botoes"><button class="lig-bt ok" id="btConectar">✅ Conectar</button>
      <button class="lig-bt desligar" id="btDesligar">Cancelar</button></div>`);
  ligarBotoesCodigo();
  ligStatus('Esperando a resposta...');
  document.getElementById('btDesligar').addEventListener('click', desligar);
  document.getElementById('btConectar').addEventListener('click', async () => {
    const resp = desempacotar(document.getElementById('colaResposta').value);
    if(!resp){ toast('Esse código não parece certo 🤔'); return; }
    try{
      await pc.setRemoteDescription(resp);
      ligStatus('Conectando... 📞');
    }catch(e){ toast('Não deu pra usar esse código 😕'); }
  });
}

/* ---------- me mandaram um código ---------- */
function atender(){
  ligStatus('Cola o código que te mandaram');
  passo(`
    <p class="lig-txt"><b>1️⃣ Cola aqui o código que te mandaram</b></p>
    <textarea class="lig-codigo" id="colaOferta" placeholder="Cola aqui o código..."></textarea>
    <div class="lig-botoes"><button class="lig-bt ok" id="btResponder">📞 Atender</button>
      <button class="lig-bt desligar" id="btDesligar">Cancelar</button></div>`);
  document.getElementById('btDesligar').addEventListener('click', desligar);
  document.getElementById('btResponder').addEventListener('click', async () => {
    const oferta = desempacotar(document.getElementById('colaOferta').value);
    if(!oferta){ toast('Esse código não parece certo 🤔'); return; }
    ligStatus('Preparando...');
    meuAudio = await pegarMicrofone();
    if(!meuAudio){ ligStatus('Sem microfone, não dá pra atender 😕'); return; }
    pc = criarConexao();
    meuAudio.getTracks().forEach(t => pc.addTrack(t, meuAudio));
    try{
      await pc.setRemoteDescription(oferta);
      const resposta = await pc.createAnswer();
      await pc.setLocalDescription(resposta);
      await esperarCaminhos(pc);
    }catch(e){ ligStatus('Esse código não funcionou 😕'); return; }
    passo(caixaCodigo('codResposta', empacotar(pc.localDescription),
      '2️⃣ Agora manda ESTE código de volta',
      'Quando a pessoa colar lá e apertar Conectar, a ligação começa.') + `
      <div class="lig-botoes"><button class="lig-bt desligar" id="btDesligar">Cancelar</button></div>`);
    ligarBotoesCodigo();
    ligStatus('Esperando a pessoa conectar...');
    document.getElementById('btDesligar').addEventListener('click', desligar);
  });
}

/* ---------- tela da ligação ---------- */
function abrirLigacao(){
  if(document.getElementById('telaLigacao')) return;
  const c = conversaPor(atual);
  const tela = document.createElement('div');
  tela.className = 'tela-cheia ligacao';
  tela.id = 'telaLigacao';
  tela.innerHTML = `
    <div class="w-topo">
      <button class="icone" id="ligFechar">✕</button>
      <div><b>📞 Ligação de voz</b><div class="w-sub">com ${c.nome}</div></div>
    </div>
    <div class="lig-meio">
      <div class="lig-avatar" style="background:linear-gradient(135deg,${c.cor},${c.cor}bb)">${c.emoji}</div>
      <div class="lig-status" id="ligStatus">Como tu quer começar?</div>
      <div id="ligPasso">
        <div class="lig-botoes col">
          <button class="lig-bt ok grande" id="btChamar">📲 Eu quero chamar</button>
          <button class="lig-bt grande" id="btAtender">📥 Me mandaram um código</button>
        </div>
        <p class="lig-txt aviso-lig">⚠️ Pra ligação funcionar, os dois precisam estar com o site aberto
        <b>ao mesmo tempo</b> e trocar o código. No wi-fi de casa quase sempre funciona; na internet do
        celular às vezes não conecta. Se não rolar, manda um recadinho de voz 🎤</p>
      </div>
    </div>`;
  document.body.appendChild(tela);
  document.getElementById('ligFechar').addEventListener('click', desligar);
  document.getElementById('btChamar').addEventListener('click', chamar);
  document.getElementById('btAtender').addEventListener('click', atender);
}
