import mongoose from "mongoose";
import validator from "validator";

const courseUser = new mongoose.Schema({
  course: {
    type: mongoose.Types.ObjectId,
    ref: "Course"
  },
  like: {
    type: Boolean,
    default: () => false
  },
  inList: {
    type: Boolean,
    default: () => false
  },
  actualChapter: {
    type: Number,
    default: () => 1
  },
  purchased: {
    type: Boolean,
    default: () => false
  }
  
})

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      minLength: 10,
    },
    rol: { 
      type: String,
      required: true,
      default: 'User'
    },
    password: {
      type: String,
      required: true,
    },
    courses: [courseUser],
    resetToken: { type: String },
    update: { type: String },
    validEmail: { type: String, default: "not" },
    emailToken: { type: String },
  },
  { timestamps: true }
);

userSchema.query.byCourse = function (courseId) {
  return this.where({ courses: { $elemMatch : {$eq : courseId}} })
}

let Dataset = mongoose.models.User || mongoose.model("User", userSchema);
export default Dataset;
