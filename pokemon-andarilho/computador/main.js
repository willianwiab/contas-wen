/* Pokémon Andarilho no computador (Electron).
   Uma janela transparente, sem borda, sempre por cima, do tamanho da tela (sem a barra de tarefas).
   Os cliques passam direto pros programas de baixo, menos quando o mouse está em cima do Pokémon. */
const { app, BrowserWindow, Tray, Menu, ipcMain, screen, nativeImage, globalShortcut, dialog, shell } = require('electron');
const path = require('path'), fs = require('fs');

/* 🕵️ Detetive: anota tudo o que dá errado num caderninho (registro.txt) e, se o programa não conseguir
   mostrar os Pokémon, abre uma caixinha contando o problema (a caixinha é do Windows, sempre aparece). */
const registro = [];
const anotar = t => {
  const linha = new Date().toLocaleTimeString() + ' ' + String(t).slice(0, 400);
  registro.push(linha); if(registro.length > 200) registro.shift();
  try{ fs.appendFileSync(path.join(app.getPath('userData'), 'registro.txt'), linha + '\n'); }catch(e){}
};
const problemas = [];
const problema = t => { problemas.push(t); anotar('PROBLEMA: ' + t); };
function vigiar(janela, nome){
  const w = janela.webContents;
  w.on('console-message', (ev, nivel, msg, linha, fonte) => {
    const d = ev && ev.message !== undefined ? ev : { level:nivel, message:msg, lineNumber:linha, sourceId:fonte };
    if(d.level === 'error' || d.level === 3) problema(`${nome}: ${d.message} (${path.basename(String(d.sourceId || ''))}:${d.lineNumber})`);
  });
  w.on('did-fail-load', (ev, cod, desc) => problema(`${nome} não carregou: ${desc} (${cod})`));
  w.on('did-finish-load', () => anotar(`${nome} carregou`));
  w.on('render-process-gone', (ev, d) => {
    problema(`${nome} quebrou: ${d.reason} (${d.exitCode})`);
    /* Tenta de novo sozinho. */
    if(!janela.isDestroyed()) setTimeout(() => { try{ janela.reload(); }catch(e){} }, 1000);
  });
  janela.on('unresponsive', () => problema(`${nome} travou (não responde)`));
  janela.on('responsive', () => anotar(`${nome} voltou a responder`));
}
app.on('child-process-gone', (ev, d) => problema(`processo ${d.type} parou: ${d.reason} (${d.exitCode})`));
const comPrazo = (p, ms) => Promise.race([p, new Promise(r => setTimeout(() => r('SEM RESPOSTA'), ms))]);
async function examinar(){
  let pets = 'sem palco', lista = 'sem janela';
  if(palco && !palco.isDestroyed()) pets = await comPrazo(palco.webContents.executeJavaScript('window.andarilhoPets ? andarilhoPets().length : "andarilho não começou"').catch(e => 'erro: ' + e.message), 5000);
  if(config && !config.isDestroyed()) lista = await comPrazo(config.webContents.executeJavaScript('document.querySelectorAll("#resultados button").length').catch(e => 'erro: ' + e.message), 5000);
  anotar(`exame: pokémon na tela = ${pets}; pokémon na lista = ${lista}`);
  if(typeof pets !== 'number' || pets < 1) problema(`Nenhum Pokémon na tela (${pets})`);
  if(lista !== 'sem janela' && (typeof lista !== 'number' || lista < 1)) problema(`A janela de escolher está vazia (${lista})`);
  return problemas.length === 0;
}
function mostrarDetetive(automatico){
  const gpu = (() => { try{ return JSON.stringify(app.getGPUFeatureStatus()).slice(0, 300); }catch(e){ return '?'; } })();
  const texto = [`Versão ${VERSAO} · Windows ${process.getSystemVersion ? process.getSystemVersion() : ''} · jeito: ${JEITOS[jeito.n].nome}`,
    '', problemas.length ? 'Problemas:' : 'Nenhum problema encontrado! 😄', ...problemas.slice(-8).map(p => '• ' + p), '', 'Placa de vídeo: ' + gpu].join('\n');
  const r = caixinha({ type:problemas.length ? 'warning' : 'info', title:'🕵️ Detetive do Pokémon Andarilho',
    message:automatico ? 'Ops! Os Pokémon não conseguiram aparecer. 😣\nTire uma foto desta caixinha (tecla PrtSc) e mande pro Claude!' : 'Detetive do Pokémon Andarilho',
    detail:texto, buttons:['🎨 Tentar outro jeito de desenhar', '📂 Abrir o caderninho', 'OK'], defaultId:2, cancelId:2, noLink:true });
  if(r === 0){ proximoJeito(); }
  if(r === 1){ shell.openPath(path.join(app.getPath('userData'), 'registro.txt')); }
}
/* 🎨 Jeitos de desenhar. Em alguns computadores com Windows a placa de vídeo não mostra as janelas (ficam brancas
   e os Pokémon somem). Então o programa tenta um jeito de cada vez e pergunta se você está vendo os Pokémon.
   O jeito que funcionar fica guardado. */
const JEITOS = [
  { nome:'sem placa de vídeo', fazer:() => { app.disableHardwareAcceleration(); app.commandLine.appendSwitch('disable-gpu'); app.commandLine.appendSwitch('disable-gpu-compositing'); } },
  { nome:'normal (placa de vídeo)', fazer:() => {} },
  { nome:'placa de vídeo sem composição', fazer:() => { app.commandLine.appendSwitch('disable-direct-composition'); app.commandLine.appendSwitch('disable-gpu-compositing'); } },
  { nome:'placa de vídeo com OpenGL', fazer:() => { app.commandLine.appendSwitch('use-angle', 'gl'); } },
  { nome:'placa de vídeo antiga (D3D9)', fazer:() => { app.commandLine.appendSwitch('use-angle', 'd3d9'); app.commandLine.appendSwitch('disable-direct-composition'); } }
];
const arquivoJeito = () => path.join(app.getPath('userData'), 'jeito-de-desenhar.json');
let jeito = { n:0, ok:false };
try{ jeito = Object.assign(jeito, JSON.parse(fs.readFileSync(arquivoJeito(), 'utf8'))); }catch(e){}
jeito.n = Math.max(0, Math.min(JEITOS.length - 1, Math.floor(+jeito.n) || 0));
JEITOS[jeito.n].fazer();
const guardarJeito = () => { try{ fs.writeFileSync(arquivoJeito(), JSON.stringify(jeito)); }catch(e){} };
function reiniciar(){ guardarJeito(); app.releaseSingleInstanceLock(); app.relaunch(); app.exit(0); }
function proximoJeito(){ jeito.n = (jeito.n + 1) % JEITOS.length; jeito.ok = false; anotar('trocando para o jeito: ' + JEITOS[jeito.n].nome); reiniciar(); }
/* Pergunta se está vendo os Pokémon (a caixinha é do Windows, aparece mesmo se o resto estiver branco). */
/* As nossas janelas ficam "sempre por cima"; durante a caixinha elas descem, senão tapam a caixinha. */
function caixinha(opcoes){
  const nossas = [palco, config].filter(w => w && !w.isDestroyed());
  nossas.forEach(w => w.setAlwaysOnTop(false));
  try{ return dialog.showMessageBoxSync(opcoes); }
  finally{ nossas.forEach(w => { if(!w.isDestroyed()) w === palco ? w.setAlwaysOnTop(true, 'screen-saver') : w.setAlwaysOnTop(true, 'screen-saver', 1); }); }
}
function perguntarSeVe(){
  const r = caixinha({ type:'question', title:'Pokémon Andarilho', noLink:true, defaultId:0, cancelId:2,
    message:'Você está vendo os Pokémon andando na tela? 👀',
    detail:`Teste ${jeito.n + 1} de ${JEITOS.length} (jeito: ${JEITOS[jeito.n].nome}).\nSe não estiver vendo, clique em "Não" que eu tento outro jeito de desenhar!`,
    buttons:['✅ Sim, estou vendo!', '❌ Não, tá branco/vazio', 'Perguntar depois'] });
  if(r === 0){ jeito.ok = true; guardarJeito(); anotar('funcionou com o jeito: ' + JEITOS[jeito.n].nome); }
  if(r === 1){ anotar('não funcionou com o jeito: ' + JEITOS[jeito.n].nome); proximoJeito(); }
}

let palco = null, config = null, bandeja = null, escondido = false;

/* No Windows, a camada transparente por cima de tudo faz o Windows achar que as outras janelas do programa
   estão "tapadas", e aí ele para de desenhar elas (a janela de escolher ficava branca). Isso desliga essa conta. */
app.commandLine.appendSwitch('disable-features', 'CalculateNativeWinOcclusion');
app.commandLine.appendSwitch('disable-backgrounding-occluded-windows');

/* Só pode ter um aberto. Se clicar no programa de novo, em vez de abrir outro, mostra a janela de escolher.
   Mas se o que abriu agora for uma versão MAIS NOVA, o velho fecha sozinho e o novo fica no lugar. */
const VERSAO = app.getVersion();
const maisNova = (a, b) => { const x = String(a).split('.').map(Number), y = String(b).split('.').map(Number);
  for(let i = 0; i < 3; i++) if((x[i] || 0) !== (y[i] || 0)) return (x[i] || 0) > (y[i] || 0); return false; };
let temLock = app.requestSingleInstanceLock({ versao:VERSAO });
app.on('second-instance', (ev, argv, pasta, dados) => {
  if(dados && maisNova(dados.versao, VERSAO)){ app.releaseSingleInstanceLock(); app.exit(0); return; }
  abrirConfig();
});
/* Espera um pouquinho o velho fechar e tenta de novo. */
const esperarLock = async () => {
  for(let i = 0; i < 4 && !temLock; i++){ await new Promise(r => setTimeout(r, 1200)); temLock = app.requestSingleInstanceLock({ versao:VERSAO }); }
  if(!temLock) app.quit();
  return temLock;
};

function criarPalco(){
  const { x, y, width, height } = screen.getPrimaryDisplay().workArea;
  palco = new BrowserWindow({
    x, y, width, height, transparent:true, frame:false, resizable:false, movable:false, hasShadow:false,
    skipTaskbar:true, alwaysOnTop:true, focusable:false, backgroundColor:'#00000000',
    webPreferences:{ preload:path.join(__dirname, 'preload.js'), contextIsolation:true, nodeIntegration:false, backgroundThrottling:false }
  });
  palco.setAlwaysOnTop(true, 'screen-saver');
  palco.setVisibleOnAllWorkspaces(true);
  palco.setIgnoreMouseEvents(true, { forward:true });
  vigiar(palco, 'Camada dos Pokémon');
  palco.loadFile(path.join(__dirname, 'palco.html'));
}
function abrirConfig(){
  if(config && !config.isDestroyed()){ config.show(); config.moveTop(); config.focus(); return; }
  config = new BrowserWindow({ width:400, height:680, title:'Pokémon Andarilho', icon:path.join(__dirname, 'icone.png'), autoHideMenuBar:true,
    show:false, backgroundColor:'#f7f9ff',
    webPreferences:{ contextIsolation:true, nodeIntegration:false, backgroundThrottling:false } });
  /* Fica por cima da camada dos Pokémon (senão ela tapa a janela). */
  config.setAlwaysOnTop(true, 'screen-saver', 1);
  config.once('ready-to-show', () => { config.show(); config.moveTop(); config.focus(); });
  vigiar(config, 'Janela de escolher');
  config.loadFile(path.join(__dirname, 'config.html'));
}
/* O palco avisa quando o mouse está em cima de um Pokémon (aí ele recebe o clique) ou não (aí o clique passa). */
ipcMain.on('abrir-config', () => abrirConfig());
ipcMain.on('mouse', (_, pegar) => { if(palco && !palco.isDestroyed()) palco.setIgnoreMouseEvents(!pegar, { forward:true }); });

app.whenReady().then(esperarLock).then(ok => {
  if(!ok) return;
  criarPalco();
  bandeja = new Tray(nativeImage.createFromPath(path.join(__dirname, 'icone.png')).resize({ width:16, height:16 }));
  bandeja.setToolTip('Pokémon Andarilho');
  const menu = () => Menu.buildFromTemplate([
    { label:'🐾 Escolher Pokémon', click:abrirConfig },
    { label:'🆘 Chamar os Pokémon', click:() => { if(!palco || palco.isDestroyed()) return; if(escondido){ escondido = false; palco.showInactive(); bandeja.setContextMenu(menu()); } palco.webContents.executeJavaScript('window.andarilhoResgatar && andarilhoResgatar()').catch(() => {}); } },
    { label:escondido ? '👀 Mostrar' : '🙈 Esconder', click:() => { escondido = !escondido; escondido ? palco.hide() : palco.showInactive(); bandeja.setContextMenu(menu()); } },
    { type:'separator' },
    { label:'🕵️ Detetive (ver problemas)', click:async () => { await examinar(); mostrarDetetive(false); } },
    { label:'🎨 Tentar outro jeito de desenhar', click:proximoJeito },
    { type:'separator' },
    { label:'❌ Sair', click:() => app.quit() }
  ]);
  bandeja.setContextMenu(menu());
  bandeja.on('click', abrirConfig);
  /* Na primeira vez abre a janela de escolher, pra ninguém ficar procurando. */
  abrirConfig();
  anotar(`começou a versão ${VERSAO} (jeito: ${JEITOS[jeito.n].nome})`);
  /* Depois de 8 segundos confere se os Pokémon apareceram. Se der erro, o detetive avisa;
     se não deu erro mas ainda não sabemos se dá pra ver, pergunta. */
  setTimeout(async () => { if(!(await examinar())) mostrarDetetive(true); else if(!jeito.ok) perguntarSeVe(); }, 8000);
  /* Atalho: Ctrl + Shift + P abre a janela de escolher de qualquer lugar. */
  try{ globalShortcut.register('CommandOrControl+Shift+P', abrirConfig); }catch(e){}
});
app.on('will-quit', () => globalShortcut.unregisterAll());
app.on('window-all-closed', () => {});
