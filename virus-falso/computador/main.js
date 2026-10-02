/* Vírus de mentira, versão programa de computador (Electron).
   É só a mesma página do site numa janela em tela cheia. Não mexe em nada do computador:
   não abre sozinho quando liga, não fica escondido e fecha normal com Alt + F4.
   Esc sai da tela cheia. */
const { app, BrowserWindow } = require('electron');
const path = require('path');

app.whenReady().then(() => {
  const janela = new BrowserWindow({
    fullscreen:true, autoHideMenuBar:true, backgroundColor:'#0b0f14', title:'virus.exe (de mentira)',
    icon:path.join(__dirname, 'icone-256.png'),
    webPreferences:{ contextIsolation:true, nodeIntegration:false }
  });
  janela.webContents.on('before-input-event', (ev, tecla) => {
    if(tecla.type === 'keyDown' && tecla.key === 'Escape' && janela.isFullScreen()) janela.setFullScreen(false);
  });
  janela.loadFile(path.join(__dirname, 'pagina.html'));
});
app.on('window-all-closed', () => app.quit());
