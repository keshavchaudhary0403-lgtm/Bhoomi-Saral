"""Build compact map data for Bhoomi Saral from the open UP boundary GeoJSON.

Source: https://github.com/datta07/INDIAN-SHAPEFILES (MIT licence), STATES/UTTAR PRADESH.
Usage:  python3 -I scripts/build_data.py <folder-with-source-geojson> <output-data-folder>

Outputs
  districts.json        all 75 district outlines + names (English/Hindi) + LGD codes
  d/<dist_lgd>.json     tehsil outlines and village outlines for one district
  s/*.json              village search index, sharded (built by build_search.py)
"""
import runpy
import json
import math
import os
import sys

SRC, OUT = sys.argv[1], sys.argv[2]

# Hindi district names, keyed by the English name used in the source data.
HINDI = {
    "Agra": "आगरा", "Aligarh": "अलीगढ़", "Allahabad": "प्रयागराज", "Prayagraj": "प्रयागराज",
    "Ambedkar Nagar": "अंबेडकर नगर", "Amethi": "अमेठी", "Amroha": "अमरोहा", "Auraiya": "औरैया",
    "Azamgarh": "आज़मगढ़", "Baghpat": "बागपत", "Bahraich": "बहराइच", "Ballia": "बलिया",
    "Balrampur": "बलरामपुर", "Banda": "बांदा", "Barabanki": "बाराबंकी", "Bareilly": "बरेली",
    "Basti": "बस्ती", "Bhadohi": "भदोही", "Sant Ravidas Nagar (Bhadohi)": "भदोही", "Bijnor": "बिजनौर",
    "Budaun": "बदायूँ", "Bulandshahr": "बुलंदशहर", "Chandauli": "चंदौली", "Chitrakoot": "चित्रकूट",
    "Deoria": "देवरिया", "Etah": "एटा", "Etawah": "इटावा", "Faizabad": "अयोध्या", "Ayodhya": "अयोध्या",
    "Farrukhabad": "फ़र्रुख़ाबाद", "Fatehpur": "फ़तेहपुर", "Firozabad": "फ़िरोज़ाबाद",
    "Gautam Buddha Nagar": "गौतम बुद्ध नगर", "Ghaziabad": "ग़ाज़ियाबाद", "Ghazipur": "ग़ाज़ीपुर",
    "Gonda": "गोंडा", "Gorakhpur": "गोरखपुर", "Hamirpur": "हमीरपुर", "Hapur": "हापुड़",
    "Hardoi": "हरदोई", "Hathras": "हाथरस", "Mahamaya Nagar": "हाथरस", "Jalaun": "जालौन",
    "Jaunpur": "जौनपुर", "Jhansi": "झाँसी", "Kannauj": "कन्नौज", "Kanpur Dehat": "कानपुर देहात",
    "Kanpur Nagar": "कानपुर नगर", "Kasganj": "कासगंज", "Kanshiram Nagar": "कासगंज", "Kaushambi": "कौशांबी",
    "Kheri": "लखीमपुर खीरी", "Lakhimpur Kheri": "लखीमपुर खीरी", "Kushinagar": "कुशीनगर",
    "Lalitpur": "ललितपुर", "Lucknow": "लखनऊ", "Maharajganj": "महराजगंज", "Mahoba": "महोबा",
    "Mainpuri": "मैनपुरी", "Mathura": "मथुरा", "Mau": "मऊ", "Meerut": "मेरठ", "Mirzapur": "मिर्ज़ापुर",
    "Moradabad": "मुरादाबाद", "Muzaffarnagar": "मुज़फ़्फ़रनगर", "Pilibhit": "पीलीभीत",
    "Pratapgarh": "प्रतापगढ़", "Rae Bareli": "रायबरेली", "Raebareli": "रायबरेली", "Rampur": "रामपुर",
    "Saharanpur": "सहारनपुर", "Sambhal": "संभल", "Sant Kabir Nagar": "संत कबीर नगर",
    "Shahjahanpur": "शाहजहाँपुर", "Shamli": "शामली", "Shravasti": "श्रावस्ती",
    "Siddharthnagar": "सिद्धार्थनगर", "Siddharth Nagar": "सिद्धार्थनगर", "Sitapur": "सीतापुर",
    "Bara Banki": "बाराबंकी", "Mahrajganj": "महराजगंज", "Shrawasti": "श्रावस्ती",
    "Sonbhadra": "सोनभद्र", "Sultanpur": "सुल्तानपुर", "Unnao": "उन्नाव", "Varanasi": "वाराणसी",
}


# Current official names where the 2011-era source uses an older spelling.
RENAME = {"Faizabad": "Ayodhya", "Kheri": "Lakhimpur Kheri", "Bara Banki": "Barabanki",
          "Mahrajganj": "Maharajganj", "Shrawasti": "Shravasti"}


def dp(points, tol):
    """Douglas-Peucker simplification of a list of [x, y] points."""
    if len(points) < 3:
        return points
    keep = [False] * len(points)
    keep[0] = keep[-1] = True
    stack = [(0, len(points) - 1)]
    while stack:
        a, b = stack.pop()
        ax, ay = points[a]
        bx, by = points[b]
        dx, dy = bx - ax, by - ay
        norm = math.hypot(dx, dy) or 1e-12
        best, idx = 0.0, -1
        for i in range(a + 1, b):
            px, py = points[i]
            d = abs(dy * px - dx * py + bx * ay - by * ax) / norm
            if d > best:
                best, idx = d, i
        if best > tol and idx > 0:
            keep[idx] = True
            stack.append((a, idx))
            stack.append((idx, b))
    return [p for p, k in zip(points, keep) if k]


def ring(r, tol, nd):
    # A closed ring starts and ends on the same point, which gives Douglas-Peucker
    # a zero-length baseline; split it at the farthest vertex and simplify each half.
    if len(r) > 3 and r[0] == r[-1]:
        x0, y0 = r[0]
        far = max(range(len(r)), key=lambda i: (r[i][0] - x0) ** 2 + (r[i][1] - y0) ** 2)
        s = dp(r[: far + 1], tol)[:-1] + dp(r[far:], tol)
    else:
        s = dp(r, tol)
    if len(s) < 4:  # keep a valid ring for tiny shapes
        s = r if len(r) <= 8 else r[:: max(1, len(r) // 6)] + [r[0]]
    return [[round(x, nd), round(y, nd)] for x, y in s]


def geom(g, tol, nd):
    if g["type"] == "Polygon":
        return {"type": "Polygon", "coordinates": [ring(r, tol, nd) for r in g["coordinates"][:1]]}
    polys = [[ring(r, tol, nd) for r in p[:1]] for p in g["coordinates"]]
    return {"type": "MultiPolygon", "coordinates": polys}


def title(s):
    return " ".join(w.capitalize() for w in (s or "").split())


def load(name):
    with open(os.path.join(SRC, name), encoding="utf-8") as f:
        return json.load(f)["features"]


def dump(path, obj):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False, separators=(",", ":"))


districts = load("districts.geojson")
tehsils = load("subdistricts.geojson")
villages = load("villages.geojson")

# district code (Census 2011) -> LGD code, so all files can key by LGD
code_to_lgd = {d["properties"]["dtcode11"]: d["properties"]["Dist_LGD"] for d in districts}

out_d = []
for d in districts:
    p = d["properties"]
    out_d.append({
        "type": "Feature",
        "properties": {"lgd": p["Dist_LGD"], "en": RENAME.get(p["dtname"], p["dtname"]),
                       "hi": HINDI.get(p["dtname"], p["dtname"])},
        "geometry": geom(d["geometry"], 0.0015, 4),
    })
out_d.sort(key=lambda f: f["properties"]["en"])
dump(os.path.join(OUT, "districts.json"), {"type": "FeatureCollection", "features": out_d})

per = {lgd: {"tehsils": [], "villages": []} for lgd in code_to_lgd.values()}
for t in tehsils:
    p = t["properties"]
    lgd = p.get("Dist_LGD") or code_to_lgd.get(p["dtcode11"])
    per[lgd]["tehsils"].append({
        "type": "Feature",
        "properties": {"lgd": p["Subdt_LGD"], "en": p["sdtname"]},
        "geometry": geom(t["geometry"], 0.0015, 4),
    })

search = []
for v in villages:
    p = v["properties"]
    lgd = p.get("dist_lgd") or code_to_lgd.get(p["dtcode11"])
    if lgd not in per:
        continue
    name = title(p.get("vilname11") or p.get("vilnam_soi"))
    per[lgd]["villages"].append({
        "type": "Feature",
        "properties": {
            "lgd": p.get("vil_lgd"), "en": name, "t": p.get("sdtname"), "tl": p.get("subdt_lgd"),
            "gp": title(p.get("gp_name")), "b": title(p.get("block_name")),
            "c11": p.get("vilcode11"), "a": round((p.get("st_area(shape)") or 0) / 10000, 1),
        },
        "geometry": geom(v["geometry"], 0.00025, 5),
    })
    search.append([name, p.get("vil_lgd"), lgd, p.get("sdtname")])

for lgd, data in per.items():
    data["tehsils"].sort(key=lambda f: f["properties"]["en"])
    dump(os.path.join(OUT, "d", f"{lgd}.json"), {
        "tehsils": {"type": "FeatureCollection", "features": data["tehsils"]},
        "villages": {"type": "FeatureCollection", "features": data["villages"]},
    })

# search index is built from the district files just written
runpy.run_path(os.path.join(os.path.dirname(os.path.abspath(__file__)), "build_search.py"))["main"](OUT)
missing = sorted({d["properties"]["en"] for d in out_d if not any("\u0900" <= c <= "\u097f" for c in d["properties"]["hi"])})
print(f"districts={len(out_d)} tehsils={len(tehsils)} villages={len(search)} missing_hindi={missing}")
