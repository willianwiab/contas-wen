/* =========================================================
   extras.js — fotos e enquetes.
   A foto é diminuída aqui mesmo no navegador e guardada no
   aparelho (IndexedDB), igual aos áudios. Nada sai daqui.
   ========================================================= */

/* ---------- decide o que desenhar dentro do balão ---------- */
function conteudoEspecial(m, indice){
  if(m.tipo === 'audio')   return balaoAudio(m, indice);
  if(m.tipo === 'foto')    return balaoFoto(m, indice);
  if(m.tipo === 'video')   return balaoVideo(m, indice);
  if(m.tipo === 'enquete') return balaoEnquete(m, indice);
  if(m.tipo === 'jogo')    return balaoJogo(m, indice);
  if(m.tipo === 'capsula') return balaoCapsula(m);
  if(m.tipo === 'lugar')   return balaoLugar(m);
  if(m.tipo === 'som')     return balaoSom(m, indice);
  if(m.tipo === 'timer')   return balaoTimer(m, indice);
  return `<span class="txt">${escapar(m.t || '')}</span>`;
}

/* ---------- FOTOS ---------- */
const urlsFoto = new Map();

/* Diminui a foto antes de guardar: celular tira foto de 4 MB, e não precisa. */
function encolherFoto(arquivo, maior = 1400){
  return new Promise((res, rej) => {
    const leitor = new FileReader();
    leitor.onload = () => {
      const img = new Image();
      img.onload = () => {
        let { width:l, height:a } = img;
        const escala = Math.min(1, maior / Math.max(l, a));
        l = Math.round(l * escala); a = Math.round(a * escala);
        const tela = document.createElement('canvas');
        tela.width = l; tela.height = a;
        tela.getContext('2d').drawImage(img, 0, 0, l, a);
        tela.toBlob(b => b ? res({ blob:b, l, a }) : rej(), 'image/jpeg', .82);
      };
      img.onerror = rej;
      img.src = leitor.result;
    };
    leitor.onerror = rej;
    leitor.readAsDataURL(arquivo);
  });
}

function escolherFoto(){
  const inp = document.createElement('input');
  inp.type = 'file'; inp.accept = 'image/*';
  inp.addEventListener('change', async () => {
    const arq = inp.files && inp.files[0];
    if(!arq) return;
    toast('Preparando a foto... 📷');
    try{
      /* GIF não pode passar pelo canvas, senão perde a animação. */
      const ehGif = arq.type === 'image/gif';
      if(ehGif && arq.size > 4000000){ toast('Esse GIF é grande demais 😕'); return; }
      const { blob, l, a } = ehGif ? { blob: arq, l: 0, a: 0 } : await encolherFoto(arq);
      const id = 'f' + Date.now() + Math.random().toString(36).slice(2,7);
      const guardou = await guardarAudio(id, blob);      // mesmo cofre dos áudios
      const msg = { tipo:'foto', id, l, a, gif: ehGif, de: autor, ts: Date.now() };
      if(!guardou){
        const txt = await blobParaTexto(blob);
        if(txt.length > 700000){ toast('Essa foto é grande demais 😕'); return; }
        msg.b64 = txt;
      }
      dados.msgs[atual].push(msg);
      dados.visto[atual] = Date.now();
      dados.presenca[autor] = Date.now();
      animar = dados.msgs[atual].length - 1;
      salvar(); blim(autor === 'eu');
      mandarPraNuvem(atual, msg);
      desenharMensagens(); desenharContatos(); atualizarStatusTopo();
    }catch(e){ toast('Não consegui abrir essa foto 😕'); }
  });
  inp.click();
}

function balaoFoto(m, indice){
  const alt = Math.round(Math.min(300, 240 * (m.a || 1) / (m.l || 1)));
  return `<div class="foto-msg" data-foto="${indice}" style="min-height:${alt}px">
            <div class="foto-carregando">📷</div>
          </div>`;
}

/* Depois de desenhar, busca cada foto no cofre e coloca na tela. */
async function carregarFotos(){
  const caixas = document.querySelectorAll('[data-foto]');
  for(const caixa of caixas){
    const m = dados.msgs[atual][+caixa.dataset.foto];
    if(!m) continue;
    let url = m.b64 || urlsFoto.get(m.id);
    if(!url){
      const blob = await pegarAudio(m.id);
      if(!blob){ caixa.innerHTML = '<div class="foto-carregando">foto perdida 😕</div>'; continue; }
      url = URL.createObjectURL(blob);
      urlsFoto.set(m.id, url);
    }
    caixa.innerHTML = `<img src="${url}" alt="foto" loading="lazy">`;
    caixa.style.minHeight = '';
  }
}

function abrirFotoGrande(indice){
  const m = dados.msgs[atual][indice];
  if(!m) return;
  const url = m.b64 || urlsFoto.get(m.id);
  if(!url) return;
  const tela = document.createElement('div');
  tela.className = 'tela-cheia foto-grande';
  tela.innerHTML = `<button class="fg-fechar">✕</button><img src="${url}" alt="foto">`;
  tela.addEventListener('click', () => tela.remove());
  document.body.appendChild(tela);
}

/* ---------- ENQUETES ---------- */
function abrirNovaEnquete(){
  const tela = document.createElement('div');
  tela.className = 'fundo-modal aberto';
  tela.id = 'modalEnquete';
  tela.innerHTML = `
    <div class="modal">
      <h2>📊 Nova enquete</h2>
      <p class="sub">Faz uma pergunta e cada um da família escolhe uma resposta.</p>
      <div class="campo-form">
        <label>Pergunta</label>
        <input id="enqPergunta" placeholder="Ex.: O que a gente janta hoje?" maxlength="80">
      </div>
      <div class="campo-form">
        <label>Respostas</label>
        <input class="enq-op" placeholder="1ª resposta (ex.: pizza 🍕)" maxlength="40">
        <input class="enq-op" placeholder="2ª resposta (ex.: lasanha 🍝)" maxlength="40" style="margin-top:8px">
        <input class="enq-op" placeholder="3ª resposta (pode deixar vazio)" maxlength="40" style="margin-top:8px">
        <input class="enq-op" placeholder="4ª resposta (pode deixar vazio)" maxlength="40" style="margin-top:8px">
      </div>
      <div class="acoes">
        <button class="btn neutro" id="enqCancelar">Cancelar</button>
        <button class="btn principal" id="enqCriar">Criar enquete</button>
      </div>
    </div>`;
  document.body.appendChild(tela);
  const fecha = () => tela.remove();
  tela.addEventListener('click', e => { if(e.target.id === 'modalEnquete') fecha(); });
  document.getElementById('enqCancelar').addEventListener('click', fecha);
  document.getElementById('enqPergunta').focus();
  document.getElementById('enqCriar').addEventListener('click', () => {
    const q = document.getElementById('enqPergunta').value.trim();
    const ops = [...tela.querySelectorAll('.enq-op')].map(i => i.value.trim()).filter(Boolean);
    if(!q){ toast('Faltou a pergunta 🤔'); return; }
    if(ops.length < 2){ toast('Precisa de pelo menos 2 respostas 😊'); return; }
    const enq = { tipo:'enquete', q, ops, votos:{}, de: autor, ts: Date.now() };
    dados.msgs[atual].push(enq);
    mandarPraNuvem(atual, enq);
    dados.visto[atual] = Date.now();
    dados.presenca[autor] = Date.now();
    animar = dados.msgs[atual].length - 1;
    salvar(); blim(true); fecha();
    desenharMensagens(); desenharContatos(); atualizarStatusTopo();
  });
}

function balaoEnquete(m, indice){
  const votos = m.votos || {};
  const total = Object.keys(votos).length;
  const linhas = m.ops.map((op, k) => {
    const quem = Object.keys(votos).filter(p => votos[p] === k);
    const pct = total ? Math.round(quem.length / total * 100) : 0;
    const meu = votos[autor] === k;
    return `
      <button class="enq-op-bt ${meu ? 'meu' : ''}" data-voto="${indice}:${k}">
        <span class="enq-barra" style="width:${pct}%"></span>
        <span class="enq-txt">${escapar(op)}</span>
        <span class="enq-quem">${quem.map(p => PESSOAS[p].emoji).join('')} ${pct}%</span>
      </button>`;
  }).join('');
  return `
    <div class="enquete">
      <div class="enq-pergunta">📊 ${escapar(m.q)}</div>
      ${linhas}
      <div class="enq-total">${total ? `${total} voto(s) — toca pra votar` : 'ninguém votou ainda — toca pra votar'}</div>
    </div>`;
}

function votar(indice, opcao){
  const m = dados.msgs[atual][indice];
  if(!m || m.tipo !== 'enquete') return;
  m.votos = m.votos || {};
  if(m.votos[autor] === opcao) delete m.votos[autor];   // tocar de novo tira o voto
  else m.votos[autor] = opcao;
  marcarPresenca(autor);
  salvar(); desenharMensagens();
}

/* ---------- ligações depois de cada desenho ---------- */
function ligarExtras(){
  carregarFotos();
  carregarVideos();
  document.querySelectorAll('[data-foto]').forEach(el =>
    el.addEventListener('click', () => abrirFotoGrande(+el.dataset.foto)));
  document.querySelectorAll('[data-voto]').forEach(b =>
    b.addEventListener('click', () => {
      const [i, k] = b.dataset.voto.split(':').map(Number);
      votar(i, k);
    }));
}

/* ---------- menu do "+" ---------- */
function abrirMaisMenu(){
  const antigo = document.getElementById('maisMenu');
  if(antigo){ antigo.remove(); return; }
  const menu = document.createElement('div');
  menu.id = 'maisMenu'; menu.className = 'mais-menu';
  menu.innerHTML = `
    <button data-acao="foto">📷 Foto ou GIF</button>
    <button data-acao="video">🎥 Videinho da câmera</button>
    <button data-acao="gif">🎞️ GIF caseiro (2s)</button>
    <button data-acao="desenho">✏️ Recado desenhado</button>
    <button data-acao="figurinha">😄 Figurinhas</button>
    <button data-acao="enquete">📊 Fazer enquete</button>
    <button data-acao="jogo">🕹️ Jogo da velha</button>
    <button data-acao="capsula">🕰️ Cápsula do tempo</button>
    <button data-acao="lugar">🗺️ Mandar onde eu estou</button>
    <button data-acao="som">🎺 Figurinhas de som</button>
    <button data-acao="timer">⏱️ Cronômetro</button>
    <button data-acao="codigo">🔤 Código secreto</button>
    <button data-acao="walkie">📻 Walkie-talkie</button>`;
  document.querySelector('.barra').insertAdjacentElement('beforebegin', menu);
  menu.querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
    const a = b.dataset.acao; menu.remove();
    if(a === 'foto') escolherFoto();
    if(a === 'video') abrirCamera(false);
    if(a === 'gif') abrirCamera(true);
    if(a === 'desenho') abrirDesenho();
    if(a === 'figurinha') abrirFigurinhas();
    if(a === 'enquete') abrirNovaEnquete();
    if(a === 'jogo') novoJogo();
    if(a === 'capsula') abrirNovaCapsula();
    if(a === 'lugar') mandarLugar();
    if(a === 'som') abrirSons();
    if(a === 'timer') abrirCronometro();
    if(a === 'codigo') abrirCodigo();
    if(a === 'walkie') abrirWalkie();
  }));
  setTimeout(() => document.addEventListener('click', function fora(e){
    if(!e.target.closest('#maisMenu') && !e.target.closest('#btnMais')){
      menu.remove(); document.removeEventListener('click', fora);
    }
  }), 0);
}


/* ---------- FIGURINHAS ---------- */
const FIGURINHAS = ['😀','😂','🥰','😎','🤩','😭','😡','🤯','🥳','😴','🤗','🤪','👍','👎','🙏','👏','💪','🫶',
  '❤️','💜','💔','✨','🔥','💯','🎉','🎂','🎁','🐶','🐱','🦄','🦖','🐢','🍕','🍔','🍫','🍦','⚽','🎮','🏆','🚗',
  '🌈','⭐','🌙','☀️','💤','🤝','🤙','🫡'];

function abrirFigurinhas(){
  const antigo = document.getElementById('telaFig');
  if(antigo){ antigo.remove(); return; }
  const tela = document.createElement('div');
  tela.className = 'figurinhas'; tela.id = 'telaFig';
  tela.innerHTML = FIGURINHAS.map(f => `<button data-fig="${f}">${f}</button>`).join('');
  document.querySelector('.barra').insertAdjacentElement('beforebegin', tela);
  tela.querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
    tela.remove();
    enviar(b.dataset.fig);          // emoji sozinho já aparece gigante
  }));
}

/* ---------- RECADO DESENHADO ---------- */
function abrirDesenho(){
  if(document.getElementById('telaDesenho')) return;
  const cores = ['#1e1b33','#ef4444','#f59e0b','#22c55e','#3b82f6','#a855f7','#ec4899','#ffffff'];
  const tela = document.createElement('div');
  tela.className = 'tela-cheia'; tela.id = 'telaDesenho';
  tela.innerHTML = `
    <div class="w-topo">
      <button class="icone" id="dFechar">✕</button>
      <div><b>✏️ Recado desenhado</b><div class="w-sub">desenha e manda como figurinha</div></div>
    </div>
    <div class="d-meio">
      <canvas id="quadro" width="900" height="1200"></canvas>
      <div class="d-cores">
        ${cores.map((c,i) => `<button class="d-cor ${i===0?'on':''}" data-cor="${c}" style="background:${c}"></button>`).join('')}
        <button class="d-cor grossura" id="dGrossura">✏️ 6</button>
        <button class="d-cor" id="dLimpar">🧽</button>
      </div>
      <div class="lig-botoes">
        <button class="lig-bt ok" id="dMandar">Mandar desenho 📨</button>
      </div>
    </div>`;
  document.body.appendChild(tela);

  const quadro = document.getElementById('quadro');
  const ctx = quadro.getContext('2d');
  ctx.fillStyle = '#fff'; ctx.fillRect(0,0,quadro.width,quadro.height);
  ctx.lineCap = ctx.lineJoin = 'round';
  let cor = cores[0], grossura = 6, desenhando = false;

  const ponto = ev => {
    const r = quadro.getBoundingClientRect();
    return { x:(ev.clientX - r.left) * quadro.width / r.width,
             y:(ev.clientY - r.top)  * quadro.height / r.height };
  };
  quadro.addEventListener('pointerdown', ev => {
    ev.preventDefault(); desenhando = true;
    try{ quadro.setPointerCapture(ev.pointerId); }catch(e){}
    const p = ponto(ev);
    ctx.strokeStyle = cor; ctx.lineWidth = grossura;
    ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x + .1, p.y); ctx.stroke();
  });
  quadro.addEventListener('pointermove', ev => {
    if(!desenhando) return;
    const p = ponto(ev);
    ctx.lineTo(p.x, p.y); ctx.stroke();
  });
  const solta = () => { desenhando = false; };
  quadro.addEventListener('pointerup', solta);
  quadro.addEventListener('pointercancel', solta);

  tela.querySelectorAll('[data-cor]').forEach(b => b.addEventListener('click', () => {
    cor = b.dataset.cor;
    tela.querySelectorAll('[data-cor]').forEach(o => o.classList.toggle('on', o === b));
  }));
  document.getElementById('dGrossura').addEventListener('click', e => {
    grossura = grossura >= 24 ? 3 : grossura * 2;
    e.currentTarget.textContent = '✏️ ' + grossura;
  });
  document.getElementById('dLimpar').addEventListener('click', () => {
    ctx.fillStyle = '#fff'; ctx.fillRect(0,0,quadro.width,quadro.height);
  });
  document.getElementById('dFechar').addEventListener('click', () => tela.remove());
  document.getElementById('dMandar').addEventListener('click', () => {
    quadro.toBlob(async blob => {
      if(!blob){ toast('Não deu pra salvar o desenho 😕'); return; }
      const id = 'd' + Date.now();
      const guardou = await guardarAudio(id, blob);
      const msg = { tipo:'foto', id, l:quadro.width, a:quadro.height, desenho:true, de:autor, ts:Date.now() };
      if(!guardou) msg.b64 = await blobParaTexto(blob);
      dados.msgs[atual].push(msg);
      dados.visto[atual] = Date.now(); dados.presenca[autor] = Date.now();
      animar = dados.msgs[atual].length - 1;
      salvar(); blim(true); tela.remove();
      desenharMensagens(); desenharContatos(); atualizarStatusTopo();
    }, 'image/png');
  });
}
