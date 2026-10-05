// Draws the KwongPosh ornament set (paisley, chinar, rosette, frame) as vector line art.
// Run:  npm run ornaments   then open tools/preview.html to look at them.
// To use a change on the site, paste tools/symbols.svg over the <defs> block
// near the top of public/index.html.
import fs from 'fs';
const f = n => +n.toFixed(2);

// ---- motifs (each drawn in its own small box, line art) ----
// boteh / paisley, 40x40 box, tip curling to the right, base at bottom
const BOTEH = `
  <path d="M19 37 C9.5 37 5 28.5 8 20.5 C11 12.5 20 9 25 3.5 C24.5 9.5 30.5 13 31.5 21 C32.5 30 27.5 37 19 37 Z"/>
  <path d="M19.5 32 C13.5 32 11 26.5 13 21.5 C15 16.5 20.5 14.5 23.5 11 C23.5 15 27 17.5 27.3 22.5 C27.6 28 24.5 32 19.5 32 Z"/>
  <circle cx="19.8" cy="25" r="1.6" fill="currentColor" stroke="none"/>
  <path d="M25 3.5 C27.5 2 29.5 3 29 5"/>`;
// chinar leaf, 40x40 box, stem at bottom
const CHINAR = `
  <path d="M20 31 L16 32 L12 34 L10 32 L6.5 31 L4 28 L7.5 27 L5.5 24.5 L9 24.5 L11.5 23.5 L9 21 L6.5 19 L7.5 17.5 L5 16 L6 12.5 L9 13.5 L10 11 L12.5 12.5 L15 13.5 L15.5 17 L16.5 13.5 L15.5 10.5 L18 9.5 L18 6 L20 3 L22 6 L22 9.5 L24.5 10.5 L23.5 13.5 L24.5 17 L25 13.5 L27.5 12.5 L30 11 L31 13.5 L34 12.5 L35 16 L32.5 17.5 L33.5 19 L31 21 L28.5 23.5 L31 24.5 L34.5 24.5 L32.5 27 L36 28 L33.5 31 L30 32 L28 34 L24 32 Z"/>
  <path d="M20 38 L20 31 M20 31 L20 7 M20 31 L7 15 M20 31 L33 15 M20 31 L6 28.5 M20 31 L34 28.5"/>`;
// eight-petal rosette, centred at 0,0, radius ~16
function rosette(r = 16) {
  let d = '';
  for (let i = 0; i < 8; i++) {
    const a = i * Math.PI / 4, b = a + Math.PI / 8, c = a - Math.PI / 8;
    const tip = [Math.cos(a) * r, Math.sin(a) * r];
    const l = [Math.cos(c) * r * .42, Math.sin(c) * r * .42], rr = [Math.cos(b) * r * .42, Math.sin(b) * r * .42];
    d += `M${f(l[0])} ${f(l[1])} Q${f(tip[0] * .8 + Math.cos(c) * 3)} ${f(tip[1] * .8 + Math.sin(c) * 3)} ${f(tip[0])} ${f(tip[1])} Q${f(tip[0] * .8 + Math.cos(b) * 3)} ${f(tip[1] * .8 + Math.sin(b) * 3)} ${f(rr[0])} ${f(rr[1])} `;
  }
  return `<path d="${d}"/><circle r="${f(r * .3)}"/><circle r="${f(r * .1)}" fill="currentColor" stroke="none"/>`;
}

// ---- the frame (square for desktop, tall for phones) ----
function bandFor(len){ // paisleys along a strip of the given length, at y=22
  let out='';const y0=22,x0=92,x1=len-92,n=Math.max(3,Math.round((x1-x0)/41.6)+1),st=(x1-x0)/(n-1);
  for(let i=0;i<n;i++){const x=x0+i*st;
    out+=i%2===0?`<g transform="translate(${f(x-11)} ${y0}) scale(.55)">${BOTEH}</g>`:`<g transform="translate(${f(x+11)} ${y0}) scale(-.55 .55)">${BOTEH}</g>`;
    if(i<n-1)out+=`<circle cx="${f(x+st/2)}" cy="${y0+12}" r="1.4" fill="currentColor" stroke="none"/>`;}
  return out;
}
const vine = `
  <path d="M86 150 C110 120 120 104 150 92 C178 81 196 92 214 86"/>
  <path d="M104 126 C96 116 98 106 108 104 C110 114 108 120 104 126 Z"/>
  <path d="M132 100 C130 88 138 82 146 84 C142 94 138 98 132 100 Z"/>
  <path d="M176 86 C180 76 190 74 196 80 C188 86 182 88 176 86 Z"/>
  <path d="M86 150 C80 176 84 196 92 214"/>
  <path d="M84 180 C74 182 70 192 76 198 C82 192 84 188 84 180 Z"/>
  <circle cx="160" cy="104" r="1.3" fill="currentColor" stroke="none"/><circle cx="102" cy="160" r="1.3" fill="currentColor" stroke="none"/>`;
function frameSymbol(id,S,H){
  const cx=S/2,cy=H/2,ex=(H-S)/2;
  const arch=(k)=>{const hw=170*k,hh=(190+ex)*k,sy=(92+ex)*k,L=cx-hw,R=cx+hw;
    return `M${f(L)} ${f(cy-sy)} C${f(L)} ${f(cy-sy-44*k)} ${f(cx-46*k)} ${f(cy-sy-34*k)} ${f(cx)} ${f(cy-hh)} `+
      `C${f(cx+46*k)} ${f(cy-sy-34*k)} ${f(R)} ${f(cy-sy-44*k)} ${f(R)} ${f(cy-sy)} L${f(R)} ${f(cy+sy)} `+
      `C${f(R)} ${f(cy+sy+44*k)} ${f(cx+46*k)} ${f(cy+sy+34*k)} ${f(cx)} ${f(cy+hh)} `+
      `C${f(cx-46*k)} ${f(cy+sy+34*k)} ${f(L)} ${f(cy+sy+44*k)} ${f(L)} ${f(cy+sy)} Z`;};
  const top=bandFor(S),sideB=bandFor(H),hh=190+ex;
  return `<symbol id="${id}" viewBox="0 0 ${S} ${H}">
 <g fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
  <rect x="6" y="6" width="${S-12}" height="${H-12}" stroke-width="1.4"/>
  <rect x="12" y="12" width="${S-24}" height="${H-24}" stroke-width=".6"/>
  <rect x="64" y="64" width="${S-128}" height="${H-128}" stroke-width=".6"/>
  <rect x="70" y="70" width="${S-140}" height="${H-140}" stroke-width="1.1"/>
  <g>${top}</g>
  <g transform="translate(${S} ${H}) rotate(180)">${top}</g>
  <g transform="translate(0 ${H}) rotate(-90)">${sideB}</g>
  <g transform="translate(${S} 0) rotate(90)">${sideB}</g>
  ${[[38,38],[S-38,38],[S-38,H-38],[38,H-38]].map(([x,y])=>`<g transform="translate(${x} ${y})">${rosette(15)}</g>`).join('')}
  <path d="${arch(1)}" stroke-width="1.2"/>
  <path d="${arch(.955)}" stroke-width=".6"/>
  ${[`translate(0 0)`,`translate(${S} 0) scale(-1 1)`,`translate(0 ${H}) scale(1 -1)`,`translate(${S} ${H}) scale(-1 -1)`].map(t=>`<g transform="${t}">${vine}</g>`).join('')}
  <g transform="translate(${f(cx-11)} ${f(cy-hh-24)}) scale(.55)">${CHINAR}</g>
  <g transform="translate(${f(cx+11)} ${f(cy+hh+24)}) scale(-.55 -.55)">${CHINAR}</g>
 </g>
</symbol>`;
}
const frame = frameSymbol('orn-frame',600,600)+'\n'+frameSymbol('orn-frame-tall',600,820);

// ---- a band for dividers: 240 x 24 tile, used as a repeating pattern ----
const band = `<pattern id="orn-band" width="60" height="24" patternUnits="userSpaceOnUse">
 <g fill="none" stroke="currentColor" stroke-width=".9" stroke-linecap="round" stroke-linejoin="round">
  <g transform="translate(8 1) scale(.55)">${BOTEH}</g>
  <g transform="translate(52 1) scale(-.55 .55)">${BOTEH}</g>
  <circle cx="30" cy="13" r="1.2" fill="currentColor" stroke="none"/>
  <path d="M0 23.5 H60" stroke-width=".5"/>
 </g>
</pattern>`;

// ---- standalone marks ----
const rose = `<symbol id="orn-rosette" viewBox="-20 -20 40 40"><g fill="none" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round">${rosette(17)}</g></symbol>`;
const leaf = `<symbol id="orn-chinar" viewBox="0 0 40 40"><g fill="none" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round">${CHINAR}</g></symbol>`;

const defs = [frame, rose, leaf, band].join('\n');
fs.writeFileSync(new URL('symbols.svg', import.meta.url), defs);
fs.writeFileSync(new URL('preview.html', import.meta.url), `<!doctype html><body style="margin:0;background:#F6F6F4;color:#373334;font-family:sans-serif">
<svg width="0" height="0" style="position:absolute"><defs>${defs}</defs></svg>
<div style="display:flex;gap:40px;padding:30px;align-items:flex-start">
 <svg width="620" height="620"><use href="#orn-frame"/></svg>
 <div style="display:grid;gap:30px">
  <svg width="120" height="120" style="color:#A0281F"><use href="#orn-rosette"/></svg>
  <svg width="120" height="120" style="color:#A0281F"><use href="#orn-chinar"/></svg>
  <svg width="420" height="24"><rect width="420" height="24" fill="url(#orn-band)"/></svg>
  <svg width="240" height="328"><use href="#orn-frame-tall"/></svg>
 </div>
</div></body>`);
console.log('ok', defs.length);
