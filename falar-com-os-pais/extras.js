/* =========================================================
   extras.js — fotos e enquetes.
   A foto é diminuída aqui mesmo no navegador e guardada no
   aparelho (IndexedDB), igual aos áudios. Nada sai daqui.
   ========================================================= */

/* ---------- decide o que desenhar dentro do balão ---------- */
function conteudoEspecial(m, indice){
  if(m.tipo === 'audio')   return balaoAudio(m, indice);
  if(m.tipo === 'foto')    return balaoFoto(m, indice);
  if(m.tipo === 'enquete') return balaoEnquete(m, indice);
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
      const { blob, l, a } = await encolherFoto(arq);
      const id = 'f' + Date.now() + Math.random().toString(36).slice(2,7);
      const guardou = await guardarAudio(id, blob);      // mesmo cofre dos áudios
      const msg = { tipo:'foto', id, l, a, de: autor, ts: Date.now() };
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
    dados.msgs[atual].push({ tipo:'enquete', q, ops, votos:{}, de: autor, ts: Date.now() });
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
    <button data-acao="foto">📷 Mandar foto</button>
    <button data-acao="enquete">📊 Fazer enquete</button>
    <button data-acao="walkie">📻 Walkie-talkie</button>`;
  document.querySelector('.barra').insertAdjacentElement('beforebegin', menu);
  menu.querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
    const a = b.dataset.acao; menu.remove();
    if(a === 'foto') escolherFoto();
    if(a === 'enquete') abrirNovaEnquete();
    if(a === 'walkie') abrirWalkie();
  }));
  setTimeout(() => document.addEventListener('click', function fora(e){
    if(!e.target.closest('#maisMenu') && !e.target.closest('#btnMais')){
      menu.remove(); document.removeEventListener('click', fora);
    }
  }), 0);
}
