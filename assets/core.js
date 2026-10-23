/* Bhoomi Saral — core rules with no page or map code: geometry, town names and the plain-language
   risk check. Loaded in the browser after content.js; tests run it with node (see tests/). */
'use strict';

/* ---------------- geometry helpers ---------------- */
function ringArea(latlngs){ // spherical polygon area in m²
  const R = 6378137, rad = Math.PI / 180; let s = 0;
  for (let i = 0; i < latlngs.length; i++){
    const [la1, lo1] = latlngs[i], [la2, lo2] = latlngs[(i + 1) % latlngs.length];
    s += (lo2 - lo1) * rad * (2 + Math.sin(la1 * rad) + Math.sin(la2 * rad));
  }
  return Math.abs(s * R * R / 2);
}
function inRing(x, y, ring){
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++){
    const [xi, yi] = ring[i], [xj, yj] = ring[j];
    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
function inGeom(lng, lat, g){
  const polys = g.type === 'Polygon' ? [g.coordinates] : g.coordinates;
  return polys.some(p => inRing(lng, lat, p[0]));
}
function bboxCenter(g){
  const polys = g.type === 'Polygon' ? [g.coordinates] : g.coordinates;
  let a = 180, b = 90, c = -180, d = -90;
  polys.forEach(p => p[0].forEach(([x, y]) => { a = Math.min(a, x); b = Math.min(b, y); c = Math.max(c, x); d = Math.max(d, y); }));
  return [(b + d) / 2, (a + c) / 2];
}

/* ---------------- village and town names ---------------- */
// statutory towns carry their Census 2011 type in brackets, e.g. "Lucknow (cb)"; census towns "(ct)" stay revenue villages
const TOWN_RE = /\s*\((np|npp|m corp\.?|cb|its)\)\s*$/i;
const townType = v => { const m = (v && v.en || '').match(TOWN_RE); if (!m) return null; const k = m[1].toLowerCase(); return k.startsWith('m corp') ? 'mc' : k; };
const vName = v => v.en ? v.en.replace(TOWN_RE, '') : t('unnamed');

/* ---------------- plain-language risk check ---------------- */
function analyse(p){
  const fl = [];
  if (p.cls === 'gs') fl.push('gs'); if (p.cls === 'bnt') fl.push('bnt'); if (p.cls === 'asami') fl.push('asami');
  if (p.cls !== 'gs' && p.n > 1) fl.push('shared');
  (p.flags || []).forEach(f => FLAGS[f] && fl.push(f));
  let lvl = 'ok';
  if (fl.some(f => FLAGS[f].lvl === 'warn')) lvl = 'warn';
  if (fl.some(f => FLAGS[f].lvl === 'bad')) lvl = 'bad';
  if (p.cls === 'gs') lvl = 'pub';
  return { fl, lvl };
}
const FLAG_IC = { shared: 'users', loan: 'bank', court: 'scale', mut: 'refresh', varasat: 'userPlus', na: 'building', bnt: 'ban', asami: 'clock', gs: 'landmark' };

/* ---------------- sound keys (Hindi and loose-spelling search) ---------------- */
// Village names in the data are English only. A query in Devanagari is turned into Latin letters, then both the
// query and the names are reduced to a "sound key" that ignores the usual spelling differences (aa/a, ee/i, w/v,
// sh/s, aspirated h, ड़ as d or r...). scripts/build_search.py has a copy of this; tests keep the two identical.
const DEVA = {
  'अ':'a','आ':'a','इ':'i','ई':'i','उ':'u','ऊ':'u','ऋ':'ri','ए':'e','ऐ':'e','ओ':'o','औ':'o',
  'ा':'a','ि':'i','ी':'i','ु':'u','ू':'u','ृ':'ri','े':'e','ै':'e','ो':'o','ौ':'o','ं':'n','ँ':'n','ः':'h','्':'',
  'क':'k','ख':'kh','ग':'g','घ':'gh','ङ':'n','च':'ch','छ':'chh','ज':'j','झ':'jh','ञ':'n',
  'ट':'t','ठ':'th','ड':'d','ढ':'dh','ण':'n','त':'t','थ':'th','द':'d','ध':'dh','न':'n',
  'प':'p','फ':'ph','ब':'b','भ':'bh','म':'m','य':'y','र':'r','ल':'l','व':'v','श':'sh','ष':'sh','स':'s','ह':'h'
};
const hasDeva = s => /[ऀ-ॿ]/.test(s);
const DEVA_CONS = new Set('कखगघङचछजझञटठडढणतथदधनपफबभमयरलवशषसह');
const DEVA_MATRA = new Set('ािीुूृेैोौ');
// Devanagari to Latin letters, with the inherent "a" that Hindi drops at the end of a word and in the middle
// of V-C-a-C-V (शिवपुर → shivpur, रामनगर → ramnagar, बसई → basai)
function devaToLatin(s){
  const syl = [];
  for (const c of s.normalize('NFD')){
    const last = syl[syl.length - 1];
    if (DEVA_CONS.has(c)) syl.push({ c: DEVA[c], v: null, coda: '' });
    else if (c === '\u093c'){ if (last && last.c) last.c = last.c.replace(/dh?$/, 'r'); } // nukta: ड़ / ढ़ sound like r
    else if (DEVA_MATRA.has(c) && last && last.c && last.v === null) last.v = DEVA[c];
    else if (c === '\u094d'){ if (last) last.v = ''; } // virama: no vowel
    else if ((c === 'ं' || c === 'ँ' || c === 'ः') && last) last.coda += DEVA[c];
    else if (DEVA[c] !== undefined) syl.push({ c: '', v: DEVA[c], coda: '' });
    else syl.push({ sep: c });
  }
  // word-final "a" goes first, then the middle ones from left to right
  syl.forEach((x, i) => { const next = syl[i + 1]; if (x.v === null && !x.coda && (!next || next.sep !== undefined)) x.v = ''; });
  return syl.map((x, i) => {
    if (x.sep !== undefined) return x.sep;
    if (x.v === null){
      const prev = syl[i - 1], next = syl[i + 1];
      const between = prev && prev.sep === undefined && prev.v !== '' && next && next.sep === undefined && next.c && next.v !== '' && !x.coda;
      x.v = between ? '' : 'a';
    }
    return x.c + x.v + x.coda;
  }).join('');
}
function soundKey(word){
  return word.toLowerCase().replace(/[^a-z]/g, '').replace(/x/g, 'ks').replace(/[ah]/g, '')
    .replace(/e/g, 'i').replace(/o/g, 'u').replace(/y/g, 'i').replace(/w/g, 'v').replace(/z/g, 'j').replace(/q/g, 'k').replace(/f/g, 'p')
    .replace(/n(?=[pb])/g, 'm').replace(/(.)\1+/g, '$1');
}
// sound keys of each word in a name or query (Devanagari or Latin), empty keys dropped
const soundKeys = s => (hasDeva(s) ? devaToLatin(s) : s).toLowerCase().split(/[^a-zऀ-ॿ]+/).map(soundKey).filter(Boolean);
// does a name match a query by sound: at the start of the name (spaces ignored) or at the start of any word
function soundMatch(nameKeys, qKeys){
  if (!qKeys.length) return false;
  const q = qKeys.join(''), n = nameKeys.join('');
  if (n.startsWith(q)) return 'start';
  return (' ' + nameKeys.join(' ')).includes(' ' + qKeys.join(' ')) ? 'word' : false;
}
// edit distance between two spellings: used to put the closest of several same-sounding names first
function spellDistance(a, b){
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++){
    const cur = [i];
    for (let j = 1; j <= b.length; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    prev = cur;
  }
  return prev[b.length];
}
