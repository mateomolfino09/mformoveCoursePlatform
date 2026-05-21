import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// Rutas que no requieren autenticación
const freeCheckSources = ['/iniciar-sesion', '/registro', '/verificar-correo', '/restablecer', '/restablecer-correo', '/olvide-contrasena', '/nosotros', '/'];
// Rutas de onboarding que requieren autenticación pero no deben ser bloqueadas por el middleware
const onboardingPaths = ['/incorporacion'];

const CURSO_CUERPO_AUTONOMO_PATH = '/curso/cuerpo-autonomo';

function isLibraryPath(pathname: string): boolean {
    return (
        pathname === '/library' ||
        pathname.startsWith('/library/') ||
        pathname === '/biblioteca' ||
        pathname.startsWith('/biblioteca/')
    );
}

export async function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;

    if (pathname === '/move-crew' || pathname.startsWith('/move-crew/')) {
        const url = request.nextUrl.clone();
        url.pathname = '/cuerpo-autonomo';
        return NextResponse.redirect(url);
    }

    if (isLibraryPath(pathname)) {
        const url = request.nextUrl.clone();
        url.pathname = CURSO_CUERPO_AUTONOMO_PATH;
        return NextResponse.redirect(url);
    }

    const jwt = request.cookies.get('userToken')?.value;
    const response = NextResponse.next();
    
    // Permitir acceso a rutas de onboarding sin verificación adicional
    if (onboardingPaths.some(path => pathname.startsWith(path))) {
        return response;
    }

    // Permitir acceso a rutas públicas
    if (freeCheckSources.some(path => pathname === path || pathname.startsWith(path + '/'))) {
        return response;
    }
    
    try {
        // Verifica si el token JWT no existe y redirige a login
        if (jwt === undefined) {
            // Guardar la URL de destino en una cookie para redirigir después del login
            const redirectUrl = request.nextUrl.pathname + request.nextUrl.search;
            const response = NextResponse.redirect(new URL('/iniciar-sesion', request.url));
            
            // Solo guardar si no es una ruta de auth
            const authRoutes = ['/iniciar-sesion', '/registro', '/verificar-correo', '/restablecer', '/restablecer-correo', '/olvide-contrasena'];
            if (!authRoutes.some(route => redirectUrl.startsWith(route))) {
                response.cookies.set('redirectQueue', redirectUrl, {
                    maxAge: 60 * 60 * 24, // 1 día
                    sameSite: 'lax',
                    path: '/'
                });
            }
            
            return response;
        }

        // Redirecciones específicas según las rutas
        if (pathname === '/pago/atras') {
            return NextResponse.redirect(new URL('/mentoria', request.url));
        }

        // Verificar el JWT
        const { payload } = await jwtVerify(jwt, new TextEncoder().encode(process.env.NEXTAUTH_SECRET as string));

        return response;
    } catch (error) {
        // Si hay un error en la verificación, redirige a login
        return NextResponse.redirect(new URL('/iniciar-sesion', request.url));
    }
}

// Aplicar el middleware a rutas protegidas (excluyendo onboarding que se maneja arriba)
export const config = {
    matcher: [
        '/move-crew',
        '/move-crew/:path*',
        '/library',
        '/library/:path*',
        '/biblioteca',
        '/biblioteca/:path*',
        '/cuenta/:path*', 
        '/admin/:path*', 
        '/productos/:path*', 
        '/pago/:path*',
        '/ruta-semanal/:path*',
        '/incorporacion/:path*' // Incluido para permitir acceso pero sin bloquear
    ]
};
