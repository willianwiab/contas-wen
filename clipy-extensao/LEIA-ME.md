# 📎 Clipy — a extensão

O Clipy sai do site dele e passa a aparecer **por cima de qualquer página** que
você abrir. YouTube, Google, joguinho, o que for: ele fica num cantinho, lê o
que você digita, comenta a página em que você está e pula na sua frente sem ser
chamado — que era exatamente o que os ajudantes faziam nos anos 90.

---

## Como instalar no Chrome (ou Edge, ou Brave)

Não precisa de conta, não precisa pagar, não passa por loja nenhuma.

1. **Baixe a pasta.** No GitHub do projeto, clique no botão verde **Code** →
   **Download ZIP**. Descompacte em algum lugar que você não vá apagar sem
   querer (a Área de Trabalho serve). O que importa é a pasta
   **`clipy-extensao`** lá de dentro.

2. **Abra a página de extensões.** Digite na barra de endereço:
   `chrome://extensions` (no Edge é `edge://extensions`) e aperte enter.

3. **Ligue o "Modo do desenvolvedor".** É um interruptor no canto de cima, à
   direita.

4. **Clique em "Carregar sem compactação"** (em inglês: *Load unpacked*).

5. **Escolha a pasta `clipy-extensao`.** Não o ZIP, não um arquivo de dentro
   dela: a **pasta**.

Pronto. Abra qualquer site e espere uns segundos — ele aparece no canto de
baixo, à direita.

> **No celular não dá.** O Chrome do Android e o Safari do iPhone não aceitam
> extensão. No celular use o site: ele instala como aplicativo pelo botão 📲.

---

## O que ele faz

- **Lê o que você digita** em qualquer caixa de texto da página e dá palpite,
  com as mesmas 33 regras do site — inclusive **respondendo conta**: escreva
  `20+20+20+7=` em qualquer campo e ele responde `67`.
- **Comenta a página em que você está.** Ele sabe se você está no YouTube, numa
  pesquisa, num e-mail, num site de jogo — e fala alguma coisa sobre isso. E às
  vezes fala uma coisa que não tem nada a ver, que é o mais autêntico.
- **Tem a vozinha de bipe** e todas as animações do site.
- **Dá pra arrastar** pela barra de título, e ele lembra do canto onde ficou.
- **E ele REAGE.** Não fica parado esperando: veja a lista abaixo.

## As reações

São **60 tipos** de reação, com cerca de 230 falas. Algumas:

| quando | ele faz |
| --- | --- |
| você **arrasta** ele | reclama: *"EI! Eu tenho pernas, sabia?!"* |
| você **sacode** ele | fica **tonto de verdade** — gira, entorta, e a tontura dura alguns segundos depois que você solta |
| você joga ele **num canto** | *"Por que fui exilado?"* |
| o mouse **chega perto** | *"Vai clicar em mim ou só ficar olhando?"* |
| abre um **site de jogo** | *"JOGOOOOO!"* |
| cai num **404** | entra em pânico: *"AAAAAAAA! CADÊ A PÁGINA?!"* |
| a página dá **erro 500** | *"O SERVIDOR EXPLODIU!"* |
| a **internet cai** | *"ALÔ? A INTERNET MORREU?"* |
| a página está **em branco** | *"Folha em branco. Meu maior inimigo."* |
| a página **quebra o JavaScript** | *"Alguém quebrou o código."* |
| falta campo no **formulário** | *"Você esqueceu alguma coisa."* |
| você **fecha uma aba** | *"Ei! Eu estava lendo isso!"* |
| você tem **10 abas** | *"VOCÊ PRECISA DE TODAS ESSAS?!"* |
| você tem **30 abas** | *"Isso não é um navegador. É uma biblioteca."* |
| você **troca de aba** | *"Ei! Volta aqui!"* — e comemora quando você volta |
| você **volta** uma página | *"Boa escolha. A anterior era suspeita."* |
| você aperta **F5** | *"De novo?!"* |
| você **digita muito** | *"Está escrevendo um livro?"* |
| você **apaga tudo** | *"TODO ESSE TRABALHO FOI EMBORA."* |
| você deixa o **Caps Lock** ligado | *"POR QUE VOCÊ ESTÁ GRITANDO?!"* |
| você escreve **"clipy"** | *"Você chamou?"* |
| você escreve **"socorro"** | *"O QUE ACONTECEU?!"* |
| você escreve **"kkkkkk"** | *"Detectei risadas."* |
| você fica **30s / 1min / 3min / 5min** parado | vai ficando entediado, degrau por degrau |
| você **volta** depois de muito tempo | *"AH! VOCÊ ESTÁ VIVO!"* |
| tem uma **foto de gato** na página | *"GATO. PRIORIDADE MÁXIMA."* |
| a página é **colorida demais** | *"MEUS OLHOS!"* |
| a página tem **campo de senha** | *"Não vou olhar. Prometo."* |
| você **desliga** ele no painel | *"Tudo bem… eu vou ficar aqui… sozinho…"* e desaparece devagar |

**Como ele decide quem fala primeiro.** Muita coisa pode acontecer junta. Cada
reação entra numa fila com uma **prioridade**, e ele fala uma de cada vez. Um
404 fura a fila (pânico não espera); um comentário solto espera a vez. E cada
tipo tem um tempo de descanso, pra ele não repetir a mesma reclamação toda hora.

## Os botões

| botão | o que faz |
| --- | --- |
| **👉 Cutucar** | ele reage |
| **😶 Quieto** | ele para de dar palpite neste navegador (e volta com 🗣 Falar) |
| **🔊** | liga e desliga a voz |
| **✕** | ele sai **deste site** e não volta mais nele |

No **ícone da extensão** (ao lado da barra de endereço) tem o resto: ligar e
desligar tudo, a **chatice** (de 0 a 100 — é o quanto ele interrompe), o volume,
e a lista dos sites de onde você expulsou ele, com um botão pra deixar entrar de
novo.

---

## Privacidade — e por que isso importa aqui

Extensão que lê o que você digita é exatamente o tipo de coisa que pode ser
usada pra espionar. Por isso esta aqui é feita ao contrário:

- **Ela não tem permissão de internet.** Abra o `manifest.json`: a única
  permissão é `storage`, que serve pra guardar as suas opções. **Não existe pra
  onde mandar os seus dados, nem com que.** Tudo acontece dentro da página, no
  seu computador.

- **Ela nunca lê campo de senha.** Está no `content.js`, na função `ehSenha()`:
  campo de senha, PIN, CVV e cartão são pulados antes de qualquer coisa. Não é
  uma opção que dá pra ligar — é regra.

- **Ela não mexe no que você escreveu.** No site dele, o Clipy censura palavrão
  trocando o texto. Aqui ele **só comenta**. Reescrever o que alguém digitou num
  site que não é nosso seria falta de educação e de segurança.

- **Ela não mostra propaganda e não tem nada escondido.** O código todo está
  aqui, em português, pra qualquer um ler.

> Um ajudante parecido chamado **BonziBuddy** ficou famoso nos anos 2000 e era
> justamente o contrário disso: enchia a tela de propaganda, ficava de olho no
> que a pessoa fazia e era difícil de remover. A empresa foi multada por isso.
> A graça do bichinho na tela dá pra ter sem nada disso — é o que esta extensão
> tenta mostrar.

---

## Estrutura

```
clipy-extensao/
  manifest.json      as permissões (só "storage") e onde a extensão entra
  content.js         o que entra em toda página: a janelinha, a leitura, a
                     fila de reações, o arrastar-e-ficar-tonto, o laço
  reacoes.js         as 230 falas de reação + os detectores (404, gato,
                     página colorida, campo de senha, vídeo pausado…)
  mundo.js           a conta das abas — SEM espionar aba nenhuma
  ouvidor.js         5 linhas que rodam do lado da página, só pra ouvir erro
  comentarios.js     o que ele fala sobre a página em que você está
  popup.html/.js     as opções no ícone da extensão
  teste-extensao.js  53 testes num Chromium de verdade
  js/                copiados do site: o desenho, as regras, a conta, os
                     segredos e a voz
```

### Duas coisas que valem explicar

**Como ele sabe que você fechou uma aba, sem ter permissão pra ver suas abas.**
Ver aba de verdade exigiria a permissão `tabs` — e aí a extensão veria o
endereço e o título de tudo que você abre. Eu não quis isso. Então cada aba
deixa um bilhetinho (um número sorteado e a hora, nada mais) e, quando vai
fechar, deixa um aviso "saí". Se em poucos segundos nascer uma página nova, era
só troca de página. Se não nascer ninguém, foi fechamento de verdade. Ele nunca
sabe **qual** aba era. Só que tinha uma. Está tudo explicado no `mundo.js`.

**Por que existe um arquivo que roda do lado da página.** O `ouvidor.js` é o
único, e tem 5 linhas. O Chrome separa o mundo da extensão do mundo da página —
é isso que impede um site de mexer no Clipy. Só que o evento de erro de
JavaScript não atravessa essa parede: o teste provou. Então o `ouvidor.js` fica
do lado da página só pra ouvir erro e gritar de volta. Ele não lê texto, não lê
campo, não guarda nada, e nem usa a mensagem do erro.

## Como rodar os testes

```
node teste-extensao.js
```

Uma coisa **não** dá pra testar sozinha: **trocar de aba**. O Chromium sob
controle de robô nunca esconde a aba (`document.hidden` fica `false`), e nem
tela de verdade nem o comando de emulação do DevTools mudam isso. Essa parte o
teste avisa que precisa ser conferida na mão — ele não finge que passou.

Os arquivos de `js/` são **cópias** dos do site (`/clipy/js/`). Uma extensão não
consegue carregar arquivo de fora dela, então eles moram nos dois lugares —
quando um mudar, o outro precisa ser copiado junto.

## Como desinstalar

`chrome://extensions` → ache o Clipy → **Remover**. Ou só desligue o
interruptor, se quiser deixar guardado pra depois.
