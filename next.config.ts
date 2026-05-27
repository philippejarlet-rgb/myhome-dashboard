import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/photos/:filename([^/]+\\.[a-zA-Z]+)',
        destination: '/api/photos/:filename',
      },
    ]
  },
};

export default nextConfig;
