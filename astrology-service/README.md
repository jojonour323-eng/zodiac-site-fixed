# Astrology Microservice

This is a standalone Node.js server that runs Swiss Ephemeris for natal chart
and synastry calculations. It **cannot run on Cloudflare Workers** (Workers are
V8 isolates that can't load native `.node` addons), so it runs as a separate
tiny service that the Cloudflare Worker proxies to.

## Quick deploy

### Option 1: Railway (recommended, free tier works)
1. Go to [railway.app](https://railway.app) → New Project → Deploy from repo
2. Point to the `astrology-service/` folder
3. Railway auto-detects Node.js, sets `PORT`, and deploys
4. Copy the generated URL (e.g. `https://celestial-astrology.up.railway.app`)

### Option 2: fly.io
```bash
cd astrology-service
fly launch --no-deploy
fly deploy
```

### Option 3: Render
1. Go to [render.com](https://render.com) → New → Web Service
2. Connect repo, set root directory to `astrology-service`
3. Build command: `npm install`
4. Start command: `npm start`

### Option 4: Any VPS / Node host
```bash
cd astrology-service
npm install
PORT=3001 npm start
```

### Option 5: Run locally (for development)
```bash
cd astrology-service
npm install
npm start
# → Server runs on http://localhost:3001
```

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET`  | `/health` | Health check |
| `GET`  | `/geocode?q=Paris` | Geocode a city query |
| `POST` | `/natal` | Compute natal chart (body = BirthRequest) |
| `POST` | `/synastry` | Compute synastry (body = { personA, personB }) |

## Wiring it to the Cloudflare Worker

Set the `ASTROLOGY_API_URL` environment variable in your Cloudflare Worker to
the URL of this deployed service. For local dev, the Next.js dev server
(`bun run dev`) can use swisseph directly without this service — it only
matters for production on Cloudflare.

See `CLOUDFLARE.md` in the project root for full deployment instructions.
