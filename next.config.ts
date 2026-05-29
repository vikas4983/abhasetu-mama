import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "export", // Enables static HTML export
  trailingSlash: true, // Ensures /about → /about/index.html
  images: {
    unoptimized: true, // Required for static export (no image server)
  },
};

export default nextConfig;
