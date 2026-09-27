# Children Hope Foundation

Full-stack platform for a nonprofit providing **education, healthcare and food support** to children in Africa.

| Layer    | Tech |
|----------|------|
| Frontend | React 18 + Vite + TypeScript + Tailwind CSS + React Router |
| Backend  | Node.js + Express + TypeScript |
| Database | PostgreSQL + Prisma ORM |
| Payments | Paystack (NGN card/bank/USSD + international cards) |
| Auth     | JWT in httpOnly cookies |
| Email    | Nodemailer (donor receipts + admin alerts) |

## Project structure

```
├─ client/            React SPA (Vite)
│  └─ src/
│     ├─ components/  Navbar, Footer, CampaignCard, DonateForm, ...
│     ├─ context/     AuthContext (JWT session)
│     ├─ hooks/       useAuth, useCampaigns, useDonations
│     ├─ lib/         typed API client
│     ├─ pages/       public + auth + dashboard pages
│     │  └─ admin/    admin console pages
│     └─ types/       shared TS types
└─ server/            Express API
   └─ src/
      ├─ controllers/ route logic
      ├─ middleware/  auth, error handler, rate limiters
      ├─ routes/      auth, campaigns, donations, admin
      ├─ services/    paystack, email
      └─ lib/         prisma singleton
```

## Quick start

```bash
# 1. Install
npm install

# 2. Configure — fill in your Postgres URL + Paystack test keys in .env
cp .env .env.local   # (or edit .env directly)

# 3. Database
npm run db:push      # create tables from schema
npm run db:seed      # admin user + sample campaigns

# 4. Run (API on :4000, web app on :5173)
npm run dev
```

### Production build

```bash
npm run build        # compiles server (dist/) and client (dist/)
npm run start -w server
```

The server serves the built client from `client/dist` when `NODE_ENV=production`, so a single `node server/dist/index.js` process can serve the whole app.

## Seeded accounts

| Role  | Email                     | Password    |
|-------|---------------------------|-------------|
| Admin | `admin@childrenhope.org`  | `Admin123!` |
| Donor | `donor@example.com`       | `Donor123!` |

## Paystack flow

1. `POST /api/donations/initialize` — server creates a `PENDING` donation, calls Paystack's `transaction/initialize`, returns the hosted `authorization_url`.
2. Donor completes payment on the Paystack page (test cards: `4084 0840 8408 4081`, any future expiry, CVV `408`).
3. Paystack redirects to `/donate/success?reference=...`; the client calls `POST /api/donations/verify`.
4. Server verifies the transaction with Paystack and marks the donation `SUCCESS` (or `FAILED`), sends the receipt email, and alerts admins.
5. `POST /api/donations/webhook` — idempotent Paystack webhook as a backup path (HMAC-SHA512 signature verified with the secret key).

## Security notes

- JWT stored in an httpOnly, SameSite=Lax cookie; password hashing with bcryptjs.
- Zod validation on every write endpoint.
- Rate limiting on auth and donation endpoints.
- Paystack webhook signature verification; idempotent handling by reference.
- Admin routes guarded by role middleware.

## Deployment checklist

- [ ] Strong `JWT_SECRET`
- [ ] Live Paystack keys + real webhook URL (`/api/donations/webhook`) registered in the Paystack dashboard
- [ ] Managed Postgres (Neon/Supabase/RDS) and `prisma migrate deploy`
- [ ] SMTP credentials (Gmail app password, Postmark, SES…) for receipts
- [ ] `CLIENT_URL` set to the public origin (used for Paystack callbacks)
