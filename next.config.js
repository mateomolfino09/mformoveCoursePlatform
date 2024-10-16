/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: true
  },
  swcMinify: true,
  images: {
    domains: [
      'rickandmortyapi.com',
      'image.tmdb.org',
      'rb.gy',
      'https://www.googleapis.com/youtube/v3/playlistItems'
    ],
    loader: 'custom',
    path: '/'
  },
  env: {
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
        ],
      },
    ];
  },
  // productionBrowserSourceMaps: true
};

module.exports = nextConfig;
