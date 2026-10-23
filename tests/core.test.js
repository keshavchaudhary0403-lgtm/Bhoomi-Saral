'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadApp } = require('./load');

const A = loadApp('en');

// a square field of side `m` metres with its south-west corner at lat/lng
function square(lat, lng, m){
  const dLat = m / 111320, dLng = m / (111320 * Math.cos(lat * Math.PI / 180));
  return [[lat, lng], [lat + dLat, lng], [lat + dLat, lng + dLng], [lat, lng + dLng]];
}

test('ringArea: a 63.64 m square is about 0.405 ha', () => {
  const m2 = A.ringArea(square(27, 78.5, 63.64));
  assert.ok(Math.abs(m2 - 4050) / 4050 < 0.005, `got ${m2}`);
});

test('ringArea: corner order does not change the area', () => {
  const pts = square(26.8, 80.9, 100);
  assert.ok(Math.abs(A.ringArea(pts) - A.ringArea([...pts].reverse())) < 1e-6);
});

test('ringArea: a triangle is half the square', () => {
  const [a, b, c] = square(25.4, 81.8, 80);
  assert.ok(Math.abs(A.ringArea([a, b, c]) - 3200) / 3200 < 0.005);
});

test('inGeom: polygon and multipolygon', () => {
  const box = [[[0, 0], [10, 0], [10, 10], [0, 10], [0, 0]]];
  const far = [[[20, 20], [30, 20], [30, 30], [20, 30], [20, 20]]];
  assert.equal(A.inGeom(5, 5, { type: 'Polygon', coordinates: box }), true);
  assert.equal(A.inGeom(15, 5, { type: 'Polygon', coordinates: box }), false);
  assert.equal(A.inGeom(25, 25, { type: 'MultiPolygon', coordinates: [box, far] }), true);
  assert.equal(A.inGeom(15, 15, { type: 'MultiPolygon', coordinates: [box, far] }), false);
});

test('bboxCenter returns [lat, lng]', () => {
  assert.deepEqual([...A.bboxCenter({ type: 'Polygon', coordinates: [[[78, 26], [80, 26], [80, 28], [78, 28], [78, 26]]] })], [27, 79]);
});

test('townType recognises statutory towns only', () => {
  const cases = { 'Lucknow (cb)': 'cb', 'Kishunpur (np)': 'np', 'Bindki (npp)': 'npp', 'Aligarh (m Corp.)': 'mc',
    'Mughalsarai Railway Settlement (its)': 'its', 'Gadhi (ct)': null, 'Daulatpur Tigri(m.s.t)': null, 'Basai Arela': null, '': null };
  for (const [en, want] of Object.entries(cases)) assert.equal(A.townType({ en }), want, en);
});

test('vName strips the town type and names unnamed outlines', () => {
  assert.equal(A.vName({ en: 'Aligarh (m Corp.)' }), 'Aligarh');
  assert.equal(A.vName({ en: 'Gadhi (ct)' }), 'Gadhi (ct)');
  assert.equal(A.vName({ en: '' }), 'Unnamed area');
  assert.equal(loadApp('hi').vName({ en: '' }), 'बिना नाम का क्षेत्र');
});

test('analyse: risk level for each kind of record', () => {
  const lvl = (p) => A.analyse(Object.assign({ cls: 'bt', n: 1, flags: [] }, p));
  const cases = [
    [{}, 'ok', []],
    [{ n: 3 }, 'warn', ['shared']],
    [{ flags: ['loan', 'mut'] }, 'warn', ['loan', 'mut']],
    [{ flags: ['court'] }, 'bad', ['court']],
    [{ flags: ['na'] }, 'ok', ['na']],
    [{ cls: 'bnt' }, 'bad', ['bnt']],
    [{ cls: 'asami' }, 'bad', ['asami']],
    [{ cls: 'bnt', n: 2, flags: ['loan'] }, 'bad', ['bnt', 'shared', 'loan']],
    // public land is always "public", whatever else is ticked, and is never a shared khata
    [{ cls: 'gs', n: 4, flags: ['court'] }, 'pub', ['gs', 'court']],
    [{ flags: ['nonsense'] }, 'ok', []]
  ];
  for (const [p, want, fl] of cases){
    const got = lvl(p);
    assert.equal(got.lvl, want, JSON.stringify(p));
    assert.deepEqual([...got.fl], fl, JSON.stringify(p));
  }
});

test('every warning has an icon', () => {
  for (const k of Object.keys(A.FLAGS)) assert.ok(A.FLAG_IC[k], k);
});

test('sound keys: Hindi spellings match the English village names', () => {
  const same = [['रामनगर', 'Ramnagar'], ['खेड़ा', 'Khera'], ['भदौरिया', 'Bhadoriya'], ['फ़तेहपुर', 'Fatehpur'], ['फतेहपुर', 'Fatehpur'],
    ['गंगापुर', 'Gangapur'], ['बसई अरेला', 'Basai Arela'], ['चक औलिया खेड़ा', 'Chak Auliya Khera'], ['शिवपुर', 'Shivpur'],
    ['सीतापुर', 'Sitapur'], ['मोहम्मदपुर', 'Mohammadpur'], ['इटौंजा', 'Itaunja'], ['आगरा', 'Agra'],
    // loose English spellings too
    ['raamnagar', 'Ramnagar'], ['seetapur', 'Sitapur'], ['mohamadpur', 'Mohammadpur']];
  for (const [a, b] of same) assert.equal(A.soundKeys(a).join(' '), A.soundKeys(b).join(' '), `${a} ≠ ${b}`);
  assert.notEqual(A.soundKeys('रामपुर').join(), A.soundKeys('Ramnagar').join());
});

test('soundMatch: start of the name, start of a word, or no match', () => {
  const k = A.soundKeys;
  assert.equal(A.soundMatch(k('Chak Auliya Khera'), k('चक औलि')), 'start');
  assert.equal(A.soundMatch(k('Chak Auliya Khera'), k('औलिया')), 'word');
  assert.equal(A.soundMatch(k('Ram Nagar'), k('रामनगर')), 'start');
  assert.equal(A.soundMatch(k('Ramnagar'), k('शिवपुर')), false);
  assert.equal(A.soundMatch(k('Ramnagar'), []), false);
});

test('spellDistance puts the closest same-sounding name first', () => {
  assert.equal(A.spellDistance('shivpur', 'shivpur'), 0);
  assert.ok(A.spellDistance('shivpur', 'shivpur') < A.spellDistance('shivpur', 'sevapur'));
  assert.equal(A.spellDistance('kitten', 'sitting'), 3);
  const spelt = { 'शिवपुर': 'shivpur', 'रामनगर': 'ramnagar', 'बसई अरेला': 'basai arela', 'मोहम्मदपुर': 'mohammadpur',
    'गंगापुर': 'gangapur', 'खेड़ा': 'khera', 'सीतापुर': 'sitapur', 'कमलापुर': 'kamlapur', 'नगला': 'nagla' };
  for (const [h, want] of Object.entries(spelt)) assert.equal(A.devaToLatin(h), want, h);
});

test('bnGisCode: builds the Bhu-Naksha village code (Akbarpur, Agra tehsil, Agra)', () => {
  assert.equal(A.bnGisCode(118, 766, 124649), '14600766124649');
  assert.equal(A.bnGisCode(118, 0, 124649), null);
  assert.equal(A.bnGisCode(118, 766, -3), null); // outline with no village code
  assert.equal(A.bnGisCode(9999, 766, 124649), null);
});

test('bnPlotUrl: links to the official plot report, plot no. trimmed and escaped', () => {
  assert.equal(A.bnPlotUrl('14600766124649', ' 245 '), 'https://upbhunaksha.gov.in/plotreport/14600766124649/245');
  assert.equal(A.bnPlotUrl('14600766124649', '12/1'), 'https://upbhunaksha.gov.in/plotreport/14600766124649/12%2F1');
  assert.equal(A.bnPlotUrl('14600766124649', '  '), null);
  assert.equal(A.bnPlotUrl(null, '245'), null);
});
