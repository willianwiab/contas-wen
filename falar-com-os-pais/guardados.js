/* =========================================================
   guardados.js — ⭐ recados favoritos, 🔍 procurar em TODAS
   as conversas e 🎧 ouvir áudio mais rápido.

   Coisas pequenas de todo dia que faltavam: achar aquele
   recado de um mês atrás, guardar o que nunca se quer
   perder, e não ter que ouvir 3 minutos de áudio inteiros.
   ========================================================= */

/* ============ ⭐ FAVORITOS ============ */
/* Guarda por conversa + uid (ou horário, quando não houver uid),
   assim o mesmo recado continua favorito depois de recarregar. */
const chaveDoRecado = (conversa, m) => conversa + '|' + (m.uid || m.ts);

function ehFavorito(conversa, m){
  return !!(dados.favoritos || {})[chaveDoRecado(conversa, m)];
}

function favoritar(indice){
  const m = dados.msgs[atual][indice];
  if(!m) return;
  dados.favoritos = dados.favoritos || {};
  const k = chaveDoRecado(atual, m);
  if(dados.favoritos[k]){ delete dados.favoritos[k]; toast('Tirei dos favoritos'); }
  else { dados.favoritos[k] = Date.now(); toast('⭐ Guardado nos favoritos!'); blim(true); }
  salvar(); desenharMensagens();
}

function abrirFavoritos(){
  if(document.getElementById('telaFavoritos')) return;
  const guardados = [];
  Object.entries(dados.msgs).forEach(([conversa, lista]) => {
    lista.forEach(m => { if(ehFavorito(conversa, m) && !m.apagado) guardados.push({ conversa, m }); });
  });
  guardados.sort((a,b) => b.m.ts - a.m.ts);

  const tela = document.createElement('div');
  tela.className = 'tela-cheia'; tela.id = 'telaFavoritos';
  tela.innerHTML = `
    <div class="w-topo" style="background:linear-gradient(135deg,#f59e0b,#ea580c)">
      <button class="icone" id="fvFechar">✕</button>
      <div><b>⭐ Favoritos</b><div class="w-sub">${guardados.length} recadinho${guardados.length === 1 ? '' : 's'} guardado${guardados.length === 1 ? '' : 's'}</div></div>
    </div>
    <div class="fv-meio">
      ${guardados.length ? guardados.map(({conversa, m}) => {
        const c = conversaPor(conversa);
        return `
          <button class="fv-item" data-ir="${conversa}|${m.uid || m.ts}">
            <div class="fv-topo">
              <span class="fv-onde">${c ? c.emoji + ' ' + c.nome : conversa}</span>
              <span class="fv-quando">${diaTexto(m.ts)} ${hora(m.ts)}</span>
            </div>
            <div class="fv-txt">${escapar(limpar(textoDe(m))).slice(0,160)}</div>
            <div class="fv-quem">${nomeDe(m.de)}</div>
          </button>`;
      }).join('')
      : `<div class="ia-aviso"><div class="balao-deco">⭐</div><h3>Nada guardado ainda</h3>
         <p>Num recadinho, toca no <b>⭐</b> pra guardar aqui. Serve pros que tu nunca quer perder.</p></div>`}
    </div>`;
  document.body.appendChild(tela);
  document.getElementById('fvFechar').addEventListener('click', () => tela.remove());
  tela.querySelectorAll('[data-ir]').forEach(b => b.addEventListener('click', () => {
    const [conversa, marca] = b.dataset.ir.split('|');
    tela.remove();
    irAteORecado(conversa, marca);
  }));
}

/* Abre a conversa e pula até o recado, piscando pra pessoa achar. */
function irAteORecado(conversa, marca){
  abrir(conversa);
  setTimeout(() => {
    const lista = dados.msgs[conversa] || [];
    const i = lista.findIndex(m => String(m.uid || m.ts) === String(marca));
    if(i < 0) return;
    const linha = document.querySelector(`.linha-msg[data-i="${i}"]`);
    if(!linha) return;
    linha.scrollIntoView({ block:'center', behavior:'smooth' });
    linha.classList.add('achado');
    setTimeout(() => linha.classList.remove('achado'), 2200);
  }, 260);
}

/* ============ 🔍 PROCURAR EM TODAS AS CONVERSAS ============ */
function abrirProcuraGeral(){
  if(document.getElementById('telaProcura')) return;
  const tela = document.createElement('div');
  tela.className = 'tela-cheia'; tela.id = 'telaProcura';
  tela.innerHTML = `
    <div class="w-topo" style="background:linear-gradient(135deg,#7c3aed,#2563eb)">
      <button class="icone" id="pgFechar">✕</button>
      <div><b>🔍 Procurar em tudo</b><div class="w-sub">em todas as conversas de uma vez</div></div>
    </div>
    <div class="pg-busca"><input id="pgTermo" placeholder="O que tu quer achar?" autocomplete="off"></div>
    <div class="pg-meio" id="pgResultados"></div>`;
  document.body.appendChild(tela);
  document.getElementById('pgFechar').addEventListener('click', () => tela.remove());
  const campo = document.getElementById('pgTermo');
  campo.focus();
  let espera = null;
  campo.addEventListener('input', () => {
    clearTimeout(espera);
    espera = setTimeout(() => procurarEmTudo(campo.value.trim()), 180);
  });
  procurarEmTudo('');
}

function procurarEmTudo(termo){
  const caixa = document.getElementById('pgResultados');
  if(!caixa) return;
  if(termo.length < 2){
    caixa.innerHTML = `<div class="ia-aviso"><div class="balao-deco">🔍</div><h3>Escreve o que tu procura</h3>
      <p>Eu olho em <b>todas</b> as conversas de uma vez: texto, enquete, lugar, o que for.</p></div>`;
    return;
  }
  const alvo = termo.toLowerCase();
  const achados = [];
  Object.entries(dados.msgs).forEach(([conversa, lista]) => {
    lista.forEach(m => {
      if(m.apagado) return;
      const txt = textoDe(m) || '';
      if(txt.toLowerCase().includes(alvo)) achados.push({ conversa, m, txt });
    });
  });
  achados.sort((a,b) => b.m.ts - a.m.ts);

  if(!achados.length){
    caixa.innerHTML = `<div class="ia-aviso"><div class="balao-deco">🤷</div><h3>Nada com "${escapar(termo)}"</h3>
      <p>Tenta com outra palavra, ou com um pedacinho menor dela.</p></div>`;
    return;
  }
  caixa.innerHTML = `<div class="pg-conta">${achados.length} recadinho${achados.length === 1 ? '' : 's'} com "${escapar(termo)}"</div>` +
    achados.slice(0, 120).map(({conversa, m, txt}) => {
      const c = conversaPor(conversa);
      return `
        <button class="fv-item" data-ir="${conversa}|${m.uid || m.ts}">
          <div class="fv-topo">
            <span class="fv-onde">${c ? c.emoji + ' ' + c.nome : conversa}</span>
            <span class="fv-quando">${diaTexto(m.ts)} ${hora(m.ts)}</span>
          </div>
          <div class="fv-txt">${realce(limpar(txt).slice(0,180), termo)}</div>
          <div class="fv-quem">${nomeDe(m.de)}</div>
        </button>`;
    }).join('');
  caixa.querySelectorAll('[data-ir]').forEach(b => b.addEventListener('click', () => {
    const [conversa, marca] = b.dataset.ir.split('|');
    document.getElementById('telaProcura')?.remove();
    irAteORecado(conversa, marca);
  }));
}

/* ============ 🎧 OUVIR MAIS RÁPIDO ============ */
/* Fica guardado: quem gosta de 2× gosta sempre. */
const VELOCIDADES = [1, 1.5, 2];

function velocidadeDoAudio(){
  const v = dados.velocidadeAudio;
  return VELOCIDADES.includes(v) ? v : 1;
}

function trocarVelocidade(){
  const atualV = velocidadeDoAudio();
  const proxima = VELOCIDADES[(VELOCIDADES.indexOf(atualV) + 1) % VELOCIDADES.length];
  dados.velocidadeAudio = proxima;
  salvar();
  /* se tem áudio tocando agora, muda na hora */
  if(typeof tocandoAgora !== 'undefined' && tocandoAgora && tocandoAgora.el){
    tocandoAgora.el.playbackRate = tocandoAgora.taxaBase * proxima;
  }
  document.querySelectorAll('.bt-veloc').forEach(b => b.textContent = proxima + '×');
  toast(proxima === 1 ? 'Velocidade normal 🎧' : `Ouvindo ${proxima}× mais rápido 🎧`);
}
