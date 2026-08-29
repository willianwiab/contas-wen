/* =========================================================
   ajuda.js — a tela "Como usar": tudo que o site faz,
   explicado do jeito que a gente fala.
   ========================================================= */

const AJUDA = [
  {
    titulo:'📋 Na primeira tela (a lista)',
    cor:'#7c3aed',
    itens:[
      ['4 conversas','👨 Papai, 👩 Mamãe, 👧 Sofia e 💜 Família (todo mundo junto)'],
      ['🔍 Procurar conversa','a barrinha lá em cima da lista'],
      ['✅ Tarefas, 🖼️ Álbum e 📅 Agenda','os três botões coloridos embaixo da lista'],
      ['🐣 O bichinho','o cartãozinho acima dos botões — toca nele pra ver o nível'],
      ['🌙 / ☀️','troca o tema claro e escuro'],
      ['⚙️','abre os ajustes'],
      ['🟢 e 🔴','bolinha verde em quem mexeu no chat faz pouco, e o número de recadinhos não lidos']
    ]
  },
  {
    titulo:'💬 Dentro de uma conversa',
    cor:'#0ea5e9',
    itens:[
      ['Escrever e mandar','Enter manda, Shift+Enter pula linha'],
      ['Falando como','troca entre 🧒 Eu / 👨 Papai / 👩 Mamãe / 👧 Sofia pra cada um responder'],
      ['Frases prontas','“Cheguei bem 🏠”, “Pode me buscar? 🚗”…'],
      ['😀 Emojis','emoji sozinho vira <b>gigante</b>'],
      ['🎤 Microfone','toca pra gravar, toca no ⏹ pra mandar (🗑️ joga fora)'],
      ['No áudio','▶ tocar e 🎛️ voz de esquilo 🐿️, monstro 👹 ou robô 🤖'],
      ['☺ Reagir','no balão — ou dois cliques nele. O ✕ apaga um recadinho'],
      ['↩ Responder','cita o recado da pessoa em cima da tua resposta'],
      ['📌 Fixar','põe o recado lá no topo da conversa (o ✕ tira)'],
      ['📻 e 📞 no topo','walkie-talkie e ligação (só voz ou com vídeo)'],
      ['⋯ Menu do topo','🔍 procurar na conversa, 📋 copiar tudo, 🗑️ apagar a conversa']
    ]
  },
  {
    titulo:'➕ O botão de mais coisas',
    cor:'#ec4899',
    itens:[
      ['📷 Foto ou GIF','o GIF continua se mexendo — toca na foto pra ver grande'],
      ['🎥 Videinho da câmera','até 15 segundos, com botão de virar a câmera'],
      ['🎞️ GIF caseiro','2 segundos que ficam repetindo'],
      ['✏️ Recado desenhado','desenha com cores e manda como figurinha'],
      ['😄 Figurinhas','emoji gigante num toque'],
      ['📊 Enquete','pergunta + até 4 respostas, todo mundo vota'],
      ['🕹️ Jogo da velha','joga com quem estiver junto, cada um na sua vez pelo “Falando como”'],
      ['🕰️ Cápsula do tempo','recado que fica trancado até o dia que tu escolher'],
      ['🗺️ Mandar onde eu estou','usa o GPS e manda o lugar, com botão de ver no mapa'],
      ['🎺 Figurinhas de som','buzina, palmas, tambor, risada, sino, foguete…'],
      ['⏱️ Cronômetro','combina um tempo (2 min de escovar dente) e toca o alarme no fim']
    ]
  },
  {
    titulo:'⚙️ Nos ajustes',
    cor:'#16a34a',
    itens:[
      ['Teu apelido','aparece no “bom dia” lá em cima'],
      ['🖼️ Foto de cada um','toca no bonequinho pra escolher a foto'],
      ['🔊 Som e 🌙 Tema escuro','liga e desliga'],
      ['🔔 Avisos','notificação quando chega recadinho novo'],
      ['⏰ Lembretes','ex.: “21:00 — dar boa noite”'],
      ['🎂 Aniversários','põe a data de cada um e a lista avisa quantos dias faltam'],
      ['🔒 Tranca do chat','senha de 4 números pedida ao abrir (tem dica depois de 3 erros)'],
      ['💾 Salvar num arquivo','e 📂 abrir em outro celular, com áudios e fotos junto']
    ]
  },
  {
    titulo:'✅ Na tela de tarefas',
    cor:'#f59e0b',
    itens:[
      ['Criar tarefa','escreve, escolhe quem faz e quantas ⭐ vale'],
      ['Marcar ✔️','quando fizer, a pessoa ganha os pontos no placar']
    ]
  },
  {
    titulo:'🤔 Coisas importantes de saber',
    cor:'#64748b',
    itens:[
      ['Tudo fica neste aparelho','nada é enviado pra internet — nem os áudios, nem as fotos. Por isso existe o 💾 backup'],
      ['📞 A ligação','os dois precisam estar com o site aberto ao mesmo tempo e trocar o código. No wi-fi quase sempre funciona; no 4G às vezes não conecta'],
      ['🔔 Os avisos','funcionam com o site aberto ou atrás de outro app. Com o celular guardado e o app fechado, não dá (precisaria de servidor)'],
      ['🎤 Microfone e câmera','só funcionam abrindo pelo link (https), não no arquivo solto'],
      ['🔒 A tranca','é uma cortina pra ninguém xeretar sem querer, não é um cofre: os recadinhos continuam guardados no aparelho']
    ]
  }
];

function abrirAjuda(){
  if(document.getElementById('telaAjuda')) return;
  const tela = document.createElement('div');
  tela.className = 'tela-cheia';
  tela.id = 'telaAjuda';
  tela.innerHTML = `
    <div class="w-topo">
      <button class="icone" id="ajFechar">✕</button>
      <div><b>❓ Como usar</b><div class="w-sub">tudo que dá pra fazer aqui</div></div>
    </div>
    <div class="aj-meio">
      ${AJUDA.map(bloco => `
        <div class="aj-bloco" style="border-color:${bloco.cor}">
          <h3 style="color:${bloco.cor}">${bloco.titulo}</h3>
          ${bloco.itens.map(([o, que]) => `
            <div class="aj-item"><b>${o}</b><span>${que}</span></div>`).join('')}
        </div>`).join('')}
      <p class="aj-fim">Feito com 💜 pra família. Se alguma coisa não funcionar, é só avisar!</p>
    </div>`;
  document.body.appendChild(tela);
  document.getElementById('ajFechar').addEventListener('click', () => tela.remove());
}
