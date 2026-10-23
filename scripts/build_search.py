#!/usr/bin/env python3
"""Build the sharded village search index from the per-district files.

  data/s/_t.json      tehsil table: [[district LGD, tehsil name], ...]
  data/s/<xx>.json    villages having a word that starts with "xx": [[name, village LGD, tehsil index], ...]
  data/s/all.json     every village (for matches inside words), same row format

The app fetches one small shard as soon as two letters are typed and loads all.json in
the background. Unnamed outlines and extra pieces of villages split into parts are left out.

Usage: python3 -I scripts/build_search.py [data_dir]
"""
import json, os, re, sys, glob


def key_of(word):
    return word[:2]


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

    out = os.path.join(data_dir, "s")
    os.makedirs(out, exist_ok=True)
    for old in glob.glob(os.path.join(out, "*.json")):
        os.remove(old)

    def dump(name, obj):
        with open(os.path.join(out, name), "w", encoding="utf-8") as f:
            json.dump(obj, f, ensure_ascii=False, separators=(",", ":"))

    dump("_t.json", tehsils)
    dump("all.json", rows)
    for k, rs in shards.items():
        dump(f"{k}.json", rs)
    biggest = max(shards.items(), key=lambda kv: len(kv[1]))
    print(f"villages={len(rows)} tehsils={len(tehsils)} shards={len(shards)} biggest={biggest[0]}:{len(biggest[1])}")


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "data")
