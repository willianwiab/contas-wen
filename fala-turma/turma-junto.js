/* =========================================================
   turma-junto.js — 💛 obrigado · 😀 como tu tá · 🏠 cheguei ·
   🔎 achados e perdidos · 🎵 playlist · 🔊 ler em voz alta ·
   🌐 traduzir · 👨‍👩‍👧 folhas pra levar em casa
   ========================================================= */

/* ---------------------------------------------------------
   💛 DIZER OBRIGADO
   Só soma. Não tem ranking de quem tem menos — isso viraria
   uma lista de quem ninguém agradeceu, e não é isso que a
   gente quer pendurado na parede.
   --------------------------------------------------------- */
function dizerObrigado(paraQuem){
  const gente = genteDaTurma();
  if(!gente.length){ aviso('Ainda não tem mais ninguém na turma 😊'); return; }
  const nome = paraQuem || prompt('Obrigado pra quem?\n\n' + gente.join(', '));
  if(!nome) return;
  const certo = gente.find(n => n.toLowerCase() === String(nome).trim().toLowerCase());
  if(!certo){ aviso('Não achei essa pessoa na turma 🤔'); return; }
  const porque = (prompt(`Por que tu quer agradecer ${certo}?`, 'me ajudou hoje') || '').trim();
  if(!porque) return;
  const a = { id: Date.now().toString(36) + Math.random().toString(36).slice(2,6),
              de: dados.eu, ts: Date.now(), tipo:'obrigado',
              txt: porque.slice(0,200), pra: certo, v:1 };
  dados.avisos.unshift(a);
  salvar(); desenharMural(); mandarPraTurma(a);
  aviso('💛 Mandado! ' + certo + ' vai ver no mural');
}

/* quantas estrelinhas cada um já ganhou */
function estrelasDe(nome){
  return dados.avisos.filter(a => a.tipo === 'obrigado' && a.pra === nome).length;
}

/* ---------------------------------------------------------
   😀 COMO TU TÁ HOJE
   Sem nome. Mas "sem nome" numa turma de 4 pessoas não engana
   ninguém — então o app só mostra a contagem quando pelo menos
   3 pessoas responderam, e diz isso na tela.
   --------------------------------------------------------- */
const HUMORES = [
  { id:'otimo', emoji:'😄', nome:'Ótimo' },
  { id:'bem',   emoji:'🙂', nome:'Bem' },
  { id:'assim', emoji:'😐', nome:'Mais ou menos' },
  { id:'mal',   emoji:'😢', nome:'Mal' },
  { id:'bravo', emoji:'😡', nome:'Bravo' }
];
const MINIMO_HUMOR = 3;
const diaDeHoje = () => new Date().toISOString().slice(0,10);

function abrirHumor(){
  desenharHumor();
  mostrar('humor');
  puxarHumor();
}

async function marcarHumor(id){
  if(!naTurma()) return;
  dados.humorMeu = { dia: diaDeHoje(), id };
  salvar(); desenharHumor();
  try{
    /* a chave é embaralhada do nome + do dia: o banco não sabe
       de quem é, e a pessoa consegue trocar de ideia no mesmo dia */
    const k = await chaveDoBanco('humor', diaDeHoje(), dados.eu);
    await fetch(`${endereco()}/humor/${diaDeHoje()}/${k}.json`, {
      method:'PUT', headers:{'Content-Type':'application/json'},
      body: JSON.stringify(await embaralhar({ id, ts: Date.now() }))
    });
    puxarHumor();
  }catch(e){}
}

async function puxarHumor(){
  if(!naTurma() || !navigator.onLine) return;
  try{
    const r = await fetch(`${endereco()}/humor/${diaDeHoje()}.json`);
    if(!r.ok) return;
    const tudo = await r.json();
    const conta = {};
    let quantos = 0;
    for(const pacote of Object.values(tudo || {})){
      const h = await desembaralhar(pacote);
      if(!h || !HUMORES.some(x => x.id === h.id)) continue;
      conta[h.id] = (conta[h.id] || 0) + 1; quantos++;
    }
    dados.humorHoje = { dia: diaDeHoje(), conta, quantos };
    salvar(); desenharHumor();
  }catch(e){}
}

function desenharHumor(){
  const meu = (dados.humorMeu && dados.humorMeu.dia === diaDeHoje()) ? dados.humorMeu.id : null;
  $('#botoesHumor').innerHTML = HUMORES.map(h => `
    <button class="humor-bt ${meu === h.id ? 'on' : ''}" data-humor="${h.id}">
      <span>${h.emoji}</span>${h.nome}</button>`).join('');
  $('#botoesHumor').querySelectorAll('[data-humor]').forEach(b =>
    b.addEventListener('click', () => marcarHumor(b.dataset.humor)));

  const hoje = (dados.humorHoje && dados.humorHoje.dia === diaDeHoje()) ? dados.humorHoje : null;
  const caixa = $('#resultadoHumor');
  if(!hoje || !hoje.quantos){
    caixa.innerHTML = '<p class="dica">Ninguém respondeu hoje ainda.</p>';
    return;
  }
  if(hoje.quantos < MINIMO_HUMOR){
    caixa.innerHTML = `<div class="cartao"><b>🤐 Ainda não dá pra mostrar</b>
      <p class="dica" style="margin-top:6px">Só ${hoje.quantos} ${
      hoje.quantos === 1 ? 'pessoa respondeu' : 'pessoas responderam'}. Com pouca gente,
      "sem nome" não engana ninguém — daria pra adivinhar quem está mal. A partir de
      ${MINIMO_HUMOR} respostas o app mostra.</p></div>`;
    return;
  }
  const tristes = (hoje.conta.mal || 0) + (hoje.conta.bravo || 0);
  caixa.innerHTML = `
    <div class="humor-barras">
      ${HUMORES.map(h => {
        const n = hoje.conta[h.id] || 0;
        const pct = Math.round(n / hoje.quantos * 100);
        return `<div class="humor-linha"><span>${h.emoji}</span>
          <div class="humor-fora"><div class="humor-dentro" style="width:${pct}%"></div></div>
          <b>${n}</b></div>`;
      }).join('')}
    </div>
    <p class="dica" style="margin-top:10px">${hoje.quantos} pessoas responderam hoje.</p>
    ${tristes ? `<div class="cartao chama-adulto" style="margin-top:12px">
      <b>💛 Tem gente da turma não muito bem hoje.</b>
      <p class="dica" style="margin-top:6px">O app não conta quem é, de propósito. Mas
      se tu desconfia de alguém, pergunta se está tudo bem — e se for coisa séria,
      <b>conta pra um adulto</b>.</p></div>` : ''}`;
}

/* ---------------------------------------------------------
   🏠 CHEGUEI EM CASA
   --------------------------------------------------------- */
function cheguei(){
  const a = { id: Date.now().toString(36) + Math.random().toString(36).slice(2,6),
              de: dados.eu, ts: Date.now(), tipo:'cheguei',
              txt: 'Cheguei em casa 🏠', v:1 };
  dados.avisos.unshift(a);
  salvar(); desenharMural(); mandarPraTurma(a);
  aviso('🏠 Avisado! A turma sabe que tu chegou bem');
}

/* quem já avisou que chegou, hoje */
function quemChegou(){
  const hoje = new Date(); hoje.setHours(0,0,0,0);
  const vistos = {};
  dados.avisos.filter(a => a.tipo === 'cheguei' && a.ts >= hoje.getTime())
    .forEach(a => { if(!vistos[a.de] || a.ts > vistos[a.de]) vistos[a.de] = a.ts; });
  return vistos;
}

/* ---------------------------------------------------------
   🔎 ACHADOS E PERDIDOS · 🎵 PLAYLIST
   Os dois viram recado no mural, com um botão a mais.
   --------------------------------------------------------- */
function ehMeu(id){
  const a = achar(id);
  if(!a) return;
  if(a.dono && a.dono !== dados.eu){ aviso(`${a.dono} já disse que é dele 😊`); return; }
  a.dono = a.dono === dados.eu ? '' : dados.eu;
  a.v = (a.v || 1) + 1;
  salvar(); desenharMural(); mandarPraTurma(a);
  if(a.dono) aviso('🎒 Marcado! Combina com quem achou pra pegar de volta');
}

function balaoPerdido(a){
  return `<div class="evento">
    ${a.dono
      ? `<div class="ev-gente"><b>✅ ${escapar(a.dono)} disse que é dele.</b>
         Combina com ${escapar(a.de)} pra pegar de volta.</div>`
      : '<div class="ev-gente"><i>Ninguém reclamou ainda.</i></div>'}
    <button class="ev-bt largo ${a.dono === dados.eu ? 'on' : ''}" data-emeu="${a.id}">${
      a.dono === dados.eu ? '✅ Tu disse que é teu' : '🙋 É meu!'}</button>
  </div>`;
}

function balaoMusica(a){
  const link = String(a.txt).match(/https?:\/\/[^\s]+/);
  return link ? `<a class="rec-mapa" target="_blank" rel="noopener noreferrer"
    href="${escapar(link[0])}">🎵 Ouvir</a>` : '';
}

/* ---------------------------------------------------------
   🔊 LER EM VOZ ALTA
   O navegador já sabe ler; a gente só precisa pedir direito.
   --------------------------------------------------------- */
let lendoAgora = null;

function lerEmVozAlta(id){
  const a = achar(id);
  if(!a) return;
  if(!('speechSynthesis' in window)){ aviso('Este navegador não sabe ler em voz alta 😕'); return; }
  if(lendoAgora === id){ pararDeLer(); return; }
  pararDeLer();

  const t = TIPOS[a.tipo] || {};
  const partes = [`${t.nome || 'Recado'} de ${a.de}.`, a.txt];
  if(a.data) partes.push(`Data: ${dataBonita(a.data)}. ${faltaTexto(diasAte(a.data))}.`);
  if(a.ops && a.ops.length) partes.push('Opções: ' + a.ops.join(', ') + '.');

  const fala = new SpeechSynthesisUtterance(partes.join(' '));
  fala.lang = 'pt-BR';
  fala.rate = 0.95;          /* um tiquinho devagar: é pra quem tem dificuldade */
  fala.onend = fala.onerror = () => { lendoAgora = null; desenharMural(); };
  lendoAgora = id;
  speechSynthesis.speak(fala);
  desenharMural();
}

function pararDeLer(){
  try{ speechSynthesis.cancel(); }catch(e){}
  lendoAgora = null;
}

/* ---------------------------------------------------------
   🌐 TRADUZIR
   Sem chave de nada: usa o tradutor que já vem em alguns
   navegadores; onde não tem, abre o Google Tradutor numa aba.
   --------------------------------------------------------- */
const LINGUAS = [
  { id:'es', nome:'Espanhol 🇪🇸' }, { id:'en', nome:'Inglês 🇺🇸' },
  { id:'ht', nome:'Crioulo haitiano 🇭🇹' }, { id:'fr', nome:'Francês 🇫🇷' },
  { id:'it', nome:'Italiano 🇮🇹' }, { id:'ar', nome:'Árabe 🇸🇦' },
  { id:'zh', nome:'Chinês 🇨🇳' }, { id:'uk', nome:'Ucraniano 🇺🇦' }
];

async function traduzir(id){
  const a = achar(id);
  if(!a) return;
  const qual = prompt('Traduzir pra qual língua?\n\n' +
    LINGUAS.map((l, i) => `${i+1} — ${l.nome}`).join('\n'), '1');
  const l = LINGUAS[(+qual || 0) - 1];
  if(!l) return;

  const caixa = document.getElementById('trad-' + id);
  if(caixa) caixa.innerHTML = '<i>traduzindo...</i>';
  try{
    if('Translator' in window){
      /* Alguns navegadores TÊM o tradutor embutido mas ficam baixando o
         idioma pra sempre. Sem este tempo limite a pessoa fica olhando
         "traduzindo..." e desiste. 6 segundos e a gente vai pro plano B. */
      const saiu = await Promise.race([
        (async () => {
          const t = await window.Translator.create({ sourceLanguage:'pt', targetLanguage: l.id });
          return t.translate(a.txt);
        })(),
        new Promise((_, ruim) => setTimeout(() => ruim(new Error('demorou')), 6000))
      ]);
      if(saiu){
        if(caixa) caixa.innerHTML = `<b>${l.nome}</b><br>${escapar(saiu)}`;
        return;
      }
    }
  }catch(e){}
  /* sem tradutor embutido (ou demorou demais): o Google Tradutor é de graça */
  const url = `https://translate.google.com/?sl=pt&tl=${l.id}&op=translate&text=` +
    encodeURIComponent(a.txt);
  if(caixa) caixa.innerHTML = `<a href="${url}" target="_blank" rel="noopener noreferrer">
    🌐 Abrir a tradução pra ${l.nome}</a>`;
  window.open(url, '_blank', 'noopener');
}

/* ---------------------------------------------------------
   👨‍👩‍👧 FOLHAS PRA LEVAR EM CASA
   --------------------------------------------------------- */
function papelDaTurma(titulo, miolo){
  const folha = document.createElement('div');
  folha.id = 'folha';
  const t = dados.turma || {};
  folha.innerHTML = `
    <h1>${escapar(titulo)}</h1>
    <p class="folha-escola">🏫 ${escapar(t.escola || '')}${t.prof ? ' · ' + escapar(t.prof) : ''}</p>
    <p class="folha-sub">${escapar(t.nome || '')} · ${new Date().toLocaleDateString('pt-BR')}</p>
    ${miolo}
    <p class="folha-pe">Fala, Turma! · quem não tem celular também fica sabendo 💜</p>`;
  document.body.appendChild(folha);
  document.body.classList.add('imprimindo');
  setTimeout(() => {
    window.print();
    setTimeout(() => { folha.remove(); document.body.classList.remove('imprimindo'); }, 400);
  }, 120);
}

function recadoProsPais(){
  const semana = Date.now() - 7 * 86400000;
  const vale = a => ['licao','prova','evento','vaquinha','recado','combinar'].includes(a.tipo);
  const lista = dados.avisos.filter(a => a.ts >= semana && vale(a)).sort((a,b) => b.ts - a.ts);
  if(!lista.length){ aviso('Não tem nada dos últimos 7 dias pra levar 😊', 5000); return; }
  papelDaTurma('Recado da turma para a família', `
    <p style="font-size:11pt;margin-bottom:12pt">Prezada família: estes são os avisos da
    turma nos últimos 7 dias, escritos pelos próprios alunos no mural da turma.</p>
    ${lista.map(a => {
      const t = TIPOS[a.tipo] || {};
      return `<div class="folha-item">
        <div class="folha-topo"><b>${t.emoji || ''} ${t.nome || ''}</b>
          <span>${escapar(a.de)} · ${diaTexto(a.ts)}</span></div>
        ${a.data ? `<div class="folha-quando">📅 ${dataBonita(a.data)}</div>` : ''}
        <div>${escapar(a.txt)}</div>
      </div>`;
    }).join('')}
    <div class="folha-assina">
      <p>Li os avisos acima:</p>
      <div class="linha-assina"></div>
      <small>assinatura do responsável</small>
    </div>`);
}

function autorizacao(){
  const passeios = dados.avisos.filter(a => a.tipo === 'evento')
    .sort((a,b) => (b.data || '').localeCompare(a.data || ''));
  if(!passeios.length){ aviso('Ainda não tem nenhum passeio marcado no mural 😊', 5000); return; }
  const qual = passeios.length === 1 ? passeios[0] : passeios[
    (+prompt('Autorização de qual passeio?\n\n' +
      passeios.map((p, i) => `${i+1} — ${p.txt.slice(0,40)}`).join('\n'), '1') || 0) - 1];
  if(!qual) return;
  const itens = (qual.itens || []).filter(i => i.quem === dados.eu).map(i => i.txt);
  papelDaTurma('Autorização para o passeio', `
    <div class="folha-item">
      <div class="folha-quando">🎉 ${escapar(qual.txt)}</div>
      ${qual.data ? `<p><b>Data:</b> ${dataBonita(qual.data)}</p>` : ''}
      ${qual.lugar ? `<p><b>Local (coordenadas):</b> ${qual.lugar.lat}, ${qual.lugar.lon}</p>` : ''}
      ${itens.length ? `<p><b>${escapar(dados.eu)} ficou de levar:</b> ${itens.map(escapar).join(', ')}</p>` : ''}
    </div>
    <p style="font-size:11pt;margin:14pt 0">Eu, ______________________________________________,
    responsável pelo(a) aluno(a) <b>${escapar(dados.eu)}</b>, autorizo a participação
    no passeio acima.</p>
    <div class="folha-assina">
      <div class="linha-assina"></div>
      <small>assinatura do responsável · data ____/____/______</small>
      <p style="margin-top:14pt;font-size:9pt">Telefone para contato: ______________________</p>
    </div>
    <p style="font-size:8pt;margin-top:14pt;color:#666">Este papel foi montado pelo app da
    turma a partir do que os alunos escreveram no mural. <b>Não substitui a autorização
    oficial da escola</b> — confira com a professora antes.</p>`);
}
