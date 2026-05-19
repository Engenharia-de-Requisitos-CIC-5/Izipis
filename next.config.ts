import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/Izipis',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
