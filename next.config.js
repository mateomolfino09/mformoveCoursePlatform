/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: true,
  },
  eslint: {
    // Deshabilitar ESLint durante el build de producción
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Deshabilitar type checking durante el build de producción
    ignoreBuildErrors: true,
  },
  swcMinify: true,
  images: {
    domains: [
      'rickandmortyapi.com',
      'image.tmdb.org',
      'rb.gy',
      'res.cloudinary.com',
      'https://www.googleapis.com/youtube/v3/playlistItems'
    ],
    loader: 'custom',
    path: '/'
  },
  env: {
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET
  },
  async redirects() {
    return [
      { source: '/home', destination: '/library', permanent: true },
      { source: '/home/:path*', destination: '/library/:path*', permanent: true },
      { source: '/bitacora', destination: '/weekly-path', permanent: true },
      { source: '/bitacora/:path*', destination: '/weekly-path/:path*', permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)', // Aplica a todas las rutas
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate'
          },
          {
            key: 'x-vercel-cache',
            value: 'miss'  // Evitar caché en Vercel
          }
        ],
      },
    ]
  }
  // Habilitar source maps en producción
  // productionBrowserSourceMaps: true
};

module.exports = nextConfig;
