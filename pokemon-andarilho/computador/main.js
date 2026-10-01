/* Pokémon Andarilho no computador (Electron).
   Uma janela transparente, sem borda, sempre por cima, do tamanho da tela (sem a barra de tarefas).
   Os cliques passam direto pros programas de baixo, menos quando o mouse está em cima do Pokémon. */
const { app, BrowserWindow, Tray, Menu, ipcMain, screen, nativeImage, globalShortcut } = require('electron');
const path = require('path');

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
    { label:escondido ? '👀 Mostrar' : '🙈 Esconder', click:() => { escondido = !escondido; escondido ? palco.hide() : palco.showInactive(); bandeja.setContextMenu(menu()); } },
    { type:'separator' },
    { label:'❌ Sair', click:() => app.quit() }
  ]);
  bandeja.setContextMenu(menu());
  bandeja.on('click', abrirConfig);
  /* Na primeira vez abre a janela de escolher, pra ninguém ficar procurando. */
  abrirConfig();
  /* Atalho: Ctrl + Shift + P abre a janela de escolher de qualquer lugar. */
  try{ globalShortcut.register('CommandOrControl+Shift+P', abrirConfig); }catch(e){}
});
app.on('will-quit', () => globalShortcut.unregisterAll());
app.on('window-all-closed', () => {});
