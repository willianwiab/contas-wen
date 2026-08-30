/* =========================================================
   avisos.js — notificações do celular, lembretes de horário
   e a bolinha de não lidos no ícone do aplicativo.

   O que é verdade: sem servidor, o aviso só aparece com o
   site aberto (mesmo atrás de outro app) ou quando outra
   janela do mesmo aparelho escreve um recado novo.
   ========================================================= */

const podeAvisar  = () => 'Notification' in window;
const avisoLigado = () => podeAvisar() && Notification.permission === 'granted' && dados.avisos !== false && !sonecaLigada();

async function pedirAvisos(){
  if(!podeAvisar()){ toast('Este navegador não tem notificação 😕'); return false; }
  if(Notification.permission === 'denied'){
    toast('Tu bloqueou os avisos — libera nas configurações do navegador');
    return false;
  }
  const r = Notification.permission === 'granted' ? 'granted' : await Notification.requestPermission();
  if(r === 'granted'){
    dados.avisos = true; salvar();
    avisar('Avisos ligados! 🔔', 'Vou te avisar quando chegar recadinho novo.');
    return true;
  }
  toast('Sem problema, fica sem aviso 😊');
  return false;
}

async function avisar(titulo, corpo, marca){
  if(!avisoLigado()) return;
  const opcoes = {
    body: corpo, icon: 'icone-192.png', badge: 'icone-192.png',
    tag: marca || 'fala-familia', renotify: true, lang: 'pt-BR'
  };
  try{
    const reg = await navigator.serviceWorker?.getRegistration();
    if(reg && reg.showNotification) await reg.showNotification(titulo, opcoes);
    else new Notification(titulo, opcoes);
  }catch(e){
    try{ new Notification(titulo, opcoes); }catch(e2){}
  }
}

/* ---------- bolinha no ícone do aplicativo ---------- */
function atualizarBolinhaDoIcone(){
  const total = CONVERSAS.reduce((s,c) => s + naoLidas(c.id), 0);
  try{
    if(total > 0) navigator.setAppBadge?.(total);
    else navigator.clearAppBadge?.();
  }catch(e){}
  return total;
}

/* ---------- recado novo escrito em outra janela ---------- */
window.addEventListener('storage', ev => {
  if(ev.key !== CHAVE) return;
  const antes = dados;
  const vistoDaqui = Object.assign({}, antes.visto);
  dados = carregar();
  /* Cada janela lembra o que ELA já viu — senão quem escreve marcaria
     como lido pra quem ainda nem olhou. */
  dados.visto = vistoDaqui;
  if(atual) dados.visto[atual] = Date.now();
  aplicarTema();
  desenharContatos();
  if(atual){ desenharMensagens(); atualizarStatusTopo(); }
  atualizarBolinhaDoIcone();

  // achou recado novo de outra pessoa? avisa.
  CONVERSAS.forEach(c => {
    const nova = (dados.msgs[c.id] || []).slice((antes.msgs[c.id] || []).length);
    nova.filter(m => !souEu(m.de)).forEach(m => {
      const p = PESSOAS[m.de] || PESSOAS.jojo;
      const texto = m.tipo === 'audio' ? '🎤 mandou um recadinho de voz' : m.t;
      if(document.hidden || atual !== c.id) blim(false);
      avisar(`${p.emoji} ${p.nome}`, texto, c.id);
    });
  });
});

/* ---------- lembretes de horário ---------- */
function hojeTexto(){ return new Date().toISOString().slice(0,10); }

function verLembretes(aoAbrir){
  if(!Array.isArray(dados.lembretes)) return;
  const agora = new Date();
  const relogio = `${String(agora.getHours()).padStart(2,'0')}:${String(agora.getMinutes()).padStart(2,'0')}`;
  let mudou = false;
  dados.lembretes.forEach(l => {
    if(l.ultimo === hojeTexto()) return;
    if(l.hora <= relogio){
      l.ultimo = hojeTexto(); mudou = true;
      if(aoAbrir) toast(`⏰ Lembrete: ${l.txt}`);
      else { avisar('⏰ Lembrete', l.txt, 'lembrete'); blim(true); }
    }
  });
  if(mudou) salvar();
}

function desenharLembretes(){
  const caixa = document.getElementById('listaLembretes');
  if(!caixa) return;
  const lista = dados.lembretes || [];
  caixa.innerHTML = lista.length
    ? lista.map((l,i) => `<div class="lembrete"><b>${l.hora}</b><span>${escapar(l.txt)}</span>
        <button data-lembrete="${i}" title="Apagar">✕</button></div>`).join('')
    : `<p class="sem-lembrete">Nenhum lembrete ainda. Que tal “às 21h dar boa noite”? 🌙</p>`;
  caixa.querySelectorAll('[data-lembrete]').forEach(b => b.addEventListener('click', () => {
    dados.lembretes.splice(+b.dataset.lembrete, 1); salvar(); desenharLembretes();
  }));
}

function novoLembrete(){
  const hora = document.getElementById('lembreteHora').value;
  const txt  = document.getElementById('lembreteTxt').value.trim();
  if(!hora || !txt){ toast('Precisa da hora e do recado 😊'); return; }
  dados.lembretes = dados.lembretes || [];
  if(dados.lembretes.length >= 10){ toast('Já tem lembrete demais! 😅'); return; }
  dados.lembretes.push({ hora, txt, ultimo:'' });
  dados.lembretes.sort((a,b) => a.hora.localeCompare(b.hora));
  salvar(); desenharLembretes();
  document.getElementById('lembreteTxt').value = '';
  toast('Lembrete guardado! ⏰');
  if(!avisoLigado()) pedirAvisos();
}

/* confere os lembretes de meio em meio minuto */
setInterval(() => verLembretes(false), 30000);
