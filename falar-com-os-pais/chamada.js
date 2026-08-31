/* =========================================================
   chamada.js — ligação de um toque.

   Antes era preciso copiar um código gigante e mandar pra
   pessoa. Agora o banco da família serve de "central": quem
   liga deixa o convite lá, o aparelho do outro percebe em
   segundos e TOCA. O jeito manual continua existindo como
   plano B (pra quando não há banco ligado).
   ========================================================= */

const TEMPO_TOQUE = 45000;      // depois disso a chamada expira
let relogioChamadas = null;
let chamadaAtual = null;        // { conversa, comigo, papel }
let tocandoChamada = null;      // som do telefone tocando

const podeChamar = () => nuvemLigada() && !modoPublico() && dados.euSou;
const enderecoChamada = conversa =>
  `${dados.nuvem.url.replace(/\/$/,'')}/salas/${dados.nuvem.sala}/ligacoes/${conversa}`;

async function escreverChamada(conversa, dadosChamada){
  try{
    await fetch(enderecoChamada(conversa) + '.json', {
      method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify(dadosChamada)
    });
    return true;
  }catch(e){ return false; }
}
async function lerChamada(conversa){
  try{
    const r = await fetch(enderecoChamada(conversa) + '.json');
    return r.ok ? await r.json() : null;
  }catch(e){ return null; }
}
const limparChamada = conversa => escreverChamada(conversa, null);

/* ---------- som de telefone ---------- */
function tocarTelefone(){
  pararTelefone();
  try{
    const c = new (window.AudioContext || window.webkitAudioContext)();
    const trim = () => {
      const t = c.currentTime;
      [0, .4].forEach(atraso => {
        const o = c.createOscillator(), g = c.createGain();
        o.type = 'sine'; o.frequency.value = 480;
        g.gain.setValueAtTime(.0001, t + atraso);
        g.gain.exponentialRampToValueAtTime(.18, t + atraso + .03);
        g.gain.exponentialRampToValueAtTime(.0001, t + atraso + .35);
        o.connect(g); g.connect(c.destination);
        o.start(t + atraso); o.stop(t + atraso + .4);
      });
    };
    trim();
    tocandoChamada = { ctx:c, relogio: setInterval(trim, 2500) };
    if(navigator.vibrate) navigator.vibrate([400, 200, 400]);
  }catch(e){}
}
function pararTelefone(){
  if(!tocandoChamada) return;
  clearInterval(tocandoChamada.relogio);
  try{ tocandoChamada.ctx.close(); }catch(e){}
  tocandoChamada = null;
}

/* ---------- eu ligo ---------- */
async function chamarDeUmToque(conversa, comVideoDesejado){
  const c = conversaPor(conversa);
  if(!c || !c.pessoa){ toast('Ligação de um toque é de pessoa pra pessoa 😊'); return; }
  if(!podeChamar()){ abrirLigacao(); return; }        // sem banco: cai no jeito manual

  abrirTelaChamada(c, 'chamando', comVideoDesejado);
  comVideo = !!comVideoDesejado;
  meuAudio = await (comVideo ? pegarCamera(true) : pegarMicrofone());
  if(!meuAudio){ fecharTelaChamada(); return; }

  const conexao = criarConexao();
  pc = conexao;
  meuAudio.getTracks().forEach(t => conexao.addTrack(t, meuAudio));
  if(comVideo) mostrarVideos();

  const oferta = await conexao.createOffer({ offerToReceiveAudio:true, offerToReceiveVideo: comVideo });
  await conexao.setLocalDescription(oferta);
  await esperarCaminhos(conexao);

  await escreverChamada(conversa, {
    de: dados.euSou, para: c.pessoa, comVideo: comVideo, ts: Date.now(),
    estado: 'chamando', oferta: JSON.stringify(conexao.localDescription)
  });
  chamadaAtual = { conversa, papel:'quem liga' };
  tocarTelefone();
  esperarResposta(conversa, conexao);
}

async function esperarResposta(conversa, conexao){
  const comecou = Date.now();
  const olhar = setInterval(async () => {
    if(!chamadaAtual || chamadaAtual.conversa !== conversa){ clearInterval(olhar); return; }
    const info = await lerChamada(conversa);
    if(!info || info.estado === 'fim'){
      clearInterval(olhar); pararTelefone();
      toast('A ligação foi encerrada 📵'); desligar();
      return;
    }
    if(info.estado === 'recusada'){
      clearInterval(olhar); pararTelefone();
      toast('Não atenderam 📵'); limparChamada(conversa); desligar();
      return;
    }
    if(info.resposta){
      clearInterval(olhar); pararTelefone();
      try{ await conexao.setRemoteDescription(JSON.parse(info.resposta)); }
      catch(e){ toast('Não deu pra conectar 😕'); }
      return;
    }
    if(Date.now() - comecou > TEMPO_TOQUE){
      clearInterval(olhar); pararTelefone();
      toast('Ninguém atendeu 📵'); limparChamada(conversa); desligar();
    }
  }, 2000);
}

/* ---------- estão me ligando ---------- */
async function verSeEstaoLigando(){
  if(!podeChamar() || chamadaAtual || document.hidden) return;
  for(const c of CONVERSAS){
    if(!c.pessoa) continue;
    const info = await lerChamada(c.id);
    if(!info || info.estado !== 'chamando') continue;
    if(info.para !== dados.euSou) continue;
    if(Date.now() - info.ts > TEMPO_TOQUE) continue;
    chamadaAtual = { conversa: c.id, papel:'quem atende' };
    mostrarChamadaChegando(c, info);
    return;
  }
}

function mostrarChamadaChegando(c, info){
  if(document.getElementById('telaTocando')) return;
  tocarTelefone();
  const tela = document.createElement('div');
  tela.className = 'tela-cheia tocando'; tela.id = 'telaTocando';
  tela.innerHTML = `
    <div class="qs-meio">
      <div class="lig-avatar tremendo" style="background:linear-gradient(135deg,${c.cor},${c.cor}bb)">${avatarConversa(c)}</div>
      <h2>${c.nome}</h2>
      <p class="lig-txt">${info.comVideo ? '📹 videochamada' : '📞 ligação'} chamando...</p>
      <div class="lig-botoes">
        <button class="lig-bt ok grande" id="atenderAgora">📞 Atender</button>
        <button class="lig-bt desligar grande" id="recusarAgora">📵 Recusar</button>
      </div>
    </div>`;
  document.body.appendChild(tela);
  document.getElementById('atenderAgora').addEventListener('click', () => atenderDeUmToque(c, info, tela));
  document.getElementById('recusarAgora').addEventListener('click', async () => {
    pararTelefone(); tela.remove();
    await escreverChamada(c.id, Object.assign({}, info, { estado:'recusada' }));
    chamadaAtual = null;
  });
  setTimeout(() => {   // ninguém atendeu
    if(document.getElementById('telaTocando')){ pararTelefone(); tela.remove(); chamadaAtual = null; }
  }, TEMPO_TOQUE);
}

async function atenderDeUmToque(c, info, tela){
  pararTelefone(); tela.remove();
  abrirTelaChamada(c, 'atendendo', info.comVideo);
  comVideo = !!info.comVideo;
  meuAudio = await (comVideo ? pegarCamera(true) : pegarMicrofone());
  if(!meuAudio){ chamadaAtual = null; fecharTelaChamada(); return; }

  const conexao = criarConexao();
  pc = conexao;
  meuAudio.getTracks().forEach(t => conexao.addTrack(t, meuAudio));
  if(comVideo) mostrarVideos();

  try{
    await conexao.setRemoteDescription(JSON.parse(info.oferta));
    const resposta = await conexao.createAnswer();
    await conexao.setLocalDescription(resposta);
    await esperarCaminhos(conexao);
    await escreverChamada(c.id, Object.assign({}, info, {
      estado:'atendida', resposta: JSON.stringify(conexao.localDescription)
    }));
  }catch(e){
    toast('Não deu pra atender 😕'); desligar();
  }
}

/* ---------- tela da ligação em andamento ---------- */
function abrirTelaChamada(c, estado, comVideo){
  if(document.getElementById('telaLigacao')) return;
  const tela = document.createElement('div');
  tela.className = 'tela-cheia ligacao'; tela.id = 'telaLigacao';
  tela.innerHTML = `
    <div class="w-topo">
      <button class="icone" id="ligFechar">✕</button>
      <div><b>${comVideo ? '📹 Videochamada' : '📞 Ligação'}</b><div class="w-sub">com ${c.nome}</div></div>
    </div>
    <div class="lig-meio">
      <div class="lig-avatar" style="background:linear-gradient(135deg,${c.cor},${c.cor}bb)">${avatarConversa(c)}</div>
      <div class="lig-status" id="ligStatus">${estado === 'chamando' ? 'Chamando...' : 'Atendendo...'}</div>
      <div id="ligPasso"><div class="lig-botoes"><button class="lig-bt desligar" id="btDesligar">📵 Desligar</button></div></div>
    </div>`;
  document.body.appendChild(tela);
  document.getElementById('ligFechar').addEventListener('click', desligar);
  document.getElementById('btDesligar').addEventListener('click', desligar);
}
function fecharTelaChamada(){
  const t = document.getElementById('telaLigacao'); if(t) t.remove();
  chamadaAtual = null;
}

/* fica de olho se alguém está ligando */
function ligarCentral(){
  clearInterval(relogioChamadas);
  if(!podeChamar()) return;
  relogioChamadas = setInterval(verSeEstaoLigando, 2500);
}
function desligarCentral(){ clearInterval(relogioChamadas); pararTelefone(); }
