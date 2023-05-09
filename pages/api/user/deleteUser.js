import connectDB from '../../../config/connectDB'
import { ObjectId } from 'mongodb'

connectDB()
export default async function handler(req, res) {
  const userId = req.query.userId

  const result = await db.collection('users').deleteOne({
    _id: ObjectId(userId)
  })

  res.status(200).json({ message: `${result.deletedCount} user deleted` })
}
