/* =========================================================
   jogos.js — os jogos de dois que viajam pela nuvem:
   ✋ pedra, papel e tesoura · 🎯 forca · 🧩 quebra-cabeça.

   Todos são um recado dentro da conversa, igual ao jogo da
   velha: quem mexe manda a versão nova pelo atualizarNaNuvem
   e o aparelho do outro recebe a jogada em segundos.
   ========================================================= */

/* ============ ✋ PEDRA, PAPEL E TESOURA ============ */
const MAOS = { pedra:{ emoji:'✊', nome:'Pedra' }, papel:{ emoji:'✋', nome:'Papel' }, tesoura:{ emoji:'✌️', nome:'Tesoura' } };
const GANHA_DE = { pedra:'tesoura', papel:'pedra', tesoura:'papel' };

function novoPPT(){
  const c = conversaPor(atual);
  const outro = c.pessoa || c.quem.find(p => p !== autor);
  if(!outro){ toast('Este jogo é de dois 😊'); return; }
  const jogo = { tipo:'ppt', entre:[autor, outro], maos:{}, v:0, de:autor, ts:Date.now() };
  dados.msgs[atual].push(jogo);
  dados.visto[atual] = Date.now(); marcarPresenca(autor);
  animar = dados.msgs[atual].length - 1;
  salvar(); blim(true); mandarPraNuvem(atual, jogo);
  desenharMensagens(); desenharContatos();
}

function escolherMao(indice, mao){
  const m = dados.msgs[atual][indice];
  if(!m || m.tipo !== 'ppt') return;
  if(!m.entre.includes(autor)){ toast('Este jogo é entre outros dois 😊'); return; }
  if(m.maos[autor]){ toast('Tu já escolheu! Agora é esperar 😄'); return; }
  m.maos[autor] = mao;
  marcarPresenca(autor);
  salvar(); atualizarNaNuvem(atual, m);
  desenharMensagens(); desenharContatos();
  const faltam = m.entre.filter(p => !m.maos[p]);
  if(faltam.length) toast('Escolhido! Agora é esperar o outro 🤫');
  else blim(true);
}

/* Enquanto os dois não escolheram, ninguém vê a mão do outro. */
function balaoPPT(m, indice){
  const [a, b] = m.entre;
  const fechado = !m.maos[a] || !m.maos[b];
  const minha = m.maos[autor];
  const souDaqui = m.entre.includes(autor);

  if(fechado){
    const espera = m.entre.filter(p => !m.maos[p]).map(p => souEu(p) ? 'tu' : PESSOAS[p].curto).join(' e ');
    return `
      <div class="jogo ppt">
        <div class="jogo-topo">✋ Pedra, papel e tesoura</div>
        <div class="jogo-times">${nomeDe(a)} &nbsp;×&nbsp; ${nomeDe(b)}</div>
        ${souDaqui && !minha ? `<div class="ppt-maos">${Object.entries(MAOS).map(([k, v]) =>
            `<button class="ppt-mao" data-ppt="${indice}:${k}" title="${v.nome}">${v.emoji}</button>`).join('')}</div>`
          : `<div class="ppt-segredo">${minha ? MAOS[minha].emoji + ' escolhido! ' : ''}🤫</div>`}
        <div class="jogo-vez">esperando ${espera}...</div>
      </div>`;
  }

  const maoA = m.maos[a], maoB = m.maos[b];
  const vencedor = maoA === maoB ? null : (GANHA_DE[maoA] === maoB ? a : b);
  const recado = !vencedor ? '🤝 Empatou!'
    : souEu(vencedor) ? '🎉 Tu ganhou!' : `🎉 ${PESSOAS[vencedor].curto} ganhou!`;
  return `
    <div class="jogo ppt">
      <div class="jogo-topo">✋ Pedra, papel e tesoura</div>
      <div class="ppt-fim">
        <div class="ppt-lado ${vencedor === a ? 'venceu' : ''}"><span>${MAOS[maoA].emoji}</span><b>${nomeDe(a)}</b></div>
        <div class="ppt-x">×</div>
        <div class="ppt-lado ${vencedor === b ? 'venceu' : ''}"><span>${MAOS[maoB].emoji}</span><b>${nomeDe(b)}</b></div>
      </div>
      <div class="jogo-vez fim">${recado}</div>
    </div>`;
}

/* ============ 🎯 FORCA ============ */
const BONECO = ['','😐','😐','😐','😐','😐','😵'];   // vai piorando a cada erro
const MAX_ERROS = 6;
const LETRAS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

/* Sem acento e sem maiúscula, pra "AÇÃO" e "acao" contarem igual.
   (o enfeites.js já tem um semAcento próprio — dois nomes iguais no
   escopo de cima quebrariam o site inteiro) */
const soLetrasDaForca = t => t.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase();

/* A palavra fica embaralhadinha no recado. NÃO é um cofre — é uma
   cortina, pra ela não aparecer de bandeja pra quem for adivinhar. */
const esconder = t => btoa(unescape(encodeURIComponent(t.split('').reverse().join(''))));
const revelar  = t => { try{ return decodeURIComponent(escape(atob(t))).split('').reverse().join(''); }catch(e){ return ''; } };

function abrirNovaForca(){
  const c = conversaPor(atual);
  const outro = c.pessoa || c.quem.find(p => p !== autor);
  if(!outro){ toast('A forca é de dois 😊'); return; }
  if(document.getElementById('telaForca')) return;

  const tela = document.createElement('div');
  tela.className = 'fundo-modal aberto'; tela.id = 'telaForca';
  tela.innerHTML = `
    <div class="modal">
      <h2>🎯 Jogo da forca</h2>
      <p class="sub">Escolhe a palavra que ${PESSOAS[outro].curto} vai ter que adivinhar. Não conta pra ninguém! 🤫</p>
      <div class="campo-form">
        <label>A palavra</label>
        <input id="forcaPalavra" maxlength="18" placeholder="Ex.: cachorro" autocomplete="off">
        <small>Só letras, sem espaço. Acento não atrapalha.</small>
      </div>
      <div class="campo-form">
        <label>Uma dica (pode deixar vazio)</label>
        <input id="forcaDica" maxlength="30" placeholder="Ex.: um bicho">
      </div>
      <div class="acoes">
        <button class="btn neutro" id="forcaSair">Deixa pra lá</button>
        <button class="btn principal" id="forcaCriar">Mandar 🎯</button>
      </div>
    </div>`;
  document.body.appendChild(tela);
  const campo = document.getElementById('forcaPalavra');
  campo.focus();
  tela.addEventListener('click', e => { if(e.target.id === 'telaForca') tela.remove(); });
  document.getElementById('forcaSair').addEventListener('click', () => tela.remove());
  campo.addEventListener('keydown', e => { if(e.key === 'Enter') document.getElementById('forcaCriar').click(); });

  document.getElementById('forcaCriar').addEventListener('click', () => {
    const palavra = soLetrasDaForca(campo.value.trim()).replace(/[^A-Z]/g,'');
    if(palavra.length < 3){ toast('Escolhe uma palavra de 3 letras pra cima 😊'); return; }
    const jogo = {
      tipo:'forca', p: esconder(palavra), dica: document.getElementById('forcaDica').value.trim(),
      dono: autor, quemAdivinha: outro, letras:[], v:0, de:autor, ts:Date.now()
    };
    dados.msgs[atual].push(jogo);
    dados.visto[atual] = Date.now(); marcarPresenca(autor);
    animar = dados.msgs[atual].length - 1;
    salvar(); blim(true); mandarPraNuvem(atual, jogo);
    desenharMensagens(); desenharContatos();
    tela.remove();
    toast('Mandado! Agora é esperar 🎯');
  });
}

const errosDaForca = m => (m.letras || []).filter(l => !revelar(m.p).includes(l)).length;
const forcaGanhou  = m => revelar(m.p).split('').every(l => (m.letras || []).includes(l));
const forcaPerdeu  = m => errosDaForca(m) >= MAX_ERROS;

function chutarLetra(indice, letra){
  const m = dados.msgs[atual][indice];
  if(!m || m.tipo !== 'forca') return;
  if(autor !== m.quemAdivinha){ toast('Quem adivinha é ' + PESSOAS[m.quemAdivinha].curto + ' 😊'); return; }
  if(forcaGanhou(m) || forcaPerdeu(m)) return;
  if((m.letras || []).includes(letra)) return;
  m.letras = (m.letras || []).concat(letra);
  marcarPresenca(autor);
  salvar(); atualizarNaNuvem(atual, m);
  desenharMensagens(); desenharContatos();
  if(forcaGanhou(m)){ blim(true); confete(); toast('Acertou! 🎉'); }
  else if(forcaPerdeu(m)) toast('Acabaram as chances 😅 era "' + revelar(m.p) + '"');
  else if(!revelar(m.p).includes(letra)) blim(false);
}

function balaoForca(m, indice){
  const palavra = revelar(m.p);
  const erros = errosDaForca(m);
  const ganhou = forcaGanhou(m), perdeu = forcaPerdeu(m);
  const acabou = ganhou || perdeu;
  const souQuemAdivinha = autor === m.quemAdivinha;

  const mostrada = palavra.split('').map(l =>
    ((m.letras || []).includes(l) || acabou) ? l : '_').join(' ');

  const teclado = (souQuemAdivinha && !acabou)
    ? `<div class="forca-teclado">${LETRAS.map(l => {
        const usada = (m.letras || []).includes(l);
        return `<button class="forca-letra ${usada ? (palavra.includes(l) ? 'certa' : 'errada') : ''}"
          data-forca="${indice}:${l}" ${usada ? 'disabled' : ''}>${l}</button>`;
      }).join('')}</div>`
    : '';

  const recado = ganhou ? '🎉 Acertou!'
    : perdeu ? `😅 Era "${palavra}"`
    : souQuemAdivinha ? `Tua vez de chutar — ${MAX_ERROS - erros} chance${MAX_ERROS - erros === 1 ? '' : 's'}`
    : `${PESSOAS[m.quemAdivinha].curto} está adivinhando...`;

  return `
    <div class="jogo forca">
      <div class="jogo-topo">🎯 Jogo da forca</div>
      <div class="forca-boneco">${'❤️'.repeat(Math.max(0, MAX_ERROS - erros))}${'🖤'.repeat(erros)} ${BONECO[Math.min(erros, 6)]}</div>
      <div class="forca-palavra">${mostrada}</div>
      ${m.dica ? `<div class="forca-dica">💡 ${escapar(m.dica)}</div>` : ''}
      ${teclado}
      <div class="jogo-vez ${acabou ? 'fim' : ''}">${recado}</div>
    </div>`;
}

/* ============ 🧩 QUEBRA-CABEÇA ============ */
/* Pega uma foto que já está no álbum e embaralha em pedaços.
   É pra montar sozinho, no próprio aparelho. */
let quebraAtual = null;     // { id, lado, ordem, escolhida }

async function abrirQuebraCabeca(){
  const fotos = [];
  Object.values(dados.msgs).forEach(lista => lista.forEach(m => {
    if(m.tipo === 'foto' && m.id) fotos.push(m);
  }));
  if(!fotos.length){ toast('Manda uma foto primeiro pra virar quebra-cabeça 📷', 5000); return; }
  const foto = fotos[fotos.length - 1];

  if(document.getElementById('telaQuebra')) return;
  const tela = document.createElement('div');
  tela.className = 'tela-cheia'; tela.id = 'telaQuebra';
  tela.innerHTML = `
    <div class="w-topo" style="background:linear-gradient(135deg,#0ea5e9,#6366f1)">
      <button class="icone" id="qbFechar">✕</button>
      <div><b>🧩 Quebra-cabeça</b><div class="w-sub">toca em duas peças pra trocar de lugar</div></div>
      <div class="icones"><button class="icone" id="qbTrocarFoto" title="Outra foto">🔄</button></div>
    </div>
    <div class="qb-meio">
      <div class="qb-tam" id="qbTam">
        <button class="tm-op on" data-lado="3">Fácil (9)</button>
        <button class="tm-op" data-lado="4">Difícil (16)</button>
      </div>
      <div class="qb-tabuleiro" id="qbTabuleiro"></div>
      <div class="qb-recado" id="qbRecado">Monta a foto! 🧩</div>
    </div>`;
  document.body.appendChild(tela);
  document.getElementById('qbFechar').addEventListener('click', () => { quebraAtual = null; tela.remove(); });
  document.getElementById('qbTrocarFoto').addEventListener('click', () => {
    const outras = fotos.filter(f => f.id !== quebraAtual.id);
    const nova = outras.length ? outras[Math.floor(Math.random() * outras.length)] : foto;
    comecarQuebra(nova, quebraAtual.lado);
  });
  tela.querySelectorAll('#qbTam .tm-op').forEach(b => b.addEventListener('click', () => {
    tela.querySelectorAll('#qbTam .tm-op').forEach(o => o.classList.remove('on'));
    b.classList.add('on');
    comecarQuebra(fotoPorId(quebraAtual.id) || foto, +b.dataset.lado);
  }));

  comecarQuebra(foto, 3);
}

async function comecarQuebra(foto, lado){
  const url = await urlDaFoto(foto);
  if(!url){ toast('Não achei essa foto 😕'); return; }
  const total = lado * lado;
  /* embaralha e garante que não nasceu montado */
  let ordem;
  do { ordem = Array.from({length: total}, (_,k) => k).sort(() => Math.random() - .5); }
  while(ordem.every((v,k) => v === k));
  quebraAtual = { id: foto.id, url, lado, ordem, escolhida: null };
  desenharQuebra();
}

function desenharQuebra(){
  const caixa = document.getElementById('qbTabuleiro');
  if(!caixa || !quebraAtual) return;
  const { lado, ordem, url, escolhida } = quebraAtual;
  caixa.style.gridTemplateColumns = `repeat(${lado}, 1fr)`;
  caixa.innerHTML = ordem.map((peca, casa) => {
    const lin = Math.floor(peca / lado), col = peca % lado;
    return `<button class="qb-peca ${escolhida === casa ? 'escolhida' : ''}" data-peca="${casa}"
      style="background-image:url('${url}');background-size:${lado * 100}% ${lado * 100}%;
             background-position:${col * 100 / (lado - 1)}% ${lin * 100 / (lado - 1)}%"></button>`;
  }).join('');
  caixa.querySelectorAll('[data-peca]').forEach(b =>
    b.addEventListener('click', () => tocarPeca(+b.dataset.peca)));

  const pronto = ordem.every((v,k) => v === k);
  const recado = document.getElementById('qbRecado');
  if(recado){
    recado.textContent = pronto ? '🎉 Montou! Que orgulho!' : 'Monta a foto! 🧩';
    recado.classList.toggle('pronto', pronto);
  }
  if(pronto && !quebraAtual.festejou){ quebraAtual.festejou = true; confete(); blim(true); }
}

function tocarPeca(casa){
  if(!quebraAtual) return;
  if(quebraAtual.escolhida === null){ quebraAtual.escolhida = casa; desenharQuebra(); return; }
  if(quebraAtual.escolhida === casa){ quebraAtual.escolhida = null; desenharQuebra(); return; }
  const o = quebraAtual.ordem;
  [o[casa], o[quebraAtual.escolhida]] = [o[quebraAtual.escolhida], o[casa]];
  quebraAtual.escolhida = null;
  desenharQuebra();
}
