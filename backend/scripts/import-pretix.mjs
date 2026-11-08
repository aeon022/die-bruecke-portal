#!/usr/bin/env node
// Pretix-Events nach Directus importieren. Idempotent: vorhandene Slugs werden übersprungen.
//
// Nutzung:
//   PRETIX_ORG=bruecke PRETIX_TOKEN=xxx DIRECTUS_URL=http://127.0.0.1:8055 DIRECTUS_TOKEN=yyy \
//     node backend/scripts/import-pretix.mjs [--dry-run]

const { PRETIX_ORG, PRETIX_TOKEN, DIRECTUS_URL = 'http://127.0.0.1:8055', DIRECTUS_TOKEN } = process.env;
const DRY = process.argv.includes('--dry-run');
if (!PRETIX_ORG || !PRETIX_TOKEN || !DIRECTUS_TOKEN) {
	console.error('PRETIX_ORG, PRETIX_TOKEN und DIRECTUS_TOKEN müssen gesetzt sein.');
	process.exit(1);
}

const de = (v) => (typeof v === 'object' && v !== null ? (v.de ?? Object.values(v)[0] ?? '') : (v ?? ''));

// 1. Alle Pretix-Events holen (paginiert)
const pretixEvents = [];
let url = `https://pretix.eu/api/v1/organizers/${PRETIX_ORG}/events/`;
while (url) {
	const res = await fetch(url, { headers: { Authorization: `Token ${PRETIX_TOKEN}` } });
	if (!res.ok) throw new Error(`Pretix ${res.status}: ${await res.text()}`);
	const page = await res.json();
	pretixEvents.push(...page.results);
	url = page.next;
}
console.log(`Pretix: ${pretixEvents.length} Events gefunden.`);

// 2. Vorhandene Slugs aus Directus holen
const existingRes = await fetch(`${DIRECTUS_URL}/items/events?fields=slug&limit=-1`, {
	headers: { Authorization: `Bearer ${DIRECTUS_TOKEN}` },
});
if (!existingRes.ok) throw new Error(`Directus ${existingRes.status}: ${await existingRes.text()}`);
const existing = new Set((await existingRes.json()).data.map((e) => e.slug));

// 3. Mappen + filtern
const payload = pretixEvents
	.filter((e) => !existing.has(e.slug))
	.map((e) => ({
		title: de(e.name),
		slug: e.slug,
		start_date: e.date_from,
		end_date: e.date_to,
		location: de(e.location) || null,
		pretix_link: `https://pretix.eu/${PRETIX_ORG}/${e.slug}/`,
		status: e.live ? 'published' : 'draft',
		recurrence: 'none',
	}));

if (payload.length === 0) {
	console.log('Nichts zu importieren — alle Slugs existieren schon.');
	process.exit(0);
}
if (DRY) {
	console.log(JSON.stringify(payload, null, 2));
	console.log(`Dry-Run: ${payload.length} Events würden angelegt.`);
	process.exit(0);
}

// 4. Batch-Create
const createRes = await fetch(`${DIRECTUS_URL}/items/events`, {
	method: 'POST',
	headers: { Authorization: `Bearer ${DIRECTUS_TOKEN}`, 'Content-Type': 'application/json' },
	body: JSON.stringify(payload),
});
if (!createRes.ok) throw new Error(`Directus ${createRes.status}: ${await createRes.text()}`);
console.log(`${payload.length} Events angelegt: ${payload.map((p) => p.slug).join(', ')}`);
