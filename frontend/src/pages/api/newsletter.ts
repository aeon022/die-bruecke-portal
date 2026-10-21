import type { APIRoute } from 'astro';

const env = (k: string) => process.env[k] ?? (import.meta.env as Record<string, string>)[k];
const json = (message: string, status = 200) =>
  new Response(JSON.stringify({ message }), { status });

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();

    // Honeypot - siehe api/contact.ts
    if (data.website_check) return json('Fast geschafft – bitte bestätige deine E-Mail-Adresse.');

    const email = String(data.email || '').trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !data.consent) {
      return json('Bitte gib eine gültige E-Mail-Adresse an und stimme der Datenschutzerklärung zu.', 400);
    }

    // Double-Opt-In: Brevo schickt die Bestätigungsmail, der Kontakt landet erst nach Klick in der Liste
    const res = await fetch('https://api.brevo.com/v3/contacts/doubleOptinConfirmation', {
      method: 'POST',
      headers: { 'api-key': env('BREVO_API_KEY'), 'content-type': 'application/json' },
      body: JSON.stringify({
        email,
        includeListIds: [Number(env('BREVO_LIST_ID'))],
        templateId: Number(env('BREVO_DOI_TEMPLATE_ID')),
        redirectionUrl: env('BREVO_DOI_REDIRECT_URL') || 'https://diebruecke.social/newsletter-bestaetigt',
      }),
    });

    // 204 = Mail raus; "already exist" ist für den Nutzer ebenfalls ok (kein Leak, ob Adresse bekannt)
    if (!res.ok) {
      const err = await res.text();
      if (!/already exist/i.test(err)) {
        console.error('Brevo Fehler', res.status, err);
        return json('Anmeldung gerade nicht möglich. Bitte versuche es später erneut.', 502);
      }
    }
    return json('Fast geschafft – bitte bestätige deine E-Mail-Adresse.');
  } catch (e) {
    console.error('Newsletter-API', e);
    return json('Anmeldung gerade nicht möglich. Bitte versuche es später erneut.', 500);
  }
};
