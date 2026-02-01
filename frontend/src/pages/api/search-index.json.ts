// Suche Index API Route; generiert einen Suchindex aus verschiedenen Directus-Kollektionen. Bleibt dynamisch, um aktuelle Daten zu gewährleisten. Im Cache für 60 Minuten.
import { directus } from '../../lib/directus';
import { readItems } from '@directus/sdk';

export const prerender = false;

export async function GET() {
  try {
    // Helper für sichere Abfragen
    const fetchCollection = async (collection: string, fields: string[]) => {
        try {
            return await directus.request(readItems(collection, { 
                fields: fields,
                filter: { status: { _eq: 'published' } }
            }));
        } catch (err) {
            console.error(`Error loading ${collection}:`, err);
            return []; 
        }
    };

    const [events, projects, services, blog, camps, cityTrips, archiv] = await Promise.all([
      fetchCollection('events', ['title', 'slug', 'description']),
      fetchCollection('projects', ['title', 'slug', 'description']),
      fetchCollection('services', ['title', 'slug', 'description']),
      // Blog: 'excerpt' statt 'teaser' (laut Screenshot)
      fetchCollection('blog', ['title', 'slug', 'excerpt']), 
      fetchCollection('camps', ['title', 'slug', 'description']),
      fetchCollection('city_trips', ['title', 'slug', 'description']),
      // Archiv: 'description' und 'teaser' (laut Screenshot)
      fetchCollection('archiv', ['title', 'slug', 'description', 'teaser'])
    ]);

    const staticPages = [
      { title: 'Startseite', url: '/', type: 'Seite', desc: 'Willkommen bei der Brücke' },
      { title: 'Über uns', url: '/about', type: 'Seite', desc: 'Team, Geschichte & Leitbild' },
      { title: 'Kontakt', url: '/contact', type: 'Seite', desc: 'Anfahrt & Öffnungszeiten' },
      { title: 'Infozentrum', url: '/info', type: 'Seite', desc: 'Beratung & Unterstützung' },
      { title: 'Mitmachen', url: '/join', type: 'Seite', desc: 'Jobs, Ehrenamt & Zivildienst' },
      { title: 'City Trips Übersicht', url: '/city-trips', type: 'Seite', desc: 'Städtereisen entdecken' },
      { title: 'Camps Übersicht', url: '/camps', type: 'Seite', desc: 'Alle Camps auf einen Blick' },
      { title: 'Archiv', url: '/archiv', type: 'Seite', desc: 'Vergangene Projekte & Berichte' },
    ];

    const searchIndex = [
      ...staticPages,
      ...events.map((e: any) => ({
        title: e.title,
        url: `/events/${e.slug}`,
        type: 'Event',
        desc: e.description?.replace(/<[^>]*>/g, '').substring(0, 100)
      })),
      ...projects.map((p: any) => ({
        title: p.title,
        url: `/projects/${p.slug}`,
        type: 'Projekt',
        desc: p.description?.replace(/<[^>]*>/g, '').substring(0, 100)
      })),
      ...services.map((s: any) => ({
        title: s.title,
        url: `/services/${s.slug}`,
        type: 'Service',
        desc: s.description?.replace(/<[^>]*>/g, '').substring(0, 100)
      })),
      ...blog.map((p: any) => ({
        title: p.title,
        url: `/blog/${p.slug}`,
        type: 'Blog',
        desc: p.excerpt || ''
      })),
      ...camps.map((c: any) => ({
        title: c.title,
        url: `/camps/${c.slug}`,
        type: 'Camp',
        desc: c.description?.replace(/<[^>]*>/g, '').substring(0, 100)
      })),
      ...cityTrips.map((c: any) => ({
        title: c.title,
        url: `/city-trips/${c.slug}`,
        type: 'City Trip',
        desc: c.description?.replace(/<[^>]*>/g, '').substring(0, 100)
      })),
      ...archiv.map((a: any) => ({
        title: a.title,
        url: `/archiv/${a.slug}`,
        type: 'Archiv',
        desc: (a.teaser || a.description || '').replace(/<[^>]*>/g, '').substring(0, 100)
      }))
    ];

    return new Response(JSON.stringify(searchIndex), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        // PRODUKTION: 1 Stunde Cache (3600s)
        'Cache-Control': 'public, max-age=3600, s-maxage=3600'
      }
    });

  } catch (error) {
    console.error('Search Index Error:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate index' }), { status: 500 });
  }
}