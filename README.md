# Children Hope Foundation

A full-stack fundraising MVP for education, healthcare, and food support for children in Africa.

## Stack

- `client/`: React, Vite, TypeScript, Tailwind CSS
- `server/`: Express, TypeScript, Prisma, PostgreSQL
- Payments: Paystack (USD, subject to account USD activation)
- Authentication: JWT stored in an httpOnly cookie
- Email: Resend

## Local setup

1. Install dependencies from the project root:

   ```sh
   npm install
   ```

2. Configure `server/.env` using the variables below. Use your local PostgreSQL database and Paystack test credentials during development.

   ```env
   DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/children_hope_db?schema=public"
   PORT=5000
   CLIENT_URL=http://localhost:5173
   JWT_SECRET=replace-with-a-long-random-secret
   SEED_ADMIN_PASSWORD=choose-a-unique-password-of-at-least-12-characters
   PAYSTACK_SECRET_KEY=sk_test_...
   PAYSTACK_PUBLIC_KEY=pk_test_...
   RESEND_API_KEY=re_...
   RESEND_DEMO_MODE=true
   MAIL_FROM=Children Hope Foundation <onboarding@resend.dev>
   ADMIN_EMAIL=admin@example.com
   ```

   Local email demo mode routes messages to Resend's test inbox. Configure `MAIL_FROM` with a verified domain when sending real email. USD payments also require Paystack to enable USD for your account. Put valid Paystack test keys in `server/.env`, then run `npm run setup:paystack` to validate them without printing the keys.

3. Create the PostgreSQL database, apply the Prisma schema, and seed an admin account:

   ```sh
   createdb children_hope_db
   npm run db:push
   npm run db:seed
   ```

   If the database already exists, skip `createdb`. Set `SEED_ADMIN_PASSWORD` in `server/.env` before seeding.

   The seed admin account is `admin@childrenhope.org`; its password is read from `SEED_ADMIN_PASSWORD` so the repository does not seed a known credential.

4. Start the backend and frontend in separate terminals:

   ```sh
   npm run dev:server
   npm run dev:client
   ```

   Open <http://localhost:5173>. The Vite dev server proxies `/api` requests to the backend on port 5000.

## Build

```sh
npm run build
```

This builds the client and type-checks/compiles the server. `npm run build:client` and `npm run build:server` are also available individually.

For local production-style processes, run `npm run start:server` and host `client/dist` as static files with `/api` routed to the server. `npm run preview:client` previews the built client locally.

## Main routes

- Public site: campaigns, campaign details, donation, about, contact, and transparency
- Donor: account registration/login and donation history
- Admin: campaign management and donation reports/CSV export

Paystack payments require valid test or live API keys and a publicly reachable webhook URL for webhook-based confirmation. Local development defaults to Resend demo mode, which sends to `delivered@resend.dev` through Resend's test sender. Set `RESEND_DEMO_MODE=false` and use a verified sending domain before production deployment.
