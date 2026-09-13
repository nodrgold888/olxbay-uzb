# OLXbay — eBay-style marketplace for Uzbekistan

A classifieds/marketplace MVP: users register, post listings with photos,
browse/search/filter by category, city, and price.

**Escrow, not OLX-style direct payment.** On classic OLX-type sites the buyer
pays the seller directly (card-to-card), so a scammer can take the money and
disappear. This app instead follows the eBay model: the buyer pays the
platform, the platform holds the money in escrow, and it's only released to
the seller after the buyer receives the item and confirms it. Seller contact
info is hidden from the buyer until payment is placed in escrow, so there's
no way to get steered into paying the seller off-platform before that point.

## Stack
- **Backend**: Node.js, Express, Prisma ORM, SQLite (swap to Postgres by
  changing `provider` in `backend/prisma/schema.prisma` and `DATABASE_URL`
  in `backend/.env`), JWT auth, Multer for image uploads.
- **Frontend**: React 18 + Vite, React Router, Axios.

## Requirements
Node.js 24 LTS is installed on this machine (via winget). If setting up
elsewhere, install Node.js 18+ first (https://nodejs.org).

## Setup

### 1. Backend
```bash
cd ebay-uzb/backend
npm install
npx prisma migrate dev --name init
npm run seed
npm run dev
```
Runs on http://localhost:4000. Seed creates categories plus a demo account:
`demo@ebayuz.uz` / `password123`.

### 2. Frontend
```bash
cd ebay-uzb/frontend
npm install
npm run dev
```
Runs on http://localhost:5173 and proxies `/api` and `/uploads` to the
backend.

## Features
- Register / login (JWT, bcrypt-hashed passwords)
- Post a listing with title, description, price/currency, city, category, photo
- Browse and search listings; filter by category, city, price range
- **Escrow checkout**: Buy → dedicated checkout page (Click/Payme/card method
  picker, simulated card form with validation) → held by platform → seller
  ships → buyer confirms receipt → funds released to seller. Buyer can open a
  dispute instead of confirming if the item never arrives or isn't as described.
- **Listing reservation**: a listing locks (`reserved`) the instant a buyer
  starts checkout, not just once they pay — so two buyers can't both end up
  with a pending order on the same item. Cancelling checkout releases it;
  an abandoned reservation auto-expires after 30 minutes.
- "My listings", "Xaridlarim" (purchases), "Sotuvlarim" (sales) pages
- Uzbekistan-flavored seed data (cities, category names in Uzbek)

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

The `/pay` endpoint (called from the checkout page, `frontend/src/pages/
Checkout.jsx`) is a **mock** — it just flips the order to `PAID_ESCROW` with
no real money movement, so the flow can be tried end to end without a
payment processor. The checkout UI (payment method picker, card form with
client-side validation) is real; only the actual charge is simulated.
`DISPUTED` orders aren't auto-resolved; that's meant to be picked up by a
support/admin process.

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
- Switch SQLite → PostgreSQL for production
- Wire a real Payme/Click merchant integration (see above)
- Add pagination controls in the UI (API already supports `page`/`pageSize`)
- Add an admin view for resolving `DISPUTED` orders (refund vs. release)
- Add favorites/saved listings, in-app messaging between buyer and seller
- Deploy: e.g. Railway/Render for backend + Postgres, Vercel/Netlify for frontend
