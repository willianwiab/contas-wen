/* =========================================================
   ajuda.js — a tela "Como usar": tudo que o site faz,
   explicado do jeito que a gente fala.
   ========================================================= */

const AJUDA = [
  {
    titulo:'📋 Na primeira tela (a lista)',
    cor:'#7c3aed',
    itens:[
      ['Este aparelho é de você','na primeira vez o site pergunta quem você é; a lista mostra as conversas do seu ponto de vista'],
      ['4 conversas','as três outras pessoas da família + 💜 Família (todo mundo junto)'],
      ['🔍 Procurar conversa','a barrinha lá em cima da lista'],
      ['✅ Tarefas, 🖼️ Álbum e 📅 Agenda','os botões coloridos embaixo da lista'],
      ['🤖 Ajudante','uma inteligência artificial de verdade pra ajudar na lição e explicar coisas'],
      ['💭 Recado do dia','a fileirinha em cima das conversas: toca no teu cartão e diz o que tu tá fazendo'],
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
      ['Quem escreve','é o dono deste aparelho — dá pra trocar em ⚙️ Ajustes → 👤 Este aparelho é de'],
      ['Frases prontas','“Cheguei bem 🏠”, “Pode me buscar? 🚗”…'],
      ['😀 Emojis','emoji sozinho vira <b>gigante</b>'],
      ['🎤 Microfone','toca pra gravar, toca no ⏹ pra mandar (🗑️ joga fora)'],
      ['No áudio','▶ tocar e 🎛️ voz de esquilo 🐿️, monstro 👹 ou robô 🤖'],
      ['☺ Reagir','no balão — ou dois cliques nele. O ✕ apaga um recadinho'],
      ['↩ Responder','cita o recado da pessoa em cima da tua resposta'],
      ['✏️ Editar','arruma o que TU escreveu; fica marcado como “editado”'],
      ['🔊 Ler em voz alta','aparece quando ligado nos ajustes — o celular lê o recado'],
      ['📌 Fixar','põe o recado lá no topo da conversa (o ✕ tira)'],
      ['📻 📞 📹 no topo','walkie-talkie, ligação e videochamada — agora de UM TOQUE: toca no aparelho do outro, sem código'],
      ['📞 Ninguém atendeu?','o site te oferece deixar um recado de voz na conversa, a pessoa ouve depois'],
      ['✍️ Está escrevendo','aparece no topo quando a outra pessoa está digitando'],
      ['✓ ✓✓ e ⏳','✓ = saiu daqui; ✓✓ = a pessoa abriu; ⏳ = esperando a internet voltar'],
      ['✨ Me ajuda a escrever','aparece na caixinha quando tu escreve: o Ajudante arruma o recado e TU escolhe se usa'],
      ['🗑️ Apagar','pergunta se é pra apagar pra TODOS — some do aparelho dos outros também'],
      ['⋯ Menu do topo','🔍 procurar, 📋 copiar, 🎨 papel de parede e 🗑️ apagar a conversa'],
      ['🎊 Confete','manda 🎉 🥳 🎂 e cai confete na tela']
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
      ['⏱️ Cronômetro','combina um tempo (2 min de escovar dente) e toca o alarme no fim'],
      ['🆘 Preciso de ajuda','manda um alerta pra família com o lugar; no aparelho deles toca alarme alto, mesmo no modo soneca'],
      ['🔤 Código secreto','embaralha teu recado na língua do P ou ao contrário']
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
      ['🔠 Tamanho da letra','normal, grande ou gigante'],
      ['🗣️ Ler em voz alta','põe um 🔊 nos recados pro celular ler pra ti'],
      ['🔁 Ler ao contrário','o celular lê de trás pra frente, só de brincadeira 😄'],
      ['🤬 Anti-palavrão','esconde palavra feia na tela (o recado continua inteiro por baixo). Dá pra desligar'],
      ['🔕 Modo soneca','silencia os avisos por 30 min, 1 hora ou até as 8h'],
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
    titulo:'☁️ Enviar de verdade pros outros aparelhos',
    cor:'#0284c7',
    itens:[
      ['O normal','sem ligar isso, o recado fica só neste aparelho — é um caderno de recados da casa'],
      ['Dois jeitos','📡 servidor público (funciona hoje, sem conta) ou 🔥 Firebase da família (precisa um adulto criar, mas é de vocês)'],
      ['📡 O servidor público','é de teste, aberto pra todo mundo: pode cair ou apagar tudo sem avisar. Serve pro dia a dia'],
      ['Onde liga','⚙️ Ajustes → ☁️ Enviar de verdade: endereço do banco, código da sala e senha da família'],
      ['Nos outros aparelhos','é só 📋 copiar o convite num e 📥 colar no outro'],
      ['Segredo','o recado sai embaralhado com a senha da família — nem o servidor entende o que passa'],
      ['O passo a passo','está no arquivo GUIA-FIREBASE.md, dentro da pasta do site']
    ]
  },
  {
    titulo:'🤖 O Ajudante (a IA)',
    cor:'#0891b2',
    itens:[
      ['O que é','a Claude, uma inteligência artificial de verdade — a mesma que gente grande usa no trabalho'],
      ['Pra que serve','ajuda na lição explicando o caminho, explica coisa difícil de um jeito fácil, dá ideia de brincadeira e conta curiosidade'],
      ['Precisa de uma chave','IA de verdade custa dinheiro de quem usa. Cada um cria a sua chave em console.anthropic.com e cola em ⚙️ Ajustes → 🤖 Ajudante'],
      ['A chave é tua','fica guardada só no teu aparelho. Não vai pro site, nem pro backup, nem pra nuvem da família — quem tem a chave é quem paga o uso'],
      ['Qual cérebro','dá pra escolher o Opus 5 (o mais inteligente) ou o Haiku 4.5 (o mais barato)'],
      ['Cuidado','o que tu escrever pro Ajudante vai pra internet, pro computador da Anthropic — diferente dos recados da família. E IA às vezes erra: confere o que for importante'],
      ['🌙 Historinha de dormir','o botão 🌙 lá em cima: ele inventa uma história com os nomes da família e o site lê em voz alta (o ⏹ para)'],
      ['✨ Arruma teu recado','o ✨ na caixinha de escrever conserta o português sem mandar nada sozinho'],
      ['Sem chave','o resto do site funciona igualzinho; só o 🤖 fica esperando'],
      ['Precisa de internet','o Ajudante só responde online — na primeira vez ele baixa um pedacinho de programa'],
      ['Ele não lê as conversas','o Ajudante só vê o que tu digitar na tela dele'],
      ['Custa por uso','cada pergunta gasta uns centavos da chave de quem colou. Quem manda muita pergunta, gasta mais']
    ]
  },
  {
    titulo:'💭 Recado do dia',
    cor:'#d946ef',
    itens:[
      ['O que é','uma frase curtinha tipo “tô na escola 🏫” que a família toda vê na fileirinha em cima das conversas'],
      ['Como põe','toca no teu cartão (o tracejado) e escreve, ou escolhe uma das frases prontas'],
      ['Some sozinho','vale 12 horas e depois sai da lista — senão o “tô na escola” de terça ficava valendo na quinta'],
      ['É embaralhado','viaja pro banco embaralhado igual aos recados, e o “Tirar o meu” apaga na hora']
    ]
  },
  {
    titulo:'📶 Quando falta internet',
    cor:'#f59e0b',
    itens:[
      ['O recado não some','ele fica na conversa com um ⏳ do lado, esperando'],
      ['Sai sozinho','assim que a internet voltar, ele vai embora e o ⏳ vira ✓ — não precisa mandar de novo'],
      ['O avisinho','lá em cima aparece “⏳ 2 recados esperando a internet” enquanto tiver algum na fila']
    ]
  },
  {
    titulo:'🤔 Coisas importantes de saber',
    cor:'#64748b',
    itens:[
      ['Tudo fica neste aparelho','os recados, áudios e fotos só saem daqui se o ☁️ estiver ligado. Por isso existe o 💾 backup'],
      ['A única coisa que sai sozinha','o que tu escrever pro 🤖 Ajudante vai pra internet, porque é lá que a IA pensa'],
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
