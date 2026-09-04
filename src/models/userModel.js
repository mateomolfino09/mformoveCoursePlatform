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

const mentorshipSchema = new mongoose.Schema(
  {
    active: {
      type: Boolean,
      default: () => false,
    },
    planId: {
      type: String,
    },
    planName: {
      type: String,
    },
    planLevel: {
      type: String,
    },
    interval: {
      type: String,
      enum: ['mensual', 'trimestral', 'anual'],
    },
    provider: {
      type: String,
      enum: ['stripe', 'dlocalgo', 'mercadopago'],
    },
    subscriptionId: {
      type: String,
    },
    startDate: {
      type: Date,
    },
    lastPaymentDate: {
      type: Date,
    },
    status: {
      type: String,
      default: () => 'active',
    },
    amount: {
      type: Number,
    },
    moneda: {
      type: String,
    },
  },
  { _id: false },
);

const pendingMentorshipDlocalSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
    },
    planId: {
      type: String,
    },
    interval: {
      type: String,
    },
    createdAt: {
      type: Date,
      default: () => Date.now(),
    },
  },
  { _id: false },
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
    freeSubscription: freeSubscriptionSchema,
    memberShip: { token: String, productId: String },
    productToken: { token: String, productId: String },
    cursosAdquiridos: [{
      productoId: { type: mongoose.Types.ObjectId, ref: 'Product', required: true },
      fechaCompra: { type: Date, default: Date.now },
      metodoPago: { type: String, enum: ['stripe', 'dlocalgo', 'mercadopago', 'transferencia', 'gratis'] },
      transaccionId: { type: String },
      monto: { type: Number },
      moneda: { type: String, default: 'USD' },
      /** Onboarding post-compra: redirige a /pago/exito hasta completar bienvenida. */
      bienvenidaPendiente: { type: Boolean, default: false },
      /** Origen del acceso: compra única (default), suscripción, otorgado a mano, o beta. */
      source: {
        type: String,
        enum: ['compra_unica', 'suscripcion', 'manual', 'beta'],
        default: 'compra_unica',
      },
      /** Vigencia del acceso. Las de source='compra_unica'/'manual'/'beta' quedan 'active' para siempre. */
      status: {
        type: String,
        enum: ['active', 'expired', 'revoked'],
        default: 'active',
      },
      /** Solo aplica a source='suscripcion': fin del período pago vigente. null = no expira. */
      expiresAt: { type: Date, default: null },
      /** Solo aplica a source='suscripcion': permite ubicar la entrada desde los webhooks de Stripe. */
      stripeSubscriptionId: { type: String },
    }],
    mentorship: mentorshipSchema,
    pendingMentorshipDlocal: pendingMentorshipDlocalSchema,
  },
  { timestamps: true }
);

let Dataset = mongoose.models.User || mongoose.model('User', userSchema);
export default Dataset;
