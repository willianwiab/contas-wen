/* =========================================================
   placar.js — 📊 quem falou mais.

   Um placar bobo e divertido, feito com o que já está guardado
   no aparelho: ninguém precisa contar nada, é só olhar as
   conversas. Cada aparelho conta o que ELE tem — com o ☁️
   ligado, todo mundo tem quase a mesma coisa.
   ========================================================= */

function contarTudo(){
  const zero = () => ({ recados:0, letras:0, audios:0, fotos:0, videos:0,
                        emojis:0, reacoes:0, jogos:0, cedo:0, tarde:0, dias:new Set() });
  const conta = {};
  TODOS.forEach(p => conta[p] = zero());

  const soEmojis = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu;

  Object.values(dados.msgs).forEach(lista => lista.forEach(m => {
    const c = conta[m.de];
    if(!c || m.apagado) return;
    c.recados++;
    c.dias.add(new Date(m.ts).toDateString());
    const h = new Date(m.ts).getHours();
    if(h < 8) c.cedo++;
    if(h >= 22 || h < 4) c.tarde++;
    if(m.tipo === 'audio') c.audios++;
    else if(m.tipo === 'foto') c.fotos++;
    else if(m.tipo === 'video') c.videos++;
    else if(m.tipo === 'jogo' || m.tipo === 'ppt' || m.tipo === 'forca') c.jogos++;
    else if(!m.tipo){
      c.letras += (m.t || '').length;
      c.emojis += ((m.t || '').match(soEmojis) || []).length;
    }
    if(m.r) c.reacoes++;
  }));

  TODOS.forEach(p => conta[p].dias = conta[p].dias.size);
  return conta;
}

/* Cada medalha é uma pergunta: quem tem o maior número disso? */
const MEDALHAS = [
  { id:'recados', emoji:'💬', titulo:'Tagarela',      conta:'recados', unidade:'recados' },
  { id:'letras',  emoji:'📝', titulo:'Escrevinhador', conta:'letras',  unidade:'letrinhas' },
  { id:'audios',  emoji:'🎤', titulo:'Boca de rádio', conta:'audios',  unidade:'áudios' },
  { id:'fotos',   emoji:'📷', titulo:'Fotógrafo',     conta:'fotos',   unidade:'fotos' },
  { id:'videos',  emoji:'🎥', titulo:'Cineasta',      conta:'videos',  unidade:'videinhos' },
  { id:'emojis',  emoji:'😄', titulo:'Rei do emoji',  conta:'emojis',  unidade:'emojis' },
  { id:'jogos',   emoji:'🕹️', titulo:'Jogador',       conta:'jogos',   unidade:'jogos' },
  { id:'cedo',    emoji:'🌅', titulo:'Passarinho',    conta:'cedo',    unidade:'recados antes das 8h' },
  { id:'tarde',   emoji:'🦉', titulo:'Coruja',        conta:'tarde',   unidade:'recados de madrugada' },
  { id:'dias',    emoji:'📅', titulo:'Presente',      conta:'dias',    unidade:'dias falando' }
];

function abrirPlacar(){
  if(document.getElementById('telaPlacar')) return;
  const conta = contarTudo();
  const total = TODOS.reduce((s,p) => s + conta[p].recados, 0);

  /* a barra de quem falou mais */
  const porRecados = TODOS.slice().sort((a,b) => conta[b].recados - conta[a].recados);
  const maior = conta[porRecados[0]].recados || 1;

  const barras = porRecados.map(p => `
    <div class="pl-linha">
      <div class="pl-av" style="background:linear-gradient(135deg,${PESSOAS[p].cor},${PESSOAS[p].cor}bb)">${avatarDe(p)}</div>
      <div class="pl-barra-fora">
        <div class="pl-barra" style="width:${Math.max(6, conta[p].recados / maior * 100)}%;background:${PESSOAS[p].cor}"></div>
      </div>
      <div class="pl-conta"><b>${conta[p].recados}</b><small>${total ? Math.round(conta[p].recados / total * 100) : 0}%</small></div>
      <div class="pl-nome">${nomeDe(p)}</div>
    </div>`).join('');

  const medalhas = MEDALHAS.map(md => {
    const campeao = TODOS.slice().sort((a,b) => conta[b][md.conta] - conta[a][md.conta])[0];
    const quanto = conta[campeao][md.conta];
    if(!quanto) return '';
    return `
      <div class="pl-medalha">
        <div class="pl-md-emoji">${md.emoji}</div>
        <div class="pl-md-txt"><b>${md.titulo}</b><small>${nomeDe(campeao)} — ${quanto} ${md.unidade}</small></div>
      </div>`;
  }).filter(Boolean).join('');

  const tela = document.createElement('div');
  tela.className = 'tela-cheia'; tela.id = 'telaPlacar';
  tela.innerHTML = `
    <div class="w-topo" style="background:linear-gradient(135deg,#f59e0b,#ec4899)">
      <button class="icone" id="plFechar">✕</button>
      <div><b>📊 Quem falou mais</b><div class="w-sub">${total} recados no total</div></div>
    </div>
    <div class="pl-meio">
      ${total ? `
        <div class="bloco-titulo">💬 Recados de cada um</div>
        <div class="pl-barras">${barras}</div>
        <div class="bloco-titulo">🏅 As medalhas</div>
        <div class="pl-medalhas">${medalhas}</div>
        <p class="sem-lembrete" style="margin-top:14px">Isto é contado com o que está guardado <b>neste</b> aparelho.
        Quem entrou na conversa depois pode ver números um pouquinho diferentes. É só brincadeira 😄</p>`
      : `<div class="ia-aviso"><div class="balao-deco">📊</div><h3>Ainda não tem nada pra contar</h3>
         <p>Manda uns recadinhos e volta aqui pra ver quem tá ganhando!</p></div>`}
    </div>`;
  document.body.appendChild(tela);
  document.getElementById('plFechar').addEventListener('click', () => tela.remove());
}
