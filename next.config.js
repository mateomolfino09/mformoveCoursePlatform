/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: true,
    // Evita error ENOENT con route groups (membership) en la fase de tracing del build
    outputFileTracingExcludes: {
      '*': ['**/node_modules/@swc/core*/**', '**/node_modules/webpack/**'],
    },
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
    /** Compatibilidad: URLs antiguas en inglés → rutas en español */
    return [
      { source: '/home', destination: '/biblioteca', permanent: true },
      { source: '/home/:path*', destination: '/biblioteca/:path*', permanent: true },
      { source: '/inicio', destination: '/biblioteca', permanent: true },
      { source: '/inicio/:path*', destination: '/biblioteca/:path*', permanent: true },
      { source: '/bitacora', destination: '/ruta-semanal', permanent: true },
      { source: '/bitacora/:path*', destination: '/ruta-semanal/:path*', permanent: true },
      { source: '/membership', destination: '/cuerpo-autonomo', permanent: true },
      { source: '/membership/:path*', destination: '/cuerpo-autonomo/:path*', permanent: true },

      { source: '/library', destination: '/cuerpo-autonomo', permanent: false },
      { source: '/library/:path*', destination: '/cuerpo-autonomo', permanent: false },

      { source: '/curso/:slug', destination: '/:slug', permanent: true },
      { source: '/curso/:slug/:path*', destination: '/:slug/:path*', permanent: true },
      { source: '/weekly-path', destination: '/ruta-semanal', permanent: true },
      { source: '/weekly-path/:path*', destination: '/ruta-semanal/:path*', permanent: true },
      { source: '/select-plan', destination: '/elegir-plan', permanent: true },

      { source: '/login', destination: '/iniciar-sesion', permanent: true },
      { source: '/register', destination: '/registro', permanent: true },
      { source: '/forget', destination: '/olvide-contrasena', permanent: true },
      { source: '/account/billing', destination: '/cuenta/facturacion', permanent: true },
      { source: '/account/cancelSubscription', destination: '/cuenta/cancelar-suscripcion', permanent: true },
      { source: '/account', destination: '/cuenta', permanent: true },
      { source: '/account/:path*', destination: '/cuenta/:path*', permanent: true },
      { source: '/resetEmail', destination: '/restablecer-correo', permanent: true },
      { source: '/resetEmail/:path*', destination: '/restablecer-correo/:path*', permanent: true },
      { source: '/email', destination: '/verificar-correo', permanent: true },
      { source: '/email/:path*', destination: '/verificar-correo/:path*', permanent: true },
      { source: '/reset', destination: '/restablecer', permanent: true },
      { source: '/reset/:path*', destination: '/restablecer/:path*', permanent: true },

      { source: '/onboarding', destination: '/incorporacion', permanent: true },
      { source: '/onboarding/:path*', destination: '/incorporacion/:path*', permanent: true },
      { source: '/mentorship', destination: '/mentoria', permanent: true },
      { source: '/mentorship/:path*', destination: '/mentoria/:path*', permanent: true },

      { source: '/admin/products', destination: '/admin/productos', permanent: true },
      { source: '/products/:name/success-payment', destination: '/productos/:name/pago-exitoso', permanent: true },
      { source: '/productos/:name/success-payment', destination: '/productos/:name/pago-exitoso', permanent: true },

      { source: '/events', destination: '/eventos', permanent: true },
      { source: '/events/:path*', destination: '/eventos/:path*', permanent: true },
      { source: '/products', destination: '/productos', permanent: true },
      { source: '/products/:path*', destination: '/productos/:path*', permanent: true },

      { source: '/payment', destination: '/pago', permanent: true },
      { source: '/payment/:path*', destination: '/pago/:path*', permanent: true },

      { source: '/about', destination: '/nosotros', permanent: true },
      { source: '/contact', destination: '/contacto', permanent: true },
      { source: '/links', destination: '/bio', permanent: true },
      { source: '/link-in-bio', destination: '/bio', permanent: true },
      { source: '/privacy', destination: '/privacidad', permanent: true },
      { source: '/faq', destination: '/preguntas-frecuentes', permanent: true },

      { source: '/classes', destination: '/clases', permanent: true },
      { source: '/classes/:path*', destination: '/clases/:path*', permanent: true },
      { source: '/classes-schedule', destination: '/horario-clases', permanent: true },
      { source: '/classes-category/:path*', destination: '/categoria-clases/:path*', permanent: true },
      { source: '/cuenta/billing', destination: '/cuenta/facturacion', permanent: true },
      { source: '/cuenta/cancelSubscription', destination: '/cuenta/cancelar-suscripcion', permanent: true },

      { source: '/admin/mentorship/plans', destination: '/admin/mentorias/planes', permanent: true },
      { source: '/admin/mentorship/analytics', destination: '/admin/mentorias/analitica', permanent: true },

      { source: '/admin/memberships', destination: '/admin/membresias', permanent: true },
      { source: '/admin/memberships/:path*', destination: '/admin/membresias/:path*', permanent: true },
      { source: '/admin/products/:path*', destination: '/admin/productos/:path*', permanent: true },
      { source: '/admin/classes/:path*', destination: '/admin/clases/:path*', permanent: true },
      { source: '/admin/users', destination: '/admin/usuarios', permanent: true },
      { source: '/admin/billing', destination: '/admin/facturacion', permanent: true },
      { source: '/admin/updateUser/:path*', destination: '/admin/actualizar-usuario/:path*', permanent: true },
      { source: '/admin/in-person-classes/:path*', destination: '/admin/clases-presenciales/:path*', permanent: true },
      { source: '/admin/transformational-programs/:path*', destination: '/admin/programas-transformacionales/:path*', permanent: true },
      { source: '/admin/ai-management/:path*', destination: '/admin/gestion-ia/:path*', permanent: true },
      { source: '/admin/auto-emails', destination: '/admin/correos-automaticos', permanent: true },
      { source: '/admin/test-gemini', destination: '/admin/prueba-gemini', permanent: true },
      { source: '/admin/mentorship', destination: '/admin/mentorias', permanent: true },
      { source: '/admin/mentorship/:path*', destination: '/admin/mentorias/:path*', permanent: true },

      { source: '/admin/faq', destination: '/admin/preguntas-frecuentes', permanent: true },
      { source: '/admin/faq/:path*', destination: '/admin/preguntas-frecuentes/:path*', permanent: true },

      { source: '/admin/clases-presenciales/create', destination: '/admin/clases-presenciales/crear', permanent: true },
      { source: '/admin/clases-presenciales/all', destination: '/admin/clases-presenciales/todas', permanent: true },
      { source: '/admin/clases-presenciales/edit/:path*', destination: '/admin/clases-presenciales/editar/:path*', permanent: true },

      { source: '/admin/bitacora/create', destination: '/admin/bitacora/crear', permanent: true },

      { source: '/admin/membresias/bitacora/create', destination: '/admin/membresias/bitacora/crear', permanent: true },
      { source: '/admin/membresias/bitacora/list', destination: '/admin/membresias/bitacora/lista', permanent: true },
      { source: '/admin/membresias/bitacora/edit/:path*', destination: '/admin/membresias/bitacora/editar/:path*', permanent: true },

      { source: '/admin/membresias/modulos-clase/create', destination: '/admin/membresias/modulos-clase/crear', permanent: true },
      { source: '/admin/membresias/modulos-clase/:id/edit', destination: '/admin/membresias/modulos-clase/:id/editar', permanent: true },

      { source: '/admin/membresias/submodules', destination: '/admin/membresias/submodulos', permanent: true },
      { source: '/admin/membresias/submodules/:path*', destination: '/admin/membresias/submodulos/:path*', permanent: true },

      { source: '/admin/membresias/promociones/create', destination: '/admin/membresias/promociones/crear', permanent: true },
      { source: '/admin/membresias/promociones/edit/:path*', destination: '/admin/membresias/promociones/editar/:path*', permanent: true },

      { source: '/admin/membresias/eventos-membresia/create', destination: '/admin/membresias/eventos-membresia/crear', permanent: true },
      { source: '/admin/membresias/eventos-membresia/edit/:path*', destination: '/admin/membresias/eventos-membresia/editar/:path*', permanent: true },

      { source: '/admin/membresias/eventos-move-crew/create', destination: '/admin/membresias/eventos-move-crew/crear', permanent: true },
      { source: '/admin/membresias/eventos-move-crew/edit/:path*', destination: '/admin/membresias/eventos-move-crew/editar/:path*', permanent: true },

      { source: '/admin/membresias/clases-modulo/edit/:path*', destination: '/admin/membresias/clases-modulo/editar/:path*', permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: '/bio',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, max-age=0, s-maxage=0',
          },
          {
            key: 'CDN-Cache-Control',
            value: 'no-store',
          },
          {
            key: 'Vercel-CDN-Cache-Control',
            value: 'no-store',
          },
        ],
      },
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
