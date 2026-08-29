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

let fonteNuvem = null;    // EventSection aberta
let chaveNuvem = null;    // chave de embaralhar
let estadoNuvem = 'desligado';   // desligado | ligando | ligado | erro

const nuvemLigada = () => !!(dados.nuvem && dados.nuvem.url && dados.nuvem.sala && dados.nuvem.senha);

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

/* ---------- mandar ---------- */
async function mandarPraNuvem(conversa, msg){
  if(!nuvemLigada() || msg.naNuvem) return;
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
    const r = await fetch(`${enderecoSala()}/${id}.json`, {
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
  if(msg.de !== 'eu') dados.presenca[msg.de] = Math.max(dados.presenca[msg.de] || 0, msg.ts);
  return true;
}

async function chegouDaNuvem(pacote){
  if(!pacote || !pacote.c) return;
  const claro = await desembaralhar(pacote);
  if(!claro || !claro.msg) return;
  const novo = await guardarRecebido(claro.conversa, claro.msg);
  if(!novo) return;
  salvar();
  desenharContatos();
  if(atual === claro.conversa) desenharMensagens();
  atualizarBolinhaDoIcone();
  const p = PESSOAS[claro.msg.de] || PESSOAS.eu;
  blim(false);
  avisar(`${p.emoji} ${p.nome}`, textoDe(claro.msg), claro.conversa);
}

/* ---------- ligar e desligar ---------- */
function ligarNuvem(){
  desligarNuvem();
  if(!nuvemLigada()) return;
  marcarNuvem('ligando');
  try{
    fonteNuvem = new EventSource(enderecoSala() + '.json');
  }catch(e){ marcarNuvem('erro', 'endereço estranho'); return; }

  fonteNuvem.addEventListener('put', async ev => {
    marcarNuvem('ligado');
    let d; try{ d = JSON.parse(ev.data); }catch(e){ return; }
    if(!d) return;
    if(d.path === '/' && d.data){                    // chegou tudo de uma vez
      for(const pacote of Object.values(d.data)) await chegouDaNuvem(pacote);
    }else if(d.data){                                // chegou um recado novo
      await chegouDaNuvem(d.data);
    }
  });
  fonteNuvem.addEventListener('patch', ev => {
    try{ const d = JSON.parse(ev.data); if(d && d.data) Object.values(d.data).forEach(chegouDaNuvem); }catch(e){}
  });
  fonteNuvem.onopen  = () => marcarNuvem('ligado');
  fonteNuvem.onerror = () => marcarNuvem(fonteNuvem && fonteNuvem.readyState === 1 ? 'ligado' : 'erro', 'sem conexão com o banco');
}

function desligarNuvem(){
  if(fonteNuvem){ try{ fonteNuvem.close(); }catch(e){} fonteNuvem = null; }
  chaveNuvem = null;
  marcarNuvem('desligado');
}

function marcarNuvem(estado, detalhe){
  estadoNuvem = estado;
  const chip = document.getElementById('chipNuvem');
  if(chip){
    chip.className = 'net nuvem ' + estado;
    const txt = { desligado:'Só neste aparelho', ligando:'Conectando...', ligado:'Enviando de verdade ☁️', erro:'Deu erro no envio' }[estado];
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
  const n = dados.nuvem || {};
  document.getElementById('nuvemUrl').value  = n.url  || '';
  document.getElementById('nuvemSala').value = n.sala || '';
  document.getElementById('nuvemSenha').value= n.senha|| '';
  const bt = document.getElementById('btnConvite');
  if(bt) bt.classList.toggle('escondido', !nuvemLigada());
  marcarNuvem(estadoNuvem);
}

function salvarNuvem(){
  const url = document.getElementById('nuvemUrl').value.trim();
  const sala = document.getElementById('nuvemSala').value.trim();
  const senha = document.getElementById('nuvemSenha').value.trim();
  if(!url || !sala || !senha){ toast('Falta preencher os três campos 😊'); return; }
  if(!/^https:\/\/.+/.test(url)){ toast('O endereço tem que começar com https:// 😊'); return; }
  dados.nuvem = { url, sala, senha }; salvar(); chaveNuvem = null;
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
