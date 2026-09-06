import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // The repo root also holds the Ruhh bakery app with its own lockfile; pin the workspace to this app.
  turbopack: { root: path.resolve(import.meta.dirname) },
  outputFileTracingRoot: path.resolve(import.meta.dirname),
  images: {
    // Generated illustration assets are served from Porter's permanent asset host.
    remotePatterns: [{ protocol: "https", hostname: "mcp.portermetrics.com" }],
  },
};

export default nextConfig;
