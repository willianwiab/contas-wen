# 🗺️ Caça ao Tesouro

Alguém esconde pistas em lugares **de verdade** e outra pessoa tem que ir até lá pra achar.

## O truque: a caça inteira cabe num link

Não existe servidor. A caça (nome, pistas, coordenadas, tesouro) é comprimida em base64
e vive dentro do próprio endereço, depois do `#j=`. Quem cria manda o link pelo zap; quem
recebe abre e joga. **Nada é guardado em lugar nenhum além do aparelho de cada um.**

Por isso não há fotos nas pistas: elas fariam o link virar um monstro que nenhum aplicativo
de mensagem aceita. Uma caça de 5 pistas dá uns 500 caracteres.

## Como funciona por dentro

- **Distância**: haversine entre a posição atual (`watchPosition`) e a pista.
- **"Tá quente / tá frio"**: o número exato estragaria a graça, esconder tudo deixaria a
  criança andando à toa. Meio-termo: a distância aparece, mas quem guia é a cor.
- **A setinha**: `deviceorientation` + o rumo calculado. Sem bússola no aparelho, ela
  simplesmente não aparece e o jogo segue igual.
- **Dificuldade**: 45 m (fácil), 25 m (médio), 15 m (difícil). O GPS de celular erra
  10–20 m em dia bom, então abaixo disso o jogo ficaria injusto.

## Duas armadilhas que apareceram no teste

**1. Duas pistas no mesmo lugar.** `getCurrentPosition` com `maximumAge: 5000` devolvia a
leitura de segundos atrás: quem escondesse duas pistas em seguida acabava com as duas no
mesmo ponto e o jogo virava impossível. Ao esconder, agora a leitura é sempre nova
(`maximumAge: 0`), e o app avisa se a pista nova cair coladinha numa que já existe.

**2. O nome sumia.** A tela de criar era redesenhada a cada pista escondida, e isso
reescrevia os campos — apagando o nome recém-digitado. Agora o que a pessoa escreve vai
direto pro rascunho.

## Segurança

O app abre com quatro combinados (contar pros pais, olhar pra frente, só em lugar
conhecido, o GPS erra) e não deixa jogar antes de aceitar. Os lugares ficam **só no
aparelho** e dentro do link — que mostra onde eles ficam, então só deve ir pra quem se
confia. Está escrito na tela.

## Arquivos

| Arquivo | Pra que serve |
|---|---|
| `index.html` | As telas e todo o visual |
| `caca.js` | Criar, jogar, o link, o GPS e a bússola |
| `sw.js` | Abrir sem internet — importante pra quem está na rua |
