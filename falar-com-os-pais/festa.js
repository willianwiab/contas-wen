/* =========================================================
   festa.js — 🎂 cartão de aniversário e 🎞️ retrospectiva.

   O cartão é uma surpresa de verdade: cada um grava o seu
   pedacinho escondido e NADA aparece antes do dia. Fica
   guardado no aparelho de quem fez até a hora de mostrar.
   ========================================================= */

/* ============ 🎂 CARTÃO DE ANIVERSÁRIO ============ */
function ehOAniversarioHoje(p){
  const iso = (dados.nasc || {})[p];
  if(!iso) return false;
  const hoje = new Date();
  const [, mes, dia] = iso.split('-').map(Number);
  return hoje.getMonth() + 1 === mes && hoje.getDate() === dia;
}

function abrirCartoes(){
  if(document.getElementById('telaCartao')) return;
  dados.cartoes = dados.cartoes || {};

  const eu = dados.euSou || 'jojo';
  const outros = TODOS.filter(p => p !== eu);

  const tela = document.createElement('div');
  tela.className = 'tela-cheia'; tela.id = 'telaCartao';
  tela.innerHTML = `
    <div class="w-topo" style="background:linear-gradient(135deg,#ec4899,#f59e0b)">
      <button class="icone" id="ctFechar">✕</button>
      <div><b>🎂 Cartão de aniversário</b><div class="w-sub">uma surpresa que só abre no dia</div></div>
    </div>
    <div class="ct-meio" id="ctMeio"></div>`;
  document.body.appendChild(tela);
  document.getElementById('ctFechar').addEventListener('click', () => { pararGravacao(true); tela.remove(); });
  desenharCartoes(outros);
}

function desenharCartoes(outros){
  const caixa = document.getElementById('ctMeio');
  if(!caixa) return;
  const eu = dados.euSou || 'jojo';

  /* 1) tem cartão pronto pra MIM hoje? */
  const meuCartao = ehOAniversarioHoje(eu) ? (dados.cartoes[eu] || null) : null;
  const pedacos = meuCartao ? Object.keys(meuCartao) : [];

  const surpresa = (meuCartao && pedacos.length) ? `
    <div class="ct-surpresa">
      <div class="balao-deco">🎉</div>
      <h3>Feliz aniversário, ${PESSOAS[eu].curto}!</h3>
      <p>A família preparou ${pedacos.length} recadinho${pedacos.length === 1 ? '' : 's'} escondido${pedacos.length === 1 ? '' : 's'} pra ti.</p>
      <button class="lig-bt ok grande" id="ctAbrir">🎁 Abrir a surpresa!</button>
    </div>` : '';

  caixa.innerHTML = surpresa + `
    <div class="bloco-titulo">Preparar um cartão</div>
    <p class="sem-lembrete">Grava um áudio pra quem tu quiser. Fica <b>escondido</b> — nem a pessoa
    nem os outros veem — e só aparece no dia do aniversário dela.</p>
    <div class="ct-gente">
      ${outros.map(p => {
        const nasc = (dados.nasc || {})[p];
        const falta = nasc ? diasParaAniversario(nasc) : null;
        const jaFiz = !!((dados.cartoes[p] || {})[eu]);
        return `
          <button class="ct-pessoa ${jaFiz ? 'pronto' : ''}" data-cartao="${p}">
            <span class="ct-av" style="background:linear-gradient(135deg,${PESSOAS[p].cor},${PESSOAS[p].cor}bb)">${avatarDe(p)}</span>
            <b>${PESSOAS[p].curto}</b>
            <small>${jaFiz ? '✅ teu recadinho está guardado' :
              falta ? (falta.dias === 0 ? '🎂 é hoje!' : `faltam ${falta.dias} dias`) : 'sem data de nascimento'}</small>
          </button>`;
      }).join('')}
    </div>
    <p class="sem-lembrete" style="margin-top:12px">Pra aparecer a contagem, põe a data de nascimento
    de cada um em ⚙️ Ajustes → 🎂 Aniversários.</p>`;

  if(document.getElementById('ctAbrir'))
    document.getElementById('ctAbrir').addEventListener('click', () => abrirASurpresa(meuCartao));
  caixa.querySelectorAll('[data-cartao]').forEach(b =>
    b.addEventListener('click', () => gravarPedaco(b.dataset.cartao, outros)));
}

function gravarPedaco(paraQuem, outros){
  const eu = dados.euSou || 'jojo';
  dados.cartoes[paraQuem] = dados.cartoes[paraQuem] || {};
  const jaTem = dados.cartoes[paraQuem][eu];

  if(jaTem && !confirm(`Tu já gravou um recadinho pra ${PESSOAS[paraQuem].curto}.\nGravar de novo por cima?`)) return;

  const caixa = document.getElementById('ctMeio');
  caixa.insertAdjacentHTML('afterbegin', `
    <div class="ct-gravando" id="ctGravando">
      <div class="ct-av grande" style="background:linear-gradient(135deg,${PESSOAS[paraQuem].cor},${PESSOAS[paraQuem].cor}bb)">${avatarDe(paraQuem)}</div>
      <b>Recadinho pra ${PESSOAS[paraQuem].curto}</b>
      <p class="lig-txt" id="ctDica">Toca no 🎤 e fala. Ninguém ouve até o dia dele!</p>
      <div class="lig-botoes">
        <button class="lig-bt ok grande" id="ctGravar">🎤 Gravar</button>
        <button class="lig-bt desligar" id="ctCancelar">Cancelar</button>
      </div>
    </div>`);

  const fora = () => { pararGravacao(true); document.getElementById('ctGravando')?.remove(); };
  document.getElementById('ctCancelar').addEventListener('click', fora);

  const bt = document.getElementById('ctGravar');
  const dica = document.getElementById('ctDica');
  let relogio = null, comecou = 0;

  bt.addEventListener('click', async () => {
    const estado = await alternarGravacao({
      aoComecar(){
        comecou = Date.now();
        bt.textContent = '⏹ Pronto!';
        relogio = setInterval(() => {
          dica.textContent = 'gravando... ' + ((Date.now() - comecou)/1000).toFixed(1) + 's';
        }, 100);
      },
      async aoTerminar(blob, segundos){
        clearInterval(relogio);
        if(segundos < .5){ toast('Muito curtinho 😅'); fora(); return; }
        const id = 'c' + Date.now() + Math.random().toString(36).slice(2,6);
        const guardou = await guardarAudio(id, blob);
        if(!guardou){ toast('Não consegui guardar o áudio 😕'); fora(); return; }
        dados.cartoes[paraQuem][eu] = { id, dur: Math.round(segundos*10)/10, ts: Date.now() };
        salvar();
        document.getElementById('ctGravando')?.remove();
        desenharCartoes(outros);
        toast(`🤫 Guardado! ${PESSOAS[paraQuem].curto} só vai ouvir no aniversário`, 5000);
      },
      aoFalhar(){ clearInterval(relogio); dica.textContent = 'Não consegui usar o microfone 😕'; }
    });
    if(estado === 'cancelou'){ clearInterval(relogio); fora(); }
  });
}

async function abrirASurpresa(cartao){
  const tela = document.createElement('div');
  tela.className = 'tela-cheia'; tela.id = 'telaSurpresa';
  tela.style.background = 'linear-gradient(160deg,#ec4899,#f59e0b)';
  tela.innerHTML = `
    <div class="w-topo" style="background:transparent">
      <button class="icone" id="spFechar">✕</button>
      <div><b>🎉 Feliz aniversário!</b><div class="w-sub">da tua família, com amor</div></div>
    </div>
    <div class="sp-meio" id="spMeio"></div>`;
  document.body.appendChild(tela);
  document.getElementById('spFechar').addEventListener('click', () => tela.remove());
  confete();

  const meio = document.getElementById('spMeio');
  const partes = [];
  for(const [dequem, pedaco] of Object.entries(cartao)){
    const url = await urlDoAudio({ id: pedaco.id });
    partes.push(`
      <div class="sp-cartao">
        <div class="ct-av grande" style="background:linear-gradient(135deg,${PESSOAS[dequem].cor},${PESSOAS[dequem].cor}bb)">${avatarDe(dequem)}</div>
        <b>${PESSOAS[dequem].nome}</b>
        ${url ? `<audio controls src="${url}"></audio>` : '<small>o áudio se perdeu 😕</small>'}
      </div>`);
  }
  meio.innerHTML = partes.join('') || '<p class="lig-txt">Ainda não tem nenhum recadinho aqui.</p>';
}

/* ============ 🎞️ RETROSPECTIVA ============ */
/* Um slideshow com as fotos e videinhos de um mês. */
let slideRelogio = null;

async function abrirRetrospectiva(){
  if(document.getElementById('telaRetro')) return;

  /* junta tudo que é foto, por mês */
  const porMes = {};
  Object.values(dados.msgs).forEach(lista => lista.forEach(m => {
    if(m.tipo !== 'foto' || !m.id) return;
    const mes = new Date(m.ts).toISOString().slice(0,7);
    (porMes[mes] = porMes[mes] || []).push(m);
  }));
  const meses = Object.keys(porMes).sort().reverse();
  if(!meses.length){ toast('Ainda não tem foto nenhuma pra montar 📷', 5000); return; }

  const NOMES_MES = ['janeiro','fevereiro','março','abril','maio','junho',
                     'julho','agosto','setembro','outubro','novembro','dezembro'];
  const bonito = mes => {
    const [ano, m] = mes.split('-');
    return NOMES_MES[+m - 1] + ' de ' + ano;
  };

  const tela = document.createElement('div');
  tela.className = 'tela-cheia'; tela.id = 'telaRetro';
  tela.innerHTML = `
    <div class="w-topo" style="background:linear-gradient(135deg,#6366f1,#ec4899)">
      <button class="icone" id="rtFechar">✕</button>
      <div><b>🎞️ Retrospectiva</b><div class="w-sub">as fotos do mês, uma atrás da outra</div></div>
    </div>
    <div class="rt-meses" id="rtMeses">
      ${meses.map(m => `<button class="rapida" data-mes="${m}">${bonito(m)} (${porMes[m].length})</button>`).join('')}
    </div>
    <div class="rt-palco" id="rtPalco">
      <div class="ia-aviso"><div class="balao-deco">🎞️</div><h3>Escolhe um mês</h3>
      <p>Toca num mês aí em cima e as fotos vão passando sozinhas, como um filminho.</p></div>
    </div>`;
  document.body.appendChild(tela);
  document.getElementById('rtFechar').addEventListener('click', () => { pararSlide(); tela.remove(); });
  tela.querySelectorAll('[data-mes]').forEach(b => b.addEventListener('click', () => {
    tela.querySelectorAll('[data-mes]').forEach(o => o.classList.remove('on'));
    b.classList.add('on');
    tocarSlide(porMes[b.dataset.mes], bonito(b.dataset.mes));
  }));
}

function pararSlide(){ clearInterval(slideRelogio); slideRelogio = null; }

async function tocarSlide(fotos, titulo){
  pararSlide();
  const palco = document.getElementById('rtPalco');
  if(!palco) return;
  palco.innerHTML = '<div class="ia-aviso"><div class="balao-deco">🎞️</div><h3>Preparando...</h3></div>';

  const quadros = [];
  for(const f of fotos.slice(-40)){                 // 40 fotos já é um filminho e tanto
    const url = await urlDaFoto(f);
    if(url) quadros.push({ url, ts: f.ts, de: f.de });
  }
  if(!quadros.length){ palco.innerHTML = '<div class="ia-aviso"><h3>As fotos desse mês se perderam 😕</h3></div>'; return; }

  palco.innerHTML = `
    <div class="rt-titulo">${titulo} • ${quadros.length} foto${quadros.length === 1 ? '' : 's'}</div>
    <div class="rt-quadro" id="rtQuadro"></div>
    <div class="rt-legenda" id="rtLegenda"></div>
    <div class="lig-botoes" style="justify-content:center">
      <button class="lig-bt" id="rtPausar">⏸ Pausar</button>
      <button class="lig-bt" id="rtVoltar">⏮</button>
      <button class="lig-bt" id="rtPular">⏭</button>
    </div>`;

  let i = 0, rodando = true;
  const mostrar = () => {
    const q = quadros[i];
    document.getElementById('rtQuadro').innerHTML = `<img src="${q.url}" alt="">`;
    document.getElementById('rtLegenda').textContent =
      `${nomeDe(q.de)} • ${new Date(q.ts).toLocaleDateString('pt-BR')} • ${i+1}/${quadros.length}`;
  };
  const andar = passo => { i = (i + passo + quadros.length) % quadros.length; mostrar(); };
  mostrar();
  slideRelogio = setInterval(() => { if(rodando) andar(1); }, 2200);

  document.getElementById('rtPular').addEventListener('click', () => andar(1));
  document.getElementById('rtVoltar').addEventListener('click', () => andar(-1));
  document.getElementById('rtPausar').addEventListener('click', ev => {
    rodando = !rodando;
    ev.target.textContent = rodando ? '⏸ Pausar' : '▶ Continuar';
  });
}
