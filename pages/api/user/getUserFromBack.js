import connectDB from "../../../config/connectDB" 
import User from "../../../models/userModel"
import bcrypt from "bcryptjs"
import { ConnectionPoolClosedEvent } from "mongodb"

 connectDB()

 export async function getUserFromBack(email) {
    try {
        const user = await User.findOne({ email: email })
        user.password = undefined
        return user
      } catch (err) {
       console.log(err)
      }
  }

