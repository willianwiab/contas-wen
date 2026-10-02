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
  const EVENTOS = ['terremoto', 'balao', 'ventania', 'trovao', 'pum', 'chamar', 'fliperama', 'central', 'datas', 'aviao', 'aranha', 'piquenique', 'abraco', 'trem', 'confete'];
  const LUGARES = ['nada', 'praia', 'montanha', 'espaco', 'mar', 'floresta', 'cidade'];
  const ITENS = ['pocao', 'doce', 'pedra', 'mega', 'dinamax', 'ovoRaro', 'ovoLenda'];
  const CONTADORES = ['banhos', 'comidas', 'fav', 'dentes', 'vitorias', 'capturas', 'ovos', 'evolucoes', 'jogos', 'pescados', 'megas', 'cantos', 'carinho', 'presentes'];
  const hoje = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
  const CORES = { azul:'#5c7cfa', rosa:'#f783ac', verde:'#51cf66', amarelo:'#fcc419', roxo:'#9775fa', vermelho:'#ff6b6b', laranja:'#ff922b' };
  const MAX_PETS = 10, MAX_OVOS = 3;
  const TAMANHOS = { PP:52, P:72, M:110, G:160, GG:220 };
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
      if(typeof p.desde === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(p.desde)) q.desde = p.desde;
      if(p.bebe) q.bebe = true;
      return q;
    });
    if(!c.pets.length) c.pets = [{ id:25, shiny:false }];
    if(!TAMANHOS[c.tamanho]) c.tamanho = 'M';
    if(!['3d', 'animado'].includes(c.estilo)) c.estilo = '3d';
    c.ligado = c.ligado !== false; c.som = c.som !== false; c.seguir = !!c.seguir;
    const ovos = Array.isArray(c.ovos) ? c.ovos : [];
    c.ovos = ovos.slice(0, MAX_OVOS).map(o => ({ id:Math.max(1, Math.min(1025, Math.floor(+o.id) || 25)), shiny:!!o.shiny, surpresa:!!o.surpresa, ate:+o.ate || 0 }));
    c.evoluir = c.evoluir !== false;
    if(!['cama', 'casa', 'castelo', 'barraca'].includes(c.casa)) c.casa = 'cama';
    if(!CORES[c.cor]) c.cor = 'azul';
    if(!['auto', 'sol', 'chuva', 'tempestade', 'neve', 'vento', 'nada'].includes(c.clima)) c.clima = 'auto';
    c.ima = !!c.ima; c.voz = !!c.voz;
    c.evento = c.evento && EVENTOS.includes(c.evento.t) ? { t:c.evento.t, q:+c.evento.q || 0 } : null;
    const a = c.aniver;
    c.aniver = a && +a.d >= 1 && +a.d <= 31 && +a.m >= 1 && +a.m <= 12 ? { d:Math.floor(+a.d), m:Math.floor(+a.m) } : null;
    c.festa = +c.festa || 0;
    /* 🪙 moedas, mochila, insígnias, Pokédex, conquistas, desafios… */
    const inteiro = (v, max) => Math.max(0, Math.min(max || 999999, Math.floor(+v) || 0));
    c.moedas = inteiro(c.moedas); c.estrelas = inteiro(c.estrelas);
    const m = c.mochila && typeof c.mochila === 'object' ? c.mochila : {}; c.mochila = {}; ITENS.forEach(k => { c.mochila[k] = inteiro(m[k], 99); });
    c.insignias = [...new Set((Array.isArray(c.insignias) ? c.insignias : []).map(Number).filter(n => n >= 0 && n < 8))];
    c.dex = [...new Set((Array.isArray(c.dex) ? c.dex : []).map(Number).filter(n => n >= 1 && n <= 1025))];
    c.pets.forEach(p => { if(!c.dex.includes(p.id)) c.dex.push(p.id); });
    const ct = c.cont && typeof c.cont === 'object' ? c.cont : {}; c.cont = {}; CONTADORES.forEach(k => { c.cont[k] = inteiro(ct[k]); });
    c.conquistas = (Array.isArray(c.conquistas) ? c.conquistas : []).filter(k => typeof k === 'string').slice(0, 60);
    const ms = c.missoes && typeof c.missoes === 'object' ? c.missoes : {};
    c.missoes = { dia:typeof ms.dia === 'string' ? ms.dia : '', prog:{}, pagas:Array.isArray(ms.pagas) ? ms.pagas.filter(k => typeof k === 'string') : [], todas:!!ms.todas };
    if(ms.prog && typeof ms.prog === 'object') Object.keys(ms.prog).forEach(k => { if(CONTADORES.includes(k)) c.missoes.prog[k] = inteiro(ms.prog[k]); });
    const sq = c.seq && typeof c.seq === 'object' ? c.seq : {}; c.seq = { ultimo:typeof sq.ultimo === 'string' ? sq.ultimo : '', dias:inteiro(sq.dias) };
    c.presenteDia = typeof c.presenteDia === 'string' ? c.presenteDia : '';
    if(!LUGARES.includes(c.lugar)) c.lugar = 'nada';
    c.trem = !!c.trem; c.arvore = !!c.arvore; c.jardim = !!c.jardim; c.especiais = c.especiais !== false; c.amizade = c.amizade !== false;
    c.notas = typeof c.notas === 'string' ? c.notas.slice(0, 500) : '';
    c.escuro = !!c.escuro;
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
    .moeda{font:900 15px system-ui,sans-serif;color:#e67700;text-shadow:0 1px 0 #fff}
    .menu .titulo .nv{background:#ffe066;border-radius:8px;padding:0 5px;color:#1b1b1b}
    .aviso{position:absolute;left:50%;bottom:0;transform:translateX(-50%);margin-bottom:70px;font:800 15px system-ui,sans-serif;background:#1b1b1b;color:#fff;border-radius:14px;padding:8px 14px;
      box-shadow:0 4px 12px rgba(0,0,0,.3);z-index:9;pointer-events:none;animation:sobeAviso 3.2s ease forwards;white-space:nowrap;max-width:92vw;overflow:hidden;text-overflow:ellipsis}
    @keyframes sobeAviso{0%{opacity:0;translate:0 20px}10%,85%{opacity:1;translate:0 0}100%{opacity:0;translate:0 -10px}}
    .saldo{margin:0 0 6px;font-weight:800}
    .abas{display:flex;flex-wrap:wrap;gap:4px;justify-content:center;margin-bottom:8px}
    .abas button{border:2px solid #1b1b1b;border-radius:10px;background:#fff;padding:3px 8px;font-weight:800}
    .abas button.on{background:#3b5bdb;color:#fff}
    .lista-c{display:grid;gap:6px;text-align:left}
    .item{display:flex;align-items:center;gap:8px;border:2px solid #dee2e6;border-radius:12px;padding:5px 8px;background:#f8f9fa}
    .item.feito{background:#ebfbee;border-color:#8ce99a}
    .item .ic{font-size:26px;width:40px;text-align:center;flex:none}
    .item .ic img{width:40px;height:40px;object-fit:contain}
    .item > span:nth-child(2){flex:1;min-width:0}
    .item small{display:block;color:#5b6477;font-weight:600;font-size:12px}
    .item button{border:2px solid #1b1b1b;border-radius:10px;background:#ffd43b;padding:3px 8px;font-weight:800;flex:none}
    .item button:disabled{opacity:.4;cursor:not-allowed}
    .medalhas{display:flex;flex-wrap:wrap;gap:5px;justify-content:center}
    .medalhas span{border:2px solid #dee2e6;border-radius:10px;padding:3px 7px;font-size:12px;color:#868e96}
    .medalhas span.tem{border-color:#fcc419;background:#fff9db;color:#1b1b1b}
    .pet.mega .corpo img{filter:drop-shadow(0 0 10px #cc5de8) drop-shadow(0 0 4px #fff)}
    .pet.gmax .corpo{scale:2.2;filter:drop-shadow(0 0 16px #fa5252) hue-rotate(-10deg)}
    .pet.gmax:before{content:'☁️☁️☁️';position:absolute;left:50%;top:-110%;translate:-50% 0;font-size:calc(var(--s) * .4);filter:hue-rotate(320deg) saturate(3);pointer-events:none;animation:pede 1.4s ease-in-out infinite}
    .pet.fantasma .corpo{opacity:.45}
    /* casas: castelo e barraca */
    .casa.tipo-castelo .parede{background:#adb5bd;height:62%;left:12%;right:12%}
    .casa.tipo-castelo .torre{position:absolute;bottom:0;width:22%;height:85%;background:#868e96;border:3px solid #2b2b2b;
      clip-path:polygon(0 12%,20% 12%,20% 0,40% 0,40% 12%,60% 12%,60% 0,80% 0,80% 12%,100% 12%,100% 100%,0 100%)}
    .casa.tipo-castelo .t1{left:0} .casa.tipo-castelo .t2{right:0}
    .casa.tipo-castelo .porta{background:#5c3d1e;border-radius:50% 50% 0 0}
    .casa.tipo-castelo .fumaca{right:44%;bottom:96%;opacity:1;animation:none;font-size:22px}
    .casa.tipo-barraca .lona{position:absolute;left:0;right:0;bottom:0;height:80%;background:var(--cor);border:3px solid #2b2b2b;clip-path:polygon(50% 0,100% 100%,0 100%)}
    .casa.tipo-barraca .porta{height:50%;width:22%;background:#2b2b2b;border-radius:50% 50% 0 0;border:0}
    .casa.tipo-barraca .fumaca{right:-28%;bottom:0;opacity:1;animation:none;font-size:30px}
    /* dentro da casinha */
    .comodo{position:relative;height:230px;border:3px solid #1b1b1b;border-radius:12px;overflow:hidden;margin-bottom:8px;
      background:linear-gradient(color-mix(in srgb,var(--cor) 35%,#fff) 0 66%,#c08552 66%)}
    .comodo.castelo{background:linear-gradient(#ced4da 0 66%,#a61e4d 66%)} .comodo.barraca{background:linear-gradient(#ffe8cc 0 66%,#8ce99a 66%)}
    .comodo .m{position:absolute;font-size:40px;line-height:1}
    .comodo .m1{left:4%;bottom:30%} .comodo .m2{left:40%;top:10%;font-size:44px} .comodo .m3{right:22%;bottom:31%;font-size:30px} .comodo .m4{right:4%;bottom:33%}
    .comodo .cam{right:4%;bottom:6%;font-size:50px} .comodo .gel{left:4%;bottom:6%;font-size:34px} .comodo .jan{left:70%;top:8%;font-size:34px}
    .morador{position:absolute;width:70px;text-align:center}
    .morador img{width:66px;height:66px;object-fit:contain;filter:drop-shadow(0 2px 2px rgba(0,0,0,.3))}
    .morador .zz{position:absolute;right:0;top:-6px;font-size:18px}
    .morador small{display:block;font-size:11px;background:#fff;border-radius:6px;border:1px solid #1b1b1b;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .comodo .vazio{position:absolute;inset:40% 0 auto;text-align:center;font-weight:800;color:#495057}
    /* lugares */
    .cenario{position:absolute;left:0;right:0;height:170px;pointer-events:none;z-index:0;overflow:hidden}
    .cenario b{position:absolute;bottom:0;font-size:46px;line-height:1}
    .cenario b.grande{font-size:110px} .cenario b.alto{bottom:auto;top:-400px}
    .cenario.praia .areia{position:absolute;left:0;right:0;bottom:0;height:36px;background:#ffe8a3}
    .cenario.praia .mar-faixa{position:absolute;left:0;right:0;bottom:36px;height:30px;background:repeating-linear-gradient(90deg,#74c0fc 0 30px,#4dabf7 30px 60px);animation:ondas 3s linear infinite}
    @keyframes ondas{to{background-position:60px 0}}
    .cenario.montanha .pico{position:absolute;bottom:0;background:linear-gradient(#fff 0 22%,#868e96 22%);clip-path:polygon(50% 0,100% 100%,0 100%)}
    .cenario.montanha .p1{left:-4%;width:40%;height:150px} .cenario.montanha .p2{left:28%;width:46%;height:170px} .cenario.montanha .p3{left:66%;width:40%;height:130px}
    .cenario.espaco{height:100vh;bottom:0 !important;background:radial-gradient(circle at 20% 30%,rgba(255,255,255,.7) 1px,transparent 2px) 0 0/90px 90px,linear-gradient(transparent 0,rgba(33,37,41,.25) 100%)}
    .cenario.espaco b.alto{top:40px;font-size:64px}
    .cenario.mar .agua{position:absolute;inset:0;background:linear-gradient(rgba(77,171,247,0),rgba(28,126,214,.45))}
    .cenario.mar .nada1,.cenario.mar .nada2,.cenario.mar .nada3{bottom:auto;font-size:34px;animation:nadando 14s linear infinite}
    .cenario.mar .nada1{top:30px} .cenario.mar .nada2{top:80px;animation-duration:19s;animation-direction:reverse} .cenario.mar .nada3{top:55px;animation-duration:24s}
    @keyframes nadando{from{left:-10%}to{left:110%}}
    .cenario.cidade .predio{position:absolute;bottom:0;width:9%;background:#495057;border:2px solid #343a40;
      background-image:linear-gradient(90deg,transparent 30%,#ffe066 30% 45%,transparent 45% 60%,#ffe066 60% 75%,transparent 75%),linear-gradient(transparent 50%,#495057 50%);background-size:100% 22px,100% 22px}
    .arvore{position:absolute;left:0;top:0;font-size:200px;line-height:1;pointer-events:none;z-index:0}
    .flor{position:absolute;left:0;top:0;font-size:30px;pointer-events:none;z-index:0;line-height:1}
    .trem{position:absolute;left:0;top:0;font-size:54px;pointer-events:none;z-index:2;white-space:nowrap;line-height:1}
    .trem span{display:inline-block;width:64px;transform:scaleX(-1)}
    .aviaozinho{position:absolute;left:0;top:0;font-size:60px;pointer-events:none;z-index:3;transform:scaleX(-1)}
    .prop.paraq{top:-70%;font-size:calc(var(--s) * .6)}
    .prop.ursinho{left:auto;right:-12%;translate:0 0;bottom:0;font-size:calc(var(--s) * .32)}
    .prop.vassoura{left:auto;right:-20%;translate:0 0;top:30%;font-size:calc(var(--s) * .45);animation:varre .5s ease-in-out infinite alternate}
    @keyframes varre{to{rotate:-25deg}}
    .prop.sorvete,.prop.celular,.prop.violino,.prop.vara-bolha{top:45%;font-size:calc(var(--s) * .34)}
    .prop.carrinho{bottom:-18%;font-size:calc(var(--s) * .85)}
    .prop.foguetinho{bottom:-30%;font-size:calc(var(--s) * .7);rotate:-45deg}
    .prop.fogo{left:auto;right:-35%;translate:0 0;bottom:0;font-size:calc(var(--s) * .45)}
    .prop.regador{left:auto;right:-25%;translate:0 0;top:25%;font-size:calc(var(--s) * .38)}
    .ponte-arco{position:absolute;left:0;top:0;pointer-events:none;z-index:0;opacity:.55;border-radius:50% 50% 0 0/100% 100% 0 0;
      background:radial-gradient(circle at 50% 100%,transparent 72%,#ff6b6b 72% 76%,#ffd43b 76% 80%,#51cf66 80% 84%,#4dabf7 84% 88%,#9775fa 88% 92%,transparent 92%)}
    .rabisco{position:absolute;font-size:30px;pointer-events:none;z-index:1;animation:apaga 8s ease-in forwards;font-weight:900}
    @keyframes apaga{0%,70%{opacity:1}100%{opacity:0}}
    .aranha{position:absolute;top:0;pointer-events:auto;cursor:pointer;z-index:6;width:40px;display:flex;flex-direction:column;align-items:center}
    .aranha .fio{display:block;width:2px;background:#adb5bd;height:0}
    .aranha span{font-size:36px;line-height:1}
    .corda{position:absolute;left:0;top:0;height:5px;background:#a0522d;border-radius:3px;pointer-events:none;z-index:2}
    .toalha{position:absolute;width:280px;height:26px;background:repeating-conic-gradient(#ff6b6b 0 25%,#fff 0 50%) 0 0/26px 26px;border:2px solid #c92a2a;border-radius:6px;pointer-events:none;z-index:0;display:flex;justify-content:space-around;align-items:center;font-size:24px}
    .poca{position:absolute;font-size:18px;pointer-events:none;z-index:0;animation:apaga 6s ease-in forwards}
    .zap{position:absolute;font-size:34px;pointer-events:none;z-index:9;animation:raio .5s ease-out forwards}
    .banana{position:absolute;font-size:26px;pointer-events:none;z-index:1}
    .decoracao{position:absolute;inset:0;pointer-events:none;z-index:0}
    .decoracao b{position:absolute;font-size:40px;line-height:1}
    .decoracao .faixa-data{position:absolute;right:16px;top:12px;font:900 16px system-ui,sans-serif;background:#fff;border:3px solid #1b1b1b;border-radius:12px;padding:3px 10px;box-shadow:3px 3px 0 #1b1b1b}
    .decoracao.halloween .faixa-data{background:#ff922b} .decoracao.natal .faixa-data{background:#ff8787} .decoracao.junina .faixa-data{background:#ffd43b}
    .bandeirinhas{position:absolute;left:0;right:0;top:0;font-size:28px;letter-spacing:6px;text-align:center;white-space:nowrap;overflow:hidden}
    .ovinho-pascoa{position:absolute;font-size:28px;pointer-events:auto;cursor:pointer;z-index:5;filter:hue-rotate(200deg) saturate(2)}
    .ops.letras{grid-template-columns:repeat(4,1fr)} .ops.letras button{font-size:22px}
    .quebra{display:grid;grid-template-columns:repeat(3,80px);gap:3px;justify-content:center}
    .quebra i{display:block;width:80px;height:80px;background-size:300% 300%;background-color:#f1f3f5;border:2px solid #1b1b1b;border-radius:6px;cursor:pointer}
    .quebra i.vazio{background:#e9ecef;border-style:dashed}
    .torre-area{position:relative;width:240px;height:230px;margin:0 auto;border-bottom:4px solid #1b1b1b;background:#f8f9fa;overflow:hidden}
    .torre-area i{position:absolute;height:16px;border:2px solid #1b1b1b;border-radius:3px;box-sizing:border-box}
    .torre-area i.movel{background:#ced4da}
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
    const linhas = (cfg.notas || '').split('\n').map(l => l.trim()).filter(Boolean);
    if(linhas.length && r < .12) return `📝 Você escreveu: "${sorte(linhas).slice(0, 60)}"`;
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
    const s = Math.round(TAMANHOS[cfg.tamanho] * (p.bebe ? .7 : 1));
    const el = document.createElement('div'); el.className = 'pet';
    el.style.width = s + 'px'; el.style.height = s + 'px'; el.style.setProperty('--s', s + 'px');
    el.innerHTML = `<div class="sombra"></div><div class="corpo"><img alt="" draggable="false" /></div><div class="balao"></div>
      <div class="menu"><div class="titulo"></div><div class="bts"><button data-c="comidas" title="Dar comida">🍎</button><button data-c="dormir" title="Pôr pra dormir">😴</button><button data-c="banho" title="Dar banho">🛁</button><button data-c="dentes" title="Escovar os dentes">🪥</button>
        <button data-c="cantar" title="Cantar todo mundo junto">🎤</button><button data-c="jogos" title="Fliperama (minijogos)">🎮</button><button data-c="batalha" title="Batalhar">⚔️</button><button data-c="roupas" title="Roupinhas">🎩</button><button data-c="central" title="Loja, mochila, ginásio e conquistas">🎒</button>${noPC ? '<button data-c="config" title="Escolher Pokémon">⚙️</button>' : ''}</div>
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
      let k = sobra.findIndex((v, j) => v && v.id === p.id && v.shiny === p.shiny && !!v.bebe === !!p.bebe && j === i);
      if(k < 0) k = sobra.findIndex(v => v && v.id === p.id && v.shiny === p.shiny && !!v.bebe === !!p.bebe);
      if(k >= 0){
        const v = sobra[k]; sobra[k] = null;
        const chave = i + ':' + p.id; if(v.chave !== chave){ v.chave = chave; }
        v.apelido = p.apelido; v.roupa = p.roupa; v.desde = p.desde; vestirRoupa(v);
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
    if(sim && !pet.zzz){ pet.zzz = document.createElement('span'); pet.zzz.className = 'zzz'; pet.zzz.textContent = 'z'; pet.el.appendChild(pet.zzz);
      pet.ursinho = document.createElement('span'); pet.ursinho.className = 'prop ursinho'; pet.ursinho.textContent = '🧸'; pet.el.appendChild(pet.ursinho); }
    if(!sim && pet.zzz){ pet.zzz.remove(); pet.zzz = null; if(pet.ursinho){ pet.ursinho.remove(); pet.ursinho = null; } }
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
    if(Math.random() < .01) soltarBanana(pet);
    if(pet.id === 54 && Math.random() < .25){ pet.estado = 'tonto'; pet.ate = agora + 3000; falar(pet, sorte(['Psy…? 🤯', 'Minha cabeça… 😵‍💫', 'Psyyy! 🦆💫']), 2000); return; }
    if(cfg.arvore && cena.arvore && extra > .9 && !voa(pet.id)){ pet.estado = 'irArvore'; pet.ate = agora + 20000; falar(pet, 'Vou subir na árvore! 🌳', 1600); return; }
    if(cena.flores.length && extra > .86 && extra <= .9 && cuidarJardim(pet, agora)) return;
    if(pet.bebe && extra > .7 && extra <= .86){ const mae = pets.find(q => q !== pet && !q.bebe && !q.dentro); if(mae){ pet.estado = 'seguirAmigo'; pet.amigo = mae; pet.ate = agora + 8000; falar(pet, sorte(['Me espera! 👶', 'Vou junto! 🍼']), 1800); return; } }
    if(Math.random() < .12){ maisAtividade(pet, agora); return; }
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
    else if(r < .78){ pet.estado = 'espreguicar'; pet.ate = agora + 1800; falar(pet, sorte(['Hmmmm… 🙆', 'Que preguiça… 🥱'])); bocejar(pet); }
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
  const naCasa = () => cfg.casa !== 'cama';
  const CASAS = { casa:['🏠', 'casinha', 'da'], castelo:['🏰', 'castelo', 'do'], barraca:['⛺', 'barraca', 'da'] };
  function montarCama(){
    const S = TAMANHOS[cfg.tamanho], modo = cfg.casa + ':' + cfg.tamanho;
    if(cama.modo !== modo){
      if(cama.el){ cama.el.remove(); cama.cob.remove(); }
      cama.modo = modo;
      cama.cob = document.createElement('div'); cama.cob.className = 'cobertor';
      if(naCasa()){
        cama.w = Math.round(S * 1.7); cama.h = Math.round(S * 1.6);
        cama.el = document.createElement('div'); cama.el.className = 'casa clicavel tipo-' + cfg.casa; cama.el.title = 'Clique pra ver lá dentro!';
        const [ic, nome] = CASAS[cfg.casa] || CASAS.casa;
        cama.el.innerHTML = cfg.casa === 'castelo'
          ? `<div class="torre t1"></div><div class="torre t2"></div><div class="parede"><div class="janela"></div><div class="janela janela2"></div><div class="porta"></div></div><span class="fumaca">🚩</span><div class="placa">${ic} ${nome}</div>`
          : cfg.casa === 'barraca'
          ? `<div class="lona"></div><div class="porta"></div><div class="janela" style="display:none"></div><div class="janela janela2" style="display:none"></div><span class="fumaca">🔥</span><div class="placa">${ic} ${nome}</div>`
          : `<div class="chamine"></div><span class="fumaca">💨</span><div class="telhado"></div><div class="parede"><div class="janela"></div><div class="janela janela2"></div><div class="porta"></div></div><div class="placa">${ic} ${nome}</div>`;
        cama.cob.classList.add('some');
        cama.el.addEventListener('pointerdown', ev => { ev.preventDefault(); ev.stopPropagation(); });
        cama.el.addEventListener('click', ev => { ev.stopPropagation(); abrirDentro(); });
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
    const [ic, nome] = CASAS[cfg.casa] || CASAS.casa;
    cama.el.querySelector('.placa').textContent = dentro.length ? `${ic} ${dentro.length} em casa` : `${ic} ${nome}`;
    if(casaAberta) desenharDentro();
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
    abrirMenu(pet); ultimoCarinho = Date.now(); contar('carinho');
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
        pet.vy += gravidade() * dt; pet.x += pet.vx * dt; pet.y += pet.vy * dt;
        if(pet.x < 0){ pet.x = 0; pet.vx = -pet.vx * .5; } if(pet.x > maxX){ pet.x = maxX; pet.vx = -pet.vx * .5; }
        if(pet.y >= c){
          pet.y = c;
          if(pet.vy > 600 && tipoDe(pet.id) === 12 && cfg.especiais){ terremotoPequeno(); falar(pet, 'TUM! 🪨', 1000); }
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
      } else if(['irArvore', 'irFlor', 'irAmigo', 'seguirAmigo', 'irAbraco'].includes(pet.estado)){
        pet.y = c;
        let alvo = pet.estado === 'irArvore' ? (cena.arvoreX || 0) + 60 : pet.estado === 'irFlor' || pet.estado === 'irAbraco' ? pet.alvoX : pet.amigo && pets.includes(pet.amigo) ? pet.amigo.x + (pet.estado === 'seguirAmigo' ? -pet.amigo.dir * pet.amigo.s * .7 : (pet.x < pet.amigo.x ? -1 : 1) * pet.amigo.s * .75) : pet.x;
        alvo = Math.max(0, Math.min(maxX, alvo));
        const dx = alvo - pet.x;
        if(Math.abs(dx) > 5){ pet.dir = dx > 0 ? 1 : -1; pet.x += pet.dir * Math.min(Math.abs(dx), (pet.estado === 'seguirAmigo' ? 120 : 100) * dt); pet.movendo = true; }
        else {
          pet.movendo = false;
          if(pet.estado === 'irArvore'){ pet.estado = 'subirArvore'; pet.ate = agora + 15000; }
          else if(pet.estado === 'irFlor'){ const f = pet.florAlvo; if(f && f.fruta){ f.fruta = false; f.cresce = 60; desenharFlor(f); pet.nec.fome = Math.min(100, pet.nec.fome + 15); efeito(pet, '🍓', 2); falar(pet, 'Fruta do jardim! 🍓😋', 1800); pet.estado = 'parado'; pet.ate = agora + 1500; } else { pet.estado = 'regar'; pet.temProps = true; pet.props = []; const e = document.createElement('span'); e.className = 'prop regador'; e.textContent = '🚿'; pet.el.appendChild(e); pet.props.push(e); pet.ate = agora + 3000; if(f){ f.cresce += 30; desenharFlor(f); } efeito(pet, '💧', 3); falar(pet, 'Regando as flores! 🌻', 1600); } }
          else if(pet.estado === 'irAmigo') chegouNoAmigo(pet);
          else if(pet.estado === 'irAbraco'){ pet.estado = 'abraco'; }
        }
        if(agora >= pet.ate){ pet.estado = 'parado'; pet.ate = agora + 800; }
      } else if(pet.estado === 'subirArvore'){
        const galho = innerHeight - extraChao - 170 - pet.s * .55;
        pet.y = Math.max(galho, pet.y - 80 * dt);
        if(pet.y <= galho){ pet.estado = 'naArvore'; pet.ate = agora + 6000 + Math.random() * 5000; falar(pet, sorte(['Que vista linda! 🌳', 'Tô lá em cima! 😎', 'Achei uma fruta! 🍎']), 2000); }
      } else if(pet.estado === 'naArvore'){
        if(agora >= pet.ate){ pet.estado = 'cair'; pet.vx = -150; pet.vy = -250; falar(pet, 'Wiii! 🍃', 1000); }
      } else if(pet.estado === 'esperaTrem' || pet.estado === 'noTrem' || pet.estado === 'noEspaco'){
        if(pet.estado === 'esperaTrem') pet.y = c;
        if(pet.estado === 'noEspaco' && agora >= pet.ate){ pet.x = Math.random() * maxX; pet.y = -pet.s; paraquedas(pet); falar(pet, 'Voltei do espaço! 🚀🌕', 2000); }
      } else if(pet.estado === 'noAviao'){
        const a = pet.aviao; a.x -= 260 * dt; a.el.style.transform = `translate(${a.x}px, 50px)`;
        pet.x = a.x + 10; pet.y = 50 + 30; pet.dir = -1;
        if(a.x < innerWidth * (.25 + Math.random() * .002)){ const el = a.el; el.style.transition = 'transform 3s linear'; el.style.transform = `translate(-200px, 40px)`; setTimeout(() => el.remove(), 3100); pet.aviao = null; paraquedas(pet); falar(pet, 'Vou pular! 🪂😆', 1600); }
      } else if(pet.estado === 'paraquedas'){
        pet.y += 75 * dt; pet.x = Math.max(0, Math.min(maxX, pet.x + Math.sin(agora / 600) * 40 * dt));
        if(pet.y >= c){ pet.y = c; tirarProps(pet); pet.estado = 'parado'; pet.ate = agora + 1200; falar(pet, 'Pousei! 🪂😎', 1400); }
      } else if(pet.estado === 'foguete'){
        pet.y -= 420 * dt; if(Math.random() < .3) efeito(pet, '🔥', 1);
        if(pet.y < -pet.s * 1.6){ tirarProps(pet); pet.estado = 'noEspaco'; pet.ate = agora + 2500; }
      } else if(pet.estado === 'arcoiris'){
        const a = pet.arco; a.t += dt / 3.2;
        pet.x = Math.max(0, Math.min(maxX, a.x0 + a.dir * 420 * a.t)); pet.y = c - Math.sin(Math.PI * Math.min(1, a.t)) * 185; pet.dir = a.dir;
        if(a.t >= 1){ pet.y = c; tirarProps(pet); pet.estado = 'parado'; pet.ate = agora + 1200; falar(pet, 'Que passeio colorido! 🌈', 1600); }
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
        const v = pet.estado === 'correr' ? 190 : pet.estado === 'andar' ? 70 : pet.estado === 'skate' ? 280 : pet.estado === 'carro' ? 340 : 0;
        /* Com vento: a favor anda rápido, contra anda devagarzinho. */
        pet.x += pet.dir * v * (v && ventando() ? (pet.dir === rajada.dir ? 1.6 : .55) : 1) * dt;
        /* Chegou na beirada da tela: às vezes sobe pela parede! (quem voa não precisa) */
        const podeSubir = v > 0 && !voa(pet.id) && pet.estado !== 'skate' && Math.random() < .45;
        if(tipoDe(pet.id) === 13 && cfg.especiais && v > 0 && (pet.x <= 0 || pet.x >= maxX)){ pet.x = pet.x <= 0 ? maxX - 1 : 1; if(Math.random() < .3) falar(pet, 'Buuu! Atravessei! 👻', 1400); }
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
      const andando = ['andar', 'correr', 'subir', 'teto', 'irCama', 'bola', 'borboleta', 'skate', 'carro', 'subirArvore', 'varrer'].includes(pet.estado) || pet.movendo && ['irArvore', 'irFlor', 'irAmigo', 'seguirAmigo', 'irAbraco'].includes(pet.estado) || (pet.estado === 'fugir' && pet.correndo);
      pet.passo += dt * (pet.estado === 'correr' ? 16 : 9);
      const festeja = pet.estado === 'dancar' || pet.estado === 'cantar' || pet.estado === 'tiktok' || pet.estado === 'abraco';
      const pulo = festeja ? -Math.abs(Math.sin(agora / 160)) * pet.s * .12 : pet.estado === 'sentar' ? pet.s * .05 : pet.estado === 'golpe' ? -Math.abs(Math.sin(agora / 90)) * pet.s * .05 : andando ? -Math.abs(Math.sin(pet.passo)) * pet.s * .07 : 0;
      /* Na parede fica deitado de lado (pés na parede); no teto fica de cabeça pra baixo; voando inclina. */
      const base = pet.estado === 'subir' ? (pet.lado < 0 ? 90 : -90) * (pet.dir > 0 ? -1 : 1) : pet.estado === 'teto' ? 180 : pet.estado === 'desmaiado' ? 90
        : pet.estado === 'escondido' ? (pet.esconde === 'cima' ? 180 : pet.esconde === 'esquerda' ? 18 : pet.esconde === 'direita' ? -18 : 0) + Math.sin(agora / 400) * 4 : 0;
      const especial = pet.estado === 'cambalhota' ? ((agora % 800) / 800) * 360 * (pet.dir > 0 ? 1 : -1) : pet.estado === 'escorregar' ? (agora % 400) / 400 * 360 : pet.estado === 'tonto' ? Math.sin(agora / 140) * 25
        : pet.estado === 'tiktok' ? Math.sin(agora / 90) * 22 : pet.estado === 'cabo' ? -pet.dir * (12 + Math.sin(agora / 200) * 6) : pet.estado === 'paraquedas' ? Math.sin(agora / 500) * 10 : 0;
      if(pet.estado === 'escorregar' && agora >= pet.ate){ pet.estado = 'sentar'; pet.ate = agora + 1800; falar(pet, '😵‍💫', 1200); }
      if(pet.estado === 'cabo' && pet.cabo){ const o = pets.find(q => q !== pet && q.cabo === pet.cabo); if(o && pet.x < o.x){ const x1 = pet.x + pet.s * .8, x2 = o.x + o.s * .2; pet.cabo.style.width = Math.max(0, x2 - x1) + 'px'; pet.cabo.style.transform = `translate(${x1 + Math.sin(agora / 200) * 8}px, ${pet.y + pet.s * .55}px)`; } }
      poderes(pet, agora, dt); if(bananas.length) conferirBananas(pet, agora);
      if(pet.aviao && pet.estado !== 'noAviao'){ pet.aviao.el.remove(); pet.aviao = null; }
      const vento = ventando() && ['andar', 'correr', 'parado', 'sentar', 'skate', 'ler'].includes(pet.estado) ? rajada.dir * 9 + Math.sin(agora / 120) * 3 : 0;
      const giro = base + vento + especial + (pet.estado === 'balao' ? Math.sin(agora / 500) * 8 : pet.estado === 'ima' ? Math.sin(agora / 150) * 12 : 0) + (festeja ? Math.sin(agora / (pet.estado === 'cantar' ? 200 : 130)) * 18 : pet.estado === 'golpe' ? Math.sin(agora / 40) * 4 : andando ? Math.sin(pet.passo) * 5 : pet.estado === 'voar' ? Math.sin(agora / 300) * 8 : 0);
      const respira = pet.estado === 'sentar' ? .86 : pet.estado === 'espreguicar' ? 1.12 : pet.estado === 'parado' || pet.estado === 'dormir' ? 1 + Math.sin(agora / (pet.estado === 'dormir' ? 700 : 400)) * .025 : 1;
      const olha = pet.estado === 'cair' || pet.estado === 'arrastado' ? (pet.vx > 0 ? 1 : pet.vx < 0 ? -1 : pet.dir) : pet.dir;
      const treme = pet.frio && ['parado', 'sentar', 'andar'].includes(pet.estado) ? Math.sin(agora / 25) * 1.5 : 0;
      pet.el.style.transform = `translate(${pet.x + treme}px, ${pet.y}px)`;
      /* As fotos olham pra esquerda; andando pra direita, vira o espelho. */
      pet.corpo.style.transform = `translateY(${pulo}px) scaleX(${olha > 0 ? -1 : 1}) rotate(${giro}deg) scaleY(${respira})`;
      pet.el.classList.toggle('no-ar', pet.y < c - 2);
      pet.el.classList.toggle('sem-sombra', ['subir', 'teto', 'voar', 'escondido', 'balao', 'ima', 'piscina', 'banho'].includes(pet.estado));
    }
    desenharCeu(dt); soprar(agora, dt); moverTrem(agora, dt); moverBorboleta(dt, agora); desenharSelvagem(agora, dt); moverJogo(agora, dt);
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
    pet.menu.querySelector('.titulo').innerHTML = (pet.apelido ? `${esc(pet.apelido)} <small>(${esc(nomeDe(pet.id))})</small>` : esc(nomeDe(pet.id))) + ` <small class="nv">Nv. ${nivelDe(pet)}</small>`;
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
    if(c === 'central'){ pet.menu.classList.remove('on'); abrirCentral(); return; }
    if(c === 'comidas' || c === 'roupas'){ abrirLinha(pet, c); return; }
    if(c === 'batalha'){ pet.menu.classList.remove('on'); iniciarBatalha(pet); return; }
    if(c === 'cantar'){ pet.menu.classList.remove('on'); cantarTodos(); return; }
    if(c === 'dormir'){
      irDormir(pet, performance.now(), 20000, true); pet.menu.classList.remove('on'); ganharXp(pet, 1);
      return salvarNec();
    }
    if(c === 'banho' || c === 'dentes'){ contar(c === 'banho' ? 'banhos' : 'dentes'); ganharMoedas(1, pet); }
    if(c === 'banho'){ pet.nec.limpo = 100; atividade(pet, performance.now(), 'banho'); falar(pet, sorte(['Que cheirinho bom! 🛁', 'Banho gostoso!', 'Tô limpinho! ✨'])); ganharXp(pet, 1); }
    if(c === 'dentes'){ pet.nec.dentes = 100; efeito(pet, '🪥', 1); efeito(pet, '✨', 3); falar(pet, sorte(['Dentes brilhando! ✨', 'Escovadinho! 😁', 'Hálito fresquinho!'])); ganharXp(pet, 1); }
    ficouFeliz(pet, n); desenharNec(pet); salvarNec();
  }
  function ficouFeliz(pet, n){ if(NECS.every(k => pet.nec[k] >= 80)) setTimeout(() => { efeito(pet, '💖', 4); falar(pet, `O ${n || nomeDo(pet)} está muito feliz! 💖`); }, 900); }
  function comer(pet, comida){
    const fav = favDe(pet.id), eca = ecaDe(pet.id);
    if(comida === eca){ efeito(pet, '🤢', 2); falar(pet, sorte([`Eca! Não gosto de ${comida}! 🤢`, `${comida}?! Bléééé! 😝`, 'Isso não! 🙅'])); return; }
    if(pet.nec.fome > 95){ falar(pet, 'Tô cheio! 😵'); return; }
    efeito(pet, comida, 3); contar('comidas'); ganharMoedas(1, pet);
    if(pet.id === 143 || comida === fav){ contar('fav');
      pet.nec.fome = Math.min(100, pet.nec.fome + 60); efeito(pet, '😍', 3); ganharXp(pet, 2);
      falar(pet, pet.id === 143 ? 'Eu amo TODAS as comidas! 😋' : sorte([`${comida} é minha comida favorita!!! 😍`, `EBA, ${comida}!!! 💖`, 'Minha preferida! 😍']), 2600);
    } else { pet.nec.fome = Math.min(100, pet.nec.fome + 35); ganharXp(pet, 1); falar(pet, sorte(['Nham nham! 😋', 'Que delícia!', 'Hmm, gostoso!'])); }
    pet.nec.dentes = Math.max(0, pet.nec.dentes - (['🍰', '🍦', '🍩', '🍓'].includes(comida) ? 18 : 10));
    ficouFeliz(pet); desenharNec(pet); salvarNec();
  }
  /* 🌟 Experiência: cada cuidado dá pontinhos. Com 10 pontos ele pode evoluir (se a evolução estiver ligada). */
  const XP_EVO = 10;
  const evosDe = id => (typeof ANDARILHO_EVO !== 'undefined' && ANDARILHO_EVO[id]) || [];
  const nivelDe = pet => Math.min(100, 1 + Math.floor(Math.sqrt((+pet.nec.exp || 0) / 2)));
  function ganharXp(pet, n){
    const antes = nivelDe(pet);
    pet.nec.exp = (+pet.nec.exp || 0) + n;
    const depois = nivelDe(pet);
    if(depois > antes){ setTimeout(() => { efeito(pet, '⬆️', 2); efeito(pet, '⭐', 3); falar(pet, `Subi pro nível ${depois}! 💪`, 2200); }, 700); }
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
      pet.el.classList.remove('evoluindo'); pet.evoluindo = false; registrarDex(pet.id); contar('evolucoes'); ganharMoedas(10, pet);
      if(pet.bebe){ pet.bebe = false; const k = pets.indexOf(pet); if(k >= 0 && cfg.pets[k]){ delete cfg.pets[k].bebe; salvarCfg(); setTimeout(() => montar(false), 3000); } }
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
  /* O progresso (moedas, mochila, Pokédex…) é guardado separado da configuração: assim a janela de escolher
     nunca apaga as moedas quando você muda alguma opção. */
  const PROG = ['moedas', 'estrelas', 'mochila', 'insignias', 'dex', 'cont', 'conquistas', 'missoes', 'seq', 'presenteDia'];
  const separar = c => { const a = {}, b = {}; Object.keys(c).forEach(k => { (PROG.includes(k) ? b : a)[k] = c[k]; }); return [a, b]; };
  function salvarCfg(){
    const [a, b] = separar(JSON.parse(JSON.stringify(cfg)));
    if(naExtensao) chrome.storage.local.set({ andarilho:a, andarilhoProg:b });
    else {
      try{ localStorage.setItem('andarilho:cfg', JSON.stringify(a)); localStorage.setItem('andarilho:prog', JSON.stringify(b)); }catch(e){}
      dispatchEvent(new CustomEvent('andarilho-cfg-pet', { detail:a })); dispatchEvent(new CustomEvent('andarilho-prog', { detail:b }));
    }
  }
  function receberProg(b){ if(!b || typeof b !== 'object') return; const c = limpa(Object.assign({}, cfg, b)); PROG.forEach(k => { cfg[k] = c[k]; }); }

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
    cfg.pets.push({ id:o.id, shiny:o.shiny, bebe:true, desde:hoje() }); registrarDex(o.id); contar('ovos'); ganharMoedas(5);
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
    tocar(MUSICA, 130); contar('cantos');
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
  const ATIVIDADES = ['banho', 'ler', 'pipa', 'piscina', 'cozinhar', 'skate', 'balao', 'pescar', 'varrer', 'sorvete', 'bolhinhas', 'violino', 'selfie', 'carro', 'foguete', 'arcoiris', 'fogueira', 'paraquedas', 'regar'];
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
    if(t === 'central') abrirCentral();
    if(t === 'datas'){ const ks = Object.keys(DATAS); previa = (previa + 1) % ks.length; mostrarData(ks[previa], true); }
    if(t === 'aviao') aviao();
    if(t === 'aranha') aranha();
    if(t === 'piquenique') piquenique();
    if(t === 'abraco') abracoEmGrupo();
    if(t === 'trem') chamarTrem();
    if(t === 'confete') confete();
    if(t === 'trovao'){ relampago(); setTimeout(relampago, 1600); }
    if(t === 'pum') pum(sorte(pets.filter(p => !p.dentro)));
    if(t === 'ventania'){ rajada.ate = Date.now() + 20000; rajada.dir = Math.random() < .5 ? -1 : 1; rajada.prox = 0; rajada.ativo = false; }
    if(t === 'balao') pets.forEach((p, i) => { if(!p.dentro && !['batalha', 'escondido', 'fugir'].includes(p.estado)) setTimeout(() => atividade(p, performance.now(), 'balao'), i * 300); });
  }

  /* ======================================================================
     🪙 PROGRESSO: moedas, contadores, conquistas, desafio do dia, Pokédex
     ====================================================================== */
  let ultimoCarinho = Date.now(), timerCfg = 0;
  function salvarCfgDepois(){ clearTimeout(timerCfg); timerCfg = setTimeout(salvarCfg, 1200); }
  function ganharMoedas(n, pet){
    if(!n) return;
    cfg.moedas = Math.min(999999, cfg.moedas + n); salvarCfgDepois();
    const q = pet || null;
    if(q && q.el && !q.dentro){ const e = document.createElement('span'); e.className = 'efeito moeda'; e.textContent = `+${n}🪙`; e.style.left = (q.s * .3) + 'px'; e.style.top = '0px'; q.el.appendChild(e); setTimeout(() => e.remove(), 1400); }
  }
  function registrarDex(id){ id = +id; if(id >= 1 && id <= 1025 && !cfg.dex.includes(id)){ cfg.dex.push(id); conferirConquistas(); salvarCfgDepois(); } }
  /* ✅ Desafio do dia: 3 missões que mudam todo dia. */
  const MISSOES = [['banhos', '🛁 Dê 2 banhos', 2], ['comidas', '🍎 Dê 3 comidas', 3], ['jogos', '🕹️ Jogue 2 jogos', 2], ['vitorias', '⚔️ Ganhe 1 batalha', 1],
    ['cantos', '🎤 Cante 1 vez', 1], ['fav', '😍 Dê a comida favorita', 1], ['dentes', '🪥 Escove os dentes 2 vezes', 2], ['carinho', '💖 Faça 5 carinhos (cliques)', 5],
    ['pescados', '🎣 Pesque 2 coisas', 2], ['capturas', '🔴 Capture 1 Pokémon', 1], ['presentes', '🎁 Abra 1 presente', 1]];
  function missoesDeHoje(){
    const d = hoje(); let h = 0; for(const ch of d) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    const lista = MISSOES.slice(), out = [];
    while(out.length < 3){ h = (h * 1103515245 + 12345) >>> 0; out.push(lista.splice(h % lista.length, 1)[0]); }
    if(cfg.missoes.dia !== d){ cfg.missoes = { dia:d, prog:{}, pagas:[], todas:false }; }
    return out;
  }
  function contar(k, n){
    n = n || 1;
    cfg.cont[k] = (cfg.cont[k] || 0) + n;
    const ms = missoesDeHoje();
    const m = ms.find(x => x[0] === k);
    if(m){
      cfg.missoes.prog[k] = (cfg.missoes.prog[k] || 0) + n;
      if(cfg.missoes.prog[k] >= m[2] && !cfg.missoes.pagas.includes(k)){
        cfg.missoes.pagas.push(k); cfg.moedas += 10; cfg.estrelas += 1;
        avisoConquista(`✅ Desafio cumprido: ${m[1]}! +10🪙 +1⭐`);
        if(ms.every(x => cfg.missoes.pagas.includes(x[0])) && !cfg.missoes.todas){
          cfg.missoes.todas = true; cfg.moedas += 20; cfg.estrelas += 2;
          const ontem = new Date(Date.now() - 864e5), o = `${ontem.getFullYear()}-${String(ontem.getMonth() + 1).padStart(2, '0')}-${String(ontem.getDate()).padStart(2, '0')}`;
          cfg.seq = { ultimo:hoje(), dias:cfg.seq.ultimo === o ? cfg.seq.dias + 1 : cfg.seq.ultimo === hoje() ? cfg.seq.dias : 1 };
          cfg.cont.missoesDias = (cfg.cont.missoesDias || 0) + 1;
          setTimeout(() => avisoConquista(`🎉 Todos os desafios de hoje! +20🪙 +2⭐ · 🔥 ${cfg.seq.dias} ${cfg.seq.dias === 1 ? 'dia' : 'dias'} seguidos`), 2600);
        }
      }
    }
    conferirConquistas(); salvarCfgDepois();
  }
  const CONQUISTAS = [['banho1', '🛁 Primeiro banho', () => cfg.cont.banhos >= 1], ['banho10', '🧼 Sempre limpinho (10 banhos)', () => cfg.cont.banhos >= 10],
    ['comida20', '🍽️ Chef (20 comidas)', () => cfg.cont.comidas >= 20], ['vitoria1', '⚔️ Primeira vitória', () => cfg.cont.vitorias >= 1], ['vitoria10', '🏆 Campeão (10 vitórias)', () => cfg.cont.vitorias >= 10],
    ['captura1', '🔴 Primeira captura', () => cfg.cont.capturas >= 1], ['captura5', '🎒 Colecionador (5 capturas)', () => cfg.cont.capturas >= 5], ['ovo1', '🐣 Chocou um ovo', () => cfg.cont.ovos >= 1],
    ['evolucao1', '🌟 Primeira evolução', () => cfg.cont.evolucoes >= 1], ['jogos10', '🕹️ Jogador (10 jogos)', () => cfg.cont.jogos >= 10], ['pesca5', '🎣 Pescador (5)', () => cfg.cont.pescados >= 5],
    ['mega1', '🧬 Mega evolução', () => cfg.cont.megas >= 1], ['insignia1', '🏅 Primeira insígnia', () => cfg.insignias.length >= 1], ['insignia8', '👑 Mestre dos ginásios', () => cfg.insignias.length >= 8],
    ['dex25', '📖 Pokédex 25', () => cfg.dex.length >= 25], ['dex100', '📚 Pokédex 100', () => cfg.dex.length >= 100], ['seq3', '🔥 3 dias seguidos', () => cfg.seq.dias >= 3],
    ['seq7', '🔥🔥 7 dias seguidos', () => cfg.seq.dias >= 7], ['carinho50', '💖 Carinhoso (50 carinhos)', () => cfg.cont.carinho >= 50], ['rico', '💰 Rico (500 moedas)', () => cfg.moedas >= 500],
    ['melhor', '🎖️ Melhor treinador', () => cfg.insignias.length >= 4 && cfg.cont.vitorias >= 20 && cfg.dex.length >= 30]];
  function conferirConquistas(){
    for(const [k, nome, ok] of CONQUISTAS){
      if(!cfg.conquistas.includes(k) && ok()){ cfg.conquistas.push(k); cfg.moedas += 15; avisoConquista(`🏅 Conquista: ${nome}! +15🪙`); salvarCfgDepois(); }
    }
  }
  let filaAvisos = [], avisando = false;
  function avisoConquista(t){
    filaAvisos.push(t); if(avisando) return;
    const prox = () => {
      const msg = filaAvisos.shift(); if(!msg){ avisando = false; return; } avisando = true;
      const a = document.createElement('div'); a.className = 'aviso'; a.textContent = msg; raiz.appendChild(a);
      somRuido(.15, 4000, .08); setTimeout(() => { a.remove(); prox(); }, 3200);
    };
    prox();
  }
  /* 🎁 Presente do dia (uma vez por dia). */
  function presenteDoDia(){
    if(cfg.presenteDia === hoje() || !cfg.ligado || !pets.length || document.hidden) return;
    const p = sorte(pets.filter(q => !q.dentro)); if(!p) return;
    cfg.presenteDia = hoje(); salvarCfg();
    const g = document.createElement('span'); g.className = 'presente clicavel'; g.textContent = '🎁'; g.title = 'Presente do dia!';
    g.style.left = Math.max(0, Math.min(innerWidth - 40, p.x + p.s)) + 'px'; g.style.top = (innerHeight - extraChao - 44) + 'px';
    g.addEventListener('pointerdown', ev => { ev.preventDefault(); ev.stopPropagation(); });
    g.addEventListener('click', ev => {
      ev.stopPropagation(); if(g.dataset.aberto) return; g.dataset.aberto = 1;
      const premio = sorte([['🪙', 30], ['🪙', 50], ['pocao', 2], ['doce', 1], ['pedra', 1], ['ovoRaro', 1]]);
      if(premio[0] === '🪙'){ ganharMoedas(premio[1], p); g.textContent = '🪙'; avisoConquista(`🎁 Presente do dia: ${premio[1]} moedas!`); }
      else { cfg.mochila[premio[0]] += premio[1]; g.textContent = ITEM_INFO[premio[0]][0]; avisoConquista(`🎁 Presente do dia: ${ITEM_INFO[premio[0]][0]} ${ITEM_INFO[premio[0]][1]}!`); salvarCfg(); }
      contar('presentes'); setTimeout(() => g.remove(), 1800);
    });
    raiz.appendChild(g); falar(p, 'Presente do dia pra você! 🎁 Abre!', 3500);
  }
  setTimeout(presenteDoDia, 9000); setInterval(presenteDoDia, 10 * 60000);

  /* ---------- 🛒 loja, 🎒 mochila, 🏟️ ginásio, 🏅 conquistas, ✅ desafios, 🏆 ranking ---------- */
  const ITEM_INFO = { pocao:['🧪', 'Poção', 15, 'Cura 50 na batalha (usa sozinha)'], doce:['🍬', 'Doce raro', 25, 'Sobe o nível e dá estrelinhas de evolução'],
    pedra:['💎', 'Pedra da evolução', 40, 'Evolui na hora'], mega:['🧬', 'Pedra Mega', 60, 'Mega evolução por 1 minuto'],
    dinamax:['🔴', 'Pulseira Dynamax', 60, 'Gigantamax por 40 segundos'], ovoRaro:['🥚', 'Ovo raro', 80, 'Chance de shiny ou de lendário'], ovoLenda:['🌟', 'Ovo lendário', 0, 'Sempre lendário! (custa 10⭐)'] };
  const LENDARIOS = [144, 145, 146, 150, 151, 243, 244, 245, 249, 250, 251, 377, 378, 379, 380, 381, 382, 383, 384, 385, 386, 480, 481, 482, 483, 484, 485, 487, 488, 491, 492, 493, 638, 639, 640, 641, 642, 643, 644, 645, 646, 716, 717, 718, 719, 785, 786, 787, 788, 789, 791, 792, 800, 802, 807, 888, 889, 890, 1007, 1008, 1024];
  const GINASIOS = [['Ginásio da Rocha', 95, '🪨', 'Insígnia da Rocha'], ['Ginásio da Água', 121, '💧', 'Insígnia da Cascata'], ['Ginásio Elétrico', 26, '⚡', 'Insígnia do Trovão'], ['Ginásio da Planta', 45, '🌿', 'Insígnia do Arco-íris'],
    ['Ginásio do Veneno', 110, '☠️', 'Insígnia da Alma'], ['Ginásio Psíquico', 65, '🔮', 'Insígnia do Pântano'], ['Ginásio do Fogo', 59, '🔥', 'Insígnia do Vulcão'], ['Ginásio da Terra', 112, '🌋', 'Insígnia da Terra']];
  const MEGA = { 3:[10033], 6:[10034, 10035], 9:[10036], 65:[10037], 94:[10038], 115:[10039], 127:[10040], 130:[10041], 142:[10042], 150:[10043, 10044], 181:[10045], 212:[10046], 214:[10047],
    229:[10048], 248:[10049], 257:[10050], 282:[10051], 303:[10052], 306:[10053], 308:[10054], 310:[10055], 354:[10056], 359:[10057], 445:[10058], 448:[10059], 460:[10060] };
  function abrirCentral(aba){
    if(jogo && !jogo.cartao){ mostrarPlacar('⏳ Termine o jogo primeiro!'); sumirPlacar(2000); return; }
    const corpo = abrirCartao('🎒 Central do Treinador');
    const ABAS = [['loja', '🛒 Loja'], ['mochila', '🎒 Mochila'], ['ginasio', '🏟️ Ginásio'], ['desafio', '✅ Desafio'], ['conquistas', '🏅 Conquistas'], ['ranking', '🏆 Ranking']];
    const tela = a => {
      aba = a;
      const topo = `<p class="saldo">🪙 <b>${cfg.moedas}</b> moedas · ⭐ <b>${cfg.estrelas}</b> estrelas · 🔥 ${cfg.seq.dias} dias</p><div class="abas">${ABAS.map(([k, n]) => `<button type="button" data-aba="${k}" class="${k === a ? 'on' : ''}">${n}</button>`).join('')}</div>`;
      let h = '';
      if(a === 'loja') h = Object.entries(ITEM_INFO).map(([k, [ic, nome, preco, desc]]) => `<div class="item"><span class="ic">${ic}</span><span><b>${nome}</b><small>${desc}</small></span>
          <button type="button" data-comprar="${k}" ${(k === 'ovoLenda' ? cfg.estrelas < 10 : cfg.moedas < preco) ? 'disabled' : ''}>${k === 'ovoLenda' ? '10⭐' : preco + '🪙'}</button></div>`).join('')
          + '<p class="dica-c">Ganhe moedas cuidando, jogando, batalhando e cumprindo o desafio do dia!</p>';
      if(a === 'mochila'){
        const tem = ITENS.filter(k => cfg.mochila[k] > 0);
        h = tem.length ? tem.map(k => `<div class="item"><span class="ic">${ITEM_INFO[k][0]}</span><span><b>${ITEM_INFO[k][1]} ×${cfg.mochila[k]}</b><small>${ITEM_INFO[k][3]}</small></span>${k === 'pocao' ? '<small>(automático)</small>' : `<button type="button" data-usar="${k}">Usar</button>`}</div>`).join('')
          : '<p class="grande-txt">A mochila está vazia! 🎒</p><p class="dica-c">Compre coisas na 🛒 Loja.</p>';
      }
      if(a === 'ginasio') h = GINASIOS.map(([nome, id, emoji, ins], k) => `<div class="item ${cfg.insignias.includes(k) ? 'feito' : ''}"><span class="ic"><img alt="" src="${BASE}home/${id}.png" /></span><span><b>${nome}</b><small>${cfg.insignias.includes(k) ? `✅ ${ins} ${emoji}` : `Líder: ${nomeDe(id)}`}</small></span><button type="button" data-ginasio="${k}">${cfg.insignias.includes(k) ? 'De novo' : 'Desafiar'}</button></div>`).join('')
          + `<p class="dica-c">Insígnias: ${GINASIOS.map((g, k) => cfg.insignias.includes(k) ? g[2] : '⬜').join(' ')}</p>`;
      if(a === 'desafio'){ const ms = missoesDeHoje(); h = ms.map(([k, nome, meta]) => { const v = Math.min(meta, cfg.missoes.prog[k] || 0); return `<div class="item ${v >= meta ? 'feito' : ''}"><span class="ic">${v >= meta ? '✅' : '⬜'}</span><span><b>${nome}</b><small>${v} de ${meta} · prêmio: 10🪙 +1⭐</small></span></div>`; }).join('')
          + `<p class="dica-c">Faça os 3 e ganhe mais 20🪙 +2⭐! Volte amanhã pra manter a sequência 🔥</p>`; }
      if(a === 'conquistas') h = `<p class="dica-c">${cfg.conquistas.length} de ${CONQUISTAS.length}</p><div class="medalhas">${CONQUISTAS.map(([k, n]) => `<span class="${cfg.conquistas.includes(k) ? 'tem' : ''}">${cfg.conquistas.includes(k) ? '' : '🔒 '}${n}</span>`).join('')}</div>`;
      if(a === 'ranking') h = pets.slice().sort((x, y) => (+y.nec.exp || 0) - (+x.nec.exp || 0)).map((p, i) => `<div class="item"><span class="ic">${['🥇', '🥈', '🥉'][i] || (i + 1) + 'º'}</span><span><b>${esc(nomeDo(p))}</b><small>Nível ${nivelDe(p)}${p.mega ? ' · 🧬 Mega' : ''}</small></span></div>`).join('');
      corpo.innerHTML = topo + `<div class="lista-c">${h}</div>`;
    };
    const escolherPet = (titulo, faz, filtro) => {
      const lista = pets.filter(p => !filtro || filtro(p));
      corpo.innerHTML = `<p class="grande-txt">${titulo}</p><div class="ops">${lista.map(p => `<button type="button" data-pet="${pets.indexOf(p)}">${esc(nomeDo(p))} · Nv.${nivelDe(p)}</button>`).join('') || '<p>Nenhum Pokémon pode usar isso agora.</p>'}</div><button type="button" class="grande" data-aba="${aba}">↩️ Voltar</button>`;
      corpo.onclickPet = faz;
    };
    corpo.addEventListener('click', ev => {
      const t = ev.target.closest('button'); if(!t) return;
      if(t.dataset.aba) return tela(t.dataset.aba);
      if(t.dataset.comprar){
        const k = t.dataset.comprar, [ic, nome, preco] = ITEM_INFO[k];
        if(k === 'ovoLenda'){ if(cfg.estrelas < 10) return; cfg.estrelas -= 10; } else { if(cfg.moedas < preco) return; cfg.moedas -= preco; }
        cfg.mochila[k]++; salvarCfg(); torcer(`Comprou ${ic} ${nome}! 🛍️`); return tela('loja');
      }
      if(t.dataset.usar){
        const k = t.dataset.usar;
        if(k === 'ovoRaro' || k === 'ovoLenda'){
          if(cfg.ovos.length >= MAX_OVOS || cfg.pets.length + cfg.ovos.length >= MAX_PETS){ torcer('Não cabe mais ovo! 🥚'); return; }
          cfg.mochila[k]--;
          const lenda = k === 'ovoLenda' || Math.random() < .25;
          cfg.ovos.push({ id:lenda ? sorte(LENDARIOS) : 1 + Math.floor(Math.random() * 1025), shiny:k === 'ovoLenda' ? Math.random() < .2 : Math.random() < .35, surpresa:true, ate:Date.now() + 60000 });
          montarOvos(); salvarCfg(); torcer('Um ovo especial! 🥚✨'); return tela('mochila');
        }
        const filtros = { pedra:p => evosDe(p.id).length, mega:p => MEGA[p.id] && !p.mega, dinamax:p => !p.gmax, doce:() => true };
        return escolherPet(`Quem vai usar ${ITEM_INFO[k][0]} ${ITEM_INFO[k][1]}?`, p => usarItem(k, p), filtros[k]);
      }
      if(t.dataset.ginasio !== undefined){
        const k = +t.dataset.ginasio, [nome, id, emoji, ins] = GINASIOS[k];
        return escolherPet(`Quem vai lutar no ${nome}? (líder: ${nomeDe(id)})`, p => { fecharCartao(); iniciarBatalha(p, { k, id, nome, emoji, insignia:ins }); }, p => !p.dentro || true);
      }
      if(t.dataset.pet !== undefined && corpo.onclickPet){ const p = pets[+t.dataset.pet]; const f = corpo.onclickPet; corpo.onclickPet = null; if(p) f(p); if(cartaoEl && cartaoEl.contains(corpo)) tela(aba); }
    });
    tela(aba || 'loja');
  }
  function usarItem(k, p){
    if(!cfg.mochila[k]) return;
    if(k === 'doce'){ cfg.mochila.doce--; ganharXp(p, 10); p.nec.xp = XP_EVO; desenharNec(p); efeito(p, '🍬', 3); falar(p, 'Doce raro! Que poder! 🍬💪', 2200); salvarNec(); }
    if(k === 'pedra'){ const ev = evosDe(p.id); if(!ev.length) return; cfg.mochila.pedra--; fecharCartao(); efeito(p, '💎', 3); evoluir(p, ev.length > 1 ? sorte(ev) : ev[0]); }
    if(k === 'mega'){ if(!MEGA[p.id]) return; cfg.mochila.mega--; fecharCartao(); megaEvoluir(p); }
    if(k === 'dinamax'){ cfg.mochila.dinamax--; fecharCartao(); gigantamax(p); }
    salvarCfg();
  }
  /* 🧬 Mega evolução (1 minuto) e 🔴 Gigantamax (40 segundos) */
  function megaEvoluir(p){
    const formas = MEGA[p.id]; if(!formas || p.mega) return;
    const forma = sorte(formas);
    p.el.classList.add('evoluindo', 'mega'); falar(p, `${nomeDo(p)} está Mega Evoluindo! 🧬✨`, 2600); contar('megas');
    setTimeout(() => { p.mega = forma; p.img.onerror = () => { p.img.onerror = null; p.img.src = reserva(p); }; p.img.src = `${BASE}home/${p.shiny ? 'shiny/' : ''}${forma}.png`; }, 1300);
    setTimeout(() => { p.el.classList.remove('evoluindo'); efeito(p, '🧬', 3); falar(p, `Mega ${nomeDe(p.id)}! 💥`, 2400); grito(p); }, 2700);
    setTimeout(() => { if(!p.mega) return; p.mega = 0; p.el.classList.remove('mega'); trocarFoto(p); falar(p, 'Voltei ao normal! 😮‍💨', 1800); }, 60000);
  }
  function gigantamax(p){
    if(p.gmax) return;
    p.gmax = true; p.el.classList.add('gmax'); falar(p, `${nomeDo(p)} virou GIGANTAMAX! 🔴☁️`, 2600); grito(p); terremotoPequeno();
    setTimeout(() => { p.gmax = false; p.el.classList.remove('gmax'); falar(p, 'Encolhi! 😅', 1800); }, 40000);
  }
  function terremotoPequeno(){ host.animate([{ transform:'translate(0,0)' }, { transform:'translate(-6px,3px)' }, { transform:'translate(6px,-3px)' }, { transform:'translate(-3px,2px)' }, { transform:'none' }], { duration:500 }); }

  /* ======================================================================
     🏠 DENTRO DA CASINHA (dá pra entrar e ver eles!)
     ====================================================================== */
  let casaAberta = null;
  function abrirDentro(){
    const [ic, nome, da] = CASAS[cfg.casa] || CASAS.casa;
    const corpo = abrirCartao(`${ic} Dentro ${da} ${nome}`);
    casaAberta = corpo;
    const fechar = cartaoEl.querySelector('[data-fechar]'); fechar.addEventListener('click', () => { casaAberta = null; });
    corpo.addEventListener('click', ev => {
      const b = ev.target.closest('button'); if(!b) return;
      if(b.dataset.sair !== undefined){ const p = pets[+b.dataset.sair]; if(p && p.dentro) sairDeCasa(p, sorte(['Tchau, casinha! 👋', 'Já vou! 😄'])); }
      if(b.dataset.todos !== undefined) bateuNaPorta();
      if(b.dataset.acordar !== undefined){ const p = pets[+b.dataset.acordar]; if(p){ p.soneca = false; p.estado = 'emCasa'; p.ate = performance.now() + 4000; dormir(p, false); } }
      setTimeout(desenharDentro, 50);
    });
    desenharDentro();
  }
  function desenharDentro(){
    if(!casaAberta || !casaAberta.isConnected){ casaAberta = null; return; }
    const dentro = pets.filter(p => p.dentro);
    const castelo = cfg.casa === 'castelo', barraca = cfg.casa === 'barraca';
    const moveis = barraca ? ['🏕️', '🔦', '🎒', '🍢'] : castelo ? ['👑', '🛡️', '🕯️', '🍷'.replace('🍷', '🧃')] : ['🛋️', '📺', '🧸', '🪴'];
    casaAberta.innerHTML = `<div class="comodo ${castelo ? 'castelo' : barraca ? 'barraca' : ''}" style="--cor:${CORES[cfg.cor]}">
        <span class="m m1">${moveis[0]}</span><span class="m m2">${moveis[1]}</span><span class="m m3">${moveis[2]}</span><span class="m m4">${moveis[3]}</span>
        <span class="m cam">🛏️</span><span class="m gel">${barraca ? '🔥' : '🧊'}</span><span class="m jan">🪟</span>
        ${dentro.map((p, i) => `<div class="morador" style="left:${12 + (i % 5) * 18}%;bottom:${8 + Math.floor(i / 5) * 30}%"><img alt="" src="${p.img.src}" />${p.estado === 'dormir' ? '<b class="zz">💤</b>' : `<b class="zz">${sorte(['📺', '🧸', '🍪', '🎮', '📖'])}</b>`}<small>${esc(nomeDo(p))}</small></div>`).join('')}
        ${dentro.length ? '' : '<p class="vazio">Ninguém em casa agora… 🏠</p>'}
      </div>
      <div class="ops">${dentro.map(p => `<button type="button" data-sair="${pets.indexOf(p)}">👋 Chamar ${esc(nomeDo(p))}</button>${p.estado === 'dormir' ? `<button type="button" data-acordar="${pets.indexOf(p)}">⏰ Acordar ${esc(nomeDo(p))}</button>` : ''}`).join('')}
      <button type="button" data-todos>${dentro.length ? '🚪 Todo mundo pra fora!' : '🏠 Chamar todo mundo pra entrar'}</button></div>`;
  }
  setInterval(() => { if(casaAberta) desenharDentro(); }, 4000);

  /* ======================================================================
     🏖️ LUGARES, 🌳 ÁRVORE, 🌻 JARDIM, 🚂 TREM e outros veículos
     ====================================================================== */
  const cena = { el:null, lugar:'', arvore:null, flores:[] };
  const gravidade = () => cfg.lugar === 'espaco' ? 420 : cfg.lugar === 'mar' ? 650 : 1900;
  function montarCena(){
    if(cena.lugar !== cfg.lugar){
      cena.lugar = cfg.lugar; if(cena.el) cena.el.remove(); cena.el = null;
      if(cfg.lugar !== 'nada'){
        const e = document.createElement('div'); e.className = 'cenario ' + cfg.lugar;
        const D = { praia:'<i class="mar-faixa"></i><i class="areia"></i><b style="left:6%">🌴</b><b style="left:30%">⛱️</b><b style="left:58%">🦀</b><b style="left:80%">🐚</b><b style="left:92%">🌴</b>',
          montanha:'<i class="pico p1"></i><i class="pico p2"></i><i class="pico p3"></i><b style="left:12%">🌲</b><b style="left:70%">🌲</b><b style="left:88%">⛄</b>',
          espaco:'<b class="alto" style="left:8%">🪐</b><b class="alto" style="left:80%">🌍</b><b class="alto" style="left:45%">☄️</b><b style="left:30%">🛸</b><b style="left:66%">👾</b>',
          mar:'<i class="agua"></i><b style="left:5%">🪸</b><b style="left:22%">🌿</b><b style="left:47%">🐚</b><b style="left:73%">🪸</b><b style="left:90%">🌿</b><b class="nada1">🐠</b><b class="nada2">🐟</b><b class="nada3">🐡</b>',
          floresta:'<b class="grande" style="left:3%">🌲</b><b class="grande" style="left:20%">🌳</b><b style="left:35%">🍄</b><b class="grande" style="left:62%">🌲</b><b style="left:78%">🌿</b><b class="grande" style="left:88%">🌳</b>',
          cidade:'<i class="predio" style="left:4%;height:120px"></i><i class="predio" style="left:14%;height:80px"></i><i class="predio" style="left:62%;height:140px"></i><i class="predio" style="left:74%;height:95px"></i><i class="predio" style="left:86%;height:125px"></i><b style="left:40%">🚦</b><b style="left:52%">🌳</b>' }[cfg.lugar] || '';
        e.innerHTML = D; e.style.bottom = extraChao + 'px'; raiz.prepend(e); cena.el = e;
      }
    }
    /* 🌳 Árvore */
    if(cfg.arvore && !cena.arvore){ const a = document.createElement('span'); a.className = 'arvore'; a.textContent = '🌳'; raiz.prepend(a); cena.arvore = a; }
    if(!cfg.arvore && cena.arvore){ cena.arvore.remove(); cena.arvore = null; pets.forEach(p => { if(['naArvore', 'irArvore'].includes(p.estado)){ p.estado = 'cair'; p.vx = 0; p.vy = 0; } }); }
    if(cena.arvore){ cena.arvoreX = innerWidth - 230; cena.arvore.style.transform = `translate(${cena.arvoreX}px, ${innerHeight - extraChao - 200}px)`; }
    /* 🌻 Jardim */
    if(cfg.jardim && !cena.flores.length){
      for(let i = 0; i < 6; i++){ const f = document.createElement('span'); f.className = 'flor'; raiz.prepend(f); cena.flores.push({ el:f, x:.12 + i * .14, cresce:Math.random() * 40, fruta:false }); }
    }
    if(!cfg.jardim && cena.flores.length){ cena.flores.forEach(f => f.el.remove()); cena.flores = []; }
    cena.flores.forEach(f => { f.el.style.transform = `translate(${f.x * innerWidth}px, ${innerHeight - extraChao - 34}px)`; desenharFlor(f); });
  }
  const desenharFlor = f => { f.el.textContent = f.fruta ? '🍓' : f.cresce < 25 ? '🌱' : f.cresce < 60 ? '🌿' : f.cresce < 100 ? '🌷' : '🌻'; };
  setInterval(() => {
    if(!cena.flores.length || document.hidden) return;
    cena.flores.forEach(f => { f.cresce = Math.min(130, f.cresce + (chove() ? 6 : 2)); if(f.cresce >= 130 && !f.fruta && Math.random() < .1) f.fruta = true; desenharFlor(f); });
  }, 5000);
  /* Quem passa pertinho de uma flor com fruta come; às vezes alguém rega. */
  function cuidarJardim(pet, agora){
    if(!cena.flores.length) return false;
    const f = sorte(cena.flores);
    pet.alvoX = f.x * innerWidth - pet.s / 2 + 12; pet.florAlvo = f; pet.estado = 'irFlor'; pet.ate = agora + 15000;
    return true;
  }
  /* 🚂 Trenzinho */
  const trem = { el:null, x:0, ativo:false, prox:performance.now() + 30000, passageiros:[] };
  function chamarTrem(){
    if(trem.ativo || !cfg.ligado) return;
    if(!trem.el){ trem.el = document.createElement('div'); trem.el.className = 'trem'; trem.el.innerHTML = '<span>🚂</span><span>🚃</span><span>🚃</span><span>🚃</span>'; raiz.appendChild(trem.el); }
    trem.ativo = true; trem.x = -260; trem.passageiros = []; trem.el.style.display = '';
    somRuido(.6, 900, .15);
    pets.filter(p => !p.dentro && ['andar', 'parado', 'sentar', 'correr', 'dancar'].includes(p.estado) && Math.random() < .6).slice(0, 3).forEach((p, i) => { trem.passageiros.push(p); p.vagao = i; p.estado = 'esperaTrem'; p.ate = performance.now() + 1e9; });
  }
  function moverTrem(agora, dt){
    if(cfg.trem && !trem.ativo && agora > trem.prox && !jogo && !luta){ trem.prox = agora + 60000 + Math.random() * 60000; chamarTrem(); }
    if(!trem.ativo) return;
    trem.x += 170 * dt;
    const y = innerHeight - extraChao - 58;
    trem.el.style.transform = `translate(${trem.x}px, ${y}px)`;
    trem.passageiros.forEach(p => {
      if(!pets.includes(p)) return;
      const vx = trem.x + 66 + p.vagao * 64 + 32 - p.s / 2;
      if(p.estado === 'esperaTrem' && Math.abs(vx - p.x) < 40){ p.estado = 'noTrem'; falar(p, sorte(['Piuí! 🚂', 'Vou de trem! 🚃😆', 'Tchau, gente! 👋']), 1600); }
      if(p.estado === 'noTrem'){ p.x = vx; p.y = y - p.s * .78; }
    });
    if(trem.x > innerWidth + 40){
      trem.ativo = false; trem.el.style.display = 'none';
      trem.passageiros.forEach((p, i) => { if(!pets.includes(p)) return; if(p.estado === 'noTrem' || p.estado === 'esperaTrem'){ p.estado = 'cair'; p.x = Math.random() * (innerWidth - p.s); p.y = -p.s - i * 50; p.vx = 0; p.vy = 0; setTimeout(() => falar(p, 'Voltei do passeio! 🚂😄', 1800), 1200); } });
      trem.passageiros = [];
    }
  }
  /* ✈️ Avião que leva um Pokémon (ele volta de 🪂 paraquedas) */
  function aviao(){
    const p = sorte(pets.filter(q => !q.dentro && !['batalha', 'escondido', 'fugir', 'arrastado'].includes(q.estado))); if(!p) return;
    const a = document.createElement('span'); a.className = 'aviaozinho'; a.textContent = '✈️'; raiz.appendChild(a);
    tirarProps(p); dormir(p, false); p.estado = 'noAviao'; p.ate = performance.now() + 1e9; p.aviao = { el:a, x:innerWidth + 60 };
    falar(p, 'Olha o avião! Vou pegar carona! ✈️😆', 2000);
  }
  function paraquedas(p){ tirarProps(p); p.estado = 'paraquedas'; p.ate = performance.now() + 1e9; p.vx = 0; p.vy = 60; p.props = []; p.temProps = true;
    const e = document.createElement('span'); e.className = 'prop paraq'; e.textContent = '🪂'; p.el.appendChild(e); p.props.push(e); }

  /* ======================================================================
     🐾 PARTE 5: mais coisas que eles fazem, poderes de cada tipo e amizade
     ====================================================================== */
  const MAIS_ATIVIDADES = ['varrer', 'cambalhota', 'grafite', 'sorvete', 'bolhinhas', 'violino', 'tiktok', 'selfie', 'rir', 'carro', 'foguete', 'arcoiris', 'fogueira', 'regar'];
  function maisAtividade(pet, agora, qual){
    qual = qual || sorte(MAIS_ATIVIDADES.filter(a => (a !== 'fogueira' || tipoDe(pet.id) === 1) && (a !== 'regar' || cena.flores.length)));
    if(qual === 'fogueira' && tipoDe(pet.id) !== 1) qual = 'rir';
    if(qual === 'regar') return cuidarJardim(pet, agora) || maisAtividade(pet, agora, 'rir');
    tirarProps(pet); dormir(pet, false); pet.naCama = false; pet.menu.classList.remove('on');
    pet.estado = qual; pet.temProps = true; pet.props = []; pet.ate = agora + 5000 + Math.random() * 3000;
    const prop = (cls, t) => { const e = document.createElement('span'); e.className = 'prop ' + cls; e.textContent = t; pet.el.appendChild(e); pet.props.push(e); return e; };
    const F = {
      varrer:() => { prop('vassoura', '🧹'); falar(pet, sorte(['Hora da faxina! 🧹', 'Tudo limpinho! ✨']), 2000); },
      cambalhota:() => { pet.ate = agora + 1600; falar(pet, sorte(['Cambalhota! 🤸', 'Olha isso! 🤸‍♂️']), 1500); },
      grafite:() => { pet.ate = agora + 4500; falar(pet, sorte(['Vou desenhar! 🎨', 'Sou um artista! 🖌️']), 2000); for(let i = 0; i < 6; i++) setTimeout(() => rabisco(pet), 400 + i * 600); },
      sorvete:() => { prop('sorvete', '🍦'); falar(pet, sorte(['Sorvete! 🍦😋', 'Tá derretendo! 🍦💦']), 2000); setTimeout(() => { if(pet.estado === 'sorvete'){ efeito(pet, '💧', 3); falar(pet, 'Derreteu tudo! 🫠', 1600); } }, 3500); },
      bolhinhas:() => { prop('vara-bolha', '🫧'); falar(pet, 'Bolhinhas de sabão! 🫧', 1800); for(let i = 0; i < 8; i++) setTimeout(() => { if(pet.estado === 'bolhinhas') efeito(pet, '🫧', 1); }, i * 500); },
      violino:() => { prop('violino', '🎻'); falar(pet, sorte(['🎻 Lá lá lá~', 'Música clássica! 🎻🎶']), 2200); tocar([[76, .5], [79, .5], [84, 1], [83, .5], [79, .5], [76, 1.5]], 100); for(let i = 0; i < 4; i++) setTimeout(() => { if(pet.estado === 'violino') efeito(pet, '🎵', 1); }, i * 900); },
      tiktok:() => { pet.ate = agora + 4000; falar(pet, sorte(['Dancinha do TikTok! 📱💃', 'Viralizei! 🕺']), 2000); },
      selfie:() => { prop('celular', '🤳'); pet.ate = agora + 2500; setTimeout(() => { const f = document.createElement('div'); f.className = 'flash'; raiz.appendChild(f); setTimeout(() => f.remove(), 700); falar(pet, sorte(['Selfie com você! 🤳😁', 'Xiiis! 📸']), 1800); }, 1000); },
      rir:() => { pet.ate = agora + 3000; falar(pet, sorte(['Hahaha! 🤣 Lembrei de uma piada!', 'Kkkkkk 😂', 'Hihihi! 🤭']), 2400); },
      carro:() => { prop('carrinho', '🚗'); pet.dir = Math.random() < .5 ? -1 : 1; falar(pet, sorte(['Bi-bi! 🚗', 'Vrum vrum! 🏎️']), 1800); },
      foguete:() => { prop('foguetinho', '🚀'); pet.ate = agora + 1e9; pet.vy = 0; falar(pet, '3… 2… 1… DECOLAR! 🚀', 1800); somRuido(1.5, 400, .2); },
      arcoiris:() => { pet.ate = agora + 1e9; pet.arco = { x0:pet.x, dir:pet.x > innerWidth / 2 ? -1 : 1, t:0 }; const a = document.createElement('div'); a.className = 'ponte-arco'; raiz.appendChild(a); pet.props.push(a);
        const w = 420, x = pet.arco.dir > 0 ? pet.x + pet.s / 2 : pet.x + pet.s / 2 - w; a.style.width = w + 'px'; a.style.height = '200px'; a.style.transform = `translate(${x}px, ${innerHeight - extraChao - 200}px)`; falar(pet, 'Ponte de arco-íris! 🌈', 1800); },
      fogueira:() => { prop('fogo', '🔥'); falar(pet, 'Acendi uma fogueira! Vem se esquentar! 🔥', 2200); pets.filter(q => q !== pet && !q.dentro && q.frio).forEach(q => falar(q, 'Quentinho! 🔥😊', 1600)); }
    };
    (F[qual] || F.rir)();
  }
  function rabisco(pet){
    if(pet.estado !== 'grafite') return;
    const r = document.createElement('span'); r.className = 'rabisco';
    r.textContent = sorte(['〰️', '⭐', '❤️', '🌀', '✏️', '🌈', '😺', '⚡']); r.style.color = sorte(['#ff6b6b', '#4dabf7', '#51cf66', '#fcc419', '#cc5de8']);
    r.style.left = (pet.x + pet.s / 2 + (Math.random() - .5) * 120) + 'px'; r.style.top = (pet.y - 20 - Math.random() * 80) + 'px';
    raiz.appendChild(r); setTimeout(() => r.remove(), 8000);
  }
  /* 🕷️ Aranha que desce do teto */
  function aranha(){
    const x = 60 + Math.random() * (innerWidth - 120), a = document.createElement('div'); a.className = 'aranha clicavel'; a.title = 'Xô, aranha!';
    a.innerHTML = '<i class="fio"></i><span>🕷️</span>'; a.style.left = x + 'px'; raiz.appendChild(a);
    let h = 0; const desce = setInterval(() => { h = Math.min(innerHeight * .45, h + 6); a.querySelector('.fio').style.height = h + 'px'; }, 30);
    const sai = () => { clearInterval(desce); a.style.transition = 'opacity .5s'; a.style.opacity = '0'; setTimeout(() => a.remove(), 500); };
    a.addEventListener('pointerdown', ev => { ev.preventDefault(); ev.stopPropagation(); sai(); torcer('Ufa! Obrigado! 😮‍💨', 1600); });
    setTimeout(() => pets.filter(p => !p.dentro && Math.abs(p.x + p.s / 2 - x) < 350 && ['andar', 'parado', 'sentar', 'dancar', 'ler'].includes(p.estado)).forEach(p => {
      p.estado = 'correr'; p.dir = p.x + p.s / 2 < x ? -1 : 1; p.ate = performance.now() + 2500; falar(p, sorte(['AAAH! UMA ARANHA! 🕷️😱', 'Socorro! 🕷️', 'Tira isso daqui! 😨']), 1800);
    }), 1500);
    setTimeout(sai, 9000);
  }
  /* 🤝 Amizade: coisas que eles fazem juntos */
  const CONVERSAS = [
    (a, b) => [`${nomeDo(b)}, qual sua comida favorita?`, `É ${favDe(b.id)}! 😋`],
    (a, b) => ['Você gosta de chuva?', tipoGosta.chuva.includes(tipoDe(b.id)) ? 'Eu AMO chuva! 💧' : 'Prefiro sol! ☀️'],
    (a, b) => ['Vamos brincar?', 'Bora! 😄'],
    (a, b) => ['O que você quer ser quando crescer?', evosDe(b.id).length ? `Um ${nomeDe(evosDe(b.id)[0])}! 🌟` : 'Eu já cresci! 😎'],
    (a, b) => ['Você viu meu treinador?', 'Tá ali no computador! 👀'],
    (a, b) => ['Sabia que eu sou do tipo ' + ['Normal', 'Fogo', 'Água', 'Planta', 'Elétrico', 'Gelo', 'Lutador', 'Venenoso', 'Terra', 'Voador', 'Psíquico', 'Inseto', 'Pedra', 'Fantasma', 'Dragão', 'Sombrio', 'Metálico', 'Fada'][tipoDe(a.id)] + '?', 'Que legal! 🤩'],
    (a, b) => ['Qual seu golpe favorito?', `${(GOLPES[tipoDe(b.id)] || GOLPES[0])[1]}! ${(GOLPES[tipoDe(b.id)] || GOLPES[0])[0]}`]
  ];
  function amizade(){
    if(!cfg.amizade || jogo || luta || festando || document.hidden) return;
    const livres = pets.filter(p => !p.dentro && ['andar', 'parado', 'sentar', 'espreguicar'].includes(p.estado));
    if(livres.length < 2) return;
    const [a, b] = livres.sort(() => Math.random() - .5);
    const agora = performance.now(), r = Math.random();
    const juntar = (q, alvo) => { q.estado = 'irAmigo'; q.amigo = alvo; q.ate = agora + 8000; };
    if(r < .3){ const [f, g] = sorte(CONVERSAS)(a, b); a.estado = b.estado = 'parado'; a.ate = b.ate = agora + 4500; a.dir = b.x > a.x ? 1 : -1; b.dir = -a.dir; falar(a, f, 2200); setTimeout(() => falar(b, g, 2200), 2300); }
    else if(r < .45){ juntar(a, b); a.depois = 'presente'; }
    else if(r < .55){ juntar(a, b); a.depois = 'cartinha'; }
    else if(r < .65){ a.estado = b.estado = 'parado'; a.ate = b.ate = agora + 6000; falar(a, 'Isso é meu! 😠', 1500); setTimeout(() => falar(b, 'Não, é meu! 😤', 1500), 1500); setTimeout(() => falar(a, 'Desculpa… 🥺', 1500), 3200); setTimeout(() => { falar(b, 'Tudo bem! Amigos? 🤗', 1500); efeito(a, '💞', 3); }, 4600); }
    else if(r < .75){ juntar(a, b); a.depois = 'cabo'; }
    else if(r < .85){ juntar(a, b); a.depois = 'juntos'; falar(a, `${nomeDo(b)}, meu melhor amigo! 💕`, 2000); }
    else if(r < .92) abracoEmGrupo();
    else piquenique();
  }
  setInterval(amizade, 22000);
  function chegouNoAmigo(a){
    const b = a.amigo, agora = performance.now();
    if(!b || !pets.includes(b)){ a.estado = 'parado'; a.ate = agora + 1000; return; }
    a.dir = b.x > a.x ? 1 : -1;
    if(a.depois === 'presente'){ efeito(a, '🎁', 1); falar(a, `Um presente pra você, ${nomeDo(b)}! 🎁`, 2000); setTimeout(() => { efeito(b, '😍', 2); falar(b, 'Obrigado!! 😍', 1800); }, 2000); }
    if(a.depois === 'cartinha'){ efeito(a, '💌', 1); falar(a, 'Te escrevi uma cartinha! 💌', 2000); setTimeout(() => { efeito(b, '💕', 3); falar(b, 'Que fofo! 💕', 1800); }, 2000); }
    if(a.depois === 'juntos'){ a.estado = 'seguirAmigo'; a.ate = agora + 9000; return; }
    if(a.depois === 'cabo'){ caboDeGuerra(a, b); return; }
    a.estado = 'parado'; a.ate = agora + 3500; a.depois = null;
  }
  function caboDeGuerra(a, b){
    const agora = performance.now(), corda = document.createElement('div'); corda.className = 'corda'; raiz.appendChild(corda);
    a.estado = b.estado = 'cabo'; a.ate = b.ate = agora + 1e9; a.cabo = b.cabo = corda; b.dir = a.x < b.x ? -1 : 1; a.dir = -b.dir;
    falar(a, 'Cabo de guerra! 🪢💪', 1500);
    setTimeout(() => {
      const [venc, perd] = Math.random() < .5 ? [a, b] : [b, a];
      corda.remove(); [a, b].forEach(q => { q.cabo = null; q.estado = 'parado'; q.ate = performance.now() + 2000; });
      pular(perd, 400); perd.vx = (venc.x > perd.x ? 1 : -1) * 200; falar(venc, 'Ganhei! 💪😆', 1600); setTimeout(() => falar(perd, 'Ai! Foi por pouco! 😅', 1500), 900);
    }, 4500);
  }
  function abracoEmGrupo(){
    const agora = performance.now(), mid = innerWidth / 2;
    pets.filter(p => !p.dentro).forEach((p, i) => { p.estado = 'irAbraco'; p.alvoX = mid - p.s / 2 + (i - pets.length / 2) * p.s * .45; p.ate = agora + 9000; });
    setTimeout(() => { pets.filter(p => p.estado === 'abraco').forEach(p => efeito(p, '🤗', 2)); torcer('ABRAÇO EM GRUPO! 🤗💕', 2200); }, 4000);
  }
  let toalha = null;
  function piquenique(){
    if(toalha) return;
    const agora = performance.now(), mid = innerWidth / 2;
    toalha = document.createElement('div'); toalha.className = 'toalha'; toalha.innerHTML = '<span>🧺</span><span>🥪</span><span>🍉</span><span>🧃</span>';
    toalha.style.left = (mid - 140) + 'px'; toalha.style.top = (innerHeight - extraChao - 26) + 'px'; raiz.appendChild(toalha);
    pets.filter(p => !p.dentro).forEach((p, i) => { p.estado = 'irAbraco'; p.alvoX = mid - 140 + (i % 5) * 56 - p.s / 4; p.ate = agora + 12000; });
    torcer('Piquenique! 🧺 Todo mundo vem!', 2200);
    setTimeout(() => { pets.forEach(p => { p.nec.fome = Math.min(100, p.nec.fome + 20); }); torcer('Que delícia de piquenique! 😋', 2000); }, 6000);
    setTimeout(() => { if(toalha){ toalha.remove(); toalha = null; } }, 12000);
  }
  /* Poderes de cada tipo */
  let ultChoque = 0;
  function poderes(pet, agora, dt){
    if(!cfg.especiais || pet.dentro) return;
    const t = tipoDe(pet.id), anda = ['andar', 'correr'].includes(pet.estado);
    if(t === 2 && anda && Math.random() < dt * .3){ const e = document.createElement('span'); e.className = 'poca'; e.textContent = '💧'; e.style.left = (pet.x + pet.s / 2) + 'px'; e.style.top = (innerHeight - extraChao - 18) + 'px'; raiz.appendChild(e); setTimeout(() => e.remove(), 6000); }
    if(t === 3 && anda && Math.random() < dt * .35){ const e = document.createElement('span'); e.className = 'poca'; e.textContent = sorte(['🌸', '🌼', '🌷']); e.style.left = (pet.x + pet.s / 2) + 'px'; e.style.top = (innerHeight - extraChao - 22) + 'px'; raiz.appendChild(e); setTimeout(() => e.remove(), 9000); }
    if(t === 17 && anda && Math.random() < dt * .8) efeito(pet, '✨', 1);
    if(t === 4 && agora - ultChoque > 9000 && agora - mouse.quando < 300 && Math.hypot(mouse.x - (pet.x + pet.s / 2), mouse.y - (pet.y + pet.s / 2)) < pet.s * 1.1){
      ultChoque = agora; const z = document.createElement('span'); z.className = 'zap'; z.textContent = '⚡'; z.style.left = (mouse.x - 16) + 'px'; z.style.top = (mouse.y - 16) + 'px'; raiz.appendChild(z); setTimeout(() => z.remove(), 600);
      falar(pet, 'Bzzzt! Choquinho! ⚡😆', 1400);
    }
    pet.el.classList.toggle('fantasma', t === 13 && anda && Math.sin(agora / 900) > .4);
  }
  /* 😢 com fome chora, 😤 sem carinho fica bravo, 🥱 bocejo pega */
  setInterval(() => {
    if(document.hidden || jogo || luta) return;
    pets.forEach(p => { if(!p.dentro && p.nec.fome < 15 && !['dormir', 'irCama'].includes(p.estado) && Math.random() < .25){ efeito(p, '💧', 2); falar(p, sorte(['Buááá… tô com fome 😭', 'Snif… comida? 😢']), 2200); } });
    if(Date.now() - ultimoCarinho > 10 * 60000 && Math.random() < .3){ const p = amigo(); if(p){ efeito(p, '💢', 1); falar(p, sorte(['Ninguém brinca comigo! 😤', 'Hmpf! 😤 Me dá atenção!', 'Tô bravo! 😠']), 2400); } }
  }, 15000);
  function bocejar(pet){ pets.filter(q => q !== pet && !q.dentro && Math.abs(q.x - pet.x) < 400 && ['parado', 'sentar', 'andar'].includes(q.estado)).forEach((q, i) => setTimeout(() => { if(Math.random() < .5){ q.estado = 'espreguicar'; q.ate = performance.now() + 1500; falar(q, '🥱 (o bocejo pegou!)', 1500); } }, 1200 + i * 400)); }

  /* ======================================================================
     🎃 DATAS ESPECIAIS
     ====================================================================== */
  function pascoa(ano){ const a = ano % 19, b = Math.floor(ano / 100), c = ano % 100, d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451), mes = Math.floor((h + l - 7 * m + 114) / 31), dia = ((h + l - 7 * m + 114) % 31) + 1; return new Date(ano, mes - 1, dia); }
  function dataDeHoje(){
    const d = new Date(), m = d.getMonth() + 1, dia = d.getDate();
    if((m === 12 && dia === 31) || (m === 1 && dia === 1)) return 'anonovo';
    if(m === 12 && dia >= 15) return 'natal';
    if(m === 10 && dia >= 24) return 'halloween';
    if(m === 10 && dia >= 10 && dia <= 12) return 'criancas';
    if(m === 6) return 'junina';
    if(Math.abs(d - pascoa(d.getFullYear())) < 4 * 864e5) return 'pascoa';
    return '';
  }
  const DATAS = { halloween:['🎃 Feliz Halloween!', ['🎃', '🦇', '👻', '🕸️'], '🧙'], natal:['🎄 Feliz Natal!', ['🎄', '🎁', '⛄', '🦌'], '🎅'], pascoa:['🐰 Feliz Páscoa!', ['🥚', '🐰', '🍫', '🐣'], '🐰'],
    criancas:['🎈 Feliz Dia das Crianças!', ['🎈', '🎁', '🪁', '🧸'], '🥳'], junina:['🎏 Festa Junina!', ['🎏', '🌽', '🔥', '🍿'], '👒'], anonovo:['🎆 Feliz Ano Novo!', ['🎆', '🎇', '🥂', '✨'], '🥳'] };
  let decoracao = null, previa = -1;
  function mostrarData(qual, temporario){
    if(decoracao){ decoracao.remove(); decoracao = null; }
    if(!qual || !DATAS[qual] || !cfg.ligado) return;
    const [titulo, coisas] = DATAS[qual];
    const d = document.createElement('div'); d.className = 'decoracao ' + qual;
    d.innerHTML = (qual === 'junina' ? '<div class="bandeirinhas">' + '🎏'.repeat(12) + '</div>' : '') + coisas.concat(coisas).map((c, i) => `<b style="left:${6 + i * 12}%">${c}</b>`).join('') + `<div class="faixa-data">${titulo}</div>`;
    raiz.prepend(d); decoracao = d;
    d.querySelectorAll('b').forEach(b => { b.style.bottom = (extraChao + 2) + 'px'; });
    if(qual === 'pascoa') esconderOvinhos();
    if(qual === 'anonovo') for(let i = 0; i < 6; i++) setTimeout(() => { const f = document.createElement('span'); f.className = 'raio'; f.textContent = sorte(['🎆', '🎇']); f.style.left = (10 + Math.random() * 80) + 'vw'; f.style.top = (5 + Math.random() * 30) + 'vh'; raiz.appendChild(f); setTimeout(() => f.remove(), 700); }, i * 700);
    pets.forEach((p, i) => setTimeout(() => falar(p, titulo, 2400), i * 300));
    if(temporario) setTimeout(() => { if(decoracao === d){ d.remove(); decoracao = null; } mostrarData(dataDeHoje()); }, 9000);
  }
  function esconderOvinhos(){
    for(let i = 0; i < 4; i++){
      const o = document.createElement('span'); o.className = 'ovinho-pascoa clicavel'; o.textContent = '🥚'; o.title = 'Ovo de chocolate!';
      o.style.left = (8 + Math.random() * 84) + 'vw'; o.style.top = (innerHeight - extraChao - 30 - Math.random() * 200) + 'px';
      o.addEventListener('pointerdown', ev => { ev.preventDefault(); ev.stopPropagation(); o.textContent = '🍫'; ganharMoedas(5); torcer('Achou um ovo de chocolate! 🍫😋', 1600); setTimeout(() => o.remove(), 900); });
      raiz.appendChild(o); setTimeout(() => o.remove(), 120000);
    }
  }
  setTimeout(() => mostrarData(dataDeHoje()), 5000);

  /* ======================================================================
     🤪 PARTE 6: banana, confete, Psyduck tonto e mais jogos
     ====================================================================== */
  const bananas = [];
  function soltarBanana(pet){
    const b = document.createElement('span'); b.className = 'banana'; b.textContent = '🍌';
    const x = Math.max(10, Math.min(innerWidth - 40, pet.x + pet.s / 2 + pet.dir * pet.s)); b.style.left = x + 'px'; b.style.top = (innerHeight - extraChao - 26) + 'px';
    raiz.appendChild(b); bananas.push({ el:b, x, ate:Date.now() + 40000 });
  }
  function conferirBananas(pet, agora){
    for(let i = bananas.length - 1; i >= 0; i--){
      const b = bananas[i];
      if(Date.now() > b.ate){ b.el.remove(); bananas.splice(i, 1); continue; }
      if(['andar', 'correr', 'skate', 'carro'].includes(pet.estado) && Math.abs(pet.x + pet.s / 2 - b.x - 13) < pet.s * .25 && pet.y >= chao(pet) - 2){
        b.el.remove(); bananas.splice(i, 1); tirarProps(pet);
        pet.estado = 'escorregar'; pet.ate = agora + 1200; pet.giroEsc = 0;
        falar(pet, sorte(['Uoooooh! 🍌😵', 'Escorreguei! 🍌🤣', 'AAAI! 🍌💫']), 1800);
      }
    }
  }
  function confete(){ for(let i = 0; i < 30; i++) setTimeout(() => { const c = document.createElement('span'); c.className = 'confete'; c.textContent = sorte(['🎉', '🎊', '⭐', '🟥', '🟨', '🟦', '🟩']); c.style.left = (Math.random() * 100) + 'vw'; c.style.animationDuration = (3 + Math.random() * 3) + 's'; raiz.appendChild(c); setTimeout(() => c.remove(), 6500); }, i * 80); torcer('Uêba! Confete! 🎉', 1800); }
  /* 🌟 Show de talentos (você dá a nota) */
  function jogoShow(){
    const corpo = abrirCartao('🌟 Show de talentos'), p = amigo(); if(!p){ fecharCartao(); return; }
    jogo = { tipo:'show', cartao:true }; const j = jogo;
    const numero = sorte(['dança', 'música', 'cambalhota', 'golpe']);
    corpo.innerHTML = `<p class="grande-txt">${esc(nomeDo(p))} vai fazer um número de ${numero}! 🎤</p><p class="dica-c">Assista e depois dê a nota!</p>`;
    if(p.dentro) sairDeCasa(p, '');
    const agora = performance.now();
    if(numero === 'dança'){ p.estado = 'dancar'; p.ate = agora + 4000; }
    if(numero === 'música'){ cantar(p, agora, 4200, letraDe(p)); tocar(MUSICA, 130); }
    if(numero === 'cambalhota'){ maisAtividade(p, agora, 'cambalhota'); setTimeout(() => { if(jogo === j) maisAtividade(p, performance.now(), 'cambalhota'); }, 1700); }
    if(numero === 'golpe') usarGolpe(p, agora);
    setTimeout(() => {
      if(jogo !== j) return;
      corpo.innerHTML = `<p class="grande-txt">Que nota você dá pro ${esc(nomeDo(p))}?</p><div class="ops tres">${[1, 2, 3, 4, 5].map(n => `<button type="button" data-nota="${n}">${'⭐'.repeat(n)}</button>`).join('')}</div>`;
      corpo.querySelector('.ops').style.gridTemplateColumns = '1fr';
      corpo.querySelector('.ops').addEventListener('click', ev => {
        const b = ev.target.closest('[data-nota]'); if(!b || jogo !== j) return; const n = +b.dataset.nota; jogo = null;
        falar(p, n >= 4 ? sorte(['Obrigadooo! 🥹💖', 'Eu sou uma estrela! 🌟']) : n >= 3 ? 'Vou treinar mais! 💪' : 'Buáá… 😢 Da próxima vai ser melhor!', 2400);
        if(n >= 4){ efeito(p, '🌟', 4); ganharXp(p, 2); }
        corpo.innerHTML = `<p class="grande-txt">Nota ${'⭐'.repeat(n)}!</p>`; botaoDeNovo(corpo, 'show');
      });
    }, 4800);
  }
  /* 🔤 Soletrar o nome do Pokémon */
  function jogoSoletrar(){
    const corpo = abrirCartao('🔤 Soletrar'), op = [];
    for(let id = 1; id <= 493; id++){ const n = nomeDe(id); if(/^[A-Za-z]{4,7}$/.test(n)) op.push(id); }
    const id = sorte(op), nome = nomeDe(id).toUpperCase(), letras = nome.split('').map((l, i) => [l, i]).sort(() => Math.random() - .5);
    jogo = { tipo:'soletrar', cartao:true, pos:0, erros:0 }; const j = jogo;
    corpo.innerHTML = `<img class="sombra-poke revelado" alt="" src="${BASE}home/${id}.png" /><p class="grande-txt" data-palavra>${'_ '.repeat(nome.length)}</p><div class="ops letras">${letras.map(([l, i]) => `<button type="button" data-l="${l}" data-i="${i}">${l}</button>`).join('')}</div>`;
    corpo.querySelector('.letras').addEventListener('click', ev => {
      const b = ev.target.closest('[data-l]'); if(!b || b.disabled || jogo !== j) return;
      if(b.dataset.l === nome[j.pos]){
        b.disabled = true; b.classList.add('certo'); j.pos++;
        corpo.querySelector('[data-palavra]').textContent = nome.slice(0, j.pos).split('').join(' ') + ' ' + '_ '.repeat(nome.length - j.pos);
        if(j.pos >= nome.length){ jogo = null; corpo.insertAdjacentHTML('beforeend', `<p class="grande-txt">🎉 ${esc(nomeDe(id))}! ${j.erros ? '' : 'Sem errar nada! 🏆'}</p>`); torcer('Você soletrou! 🔤🎉'); botaoDeNovo(corpo, 'soletrar'); }
      } else { j.erros++; b.animate([{ translate:'0 0' }, { translate:'-6px 0' }, { translate:'6px 0' }, { translate:'0 0' }], { duration:250 }); }
    });
  }
  /* 🧩 Quebra-cabeça deslizante 3x3 */
  function jogoQuebra(){
    const corpo = abrirCartao('🧩 Quebra-cabeça'), id = 1 + Math.floor(Math.random() * 493);
    let pecas = [0, 1, 2, 3, 4, 5, 6, 7, 8], vazio = 8;
    const vizinhos = v => [v - 3, v + 3, v % 3 ? v - 1 : -1, v % 3 < 2 ? v + 1 : -1].filter(x => x >= 0 && x < 9);
    for(let i = 0; i < 80; i++){ const n = sorte(vizinhos(vazio)); [pecas[vazio], pecas[n]] = [pecas[n], pecas[vazio]]; vazio = n; }
    jogo = { tipo:'quebra', cartao:true, movs:0 }; const j = jogo;
    const tela = () => {
      corpo.innerHTML = `<p class="dica-c">Clique numa peça do lado do espaço vazio · ${j.movs} movimentos</p><div class="quebra">${pecas.map((p, i) => p === 8 && jogo ? `<i data-q="${i}" class="vazio"></i>` : `<i data-q="${i}" style="background-image:url(${BASE}home/${id}.png);background-position:${(p % 3) * 50}% ${Math.floor(p / 3) * 50}%"></i>`).join('')}</div>`;
    };
    corpo.addEventListener('click', ev => {
      const t = ev.target.closest('[data-q]'); if(!t || jogo !== j) return;
      const i = +t.dataset.q; if(!vizinhos(vazio).includes(i)) return;
      [pecas[vazio], pecas[i]] = [pecas[i], pecas[vazio]]; vazio = i; j.movs++;
      if(pecas.every((p, k) => p === k)){ jogo = null; tela(); corpo.insertAdjacentHTML('beforeend', `<p class="grande-txt">🎉 Montou o ${esc(nomeDe(id))}!</p>`); torcer('Você montou! 🧩🎉'); botaoDeNovo(corpo, 'quebra'); return; }
      tela();
    });
    tela();
  }
  /* 🧱 Torre de blocos: solta na hora certa! */
  function jogoTorre(){
    const corpo = abrirCartao('🧱 Torre de blocos');
    jogo = { tipo:'torre', cartao:true, andares:[{ x:60, w:120 }], x:0, dir:1, w:120 }; const j = jogo;
    corpo.innerHTML = `<p class="dica-c">Aperte SOLTAR quando o bloco estiver em cima da torre! <b data-a>0</b>/10</p><div class="torre-area"></div><button type="button" class="grande" data-soltar>⬇️ SOLTAR</button>`;
    const area = corpo.querySelector('.torre-area');
    const desenhar = () => {
      area.innerHTML = j.andares.map((a, i) => `<i style="left:${a.x}px;width:${a.w}px;bottom:${i * 18}px;background:hsl(${i * 36} 80% 60%)"></i>`).join('') + (jogo ? `<i class="movel" style="left:${j.x}px;width:${j.w}px;bottom:${j.andares.length * 18}px"></i>` : '');
    };
    const t = setInterval(() => { if(jogo !== j) return; j.x += j.dir * (3 + j.andares.length * .4); if(j.x < 0 || j.x + j.w > 240){ j.dir *= -1; j.x = Math.max(0, Math.min(240 - j.w, j.x)); } desenhar(); }, 30);
    j.parar = () => clearInterval(t);
    corpo.querySelector('[data-soltar]').addEventListener('click', () => {
      if(jogo !== j) return;
      const topo = j.andares[j.andares.length - 1], esq = Math.max(topo.x, j.x), dir = Math.min(topo.x + topo.w, j.x + j.w);
      if(dir - esq <= 4){ jogo = null; j.parar(); desenhar(); corpo.querySelector('[data-a]').textContent = j.andares.length - 1; corpo.insertAdjacentHTML('beforeend', `<p class="grande-txt">💥 Caiu! ${j.andares.length - 1} andares</p>`); botaoDeNovo(corpo, 'torre'); return; }
      j.andares.push({ x:esq, w:dir - esq }); j.w = dir - esq; j.x = 0;
      corpo.querySelector('[data-a]').textContent = j.andares.length - 1;
      if(j.andares.length - 1 >= 10){ jogo = null; j.parar(); desenhar(); corpo.insertAdjacentHTML('beforeend', '<p class="grande-txt">🏆 Torre de 10 andares!</p>'); torcer('Que torre alta! 🏰😲'); botaoDeNovo(corpo, 'torre'); return; }
      desenhar();
    });
    desenhar();
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
  function criarSelvagem(idFixo){
    const s = TAMANHOS[cfg.tamanho], el = document.createElement('div'); el.className = 'pet selvagem';
    el.style.width = s + 'px'; el.style.height = s + 'px'; el.style.setProperty('--s', s + 'px');
    el.innerHTML = '<div class="sombra"></div><div class="corpo"><img alt="" draggable="false" /></div><div class="balao"></div>';
    raiz.appendChild(el);
    const w = { id:idFixo || 1 + Math.floor(Math.random() * 1025), shiny:!idFixo && Math.random() < .06, el, img:el.querySelector('img'), corpo:el.querySelector('.corpo'), balao:el.querySelector('.balao'), s, x:innerWidth + 10, y:0, dir:-1, selvagem:true, fala:0 };
    w.img.onerror = () => { if(w.img.src !== reserva(w)) w.img.src = reserva(w); };
    w.img.src = imagem(w, cfg.estilo);
    return w;
  }
  function barraVida(q){ const v = document.createElement('div'); v.className = 'vida'; v.innerHTML = '<b></b>'; q.el.appendChild(v); return v; }
  function iniciarBatalha(pet, lider){
    if(luta || jogo){ falar(pet, 'Agora não dá! Espera acabar 😅'); return; }
    if(pet.dentro) sairDeCasa(pet, '');
    const agora = performance.now();
    const outros = pets.filter(p => p !== pet && !p.dentro && !['arrastado', 'irCama', 'dormir', 'cair', 'subir', 'teto'].includes(p.estado));
    const selvagem = !!lider || !outros.length || Math.random() < .5;
    const b = selvagem ? criarSelvagem(lider && lider.id) : sorte(outros);
    if(lider){ b.lider = lider; b.forte = 1.1 + lider.k * .06; b.vidaMax = 120 + lider.k * 12; }
    pet.usouPocao = false; if(!b.selvagem) b.usouPocao = false;
    const mid = innerWidth / 2, S = pet.s;
    [pet, b].forEach((q, k) => {
      q.x = Math.max(0, Math.min(innerWidth - q.s, k ? mid + 40 : mid - S - 40)); q.y = chao(q); q.dir = k ? -1 : 1;
      if(!q.selvagem){ dormir(q, false); q.naCama = false; q.estado = 'batalha'; q.ate = agora + 1e9; q.menu.classList.remove('on'); }
      efeito(q, '💨', 2);
      q.vidaMax = q.selvagem ? (q.vidaMax || 100) : (q.gmax ? 150 : 100); q.vida = q.vidaMax; q.barra = barraVida(q);
    });
    luta = { a:pet, b, selvagem, lider };
    mostrarPlacar(lider ? `🏟️ ${lider.nome}: o líder usa ${nomeDe(b.id)}!` : selvagem ? `🌿 Um ${nomeDe(b.id)}${b.shiny ? ' ✨' : ''} selvagem apareceu!` : `⚔️ ${nomeDo(pet)} vs ${nomeDo(b)}!`);
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
      const forca = atk.selvagem ? (atk.forte || 1) : (1 + (nivelDe(atk) - 1) * .04) * (atk.mega ? 1.3 : 1) * (atk.gmax ? 1.5 : 1);
      const dano = Math.round((16 + Math.random() * 16) * (sup ? 1.5 : 1) * (crit ? 1.5 : 1) * forca);
      def.vida = Math.max(0, def.vida - dano);
      const b = def.barra.querySelector('b'); b.style.width = (def.vida / (def.vidaMax || 100) * 100) + '%'; const pc = def.vida / (def.vidaMax || 100); b.className = pc < .25 ? 'baixo' : pc < .55 ? 'meio' : '';
      def.corpo.animate([{ translate:'0 0' }, { translate:'-8px 0' }, { translate:'8px 0' }, { translate:'0 0' }], { duration:300 });
      efeito(def, '💥', 2);
      if(sup || crit) mostrarPlacar(`${e} ${nomeDo(atk)} usou ${nome}! ${sup ? 'É super efetivo! 💪' : ''}${crit ? ' Acerto crítico! ⭐' : ''}`);
      if(def.vida > 0 && def.vida < 35 && !def.selvagem && !def.usouPocao && cfg.mochila.pocao > 0){
        def.usouPocao = true; cfg.mochila.pocao--; salvarCfgDepois(); def.vida = Math.min(def.vidaMax || 100, def.vida + 50);
        setTimeout(() => { const bb = def.barra && def.barra.querySelector('b'); if(bb){ bb.style.width = (def.vida / (def.vidaMax || 100) * 100) + '%'; bb.className = ''; } efeito(def, '🧪', 2); mostrarPlacar(`🧪 ${nomeDo(def)} tomou uma Poção! +50 ❤️`); }, 500);
      }
      if(def.vida <= 0) setTimeout(() => fimBatalha(atk, def), 600);
      else setTimeout(() => turno(def, atk), 1100);
    };
  }
  function fimBatalha(venc, perd){
    if(!lutaOk()) return encerrarBatalha();
    const agora = performance.now();
    if(perd.selvagem) perd.desmaiado = true; else { perd.estado = 'desmaiado'; perd.ate = agora + 1e9; }
    falar(perd, '😵', 2000);
    if(!venc.selvagem){ contar('vitorias'); ganharMoedas(10, venc); venc.estado = 'dancar'; venc.ate = agora + 1e9; efeito(venc, '🏆', 1); efeito(venc, '⭐', 3); ganharXp(venc, 3); falar(venc, sorte(['Venci! 🏆', 'Uhuuu! 🎉', 'Ganhei! 😎']), 2200); }
    if(perd.selvagem && perd.lider){
      const L = perd.lider;
      if(!cfg.insignias.includes(L.k)){ cfg.insignias.push(L.k); ganharMoedas(50); conferirConquistas(); salvarCfg(); }
      mostrarPlacar(`🏅 Você ganhou a ${L.insignia} ${L.emoji}! (${cfg.insignias.length}/8 insígnias)`);
      efeito(venc, L.emoji, 4);
      setTimeout(() => { fugirSelvagem(perd); encerrarBatalha(4000); }, 2200);
    } else if(venc.selvagem && venc.lider){
      mostrarPlacar(`😵 O líder venceu! Treine mais (suba de nível) e tente de novo!`);
      setTimeout(() => { fugirSelvagem(venc); falar(perd, 'Vou treinar mais! 💪', 2400); encerrarBatalha(3000); }, 1500);
    } else if(perd.selvagem){
      mostrarPlacar(`🏆 ${nomeDo(venc)} venceu! Clique na Pokébola pra capturar o ${nomeDe(perd.id)}!`);
      const bola = document.createElement('div'); bola.className = 'pokebola clicavel'; bola.title = 'Capturar!';
      bola.style.left = Math.max(4, perd.x - 50) + 'px'; bola.style.top = (chao(perd) + perd.s - 48) + 'px';
      bola.addEventListener('pointerdown', ev => { ev.preventDefault(); ev.stopPropagation(); });
      bola.addEventListener('click', ev => { ev.stopPropagation(); capturar(bola, perd); });
      raiz.appendChild(bola); luta.bola = bola;
      luta.foge = setTimeout(() => { bola.remove(); mostrarPlacar(`💨 O ${nomeDe(perd.id)} acordou e fugiu!`); fugirSelvagem(perd); encerrarBatalha(2500); }, 15000);
    } else if(venc.selvagem && !venc.lider){
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
        cfg.pets.push({ id:w.id, shiny:w.shiny, desde:hoje() }); registrarDex(w.id); contar('capturas'); ganharMoedas(5); montar(false); salvarCfg();
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
    contar('jogos'); ganharMoedas(Math.min(20, 3 + (j.pontos || 0)));
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
    ['velha', '❌ Jogo da velha'], ['boca', '😋 Frutas na boca'], ['cobra', '🐍 Cobrinha'], ['show', '🌟 Show de talentos'], ['soletrar', '🔤 Soletrar'], ['quebra', '🧩 Quebra-cabeça'], ['torre', '🧱 Torre de blocos']];
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
    if(k === 'show') return jogoShow();
    if(k === 'soletrar') return jogoSoletrar();
    if(k === 'quebra') return jogoQuebra();
    if(k === 'torre') return jogoTorre();
    comecarJogo(k);
  }
  const amigo = () => sorte(pets.filter(p => !p.dentro)) || pets[0];
  const torcer = (t, ms) => { const p = amigo(); if(p) falar(p, t, ms || 1600); };
  function botaoDeNovo(corpo, k){
    contar('jogos'); ganharMoedas(5);
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
        if(coisa !== '🥾'){ j.pontos++; contar('pescados'); }
        if(poke) registrarDex(coisa);
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
    const prog = {}; PROG.forEach(k => { prog[k] = cfg[k]; });
    const c = limpa(Object.assign({}, nova, prog)), antes = cfg;
    if(c.dex.length > antes.dex.length) setTimeout(salvarCfgDepois, 0);
    const tudo = JSON.stringify([c.tamanho, c.estilo, c.ligado]) !== JSON.stringify([antes.tamanho, antes.estilo, antes.ligado]);
    const mudouPets = JSON.stringify(c.pets) !== JSON.stringify(antes.pets);
    cfg = c;
    if(tudo || mudouPets) montar(tudo);
    else { montarCama(); montarOvos(); }
    pets.forEach(desenharNec); desenharCasa();
    if(c.ligado !== antes.ligado) encherCeu();
    montarCena();
    if(c.clima !== antes.clima && ceu.cv){ const t = climaAgora(); if(t !== ceu.tipo) mudouClima(t, true); }
    if(c.evento && (!antes.evento || c.evento.q !== antes.evento.q) && Math.abs(Date.now() - c.evento.q) < 20000) evento(c.evento.t);
    if(c.ima !== antes.ima && !c.ima) pets.forEach(p => { if(p.estado === 'ima'){ p.estado = 'cair'; p.vx = 0; p.vy = 0; } });
    atualizarNoite();
    if(c.festa !== antes.festa && Math.abs(Date.now() - c.festa) < 20000) festa();
    else if(JSON.stringify(c.aniver) !== JSON.stringify(antes.aniver) && ehAniver()) festa();
  }
  function comecar(inicial){
    cfg = limpa(inicial); juntar(); montarCeu(); montar(true); montarCena(); mudouClima(climaAgora(), false); requestAnimationFrame(quadro);
    addEventListener('resize', () => { pets.forEach(p => { p.x = Math.min(p.x, Math.max(0, innerWidth - p.s)); }); tamanhoCeu(); posicionarOvos(); montarCena(); });
  }
  if(naExtensao){
    chrome.storage.local.get(['andarilho', 'andarilhoNec', 'andarilhoProg'], r => { necSalvas = (r && r.andarilhoNec) || {}; comecar(Object.assign({}, r && r.andarilho, r && r.andarilhoProg)); });
    chrome.storage.onChanged.addListener((mud, area) => { if(area !== 'local') return; if(mud.andarilhoProg) receberProg(mud.andarilhoProg.newValue); if(mud.andarilho) aplicar(mud.andarilho.newValue); });
  } else {
    let salvo = null; try{ salvo = Object.assign({}, JSON.parse(localStorage.getItem('andarilho:cfg') || 'null'), JSON.parse(localStorage.getItem('andarilho:prog') || 'null')); necSalvas = JSON.parse(localStorage.getItem('andarilho:nec') || '{}') || {}; }catch(e){}
    comecar(salvo);
    addEventListener('andarilho-cfg', ev => aplicar(ev.detail));
    addEventListener('storage', ev => { try{ if(ev.key === 'andarilho:cfg') aplicar(JSON.parse(ev.newValue)); if(ev.key === 'andarilho:prog') receberProg(JSON.parse(ev.newValue)); }catch(e){} });
  }
  window.andarilhoPets = () => pets;
  window.andarilhoResgatar = () => resgatar(true);
  window.andarilhoSilencio = () => { cfg.som = !cfg.som; salvarCfg(); return cfg.som; };
  /* Eventos que acontecem de vez em quando, e o aniversário de cada Pokémon (o dia em que ele chegou). */
  setInterval(() => {
    if(document.hidden || !cfg.ligado || jogo || luta) return;
    const r = Math.random();
    if(r < .03) aranha(); else if(r < .06) aviao(); else if(r < .07) confete();
  }, 60000);
  let aniversariosVistos = '';
  setInterval(() => {
    if(document.hidden || aniversariosVistos === hoje()) return; aniversariosVistos = hoje();
    const [a, m, d] = hoje().split('-');
    pets.forEach((p, i) => { if(p.desde && p.desde.slice(5) === `${m}-${d}` && p.desde.slice(0, 4) < a) setTimeout(() => { efeito(p, '🎂', 2); efeito(p, '🎉', 4); falar(p, `Hoje faz ${a - p.desde.slice(0, 4)} ano(s) que eu cheguei! 🎂🥳`, 3500); p.estado = 'dancar'; p.ate = performance.now() + 4000; }, 6000 + i * 1500); });
  }, 30000);
})();
