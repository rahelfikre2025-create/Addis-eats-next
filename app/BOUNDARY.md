# Addis Eats Server / Client Boundary

## Server Components

Most of the application uses Server Components.

Examples:

* `app/page.js` — loads today's specials
* `app/menu/page.js` — loads and filters dishes
* `app/menu/[id]/page.js` — loads one dish
* `app/layout.js` — root application shell
* `app/menu/layout.js` — menu layout
* `app/checkout/layout.js` — checks the user's authentication cookie

Server Components are used because these parts do not need browser-only interaction.

## Client Components

Client Components are used only when browser interaction is required.

### `app/context/CartContext.js`

Uses React state and localStorage to keep the cart in the browser.

### `app/components/AddToCartButton.js`

Needs client-side interaction because the user clicks the button to add a dish to the cart.

### `app/cart/page.js`

Needs client-side cart state so the user can increase, decrease, remove, and clear cart items.

### `app/checkout/page.js`

Uses `useActionState` to handle the checkout form and display submission status.

### `app/menu/error.js`

Must be a Client Component because Next.js error boundaries require client-side behavior.

## Boundary Principle

The application keeps data fetching and rendering on the server whenever possible.

Client JavaScript is used only for:

* browser state
* localStorage
* button interactions
* interactive forms
* error recovery

This keeps the Client Component boundary as small as possible while still providing the required functionality.

## Data Flow

**Server Components → read data**

**Client Components → handle browser interaction**

**Server Actions → securely write data**

**Route Handlers → provide API endpoints for external callers**

The goal is to avoid adding `"use client"` unless the component actually needs browser or interactive behavior.
