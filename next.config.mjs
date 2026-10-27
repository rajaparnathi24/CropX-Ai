/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: false,
  productionBrowserSourceMaps: true,
  distDir: process.env.DIST_DIR || '.next',
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    minimumCacheTTL: 60,
    qualities: [75, 85, 100],
  },
  async rewrites() {
    const rawUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const backendUrl = rawUrl.trim().replace(/\/$/, '');
    return [
      {
        source: '/predict',
        destination: `${backendUrl}/predict`,
      },
      {
        source: '/api/v1/predict',
        destination: `${backendUrl}/api/v1/predict`,
      },
      {
        source: '/uploads/:path*',
        destination: `${backendUrl}/uploads/:path*`,
      },
      {
        source: '/history',
        destination: `${backendUrl}/history`,
      },
      {
        source: '/history/:path*',
        destination: `${backendUrl}/history/:path*`,
      },
      {
        source: '/weather',
        destination: `${backendUrl}/weather`,
      },
      {
        source: '/dashboard',
        destination: `${backendUrl}/dashboard`,
      },
      {
        source: '/profile',
        destination: `${backendUrl}/profile`,
      },
      {
        source: '/community/:path*',
        destination: `${backendUrl}/community/:path*`,
      },
      {
        source: '/login',
        destination: `${backendUrl}/login`,
      },
      {
        source: '/signup',
        destination: `${backendUrl}/signup`,
      },
    ];
  },
};

export default nextConfig;