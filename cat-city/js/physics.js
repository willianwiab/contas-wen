/* ==========================================================================
   CAT CITY · physics.js
   Física simples e sem vergonha: gravidade, empurrão, quique e escorregada.
   Não é realista. É pra ser engraçada.
   ========================================================================== */
export const GRAVIDADE = 26;

/* empurra um corpo redondo pra fora de uma caixa. Devolve o quanto bateu. */
export function tirarDaCaixa(corpo, caixa) {
  const px = Math.max(caixa.x, Math.min(corpo.x, caixa.x + caixa.l));
  const py = Math.max(caixa.y, Math.min(corpo.y, caixa.y + caixa.f));
  const dx = corpo.x - px, dy = corpo.y - py;
  const d2 = dx * dx + dy * dy;
  const r = corpo.raio;
  if (d2 > r * r) return 0;
  const d = Math.sqrt(d2) || .0001;
  const dentro = corpo.x > caixa.x && corpo.x < caixa.x + caixa.l &&
                 corpo.y > caixa.y && corpo.y < caixa.y + caixa.f;
  let nx, ny, empurra;
  if (dentro) {                                   // ficou preso: sai pelo lado mais perto
    const dl = corpo.x - caixa.x, dr = caixa.x + caixa.l - corpo.x;
    const dc = corpo.y - caixa.y, db = caixa.y + caixa.f - corpo.y;
    const m = Math.min(dl, dr, dc, db);
    if (m === dl) { nx = -1; ny = 0; empurra = dl + r; }
    else if (m === dr) { nx = 1; ny = 0; empurra = dr + r; }
    else if (m === dc) { nx = 0; ny = -1; empurra = dc + r; }
    else { nx = 0; ny = 1; empurra = db + r; }
  } else { nx = dx / d; ny = dy / d; empurra = r - d; }
  corpo.x += nx * empurra; corpo.y += ny * empurra;
  const velNormal = corpo.vx * nx + corpo.vy * ny;
  if (velNormal < 0) {
    const quique = corpo.quica ? .72 : .12;
    corpo.vx -= (1 + quique) * velNormal * nx;
    corpo.vy -= (1 + quique) * velNormal * ny;
    return -velNormal;
  }
  return 0;
}

/* dois corpos redondos se empurrando */
export function empurrar(a, b) {
  const dx = b.x - a.x, dy = b.y - a.y;
  const d = Math.hypot(dx, dy);
  const soma = a.raio + b.raio;
  if (d >= soma || d === 0) return 0;
  const nx = dx / d, ny = dy / d, sobra = soma - d;
  const ma = a.massa || 1, mb = b.massa || 1, total = ma + mb;
  a.x -= nx * sobra * (mb / total); a.y -= ny * sobra * (mb / total);
  b.x += nx * sobra * (ma / total); b.y += ny * sobra * (ma / total);
  const vrel = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
  if (vrel < 0) {
    const j = -1.35 * vrel / total;
    a.vx -= j * mb * nx; a.vy -= j * mb * ny;
    b.vx += j * ma * nx; b.vy += j * ma * ny;
  }
  return sobra;
}

/* gravidade + chão */
export function cair(corpo, dt) {
  corpo.vz = (corpo.vz || 0) - GRAVIDADE * dt;
  corpo.z = (corpo.z || 0) + corpo.vz * dt;
  if (corpo.z <= 0) {
    const bateu = corpo.vz < -4 ? -corpo.vz : 0;
    corpo.z = 0;
    corpo.vz = corpo.quica && bateu > 5 ? bateu * .55 : 0;
    corpo.noChao = true;
    return bateu;
  }
  corpo.noChao = false;
  return 0;
}

export function atrito(corpo, dt, quanto) {
  const k = Math.pow(quanto, dt * 60);
  corpo.vx *= k; corpo.vy *= k;
  if (Math.abs(corpo.vx) < .02) corpo.vx = 0;
  if (Math.abs(corpo.vy) < .02) corpo.vy = 0;
}
