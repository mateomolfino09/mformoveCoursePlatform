
const endpoints = {
  auth: {
    login: `/api/user/auth/login`,
    profile: `/api/user/auth/profile`,
    verifyEmail: (email: string) => `/api/user/auth/email/verifyEmail/${email}`,
    email: (token: string) => `/api/user/auth/email/${token}`,
    easyRegister: '/api/user/auth/easyRegister',
    easyRegisterSubscribe: '/api/user/auth/easyRegisterSubscribe',
    register: '/api/user/auth/register',
    resend: '/api/user/auth/register/resendEmail',
    resetMail: (token: string) =>  `/api/user/auth/resetEmail/${token}`,
    resetMailSend: `/api/user/auth/resetEmail`,
    resetPassword: (token: string) =>  `/api/user/auth/reset/${token}`,
    resetPasswordSend: `/api/user/auth/forget`,
    resetPasswordSendNoCaptcha: `/api/user/auth/forgetNoCaptcha`,
    resetPasswordSendMailchamp: `/api/auth/resetPasswordMailChamp`,
    getUserPlan: (planId: string) => `api/user/getUserPlan/${planId}`
  },
  user: {
    update: (id: string) => `/api/user/update/${id}`,
    delete: (userId: string) => `/api/user/delete/${userId}`,
    getSubscriptionPeriod: (id: string) => `api/user/subscription/getSubscriptionPeriod/${id}`,

    //addUserToken : (userId: string, membershipToken:string,productId:string)=> `/api/user/memberships/${userId}/${membershipToken}/${productId}`,
    addUserToken : `/api/user/memberships/asignMembershipToken`
  },
  course: {
    class: {
      saveTime: '/api/user/auth/class/saveTime',
    },
    dislistCourse: '/api/user/course/dislist',
    likeCourse: '/api/user/course/like',
    dislikeCourse: '/api/user/course/dislike',
    listCourse: '/api/user/course/list', 
    createCourse: '/api/course/createCourse',
    delete: (courseId: string) => `/api/course/delete/${courseId}`
  },
  individualClass: {
    delete: (classId: string) => `/api/individualClass/delete/${classId}`,
    search: (text: string) => `/api/individualClass/search?text=${text}`
  },
  payments: {
    deletePlan: (id: string) => `/api/payments/deletePlan/${id}`,
    createPlan: `/api/payments/createPlan`,
    editPlan: `/api/payments/editPlan`,
    createSub: `/api/payments/createSubscription`,
    createMembership: `/api/payments/oneTimePayment/createMembership`,
    createProductUser: `/api/payments/oneTimePayment/createProductUser`,
    createFreeSubscription: `/api/payments/createFreeSubscription`,
    createPaymentToken: `/api/payments/createPaymentToken`,
    cancelSubscription: (id:string) => `/api/payments/cancelSubscription/${id}`,
    promocion: {
      create: `/api/payments/promocion/create`,
      edit: (id: string) => `/api/payments/promocion/${id}`,
      getActive: `/api/payments/promocion/getActive`,
      get: (id: string) => `/api/payments/promocion/${id}`,
      delete: (id: string) => `/api/payments/promocion/${id}`,
    },
    stripe: {
      createPaymentURL: `/api/payments/stripe/createPaymentURL`,
    }
  },
  mentorship: {
    plans: `/api/payments/getPlans?type=mentorship`,
    createCheckoutSession: `/api/mentorship/stripe/createCheckoutSession`,
  },
  admin: {
    emailMarketing: '/api/admin/emailMarketing'
  },
  product: {
    delete: (productId: string) => `/api/product/delete/${productId}`,
    getOne: (productId: string) => `/api/product/viewProduct/${productId}`,
    update: `/api/product/updateProduct`
  },
  freeProduct: {
    delete: (productId: string) => `/api/product/delete/${productId}`,
    getOne: (productId: string) => `/api/product/viewProduct/${productId}`
  },

};

export default endpoints;