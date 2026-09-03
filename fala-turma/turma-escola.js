/* =========================================================
   turma-escola.js — 🔔 o sinal · 📆 o mês · 🏖️ as férias ·
   🔍 procurar · 📶 modo internet ruim
   ========================================================= */

/* ---------------------------------------------------------
   🔔 QUANTO FALTA PRO SINAL

   Os horários são da TURMA, não deste aparelho: quem arrumar,
   arruma pra todo mundo. Por isso eles viajam pelo mural, num
   recado especial que fica escondido da lista.
   --------------------------------------------------------- */
const SINOS_PADRAO = [
  { nome:'Entrada',  hora:'07:30' },
  { nome:'Recreio',  hora:'09:40' },
  { nome:'Volta',    hora:'10:00' },
  { nome:'Saída',    hora:'11:50' }
];

const postoDosSinos = () => dados.avisos.find(a => a.tipo === 'sinos');
const osSinos = () => {
  const p = postoDosSinos();
  const lista = (p && Array.isArray(p.sinos) ? p.sinos : []).filter(s => s && horaVale(s.hora));
  return (lista.length ? lista : SINOS_PADRAO).slice().sort((a, b) => a.hora.localeCompare(b.hora));
};

/* minutos desde a meia-noite, pra poder comparar horas sem dor */
const emMinutos = h => (+h.slice(0,2)) * 60 + (+h.slice(3,5));
const doisPontos = m => `${String(Math.floor(m/60)).padStart(2,'0')}:${String(m%60).padStart(2,'0')}`;

function proximoSino(){
  const d = new Date();
  const agora = d.getHours() * 60 + d.getMinutes() + d.getSeconds()/60;
  const fds = d.getDay() === 0 || d.getDay() === 6;
  for(const s of osSinos()){
    const m = emMinutos(s.hora);
    if(m > agora) return { sino:s, faltam: m - agora, fds };
  }
  return { sino:null, faltam:0, fds };
}

let relogioSino = null;
function abrirSinos(){
  desenharSinos();
  clearInterval(relogioSino);
  relogioSino = setInterval(() => {
    if(document.getElementById('tela-sinos').classList.contains('on')) desenharSinos();
    else clearInterval(relogioSino);
  }, 1000);
  mostrar('sinos');
}

function desenharSinos(){
  const { sino, faltam, fds } = proximoSino();
  const caixa = $('#contaSino');
  if(fds){
    caixa.innerHTML = `<div class="sino-grande"><b>🎉 Hoje não tem aula!</b>
      <small>É fim de semana. Aproveita 😄</small></div>`;
  }else if(!sino){
    caixa.innerHTML = `<div class="sino-grande"><b>🏠 A aula já acabou por hoje</b>
      <small>O próximo sinal é amanhã de manhã.</small></div>`;
  }else{
    const min = Math.floor(faltam);
    const seg = Math.round((faltam - min) * 60);
    caixa.innerHTML = `
      <div class="sino-grande ${min < 5 ? 'perto' : ''}">
        <span class="sino-emoji">${sino.nome === 'Recreio' ? '🍎' : sino.nome === 'Saída' ? '🎒' : '🔔'}</span>
        <b>${escapar(sino.nome)}</b>
        <div class="sino-conta">${min}<small>min</small> ${String(seg).padStart(2,'0')}<small>s</small></div>
        <small>toca às ${sino.hora}</small>
      </div>`;
  }
  $('#listaSinos').innerHTML = osSinos().map((s, i) => `
    <div class="sino-linha ${sino && s.hora === sino.hora ? 'agora' : ''}">
      <b>${escapar(s.nome)}</b><span>${s.hora}</span>
      <button class="rec-bt fraco" data-tirasino="${i}">🗑️</button>
    </div>`).join('') || '<p class="dica">Nenhum horário ainda.</p>';
  $('#listaSinos').querySelectorAll('[data-tirasino]').forEach(b =>
    b.addEventListener('click', () => tirarSino(+b.dataset.tirasino)));
}

async function guardarSinos(lista){
  let p = postoDosSinos();
  if(!p){
    p = { id: Date.now().toString(36) + Math.random().toString(36).slice(2,6),
          de: dados.eu, ts: Date.now(), tipo:'sinos', txt:'Horários da turma', v:0 };
    dados.avisos.push(p);
  }
  p.sinos = lista;
  p.v = (p.v || 0) + 1;
  salvar(); desenharSinos(); mandarPraTurma(p);
}

function porSino(){
  const nome = (prompt('Nome do sinal (ex.: Recreio, Saída):') || '').trim();
  if(!nome) return;
  const hora = (prompt('Que horas ele toca? (ex.: 09:40)') || '').trim();
  if(!horaVale(hora)){ aviso('A hora tem que ser assim: 09:40 (e existir de verdade)'); return; }
  const lista = osSinos().concat([{ nome: nome.slice(0,20), hora }]);
  guardarSinos(lista.slice(0, 12));
  aviso('🔔 Guardado! A turma inteira vai ver');
}

function tirarSino(i){
  const lista = osSinos();
  if(!lista[i]) return;
  if(!confirm(`Tirar "${lista[i].nome}" (${lista[i].hora})?`)) return;
  lista.splice(i, 1);
  guardarSinos(lista);
}

/* ---------------------------------------------------------
   📆 O CALENDÁRIO DO MÊS
   --------------------------------------------------------- */
let mesOlhando = null;   // 0 = este mês, 1 = o que vem, -1 = o passado

const MESES_LONGOS2 = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

function abrirCalendario(){
  if(mesOlhando === null) mesOlhando = 0;
  desenharCalendario();
  mostrar('calendario');
}

function desenharCalendario(){
  const base = new Date();
  base.setDate(1);
  base.setMonth(base.getMonth() + mesOlhando);
  const ano = base.getFullYear(), mes = base.getMonth();
  $('#mesNome').textContent = `${MESES_LONGOS2[mes]} de ${ano}`;

  const primeiro = new Date(ano, mes, 1).getDay();
  const quantos = new Date(ano, mes + 1, 0).getDate();
  const hojeISO = new Date().toISOString().slice(0,10);

  /* o que cai em cada dia: recado com data, aniversário e feriado */
  const porDia = {};
  const bota = (iso, item) => { (porDia[iso] = porDia[iso] || []).push(item); };
  dados.avisos.forEach(a => {
    if(!a.data) return;
    if(a.tipo === 'aniver'){
      const [, m, d] = a.data.split('-');
      bota(`${ano}-${m}-${d}`, { emoji:'🎂', txt:a.txt, cor:TIPOS.aniver.cor });
    }else{
      const t = TIPOS[a.tipo] || {};
      bota(a.data, { emoji:t.emoji || '📌', txt:a.txt, cor:t.cor });
    }
  });
  feriadosDe(ano).forEach(f => bota(f.data, { emoji:'🎌', txt:f.nome, cor:'#16a34a', feriado:true }));

  const celulas = [];
  for(let i = 0; i < primeiro; i++) celulas.push('<div class="dia-vazio"></div>');
  for(let d = 1; d <= quantos; d++){
    const iso = `${ano}-${String(mes+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const coisas = porDia[iso] || [];
    const fds = new Date(ano, mes, d).getDay() % 6 === 0;
    celulas.push(`
      <button class="dia-cal ${iso === hojeISO ? 'hoje' : ''} ${fds ? 'fds' : ''} ${
        coisas.length ? 'tem' : ''}" ${coisas.length ? `data-dia="${iso}"` : 'disabled'}>
        <b>${d}</b>
        <span class="pontos">${coisas.slice(0,3).map(c =>
          `<i style="background:${c.cor}"></i>`).join('')}</span>
      </button>`);
  }
  $('#gradeCal').innerHTML = celulas.join('');
  $('#gradeCal').querySelectorAll('[data-dia]').forEach(b =>
    b.addEventListener('click', () => {
      const c = porDia[b.dataset.dia] || [];
      const [a2,m2,d2] = b.dataset.dia.split('-');
      $('#doDia').innerHTML = `<div class="titulo" style="margin-top:0">${d2}/${m2}</div>` +
        c.map(x => `<div class="cal-item" style="--cor:${x.cor}">${x.emoji}
          ${escapar(String(x.txt)).slice(0,90)}</div>`).join('');
    }));

  /* uma lista embaixo, pra quem acha grade confusa */
  const lista = Object.entries(porDia).filter(([iso]) => iso.startsWith(`${ano}-${String(mes+1).padStart(2,'0')}`))
    .sort().map(([iso, c]) => `
      <div class="cal-linha"><b>${iso.slice(8)}/${iso.slice(5,7)}</b>
        <span>${c.map(x => x.emoji + ' ' + escapar(String(x.txt)).slice(0,40)).join(' · ')}</span></div>`);
  $('#listaCal').innerHTML = lista.length ? lista.join('')
    : '<p class="dica">Nada marcado neste mês ainda.</p>';
}

/* ---------------------------------------------------------
   🎌 OS FERIADOS
   Os nacionais do Brasil. Carnaval, Sexta-feira Santa e Corpus
   Christi andam com a Páscoa, então a Páscoa é calculada — é a
   conta de Gauss, a mesma que a Igreja usa desde 1800.
   --------------------------------------------------------- */
function pascoaDe(ano){
  const a = ano % 19, b = Math.floor(ano/100), c = ano % 100;
  const d = Math.floor(b/4), e = b % 4, f = Math.floor((b+8)/25);
  const g = Math.floor((b - f + 1)/3), h = (19*a + b - d - g + 15) % 30;
  const i = Math.floor(c/4), k = c % 4;
  const l = (32 + 2*e + 2*i - h - k) % 7;
  const m = Math.floor((a + 11*h + 22*l)/451);
  const mes = Math.floor((h + l - 7*m + 114)/31);
  const dia = ((h + l - 7*m + 114) % 31) + 1;
  return new Date(ano, mes - 1, dia);
}
const maisDias = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const paraISO = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;

function feriadosDe(ano){
  const p = pascoaDe(ano);
  return [
    { data:`${ano}-01-01`, nome:'Ano Novo' },
    { data: paraISO(maisDias(p, -48)), nome:'Carnaval' },
    { data: paraISO(maisDias(p, -47)), nome:'Carnaval' },
    { data: paraISO(maisDias(p, -2)),  nome:'Sexta-feira Santa' },
    { data: paraISO(p),                nome:'Páscoa' },
    { data:`${ano}-04-21`, nome:'Tiradentes' },
    { data:`${ano}-05-01`, nome:'Dia do Trabalho' },
    { data: paraISO(maisDias(p, 60)),  nome:'Corpus Christi' },
    { data:`${ano}-09-07`, nome:'Independência' },
    { data:`${ano}-10-12`, nome:'Nossa Senhora Aparecida' },
    { data:`${ano}-11-02`, nome:'Finados' },
    { data:`${ano}-11-15`, nome:'Proclamação da República' },
    { data:`${ano}-11-20`, nome:'Consciência Negra' },
    { data:`${ano}-12-25`, nome:'Natal' }
  ];
}

/* ---------------------------------------------------------
   🏖️ QUANTO FALTA PRAS FÉRIAS
   --------------------------------------------------------- */
const postoDasFerias = () => dados.avisos.find(a => a.tipo === 'ferias');

function abrirFerias(){
  desenharFerias();
  mostrar('ferias');
}

function desenharFerias(){
  const p = postoDasFerias();
  const caixa = $('#barraFerias');
  if(!p || !p.data){
    caixa.innerHTML = `<div class="vazio"><div class="emojao">🏖️</div>
      <h3>Ninguém marcou ainda</h3>
      <p>Alguém da turma bota o último dia de aula, e a barrinha começa a encher pra todo mundo.</p></div>`;
  }else{
    const faltam = diasAte(p.data);
    const total = Math.max(1, Math.round((new Date(p.data) - new Date(p.desde || p.ts)) / 86400000));
    const andou = Math.max(0, Math.min(100, Math.round((total - faltam) / total * 100)));
    caixa.innerHTML = `
      <div class="cartao ferias-caixa">
        <div class="ferias-num">${faltam <= 0 ? '🎉 FÉRIAS!' : faltam}</div>
        ${faltam > 0 ? `<div class="ferias-txt">dia${faltam === 1 ? '' : 's'} de aula até as férias</div>` : ''}
        <div class="ferias-fora"><div class="ferias-dentro" style="width:${andou}%"></div></div>
        <small class="dica">Último dia: ${dataBonita(p.data)} · ${andou}% do caminho</small>
      </div>`;
  }
  const ano = new Date().getFullYear();
  const hojeISO = new Date().toISOString().slice(0,10);
  const proximos = feriadosDe(ano).concat(feriadosDe(ano + 1))
    .filter(f => f.data >= hojeISO).slice(0, 8);
  $('#listaFeriados').innerHTML = proximos.map(f => {
    const d = diasAte(f.data);
    const dia = new Date(f.data + 'T12:00');
    return `
      <div class="feriado ${d <= 7 ? 'perto' : ''}">
        <b>🎌 ${f.nome}</b>
        <span>${DIAS[dia.getDay()]}, ${dataBonita(f.data)}</span>
        <i>${faltaTexto(d)}</i>
      </div>`;
  }).join('');
}

function marcarFerias(){
  const hoje = new Date().toISOString().slice(0,10);
  const q = (prompt('Qual o ÚLTIMO dia de aula? (aaaa-mm-dd)', hoje) || '').trim();
  if(!/^\d{4}-\d{2}-\d{2}$/.test(q)){ aviso('Escreve assim: 2026-12-18'); return; }
  let p = postoDasFerias();
  if(!p){
    p = { id: Date.now().toString(36) + Math.random().toString(36).slice(2,6),
          de: dados.eu, ts: Date.now(), tipo:'ferias', txt:'Último dia de aula', v:0 };
    dados.avisos.push(p);
  }
  p.data = q; p.desde = p.desde || Date.now();
  p.v = (p.v || 0) + 1;
  salvar(); desenharFerias(); mandarPraTurma(p);
  aviso('🏖️ Marcado! Agora é só a barrinha encher');
}

/* ---------------------------------------------------------
   🔍 PROCURAR NO MURAL
   --------------------------------------------------------- */
let procurando = '';
const semAcentoTurma = t => String(t).normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase();

function procurar(){
  procurando = $('#campoProcura').value.trim();
  $('#limparProcura').classList.toggle('escondido', !procurando);
  desenharMural();
}
function limparProcura(){
  $('#campoProcura').value = ''; procurar();
}
/* devolve true se o recado casa com o que a pessoa escreveu */
function casaComAProcura(a){
  if(!procurando) return true;
  const alvo = semAcentoTurma([a.txt, a.de, (a.ops || []).join(' '),
    (TIPOS[a.tipo] || {}).nome, a.data || ''].join(' '));
  return semAcentoTurma(procurando).split(/\s+/).every(p => alvo.includes(p));
}

/* ---------------------------------------------------------
   📶 MODO INTERNET RUIM
   --------------------------------------------------------- */
function modoEconomia(){ return !!dados.economia; }
function trocarEconomia(){
  dados.economia = !dados.economia;
  salvar(); desenharBotaoEconomia(); desenharMural();
  aviso(dados.economia
    ? '📶 Modo internet ruim ligado — as fotos só abrem se tu pedir'
    : '📷 As fotos voltaram');
}
function desenharBotaoEconomia(){
  const b = $('#btEconomia');
  if(!b) return;
  b.classList.toggle('on', modoEconomia());
  b.textContent = modoEconomia() ? '📶 Internet ruim: ligado' : '📶 Modo internet ruim';
}
