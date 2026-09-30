/* Painel de escolha do Pokémon Andarilho. O mesmo arquivo serve pro menu da extensão e pro site.
   Na extensão guarda no chrome.storage (e o Pokémon muda na hora em todos os sites abertos);
   no site guarda no localStorage e avisa a página. */
(() => {
  const $ = id => document.getElementById(id);
  const naExtensao = typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local;
  const PADRAO = { ligado:true, pets:[{ id:25, shiny:false }], tamanho:'M', som:true, seguir:false, estilo:'3d' };
  const MAX = 3;
  const mini = id => `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${id}.png`;
  const semAcento = t => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
  const FAVORITOS = [25, 133, 94, 150, 151, 143, 39, 54, 4, 7, 1, 6, 658, 448, 778, 700, 197, 908, 906, 393, 175, 52, 384, 249];
  let cfg = JSON.parse(JSON.stringify(PADRAO));

  function carregar(pronto){
    if(naExtensao) chrome.storage.local.get('andarilho', r => { cfg = Object.assign({}, PADRAO, r && r.andarilho); pronto(); });
    else { try{ cfg = Object.assign({}, PADRAO, JSON.parse(localStorage.getItem('andarilho:cfg') || 'null')); }catch(e){} pronto(); }
  }
  function salvar(){
    if(naExtensao) chrome.storage.local.set({ andarilho:cfg });
    else { try{ localStorage.setItem('andarilho:cfg', JSON.stringify(cfg)); }catch(e){} window.dispatchEvent(new CustomEvent('andarilho-cfg', { detail:JSON.parse(JSON.stringify(cfg)) })); }
    desenhar();
  }
  function desenhar(){
    $('ligado').checked = cfg.ligado; $('som').checked = cfg.som; $('seguir').checked = cfg.seguir;
    $('tamanho').value = cfg.tamanho; $('estilo').value = cfg.estilo;
    $('meus').innerHTML = cfg.pets.map((p, i) => `<div class="meu"><img src="${mini(p.id)}" alt="" /><b>${esc(ANDARILHO_NOMES[p.id - 1])}${p.shiny ? ' ✨' : ''}</b>
      <button type="button" data-shiny="${i}" title="Shiny">${p.shiny ? '✨ shiny' : '☆ normal'}</button>${cfg.pets.length > 1 ? `<button type="button" data-tirar="${i}" title="Tirar">✖️</button>` : ''}</div>`).join('');
    $('dica-meus').textContent = cfg.pets.length < MAX ? `Toque num Pokémon lá embaixo pra ele vir junto (até ${MAX}).` : `Já tem ${MAX}! Toque num lá embaixo pra trocar o último.`;
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
    ['tamanho', 'estilo'].forEach(k => $(k).addEventListener('change', () => { cfg[k] = $(k).value; salvar(); }));
    $('busca').addEventListener('input', buscar);
    $('resultados').addEventListener('click', ev => {
      const b = ev.target.closest('[data-id]'); if(!b) return;
      const p = { id:+b.dataset.id, shiny:false };
      if(cfg.pets.length < MAX) cfg.pets.push(p); else cfg.pets[MAX - 1] = p;
      salvar();
    });
    $('meus').addEventListener('click', ev => {
      const s = ev.target.closest('[data-shiny]'), t = ev.target.closest('[data-tirar]');
      if(s){ const p = cfg.pets[+s.dataset.shiny]; p.shiny = !p.shiny; salvar(); }
      if(t){ cfg.pets.splice(+t.dataset.tirar, 1); salvar(); }
    });
  }
  carregar(() => { ligar(); desenhar(); buscar(); });
})();
