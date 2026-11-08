// Directus-Flow „Event-Prüfung“ (blockierend, vor dem Speichern). Gibt immer das Payload zurück.
module.exports = function (data) {
  var t = data.$trigger || {};
  var p = Object.assign({}, t.payload || {});
  var item = data.read_item;
  if (Array.isArray(item)) item = item[0];
  if (!item || typeof item !== 'object' || item.errors) item = {};
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
