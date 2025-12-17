// src/lib/api.ts
import { directus } from './directus';
import { readItems, readSingleton } from '@directus/sdk'; 

// HILFSFUNKTION: Normalisiert Kategorienamen
function getSafeLabel(obj: any) {
    if (!obj) return 'Unbenannt';
    return obj.name || obj.title || obj.label || obj.bezeichnung || obj.titel || 'Kategorie';
}

/**
 * Holt Events und baut die M2M-Beziehung MANUELL zusammen.
 * Das umgeht alle Permission-Probleme bei verschachtelten Abfragen.
 */
export async function getEvents() {
    try {
        // 1. Hole alle Events (inklusive Highlight Checkbox)
        const eventsPromise = directus.request(
            readItems('events', {
                fields: ['*', 'is_highlight'], // Checkbox explizit anfordern!
                sort: ['-start_date'],
                limit: -1
            })
        );

        // 2. Hole die Verknüpfungs-Tabelle (Junction) SEPARAT
        // ACHTUNG: Falls deine Junction-Tabelle anders heißt (z.B. event_categories_events), hier anpassen!
        // Standard in Directus ist meist: events_event_categories
        const junctionPromise = directus.request(
            readItems('events_event_categories', {
                fields: ['*'],
                limit: -1
            })
        ).catch(err => {
            console.warn("Konnte Junction Table nicht laden (Permission?):", err);
            return [];
        });

        // 3. Hole die Kategorien-Definitionen
        const categoriesPromise = directus.request(
            readItems('event_categories', {
                fields: ['*'],
                limit: -1
            })
        ).catch(() => []);

        // Warten bis alles da ist
        const [events, junctions, categories] = await Promise.all([
            eventsPromise, 
            junctionPromise, 
            categoriesPromise
        ]);

        // 4. MAPPING: Wir bauen die Daten selbst zusammen
        
        // A) Kategorien-Map erstellen (ID -> Objekt)
        const catMap = new Map();
        categories.forEach((c: any) => {
            if (c.id) catMap.set(String(c.id), c);
        });

        // B) Verknüpfungen gruppieren (Event ID -> Array von Kategorie IDs)
        const relationsMap = new Map<string, string[]>();
        junctions.forEach((rel: any) => {
            // Finde die ID des Events (heißt meist events_id oder event_id)
            const eId = rel.events_id || rel.event_id;
            // Finde die ID der Kategorie (heißt meist event_categories_id oder category_id)
            const cId = rel.event_categories_id || rel.event_category_id || rel.category_id;

            if (eId && cId) {
                const eKey = String(eId);
                if (!relationsMap.has(eKey)) relationsMap.set(eKey, []);
                relationsMap.get(eKey)?.push(String(cId));
            }
        });

        // C) Events anreichern
        return (events ?? []).map((e: any) => {
            const myCatIds = relationsMap.get(String(e.id)) || [];
            
            // Wir bauen das "event_categories" Array künstlich nach, 
            // damit das Frontend (index.astro) denkt, es käme so aus der API.
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
                // Highlight sicherstellen
                is_highlight: Boolean(e?.is_highlight),
                // M2M Array injizieren
                event_categories: simulatedRelations
            };
        });

    } catch (error) {
        console.error('Fehler beim Laden der Events:', error);
        return [];
    }
}

/**
 * Kategorien-Liste für Filter-Buttons
 */
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

// ... Rest (getEventBySlug, Settings, etc.) bleibt gleich, da getEventBySlug meist nur id braucht.
// Falls getEventBySlug auch M2M braucht, müsste man die Logik dort auch anpassen, 
// aber für die Übersicht/Startseite reicht getEvents.
export async function getEventBySlug(slug: string) {
    // Einfache Variante für Detailseite (hier hoffen wir auf deep fetch oder nutzen getEvents filter)
    // Wenn das auch kaputt ist, nutze einfach:
    const all = await getEvents();
    return all.find((e: any) => e.slug === slug) || null;
}

export async function getGlobalSettings() {
    try {
        return await directus.request(readSingleton('global_settings'));
    } catch (error) {
        return null;
    }
}