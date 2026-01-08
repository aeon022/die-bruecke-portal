import type { APIRoute } from 'astro';
import { directus } from '../../lib/directus';
import { createItem } from '@directus/sdk';

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();

    // 1. Einfache Validierung
    if (!data.name || !data.email || !data.message) {
      return new Response(JSON.stringify({ 
        message: "Bitte fülle alle Pflichtfelder aus." 
      }), { status: 400 });
    }

    // 2. An Directus senden
    // Wir nutzen die Public-Role Permission oder (falls konfiguriert) einen Static Token
    await directus.request(createItem('inbox', {
        name: data.name,
        email: data.email,
        subject: data.subject || 'Anfrage via Website',
        message: data.message,
        status: 'published' // oder 'new', je nach deiner Config
    }));

    return new Response(JSON.stringify({ 
      message: "Nachricht erfolgreich gesendet!" 
    }), { status: 200 });

  } catch (error) {
    console.error("Kontakt-Formular Fehler:", error);
    return new Response(JSON.stringify({ 
      message: "Hoppla, da lief etwas schief. Bitte versuche es später noch einmal." 
    }), { status: 500 });
  }
};