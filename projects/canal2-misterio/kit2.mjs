// ARCHIVO OSCURO — channel kit: logo, banner, style guide, two thumbnail proposals.
import { chromium } from 'playwright';
import fs from 'fs';
const ROOT = '/home/user/growkaz-stickman-studio', OUT = ROOT + '/projects/canal2-misterio/kit_v2';
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


// ================= v2: actualidad contada como un thriller =================
const NEON = '#39ff9c', CASH = '#4f9a4a', CASH2 = '#7cc46f';
const T = (x, y, s, fill, txt, o = {}) => `<text x="${x}" y="${y}" font-family="Anton" font-size="${s}" fill="${fill}" stroke="${INK}" stroke-width="${s * .07}" paint-order="stroke" ${o.anchor ? `text-anchor="${o.anchor}"` : ''} ${o.rot ? `transform="rotate(${o.rot} ${x} ${y})"` : ''} letter-spacing="${o.ls || 1}">${txt}</text>`;
const bill = (x, y, rot, s = 1) => `<g transform="translate(${x},${y}) rotate(${rot}) scale(${s})"><rect x="-90" y="-42" width="180" height="84" rx="6" fill="${CASH2}" stroke="${OL}" stroke-width="6"/><rect x="-72" y="-28" width="144" height="56" rx="4" fill="none" stroke="${CASH}" stroke-width="5"/><circle r="20" fill="${CASH}"/><text y="12" text-anchor="middle" font-family="Anton" font-size="34" fill="${CASH2}">$</text></g>`;
const sack = (x, y, s = 1) => `<g transform="translate(${x},${y}) scale(${s})"><path d="M-80,90 Q-110,-10 -40,-50 L-30,-70 L30,-70 L40,-50 Q110,-10 80,90Z" fill="#c9a874" stroke="${OL}" stroke-width="8" stroke-linejoin="round"/><path d="M-36,-62 L36,-62" stroke="${OL}" stroke-width="10"/><text y="50" text-anchor="middle" font-family="Anton" font-size="90" fill="${CASH}">$</text></g>`;
function hacker(x, y, s) {   // hooded silhouette with neon eyes and a grin
  return `<g transform="translate(${x},${y}) scale(${s})"><path d="M-170,260 Q-180,40 -90,-60 Q0,-170 90,-60 Q180,40 170,260Z" fill="#0a0d0c" stroke="${NEON}" stroke-width="5" stroke-opacity=".6"/>
    <ellipse cx="0" cy="10" rx="92" ry="110" fill="#000"/>
    <path d="M-58,-6 L-18,4 L-58,14Z" fill="${NEON}"/><path d="M58,-6 L18,4 L58,14Z" fill="${NEON}"/>
    <path d="M-42,58 Q0,88 42,58" stroke="${NEON}" stroke-width="7" fill="none" stroke-linecap="round"/>
    <g opacity=".55">${[-50, -18, 14, 46].map(d => `<path d="M${d - 8},${-20} L${d},${-30} L${d + 8},${-20}" stroke="${NEON}" stroke-width="2" fill="none"/>`).join('')}</g></g>`;
}
const hackerPic = w => `<rect x="${-w * .44}" y="${-w * .44}" width="${w * .88}" height="${w * .82}" fill="#05100b"/>${Array.from({ length: 9 }, (_, i) => `<text x="${-w * .4 + i * w * .1}" y="${-w * .3 + (i % 3) * w * .12}" font-family="Bebas" font-size="${w * .06}" fill="${NEON}" opacity=".35">${(i * 37 % 2) ? '1' : '0'}</text>`).join('')}${hacker(0, w * .04, w / 520)}`;
function vault(x, y, r) {
  return `<g transform="translate(${x},${y})"><circle r="${r}" fill="#8f979b" stroke="${OL}" stroke-width="${r * .06}"/><circle r="${r * .78}" fill="#b4bcbf" stroke="${OL}" stroke-width="${r * .04}"/>
    ${Array.from({ length: 6 }, (_, i) => `<line x1="0" y1="0" x2="${Math.cos(i * Math.PI / 3) * r * .55}" y2="${Math.sin(i * Math.PI / 3) * r * .55}" stroke="${OL}" stroke-width="${r * .06}" stroke-linecap="round"/>`).join('')}
    <circle r="${r * .16}" fill="#6d7578" stroke="${OL}" stroke-width="${r * .04}"/>${Array.from({ length: 12 }, (_, i) => `<circle cx="${Math.cos(i * Math.PI / 6) * r * .9}" cy="${Math.sin(i * Math.PI / 6) * r * .9}" r="${r * .03}" fill="${OL}"/>`).join('')}</g>`;
}
const vaultPic = w => `<rect x="${-w * .44}" y="${-w * .44}" width="${w * .88}" height="${w * .82}" fill="#55585a"/><path d="M${-w * .3},${-w * .3} L${w * .1},${-w * .36} L${w * .32},${-w * .1} L${w * .28},${w * .28} L${-w * .2},${w * .32} L${-w * .36},${w * .02}Z" fill="#0b0b0b"/>${vault(0, -w * .02, w * .2)}`;
function phone(x, y, s, o = {}) {
  return `<g transform="translate(${x},${y}) rotate(${o.rot || 0}) scale(${s})"><rect x="-150" y="-290" width="300" height="580" rx="44" fill="#16161c" stroke="${OL}" stroke-width="10"/><rect x="-128" y="-250" width="256" height="500" rx="18" fill="#f4f1e8"/>
    <rect x="-128" y="-250" width="256" height="70" rx="18" fill="#2a5bd7"/><text y="-203" text-anchor="middle" font-family="Fred" font-size="30" fill="#fff">MI BANCO</text>
    <text y="-130" text-anchor="middle" font-family="Fred" font-size="24" fill="#666">Saldo disponible</text>
    <text y="-80" text-anchor="middle" font-family="Anton" font-size="${o.big || 46}" fill="${INK}">${o.amount || 'Gs. 9.000.000.000'}</text>
    ${[0, 1, 2].map(i => `<g transform="translate(0,${-10 + i * 78})"><rect x="-110" y="-28" width="220" height="60" rx="12" fill="#fff" stroke="#ddd" stroke-width="3"/><circle cx="-80" cy="2" r="18" fill="${RED}"/><path d="M-88,2 L-72,2 M-78,-6 L-70,2 L-78,10" stroke="#fff" stroke-width="4" fill="none"/><rect x="-50" y="-10" width="${90 + i * 20}" height="12" rx="6" fill="#bbb"/><text x="100" y="12" text-anchor="end" font-family="Anton" font-size="26" fill="${RED}">−Gs</text></g>`).join('')}</g>`;
}
const phonePic = w => `<rect x="${-w * .44}" y="${-w * .44}" width="${w * .88}" height="${w * .82}" fill="#1e2a3a"/>${phone(0, -w * .02, w / 900, { amount: 'Gs. 9.000M', big: 54 })}<path d="M${-w * .2},${-w * .36} L${w * .12},${-w * .46} L${w * .3},${-w * .36} L${-w * .02},${-w * .26}Z" fill="#111" transform="rotate(-10)"/>`;
function cap(x, y, s, rot) {   // graduation cap
  return `<g transform="translate(${x},${y}) rotate(${rot}) scale(${s})"><path d="M-80,10 L-80,70 Q0,110 80,70 L80,10Z" fill="#1b1b22" stroke="${OL}" stroke-width="8"/><path d="M-190,0 L0,-80 L190,0 L0,80Z" fill="#26262e" stroke="${OL}" stroke-width="8" stroke-linejoin="round"/><path d="M0,0 L130,30 L140,120" stroke="${AMBER}" stroke-width="10" fill="none"/><rect x="128" y="110" width="26" height="50" rx="6" fill="${AMBER}" stroke="${OL}" stroke-width="5"/><circle r="12" fill="${AMBER}"/></g>`;
}
const vignette = `<rect width="1920" height="1080" fill="url(#lamp)" opacity=".55"/><rect width="1920" height="1080" filter="url(#gr)"/>`;
const badge = (x, y, txt) => `<g transform="translate(${x},${y})"><rect x="0" y="-46" width="${txt.length * 27 + 60}" height="64" rx="10" fill="${RED}" stroke="${OL}" stroke-width="6"/><circle cx="30" cy="-14" r="10" fill="#fff"/><text x="52" y="2" font-family="Anton" font-size="44" fill="#fff" letter-spacing="2">${txt}</text></g>`;

// ---- LOGO: Javi + folder + VERIFICADO (reads at 98px) ----
function logo2() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800">${defs}
  <circle cx="400" cy="400" r="392" fill="#1d1916"/><clipPath id="lc"><circle cx="400" cy="400" r="380"/></clipPath><g clip-path="url(#lc)">
    <path d="M400,330 L900,120 L900,560Z" fill="url(#beam)" opacity=".55"/>
    ${head(390, 320, 180, { expr: 'curious', tilt: -4 })}
    <path d="M30,520 L290,520 L320,478 L480,478 L510,520 L770,520 L770,820 L30,820Z" fill="${MANILA}" stroke="${OL}" stroke-width="12"/><rect x="30" y="520" width="740" height="18" fill="#b08f55"/>
    ${stamp(400, 655, -7, 'ARCHIVO OSCURO', 64, 560)}
  <rect width="800" height="800" filter="url(#gr)" opacity=".6"/></g>
  <circle cx="400" cy="400" r="380" fill="none" stroke="${OL}" stroke-width="16"/><circle cx="400" cy="400" r="366" fill="none" stroke="${RED}" stroke-width="8"/></svg>`;
}
// ---- BANNER ----
function banner2() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080">${defs}${desk()}
  <g stroke="${RED}" stroke-width="4" fill="none" opacity=".9"><path d="M250,250 Q330,420 360,560"/><path d="M250,250 Q520,250 640,300"/><path d="M1680,260 Q1560,420 1570,560"/><path d="M1680,260 Q1430,240 1290,300"/></g>
  ${polaroid(250, 270, -8, 230, hackerPic, 'BINANCE 2026')}${polaroid(360, 790, 6, 230, vaultPic, 'LA BÓVEDA')}
  ${polaroid(1680, 270, 7, 230, phonePic, 'OP. ÍCARO')}${polaroid(1560, 800, -6, 230, radarPic, 'MH370')}
  ${[[250, 130], [360, 650], [1680, 130], [1560, 660]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="13" fill="${RED}" stroke="${OL}" stroke-width="3"/>`).join('')}
  <g filter="url(#sh)"><path d="M400,400 L700,400 L730,370 L900,370 L930,400 L1520,400 L1520,690 L400,690Z" fill="${MANILA}" stroke="${OL}" stroke-width="6"/></g>
  <clipPath id="fc"><rect x="400" y="300" width="1120" height="390"/></clipPath><g clip-path="url(#fc)">${javiBust(560, 515, 82, { expr: 'curious' })}</g>
  <rect x="400" y="640" width="1120" height="50" fill="${MANILA}"/><line x1="400" y1="640" x2="1520" y2="640" stroke="#a68646" stroke-width="4"/>
  ${tape(1110, 470, 'ARCHIVO OSCURO', 70)}
  <text x="1110" y="585" text-anchor="middle" font-family="Anton" font-size="34" fill="${INK}" letter-spacing="1">LO QUE DE VERDAD PASÓ, CONTADO COMO UN THRILLER</text>
  <text x="1110" y="672" text-anchor="middle" font-family="Elite" font-size="32" fill="${RED}">Nuevo expediente cada semana · Shorts a diario</text>
  ${stamp(1430, 345, 8, 'VERIFICADO', 34, 220)}
  <rect width="1920" height="1080" fill="url(#lamp)"/><rect width="1920" height="1080" filter="url(#gr)"/></svg>`;
}
// ---- THUMB 1: Binance ----
function thumb1() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080">${defs}<rect width="1920" height="1080" fill="#07110c"/>
  ${Array.from({ length: 40 }, (_, i) => `<text x="${900 + (i * 97) % 1000}" y="${60 + (i * 53) % 1000}" font-family="Bebas" font-size="${30 + (i % 4) * 10}" fill="${NEON}" opacity="${.12 + (i % 3) * .06}">${['01', '1101', '0x6F', 'BTC', '10', 'ETH'][i % 6]}</text>`).join('')}
  <g filter="url(#sh)" transform="translate(1340,520) rotate(3)"><rect x="-470" y="-360" width="940" height="680" rx="26" fill="#0e1412" stroke="${OL}" stroke-width="10"/><rect x="-470" y="-360" width="940" height="70" rx="26" fill="#1d2724"/>
    <circle cx="-420" cy="-325" r="13" fill="${RED}"/><circle cx="-382" cy="-325" r="13" fill="${AMBER}"/><circle cx="-344" cy="-325" r="13" fill="${NEON}"/>
    <text x="-300" y="-312" font-family="Fred" font-size="34" fill="#cfd8d4">Entrevista de trabajo · RR. HH.</text>
    <clipPath id="vc"><rect x="-450" y="-280" width="900" height="580" rx="12"/></clipPath><g clip-path="url(#vc)"><rect x="-450" y="-280" width="900" height="580" fill="#0a1a12"/>${hacker(0, 20, 1.45)}</g>
    <rect x="-440" y="230" width="210" height="56" rx="10" fill="#000" opacity=".7"/><text x="-420" y="270" font-family="Fred" font-size="30" fill="#fff">● EN VIVO</text></g>
  ${stamp(1560, 930, -8, '20 MINUTOS', 66, 440)}
  ${bill(820, 900, -20, 1.1)}${bill(1080, 990, 14, 1)}${bill(640, 1010, 8, .9)}
  ${javiBust(300, 760, 190, { expr: 'shock', tilt: -6 })}
  ${T(50, 200, 150, PAPER, 'ENTREVISTA')}${T(50, 360, 150, PAPER, 'FALSA')}
  ${T(50, 560, 200, NEON, '$6.300M')}
  ${vignette}</svg>`;
}
// ---- THUMB 2: BCI Concepción ----
function thumb2() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080">${defs}<rect width="1920" height="1080" fill="#5d6062"/>
  ${Array.from({ length: 12 }, (_, i) => `<rect x="${(i % 2) * -60}" y="${i * 92}" width="1980" height="4" fill="#4a4c4e"/>`).join('')}
  <path d="M900,180 L1200,120 L1420,200 L1700,160 L1820,420 L1760,760 L1520,930 L1150,960 L930,820 L860,520Z" fill="#0a0a0a" stroke="#3b3b3b" stroke-width="14"/>
  <path d="M1000,260 L1700,240 L1700,880 L1020,860Z" fill="url(#beam)" opacity=".25"/>
  ${vault(1360, 560, 300)}
  ${sack(1090, 870, 1.25)}${sack(1650, 860, 1.05)}${bill(1300, 960, -12)}${bill(1480, 1000, 18, .9)}${bill(960, 990, 6, .8)}
  ${[[880, 300, 30], [840, 600, 60], [1180, 980, 30], [1780, 300, 40]].map(([x, y, r]) => `<path d="M${x},${y} l${r},${r / 3} l${-r / 2},${r} Z" fill="#8a8d8f" stroke="${OL}" stroke-width="5"/>`).join('')}
  ${stamp(1500, 110, 8, 'PRÓFUGOS', 74, 420)}
  ${javiBust(300, 780, 185, { expr: 'shock', tilt: 5 })}
  ${T(50, 200, 160, PAPER, 'UN AGUJERO…')}
  ${T(50, 400, 190, AMBER, '8.600')}${T(50, 560, 140, AMBER, 'MILLONES')}
  ${vignette}</svg>`;
}
// ---- THUMB 3: Operación Ícaro (Paraguay) ----
function thumb3() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080">${defs}<rect width="1920" height="1080" fill="#13202e"/>
  <path d="M1320,540 L1920,0 L1920,1080Z" fill="url(#beam)" opacity=".18"/>
  ${phone(1360, 600, 1.45, { rot: 6, amount: 'Gs. 9.000.000.000', big: 34 })}
  ${cap(1370, 150, 1.25, -12)}
  ${[[1000, 380, '−Gs. 700M'], [1690, 820, '−Gs. 1.200M'], [1000, 820, '−Gs. 450M']].map(([x, y, t]) => `<g transform="translate(${x},${y}) rotate(-6)"><rect x="-150" y="-46" width="300" height="70" rx="35" fill="${RED}" stroke="${OL}" stroke-width="6"/><text y="4" text-anchor="middle" font-family="Anton" font-size="42" fill="#fff">${t}</text></g>`).join('')}
  ${stamp(1590, 1010, -6, 'OPERACIÓN ÍCARO', 56, 520)}
  ${javiBust(300, 780, 185, { expr: 'shock', tilt: -5 })}
  ${T(50, 200, 170, PAPER, 'TENÍA 18')}
  ${T(50, 380, 150, AMBER, '9.000')}${T(50, 530, 130, AMBER, 'MILLONES')}
  ${vignette}</svg>`;
}

// ---- TikTok cover · Short 1/5 (1080x1920, inside TikTok's visible zone) ----
function cover1() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920">${defs}<rect width="1080" height="1920" fill="#06110c"/>
  ${Array.from({ length: 70 }, (_, i) => `<text x="${(i * 157) % 1080}" y="${(i * 263) % 1920}" font-family="Bebas" font-size="${34 + (i % 4) * 10}" fill="${NEON}" opacity="${.1 + (i % 3) * .06}">${['01', '1101', '₿', 'Ξ', '$', '0x6F'][i % 6]}</text>`).join('')}
  <rect width="1080" height="1920" fill="url(#lamp)" opacity=".5"/>
  <g transform="translate(70,0)">
  ${T(0, 340, 104, PAPER, 'LE HICIERON UNA')}
  ${T(-6, 510, 170, AMBER, 'ENTREVISTA…')}
  </g>
  <g filter="url(#sh)" transform="translate(470,900) rotate(-3)"><rect x="-380" y="-280" width="760" height="520" rx="24" fill="#0e1412" stroke="${OL}" stroke-width="10"/><rect x="-380" y="-280" width="760" height="60" rx="24" fill="#1d2724"/>
    <circle cx="-340" cy="-250" r="11" fill="${RED}"/><circle cx="-306" cy="-250" r="11" fill="${AMBER}"/><circle cx="-272" cy="-250" r="11" fill="${NEON}"/><text x="-240" y="-240" font-family="Fred" font-size="28" fill="#cfd8d4">Entrevista · RR. HH.</text>
    <clipPath id="cv"><rect x="-362" y="-212" width="724" height="436" rx="10"/></clipPath><g clip-path="url(#cv)"><rect x="-362" y="-212" width="724" height="436" fill="#0a1a12"/>${hacker(0, 20, 1.15)}</g></g>
  <g transform="translate(560,640) rotate(-4)"><rect x="-330" y="-60" width="660" height="120" rx="40" fill="#fff" stroke="${OL}" stroke-width="6"/><text y="20" text-anchor="middle" font-family="Fred" font-size="58" fill="${INK}">¡Estás contratado! 😊</text></g>
  ${bill(170, 1210, -18, 1.1)}${bill(840, 1240, 16, 1)}${bill(560, 1300, -6, .9)}
  ${javiBust(230, 1290, 120, { expr: 'shock', tilt: -6 })}
  ${T(400, 1380, 120, NEON, '$6.300 M', { anchor: 'start' })}
  <g transform="translate(540,1460)"><rect x="-250" y="-34" width="500" height="68" rx="34" fill="#0b0a09" stroke="${PAPER}" stroke-width="3"/><text y="14" text-anchor="middle" font-family="Elite" font-size="34" fill="${PAPER}">ARCHIVO OSCURO · 1/5</text></g>
  <rect width="1080" height="1920" filter="url(#gr)"/></svg>`;
}

function coverNv1() {
  const img = 'data:image/jpeg;base64,' + fs.readFileSync(`${ROOT}/projects/ao-002-nvidia/assets/photos/jensen.jpg`).toString('base64'); const NVG = '#76b900';
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1080" height="1920">${defs}<rect width="1080" height="1920" fill="#060a04"/>
  ${Array.from({ length: 34 }, (_, i) => `<path d="M${(i * 173) % 1080},${(i * 311) % 1920} h${80 + (i % 5) * 40} v${(i % 2 ? 1 : -1) * (60 + (i % 4) * 30)} h${60}" fill="none" stroke="${NVG}" stroke-width="4" opacity=".18"/>`).join('')}
  <radialGradient id="redg"><stop offset="0" stop-color="#ff2a2a" stop-opacity=".45"/><stop offset="1" stop-color="#ff2a2a" stop-opacity="0"/></radialGradient><circle cx="760" cy="980" r="520" fill="url(#redg)"/>
  <rect width="1080" height="1920" fill="url(#lamp)" opacity=".45"/>
  <g transform="translate(70,0)">${T(0, 330, 150, PAPER, '¿UNA ESPÍA')}${T(-4, 500, 150, RED, 'HUNDIÓ A')}${T(-4, 680, 170, NVG, 'NVIDIA?')}</g>
  <g transform="translate(330,1060) rotate(-5)" filter="url(#sh)"><rect x="-250" y="-290" width="500" height="620" fill="#f6f3ea"/><clipPath id="jcl"><rect x="-224" y="-264" width="448" height="500"/></clipPath>
    <image xlink:href="${img}" href="${img}" x="-280" y="-290" width="640" height="694" clip-path="url(#jcl)" preserveAspectRatio="xMidYMid slice"/><text y="290" text-anchor="middle" font-family="Elite" font-size="40" fill="#222">J. HUANG · NVIDIA</text></g>
  <g transform="translate(800,1080)" filter="url(#sh)"><ellipse cx="0" cy="-90" rx="150" ry="190" fill="#08070a" stroke="#ff3a2a" stroke-width="5"/><path d="M-150,-90 L-170,150 L-90,180 L-70,40Z M150,-90 L170,150 L90,180 L70,40Z" fill="#08070a"/><path d="M-250,330 L-225,150 L-100,90 L100,90 L225,150 L250,330Z" fill="#08070a" stroke="#ff3a2a" stroke-width="5"/>
    <text y="-40" text-anchor="middle" font-family="Anton" font-size="200" fill="#ff3a2a">?</text></g>
  ${stamp(560, 1470, -6, 'SIN CONFIRMAR', 76, 620)}
  <g transform="translate(540,1600)"><rect x="-300" y="-36" width="600" height="72" rx="36" fill="#0b0a09" stroke="${PAPER}" stroke-width="3"/><text y="14" text-anchor="middle" font-family="Elite" font-size="34" fill="${PAPER}">ARCHIVO OSCURO · EXP. 002</text></g>
  <rect width="1080" height="1920" filter="url(#gr)"/></svg>`;
}

// ---- Instagram presentation carousel (1080x1350) ----
const IGW = 1080, IGH = 1350;
const igBg = () => `<rect width="${IGW}" height="${IGH}" fill="#241f1b"/>${Array.from({ length: 18 }, (_, i) => `<rect y="${i * 80}" width="${IGW}" height="3" fill="#000" opacity=".22"/>`).join('')}`;
const igEnd = (n) => `<text x="${IGW - 60}" y="${IGH - 50}" text-anchor="end" font-family="Elite" font-size="30" fill="${PAPER}" opacity=".7">${n}/5</text><rect width="${IGW}" height="${IGH}" fill="url(#lamp)" opacity=".6"/><rect width="${IGW}" height="${IGH}" filter="url(#gr)"/>`;
const svgIG = (inner) => `<svg xmlns="http://www.w3.org/2000/svg" width="${IGW}" height="${IGH}">${defs}${inner}</svg>`;
function ig1() { return svgIG(`${igBg()}<path d="M330,700 L1080,330 L1080,1150Z" fill="url(#beam)" opacity=".55"/>
  ${tape(540, 230, 'ARCHIVO OSCURO', 74)}
  ${T(540, 400, 64, PAPER, 'CASOS REALES QUE', { anchor: 'middle' })}${T(540, 480, 64, AMBER, 'PARECEN DE PELÍCULA', { anchor: 'middle' })}
  ${javiBust(330, 860, 150, { expr: 'curious', tilt: -4 })}
  ${polaroid(800, 900, 6, 300, hackerPic, 'BINANCE 2026')}
  ${stamp(800, 1180, -6, 'EXPEDIENTE ABIERTO', 46, 520)}
  <text x="540" y="1290" text-anchor="middle" font-family="Elite" font-size="34" fill="${PAPER}">desliza →</text>${igEnd(1)}`); }
function ig2() { return svgIG(`${igBg()}${T(80, 200, 96, AMBER, '¿QUÉ ES ESTO?')}
  <g transform="translate(540,720) rotate(-1.5)" filter="url(#sh)"><rect x="-440" y="-430" width="880" height="860" fill="${PAPER}"/>
  <text x="-380" y="-330" font-family="Elite" font-size="44" fill="${INK}">Soy Javi, el archivero.</text>
  <text x="-380" y="-240" font-family="Elite" font-size="38" fill="${INK}">Cada semana abro el expediente</text><text x="-380" y="-190" font-family="Elite" font-size="38" fill="${INK}">de un caso real:</text>
  ${['🔓  hackeos millonarios', '💰  robos imposibles', '🏃  fugas que nadie explicó', '❓  misterios sin cerrar'].map((l, i) => `<text x="-380" y="${-80 + i * 85}" font-family="Fred" font-size="46" fill="${INK}">${l}</text>`).join('')}
  <text x="-380" y="330" font-family="Elite" font-size="38" fill="${RED}">Contado como un thriller.</text></g>${igEnd(2)}`); }
function ig3() { return svgIG(`${igBg()}${T(80, 200, 96, AMBER, 'SIN INVENTAR NADA')}
  ${stamp(330, 420, -6, 'CONFIRMADO', 70, 520)}<text x="80" y="540" font-family="Elite" font-size="38" fill="${PAPER}">= lo dicen la policía, la empresa</text><text x="80" y="590" font-family="Elite" font-size="38" fill="${PAPER}">o varios medios serios</text>
  <g transform="translate(330,760) rotate(5)"><rect x="-270" y="-60" width="540" height="120" fill="none" stroke="${AMBER}" stroke-width="9"/><text y="24" text-anchor="middle" font-family="Anton" font-size="66" fill="${AMBER}">SIN CONFIRMAR</text></g>
  <text x="80" y="880" font-family="Elite" font-size="38" fill="${PAPER}">= rumores y teorías: te lo decimos</text>
  ${polaroid(850, 1110, 7, 280, radarPic, 'FOTO REAL')}<text x="80" y="1080" font-family="Elite" font-size="38" fill="${PAPER}">Fotos reales y fuentes</text><text x="80" y="1130" font-family="Elite" font-size="38" fill="${PAPER}">en cada vídeo.</text>${igEnd(3)}`); }
function ig4() { return svgIG(`${igBg()}${T(80, 200, 96, AMBER, 'EXPEDIENTE 001')}
  <g transform="translate(540,640) rotate(-2)" filter="url(#sh)"><rect x="-420" y="-260" width="840" height="520" rx="22" fill="#0e1412" stroke="${OL}" stroke-width="10"/><clipPath id="i4"><rect x="-400" y="-240" width="800" height="480" rx="12"/></clipPath><g clip-path="url(#i4)"><rect x="-400" y="-240" width="800" height="480" fill="#0a1a12"/>${hacker(0, 30, 1.2)}</g></g>
  <g transform="translate(560,380) rotate(-4)"><rect x="-320" y="-56" width="640" height="112" rx="40" fill="#fff" stroke="${OL}" stroke-width="6"/><text y="18" text-anchor="middle" font-family="Fred" font-size="54" fill="${INK}">¡Estás contratado! 😊</text></g>
  ${T(540, 1020, 84, PAPER, 'UNA ENTREVISTA DE TRABAJO…', { anchor: 'middle' })}${T(540, 1130, 100, NEON, '6.300 MILLONES $', { anchor: 'middle' })}
  <text x="540" y="1220" text-anchor="middle" font-family="Elite" font-size="34" fill="${PAPER}">Ya en YouTube · enlace en la bio</text>${igEnd(4)}`); }
function ig5() { return svgIG(`${igBg()}<clipPath id="i5"><rect width="1080" height="800"/></clipPath><g clip-path="url(#i5)">${javiBust(540, 380, 140, { expr: 'curious' })}</g>
  ${T(540, 900, 80, PAPER, 'UN EXPEDIENTE NUEVO', { anchor: 'middle' })}${T(540, 990, 80, AMBER, 'CADA SEMANA', { anchor: 'middle' })}
  <text x="540" y="1070" text-anchor="middle" font-family="Elite" font-size="40" fill="${PAPER}">Vídeos completos en YouTube · reels a diario</text>
  <g transform="translate(540,1190)"><rect x="-380" y="-50" width="760" height="100" rx="50" fill="${RED}" stroke="${OL}" stroke-width="6"/><text y="16" text-anchor="middle" font-family="Anton" font-size="52" fill="#fff" letter-spacing="2">SÍGUENOS · ¿QUÉ CASO ABRIMOS?</text></g>${igEnd(5)}`); }

const b = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
const jobs = [['logo_800x800', logo2(), 800, 800, 1, 'png'], ['banner_2560x1440', banner2(), 1920, 1080, 4 / 3, 'png'],
  ['miniatura_01_binance', thumb1(), 1920, 1080, 1, 'jpeg'], ['miniatura_02_boveda_concepcion', thumb2(), 1920, 1080, 1, 'jpeg'], ['miniatura_03_operacion_icaro', thumb3(), 1920, 1080, 1, 'jpeg'], ['portada_tiktok_short1_entrevista', cover1(), 1080, 1920, 1, 'jpeg'], ['portada_tiktok_AO002_short1', coverNv1(), 1080, 1920, 1, 'jpeg'], ['ig_presentacion_1', ig1(), 1080, 1350, 1, 'jpeg'], ['ig_presentacion_2', ig2(), 1080, 1350, 1, 'jpeg'], ['ig_presentacion_3', ig3(), 1080, 1350, 1, 'jpeg'], ['ig_presentacion_4', ig4(), 1080, 1350, 1, 'jpeg'], ['ig_presentacion_5', ig5(), 1080, 1350, 1, 'jpeg']].filter(j => !process.env.ONLY || j[0].includes(process.env.ONLY));
for (const [k, svg, w, h, dpr, type] of jobs) {
  const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: dpr });
  await p.setContent(`<html><head><style>${FONTS}</style></head><body>${svg}</body></html>`);
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(300);
  await p.screenshot({ path: `${OUT}/${k}.${type === 'jpeg' ? 'jpg' : 'png'}`, type, ...(type === 'jpeg' ? { quality: 90 } : { omitBackground: k.startsWith('logo') }) }); await p.close(); console.log('ok', k);
}
await b.close();
