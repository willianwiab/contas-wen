/* Painel de escolha do Pokémon Andarilho. O mesmo arquivo serve pro menu da extensão e pro site.
   Na extensão guarda no chrome.storage (e o Pokémon muda na hora em todos os sites abertos);
   no site guarda no localStorage e avisa a página. */
(() => {
  const $ = id => document.getElementById(id);
  const naExtensao = typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local;
  const PADRAO = { ligado:true, pets:[{ id:25, shiny:false }], tamanho:'M', som:true, seguir:false, estilo:'3d',
    ovos:[], evoluir:true, casa:'cama', cor:'azul', clima:'auto', aniver:null, festa:0 };
  const MAX = 10, MAX_OVOS = 3, CHOCAR = 60000;
  const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  const CORES = [['azul', '🔵 Azul'], ['rosa', '🩷 Rosa'], ['verde', '🟢 Verde'], ['amarelo', '🟡 Amarelo'], ['roxo', '🟣 Roxo'], ['vermelho', '🔴 Vermelho'], ['laranja', '🟠 Laranja']];
  let modoOvo = false, editando = -1;
  const hoje = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
  const dexAdd = () => {};
  const codigoDe = p => { const n = p.id * 2 + (p.shiny ? 1 : 0), c = (n * 7919 + 13) % 1296; return `TROCA-${n.toString(36).toUpperCase()}-${c.toString(36).toUpperCase().padStart(2, '0')}`; };
  const lerCodigo = t => { const m = /TROCA-([0-9A-Z]{1,4})-([0-9A-Z]{2})/i.exec(String(t).trim()); if(!m) return null; const n = parseInt(m[1], 36), c = parseInt(m[2], 36); if((n * 7919 + 13) % 1296 !== c) return null; const id = n >> 1; return id >= 1 && id <= 1025 ? { id, shiny:!!(n & 1) } : null; };
  const limpaApelido = t => Array.from(String(t || '').replace(/[<>&"'`\\{}\[\]\u0000-\u001f]/g, '').trim()).slice(0, 14).join('');
  function salvarApelido(i){
    const inp = document.querySelector(`[data-apelido="${i}"]`), p = cfg.pets[i];
    if(inp && p){ const ap = limpaApelido(inp.value); if(ap) p.apelido = ap; else delete p.apelido; }
    editando = -1; if(inp) inp.blur(); salvar();
  }
  const total = () => cfg.pets.length + (cfg.ovos || []).length;
  /* As opções novas entram aqui (assim o menu da extensão, o site e o programa ganham elas juntos). */
  function montarExtras(){
    const op = document.querySelector('.painel .opcoes'); if(!op || $('casa')) return;
    op.insertAdjacentHTML('beforeend', `
      <label>Dorme na <select id="casa"><option value="cama">🛏️ Caminha</option><option value="casa">🏠 Casinha</option><option value="castelo">🏰 Castelo</option><option value="barraca">⛺ Barraca</option></select></label>
      <label>Cor <select id="cor">${CORES.map(([v, t]) => `<option value="${v}">${t}</option>`).join('')}</select></label>
      <label>Clima <select id="clima"><option value="auto">🔄 Muda sozinho</option><option value="sol">☀️ Sol</option><option value="chuva">🌧️ Chuva</option><option value="tempestade">⛈️ Tempestade</option><option value="neve">❄️ Neve</option><option value="vento">🌪️ Ventania</option><option value="nada">🚫 Sem clima</option></select></label>
      <label><input type="checkbox" id="evoluir" /> 🌟 Evoluir</label>
      <label><input type="checkbox" id="ima" /> 🧲 Ímã no mouse</label>
      <label><input type="checkbox" id="voz" /> 🔊 Falar com voz</label>
      <label>Lugar <select id="lugar"><option value="nada">🖥️ Nenhum</option><option value="praia">🏖️ Praia</option><option value="montanha">🏔️ Montanha</option><option value="espaco">🌌 Espaço</option><option value="mar">🌊 Fundo do mar</option><option value="floresta">🌳 Floresta</option><option value="cidade">🏙️ Cidade</option></select></label>
      <label><input type="checkbox" id="trem" /> 🚂 Trenzinho</label>
      <label><input type="checkbox" id="arvore" /> 🌳 Árvore</label>
      <label><input type="checkbox" id="jardim" /> 🌻 Jardim</label>
      <label><input type="checkbox" id="especiais" /> ⚡ Poderes dos tipos</label>
      <label><input type="checkbox" id="amizade" /> 🤝 Amizade</label>
      <label><input type="checkbox" id="escuro" /> 🌗 Modo escuro</label>
      <div class="eventos" style="grid-column:1/-1">Agora: <button type="button" data-evento="ventania">🌪️ Ventania</button><button type="button" data-evento="terremoto">🌋 Terremoto</button><button type="button" data-evento="trovao">⛈️ Trovão</button><button type="button" data-evento="balao">🎈 Balões</button><button type="button" data-evento="pum">💨 Pum</button><button type="button" data-evento="fliperama">🕹️ Fliperama</button><button type="button" data-evento="chamar">🆘 Chamar os Pokémon</button>
        <button type="button" data-evento="central">🎒 Loja e ginásio</button><button type="button" data-evento="datas">🎃 Datas especiais</button><button type="button" data-evento="aviao">✈️ Avião</button><button type="button" data-evento="trem">🚂 Trem</button>
        <button type="button" data-evento="aranha">🕷️ Aranha</button><button type="button" data-evento="piquenique">🧺 Piquenique</button><button type="button" data-evento="abraco">🤗 Abraço</button><button type="button" data-evento="confete">🎉 Confete</button></div>
      <div class="aniver" style="grid-column:1/-1">🎂 Meu aniversário:
        <select id="aniver-d" aria-label="Dia"><option value="">dia</option>${Array.from({ length:31 }, (_, i) => `<option value="${i + 1}">${i + 1}</option>`).join('')}</select>
        de <select id="aniver-m" aria-label="Mês"><option value="">mês</option>${MESES.map((m, i) => `<option value="${i + 1}">${m}</option>`).join('')}</select>
        <button type="button" id="festa">🎉 Testar festa</button></div>`);
    $('meus').insertAdjacentHTML('afterend', '<div class="meus ovos" id="ovos"></div>');
    op.insertAdjacentHTML('beforebegin', '<p class="saldo-p" id="saldo"></p>');
    const t = $('tamanho'); if(t && !t.querySelector('[value="PP"]')){ t.insertAdjacentHTML('afterbegin', '<option value="PP">Mini</option>'); t.insertAdjacentHTML('beforeend', '<option value="GG">Gigante</option>'); }
    document.querySelector('.painel').insertAdjacentHTML('beforeend', `
      <h3>📝 Bloco de notas</h3><textarea id="notas" class="notas" maxlength="500" rows="3" placeholder="Escreva aqui… os Pokémon vão ler! (não escreva seu nome, endereço ou telefone)"></textarea>
      <h3>🔁 Trocar com um amigo</h3>
      <p class="dica">Troque só com amigos que você conhece de verdade! 🛡️</p>
      <div class="troca"><select id="troca-pet" aria-label="Pokémon pra trocar"></select><button type="button" id="troca-gerar">📤 Gerar código</button></div>
      <p class="codigo" id="troca-codigo"></p>
      <div class="troca"><input id="troca-receber" class="busca" placeholder="Cole o código do amigo (TROCA-...)" autocomplete="off" /><button type="button" id="troca-ok">📥 Receber</button></div>
      <p class="dica" id="troca-msg"></p>
      <h3>📖 Pokédex <small id="dex-n"></small></h3><div class="dex" id="dex"></div>`);
    $('busca').insertAdjacentHTML('beforebegin', `<div class="modo"><button type="button" id="modo-junto" class="on">➕ Vem junto</button><button type="button" id="modo-ovo">🥚 Vira ovo</button><button type="button" id="ovo-surpresa">🎁 Ovo surpresa</button></div>`);
  }
  const mini = id => `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${id}.png`;
  const semAcento = t => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
  const FAVORITOS = [25, 133, 94, 150, 151, 143, 39, 54, 4, 7, 1, 6, 658, 448, 778, 700, 197, 908, 906, 393, 175, 52, 384, 249];
  let cfg = JSON.parse(JSON.stringify(PADRAO)), prog = {};
  const PROG = ['moedas', 'estrelas', 'mochila', 'insignias', 'dex', 'cont', 'conquistas', 'missoes', 'seq', 'presenteDia'];
  const semProg = c => { const o = Object.assign({}, c); PROG.forEach(k => { delete o[k]; }); return o; };

  function carregar(pronto){
    if(naExtensao) chrome.storage.local.get(['andarilho', 'andarilhoProg'], r => { cfg = semProg(Object.assign({}, PADRAO, r && r.andarilho)); prog = (r && r.andarilhoProg) || {}; pronto(); });
    else { try{ cfg = semProg(Object.assign({}, PADRAO, JSON.parse(localStorage.getItem('andarilho:cfg') || 'null'))); prog = JSON.parse(localStorage.getItem('andarilho:prog') || 'null') || {}; }catch(e){} pronto(); }
  }
  function salvar(){
    if(naExtensao) chrome.storage.local.set({ andarilho:cfg });
    else { try{ localStorage.setItem('andarilho:cfg', JSON.stringify(cfg)); }catch(e){} window.dispatchEvent(new CustomEvent('andarilho-cfg', { detail:JSON.parse(JSON.stringify(cfg)) })); }
    desenhar();
  }
  function desenhar(){
    $('ligado').checked = cfg.ligado; $('som').checked = cfg.som; $('seguir').checked = cfg.seguir;
    $('tamanho').value = cfg.tamanho; $('estilo').value = cfg.estilo;
    $('lugar').value = cfg.lugar || 'nada'; ['trem', 'arvore', 'jardim', 'escuro'].forEach(k => { $(k).checked = !!cfg[k]; }); ['especiais', 'amizade'].forEach(k => { $(k).checked = cfg[k] !== false; });
    document.body.classList.toggle('escuro', !!cfg.escuro);
    $('saldo').textContent = `🪙 ${prog.moedas || 0} moedas · ⭐ ${prog.estrelas || 0} estrelas · 🏅 ${(prog.insignias || []).length}/8 insígnias`;
    if(document.activeElement !== $('notas')) $('notas').value = cfg.notas || '';
    const dex = [...new Set((prog.dex || []).concat(cfg.pets.map(p => p.id)))].sort((a, b) => a - b); $('dex-n').textContent = `(${dex.length} de 1025)`;
    if($('dex').dataset.n !== String(dex.length)){ $('dex').dataset.n = dex.length; $('dex').innerHTML = dex.map(id => `<span title="#${id} ${esc(ANDARILHO_NOMES[id - 1])}"><img loading="lazy" src="${mini(id)}" alt="" /><small>#${id}</small></span>`).join('') || '<p class="dica">Os Pokémon que você tiver aparecem aqui!</p>'; }
    const sel = $('troca-pet'), v = sel.value; sel.innerHTML = cfg.pets.map((p, i) => `<option value="${i}">${esc(p.apelido || ANDARILHO_NOMES[p.id - 1])}${p.shiny ? ' ✨' : ''}</option>`).join(''); if(v && +v < cfg.pets.length) sel.value = v;
    $('casa').value = cfg.casa; $('cor').value = cfg.cor; $('clima').value = cfg.clima; $('evoluir').checked = cfg.evoluir !== false; $('ima').checked = !!cfg.ima; $('voz').checked = !!cfg.voz;
    if(cfg.aniver){ $('aniver-d').value = cfg.aniver.d; $('aniver-m').value = cfg.aniver.m; }
    $('modo-junto').classList.toggle('on', !modoOvo); $('modo-ovo').classList.toggle('on', modoOvo);
    desenharOvos();
    if(document.activeElement && document.activeElement.classList.contains('apelido')) return;
    $('meus').innerHTML = cfg.pets.map((p, i) => `<div class="meu"><img src="${mini(p.id)}" alt="" />${editando === i
        ? `<input class="apelido" data-apelido="${i}" maxlength="14" value="${esc(p.apelido || '')}" placeholder="${esc(ANDARILHO_NOMES[p.id - 1])}" aria-label="Apelido" />`
        : `<b>${p.roupa ? p.roupa + ' ' : ''}${esc(p.apelido || ANDARILHO_NOMES[p.id - 1])}${p.apelido ? ` <small>(${esc(ANDARILHO_NOMES[p.id - 1])})</small>` : ''}${p.shiny ? ' ✨' : ''}</b>`}
      <button type="button" data-nome="${i}" title="Dar um apelido">${editando === i ? '✅' : '✏️'}</button>
      <button type="button" data-shiny="${i}" title="Shiny">${p.shiny ? '✨' : '☆'}</button>${cfg.pets.length > 1 ? `<button type="button" data-tirar="${i}" title="Tirar">✖️</button>` : ''}</div>`).join('');
    $('dica-meus').textContent = modoOvo
      ? (cfg.ovos.length >= MAX_OVOS ? `Já tem ${MAX_OVOS} ovos chocando! Espera nascer. 🥚` : total() >= MAX ? `Já tem ${MAX} Pokémon! Tire um pra caber o ovo.` : 'Toque num Pokémon lá embaixo pra ele vir num ovo 🥚 (nasce em 1 minuto).')
      : cfg.pets.length < MAX ? `Toque num Pokémon lá embaixo pra ele vir junto (até ${MAX}).` : `Já tem ${MAX}! Toque num lá embaixo pra trocar o último.`;
  }
  function desenharOvos(){
    const agora = Date.now();
    $('ovos').innerHTML = (cfg.ovos || []).map((o, i) => {
      const falta = Math.max(0, Math.ceil((o.ate - agora) / 1000));
      return `<div class="meu ovo"><span class="ovinho">🥚</span><b>${o.surpresa ? 'Ovo surpresa ❓' : esc(ANDARILHO_NOMES[o.id - 1])}</b><small>${falta ? `nasce em ${falta}s` : 'nascendo!'}</small><button type="button" data-tirar-ovo="${i}" title="Tirar o ovo">✖️</button></div>`;
    }).join('');
  }
  function porOvo(id, surpresa){
    if(cfg.ovos.length >= MAX_OVOS || total() >= MAX) return false;
    cfg.ovos.push({ id, shiny:Math.random() < (surpresa ? .1 : .02), surpresa:!!surpresa, ate:Date.now() + CHOCAR });
    return true;
  }
  function buscar(){
    const q = semAcento($('busca').value.trim());
    const lista = q ? ANDARILHO_NOMES.map((n, i) => [i + 1, n]).filter(([id, n]) => semAcento(n).includes(q) || String(id) === q).slice(0, 36)
                    : FAVORITOS.map(id => [id, ANDARILHO_NOMES[id - 1]]);
    $('resultados').innerHTML = lista.length ? lista.map(([id, n]) => `<button type="button" data-id="${id}" title="${esc(n)}"><img src="${mini(id)}" alt="" loading="lazy" /><small>${esc(n)}</small></button>`).join('')
      : '<p class="nada">Nenhum Pokémon com esse nome 🤔</p>';
  }
  function ligar(){
    ['ligado', 'som', 'seguir'].forEach(k => $(k).addEventListener('change', () => { cfg[k] = $(k).checked; salvar(); }));
    $('evoluir').addEventListener('change', () => { cfg.evoluir = $('evoluir').checked; salvar(); });
    ['ima', 'voz'].forEach(k => $(k).addEventListener('change', () => { cfg[k] = $(k).checked; salvar(); }));
    document.querySelector('.eventos').addEventListener('click', ev => { const b = ev.target.closest('[data-evento]'); if(b){ cfg.evento = { t:b.dataset.evento, q:Date.now() }; salvar(); } });
    ['trem', 'arvore', 'jardim', 'especiais', 'amizade', 'escuro'].forEach(k => $(k).addEventListener('change', () => { cfg[k] = $(k).checked; salvar(); }));
    let tNotas = 0; $('notas').addEventListener('input', () => { clearTimeout(tNotas); tNotas = setTimeout(() => { cfg.notas = $('notas').value.slice(0, 500); salvar(); }, 600); });
    $('troca-gerar').addEventListener('click', () => {
      const i = +$('troca-pet').value, p = cfg.pets[i]; if(!p) return;
      $('troca-codigo').innerHTML = `Código do ${esc(p.apelido || ANDARILHO_NOMES[p.id - 1])}: <b>${codigoDe(p)}</b> ${cfg.pets.length > 1 ? `<button type="button" id="troca-mandei">✅ Já mandei (tirar do meu time)</button>` : ''}`;
      const b = $('troca-mandei'); if(b) b.addEventListener('click', () => { if(cfg.pets[i] === p && cfg.pets.length > 1){ cfg.pets.splice(i, 1); $('troca-codigo').textContent = '👋 Tchau! Ele foi morar com seu amigo.'; salvar(); } });
    });
    $('troca-ok').addEventListener('click', () => {
      const r = lerCodigo($('troca-receber').value);
      if(!r){ $('troca-msg').textContent = '❌ Esse código não está certo. Confira as letras!'; return; }
      if(total() >= MAX){ $('troca-msg').textContent = `Seu time já tem ${MAX}! Tire um Pokémon primeiro.`; return; }
      cfg.pets.push({ id:r.id, shiny:r.shiny, desde:hoje() }); dexAdd(r.id); $('troca-receber').value = '';
      $('troca-msg').textContent = `🎉 Chegou um ${ANDARILHO_NOMES[r.id - 1]}${r.shiny ? ' ✨' : ''}!`; salvar();
    });
    ['tamanho', 'estilo', 'casa', 'cor', 'clima', 'lugar'].forEach(k => $(k).addEventListener('change', () => { cfg[k] = $(k).value; salvar(); }));
    $('busca').addEventListener('input', buscar);
    $('meus').addEventListener('keydown', ev => { const a = ev.target.closest('[data-apelido]'); if(!a) return; if(ev.key === 'Enter') salvarApelido(+a.dataset.apelido); if(ev.key === 'Escape'){ editando = -1; a.blur(); desenhar(); } });
    $('meus').addEventListener('focusout', ev => { const a = ev.target.closest('[data-apelido]'); if(a) setTimeout(() => { if(editando === +a.dataset.apelido) salvarApelido(+a.dataset.apelido); }, 150); });
    const aniver = () => { const d = +$('aniver-d').value, m = +$('aniver-m').value; cfg.aniver = d && m ? { d, m } : null; salvar(); };
    $('aniver-d').addEventListener('change', aniver); $('aniver-m').addEventListener('change', aniver);
    $('festa').addEventListener('click', () => { cfg.festa = Date.now(); salvar(); });
    $('modo-junto').addEventListener('click', () => { modoOvo = false; desenhar(); });
    $('modo-ovo').addEventListener('click', () => { modoOvo = true; desenhar(); });
    $('ovo-surpresa').addEventListener('click', () => { if(porOvo(1 + Math.floor(Math.random() * 1025), true)) salvar(); else { modoOvo = true; desenhar(); } });
    $('ovos').addEventListener('click', ev => { const t = ev.target.closest('[data-tirar-ovo]'); if(t){ cfg.ovos.splice(+t.dataset.tirarOvo, 1); salvar(); } });
    setInterval(() => { if((cfg.ovos || []).length) desenharOvos(); }, 1000);
    /* Quando um ovo choca ou um Pokémon evolui lá na tela, a lista daqui atualiza sozinha. */
    const veio = c => { if(c && typeof c === 'object'){ cfg = semProg(Object.assign({}, PADRAO, c)); desenhar(); } };
    const veioProg = c => { if(c && typeof c === 'object'){ prog = c; desenhar(); } };
    if(naExtensao) chrome.storage.onChanged.addListener((m, area) => { if(area !== 'local') return; if(m.andarilho) veio(m.andarilho.newValue); if(m.andarilhoProg) veioProg(m.andarilhoProg.newValue); });
    else {
      addEventListener('andarilho-cfg-pet', ev => veio(ev.detail));
      addEventListener('andarilho-prog', ev => veioProg(ev.detail));
      addEventListener('storage', ev => { try{ if(ev.key === 'andarilho:cfg') veio(JSON.parse(ev.newValue)); if(ev.key === 'andarilho:prog') veioProg(JSON.parse(ev.newValue)); }catch(e){} });
    }
    $('resultados').addEventListener('click', ev => {
      const b = ev.target.closest('[data-id]'); if(!b) return;
      if(modoOvo){ if(porOvo(+b.dataset.id, false)) salvar(); else desenhar(); return; }
      const p = { id:+b.dataset.id, shiny:false, desde:hoje() }; dexAdd(p.id);
      if(total() < MAX) cfg.pets.push(p); else cfg.pets[cfg.pets.length - 1] = p;
      salvar();
    });
    $('meus').addEventListener('click', ev => {
      const s = ev.target.closest('[data-shiny]'), t = ev.target.closest('[data-tirar]'), n = ev.target.closest('[data-nome]');
      if(n){ const i = +n.dataset.nome; if(editando === i) salvarApelido(i); else { editando = i; desenhar(); const inp = document.querySelector(`[data-apelido="${i}"]`); if(inp){ inp.focus(); inp.select(); } } return; }
      if(s){ const p = cfg.pets[+s.dataset.shiny]; p.shiny = !p.shiny; salvar(); }
      if(t){ cfg.pets.splice(+t.dataset.tirar, 1); salvar(); }
    });
  }
  carregar(() => { if(!Array.isArray(cfg.ovos)) cfg.ovos = []; montarExtras(); ligar(); desenhar(); buscar(); });
})();
