import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Compress assets using gzip / brotli
  compress: true,

  // Optimize bundle size and parse time by transforming barrel file imports
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"]
  },

  // Image caching and modern formats (AVIF / WebP)
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "images.unsplash.com" }
    ],
    minimumCacheTTL: 86400 // 24 hours
  },

  // HTTP Cache headers for static assets
  async headers() {
    return [
      {
        source: "/:path*.(woff2|woff|svg|png|jpg|webp|avif)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable"
          }
        ]
      }
    ];
  }
};

export default nextConfig;
