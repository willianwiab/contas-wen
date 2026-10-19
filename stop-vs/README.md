# Stop vs 🛑

Stop em times, cada um no seu aparelho. Fale uma coisa do tema: quem **repetir**, falar algo **fora do tema** ou deixar o **tempo acabar** tá fora! O time que ficar sem ninguém perde.

▶️ **Abrir:** https://willianwiab.github.io/contas-wen/stop-vs/

## Como jogar
1. Uma pessoa aperta **Criar sala** e ganha um código de 5 letras (ou um link).
2. Os amigos abrem o site no aparelho deles, colocam o código e apertam **Entrar**.
3. Cada um escolhe 🔴 Vermelho ou 🔵 Azul.
4. Quem criou a sala escolhe o **modo** (1 vs 1, Dupla, Trio, Quarteto ou Quinteto), o **tema** (ou **Livre**) e o **tempo**, e aperta **Começar!**
5. Os times se revezam. Na sua vez, escreva e aperte **Stop!**

## Juízes
- 🤖 **Juiz robô** (sempre ligado): pega quem repetiu, mesmo com plural, acento, "o/a" na frente ou um errinho de digitação ("Gátos" = "gato").
- 👥 **Votação**: o outro time vota 👍/👎 se a palavra é do tema (8 segundos; empate vale).
- 🧠 **Juiz IA**: roda uma IA pequena no computador de quem criou a sala (a mesma do PokéZap, ~1 GB na primeira vez, Chrome/Edge com WebGPU). Se ela travar, volta pra votação.

## Por dentro
Quem cria a sala é o anfitrião: o jogo fica no aparelho dele e os outros se ligam direto nele por WebRTC usando o [PeerJS](https://peerjs.com) 1.5.5 (`peerjs-1.5.5.min.js`, licença MIT). O servidor público do PeerJS só ajuda os aparelhos a se acharem. Se quem criou a sala fechar o site, a sala acaba.

Pra testar com um servidor PeerJS próprio: `?servidor=host:porta`.

🛡️ Use só apelido e passe o código só pra amigos que você conhece.
