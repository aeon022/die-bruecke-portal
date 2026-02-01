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
        { path: '/projects', priority: 0.7 },
        { path: '/join', priority: 0.6 },
        { path: '/shop', priority: 0.7 },
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
        const [events, services, projects, posts] = await Promise.all([
            // Events
            directus.request(readItems('events', { 
                fields: ['slug', 'date_updated'],
                filter: { status: { _eq: 'published' } }
            })),
            // Services (Soziales)
            directus.request(readItems('services', { 
                fields: ['slug', 'date_updated'],
                filter: { status: { _eq: 'published' } }
            })),
            // Projekte
            directus.request(readItems('projects', { 
                fields: ['slug', 'date_updated'],
                filter: { status: { _eq: 'published' } }
            })),
            // Blog Posts (falls vorhanden)
            directus.request(readItems('posts', { 
                fields: ['slug', 'date_updated'],
                filter: { status: { _eq: 'published' } }
            })).catch(() => []) // Fallback, falls Collection noch leer
        ]);

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