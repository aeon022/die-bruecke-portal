import { createDirectus, rest } from '@directus/sdk';

// Wir verbinden uns mit dem lokalen Docker Container
// Da Astro server-seitig (SSR) läuft, kommt es an 'localhost:8055' ran.
export const directus = createDirectus('http://localhost:8055').with(rest());