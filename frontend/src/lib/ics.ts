// Abo-Kalender (.ics): alle kommenden Termine (12 Monate), wiederkehrende Events einzeln aufgelöst.
import { eventDates } from './recurrence';

const fmt = (d: Date) => d.toISOString().replace(/-|:|\.\d\d\d/g, '');
const esc = (t: string) => String(t || '').replace(/[\;,]/g, (m) => '\\' + m).replace(/\r?\n/g, '\\n');
// RFC 5545: Zeilen max. 75 Oktette, Fortsetzung mit Leerzeichen
// shortcut: zählt Zeichen statt Bytes (Umlaute = 2 Bytes); Kalender-Apps tolerieren das, sonst Byte-genau falten
const fold = (line: string) => line.match(/.{1,73}/gu)?.join('\r\n ') ?? line;

export function buildCalendar(name: string, events: any[]): Response {
  const now = new Date();
  const until = new Date(now.getTime() + 365 * 24 * 3600 * 1000);
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Die Bruecke Graz//Events//DE', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
    `X-WR-CALNAME:${esc(name)}`, 'X-WR-TIMEZONE:Europe/Vienna', 'REFRESH-INTERVAL;VALUE=DURATION:PT12H', 'X-PUBLISHED-TTL:PT12H'];
  for (const e of events) {
    const start = new Date(e.start_date);
    const duration = e.end_date ? new Date(e.end_date).getTime() - start.getTime() : 2 * 3600 * 1000;
    for (const d of eventDates(e).filter((x) => x >= now && x <= until)) {
      const url = `https://diebruecke.social/events/${e.slug}`;
      lines.push('BEGIN:VEVENT', `UID:${e.slug}-${fmt(d)}@diebruecke.social`, `DTSTAMP:${fmt(now)}`,
        `DTSTART:${fmt(d)}`, `DTEND:${fmt(new Date(d.getTime() + duration))}`, `SUMMARY:${esc(e.title)}`,
        `LOCATION:${esc('Die Brücke, Grabenstraße 39a, 8010 Graz')}`, `URL:${url}`,
        `DESCRIPTION:${esc((e.series?.name ? e.series.name + ' · ' : '') + 'Infos und Tickets: ' + url)}`, 'END:VEVENT');
    }
  }
  lines.push('END:VCALENDAR');
  return new Response(lines.map(fold).join('\r\n'), {
    headers: { 'Content-Type': 'text/calendar; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
  });
}
