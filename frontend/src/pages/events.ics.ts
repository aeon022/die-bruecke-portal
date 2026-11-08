// Ganzes Programm als Abo-Kalender: webcal://diebruecke.social/events.ics
import type { APIRoute } from 'astro';
import { getEvents } from '../lib/api';
import { buildCalendar } from '../lib/ics';

export const GET: APIRoute = async () => buildCalendar('Die Brücke – Programm', await getEvents());
