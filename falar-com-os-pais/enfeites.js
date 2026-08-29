/* =========================================================
   enfeites.js — papel de parede, confete, código secreto,
   modo soneca e o site lendo o recado em voz alta.
   ========================================================= */

/* ---------- PAPEL DE PAREDE ---------- */
const PAPEIS = {
  bolinhas: { nome:'Bolinhas', emoji:'🟣' },
  coracoes: { nome:'Corações', emoji:'💜' },
  estrelas: { nome:'Estrelas', emoji:'⭐' },
  listras : { nome:'Listras',  emoji:'🎽' },
  liso    : { nome:'Liso',     emoji:'⬜' }
};

function papelDaConversa(id){ return (dados.papel && dados.papel[id]) || 'bolinhas'; }

function aplicarPapel(){
  const tela = document.querySelector('.conversa');
  if(tela && atual) tela.dataset.papel = papelDaConversa(atual);
}

function abrirPapeis(){
  const tela = document.createElement('div');
  tela.className = 'fundo-modal aberto'; tela.id = 'modalPapel';
  tela.innerHTML = `
    <div class="modal">
      <h2>🎨 Papel de parede</h2>
      <p class="sub">Escolhe o fundo desta conversa. Cada conversa pode ter o seu.</p>
      <div class="papeis">
        ${Object.entries(PAPEIS).map(([k,p]) => `
          <button class="papel-op ${papelDaConversa(atual) === k ? 'on' : ''}" data-papel="${k}">
            <span class="papel-mostra" data-papel="${k}"></span>${p.emoji} ${p.nome}
          </button>`).join('')}
      </div>
      <div class="acoes"><button class="btn neutro" id="papFechar">Fechar</button></div>
    </div>`;
  document.body.appendChild(tela);
  const fecha = () => tela.remove();
  tela.addEventListener('click', e => { if(e.target.id === 'modalPapel') fecha(); });
  document.getElementById('papFechar').addEventListener('click', fecha);
  tela.querySelectorAll('.papel-op').forEach(b => b.addEventListener('click', () => {
    dados.papel = dados.papel || {};
    dados.papel[atual] = b.dataset.papel;
    salvar(); aplicarPapel();
    tela.querySelectorAll('.papel-op').forEach(o => o.classList.toggle('on', o === b));
  }));
}

/* ---------- CONFETE ---------- */
const EMOJI_FESTA = ['🎉','🥳','🎂','🎊','🏆','🎈','🎁'];

function temFesta(txt){ return !!txt && EMOJI_FESTA.some(e => txt.includes(e)); }

function confete(){
  const caixa = document.createElement('div');
  caixa.className = 'confete-caixa';
  const cores = ['#7c3aed','#2563eb','#ec4899','#f59e0b','#22c55e','#38bdf8'];
  for(let i = 0; i < 34; i++){
    const p = document.createElement('span');
    p.style.left = Math.random() * 100 + '%';
    p.style.background = cores[i % cores.length];
    p.style.animationDelay = (Math.random() * .5) + 's';
    p.style.animationDuration = (1.6 + Math.random() * 1.4) + 's';
    p.style.transform = `rotate(${Math.random() * 360}deg)`;
    caixa.appendChild(p);
  }
  document.body.appendChild(caixa);
  setTimeout(() => caixa.remove(), 3200);
}

/* ---------- CÓDIGO SECRETO ---------- */
/* Língua do P: cada pedacinho ganha um "p" — casa vira capasapa. */
function linguaDoP(txt){
  return txt.replace(/[aeiouáéíóúâêôãõà]/gi, v => v + 'p' + v.toLowerCase());
}
function aoContrario(txt){
  return txt.split(' ').map(pal => [...pal].reverse().join('')).join(' ');
}

function abrirCodigo(){
  const tela = document.createElement('div');
  tela.className = 'fundo-modal aberto'; tela.id = 'modalCodigo';
  tela.innerHTML = `
    <div class="modal">
      <h2>🔤 Código secreto</h2>
      <p class="sub">Escreve normal, escolhe o código e manda embaralhado. Quem souber o truque decifra! 😜</p>
      <div class="campo-form">
        <label>O que tu quer dizer</label>
        <input id="codTxt" placeholder="Ex.: vamos fugir da lição" maxlength="120">
      </div>
      <div class="campo-form">
        <label>Como embaralhar</label>
        <div class="tm-opcoes">
          <button class="tm-op on" data-cod="p">🅿️ Língua do P</button>
          <button class="tm-op" data-cod="tras">🔄 Ao contrário</button>
        </div>
      </div>
      <div class="campo-form">
        <label>Vai ficar assim</label>
        <div class="cod-previa" id="codPrevia">…</div>
      </div>
      <div class="acoes">
        <button class="btn neutro" id="codCancelar">Cancelar</button>
        <button class="btn principal" id="codMandar">Mandar 🔐</button>
      </div>
    </div>`;
  document.body.appendChild(tela);
  let modo = 'p';
  const converte = t => modo === 'p' ? linguaDoP(t) : aoContrario(t);
  const atualiza = () => {
    const t = document.getElementById('codTxt').value.trim();
    document.getElementById('codPrevia').textContent = t ? converte(t) : '…';
  };
  document.getElementById('codTxt').addEventListener('input', atualiza);
  tela.querySelectorAll('.tm-op').forEach(b => b.addEventListener('click', () => {
    modo = b.dataset.cod;
    tela.querySelectorAll('.tm-op').forEach(o => o.classList.toggle('on', o === b));
    atualiza();
  }));
  const fecha = () => tela.remove();
  tela.addEventListener('click', e => { if(e.target.id === 'modalCodigo') fecha(); });
  document.getElementById('codCancelar').addEventListener('click', fecha);
  document.getElementById('codTxt').focus();
  document.getElementById('codMandar').addEventListener('click', () => {
    const t = document.getElementById('codTxt').value.trim();
    if(!t){ toast('Escreve alguma coisa 😊'); return; }
    fecha(); enviar('🔐 ' + converte(t));
  });
}

/* ---------- MODO SONECA ---------- */
function sonecaLigada(){ return !!(dados.soneca && Date.now() < dados.soneca); }

function porSoneca(minutos){
  if(minutos === 0){ delete dados.soneca; salvar(); desenharSoneca(); toast('Avisos voltaram 🔔'); return; }
  if(minutos === 'manha'){
    const m = new Date(); m.setHours(8,0,0,0);
    if(m <= new Date()) m.setDate(m.getDate() + 1);
    dados.soneca = m.getTime();
  }else dados.soneca = Date.now() + minutos * 60000;
  salvar(); desenharSoneca();
  toast(`Soneca até ${hora(dados.soneca)} 🔕`);
}

function desenharSoneca(){
  const caixa = document.getElementById('estadoSoneca');
  if(!caixa) return;
  caixa.textContent = sonecaLigada()
    ? `🔕 Silenciado até ${hora(dados.soneca)}`
    : '🔔 Os avisos estão ligados';
  const bt = document.getElementById('sonecaOff');
  if(bt) bt.classList.toggle('escondido', !sonecaLigada());
}

/* ---------- LER EM VOZ ALTA ---------- */
function podeFalar(){ return 'speechSynthesis' in window; }

function lerEmVozAlta(indice){
  if(!podeFalar()){ toast('Este navegador não sabe ler em voz alta 😕'); return; }
  const m = dados.msgs[atual][indice];
  if(!m) return;
  if(speechSynthesis.speaking){ speechSynthesis.cancel(); return; }
  const fala = new SpeechSynthesisUtterance(textoDe(m));
  fala.lang = 'pt-BR'; fala.rate = .95; fala.pitch = 1.05;
  speechSynthesis.speak(fala);
  toast('Lendo... 🗣️');
}
