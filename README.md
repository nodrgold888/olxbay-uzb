# OLXbay — eBay-style marketplace for Uzbekistan

A classifieds/marketplace MVP: users register, post listings with photos,
browse/search/filter by category (with OLX-style subcategories), city, and
price; message sellers directly; and buy through an escrow checkout instead
of paying the seller directly.

**Escrow, not OLX-style direct payment.** On classic OLX-type sites the buyer
pays the seller directly (card-to-card), so a scammer can take the money and
disappear. This app instead follows the eBay model: the buyer pays the
platform, the platform holds the money in escrow, and it's only released to
the seller after the buyer receives the item and confirms it. Seller contact
info is hidden from the buyer until payment is placed in escrow, so there's
no way to get steered into paying the seller off-platform before that point.

## Stack
- **Backend**: Node.js, Express, Prisma ORM, PostgreSQL, JWT auth, Multer
  for image uploads.
- **Frontend**: React 18 + Vite, React Router, Axios.

## Requirements
Node.js 24 LTS and PostgreSQL 17 are installed on this machine (via
winget). If setting up elsewhere: Node.js 18+ (https://nodejs.org) and a
PostgreSQL server (https://www.postgresql.org/download/) or any hosted
Postgres.

## Local setup

### 1. Database
Create a database (this machine uses a local Postgres with a database
named `olxbay`, user `postgres`, password `postgres` — adjust `DATABASE_URL`
in `backend/.env` to match your own setup).

### 2. Backend
```bash
cd backend
npm install
npx prisma migrate dev --name init
npm run seed
npm run dev
```
Runs on http://localhost:4000. Seed creates the category tree plus two demo
sellers: `demo@ebayuz.uz` / `password123` and `aziz@ebayuz.uz` /
`password123`.

**Test mode**: `/api/auth/login` currently accepts *any* password — an
unknown email auto-registers on the spot. This is a deliberate shortcut for
quick demoing (see the comment in `backend/src/routes/auth.js`); revert it
(restore the `bcrypt.compare` check) before this app is ever used for real.

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```
Runs on http://localhost:5173 and proxies `/api` and `/uploads` to the
backend in dev. In production, point it at the deployed backend via the
`VITE_API_URL` env var (e.g. `https://olxbay-backend.onrender.com/api`).

## Deploying so it works when your PC is off
See [DEPLOY.md](DEPLOY.md) — a `render.yaml` Blueprint deploys the backend,
frontend, and a Postgres database to Render.com's free tier from this repo.

## Features
- Register / login / one-click guest login (throwaway account, no form)
- Post a listing with title, description, price/currency, city,
  subcategory, photo
- Browse and search listings; filter by category **and subcategory**
  (OLX-style — e.g. Elektronika → Telefonlar, Kompyuterlar, ...), city,
  price range
- **Quick view**: hover a listing card's photo for an eye button that opens
  a preview modal without leaving the grid
- **Buyer/seller chat**: message a seller directly from any listing page
  (`Sotuvchiga yozish`), independent of any purchase; thread view polls for
  new messages every 4s
- **Escrow checkout**: Buy → dedicated checkout page (Click/Payme/card method
  picker, simulated card form with validation) → held by platform → seller
  ships → buyer confirms receipt → funds released to seller. Buyer can open a
  dispute instead of confirming if the item never arrives or isn't as described.
- **Listing reservation**: a listing locks (`reserved`) the instant a buyer
  starts checkout, not just once they pay — so two buyers can't both end up
  with a pending order on the same item. Cancelling checkout releases it;
  an abandoned reservation auto-expires after 30 minutes.
- "My listings", "Xaridlarim" (purchases), "Sotuvlarim" (sales), "Xabarlar"
  (chat) pages
- Light/dark theme toggle (persisted), responsive down to phone widths
- Uzbekistan-flavored seed data: cities, category names in Uzbek, ~35
  listings across every subcategory

## How the escrow flow works
Order status machine (`backend/src/routes/orders.js`):
```
PENDING_PAYMENT --(buyer pays)--> PAID_ESCROW --(seller ships)--> SHIPPED --(buyer confirms)--> RELEASED
                                        |                              |
                                        +---------(buyer disputes)-----+--> DISPUTED
```
Listing status tracks alongside it: `active` → `reserved` (order created) →
`sold` (paid). Cancelling a `PENDING_PAYMENT` order, or letting it sit
unpaid past 30 minutes, moves the listing back to `active`.

The `/pay` endpoint (called from the checkout page,
`frontend/src/pages/Checkout.jsx`) is a **mock** — it just flips the order
to `PAID_ESCROW` with no real money movement, so the flow can be tried end
to end without a payment processor. The checkout UI (payment method picker,
card form with client-side validation) is real; only the actual charge is
simulated. `DISPUTED` orders aren't auto-resolved; that's meant to be picked
up by a support/admin process.

There's also a `/demo-advance` endpoint and a matching "🧪 Demo" button on
the order page: it lets either party trigger the *other* side's next step
(ship / confirm), so the whole flow can be tried solo without two accounts.
**Delete this before any real deployment** — it deliberately skips the
buyer/seller role check.

## Going to real payments
To actually hold and move money you need a merchant integration — in
Uzbekistan that's normally **Payme** or **Click**. That requires signing up
for a merchant account with them and getting API credentials; I can't create
those for you. When you have them, swap the mock `/orders/:id/pay` handler
for a real charge flow: create a Payme/Click transaction for the order
amount, and only mark the order `PAID_ESCROW` from that gateway's webhook
callback (never trust the browser to say "I paid"). Releasing escrow to the
seller then means a real payout via the same gateway.

## Next steps to consider
- Restore real password checking in `/api/auth/login` and delete
  `/api/orders/:id/demo-advance` before any real use
- Wire a real Payme/Click merchant integration (see above)
- Move uploaded photos to external storage (Cloudinary/S3) — the free
  hosting tier's disk is ephemeral, so uploads don't survive a redeploy
- Add pagination controls in the UI (API already supports `page`/`pageSize`)
- Add an admin view for resolving `DISPUTED` orders (refund vs. release)
- Add favorites/saved listings
