"use server"

const loginServerAction = async (data: FormData) => {
    const email = data.get('email') as string
    const password = data.get('password') as string

    if(!email || !password) return

    console.log(email, password)

}

export {
    loginServerAction,
}