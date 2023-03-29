import { ObjectId } from "mongodb";
import clientPromise from "../../../../lib/mongodb";
import User from "../../../../models/userModel";

export default async function deleteUser(req, res) {
  try {
    const client = await clientPromise;
    const userId = req.query.deleteUser;

    const user = await User.deleteOne({
      _id: ObjectId(userId),
    });
    console.log(user);
    res.status(200).json({ message: `User deleted` });
  } catch (e) {
    console.error(e);
    throw new Error(e).message;
  }
}
