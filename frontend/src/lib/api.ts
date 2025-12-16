import { directus } from './directus';
// HIER FEHLTE readSingleton
import { readItems, readItem, readSingleton } from '@directus/sdk'; 

export async function getEvents() {
    return await directus.request(
        readItems('events', {
            fields: ['*', { category: ['name', 'color', 'slug'] }],
            sort: ['start_date'],
            filter: {
                status: { _eq: 'published' }
            }
        })
    );
}

export async function getEventBySlug(slug: string) {
    const events = await directus.request(
        readItems('events', {
            filter: { slug: { _eq: slug } },
            fields: ['*', { category: ['*'] }],
            limit: 1
        })
    );
    return events[0];
}

export async function getServices() {
    return await directus.request(readItems('services'));
}

export async function getProducts() {
    return await directus.request(readItems('shop_products'));
}

export async function getGlobalSettings() {
    return await directus.request(readSingleton('global_settings'));
}