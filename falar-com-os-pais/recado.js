/* =========================================================
   recado.js — o "Recado do dia".

   Um recadinho curto de cada um ("tô na escola 🏫") que aparece
   pra família toda numa fileirinha em cima das conversas. Vale
   por 12 horas e depois some sozinho, senão vira mentira: o
   "tô na escola" de terça não serve pra quinta.

   Viaja embaralhado igual aos recados, no mesmo cantinho dos
   sinais (é coisa pequena e que muda toda hora).
   ========================================================= */

const VALE_RECADO = 12 * 60 * 60 * 1000;    // 12 horas

const RECADOS_PRONTOS = [
  '🏫 tô na escola', '🏠 cheguei em casa', '📚 fazendo a lição', '🎮 jogando',
  '😴 dormindo', '🍽️ comendo', '🚗 no carro', '💼 trabalhando',
  '🥺 com saudade', '😄 feliz hoje!', '🤒 não tô bem', '🎉 dia bom!'
];

const recadoValendo = r => r && r.txt && (Date.now() - (r.ts || 0)) < VALE_RECADO;
const meuRecado = () => (dados.recados || {})[dados.euSou || 'jojo'];

/* ---------- mostrar a fileirinha ---------- */
function desenharRecadosDoDia(){
  const caixa = document.getElementById('recadosDoDia');
  if(!caixa) return;
  const eu = dados.euSou || 'jojo';
  const todos = dados.recados || {};

  /* o meu vem sempre primeiro, mesmo vazio: é o convite pra escrever */
  const ordem = [eu].concat(TODOS.filter(p => p !== eu && recadoValendo(todos[p])));

  caixa.innerHTML = ordem.map(p => {
    const r = todos[p];
    const tem = recadoValendo(r);
    const meu = p === eu;
    return `
      <button class="rec-card ${meu ? 'meu' : ''} ${tem ? '' : 'vazio'}" data-recado="${p}"
        title="${tem ? escapar(r.txt) : 'Dizer o que tu tá fazendo'}">
        <span class="rec-av" style="background:linear-gradient(135deg,${PESSOAS[p].cor},${PESSOAS[p].cor}bb)">${avatarDe(p)}</span>
        <b>${meu ? 'Eu' : PESSOAS[p].curto}</b>
        <span class="rec-txt">${tem ? escapar(r.txt) : '+ o meu'}</span>
      </button>`;
  }).join('');

  caixa.querySelectorAll('[data-recado]').forEach(b => b.addEventListener('click', () => {
    if(b.dataset.recado === eu) escreverMeuRecado();
    else abrir(idDupla(eu, b.dataset.recado));      // toca no dos outros: abre a conversa
  }));
}

/* ---------- escrever o meu ---------- */
function escreverMeuRecado(){
  if(document.getElementById('telaRecadoDia')) return;
  const meu = meuRecado();
  const tela = document.createElement('div');
  tela.className = 'fundo-modal aberto'; tela.id = 'telaRecadoDia';
  tela.innerHTML = `
    <div class="modal">
      <h2>💭 Recado do dia</h2>
      <p class="sub">Uma frase curtinha pra família saber o que tu tá fazendo. Some sozinha depois de 12 horas.</p>
      <div class="campo-form">
        <input id="recadoTxt" maxlength="40" placeholder="Ex.: tô na escola 🏫"
               value="${meu && recadoValendo(meu) ? escapar(meu.txt).replace(/"/g,'&quot;') : ''}">
        <small>Até 40 letrinhas. Todo mundo da família vê.</small>
      </div>
      <div class="rec-prontos" id="recProntos">
        ${RECADOS_PRONTOS.map(t => `<button class="rapida" data-pronto="${t}">${t}</button>`).join('')}
      </div>
      <div class="acoes">
        <button class="btn neutro" id="recApagar">Tirar o meu</button>
        <button class="btn principal" id="recSalvar">Pôr na lista</button>
      </div>
    </div>`;
  document.body.appendChild(tela);

  const campo = document.getElementById('recadoTxt');
  campo.focus();
  tela.addEventListener('click', e => { if(e.target.id === 'telaRecadoDia') tela.remove(); });
  tela.querySelectorAll('[data-pronto]').forEach(b =>
    b.addEventListener('click', () => { campo.value = b.dataset.pronto; campo.focus(); }));
  campo.addEventListener('keydown', e => { if(e.key === 'Enter') document.getElementById('recSalvar').click(); });

  document.getElementById('recSalvar').addEventListener('click', () => {
    const txt = campo.value.trim();
    if(!txt){ toast('Escreve alguma coisa 😊'); return; }
    porMeuRecado(txt); tela.remove();
  });
  document.getElementById('recApagar').addEventListener('click', () => { porMeuRecado(''); tela.remove(); });
}

function porMeuRecado(txt){
  const eu = dados.euSou || 'jojo';
  dados.recados = dados.recados || {};
  if(txt) dados.recados[eu] = { txt, ts: Date.now() };
  else    delete dados.recados[eu];
  salvar();
  desenharRecadosDoDia();
  mandarMeuRecado();
  toast(txt ? 'Recado do dia posto! 💭' : 'Teu recado do dia saiu da lista');
}

/* ---------- ir e vir pelo banco da família ---------- */
async function mandarMeuRecado(){
  if(typeof podeSinalizar !== 'function' || !podeSinalizar()) return;
  const eu = dados.euSou;
  const meu = (dados.recados || {})[eu];
  try{
    /* o escreverSinal já embaralha o que é privado */
    await escreverSinal(`recados/${eu}`, meu ? { txt: meu.txt, ts: meu.ts } : null);
  }catch(e){}
}

async function receberRecados(crus){
  if(!crus) return false;
  let mudou = false;
  dados.recados = dados.recados || {};
  for(const [p, pacote] of Object.entries(crus)){
    if(p === dados.euSou || !PESSOAS[p]) continue;
    let veio = null;
    try{ veio = await desembaralhar(pacote); }catch(e){}
    if(!veio || !veio.txt) continue;
    const tinha = dados.recados[p];
    if(tinha && tinha.ts === veio.ts) continue;
    dados.recados[p] = { txt: String(veio.txt).slice(0,40), ts: veio.ts || Date.now() };
    mudou = true;
  }
  /* os que venceram saem da lista sozinhos */
  Object.keys(dados.recados).forEach(p => {
    if(!recadoValendo(dados.recados[p])){ delete dados.recados[p]; mudou = true; }
  });
  if(mudou){ salvar(); desenharRecadosDoDia(); }
  return mudou;
}

/* de tempos em tempos o meu volta pro banco, senão sumiria da vista dos
   outros quando eles limpassem a sala */
function lembrarMeuRecado(){
  const meu = meuRecado();
  if(recadoValendo(meu)) mandarMeuRecado();
  else desenharRecadosDoDia();
}
