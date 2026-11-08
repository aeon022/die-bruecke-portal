#!/bin/bash
# Website am Server neu ausrollen: holt main und baut den Container bruecke_beta neu.
# Aufruf am Server (sysuser_1): ~/portal/scripts/deploy.sh  – oder automatisch per GitHub Action (.github/workflows/deploy.yml)
set -euo pipefail
cd "$(dirname "$0")/.."
git pull --ff-only
cd frontend
docker compose up -d --build
# Kurz warten und prüfen, ob die Seite antwortet (sonst Fehler = Action wird rot)
for i in $(seq 1 30); do
  curl -fsS -o /dev/null http://127.0.0.1:4321/ && { echo "OK: bruecke_beta läuft"; exit 0; }
  sleep 2
done
echo "FEHLER: bruecke_beta antwortet nicht" >&2
docker logs bruecke_beta --tail 30 >&2
exit 1
