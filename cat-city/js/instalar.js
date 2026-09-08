/* ==========================================================================
   CAT CITY · instalar.js
   INSTALAR COMO APLICATIVO.

   Duas coisas precisam existir pro navegador oferecer a instalação: um
   manifesto (já tinha) e um service worker REGISTRADO (não tinha — o
   arquivo existia mas ninguém o chamava, então o jogo nunca era oferecido
   pra instalar nem funcionava sem internet).

   O Chrome e o Edge avisam sozinhos, pelo "beforeinstallprompt". O Safari
   do iPhone e do iPad não avisa nada: lá o jeito é pelo botão Compartilhar.
   Então o botão sempre aparece, e ele faz a coisa certa em cada aparelho.
   ========================================================================== */
const $ = id => document.getElementById(id);

const ehApple = () => /iphone|ipad|ipod/i.test(navigator.userAgent) ||
  (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
const ehFirefox = () => /firefox/i.test(navigator.userAgent);
export const jaInstalado = () =>
  matchMedia("(display-mode: standalone)").matches ||
  matchMedia("(display-mode: fullscreen)").matches ||
  navigator.standalone === true;

let convite = null;

const PASSOS = {
  apple: [
    ["Toque no botão <b>Compartilhar</b> ⬆️ (a setinha saindo da caixinha), na barra de baixo do Safari."],
    ["Role a lista e toque em <b>Adicionar à Tela de Início</b>."],
    ["Toque em <b>Adicionar</b>. Pronto: o gato aparece junto com os outros aplicativos."],
  ],
  android: [
    ["Toque nos <b>três pontinhos</b> ⋮ no canto do navegador."],
    ["Toque em <b>Instalar aplicativo</b> (ou <b>Adicionar à tela inicial</b>)."],
    ["Confirme. O Cat City vira um ícone junto com os outros aplicativos."],
  ],
  computador: [
    ["Na barra de endereço, procure o ícone <b>⊕ de instalar</b>, do lado direito."],
    ["Clique nele e depois em <b>Instalar</b>."],
    ["O jogo abre em janela própria, sem barra de endereço."],
  ],
  firefox: [
    ["O Firefox no computador não instala aplicativos como o Chrome."],
    ["No <b>celular</b>: menu ⋮ → <b>Instalar</b>. No <b>computador</b>: dá pra usar o Chrome, o Edge ou o Brave."],
    ["De qualquer jeito o jogo já funciona <b>sem internet</b> depois da primeira vez."],
  ],
};

function mostrarPassos(tela) {
  const toque = matchMedia("(pointer: coarse)").matches;
  const qual = ehApple() ? "apple" : ehFirefox() ? "firefox" : toque ? "android" : "computador";
  $("passosInstalar").innerHTML = PASSOS[qual].map((p, i) =>
    '<div class="p"><span class="num">' + (i + 1) + '</span><span>' + p[0] + '</span></div>').join("") +
    '<p class="obs">Instalado ou não, o jogo já guarda tudo no aparelho: depois de abrir uma vez, ' +
    'ele funciona <b>sem internet</b> e o seu progresso continua salvo.</p>';
  tela("telaInstalar");
}

export function ligarInstalar(tela, aviso) {
  /* 1. registrar o service worker — é ele que guarda o jogo pra usar offline */
  if ("serviceWorker" in navigator) {
    addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
  }

  const bt = $("btInstalar");
  if (!bt) return;

  /* 2. quem já instalou não precisa ver o botão */
  if (jaInstalado()) { bt.hidden = true; return; }
  bt.hidden = false;                       // sempre visível: o passo a passo serve pra todo mundo

  addEventListener("beforeinstallprompt", e => {
    e.preventDefault();                    // o convite fica guardado pro nosso botão
    convite = e; bt.hidden = false;
    bt.textContent = "📲 INSTALAR NO APARELHO";
  });

  bt.onclick = async () => {
    if (convite) {                         // o navegador ofereceu: instala na hora
      convite.prompt();
      try { await convite.userChoice; } catch (e) {}
      convite = null;
      return;
    }
    mostrarPassos(tela);                   // não ofereceu: ensina o caminho
  };

  addEventListener("appinstalled", () => {
    bt.hidden = true; convite = null;
    aviso("📲 Cat City instalado! Agora abre pelo ícone.");
  });
}
