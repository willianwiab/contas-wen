/* Pokémon Andarilho — o Pokémon que fica andando por cima da página.
   Serve pra extensão (aparece em qualquer site) e pro site (aparece na própria página).
   Na extensão a configuração vem do chrome.storage; no site vem do localStorage.
   Tudo fica numa "shadow root", pra o CSS do site não bagunçar o Pokémon (e vice-versa). */
(() => {
  if(window.__andarilho) return;
  window.__andarilho = true;

  const naExtensao = typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local;
  const PADRAO = { ligado:true, pets:[{ id:25, shiny:false }], tamanho:'M', som:true, seguir:false, estilo:'3d',
    ovos:[], evoluir:true, casa:'cama', cor:'azul', clima:'auto', aniver:null, festa:0 };
  const CORES = { azul:'#5c7cfa', rosa:'#f783ac', verde:'#51cf66', amarelo:'#fcc419', roxo:'#9775fa', vermelho:'#ff6b6b', laranja:'#ff922b' };
  const MAX_PETS = 10, MAX_OVOS = 3;
  const TAMANHOS = { P:72, M:110, G:160 };
  const voa = id => typeof ANDARILHO_VOA !== 'undefined' && ANDARILHO_VOA.has(id);
  const tipoDe = id => typeof ANDARILHO_TIPO === 'string' ? ANDARILHO_TIPO.charCodeAt(id - 1) - 97 : 0;
  const GOLPES = [['⭐', 'Investida'], ['🔥', 'Lança-chamas'], ['💧', "Jato d'Água"], ['🍃', 'Folha Navalha'], ['⚡', 'Choque do Trovão'], ['❄️', 'Raio de Gelo'],
    ['👊', 'Soco Dinâmico'], ['☠️', 'Bomba de Lodo'], ['🌋', 'Terremoto'], ['🌪️', 'Tornado'], ['🔮', 'Psíquico'], ['🐛', 'Picada'], ['🪨', 'Pedrada'],
    ['👻', 'Bola Sombria'], ['🐉', 'Fúria do Dragão'], ['🌑', 'Mordida'], ['⚙️', 'Cauda de Ferro'], ['✨', 'Brilho Mágico']];
  const nomeDe = id => (typeof ANDARILHO_NOMES !== 'undefined' && ANDARILHO_NOMES[id - 1]) || 'Pokémon';
  const BASE = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/';
  const imagem = (p, estilo) => estilo === 'animado'
    ? `${BASE}showdown/${p.shiny ? 'shiny/' : ''}${p.id}.gif`
    : `${BASE}home/${p.shiny ? 'shiny/' : ''}${p.id}.png`;
  const reserva = p => `${BASE}home/${p.shiny ? 'shiny/' : ''}${p.id}.png`;

  /* Confere a configuração que veio do armazenamento (pode ser de uma versão velha ou estar estragada). */
  function limpa(c){
    c = Object.assign({}, PADRAO, c && typeof c === 'object' ? c : {});
    const pets = Array.isArray(c.pets) ? c.pets : [];
    c.pets = pets.slice(0, 10).map(p => ({ id:Math.max(1, Math.min(1025, Math.floor(+p.id) || 25)), shiny:!!p.shiny }));
    if(!c.pets.length) c.pets = [{ id:25, shiny:false }];
    if(!TAMANHOS[c.tamanho]) c.tamanho = 'M';
    if(!['3d', 'animado'].includes(c.estilo)) c.estilo = '3d';
    c.ligado = c.ligado !== false; c.som = c.som !== false; c.seguir = !!c.seguir;
    const ovos = Array.isArray(c.ovos) ? c.ovos : [];
    c.ovos = ovos.slice(0, MAX_OVOS).map(o => ({ id:Math.max(1, Math.min(1025, Math.floor(+o.id) || 25)), shiny:!!o.shiny, surpresa:!!o.surpresa, ate:+o.ate || 0 }));
    c.evoluir = c.evoluir !== false;
    if(!['cama', 'casa'].includes(c.casa)) c.casa = 'cama';
    if(!CORES[c.cor]) c.cor = 'azul';
    if(!['auto', 'sol', 'chuva', 'neve', 'nada'].includes(c.clima)) c.clima = 'auto';
    const a = c.aniver;
    c.aniver = a && +a.d >= 1 && +a.d <= 31 && +a.m >= 1 && +a.m <= 12 ? { d:Math.floor(+a.d), m:Math.floor(+a.m) } : null;
    c.festa = +c.festa || 0;
    return c;
  }

  /* ---------- o palco invisível por cima da página ---------- */
  const host = document.createElement('div');
  host.id = 'pokemon-andarilho';
  host.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:2147483646;contain:layout style;';
  const raiz = host.attachShadow({ mode:'open' });
  raiz.innerHTML = `<style>
    :host{all:initial}
    .pet{position:absolute;left:0;top:0;pointer-events:auto;cursor:grab;touch-action:none;user-select:none;-webkit-user-select:none;will-change:transform}
    .pet.pegado{cursor:grabbing}
    .corpo{position:absolute;inset:0;transform-origin:50% 100%}
    .corpo img{width:100%;height:100%;object-fit:contain;object-position:50% 100%;display:block;-webkit-user-drag:none;pointer-events:none;
      filter:drop-shadow(0 4px 3px rgba(0,0,0,.35))}
    .sombra{position:absolute;left:18%;right:18%;bottom:-5px;height:9px;border-radius:50%;background:rgba(0,0,0,.22);pointer-events:none}
    .pet.no-ar .sombra{opacity:.35}
    .pet.sem-sombra .sombra{display:none}
    .balao{position:absolute;bottom:100%;left:50%;transform:translate(-50%,6px) scale(.8);margin-bottom:6px;background:#fff;color:#1b1b1b;border:2px solid #1b1b1b;
      border-radius:14px;padding:4px 10px;font:700 14px/1.2 system-ui,-apple-system,'Segoe UI',sans-serif;white-space:nowrap;opacity:0;transition:.2s;pointer-events:none;box-shadow:2px 2px 0 #1b1b1b}
    .balao:after{content:'';position:absolute;top:100%;left:50%;margin-left:-6px;border:6px solid transparent;border-top-color:#1b1b1b}
    .balao.on{opacity:1;transform:translate(-50%,0) scale(1)}
    .efeito{position:absolute;pointer-events:none;font-size:22px;animation:sobe 1.3s ease-out forwards}
    @keyframes sobe{from{transform:translate(0,0) scale(.6);opacity:1}to{transform:translate(var(--dx,0px),-70px) scale(1.2);opacity:0}}
    .menu{position:absolute;bottom:100%;left:50%;transform:translateX(-50%);margin-bottom:10px;display:none;gap:4px;background:#fff;border:2px solid #1b1b1b;border-radius:16px;
      padding:6px;box-shadow:3px 3px 0 #1b1b1b;flex-direction:column;align-items:stretch;z-index:5;font:700 12px/1.1 system-ui,-apple-system,'Segoe UI',sans-serif;color:#1b1b1b}
    .menu.on{display:flex}
    .menu .bts{display:flex;gap:4px}
    .menu button{all:unset;cursor:pointer;width:40px;height:40px;border-radius:12px;background:#eef2ff;border:2px solid #c5d0fa;display:grid;place-items:center;font-size:22px;box-sizing:border-box}
    .menu button:hover{background:#dbe4ff}
    .barrinhas{display:grid;grid-template-columns:repeat(4,40px);gap:4px;text-align:center}
    .barrinhas i{display:block;height:6px;border-radius:9px;background:#e9ecef;overflow:hidden;border:1px solid #adb5bd}
    .barrinhas i b{display:block;height:100%;background:#51cf66}
    .barrinhas i b.meio{background:#fcc419} .barrinhas i b.baixo{background:#ff6b6b}
    .precisa{position:absolute;top:-6px;left:-6px;font-size:22px;pointer-events:none;animation:pede 1s ease-in-out infinite}
    @keyframes pede{50%{transform:translateY(-6px) scale(1.15)}}
    .mosca{position:absolute;font-size:14px;pointer-events:none;animation:voamosca 1.6s linear infinite}
    @keyframes voamosca{0%{transform:translate(0,0)}25%{transform:translate(18px,-10px)}50%{transform:translate(4px,-22px)}75%{transform:translate(-14px,-8px)}100%{transform:translate(0,0)}}
    .cama{position:absolute;left:0;top:0;pointer-events:none;z-index:0}
    .cama .cabeceira{position:absolute;left:0;bottom:0;width:12%;height:100%;background:#8d5a2b;border:3px solid #4a2e14;border-radius:10px 10px 4px 4px}
    .cama .pe{position:absolute;right:0;bottom:0;width:6%;height:55%;background:#8d5a2b;border:3px solid #4a2e14;border-radius:8px 8px 4px 4px}
    .cama .colchao{position:absolute;left:8%;right:4%;bottom:10%;height:30%;background:#fff;border:3px solid #4a2e14;border-radius:10px}
    .cama .travesseiro{position:absolute;left:13%;bottom:36%;width:22%;height:20%;background:#fff3bf;border:3px solid #4a2e14;border-radius:50%}
    .cobertor{position:absolute;left:0;top:0;pointer-events:none;z-index:3;--cor:#5c7cfa;background:repeating-linear-gradient(45deg,color-mix(in srgb,var(--cor) 75%,#fff) 0 10px,var(--cor) 10px 20px);border:3px solid color-mix(in srgb,var(--cor) 60%,#000);border-radius:12px 12px 8px 8px}
    .cobertor.some{display:none}
    /* 🏠 a casinha */
    .casa{position:absolute;left:0;top:0;pointer-events:auto;cursor:pointer;z-index:0;--cor:#5c7cfa}
    .casa .parede{position:absolute;left:8%;right:8%;bottom:0;height:58%;background:var(--cor);border:3px solid #2b2b2b;border-radius:4px}
    .casa .telhado{position:absolute;left:0;right:0;bottom:56%;height:44%;background:#c92a2a;clip-path:polygon(50% 0,100% 100%,0 100%)}
    .casa .telhado:after{content:'';position:absolute;inset:0;background:repeating-linear-gradient(0deg,transparent 0 8px,rgba(0,0,0,.18) 8px 10px)}
    .casa .chamine{position:absolute;right:20%;bottom:72%;width:11%;height:20%;background:#868e96;border:3px solid #2b2b2b;border-bottom:0}
    .casa .porta{position:absolute;left:50%;bottom:0;width:26%;height:66%;transform:translateX(-50%);background:#8d5a2b;border:3px solid #4a2e14;border-bottom:0;border-radius:40px 40px 0 0}
    .casa .porta:after{content:'';position:absolute;right:18%;top:52%;width:6px;height:6px;border-radius:50%;background:#fcc419}
    .casa .janela{position:absolute;left:10%;top:16%;width:22%;height:32%;background:#a5d8ff;border:3px solid #2b2b2b;border-radius:4px;font-size:14px;display:grid;place-items:center;overflow:hidden}
    .casa .janela.luz{background:#ffe066}
    .casa .janela2{left:auto;right:10%}
    .casa .fumaca{position:absolute;right:21%;bottom:94%;font-size:16px;opacity:0;pointer-events:none}
    .casa.gente .fumaca{animation:fuma 2.4s ease-out infinite}
    @keyframes fuma{0%{transform:translate(0,0) scale(.6);opacity:.8}100%{transform:translate(10px,-40px) scale(1.6);opacity:0}}
    .casa .placa{position:absolute;left:50%;top:-24px;transform:translateX(-50%);font:800 12px system-ui,sans-serif;background:#fff;border:2px solid #2b2b2b;border-radius:8px;padding:1px 6px;white-space:nowrap;color:#2b2b2b}
    .casa:hover .placa{background:#fff3bf}
    .pet.dentro{visibility:hidden;pointer-events:none}
    /* 🥚 ovos */
    .ovo{position:absolute;left:0;top:0;pointer-events:auto;cursor:pointer;z-index:1;transform-origin:50% 100%}
    .ovo .casca{position:absolute;inset:0;background:#fffdf5;border:3px solid #2b2b2b;border-radius:50% 50% 50% 50% / 60% 60% 40% 40%;overflow:hidden;
      box-shadow:inset -6px -6px 0 rgba(0,0,0,.08)}
    .ovo .casca i{position:absolute;border-radius:50%;background:var(--pinta,#74c0fc)}
    .ovo .rachado{position:absolute;left:20%;right:20%;top:38%;height:14px;display:none;
      background:linear-gradient(135deg,transparent 45%,#2b2b2b 45% 55%,transparent 55%) 0 0/14px 14px repeat-x}
    .ovo.quase .rachado{display:block}
    .ovo .tempo{position:absolute;left:50%;top:-22px;transform:translateX(-50%);font:800 11px system-ui,sans-serif;background:#fff;border:2px solid #2b2b2b;border-radius:8px;padding:0 5px;white-space:nowrap;color:#2b2b2b}
    .ovo{animation:balanca 2.4s ease-in-out infinite}
    .ovo.quase{animation:balanca .5s ease-in-out infinite}
    @keyframes balanca{0%,60%,100%{rotate:0deg}70%{rotate:-9deg}80%{rotate:9deg}90%{rotate:-5deg}}
    .clarao{position:absolute;border-radius:50%;background:radial-gradient(#fff,rgba(255,255,255,0));pointer-events:none;animation:clarao 1s ease-out forwards;z-index:6}
    @keyframes clarao{0%{transform:scale(.2);opacity:1}100%{transform:scale(2.4);opacity:0}}
    .pet.evoluindo .corpo img{animation:evolui 2.6s ease-in-out}
    @keyframes evolui{0%{filter:brightness(1)}20%,80%{filter:brightness(0) invert(1) drop-shadow(0 0 12px #fff)}40%{transform:scale(.6)}60%{transform:scale(1.25)}100%{filter:brightness(1)}}
    /* menu: comidas, evolução */
    .menu .linha{display:none;gap:4px;flex-wrap:wrap;max-width:220px;justify-content:center}
    .menu .linha.on{display:flex}
    .menu .linha button{width:34px;height:34px;font-size:19px}
    .menu .evos button{width:46px;height:46px;background:#fff9db;border-color:#fcc419}
    .menu .evos img{width:40px;height:40px;object-fit:contain;pointer-events:none}
    .menu .xp{font-size:11px;text-align:center;color:#5b6477}
    .menu .xp.pronto{color:#e67700}
    /* 🌧️ clima */
    .ceu{position:absolute;inset:0;pointer-events:none;z-index:4;overflow:hidden}
    .ceu i{position:absolute;top:-20px;display:block;animation:cai linear infinite}
    .ceu .gota{width:2px;height:14px;background:rgba(90,140,230,.6);border-radius:2px;rotate:15deg}
    .ceu .floco{width:7px;height:7px;background:#fff;border:1px solid rgba(110,150,210,.7);border-radius:50%}
    @keyframes cai{to{transform:translate(var(--vento,0px),calc(100vh + 30px))}}
    .arco{position:absolute;left:50%;top:6%;width:min(90vw,900px);aspect-ratio:2/1;transform:translateX(-50%);border-radius:50% 50% 0 0/100% 100% 0 0;pointer-events:none;z-index:0;opacity:0;transition:opacity 3s;
      background:radial-gradient(circle at 50% 100%,transparent 54%,#ff6b6b 54% 58%,#ff922b 58% 62%,#ffd43b 62% 66%,#51cf66 66% 70%,#339af0 70% 74%,#5c7cfa 74% 78%,#9775fa 78% 82%,transparent 82%)}
    .arco.on{opacity:.28}
    .sol{position:absolute;right:24px;top:18px;font-size:46px;pointer-events:none;z-index:0;display:none;animation:gira 20s linear infinite}
    .sol.on{display:block}
    @keyframes gira{to{rotate:360deg}}
    .acessorio{position:absolute;left:50%;top:-14%;translate:-50% 0;font-size:calc(var(--s) * .32);pointer-events:none}
    .boneco{position:absolute;left:0;top:0;font-size:46px;pointer-events:none;z-index:0;display:none}
    .boneco.on{display:block}
    /* 🎂 festa */
    .faixa{position:absolute;left:50%;top:10px;transform:translateX(-50%);font:900 22px system-ui,sans-serif;color:#fff;background:linear-gradient(90deg,#f06595,#cc5de8,#5c7cfa);
      border:3px solid #2b2b2b;border-radius:16px;padding:6px 18px;box-shadow:4px 4px 0 #2b2b2b;pointer-events:none;z-index:7;white-space:nowrap;animation:pula .8s ease-in-out infinite}
    @keyframes pula{50%{transform:translateX(-50%) translateY(-6px) rotate(-1deg)}}
    .confete{position:absolute;top:-30px;pointer-events:none;z-index:7;font-size:22px;animation:confete linear forwards}
    @keyframes confete{to{transform:translateY(calc(100vh + 60px)) rotate(720deg)}}
    .bolo{position:absolute;left:0;top:0;font-size:54px;pointer-events:none;z-index:2}
    .borboleta{position:absolute;left:0;top:0;font-size:24px;pointer-events:none;z-index:3}
    .presente{position:absolute;left:0;top:0;font-size:30px;pointer-events:auto;cursor:pointer;z-index:2;animation:pede 1s ease-in-out infinite}
    .flash{position:absolute;inset:0;background:#fff;pointer-events:none;z-index:8;animation:flash .6s ease-out forwards}
    @keyframes flash{from{opacity:.9}to{opacity:0}}
    .cama .placa{position:absolute;left:50%;top:-26px;transform:translateX(-50%);font:800 12px system-ui,sans-serif;background:#fff;border:2px solid #4a2e14;border-radius:8px;padding:1px 6px;white-space:nowrap;color:#4a2e14}
    .bola{position:absolute;left:0;top:0;pointer-events:none;z-index:2;font-size:26px;line-height:1}
    .pet{z-index:1}
    .zzz{position:absolute;right:-6px;top:0;font:800 18px system-ui,sans-serif;color:#5c7cfa;pointer-events:none;animation:zz 2s ease-in-out infinite}
    @keyframes zz{0%{transform:translate(0,10px);opacity:0}40%{opacity:1}100%{transform:translate(14px,-22px);opacity:0}}
    @media (prefers-reduced-motion: reduce){ .efeito,.zzz,.confete{animation-duration:.01ms} .ovo,.sol,.faixa{animation:none} }
  </style>`;
  const juntar = () => { if(!host.isConnected) (document.body || document.documentElement).appendChild(host); };

  /* ---------- falas ---------- */
  const FALAS = [n => `${n}!`, () => 'Oi! 👋', () => '🎵🎶', () => 'Bora brincar?', () => 'Que site legal!', () => 'Tô com fome… 🍎', () => '😄', () => 'Hehe!',
    n => `Eu sou o ${n}!`, () => 'Olha eu aqui!', () => '✨', () => 'Me dá carinho? 🥺'];
  const sorte = a => a[Math.floor(Math.random() * a.length)];
  /* Comenta o site em que você está (na extensão) ou o computador (no programa). */
  const SITES = [
    [/youtube|youtu\.be/, ['Vamos ver vídeo de Pokémon? 📺', 'Coloca um desenho! 🍿', 'Esse vídeo é legal?', 'Dá like! 👍', 'Eu também quero assistir!']],
    [/(^|\.)google\./, ['O que você tá pesquisando? 🔎', 'Pesquisa "Pikachu"! ⚡', 'O Google sabe tudo!', 'Pesquisa umas fotos de Pokémon!']],
    [/wikipedia/, ['Hora de aprender! 📚', 'Quanto texto! 🤓', 'Você é muito inteligente!']],
    [/roblox/, ['Roblox! Me leva junto? 🎮', 'Bora jogar!', 'Faz um avatar de Pokémon!']],
    [/minecraft/, ['Minecraft! Constrói uma casa pra mim? 🏠', 'Cuidado com o Creeper! 💥']],
    [/willianwiab\.github\.io/, ['Os jogos do Jojo! 🎮', 'Esse site é o melhor! 😄', 'Bora jogar Onde está o Pikachu? 🔍', 'Quero jogar a Pesca Maluca! 🎣', 'Visita o Pokégotchi! 🥚']],
    [/github/, ['Olha quanto código! 👨‍💻', 'Aqui que ficam os jogos!']],
    [/claude\.ai/, ['Oi, Claude! 👋🤖', 'Pede um jogo novo pro Claude!', 'O Claude que me fez! 😄']],
    [/netflix|disney|primevideo|globoplay|max\.com/, ['Sessão de filme! 🍿', 'Posso assistir junto?', 'Faz pipoca! 🍿']],
    [/mail|outlook/, ['Chegou carta? 💌', 'Manda um oi pra alguém!']],
    [/poki|friv|click ?jogos|jogos|games|scratch|itch\.io/, ['JOGOOOO! 🎮', 'Me deixa jogar também!', 'Você vai ganhar! 🏆']],
    [/docs\.google|office|word|classroom/, ['Fazendo lição? ✏️', 'Capricha na letra!', 'Estudar é importante! 📚']],
    [/twitch/, ['Live! 🎥', 'Manda um oi no chat!']],
    [/tiktok|instagram|kwai/, ['Quanto vídeo curtinho! 📱']],
    [/pokemon|pokémon|bulbapedia|serebii|pokeapi|pokedex/, ['É sobre Pokémon!! 😍', 'Será que eu apareço aí?', 'Olha meus amigos!']]
  ];
  function falasDoLugar(){
    const host = (location.hostname || '').toLowerCase(), titulo = (document.title || '').toLowerCase();
    if(location.protocol === 'file:' || !host) return ['Que área de trabalho bonita! 🖥️', 'Abre um jogo pra gente! 🎮', 'Quanta coisa no computador!', 'Eu moro no seu computador agora! 🏠'];
    for(const [re, f] of SITES) if(re.test(host)) return f;
    if(/pok[eé]mon|pikachu/.test(titulo)) return ['É sobre Pokémon!! 😍', 'Olha, um Pokémon!'];
    return ['Que site é esse? 🤔', `${host.replace(/^www\./, '')}… nunca vim aqui!`, 'Esse site é legal?'];
  }
  const CURIOSIDADES = ['Sabia? O Pikachu é o mascote dos Pokémon! ⚡', 'O Snorlax pesa 460 kg! 😴', 'O Wailord tem 14,5 metros! 🐋', 'O Cosmoem é pequenininho e pesa 999,9 kg! 🌌',
    'O Magikarp evolui no Gyarados! 🐉', 'Existem 1025 Pokémon! Já viu todos?', 'O Eevee tem 8 evoluções! 🦊', 'O Ditto vira qualquer Pokémon! 🟣', 'O Gengar adora se esconder nas sombras! 👻',
    'Shiny é quando o Pokémon vem com outra cor! ✨', 'O Arceus é o Pokémon número 493!', 'O Bulbasaur é o número 1 da Pokédex! 🌱'];
  const PIADAS = ['Qual Pokémon mais gosta de dormir? O Snorlax! 😂', 'O que o Pikachu faz no shopping? Choque de compras! ⚡😂', 'Por que o Psyduck vive com dor de cabeça? Ninguém sabe! 🦆😂',
    'Qual Pokémon é melhor em matemática? O Porygon, ele é de computador! 🤖😂', 'Por que o Slowpoke chegou atrasado? Ele é devagarzinho! 🐢😂'];
  function falaDaHora(){ const h = new Date().getHours(); return h < 6 ? 'Já é muito tarde! Vai dormir! 🌙' : h < 12 ? 'Bom dia! ☀️' : h < 18 ? 'Boa tarde! 🌤️' : h < 22 ? 'Boa noite! 🌙' : 'Tá ficando tarde… 🥱'; }
  function algoPraFalar(pet){
    const r = Math.random();
    if(ehAniver() && r < .3) return sorte(['Feliz aniversário!!! 🎂', 'Hoje é seu dia! 🥳', 'Cadê o bolo? 🎂😋', 'Parabéns! 🎉']);
    if(ceu.tipo === 'chuva' && r < .45) return sorte(['Tá chovendo lá fora? 🌧️', 'Barulhinho de chuva… 🌧️', 'Pula na poça! 💦']);
    if(ceu.tipo === 'neve' && r < .45) return sorte(['Bora fazer guerra de neve? ❄️', 'Cada floquinho é diferente! ❄️']);
    if(r < .35) return sorte(falasDoLugar());
    if(r < .55) return sorte(CURIOSIDADES);
    if(r < .65) return sorte(PIADAS);
    if(r < .72) return falaDaHora();
    return sorte(FALAS)(nomeDe(pet.id));
  }

  /* ---------- os Pokémon ---------- */
  let cfg = limpa(null), pets = [], mouse = { x:-999, y:-999, quando:performance.now() };
  /* No programa do computador tem o botão ⚙️ pra abrir a janela de escolher. */
  const noPC = !!(window.andarilhoPC && window.andarilhoPC.abrirConfig);
  /* 🍕 Cada tipo tem uma comida favorita (ganha mais) e uma que acha "eca". */
  const COMIDAS = ['🍎', '🍕', '🍰', '🍦', '🍙', '🥕', '🍓', '🍩', '🌶️', '🐟'];
  const FAV = ['🍰', '🌶️', '🐟', '🥕', '🍕', '🍦', '🍙', '🍩', '🍕', '🍓', '🍓', '🍎', '🍙', '🍩', '🌶️', '🍕', '🐟', '🍰'];
  const ECA = ['🌶️', '🍦', '🌶️', '🐟', '🥕', '🌶️', '🍰', '🥕', '🐟', '🌶️', '🌶️', '🌶️', '🍦', '🥕', '🍦', '🥕', '🍦', '🌶️'];
  const favDe = id => FAV[tipoDe(id)] || '🍎', ecaDe = id => id === 143 ? '' : (ECA[tipoDe(id)] || '');
  function criarPet(p, i, onde){
    const s = TAMANHOS[cfg.tamanho];
    const el = document.createElement('div'); el.className = 'pet';
    el.style.width = s + 'px'; el.style.height = s + 'px'; el.style.setProperty('--s', s + 'px');
    el.innerHTML = `<div class="sombra"></div><div class="corpo"><img alt="" draggable="false" /></div><div class="balao"></div>
      <div class="menu"><div class="bts"><button data-c="comidas" title="Dar comida">🍎</button><button data-c="dormir" title="Pôr pra dormir">😴</button><button data-c="banho" title="Dar banho">🛁</button><button data-c="dentes" title="Escovar os dentes">🪥</button><button data-c="cantar" title="Cantar todo mundo junto">🎤</button>${noPC ? '<button data-c="config" title="Escolher Pokémon">⚙️</button>' : ''}</div>
      <div class="linha comidas">${COMIDAS.map(c => `<button data-comida="${c}" title="Dar ${c}">${c}</button>`).join('')}</div>
      <div class="linha evos"></div>
      <div class="barrinhas"><i title="fome"><b></b></i><i title="sono"><b></b></i><i title="limpeza"><b></b></i><i title="dentes"><b></b></i></div><div class="xp"></div></div>`;
    const img = el.querySelector('img');
    raiz.appendChild(el);
    const pet = { ...p, el, img, corpo:el.querySelector('.corpo'), balao:el.querySelector('.balao'), s,
      x:onde ? onde.x : Math.random() * Math.max(1, innerWidth - s), y:onde ? onde.y : -s - i * 60, vx:0, vy:onde ? -500 : 0, dir:Math.random() < .5 ? -1 : 1,
      estado:'cair', ate:0, passo:Math.random() * 10, zzz:null, fala:0, chave:i + ':' + p.id, menu:el.querySelector('.menu') };
    trocarFoto(pet);
    pet.nec = carregarNec(pet.chave);
    ligarToques(pet); ligarMenu(pet);
    return pet;
  }
  function trocarFoto(pet){
    /* Se o animado não existir (os mais novos), usa a foto 3D; se nem ela carregar (site que bloqueia imagens de fora), some. */
    pet.img.onerror = () => { if(pet.img.src !== reserva(pet)) pet.img.src = reserva(pet); else pet.el.style.display = 'none'; };
    pet.el.style.display = '';
    pet.img.src = imagem(pet, cfg.estilo);
  }
  /* Monta os Pokémon. Quem já estava na tela continua onde está (só os novos aparecem). */
  function montar(tudo){
    host.style.display = cfg.ligado ? '' : 'none';
    if(tudo || !cfg.ligado){ pets.forEach(p => p.el.remove()); pets = []; }
    if(!cfg.ligado){ montarOvos(); return; }
    const sobra = pets.slice(), novos = [];
    cfg.pets.forEach((p, i) => {
      let k = sobra.findIndex((v, j) => v && v.id === p.id && v.shiny === p.shiny && j === i);
      if(k < 0) k = sobra.findIndex(v => v && v.id === p.id && v.shiny === p.shiny);
      if(k >= 0){
        const v = sobra[k]; sobra[k] = null;
        const chave = i + ':' + p.id; if(v.chave !== chave){ v.chave = chave; }
        novos.push(v);
      } else { const onde = nascer[i]; delete nascer[i]; novos.push(criarPet(p, i, onde)); }
    });
    sobra.forEach(v => { if(v) v.el.remove(); });
    pets = novos; pets.forEach(vestir);
    montarCama(); montarOvos(); desenharCasa();
  }
  const nascer = {};
  function falar(pet, t, ms){
    pet.balao.textContent = t; pet.balao.classList.add('on');
    /* Não deixa o balão sair da tela quando ele está no cantinho. */
    const w = pet.balao.offsetWidth, cx = pet.x + pet.s / 2;
    let desvio = 0; if(cx - w / 2 < 4) desvio = 4 - (cx - w / 2); if(cx + w / 2 > innerWidth - 4) desvio = innerWidth - 4 - (cx + w / 2);
    pet.balao.style.marginLeft = desvio + 'px';
    clearTimeout(pet.fala); pet.fala = setTimeout(() => pet.balao.classList.remove('on'), ms || 2200);
  }
  function efeito(pet, e, n){
    for(let i = 0; i < (n || 1); i++){
      const d = document.createElement('span'); d.className = 'efeito'; d.textContent = e;
      d.style.left = (pet.s * (.2 + Math.random() * .6)) + 'px'; d.style.top = (pet.s * .1) + 'px';
      d.style.setProperty('--dx', ((Math.random() - .5) * 60) + 'px'); d.style.animationDelay = (i * .12) + 's';
      pet.el.appendChild(d); setTimeout(() => d.remove(), 1600 + i * 120);
    }
  }
  function grito(pet){
    if(!cfg.som) return;
    try{ const a = new Audio(`https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${pet.id}.ogg`); a.volume = .25; a.play().catch(() => {}); }catch(e){}
  }
  function dormir(pet, sim){
    if(sim && !pet.zzz){ pet.zzz = document.createElement('span'); pet.zzz.className = 'zzz'; pet.zzz.textContent = 'z'; pet.el.appendChild(pet.zzz); }
    if(!sim && pet.zzz){ pet.zzz.remove(); pet.zzz = null; }
  }

  /* ---------- o que ele decide fazer ---------- */
  function escolher(pet, agora){
    dormir(pet, false);
    const parado = agora - mouse.quando > 45000;
    if(cfg.seguir && mouse.x > -999 && !parado){
      const alvo = mouse.x - pet.s / 2;
      if(Math.abs(alvo - pet.x) > pet.s * .4){ pet.estado = Math.abs(alvo - pet.x) > 300 ? 'correr' : 'andar'; pet.dir = alvo > pet.x ? 1 : -1; pet.ate = agora + 700; return; }
    }
    const r = Math.random(), extra = Math.random();
    pet.naCama = false;
    if(festando){ pet.estado = 'dancar'; pet.ate = agora + 3000; return; }
    if(naCasa() && (extra < .07 || (ceu.tipo === 'chuva' && tipoDe(pet.id) === 1 && extra < .5))){ irDormir(pet, agora, 0, false, true); return; }
    if(extra < .10){ cantar(pet, agora, 4200, letraDe(pet).slice(0, 3)); return; }
    if(extra < .13 && !voa(pet.id)){ chamarBorboleta(); pet.estado = 'borboleta'; pet.ate = agora + 9000; falar(pet, sorte(['Uma borboleta! 🦋', 'Vou pegar! 🦋'])); return; }
    if(borboleta.ativa && extra < .35 && !voa(pet.id)){ pet.estado = 'borboleta'; pet.ate = agora + 7000; return; }
    if(extra > .985){ pet.estado = 'parado'; pet.ate = agora + 3000; darPresente(pet); return; }
    if(extra > .975 && pets.length > 1){ tirarFoto(); return; }
    if(ceu.tipo === 'chuva' && tipoGosta.chuva.includes(tipoDe(pet.id)) && extra < .2){ pet.estado = 'dancar'; pet.ate = agora + 3000; efeito(pet, '💧', 3); falar(pet, sorte(['Chuva! 💧😄', 'Splash! 💦'])); return; }
    if(pet.frio && extra < .2){ pet.estado = 'parado'; pet.ate = agora + 2500; falar(pet, sorte(['Brrr! 🥶', 'Que frio! ❄️', 'Atchim! 🤧'])); return; }
    if(parado && r < .5){ irDormir(pet, agora, 10000 + Math.random() * 10000, false); return; }
    if(bola.ativa && Math.random() < .35 && !voa(pet.id)){ pet.estado = 'bola'; pet.ate = agora + 8000; return; }
    if(voa(pet.id) && r < .4){ pet.estado = 'voar'; pet.alvo = null; pet.ate = agora + 6000 + Math.random() * 8000; if(Math.random() < .4) falar(pet, sorte(['Vou voar! 🕊️', 'Lá do alto é mais bonito!', 'Wiiii! ✈️'])); return; }
    if(r < .30){ pet.estado = 'andar'; pet.dir = Math.random() < .5 ? -1 : 1; pet.ate = agora + 2000 + Math.random() * 4000; }
    else if(r < .44){ pet.estado = 'parado'; pet.ate = agora + 2000 + Math.random() * 3000; if(Math.random() < .4) falar(pet, algoPraFalar(pet), 3200); }
    else if(r < .51){
      /* Às vezes corre atrás de um amigo. */
      const amigo = pets.length > 1 ? sorte(pets.filter(p => p !== pet)) : null;
      pet.estado = 'correr'; pet.ate = agora + 1200 + Math.random() * 1500;
      pet.dir = amigo ? (amigo.x > pet.x ? 1 : -1) : (Math.random() < .5 ? -1 : 1);
      if(amigo && Math.random() < .5) falar(pet, sorte([`Te peguei, ${nomeDe(amigo.id)}! 😆`, 'Pega-pega! 🏃', 'Vem brincar!']));
    }
    else if(r < .57){ pular(pet, 520 + Math.random() * 200); }
    else if(r < .63){ pet.estado = 'dancar'; pet.ate = agora + 3000 + Math.random() * 2000; efeito(pet, '🎵', 3); falar(pet, sorte(['Dancinha! 💃', 'Olha meu passinho! 🕺', '🎶 La la la 🎶'])); }
    else if(r < .68){ pet.estado = 'sentar'; pet.ate = agora + 3000 + Math.random() * 3000; if(Math.random() < .5) falar(pet, sorte(['Vou sentar um pouquinho…', 'Ufa, cansei! 😮‍💨'])); }
    else if(r < .72){ pet.estado = 'parado'; pet.ate = agora + 1800; efeito(pet, '👋', 2); falar(pet, sorte(['Oi! 👋', 'Tchauzinho! 👋', 'Ei, você! 👋'])); }
    else if(r < .75){ pet.estado = 'parado'; pet.ate = agora + 1500; falar(pet, 'Atchim!! 🤧', 1500); pet.vx = -pet.dir * 120; pet.vy = -200; pet.estado = 'cair'; }
    else if(r < .78){ pet.estado = 'espreguicar'; pet.ate = agora + 1800; falar(pet, sorte(['Hmmmm… 🙆', 'Que preguiça… 🥱'])); }
    else if(r < .85){ usarGolpe(pet, agora); }
    else if(r < .91){ if(!voa(pet.id)){ chamarBola(); pet.estado = 'bola'; pet.ate = agora + 8000; falar(pet, sorte(['Bora jogar bola! ⚽', 'Futebol! ⚽'])); } else { pet.estado = 'voar'; pet.alvo = null; pet.ate = agora + 5000; } }
    else if(r < .96){ irDormir(pet, agora, 8000 + Math.random() * 8000, false); }
    else { pet.estado = 'parado'; pet.ate = agora + 3500; falar(pet, algoPraFalar(pet), 3500); }
  }
  /* Sobe pela parede da tela (lado -1 = esquerda, 1 = direita) até uma altura, e às vezes chega no teto. */
  function comecarSubir(pet, lado, agora){
    pet.estado = 'subir'; pet.lado = lado; pet.alvoY = Math.random() < .45 ? 0 : chao(pet) * (.15 + Math.random() * .5);
    falar(pet, sorte(['Vou escalar! 🧗', 'Subindo!', 'Ninguém me segura!']), 1500);
  }
  function usarGolpe(pet, agora){
    const [e, nome] = GOLPES[tipoDe(pet.id)] || GOLPES[0];
    pet.estado = 'golpe'; pet.ate = agora + 1400;
    efeito(pet, e, 7); falar(pet, `${nomeDe(pet.id)} usou ${nome}! ${e}`, 2200);
  }
  /* ⚽ Uma bola que os Pokémon chutam pela tela. */
  const bola = { ativa:false, x:0, vx:0, giro:0, el:null, ate:0 };
  function chamarBola(){
    if(!bola.el){ bola.el = document.createElement('span'); bola.el.className = 'bola'; bola.el.textContent = '⚽'; raiz.appendChild(bola.el); }
    if(!bola.ativa){ bola.x = 40 + Math.random() * Math.max(10, innerWidth - 80); bola.vx = 0; }
    bola.ativa = true; bola.el.style.display = ''; bola.ate = performance.now() + 25000;
  }
  /* 🛏️ A caminha (ou 🏠 a casinha) fica no canto de baixo, à esquerda. Quem tem sono vai andando até ela.
     Na casinha eles entram pela porta e somem lá dentro; clicando na casinha, todo mundo sai. */
  const cama = { el:null, cob:null, x:6, w:0, h:0, modo:'' };
  const naCasa = () => cfg.casa === 'casa';
  function montarCama(){
    const S = TAMANHOS[cfg.tamanho], modo = cfg.casa + ':' + cfg.tamanho;
    if(cama.modo !== modo){
      if(cama.el){ cama.el.remove(); cama.cob.remove(); }
      cama.modo = modo;
      cama.cob = document.createElement('div'); cama.cob.className = 'cobertor';
      if(naCasa()){
        cama.w = Math.round(S * 1.7); cama.h = Math.round(S * 1.6);
        cama.el = document.createElement('div'); cama.el.className = 'casa clicavel'; cama.el.title = 'Clique pra chamar quem está lá dentro';
        cama.el.innerHTML = '<div class="chamine"></div><span class="fumaca">💨</span><div class="telhado"></div><div class="parede"><div class="janela"></div><div class="janela janela2"></div><div class="porta"></div></div><div class="placa">🏠 casinha</div>';
        cama.cob.classList.add('some');
        cama.el.addEventListener('pointerdown', ev => { ev.preventDefault(); ev.stopPropagation(); });
        cama.el.addEventListener('click', ev => { ev.stopPropagation(); bateuNaPorta(); });
      } else {
        cama.w = Math.round(S * 1.9); cama.h = Math.round(S * .7);
        cama.el = document.createElement('div'); cama.el.className = 'cama';
        cama.el.innerHTML = '<div class="cabeceira"></div><div class="pe"></div><div class="colchao"></div><div class="travesseiro"></div><div class="placa">🛏️ caminha</div>';
        /* Quem estava dentro da casinha sai quando ela vira cama. */
        pets.forEach(p => { if(p.dentro) sairDeCasa(p, false); });
      }
      raiz.appendChild(cama.el); raiz.appendChild(cama.cob);
    }
    cama.el.style.width = cama.w + 'px'; cama.el.style.height = cama.h + 'px';
    cama.el.style.setProperty('--cor', CORES[cfg.cor]); cama.cob.style.setProperty('--cor', CORES[cfg.cor]);
    cama.cob.style.width = Math.round(cama.w * .62) + 'px'; cama.cob.style.height = Math.round(cama.h * .42) + 'px';
    posicionarCama();
  }
  function posicionarCama(){
    if(!cama.el) return;
    const base = innerHeight - extraChao - 2;
    cama.el.style.transform = `translate(${cama.x}px, ${base - cama.h}px)`;
    cama.cob.style.transform = `translate(${cama.x + cama.w * .33}px, ${base - cama.h * .62}px)`;
    if(boneco.el) boneco.el.style.transform = `translate(${innerWidth * .62}px, ${base - 50}px)`;
  }
  function vagaNaCama(pet){
    if(naCasa()) return cama.x + cama.w / 2 - pet.s / 2;
    const k = pets.filter(p => p.naCama || p.estado === 'irCama').indexOf(pet);
    return cama.x + cama.w * .2 + ((Math.max(0, k) % 4) * cama.w * .17) - pet.s * .25;
  }
  function irDormir(pet, agora, dur, soneca, visita){
    pet.estado = 'irCama'; pet.dormirPor = dur; pet.soneca = !!soneca; pet.visita = !!visita; pet.naCama = false; pet.ate = agora + 30000;
    if(visita) falar(pet, sorte(['Vou pra casinha! 🏠', 'Já volto! 🏠', 'Vou ver minha casa!']), 1600);
    else if(Math.random() < .5 || soneca) falar(pet, sorte([naCasa() ? 'Vou dormir na casinha… 🏠' : 'Vou pra caminha… 🛏️', 'Tô com soninho… 😴', 'Hora de dormir! 🌙']), 1600);
  }
  /* Chegou na porta: entra e some. */
  function entrarEmCasa(pet, agora){
    pet.dentro = true; pet.naCama = true; pet.el.classList.add('dentro'); pet.menu.classList.remove('on');
    pet.estado = pet.visita ? 'emCasa' : 'dormir'; pet.ate = agora + (pet.visita ? 5000 + Math.random() * 8000 : pet.dormirPor || 10000);
    desenharCasa();
  }
  function sairDeCasa(pet, falando){
    pet.dentro = false; pet.naCama = false; pet.soneca = false; pet.visita = false; pet.el.classList.remove('dentro'); dormir(pet, false);
    pet.x = cama.x + cama.w / 2 - pet.s / 2; pet.y = chao(pet); pet.dir = 1;
    pet.estado = 'andar'; pet.ate = performance.now() + 1500;
    if(falando) falar(pet, falando, 1800);
    desenharCasa();
  }
  function desenharCasa(){
    if(!naCasa() || !cama.el) return;
    const dentro = pets.filter(p => p.dentro), dorme = dentro.some(p => p.estado === 'dormir');
    cama.el.classList.toggle('gente', dentro.length > 0);
    const janelas = cama.el.querySelectorAll('.janela');
    janelas.forEach((j, i) => { j.classList.toggle('luz', dentro.length > i); j.textContent = dentro.length > i ? (dorme ? '💤' : '👀') : ''; });
    cama.el.querySelector('.placa').textContent = dentro.length ? `🏠 ${dentro.length} em casa` : '🏠 casinha';
  }
  function bateuNaPorta(){
    const dentro = pets.filter(p => p.dentro);
    if(dentro.length){ dentro.forEach((p, i) => setTimeout(() => sairDeCasa(p, sorte(['Oi! Cheguei! 👋', 'Alguém bateu? 🚪', 'Tô aqui! 😄', p.estado === 'dormir' ? 'Eu tava dormindo… 🥱' : 'Já saí!'])), i * 400)); return; }
    /* Ninguém em casa: chama todo mundo pra entrar. */
    const agora = performance.now();
    pets.filter(p => !['arrastado', 'irCama'].includes(p.estado)).forEach(p => { dormir(p, false); irDormir(p, agora, 0, false, true); });
  }
  function pular(pet, forca){ pet.estado = 'cair'; pet.vy = -forca; pet.vx = pet.dir * (40 + Math.random() * 60); }

  /* ---------- arrastar, clicar, jogar longe ---------- */
  function ligarToques(pet){
    let ini = null, rastro = [];
    pet.el.addEventListener('pointerdown', ev => {
      ev.preventDefault(); ev.stopPropagation();
      try{ pet.el.setPointerCapture(ev.pointerId); }catch(e){}
      ini = { x:ev.clientX, y:ev.clientY, px:pet.x, py:pet.y, t:performance.now(), moveu:false }; rastro = [];
      pet.el.classList.add('pegado'); dormir(pet, false); pet.naCama = false;
    });
    pet.el.addEventListener('pointermove', ev => {
      if(!ini) return;
      const dx = ev.clientX - ini.x, dy = ev.clientY - ini.y;
      if(!ini.moveu && Math.hypot(dx, dy) > 6){ ini.moveu = true; pet.estado = 'arrastado'; falar(pet, sorte(['Uiii! 😆', 'Tô voando!', 'Me põe no chão!', 'Wheee!']), 1500); }
      if(ini.moveu){ pet.x = ini.px + dx; pet.y = ini.py + dy; rastro.push([ev.clientX, ev.clientY, performance.now()]); if(rastro.length > 6) rastro.shift(); }
    });
    const soltar = () => {
      if(!ini) return;
      pet.el.classList.remove('pegado');
      if(ini.moveu){
        /* Joga com a velocidade do arrasto (dá pra arremessar!). */
        let vx = 0, vy = 0;
        if(rastro.length > 1){ const a = rastro[0], b = rastro[rastro.length - 1], dt = Math.max(16, b[2] - a[2]) / 1000; vx = (b[0] - a[0]) / dt; vy = (b[1] - a[1]) / dt; }
        pet.vx = Math.max(-1500, Math.min(1500, vx)); pet.vy = Math.max(-1500, Math.min(1500, vy)); pet.estado = 'cair';
        if(voa(pet.id)){ pet.estado = 'voar'; pet.alvo = null; pet.ate = performance.now() + 4000 + Math.random() * 4000; falar(pet, 'Eu sei voar! 🕊️', 1500); }
      } else clicou(pet);
      ini = null;
    };
    pet.el.addEventListener('pointerup', soltar);
    pet.el.addEventListener('pointercancel', soltar);
    pet.el.addEventListener('dblclick', ev => { ev.preventDefault(); efeito(pet, '💖', 6); falar(pet, 'Eu te amo! 💖'); });
  }
  function clicou(pet){
    abrirMenu(pet);
    const acordou = pet.estado === 'dormir';
    if(acordou){ pet.naCama = false; pet.soneca = false; }
    efeito(pet, sorte(['❤️', '💛', '✨', '⭐']), 3); grito(pet);
    falar(pet, acordou ? 'Hã?! Eu tava dormindo! 😴' : sorte(FALAS)(nomeDe(pet.id)));
    if(['subir', 'teto'].includes(pet.estado)){ pet.estado = 'cair'; pet.vx = 0; pet.vy = 0; dormir(pet, false); }
    else if(pet.estado !== 'voar' && pet.y >= chao(pet) - 1) pular(pet, 600);
  }
  addEventListener('pointermove', ev => { mouse = { x:ev.clientX, y:ev.clientY, quando:performance.now() }; }, { passive:true });

  /* ---------- física e desenho ---------- */
  /* O site do Andarilho tem uma barra de tarefas embaixo: lá ele anda em cima dela. */
  const extraChao = typeof ANDARILHO_CHAO === 'number' ? ANDARILHO_CHAO : 0;
  const chao = pet => innerHeight - pet.s - 4 - extraChao;
  let ult = performance.now();
  function quadro(agora){
    const dt = Math.min(.05, (agora - ult) / 1000); ult = agora;
    if(!document.hidden) for(const pet of pets){
      const c = chao(pet), maxX = Math.max(0, innerWidth - pet.s);
      if(pet.dentro){
        /* Lá dentro da casinha: não aparece. Quando dá a hora, sai pela porta. */
        if(agora >= pet.ate && !(pet.estado === 'dormir' && pet.soneca)) sairDeCasa(pet, pet.estado === 'dormir' ? sorte(['Bom dia! ☀️', 'Dormi tão bem! 😊']) : sorte(['Voltei! 😄', 'Minha casa é muito legal! 🏠']));
        continue;
      }
      if(pet.estado === 'arrastado'){ /* segue o dedo */ }
      else if(pet.estado === 'cair'){
        pet.vy += 1900 * dt; pet.x += pet.vx * dt; pet.y += pet.vy * dt;
        if(pet.x < 0){ pet.x = 0; pet.vx = -pet.vx * .5; } if(pet.x > maxX){ pet.x = maxX; pet.vx = -pet.vx * .5; }
        if(pet.y >= c){
          pet.y = c;
          if(pet.vy > 900){ pet.vy = -pet.vy * .35; pet.vx *= .6; falar(pet, sorte(['Ai! 😵', 'Pof!', 'Opa!']), 1200); }
          else { pet.vy = 0; pet.vx = 0; pet.estado = 'parado'; pet.ate = agora + 800; }
        }
      } else if(pet.estado === 'voar'){
        /* Voa até um ponto no alto, escolhe outro… e depois pousa. */
        if(!pet.alvo || Math.hypot(pet.alvo.x - pet.x, pet.alvo.y - pet.y) < 12) pet.alvo = { x:Math.random() * maxX, y:Math.random() * c * .8 };
        const dx = pet.alvo.x - pet.x, dy = pet.alvo.y - pet.y, d = Math.max(1, Math.hypot(dx, dy));
        pet.x += dx / d * 140 * dt; pet.y += dy / d * 140 * dt + Math.sin(agora / 250) * .6;
        if(Math.abs(dx) > 4) pet.dir = dx > 0 ? 1 : -1;
        if(agora >= pet.ate){ pet.estado = 'cair'; pet.vy = 0; pet.vx = pet.dir * 50; }
      } else if(pet.estado === 'subir'){
        pet.x = pet.lado < 0 ? 0 : maxX; pet.y -= 60 * dt;
        if(pet.y <= Math.max(0, pet.alvoY)){
          if(pet.alvoY <= 0){ pet.y = 0; pet.estado = 'teto'; pet.dir = pet.lado < 0 ? 1 : -1; pet.ate = agora + 3000 + Math.random() * 5000; falar(pet, 'Olha eu no teto! 🙃', 1800); }
          else { pet.estado = 'cair'; pet.vx = -pet.lado * 160; pet.vy = -120; falar(pet, 'Wheee! 😆', 1200); }
        }
      } else if(pet.estado === 'teto'){
        pet.y = 0; pet.x += pet.dir * 60 * dt;
        if(pet.x <= 0){ pet.x = 0; pet.dir = 1; } if(pet.x >= maxX){ pet.x = maxX; pet.dir = -1; }
        if(agora >= pet.ate){ pet.estado = 'cair'; pet.vx = 0; pet.vy = 0; falar(pet, 'Lá vou eu! 😱', 1200); }
      } else if(pet.estado === 'irCama'){
        pet.y = c;
        const alvo = vagaNaCama(pet), dx = alvo - pet.x;
        pet.dir = dx > 0 ? 1 : -1;
        if(Math.abs(dx) < 6){
          pet.x = alvo;
          if(naCasa()) entrarEmCasa(pet, agora);
          else if(pet.visita){ pet.estado = 'parado'; pet.ate = agora + 1000; pet.visita = false; }
          else { pet.naCama = true; pet.estado = 'dormir'; pet.ate = agora + (pet.dormirPor || 10000); dormir(pet, true); }
        }
        else pet.x += pet.dir * Math.min(Math.abs(dx), 110 * dt);
        if(agora >= pet.ate){ pet.estado = 'parado'; pet.ate = agora + 1000; }
      } else if(pet.estado === 'borboleta'){
        pet.y = c;
        const alvo = borboleta.x - pet.s / 2, dx = alvo - pet.x;
        pet.dir = dx > 0 ? 1 : -1;
        if(!borboleta.ativa || agora >= pet.ate){ pet.estado = 'parado'; pet.ate = agora + 1000; if(Math.random() < .5) falar(pet, sorte(['Ela fugiu! 🦋', 'Quase peguei!'])); }
        else if(Math.abs(dx) < pet.s * .25){ pular(pet, 650); if(Math.random() < .5) falar(pet, sorte(['Peguei! …ops, não! 🦋', 'Volta aqui! 🦋']), 1400); }
        else pet.x += pet.dir * Math.min(Math.abs(dx), 170 * dt);
      } else if(pet.estado === 'bola'){
        pet.y = c;
        const alvo = bola.x - pet.s / 2, dx = alvo - pet.x;
        pet.dir = dx > 0 ? 1 : -1;
        if(!bola.ativa || agora >= pet.ate){ pet.estado = 'parado'; pet.ate = agora + 1200; }
        else if(Math.abs(dx) < pet.s * .3){
          bola.vx = pet.dir * (450 + Math.random() * 350); bola.ate = agora + 25000;
          if(Math.random() < .4) falar(pet, sorte(['Chutei! ⚽', 'GOOOL! 🥅', 'Passa a bola!']), 1300);
          pet.estado = 'parado'; pet.ate = agora + 600 + Math.random() * 800;
        } else pet.x += pet.dir * Math.min(Math.abs(dx), 200 * dt);
      } else {
        pet.y = pet.naCama && pet.estado === 'dormir' ? Math.min(c, innerHeight - extraChao - 2 - cama.h * .35 - pet.s) : c;
        const v = pet.estado === 'correr' ? 190 : pet.estado === 'andar' ? 70 : 0;
        pet.x += pet.dir * v * dt;
        /* Chegou na beirada da tela: às vezes sobe pela parede! (quem voa não precisa) */
        const podeSubir = v > 0 && !voa(pet.id) && Math.random() < .45;
        if(pet.x <= 0){ pet.x = 0; if(podeSubir) comecarSubir(pet, -1, agora); else pet.dir = 1; }
        if(pet.x >= maxX){ pet.x = maxX; if(podeSubir) comecarSubir(pet, 1, agora); else pet.dir = -1; }
        if(agora >= pet.ate){ if(pet.estado === 'dormir'){ pet.naCama = false; pet.soneca = false; falar(pet, sorte(['Bom dia! ☀️', 'Dormi tão bem! 😊', 'Acordei! 🥱'])); } escolher(pet, agora); }
        /* Acorda se o mouse chegar pertinho. */
        if(pet.estado === 'dormir' && !pet.soneca && !pet.naCama && Math.hypot(mouse.x - (pet.x + pet.s / 2), mouse.y - (pet.y + pet.s / 2)) < pet.s * .8 && agora - mouse.quando < 200){
          dormir(pet, false); pet.estado = 'parado'; pet.ate = agora + 1500; falar(pet, '! 😲', 1200);
        }
      }
      /* Passinho: sobe e desce e inclina enquanto anda (a foto 3D não mexe sozinha). */
      const andando = ['andar', 'correr', 'subir', 'teto', 'irCama', 'bola', 'borboleta'].includes(pet.estado);
      pet.passo += dt * (pet.estado === 'correr' ? 16 : 9);
      const festeja = pet.estado === 'dancar' || pet.estado === 'cantar';
      const pulo = festeja ? -Math.abs(Math.sin(agora / 160)) * pet.s * .12 : pet.estado === 'sentar' ? pet.s * .05 : pet.estado === 'golpe' ? -Math.abs(Math.sin(agora / 90)) * pet.s * .05 : andando ? -Math.abs(Math.sin(pet.passo)) * pet.s * .07 : 0;
      /* Na parede fica deitado de lado (pés na parede); no teto fica de cabeça pra baixo; voando inclina. */
      const base = pet.estado === 'subir' ? (pet.lado < 0 ? 90 : -90) * (pet.dir > 0 ? -1 : 1) : pet.estado === 'teto' ? 180 : 0;
      const giro = base + (festeja ? Math.sin(agora / (pet.estado === 'cantar' ? 200 : 130)) * 18 : pet.estado === 'golpe' ? Math.sin(agora / 40) * 4 : andando ? Math.sin(pet.passo) * 5 : pet.estado === 'voar' ? Math.sin(agora / 300) * 8 : 0);
      const respira = pet.estado === 'sentar' ? .86 : pet.estado === 'espreguicar' ? 1.12 : pet.estado === 'parado' || pet.estado === 'dormir' ? 1 + Math.sin(agora / (pet.estado === 'dormir' ? 700 : 400)) * .025 : 1;
      const olha = pet.estado === 'cair' || pet.estado === 'arrastado' ? (pet.vx > 0 ? 1 : pet.vx < 0 ? -1 : pet.dir) : pet.dir;
      const treme = pet.frio && ['parado', 'sentar', 'andar'].includes(pet.estado) ? Math.sin(agora / 25) * 1.5 : 0;
      pet.el.style.transform = `translate(${pet.x + treme}px, ${pet.y}px)`;
      /* As fotos olham pra esquerda; andando pra direita, vira o espelho. */
      pet.corpo.style.transform = `translateY(${pulo}px) scaleX(${olha > 0 ? -1 : 1}) rotate(${giro}deg) scaleY(${respira})`;
      pet.el.classList.toggle('no-ar', pet.y < c - 2);
      pet.el.classList.toggle('sem-sombra', ['subir', 'teto', 'voar'].includes(pet.estado));
    }
    desenharCeu(dt); moverBorboleta(dt, agora);
    if(bola.ativa && bola.el){
      const tam = 26, maxX = innerWidth - tam;
      bola.x += bola.vx * dt; bola.vx *= Math.max(0, 1 - 1.4 * dt); bola.giro += bola.vx * dt * 3;
      if(bola.x < 0){ bola.x = 0; bola.vx = Math.abs(bola.vx) * .7; } if(bola.x > maxX){ bola.x = maxX; bola.vx = -Math.abs(bola.vx) * .7; }
      bola.el.style.transform = `translate(${bola.x}px, ${innerHeight - extraChao - tam - 4}px) rotate(${bola.giro}deg)`;
      if(agora >= bola.ate){ bola.ativa = false; bola.el.style.display = 'none'; }
    }
    requestAnimationFrame(quadro);
  }

  /* ---------- 🍎😴🛁🪥 cuidados (igual bichinho virtual) ----------
     Cada um tem fome, sono, limpeza e dentes (100 = tudo ótimo). Vai caindo com o tempo, mesmo com o computador desligado
     (mais devagar e só até 8 horas). Quando fica baixo, ele pede. */
  const NECS = ['fome', 'sono', 'limpo', 'dentes'];
  const PEDIDOS = { fome:['🍎', 'Tô com fome! 🍎', 'Me dá comida? 🥺'], sono:['😴', 'Tô com sono… 🥱', 'Quero dormir… 😴'], limpo:['🛁', 'Tô sujinho! 🛁', 'Quero tomar banho!'], dentes:['🪥', 'Escova meus dentes? 🪥', 'Meus dentes… 😬'] };
  const PERDE = { fome:2, sono:1.4, limpo:1, dentes:1.2 }; /* por minuto */
  let necSalvas = {};
  function carregarNec(chave){
    const n = necSalvas[chave], agora = Date.now();
    const base = { fome:90, sono:90, limpo:90, dentes:90, xp:0, quando:agora };
    if(!n || typeof n !== 'object') return base;
    const r = Object.assign(base, n);
    const min = Math.min(8 * 60, Math.max(0, (agora - (+r.quando || agora)) / 60000)) * .5;
    NECS.forEach(k => { r[k] = Math.max(0, Math.min(100, (+r[k] || 0) - PERDE[k] * min)); });
    r.quando = agora; return r;
  }
  function salvarNec(){
    pets.forEach(p => { p.nec.quando = Date.now(); necSalvas[p.chave] = p.nec; });
    const k = Object.keys(necSalvas); if(k.length > 30) k.slice(0, k.length - 30).forEach(x => delete necSalvas[x]);
    if(naExtensao) chrome.storage.local.set({ andarilhoNec:necSalvas });
    else { try{ localStorage.setItem('andarilho:nec', JSON.stringify(necSalvas)); }catch(e){} }
  }
  function abrirMenu(pet){
    pets.forEach(p => { if(p !== pet){ p.menu.classList.remove('on'); p.menu.querySelector('.comidas').classList.remove('on'); } });
    pet.menu.classList.add('on'); desenharNec(pet);
    clearTimeout(pet.fechaMenu); pet.fechaMenu = setTimeout(() => { pet.menu.classList.remove('on'); pet.menu.querySelector('.comidas').classList.remove('on'); }, 8000);
  }
  function desenharNec(pet){
    const evos = evosDe(pet.id), xp = +pet.nec.xp || 0, pronto = cfg.evoluir && evos.length && xp >= XP_EVO;
    const linhaXp = pet.menu.querySelector('.xp'), linhaEvo = pet.menu.querySelector('.evos');
    linhaXp.className = 'xp' + (pronto ? ' pronto' : '');
    linhaXp.textContent = !cfg.evoluir ? '' : !evos.length ? '🌟 Já está na última evolução!' : pronto ? (evos.length > 1 ? '🌟 Escolha em quem ele vai evoluir:' : '🌟 Pronto! Toque pra evoluir:') : `🌟 ${xp}/${XP_EVO} pra evoluir (cuide dele!)`;
    const chaveEvo = pronto ? evos.join(',') : '';
    if(linhaEvo.dataset.k !== chaveEvo){
      linhaEvo.dataset.k = chaveEvo;
      linhaEvo.innerHTML = pronto ? evos.map(e => `<button data-evo="${e}" title="Evoluir em ${nomeDe(e)}"><img alt="${nomeDe(e)}" src="${BASE}home/${pet.shiny ? 'shiny/' : ''}${e}.png" /></button>`).join('') : '';
    }
    linhaEvo.classList.toggle('on', !!pronto);
    pet.menu.querySelectorAll('.barrinhas b').forEach((b, i) => { const v = pet.nec[NECS[i]]; b.style.width = v + '%'; b.className = v < 30 ? 'baixo' : v < 60 ? 'meio' : ''; });
    /* O que ele mais precisa aparece na cabeça dele. */
    const pior = NECS.slice().sort((a, b) => pet.nec[a] - pet.nec[b])[0];
    let ic = pet.el.querySelector('.precisa');
    if(pet.nec[pior] < 30 && pet.estado !== 'dormir'){ if(!ic){ ic = document.createElement('span'); ic.className = 'precisa'; pet.el.appendChild(ic); } ic.textContent = PEDIDOS[pior][0]; }
    else if(ic) ic.remove();
    const moscas = pet.el.querySelectorAll('.mosca');
    if(pet.nec.limpo < 25 && !moscas.length) for(let i = 0; i < 2; i++){ const m = document.createElement('span'); m.className = 'mosca'; m.textContent = '🪰'; m.style.left = (pet.s * (.2 + i * .5)) + 'px'; m.style.top = (pet.s * .25) + 'px'; m.style.animationDelay = (i * .7) + 's'; pet.el.appendChild(m); }
    if(pet.nec.limpo >= 25) moscas.forEach(m => m.remove());
  }
  function ligarMenu(pet){
    pet.menu.addEventListener('pointerdown', ev => ev.stopPropagation());
    pet.menu.addEventListener('pointerup', ev => ev.stopPropagation());
    pet.menu.addEventListener('click', ev => {
      ev.stopPropagation();
      const f = ev.target.closest('[data-comida]'), e = ev.target.closest('[data-evo]'), b = ev.target.closest('[data-c]');
      if(f){ comer(pet, f.dataset.comida); abrirMenu(pet); return; }
      if(e){ pet.menu.classList.remove('on'); evoluir(pet, +e.dataset.evo); return; }
      if(!b) return;
      cuidar(pet, b.dataset.c); if(pet.menu.classList.contains('on') || b.dataset.c === 'comidas') abrirMenu(pet);
    });
  }
  function cuidar(pet, c){
    if(c === 'config'){ pet.menu.classList.remove('on'); window.andarilhoPC.abrirConfig(); return; }
    const n = nomeDe(pet.id);
    if(c === 'comidas'){ pet.menu.querySelector('.comidas').classList.toggle('on'); return; }
    if(c === 'cantar'){ pet.menu.classList.remove('on'); cantarTodos(); return; }
    if(c === 'dormir'){
      irDormir(pet, performance.now(), 20000, true); pet.menu.classList.remove('on'); ganharXp(pet, 1);
      return salvarNec();
    }
    if(c === 'banho'){ pet.nec.limpo = 100; efeito(pet, '🫧', 6); falar(pet, sorte(['Que cheirinho bom! 🛁', 'Banho gostoso!', 'Tô limpinho! ✨'])); ganharXp(pet, 1); }
    if(c === 'dentes'){ pet.nec.dentes = 100; efeito(pet, '🪥', 1); efeito(pet, '✨', 3); falar(pet, sorte(['Dentes brilhando! ✨', 'Escovadinho! 😁', 'Hálito fresquinho!'])); ganharXp(pet, 1); }
    ficouFeliz(pet, n); desenharNec(pet); salvarNec();
  }
  function ficouFeliz(pet, n){ if(NECS.every(k => pet.nec[k] >= 80)) setTimeout(() => { efeito(pet, '💖', 4); falar(pet, `O ${n || nomeDe(pet.id)} está muito feliz! 💖`); }, 900); }
  function comer(pet, comida){
    const fav = favDe(pet.id), eca = ecaDe(pet.id);
    if(comida === eca){ efeito(pet, '🤢', 2); falar(pet, sorte([`Eca! Não gosto de ${comida}! 🤢`, `${comida}?! Bléééé! 😝`, 'Isso não! 🙅'])); return; }
    if(pet.nec.fome > 95){ falar(pet, 'Tô cheio! 😵'); return; }
    efeito(pet, comida, 3);
    if(pet.id === 143 || comida === fav){
      pet.nec.fome = Math.min(100, pet.nec.fome + 60); efeito(pet, '😍', 3); ganharXp(pet, 2);
      falar(pet, pet.id === 143 ? 'Eu amo TODAS as comidas! 😋' : sorte([`${comida} é minha comida favorita!!! 😍`, `EBA, ${comida}!!! 💖`, 'Minha preferida! 😍']), 2600);
    } else { pet.nec.fome = Math.min(100, pet.nec.fome + 35); ganharXp(pet, 1); falar(pet, sorte(['Nham nham! 😋', 'Que delícia!', 'Hmm, gostoso!'])); }
    pet.nec.dentes = Math.max(0, pet.nec.dentes - (['🍰', '🍦', '🍩', '🍓'].includes(comida) ? 18 : 10));
    ficouFeliz(pet); desenharNec(pet); salvarNec();
  }
  /* 🌟 Experiência: cada cuidado dá pontinhos. Com 10 pontos ele pode evoluir (se a evolução estiver ligada). */
  const XP_EVO = 10;
  const evosDe = id => (typeof ANDARILHO_EVO !== 'undefined' && ANDARILHO_EVO[id]) || [];
  function ganharXp(pet, n){
    pet.nec.xp = Math.min(XP_EVO, (+pet.nec.xp || 0) + n);
    if(cfg.evoluir && evosDe(pet.id).length && pet.nec.xp >= XP_EVO && !pet.avisouEvo){
      pet.avisouEvo = true;
      setTimeout(() => { efeito(pet, '✨', 5); falar(pet, 'Tô sentindo uma coisa… ✨ Me clica!', 4000); }, 1200);
    }
  }
  function evoluir(pet, novo){
    if(!evosDe(pet.id).includes(novo) || pet.evoluindo) return;
    const antes = nomeDe(pet.id), i = pets.indexOf(pet);
    pet.evoluindo = true; pet.estado = 'parado'; pet.ate = performance.now() + 4000;
    pet.el.classList.add('evoluindo'); falar(pet, `O quê? O ${antes} está evoluindo! ✨`, 2600);
    setTimeout(() => {
      pet.id = novo; trocarFoto(pet);
      if(i >= 0 && cfg.pets[i]) cfg.pets[i].id = novo;
      delete necSalvas[pet.chave]; pet.chave = i + ':' + novo; pet.nec.xp = 0; pet.avisouEvo = false;
      salvarCfg(); salvarNec();
    }, 1300);
    setTimeout(() => {
      pet.el.classList.remove('evoluindo'); pet.evoluindo = false;
      efeito(pet, '🎉', 4); efeito(pet, '⭐', 3); grito(pet);
      falar(pet, `Parabéns! O ${antes} virou ${nomeDe(novo)}! 🎉`, 3500);
    }, 2700);
  }
  /* A cada 5 segundos: gasta um pouquinho, dorme recupera, e quem precisa pede. */
  setInterval(() => {
    if(document.hidden) return;
    for(const pet of pets){
      const dorme = pet.estado === 'dormir';
      NECS.forEach(k => { pet.nec[k] = Math.max(0, pet.nec[k] - PERDE[k] / 12); });
      if(dorme) pet.nec.sono = Math.min(100, pet.nec.sono + (pet.soneca ? 4 : 1.5) * (pet.naCama ? 1.5 : 1));
      if(dorme && pet.soneca && pet.nec.sono >= 100){ pet.soneca = false; pet.ate = 0; }
      const pior = NECS.slice().sort((a, b) => pet.nec[a] - pet.nec[b])[0];
      if(!dorme && pet.nec[pior] < 30 && Math.random() < .2) falar(pet, pior === 'fome' && Math.random() < .5 ? `Queria ${favDe(pet.id)}… 🥺` : sorte(PEDIDOS[pior].slice(1)));
      if(!dorme && !pet.dentro && pet.estado !== 'irCama' && pet.nec.sono < 10 && Math.random() < .15){ irDormir(pet, performance.now(), 15000, true); falar(pet, 'Não aguento mais… 😴', 1500); }
      desenharNec(pet);
    }
  }, 5000);
  setInterval(salvarNec, 15000);
  addEventListener('pagehide', salvarNec);

  /* Reage quando você rola a página ou digita muito. */
  let ultReacao = 0, teclas = [];
  const reagir = t => { const agora = performance.now(); if(agora - ultReacao < 25000 || !pets.length) return; ultReacao = agora; const p = sorte(pets.filter(x => x.estado !== 'dormir')); if(p) falar(p, t, 2000); };
  addEventListener('scroll', () => { if(Math.random() < .3) reagir(sorte(['Wheee, a página rolou! 📜', 'Pra onde vamos? 👀', 'Desce mais! ⬇️'])); }, { passive:true });
  addEventListener('keydown', () => { const agora = performance.now(); teclas = teclas.filter(t => agora - t < 8000).concat(agora); if(teclas.length > 35) reagir(sorte(['Você digita rápido! ⌨️', 'Tec tec tec tec! ⌨️😄', 'Escrevendo o quê? ✏️'])); }, { passive:true });
  setInterval(() => {
    if(document.hidden || !pets.length || Math.random() < .4) return;
    const p = sorte(pets.filter(x => !['dormir', 'irCama', 'arrastado'].includes(x.estado))); if(p) falar(p, algoPraFalar(p), 3500);
  }, 45000);

  /* Dois Pokémon pertinho às vezes fazem festa. */
  setInterval(() => {
    if(pets.length < 2) return;
    for(let i = 0; i < pets.length; i++) for(let j = i + 1; j < pets.length; j++)
      if(Math.abs(pets[i].x - pets[j].x) < pets[i].s * .7 && Math.random() < .3){ efeito(pets[i], '💞', 2); falar(pets[j], sorte(['Amigo! 💞', 'Oi, parceiro!', 'Vamos brincar juntos!'])); }
  }, 4000);

  /* Guarda a configuração quando ela muda aqui mesmo (ovo chocou, Pokémon evoluiu) e avisa a janela de escolher. */
  function salvarCfg(){
    const c = JSON.parse(JSON.stringify(cfg));
    if(naExtensao) chrome.storage.local.set({ andarilho:c });
    else { try{ localStorage.setItem('andarilho:cfg', JSON.stringify(c)); }catch(e){} dispatchEvent(new CustomEvent('andarilho-cfg-pet', { detail:c })); }
  }

  /* ---------- 🥚 ovos ---------- */
  const TIPO_COR = ['#adb5bd', '#ff6b6b', '#4dabf7', '#51cf66', '#fcc419', '#99e9f2', '#e8590c', '#be4bdb', '#d9a35b', '#a5d8ff', '#f783ac', '#94d82d', '#a68a64', '#7950f2', '#5c7cfa', '#495057', '#868e96', '#fcc2d7'];
  let ovosEl = [];
  const chaveOvo = o => o.id + ':' + o.ate;
  function montarOvos(){
    const lista = cfg.ligado ? cfg.ovos : [], S = TAMANHOS[cfg.tamanho];
    ovosEl = ovosEl.filter(e => { const fica = lista.some(o => chaveOvo(o) === e.chave); if(!fica) e.el.remove(); return fica; });
    lista.forEach(o => {
      if(ovosEl.some(e => e.chave === chaveOvo(o))) return;
      const el = document.createElement('div'); el.className = 'ovo clicavel'; el.title = 'Toque pra ajudar a chocar!';
      const cor = o.surpresa ? TIPO_COR[(o.id * 7) % 18] : TIPO_COR[tipoDe(o.id)];
      el.innerHTML = `<div class="casca" style="--pinta:${cor}"><i style="left:14%;top:22%;width:26%;height:20%"></i><i style="right:12%;top:40%;width:30%;height:24%"></i><i style="left:30%;bottom:10%;width:22%;height:16%"></i></div><div class="rachado"></div><span class="tempo"></span>`;
      el.addEventListener('pointerdown', ev => { ev.preventDefault(); ev.stopPropagation(); });
      el.addEventListener('click', ev => {
        ev.stopPropagation();
        const ov = cfg.ovos.find(x => chaveOvo(x) === chaveOvo(o)); if(!ov) return;
        el.animate([{ rotate:'0deg' }, { rotate:'-14deg' }, { rotate:'14deg' }, { rotate:'0deg' }], { duration:350 });
        const e = document.createElement('span'); e.className = 'efeito'; e.textContent = sorte(['💓', 'toc!', '✨', '🥚']); e.style.left = '30%'; el.appendChild(e); setTimeout(() => e.remove(), 1400);
      });
      raiz.appendChild(el);
      ovosEl.push({ chave:chaveOvo(o), el, w:Math.round(S * .5), h:Math.round(S * .62) });
    });
    posicionarOvos(); tiqueOvos();
  }
  function posicionarOvos(){
    ovosEl.forEach((e, k) => {
      e.x = innerWidth - (k + 1) * (e.w + 26); e.y = innerHeight - extraChao - 4 - e.h;
      e.el.style.width = e.w + 'px'; e.el.style.height = e.h + 'px';
      e.el.style.transform = `translate(${e.x}px, ${e.y}px)`;
    });
  }
  /* Só a aba que você está olhando choca (pra não nascer dois iguais em duas abas). */
  const possoMexer = () => !document.hidden && (!naExtensao || document.hasFocus());
  function tiqueOvos(){
    const agora = Date.now();
    cfg.ovos.forEach(o => {
      const e = ovosEl.find(x => x.chave === chaveOvo(o)); if(!e) return;
      const falta = Math.max(0, Math.ceil((o.ate - agora) / 1000));
      e.el.querySelector('.tempo').textContent = `🥚 ${o.surpresa ? '???' : nomeDe(o.id)} · ${falta > 0 ? falta + 's' : 'nascendo!'}`;
      e.el.classList.toggle('quase', falta <= 15);
    });
    const pronto = cfg.ovos.find(o => o.ate <= agora);
    if(pronto && cfg.ligado && possoMexer()) chocar(pronto);
  }
  setInterval(tiqueOvos, 1000);
  function chocar(o){
    const e = ovosEl.find(x => x.chave === chaveOvo(o));
    cfg.ovos = cfg.ovos.filter(x => x !== o);
    if(cfg.pets.length >= MAX_PETS){ montarOvos(); salvarCfg(); return; }
    if(e){
      const c = document.createElement('div'); c.className = 'clarao';
      c.style.cssText = `left:${e.x - e.w * .5}px;top:${e.y - e.h * .3}px;width:${e.w * 2}px;height:${e.w * 2}px`;
      raiz.appendChild(c); setTimeout(() => c.remove(), 1100);
      nascer[cfg.pets.length] = { x:Math.max(0, e.x + e.w / 2 - TAMANHOS[cfg.tamanho] / 2), y:e.y + e.h - TAMANHOS[cfg.tamanho] };
    }
    cfg.pets.push({ id:o.id, shiny:o.shiny });
    montar(false); salvarCfg();
    const bebe = pets[pets.length - 1];
    if(bebe){ efeito(bebe, '🐣', 1); efeito(bebe, '✨', 5); grito(bebe); falar(bebe, `Nasci! Oi! 🐣 Eu sou o ${nomeDe(bebe.id)}!${o.shiny ? ' ✨' : ''}`, 4000); }
  }

  /* ---------- 🎤 música ---------- */
  let audio = null;
  function tocar(notas, bpm){
    if(!cfg.som) return;
    try{
      audio = audio || new (window.AudioContext || window.webkitAudioContext)();
      if(audio.state === 'suspended') audio.resume();
      const batida = 60 / bpm; let t = audio.currentTime + .05;
      for(const [n, d] of notas){
        if(n){
          const o = audio.createOscillator(), g = audio.createGain();
          o.type = 'triangle'; o.frequency.value = 440 * Math.pow(2, (n - 69) / 12);
          g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.12, t + .02); g.gain.exponentialRampToValueAtTime(.001, t + d * batida * .95);
          o.connect(g); g.connect(audio.destination); o.start(t); o.stop(t + d * batida);
        }
        t += d * batida;
      }
    }catch(e){}
  }
  const MUSICA = [[72, .5], [76, .5], [79, 1], [76, .5], [77, .5], [81, 1], [79, .5], [77, .5], [76, .5], [74, .5], [72, 1], [74, .5], [76, .5], [79, .5], [84, 1.5]];
  const PARABENS = [[67, .75], [67, .25], [69, 1], [67, 1], [72, 1], [71, 2], [67, .75], [67, .25], [69, 1], [67, 1], [74, 1], [72, 2],
    [67, .75], [67, .25], [79, 1], [76, 1], [72, 1], [71, 1], [69, 2], [77, .75], [77, .25], [76, 1], [72, 1], [74, 1], [72, 2]];
  function cantar(pet, agora, dur, letras){
    if(pet.dentro || pet.estado === 'arrastado') return;
    dormir(pet, false); pet.naCama = false;
    pet.estado = 'cantar'; pet.ate = agora + dur;
    letras.forEach((l, k) => setTimeout(() => { if(pet.estado === 'cantar'){ falar(pet, l, 1300); efeito(pet, sorte(['🎵', '🎶']), 2); } }, k * 1400 + Math.random() * 300));
  }
  function letraDe(pet){
    const n = nomeDe(pet.id), sil = n.slice(0, 2), sl = sil.toLowerCase();
    return [`🎵 ${sil}-${sl}! ${sil}-${sl}! 🎵`, '🎶 La la laaa 🎶', `🎵 Eu sou o ${n}! 🎵`, '🎶 Uhuuu! 🎶'];
  }
  function cantarTodos(){
    const agora = performance.now();
    pets.forEach(p => { if(!p.dentro){ cantar(p, agora, 5600, letraDe(p)); if(!p.ultCanto || agora - p.ultCanto > 30000){ p.ultCanto = agora; ganharXp(p, 1); } } });
    tocar(MUSICA, 130);
  }

  /* ---------- 🎂 festa de aniversário ---------- */
  const ehAniver = () => { const a = cfg.aniver, h = new Date(); return !!a && a.d === h.getDate() && a.m === h.getMonth() + 1; };
  let festando = false;
  function festa(){
    if(festando || !cfg.ligado) return; festando = true;
    const faixa = document.createElement('div'); faixa.className = 'faixa'; faixa.textContent = '🎂 Feliz aniversário! 🎉'; raiz.appendChild(faixa);
    const bolo = document.createElement('span'); bolo.className = 'bolo'; bolo.textContent = '🎂';
    bolo.style.transform = `translate(${innerWidth / 2 - 27}px, ${innerHeight - extraChao - 64}px)`; raiz.appendChild(bolo);
    for(let i = 0; i < 46; i++) setTimeout(() => {
      const c = document.createElement('span'); c.className = 'confete'; c.textContent = sorte(['🎉', '🎊', '🎈', '⭐', '🟥', '🟨', '🟦', '🟩', '🟪']);
      c.style.left = (Math.random() * 100) + 'vw'; c.style.animationDuration = (3 + Math.random() * 3) + 's'; raiz.appendChild(c); setTimeout(() => c.remove(), 6500);
    }, i * 120);
    const agora = performance.now();
    pets.forEach((p, i) => { if(p.dentro) sairDeCasa(p, ''); setTimeout(() => cantar(p, performance.now(), 12000, ['🎂 Parabéns pra você! 🎶', '🎉 Nesta data querida! 🎶', '🎵 Muitas felicidades! 🎵', '🎈 Muitos anos de vida! 🎈', '🥳 É pique, é pique! 🎉', '🎂 Viva!!! 🎉']), 300 + i * 200); });
    tocar(PARABENS, 120);
    setTimeout(() => { faixa.remove(); bolo.remove(); festando = false; }, 14000);
  }
  setTimeout(() => { if(ehAniver()) festa(); }, 4000);
  setInterval(() => { if(ehAniver() && !document.hidden) festa(); }, 20 * 60000);

  /* ---------- 🌧️ clima ---------- */
  const ceu = { cv:null, tipo:'', arco:null, sol:null, arcoAte:0 };
  const boneco = { el:null };
  function montarCeu(){
    /* Chuva e neve são pinguinhos de verdade (sem "canvas": em alguns Windows o canvas deixava a tela preta). */
    ceu.cv = document.createElement('div'); ceu.cv.className = 'ceu';
    ceu.arco = document.createElement('div'); ceu.arco.className = 'arco';
    ceu.sol = document.createElement('span'); ceu.sol.className = 'sol'; ceu.sol.textContent = '☀️';
    boneco.el = document.createElement('span'); boneco.el.className = 'boneco'; boneco.el.textContent = '⛄';
    raiz.prepend(ceu.arco, ceu.sol, boneco.el); raiz.appendChild(ceu.cv);
    tamanhoCeu();
  }
  function tamanhoCeu(){ encherCeu(); posicionarCama(); }
  function encherCeu(){
    if(!ceu.cv) return;
    const chuva = ceu.tipo === 'chuva', neve = ceu.tipo === 'neve';
    if(!cfg.ligado || (!chuva && !neve)){ ceu.cv.textContent = ''; return; }
    const n = Math.min(160, Math.round(innerWidth / (chuva ? 12 : 18))); let h = '';
    for(let i = 0; i < n; i++){
      const dur = chuva ? .6 + Math.random() * .5 : 7 + Math.random() * 7;
      h += `<i class="${chuva ? 'gota' : 'floco'}" style="left:${(Math.random() * 105).toFixed(1)}%;animation-duration:${dur.toFixed(2)}s;animation-delay:-${(Math.random() * dur).toFixed(2)}s;--vento:${chuva ? -40 : Math.round((Math.random() - .5) * 120)}px"></i>`;
    }
    ceu.cv.innerHTML = h;
  }
  function climaAgora(){
    if(cfg.clima !== 'auto') return cfg.clima;
    /* No automático o tempo muda a cada 8 minutos (igual em todas as abas). */
    let t = (Math.floor(Date.now() / 480000) * 2654435761) >>> 0;
    t = Math.imul(t ^ (t >>> 15), 2246822507) >>> 0; t = (t ^ (t >>> 13)) % 100;
    return t < 18 ? 'chuva' : t < 28 ? 'neve' : t < 60 ? 'sol' : 'nada';
  }
  const tipoGosta = { chuva:[2, 3], neve:[5] };
  function vestir(pet){
    let a = pet.el.querySelector('.acessorio');
    const guarda = ceu.tipo === 'chuva' && !tipoGosta.chuva.includes(tipoDe(pet.id)) && !voa(pet.id);
    if(guarda && !a){ a = document.createElement('span'); a.className = 'acessorio'; a.textContent = '☂️'; pet.el.appendChild(a); }
    if(!guarda && a) a.remove();
    pet.frio = ceu.tipo === 'neve' && ![5, 1].includes(tipoDe(pet.id));
  }
  function mudouClima(tipo, avisar){
    const antes = ceu.tipo; ceu.tipo = tipo; encherCeu();
    if(antes === 'chuva' && tipo !== 'chuva') ceu.arcoAte = Date.now() + 90000;
    ceu.sol.classList.toggle('on', tipo === 'sol');
    boneco.el.classList.toggle('on', tipo === 'neve');
    pets.forEach(vestir);
    if(!avisar) return;
    pets.filter(p => !p.dentro).forEach((p, i) => setTimeout(() => {
      const t = tipoDe(p.id), agora = performance.now();
      if(tipo === 'chuva'){
        if(tipoGosta.chuva.includes(t)){ falar(p, sorte(['Oba, chuva! 💧😄', 'Eu amo chuva! 🌧️💙']), 2400); p.estado = 'dancar'; p.ate = agora + 3000; }
        else if(t === 1){ falar(p, 'Chuva não! Apaga meu fogo! 😣🔥', 2400); if(naCasa()) irDormir(p, agora, 0, false, true); }
        else falar(p, sorte(['Começou a chover! ☂️', 'Ainda bem que tenho guarda-chuva! ☂️']), 2400);
      } else if(tipo === 'neve'){
        if(t === 5){ falar(p, 'NEVE!!! ❄️😍', 2400); p.estado = 'dancar'; p.ate = agora + 3000; }
        else if(t === 1) falar(p, 'Eu sou quentinho! 🔥😎', 2400);
        else falar(p, sorte(['Brrr, que frio! 🥶', 'Tá nevando! ❄️', 'Olha, um boneco de neve! ⛄']), 2400);
      } else if(tipo === 'sol'){
        if([1, 3].includes(t)) falar(p, 'Que sol gostoso! ☀️😎', 2400);
        else if(t === 5) falar(p, 'Tá muito calor… 🥵', 2400);
        else if(Math.random() < .5) falar(p, 'Dia lindo! ☀️', 2400);
      } else if(antes === 'chuva' && Math.random() < .7) falar(p, 'Olha o arco-íris! 🌈', 2400);
    }, i * 500 + 300));
  }
  setInterval(() => { if(cfg.ligado && ceu.cv){ const t = climaAgora(); if(t !== ceu.tipo) mudouClima(t, true); } }, 4000);
  function desenharCeu(dt){
    if(!ceu.cv) return;
    ceu.arco.classList.toggle('on', Date.now() < ceu.arcoAte && ['sol', 'nada'].includes(ceu.tipo) && cfg.ligado);
  }

  /* ---------- 🦋 borboleta, 🎁 presente, 📸 foto ---------- */
  const borboleta = { ativa:false, el:null, x:0, y:0, ate:0, t:0 };
  function chamarBorboleta(){
    if(!borboleta.el){ borboleta.el = document.createElement('span'); borboleta.el.className = 'borboleta'; borboleta.el.textContent = '🦋'; raiz.appendChild(borboleta.el); }
    if(!borboleta.ativa){ borboleta.x = Math.random() * innerWidth; borboleta.y = innerHeight * .6; }
    borboleta.ativa = true; borboleta.el.style.display = ''; borboleta.ate = performance.now() + 15000;
  }
  function moverBorboleta(dt, agora){
    if(!borboleta.ativa) return;
    borboleta.t += dt;
    borboleta.x += Math.sin(borboleta.t * .9) * 90 * dt + Math.sin(borboleta.t * 3.1) * 40 * dt;
    borboleta.y = innerHeight - extraChao - 120 + Math.sin(borboleta.t * 2.3) * 50 - (agora > borboleta.ate - 2500 ? (agora - borboleta.ate + 2500) * .3 : 0);
    borboleta.x = Math.max(10, Math.min(innerWidth - 34, borboleta.x));
    borboleta.el.style.transform = `translate(${borboleta.x}px, ${borboleta.y}px) scaleX(${Math.cos(borboleta.t * 18) > 0 ? 1 : .6})`;
    if(agora >= borboleta.ate){ borboleta.ativa = false; borboleta.el.style.display = 'none'; }
  }
  const PRESENTES = ['💎', '🍬', '🌸', '⭐', '🪀', '🧸', '🍭', '🎈', '🪙', '🐚', '🍀', '🪁'];
  function darPresente(pet){
    if(raiz.querySelector('.presente')) return;
    const g = document.createElement('span'); g.className = 'presente clicavel'; g.textContent = '🎁'; g.title = 'Abrir o presente!';
    const x = Math.max(0, Math.min(innerWidth - 36, pet.x + pet.s / 2 + pet.dir * pet.s * .6));
    g.style.left = x + 'px'; g.style.top = (innerHeight - extraChao - 40) + 'px';
    g.addEventListener('pointerdown', ev => { ev.preventDefault(); ev.stopPropagation(); });
    g.addEventListener('click', ev => {
      ev.stopPropagation(); const coisa = sorte(PRESENTES);
      g.textContent = coisa; g.style.animation = 'none'; g.style.fontSize = '44px';
      falar(pet, `É pra você: ${coisa}! 💝`, 2600); efeito(pet, '💖', 3); ganharXp(pet, 1);
      setTimeout(() => g.remove(), 2200);
    });
    raiz.appendChild(g); falar(pet, 'Trouxe um presente pra você! 🎁 Abre!', 3500);
    setTimeout(() => g.remove(), 40000);
  }
  function tirarFoto(){
    const f = document.createElement('div'); f.className = 'flash'; raiz.appendChild(f); setTimeout(() => f.remove(), 700);
    pets.filter(p => !p.dentro && p.estado !== 'dormir').forEach((p, i) => setTimeout(() => { falar(p, sorte(['Xiiis! 📸', '😁✌️', 'Saí bonito? 📸']), 1800); p.estado = 'parado'; p.ate = performance.now() + 1800; }, i * 120));
  }

  /* ---------- configuração ---------- */
  function aplicar(nova){
    const c = limpa(nova), antes = cfg;
    const tudo = JSON.stringify([c.tamanho, c.estilo, c.ligado]) !== JSON.stringify([antes.tamanho, antes.estilo, antes.ligado]);
    const mudouPets = JSON.stringify(c.pets) !== JSON.stringify(antes.pets);
    cfg = c;
    if(tudo || mudouPets) montar(tudo);
    else { montarCama(); montarOvos(); }
    pets.forEach(desenharNec); desenharCasa();
    if(c.ligado !== antes.ligado) encherCeu();
    if(c.clima !== antes.clima && ceu.cv){ const t = climaAgora(); if(t !== ceu.tipo) mudouClima(t, true); }
    if(c.festa !== antes.festa && Math.abs(Date.now() - c.festa) < 20000) festa();
    else if(JSON.stringify(c.aniver) !== JSON.stringify(antes.aniver) && ehAniver()) festa();
  }
  function comecar(inicial){
    cfg = limpa(inicial); juntar(); montarCeu(); montar(true); mudouClima(climaAgora(), false); requestAnimationFrame(quadro);
    addEventListener('resize', () => { pets.forEach(p => { p.x = Math.min(p.x, Math.max(0, innerWidth - p.s)); }); tamanhoCeu(); posicionarOvos(); });
  }
  if(naExtensao){
    chrome.storage.local.get(['andarilho', 'andarilhoNec'], r => { necSalvas = (r && r.andarilhoNec) || {}; comecar(r && r.andarilho); });
    chrome.storage.onChanged.addListener((mud, area) => { if(area === 'local' && mud.andarilho) aplicar(mud.andarilho.newValue); });
  } else {
    let salvo = null; try{ salvo = JSON.parse(localStorage.getItem('andarilho:cfg') || 'null'); necSalvas = JSON.parse(localStorage.getItem('andarilho:nec') || '{}') || {}; }catch(e){}
    comecar(salvo);
    addEventListener('andarilho-cfg', ev => aplicar(ev.detail));
    addEventListener('storage', ev => { if(ev.key === 'andarilho:cfg'){ try{ aplicar(JSON.parse(ev.newValue)); }catch(e){} } });
  }
  window.andarilhoPets = () => pets;
})();
