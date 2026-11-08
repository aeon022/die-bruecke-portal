// Serien (Directus event_series): Farbe als Akzent, Schrift je nach Helligkeit hell oder dunkel.

/** Dunkle Schrift auf hellen Serienfarben (Gelb, Lime), sonst weiß. */
export function seriesTextColor(hex?: string | null): string {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex || '');
  if (!m) return '#ffffff';
  const n = parseInt(m[1], 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  // wahrgenommene Helligkeit (YIQ)
  return (r * 299 + g * 587 + b * 114) / 1000 > 150 ? '#0f172a' : '#ffffff';
}

/** Inline-Style für Etiketten/Flächen in Serienfarbe; ohne Farbe = Brücke-Dunkelblau. */
export function seriesStyle(series: any): string {
  const bg = series?.color || '#0f172a';
  return `background-color:${bg};color:${seriesTextColor(bg)}`;
}
