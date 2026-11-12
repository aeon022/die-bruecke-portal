# Anfahrtsplan

Erzeugt `frontend/src/components/AnfahrtPlan.astro` (SVG-Plan) und `frontend/src/lib/anfahrtWege.ts` (Meter/Minuten) für die Seite `/anfahrt`.

1. Overpass-Abfrage aus `query.txt` als JSON speichern (z. B. https://overpass-api.de/api/interpreter).
2. `python3 build.py osm.json`

Fußwege von den Haltestellen zum Haupteingang werden ohne Stufen (`highway=steps`) berechnet. Daten: © OpenStreetMap-Mitwirkende (ODbL), Abfrage vom 11.11.2026.
