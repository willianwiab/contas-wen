/* =========================================================
   casa.js — as telas da família: álbum de fotos e vídeos,
   agenda da semana e o bichinho que cresce quando todo
   mundo conversa.
   ========================================================= */

/* ---------- ÁLBUM ---------- */
const MESES = ['janeiro','fevereiro','março','abril','maio','junho',
               'julho','agosto','setembro','outubro','novembro','dezembro'];

function juntarMidias(){
  const tudo = [];
  CONVERSAS.forEach(c => (dados.msgs[c.id] || []).forEach(m => {
    if(m.tipo === 'foto' || m.tipo === 'video') tudo.push({ ...m, conversa:c.id, nomeConversa:c.nome });
  }));
  return tudo.sort((a,b) => b.ts - a.ts);
}

async function abrirAlbum(){
  if(document.getElementById('telaAlbum')) return;
  const midias = juntarMidias();
  const tela = document.createElement('div');
  tela.className = 'tela-cheia'; tela.id = 'telaAlbum';
  tela.innerHTML = `
    <div class="w-topo">
      <button class="icone" id="alFechar">✕</button>
      <div><b>🖼️ Álbum da família</b><div class="w-sub">${midias.length} lembrança(s) guardada(s)</div></div>
    </div>
    <div class="al-meio" id="alMeio">${
      midias.length ? '' : '<p class="sem-lembrete" style="text-align:center;padding:30px">Nenhuma foto ou vídeo ainda. Manda um! 📷</p>'
    }</div>`;
  document.body.appendChild(tela);
  document.getElementById('alFechar').addEventListener('click', () => tela.remove());

  const meio = document.getElementById('alMeio');
  let mesAtual = '';
  for(const m of midias){
    const d = new Date(m.ts);
    const mes = `${MESES[d.getMonth()]} de ${d.getFullYear()}`;
    if(mes !== mesAtual){
      mesAtual = mes;
      meio.insertAdjacentHTML('beforeend', `<div class="al-mes">${mes}</div><div class="al-grade"></div>`);
    }
    const grade = meio.querySelector('.al-grade:last-of-type');
    const cel = document.createElement('button');
    cel.className = 'al-cel';
    cel.innerHTML = `<div class="foto-carregando">${m.tipo === 'video' ? '🎥' : '📷'}</div>
                     <span class="al-onde">${m.nomeConversa}</span>`;
    grade.appendChild(cel);

    const url = m.b64 || await (async () => {
      const blob = await pegarAudio(m.id);
      return blob ? URL.createObjectURL(blob) : null;
    })();
    if(!url){ cel.querySelector('.foto-carregando').textContent = '😕'; continue; }
    cel.insertAdjacentHTML('afterbegin', m.tipo === 'video'
      ? `<video src="${url}" muted playsinline preload="metadata"></video><span class="al-selo">▶</span>`
      : `<img src="${url}" alt="" loading="lazy">`);
    cel.querySelector('.foto-carregando').remove();
    cel.addEventListener('click', () => verGrande(url, m.tipo === 'video'));
  }
}

function verGrande(url, ehVideo){
  const tela = document.createElement('div');
  tela.className = 'tela-cheia foto-grande';
  tela.innerHTML = `<button class="fg-fechar">✕</button>` + (ehVideo
    ? `<video src="${url}" controls autoplay playsinline></video>`
    : `<img src="${url}" alt="">`);
  tela.addEventListener('click', e => { if(e.target.tagName !== 'VIDEO') tela.remove(); });
  document.body.appendChild(tela);
}

/* ---------- AGENDA DA SEMANA ---------- */
function abrirAgenda(){
  if(document.getElementById('telaAgenda')) return;
  const hoje = new Date().toISOString().slice(0,10);
  const tela = document.createElement('div');
  tela.className = 'tela-cheia'; tela.id = 'telaAgenda';
  tela.innerHTML = `
    <div class="w-topo">
      <button class="icone" id="agFechar">✕</button>
      <div><b>📅 Agenda da família</b><div class="w-sub">os combinados da semana</div></div>
    </div>
    <div class="t-meio">
      <div class="t-form">
        <input id="agTxt" placeholder="O que é? Ex.: dentista" maxlength="50">
        <input type="date" id="agDia" value="${hoje}">
        <input type="time" id="agHora" value="15:00">
        <button id="agAdd">Marcar</button>
      </div>
      <div id="listaAgenda"></div>
    </div>`;
  document.body.appendChild(tela);
  document.getElementById('agFechar').addEventListener('click', () => tela.remove());
  document.getElementById('agAdd').addEventListener('click', novoCompromisso);
  desenharAgenda();
}

function novoCompromisso(){
  const txt = document.getElementById('agTxt').value.trim();
  const dia = document.getElementById('agDia').value;
  const hora = document.getElementById('agHora').value;
  if(!txt || !dia || !hora){ toast('Falta preencher alguma coisa 😊'); return; }
  dados.agenda = dados.agenda || [];
  dados.agenda.push({ id:'g' + Date.now(), txt, dia, hora, quem: autor });
  dados.agenda.sort((a,b) => (a.dia + a.hora).localeCompare(b.dia + b.hora));
  salvar(); desenharAgenda(); mostrarProximo();
  document.getElementById('agTxt').value = '';
  toast('Marcado na agenda! 📅');
  if(!avisoLigado()) pedirAvisos();
}

function apagarCompromisso(id){
  dados.agenda = (dados.agenda || []).filter(g => g.id !== id);
  salvar(); desenharAgenda(); mostrarProximo();
}

function diaBonito(iso){
  const hoje = new Date().toISOString().slice(0,10);
  const amanha = new Date(Date.now() + 86400000).toISOString().slice(0,10);
  if(iso === hoje) return 'HOJE';
  if(iso === amanha) return 'AMANHÃ';
  const d = new Date(iso + 'T12:00');
  return d.toLocaleDateString('pt-BR', { weekday:'long', day:'2-digit', month:'2-digit' }).toUpperCase();
}

function desenharAgenda(){
  const caixa = document.getElementById('listaAgenda');
  if(!caixa) return;
  const hoje = new Date().toISOString().slice(0,10);
  const lista = (dados.agenda || []).filter(g => g.dia >= hoje);
  if(!lista.length){
    caixa.innerHTML = `<p class="sem-lembrete">Nada marcado ainda. Que tal “sexta 19h — pizza”? 🍕</p>`;
    return;
  }
  let dia = '';
  caixa.innerHTML = lista.map(g => {
    const sep = g.dia !== dia ? (dia = g.dia, `<div class="bloco-titulo">${diaBonito(g.dia)}</div>`) : '';
    return `${sep}
      <div class="tarefa">
        <span class="ag-hora">${g.hora}</span>
        <div class="t-txt"><b>${escapar(g.txt)}</b><small>${PESSOAS[g.quem].emoji} marcou ${PESSOAS[g.quem].curto}</small></div>
        <button class="t-apagar" data-agapagar="${g.id}">✕</button>
      </div>`;
  }).join('');
  caixa.querySelectorAll('[data-agapagar]').forEach(b =>
    b.addEventListener('click', () => apagarCompromisso(b.dataset.agapagar)));
}

/* Tarjinha na lista com o próximo combinado. */
function mostrarProximo(){
  const caixa = document.getElementById('avisoAgenda');
  if(!caixa) return;
  const agora = new Date();
  const hoje = agora.toISOString().slice(0,10);
  const relogio = `${String(agora.getHours()).padStart(2,'0')}:${String(agora.getMinutes()).padStart(2,'0')}`;
  const prox = (dados.agenda || []).find(g => g.dia > hoje || (g.dia === hoje && g.hora >= relogio));
  caixa.classList.toggle('on', !!prox);
  caixa.innerHTML = prox ? `📅 <b>${diaBonito(prox.dia).toLowerCase()} ${prox.hora}</b> — ${escapar(prox.txt)}` : '';
}

/* Toca o aviso na hora marcada. */
function verAgenda(){
  const agora = new Date();
  const hoje = agora.toISOString().slice(0,10);
  const relogio = `${String(agora.getHours()).padStart(2,'0')}:${String(agora.getMinutes()).padStart(2,'0')}`;
  let mudou = false;
  (dados.agenda || []).forEach(g => {
    if(g.avisou || g.dia !== hoje || g.hora > relogio) return;
    g.avisou = true; mudou = true;
    toast(`📅 Agora: ${g.txt}`, 5000);
    avisar('📅 Chegou a hora!', g.txt, 'agenda');
    blim(true);
  });
  if(mudou){ salvar(); mostrarProximo(); }
}
setInterval(verAgenda, 30000);

/* ---------- BICHINHO DA FAMÍLIA ---------- */
const FASES = [
  { nivel:1, emoji:'🥚', nome:'ovinho' },
  { nivel:2, emoji:'🐣', nome:'saindo do ovo' },
  { nivel:3, emoji:'🐥', nome:'pintinho' },
  { nivel:4, emoji:'🐤', nome:'crescido' },
  { nivel:5, emoji:'🦜', nome:'papagaio' },
  { nivel:6, emoji:'🦄', nome:'lendário' }
];

/* A força do bichinho vem de quantos dias cada um mandou recado. */
function contaBicho(){
  const dias = {};
  Object.values(dados.msgs).forEach(lista => lista.forEach(m => {
    const dia = new Date(m.ts).toISOString().slice(0,10);
    (dias[dia] = dias[dia] || new Set()).add(m.de);
  }));
  const xp = Object.values(dias).reduce((s, gente) => s + gente.size, 0);
  const hoje = new Date().toISOString().slice(0,10);
  const hojeGente = dias[hoje] ? dias[hoje].size : 0;
  const nivel = Math.min(FASES.length, Math.floor(xp / 12) + 1);
  const fase = FASES[nivel - 1];
  const humor = hojeGente === 0 ? { cara:'😴', txt:'com sono — ninguém falou hoje' }
    : hojeGente === 1 ? { cara:'🙂', txt:'acordou! 1 pessoa falou hoje' }
    : hojeGente < Object.keys(PESSOAS).length ? { cara:'😃', txt:`animado — ${hojeGente} pessoas falaram hoje` }
    : { cara:'🤩', txt:'super feliz — a família toda falou hoje!' };
  const faltam = (nivel * 12) - xp;
  return { xp, nivel, fase, humor, hojeGente, faltam: Math.max(0, faltam),
           pct: Math.min(100, Math.round(((xp % 12) / 12) * 100)) };
}

function desenharBicho(){
  const caixa = document.getElementById('cardBicho');
  if(!caixa) return;
  const b = contaBicho();
  const nome = (dados.bicho && dados.bicho.nome) || 'Fofinho';
  caixa.innerHTML = `
    <span class="bi-emoji">${b.fase.emoji}</span>
    <div class="bi-txt"><b>${escapar(nome)} ${b.humor.cara}</b><small>${b.humor.txt}</small>
      <div class="bi-barra"><span style="width:${b.pct}%"></span></div></div>`;
  caixa.classList.add('on');
}

function abrirBicho(){
  if(document.getElementById('telaBicho')) return;
  const b = contaBicho();
  const nome = (dados.bicho && dados.bicho.nome) || 'Fofinho';
  const tela = document.createElement('div');
  tela.className = 'tela-cheia'; tela.id = 'telaBicho';
  tela.innerHTML = `
    <div class="w-topo">
      <button class="icone" id="biFechar">✕</button>
      <div><b>🐣 O bichinho da família</b><div class="w-sub">ele cresce quando todo mundo conversa</div></div>
    </div>
    <div class="w-meio">
      <div class="bi-grandao">${b.fase.emoji}</div>
      <h2 style="font-size:1.4rem">${escapar(nome)} ${b.humor.cara}</h2>
      <p class="lig-txt">${b.humor.txt}</p>
      <div class="bi-info">
        <div><b>Nível ${b.nivel}</b><span>${b.fase.nome}</span></div>
        <div><b>${b.xp} ⭐</b><span>força</span></div>
        <div><b>${b.faltam}</b><span>pro próximo nível</span></div>
      </div>
      <div class="bi-barra grande"><span style="width:${b.pct}%"></span></div>
      <p class="lig-txt">Cada pessoa que manda recado num dia dá <b>1 de força</b>.
      Se a família toda falar todo dia, ele cresce rapidinho! 🚀</p>
      <div class="lig-botoes"><button class="lig-bt" id="biNome">✏️ Trocar o nome</button></div>
    </div>`;
  document.body.appendChild(tela);
  document.getElementById('biFechar').addEventListener('click', () => tela.remove());
  document.getElementById('biNome').addEventListener('click', () => {
    const novo = (prompt('Como o bichinho vai se chamar?', nome) || '').trim();
    if(!novo) return;
    dados.bicho = { nome: novo.slice(0,20) }; salvar();
    tela.remove(); desenharBicho(); abrirBicho();
  });
}
