/* =========================================================
   familia.js — foto de perfil de cada um, quadro de tarefas
   com estrelinhas, e o backup pra levar tudo pra outro
   aparelho. Continua tudo dentro do aparelho.
   ========================================================= */

/* ---------- FOTO DE PERFIL ---------- */
const urlsPerfil = new Map();

/* Corta a foto num quadrado e diminui — perfil não precisa ser grandão. */
function encolherQuadrado(arquivo, lado = 260){
  return new Promise((res, rej) => {
    const leitor = new FileReader();
    leitor.onload = () => {
      const img = new Image();
      img.onload = () => {
        const menor = Math.min(img.width, img.height);
        const tela = document.createElement('canvas');
        tela.width = tela.height = lado;
        tela.getContext('2d').drawImage(img,
          (img.width - menor) / 2, (img.height - menor) / 2, menor, menor, 0, 0, lado, lado);
        tela.toBlob(b => b ? res(b) : rej(), 'image/jpeg', .85);
      };
      img.onerror = rej; img.src = leitor.result;
    };
    leitor.onerror = rej; leitor.readAsDataURL(arquivo);
  });
}

async function carregarPerfis(){
  for(const pessoa of Object.keys(PESSOAS)){
    const id = dados.fotos && dados.fotos[pessoa];
    if(!id){ urlsPerfil.delete(pessoa); continue; }
    if(urlsPerfil.has(pessoa)) continue;
    const blob = await pegarAudio(id);            // mesmo cofre dos áudios e fotos
    if(blob) urlsPerfil.set(pessoa, URL.createObjectURL(blob));
  }
}

/* O miolo do avatar: a foto da pessoa, ou o bonequinho. */
function avatarDe(pessoa){
  const url = urlsPerfil.get(pessoa);
  return url ? `<img src="${url}" alt="">` : (PESSOAS[pessoa]?.emoji || '💬');
}
function avatarConversa(c){
  return c.pessoa ? avatarDe(c.pessoa) : c.emoji;
}

function escolherFotoPerfil(pessoa){
  const inp = document.createElement('input');
  inp.type = 'file'; inp.accept = 'image/*';
  inp.addEventListener('change', async () => {
    const arq = inp.files && inp.files[0];
    if(!arq) return;
    try{
      const blob = await encolherQuadrado(arq);
      const id = 'p' + pessoa + Date.now();
      const guardou = await guardarAudio(id, blob);
      if(!guardou){ toast('Este navegador não deixou guardar a foto 😕'); return; }
      const antigo = dados.fotos[pessoa];
      dados.fotos[pessoa] = id; salvar();
      if(antigo) apagarAudio(antigo);
      urlsPerfil.delete(pessoa);
      await carregarPerfis();
      desenharPerfis(); desenharContatos();
      if(atual) desenharConversa();
      toast('Foto trocada! 🖼️');
    }catch(e){ toast('Não consegui abrir essa foto 😕'); }
  });
  inp.click();
}

function tirarFotoPerfil(pessoa){
  const id = dados.fotos[pessoa];
  if(!id) return;
  apagarAudio(id);
  delete dados.fotos[pessoa]; salvar();
  urlsPerfil.delete(pessoa);
  desenharPerfis(); desenharContatos();
  if(atual) desenharConversa();
}

function desenharPerfis(){
  const caixa = document.getElementById('listaPerfis');
  if(!caixa) return;
  caixa.innerHTML = Object.keys(PESSOAS).map(p => `
    <div class="perfil">
      <button class="perfil-av" data-perfil="${p}"
        style="background:linear-gradient(135deg,${PESSOAS[p].cor},${PESSOAS[p].cor}bb)">${avatarDe(p)}</button>
      <b>${nomeDe(p)}</b>
      ${dados.fotos[p] ? `<button class="perfil-tirar" data-tirar="${p}">tirar</button>` : '<span class="perfil-dica">tocar</span>'}
    </div>`).join('');
  caixa.querySelectorAll('[data-perfil]').forEach(b =>
    b.addEventListener('click', () => escolherFotoPerfil(b.dataset.perfil)));
  caixa.querySelectorAll('[data-tirar]').forEach(b =>
    b.addEventListener('click', () => tirarFotoPerfil(b.dataset.tirar)));
}

/* ---------- TAREFAS E ESTRELINHAS ---------- */
function abrirTarefas(){
  if(document.getElementById('telaTarefas')) return;
  const tela = document.createElement('div');
  tela.className = 'tela-cheia';
  tela.id = 'telaTarefas';
  tela.innerHTML = `
    <div class="w-topo">
      <button class="icone" id="tFechar">✕</button>
      <div><b>✅ Tarefas e estrelinhas</b><div class="w-sub">o que a família combinou de fazer</div></div>
    </div>
    <div class="t-meio">
      <div class="placar" id="placar"></div>
      <div class="t-form">
        <input id="tarefaTxt" placeholder="O que precisa fazer? Ex.: arrumar o quarto" maxlength="60">
        <select id="tarefaDono"></select>
        <select id="tarefaPontos">
          <option value="1">⭐ 1</option><option value="2">⭐ 2</option>
          <option value="3">⭐ 3</option><option value="5">⭐ 5</option>
        </select>
        <button id="tarefaAdd">Adicionar</button>
      </div>
      <div class="t-lista" id="listaTarefas"></div>
    </div>`;
  document.body.appendChild(tela);
  document.getElementById('tarefaDono').innerHTML = Object.keys(PESSOAS)
    .map(p => `<option value="${p}">${PESSOAS[p].emoji} ${nomeDe(p)}</option>`).join('');
  document.getElementById('tFechar').addEventListener('click', () => tela.remove());
  document.getElementById('tarefaAdd').addEventListener('click', novaTarefa);
  document.getElementById('tarefaTxt').addEventListener('keydown', e => { if(e.key === 'Enter') novaTarefa(); });
  desenharTarefas();
}

function novaTarefa(){
  const txt = document.getElementById('tarefaTxt').value.trim();
  if(!txt){ toast('Escreve a tarefa primeiro 😊'); return; }
  dados.tarefas.push({
    id: 't' + Date.now(),
    txt,
    dono: document.getElementById('tarefaDono').value,
    pontos: +document.getElementById('tarefaPontos').value,
    feito: false
  });
  salvar(); desenharTarefas();
  document.getElementById('tarefaTxt').value = '';
}

function marcarTarefa(id){
  const t = dados.tarefas.find(x => x.id === id);
  if(!t) return;
  t.feito = !t.feito;
  dados.pontos[t.dono] = Math.max(0, (dados.pontos[t.dono] || 0) + (t.feito ? t.pontos : -t.pontos));
  salvar(); desenharTarefas();
  if(t.feito){ blim(true); toast(`Boa! +${t.pontos} ⭐ ${souEu(t.dono) ? 'pra ti' : 'pra ' + PESSOAS[t.dono].curto}`); }
}
function apagarTarefa(id){
  const t = dados.tarefas.find(x => x.id === id);
  if(t && t.feito) dados.pontos[t.dono] = Math.max(0, (dados.pontos[t.dono] || 0) - t.pontos);
  dados.tarefas = dados.tarefas.filter(x => x.id !== id);
  salvar(); desenharTarefas();
}

function desenharTarefas(){
  const placar = document.getElementById('placar');
  const lista  = document.getElementById('listaTarefas');
  if(!placar || !lista) return;

  placar.innerHTML = Object.keys(PESSOAS).map(p => `
    <div class="placar-item">
      <div class="placar-av" style="background:linear-gradient(135deg,${PESSOAS[p].cor},${PESSOAS[p].cor}bb)">${avatarDe(p)}</div>
      <b>${dados.pontos[p] || 0} ⭐</b>
      <span>${nomeDe(p)}</span>
    </div>`).join('');

  const abertas = dados.tarefas.filter(t => !t.feito);
  const feitas  = dados.tarefas.filter(t => t.feito);
  const linha = t => `
    <div class="tarefa ${t.feito ? 'feita' : ''}">
      <button class="t-check" data-fazer="${t.id}">${t.feito ? '✅' : '⬜'}</button>
      <div class="t-txt"><b>${escapar(t.txt)}</b>
        <small>${PESSOAS[t.dono].emoji} ${PESSOAS[t.dono].curto} • ${t.pontos} ⭐</small></div>
      <button class="t-apagar" data-apagar="${t.id}">✕</button>
    </div>`;
  lista.innerHTML =
    (abertas.length ? abertas.map(linha).join('') : `<p class="sem-lembrete">Nenhuma tarefa pra fazer agora 🎉</p>`) +
    (feitas.length ? `<div class="bloco-titulo">Já feitas</div>` + feitas.map(linha).join('') : '');

  lista.querySelectorAll('[data-fazer]').forEach(b => b.addEventListener('click', () => marcarTarefa(b.dataset.fazer)));
  lista.querySelectorAll('[data-apagar]').forEach(b => b.addEventListener('click', () => apagarTarefa(b.dataset.apagar)));
}

/* ---------- BACKUP: levar tudo pra outro aparelho ---------- */
async function exportarTudo(){
  toast('Preparando o arquivo... 💾', 4000);
  const arquivos = {};
  const ids = new Set();
  Object.values(dados.msgs).forEach(lista => lista.forEach(m => {
    if(m.id && (m.tipo === 'audio' || m.tipo === 'foto' || m.tipo === 'video')) ids.add(m.id);
  }));
  Object.values(dados.fotos || {}).forEach(id => ids.add(id));
  for(const id of ids){
    const blob = await pegarAudio(id);
    if(blob) arquivos[id] = await blobParaTexto(blob);
  }
  const pacote = { app:'fala-familia', versao:2, quando:new Date().toISOString(), dados, arquivos };
  const blob = new Blob([JSON.stringify(pacote)], { type:'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `fala-familia-${new Date().toISOString().slice(0,10)}.json`;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  const mb = (blob.size / 1048576).toFixed(1);
  toast(`Arquivo salvo! (${mb} MB) 💾`, 5000);
}

function importarTudo(){
  const inp = document.createElement('input');
  inp.type = 'file'; inp.accept = 'application/json,.json';
  inp.addEventListener('change', async () => {
    const arq = inp.files && inp.files[0];
    if(!arq) return;
    try{
      const pacote = JSON.parse(await arq.text());
      if(pacote.app !== 'fala-familia') throw new Error('outro arquivo');
      if(!confirm('Isso vai TROCAR tudo que está neste aparelho pelo que está no arquivo.\nPode ir?')) return;
      toast('Abrindo o backup... 💾', 4000);
      for(const [id, texto] of Object.entries(pacote.arquivos || {})){
        const blob = await (await fetch(texto)).blob();
        await guardarAudio(id, blob);
      }
      localStorage.setItem(CHAVE, JSON.stringify(pacote.dados));
      toast('Pronto! Abrindo de novo... 🎉');
      setTimeout(() => location.reload(), 900);
    }catch(e){ toast('Esse arquivo não é um backup do Fala, Família 😕', 5000); }
  });
  inp.click();
}


/* ---------- ANIVERSÁRIOS ---------- */
/* Guarda a data de nascimento de cada um e mostra quantos dias faltam. */
function diasParaAniversario(iso){
  if(!iso) return null;
  const [ano, mes, dia] = iso.split('-').map(Number);
  const hoje = new Date(); hoje.setHours(0,0,0,0);
  let prox = new Date(hoje.getFullYear(), mes - 1, dia);
  if(prox < hoje) prox = new Date(hoje.getFullYear() + 1, mes - 1, dia);
  return { dias: Math.round((prox - hoje) / 86400000), idade: prox.getFullYear() - ano };
}

function desenharAniversarios(){
  const caixa = document.getElementById('listaAniversarios');
  if(!caixa) return;
  caixa.innerHTML = Object.keys(PESSOAS).map(p => `
    <div class="aniv-linha">
      <span class="aniv-nome">${PESSOAS[p].emoji} ${nomeDe(p)}</span>
      <input type="date" data-nasc="${p}" value="${(dados.nasc && dados.nasc[p]) || ''}">
    </div>`).join('');
  caixa.querySelectorAll('[data-nasc]').forEach(i => i.addEventListener('change', () => {
    dados.nasc = dados.nasc || {};
    if(i.value) dados.nasc[i.dataset.nasc] = i.value; else delete dados.nasc[i.dataset.nasc];
    salvar(); mostrarAniversario();
  }));
}

/* A tarjinha na lista com o aniversário mais pertinho. */
function mostrarAniversario(){
  const caixa = document.getElementById('avisoAniversario');
  if(!caixa) return;
  const nascs = dados.nasc || {};
  let melhor = null;
  Object.keys(nascs).forEach(p => {
    const q = diasParaAniversario(nascs[p]);
    if(q && (!melhor || q.dias < melhor.dias)) melhor = { ...q, p };
  });
  if(!melhor || melhor.dias > 30){ caixa.classList.remove('on'); caixa.innerHTML = ''; return; }
  const nome = souEu(melhor.p) ? 'teu' : 'd' + (PESSOAS[melhor.p].curto === 'Papai' ? 'o papai' : 'a ' + PESSOAS[melhor.p].curto);
  caixa.classList.add('on');
  caixa.innerHTML = melhor.dias === 0
    ? `🎂 <b>Hoje é o aniversário ${nome}!</b> ${melhor.idade} anos 🎉`
    : `🎂 Falta${melhor.dias > 1 ? 'm' : ''} <b>${melhor.dias} dia${melhor.dias > 1 ? 's' : ''}</b> pro aniversário ${nome}`;
  if(melhor.dias === 0 && dados.avisouAniv !== new Date().toISOString().slice(0,10)){
    dados.avisouAniv = new Date().toISOString().slice(0,10); salvar();
    avisar('🎂 Tem aniversário hoje!', `${PESSOAS[melhor.p].curto} está fazendo ${melhor.idade} anos 🎉`, 'aniv');
  }
}

/* ---------- RECADO FIXADO ---------- */
function fixarRecado(indice){
  const m = dados.msgs[atual][indice];
  if(!m) return;
  dados.fixado = dados.fixado || {};
  dados.fixado[atual] = { txt: textoDe(m), de: m.de, ts: m.ts };
  salvar(); desenharFixado();
  toast('Recado fixado no topo ⭐');
}
function tirarFixado(){
  if(dados.fixado) delete dados.fixado[atual];
  salvar(); desenharFixado();
}
function desenharFixado(){
  const caixa = document.getElementById('barraFixado');
  if(!caixa) return;
  const f = dados.fixado && dados.fixado[atual];
  caixa.classList.toggle('on', !!f);
  caixa.innerHTML = f
    ? `<span class="fx-estrela">⭐</span>
       <span class="fx-txt"><b>${PESSOAS[f.de].curto}:</b> ${escapar(f.txt)}</span>
       <button id="fxTirar" title="Tirar do topo">✕</button>` : '';
  const bt = document.getElementById('fxTirar');
  if(bt) bt.addEventListener('click', tirarFixado);
}
