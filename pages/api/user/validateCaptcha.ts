import axios from 'axios'

export default async function validateCaptcha(response_key: string) {
  const secret_key = process.env.RECAPTCHA_SECRET_SITE_KEY
  console.log(secret_key)
  const url = `https://www.google.com/recaptcha/api/siteverify?secret=${secret_key}&response=${response_key}`

  try {
    const response = await axios.post(url)
    return response.data.success
  } catch (error) {
    console.error(`Error validating captcha: ${error}`)
    return false
  }
}
