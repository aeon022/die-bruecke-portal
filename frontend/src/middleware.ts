import { defineMiddleware } from "astro:middleware";

// MAPPING: Alte WordPress-Pfad -> Neue Astro-Route
const redirects: Record<string, string> = {
  // Startseite & Basics
  "/cms/": "/",
  "/cms": "/",
  "/cms/ueber-uns": "/about",
  "/cms/ueber-uns/": "/about",
  "/cms/contact": "/contact",
  "/cms/contact/": "/contact",
  "/cms/kontakt": "/contact", // Sicherheitshalber
  "/cms/unterstuetzung": "/join", // "Ehrenamtlich engagieren" -> Join
  "/cms/unterstuetzung/": "/join",

  // Infozentrum
  "/cms/infozentrum": "/info",
  "/cms/infozentrum/": "/info",

  // Events
  "/cms/event-kalender": "/events",
  "/cms/event-kalender/": "/events",
  "/cms/event-directory": "/events", // Scheint die Listenansicht zu sein
  "/cms/programm": "/events", // Oft synonym verwendet

  // Soziale Dienste (Mapping basierend auf Analyse)
  "/cms/familienentlastung": "/services/fed",
  "/cms/freizeitassistenz": "/services/fass",
  "/cms/wohnassistenz": "/services/wass",
  
  // Alte Projekt-Seiten (Falls vorhanden)
  "/cms/projekte": "/projects",
};

export const onRequest = defineMiddleware(async (context, next) => {
  const url = new URL(context.request.url);
  const pathname = url.pathname;

  // 1. EXAKTE TREFFER (Schnellster Weg)
  // Entfernt trailing slashes für den Vergleich, um Duplikate zu vermeiden
  const normalizedPath = pathname.endsWith('/') && pathname !== '/' 
    ? pathname.slice(0, -1) 
    : pathname;

  if (redirects[normalizedPath] || redirects[pathname]) {
    const target = redirects[normalizedPath] || redirects[pathname];
    return context.redirect(target, 301);
  }

  // 2. INTELLIGENTE PATTERN MATCHING (Falls wir was vergessen haben)
  
  // Fall: /cms/event-details/123-konzert -> /events (Besser als 404)
  if (pathname.includes("event-details") || pathname.includes("veranstaltung")) {
    return context.redirect("/events", 301);
  }

  // Fall: /cms/shop/produkt-xy -> /shop
  if (pathname.includes("/shop") || pathname.includes("/produkt")) {
    return context.redirect("/shop", 301);
  }

  // 3. CATCH-ALL FÜR /cms/*
  // Wenn jemand eine alte URL aufruft, die wir nicht kennen, leiten wir ihn
  // NICHT auf 404, sondern versuchen, das /cms wegzuschneiden oder zur Startseite zu führen.
  if (pathname.startsWith("/cms")) {
    // Option A: Hart auf Startseite (Sicherste Variante)
    return context.redirect("/", 301);
    
    // Option B (Experimentell): Versuchen, den Pfad ohne /cms zu nutzen
    // const newPath = pathname.replace("/cms", "");
    // return context.redirect(newPath, 301); 
  }

  return next();
});