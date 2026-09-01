/* =========================================================
   meu.js — as coisas que são de cada um:
   🌡️ como tu tá se sentindo · 📚 os livros que tu leu.

   Ficam neste aparelho. O humor a família vê (se o ☁️ estiver
   ligado); a estante é de quem escreveu.
   ========================================================= */

/* ============ 🌡️ COMO TU TÁ SE SENTINDO ============ */
const HUMORES = [
  { id:'otimo',  emoji:'🤩', nome:'Ótimo',    cor:'#22c55e' },
  { id:'bem',    emoji:'😄', nome:'Bem',      cor:'#84cc16' },
  { id:'normal', emoji:'🙂', nome:'Normal',   cor:'#eab308' },
  { id:'triste', emoji:'😢', nome:'Triste',   cor:'#0ea5e9' },
  { id:'bravo',  emoji:'😡', nome:'Bravo',    cor:'#ef4444' },
  { id:'cansado',emoji:'😴', nome:'Cansado',  cor:'#a855f7' },
  { id:'doente', emoji:'🤒', nome:'Doentinho',cor:'#f97316' }
];
const humorPor = id => HUMORES.find(h => h.id === id);
const diaDeHoje = () => new Date().toISOString().slice(0,10);

function abrirHumor(){
  if(document.getElementById('telaHumor')) return;
  dados.humor = dados.humor || {};
  const hoje = dados.humor[diaDeHoje()];

  const tela = document.createElement('div');
  tela.className = 'tela-cheia'; tela.id = 'telaHumor';
  tela.innerHTML = `
    <div class="w-topo" style="background:linear-gradient(135deg,#f97316,#ec4899)">
      <button class="icone" id="huFechar">✕</button>
      <div><b>🌡️ Como tu tá?</b><div class="w-sub">uma carinha por dia</div></div>
    </div>
    <div class="hu-meio">
      <div class="bloco-titulo">Hoje eu tô...</div>
      <div class="hu-escolhas">
        ${HUMORES.map(h => `<button class="hu-bt ${hoje === h.id ? 'on' : ''}" data-humor="${h.id}"
          style="--cor:${h.cor}"><span>${h.emoji}</span>${h.nome}</button>`).join('')}
      </div>
      <div class="bloco-titulo">Como foi o teu mês</div>
      <div class="hu-mes" id="huMes"></div>
      <div class="hu-resumo" id="huResumo"></div>
      <p class="sem-lembrete" style="margin-top:14px">Isto é só teu, fica neste aparelho. Serve pra olhar depois e
      perceber as coisas — dias ruins acontecem, e passam. 💜</p>
    </div>`;
  document.body.appendChild(tela);
  document.getElementById('huFechar').addEventListener('click', () => tela.remove());
  tela.querySelectorAll('[data-humor]').forEach(b => b.addEventListener('click', () => {
    const id = b.dataset.humor;
    if(dados.humor[diaDeHoje()] === id) delete dados.humor[diaDeHoje()];
    else dados.humor[diaDeHoje()] = id;
    salvar();
    tela.querySelectorAll('[data-humor]').forEach(o =>
      o.classList.toggle('on', o.dataset.humor === dados.humor[diaDeHoje()]));
    desenharMesDoHumor();
    const h = humorPor(id);
    if(dados.humor[diaDeHoje()]) toast(`${h.emoji} Anotado: hoje tu tá ${h.nome.toLowerCase()}`);
  }));
  desenharMesDoHumor();
}

function desenharMesDoHumor(){
  const caixa = document.getElementById('huMes');
  const resumo = document.getElementById('huResumo');
  if(!caixa) return;
  const hoje = new Date();
  const dias = [];
  for(let i = 29; i >= 0; i--){
    const d = new Date(hoje); d.setDate(hoje.getDate() - i);
    dias.push(d.toISOString().slice(0,10));
  }
  caixa.innerHTML = dias.map(dia => {
    const h = humorPor(dados.humor[dia]);
    const n = +dia.slice(8);
    return `<div class="hu-dia ${h ? '' : 'vazio'}" style="${h ? 'background:' + h.cor : ''}"
      title="${dia}${h ? ' — ' + h.nome : ''}">${h ? h.emoji : n}</div>`;
  }).join('');

  const marcados = dias.map(d => dados.humor[d]).filter(Boolean);
  if(!resumo) return;
  if(!marcados.length){ resumo.textContent = 'Marca a primeira carinha aí em cima 😊'; return; }
  const conta = {};
  marcados.forEach(id => conta[id] = (conta[id] || 0) + 1);
  const mais = humorPor(Object.entries(conta).sort((a,b) => b[1] - a[1])[0][0]);
  resumo.innerHTML = `Nestes 30 dias tu marcou <b>${marcados.length}</b> dia${marcados.length === 1 ? '' : 's'},
    e o mais comum foi <b>${mais.emoji} ${mais.nome}</b>.`;
}

/* ============ 📚 OS LIVROS QUE EU LI ============ */
function abrirEstante(){
  if(document.getElementById('telaLivros')) return;
  if(!Array.isArray(dados.livros)) dados.livros = [];

  const tela = document.createElement('div');
  tela.className = 'tela-cheia'; tela.id = 'telaLivros';
  tela.innerHTML = `
    <div class="w-topo" style="background:linear-gradient(135deg,#0891b2,#16a34a)">
      <button class="icone" id="lvFechar">✕</button>
      <div><b>📚 A minha estante</b><div class="w-sub">os livros que tu leu</div></div>
    </div>
    <div class="lv-meio">
      <div class="lv-form">
        <input id="lvTitulo" placeholder="Nome do livro" maxlength="60">
        <input id="lvAutor" placeholder="Quem escreveu (opcional)" maxlength="40">
        <div class="lv-estrelas" id="lvEstrelas">
          ${[1,2,3,4,5].map(n => `<button data-estrela="${n}">☆</button>`).join('')}
        </div>
        <button id="lvAdd">📚 Pôr na estante</button>
      </div>
      <div class="lv-lista" id="lvLista"></div>
    </div>`;
  document.body.appendChild(tela);

  let estrelas = 5;
  const pintarEstrelas = () => tela.querySelectorAll('[data-estrela]').forEach(b =>
    b.textContent = +b.dataset.estrela <= estrelas ? '★' : '☆');
  tela.querySelectorAll('[data-estrela]').forEach(b =>
    b.addEventListener('click', () => { estrelas = +b.dataset.estrela; pintarEstrelas(); }));
  pintarEstrelas();

  document.getElementById('lvFechar').addEventListener('click', () => tela.remove());
  document.getElementById('lvAdd').addEventListener('click', () => {
    const titulo = document.getElementById('lvTitulo').value.trim();
    if(!titulo){ toast('Escreve o nome do livro 😊'); return; }
    dados.livros.push({
      id: 'l' + Date.now(), titulo,
      autor: document.getElementById('lvAutor').value.trim(),
      estrelas, quem: dados.euSou || 'jojo', ts: Date.now()
    });
    salvar(); desenharEstante();
    document.getElementById('lvTitulo').value = '';
    document.getElementById('lvAutor').value = '';
    blim(true);
    toast('Mais um livro na estante! 📚');
  });
  document.getElementById('lvTitulo').addEventListener('keydown',
    e => { if(e.key === 'Enter') document.getElementById('lvAdd').click(); });

  desenharEstante();
}

function desenharEstante(){
  const caixa = document.getElementById('lvLista');
  if(!caixa) return;
  const livros = (dados.livros || []).slice().sort((a,b) => b.ts - a.ts);
  if(!livros.length){
    caixa.innerHTML = `<div class="ia-aviso"><div class="balao-deco">📚</div><h3>Estante vazia</h3>
      <p>Acabou de ler alguma coisa? Põe aí em cima e dá as estrelas que tu achar justo.</p></div>`;
    return;
  }
  const total = livros.length;
  caixa.innerHTML = `<div class="lv-conta">${total} livro${total === 1 ? '' : 's'} lido${total === 1 ? '' : 's'} 🎉</div>` +
    livros.map(l => `
      <div class="lv-livro">
        <div class="lv-lombada" style="background:linear-gradient(160deg,${PESSOAS[l.quem]?.cor || '#7c3aed'},${PESSOAS[l.quem]?.cor || '#7c3aed'}99)">📖</div>
        <div class="lv-txt">
          <b>${escapar(l.titulo)}</b>
          ${l.autor ? `<small>${escapar(l.autor)}</small>` : ''}
          <div class="lv-nota">${'★'.repeat(l.estrelas)}${'☆'.repeat(5 - l.estrelas)} • ${nomeDe(l.quem)}</div>
        </div>
        <button class="t-apagar" data-tiralivro="${l.id}">✕</button>
      </div>`).join('');
  caixa.querySelectorAll('[data-tiralivro]').forEach(b => b.addEventListener('click', () => {
    dados.livros = dados.livros.filter(l => l.id !== b.dataset.tiralivro);
    salvar(); desenharEstante();
  }));
}
