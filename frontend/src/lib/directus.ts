import { createDirectus, rest } from '@directus/sdk';
import type { Schema } from './directus-types';

// FIX: Runtime-Variable bevorzugen!
// 1. process.env.DIRECTUS_URL -> Liest LIVE aus dem Docker Container (http://directus:8055)
// 2. import.meta.env.DIRECTUS_URL -> Fallback für Build/Lokal (https://api...)
const runtimeUrl = (typeof process !== 'undefined' && process.env.DIRECTUS_URL) 
    ? process.env.DIRECTUS_URL 
    : import.meta.env.DIRECTUS_URL;

const DIRECTUS_URL = runtimeUrl || 'https://api.diebruecke.social';

// Debugging (nur am Server sichtbar in den Docker Logs)
if (typeof process !== 'undefined' && process.env.NODE_ENV === 'production') {
    console.log(`[Directus Client] Init mit URL: ${DIRECTUS_URL}`);
}

export const directus = createDirectus<Schema>(DIRECTUS_URL)
  .with(rest());