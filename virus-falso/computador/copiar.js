/* Copia a página do site (a mesma brincadeira) pra dentro do programa. */
const fs = require('fs'), path = require('path');
fs.copyFileSync(path.join(__dirname, '..', 'index.html'), path.join(__dirname, 'pagina.html'));
