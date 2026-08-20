import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // NOTE: intentionally NOT using output: "standalone" here.
  // Standalone mode relies on Next.js tracing every file a package needs at
  // runtime, and packages that load large data files dynamically (like
  // all-the-cities and geo-tz) can get traced incompletely — the app then
  // crashes at runtime the moment someone searches a city, because a data
  // file is missing from the trimmed bundle. Railway runs a normal
  // persistent container (not a size-constrained serverless function), so
  // there's no benefit to the trimmed standalone bundle here — we just run
  // from the full, complete node_modules instead, which is far more
  // reliable for packages like this.
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // Mark native addons + their dependencies as server externals so Turbopack
  // doesn't try to bundle them. The `swisseph` package loads a native .node
  // file via `require(__dirname + '/../build/Release/swisseph.node')`, which
  // Turbopack can't resolve at build time.
  serverExternalPackages: [
    "swisseph",
    "all-the-cities",
    "geo-tz",
    "geoip-lite",
    "luxon",
  ],
};

export default nextConfig;
