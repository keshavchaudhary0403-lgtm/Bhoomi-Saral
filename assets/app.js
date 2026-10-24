/* Bhoomi Saral — map, data loading and UI.
   Village outlines come from open Census 2011 / LGD data (see ATTRIBUTION.md).
   Personal plot data is stored only in this browser (localStorage). */
'use strict';

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

/* ---------------- state & data ---------------- */
const S = { districts: null, byLgd: {}, dist: null, data: null, tehsil: null, village: null, cache: {}, editId: null,
            exVillage: null, pendingShape: null, draw: null, lastSheet: null, filter: '' };

async function getJSON(url){ const r = await fetch(url); if (!r.ok) throw new Error(url + ' ' + r.status); return r.json(); }
async function loadDistrictData(lgd){
  if (!S.cache[lgd]) S.cache[lgd] = getJSON(`data/d/${lgd}.json`).then(d => {
    // ~5% of source outlines have no LGD code (lgd 0); give each a unique negative id so it can still be selected
    d.villages.features.forEach((f, i) => { f.c = bboxCenter(f.geometry); if (!f.properties.lgd) f.properties.lgd = -(i + 1); });
    // some villages come in several pieces sharing one code: list them once, with the total area
    const first = {};
    d.villages.features.forEach(f => { const p = f.properties, h = first[p.lgd];
      if (h) { h.a = Math.round((h.a + p.a) * 10) / 10; p.part = true; } else first[p.lgd] = p; });
    d.villages.features.forEach(f => { f.properties.a = first[f.properties.lgd].a; });
    return d;
  });
  return S.cache[lgd];
}
const dName = d => d ? (LANG === 'hi' ? d.hi : d.en) : '';

/* ---------------- map ---------------- */
const map = L.map('map', { preferCanvas: true, zoomControl: false, minZoom: 6, zoomSnap: 0.25 }).setView([26.9, 80.9], 7);
// base maps: clean light / dark street map that follows the theme, plus satellite imagery for spotting fields
const OSM = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
const BASE = {
  // one OpenStreetMap layer for both themes; CSS tones it (softer in light mode, inverted in dark mode)
  street: L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, className: 'tiles-street', attribution: OSM }),
  sat: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { maxZoom: 19, maxNativeZoom: 18, attribution: 'Imagery &copy; Esri, Maxar, Earthstar Geographics' })
};
let baseOn = null, satOn = false;
// light by default; dark only when the viewer picks it
const isDark = () => document.documentElement.dataset.theme === 'dark';
function applyBase(){
  const want = satOn ? BASE.sat : BASE.street;
  if (want !== baseOn){ if (baseOn) map.removeLayer(baseOn); want.addTo(map); want.bringToBack(); baseOn = want; }
  document.body.classList.toggle('sat', satOn);
  $('layerBtn').classList.toggle('on', satOn);
  $('themeColor').setAttribute('content', isDark() ? '#050907' : '#e9ede7');
}
const canvas = L.canvas({ padding: 0.4 });
let districtLayer, tehsilLayer = L.layerGroup().addTo(map), villageLayer = L.layerGroup().addTo(map),
    labelLayer = L.layerGroup().addTo(map), mineLayer = L.layerGroup().addTo(map), drawLayer = L.layerGroup().addTo(map), hereLayer = L.layerGroup().addTo(map);
const ST = {
  dist: { color: '#0a8f4e', weight: 1.1, opacity: 0.7, fillColor: '#2fa84a', fillOpacity: 0.07 },
  distOn: { color: '#0a8f4e', weight: 3, opacity: 1, fillOpacity: 0 },
  teh: { color: '#6c47c4', weight: 1.6, dashArray: '6 6', fill: false, interactive: false },
  vil: { color: '#ff9f1c', weight: 0.9, opacity: 0.85, fillColor: '#ff9f1c', fillOpacity: 0.05 },
  vilHover: { weight: 2.2, fillOpacity: 0.22 },
  vilOn: { color: '#ff7a00', weight: 3.5, opacity: 1, fillColor: '#ff9f1c', fillOpacity: 0.3 }
};
$('zIn').onclick = () => map.zoomIn();
$('zOut').onclick = () => map.zoomOut();
$('layerBtn').onclick = () => { satOn = !satOn; applyBase(); toast(t(satOn ? 'layerSat' : 'layerMap')); };
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
      (villageById[f.properties.lgd] ||= []).push(l);
      l.on('mouseover', () => { if (!selectedVillageLayer || !selectedVillageLayer.includes(l)) l.setStyle(ST.vilHover); });
      l.on('mouseout', () => { if (!selectedVillageLayer || !selectedVillageLayer.includes(l)) l.setStyle(ST.vil); });
      l.on('click', () => { if (!S.draw) selectVillage(f.properties.lgd); }); // while drawing, the map click adds the corner
    } }).addTo(villageLayer);
  updateLabels();
}
function updateLabels(){
  labelLayer.clearLayers();
  if (!S.data || map.getZoom() < 13) return;
  const b = map.getBounds(); let n = 0;
  for (const f of S.data.villages.features){
    if (n > 220) break;
    if (f.properties.en && b.contains(f.c)){ n++;
      L.tooltip({ permanent: true, direction: 'center', className: 'vlabel', interactive: false }).setLatLng(f.c).setContent(esc(vName(f.properties))).addTo(labelLayer);
    }
  }
}
map.on('moveend', updateLabels);
map.on('click', e => { if (S.draw) addDrawPoint(e.latlng); });

/* ---------------- navigation ---------------- */
// keep the focused shape clear of the detail card on wide screens
const wide = () => innerWidth >= 900;
const sidePad = () => wide() ? { paddingTopLeft: [460, 40], paddingBottomRight: [490, 40] } : { paddingTopLeft: [20, 80], paddingBottomRight: [20, innerHeight * 0.64 + 10] };
const listPad = () => wide() ? { paddingTopLeft: [450, 30], paddingBottomRight: [30, 30] } : { paddingTopLeft: [20, 90], paddingBottomRight: [20, panelHeight() + 30] };
async function selectDistrict(lgd, opts = {}){
  const d = S.byLgd[lgd]; if (!d) return;
  S.dist = d; S.tehsil = null; S.village = null; S.filter = '';
  styleDistricts(); renderFind(true);
  if (opts.zoom !== false) map.flyToBounds(L.geoJSON(d.f).getBounds(), Object.assign({ duration: 0.8 }, listPad()));
  try { S.data = await loadDistrictData(lgd); } catch(e){ toast(t('loadFail')); return; }
  if (S.dist !== d) return;
  drawDistrictContents(); renderFind(); setHash();
}
function selectTehsil(name){
  S.tehsil = name; S.village = null; S.filter = ''; renderFind();
  const tf_ = S.data.tehsils.features.find(f => f.properties.en === name);
  if (tf_) map.flyToBounds(L.geoJSON(tf_).getBounds(), Object.assign({ duration: 0.7 }, listPad()));
}
function selectVillage(vlgd, opts = {}){
  if (!S.data) return;
  const f = S.data.villages.features.find(x => x.properties.lgd === vlgd); if (!f) return;
  S.village = f; S.tehsil = f.properties.t;
  if (selectedVillageLayer) selectedVillageLayer.forEach(l => l.setStyle(ST.vil));
  selectedVillageLayer = villageById[vlgd]; if (selectedVillageLayer) selectedVillageLayer.forEach(l => { l.setStyle(ST.vilOn); l.bringToFront(); });
  if (opts.zoom !== false) map.flyToBounds(L.featureGroup(selectedVillageLayer || [L.geoJSON(f)]).getBounds(), Object.assign({ duration: 0.7, maxZoom: 15 }, sidePad()));
  renderFind(); renderVillage(f); setHash();
  if (!wide()) setSnap('peek');
}
function goUP(){
  S.dist = null; S.data = null; S.tehsil = null; S.village = null; S.filter = '';
  drawDistrictContents(); styleDistricts(); closeSheet(); renderFind(); setHash();
  map.flyToBounds(districtLayer.getBounds(), Object.assign({ duration: 0.8 }, listPad()));
}
function setHash(){
  const h = S.village ? `#d=${S.dist.lgd}&v=${S.village.properties.lgd}` : S.dist ? `#d=${S.dist.lgd}` : '';
  history.replaceState(null, '', h || location.pathname);
}

/* ---------------- Find pane ---------------- */
function greeting(){ const h = new Date().getHours(); return t(h < 12 ? 'greetM' : h < 17 ? 'greetA' : 'greetE'); }
function countUp(root){
  root.querySelectorAll('[data-count]').forEach(el => {
    const to = +el.dataset.count, t0 = performance.now(), dur = 1100;
    const step = now => { const k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 4); el.textContent = fmt(Math.round(to * e), 0); if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  });
}
function heroHTML(){
  const n = mine().length;
  return `<div class="hero">
      <div class="greet">${ic('sprout')}${greeting()}</div>
      <h1>${t('heroT')}</h1><p>${t('heroB')}</p>
      <div class="kpis">
        <div class="kpi"><b data-count="75">0</b><span>${t('districts')}</span></div>
        <div class="kpi"><b data-count="310">0</b><span>${t('tehsils')}</span></div>
        <div class="kpi"><b data-count="101526">0</b><span>${t('villages')}</span></div>
      </div>
    </div>
    <div class="bento">
      <button class="tile big" data-q="locate" style="--i:0"><span class="ti">${ic('locate')}</span><span><b>${t('whereAmI')}</b><small>${t('qLocateB')}</small></span><span class="go">${ic('right')}</span></button>
      <button class="tile t-explain" data-q="explain" style="--i:1"><span class="ti">${ic('sparkles')}</span><span><b>${t('exTitle')}</b><small>${t('qExplainB')}</small></span></button>
      <button class="tile t-draw" data-q="draw" style="--i:2"><span class="ti">${ic('pen')}</span><span><b>${t('qDraw')}</b><small>${t('qDrawB')}</small></span></button>
      <button class="tile t-mine" data-q="mine" style="--i:3"><span class="ti">${ic('bookmark')}</span><span><b>${t('tabMine')}</b><small>${n ? tf('qMineB', { n }) : t('qMineNone')}</small></span></button>
      <button class="tile" data-q="guide" style="--i:4"><span class="ti">${ic('shield')}</span><span><b>${t('tabGuide')}</b><small>upbhulekh · bhunaksha</small></span></button>
    </div>`;
}
function renderFind(loading){
  const c = $('crumbs'), body = $('findBody'), sep = `<span>${ic('right')}</span>`;
  let cr = '';
  if (S.dist){
    const back = S.village || S.tehsil ? (S.village ? 't' : 'd') : 'up';
    cr = `<button class="back" data-go="${back}" aria-label="Back">${ic('left')}</button><button data-go="up">${t('allDistricts')}</button>${sep}<button class="${!S.tehsil ? 'cur' : ''}" data-go="d">${esc(dName(S.dist))}</button>`;
    if (S.tehsil) cr += `${sep}<button class="${!S.village ? 'cur' : ''}" data-go="t">${esc(S.tehsil)}</button>`;
    if (S.village) cr += `${sep}<button class="cur" data-go="v">${esc(vName(S.village.properties))}</button>`;
  }
  c.innerHTML = cr;
  c.querySelectorAll('button').forEach(b => b.onclick = () => {
    const g = b.dataset.go;
    if (g === 'up') goUP(); else if (g === 'd') { S.tehsil = null; S.village = null; S.filter = ''; closeSheet(); renderFind(); map.flyToBounds(L.geoJSON(S.dist.f).getBounds(), Object.assign({ duration: .7 }, listPad())); }
    else if (g === 't') { closeSheet(); selectTehsil(S.tehsil); } else if (g === 'v') renderVillage(S.village);
  });

  let items = [], title, count = '', top = '';
  if (!S.dist){
    title = t('pickDistrict'); top = heroHTML();
    items = S.districts.features.map(f => ({ k: f.properties.lgd, a: dName(f.properties), b: LANG === 'hi' ? f.properties.en : f.properties.hi, av: dName(f.properties).slice(0, 1), act: () => selectDistrict(f.properties.lgd) }));
    count = `75 ${t('districts')}`;
  } else if (loading || !S.data){
    body.innerHTML = `<div class="skel" style="width:55%;height:26px;border-radius:9px"></div>` + '<div class="skel"></div>'.repeat(6); return;
  } else if (!S.tehsil){
    title = t('pickTehsil');
    const counts = {}; S.data.villages.features.forEach(f => { if (!f.properties.part) counts[f.properties.t] = (counts[f.properties.t] || 0) + 1; });
    items = S.data.tehsils.features.map(f => ({ k: f.properties.en, a: f.properties.en, b: `${fmt(counts[f.properties.en] || 0, 0)} ${t('villages')}`, av: f.properties.en.slice(0, 1), act: () => selectTehsil(f.properties.en) }));
    count = `${S.data.tehsils.features.length} ${t('tehsils')} · ${fmt(S.data.villages.features.filter(f => !f.properties.part).length, 0)} ${t('villages')}`;
  } else {
    title = t('pickVillage');
    items = S.data.villages.features.filter(f => f.properties.t === S.tehsil && !f.properties.part)
      // named villages A–Z, unnamed outlines last (largest first)
      .sort((x, y) => (!x.properties.en - !y.properties.en) || x.properties.en.localeCompare(y.properties.en) || y.properties.a - x.properties.a)
      .map(f => { const tt = townType(f.properties); return { k: f.properties.lgd, a: vName(f.properties), town: !!tt,
        b: `${tt ? t('t_' + tt) + ' · ' : f.properties.gp ? t('gp') + ': ' + f.properties.gp + ' · ' : ''}${fmt(f.properties.a, 0)} ha`, av: f.properties.en ? f.properties.en.slice(0, 1) : '?', dim: !f.properties.en, act: () => selectVillage(f.properties.lgd), on: S.village && S.village.properties.lgd === f.properties.lgd }; });
    count = `${items.length} ${t('villages')}`;
  }
  body.innerHTML = `${top}<h3 class="list-h">${title}</h3>
    <div class="filterwrap">${ic('search')}<input type="text" class="filter" id="flt" placeholder="${t('filterPh')}" value="${esc(S.filter)}"></div>
    <div class="count" id="fcount">${count}</div><div class="list" id="flist"></div>`;
  if (top){ countUp(body); body.querySelectorAll('[data-q]').forEach(b => b.onclick = () => quick(b.dataset.q)); }
  const draw = () => {
    const q = S.filter.toLowerCase();
    const all = items.filter(i => !q || (i.a + ' ' + i.b).toLowerCase().includes(q)), shown = all.slice(0, 400);
    $('fcount').textContent = q ? `${fmt(all.length, 0)} / ${count}` : count;
    $('flist').innerHTML = shown.map((i, n) => `<button class="item${i.on ? ' on' : ''}${i.dim ? ' dim' : ''}" data-n="${n}" style="--i:${n}"><span class="av${i.dim ? ' muted' : ''}${i.town ? ' town' : ''}">${i.town ? ic('building') : esc(i.av)}</span><span class="tx"><b>${esc(i.a)}</b><small>${esc(i.b)}</small></span><span class="arr">${ic('right')}</span></button>`).join('') || `<div class="empty">${t('noMatch')}</div>`;
    $('flist').querySelectorAll('.item').forEach(b => b.onclick = () => shown[+b.dataset.n].act());
    $('flist').querySelector('.item.on')?.scrollIntoView({ block: 'center' });
  };
  $('flt').oninput = e => { S.filter = e.target.value; draw(); };
  draw();
}
function quick(q){
  if (q === 'locate') return $('locBtn').click();
  if (q === 'draw'){ switchTab('explain'); return startDraw(); }
  switchTab(q);
}

/* ---------------- sheet ---------------- */
const sheet = $('sheet');
$('sheetX').onclick = closeSheet;
function closeSheet(){ sheet.classList.remove('open'); document.body.classList.remove('sheet-open'); S.lastSheet = null; }
function openSheet(hd, bd, kind){
  $('sheetHd').innerHTML = hd; $('sheetBd').innerHTML = bd; $('sheetBd').scrollTop = 0;
  sheet.classList.add('open'); document.body.classList.add('sheet-open'); S.lastSheet = kind;
}
// official-site link rows used on village and plot cards
const linkRow = (url, label, icon) => `<a href="https://${url}" target="_blank" rel="noopener"><span class="li">${ic(icon)}</span><span class="lt">${label}<small>${url}</small></span>${ic('external')}</a>`;

function vctx(f, d = S.dist){ return { lgd: f.properties.lgd, en: f.properties.en, t: f.properties.t, d: d.en, dhi: d.hi, dl: d.lgd }; }
function renderVillage(f){
  const p = f.properties, ha = p.a || 0, tt = townType(p);
  if (tt) return renderTown(f, tt);
  const plots = mine().filter(x => x.village && x.village.lgd === p.lgd);
  const hd = `<div class="eyebrow">${t('village')} · ${esc(p.t)} · ${esc(dName(S.dist))}</div><div class="title">${esc(vName(p))}</div>
    <div class="hint">${t('lgdCode')} ${p.lgd > 0 ? esc(p.lgd) : '—'} · ${t('c11')} ${esc(p.c11 || '—')}</div>`;
  const step1 = p.en ? tf('stepBhulekh', { d: esc(S.dist.en), t: esc(p.t), v: esc(p.en) }) : t('unnamedNote');
  const gis = bnGisCode(S.dist.lgd, p.tl, p.lgd);
  // names and LGD codes to pick on Bhulekh / Bhu-Naksha, each one tap to copy
  const cp = (text, label = text) => text ? `<button class="cp" data-copy="${esc(text)}">${esc(label)}${ic('copy')}</button>` : '<span class="muted">—</span>';
  const offRow = (k, name, code, extra = '') => `<div class="offrow"><span class="ol">${k}</span><span class="ov">${cp(name)}${extra}${code > 0 ? cp(String(code), t('lgd') + ' ' + code) : ''}</span></div>`;
  const bd = `
    <div class="stats">
      <div class="stat"><div class="v">${fmt(ha, 0)}</div><div class="k">${t('hect')}</div></div>
      <div class="stat"><div class="v">${fmt(ha * 2.47105, 0)}</div><div class="k">${t('acre')}</div></div>
      <div class="stat"><div class="v">${fmt(ha / 100, 2)}</div><div class="k">km²</div></div>
    </div>
    <div class="rough">${ic('info')}<span>${t('roughV')}${gis ? ` <button class="lnk" type="button" id="roughGo">${t('roughGo')}</button>` : ''}</span></div>
    <div class="offbox">
      <div class="offh"><b>${t('offT')}</b><span>${t('offB')}</span></div>
      ${offRow(t('district'), S.dist.en, 0, `<span class="hi muted">${esc(S.dist.hi)}</span>`)}
      ${offRow(t('tehsil'), p.t, p.tl)}
      ${offRow(t('village'), p.en, p.lgd)}
    </div>
    ${gis ? `<form class="bnbox" id="bnForm">
      <div class="offh"><b>${ic('map')}${t('bnT')}</b></div>
      <a class="btn bnvil" id="bnVillage" href="https://upbhunaksha.gov.in/" target="_blank" rel="noopener">${ic('map')}${tf('bnVil', { v: esc(vName(p)) })}${ic('external')}</a>
      <p class="hint">${t('bnVilHow')}</p>
      <ol class="bnsteps">
        <li><span>${t('district')}</span><b>${gis.slice(0, -11)}</b>${esc(S.dist.en)}</li>
        <li><span>${t('tehsil')}</span><b>${gis.slice(-11, -6)}</b>${esc(p.t)}</li>
        <li><span>${t('village')}</span><b>${gis.slice(-6)}</b>${esc(vName(p))}</li>
      </ol>
      <p class="hint">${tf('bnVilType', { c: gis.slice(-6) })}</p>
      <p class="hint bnplot">${t('bnB')}</p>
      <div class="bnrow"><input type="text" id="bnPlot" inputmode="numeric" autocomplete="off" enterkeyhint="go" placeholder="${t('bnPh')}" aria-label="${t('plot')}"><button class="btn" type="submit">${t('bnGo')}${ic('external')}</button></div>
      <p class="hint">${t('bnNext')}</p>
    </form>` : ''}
    <div class="kvs">
      <div class="kv"><span>${t('gp')}</span><span>${esc(p.gp || '—')}</span></div>
      <div class="kv"><span>${t('block')}</span><span>${esc(p.b || '—')}</span></div>
    </div>
    <div class="sec"><h3>${ic('search')}${t('seeRecords')}</h3>
      <ol class="steps-mini">
        <li>${step1}</li>
        <li>${t('stepOneOf')}</li>
        <li>${t('stepNaksha')}</li>
        <li>${t('stepExplain')}</li>
      </ol>
      <p class="hint" style="margin:8px 0 0">${t('tehsilNote')}</p>
    </div>
    <div class="sec links">
      ${linkRow('upbhulekh.gov.in', LANG === 'hi' ? 'UP भूलेख — खतौनी देखें' : 'UP Bhulekh — view khatauni', 'file')}
      ${linkRow('upbhunaksha.gov.in', LANG === 'hi' ? 'UP भू-नक्शा' : 'UP Bhu-Naksha (plot map)', 'map')}
      ${linkRow('vaad.up.nic.in', LANG === 'hi' ? 'राजस्व वाद / नामांतरण' : 'Revenue courts & mutation', 'scale')}
    </div>
    <button class="btn primary big" id="addHere" style="width:100%;margin-top:16px">${ic('plus')}${t('addPlot')}</button>
    ${plots.length ? `<div class="sec"><h3>${ic('bookmark')}${t('myHere')}</h3>${plots.map(x => `<div class="mycard"><span class="dot" style="color:${COLOR[lvlOf(x)]};background:${COLOR[lvlOf(x)]}"></span><div class="tx"><b>${esc(plotTitle(x))}</b><div class="hint">${fmt(x.areaHa, 4)} ${t('hect')}</div></div><button class="btn sm" data-open="${esc(x.id)}">${t('open')}</button></div>`).join('')}</div>` : ''}
    <div class="src">${t('approx')}</div>`;
  openSheet(hd, bd, { type: 'village', f });
  $('sheetBd').querySelectorAll('[data-copy]').forEach(b => b.onclick = () => { navigator.clipboard?.writeText(b.dataset.copy).then(() => toast(t('copied'))).catch(() => {}); });
  $('sheetBd').querySelectorAll('[data-open]').forEach(b => b.onclick = () => openPlot(b.dataset.open));
  $('addHere').onclick = () => { setExVillage(vctx(f)); switchTab('explain'); };
  // Bhu-Naksha has no link to a village map, so the card lists the codes to pick there
  if (gis) $('roughGo').onclick = () => $('bnForm').scrollIntoView({ behavior: 'smooth', block: 'start' });
  // a plain link to the government page: the lookup happens on Bhu-Naksha, not here
  if (gis) $('bnForm').onsubmit = e => {
    e.preventDefault();
    const url = bnPlotUrl(gis, $('bnPlot').value);
    if (!url){ toast(t('bnNeed')); $('bnPlot').focus(); return; }
    window.open(url, '_blank', 'noopener');
  };
}
function renderTown(f, tt){
  const p = f.properties, ha = p.a || 0, body = t('t_' + tt);
  const plots = mine().filter(x => x.village && x.village.lgd === p.lgd);
  const hd = `<div class="eyebrow">${t('town')} · ${esc(p.t)} · ${esc(dName(S.dist))}</div><div class="title">${esc(vName(p))}</div>
    <div class="hint"><span class="tag">${ic('building')}${body}</span> · ${t('c11')} ${esc(p.c11 || '—')}</div>`;
  const bd = `
    <div class="stats">
      <div class="stat"><div class="v">${fmt(ha, 0)}</div><div class="k">${t('hect')}</div></div>
      <div class="stat"><div class="v">${fmt(ha * 2.47105, 0)}</div><div class="k">${t('acre')}</div></div>
      <div class="stat"><div class="v">${fmt(ha / 100, 2)}</div><div class="k">km²</div></div>
    </div>
    <div class="kvs">
      <div class="kv"><span>${t('townBody')}</span><span>${body}</span></div>
      <div class="kv"><span>${t('block')}</span><span>${esc(p.b || '—')}</span></div>
      <div class="kv"><span>${t('tehsil')}</span><span>${esc(p.t)}</span></div>
      <div class="kv"><span>${t('district')}</span><span>${esc(S.dist.en)} · <span class="hi">${esc(S.dist.hi)}</span></span></div>
    </div>
    <div class="sec"><h3>${ic('info')}${t('townRecords')}</h3>
      <ol class="steps-mini">
        <li>${t('townStep1')}</li>
        <li>${tf('townStep2', { t: esc(p.t) })}</li>
        <li>${tt === 'cb' ? t('townStep3cb') : tf('townStep3', { b: body })}</li>
      </ol>
    </div>
    <div class="sec links">
      ${tt === 'cb' ? '' : linkRow('e-nagarsewaup.gov.in', LANG === 'hi' ? 'ई-नगर सेवा — संपत्ति / गृहकर' : 'e-Nagar Sewa — property & house tax', 'building')}
      ${linkRow('igrsup.gov.in', LANG === 'hi' ? 'रजिस्ट्री / भार-मुक्त प्रमाण पत्र' : 'Registry & encumbrance search', 'bank')}
      ${linkRow('upbhulekh.gov.in', LANG === 'hi' ? 'UP भूलेख — मौज़ा की खतौनी' : 'UP Bhulekh — khatauni of a mauza', 'file')}
    </div>
    <button class="btn primary big" id="addHere" style="width:100%;margin-top:16px">${ic('plus')}${t('addPlotTown')}</button>
    ${plots.length ? `<div class="sec"><h3>${ic('bookmark')}${t('myHere')}</h3>${plots.map(x => `<div class="mycard"><span class="dot" style="color:${COLOR[lvlOf(x)]};background:${COLOR[lvlOf(x)]}"></span><div class="tx"><b>${esc(plotTitle(x))}</b><div class="hint">${fmt(x.areaHa, 4)} ${t('hect')}</div></div><button class="btn sm" data-open="${esc(x.id)}">${t('open')}</button></div>`).join('')}</div>` : ''}
    <div class="src">${t('approx')}</div>`;
  openSheet(hd, bd, { type: 'village', f });
  $('sheetBd').querySelectorAll('[data-open]').forEach(b => b.onclick = () => openPlot(b.dataset.open));
  $('addHere').onclick = () => { setExVillage(vctx(f)); switchTab('explain'); };
}

/* ---------------- plain-language plot card ---------------- */
const COLOR = { ok: '#12a35a', warn: '#f2a20c', bad: '#e2412e', pub: '#7c5ce6', shape: '#64748b' };
// an imported boundary has no khatauni details yet, so it gets no risk verdict
const lvlOf = p => p.shapeOnly ? 'shape' : analyse(p).lvl;
const lvlLabel = l => l === 'shape' ? t('shapeOnly') : t('v_' + l);
const plotTitle = p => p.khasra ? `${t('khasra')} ${p.khasra}` : p.note || (p.shapeOnly ? t('impName') : `${t('khasra')} —`);

function renderPlot(p, mode){ // mode: 'saved' | 'draft' | 'sample'
  const a = analyse(p), C = CLASSES[p.cls] || CLASSES.bt, L_ = LANG;
  const vk = { ok: ['v-ok', 'ok', t('v_ok'), t('v_okB')], warn: ['v-warn', 'warn', t('v_warn'), t('v_warnB')], bad: ['v-bad', 'bad', t('v_bad'), t('v_badB')], pub: ['v-pub', 'landmark', t('v_pub'), t('v_pubB')] }[a.lvl];
  const share = p.n > 1 ? '1/' + p.n : '1/1', ha = Number(p.areaHa) || 0;
  const v = p.village;
  const hd = `<div class="eyebrow">${v ? esc(vName(v)) + ' · ' + esc(v.t) + ' · ' + esc(L_ === 'hi' ? v.dhi : v.d) : t('yourPlot')}</div>
    <div class="title">${esc(plotTitle(p))}</div><div class="hint">${p.shapeOnly ? esc(p.src || t('impName')) : `${t('khataNo')} ${esc(p.khata || '—')}`}</div>`;
  const shapeHa = p.shape ? ringArea(p.shape) / 10000 : null;
  if (p.shapeOnly) return renderShapeOnly(p, hd, shapeHa);
  const bd = `<div class="verdict ${vk[0]}">
      <div class="vt"><span class="vi">${ic(vk[1])}</span><b>${vk[2]}</b></div>
      <p>${vk[3]}</p>
      <div class="meter" aria-label="${t('riskScale')}"><i></i><i></i><i></i></div>
      ${a.lvl !== 'pub' ? `<div class="meter-l"><span>${t('lgOk')}</span><span>${t('lgWarn')}</span><span>${t('lgBad')}</span></div>` : ''}
    </div>
    <div class="stats">
      <div class="stat"><div class="v">${fmt(ha, 4)}</div><div class="k">${t('hect')}</div></div>
      <div class="stat"><div class="v">${fmt(ha * 2.47105)}</div><div class="k">${t('acre')}</div></div>
      <div class="stat"><div class="v">${fmt(ha * 10000, 0)}</div><div class="k">${t('sqm')}</div></div>
    </div>
    <div class="sec"><h3>${ic('file')}${t('recIn')}</h3>
      <div class="kvs"><div class="kv"><span>${t('klass')}</span><span class="hi">${C.hi}<br><small style="color:var(--muted)">${C.en}</small></span></div>
      <div class="kv"><span>${t('canSell')}</span><span>${C.sell[L_]}</span></div>
      <div class="kv"><span>${t('holders')}</span><span>${p.n || 1} · ${share}</span></div>
      <div class="kv"><span>${t('bigha')}</span><span>${fmt(ha / 0.2529)}</span></div>
      ${shapeHa ? `<div class="kv"><span>${t('mapShape')}</span><span>${fmt(shapeHa, 4)} ${t('hect')}</span></div>` : ''}
      ${p.note ? `<div class="kv"><span>${t('note')}</span><span>${esc(p.note)}</span></div>` : ''}</div>
      <p class="hint" style="margin:6px 0 0">${L_ === 'hi' ? '* बीघा का माप ज़िले के अनुसार बदलता है। यहाँ पक्का बीघा ≈ 0.2529 हेक्टेयर माना गया है — लेखपाल से पुष्टि करें।' : '* Bigha size varies by district. Shown using pakka bigha ≈ 0.2529 ha — confirm locally with the lekhpal.'}</p>
    </div>
    <div class="sec"><h3>${ic('bulb')}${t('whatMeans')}</h3>
      <div class="flag f-ok"><span class="fi">${ic('pin')}</span><div class="fb"><div class="h">${L_ === 'hi' ? C.hi : C.en}</div>${C.mean[L_]}</div></div>
      ${a.fl.map(f => { const F = FLAGS[f]; return `<div class="flag f-${F.lvl}"><span class="fi">${ic(FLAG_IC[f] || 'info')}</span><div class="fb"><div class="h">${F.h[L_]}</div>${F.b[L_].replace('{n}', p.n).replace('{f}', share)}<div class="todo"><b>${t('todo')}</b> ${F.d[L_]}</div></div></div>`; }).join('')}
    </div>
    <div class="sec"><div class="notprove"><div class="nh">${ic('info')}${t('notProveT')}</div><div>${L_ === 'hi'
      ? 'खतौनी बताती है कि सरकार किसे खातेदार के रूप में दर्ज मानती है। यह स्वामित्व का पक्का प्रमाण <b>नहीं</b> है, ज़मीन की सटीक सीमा नहीं बताती, और हाल के या बिना रजिस्ट्री के सौदे इसमें नहीं दिख सकते। ख़रीदने से पहले बैनामों की श्रृंखला (igrsup.gov.in), वाद की स्थिति और लेखपाल से पैमाइश ज़रूर कराएँ।'
      : 'The khatauni shows who the government records as holder. It is <b>not</b> conclusive proof of ownership, does not fix exact boundaries on the ground, and may miss very recent or unregistered deals. Before buying, check the chain of registered sale deeds (igrsup.gov.in), court cases, and get a measurement (पैमाइश) done with the lekhpal.'}</div></div></div>
    <div class="sec"><h3>${ic('link')}${t('nextT')}</h3><div class="links">
      ${linkRow('upbhulekh.gov.in', L_ === 'hi' ? 'असली खतौनी देखें' : 'View the real khatauni', 'file')}
      ${linkRow('upbhunaksha.gov.in', L_ === 'hi' ? 'आधिकारिक भू-नक्शा' : 'Official plot map (Bhu-Naksha)', 'map')}
      ${linkRow('vaad.up.nic.in', L_ === 'hi' ? 'राजस्व वाद / नामांतरण की स्थिति' : 'Revenue court & mutation status', 'scale')}
      ${linkRow('igrsup.gov.in', L_ === 'hi' ? 'रजिस्ट्री / भार-मुक्त प्रमाण पत्र' : 'Registry & encumbrance search', 'bank')}
    </div></div>
    ${mode === 'saved' ? `<div class="row" style="margin-top:14px">${p.shape ? `<button class="btn primary" id="pShow">${ic('map')}${t('showOnMap')}</button>` : ''}<button class="btn soft" id="pEdit">${ic('pen')}${t('editDetails')}</button><button class="btn warn" id="pDel">${ic('trash')}${t('del')}</button></div>` : ''}
    <div class="src">${mode === 'sample' ? t('sampleSrc') : t('userSrc')}</div>`;
  openSheet(hd, bd, { type: 'plot', p, mode });
  if (mode === 'saved'){
    savedPlotButtons(p);
  }
}
function savedPlotButtons(p){
  if ($('pShow')) $('pShow').onclick = () => map.flyToBounds(L.polygon(p.shape).getBounds(), Object.assign({ maxZoom: 18 }, sidePad()));
  $('pEdit').onclick = () => editPlot(p);
  $('pDel').onclick = () => { saveMine(mine().filter(x => x.id !== p.id)); if (S.editId === p.id) clearEdit(); closeSheet(); toast(t('deleted')); };
}
function renderShapeOnly(p, hd, shapeHa){
  const ha = shapeHa || Number(p.areaHa) || 0;
  const bd = `<div class="verdict v-shape"><div class="vt"><span class="vi">${ic('ruler')}</span><b>${t('shapeOnly')}</b></div><p>${t('shapeOnlyB')}</p></div>
    <div class="stats">
      <div class="stat"><div class="v">${fmt(ha, 4)}</div><div class="k">${t('hect')}</div></div>
      <div class="stat"><div class="v">${fmt(ha * 2.47105)}</div><div class="k">${t('acre')}</div></div>
      <div class="stat"><div class="v">${fmt(ha / 0.2529)}</div><div class="k">${t('bigha')}</div></div>
    </div>
    <button class="btn primary big" id="pEdit" style="width:100%">${ic('sparkles')}${t('addDetails')}</button>
    <div class="row" style="margin-top:8px"><button class="btn soft" id="pShow">${ic('map')}${t('showOnMap')}</button><button class="btn warn" id="pDel">${ic('trash')}${t('del')}</button></div>
    <div class="sec"><h3>${ic('search')}${t('oneOfT')}</h3><p class="hint" style="font-size:13px;color:var(--ink2);margin:0">${t('oneOfB')}</p></div>
    <div class="src">${t('impSrc')}</div>`;
  openSheet(hd, bd, { type: 'plot', p, mode: 'saved' });
  savedPlotButtons(p);
}
// fill the Explain form from a saved plot; saving then updates that plot instead of adding a new one
function editPlot(p){
  S.editId = p.id;
  $('exKhasra').value = p.khasra || ''; $('exKhata').value = p.khata || '';
  $('exArea').value = p.shapeOnly ? '' : (p.areaHa || ''); $('exOwners').value = p.n || 1; $('exNote').value = p.note || '';
  const r = document.querySelector(`input[name=exClass][value="${p.cls || 'bt'}"]`); if (r) r.checked = true;
  [['exLoan', 'loan'], ['exCourt', 'court'], ['exMut', 'mut'], ['exVar', 'varasat'], ['exNA', 'na']].forEach(([id, f]) => { $(id).checked = (p.flags || []).includes(f); });
  setExVillage(p.village || null); S.pendingShape = p.shape || null; setShapeChip();
  const el = $('exEditing'); el.hidden = false;
  el.innerHTML = `${ic('pen')}<span>${tf('editing', { p: esc(plotTitle(p)) })}</span><button type="button" aria-label="${t('dCancel')}">${ic('x')}</button>`;
  el.querySelector('button').onclick = () => { clearEdit(); clearForm(); };
  if (!wide()) closeSheet();
  switchTab('explain'); $('panes').scrollTop = 0;
}
function clearEdit(){ S.editId = null; $('exEditing').hidden = true; }
function clearForm(){
  ['exKhasra', 'exKhata', 'exArea', 'exNote'].forEach(id => { $(id).value = ''; }); $('exOwners').value = 1;
  ['exLoan', 'exCourt', 'exMut', 'exVar', 'exNA'].forEach(id => { $(id).checked = false; });
  S.pendingShape = null; setShapeChip();
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
  if (v){ el.style.display = 'flex'; el.innerHTML = ic('pin') + '<span>' + tf('inVillage', { v: esc(vName(v)), t: esc(v.t), d: esc(LANG === 'hi' ? v.dhi : v.d) }) + '</span>'; }
  else el.style.display = 'none';
}
function readForm(){
  const flags = [];
  [['exLoan', 'loan'], ['exCourt', 'court'], ['exMut', 'mut'], ['exVar', 'varasat'], ['exNA', 'na']].forEach(([id, f]) => { if ($(id).checked) flags.push(f); });
  let areaHa = parseFloat($('exArea').value);
  if (!(areaHa > 0) && S.pendingShape) areaHa = +(ringArea(S.pendingShape) / 10000).toFixed(4);
  return { id: S.editId || 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    khasra: $('exKhasra').value.trim(), khata: $('exKhata').value.trim(), areaHa: areaHa || 0,
    n: Math.max(1, parseInt($('exOwners').value) || 1), cls: (document.querySelector('input[name=exClass]:checked') || {}).value || 'bt', flags, note: $('exNote').value.trim(),
    village: S.exVillage, shape: S.pendingShape, saved: Date.now() };
}
$('exGo').onclick = () => renderPlot(readForm(), 'draft');
$('exSave').onclick = () => {
  const p = readForm(), editing = S.editId && mine().some(x => x.id === S.editId);
  if (editing){ const old = mine().find(x => x.id === p.id); if (old && old.src) p.src = old.src; saveMine(mine().map(x => x.id === p.id ? p : x)); }
  else saveMine([p].concat(mine()));
  clearEdit(); toast(t(editing ? 'updatedT' : 'savedT')); renderPlot(p, 'saved'); clearForm();
};
$('exDraw').onclick = () => startDraw();
$('exSample').onclick = () => renderPlot({ khasra: '131', khata: '00070', areaHa: 0.1706, n: 2, cls: 'bt', flags: ['loan'], village: null }, 'sample');

/* ---------------- draw my plot ---------------- */
function setShapeChip(){
  const el = $('exShape'); el.hidden = !S.pendingShape;
  if (S.pendingShape) el.innerHTML = ic('pen') + tf('shapeSet', { a: fmt(ringArea(S.pendingShape) / 10000, 4) });
}
document.querySelectorAll('[data-step]').forEach(b => b.onclick = () => {
  const inp = $('exOwners'); inp.value = Math.max(1, (parseInt(inp.value) || 1) + +b.dataset.step);
});

/* ---------------- draw my plot ---------------- */
function startDraw(){
  S.draw = { pts: [] }; drawLayer.clearLayers(); closeSheet();
  $('drawbar').classList.add('on'); updateDraw();
  if (!wide()) setSnap('peek');
  if (map.getZoom() < 15 && S.village) map.flyToBounds(L.geoJSON(S.village).getBounds(), { maxZoom: 16 });
}
function addDrawPoint(ll){
  const last = S.draw.pts[S.draw.pts.length - 1];
  if (last && last[0] === ll.lat && last[1] === ll.lng) return;
  S.draw.pts.push([ll.lat, ll.lng]); updateDraw(); navigator.vibrate?.(12);
}
function updateDraw(){
  drawLayer.clearLayers(); const pts = S.draw.pts;
  if (pts.length >= 2) L.polygon(pts, { color: '#ff7a00', weight: 3, fillColor: '#ff9f1c', fillOpacity: 0.28, dashArray: pts.length < 3 ? '6 6' : null }).addTo(drawLayer);
  pts.forEach(p => L.marker(p, { icon: L.divIcon({ className: '', html: '<div class="vtx"></div>', iconSize: [14, 14] }), interactive: false }).addTo(drawLayer));
  const ha = pts.length >= 3 ? ringArea(pts) / 10000 : 0;
  $('drawInfo').innerHTML = `${t('drawHelp')}<div class="meter"><div><b>${pts.length}</b><span>${t('points')}</span></div><div><b>${fmt(ha, 4)}</b><span>${t('hect')}</span></div><div><b>${fmt(ha * 2.47105)}</b><span>${t('acre')}</span></div></div>`;
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
  setShapeChip();
  L.polygon(S.pendingShape, { color: '#ff7a00', weight: 2.5, dashArray: '6 4', fillColor: '#ff9f1c', fillOpacity: 0.2 }).addTo(drawLayer);
  switchTab('explain');
};

/* ---------------- my land ---------------- */
function drawMine(){
  mineLayer.clearLayers();
  mine().forEach(p => { if (!p.shape) return;
    L.polygon(p.shape, { color: COLOR[lvlOf(p)], weight: 2.5, fillColor: COLOR[lvlOf(p)], fillOpacity: 0.35 })
      .bindTooltip(esc(plotTitle(p))).on('click', () => renderPlot(p, 'saved')).addTo(mineLayer); });
}
function renderMine(){
  const el = $('mineList'), all = mine(), badge = $('mineBadge');
  badge.textContent = all.length; badge.classList.toggle('on', all.length > 0);
  $('mqWrap').hidden = all.length < 2;
  if (!all.length){ el.innerHTML = `<div class="empty">${t('none')}</div>`; return; }
  const q = all.length < 2 ? '' : ($('mq').value || '').trim().toLowerCase(), m = q ? all.filter(p => plotMatches(p, q)) : all;
  if (!m.length){ el.innerHTML = `<div class="empty">${t('mineNoMatch')}</div>`; return; }
  el.innerHTML = m.map((p, i) => { const l = lvlOf(p); return `<div class="mycard" style="--i:${i}"><span class="dot" style="color:${COLOR[l]};background:${COLOR[l]}"></span><div class="tx"><b>${esc(plotTitle(p))}</b>
    <div class="hint">${p.khata ? t('khataNo') + ' ' + esc(p.khata) + ' · ' : ''}${p.village ? esc(vName(p.village)) + ' · ' : ''}${fmt(p.areaHa, 4)} ${t('hect')} · <span style="color:${COLOR[l]};font-weight:600">${lvlLabel(l)}</span></div></div>
    <button class="btn sm" data-open="${esc(p.id)}">${t('open')}</button></div>`; }).join('');
  el.querySelectorAll('[data-open]').forEach(b => b.onclick = () => openPlot(b.dataset.open));
}
// saved plots match a search by khasra / khata number (from the start), or by village name or note
function plotMatches(p, q){
  return [p.khasra, p.khata].some(v => v && String(v).toLowerCase().replace(/^0+(?=\d)/, '').startsWith(q.replace(/^0+(?=\d)/, '')))
    || [p.note, p.village && vName(p.village)].some(v => v && v.toLowerCase().includes(q));
}
$('mq').oninput = renderMine;
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

/* ---------------- import plot shapes (KML / KMZ / GeoJSON) ---------------- */
async function villageAtQuiet(lat, lng){ // like villageAt, without changing what the Find tab shows
  const df = S.districts.features.find(f => inGeom(lng, lat, f.geometry)); if (!df) return null;
  const d = S.byLgd[df.properties.lgd], data = await loadDistrictData(d.lgd);
  const vf = data.villages.features.find(f => inGeom(lng, lat, f.geometry));
  return vf ? vctx(vf, d) : null;
}
$('shapeFile').onchange = async e => {
  const file = e.target.files[0]; e.target.value = ''; if (!file) return;
  if (file.size > 5e6) return toast(t('impBig'));
  let res;
  try {
    const buf = await file.arrayBuffer(), u8 = new Uint8Array(buf);
    const text = u8[0] === 0x50 && u8[1] === 0x4b ? await kmzToKml(buf) : new TextDecoder().decode(buf); // "PK": a zip, i.e. KMZ
    res = parseShapes(text);
  } catch(err){ return toast(t('impBad')); }
  if (!res.shapes.length) return toast(t(res.projected ? 'impProj' : 'impNone'));
  showImport(res.shapes, file.name);
};
function showImport(shapes, fname){
  const items = shapes.map((x, i) => ({ name: x.name, ring: x.ring, i, ha: ringArea(x.ring) / 10000, on: true, village: undefined }));
  drawLayer.clearLayers();
  const group = L.featureGroup(items.map(x => L.polygon(x.ring, { color: '#ff7a00', weight: 2.5, dashArray: '6 4', fillColor: '#ff9f1c', fillOpacity: 0.2 })
    .bindTooltip(esc(x.name || t('impName'))))).addTo(drawLayer);
  map.flyToBounds(group.getBounds(), Object.assign({ maxZoom: 18 }, sidePad()));
  const label = () => tf('impSave', { n: items.filter(x => x.on).length });
  const render = () => {
    const hd = `<div class="eyebrow">${esc(fname)}</div><div class="title">${t('impTitle')}</div><div class="hint">${tf('impFound', { n: items.length })}</div>`;
    const bd = `<div class="implist">${items.map(x => `<label class="impitem"><input type="checkbox" data-k="${x.i}"${x.on ? ' checked' : ''}><span class="tx"><b>${esc(x.name || t('impName'))}</b>
        <small>${fmt(x.ha, 4)} ${t('hect')} · ${fmt(x.ha * 2.47105)} ${t('acre')}${x.village === undefined ? '' : ' · ' + (x.village ? esc(vName(x.village)) + ', ' + esc(x.village.t) : t('impOutside'))}</small></span></label>`).join('')}</div>
      <button class="btn primary big" id="impGo" style="width:100%">${ic('bookmarkPlus')}<span>${label()}</span></button>
      <div class="src">${t('privB')}</div>`;
    openSheet(hd, bd, { type: 'import', redraw: render });
    $('sheetBd').querySelectorAll('[data-k]').forEach(c => c.onchange = () => { items[+c.dataset.k].on = c.checked; $('impGo').querySelector('span').textContent = label(); $('impGo').disabled = !items.some(x => x.on); });
    $('impGo').onclick = () => {
      const now = Date.now(), add = items.filter(x => x.on).map((x, k) => ({
        id: 'p' + now.toString(36) + k + Math.random().toString(36).slice(2, 6), khasra: '', khata: '', areaHa: +x.ha.toFixed(4), n: 1, cls: 'bt', flags: [],
        note: x.name, village: x.village || null, shape: x.ring.map(([a, b]) => [+a.toFixed(6), +b.toFixed(6)]), saved: now, shapeOnly: true, src: fname }));
      if (!add.length) return;
      saveMine(add.concat(mine())); drawLayer.clearLayers(); closeSheet(); switchTab('mine'); toast(tf('impSaved', { n: add.length }));
    };
  };
  render();
  // find the village of each shape (from the middle of its corners), then show it in the list
  Promise.all(items.map(async x => {
    const c = x.ring.reduce((a, [la, ln]) => [a[0] + la / x.ring.length, a[1] + ln / x.ring.length], [0, 0]);
    x.village = await villageAtQuiet(c[0], c[1]).catch(() => null);
  })).then(() => { if (S.lastSheet && S.lastSheet.redraw === render) render(); });
}

/* ---------------- where am I ---------------- */
async function villageAt(lat, lng){
  const df = S.districts.features.find(f => inGeom(lng, lat, f.geometry)); if (!df) return null;
  if (!S.dist || S.dist.lgd !== df.properties.lgd) await selectDistrict(df.properties.lgd, { zoom: false });
  const vf = S.data.villages.features.find(f => inGeom(lng, lat, f.geometry));
  return vf ? vctx(vf) : null;
}
$('locBtn').onclick = () => {
  if (!navigator.geolocation) return toast(t('gpsFail'));
  const btn = $('locBtn'); btn.classList.add('busy'); toast(t('locating'));
  navigator.geolocation.getCurrentPosition(async pos => {
    btn.classList.remove('busy');
    const { latitude: lat, longitude: lng } = pos.coords;
    hereLayer.clearLayers(); L.marker([lat, lng], { icon: L.divIcon({ className: 'here', html: '<i></i>', iconSize: [18, 18] }), interactive: false, zIndexOffset: 1000 }).addTo(hereLayer);
    if (!S.districts.features.some(f => inGeom(lng, lat, f.geometry))) { closeSheet(); toast(t('notInUP')); map.setView([lat, lng], 12); return; }
    const v = await villageAt(lat, lng);
    if (v) { selectVillage(v.lgd, { zoom: false }); map.setView([lat, lng], 15); } else { closeSheet(); map.setView([lat, lng], 14); }
  }, () => { btn.classList.remove('busy'); toast(t('gpsFail')); }, { enableHighAccuracy: true, timeout: 20000 });
};
$('upBtn').onclick = goUP;

/* ---------------- statewide search ---------------- */
const q = $('q'), res = $('results'); let hits = [], act = -1, searchSeq = 0;
// search index (data/s/): a small tehsil table, one small shard per first two letters of each word in a
// village name, and the full list, loaded in the background, for matches inside words
const SX = { tehP: null, teh: null, shards: {}, sound: {}, allP: null, all: null };
const mkRow = r => { const tt = SX.teh[r[2]]; return { n: r[0], k: r[0].toLowerCase(), v: r[1], d: tt[0], t: tt[1] }; };
function loadTehsils(){
  return SX.tehP ||= getJSON('data/s/_t.json').then(list => { SX.teh = list; S.tehsilIdx = list.map(([d, n]) => ({ teh: true, n, k: n.toLowerCase(), d })); })
    .catch(e => { SX.tehP = null; throw e; });
}
function loadShard(key){
  return SX.shards[key] ||= loadTehsils().then(() => getJSON(`data/s/${key}.json`)).then(rows => rows.map(mkRow))
    .catch(e => { if (/ 404$/.test(e.message)) return []; delete SX.shards[key]; throw e; }); // 404: no village word starts with these letters
}
function loadSound(key){ // villages whose words start with this sound key (data/k/), for Hindi and loose spelling
  return SX.sound[key] ||= loadTehsils().then(() => getJSON(`data/k/${key}.json`)).then(rows => rows.map(mkRow))
    .catch(e => { if (/ 404$/.test(e.message)) return []; delete SX.sound[key]; throw e; });
}
function loadAll(){
  return SX.allP ||= loadTehsils().then(() => getJSON('data/s/all.json')).then(rows => { SX.all = rows.map(mkRow); })
    .catch(e => { SX.allP = null; throw e; });
}
q.addEventListener('focus', () => { loadTehsils().catch(() => {}); });
q.addEventListener('input', runSearch);
async function runSearch(){
  const raw = q.value.trim(), s = raw.toLowerCase(), seq = ++searchSeq;
  if (s.length < 2){ res.classList.remove('on'); return; }
  res.classList.add('on');
  const deva = hasDeva(raw), qk = soundKeys(raw), first = (s.match(/[a-z0-9]+/) || [''])[0];
  const sk = qk[0] && qk[0].length >= 2 ? qk[0].slice(0, 2) : '';
  let rows = SX.all;
  if (!rows){
    res.innerHTML = `<div class="msg">${t('searching')}</div>`;
    const parts = [];
    if (!deva && first.length >= 2) parts.push(loadShard(first.slice(0, 2)));
    if (sk) parts.push(loadSound(sk));
    try { rows = parts.length ? (await Promise.all(parts)).flat() : (await loadTehsils(), []); }
    catch(e){ if (seq === searchSeq) res.innerHTML = `<div class="msg">${t('loadFail')}</div>`; return; }
  }
  if (seq !== searchSeq) return;
  showHits(raw, s, rows, !!SX.all, deva, qk);
  // once the first results are on screen, fetch the full list and add matches from inside words
  if (!SX.all) loadAll().then(() => { if (seq === searchSeq) runSearch(); }).catch(() => {});
}
function showHits(raw, s, rows, full, deva, qk){
  // order: name starts with the letters typed, a word starts with them, then by sound (whole name sounds the same,
  // name starts with the sound, a word does), then inside a word
  const groups = [[], [], [], [], [], []], seen = new Set(), qs = qk.join('');
  for (const r of rows){
    const id = r.d + '|' + r.v + '|' + r.n; if (seen.has(id)) continue;
    let g = -1;
    if (!deva && r.k.startsWith(s)) g = 0;
    else if (!deva && (' ' + r.k).includes(' ' + s)) g = 1;
    else {
      const m = soundMatch(r.sk ||= soundKeys(r.n), qk);
      if (m) g = m === 'start' ? (r.sk.join('') === qs ? 2 : 3) : 4;
      else if (full && (deva ? qs.length >= 3 && r.sk.join('').includes(qs) : r.k.includes(s))) g = 5;
    }
    if (g >= 0 && groups[g].length < (g >= 2 && g <= 4 ? 400 : 40)){ groups[g].push(r); seen.add(id); }
  }
  // several names can sound the same (Shivpur, Sevapur): show the closest spelling first
  const spelt = (deva ? devaToLatin(raw) : s).replace(/[^a-z]/g, '');
  for (const g of [2, 3, 4]) groups[g] = groups[g].map(r => [spellDistance(spelt, r.k.replace(/[^a-z]/g, '').slice(0, spelt.length + 3)), r])
    .sort((x, y) => x[0] - y[0]).slice(0, 40).map(x => x[1]);
  // also allow district and tehsil names (Hindi district names, and tehsils by sound)
  const dm = S.districts.features.filter(f => f.properties.en.toLowerCase().includes(s) || f.properties.hi.includes(raw) || (qs && soundKeys(f.properties.en).join('') === qs))
    .map(f => ({ dist: true, n: dName(f.properties), d: f.properties.lgd }));
  const tm = (S.tehsilIdx || []).filter(x => (!deva && x.k.includes(s)) || (qs && (x.sk ||= soundKeys(x.n)).join('') === qs)).slice(0, 8);
  const mm = mine().filter(p => plotMatches(p, s)).slice(0, 5).map(p => ({ mine: true, p, n: plotTitle(p) }));
  hits = mm.concat(dm, tm, ...groups).slice(0, 40); act = -1;
  const byVillage = hits.some(h => !h.dist && !h.teh && !h.mine);
  res.innerHTML = hits.length ? (deva && byVillage ? `<div class="msg note-sound">${ic('info')}${t('soundNote')}</div>` : '') + hits.map((h, i) => h.mine ? `<button data-i="${i}"><span class="rico mine">${ic('bookmark')}</span><span><b>${esc(h.n)}</b><small>${t('myPlot')}${h.p.village ? ' · ' + esc(vName(h.p.village)) : ''}${h.p.khata ? ' · ' + t('khataNo') + ' ' + esc(h.p.khata) : ''}</small></span></button>` : `<button data-i="${i}"><span class="rico">${ic(h.dist ? 'map' : h.teh ? 'layers' : townType({ en: h.n }) ? 'building' : 'pin')}</span><span><b>${esc(h.dist || h.teh ? h.n : vName({ en: h.n }))}</b><small>${h.dist ? t('district') : h.teh ? `${t('tehsil')} · ${esc(dName(S.byLgd[h.d]))}` : `${townType({ en: h.n }) ? t('t_' + townType({ en: h.n })) : t('village')} · ${esc(h.t)} · ${esc(dName(S.byLgd[h.d]))}`}</small></span></button>`).join('') : `<div class="msg">${t('noMatch')}</div>`;
  res.querySelectorAll('button').forEach(b => b.onclick = () => pickHit(hits[+b.dataset.i]));
}
q.addEventListener('keydown', e => {
  const bs = res.querySelectorAll('button'); if (!bs.length) return;
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp'){ e.preventDefault(); act = (act + (e.key === 'ArrowDown' ? 1 : -1) + bs.length) % bs.length; bs.forEach((b, i) => b.classList.toggle('act', i === act)); bs[act].scrollIntoView({ block: 'nearest' }); }
  if (e.key === 'Enter'){ e.preventDefault(); pickHit(hits[act < 0 ? 0 : act]); }
  if (e.key === 'Escape') res.classList.remove('on');
});
document.addEventListener('click', e => { if (!e.target.closest('.search-wrap')) res.classList.remove('on'); });
async function pickHit(h){
  if (!h) return; res.classList.remove('on');
  if (h.mine){ q.value = h.n; q.blur(); return openPlot(h.p.id); } q.value = h.dist || h.teh ? h.n : vName({ en: h.n }); q.blur(); switchTab('find');
  if (h.dist) return selectDistrict(h.d);
  if (h.teh){ await selectDistrict(h.d, { zoom: false }); return selectTehsil(h.n); }
  await selectDistrict(h.d, { zoom: false });
  if (h.v) return selectVillage(h.v);
  // named village without an LGD code: match by name and tehsil
  const f = S.data && S.data.villages.features.find(x => x.properties.lgd < 0 && x.properties.en === h.n && x.properties.t === h.t);
  if (f) selectVillage(f.properties.lgd);
}

/* ---------------- glossary, tabs, language, theme ---------------- */
function renderGlossary(){
  const s = ($('gq').value || '').toLowerCase();
  $('glossary').innerHTML = WORDS.filter(w => w.join(' ').toLowerCase().includes(s)).map(w => `<div class="term"><div class="t"><b class="hi">${w[0]}</b><span>${w[1]}</span></div><p>${LANG === 'hi' ? w[3] : w[2]}</p></div>`).join('') || `<div class="empty">—</div>`;
}
$('gq').oninput = renderGlossary;
function switchTab(p){
  const same = $('p-' + p).classList.contains('on');
  document.querySelectorAll('#tabs button').forEach(x => x.classList.toggle('on', x.dataset.p === p));
  document.querySelectorAll('.pane').forEach(x => x.classList.toggle('on', x.id === 'p-' + p));
  if (!same) $('panes').scrollTop = 0;
  if (!wide() && panel.dataset.snap === 'peek') setSnap('half');
}
document.querySelectorAll('#tabs button').forEach(b => b.onclick = () => {
  // tapping the open tab again on a phone toggles the panel between half and full
  if (!wide() && b.classList.contains('on')) return setSnap(panel.dataset.snap === 'full' ? 'half' : panel.dataset.snap === 'half' ? 'full' : 'half');
  switchTab(b.dataset.p);
});

/* ---------------- phone panel: peek / half / full, dragged by the handle ---------------- */
const panel = $('panel');
const panelHeight = () => wide() ? 0 : panel.getBoundingClientRect().height;
function setSnap(s){ panel.dataset.snap = s; panel.style.removeProperty('--ph'); }
// keep the map's credit line just above the phone panel
if (window.ResizeObserver) new ResizeObserver(() => document.documentElement.style.setProperty('--ph-now', (wide() ? 0 : panel.offsetHeight) + 'px')).observe(panel);
function dragSheet(handle, el, onEnd){
  let y0 = 0, h0 = 0, moved = false;
  handle.addEventListener('pointerdown', e => {
    if (wide()) return; y0 = e.clientY; h0 = el.getBoundingClientRect().height; moved = false;
    el.classList.add('dragging'); handle.setPointerCapture(e.pointerId);
  });
  handle.addEventListener('pointermove', e => {
    if (!el.classList.contains('dragging')) return; const dy = e.clientY - y0; if (Math.abs(dy) > 4) moved = true;
    onEnd.move(dy, h0);
  });
  const end = e => { if (!el.classList.contains('dragging')) return; el.classList.remove('dragging'); onEnd.end(e.clientY - y0, h0, moved); };
  handle.addEventListener('pointerup', end); handle.addEventListener('pointercancel', end);
}
dragSheet($('grab'), panel, {
  move: (dy, h0) => panel.style.setProperty('--ph', Math.max(110, h0 - dy) + 'px'),
  end: (dy, h0, moved) => {
    if (!moved) return setSnap(panel.dataset.snap === 'peek' ? 'half' : panel.dataset.snap === 'half' ? 'full' : 'peek');
    const h = h0 - dy, vh = innerHeight;
    setSnap(h < vh * 0.3 ? 'peek' : h < vh * 0.68 ? 'half' : 'full');
  }
});
dragSheet($('sheetGrab'), sheet, {
  move: dy => { sheet.style.transform = `translateY(${Math.max(0, dy)}px)`; },
  end: (dy, h0, moved) => { sheet.style.transform = ''; if (!moved || dy > 90) closeSheet(); }
});
function applyLang(){
  document.documentElement.lang = LANG;
  document.querySelectorAll('[data-i]').forEach(el => { el.textContent = t(el.dataset.i); });
  document.querySelectorAll('[data-ph]').forEach(el => { el.placeholder = t(el.dataset.ph); });
  document.querySelectorAll('#langSeg button').forEach(x => x.classList.toggle('on', x.dataset.l === LANG));
  renderGlossary(); renderGuide(); renderMine(); setExVillage(S.exVillage);
  if (S.districts) renderFind();
  const ls = S.lastSheet;
  if (ls && sheet.classList.contains('open')){ if (ls.redraw) ls.redraw(); else if (ls.type === 'village') renderVillage(ls.f); else renderPlot(ls.p, ls.mode); }
  if (S.draw) updateDraw();
}
document.querySelectorAll('#langSeg button').forEach(b => b.onclick = () => { LANG = b.dataset.l; store.set('bs_lang', LANG); applyLang(); });
$('themeBtn').onclick = () => {
  const r = document.documentElement;
  r.dataset.theme = isDark() ? 'light' : 'dark'; store.set('bs_theme', r.dataset.theme); applyBase();
};

/* ---------------- start ---------------- */
(async function init(){
  LANG = store.get('bs_lang', 'en') === 'hi' ? 'hi' : 'en';
  const th = store.get('bs_theme', null); if (th === 'dark' || th === 'light') document.documentElement.dataset.theme = th;
  paintIcons(); applyBase(); applyLang(); drawMine();
  try { S.districts = await getJSON('data/districts.json'); }
  catch(e){ $('findBody').innerHTML = `<div class="empty">${t('loadFail')}</div>`; return; }
  S.districts.features.forEach(f => { S.byLgd[f.properties.lgd] = Object.assign({ f }, f.properties); });
  drawDistricts(); renderFind();
  map.invalidateSize(); map.fitBounds(districtLayer.getBounds(), listPad());
  const h = new URLSearchParams(location.hash.slice(1));
  const d = +h.get('d'), v = +h.get('v');
  if (d && S.byLgd[d]){ await selectDistrict(d, { zoom: !v }); if (v) selectVillage(v); }
  if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});
})();
