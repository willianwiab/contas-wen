# 📅 Calendário do Jojo

Um calendário com **tudo mesmo**: feriados nacionais, pontos facultativos, férias da escola, datas comemorativas, dias nerds e gamer (Pokémon, Mario, Star Wars, Minecraft, Roblox…), Copa do Mundo, Olimpíadas, eleições, lua cheia, estações do ano, sexta-feira 13 e seus próprios eventos.

## Como usar

- **Setas ◀ ▶** (ou as setas do teclado) mudam o mês. "Ver ano" mostra os 12 meses de uma vez.
- **Clique num dia** pra ver todos os eventos daquele dia (um dia pode ter vários, tipo 12 de outubro: Nossa Senhora Aparecida + Dia das Crianças).
- **Clique num evento** pra abrir a ficha dele: contagem regressiva, explicação, botão 🎊 Festa (confete!), favoritar, mandar pro Google Agenda e compartilhar.
- **Filtros coloridos** ligam e desligam cada tipo de evento.
- **Busca** procura qualquer evento pelo nome.
- **➕ Criar meu evento**: aniversários e o que quiser, com emoji, repetindo todo ano ou não. Fica salvo no navegador.
- **⚙️ Datas da minha escola**: ajusta volta às aulas, férias de julho e último dia de aula.

## Como funciona

É um `index.html` só, sem dependências. Páscoa, Carnaval, Corpus Christi, Dia das Mães, Dia dos Pais, Black Friday e Dia do Programador são calculados pra qualquer ano. Lua cheia e estações do ano são aproximadas. As datas fixas ficam na lista `FIXOS` e os eventos de um ano só (Copa, Olimpíadas, eleições) na lista `ESPECIAIS`, no começo do script.
