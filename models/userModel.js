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
    rol: { 
      type: String,
      required: true,
      default: 'User'
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
