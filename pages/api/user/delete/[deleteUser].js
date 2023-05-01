import { ObjectId } from "mongodb";
import clientPromise from "../../../../lib/mongodb";
import User from "../../../../models/userModel";
import Bills from "../../../../models/billModel";

export default async function deleteUser(req, res) {
  try {
    if (req.method === "DELETE") {
      const client = await clientPromise;
      const userId = req.query.deleteUser;

      const bills = await Bills.deleteMany({
        user: ObjectId(userId)
      })

      const user = await User.deleteOne({
        _id: ObjectId(userId),
      });
      console.log(user, bills);
      res.status(200).json({ message: `User deleted` });
    }
  } catch (e) {
    console.error(e);
    throw new Error(e).message;
  }
}
