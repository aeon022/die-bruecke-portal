#!/bin/bash

# ==========================================
# BACKUP LIGHT (NUR DATENBANK & SCHEMA)
# ==========================================

TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_ROOT="./backend/backup"
TARGET_DIR="$BACKUP_ROOT/${TIMESTAMP}_light" # Ordnername markiert als light

# Farben
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}=== Starte LIGHT Backup: $TIMESTAMP ===${NC}"

# Ordner erstellen
mkdir -p "$TARGET_DIR"

# 1. Schema Snapshot (Wichtig für Struktur)
docker compose exec -T directus npx directus schema snapshot --format yaml > "$TARGET_DIR/snapshot.yaml"

# 2. Datenbank Dump (Wichtig für Inhalt)
# Wir nutzen pg_dump, da es klein und schnell ist
docker compose exec -T database pg_dump -U directus directus > "$TARGET_DIR/database.sql"

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Datenbank erfolgreich gesichert.${NC}"
else
  echo -e "${RED}❌ Fehler beim DB Dump.${NC}"
  exit 1
fi

echo -e "${GREEN}=== Light Backup fertig! ===${NC}"
echo "Pfad: $TARGET_DIR"
