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
  document.getElementById('iaFechar').addEventListener('click', () => tela.remove());
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
        <h3>Falta a chave</h3>
        <p>O Ajudante é uma <b>IA de verdade</b>, e IA de verdade custa dinheiro de quem usa.
        Por isso a chave não vem no site: quem quiser usar cola a <b>sua própria chave</b> em
        <b>⚙️ Ajustes → 🤖 Ajudante</b>. Ela fica guardada só neste aparelho.</p>
      </div>`;
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
