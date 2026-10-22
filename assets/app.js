/* Bhoomi Saral — map, data loading and UI.
   Village outlines come from open Census 2011 / LGD data (see ATTRIBUTION.md).
   Personal plot data is stored only in this browser (localStorage). */
'use strict';

Object.assign(T, {
  searchPh:{en:'Search any UP village…',hi:'यूपी का कोई भी गाँव खोजें…'},
  attrib:{en:'Boundaries: Census 2011 / LGD village outlines via the open INDIAN-SHAPEFILES dataset (MIT). Approximate — not legal boundaries.',hi:'सीमाएँ: जनगणना 2011 / LGD ग्राम सीमाएँ (ओपन INDIAN-SHAPEFILES डेटा, MIT)। अनुमानित — क़ानूनी सीमा नहीं।'},
  fNote:{en:'Your note (optional)',hi:'आपका नोट (वैकल्पिक)'},notePh:{en:"e.g. Dada ji's field near the canal",hi:'जैसे नहर के पास दादा जी का खेत'},
  exDraw:{en:'✏️ Draw this plot on the map',hi:'✏️ नक्शे पर खेत बनाएँ'},exSample:{en:'See an example card',hi:'उदाहरण कार्ड देखें'},
  mineSub2:{en:'Your saved plots. Stored only in this browser on this device.',hi:'आपके सहेजे गए खेत। केवल इसी डिवाइस के ब्राउज़र में।'},
  moveT:{en:'Use on another device',hi:'दूसरे डिवाइस पर उपयोग'},moveB:{en:'Your data never goes to any server. To move it, export a file here and import it on your other device.',hi:'आपका डेटा किसी सर्वर पर नहीं जाता। दूसरे डिवाइस पर ले जाने के लिए यहाँ फ़ाइल निर्यात करें और वहाँ आयात करें।'},
  exp:{en:'⬇ Export my data',hi:'⬇ डेटा निर्यात करें'},imp:{en:'⬆ Import file',hi:'⬆ फ़ाइल आयात करें'},
  gPh:{en:'Search… e.g. khatauni, वरासत',hi:'खोजें… जैसे खतौनी, वरासत'},
  whereAmI:{en:'Which village am I in?',hi:'मैं किस गाँव में हूँ?'},allUP:{en:'All UP',hi:'पूरा यूपी'},
  dGps:{en:'📍 Add my GPS position',hi:'📍 मेरी GPS स्थिति जोड़ें'},dUndo:{en:'↶ Undo',hi:'↶ वापस'},dDone:{en:'✓ Finish',hi:'✓ पूरा करें'},dCancel:{en:'Cancel',hi:'रद्द करें'},
  districts:{en:'districts',hi:'जनपद'},tehsils:{en:'tehsils',hi:'तहसीलें'},villages:{en:'villages',hi:'गाँव'},
  allDistricts:{en:'Uttar Pradesh',hi:'उत्तर प्रदेश'},filterPh:{en:'Type to filter…',hi:'छाँटने के लिए लिखें…'},
  pickDistrict:{en:'Choose your district',hi:'अपना जनपद चुनें'},pickTehsil:{en:'Choose tehsil',hi:'तहसील चुनें'},pickVillage:{en:'Choose village',hi:'गाँव चुनें'},
  village:{en:'Village',hi:'ग्राम'},tehsil:{en:'Tehsil',hi:'तहसील'},district:{en:'District',hi:'जनपद'},
  gp:{en:'Gram panchayat',hi:'ग्राम पंचायत'},block:{en:'Block',hi:'विकास खंड'},lgdCode:{en:'LGD village code',hi:'LGD ग्राम कोड'},c11:{en:'Census 2011 code',hi:'जनगणना 2011 कोड'},
  vArea:{en:'Village area (approx.)',hi:'गाँव का क्षेत्रफल (लगभग)'},
  seeRecords:{en:'See this village\'s real records — free',hi:'इस गाँव के असली रिकॉर्ड देखें — मुफ़्त'},
  stepBhulekh:{en:'On UP Bhulekh choose: district <b>{d}</b> → tehsil <b>{t}</b> → village <b>{v}</b>, then search your khasra or khata.',hi:'UP भूलेख पर चुनें: जनपद <b>{d}</b> → तहसील <b>{t}</b> → ग्राम <b>{v}</b>, फिर अपना खसरा या खाता खोजें।'},
  stepNaksha:{en:'On UP Bhu-Naksha pick the same village and click your plot to see its shape.',hi:'UP भू-नक्शा पर यही गाँव चुनें और अपने खेत पर क्लिक करें।'},
  stepExplain:{en:'Come back and enter what you see in "Explain" — or draw your plot here.',hi:'वापस आकर जो दिखे उसे "समझें" में भरें — या यहाँ अपना खेत बनाएँ।'},
  tehsilNote:{en:'Tehsil names follow Census 2011. Some tehsils were created later — if the name differs on Bhulekh, pick the current tehsil.',hi:'तहसील के नाम जनगणना 2011 के अनुसार हैं। कुछ तहसीलें बाद में बनीं — भूलेख पर नाम अलग हो तो वर्तमान तहसील चुनें।'},
  addPlot:{en:'➕ Add my plot in this village',hi:'➕ इस गाँव में मेरा खेत जोड़ें'},copy:{en:'Copy',hi:'कॉपी'},copied:{en:'Copied',hi:'कॉपी हो गया'},
  approx:{en:'Village outline is approximate (Census 2011 / LGD) — not a legal boundary.',hi:'गाँव की सीमा अनुमानित है (जनगणना 2011 / LGD) — क़ानूनी सीमा नहीं।'},
  myHere:{en:'My plots in this village',hi:'इस गाँव में मेरे खेत'},
  drawHelp:{en:'Tap each corner of your field on the map — or stand at each corner and press <b>Add my GPS position</b>.',hi:'नक्शे पर अपने खेत के हर कोने पर टैप करें — या हर कोने पर खड़े होकर <b>मेरी GPS स्थिति जोड़ें</b> दबाएँ।'},
  points:{en:'Corners',hi:'कोने'},mapArea:{en:'Area on map',hi:'नक्शे पर क्षेत्रफल'},needs3:{en:'Add at least 3 corners.',hi:'कम से कम 3 कोने जोड़ें।'},
  gpsFail:{en:'Could not get your location. Allow location access and try again.',hi:'आपकी लोकेशन नहीं मिली। लोकेशन की अनुमति दें और फिर कोशिश करें।'},
  gpsAcc:{en:'GPS point added (±{m} m).',hi:'GPS बिंदु जोड़ा गया (±{m} मी.)।'},
  notInUP:{en:'Your location seems to be outside Uttar Pradesh.',hi:'आपकी लोकेशन उत्तर प्रदेश के बाहर लगती है।'},locating:{en:'Finding your location…',hi:'लोकेशन खोजी जा रही है…'},
  shapeSet:{en:'Plot shape drawn: {a} ha on the map.',hi:'खेत का आकार बना: नक्शे पर {a} हेक्टेयर।'},
  inVillage:{en:'Village: <b>{v}</b>, {t}, {d}',hi:'ग्राम: <b>{v}</b>, {t}, {d}'},
  exported:{en:'Exported. Keep this file private.',hi:'निर्यात हो गया। यह फ़ाइल निजी रखें।'},imported:{en:'Imported {n} plots.',hi:'{n} खेत आयात हुए।'},badFile:{en:'That file is not a Bhoomi Saral export.',hi:'यह Bhoomi Saral की फ़ाइल नहीं है।'},
  deleted:{en:'Removed.',hi:'हटा दिया।'},savedT:{en:'Saved to My land ✓',hi:'मेरी ज़मीन में सहेजा गया ✓'},
  noMatch:{en:'No village found.',hi:'कोई गाँव नहीं मिला।'},searching:{en:'Loading village list…',hi:'गाँवों की सूची लोड हो रही है…'},
  mapShape:{en:'Shape drawn on map',hi:'नक्शे पर बना आकार'},recArea:{en:'Area in record',hi:'रिकॉर्ड में रकबा'},
  note:{en:'Note',hi:'नोट'},showOnMap:{en:'Show on map',hi:'नक्शे पर दिखाएँ'},
  sampleSrc:{en:'Example only — not a real record.',hi:'केवल उदाहरण — असली रिकॉर्ड नहीं।'},
  loadFail:{en:'Could not load map data. Check your internet and reload.',hi:'नक्शे का डेटा लोड नहीं हुआ। इंटरनेट जाँचें और दोबारा खोलें।'},
  storeFail:{en:'Could not save — browser storage is blocked.',hi:'सहेजा नहीं जा सका — ब्राउज़र स्टोरेज बंद है।'}
});

const $ = id => document.getElementById(id);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt = (n, d = 2) => Number(n || 0).toLocaleString(LANG === 'hi' ? 'hi-IN' : 'en-IN', {maximumFractionDigits: d});
const tf = (k, vars) => t(k).replace(/\{(\w+)\}/g, (_, v) => vars[v] ?? '');
function toast(msg){ const el = $('toast'); el.textContent = msg; el.classList.add('on'); clearTimeout(toast._t); toast._t = setTimeout(() => el.classList.remove('on'), 2600); }

const store = {
  get(k, d){ try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch(e){ return d; } },
  set(k, v){ try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch(e){ return false; } }
};
const mine = () => store.get('bs_plots', []);
function saveMine(list){ if (!store.set('bs_plots', list)) toast(t('storeFail')); drawMine(); renderMine(); }

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

/* ---------------- state & data ---------------- */
const S = { districts: null, byLgd: {}, dist: null, data: null, tehsil: null, village: null, cache: {}, search: null,
            exVillage: null, pendingShape: null, draw: null, lastSheet: null, filter: '' };

async function getJSON(url){ const r = await fetch(url); if (!r.ok) throw new Error(url + ' ' + r.status); return r.json(); }
async function loadDistrictData(lgd){
  if (!S.cache[lgd]) S.cache[lgd] = getJSON(`data/d/${lgd}.json`).then(d => {
    d.villages.features.forEach(f => { f.c = bboxCenter(f.geometry); });
    return d;
  });
  return S.cache[lgd];
}
const dName = d => d ? (LANG === 'hi' ? d.hi : d.en) : '';

/* ---------------- map ---------------- */
const map = L.map('map', { preferCanvas: true, zoomControl: true, minZoom: 6, zoomSnap: 0.25 }).setView([26.9, 80.9], 7);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19,
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' }).addTo(map);
const canvas = L.canvas({ padding: 0.4 });
let districtLayer, tehsilLayer = L.layerGroup().addTo(map), villageLayer = L.layerGroup().addTo(map),
    labelLayer = L.layerGroup().addTo(map), mineLayer = L.layerGroup().addTo(map), drawLayer = L.layerGroup().addTo(map), hereLayer = L.layerGroup().addTo(map);
const ST = {
  dist: { color: '#14614a', weight: 1.2, fillColor: '#1d8a66', fillOpacity: 0.1 },
  distOn: { color: '#c8642b', weight: 3, fillOpacity: 0 },
  teh: { color: '#6b4aa0', weight: 1.6, dashArray: '5 5', fill: false, interactive: false },
  vil: { color: '#c8642b', weight: 0.8, fillColor: '#e8892b', fillOpacity: 0.06 },
  vilHover: { weight: 2, fillOpacity: 0.22 },
  vilOn: { color: '#14231d', weight: 3, fillColor: '#e8892b', fillOpacity: 0.28 }
};
let villageById = {}, selectedVillageLayer = null;

function drawDistricts(){
  districtLayer = L.geoJSON(S.districts, { renderer: canvas, style: () => ST.dist,
    onEachFeature: (f, l) => {
      l.bindTooltip(() => dName(f.properties), { sticky: true });
      l.on('click', () => { if (!S.dist || S.dist.lgd !== f.properties.lgd) selectDistrict(f.properties.lgd); });
    } }).addTo(map);
  districtLayer.bringToBack();
}
function styleDistricts(){ districtLayer.eachLayer(l => l.setStyle(S.dist && l.feature.properties.lgd === S.dist.lgd ? ST.distOn : ST.dist)); }

function drawDistrictContents(){
  tehsilLayer.clearLayers(); villageLayer.clearLayers(); labelLayer.clearLayers(); villageById = {}; selectedVillageLayer = null;
  if (!S.data) return;
  L.geoJSON(S.data.tehsils, { renderer: canvas, style: () => ST.teh }).addTo(tehsilLayer);
  L.geoJSON(S.data.villages, { renderer: canvas, style: () => ST.vil,
    onEachFeature: (f, l) => {
      villageById[f.properties.lgd] = l;
      l.on('mouseover', () => { if (l !== selectedVillageLayer) l.setStyle(ST.vilHover); });
      l.on('mouseout', () => { if (l !== selectedVillageLayer) l.setStyle(ST.vil); });
      l.on('click', () => { if (!S.draw) selectVillage(f.properties.lgd, { zoom: false }); }); // while drawing, the map click adds the corner
    } }).addTo(villageLayer);
  updateLabels();
}
function updateLabels(){
  labelLayer.clearLayers();
  if (!S.data || map.getZoom() < 13) return;
  const b = map.getBounds(); let n = 0;
  for (const f of S.data.villages.features){
    if (n > 220) break;
    if (b.contains(f.c)){ n++;
      L.tooltip({ permanent: true, direction: 'center', className: 'vlabel', interactive: false }).setLatLng(f.c).setContent(esc(f.properties.en)).addTo(labelLayer);
    }
  }
}
map.on('moveend', updateLabels);
map.on('click', e => { if (S.draw) addDrawPoint(e.latlng); });

/* ---------------- navigation ---------------- */
// keep the focused shape clear of the detail card on wide screens
const sidePad = () => innerWidth > 860 ? { paddingTopLeft: [40, 40], paddingBottomRight: [470, 40] } : { padding: [30, 30] };
async function selectDistrict(lgd, opts = {}){
  const d = S.byLgd[lgd]; if (!d) return;
  S.dist = d; S.tehsil = null; S.village = null; S.filter = '';
  styleDistricts(); renderFind(true);
  if (opts.zoom !== false) map.flyToBounds(L.geoJSON(d.f).getBounds(), { duration: 0.8, padding: [20, 20] });
  try { S.data = await loadDistrictData(lgd); } catch(e){ toast(t('loadFail')); return; }
  if (S.dist !== d) return;
  drawDistrictContents(); renderFind(); setHash();
}
function selectTehsil(name){
  S.tehsil = name; S.village = null; S.filter = ''; renderFind();
  const tf_ = S.data.tehsils.features.find(f => f.properties.en === name);
  if (tf_) map.flyToBounds(L.geoJSON(tf_).getBounds(), { duration: 0.7, padding: [20, 20] });
}
function selectVillage(vlgd, opts = {}){
  if (!S.data) return;
  const f = S.data.villages.features.find(x => x.properties.lgd === vlgd); if (!f) return;
  S.village = f; S.tehsil = f.properties.t;
  if (selectedVillageLayer) selectedVillageLayer.setStyle(ST.vil);
  selectedVillageLayer = villageById[vlgd]; if (selectedVillageLayer){ selectedVillageLayer.setStyle(ST.vilOn); selectedVillageLayer.bringToFront(); }
  if (opts.zoom !== false) map.flyToBounds(L.geoJSON(f).getBounds(), Object.assign({ duration: 0.7, maxZoom: 15 }, sidePad()));
  renderFind(); renderVillage(f); setHash();
}
function goUP(){
  S.dist = null; S.data = null; S.tehsil = null; S.village = null; S.filter = '';
  drawDistrictContents(); styleDistricts(); closeSheet(); renderFind(); setHash();
  map.flyToBounds(districtLayer.getBounds(), { duration: 0.8 });
}
function setHash(){
  const h = S.village ? `#d=${S.dist.lgd}&v=${S.village.properties.lgd}` : S.dist ? `#d=${S.dist.lgd}` : '';
  history.replaceState(null, '', h || location.pathname);
}

/* ---------------- Find pane ---------------- */
function renderFind(loading){
  const c = $('crumbs'), body = $('findBody');
  let cr = `<button class="${!S.dist ? 'cur' : ''}" data-go="up">${t('allDistricts')}</button>`;
  if (S.dist) cr += `<span>›</span><button class="${S.dist && !S.tehsil ? 'cur' : ''}" data-go="d">${esc(dName(S.dist))}</button>`;
  if (S.tehsil) cr += `<span>›</span><button class="${!S.village ? 'cur' : ''}" data-go="t">${esc(S.tehsil)}</button>`;
  if (S.village) cr += `<span>›</span><button class="cur" data-go="v">${esc(S.village.properties.en)}</button>`;
  c.innerHTML = cr;
  c.querySelectorAll('button').forEach(b => b.onclick = () => {
    const g = b.dataset.go;
    if (g === 'up') goUP(); else if (g === 'd') { S.tehsil = null; S.village = null; S.filter = ''; renderFind(); map.flyToBounds(L.geoJSON(S.dist.f).getBounds(), { duration: .7 }); }
    else if (g === 't') selectTehsil(S.tehsil); else if (g === 'v') renderVillage(S.village);
  });

  let items = [], title, count = '';
  if (!S.dist){
    title = t('pickDistrict');
    items = S.districts.features.map(f => ({ k: f.properties.lgd, a: dName(f.properties), b: LANG === 'hi' ? f.properties.en : f.properties.hi, act: () => selectDistrict(f.properties.lgd) }));
    count = `75 ${t('districts')} · 310 ${t('tehsils')} · 1,01,753 ${t('villages')}`;
  } else if (loading || !S.data){
    body.innerHTML = `<div class="loading">${esc(dName(S.dist))}…</div>`; return;
  } else if (!S.tehsil){
    title = t('pickTehsil');
    const counts = {}; S.data.villages.features.forEach(f => counts[f.properties.t] = (counts[f.properties.t] || 0) + 1);
    items = S.data.tehsils.features.map(f => ({ k: f.properties.en, a: f.properties.en, b: `${fmt(counts[f.properties.en] || 0, 0)} ${t('villages')}`, act: () => selectTehsil(f.properties.en) }));
    count = `${S.data.tehsils.features.length} ${t('tehsils')} · ${fmt(S.data.villages.features.length, 0)} ${t('villages')}`;
  } else {
    title = t('pickVillage');
    items = S.data.villages.features.filter(f => f.properties.t === S.tehsil)
      .sort((x, y) => x.properties.en.localeCompare(y.properties.en))
      .map(f => ({ k: f.properties.lgd, a: f.properties.en, b: `${t('gp')}: ${f.properties.gp || '—'} · ${fmt(f.properties.a, 0)} ha`, act: () => selectVillage(f.properties.lgd), on: S.village && S.village.properties.lgd === f.properties.lgd }));
    count = `${items.length} ${t('villages')}`;
  }
  body.innerHTML = `<div class="hello"><h2>${title}</h2></div>
    <input type="text" class="filter" id="flt" placeholder="${t('filterPh')}" value="${esc(S.filter)}">
    <div class="count">${count}</div><div class="list" id="flist"></div>`;
  const draw = () => {
    const q = S.filter.toLowerCase();
    const shown = items.filter(i => !q || (i.a + ' ' + i.b).toLowerCase().includes(q)).slice(0, 400);
    $('flist').innerHTML = shown.map((i, n) => `<button class="item" data-n="${n}" style="${i.on ? 'border-color:var(--green2);background:var(--mint)' : ''}"><span><b>${esc(i.a)}</b><small>${esc(i.b)}</small></span><span class="arr">›</span></button>`).join('') || `<div class="empty">—</div>`;
    $('flist').querySelectorAll('.item').forEach(b => b.onclick = () => shown[+b.dataset.n].act());
  };
  $('flt').oninput = e => { S.filter = e.target.value; draw(); };
  draw();
}

/* ---------------- sheet ---------------- */
const sheet = $('sheet');
$('sheetX').onclick = closeSheet;
function closeSheet(){ sheet.classList.remove('open'); S.lastSheet = null; }
function openSheet(hd, bd, kind){ $('sheetHd').innerHTML = hd; $('sheetBd').innerHTML = bd; $('sheetBd').scrollTop = 0; sheet.classList.add('open'); S.lastSheet = kind; }

function vctx(f){ return { lgd: f.properties.lgd, en: f.properties.en, t: f.properties.t, d: S.dist.en, dhi: S.dist.hi, dl: S.dist.lgd }; }
function renderVillage(f){
  const p = f.properties, ha = p.a || 0;
  const plots = mine().filter(x => x.village && x.village.lgd === p.lgd);
  const hd = `<div class="eyebrow">${t('village')} · ${esc(p.t)} · ${esc(dName(S.dist))}</div><div class="title">${esc(p.en)}</div>
    <div class="hint">${t('lgdCode')} ${esc(p.lgd)} · ${t('c11')} ${esc(p.c11)}</div>`;
  const bd = `
    <div class="stats">
      <div class="stat"><div class="v">${fmt(ha, 0)}</div><div class="k">${t('hect')}</div></div>
      <div class="stat"><div class="v">${fmt(ha * 2.47105, 0)}</div><div class="k">${t('acre')}</div></div>
      <div class="stat"><div class="v">${fmt(ha / 100, 2)}</div><div class="k">km²</div></div>
    </div>
    <div class="sec" style="margin-top:0">
      <div class="kv"><span>${t('gp')}</span><span>${esc(p.gp || '—')}</span></div>
      <div class="kv"><span>${t('block')}</span><span>${esc(p.b || '—')}</span></div>
      <div class="kv"><span>${t('tehsil')}</span><span>${esc(p.t)}</span></div>
      <div class="kv"><span>${t('district')}</span><span>${esc(S.dist.en)} · <span class="hi">${esc(S.dist.hi)}</span></span></div>
    </div>
    <div class="sec"><h3>🔎 ${t('seeRecords')}</h3>
      <ol class="steps-mini">
        <li>${tf('stepBhulekh', { d: esc(S.dist.en), t: esc(p.t), v: esc(p.en) })} <button class="copy" data-copy="${esc(p.en)}">${t('copy')}</button></li>
        <li>${t('stepNaksha')}</li>
        <li>${t('stepExplain')}</li>
      </ol>
      <p class="hint" style="margin:8px 0 0">${t('tehsilNote')}</p>
    </div>
    <div class="sec links">
      <a href="https://upbhulekh.gov.in" target="_blank" rel="noopener">${LANG === 'hi' ? 'UP भूलेख — खतौनी देखें' : 'UP Bhulekh — view khatauni'}<small>upbhulekh.gov.in</small></a>
      <a href="https://upbhunaksha.gov.in" target="_blank" rel="noopener">${LANG === 'hi' ? 'UP भू-नक्शा' : 'UP Bhu-Naksha (plot map)'}<small>upbhunaksha.gov.in</small></a>
      <a href="https://vaad.up.nic.in" target="_blank" rel="noopener">${LANG === 'hi' ? 'राजस्व वाद / नामांतरण' : 'Revenue courts & mutation'}<small>vaad.up.nic.in</small></a>
    </div>
    <button class="btn" id="addHere" style="width:100%;margin-top:6px">${t('addPlot')}</button>
    ${plots.length ? `<div class="sec"><h3>⭐ ${t('myHere')}</h3>${plots.map(x => `<div class="mycard"><div><b>${t('khasra')} ${esc(x.khasra)}</b><div class="hint">${fmt(x.areaHa, 4)} ${t('hect')}</div></div><button class="btn sm" data-open="${esc(x.id)}">${t('open')}</button></div>`).join('')}</div>` : ''}
    <div class="src">${t('approx')}</div>`;
  openSheet(hd, bd, { type: 'village', f });
  $('sheetBd').querySelectorAll('[data-copy]').forEach(b => b.onclick = () => { navigator.clipboard?.writeText(b.dataset.copy).then(() => toast(t('copied'))).catch(() => {}); });
  $('sheetBd').querySelectorAll('[data-open]').forEach(b => b.onclick = () => openPlot(b.dataset.open));
  $('addHere').onclick = () => { setExVillage(vctx(f)); switchTab('explain'); };
}

/* ---------------- plain-language plot card ---------------- */
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
const COLOR = { ok: '#1d8a66', warn: '#d99a2b', bad: '#c0442f', pub: '#7b5bb5' };

function renderPlot(p, mode){ // mode: 'saved' | 'draft' | 'sample'
  const a = analyse(p), C = CLASSES[p.cls] || CLASSES.bt, L_ = LANG;
  const vk = { ok: ['v-ok', '✅', t('v_ok'), t('v_okB')], warn: ['v-warn', '⚠️', t('v_warn'), t('v_warnB')], bad: ['v-bad', '⛔', t('v_bad'), t('v_badB')], pub: ['v-pub', '🏛️', t('v_pub'), t('v_pubB')] }[a.lvl];
  const share = p.n > 1 ? '1/' + p.n : '1/1', ha = Number(p.areaHa) || 0;
  const v = p.village;
  const hd = `<div class="eyebrow">${v ? esc(v.en) + ' · ' + esc(v.t) + ' · ' + esc(L_ === 'hi' ? v.dhi : v.d) : t('yourPlot')}</div>
    <div class="title">${t('khasra')} ${esc(p.khasra || '—')}</div><div class="hint">${t('khataNo')} ${esc(p.khata || '—')}</div>`;
  const shapeHa = p.shape ? ringArea(p.shape) / 10000 : null;
  const bd = `<div class="verdict ${vk[0]}"><span style="font-size:20px">${vk[1]}</span><div><b>${vk[2]}</b>${vk[3]}</div></div>
    <div class="stats">
      <div class="stat"><div class="v">${fmt(ha, 4)}</div><div class="k">${t('hect')}</div></div>
      <div class="stat"><div class="v">${fmt(ha * 2.47105)}</div><div class="k">${t('acre')}</div></div>
      <div class="stat"><div class="v">${fmt(ha * 10000, 0)}</div><div class="k">${t('sqm')}</div></div>
    </div>
    <div class="sec"><h3>📋 ${t('recIn')}</h3>
      <div class="kv"><span>${t('klass')}</span><span class="hi">${C.hi}<br><small style="color:var(--muted)">${C.en}</small></span></div>
      <div class="kv"><span>${t('canSell')}</span><span>${C.sell[L_]}</span></div>
      <div class="kv"><span>${t('holders')}</span><span>${p.n || 1} · ${share}</span></div>
      <div class="kv"><span>${t('bigha')}</span><span>${fmt(ha / 0.2529)}</span></div>
      ${shapeHa ? `<div class="kv"><span>${t('mapShape')}</span><span>${fmt(shapeHa, 4)} ${t('hect')}</span></div>` : ''}
      ${p.note ? `<div class="kv"><span>${t('note')}</span><span>${esc(p.note)}</span></div>` : ''}
      <p class="hint" style="margin:6px 0 0">${L_ === 'hi' ? '* बीघा का माप ज़िले के अनुसार बदलता है। यहाँ पक्का बीघा ≈ 0.2529 हेक्टेयर माना गया है — लेखपाल से पुष्टि करें।' : '* Bigha size varies by district. Shown using pakka bigha ≈ 0.2529 ha — confirm locally with the lekhpal.'}</p>
    </div>
    <div class="sec"><h3>💡 ${t('whatMeans')}</h3>
      <div class="flag f-ok"><div class="h">📌 ${L_ === 'hi' ? C.hi : C.en}</div>${C.mean[L_]}</div>
      ${a.fl.map(f => { const F = FLAGS[f]; return `<div class="flag f-${F.lvl}"><div class="h">${F.ic} ${F.h[L_]}</div>${F.b[L_].replace('{n}', p.n).replace('{f}', share)}<div class="todo"><b>${t('todo')}</b> ${F.d[L_]}</div></div>`; }).join('')}
    </div>
    <div class="sec"><div class="notprove"><b>🔍 ${t('notProveT')}</b><br>${L_ === 'hi'
      ? 'खतौनी बताती है कि सरकार किसे खातेदार के रूप में दर्ज मानती है। यह स्वामित्व का पक्का प्रमाण <b>नहीं</b> है, ज़मीन की सटीक सीमा नहीं बताती, और हाल के या बिना रजिस्ट्री के सौदे इसमें नहीं दिख सकते। ख़रीदने से पहले बैनामों की श्रृंखला (igrsup.gov.in), वाद की स्थिति और लेखपाल से पैमाइश ज़रूर कराएँ।'
      : 'The khatauni shows who the government records as holder. It is <b>not</b> conclusive proof of ownership, does not fix exact boundaries on the ground, and may miss very recent or unregistered deals. Before buying, check the chain of registered sale deeds (igrsup.gov.in), court cases, and get a measurement (पैमाइश) done with the lekhpal.'}</div></div>
    <div class="sec links"><h3>🔗 ${t('nextT')}</h3>
      <a href="https://upbhulekh.gov.in" target="_blank" rel="noopener">${L_ === 'hi' ? 'असली खतौनी देखें' : 'View the real khatauni'}<small>upbhulekh.gov.in</small></a>
      <a href="https://upbhunaksha.gov.in" target="_blank" rel="noopener">${L_ === 'hi' ? 'आधिकारिक भू-नक्शा' : 'Official plot map (Bhu-Naksha)'}<small>upbhunaksha.gov.in</small></a>
      <a href="https://vaad.up.nic.in" target="_blank" rel="noopener">${L_ === 'hi' ? 'राजस्व वाद / नामांतरण की स्थिति' : 'Revenue court & mutation status'}<small>vaad.up.nic.in</small></a>
      <a href="https://igrsup.gov.in" target="_blank" rel="noopener">${L_ === 'hi' ? 'रजिस्ट्री / भार-मुक्त प्रमाण पत्र' : 'Registry & encumbrance search'}<small>igrsup.gov.in</small></a>
    </div>
    ${mode === 'saved' ? `<div style="display:flex;gap:8px;margin-top:12px">${p.shape ? `<button class="btn sm" id="pShow">${t('showOnMap')}</button>` : ''}<button class="btn ghost sm" id="pDel">${t('del')}</button></div>` : ''}
    <div class="src">${mode === 'sample' ? t('sampleSrc') : t('userSrc')}</div>`;
  openSheet(hd, bd, { type: 'plot', p, mode });
  if (mode === 'saved'){
    if ($('pShow')) $('pShow').onclick = () => map.flyToBounds(L.polygon(p.shape).getBounds(), Object.assign({ maxZoom: 18 }, sidePad()));
    $('pDel').onclick = () => { saveMine(mine().filter(x => x.id !== p.id)); closeSheet(); toast(t('deleted')); };
  }
}
function openPlot(id){
  const p = mine().find(x => x.id === id); if (!p) return;
  renderPlot(p, 'saved');
  if (p.shape) map.flyToBounds(L.polygon(p.shape).getBounds(), Object.assign({ maxZoom: 18 }, sidePad()));
}

/* ---------------- Explain form ---------------- */
function setExVillage(v){
  S.exVillage = v;
  const el = $('exVillage');
  if (v){ el.style.display = 'block'; el.innerHTML = tf('inVillage', { v: esc(v.en), t: esc(v.t), d: esc(LANG === 'hi' ? v.dhi : v.d) }); }
  else el.style.display = 'none';
}
function readForm(){
  const flags = [];
  [['exLoan', 'loan'], ['exCourt', 'court'], ['exMut', 'mut'], ['exVar', 'varasat'], ['exNA', 'na']].forEach(([id, f]) => { if ($(id).checked) flags.push(f); });
  let areaHa = parseFloat($('exArea').value);
  if (!(areaHa > 0) && S.pendingShape) areaHa = +(ringArea(S.pendingShape) / 10000).toFixed(4);
  return { id: 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    khasra: $('exKhasra').value.trim(), khata: $('exKhata').value.trim(), areaHa: areaHa || 0,
    n: Math.max(1, parseInt($('exOwners').value) || 1), cls: $('exClass').value, flags, note: $('exNote').value.trim(),
    village: S.exVillage, shape: S.pendingShape, saved: Date.now() };
}
$('exGo').onclick = () => renderPlot(readForm(), 'draft');
$('exSave').onclick = () => {
  const p = readForm(); const list = mine(); list.unshift(p); saveMine(list);
  S.pendingShape = null; $('exShape').textContent = ''; toast(t('savedT')); renderPlot(p, 'saved');
  ['exKhasra', 'exKhata', 'exArea', 'exNote'].forEach(id => { $(id).value = ''; }); $('exOwners').value = 1;
  ['exLoan', 'exCourt', 'exMut', 'exVar', 'exNA'].forEach(id => { $(id).checked = false; });
};
$('exDraw').onclick = () => startDraw();
$('exSample').onclick = () => renderPlot({ khasra: '131', khata: '00070', areaHa: 0.1706, n: 2, cls: 'bt', flags: ['loan'], village: null }, 'sample');

/* ---------------- draw my plot ---------------- */
function startDraw(){
  S.draw = { pts: [] }; drawLayer.clearLayers(); closeSheet();
  $('drawbar').classList.add('on'); updateDraw();
  if (map.getZoom() < 15 && S.village) map.flyToBounds(L.geoJSON(S.village).getBounds(), { maxZoom: 16 });
}
function addDrawPoint(ll){
  const last = S.draw.pts[S.draw.pts.length - 1];
  if (last && last[0] === ll.lat && last[1] === ll.lng) return;
  S.draw.pts.push([ll.lat, ll.lng]); updateDraw();
}
function updateDraw(){
  drawLayer.clearLayers(); const pts = S.draw.pts;
  pts.forEach(p => L.circleMarker(p, { radius: 5, color: '#fff', weight: 2, fillColor: '#c8642b', fillOpacity: 1 }).addTo(drawLayer));
  if (pts.length >= 2) L.polygon(pts, { color: '#c8642b', weight: 2.5, fillColor: '#e8892b', fillOpacity: 0.3 }).addTo(drawLayer);
  const ha = pts.length >= 3 ? ringArea(pts) / 10000 : 0;
  $('drawInfo').innerHTML = `${t('drawHelp')}<br>${t('points')}: <b>${pts.length}</b> · ${t('mapArea')}: <b>${fmt(ha, 4)} ${t('hect')}</b> (${fmt(ha * 2.47105)} ${t('acre')})`;
}
function endDraw(){ S.draw = null; drawLayer.clearLayers(); $('drawbar').classList.remove('on'); }
$('dUndo').onclick = () => { S.draw.pts.pop(); updateDraw(); };
$('dCancel').onclick = endDraw;
$('dGps').onclick = () => {
  if (!navigator.geolocation) return toast(t('gpsFail'));
  navigator.geolocation.getCurrentPosition(pos => {
    const ll = L.latLng(pos.coords.latitude, pos.coords.longitude); addDrawPoint(ll); map.panTo(ll);
    toast(tf('gpsAcc', { m: Math.round(pos.coords.accuracy) }));
  }, () => toast(t('gpsFail')), { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 });
};
$('dDone').onclick = async () => {
  const pts = S.draw.pts; if (pts.length < 3) return toast(t('needs3'));
  S.pendingShape = pts.map(([a, b]) => [+a.toFixed(6), +b.toFixed(6)]); endDraw();
  if (!S.exVillage){ const v = await villageAt(pts[0][0], pts[0][1]); if (v) setExVillage(v); }
  $('exShape').textContent = tf('shapeSet', { a: fmt(ringArea(S.pendingShape) / 10000, 4) });
  L.polygon(S.pendingShape, { color: '#c8642b', weight: 2.5, dashArray: '6 4', fillOpacity: 0.2 }).addTo(drawLayer);
  switchTab('explain');
};

/* ---------------- my land ---------------- */
function drawMine(){
  mineLayer.clearLayers();
  mine().forEach(p => { if (!p.shape) return;
    L.polygon(p.shape, { color: COLOR[analyse(p).lvl], weight: 2.5, fillColor: COLOR[analyse(p).lvl], fillOpacity: 0.35 })
      .bindTooltip(`${t('khasra')} ${esc(p.khasra || '—')}`).on('click', () => renderPlot(p, 'saved')).addTo(mineLayer); });
}
function renderMine(){
  const el = $('mineList'), m = mine();
  if (!m.length){ el.innerHTML = `<div class="empty">${t('none')}</div>`; return; }
  el.innerHTML = m.map(p => { const a = analyse(p); return `<div class="mycard"><div><b>${t('khasra')} ${esc(p.khasra || '—')}</b>
    <div class="hint">${p.village ? esc(p.village.en) + ' · ' : ''}${fmt(p.areaHa, 4)} ${t('hect')} · <span style="color:${COLOR[a.lvl]};font-weight:600">${t('v_' + a.lvl)}</span>${p.shape ? ' · ✏️' : ''}</div></div>
    <button class="btn sm" data-open="${esc(p.id)}">${t('open')}</button></div>`; }).join('');
  el.querySelectorAll('[data-open]').forEach(b => b.onclick = () => openPlot(b.dataset.open));
}
$('expBtn').onclick = () => {
  const blob = new Blob([JSON.stringify({ app: 'bhoomi-saral', version: 1, exported: new Date().toISOString(), plots: mine() }, null, 2)], { type: 'application/json' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `bhoomi-saral-${new Date().toISOString().slice(0, 10)}.json`; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000); toast(t('exported'));
};
$('impFile').onchange = async e => {
  const file = e.target.files[0]; e.target.value = ''; if (!file) return;
  try {
    const d = JSON.parse(await file.text());
    if (d.app !== 'bhoomi-saral' || !Array.isArray(d.plots)) throw 0;
    const list = mine(), ids = new Set(list.map(x => x.id));
    const add = d.plots.filter(x => x && typeof x.id === 'string' && !ids.has(x.id));
    saveMine(add.concat(list)); toast(tf('imported', { n: add.length }));
  } catch(err){ toast(t('badFile')); }
};

/* ---------------- where am I ---------------- */
async function villageAt(lat, lng){
  const df = S.districts.features.find(f => inGeom(lng, lat, f.geometry)); if (!df) return null;
  if (!S.dist || S.dist.lgd !== df.properties.lgd) await selectDistrict(df.properties.lgd, { zoom: false });
  const vf = S.data.villages.features.find(f => inGeom(lng, lat, f.geometry));
  return vf ? vctx(vf) : null;
}
$('locBtn').onclick = () => {
  if (!navigator.geolocation) return toast(t('gpsFail'));
  toast(t('locating'));
  navigator.geolocation.getCurrentPosition(async pos => {
    const { latitude: lat, longitude: lng } = pos.coords;
    hereLayer.clearLayers(); L.circleMarker([lat, lng], { radius: 8, color: '#fff', weight: 3, fillColor: '#2c6fd6', fillOpacity: 1 }).addTo(hereLayer);
    if (!S.districts.features.some(f => inGeom(lng, lat, f.geometry))) { toast(t('notInUP')); map.setView([lat, lng], 12); return; }
    const v = await villageAt(lat, lng);
    if (v) { selectVillage(v.lgd, { zoom: false }); map.setView([lat, lng], 15); } else map.setView([lat, lng], 14);
  }, () => toast(t('gpsFail')), { enableHighAccuracy: true, timeout: 20000 });
};
$('upBtn').onclick = goUP;

/* ---------------- statewide search ---------------- */
const q = $('q'), res = $('results'); let hits = [], act = -1;
async function ensureSearch(){
  if (!S.search) S.search = getJSON('data/search.json').then(rows => {
    const list = rows.map(r => ({ n: r[0], k: r[0].toLowerCase(), v: r[1], d: r[2], t: r[3] }));
    const seen = new Set(); S.tehsilIdx = [];
    list.forEach(r => { const key = r.d + '|' + r.t; if (r.t && !seen.has(key)) { seen.add(key); S.tehsilIdx.push({ teh: true, n: r.t, k: r.t.toLowerCase(), d: r.d }); } });
    return list;
  });
  return S.search;
}
q.addEventListener('focus', () => { ensureSearch().catch(() => toast(t('loadFail'))); });
q.addEventListener('input', async () => {
  const s = q.value.trim().toLowerCase();
  if (s.length < 2){ res.classList.remove('on'); return; }
  res.classList.add('on'); res.innerHTML = `<div class="msg">${t('searching')}</div>`;
  let rows; try { rows = await ensureSearch(); } catch(e){ res.innerHTML = `<div class="msg">${t('loadFail')}</div>`; return; }
  if (q.value.trim().toLowerCase() !== s) return;
  const starts = [], has = [];
  for (const r of rows){ if (r.k.startsWith(s)) { if (starts.length < 40) starts.push(r); } else if (has.length < 40 && r.k.includes(s)) has.push(r); }
  // also allow district names
  const dm = S.districts.features.filter(f => f.properties.en.toLowerCase().includes(s) || f.properties.hi.includes(q.value.trim()))
    .map(f => ({ dist: true, n: dName(f.properties), d: f.properties.lgd }));
  const tm = (S.tehsilIdx || []).filter(x => x.k.includes(s)).slice(0, 8);
  hits = dm.concat(tm, starts, has).slice(0, 40); act = -1;
  res.innerHTML = hits.length ? hits.map((h, i) => `<button data-i="${i}"><b>${esc(h.n)}</b><small>${h.dist ? t('district') : h.teh ? `${t('tehsil')} · ${esc(dName(S.byLgd[h.d]))}` : `${t('village')} · ${esc(h.t)} · ${esc(dName(S.byLgd[h.d]))}`}</small></button>`).join('') : `<div class="msg">${t('noMatch')}</div>`;
  res.querySelectorAll('button').forEach(b => b.onclick = () => pickHit(hits[+b.dataset.i]));
});
q.addEventListener('keydown', e => {
  const bs = res.querySelectorAll('button'); if (!bs.length) return;
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp'){ e.preventDefault(); act = (act + (e.key === 'ArrowDown' ? 1 : -1) + bs.length) % bs.length; bs.forEach((b, i) => b.classList.toggle('act', i === act)); bs[act].scrollIntoView({ block: 'nearest' }); }
  if (e.key === 'Enter'){ e.preventDefault(); pickHit(hits[act < 0 ? 0 : act]); }
  if (e.key === 'Escape') res.classList.remove('on');
});
document.addEventListener('click', e => { if (!e.target.closest('.search-wrap')) res.classList.remove('on'); });
async function pickHit(h){
  if (!h) return; res.classList.remove('on'); q.value = h.n; q.blur(); switchTab('find');
  if (h.dist) return selectDistrict(h.d);
  if (h.teh){ await selectDistrict(h.d, { zoom: false }); return selectTehsil(h.n); }
  await selectDistrict(h.d, { zoom: false }); selectVillage(h.v);
}

/* ---------------- glossary, tabs, language, theme ---------------- */
function renderGlossary(){
  const s = ($('gq').value || '').toLowerCase();
  $('glossary').innerHTML = WORDS.filter(w => w.join(' ').toLowerCase().includes(s)).map(w => `<div class="term"><div class="t"><b class="hi">${w[0]}</b><span>${w[1]}</span></div><p>${LANG === 'hi' ? w[3] : w[2]}</p></div>`).join('') || `<div class="empty">—</div>`;
}
$('gq').oninput = renderGlossary;
function switchTab(p){
  document.querySelectorAll('#tabs button').forEach(x => x.classList.toggle('on', x.dataset.p === p));
  document.querySelectorAll('.pane').forEach(x => x.classList.toggle('on', x.id === 'p-' + p));
}
document.querySelectorAll('#tabs button').forEach(b => b.onclick = () => switchTab(b.dataset.p));
function applyLang(){
  document.documentElement.lang = LANG;
  document.querySelectorAll('[data-i]').forEach(el => { el.textContent = t(el.dataset.i); });
  document.querySelectorAll('[data-ph]').forEach(el => { el.placeholder = t(el.dataset.ph); });
  document.querySelectorAll('#langSeg button').forEach(x => x.classList.toggle('on', x.dataset.l === LANG));
  renderGlossary(); renderGuide(); renderMine(); setExVillage(S.exVillage);
  if (S.districts) renderFind();
  const ls = S.lastSheet;
  if (ls && sheet.classList.contains('open')){ if (ls.type === 'village') renderVillage(ls.f); else renderPlot(ls.p, ls.mode); }
  if (S.draw) updateDraw();
}
document.querySelectorAll('#langSeg button').forEach(b => b.onclick = () => { LANG = b.dataset.l; store.set('bs_lang', LANG); applyLang(); });
$('themeBtn').onclick = () => {
  const r = document.documentElement;
  const dark = r.dataset.theme ? r.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
  r.dataset.theme = dark ? 'light' : 'dark'; store.set('bs_theme', r.dataset.theme);
};

/* ---------------- start ---------------- */
(async function init(){
  LANG = store.get('bs_lang', 'en') === 'hi' ? 'hi' : 'en';
  const th = store.get('bs_theme', null); if (th === 'dark' || th === 'light') document.documentElement.dataset.theme = th;
  applyLang(); drawMine();
  try { S.districts = await getJSON('data/districts.json'); }
  catch(e){ $('findBody').innerHTML = `<div class="empty">${t('loadFail')}</div>`; return; }
  S.districts.features.forEach(f => { S.byLgd[f.properties.lgd] = Object.assign({ f }, f.properties); });
  drawDistricts(); renderFind();
  map.invalidateSize(); map.fitBounds(districtLayer.getBounds(), { padding: [10, 10] });
  const h = new URLSearchParams(location.hash.slice(1));
  const d = +h.get('d'), v = +h.get('v');
  if (d && S.byLgd[d]){ await selectDistrict(d, { zoom: !v }); if (v) selectVillage(v); }
  if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});
})();
