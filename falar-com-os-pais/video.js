/* =========================================================
   video.js — videinho da câmera (até 15s) e o "GIF caseiro",
   que é um vídeo curtinho, sem som, que fica repetindo.
   Grava e guarda tudo no aparelho, igual ao áudio.
   ========================================================= */

const LIMITE_VIDEO = 15;   // segundos
let gravVideo = null, pedacosVideo = [], streamVideo = null, inicioVideo = 0, timerVideo = null;

function tipoVideoSuportado(){
  const tipos = ['video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/webm','video/mp4'];
  return tipos.find(t => window.MediaRecorder && MediaRecorder.isTypeSupported(t)) || '';
}

async function pegarCamera(comSom = true, lado = 'user'){
  if(!window.isSecureContext || !navigator.mediaDevices?.getUserMedia){
    toast('Pra usar a câmera, abre o site pelo link (https) 🔒', 5000);
    return null;
  }
  try{
    return await navigator.mediaDevices.getUserMedia({
      video: { facingMode: lado, width:{ ideal:640 }, height:{ ideal:480 } },
      audio: comSom
    });
  }catch(e){
    const recado =
      e.name === 'NotAllowedError' ? 'Aperta "Permitir" quando pedir a câmera 🎥' :
      e.name === 'NotFoundError'   ? 'Não achei câmera neste aparelho 😕' :
      'Não deu pra abrir a câmera (' + e.name + ')';
    toast(recado, 5000);
    return null;
  }
}

/* ---------- tela de gravar vídeo ---------- */
async function abrirCamera(modoGif){
  if(document.getElementById('telaCamera')) return;
  const tela = document.createElement('div');
  tela.className = 'tela-cheia camera';
  tela.id = 'telaCamera';
  tela.innerHTML = `
    <div class="w-topo">
      <button class="icone" id="camFechar">✕</button>
      <div><b>${modoGif ? '🎞️ GIF caseiro' : '🎥 Videinho'}</b>
        <div class="w-sub">${modoGif ? '2 segundos que ficam repetindo' : `no máximo ${LIMITE_VIDEO} segundos`}</div></div>
    </div>
    <div class="cam-meio">
      <video id="camPreview" autoplay muted playsinline></video>
      <div class="cam-status" id="camStatus">Toca no botão vermelho pra gravar</div>
      <div class="cam-botoes">
        <button class="cam-bt trocar" id="camTrocar" title="Virar a câmera">🔄</button>
        <button class="cam-bt rec" id="camRec" title="Gravar"></button>
        <span style="width:52px"></span>
      </div>
    </div>`;
  document.body.appendChild(tela);

  const preview = document.getElementById('camPreview');
  const status  = document.getElementById('camStatus');
  const botao   = document.getElementById('camRec');
  let frontal = true;

  const fechar = () => {
    clearInterval(timerVideo);
    if(gravVideo && gravVideo.state !== 'inactive'){ try{ gravVideo.stop(); }catch(e){} }
    if(streamVideo){ streamVideo.getTracks().forEach(t => t.stop()); streamVideo = null; }
    tela.remove();
  };
  document.getElementById('camFechar').addEventListener('click', fechar);

  const ligarCamera = async () => {
    if(streamVideo) streamVideo.getTracks().forEach(t => t.stop());
    try{
      streamVideo = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: frontal ? 'user' : 'environment', width:{ideal:640}, height:{ideal:480} },
        audio: !modoGif
      });
    }catch(e){ streamVideo = await pegarCamera(!modoGif); }
    if(!streamVideo){ fechar(); return false; }
    preview.srcObject = streamVideo;
    return true;
  };
  if(!await ligarCamera()) return;

  document.getElementById('camTrocar').addEventListener('click', async () => { frontal = !frontal; await ligarCamera(); });

  botao.addEventListener('click', () => {
    if(gravVideo && gravVideo.state === 'recording'){ gravVideo.stop(); return; }

    const tipo = tipoVideoSuportado();
    try{
      gravVideo = tipo ? new MediaRecorder(streamVideo, { mimeType:tipo, videoBitsPerSecond: 900000 })
                       : new MediaRecorder(streamVideo);
    }catch(e){ toast('Este navegador não deixa gravar vídeo 😕'); return; }

    pedacosVideo = []; inicioVideo = Date.now();
    gravVideo.ondataavailable = ev => { if(ev.data && ev.data.size) pedacosVideo.push(ev.data); };
    gravVideo.onstop = async () => {
      clearInterval(timerVideo);
      botao.classList.remove('gravando');
      const seg = (Date.now() - inicioVideo) / 1000;
      const blob = new Blob(pedacosVideo, { type: gravVideo.mimeType || 'video/webm' });
      gravVideo = null;
      if(seg < .4){ status.textContent = 'Curtinho demais! Grava mais um pouco 😊'; return; }
      status.textContent = 'Mandando... 📡';
      await mandarVideo(blob, seg, modoGif);
      fechar();
    };
    gravVideo.start();
    botao.classList.add('gravando');
    const limite = modoGif ? 2 : LIMITE_VIDEO;
    timerVideo = setInterval(() => {
      const seg = (Date.now() - inicioVideo) / 1000;
      status.textContent = `🔴 ${seg.toFixed(1)}s ${modoGif ? '' : '— toca pra parar'}`;
      if(seg >= limite && gravVideo && gravVideo.state === 'recording') gravVideo.stop();
    }, 100);
  });
}

async function mandarVideo(blob, segundos, ehGif){
  const id = 'v' + Date.now() + Math.random().toString(36).slice(2,7);
  const guardou = await guardarAudio(id, blob);
  const msg = { tipo:'video', id, dur: Math.round(segundos * 10) / 10, gif: !!ehGif, de: autor, ts: Date.now() };
  if(!guardou){
    const txt = await blobParaTexto(blob);
    if(txt.length > 900000){ toast('Vídeo grande demais pra guardar aqui 😕'); return; }
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

/* ---------- balão de vídeo ---------- */
const urlsVideo = new Map();

function balaoVideo(m, indice){
  return `<div class="video-msg" data-video="${indice}">
            <div class="foto-carregando">${m.gif ? '🎞️' : '🎥'}</div>
          </div>`;
}

async function carregarVideos(){
  for(const caixa of document.querySelectorAll('[data-video]')){
    const m = dados.msgs[atual][+caixa.dataset.video];
    if(!m) continue;
    let url = m.b64 || urlsVideo.get(m.id);
    if(!url){
      const blob = await pegarAudio(m.id);
      if(!blob){ caixa.innerHTML = '<div class="foto-carregando">vídeo perdido 😕</div>'; continue; }
      url = URL.createObjectURL(blob);
      urlsVideo.set(m.id, url);
    }
    caixa.innerHTML = m.gif
      ? `<video src="${url}" autoplay loop muted playsinline></video><span class="selo-gif">GIF</span>`
      : `<video src="${url}" controls playsinline preload="metadata"></video>`;
  }
}
