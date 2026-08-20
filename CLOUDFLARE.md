# Cloudflare Deployment Guide

This guide covers everything you need to deploy Celestial to Cloudflare Workers.

## Architecture

```
┌─────────────────────────────────┐     ┌──────────────────────────────┐
│  Cloudflare Worker (this app)   │     │  Astrology Microservice       │
│  npx wrangler deploy            │     │  (astrology-service/ folder)  │
│                                 │     │  Deploy to Railway/fly.io/etc │
│  • All UI (Home, About, Red     │     │                              │
│    Flags, Kink Test, Compat)    │     │  • Swiss Ephemeris (native C) │
│  • /api/collect → KV storage    │◀────│  • geo-tz (71 MB tz data)     │
│  • /api/natal → proxy ──────────┼────▶│  • all-the-cities (6 MB)      │
│  • /api/synastry → proxy        │     │  • luxon                      │
│  • /api/geocode → proxy         │     │                              │
│                                 │     │  Endpoints:                   │
│  Why a separate service?        │     │  POST /natal                  │
│  Swiss Ephemeris is a native C  │     │  POST /synastry               │
│  addon (.node binary) that can- │     │  GET  /geocode?q=             │
│  not run in Cloudflare's V8     │     │  GET  /health                 │
│  isolate runtime.               │     └──────────────────────────────┘
└─────────────────────────────────┘
```

## Prerequisites

1. **Cloudflare account** — sign up at [cloudflare.com](https://cloudflare.com) (free tier works)
2. **Wrangler CLI** — `npm install -g wrangler` (or use `npx wrangler`)
3. **A host for the astrology service** — any Node.js host (Railway, fly.io, Render, VPS)

## Step 1: Deploy the Astrology Microservice

The astrology service is a tiny Node.js server that runs Swiss Ephemeris.
**You only need to do this once.**

### Option A: Railway (recommended, 2 minutes)

1. Go to [railway.app](https://railway.app) → New Project → Deploy from repo
2. Set the root directory to `astrology-service`
3. Railway auto-detects Node.js and deploys
4. Copy the generated URL (e.g. `https://celestial-astrology.up.railway.app`)
5. Test it: visit `https://your-url/health` — should return `{"ok":true}`

### Option B: fly.io

```bash
cd astrology-service
fly launch --no-deploy
fly deploy
# Copy the generated URL
```

### Option C: Any VPS with Node.js

```bash
cd astrology-service
npm install
PORT=3001 npm start
# Use pm2 or systemd to keep it running
```

### Option D: Run locally (for development only)

```bash
cd astrology-service
npm install
npm start
# Runs on http://localhost:3001
# Set ASTROLOGY_API_URL=http://localhost:3001 in your .env
```

**Save the URL** — you'll need it in Step 3.

## Step 2: Create the KV Namespace

The `/api/collect` route stores user submissions in Cloudflare KV.

```bash
npx wrangler login   # one-time, opens browser
npx wrangler kv namespace create SUBMISSIONS
```

This outputs something like:
```
{ binding: "SUBMISSIONS", id: "abc123def456..." }
```

**Copy the `id`** — you'll paste it into `wrangler.toml` in Step 3.

## Step 3: Configure wrangler.toml

Open `wrangler.toml` and replace the two placeholder values:

```toml
[[kv_namespaces]]
binding = "SUBMISSIONS"
id = "abc123def456..."           # ← paste your KV namespace ID here

[vars]
ASTROLOGY_API_URL = "https://celestial-astrology.up.railway.app"  # ← your service URL
```

## Step 4: Set the View Token (secret)

The `/api/collect?token=XXX` endpoint is password-protected. Set the token
as a Cloudflare secret (not in the toml file, so it's encrypted):

```bash
npx wrangler secret put COLLECT_VIEW_TOKEN
# Enter a random string when prompted, e.g. "my-secret-token-abc123"
```

Your private data-viewing URL will be:
```
https://your-app.workers.dev/api/collect?token=my-secret-token-abc123
```

## Step 5: Deploy

```bash
npx wrangler deploy
```

That's it. The command:
1. Runs `@opennextjs/cloudflare` to build the Next.js app for Workers
2. Uploads the bundle to Cloudflare
3. Deploys the Worker

Your app is now live at `https://celestial.workers.dev` (or your custom domain).

## Step 6: Verify

1. Visit your Worker URL — the intro page should load with a rotating quote
2. Enter a birth date + city — the chart should compute (via the astrology service)
3. Visit `/api/collect?token=YOUR_TOKEN` — should show submissions
4. Check the Kink Test and Red Flags tabs — should read from the chart

## Local Development

For local dev, you have two options:

### Option A: Pure local (no Cloudflare bindings, no astrology service)

```bash
bun run dev
```

This runs the standard Next.js dev server. It uses swisseph directly (no
external service needed). `/api/collect` writes to `private/submissions.jsonl`
on the local filesystem. This is the easiest setup — zero external dependencies.

### Option B: Local Worker with real KV bindings

```bash
# Terminal 1: start the astrology service
cd astrology-service && npm start

# Terminal 2: start the Worker with local KV
ASTROLOGY_API_URL=http://localhost:3001 npx wrangler pages dev
```

This runs the actual Cloudflare Worker locally with a local KV simulator.

## Required APIs / Bindings Summary

| What | Type | How to set up |
|------|------|---------------|
| `SUBMISSIONS` | KV Namespace | `npx wrangler kv namespace create SUBMISSIONS` → paste ID in `wrangler.toml` |
| `ASTROLOGY_API_URL` | Environment variable | Set in `wrangler.toml` `[vars]` section |
| `COLLECT_VIEW_TOKEN` | Secret | `npx wrangler secret put COLLECT_VIEW_TOKEN` |
| Astrology microservice | External Node.js app | Deploy `astrology-service/` to Railway/fly.io/Render/VPS |

## Troubleshooting

### "Could not reach the astrology service"
- Check that `ASTROLOGY_API_URL` in `wrangler.toml` points to your deployed service
- Visit `https://your-service-url/health` — should return `{"ok":true}`
- Make sure the service is running (Railway/fly.io free tiers sleep after inactivity)

### "KV namespace not found"
- You forgot Step 2 — run `npx wrangler kv namespace create SUBMISSIONS`
- Paste the returned `id` into `wrangler.toml`

### Build fails with swisseph error
- Make sure `next.config.ts` has `serverExternalPackages: ["swisseph", ...]`
- The Cloudflare build (`@opennextjs/cloudflare`) should never try to bundle
  swisseph — it's only used via dynamic `import()` when `ASTROLOGY_API_URL`
  is NOT set, which doesn't happen on Cloudflare

### Image optimization doesn't work
- Cloudflare Workers can't use `sharp`. We set `images: { unoptimized: true }`
  in `next.config.ts`. Images are served as-is.

## Quick Reference

```bash
# One-time setup
npx wrangler login
npx wrangler kv namespace create SUBMISSIONS
npx wrangler secret put COLLECT_VIEW_TOKEN

# Deploy (after editing wrangler.toml with your KV ID + service URL)
npx wrangler deploy

# View collected data
curl https://your-app.workers.dev/api/collect?token=YOUR_TOKEN
```
