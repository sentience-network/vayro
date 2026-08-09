# Vayro

**Vayro — Rent anything that moves.** A production-oriented peer-to-peer marketplace for cars, RVs, boats, motorcycles, trailers, and recreational vehicles.

## What works

Secure registration/login/logout; renter, owner, and admin roles; location/date/category/price discovery; listing details and multi-photo upload; owner listing creation, editing, pausing, and availability blocks; transactional overlap prevention; booking requests and owner decisions; favorites; saved searches; renter trips; owner earnings/bookings; user messaging and notifications; reviews/ratings; support tickets; pending vehicle-verification submissions; and admin user/listing disable controls.

Pricing supports weekly, monthly, and yearly Vayro Plus plans. Booking accounting applies a 10% standard fee or 7.5% active-member fee, while each owner chooses renter-paid, owner-paid, or split fees. Stripe checkout and customer portal endpoints activate only with genuine Stripe keys and Price IDs. Insurance, tracker, identity, email, Cloudinary, and maps remain clearly labeled integration boundaries; no payment, insurance, tracking, or identity result is simulated.

## Local setup

Requires Node 20+ and PostgreSQL.

```bash
npm ci
cp .env.example .env
npm run db:migrate
npm run db:seed
npm run dev
```

Demo password for every account: `VayroDemo2026!`

- Renter: `renter@vayro.test`
- Owner: `owner@vayro.test`
- Admin: `admin@vayro.test`

## Production / Render domain

The included `render.yaml` provisions a Node web service and Render PostgreSQL database. Push this project to GitHub, then in Render choose **New → Blueprint**, connect the repository, and apply it. Render assigns an HTTPS address such as `https://vayro.onrender.com`; the exact available hostname is chosen by Render. Set `NEXT_PUBLIC_APP_URL` to that address and redeploy, then seed once from a Render shell:

```bash
npm run db:seed
```

Do not put seeding in the start command: the demo seed resets data. Build is `npm ci && npm run build`; start is `npm run db:deploy && npm run start`; health check is `/api/health`.

For a custom domain, add the domain in the Render service's **Settings → Custom Domains** page and copy Render's DNS records to the domain registrar. Keep the generated `onrender.com` address enabled as a fallback.

## Security notes

Passwords use bcrypt (cost 12); sessions are signed HTTP-only, same-site cookies; mutations enforce ownership/roles on the server; inputs use Zod; bookings use a database transaction and overlap query. For high-contention production inventory, add a PostgreSQL exclusion constraint or serializable retry around date ranges.

## Optional production service credentials

- Stripe Billing/Connect: `STRIPE_SECRET_KEY`, `STRIPE_CONNECT_CLIENT_ID`, `STRIPE_PLUS_WEEKLY_PRICE_ID`, `STRIPE_PLUS_MONTHLY_PRICE_ID`, `STRIPE_PLUS_YEARLY_PRICE_ID`, `STRIPE_WEBHOOK_SECRET`
- Cloudinary: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- Email (example: Resend): `RESEND_API_KEY`
- Maps (example: Mapbox): `MAPBOX_ACCESS_TOKEN`
- Identity vendor: `IDENTITY_PROVIDER_API_KEY`

Never commit these secrets. Until they are configured, Vayro shows honest unavailable/pending states instead of fake success.
