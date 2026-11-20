# ⚽ Bola no Ar (Roblox)

Uma bola cai do céu e **não pode encostar no chão**. Chegue perto e bata nela pra ela subir de novo.
A cada toque ela fica um pouco mais rápida. Faça o maior número de toques que conseguir!

## O que tem no jogo

- **Menu** com:
  - 🎮 **Jogar sozinho**: uma arena só sua.
  - 🌍 **Jogar online**: todo mundo do servidor joga junto, com a mesma bola. O botão mostra quantos já estão jogando.
  - 🏆 **Ranking**: os 10 melhores do mundo.
  - ❓ **Como jogar**.
- **Placar** com os toques, o seu recorde e um botão pra voltar ao menu.
- Clique do mouse ou tecla **E** pra bater. No celular aparece um botão **BATER**.
- Encostar na bola com o corpo também conta (dá pra cabecear!).
- Uma **sombra** no chão mostra onde a bola vai cair.
- A cada 10 toques a bola **muda de cor**.
- **Habilidades** (barra embaixo da tela, cada uma tem tempo de recarga):
  - 🖐 **Arrastar** (segure **Q**): a bola vai atrás do mouse por 3 segundos. No celular, toque no botão e a bola segue o meio da tela.
  - 🚀 **Super Pulo** (**R**): pula bem alto.
  - 💨 **Dash** (**F**): corre rapidinho pra frente.
  - 🐢 **Câmera Lenta** (**G**): a bola quase flutua por 5 segundos (no online vale pra todo mundo).
  - 💥 **Super Batida** (**T**): bate na bola mesmo de longe e joga ela pro meio.
- O **recorde fica salvo** e aparece na lista de jogadores (a tabela do canto da tela).

## Como colocar no Roblox Studio

1. Abra o Roblox Studio e crie um jogo novo com o modelo **Baseplate**.
2. Na janela **Explorer**, clique com o botão direito em **ServerScriptService** → **Insert Object** → **Script**.
   Apague o que estiver escrito e cole tudo do arquivo `BolaNoArServidor.server.lua`.
3. Abra **StarterPlayer**, clique com o botão direito em **StarterPlayerScripts** → **Insert Object** → **LocalScript**.
   Apague o que estiver escrito e cole tudo do arquivo `BolaNoArMenu.client.lua`.
4. Aperte **Play** pra testar.

> Atenção: o primeiro arquivo é um **Script** normal e o segundo é um **LocalScript**. Se trocar, não funciona.

## Pra salvar recorde e ranking

O recorde só fica salvo com o jogo **publicado**:

1. **File → Publish to Roblox**.
2. **Home → Game Settings → Security** e ligue **Enable Studio Access to API Services**.

Sem isso o jogo funciona igual, só que o recorde zera quando você sai.

## Pra testar o online com mais gente

No Studio: aba **Test** → em **Clients and Servers** escolha **2 Players** → **Start**.
Abrem duas janelas e as duas podem entrar no **Jogar online** juntas.

## Quer mudar alguma coisa?

No começo do `BolaNoArServidor.server.lua` tem uma parte chamada `CONFIG`. Dá pra mudar, por exemplo:

- `FORCA_PRA_CIMA`: quanto a bola sobe quando você bate.
- `ANTIGRAVIDADE_INICIAL`: quanto mais perto de 1, mais devagar a bola cai.
- `TAMANHO_ARENA`: o tamanho do chão.
- `RECARGA_ARRASTAR`, `RECARGA_LENTA`, `RECARGA_SUPER_BATIDA`: quantos segundos cada habilidade demora pra voltar.
- `TEMPO_ARRASTO`: quanto tempo dá pra segurar a bola arrastando (se mudar, mude também `TEMPO_ARRASTO` no `BolaNoArMenu.client.lua`).
