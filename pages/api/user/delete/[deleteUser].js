import { ObjectId } from "mongodb";
import clientPromise from "../../../../lib/mongodb";
import User from "../../../../models/userModel";

export default async function deleteUser(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db("users");
    const userId = req.query.deleteUser;

    const user = await User.deleteOne({
      _id: ObjectId(userId),
    });
    console.log(user);
  } catch (e) {
    console.error(e);
    throw new Error(e).message;
  }
  // const mongoClient = await clientPromise;
  // const userId = req.query;
  // const result = await mongoClient
  //   .db()
  //   .collection("users")
  //   .deleteOne({ _id: userId });

  // res.status(200).json({ message: `${result.deletedCount} user deleted` });
  // console.log(userId);
  // const result = await User.deleteOne({
  //   _id: ObjectId(userId),
  // });

  // res.status(200).json({ message: `${result.deletedCount} user deleted` });
}
