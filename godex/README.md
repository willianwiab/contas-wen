# GOdex

A tua Pokédex do **Pokémon GO**: você marca quais já pegou, com as variações, e o site diz
qual é o mais raro da tua coleção.

Mora em `godex/`, é uma página só, funciona no celular e continua funcionando depois que a
internet cai.

## De onde vêm os dados

Da **PokéAPI** (`pokeapi.co`) — pública, de graça, sem cadastro, e deixa um site de fora
ler. É o oposto do que aconteceu com o MM2, onde nenhuma fonte era alcançável.

Dela vem o que é **fato do Pokémon**: número da Pokédex, nome, tipos, figurinha normal e
shiny, quem é lendário e mítico, e a taxa de captura dos jogos clássicos.

**A figurinha não custa chamada**: os sprites da PokéAPI são endereço direto no GitHub, então
a grade com mil Pokémon é uma requisição só (a lista) e mil `<img>`.

## O que ela não tem, e eu não invento

**Nada específico do Pokémon GO.** Quem é regional, quem sai em raid, quem já teve shiny
liberado, CP, IV — nada disso existe em API pública que eu consiga ler.

Foi a mesma encruzilhada do RaroDex, com a mesma saída: **quem sabe é quem joga**. As
variações são marcadas à mão, e é isso que faz o ranque de raridade valer alguma coisa.

## As variações

✨ Shiny · 🌑 Sombroso · 💜 Purificado · 🍀 Sortudo · 🎩 Fantasia · 🖼️ Fundo de evento ·
💯 100% (IV) · 🌍 Regional · 📅 Só em evento

Três decisões pequenas que evitam erro de dedo:

- **marcar qualquer variação já marca que você tem** — exigir os dois cliques seria só uma
  chance a mais de esquecer um deles;
- **desmarcar "tenho" apaga as variações junto** — variação de Pokémon que você não tem não
  quer dizer nada;
- marcar ✨ shiny **troca a figurinha** na ficha e na grade, porque é ela que você tem.

## "Qual é o mais raro?" — a conta aberta

Esta é a parte onde eu precisava ser mais honesto do site inteiro. Em vez de inventar um
número de raridade, eu somo duas metades e **mostro a tabela na tela**:

| o que conta | pontos | de onde vem |
|---|---|---|
| 🌟 Mítico | 60 | PokéAPI |
| 👑 Lendário | 45 | PokéAPI |
| difícil de capturar nos jogos clássicos | até 25 | PokéAPI (`capture_rate`) |
| ✨ Shiny | 40 | você marcou |
| 💯 100% | 35 | você marcou |
| 🌍 Regional | 30 | você marcou |
| 🎩 Fantasia · 📅 evento · 🍀 sortudo · 🌑 sombroso · 💜 purificado · 🖼️ fundo | 10–18 | você marcou |

E está escrito embaixo, com todas as letras: **esta conta é minha, não é oficial**. Quanto
mais você marca, mais o ranque sabe de GO de verdade — porque a parte que sabe de GO é a
sua.

A taxa de captura leva um aviso próprio na ficha: ela é **dos jogos clássicos**, não do GO.

## Guardar e continuar sem internet

- a **lista dos mil e tantos** fica guardada: ela muda uma vez por ano, quando sai geração
  nova, e guardada o site abre offline;
- **cada ficha aberta fica guardada** — a segunda vez é instantânea, e offline ela ainda
  abre. Se o `localStorage` encher, jogo metade fora em vez de estourar;
- sem detalhe nenhum, a ficha ainda mostra número, nome e figurinha, e **marcar o que você
  tem continua funcionando** — isso nunca dependeu da internet;
- o ranque dos raros busca em fila, com contador na tela, e só o que não estava guardado.

## O resto

Claro e escuro, código `GD1.…` pro outro aparelho (as marcas dos repetidos **se juntam**,
nada é apagado), e o número da versão no rodapé é botão: aperta e o site joga fora tudo que
está guardado e reabre do zero.

**Não é oficial**, e está no rodapé: site de fã, sem ligação com a Niantic, a Nintendo ou a
The Pokémon Company.
