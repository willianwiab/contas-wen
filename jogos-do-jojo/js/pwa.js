/* ============================================================
   JOGOS DO JOJO — pwa.js
   Registra o Service Worker e mostra um convite para instalar o
   site como aplicativo no celular.

   No Android o navegador avisa quando dá para instalar, e nós
   mostramos o botão. No iPhone não existe esse aviso: o Safari
   só instala pelo menu Compartilhar, então explicamos como fazer.
   ============================================================ */

(function iniciarPWA() {
  const ROOT_PWA = document.documentElement.dataset.root || '';

  // 1. Registra o Service Worker (o que faz o site funcionar offline)
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register(`${ROOT_PWA}sw.js`, { scope: ROOT_PWA || './' })
        .catch((erro) => console.warn('PWA: service worker não registrado —', erro));
    });
  }

  // Se já está aberto como aplicativo, não há o que convidar
  const jaInstalado =
    window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  if (jaInstalado) return;

  const CHAVE_DISPENSADO = 'jojo-instalar-dispensado';
  if (localStorage.getItem(CHAVE_DISPENSADO)) return;

  let promptAdiado = null;

  // 2. Android / Chrome: o navegador avisa que dá para instalar
  window.addEventListener('beforeinstallprompt', (evento) => {
    evento.preventDefault();
    promptAdiado = evento;
    mostrarConvite('android');
  });

  // 3. iPhone / Safari: não existe aviso, então detectamos o aparelho
  const ehIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const ehSafari = /^((?!chrome|android|crios|fxios).)*safari/i.test(navigator.userAgent);
  if (ehIOS && ehSafari) {
    // Espera um pouco para não atrapalhar quem acabou de chegar
    setTimeout(() => mostrarConvite('ios'), 3500);
  }

  function mostrarConvite(tipo) {
    if (document.getElementById('convite-instalar')) return;

    const caixa = document.createElement('div');
    caixa.id = 'convite-instalar';
    caixa.className = 'instalar-app';
    caixa.innerHTML = `
      <img src="${ROOT_PWA}assets/icons/app/jojo-192.png" alt="" width="46" height="46" />
      <div class="instalar-texto">
        <strong>Instalar o Jogos do JoJo</strong>
        <span>${
          tipo === 'ios'
            ? 'Toque em Compartilhar e depois em “Adicionar à Tela de Início”.'
            : 'Adicione na tela de início e jogue como um aplicativo.'
        }</span>
      </div>
      <div class="instalar-botoes">
        ${tipo === 'android' ? '<button class="btn btn-primary btn-sm" id="btn-instalar">Instalar</button>' : ''}
        <button class="instalar-fechar" id="btn-fechar-instalar" aria-label="Fechar">✕</button>
      </div>
    `;
    document.body.appendChild(caixa);
    requestAnimationFrame(() => caixa.classList.add('visivel'));

    const botao = document.getElementById('btn-instalar');
    if (botao) {
      botao.addEventListener('click', async () => {
        if (!promptAdiado) return;
        promptAdiado.prompt();
        const { outcome } = await promptAdiado.userChoice;
        promptAdiado = null;
        if (outcome === 'accepted') fechar(false);
      });
    }

    document.getElementById('btn-fechar-instalar').addEventListener('click', () => fechar(true));

    function fechar(lembrar) {
      caixa.classList.remove('visivel');
      setTimeout(() => caixa.remove(), 300);
      if (lembrar) localStorage.setItem(CHAVE_DISPENSADO, '1');
    }
  }
})();
