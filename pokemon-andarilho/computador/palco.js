/* Descobre se o mouse está em cima de um Pokémon (ou de um ovo, da casinha, de um presente). Se estiver, a janela pega o clique;
   se não, o clique passa pro programa de baixo. Enquanto arrasta, continua pegando. */
let pegando = false, apertado = false;
function conferir(x, y){
  const host = document.getElementById('pokemon-andarilho');
  const el = host && host.shadowRoot ? host.shadowRoot.elementFromPoint(x, y) : null;
  const sobre = !!(el && el.closest && el.closest('.pet, .clicavel'));
  const quer = sobre || apertado;
  if(quer !== pegando){ pegando = quer; window.andarilhoPC.mouse(quer); }
}
addEventListener('mousemove', ev => conferir(ev.clientX, ev.clientY));
addEventListener('mousedown', () => { apertado = true; });
addEventListener('mouseup', ev => { apertado = false; conferir(ev.clientX, ev.clientY); });
/* O Pokémon anda sozinho: confere de vez em quando mesmo sem mexer o mouse (senão ele passa por baixo do mouse e não pega o clique). */
let ultimo = { x:-1, y:-1 };
addEventListener('mousemove', ev => { ultimo = { x:ev.clientX, y:ev.clientY }; });
setInterval(() => { if(ultimo.x >= 0) conferir(ultimo.x, ultimo.y); }, 150);
