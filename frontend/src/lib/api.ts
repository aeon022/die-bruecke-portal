// src/lib/api.ts
import { directus } from './directus';
import { readItems, readSingleton } from '@directus/sdk';

// HILFSFUNKTION: Normalisiert Kategorienamen
function getSafeLabel(obj: any) {
  if (!obj) return 'Unbenannt';
  return obj.name || obj.title || obj.label || obj.bezeichnung || obj.titel || 'Kategorie';
}

// FILTER-LOGIK: Im Production-Mode nur veröffentlichte Inhalte zeigen
const statusFilter = import.meta.env.PROD
  ? { status: { _eq: 'published' } }
  : {};

// Helper: Random Element aus Array
function pickRandom<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Holt Events und baut die M2M-Beziehung MANUELL zusammen.
 */
export async function getEvents() {
  try {
    // 1. Hole alle Events (mit Status-Filter!)
    const eventsPromise = directus.request(
      readItems('events', {
        fields: ['*', 'is_highlight'],
        filter: statusFilter,
        sort: ['start_date'], // nächste Termine zuerst
        limit: -1,
      })
    );

    // 2. Hole die Junction Table
    const junctionPromise = directus
      .request(
        readItems('events_event_categories', {
          fields: ['*'],
          limit: -1,
        })
      )
      .catch((err) => {
        console.warn('Konnte Junction Table nicht laden:', err);
        return [];
      });

    // 3. Hole die Kategorien
    const categoriesPromise = directus
      .request(
        readItems('event_categories', {
          fields: ['*'],
          limit: -1,
        })
      )
      .catch(() => []);

    const [events, junctions, categories] = await Promise.all([
      eventsPromise,
      junctionPromise,
      categoriesPromise,
    ]);

    // 4. Mapping
    const catMap = new Map();
    categories.forEach((c: any) => {
      if (c.id) catMap.set(String(c.id), c);
    });

    const relationsMap = new Map<string, string[]>();
    junctions.forEach((rel: any) => {
      // Directus Junction IDs können variieren, wir prüfen beide Richtungen
      const eId = rel.events_id || rel.event_id;
      const cId = rel.event_categories_id || rel.event_category_id || rel.category_id;

      if (eId && cId) {
        const eKey = String(eId);
        if (!relationsMap.has(eKey)) relationsMap.set(eKey, []);
        relationsMap.get(eKey)?.push(String(cId));
      }
    });

    return (events ?? []).map((e: any) => {
      const myCatIds = relationsMap.get(String(e.id)) || [];
      const simulatedRelations = myCatIds.map((cId) => {
        const catObj = catMap.get(cId);
        return {
          event_categories_id: {
            id: cId,
            name: getSafeLabel(catObj),
          },
        };
      });

      return {
        ...e,
        is_highlight: Boolean(e?.is_highlight),
        event_categories: simulatedRelations,
      };
    });
  } catch (error) {
    console.error('Fehler beim Laden der Events:', error);
    return [];
  }
}

export async function getEventCategories() {
  try {
    const cats = await directus.request(readItems('event_categories', { limit: -1 }));
    return (cats ?? []).map((c: any) => ({
      ...c,
      name: getSafeLabel(c),
    }));
  } catch (error) {
    return [];
  }
}

export async function getEventBySlug(slug: string) {
  const all = await getEvents();
  return all.find((e: any) => e.slug === slug) || null;
}

// --- Services Products Global Settings ---

export async function getServices() {
  try {
    return await directus.request(readItems('services')).catch(() => []);
  } catch (error) {
    console.error('Fehler beim Laden der Services:', error);
    return [];
  }
}

export async function getProducts() {
  try {
    return await directus.request(readItems('shop_products')).catch(() => []);
  } catch (error) {
    console.error('Fehler beim Laden der Produkte:', error);
    return [];
  }
}

export async function getGlobalSettings() {
  try {
    return await directus.request(readSingleton('global_settings'));
  } catch (error) {
    console.warn('Global Settings konnten nicht geladen werden.');
    return null;
  }
}

// Holt alle Archiv-Einträge für die Zeitreise.
export async function getArchiv() {
  try {
    const response = await directus.request(
      readItems('archiv', {
        fields: [
          'id', 
          'slug', 
          'title', 
          'description', 
          'teaser', 
          'info_text', 
          'year', 
          'image', 
          'aspect',
          // WICHTIG: Holt die Verknüpfung UND das eigentliche Bild-Objekt
          'gallery.directus_files_id.*', 
          'gallery.*', 
          'category'
        ],
        limit: -1,
      })
    );
    return response;
  } catch (error) {
    console.error('Fehler beim Laden des Archivs:', error);
    return [];
  }
}

// Holt die Blog-Einträge für die News-Seite.
export async function getBlogPosts() {
  try {
    const response = await directus.request(
      readItems('blog', { // HINWEIS: Stelle sicher, dass deine Collection in Directus wirklich 'blog' heißt (vorher war es 'posts')
        fields: [
          'id', 
          'slug', 
          'title', 
          'author', 
          'main_image', 
          'excerpt', 
          'content', 
          'tags', 
          'date_created', 
          'category', 
          'gallery.directus_files_id.*'
        ],
        filter: { status: { _eq: 'published' } },
        sort: ['-date_created'],
        limit: -1,
      })
    );
    return response;
  } catch (error) {
    console.error('Fehler beim Laden des Blogs:', error);
    return [];
  }
}

/**
 * ✅ BLOG SIDEBAR EVENTS
 * - mode: 'highlight' => nur is_highlight=true
 * - mode: 'latest' => neueste Events (nach Datum)
 * - random: true => zufälliges Element aus den geladenen Events
 *
 * Wichtig:
 * - nutzt statusFilter (DEV zeigt auch nicht-published)
 * - lädt mehrere Events (limit) damit random Sinn macht
 */
// Blog Sidebar Event - Highlight random ODER aktuellste Events
export async function getSidebarEvent(options?: {
  mode?: 'highlight' | 'latest';
  limit?: number;
  random?: boolean;
}) {
  try {
    const mode = options?.mode ?? 'latest';
    const limit = options?.limit ?? 10;
    const random = options?.random ?? true;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const response = await directus.request(
      readItems('events', {
        fields: ['title', 'slug', 'description', 'image', 'is_highlight', 'start_date'],
        filter: {
          ...(import.meta.env.PROD ? { status: { _eq: 'published' } } : {}),
        },
        sort: ['start_date'],
        limit: -1 // Wir holen alle verfügbaren für die manuelle Filterung
      })
    );

    let pool = (response || []).filter((e: any) => {
      const dateStr = e.start_date || e.date_start || e.date;
      if (!dateStr) return false;
      const d = new Date(dateStr);
      return d >= today;
    });

    // WICHTIG: Manuelle Filterung auf Highlights, da Checkboxen als Arrays gespeichert sein können
    if (mode === 'highlight') {
      pool = pool.filter(e => 
        e.is_highlight === true || 
        (Array.isArray(e.is_highlight) && e.is_highlight.includes('true'))
      );
    }

    // Fallback: Wenn keine Highlights/Zukünftigen da sind, nimm die aktuellsten
    if (!pool.length) pool = response || [];

    const shortlist = pool.slice(0, limit);
    if (!shortlist.length) return null;

    return random
      ? shortlist[Math.floor(Math.random() * shortlist.length)]
      : shortlist[0];

  } catch (e) {
    console.error("Sidebar Event API Fehler:", e);
    return null;
  }
}

/**
 * Sidebar Service nach Type (z.B. "sozial", "kultur", "verein", "aktion")
 */
export async function getSidebarService(type: string) {
  try {
    const response = await directus.request(
      readItems('services', {
        fields: ['title', 'teaser', 'slug', 'button_text', 'type'],
        filter: { ...statusFilter, type: { _eq: type } },
        limit: 1,
      })
    );
    return response[0] || null;
  } catch (e) {
    return null;
  }
}