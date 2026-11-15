// Four style + name proposals for the mystery channel (still frames only).
import { chromium } from 'playwright';
import fs from 'fs';
const ROOT = '/home/user/growkaz-stickman-studio', OUT = ROOT + '/projects/canal2-misterio/out';
fs.mkdirSync(OUT, { recursive: true });
const ff = (n, f) => `@font-face{font-family:${n};src:url(data:font/ttf;base64,${fs.readFileSync(`${ROOT}/assets/fonts/${f}`).toString('base64')})}`;
const FONTS = [ff('Fred', 'Fredoka-Bold.ttf'), ff('Anton', 'Anton-Regular.ttf'), ff('Bebas', 'BebasNeue-Regular.ttf'), ff('Monoton', 'Monoton-Regular.ttf'), ff('Elite', 'SpecialElite-Regular.ttf')].join('') + 'body{margin:0;background:#000}';

const grain = (id, o = 0.18) => `<filter id="${id}"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="7"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 ${o} 0"/></filter>`;
const label = (n, name, style) => `<g><rect x="0" y="1010" width="1920" height="70" fill="#000" opacity=".82"/>
  <text x="40" y="1056" font-family="Bebas" font-size="40" fill="#fff" letter-spacing="2">PROPUESTA ${n}  ·  <tspan fill="#ffd23f">${name}</tspan>  ·  ${style}</text></g>`;

// toon head (same family as our animation rig): cream round head, dark outline
function toonHead(x, y, r, o = {}) {
  const ol = o.ol || '#1b1b22', eyes = o.shock
    ? `<circle cx="${-r * .32}" cy="${-r * .05}" r="${r * .16}" fill="#fff" stroke="${ol}" stroke-width="${r * .05}"/><circle cx="${r * .32}" cy="${-r * .05}" r="${r * .16}" fill="#fff" stroke="${ol}" stroke-width="${r * .05}"/><circle cx="${-r * .28}" cy="${-r * .03}" r="${r * .06}" fill="${ol}"/><circle cx="${r * .36}" cy="${-r * .03}" r="${r * .06}" fill="${ol}"/><ellipse cx="${r * .05}" cy="${r * .45}" rx="${r * .13}" ry="${r * .17}" fill="#5a1d1d" stroke="${ol}" stroke-width="${r * .05}"/>`
    : `<ellipse cx="${-r * .3}" cy="0" rx="${r * .08}" ry="${r * .11}" fill="${ol}"/><ellipse cx="${r * .3}" cy="0" rx="${r * .08}" ry="${r * .11}" fill="${ol}"/><path d="M${-r * .2},${r * .42} Q0,${r * .3} ${r * .22},${r * .44}" stroke="${ol}" stroke-width="${r * .06}" fill="none" stroke-linecap="round"/>`;
  const hat = o.hat === 'beanie' ? `<path d="M${-r * 1.02},${-r * .2} Q${-r},${-r * 1.25} 0,${-r * 1.25} Q${r},${-r * 1.25} ${r * 1.02},${-r * .2} Z" fill="${o.hatColor || '#c0392b'}" stroke="${ol}" stroke-width="${r * .08}"/><rect x="${-r * 1.06}" y="${-r * .42}" width="${r * 2.12}" height="${r * .3}" rx="${r * .12}" fill="${o.hatColor2 || '#e8e2d0'}" stroke="${ol}" stroke-width="${r * .07}"/><circle cx="0" cy="${-r * 1.3}" r="${r * .2}" fill="${o.hatColor2 || '#e8e2d0'}" stroke="${ol}" stroke-width="${r * .07}"/>` : '';
  return `<g transform="translate(${x},${y})"><circle r="${r}" fill="${o.skin || '#fbf6ea'}" stroke="${ol}" stroke-width="${r * .09}"/>
    <path d="${o.shock ? `M${-r * .5},${-r * .3} L${-r * .14},${-r * .46} M${r * .14},${-r * .46} L${r * .5},${-r * .3}` : `M${-r * .5},${-r * .32} L${-r * .12},${-r * .26} M${r * .12},${-r * .26} L${r * .5},${-r * .32}`}" stroke="${ol}" stroke-width="${r * .07}" stroke-linecap="round" fill="none"/>${eyes}${hat}</g>`;
}

// ---------------- 1) NOIR DE PAPEL · SIN RESOLVER (D. B. Cooper) ----------------
function s1() {
  const rainLines = Array.from({ length: 140 }, (_, i) => { const x = (i * 137) % 1920, y = (i * 263) % 1000; return `<line x1="${x}" y1="${y}" x2="${x - 14}" y2="${y + 50}" stroke="#e9dfc6" stroke-opacity=".25" stroke-width="2"/>`; }).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080"><defs>${grain('g1', .28)}
    <filter id="torn"><feTurbulence baseFrequency=".04" numOctaves="3" seed="3"/><feDisplacementMap in="SourceGraphic" scale="22"/></filter></defs>
  <rect width="1920" height="1080" fill="#14110f"/>
  <circle cx="1380" cy="360" r="300" fill="#efe4c8"/>
  <g filter="url(#torn)"><path d="M0,760 L320,700 L560,760 L820,690 L1100,770 L1400,700 L1700,760 L1920,720 L1920,1080 L0,1080Z" fill="#0b0908"/><path d="M0,860 L400,820 L700,880 L1000,830 L1400,890 L1920,840 L1920,1080 L0,1080Z" fill="#1f1a16"/></g>
  <!-- airplane with rear stairs -->
  <g transform="translate(1260,250) rotate(-6)"><path d="M-520,0 Q-500,-46 -380,-52 L380,-52 Q470,-46 520,-10 Q480,30 380,34 L-380,34 Q-500,30 -520,0Z" fill="#0b0908"/>
    <path d="M-60,-20 L-260,-180 L-170,-180 L60,-20Z" fill="#0b0908"/><path d="M-420,-40 L-500,-150 L-440,-150 L-360,-40Z" fill="#0b0908"/>
    <path d="M-380,30 L-470,150" stroke="#0b0908" stroke-width="22"/>${Array.from({ length: 11 }, (_, i) => `<rect x="${-300 + i * 60}" y="-30" width="24" height="18" rx="5" fill="#d9b25a" opacity=".85"/>`).join('')}</g>
  <!-- the jumper -->
  <g transform="translate(560,470) rotate(-14)">
    <path d="M-150,-250 Q0,-380 150,-250 Q60,-270 0,-268 Q-60,-270 -150,-250Z" fill="#efe4c8" stroke="#0b0908" stroke-width="8"/>
    <line x1="-140" y1="-250" x2="-30" y2="-40" stroke="#efe4c8" stroke-width="3"/><line x1="140" y1="-250" x2="30" y2="-40" stroke="#efe4c8" stroke-width="3"/><line x1="0" y1="-268" x2="0" y2="-40" stroke="#efe4c8" stroke-width="3"/>
    <path d="M-60,-40 L60,-40 L80,140 L-80,140Z" fill="#0b0908"/><path d="M-22,-40 L0,40 L22,-40Z" fill="#efe4c8"/><path d="M-7,-30 L7,-30 L5,40 L0,52 L-5,40Z" fill="#a8261f"/>
    <path d="M-60,-30 L-140,40 M60,-30 L140,20" stroke="#0b0908" stroke-width="30" stroke-linecap="round"/><path d="M-50,140 L-70,250 M50,140 L80,240" stroke="#0b0908" stroke-width="36" stroke-linecap="round"/>
    <rect x="-150" y="20" width="70" height="46" rx="6" fill="#3a2a1e" stroke="#0b0908" stroke-width="5"/>
    ${toonHead(0, -95, 62, { skin: '#efe4c8', ol: '#0b0908' })}<rect x="-58" y="-112" width="116" height="30" rx="12" fill="#0b0908"/>
    <path d="M-66,-130 Q0,-210 66,-130 L84,-122 L-84,-122Z" fill="#0b0908"/></g>
  <g fill="#efe4c8" opacity=".9" transform="translate(300,620) rotate(-10)">${Array.from({ length: 9 }, (_, i) => `<rect x="${i * 46 + (i % 2) * 12}" y="${(i % 3) * 40}" width="40" height="22" rx="3" transform="rotate(${i * 13} ${i * 46} 0)"/>`).join('')}</g>
  ${rainLines}
  <g transform="translate(70,70)"><rect width="430" height="78" fill="#efe4c8"/><text x="215" y="56" text-anchor="middle" font-family="Elite" font-size="42" fill="#0b0908">24 NOV · 1971</text></g>
  <text x="80" y="960" font-family="Anton" font-size="150" fill="#efe4c8">¿DÓNDE</text><text x="560" y="960" font-family="Anton" font-size="150" fill="#a8261f"> ESTÁ?</text>
  <g transform="translate(1560,880) rotate(-9)"><rect x="-310" y="-75" width="620" height="145" fill="none" stroke="#a8261f" stroke-width="12"/><text y="34" text-anchor="middle" font-family="Anton" font-size="96" fill="#a8261f" letter-spacing="4">SIN RESOLVER</text></g>
  <rect width="1920" height="1080" filter="url(#g1)"/>
  ${label(1, 'SIN RESOLVER', 'NOIR DE PAPEL — sombras, sepia y rojo')}
  </svg>`;
}

// ---------------- 2) VHS / RADAR · SEÑAL PERDIDA (MH370) ----------------
function s2() {
  const rgb = (txt, x, y, size, font, fill = '#fff', anchor = 'middle') => `<text x="${x - 6}" y="${y}" text-anchor="${anchor}" font-family="${font}" font-size="${size}" fill="#ff2d55" opacity=".75">${txt}</text><text x="${x + 6}" y="${y}" text-anchor="${anchor}" font-family="${font}" font-size="${size}" fill="#19e3ff" opacity=".75">${txt}</text><text x="${x}" y="${y}" text-anchor="${anchor}" font-family="${font}" font-size="${size}" fill="${fill}">${txt}</text>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080"><defs>${grain('g2', .22)}
    <radialGradient id="rad" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#0e3b2c"/><stop offset="1" stop-color="#03120d"/></radialGradient>
    <linearGradient id="sweep" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#39ff9c" stop-opacity="0"/><stop offset="1" stop-color="#39ff9c" stop-opacity=".55"/></linearGradient>
    <pattern id="scan2" width="6" height="6" patternUnits="userSpaceOnUse"><rect width="6" height="3" fill="#000" opacity=".28"/></pattern>
    <filter id="gl"><feGaussianBlur stdDeviation="8" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
  <rect width="1920" height="1080" fill="#05070c"/>
  <g transform="translate(1300,520)"><circle r="430" fill="url(#rad)" stroke="#39ff9c" stroke-width="6" filter="url(#gl)"/>
    ${[110, 220, 330].map(r => `<circle r="${r}" fill="none" stroke="#39ff9c" stroke-opacity=".35" stroke-width="3"/>`).join('')}
    <line x1="-430" y1="0" x2="430" y2="0" stroke="#39ff9c" stroke-opacity=".3" stroke-width="3"/><line x1="0" y1="-430" x2="0" y2="430" stroke="#39ff9c" stroke-opacity=".3" stroke-width="3"/>
    <path d="M0,0 L430,0 A430,430 0 0,0 304,-304 Z" fill="url(#sweep)" transform="rotate(20)"/>
    <path d="M-330,40 Q-250,-60 -120,-40 L-60,10 Q-120,80 -230,90Z" fill="#39ff9c" opacity=".18"/>
    <g filter="url(#gl)"><circle cx="-150" cy="-110" r="9" fill="#39ff9c" opacity=".25"/><circle cx="-90" cy="-140" r="11" fill="#39ff9c" opacity=".5"/><circle cx="-30" cy="-160" r="14" fill="#39ff9c"/></g>
    <text x="10" y="-180" font-family="Bebas" font-size="40" fill="#39ff9c">MH370</text>
    <text x="120" y="-40" font-family="Anton" font-size="170" fill="#ff2d55" filter="url(#gl)">?</text></g>
  <!-- protagonist: watching the screen, lit green -->
  <g transform="translate(360,760)"><path d="M-230,330 Q-230,120 -90,90 L90,90 Q230,120 230,330Z" fill="#1d2433" stroke="#39ff9c" stroke-width="5" stroke-opacity=".6"/>
    ${toonHead(0, -40, 150, { shock: true, skin: '#d8f5e4' })}<path d="M-150,-110 Q-150,-210 0,-215 Q150,-210 150,-110 Q100,-170 0,-168 Q-100,-170 -150,-110Z" fill="#2a2420" stroke="#1b1b22" stroke-width="12"/></g>
  <text x="70" y="110" font-family="Bebas" font-size="56" fill="#fff">● REC</text><circle cx="85" cy="92" r="0" fill="#ff2d55"/>
  <text x="70" y="180" font-family="Bebas" font-size="46" fill="#cfe" opacity=".9">08 MAR 2014 · 01:21</text>
  ${rgb('DESAPARECIÓ', 520, 360, 150, 'Anton')}${rgb('DEL RADAR', 520, 510, 150, 'Anton', '#39ff9c')}
  <g transform="translate(1580,110)">${rgb('SEÑAL', 0, 0, 64, 'Monoton', '#fff')}${rgb('PERDIDA', 0, 80, 64, 'Monoton', '#fff')}</g>
  <rect width="1920" height="1080" fill="url(#scan2)"/><rect y="640" width="1920" height="18" fill="#fff" opacity=".07"/>
  <rect width="1920" height="1080" filter="url(#g2)"/>
  ${label(2, 'SEÑAL PERDIDA', 'VHS / RADAR — glitch, verde fósforo y RGB')}
  </svg>`;
}

// ---------------- 3) LINTERNA · LO QUE NADIE EXPLICA (Dyatlov) ----------------
function s3() {
  const snow = Array.from({ length: 220 }, (_, i) => `<circle cx="${(i * 97) % 1920}" cy="${(i * 211) % 1000}" r="${1.5 + (i % 4)}" fill="#fff" opacity="${.25 + (i % 5) * .1}"/>`).join('');
  const steps = Array.from({ length: 9 }, (_, i) => `<ellipse cx="${1060 + i * 95}" cy="${880 - i * 18 + (i % 2) * 22}" rx="22" ry="11" fill="#7a8cb0" opacity=".7"/>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080"><defs>${grain('g3', .2)}
    <radialGradient id="beam" cx="0" cy=".5" r="1"><stop offset="0" stop-color="#fff6c8" stop-opacity=".95"/><stop offset=".7" stop-color="#fff6c8" stop-opacity=".35"/><stop offset="1" stop-color="#fff6c8" stop-opacity="0"/></radialGradient>
    <mask id="lit"><rect width="1920" height="1080" fill="#222"/><path d="M560,620 L1900,250 L1900,1050Z" fill="#fff" filter="url(#soft)"/></mask>
    <filter id="soft"><feGaussianBlur stdDeviation="40"/></filter></defs>
  <rect width="1920" height="1080" fill="#04060d"/>
  <g mask="url(#lit)">
    <rect width="1920" height="1080" fill="#1c2742"/><path d="M0,760 Q500,700 960,740 Q1400,780 1920,720 L1920,1080 L0,1080Z" fill="#dfe8f6"/>
    <path d="M0,380 L260,140 L520,380 L760,180 L1080,420 L1380,160 L1700,400 L1920,260 L1920,560 L0,560Z" fill="#2b3a5c"/>
    <!-- slashed tent -->
    <g transform="translate(1480,760)"><path d="M-330,40 L-40,-220 L330,40Z" fill="#c9b38a" stroke="#1b1b22" stroke-width="9"/><path d="M-40,-220 L-40,40" stroke="#1b1b22" stroke-width="6"/>
      <path d="M60,-120 L95,-60 L80,-40 L120,10" stroke="#05070d" stroke-width="22" fill="none" stroke-linecap="round"/><path d="M160,-90 L190,-30 L175,-10 L215,30" stroke="#05070d" stroke-width="18" fill="none" stroke-linecap="round"/>
      <path d="M-330,40 Q0,70 330,40" stroke="#fff" stroke-width="20" fill="none" opacity=".85"/></g>
    ${steps}
  </g>
  <path d="M560,620 L1900,250 L1900,1050Z" fill="url(#beam)" opacity=".28"/>
  ${snow}
  <!-- explorer with flashlight -->
  <g transform="translate(400,870)"><path d="M-220,300 Q-220,90 -90,60 L90,60 Q220,90 220,300Z" fill="#c0392b" stroke="#1b1b22" stroke-width="10"/>
    <path d="M-110,60 Q0,120 110,60" fill="none" stroke="#e8e2d0" stroke-width="26"/>
    ${toonHead(0, -80, 140, { shock: true, hat: 'beanie', hatColor: '#2f5a8a' })}
    <g transform="translate(150,-10) rotate(-14)"><rect x="0" y="-26" width="150" height="52" rx="12" fill="#3a3a44" stroke="#1b1b22" stroke-width="8"/><rect x="140" y="-36" width="34" height="72" rx="8" fill="#ffd23f" stroke="#1b1b22" stroke-width="8"/></g>
    <circle cx="150" cy="10" r="38" fill="#fbf6ea" stroke="#1b1b22" stroke-width="9"/></g>
  <text x="70" y="120" font-family="Bebas" font-size="54" fill="#dfe8f6" letter-spacing="3">PASO DIÁTLOV · 1959</text>
  <text x="70" y="290" font-family="Anton" font-size="128" fill="#fff">CORTARON LA</text><text x="70" y="430" font-family="Anton" font-size="128" fill="#ffd23f">TIENDA DESDE</text><text x="70" y="570" font-family="Anton" font-size="128" fill="#fff">DENTRO</text>
  <g transform="translate(1620,110)"><text text-anchor="middle" font-family="Anton" font-size="54" fill="#fff" letter-spacing="2">LO QUE NADIE</text><text y="84" text-anchor="middle" font-family="Anton" font-size="72" fill="#ffd23f" letter-spacing="6">EXPLICA</text></g>
  <rect width="1920" height="1080" filter="url(#g3)"/>
  ${label(3, 'LO QUE NADIE EXPLICA', 'LINTERNA — oscuridad total, solo ves lo que alumbra')}
  </svg>`;
}

// ---------------- 4) DESCLASIFICADO · ARCHIVO OSCURO (Mary Celeste) ----------------
function s4() {
  const red = (x, y, w) => `<rect x="${x}" y="${y}" width="${w}" height="26" fill="#111"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080"><defs>${grain('g4', .25)}
    <radialGradient id="lampv" cx=".55" cy=".45" r=".7"><stop offset="0" stop-color="#ffe7b0" stop-opacity=".22"/><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".7"/></radialGradient>
    <filter id="sh"><feDropShadow dx="10" dy="14" stdDeviation="10" flood-opacity=".6"/></filter></defs>
  <rect width="1920" height="1080" fill="#2a2420"/>${Array.from({ length: 14 }, (_, i) => `<rect y="${i * 80}" width="1920" height="3" fill="#000" opacity=".2"/>`).join('')}
  <!-- folder -->
  <g transform="translate(1000,640) rotate(-3) scale(.88)" filter="url(#sh)"><path d="M-620,-380 L-300,-380 L-260,-430 L-40,-430 L0,-380 L620,-380 L620,400 L-620,400Z" fill="#c9a86a"/>
    <rect x="-560" y="-330" width="620" height="680" fill="#f2ecdc"/>
    <text x="-520" y="-260" font-family="Elite" font-size="40" fill="#222">INFORME · 4 DIC 1872</text>
    <text x="-520" y="-200" font-family="Elite" font-size="32" fill="#222">Bergantín encontrado a la deriva.</text>
    ${red(-520, -170, 380)}<text x="-520" y="-90" font-family="Elite" font-size="32" fill="#222">Tripulación a bordo: 0</text>${red(-520, -60, 300)}${red(-200, -60, 180)}
    <text x="-520" y="40" font-family="Elite" font-size="32" fill="#222">Bote salvavidas: falta.</text>${red(-520, 70, 460)}${red(-520, 120, 240)}
    <text x="-520" y="220" font-family="Elite" font-size="32" fill="#222">Carga: intacta.</text>
    <g transform="translate(-230,300) rotate(-10)"><rect x="-260" y="-70" width="520" height="130" fill="none" stroke="#b3201b" stroke-width="10"/><text y="30" text-anchor="middle" font-family="Anton" font-size="84" fill="#b3201b" letter-spacing="6">CLASIFICADO</text></g>
    <!-- polaroid: ghost ship -->
    <g transform="translate(330,-60) rotate(6)"><rect x="-230" y="-260" width="460" height="540" fill="#f6f3ea"/><rect x="-200" y="-230" width="400" height="390" fill="#25313b"/>
      <circle cx="110" cy="-150" r="40" fill="#e9e4cf" opacity=".8"/><path d="M-200,90 Q0,70 200,95 L200,160 L-200,160Z" fill="#16202a"/>
      <path d="M-120,70 L120,70 L95,105 L-95,105Z" fill="#0d1218"/><line x1="-40" y1="70" x2="-40" y2="-150" stroke="#0d1218" stroke-width="8"/><line x1="40" y1="70" x2="40" y2="-120" stroke="#0d1218" stroke-width="8"/>
      <path d="M-36,-140 L-36,20 L-120,20Z" fill="#c9c3ae" opacity=".55"/><path d="M44,-110 L44,30 L120,30Z" fill="#c9c3ae" opacity=".45"/>
      <text y="230" text-anchor="middle" font-family="Elite" font-size="44" fill="#222">¿DÓNDE ESTÁN?</text></g>
    <rect x="200" y="-420" width="44" height="120" rx="8" fill="#9aa2aa" transform="rotate(8)"/></g>
  <!-- protagonist peeking in the corner -->
  <g transform="translate(1720,900)"><path d="M-200,300 Q-200,110 -80,80 L80,80 Q200,110 200,300Z" fill="#3b4a3a" stroke="#1b1b22" stroke-width="10"/>${toonHead(0, -60, 130, { shock: true })}
    <path d="M-140,-110 Q-150,-210 0,-215 Q150,-210 140,-110 Q90,-160 0,-160 Q-90,-160 -140,-110Z" fill="#5a3a24" stroke="#1b1b22" stroke-width="10"/></g>
  <text x="70" y="150" font-family="Anton" font-size="140" fill="#f2ecdc">EL BARCO</text><text x="70" y="290" font-family="Anton" font-size="140" fill="#e0402f">SIN NADIE</text>
  <g transform="translate(1570,120)"><rect x="-310" y="-60" width="620" height="110" fill="#111"/><text y="22" text-anchor="middle" font-family="Elite" font-size="60" fill="#f2ecdc" letter-spacing="4">ARCHIVO OSCURO</text></g>
  <rect width="1920" height="1080" fill="url(#lampv)"/><rect width="1920" height="1080" filter="url(#g4)"/>
  ${label(4, 'ARCHIVO OSCURO', 'DESCLASIFICADO — expedientes, tachones y sellos')}
  </svg>`;
}

const b = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
for (const [k, svg] of Object.entries({ '1_sin_resolver_noir': s1(), '2_senal_perdida_vhs': s2(), '3_lo_que_nadie_explica_linterna': s3(), '4_archivo_oscuro_desclasificado': s4() })) {
  await p.setContent(`<html><head><style>${FONTS}</style></head><body>${svg}</body></html>`);
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(300);
  await p.screenshot({ path: `${OUT}/${k}.png` }); console.log('ok', k);
}
await b.close();
