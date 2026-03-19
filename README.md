# 🌱 Zeměplocha — Mapa lokálních farem ČR

Fullstack aplikace pro mapování lokálních farem, farmářských trhů a přírodních produktů v České republice.

---

## 🗂 Struktura projektu

```
zemeplocha/
├── backend/                  # Node.js + Express + Prisma
│   ├── prisma/
│   │   └── schema.prisma     # Databázové schéma (PostgreSQL)
│   ├── src/
│   │   ├── index.js          # Express server entry point
│   │   ├── db/client.js      # Prisma singleton
│   │   ├── middleware/auth.js # JWT autentizace
│   │   └── routes/
│   │       ├── auth.js        # Register, login, /me
│   │       ├── farms.js       # CRUD + vyhledávání + oblíbené + recenze
│   │       ├── products.js    # Produkty farmy
│   │       ├── orders.js      # Objednávky + Stripe
│   │       ├── users.js       # Profil + oblíbené + dashboard
│   │       └── notifications.js
│   └── package.json
│
└── frontend/                 # React 18 + Vite + Zustand + Mapbox GL JS
    ├── public/
    │   ├── logo.png           # Logo MapaFarem.cz
    │   ├── manifest.json      # PWA manifest
    │   └── sw.js              # Service Worker
    ├── src/
    │   ├── main.jsx
    │   ├── App.jsx            # React Router + ErrorBoundary + lazy loading
    │   ├── supabase.js        # Supabase client (newsletter, foto upload)
    │   ├── store/index.js     # Zustand stores (auth, map, cart, notifications)
    │   ├── utils/api.js       # Axios instance
    │   ├── hooks/useSEO.js    # SEO meta tag hook
    │   ├── components/
    │   │   ├── ErrorBoundary.jsx   # React error boundary (Czech fallback UI)
    │   │   ├── PageSkeleton.jsx    # Skeleton loader pro lazy-loaded stránky
    │   │   ├── BottomNav.jsx       # Mobilní navigace (React.memo)
    │   │   ├── PrivateRoute.jsx    # Auth guard + role check
    │   │   └── CzechRegionMap.jsx  # SVG mapa krajů
    │   ├── data/
    │   │   ├── farms.json     # 1 695 farem (statická data)
    │   │   └── blogPosts.js   # Blog posty
    │   └── pages/
    │       ├── LandingPage.jsx     # Domovská stránka
    │       ├── MapPage.jsx         # Interaktivní mapa (Mapbox GL JS + sidebar)
    │       ├── FarmDetailPage.jsx  # Detail farmy
    │       ├── LoginPage.jsx       # Přihlášení / registrace
    │       ├── RegisterPage.jsx    # Registrace s validací
    │       ├── RegisterFarmPage.jsx # Registrace farmy (multi-step) s validací
    │       ├── ProfileSetupPage.jsx # Nastavení profilu (multi-step) s validací
    │       ├── DashboardPage.jsx   # Farmářský dashboard
    │       ├── CheckoutPage.jsx    # Košík + objednávka
    │       ├── ProfilePage.jsx
    │       ├── FavoritesPage.jsx
    │       ├── OrdersPage.jsx
    │       ├── SeasonalGuidePage.jsx
    │       ├── BlogPage.jsx / BlogPostPage.jsx
    │       ├── MarketsPage.jsx     # Farmářské trhy
    │       ├── LeaderboardPage.jsx
    │       ├── AboutPage.jsx / PricingPage.jsx
    │       └── AdminPage.jsx
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## 🚀 Spuštění lokálně

### 1. PostgreSQL databáze

```bash
# Lokálně (macOS/Linux)
brew install postgresql
createdb zemeplocha

# Nebo použijte Docker
docker run --name zemeplocha-db -e POSTGRES_DB=zemeplocha \
  -e POSTGRES_PASSWORD=secret -p 5432:5432 -d postgres
```

### 2. Backend

```bash
cd backend
npm install

# Nastavte environment variables
cp .env.example .env
# Editujte .env:
# DATABASE_URL="postgresql://postgres:secret@localhost:5432/zemeplocha"
# JWT_SECRET="vas-super-tajny-klic-32-znaku"
# STRIPE_SECRET_KEY="sk_test_..."  (volitelné)
# FRONTEND_URL="http://localhost:5173"

# Inicializujte databázi
npx prisma migrate dev --name init
npx prisma generate
node src/db/seed.js   # nahrajte 200 demo farem

# Spusťte server
npm run dev
# API běží na http://localhost:4000
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
# Aplikace běží na http://localhost:5173
```

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Popis |
|--------|----------|-------|
| POST | `/api/auth/register` | Registrace (CUSTOMER nebo FARMER) |
| POST | `/api/auth/login` | Přihlášení → JWT token |
| GET  | `/api/auth/me` | Profil přihlášeného uživatele |
| PUT  | `/api/auth/me` | Aktualizace profilu |

### Farmy
| Method | Endpoint | Popis |
|--------|----------|-------|
| GET  | `/api/farms` | Seznam s filtry (type, region, bio, search, pagination) |
| GET  | `/api/farms/:id` | Detail farmy s produkty, recenzemi, sezónou |
| POST | `/api/farms` | Vytvořit farmu (FARMER) |
| PUT  | `/api/farms/:id` | Upravit farmu |
| POST | `/api/farms/:id/favorite` | Toggle oblíbených |
| POST | `/api/farms/:id/review` | Přidat recenzi |
| GET  | `/api/farms/:id/seasonal` | Sezónní nabídky |
| POST | `/api/farms/:id/seasonal` | Přidat sezónní nabídku (FARMER) |

### Produkty
| Method | Endpoint | Popis |
|--------|----------|-------|
| GET  | `/api/products` | Produkty (filtry: farmId, category, seasonal) |
| POST | `/api/products` | Přidat produkt (FARMER) |
| PUT  | `/api/products/:id` | Upravit produkt |
| DELETE | `/api/products/:id` | Deaktivovat produkt |

### Objednávky
| Method | Endpoint | Popis |
|--------|----------|-------|
| POST | `/api/orders` | Vytvořit objednávku + Stripe Payment Intent |
| GET  | `/api/orders` | Moje objednávky (zákazník nebo farmář) |
| GET  | `/api/orders/:id` | Detail objednávky |
| PATCH | `/api/orders/:id/status` | Aktualizovat stav (FARMER) |

### Uživatelé
| Method | Endpoint | Popis |
|--------|----------|-------|
| GET  | `/api/users/favorites` | Oblíbené farmy |
| GET  | `/api/users/dashboard` | Farmářský dashboard (statistiky) |

---

## 🗄 Databázové modely

- **User** — zákazník nebo farmář (role: CUSTOMER / FARMER / ADMIN)
- **Farm** — profil farmy s GPS souřadnicemi, kategorií, certifikacemi
- **Product** — produkty farmy s cenou, skladem, sezónností
- **Order** + **OrderItem** — objednávky s podporou Stripe plateb
- **Favorite** — oblíbené farmy per uživatel
- **Review** — hodnocení 1–5 hvězdiček
- **SeasonalOffer** — sezónní nabídky s datem platnosti
- **Notification** — notifikace (objednávky, nové produkty, sezóna)

---

## 🛠 Tech Stack

| Vrstva | Technologie |
|--------|-------------|
| Frontend | React 18 + Vite + React Router v6 |
| State | Zustand (persist middleware) |
| Mapa | Mapbox GL JS |
| HTTP | Axios |
| Backend | Node.js + Express |
| ORM | Prisma |
| Databáze | PostgreSQL (Supabase) |
| Auth | JWT (jsonwebtoken + bcryptjs) + Supabase Auth |
| Platby | Stripe |
| Notifikace | In-app (rozšiřitelné na email/push) |
| Hosting | Vercel (frontend) + Railway/Render (backend) |

---

## 🗺 Funkce

### ✅ Implementováno
- [x] Interaktivní mapa ČR (Leaflet + OpenStreetMap) s 200+ farmami
- [x] Filtrování podle kategorie (BIO, zelenina, maso, mléčné, med, víno, bylinky, trh)
- [x] Fulltextové vyhledávání (název, lokace, produkty)
- [x] Detail farmy — produkty, recenze, sezónní nabídky, info
- [x] Registrace a přihlášení (zákazník i farmář)
- [x] Oddělené role (CUSTOMER / FARMER / ADMIN)
- [x] Košík s multi-quantity, perzistence přes Zustand
- [x] Objednávky + Stripe integrace
- [x] Farmářský dashboard (statistiky, přehled objednávek)
- [x] Oblíbené farmy
- [x] Notifikační systém (nové objednávky, sezóna, nové produkty)
- [x] Sezónní nabídky farmářů

### 🔜 Připraveno k rozšíření
- [ ] Email notifikace (Nodemailer / Resend)
- [ ] Push notifikace (Web Push API)
- [ ] Mobilní app (React Native / Expo)
- [ ] Vyhledávání dle GPS vzdálenosti (PostGIS)
- [ ] Admin panel
- [ ] Exporty dat (CSV / PDF)
- [ ] SEO (SSR přes Next.js)

---

## 🌍 Deploy

### Frontend (Vercel)
```bash
cd frontend
npm run build
vercel deploy
```

### Backend (Railway)
1. Připojte GitHub repo na railway.app
2. Nastavte environment variables
3. Přidejte PostgreSQL plugin
4. Deploy automaticky

---

## 📄 .env.example (backend)

```env
DATABASE_URL="postgresql://user:password@localhost:5432/zemeplocha"
JWT_SECRET="min-32-znaku-tajny-klic-zde"
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
FRONTEND_URL="http://localhost:5173"
PORT=4000
NODE_ENV=development
```

---

*Zeměplocha — Spojujeme farmáře přímo se zákazníky* 🌱
