#!/usr/bin/env python3
"""Build the sharded village search index from the per-district files.

  data/s/_t.json      tehsil table: [[district LGD, tehsil name], ...]
  data/s/<xx>.json    villages having a word that starts with "xx": [[name, village LGD, tehsil index], ...]
  data/s/all.json     every village (for matches inside words), same row format
  data/k/<xx>.json    the same rows sharded by the "sound key" of each word, for Hindi and loose-spelling search

The app fetches one small shard as soon as two letters are typed and loads all.json in
the background. Unnamed outlines and extra pieces of villages split into parts are left out.

Usage: python3 -I scripts/build_search.py [data_dir]
"""
import json, os, re, sys, glob, unicodedata


def key_of(word):
    return word[:2]


# sound keys: a copy of soundKeys() in assets/core.js (tests/data.test.js checks they agree)
DEVA = {
    'अ': 'a', 'आ': 'a', 'इ': 'i', 'ई': 'i', 'उ': 'u', 'ऊ': 'u', 'ऋ': 'ri', 'ए': 'e', 'ऐ': 'e', 'ओ': 'o', 'औ': 'o',
    'ा': 'a', 'ि': 'i', 'ी': 'i', 'ु': 'u', 'ू': 'u', 'ृ': 'ri', 'े': 'e', 'ै': 'e', 'ो': 'o', 'ौ': 'o', 'ं': 'n', 'ँ': 'n', 'ः': 'h', '्': '',
    'क': 'k', 'ख': 'kh', 'ग': 'g', 'घ': 'gh', 'ङ': 'n', 'च': 'ch', 'छ': 'chh', 'ज': 'j', 'झ': 'jh', 'ञ': 'n',
    'ट': 't', 'ठ': 'th', 'ड': 'd', 'ढ': 'dh', 'ण': 'n', 'त': 't', 'थ': 'th', 'द': 'd', 'ध': 'dh', 'न': 'n',
    'प': 'p', 'फ': 'ph', 'ब': 'b', 'भ': 'bh', 'म': 'm', 'य': 'y', 'र': 'r', 'ल': 'l', 'व': 'v', 'श': 'sh', 'ष': 'sh', 'स': 's', 'ह': 'h',
}


DEVA_CONS = set('कखगघङचछजझञटठडढणतथदधनपफबभमयरलवशषसह')
DEVA_MATRA = set('ािीुूृेैोौ')


def deva_to_latin(s):
    syl = []
    for c in unicodedata.normalize('NFD', s):
        last = syl[-1] if syl else None
        if c in DEVA_CONS:
            syl.append({'c': DEVA[c], 'v': None, 'coda': ''})
        elif c == '\u093c':
            if last and last.get('c'):
                last['c'] = re.sub(r'dh?$', 'r', last['c'])
        elif c in DEVA_MATRA and last and last.get('c') and last.get('v', '') is None:
            last['v'] = DEVA[c]
        elif c == '\u094d':
            if last:
                last['v'] = ''
        elif c in ('ं', 'ँ', 'ः') and last:
            last['coda'] = last.get('coda', '') + DEVA[c]
        elif c in DEVA:
            syl.append({'c': '', 'v': DEVA[c], 'coda': ''})
        else:
            syl.append({'sep': c})
    for i, x in enumerate(syl):
        nxt = syl[i + 1] if i + 1 < len(syl) else None
        if 'sep' not in x and x['v'] is None and not x['coda'] and (nxt is None or 'sep' in nxt):
            x['v'] = ''
    out = []
    for i, x in enumerate(syl):
        if 'sep' in x:
            out.append(x['sep'])
            continue
        if x['v'] is None:
            prev = syl[i - 1] if i > 0 else None
            nxt = syl[i + 1] if i + 1 < len(syl) else None
            between = (prev is not None and 'sep' not in prev and prev['v'] != '' and nxt is not None and 'sep' not in nxt
                       and nxt['c'] and nxt['v'] != '' and not x['coda'])
            x['v'] = '' if between else 'a'
        out.append(x['c'] + x['v'] + x['coda'])
    return ''.join(out)


def sound_key(word):
    w = re.sub(r'[^a-z]', '', word.lower())
    w = re.sub(r'[ah]', '', w.replace('x', 'ks'))
    for a, b in (('e', 'i'), ('o', 'u'), ('y', 'i'), ('w', 'v'), ('z', 'j'), ('q', 'k'), ('f', 'p')):
        w = w.replace(a, b)
    w = re.sub(r'n(?=[pb])', 'm', w)
    return re.sub(r'(.)\1+', r'\1', w)


def sound_keys(s):
    if re.search('[\u0900-\u097f]', s):
        s = deva_to_latin(s)
    return [k for k in (sound_key(w) for w in re.split(r'[^a-z\u0900-\u097f]+', s.lower())) if k]


def main(data_dir="data"):
    tehsils, t_index, rows = [], {}, []
    for path in sorted(glob.glob(os.path.join(data_dir, "d", "*.json"))):
        d_lgd = int(os.path.splitext(os.path.basename(path))[0])
        with open(path, encoding="utf-8") as f:
            villages = json.load(f)["villages"]["features"]
        seen = set()
        for v in villages:
            p = v["properties"]
            if not p.get("en"):
                continue
            if p.get("lgd"):
                if p["lgd"] in seen:
                    continue
                seen.add(p["lgd"])
            tk = (d_lgd, p["t"])
            if tk not in t_index:
                t_index[tk] = len(tehsils)
                tehsils.append([d_lgd, p["t"]])
            rows.append([p["en"], p.get("lgd") or 0, t_index[tk]])
    rows.sort(key=lambda r: r[0].lower())

    shards = {}
    for r in rows:
        for k in {key_of(w) for w in re.findall(r"[a-z0-9]+", r[0].lower())}:
            shards.setdefault(k, []).append(r)

    sound = {}
    for r in rows:
        for k in {sk[:2] for sk in sound_keys(r[0]) if len(sk) >= 2}:
            sound.setdefault(k, []).append(r)

    def write(sub, files):
        out = os.path.join(data_dir, sub)
        os.makedirs(out, exist_ok=True)
        for old in glob.glob(os.path.join(out, "*.json")):
            os.remove(old)
        for name, obj in files.items():
            with open(os.path.join(out, name), "w", encoding="utf-8") as f:
                json.dump(obj, f, ensure_ascii=False, separators=(",", ":"))

    write("s", {"_t.json": tehsils, "all.json": rows, **{f"{k}.json": rs for k, rs in shards.items()}})
    write("k", {f"{k}.json": rs for k, rs in sound.items()})
    for label, sh in (("letter", shards), ("sound", sound)):
        biggest = max(sh.items(), key=lambda kv: len(kv[1]))
        print(f"{label} shards={len(sh)} biggest={biggest[0]}:{len(biggest[1])}")
    print(f"villages={len(rows)} tehsils={len(tehsils)}")


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "data")
