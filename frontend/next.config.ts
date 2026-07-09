import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Proxy API requests to backend — eliminates CORS issues in development
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: "http://localhost:8000/api/v1/:path*",
      },
    ];
  },
};

export default nextConfig;
