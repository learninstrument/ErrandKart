# ErrandKart Backend (Express + TypeScript)

## Quick start

1. Copy `.env.example` to `.env` and fill all values.
2. Install dependencies:
   - `npm install`
3. Run development server:
   - `npm run dev`

## Supabase SQL scripts

Run in order inside Supabase SQL editor:

1. `supabase/001_auth_setup.sql`
2. `supabase/002_core_schema.sql`
3. `supabase/003_rls_policies.sql`
4. `supabase/004_storage.sql`

## Current endpoints

- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `POST /api/auth/resend`
- `GET /api/auth/google/start?role=customer|runner|supermarket`
- `GET /api/auth/google/callback`
- `POST /api/webhooks/paystack`
- `POST /api/wallet/withdraw` (auth: runner)
- `POST /api/supermarkets/register` (auth: optional)
- `PATCH /api/admin/supermarkets/:id/verification` (auth: admin)
- `GET /api/admin/supermarkets` (auth: admin)
- `GET /api/admin/support/tickets` (auth: admin)
- `GET /api/admin/ratings` (auth: admin)
- `GET /api/admin/tracking/active` (auth: admin)

## Auth expectations

- Protected endpoints require `Authorization: Bearer <access_token>`.
- Sessions come from `/api/auth/login`, `/api/auth/register`, or Google OAuth.
- Email confirmation is required for new signups (Supabase built-in verification).

## Paystack webhook notes

- Webhook expects `charge.success`.
- It resolves the user by `data.metadata.user_id` (preferred) or `data.customer.email`.

## Frontend route mapping

| Frontend route | Backend endpoint | Tables |
| --- | --- | --- |
| `/supermarket/register` | `POST /api/supermarkets/register` | `supermarket_profiles` |
| `/admin/supermarkets` | `PATCH /api/admin/supermarkets/:id/verification` | `supermarket_profiles` |
| `/admin/support` | (to be wired) | `support_tickets`, `order_ratings` |
| `/admin/tracking` | (to be wired) | `orders` |
| Login/Register | `POST /api/auth/login`, `POST /api/auth/register` | `users` |

## Environment variables

## Environment variables

Required in `.env`:

- `NODE_ENV`
- `PORT`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_ANON_KEY` (recommended for login flow)
- `APP_ORIGIN` (frontend origin for OAuth callback redirect)
- `API_BASE_URL` (backend public origin for OAuth callback)
- `PAYSTACK_SECRET_KEY`
- `PAYSTACK_WEBHOOK_SECRET` (shared secret string for webhook signature validation)

