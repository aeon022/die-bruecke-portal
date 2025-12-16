import { createDirectus, rest } from '@directus/sdk';
import type { Schema } from './types';

// Wir verbinden uns mit dem lokalen Docker Container
export const directus = createDirectus<Schema>('http://localhost:8055')
    .with(rest());