/* =========================================================
   socorro.js — tudo que é emergência.

   🆘 tipos de ajuda · 🔔 alarme que insiste · 🎙️ grava o lugar
   · ☎️ já liga · ⏱️ "se eu não avisar, avisa por mim"
   · 🔋 bateria acabando · 📍 me acompanha · 🚨 sirene
   · ☎️ 190/192/193 · 🩺 ficha de emergência

   Regra desta tela inteira: nada aqui pode depender de dar
   tudo certo. GPS que não responde, microfone negado, banco
   fora do ar — o pedido de ajuda SAI do mesmo jeito, com o
   que der. Chegar sem o lugar é infinitamente melhor do que
   não chegar.
   ========================================================= */

const TIPOS_DE_AJUDA = [
  { id:'busca',    emoji:'🚗', nome:'Me busca AGORA',  cor:'#dc2626', urgente:true,
    txt:'Me busca agora, por favor!' },
  { id:'medo',     emoji:'😰', nome:'Tô com medo',     cor:'#b45309', urgente:true,
    txt:'Tô com medo!' },
  { id:'machucado',emoji:'🤕', nome:'Tô machucado',    cor:'#be123c', urgente:true,
    txt:'Tô machucado!' },
  { id:'perdido',  emoji:'🧭', nome:'Tô perdido',      cor:'#7c3aed', urgente:false,
    txt:'Tô perdido, não sei voltar' }
];
const tipoDeAjuda = id => TIPOS_DE_AJUDA.find(t => t.id === id) || TIPOS_DE_AJUDA[0];

/* ---------- a tela de escolher ---------- */
function pedirAjuda(){
  if(document.getElementById('telaPedirAjuda')) return;
  const tela = document.createElement('div');
  tela.className = 'tela-cheia socorro'; tela.id = 'telaPedirAjuda';
  tela.innerHTML = `
    <div class="w-topo" style="background:linear-gradient(135deg,#b91c1c,#7f1d1d)">
      <button class="icone" id="paFechar">✕</button>
      <div><b>🆘 Preciso de ajuda</b><div class="w-sub">toca no que está acontecendo</div></div>
    </div>
    <div class="pa-meio">
      <div class="pa-tipos">
        ${TIPOS_DE_AJUDA.map(t => `
          <button class="pa-tipo" data-ajuda="${t.id}" style="--cor:${t.cor}">
            <span>${t.emoji}</span><b>${t.nome}</b>
          </button>`).join('')}
      </div>
      <div class="pa-extras">
        <button class="pa-extra" id="paSirene">🚨 Sirene<small>o celular grita alto</small></button>
        <button class="pa-extra" id="paNumeros">☎️ 190 · 192 · 193<small>polícia, SAMU, bombeiros</small></button>
        <button class="pa-extra" id="paFicha">🩺 Minha ficha<small>alergia, remédio, tipo de sangue</small></button>
        <button class="pa-extra" id="paTimer">⏱️ Se eu não avisar<small>avisa a família por mim</small></button>
        <button class="pa-extra" id="paLanterna">🔦 Lanterna SOS<small>a tela pisca em código morse</small></button>
        <button class="pa-extra" id="paCasa">🧭 Como volto pra casa<small>o caminho até em casa</small></button>
        <button class="pa-extra" id="paDeNovo">📢 Mandar de novo<small>se ninguém viu o teu pedido</small></button>
        <button class="pa-extra" id="paBem">🤕 Já tô bem<small>encerra o alerta e acalma todos</small></button>
      </div>
    </div>`;
  document.body.appendChild(tela);
  document.getElementById('paFechar').addEventListener('click', () => tela.remove());
  document.getElementById('paSirene').addEventListener('click', tocarSirene);
  document.getElementById('paNumeros').addEventListener('click', abrirNumerosDeEmergencia);
  /* sem a seta, o addEventListener manda o clique como primeiro
     argumento e a ficha abria no modo "só ver", sem deixar escrever */
  document.getElementById('paFicha').addEventListener('click', () => abrirFicha(false));
  document.getElementById('paTimer').addEventListener('click', () => { tela.remove(); abrirTimerDeSeguranca(); });
  document.getElementById('paLanterna').addEventListener('click', () => { tela.remove(); lanternaSOS(); });
  document.getElementById('paCasa').addEventListener('click', () => { tela.remove(); comoVoltoPraCasa(); });
  document.getElementById('paDeNovo').addEventListener('click', () => { tela.remove(); mandarDeNovo(); });
  document.getElementById('paBem').addEventListener('click', () => { tela.remove(); jaEstouBem(); });
  tela.querySelectorAll('[data-ajuda]').forEach(b =>
    b.addEventListener('click', () => { tela.remove(); mandarPedidoDeAjuda(b.dataset.ajuda); }));
}

/* ---------- mandar de verdade ---------- */
async function mandarPedidoDeAjuda(qual, semTela){
  const tipo = tipoDeAjuda(qual);
  const aviso = semTela ? null : mostrarMandando(tipo);

  /* 1) o pedido sai PRIMEIRO, com o que já se sabe. O lugar e o áudio
        chegam depois, numa segunda versão do mesmo recado. */
  const sos = {
    tipo:'sos', qual: tipo.id, emoji: tipo.emoji, t: tipo.txt, urgente: tipo.urgente,
    de: dados.euSou || autor, ts: Date.now(), v: 0
  };
  dados.msgs.familia.push(sos);
  dados.visto.familia = Date.now();
  salvar();
  mandarPraNuvem('familia', sos);
  desenharContatos();
  if(atual === 'familia') desenharMensagens();
  if(aviso) aviso.passo('mandado', 'Pedido enviado! 🆘');

  /* 2) o lugar */
  const lugar = await ondeEstou(8000);
  if(lugar){
    sos.lugar = lugar; salvar(); atualizarNaNuvem('familia', sos);
    if(atual === 'familia') desenharMensagens();
    if(aviso) aviso.passo('lugar', 'Mandei onde tu está 📍');
  }else if(aviso) aviso.passo('lugar', 'Sem o lugar (o GPS não respondeu)', true);

  /* 3) o som do lugar começa a ser gravado AGORA, mas ninguém espera por
        ele: são 30 segundos, e ligar pra alguém só depois disso seria
        tarde demais pra quem está com medo. */
  if(aviso) aviso.passo('som', 'Gravando o que está acontecendo... 🎙️');
  gravarOAmbiente(sos).then(gravou => {
    if(aviso) aviso.passo('som', gravou ? 'Mandei o som do lugar 🎙️' : 'Sem o som (o microfone não deixou)', !gravou);
  });

  /* 4) e a ligação sai na mesma hora */
  if(aviso) aviso.passo('ligar', 'Ligando pra alguém da família... ☎️');
  const ligou = ligarPraQuemPuder();
  if(aviso) aviso.passo('ligar', ligou ? 'Chamando ' + ligou + ' ☎️' : 'Ninguém da família está online agora', !ligou);
  if(aviso) aviso.pronto();
}

/* A tela que mostra o que já foi feito — quem está com medo precisa
   VER que o pedido saiu, não ficar olhando pra um botão parado. */
function mostrarMandando(tipo){
  const tela = document.createElement('div');
  tela.className = 'tela-cheia socorro mandando'; tela.id = 'telaMandandoSos';
  tela.style.background = `linear-gradient(160deg,${tipo.cor},#450a0a)`;
  tela.innerHTML = `
    <div class="qs-meio">
      <div class="sos-sino">${tipo.emoji}</div>
      <h2>${tipo.nome}</h2>
      <div class="pa-passos" id="paPassos">
        <div class="pa-passo" data-p="mandado">⏳ Mandando pra família...</div>
        <div class="pa-passo" data-p="lugar">⏳ Vendo onde tu está...</div>
        <div class="pa-passo" data-p="som">⏳ Vou gravar o som do lugar...</div>
        <div class="pa-passo" data-p="ligar">⏳ Depois eu ligo pra alguém...</div>
      </div>
      <div class="lig-botoes"><button class="lig-bt desligar grande escondido" id="paOk">Fechar</button></div>
    </div>`;
  document.body.appendChild(tela);
  document.getElementById('paOk').addEventListener('click', () => tela.remove());
  return {
    passo(qual, texto, ruim){
      const el = tela.querySelector(`[data-p="${qual}"]`);
      if(el){ el.textContent = (ruim ? '⚠️ ' : '✅ ') + texto; el.classList.add(ruim ? 'ruim' : 'feito'); }
    },
    pronto(){
      const bt = document.getElementById('paOk');
      if(bt) bt.classList.remove('escondido');
    }
  };
}

/* ---------- 🎙️ grava o que está acontecendo ---------- */
const SEGUNDOS_DO_AMBIENTE = 30;

async function gravarOAmbiente(sos){
  if(typeof comecarGravacao !== 'function') return false;
  return new Promise(resolve => {
    let acabou = false;
    const terminar = ok => { if(!acabou){ acabou = true; resolve(ok); } };

    comecarGravacao(async (blob, segundos) => {
      try{
        const id = 's' + Date.now() + Math.random().toString(36).slice(2,6);
        const guardou = await guardarAudio(id, blob);
        if(!guardou){ terminar(false); return; }
        const som = { tipo:'audio', id, dur: Math.round(segundos*10)/10, doSocorro:true,
                      de: sos.de, ts: Date.now() };
        dados.msgs.familia.push(som);
        salvar(); mandarPraNuvem('familia', som);
        desenharContatos();
        if(atual === 'familia') desenharMensagens();
        terminar(true);
      }catch(e){ terminar(false); }
    }).then(comecou => {
      if(!comecou){ terminar(false); return; }
      setTimeout(() => { if(gravando()) pararGravacao(false); }, SEGUNDOS_DO_AMBIENTE * 1000);
      setTimeout(() => terminar(false), (SEGUNDOS_DO_AMBIENTE + 8) * 1000);   // não trava se algo der errado
    }).catch(() => terminar(false));
  });
}

/* ---------- ☎️ já começa a ligação ---------- */
function ligarPraQuemPuder(){
  if(typeof podeChamar !== 'function' || !podeChamar()) return null;
  const eu = dados.euSou || 'jojo';
  /* quem mexeu no site faz menos tempo tem mais chance de atender */
  const ordem = TODOS.filter(p => p !== eu)
    .sort((a,b) => (dados.presenca[b] || 0) - (dados.presenca[a] || 0));
  for(const p of ordem){
    const c = CONVERSAS.find(x => x.pessoa === p);
    if(!c) continue;
    try{ chamarDeUmToque(c.id, false); }catch(e){ continue; }
    return PESSOAS[p].curto;
  }
  return null;
}

/* ---------- 🔔 quando chega: alarme que INSISTE ---------- */
let insistindo = null;

function chegouPedidoDeAjuda(msg){
  if(document.getElementById('telaSos')) return;   // já está tocando
  const p = PESSOAS[msg.de] || PESSOAS.jojo;
  const tipo = tipoDeAjuda(msg.qual);
  const link = msg.lugar
    ? `https://www.openstreetmap.org/?mlat=${msg.lugar.lat}&mlon=${msg.lugar.lon}#map=17/${msg.lugar.lat}/${msg.lugar.lon}` : '';

  const tela = document.createElement('div');
  tela.className = 'tela-cheia sos-tela'; tela.id = 'telaSos';
  tela.style.background = `linear-gradient(160deg,${tipo.cor},#450a0a)`;
  tela.innerHTML = `
    <div class="sos-meio">
      <div class="sos-sino">${msg.emoji || '🆘'}</div>
      <h2>${p.nome}: ${escapar(msg.t || 'precisa de ajuda!')}</h2>
      <p class="lig-txt">${hora(msg.ts)}${msg.lugar ? '' : ' — o lugar ainda não chegou'}</p>
      <div class="lig-botoes col">
        ${link ? `<a class="lig-bt ok grande" href="${link}" target="_blank" rel="noopener">🗺️ Ver onde está</a>` : ''}
        <button class="lig-bt grande" id="sosIndo">🏃 Estou indo!</button>
        <button class="lig-bt desligar" id="sosFechar">Silenciar</button>
      </div>
      <p class="sem-lembrete sos-aviso">O alarme só para quando alguém disser que está indo.</p>
    </div>`;
  document.body.appendChild(tela);

  /* O alarme antigo tocava 20 segundos e desistia — quem estava com o
     celular no bolso simplesmente não via. Agora ele insiste até alguém
     responder, ou por 5 minutos. */
  insistirNoAlarme(msg, p);

  document.getElementById('sosFechar').addEventListener('click', () => {
    if(!confirm('Silenciar o alarme?\n\n' + p.curto + ' continua precisando de ajuda.')) return;
    pararDeInsistir(); tela.remove();
  });
  document.getElementById('sosIndo').addEventListener('click', () => {
    pararDeInsistir(); tela.remove();
    const resposta = { t:'🏃 Estou indo te ajudar!', de: dados.euSou, ts: Date.now() };
    const conversa = (CONVERSAS.find(c => c.pessoa === msg.de) || CONVERSAS.find(c => c.id === 'familia')).id;
    dados.msgs[conversa].push(resposta);
    salvar(); mandarPraNuvem(conversa, resposta);
    /* e a família toda fica sabendo que alguém já foi */
    if(conversa !== 'familia'){
      const avisoFam = { t:`🏃 ${PESSOAS[dados.euSou].curto} já está indo ajudar ${p.curto}`, de: dados.euSou, ts: Date.now() + 1 };
      dados.msgs.familia.push(avisoFam); salvar(); mandarPraNuvem('familia', avisoFam);
    }
    desenharContatos(); if(atual) desenharMensagens();
    toast('Avisei que tu está indo 🏃', 4000);
  });
  avisar('🆘 ' + p.nome + ': ' + (msg.t || 'precisa de ajuda!'),
         msg.lugar ? 'Toca pra ver onde está' : 'Sem o lugar', 'sos');
}

function insistirNoAlarme(msg, p){
  pararDeInsistir();
  tocarAlarme();
  const comecou = Date.now();
  insistindo = setInterval(() => {
    if(!document.getElementById('telaSos') || Date.now() - comecou > 5 * 60000){
      pararDeInsistir(); return;
    }
    tocarAlarme();                                   // o tocarAlarme para sozinho aos 20s
    if(navigator.vibrate) navigator.vibrate([400,200,400,200,400]);
  }, 18000);
}
function pararDeInsistir(){
  clearInterval(insistindo); insistindo = null;
  pararAlarme();
}

/* ---------- 🚨 sirene ---------- */
let sirene = null;

function tocarSirene(){
  if(sirene){ pararSirene(); return; }
  try{
    const c = new (window.AudioContext || window.webkitAudioContext)();
    const o = c.createOscillator(), g = c.createGain();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(600, c.currentTime);
    g.gain.setValueAtTime(.0001, c.currentTime);
    g.gain.exponentialRampToValueAtTime(.5, c.currentTime + .05);   // alto de propósito
    o.connect(g); g.connect(c.destination);
    o.start();
    /* sobe e desce, igual sirene de verdade */
    let subindo = true;
    const mexer = setInterval(() => {
      o.frequency.linearRampToValueAtTime(subindo ? 1200 : 600, c.currentTime + .45);
      subindo = !subindo;
    }, 450);
    sirene = { ctx:c, osc:o, relogio: mexer };
    if(navigator.vibrate) navigator.vibrate([1000,200,1000,200,1000]);
    toast('🚨 SIRENE LIGADA — toca de novo pra parar', 6000);
    setTimeout(() => { if(sirene) pararSirene(); }, 120000);        // 2 minutos no máximo
  }catch(e){ toast('Não consegui ligar a sirene 😕'); }
}
function pararSirene(){
  if(!sirene) return;
  clearInterval(sirene.relogio);
  try{ sirene.osc.stop(); sirene.ctx.close(); }catch(e){}
  sirene = null;
  toast('Sirene desligada');
}

/* ---------- ☎️ números de emergência ---------- */
const EMERGENCIAS = [
  { n:'190', nome:'Polícia',   emoji:'🚓', cor:'#1d4ed8' },
  { n:'192', nome:'SAMU',      emoji:'🚑', cor:'#dc2626' },
  { n:'193', nome:'Bombeiros', emoji:'🚒', cor:'#ea580c' },
  { n:'188', nome:'CVV — pra conversar', emoji:'💚', cor:'#16a34a' }
];

function abrirNumerosDeEmergencia(){
  if(document.getElementById('telaNumeros')) return;
  const tela = document.createElement('div');
  tela.className = 'fundo-modal aberto'; tela.id = 'telaNumeros';
  tela.innerHTML = `
    <div class="modal">
      <h2>☎️ Ligar pra emergência</h2>
      <p class="sub">Toca no botão e o celular liga de verdade. É de graça, funciona até sem crédito.</p>
      <div class="num-botoes">
        ${EMERGENCIAS.map(e => `
          <a class="num-bt" href="tel:${e.n}" style="--cor:${e.cor}">
            <span>${e.emoji}</span><b>${e.n}</b><small>${e.nome}</small>
          </a>`).join('')}
      </div>
      <p class="sem-lembrete" style="margin-top:12px">Se der pra chamar um adulto perto de ti, chama também.</p>
      <div class="acoes"><button class="btn neutro" id="numFechar">Fechar</button></div>
    </div>`;
  document.body.appendChild(tela);
  tela.addEventListener('click', e => { if(e.target.id === 'telaNumeros') tela.remove(); });
  document.getElementById('numFechar').addEventListener('click', () => tela.remove());
}

/* ---------- 🩺 ficha de emergência ---------- */
const CAMPOS_DA_FICHA = [
  ['nome',    'Nome completo',        'Ex.: Jonathan Silva'],
  ['nasc',    'Data de nascimento',   'Ex.: 01/09/2016'],
  ['sangue',  'Tipo de sangue',       'Ex.: O+'],
  ['alergia', 'Alergia a alguma coisa','Ex.: amendoim, dipirona'],
  ['remedio', 'Remédio que toma',     'Ex.: bombinha de asma'],
  ['doenca',  'Alguma condição',      'Ex.: asma, diabetes'],
  ['fone1',   'Telefone do responsável', 'Ex.: 55 99999-0000'],
  ['fone2',   'Outro telefone',       'Ex.: da vó']
];

function abrirFicha(soVer){
  soVer = soVer === true;   // só o `true` de verdade abre no modo de leitura
  if(document.getElementById('telaFicha')) return;
  dados.ficha = dados.ficha || {};
  const f = dados.ficha;
  const tela = document.createElement('div');
  tela.className = 'tela-cheia ficha'; tela.id = 'telaFicha';
  tela.innerHTML = `
    <div class="w-topo" style="background:linear-gradient(135deg,#dc2626,#7f1d1d)">
      <button class="icone" id="fiFechar">✕</button>
      <div><b>🩺 Ficha de emergência</b><div class="w-sub">${soVer ? 'pra quem achou este celular' : 'em caso de emergência'}</div></div>
    </div>
    <div class="fi-meio">
      ${soVer ? '' : `<p class="sem-lembrete">Isto fica <b>só neste aparelho</b> e não vai pra nuvem nem pro backup.
      Serve pra quem achar o teu celular conseguir te ajudar — por isso dá pra ver <b>sem destrancar</b> o site.</p>`}
      <div class="fi-campos">
        ${CAMPOS_DA_FICHA.map(([id, rotulo, dica]) => soVer
          ? (f[id] ? `<div class="fi-linha"><b>${rotulo}</b><span>${escapar(f[id])}</span></div>` : '')
          : `<div class="campo-form"><label>${rotulo}</label>
               <input id="fi-${id}" maxlength="60" placeholder="${dica}" value="${escapar(f[id] || '').replace(/"/g,'&quot;')}"></div>`
        ).join('') || '<p class="lig-txt">A ficha ainda está vazia.</p>'}
      </div>
      ${soVer && (f.fone1 || f.fone2) ? `
        <div class="num-botoes" style="margin-top:14px">
          ${[f.fone1, f.fone2].filter(Boolean).map(t => `
            <a class="num-bt" href="tel:${String(t).replace(/[^0-9+]/g,'')}" style="--cor:#16a34a">
              <span>📞</span><b>Ligar</b><small>${escapar(t)}</small></a>`).join('')}
        </div>` : ''}
      ${soVer ? '' : '<div class="lig-botoes" style="margin-top:6px"><button class="lig-bt ok grande" id="fiSalvar">💾 Guardar a ficha</button></div>'}
    </div>`;
  document.body.appendChild(tela);
  document.getElementById('fiFechar').addEventListener('click', () => tela.remove());
  if(!soVer) document.getElementById('fiSalvar').addEventListener('click', () => {
    CAMPOS_DA_FICHA.forEach(([id]) => {
      const v = document.getElementById('fi-' + id).value.trim();
      if(v) dados.ficha[id] = v; else delete dados.ficha[id];
    });
    salvar(); tela.remove();
    toast('Ficha guardada 🩺');
  });
}
const fichaTemAlgo = () => Object.keys(dados.ficha || {}).length > 0;

/* ---------- ⏱️ "se eu não avisar, avisa por mim" ---------- */
function abrirTimerDeSeguranca(){
  if(document.getElementById('telaTimerSeg')) return;
  const jaTem = dados.vigia && dados.vigia.ate > Date.now();
  const tela = document.createElement('div');
  tela.className = 'fundo-modal aberto'; tela.id = 'telaTimerSeg';
  tela.innerHTML = `
    <div class="modal">
      <h2>⏱️ Se eu não avisar, avisa por mim</h2>
      ${jaTem ? `
        <p class="sub">Já tem um em andamento: <b>${escapar(dados.vigia.oque)}</b>,
        acaba às ${hora(dados.vigia.ate)}.</p>
        <div class="lig-botoes" style="margin:0">
          <button class="lig-bt ok grande" id="vgCheguei">✅ Cheguei bem!</button>
          <button class="lig-bt desligar" id="vgCancelar">Cancelar o aviso</button>
        </div>`
      : `
        <p class="sub">Diz pra onde tu vai e quanto tempo leva. Se tu não apertar
        <b>"cheguei bem"</b> até lá, o site avisa a família sozinho, com o teu último lugar.</p>
        <div class="campo-form">
          <label>Pra onde tu vai</label>
          <input id="vgOque" maxlength="40" placeholder="Ex.: voltando da escola">
        </div>
        <div class="campo-form">
          <label>Quanto tempo leva</label>
          <div class="lig-botoes" style="margin:0" id="vgTempos">
            ${[10,20,30,45,60].map(n => `<button class="lig-bt" data-vigia="${n}">${n} min</button>`).join('')}
          </div>
        </div>
        <p class="sem-lembrete">⚠️ Só funciona com o site <b>aberto ou atrás de outro app</b>.
        Se o celular for guardado e o site fechado, o aviso sai quando tu abrir de novo.</p>`}
      <div class="acoes"><button class="btn neutro" id="vgFechar">Fechar</button></div>
    </div>`;
  document.body.appendChild(tela);
  tela.addEventListener('click', e => { if(e.target.id === 'telaTimerSeg') tela.remove(); });
  document.getElementById('vgFechar').addEventListener('click', () => tela.remove());

  if(jaTem){
    document.getElementById('vgCheguei').addEventListener('click', () => { cheguemBem(); tela.remove(); });
    document.getElementById('vgCancelar').addEventListener('click', () => {
      delete dados.vigia; salvar(); desenharVigia(); tela.remove();
      toast('Aviso cancelado');
    });
    return;
  }
  tela.querySelectorAll('[data-vigia]').forEach(b => b.addEventListener('click', async () => {
    const oque = document.getElementById('vgOque').value.trim() || 'indo pra algum lugar';
    dados.vigia = { oque, ate: Date.now() + (+b.dataset.vigia) * 60000, avisou:false };
    dados.vigia.lugar = await ondeEstou(6000);       // guarda de onde saiu
    salvar(); desenharVigia(); tela.remove();
    toast(`⏱️ Combinado! Aperta "cheguei bem" em ${b.dataset.vigia} min`, 6000);
  }));
}

function cheguemBem(){
  if(!dados.vigia) return;
  const oque = dados.vigia.oque;
  delete dados.vigia; salvar(); desenharVigia();
  const msg = { t:`✅ Cheguei bem (${oque})`, de: dados.euSou || autor, ts: Date.now() };
  dados.msgs.familia.push(msg);
  salvar(); mandarPraNuvem('familia', msg);
  desenharContatos(); if(atual === 'familia') desenharMensagens();
  toast('Que bom! A família já sabe 💜', 4000);
}

/* a barrinha que fica na lista enquanto o combinado está de pé */
function desenharVigia(){
  const caixa = document.getElementById('barraVigia');
  if(!caixa) return;
  const v = dados.vigia;
  if(!v || v.avisou){ caixa.classList.add('escondido'); return; }
  const faltam = Math.max(0, Math.round((v.ate - Date.now()) / 60000));
  caixa.classList.remove('escondido');
  caixa.innerHTML = `
    <div class="vg-txt">⏱️ <b>${escapar(v.oque)}</b><small>faltam ${faltam} min pra avisar a família</small></div>
    <button class="vg-bt" id="vgOk">✅ Cheguei</button>`;
  const bt = document.getElementById('vgOk');
  if(bt) bt.addEventListener('click', cheguemBem);
}

/* confere o combinado de minuto em minuto */
async function conferirVigia(){
  const v = dados.vigia;
  if(!v || v.avisou) return;
  desenharVigia();
  if(Date.now() < v.ate) return;
  v.avisou = true; salvar(); desenharVigia();

  const msg = {
    tipo:'sos', qual:'perdido', emoji:'⏱️',
    t: `Não avisei que cheguei (${v.oque}) — pode ser que esteja tudo bem, mas confere!`,
    urgente:true, automatico:true, lugar: v.lugar || null,
    de: dados.euSou || autor, ts: Date.now(), v: 0
  };
  dados.msgs.familia.push(msg);
  salvar(); mandarPraNuvem('familia', msg);
  desenharContatos(); if(atual === 'familia') desenharMensagens();
  toast('⏱️ Passou da hora — avisei a família', 8000);

  const agora = await ondeEstou(8000);
  if(agora){ msg.lugar = agora; salvar(); atualizarNaNuvem('familia', msg); }
}
setInterval(conferirVigia, 60000);

/* ---------- 🔋 bateria acabando ---------- */
/* O iPhone não deixa o site ver a bateria — lá isto simplesmente não
   acontece, e tudo o mais continua igual. */
async function olharABateria(){
  if(!navigator.getBattery) return;
  let bat;
  try{ bat = await navigator.getBattery(); }catch(e){ return; }

  const conferir = () => {
    const pct = Math.round(bat.level * 100);
    if(bat.charging || pct > 10) return;
    const hoje = new Date().toDateString();
    if(dados.avisouBateria === hoje) return;         // um aviso por dia já basta
    dados.avisouBateria = hoje; salvar();
    const msg = { t:`🔋 Meu celular está acabando (${pct}%) — se eu sumir, é isso`,
                  de: dados.euSou || autor, ts: Date.now() };
    dados.msgs.familia.push(msg);
    salvar(); mandarPraNuvem('familia', msg);
    desenharContatos(); if(atual === 'familia') desenharMensagens();
    toast('🔋 Avisei a família que a bateria está acabando', 6000);
  };
  bat.addEventListener('levelchange', conferir);
  bat.addEventListener('chargingchange', conferir);
  conferir();
}

/* ---------- 📍 me acompanha ---------- */
let seguindo = null;
const MINUTOS_SEGUINDO = 30;

function abrirMeAcompanha(){
  if(seguindo){ pararDeSeguir(); return; }
  if(!navigator.geolocation){ toast('Este aparelho não tem GPS 😕'); return; }
  if(typeof podeSinalizar !== 'function' || !podeSinalizar()){
    toast('Precisa do ☁️ ligado pra família ver onde tu está', 5000); return;
  }
  if(!confirm(`📍 Deixar a família ver onde tu está, ao vivo, por ${MINUTOS_SEGUINDO} minutos?\n\nDesliga sozinho no fim.`)) return;

  const ate = Date.now() + MINUTOS_SEGUINDO * 60000;
  const aviso = { t:`📍 Tô deixando vocês verem onde eu estou por ${MINUTOS_SEGUINDO} min`,
                  de: dados.euSou || autor, ts: Date.now() };
  dados.msgs.familia.push(aviso);
  salvar(); mandarPraNuvem('familia', aviso);
  desenharContatos(); if(atual === 'familia') desenharMensagens();

  const olho = navigator.geolocation.watchPosition(
    pos => escreverSinal(`ondeestou/${dados.euSou}`, {
      lat:+pos.coords.latitude.toFixed(5), lon:+pos.coords.longitude.toFixed(5),
      ts: Date.now(), ate
    }),
    () => {},
    { enableHighAccuracy:true, maximumAge:15000, timeout:20000 }
  );
  seguindo = { olho, fim: setTimeout(pararDeSeguir, MINUTOS_SEGUINDO * 60000), ate };
  desenharSeguindo();
  toast(`📍 A família está te acompanhando por ${MINUTOS_SEGUINDO} min`, 6000);
}

function pararDeSeguir(){
  if(!seguindo) return;
  navigator.geolocation.clearWatch(seguindo.olho);
  clearTimeout(seguindo.fim);
  seguindo = null;
  escreverSinal(`ondeestou/${dados.euSou}`, null);
  desenharSeguindo();
  toast('📍 Parei de compartilhar onde tu está');
}

function desenharSeguindo(){
  const bt = document.getElementById('btnSeguir');
  if(!bt) return;
  bt.classList.toggle('ligado', !!seguindo);
  bt.textContent = seguindo ? '📍 Parar' : '📍 Me acompanha';
}

/* quem está deixando ver onde está, chamado pelo lerSinais */
function receberOndeEstao(todos){
  const caixa = document.getElementById('quemNoMapa');
  if(!caixa) return;
  const agora = Date.now();
  const linhas = Object.entries(todos || {})
    .filter(([p, o]) => PESSOAS[p] && !souEu(p) && o && o.ate > agora && agora - o.ts < 5 * 60000)
    .map(([p, o]) => `
      <a class="mapa-chip" target="_blank" rel="noopener"
         href="https://www.openstreetmap.org/?mlat=${o.lat}&mlon=${o.lon}#map=17/${o.lat}/${o.lon}">
        <span class="mapa-av" style="background:linear-gradient(135deg,${PESSOAS[p].cor},${PESSOAS[p].cor}bb)">${avatarDe(p)}</span>
        <b>${PESSOAS[p].curto}</b><small>📍 ver no mapa</small>
      </a>`);
  caixa.innerHTML = linhas.join('');
  caixa.classList.toggle('escondido', !linhas.length);
}


/* ============ 🤕 JÁ TÔ BEM ============ */
/* Depois do susto, alguém precisa dizer que passou — senão a família
   fica com o coração na mão sem saber. */
function meuUltimoSos(){
  const meus = (dados.msgs.familia || []).filter(m => m.tipo === 'sos' && souEu(m.de));
  return meus.length ? meus[meus.length - 1] : null;
}

function jaEstouBem(){
  const sos = meuUltimoSos();
  if(!sos){ toast('Tu não pediu ajuda ainda 😊', 4000); return; }
  if(sos.resolvido){ toast('Tu já avisou que está bem 💜', 4000); return; }
  if(!confirm('🤕 Avisar a família que já está tudo bem?\n\nO alarme para no aparelho de todo mundo.')) return;

  sos.resolvido = true;
  salvar(); atualizarNaNuvem('familia', sos);

  const msg = { tipo:'tudobem', t:'Já tô bem! Podem ficar tranquilos 💜',
                de: dados.euSou || autor, ts: Date.now() };
  dados.msgs.familia.push(msg);
  salvar(); mandarPraNuvem('familia', msg);
  desenharContatos(); if(atual === 'familia') desenharMensagens();
  toast('A família já sabe que tu está bem 💜', 5000);
}

/* chega no aparelho dos outros: para o alarme e mostra o alívio */
function chegouTudoBem(msg){
  pararDeInsistir();
  const tela = document.getElementById('telaSos');
  if(tela) tela.remove();
  const p = PESSOAS[msg.de] || PESSOAS.jojo;
  toast(`💜 ${p.curto} avisou que já está bem!`, 8000);
  if(typeof avisar === 'function') avisar('💜 ' + p.nome + ' já está bem', 'O pedido de ajuda foi encerrado', 'familia');
  if(typeof confete === 'function') confete();
}

function balaoTudoBem(m){
  const p = PESSOAS[m.de] || PESSOAS.jojo;
  return `<div class="bem-balao">
    <div class="ch-emoji">💜</div>
    <div class="ch-txt"><b>${escapar(m.t)}</b><small>${souEu(m.de) ? 'tu avisou' : p.curto + ' avisou'} às ${hora(m.ts)}</small></div>
  </div>`;
}

/* ============ 📢 MANDAR DE NOVO ============ */
function mandarDeNovo(){
  const sos = meuUltimoSos();
  if(!sos){ toast('Não tem pedido de ajuda pra repetir 😊', 4000); return; }
  if(!confirm('📢 Mandar o teu pedido de ajuda DE NOVO?\n\nO alarme toca outra vez no aparelho de todo mundo.')) return;

  /* vai como um recado novo, senão o aparelho do outro reconhece o uid
     antigo e não toca o alarme de novo */
  const repetido = Object.assign({}, sos, {
    ts: Date.now(), v: 0, repetido: true, resolvido: false
  });
  delete repetido.uid;
  dados.msgs.familia.push(repetido);
  dados.visto.familia = Date.now();
  salvar(); mandarPraNuvem('familia', repetido);
  desenharContatos(); if(atual === 'familia') desenharMensagens();
  toast('📢 Mandei de novo!', 5000);
  ligarPraQuemPuder();
}

/* ============ 🔦 LANTERNA SOS ============ */
/* Pisca a tela inteira em código morse: · · · − − − · · ·
   Dá pra ver de longe no escuro, e é o pedido de socorro que o mundo
   inteiro conhece. */
let lanterna = null;
const CURTO = 220, LONGO = 660, PAUSA = 220;

function lanternaSOS(){
  if(lanterna){ pararLanterna(); return; }
  const tela = document.createElement('div');
  tela.className = 'tela-cheia lanterna'; tela.id = 'telaLanterna';
  tela.innerHTML = `
    <div class="ln-luz" id="lnLuz"></div>
    <div class="ln-txt">
      <b>🔦 SOS</b>
      <p>A tela está piscando o pedido de socorro. Aponta pra quem tu quer chamar.</p>
      <button class="lig-bt desligar grande" id="lnParar">Parar</button>
    </div>`;
  document.body.appendChild(tela);
  document.getElementById('lnParar').addEventListener('click', pararLanterna);

  const luz = document.getElementById('lnLuz');
  const padrao = [CURTO,CURTO,CURTO, LONGO,LONGO,LONGO, CURTO,CURTO,CURTO];
  let i = 0, marcas = [];

  const proximo = () => {
    if(!lanterna) return;
    if(i >= padrao.length){ i = 0; marcas.push(setTimeout(proximo, 1400)); return; }   // respira e recomeça
    const tempo = padrao[i++];
    luz.classList.add('on');
    marcas.push(setTimeout(() => {
      luz.classList.remove('on');
      marcas.push(setTimeout(proximo, PAUSA));
    }, tempo));
  };
  lanterna = { marcas };
  proximo();
  if(navigator.vibrate) navigator.vibrate([200,200,200,200,200,600,600,600,600,600,600,200,200,200,200,200]);
}

function pararLanterna(){
  if(!lanterna) return;
  lanterna.marcas.forEach(clearTimeout);
  lanterna = null;
  document.getElementById('telaLanterna')?.remove();
}

/* ============ 🧭 COMO VOLTO PRA CASA ============ */
async function comoVoltoPraCasa(){
  const casa = dados.casa;
  if(!casa){ marcarOndeECasa(); return; }
  toast('Vendo onde tu está... 📍', 4000);
  const agora = await ondeEstou(9000);
  if(!agora){ toast('O GPS não respondeu 😕 tenta de novo lá fora', 6000); return; }

  const dist = distanciaEmMetros(agora, casa);
  const perto = dist < 120;
  const caminho = `https://www.openstreetmap.org/directions?engine=fossgis_osrm_foot&route=${agora.lat},${agora.lon};${casa.lat},${casa.lon}`;

  const tela = document.createElement('div');
  tela.className = 'fundo-modal aberto'; tela.id = 'telaCasa';
  tela.innerHTML = `
    <div class="modal">
      <h2>🧭 Como volto pra casa</h2>
      <p class="sub">${perto ? 'Tu já está pertinho de casa! 🏠'
        : `Tu está a <b>${dist < 1000 ? dist + ' metros' : (dist/1000).toFixed(1) + ' km'}</b> de casa.`}</p>
      <div class="lig-botoes" style="margin:0">
        <a class="lig-bt ok grande" href="${caminho}" target="_blank" rel="noopener">🗺️ Ver o caminho a pé</a>
        <button class="lig-bt" id="casaAvisar">📢 Avisar que tô voltando</button>
        <button class="lig-bt desligar" id="casaTrocar">📍 Marcar a casa de novo</button>
      </div>
      <p class="sem-lembrete" style="margin-top:10px">Se tu não conhecer o caminho, é melhor pedir ajuda pra um
      adulto de confiança ou tocar no 🆘.</p>
      <div class="acoes"><button class="btn neutro" id="casaFechar">Fechar</button></div>
    </div>`;
  document.body.appendChild(tela);
  tela.addEventListener('click', e => { if(e.target.id === 'telaCasa') tela.remove(); });
  document.getElementById('casaFechar').addEventListener('click', () => tela.remove());
  document.getElementById('casaTrocar').addEventListener('click', () => { tela.remove(); marcarOndeECasa(); });
  document.getElementById('casaAvisar').addEventListener('click', () => {
    tela.remove();
    const msg = { tipo:'cheguei', qual:'volta', emoji:'🚶', t:'Tô voltando pra casa',
                  lugar: agora, de: dados.euSou || autor, ts: Date.now() };
    dados.msgs.familia.push(msg);
    salvar(); mandarPraNuvem('familia', msg);
    desenharContatos(); if(atual === 'familia') desenharMensagens();
    toast('Avisei a família 🚶');
  });
}

async function marcarOndeECasa(){
  if(!confirm('🏠 Pra saber o caminho, o site precisa marcar onde é a tua casa.\n\nFica guardado só neste aparelho. Tu está em casa agora?')) return;
  toast('Marcando onde é a casa... 📍', 4000);
  const onde = await ondeEstou(9000);
  if(!onde){ toast('O GPS não respondeu 😕', 5000); return; }
  dados.casa = onde; salvar();
  toast('🏠 Casa marcada! Agora eu sei o caminho de volta', 5000);
}

/* fórmula de haversine, arredondada — não precisa de precisão de satélite */
function distanciaEmMetros(a, b){
  const R = 6371000, rad = g => g * Math.PI / 180;
  const dLat = rad(b.lat - a.lat), dLon = rad(b.lon - a.lon);
  const x = Math.sin(dLat/2)**2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon/2)**2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1-x)));
}

/* ============ 🏠 QUEM JÁ CHEGOU + 🔋 BATERIA DE TODO MUNDO ============ */
function abrirQuemChegou(){
  if(document.getElementById('telaQuemChegou')) return;
  const agora = Date.now();

  /* o último "cheguei" de cada um, do dia de hoje */
  const hoje = new Date(); hoje.setHours(0,0,0,0);
  const ultimo = {};
  (dados.msgs.familia || []).forEach(m => {
    if(m.tipo !== 'cheguei' || m.ts < hoje.getTime()) return;
    if(!ultimo[m.de] || m.ts > ultimo[m.de].ts) ultimo[m.de] = m;
  });

  const linhas = TODOS.map(p => {
    const u = ultimo[p];
    const emCasa = u && (u.qual === 'casa');
    const bat = (dados.baterias || {})[p];
    const batFresca = bat && agora - bat.ts < 2 * 3600000;
    return `
      <div class="qc-linha ${emCasa ? 'em-casa' : ''}">
        <div class="qc-av" style="background:linear-gradient(135deg,${PESSOAS[p].cor},${PESSOAS[p].cor}bb)">${avatarDe(p)}</div>
        <div class="qc-txt">
          <b>${nomeDe(p)}</b>
          <small>${u ? `${u.emoji} ${escapar(u.t)} · ${hora(u.ts)}` : 'não avisou nada hoje'}</small>
        </div>
        <div class="qc-lado">
          <span class="qc-casa">${emCasa ? '🏠' : (u ? '🚶' : '❔')}</span>
          ${batFresca ? `<span class="qc-bat ${bat.pct <= 20 ? 'baixa' : ''}">${bateriaEmoji(bat.pct)} ${bat.pct}%</span>` : ''}
        </div>
      </div>`;
  }).join('');

  const semBateria = TODOS.filter(p => !((dados.baterias || {})[p]));
  const tela = document.createElement('div');
  tela.className = 'tela-cheia'; tela.id = 'telaQuemChegou';
  tela.innerHTML = `
    <div class="w-topo" style="background:linear-gradient(135deg,#16a34a,#0ea5e9)">
      <button class="icone" id="qcFechar">✕</button>
      <div><b>🏠 Quem já chegou</b><div class="w-sub">e como está a bateria de cada um</div></div>
    </div>
    <div class="qc-meio">
      ${linhas}
      <p class="sem-lembrete" style="margin-top:14px">O 🏠 aparece pra quem tocou em <b>🚸 CHEGUEI</b> hoje.
      ${semBateria.length ? `A bateria d${semBateria.length === 1 ? 'e ' : 'e '}${semBateria.map(p=>PESSOAS[p].curto).join(', ')} não aparece:
      pode ser iPhone (que não deixa o site ver isso) ou o site não foi aberto ainda hoje.` : ''}</p>
    </div>`;
  document.body.appendChild(tela);
  document.getElementById('qcFechar').addEventListener('click', () => tela.remove());
}

const bateriaEmoji = pct => pct <= 10 ? '🪫' : pct <= 30 ? '🔋' : '🔋';

/* cada aparelho conta a sua bateria de vez em quando */
async function contarMinhaBateria(){
  if(!navigator.getBattery || typeof podeSinalizar !== 'function' || !podeSinalizar()) return;
  try{
    const bat = await navigator.getBattery();
    escreverSinal(`baterias/${dados.euSou}`, {
      pct: Math.round(bat.level * 100), carregando: !!bat.charging, ts: Date.now()
    });
  }catch(e){}
}

function receberBaterias(todas){
  if(!todas) return;
  dados.baterias = dados.baterias || {};
  let mudou = false;
  Object.entries(todas).forEach(([p, b]) => {
    if(!PESSOAS[p] || !b || typeof b.pct !== 'number') return;
    const tinha = dados.baterias[p];
    if(tinha && tinha.ts === b.ts) return;
    dados.baterias[p] = b; mudou = true;
  });
  if(mudou) salvar();
}
