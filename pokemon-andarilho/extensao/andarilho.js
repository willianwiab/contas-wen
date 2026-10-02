/* Pokémon Andarilho — o Pokémon que fica andando por cima da página.
   Serve pra extensão (aparece em qualquer site) e pro site (aparece na própria página).
   Na extensão a configuração vem do chrome.storage; no site vem do localStorage.
   Tudo fica numa "shadow root", pra o CSS do site não bagunçar o Pokémon (e vice-versa). */
(() => {
  if(window.__andarilho) return;
  window.__andarilho = true;

  const naExtensao = typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local;
  const PADRAO = { ligado:true, pets:[{ id:25, shiny:false }], tamanho:'M', som:true, seguir:false, estilo:'3d',
    ovos:[], evoluir:true, casa:'cama', cor:'azul', clima:'auto', aniver:null, festa:0, ima:false, voz:false, evento:null };
  const EVENTOS = ['terremoto', 'balao', 'ventania', 'trovao', 'pum', 'chamar', 'fliperama'];
  const CORES = { azul:'#5c7cfa', rosa:'#f783ac', verde:'#51cf66', amarelo:'#fcc419', roxo:'#9775fa', vermelho:'#ff6b6b', laranja:'#ff922b' };
  const MAX_PETS = 10, MAX_OVOS = 3;
  const TAMANHOS = { P:72, M:110, G:160 };
  const voa = id => typeof ANDARILHO_VOA !== 'undefined' && ANDARILHO_VOA.has(id);
  const tipoDe = id => typeof ANDARILHO_TIPO === 'string' ? ANDARILHO_TIPO.charCodeAt(id - 1) - 97 : 0;
  const GOLPES = [['⭐', 'Investida'], ['🔥', 'Lança-chamas'], ['💧', "Jato d'Água"], ['🍃', 'Folha Navalha'], ['⚡', 'Choque do Trovão'], ['❄️', 'Raio de Gelo'],
    ['👊', 'Soco Dinâmico'], ['☠️', 'Bomba de Lodo'], ['🌋', 'Terremoto'], ['🌪️', 'Tornado'], ['🔮', 'Psíquico'], ['🐛', 'Picada'], ['🪨', 'Pedrada'],
    ['👻', 'Bola Sombria'], ['🐉', 'Fúria do Dragão'], ['🌑', 'Mordida'], ['⚙️', 'Cauda de Ferro'], ['✨', 'Brilho Mágico']];
  const nomeDe = id => (typeof ANDARILHO_NOMES !== 'undefined' && ANDARILHO_NOMES[id - 1]) || 'Pokémon';
  const nomeDo = pet => pet.apelido || nomeDe(pet.id);
  const esc = t => String(t).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
  const BASE = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/';
  const imagem = (p, estilo) => estilo === 'animado'
    ? `${BASE}showdown/${p.shiny ? 'shiny/' : ''}${p.id}.gif`
    : `${BASE}home/${p.shiny ? 'shiny/' : ''}${p.id}.png`;
  const reserva = p => `${BASE}home/${p.shiny ? 'shiny/' : ''}${p.id}.png`;

  /* ✏️ Apelido: só letras, números, espaço e emoji; no máximo 14 letras. */
  const limpaApelido = t => typeof t === 'string' ? Array.from(t.replace(/[<>&"'`\\{}\[\]\u0000-\u001f]/g, '').trim()).slice(0, 14).join('') : '';
  /* 🎩 Roupinhas (vão na cabeça). */
  const ROUPAS = ['🎩', '👑', '🎀', '🧢', '🎓', '⛑️', '🌸', '🤠'];
  /* Confere a configuração que veio do armazenamento (pode ser de uma versão velha ou estar estragada). */
  function limpa(c){
    c = Object.assign({}, PADRAO, c && typeof c === 'object' ? c : {});
    const pets = Array.isArray(c.pets) ? c.pets : [];
    c.pets = pets.slice(0, 10).map(p => {
      const q = { id:Math.max(1, Math.min(1025, Math.floor(+p.id) || 25)), shiny:!!p.shiny };
      const ap = limpaApelido(p.apelido); if(ap) q.apelido = ap;
      if(ROUPAS.includes(p.roupa)) q.roupa = p.roupa;
      return q;
    });
    if(!c.pets.length) c.pets = [{ id:25, shiny:false }];
    if(!TAMANHOS[c.tamanho]) c.tamanho = 'M';
    if(!['3d', 'animado'].includes(c.estilo)) c.estilo = '3d';
    c.ligado = c.ligado !== false; c.som = c.som !== false; c.seguir = !!c.seguir;
    const ovos = Array.isArray(c.ovos) ? c.ovos : [];
    c.ovos = ovos.slice(0, MAX_OVOS).map(o => ({ id:Math.max(1, Math.min(1025, Math.floor(+o.id) || 25)), shiny:!!o.shiny, surpresa:!!o.surpresa, ate:+o.ate || 0 }));
    c.evoluir = c.evoluir !== false;
    if(!['cama', 'casa'].includes(c.casa)) c.casa = 'cama';
    if(!CORES[c.cor]) c.cor = 'azul';
    if(!['auto', 'sol', 'chuva', 'tempestade', 'neve', 'vento', 'nada'].includes(c.clima)) c.clima = 'auto';
    c.ima = !!c.ima; c.voz = !!c.voz;
    c.evento = c.evento && EVENTOS.includes(c.evento.t) ? { t:c.evento.t, q:+c.evento.q || 0 } : null;
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
    .menu .bts{display:flex;gap:4px;flex-wrap:wrap;justify-content:center;max-width:220px}
    .menu .titulo{text-align:center;font-size:13px;font-weight:800;max-width:220px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .menu .titulo small{font-weight:600;color:#5b6477}
    .menu .jogos button,.menu .roupas button{width:auto;min-width:34px;padding:0 6px;font-size:13px;gap:3px;display:flex}
    .chapeu{position:absolute;left:50%;top:-6%;translate:-50% 0;font-size:calc(var(--s) * .34);pointer-events:none;line-height:1;z-index:2}
    .pet.tem-chapeu .acessorio{top:-40%}
    /* ⚔️ batalha */
    .vida{position:absolute;left:10%;right:10%;top:-16px;height:9px;border:2px solid #1b1b1b;border-radius:9px;background:#fff;overflow:hidden;pointer-events:none;z-index:3}
    .vida b{display:block;height:100%;width:100%;background:#51cf66;transition:width .4s}
    .vida b.meio{background:#fcc419} .vida b.baixo{background:#ff6b6b}
    .tiro{position:absolute;left:0;top:0;font-size:30px;pointer-events:none;z-index:6}
    .pet.selvagem{pointer-events:none}
    .pokebola{position:absolute;left:0;top:0;width:44px;height:44px;border-radius:50%;cursor:pointer;pointer-events:auto;z-index:6;border:3px solid #1b1b1b;
      background:linear-gradient(#e03131 0 46%,#1b1b1b 46% 54%,#fff 54%);box-shadow:3px 3px 0 rgba(0,0,0,.25);animation:pede 1s ease-in-out infinite}
    .pokebola:after{content:'';position:absolute;left:50%;top:50%;width:12px;height:12px;margin:-9px 0 0 -9px;border-radius:50%;background:#fff;border:3px solid #1b1b1b}
    .pokebola.balancando{animation:chacoalha .5s ease-in-out 3}
    @keyframes chacoalha{25%{rotate:-25deg}75%{rotate:25deg}}
    /* 🎮 minijogos */
    .placar{position:absolute;left:50%;top:10px;transform:translateX(-50%);font:900 18px system-ui,sans-serif;color:#1b1b1b;background:#fff3bf;border:3px solid #1b1b1b;
      border-radius:14px;padding:5px 14px;box-shadow:4px 4px 0 #1b1b1b;pointer-events:none;z-index:7;white-space:nowrap}
    .prop{position:absolute;pointer-events:none;line-height:1;z-index:2;left:50%;translate:-50% 0}
    .prop.banheira{bottom:-22%;font-size:calc(var(--s) * 1)}
    .prop.livro{top:50%;font-size:calc(var(--s) * .34)}
    .prop.panela{top:56%;font-size:calc(var(--s) * .36)}
    .prop.skate{bottom:-16%;font-size:calc(var(--s) * .55)}
    .prop.balaozinho{top:-62%;font-size:calc(var(--s) * .55);animation:pede 1.6s ease-in-out infinite}
    .pipa{position:absolute;left:0;top:0;font-size:40px;pointer-events:none;z-index:3;line-height:1}
    .linha-pipa{position:absolute;left:0;top:0;height:2px;background:#495057;transform-origin:0 50%;pointer-events:none;z-index:3}
    .piscina{position:absolute;left:0;top:0;pointer-events:none;z-index:2;background:linear-gradient(rgba(116,192,252,.75),rgba(28,126,214,.85));border:4px solid #fff;border-bottom:0;border-radius:18px 18px 4px 4px;box-shadow:0 0 0 3px #1c7ed6}
    .lua{position:absolute;left:24px;top:16px;font-size:46px;pointer-events:none;z-index:0;display:none;filter:drop-shadow(0 0 10px #ffe066)}
    .lua.on{display:block}
    .estrelas{position:absolute;inset:0;pointer-events:none;z-index:0;display:none}
    .estrelas.on{display:block}
    .estrelas i{position:absolute;color:#fcc419;font-size:14px;font-style:normal;text-shadow:0 0 6px #ffe066;animation:pisca 2s ease-in-out infinite}
    @keyframes pisca{50%{opacity:.2;transform:scale(.6)}}
    .raio{position:absolute;top:0;font-size:110px;pointer-events:none;z-index:8;animation:raio .55s ease-out forwards;line-height:1}
    @keyframes raio{0%{opacity:0;transform:scaleY(.3)}20%{opacity:1;transform:scaleY(1.2)}100%{opacity:0}}
    .flash.relampago{animation:relampago .8s ease-out forwards}
    @keyframes relampago{0%{opacity:.75}12%{opacity:0}22%{opacity:.5}100%{opacity:0}}
    .cartao{position:absolute;left:50%;top:8%;transform:translateX(-50%);width:min(430px,92vw);max-height:84vh;overflow:auto;background:#fff;color:#1b1b1b;border:3px solid #1b1b1b;border-radius:18px;
      box-shadow:6px 6px 0 #1b1b1b;pointer-events:auto;z-index:9;font:600 15px/1.35 system-ui,-apple-system,'Segoe UI',sans-serif}
    .cartao button{font:inherit;cursor:pointer}
    .topo-c{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:8px 10px;background:#ffd43b;border-bottom:3px solid #1b1b1b;font-size:17px;position:sticky;top:0}
    .topo-c button{border:2px solid #1b1b1b;background:#fff;border-radius:10px;padding:2px 8px}
    .corpo-c{padding:10px 12px 14px;text-align:center}
    .dica-c{margin:0 0 8px;color:#495057}
    .grande-txt{font-size:20px;font-weight:800;margin:8px 0}
    .cartao .grande{margin-top:10px;font-weight:800;font-size:16px;border:3px solid #1b1b1b;border-radius:12px;background:#51cf66;padding:6px 14px;box-shadow:3px 3px 0 #1b1b1b}
    .grade-jogos{display:grid;grid-template-columns:1fr 1fr;gap:6px}
    .grade-jogos button,.ops button{border:2px solid #1b1b1b;background:#eef2ff;border-radius:12px;padding:8px 6px;font-weight:800;box-shadow:2px 2px 0 #1b1b1b}
    .grade-jogos button:hover,.ops button:hover{background:#dbe4ff}
    .ops{display:grid;grid-template-columns:1fr 1fr;gap:6px}
    .ops.tres{grid-template-columns:repeat(3,1fr)} .ops.tres button{font-size:34px}
    .ops.numeros{grid-template-columns:repeat(5,1fr)}
    .ops .certo{background:#8ce99a} .ops .errado{background:#ffa8a8} .ops .apagado{opacity:.4}
    .sombra-poke{width:150px;height:150px;object-fit:contain;filter:brightness(0);transition:filter .4s;display:block;margin:0 auto 8px}
    .sombra-poke.revelado{filter:none}
    .velha{display:grid;grid-template-columns:repeat(3,72px);gap:6px;justify-content:center}
    .velha button{height:72px;font-size:38px;border:3px solid #1b1b1b;border-radius:12px;background:#f8f9fa}
    .cobra{display:grid;grid-template-columns:repeat(12,22px);grid-auto-rows:22px;gap:1px;justify-content:center;background:#d3f9d8;border:3px solid #2b8a3e;border-radius:10px;padding:4px;width:max-content;margin:0 auto;font-size:15px;line-height:22px}
    .cobra i{display:block;font-style:normal;text-align:center}
    .cobra i.gomo{background:#40c057;border-radius:6px} .cobra i.cabeca{background:#2f9e44;border-radius:6px}
    .setas{display:grid;grid-template-columns:repeat(3,54px);gap:4px;justify-content:center;margin-top:8px}
    .setas button{height:44px;font-size:22px;border:2px solid #1b1b1b;border-radius:10px;background:#eef2ff}
    .alvo,.bolha{position:absolute;left:0;top:0;cursor:pointer;pointer-events:auto;z-index:6;line-height:1;user-select:none}
    .bolha.dourada{filter:sepia(1) saturate(4) hue-rotate(5deg) drop-shadow(0 0 6px gold)}
    .pokebola.mini{width:22px;height:22px;border-width:2px;animation:none;pointer-events:none;z-index:7}
    .pokebola.mini:after{width:6px;height:6px;margin:-5px 0 0 -5px;border-width:2px}
    .gol{position:absolute;bottom:0;font-size:70px;pointer-events:none;z-index:1;line-height:1}
    .gol.esq{left:-10px} .gol.dir{right:-10px;transform:scaleX(-1)}
    .time{position:absolute;left:-4px;top:-4px;font-size:18px;pointer-events:none;z-index:3}
    .prop.vara{left:auto;right:-30%;top:10%;translate:0 0;font-size:calc(var(--s) * .5)}
    .lago{position:absolute;height:26px;background:linear-gradient(#74c0fc,#1c7ed6);border-radius:14px 14px 4px 4px;pointer-events:none;z-index:2;opacity:.9}
    .fisgou{position:absolute;font-size:44px;pointer-events:auto;cursor:pointer;z-index:7;animation:pede .4s ease-in-out infinite;line-height:1}
    .fisgou.pescado{animation:none;pointer-events:none;font-size:54px}
    .fisgou img{width:80px;height:80px;object-fit:contain}
    .fruta{position:absolute;left:0;top:0;font-size:34px;cursor:pointer;pointer-events:auto;z-index:6;line-height:1;user-select:none}
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
    .ceu .folha{left:0;top:0;font-size:22px;animation-name:sopra;animation-timing-function:linear;animation-iteration-count:infinite}
    @keyframes sopra{0%{transform:translate(-8vw,0) rotate(0)}25%{transform:translate(22vw,-30px) rotate(120deg)}50%{transform:translate(50vw,20px) rotate(240deg)}75%{transform:translate(78vw,-25px) rotate(360deg)}100%{transform:translate(108vw,10px) rotate(480deg)}}
    .ceu.esquerda .folha{animation-direction:reverse}
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
    if(chove() && r < .45) return sorte(['Tá chovendo lá fora? 🌧️', 'Barulhinho de chuva… 🌧️', 'Pula na poça! 💦']);
    if(ceu.tipo === 'neve' && r < .45) return sorte(['Bora fazer guerra de neve? ❄️', 'Cada floquinho é diferente! ❄️']);
    if(r < .35) return sorte(falasDoLugar());
    if(r < .55) return sorte(CURIOSIDADES);
    if(r < .65) return sorte(PIADAS);
    if(r < .72) return falaDaHora();
    return sorte(FALAS)(nomeDo(pet));
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
      <div class="menu"><div class="titulo"></div><div class="bts"><button data-c="comidas" title="Dar comida">🍎</button><button data-c="dormir" title="Pôr pra dormir">😴</button><button data-c="banho" title="Dar banho">🛁</button><button data-c="dentes" title="Escovar os dentes">🪥</button>
        <button data-c="cantar" title="Cantar todo mundo junto">🎤</button><button data-c="jogos" title="Fliperama (minijogos)">🎮</button><button data-c="batalha" title="Batalhar">⚔️</button><button data-c="roupas" title="Roupinhas">🎩</button>${noPC ? '<button data-c="config" title="Escolher Pokémon">⚙️</button>' : ''}</div>
      <div class="linha roupas">${ROUPAS.map(r => `<button data-roupa="${r}" title="Vestir ${r}">${r}</button>`).join('')}<button data-roupa="" title="Tirar">✖️</button></div>
      <div class="linha comidas">${COMIDAS.map(c => `<button data-comida="${c}" title="Dar ${c}">${c}</button>`).join('')}</div>
      <div class="linha evos"></div>
      <div class="barrinhas"><i title="fome"><b></b></i><i title="sono"><b></b></i><i title="limpeza"><b></b></i><i title="dentes"><b></b></i></div><div class="xp"></div></div>`;
    const img = el.querySelector('img');
    raiz.appendChild(el);
    const pet = { ...p, el, img, corpo:el.querySelector('.corpo'), balao:el.querySelector('.balao'), s,
      x:onde ? onde.x : Math.random() * Math.max(1, innerWidth - s), y:onde ? onde.y : -s - i * 60, vx:0, vy:onde ? -500 : 0, dir:Math.random() < .5 ? -1 : 1,
      estado:'cair', ate:0, passo:Math.random() * 10, zzz:null, fala:0, chave:i + ':' + p.id, menu:el.querySelector('.menu') };
    trocarFoto(pet); vestirRoupa(pet);
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
        v.apelido = p.apelido; v.roupa = p.roupa; vestirRoupa(v);
        novos.push(v);
      } else { const onde = nascer[i]; delete nascer[i]; novos.push(criarPet(p, i, onde)); }
    });
    sobra.forEach(v => { if(v) v.el.remove(); });
    pets = novos; pets.forEach(vestir);
    montarCama(); montarOvos(); desenharCasa();
  }
  const nascer = {};
  function vestirRoupa(pet){
    let c = pet.el.querySelector('.chapeu');
    if(pet.roupa && !c){ c = document.createElement('span'); c.className = 'chapeu'; pet.el.appendChild(c); }
    if(c){ if(pet.roupa) c.textContent = pet.roupa; else c.remove(); }
    pet.el.classList.toggle('tem-chapeu', !!pet.roupa);
  }
  /* 🔊 Fala de verdade (se a voz estiver ligada). */
  let ultVoz = 0;
  function voz(t){
    if(!cfg.voz || !cfg.som || !window.speechSynthesis) return;
    const limpo = String(t).replace(/[\p{Extended_Pictographic}\u{FE0F}\u{200D}\u{1F3FB}-\u{1F3FF}]/gu, '').replace(/\s+/g, ' ').trim();
    if(!/[a-zà-ú]/i.test(limpo) || speechSynthesis.speaking || Date.now() - ultVoz < 1200) return;
    ultVoz = Date.now();
    try{
      const u = new SpeechSynthesisUtterance(limpo); u.lang = 'pt-BR'; u.pitch = 1.7; u.rate = 1.1; u.volume = .9;
      const v = speechSynthesis.getVoices().find(x => /^pt/i.test(x.lang)); if(v) u.voice = v;
      speechSynthesis.speak(u);
    }catch(e){}
  }
  function falar(pet, t, ms){
    if(!pet.selvagem && pet.estado !== 'escondido') voz(t);
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
    if(jogo && jogo.tipo === 'pega' && !pet.pego){ pet.estado = 'fugir'; pet.ate = agora + 1e9; return; }
    if(jogo && jogo.tipo === 'futebol'){ pet.estado = 'bola'; pet.ate = agora + 1e9; return; }
    if(jogo && jogo.tipo === 'pesca' && pet === jogo.pescador){ pet.estado = 'pescar'; pet.ate = agora + 1e9; return; }
    tirarProps(pet);
    if(Math.random() < .004 && !festando) pum(pet);
    if(ehNoite() && extra < .06){ irDormir(pet, agora, 12000 + Math.random() * 8000, false); falar(pet, 'Já é de noite… 🌙🥱', 1600); return; }
    if(Math.random() < .16){ atividade(pet, agora); return; }
    if(festando){ pet.estado = 'dancar'; pet.ate = agora + 3000; return; }
    if(naCasa() && (extra < .07 || (chove() && tipoDe(pet.id) === 1 && extra < .5))){ irDormir(pet, agora, 0, false, true); return; }
    if(extra < .10){ cantar(pet, agora, 4200, letraDe(pet).slice(0, 3)); return; }
    if(extra < .13 && !voa(pet.id)){ chamarBorboleta(); pet.estado = 'borboleta'; pet.ate = agora + 9000; falar(pet, sorte(['Uma borboleta! 🦋', 'Vou pegar! 🦋'])); return; }
    if(borboleta.ativa && extra < .35 && !voa(pet.id)){ pet.estado = 'borboleta'; pet.ate = agora + 7000; return; }
    if(extra > .985){ pet.estado = 'parado'; pet.ate = agora + 3000; darPresente(pet); return; }
    if(extra > .975 && pets.length > 1){ tirarFoto(); return; }
    if(chove() && tipoGosta.chuva.includes(tipoDe(pet.id)) && extra < .2){ pet.estado = 'dancar'; pet.ate = agora + 3000; efeito(pet, '💧', 3); falar(pet, sorte(['Chuva! 💧😄', 'Splash! 💦'])); return; }
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
    efeito(pet, e, 7); falar(pet, `${nomeDo(pet)} usou ${nome}! ${e}`, 2200);
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
      if(cliqueDoJogo(pet)) return;
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
    falar(pet, acordou ? 'Hã?! Eu tava dormindo! 😴' : sorte(FALAS)(nomeDo(pet)));
    if(['subir', 'teto'].includes(pet.estado)){ pet.estado = 'cair'; pet.vx = 0; pet.vy = 0; dormir(pet, false); }
    else if(!['voar', 'batalha', 'desmaiado', 'sentar', 'dancar'].includes(pet.estado) && pet.y >= chao(pet) - 1) pular(pet, 600);
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
      } else if(pet.estado === 'batalha' || pet.estado === 'desmaiado'){
        pet.y = c;
      } else if(pet.estado === 'escondido'){
        /* Espiando! De vez em quando mexe um pouquinho. */
        if(Math.random() < .002) falar(pet, sorte(['hihi 🤭', '🤫', '…']), 900);
      } else if(pet.estado === 'fugir'){
        pet.y = c;
        const dx = (pet.x + pet.s / 2) - mouse.x, perto = Math.abs(dx) < 280 && agora - mouse.quando < 1500;
        if(perto){
          pet.dir = dx >= 0 ? 1 : -1; pet.correndo = true;
          pet.x += pet.dir * 240 * dt;
          if((pet.x <= 1 || pet.x >= maxX - 1) && Math.abs(dx) < pet.s * 1.1){ pet.estado = 'cair'; pet.vy = -780; pet.vx = -pet.dir * 380; if(Math.random() < .5) falar(pet, 'Pulei! 😜', 1000); }
        } else { pet.correndo = false; if(Math.random() < .004) falar(pet, sorte(['Não me pega! 😜', 'Tô aqui! 👋', 'Lá lá lá 🎶']), 1300); }
        pet.x = Math.max(0, Math.min(maxX, pet.x));
      } else if(pet.estado === 'borboleta'){
        pet.y = c;
        const alvo = borboleta.x - pet.s / 2, dx = alvo - pet.x;
        pet.dir = dx > 0 ? 1 : -1;
        if(!borboleta.ativa || agora >= pet.ate){ pet.estado = 'parado'; pet.ate = agora + 1000; if(Math.random() < .5) falar(pet, sorte(['Ela fugiu! 🦋', 'Quase peguei!'])); }
        else if(Math.abs(dx) < pet.s * .25){ pular(pet, 650); if(Math.random() < .5) falar(pet, sorte(['Peguei! …ops, não! 🦋', 'Volta aqui! 🦋']), 1400); }
        else pet.x += pet.dir * Math.min(Math.abs(dx), 170 * dt);
      } else if(pet.estado === 'balao'){
        /* 🎈 Subindo pendurado no balão… até estourar! */
        pet.y -= 50 * dt; pet.x = Math.max(0, Math.min(maxX, pet.x + Math.sin(agora / 700) * 40 * dt + (ventando() ? rajada.dir * 60 * dt : 0)));
        if(agora >= pet.ate || pet.y < 10){ tirarProps(pet); efeito(pet, '💥', 2); falar(pet, sorte(['Pof! Aaaah! 😱', 'O balão estourou! 😵', 'Ops! 🎈💥']), 1600); pet.estado = 'cair'; pet.vy = 0; pet.vx = 0; }
      } else if(pet.estado === 'pegador'){
        /* 😋 Segue o mouse de um lado pro outro pra pegar as frutas com a boca. */
        pet.y = c;
        const dx = mouse.x - pet.s / 2 - pet.x;
        if(Math.abs(dx) > 4){ pet.dir = dx > 0 ? 1 : -1; pet.x += Math.sign(dx) * Math.min(Math.abs(dx), 650 * dt); }
        pet.x = Math.max(0, Math.min(maxX, pet.x));
      } else if(pet.estado === 'ima'){
        /* 🧲 Rodando em volta do mouse (sem ficar embaixo dele, pra não atrapalhar o clique). */
        if(!cfg.ima || agora - mouse.quando > 2500){ pet.estado = 'cair'; pet.vx = 0; pet.vy = 0; }
        else {
          const k = pets.indexOf(pet), ang = agora / 900 + k * 2 * Math.PI / Math.max(1, pets.length), r = pet.s * .8 + 30;
          const dx = mouse.x + Math.cos(ang) * r - pet.s / 2 - pet.x, dy = mouse.y + Math.sin(ang) * r - pet.s / 2 - pet.y;
          pet.x += dx * Math.min(1, dt * 5); pet.y = Math.min(c, pet.y + dy * Math.min(1, dt * 5)); if(Math.abs(dx) > 3) pet.dir = dx > 0 ? 1 : -1;
        }
      } else if(pet.estado === 'bola'){
        pet.y = c;
        const alvo = bola.x - pet.s / 2, dx = alvo - pet.x;
        pet.dir = dx > 0 ? 1 : -1;
        if(!bola.ativa || agora >= pet.ate){ pet.estado = 'parado'; pet.ate = agora + 1200; }
        else if(Math.abs(dx) < pet.s * .3){
          const lado = jogo && jogo.tipo === 'futebol' ? (pet.time === 'azul' ? 1 : -1) : pet.dir;
          bola.vx = lado * (450 + Math.random() * 350); bola.ate = jogo && jogo.tipo === 'futebol' ? agora + 1e9 : agora + 25000;
          if(Math.random() < .4) falar(pet, sorte(['Chutei! ⚽', 'GOOOL! 🥅', 'Passa a bola!']), 1300);
          pet.estado = 'parado'; pet.ate = agora + 600 + Math.random() * 800;
        } else pet.x += pet.dir * Math.min(Math.abs(dx), 200 * dt);
      } else {
        pet.y = pet.naCama && pet.estado === 'dormir' ? Math.min(c, innerHeight - extraChao - 2 - cama.h * .35 - pet.s) : c;
        if(pet.estado === 'banho' || pet.estado === 'piscina') pet.y = c + pet.s * .28;
        const v = pet.estado === 'correr' ? 190 : pet.estado === 'andar' ? 70 : pet.estado === 'skate' ? 280 : 0;
        /* Com vento: a favor anda rápido, contra anda devagarzinho. */
        pet.x += pet.dir * v * (v && ventando() ? (pet.dir === rajada.dir ? 1.6 : .55) : 1) * dt;
        /* Chegou na beirada da tela: às vezes sobe pela parede! (quem voa não precisa) */
        const podeSubir = v > 0 && !voa(pet.id) && pet.estado !== 'skate' && Math.random() < .45;
        if(pet.x <= 0){ pet.x = 0; if(podeSubir) comecarSubir(pet, -1, agora); else pet.dir = 1; }
        if(pet.x >= maxX){ pet.x = maxX; if(podeSubir) comecarSubir(pet, 1, agora); else pet.dir = -1; }
        if(agora >= pet.ate){ if(pet.estado === 'dormir'){ pet.naCama = false; pet.soneca = false; falar(pet, sorte(['Bom dia! ☀️', 'Dormi tão bem! 😊', 'Acordei! 🥱'])); } if(pet.estado === 'cozinhar') terminouCozinhar(pet); escolher(pet, agora); }
        if(pet.estado === 'pipa') moverPipa(pet, agora);
        /* Acorda se o mouse chegar pertinho. */
        if(pet.estado === 'dormir' && !pet.soneca && !pet.naCama && Math.hypot(mouse.x - (pet.x + pet.s / 2), mouse.y - (pet.y + pet.s / 2)) < pet.s * .8 && agora - mouse.quando < 200){
          dormir(pet, false); pet.estado = 'parado'; pet.ate = agora + 1500; falar(pet, '! 😲', 1200);
        }
      }
      /* Passinho: sobe e desce e inclina enquanto anda (a foto 3D não mexe sozinha). */
      if(pet.temProps && !ATIVIDADES.includes(pet.estado)) tirarProps(pet);
      /* 🛟 Se ele se perdeu (fora da tela ou com posição estragada), volta sozinho. */
      if(!Number.isFinite(pet.x) || !Number.isFinite(pet.y) || (!['escondido', 'arrastado'].includes(pet.estado) && (pet.x < -pet.s * 2 || pet.x > innerWidth + pet.s || pet.y > innerHeight + pet.s || pet.y < -innerHeight))){
        pet.x = Math.random() * Math.max(1, innerWidth - pet.s); pet.y = -pet.s; pet.vx = 0; pet.vy = 0; pet.estado = 'cair';
      }
      if(cfg.ima && agora - mouse.quando < 600 && mouse.x > -999 && !pet.dentro && !jogo && !luta && IMA_OK.includes(pet.estado)){
        tirarProps(pet); pet.naCama = false; pet.estado = 'ima'; pet.ate = agora + 1e9; if(Math.random() < .3) falar(pet, sorte(['Tô sendo puxado! 🧲', 'Uaaau! 🧲✨']), 1200);
      }
      const andando = ['andar', 'correr', 'subir', 'teto', 'irCama', 'bola', 'borboleta', 'skate'].includes(pet.estado) || (pet.estado === 'fugir' && pet.correndo);
      pet.passo += dt * (pet.estado === 'correr' ? 16 : 9);
      const festeja = pet.estado === 'dancar' || pet.estado === 'cantar';
      const pulo = festeja ? -Math.abs(Math.sin(agora / 160)) * pet.s * .12 : pet.estado === 'sentar' ? pet.s * .05 : pet.estado === 'golpe' ? -Math.abs(Math.sin(agora / 90)) * pet.s * .05 : andando ? -Math.abs(Math.sin(pet.passo)) * pet.s * .07 : 0;
      /* Na parede fica deitado de lado (pés na parede); no teto fica de cabeça pra baixo; voando inclina. */
      const base = pet.estado === 'subir' ? (pet.lado < 0 ? 90 : -90) * (pet.dir > 0 ? -1 : 1) : pet.estado === 'teto' ? 180 : pet.estado === 'desmaiado' ? 90
        : pet.estado === 'escondido' ? (pet.esconde === 'cima' ? 180 : pet.esconde === 'esquerda' ? 18 : pet.esconde === 'direita' ? -18 : 0) + Math.sin(agora / 400) * 4 : 0;
      const vento = ventando() && ['andar', 'correr', 'parado', 'sentar', 'skate', 'ler'].includes(pet.estado) ? rajada.dir * 9 + Math.sin(agora / 120) * 3 : 0;
      const giro = base + vento + (pet.estado === 'balao' ? Math.sin(agora / 500) * 8 : pet.estado === 'ima' ? Math.sin(agora / 150) * 12 : 0) + (festeja ? Math.sin(agora / (pet.estado === 'cantar' ? 200 : 130)) * 18 : pet.estado === 'golpe' ? Math.sin(agora / 40) * 4 : andando ? Math.sin(pet.passo) * 5 : pet.estado === 'voar' ? Math.sin(agora / 300) * 8 : 0);
      const respira = pet.estado === 'sentar' ? .86 : pet.estado === 'espreguicar' ? 1.12 : pet.estado === 'parado' || pet.estado === 'dormir' ? 1 + Math.sin(agora / (pet.estado === 'dormir' ? 700 : 400)) * .025 : 1;
      const olha = pet.estado === 'cair' || pet.estado === 'arrastado' ? (pet.vx > 0 ? 1 : pet.vx < 0 ? -1 : pet.dir) : pet.dir;
      const treme = pet.frio && ['parado', 'sentar', 'andar'].includes(pet.estado) ? Math.sin(agora / 25) * 1.5 : 0;
      pet.el.style.transform = `translate(${pet.x + treme}px, ${pet.y}px)`;
      /* As fotos olham pra esquerda; andando pra direita, vira o espelho. */
      pet.corpo.style.transform = `translateY(${pulo}px) scaleX(${olha > 0 ? -1 : 1}) rotate(${giro}deg) scaleY(${respira})`;
      pet.el.classList.toggle('no-ar', pet.y < c - 2);
      pet.el.classList.toggle('sem-sombra', ['subir', 'teto', 'voar', 'escondido', 'balao', 'ima', 'piscina', 'banho'].includes(pet.estado));
    }
    desenharCeu(dt); soprar(agora, dt); moverBorboleta(dt, agora); desenharSelvagem(agora, dt); moverJogo(agora, dt);
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
    pets.forEach(p => { if(p !== pet){ p.menu.classList.remove('on'); fecharLinhas(p); } });
    pet.menu.classList.add('on'); desenharNec(pet);
    clearTimeout(pet.fechaMenu); pet.fechaMenu = setTimeout(() => { pet.menu.classList.remove('on'); fecharLinhas(pet); }, 9000);
  }
  const fecharLinhas = (pet, menos) => pet.menu.querySelectorAll('.comidas, .jogos, .roupas').forEach(l => { if(l !== menos) l.classList.remove('on'); });
  const abrirLinha = (pet, nome) => { const l = pet.menu.querySelector('.' + nome); fecharLinhas(pet, l); l.classList.toggle('on'); };
  function desenharNec(pet){
    pet.menu.querySelector('.titulo').innerHTML = pet.apelido ? `${esc(pet.apelido)} <small>(${esc(nomeDe(pet.id))})</small>` : esc(nomeDe(pet.id));
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
      const j = ev.target.closest('[data-jogo]'), r = ev.target.closest('[data-roupa]');
      if(j){ pet.menu.classList.remove('on'); fecharLinhas(pet); comecarJogo(j.dataset.jogo); return; }
      if(r){ vestirComo(pet, r.dataset.roupa); abrirMenu(pet); return; }
      if(f){ comer(pet, f.dataset.comida); abrirMenu(pet); return; }
      if(e){ pet.menu.classList.remove('on'); evoluir(pet, +e.dataset.evo); return; }
      if(!b) return;
      cuidar(pet, b.dataset.c); if(pet.menu.classList.contains('on')) abrirMenu(pet);
    });
  }
  function cuidar(pet, c){
    if(c === 'config'){ pet.menu.classList.remove('on'); window.andarilhoPC.abrirConfig(); return; }
    const n = nomeDo(pet);
    if(c === 'jogos'){ pet.menu.classList.remove('on'); abrirFliperama(); return; }
    if(c === 'comidas' || c === 'roupas'){ abrirLinha(pet, c); return; }
    if(c === 'batalha'){ pet.menu.classList.remove('on'); iniciarBatalha(pet); return; }
    if(c === 'cantar'){ pet.menu.classList.remove('on'); cantarTodos(); return; }
    if(c === 'dormir'){
      irDormir(pet, performance.now(), 20000, true); pet.menu.classList.remove('on'); ganharXp(pet, 1);
      return salvarNec();
    }
    if(c === 'banho'){ pet.nec.limpo = 100; atividade(pet, performance.now(), 'banho'); falar(pet, sorte(['Que cheirinho bom! 🛁', 'Banho gostoso!', 'Tô limpinho! ✨'])); ganharXp(pet, 1); }
    if(c === 'dentes'){ pet.nec.dentes = 100; efeito(pet, '🪥', 1); efeito(pet, '✨', 3); falar(pet, sorte(['Dentes brilhando! ✨', 'Escovadinho! 😁', 'Hálito fresquinho!'])); ganharXp(pet, 1); }
    ficouFeliz(pet, n); desenharNec(pet); salvarNec();
  }
  function ficouFeliz(pet, n){ if(NECS.every(k => pet.nec[k] >= 80)) setTimeout(() => { efeito(pet, '💖', 4); falar(pet, `O ${n || nomeDo(pet)} está muito feliz! 💖`); }, 900); }
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
    const antes = nomeDo(pet), i = pets.indexOf(pet);
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
      if(dorme && Math.random() < .12 && Date.now() - ultRonco > 6000){ ultRonco = Date.now(); if(!pet.dentro) falar(pet, sorte(['Zzz… ronc… 😴', 'Rooonc… shhh… 💤', 'Zzzz… 🍎… zzz']), 1800); somRuido(1, 150, .07); }
      const pior = NECS.slice().sort((a, b) => pet.nec[a] - pet.nec[b])[0];
      if(!dorme && pet.nec[pior] < 30 && Math.random() < .2) falar(pet, pior === 'fome' && Math.random() < .5 ? `Queria ${favDe(pet.id)}… 🥺` : sorte(PEDIDOS[pior].slice(1)));
      if(!dorme && !pet.dentro && pet.estado !== 'irCama' && pet.nec.sono < 10 && Math.random() < .15){ irDormir(pet, performance.now(), 15000, true); falar(pet, 'Não aguento mais… 😴', 1500); }
      desenharNec(pet);
    }
  }, 5000);
  let ultRonco = 0;
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
    const n = nomeDo(pet), sil = Array.from(n).slice(0, 2).join(''), sl = sil.toLowerCase();
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
    const chuva = chove(), neve = ceu.tipo === 'neve';
    if(!cfg.ligado || (!chuva && !neve)){ ceu.cv.textContent = ''; ceu.cv.dataset.k = ''; return; }
    const k = chuva ? 'c' + ceu.tipo : 'n'; if(ceu.cv.dataset.k === k) return; ceu.cv.dataset.k = k;
    let h = '';
    const n = Math.min(200, Math.round(innerWidth / (ceu.tipo === 'tempestade' ? 8 : chuva ? 12 : 18)));
    for(let i = 0; i < n; i++){
      const dur = chuva ? (ceu.tipo === 'tempestade' ? .45 : .6) + Math.random() * .5 : 7 + Math.random() * 7;
      h += `<i class="${chuva ? 'gota' : 'floco'}" style="left:${(Math.random() * 105).toFixed(1)}%;animation-duration:${dur.toFixed(2)}s;animation-delay:-${(Math.random() * dur).toFixed(2)}s;--vento:${chuva ? -40 : Math.round((Math.random() - .5) * 120)}px"></i>`;
    }
    ceu.cv.innerHTML = h;
  }
  function climaAgora(){
    if(cfg.clima !== 'auto') return cfg.clima;
    /* No automático o tempo muda a cada 8 minutos (igual em todas as abas). */
    let t = (Math.floor(Date.now() / 480000) * 2654435761) >>> 0;
    t = Math.imul(t ^ (t >>> 15), 2246822507) >>> 0; t = (t ^ (t >>> 13)) % 100;
    return t < 12 ? 'chuva' : t < 17 ? 'tempestade' : t < 25 ? 'neve' : t < 33 ? 'vento' : t < 60 ? 'sol' : 'nada';
  }
  const tipoGosta = { chuva:[2, 3], neve:[5] };
  const chove = () => ceu.tipo === 'chuva' || ceu.tipo === 'tempestade';
  const ventando = () => ceu.tipo === 'vento' || Date.now() < rajada.ate;
  function vestir(pet){
    let a = pet.el.querySelector('.acessorio');
    const guarda = chove() && !tipoGosta.chuva.includes(tipoDe(pet.id)) && !voa(pet.id);
    if(guarda && !a){ a = document.createElement('span'); a.className = 'acessorio'; a.textContent = '☂️'; pet.el.appendChild(a); }
    if(!guarda && a) a.remove();
    pet.frio = ceu.tipo === 'neve' && ![5, 1].includes(tipoDe(pet.id));
  }
  function mudouClima(tipo, avisar){
    const antes = ceu.tipo; ceu.tipo = tipo; encherCeu();
    if(['chuva', 'tempestade'].includes(antes) && !chove()) ceu.arcoAte = Date.now() + 90000;
    ceu.sol.classList.toggle('on', tipo === 'sol');
    boneco.el.classList.toggle('on', tipo === 'neve');
    pets.forEach(vestir); atualizarNoite();
    if(!avisar) return;
    pets.filter(p => !p.dentro).forEach((p, i) => setTimeout(() => {
      const t = tipoDe(p.id), agora = performance.now();
      if(tipo === 'tempestade' && t === 4){ falar(p, 'Raios! Eu adoro! ⚡😆', 2400); p.estado = 'dancar'; p.ate = agora + 3000; }
      else if(tipo === 'tempestade') falar(p, sorte(['Vem tempestade! ⛈️😨', 'Que medo de trovão! 😱']), 2400);
      else if(tipo === 'vento') falar(p, sorte(['Que ventania! 🌪️', 'Segura meu chapéu! 💨', 'Vou sair voando! 😱']), 2400);
      else if(tipo === 'chuva'){
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
      } else if(['chuva', 'tempestade'].includes(antes) && Math.random() < .7) falar(p, 'Olha o arco-íris! 🌈', 2400);
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

  /* ---------- 🔊 barulhos (trovão, pum, ronco, terremoto) ---------- */
  function somRuido(dur, freq, vol){
    if(!cfg.som) return;
    try{
      audio = audio || new (window.AudioContext || window.webkitAudioContext)();
      if(audio.state === 'suspended') audio.resume();
      const n = Math.floor(audio.sampleRate * dur), buf = audio.createBuffer(1, n, audio.sampleRate), d = buf.getChannelData(0);
      for(let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
      const src = audio.createBufferSource(), f = audio.createBiquadFilter(), g = audio.createGain(), t = audio.currentTime;
      src.buffer = buf; f.type = 'lowpass'; f.frequency.value = freq;
      g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.001, t + dur);
      src.connect(f); f.connect(g); g.connect(audio.destination); src.start();
    }catch(e){}
  }

  /* ---------- 🌪️ ventania ---------- */
  const rajada = { ate:0, dir:1, prox:0, ativo:false };
  function soprar(agora, dt){
    const vai = cfg.ligado && ventando();
    if(!vai){ if(rajada.ativo){ rajada.ativo = false; if(rajada.folhas) rajada.folhas.textContent = ''; } return; }
    if(!rajada.ativo){
      rajada.ativo = true;
      if(ceu.tipo === 'vento' && Date.now() >= rajada.ate) rajada.dir = Math.floor(Date.now() / 480000) % 2 ? -1 : 1;
      /* 🍃 Folhas voando de um lado pro outro (junto com a chuva ou a neve, se tiver). */
      if(!rajada.folhas){ rajada.folhas = document.createElement('div'); rajada.folhas.className = 'ceu'; raiz.appendChild(rajada.folhas); }
      rajada.folhas.classList.toggle('esquerda', rajada.dir < 0);
      let h = '';
      for(let i = 0; i < 26; i++){ const dur = 1.6 + Math.random() * 1.6;
        h += `<i class="folha" style="top:${(Math.random() * 90).toFixed(1)}%;animation-duration:${dur.toFixed(2)}s;animation-delay:-${(Math.random() * dur).toFixed(2)}s">${sorte(['🍃', '🍂', '🍃', '💨', '🍁'])}</i>`; }
      rajada.folhas.innerHTML = h;
    }
    if(bola.ativa) bola.vx += rajada.dir * 260 * dt;
    if(agora >= rajada.prox){
      rajada.prox = agora + (Date.now() < rajada.ate ? 1100 + Math.random() * 1400 : 2000 + Math.random() * 3000);
      const p = sorte(pets.filter(q => !q.dentro && !['batalha', 'desmaiado', 'escondido', 'fugir', 'arrastado', 'irCama', 'ima', 'subir', 'teto'].includes(q.estado)));
      if(p && !jogo){
        dormir(p, false); p.naCama = false; tirarProps(p);
        p.estado = 'cair'; p.vy = -350 - Math.random() * 500; p.vx = rajada.dir * (450 + Math.random() * 550);
        falar(p, sorte(['Socorrooo! 🌪️', 'Wiiiiii! 😆', 'Tô voandooo! 💨', 'Me segura! 😱', 'Que ventaniaaa! 🌬️']), 1600);
      }
    }
  }

  /* ---------- ⛈️ trovão ---------- */
  function relampago(){
    if(!cfg.ligado) return;
    const f = document.createElement('div'); f.className = 'flash relampago'; raiz.appendChild(f); setTimeout(() => f.remove(), 900);
    const r = document.createElement('span'); r.className = 'raio'; r.textContent = '⚡'; r.style.left = (10 + Math.random() * 80) + 'vw'; raiz.appendChild(r); setTimeout(() => r.remove(), 600);
    setTimeout(() => somRuido(2.4, 260, .55), 250);
    pets.filter(p => !p.dentro && !['batalha', 'escondido', 'arrastado', 'balao', 'ima'].includes(p.estado)).forEach((p, i) => setTimeout(() => {
      if(tipoDe(p.id) === 4){ efeito(p, '⚡', 3); if(Math.random() < .5) falar(p, 'Eba, energia! ⚡😆', 1500); }
      else if(Math.random() < .5){ falar(p, sorte(['Ai! Que medo! 😱', 'AAAH! ⚡😨', 'Trovão! 🙉']), 1500); if(p.y >= chao(p) - 2) pular(p, 420); }
    }, 300 + i * 120));
  }
  let proxRaio = 0;
  setInterval(() => { if(document.hidden || ceu.tipo !== 'tempestade') return; if(Date.now() > proxRaio){ proxRaio = Date.now() + 7000 + Math.random() * 9000; relampago(); } }, 1000);

  /* ---------- 🌋 terremoto ---------- */
  let tremendo = false;
  function terremoto(){
    if(tremendo || !cfg.ligado) return; tremendo = true;
    const passos = Array.from({ length:24 }, () => ({ transform:`translate(${((Math.random() - .5) * 18).toFixed(1)}px, ${((Math.random() - .5) * 12).toFixed(1)}px)` }));
    host.animate([...passos, { transform:'none' }], { duration:4200, easing:'linear' });
    somRuido(4, 110, .5);
    pets.forEach((p, i) => { if(!p.dentro) setTimeout(() => falar(p, sorte(['Terremotooo! 😱', 'Tá tudo tremendo! 🌋', 'Socorro! 😨', 'Segura firme! 🫨']), 2000), i * 200); });
    const t = setInterval(() => {
      const p = sorte(pets.filter(q => !q.dentro && ['andar', 'parado', 'sentar', 'correr', 'dancar', 'ler', 'cozinhar', 'espreguicar'].includes(q.estado)));
      if(p){ tirarProps(p); pular(p, 250 + Math.random() * 300); }
    }, 300);
    setTimeout(() => { clearInterval(t); tremendo = false; pets.forEach(p => { if(!p.dentro && Math.random() < .6) falar(p, sorte(['Ufa… passou! 😮‍💨', 'Que susto! 😵', 'Tá todo mundo bem? 🤕']), 2000); }); }, 4200);
  }

  /* ---------- 💨 pum (bem raro!) ---------- */
  function pum(pet){
    if(!pet || pet.dentro) return;
    const e = document.createElement('span'); e.className = 'efeito'; e.textContent = '💨';
    e.style.left = (pet.dir > 0 ? -pet.s * .15 : pet.s * .8) + 'px'; e.style.top = (pet.s * .6) + 'px'; e.style.setProperty('--dx', (-pet.dir * 40) + 'px');
    pet.el.appendChild(e); setTimeout(() => e.remove(), 1400);
    somRuido(.55, 190, .45);
    falar(pet, sorte(['Ops… 😳', 'Desculpa! 🙊', 'Não fui eu! 😇', 'Hihi… 🤭']), 1800);
    pets.filter(q => q !== pet && !q.dentro && Math.abs(q.x - pet.x) < pet.s * 2.5).forEach((q, i) => setTimeout(() => { falar(q, sorte(['Ecaaa! 🤢😂', 'Que fedor! 🤢', 'Quem foi?! 😂']), 1800); efeito(q, '🤢', 1); }, 500 + i * 250));
  }

  /* ---------- 🌙 noite ---------- */
  const ehNoite = () => { const h = new Date().getHours(); return h >= 19 || h < 6; };
  function atualizarNoite(){
    if(!ceu.cv) return;
    if(!ceu.lua){
      ceu.lua = document.createElement('span'); ceu.lua.className = 'lua'; ceu.lua.textContent = '🌙';
      ceu.estrelas = document.createElement('div'); ceu.estrelas.className = 'estrelas';
      ceu.estrelas.innerHTML = Array.from({ length:14 }, (_, i) => `<i style="left:${(4 + Math.random() * 92).toFixed(1)}%;top:${(2 + Math.random() * 22).toFixed(1)}%;animation-delay:-${(Math.random() * 2).toFixed(2)}s">✦</i>`).join('');
      raiz.prepend(ceu.lua, ceu.estrelas);
    }
    const on = cfg.ligado && cfg.clima !== 'nada' && ehNoite();
    ceu.lua.classList.toggle('on', on); ceu.estrelas.classList.toggle('on', on && !chove() && ceu.tipo !== 'neve');
    ceu.sol.classList.toggle('on', ceu.tipo === 'sol' && !ehNoite());
  }
  setInterval(atualizarNoite, 30000);

  /* ---------- 🛁📖🪁🏊🍳🛹🎈 atividades ---------- */
  const ATIVIDADES = ['banho', 'ler', 'pipa', 'piscina', 'cozinhar', 'skate', 'balao', 'pescar'];
  const IMA_OK = ['andar', 'correr', 'parado', 'sentar', 'espreguicar', 'dancar', 'cair', 'voar', 'bola', 'borboleta', 'golpe', 'cantar', ...ATIVIDADES];
  function tirarProps(pet){ (pet.props || []).forEach(e => e.remove()); pet.props = []; pet.temProps = false; }
  function atividade(pet, agora, qual){
    if(pet.dentro) return;
    qual = qual || sorte(ehNoite() ? ['ler', 'ler', 'cozinhar', 'balao'] : ['ler', 'pipa', 'piscina', 'cozinhar', 'skate', 'skate', 'pipa', 'piscina', 'balao']);
    tirarProps(pet); dormir(pet, false); pet.naCama = false; pet.menu.classList.remove('on');
    pet.estado = qual; pet.temProps = true; pet.props = [];
    const prop = (cls, t) => { const e = document.createElement('span'); e.className = 'prop ' + cls; e.textContent = t; pet.el.appendChild(e); pet.props.push(e); return e; };
    const fora = (cls, t) => { const e = document.createElement(t ? 'span' : 'div'); e.className = cls; if(t) e.textContent = t; raiz.appendChild(e); pet.props.push(e); return e; };
    if(qual === 'banho'){
      prop('banheira', '🛁'); pet.ate = agora + 4500; pet.y = chao(pet);
      for(let i = 0; i < 4; i++) setTimeout(() => { if(pet.estado === 'banho') efeito(pet, '🫧', 3); }, i * 900);
    }
    if(qual === 'ler'){ prop('livro', sorte(['📖', '📕', '📗', '📘'])); pet.ate = agora + 6000 + Math.random() * 4000; falar(pet, sorte(['Que história legal! 📖', 'Era uma vez… 📚', 'Shhh, tô lendo! 🤓', 'Esse livro é de Pokémon! 😍']), 2400); }
    if(qual === 'pipa'){ fora('linha-pipa'); fora('pipa', '🪁'); pet.ate = agora + 8000 + Math.random() * 4000; pet.y = chao(pet); falar(pet, sorte(['Olha minha pipa! 🪁', 'Sobe, pipa! 🪁', 'Que vento bom! 💨']), 2200); moverPipa(pet, agora); }
    if(qual === 'piscina'){
      const w = pet.s * 1.7, h = pet.s * .5, pis = fora('piscina');
      pis.style.width = w + 'px'; pis.style.height = h + 'px';
      pis.style.transform = `translate(${Math.max(0, Math.min(innerWidth - w, pet.x - pet.s * .35))}px, ${innerHeight - extraChao - 4 - h}px)`;
      pet.ate = agora + 7000 + Math.random() * 4000; efeito(pet, '💦', 4);
      falar(pet, tipoDe(pet.id) === 2 ? 'Eu nasci pra isso! 💧😎' : tipoDe(pet.id) === 1 ? 'Ai, é molhado! 🔥😬' : sorte(['Tchibum! 💦', 'Que água gostosa! 🏊', 'Olha eu nadando! 🏊']), 2200);
      for(let i = 1; i < 4; i++) setTimeout(() => { if(pet.estado === 'piscina') efeito(pet, '💦', 2); }, i * 1800);
    }
    if(qual === 'cozinhar'){
      prop('panela', '🍳'); pet.ate = agora + 5000 + Math.random() * 2000; falar(pet, sorte(['Vou cozinhar! 👨‍🍳', 'Hora de fazer um lanche! 🍳', 'Receita secreta… 🤫']), 2200);
      for(let i = 1; i < 4; i++) setTimeout(() => { if(pet.estado === 'cozinhar') efeito(pet, sorte(['♨️', '💨', '✨']), 2); }, i * 1300);
    }
    if(qual === 'skate'){ prop('skate', '🛹'); pet.ate = agora + 5000 + Math.random() * 4000; pet.dir = Math.random() < .5 ? -1 : 1; falar(pet, sorte(['Manobra radical! 🛹😎', 'Olha o skate! 🛹', 'Iuhuuu! 🛹']), 2000); }
    if(qual === 'pescar'){
      prop('vara', '🎣'); pet.y = chao(pet);
      const l = fora('lago'), w = 220;
      l.style.width = w + 'px'; l.style.left = Math.max(0, Math.min(innerWidth - w, pet.dir > 0 ? pet.x + pet.s * .8 : pet.x - w + pet.s * .2)) + 'px'; l.style.top = (innerHeight - extraChao - 26) + 'px';
      pet.ate = agora + 8000;
    }
    if(qual === 'balao'){ prop('balaozinho', '🎈'); pet.ate = agora + 6000 + Math.random() * 4000; falar(pet, sorte(['Achei um balão! 🎈', 'Tô subindoooo! 🎈😆', 'Wiii! 🎈']), 2000); }
  }
  function moverPipa(pet, agora){
    const [linha, pipa] = pet.props || []; if(!pipa) return;
    const hx = pet.x + pet.s / 2, hy = pet.y + pet.s * .35;
    const kx = Math.max(10, Math.min(innerWidth - 50, hx + (ventando() ? rajada.dir : pet.dir > 0 ? 1 : -1) * 150 + Math.sin(agora / 1300) * 50));
    const ky = Math.max(10, hy - 220 + Math.sin(agora / 700) * 25);
    pipa.style.transform = `translate(${kx - 20}px, ${ky - 20}px) rotate(${Math.sin(agora / 400) * 15}deg)`;
    const dx = kx - hx, dy = ky - hy;
    linha.style.width = Math.hypot(dx, dy) + 'px'; linha.style.transform = `translate(${hx}px, ${hy}px) rotate(${Math.atan2(dy, dx)}rad)`;
  }
  function terminouCozinhar(pet){
    const prato = sorte(['🎂', '🍪', '🥞', '🍕', '🍩']);
    efeito(pet, prato, 3); falar(pet, `Fiz ${prato}! Vem comer, gente! 😋`, 2600);
    pets.forEach(p => { p.nec.fome = Math.min(100, p.nec.fome + 15); });
    ganharXp(pet, 1);
  }

  /* ---------- botões de evento (janela de escolher) ---------- */
  function evento(t){
    const agora = performance.now();
    if(t === 'terremoto') terremoto();
    if(t === 'chamar') resgatar(true);
    if(t === 'fliperama') abrirFliperama();
    if(t === 'trovao'){ relampago(); setTimeout(relampago, 1600); }
    if(t === 'pum') pum(sorte(pets.filter(p => !p.dentro)));
    if(t === 'ventania'){ rajada.ate = Date.now() + 20000; rajada.dir = Math.random() < .5 ? -1 : 1; rajada.prox = 0; rajada.ativo = false; }
    if(t === 'balao') pets.forEach((p, i) => { if(!p.dentro && !['batalha', 'escondido', 'fugir'].includes(p.estado)) setTimeout(() => atividade(p, performance.now(), 'balao'), i * 300); });
  }

  /* ---------- 🎩 roupinhas ---------- */
  function vestirComo(pet, r){
    pet.roupa = ROUPAS.includes(r) ? r : undefined; vestirRoupa(pet);
    const i = pets.indexOf(pet);
    if(i >= 0 && cfg.pets[i]){ if(pet.roupa) cfg.pets[i].roupa = pet.roupa; else delete cfg.pets[i].roupa; salvarCfg(); }
    if(pet.roupa){ efeito(pet, '✨', 3); falar(pet, sorte(['Fiquei bonito? 😎', 'Amei! 😍', 'Olha meu chapéu!'])); } else falar(pet, 'Tirei! 😄');
  }

  /* ---------- 📋 placar (minijogos e batalha) ---------- */
  let placar = null;
  function mostrarPlacar(t){ if(!placar){ placar = document.createElement('div'); placar.className = 'placar'; raiz.appendChild(placar); } placar.textContent = t; clearTimeout(placar.some); }
  function sumirPlacar(ms){ if(!placar) return; const p = placar; clearTimeout(p.some); p.some = setTimeout(() => { p.remove(); if(placar === p) placar = null; }, ms || 0); }
  const centro = q => [q.x + q.s / 2, q.y + q.s / 2];

  /* ---------- ⚔️ batalha (de brincadeira!) ---------- */
  const SUPER = { 1:[3, 5, 11, 16], 2:[1, 8, 12], 3:[2, 8, 12], 4:[2, 9], 5:[3, 8, 9, 14], 6:[0, 5, 12, 15, 16], 7:[3, 17], 8:[1, 4, 7, 12, 16], 9:[3, 6, 11],
    10:[6, 7], 11:[3, 10, 15], 12:[1, 5, 9, 11], 13:[10, 13], 14:[14], 15:[10, 13], 16:[5, 12, 17], 17:[6, 14, 15] };
  let luta = null;
  function criarSelvagem(){
    const s = TAMANHOS[cfg.tamanho], el = document.createElement('div'); el.className = 'pet selvagem';
    el.style.width = s + 'px'; el.style.height = s + 'px'; el.style.setProperty('--s', s + 'px');
    el.innerHTML = '<div class="sombra"></div><div class="corpo"><img alt="" draggable="false" /></div><div class="balao"></div>';
    raiz.appendChild(el);
    const w = { id:1 + Math.floor(Math.random() * 1025), shiny:Math.random() < .06, el, img:el.querySelector('img'), corpo:el.querySelector('.corpo'), balao:el.querySelector('.balao'), s, x:innerWidth + 10, y:0, dir:-1, selvagem:true, fala:0 };
    w.img.onerror = () => { if(w.img.src !== reserva(w)) w.img.src = reserva(w); };
    w.img.src = imagem(w, cfg.estilo);
    return w;
  }
  function barraVida(q){ const v = document.createElement('div'); v.className = 'vida'; v.innerHTML = '<b></b>'; q.el.appendChild(v); return v; }
  function iniciarBatalha(pet){
    if(luta || jogo){ falar(pet, 'Agora não dá! Espera acabar 😅'); return; }
    if(pet.dentro) return;
    const agora = performance.now();
    const outros = pets.filter(p => p !== pet && !p.dentro && !['arrastado', 'irCama', 'dormir', 'cair', 'subir', 'teto'].includes(p.estado));
    const selvagem = !outros.length || Math.random() < .5;
    const b = selvagem ? criarSelvagem() : sorte(outros);
    const mid = innerWidth / 2, S = pet.s;
    [pet, b].forEach((q, k) => {
      q.x = Math.max(0, Math.min(innerWidth - q.s, k ? mid + 40 : mid - S - 40)); q.y = chao(q); q.dir = k ? -1 : 1;
      if(!q.selvagem){ dormir(q, false); q.naCama = false; q.estado = 'batalha'; q.ate = agora + 1e9; q.menu.classList.remove('on'); }
      efeito(q, '💨', 2);
      q.vida = 100; q.barra = barraVida(q);
    });
    luta = { a:pet, b, selvagem };
    mostrarPlacar(selvagem ? `🌿 Um ${nomeDe(b.id)}${b.shiny ? ' ✨' : ''} selvagem apareceu!` : `⚔️ ${nomeDo(pet)} vs ${nomeDo(b)}!`);
    falar(pet, sorte(['Vamos batalhar! ⚔️', 'Eu escolho você! 😤', 'Bora!']), 1400);
    setTimeout(() => turno(pet, b), 1600);
  }
  const lutaOk = () => luta && [luta.a, luta.b].every(q => q.selvagem || (pets.includes(q) && ['batalha', 'desmaiado'].includes(q.estado)));
  function turno(atk, def){
    if(!lutaOk()) return encerrarBatalha();
    const [e, nome] = GOLPES[tipoDe(atk.id)] || GOLPES[0];
    const sup = (SUPER[tipoDe(atk.id)] || []).includes(tipoDe(def.id)), crit = Math.random() < .12;
    mostrarPlacar(`${e} ${nomeDo(atk)} usou ${nome}!`);
    const t = document.createElement('span'); t.className = 'tiro'; t.textContent = e; raiz.appendChild(t);
    const [x1, y1] = centro(atk), [x2, y2] = centro(def);
    const anim = t.animate([{ transform:`translate(${x1 - 15}px, ${y1 - 15}px) scale(.6)` }, { transform:`translate(${x2 - 15}px, ${y2 - 15}px) scale(1.5)` }], { duration:450, easing:'ease-in' });
    anim.onfinish = () => {
      t.remove();
      if(!lutaOk()) return encerrarBatalha();
      const dano = Math.round((16 + Math.random() * 16) * (sup ? 1.5 : 1) * (crit ? 1.5 : 1));
      def.vida = Math.max(0, def.vida - dano);
      const b = def.barra.querySelector('b'); b.style.width = def.vida + '%'; b.className = def.vida < 25 ? 'baixo' : def.vida < 55 ? 'meio' : '';
      def.corpo.animate([{ translate:'0 0' }, { translate:'-8px 0' }, { translate:'8px 0' }, { translate:'0 0' }], { duration:300 });
      efeito(def, '💥', 2);
      if(sup || crit) mostrarPlacar(`${e} ${nomeDo(atk)} usou ${nome}! ${sup ? 'É super efetivo! 💪' : ''}${crit ? ' Acerto crítico! ⭐' : ''}`);
      if(def.vida <= 0) setTimeout(() => fimBatalha(atk, def), 600);
      else setTimeout(() => turno(def, atk), 1100);
    };
  }
  function fimBatalha(venc, perd){
    if(!lutaOk()) return encerrarBatalha();
    const agora = performance.now();
    if(perd.selvagem) perd.desmaiado = true; else { perd.estado = 'desmaiado'; perd.ate = agora + 1e9; }
    falar(perd, '😵', 2000);
    if(!venc.selvagem){ venc.estado = 'dancar'; venc.ate = agora + 1e9; efeito(venc, '🏆', 1); efeito(venc, '⭐', 3); ganharXp(venc, 2); falar(venc, sorte(['Venci! 🏆', 'Uhuuu! 🎉', 'Ganhei! 😎']), 2200); }
    if(perd.selvagem){
      mostrarPlacar(`🏆 ${nomeDo(venc)} venceu! Clique na Pokébola pra capturar o ${nomeDe(perd.id)}!`);
      const bola = document.createElement('div'); bola.className = 'pokebola clicavel'; bola.title = 'Capturar!';
      bola.style.left = Math.max(4, perd.x - 50) + 'px'; bola.style.top = (chao(perd) + perd.s - 48) + 'px';
      bola.addEventListener('pointerdown', ev => { ev.preventDefault(); ev.stopPropagation(); });
      bola.addEventListener('click', ev => { ev.stopPropagation(); capturar(bola, perd); });
      raiz.appendChild(bola); luta.bola = bola;
      luta.foge = setTimeout(() => { bola.remove(); mostrarPlacar(`💨 O ${nomeDe(perd.id)} acordou e fugiu!`); fugirSelvagem(perd); encerrarBatalha(2500); }, 15000);
    } else if(venc.selvagem){
      mostrarPlacar(`😵 O ${nomeDe(venc.id)} selvagem venceu e foi embora!`);
      setTimeout(() => { fugirSelvagem(venc); falar(perd, 'Ai… perdi 😵 Mas foi divertido!', 2400); encerrarBatalha(2500); }, 1500);
    } else {
      mostrarPlacar(`🏆 ${nomeDo(venc)} venceu!`);
      setTimeout(() => { falar(perd, 'Foi só de brincadeira! 🤝', 2200); efeito(perd, '🤝', 1); encerrarBatalha(2500); }, 2200);
    }
  }
  function capturar(bola, w){
    if(!luta || luta.capturando) return; luta.capturando = true; clearTimeout(luta.foge);
    bola.style.animation = 'none'; bola.style.transition = 'left .4s ease-in';
    bola.style.left = (w.x + w.s / 2 - 22) + 'px';
    mostrarPlacar('🔴 Pokébola, vai!');
    setTimeout(() => { w.el.animate([{ opacity:1, scale:'1' }, { opacity:0, scale:'.1' }], { duration:350, fill:'forwards' }); bola.classList.add('balancando'); }, 400);
    setTimeout(() => {
      const cabe = cfg.pets.length + cfg.ovos.length < MAX_PETS;
      if(cabe && Math.random() < .8){
        mostrarPlacar(`✨ Pegou! O ${nomeDe(w.id)}${w.shiny ? ' shiny' : ''} entrou pro seu time!`);
        nascer[cfg.pets.length] = { x:w.x, y:chao(w) };
        cfg.pets.push({ id:w.id, shiny:w.shiny }); montar(false); salvarCfg();
        const novo = pets[pets.length - 1]; if(novo){ efeito(novo, '✨', 5); falar(novo, 'Oi, treinador! 😄', 2500); }
        bola.remove(); w.el.remove(); encerrarBatalha(3500);
      } else {
        mostrarPlacar(cabe ? `💨 Ah não! O ${nomeDe(w.id)} escapou!` : `🌳 Seu time está cheio (10)! O ${nomeDe(w.id)} voltou pra natureza.`);
        bola.remove(); w.el.animate([{ opacity:0 }, { opacity:1 }], { duration:300, fill:'forwards' }); w.desmaiado = false;
        setTimeout(() => { fugirSelvagem(w); encerrarBatalha(2500); }, 500);
      }
    }, 2100);
  }
  function fugirSelvagem(w){
    if(!w || !w.selvagem || !w.el.isConnected) return;
    w.desmaiado = false; w.fugindo = true; w.dir = 1;
    w.el.animate([{ opacity:1 }, { opacity:0 }], { duration:1500, fill:'forwards' });
    setTimeout(() => w.el.remove(), 1600);
  }
  function encerrarBatalha(ms){
    if(!luta) return;
    const l = luta; luta = null;
    clearTimeout(l.foge); if(l.bola && !l.capturando) l.bola.remove();
    const agora = performance.now();
    [l.a, l.b].forEach(q => {
      if(q.barra){ q.barra.remove(); q.barra = null; }
      if(q.selvagem){ if(!q.fugindo && !l.capturando) fugirSelvagem(q); }
      else if(['batalha', 'desmaiado', 'dancar'].includes(q.estado)){ q.estado = 'parado'; q.ate = agora + 1500; }
    });
    sumirPlacar(ms || 0);
  }
  function desenharSelvagem(agora, dt){
    if(!luta || !luta.selvagem) return;
    const w = luta.b; if(!w.el.isConnected) return;
    if(w.fugindo) w.x += 260 * dt;
    w.y = chao(w);
    const pulo = w.desmaiado ? 0 : -Math.abs(Math.sin(agora / 220)) * w.s * .04;
    w.el.style.transform = `translate(${w.x}px, ${w.y}px)`;
    w.corpo.style.transform = `translateY(${pulo}px) scaleX(${w.dir > 0 ? -1 : 1}) rotate(${w.desmaiado ? 90 : 0}deg)`;
  }

  /* ---------- 🎮 minijogos ---------- */
  let jogo = null;
  const FRUTAS = ['🍎', '🍓', '🍌', '🍇', '🍒', '🍑', '🍍', '🍉'];
  function comecarJogo(tipo){
    if(jogo || luta){ return; }
    const agora = performance.now();
    pets.forEach(p => { if(p.dentro) sairDeCasa(p, ''); dormir(p, false); p.naCama = false; p.menu.classList.remove('on'); });
    if(tipo === 'frutas'){
      jogo = { tipo, fim:Date.now() + 25000, pontos:0, frutas:[], prox:0 };
      falar(sorte(pets), 'Pega as frutas pra gente! 🍎', 2200);
    } else if(tipo === 'esconde'){
      jogo = { tipo, fim:Date.now() + 63000, pontos:0, total:pets.length };
      mostrarPlacar('🙈 Fecha o olho! Eles vão se esconder… 3, 2, 1…');
      pets.forEach(p => { p.el.style.transition = 'opacity .4s'; p.el.style.opacity = '0'; p.estado = 'parado'; p.ate = agora + 1e9; });
      setTimeout(() => {
        if(!jogo || jogo.tipo !== 'esconde') return;
        const lados = ['esquerda', 'direita', 'baixo', 'cima'];
        pets.forEach((p, i) => {
          const lado = lados[(i + Math.floor(Math.random() * 4)) % 4], maxX = Math.max(0, innerWidth - p.s);
          p.esconde = lado; p.achado = false; p.estado = 'escondido'; p.ate = agora + 1e9;
          if(lado === 'esquerda'){ p.x = -p.s * .62; p.y = chao(p) - Math.random() * innerHeight * .4; p.dir = 1; }
          if(lado === 'direita'){ p.x = innerWidth - p.s * .38; p.y = chao(p) - Math.random() * innerHeight * .4; p.dir = -1; }
          if(lado === 'baixo'){ p.x = Math.random() * maxX; p.y = innerHeight - p.s * .3; }
          if(lado === 'cima'){ p.x = Math.random() * maxX; p.y = -p.s * .62; }
          p.el.style.opacity = '';
        });
        setTimeout(() => pets.forEach(p => { p.el.style.transition = ''; }), 500);
      }, 1800);
    } else if(tipo === 'alvo' || tipo === 'bolhas'){
      jogo = { tipo, fim:Date.now() + (tipo === 'alvo' ? 30000 : 25000), pontos:0, coisas:[], prox:0 };
      falar(sorte(pets), tipo === 'alvo' ? 'Acerta os alvos com a Pokébola! 🎯' : 'Estoura as bolhas! 🫧', 2200);
    } else if(tipo === 'boca'){
      const p = sorte(pets);
      jogo = { tipo, fim:Date.now() + 30000, pontos:0, frutas:[], prox:0, pegador:p };
      tirarProps(p); p.estado = 'pegador'; p.ate = agora + 1e9; p.vx = 0; p.vy = 0;
      falar(p, 'Mexe o mouse que eu pego as frutas com a boca! 😋', 2600);
    } else if(tipo === 'futebol'){
      jogo = { tipo, fim:Date.now() + 60000, azul:0, vermelho:0, gols:[] };
      pets.forEach((p, i) => { tirarProps(p); p.time = i % 2 ? 'vermelho' : 'azul'; p.estado = 'bola'; p.ate = agora + 1e9;
        const t = document.createElement('span'); t.className = 'time'; t.textContent = p.time === 'azul' ? '🔵' : '🔴'; p.el.appendChild(t); });
      ['esq', 'dir'].forEach(l => { const g = document.createElement('span'); g.className = 'gol ' + l; g.textContent = '🥅'; g.style.bottom = extraChao + 'px'; raiz.appendChild(g); jogo.gols.push(g); });
      chamarBola(); bola.x = innerWidth / 2 - 13; bola.vx = 0; bola.ate = performance.now() + 1e9;
      bola.el.classList.add('clicavel'); bola.el.style.pointerEvents = 'auto'; bola.el.style.cursor = 'pointer';
      falar(sorte(pets), 'Futebol! 🔵 contra 🔴! Clique na bola pra ajudar o 🔵! ⚽', 3000);
    } else if(tipo === 'pesca'){
      const p = sorte(pets.filter(q => !q.dentro)) || pets[0];
      jogo = { tipo, tentativas:6, pontos:0, pescador:p, peixes:[] };
      p.x = Math.max(0, Math.min(innerWidth - p.s - 240, innerWidth * .45)); p.dir = 1; p.vx = 0; p.vy = 0;
      atividade(p, agora, 'pescar'); p.ate = agora + 1e9;
      falar(p, 'Quando aparecer o ❗, clique nele bem rápido! 🎣', 3000);
      setTimeout(() => esperarPeixe(), 2500);
    } else if(tipo === 'pega'){
      jogo = { tipo, fim:Date.now() + 30000, pontos:0, total:pets.length };
      pets.forEach(p => { p.pego = false; p.estado = 'fugir'; p.ate = agora + 1e9; });
      falar(sorte(pets), 'Duvido me pegar! 😜', 2200);
    }
    atualizarJogo();
  }
  function atualizarJogo(){
    if(!jogo || jogo.cartao) return;
    if(jogo.tipo === 'pesca'){ mostrarPlacar(`🎣 Pescaria! ${jogo.pontos} peixes · faltam ${jogo.tentativas} tentativas`); return; }
    const falta = Math.max(0, Math.ceil((jogo.fim - Date.now()) / 1000));
    if(jogo.tipo === 'frutas') mostrarPlacar(`🍎 Clique nas frutas! ${jogo.pontos} frutas · ⏱️ ${falta}s`);
    if(jogo.tipo === 'esconde' && pets.some(p => p.estado === 'escondido' || p.achado)) mostrarPlacar(`🙈 Ache os Pokémon! ${jogo.pontos}/${jogo.total} · ⏱️ ${falta}s`);
    if(jogo.tipo === 'pega') mostrarPlacar(`🏃 Clique nos Pokémon pra pegar! ${jogo.pontos}/${jogo.total} · ⏱️ ${falta}s`);
    if(jogo.tipo === 'alvo') mostrarPlacar(`🎯 Clique nos alvos! ${jogo.pontos} acertos · ⏱️ ${falta}s`);
    if(jogo.tipo === 'bolhas') mostrarPlacar(`🫧 Estoure as bolhas! ${jogo.pontos} · ⏱️ ${falta}s`);
    if(jogo.tipo === 'boca') mostrarPlacar(`😋 Mexa o mouse! ${nomeDo(jogo.pegador)} comeu ${jogo.pontos} · ⏱️ ${falta}s`);
    if(jogo.tipo === 'futebol') mostrarPlacar(`⚽ 🔵 ${jogo.azul} x ${jogo.vermelho} 🔴 · ⏱️ ${falta}s`);
    if(falta <= 0) acabarJogo(false);
  }
  setInterval(atualizarJogo, 500);
  function acabarJogo(ganhou){
    if(!jogo) return;
    const j = jogo; jogo = null;
    const agora = performance.now();
    let txt = '';
    if(j.tipo === 'frutas'){
      j.frutas.forEach(f => f.el.remove());
      txt = j.pontos ? `🏆 Você pegou ${j.pontos} frutas! Todo mundo comeu! 😋` : '🍎 Acabou! Tenta de novo!';
      pets.forEach(p => { p.nec.fome = Math.min(100, p.nec.fome + j.pontos * 3); if(j.pontos) ganharXp(p, 1); });
    }
    if(j.tipo === 'alvo' || j.tipo === 'bolhas'){ j.coisas.forEach(c => c.el.remove()); txt = `🏆 ${j.pontos} ${j.tipo === 'alvo' ? 'acertos' : 'bolhas'}! ${j.pontos >= 15 ? 'Incrível! 🤩' : 'Muito bem! 👏'}`; }
    if(j.tipo === 'boca'){ j.frutas.forEach(f => f.el.remove()); txt = `😋 ${nomeDo(j.pegador)} comeu ${j.pontos} frutas!`; j.pegador.nec.fome = Math.min(100, j.pegador.nec.fome + j.pontos * 4); if(j.pegador.estado === 'pegador'){ j.pegador.estado = 'dancar'; j.pegador.ate = agora + 2500; } }
    if(j.tipo === 'futebol'){
      j.gols.forEach(g => g.remove()); pets.forEach(p => { const t = p.el.querySelector('.time'); if(t) t.remove(); if(p.estado === 'bola'){ p.estado = 'parado'; p.ate = agora + 800; } });
      bola.ate = agora + 3000; bola.el.classList.remove('clicavel'); bola.el.style.pointerEvents = ''; bola.el.style.cursor = '';
      txt = j.azul === j.vermelho ? `⚽ Empate! ${j.azul} x ${j.vermelho} 🤝` : `🏆 Time ${j.azul > j.vermelho ? '🔵 azul' : '🔴 vermelho'} ganhou! ${j.azul} x ${j.vermelho}`;
    }
    if(j.tipo === 'pesca'){ j.peixes.forEach(e => e.remove()); txt = `🎣 Você pescou ${j.pontos} ${j.pontos === 1 ? 'coisa' : 'coisas'}! 🐟`; if(j.pescador.estado === 'pescar'){ j.pescador.estado = 'parado'; j.pescador.ate = agora + 1000; } }
    if(j.tipo === 'esconde') txt = ganhou ? '🏆 Você achou todo mundo! 🎉' : `⏱️ Tempo! Você achou ${j.pontos} de ${j.total}.`;
    if(j.tipo === 'pega') txt = ganhou ? '🏆 Você pegou todo mundo! 🎉' : `⏱️ Tempo! Você pegou ${j.pontos} de ${j.total}.`;
    mostrarPlacar(txt); sumirPlacar(4500);
    pets.forEach(p => {
      if(p.estado === 'escondido'){ p.x = Math.max(0, Math.min(innerWidth - p.s, p.x)); p.y = Math.min(p.y, chao(p)); pular(p, 500); falar(p, 'Eu tava aqui! 😝', 1800); }
      else if(['fugir', 'sentar', 'parado', 'dancar'].includes(p.estado)){ p.estado = 'dancar'; p.ate = agora + 2500; }
      p.achado = false; p.pego = false;
      if(ganhou || j.pontos) ganharXp(p, 1);
    });
    if(ganhou || j.pontos) efeito(sorte(pets), '🎉', 4);
  }
  /* Clique num Pokémon durante o jogo: achou (esconde-esconde) ou pegou (pega-pega). */
  function cliqueDoJogo(pet){
    if(!jogo) return false;
    if(jogo.tipo === 'esconde' && pet.estado === 'escondido'){
      pet.achado = true; jogo.pontos++;
      pet.x = Math.max(0, Math.min(innerWidth - pet.s, pet.x)); pet.y = Math.min(Math.max(0, pet.y), chao(pet));
      pular(pet, 450); efeito(pet, '⭐', 3); falar(pet, sorte(['Achou! 😆', 'Ahh, me achou! 🙈', 'Como você me viu?! 😲']), 1800); grito(pet);
      if(jogo.pontos >= jogo.total) acabarJogo(true); else atualizarJogo();
      return true;
    }
    if(jogo.tipo === 'pega' && !pet.pego){
      pet.pego = true; jogo.pontos++; pet.estado = 'sentar'; pet.ate = performance.now() + 1e9;
      efeito(pet, '⭐', 3); falar(pet, sorte(['Me pegou! 😆', 'Ahhh! Você é rápido! 😲', 'Tô pego! 🙌']), 1800); grito(pet);
      if(jogo.pontos >= jogo.total) acabarJogo(true); else atualizarJogo();
      return true;
    }
    return false;
  }
  function moverJogo(agora, dt){
    if(!jogo) return;
    if(jogo.tipo === 'alvo' || jogo.tipo === 'bolhas') return moverAlvos(agora, dt);
    if(jogo.tipo === 'boca') return moverBoca(agora, dt);
    if(jogo.tipo === 'futebol') return conferirGol(agora);
    if(jogo.tipo !== 'frutas') return;
    if(agora >= jogo.prox && Date.now() < jogo.fim){
      jogo.prox = agora + 450 + Math.random() * 400;
      const pedra = Math.random() < .15, f = document.createElement('span'); f.className = 'fruta clicavel'; f.textContent = pedra ? '🪨' : sorte(FRUTAS);
      const fr = { el:f, x:20 + Math.random() * Math.max(10, innerWidth - 70), y:-40, v:130 + Math.random() * 120, pedra, giro:Math.random() * 360 };
      f.addEventListener('pointerdown', ev => {
        ev.preventDefault(); ev.stopPropagation();
        if(!jogo || jogo.tipo !== 'frutas') return;
        if(fr.pedra){ jogo.pontos = Math.max(0, jogo.pontos - 1); f.textContent = '💢'; }
        else { jogo.pontos++; f.textContent = '✨'; const p = sorte(pets); if(p && Math.random() < .35) falar(p, sorte(['Boa! 😋', 'Nham! 🍎', 'Mais uma! 🙌']), 1000); }
        fr.v = 0; jogo.frutas = jogo.frutas.filter(x => x !== fr); setTimeout(() => f.remove(), 250); atualizarJogo();
      });
      raiz.appendChild(f); jogo.frutas.push(fr);
    }
    jogo.frutas = jogo.frutas.filter(fr => {
      fr.y += fr.v * dt; fr.giro += dt * 90;
      fr.el.style.transform = `translate(${fr.x}px, ${fr.y}px) rotate(${Math.sin(fr.giro / 20) * 20}deg)`;
      if(fr.y > innerHeight - extraChao - 30){ fr.el.remove(); return false; }
      return true;
    });
  }

  /* ---------- 🆘 chamar os Pokémon (se sumirem) ---------- */
  function resgatar(avisar){
    encerrarBatalha(); if(jogo){ fecharCartao(); acabarJogo(false); }
    pets.forEach((p, i) => {
      if(p.dentro){ p.dentro = false; p.el.classList.remove('dentro'); }
      tirarProps(p); dormir(p, false); p.naCama = false;
      p.el.style.opacity = ''; p.el.style.display = ''; p.el.style.transition = '';
      p.x = Math.max(0, Math.min(innerWidth - p.s, innerWidth / 2 - p.s / 2 + (i - pets.length / 2) * p.s * .8));
      p.y = -p.s - i * 40; p.vx = 0; p.vy = 0; p.estado = 'cair';
      if(!p.img.complete || !p.img.naturalWidth) trocarFoto(p);
    });
    desenharCasa();
    if(avisar && pets[0]) setTimeout(() => falar(pets[0], 'Chegamos! 👋😄', 2000), 900);
  }

  /* ---------- 🕹️ cartão (janelinha dos jogos) ---------- */
  let cartaoEl = null;
  function abrirCartao(titulo){
    fecharCartao();
    const c = document.createElement('div'); c.className = 'cartao clicavel';
    c.innerHTML = `<div class="topo-c"><b>${titulo}</b><button type="button" data-fechar title="Fechar">✖️</button></div><div class="corpo-c"></div>`;
    ['pointerdown', 'pointerup', 'click', 'dblclick'].forEach(t => c.addEventListener(t, ev => ev.stopPropagation()));
    c.querySelector('[data-fechar]').addEventListener('click', () => fecharCartao());
    raiz.appendChild(c); cartaoEl = c;
    return c.querySelector('.corpo-c');
  }
  function fecharCartao(){
    if(cartaoEl){ cartaoEl.remove(); cartaoEl = null; }
    if(jogo && jogo.cartao){ const j = jogo; jogo = null; if(j.parar) j.parar(); }
  }
  const JOGOS = [['frutas', '🍎 Chuva de frutas'], ['esconde', '🙈 Esconde-esconde'], ['pega', '🏃 Pega-pega'], ['alvo', '🎯 Pokébola no alvo'], ['quiz', '❓ Quem é esse Pokémon?'],
    ['futebol', '⚽ Futebol'], ['bolhas', '🫧 Bolhas'], ['pesca', '🎣 Pescaria'], ['ppt', '✊ Pedra, papel e tesoura'], ['numero', '🔢 Adivinhe o número'],
    ['velha', '❌ Jogo da velha'], ['boca', '😋 Frutas na boca'], ['cobra', '🐍 Cobrinha']];
  function abrirFliperama(){
    if(luta){ return; }
    if(jogo && !jogo.cartao){ mostrarPlacar('⏳ Termine o jogo que está acontecendo!'); sumirPlacar(2000); return; }
    const corpo = abrirCartao('🕹️ Fliperama Pokémon');
    corpo.innerHTML = `<p class="dica-c">Escolha um jogo!</p><div class="grade-jogos">${JOGOS.map(([k, n]) => `<button type="button" data-jogo="${k}">${n}</button>`).join('')}</div>`;
    corpo.addEventListener('click', ev => { const b = ev.target.closest('[data-jogo]'); if(!b) return; const k = b.dataset.jogo; fecharCartao(); iniciarQualquer(k); });
  }
  function iniciarQualquer(k){
    if(k === 'quiz') return jogoQuiz();
    if(k === 'ppt') return jogoPPT();
    if(k === 'numero') return jogoNumero();
    if(k === 'velha') return jogoVelha();
    if(k === 'cobra') return jogoCobra();
    comecarJogo(k);
  }
  const amigo = () => sorte(pets.filter(p => !p.dentro)) || pets[0];
  const torcer = (t, ms) => { const p = amigo(); if(p) falar(p, t, ms || 1600); };
  function botaoDeNovo(corpo, k){
    const b = document.createElement('button'); b.type = 'button'; b.className = 'grande'; b.textContent = '🔁 Jogar de novo';
    b.addEventListener('click', () => iniciarQualquer(k)); corpo.appendChild(b);
  }

  /* ❓ Quem é esse Pokémon? */
  function jogoQuiz(){
    const corpo = abrirCartao('❓ Quem é esse Pokémon?');
    jogo = { tipo:'quiz', cartao:true, rodada:0, pontos:0 };
    const j = jogo;
    const rodada = () => {
      if(jogo !== j) return;
      if(j.rodada >= 10){ jogo = null; corpo.innerHTML = `<p class="grande-txt">Você acertou <b>${j.pontos}</b> de 10! ${j.pontos >= 8 ? '🏆' : j.pontos >= 5 ? '👏' : '💪'}</p>`; botaoDeNovo(corpo, 'quiz'); pets.forEach(p => ganharXp(p, 1)); torcer(j.pontos >= 5 ? 'Você é um mestre Pokémon! 🏆' : 'Quase! Bora de novo? 😄'); return; }
      j.rodada++;
      const certo = 1 + Math.floor(Math.random() * 493), ops = new Set([certo]);
      while(ops.size < 4) ops.add(1 + Math.floor(Math.random() * 493));
      const lista = [...ops].sort(() => Math.random() - .5);
      corpo.innerHTML = `<p class="dica-c">Rodada ${j.rodada} de 10 · ✅ ${j.pontos}</p><img class="sombra-poke" alt="Pokémon misterioso" src="${BASE}home/${certo}.png" /><div class="ops">${lista.map(id => `<button type="button" data-op="${id}">${esc(nomeDe(id))}</button>`).join('')}</div>`;
      corpo.querySelector('.ops').addEventListener('click', ev => {
        const b = ev.target.closest('[data-op]'); if(!b || j.respondeu === j.rodada) return; j.respondeu = j.rodada;
        const ok = +b.dataset.op === certo; if(ok) j.pontos++;
        corpo.querySelector('.sombra-poke').classList.add('revelado');
        corpo.querySelectorAll('[data-op]').forEach(x => x.classList.add(+x.dataset.op === certo ? 'certo' : x === b ? 'errado' : 'apagado'));
        torcer(ok ? sorte(['Acertou! 🎉', 'Isso aí! 😄', 'Mandou bem! 👏']) : `Era o ${nomeDe(certo)}! 😅`);
        setTimeout(rodada, 1700);
      });
    };
    rodada();
  }
  /* ✊ Pedra, papel e tesoura (quem fizer 3 primeiro) */
  function jogoPPT(){
    const corpo = abrirCartao('✊ Pedra, papel e tesoura'), rival = amigo();
    jogo = { tipo:'ppt', cartao:true, eu:0, ele:0 };
    const j = jogo, M = { '✊':'✌️', '✋':'✊', '✌️':'✋' };
    const tela = msg => {
      corpo.innerHTML = `<p class="dica-c">Você ${j.eu} x ${j.ele} ${esc(nomeDo(rival))} · quem fizer 3 ganha!</p><p class="grande-txt">${msg || 'Escolha:'}</p>
        ${j.eu >= 3 || j.ele >= 3 ? '' : '<div class="ops tres"><button type="button" data-m="✊">✊</button><button type="button" data-m="✋">✋</button><button type="button" data-m="✌️">✌️</button></div>'}`;
      if(j.eu >= 3 || j.ele >= 3){ jogo = null; corpo.insertAdjacentHTML('beforeend', `<p class="grande-txt">${j.eu >= 3 ? '🏆 Você ganhou!' : `😝 ${esc(nomeDo(rival))} ganhou!`}</p>`); botaoDeNovo(corpo, 'ppt'); falar(rival, j.eu >= 3 ? 'Você é bom nisso! 😲' : 'Ganhei! 😎', 2000); if(j.eu >= 3) ganharXp(rival, 1); }
    };
    corpo.addEventListener('click', ev => {
      const b = ev.target.closest('[data-m]'); if(!b || jogo !== j) return;
      const eu = b.dataset.m, ele = sorte(Object.keys(M));
      let r = 'Empate! 🤝'; if(M[eu] === ele){ j.eu++; r = 'Você ganhou essa! 🎉'; } else if(M[ele] === eu){ j.ele++; r = `${esc(nomeDo(rival))} ganhou essa! 😝`; }
      falar(rival, ele, 1200);
      tela(`Você: ${eu} · ${esc(nomeDo(rival))}: ${ele}<br>${r}`);
    });
    tela();
  }
  /* 🔢 Adivinhe o número (1 a 20) */
  function jogoNumero(){
    const corpo = abrirCartao('🔢 Adivinhe o número'), quem = amigo(), segredo = 1 + Math.floor(Math.random() * 20);
    jogo = { tipo:'numero', cartao:true, tent:0 };
    const j = jogo;
    corpo.innerHTML = `<p class="dica-c">${esc(nomeDo(quem))} pensou num número de 1 a 20. Qual é?</p><p class="grande-txt" data-dica>🤔</p><div class="ops numeros">${Array.from({ length:20 }, (_, i) => `<button type="button" data-n="${i + 1}">${i + 1}</button>`).join('')}</div>`;
    falar(quem, 'Pensei num número! 🤫', 1800);
    corpo.querySelector('.numeros').addEventListener('click', ev => {
      const b = ev.target.closest('[data-n]'); if(!b || b.disabled || jogo !== j) return;
      const n = +b.dataset.n; j.tent++;
      if(n === segredo){
        b.classList.add('certo'); jogo = null;
        corpo.querySelector('[data-dica]').textContent = `🎉 Acertou! Era ${segredo}! (${j.tent} ${j.tent === 1 ? 'tentativa' : 'tentativas'})`;
        falar(quem, j.tent <= 4 ? 'Você leu minha mente?! 😲' : 'Acertou! 🎉', 2000); ganharXp(quem, 1); botaoDeNovo(corpo, 'numero');
      } else {
        b.disabled = true; b.classList.add('apagado');
        corpo.querySelector('[data-dica]').textContent = n < segredo ? `⬆️ É MAIOR que ${n}!` : `⬇️ É MENOR que ${n}!`;
        falar(quem, n < segredo ? 'Mais alto! ⬆️' : 'Mais baixo! ⬇️', 1200);
      }
    });
  }
  /* ❌⭕ Jogo da velha */
  function jogoVelha(){
    const corpo = abrirCartao('❌ Jogo da velha'), rival = amigo();
    jogo = { tipo:'velha', cartao:true, casas:Array(9).fill(''), vez:'X' };
    const j = jogo, L = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
    const ganhou = (c, q) => L.some(l => l.every(i => c[i] === q));
    const tela = msg => {
      corpo.innerHTML = `<p class="dica-c">Você é ❌ · ${esc(nomeDo(rival))} é ⭕</p><div class="velha">${j.casas.map((c, i) => `<button type="button" data-c="${i}">${c === 'X' ? '❌' : c === 'O' ? '⭕' : ''}</button>`).join('')}</div><p class="grande-txt">${msg || ''}</p>`;
      if(!jogo) botaoDeNovo(corpo, 'velha');
    };
    const fim = () => {
      if(ganhou(j.casas, 'X')){ jogo = null; tela('🏆 Você ganhou!'); falar(rival, 'Ahhh, você é bom! 😲', 2000); ganharXp(rival, 1); return true; }
      if(ganhou(j.casas, 'O')){ jogo = null; tela(`😝 ${esc(nomeDo(rival))} ganhou!`); falar(rival, 'Ganhei! 😎', 2000); return true; }
      if(j.casas.every(c => c)){ jogo = null; tela('🤝 Deu velha! (empate)'); falar(rival, 'Empate! 🤝', 2000); return true; }
      return false;
    };
    const jogadaDele = () => {
      const livres = j.casas.map((c, i) => c ? -1 : i).filter(i => i >= 0);
      const testa = q => livres.find(i => { const c = j.casas.slice(); c[i] = q; return ganhou(c, q); });
      let i = testa('O'); if(i === undefined && Math.random() < .75) i = testa('X');
      if(i === undefined) i = j.casas[4] === '' && Math.random() < .5 ? 4 : sorte(livres);
      j.casas[i] = 'O'; j.vez = 'X'; if(!fim()) tela('Sua vez!');
    };
    corpo.addEventListener('click', ev => {
      const b = ev.target.closest('[data-c]'); if(!b || jogo !== j || j.vez !== 'X') return;
      const i = +b.dataset.c; if(j.casas[i]) return;
      j.casas[i] = 'X'; j.vez = 'O';
      if(!fim()){ tela(`${esc(nomeDo(rival))} está pensando… 🤔`); setTimeout(() => { if(jogo === j) jogadaDele(); }, 600); }
    });
    tela('Sua vez!');
  }
  /* 🐍 Cobrinha (dá pra usar as setinhas da tela ou do teclado) */
  function jogoCobra(){
    const corpo = abrirCartao('🐍 Cobrinha'), N = 12;
    jogo = { tipo:'cobra', cartao:true, corpo:[[5, 6], [4, 6], [3, 6]], dir:[1, 0], prox:[1, 0], pontos:0 };
    const j = jogo;
    corpo.innerHTML = `<p class="dica-c">Coma as maçãs! 🍎 <b data-p>0</b></p><div class="cobra">${'<i></i>'.repeat(N * N)}</div>
      <div class="setas"><span></span><button type="button" data-d="0,-1">⬆️</button><span></span><button type="button" data-d="-1,0">⬅️</button><button type="button" data-d="0,1">⬇️</button><button type="button" data-d="1,0">➡️</button></div><p class="grande-txt" data-msg></p>`;
    const cel = corpo.querySelectorAll('.cobra i');
    const novaMaca = () => { let m; do m = [Math.floor(Math.random() * N), Math.floor(Math.random() * N)]; while(j.corpo.some(c => c[0] === m[0] && c[1] === m[1])); j.maca = m; };
    novaMaca();
    const virar = d => { if(d[0] === -j.dir[0] && d[1] === -j.dir[1]) return; j.prox = d; };
    corpo.querySelector('.setas').addEventListener('click', ev => { const b = ev.target.closest('[data-d]'); if(b) virar(b.dataset.d.split(',').map(Number)); });
    const tecla = ev => { const d = { ArrowUp:[0, -1], ArrowDown:[0, 1], ArrowLeft:[-1, 0], ArrowRight:[1, 0] }[ev.key]; if(d && jogo === j){ ev.preventDefault(); virar(d); } };
    addEventListener('keydown', tecla);
    const desenhar = () => {
      cel.forEach(c => { c.textContent = ''; c.className = ''; });
      cel[j.maca[1] * N + j.maca[0]].textContent = '🍎';
      j.corpo.forEach(([x, y], k) => { const c = cel[y * N + x]; c.className = k ? 'gomo' : 'cabeca'; if(!k) c.textContent = '🐍'; });
    };
    const passo = () => {
      if(jogo !== j) return;
      j.dir = j.prox;
      const h = [(j.corpo[0][0] + j.dir[0] + N) % N, (j.corpo[0][1] + j.dir[1] + N) % N];
      if(j.corpo.some(c => c[0] === h[0] && c[1] === h[1])){
        jogo = null; j.parar();
        corpo.querySelector('[data-msg]').textContent = `💥 Fim! Você comeu ${j.pontos} ${j.pontos === 1 ? 'maçã' : 'maçãs'}!`; botaoDeNovo(corpo, 'cobra');
        torcer(j.pontos >= 10 ? 'Que cobrona! 🐍🏆' : 'Bora de novo! 🐍'); return;
      }
      j.corpo.unshift(h);
      if(h[0] === j.maca[0] && h[1] === j.maca[1]){ j.pontos++; corpo.querySelector('[data-p]').textContent = j.pontos; novaMaca(); if(j.pontos % 3 === 0) torcer(sorte(['Nham! 🍎', 'Vai, cobrinha! 🐍', 'Tá crescendo! 😲']), 1200); }
      else j.corpo.pop();
      desenhar();
    };
    const t = setInterval(passo, 230);
    j.parar = () => { clearInterval(t); removeEventListener('keydown', tecla); };
    desenhar();
  }

  /* 🎯 alvos e 🫧 bolhas: aparecem na tela pra clicar */
  function moverAlvos(agora, dt){
    const j = jogo, alvo = j.tipo === 'alvo';
    if(agora >= j.prox && Date.now() < j.fim){
      j.prox = agora + (alvo ? 750 : 420) + Math.random() * 300;
      const e = document.createElement('span'), dourada = !alvo && Math.random() < .1;
      e.className = (alvo ? 'alvo' : 'bolha') + ' clicavel' + (dourada ? ' dourada' : ''); e.textContent = alvo ? '🎯' : '🫧';
      const tam = alvo ? 52 : 34 + Math.random() * 30;
      const c = { el:e, x:20 + Math.random() * Math.max(10, innerWidth - 80), y:alvo ? 40 + Math.random() * Math.max(10, innerHeight * .65) : innerHeight - extraChao - 20, nasce:agora, v:alvo ? 0 : 70 + Math.random() * 70, f:Math.random() * 6, pontos:dourada ? 3 : 1 };
      e.style.fontSize = tam + 'px';
      e.addEventListener('pointerdown', ev => {
        ev.preventDefault(); ev.stopPropagation();
        if(jogo !== j || c.feito) return; c.feito = true; j.pontos += c.pontos;
        if(alvo){
          const b = document.createElement('div'); b.className = 'pokebola mini'; raiz.appendChild(b);
          b.animate([{ transform:`translate(${innerWidth / 2}px, ${innerHeight - extraChao - 30}px) scale(.6)` }, { transform:`translate(${c.x + 10}px, ${c.y + 10}px) scale(1)` }], { duration:250, fill:'forwards' });
          setTimeout(() => b.remove(), 400); setTimeout(() => { e.textContent = '💥'; }, 230);
        } else { e.textContent = dourada ? '✨+3' : '💦'; somRuido(.08, 2500, .15); }
        setTimeout(() => e.remove(), 400); atualizarJogo();
        if(Math.random() < .2) torcer(sorte(['Boa! 👏', 'Na mosca! 🎯', 'Plof! 🫧', 'Mais! 😆']), 900);
      });
      raiz.appendChild(e); j.coisas.push(c);
    }
    j.coisas = j.coisas.filter(c => {
      if(!c.el.isConnected) return false;
      if(alvo){ const idade = agora - c.nasce; c.el.style.opacity = idade > 1100 ? Math.max(0, 1 - (idade - 1100) / 400) : 1; if(idade > 1500){ c.el.remove(); return false; } }
      else { c.y -= c.v * dt; c.f += dt * 2; c.x += Math.sin(c.f) * 25 * dt; if(c.y < -60){ c.el.remove(); return false; } }
      c.el.style.transform = `translate(${c.x}px, ${c.y}px)`;
      return true;
    });
  }
  /* 😋 frutas na boca: elas caem e o Pokémon (que segue o mouse) pega */
  function moverBoca(agora, dt){
    const j = jogo, p = j.pegador;
    if(!pets.includes(p)) return acabarJogo(false);
    if(agora >= j.prox && Date.now() < j.fim){
      j.prox = agora + 650 + Math.random() * 450;
      const pedra = Math.random() < .2, f = document.createElement('span'); f.className = 'fruta'; f.style.pointerEvents = 'none'; f.textContent = pedra ? '🪨' : sorte(FRUTAS);
      raiz.appendChild(f); j.frutas.push({ el:f, x:20 + Math.random() * Math.max(10, innerWidth - 70), y:-40, v:150 + Math.random() * 110, pedra });
    }
    const boca = p.y + p.s * .35, cx = p.x + p.s / 2;
    j.frutas = j.frutas.filter(fr => {
      fr.y += fr.v * dt; fr.el.style.transform = `translate(${fr.x}px, ${fr.y}px)`;
      if(fr.y + 30 >= boca && fr.y < boca + 30 && Math.abs(fr.x + 17 - cx) < p.s * .42){
        fr.el.remove();
        if(fr.pedra){ j.pontos = Math.max(0, j.pontos - 1); efeito(p, '💢', 1); falar(p, 'Ai! Pedra não! 🪨😣', 1000); }
        else { j.pontos++; efeito(p, '😋', 1); if(Math.random() < .3) falar(p, sorte(['Nham! 😋', 'Delícia!', 'Mais!']), 800); }
        atualizarJogo(); return false;
      }
      if(fr.y > innerHeight - extraChao - 30){ fr.el.remove(); return false; }
      return true;
    });
  }
  /* ⚽ confere se a bola entrou no gol */
  function conferirGol(agora){
    const j = jogo;
    if(!j.bolaPronta && bola.el){
      j.bolaPronta = true;
      bola.el.onpointerdown = ev => { if(!jogo || jogo.tipo !== 'futebol') return; ev.preventDefault(); ev.stopPropagation(); bola.vx = 750; torcer('Chutou! ⚽🔵', 900); };
    }
    const maxX = innerWidth - 26;
    const lado = bola.x <= 1 ? 'vermelho' : bola.x >= maxX - 1 ? 'azul' : '';
    if(!lado || agora < (j.espera || 0)) return;
    j[lado]++; j.espera = agora + 1500;
    mostrarPlacar(`⚽ GOOOOL do ${lado === 'azul' ? '🔵 azul' : '🔴 vermelho'}! ${j.azul} x ${j.vermelho}`);
    pets.filter(p => p.time === lado).forEach(p => { efeito(p, '🎉', 3); falar(p, 'GOOOL! 🥅🎉', 1500); });
    setTimeout(() => { if(jogo === j){ bola.x = innerWidth / 2 - 13; bola.vx = 0; } }, 900);
  }
  /* 🎣 pescaria: espera o ❗ e clica rápido */
  const PESCA = ['🐟', '🐠', '🐡', '🦐', '🦀', '🐙', '🦑', '🥾', '🐟', '🐠', '🐳', '🪸'];
  const POKE_AGUA = [129, 54, 118, 116, 60, 90, 120, 170, 222, 223, 318, 339, 349, 550];
  function esperarPeixe(){
    const j = jogo; if(!j || j.tipo !== 'pesca') return;
    if(j.tentativas <= 0) return acabarJogo(j.pontos > 0);
    atualizarJogo();
    setTimeout(() => {
      if(jogo !== j) return;
      const p = j.pescador, e = document.createElement('span'); e.className = 'fisgou clicavel'; e.textContent = '❗';
      e.style.left = Math.max(0, Math.min(innerWidth - 50, p.x + p.s / 2 + p.dir * p.s * .6)) + 'px'; e.style.top = (p.y - 10) + 'px';
      raiz.appendChild(e); j.peixes.push(e); somRuido(.12, 3000, .2);
      let pegou = false;
      e.addEventListener('pointerdown', ev => {
        ev.preventDefault(); ev.stopPropagation(); if(pegou || jogo !== j) return; pegou = true;
        const poke = Math.random() < .15, coisa = poke ? sorte(POKE_AGUA) : sorte(PESCA);
        e.className = 'fisgou pescado'; e.innerHTML = poke ? `<img alt="" src="${BASE}home/${coisa}.png" />` : coisa;
        if(coisa !== '🥾') j.pontos++;
        falar(p, poke ? `Pesquei um ${nomeDe(coisa)}! 😲✨` : coisa === '🥾' ? 'Uma bota?! 😂' : `Pesquei ${coisa}! 🎣`, 2000);
        setTimeout(() => e.remove(), 1500);
      });
      setTimeout(() => {
        if(!pegou && jogo === j){ e.remove(); falar(p, sorte(['Escapou! 😝', 'Ah, foi embora! 🐟💨']), 1400); }
        if(jogo === j){ j.tentativas--; setTimeout(esperarPeixe, 1200); }
      }, 1100);
    }, 1500 + Math.random() * 2500);
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
    if(c.evento && (!antes.evento || c.evento.q !== antes.evento.q) && Math.abs(Date.now() - c.evento.q) < 20000) evento(c.evento.t);
    if(c.ima !== antes.ima && !c.ima) pets.forEach(p => { if(p.estado === 'ima'){ p.estado = 'cair'; p.vx = 0; p.vy = 0; } });
    atualizarNoite();
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
  window.andarilhoResgatar = () => resgatar(true);
})();
