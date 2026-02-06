// src/lib/api.ts
import { directus } from './directus';
import { readItems, readSingleton } from '@directus/sdk';

// --- HELPER ---

function getSafeLabel(obj: any) {
  if (!obj) return 'Unbenannt';
  return obj.name || obj.title || obj.label || obj.bezeichnung || obj.titel || 'Kategorie';
}

const statusFilter = import.meta.env.PROD
  ? { status: { _eq: 'published' } }
  : {};

// --- EVENTS ---

export async function getEvents() {
  try {
    const events = await directus.request(
      readItems('events', {
        fields: [
          '*', 
          'event_categories.event_categories_id.id',
          'event_categories.event_categories_id.name',
          'event_categories.event_categories_id.color',
        ],
        filter: statusFilter,
        sort: ['start_date'],
        limit: -1,
      })
    );

    if (!events) return [];

    return events.map((e: any) => ({
      ...e,
      is_highlight: Boolean(e?.is_highlight),
      event_categories: e.event_categories || [] 
    }));
  } catch (error) {
    console.error('API Error (getEvents):', error);
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
  try {
    const events = await directus.request(
      readItems('events', {
        filter: { ...statusFilter, slug: { _eq: slug } },
        fields: [
          '*',
          'event_categories.event_categories_id.id',
          'event_categories.event_categories_id.name',
        ],
        limit: 1
      })
    );
    return events[0] || null;
  } catch (e) {
    console.error('API Error (getEventBySlug):', e);
    return null;
  }
}

// --- SERVICES & PRODUCTS & SETTINGS ---

export async function getServices() {
  try {
    return await directus.request(readItems('services', { filter: statusFilter }));
  } catch (error) {
    return [];
  }
}

export async function getProducts() {
  try {
    return await directus.request(readItems('shop_products', { filter: statusFilter }));
  } catch (error) {
    return [];
  }
}

export async function getGlobalSettings() {
  try {
    return await directus.request(readSingleton('global_settings'));
  } catch (error) {
    console.warn('Global Settings konnten nicht geladen werden.');
    return { project_name: 'Die Brücke' };
  }
}

// --- ARCHIV ---

// 1. Übersicht (Mit Retry-Schutz gegen Timeouts)
export async function getArchiv() {
  let attempts = 0;
  // Wir probieren es 3x, falls das Netzwerk wackelt
  while (attempts < 3) {
      try {
        return await directus.request(
          readItems('archiv', {
            fields: [
              'id', 'slug', 'title', 'teaser',
              'year', 'image', 'aspect', 
              'category'
            ],
            filter: statusFilter,
            sort: ['-year'],
            limit: -1,
          })
        );
      } catch (error) {
        attempts++;
        if (attempts >= 3) {
            console.error(`API Error (getArchiv) nach 3 Versuchen:`, error);
            return [];
        }
        // Kurze Pause vor dem nächsten Versuch (500ms)
        await new Promise(resolve => setTimeout(resolve, 500));
      }
  }
  return [];
}

// 2. Detail (Mit 500er Fix & Retry-Schutz)
export async function getArchivBySlug(slug: string) {
  try {
    const items = await directus.request(
      readItems('archiv', {
        // Fix: Nur Slug-Suche (verhindert Crash bei ID-Konflikt)
        filter: { 
            ...statusFilter, 
            slug: { _eq: slug } 
        },
        // Fix: Explizite Felder (verhindert Crash bei zu großer Rekursion)
        fields: [
            'id', 'slug', 'title', 'teaser', 'description', 'info_text',
            'year', 'image', 'aspect', 'category',
            'video_url', 
            'pdf_file',
            'gallery.directus_files_id.id',
            'gallery.directus_files_id.filename_disk',
            'gallery.directus_files_id.width',
            'gallery.directus_files_id.height',
            'gallery.directus_files_id.title'
        ],
        limit: 1
      })
    );
    return items[0] || null;
  } catch (error) {
    console.error('API Error (getArchivBySlug):', error);
    return null;
  }
}

// --- BLOG ---

export async function getBlogPosts() {
  try {
    return await directus.request(
      readItems('blog', {
        fields: [
          'id', 'slug', 'title', 'author', 'main_image', 'excerpt', 
          'tags', 'date_created', 'category'
        ],
        filter: statusFilter,
        sort: ['-date_created'],
        limit: -1,
      })
    );
  } catch (error) {
    console.error('API Error (getBlogPosts):', error);
    return [];
  }
}

export async function getBlogPostBySlug(slug: string) {
  try {
    const posts = await directus.request(
      readItems('blog', {
        filter: { ...statusFilter, slug: { _eq: slug } },
        fields: ['*', 'gallery.directus_files_id.*'],
        limit: 1
      })
    );
    return posts[0] || null;
  } catch (error) {
    return null;
  }
}

// --- SIDEBAR ---

export async function getSidebarEvent(options?: {
  mode?: 'highlight' | 'latest';
  limit?: number;
  random?: boolean;
}) {
  try {
    const mode = options?.mode ?? 'latest';
    const limit = options?.limit ?? 10;
    const random = options?.random ?? true;
    const today = new Date().toISOString().split('T')[0];

    const filter: any = {
      ...statusFilter,
      start_date: { _gte: today }
    };

    const response = await directus.request(
      readItems('events', {
        fields: ['title', 'slug', 'description', 'image', 'is_highlight', 'start_date', 'video_url'],
        filter: filter,
        sort: ['start_date'],
        limit: 20 
      })
    );

    let pool = response || [];

    if (mode === 'highlight') {
       pool = pool.filter((e: any) => 
         e.is_highlight === true || 
         (Array.isArray(e.is_highlight) && e.is_highlight.includes('true'))
       );
    }

    if (pool.length === 0 && mode === 'highlight') {
        pool = response || [];
    }

    const shortlist = pool.slice(0, limit);
    if (!shortlist.length) return null;

    return random
      ? shortlist[Math.floor(Math.random() * shortlist.length)]
      : shortlist[0];

  } catch (e) {
    return null;
  }
}

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