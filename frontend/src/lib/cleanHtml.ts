// Aus Word/Pages kopierte Texte bereinigen: Schriftarten, Farben, mso-Angaben, Klassen und leere Hüllen weg;
// Absätze, Fett/Kursiv, Listen, Überschriften und Links bleiben. Gleiche Logik im Directus-Flow „Event-Prüfung“
// (backend/flows/event-check.js), damit neue Texte schon sauber gespeichert werden.
export function cleanHtml(html?: string | null): string {
  if (!html) return '';
  let s = String(html)
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<(style|script|xml|meta|link)\b[\s\S]*?(<\/\1>|\/?>)/gi, '')
    .replace(/<\/?o:p[^>]*>/gi, '')
    .replace(/<\/?(font|span)\b[^>]*>/gi, '') // nur Hüllen für Formatierung
    .replace(/\s(style|class|lang|face|size|color|align|dir|id)\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '');
  // zerstückelte Formatierung zusammenführen: </strong><strong> → nichts
  s = s.replace(/<\/(strong|b|em|i)>(\s*)<\1>/gi, '$2');
  // leere Absätze aus Word (&nbsp;) entfernen
  s = s.replace(/<p>(\s|&nbsp;| |<br\s*\/?>)*<\/p>/gi, '');
  return s.trim();
}
