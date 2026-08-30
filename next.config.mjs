// NOTE: kept as plain .mjs on purpose.
// The environment ships typescript@7 (tsgo), whose JS API breaks Next's
// next.config.ts transpile step ("fileExists" TypeError). A JS config avoids
// that whole class of failure while keeping identical settings.

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standalone mode relies on Next tracing every file a package needs at
  // runtime; all-the-cities / geo-tz load large data files dynamically and
  // get traced incompletely, crashing city search at runtime. Railway runs a
  // normal persistent container, so we serve from full node_modules instead.
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  serverExternalPackages: [
    "swisseph",
    "all-the-cities",
    "geo-tz",
    "geoip-lite",
    "luxon",
    "z-ai-web-dev-sdk",
  ],
};

export default nextConfig;
