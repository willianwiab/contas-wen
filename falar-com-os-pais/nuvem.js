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

/* Configuração de fábrica da família: banco e sala já vêm prontos, então
   ninguém precisa digitar nada — abriu, escolheu quem é, está conversando.

   Sem senha, a chave de embaralhar nasce do próprio nome da sala, que está
   aqui no código (público). Ou seja: serve pra o recado não ficar à mostra
   pra quem passar os olhos no banco, mas NÃO é segredo de verdade — quem
   achar este repositório consegue ler. Pra privacidade mesmo, é só pôr uma
   senha nos Ajustes: aí a sala e a chave passam a nascer dela, e o site
   deixa de saber o segredo da família. */
const NUVEM_PADRAO = {
  modo: 'firebase',
  url : 'https://conversa-com-a-familia-default-rtdb.firebaseio.com',
  sala: 'fam-casa-wen-2026-conversa'
};
const temPadrao = () => !!NUVEM_PADRAO.url;

/* ---------- de onde vem a chave ----------
   PROBLEMA QUE ISTO CONSERTA: antes, quando a família não punha senha,
   a chave nascia do NOME DA SALA — e o nome da sala padrão está escrito
   no código, que é público no GitHub. Ou seja: qualquer pessoa que
   lesse o repositório conseguia abrir os recados. Embaralhado com uma
   chave que está publicada não protege de ninguém.

   Agora existe um SEGREDO DA FAMÍLIA: 32 bytes sorteados no primeiro
   aparelho, que nunca vão pro banco e viajam pros outros aparelhos
   dentro do 📋 convite. Quem não tem o segredo não abre nada.

   A senha digitada, quando existe, entra junto: aí nem o convite basta.

   O jeito velho continua servindo SÓ pra ler o que já estava lá antes
   desta versão — nada novo sai por ele. */
/* O segredo NÃO nasce sozinho, de propósito: se cada aparelho sorteasse
   o seu, cada um ficaria com uma chave diferente e a família inteira
   pararia de se entender no dia da atualização. Ele só existe quando
   alguém aperta "🔐 Proteger de verdade" e manda o convite pros outros.

   Enquanto isso, vale a chave de antes — que funciona, mas protege
   pouco, e por isso o site diz na cara: 🔓 "Ainda sem chave própria". */
const segredoDaFamilia = () => (dados.nuvem && dados.nuvem.segredo) || '';

function criarSegredoDaFamilia(){
  if(!dados.nuvem) return '';
  if(!dados.nuvem.segredo){
    dados.nuvem.segredo = paraB64(crypto.getRandomValues(new Uint8Array(32)));
    salvar();
  }
  return dados.nuvem.segredo;
}

/* a chave de antes: nasce da senha da família ou, sem senha, do nome da
   sala — que está no código público. Só serve enquanto não há segredo. */
const chaveAntiga = () => (dados.nuvem && dados.nuvem.senha) || (dados.nuvem && dados.nuvem.sala) || '';
const chaveEmUso = () => {
  const seg = segredoDaFamilia();
  return seg ? seg + '|' + ((dados.nuvem && dados.nuvem.senha) || '') : chaveAntiga();
};

let fontesNuvem = [];     // uma escuta pra cada conversa minha
let relogioPuxar = null;  // rede teimosa: confere o banco de tempos em tempos
let relogioAviso = null;  // avisa que este aparelho está na sala
let chaveNuvem = null;    // chave de embaralhar
let estadoNuvem = 'desligado';   // desligado | ligando | ligado | erro

const nuvemLigada = () => {
  const n = dados.nuvem;
  if(!n || !n.sala) return false;
  return n.modo === 'publico' ? true : !!n.url;
};

/* ---------- embaralhar (criptografia) ---------- */
const bytes = t => new TextEncoder().encode(t);
const texto = b => new TextDecoder().decode(b);
const paraB64 = buf => btoa(String.fromCharCode(...new Uint8Array(buf)));
const deB64 = t => Uint8Array.from(atob(t), c => c.charCodeAt(0));

async function derivarChave(material){
  const base = await crypto.subtle.importKey('raw', bytes(material), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name:'PBKDF2', salt: bytes('fala-familia:' + dados.nuvem.sala), iterations: 210000, hash:'SHA-256' },
    base, { name:'AES-GCM', length:256 }, false, ['encrypt','decrypt']);
}
async function pegarChave(){
  if(chaveNuvem) return chaveNuvem;
  chaveNuvem = await derivarChave(chaveEmUso());
  return chaveNuvem;
}
/* só pra LER o que foi guardado antes desta versão */
let chaveVelha = null;
async function pegarChaveVelha(){
  if(chaveVelha) return chaveVelha;
  chaveVelha = await derivarChaveVelha(chaveAntiga());
  return chaveVelha;
}
async function derivarChaveVelha(material){
  const base = await crypto.subtle.importKey('raw', bytes(material), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name:'PBKDF2', salt: bytes('fala-familia:' + dados.nuvem.sala), iterations: 120000, hash:'SHA-256' },
    base, { name:'AES-GCM', length:256 }, false, ['encrypt','decrypt']);
}
async function embaralhar(obj){
  const chave = await pegarChave();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const cifra = await crypto.subtle.encrypt({ name:'AES-GCM', iv }, chave, bytes(JSON.stringify(obj)));
  return { iv: paraB64(iv), c: paraB64(cifra) };
}
async function desembaralhar(pacote){
  if(!pacote || typeof pacote.iv !== 'string' || typeof pacote.c !== 'string') return null;
  /* tenta a chave de agora; se não abrir, tenta a de antes desta versão,
     senão os recados que já estavam no banco sumiriam da vista */
  const tentativas = segredoDaFamilia() ? [pegarChave, pegarChaveVelha] : [pegarChave];
  for(const pegar of tentativas){
    try{
      const claro = await crypto.subtle.decrypt(
        { name:'AES-GCM', iv: deB64(pacote.iv) }, await pegar(), deB64(pacote.c));
      return JSON.parse(texto(claro));
    }catch(e){}
  }
  return null;   // não é desta família (ou a senha é outra)
}

/* ---------- endereços ---------- */
const enderecoSala = () => `${dados.nuvem.url.replace(/\/$/,'')}/salas/${dados.nuvem.sala}/recados`;
/* Cada conversa tem o seu cantinho: o aparelho só escuta as conversas de quem é dono dele. */
const enderecoConversa = c => `${enderecoSala()}/${c}`;
/* Só os últimos recados: sem isto, cada conferida baixava a conversa inteira
   (com áudio e foto dentro), o que ficaria pesado e gastaria a cota do banco. */
let usarRecentes = true;   // se o banco não aceitar a consulta, volta ao jeito simples
const RECENTES = () => usarRecentes ? '?orderBy="$key"&limitToLast=40' : '';

/* ---------- a fila de espera ----------
   Recado escrito sem internet (ou quando o banco não respondeu) não some
   nem fica parado pra sempre: ele fica marcado como "pendente" e sai
   sozinho assim que a internet voltar. */
function porNaFila(conversa, msg){
  if(msg.pendente) return;
  msg.pendente = true; salvar(); avisarDaFila();
}
function tirarDaFila(msg){
  if(!msg.pendente) return;
  delete msg.pendente; salvar(); avisarDaFila();
}
function contarFila(){
  let n = 0;
  Object.values(dados.msgs || {}).forEach(lista => lista.forEach(m => { if(m.pendente) n++; }));
  return n;
}
function avisarDaFila(){
  const chip = document.getElementById('chipFila');
  if(chip){
    const n = contarFila();
    chip.classList.toggle('escondido', n === 0);
    chip.innerHTML = `<span class="bolinha"></span><span>⏳ ${n} recad${n === 1 ? 'o esperando' : 'os esperando'} a internet</span>`;
  }
  if(typeof atual !== 'undefined' && atual && typeof atualizarTiquinhos === 'function') atualizarTiquinhos();
}

let soltandoFila = false;
async function soltarFila(){
  if(soltandoFila || !nuvemLigada() || modoPublico() || !navigator.onLine) return;
  soltandoFila = true;
  try{
    for(const [conversa, lista] of Object.entries(dados.msgs || {})){
      for(const m of lista){
        if(!m.pendente || m.naNuvem) continue;
        delete m.pendente;                 // se falhar de novo, volta pra fila sozinho
        await mandarPraNuvem(conversa, m);
        if(m.pendente) return;             // ainda sem rede: para e tenta na próxima
      }
    }
  }finally{ soltandoFila = false; avisarDaFila(); }
}
window.addEventListener('online', () => setTimeout(soltarFila, 800));

/* ---------- mandar ---------- */
async function mandarPraNuvem(conversa, msg){
  if(!nuvemLigada() || msg.naNuvem) return;
  if(modoPublico()) return void mandarPeloPublico(conversa, msg);
  /* sem internet nem adianta tentar: vai direto pra fila */
  if(!navigator.onLine) return void porNaFila(conversa, msg);
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
    if(!r.ok){
      if(r.status === 401 || r.status === 403) avisarRegras(r.status);
      throw new Error('HTTP ' + r.status);
    }
    marcarNuvem('ligado');
    tirarDaFila(msg);
  }catch(e){
    marcarNuvem('erro', e.message);
    porNaFila(conversa, msg);
  }
}

/* ---------- mandar de novo um recado que mudou ----------
   Jogo da velha, reação e voto de enquete mexem num recado que JÁ foi
   mandado. Sem isto eles ficavam só no aparelho de quem mexeu — o jogo
   simplesmente não aparecia pros outros. Como cada recado tem o seu uid
   e o banco guarda por uid, mandar de novo é só sobrescrever. O contador
   `v` diz qual versão é a mais nova, pra dois aparelhos mexendo quase
   junto não voltarem no tempo. */
async function atualizarNaNuvem(conversa, msg){
  if(!nuvemLigada() || !msg) return;
  msg.v = (msg.v || 0) + 1;
  const eraDaNuvem = msg.naNuvem;
  delete msg.naNuvem;                 // senão o envio se recusa a sair
  try{ await mandarPraNuvem(conversa, msg); }
  finally{ if(eraDaNuvem) msg.naNuvem = true; }
}

/* ---------- receber ---------- */
/* Recados que já passaram por aqui (ou estão a caminho): a escuta e a
   conferida periódica correm juntas, e sem isto o mesmo recado entrava duas
   vezes na conversa. */
const jaVistos = new Set();
const emAndamento = new Set();

/* ---------- conferir o que chega ----------
   O que vem do banco foi escrito por outro aparelho. Mesmo estando
   embaralhado com a chave da família, vale conferir o formato antes de
   usar: um campo estranho não pode virar HTML na tela nem um recado com
   dono inventado. */
const TIPOS_QUE_EXISTEM = ['audio','foto','video','enquete','jogo','capsula','lugar','som','timer',
  'sos','ppt','forca','cheguei','indo','tudobem'];

function recadoConfere(msg){
  if(!msg || typeof msg !== 'object' || Array.isArray(msg)) return false;
  if(typeof msg.de !== 'string' || !PESSOAS[msg.de]) return false;      // dono precisa ser da família
  if(typeof msg.ts !== 'number' || !isFinite(msg.ts)) return false;
  if(msg.ts > Date.now() + 86400000) return false;                      // recado do futuro, não
  if(msg.tipo !== undefined && !TIPOS_QUE_EXISTEM.includes(msg.tipo)) return false;
  if(msg.t !== undefined && typeof msg.t !== 'string') return false;
  if(msg.t && msg.t.length > 20000) return false;
  if(msg.uid !== undefined && (typeof msg.uid !== 'string' || msg.uid.length > 80)) return false;
  if(msg.b64 !== undefined && (typeof msg.b64 !== 'string' || !/^data:/.test(msg.b64))) return false;
  if(msg.lugar !== undefined && msg.lugar !== null){
    const l = msg.lugar;
    if(typeof l !== 'object' || typeof l.lat !== 'number' || typeof l.lon !== 'number') return false;
    if(Math.abs(l.lat) > 90 || Math.abs(l.lon) > 180) return false;
  }
  return true;
}

async function guardarRecebido(conversa, msg){
  if(typeof conversa !== 'string' || !dados.msgs[conversa]) return false;
  if(!recadoConfere(msg)) return false;
  if(msg.uid && emAndamento.has(msg.uid)) return false;                          // já está entrando
  const tenho = msg.uid && dados.msgs[conversa].find(m => m.uid === msg.uid);
  if(tenho){
    /* já tenho este recado: só interessa se veio uma versão mais nova
       (uma jogada, uma reação, um voto) */
    if((msg.v || 0) <= (tenho.v || 0)) return false;
    Object.keys(tenho).forEach(k => { if(k !== 'naNuvem') delete tenho[k]; });
    Object.assign(tenho, msg, { naNuvem: true });
    return true;
  }
  if(msg.uid) emAndamento.add(msg.uid);
  try{

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
  }finally{
    if(msg.uid) emAndamento.delete(msg.uid);
  }
}

async function chegouDaNuvem(pacote, conversaEsperada){
  if(!pacote || !pacote.c) return;
  const claro = await desembaralhar(pacote);
  if(!claro || typeof claro !== 'object' || !claro.msg) return;
  if(typeof claro.conversa !== 'string') return;
  if(conversaEsperada && claro.conversa !== conversaEsperada) return;
  const novo = await guardarRecebido(claro.conversa, claro.msg);
  if(!novo) return;
  salvar();
  desenharContatos();
  if(atual === claro.conversa) desenharMensagens();
  atualizarBolinhaDoIcone();
  /* 💜 "já tô bem": para o alarme no aparelho de todo mundo */
  if(claro.msg.tipo === 'tudobem' && !souEu(claro.msg.de)){
    if(typeof chegouTudoBem === 'function') chegouTudoBem(claro.msg);
    return;
  }
  if(claro.msg.tipo === 'sos' && !souEu(claro.msg.de)){
      /* só toca o alarme se for de agora: SOS velho guardado no banco não
         pode assustar quem abrir o site dias depois */
      if(Date.now() - claro.msg.ts < 600000) chegouPedidoDeAjuda(claro.msg);
      return;
    }
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

/* Liga sozinho com o que já vem no site. Se o aparelho tinha ficado numa
   configuração antiga (servidor público, ou uma palavra que não bateu com a
   dos outros aparelhos), ele volta pro padrão da casa — era isso que impedia
   os aparelhos de se encontrarem. */
function ligarSozinho(){
  if(!temPadrao()) return;
  if(!dados.nuvem || dados.nuvemVersao !== 2){
    /* o segredo da família NÃO pode se perder aqui: sem ele, este
       aparelho deixaria de abrir os recados dos outros */
    const segredo = dados.nuvem && dados.nuvem.segredo;
    dados.nuvem = Object.assign({}, NUVEM_PADRAO);
    if(segredo) dados.nuvem.segredo = segredo;
    dados.nuvemVersao = 2;
    salvar(); chaveNuvem = null; chaveVelha = null;
  }
  ligarNuvem();
}

function ligarNuvem(){
  desligarNuvem();
  if(!nuvemLigada()) return;
  if(modoPublico()) return ligarPublico();
  marcarNuvem('ligando');

  CONVERSAS.forEach(c => {
    let fonte;
    try{ fonte = new EventSource(enderecoConversa(c.id) + '.json' + RECENTES()); }
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

  /* Rede teimosa: mesmo que a escuta falhe, busca os recados de novo sozinho.
     Recado repetido é jogado fora pelo uid, então não tem risco de dobrar. */
  puxarTudo();
  clearInterval(relogioPuxar);
  relogioPuxar = setInterval(puxarTudo, 8000);

  ligarSinais();
  if(typeof ligarCentral === 'function') ligarCentral();

  /* Voltou pra tela ou pra internet? confere na hora. */
  document.addEventListener('visibilitychange', aoVoltar);
  window.addEventListener('online', aoVoltar);

  /* Diz pros outros que este aparelho está na sala (serve pro painel). */
  avisarQueEstouAqui();
  clearInterval(relogioAviso);
  relogioAviso = setInterval(avisarQueEstouAqui, 60000);
  setTimeout(faxinaDaNuvem, 15000);   // depois que tudo acalmar
}

/* Busca tudo que está no banco, conversa por conversa. */
async function puxarTudo(forcado){
  if(!nuvemLigada() || modoPublico()) return;
  if(!forcado && document.hidden) return;        // tela apagada: a escuta dá conta
  if(!navigator.onLine) return;
  for(const c of CONVERSAS){
    try{
      let r = await fetch(enderecoConversa(c.id) + '.json' + RECENTES());
      if(!r.ok && usarRecentes && r.status === 400){
        /* banco não gostou da consulta: volta ao jeito simples e avisa a escuta */
        usarRecentes = false;
        r = await fetch(enderecoConversa(c.id) + '.json');
        if(r.ok) ligarNuvem();
      }
      if(!r.ok){
        if(r.status === 401 || r.status === 403) avisarRegras(r.status);
        marcarNuvem('erro', 'o banco respondeu ' + r.status); continue;
      }
      const tudo = await r.json();
      if(!tudo) continue;
      marcarNuvem('ligado');
      for(const [chave, pacote] of Object.entries(tudo)){
        /* o iv muda toda vez que o recado é embaralhado de novo, então
           uma versão nova do MESMO recado não é pulada por engano */
        const marca = chave + ':' + (pacote && pacote.iv || '');
        if(jaVistos.has(marca)) continue;        // já cuidei desta versão
        jaVistos.add(marca);
        await chegouDaNuvem(pacote, c.id);
      }
    }catch(e){ marcarNuvem('erro', 'sem conexão com o banco'); }
  }
  soltarFila();     // se ficou recado esperando, esta é a hora de mandar
}

/* ---------- quem está na sala ---------- */
function enderecoQuem(){
  return `${dados.nuvem.url.replace(/\/$/,'')}/salas/${dados.nuvem.sala}/quem`;
}
async function avisarQueEstouAqui(){
  if(!nuvemLigada() || modoPublico() || !dados.euSou) return;
  try{
    await fetch(`${enderecoQuem()}/${dados.euSou}.json`, {
      method:'PUT', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ ts: Date.now(), versao: document.getElementById('versaoSite')?.textContent || '?' })
    });
  }catch(e){}
}
async function quemEstaNaSala(){
  if(!nuvemLigada() || modoPublico()) return null;
  try{
    const r = await fetch(enderecoQuem() + '.json');
    if(!r.ok) return null;
    return await r.json();
  }catch(e){ return null; }
}

function desligarNuvem(){
  desligarPublico();
  if(typeof desligarSinais === 'function') desligarSinais();
  if(typeof desligarCentral === 'function') desligarCentral();
  clearInterval(relogioPuxar); clearInterval(relogioAviso);
  fontesNuvem.forEach(f => { try{ f.close(); }catch(e){} });
  fontesNuvem = [];
  chaveNuvem = null; chaveVelha = null;
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
      <div class="bloco-titulo" style="margin-top:6px">Quem está nesta sala</div>
      <div id="quemNaSala" class="quem-sala">procurando...</div>
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

  quemEstaNaSala().then(quem => {
    const caixa = document.getElementById('quemNaSala');
    if(!caixa) return;
    if(!quem){ caixa.innerHTML = '<i>não consegui perguntar pro banco (sem conexão ou regras não publicadas)</i>'; return; }
    const agora = Date.now();
    const linhas = Object.entries(quem).map(([p, info]) => {
      const min = Math.round((agora - (info.ts || 0)) / 60000);
      const quando = min < 2 ? 'agora' : min < 60 ? `há ${min} min` : `há ${Math.round(min/60)} h`;
      return `<div><b>${PESSOAS[p] ? PESSOAS[p].emoji + ' ' + PESSOAS[p].curto : p}</b><span>${quando}${info.versao ? ' • v' + info.versao : ''}</span></div>`;
    });
    caixa.innerHTML = linhas.join('') || '<i>ninguém ainda</i>';
    if(linhas.length < 2) caixa.insertAdjacentHTML('beforeend',
      '<div class="passo aviso" style="margin-top:8px">Só este aparelho apareceu aqui. Os outros precisam abrir o site e digitar a <b>mesma senha</b> — o código de 4 letras tem que bater.</div>');
  });
  document.getElementById('painelTestar').addEventListener('click', () => modoPublico() ? testarPublico() : testarFirebase());
  document.getElementById('painelDiag').addEventListener('click', copiarDiagnostico);
}

/* Banco bloqueado é o tropeço mais comum: grita na tela em vez de sussurrar. */
let jaAvisouRegras = false;
function avisarRegras(codigo){
  if(jaAvisouRegras) return;
  jaAvisouRegras = true;
  const recado = 'O banco recusou (' + codigo + '): faltam publicar as REGRAS no Firebase ' +
                 '(Realtime Database → aba Regras → colar as regras do GUIA-FIREBASE.md → Publicar).';
  if(window.mostrarErroNaTela) mostrarErroNaTela(recado);
  toast('O banco está bloqueado — faltam as regras 🔒', 6000);
}

function marcarNuvem(estado, detalhe){
  estadoNuvem = estado;
  const chip = document.getElementById('chipNuvem');
  if(chip){
    chip.className = 'net nuvem ' + estado;
    const txt = { desligado:'🟢 Só neste aparelho', ligando:'⏳ Conectando...',
                  ligado:'🔵 Enviando ☁️ ' + codigoDaFamilia(), erro:'⚠️ Deu erro no envio' }[estado];
    chip.innerHTML = `<span class="bolinha"></span><span>${txt}</span>`;
    chip.title = { desligado:'Nada sai deste aparelho', ligando:'',
                   ligado:'Os recados viajam pro banco da família, embaralhados',
                   erro: detalhe || 'não consegui falar com o banco' }[estado] || '';
  }

  /* Dois avisos que faltavam, e que mudam o que a família precisa saber:
     se os recados estão mesmo embaralhados, e se o servidor é o de teste. */
  const chipCripto = document.getElementById('chipCripto');
  if(chipCripto){
    const ligado = estado === 'ligado' || estado === 'ligando';
    const temSegredo = !!(dados.nuvem && dados.nuvem.segredo);
    const temSenha = !!(dados.nuvem && dados.nuvem.senha);
    chipCripto.classList.toggle('escondido', !ligado);
    chipCripto.classList.toggle('fraco', !temSegredo && !temSenha);
    chipCripto.innerHTML = temSegredo || temSenha
      ? '<span class="bolinha"></span><span>🔒 Conversas embaralhadas</span>'
      : '<span class="bolinha"></span><span>🔓 Ainda sem chave própria</span>';
    chipCripto.title = temSegredo || temSenha
      ? 'Só quem tem o convite (ou a senha) da família consegue ler'
      : 'Toca no ⚙️ Ajustes → ☁️ e aperta "Proteger de verdade"';
  }

  const chipPublico = document.getElementById('chipPublico');
  if(chipPublico){
    chipPublico.classList.toggle('escondido', !(modoPublico() && estado !== 'desligado'));
    chipPublico.innerHTML = '<span class="bolinha"></span><span>⚠️ Servidor público de teste</span>';
    chipPublico.title = 'Servidor aberto: pode cair ou apagar tudo sem avisar';
  }
  /* o rodapé da lista tem que contar a verdade: com o ☁️ ligado os
     recados saem daqui, e o 🤖 Ajudante sempre fala com a internet. */
  const rodape = document.getElementById('rodapeLista');
  if(rodape) rodape.innerHTML = estado === 'ligado'
    ? '☁️ Os recadinhos viajam pro banco da família, embaralhados.<br>O 🤖 Ajudante fala com a internet; o resto fica aqui.'
    : '🔒 Os recadinhos ficam guardados só neste aparelho.<br>Só o 🤖 Ajudante fala com a internet.';

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
    if(!cfg.sala || typeof cfg.sala !== 'string' || cfg.sala.length > 120) return false;
    if(cfg.modo !== 'publico'){
      /* O convite vem de fora e diz PRA ONDE mandar os recados. Só https
         é aceito: um convite apontando pra um endereço comum jogaria o
         que a família escreve numa conexão aberta, no computador de
         quem mandou o convite. (O endereço da própria máquina é aceito
         porque é onde o site é testado, e dali nada sai.) */
      if(!cfg.url || typeof cfg.url !== 'string') return false;
      const soLocal = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/|$)/i.test(cfg.url);
      if(!/^https:\/\//i.test(cfg.url) && !soLocal){
        toast('Esse convite manda os recados por uma conexão aberta — não aceitei 🔒', 7000);
        return false;
      }
    }
    if(cfg.segredo !== undefined && (typeof cfg.segredo !== 'string' || cfg.segredo.length > 200)) return false;
    if(cfg.senha !== undefined && typeof cfg.senha !== 'string') return false;
    dados.nuvem = cfg; salvar(); chaveNuvem = null; chaveVelha = null;
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
  /* senha vazia = usa a sala padrão e a chave que nasce dela */
  /* Com senha, a sala SEMPRE nasce dela — senão o campo da sala (que vem
     preenchido com a antiga) vencia a senha nova e a privacidade não valia. */
  const salaFinal = senha ? await salaDaSenha(senha) : (sala || NUVEM_PADRAO.sala);
  if(modo === 'firebase'){
    if(!url){ toast('Falta o endereço do banco 😊'); return; }
    if(!/^https:\/\/.+/.test(url)){ toast('O endereço tem que começar com https:// 😊'); return; }
  }
  const segredo = (dados.nuvem && dados.nuvem.segredo) || '';
  dados.nuvem = modo === 'publico'
    ? { modo, sala: salaFinal, senha }
    : { modo, url, sala: salaFinal, senha };
  if(segredo) dados.nuvem.segredo = segredo;   // trocar a senha não perde o segredo
  dados.nuvemVersao = 2;
  salvar(); chaveNuvem = null; chaveVelha = null;
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


/* Quando o aparelho volta pra tela ou recupera a internet, confere na hora
   em vez de esperar os 8 segundos. */
function aoVoltar(){
  if(!document.hidden && navigator.onLine) puxarTudo(true);
}

/* Faxina: uma vez por dia, apaga do banco o que já passou de 30 dias.
   Pede só as chaves (shallow), então é uma consulta leve. */
async function faxinaDaNuvem(){
  if(!nuvemLigada() || modoPublico()) return;
  const hoje = new Date().toISOString().slice(0,10);
  if(dados.faxina === hoje) return;
  dados.faxina = hoje; salvar();
  const limite = Date.now() - 30 * 86400000;
  for(const c of CONVERSAS){
    try{
      const r = await fetch(enderecoConversa(c.id) + '.json?shallow=true');
      if(!r.ok) return;
      const chaves = Object.keys(await r.json() || {});
      for(const chave of chaves){
        const quando = parseInt(chave.split('-')[0], 10);
        if(quando && quando < limite){
          await fetch(`${enderecoConversa(c.id)}/${chave}.json`,
            { method:'PUT', headers:{'Content-Type':'application/json'}, body:'null' });
        }
      }
    }catch(e){ return; }
  }
}


/* ---------- 🔐 proteger de verdade ----------
   Explica em português o que muda e cria a chave da família. Depois
   disso, só quem receber o convite consegue ler os recados. */
function protegerDeVerdade(){
  if(!dados.nuvem){ toast('Liga o ☁️ primeiro 😊'); return; }
  const jaTem = !!dados.nuvem.segredo;
  if(jaTem){
    mostrarConvite();
    return;
  }
  if(!confirm(
    '🔐 Criar a chave da família?\n\n' +
    'Hoje os recados são embaralhados com uma chave que nasce do nome da sala — e o nome ' +
    'da sala está no código do site, que é público. Quem souber olhar consegue ler.\n\n' +
    'Com a chave própria, só quem tiver o convite lê.\n\n' +
    'IMPORTANTE: depois de criar, tu precisa mandar o 📋 convite pros outros aparelhos, ' +
    'senão eles param de ver os recados NOVOS (os antigos continuam).')) return;

  criarSegredoDaFamilia();     // sorteia e guarda
  chaveNuvem = null;
  marcarNuvem(estadoNuvem);
  mostrarConvite();
  toast('🔐 Chave criada! Manda o convite pros outros AGORA', 9000);
}

function mostrarConvite(){
  const convite = fazerConvite();
  if(navigator.clipboard) navigator.clipboard.writeText(convite)
    .then(() => toast('Convite copiado! Cola no outro aparelho 📋', 6000))
    .catch(() => prompt('Copia este convite e cola no outro aparelho:', convite));
  else prompt('Copia este convite e cola no outro aparelho:', convite);
}
