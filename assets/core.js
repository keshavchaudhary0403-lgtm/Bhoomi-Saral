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
