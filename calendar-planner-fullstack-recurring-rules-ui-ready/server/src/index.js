import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

import authRouter from './routes/auth.js';
import tasksRouter from './routes/tasks.js';
import recurringRouter from './routes/recurring.js';
import calendarRouter from './routes/calendar.js';

dotenv.config();

const app = express();

const PORT = process.env.PORT || 4000;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';
const COOKIE_NAME = process.env.COOKIE_NAME || 'token';

// --- Middleware ---
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());

// CORS para cookie httpOnly
app.use(cors({
  origin: FRONTEND_ORIGIN,
  credentials: true,
}));

// Rate limit básico
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
});
app.use(limiter);

// salud
app.get('/api/health', (_req, res) => res.json({ ok: true }));

// rutas
app.use('/api/auth', authRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/recurring', recurringRouter);
app.use('/api/calendar', calendarRouter);

// conexión DB y arranque
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/calendar_planner';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB conectado');
    app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('Error conectando Mongo:', err);
    process.exit(1);
  });

export default app;
