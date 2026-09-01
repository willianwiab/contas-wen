/* =========================================================
   turma.js — 🎒 Fala, Turma!

   O irmão do "Fala, Família", mas pra turma da escola.

   A REGRA QUE MANDA NESTE APP: nem todo mundo da turma tem
   celular. Então nada aqui pode depender de ter um.

   - abre em QUALQUER navegador (computador de casa, da
     escola, celular emprestado);
   - não tem conta nem senha: é o código da turma + escolher
     o teu nome numa lista;
   - tem "modo emprestado", que não guarda nada no aparelho
     dos outros;
   - e dá pra IMPRIMIR o mural, pra quem não tem aparelho
     nenhum receber os recados no papel.
   ========================================================= */

const VERSAO = '1.0.0';
const CHAVE = 'fala-turma:v1';

const CORES = ['#7c3aed','#2563eb','#ec4899','#f59e0b','#16a34a','#0ea5e9','#ef4444','#8b5cf6','#14b8a6','#f97316'];
const BICHOS = ['🦊','🐼','🦉','🐢','🦁','🐨','🐧','🦄','🐸','🦖','🐙','🐝','🦋','🐬','🦜'];

const TIPOS = {
  recado:  { emoji:'💬', nome:'Recado',  cor:'#7c3aed' },
  licao:   { emoji:'📚', nome:'Lição',   cor:'#2563eb' },
  prova:   { emoji:'📝', nome:'Prova',   cor:'#ef4444' },
  combinar:{ emoji:'🎮', nome:'Combinar',cor:'#16a34a' },
  enquete: { emoji:'🗳️', nome:'Enquete', cor:'#f59e0b' }
};

let dados = carregar();
let emprestado = false;      // usando o aparelho de outra pessoa
let relogioPuxar = null;

/* ---------- guardar ---------- */
function padrao(){
  return { eu:null, turma:null, avisos:[], vistos:{}, votos:{}, rascunho:'' };
}
function carregar(){
  try{
    const bruto = sessionStorage.getItem(CHAVE + ':emprestado') || localStorage.getItem(CHAVE);
    if(sessionStorage.getItem(CHAVE + ':emprestado')) emprestado = true;
    const d = bruto ? Object.assign(padrao(), JSON.parse(bruto)) : padrao();
    if(!Array.isArray(d.avisos)) d.avisos = [];
    d.vistos = d.vistos || {}; d.votos = d.votos || {};
    return d;
  }catch(e){ return padrao(); }
}
function salvar(){
  try{
    const txt = JSON.stringify(dados);
    /* no modo emprestado nada fica gravado no aparelho: some quando a
       aba fecha, pra não deixar rastro no celular de quem emprestou */
    if(emprestado) sessionStorage.setItem(CHAVE + ':emprestado', txt);
    else localStorage.setItem(CHAVE, txt);
  }catch(e){}
}

/* ---------- ajudantes ---------- */
const $ = s => document.querySelector(s);
const escapar = t => String(t == null ? '' : t)
  .replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const hora = ts => new Date(ts).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});

const DIAS = ['domingo','segunda','terça','quarta','quinta','sexta','sábado'];
function diaTexto(ts){
  const d = new Date(ts), h = new Date(); h.setHours(0,0,0,0);
  const dia = new Date(d); dia.setHours(0,0,0,0);
  const passou = Math.round((h - dia) / 86400000);
  if(passou === 0) return 'hoje';
  if(passou === 1) return 'ontem';
  if(passou === -1) return 'amanhã';
  if(passou > 1 && passou < 7) return DIAS[d.getDay()];
  return d.toLocaleDateString('pt-BR', { day:'2-digit', month:'2-digit' });
}

let relogioAviso = null;
function aviso(txt, tempo){
  const t = $('#aviso');
  t.textContent = txt; t.classList.add('on');
  clearTimeout(relogioAviso);
  relogioAviso = setTimeout(() => t.classList.remove('on'), tempo || 3200);
}

const corDe = nome => {
  let h = 0;
  for(let i = 0; i < nome.length; i++) h = (h * 31 + nome.charCodeAt(i)) | 0;
  return CORES[Math.abs(h) % CORES.length];
};
const bichoDe = nome => {
  let h = 0;
  for(let i = 0; i < nome.length; i++) h = (h * 17 + nome.charCodeAt(i)) | 0;
  return BICHOS[Math.abs(h) % BICHOS.length];
};

/* ---------- tema ---------- */
function aplicarTema(){
  const escuro = dados.tema === 'escuro';
  document.documentElement.dataset.tema = escuro ? 'escuro' : 'claro';
  $('#btTema').textContent = escuro ? '☀️' : '🌙';
  document.querySelector('meta[name="theme-color"]')
    .setAttribute('content', escuro ? '#171331' : '#7c3aed');
}

/* =========================================================
   A NUVEM DA TURMA
   Mesmo banco do "Fala, Família", num canto separado. O
   código da turma é o nome do canto: quem tem o código entra,
   quem não tem nem sabe onde procurar.
   ========================================================= */
const BANCO = 'https://conversa-com-a-familia-default-rtdb.firebaseio.com';

const endereco = () => `${BANCO}/turmas/${dados.turma.codigo}`;
const naTurma = () => !!(dados.turma && dados.turma.codigo && dados.eu);

/* embaralhar: o banco guarda, mas não entende. A chave nasce do
   segredo que viaja no convite — não do código, que anda por aí. */
const bytes = t => new TextEncoder().encode(t);
const texto = b => new TextDecoder().decode(b);
const paraB64 = buf => btoa(String.fromCharCode(...new Uint8Array(buf)));
const deB64 = t => Uint8Array.from(atob(t), c => c.charCodeAt(0));
let chaveTurma = null;

async function pegarChave(){
  if(chaveTurma) return chaveTurma;
  const base = await crypto.subtle.importKey('raw',
    bytes(dados.turma.segredo || dados.turma.codigo), 'PBKDF2', false, ['deriveKey']);
  chaveTurma = await crypto.subtle.deriveKey(
    { name:'PBKDF2', salt: bytes('fala-turma:' + dados.turma.codigo), iterations: 210000, hash:'SHA-256' },
    base, { name:'AES-GCM', length:256 }, false, ['encrypt','decrypt']);
  return chaveTurma;
}
async function embaralhar(obj){
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const c = await crypto.subtle.encrypt({ name:'AES-GCM', iv }, await pegarChave(), bytes(JSON.stringify(obj)));
  return { iv: paraB64(iv), c: paraB64(c) };
}
async function desembaralhar(p){
  if(!p || typeof p.iv !== 'string' || typeof p.c !== 'string') return null;
  try{
    return JSON.parse(texto(await crypto.subtle.decrypt(
      { name:'AES-GCM', iv: deB64(p.iv) }, await pegarChave(), deB64(p.c))));
  }catch(e){ return null; }
}

/* o que chega foi escrito por outro aparelho: confere antes de usar */
function avisoConfere(a){
  if(!a || typeof a !== 'object' || Array.isArray(a)) return false;
  if(typeof a.de !== 'string' || !a.de.trim() || a.de.length > 30) return false;
  if(typeof a.ts !== 'number' || !isFinite(a.ts) || a.ts > Date.now() + 86400000) return false;
  if(!TIPOS[a.tipo]) return false;
  if(typeof a.txt !== 'string' || !a.txt.trim() || a.txt.length > 600) return false;
  if(a.quando !== undefined && typeof a.quando !== 'string') return false;
  if(a.ops !== undefined && (!Array.isArray(a.ops) || a.ops.length > 6 ||
     a.ops.some(o => typeof o !== 'string' || o.length > 40))) return false;
  return true;
}

async function mandarPraTurma(a){
  if(!naTurma()) return false;
  try{
    const r = await fetch(`${endereco()}/mural/${a.id}.json`, {
      method:'PUT', headers:{'Content-Type':'application/json'},
      body: JSON.stringify(await embaralhar(a))
    });
    if(!r.ok) throw new Error('HTTP ' + r.status);
    marcarNuvem('ligado');
    return true;
  }catch(e){ marcarNuvem('erro'); return false; }
}

async function puxarDaTurma(){
  if(!naTurma() || !navigator.onLine) return;
  try{
    const r = await fetch(`${endereco()}/mural.json?orderBy="$key"&limitToLast=120`);
    if(!r.ok){ marcarNuvem('erro'); return; }
    const tudo = await r.json();
    marcarNuvem('ligado');
    if(!tudo) return;
    let mudou = false;
    for(const [id, pacote] of Object.entries(tudo)){
      const a = await desembaralhar(pacote);
      if(!avisoConfere(a)) continue;
      a.id = id;
      const tem = dados.avisos.find(x => x.id === id);
      if(!tem){ dados.avisos.push(a); mudou = true; }
      else if((a.v || 0) > (tem.v || 0)){ Object.assign(tem, a); mudou = true; }
    }
    if(mudou){ dados.avisos.sort((a,b) => b.ts - a.ts); salvar(); desenharMural(); }
  }catch(e){ marcarNuvem('erro'); }
}

function ligarNuvem(){
  clearInterval(relogioPuxar);
  if(!naTurma()) return;
  marcarNuvem('ligando');
  puxarDaTurma();
  relogioPuxar = setInterval(() => { if(!document.hidden) puxarDaTurma(); }, 9000);
}
function marcarNuvem(estado){
  const chip = $('#chipNuvem');
  if(!chip) return;
  chip.className = 'net ' + estado;
  chip.innerHTML = '<span class="bolinha"></span><span>' + {
    ligado:  '🔵 Turma ' + (dados.turma ? dados.turma.nome : ''),
    ligando: '⏳ Conectando...',
    erro:    '⚠️ Sem conexão — vendo o guardado'
  }[estado] + '</span>';
}

/* =========================================================
   ENTRAR NA TURMA
   ========================================================= */
function mostrar(qual){
  document.querySelectorAll('.tela').forEach(t => t.classList.toggle('on', t.id === 'tela-' + qual));
  /* o ✏️ flutuante só faz sentido em cima do mural */
  $('#btEscrever').classList.toggle('escondido', qual !== 'mural');
  window.scrollTo(0,0);
}

const codigoNovo = () => {
  const letras = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';   // sem I, O, 0, 1: confunde na hora de copiar
  let c = '';
  for(let i = 0; i < 8; i++) c += letras[Math.floor(Math.random() * letras.length)];
  return c;
};

function criarTurma(){
  const nome = ($('#novaTurma').value || '').trim();
  const meu = ($('#meuNomeNovo').value || '').trim();
  if(!nome){ aviso('Põe o nome da turma 😊'); return; }
  if(!meu){ aviso('Põe o teu nome 😊'); return; }
  dados.turma = {
    codigo: codigoNovo(),
    nome: nome.slice(0,40),
    segredo: paraB64(crypto.getRandomValues(new Uint8Array(24)))
  };
  dados.eu = meu.slice(0,30);
  chaveTurma = null;
  salvar(); ligarNuvem(); desenharTudo(); mostrar('mural');
  setTimeout(mostrarConvite, 500);
}

function entrarComConvite(){
  const t = (prompt('Cola aqui o convite que te mandaram:') || '').trim();
  if(!t) return;
  const marca = t.match(/#t=([A-Za-z0-9\-_]+)/);
  const turma = lerConvite(marca ? marca[1] : t);
  if(!turma){ aviso('Esse convite não parece certo 🤔', 5000); return; }
  pedirONome(turma);
}

function lerConvite(txt){
  try{
    let b64 = String(txt).replace(/-/g,'+').replace(/_/g,'/');
    while(b64.length % 4) b64 += '=';
    const o = JSON.parse(decodeURIComponent(escape(atob(b64))));
    if(!o || typeof o.c !== 'string' || !o.c || o.c.length > 40) return null;
    return { codigo: o.c, nome: String(o.n || 'Turma').slice(0,40), segredo: String(o.s || '').slice(0,80) };
  }catch(e){ return null; }
}
function fazerConvite(){
  const t = dados.turma;
  const b64 = btoa(unescape(encodeURIComponent(JSON.stringify({ c:t.codigo, n:t.nome, s:t.segredo }))));
  return location.origin + location.pathname + '#t=' +
    b64.replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}

function mostrarConvite(){
  const link = fazerConvite();
  const txt = `🎒 Entra na "${dados.turma.nome}"!\nAbre este link no celular ou no computador:\n${link}`;
  if(navigator.share) navigator.share({ title:'Fala, Turma!', text: txt }).catch(() => copiar(txt));
  else copiar(txt);
}
function copiar(txt){
  if(navigator.clipboard) navigator.clipboard.writeText(txt)
    .then(() => aviso('Convite copiado! Manda pra turma 📋', 5000))
    .catch(() => prompt('Copia este convite:', txt));
  else prompt('Copia este convite:', txt);
}

/* ---------- quem é você (e o modo emprestado) ---------- */
function pedirONome(turma){
  $('#convTurma').textContent = turma.nome;
  mostrar('quemsou');
  $('#btEntrarTurma').onclick = () => {
    const meu = ($('#meuNome').value || '').trim();
    if(!meu){ aviso('Escreve o teu nome 😊'); return; }
    emprestado = $('#modoEmprestado').checked;
    /* entrando emprestado, nada pode ficar guardado no aparelho do outro */
    if(emprestado) try{ localStorage.removeItem(CHAVE); }catch(e){}
    dados = Object.assign(padrao(), { turma, eu: meu.slice(0,30) });
    chaveTurma = null;
    salvar(); ligarNuvem(); desenharTudo(); mostrar('mural');
    if(emprestado) aviso('📱 Modo emprestado: some quando fechar a aba', 7000);
  };
}

function sairDaTurma(){
  if(!confirm('Sair da turma neste aparelho?\n\nO mural continua lá — é só entrar de novo com o convite.')) return;
  try{ localStorage.removeItem(CHAVE); sessionStorage.removeItem(CHAVE + ':emprestado'); }catch(e){}
  dados = padrao(); emprestado = false; chaveTurma = null;
  clearInterval(relogioPuxar);
  desenharTudo(); mostrar('entrar');
}

/* =========================================================
   O MURAL
   ========================================================= */
function desenharTudo(){
  aplicarTema();
  $('#turmaNome').textContent = dados.turma ? dados.turma.nome : 'Fala, Turma!';
  $('#euSou').textContent = dados.eu ? `${bichoDe(dados.eu)} ${dados.eu}${emprestado ? ' · emprestado' : ''}` : '';
  $('#chipNuvem').classList.toggle('escondido', !naTurma());
  desenharMural();
}

let filtro = 'tudo';

function desenharMural(){
  const caixa = $('#mural');
  if(!caixa) return;
  const lista = dados.avisos
    .filter(a => filtro === 'tudo' || a.tipo === filtro)
    .sort((a,b) => b.ts - a.ts);

  document.querySelectorAll('[data-filtro]').forEach(b =>
    b.classList.toggle('on', b.dataset.filtro === filtro));

  if(!lista.length){
    caixa.innerHTML = `
      <div class="vazio">
        <div class="emojao">🎒</div>
        <h3>${filtro === 'tudo' ? 'Mural vazio' : 'Nada disso ainda'}</h3>
        <p>${filtro === 'tudo'
          ? 'Escreve o primeiro recado aí embaixo. Todo mundo da turma vai ver.'
          : 'Muda o filtro lá em cima pra ver o resto.'}</p>
      </div>`;
    return;
  }

  caixa.innerHTML = lista.map(a => {
    const t = TIPOS[a.tipo];
    const meu = a.de === dados.eu;
    const votos = a.votos || {};
    const meuVoto = votos[dados.eu];
    const conta = {};
    Object.values(votos).forEach(v => conta[v] = (conta[v] || 0) + 1);
    const total = Object.keys(votos).length;

    return `
      <div class="recado" style="--cor:${t.cor}">
        <div class="rec-topo">
          <span class="rec-av" style="background:${corDe(a.de)}">${bichoDe(a.de)}</span>
          <div class="rec-quem"><b>${escapar(a.de)}${meu ? ' (tu)' : ''}</b>
            <small>${diaTexto(a.ts)} · ${hora(a.ts)}</small></div>
          <span class="rec-tipo">${t.emoji} ${t.nome}</span>
        </div>
        ${a.quando ? `<div class="rec-quando">📅 ${escapar(a.quando)}</div>` : ''}
        <div class="rec-txt">${escapar(a.txt)}</div>
        ${a.ops && a.ops.length ? `
          <div class="rec-ops">
            ${a.ops.map((o, i) => `
              <button class="rec-op ${meuVoto === i ? 'on' : ''}" data-voto="${a.id}:${i}">
                <span>${escapar(o)}</span>
                <b>${conta[i] || 0}</b>
              </button>`).join('')}
            <div class="rec-total">${total} ${total === 1 ? 'voto' : 'votos'}</div>
          </div>` : ''}
        <div class="rec-pe">
          <button class="rec-bt ${(a.joia || {})[dados.eu] ? 'on' : ''}" data-joia="${a.id}">👍 ${Object.keys(a.joia || {}).length || ''}</button>
          <button class="rec-bt" data-vi="${a.id}">${(a.vi || {})[dados.eu] ? '👀 vi' : '👀 marcar que vi'}${
            Object.keys(a.vi || {}).length ? ' · ' + Object.keys(a.vi || {}).length : ''}</button>
          ${meu ? `<button class="rec-bt fraco" data-apagar="${a.id}">🗑️</button>` : ''}
        </div>
      </div>`;
  }).join('');

  caixa.querySelectorAll('[data-voto]').forEach(b => b.addEventListener('click', () => {
    const [id, i] = b.dataset.voto.split(':');
    votar(id, +i);
  }));
  caixa.querySelectorAll('[data-joia]').forEach(b =>
    b.addEventListener('click', () => marcar(b.dataset.joia, 'joia')));
  caixa.querySelectorAll('[data-vi]').forEach(b =>
    b.addEventListener('click', () => marcar(b.dataset.vi, 'vi')));
  caixa.querySelectorAll('[data-apagar]').forEach(b =>
    b.addEventListener('click', () => apagarAviso(b.dataset.apagar)));
}

function achar(id){ return dados.avisos.find(a => a.id === id); }

function votar(id, i){
  const a = achar(id);
  if(!a || !a.ops) return;
  a.votos = a.votos || {};
  if(a.votos[dados.eu] === i) delete a.votos[dados.eu];
  else a.votos[dados.eu] = i;
  a.v = (a.v || 0) + 1;
  salvar(); desenharMural(); mandarPraTurma(a);
}
function marcar(id, campo){
  const a = achar(id);
  if(!a) return;
  a[campo] = a[campo] || {};
  if(a[campo][dados.eu]) delete a[campo][dados.eu];
  else a[campo][dados.eu] = Date.now();
  a.v = (a.v || 0) + 1;
  salvar(); desenharMural(); mandarPraTurma(a);
}
async function apagarAviso(id){
  const a = achar(id);
  if(!a || a.de !== dados.eu) return;
  if(!confirm('Apagar este recado do mural da turma?')) return;
  dados.avisos = dados.avisos.filter(x => x.id !== id);
  salvar(); desenharMural();
  try{ await fetch(`${endereco()}/mural/${id}.json`, { method:'PUT', headers:{'Content-Type':'application/json'}, body:'null' }); }
  catch(e){}
  aviso('Apagado 🗑️');
}

/* ---------- escrever ---------- */
let tipoEscolhido = 'recado';

function abrirEscrever(){
  tipoEscolhido = 'recado';
  $('#escTxt').value = dados.rascunho || '';
  $('#escQuando').value = '';
  document.querySelectorAll('.esc-op').forEach(i => i.value = '');
  desenharEscolha();
  mostrar('escrever');
  $('#escTxt').focus();
}

function desenharEscolha(){
  document.querySelectorAll('[data-tipo]').forEach(b =>
    b.classList.toggle('on', b.dataset.tipo === tipoEscolhido));
  const t = TIPOS[tipoEscolhido];
  $('#escTxt').placeholder = {
    recado:  'Ex.: quem pegou meu estojo azul? 😅',
    licao:   'Ex.: matemática, página 42, exercícios 1 a 8',
    prova:   'Ex.: prova de história, capítulos 3 e 4',
    combinar:'Ex.: quem vai no parque sábado de tarde?',
    enquete: 'Ex.: qual filme a gente vê na sexta?'
  }[tipoEscolhido];
  $('#campoQuando').classList.toggle('escondido', !['licao','prova','combinar'].includes(tipoEscolhido));
  $('#camposEnquete').classList.toggle('escondido', tipoEscolhido !== 'enquete');
  $('#escCor').style.background = t.cor;
  $('#escTitulo').textContent = t.emoji + ' ' + t.nome;
}

async function mandarRecado(){
  const txt = ($('#escTxt').value || '').trim();
  if(!txt){ aviso('Escreve alguma coisa 😊'); return; }
  const a = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2,6),
    tipo: tipoEscolhido, txt: txt.slice(0,600), de: dados.eu, ts: Date.now(), v: 0
  };
  const quando = ($('#escQuando').value || '').trim();
  if(quando && !$('#campoQuando').classList.contains('escondido')) a.quando = quando.slice(0,40);
  if(tipoEscolhido === 'enquete'){
    const ops = [...document.querySelectorAll('.esc-op')].map(i => i.value.trim()).filter(Boolean);
    if(ops.length < 2){ aviso('A enquete precisa de pelo menos 2 respostas 😊'); return; }
    a.ops = ops.slice(0,6).map(o => o.slice(0,40));
    a.votos = {};
  }
  dados.avisos.unshift(a);
  dados.rascunho = '';
  salvar(); desenharMural(); mostrar('mural');

  const foi = await mandarPraTurma(a);
  aviso(foi ? 'Mandado pra turma! 🎒' : '⏳ Sem internet — vai sair quando voltar', 5000);
}

/* =========================================================
   🖨️ IMPRIMIR O MURAL
   Pra quem não tem aparelho nenhum: alguém imprime a semana e
   leva pra escola. É a razão de este app existir do jeito que é.
   ========================================================= */
function imprimirMural(){
  const semana = Date.now() - 7 * 86400000;
  const lista = dados.avisos.filter(a => a.ts >= semana).sort((a,b) => b.ts - a.ts);
  if(!lista.length){ aviso('Não tem nada dos últimos 7 dias pra imprimir 😊', 5000); return; }

  const folha = document.createElement('div');
  folha.id = 'folha';
  folha.innerHTML = `
    <h1>🎒 ${escapar(dados.turma.nome)}</h1>
    <p class="folha-sub">Mural dos últimos 7 dias · impresso ${new Date().toLocaleDateString('pt-BR')}</p>
    ${lista.map(a => {
      const t = TIPOS[a.tipo];
      const votos = a.votos || {};
      const conta = {};
      Object.values(votos).forEach(v => conta[v] = (conta[v] || 0) + 1);
      return `
        <div class="folha-item">
          <div class="folha-topo"><b>${t.emoji} ${t.nome}</b>
            <span>${escapar(a.de)} · ${diaTexto(a.ts)}</span></div>
          ${a.quando ? `<div class="folha-quando">📅 ${escapar(a.quando)}</div>` : ''}
          <div>${escapar(a.txt)}</div>
          ${a.ops ? `<ul class="folha-ops">${a.ops.map((o,i) =>
            `<li>${escapar(o)} — ${conta[i] || 0} voto(s)</li>`).join('')}</ul>` : ''}
        </div>`;
    }).join('')}
    <p class="folha-pe">Fala, Turma! · quem não tem celular também fica sabendo 💜</p>`;
  document.body.appendChild(folha);
  document.body.classList.add('imprimindo');
  setTimeout(() => {
    window.print();
    setTimeout(() => { folha.remove(); document.body.classList.remove('imprimindo'); }, 400);
  }, 120);
}

/* =========================================================
   LIGAR TUDO
   ========================================================= */
$('#btCriarTurma').addEventListener('click', criarTurma);
$('#btTenhoConvite').addEventListener('click', entrarComConvite);
$('#btEscrever').addEventListener('click', abrirEscrever);
$('#btVoltarEsc').addEventListener('click', () => {
  dados.rascunho = $('#escTxt').value; salvar(); mostrar('mural');
});
$('#btMandar').addEventListener('click', mandarRecado);
$('#btConvidar').addEventListener('click', mostrarConvite);
$('#btImprimir').addEventListener('click', imprimirMural);
$('#btSair').addEventListener('click', sairDaTurma);
$('#btTema').addEventListener('click', () => {
  dados.tema = dados.tema === 'escuro' ? 'claro' : 'escuro';
  salvar(); aplicarTema();
});
document.querySelectorAll('[data-tipo]').forEach(b => b.addEventListener('click', () => {
  tipoEscolhido = b.dataset.tipo; desenharEscolha();
}));
document.querySelectorAll('[data-filtro]').forEach(b => b.addEventListener('click', () => {
  filtro = b.dataset.filtro; desenharMural();
}));
$('#escTxt').addEventListener('input', () => { dados.rascunho = $('#escTxt').value; });
window.addEventListener('online', puxarDaTurma);

/* ---------- começar ---------- */
function comecar(){
  aplicarTema();
  $('#versao').textContent = 'v' + VERSAO;
  $('#versao2').textContent = 'v' + VERSAO;

  const marca = location.hash.match(/^#t=(.+)$/);
  if(marca){
    const turma = lerConvite(marca[1]);
    history.replaceState(null, '', location.pathname);
    if(turma){
      /* já estou nesta turma neste aparelho? entra direto */
      if(dados.turma && dados.turma.codigo === turma.codigo && dados.eu){
        ligarNuvem(); desenharTudo(); mostrar('mural'); return;
      }
      pedirONome(turma); return;
    }
    aviso('Esse convite não parece certo 🤔', 5000);
  }

  if(naTurma()){ ligarNuvem(); desenharTudo(); mostrar('mural'); }
  else { desenharTudo(); mostrar('entrar'); }
}
comecar();

if('serviceWorker' in navigator && location.protocol.startsWith('http')){
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}
