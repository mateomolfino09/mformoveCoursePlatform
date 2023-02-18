import mongoose from "mongoose";
import validator from "validator";

const classSchema = new mongoose.Schema(
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
    class_code: {
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
    totalTime: {
      type: Number,
      default: () => 0
    },
    course: {
        type: mongoose.Types.ObjectId,
        ref: "Course"
    }
  },
  { timestamps: true }
);

let Dataset = mongoose.models.Class || mongoose.model("Class", classSchema);
export default Dataset;
