// src/lib/api.ts
import { directus } from './directus';
import { readItems, readSingleton } from '@directus/sdk'; 

// HILFSFUNKTION: Normalisiert Kategorienamen
function getSafeLabel(obj: any) {
    if (!obj) return 'Unbenannt';
    return obj.name || obj.title || obj.label || obj.bezeichnung || obj.titel || 'Kategorie';
}

// FILTER-LOGIK: Im Production-Mode nur veröffentlichte Events zeigen
const statusFilter = import.meta.env.PROD 
  ? { status: { _eq: 'published' } } 
  : {};

/**
 * Holt Events und baut die M2M-Beziehung MANUELL zusammen.
 */
export async function getEvents() {
    try {
        // 1. Hole alle Events (mit Status-Filter!)
        const eventsPromise = directus.request(
            readItems('events', {
                fields: ['*', 'is_highlight'], 
                filter: statusFilter, // <--- HIER EINGEFÜGT
                sort: ['start_date'], // Empfehlung: Aufsteigend sortieren (nächste Termine zuerst), statt -start_date
                limit: -1
            })
        );

        // 2. Hole die Junction Table
        const junctionPromise = directus.request(
            readItems('events_event_categories', {
                fields: ['*'],
                limit: -1
            })
        ).catch(err => {
            console.warn("Konnte Junction Table nicht laden:", err);
            return [];
        });

        // 3. Hole die Kategorien
        const categoriesPromise = directus.request(
            readItems('event_categories', {
                fields: ['*'],
                limit: -1
            })
        ).catch(() => []);

        const [events, junctions, categories] = await Promise.all([
            eventsPromise, 
            junctionPromise, 
            categoriesPromise
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
            const simulatedRelations = myCatIds.map(cId => {
                const catObj = catMap.get(cId);
                return {
                    event_categories_id: {
                        id: cId,
                        name: getSafeLabel(catObj)
                    }
                };
            });

            return {
                ...e,
                is_highlight: Boolean(e?.is_highlight),
                event_categories: simulatedRelations
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
            name: getSafeLabel(c)
        }));
    } catch (error) {
        return [];
    }
}

export async function getEventBySlug(slug: string) {
    // Wir nutzen getEvents(), damit auch hier die M2M-Relationen sauber aufgelöst sind
    const all = await getEvents();
    return all.find((e: any) => e.slug === slug) || null;
}

// --- Services Products Global Settings ---

export async function getServices() {
    try {
        // Falls die Collection 'services' noch nicht existiert, fangen wir den Fehler ab
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
        // Singleton existiert vielleicht noch nicht oder ist leer
        console.warn('Global Settings konnten nicht geladen werden.');
        return null;
    }
}



// Holt alle Archiv-Einträge für die Zeitreise.

export async function getArchiv() {
    try {
        const response = await directus.request(
            readItems('archiv', {
                // In deiner api.ts bei getArchiv()
                fields: ['id', 'slug', 'title', 'description', 'teaser', 'info_text', 'year', 'image', 'aspect', 'category'],
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
            readItems('blog', {
                fields: ['id', 'slug', 'title', 'author', 'main_image', 'excerpt', 'content', 'tags', 'date_created'],
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

// Blog Logik - Einfach das aktuellste Event holen (ohne Checkbox-Filter)
export async function getSidebarEvent() {
    try {
        const response = await directus.request(
            readItems('events', {
                fields: ['title', 'slug', 'description', 'image'],
                filter: { status: { _eq: 'published' } },
                limit: 1,
                sort: ['-start_date'] // Das zeitlich nächste/aktuellste zuerst
            })
        );
        return response[0] || null;
    } catch (e) {
        console.error("Sidebar Event API Fehler:", e);
        return null;
    }
}

export async function getSidebarService(type: string) {
    try {
        const response = await directus.request(
            readItems('services', {
                fields: ['title', 'teaser', 'slug', 'button_text'],
                filter: { status: { _eq: 'published' }, type: { _eq: type } },
                limit: 1
            })
        );
        return response[0] || null;
    } catch (e) {
        return null;
    }
}