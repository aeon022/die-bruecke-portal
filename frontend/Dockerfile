# frontend/Dockerfile

# --- Stage 1: Builder ---
FROM node:20-alpine AS builder
WORKDIR /app

# Abhängigkeiten installieren
COPY package*.json ./
RUN npm ci

# Quellcode kopieren
COPY . .

# Umgebungsvariablen für den Build (Astro braucht das manchmal beim Build)
ARG DIRECTUS_URL
ENV DIRECTUS_URL=${DIRECTUS_URL}

# Bauen (erzeugt den dist/ Ordner)
RUN npm run build

# --- Stage 2: Runtime (Schlankes Image) ---
FROM node:20-alpine AS runtime
WORKDIR /app

# Nur die nötigen Dateien aus dem Builder holen
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Environment Setup
ENV HOST=0.0.0.0
ENV PORT=4321
EXPOSE 4321

# Startbefehl (Startet den Node-Adapter im Standalone Mode)
CMD ["node", "./dist/server/entry.mjs"]