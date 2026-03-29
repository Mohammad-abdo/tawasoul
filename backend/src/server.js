import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { configureSwagger } from '../swagger/swagger.config.js';

// Load environment variables
dotenv.config();

// Import routes
import userRoutes from './routes/user.routes.js';
import doctorRoutes from './routes/doctor.routes.js';
import adminRoutes from './routes/admin.routes.js';
import publicRoutes from './routes/public.routes.js';

// Import middleware
import { errorHandler } from './middleware/errorHandler.middleware.js';
import { notFoundHandler } from './middleware/notFound.middleware.js';
import { rateLimiter } from './middleware/rateLimiter.middleware.js';

// Import logger
import { logger } from './utils/logger.js';
import { getOpenApiSpec } from './config/swagger.js';

const app = express();
const httpServer = createServer(app);
const corsOriginsForSocket = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
  : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'];

const io = new Server(httpServer, {
  cors: {
    origin: corsOriginsForSocket,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

configureSwagger(app);
const PORT = process.env.PORT || 3000;

// ============================================
// Middleware
// ============================================

// Security
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// CORS configuration
const corsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
  : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) return callback(null, true);

    if (corsOrigins.indexOf(origin) !== -1 || origin.includes('localhost')) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all for development
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// Logging
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    stream: {
      write: (message) => logger.info(message.trim())
    }
  }));
}

// Rate limiting
app.use('/api/', rateLimiter);

// Get __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Serve static files (uploads)
app.use('/uploads', express.static(join(__dirname, '../uploads')));

// ============================================
// Routes
// ============================================

// Health check
app.get('/health', (req, res) => {
  logger.info(`Health check from: ${req.ip}`);
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    ip: req.ip,
    host: req.get('host')
  });
});

// Connection test endpoint for clients
app.get('/api/test-connection', (req, res) => {
  logger.info(`Connection test from: ${req.ip}, Origin: ${req.get('origin') || 'No origin'}`);
  res.json({
    success: true,
    message: 'Backend is reachable!',
    timestamp: new Date().toISOString(),
    serverHost: req.get('host') || 'unknown',
    clientIP: req.ip
  });
});

// API Routes
app.use('/api/public', publicRoutes); // Public routes (no authentication)
app.use('/api/user', userRoutes);
app.use('/api/doctor', doctorRoutes);
app.use('/api/admin', adminRoutes);

// ============================================
// Socket.IO for real-time notifications
// ============================================

io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);

  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });

  // Join user room
  socket.on('join-user-room', (userId) => {
    socket.join(`user-${userId}`);
  });

  // Join doctor room
  socket.on('join-doctor-room', (doctorId) => {
    socket.join(`doctor-${doctorId}`);
  });

  // Join admin room
  socket.on('join-admin-room', () => {
    socket.join('admin-room');
  });
});

// Export io for use in other files
export { io };

// ============================================
// Error Handling
// ============================================

app.use(notFoundHandler);
app.use(errorHandler);

// ============================================
// Start Server
// ============================================

httpServer.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info('API Docs: /api/docs');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  httpServer.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

export default app;
