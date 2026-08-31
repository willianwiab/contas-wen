/* =========================================================
   Fala, Família! — o chat da família, 100% offline.
   Tudo fica no localStorage do próprio aparelho: nenhum
   recadinho sai daqui, não tem servidor nem envio pra fora.
   ========================================================= */

const CHAVE = 'fala-familia:v2';

/* Cada pessoa da família tem um crachá. O aparelho sabe de quem ele é
   (dados.euSou), e a lista de conversas é montada do ponto de vista dele. */
const PESSOAS = {
  jojo: { nome:'Jojo',            curto:'Jojo',   emoji:'🧒', cor:'#7c3aed' },
  pai : { nome:'Papai Wilian',    curto:'Papai',  emoji:'👨', cor:'#0ea5e9' },
  mae : { nome:'Mamãe Grabiela',  curto:'Mamãe',  emoji:'👩', cor:'#ec4899' },
  irma: { nome:'Sofia',           curto:'Sofia',  emoji:'👧', cor:'#f59e0b' }
};
const TODOS = ['jojo','pai','mae','irma'];
let OUTROS = [];        // todo mundo menos quem é dono deste aparelho
let CONVERSAS = [];     // montada por montarConversas()

/* O nome da conversa entre duas pessoas é sempre igual nos dois aparelhos. */
const idDupla = (a, b) => 'd-' + [a, b].sort().join('-');
const souEu = p => p === (dados.euSou || 'jojo');
const nomeDe = p => souEu(p) ? 'Eu' : PESSOAS[p].curto;

function montarConversas(){
  const eu = dados.euSou || 'jojo';
  OUTROS = TODOS.filter(p => p !== eu);
  CONVERSAS = OUTROS.map(p => ({
    id: idDupla(eu, p), nome: PESSOAS[p].nome, emoji: PESSOAS[p].emoji, cor: PESSOAS[p].cor,
    pessoa: p, quem: [eu, p], sobre: 'toca aqui pra deixar um recado'
  }));
  CONVERSAS.push({ id:'familia', nome:'Família 💜', emoji:'🏠', cor:'#7c3aed', pessoa:null,
    quem: TODOS.slice(), sobre:'a conversa da família toda' });
  CONVERSAS.forEach(c => {
    if(!Array.isArray(dados.msgs[c.id])) dados.msgs[c.id] = [];
    if(dados.visto[c.id] == null) dados.visto[c.id] = 0;
  });
}

const RAPIDAS = [
  'Cheguei bem! 🏠','Tô com saudade 🥺','Pode me buscar? 🚗','Já almocei 🍽️',
  'Posso jogar um pouquinho? 🎮','Terminei a lição ✏️','Bom dia! ☀️',
  'Boa noite, durmam bem 🌙','Me liga quando puder 📞','Te amo! ❤️','Obrigado! 🙏'
];

const EMOJIS = ['😀','😄','😁','😂','🥹','🥰','😍','🤩','😎','🤗','🤔','🤫','😴','🤒','😭','😡','🥳','👻','🤖','👍','👎','👏','🙏','💪','🫶','❤️','💜','💛','💚','💙','✨','⭐','🔥','💯','🎉','🎈','🎁','🎮','⚽','🏀','🚲','🐶','🐱','🦖','🍕','🍔','🍟','🍫','🍦','🎂','🍎','☀️','🌙','🌈','⛈️','🚗','🏠','🏫','📞','✏️','📚','⏰','✅'];

const REACOES = ['❤️','👍','😂','🎉','🥺','🔥'];

/* ---------- estado ---------- */
let dados  = carregar();
let atual  = null;   // conversa aberta
let autor  = 'jojo'; // quem escreve neste aparelho (o dono dele)
let animar = -1;     // índice da mensagem que acabou de chegar
let buscaMsg = '';   // filtro dentro da conversa

function padrao(){
  return { nome:'', tema:'claro', som:true, euSou:null,
    msgs:{familia:[]}, visto:{familia:0},
    presenca:{jojo:0,pai:0,mae:0,irma:0},
    fotos:{}, tarefas:[], pontos:{jojo:0,pai:0,mae:0,irma:0}, nasc:{}, fixado:{}, agenda:[], bicho:{},
    papel:{}, letra:'normal', voz:false, vozContrario:false, antiPalavrao:true, avisos:false, lembretes:[] };
}
function carregar(){
  try{
    const bruto = localStorage.getItem(CHAVE);
    let d = bruto ? Object.assign(padrao(), JSON.parse(bruto)) : padrao();
    d.msgs  = Object.assign({familia:[]}, d.msgs);
    d.visto = Object.assign({familia:0}, d.visto);
    d.presenca = Object.assign({jojo:0,pai:0,mae:0,irma:0}, d.presenca);
    d.pontos   = Object.assign({jojo:0,pai:0,mae:0,irma:0}, d.pontos);
    d = passarPraFamilia(d);
    d.fotos    = d.fotos || {};
    d.nasc     = d.nasc || {};
    d.fixado   = d.fixado || {};
    if(!Array.isArray(d.agenda)) d.agenda = [];
    d.bicho    = d.bicho || {};
    d.papel    = d.papel || {};
    if(!Array.isArray(d.tarefas)) d.tarefas = [];
    if(!Array.isArray(d.lembretes)) d.lembretes = [];
    if(!bruto) d = migrarV1(d);
    return d;
  }catch(e){ return padrao(); }
}
/* O site nasceu só pro aparelho do Jojo: as conversas se chamavam "pai",
   "mae", "sofia" e quem escrevia era "eu". Agora cada aparelho tem dono e as
   conversas são duplas com nome igual nos dois lados — isto converte o antigo. */
function passarPraFamilia(d){
  if(d.formato === 3) return d;
  const eu = d.euSou || 'jojo';
  const de = p => (p === 'eu' ? eu : p);
  const antigas = { pai: idDupla(eu,'pai'), mae: idDupla(eu,'mae'), sofia: idDupla(eu,'irma') };

  Object.entries(antigas).forEach(([velho, novo]) => {
    if(!d.msgs[velho]) return;
    d.msgs[novo] = (d.msgs[novo] || []).concat(d.msgs[velho].map(m => ({ ...m, de: de(m.de) })));
    d.msgs[novo].sort((a,b) => a.ts - b.ts);
    delete d.msgs[velho];
    if(d.visto[velho] != null){ d.visto[novo] = d.visto[velho]; delete d.visto[velho]; }
    if(d.papel && d.papel[velho]){ d.papel[novo] = d.papel[velho]; delete d.papel[velho]; }
    if(d.fixado && d.fixado[velho]){ d.fixado[novo] = d.fixado[velho]; delete d.fixado[velho]; }
  });
  (d.msgs.familia || []).forEach(m => { m.de = de(m.de); });

  /* quem era "eu" nas outras listas vira a pessoa mesmo */
  ['presenca','pontos','fotos','nasc'].forEach(campo => {
    if(d[campo] && d[campo].eu !== undefined){ d[campo][eu] = d[campo].eu; delete d[campo].eu; }
  });
  (d.tarefas || []).forEach(t => { t.dono = de(t.dono); });
  (d.agenda  || []).forEach(g => { g.quem = de(g.quem); });
  d.formato = 3;
  return d;
}

/* Se existir conversa da versão antiga, aproveita as mensagens. */
function migrarV1(d){
  try{
    const velho = localStorage.getItem('fala-familia:v1');
    if(!velho) return d;
    const v = JSON.parse(velho);
    d.nome = v.nome || '';
    d.tema = v.tema || 'claro';
    ['pai','mae','sofia','familia'].forEach(k => {
      d.msgs[k] = (v.msgs?.[k] || []).map(m => ({ t:m.texto, de:m.de === 'eu' ? 'eu' : m.de, ts:m.ts }));
    });
    d.migrou = true;
  }catch(e){}
  return d;
}
let jaAvisouMemoria = false;
function salvar(){
  try{
    localStorage.setItem(CHAVE, JSON.stringify(dados));
    jaAvisouMemoria = false;
  }catch(e){
    /* memória do navegador cheia: sem avisar direito, os recados somem ao
       recarregar e parece que o site "não funciona". */
    toast('A memória deste aparelho encheu 😕', 6000);
    if(!jaAvisouMemoria && window.mostrarErroNaTela){
      jaAvisouMemoria = true;
      mostrarErroNaTela('a memória do navegador encheu (' + e.name + '). Faz um backup em ⚙️ Ajustes e apaga conversas antigas com o 🗑️.');
    }
  }
}

/* ---------- ajudantes ---------- */
const $ = s => document.querySelector(s);
const conversaPor = id => CONVERSAS.find(c => c.id === id);
const escapar = t => t.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const hora = ts => new Date(ts).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});
/* Mensagem de voz não tem texto: mostra um resuminho no lugar. */
const textoDe = m =>
  m.tipo === 'audio'   ? `🎤 recadinho de voz (${(m.dur||0).toFixed(1)}s)` :
  m.tipo === 'foto'    ? '📷 foto' :
  m.tipo === 'enquete' ? `📊 ${m.q}` :
  m.tipo === 'jogo'    ? '🕹️ jogo da velha' :
  m.tipo === 'capsula' ? '🕰️ cápsula do tempo' :
  m.tipo === 'lugar'   ? '📍 mandou onde está' :
  m.tipo === 'som'     ? '🎺 figurinha de som' :
  m.tipo === 'timer'   ? '⏱️ cronômetro' :
  m.tipo === 'sos'     ? '🆘 PEDIDO DE AJUDA' : (m.t || '');
const soEmoji = t => { const p = [...t.trim()]; return p.length > 0 && p.length <= 5 && /^(?:\p{Extended_Pictographic}|‍|️|\p{Emoji_Modifier}|\s)+$/u.test(t); };

function diaTexto(ts){
  const d = new Date(ts), hoje = new Date();
  const so = x => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const dif = (so(hoje) - so(d)) / 86400000;
  if(dif === 0) return 'HOJE';
  if(dif === 1) return 'ONTEM';
  if(dif < 7)   return d.toLocaleDateString('pt-BR',{weekday:'long'}).toUpperCase();
  return d.toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit',year:'numeric'});
}
function naoLidas(id){
  return (dados.msgs[id] || []).filter(m => !souEu(m.de) && m.ts > (dados.visto[id] || 0)).length;
}
/* ---------- quem está por aqui agora ---------- */
const TEMPO_ONLINE = 5 * 60 * 1000;   // 5 minutinhos

/* O último sinal de uma pessoa: quando ela escolheu o botão dela ou mandou recado. */
function ultimoSinal(p){
  let t = dados.presenca[p] || 0;
  Object.values(dados.msgs).forEach(lista =>
    lista.forEach(m => { if(m.de === p && m.ts > t) t = m.ts; }));
  return t;
}
function estaOnline(p){
  if(souEu(p)) return true;                         // tu está aqui, ora essa 😄
  return Date.now() - ultimoSinal(p) < TEMPO_ONLINE;
}
function marcarPresenca(p){ dados.presenca[p] = Date.now(); salvar(); }

function vistoTexto(p){
  const t = ultimoSinal(p);
  if(!t) return 'ainda não apareceu por aqui';
  const d = new Date(t), dia = diaTexto(t);
  if(dia === 'HOJE')  return `visto hoje às ${hora(t)}`;
  if(dia === 'ONTEM') return `visto ontem às ${hora(t)}`;
  return `visto em ${d.toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'})} às ${hora(t)}`;
}
function statusTexto(c){
  if(c.id === 'familia'){
    const on = OUTROS.filter(estaOnline).map(p => PESSOAS[p].curto);
    if(on.length > 1) return `${on.slice(0,-1).join(', ')} e ${on.at(-1)} estão por aqui 🟢`;
    if(on.length === 1) return `${on[0]} está por aqui 🟢`;
    return 'ninguém por aqui agora — deixa o recado 💜';
  }
  return estaOnline(c.pessoa) ? 'por aqui agora 🟢' : vistoTexto(c.pessoa);
}
function atualizarStatusTopo(){
  const el = document.querySelector('.conversa-topo .status');
  if(el && atual) el.textContent = statusTexto(conversaPor(atual));
  const pt = document.querySelector('.conversa-topo .ponto');
  if(pt && atual){
    const c = conversaPor(atual);
    pt.classList.toggle('on', c.pessoa ? estaOnline(c.pessoa) : OUTROS.some(estaOnline));
  }
}

/* ---------- internet do aparelho ---------- */
function verInternet(){
  const box = $('#net'), txt = $('#netTxt');
  if(!box) return;
  if(navigator.onLine){
    box.classList.remove('off');
    txt.textContent = 'Com internet';
  }else{
    box.classList.add('off');
    txt.textContent = 'Sem internet — funciona igual 😉';
  }
}

function toast(txt){
  const t = $('#toast'); t.textContent = txt; t.classList.add('on');
  clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('on'), 2200);
}

/* ---------- somzinho (sem arquivo, feito na hora) ---------- */
let audio;
function blim(subindo){
  if(!dados.som || sonecaLigada()) return;
  try{
    audio = audio || new (window.AudioContext || window.webkitAudioContext)();
    const o = audio.createOscillator(), g = audio.createGain(), t = audio.currentTime;
    o.type = 'sine';
    o.frequency.setValueAtTime(subindo ? 620 : 480, t);
    o.frequency.exponentialRampToValueAtTime(subindo ? 940 : 340, t + .12);
    g.gain.setValueAtTime(.0001, t);
    g.gain.exponentialRampToValueAtTime(.14, t + .02);
    g.gain.exponentialRampToValueAtTime(.0001, t + .22);
    o.connect(g); g.connect(audio.destination); o.start(t); o.stop(t + .24);
  }catch(e){}
}

/* ---------- lista de conversas ---------- */
function desenharContatos(){
  const filtro = $('#busca').value.trim().toLowerCase();
  $('#contatos').innerHTML = CONVERSAS
    .filter(c => !filtro || c.nome.toLowerCase().includes(filtro))
    .map(c => {
      const msgs = dados.msgs[c.id] || [];
      const ultima = msgs[msgs.length - 1];
      const nova = naoLidas(c.id);
      const autorTxt = ultima ? (souEu(ultima.de) ? 'Tu: ' : PESSOAS[ultima.de].curto + ': ') : '';
      const previa = ultima ? escapar(limpar(autorTxt + textoDe(ultima))).slice(0,64) : c.sobre;
      const on = c.pessoa ? estaOnline(c.pessoa) : OUTROS.some(estaOnline);
      return `
        <button class="contato ${atual === c.id ? 'ativo' : ''}" data-id="${c.id}">
          <div class="avatar" style="background:linear-gradient(135deg,${c.cor},${c.cor}bb)">${avatarConversa(c)}
            <span class="ponto ${on ? 'on' : ''}" title="${on ? 'por aqui agora' : 'não está por aqui'}"></span></div>
          <div class="contato-txt">
            <div class="contato-nome"><span>${c.nome}</span>
              <span class="contato-hora ${on ? 'online-txt' : ''}">${on ? 'online' : (ultima ? hora(ultima.ts) : '')}</span></div>
            <div class="contato-previa"><span style="flex:1;overflow:hidden;text-overflow:ellipsis">${previa}</span>
              ${nova ? `<span class="badge">${nova}</span>` : ''}</div>
          </div>
        </button>`;
    }).join('') || `<div style="padding:20px;text-align:center;color:var(--texto2);font-size:.88rem">Nada com esse nome 🤷</div>`;

  document.querySelectorAll('.contato').forEach(b => b.addEventListener('click', () => abrir(b.dataset.id)));
  desenharBicho();   // o bichinho acompanha o movimento da família
}

/* ---------- abrir / fechar ---------- */
function abrir(id){
  atual = id; autor = dados.euSou || 'jojo'; buscaMsg = ''; animar = -1;
  dados.visto[id] = Date.now(); salvar();
  atualizarBolinhaDoIcone();
  avisarQueVi(id);
  $('#app').classList.remove('no-chat');
  desenharContatos(); desenharConversa();
}
function fechar(){
  atual = null;
  $('#app').classList.add('no-chat');
  desenharContatos(); telaVazia();
}
/* Primeira vez no aparelho: de quem ele é? */
function perguntarQuemSou(){
  if(document.getElementById('telaQuemSou')) return;
  const tela = document.createElement('div');
  tela.className = 'tela-cheia quem-sou'; tela.id = 'telaQuemSou';
  tela.innerHTML = `
    <div class="qs-meio">
      <div class="balao-deco">💜</div>
      <h2>Quem é você neste aparelho?</h2>
      <p class="lig-txt">Cada um usa o site no seu próprio celular ou computador. Quem escolher aqui é quem
      manda os recados por este aparelho — dá pra trocar depois nos ⚙️ Ajustes.</p>
      <div class="qs-gente">
        ${TODOS.map(p => `
          <button class="qs-pessoa" data-quem="${p}">
            <span class="qs-av" style="background:linear-gradient(135deg,${PESSOAS[p].cor},${PESSOAS[p].cor}bb)">${PESSOAS[p].emoji}</span>
            ${PESSOAS[p].nome}
          </button>`).join('')}
      </div>
    </div>`;
  document.body.appendChild(tela);
  tela.querySelectorAll('[data-quem]').forEach(b => b.addEventListener('click', () => {
    souAgora(b.dataset.quem);
    tela.remove();
    ligarSozinho();          // o banco da família já vem no site: liga sem pedir nada
    toast(`Este aparelho é d${b.dataset.quem === 'irma' ? 'a' : 'o'} ${PESSOAS[b.dataset.quem].curto}! 💜`);
  }));
}

function desenharQuemSou(){
  const caixa = document.getElementById('listaQuemSou');
  if(!caixa) return;
  caixa.innerHTML = TODOS.map(p => `
    <button class="tm-op ${souEu(p) ? 'on' : ''}" data-souagora="${p}">${PESSOAS[p].emoji} ${PESSOAS[p].curto}</button>`).join('');
  caixa.querySelectorAll('[data-souagora]').forEach(b => b.addEventListener('click', () => {
    souAgora(b.dataset.souagora);
    desenharQuemSou(); desenharPerfis(); desenharNuvem();
    toast('Pronto! Este aparelho agora é d' + (b.dataset.souagora === 'irma' ? 'a ' : 'o ') + PESSOAS[b.dataset.souagora].curto);
  }));
}

function telaVazia(){
  $('#conversa').innerHTML = `
    <div class="vazio"><div>
      <div class="balao-deco">💬</div>
      <h2>Escolhe com quem falar</h2>
      <p>Deixa um recadinho pro <b>papai</b>, pra <b>mamãe</b>, pra <b>Sofia</b> ou pra família toda.
      Eles respondem aqui mesmo, neste aparelho. 💜</p>
      <button class="lig-bt ok" style="margin-top:16px" onclick="abrirAjuda()">❓ Ver tudo que dá pra fazer</button>
    </div></div>`;
}

/* ---------- conversa ---------- */
function desenharConversa(){
  const c = conversaPor(atual);
  $('#conversa').innerHTML = `
    <div class="conversa-topo" style="background:linear-gradient(135deg,${c.cor},${c.cor}cc)">
      <button class="voltar" id="btnVoltar" title="Voltar">←</button>
      <div class="avatar">${avatarConversa(c)}<span class="ponto"></span></div>
      <div class="txt-topo">
        <div class="nome">${c.nome}</div>
        <div class="status">${statusTexto(c)}</div>
      </div>
      <div class="icones">
        <button class="icone" id="btnWalkie" title="Walkie-talkie">📻</button>
        ${c.id !== 'familia' ? '<button class="icone" id="btnLigar" title="Ligar">📞</button>' : ''}
        ${c.id !== 'familia' ? '<button class="icone" id="btnVideo" title="Videochamada">📹</button>' : ''}
        <button class="icone" id="btnMenu" title="Mais coisas">⋯</button>
        <div class="menu-topo" id="menuTopo">
          <button id="btnBuscaMsg">🔍 Procurar na conversa</button>
          <button id="btnCopiar">📋 Copiar a conversa</button>
          <button id="btnPapel">🎨 Papel de parede</button>
          <button id="btnLimpar">🗑️ Apagar a conversa</button>
        </div>
      </div>
    </div>
    <div class="fixado" id="barraFixado"></div>
    <div class="barra-busca" id="barraBusca">
      <input id="inputBuscaMsg" placeholder="Procurar palavra na conversa..." autocomplete="off">
      <span id="contaBusca"></span>
    </div>
    <div class="mensagens" id="mensagens"></div>
    <div class="rapidas" id="rapidas"></div>
    <div class="paleta" id="paleta"></div>
    <div class="barra">
      <div class="campo">
        <button class="emoji-btn" id="btnMais" title="Foto, enquete e mais">➕</button>
        <button class="emoji-btn" id="btnEmoji" title="Emojis">😀</button>
        <textarea id="entrada" rows="1" placeholder="Escreve teu recadinho..."></textarea>
      </div>
      <button class="enviar mic" id="btnEnviar" title="Segura pra gravar">🎤</button>
    </div>
    <div class="resposta" id="barraResposta"></div>
    <div class="gravando" id="gravBar">
      <span class="pulso"></span><b id="gravTempo">0,0s</b>
      <span class="g-dica">gravando... toca no ⏹ pra mandar</span>
      <button id="gravCancelar" title="Jogar fora">🗑️</button>
    </div>`;

  $('#rapidas').innerHTML = RAPIDAS.map(t => `<button class="rapida">${t}</button>`).join('');
  $('#paleta').innerHTML  = EMOJIS.map(e => `<button data-e="${e}">${e}</button>`).join('');

  aplicarPapel();
  desenharMensagens();
  desenharFixado();
  respondendo = null; desenharRespondendo();

  const entrada = $('#entrada');
  $('#btnVoltar').addEventListener('click', fechar);
  $('#btnLimpar').addEventListener('click', limparConversa);
  $('#btnCopiar').addEventListener('click', copiarConversa);
  $('#btnPapel').addEventListener('click', abrirPapeis);
  $('#btnWalkie').addEventListener('click', abrirWalkie);
  $('#btnMenu').addEventListener('click', ev => {
    ev.stopPropagation();
    $('#menuTopo').classList.toggle('aberto');
  });
  $('#menuTopo').addEventListener('click', () => $('#menuTopo').classList.remove('aberto'));
  if($('#btnLigar')) $('#btnLigar').addEventListener('click', () => {
    if(podeChamar()) chamarDeUmToque(atual, false);   // toca no aparelho do outro
    else abrirLigacao();                              // sem banco: o jeito manual
  });
  if($('#btnVideo')) $('#btnVideo').addEventListener('click', () => {
    if(podeChamar()) chamarDeUmToque(atual, true);
    else abrirLigacao();
  });
  ligarBotaoDeEnviar(entrada);
  $('#btnEmoji').addEventListener('click', () => $('#paleta').classList.toggle('aberta'));
  $('#btnMais').addEventListener('click', ev => { ev.stopPropagation(); abrirMaisMenu(); });
  $('#btnBuscaMsg').addEventListener('click', () => {
    const b = $('#barraBusca'); b.classList.toggle('aberta');
    if(b.classList.contains('aberta')) $('#inputBuscaMsg').focus();
    else { buscaMsg = ''; $('#inputBuscaMsg').value = ''; desenharMensagens(); }
  });
  $('#inputBuscaMsg').addEventListener('input', e => { buscaMsg = e.target.value.trim(); desenharMensagens(); });

  document.querySelectorAll('.rapida').forEach(b =>
    b.addEventListener('click', () => { entrada.value = b.textContent.trim(); entrada.focus(); crescer(entrada); }));
  document.querySelectorAll('#paleta button').forEach(b =>
    b.addEventListener('click', () => { entrada.value += b.dataset.e; entrada.focus(); crescer(entrada); }));

  entrada.addEventListener('input', () => { crescer(entrada); modoBotao(); avisarQueEstouEscrevendo(); });
  entrada.addEventListener('keydown', ev => {
    if(ev.key === 'Enter' && !ev.shiftKey){ ev.preventDefault(); enviar(entrada.value); }
  });
  atualizarPlaceholder();
  if(window.innerWidth > 860) entrada.focus();
}

/* Diz de quem é este aparelho. Muda a lista inteira de conversas. */
function souAgora(p){
  dados.euSou = p; autor = p;
  salvar(); montarConversas();
  atual = null;
  document.getElementById('app').classList.add('no-chat');
  desenharContatos(); telaVazia(); saudacao();
  if(nuvemLigada()) ligarNuvem();
}

function atualizarPlaceholder(){
  const c = conversaPor(atual);
  $('#entrada').placeholder = c && c.pessoa
    ? `Escreve pro(a) ${PESSOAS[c.pessoa].curto}...`
    : 'Escreve pra família...';
}
/* O botão vira microfone quando não tem nada escrito. */
function modoBotao(){
  const bt = $('#btnEnviar'); if(!bt) return;
  if(gravando()) return;                       // no meio da gravação não mexe no botão
  const temTexto = $('#entrada').value.trim().length > 0;
  bt.textContent = temTexto ? '➤' : '🎤';
  bt.classList.toggle('mic', !temTexto);
  bt.title = temTexto ? 'Enviar' : 'Segura pra gravar';
}

function ligarBotaoDeEnviar(entrada){
  const bt = $('#btnEnviar'), bar = $('#gravBar'), tempo = $('#gravTempo');
  let relogio = null;

  const mostrarBarra = ligada => {
    bar.classList.toggle('on', ligada);
    bt.classList.toggle('rec', ligada);
    bt.textContent = ligada ? '⏹' : '🎤';
    if(!ligada) clearInterval(relogio);
  };

  bt.addEventListener('click', async () => {
    if(!bt.classList.contains('mic')){ enviar(entrada.value); return; }   // tem texto: manda
    await alternarGravacao({
      aoComecar(){
        mostrarBarra(true);
        relogio = setInterval(() => {
          tempo.textContent = segundosGravados().toFixed(1).replace('.', ',') + 's';
          if(segundosGravados() > 120) pararGravacao(false);              // 2 minutos é o limite
        }, 100);
      },
      aoTerminar(blob, seg){ mostrarBarra(false); mandarAudio(blob, seg); },
      aoFalhar(){ mostrarBarra(false); }
    });
  });

  /* botão de cancelar da barrinha de gravação */
  $('#gravCancelar').addEventListener('click', () => {
    if(!gravando()) return;
    mostrarBarra(false); pararGravacao(true); toast('Gravação cancelada 🗑️');
  });

  modoBotao();
}

function crescer(el){ el.style.height = 'auto'; el.style.height = Math.min(el.scrollHeight,120) + 'px'; }

/* ---------- mensagens ---------- */
function desenharMensagens(){
  const caixa = $('#mensagens');
  const todas = dados.msgs[atual] || [];
  const filtro = buscaMsg.toLowerCase();
  const msgs = filtro ? todas.filter(m => textoDe(m).toLowerCase().includes(filtro)) : todas;

  if($('#contaBusca')) $('#contaBusca').textContent = filtro ? `${msgs.length} achado(s)` : '';

  if(!msgs.length){
    caixa.innerHTML = `<div class="dia">${filtro ? 'Nada encontrado 🔍' : 'Nenhum recadinho ainda — começa aí! 😊'}</div>`;
    return;
  }

  let ultimoDia = '', ultimoDe = '';
  caixa.innerHTML = msgs.map((m, i) => {
    const real = todas.indexOf(m);
    const d = diaTexto(m.ts);
    let sep = '';
    if(d !== ultimoDia){ ultimoDia = d; ultimoDe = ''; sep = `<div class="dia">${d}</div>`; }

    const p = PESSOAS[m.de] || PESSOAS.jojo;
    const eu = souEu(m.de);
    const repetido = m.de === ultimoDe; ultimoDe = m.de;
    if(m.apagado){
      return `${sep}
        <div class="linha-msg ${souEu(m.de) ? 'eu' : 'eles'}" data-i="${real}">
          <div class="mini-av oculto"></div>
          <div class="msg ${souEu(m.de) ? 'eu' : 'eles'} apagada">
            <span class="txt">🗑️ Este recado foi apagado</span>
            <div class="rodape">${hora(m.ts)}</div>
          </div>
        </div>`;
    }
    const especial = m.tipo && m.tipo !== 'texto';
    const grande = !especial && soEmoji(m.t);
    const corpo = especial
      ? conteudoEspecial(m, real)
      : `<span class="txt">${filtro ? realce(limpar(m.t), buscaMsg) : escapar(limpar(m.t))}</span>`;
    const nome = (!eu && atual === 'familia' && !repetido)
      ? `<div class="quem" style="color:${p.cor}">${p.nome}</div>` : '';

    return `${sep}
      <div class="linha-msg ${eu ? 'eu' : 'eles'} ${m.r ? 'tem-reacao' : ''} ${real === animar ? 'nova' : ''}" data-i="${real}">
        <div class="mini-av ${repetido ? 'oculto' : ''}" style="background:linear-gradient(135deg,${p.cor},${p.cor}bb)">${avatarDe(m.de)}</div>
        <div class="msg ${eu ? 'eu' : 'eles'} ${grande ? 'emojao' : ''} ${m.tipo ? 'tipo-' + m.tipo : ''}">
          ${nome}${citacaoNoBalao(m)}${corpo}
          <div class="rodape">${m.editado ? '<i>editado</i> ' : ''}${hora(m.ts)}${
          eu ? ` <span class="tique ${foiVisto(atual, m) ? 'visto' : ''}" data-i="${real}">${m.uid ? (foiVisto(atual, m) ? '✓✓' : '✓') : ''}</span>` : ''}</div>
          ${m.r ? `<span class="reacao">${m.r}</span>` : ''}
        </div>
        <div class="ferramentas">
          <button data-acao="responder" data-i="${real}" title="Responder">↩</button>
          ${!m.tipo && m.de === autor ? `<button data-acao="editar" data-i="${real}" title="Arrumar o que escrevi">✏️</button>` : ''}
          ${dados.voz && podeFalar() ? `<button data-acao="falar" data-i="${real}" title="Ler em voz alta">🔊</button>` : ''}
          <button data-acao="reagir" data-i="${real}" title="Reagir">☺</button>
          <button data-acao="fixar" data-i="${real}" title="Fixar no topo">📌</button>
          <button data-acao="apagar" data-i="${real}" title="Apagar">✕</button>
        </div>
      </div>`;
  }).join('') + `<div class="reagir-bar" id="reagirBar">${REACOES.map(e => `<button data-e="${e}">${e}</button>`).join('')}</div>`;

  caixa.querySelectorAll('[data-acao="apagar"]').forEach(b =>
    b.addEventListener('click', () => apagarMensagem(+b.dataset.i)));
  caixa.querySelectorAll('[data-acao="editar"]').forEach(b =>
    b.addEventListener('click', () => editarMensagem(+b.dataset.i)));
  caixa.querySelectorAll('[data-acao="falar"]').forEach(b =>
    b.addEventListener('click', () => lerEmVozAlta(+b.dataset.i)));
  caixa.querySelectorAll('[data-acao="responder"]').forEach(b =>
    b.addEventListener('click', () => responderMsg(+b.dataset.i)));
  caixa.querySelectorAll('[data-somtocar]').forEach(b =>
    b.addEventListener('click', () => {
      const m = dados.msgs[atual][+b.dataset.somtocar];
      if(m) tocarSom(m.som);
    }));
  caixa.querySelectorAll('[data-acao="fixar"]').forEach(b =>
    b.addEventListener('click', () => fixarRecado(+b.dataset.i)));
  caixa.querySelectorAll('[data-acao="reagir"]').forEach(b =>
    b.addEventListener('click', () => abrirReacoes(+b.dataset.i)));
  caixa.querySelectorAll('.msg').forEach(el =>
    el.addEventListener('dblclick', () => reagir(+el.parentElement.dataset.i, '❤️')));
  caixa.querySelectorAll('[data-jogo]').forEach(b =>
    b.addEventListener('click', () => {
      const [i, casa] = b.dataset.jogo.split(':').map(Number);
      jogar(i, casa);
    }));
  caixa.querySelectorAll('[data-play]').forEach(b =>
    b.addEventListener('click', () => tocarAudio(+b.dataset.play)));
  caixa.querySelectorAll('[data-efeito]').forEach(b =>
    b.addEventListener('click', () => abrirEfeitos(+b.dataset.efeito)));
  caixa.querySelectorAll('#reagirBar button').forEach(b =>
    b.addEventListener('click', () => reagir(reagindo, b.dataset.e)));

  ligarExtras();
  animar = -1;
  if(!filtro) caixa.scrollTop = caixa.scrollHeight;
}

function realce(txt, termo){
  const t = escapar(txt), alvo = escapar(termo);
  if(!alvo) return t;
  const re = new RegExp('(' + alvo.replace(/[.*+?^${}()|[\]\\]/g,'\\$&') + ')','gi');
  return t.replace(re, '<mark>$1</mark>');
}

let reagindo = -1;
function abrirReacoes(i){
  reagindo = i;
  const bar = $('#reagirBar');
  bar.classList.add('aberta');
  bar.scrollIntoView({block:'nearest'});
}
function reagir(i, emoji){
  const m = dados.msgs[atual][i];
  if(!m) return;
  m.r = (m.r === emoji) ? null : emoji;
  salvar(); desenharMensagens();
}

/* ---------- ações ---------- */
function enviar(texto){
  texto = (texto || '').trim();
  if(!texto) return;
  const nova = { t:texto, de:autor, ts:Date.now() };
  if(respondendo){ nova.resp = respondendo; pararDeResponder(); }
  dados.msgs[atual].push(nova);
  dados.visto[atual] = Date.now();
  dados.presenca[autor] = Date.now();
  animar = dados.msgs[atual].length - 1;
  salvar(); blim(true);
  mandarPraNuvem(atual, nova);
  if(temFesta(texto)) confete();
  desenharBicho();

  const entrada = $('#entrada');
  entrada.value = ''; crescer(entrada);
  $('#paleta').classList.remove('aberta');
  pareiDeEscrever();
  buscaMsg = ''; const ib = $('#inputBuscaMsg'); if(ib) ib.value = '';
  desenharMensagens(); desenharContatos(); atualizarStatusTopo(); atualizarBolinhaDoIcone();
  modoBotao(); entrada.focus();
}

function editarMensagem(i){
  const m = dados.msgs[atual][i];
  if(!m || m.tipo) return;
  const novo = (prompt('Arruma o recadinho:', m.t) || '').trim();
  if(!novo || novo === m.t) return;
  m.t = novo; m.editado = true;
  salvar(); desenharMensagens(); desenharContatos();
  toast('Recadinho arrumado ✏️');
}

async function apagarMensagem(i){
  const m = dados.msgs[atual][i];
  if(!m) return;
  const podeTirarDosOutros = m.uid && souEu(m.de) && podeSinalizar();
  const pergunta = podeTirarDosOutros
    ? 'Apagar este recadinho?\n\nOK = apaga pra TODOS (some do aparelho dos outros também)\nCancelar = não apaga'
    : 'Apagar este recadinho?';
  if(!confirm(pergunta)) return;

  if(podeTirarDosOutros) await apagarPraTodos(atual, m);
  if((m.tipo === 'audio' || m.tipo === 'foto' || m.tipo === 'video') && m.id) apagarAudio(m.id);
  dados.msgs[atual].splice(i,1);
  salvar(); desenharMensagens(); desenharContatos();
  toast(podeTirarDosOutros ? 'Apagado pra todos 🗑️' : 'Recadinho apagado 🗑️');
}

function limparConversa(){
  if(!confirm('Apagar TODOS os recadinhos desta conversa?\nNão dá pra desfazer!')) return;
  dados.msgs[atual].forEach(m => { if((m.tipo === 'audio' || m.tipo === 'foto') && m.id) apagarAudio(m.id); });
  dados.msgs[atual] = [];
  salvar(); desenharMensagens(); desenharContatos();
  toast('Conversa limpa ✨');
}

function copiarConversa(){
  const msgs = dados.msgs[atual] || [];
  if(!msgs.length){ toast('Não tem nada pra copiar 🤷'); return; }
  const txt = msgs.map(m => `[${new Date(m.ts).toLocaleString('pt-BR')}] ${PESSOAS[m.de].curto}: ${textoDe(m)}`).join('\n');
  navigator.clipboard?.writeText(txt)
    .then(() => toast('Conversa copiada! 📋'))
    .catch(() => toast('Teu navegador não deixou copiar 😕'));
}

/* ---------- ajustes ---------- */
function abrirConfig(){
  $('#cfgNome').value = dados.nome;
  $('#cfgAvisos').classList.toggle('on', avisoLigado());
  desenharQuemSou(); desenharLembretes(); desenharPerfis(); desenharAniversarios(); desenharTranca(); desenharSoneca(); desenharNuvem();
  $('#cfgVoz').classList.toggle('on', !!dados.voz);
  $('#cfgVozContrario').classList.toggle('on', !!dados.vozContrario);
  $('#cfgPalavrao').classList.toggle('on', dados.antiPalavrao !== false);
  document.querySelectorAll('#tamanhos .tm-op').forEach(b =>
    b.classList.toggle('on', b.dataset.letra === (dados.letra || 'normal')));
  $('#cfgSom').classList.toggle('on', !!dados.som);
  $('#cfgTema').classList.toggle('on', dados.tema === 'escuro');
  $('#modalConfig').classList.add('aberto');
}
function fecharConfig(){ $('#modalConfig').classList.remove('aberto'); }
function salvarConfig(){
  dados.nome = $('#cfgNome').value.trim();
  dados.som  = $('#cfgSom').classList.contains('on');
  dados.avisos = $('#cfgAvisos').classList.contains('on');
  dados.tema = $('#cfgTema').classList.contains('on') ? 'escuro' : 'claro';
  salvar(); aplicarTema(); saudacao(); fecharConfig();
  if(atual) atualizarPlaceholder();
  toast('Salvo! ✅');
}
function saudacao(){
  const h = new Date().getHours();
  const parte = h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite';
  const quem = dados.nome || (dados.euSou ? PESSOAS[dados.euSou].curto : '');
  $('#ola').textContent = quem ? `${parte}, ${quem}! 👋` : `${parte}! 👋`;
}
function aplicarLetra(){
  document.documentElement.dataset.letra = dados.letra || 'normal';
}

function aplicarTema(){
  document.documentElement.dataset.tema = dados.tema;
  $('#btnTema').textContent = dados.tema === 'escuro' ? '☀️' : '🌙';
  document.querySelector('meta[name="theme-color"]')
    .setAttribute('content', dados.tema === 'escuro' ? '#171331' : '#7c3aed');
}

/* ---------- eventos gerais ---------- */
$('#btnConfig').addEventListener('click', abrirConfig);
$('#cfgFechar').addEventListener('click', fecharConfig);
$('#cfgSalvar').addEventListener('click', salvarConfig);
$('#cfgSom').addEventListener('click',  e => e.currentTarget.classList.toggle('on'));
$('#cfgAvisos').addEventListener('click', async e => {
  const bt = e.currentTarget;
  if(bt.classList.contains('on')){ bt.classList.remove('on'); dados.avisos = false; salvar(); return; }
  if(await pedirAvisos()) bt.classList.add('on');
});
$('#addLembrete').addEventListener('click', novoLembrete);
$('#btnTarefas').addEventListener('click', abrirTarefas);
$('#btnAlbum').addEventListener('click', abrirAlbum);
$('#btnAgenda').addEventListener('click', abrirAgenda);
$('#cardBicho').addEventListener('click', abrirBicho);
$('#btnAjuda').addEventListener('click', abrirAjuda);
$('#btnTranca').addEventListener('click', mudarTranca);
/* Joga fora a cópia velha guardada e baixa o site de novo (sem apagar recadinho). */
$('#btnSortear').addEventListener('click', sortearSala);
document.querySelectorAll('.modo-op').forEach(b => b.addEventListener('click', () => {
  document.querySelectorAll('.modo-op').forEach(o => o.classList.toggle('on', o === b));
  $('#campoUrl').classList.toggle('escondido', b.dataset.modo !== 'firebase');
  $('#avisoPublico').classList.toggle('escondido', b.dataset.modo !== 'publico');
}));
$('#btnLigarNuvem').addEventListener('click', salvarNuvem);
$('#btnTestarNuvem').addEventListener('click', () => modoPublico() ? testarPublico() : testarFirebase());
$('#btnTestarMic').addEventListener('click', testarMicrofone);
$('#btnDiagnostico').addEventListener('click', copiarDiagnostico);
$('#chipNuvem').addEventListener('click', abrirPainelNuvem);   // toca na bolinha e vê tudo
$('#btnTrocarServidor').addEventListener('click', () => { trocarServidor(); toast('Trocando de servidor... 🔁'); });
$('#btnDesligarNuvem').addEventListener('click', desligarDeVez);
$('#btnConvite').addEventListener('click', () => {
  navigator.clipboard?.writeText(fazerConvite())
    .then(() => toast('Convite copiado! Cola no outro aparelho 📋'))
    .catch(() => prompt('Copia este convite:', fazerConvite()));
});
$('#btnColarConvite').addEventListener('click', () => {
  const t = prompt('Cola aqui o convite que veio do outro aparelho:');
  if(t == null) return;
  toast(usarConvite(t) ? 'Pronto! Este aparelho entrou na família ☁️' : 'Esse convite não parece certo 🤔');
  desenharNuvem();
});
$('#btnAtualizar').addEventListener('click', async () => {
  if(!confirm('Baixar o site de novo?\n\nOs recadinhos NÃO são apagados.')) return;
  toast('Limpando a cópia velha... 🔄', 4000);
  try{
    const regs = await navigator.serviceWorker?.getRegistrations?.() || [];
    await Promise.all(regs.map(r => r.unregister()));
    const nomes = await caches.keys();
    await Promise.all(nomes.map(n => caches.delete(n)));
  }catch(e){}
  setTimeout(() => location.reload(), 700);
});
$('#cfgVozContrario').addEventListener('click', e => {
  e.currentTarget.classList.toggle('on');
  dados.vozContrario = e.currentTarget.classList.contains('on'); salvar();
  toast(dados.vozContrario ? 'Agora ele lê ao contrário 🔁' : 'Voltou a ler normal 🗣️');
});
$('#cfgPalavrao').addEventListener('click', e => {
  e.currentTarget.classList.toggle('on');
  dados.antiPalavrao = e.currentTarget.classList.contains('on'); salvar();
  if(atual) desenharMensagens();
  desenharContatos();
  toast(dados.antiPalavrao ? 'Anti-palavrão ligado 🤬' : 'Anti-palavrão desligado');
});
$('#cfgVoz').addEventListener('click', e => {
  e.currentTarget.classList.toggle('on');
  dados.voz = e.currentTarget.classList.contains('on'); salvar();
  if(atual) desenharMensagens();
});
document.querySelectorAll('#tamanhos .tm-op').forEach(b => b.addEventListener('click', () => {
  dados.letra = b.dataset.letra; salvar(); aplicarLetra();
  document.querySelectorAll('#tamanhos .tm-op').forEach(o => o.classList.toggle('on', o === b));
}));
document.querySelectorAll('[data-soneca]').forEach(b => b.addEventListener('click', () => {
  const v = b.dataset.soneca;
  porSoneca(v === 'manha' ? 'manha' : +v);
}));
$('#btnSalvarTudo').addEventListener('click', exportarTudo);
$('#btnAbrirTudo').addEventListener('click', importarTudo);
$('#cfgTema').addEventListener('click', e => e.currentTarget.classList.toggle('on'));
$('#modalConfig').addEventListener('click', e => { if(e.target.id === 'modalConfig') fecharConfig(); });
$('#busca').addEventListener('input', desenharContatos);
$('#btnTema').addEventListener('click', () => {
  dados.tema = dados.tema === 'escuro' ? 'claro' : 'escuro';
  salvar(); aplicarTema();
});
document.addEventListener('keydown', e => {
  if(e.key === 'Escape'){ fecharConfig(); const b = $('#reagirBar'); if(b) b.classList.remove('aberta'); }
});
document.addEventListener('click', e => {
  const mt = $('#menuTopo');
  if(mt && mt.classList.contains('aberto') && !e.target.closest('#btnMenu')) mt.classList.remove('aberto');
  const b = $('#reagirBar');
  if(b && b.classList.contains('aberta') && !e.target.closest('#reagirBar') && !e.target.closest('[data-acao="reagir"]'))
    b.classList.remove('aberta');
});

window.addEventListener('online',  verInternet);
window.addEventListener('offline', verInternet);
/* De meio em meio minuto confere quem ainda está por aqui. */
setInterval(() => { desenharContatos(); atualizarStatusTopo(); }, 30000);

/* ---------- começo ---------- */
if(!localStorage.getItem(CHAVE) && !localStorage.getItem('fala-familia:v1')
   && window.matchMedia('(prefers-color-scheme: dark)').matches) dados.tema = 'escuro';
if(dados.migrou){ delete dados.migrou; salvar(); }   // guarda o que veio da versão antiga
autor = dados.euSou || 'jojo';
montarConversas();
aplicarTema(); aplicarLetra(); saudacao(); verInternet(); desenharContatos(); telaVazia();
carregarPerfis().then(() => { desenharContatos(); if(atual) desenharConversa(); });
verLembretes(true); atualizarBolinhaDoIcone(); mostrarAniversario(); mostrarProximo();
verCapsulas(); verAgenda(); desenharBicho(); pedirTranca();
if(nuvemLigada()) ligarNuvem();
if(!dados.euSou){
  perguntarQuemSou();                         // primeira vez: de quem é este aparelho?
}else{
  ligarSozinho();                             // já sabe quem é: liga o envio sozinho
  if(window.innerWidth > 860) abrir('familia');
}

/* Deixa o site funcionar sem internet e dá pra instalar na tela do celular. */
if('serviceWorker' in navigator && location.protocol.startsWith('http')){
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}
