# Addis Eats Authentication

## 1. Session Authentication

After a successful sign-in, Addis Eats creates a session and stores the session ID in a cookie.

The cookie uses:

* `httpOnly` — JavaScript cannot read it.
* `secure` — sent only over HTTPS in production.
* `sameSite: "lax"` — helps protect against cross-site requests.

`lib/session.js` provides `getSession()` to find the currently signed-in user.

The navigation shows a profile menu for signed-in users. Its **Sign Out** action invalidates the current session and removes the session cookie.

Invalid sign-in credentials are reported on the sign-in page. Customer accounts
return to a safe requested internal page (or `/`); staff accounts are sent to
`/dashboard`.

---

## 2. Proxy Protection

The Next.js Proxy protects:

* `/checkout`
* `/orders`

If there is no `session` cookie, the user is redirected to:

`/sign-in?next=...`

The matcher only protects these private routes.

---

## 3. Return to the Original Page

The `next` parameter remembers where the user wanted to go.

Example:

`/sign-in?next=/checkout`

After signing in, the user is sent back to `/checkout`.

For security, external destinations are rejected.

---

## 4. Orders Protection

The orders page uses `getSession()` to check the user.

The API also checks the session and makes sure the order belongs to the signed-in user.

A user cannot view another user's order.

Orders are stored in server memory for this demo and are cleared when the server process restarts. Use a database for durable order storage.

---

## 5. Staff Route

The `/kitchen` and `/delivery` pages and their order-list API access are for staff members only.
Staff order updates are checked by the order API and validated against the
permitted status transitions. Customers can read only their own order records
and cannot update statuses or delivery notes.

The server checks:

```text
user.role === "staff"
```

Customers are denied access.

---

## 6. Security Layers

Addis Eats uses several checks:

1. **Proxy** — redirects signed-out visitors from private routes.
2. **Page** — checks the session before showing private content.
3. **API/Server code** — checks the user before allowing protected actions.

The server checks are important because hiding something in the UI is not real security.

---

## 7. Sample Accounts

These local sample accounts are checked by the existing sign-in flow.

* Almaz (customer): `almaz@addis-eats.com` / `kitfo123`
* Dawit (customer): `dawit@addis-eats.com` / `tibs456`
* Chef Hana (staff): `staff@addis-eats.com` / `kitchen789`

## 8. Testing

Test that:

* A signed-out user cannot open `/checkout`.
* A signed-out user cannot open `/orders`.
* A customer cannot access `/kitchen`.
* A customer cannot view another customer's order.
* An unsafe external `next` URL is rejected.
