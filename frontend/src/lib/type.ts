export interface Event {
    id: number;
    status: string;
    title: string;
    slug: string;
    start_date: string;
    end_date: string;
    teaser: string;
    description: string;
    location: string;
    image: string; // UUID des Bildes
    category: number | EventCategory; // ID oder Objekt (wenn populated)
    is_wheelchair_accessible: boolean;
    has_sign_language: boolean;
    ticket_url: string;
}

export interface EventCategory {
    id: number;
    name: string;
    slug: string;
    color: string;
}

export interface Service {
    id: number;
    title: string;
    slug: string;
    icon: string;
    teaser: string;
    description: string;
    type: 'counseling' | 'housing' | 'leisure' | 'education'; // Beispiel-Werte anpassen
}

export interface ShopProduct {
    id: number;
    name: string;
    slug: string;
    price: number;
    description: string;
    image: string;
    snipcart_guid: string;
}

// Das Gesamtschema für Directus
export interface Schema {
    events: Event[];
    event_categories: EventCategory[];
    services: Service[];
    shop_products: ShopProduct[];
}

// ... meine existierenden Interfaces (Event, etc.) ...

export interface GlobalSettings {
    project_name: string;
    footer_text: string;
    logo: string; // UUID des Bildes
}

// Erweitere das Schema, falls noch nicht geschehen
export interface Schema {
    events: Event[];
    event_categories: EventCategory[];
    services: Service[];
    shop_products: ShopProduct[];
    global_settings: GlobalSettings; // <--- NEU
}