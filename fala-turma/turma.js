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

const VERSAO = '2.3.0';
const CHAVE = 'fala-turma:v1';

const CORES = ['#7c3aed','#2563eb','#ec4899','#f59e0b','#16a34a','#0ea5e9','#ef4444','#8b5cf6','#14b8a6','#f97316'];
const BICHOS = ['🦊','🐼','🦉','🐢','🦁','🐨','🐧','🦄','🐸','🦖','🐙','🐝','🦋','🐬','🦜'];

const TIPOS = {
  recado:  { emoji:'💬', nome:'Recado',  cor:'#7c3aed' },
  licao:   { emoji:'📚', nome:'Lição',   cor:'#2563eb', temData:true, temFeito:true },
  prova:   { emoji:'📝', nome:'Prova',   cor:'#ef4444', temData:true, contagem:true },
  combinar:{ emoji:'🎮', nome:'Combinar',cor:'#16a34a', temData:true },
  enquete: { emoji:'🗳️', nome:'Enquete', cor:'#f59e0b' },
  evento:  { emoji:'🎉', nome:'Passeio',  cor:'#ec4899', temData:true, temLugar:true, temQuemVai:true },
  vaquinha:{ emoji:'💰', nome:'Vaquinha', cor:'#0891b2', temAlvo:true },
  aniver:  { emoji:'🎂', nome:'Aniversário', cor:'#f97316', temData:true }
};

/* quantos dias faltam pra uma data (aaaa-mm-dd) */
function diasAte(iso){
  if(!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const [a, m, d] = iso.split('-').map(Number);
  const alvo = new Date(a, m - 1, d); alvo.setHours(0,0,0,0);
  const hoje = new Date(); hoje.setHours(0,0,0,0);
  return Math.round((alvo - hoje) / 86400000);
}
function faltaTexto(dias){
  if(dias === null) return '';
  if(dias < 0)  return `foi há ${-dias} dia${dias === -1 ? '' : 's'}`;
  if(dias > 300) return `faltam ${Math.round(dias / 30)} meses`;
  if(dias === 0) return 'É HOJE!';
  if(dias === 1) return 'É AMANHÃ!';
  return `faltam ${dias} dias`;
}
const dataBonita = iso => {
  if(!iso) return '';
  const [a,m,d] = iso.split('-');
  return `${d}/${m}`;
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
  if(a.data !== undefined && (typeof a.data !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(a.data))) return false;
  if(a.foto !== undefined && (typeof a.foto !== 'string' || !/^data:image\//.test(a.foto) ||
     a.foto.length > 400000)) return false;
  if(a.lugar !== undefined && a.lugar !== null){
    const l = a.lugar;
    if(typeof l !== 'object' || typeof l.lat !== 'number' || typeof l.lon !== 'number') return false;
    if(Math.abs(l.lat) > 90 || Math.abs(l.lon) > 180) return false;
  }
  if(a.alvo !== undefined && (typeof a.alvo !== 'number' || !isFinite(a.alvo) || a.alvo < 0 || a.alvo > 1e6)) return false;
  if(a.resp !== undefined && (typeof a.resp !== 'object' || typeof a.resp.txt !== 'string' ||
     a.resp.txt.length > 200)) return false;
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
    puxarTodasPrivadas();
    puxarCaras();
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
    escola: ($('#novaEscola').value || '').trim().slice(0,60),
    prof: ($('#novaProf').value || '').trim().slice(0,40),
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
    return { codigo: o.c, nome: String(o.n || 'Turma').slice(0,40),
             escola: String(o.e || '').slice(0,60), prof: String(o.p || '').slice(0,40),
             segredo: String(o.s || '').slice(0,80) };
  }catch(e){ return null; }
}
function fazerConvite(){
  const t = dados.turma;
  const b64 = btoa(unescape(encodeURIComponent(JSON.stringify(
    { c:t.codigo, n:t.nome, e:t.escola || '', p:t.prof || '', s:t.segredo }))));
  return location.origin + location.pathname + '#t=' +
    b64.replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}

function mostrarConvite(){
  const link = fazerConvite();
  const onde = dados.turma.escola ? ` da ${dados.turma.escola}` : '';
  const txt = `🎒 Entra na "${dados.turma.nome}"${onde}!\nAbre este link no celular ou no computador:\n${link}`;
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
  $('#convEscola').textContent = [turma.escola, turma.prof].filter(Boolean).join(' · ');
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
  const linhaEscola = $('#escolaNome');
  const daEscola = dados.turma ? [dados.turma.escola, dados.turma.prof].filter(Boolean).join(' · ') : '';
  linhaEscola.textContent = daEscola;
  linhaEscola.classList.toggle('escondido', !daEscola);
  $('#euChip').classList.toggle('escondido', !dados.eu);
  $('#btGente').classList.toggle('escondido', !naTurma());
  if(dados.eu){
    $('#euAv').innerHTML = caraDe(dados.eu);
    $('#euSou').textContent = dados.eu + (emprestado ? ' · emprestado' : '');
  }
  $('#chipNuvem').classList.toggle('escondido', !naTurma());
  desenharMural();
}

let filtro = 'tudo';

function desenharMural(){
  const caixa = $('#mural');
  if(!caixa) return;
  const lista = dados.avisos
    .filter(a => filtro === 'tudo' || a.tipo === filtro)
    .sort((a,b) => (b.fixado ? 1 : 0) - (a.fixado ? 1 : 0) || b.ts - a.ts);

  /* cada filtro mostra quantos tem: sem isso a pessoa toca num filtro
     vazio sem saber, e parece que o app perdeu os recados */
  document.querySelectorAll('[data-filtro]').forEach(b => {
    const f = b.dataset.filtro;
    const n = f === 'tudo' ? dados.avisos.length : dados.avisos.filter(a => a.tipo === f).length;
    b.classList.toggle('on', f === filtro);
    b.classList.toggle('vazio-f', n === 0);
    const conta = b.querySelector('i');
    if(conta) conta.textContent = n;
  });

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

    /* aniversário conta pro PRÓXIMO — o ano é o de nascimento */
    const dias = a.data ? (a.tipo === 'aniver' ? diasDoAno(a.data) : diasAte(a.data)) : null;
    const feito = !!(dados.feitos || {})[a.id];
    const denuncias = Object.keys(a.denuncias || {}).length;

    /* escondido por quem viu: 2 pessoas marcando já basta pra tirar da
       frente de todo mundo — melhor esconder demais do que de menos */
    if(denuncias >= 2 && !meu && !escondidosAbertos.has(a.id)) return `
      <div class="recado escondido-turma">
        <div class="rec-txt">🚨 Um recado foi escondido porque a turma avisou que era ruim.
        <button class="rec-bt" data-vermesmo="${a.id}">ver mesmo assim</button></div>
      </div>`;

    return `
      <div class="recado ${a.fixado ? 'fixado' : ''} ${feito ? 'feito' : ''}" style="--cor:${t.cor}">
        ${a.fixado ? '<div class="rec-fixado">📌 Fixado</div>' : ''}
        <div class="rec-topo">
          <span class="rec-av" style="background:${corDe(a.de)}">${caraDe(a.de)}</span>
          <div class="rec-quem"><b>${escapar(a.de)}${meu ? ' (tu)' : ''}</b>
            <small>${diaTexto(a.ts)} · ${hora(a.ts)}</small></div>
          <span class="rec-tipo">${t.emoji} ${t.nome}</span>
        </div>
        ${a.resp ? `<div class="rec-citado">↩️ <b>${escapar(a.resp.de)}</b>: ${escapar(a.resp.txt)}</div>` : ''}
        ${dias !== null && t.contagem ? `
          <div class="conta-grande ${dias <= 1 ? 'perto' : ''} ${dias < 0 ? 'passou' : ''}">
            <b>${faltaTexto(dias)}</b><small>${dataBonita(a.data)}</small>
          </div>` : ''}
        ${a.data && !t.contagem ? `<div class="rec-quando">📅 ${dataBonita(a.data)} · ${faltaTexto(dias)}</div>` : ''}
        ${a.quando ? `<div class="rec-quando">📅 ${escapar(a.quando)}</div>` : ''}
        <div class="rec-txt">${comLinks(escapar(a.txt))}</div>
        ${a.foto ? `<img class="rec-foto" src="${a.foto}" alt="foto do quadro" loading="lazy" data-foto="${a.id}">` : ''}
        ${a.lugar ? `<a class="rec-mapa" target="_blank" rel="noopener"
           href="https://www.openstreetmap.org/?mlat=${a.lugar.lat}&mlon=${a.lugar.lon}#map=17/${a.lugar.lat}/${a.lugar.lon}">📍 Ver onde é no mapa</a>` : ''}
        ${t.temQuemVai ? balaoQuemVai(a) : ''}
        ${t.temAlvo ? balaoVaquinha(a) : ''}
        ${a.ops && a.ops.length ? `
          <div class="rec-ops">
            ${a.ops.map((o, i) => {
              const n = conta[i] || 0;
              const pct = total ? Math.round(n / total * 100) : 0;
              return `
              <button class="rec-op ${meuVoto === i ? 'on' : ''}" data-voto="${a.id}:${i}">
                <span class="barra" style="width:${pct}%"></span>
                <span>${escapar(o)}</span>
                <b>${n}${n ? ` · ${pct}%` : ''}</b>
              </button>`;
            }).join('')}
            <div class="rec-total">${total} ${total === 1 ? 'voto' : 'votos'}${
              meuVoto === undefined ? ' · toca pra votar' : ''}</div>
          </div>` : ''}
        ${desenharReacoes(a)}
        <div class="rec-pe">
          <button class="rec-bt" data-reagir="${a.id}">😀</button>
          <button class="rec-bt" data-responder="${a.id}">↩️</button>
          ${t.temFeito ? `<button class="rec-bt ${feito ? 'on' : ''}" data-feito="${a.id}">${
            feito ? '✅ já fiz' : '⬜ já fiz'}</button>` : ''}
          <button class="rec-bt" data-vi="${a.id}">${(a.vi || {})[dados.eu] ? '👀 vi' : '👀 vi?'}${
            Object.keys(a.vi || {}).length ? ' · ' + Object.keys(a.vi || {}).length : ''}</button>
          <button class="rec-bt ${a.fixado ? 'on' : ''}" data-fixar="${a.id}">📌</button>
          ${meu ? `<button class="rec-bt fraco" data-apagar="${a.id}">🗑️</button>`
                : `<button class="rec-bt fraco" data-denunciar="${a.id}" title="Avisar que este recado é ruim">🚨</button>`}
        </div>
      </div>`;
  }).join('');

  caixa.querySelectorAll('[data-voto]').forEach(b => b.addEventListener('click', () => {
    const [id, i] = b.dataset.voto.split(':');
    votar(id, +i);
  }));
  caixa.querySelectorAll('[data-reagir]').forEach(b =>
    b.addEventListener('click', () => abrirReacoes(b.dataset.reagir, b)));
  caixa.querySelectorAll('[data-emoji]').forEach(b => b.addEventListener('click', () => {
    const [id, e] = b.dataset.emoji.split('|'); reagir(id, e);
  }));
  caixa.querySelectorAll('[data-responder]').forEach(b =>
    b.addEventListener('click', () => responderA(b.dataset.responder)));
  caixa.querySelectorAll('[data-feito]').forEach(b =>
    b.addEventListener('click', () => marcarFeito(b.dataset.feito)));
  caixa.querySelectorAll('[data-denunciar]').forEach(b =>
    b.addEventListener('click', () => denunciar(b.dataset.denunciar)));
  caixa.querySelectorAll('[data-vermesmo]').forEach(b =>
    b.addEventListener('click', () => { escondidosAbertos.add(b.dataset.vermesmo); desenharMural(); }));
  caixa.querySelectorAll('[data-foto]').forEach(b =>
    b.addEventListener('click', () => verFotoGrande(b.getAttribute('src'))));
  caixa.querySelectorAll('[data-vai]').forEach(b => {
    const [id, v] = b.dataset.vai.split('|'); b.addEventListener('click', () => euVou(id, v));
  });
  caixa.querySelectorAll('[data-levar]').forEach(b =>
    b.addEventListener('click', () => euLevo(b.dataset.levar)));
  caixa.querySelectorAll('[data-poravaquinha]').forEach(b =>
    b.addEventListener('click', () => porNaVaquinha(b.dataset.poravaquinha)));
  caixa.querySelectorAll('[data-vi]').forEach(b =>
    b.addEventListener('click', () => marcar(b.dataset.vi, 'vi')));
  caixa.querySelectorAll('[data-fixar]').forEach(b =>
    b.addEventListener('click', () => fixar(b.dataset.fixar)));
  if(typeof desenharAvisosDoTopo === 'function') desenharAvisosDoTopo();
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

function fixar(id){
  const a = achar(id);
  if(!a) return;
  a.fixado = !a.fixado;
  a.v = (a.v || 0) + 1;
  salvar(); desenharMural(); mandarPraTurma(a);
  aviso(a.fixado ? '📌 Fixado no topo do mural' : 'Tirado do topo');
}

/* ---------- 🔗 link escrito vira link ----------
   Roda DEPOIS de escapar o texto, e só aceita http, https e www.:
   assim nada que alguém escrever vira HTML nem "javascript:". */
const REGEX_LINK = /\b((?:https?:\/\/|www\.)[^\s<>"']+)/gi;
function comLinks(escapado){
  return escapado.replace(REGEX_LINK, bruto => {
    let fim = '';
    const sobra = bruto.match(/[.,!?;:)\]}]+$/);
    if(sobra){ fim = sobra[0]; bruto = bruto.slice(0, -fim.length); }
    if(!bruto) return fim;
    let e = bruto.replace(/&amp;/g,'&');
    if(!/^https?:\/\//i.test(e)) e = 'https://' + e;
    return `<a href="${e.replace(/"/g,'%22')}" target="_blank" rel="noopener noreferrer">${bruto}</a>` + fim;
  });
}

/* ---------- 👥 quem está na turma ----------
   Não existe lista de membros no banco (ninguém "se cadastra"): a turma
   é quem apareceu no mural. Então a lista nasce de quem escreveu, votou,
   marcou que viu ou deu joinha. */
/* ---------- 🏫 a ficha da turma ---------- */
function desenharFicha(){
  const t = dados.turma || {};
  $('#fichaEscola').textContent = t.escola || 'Sem escola posta ainda';
  $('#fichaTurma').textContent = t.nome || '—';
  $('#fichaProf').textContent = t.prof || '';
  $('#fichaProfLinha').classList.toggle('escondido', !t.prof);
}

/* Qualquer um da turma pode arrumar: não tem dono nem professor
   mandando aqui. O que muda fica só neste aparelho — pra valer
   pra turma inteira, o jeito é mandar o convite de novo. */
function arrumarFicha(){
  if(!dados.turma) return;
  const escola = prompt('Nome da escola:', dados.turma.escola || '');
  if(escola === null) return;
  const prof = prompt('Professor(a) (pode deixar vazio):', dados.turma.prof || '');
  if(prof === null) return;
  dados.turma.escola = escola.trim().slice(0,60);
  dados.turma.prof = prof.trim().slice(0,40);
  salvar(); desenharTudo(); desenharFicha();
  aviso('🏫 Arrumado! Manda o convite de novo pra turma ver igual', 6000);
}

function abrirGente(){
  const conta = {};
  dados.avisos.forEach(a => {
    const somar = (nome, campo) => {
      if(!nome) return;
      conta[nome] = conta[nome] || { recados:0, votos:0, vistos:0, ultimo:0 };
      conta[nome][campo]++;
      conta[nome].ultimo = Math.max(conta[nome].ultimo, a.ts);
    };
    somar(a.de, 'recados');
    Object.keys(a.votos || {}).forEach(n => somar(n, 'votos'));
    Object.keys(a.vi || {}).forEach(n => somar(n, 'vistos'));
    Object.keys(a.reacoes || {}).forEach(n => somar(n, 'vistos'));
    Object.keys(a.vai || {}).forEach(n => somar(n, 'vistos'));
    Object.keys(a.deram || {}).forEach(n => somar(n, 'vistos'));
    Object.keys(a.jeitos || {}).forEach(n => somar(n, 'vistos'));
  });
  if(dados.eu) conta[dados.eu] = conta[dados.eu] || { recados:0, votos:0, vistos:0, ultimo:0 };

  const gente = Object.entries(conta).sort((a,b) => b[1].recados - a[1].recados || a[0].localeCompare(b[0]));
  $('#codigoTurma').textContent = dados.turma ? dados.turma.codigo : '--------';
  desenharFicha();
  $('#listaGente').innerHTML = gente.map(([nome, c]) => `
    <div class="pessoa ${nome === dados.eu ? 'sou-eu' : ''}">
      <div class="pessoa-av" style="background:${corDe(nome)}">${caraDe(nome)}</div>
      <b>${escapar(nome)}${nome === dados.eu ? ' (tu)' : ''}</b>
      <small>${c.recados ? c.recados + ' recado' + (c.recados > 1 ? 's' : '') : 'só olhando'}</small>
    </div>`).join('');
  redesenharCaras();
  mostrar('gente');
}

/* ---------- escrever ---------- */
let tipoEscolhido = 'recado';

function abrirEscrever(){
  if(!respondendo) tipoEscolhido = 'recado';
  $('#escTxt').value = dados.rascunho || '';
  $('#escData').value = '';
  $('#escAlvo').value = '';
  $('#lugarPego').textContent = '';
  lugarEscolhido = null;
  fotoEscolhida = null;
  $('#escFotoPrevia').classList.add('escondido');
  $('#escFotoPrevia').innerHTML = '';
  document.querySelectorAll('.esc-op, .esc-item').forEach(i => i.value = '');
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
    enquete: 'Ex.: qual filme a gente vê na sexta?',
    evento:  'Ex.: passeio no zoológico! Ponto de encontro no portão',
    vaquinha:'Ex.: presente da professora',
    aniver:  'Ex.: aniversário da Ana'
  }[tipoEscolhido];
  $('#campoQuando').classList.toggle('escondido', !t.temData);
  $('#camposEnquete').classList.toggle('escondido', tipoEscolhido !== 'enquete');
  $('#camposItens').classList.toggle('escondido', !t.temQuemVai);
  $('#campoLugar').classList.toggle('escondido', !t.temLugar);
  $('#campoAlvo').classList.toggle('escondido', !t.temAlvo);
  $('#escCor').style.background = t.cor;
  $('#escTitulo').textContent = t.emoji + ' ' + t.nome;
  $('#citando').classList.toggle('escondido', !respondendo);
  if(respondendo) $('#citando').innerHTML =
    `<span>↩️ respondendo <b>${escapar(respondendo.de)}</b>: ${escapar(respondendo.txt).slice(0,50)}</span>
     <button class="bt fraco" id="pararResp">✕</button>`;
  const pr = document.getElementById('pararResp');
  if(pr) pr.addEventListener('click', () => { respondendo = null; desenharEscolha(); });
}

async function mandarRecado(){
  const txt = ($('#escTxt').value || '').trim();
  if(!txt){ aviso('Escreve alguma coisa 😊'); return; }
  const a = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2,6),
    tipo: tipoEscolhido, txt: txt.slice(0,600), de: dados.eu, ts: Date.now(), v: 0
  };
  const t = TIPOS[tipoEscolhido];
  const data = $('#escData').value;
  if(data && t.temData) a.data = data;
  if(fotoEscolhida) a.foto = fotoEscolhida;
  if(lugarEscolhido && t.temLugar) a.lugar = lugarEscolhido;
  if(respondendo) a.resp = respondendo;
  if(t.temQuemVai){
    a.vai = {};
    const itens = [...document.querySelectorAll('.esc-item')].map(i => i.value.trim()).filter(Boolean);
    if(itens.length) a.itens = itens.slice(0,6).map(x => ({ txt: x.slice(0,40), quem:'' }));
  }
  if(t.temAlvo){
    const alvo = parseFloat(String($('#escAlvo').value).replace(',','.'));
    if(isFinite(alvo) && alvo > 0) a.alvo = Math.min(999999, Math.round(alvo * 100) / 100);
    a.deram = {};
  }
  if(tipoEscolhido === 'enquete'){
    const ops = [...document.querySelectorAll('.esc-op')].map(i => i.value.trim()).filter(Boolean);
    if(ops.length < 2){ aviso('A enquete precisa de pelo menos 2 respostas 😊'); return; }
    a.ops = ops.slice(0,6).map(o => o.slice(0,40));
    a.votos = {};
  }
  dados.avisos.unshift(a);
  dados.rascunho = '';
  respondendo = null; fotoEscolhida = null; lugarEscolhido = null;
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
    ${dados.turma.escola ? `<p class="folha-escola">🏫 ${escapar(dados.turma.escola)}${
      dados.turma.prof ? ` · ${escapar(dados.turma.prof)}` : ''}</p>` : ''}
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
$('#btConvidar2').addEventListener('click', mostrarConvite);
$('#euChip').addEventListener('click', trocarMinhaCara);
$('#btPorCara').addEventListener('click', trocarMinhaCara);
$('#btTirarCara').addEventListener('click', tirarMinhaCara);
$('#btArrumarFicha').addEventListener('click', arrumarFicha);
$('#btGente').addEventListener('click', abrirGente);
$('#btVoltarGente').addEventListener('click', () => mostrar('mural'));
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
$('#btFoto').addEventListener('click', escolherFoto);
$('#btLugarAqui').addEventListener('click', pegarLugar);
document.querySelectorAll('[data-ir]').forEach(b => b.addEventListener('click', () => {
  const onde = b.dataset.ir;
  if(onde === 'album') abrirAlbum();
  if(onde === 'privadas') abrirPrivadas();
  if(onde === 'transporte') abrirTransporte();
  if(onde === 'tempo'){ mostrar('tempo'); verOTempo(); }
  if(onde === 'instalar'){ mostrar('instalar'); verSeJaInstalou(); }
}));
$('#btVoltarAlbum').addEventListener('click', () => mostrar('mural'));
$('#btVoltarPriv').addEventListener('click', () => mostrar('mural'));
$('#btVoltarTr').addEventListener('click', () => mostrar('mural'));
$('#btVoltarTempo').addEventListener('click', () => mostrar('mural'));
$('#btVoltarInst').addEventListener('click', () => mostrar('mural'));
$('#btInstalarJa').addEventListener('click', instalarAgora);
$('#btVoltarConversa').addEventListener('click', fecharConversa);
$('#btPvMandar').addEventListener('click', mandarPrivada);
$('#pvEntrada').addEventListener('keydown', e => { if(e.key === 'Enter') mandarPrivada(); });
$('#horaSaida').addEventListener('change', () => {
  dados.horaSaida = $('#horaSaida').value;
  /* trocar a hora só derruba o que foi visto por hora — as listas
     de semana e mês são do dia inteiro e continuam valendo */
  Object.keys(dados.tempo || {}).forEach(k => { if(k.includes('|')) delete dados.tempo[k]; });
  salvar(); verOTempo();
});

/* ---------- ⏰ que dia é hoje e que horas são ---------- */
const DIAS_LONGOS = ['domingo','segunda-feira','terça-feira','quarta-feira','quinta-feira','sexta-feira','sábado'];
const MESES_LONGOS = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
function relogio(){
  const d = new Date();
  const el = $('#agora');
  if(el) el.textContent = `📅 ${DIAS_LONGOS[d.getDay()]}, ${d.getDate()} de ${MESES_LONGOS[d.getMonth()]} · ⏰ ${
    String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}
relogio();
setInterval(relogio, 20000);

let lugarEscolhido = null;
async function pegarLugar(){
  const bt = $('#btLugarAqui');
  bt.disabled = true; bt.textContent = '📍 Procurando...';
  const onde = await ondeEstou(12000);
  bt.disabled = false; bt.textContent = '📍 É aqui onde eu estou';
  if(!onde){ aviso('O GPS não respondeu 😕 tenta lá fora', 5000); return; }
  lugarEscolhido = onde;
  $('#lugarPego').textContent = `✅ Lugar guardado (${onde.lat.toFixed(3)}, ${onde.lon.toFixed(3)})`;
}
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

/* =========================================================
   🔄 O APP SE CONSERTA SOZINHO

   O celular guarda o site pra abrir sem internet — só que aí
   ele às vezes fica preso numa versão velha e a pessoa não vê
   as coisas novas de jeito nenhum.

   Então: a gente pergunta ao servidor (sem deixar o navegador
   trapacear com o cache) qual é a versão que está no ar. Se for
   diferente da que está rodando aqui, joga fora tudo que estava
   guardado e recarrega — UMA VEZ SÓ, senão vira um pião.
   ========================================================= */
async function verSeTemVersaoNova(){
  if(!location.protocol.startsWith('http')) return;
  try{
    const r = await fetch('./versao.json?' + Date.now(), { cache:'no-store' });
    if(!r.ok) return;
    const nova = (await r.json()).v;
    if(!nova || nova === VERSAO) return;

    /* o pião: se já tentei consertar pra esta mesma versão e ainda
       assim não pegou, paro e aviso, em vez de recarregar pra sempre */
    const jaTentei = sessionStorage.getItem('fala-turma:consertando');
    if(jaTentei === nova){
      aviso('⚠️ Tem uma versão nova (' + nova + ') que não quer descer. ' +
            'Fecha o app de vez e abre de novo.', 12000);
      return;
    }
    sessionStorage.setItem('fala-turma:consertando', nova);
    aviso('🔄 Chegou a versão ' + nova + '! Atualizando...', 6000);

    if(window.caches) for(const nome of await caches.keys()) await caches.delete(nome);
    if(navigator.serviceWorker){
      const regs = await navigator.serviceWorker.getRegistrations();
      for(const reg of regs) await reg.unregister();
    }
    setTimeout(() => location.reload(), 800);
  }catch(e){}
}
setTimeout(verSeTemVersaoNova, 1500);
window.addEventListener('online', verSeTemVersaoNova);

/* =========================================================
   AS COISAS QUE VÃO EM CIMA DE QUALQUER RECADO
   ========================================================= */
const EMOJIS = ['👍','❤️','😂','😮','😢','🎉'];
const escondidosAbertos = new Set();

function desenharReacoes(a){
  const r = a.reacoes || {};
  const conta = {};
  Object.values(r).forEach(e => conta[e] = (conta[e] || 0) + 1);
  const usados = Object.keys(conta);
  if(!usados.length) return '';
  return `<div class="rec-reacoes">${usados.map(e => `
    <button class="rec-reacao ${r[dados.eu] === e ? 'on' : ''}" data-emoji="${a.id}|${e}">${e} ${conta[e]}</button>`).join('')}</div>`;
}

function abrirReacoes(id, botao){
  const antigo = document.getElementById('menuEmoji');
  if(antigo){ antigo.remove(); if(antigo.dataset.de === id) return; }
  const menu = document.createElement('div');
  menu.id = 'menuEmoji'; menu.className = 'menu-emoji'; menu.dataset.de = id;
  menu.innerHTML = EMOJIS.map(e => `<button data-emoji="${id}|${e}">${e}</button>`).join('');
  botao.parentElement.insertBefore(menu, botao);
  menu.querySelectorAll('[data-emoji]').forEach(b => b.addEventListener('click', () => {
    const [i, e] = b.dataset.emoji.split('|');
    menu.remove(); reagir(i, e);
  }));
}

function reagir(id, emoji){
  const a = achar(id);
  if(!a) return;
  a.reacoes = a.reacoes || {};
  if(a.reacoes[dados.eu] === emoji) delete a.reacoes[dados.eu];
  else a.reacoes[dados.eu] = emoji;
  a.v = (a.v || 0) + 1;
  salvar(); desenharMural(); mandarPraTurma(a);
}

/* ---------- ↩️ responder ---------- */
let respondendo = null;
function responderA(id){
  const a = achar(id);
  if(!a) return;
  respondendo = { de: a.de, txt: (a.txt || '').slice(0,200) };
  abrirEscrever();
  aviso('↩️ Respondendo ' + a.de, 4000);
}

/* ---------- ✅ já fiz (só neste aparelho) ---------- */
function marcarFeito(id){
  dados.feitos = dados.feitos || {};
  if(dados.feitos[id]) delete dados.feitos[id];
  else { dados.feitos[id] = Date.now(); }
  salvar(); desenharMural();
  aviso(dados.feitos[id] ? '✅ Marcado como feito (só pra ti)' : 'Desmarcado');
}

/* ---------- 🚨 avisar de recado ruim ---------- */
function denunciar(id){
  const a = achar(id);
  if(!a) return;
  if(!confirm('🚨 Avisar que este recado é ruim?\n\n' +
      'Com 2 avisos ele some da frente de todo mundo.\n\n' +
      'Se for coisa séria, conta pra um adulto também — o app não substitui isso.')) return;
  a.denuncias = a.denuncias || {};
  a.denuncias[dados.eu] = Date.now();
  a.v = (a.v || 0) + 1;
  salvar(); desenharMural(); mandarPraTurma(a);
  aviso('🚨 Avisado. Conta pra um adulto se for sério 💜', 8000);
}

/* ---------- 📸 a foto grande ---------- */
function verFotoGrande(src){
  const tela = document.createElement('div');
  tela.className = 'foto-grande';
  tela.innerHTML = `<button class="fg-x">✕</button><img src="${src}" alt="">`;
  tela.addEventListener('click', () => tela.remove());
  document.body.appendChild(tela);
}

/* =========================================================
   🎉 PASSEIO: quem vai e quem leva o quê
   ========================================================= */
function balaoQuemVai(a){
  const vai = a.vai || {};
  const sim = Object.entries(vai).filter(([,v]) => v === 'sim').map(([n]) => n);
  const nao = Object.entries(vai).filter(([,v]) => v === 'nao').map(([n]) => n);
  const talvez = Object.entries(vai).filter(([,v]) => v === 'talvez').map(([n]) => n);
  const meu = vai[dados.eu];
  const itens = a.itens || [];

  return `
    <div class="evento">
      <div class="ev-titulo">Tu vai?</div>
      <div class="ev-botoes">
        ${[['sim','✅ Vou'],['talvez','🤔 Talvez'],['nao','❌ Não vou']].map(([v, txt]) =>
          `<button class="ev-bt ${meu === v ? 'on ' + v : ''}" data-vai="${a.id}|${v}">${txt}</button>`).join('')}
      </div>
      <div class="ev-gente">
        ${sim.length ? `<b>✅ ${sim.length} vão:</b> ${sim.map(escapar).join(', ')}` : '<i>ninguém confirmou ainda</i>'}
        ${talvez.length ? `<br><b>🤔 ${talvez.length} talvez:</b> ${talvez.map(escapar).join(', ')}` : ''}
        ${nao.length ? `<br><b>❌ ${nao.length} não:</b> ${nao.map(escapar).join(', ')}` : ''}
      </div>
      ${itens.length ? `
        <div class="ev-titulo" style="margin-top:12px">Quem leva o quê</div>
        <div class="ev-itens">
          ${itens.map((it, i) => `
            <button class="ev-item ${it.quem ? 'pego' : ''}" data-levar="${a.id}|${i}">
              <span>${escapar(it.txt)}</span>
              <b>${it.quem ? '✅ ' + escapar(it.quem) : 'eu levo!'}</b>
            </button>`).join('')}
        </div>` : ''}
    </div>`;
}

function euVou(id, v){
  const a = achar(id);
  if(!a) return;
  a.vai = a.vai || {};
  if(a.vai[dados.eu] === v) delete a.vai[dados.eu];
  else a.vai[dados.eu] = v;
  a.v = (a.v || 0) + 1;
  salvar(); desenharMural(); mandarPraTurma(a);
}

function euLevo(marca){
  const [id, i] = marca.split('|');
  const a = achar(id);
  if(!a || !a.itens || !a.itens[+i]) return;
  const it = a.itens[+i];
  if(it.quem && it.quem !== dados.eu){
    aviso(`${it.quem} já pegou esse 😊`); return;
  }
  it.quem = it.quem === dados.eu ? '' : dados.eu;
  a.v = (a.v || 0) + 1;
  salvar(); desenharMural(); mandarPraTurma(a);
}

/* =========================================================
   💰 VAQUINHA
   O dinheiro NÃO passa pelo app: aqui é só a conta de quem já
   deu e quanto falta. Quem junta o dinheiro é uma pessoa de
   verdade — e isso está escrito na tela.
   ========================================================= */
function balaoVaquinha(a){
  const deram = a.deram || {};
  const total = Object.values(deram).reduce((s, v) => s + (+v || 0), 0);
  const alvo = a.alvo || 0;
  const pct = alvo ? Math.min(100, Math.round(total / alvo * 100)) : 0;
  const meu = deram[dados.eu];

  return `
    <div class="evento">
      <div class="vq-numeros">
        <b>R$ ${total.toFixed(2).replace('.',',')}</b>
        ${alvo ? `<small>de R$ ${alvo.toFixed(2).replace('.',',')}</small>` : ''}
      </div>
      ${alvo ? `<div class="vq-barra-fora"><div class="vq-barra" style="width:${pct}%"></div></div>` : ''}
      <div class="ev-gente">
        ${Object.keys(deram).length
          ? Object.entries(deram).map(([n, v]) => `${escapar(n)} R$ ${(+v).toFixed(2).replace('.',',')}`).join(' · ')
          : '<i>ninguém pôs ainda</i>'}
      </div>
      <button class="ev-bt largo" data-poravaquinha="${a.id}">${meu ? `✏️ Eu pus R$ ${(+meu).toFixed(2).replace('.',',')}` : '💰 Eu vou dar...'}</button>
      <p class="vq-aviso">⚠️ O dinheiro <b>não passa por aqui</b>. Isto é só a conta — quem junta é uma pessoa de verdade.</p>
    </div>`;
}

function porNaVaquinha(id){
  const a = achar(id);
  if(!a) return;
  const agora = (a.deram || {})[dados.eu];
  const txt = prompt('Quanto tu vai dar? (só o número, ex.: 5)', agora != null ? String(agora) : '');
  if(txt === null) return;
  const v = parseFloat(String(txt).replace(',','.'));
  a.deram = a.deram || {};
  if(!txt.trim() || !isFinite(v) || v <= 0) delete a.deram[dados.eu];
  else a.deram[dados.eu] = Math.min(9999, Math.round(v * 100) / 100);
  a.v = (a.v || 0) + 1;
  salvar(); desenharMural(); mandarPraTurma(a);
}
