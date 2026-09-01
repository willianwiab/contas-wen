/* =========================================================
   sinais.js — os avisinhos que passam pelo banco da família:
   "está escrevendo...", "já viu" e "apagou pra todos".

   São coisas pequenas e que mudam toda hora, então ficam num
   canto separado dos recados e sem embaralhar (o que passa
   aqui é só um horário e o nome de quem fez).
   ========================================================= */

const TEMPO_DIGITANDO = 6000;    // depois disso, "está escrevendo" some
let ultimoAvisoDigitando = 0;
let digitandoAgora = {};         // conversa -> { pessoa: ts }
let vistoDosOutros = {};         // conversa -> { pessoa: ts }
let relogioSinais = null;

const enderecoSinais = () =>
  `${dados.nuvem.url.replace(/\/$/,'')}/salas/${dados.nuvem.sala}/sinais`;

const podeSinalizar = () => nuvemLigada() && !modoPublico() && dados.euSou;

/* Sinais que carregam coisa PRIVADA vão embaralhados, igual aos recados.
   Antes iam em texto puro — e "ondeestou" leva as coordenadas do GPS de
   uma criança, o que é a última coisa que devia ficar legível no banco.
   Os outros (digitando, visto) são só horários e não valem o custo de
   embaralhar de 3 em 3 segundos. */
const SINAIS_PRIVADOS = ['ondeestou', 'despertador', 'recados'];
const sinalEhPrivado = caminho => SINAIS_PRIVADOS.some(p => caminho.startsWith(p));

async function escreverSinal(caminho, valor){
  if(!podeSinalizar()) return;
  try{
    let corpo = valor;
    if(valor !== null && sinalEhPrivado(caminho) && !(valor && valor.iv && valor.c)){
      corpo = await embaralhar(valor);
    }
    await fetch(`${enderecoSinais()}/${caminho}.json`, {
      method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify(corpo)
    });
  }catch(e){}
}

/* abre um pacote de sinal privado, aceitando também o formato antigo
   (texto puro) pra não sumir o que já estava no banco */
async function abrirSinal(pacote){
  if(!pacote) return null;
  if(pacote.iv && pacote.c) return await desembaralhar(pacote);
  return pacote;
}

/* ---------- está escrevendo ---------- */
function avisarQueEstouEscrevendo(){
  if(!atual || !podeSinalizar()) return;
  const agora = Date.now();
  if(agora - ultimoAvisoDigitando < 2500) return;    // não enche o banco
  ultimoAvisoDigitando = agora;
  escreverSinal(`digitando/${atual}/${dados.euSou}`, agora);
}
function pareiDeEscrever(){
  if(!atual || !podeSinalizar()) return;
  ultimoAvisoDigitando = 0;
  escreverSinal(`digitando/${atual}/${dados.euSou}`, 0);
}

/* ---------- já vi ---------- */
function avisarQueVi(conversa){
  if(!podeSinalizar()) return;
  escreverSinal(`visto/${conversa}/${dados.euSou}`, Date.now());
}

/* ---------- apagar pra todos ---------- */
async function apagarPraTodos(conversa, msg){
  if(!podeSinalizar() || !msg.uid) return false;
  await escreverSinal(`apagados/${conversa}/${msg.uid}`, Date.now());
  try{
    await fetch(`${enderecoConversa(conversa)}/${msg.uid}.json`,
      { method:'PUT', headers:{'Content-Type':'application/json'}, body:'null' });
  }catch(e){}
  return true;
}

/* ---------- ler os sinais dos outros ---------- */
async function lerSinais(){
  if(!podeSinalizar()) return;
  try{
    const r = await fetch(enderecoSinais() + '.json');
    if(!r.ok) return;
    const tudo = await r.json() || {};
    digitandoAgora = tudo.digitando || {};
    vistoDosOutros = tudo.visto || {};

    /* apagados: some com o recado aqui também */
    let mudou = false;
    Object.entries(tudo.apagados || {}).forEach(([conversa, apagados]) => {
      const lista = dados.msgs[conversa];
      if(!lista) return;
      Object.keys(apagados).forEach(uid => {
        const m = lista.find(x => x.uid === uid && !x.apagado);
        if(!m) return;
        if(m.id && (m.tipo === 'audio' || m.tipo === 'foto' || m.tipo === 'video')) apagarAudio(m.id);
        Object.keys(m).forEach(k => { if(!['de','ts','uid'].includes(k)) delete m[k]; });
        m.apagado = true; mudou = true;
      });
    });
    if(mudou){ salvar(); if(atual) desenharMensagens(); desenharContatos(); }

    /* 💭 os recados do dia dos outros vêm no mesmo pacote */
    if(typeof receberRecados === 'function') await receberRecados(tudo.recados);
    /* ⏰ tem despertador marcado pra mim? (vem embaralhado) */
    if(typeof conferirDespertador === 'function' && tudo.despertador && dados.euSou){
      const meu = await abrirSinal(tudo.despertador[dados.euSou]);
      if(meu) conferirDespertador({ [dados.euSou]: meu });
    }
    /* 📍 quem está deixando a família ver onde está (embaralhado) */
    if(typeof receberOndeEstao === 'function'){
      const abertos = {};
      for(const [p, pacote] of Object.entries(tudo.ondeestou || {})){
        const o = await abrirSinal(pacote);
        if(o) abertos[p] = o;
      }
      receberOndeEstao(abertos);
    }
    /* 🔋 a bateria de cada um */
    if(typeof receberBaterias === 'function') receberBaterias(tudo.baterias);

    mostrarQuemEstaEscrevendo();
    if(atual) atualizarTiquinhos();
  }catch(e){}
}

function mostrarQuemEstaEscrevendo(){
  const alvo = document.querySelector('.conversa-topo .status');
  if(!alvo || !atual) return;
  const agora = Date.now();
  const gente = Object.entries(digitandoAgora[atual] || {})
    .filter(([p, ts]) => !souEu(p) && agora - ts < TEMPO_DIGITANDO)
    .map(([p]) => PESSOAS[p] ? PESSOAS[p].curto : p);
  if(gente.length){
    alvo.innerHTML = `<i class="escrevendo">${gente.join(' e ')} ${gente.length > 1 ? 'estão' : 'está'} escrevendo<span>.</span><span>.</span><span>.</span></i>`;
    alvo.dataset.escrevendo = '1';
  }else if(alvo.dataset.escrevendo){
    delete alvo.dataset.escrevendo;
    atualizarStatusTopo();
  }
}

/* ✓ = saiu daqui, ✓✓ = a pessoa abriu a conversa depois que o recado chegou */
function foiVisto(conversa, msg){
  const vistos = vistoDosOutros[conversa] || {};
  return Object.entries(vistos).some(([p, ts]) => !souEu(p) && ts >= msg.ts);
}
function atualizarTiquinhos(){
  document.querySelectorAll('.linha-msg.eu .tique').forEach(el => {
    const m = dados.msgs[atual] && dados.msgs[atual][+el.dataset.i];
    if(!m) return;
    const visto = foiVisto(atual, m);
    el.textContent = m.pendente ? '⏳' : (m.uid ? (visto ? '✓✓' : '✓') : '');
    el.classList.toggle('visto', visto && !m.pendente);
    el.classList.toggle('esperando', !!m.pendente);
    el.title = m.pendente ? 'esperando a internet voltar' : '';
  });
}

/* de 3 em 3 segundos: rapidinho o bastante pra "escrevendo" fazer sentido */
function ligarSinais(){
  clearInterval(relogioSinais);
  if(!podeSinalizar()) return;
  lerSinais();
  if(typeof lembrarMeuRecado === 'function') lembrarMeuRecado();   // 💭 o meu volta pro banco
  relogioSinais = setInterval(() => { if(!document.hidden) lerSinais(); }, 3000);
}
function desligarSinais(){ clearInterval(relogioSinais); }
