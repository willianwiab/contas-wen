/* ============================================================
   JOGOS DO JOJO — about.js
   Seção "Sobre Mim":
   1. Se data/about.json já estiver preenchido → mostra a biografia.
   2. Senão → entrevista interativa em formato de chat.
      As respostas geram uma biografia automaticamente, que pode
      ser copiada ou baixada como about.json para publicar no site.
   As respostas também ficam salvas no localStorage do navegador.
   ============================================================ */

(async function iniciarSobre() {
  const alvo = document.getElementById('conteudo-sobre');
  const subtitulo = document.getElementById('sobre-sub');
  const CHAVE_STORAGE = 'jojo-entrevista';

  /* As 12 perguntas da entrevista. A "chave" liga cada resposta
     ao campo correspondente no about.json. */
  const PERGUNTAS = [
    { chave: 'nome', texto: 'Olá! 👋 Vamos criar sua biografia. Primeiro: qual é seu nome?' },
    { chave: 'idade', texto: 'Legal! Quantos anos você tem?' },
    { chave: 'desdeQuandoGostaDeJogos', texto: 'Desde quando você gosta de jogos?' },
    { chave: 'primeiroJogo', texto: 'Qual foi o primeiro jogo que você jogou (ou criou)?' },
    { chave: 'comoComecouAProgramar', texto: 'Como você começou a programar?' },
    { chave: 'sonhos', texto: 'Quais são seus sonhos? ✨' },
    { chave: 'jogosFavoritos', texto: 'Quais são seus jogos favoritos?' },
    { chave: 'quemInspira', texto: 'Quem te inspira?' },
    { chave: 'oQueDesejaCriar', texto: 'O que você deseja criar no futuro?' },
    { chave: 'maiorConquista', texto: 'Qual foi sua maior conquista até agora? 🏆' },
    { chave: 'outrasAtividades', texto: 'O que você faz além de criar jogos?' },
    { chave: 'comoQuerSerLembrado', texto: 'Última pergunta: como você gostaria de ser lembrado?' },
  ];

  // 1) Tenta usar o about.json publicado no site
  let aboutPublicado = null;
  try {
    aboutPublicado = await carregarJSON('about.json');
  } catch (erro) {
    console.warn('about.json não encontrado:', erro);
  }

  if (aboutPublicado && aboutPublicado.preenchido && aboutPublicado.biografia) {
    mostrarBiografia(aboutPublicado.respostas || {}, aboutPublicado.biografia, false);
    return;
  }

  // 2) Se o visitante já respondeu neste navegador, mostra a bio salva
  const salvo = lerStorage();
  if (salvo && salvo.concluida) {
    mostrarBiografia(salvo.respostas, gerarBiografia(salvo.respostas), true);
    return;
  }

  // 3) Caso contrário, inicia a entrevista
  iniciarEntrevista(salvo);

  /* ---------------- Entrevista (chat) ---------------- */

  function iniciarEntrevista(estadoSalvo) {
    const respostas = (estadoSalvo && estadoSalvo.respostas) || {};
    let indice = (estadoSalvo && estadoSalvo.indice) || 0;

    alvo.innerHTML = `
      <div class="chat-box reveal visible">
        <div class="chat-header">
          <div class="avatar">🎮</div>
          <div>
            <strong>Entrevista com o JoJo</strong>
            <div style="font-size:0.8rem; color:var(--text-dim);">
              <span id="progresso-texto">Pergunta 1 de ${PERGUNTAS.length}</span>
            </div>
          </div>
        </div>
        <div class="chat-progress"><div class="bar" id="barra-progresso"></div></div>
        <div class="chat-messages" id="mensagens"></div>
        <form class="chat-input" id="form-chat">
          <input id="campo-resposta" type="text" placeholder="Digite sua resposta..." autocomplete="off" required />
          <button class="btn btn-primary btn-sm" type="submit">Enviar ➤</button>
        </form>
      </div>
    `;

    const mensagens = document.getElementById('mensagens');
    const form = document.getElementById('form-chat');
    const campo = document.getElementById('campo-resposta');

    // Reexibe conversas anteriores se a pessoa parou no meio
    PERGUNTAS.slice(0, indice).forEach((p) => {
      adicionarMensagem('bot', p.texto);
      adicionarMensagem('user', respostas[p.chave]);
    });

    fazerPergunta();

    form.addEventListener('submit', (evento) => {
      evento.preventDefault();
      const texto = campo.value.trim();
      if (!texto) return;

      adicionarMensagem('user', texto);
      respostas[PERGUNTAS[indice].chave] = texto;
      indice++;
      campo.value = '';

      salvarStorage({ respostas, indice, concluida: indice >= PERGUNTAS.length });

      if (indice < PERGUNTAS.length) {
        // Pequena pausa para parecer uma conversa de verdade
        setTimeout(fazerPergunta, 450);
      } else {
        setTimeout(() => {
          adicionarMensagem('bot', 'Incrível! 🎉 Gerando sua biografia...');
          setTimeout(() => mostrarBiografia(respostas, gerarBiografia(respostas), true), 1200);
        }, 450);
      }
    });

    function fazerPergunta() {
      adicionarMensagem('bot', PERGUNTAS[indice].texto);
      atualizarProgresso();
      campo.focus();
    }

    function adicionarMensagem(autor, texto) {
      const div = document.createElement('div');
      div.className = `msg ${autor}`;
      div.textContent = texto;
      mensagens.appendChild(div);
      mensagens.scrollTop = mensagens.scrollHeight;
    }

    function atualizarProgresso() {
      document.getElementById('barra-progresso').style.width =
        `${(indice / PERGUNTAS.length) * 100}%`;
      document.getElementById('progresso-texto').textContent =
        `Pergunta ${Math.min(indice + 1, PERGUNTAS.length)} de ${PERGUNTAS.length}`;
    }
  }

  /* ---------------- Geração da biografia ----------------
     Monta um texto bonito usando SOMENTE o que foi respondido —
     nada é inventado. Frases de campos vazios são omitidas. */

  function gerarBiografia(r) {
    const paragrafos = [];

    const abertura = [];
    if (r.nome) abertura.push(`Olá! Eu sou ${r.nome}`);
    if (r.idade) abertura.push(`tenho ${r.idade}`);
    if (abertura.length) {
      paragrafos.push(
        `${abertura.join(', ')} — e criar jogos é a minha forma favorita de dar vida à imaginação. 🎮`
      );
    }

    const origem = [];
    if (r.desdeQuandoGostaDeJogos) origem.push(`Minha paixão por jogos existe ${prepararFrase(r.desdeQuandoGostaDeJogos)}`);
    if (r.primeiroJogo) origem.push(`tudo começou com ${r.primeiroJogo}, o primeiro jogo que marcou minha vida`);
    if (origem.length) paragrafos.push(`${origem.join(', e ')}.`);

    if (r.comoComecouAProgramar) {
      paragrafos.push(`Minha jornada na programação começou assim: ${r.comoComecouAProgramar}`);
    }

    const gostos = [];
    if (r.jogosFavoritos) gostos.push(`Entre meus jogos favoritos estão ${r.jogosFavoritos}`);
    if (r.quemInspira) gostos.push(`minha grande inspiração vem de ${r.quemInspira}`);
    if (gostos.length) paragrafos.push(`${gostos.join(', e ')}.`);

    if (r.maiorConquista) {
      paragrafos.push(`Minha maior conquista até agora? ${r.maiorConquista} 🏆`);
    }

    const futuro = [];
    if (r.oQueDesejaCriar) futuro.push(`No futuro, quero criar ${prepararFrase(r.oQueDesejaCriar)}`);
    if (r.sonhos) futuro.push(`meu sonho é ${prepararFrase(r.sonhos)}`);
    if (futuro.length) paragrafos.push(`${futuro.join(', e ')}.`);

    if (r.outrasAtividades) {
      paragrafos.push(`Quando não estou criando jogos, você me encontra assim: ${r.outrasAtividades}`);
    }

    if (r.comoQuerSerLembrado) {
      paragrafos.push(`E se um dia perguntarem quem foi o JoJo, quero que lembrem disto: ${r.comoQuerSerLembrado} ✨`);
    }

    return paragrafos.join('\n\n');
  }

  /* Deixa a resposta encaixar melhor na frase (minúscula inicial, sem ponto final) */
  function prepararFrase(texto) {
    const limpo = texto.trim().replace(/\.$/, '');
    return limpo.charAt(0).toLowerCase() + limpo.slice(1);
  }

  /* ---------------- Exibição da biografia ---------------- */

  function mostrarBiografia(respostas, biografia, ehLocal) {
    subtitulo.textContent = ehLocal
      ? 'Biografia gerada a partir das suas respostas. Baixe o about.json para publicá-la no site!'
      : 'A pessoa por trás dos jogos.';

    const paragrafosHTML = biografia
      .split('\n\n')
      .map((p) => `<p>${esc(p)}</p>`)
      .join('');

    alvo.innerHTML = `
      <div class="bio-card reveal visible">
        <h2>${respostas.nome ? `🎮 ${esc(respostas.nome)}` : '🎮 Minha História'}</h2>
        ${paragrafosHTML}
        ${
          ehLocal
            ? `<div class="bio-actions">
                 <button class="btn btn-primary btn-sm" id="btn-baixar">⬇ Baixar about.json</button>
                 <button class="btn btn-ghost btn-sm" id="btn-copiar">📋 Copiar biografia</button>
                 <button class="btn btn-ghost btn-sm" id="btn-refazer">🔄 Refazer entrevista</button>
               </div>
               <p style="font-size:0.82rem; color:var(--text-dim); margin-top:16px;">
                 💡 Para publicar: baixe o arquivo e substitua <code>data/about.json</code> no repositório.
               </p>`
            : ''
        }
      </div>
    `;

    if (!ehLocal) return;

    // Baixa o about.json pronto para substituir o do repositório
    document.getElementById('btn-baixar').addEventListener('click', () => {
      const conteudo = JSON.stringify(
        { preenchido: true, respostas, biografia },
        null,
        2
      );
      const blob = new Blob([conteudo], { type: 'application/json' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'about.json';
      link.click();
      URL.revokeObjectURL(link.href);
    });

    document.getElementById('btn-copiar').addEventListener('click', async (e) => {
      await navigator.clipboard.writeText(biografia);
      e.target.textContent = '✅ Copiado!';
      setTimeout(() => (e.target.textContent = '📋 Copiar biografia'), 2000);
    });

    document.getElementById('btn-refazer').addEventListener('click', () => {
      localStorage.removeItem(CHAVE_STORAGE);
      window.location.reload();
    });
  }

  /* ---------------- localStorage ---------------- */

  function lerStorage() {
    try {
      return JSON.parse(localStorage.getItem(CHAVE_STORAGE));
    } catch {
      return null;
    }
  }

  function salvarStorage(estado) {
    localStorage.setItem(CHAVE_STORAGE, JSON.stringify(estado));
  }
})();
