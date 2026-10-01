const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('andarilhoPC', { mouse:pegar => ipcRenderer.send('mouse', !!pegar), abrirConfig:() => ipcRenderer.send('abrir-config') });
