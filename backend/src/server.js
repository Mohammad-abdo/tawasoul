import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { networkInterfaces } from 'os';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

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

const app = express();
const httpServer = createServer(app);
const corsOriginsForSocket = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
  : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'];

const io = new Server(httpServer, {
  cors: {
    origin: corsOriginsForSocket,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

const PORT = process.env.PORT || 3000;

// ============================================
// Middleware
// ============================================

// Security
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration
const corsOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
  : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://10.0.2.2:3000', 'http://localhost:3000'];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) return callback(null, true);
    
    if (corsOrigins.indexOf(origin) !== -1 || origin.includes('localhost') || origin.includes('10.0.2.2')) {
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

// Get local IP address for network access (needed for routes)
const getLocalIP = () => {
  const interfaces = networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] || []) {
      // Skip internal (loopback) and non-IPv4 addresses
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
};

const localIP = getLocalIP();

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

// Connection test endpoint for mobile
app.get('/api/test-connection', (req, res) => {
  logger.info(`Connection test from: ${req.ip}, Origin: ${req.get('origin') || 'No origin'}`);
  res.json({
    success: true,
    message: 'Backend is reachable!',
    timestamp: new Date().toISOString(),
    serverIP: localIP || 'unknown',
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

const HOST = process.env.HOST || '0.0.0.0'; // Listen on all interfaces (accessible from network)

httpServer.listen(PORT, HOST, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`🔗 Local API: http://localhost:${PORT}/api`);
  logger.info(`🌐 Network API: http://${localIP}:${PORT}/api`);
  logger.info(`📱 Mobile App IP: ${localIP} (Update app_config.dart with this IP)`);
  logger.info(`✅ Server accessible from local network!`);
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

