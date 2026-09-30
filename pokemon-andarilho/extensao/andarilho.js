/* Pokémon Andarilho — o Pokémon que fica andando por cima da página.
   Serve pra extensão (aparece em qualquer site) e pro site (aparece na própria página).
   Na extensão a configuração vem do chrome.storage; no site vem do localStorage.
   Tudo fica numa "shadow root", pra o CSS do site não bagunçar o Pokémon (e vice-versa). */
(() => {
  if(window.__andarilho) return;
  window.__andarilho = true;

  const naExtensao = typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local;
  const PADRAO = { ligado:true, pets:[{ id:25, shiny:false }], tamanho:'M', som:true, seguir:false, estilo:'3d' };
  const TAMANHOS = { P:72, M:110, G:160 };
  const voa = id => typeof ANDARILHO_VOA !== 'undefined' && ANDARILHO_VOA.has(id);
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
    c.pets = pets.slice(0, 3).map(p => ({ id:Math.max(1, Math.min(1025, Math.floor(+p.id) || 25)), shiny:!!p.shiny }));
    if(!c.pets.length) c.pets = [{ id:25, shiny:false }];
    if(!TAMANHOS[c.tamanho]) c.tamanho = 'M';
    if(!['3d', 'animado'].includes(c.estilo)) c.estilo = '3d';
    c.ligado = c.ligado !== false; c.som = c.som !== false; c.seguir = !!c.seguir;
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
    .zzz{position:absolute;right:-6px;top:0;font:800 18px system-ui,sans-serif;color:#5c7cfa;pointer-events:none;animation:zz 2s ease-in-out infinite}
    @keyframes zz{0%{transform:translate(0,10px);opacity:0}40%{opacity:1}100%{transform:translate(14px,-22px);opacity:0}}
    @media (prefers-reduced-motion: reduce){ .efeito,.zzz{animation-duration:.01ms} }
  </style>`;
  const juntar = () => { if(!host.isConnected) (document.body || document.documentElement).appendChild(host); };

  /* ---------- falas ---------- */
  const FALAS = [n => `${n}!`, () => 'Oi! 👋', () => '🎵🎶', () => 'Bora brincar?', () => 'Que site legal!', () => 'Tô com fome… 🍎', () => '😄', () => 'Hehe!',
    n => `Eu sou o ${n}!`, () => 'Olha eu aqui!', () => '✨', () => 'Me dá carinho? 🥺'];
  const sorte = a => a[Math.floor(Math.random() * a.length)];

  /* ---------- os Pokémon ---------- */
  let cfg = limpa(null), pets = [], mouse = { x:-999, y:-999, quando:performance.now() };
  function criarPet(p, i){
    const s = TAMANHOS[cfg.tamanho];
    const el = document.createElement('div'); el.className = 'pet';
    el.style.width = s + 'px'; el.style.height = s + 'px';
    el.innerHTML = `<div class="sombra"></div><div class="corpo"><img alt="" draggable="false" /></div><div class="balao"></div>`;
    const img = el.querySelector('img');
    img.src = imagem(p, cfg.estilo);
    /* Se o animado não existir (os mais novos), usa a foto 3D; se nem ela carregar (site que bloqueia imagens de fora), some. */
    img.onerror = () => { if(img.src !== reserva(p)) img.src = reserva(p); else el.style.display = 'none'; };
    raiz.appendChild(el);
    const pet = { ...p, el, img, corpo:el.querySelector('.corpo'), balao:el.querySelector('.balao'), s,
      x:Math.random() * Math.max(1, innerWidth - s), y:-s - i * 60, vx:0, vy:0, dir:Math.random() < .5 ? -1 : 1,
      estado:'cair', ate:0, passo:Math.random() * 10, zzz:null, fala:0 };
    ligarToques(pet);
    return pet;
  }
  function montar(){
    pets.forEach(p => p.el.remove()); pets = [];
    host.style.display = cfg.ligado ? '' : 'none';
    if(!cfg.ligado) return;
    pets = cfg.pets.map(criarPet);
  }
  function falar(pet, t, ms){
    pet.balao.textContent = t; pet.balao.classList.add('on');
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
    const r = Math.random();
    if(parado && r < .5){ pet.estado = 'dormir'; pet.ate = agora + 8000 + Math.random() * 10000; dormir(pet, true); return; }
    if(voa(pet.id) && r < .4){ pet.estado = 'voar'; pet.alvo = null; pet.ate = agora + 6000 + Math.random() * 8000; if(Math.random() < .4) falar(pet, sorte(['Vou voar! 🕊️', 'Lá do alto é mais bonito!', 'Wiiii! ✈️'])); return; }
    if(r < .45){ pet.estado = 'andar'; pet.dir = Math.random() < .5 ? -1 : 1; pet.ate = agora + 2000 + Math.random() * 4000; }
    else if(r < .7){ pet.estado = 'parado'; pet.ate = agora + 1500 + Math.random() * 3000; if(Math.random() < .25) falar(pet, sorte(FALAS)(nomeDe(pet.id))); }
    else if(r < .82){ pet.estado = 'correr'; pet.dir = Math.random() < .5 ? -1 : 1; pet.ate = agora + 1200 + Math.random() * 1500; }
    else if(r < .94){ pular(pet, 520 + Math.random() * 200); }
    else { pet.estado = 'dormir'; pet.ate = agora + 4000 + Math.random() * 5000; dormir(pet, true); }
  }
  /* Sobe pela parede da tela (lado -1 = esquerda, 1 = direita) até uma altura, e às vezes chega no teto. */
  function comecarSubir(pet, lado, agora){
    pet.estado = 'subir'; pet.lado = lado; pet.alvoY = Math.random() < .45 ? 0 : chao(pet) * (.15 + Math.random() * .5);
    falar(pet, sorte(['Vou escalar! 🧗', 'Subindo!', 'Ninguém me segura!']), 1500);
  }
  function pular(pet, forca){ pet.estado = 'cair'; pet.vy = -forca; pet.vx = pet.dir * (40 + Math.random() * 60); }

  /* ---------- arrastar, clicar, jogar longe ---------- */
  function ligarToques(pet){
    let ini = null, rastro = [];
    pet.el.addEventListener('pointerdown', ev => {
      ev.preventDefault(); ev.stopPropagation();
      try{ pet.el.setPointerCapture(ev.pointerId); }catch(e){}
      ini = { x:ev.clientX, y:ev.clientY, px:pet.x, py:pet.y, t:performance.now(), moveu:false }; rastro = [];
      pet.el.classList.add('pegado'); dormir(pet, false);
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
    const acordou = pet.estado === 'dormir';
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
      } else {
        pet.y = c;
        const v = pet.estado === 'correr' ? 190 : pet.estado === 'andar' ? 70 : 0;
        pet.x += pet.dir * v * dt;
        /* Chegou na beirada da tela: às vezes sobe pela parede! (quem voa não precisa) */
        const podeSubir = v > 0 && !voa(pet.id) && Math.random() < .45;
        if(pet.x <= 0){ pet.x = 0; if(podeSubir) comecarSubir(pet, -1, agora); else pet.dir = 1; }
        if(pet.x >= maxX){ pet.x = maxX; if(podeSubir) comecarSubir(pet, 1, agora); else pet.dir = -1; }
        if(agora >= pet.ate) escolher(pet, agora);
        /* Acorda se o mouse chegar pertinho. */
        if(pet.estado === 'dormir' && Math.hypot(mouse.x - (pet.x + pet.s / 2), mouse.y - (pet.y + pet.s / 2)) < pet.s * .8 && agora - mouse.quando < 200){
          dormir(pet, false); pet.estado = 'parado'; pet.ate = agora + 1500; falar(pet, '! 😲', 1200);
        }
      }
      /* Passinho: sobe e desce e inclina enquanto anda (a foto 3D não mexe sozinha). */
      const andando = ['andar', 'correr', 'subir', 'teto'].includes(pet.estado);
      pet.passo += dt * (pet.estado === 'correr' ? 16 : 9);
      const pulo = andando ? -Math.abs(Math.sin(pet.passo)) * pet.s * .07 : 0;
      /* Na parede fica deitado de lado (pés na parede); no teto fica de cabeça pra baixo; voando inclina. */
      const base = pet.estado === 'subir' ? (pet.lado < 0 ? 90 : -90) * (pet.dir > 0 ? -1 : 1) : pet.estado === 'teto' ? 180 : 0;
      const giro = base + (andando ? Math.sin(pet.passo) * 5 : pet.estado === 'voar' ? Math.sin(agora / 300) * 8 : 0);
      const respira = pet.estado === 'parado' || pet.estado === 'dormir' ? 1 + Math.sin(agora / (pet.estado === 'dormir' ? 700 : 400)) * .025 : 1;
      const olha = pet.estado === 'cair' || pet.estado === 'arrastado' ? (pet.vx > 0 ? 1 : pet.vx < 0 ? -1 : pet.dir) : pet.dir;
      pet.el.style.transform = `translate(${pet.x}px, ${pet.y}px)`;
      /* As fotos olham pra esquerda; andando pra direita, vira o espelho. */
      pet.corpo.style.transform = `translateY(${pulo}px) scaleX(${olha > 0 ? -1 : 1}) rotate(${giro}deg) scaleY(${respira})`;
      pet.el.classList.toggle('no-ar', pet.y < c - 2);
      pet.el.classList.toggle('sem-sombra', ['subir', 'teto', 'voar'].includes(pet.estado));
    }
    requestAnimationFrame(quadro);
  }

  /* Dois Pokémon pertinho às vezes fazem festa. */
  setInterval(() => {
    if(pets.length < 2) return;
    for(let i = 0; i < pets.length; i++) for(let j = i + 1; j < pets.length; j++)
      if(Math.abs(pets[i].x - pets[j].x) < pets[i].s * .7 && Math.random() < .3){ efeito(pets[i], '💞', 2); falar(pets[j], sorte(['Amigo! 💞', 'Oi, parceiro!', 'Vamos brincar juntos!'])); }
  }, 4000);

  /* ---------- configuração ---------- */
  function aplicar(nova){ const c = limpa(nova), refazer = JSON.stringify([c.pets, c.tamanho, c.estilo, c.ligado]) !== JSON.stringify([cfg.pets, cfg.tamanho, cfg.estilo, cfg.ligado]); cfg = c; if(refazer) montar(); }
  function comecar(inicial){
    cfg = limpa(inicial); juntar(); montar(); requestAnimationFrame(quadro);
    addEventListener('resize', () => pets.forEach(p => { p.x = Math.min(p.x, Math.max(0, innerWidth - p.s)); }));
  }
  if(naExtensao){
    chrome.storage.local.get('andarilho', r => comecar(r && r.andarilho));
    chrome.storage.onChanged.addListener((mud, area) => { if(area === 'local' && mud.andarilho) aplicar(mud.andarilho.newValue); });
  } else {
    let salvo = null; try{ salvo = JSON.parse(localStorage.getItem('andarilho:cfg') || 'null'); }catch(e){}
    comecar(salvo);
    addEventListener('andarilho-cfg', ev => aplicar(ev.detail));
    addEventListener('storage', ev => { if(ev.key === 'andarilho:cfg'){ try{ aplicar(JSON.parse(ev.newValue)); }catch(e){} } });
  }
  window.andarilhoPets = () => pets;
})();
