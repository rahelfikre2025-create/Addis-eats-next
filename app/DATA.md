# Addis Eats — Data Fetching Notes

## 1. Shared Fetcher

The project uses one shared fetcher:

```js
export const fetcher = (url) =>
  fetch(url).then((res) => res.json());
```

SWR uses this function whenever it needs to request data from an API.

---

## 2. Customer Order Tracking

The tracking page receives an initial order snapshot from the server, then
connects to a server-sent event stream:

```text
/api/orders/${id}/stream
```

The stream sends the latest status history and delivery updates when staff
changes an order. The browser reconnects automatically if the connection drops.
The API checks that the signed-in customer owns the order before opening the
stream.

This updates the page without polling. Order records and events are kept in
server memory, so updates are shared only within the same running process.

---

## 3. Menu Search

The menu search filters the small, static dish list in the browser as the
visitor types. It does not wait for a debounce timer or make an API request per
search term.

Menu cards use pre-sized local WebP image variants. The browser selects between
the 400px and larger source using `srcSet` and `sizes`, so menu images do not
need per-request image optimization. The first card image is eager and high
priority; the remaining images load lazily.

---

## 4. Pagination

Menu cards and pagination are rendered on the server. The page and category
are encoded in the URL, and ordinary links let Next.js serve the requested
page without shipping a client-side pagination component:

```text
/menu?page=${page}
```

When a category is selected, the category is preserved in the URL:

```text
/menu?category=Ethiopian&page=2
```

Category, pagination, and dish links disable automatic prefetching to avoid
fetching pages the visitor has not selected. Next.js can still reuse visited
routes through its client router cache.

### Page Size

The menu displays 4 dishes per page.

With 8 dishes:

```text
Page 1 → dishes 1–4
Page 2 → dishes 5–8
```

---

## 5. Summary of Query Keys

| Feature         | Query Key                        | Purpose                          |
| --------------- | -------------------------------- | -------------------------------- |
| Order tracking  | `/api/orders/${id}/stream`       | Receive live status and delivery updates |
| Menu search     | Local dish data                  | Filter dish names as the user types |
| Menu pagination | `/menu?page=${page}`              | Server-render a specific page       |

---

## 6. Why SWR Is Used

SWR is useful for the client-side parts of Addis Eats because these features need changing browser data:

* Order status polling

The menu search and pagination do not require SWR because their data is static
and available to the server-rendered page.

## 7. Browser Favorites and Checkout Data

Favorites are stored in browser localStorage under a separate key for each
authenticated user ID. Signed-out visitors use a separate guest key. Guest
favorites are not merged into an account at sign-in, and the previous shared
favorites key is not imported because its owner cannot be identified safely.

Orders record the selected `deliveryLocation`, an optional
`customDeliveryLocation` when `Other` is selected, and the selected
`paymentMethod`. The location choices are application options, not verified
delivery-service areas. Payment methods are demo-only selections: the
application does not process payment or mark orders as paid.

Orders, sessions, and idempotency records remain in server memory and are not
durable across server restarts or multiple instances.

Order status history and delivery notes are also stored on the in-memory order
records. Staff updates are shared by the management page, kitchen display, and
customer tracking page while they are served by the same running process, but
are not durable across restarts or separate serverless instances. The customer
tracking page reports manual staff updates and can display a saved destination
coordinate; it does not show live GPS movement, a route, or an ETA.

The menu is read from `public/menu-data.json`. There is no menu-management
interface or persistent menu store. A dish with `available: false` is filtered
from customer menu/API results and rejected by order creation, but editing
availability in the JSON file is a developer operation rather than an admin
feature.

The customer tracking page displays a Leaflet map using public OpenStreetMap
tiles; tiles need an internet connection and no API key is required. The
restaurant marker is an illustrative demo location, not verified business
coordinates. A destination marker appears only if staff saves valid,
customer-confirmed or otherwise verified coordinates in the delivery details.
Staff enter optional coordinates as numbers; the system does not infer a pin
from a neighborhood name or geocode addresses. The current checkout does not
collect map coordinates, so orders without staff-entered verified coordinates
show a clear unavailable-destination message.
The map does not show a driver's live position, a route, or an ETA. Any saved
coordinates and delivery progress share the same in-memory order record and
have the same restart and multi-instance limitations as the order itself.
