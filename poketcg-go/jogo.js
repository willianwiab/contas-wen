/* =========================================================
   PokéTCG GO — O JOGO

   O save guarda só NÚMERO DE CARTA e quantidade. A foto, o
   nome e a raridade saem do baralho — então o save é pequeno
   e nunca fica desencontrado da API.
   ========================================================= */

const CHAVE = 'poketcg-go:v1';

const vazio = () => ({
  semente: Math.floor(Math.random() * 1e9),
  capinhas: 20,
  xp: 0, nivel: 1,
  album: {},                /* id da carta -> quantas */
  lojas: {},                /* id da loja -> quando fica pronta */
  capturadas: 0, fugiram: 0, jogadas: 0,
  som: true,
  gps: false,              /* a pessoa escolheu andar de verdade? */
  viuAvisoGps: false,
  criado: Date.now()
});

let dados = carregar();
let avisoSave = '';

function carregar(){
  try{
    const cru = localStorage.getItem(CHAVE);
    if(cru){
      const o = JSON.parse(cru);
      if(o && typeof o.capinhas === 'number')
        return Object.assign(vazio(), o, { album:o.album || {}, lojas:o.lojas || {} });
    }
  }catch(e){ /* save torto: começa limpo em vez de travar o jogo */ }
  return vazio();
}

function gravar(){
  try{ localStorage.setItem(CHAVE, JSON.stringify(dados)); }
  catch(e){ avisoSave = 'o aparelho não deixou guardar'; }
}

/* escrever-ler-apagar: é o único jeito de saber se guardar
   funciona DE VERDADE neste navegador, em vez de descobrir
   quando a pessoa perde a coleção */
function testarGuardar(){
  try{
    localStorage.setItem('poketcg-go:teste', '1');
    const leu = localStorage.getItem('poketcg-go:teste');
    localStorage.removeItem('poketcg-go:teste');
    return leu === '1';
  }catch(e){ return false; }
}

const lojaQuando = id => dados.lojas[id] || 0;
const quantas = id => dados.album[id] || 0;
const diferentes = () => Object.keys(dados.album).length;

/* ---------------------------------------------------------
   SOM

   Feito na hora, sem arquivo nenhum: um jogo que precisa
   baixar mp3 é um jogo que não abre sem internet.
   --------------------------------------------------------- */
let audio = null;
function bip(tipo){
  if(!dados.som) return;
  try{
    audio = audio || new (window.AudioContext || window.webkitAudioContext)();
    if(audio.state === 'suspended') audio.resume();
    const notas = {
      toque:  [[520, .05]],
      jogar:  [[300, .07], [440, .07]],
      treme:  [[200, .09]],
      pegou:  [[523, .09], [659, .09], [784, .14]],
      fugiu:  [[400, .1], [240, .18]],
      nivel:  [[523, .08], [659, .08], [784, .08], [1047, .2]],
      loja:   [[660, .07], [880, .11]],
      raro:   [[784, .1], [988, .1], [1319, .22]]
    }[tipo] || [[440, .06]];
    let quando = audio.currentTime;
    for(const [hz, dur] of notas){
      const o = audio.createOscillator(), g = audio.createGain();
      o.type = 'triangle';
      o.frequency.value = hz;
      g.gain.setValueAtTime(.0001, quando);
      g.gain.exponentialRampToValueAtTime(.16, quando + .012);
      g.gain.exponentialRampToValueAtTime(.0001, quando + dur);
      o.connect(g); g.connect(audio.destination);
      o.start(quando); o.stop(quando + dur + .02);
      quando += dur;
    }
  }catch(e){ /* navegador sem áudio: o jogo continua, só calado */ }
}

/* ---------------------------------------------------------
   RECADINHO NA TELA
   --------------------------------------------------------- */
let sumirRecado = null;
function recado(txt, quanto){
  const e = $('#recado');
  e.innerHTML = txt;
  e.classList.add('on');
  clearTimeout(sumirRecado);
  sumirRecado = setTimeout(() => e.classList.remove('on'), quanto || 2600);
}

/* ---------------------------------------------------------
   NÍVEL E XP
   --------------------------------------------------------- */
const xpDoNivel = n => Math.round(50 * Math.pow(n, 1.7));

function darXp(q){
  dados.xp += q;
  let subiu = 0;
  while(dados.xp >= xpDoNivel(dados.nivel)){
    dados.xp -= xpDoNivel(dados.nivel);
    dados.nivel++;
    subiu++;
    dados.capinhas += 10;
  }
  if(subiu){
    bip('nivel');
    recado(`⭐ <b>Nível ${dados.nivel}!</b><br>+${subiu * 10} capinhas`, 3400);
  }
  pintarHud();
}

function pintarHud(){
  $('#hudCapinhas').textContent = dados.capinhas;
  $('#hudCartas').textContent = diferentes();
  $('#hudNivel').textContent = dados.nivel;
  const falta = xpDoNivel(dados.nivel);
  $('#hudXp').textContent = `${dados.xp}/${falta}`;
  $('#hudBarra').style.width = Math.min(100, dados.xp / falta * 100) + '%';
}

/* =========================================================
   📍 ANDAR DE VERDADE

   Com o GPS ligado, quem move o boneco é a rua. A localização
   não sai do aparelho — este jogo não tem servidor, não existe
   pra onde mandar.
   ========================================================= */
function pintarGps(){
  const t = $('#hudGps');
  if(!gps.ligado){ t.classList.remove('on', 'ruim'); return; }
  t.classList.add('on');
  if(gps.erro){
    t.classList.add('ruim');
    $('#hudGpsTxt').textContent = '📍 ' + gps.erro;
  }else if(!gps.origem){
    t.classList.remove('ruim');
    $('#hudGpsTxt').innerHTML =
      '<span class="girando">📡</span> procurando onde cê está… (dá pra andar tocando)';
  }else{
    const ruim = gps.precisao > 40;
    t.classList.toggle('ruim', ruim);
    $('#hudGpsTxt').textContent = ruim
      ? `📍 sinal fraco (erro de ~${gps.precisao} m) — tenta sair de dentro de casa`
      : `📍 andando de verdade · precisão ~${gps.precisao} m`;
  }
  if(document.querySelector('#folha-ajustes.on')) pintarAjustes();
}

function trocarGps(){
  if(gps.ligado){
    desligarGps(pintarGps);
    dados.gps = false;
    gravar();
    recado('🗺️ Voltou pro mapa. Toca pra andar.', 3000);
    pintarAjustes();
    return;
  }
  dados.gps = true;
  dados.viuAvisoGps = true;
  gravar();
  ligarGps(pintarGps);
  recado('📍 Ligando o GPS… pode demorar uns segundos.', 4000);
  pintarAjustes();
}

function blocoGps(){
  if(!temGps())
    return `<div class="bloco"><h3>📍 Andar de verdade</h3>
      <p>Este navegador não tem localização, então só dá pra jogar no mapa mesmo.</p></div>`;

  const ligado = gps.ligado;
  return `<div class="bloco"><h3>📍 Andar de verdade</h3>
    <p>Igual ao Pokémon GO: o boneco anda <b>quando cê anda na rua</b>, e as cartas
       nascem em volta de onde cê está de verdade.</p>
    <div class="linha"><span><b>Usar a minha localização</b>
      <small>${ligado ? 'ligado — quem manda é a rua' : 'desligado — cê anda tocando no mapa'}</small></span>
      <button class="liga ${ligado ? 'on' : ''}" onclick="trocarGps()">
        ${ligado ? '📍 ligado' : '🗺️ desligado'}</button></div>
    ${ligado && gps.erro ? `<div class="aviso" style="margin-top:10px">
        ⚠️ <b>${escapar(gps.erro)}</b><br>
        ${gps.erro.includes('deixou') ? 'Pra liberar: nos ajustes do navegador, procura este site e deixa a localização.'
          : 'Sinal de GPS costuma ser ruim dentro de casa. Tenta perto de uma janela ou na rua.'}
        <br><br>Enquanto isso <b>dá pra jogar normal</b>: é só tocar no mapa pra andar.
      </div>` : ''}
    ${ligado && !gps.erro && gps.origem ? `<div class="linha">
        <span>precisão agora</span><b>~${gps.precisao} m</b></div>
      <div class="linha"><span>andou de verdade</span>
        <b>${Math.round(andou / PX_POR_METRO)} m</b></div>` : ''}
    <div class="aviso" style="margin-top:10px">
      🚸 <b>Olha pra frente, não pro celular.</b> Não atravessa rua jogando, e combina com
      um adulto até onde cê pode ir. O jogo espera — carro não.
    </div>
    <p style="color:var(--tinta3);font-size:.74rem;margin-top:9px">
      A tua localização <b>não sai do aparelho</b>. Este jogo não tem servidor nenhum:
      não existe pra onde mandar.</p></div>`;
}

/* =========================================================
   A CAPTURA

   O anel aperta e abre sem parar. Quanto mais perto do alvo
   na hora de jogar, mais chance. Não é só sorte: dá pra ficar
   bom nisso.
   ========================================================= */
const ALVO_R = 132;
let cap = null;        /* a captura que está acontecendo */
let anelRaf = null;

function abrirCaptura(solta){
  if(dados.capinhas <= 0){
    recado('🛡️ Sem capinha! Passa numa <b>lojinha</b> 🏪 pra pegar mais.', 3200);
    return;
  }
  const c = solta.carta, f = faixa(c);
  cap = { solta, carta:c, faixa:f, escapou:0, jogando:false, t0:performance.now() };

  $('#capNome').textContent = c.nome;
  $('#capSub').innerHTML =
    `<span class="selo" style="background:${f.cor};color:#1b2630">${f.sim} ${f.nome}</span>` +
    (c.colecao ? ` &nbsp;${c.colecao}${c.numero ? ' · nº ' + c.numero : ''}` : '');
  $('#capCarta').innerHTML = c.foto
    ? `<img src="${c.foto}" alt="${c.nome}" onerror="semFoto(this)">`
    : `<div class="vazia">🎴</div>`;
  $('#capCarta').className = '';
  $('#alvo').style.cssText = `width:${ALVO_R * 2}px;height:${ALVO_R * 2}px`;
  $('#capDica').textContent = 'joga quando o anel encostar no tracejado';
  $('#btJogar').disabled = false;
  $('#btJogar').textContent = 'Jogar a capinha';
  $('#captura').classList.add('on');
  bip('toque');
  anelRaf = requestAnimationFrame(girarAnel);
}

/* se a foto não vem (sem internet), mostra o verso em vez de
   um quadrado quebrado */
function semFoto(img){
  img.parentElement.innerHTML = '<div class="vazia">🎴</div>';
}

function raioDoAnel(t){
  /* vai de 245 até 62 e volta — 1,5 s o ciclo todo. O maior tem
     que ser bem maior que o alvo, senão não dá pra errar */
  const fase = ((t - cap.t0) % 1500) / 1500;
  const onda = Math.abs(Math.sin(fase * Math.PI));
  return 62 + (245 - 62) * (1 - onda);
}

function girarAnel(t){
  if(!cap){ return; }
  anelRaf = requestAnimationFrame(girarAnel);
  if(cap.jogando) return;
  const r = raioDoAnel(t);
  const e = $('#anel');
  e.style.cssText = `width:${r * 2}px;height:${r * 2}px`;
  const perto = Math.abs(r - ALVO_R) < 20;
  e.style.borderColor = perto ? '#5ee89a' : '#fff';
}

function qualidade(){
  const r = raioDoAnel(performance.now());
  const erro = Math.abs(r - ALVO_R);
  return Math.max(0, 1 - erro / 125);        /* 1 = em cima do alvo */
}

async function jogarCapinha(){
  if(!cap || cap.jogando) return;
  if(dados.capinhas <= 0){ recado('🛡️ Acabou a capinha!'); return; }

  const q = qualidade();
  cap.jogando = true;
  $('#btJogar').disabled = true;
  dados.capinhas--;
  dados.jogadas++;
  pintarHud();
  gravar();
  bip('jogar');

  const capi = $('#capinha');
  capi.className = '';
  void capi.offsetWidth;        /* reinicia a animação */
  capi.className = 'vai';

  $('#capDica').textContent = q > .85 ? '🎯 Mira perfeita!' : q > .5 ? '👍 Boa jogada' : 'Jogada meia-boca…';
  await espera(520);

  /* a chance: a raridade manda, a mira ajuda bastante */
  const chance = Math.min(.95, cap.faixa.pega * (0.7 + q * 0.8));
  const pegou = Math.random() < chance;
  const tremidas = pegou ? (q > .85 ? 1 : 2) : 1 + Math.floor(Math.random() * 3);

  for(let i = 0; i < tremidas; i++){
    const el = $('#capCarta');
    el.className = '';
    void el.offsetWidth;
    el.className = 'treme';
    bip('treme');
    $('#capDica').textContent = '…' + '•'.repeat(i + 1);
    await espera(460);
  }

  capi.className = '';
  if(pegou) return deuBom();
  return deuRuim();
}

function deuBom(){
  const c = cap.carta, f = cap.faixa;
  const antes = quantas(c.id);
  dados.album[c.id] = antes + 1;
  dados.capturadas++;
  $('#capCarta').className = 'pegou';
  bip(f.n >= 4 ? 'raro' : 'pegou');
  $('#capDica').innerHTML = antes
    ? `<b>Peguei!</b> (cê já tinha ${antes} — essa é repetida pra trocar)`
    : `<b>CARTA NOVA!</b> 🎉`;
  darXp(f.xp + (antes ? 0 : Math.round(f.xp / 2)));
  tirarSolta(cap.solta.chave);
  gravar();
  setTimeout(() => {
    fecharCaptura();
    recado(`${f.sim} <b>${c.nome}</b>${antes ? ' (repetida)' : ' — carta nova!'}`, 3000);
  }, 850);
}

function deuRuim(){
  cap.escapou++;
  bip('fugiu');
  /* quanto mais rara, mais fácil ela sumir de vez — senão dava
     pra ficar martelando a coroa até pegar */
  const fugiuDeVez = Math.random() < (0.12 + cap.faixa.n * 0.07) || dados.capinhas <= 0;
  if(fugiuDeVez){
    $('#capCarta').className = 'fugiu';
    $('#capDica').innerHTML = dados.capinhas <= 0
      ? '<b>Acabou a capinha</b> e ela foi embora…'
      : '<b>Ela voou!</b> Essa se foi.';
    dados.fugiram++;
    tirarSolta(cap.solta.chave);
    gravar();
    setTimeout(fecharCaptura, 1100);
    return;
  }
  $('#capDica').innerHTML = '<b>Escapou!</b> Tenta outra vez.';
  $('#btJogar').disabled = false;
  $('#btJogar').textContent = 'Jogar de novo';
  cap.jogando = false;
  cap.t0 = performance.now();
}

function fecharCaptura(){
  $('#captura').classList.remove('on');
  cancelAnimationFrame(anelRaf);
  cap = null;
  pintarSoltas();
  pintarLojas();
}

function desistir(){
  if(!cap || cap.jogando) return;
  recado('Deixou essa pra lá.');
  fecharCaptura();
}

const espera = ms => new Promise(f => setTimeout(f, ms));

/* =========================================================
   A LOJINHA
   ========================================================= */
function usarLoja(loja){
  const agora = Date.now();
  const pronta = lojaQuando(loja.id);
  if(agora < pronta){
    const falta = Math.ceil((pronta - agora) / 1000);
    const m = Math.floor(falta / 60), s = falta % 60;
    recado(`🏪 <b>${loja.nome}</b> está fechada.<br>Volta em ${m}:${String(s).padStart(2,'0')}`, 2800);
    return;
  }
  dados.lojas[loja.id] = agora + LOJA_ESPERA;
  const ganhou = 6 + dados.nivel;
  dados.capinhas += ganhou;
  bip('loja');
  darXp(15);

  /* de vez em quando vem um pacotinho: três cartas direto no
     álbum, sem precisar capturar */
  let extra = '';
  if(Math.random() < 0.3){
    const novas = [];
    for(let i = 0; i < 3; i++){
      const c = sortearCarta();
      if(!c) break;
      const antes = quantas(c.id);
      dados.album[c.id] = antes + 1;
      darXp(Math.round(faixa(c).xp / 2));
      novas.push(`${faixa(c).sim} ${c.nome}${antes ? '' : ' <b>(nova!)</b>'}`);
    }
    if(novas.length) extra = `<br>🎁 <b>Pacotinho!</b><br>${novas.join('<br>')}`;
  }

  gravar();
  pintarHud();
  pintarLojas();
  recado(`🏪 <b>${loja.nome}</b><br>+${ganhou} capinhas${extra}`, extra ? 5200 : 2800);
}

/* =========================================================
   O TOQUE NO MAPA
   ========================================================= */
function tocouNoMapa(ev){
  if($('#captura').classList.contains('on')) return;
  if(document.querySelector('.folha.on')) return;

  const alvoSolta = ev.target.closest && ev.target.closest('.solta');
  if(alvoSolta){
    const s = soltaPorChave(alvoSolta.dataset.solta);
    if(!s) return;
    if(pertoDe(s.x, s.y)) return abrirCaptura(s);
    irPara(s.x, s.y);
    recado('Longe ainda — tô indo até lá 🏃');
    return;
  }

  const alvoLoja = ev.target.closest && ev.target.closest('.loja');
  if(alvoLoja){
    const l = lojas.find(x => x.id === alvoLoja.dataset.loja);
    if(!l) return;
    if(pertoDe(l.x, l.y)) return usarLoja(l);
    irPara(l.x, l.y);
    recado('Indo pra lojinha 🏪');
    return;
  }

  const p = doToque(ev);
  irPara(p.x, p.y);
}

/* =========================================================
   O ÁLBUM
   ========================================================= */
let filtro = 'todas';
let mostrando = 120;          /* 750 cartas de uma vez travava o celular */

function pintarAlbum(){
  const total = BARALHO.length;
  const tenho = diferentes();
  $('#albConta').textContent = tenho;
  $('#albTotal').textContent = total;
  $('#albBarra').style.width = (total ? tenho / total * 100 : 0) + '%';

  const repetidas = Object.values(dados.album).reduce((s, n) => s + Math.max(0, n - 1), 0);
  $('#albExtra').innerHTML =
    `${(total ? tenho / total * 100 : 0).toFixed(1)}% do baralho` +
    ` · <b>${repetidas}</b> repetida${repetidas === 1 ? '' : 's'} pra trocar` +
    ` · ${dados.capturadas} capturada${dados.capturadas === 1 ? '' : 's'}`;

  const fs = [['todas','Todas'], ['tenho','✅ Que eu tenho'], ['falta','🔒 Que faltam'],
    ['rep','♻️ Repetidas']];
  for(const f of FAIXAS) if(f) fs.push(['f' + f.n, `${f.sim} ${f.nome}`]);
  $('#albFiltros').innerHTML = fs.map(([id, nome]) =>
    `<button class="${filtro === id ? 'on' : ''}" onclick="filtrarAlbum('${id}')">${nome}</button>`).join('');

  const lista = BARALHO.filter(c => {
    const q = quantas(c.id);
    if(filtro === 'tenho') return q > 0;
    if(filtro === 'falta') return q === 0;
    if(filtro === 'rep')   return q > 1;
    if(filtro[0] === 'f')  return c.faixa === Number(filtro.slice(1));
    return true;
  });

  if(!lista.length){
    $('#albGrade').innerHTML = `<div class="nada">Nada aqui ainda.<br>
      Sai andando pelo mapa que carta aparece sozinha. 🎴</div>`;
    return;
  }

  const pedaco = lista.slice(0, mostrando);
  $('#albGrade').innerHTML = pedaco.map(c => {
    const q = quantas(c.id);
    const f = faixa(c);
    if(!q) return `<div class="mini falta" onclick="verFicha('${c.id}')">
        <div class="vazio">🔒</div><span class="nm">${f.sim}</span></div>`;
    return `<div class="mini" onclick="verFicha('${c.id}')">
      <img src="${c.foto}" alt="${escapar(c.nome)}" loading="lazy"
           onerror="this.outerHTML='<div class=\\'vazio\\'>🎴</div>'">
      ${q > 1 ? `<span class="qtd">×${q}</span>` : ''}
      <span class="nm">${escapar(c.nome)}</span></div>`;
  }).join('')
  + (lista.length > mostrando
      ? `<div class="nada">mostrando ${mostrando} de ${lista.length}
         <br><button class="liga" style="margin-top:10px;background:var(--azul);color:#fff"
         onclick="verMais()">ver mais 120</button></div>`
      : '');
}

function filtrarAlbum(f){ filtro = f; mostrando = 120; pintarAlbum(); }
function verMais(){ mostrando += 120; pintarAlbum(); }

const escapar = s => String(s).replace(/[&<>"']/g,
  m => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m]));

function verFicha(id){
  const c = cartaPorId(id);
  if(!c) return;
  const f = faixa(c), q = quantas(id);
  $('#fichaCaixa').innerHTML =
    (q ? `<img src="${c.grande}" alt="${escapar(c.nome)}"
             onerror="this.src='${c.foto}'">`
       : `<div class="vazio" style="aspect-ratio:245/342;border-radius:9px;background:var(--linha);
            display:grid;place-items:center;font-size:3rem;margin-bottom:12px">🔒</div>`) +
    `<h3>${q ? escapar(c.nome) : 'Carta que falta'}</h3>
     <div class="meta">
       <span class="selo" style="background:${f.cor};color:#1b2630">${f.sim} ${f.nome}</span><br>
       ${q ? `${escapar(c.colecao)}${c.numero ? ' · nº ' + escapar(c.numero) : ''}
              ${c.hp ? ' · ' + escapar(c.hp) + ' HP' : ''}<br>
              <b>cê tem ${q}</b>${q > 1 ? ` (${q - 1} pra trocar)` : ''}`
            : 'Essa cê ainda não achou.'}
     </div>
     <button class="fechar" onclick="fecharFicha()">Fechar</button>`;
  $('#ficha').classList.add('on');
}
const fecharFicha = () => $('#ficha').classList.remove('on');

/* =========================================================
   AS TELAS
   ========================================================= */
function abrir(qual){
  document.querySelectorAll('.folha').forEach(f => f.classList.remove('on'));
  $('#folha-' + qual).classList.add('on');
  if(qual === 'album') pintarAlbum();
  if(qual === 'ajuda') pintarAjuda();
  if(qual === 'ajustes') pintarAjustes();
  bip('toque');
}
const fechar = () => document.querySelectorAll('.folha').forEach(f => f.classList.remove('on'));

function pintarAjuda(){
  $('#corpoAjuda').innerHTML = `
    <div class="bloco"><h3>🏃 Andar</h3>
      <p>Toca em qualquer lugar do mapa e o teu boneco vai até lá.
         A tela anda com ele.</p></div>
    <div class="bloco"><h3>📍 Ou andar de verdade</h3>
      <p>Em ⚙️ Ajustes dá pra ligar o <b>GPS</b>: aí o boneco só anda quando
         <b>cê anda na rua</b>, igual ao Pokémon GO, e as cartas nascem em volta
         de onde cê está mesmo.</p>
      <p>🚸 Se ligar: <b>olha pra frente, não pro celular</b>, e combina com um adulto
         até onde dá pra ir.</p></div>
    <div class="bloco"><h3>🎴 Achar carta</h3>
      <p>As cartas nascem sozinhas em volta de cê e ficam flutuando no chão.
         <b>Quanto mais rara, mais ela brilha</b> — a de coroa 👑 pisca.</p>
      <p>Carta <b>apagada</b> está longe: toca nela que cê anda até lá.
         Carta <b>acesa</b> já dá pra capturar.</p></div>
    <div class="bloco"><h3>🛡️ Capturar</h3>
      <p>O anel branco aperta e abre sem parar. Joga a capinha
         <b>quando ele encostar no tracejado</b> — aí ele fica verde e a chance sobe muito.</p>
      <p>Cada jogada gasta uma capinha. A carta pode escapar e, se escapar,
         pode voar de vez — <b>quanto mais rara, mais fácil ela sumir</b>.</p></div>
    <div class="bloco"><h3>🏪 Lojinha</h3>
      <p>As seis bolinhas azuis do mapa dão capinha. Cada uma fecha por
         <b>3 minutos</b> depois de usada, e de vez em quando vem um
         <b>pacotinho</b> com três cartas de graça.</p></div>
    <div class="bloco"><h3>⭐ Nível</h3>
      <p>Capturar dá XP, e carta nova dá mais que repetida. Cada nível novo
         te dá <b>10 capinhas</b> e faz a lojinha dar mais.</p></div>
    <div class="bloco"><h3>🎴 As raridades</h3>
      ${FAIXAS.filter(Boolean).map(f => `<div class="linha">
        <span><b style="color:${f.cor}">${f.sim} ${f.nome}</b>
        <small>chance base de pegar: ${Math.round(f.pega * 100)}% · ${f.xp} XP</small></span>
        </div>`).join('')}</div>
    <div class="bloco"><h3>🃏 De onde vêm as cartas</h3>
      <p>São <b>cartas de Pokémon de verdade</b>: nome, foto, coleção e raridade vêm da
         <b>pokemontcg.io</b>, a mesma do ButterPoke.</p>
      <p>As fotos <b>não estão guardadas aqui</b> — a página aponta pro servidor deles,
         porque a arte da carta é da empresa do Pokémon, não nossa.
         Então <b>sem internet as cartas aparecem com o verso</b> 🎴, mas o jogo roda.</p>
      <p style="color:var(--tinta3);font-size:.76rem">Teu baralho tem
         <b>${BARALHO.length}</b> cartas${deOndeVeio === 'guardado' ? ' (lidas do aparelho)' : ''}.</p></div>`;
}

function pintarAjustes(){
  const ok = testarGuardar();
  $('#corpoAjustes').innerHTML =
    blocoGps() +
    blocoInstalar() +
    (!ok || avisoSave ? `<div class="bloco"><div class="aviso">
        ⚠️ <b>Este navegador não está deixando guardar.</b> Dá pra jogar, mas o teu
        álbum <b>não vai ficar salvo</b> quando cê fechar.
        ${avisoSave ? '<br><small>' + escapar(avisoSave) + '</small>' : ''}
        <br><br>Costuma ser aba anônima ou site bloqueado nos ajustes do navegador.
      </div></div>` : '') +
    `<div class="bloco">
      <div class="linha"><span><b>Som</b><small>bip de captura, nível e lojinha</small></span>
        <button class="liga ${dados.som ? 'on' : ''}" onclick="trocarSom()">
          ${dados.som ? '🔔 ligado' : '🔕 desligado'}</button></div>
    </div>
    <div class="bloco"><h3>📊 Teus números</h3>
      <div class="linha"><span>cartas diferentes</span><b>${diferentes()} de ${BARALHO.length}</b></div>
      <div class="linha"><span>capturas</span><b>${dados.capturadas}</b></div>
      <div class="linha"><span>capinhas jogadas</span><b>${dados.jogadas}</b></div>
      <div class="linha"><span>cartas que voaram</span><b>${dados.fugiram}</b></div>
      <div class="linha"><span>acerto</span><b>${dados.jogadas
        ? Math.round(dados.capturadas / dados.jogadas * 100) : 0}%</b></div>
      <div class="linha"><span>andou</span><b>${Math.round(andou / PX_POR_METRO)} m</b></div>
      <div class="linha"><span>nível</span><b>${dados.nivel}</b></div>
    </div>
    <div class="bloco"><h3>🔄 Baralho</h3>
      <p>O baralho fica guardado no aparelho por uma semana e depois se atualiza sozinho.
         Dá pra forçar agora:</p>
      <button class="liga" style="width:100%;padding:12px" onclick="rebuscar()">
        🔄 Buscar as cartas de novo</button></div>
    <div class="bloco"><h3>💀 Começar de novo</h3>
      <p>Apaga o álbum, o nível e as capinhas. Não tem volta.</p>
      <button class="perigo" id="btZerar" onclick="zerar()">Apagar tudo e começar do zero</button></div>`;
}

function trocarSom(){
  dados.som = !dados.som;
  gravar();
  if(dados.som) bip('toque');
  pintarAjustes();
}

async function rebuscar(){
  try{
    localStorage.removeItem(CHAVE_BARALHO);
  }catch(e){}
  recado('<span class="girando">⏳</span> buscando…', 9000);
  try{
    await encherBaralho(null);
    recado(`✅ ${BARALHO.length} cartas no baralho`, 3000);
    pintarAjustes();
  }catch(e){
    recado('❌ ' + explicarErro(e), 5000);
  }
}

let zerarArmado = false;
function zerar(){
  const bt = $('#btZerar');
  if(!zerarArmado){
    zerarArmado = true;
    bt.textContent = 'tem certeza? aperta de novo';
    setTimeout(() => { zerarArmado = false; if(bt) bt.textContent = 'Apagar tudo e começar do zero'; }, 4000);
    return;
  }
  zerarArmado = false;
  try{ localStorage.removeItem(CHAVE); }catch(e){}
  dados = vazio();
  gravar();
  pintarHud();
  pintarAjustes();
  recado('💀 Tudo zerado.');
}

/* =========================================================
   INSTALAR NO APARELHO

   Dá pra instalar nos dois: o Android e o computador têm um
   convite de verdade (beforeinstallprompt), que o navegador
   entrega UMA vez e a gente guarda pra usar quando a pessoa
   quiser. O iPhone não tem esse convite — lá é na mão, pelo
   botão de compartilhar, então o jeito certo é ensinar.
   ========================================================= */
let convite = null;

const ehIphone = () => /iphone|ipad|ipod/i.test(navigator.userAgent)
  || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

const jaInstalado = () =>
  (window.matchMedia && window.matchMedia('(display-mode: fullscreen)').matches) ||
  (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
  navigator.standalone === true;

window.addEventListener('beforeinstallprompt', ev => {
  ev.preventDefault();       /* sem isto o navegador mostra do jeito dele, na hora errada */
  convite = ev;
  if(document.querySelector('#folha-ajustes.on')) pintarAjustes();
});

window.addEventListener('appinstalled', () => {
  convite = null;
  recado('📲 <b>Instalado!</b> Agora ele abre igual aplicativo.', 4000);
  if(document.querySelector('#folha-ajustes.on')) pintarAjustes();
});

async function instalar(){
  if(!convite) return;
  convite.prompt();
  const r = await convite.userChoice;
  convite = null;            /* o convite só vale uma vez */
  if(r && r.outcome === 'accepted') recado('📲 Instalando…', 3000);
  pintarAjustes();
}

function blocoInstalar(){
  if(jaInstalado())
    return `<div class="bloco"><h3>📲 Instalado</h3>
      <p>Cê já está jogando pelo aplicativo. 🎉</p></div>`;

  if(convite)
    return `<div class="bloco"><h3>📲 Instalar no aparelho</h3>
      <p>Fica com ícone na tela, abre em tela cheia e <b>funciona sem internet</b>
         (as fotos das cartas é que precisam da rede).</p>
      <button class="liga on" style="width:100%;padding:13px;font-size:.9rem"
        onclick="instalar()">📲 Instalar o PokéTCG GO</button></div>`;

  if(ehIphone())
    return `<div class="bloco"><h3>📲 Instalar no iPhone</h3>
      <p>No iPhone o navegador não deixa eu instalar por botão — tem que ser na mão,
         mas é rápido:</p>
      <div class="linha"><span><b>1.</b> Aperta o <b>compartilhar</b> embaixo
        <small>o quadradinho com a seta pra cima</small></span></div>
      <div class="linha"><span><b>2.</b> Desce e escolhe <b>"Adicionar à Tela de Início"</b></span></div>
      <div class="linha"><span><b>3.</b> Aperta <b>Adicionar</b></span></div>
      <p style="color:var(--tinta3);font-size:.76rem;margin-top:8px">Precisa estar no
         <b>Safari</b>. No Chrome do iPhone essa opção não aparece.</p></div>`;

  return `<div class="bloco"><h3>📲 Instalar no aparelho</h3>
    <p>Dá pra instalar, mas o teu navegador ainda não me ofereceu o botão.
       Costuma aparecer depois de uns minutos de jogo.</p>
    <div class="linha"><span><b>Android</b>
      <small>menu ⋮ → "Instalar aplicativo" ou "Adicionar à tela inicial"</small></span></div>
    <div class="linha"><span><b>Computador</b>
      <small>Chrome ou Edge: o ícone de instalar ⊕ na barra de endereço</small></span></div>
    <p style="color:var(--tinta3);font-size:.76rem;margin-top:8px">No Firefox do computador
       não dá — ele não instala site nenhum.</p></div>`;
}

/* =========================================================
   COMEÇAR
   ========================================================= */
async function comecar(){
  const estado = $('#aberturaEstado'), fino = $('#aberturaFino'), bt = $('#btEntrar');
  try{
    const de = await encherBaralho(html => { estado.innerHTML = html; });
    estado.innerHTML = `✅ <b>${BARALHO.length}</b> cartas no baralho` +
      (de === 'guardado' ? '<br><small>lidas do teu aparelho</small>' : '');
    fino.innerHTML = de === 'internet'
      ? 'Cartas de verdade, da pokemontcg.io. As fotos ficam no servidor deles — ' +
        'o jogo só aponta pra elas.'
      : '';
    bt.style.display = '';
    bt.onclick = entrar;
  }catch(e){
    estado.innerHTML = `😵‍💫 <b>Não deu pra montar o baralho.</b><br>
      <small style="font-weight:600">${explicarErro(e)}</small>
      <br><small style="opacity:.75;font-weight:600;font-size:.72rem">
        detalhe: ${escapar(String((e && e.message) || e))}</small>`;
    fino.innerHTML = 'O jogo precisa de internet <b>na primeira vez</b> pra buscar as cartas. ' +
      'Depois disso ele abre sem.';
    bt.textContent = '🔄 Tentar de novo';
    bt.style.display = '';
    bt.onclick = () => { bt.style.display = 'none'; estado.innerHTML =
      '<span class="girando">⏳</span> buscando as cartas…'; comecar(); };
    mostrarDiagnostico();
  }
}

/* a tela de "testar as fontes": o que aparecer aqui me diz o
   problema de verdade, em vez de eu adivinhar daqui */
function mostrarDiagnostico(){
  const fino = $('#aberturaFino');
  fino.insertAdjacentHTML('beforebegin',
    `<button class="btn" id="btDiag" style="margin-top:10px;font-size:.84rem;padding:10px 18px">
       🔎 Testar as fontes</button>
     <div id="diagSaida" style="text-align:left;font-size:.68rem;line-height:1.5;margin-top:10px;
       max-width:320px"></div>`);
  $('#btDiag').onclick = async () => {
    $('#btDiag').disabled = true;
    $('#btDiag').textContent = '🔎 testando…';
    const pinta = l => {
      $('#diagSaida').innerHTML = l.map(x =>
        `<div style="background:rgba(0,0,0,.25);border-radius:9px;padding:7px 9px;margin-bottom:5px">
           ${x.ok ? '✅' : '❌'} <b>${escapar(x.nome)}</b><br>
           <span style="opacity:.85">${escapar(x.detalhe)} · ${x.ms}ms</span></div>`).join('');
    };
    await diagnosticar(pinta);
    $('#btDiag').textContent = '🔎 testar de novo';
    $('#btDiag').disabled = false;
  };
}

function entrar(){
  $('#abertura').classList.add('off');
  bip('toque');
  montarBairro(dados.semente);
  pintarHud();
  /* três já no chão, pra não começar numa tela vazia */
  for(let i = 0; i < 3; i++) nascerSolta();
  pintarSoltas();
  proximoNascer = Date.now() + 4000;
  requestAnimationFrame(quadro);
  if(!testarGuardar())
    recado('⚠️ Este navegador não deixa guardar: o álbum <b>não vai ficar salvo</b>.', 6000);
  else
    recado('Toca no mapa pra andar. Acha as cartas brilhando 🎴', 4200);

  if(dados.gps && temGps()) ligarGps(pintarGps);

  /* o resto do baralho chega sozinho, sem segurar o começo do jogo */
  if(deOndeVeio === 'internet')
    crescerBaralho(n => {
      if(document.querySelector('#folha-album.on')) pintarAlbum();
      recado(`🎴 o baralho cresceu: <b>${n}</b> cartas`, 2600);
    });
}

$('#palco').addEventListener('pointerdown', tocouNoMapa);
$('#btJogar').addEventListener('click', jogarCapinha);
$('#btFugir').addEventListener('click', desistir);
window.addEventListener('resize', () => { if(!$('#abertura').classList.contains('off')) return; camera(); });
/* fechar o jogo com a lojinha de molho não pode perder o relógio dela */
document.addEventListener('visibilitychange', () => { if(!document.hidden) pintarLojas(); });

comecar();

if('serviceWorker' in navigator && location.protocol.startsWith('http')){
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}
