# frontend/Dockerfile

# 1. Bauen
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# WICHTIG: Die URL muss zur Bauzeit bekannt sein für statische Teile, 
# aber wir überschreiben sie zur Laufzeit für SSR
ARG DIRECTUS_URL
ENV DIRECTUS_URL=${DIRECTUS_URL}
RUN npm run build

# 2. Ausführen
FROM node:20-alpine AS runtime
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

ENV HOST=0.0.0.0
ENV PORT=4321
EXPOSE 4321

CMD ["node", "./dist/server/entry.mjs"]