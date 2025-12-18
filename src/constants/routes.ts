import { payments } from "./payments";

const membershipRoutes = {
    home: '/home',
    bitacora: '/bitacora',
    moveCrew: '/move-crew',
    entry: (isMember: boolean) => isMember ? '/home' : '/move-crew',
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
        // Aliases para compatibilidad hacia atrás
        bitacora: membershipRoutes.bitacora,
        moveCrew: membershipRoutes.moveCrew,
        membresia: membershipRoutes.entry,
        membresiaHome: membershipRoutes.home,
        mentorship: '/mentorship',
        mentoria: '/mentorship', // Mantener para compatibilidad
        mentorshipConsulta: '/mentorship/consulta',
        eventos: '/events',
        preguntasFrecuentes: '/faq',
        index: '/',
        products: '/products',
        payments: `/payment`
    }
}