# Location Search — Fully Local, No External API

Your location/geocoding search (`/api/geocode`, plus the birth chart calculations
in `/api/natal` and `/api/synastry`) already runs 100% locally. There is **no
Railway dependency, no external API calls, nothing that can go down**.

## How it works

- **City data**: the `all-the-cities` npm package (bundled as a normal
  dependency in `package.json`) — a full offline database of world cities,
  populations, and coordinates.
- **Timezones**: the `geo-tz` package — resolves a timezone from lat/lng
  entirely offline.
- **Astrology math**: the `swisseph` (Swiss Ephemeris) native package —
  calculates planet positions locally, no API key, no rate limits.

None of these need an internet connection or a third-party server once
installed. I checked every file in this project and confirmed there is no
reference anywhere to Railway, `ASTROLOGY_API_URL`, wrangler, or any other
external service.

## What the search does

1. If you type a country name (e.g. "Morocco"), it returns the biggest real
   cities in that country to choose from.
2. If you type an exact city name, it returns that city (using population to
   pick the right one if multiple cities share a name).
3. If you make a typo (e.g. "Casablamca"), it uses edit-distance matching to
   suggest the closest real city — "Did you mean Casablanca?"
4. Everything above runs from the local `all-the-cities` dataset — zero
   network requests.

## Before you push to GitHub

1. Run `npm install` (or `bun install`) once locally to pull in
   `swisseph`, `all-the-cities`, `geo-tz`, and the rest of `package.json`.
   `node_modules` is intentionally **not** included in this download —
   GitHub repos shouldn't include it; it's already in `.gitignore`.
2. The `db/` and `private/` folders were cleared of local test data
   (an old SQLite file and saved user submissions) before packaging — both
   folders are kept with a `.gitkeep` so the folder structure survives.
3. `.env` in this download only contains a placeholder `DATABASE_URL` and a
   comment — no real secrets. Double check it before committing, or leave it
   out of git entirely (it's already `.gitignore`d).

## To run it

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`. Try typing a country, a real city, and a
typo'd city to confirm the search resolves correctly with no internet calls
involved (you can even test this by disconnecting your network after
`npm install`).
