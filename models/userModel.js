import mongoose from "mongoose";
import validator from "validator";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      validate: [validator.isEmail, "Porfavor escriba un Email válido"],
    },
    password: {
      type: String,
      required: true,
    },
    resetToken: { type: String },
    update: { type: String },
    validEmail: { type: String, default: "not" },
    emailToken: { type: String },
  },
  { timestamps: true }
);

let Dataset = mongoose.models.users || mongoose.model("users", userSchema);
export default Dataset;
