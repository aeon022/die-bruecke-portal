import he from 'he'; // Importiere das gesamte Modul als Standard-Export
const { decode } = he; // Extrahiere die 'decode'-Funktion aus dem Standard-Export

export function cleanText(html: string | null | undefined) {
    if (!html) return '';

    // 1. HTML-Tags entfernen
    const textWithTagsRemoved = html.replace(/<[^>]*>?/gm, ' ');

    // 2. HTML-Entities (z.B. &amp;) mit einer robusten Bibliothek dekodieren
    const decodedText = decode(textWithTagsRemoved);

    // 3. Mehrfache Leerzeichen reduzieren und trimmen
    return decodedText.replace(/\s+/g, ' ').trim();
}

export function formatEventDate(dateObj: Date, timeStr?: string) {
    const day = dateObj.toLocaleDateString('de-DE', { day: '2-digit', month: 'short' }).toUpperCase();
    
    let time = "";
    if (timeStr) {
        time = timeStr.slice(0, 5);
    }
    
    if (!time || time === "00:00") {
        return day;
    }
    return `${day} • ${time}`;
}

// "Image Turbo" (Bilder-Optimierung) Hilfsfunktion

export function getOptimizedImage(id, width = 800) {
  if (!id) return null;
  const ASSET_URL = "https://api.diebruecke.social/assets";
  // Wir erzwingen WebP, setzen die Breite und eine gute Kompression
  return `${ASSET_URL}/${id}?width=${width}&format=webp&quality=80`;
}