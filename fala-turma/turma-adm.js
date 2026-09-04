/* =========================================================
   turma-adm.js — 👑 MODO ADM

   COMO ISTO FUNCIONA, E ATÉ ONDE VAI.

   O app não tem servidor com regras nem contas: quem tem o
   convite tem a chave da turma. Então "ser adm" não pode ser
   uma caixinha marcada — qualquer um marcaria a sua.

   O que a gente faz: o adm escolhe uma SENHA DE ADM, que nunca
   sai do aparelho dele. Dela nasce uma chave de assinatura
   (HMAC-SHA256). Toda ação de adm sai ASSINADA, e os outros
   aparelhos conferem a assinatura antes de obedecer.

   Isso resolve de verdade um problema: ninguém consegue FINGIR
   que é adm, nem por acidente nem por esperteza simples.

   O que isso NÃO resolve: quem sabe mexer no código do
   navegador pode ignorar a conferência no aparelho dele e
   escrever direto no banco. Só um servidor de verdade
   resolveria, e a gente usa um banco de graça e sem contas.

   Por isso o adm NÃO PODE VER NADA PRIVADO — nem conversa
   particular, nem quem respondeu o quê no humor. Se burlar não
   dá acesso a segredo nenhum, burlar não vale a pena: o pior
   que acontece é bagunça no mural, e bagunça a gente arruma.
   ========================================================= */

const ADM_ACOES = ['apagar','trancar','destrancar','calar','tirar','fixar','limpar','devolver'];

let chaveAdm = null;            /* a chave de ASSINAR, só na memória e só do adm */

/* =========================================================
   POR QUE CHAVE PÚBLICA, E NÃO UMA SENHA COMPARTILHADA

   A primeira ideia era assinar com a senha (HMAC). Só que aí
   quem NÃO sabe a senha não consegue conferir assinatura —
   e sobrariam duas saídas ruins: ou todo mundo sabe a senha
   (aí não é senha), ou os outros conferem por um valor público,
   que qualquer um copiaria.

   Então é assim: o adm tem um PAR de chaves.
   - a chave de conferir vai no mural, à vista de todos;
   - a chave de assinar fica embaralhada com a senha do adm,
     também no mural — mas sem a senha ela não abre.

   Resultado: QUALQUER APARELHO confere sozinho se a ordem é
   do adm de verdade. E só quem sabe a senha consegue assinar.
   ========================================================= */

async function chaveDaSenha(senha){
  const base = await crypto.subtle.importKey('raw', bytes(senha), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name:'PBKDF2', salt: bytes('fala-turma:adm:' + dados.turma.codigo), iterations: 210000, hash:'SHA-256' },
    base, { name:'AES-GCM', length:256 }, false, ['encrypt','decrypt']);
}

/* guarda a chave de assinar embaralhada com a senha */
async function trancarChave(privada, senha){
  const cru = await crypto.subtle.exportKey('pkcs8', privada);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const c = await crypto.subtle.encrypt({ name:'AES-GCM', iv }, await chaveDaSenha(senha), cru);
  return { iv: paraB64(iv), c: paraB64(c) };
}

/* devolve a chave de assinar, ou null se a senha estiver errada */
async function abrirChave(cofre, senha){
  try{
    const cru = await crypto.subtle.decrypt({ name:'AES-GCM', iv: deB64(cofre.iv) },
      await chaveDaSenha(senha), deB64(cofre.c));
    return await crypto.subtle.importKey('pkcs8', cru,
      { name:'ECDSA', namedCurve:'P-256' }, false, ['sign']);
  }catch(e){ return null; }   /* senha errada: a caixa nem abre */
}

const oQueAssina = o => JSON.stringify([o.acao, o.alvo || '', o.quem || '', o.ts, o.extra || '']);

async function assinar(txt){
  if(!chaveAdm) return null;
  return paraB64(await crypto.subtle.sign({ name:'ECDSA', hash:'SHA-256' }, chaveAdm, bytes(txt)));
}

/* qualquer aparelho consegue rodar isto: a chave de conferir é pública */
async function confereAssinatura(txt, firma){
  const p = postoDoAdm();
  if(!p || !p.publica || typeof firma !== 'string') return false;
  try{
    const chave = await crypto.subtle.importKey('spki', deB64(p.publica),
      { name:'ECDSA', namedCurve:'P-256' }, false, ['verify']);
    return await crypto.subtle.verify({ name:'ECDSA', hash:'SHA-256' },
      chave, deB64(firma), bytes(txt));
  }catch(e){ return false; }
}

async function assinaturaVale(ordem){
  if(!ordem || !ADM_ACOES.includes(ordem.acao)) return false;
  /* ordem velha demais não vale: senão alguém guarda uma ordem
     antiga e solta ela de novo mais tarde */
  if(typeof ordem.ts !== 'number' || Math.abs(Date.now() - ordem.ts) > 7 * 86400000) return false;
  return confereAssinatura(oQueAssina(ordem), ordem.f);
}

/* a lista de quem é adm também vai assinada: sem isso qualquer um
   escrevia o próprio nome nela e aparecia com coroa na tela */
const oQueAssinaNomes = p => JSON.stringify([(p.nomes || []).slice().sort(), p.ts]);

async function conferirListaDeAdms(){
  const p = postoDoAdm();
  if(!p){ dados.admNomes = []; return; }
  const vale = await confereAssinatura(oQueAssinaNomes(p), p.fn);
  if(vale) dados.admNomes = (p.nomes || []).slice();
  /* lista torta: fica valendo a última que estava certa */
  salvar();
}

/* ---------- quem é adm ---------- */
const postoDoAdm = () => dados.avisos.find(a => a.tipo === 'adm');
const souAdm = () => !!chaveAdm;
const temAdm = () => !!postoDoAdm();
/* só a lista JÁ CONFERIDA vale — nunca a que veio crua do banco */
const ehAdm = nome => (dados.admNomes || []).includes(nome);

/* ---------- virar adm ---------- */
async function criarAdm(senha){
  const s = senha || prompt('Escolhe a SENHA DE ADM.\n\n' +
    'Ela é diferente do convite. Sem ela ninguém manda na turma — nem tu, se esquecer.');
  if(!s || s.length < 4){ if(s !== null) aviso('A senha precisa de pelo menos 4 letras'); return false; }

  const par = await crypto.subtle.generateKey({ name:'ECDSA', namedCurve:'P-256' }, true, ['sign','verify']);
  chaveAdm = par.privateKey;
  const p = { id: Date.now().toString(36) + Math.random().toString(36).slice(2,6),
              de: dados.eu, ts: Date.now(), tipo:'adm', txt:'Quem manda na turma',
              nomes:[dados.eu],
              publica: paraB64(await crypto.subtle.exportKey('spki', par.publicKey)),
              cofre: await trancarChave(par.privateKey, s), v:1 };
  p.fn = await assinar(oQueAssinaNomes(p));
  dados.avisos.push(p);
  dados.admNomes = [dados.eu];
  salvar(); desenharAdm(); mandarPraTurma(p);
  aviso('👑 Pronto! Tu é o adm da turma');
  return true;
}

async function entrarComoAdm(){
  const p = postoDoAdm();
  if(!p){ criarAdm(); return; }
  const s = prompt('Senha de adm:');
  if(!s) return;
  const c = await abrirChave(p.cofre || {}, s);
  if(!c){ aviso('🔒 Senha errada', 5000); return; }
  chaveAdm = c;
  if(!(p.nomes || []).includes(dados.eu)){
    p.nomes = (p.nomes || []).concat([dados.eu]);
    p.ts = Date.now();
    p.fn = await assinar(oQueAssinaNomes(p));
    p.v = (p.v || 1) + 1;
    salvar(); mandarPraTurma(p);
  }
  await conferirListaDeAdms();
  desenharAdm();
  aviso('👑 Modo adm ligado');
}

function sairDoAdm(){
  chaveAdm = null;
  desenharAdm();
  aviso('👋 Modo adm desligado neste aparelho');
}

/* ---------- mandar uma ordem ---------- */
async function ordemDeAdm(acao, alvo, extra){
  if(!souAdm()){ aviso('Só o adm pode fazer isso'); return false; }
  const o = { acao, alvo: alvo || '', quem: dados.eu, ts: Date.now(), extra: extra || '' };
  o.f = await assinar(oQueAssina(o));
  const a = { id: Date.now().toString(36) + Math.random().toString(36).slice(2,6),
              de: dados.eu, ts: Date.now(), tipo:'ordem', txt:'Ordem do adm', ordem:o, v:1 };
  dados.avisos.push(a);
  salvar(); await obedecer(a); mandarPraTurma(a);
  return true;
}

/* ---------- obedecer (ou não) ---------- */
const ordensFeitas = new Set();
/* as que já passaram na conferência da assinatura */
const ordensBoas = new Set();

async function obedecerTodas(){
  await conferirListaDeAdms();
  for(const a of dados.avisos.filter(x => x.tipo === 'ordem')) await obedecer(a);
}

async function obedecer(a){
  if(!a || !a.ordem || ordensFeitas.has(a.id)) return;
  const o = a.ordem;
  /* a assinatura é o que manda. A lista de nomes é só enfeite:
     quem consegue assinar é adm, quem não consegue não é. */
  if(!await assinaturaVale(o)) return;
  ordensBoas.add(a.id);
  ordensFeitas.add(a.id);

  if(o.acao === 'apagar'){
    const i = dados.avisos.findIndex(x => x.id === o.alvo);
    if(i >= 0 && dados.avisos[i].tipo !== 'adm') dados.avisos.splice(i, 1);
    /* tirar só daqui não adianta: na próxima sincronização o recado
       voltava do banco, e parecia que o adm não tinha apagado nada */
    tirarDaNuvem(o.alvo);
  }
  if(o.acao === 'fixar'){
    const x = achar(o.alvo);
    if(x) x.fixado = o.extra === 'sim';
  }
  if(o.acao === 'limpar'){
    const corte = Date.now() - 30 * 86400000;
    const fica = x => x.ts >= corte || (TIPOS[x.tipo] || {}).config ||
      x.tipo === 'adm' || x.tipo === 'ordem';
    dados.avisos.filter(x => !fica(x)).forEach(x => tirarDaNuvem(x.id));
    dados.avisos = dados.avisos.filter(fica);
  }
  salvar();
}

function tirarDaNuvem(id){
  if(!naTurma() || !id) return;
  fetch(`${endereco()}/mural/${id}.json`, { method:'PUT',
    headers:{'Content-Type':'application/json'}, body:'null' }).catch(() => {});
}

/* ---------- o que as ordens deixam ligado ---------- */
function ordensValendo(){
  /* a mais nova de cada tipo é a que vale */
  const ord = dados.avisos.filter(x => x.tipo === 'ordem' && x.ordem && ordensBoas.has(x.id))
    .sort((a,b) => a.ordem.ts - b.ordem.ts).map(x => x.ordem);
  const estado = { trancado:false, calados:{}, fora:{} };
  ord.forEach(o => {
    if(o.acao === 'trancar') estado.trancado = true;
    if(o.acao === 'destrancar') estado.trancado = false;
    /* extra '0' quer dizer LIBERAR. Com `|| 3600000` o zero caía no
       padrão e a pessoa era silenciada de novo por uma hora. */
    if(o.acao === 'calar') estado.calados[o.alvo] = +o.extra > 0 ? o.ts + (+o.extra) : 0;
    if(o.acao === 'tirar') estado.fora[o.alvo] = true;
    if(o.acao === 'devolver') estado.fora[o.alvo] = false;
  });
  return estado;
}

function muralTrancado(){ return ordensValendo().trancado && !souAdm(); }
function estouCalado(){
  const ate = ordensValendo().calados[dados.eu];
  return ate && ate > Date.now() ? ate : 0;
}
function estouFora(){ return !!ordensValendo().fora[dados.eu]; }

/* o app inteiro pergunta isto antes de deixar escrever */
function possoEscrever(){
  if(estouFora()){
    aviso('🚪 O adm te tirou da turma. Fala com ele.', 7000); return false;
  }
  const ate = estouCalado();
  if(ate){
    const min = Math.ceil((ate - Date.now()) / 60000);
    aviso(`🔇 O adm te silenciou. Volta em ${min > 60 ? Math.ceil(min/60) + 'h' : min + ' min'}.`, 7000);
    return false;
  }
  if(muralTrancado()){
    aviso('🔒 O mural está trancado pelo adm agora.', 6000); return false;
  }
  return true;
}

/* =========================================================
   A TELA
   ========================================================= */
function abrirAdm(){
  desenharAdm();
  mostrar('adm');
}

function desenharAdm(){
  const p = postoDoAdm();
  const eu = souAdm();
  $('#admFora').classList.toggle('escondido', eu);
  $('#admDentro').classList.toggle('escondido', !eu);

  $('#admQuemManda').innerHTML = p
    ? `<b>👑 Quem manda:</b> ${(dados.admNomes || []).map(escapar).join(', ') || '—'}`
    : '<b>Ninguém é adm ainda.</b><br><small>Quem souber a senha vira adm.</small>';
  $('#btVirarAdm').textContent = p ? '🔑 Entrar como adm' : '👑 Virar o adm da turma';

  if(!eu) return;

  const est = ordensValendo();
  $('#btTrancar').textContent = est.trancado ? '🔓 Destrancar o mural' : '🔒 Trancar o mural';
  $('#btTrancar').classList.toggle('on', est.trancado);

  /* as denúncias esperando decisão */
  const denunciados = dados.avisos.filter(a => Object.keys(a.denuncias || {}).length);
  $('#admDenuncias').innerHTML = denunciados.length
    ? denunciados.map(a => `
      <div class="adm-item">
        <div><b>${escapar(a.de)}</b> · ${Object.keys(a.denuncias).length} aviso(s)
          <small>${escapar(String(a.txt)).slice(0,70)}</small></div>
        <div class="adm-bts">
          <button class="rec-bt" data-admapaga="${a.id}">🗑️ Apagar</button>
          <button class="rec-bt" data-admlibera="${a.id}">✅ Deixar</button>
        </div>
      </div>`).join('')
    : '<p class="dica">Nenhuma denúncia esperando 😊</p>';

  /* a turma, com os botões de adm */
  const gente = genteDaTurma().concat([dados.eu]).sort();
  $('#admGente').innerHTML = gente.map(n => {
    const calado = est.calados[n] > Date.now();
    const fora = est.fora[n];
    return `
      <div class="adm-item">
        <div><b>${escapar(n)}${ehAdm(n) ? ' 👑' : ''}</b>
          <small>${fora ? '🚪 fora da turma' : calado ? '🔇 silenciado' : 'na turma'}</small></div>
        <div class="adm-bts">
          ${n === dados.eu ? '' : `
            <button class="rec-bt" data-admcala="${escapar(n)}">${calado ? '🔊' : '🔇'}</button>
            <button class="rec-bt" data-admtira="${escapar(n)}">${fora ? '🚪↩️' : '🚪'}</button>
            <button class="rec-bt" data-admcoroa="${escapar(n)}">${ehAdm(n) ? '👑✕' : '👑'}</button>`}
        </div>
      </div>`;
  }).join('');

  $('#admDenuncias').querySelectorAll('[data-admapaga]').forEach(b =>
    b.addEventListener('click', () => admApagar(b.dataset.admapaga)));
  $('#admDenuncias').querySelectorAll('[data-admlibera]').forEach(b =>
    b.addEventListener('click', () => admLiberar(b.dataset.admlibera)));
  $('#admGente').querySelectorAll('[data-admcala]').forEach(b =>
    b.addEventListener('click', () => admCalar(b.dataset.admcala)));
  $('#admGente').querySelectorAll('[data-admtira]').forEach(b =>
    b.addEventListener('click', () => admTirar(b.dataset.admtira)));
  $('#admGente').querySelectorAll('[data-admcoroa]').forEach(b =>
    b.addEventListener('click', () => admCoroar(b.dataset.admcoroa)));
}

async function admApagar(id){
  const a = achar(id);
  if(!a) return;
  if(!confirm(`Apagar o recado de ${a.de}?\n\n"${String(a.txt).slice(0,60)}"\n\nSome pra todo mundo.`)) return;
  await ordemDeAdm('apagar', id);
  desenharMural(); desenharAdm();
  aviso('🗑️ Apagado pra todo mundo');
}

function admLiberar(id){
  const a = achar(id);
  if(!a) return;
  a.denuncias = {};
  a.v = (a.v || 1) + 1;
  salvar(); desenharMural(); desenharAdm(); mandarPraTurma(a);
  aviso('✅ Recado liberado — volta a aparecer');
}

async function admCalar(nome){
  const est = ordensValendo();
  if(est.calados[nome] > Date.now()){
    await ordemDeAdm('calar', nome, '0');
    desenharAdm(); aviso('🔊 ' + nome + ' pode escrever de novo'); return;
  }
  const q = prompt(`Silenciar ${nome} por quanto tempo?\n\n1 — 1 hora\n2 — até amanhã\n3 — uma semana`, '1');
  const tempos = { '1':3600000, '2':86400000, '3':604800000 };
  if(!tempos[q]) return;
  await ordemDeAdm('calar', nome, String(tempos[q]));
  desenharAdm();
  aviso('🔇 ' + nome + ' foi silenciado');
}

async function admTirar(nome){
  const est = ordensValendo();
  if(est.fora[nome]){
    await ordemDeAdm('devolver', nome);
    desenharAdm(); aviso('🚪 ' + nome + ' voltou pra turma'); return;
  }
  if(!confirm(`Tirar ${nome} da turma?\n\nEla não escreve mais. Dá pra voltar atrás depois.`)) return;
  await ordemDeAdm('tirar', nome);
  desenharAdm();
  aviso('🚪 ' + nome + ' saiu da turma');
}

async function admCoroar(nome){
  const p = postoDoAdm();
  if(!p) return;
  if(ehAdm(nome)){
    if((dados.admNomes || []).length <= 1){ aviso('Não dá pra tirar o último adm 😊', 5000); return; }
    if(!confirm(`Tirar o cargo de adm de ${nome}?`)) return;
    p.nomes = (dados.admNomes || []).filter(n => n !== nome);
  }else{
    if(!confirm(`Fazer ${nome} adm também?\n\nTu vai precisar contar a senha de adm pra ela.`)) return;
    p.nomes = (dados.admNomes || []).concat([nome]);
  }
  p.ts = Date.now();
  p.fn = await assinar(oQueAssinaNomes(p));
  p.v = (p.v || 1) + 1;
  dados.admNomes = p.nomes.slice();
  salvar(); desenharAdm(); mandarPraTurma(p);
  aviso('👑 Pronto! Conta a senha pra ela usar');
}

async function admTrancar(){
  const est = ordensValendo();
  await ordemDeAdm(est.trancado ? 'destrancar' : 'trancar');
  desenharAdm(); desenharMural();
  aviso(est.trancado ? '🔓 Mural destrancado' : '🔒 Mural trancado — só tu escreve agora');
}

async function admLimpar(){
  if(!confirm('Apagar tudo que tem mais de 30 dias?\n\nOs horários, as férias e quem é adm ficam.')) return;
  await ordemDeAdm('limpar');
  desenharMural(); desenharAdm();
  aviso('🧹 Mural limpo');
}

async function admTrocarSenha(){
  if(!souAdm()) return;
  if(!confirm('Trocar a senha de adm?\n\nTodo mundo que era adm vai precisar da senha nova.')) return;
  const s = prompt('Senha nova (pelo menos 4 letras):');
  if(!s || s.length < 4) return;
  const par = await crypto.subtle.generateKey({ name:'ECDSA', namedCurve:'P-256' }, true, ['sign','verify']);
  chaveAdm = par.privateKey;
  const p = postoDoAdm();
  p.publica = paraB64(await crypto.subtle.exportKey('spki', par.publicKey));
  p.cofre = await trancarChave(par.privateKey, s);
  p.nomes = [dados.eu];
  p.ts = Date.now();
  p.fn = await assinar(oQueAssinaNomes(p));
  p.v = (p.v || 1) + 1;
  dados.admNomes = [dados.eu];
  /* chave nova: as ordens velhas foram assinadas pela antiga e param de valer */
  ordensBoas.clear(); ordensFeitas.clear();
  salvar(); desenharAdm(); mandarPraTurma(p);
  aviso('🔑 Senha trocada. Agora só tu é adm — coroa quem tu quiser de novo', 8000);
}

/* a faixa que avisa a turma quando o mural está trancado */
function desenharAvisoDeTranca(){
  const faixa = $('#faixaTranca');
  if(!faixa) return;
  const est = ordensValendo();
  const calado = estouCalado();
  const fora = estouFora();
  let txt = '';
  if(fora) txt = '🚪 <b>O adm te tirou da turma.</b> Tu ainda lê o mural, mas não escreve. Fala com ele.';
  else if(calado){
    const min = Math.ceil((calado - Date.now()) / 60000);
    txt = `🔇 <b>Tu está silenciado</b> por mais ${min > 60 ? Math.ceil(min/60) + ' hora(s)' : min + ' min'}.`;
  }
  else if(est.trancado) txt = souAdm()
    ? '🔒 <b>Tu trancou o mural.</b> Só adm escreve agora.'
    : '🔒 <b>O mural está trancado</b> pelo adm. Só dá pra ler.';
  faixa.innerHTML = txt;
  faixa.classList.toggle('escondido', !txt);
}
