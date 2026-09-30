/* Pokémon Andarilho no computador (Electron).
   Uma janela transparente, sem borda, sempre por cima, do tamanho da tela (sem a barra de tarefas).
   Os cliques passam direto pros programas de baixo, menos quando o mouse está em cima do Pokémon. */
const { app, BrowserWindow, Tray, Menu, ipcMain, screen, nativeImage } = require('electron');
const path = require('path');

let palco = null, config = null, bandeja = null, escondido = false;

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
  palco.loadFile('palco.html');
}
function abrirConfig(){
  if(config && !config.isDestroyed()){ config.show(); config.focus(); return; }
  config = new BrowserWindow({ width:400, height:680, title:'Pokémon Andarilho', icon:path.join(__dirname, 'icone.png'), autoHideMenuBar:true,
    webPreferences:{ contextIsolation:true, nodeIntegration:false } });
  config.loadFile('config.html');
}
/* O palco avisa quando o mouse está em cima de um Pokémon (aí ele recebe o clique) ou não (aí o clique passa). */
ipcMain.on('mouse', (_, pegar) => { if(palco && !palco.isDestroyed()) palco.setIgnoreMouseEvents(!pegar, { forward:true }); });

app.whenReady().then(() => {
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
});
app.on('window-all-closed', () => {});
