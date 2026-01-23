import type { APIRoute } from 'astro';
import { directus } from '../../lib/directus';
import { createItem } from '@directus/sdk';

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();

    // 1. SPAM CHECK (Honeypot)
    // Wenn das versteckte Feld ausgefüllt ist, ist es ein Bot -> Silent Fail
    // (Wir senden 200 OK zurück, damit der Bot denkt, er war erfolgreich)
    if (data.website_check && data.website_check.length > 0) {
        console.warn(`Spam-Bot blockiert. IP: ${request.headers.get('x-forwarded-for') || 'unbekannt'}`);
        return new Response(JSON.stringify({ 
            message: "Nachricht erfolgreich gesendet!" 
        }), { status: 200 });
    }

    // 2. VALIDIERUNG (Wichtig: Das fehlte in deinem Code!)
    if (!data.name || !data.email || !data.message) {
      return new Response(JSON.stringify({ 
        message: "Bitte fülle alle Pflichtfelder aus." 
      }), { status: 400 });
    }

    // 3. An Directus senden
    await directus.request(createItem('inbox', {
        name: data.name,
        email: data.email,
        subject: data.subject || 'Anfrage via Website',
        message: data.message,
        // Status 'new' ist meist besser für Inbox als 'published'
        // Stelle sicher, dass "new" in deiner Directus-Konfiguration erlaubt ist
        status: 'new', 
        date_created: new Date().toISOString()
    }));

    return new Response(JSON.stringify({ 
      message: "Nachricht erfolgreich gesendet!" 
    }), { status: 200 });

  } catch (error: any) {
    // Fehler loggen, damit du im Server-Log siehst, was Directus stört
    console.error("Kontakt-Formular Fehler:", error?.errors || error);
    
    return new Response(JSON.stringify({ 
      message: "Hoppla, da lief etwas schief. Bitte versuche es später noch einmal." 
    }), { status: 500 });
  }
};