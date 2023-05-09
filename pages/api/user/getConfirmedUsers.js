import connectDB from '../../../config/connectDB'
import User from '../../../models/userModel'

connectDB()

export async function getConfirmedUsers() {
  try {
    const res = await User.find({})
      .where('validEmail')
      .equals('yes')
      .lean()
      .exec()
    const users = JSON.parse(JSON.stringify(res))
    return users
  } catch (err) {
    console.log(err)
  }
}
