import mongoose from 'mongoose'
import validator from 'validator'


const questionSchema = new mongoose.Schema(
  {
    id: {
        type: Number,
        required: true
      },
    question: {
      type: String,
    },
    answer: {
      type: String
    },
    hasAnswer: {
        type: Boolean,
        default: () => false
    },
    user:
        {
          type: mongoose.Types.ObjectId,
          ref: 'User'
        },
      
    answerAdmin:
        {
          type: mongoose.Types.ObjectId,
          ref: 'User'
        }
      
  },
  { timestamps: true }
)

let Dataset = mongoose.models.Question || mongoose.model('Question', questionSchema)
export default Dataset
