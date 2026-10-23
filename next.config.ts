import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  allowedDevOrigins: ['**.revolte.io'],
  output: 'standalone',
};

export default nextConfig;
