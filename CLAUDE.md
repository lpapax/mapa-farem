# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Zeměplocha** is a fullstack web app for mapping local farms in the Czech Republic. Users can browse farms on an interactive map, order products, and leave reviews. Farmers have a dashboard to manage products, orders, and seasonal offers.

## Commands

### Backend (`cd backend`)
```bash
npm run dev          # Start dev server with nodemon (port 4000)
npm start            # Production start
npm run db:migrate   # Run Prisma migrations (npx prisma migrate dev)
npm run db:generate  # Regenerate Prisma client after schema changes
npm run db:seed      # Seed 200 demo farms
npm run db:studio    # Open Prisma Studio GUI
```

### Frontend (`cd frontend`)
```bash
npm run dev      # Start Vite dev server (port 5173)
npm run build    # Production build
npm run preview  # Preview production build
```

### Initial setup (backend)
```bash
cp .env.example .env   # Fill in DATABASE_URL, JWT_SECRET, STRIPE_SECRET_KEY, FRONTEND_URL
npx prisma migrate dev --name init
npx prisma generate
node src/db/seed.js
```

## Architecture

### Two separate packages
- `backend/` — Node.js + Express + Prisma (PostgreSQL). No shared package.json with frontend.
- `frontend/` — React 18 + Vite. Proxies `/api` to `http://localhost:4000` in dev (configured in `vite.config.js`).

### Backend structure
- `src/index.js` — Express app entry, middleware setup (helmet, cors, morgan, rate limiting), route mounting
- `src/middleware/auth.js` — JWT verification middleware; attaches `req.user` to protected routes
- `src/routes/` — One file per resource: `auth`, `farms`, `products`, `orders`, `users`, `notifications`
- `src/db/client.js` — Prisma singleton (`new PrismaClient()`)
- `prisma/schema.prisma` — Source of truth for all DB models

### Frontend state management (Zustand, `src/store/index.js`)
Four stores, all exported from one file:
- `useAuthStore` — persisted (localStorage key `zemeplocha-auth`, token only); handles login/register/logout/fetchMe
- `useMapStore` — filter, search, selectedFarmId, map center/zoom, sidebar visibility
- `useCartStore` — persisted (`zemeplocha-cart`); per-farm cart (adding from a different farm prompts to clear)
- `useNotificationStore` — fetches from `/api/notifications`, tracks unread count

### API layer (`src/utils/api.js`)
Single Axios instance with `baseURL: '/api'`. Request interceptor reads JWT from localStorage and attaches it. Response interceptor redirects to `/login` on 401.

### Demo data
`frontend/src/data/farms.json` contains 200 pre-seeded farms used for the map. The backend seed (`src/db/seed.js`) also seeds these into PostgreSQL.

### Auth & roles
JWT-based. Three roles: `CUSTOMER`, `FARMER`, `ADMIN`. Farmers have one Farm (1:1 relation). Protected endpoints check role in the auth middleware.

### Payments
Stripe integration in `backend/src/routes/orders.js` — creates a Payment Intent on order creation. Stripe keys come from env vars.

## Environment variables (backend)
| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Min 32 chars, used to sign/verify tokens |
| `STRIPE_SECRET_KEY` | Stripe secret (optional for dev) |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook (optional) |
| `FRONTEND_URL` | CORS origin (default: `http://localhost:5173`) |
| `PORT` | Server port (default: 4000) |

## Deployment
- Frontend → Vercel (`npm run build` then deploy; SPA routing handled via `vercel.json`)
- Backend → Railway or Render with PostgreSQL plugin
