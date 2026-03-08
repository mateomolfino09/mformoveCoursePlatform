import mongoose from 'mongoose';

/**
 * Registro de recordatorios Zoom programados en Mandrill (send_at).
 * Permite cancelar la programación al editar el weekly logbook (quitar evento, cambiar fechas, etc.).
 */
const scheduledZoomReminderSchema = new mongoose.Schema(
  {
    logbookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WeeklyLogbook',
      required: true,
      index: true
    },
    mandrillScheduledId: {
      type: String,
      required: true,
      trim: true
    },
    email: { type: String, default: '' },
    weekNumber: { type: Number, default: null },
    contentIndex: { type: Number, default: null },
    minutesBefore: { type: Number, default: 60 }
  },
  { timestamps: true }
);

scheduledZoomReminderSchema.index({ logbookId: 1 });

const ScheduledZoomReminder =
  mongoose.models.ScheduledZoomReminder || mongoose.model('ScheduledZoomReminder', scheduledZoomReminderSchema);
export default ScheduledZoomReminder;
