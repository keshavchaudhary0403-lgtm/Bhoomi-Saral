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

/* ---------------- UP Bhu-Naksha plot report links ---------------- */
// Bhu-Naksha codes a village as district (Census 2011 code) + tehsil (5 digits) + village (6 digits),
// e.g. 146 00766 124649. Our tehsil and village codes are the same numbers; districts are keyed here by our LGD code.
const BN_DIST = {118:146,119:143,120:175,121:178,122:162,123:191,124:139,125:180,126:193,127:182,128:170,129:176,130:150,131:185,132:134,133:149,134:142,135:196,136:171,137:190,138:201,139:161,140:177,141:159,142:172,143:147,144:141,145:140,146:195,147:183,148:188,149:168,150:155,151:165,152:194,153:166,154:137,155:160,156:163,157:164,158:174,159:153,160:189,161:167,162:157,163:144,164:187,165:169,166:148,167:145,168:192,169:138,170:199,171:135,172:133,173:151,174:173,175:158,176:136,177:132,178:186,179:198,180:152,181:181,182:184,183:154,184:200,185:179,186:156,187:197,633:202,640:203,659:205,660:206,661:204};
function bnGisCode(distLgd, tehsilCode, villageCode){
  const d = BN_DIST[distLgd];
  if (!d || !(tehsilCode > 0) || !(villageCode > 0)) return null;
  return `${d}${String(tehsilCode).padStart(5, '0')}${String(villageCode).padStart(6, '0')}`;
}
// the official single-plot report page (map, khata, area and names), opened on Bhu-Naksha itself
function bnPlotUrl(gis, plotNo){
  const n = String(plotNo || '').trim();
  return gis && n ? `https://upbhunaksha.gov.in/plotreport/${gis}/${encodeURIComponent(n)}` : null;
}

/* ---------------- plot shapes from files (KML, KMZ, GeoJSON) ---------------- */
// Returns { shapes: [{ name, ring: [[lat, lng], ...] }], projected } — projected is true when the coordinates
// are not latitude / longitude (e.g. UTM metres), in which case no shapes are returned.
function parseShapes(text){
  const out = { shapes: [], projected: false };
  const add = (name, pts) => {
    const ring = [];
    for (const [x, y] of pts){
      if (!isFinite(x) || !isFinite(y)) continue;
      if (Math.abs(x) > 180 || Math.abs(y) > 90){ out.projected = true; return; }
      const last = ring[ring.length - 1];
      if (!last || last[0] !== y || last[1] !== x) ring.push([y, x]);
    }
    if (ring.length > 1 && ring[0][0] === ring[ring.length - 1][0] && ring[0][1] === ring[ring.length - 1][1]) ring.pop();
    if (ring.length >= 3 && ringArea(ring) > 1) out.shapes.push({ name: String(name || '').trim(), ring });
  };
  const src = text.replace(/^﻿/, '').trim();
  if (src[0] === '{' || src[0] === '['){
    const props = p => p && (p.name || p.Name || p.NAME || p.khasra || p.Khasra || p.KHASRA || p.title || p.label) || '';
    const walk = (g, name) => {
      if (!g) return;
      if (g.type === 'FeatureCollection') (g.features || []).forEach(f => walk(f));
      else if (g.type === 'Feature') walk(g.geometry, props(g.properties));
      else if (g.type === 'GeometryCollection') (g.geometries || []).forEach(x => walk(x, name));
      else if (g.type === 'Polygon') add(name, g.coordinates[0] || []);
      else if (g.type === 'MultiPolygon') g.coordinates.forEach((c, i) => add(g.coordinates.length > 1 && name ? `${name} (${i + 1})` : name, c[0] || []));
      else if (g.type === 'LineString') add(name, g.coordinates);
      else if (g.type === 'MultiLineString') g.coordinates.forEach(c => add(name, c));
    };
    const j = JSON.parse(src);
    (Array.isArray(j) ? j : [j]).forEach(x => walk(x));
  } else {
    const tag = n => `<(?:\\w+:)?${n}\\b[^>]*>([\\s\\S]*?)<\\/(?:\\w+:)?${n}>`;
    const unxml = s => s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').replace(/<[^>]+>/g, '')
      .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&amp;/g, '&');
    const coords = s => s.trim().split(/\s+/).map(c => c.split(',').map(Number));
    for (const [, pm] of src.matchAll(new RegExp(tag('Placemark'), 'g'))){
      const name = unxml((pm.match(new RegExp(tag('name'))) || [, ''])[1]);
      const outers = [...pm.matchAll(new RegExp(tag('outerBoundaryIs'), 'g'))];
      if (outers.length) outers.forEach(([, o], i) => add(outers.length > 1 && name ? `${name} (${i + 1})` : name, coords((o.match(new RegExp(tag('coordinates'))) || [, ''])[1])));
      else for (const [, l] of pm.matchAll(new RegExp(tag('LineString'), 'g'))) add(name, coords((l.match(new RegExp(tag('coordinates'))) || [, ''])[1]));
    }
  }
  return out;
}
// KMZ is a zip holding a .kml file: find it through the zip's central directory and inflate it
async function kmzToKml(buf){
  const u8 = new Uint8Array(buf), dv = new DataView(buf);
  let eocd = -1;
  for (let i = u8.length - 22; i >= Math.max(0, u8.length - 65557); i--) if (dv.getUint32(i, true) === 0x06054b50){ eocd = i; break; }
  if (eocd < 0) throw new Error('not a zip');
  let p = dv.getUint32(eocd + 16, true), pick = null;
  for (let n = dv.getUint16(eocd + 10, true); n > 0 && dv.getUint32(p, true) === 0x02014b50; n--){
    const method = dv.getUint16(p + 10, true), size = dv.getUint32(p + 20, true), nameLen = dv.getUint16(p + 28, true);
    const name = new TextDecoder().decode(u8.subarray(p + 46, p + 46 + nameLen)), local = dv.getUint32(p + 42, true);
    if (/\.kml$/i.test(name) && (!pick || /(^|\/)doc\.kml$/i.test(name))) pick = { method, size, local };
    p += 46 + nameLen + dv.getUint16(p + 30, true) + dv.getUint16(p + 32, true);
  }
  if (!pick) throw new Error('no kml in kmz');
  const start = pick.local + 30 + dv.getUint16(pick.local + 26, true) + dv.getUint16(pick.local + 28, true);
  const data = u8.subarray(start, start + pick.size);
  if (pick.method === 0) return new TextDecoder().decode(data);
  if (pick.method !== 8) throw new Error('unsupported zip method');
  const stream = new Blob([data]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
  return new Response(stream).text();
}
