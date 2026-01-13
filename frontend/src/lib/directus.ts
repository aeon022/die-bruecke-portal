import { createDirectus, rest } from '@directus/sdk';
import type { Schema } from './directus-types'; // <--- Importiert unsere generierten Typen

// Wir lesen die URL aus der Umgebung oder Fallback auf localhost
const DIRECTUS_URL = import.meta.env.DIRECTUS_URL || 'https://api.diebruecke.social';

export const directus = createDirectus<Schema>(DIRECTUS_URL) // <--- <Schema> macht die Magie
  .with(rest());