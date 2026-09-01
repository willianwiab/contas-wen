/* =========================================================
   ia.js — o Ajudante: uma IA de verdade (Claude) dentro do app.

   A chave da API é colada por quem usa e fica guardada SÓ neste
   aparelho (localStorage). Ela nunca entra no GitHub e nunca é
   enviada pra lugar nenhum além da própria Anthropic. Quem tem a
   chave paga pelo uso, por isso ela não vem pronta no site.

   O SDK oficial é baixado só na primeira vez que o Ajudante é
   usado, pra o resto do site continuar funcionando sem internet.
   ========================================================= */

const MODELOS_IA = {
  'claude-opus-5' : { nome:'Opus 5 (o mais inteligente)', preco:'US$ 5 / 25 por milhão de letrinhas' },
  'claude-haiku-4-5': { nome:'Haiku 4.5 (o mais barato)',  preco:'US$ 1 / 5 por milhão de letrinhas' }
};

const COMO_SER = `Você é o Ajudante da família Wen, dentro de um site de recados feito pelo Jojo.
Fale português do Brasil, de um jeito simples e alegre, como quem conversa com uma criança de 10 anos
e com os pais dela. Respostas curtas (no máximo uns 4 parágrafos), sem enrolação.
Ajude com lição de casa explicando o caminho em vez de só dar a resposta pronta.
Se não souber, diga que não sabe. Nunca invente fatos sobre a família.
Você é uma inteligência artificial — se perguntarem, diga isso com naturalidade.`;

let clienteIA = null;
let conversaIA = [];      // histórico desta sessão

const temChaveIA = () => !!(dados.ia && dados.ia.chave);

async function pegarClienteIA(){
  if(clienteIA) return clienteIA;
  const { default: Anthropic } = await import('https://esm.sh/@anthropic-ai/sdk');
  clienteIA = new Anthropic({
    apiKey: dados.ia.chave,
    dangerouslyAllowBrowser: true    // a chave é do próprio dono do aparelho
  });
  return clienteIA;
}

/* ---------- a tela do Ajudante ---------- */
function abrirIA(){
  if(document.getElementById('telaIA')) return;
  const tela = document.createElement('div');
  tela.className = 'tela-cheia'; tela.id = 'telaIA';
  tela.innerHTML = `
    <div class="w-topo" style="background:linear-gradient(135deg,#0f766e,#0891b2)">
      <button class="icone" id="iaFechar">✕</button>
      <div><b>🤖 Ajudante</b><div class="w-sub">uma inteligência artificial de verdade</div></div>
      <div class="icones"><button class="icone" id="iaHistoria" title="Historinha de dormir">🌙</button></div>
    </div>
    <div class="ia-conversa" id="iaConversa"></div>
    <div class="rapidas" id="iaRapidas">
      <button class="rapida">Me ajuda na lição de matemática</button>
      <button class="rapida">Conta uma curiosidade legal</button>
      <button class="rapida">Uma ideia de brincadeira pra hoje</button>
      <button class="rapida">Explica isso de um jeito fácil:</button>
    </div>
    <div class="barra">
      <div class="campo">
        <textarea id="iaEntrada" rows="1" placeholder="${temChaveIA() ? 'Pergunta o que tu quiser...' : 'Falta a chave nos ⚙️ Ajustes'}"></textarea>
      </div>
      <button class="enviar" id="iaEnviar" title="Perguntar">➤</button>
    </div>`;
  document.body.appendChild(tela);
  document.getElementById('iaFechar').addEventListener('click', () => { pararHistorinha(); tela.remove(); });
  document.getElementById('iaHistoria').addEventListener('click', contarHistorinha);
  document.getElementById('iaEnviar').addEventListener('click', perguntarPraIA);
  document.getElementById('iaEntrada').addEventListener('keydown', e => {
    if(e.key === 'Enter' && !e.shiftKey){ e.preventDefault(); perguntarPraIA(); }
  });
  tela.querySelectorAll('#iaRapidas .rapida').forEach(b => b.addEventListener('click', () => {
    const campo = document.getElementById('iaEntrada');
    campo.value = b.textContent.trim(); campo.focus();
  }));
  desenharIA();
}

function desenharIA(){
  const caixa = document.getElementById('iaConversa');
  if(!caixa) return;
  if(!temChaveIA()){
    caixa.innerHTML = `
      <div class="ia-aviso">
        <div class="balao-deco">🤖</div>
        <h3>Ajudante da família</h3>
        <p>Quer usar o Ajudante com inteligência artificial? Ele ajuda na lição,
        explica coisas difíceis e conta historinha de dormir.</p>
        <p class="ia-cadeado">🔐 Fica guardado <b>só neste aparelho</b>.</p>
        <button class="lig-bt ok grande" id="iaConfigurar">Configurar Ajudante</button>
      </div>`;
    const bt = document.getElementById('iaConfigurar');
    if(bt) bt.addEventListener('click', abrirPassoAPasso);
    return;
  }
  caixa.innerHTML = conversaIA.length
    ? conversaIA.map(m => `
        <div class="linha-msg ${m.role === 'user' ? 'eu' : 'eles'}">
          <div class="msg ${m.role === 'user' ? 'eu' : 'eles'}">
            <span class="txt">${escapar(m.texto)}</span>
          </div>
        </div>`).join('')
    : `<div class="ia-aviso"><div class="balao-deco">🤖</div><h3>Oi! Sou o Ajudante</h3>
       <p>Posso ajudar na lição, explicar coisas difíceis, dar ideias e contar curiosidades.
       Sou uma inteligência artificial — às vezes erro, então confere as coisas importantes. 😊</p></div>`;
  caixa.scrollTop = caixa.scrollHeight;
}

/* Pergunta avulsa, sem entrar no histórico da conversa do Ajudante:
   é o que a 🌙 historinha e o ✍️ "me ajuda a escrever" usam. */
async function pedirPraIA(pergunta, comoSer, teto){
  const cliente = await pegarClienteIA();
  const resposta = await cliente.messages.create({
    model: (dados.ia && dados.ia.modelo) || 'claude-opus-5',
    max_tokens: teto || 1024,
    system: comoSer || COMO_SER,
    output_config: { effort: 'low' },
    messages: [{ role:'user', content: pergunta }]
  });
  return resposta.content.filter(b => b.type === 'text').map(b => b.text).join('\n').trim();
}

async function perguntarPraIA(){
  const campo = document.getElementById('iaEntrada');
  const pergunta = (campo.value || '').trim();
  if(!pergunta) return;
  if(!temChaveIA()){ toast('Falta a chave nos ⚙️ Ajustes 🔑', 5000); return; }

  conversaIA.push({ role:'user', texto: pergunta });
  campo.value = '';
  desenharIA();

  const caixa = document.getElementById('iaConversa');
  caixa.insertAdjacentHTML('beforeend',
    `<div class="linha-msg eles" id="iaPensando"><div class="msg eles"><span class="txt">pensando<span class="escrevendo"><span>.</span><span>.</span><span>.</span></span></span></div></div>`);
  caixa.scrollTop = caixa.scrollHeight;

  try{
    const cliente = await pegarClienteIA();
    const resposta = await cliente.messages.create({
      model: (dados.ia && MODELOS_IA[dados.ia.modelo]) ? dados.ia.modelo : 'claude-opus-5',
      max_tokens: 1024,                       // respostas curtas: é conversa, e cada letrinha custa
      system: COMO_SER,
      output_config: { effort: 'low' },       // pergunta de casa não precisa de esforço máximo
      messages: conversaIA.map(m => ({ role: m.role, content: m.texto }))
    });
    const texto = resposta.content.filter(b => b.type === 'text').map(b => b.text).join('\n').trim();
    conversaIA.push({ role:'assistant', texto: texto || '(não veio resposta)' });
  }catch(e){
    conversaIA.push({ role:'assistant', texto: explicarErroIA(e) });
  }
  const pensando = document.getElementById('iaPensando');
  if(pensando) pensando.remove();
  desenharIA();
}

function explicarErroIA(e){
  const codigo = e && (e.status || e.statusCode);
  if(codigo === 401) return '🔑 A chave não foi aceita. Confere se colou ela inteirinha nos ⚙️ Ajustes.';
  if(codigo === 429) return '⏳ Muitas perguntas de uma vez (ou o crédito acabou). Espera um pouquinho e tenta de novo.';
  if(codigo === 400) return '😅 O pedido não foi aceito: ' + (e.message || '');
  if(codigo >= 500)  return '🛠️ O servidor da IA está com problema agora. Tenta daqui a pouco.';
  return '😕 Não consegui falar com a IA: ' + ((e && e.message) || 'sem internet?');
}

/* ---------- ajustes ---------- */
function desenharAjustesIA(){
  const caixa = document.getElementById('camposIA');
  if(!caixa) return;
  const ia = dados.ia || {};
  document.getElementById('iaChave').value = ia.chave || '';
  const escolha = document.getElementById('iaModelo');
  escolha.innerHTML = Object.entries(MODELOS_IA)
    .map(([id, m]) => `<option value="${id}" ${ (MODELOS_IA[ia.modelo] ? ia.modelo : 'claude-opus-5') === id ? 'selected' : ''}>${m.nome}</option>`).join('');
  const usado = MODELOS_IA[ia.modelo] ? ia.modelo : 'claude-opus-5';
  document.getElementById('iaPreco').textContent = MODELOS_IA[usado].preco;
}

function ligarBotoesIA(){
  const bt = document.getElementById('btnSalvarIA');
  if(bt) bt.addEventListener('click', salvarIA);
  const escolha = document.getElementById('iaModelo');
  if(escolha) escolha.addEventListener('change', () => {
    document.getElementById('iaPreco').textContent = MODELOS_IA[escolha.value].preco;
  });
}
document.addEventListener('DOMContentLoaded', ligarBotoesIA);

function salvarIA(){
  const chave = document.getElementById('iaChave').value.trim();
  const modelo = document.getElementById('iaModelo').value;
  dados.ia = { chave, modelo };
  clienteIA = null;
  salvar(); desenharAjustesIA();
  toast(chave ? 'Ajudante ligado! 🤖' : 'Chave apagada deste aparelho', 4000);
}


/* =========================================================
   🌙 HISTORINHA DE DORMIR
   A IA inventa uma história com os nomes da própria família e
   o aparelho lê em voz alta.
   ========================================================= */
let lendoHistoria = false;

const nomesDaFamilia = () => TODOS.map(p => PESSOAS[p].curto).join(', ');

async function contarHistorinha(){
  if(!temChaveIA()){ toast('Falta a chave nos ⚙️ Ajustes 🔑', 5000); return; }
  if(lendoHistoria){ pararHistorinha(); return; }

  const caixa = document.getElementById('iaConversa');
  const bt = document.getElementById('iaHistoria');
  conversaIA.push({ role:'user', texto:'🌙 Me conta uma historinha de dormir' });
  desenharIA();
  caixa.insertAdjacentHTML('beforeend',
    `<div class="linha-msg eles" id="iaPensando"><div class="msg eles"><span class="txt">inventando a história<span class="escrevendo"><span>.</span><span>.</span><span>.</span></span></span></div></div>`);
  caixa.scrollTop = caixa.scrollHeight;
  if(bt) bt.textContent = '⏳';

  try{
    const historia = await pedirPraIA(
      `Inventa uma historinha de dormir curtinha (uns 5 parágrafos) com estes personagens, que são
       uma família de verdade: ${nomesDaFamilia()}. Uma aventura calma e gostosa, que termine com
       todo mundo dormindo em paz. Sem susto, sem nada triste. Escreve só a história, sem título
       e sem comentário no fim.`,
      COMO_SER + '\nAgora tu é um contador de histórias de dormir. Fala baixinho e devagar.',
      1400);
    conversaIA.push({ role:'assistant', texto: historia });
    falarAHistoria(historia);
  }catch(e){
    conversaIA.push({ role:'assistant', texto: explicarErroIA(e) });
  }
  const pensando = document.getElementById('iaPensando');
  if(pensando) pensando.remove();
  if(bt) bt.textContent = lendoHistoria ? '⏹' : '🌙';
  desenharIA();
}

/* Lê em pedaços: história grande de uma vez só faz o celular travar a fala. */
function falarAHistoria(texto){
  if(!('speechSynthesis' in window)){ toast('Este aparelho não sabe ler em voz alta 😕', 5000); return; }
  pararHistorinha();
  lendoHistoria = true;
  const bt = document.getElementById('iaHistoria');
  if(bt) bt.textContent = '⏹';

  const pedacos = texto.split(/(?<=[.!?])\s+/).filter(p => p.trim());
  pedacos.forEach((pedaco, i) => {
    const fala = new SpeechSynthesisUtterance(pedaco);
    fala.lang = 'pt-BR'; fala.rate = .85; fala.pitch = 1.02;   // devagarinho, é hora de dormir
    if(i === pedacos.length - 1) fala.onend = () => {
      lendoHistoria = false;
      const b = document.getElementById('iaHistoria'); if(b) b.textContent = '🌙';
    };
    speechSynthesis.speak(fala);
  });
  toast('Boa noite! 🌙 Toca no ⏹ pra parar', 5000);
}

function pararHistorinha(){
  if('speechSynthesis' in window) speechSynthesis.cancel();
  lendoHistoria = false;
  const bt = document.getElementById('iaHistoria');
  if(bt) bt.textContent = '🌙';
}

/* =========================================================
   ✍️ ME AJUDA A ESCREVER
   Pega o que está escrito na caixinha e o Ajudante arruma.
   Quem escreveu escolhe se usa ou não — nada é mandado sozinho.
   ========================================================= */
async function ajudaAEscrever(){
  const entrada = document.getElementById('entrada');
  if(!entrada) return;
  const meu = entrada.value.trim();
  if(!meu){ toast('Escreve alguma coisa primeiro 😊'); return; }
  if(!temChaveIA()){ toast('Precisa da chave do Ajudante nos ⚙️ Ajustes 🔑', 5000); return; }

  const bt = document.getElementById('btnEscrever');
  if(bt){ bt.textContent = '⏳'; bt.disabled = true; }
  const c = conversaPor(atual);

  try{
    const pronto = await pedirPraIA(
      `Arruma este recado que vai pra ${c ? c.nome : 'a família'} num aplicativo de recados.
       Conserta o português e deixa mais bonitinho, mas guarda o jeito de falar de quem escreveu
       e o tamanho parecido. Não inventa informação nova. Responde SÓ com o recado arrumado,
       sem aspas e sem explicação:\n\n${meu}`,
      'Você arruma recadinhos de família em português do Brasil. Responde só com o recado pronto.',
      400);
    mostrarSugestao(meu, pronto);
  }catch(e){
    toast(explicarErroIA(e), 6000);
  }
  if(bt){ bt.textContent = '✨'; bt.disabled = false; }
}

function mostrarSugestao(meu, pronto){
  const antigo = document.getElementById('telaSugestao');
  if(antigo) antigo.remove();
  const tela = document.createElement('div');
  tela.className = 'fundo-modal aberto'; tela.id = 'telaSugestao';
  tela.innerHTML = `
    <div class="modal">
      <h2>✍️ Que tal assim?</h2>
      <p class="sub">Tu escolhe: nada é mandado sem tu mandar.</p>
      <div class="sug-caixa antes"><b>O teu</b><span>${escapar(meu)}</span></div>
      <div class="sug-caixa depois"><b>Arrumado</b><span>${escapar(pronto)}</span></div>
      <div class="acoes">
        <button class="btn neutro" id="sugNao">Deixar o meu</button>
        <button class="btn principal" id="sugSim">Usar esse ✨</button>
      </div>
    </div>`;
  document.body.appendChild(tela);
  tela.addEventListener('click', e => { if(e.target.id === 'telaSugestao') tela.remove(); });
  document.getElementById('sugNao').addEventListener('click', () => tela.remove());
  document.getElementById('sugSim').addEventListener('click', () => {
    const entrada = document.getElementById('entrada');
    entrada.value = pronto; crescer(entrada); entrada.focus();
    tela.remove();
    toast('Pronto! Agora é só mandar 😊');
  });
}


/* =========================================================
   🗣️ TRADUZIR O RECADO
   Escreve em português e manda em outra língua.
   ========================================================= */
const LINGUAS = [
  { id:'inglês',   emoji:'🇺🇸', nome:'Inglês' },
  { id:'espanhol', emoji:'🇪🇸', nome:'Espanhol' },
  { id:'francês',  emoji:'🇫🇷', nome:'Francês' },
  { id:'italiano', emoji:'🇮🇹', nome:'Italiano' },
  { id:'alemão',   emoji:'🇩🇪', nome:'Alemão' },
  { id:'japonês',  emoji:'🇯🇵', nome:'Japonês' }
];

function abrirTradutor(){
  const entrada = document.getElementById('entrada');
  const meu = entrada ? entrada.value.trim() : '';
  if(!meu){ toast('Escreve o recado primeiro 😊'); return; }
  if(!temChaveIA()){ toast('Precisa da chave do Ajudante nos ⚙️ Ajustes 🔑', 5000); return; }
  if(document.getElementById('telaTraduzir')) return;

  const tela = document.createElement('div');
  tela.className = 'fundo-modal aberto'; tela.id = 'telaTraduzir';
  tela.innerHTML = `
    <div class="modal">
      <h2>🗣️ Mandar em outra língua</h2>
      <p class="sub">O Ajudante traduz e põe na caixinha. Tu que manda, como sempre.</p>
      <div class="sug-caixa antes"><b>O teu recado</b><span>${escapar(meu)}</span></div>
      <div class="tr-linguas">
        ${LINGUAS.map(l => `<button class="rapida" data-lingua="${l.id}">${l.emoji} ${l.nome}</button>`).join('')}
      </div>
      <div id="trSaida"></div>
      <div class="acoes"><button class="btn neutro" id="trFechar">Fechar</button></div>
    </div>`;
  document.body.appendChild(tela);
  tela.addEventListener('click', e => { if(e.target.id === 'telaTraduzir') tela.remove(); });
  document.getElementById('trFechar').addEventListener('click', () => tela.remove());
  tela.querySelectorAll('[data-lingua]').forEach(b =>
    b.addEventListener('click', () => traduzirPara(meu, b.dataset.lingua, b)));
}

async function traduzirPara(texto, lingua, botao){
  const saida = document.getElementById('trSaida');
  if(!saida) return;
  const antes = botao.textContent;
  botao.textContent = '⏳'; botao.disabled = true;
  saida.innerHTML = '<div class="sug-caixa depois"><b>Traduzindo</b><span>um instantinho...</span></div>';
  try{
    const pronto = await pedirPraIA(
      `Traduz este recado de família para ${lingua}. Responde SÓ com a tradução, sem aspas,
       sem explicação e sem o texto original:\n\n${texto}`,
      'Você traduz recadinhos de família. Responde só com a tradução, mantendo o jeito carinhoso e os emojis.',
      400);
    saida.innerHTML = `
      <div class="sug-caixa depois"><b>Em ${lingua}</b><span>${escapar(pronto)}</span></div>
      <div class="lig-botoes" style="margin:0"><button class="lig-bt ok" id="trUsar">Pôr na caixinha ✨</button></div>`;
    document.getElementById('trUsar').addEventListener('click', () => {
      const entrada = document.getElementById('entrada');
      entrada.value = pronto; crescer(entrada); entrada.focus();
      document.getElementById('telaTraduzir')?.remove();
      toast('Pronto! Agora é só mandar 😊');
    });
  }catch(e){
    saida.innerHTML = `<div class="sug-caixa antes"><b>Deu erro</b><span>${escapar(explicarErroIA(e))}</span></div>`;
  }
  botao.textContent = antes; botao.disabled = false;
}


/* =========================================================
   🤖 CONFIGURAR O AJUDANTE — passo a passo
   "Cole sua chave de API sk-ant-" não quer dizer nada pra
   quem nunca ouviu falar disso. Esta tela explica o que é,
   quanto custa e o que fazer, um passo de cada vez.
   ========================================================= */
function abrirPassoAPasso(){
  if(document.getElementById('telaConfigIA')) return;
  const tela = document.createElement('div');
  tela.className = 'tela-cheia ficha'; tela.id = 'telaConfigIA';
  tela.innerHTML = `
    <div class="w-topo" style="background:linear-gradient(135deg,#0f766e,#0891b2)">
      <button class="icone" id="ciFechar">✕</button>
      <div><b>🤖 Configurar o Ajudante</b><div class="w-sub">um passo de cada vez</div></div>
    </div>
    <div class="fi-meio">
      <div class="ci-passo">
        <div class="ci-num">1</div>
        <div><b>O que é o Ajudante?</b>
          <p>É uma inteligência artificial de verdade — a mesma que gente grande usa no trabalho.
          Ela conversa, explica a lição e inventa histórias.</p></div>
      </div>
      <div class="ci-passo">
        <div class="ci-num">2</div>
        <div><b>Por que precisa de uma chave?</b>
          <p>Ela cobra por uso, e a conta vai pra quem for dono da chave. Por isso o site não vem com
          nenhuma: cada família usa a sua. <b>Uma criança não deve fazer isso sozinha</b> — chama um adulto.</p></div>
      </div>
      <div class="ci-passo">
        <div class="ci-num">3</div>
        <div><b>Como pegar a chave (adulto)</b>
          <p>Entra em <b>console.anthropic.com</b>, faz uma conta, põe um crédito e clica em
          <b>API keys → Create key</b>. Copia o código que aparece (começa com <code>sk-ant-</code>)
          — ele só aparece uma vez.</p></div>
      </div>
      <div class="ci-passo">
        <div class="ci-num">4</div>
        <div><b>Cola aqui</b>
          <div class="campo-form" style="margin:8px 0 0">
            <input id="ciChave" type="password" placeholder="cola o código aqui" autocomplete="off" spellcheck="false">
            <small>🔐 Fica guardado só neste aparelho. Não vai pro site, nem pro backup, nem pros outros.</small>
          </div>
        </div>
      </div>
      <div class="ci-passo">
        <div class="ci-num">5</div>
        <div><b>Quanto custa?</b>
          <div class="campo-form" style="margin:8px 0 0">
            <select id="ciModelo"></select>
            <small class="ia-preco" id="ciPreco"></small>
            <small>Uma pergunta custa centavos. Quem manda muita pergunta, gasta mais.</small>
          </div>
        </div>
      </div>
      <div class="lig-botoes" style="margin:6px 0 0">
        <button class="lig-bt ok grande" id="ciSalvar">🤖 Ligar o Ajudante</button>
      </div>
    </div>`;
  document.body.appendChild(tela);
  document.getElementById('ciFechar').addEventListener('click', () => tela.remove());

  const escolha = document.getElementById('ciModelo');
  const preco = document.getElementById('ciPreco');
  escolha.innerHTML = Object.entries(MODELOS_IA)
    .map(([id, m]) => `<option value="${id}">${m.nome}</option>`).join('');
  const mostrarPreco = () => { preco.textContent = MODELOS_IA[escolha.value].preco; };
  escolha.addEventListener('change', mostrarPreco);
  mostrarPreco();

  document.getElementById('ciSalvar').addEventListener('click', () => {
    const chave = document.getElementById('ciChave').value.trim();
    if(!chave){ toast('Falta colar o código 😊'); return; }
    if(!/^sk-/.test(chave)){
      if(!confirm('Esse código não parece uma chave da Anthropic (elas começam com "sk-").\n\nGuardar assim mesmo?')) return;
    }
    dados.ia = { chave, modelo: escolha.value };
    clienteIA = null;
    salvar();
    if(typeof desenharAjustesIA === 'function') desenharAjustesIA();
    tela.remove();
    desenharIA();
    const campo = document.getElementById('iaEntrada');
    if(campo) campo.placeholder = 'Pergunta o que tu quiser...';
    toast('Ajudante ligado! 🤖 Manda uma pergunta', 5000);
  });
}
