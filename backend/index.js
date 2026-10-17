const express = require('express');
const cors = require('cors');
const session = require('express-session');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
require('dotenv').config({ path: path.join(__dirname, '../.env') });
require('dotenv').config();
const db = require('./config/db');
require('./config/passport');

const passport = require('passport');
const app = express();

// Trust proxy for Render reverse proxy & HTTPS cookie/session handling
app.set('trust proxy', 1);

// Middleware
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',')
  .map(url => url.trim().replace(/\/$/, ''))
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      const cleanOrigin = origin.replace(/\/$/, '');
      if (
        allowedOrigins.includes(cleanOrigin) ||
        cleanOrigin.endsWith('.onrender.com') ||
        cleanOrigin.endsWith('.run.app') ||
        cleanOrigin.includes('localhost') ||
        cleanOrigin.includes('127.0.0.1')
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.JWT_SECRET || 'dev-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Top-level Health check for Render service monitoring
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'kaizen-backend',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Kaizen Backend API', status: 'online' });
});

// Routes
app.use('/api', require('./routes/index'));

// Daily sync (e.g. 2 AM) - GitHub commits
const cron = require('node-cron');
const { runIngestion } = require('./services/ingestion');
const config = require('./config/env');
cron.schedule('0 2 * * *', () => {
  const repo = config.GITHUB_DEFAULT_REPO;
  if (repo) {
    runIngestion(repo).catch((err) => console.error('Scheduled ingestion failed:', err));
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Catch unhandled errors and rejections so the server does not crash unexpectedly
process.on('uncaughtException', (err) => {
  console.error('⚠️ Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('⚠️ Unhandled Rejection at:', promise, 'reason:', reason);
});

const PORT = process.env.PORT || 8000;

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`⚠️ Port ${PORT} is already in use. Please terminate the process using port ${PORT} or configure a different PORT.`);
  } else {
    console.error('⚠️ Server listener error:', err);
  }
});

// Clean socket release on nodemon restart (SIGUSR2) and termination
const handleGracefulShutdown = (signal) => {
  console.log(`Received ${signal}, closing HTTP server cleanly...`);
  server.close(() => {
    console.log('HTTP server closed.');
    if (signal === 'SIGUSR2') {
      process.kill(process.pid, 'SIGUSR2');
    } else {
      process.exit(0);
    }
  });
};

process.once('SIGUSR2', () => handleGracefulShutdown('SIGUSR2'));
process.on('SIGINT', () => handleGracefulShutdown('SIGINT'));
process.on('SIGTERM', () => handleGracefulShutdown('SIGTERM'));
