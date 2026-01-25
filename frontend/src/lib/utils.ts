export function cleanText(html: string | null | undefined) {
    if (!html) return '';
    
    // 1. Tags durch Leerzeichen ersetzen
    let text = html.replace(/<[^>]*>?/gm, ' ');
    
    // 2. Gängige Entities manuell decodieren
    const entities: Record<string, string> = {
        '&nbsp;': ' ', '&amp;': '&', '&quot;': '"', '&lt;': '<', '&gt;': '>',
        '&auml;': 'ä', '&Auml;': 'Ä', '&ouml;': 'ö', '&Ouml;': 'Ö', 
        '&uuml;': 'ü', '&Uuml;': 'Ü', '&szlig;': 'ß', '&bdquo;': '„', '&ldquo;': '“',
        '&#8211;': '–', '&#8217;': '’'
    };
    
    text = text.replace(/&[a-zA-Z0-9#]+;/g, (key) => entities[key] || key);
    
    // 3. Doppelte Leerzeichen entfernen und trimmen
    return text.replace(/\s+/g, ' ').trim();
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