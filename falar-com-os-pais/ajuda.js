/* =========================================================
   ajuda.js — a tela "Como usar": tudo que o site faz,
   explicado do jeito que a gente fala.
   ========================================================= */

const AJUDA = [
  {
    titulo:'☀️ A tela Hoje',
    cor:'#7c3aed',
    itens:[
      ['O que é','o painel da família: o que interessa HOJE, tudo num lugar só'],
      ['Como abrir','a barrinha de baixo no celular, no ☀️ Hoje'],
      ['💌 Recado do dia','num cartão grande, com ❤️ Gostei · 🔊 Ouvir · 📌 Fixar · ↩️ Responder'],
      ['⏰ Compromissos','só os que ainda vêm hoje — o que já passou fica de lado'],
      ['✅ Tarefas','as que faltam, e dá pra marcar ✔️ direto daqui'],
      ['🎂 Aniversário','o mais perto, com os dias que faltam']
    ]
  },
  {
    titulo:'📱 A barrinha de baixo (celular)',
    cor:'#0ea5e9',
    itens:[
      ['☀️ Hoje','o painel da família'],
      ['💬 Conversas','a lista de sempre'],
      ['🤖 Ajudante','a inteligência artificial'],
      ['🆘 Ajuda','a tela de emergência, sempre a um toque']
    ]
  },
  {
    titulo:'📋 Na primeira tela (a lista)',
    cor:'#7c3aed',
    itens:[
      ['Este aparelho é de você','na primeira vez o site pergunta quem você é; a lista mostra as conversas do seu ponto de vista'],
      ['4 conversas','as três outras pessoas da família + 💜 Família (todo mundo junto)'],
      ['🔍 Procurar conversa','a barrinha lá em cima da lista'],
      ['🔍 Procurar em tudo','o botão na fileira: olha em TODAS as conversas de uma vez e pula pro recado'],
      ['⭐ Favoritos · 🆘 Ajuda · 🏠 Quem chegou · 📍 Me acompanha','os botões da fileira que desliza'],
      ['✅ Tarefas, 🖼️ Álbum e 📅 Agenda','os botões coloridos embaixo da lista'],
      ['🤖 Ajudante','uma inteligência artificial de verdade pra ajudar na lição e explicar coisas'],
      ['📊 Placar','quem falou mais, quem grava mais áudio, quem acorda mais cedo'],
      ['🌡️ Como tu tá','uma carinha por dia, e o mês inteiro num quadrinho'],
      ['📚 Estante','os livros que tu leu, com estrelinhas'],
      ['🎂 Cartão','gravar uma surpresa de aniversário pra alguém'],
      ['🎞️ Retrospectiva','as fotos de um mês passando como filminho'],
      ['⛅ O tempo','aparece no alto quando o site sabe onde vocês estão: diz se leva casaco'],
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
      ['🔗 Links','se tu escrever um endereço de site, ele fica sublinhado e dá pra tocar pra abrir'],
      ['⭐ Favoritos','o ☆ do lado do balão guarda o recado; o botão ⭐ na lista mostra todos'],
      ['🎧 Ouvir mais rápido','o botãozinho 1× no áudio vira 1,5× e 2×. Fica guardado pro próximo'],
      ['🎤 Microfone','toca pra gravar, toca no ⏹ pra mandar (🗑️ joga fora)'],
      ['No áudio','▶ tocar e 🎛️ voz de esquilo 🐿️, monstro 👹 ou robô 🤖'],
      ['☺ Reagir','no balão — ou dois cliques nele. O ✕ apaga um recadinho'],
      ['↩ Responder','cita o recado da pessoa em cima da tua resposta'],
      ['✏️ Editar','arruma o que TU escreveu; fica marcado como “editado”'],
      ['🔊 Ler em voz alta','aparece quando ligado nos ajustes — o celular lê o recado'],
      ['📌 Fixar','põe o recado lá no topo da conversa (o ✕ tira)'],
      ['📻 📞 📹 no topo','walkie-talkie, ligação e videochamada — agora de UM TOQUE: toca no aparelho do outro, sem código'],
      ['🔄 Virar a câmera','na videochamada: troca entre a câmera da frente e a de trás sem desligar'],
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
      ['🕹️ Jogo da velha','agora vai de verdade pro celular do outro — cada um joga do seu aparelho'],
      ['✋ Pedra, papel e tesoura','os dois escolhem escondido e só revela quando os dois escolheram'],
      ['🎯 Jogo da forca','tu escolhe a palavra e a outra pessoa adivinha do celular dela'],
      ['🧩 Quebra-cabeça','pega uma foto do álbum e vira quebra-cabeça de 9 ou 16 peças'],
      ['🚸 CHEGUEI!','um toque e a família toda fica sabendo, com o lugar no mapa'],
      ['🚗 Tô indo te buscar','avisa e mostra um relógio contando o tempo que falta'],
      ['⏰ Despertador de longe','põe um despertador que toca no celular DA OUTRA PESSOA'],
      ['🕰️ Cápsula do tempo','recado que fica trancado até o dia que tu escolher'],
      ['🗺️ Mandar onde eu estou','usa o GPS e manda o lugar, com botão de ver no mapa'],
      ['🎺 Figurinhas de som','buzina, palmas, tambor, risada, sino, foguete…'],
      ['⏱️ Cronômetro','combina um tempo (2 min de escovar dente) e toca o alarme no fim'],

      ['🔤 Código secreto','embaralha teu recado na língua do P ou ao contrário'],
      ['🆘 Preciso de ajuda','tem uma tela inteira só pra isso — olha o bloco 🆘 mais abaixo']
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
      ['💾 Backup','uma tela só: quando foi o último, quantos recadinhos e fotos tem, o tamanho, e os botões de salvar e restaurar'],
      ['ℹ️ Sobre','a versão do site e o que está ligado: se está enviando, se está embaralhado, se tem tranca']
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
    titulo:'🆘 Quando precisar de ajuda',
    cor:'#dc2626',
    itens:[
      ['4 tipos de ajuda','🚗 me busca AGORA · 😰 tô com medo · 🤕 tô machucado · 🧭 tô perdido. Cada um com uma cor'],
      ['✍️ Conta o que houve','depois de escolher o tipo, dá pra escrever uma frase: “tem um cachorro solto na esquina”. Isso muda tudo pra quem recebe'],
      ['🆘 MANDAR AGORA','o botão branco e grande manda na hora, sem escrever nada'],
      ['⏱️ E se tu não conseguir mexer','sem tocar em nada, o pedido sai sozinho em 12 segundos. Se tu começar a escrever, a contagem para'],
      ['🧑‍🤝‍🧑 Quem pode me buscar','telefones de gente de confiança (vó, tio, vizinho) pra ligar num toque. Combina com teus pais quem entra na lista'],
      ['O pedido sai primeiro','o aviso vai na hora; o lugar e o som chegam depois. Melhor chegar sem o lugar do que não chegar'],
      ['🎙️ Grava o lugar','30 segundos do som de onde tu está vão junto — se tu não puder falar, eles ouvem'],
      ['☎️ Liga sozinho','na mesma hora ele já chama alguém da família no aparelho'],
      ['🔔 O alarme insiste','no celular deles ele não para até alguém apertar "estou indo" (ou por 5 minutos)'],
      ['🤕 Já tô bem','quando passar, aperta aqui: o alarme para no aparelho de TODO mundo e cai confete'],
      ['📢 Mandar de novo','se ninguém viu, repete o alerta e toca outra vez'],
      ['🚨 Sirene','o celular grita bem alto por até 2 minutos, pra chamar quem estiver perto'],
      ['🔦 Lanterna SOS','a tela pisca branco em código morse — dá pra ver de longe no escuro'],
      ['☎️ 190 · 192 · 193','botões grandes que ligam de verdade. É de graça, funciona até sem crédito'],
      ['🩺 Ficha de emergência','tipo de sangue, alergia, remédio, telefone dos pais e a gente de confiança. Abre SEM a senha da tranca, pra quem achar teu celular conseguir ajudar'],
      ['🧭 Como volto pra casa','marca onde é a casa uma vez e depois ele mostra a distância e o caminho a pé']
    ]
  },
  {
    titulo:'⏱️ "Se eu não avisar, avisa por mim"',
    cor:'#f59e0b',
    itens:[
      ['Como funciona','tu diz "voltando da escola, 20 minutos". Se tu apertar "cheguei bem", tudo certo'],
      ['Se tu esquecer','o site avisa a família sozinho, com o lugar de onde tu saiu e o de agora'],
      ['A barrinha','fica no alto da lista mostrando quanto falta, com o botão ✅ Cheguei'],
      ['⚠️ Precisa do site aberto','ou atrás de outro app. Com o celular guardado e o site fechado, o aviso sai quando tu abrir de novo']
    ]
  },
  {
    titulo:'📍🔋 Saber que a família está bem',
    cor:'#0ea5e9',
    itens:[
      ['📍 Me acompanha','o botão na lista: por 30 minutos a família vê teu pontinho no mapa. Desliga sozinho'],
      ['🏠 Quem chegou','uma tela com quem já avisou que chegou hoje e quem ainda está fora'],
      ['🔋 Bateria de todo mundo','na mesma tela. A que está acabando fica vermelha'],
      ['🔋 Aviso automático','quando o teu celular chega em 10%, a família é avisada — assim ninguém acha que tu sumiu'],
      ['⚠️ No iPhone','a bateria não aparece: o iPhone não deixa o site ver isso. Tudo o mais funciona igual']
    ]
  },
  {
    titulo:'🎮 Os jogos de dois',
    cor:'#8b5cf6',
    itens:[
      ['Todos viajam','🕹️ velha, ✋ pedra-papel-tesoura e 🎯 forca aparecem no celular do outro em segundos'],
      ['✋ O segredo','ninguém vê a mão do outro até os dois escolherem'],
      ['🎯 A palavra','fica embaralhada no recado, mas é uma cortina, não um cofre — alguém muito curioso e que entenda de computador conseguiria achar. Vale pro ✋ também. É brincadeira de família 😊'],
      ['🧩 O quebra-cabeça','é só teu, no teu aparelho — toca em duas peças pra trocar de lugar'],
      ['Precisa do ☁️','os jogos de dois só viajam com o Firebase ligado']
    ]
  },
  {
    titulo:'🎂 A surpresa de aniversário',
    cor:'#ec4899',
    itens:[
      ['Como funciona','tu grava um áudio pra alguém e ele fica ESCONDIDO até o dia do aniversário dela'],
      ['Ninguém vê antes','fica guardado no teu aparelho, não vai pra nuvem nem aparece pra pessoa'],
      ['No dia','quem faz aniversário abre o 🎂 e encontra os recadinhos de todo mundo juntos'],
      ['Precisa da data','põe a data de nascimento de cada um em ⚙️ Ajustes → 🎂 Aniversários']
    ]
  },
  {
    titulo:'🔒 Segurança: o que é protegido e o que não é',
    cor:'#16a34a',
    itens:[
      ['🟢 Só neste aparelho','com o ☁️ desligado, NADA sai daqui. Nem recado, nem foto, nem áudio'],
      ['🔵 Enviando','com o ☁️ ligado, os recados viajam pro banco da família'],
      ['🔒 Conversas embaralhadas','o banco guarda os recados EMBARALHADOS. Nem o dono do banco entende o que passa'],
      ['⚠️ Servidor público','o modo 📡 usa um servidor de teste aberto: dá pro dia a dia, mas pode cair ou apagar tudo'],
      ['🔐 Proteger de verdade','em ⚙️ Ajustes → ☁️. Cria uma chave só de vocês. Sem ela, a chave nasce do nome da sala — e esse nome está no código do site, que é público'],
      ['📋 O convite','leva a chave da família. Manda pra quem é da família, e só. Quem tiver o convite lê os recados'],
      ['🔒 A tranca','a senha não fica guardada: fica só uma mistura dela. E o site não desenha nada antes de tu digitar'],
      ['💾 O backup','leva TUDO — conversas, fotos, a ficha de emergência. Dá pra trancar o arquivo com senha na hora de salvar'],
      ['🤖 A chave do Ajudante','fica só neste aparelho. Não vai pro backup, nem pra nuvem, nem pros outros'],
      ['O que NÃO dá pra prometer','os recados ficam guardados no aparelho. Quem souber mexer no navegador chega neles. A tranca é uma cortina, não um cofre']
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
      ['🔒 A tranca','é uma cortina pra ninguém xeretar sem querer, não é um cofre: os recadinhos continuam guardados no aparelho'],
      ['⏰ O despertador de longe','só toca se o outro estiver com o site aberto ou atrás de outro app. Com o celular guardado e o app fechado, não dá'],
      ['⛅ O tempo','usa o Open-Meteo, que é de graça e não pede chave. Precisa deixar o site ver onde tu está']
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
