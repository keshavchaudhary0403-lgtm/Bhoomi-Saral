'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { ROOT, read } = require('./load');

const json = f => JSON.parse(read(f));
const districts = json('data/districts.json').features;
const D = Object.fromEntries(districts.map(f => [f.properties.lgd, json(`data/d/${f.properties.lgd}.json`)]));

// distinct villages as the app lists them: extra pieces of a split village share one LGD code
function distinct(villages){
  const seen = new Set(); let n = 0;
  for (const v of villages){ const l = v.properties.lgd; if (l && seen.has(l)) continue; if (l) seen.add(l); n++; }
  return n;
}

test('75 districts, each with its own data file and names in both languages', () => {
  assert.equal(districts.length, 75);
  for (const f of districts){
    const p = f.properties;
    assert.ok(p.en && /[ऀ-ॿ]/.test(p.hi), `district ${p.lgd} names`);
    assert.ok(fs.existsSync(path.join(ROOT, 'data/d', `${p.lgd}.json`)), `data/d/${p.lgd}.json`);
  }
  assert.equal(fs.readdirSync(path.join(ROOT, 'data/d')).length, 75);
});

test('totals shown on the home screen match the data', () => {
  const tehsils = Object.values(D).reduce((n, d) => n + d.tehsils.features.length, 0);
  const villages = Object.values(D).reduce((n, d) => n + distinct(d.villages.features), 0);
  assert.equal(tehsils, 310);
  assert.equal(villages, 101526);
  const app = read('assets/app.js');
  for (const [n, label] of [[75, 'districts'], [310, 'tehsils'], [101526, 'villages']])
    assert.ok(app.includes(`data-count="${n}"`), `home screen counter for ${label}`);
  assert.ok(read('README.md').includes('1,01,526'), 'README village total');
});

test('every village has a tehsil, an area and an outline', () => {
  for (const [lgd, d] of Object.entries(D)){
    for (const v of d.villages.features){
      const p = v.properties;
      assert.ok(p.t, `district ${lgd}: village ${p.lgd} has no tehsil`);
      assert.ok(p.a >= 0, `district ${lgd}: village ${p.lgd} area`);
      assert.ok(['Polygon', 'MultiPolygon'].includes(v.geometry.type), `district ${lgd}: village ${p.lgd} geometry`);
    }
  }
});

test('search index: tehsil table, full list and shards agree with the district files', () => {
  const teh = json('data/s/_t.json'), all = json('data/s/all.json');
  teh.forEach(([d, n], i) => assert.ok(D[d] && n, `tehsil row ${i}`));

  let named = 0;
  for (const d of Object.values(D)){
    const seen = new Set();
    for (const v of d.villages.features){
      const p = v.properties; if (!p.en) continue;
      if (p.lgd && seen.has(p.lgd)) continue; if (p.lgd) seen.add(p.lgd); named++;
    }
  }
  assert.equal(all.length, named, 'every named village is searchable exactly once');

  const byCode = {};
  // a split village is named after its first piece (one source village spells its two pieces differently)
  for (const d of Object.values(D)) for (const v of d.villages.features) if (v.properties.lgd) byCode[v.properties.lgd] ||= v.properties;
  for (const [name, code, ti] of all){
    assert.ok(teh[ti], `${name}: tehsil index ${ti}`);
    if (code) assert.equal(byCode[code]?.en, name, `${name}: code ${code} points to the right village`);
  }

  // each village sits in the shard of every word in its name, and nowhere else
  const shards = {};
  for (const f of fs.readdirSync(path.join(ROOT, 'data/s'))) if (!f.startsWith('_') && f !== 'all.json') shards[f.slice(0, -5)] = json(`data/s/${f}`);
  const want = {};
  for (const r of all) for (const k of new Set((r[0].toLowerCase().match(/[a-z0-9]+/g) || []).map(w => w.slice(0, 2)))) (want[k] ||= []).push(r);
  assert.deepEqual(Object.keys(shards).sort(), Object.keys(want).sort());
  for (const k of Object.keys(want)) assert.equal(shards[k].length, want[k].length, `shard ${k}`);
});

test('sound shards (data/k/) were built with the same sound keys as the app', () => {
  const { loadApp } = require('./load');
  const A = loadApp('en'), all = json('data/s/all.json');
  const want = {};
  for (const r of all) for (const k of new Set(A.soundKeys(r[0]).filter(k => k.length >= 2).map(k => k.slice(0, 2)))) (want[k] ||= 0, want[k]++);
  const files = fs.readdirSync(path.join(ROOT, 'data/k')).map(f => f.slice(0, -5)).sort();
  assert.deepEqual(files, Object.keys(want).sort(), 'shard names');
  for (const k of files) assert.equal(json(`data/k/${k}.json`).length, want[k], `sound shard ${k}`);
});

test('Hindi queries find real villages', () => {
  const { loadApp } = require('./load');
  const A = loadApp('en'), all = json('data/s/all.json');
  const find = q => { const qk = A.soundKeys(q); return all.filter(r => A.soundMatch(A.soundKeys(r[0]), qk)).map(r => r[0]); };
  for (const [q, name] of [['बसई अरेला', 'Basai Arela'], ['रामनगर', 'Ramnagar'], ['चक औलिया', 'Chak Auliya Khera'], ['मोहम्मदपुर', 'Mohammadpur']])
    assert.ok(find(q).includes(name), `${q} should find ${name}`);
});
