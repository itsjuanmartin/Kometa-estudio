// ARCHIVO OSCURO — channel kit: logo, banner, style guide, two thumbnail proposals.
import { chromium } from 'playwright';
import fs from 'fs';
const ROOT = '/home/user/growkaz-stickman-studio', OUT = ROOT + '/projects/canal2-misterio/kit';
fs.mkdirSync(OUT, { recursive: true });
const ff = (n, f) => `@font-face{font-family:${n};src:url(data:font/ttf;base64,${fs.readFileSync(`${ROOT}/assets/fonts/${f}`).toString('base64')})}`;
const FONTS = [ff('Fred', 'Fredoka-Bold.ttf'), ff('Anton', 'Anton-Regular.ttf'), ff('Bebas', 'BebasNeue-Regular.ttf'), ff('Elite', 'SpecialElite-Regular.ttf')].join('') + 'body{margin:0;background:transparent}';

// palette
const INK = '#141210', PAPER = '#f2ecdc', MANILA = '#c9a86a', RED = '#c8261e', AMBER = '#ffcf6a', OLIVE = '#4f5d3a', OL = '#1b1b22';
const grain = (id, o = .22) => `<filter id="${id}"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="7"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 ${o} 0"/></filter>`;
const defs = `<defs>${grain('gr')}<filter id="sh"><feDropShadow dx="10" dy="14" stdDeviation="10" flood-opacity=".6"/></filter>
  <radialGradient id="lamp" cx=".5" cy=".42" r=".75"><stop offset="0" stop-color="#ffe2a0" stop-opacity=".22"/><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".75"/></radialGradient>
  <radialGradient id="beam" cx="0" cy=".5" r="1"><stop offset="0" stop-color="#fff3c0" stop-opacity=".6"/><stop offset="1" stop-color="#fff3c0" stop-opacity="0"/></radialGradient></defs>`;

// ---- Javi, the archivist (toon head + simple body, same family as the animation rig) ----
function head(x, y, r, o = {}) {
  const e = o.expr || 'curious';
  const eyes = e === 'shock'
    ? `<circle cx="${-r * .32}" cy="${-r * .04}" r="${r * .17}" fill="#fff" stroke="${OL}" stroke-width="${r * .055}"/><circle cx="${r * .32}" cy="${-r * .04}" r="${r * .17}" fill="#fff" stroke="${OL}" stroke-width="${r * .055}"/><circle cx="${-r * .27}" cy="${-r * .02}" r="${r * .065}" fill="${OL}"/><circle cx="${r * .37}" cy="${-r * .02}" r="${r * .065}" fill="${OL}"/>`
    : `<ellipse cx="${-r * .3}" cy="0" rx="${r * .085}" ry="${r * .12}" fill="${OL}"/><ellipse cx="${r * .32}" cy="0" rx="${r * .085}" ry="${r * .12}" fill="${OL}"/>`;
  const brows = e === 'shock' ? `M${-r * .52},${-r * .3} L${-r * .14},${-r * .47} M${r * .14},${-r * .47} L${r * .52},${-r * .3}` : `M${-r * .5},${-r * .3} L${-r * .14},${-r * .3} M${r * .16},${-r * .38} L${r * .52},${-r * .26}`;
  const mouth = e === 'shock' ? `<ellipse cx="${r * .05}" cy="${r * .46}" rx="${r * .14}" ry="${r * .18}" fill="#5a1d1d" stroke="${OL}" stroke-width="${r * .05}"/>` : `<path d="M${-r * .18},${r * .42} Q${r * .04},${r * .5} ${r * .24},${r * .34}" stroke="${OL}" stroke-width="${r * .06}" fill="none" stroke-linecap="round"/>`;
  const hair = `<path d="M${-r * 1.0},${-r * .1} Q${-r * 1.05},${-r * 1.0} ${-r * .1},${-r * 1.02} Q${r * .9},${-r * 1.0} ${r * 1.0},${-r * .15} Q${r * .7},${-r * .62} ${r * .05},${-r * .6} Q${-r * .2},${-r * .4} ${-r * .55},${-r * .58} Q${-r * .85},${-r * .45} ${-r * 1.0},${-r * .1}Z" fill="#5a3a24" stroke="${OL}" stroke-width="${r * .08}" stroke-linejoin="round"/>`;
  return `<g transform="translate(${x},${y}) rotate(${o.tilt || 0})"><circle r="${r}" fill="#fbf6ea" stroke="${OL}" stroke-width="${r * .09}"/>${hair}
    <path d="${brows}" stroke="${OL}" stroke-width="${r * .075}" stroke-linecap="round" fill="none"/>${eyes}${mouth}</g>`;
}
function javiBust(x, y, r, o = {}) {   // head + shoulders with olive jacket and ID lanyard
  return `<g transform="translate(${x},${y})"><path d="M${-r * 1.7},${r * 3.2} Q${-r * 1.7},${r * 1.35} ${-r * .6},${r * 1.15} L${r * .6},${r * 1.15} Q${r * 1.7},${r * 1.35} ${r * 1.7},${r * 3.2}Z" fill="${OLIVE}" stroke="${OL}" stroke-width="${r * .09}"/>
    <path d="M${-r * .55},${r * 1.15} L0,${r * 2.0} L${r * .55},${r * 1.15}Z" fill="${PAPER}" stroke="${OL}" stroke-width="${r * .07}"/>
    <path d="M${-r * .3},${r * 1.3} L${-r * .05},${r * 2.3} M${r * .3},${r * 1.3} L${r * .05},${r * 2.3}" stroke="${RED}" stroke-width="${r * .07}"/>
    <rect x="${-r * .32}" y="${r * 2.2}" width="${r * .64}" height="${r * .42}" rx="${r * .06}" fill="${PAPER}" stroke="${OL}" stroke-width="${r * .05}"/><rect x="${-r * .24}" y="${r * 2.29}" width="${r * .18}" height="${r * .22}" fill="#9aa"/>
    <rect x="${r * .0}" y="${r * 2.32}" width="${r * .22}" height="${r * .04}" fill="${OL}"/><rect x="${r * .0}" y="${r * 2.42}" width="${r * .18}" height="${r * .04}" fill="${OL}"/>
    <rect x="${-r * .26}" y="${r * .85}" width="${r * .52}" height="${r * .45}" fill="#fbf6ea" stroke="${OL}" stroke-width="${r * .08}"/>${head(0, 0, r, o)}</g>`;
}
function javiFull(x, y, s) {   // full body for the style guide
  const lw = 9;
  return `<g transform="translate(${x},${y}) scale(${s})">
    <path d="M-40,250 L-55,420 M40,250 L55,420" stroke="${OL}" stroke-width="${46 + lw * 2}" stroke-linecap="round"/><path d="M-40,250 L-55,420 M40,250 L55,420" stroke="#3a3a44" stroke-width="46" stroke-linecap="round"/>
    <ellipse cx="-62" cy="430" rx="44" ry="22" fill="#3a2418" stroke="${OL}" stroke-width="${lw}"/><ellipse cx="66" cy="430" rx="44" ry="22" fill="#3a2418" stroke="${OL}" stroke-width="${lw}"/>
    <path d="M-95,90 L95,90 L110,270 L-110,270Z" fill="${OLIVE}" stroke="${OL}" stroke-width="${lw}" stroke-linejoin="round"/>
    <path d="M-40,90 L0,170 L40,90Z" fill="${PAPER}" stroke="${OL}" stroke-width="${lw - 2}"/>
    <path d="M-95,110 L-150,220 L-120,300" stroke="${OL}" stroke-width="${48 + lw * 2}" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M-95,110 L-150,220 L-120,300" stroke="${OLIVE}" stroke-width="48" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M95,110 L175,170 L240,130" stroke="${OL}" stroke-width="${48 + lw * 2}" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M95,110 L175,170 L240,130" stroke="${OLIVE}" stroke-width="48" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="-120" cy="305" r="30" fill="#fbf6ea" stroke="${OL}" stroke-width="${lw}"/>
    <g transform="translate(250,125) rotate(-25)"><rect x="-10" y="-22" width="120" height="44" rx="10" fill="#3a3a44" stroke="${OL}" stroke-width="${lw}"/><rect x="104" y="-30" width="30" height="60" rx="7" fill="${AMBER}" stroke="${OL}" stroke-width="${lw}"/></g>
    <circle cx="245" cy="128" r="30" fill="#fbf6ea" stroke="${OL}" stroke-width="${lw}"/>
    <path d="M-25,100 L-8,190 M25,100 L8,190" stroke="${RED}" stroke-width="6"/><rect x="-26" y="185" width="52" height="36" rx="5" fill="${PAPER}" stroke="${OL}" stroke-width="5"/>
    <rect x="-22" y="45" width="44" height="50" fill="#fbf6ea" stroke="${OL}" stroke-width="${lw}"/>${head(0, -30, 92)}</g>`;
}
// ---- props ----
const polaroid = (x, y, rot, w, inner, cap) => `<g transform="translate(${x},${y}) rotate(${rot})" filter="url(#sh)"><rect x="${-w / 2}" y="${-w * .62}" width="${w}" height="${w * 1.2}" fill="#f6f3ea"/><g transform="translate(0,${-w * .12})"><clipPath id="c${x}${y}"><rect x="${-w * .44}" y="${-w * .44}" width="${w * .88}" height="${w * .82}"/></clipPath><rect x="${-w * .44}" y="${-w * .44}" width="${w * .88}" height="${w * .82}" fill="#25313b"/><g clip-path="url(#c${x}${y})">${inner(w)}</g></g><text y="${w * .5}" text-anchor="middle" font-family="Elite" font-size="${w * .1}" fill="#222">${cap}</text></g>`;
const shipPic = w => `<circle cx="${w * .22}" cy="${-w * .25}" r="${w * .08}" fill="#e9e4cf" opacity=".8"/><path d="M${-w * .44},${w * .2} L${w * .44},${w * .2} L${w * .44},${w * .4} L${-w * .44},${w * .4}Z" fill="#16202a"/><path d="M${-w * .25},${w * .16} L${w * .25},${w * .16} L${w * .2},${w * .24} L${-w * .2},${w * .24}Z" fill="#0d1218"/><line x1="${-w * .08}" y1="${w * .16}" x2="${-w * .08}" y2="${-w * .3}" stroke="#0d1218" stroke-width="${w * .02}"/><line x1="${w * .08}" y1="${w * .16}" x2="${w * .08}" y2="${-w * .24}" stroke="#0d1218" stroke-width="${w * .02}"/><path d="M${-w * .07},${-w * .28} L${-w * .07},${w * .06} L${-w * .25},${w * .06}Z" fill="#c9c3ae" opacity=".55"/><path d="M${w * .09},${-w * .22} L${w * .09},${w * .08} L${w * .25},${w * .08}Z" fill="#c9c3ae" opacity=".45"/>`;
const planePic = w => `<circle cx="${w * .1}" cy="0" r="${w * .3}" fill="#e9e4cf" opacity=".85"/><path d="M${-w * .44},${-w * .15} L${w * .44},${-w * .25} L${w * .44},${-w * .19} L${-w * .44},${-w * .09}Z" fill="#0d1218"/><path d="M${-w * .1},${w * .05} q${w * .06},${-w * .12} ${w * .12},0Z" fill="#f6f3ea"/><line x1="${-w * .05}" y1="${w * .05}" x2="${-w * .02}" y2="${w * .16}" stroke="#0d1218" stroke-width="${w * .03}"/>`;
const tentPic = w => `<rect x="${-w * .44}" y="${w * .1}" width="${w * .88}" height="${w * .3}" fill="#dfe8f6"/><path d="M${-w * .3},${w * .14} L${-w * .02},${-w * .14} L${w * .3},${w * .14}Z" fill="#c9b38a"/><path d="M${w * .06},${-w * .04} l${w * .04},${w * .08} l${-w * .02},${w * .03} l${w * .04},${w * .06}" stroke="#05070d" stroke-width="${w * .025}" fill="none"/>`;
const radarPic = w => `<rect x="${-w * .44}" y="${-w * .44}" width="${w * .88}" height="${w * .82}" fill="#06140e"/><circle r="${w * .3}" fill="none" stroke="#39ff9c" stroke-width="${w * .012}"/><circle r="${w * .18}" fill="none" stroke="#39ff9c" stroke-opacity=".5" stroke-width="${w * .01}"/><circle cx="${-w * .1}" cy="${-w * .12}" r="${w * .03}" fill="#39ff9c"/><text x="${w * .05}" y="${w * .05}" font-family="Anton" font-size="${w * .3}" fill="${RED}">?</text>`;
const stamp = (x, y, rot, txt, size, w) => `<g transform="translate(${x},${y}) rotate(${rot})"><rect x="${-w / 2}" y="${-size * .72}" width="${w}" height="${size * 1.32}" fill="none" stroke="${RED}" stroke-width="${size * .1}"/><text y="${size * .34}" text-anchor="middle" font-family="Anton" font-size="${size}" fill="${RED}" letter-spacing="${size * .06}">${txt}</text></g>`;
const tape = (x, y, txt, size) => { const w = txt.length * size * .62 + size * 1.4; return `<g transform="translate(${x},${y}) rotate(-2)"><rect x="${-w / 2}" y="${-size * .85}" width="${w}" height="${size * 1.5}" fill="#0b0a09"/><rect x="${-w / 2}" y="${-size * .85}" width="${w}" height="${size * 1.5}" fill="none" stroke="#3a3632" stroke-width="3"/><text y="${size * .32}" text-anchor="middle" font-family="Elite" font-size="${size}" fill="${PAPER}" letter-spacing="${size * .08}">${txt}</text></g>`; };
const desk = () => `<rect width="1920" height="1080" fill="#241f1b"/>${Array.from({ length: 14 }, (_, i) => `<rect y="${i * 80}" width="1920" height="3" fill="#000" opacity=".22"/>`).join('')}`;
const redact = (x, y, w, h = 24) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#111"/>`;

// ================= LOGO (800x800) =================
function logo() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800">${defs}
  <circle cx="400" cy="400" r="392" fill="#1d1916"/>
  <clipPath id="lc"><circle cx="400" cy="400" r="380"/></clipPath><g clip-path="url(#lc)">
    <path d="M0,560 L800,240 L800,800 L0,800Z" fill="url(#beam)" opacity=".0"/>
    ${head(400, 330, 175, { expr: 'shock' })}
    <path d="M40,520 L300,520 L330,480 L470,480 L500,520 L760,520 L760,820 L40,820Z" fill="${MANILA}" stroke="${OL}" stroke-width="12"/>
    <rect x="40" y="520" width="720" height="18" fill="#b08f55"/>
    ${stamp(400, 650, -8, 'CLASIFICADO', 76, 470)}
  <rect width="800" height="800" filter="url(#gr)" opacity=".7"/></g>
  <circle cx="400" cy="400" r="380" fill="none" stroke="${OL}" stroke-width="16"/><circle cx="400" cy="400" r="366" fill="none" stroke="${RED}" stroke-width="8"/></svg>`;
}

// ================= BANNER (2560x1440 via 1920x1080 @ 4/3) =================
function banner() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080">${defs}${desk()}
  <g stroke="${RED}" stroke-width="4" fill="none" opacity=".9"><path d="M250,250 Q330,420 360,560"/><path d="M250,250 Q520,250 640,300"/><path d="M1680,260 Q1560,420 1570,560"/><path d="M1680,260 Q1430,240 1290,300"/></g>
  ${polaroid(250, 270, -8, 230, planePic, 'D. B. COOPER')}${polaroid(360, 790, 6, 230, tentPic, 'DIÁTLOV 1959')}
  ${polaroid(1680, 270, 7, 230, shipPic, 'MARY CELESTE')}${polaroid(1560, 800, -6, 230, radarPic, 'MH370')}
  ${[[250, 130], [360, 650], [1680, 130], [1560, 660]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="13" fill="${RED}" stroke="${OL}" stroke-width="3"/>`).join('')}
  <!-- safe area: 380..1540 x 382..698 -->
  <g filter="url(#sh)"><path d="M400,400 L700,400 L730,370 L900,370 L930,400 L1520,400 L1520,690 L400,690Z" fill="${MANILA}" stroke="${OL}" stroke-width="6"/></g>
  <clipPath id="fc"><rect x="400" y="300" width="1120" height="390"/></clipPath><g clip-path="url(#fc)">${javiBust(560, 515, 82, { expr: 'curious' })}</g>
  <rect x="400" y="640" width="1120" height="50" fill="${MANILA}"/><line x1="400" y1="640" x2="1520" y2="640" stroke="#a68646" stroke-width="4"/>
  ${tape(1110, 470, 'ARCHIVO OSCURO', 70)}
  <text x="1110" y="590" text-anchor="middle" font-family="Anton" font-size="38" fill="${INK}" letter-spacing="2">MISTERIOS REALES QUE NADIE HA PODIDO CERRAR</text>
  <text x="1110" y="672" text-anchor="middle" font-family="Elite" font-size="34" fill="${RED}">Nuevo expediente: lunes y viernes</text>
  ${stamp(1440, 345, 8, 'CLASIFICADO', 34, 230)}
  <rect width="1920" height="1080" fill="url(#lamp)"/><rect width="1920" height="1080" filter="url(#gr)"/></svg>`;
}

// ================= THUMBNAILS =================
function thumbA() {   // Mary Celeste
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080">${defs}${desk()}
  <path d="M520,600 L1920,120 L1920,1080 L700,1080Z" fill="url(#beam)" opacity=".45"/>
  ${polaroid(1290, 560, 4, 820, shipPic, '4 DIC 1872')}
  <ellipse cx="1290" cy="470" rx="190" ry="95" fill="none" stroke="${RED}" stroke-width="16" transform="rotate(4 1290 470)"/>
  <path d="M1040,330 Q980,250 900,250" stroke="${RED}" stroke-width="14" fill="none"/><path d="M900,250 l40,-26 M900,250 l34,30" stroke="${RED}" stroke-width="14" stroke-linecap="round"/>
  ${javiBust(330, 690, 210, { expr: 'shock', tilt: -6 })}
  <text x="60" y="190" font-family="Anton" font-size="190" fill="${PAPER}" stroke="${INK}" stroke-width="10" paint-order="stroke">NADIE</text>
  <text x="60" y="380" font-family="Anton" font-size="190" fill="${RED}" stroke="${INK}" stroke-width="10" paint-order="stroke">A BORDO</text>
  ${stamp(1590, 150, 8, 'CLASIFICADO', 64, 470)}
  <rect width="1920" height="1080" fill="url(#lamp)" opacity=".7"/><rect width="1920" height="1080" filter="url(#gr)"/></svg>`;
}
function thumbB() {   // D. B. Cooper wanted poster
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080">${defs}${desk()}
  <g transform="translate(1420,560) rotate(3) scale(.94)" filter="url(#sh)"><rect x="-380" y="-480" width="760" height="980" fill="#e8dcbc"/>
    <text y="-370" text-anchor="middle" font-family="Anton" font-size="120" fill="${INK}" letter-spacing="8">SE BUSCA</text>
    <rect x="-300" y="-320" width="600" height="520" fill="#d6c79f" stroke="${INK}" stroke-width="6"/>
    <g transform="translate(0,-40)"><path d="M-260,240 Q-260,90 -110,70 L110,70 Q260,90 260,240Z" fill="${INK}"/><path d="M-50,70 L0,170 L50,70Z" fill="#f6f3ea"/><path d="M-10,80 L10,80 L8,170 L0,185 L-8,170Z" fill="${RED}"/>
      <circle cy="-60" r="125" fill="#f6f3ea" stroke="${INK}" stroke-width="10"/><rect x="-120" y="-95" width="240" height="64" rx="22" fill="${INK}"/><path d="M-60,10 Q0,-4 60,10" stroke="${INK}" stroke-width="9" fill="none"/>
      <path d="M-140,-110 Q0,-260 140,-110 L170,-100 L-170,-100Z" fill="${INK}"/></g>
    <text y="270" text-anchor="middle" font-family="Elite" font-size="44" fill="${INK}">"DAN COOPER" · 1971</text>
    ${redact(-280, 300, 330, 34)}${redact(70, 300, 210, 34)}<text y="400" text-anchor="middle" font-family="Elite" font-size="40" fill="${INK}">RECOMPENSA</text>${redact(-200, 420, 400, 34)}</g>
  ${stamp(1420, 330, -14, 'SIN RESOLVER', 100, 700)}
  ${javiBust(330, 790, 190, { expr: 'shock', tilt: 5 })}
  <text x="60" y="190" font-family="Anton" font-size="170" fill="${PAPER}" stroke="${INK}" stroke-width="10" paint-order="stroke">SALTÓ…</text>
  <text x="60" y="370" font-family="Anton" font-size="130" fill="${AMBER}" stroke="${INK}" stroke-width="10" paint-order="stroke">Y NADIE</text>
  <text x="60" y="510" font-family="Anton" font-size="120" fill="${AMBER}" stroke="${INK}" stroke-width="10" paint-order="stroke">LO VOLVIÓ A VER</text>
  <rect width="1920" height="1080" fill="url(#lamp)" opacity=".7"/><rect width="1920" height="1080" filter="url(#gr)"/></svg>`;
}

// ================= STYLE GUIDE =================
function guide() {
  const sw = [[INK, 'TINTA', '#141210'], [PAPER, 'PAPEL', '#f2ecdc'], [MANILA, 'CARPETA', '#c9a86a'], [RED, 'SELLO', '#c8261e'], [AMBER, 'LINTERNA', '#ffcf6a'], [OLIVE, 'JAVI', '#4f5d3a']];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080">${defs}${desk()}
  ${tape(500, 90, 'ARCHIVO OSCURO · GUÍA DE ESTILO', 46)}
  <g transform="translate(70,190)"><text font-family="Anton" font-size="40" fill="${PAPER}">PALETA</text>
    ${sw.map(([c, n, h], i) => `<g transform="translate(${(i % 3) * 210},${30 + Math.floor(i / 3) * 170})"><rect width="180" height="110" rx="10" fill="${c}" stroke="${PAPER}" stroke-width="3"/><text y="140" font-family="Bebas" font-size="32" fill="${PAPER}">${n} <tspan fill="#a99f8a">${h}</tspan></text></g>`).join('')}</g>
  <g transform="translate(70,600)"><text font-family="Anton" font-size="40" fill="${PAPER}">TIPOGRAFÍAS</text>
    <text y="90" font-family="Anton" font-size="80" fill="${PAPER}">ANTON · TÍTULOS</text>
    <text y="160" font-family="Elite" font-size="50" fill="${PAPER}">Special Elite · documentos</text>
    <text y="220" font-family="Bebas" font-size="48" fill="#a99f8a">BEBAS NEUE · FECHAS Y DATOS</text></g>
  <g transform="translate(720,190)"><text font-family="Anton" font-size="40" fill="${PAPER}">ELEMENTOS</text>
    ${polaroid(110, 230, -6, 200, shipPic, 'polaroid')}
    <g transform="translate(250,90)"><rect width="300" height="230" fill="${PAPER}"/><text x="20" y="50" font-family="Elite" font-size="26" fill="#222">INFORME Nº 001</text>${redact(20, 70, 240)}${redact(20, 110, 170)}${redact(20, 150, 220)}<text x="20" y="215" font-family="Elite" font-size="22" fill="#222">tachones = suspense</text></g>
    ${stamp(390, 420, -8, 'CLASIFICADO', 50, 340)}
    <path d="M30,520 Q200,470 380,540" stroke="${RED}" stroke-width="5" fill="none"/><circle cx="30" cy="520" r="11" fill="${RED}"/><circle cx="380" cy="540" r="11" fill="${RED}"/><text x="120" y="600" font-family="Bebas" font-size="34" fill="#a99f8a">HILO ROJO = PISTAS CONECTADAS</text>
    <path d="M0,660 L420,600 L420,760Z" fill="url(#beam)" opacity=".8"/><text x="10" y="790" font-family="Bebas" font-size="34" fill="#a99f8a">LINTERNA = REVELAR POCO A POCO</text></g>
  <g transform="translate(1600,430)">${javiFull(0, 0, .95)}</g>
  <text x="1600" y="960" text-anchor="middle" font-family="Anton" font-size="56" fill="${PAPER}">JAVI</text><text x="1600" y="1010" text-anchor="middle" font-family="Elite" font-size="30" fill="${AMBER}">el archivero</text>
  <rect width="1920" height="1080" fill="url(#lamp)" opacity=".5"/><rect width="1920" height="1080" filter="url(#gr)"/></svg>`;
}

const b = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
const jobs = [['logo_800x800', logo(), 800, 800, 1], ['banner_2560x1440', banner(), 1920, 1080, 4 / 3], ['miniatura_A_nadie_a_bordo', thumbA(), 1920, 1080, 1], ['miniatura_B_se_busca', thumbB(), 1920, 1080, 1], ['guia_de_estilo', guide(), 1920, 1080, 1]];
for (const [k, svg, w, h, dpr] of jobs) {
  const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: dpr });
  await p.setContent(`<html><head><style>${FONTS}</style></head><body>${svg}</body></html>`);
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(300);
  await p.screenshot({ path: `${OUT}/${k}.png`, omitBackground: k.startsWith('logo') }); await p.close(); console.log('ok', k);
}
await b.close();
