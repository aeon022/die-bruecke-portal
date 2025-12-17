// src/lib/api.ts
import { directus } from './directus';
import { readItems, readSingleton } from '@directus/sdk'; 

/**
 * Holt alle Events inklusive der Checkbox 'is_highlight' und M2M Kategorien
 */
export async function getEvents() {
    try {
        const events = await directus.request(
            readItems('events', {
                // Wichtig: is_highlight explizit dabei + M2M Felder per dot-notation
                fields: [
                    '*',
                    'is_highlight',
                    'event_categories.*',
                    'event_categories.event_categories_id.*'
                ],
                sort: ['-start_date']
            })
        );

        // Normalisieren (Directus kann bei Checkboxen je nach DB/Config auch 0/1 liefern)
        return (events ?? []).map((e: any) => ({
            ...e,
            is_highlight: Boolean(e?.is_highlight)
        }));
    } catch (error) {
        console.error('Fehler beim Laden der Events:', error);
        return [];
    }
}

/**
 * Holt ein einzelnes Event anhand des Slugs
 */
export async function getEventBySlug(slug: string) {
    try {
        const events = await directus.request(
            readItems('events', {
                filter: { slug: { _eq: slug } },
                fields: [
                    '*',
                    'is_highlight',
                    'event_categories.*',
                    'event_categories.event_categories_id.*'
                ],
                limit: 1
            })
        );

        const event = events?.[0] ?? null;
        if (!event) return null;

        return {
            ...event,
            is_highlight: Boolean((event as any)?.is_highlight)
        } as any;
    } catch (error) {
        console.error(`Fehler beim Laden des Events mit Slug ${slug}:`, error);
        return null;
    }
}

/**
 * Holt alle Event-Kategorien (für Filter-Buttons etc.)
 */
export async function getEventCategories() {
    try {
        const cats = await directus.request(
            readItems('event_categories', {
                // bewusst '*' damit wir nicht von einem konkreten Label-Feld (name/title/label) abhängig sind
                fields: ['*'],
                // alle holen (Directus default limit kann sonst greifen)
                limit: -1
                // kein sort hier: sort auf nicht-existentem Feld (z.B. keine "id") kann 400 werfen und dann hast du 0 Kategorien
            })
        );

        // Optionales Label normalisieren (hilft im Frontend beim Anzeigen)
        return (cats ?? []).map((c: any) => {
            const id = c?.id ?? c?.event_categories_id ?? c?.category_id ?? c?.uuid ?? c?.key ?? c?.slug;
            return {
                ...c,
                // einheitlich, damit das Frontend nicht raten muss
                __id: id,
                __label: c?.name ?? c?.title ?? c?.label ?? c?.bezeichnung ?? c?.titel ?? c?.slug ?? String(id ?? '')
            };
        });
    } catch (error) {
        console.error('Fehler beim Laden der Event-Kategorien:', error);
        return [];
    }
}

export async function getServices() {
    try {
        return await directus.request(readItems('services'));
    } catch (error) {
        console.error('Fehler beim Laden der Services:', error);
        return [];
    }
}

export async function getProducts() {
    try {
        return await directus.request(readItems('shop_products'));
    } catch (error) {
        console.error('Fehler beim Laden der Produkte:', error);
        return [];
    }
}

export async function getGlobalSettings() {
    try {
        return await directus.request(readSingleton('global_settings'));
    } catch (error) {
        console.error('Fehler beim Laden der Global Settings:', error);
        return null;
    }
}