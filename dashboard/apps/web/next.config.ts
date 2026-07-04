import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: [
    '@aegisai/ui',
    '@aegisai/theme',
    '@aegisai/types',
    '@aegisai/utils',
    '@aegisai/hooks',
  ],
};

export default nextConfig;
