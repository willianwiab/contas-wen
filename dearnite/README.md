# 🦙 DearNite

Todas as skins e cosméticos do Fortnite num lugar só: quando saíram, quantas vezes
foram pra loja, quanto custam em V-Bucks e em reais, e quanto vale a sua conta.

É o irmão do [ButterPoke](../butterpoke/): o ButterPoke é de carta de Pokémon, o
DearNite é de skin de Fortnite.

▶️ **Abrir:** https://willianwiab.github.io/contas-wen/dearnite/

## O que ele mostra

Cada cosmético tem:

- **Quando saiu**: capítulo e temporada, o dia que entrou nos arquivos do jogo e a
  primeira vez que apareceu na loja.
- **Quantas vezes foi pra loja**, a última vez, e a lista de todas as datas por ano.
- **Raridade** da skin (Comum, Rara, Épica, Lendária, Série Ícones, Marvel…).
- **👀 Raridade de ver um player com ela**, de 1 a 5 estrelas: quanto menos vezes foi
  vendida, há mais tempo sumiu e se só saiu em passe ou evento antigo, menos gente tem.
  É um chute bem feito — ninguém tem o número exato de quantos jogadores têm cada skin,
  e o site diz isso.
- **Quanto custa**: em V-Bucks e em reais. Se está na loja hoje, é o preço de verdade
  (com desconto e tudo). Se não está, é a estimativa pela tabela da Epic (tipo +
  raridade), e o site avisa que é estimativa. Se nunca foi vendida (Passe de Batalha,
  PlayStation Plus, evento…), o site diz que é **exclusiva**: não dá pra comprar, vale
  0 V-Bucks, mas em raridade vale muito.
- **De onde vem**: loja, Passe de Batalha, Clube Fortnite, PlayStation, promoção…

Tipos que entram: traje, acessório para costas, picareta, asa-delta, rastro de fumaça,
aura, calçado, gesto, mascote, parceiro, envelopamento, estandarte, música do lobby, tela
de carregamento, spray, emoticon, brinquedo, carro, adesivo de carro, rodas, rastro de
carro, impulso, instrumentos do Festival (guitarra, baixo, bateria, microfone, teclado),
faixas (Jam Tracks) e kits LEGO.

## As abas

- **Catálogo**: busca por nome, filtro por tipo, raridade, capítulo e raridade de ver,
  e ordem por nome, mais novas, mais vezes na loja, mais sumidas, mais caras…
- **Loja de hoje**: o que está à venda agora, com preço em V-Bucks e em reais.
- **📸 Quanto vale a minha conta?**: manda print do armário do Fortnite **com o nome
  da skin aparecendo**. Uma IA de leitura de texto (Tesseract, rodando no próprio
  navegador) lê o nome, o site procura no catálogo e pergunta "é essa?" com **Sim /
  Não / Não sei**. No "Não sei" aparece a foto grande, o nome, o tipo e tudo mais pra
  comparar. Cada "Sim" entra no armário e soma o valor da conta em V-Bucks e em reais.
  A foto não sai do aparelho.
- **Meu armário**: tudo que você marcou como "tenho", com o total, e as favoritas. Tem
  um código pra levar pra outro aparelho (igual ao do ButterPoke).
- **V-Bucks em reais**: calculadora com os pacotes da loja da Epic no Brasil.
- **🎮 Jogador**: estatísticas pelo nick (vitórias, partidas, abates, K/D, nível do
  passe, por modo). Esse pedaço da API pede uma chave: é de graça em
  dash.fortnite-api.com (login com Discord), e ela fica guardada só no aparelho. A chave
  **não** está escrita no código de propósito: chave no código vira pública. Só funciona
  pra quem deixou as estatísticas públicas no jogo. Ver o armário de outro jogador não dá
  — a Epic não mostra pra ninguém.
- **🧸 Meus bonecos**: brinquedo de verdade (boneco, pelúcia, Funko, chaveiro, LEGO).
  Não existe catálogo de preço desses pra puxar, então quem sabe é a pessoa: ela
  cadastra o que tem, de qual skin é (a foto vem do catálogo), quanto custou, quanto
  acha que vale e se acha raro. O site soma e marca ▲ ▼. Vai junto no código do armário.
- **🗺️ Mapa**: o mapa de agora com os nomes dos lugares desenhados, zoom, arrastar e
  busca de local. Missões não existem nessa API.

## O aviso do dinheiro

Toda vez que aparece valor em reais, aparece junto: esse valor é só curiosidade, é
quanto custaria comprar os V-Bucks. Skin não vira dinheiro de volta. **Nunca venda,
compre nem troque conta** — é proibido pela Epic, dá banimento e quase sempre é golpe.
E V-Bucks de graça não existe: nunca dê a senha pra ninguém.

## Como funciona por dentro

- Os dados vêm da [fortnite-api.com](https://fortnite-api.com), de graça e sem chave.
  O catálogo inteiro é grande, então ele é baixado uma vez, enxugado (só o que o site
  mostra) e guardado no IndexedDB do aparelho por um dia. A loja é guardada por uma hora.
- A API não diz preço de item fora da loja. A tabela de estimativa está no começo do
  código (`TABELA`), por tipo e raridade.
- Os pacotes de V-Bucks em reais estão em `PACOTES` (preços da Epic desde 19/03/2026,
  quando o pacote de R$ 31,99 passou de 1.000 pra 800 V-Bucks). O site calcula o jeito
  mais barato de juntar os V-Bucks com esses pacotes.
- Tudo num arquivo só, sem servidor. Armário e favoritas ficam no localStorage.
- Dá pra instalar como aplicativo (manifesto + service worker guardando só a casca).

Feito pelo Jojo com o Claude.
