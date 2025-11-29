import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Allow all HTTPS domains (simplify for now, restrict later)
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/publications',
        destination: '/research',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;