
export const routes = {
    user: {
        login: '/login',
        register: '/register',
        forget: '/forget',
        forgetEmail: '/resetEmail'
    },
    navegation: {
        membresia: (isMember: boolean) => isMember ? '/home' : '/select-plan',
        selectPlan: '/select-plan',
        membresiaHome: '/home',
        mentoria: '/mentoria',
        preguntasFrecuentes: '/faq'
    }
}