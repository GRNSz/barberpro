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
  'http://localhost',
  'https://localhost:443',
  'https://localhost'
];

app.use(cors((req, callback) => {
  const origin = req.header('Origin');
  const corsOptions = { credentials: true };

  if (!origin) {
    corsOptions.origin = true;
    callback(null, corsOptions);
    return;
  }

  // Check if origin is localhost (http or https) or matches allowedOrigins
  const isLocalhost = origin.startsWith('http://localhost') || 
                      origin.startsWith('https://localhost') || 
                      origin.startsWith('http://127.0.0.1') || 
                      origin.startsWith('https://127.0.0.1');

  // Check if origin is the same host (when running behind proxy)
  let originHost = '';
  try {
    originHost = new URL(origin).host;
  } catch (e) {}

  const hostHeader = req.headers.host;
  const xForwardedHost = req.headers['x-forwarded-host'];
  const isSameHost = originHost && (originHost === hostHeader || originHost === xForwardedHost);

  if (allowedOrigins.indexOf(origin) !== -1 || isLocalhost || isSameHost) {
    corsOptions.origin = true;
  } else {
    corsOptions.origin = false;
  }

  callback(null, corsOptions);
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
