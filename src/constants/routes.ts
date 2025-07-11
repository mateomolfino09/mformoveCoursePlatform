import { payments } from "./payments";

export const routes = {
    user: {
        login: '/login',
        register: '/register',
        forget: '/forget',
        forgetEmail: '/resetEmail',
        perfil: '/account'

    },
    navegation: {
        membresia: (isMember: boolean) => isMember ? '/home' : '/select-plan',
        selectPlan: '/select-plan',
        membresiaHome: '/home',
        mentorship: '/mentorship',
        mentoria: '/mentorship', // Mantener para compatibilidad
        preguntasFrecuentes: '/faq',
        index: '/',
        products: '/products',
        payments: `/payment`
    }
}