import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  experimental: {
    serverActions: { bodySizeLimit: "30mb" },
  },
  // Uploaded images and PDFs live in the API server's database; serve them under this site's own domain.
  async rewrites() {
    const api = (process.env.API_URL ?? "http://localhost:4000").replace(/\/+$/, "");
    return [{ source: "/uploads/:name", destination: `${api}/files/:name` }];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
