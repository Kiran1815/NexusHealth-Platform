const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// ── Socket.IO (real-time features) ──────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.CORS_ORIGIN,
].filter(Boolean);

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      // Allow all origins (open CORS); restrict as needed in production
      callback(null, true);
    },
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// ── Core Middleware ──────────────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());
app.use(morgan('combined'));

// Rate limiting for API only
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Make io available inside route handlers
app.set('io', io);

// ── API Routes (registered BEFORE the frontend fallback) ────────────────────
app.use('/api/auth',         require('./routes/auth'));
app.use('/api/patients',     require('./routes/patients'));
app.use('/api/doctors',      require('./routes/doctors'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/ai',           require('./routes/ai'));
app.use('/api/emergency',    require('./routes/emergency'));
app.use('/api/records',      require('./routes/records'));
app.use('/api/pharmacy',     require('./routes/pharmacy'));
app.use('/api/analytics',    require('./routes/analytics'));
app.use('/api/geo',          require('./routes/geo'));

// Health-check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    platform: 'NEXUS HEALTH',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Unknown /api/* → JSON 404 (never serve the React page for bad API calls)
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: `API route not found: ${req.originalUrl}` });
});

// ── Serve React Frontend (production build) ──────────────────────────────────
// server.js is at  nexus-health-backend/src/server.js
// frontend dist is at nexus-health-frontend/dist  (sibling of nexus-health-backend)
const frontendDist = path.join(__dirname, '..', '..', 'nexus-health-frontend', 'dist');

app.use(express.static(frontendDist));

// React Router SPA fallback — any non-API GET returns index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendDist, 'index.html'));
});

// ── Socket.IO Event Handlers ─────────────────────────────────────────────────
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join-emergency-room', (data) => {
    socket.join(`emergency-${data.userId}`);
  });

  socket.on('sos-activated', async (data) => {
    io.emit('emergency-alert', {
      userId: data.userId,
      location: data.location,
      criticalData: data.criticalData,
      timestamp: new Date(),
    });
  });

  socket.on('doctor-availability-update', (data) => {
    io.emit('availability-changed', data);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// ── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ── Start Server (bind 0.0.0.0 for Render / cloud hosts) ────────────────────
const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';

server.listen(PORT, HOST, () => {
  console.log(`
  ╔═══════════════════════════════════════╗
  ║     NEXUS HEALTH BACKEND RUNNING      ║
  ║     Port: ${PORT}                        ║
  ║     Host: ${HOST}                   ║
  ║     Environment: ${process.env.NODE_ENV || 'development'}          ║
  ╚═══════════════════════════════════════╝
  `);
});

module.exports = { app, server, io };
