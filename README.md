# MenuScan

MenuScan is a digital menu builder for restaurants and cafés. Owners sign up, create one or more restaurants, organise their menu into nested categories, add items with photos, and print a QR code. Guests scan the code and get a fast, mobile-friendly menu with search, filters and currency switching. They don't need an app or an account.

**Live demo:** https://menuscan-eta.vercel.app

## Features

- **Accounts and auth**: email/password sign-up, bcrypt-hashed passwords, and an HTTP-only JWT cookie session
- **Multiple restaurants per account**, each with its own URL slug and dashboard
- **Nested categories** (for example *Drinks → Hot drinks → Coffee*), with cycle protection, emoji icons from a full emoji picker, colours, and visibility
- **Menu items** with price, description, image upload (Cloudinary), allergens, ingredients, dietary flags, and preparation time
- **Availability control**: mark items as available, sold out (shown with a badge) or hidden from guests
- **Reordering** of categories and items with up/down controls
- **Duplicate items** in one click; copies start hidden so they can be edited first
- **Public menu page** with text search (accent- and Cyrillic-aware), category/dietary/price filters, a sticky category jump bar, MK/EN labels and a MKD/EUR/USD currency switch
- **Restaurant settings**: name, contact details, base currency, and taking a menu offline
- **QR codes**: a downloadable QR code that links to each restaurant's public menu
- **Dashboard overview** with counts of menus, categories (top-level and nested), items, and items that are available, sold out, hidden or missing a photo

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 15 (App Router, route handlers, middleware) |
| Language | TypeScript (strict) |
| UI | React 18, Tailwind CSS, lucide-react, emoji-mart |
| Data | MongoDB Atlas with Mongoose |
| Auth | `jose` JWT (HS256) in an HTTP-only cookie, `bcryptjs` |
| Validation | zod (shared between API routes and forms) |
| Images | Cloudinary |
| Testing | Vitest, React Testing Library, mongodb-memory-server |
| CI / hosting | GitHub Actions, Vercel |

## Architecture

```
Browser ──► middleware.ts ──► App Router pages (server components)
   │         (verifies JWT,        │
   │          redirects or 401)    ▼
   │                         client components (dashboard)
   │                               │ fetch
   ▼                               ▼
/menu/[slug] (public) ──► /api/public/...   /api/restaurant/[slug]/...  (owner only)
                                   │                 │
                                   └──►   src/lib   ◄──────┘
                                     (api helpers, zod schemas,
                                      category tree, stats)
                                              │
                                        Mongoose models ──► MongoDB Atlas
```

- **Middleware** rejects unauthenticated requests to `/dashboard/*`, `/api/restaurant/*` and `/api/upload`. Route handlers verify the session cookie again themselves, so they never trust a client-supplied header.
- **Route handlers** parse input with zod schemas from `src/lib/validation`. Every query is scoped to a restaurant owned by the current user, so a user can never read or change another user's data, even by guessing ids.
- **Public endpoints** return only visible categories and non-hidden items for active restaurants.

## Project structure

```
src/
  app/
    api/
      auth/            login, register, logout, session
      restaurant/      owner-only CRUD, reordering, duplication, settings and stats
      public/          read-only public menu data
      upload/          authenticated Cloudinary upload/delete
    dashboard/         owner dashboard (overview, menu builder, QR code, settings)
    menu/[slug]/       public menu page
    login/, register/  auth pages
  components/          dashboard, menu, currency, image and emoji components
  lib/                 db connection, auth, env, validation schemas, helpers
  models/              Mongoose models (User, Restaurant, Category, MenuItem, Order)
  types/               shared TypeScript types
tests/
  lib/                 unit tests for pure helpers and schemas
  api/                 route handler tests against an in-memory MongoDB
  components/          React Testing Library tests
```

## Getting started

### Prerequisites

- Node.js 20 or newer, and npm
- A MongoDB database (a free MongoDB Atlas cluster works, as does a local `mongod`)
- A Cloudinary account (the free tier is enough), needed only for image uploads

### Environment variables

Copy the example file and fill in the values:

```bash
cp .env.example .env.local
```

| Variable | Description |
| --- | --- |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Long random string used to sign session tokens (`openssl rand -base64 48`) |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `NEXT_PUBLIC_BASE_URL` | Public URL of the app, used in QR code links |

### Install and run

```bash
npm install
npm run dev
```

Open http://localhost:3000, create an account, add a restaurant, and build your menu.

### Quality checks

```bash
npm run lint        # ESLint
npm run typecheck   # tsc --noEmit
npm test            # Vitest (uses an in-memory MongoDB, no setup needed)
npm run build       # production build
npm start           # serve the production build
```

## Roadmap

- Multi-language item names and descriptions (MK/EN) edited from the dashboard
- Restaurant profile settings: logo, address, opening hours, default currency
- Menu analytics (views and QR scans per day)
- Table ordering that builds on the existing `Order` model
- Live exchange rates instead of fixed conversion values
- Password reset by email
