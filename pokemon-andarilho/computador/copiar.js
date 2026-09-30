/* Copia o Pokémon (o mesmo arquivo do site e da extensão) pra dentro desta pasta antes de abrir. */
const fs = require('fs'), path = require('path');
const de = path.join(__dirname, '..', 'extensao'), para = path.join(__dirname, 'extensao');
fs.mkdirSync(para, { recursive:true });
for(const f of ['andarilho.js', 'nomes.js', 'painel.js', 'painel.css']) fs.copyFileSync(path.join(de, f), path.join(para, f));
