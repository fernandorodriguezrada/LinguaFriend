
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  experimental: {
    allowedDevOrigins: [
      "https://9003-firebase-studio-1748631252887.cluster-pgviq6mvsncnqxx6kr7pbz65v6.cloudworkstations.dev",
      // You might need to add other origins if you access your dev server from different Studio preview URLs
    ],
  },
};

export default nextConfig;
