import { createDirectus, rest } from '@directus/sdk';
import type { Schema } from './directus-types'; // Stelle sicher, dass diese Datei existiert, sonst entfern die Zeile und nutze <any>

// STRICT LIVE STRATEGY
// Wir nutzen Astro-Standard (import.meta.env).
// Fallback ist IMMER die Live-URL, kein lokaler Docker-Container-Quatsch.
const DIRECTUS_URL = import.meta.env.DIRECTUS_URL || 'https://api.diebruecke.social';

// Optional: Logging nur im Dev-Mode, um sicherzugehen
if (import.meta.env.DEV) {
    console.log(`[Directus] Connecting to: ${DIRECTUS_URL}`);
}

export const directus = createDirectus<Schema>(DIRECTUS_URL)
  .with(rest());