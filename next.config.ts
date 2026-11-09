import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Rendering dinamis klasik (SSR per request) — cocok untuk dashboard
  // yang membaca cookie auth + data DB di setiap request.
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
