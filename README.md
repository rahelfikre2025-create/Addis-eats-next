# Addis Eats

Addis Eats is a responsive food-ordering application built with Next.js. It
showcases Ethiopian and international dishes and includes customer-facing
flows for browsing, saving favorites, managing a cart, and placing and tracking
orders.

## Features

- Browse dishes by category, search the menu, and navigate paginated results.
- Open dish detail pages with shareable metadata and social preview images.
- Save favorite dishes and find them on the Favorites page.
- Add dishes to a cart and continue through checkout.
- Sign in and view order-related pages; staff-facing kitchen and dashboard
  pages are also included.
- Switch between light and dark themes.
- Use responsive layouts and optimized images for mobile and desktop.

## Tech stack

- Next.js 16 App Router
- React 19
- JavaScript and JSX, with TypeScript configuration for the Next.js project
- CSS
- SWR for client-side data that needs revalidation
- Leaflet and React Leaflet for map features
- Recharts for charts

## Requirements

- Node.js 20.9 or newer
- npm

## Getting started

From this directory, install the dependencies and start the development server:

```bash
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

No custom environment variables are currently required. The
[`.env.example`](./.env.example) file is included as a reference.

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for instructions to deploy a restricted
Vercel demo and important limitations of the in-memory demo accounts and data.

## Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Next.js development server. |
| `npm run lint` | Run ESLint. |
| `npm run build` | Create an optimized production build. |
| `npm run start` | Serve the production build. Run `npm run build` first. |

## Project structure

```text
app/
  api/          Route handlers for application data
  cart/         Shopping cart
  checkout/     Checkout flow
  components/   Shared UI components
  context/      Shared cart and favorites state
  favorites/    Saved dishes
  menu/         Menu, search, filters, and dish pages
  orders/       Customer order pages
  lib/          Shared application utilities
  page.js       Home page
public/
  images/       Static image assets
  menu-data.json Dish catalog
```

## Data and demo behavior

The dish catalog is maintained in [`public/menu-data.json`](./public/menu-data.json).
Menu category filtering and pagination are server-rendered; search filters the
small local catalog in the browser. Cart and favorites state are shared through
React context.

Authentication uses an in-memory session store and sample users in the
application source. This setup is for demonstration and local development; it
is not suitable for production use or persistent multi-instance deployments.

## Performance

See [PERF.md](./PERF.md) for the latest reported Lighthouse measurements,
historical menu results, and the optimizations currently in place. Lighthouse
scores are estimates and should be compared across repeated runs under matching
conditions.
