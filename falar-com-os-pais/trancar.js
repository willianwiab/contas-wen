/* =========================================================
   trancar.js — a tranca com número (PIN) pra abrir o chat.
   É uma cortina pra ninguém xeretar sem querer: os recados
   continuam guardados no aparelho, então não é um cofre.
   ========================================================= */

let tentativas = 0;

function temTranca(){ return !!(dados.pin && dados.pin.length >= 4); }

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
  const conferir = () => {
    if(digitado === dados.pin){
      tela.remove();
      document.body.classList.remove('trancado');
      tentativas = 0;
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
    if(digitado.length === dados.pin.length) setTimeout(conferir, 150);
  }));
  document.getElementById('trApaga').addEventListener('click', () => { digitado = digitado.slice(0,-1); bolinhas(); });
  document.getElementById('trOk').addEventListener('click', conferir);
  document.getElementById('trEsqueci').addEventListener('click', () => {
    if(!confirm('Tirar a tranca?\n\nOs recadinhos continuam todos aqui — só a senha some.\nQualquer um que pegar o aparelho vai poder abrir.')) return;
    delete dados.pin; delete dados.dica; salvar();
    tela.remove(); document.body.classList.remove('trancado');
    toast('Tranca tirada 🔓');
  });
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
  dados.pin = pin.slice(0,8); dados.dica = dica; salvar();
  desenharTranca();
  toast('Tranca ligada! 🔒 Na próxima vez ele vai pedir a senha');
}

function desenharTranca(){
  const bt = document.getElementById('btnTranca');
  if(!bt) return;
  bt.textContent = temTranca() ? '🔓 Tirar a senha' : '🔒 Pôr uma senha';
}
