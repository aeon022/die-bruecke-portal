import { defineMiddleware } from "astro:middleware";

// MAPPING: Alte WordPress-Pfad (/cms/...) -> Neue Astro-Route
const redirects: Record<string, string> = {
  // --- HAUPTNAVIGATION ---
  "/cms/": "/",
  "/cms": "/",
  "/cms/startseite": "/",
  
  // Über uns & Kontakt
  "/cms/ueber-uns": "/about",
  "/cms/kontakt": "/contact",
  "/cms/anfahrt": "/contact",
  "/cms/impressum": "/impressum",
  "/cms/datenschutz": "/datenschutz",
  
  // Infozentrum
  "/cms/infozentrum": "/info",
  "/cms/beratung": "/info",

  // Soziale Dienste (Mapping auf neue Struktur)
  "/cms/freizeitassistenz": "/services/fass",
  "/cms/fass": "/services/fass",
  "/cms/familienentlastung": "/services/fed",
  "/cms/fed": "/services/fed",
  "/cms/wohnassistenz": "/services/wass",
  "/cms/wass": "/services/wass",
  "/cms/reisen": "/camps",
  "/cms/urlaubsaktionen": "/camps",

  // Events & Kultur
  "/cms/event-kalender": "/events",
  "/cms/veranstaltungen": "/events",
  "/cms/programm": "/events",
  "/cms/kultur": "/events",
  
  // Shop (falls alte Links existieren)
  "/cms/shop": "/shop",
  "/cms/produkte": "/shop",
  
  // Mitmachen
  "/cms/ehrenamt": "/join",
  "/cms/zivildienst": "/join",
  "/cms/jobs": "/join",
  "/cms/spenden": "/supporters",
};

export const onRequest = defineMiddleware(async (context, next) => {
  const url = new URL(context.request.url);
  let pathname = url.pathname;

  // 1. Normalisierung: Trailing Slash entfernen für exakten Vergleich
  if (pathname.length > 1 && pathname.endsWith("/")) {
    pathname = pathname.slice(0, -1);
  }

  // 2. EXAKTER MATCH (Schnell)
  if (redirects[pathname]) {
    return context.redirect(redirects[pathname], 301);
  }

  // 3. INTELLIGENTE MUSTER (Catch-All für Unterseiten)
  
  // Alte Event-Details (/cms/event-kalender/details/xyz...) -> /events
  // (Wir können die ID meist nicht mappen, daher zur Übersicht)
  if (pathname.includes("/event-kalender/") || pathname.includes("/veranstaltung/")) {
    return context.redirect("/events", 301);
  }

  // Alte Shop-Produkte -> /shop
  if (pathname.includes("/shop/") || pathname.includes("/produkt/")) {
    return context.redirect("/shop", 301);
  }

  // 4. NOTFALL-NETZ: Alles was noch mit /cms beginnt und nicht gefangen wurde
  // Leitet zur Startseite, statt 404 zu werfen. (Geschmacksache, aber sicher)
  if (pathname.startsWith("/cms")) {
    return context.redirect("/", 301);
  }

  return next();
});