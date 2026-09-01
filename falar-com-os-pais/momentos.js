/* =========================================================
   momentos.js — os avisos rápidos do dia a dia:
   🚸 CHEGUEI · 🚗 tô indo te buscar · ⏰ despertador de longe
   · ⛅ levo casaco hoje?

   São coisas de um toque só: quem está com pressa (ou com o
   celular na mão dentro do carro) não quer digitar nada.
   ========================================================= */

/* ============ 🚸 CHEGUEI ============ */
const LUGARES = [
  { id:'escola',   emoji:'🏫', txt:'Cheguei na escola' },
  { id:'casa',     emoji:'🏠', txt:'Cheguei em casa' },
  { id:'treino',   emoji:'⚽', txt:'Cheguei no treino' },
  { id:'trabalho', emoji:'💼', txt:'Cheguei no trabalho' },
  { id:'amigo',    emoji:'🧑‍🤝‍🧑', txt:'Cheguei na casa do amigo' },
  { id:'volta',    emoji:'🚶', txt:'Tô voltando pra casa' }
];

function abrirCheguei(){
  if(document.getElementById('telaCheguei')) return;
  const tela = document.createElement('div');
  tela.className = 'tela-cheia cheguei-tela'; tela.id = 'telaCheguei';
  tela.innerHTML = `
    <div class="w-topo" style="background:linear-gradient(135deg,#16a34a,#0ea5e9)">
      <button class="icone" id="chFechar">✕</button>
      <div><b>🚸 Cheguei!</b><div class="w-sub">um toque e a família toda fica sabendo</div></div>
    </div>
    <div class="ch-meio">
      <p class="lig-txt">Toca em onde tu chegou. Vai pra conversa da 💜 Família com o lugar no mapa.</p>
      <div class="ch-botoes">
        ${LUGARES.map(l => `<button class="ch-bt" data-cheguei="${l.id}"><span>${l.emoji}</span>${l.txt}</button>`).join('')}
      </div>
      <p class="sem-lembrete" id="chDica">O mapa é opcional: se o GPS não deixar, o aviso vai do mesmo jeito.</p>
    </div>`;
  document.body.appendChild(tela);
  document.getElementById('chFechar').addEventListener('click', () => tela.remove());
  tela.querySelectorAll('[data-cheguei]').forEach(b =>
    b.addEventListener('click', () => mandarCheguei(b.dataset.cheguei, tela)));
}

async function mandarCheguei(qual, tela){
  const lugar = LUGARES.find(l => l.id === qual) || LUGARES[0];
  const dica = document.getElementById('chDica');
  if(dica) dica.textContent = 'Procurando onde tu está... 📍';

  const onde = await ondeEstou(6000);      // se demorar, manda sem o mapa
  const msg = {
    tipo:'cheguei', qual: lugar.id, emoji: lugar.emoji, t: lugar.txt,
    de: dados.euSou || autor, ts: Date.now()
  };
  if(onde) msg.lugar = onde;

  dados.msgs.familia.push(msg);
  dados.visto.familia = Date.now();
  marcarPresenca(msg.de);
  salvar(); blim(true);
  mandarPraNuvem('familia', msg);
  desenharContatos();
  if(atual === 'familia') desenharMensagens();
  if(tela) tela.remove();
  toast(`${lugar.emoji} A família já sabe! ${onde ? '📍' : ''}`, 4000);
}

/* O GPS às vezes demora ou é negado — nunca deixa o aviso preso por isso. */
function ondeEstou(limite){
  return new Promise(res => {
    if(!navigator.geolocation) return res(null);
    let respondeu = false;
    const pronto = v => { if(!respondeu){ respondeu = true; res(v); } };
    setTimeout(() => pronto(null), limite || 6000);
    navigator.geolocation.getCurrentPosition(
      pos => pronto({ lat:+pos.coords.latitude.toFixed(5), lon:+pos.coords.longitude.toFixed(5) }),
      () => pronto(null),
      { enableHighAccuracy:true, timeout: limite || 6000, maximumAge: 60000 }
    );
  });
}

function balaoCheguei(m){
  return `
    <div class="cheguei-balao">
      <div class="ch-emoji">${m.emoji || '🚸'}</div>
      <div class="ch-txt"><b>${escapar(m.t || 'Cheguei!')}</b>
        <small>${souEu(m.de) ? 'tu avisou' : PESSOAS[m.de].curto + ' avisou'} às ${hora(m.ts)}</small></div>
      ${m.lugar ? `<button class="ch-mapa" data-mapa="${dados.msgs[atual].indexOf(m)}">🗺️ Ver no mapa</button>` : ''}
    </div>`;
}

/* ============ 🚗 TÔ INDO TE BUSCAR ============ */
function abrirTouIndo(){
  const c = conversaPor(atual);
  if(document.getElementById('telaIndo')) return;
  const tela = document.createElement('div');
  tela.className = 'fundo-modal aberto'; tela.id = 'telaIndo';
  tela.innerHTML = `
    <div class="modal">
      <h2>🚗 Tô indo te buscar</h2>
      <p class="sub">Avisa ${c ? c.nome : 'a família'} e mostra um relógio contando o tempo que falta.</p>
      <div class="lig-botoes" style="margin:0">
        ${[5,10,15,20,30,45].map(n => `<button class="lig-bt" data-indo="${n}">${n} min</button>`).join('')}
      </div>
    </div>`;
  document.body.appendChild(tela);
  tela.addEventListener('click', e => { if(e.target.id === 'telaIndo') tela.remove(); });
  tela.querySelectorAll('[data-indo]').forEach(b => b.addEventListener('click', () => {
    mandarTouIndo(+b.dataset.indo); tela.remove();
  }));
}

function mandarTouIndo(minutos){
  const msg = { tipo:'indo', min: minutos, chega: Date.now() + minutos * 60000,
                de: dados.euSou || autor, ts: Date.now() };
  dados.msgs[atual].push(msg);
  dados.visto[atual] = Date.now();
  marcarPresenca(msg.de);
  animar = dados.msgs[atual].length - 1;
  salvar(); blim(true); mandarPraNuvem(atual, msg);
  desenharMensagens(); desenharContatos();
  toast(`🚗 Avisado: chegando em ${minutos} min`);
}

function balaoIndo(m){
  const faltam = Math.round((m.chega - Date.now()) / 60000);
  const chegou = faltam <= 0;
  return `
    <div class="indo-balao ${chegou ? 'chegou' : ''}">
      <div class="ch-emoji">${chegou ? '🎉' : '🚗'}</div>
      <div class="ch-txt"><b>${souEu(m.de) ? 'Tu está' : PESSOAS[m.de].curto + ' está'} indo te buscar</b>
        <small class="indo-conta" data-chega="${m.chega}">${chegou ? 'já deve ter chegado!' : `chega em uns ${faltam} min`}</small></div>
    </div>`;
}

/* o relógio dos balões "tô indo" anda sozinho, sem redesenhar a conversa */
setInterval(() => {
  document.querySelectorAll('.indo-conta').forEach(el => {
    const faltam = Math.round((+el.dataset.chega - Date.now()) / 60000);
    el.textContent = faltam <= 0 ? 'já deve ter chegado!' : `chega em uns ${faltam} min`;
    if(faltam <= 0) el.closest('.indo-balao')?.classList.add('chegou');
  });
}, 30000);

/* ============ ⏰ DESPERTADOR DE LONGE ============ */
/* A mãe põe um despertador que toca NO celular do filho. Vai pelo
   mesmo cantinho dos sinais e o aparelho de quem vai acordar confere
   de tempos em tempos. */
let despertadoresTocados = new Set();

function abrirDespertador(){
  const c = conversaPor(atual);
  const alvo = c && c.pessoa;
  if(!alvo){ toast('Escolhe a conversa de UMA pessoa pra pôr o despertador dela 😊', 5000); return; }
  if(typeof podeSinalizar !== 'function' || !podeSinalizar()){
    toast('Precisa do ☁️ ligado pra tocar no outro aparelho', 5000); return;
  }
  if(document.getElementById('telaDespertador')) return;

  const agora = new Date(Date.now() + 10 * 60000);
  const hh = String(agora.getHours()).padStart(2,'0') + ':' + String(agora.getMinutes()).padStart(2,'0');
  const tela = document.createElement('div');
  tela.className = 'fundo-modal aberto'; tela.id = 'telaDespertador';
  tela.innerHTML = `
    <div class="modal">
      <h2>⏰ Despertador de longe</h2>
      <p class="sub">Vai tocar no celular d${alvo === 'irma' || alvo === 'mae' ? 'a' : 'o'} <b>${PESSOAS[alvo].curto}</b>,
      na hora que tu marcar. Só funciona com o site aberto ou atrás de outro app.</p>
      <div class="campo-form">
        <label>Que horas</label>
        <input type="time" id="despHora" value="${hh}">
      </div>
      <div class="campo-form">
        <label>Pra quê</label>
        <input id="despTxt" maxlength="40" placeholder="Ex.: hora de acordar!">
      </div>
      <div class="acoes">
        <button class="btn neutro" id="despSair">Deixa pra lá</button>
        <button class="btn principal" id="despPor">⏰ Pôr o despertador</button>
      </div>
    </div>`;
  document.body.appendChild(tela);
  tela.addEventListener('click', e => { if(e.target.id === 'telaDespertador') tela.remove(); });
  document.getElementById('despSair').addEventListener('click', () => tela.remove());
  document.getElementById('despPor').addEventListener('click', async () => {
    const [h, min] = document.getElementById('despHora').value.split(':').map(Number);
    if(isNaN(h)){ toast('Escolhe uma hora 😊'); return; }
    const quando = new Date(); quando.setHours(h, min, 0, 0);
    if(quando.getTime() <= Date.now()) quando.setDate(quando.getDate() + 1);   // já passou: é amanhã
    await escreverSinal(`despertador/${alvo}`, {
      de: dados.euSou, quando: quando.getTime(),
      txt: document.getElementById('despTxt').value.trim() || 'Hora de acordar!'
    });
    tela.remove();
    const falta = Math.round((quando - Date.now()) / 60000);
    toast(`⏰ Posto! Toca daqui a ${falta < 60 ? falta + ' min' : Math.round(falta/60) + ' h'}`, 5000);
  });
}

/* chamado pelo lerSinais: vê se tem despertador pra mim e se já é hora */
function conferirDespertador(todos){
  const meu = todos && dados.euSou && todos[dados.euSou];
  if(!meu || !meu.quando) return;
  if(Date.now() < meu.quando) return;
  if(Date.now() - meu.quando > 30 * 60000) return;         // despertador velho não acorda ninguém
  const marca = dados.euSou + ':' + meu.quando;
  if(despertadoresTocados.has(marca)) return;
  despertadoresTocados.add(marca);
  mostrarDespertador(meu);
  escreverSinal(`despertador/${dados.euSou}`, null);       // já tocou, some do banco
}

function mostrarDespertador(info){
  if(document.getElementById('telaAcordar')) return;
  tocarAlarme();
  const quem = PESSOAS[info.de] || PESSOAS.mae;
  const tela = document.createElement('div');
  tela.className = 'tela-cheia tocando'; tela.id = 'telaAcordar';
  tela.innerHTML = `
    <div class="qs-meio">
      <div class="lig-avatar tremendo" style="background:linear-gradient(135deg,${quem.cor},${quem.cor}bb)">⏰</div>
      <h2>${escapar(info.txt || 'Hora de acordar!')}</h2>
      <p class="lig-txt">${quem.curto} pôs este despertador pra ti 💜</p>
      <div class="lig-botoes"><button class="lig-bt ok grande" id="acordei">😴 Já acordei!</button></div>
    </div>`;
  document.body.appendChild(tela);
  document.getElementById('acordei').addEventListener('click', () => { pararAlarme(); tela.remove(); });
  setTimeout(() => { if(document.getElementById('telaAcordar')){ pararAlarme(); tela.remove(); } }, 90000);
}

/* ============ ⛅ LEVO CASACO HOJE? ============ */
/* Usa o Open-Meteo, que é de graça e não pede chave nenhuma. */
const CEUS = {
  0:['☀️','céu limpo'], 1:['🌤️','quase limpo'], 2:['⛅','meio nublado'], 3:['☁️','nublado'],
  45:['🌫️','com neblina'], 48:['🌫️','com neblina'],
  51:['🌦️','chuvisco'], 53:['🌦️','chuvisco'], 55:['🌦️','chuvisco'],
  61:['🌧️','chuva fraca'], 63:['🌧️','chuva'], 65:['🌧️','chuva forte'],
  66:['🌨️','chuva gelada'], 67:['🌨️','chuva gelada'],
  71:['❄️','neve'], 73:['❄️','neve'], 75:['❄️','neve'], 77:['❄️','neve'],
  80:['🌦️','pancada de chuva'], 81:['🌧️','pancada de chuva'], 82:['⛈️','chuvarada'],
  85:['🌨️','neve'], 86:['🌨️','neve'],
  95:['⛈️','trovoada'], 96:['⛈️','trovoada com granizo'], 99:['⛈️','trovoada com granizo']
};

async function verOTempo(){
  const caixa = document.getElementById('cardTempo');
  if(!caixa) return;
  const guardado = dados.tempo;
  /* só pergunta de hora em hora: o tempo não muda de minuto em minuto */
  if(guardado && Date.now() - guardado.quando < 3600000){ desenharTempo(guardado); return; }

  const onde = (guardado && guardado.onde) || await ondeEstou(8000);
  if(!onde){ caixa.classList.add('escondido'); return; }

  try{
    const r = await fetch('https://api.open-meteo.com/v1/forecast' +
      `?latitude=${onde.lat}&longitude=${onde.lon}` +
      '&current=temperature_2m,weather_code' +
      '&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max' +
      '&timezone=auto&forecast_days=1');
    if(!r.ok) throw new Error('HTTP ' + r.status);
    const t = await r.json();
    dados.tempo = {
      onde, quando: Date.now(),
      agora: Math.round(t.current.temperature_2m),
      codigo: t.current.weather_code,
      max: Math.round(t.daily.temperature_2m_max[0]),
      min: Math.round(t.daily.temperature_2m_min[0]),
      chuva: t.daily.precipitation_probability_max[0]
    };
    salvar();
    desenharTempo(dados.tempo);
  }catch(e){
    if(guardado) desenharTempo(guardado);       // o de antes ainda serve
    else caixa.classList.add('escondido');
  }
}

function desenharTempo(t){
  const caixa = document.getElementById('cardTempo');
  if(!caixa || !t) return;
  const [emoji, ceu] = CEUS[t.codigo] || ['🌡️', ''];
  const conselho =
    t.chuva >= 50 ? '☔ Leva guarda-chuva!' :
    t.min <= 12   ? '🧥 Leva casaco, vai esfriar!' :
    t.max >= 30   ? '🥤 Leva água, vai fazer calor!' :
    t.chuva >= 25 ? '🌂 Pode chover, vai que...' :
                    '😎 Dia bom, pode ir tranquilo!';
  caixa.classList.remove('escondido');
  caixa.innerHTML = `
    <div class="tempo-agora">${emoji} <b>${t.agora}°</b></div>
    <div class="tempo-txt">
      <b>${conselho}</b>
      <small>${ceu} • máx ${t.max}° / mín ${t.min}° • ${t.chuva}% de chuva</small>
    </div>`;
}
