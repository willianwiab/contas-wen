/* =========================================================
   caca.js — 🗺️ Caça ao Tesouro

   A ideia: alguém esconde pistas em lugares DE VERDADE e
   outra pessoa tem que ir até lá pra achar.

   O truque que faz isto funcionar sem servidor nenhum:
   a caça inteira (nome, pistas, coordenadas) cabe dentro do
   LINK. Quem cria manda o link pelo zap; quem recebe abre e
   joga. Nada é guardado em lugar nenhum além do aparelho de
   cada um.

   Por isso as fotos NÃO entram no link: elas fariam o link
   virar um monstro de dez mil letras que nenhum aplicativo
   de mensagem aceita.
   ========================================================= */

const VERSAO = '1.0.0';
const CHAVE = 'caca-ao-tesouro:v1';

/* Quão perto precisa chegar pra a pista abrir. O GPS de celular
   erra uns 10–20 metros em dia bom, então "difícil" já é bem
   apertado — abaixo disso o jogo ficaria injusto. */
const DIFICULDADES = {
  facil:   { nome:'Fácil',   metros:45, emoji:'🐣' },
  medio:   { nome:'Médio',   metros:25, emoji:'🧭' },
  dificil: { nome:'Difícil', metros:15, emoji:'🔥' }
};

let dados = carregar();
let jogo = null;        // partida em andamento
let olhoGPS = null;     // watchPosition
let bussola = null;

/* ---------- guardar ---------- */
function padrao(){
  return { nome:'', cacas:[], jogadas:{}, medalhas:{}, avisouSeguranca:false };
}
function carregar(){
  try{
    const bruto = localStorage.getItem(CHAVE);
    const d = bruto ? Object.assign(padrao(), JSON.parse(bruto)) : padrao();
    if(!Array.isArray(d.cacas)) d.cacas = [];
    d.jogadas = d.jogadas || {};
    d.medalhas = d.medalhas || {};
    return d;
  }catch(e){ return padrao(); }
}
function salvar(){
  try{ localStorage.setItem(CHAVE, JSON.stringify(dados)); }
  catch(e){ aviso('A memória do aparelho encheu 😕'); }
}

/* ---------- ajudantes ---------- */
const $ = s => document.querySelector(s);
const escapar = t => String(t == null ? '' : t)
  .replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

let relogioAviso = null;
function aviso(txt, tempo){
  const t = $('#aviso');
  t.textContent = txt; t.classList.add('on');
  clearTimeout(relogioAviso);
  relogioAviso = setTimeout(() => t.classList.remove('on'), tempo || 3200);
}

/* distância em metros entre dois pontos (haversine) */
function distancia(a, b){
  const R = 6371000, rad = g => g * Math.PI / 180;
  const dLat = rad(b.lat - a.lat), dLon = rad(b.lon - a.lon);
  const x = Math.sin(dLat/2)**2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1-x));
}
/* pra que lado fica o alvo, em graus (0 = norte) */
function direcao(de, para){
  const rad = g => g * Math.PI / 180, gra = r => r * 180 / Math.PI;
  const dLon = rad(para.lon - de.lon);
  const y = Math.sin(dLon) * Math.cos(rad(para.lat));
  const x = Math.cos(rad(de.lat)) * Math.sin(rad(para.lat)) -
            Math.sin(rad(de.lat)) * Math.cos(rad(para.lat)) * Math.cos(dLon);
  return (gra(Math.atan2(y, x)) + 360) % 360;
}
const metrosBonito = m =>
  m < 1000 ? Math.round(m) + ' m' : (m/1000).toFixed(1) + ' km';

/* ---------- o link que carrega a caça inteira ----------
   Vira base64 seguro pra endereço (sem +, / nem =). */
function paraLink(caca){
  /* nomes curtos: o link fica bem menor e ainda cabe no zap */
  const enxuto = {
    n: caca.nome,
    d: caca.dificuldade,
    a: caca.autor || '',
    t: caca.tesouro || '',
    p: caca.pistas.map(p => [p.txt, +p.lat.toFixed(5), +p.lon.toFixed(5), p.dica || ''])
  };
  const json = JSON.stringify(enxuto);
  const b64 = btoa(unescape(encodeURIComponent(json)));
  return b64.replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}
function doLink(txt){
  try{
    let b64 = String(txt).replace(/-/g,'+').replace(/_/g,'/');
    while(b64.length % 4) b64 += '=';
    const o = JSON.parse(decodeURIComponent(escape(atob(b64))));
    if(!o || !Array.isArray(o.p) || !o.p.length) return null;
    const pistas = o.p.map(p => ({
      txt: String(p[0] || '').slice(0,300),
      lat: +p[1], lon: +p[2], dica: String(p[3] || '').slice(0,200)
    })).filter(p => isFinite(p.lat) && isFinite(p.lon) &&
                    Math.abs(p.lat) <= 90 && Math.abs(p.lon) <= 180);
    if(!pistas.length) return null;
    return {
      id: 'c' + Math.abs(hashDoTexto(txt)),
      nome: String(o.n || 'Caça sem nome').slice(0,60),
      dificuldade: DIFICULDADES[o.d] ? o.d : 'medio',
      autor: String(o.a || '').slice(0,40),
      tesouro: String(o.t || '').slice(0,300),
      pistas, deOutraPessoa: true
    };
  }catch(e){ return null; }
}
function hashDoTexto(t){
  let h = 0;
  for(let i = 0; i < t.length; i++){ h = (h * 31 + t.charCodeAt(i)) | 0; }
  return h;
}
const enderecoDaCaca = caca =>
  location.origin + location.pathname + '#j=' + paraLink(caca);

/* ---------- onde eu estou ---------- */
/* `agorinha` = não aceita posição guardada de antes.
   Escondendo uma pista isso é obrigatório: o celular devolvia a leitura
   de segundos atrás, e duas pistas escondidas em seguida acabavam as
   duas no MESMO lugar — o jogo ficava impossível. */
function ondeEstou(limite, agorinha){
  return new Promise(res => {
    if(!navigator.geolocation) return res(null);
    let pronto = false;
    const acabou = v => { if(!pronto){ pronto = true; res(v); } };
    setTimeout(() => acabou(null), limite || 12000);
    navigator.geolocation.getCurrentPosition(
      pos => acabou({ lat: pos.coords.latitude, lon: pos.coords.longitude, erro: pos.coords.accuracy }),
      () => acabou(null),
      { enableHighAccuracy:true, timeout: limite || 12000, maximumAge: agorinha ? 0 : 5000 }
    );
  });
}

/* =========================================================
   AS TELAS
   ========================================================= */
function mostrar(qual){
  document.querySelectorAll('.tela').forEach(t => t.classList.toggle('on', t.id === 'tela-' + qual));
  window.scrollTo(0, 0);
}

/* ---------- 🏠 início ---------- */
function desenharInicio(){
  const lista = $('#listaCacas');
  const minhas = dados.cacas.slice().sort((a,b) => (b.ts || 0) - (a.ts || 0));
  lista.innerHTML = minhas.length ? minhas.map(c => {
    const j = dados.jogadas[c.id];
    const d = DIFICULDADES[c.dificuldade] || DIFICULDADES.medio;
    return `
      <div class="cartao caca">
        <div class="caca-topo">
          <b>${escapar(c.nome)}</b>
          <span class="etiqueta">${d.emoji} ${d.nome}</span>
        </div>
        <small>${c.pistas.length} pista${c.pistas.length > 1 ? 's' : ''}${
          c.deOutraPessoa ? ' · de ' + escapar(c.autor || 'alguém') : ''}${
          j && j.terminou ? ' · 🏅 já achou!' : ''}</small>
        <div class="caca-botoes">
          <button class="bt ok" data-jogar="${c.id}">${j && j.terminou ? '🔁 Jogar de novo' : '🎯 Jogar'}</button>
          ${!c.deOutraPessoa ? `<button class="bt" data-mandar="${c.id}">📤 Mandar</button>` : ''}
          <button class="bt fraco" data-apagar="${c.id}">🗑️</button>
        </div>
      </div>`;
  }).join('') : `
    <div class="vazio">
      <div class="emojao">🗺️</div>
      <h3>Nenhuma caça ainda</h3>
      <p>Faz a tua primeira: escolhe lugares de verdade, escreve as pistas e manda o link
      pra quem tu quiser desafiar.</p>
    </div>`;

  lista.querySelectorAll('[data-jogar]').forEach(b =>
    b.addEventListener('click', () => comecarJogo(b.dataset.jogar)));
  lista.querySelectorAll('[data-mandar]').forEach(b =>
    b.addEventListener('click', () => mandarCaca(b.dataset.mandar)));
  lista.querySelectorAll('[data-apagar]').forEach(b =>
    b.addEventListener('click', () => apagarCaca(b.dataset.apagar)));

  const medalhas = Object.keys(dados.medalhas).length;
  $('#minhasMedalhas').textContent = medalhas
    ? `🏅 ${medalhas} tesouro${medalhas > 1 ? 's' : ''} achado${medalhas > 1 ? 's' : ''}`
    : '';
  $('#olaNome').textContent = dados.nome ? `Oi, ${dados.nome}!` : 'Caça ao Tesouro';
}

function apagarCaca(id){
  const c = dados.cacas.find(x => x.id === id);
  if(!c) return;
  if(!confirm(`Apagar "${c.nome}"?\n\nSe for tua e tu não tiver o link guardado, ela some pra sempre.`)) return;
  dados.cacas = dados.cacas.filter(x => x.id !== id);
  salvar(); desenharInicio();
  aviso('Caça apagada');
}

function mandarCaca(id){
  const c = dados.cacas.find(x => x.id === id);
  if(!c) return;
  const link = enderecoDaCaca(c);
  if(link.length > 7000){
    aviso('Essa caça ficou grande demais pra caber num link 😕 tira uma pista', 6000);
    return;
  }
  const texto = `🗺️ Te desafio: "${c.nome}"!\n${c.pistas.length} pistas em lugares de verdade.\nAbre aqui:\n${link}`;
  if(navigator.share){
    navigator.share({ title:'Caça ao Tesouro', text: texto }).catch(() => copiar(texto));
  }else copiar(texto);
}
function copiar(texto){
  if(navigator.clipboard) navigator.clipboard.writeText(texto)
    .then(() => aviso('Link copiado! Cola no zap 📋', 5000))
    .catch(() => prompt('Copia este link:', texto));
  else prompt('Copia este link:', texto);
}

/* ---------- ✏️ criar ---------- */
let rascunho = null;

function novaCaca(){
  rascunho = { nome:'', dificuldade:'medio', autor: dados.nome || '', tesouro:'', pistas:[] };
  $('#novoNome').value = rascunho.nome;
  $('#novoAutor').value = rascunho.autor;
  $('#novoTesouro').value = rascunho.tesouro;
  desenharCriar();
  mostrar('criar');
}

/* o que a pessoa escreve entra no rascunho na hora */
['novoNome','novoAutor','novoTesouro'].forEach(id => {
  const campo = document.getElementById(id);
  if(!campo) return;
  campo.addEventListener('input', () => {
    if(!rascunho) return;
    if(id === 'novoNome') rascunho.nome = campo.value;
    if(id === 'novoAutor') rascunho.autor = campo.value;
    if(id === 'novoTesouro') rascunho.tesouro = campo.value;
  });
});

/* Os campos NÃO são reescritos aqui: esta função roda toda vez que uma
   pista é escondida, e reescrevê-los apagava o nome que a pessoa tinha
   acabado de digitar. O que ela escreve vai direto pro rascunho. */
function desenharCriar(){
  document.querySelectorAll('[data-dif]').forEach(b =>
    b.classList.toggle('on', b.dataset.dif === rascunho.dificuldade));

  const lista = $('#listaPistas');
  lista.innerHTML = rascunho.pistas.length ? rascunho.pistas.map((p, i) => `
    <div class="cartao pista">
      <div class="pista-num">${i + 1}</div>
      <div class="pista-txt">
        <b>${escapar(p.txt)}</b>
        <small>📍 ${p.lat.toFixed(5)}, ${p.lon.toFixed(5)}${p.dica ? ' · 💡 ' + escapar(p.dica) : ''}</small>
      </div>
      <button class="bt fraco" data-tirapista="${i}">✕</button>
    </div>`).join('')
  : `<p class="dica">Nenhuma pista ainda. Vai até o lugar onde tu quer esconder a primeira e aperta o botão embaixo.</p>`;
  lista.querySelectorAll('[data-tirapista]').forEach(b => b.addEventListener('click', () => {
    rascunho.pistas.splice(+b.dataset.tirapista, 1);
    desenharCriar();
  }));

  $('#btSalvarCaca').classList.toggle('escondido', rascunho.pistas.length === 0);
}

async function porPistaAqui(){
  const bt = $('#btPorPista');
  bt.disabled = true; bt.textContent = '📍 Procurando onde tu está...';
  const onde = await ondeEstou(15000, true);   // tem que ser AQUI, agora
  bt.disabled = false; bt.textContent = '📍 Esconder uma pista AQUI';

  if(!onde){
    aviso('O GPS não respondeu. Sai pra fora e tenta de novo 🛰️', 6000);
    return;
  }
  if(onde.erro > 60){
    if(!confirm(`O GPS está impreciso agora (erra uns ${Math.round(onde.erro)} m).\n\n` +
                'A pista pode ficar no lugar errado. Esperar melhorar ou guardar assim mesmo?\n\n' +
                'OK = guardar assim · Cancelar = esperar')) return;
  }

  /* Dois pop-ups em sequência é ruim pra quem está de pé na rua com o
     celular na mão. Uma telinha só, com os dois campos à vista. */
  /* duas pistas quase no mesmo ponto deixam o jogo sem graça (a segunda
     abre junto com a primeira) — e costuma ser sinal de que o GPS não
     atualizou */
  const coladas = rascunho.pistas.find(p => distancia(p, onde) < DIFICULDADES[rascunho.dificuldade].metros);
  if(coladas && !confirm(
      `Este lugar é praticamente o mesmo da pista "${coladas.txt}" (${Math.round(distancia(coladas, onde))} m).\n\n` +
      'As duas iam abrir juntas. Anda um pouco mais longe, ou guarda assim mesmo?\n\n' +
      'OK = guardar assim · Cancelar = andar mais')) return;

  perguntarAPista(onde);
}

function perguntarAPista(onde){
  const janela = document.createElement('div');
  janela.className = 'janela'; janela.id = 'janelaPista';
  janela.innerHTML = `
    <div class="janela-caixa">
      <h2>📍 Pista ${rascunho.pistas.length + 1}</h2>
      <p class="dica" style="margin-bottom:14px">Guardei este lugar. Agora escreve a pista que leva até aqui.</p>
      <div class="campo">
        <label>A pista</label>
        <textarea id="pistaTxt" rows="2" maxlength="300"
          placeholder="Ex.: Onde a gente toma sorvete no domingo"></textarea>
      </div>
      <div class="campo">
        <label>Dica de socorro (pode deixar vazio)</label>
        <input id="pistaDica" maxlength="200" placeholder="Ex.: perto do portão azul">
      </div>
      <div class="linha-bt" style="margin:0">
        <button class="bt fraco" id="pistaCancelar">Cancelar</button>
        <button class="bt ok" id="pistaOk">Esconder aqui 📍</button>
      </div>
    </div>`;
  document.body.appendChild(janela);
  const campo = document.getElementById('pistaTxt');
  campo.focus();
  const sair = () => janela.remove();
  janela.addEventListener('click', e => { if(e.target === janela) sair(); });
  document.getElementById('pistaCancelar').addEventListener('click', sair);
  document.getElementById('pistaOk').addEventListener('click', () => {
    const txt = campo.value.trim();
    if(!txt){ aviso('Escreve a pista 😊'); campo.focus(); return; }
    rascunho.pistas.push({
      txt: txt.slice(0,300), lat: onde.lat, lon: onde.lon,
      dica: document.getElementById('pistaDica').value.trim().slice(0,200)
    });
    sair(); desenharCriar();
    aviso(`Pista ${rascunho.pistas.length} escondida aqui! 📍`, 4000);
  });
}

function salvarCaca(){
  rascunho.nome = ($('#novoNome').value || rascunho.nome).trim() || 'Caça sem nome';
  rascunho.autor = ($('#novoAutor').value || rascunho.autor).trim();
  rascunho.tesouro = ($('#novoTesouro').value || rascunho.tesouro).trim();
  if(!rascunho.pistas.length){ aviso('Esconde pelo menos uma pista 😊'); return; }

  dados.nome = rascunho.autor || dados.nome;
  const caca = Object.assign({ id:'c' + Date.now(), ts: Date.now() }, rascunho);
  dados.cacas.push(caca);
  salvar();
  rascunho = null;
  desenharInicio();
  mostrar('inicio');
  aviso('Caça guardada! Agora manda o link 📤', 5000);
  setTimeout(() => mandarCaca(caca.id), 600);
}

/* =========================================================
   🎯 JOGAR
   ========================================================= */
function comecarJogo(id){
  const caca = dados.cacas.find(c => c.id === id);
  if(!caca) return;
  if(!dados.avisouSeguranca){ mostrarRegras(() => comecarJogo(id)); return; }

  jogo = {
    caca, pista: 0, comecou: Date.now(),
    perto: DIFICULDADES[caca.dificuldade].metros,
    ultima: null, achou: [], viuDica: false
  };
  mostrar('jogar');
  desenharJogo();
  ligarGPS();
  ligarBussola();
}

function ligarGPS(){
  desligarGPS();
  if(!navigator.geolocation){
    $('#jogoDist').textContent = 'este aparelho não tem GPS 😕';
    return;
  }
  olhoGPS = navigator.geolocation.watchPosition(
    pos => {
      jogo.ultima = { lat: pos.coords.latitude, lon: pos.coords.longitude, erro: pos.coords.accuracy };
      conferirDistancia();
    },
    err => {
      $('#jogoDist').textContent = err.code === 1
        ? 'precisa deixar o site ver onde tu está 📍'
        : 'não estou achando o GPS... sai pra fora 🛰️';
    },
    { enableHighAccuracy:true, maximumAge:2000, timeout:20000 }
  );
}
function desligarGPS(){
  if(olhoGPS != null){ navigator.geolocation.clearWatch(olhoGPS); olhoGPS = null; }
}

/* a setinha só funciona se o aparelho tiver bússola; sem ela o jogo
   continua igual, só com a distância */
function ligarBussola(){
  const usar = ev => {
    const grau = ev.webkitCompassHeading != null ? ev.webkitCompassHeading
               : (ev.alpha != null ? 360 - ev.alpha : null);
    if(grau == null) return;
    jogo.norte = grau;
    apontarSeta();
  };
  const ligar = () => {
    window.addEventListener('deviceorientationabsolute', usar);
    window.addEventListener('deviceorientation', usar);
    bussola = usar;
  };
  if(typeof DeviceOrientationEvent !== 'undefined' && DeviceOrientationEvent.requestPermission){
    DeviceOrientationEvent.requestPermission().then(r => { if(r === 'granted') ligar(); }).catch(() => {});
  }else ligar();
}
function desligarBussola(){
  if(!bussola) return;
  window.removeEventListener('deviceorientationabsolute', bussola);
  window.removeEventListener('deviceorientation', bussola);
  bussola = null;
}

function desenharJogo(){
  const c = jogo.caca, p = c.pistas[jogo.pista];
  $('#jogoNome').textContent = c.nome;
  $('#jogoConta').textContent = `Pista ${jogo.pista + 1} de ${c.pistas.length}`;
  $('#jogoPista').textContent = p.txt;
  $('#jogoDica').classList.add('escondido');
  $('#btDica').classList.toggle('escondido', !p.dica);
  $('#btDica').textContent = '💡 Tô perdido, me dá uma dica';
  jogo.viuDica = false;
  $('#jogoBolinhas').innerHTML = c.pistas
    .map((_, i) => `<span class="bolinha ${i < jogo.pista ? 'feita' : i === jogo.pista ? 'agora' : ''}"></span>`).join('');
  $('#jogoDist').textContent = 'procurando o GPS... 🛰️';
  $('#termometro').className = 'termometro';
  $('#setaCaixa').classList.add('escondido');
}

function conferirDistancia(){
  if(!jogo || !jogo.ultima) return;
  const alvo = jogo.caca.pistas[jogo.pista];
  const d = distancia(jogo.ultima, alvo);
  const perto = jogo.perto;

  /* "tá quente / tá frio" — o número exato estragaria a graça, mas
     esconder tudo deixaria a criança andando à toa. Meio-termo: a
     distância aparece, mas o que guia é a cor. */
  const estado =
    d <= perto      ? 'achou' :
    d <= perto * 3  ? 'pegando-fogo' :
    d <= perto * 8  ? 'quente' :
    d <= perto * 25 ? 'morno' : 'frio';

  const recado = {
    'pegando-fogo': '🔥 TÁ PEGANDO FOGO! É bem aqui!',
    quente: '🌡️ Tá quente! Chegando...',
    morno:  '😐 Mais ou menos... continua',
    frio:   '🧊 Tá frio. É longe ainda'
  }[estado] || '';

  $('#termometro').className = 'termometro ' + estado;
  $('#jogoDist').innerHTML = estado === 'achou' ? '' :
    `<b>${recado}</b><small>${metrosBonito(d)} daqui${
      jogo.ultima.erro > 40 ? ' · GPS impreciso agora' : ''}</small>`;

  /* a setinha */
  jogo.paraOnde = direcao(jogo.ultima, alvo);
  apontarSeta();
  $('#setaCaixa').classList.toggle('escondido', estado === 'achou' || jogo.norte == null);

  if(estado === 'achou') achouAPista();
}

function apontarSeta(){
  if(!jogo || jogo.paraOnde == null || jogo.norte == null) return;
  const seta = $('#seta');
  if(seta) seta.style.transform = `rotate(${(jogo.paraOnde - jogo.norte + 360) % 360}deg)`;
}

function achouAPista(){
  const c = jogo.caca;
  jogo.achou.push(Date.now());
  vibrar([200,100,200,100,400]);
  tocarAchou();

  if(jogo.pista + 1 < c.pistas.length){
    jogo.pista++;
    const tela = $('#tela-jogar');
    tela.classList.add('piscando');
    setTimeout(() => tela.classList.remove('piscando'), 900);
    desenharJogo();
    aviso(`🎉 Achou a pista ${jogo.pista}! Agora vai pra próxima`, 5000);
    return;
  }
  terminarJogo();
}

function terminarJogo(){
  desligarGPS(); desligarBussola();
  const c = jogo.caca;
  const minutos = Math.round((Date.now() - jogo.comecou) / 60000);
  const antes = dados.jogadas[c.id];
  const recorde = !antes || !antes.minutos || minutos < antes.minutos;

  dados.jogadas[c.id] = { terminou: true, minutos: recorde ? minutos : antes.minutos, quando: Date.now() };
  dados.medalhas[c.id] = { nome: c.nome, quando: Date.now(), minutos };
  salvar();

  $('#fimNome').textContent = c.nome;
  $('#fimTesouro').textContent = c.tesouro || 'Tu achou todas as pistas! 🏆';
  $('#fimTempo').innerHTML = `Levou <b>${minutos < 1 ? 'menos de 1 minuto' : minutos + ' minuto' + (minutos > 1 ? 's' : '')}</b>${
    recorde && antes ? ' — <b>recorde novo!</b> 🏅' : ''}`;
  mostrar('fim');
  confete();
  vibrar([300,100,300,100,600]);
}

function desistirDoJogo(){
  if(!confirm('Desistir desta caça?')) return;
  desligarGPS(); desligarBussola();
  jogo = null;
  desenharInicio(); mostrar('inicio');
}

function pedirDica(){
  const p = jogo.caca.pistas[jogo.pista];
  if(!p.dica) return;
  $('#jogoDica').textContent = '💡 ' + p.dica;
  $('#jogoDica').classList.remove('escondido');
  $('#btDica').classList.add('escondido');
  jogo.viuDica = true;
}

/* ---------- barulho e tremida ---------- */
function vibrar(padrao){ try{ if(navigator.vibrate) navigator.vibrate(padrao); }catch(e){} }
function tocarAchou(){
  try{
    const c = new (window.AudioContext || window.webkitAudioContext)();
    [523, 659, 784, 1047].forEach((f, i) => {
      const o = c.createOscillator(), g = c.createGain(), t = c.currentTime + i * .12;
      o.type = 'triangle'; o.frequency.value = f;
      g.gain.setValueAtTime(.0001, t);
      g.gain.exponentialRampToValueAtTime(.3, t + .02);
      g.gain.exponentialRampToValueAtTime(.0001, t + .35);
      o.connect(g); g.connect(c.destination);
      o.start(t); o.stop(t + .4);
    });
    setTimeout(() => { try{ c.close(); }catch(e){} }, 1500);
  }catch(e){}
}
function confete(){
  const cores = ['#f59e0b','#ef4444','#22c55e','#0ea5e9','#a855f7','#ec4899'];
  for(let i = 0; i < 60; i++){
    const p = document.createElement('i');
    p.className = 'confete';
    p.style.left = Math.random() * 100 + 'vw';
    p.style.background = cores[i % cores.length];
    p.style.animationDelay = (Math.random() * .5) + 's';
    p.style.animationDuration = (2 + Math.random() * 1.5) + 's';
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 4200);
  }
}

/* ---------- 🦺 as regras de segurança ---------- */
function mostrarRegras(depois){
  mostrar('regras');
  $('#btAceitoRegras').onclick = () => {
    dados.avisouSeguranca = true; salvar();
    if(depois) depois(); else { desenharInicio(); mostrar('inicio'); }
  };
}

/* =========================================================
   RECEBER UMA CAÇA PELO LINK
   ========================================================= */
function verSeVeioCaca(){
  const marca = location.hash.match(/^#j=(.+)$/);
  if(!marca) return false;
  const caca = doLink(marca[1]);
  history.replaceState(null, '', location.pathname);   // limpa o endereço
  if(!caca){ aviso('Esse link não parece uma caça 🤔', 6000); return false; }

  const jaTem = dados.cacas.find(c => c.id === caca.id);
  if(!jaTem){
    caca.ts = Date.now();
    dados.cacas.push(caca);
    salvar();
  }
  $('#convNome').textContent = caca.nome;
  $('#convDe').textContent = caca.autor ? `de ${caca.autor}` : 'de alguém da tua turma';
  const d = DIFICULDADES[caca.dificuldade];
  $('#convDetalhe').textContent = `${caca.pistas.length} pista${caca.pistas.length > 1 ? 's' : ''} · ${d.emoji} ${d.nome} (chegar a ${d.metros} m)`;
  $('#btAceitarConv').onclick = () => comecarJogo(caca.id);
  mostrar('convite');
  return true;
}

function colarLink(){
  const t = (prompt('Cola aqui o link da caça que te mandaram:') || '').trim();
  if(!t) return;
  const marca = t.match(/#j=(.+)$/);
  const caca = doLink(marca ? marca[1] : t);
  if(!caca){ aviso('Esse link não parece uma caça 🤔', 6000); return; }
  if(!dados.cacas.find(c => c.id === caca.id)){
    caca.ts = Date.now(); dados.cacas.push(caca); salvar();
  }
  desenharInicio();
  aviso(`Caça "${caca.nome}" guardada! 🗺️`, 5000);
}

/* =========================================================
   LIGAR TUDO
   ========================================================= */
$('#btNova').addEventListener('click', novaCaca);
$('#btColar').addEventListener('click', colarLink);
$('#btRegras').addEventListener('click', () => mostrarRegras(null));
$('#btVoltarCriar').addEventListener('click', () => {
  if(rascunho && rascunho.pistas.length && !confirm('Sair sem guardar? As pistas somem.')) return;
  rascunho = null; desenharInicio(); mostrar('inicio');
});
$('#btPorPista').addEventListener('click', porPistaAqui);
$('#btSalvarCaca').addEventListener('click', salvarCaca);
$('#btDesistir').addEventListener('click', desistirDoJogo);
$('#btDica').addEventListener('click', pedirDica);
$('#btFimVoltar').addEventListener('click', () => { jogo = null; desenharInicio(); mostrar('inicio'); });
$('#btConvNao').addEventListener('click', () => { desenharInicio(); mostrar('inicio'); });
document.querySelectorAll('[data-dif]').forEach(b => b.addEventListener('click', () => {
  rascunho.dificuldade = b.dataset.dif; desenharCriar();
}));

/* o GPS não pode continuar ligado com o site fechado: gasta bateria à toa */
document.addEventListener('visibilitychange', () => {
  if(!jogo) return;
  if(document.hidden) desligarGPS();
  else ligarGPS();
});
window.addEventListener('pagehide', desligarGPS);

$('#versao').textContent = 'v' + VERSAO;
desenharInicio();
if(!verSeVeioCaca()){
  if(!dados.avisouSeguranca) mostrarRegras(null);
  else mostrar('inicio');
}

if('serviceWorker' in navigator && location.protocol.startsWith('http')){
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}
