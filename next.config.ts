import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Placeholder product photography. Swap this for your own image host/CDN.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "loremflickr.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
