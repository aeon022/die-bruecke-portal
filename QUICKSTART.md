# 🌉 Die Brücke – Entwickler-Handbuch & Setup

Willkommen im Repository für den Web-Relaunch des soziokulturellen Zentrums "Die Brücke".
Dieses Projekt verwendet eine **Headless-Architektur** mit strikter Trennung von Frontend und Backend.

## 🏗 Tech-Stack & Architektur

| Bereich | Technologie | Beschreibung |
| :--- | :--- | :--- |
| **Frontend** | **Astro** | Hybrid Rendering, Tailwind CSS, Alpine.js. |
| **Backend** | **Directus** | Headless CMS (Node.js API). |
| **Datenbank** | **PostgreSQL** | Hauptdatenbank für Directus. |
| **Cache** | **Redis** | Caching für High-Performance. |
| **Infrastruktur** | **Docker** | Containerisierung aller Backend-Dienste. |
| **Design** | **Pinegrow** | Visueller Editor (integriert via Astro-Plugin). |

---

## 🛠 Voraussetzungen (Lokal / macOS)

Bevor du startest, stelle sicher, dass folgende Tools installiert sind:

1.  **Git** (zur Versionierung)
2.  **Node.js** (Version 20 LTS oder neuer)
3.  **Docker & Docker Compose** (Empfehlung macOS: OrbStack)
4.  **VS Code** (Empfohlen)

---

## 🚀 Installation & Erster Start (Schritt-für-Schritt)

Folge diesen Schritten exakt, um eine leere Datenbank zu vermeiden.

### 1. Repository klonen
Lade den Code auf deinen lokalen Rechner.

```bash
git clone [https://github.com/aeon022/die-bruecke-portal](https://github.com/aeon022/die-bruecke-portal)
cd die-bruecke-porta


2. Backend starten (Infrastruktur)
Wir starten zuerst die Container (Directus, DB, Redis), damit die API verfügbar ist.

Bash

cd backend

# Startet die Container im Hintergrund
docker compose up -d
⏳ Warte kurz: Beim allerersten Start benötigt die Datenbank ca. 30–60 Sekunden zur Initialisierung.

Check: Öffne http://localhost:8055. Wenn du den Login siehst, ist der Server bereit.

Login: admin@example.com / password (siehe .env).l



3. Datenmodell (Schema) laden ⚠️ WICHTIG ⚠️
Dein lokales Directus ist jetzt noch leer. Wir müssen das Datenmodell (Collections, Felder) aus dem gespeicherten Snapshot laden.

Bash

# Befehl im Ordner /backend ausführen:
npx directus schema apply ./schema/snapshot.yaml
Bestätige die Warnung mit y.

Erfolg: Directus hat nun alle Tabellen (Events, Services, etc.).

4. Frontend starten
Nun verbinden wir das Astro-Frontend mit dem laufenden Backend.

Bash

# Wechsel vom backend- in den frontend-Ordner
cd ../frontend

# 1. Abhängigkeiten installieren
npm install

# 2. Entwicklungsserver starten
npm run dev
🎉 Fertig!
Webseite: http://localhost:4321

CMS Admin: http://localhost:8055




äglicher Workflow
Arbeitstag beginnen
Da Docker im Hintergrund läuft, reicht oft der Start von Astro. Wenn du den Rechner neu gestartet hast:

Backend: cd backend && docker compose up -d

Frontend: cd frontend && npm run dev

Datenmodell ändern (Schema Updates)
Wir versionieren Änderungen an der Datenbank-Struktur (z. B. neues Feld "Telefonnummer" bei Events).

Szenario A: Du änderst Felder im Admin-Panel Damit deine Änderungen für andere Entwickler sichtbar werden:

Änderungen im UI (localhost:8055) vornehmen.

Snapshot erstellen:

Bash

cd backend
npx directus schema snapshot ./schema/snapshot.yaml
snapshot.yaml committen und pushen.

Szenario B: Du ziehst Änderungen von anderen (Git Pull) Wenn sich die snapshot.yaml durch einen Pull verändert hat:

Code aktualisieren: git pull

Schema anwenden:

Bash

cd backend
npx directus schema apply ./schema/snapshot.yaml
🆘 Troubleshooting
Fehler: connect ECONNREFUSED 127.0.0.1:8055

Ursache: Der Docker-Container läuft nicht.

Lösung: Prüfe in OrbStack/Docker, ob der Container directus grün/running ist. Führe docker compose up -d im Backend-Ordner aus.

Fehler: Port is already allocated

Ursache: Ein alter Container oder ein anderer Dienst blockiert Port 8055 oder 4321.

Lösung:

Alle Container stoppen: docker compose down (im Backend-Ordner).

Prozesse killen, die den Port nutzen.

Bilder fehlen im Frontend

Ursache: Die PUBLIC_DIRECTUS_URL zeigt nicht auf localhost.

Lösung: Prüfe frontend/.env oder frontend/astro.config.mjs. Sie muss lokal auf http://localhost:8055 zeigen.

Datenbank ist leer / Fehler 500 im Frontend

Ursache: Schema wurde nicht angewendet.

Lösung: Führe Schritt 3 (npx directus schema apply ...) erneut aus.
