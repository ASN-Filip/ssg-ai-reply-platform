import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Explicitly set the Turbopack root to the project root to avoid warnings
  turbopack: {
    // Turbopack requires an absolute path for `root` — use the current working
    // directory so it resolves correctly when running `npm run dev`.
    root: process.cwd(),
  },
};

export default nextConfig;
