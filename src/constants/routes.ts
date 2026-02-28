import { payments } from "./payments";

const membershipRoutes = {
    /** Página principal de membresía (Library) */
    library: '/library',
    /** Clases individuales (sin módulo) */
    individualClasses: '/library/individual-classes',
    /** Camino semanal (antes "Bitácora") */
    weeklyPath: '/weekly-path',
    moveCrew: '/move-crew',
    entry: (isMember: boolean) => isMember ? '/library' : '/move-crew',
};

export const routes = {
    user: {
        login: '/login',
        register: '/register',
        forget: '/forget',
        forgetEmail: '/resetEmail',
        perfil: '/account'

    },
    navegation: {
        membership: membershipRoutes,
        // Aliases
        home: membershipRoutes.library,
        bitacora: membershipRoutes.weeklyPath,
        moveCrew: membershipRoutes.moveCrew,
        membresia: membershipRoutes.entry,
        membresiaHome: membershipRoutes.library,
        mentorship: '/mentorship',
        mentoria: '/mentorship', // Mantener para compatibilidad
        mentorshipConsulta: '/mentorship/consulta',
        eventos: '/events',
        preguntasFrecuentes: '/faq',
        index: '/',
        products: '/products',
        payments: `/payment`,
        paymentSuccess: '/payment/success',
        onboarding: {
            bienvenida: '/onboarding/bienvenida',
        },
        about: '/about',
        privacy: '/privacy',
        classes: '/classes',
        email: '/email',
        account: '/account',
    }
}