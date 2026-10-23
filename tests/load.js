// Runs the browser scripts that have no page code (content.js, core.js) in a node sandbox
// and hands their globals to the tests.
'use strict';
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');

function loadApp(lang = 'en'){
  const ctx = vm.createContext({ console });
  for (const f of ['assets/content.js', 'assets/core.js']) vm.runInContext(read(f), ctx, { filename: f });
  vm.runInContext(`LANG = ${JSON.stringify(lang)}`, ctx);
  // top-level const/let live in the sandbox's script scope, not on its global object
  return vm.runInContext('({ T, t, CLASSES, FLAGS, WORDS, ringArea, inRing, inGeom, bboxCenter, TOWN_RE, townType, vName, analyse, FLAG_IC, hasDeva, devaToLatin, soundKey, soundKeys, soundMatch, spellDistance })', ctx);
}

module.exports = { ROOT, read, loadApp };
