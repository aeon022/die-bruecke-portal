"""Erzeugt den barrierefreien Anfahrtsplan (frontend/src/components/AnfahrtPlan.astro) aus OpenStreetMap-Daten.
Aufruf: python3 build.py osm.json   (osm.json = Overpass-Abfrage, siehe query.txt)
Fußwege werden ohne Stufen berechnet (Dijkstra auf highway-Ways, steps ausgeschlossen)."""
import json, sys, math, heapq, collections, pathlib

LAT0, LON0 = 47.083593, 15.4369552          # Die Brücke
ENTRANCE = (47.0836296, 15.4369864)          # Haupteingang (OSM)
BBOX = (47.0786, 15.4312, 47.0848, 15.4418)  # S, W, N, E
W = 800
KX = 111195 * math.cos(math.radians(LAT0)); KY = 111195
H = round(W * (BBOX[2]-BBOX[0])*KY / ((BBOX[3]-BBOX[1])*KX))
def xy(lat, lon): return ((lon-BBOX[1])*KX/((BBOX[3]-BBOX[1])*KX)*W, (BBOX[2]-lat)*KY/((BBOX[2]-BBOX[0])*KY)*H)
def dist(a, b): return math.hypot((a[0]-b[0])*KY, (a[1]-b[1])*KX)

d = json.load(open(sys.argv[1]))['elements']
ways = [e for e in d if e['type'] == 'way']

# --- Routing (ohne Stufen) ---
G = collections.defaultdict(list); coord = {}
WALK = {'footway','service','residential','pedestrian','path','living_street','unclassified','tertiary','secondary','primary','cycleway','track','platform','primary_link'}
for e in ways:
    t = e.get('tags', {})
    if t.get('highway') not in WALK or t.get('access') in ('private','no') or t.get('foot') == 'no': continue
    for n, g in zip(e['nodes'], e['geometry']): coord[n] = (g['lat'], g['lon'])
    for a, b in zip(e['nodes'], e['nodes'][1:]):
        w = dist(coord[a], coord[b]); G[a].append((b, w)); G[b].append((a, w))
near = lambda p: min(coord, key=lambda n: dist(coord[n], p))
target = near(ENTRANCE)
def route(p):
    src = near(p); D = {src: 0}; P = {}; pq = [(0, src)]
    while pq:
        c, u = heapq.heappop(pq)
        if u == target: break
        if c > D[u]: continue
        for v, w in G[u]:
            if c+w < D.get(v, 1e18): D[v] = c+w; P[v] = u; heapq.heappush(pq, (c+w, v))
    path = [target]
    while path[-1] != src: path.append(P[path[-1]])
    return D[target], [coord[n] for n in reversed(path)]

STOPS = [  # Name, Haltestellen-Koordinate (OSM), Linien, Kürzel, Strichart
    ('Hasnerplatz / Päd. Hochschule', (47.0823634, 15.4331671), 'Bim 3 und 5', 'A', ''),
    ('Grabenkirche', (47.0816102, 15.4382927), 'Bus 41', 'B', '10 6'),
    ('Grabenstraße', (47.0791999, 15.4395165), 'Bus 58 und 63', 'C', '2 6'),
]
routes = [(s, *route(s[1])) for s in STOPS]
for s, m, _ in routes: assert m < 800, (s[0], m)

f = lambda v: f"{v:.1f}"
def pts(geom): return ' '.join(f"{f(x)},{f(y)}" for x, y in (xy(la, lo) for la, lo in geom))
def inside(g): return any(BBOX[0] <= p['lat'] <= BBOX[2] and BBOX[1] <= p['lon'] <= BBOX[3] for p in g)

out = []
# Grünflächen
for e in ways:
    t = e.get('tags', {})
    if (t.get('leisure') == 'park' or t.get('landuse') == 'grass') and inside(e['geometry']):
        out.append(f'<polygon class="ap-park" points="{pts((p["lat"], p["lon"]) for p in e["geometry"])}"/>')
# Straßen nach Klasse
CLS = {'primary':'ap-r1','primary_link':'ap-r1','secondary':'ap-r1','tertiary':'ap-r2','residential':'ap-r2','unclassified':'ap-r2','living_street':'ap-r2','service':'ap-r3','pedestrian':'ap-r3','footway':'ap-r4','cycleway':'ap-r4','path':'ap-r4'}
for cls in ('ap-r4','ap-r3','ap-r2','ap-r1'):
    for e in ways:
        h = e.get('tags', {}).get('highway')
        if CLS.get(h) == cls and inside(e['geometry']):
            out.append(f'<polyline class="{cls}" points="{pts((p["lat"], p["lon"]) for p in e["geometry"])}"/>')
for e in ways:
    if e.get('tags', {}).get('railway') == 'tram' and inside(e['geometry']):
        out.append(f'<polyline class="ap-tram" points="{pts((p["lat"], p["lon"]) for p in e["geometry"])}"/>')
# Gebäude der Brücke
for e in ways:
    if e['id'] == 93689251:
        out.append(f'<polygon class="ap-house" points="{pts((p["lat"], p["lon"]) for p in e["geometry"])}"/>')
# Straßennamen (längster Abschnitt je Name)
LABELS = ['Grabenstraße', 'Hasnerplatz', 'Bergmanngasse', 'Heinrichstraße', 'Cäcilia-Kappel-Weg']
segs = collections.defaultdict(list)
for e in ways:
    n = e.get('tags', {}).get('name')
    if n in LABELS and e.get('tags', {}).get('highway'):
        g = e['geometry']
        for a, b in zip(g, g[1:]):
            A, B = xy(a['lat'], a['lon']), xy(b['lat'], b['lon'])
            if all(0 < c[0] < W and 0 < c[1] < H for c in (A, B)): segs[n].append((math.dist(A, B), A, B))
for n, ss in segs.items():
    L, A, B = max(ss)
    if L < 60: continue
    ang = math.degrees(math.atan2(B[1]-A[1], B[0]-A[0]))
    if ang > 90: ang -= 180
    if ang < -90: ang += 180
    a = math.radians(ang); off = 20 if n == 'Grabenstraße' else 0  # Grabenstraße liegt unter Weg C → Name daneben
    cx, cy = (A[0]+B[0])/2 + math.sin(a)*off, (A[1]+B[1])/2 - math.cos(a)*off - 6
    out.append(f'<text class="ap-street" transform="translate({f(cx)},{f(cy)}) rotate({ang:.0f})" text-anchor="middle">{n}</text>')
# Wege
for (name, p, lines, k, dash), m, geom in routes:
    da = f' stroke-dasharray="{dash}"' if dash else ''
    out.append(f'<polyline class="ap-way ap-way-{k}" points="{pts(geom)}"{da}/>')
# Haltestellen
for (name, p, lines, k, dash), m, geom in routes:
    x, y = xy(*p)
    out.append(f'<g class="ap-stop"><circle cx="{f(x)}" cy="{f(y)}" r="15"/><text x="{f(x)}" y="{f(y+5.5)}" text-anchor="middle">{k}</text></g>')
# Brücke
x, y = xy(*ENTRANCE)
out.append(f'<g class="ap-dest"><circle cx="{f(x)}" cy="{f(y)}" r="19"/><text x="{f(x)}" y="{f(y+5.5)}" text-anchor="middle">★</text>'
           f'<text class="ap-dest-label" x="{f(x+26)}" y="{f(y+6)}">Die Brücke</text></g>')

# Nordpfeil und Maßstab (100 m)
px100 = 100 * W / ((BBOX[3]-BBOX[1])*KX)
out.append(f'<g class="ap-legend"><rect x="16" y="{H-58}" width="{f(px100+48)}" height="42" rx="8"/>'
           f'<line x1="30" y1="{H-28}" x2="{f(30+px100)}" y2="{H-28}"/><line x1="30" y1="{H-34}" x2="30" y2="{H-22}"/><line x1="{f(30+px100)}" y1="{H-34}" x2="{f(30+px100)}" y2="{H-22}"/>'
           f'<text x="{f(30+px100/2)}" y="{H-38}" text-anchor="middle">100 m</text></g>'
           f'<g class="ap-legend"><rect x="{W-58}" y="16" width="42" height="56" rx="8"/><path d="M {W-37} 26 L {W-29} 50 L {W-37} 45 L {W-45} 50 Z"/><text x="{W-37}" y="66" text-anchor="middle">N</text></g>')
desc = 'Plan der Umgebung der Brücke, Grabenstraße 39a. ' + ' '.join(
    f'{k}: Haltestelle {n} ({l}), stufenloser Fußweg ca. {round(m, -1):.0f} Meter.' for (n, p, l, k, _), m, g in routes)
svg = (f'<svg viewBox="0 0 {W} {H}" role="img" aria-labelledby="ap-title ap-desc" class="anfahrt-plan w-full h-auto">'
       f'<title id="ap-title">Anfahrtsplan zur Brücke</title><desc id="ap-desc">{desc}</desc>'
       f'<rect class="ap-bg" width="{W}" height="{H}"/>' + ''.join(out) + '</svg>')

meta = [{'k': k, 'name': n, 'lines': l, 'meter': int(round(m, -1)), 'min': max(1, round(m/60))} for (n, p, l, k, _), m, g in routes]
comp = f"""---
// Automatisch erzeugt von scripts/anfahrtsplan/build.py – nicht von Hand bearbeiten.
// Kartendaten © OpenStreetMap-Mitwirkende (ODbL), Stand der Abfrage siehe scripts/anfahrtsplan/README.md
---
{svg}
<style>
  .anfahrt-plan {{ font-family: inherit; }}
  .ap-bg {{ fill: #f8fafc; }}
  .ap-park {{ fill: #dcfce7; stroke: none; }}
  .ap-r1, .ap-r2, .ap-r3, .ap-r4, .ap-tram, .ap-way {{ fill: none; stroke-linecap: round; stroke-linejoin: round; }}
  .ap-r1 {{ stroke: #cbd5e1; stroke-width: 12; }}
  .ap-r2 {{ stroke: #e2e8f0; stroke-width: 8; }}
  .ap-r3 {{ stroke: #e2e8f0; stroke-width: 4; }}
  .ap-r4 {{ stroke: #e2e8f0; stroke-width: 2; }}
  .ap-tram {{ stroke: #64748b; stroke-width: 2; stroke-dasharray: 1 5; }}
  .ap-house {{ fill: #fda4af; stroke: #be123c; stroke-width: 2; }}
  .ap-street {{ font-size: 15px; fill: #475569; font-style: italic; paint-order: stroke; stroke: #f8fafc; stroke-width: 4; }}
  .ap-way {{ stroke-width: 6; }}
  .ap-way-A {{ stroke: #be123c; }}
  .ap-way-B {{ stroke: #1d4ed8; }}
  .ap-way-C {{ stroke: #a16207; }}
  .ap-stop circle {{ fill: #0f172a; stroke: #fff; stroke-width: 3; }}
  .ap-stop text {{ fill: #fff; font-size: 16px; font-weight: 800; }}
  .ap-dest circle {{ fill: #be123c; stroke: #fff; stroke-width: 3; }}
  .ap-dest text {{ fill: #fff; font-size: 18px; }}
  .ap-dest .ap-dest-label {{ fill: #0f172a; font-size: 20px; font-weight: 800; paint-order: stroke; stroke: #f8fafc; stroke-width: 5; }}
  .ap-legend rect {{ fill: #fff; stroke: #cbd5e1; }}
  .ap-legend line {{ stroke: #0f172a; stroke-width: 2; }}
  .ap-legend path {{ fill: #0f172a; }}
  .ap-legend text {{ fill: #0f172a; font-size: 13px; font-weight: 700; }}
  :global(.dark) .ap-legend rect {{ fill: #1e293b; stroke: #475569; }}
  :global(.dark) .ap-legend line {{ stroke: #f8fafc; }}
  :global(.dark) .ap-legend path, :global(.dark) .ap-legend text {{ fill: #f8fafc; }}
  :global(.dark) .ap-bg {{ fill: #0f172a; }}
  :global(.dark) .ap-park {{ fill: #14532d; }}
  :global(.dark) .ap-r1 {{ stroke: #475569; }}
  :global(.dark) .ap-r2, :global(.dark) .ap-r3, :global(.dark) .ap-r4 {{ stroke: #334155; }}
  :global(.dark) .ap-tram {{ stroke: #94a3b8; }}
  :global(.dark) .ap-street {{ fill: #cbd5e1; stroke: #0f172a; }}
  :global(.dark) .ap-way-A {{ stroke: #fb7185; }}
  :global(.dark) .ap-way-B {{ stroke: #60a5fa; }}
  :global(.dark) .ap-way-C {{ stroke: #fbbf24; }}
  :global(.dark) .ap-stop circle {{ fill: #f8fafc; stroke: #0f172a; }}
  :global(.dark) .ap-stop text {{ fill: #0f172a; }}
  :global(.dark) .ap-dest .ap-dest-label {{ fill: #f8fafc; stroke: #0f172a; }}
</style>
"""
dst = pathlib.Path(__file__).resolve().parents[2] / 'frontend/src/components/AnfahrtPlan.astro'
dst.write_text(comp)
(dst.parents[1] / 'lib/anfahrtWege.ts').write_text('// Automatisch erzeugt von scripts/anfahrtsplan/build.py\nexport const WEGE = ' + json.dumps(meta, ensure_ascii=False, indent=2) + ';\n')
print(dst, W, H, meta)
