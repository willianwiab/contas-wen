/* =========================================================
   nuvem.js — envio de verdade entre aparelhos, usando um
   banco Firebase (Realtime Database) da própria família.

   Como funciona:
   - cada família tem uma "sala" com um código sorteado;
   - o recado é EMBARALHADO (AES-GCM) com a senha da família
     antes de sair do aparelho, então nem o servidor entende;
   - manda com um PUT normal e escuta com EventSource, o
     jeito do próprio Firebase — sem baixar biblioteca nenhuma.
   ========================================================= */

const LIMITE_ANEXO = 400000;   // arquivos maiores que isso não viajam (~300 KB)

/* Configuração de fábrica da família: com o endereço do banco preenchido aqui,
   ninguém precisa digitar nada — só a senha da família na primeira abertura. */
const NUVEM_PADRAO = {
  modo: 'firebase',
  url : 'https://conversa-com-a-familia-default-rtdb.firebaseio.com',
  sala: ''    // vazio = a sala nasce da própria senha da família (veja salaDaSenha)
};
const temPadrao = () => !!NUVEM_PADRAO.url;

let fontesNuvem = [];     // uma escuta pra cada conversa minha
let chaveNuvem = null;    // chave de embaralhar
let estadoNuvem = 'desligado';   // desligado | ligando | ligado | erro

const nuvemLigada = () => {
  const n = dados.nuvem;
  if(!n || !n.sala || !n.senha) return false;
  return n.modo === 'publico' ? true : !!n.url;
};

/* ---------- embaralhar (criptografia) ---------- */
const bytes = t => new TextEncoder().encode(t);
const texto = b => new TextDecoder().decode(b);
const paraB64 = buf => btoa(String.fromCharCode(...new Uint8Array(buf)));
const deB64 = t => Uint8Array.from(atob(t), c => c.charCodeAt(0));

async function pegarChave(){
  if(chaveNuvem) return chaveNuvem;
  const base = await crypto.subtle.importKey('raw', bytes(dados.nuvem.senha), 'PBKDF2', false, ['deriveKey']);
  chaveNuvem = await crypto.subtle.deriveKey(
    { name:'PBKDF2', salt: bytes('fala-familia:' + dados.nuvem.sala), iterations: 120000, hash:'SHA-256' },
    base, { name:'AES-GCM', length:256 }, false, ['encrypt','decrypt']);
  return chaveNuvem;
}
async function embaralhar(obj){
  const chave = await pegarChave();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const cifra = await crypto.subtle.encrypt({ name:'AES-GCM', iv }, chave, bytes(JSON.stringify(obj)));
  return { iv: paraB64(iv), c: paraB64(cifra) };
}
async function desembaralhar(pacote){
  try{
    const chave = await pegarChave();
    const claro = await crypto.subtle.decrypt(
      { name:'AES-GCM', iv: deB64(pacote.iv) }, chave, deB64(pacote.c));
    return JSON.parse(texto(claro));
  }catch(e){ return null; }   // senha diferente: o recado não é desta família
}

/* ---------- endereços ---------- */
const enderecoSala = () => `${dados.nuvem.url.replace(/\/$/,'')}/salas/${dados.nuvem.sala}/recados`;
/* Cada conversa tem o seu cantinho: o aparelho só escuta as conversas de quem é dono dele. */
const enderecoConversa = c => `${enderecoSala()}/${c}`;

/* ---------- mandar ---------- */
async function mandarPraNuvem(conversa, msg){
  if(!nuvemLigada() || msg.naNuvem) return;
  if(modoPublico()) return void mandarPeloPublico(conversa, msg);
  const copia = Object.assign({}, msg);
  delete copia.naNuvem;

  /* arquivo grande não viaja: vai só o aviso */
  if(copia.id && !copia.b64){
    const blob = await pegarAudio(copia.id);
    if(blob && blob.size <= LIMITE_ANEXO) copia.b64 = await blobParaTexto(blob);
    else if(blob) copia.semArquivo = true;
  }
  if(copia.b64 && copia.b64.length > LIMITE_ANEXO * 1.4){ delete copia.b64; copia.semArquivo = true; }

  const id = copia.uid || (copia.uid = `${Date.now()}-${Math.random().toString(36).slice(2,8)}`);
  msg.uid = id;
  try{
    const pacote = await embaralhar({ conversa, msg: copia });
    const r = await fetch(`${enderecoConversa(conversa)}/${id}.json`, {
      method:'PUT', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify(pacote)
    });
    if(!r.ok) throw new Error('HTTP ' + r.status);
    marcarNuvem('ligado');
  }catch(e){
    marcarNuvem('erro', e.message);
  }
}

/* ---------- receber ---------- */
async function guardarRecebido(conversa, msg){
  if(!dados.msgs[conversa]) return false;
  if(dados.msgs[conversa].some(m => m.uid && m.uid === msg.uid)) return false;   // já tenho

  /* arquivo que veio junto vai pro cofre do aparelho */
  if(msg.b64 && msg.id){
    try{
      const blob = await (await fetch(msg.b64)).blob();
      if(await guardarAudio(msg.id, blob)) delete msg.b64;
    }catch(e){}
  }
  msg.naNuvem = true;
  dados.msgs[conversa].push(msg);
  dados.msgs[conversa].sort((a,b) => a.ts - b.ts);
  if(!souEu(msg.de)) dados.presenca[msg.de] = Math.max(dados.presenca[msg.de] || 0, msg.ts);
  return true;
}

async function chegouDaNuvem(pacote, conversaEsperada){
  if(!pacote || !pacote.c) return;
  const claro = await desembaralhar(pacote);
  if(!claro || !claro.msg) return;
  if(conversaEsperada && claro.conversa !== conversaEsperada) return;
  const novo = await guardarRecebido(claro.conversa, claro.msg);
  if(!novo) return;
  salvar();
  desenharContatos();
  if(atual === claro.conversa) desenharMensagens();
  atualizarBolinhaDoIcone();
  const p = PESSOAS[claro.msg.de] || PESSOAS.jojo;
  blim(false);
  avisar(`${p.emoji} ${p.nome}`, textoDe(claro.msg), claro.conversa);
}

/* ---------- ligar e desligar ---------- */
/* O nome da sala nasce da senha: quem tem a mesma senha cai na mesma sala,
   e quem não tem nem sabe em que canto do banco procurar. */
async function salaDaSenha(senha){
  const digest = await crypto.subtle.digest('SHA-256', bytes('sala:' + senha));
  const hex = [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2,'0')).join('');
  return 'fam-' + hex.slice(0, 24);
}

/* Quem já estava no servidor público muda pro banco da família sozinho,
   aproveitando a mesma senha — senão ficava preso no servidor antigo. */
async function passarPraFamiliaNaNuvem(){
  if(!temPadrao()) return false;
  const n = dados.nuvem;
  if(!n || n.modo !== 'publico' || !n.senha) return false;
  dados.nuvem = { modo:'firebase', url: NUVEM_PADRAO.url, senha: n.senha,
                  sala: NUVEM_PADRAO.sala || await salaDaSenha(n.senha) };
  salvar(); chaveNuvem = null; ligarNuvem();
  toast('Agora usando o banco da família 🔥', 5000);
  return true;
}

/* Primeira abertura com o banco já embutido: pede só a senha da família. */
function pedirSenhaDaFamilia(){
  if(!temPadrao() || document.getElementById('telaSenhaFamilia')) return;
  if(dados.nuvem){ passarPraFamiliaNaNuvem(); return; }
  const tela = document.createElement('div');
  tela.className = 'tela-cheia quem-sou'; tela.id = 'telaSenhaFamilia';
  tela.innerHTML = `
    <div class="qs-meio">
      <div class="balao-deco">🔐</div>
      <h2>Senha da família</h2>
      <p class="lig-txt">É a mesma palavra em todos os aparelhos da casa. Ela embaralha os recados:
      sem ela ninguém consegue ler o que passa pela internet.</p>
      <input id="senhaFamilia" class="senha-grande" placeholder="a palavra combinada" autocomplete="off">
      <div class="lig-botoes">
        <button class="lig-bt ok grande" id="senhaOk">☁️ Ligar o envio</button>
        <button class="lig-bt" id="senhaDepois">agora não</button>
      </div>
    </div>`;
  document.body.appendChild(tela);
  const entrar = async () => {
    const senha = document.getElementById('senhaFamilia').value.trim();
    if(senha.length < 3){ toast('Escreve a palavra combinada 😊'); return; }
    const sala = NUVEM_PADRAO.sala || await salaDaSenha(senha);
    dados.nuvem = Object.assign({}, NUVEM_PADRAO, { senha, sala });
    salvar(); chaveNuvem = null; ligarNuvem();
    tela.remove();
    toast('Pronto! Agora os recados viajam ☁️');
  };
  document.getElementById('senhaOk').addEventListener('click', entrar);
  document.getElementById('senhaFamilia').addEventListener('keydown', e => { if(e.key === 'Enter') entrar(); });
  document.getElementById('senhaDepois').addEventListener('click', () => tela.remove());
  document.getElementById('senhaFamilia').focus();
}

function ligarNuvem(){
  desligarNuvem();
  if(!nuvemLigada()) return;
  if(modoPublico()) return ligarPublico();
  marcarNuvem('ligando');

  CONVERSAS.forEach(c => {
    let fonte;
    try{ fonte = new EventSource(enderecoConversa(c.id) + '.json'); }
    catch(e){ marcarNuvem('erro', 'endereço estranho'); return; }

    fonte.addEventListener('put', async ev => {
      marcarNuvem('ligado');
      let d; try{ d = JSON.parse(ev.data); }catch(e){ return; }
      if(!d) return;
      if(d.path === '/' && d.data){                  // chegou tudo de uma vez
        for(const pacote of Object.values(d.data)) await chegouDaNuvem(pacote, c.id);
      }else if(d.data){                              // chegou um recado novo
        await chegouDaNuvem(d.data, c.id);
      }
    });
    fonte.addEventListener('patch', ev => {
      try{ const d = JSON.parse(ev.data); if(d && d.data) Object.values(d.data).forEach(x => chegouDaNuvem(x, c.id)); }catch(e){}
    });
    fonte.onopen  = () => marcarNuvem('ligado');
    fonte.onerror = () => marcarNuvem(fonte.readyState === 1 ? 'ligado' : 'erro', 'sem conexão com o banco');
    fontesNuvem.push(fonte);
  });
}

function desligarNuvem(){
  desligarPublico();
  fontesNuvem.forEach(f => { try{ f.close(); }catch(e){} });
  fontesNuvem = [];
  chaveNuvem = null;
  marcarNuvem('desligado');
}

/* 4 letrinhas tiradas da sala: se os aparelhos mostram o MESMO código,
   estão todos na mesma sala. Se mostram códigos diferentes, a senha está diferente. */
function codigoDaFamilia(){
  const sala = (dados.nuvem && dados.nuvem.sala) || '';
  return sala ? sala.replace('fam-','').slice(0,4).toUpperCase() : '----';
}

/* Painel rápido: toca na bolinha lá em cima e vê tudo. */
function abrirPainelNuvem(){
  if(document.getElementById('painelNuvem')) return;
  const n = dados.nuvem || {};
  const total = Object.values(dados.msgs).reduce((soma, lista) => soma + lista.filter(m => !souEu(m.de)).length, 0);
  const tela = document.createElement('div');
  tela.className = 'fundo-modal aberto'; tela.id = 'painelNuvem';
  tela.innerHTML = `
    <div class="modal">
      <h2>☁️ Estado do envio</h2>
      <div class="painel-linhas">
        <div><b>Versão do site</b><span>${document.getElementById('versaoSite')?.textContent || '?'}</span></div>
        <div><b>Este aparelho é de</b><span>${dados.euSou ? PESSOAS[dados.euSou].curto : '—'}</span></div>
        <div><b>Jeito de enviar</b><span>${n.modo === 'firebase' ? '🔥 banco da família' : n.modo === 'publico' ? '📡 servidor público' : '🔌 desligado'}</span></div>
        <div><b>Conexão</b><span>${ {ligado:'🟢 ligada', ligando:'🟡 conectando', erro:'🔴 com erro', desligado:'⚪ desligada'}[estadoNuvem] }</span></div>
        <div><b>Recados que chegaram</b><span>${total}</span></div>
      </div>
      <div class="codigo-familia">
        <small>CÓDIGO DA FAMÍLIA</small>
        <b class="cod">${codigoDaFamilia()}</b>
        <small>tem que ser <b>igual</b> nos quatro aparelhos.<br>Se estiver diferente, a senha foi digitada diferente.</small>
      </div>
      <div id="passosTeste" class="passos"></div>
      <div class="lig-botoes">
        <button class="lig-bt ok" id="painelTestar">🔎 Testar agora</button>
        <button class="lig-bt" id="painelDiag">📋 Copiar diagnóstico</button>
        <button class="lig-bt desligar" id="painelFechar">Fechar</button>
      </div>
    </div>`;
  document.body.appendChild(tela);
  tela.addEventListener('click', e => { if(e.target.id === 'painelNuvem') tela.remove(); });
  document.getElementById('painelFechar').addEventListener('click', () => tela.remove());
  document.getElementById('painelTestar').addEventListener('click', () => modoPublico() ? testarPublico() : testarFirebase());
  document.getElementById('painelDiag').addEventListener('click', copiarDiagnostico);
}

function marcarNuvem(estado, detalhe){
  estadoNuvem = estado;
  const chip = document.getElementById('chipNuvem');
  if(chip){
    chip.className = 'net nuvem ' + estado;
    const txt = { desligado:'Só neste aparelho', ligando:'Conectando...',
                  ligado:'Enviando ☁️ ' + codigoDaFamilia(), erro:'Deu erro no envio' }[estado];
    chip.innerHTML = `<span class="bolinha"></span><span>${txt}</span>`;
    chip.title = detalhe || '';
  }
  const st = document.getElementById('estadoNuvem');
  if(st) st.textContent = {
    desligado:'🔌 Desligado — os recados ficam só neste aparelho',
    ligando:'⏳ Conectando com o banco da família...',
    ligado:'☁️ Ligado! Os recados viajam pros outros aparelhos',
    erro:'⚠️ Não consegui falar com o banco' + (detalhe ? ' (' + detalhe + ')' : '')
  }[estado];
}

/* ---------- convite pros outros aparelhos ---------- */
function fazerConvite(){
  return 'FAMILIA-NUVEM.' + btoa(unescape(encodeURIComponent(JSON.stringify(dados.nuvem))));
}
function usarConvite(txt){
  try{
    const limpo = (txt || '').trim().replace(/\s+/g,'');
    if(!limpo.startsWith('FAMILIA-NUVEM.')) return false;
    const cfg = JSON.parse(decodeURIComponent(escape(atob(limpo.slice(14)))));
    if(!cfg.url || !cfg.sala || !cfg.senha) return false;
    dados.nuvem = cfg; salvar(); chaveNuvem = null;
    ligarNuvem(); desenharNuvem();
    return true;
  }catch(e){ return false; }
}

/* ---------- tela dos ajustes ---------- */
function desenharNuvem(){
  const caixa = document.getElementById('camposNuvem');
  if(!caixa) return;
  const n = dados.nuvem || (temPadrao() ? NUVEM_PADRAO : {});
  const modo = n.modo || (temPadrao() ? 'firebase' : 'publico');
  document.querySelectorAll('.modo-op').forEach(b => b.classList.toggle('on', b.dataset.modo === modo));
  document.getElementById('campoUrl').classList.toggle('escondido', modo !== 'firebase');
  document.getElementById('avisoPublico').classList.toggle('escondido', modo !== 'publico');
  document.getElementById('nuvemUrl').value  = n.url  || '';
  document.getElementById('nuvemSala').value = n.sala || '';
  document.getElementById('nuvemSenha').value= n.senha|| '';
  const bt = document.getElementById('btnConvite');
  if(bt) bt.classList.toggle('escondido', !nuvemLigada());
  marcarNuvem(estadoNuvem);
}

async function salvarNuvem(){
  const modo = document.querySelector('.modo-op.on').dataset.modo;
  const url = document.getElementById('nuvemUrl').value.trim();
  const sala = document.getElementById('nuvemSala').value.trim();
  const senha = document.getElementById('nuvemSenha').value.trim();
  if(!senha){ toast('Falta a senha da família 😊'); return; }
  const salaFinal = sala || await salaDaSenha(senha);   // sem código, a senha vira a sala
  if(modo === 'firebase'){
    if(!url){ toast('Falta o endereço do banco 😊'); return; }
    if(!/^https:\/\/.+/.test(url)){ toast('O endereço tem que começar com https:// 😊'); return; }
  }
  dados.nuvem = modo === 'publico'
    ? { modo, sala: salaFinal, senha }
    : { modo, url, sala: salaFinal, senha };
  salvar(); chaveNuvem = null;
  ligarNuvem(); desenharNuvem();
  toast('Ligando o envio de verdade... ☁️');
}

function desligarDeVez(){
  delete dados.nuvem; salvar();
  desligarNuvem(); desenharNuvem();
  toast('Envio desligado 🔌');
}

function sortearSala(){
  const letras = 'abcdefghijkmnpqrstuvwxyz23456789';
  let s = '';
  for(let i = 0; i < 20; i++) s += letras[Math.floor(Math.random() * letras.length)];
  document.getElementById('nuvemSala').value = 'fam-' + s;
}


/* ---------- teste do banco Firebase ---------- */
/* Escreve um recadinho de teste e lê de volta: assim dá pra ver se as regras
   foram publicadas e se o endereço está certo. */
async function testarFirebase(){
  const caixa = document.getElementById('passosTeste');
  if(!caixa) return;
  caixa.innerHTML = '';
  const passo = (txt, estado) => caixa.insertAdjacentHTML('beforeend', `<div class="passo ${estado}">${txt}</div>`);

  if(!dados.nuvem || !dados.nuvem.url){ passo('Primeiro liga o envio com o endereço do banco.', 'ruim'); return; }
  passo('1. Banco: ' + dados.nuvem.url.replace('https://',''), 'bom');
  passo('2. Sala: ' + dados.nuvem.sala, 'bom');

  const alvo = `${enderecoConversa('teste')}/ping.json`;
  try{
    const r = await fetch(alvo, { method:'PUT', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ iv:'teste', c:'teste', ts: Date.now() }) });
    if(r.status === 401 || r.status === 403){
      passo('3. ❌ O banco recusou (' + r.status + ') — as <b>regras</b> não foram publicadas.', 'ruim');
      passo('No Firebase: Realtime Database → aba Regras → cola as regras do GUIA-FIREBASE.md → Publicar.', 'aviso');
      return;
    }
    if(!r.ok){ passo('3. ❌ O banco respondeu ' + r.status, 'ruim'); return; }
    passo('3. Consegui escrever no banco ✅', 'bom');
  }catch(e){
    passo('3. ❌ Não consegui falar com o banco: ' + e.message, 'ruim');
    passo('Confere se o endereço está certinho e se este aparelho está com internet.', 'aviso');
    return;
  }

  try{
    const volta = await (await fetch(alvo)).json();
    passo(volta && volta.iv === 'teste' ? '4. Li de volta o que escrevi ✅' : '4. ❌ Escrevi mas não consegui ler de volta',
          volta && volta.iv === 'teste' ? 'bom' : 'ruim');
  }catch(e){ passo('4. ❌ Não consegui ler de volta: ' + e.message, 'ruim'); }

  fetch(alvo, { method:'PUT', headers:{'Content-Type':'application/json'}, body:'null' }).catch(() => {});
  passo('5. Tudo pronto! Agora é só cada um abrir e pôr a mesma senha da família 🎉', 'bom');
}


/* ---------- diagnóstico pra mandar pro Claude ---------- */
function juntarDiagnostico(){
  const n = dados.nuvem || {};
  const linhas = [
    'Fala, Família — diagnóstico',
    'versão do site: ' + (document.getElementById('versaoSite')?.textContent || '?'),
    'navegador: ' + navigator.userAgent,
    'endereço seguro (https): ' + window.isSecureContext,
    'com internet: ' + navigator.onLine,
    'este aparelho é de: ' + (dados.euSou || '(ninguém ainda)'),
    'modo de envio: ' + (n.modo || '(desligado)'),
    'banco: ' + (n.url || '-'),
    'sala: ' + (n.sala || '-'),
    'senha configurada: ' + (n.senha ? 'sim (' + n.senha.length + ' letras)' : 'NÃO'),
    'estado da conexão: ' + estadoNuvem,
    'recados guardados: ' + Object.entries(dados.msgs).map(([k,v]) => k + '=' + v.length).join(', '),
    'passos do último teste:',
    ...[...document.querySelectorAll('#passosTeste .passo')].map(e => '  - ' + e.textContent.trim()),
    'erros que apareceram:',
    ...((window.__erros || []).slice(0,5).map(e => '  - ' + e)),
    ...(typeof diario !== 'undefined' ? ['diário do servidor público:', ...diario.map(l => '  - ' + l)] : [])
  ];
  return linhas.join('\n');
}

function copiarDiagnostico(){
  const txt = juntarDiagnostico();
  navigator.clipboard?.writeText(txt)
    .then(() => toast('Diagnóstico copiado! Cola na conversa com o Claude 📋', 5000))
    .catch(() => {
      const caixa = document.getElementById('passosTeste');
      if(caixa) caixa.innerHTML = `<textarea class="lig-codigo" style="height:200px">${escapar(txt)}</textarea>`;
      toast('Copia o texto que apareceu aí 😊', 5000);
    });
}
