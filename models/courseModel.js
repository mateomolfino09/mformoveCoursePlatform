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
    description: {
      type: String,
      required: true,
      minLength: 20,
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
    price: {
      type: Number,
      default: () => 10
    },
    currency: {
      type: String,
      default: () => '$'
    },
    users: [{
        type: mongoose.Types.ObjectId,
        ref: "User"
    }],
    classes: [{
      type: mongoose.Types.ObjectId,
      ref: "Class"
  }],
  created_by: {
      type: mongoose.Types.ObjectId,
      ref: 'User'
  }
  },
  { timestamps: true }
);

// courseSchema.pre('validate', function(next) {
//   this
// })

let Dataset = mongoose.models.Course || mongoose.model("Course", courseSchema);
export default Dataset;
