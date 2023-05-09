import mongoose from 'mongoose'
import validator from 'validator'

const adminUser = new mongoose.Schema({
  active: {
    type: Boolean,
    default: () => false
  },
  coursesAvailable: {
    type: Number,
    default: () => 3
  }
})

const classUser = new mongoose.Schema({
  id: {
    type: Number
  },
  class: {
    type: mongoose.Types.ObjectId,
    ref: 'Class'
  },
  like: {
    type: Boolean,
    default: () => false
  },
  actualTime: {
    type: Number,
    default: () => 0
  }
})

const notification = new mongoose.Schema({
  title: {
    type: String,
    default: () => ''
  },
  message: {
    type: String,
    default: () => ''
  },
  link: {
    type: String
  },
  status: {
    type: String,
    default: () => 'green'
  },
  read: {
    type: Boolean,
    default: () => false
  }
})

const courseUser = new mongoose.Schema({
  course: {
    type: mongoose.Types.ObjectId,
    ref: 'Course'
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
  classes: [classUser],
  purchased: {
    type: Boolean,
    default: () => false
  }
})

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      minLength: 10
    },
    gender: {
      type: String,
      required: true
    },
    country: {
      type: String,
      required: true
    },
    rol: {
      type: String,
      required: true,
      default: 'User'
    },
    password: {
      type: String,
      required: true
    },
    courses: [courseUser],
    notifications: [notification],
    admin: adminUser,
    resetToken: { type: String },
    update: { type: String },
    validEmail: { type: String, default: 'not' },
    emailToken: { type: String }
  },
  { timestamps: true }
)

userSchema.query.byCourse = function (courseId) {
  return this.where({ courses: { $elemMatch: { $eq: courseId } } })
}

let Dataset = mongoose.models.User || mongoose.model('User', userSchema)
export default Dataset
