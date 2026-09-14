# Deploying to Render (so it works even when your PC is off)

This repo includes a `render.yaml` "Blueprint" that sets up three things
automatically: the backend API, the frontend, and a Postgres database. You
only need to do the sign-in step yourself — everything else is scripted.

## Steps

1. Go to https://render.com and sign up / log in (GitHub login is easiest).
2. Click **New +** → **Blueprint**.
3. Connect your GitHub account if asked, then pick the `olxbay-uzb` repo
   (`nodrgold888/olxbay-uzb`).
4. Render will read `render.yaml` from the repo root and show you a plan:
   one Postgres database, one web service (`olxbay-backend`), one static
   site (`olxbay-frontend`). Click **Apply** / **Create**.
5. Wait for all three to finish deploying (a few minutes — the backend
   build runs migrations and seeds the database automatically).
6. Open the `olxbay-frontend` service's URL (looks like
   `https://olxbay-frontend.onrender.com`) — that's your public link.

## If the frontend can't reach the backend

`render.yaml` guesses the backend's URL will be
`https://olxbay-backend.onrender.com`. Render usually assigns exactly that
(based on the service name), but if it added a suffix (e.g. because the
name was taken), fix it:

1. On the `olxbay-backend` service page, copy its actual URL.
2. Go to `olxbay-frontend` → **Environment**, edit `VITE_API_URL` to
   `<that backend URL>/api`.
3. Trigger a redeploy of `olxbay-frontend` (Manual Deploy → Deploy latest
   commit) — env var changes need a rebuild to take effect on a static site.

## What to expect on the free tier

- **Cold starts**: a free web service spins down after 15 minutes with no
  traffic. The next visit takes ~30-60 seconds to wake back up — that's
  normal, not broken.
- **Uploaded photos don't persist**: the backend's `/uploads` folder lives
  on the free tier's ephemeral disk, so images uploaded via the "post a
  listing" form are lost whenever the service restarts or redeploys.
  Seed-data listings are unaffected (they use no photo, just the
  category-emoji placeholder). Fixing this for real would mean wiring in
  an external file store (e.g. Cloudinary, S3) — out of scope here.
- **Database persists** independently of the web service, so accounts,
  listings, orders, and chat messages survive restarts/redeploys.
- **Test-mode login is still active**: any email + any password logs in
  (see the comment in `backend/src/routes/auth.js`). Fine for a demo link
  you're sharing casually; revisit before this is ever a real product.

## Updating the deployed app later

Render redeploys automatically on every push to `master` (both services
are connected to the GitHub repo). Just `git push` as usual.
