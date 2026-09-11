/* ==========================================================================
   CLIPY (extensão) · ouvidor.js
   O ÚNICO PEDACINHO QUE RODA NO MUNDO DA PÁGINA.

   POR QUE ISTO EXISTE
   O JoJo pediu: "se der erro de JavaScript, ele fala 'alguém quebrou o
   código'". Parece fácil e não é. O Chrome roda a extensão num mundo
   separado do mundo da página (é o que impede um site de mexer no Clipy e
   o Clipy de mexer no site). Só que o evento "error" de uma exceção não
   atravessa essa parede: quem escuta do lado da extensão nunca ouve nada.
   Eu testei — e o teste falhou, por isso este arquivo nasceu.

   Então este arquivo, e só ele, roda do lado da página. Ele faz UMA coisa:
   ouve erro e grita "clipy:erro" de volta. E é tudo.

   O QUE ELE NÃO FAZ
   Não lê o texto da página. Não lê campo nenhum. Não guarda nada. Não
   manda nada pra fora (a extensão não tem permissão de rede). Nem a
   mensagem do erro é usada: o Clipy só precisa saber que ACONTECEU um, pra
   fazer a piada. Por isso aqui embaixo não vai nem o texto do erro.
   ========================================================================== */
(() => {
  const avisar = () => {
    try { dispatchEvent(new CustomEvent("clipy:erro")); } catch (e) {}
  };
  addEventListener("error", e => { if (e instanceof ErrorEvent) avisar(); });
  addEventListener("unhandledrejection", avisar);
})();
