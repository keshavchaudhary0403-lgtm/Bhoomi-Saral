'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { read, loadApp } = require('./load');

const A = loadApp('en');
const both = (o, where) => {
  assert.equal(typeof o?.en, 'string', `${where}: missing English`);
  assert.equal(typeof o?.hi, 'string', `${where}: missing Hindi`);
  assert.ok(o.en.trim() && o.hi.trim(), `${where}: empty text`);
};
const slots = s => [...s.matchAll(/\{(\w+)\}/g)].map(m => m[1]).sort().join(',');

test('every UI string has English and Hindi, with the same {slots}', () => {
  for (const [k, v] of Object.entries(A.T)){
    both(v, k);
    assert.equal(slots(v.en), slots(v.hi), `${k}: {placeholders} differ between English and Hindi`);
  }
});

test('every string key used by the app exists', () => {
  const code = read('assets/app.js') + read('assets/core.js') + read('index.html');
  const used = new Set();
  for (const m of code.matchAll(/\bt[f]?\(\s*'([A-Za-z0-9_]+)'\s*[,)]/g)) used.add(m[1]);
  for (const m of code.matchAll(/data-(?:i|ph)="([A-Za-z0-9_]+)"/g)) used.add(m[1]);
  // keys built at run time
  ['v_ok', 'v_warn', 'v_bad', 'v_pub', 'v_okB', 'v_warnB', 'v_badB', 'v_pubB', 't_np', 't_npp', 't_mc', 't_cb', 't_its',
   'greetM', 'greetA', 'greetE', 'layerMap', 'layerSat'].forEach(k => used.add(k));
  const missing = [...used].filter(k => !A.T[k]);
  assert.deepEqual(missing, []);
});

test('holder classes are complete in both languages', () => {
  for (const [k, c] of Object.entries(A.CLASSES)){
    assert.ok(c.hi && c.en, `${k}: names`);
    both(c.sell, `${k}.sell`); both(c.mean, `${k}.mean`);
  }
  for (const v of ['bt', 'bnt', 'asami', 'gs']) assert.ok(A.CLASSES[v], `form offers class ${v}`);
});

test('warnings are complete and use a known level', () => {
  for (const [k, f] of Object.entries(A.FLAGS)){
    assert.ok(['ok', 'warn', 'bad', 'pub'].includes(f.lvl), `${k}: level ${f.lvl}`);
    both(f.h, `${k}.h`); both(f.b, `${k}.b`); both(f.d, `${k}.d`);
  }
  // every remark the form can tick maps to a warning
  for (const f of ['loan', 'court', 'mut', 'varasat', 'na']) assert.ok(A.FLAGS[f], f);
});

test('glossary entries have Hindi, English and both explanations', () => {
  assert.ok(A.WORDS.length >= 20);
  for (const w of A.WORDS) assert.ok(w.length === 4 && w.every(x => typeof x === 'string' && x.trim()), JSON.stringify(w[0]));
});
