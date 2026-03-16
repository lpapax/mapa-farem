# MapaFarem.cz — Production-Ready v1.0

Build: ✅ 0 errors · `npm run build` passes clean

## Dokončené tasky

### Task 1 — Landing Page Polish
- Framer Motion scroll animations na všech sekcích (`whileInView`, `once:true`)
- Newsletter signup sekce s email inputem a success state
- Testimonials s Unsplash portréty (3 farmáři s reálnými fotkami)
- Sezónní banner "Co je teď v sezóně?" dynamicky dle měsíce
- Hero search → naviguje na `/mapa?search=QUERY`

### Task 2 — Farm Detail Page
- Lightbox galerie (fullscreen, Escape/klik mimo zavírá, prev/next)
- "Otevřeno nyní" badge dle otevírací doby
- Google Maps "Navigovat" tlačítko
- Share: Kopírovat odkaz + WhatsApp sdílení s toast notifikací
- Sezónní produktový kalendář (12 měsíců, aktuální zvýrazněný)
- JSON-LD structured data pro SEO (LocalBusiness schema)

### Task 3 — Dashboard pro farmáře
- Progress bar dokončení profilu (7 polí, barva dle %)
- Stats karty: zobrazení, kliky, oblíbení, hodnocení
- Správa produktů: přidat/upravit/smazat, toggle aktivní/skryto
- Activity feed (5 posledních událostí)
- Premium upsell banner → `/cenik`
- CSS bar chart návštěvnosti (7 dní)

### Task 4 — Registrace farmy (wizard)
- 5-krokový wizard: Info → Produkty → Kontakt → Foto → Náhled
- Progress bar: gold = dokončeno, dark green = aktivní, šedé = čekající
- Produkty: 3-sloupcový grid, 20 produktů s emoji
- Kontakt + otevírací doba jako textarea
- Fotografie drag-drop UI + 6 slotů
- Preview karta + ✅ Publikovat zdarma
- Ukládá draft do `localStorage['farm-draft']`

### Task 5 — Search & Discovery
- Autocomplete suggestions: matchuje název, město, produkty
- Uloží hledání do `localStorage['recent-searches']` (max 5)
- Zobrazí nedávné hledání při focus + prázdném vstupu (× dismiss)
- Popular searches chips: Bio zelenina, Čerstvé mléko, Farmářská vejce, Místní med, Domácí maso

### Task 6 — PWA
- `public/manifest.json`: standalone, theme_color, shortcuts (Mapa, Přidat farmu)
- `public/sw.js`: install/activate/fetch s caching strategiemi
  - Images: stale-while-revalidate
  - JS/CSS/fonts: cache-first
  - Navigation: network-first, fallback offline
- Service worker registrován v `main.jsx`

### Task 7 — Performance
- Lazy loading všech stránek (React.lazy + Suspense)
- ManualChunks: vendor-react, vendor-map, vendor-motion, vendor-misc
- farms.json oddělený chunk (954 KB / gzip 190 KB)
- Výsledek: index.js jen 190 KB (gzip 51 KB)
- Debounced map markers (150ms) — smooth 60fps při filtrování
- SVG piny s `will-change: transform` + `translateZ(0)`

### Task 8 — Admin Panel
- Auth guard: jen ADMIN role
- Verification queue: 3 farmy čekající, fade-dismiss
- Reported farms: 2 záznamy
- Farmy tabulka: search, 4 filtry, bulk select, smazat, CSV export
- Analytics bar chart (6 měsíců CSS bary)

### Task 9 — Email Templates
`frontend/src/data/emailTemplates.js` — 5 HTML šablon:
- `welcome` — uvítací email po registraci
- `profileReminder` — připomenutí nedokončeného profilu
- `monthlyStats` — měsíční statistiky (prémiový)
- `seasonalNewsletter` — sezónní tipy
- `premiumUpsell` — upsell na prémiový účet

### Task 10 — QA + Deploy Prep
- Všechny routes funkční: `/`, `/mapa`, `/farma/:id`, `/dashboard`, `/admin`, `/cenik`, `/o-nas`, `/sezona`, `/pridat-farmu`
- Build: ✅ `✓ built in 3.41s` — 0 errors
- PWA: manifest + service worker
- SEO: sitemap.xml, robots.txt, og:meta, JSON-LD

## Architektura bundle (prod)
| Chunk | Size | Gzip |
|---|---|---|
| farms-data | 954 KB | 190 KB |
| vendor-react | 163 KB | 53 KB |
| vendor-map (Mapbox/Leaflet) | 153 KB | 45 KB |
| vendor-motion (Framer) | 132 KB | 44 KB |
| index (shared) | 190 KB | 51 KB |
| Per-page chunks | 4–39 KB | lazy |

## Technický stack
- React 18 + Vite 5 + React Router v6
- Zustand (4 stores: auth, map, cart, notifications)
- Framer Motion v12 (LandingPage parallax + scroll animations)
- Mapbox GL JS (MapPage, clustering, GPS)
- React-Leaflet (CzechRegionMap)
- Supabase (auth + reviews + offers)
- PWA: Web App Manifest + Service Worker

---
*MapaFarem.cz — Největší mapa lokálních farem v České republice*
