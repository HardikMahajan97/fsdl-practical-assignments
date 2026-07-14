require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

const connectDB = require('./config/db');
const logger = require('./utils/logger');
const { errorHandler } = require('./middleware/errorHandler');

// ── Routes ──
const authRoutes = require('./routes/auth');
const reportRoutes = require('./routes/reports');

const app = express();

// ── Security middleware ──
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));

// ── Rate limiting ──
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: { success: false, message: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Stricter limit for auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many login attempts' },
});
app.use('/api/auth/login', authLimiter);

// ── Body parsing ──
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── HTTP logging via Morgan → Winston ──
app.use(
  morgan('combined', {
    stream: { write: (msg) => logger.http(msg.trim()) },
    skip: (req) => req.url === '/api/health',
  })
);

// ── Static files (generated PDFs) ──
app.use(
  '/api/letters',
  require('./middleware/auth').authenticate,
  express.static(path.join(__dirname, 'uploads/letters'))
);

// ── API Routes ──
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);

// ── Health check ──
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// ── 404 ──
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.path} not found` });
});

// ── Global error handler ──
app.use(errorHandler);

// ── Start server ──
const PORT = process.env.PORT || 5000;

async function start() {
  await connectDB();

  // Initialize Bull queue (connects to Redis)
  try {
    const { getQueue } = require('./queues/letterQueue');
    getQueue();
    logger.info('Queue system ready');
  } catch (err) {
    logger.warn('Queue system not available (Redis may not be running)', {
      error: err.message,
    });
  }

  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`, {
      env: process.env.NODE_ENV,
      port: PORT,
    });
  });
}

start().catch((err) => {
  logger.error('Server startup failed', { error: err.message });
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled promise rejection', { reason: String(reason) });
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught exception', { error: err.message, stack: err.stack });
  process.exit(1);
});

module.exports = app;
