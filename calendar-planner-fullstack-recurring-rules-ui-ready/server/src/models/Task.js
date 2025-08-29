import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  date: { type: String, required: true, index: true }, // 'YYYY-MM-DD'
  text: { type: String, required: true },
  done: { type: Boolean, default: false },
  fromRecurring: { type: mongoose.Schema.Types.ObjectId, ref: 'Recurring', default: null, index: true },
}, { timestamps: true });

export default mongoose.model('Task', taskSchema);
