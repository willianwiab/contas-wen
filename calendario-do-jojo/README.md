# 📅 Calendário do Jojo

Um calendário com **tudo mesmo**: feriados nacionais e de estados, pontos facultativos, férias da escola, datas comemorativas, dias nerds e gamer (Pokémon, Mario, Star Wars, Minecraft, Roblox…), lançamentos de filmes, séries e jogos, Copa do Mundo, Olimpíadas, eleições, história (Dia do Fico, Copas do Brasil, 7 a 1, pandemia de COVID-19 em todos os dias de 2020 até 2023), dias de comida, bichos e profissões, lua cheia e nova, Ano Novo Chinês, estações do ano, sexta-feira 13 e seus próprios eventos. São uns 250 eventos por ano.

## Como usar

- **Setas ◀ ▶** (ou as setas do teclado) mudam o mês. "Ver ano" mostra os 12 meses de uma vez.
- **Clique num dia** pra ver todos os eventos daquele dia (um dia pode ter vários, tipo 12 de outubro: Nossa Senhora Aparecida + Dia das Crianças).
- **Clique num evento** pra abrir a ficha dele: contagem regressiva, explicação, botão 🎊 Festa (confete!), favoritar, mandar pro Google Agenda e compartilhar.
- **Filtros coloridos** ligam e desligam cada tipo de evento.
- **Busca** procura qualquer evento pelo nome.
- **➕ Criar meu evento**: aniversários e o que quiser, com emoji, repetindo todo ano ou não. Fica salvo no navegador.
- **⚙️ Datas da minha escola**: ajusta volta às aulas, férias de julho e último dia de aula.
- **📲 Instalar**: vira um app na tela inicial (Android, iPhone e computador) e funciona sem internet.
- **🔔 Avisos**: pede permissão e avisa quando chega o dia de um evento (feriados, férias, filmes, esporte, seus eventos e favoritos, ou tudo). No Chrome do Android o app checa sozinho de vez em quando, mesmo fechado; no iPhone e no computador o aviso aparece quando você abre o app.

## Como funciona

É um `index.html` com `sw.js` (service worker pra funcionar offline e mandar os avisos), `manifest.webmanifest` e os ícones, sem dependências. A página manda pro service worker uma agenda com os próximos 120 dias que têm evento; ele guarda no cache e, quando o dia chega, mostra a notificação. Páscoa, Carnaval, Corpus Christi, Dia das Mães, Dia dos Pais, Black Friday e Dia do Programador são calculados pra qualquer ano. Lua cheia e estações do ano são aproximadas. As datas fixas ficam na lista `FIXOS`, os eventos de um ano só (Copa, Olimpíadas, eleições, marcos da COVID) na lista `ESPECIAIS` e os lançamentos de filmes, séries e jogos na lista `FILMES`, no começo do script.
