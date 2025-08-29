import mongoose from 'mongoose';

const recurringSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  text: { type: String, required: true },
  weekday: { type: Number, required: true }, // 0=Domingo ... 6=Sábado (usar Date.getDay())
  startDate: { type: String, required: true }, // 'YYYY-MM-DD'
  endDate: { type: String, default: null },    // opcional
}, { timestamps: true });

export default mongoose.model('Recurring', recurringSchema);
