# Day48 Vercel Demo Deployment

This guide deploys Day48 as a class/demo preview. It is **not a production
deployment**: sign-in accounts are hard-coded, their credentials are shown on
the sign-in page, and sessions and orders are stored only in server memory.

## Deploy from GitHub

1. Push the Day48 project to a GitHub repository.
2. In Vercel, choose **Add New → Project** and import that repository.
3. Set the **Root Directory** to
   `module-03-react-nextjs/Days/Day48`.
4. Keep the detected **Next.js** framework preset and default build command
   (`npm run build`).
5. Use Node.js **20.9 or newer**. `package.json` declares this minimum.
6. No environment variables are required for the current demo. Do not copy
   local secret values into the deployment.
7. Deploy, then use the generated preview URL to check the sign-in, menu, and
   order pages.

If this repository is private or the preview should not be public, enable
Vercel Deployment Protection in the project settings.

## Demo-only limitations

- Anyone who can reach the sign-in page can see and use the sample customer
  accounts and the staff account. The staff credentials grant staff features.
- Sessions, orders, order history, delivery notes, and map coordinates use
  in-memory storage. Serverless instances and cold starts do not share or
  preserve that data, so authentication and order workflows may not behave
  consistently after deployment.
- Order tracking uses a long-lived server-sent event request. A serverless
  function can end that request at its configured duration limit, after which
  the browser will try to reconnect.
- Payments are demo-only; no payment is taken or verified.

Do not use this deployment for real customers, sensitive information, or
business operations. A real production release needs persistent shared storage,
real account management with protected staff access, and a production payment
provider if online payments are offered.

## Verify a deployment

- Sign in with one sample account and sign out.
- Browse menu pages and verify images and map tiles load.
- Check the customer and staff pages at desktop and mobile widths.
- Place a test order and check the confirmation and tracking pages, keeping in
  mind that serverless instance changes may lose the in-memory order.
- Review the Vercel deployment logs for build or runtime errors.
