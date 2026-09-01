/* =========================================================
   trancar.js — a tranca com número (PIN) pra abrir o chat.

   DUAS COISAS QUE ESTAVAM ERRADAS E FORAM CONSERTADAS:

   1) O número ficava guardado em texto puro. Quem abrisse o
      armazenamento do navegador lia a senha. Agora fica só a
      MISTURA dele (PBKDF2 + um sal sorteado): dá pra conferir
      se o número está certo, mas não dá pra descobrir qual é.

   2) A tela trancada só DESFOCAVA o conteúdo por cima. Os
      recados continuavam desenhados por baixo — bastava tirar
      um filtro do CSS pra ler tudo. Agora o miolo do site nem
      é desenhado antes de a senha entrar.

   Continua não sendo um cofre: os recados seguem guardados no
   aparelho, e quem souber mexer no navegador chega neles. É
   uma cortina — mas agora uma cortina de verdade.
   ========================================================= */

let tentativas = 0;

/* pin novo = { sal, mistura }. Texto puro só existe no formato velho. */
function temTranca(){
  const p = dados.pin;
  if(!p) return false;
  return typeof p === 'string' ? p.length >= 4 : !!(p.sal && p.mistura);
}

const bytesTranca = t => new TextEncoder().encode(t);
const b64Tranca = buf => btoa(String.fromCharCode(...new Uint8Array(buf)));

async function misturarPin(pin, sal){
  const base = await crypto.subtle.importKey('raw', bytesTranca(pin), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name:'PBKDF2', salt: bytesTranca(sal), iterations: 210000, hash:'SHA-256' }, base, 256);
  return b64Tranca(bits);
}

async function guardarPin(pin){
  const sal = b64Tranca(crypto.getRandomValues(new Uint8Array(16)));
  dados.pin = { sal, mistura: await misturarPin(pin, sal), tam: pin.length };
  salvar();
}

async function pinConfere(digitado){
  const p = dados.pin;
  if(!p) return false;
  if(typeof p === 'string'){
    /* formato velho: confere e já converte pro novo, sem incomodar ninguém */
    if(digitado !== p) return false;
    await guardarPin(digitado);
    return true;
  }
  try{ return (await misturarPin(digitado, p.sal)) === p.mistura; }
  catch(e){ return false; }
}

const tamanhoDoPin = () => {
  const p = dados.pin;
  return typeof p === 'string' ? p.length : (p && p.tam) || 4;
};

function pedirTranca(){
  if(!temTranca()) return;
  document.body.classList.add('trancado');
  const tela = document.createElement('div');
  tela.className = 'tela-cheia tranca';
  tela.id = 'telaTranca';
  tela.innerHTML = `
    <div class="tr-meio">
      <div class="tr-cadeado">🔒</div>
      <h2>Fala, Família!</h2>
      <p class="tr-txt" id="trTxt">Digita a senha pra entrar</p>
      <div class="tr-bolinhas" id="trBolinhas">${'<span></span>'.repeat(4)}</div>
      <div class="teclado">
        ${[1,2,3,4,5,6,7,8,9].map(n => `<button data-n="${n}">${n}</button>`).join('')}
        <button id="trApaga">⌫</button>
        <button data-n="0">0</button>
        <button id="trOk">✅</button>
      </div>
      <button class="tr-esqueci escondido" id="trEsqueci">esqueci a senha</button>
      <button class="tr-ficha escondido" id="trFicha">🩺 Ficha de emergência</button>
    </div>`;
  document.body.appendChild(tela);

  /* A ficha abre SEM a senha, de propósito: quem achar este celular
     caído na rua precisa conseguir ligar pros pais. Não tem recado
     nenhum ali dentro, só o que serve pra ajudar. */
  const btFicha = document.getElementById('trFicha');
  if(typeof fichaTemAlgo === 'function' && fichaTemAlgo()){
    btFicha.classList.remove('escondido');
    btFicha.addEventListener('click', () => abrirFicha(true));
  }

  let digitado = '';
  const bolinhas = () => {
    document.querySelectorAll('#trBolinhas span').forEach((b,i) => b.classList.toggle('on', i < digitado.length));
  };
  const conferir = async () => {
    if(await pinConfere(digitado)){
      tela.remove();
      document.body.classList.remove('trancado');
      destrancado = true;
      tentativas = 0;
      desenharDepoisDaTranca();
      return;
    }
    tentativas++;
    digitado = ''; bolinhas();
    const txt = document.getElementById('trTxt');
    txt.textContent = 'Senha errada 😕 tenta de novo';
    tela.querySelector('.tr-meio').classList.add('treme');
    setTimeout(() => tela.querySelector('.tr-meio').classList.remove('treme'), 500);
    if(tentativas >= 3 && dados.dica) txt.textContent = `Senha errada 😕 Dica: ${dados.dica}`;
    if(tentativas >= 6) document.getElementById('trEsqueci').classList.remove('escondido');
  };

  tela.querySelectorAll('[data-n]').forEach(b => b.addEventListener('click', () => {
    if(digitado.length >= 8) return;
    digitado += b.dataset.n; bolinhas();
    if(digitado.length === tamanhoDoPin()) setTimeout(conferir, 150);
  }));
  document.getElementById('trApaga').addEventListener('click', () => { digitado = digitado.slice(0,-1); bolinhas(); });
  document.getElementById('trOk').addEventListener('click', conferir);
  document.getElementById('trEsqueci').addEventListener('click', () => {
    if(!confirm('Tirar a tranca?\n\nOs recadinhos continuam todos aqui — só a senha some.\nQualquer um que pegar o aparelho vai poder abrir.')) return;
    delete dados.pin; delete dados.dica; salvar();
    tela.remove(); document.body.classList.remove('trancado');
    destrancado = true; desenharDepoisDaTranca();
    toast('Tranca tirada 🔓');
  });
}

/* Trocar a senha sem tirar a tranca: pede a de agora, depois a nova. */
async function trocarSenhaDaTranca(){
  if(!temTranca()){ mudarTranca(); return; }
  const velha = (prompt('Digita a senha de AGORA:') || '').replace(/\D/g,'');
  if(!(await pinConfere(velha))){ toast('Essa não é a senha de agora 😕', 5000); return; }
  const nova = (prompt('Agora a senha NOVA (4 números):') || '').replace(/\D/g,'');
  if(nova.length < 4){ toast('Precisa ser de 4 números 😊'); return; }
  await guardarPin(nova.slice(0,8));
  dados.dica = (prompt('Uma dica nova pra lembrar. Pode deixar vazio:') || '').trim();
  salvar(); desenharTranca();
  toast('Senha trocada! 🔒');
}

function mudarTranca(){
  if(temTranca()){
    if(!confirm('Tirar a senha do chat?')) return;
    delete dados.pin; delete dados.dica; salvar();
    desenharTranca(); toast('Tranca tirada 🔓');
    return;
  }
  const pin = (prompt('Escolhe uma senha de 4 números (ex.: 2013):') || '').replace(/\D/g,'');
  if(pin.length < 4){ toast('Precisa ser de 4 números 😊'); return; }
  const dica = (prompt('Uma dica pra lembrar (aparece depois de 3 erros). Pode deixar vazio:') || '').trim();
  dados.dica = dica;
  guardarPin(pin.slice(0,8)).then(() => {
    desenharTranca();
    toast('Tranca ligada! 🔒 Na próxima vez ele vai pedir a senha');
  });
}

function desenharTranca(){
  const bt = document.getElementById('btnTranca');
  if(!bt) return;
  bt.textContent = temTranca() ? '🔓 Tirar a senha' : '🔒 Pôr uma senha';
  const troca = document.getElementById('btnTrocarSenha');
  if(troca) troca.classList.toggle('escondido', !temTranca());
}


/* ---------- o conteúdo só existe DEPOIS da senha ----------
   Antes o site inteiro era desenhado e a tranca só punha um desfoque
   por cima: bastava tirar um filtro do CSS pra ler tudo. Agora nada é
   desenhado antes. */
let destrancado = false;

function precisaDestrancar(){ return temTranca() && !destrancado; }

function desenharDepoisDaTranca(){
  if(precisaDestrancar()) return;
  try{
    desenharContatos();
    if(typeof desenharRecadosDoDia === 'function') desenharRecadosDoDia();
    if(typeof desenharVigia === 'function') desenharVigia();
    if(typeof telaVazia === 'function' && !atual) telaVazia();
    if(atual) desenharConversa();
  }catch(e){}
}
