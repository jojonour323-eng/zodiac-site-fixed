# Celestial

A Next.js astrology app. Birth charts, compatibility, red flags, and kink
test — all calculated **100% locally** with Swiss Ephemeris. No external
astrology or geocoding API, no Railway microservice dependency, nothing
that can go down.

## Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

## Deploy on Railway

1. Go to [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo** → pick this repo.
2. Railway auto-detects `railway.json` and `nixpacks.toml` in this repo — no manual config needed. It will:
   - Install build tools (`python3`, `gcc`, `make`) so the native `swisseph` package compiles correctly.
   - Run `npm install && npm run build`.
   - Start the app with `npm run start`.
3. In the Railway dashboard, go to **Variables** and add:
   ```
   COLLECT_VIEW_TOKEN=<pick your own random secret>
   ```
   This protects the `/api/collect` endpoint that shows saved user submissions — anyone with this exact token in the URL (`/api/collect?token=...`) can view them, no one else. Don't skip this — the repo ships with only a placeholder.
4. Railway will assign a public URL automatically (Settings → Networking → Generate Domain). No other config needed — `PORT` is set by Railway automatically and the app reads it.
5. Deploy. First build takes a few minutes (compiling `swisseph`); after that, redeploys are fast.

## Viewing saved submissions

Two ways to see everyone who's filled in the form:

1. **Raw JSON** (already existed): `GET /api/collect?token=YOUR_TOKEN`
2. **New — clean visual dashboard**: `/admin?token=YOUR_TOKEN`
   - Shows a readable, styled table matching the site's look (not raw JSON).
   - Missing name/age shown as "None" instead of blank.
   - Shows both the location the person *typed* and the real location their
     IP address resolves to (via the offline `geoip-lite` database — no
     external API call). If those two don't roughly match, that row is
     highlighted so you can spot people who lied about their location.
   - Only accessible with the correct `COLLECT_VIEW_TOKEN` — bookmark the
     full URL with your token in it.

## One thing to know: saved user submissions and disk storage

The `/api/collect` route saves each visitor's birth chart submission to
`private/submissions.jsonl` on disk. Railway's default filesystem is
**ephemeral** — it resets on every redeploy. If you want that data to
survive redeploys:

- In Railway, add a **Volume** (Settings → Volumes → New Volume) and mount
  it at `/app/private`.
- Or don't worry about it if you don't need this data to persist long-term.

This has no effect on the astrology features themselves (birth charts,
compatibility, geocoding) — those don't touch the filesystem and work
regardless.

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## More detail on the local geocoding fix

See [`GEOCODE-FIX.md`](./GEOCODE-FIX.md) for exactly how the location
search and birth-chart math work without any external API.
