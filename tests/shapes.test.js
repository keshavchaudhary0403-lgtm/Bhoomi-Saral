'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const zlib = require('node:zlib');
const { loadApp } = require('./load');

const A = loadApp('en');
const ha = ring => A.ringArea(ring) / 10000;

// a ~63.64 m square (0.405 ha) near Basai Arela, as lng,lat pairs
const SQ = [[78.5, 27], [78.5, 27.000572], [78.500642, 27.000572], [78.500642, 27], [78.5, 27]];

test('GeoJSON: polygon features with names, area in hectares', () => {
  const gj = { type: 'FeatureCollection', features: [
    { type: 'Feature', properties: { name: 'Khasra 245' }, geometry: { type: 'Polygon', coordinates: [SQ] } },
    { type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: [78.5, 27] } }] };
  const r = A.parseShapes(JSON.stringify(gj));
  assert.equal(r.shapes.length, 1);
  assert.equal(r.shapes[0].name, 'Khasra 245');
  assert.equal(r.shapes[0].ring.length, 4, 'closing point dropped');
  assert.deepEqual([...r.shapes[0].ring[0]], [27, 78.5], 'stored as [lat, lng]');
  assert.ok(Math.abs(ha(r.shapes[0].ring) - 0.405) < 0.005);
});

test('GeoJSON: multipolygon parts, closed GPS track, bare geometry', () => {
  const two = SQ.map(([x, y]) => [x + 0.01, y]);
  const r = A.parseShapes(JSON.stringify({ type: 'Feature', properties: { Name: 'Farm' }, geometry: { type: 'MultiPolygon', coordinates: [[SQ], [two]] } }));
  assert.deepEqual([...r.shapes.map(s => s.name)], ['Farm (1)', 'Farm (2)']);
  assert.equal(A.parseShapes(JSON.stringify({ type: 'LineString', coordinates: SQ })).shapes.length, 1);
});

test('projected coordinates (UTM metres) are refused, not misplaced', () => {
  const utm = [[512000, 2986000], [512060, 2986000], [512060, 2986060], [512000, 2986060], [512000, 2986000]];
  const r = A.parseShapes(JSON.stringify({ type: 'Polygon', coordinates: [utm] }));
  assert.equal(r.projected, true);
  assert.equal(r.shapes.length, 0);
});

const coords = SQ.map(c => c.join(',') + ',0').join(' ');
const KML = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2"><Document><name>Survey</name>
  <Placemark><name><![CDATA[Gata 131 & 132]]></name><Polygon><outerBoundaryIs><LinearRing><coordinates>
    ${coords}
  </coordinates></LinearRing></outerBoundaryIs><innerBoundaryIs><LinearRing><coordinates>78.5001,27.0001 78.5002,27.0001 78.5002,27.0002</coordinates></LinearRing></innerBoundaryIs></Polygon></Placemark>
  <Placemark><name>Walk</name><LineString><coordinates>${coords}</coordinates></LineString></Placemark>
  <Placemark><name>Well</name><Point><coordinates>78.5,27,0</coordinates></Point></Placemark>
</Document></kml>`;

test('KML: polygons and GPS tracks, CDATA names, holes and points ignored', () => {
  const r = A.parseShapes(KML);
  assert.deepEqual([...r.shapes.map(s => s.name)], ['Gata 131 & 132', 'Walk']);
  assert.equal(r.shapes[0].ring.length, 4, 'outer boundary only');
  assert.ok(Math.abs(ha(r.shapes[0].ring) - 0.405) < 0.005);
});

test('KML with a namespace prefix', () => {
  const r = A.parseShapes(KML.replace(/<(\/?)(Placemark|name|Polygon|outerBoundaryIs|LinearRing|coordinates)>/g, '<$1kml:$2>'));
  assert.deepEqual([...r.shapes.map(s => s.name)], ['Gata 131 & 132', 'Walk']);
});

test('broken files: no shapes, or an error the app turns into a message', () => {
  assert.equal(A.parseShapes('<kml><Document></Document></kml>').shapes.length, 0);
  assert.throws(() => A.parseShapes('{ not json'));
});

// build a real .kmz (zip with a deflated doc.kml) the way Google Earth does
function zip(name, content){
  const data = Buffer.from(content), comp = zlib.deflateRawSync(data), fname = Buffer.from(name);
  const crc = zlib.crc32 ? zlib.crc32(data) : 0;
  const local = Buffer.alloc(30); local.writeUInt32LE(0x04034b50, 0); local.writeUInt16LE(20, 4); local.writeUInt16LE(8, 8);
  local.writeUInt32LE(crc, 14); local.writeUInt32LE(comp.length, 18); local.writeUInt32LE(data.length, 22); local.writeUInt16LE(fname.length, 26);
  const central = Buffer.alloc(46); central.writeUInt32LE(0x02014b50, 0); central.writeUInt16LE(20, 4); central.writeUInt16LE(20, 6); central.writeUInt16LE(8, 10);
  central.writeUInt32LE(crc, 16); central.writeUInt32LE(comp.length, 20); central.writeUInt32LE(data.length, 24); central.writeUInt16LE(fname.length, 28);
  const cdStart = 30 + fname.length + comp.length;
  const end = Buffer.alloc(22); end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(1, 8); end.writeUInt16LE(1, 10);
  end.writeUInt32LE(46 + fname.length, 12); end.writeUInt32LE(cdStart, 16);
  const all = Buffer.concat([local, fname, comp, central, fname, end]);
  return all.buffer.slice(all.byteOffset, all.byteOffset + all.byteLength);
}

test('KMZ: unzips doc.kml and reads its shapes', async () => {
  const kml = await A.kmzToKml(zip('doc.kml', KML));
  assert.equal(kml, KML);
  assert.equal(A.parseShapes(kml).shapes.length, 2);
});

test('KMZ: a file that is not a zip is rejected', async () => {
  await assert.rejects(A.kmzToKml(new TextEncoder().encode('hello').buffer));
});

test('sample files: KML, a real KMZ made by a zip tool, and GeoJSON agree', async () => {
  const fs = require('node:fs'), path = require('node:path'), dir = path.join(__dirname, 'fixtures');
  const kml = A.parseShapes(fs.readFileSync(path.join(dir, 'fields.kml'), 'utf8'));
  const b = fs.readFileSync(path.join(dir, 'fields.kmz'));
  const kmz = A.parseShapes(await A.kmzToKml(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength)));
  const gj = A.parseShapes(fs.readFileSync(path.join(dir, 'field.geojson'), 'utf8'));
  assert.deepEqual([...kml.shapes.map(s => s.name)], ['Gata 245', 'Gata 246 (walked)']);
  assert.equal(JSON.stringify(kmz.shapes), JSON.stringify(kml.shapes));
  assert.equal(gj.shapes[0].name, '245');
  assert.ok(Math.abs(ha(gj.shapes[0].ring) - ha(kml.shapes[0].ring)) < 1e-9);
});
