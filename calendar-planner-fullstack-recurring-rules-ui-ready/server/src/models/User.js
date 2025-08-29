import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, index: true },
  passwordHash: { type: String },
  googleId: { type: String, index: true },
  googleRefreshToken: { type: String },
}, { timestamps: true });

export default mongoose.model('User', userSchema);
