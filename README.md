# Die Brücke – Soziokulturelles Zentrum (Relaunch 2025)

Willkommen im Monorepo für den Web-Relaunch von "Die Brücke".
Dieses Projekt ist ein inklusives, barrierefreies Web-Portal, das kulturelle Angebote mit sozialen Dienstleistungen verbindet.

## 🏗 Architektur & Tech-Stack

Das Projekt folgt einer strikten **Headless-Architektur**. Frontend und Backend sind entkoppelt und laufen in separaten Umgebungen.

| Bereich | Technologie | Beschreibung |
| :--- | :--- | :--- |
| **Frontend** | **Astro** | Hybrid Rendering, Tailwind CSS, Alpine.js. |
| **Backend** | **Directus** | Headless CMS (Node.js), API-First. |
| **Datenbank** | **PostgreSQL** | Relationale Datenbank für Directus. |
| **Cache** | **Redis** | Caching für Performance. |
| **Design** | **Pinegrow** | Visueller Editor (integriert via Astro-Plugin). |
| **Shop** | **Snipcart** | Client-side Shopping Cart. |
| **Tickets** | **Pretix** | Widget-Integration für Event-Tickets. |
| **Infra** | **Docker** | Containerisierung aller Backend-Dienste. |

---

## 📂 Projektstruktur

```text
/
├── backend/            # Docker-Setup & Directus Konfiguration
│   ├── docker-compose.yml
│   └── schema/         # Datenmodell-Snapshots (WICHTIG!)
├── frontend/           # Astro Applikation
│   ├── src/
│   ├── public/
│   └── pinegrow.json
└── README.md           # Diese Datei# Die Brücke Portal
