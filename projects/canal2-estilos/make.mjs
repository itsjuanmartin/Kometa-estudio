// Still mockups of three candidate styles for the second channel (no video).
import { chromium } from 'playwright';
import fs from 'fs';
const ROOT = '/home/user/growkaz-stickman-studio';
const OUT = ROOT + '/projects/canal2-estilos/out';
const FONTS = `@font-face{font-family:Fred;src:url(data:font/ttf;base64,${fs.readFileSync(ROOT+'/assets/fonts/Fredoka-Bold.ttf').toString('base64')})}
@font-face{font-family:Nun;src:url(data:font/ttf;base64,${fs.readFileSync(ROOT+'/assets/fonts/Nunito-Black.ttf').toString('base64')})}
body{margin:0;background:#000}`;

// ---------- shared: protagonist "Leo" (investigator) ----------
function leo(x, y, s, o = {}) {
  const skin = o.skin || '#f1c7a0', ol = o.ol || '#1b1b22', coat = o.coat || '#c9a86a', hair = o.hair || '#3a2a20';
  const eye = o.expr === 'shock'
    ? `<circle cx="-34" cy="-8" r="15" fill="#fff" stroke="${ol}" stroke-width="5"/><circle cx="34" cy="-8" r="15" fill="#fff" stroke="${ol}" stroke-width="5"/><circle cx="-34" cy="-6" r="5" fill="${ol}"/><circle cx="34" cy="-6" r="5" fill="${ol}"/>`
    : `<ellipse cx="-34" cy="-6" rx="9" ry="12" fill="${ol}"/><ellipse cx="34" cy="-6" rx="9" ry="12" fill="${ol}"/><circle cx="-31" cy="-10" r="3" fill="#fff"/><circle cx="37" cy="-10" r="3" fill="#fff"/>`;
  const brow = o.expr === 'shock'
    ? `<path d="M-52,-40 Q-34,-52 -16,-42 M16,-42 Q34,-52 52,-40" stroke="${ol}" stroke-width="7" fill="none" stroke-linecap="round"/>`
    : `<path d="M-52,-34 L-16,-40 M16,-44 L52,-30" stroke="${ol}" stroke-width="7" fill="none" stroke-linecap="round"/>`;
  const mouth = o.expr === 'shock'
    ? `<ellipse cx="0" cy="44" rx="16" ry="20" fill="#5a1d1d" stroke="${ol}" stroke-width="5"/>`
    : `<path d="M-22,40 Q2,52 26,34" stroke="${ol}" stroke-width="6" fill="none" stroke-linecap="round"/>`;
  const cap = o.cap === false ? '' :
    `<path d="M-92,-46 Q-80,-118 0,-122 Q80,-118 92,-46 Z" fill="${o.capColor || '#4a3b2c'}" stroke="${ol}" stroke-width="7"/>
     <path d="M-96,-50 Q0,-70 120,-40 Q130,-30 110,-26 Q0,-48 -96,-34 Z" fill="${o.capColor || '#4a3b2c'}" stroke="${ol}" stroke-width="7"/>`;
  return `<g transform="translate(${x},${y}) scale(${s})">
    <path d="M-150,330 Q-150,150 -60,120 L60,120 Q150,150 150,330 Z" fill="${coat}" stroke="${ol}" stroke-width="8"/>
    <path d="M-60,120 L0,230 L60,120" fill="${o.shirt || '#e9e2d0'}" stroke="${ol}" stroke-width="7"/>
    <path d="M-62,122 L-20,250 M62,122 L20,250" stroke="${ol}" stroke-width="6"/>
    <rect x="-26" y="70" width="52" height="60" fill="${skin}" stroke="${ol}" stroke-width="7"/>
    <ellipse cx="0" cy="0" rx="96" ry="102" fill="${skin}" stroke="${ol}" stroke-width="8"/>
    <path d="M-96,-10 Q-100,-90 -20,-100 Q60,-110 96,-20 Q60,-60 0,-58 Q-50,-56 -96,-10Z" fill="${hair}" stroke="${ol}" stroke-width="6"/>
    ${cap}${brow}${eye}<path d="M-4,4 Q-14,24 2,26" stroke="${ol}" stroke-width="5" fill="none"/>${mouth}
    <path d="M-60,70 Q0,96 60,70 Q50,104 0,108 Q-50,104 -60,70Z" fill="${hair}" opacity="${o.beard ? 0.9 : 0}"/>
  </g>`;
}

// ---------- STYLE A: neon noir thriller (Binance) ----------
function styleA() {
  const leds = [];
  for (let r = 0; r < 2; r++) for (let i = 0; i < 26; i++) {
    const x = r ? 1840 : 40, c = ['#19e3ff', '#2bff88', '#19e3ff', '#ff2d55'][(i * 7 + r) % 4];
    leds.push(`<rect x="${x}" y="${70 + i * 38}" width="40" height="22" rx="3" fill="#0b1330"/><circle cx="${x + 10 + (i % 3) * 10}" cy="${81 + i * 38}" r="3.5" fill="${c}" filter="url(#glow)"/>`);
  }
  const rows = ['RETIRO NO AUTORIZADO', 'RETIRO NO AUTORIZADO', 'RETIRO NO AUTORIZADO', 'RETIRO NO AUTORIZADO', 'RETIRO NO AUTORIZADO'];
  const lines = rows.map((t, i) => `<text x="880" y="${470 + i * 44}" font-family="JetBrains Mono" font-weight="700" font-size="26" fill="#ff5c7a" opacity="${1 - i * 0.15}">▸ ${t}</text>
     <rect x="1310" y="${452 + i * 44}" width="${380 - i * 40}" height="22" fill="#ff2d55" opacity="${0.55 - i * 0.08}"/>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#060a18"/><stop offset="1" stop-color="#121a40"/></linearGradient>
    <radialGradient id="vig" cx=".5" cy=".5" r=".75"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".75"/></radialGradient>
    <radialGradient id="lap" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#19e3ff" stop-opacity=".55"/><stop offset="1" stop-color="#19e3ff" stop-opacity="0"/></radialGradient>
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <filter id="glow2" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="14" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <pattern id="scan" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="4" height="2" fill="#fff" opacity=".035"/></pattern>
  </defs>
  <rect width="1920" height="1080" fill="url(#bg)"/>
  ${leds.join('')}
  <!-- wall screen -->
  <rect x="780" y="110" width="1020" height="700" rx="18" fill="#04070f" stroke="#19e3ff" stroke-width="5" filter="url(#glow)"/>
  <text x="840" y="190" font-family="JetBrains Mono" font-weight="700" font-size="30" fill="#19e3ff" letter-spacing="4">EXCHANGE · BILLETERA CALIENTE</text>
  <rect x="1560" y="160" width="190" height="44" rx="8" fill="#ff2d55" filter="url(#glow)"/><text x="1655" y="192" text-anchor="middle" font-family="JetBrains Mono" font-weight="700" font-size="26" fill="#fff">ALERTA</text>
  <text x="1290" y="330" text-anchor="middle" font-family="JetBrains Mono" font-weight="800" font-size="104" fill="#ff2d55" filter="url(#glow2)">-$6.300.000.000</text>
  <rect x="840" y="370" width="900" height="16" rx="8" fill="#1a2140"/><rect x="840" y="370" width="830" height="16" rx="8" fill="#ff2d55" filter="url(#glow)"/>
  <text x="840" y="420" font-family="JetBrains Mono" font-size="24" fill="#8fa3d9">fondos saliendo…  92%</text>
  ${lines}
  <rect x="780" y="110" width="1020" height="700" rx="18" fill="url(#scan)"/>
  <!-- desk + hacker -->
  <ellipse cx="520" cy="640" rx="420" ry="260" fill="url(#lap)"/>
  <rect x="120" y="790" width="900" height="40" fill="#0a1026" stroke="#19e3ff" stroke-opacity=".35" stroke-width="3"/>
  <path d="M600,790 L640,640 L860,640 L840,790 Z" fill="#0d1636" stroke="#19e3ff" stroke-width="4" filter="url(#glow)"/>
  <rect x="660" y="660" width="170" height="110" fill="#19e3ff" opacity=".25"/>
  <path d="M260,1080 Q250,760 380,690 Q460,650 540,690 Q650,760 640,1080 Z" fill="#070b1c" stroke="#19e3ff" stroke-width="5" stroke-opacity=".9" filter="url(#glow)"/>
  <path d="M325,720 Q300,560 420,505 Q455,470 470,500 Q600,540 585,720 Q545,650 455,640 Q365,650 325,720Z" fill="#070b1c" stroke="#19e3ff" stroke-width="5" filter="url(#glow)"/>
  <path d="M560,590 Q585,640 570,700" stroke="#19e3ff" stroke-width="10" fill="none" opacity=".6" filter="url(#glow)"/>
  <!-- stamps / captions -->
  <g transform="translate(60,40)"><rect width="520" height="64" rx="32" fill="#0b1330" stroke="#19e3ff" stroke-width="3"/>
    <text x="260" y="43" text-anchor="middle" font-family="JetBrains Mono" font-weight="700" font-size="28" fill="#cfe9ff">29 OCT 2026 · 20:05 UTC</text></g>
  <text x="960" y="985" text-anchor="middle" font-family="Fred" font-size="92" fill="#fff" stroke="#000" stroke-width="10" paint-order="stroke">EN SOLO <tspan fill="#19e3ff">20 MINUTOS</tspan></text>
  <rect width="1920" height="1080" fill="url(#vig)"/>
  </svg>`;
}

// ---------- STYLE B: case file / cork board (Binance) ----------
function styleB() {
  const card = (x, y, w, h, rot, body, pin = '#d62d2d') => `<g transform="translate(${x},${y}) rotate(${rot})">
     <rect x="6" y="10" width="${w}" height="${h}" fill="#000" opacity=".25"/>
     <rect width="${w}" height="${h}" fill="#f6efdc" stroke="#2b2420" stroke-width="3"/>${body}
     <circle cx="${w / 2}" cy="14" r="14" fill="${pin}" stroke="#2b2420" stroke-width="3"/><circle cx="${w / 2 - 4}" cy="10" r="4" fill="#fff" opacity=".7"/></g>`;
  const T = (x, y, s, t, c = '#2b2420', f = 'Nun', a = 'middle') => `<text x="${x}" y="${y}" text-anchor="${a}" font-family="${f}" font-size="${s}" fill="${c}">${t}</text>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080">
  <defs><filter id="cork"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="3" seed="4"/><feColorMatrix values="0 0 0 0 .35  0 0 0 0 .22  0 0 0 0 .12  0 0 0 .55 0"/><feComposite in2="SourceGraphic" operator="in"/></filter>
  <radialGradient id="lamp" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#fff3c4" stop-opacity=".35"/><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".55"/></radialGradient></defs>
  <rect width="1920" height="1080" fill="#b7865a"/><rect width="1920" height="1080" fill="#b7865a" filter="url(#cork)"/>
  <!-- strings -->
  <g stroke="#c0262b" stroke-width="5" fill="none"><path d="M350,150 Q560,260 760,170"/><path d="M760,170 Q700,380 560,470"/><path d="M760,170 Q980,250 1130,190"/><path d="M560,470 Q760,560 990,540"/><path d="M1130,190 Q1080,380 990,540"/></g>
  ${card(200, 140, 300, 200, -4, T(150, 95, 54, 'EXCHANGE') + T(150, 150, 30, 'Billetera caliente', '#6b5a4a'))}
  ${card(610, 160, 300, 230, 3, T(150, 105, 76, '$6.300', '#c0262b') + T(150, 165, 38, 'MILLONES') + T(150, 205, 22, 'el mayor robo cripto', '#6b5a4a'))}
  ${card(980, 180, 320, 210, -3, T(160, 95, 40, '¿COREA') + T(160, 140, 40, 'DEL NORTE?') + T(160, 185, 24, 'presunto · lo niega', '#c0262b'))}
  ${card(420, 460, 290, 290, 5, `<rect x="25" y="40" width="240" height="180" fill="#26303f"/><path d="M80,190 L100,110 L190,110 L210,190Z" fill="#9db4cc" stroke="#111" stroke-width="4"/><rect x="60" y="190" width="170" height="14" fill="#111"/><text x="145" y="160" text-anchor="middle" font-family="JetBrains Mono" font-weight="800" font-size="34" fill="#c0262b">!</text>` + T(145, 262, 26, 'EL PORTÁTIL'), '#2d6bd6')}
  ${card(840, 530, 300, 190, -5, T(150, 95, 64, '20 MIN') + T(150, 150, 26, 'de 20:05 a 20:25', '#6b5a4a'), '#2d9c4a')}
  <g transform="translate(240,850) rotate(-8)"><rect x="-10" y="-60" width="440" height="110" fill="none" stroke="#c0262b" stroke-width="9" rx="10"/>${T(210, 22, 64, 'CASO #001', '#c0262b')}</g>
  <!-- protagonist with magnifier -->
  ${leo(1560, 610, 1.55, { coat: '#c9a86a', capColor: '#4a3b2c', beard: true })}
  <g transform="translate(1330,700) rotate(-25)"><rect x="-14" y="80" width="28" height="170" rx="12" fill="#5b3a22" stroke="#1b1b22" stroke-width="6"/><circle r="92" fill="#cfe8ff" fill-opacity=".45" stroke="#1b1b22" stroke-width="14"/><path d="M-50,-40 Q-30,-66 0,-70" stroke="#fff" stroke-width="10" fill="none" stroke-linecap="round"/></g>
  <rect width="1920" height="1080" fill="url(#lamp)"/>
  <g transform="translate(60,970)"><rect width="980" height="74" rx="37" fill="#f6efdc" stroke="#2b2420" stroke-width="5"/>${T(490, 52, 44, 'EL ROBO MÁS GRANDE DE LA HISTORIA')}</g>
  </svg>`;
}

// ---------- STYLE C: comic / graphic novel (Paraguay) ----------
function styleC() {
  const OL = '#111';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080">
  <defs>
    <pattern id="dots" width="22" height="22" patternUnits="userSpaceOnUse" patternTransform="rotate(30)"><circle cx="11" cy="11" r="5" fill="#000" opacity=".16"/></pattern>
    <pattern id="dotsR" width="18" height="18" patternUnits="userSpaceOnUse"><circle cx="9" cy="9" r="5" fill="#fff" opacity=".22"/></pattern>
    <clipPath id="p1"><rect x="40" y="40" width="880" height="1000"/></clipPath>
    <clipPath id="p2"><rect x="960" y="40" width="920" height="470"/></clipPath>
    <clipPath id="p3"><rect x="960" y="550" width="920" height="490"/></clipPath>
  </defs>
  <rect width="1920" height="1080" fill="#fff"/>
  <!-- PANEL 1: the photo -->
  <g clip-path="url(#p1)"><rect x="40" y="40" width="880" height="1000" fill="#ffd23f"/><rect x="40" y="40" width="880" height="1000" fill="url(#dots)"/>
    <g fill="none" stroke="#ff8a00" stroke-width="18" opacity=".6">${Array.from({ length: 14 }, (_, i) => { const a = i / 14 * Math.PI * 2; return `<path d="M480,560 L${480 + 900 * Math.cos(a)},${560 + 900 * Math.sin(a)}"/>`; }).join('')}</g>
    <g transform="translate(480,580) rotate(-6)">
      <rect x="-220" y="-400" width="440" height="800" rx="56" fill="#1d1d24" stroke="${OL}" stroke-width="10"/>
      <rect x="-190" y="-350" width="380" height="700" rx="16" fill="#fff"/>
      <circle cx="-150" cy="-305" r="22" fill="#e94b8a" stroke="${OL}" stroke-width="4"/><rect x="-115" y="-315" width="150" height="18" rx="9" fill="#333"/>
      <rect x="-190" y="-265" width="380" height="380" fill="#6fcf73"/>
      ${[0, 1, 2, 3, 4].map(i => `<g transform="translate(${-120 + (i % 3) * 90},${-130 + Math.floor(i / 3) * 110}) rotate(${i * 7 - 10})"><rect x="-60" y="-34" width="120" height="68" rx="6" fill="#3e9a46" stroke="${OL}" stroke-width="5"/><circle r="20" fill="#bfe6a8" stroke="${OL}" stroke-width="4"/><text y="10" text-anchor="middle" font-family="Fred" font-size="28" fill="${OL}">$</text></g>`).join('')}
      <text x="-170" y="170" font-family="Fred" font-size="56" fill="#e3244b">♥</text><text x="-110" y="166" font-family="Nun" font-size="36" fill="${OL}">1.204</text>
      <rect x="-170" y="200" width="300" height="20" rx="10" fill="#ccc"/><rect x="-170" y="235" width="220" height="20" rx="10" fill="#ccc"/>
    </g>
    <g transform="translate(70,70)"><rect width="440" height="80" fill="#fff" stroke="${OL}" stroke-width="6"/><text x="220" y="56" text-anchor="middle" font-family="Fred" font-size="44" fill="${OL}">ASUNCIÓN, 2026</text></g>
    <g transform="translate(680,900) rotate(-10)"><text text-anchor="middle" font-family="Fred" font-size="140" fill="#fff" stroke="${OL}" stroke-width="14" paint-order="stroke">¡CLIC!</text></g>
  </g>
  <rect x="40" y="40" width="880" height="1000" fill="none" stroke="${OL}" stroke-width="12"/>
  <!-- PANEL 2: police -->
  <g clip-path="url(#p2)"><rect x="960" y="40" width="920" height="470" fill="#1d2b6b"/>
    <circle cx="1240" cy="200" r="260" fill="#2f6bff" opacity=".7"/><circle cx="1620" cy="200" r="260" fill="#ff2d3a" opacity=".7"/><rect x="960" y="40" width="920" height="470" fill="url(#dotsR)"/>
    <g transform="translate(1420,380)"><path d="M-330,60 L-280,-40 L-150,-90 L170,-90 L290,-40 L340,60 L340,110 L-330,110Z" fill="#f2f2f2" stroke="${OL}" stroke-width="9"/>
      <rect x="-90" y="-130" width="80" height="40" fill="#2f6bff" stroke="${OL}" stroke-width="6"/><rect x="-10" y="-130" width="80" height="40" fill="#ff2d3a" stroke="${OL}" stroke-width="6"/>
      <rect x="-230" y="-10" width="460" height="40" fill="#1d2b6b"/><text y="22" text-anchor="middle" font-family="Fred" font-size="34" fill="#fff">POLICÍA</text>
      <circle cx="-200" cy="115" r="52" fill="#222" stroke="${OL}" stroke-width="8"/><circle cx="210" cy="115" r="52" fill="#222" stroke="${OL}" stroke-width="8"/></g>
    <g transform="translate(1230,175) rotate(-6)"><text text-anchor="middle" font-family="Fred" font-size="110" fill="#ffd23f" stroke="${OL}" stroke-width="12" paint-order="stroke">¡TOC TOC!</text></g>
  </g>
  <rect x="960" y="40" width="920" height="470" fill="none" stroke="${OL}" stroke-width="12"/>
  <!-- PANEL 3: shocked kid -->
  <g clip-path="url(#p3)"><rect x="960" y="550" width="920" height="490" fill="#ff6b6b"/><rect x="960" y="550" width="920" height="490" fill="url(#dots)"/>
    ${leo(1260, 800, 1.15, { cap: false, coat: '#2c2c3a', shirt: '#2c2c3a', hair: '#1b1b22', expr: 'shock', ol: OL })}
    <g transform="translate(1640,700)"><path d="M-200,-90 Q-200,-130 -160,-130 L160,-130 Q200,-130 200,-90 L200,40 Q200,80 160,80 L-60,80 L-150,150 L-110,80 L-160,80 Q-200,80 -200,40Z" fill="#fff" stroke="${OL}" stroke-width="8"/>
      <text y="-20" text-anchor="middle" font-family="Fred" font-size="56" fill="${OL}">¿POR UNA</text><text y="50" text-anchor="middle" font-family="Fred" font-size="56" fill="${OL}">FOTO?</text></g>
  </g>
  <rect x="960" y="550" width="920" height="490" fill="none" stroke="${OL}" stroke-width="12"/>
  </svg>`;
}

const styles = { A_neon_noir: styleA(), B_expediente: styleB(), C_comic: styleC() };
const b = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
for (const [k, svg] of Object.entries(styles)) {
  fs.writeFileSync(`${OUT}/${k}.svg`, svg);
  await p.setContent(`<html><head><style>${FONTS}</style></head><body>${svg}</body></html>`);
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(300);
  await p.screenshot({ path: `${OUT}/estilo_${k}.png` });
  console.log('ok', k);
}
await b.close();
