import type { APIRoute } from 'astro';
import { directus } from '../../lib/directus';
import { createItem } from '@directus/sdk';

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();

    // SPAM CHECK (Honeypot) - siehe api/contact.ts
    if (data.website_check && data.website_check.length > 0) {
      return new Response(JSON.stringify({
        message: "Anfrage erfolgreich gesendet!"
      }), { status: 200 });
    }

    if (!data.first_name || !data.last_name || !data.email || !data.membership_type) {
      return new Response(JSON.stringify({
        message: "Bitte fülle alle Pflichtfelder aus."
      }), { status: 400 });
    }

    // Optionale Felder nur mitschicken, wenn sie einen Wert haben - `phone` hat in
    // Directus eine Regex-Validierung (^\+43...$), die bei explizitem `null` sonst
    // fehlschlagen kann.
    const payload: Record<string, any> = {
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      membership_type: data.membership_type,
    };
    if (data.address) payload.address = data.address;
    if (data.phone) payload.phone = data.phone;
    if (data.message) payload.message = data.message;

    await directus.request(createItem('inbox_memberships', payload));

    return new Response(JSON.stringify({
      message: "Anfrage erfolgreich gesendet!"
    }), { status: 200 });

  } catch (error: any) {
    console.error("Mitgliedschafts-Formular Fehler:", error?.errors || error);

    return new Response(JSON.stringify({
      message: "Hoppla, da lief etwas schief. Bitte versuche es später noch einmal."
    }), { status: 500 });
  }
};
