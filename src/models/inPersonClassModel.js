import mongoose from 'mongoose';

const scheduleSchema = new mongoose.Schema({
  dayOfWeek: {
    type: String,
    required: true,
    enum: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
  },
  startTime: {
    type: String,
    required: true,
    // Formato: "HH:mm" (ej: "09:00", "18:30")
  },
  endTime: {
    type: String,
    required: true,
    // Formato: "HH:mm" (ej: "10:00", "19:30")
  },
  timezone: {
    type: String,
    default: 'America/Montevideo'
  }
});

const additionalPriceSchema = new mongoose.Schema({
  label: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'UYU',
    enum: ['UYU', 'USD', 'ARS']
  }
}, { _id: false });

const inPersonClassSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      required: true,
      unique: true
    },
    name: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    instructor: {
      type: String,
      required: true
    },
    location: {
      name: {
        type: String,
        required: true
      },
      address: {
        type: String,
        required: true
      },
      city: {
        type: String,
        required: true
      },
      country: {
        type: String,
        default: 'Uruguay'
      },
      coordinates: {
        lat: {
          type: String
        },
        lon: {
          type: String
        }
      }
    },
    schedules: [scheduleSchema],
    duration: {
      type: Number,
      required: true,
      // Duración en minutos
    },
    capacity: {
      type: Number,
      default: null
    },
    currentEnrollments: {
      type: Number,
      default: 0
    },
    level: {
      type: String,
      required: true,
      enum: ['Principiante', 'Intermedio', 'Avanzado', 'Todos los niveles']
    },
    classType: {
      type: String,
      required: true,
      enum: ['personalizado', 'comun'],
      default: 'comun'
    },
    price: {
      amount: {
        type: Number,
        default: 0
      },
      currency: {
        type: String,
        default: 'UYU'
      },
      type: {
        type: String,
        enum: ['clase_suelta', 'mensual', 'trimestral', 'anual'],
        default: 'clase_suelta'
      }
    },
    frequencyPrices: {
      oncePerWeek: {
        amount: {
          type: Number,
          default: 0
        },
        currency: {
          type: String,
          default: 'UYU',
          enum: ['UYU', 'USD', 'ARS']
        }
      },
      twicePerWeek: {
        amount: {
          type: Number,
          default: 0
        },
        currency: {
          type: String,
          default: 'UYU',
          enum: ['UYU', 'USD', 'ARS']
        }
      },
      threeTimesPerWeek: {
        amount: {
          type: Number,
          default: 0
        },
        currency: {
          type: String,
          default: 'UYU',
          enum: ['UYU', 'USD', 'ARS']
        }
      }
    },
    additionalPrices: [additionalPriceSchema],
    image_url: {
      type: String,
      required: true
    },
    active: {
      type: Boolean,
      default: true
    },
    createdAt: {
      type: Date,
      immutable: true,
      default: () => Date.now()
    },
    updatedAt: {
      type: Date,
      default: () => Date.now()
    }
  },
  { timestamps: true }
);

// Índice para búsquedas eficientes
inPersonClassSchema.index({ active: 1, 'schedules.dayOfWeek': 1 });

let Dataset = mongoose.models.InPersonClass || mongoose.model('InPersonClass', inPersonClassSchema);
export default Dataset;

