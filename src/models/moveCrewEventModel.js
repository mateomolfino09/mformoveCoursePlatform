import mongoose from 'mongoose';

/**
 * Evento Move Crew: clase en vivo (Zoom).
 * Incluye link a Zoom, título, descripción, fecha y hora.
 * Se puede usar como contenido de una semana en el camino.
 * Soporta eventos únicos (eventDate) o recurrentes semanales (repeatsWeekly + weekday).
 * Hora siempre en timezone Uruguay (America/Montevideo).
 */
const moveCrewEventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    zoomLink: {
      type: String,
      required: true,
      trim: true
    },
    /** Fecha del evento (solo fecha). Requerido si !repeatsWeekly; opcional si repeatsWeekly (fecha de referencia). */
    eventDate: {
      type: Date,
      default: null
    },
    /** Hora de inicio en formato "HH:mm" (24h), siempre en hora Uruguay */
    startTime: {
      type: String,
      required: true,
      trim: true
    },
    /** Duración en minutos (por defecto 60) */
    durationMinutes: {
      type: Number,
      default: 60,
      min: 1,
      max: 480
    },
    /** Si true, el evento se repite cada semana en el mismo día/hora */
    repeatsWeekly: {
      type: Boolean,
      default: false
    },
    /** Día de la semana para eventos recurrentes: 0 = Domingo, 1 = Lunes, ..., 2 = Martes */
    weekday: {
      type: Number,
      min: 0,
      max: 6,
      default: null
    },
    /** Zona horaria IANA (por defecto Uruguay) */
    timezone: {
      type: String,
      default: 'America/Montevideo',
      trim: true
    }
  },
  { timestamps: true }
);

moveCrewEventSchema.index({ eventDate: 1 });
moveCrewEventSchema.index({ repeatsWeekly: 1, weekday: 1 });

const MoveCrewEvent =
  mongoose.models.MoveCrewEvent || mongoose.model('MoveCrewEvent', moveCrewEventSchema);
export default MoveCrewEvent;
