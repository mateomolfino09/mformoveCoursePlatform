import { ObjectId } from "mongodb";
import connectDB from "../../../../config/connectDB";
import User from "../../../../models/userModel";

connectDB();
export default async function handler(req, res) {
  const userId = req.query.updateUser;
  const { firstname, lastname, email, gender, country, rol, courses } =
    req.body;
  console.log(courses);
  const fullName = firstname + " " + lastname;
  try {
    if (req.method === "PATCH") {
      await User.findByIdAndUpdate(userId, {
        name: fullName,
        email: email,
        gender: gender,
        country: country,
        rol: rol,
        courses: courses,
      });
    }
    console.log("funciona");
    res.status(200).json({ message: "Product updated" });
  } catch (error) {
    return res.status(404).json({ error });
  }
}
