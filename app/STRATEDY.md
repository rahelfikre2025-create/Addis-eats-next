# Addis Eats Rendering Strategy

## Route Rendering Decisions

| Route | Strategy | Reason |
|---|---|---|
| `/` | Static | The home page is public and does not depend on a user or request. Today's specials come from the menu data and can be pre-rendered. |
| `/menu` | ISR | The menu data does not need to change on every request. It can be refreshed every 3600 seconds while still supporting category filtering through the URL. |
| `/menu/[id]` | SSG | Dish IDs are known from the menu data, so `generateStaticParams()` pre-renders the known dish pages. |
| `/cart` | Client | The cart belongs to the user's browser and uses client-side state and localStorage. |
| `/checkout` | Dynamic | Checkout depends on the signed-in user's cookie, so it must be rendered dynamically. |
| `/sign-in` | Static | The sign-in page itself does not require user-specific data before submission. |
| `/api/dishes` | Route Handler | Provides dish data through a server endpoint. |
| `/api/dishes/[id]` | Route Handler | Provides one dish through a dynamic API endpoint. |
| `/api/orders` | Route Handler | Accepts and validates order requests from outside callers. |

## Why These Strategies?

### Static

Static pages are used when the content does not depend on the individual request.

Example:

`/`

The home page is public and can be generated ahead of time.

### ISR

The menu uses:

export const revalidate = 3600;