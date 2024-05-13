const endpoints = {
  auth: {
    login: `/api/user/auth/login`,
    profile: `/api/user/auth/profile`,
    verifyEmail: (email: string) => `/api/user/auth/email/verifyEmail/${email}`,
    email: (token: string) => `/api/user/auth/email/${token}`,
    register: '/api/user/auth/register',
    resend: '/api/user/auth/register/resendEmail',
    resetMail: (token: string) =>  `/api/user/auth/resetEmail/${token}`,
    resetMailSend: `/api/user/auth/resetEmail`,
    resetPassword: (token: string) =>  `/api/user/auth/reset/${token}`,
    resetPasswordSend: `/api/user/auth/forget`,

  },
  user: {
    update: (id: string) => `/api/user/update/${id}`,
    delete: (userId: string) => `/api/user/delete/${userId}`
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
    createPaymentToken: `/api/payments/createPaymentToken`,
    cancelSubscription: (id:string) => `/api/payments/cancelSubscription/${id}`
  },
  admin: {
    emailMarketing: '/api/admin/emailMarketing'
  },
  product: {
    delete: (productId: string) => `/api/product/delete/${productId}`,
    getOne: (productId: string) => `/api/product/viewProduct/${productId}`
  },

};

export default endpoints;