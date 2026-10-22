# Bhoomi Saral · भूमि सरल

A personal web app to explore every village in **Uttar Pradesh** on a map and understand land records
(khasra, khatauni, mutation, varasat…) in plain **Hindi and English**.

## What it does

- **Find land** — all 75 districts, 310 tehsils and 1,01,753 villages (LGD / Census 2011 outlines). Search any village or tehsil, or tap "Which village am I in?".
- **Village card** — LGD and Census codes, gram panchayat, block, area, and step-by-step help to see the real records on the official UP sites.
- **Explain** — type details from your own khatauni and get a plain-language card: holder class and whether it can be sold, shared-khata warnings, loans, court cases, pending mutation, varasat, and what the record does *not* prove.
- **Draw my plot** — tap your field's corners on the map or walk them with phone GPS; area is calculated for you.
- **My land** — saved plots, stored only in your browser. Export / import a file to move them between devices.
- **Words** and **Check officially** — a UP land glossary and guides to upbhulekh, upbhunaksha, vaad.up.nic.in and igrsup.
- Installable on a phone (PWA), light / dark theme.

## Privacy and legal

- No server, database, analytics or login. Your plots never leave your device.
- It **does not scrape** government portals or bypass captchas — it links to them so you look up records yourself.
- Pages are marked `noindex` so search engines don't list the site.
- A khatauni or this app is **not proof of ownership**. Village outlines are approximate.

## Run locally

```bash
python3 -m http.server 8080 --bind 127.0.0.1   # then open http://localhost:8080
```
(or double-click `start.command` on macOS)

## Deploy

Static site — on Vercel, import the repo with framework preset **Other**, no build command, output directory `.` (root).

## Rebuild the map data

```bash
# download STATES/UTTAR PRADESH/*.geojson from github.com/datta07/INDIAN-SHAPEFILES into ./source-data
python3 -I scripts/build_data.py source-data data
```

## Credits

See [ATTRIBUTION.md](ATTRIBUTION.md).
