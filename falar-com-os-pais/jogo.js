/* =========================================================
   jogo.js — jogo da velha dentro da conversa.
   Os dois jogam no mesmo aparelho, cada um na sua vez,
   trocando no botão "Falando como".
   ========================================================= */

const VITORIAS = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];

function novoJogo(){
  const c = conversaPor(atual);
  const adversario = c.pessoa || c.quem.find(p => p !== autor) || 'pai';
  dados.msgs[atual].push({
    tipo:'jogo',
    tab: Array(9).fill(null),
    x: autor,                         // quem começou joga de ❌
    o: adversario === autor ? (c.quem.find(p => p !== autor) || 'pai') : adversario,
    vez: 'x',
    de: autor, ts: Date.now()
  });
  dados.visto[atual] = Date.now();
  dados.presenca[autor] = Date.now();
  animar = dados.msgs[atual].length - 1;
  salvar(); blim(true);
  desenharMensagens(); desenharContatos();
}

function ganhador(tab){
  for(const [a,b,c] of VITORIAS)
    if(tab[a] && tab[a] === tab[b] && tab[b] === tab[c]) return { quem: tab[a], linha:[a,b,c] };
  return tab.every(Boolean) ? { quem:'velha', linha:[] } : null;
}

function jogar(indice, casa){
  const m = dados.msgs[atual][indice];
  if(!m || m.tipo !== 'jogo' || m.tab[casa]) return;
  if(ganhador(m.tab)) return;

  const daVez = m.vez === 'x' ? m.x : m.o;
  if(autor !== daVez){
    toast(`Agora é a vez de ${daVez === 'eu' ? 'quem começou' : PESSOAS[daVez].curto} 😊`);
    return;
  }
  m.tab[casa] = m.vez;
  m.vez = m.vez === 'x' ? 'o' : 'x';
  marcarPresenca(autor);
  const fim = ganhador(m.tab);
  salvar(); blim(true);
  desenharMensagens(); desenharContatos();
  if(fim){
    const vencedor = fim.quem === 'x' ? m.x : m.o;
    toast(fim.quem === 'velha' ? 'Deu velha! 🤝'
        : vencedor === 'eu' ? 'Tu ganhou! 🎉' : `${PESSOAS[vencedor].curto} ganhou! 🎉`);
  }
}

function balaoJogo(m, indice){
  const fim = ganhador(m.tab);
  const nome = p => p === 'eu' ? 'Eu' : PESSOAS[p].curto;
  const casas = m.tab.map((v,k) => `
    <button class="casa ${v || ''} ${fim && fim.linha.includes(k) ? 'ganhou' : ''}"
      data-jogo="${indice}:${k}" ${v || fim ? 'disabled' : ''}>${v === 'x' ? '❌' : v === 'o' ? '⭕' : ''}</button>`).join('');
  const vencedor = fim && (fim.quem === 'x' ? m.x : m.o);
  const daVez = m.vez === 'x' ? m.x : m.o;
  const recado = fim
    ? (fim.quem === 'velha' ? '🤝 Deu velha!'
      : vencedor === 'eu' ? '🎉 Tu ganhou!' : `🎉 ${nome(vencedor)} ganhou!`)
    : `${daVez === 'eu' ? 'Tua vez' : 'Vez d' + (nome(daVez) === 'Papai' ? 'o papai' : 'a ' + nome(daVez))} ${m.vez === 'x' ? '❌' : '⭕'}`;
  return `
    <div class="jogo">
      <div class="jogo-topo">🕹️ Jogo da velha</div>
      <div class="jogo-times">❌ ${nome(m.x)} &nbsp;•&nbsp; ⭕ ${nome(m.o)}</div>
      <div class="tabuleiro">${casas}</div>
      <div class="jogo-vez ${fim ? 'fim' : ''}">${recado}</div>
    </div>`;
}
