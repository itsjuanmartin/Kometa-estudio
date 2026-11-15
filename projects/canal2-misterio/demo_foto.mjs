// Demo of the "FOTO REAL" moment: a real public-domain photo inside our polaroid, on the archive desk.
import { chromium } from 'playwright';
import fs from 'fs';
const ROOT = '/home/user/growkaz-stickman-studio', P = ROOT + '/projects/canal2-misterio';
const ff = (n, f) => `@font-face{font-family:${n};src:url(data:font/ttf;base64,${fs.readFileSync(`${ROOT}/assets/fonts/${f}`).toString('base64')})}`;
const img = 'data:image/jpeg;base64,' + fs.readFileSync(P + '/photos/grimes.jpg').toString('base64');
const OL = '#1b1b22', RED = '#c8261e', PAPER = '#f2ecdc';
const head = (x, y, r) => `<g transform="translate(${x},${y})"><circle r="${r}" fill="#fbf6ea" stroke="${OL}" stroke-width="${r * .09}"/>
 <path d="M${-r},${-r * .1} Q${-r * 1.05},${-r} ${-r * .1},${-r * 1.02} Q${r * .9},${-r} ${r},${-r * .15} Q${r * .7},${-r * .62} ${r * .05},${-r * .6} Q${-r * .2},${-r * .4} ${-r * .55},${-r * .58} Q${-r * .85},${-r * .45} ${-r},${-r * .1}Z" fill="#5a3a24" stroke="${OL}" stroke-width="${r * .08}"/>
 <path d="M${-r * .5},${-r * .3} L${-r * .14},${-r * .3} M${r * .16},${-r * .38} L${r * .52},${-r * .26}" stroke="${OL}" stroke-width="${r * .075}" stroke-linecap="round"/>
 <ellipse cx="${-r * .3}" cy="0" rx="${r * .085}" ry="${r * .12}" fill="${OL}"/><ellipse cx="${r * .32}" cy="0" rx="${r * .085}" ry="${r * .12}" fill="${OL}"/>
 <path d="M${-r * .15},${r * .45} Q${r * .05},${r * .38} ${r * .2},${r * .45}" stroke="${OL}" stroke-width="${r * .06}" fill="none" stroke-linecap="round"/></g>`;
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080"><defs>
 <filter id="gr"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="7"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .22 0"/></filter>
 <filter id="sh"><feDropShadow dx="12" dy="16" stdDeviation="12" flood-opacity=".65"/></filter>
 <filter id="old"><feColorMatrix type="matrix" values=".5 .45 .2 0 .03  .45 .45 .2 0 .02  .35 .35 .2 0 0  0 0 0 1 0"/></filter>
 <radialGradient id="lamp" cx=".5" cy=".45" r=".75"><stop offset="0" stop-color="#ffe2a0" stop-opacity=".25"/><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".75"/></radialGradient></defs>
 <rect width="1920" height="1080" fill="#241f1b"/>${Array.from({ length: 14 }, (_, i) => `<rect y="${i * 80}" width="1920" height="3" fill="#000" opacity=".22"/>`).join('')}
 <g transform="translate(900,500) rotate(-3)" filter="url(#sh)"><rect x="-560" y="-380" width="1120" height="780" fill="#f6f3ea"/>
  <image href="${img}" x="-520" y="-340" width="1040" height="600" preserveAspectRatio="xMidYMid slice" filter="url(#old)"/>
  <text y="340" text-anchor="middle" font-family="Elite" font-size="52" fill="#222">Barbara y Patricia Grimes</text>
  <rect x="-60" y="-410" width="120" height="60" fill="#d9d2bd" opacity=".85" transform="rotate(4)"/></g>
 <g transform="translate(1530,190) rotate(10)"><rect x="-190" y="-58" width="380" height="116" fill="none" stroke="${RED}" stroke-width="11"/><text y="30" text-anchor="middle" font-family="Anton" font-size="84" fill="${RED}" letter-spacing="6">FOTO REAL</text></g>
 <g transform="translate(70,60)"><rect width="430" height="70" fill="#0b0a09"/><text x="215" y="48" text-anchor="middle" font-family="Bebas" font-size="44" fill="${PAPER}" letter-spacing="3">CHICAGO · DICIEMBRE 1956</text></g>
 <g transform="translate(1700,860)"><path d="M-170,260 Q-170,90 -60,70 L60,70 Q170,90 170,260Z" fill="#4f5d3a" stroke="${OL}" stroke-width="9"/>${head(0, -40, 115)}</g>
 <text x="40" y="1050" font-family="Bebas" font-size="28" fill="#a99f8a">Foto: dominio público · Wikimedia Commons</text>
 <rect width="1920" height="1080" fill="url(#lamp)"/><rect width="1920" height="1080" filter="url(#gr)"/></svg>`;
const b = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
await p.setContent(`<html><head><style>${ff('Anton', 'Anton-Regular.ttf')}${ff('Bebas', 'BebasNeue-Regular.ttf')}${ff('Elite', 'SpecialElite-Regular.ttf')}body{margin:0}</style></head><body>${svg}</body></html>`);
await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(300);
await p.screenshot({ path: P + '/kit/ejemplo_foto_real.png' }); await b.close(); console.log('ok');
