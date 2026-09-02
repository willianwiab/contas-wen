/* =========================================================
   turma-mais.js — 📸 foto do quadro · 📷 álbum · 💬 conversa
   privada · 🚌 como cada um vai · 🌧️ o tempo na saída ·
   🎂 aniversários · 🔔 aviso na véspera da prova
   ========================================================= */

/* =========================================================
   📸 FOTO DO QUADRO
   A foto vai junto do recado, dentro do pacote embaralhado.
   Por isso ela é ENCOLHIDA bastante: uma foto de celular tem
   4 MB, e 4 MB embaralhados não entram num banco de graça.
   ========================================================= */
const LADO_FOTO = 1100;      // largura máxima
const PESO_FOTO = 300000;    // ~300 KB depois de encolher

let fotoEscolhida = null;

function escolherFoto(){
  const inp = document.createElement('input');
  inp.type = 'file'; inp.accept = 'image/*'; inp.capture = 'environment';
  inp.addEventListener('change', async () => {
    const arq = inp.files && inp.files[0];
    if(!arq) return;
    aviso('Preparando a foto... 📸', 4000);
    try{
      fotoEscolhida = await encolherFoto(arq);
      const previa = $('#escFotoPrevia');
      previa.innerHTML = `<img src="${fotoEscolhida}" alt="">
        <button class="bt fraco" id="tirarFoto">✕ tirar a foto</button>`;
      previa.classList.remove('escondido');
      document.getElementById('tirarFoto').addEventListener('click', () => {
        fotoEscolhida = null; previa.classList.add('escondido'); previa.innerHTML = '';
      });
      aviso('Foto pronta! 📸');
    }catch(e){ aviso('Não consegui abrir essa foto 😕', 5000); }
  });
  inp.click();
}

function encolherFoto(arq, lado, peso, quadrada){
  lado = lado || LADO_FOTO; peso = peso || PESO_FOTO;
  return new Promise((res, rej) => {
    const leitor = new FileReader();
    leitor.onload = () => {
      const img = new Image();
      img.onload = () => {
        const tela = document.createElement('canvas');
        const ctx = tela.getContext('2d');
        if(quadrada){
          /* foto de perfil é redonda na tela: corta o meio num quadrado,
             senão a pessoa fica esticada ou com meia cabeça de fora */
          const m = Math.min(img.width, img.height);
          tela.width = tela.height = Math.min(lado, m);
          ctx.drawImage(img, (img.width - m) / 2, (img.height - m) / 2, m, m,
                        0, 0, tela.width, tela.height);
        }else{
          let { width:l, height:a } = img;
          const escala = Math.min(1, lado / Math.max(l, a));
          l = Math.round(l * escala); a = Math.round(a * escala);
          tela.width = l; tela.height = a;
          ctx.drawImage(img, 0, 0, l, a);
        }
        /* vai baixando a qualidade até caber: melhor uma foto um pouco
           mais feia do que uma foto que não chega em ninguém */
        let q = 0.82, saida = tela.toDataURL('image/jpeg', q);
        while(saida.length > peso && q > 0.3){
          q -= 0.12; saida = tela.toDataURL('image/jpeg', q);
        }
        if(saida.length > peso) return rej(new Error('grande demais'));
        res(saida);
      };
      img.onerror = rej; img.src = leitor.result;
    };
    leitor.onerror = rej; leitor.readAsDataURL(arq);
  });
}

/* =========================================================
   📷 ÁLBUM DA TURMA
   ========================================================= */
function abrirAlbum(){
  const fotos = dados.avisos.filter(a => a.foto).sort((a,b) => b.ts - a.ts);
  $('#albumConta').textContent = fotos.length
    ? `${fotos.length} foto${fotos.length > 1 ? 's' : ''} da turma` : '';
  $('#album').innerHTML = fotos.length ? fotos.map(a => `
    <button class="alb-foto" data-albfoto="${a.id}">
      <img src="${a.foto}" alt="" loading="lazy">
      <span class="alb-quem">${escapar(a.de)} · ${diaTexto(a.ts)}</span>
    </button>`).join('')
    : `<div class="vazio"><div class="emojao">📷</div><h3>Álbum vazio</h3>
       <p>Manda uma foto no mural — do quadro, do passeio, da festa — e ela aparece aqui.</p></div>`;
  document.querySelectorAll('[data-albfoto]').forEach(b => b.addEventListener('click', () => {
    const a = dados.avisos.find(x => x.id === b.dataset.albfoto);
    if(a) verFotoGrande(a.foto);
  }));
  mostrar('album');
}

/* =========================================================
   💬 CONVERSA PRIVADA
   Fica noutro cantinho do banco e embaralhada igual ao resto.
   Não é segredo de verdade: quem tem o convite da turma tem a
   chave. Está escrito na tela, porque criança merece saber.
   ========================================================= */
let comQuem = null;
let relogioPrivado = null;

const parDe = (a, b) => [a, b].sort().join('~').replace(/[.#$\[\]\/]/g, '_').slice(0, 90);
/* O NOME NÃO PODE SER A CHAVE NO BANCO.
   Se a pasta se chamasse "Ana~Jojo", o banco não leria a conversa,
   mas leria quem conversa com quem — e isso já é informação demais.
   Então a chave é um embaralhado do segredo da turma + os nomes:
   quem tem o convite calcula igual, quem não tem só vê letra solta. */
const emHex = buf => [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2,'0')).join('');
async function chaveDoBanco(...partes){
  const cru = (dados.turma.segredo || dados.turma.codigo) + '|' + partes.join('|');
  return emHex(await crypto.subtle.digest('SHA-256', bytes(cru))).slice(0, 32);
}
const chavePar = (a, b) => chaveDoBanco('par', ...[a, b].sort());

/* quantas mensagens novas de alguém ainda não foram lidas */
function naoLidas(par){
  const visto = (dados.pvVisto || {})[par] || 0;
  return ((dados.privadas || {})[par] || []).filter(m => m.de !== dados.eu && m.ts > visto).length;
}
function marcarNaoLidas(){
  const total = Object.keys(dados.privadas || {}).reduce((s, p) => s + naoLidas(p), 0);
  const bt = document.querySelector('[data-ir="privadas"]');
  if(!bt) return;
  bt.classList.toggle('tem-nova', total > 0);
  bt.dataset.quantas = total > 9 ? '9+' : (total || '');
}

function abrirPrivadas(){
  const gente = new Set();
  dados.avisos.forEach(a => {
    gente.add(a.de);
    Object.keys(a.vai || {}).forEach(n => gente.add(n));
    Object.keys(a.reacoes || {}).forEach(n => gente.add(n));
    Object.keys(a.vi || {}).forEach(n => gente.add(n));
  });
  Object.values(dados.privadas || {}).forEach(msgs => msgs.forEach(m => gente.add(m.de)));
  gente.delete(dados.eu);
  const lista = [...gente].sort((a, b) =>
    naoLidas(parDe(dados.eu, b)) - naoLidas(parDe(dados.eu, a)) || a.localeCompare(b));
  $('#listaPrivadas').innerHTML = lista.length ? lista.map(n => {
    const msgs = (dados.privadas || {})[parDe(dados.eu, n)] || [];
    const ultima = msgs.slice().sort((x, y) => x.ts - y.ts)[msgs.length - 1];
    const novas = naoLidas(parDe(dados.eu, n));
    return `
      <button class="pv-pessoa" data-conversar="${escapar(n)}">
        <span class="pessoa-av" style="background:${corDe(n)};margin:0">${caraDe(n)}</span>
        <div class="pv-txt"><b>${escapar(n)}</b>
          <small>${ultima ? escapar(ultima.txt).slice(0,42) : 'começar a conversar'}</small></div>
        ${novas ? `<span class="pv-novas">${novas}</span>` : ''}
      </button>`;
  }).join('')
  : `<div class="vazio"><div class="emojao">💬</div><h3>Ninguém ainda</h3>
     <p>Quem escrever ou reagir no mural aparece aqui pra tu conversar em particular.</p></div>`;
  document.querySelectorAll('[data-conversar]').forEach(b =>
    b.addEventListener('click', () => abrirConversa(b.dataset.conversar)));
  mostrar('privadas');
}

function abrirConversa(nome){
  comQuem = nome;
  $('#pvNome').textContent = nome;
  $('#pvAv').innerHTML = caraDe(nome);
  $('#pvAv').style.background = corDe(nome);
  dados.pvVisto = dados.pvVisto || {};
  dados.pvVisto[parDe(dados.eu, nome)] = Date.now();
  salvar(); marcarNaoLidas();
  desenharConversa();
  mostrar('conversa');
  puxarPrivadas();
  clearInterval(relogioPrivado);
  relogioPrivado = setInterval(() => { if(!document.hidden && comQuem) puxarPrivadas(); }, 6000);
}
function fecharConversa(){
  clearInterval(relogioPrivado); comQuem = null; abrirPrivadas();
}

function desenharConversa(){
  const msgs = ((dados.privadas || {})[parDe(dados.eu, comQuem)] || []).sort((a,b) => a.ts - b.ts);
  $('#pvMsgs').innerHTML = msgs.length ? msgs.map(m => `
    <div class="pv-linha ${m.de === dados.eu ? 'eu' : 'ele'}">
      <div class="pv-balao">${comLinks(escapar(m.txt))}<span class="pv-hora">${hora(m.ts)}</span></div>
    </div>`).join('')
    : `<p class="dica" style="text-align:center;padding:20px">Nada ainda. Escreve aí embaixo 😊</p>`;
  const c = $('#pvMsgs'); c.scrollTop = c.scrollHeight;
}

async function mandarPrivada(){
  const campo = $('#pvEntrada');
  const txt = (campo.value || '').trim();
  if(!txt || !comQuem) return;
  const par = parDe(dados.eu, comQuem);
  const m = { id: Date.now().toString(36) + Math.random().toString(36).slice(2,6),
              de: dados.eu, txt: txt.slice(0,600), ts: Date.now() };
  dados.privadas = dados.privadas || {};
  (dados.privadas[par] = dados.privadas[par] || []).push(m);
  campo.value = '';
  salvar(); desenharConversa();
  try{
    await fetch(`${endereco()}/privado/${await chavePar(dados.eu, comQuem)}/${m.id}.json`, {
      method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify(await embaralhar(m))
    });
  }catch(e){ aviso('⏳ Sem internet — vai sair quando voltar', 5000); }
}

/* Sem isto, a mensagem só chegava com a conversa ABERTA — quem
   escrevesse pra ti não aparecia em lugar nenhum, e tu nunca ia saber.
   Isto roda junto com o mural e olha todas as tuas conversas. */
async function puxarTodasPrivadas(){
  if(!naTurma() || !navigator.onLine) return;
  try{
    const r = await fetch(`${endereco()}/privado.json?shallow=true`);
    if(!r.ok) return;
    const existem = await r.json();
    if(!existem) return;
    /* pra cada pessoa que eu conheço da turma, calculo qual SERIA a
       chave da nossa conversa. Se ela existe no banco, é minha. As
       outras eu nem sei de quem são — e é isso que a gente quer. */
    let mudou = false;
    for(const n of genteDaTurma()){
      const k = await chavePar(dados.eu, n);
      if(!existem[k]) continue;
      if(await puxarUmPar(k, n)) mudou = true;
    }
    if(mudou){ salvar(); if(comQuem) desenharConversa(); }
    marcarNaoLidas();
    if(document.getElementById('tela-privadas').classList.contains('on')) abrirPrivadas();
  }catch(e){}
}

/* quem eu já vi aparecer na turma */
function genteDaTurma(){
  const g = new Set();
  dados.avisos.forEach(a => {
    if(a.de) g.add(a.de);
    [a.vai, a.reacoes, a.vi, a.votos, a.deram, a.jeitos].forEach(o =>
      Object.keys(o || {}).forEach(n => g.add(n)));
  });
  Object.keys(dados.caras || {}).forEach(n => g.add(n));
  g.delete(dados.eu);
  return [...g];
}

/* traz uma conversa só; devolve true se veio coisa nova */
async function puxarUmPar(chave, comEsse){
  const r = await fetch(`${endereco()}/privado/${chave}.json?orderBy="$key"&limitToLast=80`);
  if(!r.ok) return false;
  const tudo = await r.json();
  if(!tudo) return false;
  const par = parDe(dados.eu, comEsse);       /* aqui no aparelho a chave é o nome mesmo */
  dados.privadas = dados.privadas || {};
  const lista = dados.privadas[par] = dados.privadas[par] || [];
  let mudou = false;
  for(const [id, pacote] of Object.entries(tudo)){
    const m = await desembaralhar(pacote);
    if(!m || typeof m.txt !== 'string' || typeof m.de !== 'string' || typeof m.ts !== 'number') continue;
    if(!m.txt.trim() || m.txt.length > 600 || m.de.length > 30) continue;
    if(m.de !== dados.eu && m.de !== comEsse) continue;   /* só quem é da conversa */
    if(lista.some(x => x.id === id)) continue;
    lista.push({ id, de:m.de, txt:m.txt, ts:m.ts }); mudou = true;
  }
  return mudou;
}

async function puxarPrivadas(){
  if(!comQuem || !naTurma() || !navigator.onLine) return;
  const quem = comQuem;
  try{
    if(await puxarUmPar(await chavePar(dados.eu, quem), quem)){
      salvar(); if(comQuem === quem) desenharConversa();
    }
  }catch(e){}
}

/* =========================================================
   🚌 COMO CADA UM VAI
   ========================================================= */
const JEITOS = [
  { id:'onibus',  emoji:'🚌', nome:'De ônibus' },
  { id:'carro',   emoji:'🚗', nome:'De carro' },
  { id:'ape',     emoji:'🚶', nome:'A pé' },
  { id:'bike',    emoji:'🚲', nome:'De bicicleta' },
  { id:'carona',  emoji:'🙋', nome:'Preciso de carona' },
  { id:'dou',     emoji:'💛', nome:'Posso dar carona' }
];

function abrirTransporte(){
  const meu = (dados.jeito || {});
  const todos = {};
  dados.avisos.forEach(a => Object.entries(a.jeitos || {}).forEach(([n, j]) => {
    if(!todos[n] || (a.ts > (todos[n].ts || 0))) todos[n] = { j, ts: a.ts };
  }));
  if(dados.jeito && dados.jeito.id) todos[dados.eu] = { j: dados.jeito.id, ts: Date.now() };

  $('#jeitos').innerHTML = JEITOS.map(j => `
    <button class="tipo ${meu.id === j.id ? 'on' : ''}" data-jeito="${j.id}">
      <span>${j.emoji}</span>${j.nome}</button>`).join('');

  const porJeito = {};
  Object.entries(todos).forEach(([n, o]) => (porJeito[o.j] = porJeito[o.j] || []).push(n));
  const precisam = porJeito.carona || [];
  const dao = porJeito.dou || [];

  $('#quemComoVai').innerHTML = JEITOS.filter(j => (porJeito[j.id] || []).length).map(j => `
    <div class="tr-linha"><b>${j.emoji} ${j.nome}</b>
      <span>${porJeito[j.id].map(escapar).join(', ')}</span></div>`).join('')
    || '<p class="dica">Ninguém disse ainda como vai. Escolhe aí em cima 😊</p>';

  $('#carona').innerHTML = (precisam.length && dao.length)
    ? `<div class="tr-carona">🙋 <b>${precisam.map(escapar).join(', ')}</b> ${precisam.length > 1 ? 'precisam' : 'precisa'} de carona.<br>
       💛 <b>${dao.map(escapar).join(', ')}</b> ${dao.length > 1 ? 'podem' : 'pode'} dar. Combinem! 😊</div>`
    : precisam.length ? `<div class="tr-carona">🙋 <b>${precisam.map(escapar).join(', ')}</b> ${precisam.length > 1 ? 'precisam' : 'precisa'} de carona. Alguém pode?</div>` : '';

  document.querySelectorAll('[data-jeito]').forEach(b =>
    b.addEventListener('click', () => escolherJeito(b.dataset.jeito)));
  mostrar('transporte');
}

/* O jeito de cada um viaja pendurado num recado do mural: assim não
   precisa de mais um canto no banco, e some junto quando o recado sair. */
async function escolherJeito(id){
  dados.jeito = dados.jeito && dados.jeito.id === id ? {} : { id, ts: Date.now() };
  salvar();
  const marca = dados.avisos.find(a => a.tipo === 'recado' && a.de === dados.eu) || dados.avisos[0];
  if(marca){
    marca.jeitos = marca.jeitos || {};
    if(dados.jeito.id) marca.jeitos[dados.eu] = dados.jeito.id;
    else delete marca.jeitos[dados.eu];
    marca.v = (marca.v || 0) + 1;
    salvar(); mandarPraTurma(marca);
  }
  abrirTransporte();
  aviso(dados.jeito.id ? 'A turma já sabe como tu vai 🚌' : 'Tirado');
}

/* =========================================================
   🌧️ VAI CHOVER NA SAÍDA?
   Open-Meteo: de graça e sem chave nenhuma.
   ========================================================= */
const CEUS = {
  0:['☀️','céu limpo'], 1:['🌤️','quase limpo'], 2:['⛅','meio nublado'], 3:['☁️','nublado'],
  45:['🌫️','neblina'], 48:['🌫️','neblina'],
  51:['🌦️','chuvisco'], 53:['🌦️','chuvisco'], 55:['🌦️','chuvisco'],
  61:['🌧️','chuva fraca'], 63:['🌧️','chuva'], 65:['🌧️','chuva forte'],
  66:['🌨️','chuva gelada'], 67:['🌨️','chuva gelada'],
  71:['❄️','neve'], 73:['❄️','neve'], 75:['❄️','neve'], 77:['❄️','neve'],
  80:['🌦️','pancada'], 81:['🌧️','pancada'], 82:['⛈️','chuvarada'],
  85:['🌨️','neve'], 86:['🌨️','neve'],
  95:['⛈️','trovoada'], 96:['⛈️','trovoada'], 99:['⛈️','trovoada']
};

const QUANDOS = [
  { id:'hoje',   emoji:'🌤️', nome:'Hoje',            dias:1  },
  { id:'amanha', emoji:'🌅', nome:'Amanhã',          dias:2  },
  { id:'depois', emoji:'📆', nome:'Depois de amanhã', dias:3  },
  { id:'semana', emoji:'🗓️', nome:'1 semana',        dias:7,  lista:true },
  { id:'mes',    emoji:'📅', nome:'1 mês',           dias:16, lista:true }
];
let quandoEscolhido = 'hoje';

const DIAS_CURTOS = ['dom','seg','ter','qua','qui','sex','sáb'];

function desenharBotoesDoTempo(){
  const barra = $('#quandoTempo');
  if(!barra) return;
  barra.innerHTML = QUANDOS.map(q => `
    <button class="filtro ${q.id === quandoEscolhido ? 'on' : ''}" data-quando="${q.id}">
      ${q.emoji} ${q.nome}</button>`).join('');
  barra.querySelectorAll('[data-quando]').forEach(b =>
    b.addEventListener('click', () => { quandoEscolhido = b.dataset.quando; verOTempo(); }));
}

const oQuando = () => QUANDOS.find(q => q.id === quandoEscolhido) || QUANDOS[0];

async function verOTempo(){
  const caixa = $('#tempoSaida');
  if(!caixa) return;
  const q = oQuando();
  const hora = (dados.horaSaida || '17:30');
  $('#horaSaida').value = hora;
  /* a hora da saída só importa num dia só; na lista o dia é inteiro */
  $('#campoHoraSaida').classList.toggle('escondido', !!q.lista);
  desenharBotoesDoTempo();

  dados.tempo = dados.tempo || {};
  const marca = q.lista ? q.id : q.id + '|' + hora;
  const guardado = dados.tempo[marca];
  /* uma hora de validade: o tempo não muda de minuto em minuto, e a
     internet da escola agradece */
  if(guardado && Date.now() - guardado.quando < 3600000){ desenharTempo(guardado); return; }

  caixa.innerHTML = '<p class="dica">Vendo o tempo... 🛰️</p>';
  const onde = dados.ondeEstou || await ondeEstou(9000);
  if(!onde){
    caixa.innerHTML = `<p class="dica">Pra saber o tempo, o site precisa ver onde tu está.
      <button class="bt" id="btPermitirGPS" style="margin-top:8px">📍 Deixar ver</button></p>`;
    const b = document.getElementById('btPermitirGPS');
    if(b) b.addEventListener('click', () => { dados.ondeEstou = null; verOTempo(); });
    return;
  }
  dados.ondeEstou = onde;

  try{
    const pedido = q.lista
      ? 'daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max'
      : 'hourly=temperature_2m,precipitation_probability,weather_code';
    const r = await fetch('https://api.open-meteo.com/v1/forecast' +
      `?latitude=${onde.lat}&longitude=${onde.lon}&${pedido}&timezone=auto&forecast_days=${q.dias}`);
    if(!r.ok) throw new Error('HTTP ' + r.status);
    const t = await r.json();

    let dado;
    if(q.lista){
      const d = t.daily || {};
      dado = { tipo:'lista', quando: Date.now(), qual: q.id, onde,
        dias: (d.time || []).map((iso, i) => ({
          iso,
          codigo: d.weather_code[i],
          max: Math.round(d.temperature_2m_max[i]),
          min: Math.round(d.temperature_2m_min[i]),
          chuva: d.precipitation_probability_max ? d.precipitation_probability_max[i] : null
        })) };
    }else{
      const i = acharAHora(t.hourly.time || [], q.dias - 1, hora);
      dado = { tipo:'dia', quando: Date.now(), qual: q.id, hora, onde,
        dia: (t.hourly.time || [])[i] || '',
        temp: Math.round(t.hourly.temperature_2m[i]),
        chuva: t.hourly.precipitation_probability[i],
        codigo: t.hourly.weather_code[i] };
    }
    dados.tempo[marca] = dado;
    salvar(); desenharTempo(dado);
  }catch(e){
    if(guardado) desenharTempo(guardado);
    else caixa.innerHTML = '<p class="dica">Não consegui ver o tempo agora 😕 tenta de novo daqui a pouco.</p>';
  }
}

/* acha a hora certa DO DIA certo: a lista vem seguida, um dia
   depois do outro, então o dia 2 começa na posição 48 */
function acharAHora(horas, pulaDias, hora){
  const comeco = pulaDias * 24;
  const alvo = hora.slice(0,2) + ':00';
  for(let i = comeco; i < Math.min(horas.length, comeco + 24); i++)
    if(horas[i].slice(11,16) === alvo) return i;
  return Math.min(comeco, horas.length - 1);
}

function conselhoDoTempo(chuva, temp){
  if(chuva >= 60) return '☔ LEVA GUARDA-CHUVA!';
  if(chuva >= 30) return '🌂 Pode chover, leva por garantia';
  if(temp <= 13)  return '🧥 Leva casaco, vai esfriar';
  if(temp >= 30)  return '🥤 Vai fazer calor, leva água';
  return '😎 Dia bom, pode ir tranquilo';
}

function desenharTempo(t){
  const caixa = $('#tempoSaida');
  if(!caixa || !t) return;

  if(t.tipo === 'lista'){
    const molhados = t.dias.filter(d => (d.chuva || 0) >= 50).length;
    caixa.innerHTML = `
      <div class="resumo-tempo">
        ${molhados ? `<b>☔ ${molhados} dia${molhados > 1 ? 's' : ''} com cara de chuva</b>`
                   : '<b>😎 Nenhum dia com cara de chuva</b>'}
      </div>
      <div class="dias-tempo">
        ${t.dias.map((d, i) => {
          const [emoji, ceu] = CEUS[d.codigo] || ['🌡️',''];
          const data = new Date(d.iso + 'T12:00');
          const nome = i === 0 ? 'Hoje' : i === 1 ? 'Amanhã'
            : `${DIAS_CURTOS[data.getDay()]} ${data.getDate()}/${String(data.getMonth()+1).padStart(2,'0')}`;
          return `
            <div class="dia-tempo ${(d.chuva || 0) >= 50 ? 'molhado' : ''}">
              <b class="dia-nome">${nome}</b>
              <span class="dia-emoji" title="${ceu}">${emoji}</span>
              <span class="dia-graus">${d.max}° <small>${d.min}°</small></span>
              <span class="dia-chuva">${d.chuva == null ? '' : d.chuva + '%'}</span>
            </div>`;
        }).join('')}
      </div>
      ${t.qual === 'mes' ? `
        <p class="dica" style="margin-top:12px">📅 <b>Um mês inteiro não dá.</b> O site do tempo
        só enxerga <b>16 dias</b> pra frente — e depois de uns 7 dias já é mais chute do que
        conta. Perto do dia, olha de novo.</p>`
      : `<p class="dica" style="margin-top:12px">Quanto mais longe o dia, mais o tempo muda de
        ideia. Vale olhar de novo na véspera.</p>`}`;
    return;
  }

  const [emoji, ceu] = CEUS[t.codigo] || ['🌡️',''];
  const q = QUANDOS.find(x => x.id === t.qual) || QUANDOS[0];
  caixa.innerHTML = `
    <div class="tempo-caixa">
      <div class="tempo-emoji">${emoji}</div>
      <div class="tempo-txt"><b>${conselhoDoTempo(t.chuva, t.temp)}</b>
        <small>${q.nome} às ${t.hora} · ${t.temp}° · ${ceu} · ${t.chuva}% de chuva</small></div>
    </div>
    ${t.qual !== 'hoje' ? `<p class="dica" style="margin-top:12px">O tempo ainda pode mudar de
      ideia até lá. Olha de novo na véspera 😉</p>` : ''}`;
}

function ondeEstou(limite){
  return new Promise(res => {
    if(!navigator.geolocation) return res(null);
    let pronto = false;
    const acabou = v => { if(!pronto){ pronto = true; res(v); } };
    setTimeout(() => acabou(null), limite || 9000);
    navigator.geolocation.getCurrentPosition(
      pos => acabou({ lat:+pos.coords.latitude.toFixed(3), lon:+pos.coords.longitude.toFixed(3) }),
      () => acabou(null), { enableHighAccuracy:false, timeout: limite || 9000, maximumAge: 600000 });
  });
}

/* =========================================================
   🎂 ANIVERSÁRIOS · 🔔 AVISO NA VÉSPERA DA PROVA
   ========================================================= */
function diasDoAno(iso){
  const dias = diasAte(iso);
  if(dias === null) return null;
  if(dias >= 0) return dias;
  /* já passou este ano: conta pro ano que vem */
  const [a,m,d] = iso.split('-').map(Number);
  const hoje = new Date(); hoje.setHours(0,0,0,0);
  let prox = new Date(hoje.getFullYear(), m - 1, d);
  if(prox < hoje) prox = new Date(hoje.getFullYear() + 1, m - 1, d);
  return Math.round((prox - hoje) / 86400000);
}

function desenharAvisosDoTopo(){
  const caixa = $('#avisosTopo');
  if(!caixa) return;
  const partes = [];

  /* provas de amanhã ou de hoje */
  dados.avisos.filter(a => a.tipo === 'prova' && a.data).forEach(a => {
    const d = diasAte(a.data);
    if(d === 0 || d === 1) partes.push(`
      <div class="topo-aviso prova">
        <b>${d === 0 ? '📝 PROVA HOJE!' : '🔔 Prova amanhã!'}</b>
        <span>${escapar(a.txt).slice(0,80)}</span>
      </div>`);
  });

  /* aniversários desta semana */
  dados.avisos.filter(a => a.tipo === 'aniver' && a.data).forEach(a => {
    const d = diasDoAno(a.data);
    if(d !== null && d <= 7) partes.push(`
      <div class="topo-aviso aniver">
        <b>🎂 ${d === 0 ? 'É HOJE!' : d === 1 ? 'Amanhã!' : `Faltam ${d} dias`}</b>
        <span>${escapar(a.txt).slice(0,80)}</span>
      </div>`);
  });

  caixa.innerHTML = partes.join('');
  caixa.classList.toggle('escondido', !partes.length);

  /* e um aviso no celular, uma vez por dia por prova */
  avisarDaProva();
}

async function avisarDaProva(){
  if(!('Notification' in window)) return;
  const hoje = new Date().toDateString();
  const provas = dados.avisos.filter(a => a.tipo === 'prova' && a.data && diasAte(a.data) === 1);
  if(!provas.length) return;
  dados.avisou = dados.avisou || {};
  const novas = provas.filter(p => dados.avisou[p.id] !== hoje);
  if(!novas.length) return;

  if(Notification.permission === 'default'){
    try{ await Notification.requestPermission(); }catch(e){ return; }
  }
  if(Notification.permission !== 'granted') return;
  novas.forEach(p => {
    dados.avisou[p.id] = hoje;
    try{ new Notification('🔔 Prova amanhã!', { body: p.txt.slice(0,120), tag: 'prova-' + p.id }); }catch(e){}
  });
  salvar();
}
