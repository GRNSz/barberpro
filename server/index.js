import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';

// Import Routers
import authRouter from './routes/auth.js';
import appointmentsRouter from './routes/appointments.js';
import healthRouter from './routes/health.js';
import biRouter from './routes/bi.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Configure CORS (Supporting Cookie credentials)
const allowedOrigins = [
  process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  'http://localhost:80',
  'http://localhost'
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// Route Registrations
app.use('/api/auth', authRouter);
app.use('/api/appointments', appointmentsRouter);
app.use('/api/health', healthRouter);
app.use('/api/bi', biRouter);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err.stack);
  res.status(500).json({ error: 'Erro interno do servidor backend' });
});

// Start listening
app.listen(PORT, () => {
  console.log(`🚀 BarberPro Backend listening on port ${PORT}`);
});
