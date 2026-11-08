import { directus } from '../lib/directus';
import { readItems } from '@directus/sdk';

const SITE_URL = 'https://diebruecke.social';

// Hilfsfunktion für XML-Einträge
const createUrlEntry = (path: string, lastMod?: string, priority = 0.5) => {
    return `
    <url>
        <loc>${SITE_URL}${path}</loc>
        ${lastMod ? `<lastmod>${lastMod.split('T')[0]}</lastmod>` : ''}
        <priority>${priority}</priority>
    </url>`;
};

export async function GET() {
    // 1. Statische Seiten (Manuell definieren)
    const staticPages = [
        { path: '/', priority: 1.0 },
        { path: '/about', priority: 0.8 },
        { path: '/contact', priority: 0.8 },
        { path: '/info', priority: 0.9 },
        { path: '/services', priority: 0.9 },
        { path: '/events', priority: 0.9 },
        { path: '/serien', priority: 0.8 },
        { path: '/blog', priority: 0.6 },
        { path: '/camps', priority: 0.6 },
        { path: '/city-trips', priority: 0.6 },
        { path: '/archiv', priority: 0.5 },
        { path: '/projects', priority: 0.7 },
        { path: '/join', priority: 0.6 },
        { path: '/shop', priority: 0.7 },
        { path: '/zeitung', priority: 0.6 },
        { path: '/impressum', priority: 0.1 },
        { path: '/datenschutz', priority: 0.1 },
    ];

    let xmlString = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    // A. Statische Seiten hinzufügen
    staticPages.forEach(page => {
        xmlString += createUrlEntry(page.path, undefined, page.priority);
    });

    // B. Dynamische Inhalte aus Directus laden (Parallel für Performance)
    try {
        // Nur Felder abfragen, die es gibt (date_updated fehlt in Directus → früher fiel der ganze dynamische Teil weg)
        const list = (collection: string, filter: any = { status: { _eq: 'published' } }) =>
            directus.request(readItems(collection, { fields: ['slug'], filter, limit: -1 })).catch((e) => {
                console.error(`Sitemap: ${collection} nicht lesbar`, e?.errors?.[0]?.message || e);
                return [];
            });
        const [events, services, projects, posts, series, camps, cityTrips] = await Promise.all([
            list('events'), list('services'), list('projects'), list('blog'), list('event_series', {}), list('camps'), list('city_trips'),
        ]);

        camps?.forEach((item: any) => { xmlString += createUrlEntry(`/camps/${item.slug}`, undefined, 0.6); });
        cityTrips?.forEach((item: any) => { xmlString += createUrlEntry(`/city-trips/${item.slug}`, undefined, 0.6); });
        series?.forEach((item: any) => {
            xmlString += createUrlEntry(`/serien/${item.slug}`, undefined, 0.7);
        });

        // C. Dynamische URLs generieren
        events?.forEach((item: any) => {
            xmlString += createUrlEntry(`/events/${item.slug}`, item.date_updated, 0.7);
        });

        services?.forEach((item: any) => {
            xmlString += createUrlEntry(`/services/${item.slug}`, item.date_updated, 0.8);
        });

        projects?.forEach((item: any) => {
            xmlString += createUrlEntry(`/projects/${item.slug}`, item.date_updated, 0.6);
        });
        
        posts?.forEach((item: any) => {
            xmlString += createUrlEntry(`/blog/${item.slug}`, item.date_updated, 0.6);
        });

    } catch (error) {
        console.error("Fehler beim Generieren der Sitemap:", error);
    }

    xmlString += `</urlset>`;

    return new Response(xmlString, {
        headers: {
            'Content-Type': 'application/xml',
            'Cache-Control': 'public, max-age=3600' // 1 Stunde Cache
        }
    });
}