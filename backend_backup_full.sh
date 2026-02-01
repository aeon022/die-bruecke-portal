#!/bin/bash

# ==========================================
# BACKUP SKRIPT: DIE BRÜCKE (FULL STACK)
# ==========================================

# 1. Konfiguration & Pfade
# ------------------------------------------
# Aktuelles Datum und Uhrzeit (YYYY-MM-DD_HH-MM-SS)
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")

# Basis-Pfad für Backups
BACKUP_ROOT="./backend/backup"

# Ziel-Ordner für dieses spezifische Backup
TARGET_DIR="$BACKUP_ROOT/$TIMESTAMP"

# Farben für die Konsole
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Starte Backup Prozess: $TIMESTAMP ===${NC}"

# 2. Ordner erstellen
# ------------------------------------------
if [ ! -d "$TARGET_DIR" ]; then
  mkdir -p "$TARGET_DIR"
  echo "✅ Backup-Ordner erstellt: $TARGET_DIR"
else
  echo -e "${RED}❌ Fehler: Ordner existiert bereits.${NC}"
  exit 1
fi

# 3. Directus Schema Snapshot (Struktur)
# ------------------------------------------
echo "🔄 Erstelle Schema Snapshot..."
# Wir führen den Befehl im Container aus, leiten den Output aber direkt in die lokale Datei
docker compose exec -T directus npx directus schema snapshot --format yaml > "$TARGET_DIR/snapshot.yaml"

if [ $? -eq 0 ]; then
  echo "✅ Schema Snapshot gespeichert: snapshot.yaml"
else
  echo -e "${RED}❌ Fehler beim Schema Snapshot.${NC}"
  exit 1
fi

# 4. Datenbank Dump (Inhalt)
# ------------------------------------------
echo "🔄 Erstelle Datenbank Dump..."
# Dump der gesamten 'directus' Datenbank
docker compose exec -T database pg_dump -U directus directus > "$TARGET_DIR/database_full.sql"

if [ $? -eq 0 ]; then
  echo "✅ Datenbank Dump gespeichert: database_full.sql"
else
  echo -e "${RED}❌ Fehler beim Datenbank Dump.${NC}"
  exit 1
fi

# 5. Uploads archivieren (Bilder & Dateien)
# ------------------------------------------
echo "🔄 Zippe Uploads Ordner..."

# Wir prüfen, ob 'zip' installiert ist, sonst nehmen wir 'tar' (Standard auf Linux)
if command -v zip &> /dev/null; then
    # Zip erstellen (-r rekursiv, -q quiet)
    zip -r -q "$TARGET_DIR/uploads.zip" ./backend/uploads
    echo "✅ Uploads gezippt: uploads.zip"
else
    # Fallback auf tar.gz (besser für Linux-Berechtigungen)
    tar -czf "$TARGET_DIR/uploads.tar.gz" -C ./backend uploads
    echo "✅ Uploads archiviert (tar.gz): uploads.tar.gz (Zip war nicht installiert)"
fi

# 6. Abschluss
# ------------------------------------------
echo -e "${GREEN}=== Backup erfolgreich abgeschlossen! ===${NC}"
echo "Pfad: $TARGET_DIR"
ls -lh "$TARGET_DIR"
