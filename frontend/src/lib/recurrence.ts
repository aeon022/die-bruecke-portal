// Termine wiederkehrender Events (weekly/biweekly/monthly, monthly_type 'weekday' = z. B. jeder 1. Dienstag).
// Eine Stelle für Kalender, Startseite, Detailseite und .ics.
import pkg from 'rrule';
const { RRule } = pkg;

const DAYS = [RRule.SU, RRule.MO, RRule.TU, RRule.WE, RRule.TH, RRule.FR, RRule.SA];

/** Alle Termine eines Events (Einzeltermin = ein Datum). Uhrzeit wie im Startdatum. */
export function eventDates(event: any): Date[] {
  const start = new Date(event.start_date);
  if (!event.recurrence || event.recurrence === 'none' || !event.recurrence_end) return [start];

  // Enddatum ohne Uhrzeit gilt bis Tagesende (sonst fällt der letzte Termin weg, z. B. Stammtisch 02.02.)
  const until = new Date(event.recurrence_end);
  if (!/T\d/.test(String(event.recurrence_end))) until.setHours(23, 59, 59);
  const opts: any = { freq: RRule.WEEKLY, interval: 1, dtstart: start, until };
  if (event.recurrence === 'biweekly') opts.interval = 2;
  if (event.recurrence === 'monthly') {
    opts.freq = RRule.MONTHLY;
    if (event.monthly_type === 'weekday') {
      opts.byweekday = DAYS[start.getDay()];
      opts.bysetpos = Math.ceil(start.getDate() / 7);
    }
  }
  return new RRule(opts).all().map((d) => {
    const fixed = new Date(d);
    fixed.setHours(start.getHours(), start.getMinutes());
    return fixed;
  });
}

/** Nächster Termin ab heute (00:00); sonst der letzte. */
export function nextEventDate(event: any): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dates = eventDates(event);
  return dates.find((d) => d >= today) || dates[dates.length - 1];
}
