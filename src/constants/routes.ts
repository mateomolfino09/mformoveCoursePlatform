import { cursoContenidoPath, cursoLandingPath } from '../lib/cursoPaths';

const membershipRoutes = {
    /** Página principal de membresía (Library) */
    library: '/biblioteca',
    /** Clases individuales (sin módulo) */
    individualClasses: '/biblioteca/clases-individuales',
    /** Camino semanal (antes "Bitácora") */
    weeklyPath: '/ruta-semanal',
    /** Redirige server-side al último curso publicado (compatibilidad de enlaces viejos). */
    moveCrew: '/cuerpo-autonomo',
    curso: cursoLandingPath,
    cursoContenido: cursoContenidoPath,
    entry: (isMember: boolean) => (isMember ? '/biblioteca' : '/cuerpo-autonomo'),
};

export const routes = {
    user: {
        login: '/iniciar-sesion',
        register: '/registro',
        forget: '/olvide-contrasena',
        forgetEmail: '/restablecer-correo',
        perfil: '/cuenta'

    },
    navegation: {
        membership: membershipRoutes,
        // Aliases
        home: membershipRoutes.library,
        bitacora: membershipRoutes.weeklyPath,
        moveCrew: membershipRoutes.moveCrew,
        membresia: membershipRoutes.entry,
        membresiaHome: membershipRoutes.library,
        mentorship: '/mentoria',
        mentoria: '/mentoria',
        mentorshipConsulta: '/mentoria/consulta',
        eventos: '/eventos',
        preguntasFrecuentes: '/preguntas-frecuentes',
        index: '/',
        products: '/productos',
        selectPlan: '/elegir-plan',
        payments: `/pago`,
        paymentSuccess: '/pago/exito',
        onboarding: {
            bienvenida: '/incorporacion/bienvenida',
        },
        about: '/nosotros',
        contact: '/contacto',
        terminos: '/terminos',
        privacy: '/privacidad',
        linkInBio: '/bio',
        classes: '/clases',
        email: '/verificar-correo',
        account: '/cuenta',
    }
}
