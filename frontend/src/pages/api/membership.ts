import type { APIRoute } from 'astro';
import { directusForms } from '../../lib/directus';
import { createItem } from '@directus/sdk';

const MEMBERS_API_URL = process.env.MEMBERS_API_URL || import.meta.env.MEMBERS_API_URL || 'https://internal.diebruecke.social';
const MEMBERS_API_KEY = process.env.MEMBERS_API_KEY || import.meta.env.MEMBERS_API_KEY || '';

/** Anmeldung an die Mitglieder-App (Agenten-API). Liefert den Stripe-Link mit Lfd. Nr. zurück, damit die Zahlung zugeordnet wird. */
async function sendToMembersApp(data: any): Promise<string | null> {
  if (!MEMBERS_API_KEY) return null;
  const addr = String(data.address || '').trim();
  const m = addr.match(/^(.*?)[,\s]+(\d{4})\s+(.+)$/);
  const body: Record<string, string> = {
    first_name: String(data.first_name).trim(), last_name: String(data.last_name).trim(), email: String(data.email).trim(),
    payment: data.payment_method === 'ueberweisung' ? 'Überweisung' : 'Stripe',
    comment: String(data.tier_label || data.membership_type || '').slice(0, 300),
    note: 'Websiteformular' + (data.message ? ` · ${String(data.message).replace(/\s+/g, ' ').slice(0, 1500)}` : ''),
  };
  if (data.phone) body.phone = String(data.phone).slice(0, 100);
  if (m) { body.street = m[1].trim(); body.postal_code = m[2]; body.city = m[3].trim(); } else if (addr) body.street = addr.slice(0, 300);
  try {
    const r = await fetch(`${MEMBERS_API_URL}/api/agent/members`, { method: 'POST', headers: { authorization: `Bearer ${MEMBERS_API_KEY}`, 'content-type': 'application/json' }, body: JSON.stringify(body), signal: AbortSignal.timeout(8000) });
    if (!r.ok) { console.error('Mitglieder-App:', r.status, (await r.text()).slice(0, 200)); return null; }
    return (await r.json()).stripe_url || null;
  } catch (e) { console.error('Mitglieder-App nicht erreichbar'); return null; }
}

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
    // Plausibilität und Längen begrenzen (schützt den Directus-Posteingang vor Müll)
    const tooLong = ['first_name', 'last_name', 'email', 'membership_type', 'phone'].some((k) => String(data[k] || '').length > 200)
      || String(data.address || '').length > 500 || String(data.message || '').length > 5000;
    if (tooLong || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(data.email).trim())) {
      return new Response(JSON.stringify({
        message: "Bitte prüfe deine Angaben (gültige E-Mail, Nachricht höchstens 5000 Zeichen)."
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

    await directusForms.request(createItem('inbox_memberships', payload));

    // Zusätzlich direkt in die Mitglieder-App (führendes System). Fehler dort blockieren die Anmeldung nicht.
    const stripe_url = await sendToMembersApp(data);

    return new Response(JSON.stringify({
      message: "Anfrage erfolgreich gesendet!",
      ...(stripe_url ? { stripe_url } : {})
    }), { status: 200 });

  } catch (error: any) {
    console.error("Mitgliedschafts-Formular Fehler:", error?.errors || error);

    return new Response(JSON.stringify({
      message: "Hoppla, da lief etwas schief. Bitte versuche es später noch einmal."
    }), { status: 500 });
  }
};
