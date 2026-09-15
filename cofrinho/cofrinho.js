/* =========================================================
   cofrinho.js — junta dinheiro pra uma coisa só

   A conta que importa é uma divisão: o que falta dividido
   pelas semanas que sobram. Todo o resto do site existe pra
   deixar essa divisão na cara da pessoa.

   Dinheiro é guardado em CENTAVOS (número inteiro). Em reais
   com vírgula, 0.1 + 0.2 daria 0.30000000000000004 e o
   cofrinho fecharia com um centavo sobrando do nada.
   ========================================================= */

const CHAVE = 'cofrinho:v1';
const EMOJIS = ['🎯','🚲','🎮','📱','👟','🎧','💻','🎸','📚','🏀','✈️','🐶','🎂','🚗','🏠','🎁'];

let dados = carregar();
let cofreAberto = null;    /* id do cofrinho na tela de detalhe */
let editando = null;       /* id quando o modal está editando, null quando é novo */
let emojiEscolhido = EMOJIS[0];
let tipoValor = 'guardar';

const $ = s => document.querySelector(s);

/* ---------------------------------------------------------
   GUARDAR E LER
   --------------------------------------------------------- */
function carregar(){
  try{
    const cru = localStorage.getItem(CHAVE);
    if(cru){
      const o = JSON.parse(cru);
      if(o && Array.isArray(o.cofres)) return o;
    }
  }catch(e){ /* navegador sem localStorage, ou guardado torto: começa limpo */ }
  return { v:1, cofres:[] };
}

function gravar(){
  try{ localStorage.setItem(CHAVE, JSON.stringify(dados)); }
  catch(e){ alert('Não consegui guardar neste aparelho 😕\nSe cê está numa aba anônima, ela não deixa.'); }
}

const novoId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

/* ---------------------------------------------------------
   DINHEIRO

   A pessoa digita "50", "50,00", "1.234,56" ou "R$ 12".
   Tudo isso tem que virar o mesmo número de centavos.
   --------------------------------------------------------- */
function lerDinheiro(txt){
  let s = String(txt || '').trim().replace(/[^\d.,]/g, '');
  if(!s) return null;
  if(s.includes(',')){
    /* vírgula manda: o que vier antes dela é ponto de milhar */
    s = s.replace(/\./g, '').replace(',', '.');
  }else{
    /* sem vírgula, "1.234" é mil duzentos e trinta e quatro, mas "1.23" é um e vinte e três */
    const partes = s.split('.');
    if(partes.length > 1 && partes[partes.length - 1].length === 3) s = s.replace(/\./g, '');
  }
  const n = parseFloat(s);
  if(!isFinite(n) || n < 0) return null;
  return Math.round(n * 100);
}

const fmt = c => (c / 100).toLocaleString('pt-BR', { style:'currency', currency:'BRL' });
const fmtCurto = c => c % 100 === 0
  ? 'R$ ' + (c / 100).toLocaleString('pt-BR')
  : fmt(c);

/* ---------------------------------------------------------
   DATAS

   Sempre no formato 'aaaa-mm-dd' e sempre montadas com
   new Date(a, m-1, d): usar new Date('2026-03-12') puxaria
   pra UTC e no Brasil viraria dia 11.
   --------------------------------------------------------- */
const hojeISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
};
function paraData(iso){
  const [a, m, d] = String(iso).split('-').map(Number);
  return new Date(a, m - 1, d);
}
const diasEntre = (iso1, iso2) =>
  Math.round((paraData(iso2) - paraData(iso1)) / 86400000);

const dataLonga = iso => paraData(iso).toLocaleDateString('pt-BR',
  { day:'numeric', month:'long', year:'numeric' });
const dataCurta = iso => paraData(iso).toLocaleDateString('pt-BR',
  { day:'2-digit', month:'short' });

/* "daqui a 45 dias" fica melhor como "1 mês e meio" na cabeça de quem lê */
function quantoFalta(dias){
  if(dias === 0) return 'é hoje!';
  if(dias === 1) return 'amanhã';
  if(dias < 30) return `${dias} dias`;
  const meses = Math.round(dias / 30.44);
  if(meses === 1) return 'cerca de 1 mês';
  if(meses < 12) return `cerca de ${meses} meses`;
  const anos = (dias / 365.25);
  return anos < 1.5 ? 'cerca de 1 ano' : `cerca de ${Math.round(anos)} anos`;
}

/* ---------------------------------------------------------
   AS CONTAS DO COFRINHO
   --------------------------------------------------------- */
const acharCofre = id => dados.cofres.find(c => c.id === id);
const guardadoDe = c => c.movs.reduce((s, m) => s + m.valor, 0);

function situacao(c){
  const guardado = guardadoDe(c);
  const falta = Math.max(0, c.alvo - guardado);
  const pct = c.alvo > 0 ? Math.min(100, Math.round(guardado / c.alvo * 100)) : 0;
  const pronto = falta === 0;

  const s = { guardado, falta, pct, pronto, sobra: Math.max(0, guardado - c.alvo) };

  if(c.data){
    s.dias = diasEntre(hojeISO(), c.data);
    s.passou = s.dias < 0 && !pronto;
    if(!pronto && s.dias >= 0){
      const semanas = Math.max(1, Math.ceil(s.dias / 7));
      s.porSemana = Math.ceil(falta / semanas);
      s.porMes    = Math.ceil(falta / Math.max(1, Math.ceil(s.dias / 30.44)));
      s.porDia    = Math.ceil(falta / Math.max(1, s.dias));
    }
  }

  /* O ritmo de verdade: quanto entrou desde o primeiro depósito.
     Só vale depois de uma semana — antes disso um único depósito
     vira uma previsão maluca de "cê compra amanhã". */
  const entradas = c.movs.filter(m => m.valor > 0);
  if(!pronto && entradas.length >= 2){
    const primeira = entradas.map(m => m.data).sort()[0];
    const corridos = diasEntre(primeira, hojeISO());
    const total = entradas.reduce((x, m) => x + m.valor, 0);
    if(corridos >= 7 && total > 0){
      const porDia = total / corridos;
      s.ritmoSemana = Math.round(porDia * 7);
      s.ritmoDias = Math.ceil(falta / porDia);
      const chegada = new Date();
      chegada.setDate(chegada.getDate() + s.ritmoDias);
      s.ritmoData = `${chegada.getFullYear()}-${String(chegada.getMonth()+1).padStart(2,'0')}-${String(chegada.getDate()).padStart(2,'0')}`;
    }
  }
  return s;
}

/* ---------------------------------------------------------
   TELA 1 — a lista
   --------------------------------------------------------- */
function desenharLista(){
  const caixa = $('#listaCofres');
  if(!dados.cofres.length){
    caixa.innerHTML = `<div class="vazio">
      <span class="pig">🐷</span>
      <b>Nenhum cofrinho ainda</b>
      Escolhe uma coisa que cê quer, põe quanto custa,<br>e ele te diz quanto guardar por semana.
    </div>`;
    return;
  }
  /* os que ainda faltam primeiro: cofrinho cheio já cumpriu o papel dele */
  const ordem = dados.cofres.slice().sort((a, b) => {
    const sa = situacao(a), sb = situacao(b);
    if(sa.pronto !== sb.pronto) return sa.pronto ? 1 : -1;
    return sb.pct - sa.pct;
  });

  caixa.innerHTML = ordem.map(c => {
    const s = situacao(c);
    const linha = s.pronto
      ? `<b>Conseguiu!</b> ${fmtCurto(c.alvo)} juntados 🎉`
      : `Falta ${fmtCurto(s.falta)}` + (c.data ? ` · ${s.passou ? 'prazo passou' : quantoFalta(s.dias)}` : '');
    return `<button class="cofre-cartao" onclick="abrirCofre('${c.id}')">
      <span class="cofre-emoji">${c.emoji}</span>
      <span class="cofre-meio">
        <span class="cofre-nome">${escapar(c.nome)}</span>
        <span class="cofre-linha">${linha}</span>
        <span class="barra ${s.pronto ? 'cheia' : ''}"><div style="width:${s.pct}%"></div></span>
      </span>
      <span class="cofre-pct">${s.pronto ? '🏆' : s.pct + '%'}</span>
    </button>`;
  }).join('');
}

const escapar = t => String(t).replace(/[&<>"]/g,
  ch => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[ch]));

/* ---------------------------------------------------------
   TELA 2 — um cofrinho por dentro
   --------------------------------------------------------- */
function abrirCofre(id){
  cofreAberto = id;
  desenharCofre();
  mostrar('cofre');
}

function desenharCofre(){
  const c = acharCofre(cofreAberto);
  if(!c) return mostrar('lista');
  const s = situacao(c);

  $('#dEmoji').textContent = c.emoji;
  $('#dNome').textContent = c.nome;
  $('#dQuando').textContent = c.data ? `Pra ${dataLonga(c.data)}` : 'Sem data marcada';

  $('#dGuardado').textContent = fmt(s.guardado);
  $('#dAlvo').textContent = fmt(c.alvo);
  $('#dBarra').className = 'barra grande' + (s.pronto ? ' cheia' : '');
  $('#dBarra').firstElementChild.style.width = s.pct + '%';
  $('#dPct').textContent = s.pct + '%';
  $('#dSobra').textContent = s.sobra > 0 ? `${fmtCurto(s.sobra)} a mais 🤑` : '';

  $('#dCaixaFalta').className = 'num ' + (s.pronto ? 'pronto' : 'falta');
  $('#dFalta').textContent = s.pronto ? 'Nada! 🎉' : fmt(s.falta);

  /* a caixa da esquerda já diz "Falta"; repetir o rótulo aqui faria
     ler duas coisas diferentes com o mesmo nome */
  $('#dDiasRot').textContent = s.passou ? 'O prazo' : 'Prazo';
  if(!c.data)            $('#dDias').textContent = 'sem data';
  else if(s.pronto)      $('#dDias').textContent = s.dias > 0 ? 'chegou antes! 🎉' : 'cumprido';
  else if(s.passou)      $('#dDias').textContent = 'já passou';
  else                   $('#dDias').textContent = quantoFalta(s.dias);

  $('#dPlano').innerHTML = textoDoPlano(c, s);
  $('#dExtrato').innerHTML = textoDoExtrato(c);
}

function textoDoPlano(c, s){
  if(s.pronto){
    return `<div class="plano-destaque"><div class="v">🏆</div>
      <div class="r">Cê conseguiu! Pode ir buscar ${escapar(c.nome).toLowerCase()}.</div></div>`;
  }

  let html = '';

  if(c.data && !s.passou){
    html += `<div class="plano-destaque">
        <div class="v">${fmtCurto(s.porSemana)}</div>
        <div class="r">por semana, até ${dataCurta(c.data)}</div>
      </div>
      <p class="plano-extra">
        Ou <b>${fmtCurto(s.porMes)}</b> por mês · <b>${fmtCurto(s.porDia)}</b> por dia
      </p>`;
  }else if(c.data && s.passou){
    html += `<div class="recado ruim">A data já passou e ainda falta <b>${fmtCurto(s.falta)}</b>.
      Não tem problema — muda a data lá embaixo em <b>Mudar o cofrinho</b> e o plano se refaz sozinho.</div>`;
  }else{
    html += `<div class="recado neutro">Sem data marcada, então não dá pra dizer quanto por semana.
      Põe uma data em <b>Mudar o cofrinho</b> que eu faço a conta.</div>`;
  }

  /* o confronto entre o plano e a realidade */
  if(s.ritmoData){
    const noRitmo = `No seu ritmo (<b>${fmtCurto(s.ritmoSemana)}</b> por semana)
      cê chega em <b>${dataLonga(s.ritmoData)}</b>.`;
    if(c.data && !s.passou){
      const sobrando = diasEntre(s.ritmoData, c.data);
      html += sobrando >= 0
        ? `<div class="recado bom">🚀 Tá adiantado! ${noRitmo} Isso é ${quantoFalta(sobrando)} antes do prazo.</div>`
        : `<div class="recado ruim">🐌 Tá devagar. ${noRitmo} Pra chegar na data,
             tem que guardar <b>${fmtCurto(s.porSemana)}</b> por semana.</div>`;
    }else{
      html += `<div class="recado neutro">${noRitmo}</div>`;
    }
  }
  return html;
}

function textoDoExtrato(c){
  if(!c.movs.length) return `<p class="sem-mov">Nada guardado ainda. Aperta 💰 Guardar!</p>`;
  return c.movs.slice().sort((a, b) => b.data.localeCompare(a.data) || b.id.localeCompare(a.id))
    .map(m => `<div class="mov">
      <span class="ico">${m.inicio ? '🏁' : (m.valor > 0 ? '💰' : '↩️')}</span>
      <span class="quando">${m.inicio ? 'Começo' : dataLonga(m.data)}</span>
      <span class="v ${m.valor > 0 ? 'mais' : 'menos'}">${m.valor > 0 ? '+' : '−'}${fmtCurto(Math.abs(m.valor))}</span>
      <button class="x" title="Apagar" onclick="apagarMov('${m.id}')">✕</button>
    </div>`).join('');
}

/* ---------------------------------------------------------
   CRIAR E MUDAR
   --------------------------------------------------------- */
function desenharEmojis(){
  $('#mcEmojis').innerHTML = EMOJIS.map(e =>
    `<button type="button" class="${e === emojiEscolhido ? 'on' : ''}" onclick="escolherEmoji('${e}')">${e}</button>`
  ).join('');
}
function escolherEmoji(e){ emojiEscolhido = e; desenharEmojis(); }

function abrirNovo(){
  editando = null;
  emojiEscolhido = EMOJIS[0];
  $('#mcTitulo').textContent = 'Novo cofrinho';
  $('#mcNome').value = '';
  $('#mcAlvo').value = '';
  $('#mcData').value = '';
  $('#mcInicio').value = '';
  $('#mcInicio').disabled = false;
  desenharEmojis();
  abrirModal('modalCofre');
  setTimeout(() => $('#mcNome').focus(), 120);
}

function abrirEditar(){
  const c = acharCofre(cofreAberto);
  if(!c) return;
  editando = c.id;
  emojiEscolhido = c.emoji;
  $('#mcTitulo').textContent = 'Mudar o cofrinho';
  $('#mcNome').value = c.nome;
  $('#mcAlvo').value = (c.alvo / 100).toFixed(2).replace('.', ',');
  $('#mcData').value = c.data || '';
  /* o que já foi guardado vira extrato: mexer nele aqui bagunçaria o histórico */
  $('#mcInicio').value = '';
  $('#mcInicio').disabled = true;
  desenharEmojis();
  abrirModal('modalCofre');
}

function salvarCofre(){
  const nome = $('#mcNome').value.trim();
  const alvo = lerDinheiro($('#mcAlvo').value);
  const data = $('#mcData').value;
  const inicio = lerDinheiro($('#mcInicio').value) || 0;

  if(!nome)                 return erro('mcErro', 'Escreve o que cê quer comprar.');
  if(alvo === null || !alvo) return erro('mcErro', 'Põe quanto custa.');
  if(data && diasEntre(hojeISO(), data) < 0 && !editando)
    return erro('mcErro', 'Essa data já passou. Escolhe uma lá na frente.');

  if(editando){
    const c = acharCofre(editando);
    Object.assign(c, { nome, emoji:emojiEscolhido, alvo, data });
  }else{
    const c = { id:novoId(), nome, emoji:emojiEscolhido, alvo, data, criado:hojeISO(), movs:[] };
    if(inicio > 0) c.movs.push({ id:novoId(), valor:inicio, data:hojeISO(), inicio:true });
    dados.cofres.push(c);
    cofreAberto = c.id;
  }
  gravar();
  fecharModal('modalCofre');
  desenharLista();
  if(editando){ desenharCofre(); }
  else{ abrirCofre(cofreAberto); }
}

function apagarCofre(){
  const c = acharCofre(cofreAberto);
  if(!c) return;
  if(!confirm(`Apagar o cofrinho "${c.nome}"?\n\nO extrato vai junto e não tem como voltar atrás.`)) return;
  dados.cofres = dados.cofres.filter(x => x.id !== c.id);
  gravar();
  desenharLista();
  mostrar('lista');
}

/* ---------------------------------------------------------
   GUARDAR E TIRAR
   --------------------------------------------------------- */
function abrirValor(tipo){
  tipoValor = tipo;
  $('#mvTitulo').textContent = tipo === 'guardar' ? '💰 Guardar quanto?' : '↩️ Tirar quanto?';
  $('#mvOk').textContent = tipo === 'guardar' ? 'Guardar' : 'Tirar';
  $('#mvValor').value = '';
  $('#mvData').value = hojeISO();
  $('#mvErro').classList.remove('on');
  abrirModal('modalValor');
  setTimeout(() => $('#mvValor').focus(), 120);
}

function salvarValor(){
  const c = acharCofre(cofreAberto);
  if(!c) return;
  const valor = lerDinheiro($('#mvValor').value);
  const data = $('#mvData').value || hojeISO();
  if(valor === null || !valor) return erro('mvErro', 'Escreve um valor.');

  if(tipoValor === 'tirar' && valor > guardadoDe(c))
    return erro('mvErro', `Só tem ${fmt(guardadoDe(c))} guardado aí.`);

  const antesPronto = situacao(c).pronto;
  c.movs.push({ id:novoId(), valor: tipoValor === 'guardar' ? valor : -valor, data });
  gravar();
  fecharModal('modalValor');
  desenharCofre();
  desenharLista();

  /* a festa é só na virada — repetir a cada depósito depois de cheio cansa */
  if(!antesPronto && situacao(c).pronto) festa(40);
  else if(tipoValor === 'guardar') festa(8);
}

function apagarMov(id){
  const c = acharCofre(cofreAberto);
  if(!c) return;
  if(!confirm('Apagar esse lançamento do extrato?')) return;
  c.movs = c.movs.filter(m => m.id !== id);
  gravar();
  desenharCofre();
  desenharLista();
}

/* ---------------------------------------------------------
   BACKUP — localStorage some quando se limpa o navegador,
   e ninguém avisa antes. Um arquivo resolve.
   --------------------------------------------------------- */
function salvarBackup(){
  if(!dados.cofres.length) return alert('Não tem nenhum cofrinho pra salvar ainda 🐷');
  const texto = JSON.stringify(dados, null, 1);
  const url = URL.createObjectURL(new Blob([texto], { type:'application/json' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = `cofrinho-${hojeISO()}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

function abrirBackup(input){
  const arq = input.files && input.files[0];
  input.value = '';
  if(!arq) return;
  const leitor = new FileReader();
  leitor.onload = () => {
    let o;
    try{ o = JSON.parse(leitor.result); }
    catch(e){ return alert('Esse arquivo não é um backup do Cofrinho 😕'); }
    if(!o || !Array.isArray(o.cofres)) return alert('Esse arquivo não é um backup do Cofrinho 😕');

    /* junta em vez de substituir: assim abrir o backup errado nunca apaga nada */
    const tenho = new Set(dados.cofres.map(c => c.id));
    const novos = o.cofres.filter(c => c && c.id && !tenho.has(c.id));
    if(!novos.length) return alert('Esse backup não tem nenhum cofrinho novo — já está tudo aqui 👍');
    dados.cofres = dados.cofres.concat(novos);
    gravar();
    desenharLista();
    alert(`Pronto! ${novos.length} cofrinho${novos.length > 1 ? 's' : ''} ${novos.length > 1 ? 'voltaram' : 'voltou'} 🐷`);
  };
  leitor.readAsText(arq);
}

/* ---------------------------------------------------------
   MIUDEZAS DE TELA
   --------------------------------------------------------- */
function mostrar(tela){
  document.querySelectorAll('.tela').forEach(t => t.classList.remove('on'));
  $('#tela-' + tela).classList.add('on');
  window.scrollTo(0, 0);
  if(tela === 'lista') cofreAberto = null;
}
function abrirModal(id){ $('#' + id).classList.add('on'); $('#' + id).querySelector('.erro').classList.remove('on'); }
function fecharModal(id){ $('#' + id).classList.remove('on'); }
function erro(id, txt){ const e = $('#' + id); e.textContent = txt; e.classList.add('on'); }

function festa(quantas){
  for(let i = 0; i < quantas; i++){
    const m = document.createElement('div');
    m.className = 'moeda';
    m.textContent = Math.random() < .5 ? '🪙' : '💰';
    m.style.left = Math.random() * 100 + 'vw';
    m.style.top = '-40px';
    m.style.animationDelay = Math.random() * .6 + 's';
    document.body.appendChild(m);
    setTimeout(() => m.remove(), 2400);
  }
}

/* Enter no teclado do celular confirma, em vez de não fazer nada */
document.addEventListener('keydown', ev => {
  if(ev.key !== 'Enter') return;
  if($('#modalValor').classList.contains('on')) salvarValor();
  else if($('#modalCofre').classList.contains('on')) salvarCofre();
});

/* ---------------------------------------------------------
   COMEÇO
   --------------------------------------------------------- */
desenharLista();
desenharEmojis();

if('serviceWorker' in navigator){
  window.addEventListener('load', () =>
    navigator.serviceWorker.register('sw.js').catch(() => {}));
}
