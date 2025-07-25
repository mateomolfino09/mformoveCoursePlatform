import mongoose from 'mongoose';
import validator from 'validator';

const adminUser = new mongoose.Schema({
  active: {
    type: Boolean,
    default: () => false
  },
  coursesAvailable: {
    type: Number,
    default: () => 3
  }
});

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
});

const subscriptionSchema = new mongoose.Schema(
  {
    id: {
      type: String,
    },
    planId: {
        type: String,

    },
    country: {
      type: String,
    },
    subscription_token: {
      type: String,
    },
    status: {
      type: String,
    },
    payment_method_code: {
      type: String,
    },
    client_id: {
      type: String,
    },
    created_at: {
      type: Date,
      immutable: true,
    },
    client_first_name: {
      type: String,
    },
    client_last_name: {
      type: String,

    },
    client_document_type: {
      type: String,

    },
    client_document: {
      type: String,

    },
    client_email: {
      type: String,

    },
    active: {
      type: Boolean,
      default: () => false
    },
    isCanceled: {
      type: Boolean,
      default: () => false
    },
    cancellation_reason: {
      type: String,
      default: () => ''
    }
  },
);

const freeSubscriptionSchema = new mongoose.Schema(
  {
    email: {
        type: String,

    },
    createdAt: {
      type: Date,
      immutable: true,
      default: () => Date.now()
    },
    active: {
      type: Boolean,
      default: () => true
    },
  },
);


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
});

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
    },
    country: {
      type: String,
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
    isMember: {
      type: Boolean,
      default: () => false
    },
    isVip: {
      type: Boolean,
      default: () => false
    },
    notifications: [notification],
    admin: adminUser,
    token: { type: String },
    resetToken: { type: String },
    update: { type: String },
    validEmail: { type: String, default: 'not' },
    emailToken: { type: String },
    classesSeen: [{
      type: mongoose.Types.ObjectId,
      ref: 'IndividualClassUser'
    }],
    subscription: subscriptionSchema,
    freeSubscription: freeSubscriptionSchema,
    memberShip: { token: String, productId: String },
    productToken: { token: String, productId: String },
  },
  { timestamps: true }
);

let Dataset = mongoose.models.User || mongoose.model('User', userSchema);
export default Dataset;
