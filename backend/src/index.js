import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import logsRouter from './routes/logs.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: [
    'chrome-extension://*',
    'http://localhost:5173',
    process.env.ALLOWED_ORIGIN,
  ].filter(Boolean),
  credentials: true,
}));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'medidrip-api', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/logs', logsRouter);

// Error handler
app.use((err, req, res, next) => {
  console.error('[MediDrip API Error]', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

app.listen(PORT, () => {
  console.log(`🩺 MediDrip API running on http://localhost:${PORT}`);
});
