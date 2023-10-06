const endpoints = {
  auth: {
    login: `/api/user/auth/login`,
    profile: `/api/user/auth/profile`,
    verifyEmail: (email: string) => `/api/user/auth/email/verifyEmail/${email}`,
    email: (token: string) => `/api/user/auth/email/${token}`,
    register: '/api/user/auth/register',
    resetMail: (token: string) =>  `/api/user/auth/resetEmail/${token}`,
    resetMailSend: `/api/user/auth/resetEmail`,
    resetPassword: (token: string) =>  `/api/user/auth/reset/${token}`,
    resetPasswordSend: `/api/user/auth/forget`,



  },
  course: {
    class: {
      saveTime: '/api/user/auth/class/saveTime',
    },
    dislistCourse: '/api/user/course/dislist',
    likeCourse: '/api/user/course/like',
    dislikeCourse: '/api/user/course/dislike',
    listCourse: '/api/user/course/list'
  }

};

export default endpoints;