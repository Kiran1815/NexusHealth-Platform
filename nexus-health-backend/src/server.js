const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Socket.IO for real-time features
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.CORS_ORIGIN,
].filter(Boolean);

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || origin.startsWith('http://localhost:')) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Security middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());
app.use(morgan('combined'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// CORS
app.use(cors({
  origin: true,
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Make io available in routes
app.set('io', io);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/patients', require('./routes/patients'));
app.use('/api/doctors', require('./routes/doctors'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/emergency', require('./routes/emergency'));
app.use('/api/records', require('./routes/records'));
app.use('/api/pharmacy', require('./routes/pharmacy'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/geo', require('./routes/geo'));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    platform: 'NEXUS HEALTH',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Socket.IO real-time handlers
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

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════════════╗
  ║     NEXUS HEALTH BACKEND RUNNING      ║
  ║     Port: ${PORT}                        ║
  ║     Environment: ${process.env.NODE_ENV || 'development'}          ║
  ╚═══════════════════════════════════════╝
  `);
});

module.exports = { app, server, io };
