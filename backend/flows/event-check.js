// Directus-Flow „Event-Prüfung“ (blockierend, vor dem Speichern). Gibt immer das Payload zurück.
// Gleich wie frontend/src/lib/cleanHtml.ts (Word-Reste entfernen)
function cleanHtml(html) {
  if (!html) return '';
  var s = String(html)
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

module.exports = function (data) {
  var t = data.$trigger || {};
  var p = Object.assign({}, t.payload || {});
  var item = data.read_item;
  if (Array.isArray(item)) item = item[0];
  if (!item || typeof item !== 'object' || item.errors) item = {};
  if (typeof p.description === 'string') p.description = cleanHtml(p.description);
  var m = Object.assign({}, item, p); // Stand nach dem Speichern

  // 1) Serie vorschlagen, wenn leer (nur Titel-Regeln, die eindeutig sind)
  var rules = [
    [/mord vor ort|theater mobil|offenes impro/i, 7],
    [/stammtisch|un\+plugged/i, 8],
    [/iris h(ö|oe)rt zu/i, 15],
    [/murw(ä|ae)rts/i, 9],
    [/kabarett cuv/i, 16],
    [/stagedive/i, 11], [/sofakino/i, 14], [/kleinlaut/i, 13], [/stadtlandklang/i, 10], [/allerwelt/i, 12],
    [/blaumachen/i, 1], [/feierabend/i, 2], [/liedgut/i, 3], [/fernweh/i, 4], [/saitensprung/i, 5], [/lachanfall/i, 6]
  ];
  if (!m.series && m.title) {
    for (var i = 0; i < rules.length; i++) {
      if (rules[i][0].test(m.title)) { p.series = rules[i][1]; break; }
    }
  }

  // 2) Nicht veröffentlichen ohne Bild und Beginn
  var publishing = p.status === 'published' || (m.status === 'published' && ('image' in p || 'start_date' in p));
  if (publishing) {
    var missing = [];
    if (!m.image) missing.push('Bild');
    if (!m.start_date) missing.push('Beginn (Datum/Uhrzeit)');
    if (missing.length) throw new Error('Veröffentlichen nicht möglich – es fehlt: ' + missing.join(', ') + '. Bitte ergänzen oder als Entwurf speichern.');
  }
  return p;
};
