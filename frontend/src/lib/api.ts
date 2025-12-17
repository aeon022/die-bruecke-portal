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