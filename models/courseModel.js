import mongoose from "mongoose";
import validator from "validator";

const courseSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      required: true
    },
    name: {
      type: String,
      required: true,
    },
    createdAt: {
        type: Date,
        immutable: true,
        default: () => Date.now()
    },
    playlist_code: {
      type: String,
      required: true,
    },
    image_url: {
        type: String,
        required: true,
    },
    likes: {
      type: Number,
      default: () => 12
    },
    users: [{
        type: mongoose.Types.ObjectId,
        ref: "Users"
    }]
  },
  { timestamps: true }
);

let Dataset = mongoose.models.courses || mongoose.model("courses", courseSchema);
export default Dataset;
