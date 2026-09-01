/* =========================================================
   hoje.js — ☀️ a tela "Hoje", o 💌 recado do dia em cartão
   grande e a tela ℹ️ Sobre.

   O site tinha virado um monte de ferramentas boas mas
   espalhadas. Esta tela junta, num lugar só, o que interessa
   HOJE: os compromissos que ainda vêm, as tarefas que faltam,
   o recado do dia e o aniversário mais perto.
   ========================================================= */

const VERSAO = '3.4.0';

const DIAS_SEMANA = ['domingo','segunda-feira','terça-feira','quarta-feira','quinta-feira','sexta-feira','sábado'];
/* o casa.js já tem um MESES próprio — dois nomes iguais no escopo de
   cima quebrariam o site inteiro */
const MESES_HOJE = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];

function dataPorExtenso(d){
  return `${DIAS_SEMANA[d.getDay()]}, ${d.getDate()} de ${MESES_HOJE[d.getMonth()]}`;
}
const hojeISO = () => new Date().toISOString().slice(0,10);

/* ---------- juntar o que é de hoje ---------- */
function coisasDeHoje(){
  const agora = new Date();
  const hoje = hojeISO();

  /* compromissos de hoje que ainda não passaram (e os de amanhã, se hoje já acabou) */
  const daAgenda = (dados.agenda || [])
    .filter(g => g.dia === hoje)
    .sort((a,b) => (a.hora || '').localeCompare(b.hora || ''));
  const agoraHHMM = String(agora.getHours()).padStart(2,'0') + ':' + String(agora.getMinutes()).padStart(2,'0');
  const queVem = daAgenda.filter(g => !g.hora || g.hora >= agoraHHMM);
  const jaFoi  = daAgenda.filter(g => g.hora && g.hora < agoraHHMM);

  const tarefas = (dados.tarefas || []);
  const faltam  = tarefas.filter(t => !t.feito);
  const feitas  = tarefas.filter(t => t.feito);

  /* o recado do dia mais recente que ainda vale */
  const todosRecados = Object.entries(dados.recados || {})
    .filter(([p, r]) => PESSOAS[p] && typeof recadoValendo === 'function' && recadoValendo(r))
    .sort((a,b) => b[1].ts - a[1].ts);

  /* o aniversário mais próximo */
  let aniversario = null;
  Object.entries(dados.nasc || {}).forEach(([p, iso]) => {
    if(!PESSOAS[p]) return;
    const q = diasParaAniversario(iso);
    if(!q) return;
    if(!aniversario || q.dias < aniversario.dias) aniversario = { pessoa:p, ...q };
  });

  return { queVem, jaFoi, faltam, feitas, todosRecados, aniversario };
}

/* ---------- a tela ---------- */
function abrirHoje(){
  if(document.getElementById('telaHoje')) return;
  const tela = document.createElement('div');
  tela.className = 'tela-cheia hoje'; tela.id = 'telaHoje';
  tela.innerHTML = `
    <div class="w-topo" style="background:linear-gradient(135deg,#7c3aed,#2563eb)">
      <button class="icone" id="hjFechar">✕</button>
      <div><b>☀️ Hoje na família</b><div class="w-sub" id="hjData"></div></div>
      <div class="icones"><button class="icone" id="hjAtualizar" title="Ver de novo">🔄</button></div>
    </div>
    <div class="hj-meio" id="hjMeio"></div>`;
  document.body.appendChild(tela);
  document.getElementById('hjFechar').addEventListener('click', () => tela.remove());
  document.getElementById('hjAtualizar').addEventListener('click', desenharHoje);
  desenharHoje();
}

function desenharHoje(){
  const caixa = document.getElementById('hjMeio');
  if(!caixa) return;
  const d = new Date();
  const cab = document.getElementById('hjData');
  if(cab) cab.textContent = dataPorExtenso(d);

  const { queVem, jaFoi, faltam, feitas, todosRecados, aniversario } = coisasDeHoje();
  const eu = dados.euSou || 'jojo';
  const hora24 = d.getHours();
  const parte = hora24 < 12 ? 'Bom dia' : hora24 < 18 ? 'Boa tarde' : 'Boa noite';

  const blocos = [];

  /* --- saudação --- */
  blocos.push(`
    <div class="hj-ola">
      <div class="hj-av" style="background:linear-gradient(135deg,${PESSOAS[eu].cor},${PESSOAS[eu].cor}bb)">${avatarDe(eu)}</div>
      <div><b>${parte}, ${dados.nome || PESSOAS[eu].curto}!</b>
        <small>${dataPorExtenso(d)}</small></div>
    </div>`);

  /* --- 💌 recado do dia, o cartão grande --- */
  if(todosRecados.length){
    const [quem, r] = todosRecados[0];
    blocos.push(`
      <div class="hj-cartao recado">
        <div class="hj-titulo">💌 Recado do dia</div>
        <div class="rd-quem">
          <span class="hj-av peq" style="background:linear-gradient(135deg,${PESSOAS[quem].cor},${PESSOAS[quem].cor}bb)">${avatarDe(quem)}</span>
          ${nomeDe(quem)} · ${hora(r.ts)}
        </div>
        <div class="rd-frase" id="rdFrase">“${escapar(r.txt)}”</div>
        <div class="rd-botoes">
          <button class="rd-bt ${(dados.gostei||{})[quem+':'+r.ts] ? 'on' : ''}" data-rd="gostei">❤️ ${(dados.gostei||{})[quem+':'+r.ts] ? 'Gostei' : 'Gostar'}</button>
          <button class="rd-bt" data-rd="ouvir">🔊 Ouvir</button>
          <button class="rd-bt" data-rd="fixar">📌 Fixar</button>
          ${quem === eu ? `<button class="rd-bt" data-rd="trocar">✏️ Trocar</button>`
                        : `<button class="rd-bt" data-rd="responder">↩️ Responder</button>`}
        </div>
      </div>`);
  }else{
    blocos.push(`
      <button class="hj-cartao vazio" data-hj="recado">
        <div class="hj-titulo">💌 Recado do dia</div>
        <p>Ninguém disse nada ainda hoje. <b>Toca aqui</b> pra contar o que tu está fazendo.</p>
      </button>`);
  }

  /* --- ⏰ compromissos --- */
  blocos.push(`
    <div class="hj-cartao">
      <div class="hj-titulo">⏰ Próximos compromissos</div>
      ${queVem.length ? queVem.map(g => `
        <div class="hj-linha">
          <b class="hj-hora">${g.hora || '--:--'}</b>
          <span class="hj-txt">${escapar(g.txt)}</span>
          <small>${PESSOAS[g.quem] ? PESSOAS[g.quem].emoji : ''}</small>
        </div>`).join('')
      : `<p class="hj-nada">${jaFoi.length ? 'Tudo de hoje já passou 🎉' : 'Nada marcado pra hoje 😌'}</p>`}
      ${jaFoi.length ? `<div class="hj-passado">${jaFoi.length} já passou${jaFoi.length > 1 ? 'ram' : ''} hoje</div>` : ''}
      <button class="hj-mais" data-hj="agenda">📅 Ver a agenda toda</button>
    </div>`);

  /* --- ✅ tarefas --- */
  blocos.push(`
    <div class="hj-cartao">
      <div class="hj-titulo">✅ Tarefas</div>
      ${faltam.length ? faltam.slice(0,5).map(t => `
        <button class="hj-linha tarefa" data-fazer="${t.id}">
          <span class="hj-check">⬜</span>
          <span class="hj-txt">${escapar(t.txt)}</span>
          <small>${PESSOAS[t.dono] ? PESSOAS[t.dono].emoji : ''} ${t.pontos}⭐</small>
        </button>`).join('')
      : `<p class="hj-nada">Nenhuma tarefa esperando 🎉</p>`}
      ${faltam.length > 5 ? `<div class="hj-passado">e mais ${faltam.length - 5}...</div>` : ''}
      ${feitas.length ? `<div class="hj-passado">☑️ ${feitas.length} já feita${feitas.length > 1 ? 's' : ''}</div>` : ''}
      <button class="hj-mais" data-hj="tarefas">✅ Ver todas as tarefas</button>
    </div>`);

  /* --- 🎂 aniversário --- */
  if(aniversario){
    const a = aniversario;
    blocos.push(`
      <div class="hj-cartao ${a.dias === 0 ? 'festa' : ''}">
        <div class="hj-titulo">🎂 Aniversário</div>
        <div class="hj-aniv">
          <span class="hj-av" style="background:linear-gradient(135deg,${PESSOAS[a.pessoa].cor},${PESSOAS[a.pessoa].cor}bb)">${avatarDe(a.pessoa)}</span>
          <div>
            <b>${nomeDe(a.pessoa)}</b>
            <small>${a.dias === 0 ? `🎉 É HOJE! Faz ${a.idade} anos`
              : a.dias === 1 ? '🎉 É amanhã!'
              : `🎉 Faltam ${a.dias} dias`}</small>
          </div>
        </div>
        ${a.dias <= 7 ? `<button class="hj-mais" data-hj="cartao">🎂 Preparar o cartão surpresa</button>` : ''}
      </div>`);
  }

  caixa.innerHTML = blocos.join('');

  /* ligações */
  caixa.querySelectorAll('[data-hj]').forEach(b => b.addEventListener('click', () => {
    const a = b.dataset.hj;
    if(a === 'agenda'){ document.getElementById('telaHoje')?.remove(); abrirAgenda(); }
    if(a === 'tarefas'){ document.getElementById('telaHoje')?.remove(); abrirTarefas(); }
    if(a === 'cartao'){ document.getElementById('telaHoje')?.remove(); abrirCartoes(); }
    if(a === 'recado'){ escreverMeuRecado(); }
  }));
  caixa.querySelectorAll('[data-fazer]').forEach(b => b.addEventListener('click', () => {
    marcarTarefa(b.dataset.fazer);
    desenharHoje();
  }));
  caixa.querySelectorAll('[data-rd]').forEach(b => b.addEventListener('click', () => acaoDoRecado(b.dataset.rd)));
}

/* ---------- os botões do cartão do recado ---------- */
function acaoDoRecado(acao){
  const { todosRecados } = coisasDeHoje();
  if(!todosRecados.length) return;
  const [quem, r] = todosRecados[0];

  if(acao === 'gostei'){
    dados.gostei = dados.gostei || {};
    const k = quem + ':' + r.ts;
    if(dados.gostei[k]) delete dados.gostei[k];
    else { dados.gostei[k] = Date.now(); blim(true); }
    salvar(); desenharHoje();
    return;
  }
  if(acao === 'ouvir'){
    if(!('speechSynthesis' in window)){ toast('Este aparelho não sabe ler em voz alta 😕'); return; }
    if(speechSynthesis.speaking){ speechSynthesis.cancel(); return; }
    const fala = new SpeechSynthesisUtterance(`${nomeDe(quem)} disse: ${r.txt}`);
    fala.lang = 'pt-BR'; fala.rate = .95;
    speechSynthesis.speak(fala);
    toast('Lendo... 🗣️');
    return;
  }
  if(acao === 'fixar'){
    const msg = { t:`💌 ${nomeDe(quem)}: ${r.txt}`, de: dados.euSou || autor, ts: Date.now() };
    dados.msgs.familia.push(msg);
    dados.fixado = dados.fixado || {};
    dados.fixado.familia = dados.msgs.familia.length - 1;
    salvar(); mandarPraNuvem('familia', msg);
    desenharContatos();
    toast('📌 Fixado na conversa da família');
    return;
  }
  if(acao === 'trocar'){ escreverMeuRecado(); return; }
  if(acao === 'responder'){
    document.getElementById('telaHoje')?.remove();
    const eu = dados.euSou || 'jojo';
    abrir(quem === eu ? 'familia' : idDupla(eu, quem));
    setTimeout(() => {
      const campo = document.getElementById('entrada');
      if(!campo) return;
      campo.value = `Sobre "${r.txt}": `;
      campo.focus(); crescer(campo); modoBotao();
    }, 250);
  }
}

/* ---------- ℹ️ Sobre ---------- */
function abrirSobre(){
  if(document.getElementById('telaSobre')) return;
  const n = dados.nuvem || {};
  const ligado = typeof nuvemLigada === 'function' && nuvemLigada();
  const temChave = !!n.segredo || !!n.senha;
  const bk = dados.ultimoBackup;

  const tela = document.createElement('div');
  tela.className = 'tela-cheia ficha'; tela.id = 'telaSobre';
  tela.innerHTML = `
    <div class="w-topo" style="background:linear-gradient(135deg,#7c3aed,#2563eb)">
      <button class="icone" id="sbFechar">✕</button>
      <div><b>ℹ️ Sobre</b><div class="w-sub">Fala, Família! v${VERSAO}</div></div>
    </div>
    <div class="fi-meio">
      <div class="sb-topo">
        <div class="balao-deco">💜</div>
        <h2>Fala, Família!</h2>
        <div class="sb-versao">v${VERSAO}</div>
        <p class="sem-lembrete">Feito pelo Jojo pra falar com o papai, a mamãe e a Sofia.</p>
      </div>
      <div class="sb-linhas">
        <div class="sb-linha"><b>Guardado neste aparelho</b><span class="sb-ok">✅ Sim</span></div>
        <div class="sb-linha"><b>Enviando pros outros</b>
          <span class="${ligado ? 'sb-ok' : 'sb-off'}">${ligado ? '🔵 Ligado' : '⚪ Desligado'}</span></div>
        <div class="sb-linha"><b>Conversas embaralhadas</b>
          <span class="${ligado ? (temChave ? 'sb-ok' : 'sb-aviso') : 'sb-off'}">${
            !ligado ? '⚪ nada sai daqui' : temChave ? '🔒 com chave da família' : '🔓 sem chave própria'}</span></div>
        <div class="sb-linha"><b>Tranca do chat</b>
          <span class="${temTranca() ? 'sb-ok' : 'sb-off'}">${temTranca() ? '🔒 Ligada' : '⚪ Desligada'}</span></div>
        <div class="sb-linha"><b>🤖 Ajudante</b>
          <span class="${temChaveIA() ? 'sb-ok' : 'sb-off'}">${temChaveIA() ? '✅ Configurado' : '⚪ Sem chave'}</span></div>
        <div class="sb-linha"><b>Último backup</b>
          <span class="${bk ? 'sb-ok' : 'sb-aviso'}">${bk ? diaTexto(bk.ts) + ' ' + hora(bk.ts) : '⚠️ nunca'}</span></div>
      </div>
      <div class="bloco-titulo">O que tem guardado</div>
      <div class="sb-numeros" id="sbNumeros"></div>
      <p class="sem-lembrete" style="margin-top:14px">Este site é só de vocês. Não tem propaganda, não tem
      cadastro e ninguém está olhando. O que sai daqui é o que vocês mandarem.</p>
    </div>`;
  document.body.appendChild(tela);
  document.getElementById('sbFechar').addEventListener('click', () => tela.remove());
  contarTudoGuardado().then(c => {
    const caixa = document.getElementById('sbNumeros');
    if(!caixa) return;
    caixa.innerHTML = [
      ['💬', c.msgs, 'recadinhos'], ['🖼️', c.fotos, 'fotos'], ['🎤', c.audios, 'áudios'],
      ['🎥', c.videos, 'vídeos'], ['✅', c.tarefas, 'tarefas'], ['📚', c.livros, 'livros']
    ].map(([e, n, nome]) => `<div class="sb-num"><b>${e} ${n}</b><small>${nome}</small></div>`).join('');
  });
}

/* conta o que existe — usado no Sobre e no resumo do backup */
async function contarTudoGuardado(){
  const c = { msgs:0, fotos:0, audios:0, videos:0, tarefas:(dados.tarefas||[]).length,
              livros:(dados.livros||[]).length, arquivos:0, bytes:0 };
  const ids = new Set();
  Object.values(dados.msgs || {}).forEach(lista => lista.forEach(m => {
    if(m.apagado) return;
    c.msgs++;
    if(m.tipo === 'foto') c.fotos++;
    else if(m.tipo === 'audio') c.audios++;
    else if(m.tipo === 'video') c.videos++;
    if(m.id) ids.add(m.id);
  }));
  Object.values(dados.fotos || {}).forEach(id => ids.add(id));
  for(const id of ids){
    try{
      const blob = await pegarAudio(id);
      if(blob){ c.arquivos++; c.bytes += blob.size; }
    }catch(e){}
  }
  return c;
}
