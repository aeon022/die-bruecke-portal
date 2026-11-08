// Eine Serie als Abo-Kalender: webcal://diebruecke.social/serien/<slug>.ics
import type { APIRoute } from 'astro';
import { getSeriesBySlug } from '../../lib/api';
import { buildCalendar } from '../../lib/ics';

export const GET: APIRoute = async ({ params }) => {
  const series = await getSeriesBySlug(params.slug as string);
  if (!series) return new Response('Serie nicht gefunden', { status: 404 });
  return buildCalendar(`Die Brücke – ${series.name}`, series.events);
};
